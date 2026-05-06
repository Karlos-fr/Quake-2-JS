/**
 * File: quake2-m-boss31.ts
 * Purpose: Verify the gameplay port of `game/m_boss31.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_jorg behavior.
 *
 * Dependencies:
 * - packages/game/src/m_boss31.ts
 * - packages/game/src/m_boss32.ts
 */

import { strict as assert } from "node:assert";

import { type trace_t, type vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_STAND_GROUND,
  AS_MISSILE,
  DEAD_DEAD,
  FRAMETIME,
  M_MoveFrame,
  MOVETYPE_STEP,
  SOLID_BBOX,
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
  FRAME_attak109,
  FRAME_death49,
  Jorg_CheckAttack,
  MZ2_JORG_BFG_1,
  MZ2_JORG_MACHINEGUN_L1,
  MZ2_JORG_MACHINEGUN_R1,
  SP_monster_jorg,
  jorgBFG,
  jorg_attack,
  jorg_die,
  jorg_firebullet,
  jorg_idle,
  jorg_move_attack1,
  jorg_move_attack2,
  jorg_move_death,
  jorg_move_end_attack1,
  jorg_move_pain1,
  jorg_move_pain2,
  jorg_move_pain3,
  jorg_move_run,
  jorg_move_stand,
  jorg_move_start_attack1,
  jorg_move_walk,
  jorg_pain,
  jorg_reattack1,
  jorg_run,
  jorg_search,
  jorg_stand,
  jorg_walk
} from "../../packages/game/src/m_boss31.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifySpawnRegistryCallsMonsterJorg();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyStateTransitions();
  verifySoundsAndPainBranches();
  verifyWeaponCallbacks();
  verifyCheckAttack();
  verifyDeathAndMakronHandoff();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-boss31: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const jorg = createJorg(runtime, 1);

  SP_monster_jorg(jorg, runtime);

  assert.equal(jorg.movetype, MOVETYPE_STEP);
  assert.equal(jorg.solid, SOLID_BBOX);
  assert.deepEqual(jorg.mins, [-80, -80, 0]);
  assert.deepEqual(jorg.maxs, [80, 80, 140]);
  assert.equal(jorg.health, 3000);
  assert.equal(jorg.gib_health, -2000);
  assert.equal(jorg.mass, 1000);
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_stand);
  assert.equal(jorg.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[jorg.s.modelindex - 1], "models/monsters/boss3/rider/tris.md2");
  assert.equal(runtime.assets.modelPaths[jorg.s.modelindex2 - 1], "models/monsters/boss3/jorg/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths.slice(0, 14), [
    "boss3/bs3pain1.wav",
    "boss3/bs3pain2.wav",
    "boss3/bs3pain3.wav",
    "boss3/bs3deth1.wav",
    "boss3/bs3atck1.wav",
    "boss3/bs3atck2.wav",
    "boss3/bs3srch1.wav",
    "boss3/bs3srch2.wav",
    "boss3/bs3srch3.wav",
    "boss3/bs3idle1.wav",
    "boss3/step1.wav",
    "boss3/step2.wav",
    "boss3/xfire.wav",
    "boss3/d_hit.wav"
  ]);
  assert.ok(jorg.think, "walkmonster_start should arm delayed startup think");

  jorg.think!(jorg, runtime);
  assert.equal(jorg.yaw_speed, 20);
  assert.equal(jorg.viewheight, 25);
  assert.equal(jorg.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(jorg.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(jorg.max_health, 3000);
  assert.equal(jorg.think?.name, "monster_think");
  assert.equal(jorg.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterJorg(): void {
  const runtime = createHarnessRuntime();
  const jorg = createJorg(runtime, 2);

  ED_CallSpawn(jorg, runtime);

  assert.equal(jorg.health, 3000);
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_stand);
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_jorg"), SP_monster_jorg);
  assert.equal(findGameSaveFunction("jorg_pain"), jorg_pain);
  assert.equal(findGameSaveFunction("jorg_die"), jorg_die);
  assert.equal(findGameSaveFunction("jorgBFG"), jorgBFG);
  assert.equal(findGameSaveMove("jorg_move_stand"), jorg_move_stand);
  assert.equal(findGameSaveMove("jorg_move_attack2"), jorg_move_attack2);
  assert.equal(findGameSaveMove("jorg_move_death"), jorg_move_death);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const jorg = createJorg(runtime, 3);
  const enemy = createEnemy(runtime, 4, [256, 0, 24]);
  SP_monster_jorg(jorg, runtime);

  jorg_stand(jorg);
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_stand);
  jorg_walk(jorg);
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_walk);
  jorg_run(jorg);
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_run);
  jorg.monsterinfo.aiflags |= AI_STAND_GROUND;
  jorg_run(jorg);
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_stand);
  jorg.monsterinfo.aiflags &= ~AI_STAND_GROUND;

  jorg.enemy = enemy;
  withMathRandom([0.2], () => jorg_attack(jorg, runtime));
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_start_attack1);
  assert.equal(runtime.soundEvents.at(-1)?.soundPath, "boss3/bs3atck1.wav");
  assert.equal(runtime.assets.soundPaths[jorg.s.sound - 1], "boss3/w_loop.wav");

  withMathRandom([0.9], () => jorg_attack(jorg, runtime));
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_attack2);
  assert.equal(runtime.soundEvents.at(-1)?.soundPath, "boss3/bs3atck2.wav");

  runtime.collision!.trace = makeOpenTrace();
  withMathRandom([0.1], () => jorg_reattack1(jorg, runtime));
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_attack1);
  withMathRandom([0.95], () => jorg_reattack1(jorg, runtime));
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_end_attack1);
  assert.equal(jorg.s.sound, 0);
}

function verifySoundsAndPainBranches(): void {
  const runtime = createHarnessRuntime();
  const jorg = createJorg(runtime, 5);
  SP_monster_jorg(jorg, runtime);

  jorg_idle(jorg, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "boss3/bs3idle1.wav");

  withMathRandom([0.2], () => jorg_search(jorg, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "boss3/bs3srch1.wav");
  withMathRandom([0.5], () => jorg_search(jorg, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "boss3/bs3srch2.wav");
  withMathRandom([0.8], () => jorg_search(jorg, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "boss3/bs3srch3.wav");

  jorg.max_health = 3000;
  jorg.health = 1400;
  withMathRandom([0.9], () => jorg_pain(jorg, null, 0, 40, runtime));
  assert.equal(jorg.s.skinnum, 1);
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_pain1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "boss3/bs3pain1.wav");

  runtime.time = 4;
  jorg_pain(jorg, null, 0, 80, runtime);
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_pain2);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "boss3/bs3pain2.wav");

  runtime.time = 8;
  withMathRandom([0.1], () => jorg_pain(jorg, null, 0, 150, runtime));
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_pain3);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "boss3/bs3pain3.wav");

  runtime.skill = 3;
  runtime.time = 12;
  jorg.monsterinfo.currentmove = jorg_move_stand;
  jorg_pain(jorg, null, 0, 80, runtime);
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_stand, "nightmare pain should not start a pain animation");
}

function verifyWeaponCallbacks(): void {
  const runtime = createHarnessRuntime();
  const jorg = createJorg(runtime, 6);
  const enemy = createEnemy(runtime, 7, [256, 0, 24]);
  SP_monster_jorg(jorg, runtime);
  jorg.enemy = enemy;
  jorg.s.origin = [0, 0, 0];
  jorg.origin = [...jorg.s.origin];
  jorg.s.angles = [0, 0, 0];
  jorg.angles = [...jorg.s.angles];

  jorg_firebullet(jorg, runtime);
  assert.deepEqual(drainMonsterMuzzleFlashEvents(runtime).map((event) => event.flashNumber), [
    MZ2_JORG_MACHINEGUN_L1,
    MZ2_JORG_MACHINEGUN_R1
  ]);

  jorgBFG(jorg, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_JORG_BFG_1);
  assert.ok(runtime.entities.some((entity) => entity.classname === "bfg blast"));
  assert.equal(runtime.soundEvents.at(-1)?.soundPath, "boss3/bs3atck2.wav");

  jorg.monsterinfo.currentmove = jorg_move_attack1;
  jorg.s.frame = FRAME_attak109 - 1;
  M_MoveFrame(jorg, runtime);
  assert.deepEqual(drainMonsterMuzzleFlashEvents(runtime).map((event) => event.flashNumber), [
    MZ2_JORG_MACHINEGUN_L1,
    MZ2_JORG_MACHINEGUN_R1
  ]);
}

function verifyCheckAttack(): void {
  const runtime = createHarnessRuntime();
  const jorg = createJorg(runtime, 8);
  const enemy = createEnemy(runtime, 9, [128, 0, 24]);
  SP_monster_jorg(jorg, runtime);
  jorg.enemy = enemy;

  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);
  withMathRandom([0.1, 0.25], () => {
    assert.equal(Jorg_CheckAttack(jorg, runtime), true);
  });
  assert.equal(jorg.monsterinfo.attack_state, AS_MISSILE);
  assert.equal(jorg.monsterinfo.attack_finished, 2 * quakeRandomFromMath(0.25));
  assert.equal(jorg.ideal_yaw, 0);

  runtime.time = 1;
  jorg.monsterinfo.attack_finished = 4;
  assert.equal(Jorg_CheckAttack(jorg, runtime), false);
}

function verifyDeathAndMakronHandoff(): void {
  const runtime = createHarnessRuntime();
  const jorg = createJorg(runtime, 10);
  SP_monster_jorg(jorg, runtime);

  jorg_die(jorg, null, null, 80, runtime);
  assert.equal(jorg.deadflag, DEAD_DEAD);
  assert.equal(jorg.takedamage, damage_t.DAMAGE_NO);
  assert.equal(jorg.s.sound, 0);
  assert.equal(jorg.count, 0);
  assert.equal(jorg.monsterinfo.currentmove, jorg_move_death);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "boss3/bs3deth1.wav");

  jorg.target = "after_jorg";
  jorg.s.origin = [64, 32, 12];
  jorg.monsterinfo.currentmove = jorg_move_death;
  jorg.s.frame = FRAME_death49 - 1;
  M_MoveFrame(jorg, runtime);
  const makronSpawn = runtime.entities.find((entity) => entity?.think?.name === "MakronSpawn");
  assert.ok(makronSpawn, "MakronToss should spawn a delayed Makron entity");
  assert.equal(makronSpawn.target, "after_jorg");
  assert.deepEqual(makronSpawn.s.origin, [64, 32, 12]);

  M_MoveFrame(jorg, runtime);
  assert.equal(drainGameTempEntityEvents(runtime).at(-1)?.payload.source, "BossExplode");
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const jorg = createJorg(runtime, 11);

  SP_monster_jorg(jorg, runtime);

  assert.equal(jorg.inuse, false);
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

function createJorg(runtime: GameRuntime, index: number): GameEntity {
  const jorg = createRuntimeEntity({ classname: "monster_jorg" }, index);
  runtime.entities[index] = jorg;
  return jorg;
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

function makeOpenTrace(): NonNullable<GameRuntime["collision"]>["trace"] {
  return (_start, _mins, _maxs, end) => makeTrace(null, end);
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

function quakeRandomFromMath(value: number): number {
  return Math.floor(value * 0x8000) / 0x7fff;
}
