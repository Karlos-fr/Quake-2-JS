/**
 * File: quake2-m-chick.ts
 * Purpose: Verify the gameplay port of `game/m_chick.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_chick behavior.
 *
 * Dependencies:
 * - packages/game/src/m_chick.ts
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
  ChickMoan,
  ChickReload,
  ChickRocket,
  ChickSlash,
  Chick_PreAttack1,
  FRAME_attak101,
  FRAME_attak113,
  FRAME_attak114,
  FRAME_attak127,
  FRAME_attak128,
  FRAME_attak132,
  FRAME_attak201,
  FRAME_attak203,
  FRAME_attak204,
  FRAME_attak212,
  FRAME_attak213,
  FRAME_attak216,
  FRAME_death101,
  FRAME_death112,
  FRAME_death201,
  FRAME_death223,
  FRAME_duck01,
  FRAME_duck07,
  FRAME_pain101,
  FRAME_pain105,
  FRAME_pain201,
  FRAME_pain205,
  FRAME_pain301,
  FRAME_pain321,
  FRAME_stand101,
  FRAME_stand130,
  FRAME_stand201,
  FRAME_stand230,
  FRAME_walk01,
  FRAME_walk10,
  FRAME_walk11,
  FRAME_walk20,
  MZ2_CHICK_ROCKET_1,
  SP_monster_chick,
  chick_attack,
  chick_attack1,
  chick_dead,
  chick_die,
  chick_dodge,
  chick_duck_down,
  chick_duck_hold,
  chick_duck_up,
  chick_fidget,
  chick_melee,
  chick_move_attack1,
  chick_move_death1,
  chick_move_death2,
  chick_move_duck,
  chick_move_end_attack1,
  chick_move_end_slash,
  chick_move_fidget,
  chick_move_pain1,
  chick_move_pain2,
  chick_move_pain3,
  chick_move_run,
  chick_move_slash,
  chick_move_stand,
  chick_move_start_attack1,
  chick_move_start_run,
  chick_move_start_slash,
  chick_move_walk,
  chick_pain,
  chick_rerocket,
  chick_reslash,
  chick_run,
  chick_sight,
  chick_slash,
  chick_stand,
  chick_walk
} from "../../packages/game/src/m_chick.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifyStartupThinkCompletesWalkingMonsterSetup();
  verifySpawnRegistryCallsMonsterChick();
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

  console.log("quake2-m-chick: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const chick = createChick(runtime, 1);

  SP_monster_chick(chick, runtime);

  assert.equal(chick.movetype, MOVETYPE_STEP);
  assert.equal(chick.solid, SOLID_BBOX);
  assert.deepEqual(chick.mins, [-16, -16, 0]);
  assert.deepEqual(chick.maxs, [16, 16, 56]);
  assert.equal(chick.health, 175);
  assert.equal(chick.gib_health, -70);
  assert.equal(chick.mass, 200);
  assert.equal(chick.pain, chick_pain);
  assert.equal(chick.die, chick_die);
  assert.equal(chick.monsterinfo.stand, chick_stand);
  assert.equal(chick.monsterinfo.walk, chick_walk);
  assert.equal(chick.monsterinfo.run, chick_run);
  assert.equal(chick.monsterinfo.dodge, chick_dodge);
  assert.equal(chick.monsterinfo.attack, chick_attack);
  assert.equal(chick.monsterinfo.melee, chick_melee);
  assert.equal(chick.monsterinfo.sight, chick_sight);
  assert.equal(chick.monsterinfo.currentmove, chick_move_stand);
  assert.equal(chick.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[chick.s.modelindex - 1], "models/monsters/bitch/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "chick/chkatck1.wav",
    "chick/chkatck2.wav",
    "chick/chkatck3.wav",
    "chick/chkatck4.wav",
    "chick/chkatck5.wav",
    "chick/chkdeth1.wav",
    "chick/chkdeth2.wav",
    "chick/chkfall1.wav",
    "chick/chkidle1.wav",
    "chick/chkidle2.wav",
    "chick/chkpain1.wav",
    "chick/chkpain2.wav",
    "chick/chkpain3.wav",
    "chick/chksght1.wav",
    "chick/chksrch1.wav"
  ]);
  assert.ok(chick.think, "walkmonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesWalkingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const chick = createChick(runtime, 2);

  SP_monster_chick(chick, runtime);
  chick.think!(chick, runtime);

  assert.equal(chick.yaw_speed, 20);
  assert.equal(chick.viewheight, 25);
  assert.equal(chick.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(chick.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(chick.max_health, 175);
  assert.equal(chick.think?.name, "monster_think");
  assert.equal(chick.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterChick(): void {
  const runtime = createHarnessRuntime();
  const chick = createChick(runtime, 3);

  ED_CallSpawn(chick, runtime);

  assert.equal(chick.health, 175);
  assert.equal(chick.monsterinfo.currentmove, chick_move_stand);
}

function verifyMoveTablesMatchSourceFrames(): void {
  assertMove("fidget", chick_move_fidget, FRAME_stand201, FRAME_stand230, new Array<number>(30).fill(0), [[8, "ChickMoan"]]);
  assert.equal(chick_move_fidget.endfunc?.name, "chick_stand");
  assertMove("stand", chick_move_stand, FRAME_stand101, FRAME_stand130, new Array<number>(30).fill(0), [[29, "chick_fidget"]]);
  assertMove("start_run", chick_move_start_run, FRAME_walk01, FRAME_walk10, [1, 0, 0, -1, -1, 0, 1, 3, 6, 3]);
  assert.equal(chick_move_start_run.endfunc?.name, "chick_run");
  assertMove("run", chick_move_run, FRAME_walk11, FRAME_walk20, [6, 8, 13, 5, 7, 4, 11, 5, 9, 7]);
  assertMove("walk", chick_move_walk, FRAME_walk11, FRAME_walk20, [6, 8, 13, 5, 7, 4, 11, 5, 9, 7]);
  assertMove("pain1", chick_move_pain1, FRAME_pain101, FRAME_pain105, [0, 0, 0, 0, 0]);
  assertMove("pain2", chick_move_pain2, FRAME_pain201, FRAME_pain205, [0, 0, 0, 0, 0]);
  assertMove("pain3", chick_move_pain3, FRAME_pain301, FRAME_pain321, [0, 0, -6, 3, 11, 3, 0, 0, 4, 1, 0, -3, -4, 5, 7, -2, 3, -5, -2, -8, 2]);
  assertMove("death2", chick_move_death2, FRAME_death201, FRAME_death223, [-6, 0, -1, -5, 0, -1, -2, 1, 10, 2, 3, 1, 2, 0, 3, 3, 1, -3, -5, 4, 15, 14, 1]);
  assertMove("death1", chick_move_death1, FRAME_death101, FRAME_death112, [0, 0, -7, 4, 11, 0, 0, 0, 0, 0, 0, 0]);
  assertMove("duck", chick_move_duck, FRAME_duck01, FRAME_duck07, [0, 1, 4, -4, -5, 3, 1], [
    [0, "chick_duck_down"],
    [2, "chick_duck_hold"],
    [4, "chick_duck_up"]
  ]);
  assertMove("start_attack1", chick_move_start_attack1, FRAME_attak101, FRAME_attak113, [0, 0, 0, 4, 0, -3, 3, 5, 7, 0, 0, 0, 0], [
    [0, "Chick_PreAttack1"],
    [12, "chick_attack1"]
  ]);
  assertMove("attack1", chick_move_attack1, FRAME_attak114, FRAME_attak127, [19, -6, -5, -2, -7, 0, 1, 10, 4, 5, 6, 6, 4, 3], [
    [0, "ChickRocket"],
    [7, "ChickReload"],
    [13, "chick_rerocket"]
  ]);
  assertMove("end_attack1", chick_move_end_attack1, FRAME_attak128, FRAME_attak132, [-3, 0, -6, -4, -2]);
  assertMove("slash", chick_move_slash, FRAME_attak204, FRAME_attak212, [1, 7, -7, 1, -1, 1, 0, 1, -2], [
    [1, "ChickSlash"],
    [8, "chick_reslash"]
  ]);
  assertMove("end_slash", chick_move_end_slash, FRAME_attak213, FRAME_attak216, [-6, -1, -6, 0]);
  assertMove("start_slash", chick_move_start_slash, FRAME_attak201, FRAME_attak203, [1, 8, 3]);
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_chick"), SP_monster_chick);
  assert.equal(findGameSaveFunction("chick_pain"), chick_pain);
  assert.equal(findGameSaveFunction("chick_die"), chick_die);
  assert.equal(findGameSaveFunction("ChickRocket"), ChickRocket);
  assert.equal(findGameSaveMove("chick_move_stand"), chick_move_stand);
  assert.equal(findGameSaveMove("chick_move_attack1"), chick_move_attack1);
  assert.equal(findGameSaveMove("chick_move_death2"), chick_move_death2);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const chick = createChick(runtime, 4);
  const nearEnemy = createEnemy(runtime, 5, [40, 0, 24]);
  const farEnemy = createEnemy(runtime, 6, [256, 0, 24]);
  void nearEnemy;

  chick_stand(chick);
  assert.equal(chick.monsterinfo.currentmove, chick_move_stand);
  chick_walk(chick);
  assert.equal(chick.monsterinfo.currentmove, chick_move_walk);
  chick_run(chick);
  assert.equal(chick.monsterinfo.currentmove, chick_move_run);
  chick_run(chick);
  assert.equal(chick.monsterinfo.currentmove, chick_move_start_run);
  chick.monsterinfo.aiflags |= AI_STAND_GROUND;
  chick_run(chick);
  assert.equal(chick.monsterinfo.currentmove, chick_move_stand);
  chick.monsterinfo.aiflags &= ~AI_STAND_GROUND;

  chick_attack(chick);
  assert.equal(chick.monsterinfo.currentmove, chick_move_start_attack1);
  chick_attack1(chick);
  assert.equal(chick.monsterinfo.currentmove, chick_move_attack1);
  chick_melee(chick);
  assert.equal(chick.monsterinfo.currentmove, chick_move_start_slash);
  chick_slash(chick);
  assert.equal(chick.monsterinfo.currentmove, chick_move_slash);

  chick.enemy = farEnemy;
  withMathRandom([0.5], () => chick_rerocket(chick, runtime));
  assert.equal(chick.monsterinfo.currentmove, chick_move_attack1);
  runtime.collision!.trace = (_start, _mins, _maxs, end) => ({ ...makeTrace(null, end), fraction: 0.5 });
  withMathRandom([0.5], () => chick_rerocket(chick, runtime));
  assert.equal(chick.monsterinfo.currentmove, chick_move_end_attack1, "blocked visibility must end the rocket loop");
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(null, end);
  farEnemy.health = 0;
  chick_rerocket(chick, runtime);
  assert.equal(chick.monsterinfo.currentmove, chick_move_end_attack1);

  farEnemy.health = 100;
  farEnemy.s.origin = [40, 0, 24];
  farEnemy.origin = [...farEnemy.s.origin];
  withMathRandom([0.5], () => chick_reslash(chick));
  assert.equal(chick.monsterinfo.currentmove, chick_move_slash);
  withMathRandom([0.95], () => chick_reslash(chick));
  assert.equal(chick.monsterinfo.currentmove, chick_move_end_slash);
}

function verifySounds(): void {
  const runtime = createHarnessRuntime();
  const chick = createChick(runtime, 7);
  SP_monster_chick(chick, runtime);

  withMathRandom([0.25], () => ChickMoan(chick, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chkidle1.wav");

  withMathRandom([0.75], () => ChickMoan(chick, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chkidle2.wav");

  Chick_PreAttack1(chick, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chkatck1.wav");

  ChickReload(chick, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chkatck5.wav");

  chick_sight(chick, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chksght1.wav");

  withMathRandom([0.25], () => chick_fidget(chick));
  assert.equal(chick.monsterinfo.currentmove, chick_move_fidget);
  chick.monsterinfo.currentmove = chick_move_stand;
  withMathRandom([0.75], () => chick_fidget(chick));
  assert.equal(chick.monsterinfo.currentmove, chick_move_stand);
}

function verifyDuckAndDodgeBranches(): void {
  const runtime = createHarnessRuntime();
  const chick = createChick(runtime, 8);
  const attacker = createEnemy(runtime, 9, [128, 0, 0]);
  SP_monster_chick(chick, runtime);

  chick_duck_down(chick, runtime);
  assert.equal(chick.monsterinfo.aiflags & AI_DUCKED, AI_DUCKED);
  assert.equal(chick.maxs[2], 24);
  assert.equal(chick.takedamage, damage_t.DAMAGE_YES);

  chick_duck_hold(chick, runtime);
  assert.equal(chick.monsterinfo.aiflags & AI_HOLD_FRAME, AI_HOLD_FRAME);

  runtime.time = 2;
  chick_duck_hold(chick, runtime);
  assert.equal(chick.monsterinfo.aiflags & AI_HOLD_FRAME, 0);

  chick_duck_up(chick, runtime);
  assert.equal(chick.monsterinfo.aiflags & AI_DUCKED, 0);
  assert.equal(chick.maxs[2], 56);
  assert.equal(chick.takedamage, damage_t.DAMAGE_AIM);

  withMathRandom([0.5], () => chick_dodge(chick, attacker, 0));
  assert.notEqual(chick.monsterinfo.currentmove, chick_move_duck);
  withMathRandom([0.1], () => chick_dodge(chick, attacker, 0));
  assert.equal(chick.enemy, attacker);
  assert.equal(chick.monsterinfo.currentmove, chick_move_duck);
}

function verifyWeaponCallbacks(): void {
  const runtime = createHarnessRuntime();
  const chick = createChick(runtime, 10);
  const enemy = createEnemy(runtime, 11, [128, 0, 24]);
  SP_monster_chick(chick, runtime);
  chick.enemy = enemy;
  chick.s.origin = [0, 0, 0];
  chick.origin = [...chick.s.origin];
  chick.s.angles = [0, 0, 0];
  chick.angles = [...chick.s.angles];

  ChickRocket(chick, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_CHICK_ROCKET_1);
  assert.ok(runtime.entities.some((entity) => entity.classname === "rocket"));

  enemy.s.origin = [40, 0, 0];
  enemy.origin = [...enemy.s.origin];
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);
  withMathRandom([0], () => ChickSlash(chick, runtime));
  assert.equal(enemy.health, 90);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chkatck3.wav");
}

function verifyMoveFrameCallbacks(): void {
  const runtime = createHarnessRuntime();
  const chick = createChick(runtime, 12);
  const enemy = createEnemy(runtime, 13, [128, 0, 24]);
  SP_monster_chick(chick, runtime);
  chick.enemy = enemy;
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);

  chick.monsterinfo.currentmove = chick_move_start_attack1;
  chick.s.frame = FRAME_attak101 - 1;
  M_MoveFrame(chick, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chkatck1.wav");

  chick.monsterinfo.currentmove = chick_move_attack1;
  chick.s.frame = FRAME_attak114 - 1;
  M_MoveFrame(chick, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_CHICK_ROCKET_1);

  chick.s.frame = FRAME_attak114 + 6;
  M_MoveFrame(chick, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chkatck5.wav");

  enemy.s.origin = [40, 0, 0];
  enemy.origin = [...enemy.s.origin];
  chick.monsterinfo.currentmove = chick_move_slash;
  chick.s.frame = FRAME_attak204;
  withMathRandom([0], () => M_MoveFrame(chick, runtime));
  assert.equal(enemy.health, 90);

  chick.monsterinfo.currentmove = chick_move_death1;
  chick.s.frame = FRAME_death112;
  M_MoveFrame(chick, runtime);
  assert.equal(chick.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const chick = createChick(runtime, 14);
  SP_monster_chick(chick, runtime);
  chick.max_health = 175;
  chick.health = 80;

  withMathRandom([0.1], () => chick_pain(chick, null, 0, 10, runtime));
  assert.equal(chick.s.skinnum, 1);
  assert.equal(chick.monsterinfo.currentmove, chick_move_pain1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chkpain1.wav");

  runtime.time = 4;
  withMathRandom([0.5], () => chick_pain(chick, null, 0, 20, runtime));
  assert.equal(chick.monsterinfo.currentmove, chick_move_pain2);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chkpain2.wav");

  runtime.time = 8;
  withMathRandom([0.8], () => chick_pain(chick, null, 0, 40, runtime));
  assert.equal(chick.monsterinfo.currentmove, chick_move_pain3);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chkpain3.wav");

  runtime.skill = 3;
  runtime.time = 12;
  chick.monsterinfo.currentmove = chick_move_stand;
  chick_pain(chick, null, 0, 40, runtime);
  assert.equal(chick.monsterinfo.currentmove, chick_move_stand, "nightmare pain should not start a pain animation");
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const chick = createChick(runtime, 15);
  SP_monster_chick(chick, runtime);

  withMathRandom([0], () => chick_die(chick, null, null, 60, runtime));
  assert.equal(chick.deadflag, DEAD_DEAD);
  assert.equal(chick.takedamage, damage_t.DAMAGE_YES);
  assert.equal(chick.monsterinfo.currentmove, chick_move_death1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chkdeth1.wav");

  const second = createChick(runtime, 16);
  SP_monster_chick(second, runtime);
  withMathRandom([0.75], () => chick_die(second, null, null, 60, runtime));
  assert.equal(second.monsterinfo.currentmove, chick_move_death2);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "chick/chkdeth2.wav");

  chick_dead(second, runtime);
  assert.deepEqual(second.mins, [-16, -16, 0]);
  assert.deepEqual(second.maxs, [16, 16, 16]);
  assert.equal(second.movetype, MOVETYPE_TOSS);
  assert.equal(second.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
  assert.equal(second.nextthink, 0);

  const gibChick = createChick(runtime, 17);
  SP_monster_chick(gibChick, runtime);
  gibChick.health = -70;
  chick_die(gibChick, null, null, 25, runtime);
  assert.equal(gibChick.deadflag, DEAD_DEAD);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/bone/tris.md2").length, 2);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2").length, 4);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/head2/tris.md2").length, 1);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const chick = createChick(runtime, 18);

  SP_monster_chick(chick, runtime);

  assert.equal(chick.inuse, false);
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

function createChick(runtime: GameRuntime, index: number): GameEntity {
  const chick = createRuntimeEntity({ classname: "monster_chick" }, index);
  runtime.entities[index] = chick;
  return chick;
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
