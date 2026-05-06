/**
 * File: quake2-m-supertank-header.ts
 * Purpose: Verify the declarative port of the generated supertank boss model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_supertank.ts
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as supertank from "../../packages/game/src/m_supertank.js";

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

const SOURCE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_supertank.h"
);

const header = readFileSync(SOURCE_PATH, "utf8");
const frameMacros = Array.from(
  header.matchAll(/^#define\s+(FRAME_\w+)\s+([0-9]+)$/gm),
  (match) => [match[1], Number(match[2])] as const
);

assertEqual("FRAME_* count", frameMacros.length, 254);

for (const [name, expected] of frameMacros) {
  assertEqual(name, (supertank as Record<string, unknown>)[name], expected);
}

const modelScaleMatch = header.match(/^#define\s+MODEL_SCALE\s+([0-9.]+)$/m);
assertEqual("MODEL_SCALE source present", Boolean(modelScaleMatch), true);
assertEqual("MODEL_SCALE", supertank.MODEL_SCALE, Number(modelScaleMatch?.[1]));

console.log("quake2-m-supertank-header: ok");
