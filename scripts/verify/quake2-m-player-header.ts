/**
 * File: quake2-m-player-header.ts
 * Purpose: Verify the declarative port of the generated player model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_player.ts
 */

import {
  FRAME_attack1,
  FRAME_crattak9,
  FRAME_crdeath5,
  FRAME_death308,
  FRAME_flip12,
  FRAME_jump1,
  FRAME_point12,
  FRAME_run1,
  FRAME_stand01,
  FRAME_wave11,
  MODEL_SCALE
} from "../../packages/game/src/m_player.js";

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

assertEqual("FRAME_stand01", FRAME_stand01, 0);
assertEqual("FRAME_run1", FRAME_run1, 40);
assertEqual("FRAME_attack1", FRAME_attack1, 46);
assertEqual("FRAME_jump1", FRAME_jump1, 66);
assertEqual("FRAME_flip12", FRAME_flip12, 83);
assertEqual("FRAME_wave11", FRAME_wave11, 122);
assertEqual("FRAME_point12", FRAME_point12, 134);
assertEqual("FRAME_crattak9", FRAME_crattak9, 168);
assertEqual("FRAME_crdeath5", FRAME_crdeath5, 177);
assertEqual("FRAME_death308", FRAME_death308, 197);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-player-header: ok");
