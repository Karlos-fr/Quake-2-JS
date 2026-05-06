/**
 * File: quake2-m-mutant-header.ts
 * Purpose: Verify the declarative port of the generated mutant monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_mutant.ts
 */

import * as mutant from "../../packages/game/src/m_mutant.js";

/**
 * Category: New
 * Purpose: Fail fast when a declarative frame constant differs from the original header values.
 *
 * Constraints:
 * - Parse the original generated header so every frame constant stays pinned to
 *   the C/H source of truth.
 */
function assertEqual<T>(label: string, actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

const headerText = await import("node:fs/promises").then((fs) =>
  fs.readFile("Quake-2-master/game/m_mutant.h", "utf8")
);

const expectedFrames: Record<string, number> = {};
for (const match of headerText.matchAll(/^#define\s+(FRAME_\w+)\s+(\d+)/gm)) {
  expectedFrames[match[1]] = Number(match[2]);
}

assertEqual("FRAME_* count", Object.keys(expectedFrames).length, 149);

for (const [name, expected] of Object.entries(expectedFrames)) {
  assertEqual(name, (mutant as Record<string, number>)[name], expected);
}

assertEqual("MODEL_SCALE", mutant.MODEL_SCALE, 1.0);

console.log("quake2-m-mutant-header: ok");
