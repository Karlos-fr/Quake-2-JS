/**
 * File: quake2-m-boss2-header.ts
 * Purpose: Verify the declarative port of the generated boss2 monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_boss2.ts
 */

import * as boss2 from "../../packages/game/src/m_boss2.js";

/**
 * Category: New
 * Purpose: Fail fast when a declarative frame constant differs from the original header values.
 *
 * Constraints:
 * - Keep broad range checks for validated lots and sparse checks for the remaining table.
 */
function assertEqual<T>(label: string, actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assertFrameRange(prefix: string, first: number, last: number, expectedStart: number): void {
  for (let frame = first; frame <= last; frame++) {
    const name = `FRAME_${prefix}${frame}`;
    assertEqual(name, boss2[name as keyof typeof boss2], expectedStart + frame - first);
  }
}

assertFrameRange("stand", 30, 50, 0);
assertFrameRange("stand", 1, 29, 21);
assertFrameRange("walk", 1, 20, 50);
assertFrameRange("attack", 1, 40, 70);
assertFrameRange("pain", 2, 23, 110);
assertFrameRange("death", 2, 50, 132);

assertEqual("MODEL_SCALE", boss2.MODEL_SCALE, 1.0);

console.log("quake2-m-boss2-header: ok");
