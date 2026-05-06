/**
 * File: quake2-m-float.ts
 * Purpose: Verify the initial gameplay port of `game/m_float.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_floater behavior.
 *
 * Dependencies:
 * - packages/game/src/m_float.ts
 */

import { strict as assert } from "node:assert";

import { EF_HYPERBLASTER, temp_event_t, type vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_STAND_GROUND,
  FRAMETIME,
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
  type GameMonsterFrame,
  type GameMonsterMove,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { FL_FLY } from "../../packages/game/src/g_local.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  FRAME_actvat01,
  FRAME_actvat31,
  FRAME_attak101,
  FRAME_attak104,
  FRAME_attak114,
  FRAME_attak201,
  FRAME_attak225,
  FRAME_attak301,
  FRAME_attak334,
  FRAME_death01,
  FRAME_death13,
  FRAME_pain101,
  FRAME_pain107,
  FRAME_pain201,
  FRAME_pain208,
  FRAME_pain301,
  FRAME_pain312,
  FRAME_stand101,
  FRAME_stand152,
  FRAME_stand201,
  FRAME_stand252,
  SP_monster_floater,
  floater_attack,
  floater_dead,
  floater_die,
  floater_fire_blaster,
  floater_idle,
  floater_melee,
  floater_move_activate,
  floater_move_attack1,
  floater_move_attack2,
  floater_move_attack3,
  floater_move_death,
  floater_move_pain1,
  floater_move_pain2,
  floater_move_pain3,
  floater_move_run,
  floater_move_stand1,
  floater_move_stand2,
  floater_move_walk,
  floater_pain,
  floater_run,
  floater_sight,
  floater_stand,
  floater_walk,
  floater_wham,
  floater_zap
} from "../../packages/game/src/m_float.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsFlying();
  verifyStartupThinkCompletesFlyingMonsterSetup();
  verifySpawnRegistryCallsMonsterFloater();
  verifyMoveTablesMatchSourceFrames();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyStateTransitions();
  verifySightAndIdleSounds();
  verifyBlasterAttack();
  verifyMeleeAttacks();
  verifyPainBranches();
  verifyDeathBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-float: ok");
}

function verifySpawnRegistersAssetsAndStartsFlying(): void {
  const runtime = createHarnessRuntime();
  const floater = createFloater(runtime, 1);

  withMathRandom([0.25], () => SP_monster_floater(floater, runtime));

  assert.equal(floater.movetype, MOVETYPE_STEP);
  assert.equal(floater.solid, SOLID_BBOX);
  assert.deepEqual(floater.mins, [-24, -24, -24]);
  assert.deepEqual(floater.maxs, [24, 24, 32]);
  assert.equal(floater.health, 200);
  assert.equal(floater.gib_health, -80);
  assert.equal(floater.mass, 300);
  assert.equal(floater.flags & FL_FLY, FL_FLY);
  assert.equal(floater.monsterinfo.currentmove, floater_move_stand1);
  assert.equal(floater.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[floater.s.modelindex - 1], "models/monsters/float/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "floater/fltatck2.wav",
    "floater/fltatck3.wav",
    "floater/fltdeth1.wav",
    "floater/fltidle1.wav",
    "floater/fltpain1.wav",
    "floater/fltpain2.wav",
    "floater/fltsght1.wav",
    "floater/fltatck1.wav",
    "floater/fltsrch1.wav"
  ]);
  assert.equal(runtime.assets.soundPaths[floater.s.sound - 1], "floater/fltsrch1.wav");
  assert.ok(floater.think, "flymonster_start should arm delayed startup think");

  const boundaryRuntime = createHarnessRuntime();
  const boundaryFloater = createFloater(boundaryRuntime, 14);
  withMathRandom([0.5], () => SP_monster_floater(boundaryFloater, boundaryRuntime));
  assert.equal(
    boundaryFloater.monsterinfo.currentmove,
    floater_move_stand2,
    "SP_monster_floater should use g_local.random's 15-bit bucket at the 0.5 threshold"
  );
}

function verifyStartupThinkCompletesFlyingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const floater = createFloater(runtime, 2);

  SP_monster_floater(floater, runtime);
  floater.think!(floater, runtime);

  assert.equal(floater.yaw_speed, 10);
  assert.equal(floater.viewheight, 25);
  assert.equal(floater.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(floater.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(floater.max_health, 200);
  assert.equal(floater.think?.name, "monster_think");
  assert.equal(floater.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterFloater(): void {
  const runtime = createHarnessRuntime();
  const floater = createFloater(runtime, 3);

  ED_CallSpawn(floater, runtime);

  assert.equal(floater.health, 200);
  assert.ok(floater.monsterinfo.currentmove === floater_move_stand1 || floater.monsterinfo.currentmove === floater_move_stand2);
}

function verifyMoveTablesMatchSourceFrames(): void {
  assertMove("stand1", floater_move_stand1, FRAME_stand101, FRAME_stand152, new Array<number>(52).fill(0));
  assertMove("stand2", floater_move_stand2, FRAME_stand201, FRAME_stand252, new Array<number>(52).fill(0));
  assertMove("activate", floater_move_activate, FRAME_actvat01, FRAME_actvat31, new Array<number>(30).fill(0), [], false);
  assertMove("attack1", floater_move_attack1, FRAME_attak101, FRAME_attak114, new Array<number>(14).fill(0), [
    [3, "floater_fire_blaster"],
    [4, "floater_fire_blaster"],
    [5, "floater_fire_blaster"],
    [6, "floater_fire_blaster"],
    [7, "floater_fire_blaster"],
    [8, "floater_fire_blaster"],
    [9, "floater_fire_blaster"]
  ]);
  assert.equal(floater_move_attack1.endfunc?.name, "floater_run");
  assertMove("attack2", floater_move_attack2, FRAME_attak201, FRAME_attak225, new Array<number>(25).fill(0), [[11, "floater_wham"]]);
  assert.equal(floater_move_attack2.endfunc?.name, "floater_run");
  assertMove("attack3", floater_move_attack3, FRAME_attak301, FRAME_attak334, new Array<number>(34).fill(0), [[8, "floater_zap"]]);
  assert.equal(floater_move_attack3.endfunc?.name, "floater_run");
  assertMove("death", floater_move_death, FRAME_death01, FRAME_death13, new Array<number>(13).fill(0));
  assert.equal(floater_move_death.endfunc?.name, "floater_dead");
  assertMove("pain1", floater_move_pain1, FRAME_pain101, FRAME_pain107, new Array<number>(7).fill(0));
  assertMove("pain2", floater_move_pain2, FRAME_pain201, FRAME_pain208, new Array<number>(8).fill(0));
  assertMove("pain3", floater_move_pain3, FRAME_pain301, FRAME_pain312, new Array<number>(12).fill(0));
  assertMove("walk", floater_move_walk, FRAME_stand101, FRAME_stand152, new Array<number>(52).fill(5));
  assertMove("run", floater_move_run, FRAME_stand101, FRAME_stand152, new Array<number>(52).fill(13));
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_floater"), SP_monster_floater);
  assert.equal(findGameSaveFunction("floater_pain"), floater_pain);
  assert.equal(findGameSaveFunction("floater_die"), floater_die);
  assert.equal(findGameSaveFunction("floater_sight"), floater_sight);
  assert.equal(findGameSaveFunction("floater_idle"), floater_idle);
  assert.equal(findGameSaveMove("floater_move_stand1"), floater_move_stand1);
  assert.equal(findGameSaveMove("floater_move_attack1"), floater_move_attack1);
  assert.equal(findGameSaveMove("floater_move_death"), floater_move_death);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const floater = createFloater(runtime, 4);
  void runtime;

  withMathRandom([0.25], () => floater_stand(floater));
  assert.equal(floater.monsterinfo.currentmove, floater_move_stand1);
  withMathRandom([0.5], () => floater_stand(floater));
  assert.equal(
    floater.monsterinfo.currentmove,
    floater_move_stand2,
    "floater_stand should use g_local.random's 15-bit bucket at the 0.5 threshold"
  );
  withMathRandom([0.75], () => floater_stand(floater));
  assert.equal(floater.monsterinfo.currentmove, floater_move_stand2);
  floater_walk(floater);
  assert.equal(floater.monsterinfo.currentmove, floater_move_walk);
  floater_run(floater);
  assert.equal(floater.monsterinfo.currentmove, floater_move_run);
  floater.monsterinfo.aiflags |= AI_STAND_GROUND;
  floater_run(floater);
  assert.equal(floater.monsterinfo.currentmove, floater_move_stand1);
  floater_attack(floater);
  assert.equal(floater.monsterinfo.currentmove, floater_move_attack1);
  withMathRandom([0.25], () => floater_melee(floater));
  assert.equal(floater.monsterinfo.currentmove, floater_move_attack3);
  withMathRandom([0.5], () => floater_melee(floater));
  assert.equal(floater.monsterinfo.currentmove, floater_move_attack2);
  withMathRandom([0.75], () => floater_melee(floater));
  assert.equal(floater.monsterinfo.currentmove, floater_move_attack2);
}

function verifySightAndIdleSounds(): void {
  const runtime = createHarnessRuntime();
  const floater = createFloater(runtime, 5);
  SP_monster_floater(floater, runtime);

  floater_sight(floater, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "floater/fltsght1.wav");

  floater_idle(floater, runtime);
  const idleSound = drainGameSoundEvents(runtime).at(-1);
  assert.equal(idleSound?.soundPath, "floater/fltidle1.wav");
  assert.equal(idleSound?.attenuation, 2);
}

function verifyBlasterAttack(): void {
  const runtime = createHarnessRuntime();
  const floater = createFloater(runtime, 6);
  const enemy = createEnemy(runtime, 7);
  enemy.s.origin = [128, 0, 24];
  enemy.origin = [...enemy.s.origin];
  enemy.viewheight = 22;

  SP_monster_floater(floater, runtime);
  floater.s.origin = [0, 0, 0];
  floater.origin = [...floater.s.origin];
  floater.s.angles = [0, 0, 0];
  floater.angles = [...floater.s.angles];
  floater.enemy = enemy;
  floater.s.frame = FRAME_attak104;

  floater_fire_blaster(floater, runtime);

  const bolt = runtime.entities.find((entity) => entity?.classname === "bolt");
  assert.ok(bolt, "floater_fire_blaster should spawn a blaster bolt");
  assert.equal(bolt.owner, floater);
  assert.equal(bolt.dmg, 1);
  assert.equal((bolt.s.effects & EF_HYPERBLASTER) !== 0, true, "source hyperblaster frames should use EF_HYPERBLASTER");
  assert.equal(runtime.assets.modelPaths[bolt.s.modelindex - 1], "models/objects/laser/tris.md2");

  const flashes = drainMonsterMuzzleFlashEvents(runtime);
  assert.equal(flashes.length, 1, "floater_fire_blaster should queue one monster muzzleflash");
  assert.equal(flashes[0].entityIndex, floater.index);
  assert.equal(flashes[0].flashNumber, 82);
  assert.deepEqual(flashes[0].origin, bolt.s.origin);
}

function verifyMeleeAttacks(): void {
  const runtime = createHarnessRuntime();
  const floater = createFloater(runtime, 8);
  const enemy = createEnemy(runtime, 9);
  enemy.s.origin = [40, 0, 0];
  enemy.origin = [...enemy.s.origin];
  floater.enemy = enemy;
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);

  SP_monster_floater(floater, runtime);
  withMathRandom([0], () => floater_wham(floater, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "floater/fltatck3.wav");
  assert.equal(enemy.health, 95);

  enemy.health = 100;
  withMathRandom([0], () => floater_zap(floater, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "floater/fltatck2.wav");
  assert.equal(enemy.health, 95);
  const splash = drainGameTempEntityEvents(runtime).at(-1);
  assert.equal(splash?.type, temp_event_t.TE_SPLASH);
  assert.equal(splash?.payload.count, 32);
  assert.equal(splash?.payload.color, 1);
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const floater = createFloater(runtime, 10);
  SP_monster_floater(floater, runtime);

  floater.health = 80;
  withMathRandom([2.5 / 0x7fffffff], () => floater_pain(floater, null, 0, 5, runtime));
  assert.equal(floater.s.skinnum, 1);
  assert.equal(floater.monsterinfo.currentmove, floater_move_pain1);

  runtime.time = 4;
  withMathRandom([0], () => floater_pain(floater, null, 0, 5, runtime));
  assert.equal(floater.monsterinfo.currentmove, floater_move_pain2);

  runtime.skill = 3;
  runtime.time = 8;
  floater.monsterinfo.currentmove = floater_move_stand1;
  floater_pain(floater, null, 0, 5, runtime);
  assert.equal(floater.monsterinfo.currentmove, floater_move_stand1, "nightmare pain should not start a pain animation");
  assert.equal(floater.pain_debounce_time, 11, "nightmare pain should still debounce before returning");
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const floater = createFloater(runtime, 11);
  SP_monster_floater(floater, runtime);

  floater_die(floater, null, null, 20, runtime);
  assert.equal(drainGameSoundEvents(runtime)[0]?.soundPath, "floater/fltdeth1.wav");
  assert.equal(runtime.tempEntityEvents[0]?.type, temp_event_t.TE_EXPLOSION1);
  assert.equal(floater.inuse, false);

  const corpse = createFloater(runtime, 12);
  floater_dead(corpse, runtime);
  assert.deepEqual(corpse.mins, [-16, -16, -24]);
  assert.deepEqual(corpse.maxs, [16, 16, -8]);
  assert.equal(corpse.movetype, MOVETYPE_TOSS);
  assert.equal(corpse.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
  assert.equal(corpse.nextthink, 0);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const floater = createFloater(runtime, 13);

  SP_monster_floater(floater, runtime);

  assert.equal(floater.inuse, false);
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

function createFloater(runtime: GameRuntime, index: number): GameEntity {
  const floater = createRuntimeEntity({ classname: "monster_floater" }, index);
  runtime.entities[index] = floater;
  return floater;
}

function createEnemy(runtime: GameRuntime, index: number): GameEntity {
  const enemy = createRuntimeEntity({ classname: "target_dummy" }, index);
  enemy.inuse = true;
  enemy.health = 100;
  enemy.max_health = 100;
  enemy.takedamage = damage_t.DAMAGE_YES;
  runtime.entities[index] = enemy;
  return enemy;
}

function makeTrace(entity: GameEntity | null, endpos: vec3_t | null = null) {
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
  thinkNames: Array<[index: number, name: string]> = [],
  assertRangeLength = true
): void {
  assert.equal(move.firstframe, firstframe, `${label}: firstframe`);
  assert.equal(move.lastframe, lastframe, `${label}: lastframe`);
  assert.equal(move.frame.length, distances.length, `${label}: frame length`);
  if (assertRangeLength) {
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
