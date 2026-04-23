/**
 * File: quake2-m-hover-header.ts
 * Purpose: Verify the declarative port of the generated hover monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_hover.ts
 */

import {
  FRAME_attak101,
  FRAME_backwd24,
  FRAME_death111,
  FRAME_stand01,
  FRAME_takeof30,
  MODEL_SCALE
} from "../../packages/game/src/m_hover.js";

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
assertEqual("FRAME_takeof30", FRAME_takeof30, 111);
assertEqual("FRAME_death111", FRAME_death111, 172);
assertEqual("FRAME_backwd24", FRAME_backwd24, 196);
assertEqual("FRAME_attak101", FRAME_attak101, 197);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-hover-header: ok");
