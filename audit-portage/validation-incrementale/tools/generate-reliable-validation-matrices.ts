import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_ROOT = path.join(ROOT, "audit-portage/validation-incrementale/validation");
const MATRICES_DIR = path.join(ROOT, "audit-portage/validation-incrementale/validation/matrices");
const AVANCEMENT_GLOBAL = path.join(OUT_ROOT, "AVANCEMENT_GLOBAL.md");
const C_SYMBOL_INDEX_JSON = path.join(
  ROOT,
  "audit-portage/phases/phase-03-runtime-exhaustif/generated/phase-03-c-symbol-index.json",
);
const BASE_GENERATOR = path.join(
  ROOT,
  "audit-portage/validation-incrementale/tools/generate-validation-matrices.ts",
);
const TSX_CLI = path.join(ROOT, "node_modules/tsx/dist/cli.mjs");
const SOURCE_DEFINITIONS = buildSourceDefinitions();

type TableRow = {
  cells: string[];
  originalLine: string;
};

type RepairResult = {
  changed: boolean;
  line?: string;
  removed: boolean;
};

type GlobalRowMeta = {
  matrixFileName: string;
  progress: string;
  nextBatch: string;
  priority: string;
};

type GlobalCounts = {
  total: number;
  valid: number;
  partial: number;
  missing: number;
  nonConforming: number;
  notApplicable: number;
};

function stripCode(value: string): string {
  return value.trim().replace(/^`/, "").replace(/`$/, "");
}

function code(value: string): string {
  return value ? `\`${value}\`` : "";
}

function md(value: string): string {
  return value.replace(/\r?\n/g, "<br>").replace(/\|/g, "\\|");
}

function splitTableLine(line: string): string[] {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

function buildSourceDefinitions(): Map<string, string[]> {
  const definitions = new Map<string, Set<string>>();

  if (!existsSync(C_SYMBOL_INDEX_JSON)) {
    return new Map();
  }

  const index = JSON.parse(readFileSync(C_SYMBOL_INDEX_JSON, "utf8")) as {
    files?: Array<{
      path?: string;
      symbols?: Array<{
        name?: string;
        kind?: string;
        file?: string;
        signature?: string;
        confidence?: string;
      }>;
    }>;
  };

  for (const file of index.files ?? []) {
    for (const symbolRecord of file.symbols ?? []) {
      if (symbolRecord.kind !== "function" || symbolRecord.confidence !== "high" || !symbolRecord.name) {
        continue;
      }

      const sourcePath = symbolRecord.file ?? file.path;
      if (!sourcePath) {
        continue;
      }

      const entries = definitions.get(symbolRecord.name) ?? new Set<string>();
      entries.add(sourcePath);
      definitions.set(symbolRecord.name, entries);
    }
  }

  return new Map(
    Array.from(definitions.entries()).map(([symbol, files]) => [symbol, Array.from(files).sort()]),
  );
}

function findSourceDefinitions(symbol: string): string[] {
  return SOURCE_DEFINITIONS.get(symbol) ?? [];
}

function parseRow(line: string): TableRow | undefined {
  if (!line.startsWith("| `")) {
    return undefined;
  }
  const cells = splitTableLine(line);
  return cells.length >= 8 ? { cells, originalLine: line } : undefined;
}

function statusFromCounts(counts: GlobalCounts): string {
  if (counts.total === 0) {
    return "A revoir";
  }

  if (counts.missing > 0 || counts.nonConforming > 0) {
    return "Bloque";
  }

  if (counts.partial > 0) {
    return "Partiel";
  }

  if (counts.valid + counts.notApplicable >= counts.total) {
    return "Termine";
  }

  if (counts.valid > 0 || counts.notApplicable > 0) {
    return "En cours";
  }

  return "A demarrer";
}

function readGlobalMetadata(): { order: string[]; metadata: Map<string, GlobalRowMeta> } {
  const order: string[] = [];
  const metadata = new Map<string, GlobalRowMeta>();

  if (!existsSync(AVANCEMENT_GLOBAL)) {
    return { order, metadata };
  }

  for (const line of readFileSync(AVANCEMENT_GLOBAL, "utf8").split(/\r?\n/)) {
    if (!line.startsWith("| `")) {
      continue;
    }

    const cells = splitTableLine(line);
    if (cells.length < 12) {
      continue;
    }

    const sourcePath = stripCode(cells[0]);
    const matrixFileName = /\(matrices\/([^)]+)\)/.exec(cells[1])?.[1] ?? "";
    if (!sourcePath || !matrixFileName) {
      continue;
    }

    order.push(sourcePath);
    metadata.set(sourcePath, {
      matrixFileName,
      progress: cells[2],
      nextBatch: cells[10],
      priority: cells[11],
    });
  }

  return { order, metadata };
}

function countMatrixRows(matrixPath: string): { sourcePath: string; counts: GlobalCounts } | undefined {
  const counts: GlobalCounts = {
    total: 0,
    valid: 0,
    partial: 0,
    missing: 0,
    nonConforming: 0,
    notApplicable: 0,
  };
  let sourcePath = "";

  for (const line of readFileSync(matrixPath, "utf8").split(/\r?\n/)) {
    const sourceMatch = /^- Source:\s*`([^`]+)`/.exec(line);
    if (sourceMatch?.[1]) {
      sourcePath ||= sourceMatch[1];
    }

    const row = parseRow(line);
    if (!row) {
      continue;
    }

    sourcePath ||= stripCode(row.cells[0]);
    counts.total += 1;
    const validation = row.cells[5];
    if (validation === "Valide") {
      counts.valid += 1;
    } else if (validation === "Partiel") {
      counts.partial += 1;
    } else if (validation === "Manquant") {
      counts.missing += 1;
    } else if (validation === "Non conforme") {
      counts.nonConforming += 1;
    } else if (validation === "Non applicable") {
      counts.notApplicable += 1;
    }
  }

  return sourcePath ? { sourcePath, counts } : undefined;
}

function refreshGlobalProgress(): void {
  const { order, metadata } = readGlobalMetadata();
  const countsBySource = new Map<string, GlobalCounts>();
  const matrixBySource = new Map<string, string>();

  for (const fileName of readdirSync(MATRICES_DIR)) {
    if (!fileName.endsWith(".md")) {
      continue;
    }

    const counted = countMatrixRows(path.join(MATRICES_DIR, fileName));
    if (!counted) {
      continue;
    }

    countsBySource.set(counted.sourcePath, counted.counts);
    matrixBySource.set(counted.sourcePath, fileName);
  }

  const orderedSources = [
    ...order.filter((sourcePath) => countsBySource.has(sourcePath)),
    ...Array.from(countsBySource.keys()).filter((sourcePath) => !order.includes(sourcePath)).sort(),
  ];

  writeFileSync(
    AVANCEMENT_GLOBAL,
    [
      "# Avancement global de validation",
      "",
      "Ce fichier est le point d'entree operationnel pour reprendre la validation incrementale.",
      "",
      "Statuts possibles : `A demarrer`, `En cours`, `Bloque`, `Partiel`, `Termine`, `A revoir`.",
      "",
      "| Fichier source | Matrice | Progress | Statut | Entites | Validees | Partielles | Manquantes | Non conformes | Non applicables | Prochain lot | Priorite |",
      "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
      ...orderedSources.map((sourcePath) => {
        const counts = countsBySource.get(sourcePath)!;
        const meta = metadata.get(sourcePath);
        const matrixFileName = meta?.matrixFileName || matrixBySource.get(sourcePath)!;
        return [
          code(sourcePath),
          `[${code(matrixFileName)}](matrices/${matrixFileName})`,
          meta?.progress ?? "",
          statusFromCounts(counts),
          counts.total,
          counts.valid,
          counts.partial,
          counts.missing,
          counts.nonConforming,
          counts.notApplicable,
          meta?.nextBatch ?? "",
          meta?.priority ?? "Normale",
        ].join(" | ");
      }).map((line) => `| ${line} |`),
      "",
    ].join("\n"),
    "utf8",
  );
}

function repairRow(row: TableRow): RepairResult {
  const cells = [...row.cells];
  const sourcePath = stripCode(cells[0]);
  const kind = cells[1];
  const sourceSymbol = stripCode(cells[2]);

  if (kind !== "function" || !sourcePath.endsWith(".c")) {
    return { changed: false, line: row.originalLine, removed: false };
  }

  const allDefinitions = findSourceDefinitions(sourceSymbol);
  if (allDefinitions.includes(sourcePath)) {
    return { changed: false, line: row.originalLine, removed: false };
  }
  const definitions = allDefinitions.filter((definitionPath) => definitionPath !== sourcePath);

  if (definitions.length === 0) {
    return { changed: false, line: row.originalLine, removed: false };
  }

  return { changed: true, removed: true };
}

function runBaseGenerator(): void {
  const command = existsSync(TSX_CLI) ? process.execPath : process.platform === "win32" ? "npx.cmd" : "npx";
  const args = existsSync(TSX_CLI) ? [TSX_CLI, BASE_GENERATOR] : ["tsx", BASE_GENERATOR];
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    const errorDetail = result.error ? ` (${result.error.message})` : "";
    throw new Error(`Base validation matrix generator failed with exit code ${result.status ?? "unknown"}${errorDetail}.`);
  }
}

function repairMatrices(): void {
  let removedRows = 0;
  for (const fileName of readdirSync(MATRICES_DIR)) {
    if (!fileName.endsWith(".md")) {
      continue;
    }

    const matrixPath = path.join(MATRICES_DIR, fileName);
    const lines = readFileSync(matrixPath, "utf8").split(/\r?\n/);
    const repaired = lines.flatMap((line) => {
      const row = parseRow(line);
      if (!row) {
        return [line];
      }

      const result = repairRow(row);
      if (result.removed) {
        removedRows += 1;
        return [];
      }
      return [result.line ?? line];
    });

    if (repaired.some((line, index) => line !== lines[index])) {
      writeFileSync(matrixPath, repaired.join("\n"), "utf8");
    }
  }

  console.log(`Reliable validation matrix postprocess removed ${removedRows} external call row(s).`);
}

function main(): void {
  const shouldRunBaseGenerator = process.argv.includes("--with-base");

  if (shouldRunBaseGenerator) {
    runBaseGenerator();
  }

  repairMatrices();
  refreshGlobalProgress();
}

main();
