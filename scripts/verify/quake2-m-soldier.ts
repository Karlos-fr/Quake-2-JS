/**
 * File: quake2-m-soldier.ts
 * Purpose: Verify the gameplay port of `game/m_soldier.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_soldier behavior.
 *
 * Dependencies:
 * - packages/game/src/m_soldier.ts
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
  T_Damage,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  FRAME_attak101,
  FRAME_attak102,
  FRAME_attak201,
  FRAME_attak204,
  FRAME_attak301,
  FRAME_attak303,
  FRAME_duck01,
  FRAME_runs03,
  MZ2_SOLDIER_BLASTER_1,
  MZ2_SOLDIER_MACHINEGUN_1,
  MZ2_SOLDIER_SHOTGUN_1,
  SP_monster_soldier,
  SP_monster_soldier_light,
  SP_monster_soldier_ss,
  soldier_attack,
  soldier_attack1_refire1,
  soldier_attack1_refire2,
  soldier_attack2_refire1,
  soldier_attack2_refire2,
  soldier_attack3_refire,
  soldier_attack6_refire,
  soldier_dead,
  soldier_die,
  soldier_dodge,
  soldier_duck_down,
  soldier_duck_hold,
  soldier_duck_up,
  soldier_fire,
  soldier_fire3,
  soldier_idle,
  soldier_move_attack1,
  soldier_move_attack2,
  soldier_move_attack3,
  soldier_move_attack4,
  soldier_move_attack6,
  soldier_move_death1,
  soldier_move_death2,
  soldier_move_death3,
  soldier_move_death4,
  soldier_move_death5,
  soldier_move_death6,
  soldier_move_duck,
  soldier_move_pain1,
  soldier_move_pain2,
  soldier_move_pain3,
  soldier_move_pain4,
  soldier_move_run,
  soldier_move_stand1,
  soldier_move_stand3,
  soldier_move_start_run,
  soldier_move_walk1,
  soldier_move_walk2,
  soldier_pain,
  soldier_run,
  soldier_sight,
  soldier_stand,
  soldier_walk,
  soldier_walk1_random
} from "../../packages/game/src/m_soldier.js";

main();

function main(): void {
  verifySpawnVariantsRegisterAssetsAndStartWalking();
  verifyStartupThinkCompletesWalkingMonsterSetup();
  verifySpawnRegistryAndSaveRegistry();
  verifyStateTransitions();
  verifyRefireBranches();
  verifySightIdleDuckAndDodgeBranches();
  verifyWeaponBranches();
  verifyMoveFrameCallbacks();
  verifyPainBranches();
  verifyDeathBranches();
  verifyDamageDispatchPreservesHeadshotPoint();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-soldier: ok");
}

function verifySpawnVariantsRegisterAssetsAndStartWalking(): void {
  const runtime = createHarnessRuntime();
  const light = createSoldier(runtime, 1, "monster_soldier_light");
  const normal = createSoldier(runtime, 2, "monster_soldier");
  const ss = createSoldier(runtime, 3, "monster_soldier_ss");

  SP_monster_soldier_light(light, runtime);
  SP_monster_soldier(normal, runtime);
  SP_monster_soldier_ss(ss, runtime);

  assertSpawnedSoldier(light, 20, 0);
  assertSpawnedSoldier(normal, 30, 2);
  assertSpawnedSoldier(ss, 40, 4);
  assert.equal(light.gib_health, -30);
  assert.equal(light.mass, 100);
  assert.equal(light.monsterinfo.scale, 1.2);
  assert.equal(runtime.assets.modelPaths[light.s.modelindex - 1], "models/monsters/soldier/tris.md2");
  assert.ok(light.think, "walkmonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesWalkingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const soldier = createSoldier(runtime, 4, "monster_soldier");

  SP_monster_soldier(soldier, runtime);
  soldier.think!(soldier, runtime);

  assert.equal(soldier.yaw_speed, 20);
  assert.equal(soldier.viewheight, 25);
  assert.equal(soldier.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(soldier.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(soldier.max_health, 0, "soldier variants set health after the shared C monster_start call");
  assert.equal(soldier.think?.name, "monster_think");
  assert.equal(soldier.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryAndSaveRegistry(): void {
  const runtime = createHarnessRuntime();
  const soldier = createSoldier(runtime, 5, "monster_soldier_ss");

  ED_CallSpawn(soldier, runtime);

  assert.equal(soldier.health, 40);
  assert.equal(findGameSaveFunction("SP_monster_soldier"), SP_monster_soldier);
  assert.equal(findGameSaveFunction("soldier_pain"), soldier_pain);
  assert.equal(findGameSaveFunction("soldier_die"), soldier_die);
  assert.equal(findGameSaveMove("soldier_move_stand1"), soldier_move_stand1);
  assert.equal(findGameSaveMove("soldier_move_attack6"), soldier_move_attack6);
  assert.equal(findGameSaveMove("soldier_move_death3"), soldier_move_death3);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const soldier = createSoldier(runtime, 6, "monster_soldier");
  void runtime;

  withMathRandom([0.1], () => soldier_stand(soldier));
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_stand1);
  withMathRandom([0.9], () => soldier_stand(soldier));
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_stand3);
  soldier.monsterinfo.currentmove = soldier_move_stand3;
  soldier_stand(soldier);
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_stand1);

  withMathRandom([0.25], () => soldier_walk(soldier));
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_walk1);
  withMathRandom([0.75], () => soldier_walk(soldier));
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_walk2);

  soldier.monsterinfo.currentmove = soldier_move_stand1;
  soldier_run(soldier);
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_start_run);
  soldier_run(soldier);
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_run);
  soldier.monsterinfo.aiflags |= AI_STAND_GROUND;
  soldier_run(soldier);
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_stand1);

  withMathRandom([0.9], () => soldier_walk1_random(soldier));
  assert.equal(soldier.monsterinfo.nextframe, 215);
}

function verifyRefireBranches(): void {
  const runtime = createHarnessRuntime();
  const soldier = createSoldier(runtime, 7, "monster_soldier_light");
  const enemy = createEnemy(runtime, 8, [40, 0, 24]);
  SP_monster_soldier_light(soldier, runtime);
  soldier.enemy = enemy;

  runtime.skill = 3;
  withMathRandom([0.2], () => soldier_attack1_refire1(soldier, runtime));
  assert.equal(soldier.monsterinfo.nextframe, FRAME_attak102);
  soldier.monsterinfo.nextframe = 0;
  withMathRandom([0.2], () => soldier_attack2_refire1(soldier, runtime));
  assert.equal(soldier.monsterinfo.nextframe, FRAME_attak204);

  soldier.s.skinnum = 2;
  withMathRandom([0.2], () => soldier_attack1_refire2(soldier, runtime));
  assert.equal(soldier.monsterinfo.nextframe, FRAME_attak102);
  soldier.monsterinfo.nextframe = 0;
  withMathRandom([0.2], () => soldier_attack2_refire2(soldier, runtime));
  assert.equal(soldier.monsterinfo.nextframe, FRAME_attak204);

  soldier.monsterinfo.pausetime = runtime.time + 1;
  soldier_attack3_refire(soldier, runtime);
  assert.equal(soldier.monsterinfo.nextframe, FRAME_attak303);

  soldier.enemy = createEnemy(runtime, 9, [512, 0, 24]);
  runtime.skill = 3;
  soldier_attack6_refire(soldier, runtime);
  assert.equal(soldier.monsterinfo.nextframe, FRAME_runs03);
}

function verifySightIdleDuckAndDodgeBranches(): void {
  const runtime = createHarnessRuntime();
  const soldier = createSoldier(runtime, 10, "monster_soldier");
  const attacker = createEnemy(runtime, 11, [512, 0, 24]);
  SP_monster_soldier(soldier, runtime);
  soldier.enemy = attacker;

  withMathRandom([0.9], () => soldier_idle(soldier, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "soldier/solidle1.wav");

  runtime.skill = 1;
  withMathRandom([0.4, 0.75], () => soldier_sight(soldier, null, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "soldier/solsght1.wav");
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_attack6);

  soldier_duck_down(soldier, runtime);
  assert.equal(soldier.monsterinfo.aiflags & AI_DUCKED, AI_DUCKED);
  assert.equal(soldier.maxs[2], 0);
  assert.equal(soldier.takedamage, damage_t.DAMAGE_YES);
  soldier_duck_hold(soldier, runtime);
  assert.equal(soldier.monsterinfo.aiflags & AI_HOLD_FRAME, AI_HOLD_FRAME);
  runtime.time = 2;
  soldier_duck_hold(soldier, runtime);
  assert.equal(soldier.monsterinfo.aiflags & AI_HOLD_FRAME, 0);
  soldier_duck_up(soldier, runtime);
  assert.equal(soldier.maxs[2], 32);
  assert.equal(soldier.takedamage, damage_t.DAMAGE_AIM);

  runtime.skill = 1;
  withMathRandom([0.1, 0.1], () => soldier_dodge(soldier, attacker, 0.2, runtime));
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_attack3);
  assert.equal(soldier.monsterinfo.pausetime, runtime.time + 0.5);
  runtime.skill = 2;
  withMathRandom([0.1, 0.9], () => soldier_dodge(soldier, attacker, 0.2, runtime));
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_duck);
}

function verifyWeaponBranches(): void {
  const runtime = createHarnessRuntime();
  const soldier = createSoldier(runtime, 12, "monster_soldier_light");
  const enemy = createEnemy(runtime, 13, [256, 0, 24]);
  SP_monster_soldier_light(soldier, runtime);
  soldier.enemy = enemy;
  soldier.s.origin = [0, 0, 0];
  soldier.origin = [...soldier.s.origin];
  soldier.s.angles = [0, 0, 0];
  runtime.collision!.trace = makeBulletTrace(enemy);

  soldier.s.skinnum = 0;
  withMathRandom([0.5, 0.5], () => soldier_fire(soldier, 0, runtime));
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_SOLDIER_BLASTER_1);

  soldier.s.skinnum = 2;
  withMathRandom([0.5, 0.5], () => soldier_fire(soldier, 0, runtime));
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_SOLDIER_SHOTGUN_1);

  soldier.s.skinnum = 4;
  withMathRandom([0.5, 0.5, 0.5], () => soldier_fire(soldier, 0, runtime));
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_SOLDIER_MACHINEGUN_1);
  assert.equal(soldier.monsterinfo.aiflags & AI_HOLD_FRAME, AI_HOLD_FRAME);

  soldier_attack(soldier);
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_attack4);
  soldier.s.skinnum = 0;
  withMathRandom([0.25], () => soldier_attack(soldier));
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_attack1);
  withMathRandom([0.75], () => soldier_attack(soldier));
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_attack2);
}

function verifyMoveFrameCallbacks(): void {
  const runtime = createHarnessRuntime();
  const soldier = createSoldier(runtime, 14, "monster_soldier_light");
  const enemy = createEnemy(runtime, 15, [256, 0, 24]);
  SP_monster_soldier_light(soldier, runtime);
  soldier.enemy = enemy;
  soldier.s.origin = [0, 0, 0];
  soldier.origin = [...soldier.s.origin];
  soldier.s.angles = [0, 0, 0];
  runtime.collision!.trace = makeBulletTrace(enemy);

  soldier.monsterinfo.currentmove = soldier_move_attack1;
  soldier.s.frame = FRAME_attak101 + 1;
  withMathRandom([0.5, 0.5], () => M_MoveFrame(soldier, runtime));
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_SOLDIER_BLASTER_1);

  soldier.monsterinfo.currentmove = soldier_move_attack3;
  soldier.s.frame = FRAME_attak301 + 1;
  withMathRandom([0.5, 0.5], () => M_MoveFrame(soldier, runtime));
  assert.equal(soldier.monsterinfo.aiflags & AI_DUCKED, AI_DUCKED);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, 83);

  soldier.monsterinfo.currentmove = soldier_move_duck;
  soldier.s.frame = FRAME_duck01 - 1;
  M_MoveFrame(soldier, runtime);
  assert.equal(soldier.monsterinfo.aiflags & AI_DUCKED, AI_DUCKED);
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const soldier = createSoldier(runtime, 16, "monster_soldier");
  SP_monster_soldier(soldier, runtime);
  soldier.max_health = 30;
  soldier.health = 10;

  withMathRandom([0.1], () => soldier_pain(soldier, null, 0, 5, runtime));
  assert.equal(soldier.s.skinnum, 3);
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_pain1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "soldier/solpain1.wav");

  runtime.time = 4;
  withMathRandom([0.5], () => soldier_pain(soldier, null, 0, 5, runtime));
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_pain2);

  runtime.time = 8;
  withMathRandom([0.8], () => soldier_pain(soldier, null, 0, 5, runtime));
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_pain3);

  runtime.time = 12;
  soldier.velocity[2] = 120;
  soldier_pain(soldier, null, 0, 5, runtime);
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_pain4);

  runtime.skill = 3;
  runtime.time = 16;
  soldier.velocity[2] = 0;
  soldier.monsterinfo.currentmove = soldier_move_stand1;
  soldier_pain(soldier, null, 0, 5, runtime);
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_stand1);
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const soldier = createSoldier(runtime, 17, "monster_soldier");
  SP_monster_soldier(soldier, runtime);
  soldier.viewheight = 25;
  soldier.s.origin = [0, 0, 0];

  soldier_die(soldier, null, null, 20, runtime, [0, 0, 25]);
  assert.equal(soldier.deadflag, DEAD_DEAD);
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_death3);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "soldier/soldeth1.wav");

  const moves = [soldier_move_death1, soldier_move_death2, soldier_move_death4, soldier_move_death5, soldier_move_death6];
  for (let i = 0; i < moves.length; i += 1) {
    const dying = createSoldier(runtime, 18 + i, "monster_soldier_light");
    SP_monster_soldier_light(dying, runtime);
    withMathRandom([(i + 0.1) / 5], () => soldier_die(dying, null, null, 20, runtime));
    assert.equal(dying.monsterinfo.currentmove, moves[i], `death move ${i}`);
  }

  soldier_dead(soldier, runtime);
  assert.deepEqual(soldier.mins, [-16, -16, -24]);
  assert.deepEqual(soldier.maxs, [16, 16, -8]);
  assert.equal(soldier.movetype, MOVETYPE_TOSS);
  assert.equal(soldier.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);

  const gibbing = createSoldier(runtime, 24, "monster_soldier");
  SP_monster_soldier(gibbing, runtime);
  gibbing.health = -40;
  soldier_die(gibbing, null, null, 40, runtime);
  assert.equal(gibbing.deadflag, DEAD_DEAD);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2").length, 3);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/chest/tris.md2").length, 1);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/head2/tris.md2").length, 1);
}

function verifyDamageDispatchPreservesHeadshotPoint(): void {
  const runtime = createHarnessRuntime();
  const soldier = createSoldier(runtime, 26, "monster_soldier");
  const attacker = createEnemy(runtime, 27, [128, 0, 24]);
  SP_monster_soldier(soldier, runtime);
  soldier.think?.(soldier, runtime);
  soldier.viewheight = 25;
  soldier.s.origin = [0, 0, 0];
  soldier.origin = [...soldier.s.origin];
  soldier.takedamage = damage_t.DAMAGE_AIM;

  T_Damage(
    soldier,
    attacker,
    attacker,
    [1, 0, 0],
    [0, 0, 25],
    [0, 0, 1],
    40,
    0,
    0,
    0,
    runtime
  );

  assert.equal(soldier.deadflag, DEAD_DEAD);
  assert.equal(soldier.monsterinfo.currentmove, soldier_move_death3);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const soldier = createSoldier(runtime, 25, "monster_soldier");

  SP_monster_soldier(soldier, runtime);

  assert.equal(soldier.inuse, false);
}

function assertSpawnedSoldier(soldier: GameEntity, health: number, skinnum: number): void {
  assert.equal(soldier.movetype, MOVETYPE_STEP);
  assert.equal(soldier.solid, SOLID_BBOX);
  assert.deepEqual(soldier.mins, [-16, -16, -24]);
  assert.deepEqual(soldier.maxs, [16, 16, 32]);
  assert.equal(soldier.health, health);
  assert.equal(soldier.s.skinnum, skinnum);
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

function createSoldier(runtime: GameRuntime, index: number, classname: string): GameEntity {
  const soldier = createRuntimeEntity({ classname }, index);
  runtime.entities[index] = soldier;
  return soldier;
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
