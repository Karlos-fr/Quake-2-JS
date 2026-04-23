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

import {
  FRAME_attak1_1,
  FRAME_backwd_18,
  FRAME_death_47,
  FRAME_pain3_12,
  FRAME_right_18,
  FRAME_stand_60,
  MODEL_SCALE
} from "../../packages/game/src/m_supertank.js";

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

assertEqual("FRAME_attak1_1", FRAME_attak1_1, 0);
assertEqual("FRAME_backwd_18", FRAME_backwd_18, 97);
assertEqual("FRAME_death_47", FRAME_death_47, 127);
assertEqual("FRAME_pain3_12", FRAME_pain3_12, 175);
assertEqual("FRAME_right_18", FRAME_right_18, 193);
assertEqual("FRAME_stand_60", FRAME_stand_60, 253);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-supertank-header: ok");
