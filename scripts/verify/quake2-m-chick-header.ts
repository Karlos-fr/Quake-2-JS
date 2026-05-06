/**
 * File: quake2-m-chick-header.ts
 * Purpose: Verify the declarative port of the generated chick monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - Quake-2-master/game/m_chick.h
 * - packages/game/src/m_chick.ts
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as chick from "../../packages/game/src/m_chick.js";

const SOURCE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_chick.h"
);

const source = readFileSync(SOURCE_PATH, "utf8");

/**
 * Category: New
 * Purpose: Fail fast when a declarative frame constant differs from the original header values.
 *
 * Constraints:
 * - Parse the generated header so every frame macro and `MODEL_SCALE` remains covered.
 */
function assertEqual<T>(label: string, actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

const sourceDefines = Array.from(
  source.matchAll(/^#define\s+(FRAME_\w+|MODEL_SCALE)\s+([0-9.]+)/gm),
  (match) => [match[1], Number(match[2])] as const
);

assertEqual("define count", sourceDefines.length, 289);

for (const [name, expected] of sourceDefines) {
  const actual = (chick as Record<string, unknown>)[name];
  assertEqual(name, actual, expected);
}

console.log("quake2-m-chick-header: ok");
