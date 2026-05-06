/**
 * File: quake2-m-actor-header.ts
 * Purpose: Verify the declarative port of the generated misc actor model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_actor.ts
 */

import * as actor from "../../packages/game/src/m_actor.js";

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

function assertFrameRange(frames: Array<keyof typeof actor>, firstValue: number): void {
  for (const [offset, name] of frames.entries()) {
    assertEqual(name, actor[name], firstValue + offset);
  }
}

const actorOpeningFrames: Array<[keyof typeof actor, number]> = [
  ["FRAME_attak01", 0],
  ["FRAME_attak02", 1],
  ["FRAME_attak03", 2],
  ["FRAME_attak04", 3],
  ["FRAME_death101", 4],
  ["FRAME_death102", 5],
  ["FRAME_death103", 6],
  ["FRAME_death104", 7],
  ["FRAME_death105", 8],
  ["FRAME_death106", 9],
  ["FRAME_death107", 10],
  ["FRAME_death201", 11],
  ["FRAME_death202", 12],
  ["FRAME_death203", 13],
  ["FRAME_death204", 14],
  ["FRAME_death205", 15],
  ["FRAME_death206", 16],
  ["FRAME_death207", 17],
  ["FRAME_death208", 18],
  ["FRAME_death209", 19],
  ["FRAME_death210", 20],
  ["FRAME_death211", 21],
  ["FRAME_death212", 22],
  ["FRAME_death213", 23],
  ["FRAME_death301", 24],
  ["FRAME_death302", 25],
  ["FRAME_death303", 26],
  ["FRAME_death304", 27],
  ["FRAME_death305", 28],
  ["FRAME_death306", 29],
  ["FRAME_death307", 30],
  ["FRAME_death308", 31],
  ["FRAME_death309", 32],
  ["FRAME_death310", 33],
  ["FRAME_death311", 34],
  ["FRAME_death312", 35],
  ["FRAME_death313", 36],
  ["FRAME_death314", 37],
  ["FRAME_death315", 38]
];

for (const [name, expected] of actorOpeningFrames) {
  assertEqual(name, actor[name], expected);
}

assertFrameRange(
  [
    "FRAME_flip01",
    "FRAME_flip02",
    "FRAME_flip03",
    "FRAME_flip04",
    "FRAME_flip05",
    "FRAME_flip06",
    "FRAME_flip07",
    "FRAME_flip08",
    "FRAME_flip09",
    "FRAME_flip10",
    "FRAME_flip11",
    "FRAME_flip12",
    "FRAME_flip13",
    "FRAME_flip14",
    "FRAME_grenad01",
    "FRAME_grenad02",
    "FRAME_grenad03",
    "FRAME_grenad04",
    "FRAME_grenad05",
    "FRAME_grenad06",
    "FRAME_grenad07",
    "FRAME_grenad08",
    "FRAME_grenad09",
    "FRAME_grenad10",
    "FRAME_grenad11",
    "FRAME_grenad12",
    "FRAME_grenad13",
    "FRAME_grenad14",
    "FRAME_grenad15",
    "FRAME_jump01",
    "FRAME_jump02",
    "FRAME_jump03",
    "FRAME_jump04",
    "FRAME_jump05",
    "FRAME_jump06",
    "FRAME_pain101",
    "FRAME_pain102",
    "FRAME_pain103",
    "FRAME_pain201",
    "FRAME_pain202",
    "FRAME_pain203",
    "FRAME_pain301",
    "FRAME_pain302",
    "FRAME_pain303",
    "FRAME_push01",
    "FRAME_push02",
    "FRAME_push03",
    "FRAME_push04",
    "FRAME_push05",
    "FRAME_push06",
    "FRAME_push07",
    "FRAME_push08",
    "FRAME_push09",
    "FRAME_run01",
    "FRAME_run02",
    "FRAME_run03",
    "FRAME_run04",
    "FRAME_run05",
    "FRAME_run06",
    "FRAME_run07",
    "FRAME_run08",
    "FRAME_run09",
    "FRAME_run10",
    "FRAME_run11",
    "FRAME_run12",
    "FRAME_runs01",
    "FRAME_runs02",
    "FRAME_runs03",
    "FRAME_runs04",
    "FRAME_runs05",
    "FRAME_runs06",
    "FRAME_runs07",
    "FRAME_runs08",
    "FRAME_runs09",
    "FRAME_runs10",
    "FRAME_runs11",
    "FRAME_runs12"
  ],
  39
);

assertEqual("FRAME_stand101", actor.FRAME_stand101, 128);
assertEqual("FRAME_stand201", actor.FRAME_stand201, 168);
assertEqual("FRAME_walk01", actor.FRAME_walk01, 251);
assertEqual("FRAME_crbl_w07", actor.FRAME_crbl_w07, 480);
assertEqual("MODEL_SCALE", actor.MODEL_SCALE, 1.0);

console.log("quake2-m-actor-header: ok");
