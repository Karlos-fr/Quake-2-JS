/**
 * File: quake2-m-boss32-header.ts
 * Purpose: Verify the declarative port of the generated boss32 rider model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_boss32.ts
 */

import {
  FRAME_active01,
  FRAME_attak101,
  FRAME_attak516,
  FRAME_death320,
  FRAME_jump13,
  FRAME_pain627,
  FRAME_stand201,
  FRAME_stand260,
  FRAME_walk217,
  MODEL_SCALE
} from "../../packages/game/src/m_boss32.js";

/**
 * Category: New
 * Purpose: Fail fast when one declarative frame constant differs from the original header values.
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
assertEqual("FRAME_active01", FRAME_active01, 188);
assertEqual("FRAME_attak516", FRAME_attak516, 250);
assertEqual("FRAME_death320", FRAME_death320, 365);
assertEqual("FRAME_jump13", FRAME_jump13, 378);
assertEqual("FRAME_pain627", FRAME_pain627, 413);
assertEqual("FRAME_stand201", FRAME_stand201, 414);
assertEqual("FRAME_stand260", FRAME_stand260, 473);
assertEqual("FRAME_walk217", FRAME_walk217, 490);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-boss32-header: ok");
