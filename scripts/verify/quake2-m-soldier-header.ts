/**
 * File: quake2-m-soldier-header.ts
 * Purpose: Verify the declarative port of the generated soldier monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_soldier.ts
 */

import {
  FRAME_attak101,
  FRAME_death610,
  FRAME_pain417,
  FRAME_runs18,
  FRAME_stand339,
  FRAME_walk224,
  MODEL_SCALE
} from "../../packages/game/src/m_soldier.js";

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
assertEqual("FRAME_pain417", FRAME_pain417, 96);
assertEqual("FRAME_runs18", FRAME_runs18, 126);
assertEqual("FRAME_stand339", FRAME_stand339, 214);
assertEqual("FRAME_walk224", FRAME_walk224, 271);
assertEqual("FRAME_death610", FRAME_death610, 474);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.2);

console.log("quake2-m-soldier-header: ok");
