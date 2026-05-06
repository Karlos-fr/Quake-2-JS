/**
 * File: quake2-m-insane-header.ts
 * Purpose: Verify the declarative port of the generated insane monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_insane.ts
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as insaneHeader from "../../packages/game/src/m_insane.js";

/**
 * Category: New
 * Purpose: Fail fast when a declarative frame constant differs from the original header values.
 *
 * Constraints:
 * - Parse the generated header directly so every frame macro and `MODEL_SCALE` remains covered.
 */
function assertEqual<T>(label: string, actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

const HEADER_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_insane.h"
);
const source = readFileSync(HEADER_PATH, "utf8");
const exportsByName = insaneHeader as Record<string, unknown>;

let checked = 0;
for (const match of source.matchAll(/^#define\s+(FRAME_\w+|MODEL_SCALE)\s+([0-9.]+)$/gm)) {
  const [, name, rawExpected] = match;
  assertEqual(name, exportsByName[name], Number.parseFloat(rawExpected));
  checked += 1;
}

assertEqual("macro count", checked, 283);

console.log("quake2-m-insane-header: ok");
