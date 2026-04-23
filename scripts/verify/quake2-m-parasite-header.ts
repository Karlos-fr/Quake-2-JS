/**
 * File: quake2-m-parasite-header.ts
 * Purpose: Verify the declarative port of the generated parasite monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_parasite.ts
 */

import {
  FRAME_break01,
  FRAME_death107,
  FRAME_drain18,
  FRAME_pain111,
  FRAME_run15,
  FRAME_stand35,
  MODEL_SCALE
} from "../../packages/game/src/m_parasite.js";

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

assertEqual("FRAME_break01", FRAME_break01, 0);
assertEqual("FRAME_death107", FRAME_death107, 38);
assertEqual("FRAME_drain18", FRAME_drain18, 56);
assertEqual("FRAME_pain111", FRAME_pain111, 67);
assertEqual("FRAME_run15", FRAME_run15, 82);
assertEqual("FRAME_stand35", FRAME_stand35, 117);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-parasite-header: ok");
