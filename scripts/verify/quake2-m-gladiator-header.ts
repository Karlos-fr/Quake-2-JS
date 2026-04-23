/**
 * File: quake2-m-gladiator-header.ts
 * Purpose: Verify the declarative port of the generated gladiator monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_gladiator.ts
 */

import {
  FRAME_attack1,
  FRAME_death22,
  FRAME_melee1,
  FRAME_painup7,
  FRAME_stand1,
  MODEL_SCALE
} from "../../packages/game/src/m_gladiator.js";

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

assertEqual("FRAME_stand1", FRAME_stand1, 0);
assertEqual("FRAME_melee1", FRAME_melee1, 29);
assertEqual("FRAME_attack1", FRAME_attack1, 46);
assertEqual("FRAME_death22", FRAME_death22, 82);
assertEqual("FRAME_painup7", FRAME_painup7, 89);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-gladiator-header: ok");
