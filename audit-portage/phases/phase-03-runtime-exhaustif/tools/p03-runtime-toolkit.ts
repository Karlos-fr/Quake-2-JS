/**
 * File: p03-runtime-toolkit.ts
 * Purpose: Shared implementation for the Phase 03 runtime audit tools.
 *
 * The extractors are intentionally conservative. They build repeatable indexes
 * that reduce omissions before the human ISO audit; they do not claim behavioral
 * equivalence.
 */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type SymbolKind =
  | "function"
  | "struct"
  | "enum"
  | "macro"
  | "global"
  | "table"
  | "class"
  | "interface"
  | "type"
  | "constant";

export interface RuntimeSourceEntry {
  sourcePath: string;
  sourceBasename: string;
  scope: string;
  expectedStatus: string;
  structuralStatus: string;
  status?: string;
  declaredPrimaryTsTarget: string | null;
  declaredTsTargets: string[];
  findings: string[];
}

export interface SymbolEntry {
  name: string;
  kind: SymbolKind;
  file: string;
  line: number;
  signature?: string;
  exported?: boolean;
  confidence: "high" | "medium" | "low";
  notes?: string[];
}

export interface FileSymbolIndex {
  path: string;
  basename: string;
  symbols: SymbolEntry[];
  findings: string[];
}

export interface SymbolIndex {
  generatedBy: string;
  generatedAt: string;
  files: FileSymbolIndex[];
}

export interface Phase02Index {
  entries: RuntimeSourceEntry[];
}

export interface ParityEntry {
  sourcePath: string;
  sourceSymbol: string;
  kind: SymbolKind;
  tsTargets: string[];
  tsSymbolMatches: Array<{ file: string; symbol: string; kind: SymbolKind }>;
  status: "matched" | "missing-ts-target" | "missing-symbol" | "not-applicable" | "needs-review";
  findings: string[];
}

export interface RootTrace {
  root: string;
  cMatches: SymbolEntry[];
  tsMatches: SymbolEntry[];
  status: "found-in-c-and-ts" | "missing-in-ts" | "missing-in-c" | "missing-in-both";
}

export interface DeclarativeTable {
  category: string;
  file: string;
  line: number;
  name: string;
  entries: string[];
  confidence: "high" | "medium" | "low";
  notes: string[];
}

export interface DeclarativeTableComparison {
  category: string;
  sourceFile: string;
  line: number;
  tableName: string;
  primaryTsTarget: string | null;
  tsTargets: string[];
  sourceEntryCount: number;
  matchedEntryCount: number;
  missingEntryCount: number;
  matchRatio: number;
  status: "matched" | "partial" | "missing-ts-target" | "not-extracted" | "needs-review";
  matchedEntries: string[];
  missingEntries: string[];
  findings: string[];
}

export interface DeclarativeTablesAudit {
  generatedBy: string;
  generatedAt: string;
  sourceInputs: {
    declarativeTables: string;
    runtimeFiles: string;
  };
  requiredCategories: string[];
  summary: {
    extractedTables: number;
    comparedTables: number;
    matchedTables: number;
    partialTables: number;
    missingTargetTables: number;
    needsReviewTables: number;
    requiredCategoriesWithoutExtraction: string[];
    byCategory: Record<string, number>;
  };
  comparisons: DeclarativeTableComparison[];
  requiredCategoryFindings: Array<{ category: string; finding: string }>;
}

export interface CallGraphEdge {
  file: string;
  caller: string;
  callee: string;
  line: number;
  language: "c" | "ts";
}

export interface RuntimeRootReachability {
  root: string;
  cEntrySymbols: SymbolEntry[];
  tsEntrySymbols: SymbolEntry[];
  cReachableFunctionCount: number;
  tsReachableFunctionCount: number;
  cReachableFileCount: number;
  tsReachableFileCount: number;
  sourceOnlyReachableFunctionCount: number;
  tsOnlyReachableFunctionCount: number;
  sourceOnlyReachableFunctionSample: string[];
  tsOnlyReachableFunctionSample: string[];
  status:
    | "traced-c-and-ts"
    | "missing-ts-root"
    | "missing-c-root"
    | "missing-root"
    | "blocked-no-c-calls"
    | "blocked-no-ts-calls";
  findings: string[];
}

export interface RuntimeReachabilityReport {
  generatedBy: string;
  generatedAt: string;
  sourceInputs: {
    runtimeRoots: string;
    cSymbolIndex: string;
    tsSymbolIndex: string;
    cCallgraph: string;
    tsCallgraph: string;
  };
  summary: {
    roots: number;
    tracedRoots: number;
    rootsWithFindings: number;
    cCallgraphEdges: number;
    tsCallgraphEdges: number;
    cReachableFunctionsFromAnyRoot: number;
    tsReachableFunctionsFromAnyRoot: number;
    cUnreachableFunctions: number;
    tsUnreachableFunctions: number;
  };
  roots: RuntimeRootReachability[];
  unreachable: {
    cFunctions: SymbolEntry[];
    tsFunctions: SymbolEntry[];
  };
}

export interface TestLink {
  file: string;
  symbol?: string;
  tests: string[];
  npmScripts: string[];
}

export interface CoverageMatrixRow {
  sourcePath: string;
  sourceSymbol: string;
  symbolKind: SymbolKind;
  primaryTsTarget: string | null;
  declaredTsTargets: string[];
  tsSymbol: string | null;
  tsSymbolMatches: Array<{ file: string; symbol: string; kind: SymbolKind }>;
  structuralStatus: string;
  phase03BehaviorStatus: "not-audited";
  linkedTests: string[];
  linkedNpmScripts: string[];
  findings: string[];
  provisionalVerdict: "A tester" | "A redecouper" | "Partiel" | "Non branche";
}

export interface RuntimeCoverageMatrix {
  generatedBy: string;
  generatedAt: string;
  sourceInputs: {
    runtimeFiles: string;
    cSymbolIndex: string;
    tsSymbolIndex: string;
    symbolParity: string;
    testLinks: string;
  };
  summary: {
    runtimeFiles: number;
    filesWithMatrixRows: number;
    filesWithoutMatrixRows: number;
    sourceSymbols: number;
    rows: number;
    rowsWithTsSymbol: number;
    rowsWithoutTsSymbol: number;
    rowsWithLinkedTests: number;
    rowsWithFindings: number;
    provisionalVerdicts: Record<string, number>;
    structuralStatuses: Record<string, number>;
  };
  filesWithoutMatrixRows: Array<{ sourcePath: string; reason: string; findings: string[] }>;
  rows: CoverageMatrixRow[];
}

export type RuntimeFileVerdict =
  | "OK ISO branche"
  | "OK avec ecarts documentes"
  | "Partiel"
  | "Non ISO"
  | "Non branche"
  | "A tester"
  | "A redecouper";

export interface RuntimeFileAudit {
  sourcePath: string;
  sourceBasename: string;
  primaryTsTarget: string | null;
  tsTargets: string[];
  structuralStatuses: string[];
  sourceSymbolCount: number;
  matchedTsSymbolCount: number;
  missingTsSymbolCount: number;
  linkedTests: string[];
  linkedNpmScripts: string[];
  declarativeTables: Array<{
    category: string;
    tableName: string;
    status: string;
    missingEntries: string[];
  }>;
  reachableFunctionCount: number;
  unreachableFunctionCount: number;
  verdict: RuntimeFileVerdict;
  findings: string[];
  evidence: string[];
}

export interface RuntimeFileAuditReport {
  generatedBy: string;
  generatedAt: string;
  sourceInputs: {
    coverageMatrix: string;
    rootReachability: string;
    declarativeTablesAudit: string;
    testLinks: string;
  };
  summary: {
    files: number;
    verdicts: Record<string, number>;
    filesWithTests: number;
    filesWithMissingTsSymbols: number;
    filesWithDeclarativeFindings: number;
    filesNonBranche: number;
  };
  audits: RuntimeFileAudit[];
}

export interface FunctionBodyComparison {
  sourcePath: string;
  sourceFunction: string;
  sourceLine: number;
  tsTargets: string[];
  tsMatches: Array<{
    file: string;
    functionName: string;
    line: number;
    sourceLineCount: number;
    tsLineCount: number;
    sourceCallCount: number;
    tsCallCount: number;
    commonCallCount: number;
    sourceBranchCount: number;
    tsBranchCount: number;
    notes: string[];
  }>;
  status: "missing-ts-body" | "matched-name-needs-behavior-review" | "no-ts-target" | "source-only-compile-active";
  manualVerdict: "not-reviewed";
  findings: string[];
}

export interface FunctionBodyComparisonReport {
  generatedBy: string;
  generatedAt: string;
  summary: {
    sourceFunctions: number;
    functionsWithTsBody: number;
    missingTsBody: number;
    noTsTarget: number;
  };
  comparisons: FunctionBodyComparison[];
}

const repoRoot = process.cwd();
const phaseRoot = path.join(repoRoot, "audit-portage", "phases", "phase-03-runtime-exhaustif");
const generatedRoot = path.join(phaseRoot, "generated");
const phase02IndexPath = path.join(
  repoRoot,
  "audit-portage",
  "phases",
  "phase-02-source-vers-typescript",
  "generated",
  "phase-02-structure-index.json",
);

const runtimeSourcePrefixes = [
  "Quake-2-master/game/",
  "Quake-2-master/server/",
  "Quake-2-master/client/",
  "Quake-2-master/qcommon/",
];

const runtimeTsPrefixes = [
  "packages/game/",
  "packages/server/",
  "packages/client/",
  "packages/qcommon/",
  "packages/shared/",
  "packages/math/",
  "packages/memory/",
  "packages/filesystem/",
  "packages/formats/",
];

export const runtimeRoots = [
  "Qcommon_Frame",
  "SV_Frame",
  "SV_RunGameFrame",
  "G_RunFrame",
  "ClientThink",
  "ClientBeginServerFrame",
  "CL_Frame",
  "CL_SendCommand",
  "CL_SendCmd",
  "CL_ReadPackets",
  "CL_ParseServerMessage",
  "PMove",
];

export function toRepoPath(absolutePath: string): string {
  return path.relative(repoRoot, absolutePath).replaceAll(path.sep, "/");
}

export async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

export async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function walkFiles(root: string, predicate: (filePath: string) => boolean): Promise<string[]> {
  const files: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "generated") {
        continue;
      }
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.isFile() && predicate(entryPath)) {
        files.push(entryPath);
      }
    }
  }
  await walk(root);
  return files.sort((a, b) => toRepoPath(a).localeCompare(toRepoPath(b)));
}

export async function loadRuntimeEntries(): Promise<RuntimeSourceEntry[]> {
  const index = await readJson<Phase02Index>(phase02IndexPath);
  return index.entries
    .filter((entry) => runtimeSourcePrefixes.some((prefix) => entry.sourcePath.startsWith(prefix)))
    .filter((entry) => entry.expectedStatus !== "voluntarily-excluded")
    .map((entry) => ({ ...entry, structuralStatus: entry.structuralStatus ?? entry.status ?? "unknown" }))
    .sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
}

export async function runtimeSourceFiles(): Promise<string[]> {
  const entries = await loadRuntimeEntries();
  return entries
    .map((entry) => path.join(repoRoot, entry.sourcePath))
    .filter((filePath) => filePath.endsWith(".c") || filePath.endsWith(".h"));
}

export async function runtimeTsFiles(): Promise<string[]> {
  const files: string[] = [];
  for (const prefix of runtimeTsPrefixes) {
    const root = path.join(repoRoot, prefix);
    try {
      files.push(...(await walkFiles(root, (filePath) => filePath.endsWith(".ts") || filePath.endsWith(".tsx"))));
    } catch {
      // Some packages are optional in intermediate ports.
    }
  }
  return files;
}

function stripComments(text: string): string {
  return stripDisabledPreprocessorBlocks(text)
    .replace(/\/\*[\s\S]*?\*\//g, (match) => "\n".repeat(match.split("\n").length - 1))
    .replace(/\/\/.*$/gm, "");
}

function stripDisabledPreprocessorBlocks(text: string): string {
  const lines = text.split("\n");
  const output: string[] = [];
  const disabledStack: boolean[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const parentDisabled = disabledStack.some(Boolean);
    if (/^#\s*if\s+0\b/.test(trimmed)) {
      disabledStack.push(true);
      output.push("");
      continue;
    }
    if (/^#\s*if\b/.test(trimmed)) {
      disabledStack.push(parentDisabled);
      output.push(parentDisabled ? "" : line);
      continue;
    }
    if (/^#\s*else\b/.test(trimmed)) {
      if (disabledStack.length > 0) {
        const wasDisabled = disabledStack.pop() ?? false;
        disabledStack.push(!wasDisabled && !disabledStack.some(Boolean));
      }
      output.push("");
      continue;
    }
    if (/^#\s*endif\b/.test(trimmed)) {
      disabledStack.pop();
      output.push(parentDisabled ? "" : line);
      continue;
    }
    output.push(disabledStack.some(Boolean) ? "" : line);
  }
  return output.join("\n");
}

function lineOf(text: string, index: number): number {
  return text.slice(0, index).split("\n").length;
}

function pushUnique(symbols: SymbolEntry[], symbol: SymbolEntry): void {
  if (!symbols.some((entry) => entry.name === symbol.name && entry.kind === symbol.kind && entry.line === symbol.line)) {
    symbols.push(symbol);
  }
}

export async function buildCSymbolIndex(): Promise<SymbolIndex> {
  const files = await runtimeSourceFiles();
  const result: FileSymbolIndex[] = [];
  for (const absolutePath of files) {
    const repoPath = toRepoPath(absolutePath);
    const text = await readFile(absolutePath, "utf8");
    result.push(extractCSymbols(repoPath, text));
  }
  return { generatedBy: "P03-TOOL-01-c-symbol-indexer", generatedAt: new Date().toISOString(), files: result };
}

export function extractCSymbols(file: string, text: string): FileSymbolIndex {
  const stripped = stripComments(text);
  const symbols: SymbolEntry[] = [];
  const findings: string[] = [];

  for (const match of stripped.matchAll(/^[ \t]*#\s*define\s+([A-Za-z_]\w*)(?:\s*\(([^)]*)\))?/gm)) {
    pushUnique(symbols, {
      name: match[1],
      kind: "macro",
      file,
      line: lineOf(stripped, match.index ?? 0),
      signature: match[0].trim(),
      confidence: "high",
    });
  }

  for (const match of stripped.matchAll(/\b(?:typedef\s+)?struct\s+([A-Za-z_]\w*)?\s*\{/g)) {
    const name = match[1] ?? inferTypedefName(stripped, match.index ?? 0);
    if (name) {
      pushUnique(symbols, { name, kind: "struct", file, line: lineOf(stripped, match.index ?? 0), confidence: match[1] ? "high" : "medium" });
    }
  }

  for (const match of stripped.matchAll(/\b(?:typedef\s+)?enum\s+([A-Za-z_]\w*)?\s*\{/g)) {
    const name = match[1] ?? inferTypedefName(stripped, match.index ?? 0);
    if (name) {
      pushUnique(symbols, { name, kind: "enum", file, line: lineOf(stripped, match.index ?? 0), confidence: match[1] ? "high" : "medium" });
    }
  }

  const functionPattern =
    /(^|\n)[ \t]*(?:static\s+)?(?:qboolean|void|int|float|double|char|byte|short|long|unsigned|signed|edict_t|gitem_t|mmove_t|mframe_t|cvar_t|sizebuf_t|usercmd_t|pmove_t|trace_t|entity_state_t|player_state_t|client_frame_t|[\w*_]+\s+)+\s*\*?\s*([A-Za-z_]\w*)\s*\(([^;{}()]|\([^)]*\))*\)\s*(?:\{|;)/g;
  for (const match of stripped.matchAll(functionPattern)) {
    const name = match[2];
    if (["if", "for", "while", "switch", "return", "sizeof"].includes(name)) {
      continue;
    }
    pushUnique(symbols, {
      name,
      kind: "function",
      file,
      line: lineOf(stripped, (match.index ?? 0) + match[0].indexOf(name)),
      signature: match[0].trim().replace(/\s+/g, " "),
      confidence: match[0].trim().endsWith("{") ? "high" : "medium",
    });
  }

  const globalPattern =
    /(^|\n)[ \t]*(?:extern\s+)?(?:static\s+)?(?:qboolean|int|float|double|char|byte|short|long|unsigned|signed|edict_t|gitem_t|mmove_t|mframe_t|cvar_t|sizebuf_t|usercmd_t|pmove_t|trace_t|entity_state_t|player_state_t|client_frame_t|[\w*_]+\s+)+\s+\*?([A-Za-z_]\w*)\s*(?:\[[^\]]*\])?\s*(?:=|;)/g;
  for (const match of stripped.matchAll(globalPattern)) {
    const name = match[2];
    if (!symbols.some((entry) => entry.name === name && entry.kind === "function")) {
      pushUnique(symbols, { name, kind: "global", file, line: lineOf(stripped, (match.index ?? 0) + match[0].indexOf(name)), confidence: "medium" });
    }
  }

  for (const match of stripped.matchAll(/\b([A-Za-z_]\w*)\s+([A-Za-z_]\w*)\s*\[\s*\]\s*=\s*\{/g)) {
    pushUnique(symbols, {
      name: match[2],
      kind: "table",
      file,
      line: lineOf(stripped, match.index ?? 0),
      signature: match[0].trim(),
      confidence: "medium",
    });
  }

  if (symbols.length === 0) {
    findings.push("no-symbols-extracted");
  }
  return { path: file, basename: path.posix.basename(file, path.posix.extname(file)), symbols: symbols.sort(bySymbol), findings };
}

function inferTypedefName(text: string, start: number): string | null {
  const tail = text.slice(start, start + 4000);
  const match = tail.match(/\}\s*([A-Za-z_]\w*)\s*;/);
  return match?.[1] ?? null;
}

export async function buildTsSymbolIndex(): Promise<SymbolIndex> {
  const files = await runtimeTsFiles();
  const result: FileSymbolIndex[] = [];
  for (const absolutePath of files) {
    const repoPath = toRepoPath(absolutePath);
    const text = await readFile(absolutePath, "utf8");
    result.push(extractTsSymbols(repoPath, text));
  }
  return { generatedBy: "P03-TOOL-02-ts-symbol-indexer", generatedAt: new Date().toISOString(), files: result };
}

export function extractTsSymbols(file: string, text: string): FileSymbolIndex {
  const stripped = stripComments(text);
  const symbols: SymbolEntry[] = [];
  const findings: string[] = [];
  const patterns: Array<[RegExp, SymbolKind]> = [
    [/\b(export\s+)?(?:async\s+)?function\s+([A-Za-z_]\w*)\s*\(/g, "function"],
    [/\b(export\s+)?(?:const|let|var)\s+([A-Za-z_]\w*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g, "function"],
    [/\b(export\s+)?class\s+([A-Za-z_]\w*)\b/g, "class"],
    [/\b(export\s+)?interface\s+([A-Za-z_]\w*)\b/g, "interface"],
    [/\b(export\s+)?type\s+([A-Za-z_]\w*)\b/g, "type"],
    [/\b(export\s+)?enum\s+([A-Za-z_]\w*)\b/g, "enum"],
    [/\b(export\s+)?(?:const|let|var)\s+([A-Za-z_]\w*)\b/g, "constant"],
  ];
  for (const [pattern, kind] of patterns) {
    for (const match of stripped.matchAll(pattern)) {
      pushUnique(symbols, {
        name: match[2],
        kind,
        file,
        line: lineOf(stripped, match.index ?? 0),
        signature: match[0].trim(),
        exported: Boolean(match[1]),
        confidence: "high",
      });
    }
  }
  if (symbols.length === 0) {
    findings.push("no-symbols-extracted");
  }
  return { path: file, basename: path.posix.basename(file, path.posix.extname(file)), symbols: symbols.sort(bySymbol), findings };
}

function bySymbol(a: SymbolEntry, b: SymbolEntry): number {
  return a.line - b.line || a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name);
}

function countBy(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

export async function buildSymbolParity(): Promise<ParityEntry[]> {
  const [runtimeEntries, cIndex, tsIndex] = await Promise.all([
    loadRuntimeEntries(),
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-c-symbol-index.json")),
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-ts-symbol-index.json")),
  ]);
  const runtimeBySource = new Map(runtimeEntries.map((entry) => [entry.sourcePath, entry]));
  const tsSymbolsByName = new Map<string, SymbolEntry[]>();
  for (const file of tsIndex.files) {
    for (const symbol of file.symbols) {
      const bucket = tsSymbolsByName.get(symbol.name.toLowerCase()) ?? [];
      bucket.push(symbol);
      tsSymbolsByName.set(symbol.name.toLowerCase(), bucket);
    }
  }

  const rows: ParityEntry[] = [];
  for (const file of cIndex.files) {
    const runtime = runtimeBySource.get(file.path);
    for (const symbol of file.symbols) {
      const tsTargets = runtime?.declaredTsTargets ?? [];
      const matches = (tsSymbolsByName.get(symbol.name.toLowerCase()) ?? []).filter((match) => tsTargets.length === 0 || tsTargets.includes(match.file));
      const findings: string[] = [];
      let status: ParityEntry["status"] = "matched";
      if (!runtime) {
        status = "needs-review";
        findings.push("source-not-found-in-phase02-runtime-set");
      } else if (runtime.structuralStatus !== "strict-ok" && runtime.structuralStatus !== "split-ok") {
        status = "needs-review";
        findings.push(`phase02-structural-status:${runtime.structuralStatus}`);
      } else if (tsTargets.length === 0) {
        status = "missing-ts-target";
      } else if (matches.length === 0) {
        status = "missing-symbol";
      }
      rows.push({
        sourcePath: file.path,
        sourceSymbol: symbol.name,
        kind: symbol.kind,
        tsTargets,
        tsSymbolMatches: matches.map((match) => ({ file: match.file, symbol: match.name, kind: match.kind })),
        status,
        findings,
      });
    }
  }
  return rows;
}

export async function buildRuntimeRootIndex(): Promise<RootTrace[]> {
  const [cIndex, tsIndex] = await Promise.all([
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-c-symbol-index.json")),
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-ts-symbol-index.json")),
  ]);
  const cSymbols = cIndex.files.flatMap((file) => file.symbols);
  const tsSymbols = tsIndex.files.flatMap((file) => file.symbols);
  return runtimeRoots.map((root) => {
    const cMatches = cSymbols.filter((symbol) => symbol.name === root || symbol.name.toLowerCase() === root.toLowerCase());
    const tsMatches = tsSymbols.filter((symbol) => symbol.name === root || symbol.name.toLowerCase() === root.toLowerCase());
    return {
      root,
      cMatches,
      tsMatches,
      status:
        cMatches.length > 0 && tsMatches.length > 0
          ? "found-in-c-and-ts"
          : cMatches.length > 0
            ? "missing-in-ts"
            : tsMatches.length > 0
              ? "missing-in-c"
              : "missing-in-both",
    };
  });
}

export async function buildDeclarativeTables(): Promise<DeclarativeTable[]> {
  const files = await runtimeSourceFiles();
  const tables: DeclarativeTable[] = [];
  for (const absolutePath of files) {
    const file = toRepoPath(absolutePath);
    const text = stripComments(await readFile(absolutePath, "utf8"));
    extractNamedArrayTables(file, text, tables);
    extractSpawnRows(file, text, tables);
    extractEnumConstants(file, text, tables);
  }
  return tables.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

export async function buildDeclarativeTablesAudit(): Promise<DeclarativeTablesAudit> {
  const [runtimeEntries, tables] = await Promise.all([
    loadRuntimeEntries(),
    readJson<DeclarativeTable[]>(path.join(generatedRoot, "phase-03-declarative-tables.json")),
  ]);
  const tsTextByPath = await readTsTextByPath();
  const runtimeBySource = new Map(runtimeEntries.map((entry) => [entry.sourcePath, entry]));
  const requiredCategories = [
    "spawn-functions",
    "items-ammo-weapons",
    "cvars",
    "commands",
    "network-messages",
    "temp-entities",
    "muzzle-flashes",
    "effects-renderfx",
    "configstrings",
    "precaches",
    "monster-tables",
  ];
  const extractedCategories = new Set(tables.map((table) => table.category));
  const comparisons = tables.map((table) => compareDeclarativeTable(table, runtimeBySource.get(table.file), tsTextByPath));
  const requiredCategoryFindings = requiredCategories
    .filter((category) => !extractedCategories.has(category))
    .map((category) => ({ category, finding: "required-category-not-extracted" }));
  return {
    generatedBy: "phase-03-declarative-table-comparator",
    generatedAt: new Date().toISOString(),
    sourceInputs: {
      declarativeTables: "phase-03-declarative-tables.json",
      runtimeFiles: "phase-03-runtime-files.json",
    },
    requiredCategories,
    summary: {
      extractedTables: tables.length,
      comparedTables: comparisons.length,
      matchedTables: comparisons.filter((comparison) => comparison.status === "matched").length,
      partialTables: comparisons.filter((comparison) => comparison.status === "partial").length,
      missingTargetTables: comparisons.filter((comparison) => comparison.status === "missing-ts-target").length,
      needsReviewTables: comparisons.filter((comparison) => comparison.status === "needs-review").length,
      requiredCategoriesWithoutExtraction: requiredCategoryFindings.map((finding) => finding.category),
      byCategory: Object.fromEntries(countBy(tables.map((table) => table.category))),
    },
    comparisons,
    requiredCategoryFindings,
  };
}

async function readTsTextByPath(): Promise<Map<string, string>> {
  const files = await runtimeTsFiles();
  const byPath = new Map<string, string>();
  for (const absolutePath of files) {
    byPath.set(toRepoPath(absolutePath), await readFile(absolutePath, "utf8"));
  }
  return byPath;
}

function compareDeclarativeTable(
  table: DeclarativeTable,
  runtimeEntry: RuntimeSourceEntry | undefined,
  tsTextByPath: Map<string, string>,
): DeclarativeTableComparison {
  const tsTargets = runtimeEntry?.declaredTsTargets ?? [];
  const targetTexts = tsTargets.map((target) => tsTextByPath.get(target) ?? "").join("\n");
  const normalizedEntries = normalizeDeclarativeEntries(table);
  const findings: string[] = [...table.notes.map((note) => `extractor:${note}`)];
  if (table.confidence !== "high") findings.push(`extractor-confidence:${table.confidence}`);
  if (normalizedEntries.length === 0) findings.push("no-comparable-entries-extracted");
  if (tsTargets.length === 0) findings.push("no-phase02-ts-targets");

  const matchedEntries = normalizedEntries.filter((entry) => entryMatchesTarget(entry, targetTexts)).map((entry) => entry.label);
  const missingEntries = normalizedEntries.filter((entry) => !entryMatchesTarget(entry, targetTexts)).map((entry) => entry.label);
  const sourceEntryCount = normalizedEntries.length;
  const matchedEntryCount = matchedEntries.length;
  const missingEntryCount = missingEntries.length;
  const matchRatio = sourceEntryCount === 0 ? 0 : matchedEntryCount / sourceEntryCount;
  let status: DeclarativeTableComparison["status"];
  if (sourceEntryCount === 0 && targetTexts.includes(table.name)) {
    status = "matched";
    findings.push("table-name-present-but-no-comparable-entries");
  } else if (sourceEntryCount === 0) {
    status = "not-extracted";
  } else if (tsTargets.length === 0) {
    status = "missing-ts-target";
  } else if (missingEntryCount === 0) {
    status = "matched";
  } else if (matchedEntryCount > 0) {
    status = "partial";
  } else {
    status = "needs-review";
  }

  return {
    category: table.category,
    sourceFile: table.file,
    line: table.line,
    tableName: table.name,
    primaryTsTarget: runtimeEntry?.declaredPrimaryTsTarget ?? null,
    tsTargets,
    sourceEntryCount,
    matchedEntryCount,
    missingEntryCount,
    matchRatio,
    status,
    matchedEntries: matchedEntries.slice(0, 200),
    missingEntries: missingEntries.slice(0, 200),
    findings,
  };
}

function entryMatchesTarget(entry: { label: string; tokens: string[] }, targetTexts: string): boolean {
  if (entry.label === "func_group -> SP_info_null") {
    return targetTexts.includes("func_group") || (targetTexts.includes("SP_info_null") && targetTexts.includes("info_null"));
  }
  if (entry.label === "func_group") {
    return targetTexts.includes("func_group") || (targetTexts.includes("SP_info_null") && targetTexts.includes("info_null"));
  }
  return entry.tokens.every((token) => targetTexts.includes(token));
}

function normalizeDeclarativeEntries(table: DeclarativeTable): Array<{ label: string; tokens: string[] }> {
  if (table.category === "spawn-functions") {
    const pairs = table.entries
      .filter((entry) => entry.includes(" -> "))
      .map((entry) => {
        const [classname, fn] = entry.split(" -> ");
        return { label: entry, tokens: [classname, fn] };
      });
    if (pairs.length > 0) return uniqueComparableEntries(pairs);
  }
  const sourceEntries = table.category === "muzzle-flashes"
    ? table.entries.filter((entry) => /^MZ2_/.test(cleanDeclarativeToken(entry)) || /_flash$/.test(cleanDeclarativeToken(entry)))
    : table.entries;
  const entries = sourceEntries
    .map((entry) => cleanDeclarativeToken(entry))
    .filter((entry) => isUsefulDeclarativeToken(entry))
    .map((entry) => ({ label: entry, tokens: [entry] }));
  return uniqueComparableEntries(entries);
}

function cleanDeclarativeToken(entry: string): string {
  return entry.trim().replace(/^[,;{}()[\]\s]+/, "").replace(/[,;{}()[\]\s]+$/, "");
}

function uniqueComparableEntries(entries: Array<{ label: string; tokens: string[] }>): Array<{ label: string; tokens: string[] }> {
  const seen = new Set<string>();
  const result: Array<{ label: string; tokens: string[] }> = [];
  for (const entry of entries) {
    if (seen.has(entry.label)) continue;
    seen.add(entry.label);
    result.push(entry);
  }
  return result;
}

function isUsefulDeclarativeToken(entry: string): boolean {
  if (entry.length < 3 || entry.length > 120) return false;
  if (/^[,{}\s\\tnr]+$/.test(entry)) return false;
  if (/^[,;]/.test(entry) || /[,;]$/.test(entry)) return false;
  if (/^(NULL|NULL,\s*0|void|int|float|static|const|self|start|end|dir|right|up|forward|vec3_t|edict_t)$/i.test(entry)) return false;
  if (entry.includes("\n") || entry.includes("\t")) return false;
  return /[A-Za-z_]/.test(entry);
}

function extractNamedArrayTables(file: string, text: string, tables: DeclarativeTable[]): void {
  const interestingNames = /(spawns|itemlist|gameitemlist|cmds|commands|cvars|svc_|clc_|temp|muzzle|flash|effects|renderfx|configstring|sounds|models|images|frames|move)/i;
  for (const match of text.matchAll(/\b([A-Za-z_]\w*)\s+([A-Za-z_]\w*)\s*\[\s*\]\s*=\s*\{([\s\S]*?)\n\};/g)) {
    const name = match[2];
    if (!interestingNames.test(name) && !interestingNames.test(file)) {
      continue;
    }
    tables.push({
      category: categorizeTable(name, file),
      file,
      line: lineOf(text, match.index ?? 0),
      name,
      entries: extractStringAndIdentifierEntries(match[3]).slice(0, 500),
      confidence: "medium",
      notes: ["array-table-heuristic"],
    });
  }
}

function extractSpawnRows(file: string, text: string, tables: DeclarativeTable[]): void {
  if (!file.endsWith("g_spawn.c")) {
    return;
  }
  const entries = [...text.matchAll(/\{\s*"([^"]+)"\s*,\s*([A-Za-z_]\w*)\s*\}/g)].map((match) => `${match[1]} -> ${match[2]}`);
  if (entries.length > 0) {
    tables.push({ category: "spawn-functions", file, line: 1, name: "spawns", entries, confidence: "high", notes: [] });
  }
}

function extractEnumConstants(file: string, text: string, tables: DeclarativeTable[]): void {
  for (const match of text.matchAll(/\benum\s+[A-Za-z_]*\s*\{([\s\S]*?)\};/g)) {
    const entries = [...match[1].matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)].map((entry) => entry[1]);
    const selected = entries.filter((name) => /^(svc|clc|TE|MZ|EF|RF|CS)_/.test(name));
    if (selected.length > 0) {
      tables.push({
        category: "protocol-or-effect-enum",
        file,
        line: lineOf(text, match.index ?? 0),
        name: "enum",
        entries: selected,
        confidence: "medium",
        notes: ["enum-constant-heuristic"],
      });
    }
  }
}

function extractStringAndIdentifierEntries(body: string): string[] {
  const entries = new Set<string>();
  for (const match of body.matchAll(/"([^"]+)"/g)) {
    entries.add(match[1]);
  }
  for (const match of body.matchAll(/\b([A-Za-z_]\w*)\b/g)) {
    if (/^(NULL|true|false|static|const|sizeof)$/.test(match[1])) {
      continue;
    }
    entries.add(match[1]);
  }
  return [...entries];
}

function categorizeTable(name: string, file: string): string {
  const value = `${file}/${name}`.toLowerCase();
  if (value.includes("spawn")) return "spawn-functions";
  if (value.includes("item")) return "items-ammo-weapons";
  if (value.includes("cmd")) return "commands";
  if (value.includes("cvar")) return "cvars";
  if (value.includes("svc") || value.includes("clc")) return "network-messages";
  if (value.includes("temp") || value.includes("tent")) return "temp-entities";
  if (value.includes("muzzle") || value.includes("flash")) return "muzzle-flashes";
  if (value.includes("effect") || value.includes("renderfx")) return "effects-renderfx";
  if (value.includes("config")) return "configstrings";
  if (value.includes("sound") || value.includes("model") || value.includes("image")) return "precaches";
  if (value.includes("m_") || value.includes("frame") || value.includes("move")) return "monster-tables";
  return "declarative-table";
}

export async function buildCallGraph(language: "c" | "ts"): Promise<CallGraphEdge[]> {
  const files = language === "c" ? await runtimeSourceFiles() : await runtimeTsFiles();
  const indexPath = path.join(generatedRoot, language === "c" ? "phase-03-c-symbol-index.json" : "phase-03-ts-symbol-index.json");
  const index = await readJson<SymbolIndex>(indexPath);
  const knownNames = new Set(index.files.flatMap((file) => file.symbols.filter((symbol) => symbol.kind === "function").map((symbol) => symbol.name)));
  const edges: CallGraphEdge[] = [];
  for (const absolutePath of files) {
    const file = toRepoPath(absolutePath);
    const text = stripComments(await readFile(absolutePath, "utf8"));
    const fileIndex = index.files.find((entry) => entry.path === file);
    const functions = fileIndex?.symbols.filter((symbol) => symbol.kind === "function") ?? [];
    const ranges = language === "c" ? extractCFunctionRanges(text) : rangesFromIndexedFunctions(text, functions);
    for (const current of ranges) {
      const body = text.slice(current.start, current.end);
      for (const match of body.matchAll(/\b([A-Za-z_]\w*)\s*\(/g)) {
        const callee = match[1];
        if (callee !== current.name && knownNames.has(callee) && !["if", "for", "while", "switch"].includes(callee)) {
          edges.push({ file, caller: current.name, callee, line: current.line + lineOf(body, match.index ?? 0) - 1, language });
        }
      }
    }
  }
  return edges;
}

interface FunctionRange {
  name: string;
  line: number;
  start: number;
  end: number;
}

function extractCFunctionRanges(text: string): FunctionRange[] {
  const ranges: FunctionRange[] = [];
  const definitionPattern =
    /(^|\n)[ \t]*(?:static\s+)?(?:qboolean|void|int|float|double|char|byte|short|long|unsigned|signed|edict_t|gitem_t|mmove_t|mframe_t|cvar_t|sizebuf_t|usercmd_t|pmove_t|trace_t|entity_state_t|player_state_t|client_frame_t|[\w*_]+)(?:\s+[\w*_]+)*\s+\*?([A-Za-z_]\w*)\s*\(([^;{}()]|\([^)]*\))*\)\s*\{/g;
  for (const match of text.matchAll(definitionPattern)) {
    if (["if", "for", "while", "switch", "return", "sizeof"].includes(match[2])) {
      continue;
    }
    const brace = text.indexOf("{", match.index ?? 0);
    const end = findMatchingBrace(text, brace);
    if (brace === -1 || end === -1) continue;
    ranges.push({
      name: match[2],
      line: lineOf(text, (match.index ?? 0) + match[0].indexOf(match[2])),
      start: brace,
      end: end + 1,
    });
  }
  return ranges.sort((a, b) => a.start - b.start);
}

function rangesFromIndexedFunctions(text: string, functions: SymbolEntry[]): FunctionRange[] {
  return functions.map((current, index) => {
    const next = functions[index + 1];
    return {
      name: current.name,
      line: current.line,
      start: nthLineOffset(text, current.line),
      end: next ? nthLineOffset(text, next.line) : text.length,
    };
  });
}

function findMatchingBrace(text: string, openBrace: number): number {
  if (openBrace < 0) return -1;
  let depth = 0;
  for (let index = openBrace; index < text.length; index += 1) {
    const char = text[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

export async function buildFunctionBodyComparison(): Promise<FunctionBodyComparisonReport> {
  const runtimeEntries = await loadRuntimeEntries();
  const runtimeBySource = new Map(runtimeEntries.map((entry) => [entry.sourcePath, entry]));
  const tsFiles = await runtimeTsFiles();
  const tsRangesByFile = new Map<string, Array<FunctionRange & { body: string }>>();
  for (const absolutePath of tsFiles) {
    const repoPath = toRepoPath(absolutePath);
    const text = stripComments(await readFile(absolutePath, "utf8"));
    tsRangesByFile.set(repoPath, extractTsFunctionRanges(text).map((range) => ({ ...range, body: text.slice(range.start, range.end) })));
  }

  const comparisons: FunctionBodyComparison[] = [];
  for (const absolutePath of await runtimeSourceFiles()) {
    const sourcePath = toRepoPath(absolutePath);
    const runtime = runtimeBySource.get(sourcePath);
    const text = stripComments(await readFile(absolutePath, "utf8"));
    for (const range of extractCFunctionRanges(text)) {
      const sourceBody = text.slice(range.start, range.end);
      const tsTargets = runtime?.declaredTsTargets ?? [];
      const tsMatches = tsTargets.flatMap((target) =>
        (tsRangesByFile.get(target) ?? [])
          .filter((tsRange) => normalizeSymbolName(tsRange.name) === normalizeSymbolName(range.name))
          .map((tsRange) => compareFunctionBodies(sourceBody, range, target, tsRange)),
      );
      const findings: string[] = [];
      if (!runtime) findings.push("source-not-in-runtime-entry-index");
      if (tsTargets.length === 0) findings.push("no-ts-target");
      if (tsTargets.length > 0 && tsMatches.length === 0) findings.push("missing-ts-function-body");
      comparisons.push({
        sourcePath,
        sourceFunction: range.name,
        sourceLine: range.line,
        tsTargets,
        tsMatches,
        status:
          tsTargets.length === 0
            ? "no-ts-target"
            : tsMatches.length === 0
              ? "missing-ts-body"
              : "matched-name-needs-behavior-review",
        manualVerdict: "not-reviewed",
        findings,
      });
    }
  }
  return {
    generatedBy: "phase-03-function-body-comparator",
    generatedAt: new Date().toISOString(),
    summary: {
      sourceFunctions: comparisons.length,
      functionsWithTsBody: comparisons.filter((comparison) => comparison.tsMatches.length > 0).length,
      missingTsBody: comparisons.filter((comparison) => comparison.status === "missing-ts-body").length,
      noTsTarget: comparisons.filter((comparison) => comparison.status === "no-ts-target").length,
    },
    comparisons,
  };
}

function extractTsFunctionRanges(text: string): FunctionRange[] {
  const ranges: FunctionRange[] = [];
  const patterns = [
    /\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_]\w*)\s*\(/g,
    /\b(?:export\s+)?(?:const|let|var)\s+([A-Za-z_]\w*)\s*=\s*(?:async\s*)?\(/g,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const brace = findTopLevelBodyBrace(text, match.index ?? 0);
      const end = findMatchingBrace(text, brace);
      if (brace === -1 || end === -1) continue;
      ranges.push({
        name: match[1],
        line: lineOf(text, match.index ?? 0),
        start: brace,
        end: end + 1,
      });
    }
  }
  return ranges.sort((a, b) => a.start - b.start);
}

function findTopLevelBodyBrace(text: string, start: number): number {
  let parenDepth = 0;
  let bracketDepth = 0;
  let stringQuote: string | null = null;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    const previous = text[index - 1];
    if (stringQuote) {
      if (char === stringQuote && previous !== "\\") stringQuote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      stringQuote = char;
      continue;
    }
    if (char === "(") parenDepth += 1;
    if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
    if (char === "[") bracketDepth += 1;
    if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    if (char === "{" && parenDepth === 0 && bracketDepth === 0) {
      return index;
    }
  }
  return -1;
}

function compareFunctionBodies(
  sourceBody: string,
  sourceRange: FunctionRange,
  tsFile: string,
  tsRange: FunctionRange & { body: string },
): FunctionBodyComparison["tsMatches"][number] {
  const sourceCalls = extractCallNames(sourceBody);
  const tsCalls = extractCallNames(tsRange.body);
  const commonCalls = sourceCalls.filter((call) => tsCalls.includes(call));
  const notes: string[] = [];
  if (sourceCalls.length !== tsCalls.length) notes.push("call-count-differs");
  if (branchCount(sourceBody) !== branchCount(tsRange.body)) notes.push("branch-count-differs");
  if (Math.abs(lineCount(sourceBody) - lineCount(tsRange.body)) > Math.max(12, lineCount(sourceBody) * 0.5)) {
    notes.push("body-size-differs");
  }
  return {
    file: tsFile,
    functionName: tsRange.name,
    line: tsRange.line,
    sourceLineCount: lineCount(sourceBody),
    tsLineCount: lineCount(tsRange.body),
    sourceCallCount: sourceCalls.length,
    tsCallCount: tsCalls.length,
    commonCallCount: commonCalls.length,
    sourceBranchCount: branchCount(sourceBody),
    tsBranchCount: branchCount(tsRange.body),
    notes,
  };
}

function extractCallNames(body: string): string[] {
  const ignored = new Set(["if", "for", "while", "switch", "return", "sizeof"]);
  return [...new Set([...body.matchAll(/\b([A-Za-z_]\w*)\s*\(/g)].map((match) => match[1]).filter((name) => !ignored.has(name)))].sort();
}

function branchCount(body: string): number {
  return [...body.matchAll(/\b(if|else|for|while|switch|case|return|break|continue)\b/g)].length;
}

function lineCount(body: string): number {
  return body.split("\n").filter((line) => line.trim().length > 0).length;
}

export async function writeFunctionBodyComparisonReport(): Promise<void> {
  const report = await readJson<FunctionBodyComparisonReport>(path.join(generatedRoot, "phase-03-function-body-comparison.json"));
  const lines = [
    "# Comparaison fonction par fonction Phase 03",
    "",
    "Comparaison outillee des corps de fonctions C actifs avec les corps TS de meme nom dans les cibles rattachees. Le statut `matched-name-needs-behavior-review` signifie que la lecture comportementale reste a faire.",
    "",
    "## Resume",
    "",
    `- Fonctions source C actives : ${report.summary.sourceFunctions}`,
    `- Fonctions avec corps TS de meme nom : ${report.summary.functionsWithTsBody}`,
    `- Fonctions sans corps TS trouve : ${report.summary.missingTsBody}`,
    `- Fonctions sans cible TS : ${report.summary.noTsTarget}`,
    "",
    "## Comparaisons",
    "",
    "| Source | Fonction | Statut | TS matches | Notes | Findings |",
    "| --- | --- | --- | --- | --- | --- |",
    ...report.comparisons.map((comparison) =>
      `| ${comparison.sourcePath}:${comparison.sourceLine} | ${comparison.sourceFunction} | ${comparison.status} | ${comparison.tsMatches.map((match) => `${match.file}:${match.line} calls ${match.commonCallCount}/${match.sourceCallCount} branches ${match.tsBranchCount}/${match.sourceBranchCount}`).join("<br>")} | ${comparison.tsMatches.flatMap((match) => match.notes).join("<br>")} | ${comparison.findings.join("<br>")} |`,
    ),
    "",
  ];
  await writeFile(path.join(generatedRoot, "phase-03-function-body-comparison-report.md"), `${lines.join("\n")}\n`, "utf8");
}

export async function runFunctionBodyComparison(): Promise<void> {
  await writeJson(path.join(generatedRoot, "phase-03-function-body-comparison.json"), await buildFunctionBodyComparison());
  await writeFunctionBodyComparisonReport();
}

export async function buildRuntimeRootReachability(): Promise<RuntimeReachabilityReport> {
  const [roots, cIndex, tsIndex, cGraph, tsGraph] = await Promise.all([
    readJson<RootTrace[]>(path.join(generatedRoot, "phase-03-runtime-roots.json")),
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-c-symbol-index.json")),
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-ts-symbol-index.json")),
    readJson<CallGraphEdge[]>(path.join(generatedRoot, "phase-03-callgraph-c.json")),
    readJson<CallGraphEdge[]>(path.join(generatedRoot, "phase-03-callgraph-ts.json")),
  ]);
  const cFunctions = cIndex.files.flatMap((file) => file.symbols.filter((symbol) => symbol.kind === "function"));
  const tsFunctions = tsIndex.files.flatMap((file) => file.symbols.filter((symbol) => symbol.kind === "function"));
  const cFunctionByName = symbolsByNormalizedName(cFunctions);
  const tsFunctionByName = symbolsByNormalizedName(tsFunctions);
  const cAdjacency = adjacencyByCaller(cGraph);
  const tsAdjacency = adjacencyByCaller(tsGraph);
  const cReachableFromAnyRoot = new Set<string>();
  const tsReachableFromAnyRoot = new Set<string>();

  const rootReports = roots.map((root) => {
    const cStarts = root.cMatches.filter((symbol) => symbol.kind === "function").map((symbol) => symbol.name);
    const tsStarts = root.tsMatches.filter((symbol) => symbol.kind === "function").map((symbol) => symbol.name);
    const cReachable = traverseNames(cStarts, cAdjacency);
    const tsReachable = traverseNames(tsStarts, tsAdjacency);
    for (const name of cReachable) cReachableFromAnyRoot.add(name);
    for (const name of tsReachable) tsReachableFromAnyRoot.add(name);

    const cReachableFiles = filesForReachableNames(cReachable, cFunctionByName);
    const tsReachableFiles = filesForReachableNames(tsReachable, tsFunctionByName);
    const cNormalized = new Set([...cReachable].map(normalizeSymbolName));
    const tsNormalized = new Set([...tsReachable].map(normalizeSymbolName));
    const sourceOnly = [...cReachable].filter((name) => !tsNormalized.has(normalizeSymbolName(name))).sort();
    const tsOnly = [...tsReachable].filter((name) => !cNormalized.has(normalizeSymbolName(name))).sort();
    const findings: string[] = [];
    if (cStarts.length === 0) findings.push("missing-c-root-symbol");
    if (tsStarts.length === 0) findings.push("missing-ts-root-symbol");
    if (cStarts.length > 0 && cReachable.size <= cStarts.length) findings.push("c-root-has-no-extracted-outgoing-calls");
    if (tsStarts.length > 0 && tsReachable.size <= tsStarts.length) findings.push("ts-root-has-no-extracted-outgoing-calls");
    if (sourceOnly.length > 0) findings.push(`source-only-reachable-functions:${sourceOnly.length}`);
    if (tsOnly.length > 0) findings.push(`ts-only-reachable-functions:${tsOnly.length}`);

    return {
      root: root.root,
      cEntrySymbols: root.cMatches,
      tsEntrySymbols: root.tsMatches,
      cReachableFunctionCount: cReachable.size,
      tsReachableFunctionCount: tsReachable.size,
      cReachableFileCount: cReachableFiles.size,
      tsReachableFileCount: tsReachableFiles.size,
      sourceOnlyReachableFunctionCount: sourceOnly.length,
      tsOnlyReachableFunctionCount: tsOnly.length,
      sourceOnlyReachableFunctionSample: sourceOnly.slice(0, 80),
      tsOnlyReachableFunctionSample: tsOnly.slice(0, 80),
      status: classifyRootReachability(cStarts.length, tsStarts.length, cReachable.size, tsReachable.size),
      findings,
    };
  });

  const cUnreachable = cFunctions.filter((symbol) => !cReachableFromAnyRoot.has(symbol.name));
  const tsUnreachable = tsFunctions.filter((symbol) => !tsReachableFromAnyRoot.has(symbol.name));
  return {
    generatedBy: "phase-03-runtime-root-reachability",
    generatedAt: new Date().toISOString(),
    sourceInputs: {
      runtimeRoots: "phase-03-runtime-roots.json",
      cSymbolIndex: "phase-03-c-symbol-index.json",
      tsSymbolIndex: "phase-03-ts-symbol-index.json",
      cCallgraph: "phase-03-callgraph-c.json",
      tsCallgraph: "phase-03-callgraph-ts.json",
    },
    summary: {
      roots: rootReports.length,
      tracedRoots: rootReports.filter((root) => root.status === "traced-c-and-ts").length,
      rootsWithFindings: rootReports.filter((root) => root.findings.length > 0).length,
      cCallgraphEdges: cGraph.length,
      tsCallgraphEdges: tsGraph.length,
      cReachableFunctionsFromAnyRoot: cReachableFromAnyRoot.size,
      tsReachableFunctionsFromAnyRoot: tsReachableFromAnyRoot.size,
      cUnreachableFunctions: cUnreachable.length,
      tsUnreachableFunctions: tsUnreachable.length,
    },
    roots: rootReports,
    unreachable: {
      cFunctions: cUnreachable,
      tsFunctions: tsUnreachable,
    },
  };
}

function adjacencyByCaller(edges: CallGraphEdge[]): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  for (const edge of edges) {
    const bucket = adjacency.get(edge.caller) ?? new Set<string>();
    bucket.add(edge.callee);
    adjacency.set(edge.caller, bucket);
  }
  return adjacency;
}

function traverseNames(starts: string[], adjacency: Map<string, Set<string>>): Set<string> {
  const reachable = new Set<string>();
  const stack = [...starts];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || reachable.has(current)) continue;
    reachable.add(current);
    for (const next of adjacency.get(current) ?? []) {
      if (!reachable.has(next)) stack.push(next);
    }
  }
  return reachable;
}

function normalizeSymbolName(name: string): string {
  return name.toLowerCase();
}

function symbolsByNormalizedName(symbols: SymbolEntry[]): Map<string, SymbolEntry[]> {
  const byName = new Map<string, SymbolEntry[]>();
  for (const symbol of symbols) {
    const key = normalizeSymbolName(symbol.name);
    const bucket = byName.get(key) ?? [];
    bucket.push(symbol);
    byName.set(key, bucket);
  }
  return byName;
}

function filesForReachableNames(reachable: Set<string>, symbolsByName: Map<string, SymbolEntry[]>): Set<string> {
  const files = new Set<string>();
  for (const name of reachable) {
    for (const symbol of symbolsByName.get(normalizeSymbolName(name)) ?? []) {
      files.add(symbol.file);
    }
  }
  return files;
}

function classifyRootReachability(
  cStartCount: number,
  tsStartCount: number,
  cReachableCount: number,
  tsReachableCount: number,
): RuntimeRootReachability["status"] {
  if (cStartCount === 0 && tsStartCount === 0) return "missing-root";
  if (cStartCount === 0) return "missing-c-root";
  if (tsStartCount === 0) return "missing-ts-root";
  if (cReachableCount <= cStartCount) return "blocked-no-c-calls";
  if (tsReachableCount <= tsStartCount) return "blocked-no-ts-calls";
  return "traced-c-and-ts";
}

export async function writeRuntimeRootsReport(): Promise<void> {
  const report = await readJson<RuntimeReachabilityReport>(path.join(generatedRoot, "phase-03-runtime-root-reachability.json"));
  const lines = [
    "# Rapport racines runtime Phase 03.C",
    "",
    "Ce rapport est genere depuis les index de symboles et graphes d'appels Phase 03. Il etablit une atteignabilite statique indicative, a verifier ensuite manuellement sur les chemins critiques.",
    "",
    "## Resume",
    "",
    `- Racines analysees : ${report.summary.roots}`,
    `- Racines tracees C et TS : ${report.summary.tracedRoots}`,
    `- Racines avec findings : ${report.summary.rootsWithFindings}`,
    `- Aretes callgraph C : ${report.summary.cCallgraphEdges}`,
    `- Aretes callgraph TS : ${report.summary.tsCallgraphEdges}`,
    `- Fonctions C atteignables depuis au moins une racine : ${report.summary.cReachableFunctionsFromAnyRoot}`,
    `- Fonctions TS atteignables depuis au moins une racine : ${report.summary.tsReachableFunctionsFromAnyRoot}`,
    `- Fonctions C non atteintes par ces racines : ${report.summary.cUnreachableFunctions}`,
    `- Fonctions TS non atteintes par ces racines : ${report.summary.tsUnreachableFunctions}`,
    "",
    "## Racines",
    "",
    "| Racine | Statut | C atteignables | TS atteignables | Fichiers C | Fichiers TS | Source-only | TS-only | Findings |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...report.roots.map((root) =>
      [
        root.root,
        root.status,
        String(root.cReachableFunctionCount),
        String(root.tsReachableFunctionCount),
        String(root.cReachableFileCount),
        String(root.tsReachableFileCount),
        String(root.sourceOnlyReachableFunctionCount),
        String(root.tsOnlyReachableFunctionCount),
        root.findings.join("<br>"),
      ].join(" | "),
    ).map((row) => `| ${row} |`),
    "",
    "## Echantillons Source-only",
    "",
    ...report.roots.flatMap((root) => [
      `### ${root.root}`,
      "",
      root.sourceOnlyReachableFunctionSample.length > 0 ? root.sourceOnlyReachableFunctionSample.join(", ") : "Aucun echantillon.",
      "",
    ]),
  ];
  await writeFile(path.join(generatedRoot, "phase-03-runtime-roots-report.md"), `${lines.join("\n")}\n`, "utf8");
}

export async function runPhase03C(): Promise<void> {
  await writeJson(path.join(generatedRoot, "phase-03-runtime-roots.json"), await buildRuntimeRootIndex());
  await writeJson(path.join(generatedRoot, "phase-03-callgraph-c.json"), await buildCallGraph("c"));
  await writeJson(path.join(generatedRoot, "phase-03-callgraph-ts.json"), await buildCallGraph("ts"));
  const reachability = await buildRuntimeRootReachability();
  await writeJson(path.join(generatedRoot, "phase-03-runtime-root-reachability.json"), reachability);
  await writeJson(path.join(generatedRoot, "phase-03-runtime-unreachable-functions.json"), reachability.unreachable);
  await writeRuntimeRootsReport();
}

function nthLineOffset(text: string, line: number): number {
  if (line <= 1) return 0;
  let offset = 0;
  for (let current = 1; current < line; current += 1) {
    const next = text.indexOf("\n", offset);
    if (next === -1) return text.length;
    offset = next + 1;
  }
  return offset;
}

export async function buildTestLinks(): Promise<TestLink[]> {
  const runtimeEntries = await loadRuntimeEntries();
  const packageJson = await readJson<{ scripts?: Record<string, string> }>(path.join(repoRoot, "package.json"));
  const scriptEntries = Object.entries(packageJson.scripts ?? {}).filter(([name]) => name.startsWith("verify:"));
  const verifyFiles = await walkFiles(path.join(repoRoot, "scripts", "verify"), (filePath) => filePath.endsWith(".ts") || filePath.endsWith(".mjs"));

  return runtimeEntries.map((entry) => {
    const stems = new Set([
      entry.sourceBasename,
      entry.sourceBasename.replaceAll("_", "-"),
      ...entry.declaredTsTargets.map((target) => path.posix.basename(target, path.posix.extname(target))),
    ]);
    const tests = verifyFiles
      .map((filePath) => toRepoPath(filePath))
      .filter((test) => {
        const testStem = path.posix.basename(test, path.posix.extname(test)).replace(/^quake2-/, "");
        return [...stems].some((stem) => testStem === stem || testStem.startsWith(`${stem}-`) || testStem.includes(`-${stem}-`));
      })
      .sort();
    const npmScripts = scriptEntries
      .filter(([, command]) => tests.some((test) => command.includes(path.posix.basename(test))))
      .map(([name]) => name)
      .sort();
    return { file: entry.sourcePath, tests, npmScripts };
  });
}

export async function buildSymbolAwareTestLinks(): Promise<TestLink[]> {
  const [runtimeEntries, cIndex, tsIndex] = await Promise.all([
    loadRuntimeEntries(),
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-c-symbol-index.json")),
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-ts-symbol-index.json")),
  ]);
  const packageJson = await readJson<{ scripts?: Record<string, string> }>(path.join(repoRoot, "package.json"));
  const scriptEntries = Object.entries(packageJson.scripts ?? {}).filter(([name]) => name.startsWith("verify:"));
  const verifyFiles = await walkFiles(path.join(repoRoot, "scripts", "verify"), (filePath) => filePath.endsWith(".ts") || filePath.endsWith(".mjs"));
  const verifyTexts = await Promise.all(verifyFiles.map(async (filePath) => ({ path: toRepoPath(filePath), text: await readFile(filePath, "utf8") })));
  const tsSymbolNames = new Map(tsIndex.files.map((file) => [file.path, file.symbols.map((symbol) => symbol.name)]));

  return runtimeEntries.map((entry) => {
    const names = new Set<string>();
    const cFile = cIndex.files.find((file) => file.path === entry.sourcePath);
    for (const symbol of cFile?.symbols ?? []) names.add(symbol.name);
    for (const target of entry.declaredTsTargets) {
      for (const name of tsSymbolNames.get(target) ?? []) names.add(name);
    }
    const stem = entry.sourceBasename.replaceAll("_", "-");
    const tests = verifyTexts
      .filter((test) => test.path.includes(stem) || [...names].some((name) => name.length > 3 && test.text.includes(name)))
      .map((test) => test.path)
      .sort();
    const npmScripts = scriptEntries
      .filter(([, command]) => tests.some((test) => command.includes(path.posix.basename(test))))
      .map(([name]) => name)
      .sort();
    return { file: entry.sourcePath, tests, npmScripts };
  });
}

export async function buildCoverageMatrixSeed(): Promise<CoverageMatrixRow[]> {
  const [runtimeEntries, cIndex, parity, testLinks] = await Promise.all([
    loadRuntimeEntries(),
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-c-symbol-index.json")),
    readJson<ParityEntry[]>(path.join(generatedRoot, "phase-03-symbol-parity.json")),
    readJson<TestLink[]>(path.join(generatedRoot, "phase-03-test-links.json")),
  ]);
  const runtimeBySource = new Map(runtimeEntries.map((entry) => [entry.sourcePath, entry]));
  const parityByKey = new Map(parity.map((entry) => [`${entry.sourcePath}::${entry.sourceSymbol}::${entry.kind}`, entry]));
  const testsByFile = new Map(testLinks.map((entry) => [entry.file, entry.tests]));
  const npmScriptsByFile = new Map(testLinks.map((entry) => [entry.file, entry.npmScripts]));
  const rows: CoverageMatrixRow[] = [];
  for (const file of cIndex.files) {
    const runtime = runtimeBySource.get(file.path);
    if (!runtime) continue;
    for (const symbol of file.symbols) {
      const parityEntry = parityByKey.get(`${file.path}::${symbol.name}::${symbol.kind}`);
      const tsMatch = parityEntry?.tsSymbolMatches[0] ?? null;
      const findings = [...(runtime.findings ?? []), ...(parityEntry?.findings ?? [])];
      if (parityEntry?.status === "missing-symbol") findings.push("missing-ts-symbol");
      rows.push({
        sourcePath: file.path,
        sourceSymbol: symbol.name,
        symbolKind: symbol.kind,
        primaryTsTarget: runtime.declaredPrimaryTsTarget,
        declaredTsTargets: runtime.declaredTsTargets,
        tsSymbol: tsMatch?.symbol ?? null,
        tsSymbolMatches: parityEntry?.tsSymbolMatches ?? [],
        structuralStatus: runtime.structuralStatus,
        phase03BehaviorStatus: "not-audited",
        linkedTests: testsByFile.get(file.path) ?? [],
        linkedNpmScripts: npmScriptsByFile.get(file.path) ?? [],
        findings,
        provisionalVerdict:
          runtime.structuralStatus !== "strict-ok" && runtime.structuralStatus !== "split-ok"
            ? "A redecouper"
            : tsMatch
              ? "A tester"
              : "Partiel",
      });
    }
  }
  return rows;
}

export async function buildCoverageMatrix(): Promise<RuntimeCoverageMatrix> {
  const [runtimeEntries, cIndex, rows] = await Promise.all([
    loadRuntimeEntries(),
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-c-symbol-index.json")),
    buildCoverageMatrixSeed(),
  ]);
  const rowsByFile = countBy(rows.map((row) => row.sourcePath));
  const cFileFindings = new Map(cIndex.files.map((file) => [file.path, file.findings]));
  const filesWithoutMatrixRows = runtimeEntries
    .filter((entry) => (rowsByFile.get(entry.sourcePath) ?? 0) === 0)
    .map((entry) => ({
      sourcePath: entry.sourcePath,
      reason: "no-source-symbol-row-generated",
      findings: [...(entry.findings ?? []), ...(cFileFindings.get(entry.sourcePath) ?? [])],
    }));
  const sourceSymbols = cIndex.files.reduce((sum, file) => sum + file.symbols.length, 0);
  return {
    generatedBy: "P03-TOOL-06-coverage-matrix-generator",
    generatedAt: new Date().toISOString(),
    sourceInputs: {
      runtimeFiles: "phase-03-runtime-files.json",
      cSymbolIndex: "phase-03-c-symbol-index.json",
      tsSymbolIndex: "phase-03-ts-symbol-index.json",
      symbolParity: "phase-03-symbol-parity.json",
      testLinks: "phase-03-test-links.json",
    },
    summary: {
      runtimeFiles: runtimeEntries.length,
      filesWithMatrixRows: rowsByFile.size,
      filesWithoutMatrixRows: filesWithoutMatrixRows.length,
      sourceSymbols,
      rows: rows.length,
      rowsWithTsSymbol: rows.filter((row) => row.tsSymbol !== null).length,
      rowsWithoutTsSymbol: rows.filter((row) => row.tsSymbol === null).length,
      rowsWithLinkedTests: rows.filter((row) => row.linkedTests.length > 0).length,
      rowsWithFindings: rows.filter((row) => row.findings.length > 0).length,
      provisionalVerdicts: Object.fromEntries(countBy(rows.map((row) => row.provisionalVerdict))),
      structuralStatuses: Object.fromEntries(countBy(rows.map((row) => row.structuralStatus))),
    },
    filesWithoutMatrixRows,
    rows,
  };
}

export async function buildAuditSkeletons(): Promise<void> {
  const [runtimeEntries, cIndex] = await Promise.all([
    loadRuntimeEntries(),
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-c-symbol-index.json")),
  ]);
  const skeletonRoot = path.join(generatedRoot, "audit-skeletons");
  await mkdir(skeletonRoot, { recursive: true });
  for (const entry of runtimeEntries) {
    const fileIndex = cIndex.files.find((file) => file.path === entry.sourcePath);
    const lines = [
      `# Inventaire runtime Phase 03 - ${entry.sourcePath}`,
      "",
      "## Rattachement Phase 02",
      "",
      `- Statut structurel : ${entry.structuralStatus}`,
      `- Cible TS principale : ${entry.declaredPrimaryTsTarget ?? ""}`,
      `- Cibles TS declarees : ${entry.declaredTsTargets.join(", ")}`,
      "",
      "## Symboles source",
      "",
      "| Type | Symbole | Ligne | Statut Phase 03 | Notes |",
      "| --- | --- | --- | --- | --- |",
      ...((fileIndex?.symbols ?? []).map((symbol) => `| ${symbol.kind} | ${symbol.name} | ${symbol.line} | a-auditer | |`)),
      "",
      "## Atteignabilite",
      "",
      "- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.",
      "",
      "## Tables declaratives",
      "",
      "- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.",
      "",
      "## Tests ou harnais",
      "",
      "- A lier via `phase-03-test-links.json` puis verifier manuellement.",
      "",
      "## Verdict",
      "",
      "- Verdict provisoire : A tester",
      "- Justification :",
      "",
    ];
    const fileName = entry.sourcePath.replace(/^Quake-2-master\//, "").replace(/[/.]/g, "_");
    await writeFile(path.join(skeletonRoot, `${fileName}.md`), `${lines.join("\n")}\n`, "utf8");
  }
}

export async function buildRuntimeReport(): Promise<string> {
  const [runtimeEntries, cIndex, tsIndex, parity, roots, tables, matrix, reachability, tableAudit, fileAudits] = await Promise.all([
    loadRuntimeEntries(),
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-c-symbol-index.json")),
    readJson<SymbolIndex>(path.join(generatedRoot, "phase-03-ts-symbol-index.json")),
    readJson<ParityEntry[]>(path.join(generatedRoot, "phase-03-symbol-parity.json")),
    readJson<RootTrace[]>(path.join(generatedRoot, "phase-03-runtime-roots.json")),
    readJson<DeclarativeTable[]>(path.join(generatedRoot, "phase-03-declarative-tables.json")),
    readJson<RuntimeCoverageMatrix>(path.join(generatedRoot, "phase-03-runtime-coverage-matrix.json")),
    readJson<RuntimeReachabilityReport>(path.join(generatedRoot, "phase-03-runtime-root-reachability.json")),
    readJson<DeclarativeTablesAudit>(path.join(generatedRoot, "phase-03-declarative-tables-audit.json")),
    readJson<RuntimeFileAuditReport>(path.join(generatedRoot, "phase-03-runtime-file-audits.json")),
  ]);
  const matrixRows = Array.isArray(matrix) ? matrix.length : matrix.rows.length;
  const redecouper = fileAudits.audits.filter((audit) => audit.verdict === "A redecouper");
  const partial = fileAudits.audits.filter((audit) => audit.verdict === "Partiel");
  const missingTsSymbolFiles = fileAudits.audits.filter((audit) => audit.missingTsSymbolCount > 0);
  const missingTests = fileAudits.audits.filter((audit) => audit.linkedTests.length === 0);
  const adapterFindings = fileAudits.audits.filter((audit) => audit.findings.some((finding) => finding.includes("adapter-target")));
  const rendererOrWebTransfers = fileAudits.audits.filter((audit) =>
    audit.tsTargets.some((target) => target.startsWith("apps/web/") || target.startsWith("packages/renderer-three/") || target.startsWith("packages/platform/")),
  );
  const lines = [
    "# Rapport automatique Phase 03.F",
    "",
    "Ce rapport ferme la passe outillee Phase 03. Il consolide les sous-phases 03.A a 03.E et ne transforme aucun fichier en OK ISO sans audit comportemental cible.",
    "",
    "## Resume",
    "",
    `- Fichiers source runtime retenus : ${runtimeEntries.length}`,
    `- Fichiers avec symboles C/H indexes : ${cIndex.files.length}`,
    `- Fichiers TS runtime indexes : ${tsIndex.files.length}`,
    `- Symboles source indexes : ${cIndex.files.reduce((sum, file) => sum + file.symbols.length, 0)}`,
    `- Symboles TS indexes : ${tsIndex.files.reduce((sum, file) => sum + file.symbols.length, 0)}`,
    `- Lignes de parite symbole C -> TS : ${parity.length}`,
    `- Racines runtime trouvees cote TS : ${roots.filter((root) => root.tsMatches.length > 0).length}/${roots.length}`,
    `- Tables declaratives candidates : ${tables.length}`,
    `- Lignes de matrice de couverture : ${matrixRows}`,
    `- Fichiers audites 03.E : ${fileAudits.summary.files}`,
    `- Verdicts fichier : ${Object.entries(fileAudits.summary.verdicts).map(([verdict, count]) => `${verdict}=${count}`).join(", ")}`,
    `- Categories declaratives obligatoires non extraites : ${tableAudit.summary.requiredCategoriesWithoutExtraction.join(", ") || "aucune"}`,
    "",
    "## Matrice Runtime",
    "",
    `- Lignes avec symbole TS : ${matrix.summary.rowsWithTsSymbol}`,
    `- Lignes sans symbole TS : ${matrix.summary.rowsWithoutTsSymbol}`,
    `- Lignes avec tests lies : ${matrix.summary.rowsWithLinkedTests}`,
    `- Fichiers sans ligne matrice : ${matrix.summary.filesWithoutMatrixRows}`,
    "",
    "## Racines Runtime",
    "",
    "| Racine | Statut | C | TS |",
    "| --- | --- | --- | --- |",
    ...roots.map((root) => `| ${root.root} | ${root.status} | ${root.cMatches.map((match) => `${match.file}:${match.line}`).join("<br>")} | ${root.tsMatches.map((match) => `${match.file}:${match.line}`).join("<br>")} |`),
    "",
    "## Atteignabilite",
    "",
    `- Racines analysees : ${reachability.summary.roots}`,
    `- Racines tracees C et TS : ${reachability.summary.tracedRoots}`,
    `- Racines avec findings : ${reachability.summary.rootsWithFindings}`,
    `- Fonctions C atteignables depuis au moins une racine : ${reachability.summary.cReachableFunctionsFromAnyRoot}`,
    `- Fonctions C non atteintes par ces racines : ${reachability.summary.cUnreachableFunctions}`,
    `- Fonctions TS atteignables depuis au moins une racine : ${reachability.summary.tsReachableFunctionsFromAnyRoot}`,
    `- Fonctions TS non atteintes par ces racines : ${reachability.summary.tsUnreachableFunctions}`,
    "",
    "## Tables Declaratives",
    "",
    `- Tables extraites : ${tableAudit.summary.extractedTables}`,
    `- Tables comparees : ${tableAudit.summary.comparedTables}`,
    `- Tables matched : ${tableAudit.summary.matchedTables}`,
    `- Tables partielles : ${tableAudit.summary.partialTables}`,
    `- Tables sans cible TS : ${tableAudit.summary.missingTargetTables}`,
    `- Categories obligatoires non extraites : ${tableAudit.summary.requiredCategoriesWithoutExtraction.join(", ") || "aucune"}`,
    "",
    "## Verdicts Fichier",
    "",
    "| Verdict | Fichiers |",
    "| --- | --- |",
    ...Object.entries(fileAudits.summary.verdicts).sort().map(([verdict, count]) => `| ${verdict} | ${count} |`),
    "",
    "## Blocages Phase 02",
    "",
    `- Fichiers a redecouper : ${redecouper.length}`,
    "",
    "| Source | TS principale | Findings principaux |",
    "| --- | --- | --- |",
    ...redecouper.slice(0, 80).map((audit) =>
      `| ${audit.sourcePath} | ${audit.primaryTsTarget ?? ""} | ${audit.findings.filter((finding) => finding.includes("phase02") || finding.includes("multiple-declared") || finding.includes("wrong-name") || finding.includes("strict-basename")).slice(0, 8).join("<br>").replaceAll("|", "\\|")} |`,
    ),
    ...(redecouper.length > 80 ? [`| ... | ... | ${redecouper.length - 80} fichiers supplementaires dans phase-03-runtime-file-audits.json |`] : []),
    "",
    "## Restes Runtime",
    "",
    `- Fichiers Partiel : ${partial.length}`,
    `- Fichiers avec symboles TS manquants : ${missingTsSymbolFiles.length}`,
    `- Fichiers sans test lie : ${missingTests.length}`,
    "",
    "| Source | Verdict | TS manquants | Findings |",
    "| --- | --- | --- | --- |",
    ...partial.map((audit) => `| ${audit.sourcePath} | ${audit.verdict} | ${audit.missingTsSymbolCount} | ${audit.findings.slice(0, 10).join("<br>").replaceAll("|", "\\|")} |`),
    "",
    "## Transferts Phase 04/05",
    "",
    "Les integrations web, plateforme et renderer detectees restent des consommateurs/adapters. Elles ne doivent pas masquer les blocages runtime ci-dessus.",
    "",
    `- Fichiers avec cible adapter/platform detectee : ${adapterFindings.length}`,
    `- Fichiers mentionnant apps/web, renderer-three ou platform dans les cibles : ${rendererOrWebTransfers.length}`,
    "",
    "| Source | Cibles concernees | Findings |",
    "| --- | --- | --- |",
    ...rendererOrWebTransfers.slice(0, 60).map((audit) =>
      `| ${audit.sourcePath} | ${audit.tsTargets.filter((target) => target.startsWith("apps/web/") || target.startsWith("packages/renderer-three/") || target.startsWith("packages/platform/")).join("<br>")} | ${audit.findings.filter((finding) => finding.includes("adapter") || finding.includes("target")).slice(0, 8).join("<br>").replaceAll("|", "\\|")} |`,
    ),
    "",
    "## Decision De Fermeture",
    "",
    "- Phase 03 outillee fermee : oui, les sorties relancables 03.A-03.F existent.",
    "- Phase 03 comportementale ISO fermee : non, 124 fichiers restent `A redecouper` par statut structurel Phase 02 et 3 restent `Partiel`.",
    "- Prochaine action recommandee : revenir en Phase 02 pour accepter/documenter les splits legitimes ou corriger les rattachements, puis relancer 03.B-03.F.",
    "",
  ];
  return `${lines.join("\n")}\n`;
}

export async function writeDeclarativeTablesReport(): Promise<void> {
  const auditPath = path.join(generatedRoot, "phase-03-declarative-tables-audit.json");
  let audit: DeclarativeTablesAudit | null = null;
  try {
    audit = await readJson<DeclarativeTablesAudit>(auditPath);
  } catch {
    audit = null;
  }
  const tables = await readJson<DeclarativeTable[]>(path.join(generatedRoot, "phase-03-declarative-tables.json"));
  const lines = [
    "# Rapport tables declaratives Phase 03.D",
    "",
    "Extraction et comparaison statique des tables declaratives critiques. Ce rapport ne remplace pas l'audit comportemental, mais transforme les absences en findings explicites.",
    "",
  ];
  if (audit) {
    lines.push("## Resume", "");
    lines.push(`- Tables extraites : ${audit.summary.extractedTables}`);
    lines.push(`- Tables comparees : ${audit.summary.comparedTables}`);
    lines.push(`- Tables matched : ${audit.summary.matchedTables}`);
    lines.push(`- Tables partielles : ${audit.summary.partialTables}`);
    lines.push(`- Tables sans cible TS : ${audit.summary.missingTargetTables}`);
    lines.push(`- Tables a revoir : ${audit.summary.needsReviewTables}`);
    lines.push(`- Categories obligatoires non extraites : ${audit.summary.requiredCategoriesWithoutExtraction.join(", ") || "aucune"}`);
    lines.push("");
    lines.push("## Comparaison", "");
    lines.push("| Categorie | Source | Table | Statut | TS cible | Entrees | Match | Manquantes | Findings |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const comparison of audit.comparisons) {
      lines.push(
        `| ${comparison.category} | ${comparison.sourceFile}:${comparison.line} | ${comparison.tableName} | ${comparison.status} | ${(comparison.primaryTsTarget ?? "").replaceAll("|", "\\|")} | ${comparison.sourceEntryCount} | ${comparison.matchedEntryCount} | ${comparison.missingEntryCount} | ${comparison.findings.join("<br>")} |`,
      );
    }
    lines.push("");
    lines.push("## Categories obligatoires sans extraction", "");
    if (audit.requiredCategoryFindings.length === 0) {
      lines.push("Aucune.");
    } else {
      for (const finding of audit.requiredCategoryFindings) {
        lines.push(`- ${finding.category}: ${finding.finding}`);
      }
    }
    lines.push("");
  }
  lines.push(
    "## Extraction brute",
    "",
    "| Categorie | Fichier | Ligne | Table | Entrees extraites | Notes |",
    "| --- | --- | --- | --- | --- | --- |",
    ...tables.map((table) => `| ${table.category} | ${table.file} | ${table.line} | ${table.name} | ${table.entries.slice(0, 40).join("<br>").replaceAll("|", "\\|")} | ${table.notes.join("<br>")} |`),
    "",
  );
  await writeFile(path.join(generatedRoot, "phase-03-declarative-tables-report.md"), `${lines.join("\n")}\n`, "utf8");
}

export async function runPhase03D(): Promise<void> {
  await writeJson(path.join(generatedRoot, "phase-03-declarative-tables.json"), await buildDeclarativeTables());
  await writeJson(path.join(generatedRoot, "phase-03-declarative-tables-audit.json"), await buildDeclarativeTablesAudit());
  await writeDeclarativeTablesReport();
}

export async function buildRuntimeFileAudits(): Promise<RuntimeFileAuditReport> {
  const [runtimeEntries, matrix, reachability, tableAudit, testLinks] = await Promise.all([
    loadRuntimeEntries(),
    readJson<RuntimeCoverageMatrix>(path.join(generatedRoot, "phase-03-runtime-coverage-matrix.json")),
    readJson<RuntimeReachabilityReport>(path.join(generatedRoot, "phase-03-runtime-root-reachability.json")),
    readJson<DeclarativeTablesAudit>(path.join(generatedRoot, "phase-03-declarative-tables-audit.json")),
    readJson<TestLink[]>(path.join(generatedRoot, "phase-03-test-links.json")),
  ]);
  const rowsByFile = groupBy(matrix.rows, (row) => row.sourcePath);
  const tablesByFile = groupBy(tableAudit.comparisons, (comparison) => comparison.sourceFile);
  const testsByFile = new Map(testLinks.map((link) => [link.file, link]));
  const unreachableByFile = groupBy(reachability.unreachable.cFunctions, (symbol) => symbol.file);

  const audits = runtimeEntries.map((entry) => {
    const rows = rowsByFile.get(entry.sourcePath) ?? [];
    const tableComparisons = tablesByFile.get(entry.sourcePath) ?? [];
    const testLink = testsByFile.get(entry.sourcePath);
    const structuralStatuses = [...new Set(rows.map((row) => row.structuralStatus))];
    const sourceSymbolCount = rows.length;
    const matchedTsSymbolCount = rows.filter((row) => row.tsSymbol !== null).length;
    const missingTsSymbolCount = rows.filter((row) => row.tsSymbol === null).length;
    const functionRows = rows.filter((row) => row.symbolKind === "function");
    const unreachableFunctionCount = (unreachableByFile.get(entry.sourcePath) ?? []).length;
    const reachableFunctionCount = Math.max(0, functionRows.length - unreachableFunctionCount);
    const declarativeTables = tableComparisons.map((comparison) => ({
      category: comparison.category,
      tableName: comparison.tableName,
      status: comparison.status,
      missingEntries: comparison.missingEntries,
    }));
    const findings = buildRuntimeFileFindings(entry, rows, tableComparisons, reachableFunctionCount, unreachableFunctionCount);
    const evidence = [
      ...(testLink?.tests.length ? [`tests:${testLink.tests.join(",")}`] : []),
      ...(tableComparisons.length ? [`declarative-tables:${tableComparisons.length}`] : []),
      ...(reachableFunctionCount > 0 ? [`reachable-functions:${reachableFunctionCount}`] : []),
      `matrix-rows:${sourceSymbolCount}`,
    ];
    return {
      sourcePath: entry.sourcePath,
      sourceBasename: entry.sourceBasename,
      primaryTsTarget: entry.declaredPrimaryTsTarget,
      tsTargets: entry.declaredTsTargets,
      structuralStatuses,
      sourceSymbolCount,
      matchedTsSymbolCount,
      missingTsSymbolCount,
      linkedTests: testLink?.tests ?? [],
      linkedNpmScripts: testLink?.npmScripts ?? [],
      declarativeTables,
      reachableFunctionCount,
      unreachableFunctionCount,
      verdict: classifyRuntimeFileVerdict(rows, tableComparisons, reachableFunctionCount, findings),
      findings,
      evidence,
    };
  });

  return {
    generatedBy: "phase-03-runtime-file-audit",
    generatedAt: new Date().toISOString(),
    sourceInputs: {
      coverageMatrix: "phase-03-runtime-coverage-matrix.json",
      rootReachability: "phase-03-runtime-root-reachability.json",
      declarativeTablesAudit: "phase-03-declarative-tables-audit.json",
      testLinks: "phase-03-test-links.json",
    },
    summary: {
      files: audits.length,
      verdicts: Object.fromEntries(countBy(audits.map((audit) => audit.verdict))),
      filesWithTests: audits.filter((audit) => audit.linkedTests.length > 0).length,
      filesWithMissingTsSymbols: audits.filter((audit) => audit.missingTsSymbolCount > 0).length,
      filesWithDeclarativeFindings: audits.filter((audit) => audit.declarativeTables.some((table) => table.status !== "matched")).length,
      filesNonBranche: audits.filter((audit) => audit.verdict === "Non branche").length,
    },
    audits,
  };
}

function buildRuntimeFileFindings(
  entry: RuntimeSourceEntry,
  rows: CoverageMatrixRow[],
  tableComparisons: DeclarativeTableComparison[],
  reachableFunctionCount: number,
  unreachableFunctionCount: number,
): string[] {
  const findings = new Set<string>(entry.findings ?? []);
  const structuralStatuses = new Set(rows.map((row) => row.structuralStatus));
  if (rows.length === 0) findings.add("no-runtime-matrix-row");
  for (const status of structuralStatuses) {
    if (status !== "strict-ok" && status !== "split-ok") findings.add(`phase02-structural-status:${status}`);
  }
  const missingTsSymbols = rows.filter((row) => row.tsSymbol === null).length;
  if (missingTsSymbols > 0) findings.add(`missing-ts-symbols:${missingTsSymbols}`);
  if (rows.some((row) => row.linkedTests.length === 0)) findings.add("missing-linked-test-for-some-symbols");
  if (reachableFunctionCount === 0 && unreachableFunctionCount > 0) findings.add("no-function-reached-from-runtime-roots");
  if (unreachableFunctionCount > 0) findings.add(`unreachable-functions:${unreachableFunctionCount}`);
  for (const comparison of tableComparisons) {
    if (comparison.status !== "matched") {
      findings.add(`declarative-table-${comparison.status}:${comparison.tableName}`);
    }
  }
  return [...findings].sort();
}

function classifyRuntimeFileVerdict(
  rows: CoverageMatrixRow[],
  tableComparisons: DeclarativeTableComparison[],
  reachableFunctionCount: number,
  findings: string[],
): RuntimeFileVerdict {
  if (rows.length === 0) return "Partiel";
  const structuralStatuses = new Set(rows.map((row) => row.structuralStatus));
  if ([...structuralStatuses].some((status) => status !== "strict-ok" && status !== "split-ok")) {
    return "A redecouper";
  }
  const functionRows = rows.filter((row) => row.symbolKind === "function");
  if (functionRows.length > 0 && reachableFunctionCount === 0) {
    return "Non branche";
  }
  if (rows.some((row) => row.tsSymbol === null) || tableComparisons.some((comparison) => comparison.status !== "matched")) {
    return "Partiel";
  }
  if (findings.some((finding) => finding.startsWith("missing-linked-test"))) {
    return "A tester";
  }
  return "A tester";
}

function groupBy<T>(values: T[], keyOf: (value: T) => string): Map<string, T[]> {
  const result = new Map<string, T[]>();
  for (const value of values) {
    const key = keyOf(value);
    const bucket = result.get(key) ?? [];
    bucket.push(value);
    result.set(key, bucket);
  }
  return result;
}

export async function writeRuntimeFileAuditReport(): Promise<void> {
  const report = await readJson<RuntimeFileAuditReport>(path.join(generatedRoot, "phase-03-runtime-file-audits.json"));
  const lines = [
    "# Rapport fichier par fichier Phase 03.E",
    "",
    "Cette passe agrege la matrice, les racines, les tables declaratives et les tests connus. Aucun verdict positif ISO n'est emis sans audit comportemental manuel cible.",
    "",
    "## Resume",
    "",
    `- Fichiers audites : ${report.summary.files}`,
    `- Fichiers avec tests lies : ${report.summary.filesWithTests}`,
    `- Fichiers avec symboles TS manquants : ${report.summary.filesWithMissingTsSymbols}`,
    `- Fichiers avec findings de tables declaratives : ${report.summary.filesWithDeclarativeFindings}`,
    `- Fichiers Non branche : ${report.summary.filesNonBranche}`,
    "",
    "## Verdicts",
    "",
    "| Verdict | Fichiers |",
    "| --- | --- |",
    ...Object.entries(report.summary.verdicts).sort().map(([verdict, count]) => `| ${verdict} | ${count} |`),
    "",
    "## Audits",
    "",
    "| Source | Verdict | TS principale | Symboles | TS manquants | Atteints | Non atteints | Tests | Tables | Findings |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...report.audits.map((audit) =>
      `| ${audit.sourcePath} | ${audit.verdict} | ${audit.primaryTsTarget ?? ""} | ${audit.sourceSymbolCount} | ${audit.missingTsSymbolCount} | ${audit.reachableFunctionCount} | ${audit.unreachableFunctionCount} | ${audit.linkedTests.length} | ${audit.declarativeTables.length} | ${audit.findings.slice(0, 12).join("<br>").replaceAll("|", "\\|")} |`,
    ),
    "",
    "## Findings tables declaratives",
    "",
    "| Source | Table | Statut | Manquants |",
    "| --- | --- | --- | --- |",
    ...report.audits.flatMap((audit) =>
      audit.declarativeTables
        .filter((table) => table.status !== "matched")
        .map((table) => `| ${audit.sourcePath} | ${table.tableName} | ${table.status} | ${table.missingEntries.slice(0, 20).join("<br>").replaceAll("|", "\\|")} |`),
    ),
    "",
  ];
  await writeFile(path.join(generatedRoot, "phase-03-runtime-file-audits-report.md"), `${lines.join("\n")}\n`, "utf8");
}

export async function runPhase03E(): Promise<void> {
  await writeJson(path.join(generatedRoot, "phase-03-runtime-file-audits.json"), await buildRuntimeFileAudits());
  await writeRuntimeFileAuditReport();
}

export async function runPhase03A(): Promise<void> {
  await mkdir(generatedRoot, { recursive: true });
  await writeJson(path.join(generatedRoot, "phase-03-runtime-files.json"), await loadRuntimeEntries());
  await writeJson(path.join(generatedRoot, "phase-03-c-symbol-index.json"), await buildCSymbolIndex());
  await writeJson(path.join(generatedRoot, "phase-03-ts-symbol-index.json"), await buildTsSymbolIndex());
  await writeJson(path.join(generatedRoot, "phase-03-symbol-parity.json"), await buildSymbolParity());
  await writeJson(path.join(generatedRoot, "phase-03-runtime-roots.json"), await buildRuntimeRootIndex());
  await writeJson(path.join(generatedRoot, "phase-03-declarative-tables.json"), await buildDeclarativeTables());
  await writeJson(path.join(generatedRoot, "phase-03-declarative-tables-audit.json"), await buildDeclarativeTablesAudit());
  await writeJson(path.join(generatedRoot, "phase-03-callgraph-c.json"), await buildCallGraph("c"));
  await writeJson(path.join(generatedRoot, "phase-03-callgraph-ts.json"), await buildCallGraph("ts"));
  await writeJson(path.join(generatedRoot, "phase-03-test-links.json"), await buildTestLinks());
  await writeJson(path.join(generatedRoot, "phase-03-runtime-coverage-matrix.seed.json"), await buildCoverageMatrixSeed());
  await writeJson(path.join(generatedRoot, "phase-03-runtime-coverage-matrix.json"), await buildCoverageMatrix());
  await buildAuditSkeletons();
  await writeDeclarativeTablesReport();
  await writeFile(path.join(generatedRoot, "phase-03-runtime-coverage-report.md"), await buildRuntimeReport(), "utf8");
}

export function generatedPath(fileName: string): string {
  return path.join(generatedRoot, fileName);
}
