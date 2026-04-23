/**
 * File: quake2-m-berserk-header.ts
 * Purpose: Verify the declarative port of the generated berserk monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_berserk.ts
 */

import {
  FRAME_att_a1,
  FRAME_deathc8,
  FRAME_run1,
  FRAME_slam1,
  FRAME_stand1,
  MODEL_SCALE
} from "../../packages/game/src/m_berserk.js";

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

assertEqual("FRAME_stand1", FRAME_stand1, 0);
assertEqual("FRAME_run1", FRAME_run1, 36);
assertEqual("FRAME_att_a1", FRAME_att_a1, 42);
assertEqual("FRAME_slam1", FRAME_slam1, 146);
assertEqual("FRAME_deathc8", FRAME_deathc8, 243);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-berserk-header: ok");
