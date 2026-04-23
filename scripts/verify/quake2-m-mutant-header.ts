/**
 * File: quake2-m-mutant-header.ts
 * Purpose: Verify the declarative port of the generated mutant monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_mutant.ts
 */

import {
  FRAME_attack01,
  FRAME_death210,
  FRAME_pain311,
  FRAME_run03,
  FRAME_stand164,
  FRAME_walk23,
  MODEL_SCALE
} from "../../packages/game/src/m_mutant.js";

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

assertEqual("FRAME_attack01", FRAME_attack01, 0);
assertEqual("FRAME_death210", FRAME_death210, 33);
assertEqual("FRAME_pain311", FRAME_pain311, 55);
assertEqual("FRAME_run03", FRAME_run03, 56);
assertEqual("FRAME_stand164", FRAME_stand164, 125);
assertEqual("FRAME_walk23", FRAME_walk23, 148);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-mutant-header: ok");
