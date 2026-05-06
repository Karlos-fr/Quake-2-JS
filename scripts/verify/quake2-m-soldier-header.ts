/**
 * File: quake2-m-soldier-header.ts
 * Purpose: Verify the declarative port of the generated soldier monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_soldier.ts
 */

import {
  MODEL_SCALE
} from "../../packages/game/src/m_soldier.js";
import * as soldier from "../../packages/game/src/m_soldier.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Category: New
 * Purpose: Fail fast when any generated soldier frame constant differs from the original header values.
 *
 * Constraints:
 * - Parse the generated header directly so every frame macro and `MODEL_SCALE` remains covered.
 */
function assertEqual<T>(label: string, actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

const SOURCE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_soldier.h"
);

const header = readFileSync(SOURCE_PATH, "utf8");
const macros = Array.from(
  header.matchAll(/^#define\s+(FRAME_\w+)\s+([0-9]+)$/gm),
  (match) => [match[1], Number(match[2])] as const
);

assertEqual("macro count", macros.length, 475);

for (const [name, expected] of macros) {
  assertEqual(name, (soldier as Record<string, unknown>)[name], expected);
}

assertEqual("MODEL_SCALE", MODEL_SCALE, 1.2);

console.log("quake2-m-soldier-header: ok");
