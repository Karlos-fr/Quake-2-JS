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

assertEqual("FRAME_attack1", boss2.FRAME_attack1, 70);
assertEqual("FRAME_pain2", boss2.FRAME_pain2, 110);
assertEqual("FRAME_death50", boss2.FRAME_death50, 180);
assertEqual("MODEL_SCALE", boss2.MODEL_SCALE, 1.0);

console.log("quake2-m-boss2-header: ok");
