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

import {
  FRAME_attack1,
  FRAME_death50,
  FRAME_pain2,
  FRAME_stand30,
  FRAME_walk1,
  MODEL_SCALE
} from "../../packages/game/src/m_boss2.js";

/**
 * Category: New
 * Purpose: Fail fast when a declarative frame constant differs from the original header values.
 *
 * Constraints:
 * - Keep the checks sparse but representative across the generated table.
 */
function assertEqual<T>(label: string, actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

assertEqual("FRAME_stand30", FRAME_stand30, 0);
assertEqual("FRAME_walk1", FRAME_walk1, 50);
assertEqual("FRAME_attack1", FRAME_attack1, 70);
assertEqual("FRAME_pain2", FRAME_pain2, 110);
assertEqual("FRAME_death50", FRAME_death50, 180);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-boss2-header: ok");
