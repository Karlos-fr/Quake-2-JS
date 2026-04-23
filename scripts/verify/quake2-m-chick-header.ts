/**
 * File: quake2-m-chick-header.ts
 * Purpose: Verify the declarative port of the generated chick monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_chick.ts
 */

import {
  FRAME_attak101,
  FRAME_death223,
  FRAME_recln140,
  FRAME_stand101,
  FRAME_walk27,
  MODEL_SCALE
} from "../../packages/game/src/m_chick.js";

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

assertEqual("FRAME_attak101", FRAME_attak101, 0);
assertEqual("FRAME_death223", FRAME_death223, 82);
assertEqual("FRAME_stand101", FRAME_stand101, 121);
assertEqual("FRAME_walk27", FRAME_walk27, 207);
assertEqual("FRAME_recln140", FRAME_recln140, 287);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-chick-header: ok");
