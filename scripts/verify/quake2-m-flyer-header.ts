/**
 * File: quake2-m-flyer-header.ts
 * Purpose: Verify the declarative port of the generated flyer monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_flyer.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as flyer from "../../packages/game/src/m_flyer.js";

const HEADER_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_flyer.h"
);

/**
 * Category: New
 * Purpose: Fail fast when any declarative frame or action constant differs from the original header values.
 *
 * Constraints:
 * - Parse the generated header directly so new checks stay tied to the source.
 */
function parseHeaderMacros(): Map<string, number> {
  const source = readFileSync(HEADER_PATH, "utf8");
  const macros = new Map<string, number>();

  for (const match of source.matchAll(/^#define\s+(\w+)\s+([0-9.]+)$/gm)) {
    macros.set(match[1], Number(match[2]));
  }

  return macros;
}

const headerMacros = parseHeaderMacros();
assert.equal(headerMacros.size, 157, "m_flyer.h macro count");

for (const [name, expected] of headerMacros) {
  const actual = (flyer as Record<string, unknown>)[name];
  assert.equal(actual, expected, name);
}

console.log("quake2-m-flyer-header: ok");
