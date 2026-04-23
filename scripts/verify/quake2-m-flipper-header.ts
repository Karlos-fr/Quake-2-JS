/**
 * File: quake2-m-flipper-header.ts
 * Purpose: Verify the declarative port of the generated flipper monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_flipper.ts
 */

import {
  FRAME_flpbit01,
  FRAME_flpdth56,
  FRAME_flphor01,
  FRAME_flppn101,
  FRAME_flpver29,
  MODEL_SCALE
} from "../../packages/game/src/m_flipper.js";

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

assertEqual("FRAME_flpbit01", FRAME_flpbit01, 0);
assertEqual("FRAME_flphor01", FRAME_flphor01, 41);
assertEqual("FRAME_flpver29", FRAME_flpver29, 93);
assertEqual("FRAME_flppn101", FRAME_flppn101, 94);
assertEqual("FRAME_flpdth56", FRAME_flpdth56, 159);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-flipper-header: ok");
