import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VALIDATION_ROOT = path.join(ROOT, "audit-portage/validation-incrementale/validation");
const SOURCE_MATRICES_DIR = path.join(VALIDATION_ROOT, "matrices");
const TS_MATRICES_DIR = path.join(VALIDATION_ROOT, "ts-matrices");
const TS_PROGRESS_DIR = path.join(VALIDATION_ROOT, "ts-progress");
const TS_INDEX = path.join(VALIDATION_ROOT, "INDEX_TS.md");
const TS_GLOBAL = path.join(VALIDATION_ROOT, "AVANCEMENT_GLOBAL_TS.md");

type SourceMatrixEntry = {
  sourceFile: string;
  sourceKind: string;
  sourceSymbol: string;
  targetFile: string;
  targetSymbol: string;
  validation: string;
  matrixFile: string;
};

type TsSymbol = {
  tsFile: string;
  kind: string;
  name: string;
  exported: boolean;
  originalName: string;
  source: string;
  category: string;
};

type CrossStatus =
  | "Couvert C/H"
  | "Doublon potentiel"
  | "Ownership suspect"
  | "Source inconnue"
  | "Entete incomplet"
  | "TS sans lien source"
  | "A auditer";

type MatrixRow = {
  symbol: TsSymbol;
  status: CrossStatus;
  sourceEntry?: SourceMatrixEntry;
  duplicateCount: number;
  notes: string;
};

type PreservedCells = {
  validation: string;
  notes: string;
};

type GlobalCounts = {
  total: number;
  covered: number;
  audit: number;
  duplicates: number;
  ownership: number;
  incomplete: number;
};

function md(value: unknown): string {
  return String(value ?? "").replace(/\r?\n/g, "<br>").replace(/\|/g, "\\|");
}

function code(value: string): string {
  return value ? `\`${md(value)}\`` : "";
}

function stripCode(value: string): string {
  return value.trim().replace(/^`/, "").replace(/`$/, "");
}

function splitTableLine(line: string): string[] {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

function sanitizeFileName(filePath: string): string {
  return filePath.replace(/[\\/]/g, "_") + ".md";
}

function walk(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) {
    return files;
  }

  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (!["node_modules", "dist", "build", ".turbo"].includes(entry)) {
        walk(fullPath, files);
      }
    } else if (entry.endsWith(".ts") && !entry.endsWith(".d.ts")) {
      files.push(path.relative(ROOT, fullPath).replace(/\\/g, "/"));
    }
  }

  return files;
}

function readSourceMatrixEntries(): SourceMatrixEntry[] {
  const entries: SourceMatrixEntry[] = [];
  if (!existsSync(SOURCE_MATRICES_DIR)) {
    return entries;
  }

  for (const matrixFile of readdirSync(SOURCE_MATRICES_DIR)) {
    if (!matrixFile.endsWith(".md")) {
      continue;
    }

    const matrixPath = path.join(SOURCE_MATRICES_DIR, matrixFile);
    for (const line of readFileSync(matrixPath, "utf8").split(/\r?\n/)) {
      if (!line.startsWith("| `")) {
        continue;
      }

      const cells = splitTableLine(line);
      if (cells.length < 8) {
        continue;
      }

      entries.push({
        sourceFile: stripCode(cells[0]),
        sourceKind: cells[1],
        sourceSymbol: stripCode(cells[2]),
        targetFile: stripCode(cells[3]),
        targetSymbol: stripCode(cells[4]),
        validation: cells[5],
        matrixFile,
      });
    }
  }

  return entries;
}

function readPreservedCells(): Map<string, PreservedCells> {
  const preserved = new Map<string, PreservedCells>();
  if (!existsSync(TS_MATRICES_DIR)) {
    return preserved;
  }

  for (const matrixFile of readdirSync(TS_MATRICES_DIR)) {
    if (!matrixFile.endsWith(".md")) {
      continue;
    }

    for (const line of readFileSync(path.join(TS_MATRICES_DIR, matrixFile), "utf8").split(/\r?\n/)) {
      if (!line.startsWith("| `")) {
        continue;
      }

      const cells = splitTableLine(line);
      if (cells.length < 12) {
        continue;
      }

      const tsFile = stripCode(cells[0]);
      const symbol = stripCode(cells[2]);
      const validation = cells[10];
      if (!validation || validation === "A verifier") {
        continue;
      }

      preserved.set(`${tsFile}\0${symbol}`, {
        validation,
        notes: cells[11],
      });
    }
  }

  return preserved;
}

function findHeader(contentBeforeSymbol: string): { originalName: string; source: string; category: string } {
  const headers = Array.from(contentBeforeSymbol.matchAll(/\/\*\*([\s\S]*?)\*\//g));
  const header = headers.at(-1);
  if (!header?.[1] || contentBeforeSymbol.slice((header.index ?? 0) + header[0].length).trim() !== "") {
    return { originalName: "", source: "", category: "" };
  }

  const body = header[1];
  return {
    originalName: /Original name:\s*([^\r\n]+)/.exec(body)?.[1]?.trim() ?? "",
    source: /Source:\s*([^\r\n]+)/.exec(body)?.[1]?.trim() ?? "",
    category: /Category:\s*([^\r\n]+)/.exec(body)?.[1]?.trim() ?? "",
  };
}

function updateBraceDepth(line: string, current: number): number {
  const withoutStrings = line
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, "''")
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '""')
    .replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, "``");
  const opens = (withoutStrings.match(/{/g) ?? []).length;
  const closes = (withoutStrings.match(/}/g) ?? []).length;
  return Math.max(0, current + opens - closes);
}

function parseTsSymbols(tsFile: string): TsSymbol[] {
  const fullPath = path.join(ROOT, tsFile);
  const content = readFileSync(fullPath, "utf8");
  const lines = content.split(/\r?\n/);
  const symbols: TsSymbol[] = [];
  let braceDepth = 0;
  let offset = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    const declaration = /^(export\s+)?(?:(async)\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/.exec(trimmed)
      ?? /^(export\s+)?class\s+([A-Za-z_$][\w$]*)\b/.exec(trimmed)
      ?? /^(export\s+)?interface\s+([A-Za-z_$][\w$]*)\b/.exec(trimmed)
      ?? /^(export\s+)?type\s+([A-Za-z_$][\w$]*)\b/.exec(trimmed)
      ?? /^(export\s+)?enum\s+([A-Za-z_$][\w$]*)\b/.exec(trimmed)
      ?? /^(export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\b/.exec(trimmed);

    if (braceDepth === 0 && declaration) {
      const name = declaration[3] ?? declaration[2];
      const kind = trimmed.includes("function ")
        ? "function"
        : trimmed.includes("class ")
          ? "class"
          : trimmed.includes("interface ")
            ? "interface"
            : trimmed.includes("type ")
              ? "type"
              : trimmed.includes("enum ")
                ? "enum"
                : "value";
      const header = findHeader(content.slice(0, offset));
      symbols.push({
        tsFile,
        kind,
        name,
        exported: Boolean(declaration[1]),
        ...header,
      });
    }

    braceDepth = updateBraceDepth(line, braceDepth);
    offset += line.length + 1;
  }

  return symbols;
}

function normalizedSourcePath(source: string): string {
  const clean = source.replace(/`/g, "").trim();
  if (!clean) {
    return "";
  }
  return clean.startsWith("Quake-2-master/") ? clean : `Quake-2-master/${clean}`;
}

function sourceIdentity(sourceFile: string): string {
  return sourceFile.replace(/\.(c|h)$/i, "");
}

function isExpectedOwner(tsFile: string, sourceFile: string): boolean {
  if (!sourceFile) {
    return true;
  }

  const sourceParts = sourceFile.split("/");
  const sourceModule = sourceParts[1] ?? "";
  if (sourceModule === "game") {
    return tsFile.startsWith("packages/game/");
  }
  if (sourceModule === "client") {
    return tsFile.startsWith("packages/client/") || tsFile.startsWith("apps/web/");
  }
  if (sourceModule === "qcommon") {
    return tsFile.startsWith("packages/qcommon/");
  }
  if (sourceModule === "server") {
    return tsFile.startsWith("packages/server/");
  }
  if (sourceModule === "ref_gl") {
    return tsFile.startsWith("packages/renderer-three/");
  }
  return true;
}

function crossRows(symbols: TsSymbol[], allSymbols: TsSymbol[], sourceEntries: SourceMatrixEntry[]): MatrixRow[] {
  const byDeclaredSource = new Map<string, SourceMatrixEntry>();
  const bySourceIdentity = new Map<string, SourceMatrixEntry>();
  const duplicateCounts = new Map<string, number>();

  for (const entry of sourceEntries) {
    byDeclaredSource.set(`${entry.sourceFile}\0${entry.sourceSymbol}`, entry);
    bySourceIdentity.set(`${sourceIdentity(entry.sourceFile)}\0${entry.sourceSymbol}`, entry);
  }

  for (const symbol of allSymbols) {
    if (!symbol.originalName || !symbol.source) {
      continue;
    }
    const sourceFile = normalizedSourcePath(symbol.source);
    const key = `${sourceIdentity(sourceFile)}\0${symbol.originalName}`;
    duplicateCounts.set(key, (duplicateCounts.get(key) ?? 0) + 1);
  }

  return symbols.map((symbol) => {
    const sourceFile = normalizedSourcePath(symbol.source);
    const sourceEntry = symbol.originalName && sourceFile
      ? byDeclaredSource.get(`${sourceFile}\0${symbol.originalName}`)
        ?? bySourceIdentity.get(`${sourceIdentity(sourceFile)}\0${symbol.originalName}`)
      : undefined;
    const duplicateCount = symbol.originalName && sourceFile
      ? duplicateCounts.get(`${sourceIdentity(sourceFile)}\0${symbol.originalName}`) ?? 0
      : 0;

    if (!symbol.originalName && !symbol.source && !symbol.category) {
      return { symbol, status: "TS sans lien source", duplicateCount, notes: "A classer: helper local, adapter ou portage non documente." };
    }
    if (!symbol.originalName || !symbol.source) {
      return { symbol, status: "Entete incomplet", duplicateCount, notes: "Entete incomplet: `Original name` et `Source` sont requis pour le croisement." };
    }
    if (!sourceEntry) {
      return { symbol, status: "Source inconnue", duplicateCount, notes: "Aucune entite C/H correspondante trouvee dans les matrices source." };
    }
    if (duplicateCount > 1) {
      const ownershipNote = sourceEntry && !isExpectedOwner(symbol.tsFile, sourceEntry.sourceFile)
        ? " Ownership aussi suspect: le package TS ne correspond pas au module source attendu."
        : "";
      return { symbol, status: "Doublon potentiel", sourceEntry, duplicateCount, notes: `Plusieurs symboles TS declarent le meme portage source.${ownershipNote}` };
    }
    if (!isExpectedOwner(symbol.tsFile, sourceEntry.sourceFile)) {
      return { symbol, status: "Ownership suspect", sourceEntry, duplicateCount, notes: "Le package TS ne correspond pas au module source attendu." };
    }
    if (sourceEntry.validation === "Valide" || sourceEntry.validation === "Non applicable") {
      return { symbol, status: "Couvert C/H", sourceEntry, duplicateCount, notes: "Couvert par la validation de la matrice C/H." };
    }

    return { symbol, status: "A auditer", sourceEntry, duplicateCount, notes: "Entite source trouvee mais pas encore couverte par une validation finale." };
  });
}

function statusFromCounts(counts: GlobalCounts): string {
  if (counts.audit + counts.duplicates + counts.ownership + counts.incomplete > 0) {
    return "En cours";
  }
  if (counts.covered === counts.total && counts.total > 0) {
    return "Termine";
  }
  return counts.total === 0 ? "A revoir" : "A demarrer";
}

function writeMatrices(): void {
  mkdirSync(TS_MATRICES_DIR, { recursive: true });
  mkdirSync(TS_PROGRESS_DIR, { recursive: true });

  const sourceEntries = readSourceMatrixEntries();
  const preserved = readPreservedCells();
  const tsFiles = [...walk(path.join(ROOT, "packages")), ...walk(path.join(ROOT, "apps"))].sort();
  const symbolsByFile = new Map(tsFiles.map((tsFile) => [tsFile, parseTsSymbols(tsFile)]));
  const allSymbols = Array.from(symbolsByFile.values()).flat();
  const indexRows: string[] = [];
  const globalRows: string[] = [];

  for (const tsFile of tsFiles) {
    const symbols = symbolsByFile.get(tsFile) ?? [];
    const rows = crossRows(symbols, allSymbols, sourceEntries);
    const matrixFileName = sanitizeFileName(tsFile);
    const counts: GlobalCounts = {
      total: rows.length,
      covered: rows.filter((row) => row.status === "Couvert C/H").length,
      audit: rows.filter((row) => row.status === "A auditer" || row.status === "Source inconnue" || row.status === "TS sans lien source").length,
      duplicates: rows.filter((row) => row.status === "Doublon potentiel").length,
      ownership: rows.filter((row) => row.status === "Ownership suspect").length,
      incomplete: rows.filter((row) => row.status === "Entete incomplet").length,
    };

    const renderedRows = rows.map((row) => {
      const saved = preserved.get(`${row.symbol.tsFile}\0${row.symbol.name}`);
      return [
        code(row.symbol.tsFile),
        row.symbol.kind,
        code(row.symbol.name),
        row.symbol.exported ? "oui" : "non",
        code(row.symbol.originalName),
        code(normalizedSourcePath(row.symbol.source)),
        row.symbol.category,
        row.sourceEntry ? `[${code(row.sourceEntry.matrixFile)}](../matrices/${row.sourceEntry.matrixFile})` : "",
        row.status,
        saved?.validation ?? (row.status === "Couvert C/H" ? "Couvert C/H" : "A verifier"),
        md(saved?.notes ?? row.notes),
      ].join(" | ");
    });

    writeFileSync(
      path.join(TS_MATRICES_DIR, matrixFileName),
      [
        `# Validation TS croisee - ${tsFile}`,
        "",
        "<!-- Generated by validation-incrementale/tools/generate-ts-cross-validation-matrices.ts. Preserve manual `Validation TS` and `Notes` cells by TS file + symbol. -->",
        "",
        `- Fichier TS: ${code(tsFile)}`,
        `- Symboles TS: ${rows.length}`,
        `- Couvert C/H: ${counts.covered}`,
        `- Reste a auditer: ${counts.audit + counts.duplicates + counts.ownership + counts.incomplete}`,
        "",
        "| Fichier TS | Type TS | Symbole TS | Export | Original name | Source declaree | Category | Matrice C/H | Statut croise | Validation TS | Notes |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
        ...renderedRows.map((row) => `| ${row} |`),
        "",
      ].join("\n"),
      "utf8",
    );

    indexRows.push(`| [${code(tsFile)}](ts-matrices/${matrixFileName}) | ${rows.length} | ${counts.covered} | ${counts.audit + counts.duplicates + counts.ownership + counts.incomplete} |`);
    globalRows.push([
      code(tsFile),
      `[${code(matrixFileName)}](ts-matrices/${matrixFileName})`,
      "",
      statusFromCounts(counts),
      counts.total,
      counts.covered,
      counts.audit,
      counts.duplicates,
      counts.ownership,
      counts.incomplete,
      counts.audit + counts.duplicates + counts.ownership + counts.incomplete > 0 ? "Traiter le premier symbole non couvert ou suspect." : "Aucun.",
    ].join(" | "));
  }

  writeFileSync(
    TS_INDEX,
    [
      "# Index des matrices TS croisees",
      "",
      `- Fichiers TS: ${tsFiles.length}`,
      `- Matrices: ${code("validation/ts-matrices/")}`,
      "",
      "| Fichier TS | Symboles | Couvert C/H | Reste a auditer |",
      "| --- | ---: | ---: | ---: |",
      ...indexRows,
      "",
    ].join("\n"),
    "utf8",
  );

  writeFileSync(
    TS_GLOBAL,
    [
      "# Avancement global de validation TS croisee",
      "",
      "Ce fichier est le point d'entree operationnel pour auditer les symboles TypeScript par croisement avec les matrices C/H.",
      "",
      "| Fichier TS | Matrice TS | Progress | Statut | Symboles | Couvert C/H | A auditer | Doublons | Ownership suspect | Entetes incomplets | Prochain lot |",
      "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
      ...globalRows.map((row) => `| ${row} |`),
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`Wrote ${tsFiles.length} TS cross matrices to ${path.relative(ROOT, TS_MATRICES_DIR)}`);
}

writeMatrices();
