/**
 * File: quake2-m-brain-header.ts
 * Purpose: Verify the declarative port of the generated brain monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_brain.ts
 */

import {
  FRAME_attak101,
  FRAME_death205,
  FRAME_pain101,
  FRAME_stand60,
  FRAME_walk101,
  MODEL_SCALE
} from "../../packages/game/src/m_brain.js";

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

assertEqual("FRAME_walk101", FRAME_walk101, 0);
assertEqual("FRAME_attak101", FRAME_attak101, 53);
assertEqual("FRAME_pain101", FRAME_pain101, 88);
assertEqual("FRAME_death205", FRAME_death205, 145);
assertEqual("FRAME_stand60", FRAME_stand60, 221);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-brain-header: ok");
