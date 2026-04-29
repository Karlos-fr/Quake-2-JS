/**
 * File: quake2-m-medic.ts
 * Purpose: Verify the initial gameplay port of `game/m_medic.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_medic behavior.
 *
 * Dependencies:
 * - packages/game/src/m_medic.ts
 */

import { strict as assert } from "node:assert";

import { EF_BLASTER, temp_event_t, type trace_t, type vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_MEDIC,
  AI_RESURRECTING,
  DEAD_DEAD,
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
  FRAME_attack9,
  FRAME_attack43,
  FRAME_attack44,
  FRAME_attack50,
  MZ2_MEDIC_BLASTER_1,
  SP_monster_medic,
  medic_FindDeadMonster,
  medic_attack,
  medic_cable_attack,
  medic_checkattack,
  medic_dead,
  medic_die,
  medic_fire_blaster,
  medic_idle,
  medic_move_attackBlaster,
  medic_move_attackCable,
  medic_move_death,
  medic_move_stand,
  medic_pain,
  medic_run,
  medic_search
} from "../../packages/game/src/m_medic.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndCallbacks();
  verifySpawnRegistryCallsMonsterMedic();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyFindDeadMonsterChoosesBestVisiblePatient();
  verifyIdleSearchAndRunAcquirePatient();
  verifyAttackAndCheckattackBranches();
  verifyBlasterAttack();
  verifyCableAttackEventsAndResurrectionFlags();
  verifyPainAndDeathBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-medic: ok");
}

function verifySpawnRegistersAssetsAndCallbacks(): void {
  const runtime = createHarnessRuntime();
  const medic = createMedic(runtime, 1);

  SP_monster_medic(medic, runtime);

  assert.equal(medic.movetype, MOVETYPE_STEP);
  assert.equal(medic.solid, SOLID_BBOX);
  assert.deepEqual(medic.mins, [-24, -24, -24]);
  assert.deepEqual(medic.maxs, [24, 24, 32]);
  assert.equal(medic.health, 300);
  assert.equal(medic.gib_health, -130);
  assert.equal(medic.mass, 400);
  assert.equal(medic.monsterinfo.currentmove, medic_move_stand);
  assert.equal(medic.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[medic.s.modelindex - 1], "models/monsters/medic/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "medic/idle.wav",
    "medic/medpain1.wav",
    "medic/medpain2.wav",
    "medic/meddeth1.wav",
    "medic/medsght1.wav",
    "medic/medsrch1.wav",
    "medic/medatck2.wav",
    "medic/medatck3.wav",
    "medic/medatck4.wav",
    "medic/medatck5.wav",
    "medic/medatck1.wav"
  ]);
  assert.equal(medic.monsterinfo.attack, medic_attack);
  assert.equal(medic.monsterinfo.search, medic_search);
  assert.equal(medic.monsterinfo.checkattack, medic_checkattack);
}

function verifySpawnRegistryCallsMonsterMedic(): void {
  const runtime = createHarnessRuntime();
  const medic = createMedic(runtime, 1);
  medic.classname = "monster_medic";

  ED_CallSpawn(medic, runtime);

  assert.equal(medic.health, 300);
  assert.equal(medic.monsterinfo.currentmove, medic_move_stand);
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("medic_attack"), medic_attack);
  assert.equal(findGameSaveFunction("medic_run"), medic_run);
  assert.equal(findGameSaveMove("medic_move_attackCable"), medic_move_attackCable);
  assert.equal(findGameSaveMove("medic_move_death"), medic_move_death);
}

function verifyFindDeadMonsterChoosesBestVisiblePatient(): void {
  const runtime = createHarnessRuntime();
  const medic = createMedic(runtime, 1);
  const weak = createDeadMonster(runtime, 2, 100);
  const strong = createDeadMonster(runtime, 3, 400);

  assert.equal(medic_FindDeadMonster(medic, runtime), strong);

  strong.owner = medic;
  assert.equal(medic_FindDeadMonster(medic, runtime), weak);
}

function verifyIdleSearchAndRunAcquirePatient(): void {
  const runtime = createHarnessRuntime();
  const medic = createMedic(runtime, 1);
  const patient = createDeadMonster(runtime, 2, 200);

  medic_idle(medic, runtime);

  assert.equal(medic.enemy, patient);
  assert.equal(patient.owner, medic);
  assert.equal((medic.monsterinfo.aiflags & AI_MEDIC) !== 0, true);
  assert.equal(drainGameSoundEvents(runtime).at(0)?.soundPath, "medic/idle.wav");
}

function verifyAttackAndCheckattackBranches(): void {
  const runtime = createHarnessRuntime();
  const medic = createMedic(runtime, 1);

  medic_attack(medic);
  assert.equal(medic.monsterinfo.currentmove, medic_move_attackBlaster);

  medic.monsterinfo.aiflags |= AI_MEDIC;
  assert.equal(medic_checkattack(medic, runtime), true);
  assert.equal(medic.monsterinfo.currentmove, medic_move_attackCable);
}

function verifyBlasterAttack(): void {
  const runtime = createHarnessRuntime();
  const medic = createMedic(runtime, 1);
  const enemy = createRuntimeEntity(2, {}, runtime);
  enemy.s.origin = [128, 0, 0];
  enemy.viewheight = 24;
  medic.enemy = enemy;
  medic.s.frame = FRAME_attack9;

  medic_fire_blaster(medic, runtime);

  const flash = drainMonsterMuzzleFlashEvents(runtime).at(-1);
  assert.equal(flash?.flashNumber, MZ2_MEDIC_BLASTER_1);
  assert.equal(runtime.entities.at(-1)?.s.effects, EF_BLASTER);
}

function verifyCableAttackEventsAndResurrectionFlags(): void {
  const runtime = createHarnessRuntime();
  const medic = createMedic(runtime, 1);
  const patient = createDeadMonster(runtime, 2, 200);
  medic.enemy = patient;

  medic.s.frame = FRAME_attack43;
  medic_cable_attack(medic, runtime);
  assert.equal((patient.monsterinfo.aiflags & AI_RESURRECTING) !== 0, true);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "medic/medatck3.wav");
  assert.equal(drainGameTempEntityEvents(runtime).at(-1)?.type, temp_event_t.TE_MEDIC_CABLE_ATTACK);

  medic.s.frame = FRAME_attack44;
  medic_cable_attack(medic, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "medic/medatck4.wav");

  medic.s.frame = FRAME_attack50;
  patient.classname = "monster_medic";
  medic_cable_attack(medic, runtime);
  assert.equal(patient.owner, null);
  assert.equal((patient.monsterinfo.aiflags & AI_RESURRECTING) !== 0, true);
}

function verifyPainAndDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const medic = createMedic(runtime, 1);
  const patient = createDeadMonster(runtime, 2, 200);

  medic.health = 100;
  medic_pain(medic, null, 0, 10, runtime);
  assert.equal(medic.s.skinnum, 1);
  assert.ok(medic.monsterinfo.currentmove);

  medic.enemy = patient;
  patient.owner = medic;
  medic_die(medic, null, null, 10, runtime);
  assert.equal(patient.owner, null);
  assert.equal(medic.deadflag, DEAD_DEAD);
  assert.equal(medic.takedamage, damage_t.DAMAGE_YES);
  assert.equal(medic.monsterinfo.currentmove, medic_move_death);

  medic_dead(medic, runtime);
  assert.equal(medic.movetype, MOVETYPE_TOSS);
  assert.equal((medic.svflags & SVF_DEADMONSTER) !== 0, true);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const medic = createMedic(runtime, 1);

  SP_monster_medic(medic, runtime);

  assert.equal(medic.inuse, false);
}

function createHarnessRuntime(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([]);
  runtime.collision = {
    world: {} as GameRuntime["collision"] extends { world: infer World } ? World : never,
    trace: (_start, _mins, _maxs, end, _passent): trace_t => ({
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [...end],
      plane: { normal: [0, 0, 0], dist: 0, type: 0, signbits: 0, pad: [0, 0] },
      surface: null,
      contents: 0,
      ent: null
    }),
    pointcontents: () => 0
  };
  return runtime;
}

function createMedic(runtime: GameRuntime, index: number): GameEntity {
  const entity = createRuntimeEntity(index, { classname: "monster_medic" }, runtime);
  entity.inuse = true;
  entity.svflags = SVF_MONSTER;
  entity.max_health = 300;
  entity.s.origin = [0, 0, 0];
  entity.viewheight = 24;
  runtime.entities[index] = entity;
  return entity;
}

function createDeadMonster(runtime: GameRuntime, index: number, maxHealth: number): GameEntity {
  const entity = createRuntimeEntity(index, { classname: "monster_infantry" }, runtime);
  entity.inuse = true;
  entity.svflags = SVF_MONSTER;
  entity.health = 0;
  entity.max_health = maxHealth;
  entity.s.origin = [64 + index, 0, 0];
  entity.absmin = [entity.s.origin[0] - 16, -16, -24];
  entity.size = [32, 32, 56];
  runtime.entities[index] = entity;
  return entity;
}
