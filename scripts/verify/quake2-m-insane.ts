/**
 * File: quake2-m-insane.ts
 * Purpose: Verify the initial gameplay port of `game/m_insane.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for the misc_insane monster behavior.
 *
 * Dependencies:
 * - packages/game/src/m_insane.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  AI_GOOD_GUY,
  AI_STAND_GROUND,
  DEAD_DEAD,
  MOVETYPE_STEP,
  MOVETYPE_TOSS,
  SOLID_BBOX,
  SVF_DEADMONSTER,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  drainGameSoundEvents,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { FL_FLY, FL_NO_KNOCKBACK } from "../../packages/game/src/g_local.js";
import {
  FRAME_cr_death10,
  FRAME_cr_death16,
  FRAME_cr_pain2,
  FRAME_cr_pain10,
  FRAME_crawl1,
  FRAME_crawl9,
  FRAME_st_death2,
  FRAME_st_death18,
  FRAME_st_pain2,
  FRAME_st_pain12,
  FRAME_stand100,
  FRAME_stand160,
  FRAME_stand41,
  FRAME_stand59,
  FRAME_stand60,
  FRAME_stand65,
  FRAME_stand94,
  FRAME_stand96,
  FRAME_walk1,
  FRAME_walk26,
  FRAME_walk27,
  FRAME_walk39,
  FRAME_cross1,
  FRAME_cross15,
  FRAME_cross16,
  FRAME_cross30,
  SP_misc_insane,
  insane_checkup,
  insane_checkdown,
  insane_cross,
  insane_dead,
  insane_die,
  insane_move_crawl,
  insane_move_crawl_death,
  insane_move_crawl_pain,
  insane_move_cross,
  insane_move_down,
  insane_move_downtoup,
  insane_move_jumpdown,
  insane_move_run_insane,
  insane_move_run_normal,
  insane_move_runcrawl,
  insane_move_stand_death,
  insane_move_stand_insane,
  insane_move_stand_normal,
  insane_move_stand_pain,
  insane_move_struggle_cross,
  insane_move_uptodown,
  insane_move_walk_insane,
  insane_move_walk_normal,
  insane_pain,
  insane_run,
  insane_stand,
  insane_walk
} from "../../packages/game/src/m_insane.js";
import type { GameMonsterFrame, GameMonsterMove } from "../../packages/game/src/runtime.js";

const SOURCE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_insane.c"
);
const TS_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../packages/game/src/m_insane.ts"
);
const source = readFileSync(SOURCE_PATH, "utf8");
const tsSource = readFileSync(TS_PATH, "utf8");

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifyCrucifiedSpawnStartsFlyingAndStandingGround();
  verifyMoveTablesMatchSourceFrames();
  verifyStateTransitionBranches();
  verifyRandomMacroConsumersUseGLocalRandom();
  verifyPainAndDeathStateSelection();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-insane: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const insane = createInsane(runtime, 1);

  SP_misc_insane(insane, runtime);

  assert.equal(insane.movetype, MOVETYPE_STEP);
  assert.equal(insane.solid, SOLID_BBOX);
  assert.equal(insane.health, 100);
  assert.equal(insane.gib_health, -50);
  assert.equal(insane.mass, 300);
  assert.equal(insane.monsterinfo.currentmove, insane_move_stand_normal);
  assert.equal(insane.monsterinfo.scale, 1);
  assert.equal(insane.monsterinfo.aiflags & AI_GOOD_GUY, AI_GOOD_GUY);
  assert.equal(runtime.assets.modelPaths[insane.s.modelindex - 1], "models/monsters/insane/tris.md2");
  assert.ok(runtime.assets.soundPaths.includes("insane/insane11.wav"));
  assert.ok(runtime.assets.soundPaths.includes("insane/insane10.wav"));
  assert.ok(insane.think, "walkmonster_start should arm delayed startup think");
  assert.ok(insane.s.skinnum >= 0 && insane.s.skinnum <= 2);
}

function verifyCrucifiedSpawnStartsFlyingAndStandingGround(): void {
  const runtime = createHarnessRuntime();
  const insane = createInsane(runtime, 2);
  insane.spawnflags = 8 | 16;

  SP_misc_insane(insane, runtime);

  assert.deepEqual(insane.mins, [-16, 0, 0]);
  assert.deepEqual(insane.maxs, [16, 8, 32]);
  assert.equal(insane.flags & FL_NO_KNOCKBACK, FL_NO_KNOCKBACK);
  assert.equal(insane.flags & FL_FLY, FL_FLY);
  assert.equal(insane.monsterinfo.aiflags & AI_STAND_GROUND, AI_STAND_GROUND);

  insane_stand(insane);
  assert.equal(insane.monsterinfo.currentmove, insane_move_cross);
}

function verifyMoveTablesMatchSourceFrames(): void {
  assertMove("stand_normal", insane_move_stand_normal, FRAME_stand60, FRAME_stand65, [0, 0, 0, 0, 0, 0], [
    [5, "insane_checkdown"]
  ]);
  assertMove("stand_insane", insane_move_stand_insane, FRAME_stand65, FRAME_stand94, new Array<number>(30).fill(0), [
    [0, "insane_shake"],
    [29, "insane_checkdown"]
  ]);
  assertMove(
    "uptodown",
    insane_move_uptodown,
    0,
    39,
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2.7, 4.1, 6, 7.6, 3.6, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ],
    [
      [7, "insane_moan"],
      [27, "insane_fist"],
      [33, "insane_fist"]
    ]
  );
  assertMove("downtoup", insane_move_downtoup, FRAME_stand41, FRAME_stand59, [
    -0.7, -1.2, -1.5, -4.5, -3.5, -0.2, 0, -1.3, -3, -2,
    0, 0, 0, -3.3, -1.6, -0.3, 0, 0, 0
  ]);
  assertMove("jumpdown", insane_move_jumpdown, FRAME_stand96, FRAME_stand100, [0.2, 11.5, 5.1, 7.1, 0]);
  assertMove(
    "down",
    insane_move_down,
    FRAME_stand100,
    FRAME_stand160,
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, -1.7, -1.6, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0.5, 0, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 0.7, 0
    ],
    [
      [16, "insane_fist"],
      [33, "insane_moan"],
      [53, "insane_scream"],
      [60, "insane_checkup"]
    ]
  );
  assertMove("walk_normal", insane_move_walk_normal, FRAME_walk27, FRAME_walk39, [
    0, 2.5, 3.5, 1.7, 2.3, 2.4, 2.2, 4.2, 5.6, 3.3, 2.4, 0.9, 0
  ], [[0, "insane_scream"]]);
  assertMove("run_normal", insane_move_run_normal, FRAME_walk27, FRAME_walk39, [
    0, 2.5, 3.5, 1.7, 2.3, 2.4, 2.2, 4.2, 5.6, 3.3, 2.4, 0.9, 0
  ], [[0, "insane_scream"]]);
  assertMove("walk_insane", insane_move_walk_insane, FRAME_walk1, FRAME_walk26, [
    0, 3.4, 3.6, 2.9, 2.2, 2.6, 0, 0.7, 4.8, 5.3, 1.1, 2, 0.5,
    0, 0, 4.9, 6.7, 3.8, 2, 0.2, 0, 3.4, 6.4, 5, 1.8, 0
  ], [[0, "insane_scream"]]);
  assertMove("run_insane", insane_move_run_insane, FRAME_walk1, FRAME_walk26, [
    0, 3.4, 3.6, 2.9, 2.2, 2.6, 0, 0.7, 4.8, 5.3, 1.1, 2, 0.5,
    0, 0, 4.9, 6.7, 3.8, 2, 0.2, 0, 3.4, 6.4, 5, 1.8, 0
  ], [[0, "insane_scream"]]);
  assertMove("stand_pain", insane_move_stand_pain, FRAME_st_pain2, FRAME_st_pain12, new Array<number>(11).fill(0));
  assertMove("stand_death", insane_move_stand_death, FRAME_st_death2, FRAME_st_death18, new Array<number>(17).fill(0));
  assertMove("crawl", insane_move_crawl, FRAME_crawl1, FRAME_crawl9, [0, 1.5, 2.1, 3.6, 2, 0.9, 3, 3.4, 2.4], [[0, "insane_scream"]]);
  assertMove("runcrawl", insane_move_runcrawl, FRAME_crawl1, FRAME_crawl9, [0, 1.5, 2.1, 3.6, 2, 0.9, 3, 3.4, 2.4], [[0, "insane_scream"]]);
  assertMove("crawl_pain", insane_move_crawl_pain, FRAME_cr_pain2, FRAME_cr_pain10, new Array<number>(9).fill(0));
  assertMove("crawl_death", insane_move_crawl_death, FRAME_cr_death10, FRAME_cr_death16, new Array<number>(7).fill(0));
  assertMove("cross", insane_move_cross, FRAME_cross1, FRAME_cross15, new Array<number>(15).fill(0), [[0, "insane_moan"]]);
  assertMove("struggle_cross", insane_move_struggle_cross, FRAME_cross16, FRAME_cross30, new Array<number>(15).fill(0), [[0, "insane_scream"]]);
}

function verifyStateTransitionBranches(): void {
  const runtime = createHarnessRuntime();
  const insane = createInsane(runtime, 4);

  withMathRandom([0.79], () => insane_cross(insane));
  assert.equal(insane.monsterinfo.currentmove, insane_move_cross);
  withMathRandom([0.81], () => insane_cross(insane));
  assert.equal(insane.monsterinfo.currentmove, insane_move_struggle_cross);

  insane.spawnflags = 0;
  withMathRandom([0.49], () => insane_walk(insane));
  assert.equal(insane.monsterinfo.currentmove, insane_move_walk_normal);
  withMathRandom([0.51], () => insane_walk(insane));
  assert.equal(insane.monsterinfo.currentmove, insane_move_walk_insane);
  withMathRandom([0.49], () => insane_run(insane));
  assert.equal(insane.monsterinfo.currentmove, insane_move_run_normal);
  withMathRandom([0.51], () => insane_run(insane));
  assert.equal(insane.monsterinfo.currentmove, insane_move_run_insane);

  insane.spawnflags = 32;
  insane.monsterinfo.currentmove = insane_move_stand_normal;
  withMathRandom([0.1, 0.1], () => insane_checkdown(insane));
  assert.equal(insane.monsterinfo.currentmove, insane_move_stand_normal);

  insane.spawnflags = 0;
  withMathRandom([0.29, 0.49], () => insane_checkdown(insane));
  assert.equal(insane.monsterinfo.currentmove, insane_move_uptodown);
  withMathRandom([0.29, 0.51], () => insane_checkdown(insane));
  assert.equal(insane.monsterinfo.currentmove, insane_move_jumpdown);

  insane.spawnflags = 4 | 16;
  insane.monsterinfo.currentmove = insane_move_down;
  withMathRandom([0.1], () => insane_checkup(insane));
  assert.equal(insane.monsterinfo.currentmove, insane_move_down);

  insane.spawnflags = 0;
  withMathRandom([0.49], () => insane_checkup(insane));
  assert.equal(insane.monsterinfo.currentmove, insane_move_downtoup);

  insane.spawnflags = 4 | 16;
  insane_stand(insane);
  assert.equal(insane.monsterinfo.currentmove, insane_move_down);

  void runtime;
}

function verifyRandomMacroConsumersUseGLocalRandom(): void {
  const macroConsumers = [
    "insane_cross",
    "insane_walk",
    "insane_run",
    "insane_checkdown",
    "insane_checkup",
    "insane_stand"
  ];

  for (const functionName of macroConsumers) {
    assert.match(getSourceFunctionBlock(functionName), /\brandom\s*\(/, `${functionName}: C should use random()`);
    const tsBlock = getTsFunctionBlock(functionName);
    assert.match(tsBlock, /\brandom\s*\(/, `${functionName}: TS should use g_local.random()`);
    assert.doesNotMatch(tsBlock, /Math\.random\s*\(/, `${functionName}: TS should not use Math.random() for C random()`);
  }

  assert.match(getSourceFunctionBlock("insane_pain"), /\brand\s*\(\)\s*&\s*1/, "insane_pain should use rand()&1");
  assert.match(getTsFunctionBlock("insane_pain"), /randomInt\s*\(\s*2\s*\)\s*&\s*1/, "insane_pain should keep integer RNG helper");
  assert.doesNotMatch(source, /\bcrandom\s*\(/, "m_insane.c should not consume crandom()");
}

function verifyPainAndDeathStateSelection(): void {
  const runtime = createHarnessRuntime();
  const insane = createInsane(runtime, 3);
  SP_misc_insane(insane, runtime);

  insane.health = 20;
  insane_pain(insane, null, 0, 5, runtime);
  assert.equal(insane.monsterinfo.currentmove, insane_move_stand_pain);
  assert.match(drainGameSoundEvents(runtime).at(-1)?.soundPath ?? "", /^player\/male\/pain25_[12]\.wav$/);

  insane.s.frame = FRAME_crawl1;
  runtime.time = 4;
  insane_pain(insane, null, 0, 5, runtime);
  assert.equal(insane.monsterinfo.currentmove, insane_move_crawl_pain);

  insane.spawnflags = 8;
  runtime.time = 8;
  insane_pain(insane, null, 0, 5, runtime);
  assert.equal(insane.monsterinfo.currentmove, insane_move_struggle_cross);

  insane.spawnflags = 4 | 16;
  insane.s.frame = FRAME_cr_pain10;
  insane_walk(insane);
  assert.equal(insane.monsterinfo.currentmove, insane_move_down);

  insane.spawnflags = 4;
  insane.s.frame = FRAME_crawl1;
  insane_walk(insane);
  assert.equal(insane.monsterinfo.currentmove, insane_move_crawl);

  insane.spawnflags = 0;
  insane.s.frame = FRAME_st_death2;
  insane.health = 1;
  insane_die(insane, null, null, 25, runtime);
  assert.equal(insane.deadflag, DEAD_DEAD);
  assert.equal(insane.monsterinfo.currentmove?.firstframe, FRAME_st_death2);

  insane_dead(insane, runtime);
  assert.equal(insane.movetype, MOVETYPE_TOSS);
  assert.equal(insane.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
  assert.equal(insane.nextthink, 0);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const insane = createInsane(runtime, 20);

  SP_misc_insane(insane, runtime);

  assert.equal(insane.inuse, false);
}

function createHarnessRuntime(): GameRuntime {
  return createGameRuntimeFromBspEntities([
    { properties: { classname: "worldspawn" } }
  ]);
}

function createInsane(runtime: GameRuntime, index: number): GameEntity {
  const insane = createRuntimeEntity({ classname: "misc_insane" }, index);
  runtime.entities[index] = insane;
  return insane;
}

function assertMove(
  label: string,
  move: GameMonsterMove,
  firstframe: number,
  lastframe: number,
  distances: number[],
  thinkNames: Array<[index: number, name: string]> = []
): void {
  assert.equal(move.firstframe, firstframe, `${label}: firstframe`);
  assert.equal(move.lastframe, lastframe, `${label}: lastframe`);
  assert.equal(move.frame.length, distances.length, `${label}: frame length`);
  assert.equal(move.lastframe - move.firstframe + 1, distances.length, `${label}: frame range length`);

  for (let i = 0; i < distances.length; i += 1) {
    assert.equal(move.frame[i].dist, distances[i], `${label}: dist ${i}`);
  }

  const expectedThinkNames = new Map(thinkNames);
  for (let i = 0; i < move.frame.length; i += 1) {
    const expected = expectedThinkNames.get(i);
    if (expected) {
      assert.equal(move.frame[i].thinkfunc?.name, expected, `${label}: think ${i}`);
    } else {
      assert.equal(move.frame[i].thinkfunc, undefined, `${label}: no think ${i}`);
    }
  }

  assertFrameAiFunctions(move.frame, label);
}

function assertFrameAiFunctions(frames: GameMonsterFrame[], label: string): void {
  for (const [index, frame] of frames.entries()) {
    assert.ok(frame.aifunc, `${label}: frame ${index} should keep the source AI callback`);
  }
}

function withMathRandom(values: number[], callback: () => void): void {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => {
    const value = values[index];
    index += 1;
    return value ?? values.at(-1) ?? 0;
  };

  try {
    callback();
  } finally {
    Math.random = originalRandom;
  }
}

function getSourceFunctionBlock(functionName: string): string {
  return getFunctionBlock(source, new RegExp(`\\b(?:void|qboolean)\\s+${functionName}\\s*\\(`), functionName);
}

function getTsFunctionBlock(functionName: string): string {
  return getFunctionBlock(tsSource, new RegExp(`\\bexport\\s+function\\s+${functionName}\\s*\\(`), functionName);
}

function getFunctionBlock(text: string, startPattern: RegExp, functionName: string): string {
  const matches = Array.from(text.matchAll(new RegExp(startPattern.source, "g")));
  const startMatch = matches.find((match) => {
    const bodyStartCandidate = text.indexOf("{", match.index);
    const declarationEnd = text.indexOf(";", match.index);
    return bodyStartCandidate !== -1 && (declarationEnd === -1 || bodyStartCandidate < declarationEnd);
  });
  assert.ok(startMatch, `${functionName} should exist`);

  const bodyStart = text.indexOf("{", startMatch.index);
  assert.notEqual(bodyStart, -1, `${functionName} should have a body`);

  let depth = 0;
  for (let i = bodyStart; i < text.length; i += 1) {
    const char = text[i];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(bodyStart, i + 1);
      }
    }
  }

  throw new Error(`${functionName} body was not closed`);
}
