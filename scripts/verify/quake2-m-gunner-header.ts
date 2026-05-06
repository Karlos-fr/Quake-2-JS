/**
 * File: quake2-m-gunner-header.ts
 * Purpose: Verify the declarative port of the generated gunner monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_gunner.ts
 */

import {
  FRAME_attak101,
  FRAME_death11,
  FRAME_duck08,
  FRAME_run08,
  FRAME_runs06,
  FRAME_stand01,
  FRAME_stand70,
  FRAME_walk01,
  FRAME_walk24,
  MODEL_SCALE
} from "../../packages/game/src/m_gunner.js";

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
assertEqual("FRAME_stand70", FRAME_stand70, 69);
assertEqual("FRAME_walk01", FRAME_walk01, 70);
assertEqual("FRAME_walk24", FRAME_walk24, 93);
assertEqual("FRAME_run08", FRAME_run08, 101);
assertEqual("FRAME_runs06", FRAME_runs06, 107);
assertEqual("FRAME_attak101", FRAME_attak101, 108);
assertEqual("FRAME_death11", FRAME_death11, 200);
assertEqual("FRAME_duck08", FRAME_duck08, 208);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.15);

console.log("quake2-m-gunner-header: ok");
