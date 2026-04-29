/**
 * File: quake2-m-mutant.ts
 * Purpose: Verify the gameplay port of `game/m_mutant.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_mutant behavior.
 *
 * Dependencies:
 * - packages/game/src/m_mutant.ts
 */

import { strict as assert } from "node:assert";

import type { trace_t, vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_DUCKED,
  AI_STAND_GROUND,
  AS_MELEE,
  AS_MISSILE,
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
  type GameEntity,
  type GameMonsterFrame,
  type GameMonsterMove,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  FRAME_attack01,
  FRAME_attack02,
  FRAME_attack05,
  FRAME_attack08,
  FRAME_attack09,
  FRAME_attack15,
  FRAME_death101,
  FRAME_death109,
  FRAME_death201,
  FRAME_death210,
  FRAME_pain101,
  FRAME_pain105,
  FRAME_pain201,
  FRAME_pain206,
  FRAME_pain301,
  FRAME_pain311,
  FRAME_run03,
  FRAME_run08,
  FRAME_stand101,
  FRAME_stand151,
  FRAME_stand152,
  FRAME_stand155,
  FRAME_stand164,
  FRAME_walk01,
  FRAME_walk04,
  FRAME_walk05,
  FRAME_walk16,
  SP_monster_mutant,
  mutant_check_jump,
  mutant_check_landing,
  mutant_check_refire,
  mutant_checkattack,
  mutant_dead,
  mutant_die,
  mutant_hit_left,
  mutant_hit_right,
  mutant_idle,
  mutant_idle_loop,
  mutant_jump,
  mutant_jump_takeoff,
  mutant_jump_touch,
  mutant_melee,
  mutant_move_attack,
  mutant_move_death1,
  mutant_move_death2,
  mutant_move_idle,
  mutant_move_jump,
  mutant_move_pain1,
  mutant_move_pain2,
  mutant_move_pain3,
  mutant_move_run,
  mutant_move_stand,
  mutant_move_start_walk,
  mutant_move_walk,
  mutant_pain,
  mutant_run,
  mutant_search,
  mutant_sight,
  mutant_stand,
  mutant_step,
  mutant_swing,
  mutant_walk,
  mutant_walk_loop
} from "../../packages/game/src/m_mutant.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifyStartupThinkCompletesWalkingMonsterSetup();
  verifySpawnRegistryCallsMonsterMutant();
  verifyMoveTablesMatchSourceFrames();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyStateTransitions();
  verifySoundsAndMoveFrameCallbacks();
  verifyMeleeAndRefireBranches();
  verifyJumpBranches();
  verifyPainBranches();
  verifyDeathBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-mutant: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const mutant = createMutant(runtime, 1);

  SP_monster_mutant(mutant, runtime);

  assert.equal(mutant.movetype, MOVETYPE_STEP);
  assert.equal(mutant.solid, SOLID_BBOX);
  assert.deepEqual(mutant.mins, [-32, -32, -24]);
  assert.deepEqual(mutant.maxs, [32, 32, 48]);
  assert.equal(mutant.health, 300);
  assert.equal(mutant.gib_health, -120);
  assert.equal(mutant.mass, 300);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_stand);
  assert.equal(mutant.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[mutant.s.modelindex - 1], "models/monsters/mutant/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "mutant/mutatck1.wav",
    "mutant/mutatck2.wav",
    "mutant/mutatck3.wav",
    "mutant/mutdeth1.wav",
    "mutant/mutidle1.wav",
    "mutant/mutpain1.wav",
    "mutant/mutpain2.wav",
    "mutant/mutsght1.wav",
    "mutant/mutsrch1.wav",
    "mutant/step1.wav",
    "mutant/step2.wav",
    "mutant/step3.wav",
    "mutant/thud1.wav"
  ]);
  assert.ok(mutant.think, "walkmonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesWalkingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const mutant = createMutant(runtime, 2);

  SP_monster_mutant(mutant, runtime);
  mutant.think!(mutant, runtime);

  assert.equal(mutant.yaw_speed, 20);
  assert.equal(mutant.viewheight, 25);
  assert.equal(mutant.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(mutant.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(mutant.max_health, 300);
  assert.equal(mutant.think?.name, "monster_think");
  assert.equal(mutant.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterMutant(): void {
  const runtime = createHarnessRuntime();
  const mutant = createMutant(runtime, 3);

  ED_CallSpawn(mutant, runtime);

  assert.equal(mutant.health, 300);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_stand);
}

function verifyMoveTablesMatchSourceFrames(): void {
  assertMove("stand", mutant_move_stand, FRAME_stand101, FRAME_stand151, new Array<number>(51).fill(0));
  assertMove("idle", mutant_move_idle, FRAME_stand152, FRAME_stand164, new Array<number>(13).fill(0), [[6, "mutant_idle_loop"]]);
  assert.equal(mutant_move_idle.endfunc?.name, "mutant_stand");
  assertMove("walk", mutant_move_walk, FRAME_walk05, FRAME_walk16, [3, 1, 5, 10, 13, 10, 0, 5, 6, 16, 15, 6]);
  assertMove("start_walk", mutant_move_start_walk, FRAME_walk01, FRAME_walk04, [5, 5, -2, 1]);
  assert.equal(mutant_move_start_walk.endfunc?.name, "mutant_walk_loop");
  assertMove("run", mutant_move_run, FRAME_run03, FRAME_run08, [40, 40, 24, 5, 17, 10], [
    [1, "mutant_step"],
    [3, "mutant_step"]
  ]);
  assertMove("attack", mutant_move_attack, FRAME_attack09, FRAME_attack15, new Array<number>(7).fill(0), [
    [2, "mutant_hit_left"],
    [5, "mutant_hit_right"],
    [6, "mutant_check_refire"]
  ]);
  assert.equal(mutant_move_attack.endfunc?.name, "mutant_run");
  assertMove("jump", mutant_move_jump, FRAME_attack01, FRAME_attack08, [0, 17, 15, 15, 15, 0, 3, 0], [
    [2, "mutant_jump_takeoff"],
    [4, "mutant_check_landing"]
  ]);
  assertMove("pain1", mutant_move_pain1, FRAME_pain101, FRAME_pain105, [4, -3, -8, 2, 5]);
  assertMove("pain2", mutant_move_pain2, FRAME_pain201, FRAME_pain206, [-24, 11, 5, -2, 6, 4]);
  assertMove("pain3", mutant_move_pain3, FRAME_pain301, FRAME_pain311, [-22, 3, 3, 2, 1, 1, 6, 3, 2, 0, 1]);
  assertMove("death1", mutant_move_death1, FRAME_death101, FRAME_death109, new Array<number>(9).fill(0));
  assertMove("death2", mutant_move_death2, FRAME_death201, FRAME_death210, new Array<number>(10).fill(0));
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_mutant"), SP_monster_mutant);
  assert.equal(findGameSaveFunction("mutant_pain"), mutant_pain);
  assert.equal(findGameSaveFunction("mutant_die"), mutant_die);
  assert.equal(findGameSaveFunction("mutant_jump_touch"), mutant_jump_touch);
  assert.equal(findGameSaveMove("mutant_move_stand"), mutant_move_stand);
  assert.equal(findGameSaveMove("mutant_move_attack"), mutant_move_attack);
  assert.equal(findGameSaveMove("mutant_move_jump"), mutant_move_jump);
  assert.equal(findGameSaveMove("mutant_move_death2"), mutant_move_death2);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const mutant = createMutant(runtime, 4);
  void runtime;

  mutant_stand(mutant);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_stand);
  mutant_idle(mutant, runtime);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_idle);
  mutant_walk(mutant);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_start_walk);
  mutant_walk_loop(mutant);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_walk);
  mutant_run(mutant);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_run);
  mutant.monsterinfo.aiflags |= AI_STAND_GROUND;
  mutant_run(mutant);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_stand);
  mutant_melee(mutant);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_attack);
  mutant_jump(mutant);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_jump);
}

function verifySoundsAndMoveFrameCallbacks(): void {
  const runtime = createHarnessRuntime();
  const mutant = createMutant(runtime, 5);
  SP_monster_mutant(mutant, runtime);

  mutant_sight(mutant, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "mutant/mutsght1.wav");

  mutant_search(mutant, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "mutant/mutsrch1.wav");

  mutant_swing(mutant, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "mutant/mutatck1.wav");

  withMathRandom([0], () => mutant_step(mutant, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "mutant/step1.wav");

  withMathRandom([0.25], () => mutant_idle_loop(mutant));
  assert.equal(mutant.monsterinfo.nextframe, FRAME_stand155);

  mutant.monsterinfo.currentmove = mutant_move_run;
  mutant.s.frame = FRAME_run03;
  withMathRandom([0.5], () => M_MoveFrame(mutant, runtime));
  assert.equal(mutant.s.frame, FRAME_run03 + 1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "mutant/step2.wav");
}

function verifyMeleeAndRefireBranches(): void {
  const runtime = createHarnessRuntime();
  const mutant = createMutant(runtime, 6);
  const enemy = createEnemy(runtime, 7, [40, 0, 0]);
  SP_monster_mutant(mutant, runtime);
  mutant.enemy = enemy;
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);

  withMathRandom([0], () => mutant_hit_left(mutant, runtime));
  assert.equal(enemy.health, 90);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "mutant/mutatck2.wav");

  withMathRandom([0], () => mutant_hit_right(mutant, runtime));
  assert.equal(enemy.health, 80);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "mutant/mutatck3.wav");

  mutant.monsterinfo.nextframe = 0;
  mutant_check_refire(mutant, runtime);
  assert.equal(mutant.monsterinfo.nextframe, FRAME_attack09);

  runtime.skill = 3;
  mutant.enemy = createEnemy(runtime, 8, [256, 0, 0]);
  withMathRandom([0.25], () => mutant_check_refire(mutant, runtime));
  assert.equal(mutant.monsterinfo.nextframe, FRAME_attack09);

  mutant.enemy = enemy;
  withMathRandom([0.95], () => assert.equal(mutant_checkattack(mutant), true));
  assert.equal(mutant.monsterinfo.attack_state, AS_MELEE);
}

function verifyJumpBranches(): void {
  const runtime = createHarnessRuntime();
  const mutant = createMutant(runtime, 9);
  const enemy = createEnemy(runtime, 10, [160, 0, 0]);
  SP_monster_mutant(mutant, runtime);
  mutant.enemy = enemy;
  mutant.s.origin = [0, 0, 0];
  mutant.origin = [...mutant.s.origin];
  mutant.s.angles = [0, 0, 0];
  mutant.angles = [...mutant.s.angles];
  mutant.absmin = [-32, -32, -24];
  mutant.absmax = [32, 32, 48];
  enemy.absmin = [144, -16, -24];
  enemy.size = [32, 32, 56];

  withMathRandom([0.95], () => assert.equal(mutant_check_jump(mutant), true));
  withMathRandom([0.95], () => assert.equal(mutant_checkattack(mutant), true));
  assert.equal(mutant.monsterinfo.attack_state, AS_MISSILE);

  mutant_jump_takeoff(mutant, runtime);
  assert.equal(mutant.velocity[0], 600);
  assert.equal(mutant.velocity[2], 250);
  assert.equal(mutant.groundentity, null);
  assert.equal(mutant.monsterinfo.aiflags & AI_DUCKED, AI_DUCKED);
  assert.equal(mutant.monsterinfo.attack_finished, runtime.time + 3);
  assert.equal(mutant.touch, mutant_jump_touch);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "mutant/mutsght1.wav");

  mutant.velocity = [500, 0, 0];
  withMathRandom([0], () => mutant_jump_touch(mutant, enemy, runtime));
  assert.equal(enemy.health, 60);
  assert.equal(mutant.touch, undefined);

  mutant.groundentity = createRuntimeEntity({ classname: "floor" }, 11);
  mutant.monsterinfo.aiflags |= AI_DUCKED;
  mutant_check_landing(mutant, runtime);
  assert.equal(mutant.monsterinfo.attack_finished, 0);
  assert.equal(mutant.monsterinfo.aiflags & AI_DUCKED, 0);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "mutant/thud1.wav");

  mutant.groundentity = null;
  mutant.monsterinfo.attack_finished = runtime.time + 1;
  mutant_check_landing(mutant, runtime);
  assert.equal(mutant.monsterinfo.nextframe, FRAME_attack05);
  runtime.time = 5;
  mutant_check_landing(mutant, runtime);
  assert.equal(mutant.monsterinfo.nextframe, FRAME_attack02);
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const mutant = createMutant(runtime, 12);
  SP_monster_mutant(mutant, runtime);
  mutant.max_health = 300;
  mutant.health = 120;

  withMathRandom([0.2], () => mutant_pain(mutant, null, 0, 10, runtime));
  assert.equal(mutant.s.skinnum, 1);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_pain1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "mutant/mutpain1.wav");

  runtime.time = 4;
  withMathRandom([0.5], () => mutant_pain(mutant, null, 0, 10, runtime));
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_pain2);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "mutant/mutpain2.wav");

  runtime.time = 8;
  withMathRandom([0.9], () => mutant_pain(mutant, null, 0, 10, runtime));
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_pain3);

  runtime.skill = 3;
  runtime.time = 12;
  mutant.monsterinfo.currentmove = mutant_move_stand;
  mutant_pain(mutant, null, 0, 10, runtime);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_stand, "nightmare pain should not start a pain animation");
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const mutant = createMutant(runtime, 13);
  SP_monster_mutant(mutant, runtime);

  withMathRandom([0.25], () => mutant_die(mutant, null, null, 60, runtime));
  assert.equal(mutant.deadflag, DEAD_DEAD);
  assert.equal(mutant.takedamage, damage_t.DAMAGE_YES);
  assert.equal(mutant.s.skinnum, 1);
  assert.equal(mutant.monsterinfo.currentmove, mutant_move_death1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "mutant/mutdeth1.wav");

  const second = createMutant(runtime, 14);
  SP_monster_mutant(second, runtime);
  withMathRandom([0.75], () => mutant_die(second, null, null, 60, runtime));
  assert.equal(second.monsterinfo.currentmove, mutant_move_death2);

  mutant_dead(second, runtime);
  assert.deepEqual(second.mins, [-16, -16, -24]);
  assert.deepEqual(second.maxs, [16, 16, -8]);
  assert.equal(second.movetype, MOVETYPE_TOSS);
  assert.equal(second.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);

  const gibMutant = createMutant(runtime, 15);
  SP_monster_mutant(gibMutant, runtime);
  gibMutant.health = -120;
  mutant_die(gibMutant, null, null, 25, runtime);
  assert.equal(gibMutant.deadflag, DEAD_DEAD);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/bone/tris.md2").length, 2);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2").length, 4);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/head2/tris.md2").length, 1);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const mutant = createMutant(runtime, 16);

  SP_monster_mutant(mutant, runtime);

  assert.equal(mutant.inuse, false);
}

function createHarnessRuntime(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([
    { properties: { classname: "worldspawn" } }
  ]);
  runtime.collision = {
    world: {} as never,
    trace: (_start: vec3_t, _mins: vec3_t, _maxs: vec3_t, end: vec3_t) => makeTrace(null, end),
    pointcontents: () => 1
  };
  return runtime;
}

function createMutant(runtime: GameRuntime, index: number): GameEntity {
  const mutant = createRuntimeEntity({ classname: "monster_mutant" }, index);
  runtime.entities[index] = mutant;
  return mutant;
}

function createEnemy(runtime: GameRuntime, index: number, origin: vec3_t): GameEntity {
  const enemy = createRuntimeEntity({ classname: "target_dummy" }, index);
  enemy.inuse = true;
  enemy.health = 100;
  enemy.max_health = 100;
  enemy.takedamage = damage_t.DAMAGE_YES;
  enemy.svflags |= SVF_MONSTER;
  enemy.s.origin = [...origin];
  enemy.origin = [...origin];
  enemy.mins = [-16, -16, -24];
  enemy.maxs = [16, 16, 32];
  enemy.size = [32, 32, 56];
  enemy.viewheight = 24;
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
