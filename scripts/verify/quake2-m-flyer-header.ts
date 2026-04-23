/**
 * File: quake2-m-flyer-header.ts
 * Purpose: Verify the declarative port of the generated flyer monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_flyer.ts
 */

import {
  ACTION_attack1,
  ACTION_walk,
  FRAME_attak101,
  FRAME_pain304,
  FRAME_stand45,
  FRAME_start01,
  MODEL_SCALE
} from "../../packages/game/src/m_flyer.js";

/**
 * Category: New
 * Purpose: Fail fast when a declarative frame or action constant differs from the original header values.
 *
 * Constraints:
 * - Keep the checks sparse but representative across the generated table.
 */
function assertEqual<T>(label: string, actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

assertEqual("ACTION_attack1", ACTION_attack1, 1);
assertEqual("ACTION_walk", ACTION_walk, 4);
assertEqual("FRAME_start01", FRAME_start01, 0);
assertEqual("FRAME_attak101", FRAME_attak101, 58);
assertEqual("FRAME_stand45", FRAME_stand45, 57);
assertEqual("FRAME_pain304", FRAME_pain304, 150);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-flyer-header: ok");
