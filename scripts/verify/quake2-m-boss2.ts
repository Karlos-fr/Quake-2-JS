/**
 * File: quake2-m-boss2.ts
 * Purpose: Verify the first gameplay port of `game/m_boss2.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_boss2 behavior.
 *
 * Dependencies:
 * - packages/game/src/m_boss2.ts
 */

import { strict as assert } from "node:assert";

import { type trace_t, type vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_STAND_GROUND,
  AS_MISSILE,
  DEAD_DEAD,
  FL_IMMUNE_LASER,
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
  type GameRuntime
} from "../../packages/game/src/index.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  Boss2MachineGun,
  Boss2Rocket,
  Boss2_CheckAttack,
  FRAME_attack10,
  FRAME_death50,
  MZ2_BOSS2_MACHINEGUN_L1,
  MZ2_BOSS2_MACHINEGUN_R1,
  MZ2_BOSS2_ROCKET_1,
  MZ2_BOSS2_ROCKET_2,
  MZ2_BOSS2_ROCKET_3,
  MZ2_BOSS2_ROCKET_4,
  SP_monster_boss2,
  boss2_attack,
  boss2_dead,
  boss2_die,
  boss2_move_attack_mg,
  boss2_move_attack_pre_mg,
  boss2_move_attack_rocket,
  boss2_move_death,
  boss2_move_pain_heavy,
  boss2_move_pain_light,
  boss2_move_run,
  boss2_move_stand,
  boss2_move_walk,
  boss2_pain,
  boss2_reattack_mg,
  boss2_run,
  boss2_search,
  boss2_stand,
  boss2_walk
} from "../../packages/game/src/m_boss2.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsFlying();
  verifySpawnRegistryCallsMonsterBoss2();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyStateTransitions();
  verifySoundsAndPainBranches();
  verifyWeaponCallbacks();
  verifyCheckAttack();
  verifyDeathBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-boss2: ok");
}

function verifySpawnRegistersAssetsAndStartsFlying(): void {
  const runtime = createHarnessRuntime();
  const boss = createBoss2(runtime, 1);

  SP_monster_boss2(boss, runtime);

  assert.equal(boss.movetype, MOVETYPE_STEP);
  assert.equal(boss.solid, SOLID_BBOX);
  assert.deepEqual(boss.mins, [-56, -56, 0]);
  assert.deepEqual(boss.maxs, [56, 56, 80]);
  assert.equal(boss.health, 2000);
  assert.equal(boss.gib_health, -200);
  assert.equal(boss.mass, 1000);
  assert.equal(boss.flags & FL_IMMUNE_LASER, FL_IMMUNE_LASER);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_stand);
  assert.equal(boss.monsterinfo.scale, 1);
  assert.equal(boss.pain, boss2_pain);
  assert.equal(boss.die, boss2_die);
  assert.equal(boss.monsterinfo.search, boss2_search);
  assert.equal(runtime.assets.modelPaths[boss.s.modelindex - 1], "models/monsters/boss2/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "bosshovr/bhvpain1.wav",
    "bosshovr/bhvpain2.wav",
    "bosshovr/bhvpain3.wav",
    "bosshovr/bhvdeth1.wav",
    "bosshovr/bhvunqv1.wav",
    "bosshovr/bhvengn1.wav"
  ]);
  assert.ok(boss.think, "flymonster_start should arm delayed startup think");

  boss.think!(boss, runtime);
  assert.equal(boss.yaw_speed, 10);
  assert.equal(boss.viewheight, 25);
  assert.equal(boss.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(boss.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(boss.max_health, 2000);
  assert.equal(boss.think?.name, "monster_think");
  assert.equal(boss.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterBoss2(): void {
  const runtime = createHarnessRuntime();
  const boss = createBoss2(runtime, 2);

  ED_CallSpawn(boss, runtime);

  assert.equal(boss.health, 2000);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_stand);
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_boss2"), SP_monster_boss2);
  assert.equal(findGameSaveFunction("boss2_pain"), boss2_pain);
  assert.equal(findGameSaveFunction("boss2_die"), boss2_die);
  assert.equal(findGameSaveFunction("Boss2Rocket"), Boss2Rocket);
  assert.equal(findGameSaveMove("boss2_move_stand"), boss2_move_stand);
  assert.equal(findGameSaveMove("boss2_move_attack_mg"), boss2_move_attack_mg);
  assert.equal(findGameSaveMove("boss2_move_death"), boss2_move_death);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const boss = createBoss2(runtime, 3);
  const nearEnemy = createEnemy(runtime, 4, [100, 0, 24]);
  const farEnemy = createEnemy(runtime, 5, [512, 0, 24]);

  SP_monster_boss2(boss, runtime);

  boss2_stand(boss);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_stand);
  boss2_walk(boss);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_walk);
  boss2_run(boss);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_run);
  boss.monsterinfo.aiflags |= AI_STAND_GROUND;
  boss2_run(boss);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_stand);
  boss.monsterinfo.aiflags &= ~AI_STAND_GROUND;

  boss.enemy = nearEnemy;
  boss2_attack(boss);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_pre_mg);
  boss.enemy = farEnemy;
  withMathRandom([0.5], () => boss2_attack(boss));
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_pre_mg);
  withMathRandom([0.9], () => boss2_attack(boss));
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_rocket);

  boss.enemy = farEnemy;
  boss.s.angles = [0, 0, 0];
  withMathRandom([0.5], () => boss2_reattack_mg(boss));
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_mg);
}

function verifySoundsAndPainBranches(): void {
  const runtime = createHarnessRuntime();
  const boss = createBoss2(runtime, 6);
  SP_monster_boss2(boss, runtime);

  withMathRandom([0.25], () => boss2_search(boss, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosshovr/bhvunqv1.wav");

  boss.max_health = 2000;
  boss.health = 900;
  boss2_pain(boss, null, 0, 5, runtime);
  assert.equal(boss.s.skinnum, 1);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_pain_light);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosshovr/bhvpain3.wav");

  runtime.time = 4;
  boss2_pain(boss, null, 0, 20, runtime);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_pain_light);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosshovr/bhvpain1.wav");

  runtime.time = 8;
  boss2_pain(boss, null, 0, 40, runtime);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_pain_heavy);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosshovr/bhvpain2.wav");
}

function verifyWeaponCallbacks(): void {
  const runtime = createHarnessRuntime();
  const boss = createBoss2(runtime, 7);
  const enemy = createEnemy(runtime, 8, [256, 0, 24]);
  SP_monster_boss2(boss, runtime);
  boss.enemy = enemy;
  boss.s.origin = [0, 0, 0];
  boss.origin = [...boss.s.origin];
  boss.s.angles = [0, 0, 0];
  boss.angles = [...boss.s.angles];

  Boss2MachineGun(boss, runtime);
  assert.deepEqual(drainMonsterMuzzleFlashEvents(runtime).map((event) => event.flashNumber), [
    MZ2_BOSS2_MACHINEGUN_L1,
    MZ2_BOSS2_MACHINEGUN_R1
  ]);

  withMathRandom([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], () => Boss2Rocket(boss, runtime));
  assert.deepEqual(drainMonsterMuzzleFlashEvents(runtime).map((event) => event.flashNumber), [
    MZ2_BOSS2_ROCKET_1,
    MZ2_BOSS2_ROCKET_2,
    MZ2_BOSS2_ROCKET_3,
    MZ2_BOSS2_ROCKET_4
  ]);
  assert.equal(runtime.entities.filter((entity) => entity.classname === "rocket").length, 4);

  boss.monsterinfo.currentmove = boss2_move_attack_mg;
  boss.s.frame = FRAME_attack10 - 1;
  M_MoveFrame(boss, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(0)?.flashNumber, MZ2_BOSS2_MACHINEGUN_L1);
}

function verifyCheckAttack(): void {
  const runtime = createHarnessRuntime();
  const boss = createBoss2(runtime, 9);
  const enemy = createEnemy(runtime, 10, [128, 0, 24]);
  SP_monster_boss2(boss, runtime);
  boss.enemy = enemy;

  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);
  withMathRandom([0.1, 0.25], () => {
    assert.equal(Boss2_CheckAttack(boss, runtime), true);
  });
  assert.equal(boss.monsterinfo.attack_state, AS_MISSILE);
  assert.equal(boss.monsterinfo.attack_finished, 0.5);
  assert.equal(boss.ideal_yaw, 0);

  runtime.time = 1;
  boss.monsterinfo.attack_finished = 4;
  assert.equal(Boss2_CheckAttack(boss, runtime), false);
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const boss = createBoss2(runtime, 11);
  SP_monster_boss2(boss, runtime);

  boss2_die(boss, null, null, 60, runtime);
  assert.equal(boss.deadflag, DEAD_DEAD);
  assert.equal(boss.takedamage, damage_t.DAMAGE_NO);
  assert.equal(boss.count, 0);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_death);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosshovr/bhvdeth1.wav");

  boss2_dead(boss, runtime);
  assert.deepEqual(boss.mins, [-56, -56, 0]);
  assert.deepEqual(boss.maxs, [56, 56, 80]);
  assert.equal(boss.movetype, MOVETYPE_TOSS);
  assert.equal(boss.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
  assert.equal(boss.nextthink, 0);

  boss.monsterinfo.currentmove = boss2_move_death;
  boss.s.frame = FRAME_death50 - 1;
  boss.count = 0;
  M_MoveFrame(boss, runtime);
  assert.equal(boss.think?.name, "BossExplode");
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const boss = createBoss2(runtime, 12);

  SP_monster_boss2(boss, runtime);

  assert.equal(boss.inuse, false);
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

function createBoss2(runtime: GameRuntime, index: number): GameEntity {
  const boss = createRuntimeEntity({ classname: "monster_boss2" }, index);
  runtime.entities[index] = boss;
  return boss;
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
    fraction: entity ? 0.5 : 1,
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
