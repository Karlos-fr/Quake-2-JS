/**
 * File: build-source-module-map.mjs
 * Purpose: Build an explicit mapping between original Quake II source files and their TypeScript targets.
 *
 * This file is not a direct source port.
 * It is an analysis tool that consolidates the human-maintained tracking table with generated stub locations.
 *
 * Dependencies:
 * - node:fs
 * - node:path
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const PORTAGE_FILE = path.resolve("PORTAGE_QUAKE2.md");
const OUTPUT_ROOT = path.resolve("tools", "c-analyzer", "out");
const OUTPUT_FILE = path.join(OUTPUT_ROOT, "source-to-ts-map.json");
const GENERATED_STUB_ROOT = path.resolve("generated", "ts-stubs");

/**
 * Category: NewTooling
 * Purpose: Parse the tracking markdown and emit a machine-readable source-to-target map.
 *
 * Constraints:
 * - Must preserve every original tracked row.
 * - Must reflect both declared targets and generated stub targets.
 */
function main() {
  const rows = parseTrackingRows(readFileSync(PORTAGE_FILE, "utf8"));
  const mappings = rows.map(buildMappingEntry);
  const payload = {
    generatedAt: new Date().toISOString(),
    sourceTrackingFile: PORTAGE_FILE,
    totalEntries: mappings.length,
    mappedEntries: mappings.filter((entry) => entry.declaredTargets.length > 0 || entry.generatedStubTarget !== null).length,
    entries: mappings
  };

  mkdirSync(OUTPUT_ROOT, { recursive: true });
  writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Mapped ${payload.mappedEntries}/${payload.totalEntries} source entries into ${OUTPUT_FILE}`);
}

/**
 * Category: NewTooling
 * Purpose: Parse table rows from the Markdown tracking file.
 *
 * Constraints:
 * - Must only consider data rows from the main tracking table.
 */
function parseTrackingRows(markdown) {
  const lines = markdown.split(/\r?\n/);
  const rows = [];
  let inTable = false;

  for (const line of lines) {
    if (!line.startsWith("|")) {
      if (inTable) {
        break;
      }
      continue;
    }

    if (line.startsWith("| Path |")) {
      inTable = true;
      continue;
    }

    if (!inTable || line.startsWith("|---")) {
      continue;
    }

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

    if (cells.length < 6) {
      continue;
    }

    rows.push({
      sourcePath: toPortablePath(cells[0]),
      name: cells[1],
      description: cells[2],
      toPort: cells[3],
      ported: cells[4],
      target: cells[5]
    });
  }

  return rows;
}

/**
 * Category: NewTooling
 * Purpose: Build one mapping record from a tracking row.
 *
 * Constraints:
 * - Must preserve explicit targets exactly as declared in the tracking file.
 */
function buildMappingEntry(row) {
  const declaredTargets = row.target
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const generatedStubTarget = getGeneratedStubTarget(row.sourcePath);

  return {
    sourcePath: row.sourcePath,
    name: row.name,
    description: row.description,
    toPort: row.toPort || null,
    ported: row.ported || null,
    declaredTargets,
    generatedStubTarget
  };
}

/**
 * Category: NewTooling
 * Purpose: Compute the generated stub target path for a source file when one exists.
 *
 * Constraints:
 * - Must mirror the stub-generator output layout exactly.
 */
function getGeneratedStubTarget(sourcePath) {
  const parsed = path.parse(sourcePath);
  const stubPath = path.join(GENERATED_STUB_ROOT, parsed.dir, `${parsed.name}.ts`);
  return existsSync(stubPath) ? toPortablePath(path.relative(process.cwd(), stubPath)) : null;
}

/**
 * Category: NewTooling
 * Purpose: Normalize Windows paths to forward-slash form for stable JSON output.
 *
 * Constraints:
 * - Must preserve the logical path content.
 */
function toPortablePath(value) {
  return value.replaceAll("\\", "/");
}

main();
