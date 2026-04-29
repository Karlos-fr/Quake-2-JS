/**
 * File: build-structure-audit.ts
 * Purpose: Generate the phase-02 structural audit draft without renaming files.
 *
 * This script implements the phase-02.A toolchain as one orchestrator:
 * - P02-TOOL-01 strict-basename-map
 * - P02-TOOL-02 split-exception-registry
 * - P02-TOOL-03 modern-name-detector
 * - P02-TOOL-04 port-header-checker
 * - P02-TOOL-05 rename-proposal-generator
 * - P02-TOOL-06 structural-inventory-generator
 * - P02-TOOL-07 basename-collision-detector
 * - P02-TOOL-08 import-impact-detector
 * - P02-TOOL-09 rename-plan-simulator
 * - P02-TOOL-10 structure-report-generator
 *
 * It does not modify TypeScript files and does not validate behavior.
 */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

type SourceScope =
  | "core-runtime"
  | "renderer-ref-gl"
  | "platform-native"
  | "renderer-soft"
  | "ctf"
  | "assets-or-docs"
  | "unknown";

type ExpectedStatus = "to-port" | "voluntarily-excluded" | "to-clarify";

type StructuralStatus =
  | "strict-ok"
  | "missing-target"
  | "wrong-name"
  | "split-ok"
  | "split-undocumented"
  | "adapter-leak"
  | "merged-source"
  | "excluded"
  | "ambiguous";

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

interface SourceEntry {
  path: string;
  basename: string;
  extension: "c" | "h";
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

interface Phase01ReferenceEntry {
  sourcePath: string;
  sourceBasename: string;
  extension: "c" | "h";
  scope: SourceScope;
  expectedStatus: ExpectedStatus;
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
  referenceTable: Phase01ReferenceEntry[];
}

interface StructuralEntry {
  sourcePath: string;
  sourceBasename: string;
  scope: SourceScope;
  expectedStatus: ExpectedStatus;
  status: StructuralStatus;
  expectedTsFile: string;
  strictMatches: string[];
  declaredPrimaryTsTarget: string | null;
  declaredSecondaryTsTargets: string[];
  declaredTsTargets: string[];
  primaryBasenameMatchesSource: boolean;
  hasAcceptedSplitException: boolean;
  headerFindings: string[];
  modernNameFindings: string[];
  basenameCollisionSources: string[];
  importImpactFiles: string[];
  renameProposal: RenameProposal | null;
  inventory: StructuralInventory;
  findings: string[];
}

interface StructuralInventory {
  sourceFunctions: number;
  sourceMacros: number;
  sourceTypes: number;
  sourceGlobals: number;
  targetFunctions: number;
  targetTypes: number;
  targetConstants: number;
}

interface RenameProposal {
  from: string;
  toFileName: string;
  proposedPath: string;
  reason: string;
  importImpactFiles: string[];
}

interface SplitExceptionEntry {
  sourcePath: string;
  primaryTsTarget: string | null;
  secondaryTsTargets: string[];
  reason: string;
  sizeOrComplexityJustification: string;
  primaryNameEvidence: string;
  publicImportImpact: string[];
  status: "accepted" | "temporary" | "rejected" | "to-review";
  requiredEvidence: string[];
  findings: string[];
}

interface RenamePlanEntry extends RenameProposal {
  proposedPathExists: boolean;
  fromHasMultipleProposals: boolean;
  proposedPathHasMultipleProposals: boolean;
  importImpactKnown: boolean;
  blockers: string[];
  status: "proposal-only" | "blocked-needs-review";
}

const repoRoot = process.cwd();
const phase00Generated = path.join(repoRoot, "audit-portage", "phases", "phase-00-socle-outillage", "generated");
const phase01Generated = path.join(repoRoot, "audit-portage", "phases", "phase-01-referentiel-audit", "generated");
const outputRoot = path.join(repoRoot, "audit-portage", "phases", "phase-02-source-vers-typescript", "generated");
const tsRoots = [path.join(repoRoot, "packages"), path.join(repoRoot, "apps")];

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

function toRepoPath(absolutePath: string): string {
  return path.relative(repoRoot, absolutePath).replaceAll(path.sep, "/");
}

async function walkFiles(root: string, predicate: (filePath: string) => boolean): Promise<string[]> {
  const files: string[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") {
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

async function buildImportTextIndex(): Promise<Array<{ path: string; text: string }>> {
  const allFiles: Array<{ path: string; text: string }> = [];
  for (const root of tsRoots) {
    const files = await walkFiles(root, (filePath) => path.extname(filePath).toLowerCase() === ".ts");
    for (const filePath of files) {
      allFiles.push({ path: toRepoPath(filePath), text: await readFile(filePath, "utf8") });
    }
  }
  return allFiles;
}

function isAdapterPath(targetPath: string | null): boolean {
  return targetPath !== null && (targetPath.startsWith("apps/web/") || targetPath.startsWith("packages/platform/"));
}

function moduleStem(targetPath: string): string {
  return path.posix.basename(targetPath, path.posix.extname(targetPath));
}

function importSpecifierStem(targetPath: string): string {
  return moduleStem(targetPath);
}

function detectImportImpact(targetPath: string | null, importTextIndex: Array<{ path: string; text: string }>): string[] {
  if (!targetPath) {
    return [];
  }
  const stem = importSpecifierStem(targetPath);
  const patterns = [
    `/${stem}`,
    `./${stem}`,
    `../${stem}`,
    `"${targetPath}"`,
    `'${targetPath}'`,
  ];
  return importTextIndex
    .filter((entry) => entry.path !== targetPath && patterns.some((pattern) => entry.text.includes(pattern)))
    .map((entry) => entry.path)
    .sort();
}

function detectModernName(source: Phase01ReferenceEntry): string[] {
  const findings: string[] = [];
  const primary = source.declaredPrimaryTsTarget;
  if (!primary) {
    return findings;
  }
  const primaryBasename = moduleStem(primary);
  if (primaryBasename !== source.sourceBasename) {
    findings.push(`primary-basename '${primaryBasename}' differs from source basename '${source.sourceBasename}'`);
  }
  if (/^(types|runtime|index|main|effects|entities|view|parse|screen|local-|.*-adapter|.*-bootstrap)$/.test(primaryBasename)) {
    findings.push(`primary basename '${primaryBasename}' looks modernized or abstract`);
  }
  return findings;
}

function checkPortHeader(source: Phase01ReferenceEntry, tsByPath: Map<string, TsEntry>): string[] {
  const findings: string[] = [];
  const primary = source.declaredPrimaryTsTarget;
  if (!primary) {
    return findings;
  }
  const target = tsByPath.get(primary);
  if (!target) {
    findings.push("primary target missing from ts index");
    return findings;
  }
  if (!target.hasPortHeader) {
    findings.push("missing File header");
  }
  if (target.sourceHeader === null) {
    findings.push("missing Source header");
  } else if (!target.sourceHeader.includes(source.sourcePath.replace("Quake-2-master/", "")) && !target.sourceHeader.includes(source.sourceBasename)) {
    findings.push(`Source header '${target.sourceHeader}' does not clearly reference source`);
  }
  if (target.hasStubMarker) {
    findings.push("stub marker detected");
  }
  if (target.hasTemporaryMarker) {
    findings.push("temporary marker detected");
  }
  return findings;
}

function buildInventory(source: SourceEntry | undefined, targets: TsEntry[]): StructuralInventory {
  const sourceTypes = (source?.symbols.typedefs.length ?? 0) + (source?.symbols.structs.length ?? 0) + (source?.symbols.enums.length ?? 0);
  return {
    sourceFunctions: source?.symbols.functions.length ?? 0,
    sourceMacros: source?.symbols.macros.length ?? 0,
    sourceTypes,
    sourceGlobals: source?.symbols.globals.length ?? 0,
    targetFunctions: targets.reduce((sum, entry) => sum + entry.symbols.functions.length, 0),
    targetTypes: targets.reduce((sum, entry) => sum + entry.symbols.classes.length + entry.symbols.interfaces.length + entry.symbols.types.length + entry.symbols.enums.length, 0),
    targetConstants: targets.reduce((sum, entry) => sum + entry.symbols.constants.length, 0),
  };
}

function classifyStructuralStatus(source: Phase01ReferenceEntry, primaryBasenameMatchesSource: boolean): StructuralStatus {
  if (source.expectedStatus === "voluntarily-excluded") {
    return "excluded";
  }
  if (isAdapterPath(source.declaredPrimaryTsTarget)) {
    return "adapter-leak";
  }
  if (source.declaredTsTargets.length === 0) {
    return "missing-target";
  }
  if (source.declaredTsTargets.length > 1) {
    return primaryBasenameMatchesSource ? "split-undocumented" : "split-undocumented";
  }
  if (!primaryBasenameMatchesSource) {
    return "wrong-name";
  }
  if (source.detectedExactTsTargets.length === 1) {
    return "strict-ok";
  }
  return "ambiguous";
}

function buildRenameProposal(
  source: Phase01ReferenceEntry,
  status: StructuralStatus,
  importImpactFiles: string[],
): RenameProposal | null {
  if (!source.declaredPrimaryTsTarget || !["wrong-name", "split-undocumented", "adapter-leak"].includes(status)) {
    return null;
  }
  if (moduleStem(source.declaredPrimaryTsTarget) === source.sourceBasename) {
    return null;
  }
  const proposedPath = `${path.posix.dirname(source.declaredPrimaryTsTarget)}/${source.expectedTsFile}`;
  return {
    from: source.declaredPrimaryTsTarget,
    toFileName: source.expectedTsFile,
    proposedPath,
    reason: "primary TS target does not use the source basename",
    importImpactFiles,
  };
}

function appendTable(lines: string[], title: string, headers: string[], rows: string[][], limit = 120): void {
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
    lines.push(`| ${row.map((value) => value.replaceAll("|", "\\|").replaceAll("\n", "<br>")).join(" | ")} |`);
  }
  if (rows.length > limit) {
    lines.push(`| ... | ${rows.length - limit} lignes supplementaires non affichees |`);
  }
  lines.push("");
}

function buildReport(entries: StructuralEntry[], splitExceptions: SplitExceptionEntry[], renamePlan: RenamePlanEntry[]): string {
  const statusCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.status] = (counts[entry.status] ?? 0) + 1;
    return counts;
  }, {});
  const headerFindingCount = entries.filter((entry) => entry.headerFindings.length > 0).length;
  const modernNameCount = entries.filter((entry) => entry.modernNameFindings.length > 0).length;
  const collisionCount = entries.filter((entry) => entry.basenameCollisionSources.length > 0).length;

  const lines: string[] = [];
  lines.push("# Rapport automatique Phase 02.A");
  lines.push("");
  lines.push("Ce rapport est genere automatiquement par `npm run audit:phase2`.");
  lines.push("Il controle la structure source C/H -> TS sans renommer, deplacer ou valider le comportement.");
  lines.push("");
  lines.push("## Resume");
  lines.push("");
  lines.push(`- Sources analysees : ${entries.length}`);
  lines.push(`- Sources a porter analysees : ${entries.filter((entry) => entry.expectedStatus === "to-port").length}`);
  lines.push(`- Sources exclues volontairement : ${entries.filter((entry) => entry.expectedStatus === "voluntarily-excluded").length}`);
  lines.push(`- Entrees avec finding header : ${headerFindingCount}`);
  lines.push(`- Entrees avec nom modernise/abstrait : ${modernNameCount}`);
  lines.push(`- Entrees avec collision de basename : ${collisionCount}`);
  lines.push(`- Exceptions de decoupage a revoir : ${splitExceptions.length}`);
  lines.push(`- Exceptions acceptees : ${splitExceptions.filter((entry) => entry.status === "accepted").length}`);
  lines.push(`- Exceptions temporaires : ${splitExceptions.filter((entry) => entry.status === "temporary").length}`);
  lines.push(`- Exceptions rejetees : ${splitExceptions.filter((entry) => entry.status === "rejected").length}`);
  lines.push(`- Exceptions en revue : ${splitExceptions.filter((entry) => entry.status === "to-review").length}`);
  lines.push(`- Propositions de renommage/rerattachement : ${renamePlan.length}`);
  lines.push(`- Propositions bloquees avant patch : ${renamePlan.filter((entry) => entry.status === "blocked-needs-review").length}`);
  lines.push("");

  appendTable(lines, "Statuts structurels", ["Statut", "Sources"], Object.entries(statusCounts).sort().map(([status, count]) => [status, String(count)]));
  appendTable(
    lines,
    "Controle structurel par source",
    ["Source", "Statut", "Cible principale", "TS attendu", "Secondaires", "Headers", "Noms", "Imports touches", "Findings"],
    entries.map((entry) => [
      entry.sourcePath,
      entry.status,
      entry.declaredPrimaryTsTarget ?? "",
      entry.expectedTsFile,
      entry.declaredSecondaryTsTargets.join("<br>"),
      entry.headerFindings.join("<br>"),
      entry.modernNameFindings.join("<br>"),
      entry.importImpactFiles.join("<br>"),
      entry.findings.join("<br>"),
    ]),
    200,
  );
  appendTable(
    lines,
    "Exceptions de decoupage a revoir",
    ["Source", "Primaire", "Secondaires", "Raison", "Justification taille/complexite", "Preuve nom principal", "Impact imports", "Statut", "Findings"],
    splitExceptions.map((entry) => [
      entry.sourcePath,
      entry.primaryTsTarget ?? "",
      entry.secondaryTsTargets.join("<br>"),
      entry.reason,
      entry.sizeOrComplexityJustification,
      entry.primaryNameEvidence,
      entry.publicImportImpact.join("<br>"),
      entry.status,
      entry.findings.join("<br>"),
    ]),
    200,
  );
  appendTable(
    lines,
    "Propositions de renommage/rerattachement",
    ["Depuis", "Vers propose", "Statut", "Bloqueurs", "Raison", "Imports touches"],
    renamePlan.map((entry) => [
      entry.from,
      entry.proposedPath,
      entry.status,
      entry.blockers.join("<br>"),
      entry.reason,
      entry.importImpactFiles.join("<br>"),
    ]),
    200,
  );

  return `${lines.join("\n")}\n`;
}

async function main(): Promise<void> {
  const sourceIndex = await readJson<SourceEntry[]>(path.join(phase00Generated, "source-index.json"));
  const tsIndex = await readJson<TsEntry[]>(path.join(phase00Generated, "ts-index.json"));
  const phase01 = await readJson<Phase01Index>(path.join(phase01Generated, "portage-tracking-index.json"));
  const importTextIndex = await buildImportTextIndex();

  const sourceByPath = new Map(sourceIndex.map((entry) => [entry.path, entry]));
  const tsByPath = new Map(tsIndex.map((entry) => [entry.path, entry]));
  const sourcesByBasename = new Map<string, string[]>();
  for (const source of sourceIndex) {
    const bucket = sourcesByBasename.get(source.basename) ?? [];
    bucket.push(source.path);
    sourcesByBasename.set(source.basename, bucket);
  }

  const entries: StructuralEntry[] = phase01.referenceTable.map((source) => {
    const sourceEntry = sourceByPath.get(source.sourcePath);
    const targetEntries = source.declaredTsTargets.map((target) => tsByPath.get(target)).filter((entry): entry is TsEntry => entry !== undefined);
    const primaryBasenameMatchesSource = source.declaredPrimaryTsTarget !== null && moduleStem(source.declaredPrimaryTsTarget) === source.sourceBasename;
    const status = classifyStructuralStatus(source, primaryBasenameMatchesSource);
    const importImpactFiles = detectImportImpact(source.declaredPrimaryTsTarget, importTextIndex);
    const headerFindings = checkPortHeader(source, tsByPath);
    const modernNameFindings = detectModernName(source);
    const basenameCollisionSources = (sourcesByBasename.get(source.sourceBasename) ?? []).filter((sourcePath) => sourcePath !== source.sourcePath);
    const findings = [
      ...source.anomalies,
      ...headerFindings.map((finding) => `header:${finding}`),
      ...modernNameFindings.map((finding) => `name:${finding}`),
      ...(basenameCollisionSources.length > 0 ? ["basename-collision"] : []),
    ];

    return {
      sourcePath: source.sourcePath,
      sourceBasename: source.sourceBasename,
      scope: source.scope,
      expectedStatus: source.expectedStatus,
      status,
      expectedTsFile: source.expectedTsFile,
      strictMatches: source.detectedExactTsTargets,
      declaredPrimaryTsTarget: source.declaredPrimaryTsTarget,
      declaredSecondaryTsTargets: source.declaredSecondaryTsTargets,
      declaredTsTargets: source.declaredTsTargets,
      primaryBasenameMatchesSource,
      hasAcceptedSplitException: false,
      headerFindings,
      modernNameFindings,
      basenameCollisionSources,
      importImpactFiles,
      renameProposal: buildRenameProposal(source, status, importImpactFiles),
      inventory: buildInventory(sourceEntry, targetEntries),
      findings,
    };
  });

  const splitExceptions: SplitExceptionEntry[] = entries
    .filter((entry) => entry.expectedStatus === "to-port" && entry.declaredTsTargets.length > 1)
    .map((entry) => ({
      sourcePath: entry.sourcePath,
      primaryTsTarget: entry.declaredPrimaryTsTarget,
      secondaryTsTargets: entry.declaredSecondaryTsTargets,
      reason: "multiple TS targets declared; justification must be reviewed in phase 02.B",
      sizeOrComplexityJustification: buildSplitSizeJustification(entry),
      primaryNameEvidence: entry.primaryBasenameMatchesSource
        ? "primary TS target keeps the source basename"
        : "primary TS target does not keep the source basename; justification required",
      publicImportImpact: entry.importImpactFiles,
      status: "to-review",
      requiredEvidence: [
        "reason for split",
        "proof primary TS target keeps source basename or justified exception",
        "public import impact",
      ],
      findings: buildSplitExceptionFindings(entry),
    }));
  const renameProposals = entries
    .map((entry) => entry.renameProposal)
    .filter((entry): entry is RenameProposal => entry !== null);
  const renamePlan = buildRenamePlan(renameProposals, tsByPath);

  await mkdir(outputRoot, { recursive: true });
  await writeFile(path.join(outputRoot, "phase-02-structure-index.json"), `${JSON.stringify({ entries }, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputRoot, "phase-02-split-exceptions.json"), `${JSON.stringify(splitExceptions, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputRoot, "phase-02-rename-plan.md"), buildRenamePlanMarkdown(renamePlan), "utf8");
  await writeFile(path.join(outputRoot, "phase-02-structure-report.md"), buildReport(entries, splitExceptions, renamePlan), "utf8");

  console.log(`Wrote ${toRepoPath(path.join(outputRoot, "phase-02-structure-report.md"))}`);
}

function buildSplitSizeJustification(entry: StructuralEntry): string {
  const sourceSurface =
    entry.inventory.sourceFunctions +
    entry.inventory.sourceMacros +
    entry.inventory.sourceTypes +
    entry.inventory.sourceGlobals;
  if (sourceSurface >= 80) {
    return `large source surface detected (${sourceSurface} extracted source symbols)`;
  }
  if (entry.declaredSecondaryTsTargets.length >= 3) {
    return `broad split detected (${entry.declaredSecondaryTsTargets.length + 1} declared TS targets)`;
  }
  return "not justified automatically; human review required";
}

function buildSplitExceptionFindings(entry: StructuralEntry): string[] {
  const findings: string[] = [];
  if (!entry.primaryBasenameMatchesSource) {
    findings.push("primary-name-not-source-basename");
  }
  if (entry.declaredPrimaryTsTarget !== null && isAdapterPath(entry.declaredPrimaryTsTarget)) {
    findings.push("primary-target-is-adapter");
  }
  if (entry.declaredSecondaryTsTargets.some((target) => isAdapterPath(target))) {
    findings.push("secondary-target-in-adapter");
  }
  if (entry.inventory.sourceFunctions + entry.inventory.sourceMacros + entry.inventory.sourceTypes + entry.inventory.sourceGlobals < 20) {
    findings.push("small-source-split-needs-justification");
  }
  return findings;
}

function buildRenamePlan(proposals: RenameProposal[], tsByPath: Map<string, TsEntry>): RenamePlanEntry[] {
  const fromCounts = countBy(proposals.map((entry) => entry.from));
  const proposedPathCounts = countBy(proposals.map((entry) => entry.proposedPath));

  return proposals.map((proposal) => {
    const proposedPathExists = tsByPath.has(proposal.proposedPath);
    const fromHasMultipleProposals = (fromCounts.get(proposal.from) ?? 0) > 1;
    const proposedPathHasMultipleProposals = (proposedPathCounts.get(proposal.proposedPath) ?? 0) > 1;
    const importImpactKnown = proposal.importImpactFiles.length > 0;
    const blockers = [
      ...(proposedPathExists ? ["proposed-path-already-exists"] : []),
      ...(fromHasMultipleProposals ? ["source-target-has-multiple-rename-proposals"] : []),
      ...(proposedPathHasMultipleProposals ? ["proposed-path-has-multiple-proposals"] : []),
      ...(!importImpactKnown ? ["no-import-impact-detected-review-before-patch"] : []),
    ];
    return {
      ...proposal,
      proposedPathExists,
      fromHasMultipleProposals,
      proposedPathHasMultipleProposals,
      importImpactKnown,
      blockers,
      status: blockers.length > 0 ? "blocked-needs-review" : "proposal-only",
    };
  });
}

function countBy(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

function buildRenamePlanMarkdown(renamePlan: RenamePlanEntry[]): string {
  const lines: string[] = [];
  lines.push("# Plan de renommage/rerattachement Phase 02");
  lines.push("");
  lines.push("Ce fichier est genere automatiquement. Aucune operation n'a ete appliquee.");
  lines.push("Les entrees marquees `blocked-needs-review` ne doivent pas etre appliquees avant resolution des bloqueurs.");
  lines.push("");
  appendTable(
    lines,
    "Propositions",
    ["Depuis", "Vers propose", "Statut", "Bloqueurs", "Chemin propose existe", "Imports connus", "Raison", "Imports touches"],
    renamePlan.map((entry) => [
      entry.from,
      entry.proposedPath,
      entry.status,
      entry.blockers.join("<br>"),
      entry.proposedPathExists ? "oui" : "non",
      entry.importImpactKnown ? "oui" : "non",
      entry.reason,
      entry.importImpactFiles.join("<br>"),
    ]),
    300,
  );
  return `${lines.join("\n")}\n`;
}

await main();
