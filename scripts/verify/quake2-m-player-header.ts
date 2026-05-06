/**
 * File: quake2-m-player-header.ts
 * Purpose: Verify the declarative port of the generated player model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_player.ts
 */

import { readFileSync } from "node:fs";

import * as playerHeader from "../../packages/game/src/m_player.js";

/**
 * Category: New
 * Purpose: Fail fast when one declarative frame constant differs from the original header values.
 *
 * Constraints:
 * - Parse the generated C header so every exported frame constant stays tied to source data.
 */
function assertEqual<T>(label: string, actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

const source = readFileSync(new URL("../../Quake-2-master/game/m_player.h", import.meta.url), "utf8");
const defines = [...source.matchAll(/^#define\s+([A-Z0-9_a-z]+)\s+([0-9.]+)/gm)]
  .map((match) => [match[1], Number(match[2])] as const);

assertEqual("define count", defines.length, 199);

for (const [name, expected] of defines) {
  assertEqual(name, playerHeader[name as keyof typeof playerHeader], expected);
}

console.log("quake2-m-player-header: ok");
