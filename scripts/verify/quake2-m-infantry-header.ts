/**
 * File: quake2-m-infantry-header.ts
 * Purpose: Verify the declarative port of the generated infantry monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_infantry.ts
 */

import {
  FRAME_attak208,
  FRAME_death309,
  FRAME_gun02,
  FRAME_stand01,
  FRAME_walk20,
  MODEL_SCALE
} from "../../packages/game/src/m_infantry.js";

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

assertEqual("FRAME_gun02", FRAME_gun02, 0);
assertEqual("FRAME_stand01", FRAME_stand01, 1);
assertEqual("FRAME_walk20", FRAME_walk20, 91);
assertEqual("FRAME_death309", FRAME_death309, 178);
assertEqual("FRAME_attak208", FRAME_attak208, 206);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-infantry-header: ok");
