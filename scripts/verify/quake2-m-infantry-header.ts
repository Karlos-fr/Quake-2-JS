/**
 * File: quake2-m-infantry-header.ts
 * Purpose: Verify the declarative port of the generated infantry monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_infantry.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as infantryHeader from "../../packages/game/src/m_infantry.js";

const HEADER_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_infantry.h"
);

/**
 * Category: New
 * Purpose: Fail fast when any declarative frame constant differs from the original header values.
 *
 * Constraints:
 * - Parse the generated header directly so all exported constants are checked against the source.
 */
function parseHeaderMacros(): Array<[name: string, value: number]> {
  const source = readFileSync(HEADER_PATH, "utf8");
  return Array.from(
    source.matchAll(/^#define\s+([A-Za-z0-9_]+)\s+([0-9.]+)/gm),
    (match) => [match[1], Number(match[2])]
  );
}

const headerMacros = parseHeaderMacros();
assert.equal(headerMacros.length, 208, "m_infantry.h macro count");

for (const [name, expected] of headerMacros) {
  assert.equal(
    (infantryHeader as Record<string, unknown>)[name],
    expected,
    `${name} should match Quake-2-master/game/m_infantry.h`
  );
}

console.log("quake2-m-infantry-header: ok");
