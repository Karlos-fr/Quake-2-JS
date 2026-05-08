/**
 * File: quake2-anormtab.ts
 * Purpose: Verify the strict TypeScript port of `ref_gl/anormtab.h`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the GL alias-model shadedot lookup table.
 *
 * Dependencies:
 * - packages/renderer-three/src/anormtab.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  getAliasShadedot,
  getAliasShadedots,
  R_AVERTEXNORMAL_DOTS,
  SHADEDOT_NORMALS,
  SHADEDOT_QUANT
} from "../../packages/renderer-three/src/anormtab.js";

const repoRoot = process.cwd();
const source = readFileSync(join(repoRoot, "Quake-2-master", "ref_gl", "anormtab.h"), "utf8");
const sourceRows = source
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.startsWith("{") && line.includes(",") && /^.*\},?$/.test(line))
  .map((line) =>
    line
      .replace(/^\{|\},?$/g, "")
      .split(",")
      .filter((value) => value.length > 0)
      .map(Number)
  );

assert.equal(SHADEDOT_QUANT, 16, "SHADEDOT_QUANT mismatch");
assert.equal(SHADEDOT_NORMALS, 256, "SHADEDOT_NORMALS mismatch");
assert.equal(R_AVERTEXNORMAL_DOTS.length, SHADEDOT_QUANT, "shadedot row count mismatch");
assert.equal(sourceRows.length, SHADEDOT_QUANT, "source shadedot row count mismatch");

for (const [rowIndex, row] of R_AVERTEXNORMAL_DOTS.entries()) {
  assert.equal(row.length, SHADEDOT_NORMALS, `shadedot column count mismatch at row ${rowIndex}`);
  assert.equal(sourceRows[rowIndex]?.length, SHADEDOT_NORMALS, `source shadedot column count mismatch at row ${rowIndex}`);
  assert.deepEqual(row, sourceRows[rowIndex], `full shadedot row mismatch at row ${rowIndex}`);
}

assert.equal(R_AVERTEXNORMAL_DOTS[0][0], 1.23, "R_AVERTEXNORMAL_DOTS[0][0] mismatch");
assert.equal(R_AVERTEXNORMAL_DOTS[0][11], 1.97, "R_AVERTEXNORMAL_DOTS[0][11] mismatch");
assert.equal(R_AVERTEXNORMAL_DOTS[0][160], 0.73, "R_AVERTEXNORMAL_DOTS[0][160] mismatch");
assert.equal(R_AVERTEXNORMAL_DOTS[4][52], 1.0, "R_AVERTEXNORMAL_DOTS[4][52] mismatch");
assert.equal(R_AVERTEXNORMAL_DOTS[7][149], 1.09, "R_AVERTEXNORMAL_DOTS[7][149] mismatch");
assert.equal(R_AVERTEXNORMAL_DOTS[8][132], 1.79, "R_AVERTEXNORMAL_DOTS[8][132] mismatch");
assert.equal(R_AVERTEXNORMAL_DOTS[15][0], 1.26, "R_AVERTEXNORMAL_DOTS[15][0] mismatch");
assert.equal(R_AVERTEXNORMAL_DOTS[15][255], 1.0, "R_AVERTEXNORMAL_DOTS[15][255] mismatch");

assert.equal(getAliasShadedots(-1), R_AVERTEXNORMAL_DOTS[15], "negative row wrapping mismatch");
assert.equal(getAliasShadedots(16), R_AVERTEXNORMAL_DOTS[0], "positive row wrapping mismatch");
assert.equal(getAliasShadedot(-1, 0), 1.26, "wrapped row sample mismatch");
assert.equal(getAliasShadedot(0, -1), 1.0, "negative lightnormal fallback mismatch");
assert.equal(getAliasShadedot(0, SHADEDOT_NORMALS), 1.0, "out-of-range lightnormal fallback mismatch");

console.log("quake2-anormtab: ok");
