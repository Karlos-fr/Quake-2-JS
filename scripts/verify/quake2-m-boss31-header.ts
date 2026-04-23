/**
 * File: quake2-m-boss31-header.ts
 * Purpose: Verify the declarative port of the generated boss31 jorg model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_boss31.ts
 */

import {
  FRAME_attak101,
  FRAME_death50,
  FRAME_pain101,
  FRAME_stand01,
  FRAME_walk25,
  MODEL_SCALE
} from "../../packages/game/src/m_boss31.js";

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

assertEqual("FRAME_attak101", FRAME_attak101, 0);
assertEqual("FRAME_death50", FRAME_death50, 80);
assertEqual("FRAME_pain101", FRAME_pain101, 81);
assertEqual("FRAME_stand01", FRAME_stand01, 112);
assertEqual("FRAME_walk25", FRAME_walk25, 187);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-boss31-header: ok");
