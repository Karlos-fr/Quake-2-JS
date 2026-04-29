/**
 * File: quake2-m-tank.ts
 * Purpose: Verify the gameplay port of `game/m_tank.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_tank behavior.
 *
 * Dependencies:
 * - packages/game/src/m_tank.ts
 */

import { strict as assert } from "node:assert";

import { type trace_t, type vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_BRUTAL,
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
  type GameRuntime
} from "../../packages/game/src/index.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  FRAME_attak110,
  FRAME_attak324,
  MZ2_TANK_BLASTER_1,
  MZ2_TANK_MACHINEGUN_1,
  MZ2_TANK_ROCKET_1,
  SP_monster_tank,
  TankBlaster,
  TankMachineGun,
  TankRocket,
  tank_attack,
  tank_dead,
  tank_die,
  tank_idle,
  tank_move_attack_blast,
  tank_move_attack_chain,
  tank_move_attack_fire_rocket,
  tank_move_attack_pre_rocket,
  tank_move_attack_strike,
  tank_move_death,
  tank_move_pain1,
  tank_move_pain2,
  tank_move_pain3,
  tank_move_run,
  tank_move_stand,
  tank_move_start_run,
  tank_move_walk,
  tank_pain,
  tank_reattack_blaster,
  tank_refire_rocket,
  tank_run,
  tank_sight,
  tank_stand,
  tank_walk
} from "../../packages/game/src/m_tank.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifyCommanderSpawn();
  verifySpawnRegistryAndSaveRegistry();
  verifyStateTransitions();
  verifyAttackBranches();
  verifyWeaponCallbacks();
  verifyPainBranches();
  verifyDeathBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-tank: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const tank = createTank(runtime, 1, "monster_tank");

  SP_monster_tank(tank, runtime);

  assert.equal(tank.movetype, MOVETYPE_STEP);
  assert.equal(tank.solid, SOLID_BBOX);
  assert.deepEqual(tank.mins, [-32, -32, -16]);
  assert.deepEqual(tank.maxs, [32, 32, 72]);
  assert.equal(tank.health, 750);
  assert.equal(tank.gib_health, -200);
  assert.equal(tank.mass, 500);
  assert.equal(tank.monsterinfo.currentmove, tank_move_stand);
  assert.equal(runtime.assets.modelPaths[tank.s.modelindex - 1], "models/monsters/tank/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "tank/tnkpain2.wav",
    "tank/tnkdeth2.wav",
    "tank/tnkidle1.wav",
    "tank/death.wav",
    "tank/step.wav",
    "tank/tnkatck4.wav",
    "tank/tnkatck5.wav",
    "tank/sight1.wav",
    "tank/tnkatck1.wav",
    "tank/tnkatk2a.wav",
    "tank/tnkatk2b.wav",
    "tank/tnkatk2c.wav",
    "tank/tnkatk2d.wav",
    "tank/tnkatk2e.wav",
    "tank/tnkatck3.wav"
  ]);

  tank.think!(tank, runtime);
  assert.equal(tank.yaw_speed, 20);
  assert.equal(tank.viewheight, 25);
  assert.equal(tank.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(tank.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(tank.max_health, 750);
  assert.equal(tank.nextthink, runtime.time + FRAMETIME);
}

function verifyCommanderSpawn(): void {
  const runtime = createHarnessRuntime();
  const tank = createTank(runtime, 2, "monster_tank_commander");

  SP_monster_tank(tank, runtime);

  assert.equal(tank.health, 1000);
  assert.equal(tank.gib_health, -225);
  assert.equal(tank.s.skinnum, 2);
}

function verifySpawnRegistryAndSaveRegistry(): void {
  const runtime = createHarnessRuntime();
  const tank = createTank(runtime, 3, "monster_tank");

  ED_CallSpawn(tank, runtime);

  assert.equal(tank.health, 750);
  assert.equal(findGameSaveFunction("SP_monster_tank"), SP_monster_tank);
  assert.equal(findGameSaveFunction("tank_pain"), tank_pain);
  assert.equal(findGameSaveFunction("tank_die"), tank_die);
  assert.equal(findGameSaveMove("tank_move_stand"), tank_move_stand);
  assert.equal(findGameSaveMove("tank_move_attack_fire_rocket"), tank_move_attack_fire_rocket);
  assert.equal(findGameSaveMove("tank_move_death"), tank_move_death);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const tank = createTank(runtime, 4, "monster_tank");
  const playerEnemy = createEnemy(runtime, 5, [128, 0, 24]);
  playerEnemy.client = {} as never;

  tank_stand(tank);
  assert.equal(tank.monsterinfo.currentmove, tank_move_stand);
  tank_walk(tank);
  assert.equal(tank.monsterinfo.currentmove, tank_move_walk);
  tank.monsterinfo.currentmove = tank_move_stand;
  tank_run(tank);
  assert.equal(tank.monsterinfo.currentmove, tank_move_start_run);
  tank.monsterinfo.currentmove = tank_move_start_run;
  tank.enemy = playerEnemy;
  tank_run(tank);
  assert.equal(tank.monsterinfo.currentmove, tank_move_run);
  assert.equal(tank.monsterinfo.aiflags & AI_BRUTAL, AI_BRUTAL);
  tank.monsterinfo.aiflags |= AI_STAND_GROUND;
  tank_run(tank);
  assert.equal(tank.monsterinfo.currentmove, tank_move_stand);
}

function verifyAttackBranches(): void {
  const runtime = createHarnessRuntime();
  const tank = createTank(runtime, 6, "monster_tank");
  const enemy = createEnemy(runtime, 7, [100, 0, 24]);
  tank.enemy = enemy;

  withMathRandom([0.2], () => tank_attack(tank, runtime));
  assert.equal(tank.monsterinfo.currentmove, tank_move_attack_chain);
  withMathRandom([0.9], () => tank_attack(tank, runtime));
  assert.equal(tank.monsterinfo.currentmove, tank_move_attack_blast);

  enemy.s.origin = [512, 0, 24];
  withMathRandom([0.5], () => tank_attack(tank, runtime));
  assert.equal(tank.monsterinfo.currentmove, tank_move_attack_pre_rocket);
  assert.equal(tank.pain_debounce_time, runtime.time + 5);

  enemy.health = -1;
  tank_attack(tank, runtime);
  assert.equal(tank.monsterinfo.currentmove, tank_move_attack_strike);

  enemy.health = 100;
  runtime.skill = 2;
  withMathRandom([0.2], () => tank_reattack_blaster(tank, runtime));
  assert.equal(tank.monsterinfo.currentmove?.firstframe, 65);
  withMathRandom([0.2], () => tank_refire_rocket(tank, runtime));
  assert.equal(tank.monsterinfo.currentmove, tank_move_attack_fire_rocket);
}

function verifyWeaponCallbacks(): void {
  const runtime = createHarnessRuntime();
  const tank = createTank(runtime, 8, "monster_tank");
  const enemy = createEnemy(runtime, 9, [256, 0, 24]);
  tank.enemy = enemy;
  tank.s.origin = [0, 0, 0];
  tank.origin = [...tank.s.origin];
  tank.s.angles = [0, 0, 0];
  runtime.collision!.trace = makeBulletTrace(enemy);

  tank.s.frame = FRAME_attak110;
  TankBlaster(tank, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_TANK_BLASTER_1);

  tank.s.frame = FRAME_attak324;
  TankRocket(tank, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_TANK_ROCKET_1);

  tank.s.frame = 173;
  TankMachineGun(tank, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_TANK_MACHINEGUN_1);

  tank.monsterinfo.currentmove = tank_move_attack_blast;
  tank.s.frame = FRAME_attak110 - 1;
  M_MoveFrame(tank, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_TANK_BLASTER_1);
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const tank = createTank(runtime, 10, "monster_tank");
  SP_monster_tank(tank, runtime);
  tank.max_health = 750;
  tank.health = 300;

  tank_pain(tank, null, 0, 10, runtime);
  assert.equal(tank.s.skinnum, 1);
  assert.equal(tank.monsterinfo.currentmove, tank_move_stand);

  withMathRandom([0.1], () => tank_pain(tank, null, 0, 30, runtime));
  assert.equal(tank.monsterinfo.currentmove, tank_move_pain1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "tank/tnkpain2.wav");

  runtime.time = 4;
  tank_pain(tank, null, 0, 60, runtime);
  assert.equal(tank.monsterinfo.currentmove, tank_move_pain2);

  runtime.time = 8;
  tank_pain(tank, null, 0, 80, runtime);
  assert.equal(tank.monsterinfo.currentmove, tank_move_pain3);

  runtime.skill = 3;
  runtime.time = 12;
  tank.monsterinfo.currentmove = tank_move_stand;
  tank_pain(tank, null, 0, 80, runtime);
  assert.equal(tank.monsterinfo.currentmove, tank_move_stand);
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const tank = createTank(runtime, 11, "monster_tank");
  SP_monster_tank(tank, runtime);

  tank_die(tank, null, null, 60, runtime);
  assert.equal(tank.deadflag, DEAD_DEAD);
  assert.equal(tank.takedamage, damage_t.DAMAGE_YES);
  assert.equal(tank.monsterinfo.currentmove, tank_move_death);

  tank_dead(tank, runtime);
  assert.deepEqual(tank.mins, [-16, -16, -16]);
  assert.deepEqual(tank.maxs, [16, 16, 0]);
  assert.equal(tank.movetype, MOVETYPE_TOSS);
  assert.equal(tank.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);

  const gibbing = createTank(runtime, 12, "monster_tank");
  SP_monster_tank(gibbing, runtime);
  gibbing.health = -500;
  tank_die(gibbing, null, null, 80, runtime);
  assert.equal(gibbing.deadflag, DEAD_DEAD);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_metal/tris.md2").length, 4);

  tank_idle(tank, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "tank/tnkidle1.wav");
  tank_sight(tank, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "tank/sight1.wav");
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const tank = createTank(runtime, 13, "monster_tank");

  SP_monster_tank(tank, runtime);

  assert.equal(tank.inuse, false);
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

function createTank(runtime: GameRuntime, index: number, classname: string): GameEntity {
  const tank = createRuntimeEntity({ classname }, index);
  runtime.entities[index] = tank;
  return tank;
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
