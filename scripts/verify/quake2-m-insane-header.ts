/**
 * File: quake2-m-insane-header.ts
 * Purpose: Verify the declarative port of the generated insane monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_insane.ts
 */

import {
  FRAME_crawl1,
  FRAME_cr_death16,
  FRAME_cross30,
  FRAME_stand1,
  FRAME_st_death18,
  FRAME_walk1,
  MODEL_SCALE
} from "../../packages/game/src/m_insane.js";

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
assertEqual("FRAME_walk1", FRAME_walk1, 173);
assertEqual("FRAME_st_death18", FRAME_st_death18, 226);
assertEqual("FRAME_crawl1", FRAME_crawl1, 227);
assertEqual("FRAME_cr_death16", FRAME_cr_death16, 251);
assertEqual("FRAME_cross30", FRAME_cross30, 281);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-insane-header: ok");
