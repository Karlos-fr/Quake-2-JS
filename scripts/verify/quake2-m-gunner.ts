/**
 * File: quake2-m-gunner.ts
 * Purpose: Verify the gameplay port of `game/m_gunner.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_gunner behavior.
 *
 * Dependencies:
 * - packages/game/src/m_gunner.ts
 */

import { strict as assert } from "node:assert";

import type { trace_t, vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_DUCKED,
  AI_HOLD_FRAME,
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
  FRAME_attak105,
  FRAME_attak121,
  FRAME_attak209,
  FRAME_attak215,
  FRAME_attak216,
  FRAME_attak223,
  FRAME_attak224,
  FRAME_attak230,
  FRAME_death01,
  FRAME_death11,
  FRAME_duck01,
  FRAME_duck08,
  FRAME_pain101,
  FRAME_pain118,
  FRAME_pain201,
  FRAME_pain208,
  FRAME_pain301,
  FRAME_pain305,
  FRAME_run01,
  FRAME_run08,
  FRAME_runs01,
  FRAME_runs06,
  FRAME_stand01,
  FRAME_stand30,
  FRAME_stand31,
  FRAME_stand70,
  FRAME_walk07,
  FRAME_walk19,
  GunnerFire,
  GunnerGrenade,
  MZ2_GUNNER_GRENADE_1,
  MZ2_GUNNER_MACHINEGUN_1,
  SP_monster_gunner,
  gunner_attack,
  gunner_dead,
  gunner_die,
  gunner_dodge,
  gunner_duck_down,
  gunner_duck_hold,
  gunner_duck_up,
  gunner_fire_chain,
  gunner_move_attack_chain,
  gunner_move_attack_grenade,
  gunner_move_death,
  gunner_move_duck,
  gunner_move_endfire_chain,
  gunner_move_fidget,
  gunner_move_fire_chain,
  gunner_move_pain1,
  gunner_move_pain2,
  gunner_move_pain3,
  gunner_move_run,
  gunner_move_runandshoot,
  gunner_move_stand,
  gunner_move_walk,
  gunner_opengun,
  gunner_pain,
  gunner_refire_chain,
  gunner_run,
  gunner_runandshoot,
  gunner_search,
  gunner_sight,
  gunner_stand,
  gunner_walk
} from "../../packages/game/src/m_gunner.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifyStartupThinkCompletesWalkingMonsterSetup();
  verifySpawnRegistryCallsMonsterGunner();
  verifyMoveTablesMatchSourceFrames();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyStateTransitions();
  verifySounds();
  verifyDuckAndDodgeBranches();
  verifyWeaponCallbacks();
  verifyMoveFrameCallbacks();
  verifyPainBranches();
  verifyDeathBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-gunner: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const gunner = createGunner(runtime, 1);

  SP_monster_gunner(gunner, runtime);

  assert.equal(gunner.movetype, MOVETYPE_STEP);
  assert.equal(gunner.solid, SOLID_BBOX);
  assert.deepEqual(gunner.mins, [-16, -16, -24]);
  assert.deepEqual(gunner.maxs, [16, 16, 32]);
  assert.equal(gunner.health, 175);
  assert.equal(gunner.gib_health, -70);
  assert.equal(gunner.mass, 200);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_stand);
  assert.equal(gunner.monsterinfo.scale, 1.15);
  assert.equal(runtime.assets.modelPaths[gunner.s.modelindex - 1], "models/monsters/gunner/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "gunner/death1.wav",
    "gunner/gunpain2.wav",
    "gunner/gunpain1.wav",
    "gunner/gunidle1.wav",
    "gunner/gunatck1.wav",
    "gunner/gunsrch1.wav",
    "gunner/sight1.wav",
    "gunner/gunatck2.wav",
    "gunner/gunatck3.wav"
  ]);
  assert.ok(gunner.think, "walkmonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesWalkingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const gunner = createGunner(runtime, 2);

  SP_monster_gunner(gunner, runtime);
  gunner.think!(gunner, runtime);

  assert.equal(gunner.yaw_speed, 20);
  assert.equal(gunner.viewheight, 25);
  assert.equal(gunner.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(gunner.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(gunner.max_health, 175);
  assert.equal(gunner.think?.name, "monster_think");
  assert.equal(gunner.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterGunner(): void {
  const runtime = createHarnessRuntime();
  const gunner = createGunner(runtime, 3);

  ED_CallSpawn(gunner, runtime);

  assert.equal(gunner.health, 175);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_stand);
}

function verifyMoveTablesMatchSourceFrames(): void {
  assertMove("fidget", gunner_move_fidget, FRAME_stand31, FRAME_stand70, new Array<number>(49).fill(0), [[7, "gunner_idlesound"]], false);
  assertMove("stand", gunner_move_stand, FRAME_stand01, FRAME_stand30, new Array<number>(30).fill(0), [
    [9, "gunner_fidget"],
    [19, "gunner_fidget"],
    [29, "gunner_fidget"]
  ]);
  assertMove("walk", gunner_move_walk, FRAME_walk07, FRAME_walk19, [0, 3, 4, 5, 7, 2, 6, 4, 2, 7, 5, 7, 4]);
  assertMove("run", gunner_move_run, FRAME_run01, FRAME_run08, [26, 9, 9, 9, 15, 10, 13, 6]);
  assertMove("runandshoot", gunner_move_runandshoot, FRAME_runs01, FRAME_runs06, [32, 15, 10, 18, 8, 20]);
  assertMove("pain3", gunner_move_pain3, FRAME_pain301, FRAME_pain305, [-3, 1, 1, 0, 1]);
  assertMove("pain2", gunner_move_pain2, FRAME_pain201, FRAME_pain208, [-2, 11, 6, 2, -1, -7, -2, -7]);
  assertMove("pain1", gunner_move_pain1, FRAME_pain101, FRAME_pain118, [2, 0, -5, 3, -1, 0, 0, 0, 0, 1, 1, 2, 1, 0, -2, -2, 0, 0]);
  assertMove("death", gunner_move_death, FRAME_death01, FRAME_death11, [0, 0, 0, -7, -3, -5, 8, 6, 0, 0, 0]);
  assertMove("duck", gunner_move_duck, FRAME_duck01, FRAME_duck08, [1, 1, 1, 0, -1, -1, 0, -1], [
    [0, "gunner_duck_down"],
    [2, "gunner_duck_hold"],
    [6, "gunner_duck_up"]
  ]);
  assertMove("attack_chain", gunner_move_attack_chain, FRAME_attak209, FRAME_attak215, new Array<number>(7).fill(0), [[0, "gunner_opengun"]]);
  assertMove("fire_chain", gunner_move_fire_chain, FRAME_attak216, FRAME_attak223, new Array<number>(8).fill(0), [
    [0, "GunnerFire"],
    [1, "GunnerFire"],
    [2, "GunnerFire"],
    [3, "GunnerFire"],
    [4, "GunnerFire"],
    [5, "GunnerFire"],
    [6, "GunnerFire"],
    [7, "GunnerFire"]
  ]);
  assertMove("endfire_chain", gunner_move_endfire_chain, FRAME_attak224, FRAME_attak230, new Array<number>(7).fill(0));
  assertMove("attack_grenade", gunner_move_attack_grenade, FRAME_attak101, FRAME_attak121, new Array<number>(21).fill(0), [
    [4, "GunnerGrenade"],
    [7, "GunnerGrenade"],
    [10, "GunnerGrenade"],
    [13, "GunnerGrenade"]
  ]);
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_gunner"), SP_monster_gunner);
  assert.equal(findGameSaveFunction("gunner_pain"), gunner_pain);
  assert.equal(findGameSaveFunction("gunner_die"), gunner_die);
  assert.equal(findGameSaveFunction("GunnerFire"), GunnerFire);
  assert.equal(findGameSaveMove("gunner_move_stand"), gunner_move_stand);
  assert.equal(findGameSaveMove("gunner_move_fire_chain"), gunner_move_fire_chain);
  assert.equal(findGameSaveMove("gunner_move_death"), gunner_move_death);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const gunner = createGunner(runtime, 4);
  const nearEnemy = createEnemy(runtime, 5, [40, 0, 0]);
  const farEnemy = createEnemy(runtime, 6, [256, 0, 0]);
  void runtime;

  gunner_stand(gunner);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_stand);
  gunner_walk(gunner);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_walk);
  gunner_run(gunner);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_run);
  gunner.monsterinfo.aiflags |= AI_STAND_GROUND;
  gunner_run(gunner);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_stand);
  gunner.monsterinfo.aiflags &= ~AI_STAND_GROUND;
  gunner_runandshoot(gunner);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_runandshoot);

  gunner.enemy = nearEnemy;
  gunner_attack(gunner);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_attack_chain);
  gunner.enemy = farEnemy;
  withMathRandom([0.25], () => gunner_attack(gunner));
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_attack_grenade);
  withMathRandom([0.75], () => gunner_attack(gunner));
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_attack_chain);

  gunner_fire_chain(gunner);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_fire_chain);
  withMathRandom([0.25], () => gunner_refire_chain(gunner, createVisibleRuntime()));
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_fire_chain);
  farEnemy.health = 0;
  gunner_refire_chain(gunner, runtime);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_endfire_chain);
}

function verifySounds(): void {
  const runtime = createHarnessRuntime();
  const gunner = createGunner(runtime, 7);
  SP_monster_gunner(gunner, runtime);

  gunner_sight(gunner, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gunner/sight1.wav");

  gunner_search(gunner, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gunner/gunsrch1.wav");

  gunner_opengun(gunner, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gunner/gunatck1.wav");
}

function verifyDuckAndDodgeBranches(): void {
  const runtime = createHarnessRuntime();
  const gunner = createGunner(runtime, 8);
  const attacker = createEnemy(runtime, 9, [128, 0, 0]);
  SP_monster_gunner(gunner, runtime);

  gunner_duck_down(gunner, runtime);
  assert.equal(gunner.monsterinfo.aiflags & AI_DUCKED, AI_DUCKED);
  assert.equal(gunner.maxs[2], 0);
  assert.equal(gunner.takedamage, damage_t.DAMAGE_YES);

  gunner_duck_hold(gunner, runtime);
  assert.equal(gunner.monsterinfo.aiflags & AI_HOLD_FRAME, AI_HOLD_FRAME);

  runtime.time = 2;
  gunner_duck_hold(gunner, runtime);
  assert.equal(gunner.monsterinfo.aiflags & AI_HOLD_FRAME, 0);

  gunner_duck_up(gunner, runtime);
  assert.equal(gunner.monsterinfo.aiflags & AI_DUCKED, 0);
  assert.equal(gunner.maxs[2], 32);
  assert.equal(gunner.takedamage, damage_t.DAMAGE_AIM);

  withMathRandom([0.5], () => gunner_dodge(gunner, attacker, 0));
  assert.notEqual(gunner.monsterinfo.currentmove, gunner_move_duck);
  withMathRandom([0.1], () => gunner_dodge(gunner, attacker, 0));
  assert.equal(gunner.enemy, attacker);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_duck);

  runtime.skill = 2;
  const duckGrenadier = createGunner(runtime, 10);
  SP_monster_gunner(duckGrenadier, runtime);
  duckGrenadier.s.frame = FRAME_attak105;
  duckGrenadier.s.angles = [0, 0, 0];
  withMathRandom([0.75, 0.5, 0.5], () => gunner_duck_down(duckGrenadier, runtime));
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_GUNNER_GRENADE_1);
}

function verifyWeaponCallbacks(): void {
  const runtime = createHarnessRuntime();
  const gunner = createGunner(runtime, 11);
  const enemy = createEnemy(runtime, 12, [128, 0, 24]);
  SP_monster_gunner(gunner, runtime);
  gunner.enemy = enemy;
  gunner.s.frame = FRAME_attak216;
  gunner.s.origin = [0, 0, 0];
  gunner.origin = [...gunner.s.origin];
  gunner.s.angles = [0, 0, 0];
  gunner.angles = [...gunner.s.angles];
  runtime.collision!.trace = makeBulletTrace(enemy);

  GunnerFire(gunner, runtime);

  assert.equal(enemy.health, 97);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_GUNNER_MACHINEGUN_1);

  gunner.s.frame = FRAME_attak105;
  withMathRandom([0.5, 0.5], () => GunnerGrenade(gunner, runtime));
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_GUNNER_GRENADE_1);
  assert.ok(runtime.entities.some((entity) => entity.classname === "grenade"));
}

function verifyMoveFrameCallbacks(): void {
  const runtime = createHarnessRuntime();
  const gunner = createGunner(runtime, 13);
  const enemy = createEnemy(runtime, 14, [128, 0, 24]);
  SP_monster_gunner(gunner, runtime);
  gunner.enemy = enemy;
  runtime.collision!.trace = makeBulletTrace(enemy);

  gunner.monsterinfo.currentmove = gunner_move_attack_chain;
  gunner.s.frame = FRAME_attak209 - 1;
  M_MoveFrame(gunner, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gunner/gunatck1.wav");

  gunner.monsterinfo.currentmove = gunner_move_fire_chain;
  gunner.s.frame = FRAME_attak216 - 1;
  M_MoveFrame(gunner, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_GUNNER_MACHINEGUN_1);

  gunner.monsterinfo.currentmove = gunner_move_attack_grenade;
  gunner.s.frame = FRAME_attak101 + 3;
  withMathRandom([0.5, 0.5], () => M_MoveFrame(gunner, runtime));
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_GUNNER_GRENADE_1);

  gunner.monsterinfo.currentmove = gunner_move_death;
  gunner.s.frame = FRAME_death11;
  M_MoveFrame(gunner, runtime);
  assert.equal(gunner.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const gunner = createGunner(runtime, 15);
  SP_monster_gunner(gunner, runtime);
  gunner.max_health = 175;
  gunner.health = 80;

  withMathRandom([0.75], () => gunner_pain(gunner, null, 0, 10, runtime));
  assert.equal(gunner.s.skinnum, 1);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_pain3);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gunner/gunpain2.wav");

  runtime.time = 4;
  withMathRandom([0.25], () => gunner_pain(gunner, null, 0, 20, runtime));
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_pain2);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gunner/gunpain1.wav");

  runtime.time = 8;
  gunner_pain(gunner, null, 0, 40, runtime);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_pain1);

  runtime.skill = 3;
  runtime.time = 12;
  gunner.monsterinfo.currentmove = gunner_move_stand;
  gunner_pain(gunner, null, 0, 40, runtime);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_stand, "nightmare pain should not start a pain animation");
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const gunner = createGunner(runtime, 16);
  SP_monster_gunner(gunner, runtime);

  gunner_die(gunner, null, null, 60, runtime);
  assert.equal(gunner.deadflag, DEAD_DEAD);
  assert.equal(gunner.takedamage, damage_t.DAMAGE_YES);
  assert.equal(gunner.monsterinfo.currentmove, gunner_move_death);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gunner/death1.wav");

  gunner_dead(gunner, runtime);
  assert.deepEqual(gunner.mins, [-16, -16, -24]);
  assert.deepEqual(gunner.maxs, [16, 16, -8]);
  assert.equal(gunner.movetype, MOVETYPE_TOSS);
  assert.equal(gunner.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
  assert.equal(gunner.nextthink, 0);

  const gibGunner = createGunner(runtime, 17);
  SP_monster_gunner(gibGunner, runtime);
  gibGunner.health = -70;
  gunner_die(gibGunner, null, null, 25, runtime);
  assert.equal(gibGunner.deadflag, DEAD_DEAD);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/bone/tris.md2").length, 2);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2").length, 4);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/head2/tris.md2").length, 1);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const gunner = createGunner(runtime, 18);

  SP_monster_gunner(gunner, runtime);

  assert.equal(gunner.inuse, false);
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

function createVisibleRuntime(): GameRuntime {
  return createHarnessRuntime();
}

function createGunner(runtime: GameRuntime, index: number): GameEntity {
  const gunner = createRuntimeEntity({ classname: "monster_gunner" }, index);
  runtime.entities[index] = gunner;
  return gunner;
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
  thinkNames: Array<[index: number, name: string]> = [],
  requireRangeLength = true
): void {
  assert.equal(move.firstframe, firstframe, `${label}: firstframe`);
  assert.equal(move.lastframe, lastframe, `${label}: lastframe`);
  assert.equal(move.frame.length, distances.length, `${label}: frame length`);
  if (requireRangeLength) {
    assert.equal(move.lastframe - move.firstframe + 1, distances.length, `${label}: frame range length`);
  }

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
