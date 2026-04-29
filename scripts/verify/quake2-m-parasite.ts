/**
 * File: quake2-m-parasite.ts
 * Purpose: Verify the initial gameplay port of `game/m_parasite.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_parasite behavior.
 *
 * Dependencies:
 * - packages/game/src/m_parasite.ts
 */

import { strict as assert } from "node:assert";

import { temp_event_t, type trace_t, type vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_STAND_GROUND,
  DEAD_DEAD,
  FRAMETIME,
  M_MoveFrame,
  MOVETYPE_STEP,
  MOVETYPE_TOSS,
  SOLID_BBOX,
  SVF_DEADMONSTER,
  SVF_MONSTER,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  damage_t,
  drainGameSoundEvents,
  drainGameTempEntityEvents,
  type GameEntity,
  type GameMonsterFrame,
  type GameMonsterMove,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  FRAME_break01,
  FRAME_break32,
  FRAME_death101,
  FRAME_death107,
  FRAME_drain01,
  FRAME_drain03,
  FRAME_drain04,
  FRAME_drain18,
  FRAME_pain101,
  FRAME_pain111,
  FRAME_run01,
  FRAME_run02,
  FRAME_run03,
  FRAME_run09,
  FRAME_run10,
  FRAME_run15,
  FRAME_stand01,
  FRAME_stand17,
  FRAME_stand18,
  FRAME_stand21,
  FRAME_stand22,
  FRAME_stand27,
  FRAME_stand28,
  FRAME_stand35,
  SP_monster_parasite,
  parasite_attack,
  parasite_dead,
  parasite_die,
  parasite_drain_attack,
  parasite_drain_attack_ok,
  parasite_idle,
  parasite_move_break,
  parasite_move_death,
  parasite_move_drain,
  parasite_move_end_fidget,
  parasite_move_fidget,
  parasite_move_pain1,
  parasite_move_run,
  parasite_move_stand,
  parasite_move_start_fidget,
  parasite_move_start_run,
  parasite_move_start_walk,
  parasite_move_stop_run,
  parasite_move_stop_walk,
  parasite_move_walk,
  parasite_pain,
  parasite_refidget,
  parasite_run,
  parasite_stand,
  parasite_start_run,
  parasite_start_walk,
  parasite_walk
} from "../../packages/game/src/m_parasite.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifyStartupThinkCompletesWalkingMonsterSetup();
  verifySpawnRegistryCallsMonsterParasite();
  verifyMoveTablesMatchSourceFrames();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyStateTransitions();
  verifyIdleAndFrameSounds();
  verifyDrainAttack();
  verifyPainBranches();
  verifyDeathBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-parasite: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const parasite = createParasite(runtime, 1);

  SP_monster_parasite(parasite, runtime);

  assert.equal(parasite.movetype, MOVETYPE_STEP);
  assert.equal(parasite.solid, SOLID_BBOX);
  assert.deepEqual(parasite.mins, [-16, -16, -24]);
  assert.deepEqual(parasite.maxs, [16, 16, 24]);
  assert.equal(parasite.health, 175);
  assert.equal(parasite.gib_health, -50);
  assert.equal(parasite.mass, 250);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_stand);
  assert.equal(parasite.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[parasite.s.modelindex - 1], "models/monsters/parasite/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "parasite/parpain1.wav",
    "parasite/parpain2.wav",
    "parasite/pardeth1.wav",
    "parasite/paratck1.wav",
    "parasite/paratck2.wav",
    "parasite/paratck3.wav",
    "parasite/paratck4.wav",
    "parasite/parsght1.wav",
    "parasite/paridle1.wav",
    "parasite/paridle2.wav",
    "parasite/parsrch1.wav"
  ]);
  assert.ok(parasite.think, "walkmonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesWalkingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const parasite = createParasite(runtime, 2);

  SP_monster_parasite(parasite, runtime);
  parasite.think!(parasite, runtime);

  assert.equal(parasite.yaw_speed, 20);
  assert.equal(parasite.viewheight, 25);
  assert.equal(parasite.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(parasite.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(parasite.max_health, 175);
  assert.equal(parasite.think?.name, "monster_think");
  assert.equal(parasite.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterParasite(): void {
  const runtime = createHarnessRuntime();
  const parasite = createParasite(runtime, 3);

  ED_CallSpawn(parasite, runtime);

  assert.equal(parasite.health, 175);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_stand);
}

function verifyMoveTablesMatchSourceFrames(): void {
  assertMove("start_fidget", parasite_move_start_fidget, FRAME_stand18, FRAME_stand21, [0, 0, 0, 0]);
  assert.equal(parasite_move_start_fidget.endfunc?.name, "parasite_do_fidget");
  assertMove("fidget", parasite_move_fidget, FRAME_stand22, FRAME_stand27, [0, 0, 0, 0, 0, 0], [[0, "parasite_scratch"], [3, "parasite_scratch"]]);
  assert.equal(parasite_move_fidget.endfunc?.name, "parasite_refidget");
  assertMove("end_fidget", parasite_move_end_fidget, FRAME_stand28, FRAME_stand35, [0, 0, 0, 0, 0, 0, 0, 0], [[0, "parasite_scratch"]]);
  assert.equal(parasite_move_end_fidget.endfunc?.name, "parasite_stand");
  assertMove("stand", parasite_move_stand, FRAME_stand01, FRAME_stand17, new Array<number>(17).fill(0), [
    [2, "parasite_tap"],
    [4, "parasite_tap"],
    [8, "parasite_tap"],
    [10, "parasite_tap"],
    [14, "parasite_tap"],
    [16, "parasite_tap"]
  ]);
  assertMove("start_run", parasite_move_start_run, FRAME_run01, FRAME_run02, [0, 30]);
  assert.equal(parasite_move_start_run.endfunc?.name, "parasite_run");
  assertMove("run", parasite_move_run, FRAME_run03, FRAME_run09, [30, 30, 22, 19, 24, 28, 25]);
  assertMove("stop_run", parasite_move_stop_run, FRAME_run10, FRAME_run15, [20, 20, 12, 10, 0, 0]);
  assertMove("start_walk", parasite_move_start_walk, FRAME_run01, FRAME_run02, [0, 30], [[1, "parasite_walk"]]);
  assertMove("walk", parasite_move_walk, FRAME_run03, FRAME_run09, [30, 30, 22, 19, 24, 28, 25]);
  assert.equal(parasite_move_walk.endfunc?.name, "parasite_walk");
  assertMove("stop_walk", parasite_move_stop_walk, FRAME_run10, FRAME_run15, [20, 20, 12, 10, 0, 0]);
  assertMove("pain1", parasite_move_pain1, FRAME_pain101, FRAME_pain111, [0, 0, 0, 0, 0, 0, 6, 16, -6, -7, 0]);
  assert.equal(parasite_move_pain1.endfunc?.name, "parasite_start_run");
  assertMove("drain", parasite_move_drain, FRAME_drain01, FRAME_drain18, [0, 0, 15, 0, 0, 0, 0, -2, -2, -3, -2, 0, -1, 0, -2, -2, -3, 0], [
    [0, "parasite_launch"],
    [2, "parasite_drain_attack"],
    [3, "parasite_drain_attack"],
    [4, "parasite_drain_attack"],
    [5, "parasite_drain_attack"],
    [6, "parasite_drain_attack"],
    [7, "parasite_drain_attack"],
    [8, "parasite_drain_attack"],
    [9, "parasite_drain_attack"],
    [10, "parasite_drain_attack"],
    [11, "parasite_drain_attack"],
    [12, "parasite_drain_attack"],
    [13, "parasite_reel_in"]
  ]);
  assert.equal(parasite_move_drain.endfunc?.name, "parasite_start_run");
  assertMove("break", parasite_move_break, FRAME_break01, FRAME_break32, [0, -3, 1, 2, -3, 1, 1, 3, 0, -18, 3, 9, 6, 0, -18, 0, 8, 9, 0, -18, 0, 0, 0, 0, 0, 0, 0, 4, 11, -2, -5, 1]);
  assert.equal(parasite_move_break.endfunc?.name, "parasite_start_run");
  assertMove("death", parasite_move_death, FRAME_death101, FRAME_death107, [0, 0, 0, 0, 0, 0, 0]);
  assert.equal(parasite_move_death.endfunc?.name, "parasite_dead");
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_parasite"), SP_monster_parasite);
  assert.equal(findGameSaveFunction("parasite_pain"), parasite_pain);
  assert.equal(findGameSaveFunction("parasite_die"), parasite_die);
  assert.equal(findGameSaveFunction("parasite_drain_attack"), parasite_drain_attack);
  assert.equal(findGameSaveMove("parasite_move_stand"), parasite_move_stand);
  assert.equal(findGameSaveMove("parasite_move_drain"), parasite_move_drain);
  assert.equal(findGameSaveMove("parasite_move_death"), parasite_move_death);
}

function verifyStateTransitions(): void {
  const parasite = createRuntimeEntity({ classname: "monster_parasite" }, 4);

  parasite_stand(parasite);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_stand);
  parasite_idle(parasite);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_start_fidget);
  withMathRandom([0.25], () => parasite_refidget(parasite));
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_fidget);
  withMathRandom([0.85], () => parasite_refidget(parasite));
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_end_fidget);
  parasite_start_walk(parasite);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_start_walk);
  parasite_walk(parasite);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_walk);
  parasite_start_run(parasite);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_start_run);
  parasite_run(parasite);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_run);
  parasite.monsterinfo.aiflags |= AI_STAND_GROUND;
  parasite_start_run(parasite);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_stand);
  parasite_run(parasite);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_stand);
  parasite_attack(parasite);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_drain);
}

function verifyIdleAndFrameSounds(): void {
  const runtime = createHarnessRuntime();
  const parasite = createParasite(runtime, 5);
  SP_monster_parasite(parasite, runtime);

  parasite.s.frame = FRAME_stand01 + 1;
  M_MoveFrame(parasite, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "parasite/paridle1.wav");

  parasite.monsterinfo.currentmove = parasite_move_fidget;
  parasite.s.frame = FRAME_stand22 - 1;
  M_MoveFrame(parasite, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "parasite/paridle2.wav");
}

function verifyDrainAttack(): void {
  const runtime = createHarnessRuntime();
  const parasite = createParasite(runtime, 6);
  const enemy = createEnemy(runtime, 7);
  enemy.s.origin = [120, 0, 0];
  enemy.origin = [...enemy.s.origin];
  enemy.mins = [-16, -16, -24];
  enemy.maxs = [16, 16, 32];
  parasite.enemy = enemy;
  parasite.s.origin = [0, 0, 0];
  parasite.origin = [...parasite.s.origin];
  parasite.s.angles = [0, 0, 0];
  parasite.angles = [...parasite.s.angles];
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);

  SP_monster_parasite(parasite, runtime);

  assert.equal(parasite_drain_attack_ok([0, 0, 0], [256, 0, 0]), true);
  assert.equal(parasite_drain_attack_ok([0, 0, 0], [257, 0, 0]), false);
  assert.equal(parasite_drain_attack_ok([0, 0, 0], [128, 0, 128]), false);

  parasite.s.frame = FRAME_drain03;
  parasite_drain_attack(parasite, runtime);
  assert.equal(enemy.health, 95);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "parasite/paratck2.wav");
  const hitEvent = drainGameTempEntityEvents(runtime).at(-1);
  assert.equal(hitEvent?.type, temp_event_t.TE_PARASITE_ATTACK);
  assert.equal(hitEvent?.payload.entityIndex, parasite.index);

  parasite.s.frame = FRAME_drain04;
  parasite_drain_attack(parasite, runtime);
  assert.equal(enemy.health, 93);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "parasite/paratck3.wav");

  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(null, end);
  parasite_drain_attack(parasite, runtime);
  assert.equal(enemy.health, 93, "blocked trace should suppress damage");
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const parasite = createParasite(runtime, 8);
  SP_monster_parasite(parasite, runtime);
  parasite.max_health = 175;
  parasite.health = 80;

  withMathRandom([0.25], () => parasite_pain(parasite, null, 0, 10, runtime));
  assert.equal(parasite.s.skinnum, 1);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_pain1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "parasite/parpain1.wav");

  runtime.time = 1;
  parasite.monsterinfo.currentmove = parasite_move_stand;
  parasite_pain(parasite, null, 0, 10, runtime);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_stand, "pain debounce should suppress animation");

  runtime.time = 4;
  withMathRandom([0.75], () => parasite_pain(parasite, null, 0, 10, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "parasite/parpain2.wav");

  runtime.skill = 3;
  runtime.time = 8;
  parasite.monsterinfo.currentmove = parasite_move_stand;
  parasite_pain(parasite, null, 0, 10, runtime);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_stand, "nightmare pain should not start a pain animation");
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const parasite = createParasite(runtime, 9);
  SP_monster_parasite(parasite, runtime);

  parasite_die(parasite, null, null, 20, runtime);
  assert.equal(parasite.deadflag, DEAD_DEAD);
  assert.equal(parasite.takedamage, damage_t.DAMAGE_YES);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_death);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "parasite/pardeth1.wav");

  parasite.monsterinfo.currentmove = parasite_move_stand;
  parasite_die(parasite, null, null, 20, runtime);
  assert.equal(parasite.monsterinfo.currentmove, parasite_move_stand, "already-dead parasite should ignore repeated death calls");

  parasite_dead(parasite, runtime);
  assert.deepEqual(parasite.mins, [-16, -16, -24]);
  assert.deepEqual(parasite.maxs, [16, 16, -8]);
  assert.equal(parasite.movetype, MOVETYPE_TOSS);
  assert.equal(parasite.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
  assert.equal(parasite.nextthink, 0);

  const gibParasite = createParasite(runtime, 10);
  SP_monster_parasite(gibParasite, runtime);
  gibParasite.health = -50;
  parasite_die(gibParasite, null, null, 25, runtime);
  assert.equal(gibParasite.deadflag, DEAD_DEAD);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/bone/tris.md2").length, 2);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2").length, 4);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/head2/tris.md2").length, 1);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const parasite = createParasite(runtime, 11);

  SP_monster_parasite(parasite, runtime);

  assert.equal(parasite.inuse, false);
}

function createHarnessRuntime(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([
    { properties: { classname: "worldspawn" } }
  ]);
  runtime.collision = {
    world: {} as never,
    trace: (_start: vec3_t, _mins: vec3_t, _maxs: vec3_t, end: vec3_t) => makeTrace(null, end),
    pointcontents: () => 0
  };
  return runtime;
}

function createParasite(runtime: GameRuntime, index: number): GameEntity {
  const parasite = createRuntimeEntity({ classname: "monster_parasite" }, index);
  runtime.entities[index] = parasite;
  return parasite;
}

function createEnemy(runtime: GameRuntime, index: number): GameEntity {
  const enemy = createRuntimeEntity({ classname: "target_dummy" }, index);
  enemy.inuse = true;
  enemy.health = 100;
  enemy.max_health = 100;
  enemy.takedamage = damage_t.DAMAGE_YES;
  runtime.entities[index] = enemy;
  return enemy;
}

function makeTrace(entity: GameEntity | null, endpos: vec3_t | null = null): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction: 1,
    endpos: endpos ? [...endpos] : entity?.s.origin ? [...entity.s.origin] : [0, 0, 0],
    plane: {
      normal: [0, 0, 1],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0]
    },
    surface: null,
    contents: 0,
    ent: entity
  };
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
