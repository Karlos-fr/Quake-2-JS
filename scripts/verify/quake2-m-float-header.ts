/**
 * File: quake2-m-float-header.ts
 * Purpose: Verify the declarative port of the generated float monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_float.ts
 */

import {
  FRAME_actvat01,
  FRAME_attak301,
  FRAME_death13,
  FRAME_pain301,
  FRAME_stand252,
  MODEL_SCALE
} from "../../packages/game/src/m_float.js";

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

assertEqual("FRAME_actvat01", FRAME_actvat01, 0);
assertEqual("FRAME_attak301", FRAME_attak301, 70);
assertEqual("FRAME_death13", FRAME_death13, 116);
assertEqual("FRAME_pain301", FRAME_pain301, 132);
assertEqual("FRAME_stand252", FRAME_stand252, 247);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-float-header: ok");
