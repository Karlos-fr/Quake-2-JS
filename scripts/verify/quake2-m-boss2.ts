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

import { EF_ROCKET, temp_event_t, type trace_t, type vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_STAND_GROUND,
  AS_MISSILE,
  DEAD_DEAD,
  FL_IMMUNE_LASER,
  FRAMETIME,
  M_MoveFrame,
  MOVETYPE_FLYMISSILE,
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
  Boss2MachineGun,
  Boss2Rocket,
  Boss2_CheckAttack,
  FRAME_attack1,
  FRAME_attack10,
  FRAME_attack15,
  FRAME_attack16,
  FRAME_attack19,
  FRAME_attack20,
  FRAME_attack40,
  FRAME_death50,
  FRAME_stand30,
  FRAME_stand50,
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
  boss2_frames_death,
  boss2_frames_attack_rocket,
  boss2_frames_attack_mg,
  boss2_frames_attack_post_mg,
  boss2_frames_attack_pre_mg,
  boss2_frames_stand,
  boss2_move_attack_post_mg,
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
  boss2_attack_mg,
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
  verifyStandingMoveTable();
  verifyMachinegunAttackMoveTables();
  verifyRocketAttackMoveTable();
  verifyDeathMoveTable();
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
  assert.equal(boss.monsterinfo.stand, boss2_stand);
  assert.equal(boss.monsterinfo.walk, boss2_walk);
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
  assert.equal(findGameSaveFunction("boss2_attack"), boss2_attack);
  assert.equal(findGameSaveFunction("boss2_attack_mg"), boss2_attack_mg);
  assert.equal(findGameSaveFunction("boss2_reattack_mg"), boss2_reattack_mg);
  assert.equal(findGameSaveFunction("Boss2MachineGun"), Boss2MachineGun);
  assert.equal(findGameSaveFunction("Boss2Rocket"), Boss2Rocket);
  assert.equal(findGameSaveMove("boss2_move_stand"), boss2_move_stand);
  assert.equal(findGameSaveMove("boss2_move_walk"), boss2_move_walk);
  assert.equal(findGameSaveMove("boss2_move_attack_pre_mg"), boss2_move_attack_pre_mg);
  assert.equal(findGameSaveMove("boss2_move_attack_mg"), boss2_move_attack_mg);
  assert.equal(findGameSaveMove("boss2_move_attack_post_mg"), boss2_move_attack_post_mg);
  assert.equal(findGameSaveMove("boss2_move_attack_rocket"), boss2_move_attack_rocket);
  assert.equal(findGameSaveMove("boss2_move_death"), boss2_move_death);
}

function verifyStandingMoveTable(): void {
  assert.equal(boss2_frames_stand.length, 21);
  assert.equal(boss2_move_stand.firstframe, FRAME_stand30);
  assert.equal(boss2_move_stand.lastframe, FRAME_stand50);
  assert.equal(boss2_move_stand.frame, boss2_frames_stand);
  assert.equal(boss2_move_stand.endfunc, undefined);

  for (const [index, frame] of boss2_frames_stand.entries()) {
    assert.equal(frame.aifunc?.name, "ai_stand", `boss2_frames_stand[${index}].aifunc`);
    assert.equal(frame.dist, 0, `boss2_frames_stand[${index}].dist`);
    assert.equal(frame.thinkfunc, undefined, `boss2_frames_stand[${index}].thinkfunc`);
  }
}

function verifyMachinegunAttackMoveTables(): void {
  assert.equal(boss2_frames_attack_pre_mg.length, 9);
  assert.equal(boss2_move_attack_pre_mg.firstframe, FRAME_attack1);
  assert.equal(boss2_move_attack_pre_mg.lastframe, FRAME_attack1 + 8);
  assert.equal(boss2_move_attack_pre_mg.frame, boss2_frames_attack_pre_mg);
  assert.equal(boss2_move_attack_pre_mg.endfunc, undefined);

  for (const [index, frame] of boss2_frames_attack_pre_mg.entries()) {
    assert.equal(frame.aifunc?.name, "ai_charge", `boss2_frames_attack_pre_mg[${index}].aifunc`);
    assert.equal(frame.dist, 1, `boss2_frames_attack_pre_mg[${index}].dist`);
    assert.equal(
      frame.thinkfunc?.name,
      index === boss2_frames_attack_pre_mg.length - 1 ? "boss2_attack_mg" : undefined,
      `boss2_frames_attack_pre_mg[${index}].thinkfunc`
    );
  }

  assert.equal(boss2_frames_attack_mg.length, 6);
  assert.equal(boss2_move_attack_mg.firstframe, FRAME_attack10);
  assert.equal(boss2_move_attack_mg.lastframe, FRAME_attack15);
  assert.equal(boss2_move_attack_mg.frame, boss2_frames_attack_mg);
  assert.equal(boss2_move_attack_mg.endfunc, undefined);

  for (const [index, frame] of boss2_frames_attack_mg.entries()) {
    assert.equal(frame.aifunc?.name, "ai_charge", `boss2_frames_attack_mg[${index}].aifunc`);
    assert.equal(frame.dist, 1, `boss2_frames_attack_mg[${index}].dist`);
    assert.equal(
      frame.thinkfunc?.name,
      index === boss2_frames_attack_mg.length - 1 ? "boss2_reattack_mg" : "Boss2MachineGun",
      `boss2_frames_attack_mg[${index}].thinkfunc`
    );
  }

  assert.equal(boss2_frames_attack_post_mg.length, 4);
  assert.equal(boss2_move_attack_post_mg.firstframe, FRAME_attack16);
  assert.equal(boss2_move_attack_post_mg.lastframe, FRAME_attack19);
  assert.equal(boss2_move_attack_post_mg.frame, boss2_frames_attack_post_mg);
  assert.equal(boss2_move_attack_post_mg.endfunc, boss2_run);

  for (const [index, frame] of boss2_frames_attack_post_mg.entries()) {
    assert.equal(frame.aifunc?.name, "ai_charge", `boss2_frames_attack_post_mg[${index}].aifunc`);
    assert.equal(frame.dist, 1, `boss2_frames_attack_post_mg[${index}].dist`);
    assert.equal(frame.thinkfunc, undefined, `boss2_frames_attack_post_mg[${index}].thinkfunc`);
  }
}

function verifyRocketAttackMoveTable(): void {
  assert.equal(boss2_frames_attack_rocket.length, 21);
  assert.equal(boss2_move_attack_rocket.firstframe, FRAME_attack20);
  assert.equal(boss2_move_attack_rocket.lastframe, FRAME_attack40);
  assert.equal(boss2_move_attack_rocket.frame, boss2_frames_attack_rocket);
  assert.equal(boss2_move_attack_rocket.endfunc, boss2_run);

  for (const [index, frame] of boss2_frames_attack_rocket.entries()) {
    assert.equal(
      frame.aifunc?.name,
      index === 12 ? "ai_move" : "ai_charge",
      `boss2_frames_attack_rocket[${index}].aifunc`
    );
    assert.equal(frame.dist, index === 12 ? -20 : 1, `boss2_frames_attack_rocket[${index}].dist`);
    assert.equal(
      frame.thinkfunc?.name,
      index === 12 ? "Boss2Rocket" : undefined,
      `boss2_frames_attack_rocket[${index}].thinkfunc`
    );
  }
}

function verifyDeathMoveTable(): void {
  assert.equal(boss2_frames_death.length, 49);
  assert.equal(boss2_move_death.firstframe, FRAME_death50 - 48);
  assert.equal(boss2_move_death.lastframe, FRAME_death50);
  assert.equal(boss2_move_death.frame, boss2_frames_death);
  assert.equal(boss2_move_death.endfunc, boss2_dead);

  for (const [index, frame] of boss2_frames_death.entries()) {
    assert.equal(frame.aifunc?.name, "ai_move", `boss2_frames_death[${index}].aifunc`);
    assert.equal(frame.dist, 0, `boss2_frames_death[${index}].dist`);
    assert.equal(
      frame.thinkfunc?.name,
      index === boss2_frames_death.length - 1 ? "BossExplode" : undefined,
      `boss2_frames_death[${index}].thinkfunc`
    );
  }
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
  assert.equal(boss.monsterinfo.walk, boss2_walk);
  assert.equal(boss.monsterinfo.attack, boss2_attack);
  boss.monsterinfo.walk?.(boss, runtime);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_walk);
  boss.monsterinfo.stand?.(boss, runtime);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_stand);

  boss.s.frame = FRAME_stand50;
  M_MoveFrame(boss, runtime);
  assert.equal(boss.s.frame, FRAME_stand30);

  boss2_run(boss);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_run);
  boss.monsterinfo.aiflags |= AI_STAND_GROUND;
  boss2_run(boss);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_stand);
  boss.monsterinfo.aiflags &= ~AI_STAND_GROUND;
  assert.equal(boss.monsterinfo.run, boss2_run);
  boss.monsterinfo.run?.(boss, runtime);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_run);
  boss.monsterinfo.aiflags |= AI_STAND_GROUND;
  boss.monsterinfo.run?.(boss, runtime);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_stand);
  boss.monsterinfo.aiflags &= ~AI_STAND_GROUND;

  boss.enemy = nearEnemy;
  boss2_attack(boss);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_pre_mg);
  boss.enemy = farEnemy;
  withMathRandom([0.5], () => boss2_attack(boss));
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_pre_mg);
  withMathRandom([0.6], () => boss.monsterinfo.attack?.(boss, runtime));
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_pre_mg);
  withMathRandom([0.9], () => boss2_attack(boss));
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_rocket);

  boss.monsterinfo.currentmove = boss2_move_attack_pre_mg;
  boss.s.frame = FRAME_attack1 + 7;
  M_MoveFrame(boss, runtime);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_mg);

  boss.enemy = farEnemy;
  boss.s.angles = [0, 0, 0];
  withMathRandom([0.5], () => boss2_reattack_mg(boss));
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_mg);
  withMathRandom([0.7], () => boss2_reattack_mg(boss));
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_mg);
  withMathRandom([0.71], () => boss2_reattack_mg(boss));
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_post_mg);

  boss.enemy = createEnemy(runtime, 13, [-512, 0, 24]);
  withMathRandom([0.1], () => boss2_reattack_mg(boss));
  assert.equal(boss.monsterinfo.currentmove, boss2_move_attack_post_mg);

  boss.monsterinfo.currentmove = boss2_move_attack_post_mg;
  boss.s.frame = FRAME_attack19;
  boss.monsterinfo.aiflags = 0;
  M_MoveFrame(boss, runtime);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_run);

  boss.enemy = farEnemy;
  boss.monsterinfo.currentmove = boss2_move_attack_rocket;
  boss.s.frame = FRAME_attack20 + 11;
  M_MoveFrame(boss, runtime);
  assert.deepEqual(drainMonsterMuzzleFlashEvents(runtime).map((event) => event.flashNumber), [
    MZ2_BOSS2_ROCKET_1,
    MZ2_BOSS2_ROCKET_2,
    MZ2_BOSS2_ROCKET_3,
    MZ2_BOSS2_ROCKET_4
  ]);

  boss.s.frame = FRAME_attack40;
  M_MoveFrame(boss, runtime);
  assert.equal(boss.monsterinfo.currentmove, boss2_move_run);
}

function verifySoundsAndPainBranches(): void {
  const runtime = createHarnessRuntime();
  const boss = createBoss2(runtime, 6);
  SP_monster_boss2(boss, runtime);

  withMathRandom([0.25], () => boss2_search(boss, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "bosshovr/bhvunqv1.wav");
  withMathRandom([0.5], () => boss2_search(boss, runtime));
  assert.equal(drainGameSoundEvents(runtime).length, 0);

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
  const rockets = runtime.entities.filter((entity) => entity.classname === "rocket");
  assert.equal(rockets.length, 4);
  for (const [index, rocket] of rockets.entries()) {
    assert.equal(rocket.owner, boss, `rocket ${index} owner`);
    assert.equal(rocket.movetype, MOVETYPE_FLYMISSILE, `rocket ${index} movetype`);
    assert.equal(rocket.s.effects & EF_ROCKET, EF_ROCKET, `rocket ${index} EF_ROCKET`);
    assert.equal(rocket.dmg, 50, `rocket ${index} direct damage`);
    assert.equal(rocket.radius_dmg, 50, `rocket ${index} radius damage`);
    assert.equal(rocket.dmg_radius, 70, `rocket ${index} damage radius`);
    assert.equal(rocket.s.sound, runtime.assets.soundPaths.indexOf("weapons/rockfly.wav") + 1, `rocket ${index} flight sound`);
    assert.equal(runtime.assets.modelPaths[rocket.s.modelindex - 1], "models/objects/rocket/tris.md2", `rocket ${index} model`);
    assert.ok(Math.abs(vectorLength(rocket.velocity) - 500) < 0.000001, `rocket ${index} velocity magnitude`);
    assert.ok(rocket.nextthink > runtime.time, `rocket ${index} lifetime think`);
  }

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
  assert.equal(boss.linked, true);
  assert.deepEqual(boss.absmin, [-56, -56, 0]);
  assert.deepEqual(boss.absmax, [56, 56, 80]);
  assert.equal(runtime.linkedDynamicBoxEntities.includes(boss), true);

  boss.monsterinfo.currentmove = boss2_move_death;
  boss.s.frame = FRAME_death50 - 1;
  boss.count = 0;
  M_MoveFrame(boss, runtime);
  assert.equal(boss.think?.name, "BossExplode");
  const explosion = drainGameTempEntityEvents(runtime).at(-1);
  assert.equal(explosion?.type, temp_event_t.TE_EXPLOSION1);
  assert.equal(explosion?.payload.source, "BossExplode");

  boss.think = undefined;
  boss.nextthink = runtime.time + FRAMETIME;
  boss.svflags &= ~SVF_DEADMONSTER;
  boss.s.frame = FRAME_death50;
  M_MoveFrame(boss, runtime);
  assert.equal(boss.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
  assert.equal(boss.nextthink, 0);
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

function vectorLength(value: vec3_t): number {
  return Math.hypot(value[0], value[1], value[2]);
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
