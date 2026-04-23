/**
 * File: quake2-m-tank-header.ts
 * Purpose: Verify the declarative port of the generated tank monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_tank.ts
 */

import {
  FRAME_attak101,
  FRAME_attak429,
  FRAME_death132,
  FRAME_pain316,
  FRAME_recln140,
  FRAME_stand01,
  MODEL_SCALE
} from "../../packages/game/src/m_tank.js";

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

assertEqual("FRAME_stand01", FRAME_stand01, 0);
assertEqual("FRAME_attak101", FRAME_attak101, 55);
assertEqual("FRAME_attak429", FRAME_attak429, 196);
assertEqual("FRAME_pain316", FRAME_pain316, 221);
assertEqual("FRAME_death132", FRAME_death132, 253);
assertEqual("FRAME_recln140", FRAME_recln140, 293);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-tank-header: ok");
