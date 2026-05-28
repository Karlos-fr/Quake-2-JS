import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

type Finding = {
  file: string;
  line: number;
  name: string;
  kind: string;
  exported: boolean;
  references: number;
  externalReferences: number;
};

type DeclarationRecord = {
  fileName: string;
  line: number;
  name: string;
  kind: string;
  exported: boolean;
  references: number;
  externalReferences: number;
};

type FileFinding = {
  file: string;
  reason: string;
};

const repoRoot = process.cwd();
const canonicalRepoRoot = canonical(repoRoot);
const retainedFiles = new Map<string, string>([
  [
    "packages/server/src/sv_null.ts",
    "Strict owner for Quake-2-master/server/sv_null.c; intentionally retained even when the full-server host uses host.ts adapters."
  ]
]);
const args = new Set(process.argv.slice(2));
const includeScripts = args.has("--include-scripts");
const strict = args.has("--strict");
const jsonIndex = process.argv.indexOf("--json");
const jsonPath = jsonIndex >= 0 ? process.argv[jsonIndex + 1] : null;

function normalize(fileName: string): string {
  return path.relative(repoRoot, path.resolve(fileName)).replace(/\\/g, "/");
}

function canonical(fileName: string): string {
  return path.resolve(fileName).replace(/\\/g, "/").toLowerCase();
}

function isPackageSource(fileName: string): boolean {
  const relative = normalize(fileName);
  return relative.startsWith("packages/") && relative.endsWith(".ts") && !relative.endsWith(".d.ts");
}

function walkTsFiles(root: string): string[] {
  if (!fs.existsSync(root)) {
    return [];
  }

  const files: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") {
        continue;
      }
      files.push(...walkTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

function loadConfig(): { fileNames: string[]; options: ts.CompilerOptions } {
  const configPath = ts.findConfigFile(repoRoot, ts.sys.fileExists, "tsconfig.json");
  if (!configPath) {
    throw new Error("tsconfig.json not found");
  }

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
  }

  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
  const fileNames = includeScripts
    ? [...new Set([...parsed.fileNames, ...walkTsFiles(path.join(repoRoot, "scripts"))])]
    : parsed.fileNames;

  return { fileNames, options: parsed.options };
}

function hasExportModifier(node: ts.Node): boolean {
  return ts.canHaveModifiers(node) && !!ts.getModifiers(node)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

function isTopLevelDeclaration(node: ts.Node): boolean {
  return node.parent?.kind === ts.SyntaxKind.SourceFile;
}

function declarationKind(node: ts.Node): string {
  if (ts.isFunctionDeclaration(node)) return "function";
  if (ts.isClassDeclaration(node)) return "class";
  if (ts.isInterfaceDeclaration(node)) return "interface";
  if (ts.isTypeAliasDeclaration(node)) return "type";
  if (ts.isEnumDeclaration(node)) return "enum";
  if (ts.isVariableDeclaration(node)) return "value";
  return ts.SyntaxKind[node.kind] ?? "declaration";
}

function collectDeclarations(sourceFile: ts.SourceFile): Array<{ node: ts.Node; name: ts.Identifier; exported: boolean }> {
  const declarations: Array<{ node: ts.Node; name: ts.Identifier; exported: boolean }> = [];

  for (const statement of sourceFile.statements) {
    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isEnumDeclaration(statement)) &&
      statement.name
    ) {
      declarations.push({ node: statement, name: statement.name, exported: hasExportModifier(statement) });
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      const exported = hasExportModifier(statement);
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          declarations.push({ node: declaration, name: declaration.name, exported });
        }
      }
    }
  }

  return declarations.filter(item => isTopLevelDeclaration(item.node) || ts.isVariableDeclaration(item.node));
}

function collectInboundStaticImports(program: ts.Program): Map<string, Set<string>> {
  const inbound = new Map<string, Set<string>>();
  const options = program.getCompilerOptions();

  for (const sourceFile of program.getSourceFiles()) {
    if (!canonical(sourceFile.fileName).startsWith(canonicalRepoRoot)) {
      continue;
    }

    for (const statement of sourceFile.statements) {
      if (
        (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        const resolved = ts.resolveModuleName(
          statement.moduleSpecifier.text,
          sourceFile.fileName,
          options,
          ts.sys
        ).resolvedModule;

        if (!resolved) {
          continue;
        }

        const target = canonical(resolved.resolvedFileName);
        if (!inbound.has(target)) {
          inbound.set(target, new Set());
        }
        inbound.get(target)?.add(canonical(sourceFile.fileName));
      }
    }
  }

  return inbound;
}

function isPackageEntrypoint(fileName: string): boolean {
  return /\/packages\/[^/]+\/src\/index\.ts$/.test(`/${normalize(fileName)}`);
}

function isDeclarationName(node: ts.Identifier): boolean {
  const parent = node.parent;
  return (
    (ts.isFunctionDeclaration(parent) && parent.name === node) ||
    (ts.isClassDeclaration(parent) && parent.name === node) ||
    (ts.isInterfaceDeclaration(parent) && parent.name === node) ||
    (ts.isTypeAliasDeclaration(parent) && parent.name === node) ||
    (ts.isEnumDeclaration(parent) && parent.name === node) ||
    (ts.isVariableDeclaration(parent) && parent.name === node)
  );
}

function resolveAlias(checker: ts.TypeChecker, symbol: ts.Symbol | undefined): ts.Symbol | undefined {
  if (!symbol) {
    return undefined;
  }

  if ((symbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      return checker.getAliasedSymbol(symbol);
    } catch {
      return symbol;
    }
  }

  return symbol;
}

function main(): void {
  const { fileNames, options } = loadConfig();
  const program = ts.createProgram(fileNames, options);
  const checker = program.getTypeChecker();

  const inbound = collectInboundStaticImports(program);
  const unusedFiles: FileFinding[] = [];
  const declarationBySymbol = new Map<ts.Symbol, DeclarationRecord>();

  for (const sourceFile of program.getSourceFiles()) {
    if (!isPackageSource(sourceFile.fileName)) {
      continue;
    }

    const sourcePath = canonical(sourceFile.fileName);
    if (!isPackageEntrypoint(sourcePath) && !inbound.has(sourcePath)) {
      unusedFiles.push({
        file: normalize(sourcePath),
        reason: "No static import or re-export from the analyzed TypeScript graph"
      });
    }

    for (const declaration of collectDeclarations(sourceFile)) {
      const symbol = resolveAlias(checker, checker.getSymbolAtLocation(declaration.name));
      if (!symbol) {
        continue;
      }

      const position = sourceFile.getLineAndCharacterOfPosition(declaration.name.getStart());
      declarationBySymbol.set(symbol, {
        fileName: canonical(sourceFile.fileName),
        line: position.line + 1,
        name: declaration.name.text,
        kind: declarationKind(declaration.node),
        exported: declaration.exported,
        references: 0,
        externalReferences: 0
      });
    }
  }

  for (const sourceFile of program.getSourceFiles()) {
    const moduleSymbol = sourceFile.symbol ?? checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) {
      continue;
    }

    for (const exportedSymbol of checker.getExportsOfModule(moduleSymbol)) {
      const target = resolveAlias(checker, exportedSymbol);
      const declaration = target ? declarationBySymbol.get(target) : undefined;
      if (declaration) {
        declarationBySymbol.set(exportedSymbol, declaration);
      }
    }
  }

  for (const sourceFile of program.getSourceFiles()) {
    if (!canonical(sourceFile.fileName).startsWith(canonicalRepoRoot)) {
      continue;
    }

    const visit = (node: ts.Node): void => {
      if (ts.isIdentifier(node) && !isDeclarationName(node)) {
        const symbol = resolveAlias(checker, checker.getSymbolAtLocation(node));
        const declaration = symbol ? declarationBySymbol.get(symbol) : undefined;
        if (declaration) {
          declaration.references += 1;
          if (canonical(sourceFile.fileName) !== declaration.fileName) {
            declaration.externalReferences += 1;
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  const allDeclarations: Finding[] = [...declarationBySymbol.values()].map(item => ({
    file: normalize(item.fileName),
    line: item.line,
    name: item.name,
    kind: item.kind,
    exported: item.exported,
    references: item.references,
    externalReferences: item.externalReferences
  }));
  const unusedTopLevel = allDeclarations.filter(item => item.references === 0);
  const exportedWithoutExternalReferences = allDeclarations.filter(item => item.exported && item.externalReferences === 0);

  const reportedUnusedTopLevel = strict ? unusedTopLevel.filter(item => !item.exported) : unusedTopLevel;
  const reportedExportedWithoutExternalReferences = strict ? [] : exportedWithoutExternalReferences;

  const retainedUnusedFiles = unusedFiles
    .filter(item => retainedFiles.has(item.file))
    .map(item => ({ ...item, retainedReason: retainedFiles.get(item.file) ?? "" }));
  const reportedUnusedFiles = unusedFiles.filter(item => !retainedFiles.has(item.file));

  const result = {
    scope: includeScripts ? "tsconfig + scripts/**/*.ts" : "tsconfig apps/**/*.ts + packages/**/*.ts",
    mode: strict ? "strict" : "full",
    notes: [
      "Findings are candidates. Dynamic imports, string-based registries and external package consumers can require manual review.",
      "Package src/index.ts files are treated as entrypoints for file-level analysis.",
      "Strict mode keeps file-level candidates and non-exported top-level declarations with no references."
    ],
    counts: {
      unusedFiles: reportedUnusedFiles.length,
      retainedUnusedFiles: retainedUnusedFiles.length,
      unusedTopLevel: reportedUnusedTopLevel.length,
      exportedWithoutExternalReferences: reportedExportedWithoutExternalReferences.length
    },
    unusedFiles: reportedUnusedFiles,
    retainedUnusedFiles,
    unusedTopLevel: reportedUnusedTopLevel,
    exportedWithoutExternalReferences: reportedExportedWithoutExternalReferences
  };

  if (jsonPath) {
    fs.mkdirSync(path.dirname(path.resolve(jsonPath)), { recursive: true });
    fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  }

  console.log(`Dead-code candidates in packages/ (${result.scope})`);
  console.log(`Mode: ${result.mode}`);
  console.log(`- files with no inbound static import: ${reportedUnusedFiles.length}`);
  console.log(`- retained unimported owner files: ${retainedUnusedFiles.length}`);
  console.log(`- top-level declarations with no references: ${result.unusedTopLevel.length}`);
  console.log(`- exported declarations with no external references: ${result.exportedWithoutExternalReferences.length}`);
  if (jsonPath) {
    console.log(`JSON report: ${normalize(jsonPath)}`);
  }

  const preview = <T>(title: string, items: T[], format: (item: T) => string): void => {
    console.log(`\n${title}`);
    for (const item of items.slice(0, 30)) {
      console.log(`- ${format(item)}`);
    }
    if (items.length > 30) {
      console.log(`... ${items.length - 30} more`);
    }
  };

  preview("Unused files", reportedUnusedFiles, item => item.file);
  preview("Retained unimported owner files", retainedUnusedFiles, item => `${item.file} (${item.retainedReason})`);
  preview(
    "Unused top-level declarations",
    result.unusedTopLevel,
    item => `${item.file}:${item.line} ${item.exported ? "export " : ""}${item.kind} ${item.name}`
  );
  preview(
    "Exports without external references",
    result.exportedWithoutExternalReferences,
    item => `${item.file}:${item.line} ${item.kind} ${item.name} (${item.references} total refs)`
  );
}

main();
