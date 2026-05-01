import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

type MatrixRow = {
  sourcePath: string;
  sourceSymbol: string;
  symbolKind: string;
  primaryTsTarget?: string;
  declaredTsTargets?: string[];
  tsSymbol?: string;
  tsSymbolMatches?: Array<{ file?: string; symbol?: string; kind?: string }>;
  structuralStatus?: string;
  phase03BehaviorStatus?: string;
  linkedTests?: string[];
  linkedNpmScripts?: string[];
  findings?: string[];
  provisionalVerdict?: string;
};

type FileAudit = {
  sourcePath: string;
  primaryTsTarget?: string;
  tsTargets?: string[];
  linkedTests?: string[];
  linkedNpmScripts?: string[];
  verdict?: string;
  findings?: string[];
};

type SourceIndexEntry = {
  path: string;
  symbols?: Partial<Record<"functions" | "macros" | "typedefs" | "structs" | "enums" | "globals", string[]>>;
};

type Phase02Entry = {
  sourcePath: string;
  status?: string;
  declaredPrimaryTsTarget?: string | null;
  declaredTsTargets?: string[];
  strictMatches?: string[];
  headerFindings?: string[];
  modernNameFindings?: string[];
};

type ExpectedMapEntry = {
  sourcePath: string;
  expectedTsFile?: string;
  matchingTsFiles?: string[];
  status?: string;
};

type DeclarativeComparison = {
  category: string;
  sourceFile: string;
  tableName: string;
  primaryTsTarget?: string;
  tsTargets?: string[];
  status?: string;
  missingEntryCount?: number;
  findings?: string[];
};

type PreservedCell = {
  valid: string;
  notes: string;
};

type GlobalProgressRow = {
  sourcePath: string;
  matrixFileName: string;
  progressFileName: string;
  status: string;
  total: number;
  valid: number;
  partial: number;
  missing: number;
  nonConforming: number;
  notApplicable: number;
  nextBatch: string;
  priority: string;
};

const ROOT = process.cwd();
const PHASE03_GENERATED = path.join(ROOT, "audit-portage/phases/phase-03-runtime-exhaustif/generated");
const OUT_ROOT = path.join(ROOT, "audit-portage/validation-incrementale/validation");
const MATRICES_DIR = path.join(OUT_ROOT, "matrices");
const PROGRESS_DIR = path.join(OUT_ROOT, "progress");

const MATRIX_JSON = path.join(PHASE03_GENERATED, "phase-03-runtime-coverage-matrix.json");
const FILE_AUDITS_JSON = path.join(PHASE03_GENERATED, "phase-03-runtime-file-audits.json");
const TABLES_JSON = path.join(PHASE03_GENERATED, "phase-03-declarative-tables-audit.json");
const PHASE00_GENERATED = path.join(ROOT, "audit-portage/phases/phase-00-socle-outillage/generated");
const PHASE02_GENERATED = path.join(ROOT, "audit-portage/phases/phase-02-source-vers-typescript/generated");
const SOURCE_INDEX_JSON = path.join(PHASE00_GENERATED, "source-index.json");
const EXPECTED_MAP_JSON = path.join(PHASE00_GENERATED, "source-to-ts-expected-map.json");
const PHASE02_STRUCTURE_JSON = path.join(PHASE02_GENERATED, "phase-02-structure-index.json");

const SUPPLEMENTAL_MODULE_PREFIXES = ["Quake-2-master/ref_gl/"];
const REF_GL_TESTS_BY_SOURCE = new Map<string, string[]>([
  ["Quake-2-master/ref_gl/gl_draw.c", ["verify:gl-draw", "verify:three-gl-draw-adapter"]],
  ["Quake-2-master/ref_gl/gl_image.c", ["verify:gl-image"]],
  ["Quake-2-master/ref_gl/gl_light.c", ["verify:gl-light", "verify:full-game:three-renderer"]],
  ["Quake-2-master/ref_gl/gl_local.h", ["verify:gl-local:header", "verify:ref-gl-host"]],
  ["Quake-2-master/ref_gl/gl_mesh.c", ["verify:gl-mesh", "verify:full-game:three-renderer"]],
  [
    "Quake-2-master/ref_gl/gl_model.c",
    [
      "verify:gl-model:phase1",
      "verify:gl-model:phase2",
      "verify:gl-model:phase3",
      "verify:gl-model:phase4",
      "verify:gl-model:phase5",
      "verify:gl-model:phase6",
      "verify:gl-model:phase7",
      "verify:gl-model:phase8",
      "verify:gl-model:phase9",
      "verify:three-world-alpha",
      "verify:three-world-warp-sky",
    ],
  ],
  ["Quake-2-master/ref_gl/gl_model.h", ["verify:gl-model:header"]],
  ["Quake-2-master/ref_gl/gl_rmain.c", ["verify:gl-rmain", "verify:ref-gl-host", "verify:full-game:three-renderer"]],
  ["Quake-2-master/ref_gl/gl_rmisc.c", ["verify:gl-rmisc"]],
  ["Quake-2-master/ref_gl/gl_rsurf.c", ["verify:gl-rsurf", "verify:three-world-alpha"]],
  ["Quake-2-master/ref_gl/gl_warp.c", ["verify:gl-warp", "verify:three-world-warp-sky"]],
  ["Quake-2-master/ref_gl/qgl.h", ["verify:qgl:header"]],
  ["Quake-2-master/ref_gl/warpsin.h", ["verify:warpsin"]],
]);

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function normalizeArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function sanitizeFileName(sourcePath: string): string {
  return sourcePath.replace(/^Quake-2-master\//, "").replace(/[\\/]/g, "_") + ".md";
}

function progressFileName(sourcePath: string): string {
  return sanitizeFileName(sourcePath);
}

function readNextBatchFromProgress(fileName: string): string {
  const filePath = path.join(PROGRESS_DIR, fileName);
  if (!existsSync(filePath)) {
    return "";
  }

  const content = readFileSync(filePath, "utf8");
  const match = content.match(/^- Prochain lot recommande:\s*(.+)$/m);
  if (match?.[1]) {
    return match[1].trim();
  }

  const section = content.match(/^## Prochain lot recommande\s*\r?\n\s*\r?\n-\s*(.+)$/m);
  return section?.[1]?.trim() ?? "";
}

function md(value: unknown): string {
  const text = Array.isArray(value) ? value.join("<br>") : String(value ?? "");
  return text
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|");
}

function preserveKey(sourcePath: string, kind: string, sourceSymbol: string, occurrence: number): string {
  return `${sourcePath}\u0000${kind}\u0000${sourceSymbol}\u0000${occurrence}`;
}

function readPreservedStatuses(): Map<string, PreservedCell> {
  const preserved = new Map<string, PreservedCell>();
  if (!existsSync(MATRICES_DIR)) {
    return preserved;
  }

  for (const fileName of readdirSync(MATRICES_DIR)) {
    if (!fileName.endsWith(".md")) {
      continue;
    }

    const content = readFileSync(path.join(MATRICES_DIR, fileName), "utf8");
    const occurrences = new Map<string, number>();
    for (const line of content.split(/\r?\n/)) {
      if (!line.startsWith("| `")) {
        continue;
      }

      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
      if (cells.length < 8) {
        continue;
      }

      const sourcePath = stripCode(cells[0]);
      const kind = cells[1];
      const sourceSymbol = stripCode(cells[2]);
      const valid = cells[5];
      const notes = cells[7] ?? "";

      if (sourcePath && kind && sourceSymbol && valid && valid !== "A verifier") {
        const baseKey = `${sourcePath}\u0000${kind}\u0000${sourceSymbol}`;
        const occurrence = occurrences.get(baseKey) ?? 0;
        occurrences.set(baseKey, occurrence + 1);
        preserved.set(preserveKey(sourcePath, kind, sourceSymbol, occurrence), { valid, notes });
      }
    }
  }

  return preserved;
}

function stripCode(value: string): string {
  return value.replace(/^`/, "").replace(/`$/, "");
}

function occurrenceFor(occurrences: Map<string, number>, sourcePath: string, kind: string, symbol: string): number {
  const key = `${sourcePath}\u0000${kind}\u0000${symbol}`;
  const occurrence = occurrences.get(key) ?? 0;
  occurrences.set(key, occurrence + 1);
  return occurrence;
}

function formatMatrixRow(row: MatrixRow, preserved: Map<string, PreservedCell>, occurrence: number): string {
  const targetFiles = unique([
    row.primaryTsTarget,
    ...normalizeArray(row.declaredTsTargets),
    ...normalizeArray(row.tsSymbolMatches).map((match) => match.file),
  ]);
  const targetSymbols = unique([
    row.tsSymbol,
    ...normalizeArray(row.tsSymbolMatches).map((match) => match.symbol),
  ]);
  const saved = preserved.get(preserveKey(row.sourcePath, row.symbolKind, row.sourceSymbol, occurrence));
  const notes = saved?.notes ?? "";

  return [
    `\`${row.sourcePath}\``,
    md(row.symbolKind),
    `\`${md(row.sourceSymbol)}\``,
    md(targetFiles.map((file) => `\`${file}\``)),
    md(targetSymbols.map((symbol) => `\`${symbol}\``)),
    saved?.valid ?? "A verifier",
    md(row.provisionalVerdict ?? ""),
    md(notes),
  ].join(" | ");
}

function statusFromCounts(row: GlobalProgressRow): string {
  if (row.total === 0) {
    return "A revoir";
  }

  if (row.missing > 0 || row.nonConforming > 0) {
    return "Bloque";
  }

  if (row.partial > 0) {
    return "Partiel";
  }

  if (row.valid + row.notApplicable >= row.total) {
    return "Termine";
  }

  if (row.valid > 0 || row.notApplicable > 0) {
    return "En cours";
  }

  return "A demarrer";
}

function countValidation(
  progress: GlobalProgressRow,
  sourcePath: string,
  kind: string,
  symbol: string,
  preserved: Map<string, PreservedCell>,
  occurrence: number,
): void {
  progress.total += 1;
  const valid = preserved.get(preserveKey(sourcePath, kind, symbol, occurrence))?.valid ?? "A verifier";

  if (valid === "Valide") {
    progress.valid += 1;
  } else if (valid === "Partiel") {
    progress.partial += 1;
  } else if (valid === "Manquant") {
    progress.missing += 1;
  } else if (valid === "Non conforme") {
    progress.nonConforming += 1;
  } else if (valid === "Non applicable") {
    progress.notApplicable += 1;
  }
}

function declarativeRows(
  comparisons: DeclarativeComparison[],
  preserved: Map<string, PreservedCell>,
): Map<string, string[]> {
  const byFile = new Map<string, string[]>();

  for (const table of comparisons) {
    const kind = `declarative:${table.category}`;
    const sourceSymbol = table.tableName;
    const targetFiles = unique([table.primaryTsTarget, ...normalizeArray(table.tsTargets)]);
    const saved = preserved.get(preserveKey(table.sourceFile, kind, sourceSymbol, 0));
    const notes = saved?.notes ?? "";

    const line = [
      `\`${table.sourceFile}\``,
      md(kind),
      `\`${md(sourceSymbol)}\``,
      md(targetFiles.map((file) => `\`${file}\``)),
      `\`${md(sourceSymbol)}\``,
      saved?.valid ?? "A verifier",
      md(table.status ?? ""),
      md(notes),
    ].join(" | ");

    const rows = byFile.get(table.sourceFile) ?? [];
    rows.push(line);
    byFile.set(table.sourceFile, rows);
  }

  return byFile;
}

function isSupplementalSource(sourcePath: string): boolean {
  return SUPPLEMENTAL_MODULE_PREFIXES.some((prefix) => sourcePath.startsWith(prefix));
}

function phase02Findings(entry: Phase02Entry | undefined, expected: ExpectedMapEntry | undefined): string[] {
  return unique([
    entry?.status ? `phase02-structural-status:${entry.status}` : undefined,
    expected?.status ? `expected-map-status:${expected.status}` : undefined,
    ...normalizeArray(entry?.headerFindings),
    ...normalizeArray(entry?.modernNameFindings),
  ]);
}

function supplementalTargetFiles(entry: Phase02Entry | undefined, expected: ExpectedMapEntry | undefined): string[] {
  return unique([
    entry?.declaredPrimaryTsTarget ?? undefined,
    ...normalizeArray(entry?.declaredTsTargets),
    ...normalizeArray(entry?.strictMatches),
    ...normalizeArray(expected?.matchingTsFiles),
  ]);
}

function supplementalRefGlData(existingSourcePaths: Set<string>): { rows: MatrixRow[]; audits: FileAudit[] } {
  if (!existsSync(SOURCE_INDEX_JSON) || !existsSync(PHASE02_STRUCTURE_JSON) || !existsSync(EXPECTED_MAP_JSON)) {
    return { rows: [], audits: [] };
  }

  const sourceIndex = readJson<SourceIndexEntry[]>(SOURCE_INDEX_JSON);
  const phase02 = readJson<{ entries: Phase02Entry[] }>(PHASE02_STRUCTURE_JSON);
  const expectedMap = readJson<ExpectedMapEntry[]>(EXPECTED_MAP_JSON);
  const phase02BySource = new Map(normalizeArray(phase02.entries).map((entry) => [entry.sourcePath, entry]));
  const expectedBySource = new Map(normalizeArray(expectedMap).map((entry) => [entry.sourcePath, entry]));
  const supplementalSources = sourceIndex
    .filter((entry) => isSupplementalSource(entry.path))
    .filter((entry) => !existingSourcePaths.has(entry.path))
    .sort((a, b) => a.path.localeCompare(b.path));

  const rows: MatrixRow[] = [];
  const audits: FileAudit[] = [];
  const symbolKinds: Array<[keyof NonNullable<SourceIndexEntry["symbols"]>, string]> = [
    ["functions", "function"],
    ["macros", "macro"],
    ["typedefs", "typedef"],
    ["structs", "struct"],
    ["enums", "enum"],
    ["globals", "global"],
  ];

  for (const source of supplementalSources) {
    const p2 = phase02BySource.get(source.path);
    const expected = expectedBySource.get(source.path);
    const targetFiles = supplementalTargetFiles(p2, expected);
    const findings = phase02Findings(p2, expected);

    audits.push({
      sourcePath: source.path,
      primaryTsTarget: targetFiles[0],
      tsTargets: targetFiles,
      linkedNpmScripts: REF_GL_TESTS_BY_SOURCE.get(source.path) ?? [],
      verdict: p2?.status ?? expected?.status ?? "supplemental-ref-gl",
      findings: findings.length ? findings : ["supplemental-ref-gl-from-phase00"],
    });

    for (const [sourceKind, matrixKind] of symbolKinds) {
      for (const symbol of normalizeArray(source.symbols?.[sourceKind])) {
        rows.push({
          sourcePath: source.path,
          sourceSymbol: symbol,
          symbolKind: matrixKind,
          primaryTsTarget: targetFiles[0],
          declaredTsTargets: targetFiles,
          tsSymbol: symbol,
          structuralStatus: p2?.status ?? expected?.status,
          findings,
          provisionalVerdict: p2?.status ?? expected?.status,
        });
      }
    }
  }

  return { rows, audits };
}

function writeMatrices(): void {
  const matrix = readJson<{ rows: MatrixRow[]; summary?: Record<string, unknown> }>(MATRIX_JSON);
  const fileAudits = readJson<{ audits: FileAudit[] }>(FILE_AUDITS_JSON);
  const tableAudit = readJson<{ comparisons: DeclarativeComparison[]; requiredCategoryFindings?: Array<{ category: string; finding: string }> }>(TABLES_JSON);
  const supplemental = supplementalRefGlData(new Set(matrix.rows.map((row) => row.sourcePath)));
  const matrixRows = [...matrix.rows, ...supplemental.rows];
  const fileAuditRows = [...normalizeArray(fileAudits.audits), ...supplemental.audits];

  mkdirSync(MATRICES_DIR, { recursive: true });
  const preserved = readPreservedStatuses();
  rmSync(MATRICES_DIR, { recursive: true, force: true });
  mkdirSync(MATRICES_DIR, { recursive: true });

  const rowsByFile = new Map<string, MatrixRow[]>();
  for (const row of matrixRows) {
    const rows = rowsByFile.get(row.sourcePath) ?? [];
    rows.push(row);
    rowsByFile.set(row.sourcePath, rows);
  }

  const tablesByFile = declarativeRows(normalizeArray(tableAudit.comparisons), preserved);
  const auditsByFile = new Map(fileAuditRows.map((audit) => [audit.sourcePath, audit]));
  const allFiles = unique([
    ...Array.from(rowsByFile.keys()),
    ...Array.from(tablesByFile.keys()),
    ...Array.from(auditsByFile.keys()),
  ]).sort();

  const indexRows: string[] = [];
  const globalRows: GlobalProgressRow[] = [];
  let totalRows = 0;

  for (const sourcePath of allFiles) {
    const sourceRows = rowsByFile.get(sourcePath) ?? [];
    const tableRows = tablesByFile.get(sourcePath) ?? [];
    const audit = auditsByFile.get(sourcePath);
    const fileName = sanitizeFileName(sourcePath);
    const fileProgress: GlobalProgressRow = {
      sourcePath,
      matrixFileName: fileName,
      progressFileName: progressFileName(sourcePath),
      status: "A demarrer",
      total: 0,
      valid: 0,
      partial: 0,
      missing: 0,
      nonConforming: 0,
      notApplicable: 0,
      nextBatch: "",
      priority: "Normale",
    };

    const validationOccurrences = new Map<string, number>();
    for (const row of sourceRows) {
      countValidation(
        fileProgress,
        row.sourcePath,
        row.symbolKind,
        row.sourceSymbol,
        preserved,
        occurrenceFor(validationOccurrences, row.sourcePath, row.symbolKind, row.sourceSymbol),
      );
    }

    for (const table of normalizeArray(tableAudit.comparisons).filter((comparison) => comparison.sourceFile === sourcePath)) {
      countValidation(fileProgress, table.sourceFile, `declarative:${table.category}`, table.tableName, preserved, 0);
    }

    fileProgress.status = statusFromCounts(fileProgress);
    fileProgress.priority = sourcePath.includes("/game/")
      || sourcePath.includes("/qcommon/")
      || sourcePath.includes("/server/")
      || sourcePath.includes("/ref_gl/")
      ? "Haute"
      : "Normale";
    fileProgress.nextBatch = readNextBatchFromProgress(fileProgress.progressFileName);
    globalRows.push(fileProgress);

    const matrixPath = path.join(MATRICES_DIR, fileName);
    const linkedTests = unique([
      ...normalizeArray(audit?.linkedNpmScripts).map((script) => `npm run ${script}`),
      ...normalizeArray(audit?.linkedTests),
    ]);
    const targets = unique([
      audit?.primaryTsTarget,
      ...normalizeArray(audit?.tsTargets),
      ...sourceRows.flatMap((row) => [row.primaryTsTarget, ...normalizeArray(row.declaredTsTargets)]),
    ]);
    const findings = unique([
      ...normalizeArray(audit?.findings),
      ...sourceRows.flatMap((row) => normalizeArray(row.findings)),
    ]);

    const lines = [
      `# Validation - ${sourcePath}`,
      "",
      "<!-- Generated by validation-incrementale/tools/generate-validation-matrices.ts. The generator preserves non-default Valide and Notes cells. -->",
      "",
      `- Source: \`${sourcePath}\``,
      `- Cibles TS connues: ${targets.length ? targets.map((target) => `\`${target}\``).join(", ") : "aucune"}`,
      `- Tests connus: ${linkedTests.length ? linkedTests.map((test) => `\`${test}\``).join(", ") : "aucun"}`,
      `- Verdict Phase 03: ${audit?.verdict ?? "inconnu"}`,
      `- Findings Phase 03: ${findings.length ? findings.map((finding) => `\`${finding}\``).join(", ") : "aucun"}`,
      "",
      "| Fichier source | Type entite source | Nom entite source | Fichier cible | Nom entite cible | Valide | Statut auto | Notes |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
      ...(() => {
        const renderOccurrences = new Map<string, number>();
        return sourceRows.map((row) => `| ${formatMatrixRow(
          row,
          preserved,
          occurrenceFor(renderOccurrences, row.sourcePath, row.symbolKind, row.sourceSymbol),
        )} |`);
      })(),
      ...tableRows.map((row) => `| ${row} |`),
      "",
    ];

    totalRows += sourceRows.length + tableRows.length;
    writeFileSync(matrixPath, lines.join("\n"), "utf8");
    indexRows.push(`| [${md(sourcePath)}](matrices/${fileName}) | ${sourceRows.length + tableRows.length} | ${md(audit?.verdict ?? "")} | ${md(audit?.primaryTsTarget ?? "")} |`);
  }

  writeFileSync(
    path.join(OUT_ROOT, "INDEX.md"),
    [
      "# Index des matrices de validation",
      "",
      `- Fichiers source: ${allFiles.length}`,
      `- Entrees de validation: ${totalRows}`,
      `- Matrices: \`validation/matrices/\``,
      "",
      "| Fichier source | Entrees | Verdict Phase 03 | Cible principale |",
      "| --- | ---: | --- | --- |",
      ...indexRows,
      "",
      "## Categories declaratives non extraites",
      "",
      ...normalizeArray(tableAudit.requiredCategoryFindings).map((finding) => `- ${finding.category}: ${finding.finding}`),
      "",
    ].join("\n"),
    "utf8",
  );

  writeFileSync(
    path.join(OUT_ROOT, "AVANCEMENT_GLOBAL.md"),
    [
      "# Avancement global de validation",
      "",
      "Ce fichier est le point d'entree operationnel pour reprendre la validation incrementale.",
      "",
      "Statuts possibles : `A demarrer`, `En cours`, `Bloque`, `Partiel`, `Termine`, `A revoir`.",
      "",
      "| Fichier source | Matrice | Progress | Statut | Entites | Validees | Partielles | Manquantes | Non conformes | Non applicables | Prochain lot | Priorite |",
      "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
      ...globalRows.map((row) => {
        const progressPath = existsSync(path.join(PROGRESS_DIR, row.progressFileName))
          ? `progress/${row.progressFileName}`
          : "";
        return [
          `\`${row.sourcePath}\``,
          `[\`${row.matrixFileName}\`](matrices/${row.matrixFileName})`,
          progressPath ? `[\`${row.progressFileName}\`](${progressPath})` : "",
          row.status,
          row.total,
          row.valid,
          row.partial,
          row.missing,
          row.nonConforming,
          row.notApplicable,
          row.nextBatch,
          row.priority,
        ].join(" | ");
      }).map((line) => `| ${line} |`),
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`Wrote ${allFiles.length} matrices with ${totalRows} rows to ${path.relative(ROOT, MATRICES_DIR)}`);
}

writeMatrices();
