/**
 * File: build-portage-audit-index.ts
 * Purpose: Generate deterministic source/TypeScript indexes for the portage audit.
 *
 * This script does not validate the port.
 * It prepares objective audit inputs so human/LLM review can focus on real decisions.
 */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

type SourceKind = "c" | "h";

interface SourceEntry {
  path: string;
  basename: string;
  extension: SourceKind;
  expectedTsBasename: string;
  expectedTsFile: string;
  symbols: SourceSymbols;
}

interface TsEntry {
  path: string;
  basename: string;
  sourceHeader: string | null;
  hasPortHeader: boolean;
  hasTemporaryMarker: boolean;
  hasStubMarker: boolean;
  symbols: TsSymbols;
}

interface ExpectedMapEntry {
  sourcePath: string;
  expectedTsFile: string;
  matchingTsFiles: string[];
  status: "matched" | "missing" | "multiple";
}

interface SourceSymbols {
  functions: string[];
  macros: string[];
  typedefs: string[];
  structs: string[];
  enums: string[];
  globals: string[];
}

interface TsSymbols {
  functions: string[];
  classes: string[];
  interfaces: string[];
  types: string[];
  enums: string[];
  constants: string[];
}

interface PhaseStructureEntry {
  phase: string;
  hasPlan: boolean;
  hasToolsDir: boolean;
  hasGeneratedDir: boolean;
}

const repoRoot = process.cwd();
const sourceRoot = path.join(repoRoot, "Quake-2-master");
const phasesRoot = path.join(repoRoot, "audit-portage", "phases");
const outputRoot = path.join(repoRoot, "audit-portage", "phases", "phase-00-socle-outillage", "generated");

const sourceExtensions = new Set([".c", ".h"]);
const ignoredDirectoryNames = new Set([
  ".git",
  "node_modules",
]);

const tsScanRoots = [
  path.join(repoRoot, "packages"),
  path.join(repoRoot, "apps"),
];

function toRepoPath(absolutePath: string): string {
  return path.relative(repoRoot, absolutePath).replaceAll(path.sep, "/");
}

async function walkFiles(root: string, predicate: (filePath: string) => boolean): Promise<string[]> {
  const files: string[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (ignoredDirectoryNames.has(entry.name)) {
        continue;
      }

      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
        continue;
      }

      if (entry.isFile() && predicate(entryPath)) {
        files.push(entryPath);
      }
    }
  }

  await walk(root);
  return files.sort((a, b) => toRepoPath(a).localeCompare(toRepoPath(b)));
}

function extractSourceHeader(fileText: string): string | null {
  const match = fileText.match(/^\s*\*\s*Source:\s*(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

function hasMarker(fileText: string, markers: string[]): boolean {
  const lowerText = fileText.toLowerCase();
  return markers.some((marker) => lowerText.includes(marker));
}

function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function collectMatches(text: string, regex: RegExp, groupIndex = 1): string[] {
  const matches: string[] = [];
  for (const match of text.matchAll(regex)) {
    const value = match[groupIndex]?.trim();
    if (value) {
      matches.push(value);
    }
  }
  return uniqueSorted(matches);
}

function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

function extractSourceSymbols(fileText: string, extension: SourceKind): SourceSymbols {
  const text = stripComments(fileText);
  const macros = collectMatches(text, /^\s*#\s*define\s+([A-Za-z_]\w*)/gm);
  const typedefs = collectMatches(text, /^\s*typedef\b[\s\S]*?\b([A-Za-z_]\w*)\s*;/gm);
  const structs = collectMatches(text, /\bstruct\s+([A-Za-z_]\w*)/g);
  const enums = collectMatches(text, /\benum\s+([A-Za-z_]\w*)/g);
  const functions = extension === "c"
    ? collectMatches(text, /^[A-Za-z_][\w\s*]*?\s+([A-Za-z_]\w*)\s*\([^;{}]*\)\s*\{/gm)
      .filter((name) => !["if", "for", "while", "switch"].includes(name))
    : collectMatches(text, /^[A-Za-z_][\w\s*]*?\s+([A-Za-z_]\w*)\s*\([^;{}]*\)\s*;/gm)
      .filter((name) => !["if", "for", "while", "switch"].includes(name));
  const globals = extension === "c"
    ? collectMatches(text, /^(?!\s*(?:static\s+)?(?:if|for|while|switch|return)\b)\s*(?:extern\s+)?[A-Za-z_][\w\s*]*?\s+([A-Za-z_]\w*)\s*(?:=\s*[^;]+)?;/gm)
    : collectMatches(text, /^\s*extern\s+[A-Za-z_][\w\s*]*?\s+([A-Za-z_]\w*)\s*;/gm);

  return { functions, macros, typedefs, structs, enums, globals };
}

function extractTsSymbols(fileText: string): TsSymbols {
  const text = stripComments(fileText);
  return {
    functions: collectMatches(text, /\b(?:export\s+)?function\s+([A-Za-z_]\w*)\s*\(/g),
    classes: collectMatches(text, /\b(?:export\s+)?class\s+([A-Za-z_]\w*)/g),
    interfaces: collectMatches(text, /\b(?:export\s+)?interface\s+([A-Za-z_]\w*)/g),
    types: collectMatches(text, /\b(?:export\s+)?type\s+([A-Za-z_]\w*)\s*=/g),
    enums: collectMatches(text, /\b(?:export\s+)?enum\s+([A-Za-z_]\w*)/g),
    constants: collectMatches(text, /\b(?:export\s+)?(?:const|let|var)\s+([A-Za-z_]\w*)/g),
  };
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await readdir(filePath);
    return true;
  } catch {
    try {
      await readFile(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

async function buildPhaseStructureIndex(): Promise<PhaseStructureEntry[]> {
  const entries = await readdir(phasesRoot, { withFileTypes: true });
  const phases = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const structure: PhaseStructureEntry[] = [];

  for (const phase of phases) {
    const phaseRoot = path.join(phasesRoot, phase);
    structure.push({
      phase,
      hasPlan: await pathExists(path.join(phaseRoot, "PLAN.md")),
      hasToolsDir: await pathExists(path.join(phaseRoot, "tools")),
      hasGeneratedDir: await pathExists(path.join(phaseRoot, "generated")),
    });
  }

  return structure;
}

async function buildSourceIndex(): Promise<SourceEntry[]> {
  const sourceFiles = await walkFiles(sourceRoot, (filePath) => sourceExtensions.has(path.extname(filePath).toLowerCase()));

  const entries: SourceEntry[] = [];
  for (const filePath of sourceFiles) {
    const extension = path.extname(filePath).slice(1).toLowerCase() as SourceKind;
    const basename = path.basename(filePath, path.extname(filePath));
    const text = await readFile(filePath, "utf8");
    entries.push({
      path: toRepoPath(filePath),
      basename,
      extension,
      expectedTsBasename: basename,
      expectedTsFile: `${basename}.ts`,
      symbols: extractSourceSymbols(text, extension),
    });
  }

  return entries;
}

async function buildTsIndex(): Promise<TsEntry[]> {
  const allFiles: string[] = [];
  for (const root of tsScanRoots) {
    const files = await walkFiles(root, (filePath) => path.extname(filePath).toLowerCase() === ".ts");
    allFiles.push(...files);
  }

  const entries: TsEntry[] = [];
  for (const filePath of allFiles.sort((a, b) => toRepoPath(a).localeCompare(toRepoPath(b)))) {
    const text = await readFile(filePath, "utf8");
    entries.push({
      path: toRepoPath(filePath),
      basename: path.basename(filePath, ".ts"),
      sourceHeader: extractSourceHeader(text),
      hasPortHeader: /^\s*\/\*\*[\s\S]*?\bFile:\s*.+$/m.test(text),
      hasTemporaryMarker: hasMarker(text, ["temporary", "temporaire", "todo", "fixme"]),
      hasStubMarker: hasMarker(text, ["not implemented", "stub", "throw new error"]),
      symbols: extractTsSymbols(text),
    });
  }

  return entries;
}

function buildExpectedMap(sourceIndex: SourceEntry[], tsIndex: TsEntry[]): ExpectedMapEntry[] {
  const tsByFileName = new Map<string, TsEntry[]>();
  for (const entry of tsIndex) {
    const fileName = path.posix.basename(entry.path);
    const bucket = tsByFileName.get(fileName) ?? [];
    bucket.push(entry);
    tsByFileName.set(fileName, bucket);
  }

  return sourceIndex.map((source) => {
    const matching = tsByFileName.get(source.expectedTsFile) ?? [];
    return {
      sourcePath: source.path,
      expectedTsFile: source.expectedTsFile,
      matchingTsFiles: matching.map((entry) => entry.path),
      status: matching.length === 0 ? "missing" : matching.length === 1 ? "matched" : "multiple",
    };
  });
}

function buildMarkdownReport(
  sourceIndex: SourceEntry[],
  tsIndex: TsEntry[],
  expectedMap: ExpectedMapEntry[],
  phaseStructure: PhaseStructureEntry[],
): string {
  const missing = expectedMap.filter((entry) => entry.status === "missing");
  const multiple = expectedMap.filter((entry) => entry.status === "multiple");
  const matched = expectedMap.filter((entry) => entry.status === "matched");
  const sourceBasenames = new Set(sourceIndex.map((entry) => entry.basename));
  const orphanTs = tsIndex.filter((entry) => !sourceBasenames.has(entry.basename));
  const tsWithStubMarkers = tsIndex.filter((entry) => entry.hasStubMarker);
  const tsWithTemporaryMarkers = tsIndex.filter((entry) => entry.hasTemporaryMarker);
  const tsWithoutSourceHeader = tsIndex.filter((entry) => entry.hasPortHeader && entry.sourceHeader === null);
  const incompletePhases = phaseStructure.filter((entry) => !entry.hasPlan || !entry.hasToolsDir || !entry.hasGeneratedDir);
  const sourceFunctionCount = sourceIndex.reduce((sum, entry) => sum + entry.symbols.functions.length, 0);
  const sourceMacroCount = sourceIndex.reduce((sum, entry) => sum + entry.symbols.macros.length, 0);
  const sourceTypeCount = sourceIndex.reduce((sum, entry) => sum + entry.symbols.typedefs.length + entry.symbols.structs.length + entry.symbols.enums.length, 0);
  const tsFunctionCount = tsIndex.reduce((sum, entry) => sum + entry.symbols.functions.length, 0);
  const tsTypeCount = tsIndex.reduce((sum, entry) => sum + entry.symbols.classes.length + entry.symbols.interfaces.length + entry.symbols.types.length + entry.symbols.enums.length, 0);

  const lines: string[] = [];
  lines.push("# Rapport automatique Phase 00");
  lines.push("");
  lines.push("Ce rapport est genere automatiquement par `npm run audit:socle`.");
  lines.push("Il ne valide aucun fichier ; il signale les points a examiner.");
  lines.push("");
  lines.push("## Resume");
  lines.push("");
  lines.push(`- Sources C/H indexees : ${sourceIndex.length}`);
  lines.push(`- Fichiers TS indexes : ${tsIndex.length}`);
  lines.push(`- Correspondances exactes attendues : ${matched.length}`);
  lines.push(`- Sources sans fichier TS identique : ${missing.length}`);
  lines.push(`- Sources avec plusieurs fichiers TS identiques : ${multiple.length}`);
  lines.push(`- Fichiers TS sans basename source identique : ${orphanTs.length}`);
  lines.push(`- Fichiers TS avec marqueurs de stub : ${tsWithStubMarkers.length}`);
  lines.push(`- Fichiers TS avec marqueurs temporaires/TODO : ${tsWithTemporaryMarkers.length}`);
  lines.push(`- Fichiers TS avec header de portage mais sans Source : ${tsWithoutSourceHeader.length}`);
  lines.push(`- Phases avec structure incomplete : ${incompletePhases.length}`);
  lines.push(`- Fonctions C/H extraites : ${sourceFunctionCount}`);
  lines.push(`- Macros C/H extraites : ${sourceMacroCount}`);
  lines.push(`- Types C/H extraits : ${sourceTypeCount}`);
  lines.push(`- Fonctions TS extraites : ${tsFunctionCount}`);
  lines.push(`- Types TS extraits : ${tsTypeCount}`);
  lines.push("");

  appendTable(
    lines,
    "Structure des phases",
    ["Phase", "PLAN.md", "tools/", "generated/"],
    phaseStructure.map((entry) => [
      entry.phase,
      entry.hasPlan ? "oui" : "non",
      entry.hasToolsDir ? "oui" : "non",
      entry.hasGeneratedDir ? "oui" : "non",
    ]),
  );
  appendTable(lines, "Sources sans fichier TS identique", ["Source", "TS attendu"], missing.map((entry) => [entry.sourcePath, entry.expectedTsFile]));
  appendTable(lines, "Sources avec plusieurs fichiers TS identiques", ["Source", "Cibles"], multiple.map((entry) => [entry.sourcePath, entry.matchingTsFiles.join("<br>")]));
  appendTable(lines, "Fichiers TS sans basename source identique", ["TS", "Source header"], orphanTs.map((entry) => [entry.path, entry.sourceHeader ?? ""]));
  appendTable(lines, "Marqueurs de stub", ["TS"], tsWithStubMarkers.map((entry) => [entry.path]));
  appendTable(lines, "Marqueurs temporaires ou TODO", ["TS"], tsWithTemporaryMarkers.map((entry) => [entry.path]));
  appendTable(lines, "Headers de portage sans Source", ["TS"], tsWithoutSourceHeader.map((entry) => [entry.path]));

  return `${lines.join("\n")}\n`;
}

function appendTable(lines: string[], title: string, headers: string[], rows: string[][]): void {
  lines.push(`## ${title}`);
  lines.push("");
  if (rows.length === 0) {
    lines.push("Aucun point detecte.");
    lines.push("");
    return;
  }

  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows.slice(0, 200)) {
    lines.push(`| ${row.map(escapeMarkdownCell).join(" | ")} |`);
  }
  if (rows.length > 200) {
    lines.push(`| ... | ${rows.length - 200} lignes supplementaires non affichees |`);
  }
  lines.push("");
}

function escapeMarkdownCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

async function main(): Promise<void> {
  const phaseStructure = await buildPhaseStructureIndex();
  const sourceIndex = await buildSourceIndex();
  const tsIndex = await buildTsIndex();
  const expectedMap = buildExpectedMap(sourceIndex, tsIndex);
  const report = buildMarkdownReport(sourceIndex, tsIndex, expectedMap, phaseStructure);

  await mkdir(outputRoot, { recursive: true });
  await writeFile(path.join(outputRoot, "source-index.json"), `${JSON.stringify(sourceIndex, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputRoot, "ts-index.json"), `${JSON.stringify(tsIndex, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputRoot, "source-to-ts-expected-map.json"), `${JSON.stringify(expectedMap, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputRoot, "phase-00-structure-report.md"), report, "utf8");

  console.log(`Wrote ${toRepoPath(outputRoot)}/phase-00-structure-report.md`);
}

await main();
