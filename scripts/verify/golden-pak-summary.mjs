/**
 * File: golden-pak-summary.mjs
 * Purpose: Generate or verify a golden PAK summary snapshot against the local Quake II installation.
 *
 * This file is not a direct source port.
 * It is a verification script for the current filesystem and format port.
 *
 * Dependencies:
 * - node:fs
 * - node:path
 * - packages/formats/src/pak.ts
 * - packages/tests-golden/src/snapshots.ts
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parsePak } from "../../packages/formats/src/pak.ts";
import { assertGoldenSnapshot, createPakSummarySnapshot } from "../../packages/tests-golden/src/snapshots.ts";

const PAK_PATH = path.resolve("Quake 2", "baseq2", "pak0.pak");
const GOLDEN_PATH = path.resolve("fixtures", "golden", "pak0.summary.json");
const WRITE_MODE = process.argv.includes("--write");
const SENTINEL_NAMES = [
  "pics/colormap.pcx",
  "maps/e1m1.bsp",
  "models/players/male/tris.md2",
  "sound/player/jump1.wav"
];

/**
 * Category: NewTooling
 * Purpose: Generate or verify the current golden summary for pak0.pak.
 *
 * Constraints:
 * - Must write deterministic JSON in write mode.
 * - Must fail loudly when verification detects drift.
 */
function main() {
  const bytes = new Uint8Array(readFileSync(PAK_PATH));
  const archive = parsePak(bytes, "Quake 2/baseq2/pak0.pak");
  const snapshot = createPakSummarySnapshot(archive, "Quake 2/baseq2/pak0.pak", SENTINEL_NAMES);

  if (WRITE_MODE) {
    mkdirSync(path.dirname(GOLDEN_PATH), { recursive: true });
    writeFileSync(GOLDEN_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    console.log(`Wrote golden snapshot to ${GOLDEN_PATH}`);
    return;
  }

  const expected = JSON.parse(readFileSync(GOLDEN_PATH, "utf8"));
  assertGoldenSnapshot(snapshot, expected, "pak0.pak summary");
  console.log("pak0.pak golden summary: ok");
}

main();
