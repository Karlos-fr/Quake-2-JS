/**
 * File: quake2-m-actor-header.ts
 * Purpose: Verify the declarative port of the generated misc actor model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_actor.ts
 */

import {
  FRAME_attak01,
  FRAME_crbl_w07,
  FRAME_stand101,
  FRAME_stand201,
  FRAME_walk01,
  MODEL_SCALE
} from "../../packages/game/src/m_actor.js";

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

assertEqual("FRAME_attak01", FRAME_attak01, 0);
assertEqual("FRAME_stand101", FRAME_stand101, 128);
assertEqual("FRAME_stand201", FRAME_stand201, 168);
assertEqual("FRAME_walk01", FRAME_walk01, 251);
assertEqual("FRAME_crbl_w07", FRAME_crbl_w07, 480);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-actor-header: ok");
