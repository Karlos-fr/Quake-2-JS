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
  return match?.[1]?.trim() ?? "";
}

function md(value: unknown): string {
  const text = Array.isArray(value) ? value.join("<br>") : String(value ?? "");
  return text
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|");
}

function preserveKey(sourcePath: string, kind: string, sourceSymbol: string): string {
  return `${sourcePath}\u0000${kind}\u0000${sourceSymbol}`;
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
        preserved.set(preserveKey(sourcePath, kind, sourceSymbol), { valid, notes });
      }
    }
  }

  return preserved;
}

function stripCode(value: string): string {
  return value.replace(/^`/, "").replace(/`$/, "");
}

function formatMatrixRow(row: MatrixRow, preserved: Map<string, PreservedCell>): string {
  const targetFiles = unique([
    row.primaryTsTarget,
    ...normalizeArray(row.declaredTsTargets),
    ...normalizeArray(row.tsSymbolMatches).map((match) => match.file),
  ]);
  const targetSymbols = unique([
    row.tsSymbol,
    ...normalizeArray(row.tsSymbolMatches).map((match) => match.symbol),
  ]);
  const saved = preserved.get(preserveKey(row.sourcePath, row.symbolKind, row.sourceSymbol));
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
): void {
  progress.total += 1;
  const valid = preserved.get(preserveKey(sourcePath, kind, symbol))?.valid ?? "A verifier";

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
    const saved = preserved.get(preserveKey(table.sourceFile, kind, sourceSymbol));
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

function writeMatrices(): void {
  const matrix = readJson<{ rows: MatrixRow[]; summary?: Record<string, unknown> }>(MATRIX_JSON);
  const fileAudits = readJson<{ audits: FileAudit[] }>(FILE_AUDITS_JSON);
  const tableAudit = readJson<{ comparisons: DeclarativeComparison[]; requiredCategoryFindings?: Array<{ category: string; finding: string }> }>(TABLES_JSON);

  mkdirSync(MATRICES_DIR, { recursive: true });
  const preserved = readPreservedStatuses();
  rmSync(MATRICES_DIR, { recursive: true, force: true });
  mkdirSync(MATRICES_DIR, { recursive: true });

  const rowsByFile = new Map<string, MatrixRow[]>();
  for (const row of matrix.rows) {
    const rows = rowsByFile.get(row.sourcePath) ?? [];
    rows.push(row);
    rowsByFile.set(row.sourcePath, rows);
  }

  const tablesByFile = declarativeRows(normalizeArray(tableAudit.comparisons), preserved);
  const auditsByFile = new Map(normalizeArray(fileAudits.audits).map((audit) => [audit.sourcePath, audit]));
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

    for (const row of sourceRows) {
      countValidation(fileProgress, row.sourcePath, row.symbolKind, row.sourceSymbol, preserved);
    }

    for (const table of normalizeArray(tableAudit.comparisons).filter((comparison) => comparison.sourceFile === sourcePath)) {
      countValidation(fileProgress, table.sourceFile, `declarative:${table.category}`, table.tableName, preserved);
    }

    fileProgress.status = statusFromCounts(fileProgress);
    fileProgress.priority = sourcePath.includes("/game/") || sourcePath.includes("/qcommon/") || sourcePath.includes("/server/")
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
      ...sourceRows.map((row) => `| ${formatMatrixRow(row, preserved)} |`),
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
