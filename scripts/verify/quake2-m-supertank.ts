/**
 * File: quake2-m-supertank.ts
 * Purpose: Verify the gameplay port of `game/m_supertank.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_supertank behavior.
 *
 * Dependencies:
 * - packages/game/src/m_supertank.ts
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
  drainMonsterMuzzleFlashEvents,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  BossExplode,
  FRAME_attak1_1,
  FRAME_attak2_8,
  FRAME_attak2_11,
  FRAME_attak2_14,
  FRAME_death_24,
  MZ2_SUPERTANK_MACHINEGUN_1,
  MZ2_SUPERTANK_ROCKET_1,
  MZ2_SUPERTANK_ROCKET_2,
  MZ2_SUPERTANK_ROCKET_3,
  SP_monster_supertank,
  TreadSound,
  supertankMachineGun,
  supertankRocket,
  supertank_attack,
  supertank_dead,
  supertank_die,
  supertank_forward,
  supertank_move_attack1,
  supertank_move_attack2,
  supertank_move_death,
  supertank_move_end_attack1,
  supertank_move_forward,
  supertank_move_pain1,
  supertank_move_pain2,
  supertank_move_pain3,
  supertank_move_run,
  supertank_move_stand,
  supertank_pain,
  supertank_reattack1,
  supertank_run,
  supertank_search,
  supertank_stand,
  supertank_walk
} from "../../packages/game/src/m_supertank.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifyStartupThinkCompletesWalkingMonsterSetup();
  verifySpawnRegistryCallsMonsterSupertank();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyStateTransitions();
  verifySounds();
  verifyWeaponCallbacks();
  verifyMoveFrameCallbacks();
  verifyPainBranches();
  verifyDeathAndExplosionBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-supertank: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const supertank = createSupertank(runtime, 1);

  SP_monster_supertank(supertank, runtime);

  assert.equal(supertank.movetype, MOVETYPE_STEP);
  assert.equal(supertank.solid, SOLID_BBOX);
  assert.deepEqual(supertank.mins, [-64, -64, 0]);
  assert.deepEqual(supertank.maxs, [64, 64, 112]);
  assert.equal(supertank.health, 1500);
  assert.equal(supertank.gib_health, -500);
  assert.equal(supertank.mass, 800);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_stand);
  assert.equal(supertank.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[supertank.s.modelindex - 1], "models/monsters/boss1/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "bosstank/btkpain1.wav",
    "bosstank/btkpain2.wav",
    "bosstank/btkpain3.wav",
    "bosstank/btkdeth1.wav",
    "bosstank/btkunqv1.wav",
    "bosstank/btkunqv2.wav",
    "bosstank/btkengn1.wav"
  ]);
  assert.ok(supertank.think, "walkmonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesWalkingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const supertank = createSupertank(runtime, 2);

  SP_monster_supertank(supertank, runtime);
  supertank.think!(supertank, runtime);

  assert.equal(supertank.yaw_speed, 20);
  assert.equal(supertank.viewheight, 25);
  assert.equal(supertank.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(supertank.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(supertank.max_health, 1500);
  assert.equal(supertank.think?.name, "monster_think");
  assert.equal(supertank.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterSupertank(): void {
  const runtime = createHarnessRuntime();
  const supertank = createSupertank(runtime, 3);

  ED_CallSpawn(supertank, runtime);

  assert.equal(supertank.health, 1500);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_stand);
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_supertank"), SP_monster_supertank);
  assert.equal(findGameSaveFunction("supertank_pain"), supertank_pain);
  assert.equal(findGameSaveFunction("supertank_die"), supertank_die);
  assert.equal(findGameSaveFunction("BossExplode"), BossExplode);
  assert.equal(findGameSaveMove("supertank_move_stand"), supertank_move_stand);
  assert.equal(findGameSaveMove("supertank_move_attack2"), supertank_move_attack2);
  assert.equal(findGameSaveMove("supertank_move_death"), supertank_move_death);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const supertank = createSupertank(runtime, 4);
  const nearEnemy = createEnemy(runtime, 5, [128, 0, 24]);
  const farEnemy = createEnemy(runtime, 6, [512, 0, 24]);

  supertank_stand(supertank);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_stand);
  supertank_forward(supertank);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_forward);
  supertank_walk(supertank);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_forward);
  supertank_run(supertank);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_run);
  supertank.monsterinfo.aiflags |= AI_STAND_GROUND;
  supertank_run(supertank);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_stand);
  supertank.monsterinfo.aiflags &= ~AI_STAND_GROUND;

  supertank.enemy = nearEnemy;
  supertank_attack(supertank);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_attack1);
  supertank.enemy = farEnemy;
  withMathRandom([0.1], () => supertank_attack(supertank));
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_attack1);
  withMathRandom([0.9], () => supertank_attack(supertank));
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_attack2);

  withMathRandom([0.1], () => supertank_reattack1(supertank, runtime));
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_attack1);
  withMathRandom([0.95], () => supertank_reattack1(supertank, runtime));
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_end_attack1);
}

function verifySounds(): void {
  const runtime = createHarnessRuntime();
  const supertank = createSupertank(runtime, 7);
  SP_monster_supertank(supertank, runtime);

  TreadSound(supertank, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosstank/btkengn1.wav");

  withMathRandom([0.25], () => supertank_search(supertank, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosstank/btkunqv1.wav");
  withMathRandom([0.75], () => supertank_search(supertank, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosstank/btkunqv2.wav");
}

function verifyWeaponCallbacks(): void {
  const runtime = createHarnessRuntime();
  const supertank = createSupertank(runtime, 8);
  const enemy = createEnemy(runtime, 9, [256, 0, 24]);
  SP_monster_supertank(supertank, runtime);
  supertank.enemy = enemy;
  supertank.s.origin = [0, 0, 0];
  supertank.origin = [...supertank.s.origin];
  supertank.s.angles = [0, 0, 0];
  supertank.angles = [...supertank.s.angles];
  runtime.collision!.trace = makeBulletTrace(enemy);

  supertank.s.frame = FRAME_attak1_1;
  supertankMachineGun(supertank, runtime);
  assert.equal(enemy.health, 94);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_SUPERTANK_MACHINEGUN_1);

  supertank.s.frame = FRAME_attak2_8;
  withMathRandom([0.5, 0.5], () => supertankRocket(supertank, runtime));
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_SUPERTANK_ROCKET_1);
  assert.ok(runtime.entities.some((entity) => entity.classname === "rocket"));

  supertank.s.frame = FRAME_attak2_11;
  withMathRandom([0.5, 0.5], () => supertankRocket(supertank, runtime));
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_SUPERTANK_ROCKET_2);

  supertank.s.frame = FRAME_attak2_14;
  withMathRandom([0.5, 0.5], () => supertankRocket(supertank, runtime));
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_SUPERTANK_ROCKET_3);
}

function verifyMoveFrameCallbacks(): void {
  const runtime = createHarnessRuntime();
  const supertank = createSupertank(runtime, 10);
  const enemy = createEnemy(runtime, 11, [256, 0, 24]);
  SP_monster_supertank(supertank, runtime);
  supertank.enemy = enemy;
  runtime.collision!.trace = makeBulletTrace(enemy);

  supertank.monsterinfo.currentmove = supertank_move_attack1;
  supertank.s.frame = FRAME_attak1_1 - 1;
  M_MoveFrame(supertank, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_SUPERTANK_MACHINEGUN_1);

  supertank.monsterinfo.currentmove = supertank_move_attack2;
  supertank.s.frame = FRAME_attak2_8 - 1;
  withMathRandom([0.5, 0.5], () => M_MoveFrame(supertank, runtime));
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_SUPERTANK_ROCKET_1);

  supertank.monsterinfo.currentmove = supertank_move_death;
  supertank.s.frame = FRAME_death_24 - 1;
  M_MoveFrame(supertank, runtime);
  assert.equal(drainGameTempEntityEvents(runtime).at(-1)?.type, temp_event_t.TE_EXPLOSION1);
  assert.equal(supertank.think?.name, "BossExplode");
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const supertank = createSupertank(runtime, 12);
  SP_monster_supertank(supertank, runtime);
  supertank.max_health = 1500;
  supertank.health = 700;

  withMathRandom([0.5], () => supertank_pain(supertank, null, 0, 10, runtime));
  assert.equal(supertank.s.skinnum, 1);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_pain1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosstank/btkpain1.wav");

  runtime.time = 4;
  withMathRandom([0.5], () => supertank_pain(supertank, null, 0, 20, runtime));
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_pain2);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosstank/btkpain3.wav");

  runtime.time = 8;
  supertank_pain(supertank, null, 0, 40, runtime);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_pain3);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosstank/btkpain2.wav");

  runtime.skill = 2;
  runtime.time = 12;
  supertank.s.frame = FRAME_attak2_8;
  supertank.monsterinfo.currentmove = supertank_move_stand;
  supertank_pain(supertank, null, 0, 40, runtime);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_stand, "rocket firing frames should skip pain on hard skill");

  runtime.skill = 3;
  runtime.time = 16;
  supertank.s.frame = FRAME_attak1_1;
  supertank_pain(supertank, null, 0, 40, runtime);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_stand, "nightmare pain should not start a pain animation");
}

function verifyDeathAndExplosionBranches(): void {
  const runtime = createHarnessRuntime();
  const supertank = createSupertank(runtime, 13);
  SP_monster_supertank(supertank, runtime);

  supertank_die(supertank, null, null, 60, runtime);
  assert.equal(supertank.deadflag, DEAD_DEAD);
  assert.equal(supertank.takedamage, damage_t.DAMAGE_NO);
  assert.equal(supertank.count, 0);
  assert.equal(supertank.monsterinfo.currentmove, supertank_move_death);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosstank/btkdeth1.wav");

  supertank_dead(supertank, runtime);
  assert.deepEqual(supertank.mins, [-60, -60, 0]);
  assert.deepEqual(supertank.maxs, [60, 60, 72]);
  assert.equal(supertank.movetype, MOVETYPE_TOSS);
  assert.equal(supertank.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
  assert.equal(supertank.nextthink, 0);

  const exploding = createSupertank(runtime, 14);
  SP_monster_supertank(exploding, runtime);
  exploding.count = 0;
  for (let index = 0; index < 8; index += 1) {
    BossExplode(exploding, runtime);
  }
  assert.equal(drainGameTempEntityEvents(runtime).length, 8);
  BossExplode(exploding, runtime);
  assert.equal(exploding.deadflag, DEAD_DEAD);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2").length, 4);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_metal/tris.md2").length, 8);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/chest/tris.md2").length, 1);
  assert.equal(exploding.model, "models/objects/gibs/gear/tris.md2");
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const supertank = createSupertank(runtime, 15);

  SP_monster_supertank(supertank, runtime);

  assert.equal(supertank.inuse, false);
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

function createSupertank(runtime: GameRuntime, index: number): GameEntity {
  const supertank = createRuntimeEntity({ classname: "monster_supertank" }, index);
  runtime.entities[index] = supertank;
  return supertank;
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
