/**
 * File: quake2-m-medic-header.ts
 * Purpose: Verify the declarative port of the generated medic monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_medic.ts
 */

import {
  FRAME_attack60,
  FRAME_death30,
  FRAME_duck16,
  FRAME_painb15,
  FRAME_wait90,
  FRAME_walk1,
  MODEL_SCALE
} from "../../packages/game/src/m_medic.js";

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

assertEqual("FRAME_walk1", FRAME_walk1, 0);
assertEqual("FRAME_wait90", FRAME_wait90, 101);
assertEqual("FRAME_painb15", FRAME_painb15, 130);
assertEqual("FRAME_duck16", FRAME_duck16, 146);
assertEqual("FRAME_death30", FRAME_death30, 176);
assertEqual("FRAME_attack60", FRAME_attack60, 236);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-medic-header: ok");
