/**
 * File: quake2-m-hover-header.ts
 * Purpose: Verify the declarative port of the generated hover monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - Quake-2-master/game/m_hover.h
 * - packages/game/src/m_hover.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as hover from "../../packages/game/src/m_hover.js";

const HEADER_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_hover.h"
);

/**
 * Category: New
 * Purpose: Fail fast when any declarative frame constant differs from the original header values.
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
assert.equal(headerMacros.size, 206, "m_hover.h macro count");

for (const [name, expected] of headerMacros) {
  const actual = (hover as Record<string, unknown>)[name];
  assert.equal(actual, expected, name);
}

console.log("quake2-m-hover-header: ok");
