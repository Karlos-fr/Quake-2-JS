/**
 * File: quake2-m-mutant-header.ts
 * Purpose: Verify the declarative port of the generated mutant monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_mutant.ts
 */

import * as mutant from "../../packages/game/src/m_mutant.js";

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

const expectedFrames: Record<string, number> = {
  FRAME_attack01: 0,
  FRAME_attack02: 1,
  FRAME_attack03: 2,
  FRAME_attack04: 3,
  FRAME_attack05: 4,
  FRAME_attack06: 5,
  FRAME_attack07: 6,
  FRAME_attack08: 7,
  FRAME_attack09: 8,
  FRAME_attack10: 9,
  FRAME_attack11: 10,
  FRAME_attack12: 11,
  FRAME_attack13: 12,
  FRAME_attack14: 13,
  FRAME_attack15: 14,
  FRAME_death101: 15,
  FRAME_death102: 16,
  FRAME_death103: 17,
  FRAME_death104: 18,
  FRAME_death105: 19,
  FRAME_death106: 20,
  FRAME_death107: 21,
  FRAME_death108: 22,
  FRAME_death109: 23,
  FRAME_death201: 24,
  FRAME_death202: 25,
  FRAME_death203: 26,
  FRAME_death204: 27,
  FRAME_death205: 28,
  FRAME_death206: 29,
  FRAME_death207: 30,
  FRAME_death208: 31,
  FRAME_death209: 32,
  FRAME_death210: 33,
  FRAME_pain101: 34,
  FRAME_pain102: 35,
  FRAME_pain103: 36,
  FRAME_pain104: 37,
  FRAME_pain105: 38,
  FRAME_pain201: 39,
  FRAME_pain202: 40,
  FRAME_pain203: 41,
  FRAME_pain204: 42,
  FRAME_pain205: 43,
  FRAME_pain206: 44,
  FRAME_pain301: 45,
  FRAME_pain302: 46,
  FRAME_pain303: 47,
  FRAME_pain304: 48,
  FRAME_pain305: 49,
  FRAME_pain306: 50,
  FRAME_pain307: 51,
  FRAME_pain308: 52,
  FRAME_pain309: 53,
  FRAME_pain310: 54,
  FRAME_pain311: 55,
  FRAME_run03: 56,
  FRAME_stand164: 125,
  FRAME_walk23: 148
};

for (const [name, expected] of Object.entries(expectedFrames)) {
  assertEqual(name, (mutant as Record<string, number>)[name], expected);
}

assertEqual("MODEL_SCALE", mutant.MODEL_SCALE, 1.0);

console.log("quake2-m-mutant-header: ok");
