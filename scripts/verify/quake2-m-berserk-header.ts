/**
 * File: quake2-m-berserk-header.ts
 * Purpose: Verify the declarative port of the generated berserk monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_berserk.ts
 */

import * as berserkFrames from "../../packages/game/src/m_berserk.js";

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

function assertFrameSequence(names: string[], firstValue: number): void {
  names.forEach((name, index) => {
    assertEqual(name, berserkFrames[name as keyof typeof berserkFrames], firstValue + index);
  });
}

assertFrameSequence(
  [
    "FRAME_stand1",
    "FRAME_stand2",
    "FRAME_stand3",
    "FRAME_stand4",
    "FRAME_stand5",
    "FRAME_standb1",
    "FRAME_standb2",
    "FRAME_standb3",
    "FRAME_standb4",
    "FRAME_standb5",
    "FRAME_standb6",
    "FRAME_standb7",
    "FRAME_standb8",
    "FRAME_standb9",
    "FRAME_standb10",
    "FRAME_standb11",
    "FRAME_standb12",
    "FRAME_standb13",
    "FRAME_standb14",
    "FRAME_standb15",
    "FRAME_standb16",
    "FRAME_standb17",
    "FRAME_standb18",
    "FRAME_standb19",
    "FRAME_standb20",
    "FRAME_walkc1",
    "FRAME_walkc2",
    "FRAME_walkc3",
    "FRAME_walkc4",
    "FRAME_walkc5",
    "FRAME_walkc6",
    "FRAME_walkc7",
    "FRAME_walkc8",
    "FRAME_walkc9",
    "FRAME_walkc10",
    "FRAME_walkc11",
    "FRAME_run1",
    "FRAME_run2",
    "FRAME_run3",
    "FRAME_run4",
    "FRAME_run5",
    "FRAME_run6",
    "FRAME_att_a1",
    "FRAME_att_a2",
    "FRAME_att_a3",
    "FRAME_att_a4",
    "FRAME_att_a5",
    "FRAME_att_a6",
    "FRAME_att_a7",
    "FRAME_att_a8",
    "FRAME_att_a9",
    "FRAME_att_a10",
    "FRAME_att_a11",
    "FRAME_att_a12",
    "FRAME_att_a13",
    "FRAME_att_b1",
    "FRAME_att_b2",
    "FRAME_att_b3",
    "FRAME_att_b4",
    "FRAME_att_b5",
    "FRAME_att_b6",
    "FRAME_att_b7",
    "FRAME_att_b8",
    "FRAME_att_b9",
    "FRAME_att_b10",
    "FRAME_att_b11",
    "FRAME_att_b12",
    "FRAME_att_b13",
    "FRAME_att_b14",
    "FRAME_att_b15",
    "FRAME_att_b16",
    "FRAME_att_b17",
    "FRAME_att_b18",
    "FRAME_att_b19",
    "FRAME_att_b20",
    "FRAME_att_b21",
    "FRAME_att_c1",
    "FRAME_att_c2",
    "FRAME_att_c3",
    "FRAME_att_c4",
    "FRAME_att_c5",
    "FRAME_att_c6",
    "FRAME_att_c7",
    "FRAME_att_c8",
    "FRAME_att_c9",
    "FRAME_att_c10",
    "FRAME_att_c11",
    "FRAME_att_c12",
    "FRAME_att_c13",
    "FRAME_att_c14",
    "FRAME_att_c15",
    "FRAME_att_c16",
    "FRAME_att_c17",
    "FRAME_att_c18",
    "FRAME_att_c19",
    "FRAME_att_c20",
    "FRAME_att_c21",
    "FRAME_att_c22",
    "FRAME_att_c23",
    "FRAME_att_c24",
    "FRAME_att_c25",
    "FRAME_att_c26",
    "FRAME_att_c27",
    "FRAME_att_c28",
    "FRAME_att_c29",
    "FRAME_att_c30",
    "FRAME_att_c31",
    "FRAME_att_c32",
    "FRAME_att_c33",
    "FRAME_att_c34"
  ],
  0
);

assertEqual("FRAME_slam1", berserkFrames.FRAME_slam1, 146);
assertEqual("FRAME_deathc8", berserkFrames.FRAME_deathc8, 243);
assertEqual("MODEL_SCALE", berserkFrames.MODEL_SCALE, 1.0);

console.log("quake2-m-berserk-header: ok");
