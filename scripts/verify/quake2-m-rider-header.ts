/**
 * File: quake2-m-rider-header.ts
 * Purpose: Verify that the TypeScript target for `game/m_rider.h` preserves the generated rider frame table.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - Quake-2-master/game/m_rider.h
 * - packages/game/src/m_rider.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as rider from "../../packages/game/src/m_rider.js";

const HEADER_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_rider.h"
);

/**
 * Category: New
 * Purpose: Fail fast when any declarative rider frame constant differs from the original header values.
 *
 * Constraints:
 * - Parse the generated header directly so every frame macro and `MODEL_SCALE` remains covered.
 */
function parseHeaderMacros(): Map<string, number> {
  const source = readFileSync(HEADER_PATH, "utf8");
  const macros = new Map<string, number>();

  for (const match of source.matchAll(/^#define\s+(FRAME_\w+|MODEL_SCALE)\s+([0-9.]+)$/gm)) {
    macros.set(match[1], Number(match[2]));
  }

  return macros;
}

const headerMacros = parseHeaderMacros();
assert.equal(headerMacros.size, 61, "m_rider.h macro count");

for (const [name, expected] of headerMacros) {
  const actual = (rider as Record<string, unknown>)[name];
  assert.equal(actual, expected, `${name} mismatch`);
}

console.log("quake2-m-rider-header: ok");
