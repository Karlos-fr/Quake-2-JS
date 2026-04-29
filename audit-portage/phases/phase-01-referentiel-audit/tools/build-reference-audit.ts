/**
 * File: build-reference-audit.ts
 * Purpose: Reconcile PORTAGE_QUAKE2.md with phase-00 source and TypeScript indexes.
 *
 * This script implements the phase-01.A toolchain as one orchestrator:
 * - P01-TOOL-01 portage-md-parser
 * - P01-TOOL-02 tracking-vs-source-checker
 * - P01-TOOL-03 tracking-vs-ts-checker
 * - P01-TOOL-04 tracking-vs-expected-map-checker
 * - P01-TOOL-05 multiple-target-detector
 * - P01-TOOL-06 adapter-target-detector
 * - P01-TOOL-07 missing-path-detector
 * - P01-TOOL-08 untracked-file-detector
 * - P01-TOOL-09 reference-table-builder
 * - P01-TOOL-10 reference-report-generator
 *
 * It does not validate the port.
 * It produces a factual reconciliation report for later phase-01 decisions.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

interface SourceEntry {
  path: string;
  basename: string;
  extension: "c" | "h";
  expectedTsBasename: string;
  expectedTsFile: string;
}

interface TsEntry {
  path: string;
  basename: string;
  sourceHeader: string | null;
  hasPortHeader: boolean;
  hasTemporaryMarker: boolean;
  hasStubMarker: boolean;
}

interface ExpectedMapEntry {
  sourcePath: string;
  expectedTsFile: string;
  matchingTsFiles: string[];
  status: "matched" | "missing" | "multiple";
}

type SourceScope =
  | "core-runtime"
  | "renderer-ref-gl"
  | "platform-native"
  | "renderer-soft"
  | "ctf"
  | "assets-or-docs"
  | "unknown";

interface TrackingEntry {
  line: number;
  path: string;
  normalizedPath: string;
  sourcePath: string | null;
  name: string;
  description: string;
  aPorter: string;
  porte: string;
  valide: string;
  cible: string;
  targetPaths: string[];
  tsTargetPaths: string[];
  auditPaths: string[];
  scriptPaths: string[];
}

interface ReferenceEntry {
  sourcePath: string;
  sourceBasename: string;
  extension: "c" | "h";
  scope: SourceScope;
  expectedStatus: "to-port" | "voluntarily-excluded" | "to-clarify";
  trackingEntries: TrackingEntry[];
  declaredTargets: string[];
  declaredTsTargets: string[];
  declaredPrimaryTsTarget: string | null;
  declaredSecondaryTsTargets: string[];
  expectedTsFile: string;
  detectedExactTsTargets: string[];
  declaredTsTargetsExistingInIndex: string[];
  hasHistoricalAudit: boolean;
  testReferences: string[];
  anomalies: string[];
  phase02Hints: string[];
}

interface Phase01Index {
  generatedBy: string;
  generatedAt: string;
  trackingEntries: TrackingEntry[];
  referenceTable: ReferenceEntry[];
  diagnostics: Diagnostics;
}

interface Diagnostics {
  trackingRows: number;
  sourceRows: number;
  tsRows: number;
  trackedSources: number;
  untrackedSources: string[];
  trackingSourcesMissingOnDisk: TrackingEntry[];
  declaredTargetsMissingOnDisk: Array<{ trackingPath: string; targetPath: string; line: number }>;
  tsTargetsMissingFromIndex: Array<{ trackingPath: string; targetPath: string; line: number }>;
  untrackedTsFiles: string[];
  multipleTargetRows: TrackingEntry[];
  adapterTargetRows: TrackingEntry[];
  expectedMapMismatches: ReferenceEntry[];
  duplicateTrackingSources: Array<{ sourcePath: string; lines: number[] }>;
  scopeCounts: Record<SourceScope, number>;
  expectedStatusCounts: Record<ReferenceEntry["expectedStatus"], number>;
  anomalyCounts: Record<string, number>;
  unknownScopeSources: string[];
  factualCorrectionCandidates: Array<{ kind: string; line: number | null; path: string; detail: string }>;
}

const repoRoot = process.cwd();
const phase00Generated = path.join(repoRoot, "audit-portage", "phases", "phase-00-socle-outillage", "generated");
const outputRoot = path.join(repoRoot, "audit-portage", "phases", "phase-01-referentiel-audit", "generated");
const portagePath = path.join(repoRoot, "PORTAGE_QUAKE2.md");

function toRepoPath(absolutePath: string): string {
  return path.relative(repoRoot, absolutePath).replaceAll(path.sep, "/");
}

function normalizeRepoPath(value: string): string {
  return value.trim().replaceAll("\\", "/").replace(/^\.?\//, "");
}

function sourcePathFromTrackingPath(trackingPath: string): string | null {
  const normalized = normalizeRepoPath(trackingPath);
  if (!/\.(c|h)$/i.test(normalized)) {
    return null;
  }
  if (normalized.startsWith("Quake-2-master/")) {
    return normalized;
  }
  return `Quake-2-master/${normalized}`;
}

function classifySourceScope(sourcePath: string): SourceScope {
  const parts = sourcePath.split("/");
  const topLevel = parts[1] ?? "";

  if (["client", "game", "server", "qcommon"].includes(topLevel)) {
    return "core-runtime";
  }
  if (topLevel === "ref_gl") {
    return "renderer-ref-gl";
  }
  if (topLevel === "ref_soft") {
    return "renderer-soft";
  }
  if (topLevel === "ctf") {
    return "ctf";
  }
  if (["win32", "linux", "irix", "solaris", "null", "rhapsody"].includes(topLevel)) {
    return "platform-native";
  }
  if (/\.(txt|md|dsp|dsw|plg|def|rc|ico|cfg)$/i.test(sourcePath)) {
    return "assets-or-docs";
  }

  return "unknown";
}

function isExcludedMarker(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === "⛔" || trimmed === "â›”";
}

function expectedStatusFor(scope: SourceScope, rows: TrackingEntry[]): "to-port" | "voluntarily-excluded" | "to-clarify" {
  if (scope === "unknown") {
    return "to-clarify";
  }
  if (rows.some((row) => isExcludedMarker(row.aPorter) || isExcludedMarker(row.porte))) {
    return "voluntarily-excluded";
  }
  if (["platform-native", "renderer-soft", "ctf", "assets-or-docs"].includes(scope)) {
    return "voluntarily-excluded";
  }
  return "to-port";
}

function uniqueInOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
  }
  return result;
}

function splitMarkdownRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return null;
  }
  if (/^\|\s*-+/.test(trimmed)) {
    return null;
  }
  return trimmed.slice(1, -1).split("|").map((cell) => cell.trim());
}

function splitTargets(cible: string): string[] {
  if (!cible.trim()) {
    return [];
  }

  const candidates = cible
    .split(/,\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const paths: string[] = [];
  for (const candidate of candidates) {
    const match = candidate.match(/(?:^|\s)((?:packages|apps|scripts|Audit|generated|tools)\/[^\s,`]+|(?:packages|apps|scripts|Audit|generated|tools)\\[^\s,`]+)/);
    if (!match?.[1]) {
      continue;
    }
    paths.push(normalizeRepoPath(match[1]).replace(/[.;:]$/, ""));
  }
  return [...new Set(paths)];
}

function isTsRuntimeTarget(targetPath: string): boolean {
  return /\.(ts|tsx|mts|cts)$/i.test(targetPath) && (targetPath.startsWith("packages/") || targetPath.startsWith("apps/"));
}

function isAuditPath(targetPath: string): boolean {
  return targetPath.startsWith("Audit/") && /\.audit\.md$/i.test(targetPath);
}

function isScriptPath(targetPath: string): boolean {
  return targetPath.startsWith("scripts/") && /\.(ts|js|mjs|cjs)$/i.test(targetPath);
}

function parsePortageMarkdown(markdown: string): TrackingEntry[] {
  const entries: TrackingEntry[] = [];
  const lines = markdown.split(/\r?\n/);
  let inMainTable = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const cells = splitMarkdownRow(line);
    if (!cells) {
      continue;
    }

    if (cells[0] === "Path" && cells[1] === "Nom") {
      inMainTable = true;
      continue;
    }

    if (!inMainTable || cells.length < 7) {
      continue;
    }

    const [rawPath, name, description, aPorter, porte, valide, cible] = cells;
    const normalizedPath = normalizeRepoPath(rawPath);
    const targetPaths = splitTargets(cible);
    entries.push({
      line: index + 1,
      path: rawPath,
      normalizedPath,
      sourcePath: sourcePathFromTrackingPath(normalizedPath),
      name,
      description,
      aPorter,
      porte,
      valide,
      cible,
      targetPaths,
      tsTargetPaths: targetPaths.filter(isTsRuntimeTarget),
      auditPaths: targetPaths.filter(isAuditPath),
      scriptPaths: targetPaths.filter(isScriptPath),
    });
  }

  return entries;
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function fileExists(repoPath: string): Promise<boolean> {
  try {
    await readFile(path.join(repoRoot, repoPath));
    return true;
  } catch {
    return false;
  }
}

function buildReferenceTable(
  sourceIndex: SourceEntry[],
  tsIndex: TsEntry[],
  expectedMap: ExpectedMapEntry[],
  trackingEntries: TrackingEntry[],
): ReferenceEntry[] {
  const trackingBySource = new Map<string, TrackingEntry[]>();
  for (const entry of trackingEntries) {
    if (!entry.sourcePath) {
      continue;
    }
    const bucket = trackingBySource.get(entry.sourcePath) ?? [];
    bucket.push(entry);
    trackingBySource.set(entry.sourcePath, bucket);
  }

  const expectedBySource = new Map(expectedMap.map((entry) => [entry.sourcePath, entry]));
  const tsPaths = new Set(tsIndex.map((entry) => entry.path));

  return sourceIndex.map((source) => {
    const rows = trackingBySource.get(source.path) ?? [];
    const scope = classifySourceScope(source.path);
    const expectedStatus = expectedStatusFor(scope, rows);
    const declaredTargets = uniqueInOrder(rows.flatMap((row) => row.targetPaths));
    const declaredTsTargets = uniqueInOrder(rows.flatMap((row) => row.tsTargetPaths));
    const declaredPrimaryTsTarget = declaredTsTargets[0] ?? null;
    const declaredSecondaryTsTargets = declaredTsTargets.slice(1);
    const declaredTsTargetsExistingInIndex = declaredTsTargets.filter((targetPath) => tsPaths.has(targetPath));
    const exactMap = expectedBySource.get(source.path);
    const anomalies: string[] = [];
    const phase02Hints: string[] = [];

    if (rows.length === 0) {
      anomalies.push("source-untracked");
    }
    if (rows.length > 1) {
      anomalies.push("duplicate-tracking-source");
    }
    if (declaredTsTargets.length === 0 && expectedStatus === "to-port") {
      anomalies.push("no-declared-ts-target");
    }
    if (declaredTsTargets.length > 1) {
      anomalies.push("multiple-declared-ts-targets");
      phase02Hints.push("multiple-targets-to-review");
    }
    if (exactMap?.status === "missing") {
      anomalies.push("strict-basename-target-missing");
      phase02Hints.push("strict-basename-map-missing");
    }
    if (exactMap?.status === "multiple") {
      anomalies.push("strict-basename-target-multiple");
      phase02Hints.push("basename-collision-or-duplicate");
    }
    if (declaredTsTargets.some((target) => target.startsWith("apps/web/") || target.startsWith("packages/platform/"))) {
      anomalies.push("adapter-target-declared");
      phase02Hints.push("adapter-boundary-review");
    }
    if (declaredTsTargets.length > 0 && !declaredTsTargets.some((target) => path.posix.basename(target) === source.expectedTsFile)) {
      anomalies.push("declared-target-not-strict-basename");
      phase02Hints.push("naming-or-split-decision");
    }

    return {
      sourcePath: source.path,
      sourceBasename: source.basename,
      extension: source.extension,
      scope,
      expectedStatus,
      trackingEntries: rows,
      declaredTargets,
      declaredTsTargets,
      declaredPrimaryTsTarget,
      declaredSecondaryTsTargets,
      expectedTsFile: source.expectedTsFile,
      detectedExactTsTargets: exactMap?.matchingTsFiles ?? [],
      declaredTsTargetsExistingInIndex,
      hasHistoricalAudit: rows.some((row) => row.auditPaths.length > 0),
      testReferences: [...new Set(rows.flatMap((row) => row.scriptPaths))].sort(),
      anomalies,
      phase02Hints: [...new Set(phase02Hints)].sort(),
    };
  });
}

async function buildDiagnostics(
  sourceIndex: SourceEntry[],
  tsIndex: TsEntry[],
  trackingEntries: TrackingEntry[],
  referenceTable: ReferenceEntry[],
): Promise<Diagnostics> {
  const sourcePaths = new Set(sourceIndex.map((entry) => entry.path));
  const tsPaths = new Set(tsIndex.map((entry) => entry.path));
  const trackingSourceEntries = trackingEntries.filter((entry) => entry.sourcePath !== null);
  const trackedSourcePaths = new Set(trackingSourceEntries.map((entry) => entry.sourcePath as string));
  const trackedTsPaths = new Set(trackingEntries.flatMap((entry) => entry.tsTargetPaths));
  const duplicateGroups = new Map<string, number[]>();
  const scopeCounts = {
    "core-runtime": 0,
    "renderer-ref-gl": 0,
    "platform-native": 0,
    "renderer-soft": 0,
    ctf: 0,
    "assets-or-docs": 0,
    unknown: 0,
  } satisfies Record<SourceScope, number>;
  const expectedStatusCounts = {
    "to-port": 0,
    "voluntarily-excluded": 0,
    "to-clarify": 0,
  } satisfies Record<ReferenceEntry["expectedStatus"], number>;
  const anomalyCounts: Record<string, number> = {};

  for (const entry of referenceTable) {
    scopeCounts[entry.scope] += 1;
    expectedStatusCounts[entry.expectedStatus] += 1;
    for (const anomaly of entry.anomalies) {
      anomalyCounts[anomaly] = (anomalyCounts[anomaly] ?? 0) + 1;
    }
  }

  for (const entry of trackingSourceEntries) {
    const sourcePath = entry.sourcePath as string;
    const lines = duplicateGroups.get(sourcePath) ?? [];
    lines.push(entry.line);
    duplicateGroups.set(sourcePath, lines);
  }

  const declaredTargetsMissingOnDisk: Array<{ trackingPath: string; targetPath: string; line: number }> = [];
  const tsTargetsMissingFromIndex: Array<{ trackingPath: string; targetPath: string; line: number }> = [];
  for (const entry of trackingEntries) {
    for (const targetPath of entry.targetPaths) {
      if (!(await fileExists(targetPath))) {
        declaredTargetsMissingOnDisk.push({ trackingPath: entry.normalizedPath, targetPath, line: entry.line });
      }
    }
    for (const targetPath of entry.tsTargetPaths) {
      if (!tsPaths.has(targetPath)) {
        tsTargetsMissingFromIndex.push({ trackingPath: entry.normalizedPath, targetPath, line: entry.line });
      }
    }
  }

  const factualCorrectionCandidates = [
    ...trackingSourceEntries
      .filter((entry) => entry.sourcePath !== null && !sourcePaths.has(entry.sourcePath))
      .map((entry) => ({
        kind: "tracking-source-missing-on-disk",
        line: entry.line,
        path: entry.normalizedPath,
        detail: entry.sourcePath ?? "",
      })),
    ...declaredTargetsMissingOnDisk.map((entry) => ({
      kind: "declared-target-missing-on-disk",
      line: entry.line,
      path: entry.trackingPath,
      detail: entry.targetPath,
    })),
    ...[...duplicateGroups.entries()]
      .filter(([, lines]) => lines.length > 1)
      .map(([sourcePath, lines]) => ({
        kind: "duplicate-tracking-source",
        line: null,
        path: sourcePath,
        detail: `lines ${lines.join(", ")}`,
      })),
  ];

  return {
    trackingRows: trackingEntries.length,
    sourceRows: sourceIndex.length,
    tsRows: tsIndex.length,
    trackedSources: [...trackedSourcePaths].filter((sourcePath) => sourcePaths.has(sourcePath)).length,
    untrackedSources: sourceIndex.map((entry) => entry.path).filter((sourcePath) => !trackedSourcePaths.has(sourcePath)).sort(),
    trackingSourcesMissingOnDisk: trackingSourceEntries.filter((entry) => entry.sourcePath !== null && !sourcePaths.has(entry.sourcePath)),
    declaredTargetsMissingOnDisk,
    tsTargetsMissingFromIndex,
    untrackedTsFiles: tsIndex.map((entry) => entry.path).filter((tsPath) => !trackedTsPaths.has(tsPath)).sort(),
    multipleTargetRows: trackingEntries.filter((entry) => entry.tsTargetPaths.length > 1),
    adapterTargetRows: trackingEntries.filter((entry) => entry.tsTargetPaths.some((target) => target.startsWith("apps/web/") || target.startsWith("packages/platform/"))),
    expectedMapMismatches: referenceTable.filter((entry) => entry.anomalies.includes("declared-target-not-strict-basename")),
    duplicateTrackingSources: [...duplicateGroups.entries()]
      .filter(([, lines]) => lines.length > 1)
      .map(([sourcePath, lines]) => ({ sourcePath, lines })),
    scopeCounts,
    expectedStatusCounts,
    anomalyCounts,
    unknownScopeSources: referenceTable.filter((entry) => entry.scope === "unknown").map((entry) => entry.sourcePath).sort(),
    factualCorrectionCandidates,
  };
}

function appendTable(lines: string[], title: string, headers: string[], rows: string[][], limit = 100): void {
  lines.push(`## ${title}`);
  lines.push("");
  if (rows.length === 0) {
    lines.push("Aucun point detecte.");
    lines.push("");
    return;
  }

  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows.slice(0, limit)) {
    lines.push(`| ${row.map(escapeMarkdownCell).join(" | ")} |`);
  }
  if (rows.length > limit) {
    lines.push(`| ... | ${rows.length - limit} lignes supplementaires non affichees |`);
  }
  lines.push("");
}

function escapeMarkdownCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function buildReport(index: Phase01Index): string {
  const { diagnostics } = index;
  const lines: string[] = [];
  lines.push("# Rapport automatique Phase 01");
  lines.push("");
  lines.push("Ce rapport est genere automatiquement par `npm run audit:phase1`.");
  lines.push("Il reconcilie le suivi, les sources C/H et les fichiers TS sans valider le portage.");
  lines.push("");
  lines.push("## Resume");
  lines.push("");
  lines.push(`- Lignes de suivi parsees : ${diagnostics.trackingRows}`);
  lines.push(`- Sources C/H phase 00 : ${diagnostics.sourceRows}`);
  lines.push(`- Fichiers TS phase 00 : ${diagnostics.tsRows}`);
  lines.push(`- Sources suivies et presentes sur disque : ${diagnostics.trackedSources}`);
  lines.push(`- Sources C/H non suivies : ${diagnostics.untrackedSources.length}`);
  lines.push(`- Entrees de suivi source absentes du disque : ${diagnostics.trackingSourcesMissingOnDisk.length}`);
  lines.push(`- Cibles declarees absentes du disque : ${diagnostics.declaredTargetsMissingOnDisk.length}`);
  lines.push(`- Cibles TS declarees absentes de l'index TS : ${diagnostics.tsTargetsMissingFromIndex.length}`);
  lines.push(`- Fichiers TS non references par le suivi : ${diagnostics.untrackedTsFiles.length}`);
  lines.push(`- Lignes avec plusieurs cibles TS : ${diagnostics.multipleTargetRows.length}`);
  lines.push(`- Lignes ciblant apps/web ou packages/platform : ${diagnostics.adapterTargetRows.length}`);
  lines.push(`- Sources avec cible declaree non conforme au basename strict : ${diagnostics.expectedMapMismatches.length}`);
  lines.push(`- Sources dupliquees dans le suivi : ${diagnostics.duplicateTrackingSources.length}`);
  lines.push(`- Sources avec perimetre unknown : ${diagnostics.unknownScopeSources.length}`);
  lines.push(`- Corrections factuelles applicables en 01.D : ${diagnostics.factualCorrectionCandidates.length}`);
  lines.push("");

  appendTable(
    lines,
    "Classification du perimetre source",
    ["Perimetre", "Sources"],
    Object.entries(diagnostics.scopeCounts).map(([scope, count]) => [scope, String(count)]),
  );
  appendTable(
    lines,
    "Statuts attendus",
    ["Statut attendu", "Sources"],
    Object.entries(diagnostics.expectedStatusCounts).map(([status, count]) => [status, String(count)]),
  );
  appendTable(
    lines,
    "Anomalies de reference",
    ["Anomalie", "Sources"],
    Object.entries(diagnostics.anomalyCounts).sort((a, b) => b[1] - a[1]).map(([anomaly, count]) => [anomaly, String(count)]),
  );
  appendTable(
    lines,
    "Table de reference normalisee",
    ["Source", "Perimetre", "Statut", "Cible TS principale", "TS attendu", "Cibles exactes detectees", "Audit", "Tests", "Anomalies"],
    index.referenceTable.map((entry) => [
      entry.sourcePath,
      entry.scope,
      entry.expectedStatus,
      entry.declaredPrimaryTsTarget ?? "",
      entry.expectedTsFile,
      entry.detectedExactTsTargets.join("<br>"),
      entry.hasHistoricalAudit ? "oui" : "non",
      entry.testReferences.join("<br>"),
      entry.anomalies.join("<br>"),
    ]),
    200,
  );
  appendTable(
    lines,
    "Sources avec perimetre unknown",
    ["Source"],
    diagnostics.unknownScopeSources.map((sourcePath) => [sourcePath]),
  );
  appendTable(
    lines,
    "Corrections factuelles applicables en 01.D",
    ["Type", "Ligne", "Path", "Detail"],
    diagnostics.factualCorrectionCandidates.map((entry) => [
      entry.kind,
      entry.line === null ? "" : String(entry.line),
      entry.path,
      entry.detail,
    ]),
  );

  appendTable(
    lines,
    "Entrees de suivi source absentes du disque",
    ["Ligne", "Path", "Source normalisee"],
    diagnostics.trackingSourcesMissingOnDisk.map((entry) => [String(entry.line), entry.normalizedPath, entry.sourcePath ?? ""]),
  );
  appendTable(
    lines,
    "Sources C/H non suivies",
    ["Source"],
    diagnostics.untrackedSources.map((sourcePath) => [sourcePath]),
  );
  appendTable(
    lines,
    "Cibles declarees absentes du disque",
    ["Ligne", "Entree suivi", "Cible"],
    diagnostics.declaredTargetsMissingOnDisk.map((entry) => [String(entry.line), entry.trackingPath, entry.targetPath]),
  );
  appendTable(
    lines,
    "Fichiers TS non references par le suivi",
    ["TS"],
    diagnostics.untrackedTsFiles.map((tsPath) => [tsPath]),
  );
  appendTable(
    lines,
    "Lignes avec plusieurs cibles TS",
    ["Ligne", "Source", "Cibles TS"],
    diagnostics.multipleTargetRows.map((entry) => [String(entry.line), entry.normalizedPath, entry.tsTargetPaths.join("<br>")]),
  );
  appendTable(
    lines,
    "Cibles suspectes dans apps/web ou packages/platform",
    ["Ligne", "Source", "Cibles TS"],
    diagnostics.adapterTargetRows.map((entry) => [String(entry.line), entry.normalizedPath, entry.tsTargetPaths.join("<br>")]),
  );
  appendTable(
    lines,
    "Ecarts avec le mapping basename strict",
    ["Source", "TS attendu", "Cibles declarees", "Cibles exactes detectees", "Hints phase 02"],
    diagnostics.expectedMapMismatches.map((entry) => [
      entry.sourcePath,
      entry.expectedTsFile,
      entry.declaredTsTargets.join("<br>"),
      entry.detectedExactTsTargets.join("<br>"),
      entry.phase02Hints.join(", "),
    ]),
  );
  appendTable(
    lines,
    "Sources dupliquees dans le suivi",
    ["Source", "Lignes"],
    diagnostics.duplicateTrackingSources.map((entry) => [entry.sourcePath, entry.lines.join(", ")]),
  );

  return `${lines.join("\n")}\n`;
}

async function main(): Promise<void> {
  const sourceIndex = await readJson<SourceEntry[]>(path.join(phase00Generated, "source-index.json"));
  const tsIndex = await readJson<TsEntry[]>(path.join(phase00Generated, "ts-index.json"));
  const expectedMap = await readJson<ExpectedMapEntry[]>(path.join(phase00Generated, "source-to-ts-expected-map.json"));
  const trackingEntries = parsePortageMarkdown(await readFile(portagePath, "utf8"));
  const referenceTable = buildReferenceTable(sourceIndex, tsIndex, expectedMap, trackingEntries);
  const diagnostics = await buildDiagnostics(sourceIndex, tsIndex, trackingEntries, referenceTable);
  const index: Phase01Index = {
    generatedBy: "audit-portage/phases/phase-01-referentiel-audit/tools/build-reference-audit.ts",
    generatedAt: new Date().toISOString(),
    trackingEntries,
    referenceTable,
    diagnostics,
  };
  const report = buildReport(index);

  await mkdir(outputRoot, { recursive: true });
  await writeFile(path.join(outputRoot, "portage-tracking-index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputRoot, "phase-01-reference-report.md"), report, "utf8");

  console.log(`Wrote ${toRepoPath(path.join(outputRoot, "phase-01-reference-report.md"))}`);
}

await main();
