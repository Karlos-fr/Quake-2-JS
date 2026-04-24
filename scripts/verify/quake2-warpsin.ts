/**
 * File: quake2-warpsin.ts
 * Purpose: Verify that the TypeScript port of `ref_gl/warpsin.h` preserves the canonical turbulence sine table.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a renderer header table.
 *
 * Dependencies:
 * - packages/renderer-three/src/warpsin.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { r_turbsin } from "../../packages/renderer-three/src/index.js";

const sourcePath = resolve("Quake-2-master/ref_gl/warpsin.h");
const sourceText = readFileSync(sourcePath, "utf8");
const sourceWithoutComments = sourceText.replace(/\/\*[\s\S]*?\*\//g, "");
const sourceValues = sourceWithoutComments.match(/[-+]?(?:\d+\.\d*|\.\d+|\d+)(?:e[-+]?\d+)?/gi)?.map(Number) ?? [];

assert.equal(sourceValues.length, 256, "ref_gl/warpsin.h entry count mismatch");
assert.equal(r_turbsin.length, 256, "r_turbsin entry count mismatch");

for (let index = 0; index < sourceValues.length; index++) {
  assert.equal(r_turbsin[index], sourceValues[index], `r_turbsin[${index}] mismatch`);
}

assert.equal(r_turbsin[0], 0, "r_turbsin first sample mismatch");
assert.equal(r_turbsin[64], 8, "r_turbsin positive peak mismatch");
assert.equal(r_turbsin[128], 9.79717e-16, "r_turbsin midpoint epsilon mismatch");
assert.equal(r_turbsin[192], -8, "r_turbsin negative peak mismatch");

console.log("quake2-warpsin: ok");
