/**
 * File: quake2-m-infantry.ts
 * Purpose: Verify the gameplay port of `game/m_infantry.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_infantry behavior.
 *
 * Dependencies:
 * - packages/game/src/m_infantry.ts
 */

import { strict as assert } from "node:assert";

import type { trace_t, vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_DUCKED,
  AI_HOLD_FRAME,
  AI_STAND_GROUND,
  DEAD_DEAD,
  FRAMETIME,
  G_RunFrame,
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
  drainMonsterMuzzleFlashEvents,
  type GameEntity,
  type GameMonsterFrame,
  type GameMonsterMove,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  FRAME_attak101,
  FRAME_attak111,
  FRAME_attak115,
  FRAME_attak201,
  FRAME_attak208,
  FRAME_death101,
  FRAME_death120,
  FRAME_death201,
  FRAME_death211,
  FRAME_death225,
  FRAME_death301,
  FRAME_death309,
  FRAME_duck01,
  FRAME_duck05,
  FRAME_pain101,
  FRAME_pain110,
  FRAME_pain201,
  FRAME_pain210,
  FRAME_run01,
  FRAME_run08,
  FRAME_stand01,
  FRAME_stand49,
  FRAME_stand50,
  FRAME_stand71,
  FRAME_walk03,
  FRAME_walk14,
  InfantryMachineGun,
  MZ2_INFANTRY_MACHINEGUN_1,
  MZ2_INFANTRY_MACHINEGUN_2,
  SP_monster_infantry,
  infantry_attack,
  infantry_dead,
  infantry_die,
  infantry_dodge,
  infantry_duck_down,
  infantry_duck_hold,
  infantry_duck_up,
  infantry_fidget,
  infantry_fire,
  infantry_move_attack1,
  infantry_move_attack2,
  infantry_move_death1,
  infantry_move_death2,
  infantry_move_death3,
  infantry_move_duck,
  infantry_move_fidget,
  infantry_move_pain1,
  infantry_move_pain2,
  infantry_move_run,
  infantry_move_stand,
  infantry_move_walk,
  infantry_pain,
  infantry_run,
  infantry_sight,
  infantry_smack,
  infantry_stand,
  infantry_swing,
  infantry_walk
} from "../../packages/game/src/m_infantry.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifyStartupThinkCompletesWalkingMonsterSetup();
  verifyMonsterThinkRemainsArmedAcrossFrames();
  verifySpawnRegistryCallsMonsterInfantry();
  verifyMoveTablesMatchSourceFrames();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyStateTransitions();
  verifySightAndIdleSounds();
  verifyDuckAndDodgeBranches();
  verifyMachinegunAttack();
  verifyDeathMachinegunFrames();
  verifyMeleeCallbacks();
  verifyMoveFrameCallbacks();
  verifyPainBranches();
  verifyDeathBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-infantry: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 1);

  SP_monster_infantry(infantry, runtime);

  assert.equal(infantry.movetype, MOVETYPE_STEP);
  assert.equal(infantry.solid, SOLID_BBOX);
  assert.deepEqual(infantry.mins, [-16, -16, -24]);
  assert.deepEqual(infantry.maxs, [16, 16, 32]);
  assert.equal(infantry.health, 100);
  assert.equal(infantry.gib_health, -40);
  assert.equal(infantry.mass, 200);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_stand);
  assert.equal(infantry.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[infantry.s.modelindex - 1], "models/monsters/infantry/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "infantry/infpain1.wav",
    "infantry/infpain2.wav",
    "infantry/infdeth1.wav",
    "infantry/infdeth2.wav",
    "infantry/infatck1.wav",
    "infantry/infatck3.wav",
    "infantry/infatck2.wav",
    "infantry/melee2.wav",
    "infantry/infsght1.wav",
    "infantry/infsrch1.wav",
    "infantry/infidle1.wav"
  ]);
  assert.ok(infantry.think, "walkmonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesWalkingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 2);

  SP_monster_infantry(infantry, runtime);
  infantry.think!(infantry, runtime);

  assert.equal(infantry.yaw_speed, 20);
  assert.equal(infantry.viewheight, 25);
  assert.equal(infantry.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(infantry.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(infantry.max_health, 100);
  assert.equal(infantry.think?.name, "monster_think");
  assert.equal(infantry.nextthink, runtime.time + FRAMETIME);
}

function verifyMonsterThinkRemainsArmedAcrossFrames(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 1);

  SP_monster_infantry(infantry, runtime);
  G_RunFrame(runtime);

  assert.equal(infantry.think?.name, "monster_think");
  assert.equal(infantry.nextthink, runtime.time + FRAMETIME);

  G_RunFrame(runtime);
  G_RunFrame(runtime);

  assert.equal(infantry.think?.name, "monster_think", "SV_RunThink must not clear recurring monster think callbacks");
  assert.equal(infantry.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterInfantry(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 4);

  ED_CallSpawn(infantry, runtime);

  assert.equal(infantry.health, 100);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_stand);
}

function verifyMoveTablesMatchSourceFrames(): void {
  assertMove("stand", infantry_move_stand, FRAME_stand50, FRAME_stand71, new Array<number>(22).fill(0));
  assertMove("fidget", infantry_move_fidget, FRAME_stand01, FRAME_stand49, [
    1, 0, 1, 3, 6, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -1, 0, 0, 1, 0, -2, 1, 1,
    1, -1, 0, 0, -1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, -3, -2, -3, -3, -2
  ]);
  assert.equal(infantry_move_fidget.endfunc?.name, "infantry_stand");
  assertMove("walk", infantry_move_walk, FRAME_walk03, FRAME_walk14, [5, 4, 4, 5, 4, 5, 6, 4, 4, 4, 4, 5]);
  assertMove("run", infantry_move_run, FRAME_run01, FRAME_run08, [10, 20, 5, 7, 30, 35, 2, 6]);
  assertMove("pain1", infantry_move_pain1, FRAME_pain101, FRAME_pain110, [-3, -2, -1, -2, -1, 1, -1, 1, 6, 2]);
  assertMove("pain2", infantry_move_pain2, FRAME_pain201, FRAME_pain210, [-3, -3, 0, -1, -2, 0, 0, 2, 5, 2]);
  assertMove("death1", infantry_move_death1, FRAME_death101, FRAME_death120, [-4, 0, 0, -1, -4, 0, 0, 0, -1, 3, 1, 1, -2, 2, 2, 9, 9, 5, -3, -3]);
  assertMove("death2", infantry_move_death2, FRAME_death201, FRAME_death225, [0, 1, 5, -1, 0, 1, 1, 4, 3, 0, -2, -2, -3, -1, -2, 0, 2, 2, 3, -10, -7, -8, -6, 4, 0], [
    [10, "InfantryMachineGun"],
    [11, "InfantryMachineGun"],
    [12, "InfantryMachineGun"],
    [13, "InfantryMachineGun"],
    [14, "InfantryMachineGun"],
    [15, "InfantryMachineGun"],
    [16, "InfantryMachineGun"],
    [17, "InfantryMachineGun"],
    [18, "InfantryMachineGun"],
    [19, "InfantryMachineGun"],
    [20, "InfantryMachineGun"],
    [21, "InfantryMachineGun"]
  ]);
  assertMove("death3", infantry_move_death3, FRAME_death301, FRAME_death309, [0, 0, 0, -6, -11, -3, -11, 0, 0]);
  assertMove("duck", infantry_move_duck, FRAME_duck01, FRAME_duck05, [-2, -5, 3, 4, 0], [
    [0, "infantry_duck_down"],
    [1, "infantry_duck_hold"],
    [3, "infantry_duck_up"]
  ]);
  assertMove("attack1", infantry_move_attack1, FRAME_attak101, FRAME_attak115, [4, -1, -1, 0, -1, 1, 1, 2, -2, -3, 1, 5, -1, -2, -3], [
    [3, "infantry_cock_gun"],
    [10, "infantry_fire"]
  ]);
  assertMove("attack2", infantry_move_attack2, FRAME_attak201, FRAME_attak208, [3, 6, 0, 8, 5, 8, 6, 3], [
    [2, "infantry_swing"],
    [5, "infantry_smack"]
  ]);
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_infantry"), SP_monster_infantry);
  assert.equal(findGameSaveFunction("infantry_pain"), infantry_pain);
  assert.equal(findGameSaveFunction("infantry_die"), infantry_die);
  assert.equal(findGameSaveFunction("InfantryMachineGun"), InfantryMachineGun);
  assert.equal(findGameSaveMove("infantry_move_stand"), infantry_move_stand);
  assert.equal(findGameSaveMove("infantry_move_attack1"), infantry_move_attack1);
  assert.equal(findGameSaveMove("infantry_move_death2"), infantry_move_death2);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 4);
  const nearEnemy = createEnemy(runtime, 5, [40, 0, 0]);
  const farEnemy = createEnemy(runtime, 6, [256, 0, 0]);
  void runtime;

  infantry_stand(infantry);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_stand);
  infantry_walk(infantry);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_walk);
  infantry_run(infantry);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_run);
  infantry.monsterinfo.aiflags |= AI_STAND_GROUND;
  infantry_run(infantry);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_stand);

  infantry.enemy = nearEnemy;
  infantry_attack(infantry);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_attack2);
  infantry.enemy = farEnemy;
  infantry_attack(infantry);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_attack1);
}

function verifySightAndIdleSounds(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 7);
  SP_monster_infantry(infantry, runtime);

  infantry_sight(infantry, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "infantry/infsght1.wav");

  infantry_fidget(infantry, runtime);
  const idleSound = drainGameSoundEvents(runtime).at(-1);
  assert.equal(idleSound?.soundPath, "infantry/infidle1.wav");
  assert.equal(idleSound?.attenuation, 2);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_fidget);
}

function verifyDuckAndDodgeBranches(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 8);
  const attacker = createEnemy(runtime, 9, [128, 0, 0]);
  SP_monster_infantry(infantry, runtime);

  infantry_duck_down(infantry, runtime);
  assert.equal(infantry.monsterinfo.aiflags & AI_DUCKED, AI_DUCKED);
  assert.equal(infantry.maxs[2], 0);
  assert.equal(infantry.takedamage, damage_t.DAMAGE_YES);

  infantry_duck_hold(infantry, runtime);
  assert.equal(infantry.monsterinfo.aiflags & AI_HOLD_FRAME, AI_HOLD_FRAME);

  runtime.time = 2;
  infantry_duck_hold(infantry, runtime);
  assert.equal(infantry.monsterinfo.aiflags & AI_HOLD_FRAME, 0);

  infantry_duck_up(infantry, runtime);
  assert.equal(infantry.monsterinfo.aiflags & AI_DUCKED, 0);
  assert.equal(infantry.maxs[2], 32);
  assert.equal(infantry.takedamage, damage_t.DAMAGE_AIM);

  withMathRandom([8192 / 0x8000], () => infantry_dodge(infantry, attacker, 0));
  assert.notEqual(infantry.monsterinfo.currentmove, infantry_move_duck);
  withMathRandom([8191 / 0x8000], () => infantry_dodge(infantry, attacker, 0));
  assert.equal(infantry.enemy, attacker);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_duck);
}

function verifyMachinegunAttack(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 10);
  const enemy = createEnemy(runtime, 11, [128, 0, 24]);
  SP_monster_infantry(infantry, runtime);
  infantry.enemy = enemy;
  infantry.s.frame = FRAME_attak111;
  infantry.s.origin = [0, 0, 0];
  infantry.origin = [...infantry.s.origin];
  infantry.s.angles = [0, 0, 0];
  infantry.angles = [...infantry.s.angles];
  runtime.collision!.trace = makeBulletTrace(enemy);

  InfantryMachineGun(infantry, runtime);

  assert.equal(enemy.health, 97);
  const flashes = drainMonsterMuzzleFlashEvents(runtime);
  assert.equal(flashes.length, 1);
  assert.equal(flashes[0].flashNumber, MZ2_INFANTRY_MACHINEGUN_1);
}

function verifyDeathMachinegunFrames(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 12);
  const enemy = createEnemy(runtime, 13, [128, 0, 24]);
  SP_monster_infantry(infantry, runtime);
  infantry.enemy = enemy;
  infantry.s.frame = FRAME_death211;
  infantry.s.angles = [0, 0, 0];
  runtime.collision!.trace = makeBulletTrace(enemy);

  InfantryMachineGun(infantry, runtime);

  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_INFANTRY_MACHINEGUN_2);
}

function verifyMeleeCallbacks(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 14);
  const enemy = createEnemy(runtime, 15, [40, 0, 0]);
  SP_monster_infantry(infantry, runtime);
  infantry.enemy = enemy;
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);

  infantry_swing(infantry, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "infantry/infatck2.wav");

  withMathRandom([0], () => infantry_smack(infantry, runtime));
  assert.equal(enemy.health, 95);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "infantry/melee2.wav");
}

function verifyMoveFrameCallbacks(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 16);
  const enemy = createEnemy(runtime, 17, [40, 0, 0]);
  SP_monster_infantry(infantry, runtime);
  infantry.enemy = enemy;
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);

  infantry.monsterinfo.currentmove = infantry_move_attack2;
  infantry.s.frame = FRAME_attak201 + 1;
  M_MoveFrame(infantry, runtime);
  assert.equal(infantry.s.frame, FRAME_attak201 + 2);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "infantry/infatck2.wav");

  infantry.s.frame = FRAME_attak201 + 4;
  withMathRandom([0], () => M_MoveFrame(infantry, runtime));
  assert.equal(infantry.s.frame, FRAME_attak201 + 5);
  assert.equal(enemy.health, 95);

  infantry.monsterinfo.currentmove = infantry_move_attack1;
  infantry.s.frame = FRAME_attak101 + 2;
  withMathRandom([0], () => M_MoveFrame(infantry, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "infantry/infatck3.wav");

  infantry.s.frame = FRAME_attak115;
  M_MoveFrame(infantry, runtime);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_run);
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 18);
  SP_monster_infantry(infantry, runtime);
  infantry.max_health = 100;
  infantry.health = 40;

  withMathRandom([0], () => infantry_pain(infantry, null, 0, 10, runtime));
  assert.equal(infantry.s.skinnum, 1);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_pain1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "infantry/infpain1.wav");

  runtime.time = 4;
  withMathRandom([0.75], () => infantry_pain(infantry, null, 0, 10, runtime));
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_pain2);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "infantry/infpain2.wav");

  runtime.skill = 3;
  runtime.time = 8;
  infantry.monsterinfo.currentmove = infantry_move_stand;
  infantry_pain(infantry, null, 0, 10, runtime);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_stand, "nightmare pain should not start a pain animation");
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const infantry = createInfantry(runtime, 19);
  SP_monster_infantry(infantry, runtime);

  withMathRandom([0], () => infantry_die(infantry, null, null, 60, runtime));
  assert.equal(infantry.deadflag, DEAD_DEAD);
  assert.equal(infantry.takedamage, damage_t.DAMAGE_YES);
  assert.equal(infantry.monsterinfo.currentmove, infantry_move_death1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "infantry/infdeth2.wav");

  const second = createInfantry(runtime, 20);
  SP_monster_infantry(second, runtime);
  withMathRandom([0.4], () => infantry_die(second, null, null, 60, runtime));
  assert.equal(second.monsterinfo.currentmove, infantry_move_death2);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "infantry/infdeth1.wav");

  const third = createInfantry(runtime, 21);
  SP_monster_infantry(third, runtime);
  withMathRandom([0.8], () => infantry_die(third, null, null, 60, runtime));
  assert.equal(third.monsterinfo.currentmove, infantry_move_death3);

  infantry_dead(third, runtime);
  assert.deepEqual(third.mins, [-16, -16, -24]);
  assert.deepEqual(third.maxs, [16, 16, -8]);
  assert.equal(third.movetype, MOVETYPE_TOSS);
  assert.equal(third.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);

  const gibInfantry = createInfantry(runtime, 22);
  SP_monster_infantry(gibInfantry, runtime);
  gibInfantry.health = -40;
  infantry_die(gibInfantry, null, null, 25, runtime);
  assert.equal(gibInfantry.deadflag, DEAD_DEAD);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/bone/tris.md2").length, 2);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2").length, 4);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/head2/tris.md2").length, 1);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const infantry = createInfantry(runtime, 23);

  SP_monster_infantry(infantry, runtime);

  assert.equal(infantry.inuse, false);
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

function createInfantry(runtime: GameRuntime, index: number): GameEntity {
  const infantry = createRuntimeEntity({ classname: "monster_infantry" }, index);
  runtime.entities[index] = infantry;
  return infantry;
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

function makeBulletTrace(enemy: GameEntity): NonNullable<GameRuntime["collision"]>["trace"] {
  let traceCount = 0;
  return (_start, _mins, _maxs, end) => {
    traceCount += 1;
    if (traceCount === 1) {
      return makeTrace(null, end);
    }
    const trace = makeTrace(enemy, end);
    trace.fraction = 0.5;
    return trace;
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
