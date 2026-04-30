/**
 * File: quake2-m-flyer.ts
 * Purpose: Verify the initial gameplay port of `game/m_flyer.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_flyer behavior.
 *
 * Dependencies:
 * - packages/game/src/m_flyer.ts
 */

import { strict as assert } from "node:assert";

import { EF_HYPERBLASTER, temp_event_t, type vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_STAND_GROUND,
  FRAMETIME,
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
  type GameMonsterFrame,
  type GameMonsterMove,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { FL_FLY } from "../../packages/game/src/g_local.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  FRAME_attak101,
  FRAME_attak106,
  FRAME_attak107,
  FRAME_attak118,
  FRAME_attak119,
  FRAME_attak121,
  FRAME_attak201,
  FRAME_attak217,
  FRAME_bankl01,
  FRAME_bankl07,
  FRAME_bankr01,
  FRAME_bankr07,
  FRAME_defens01,
  FRAME_defens06,
  FRAME_pain101,
  FRAME_pain109,
  FRAME_pain201,
  FRAME_pain204,
  FRAME_pain301,
  FRAME_pain304,
  FRAME_rollf01,
  FRAME_rollf09,
  FRAME_rollr01,
  FRAME_rollr09,
  FRAME_stand01,
  FRAME_stand45,
  FRAME_start01,
  FRAME_start06,
  FRAME_stop01,
  FRAME_stop07,
  SP_monster_flyer,
  flyer_attack,
  flyer_check_melee,
  flyer_die,
  flyer_fireleft,
  flyer_fireright,
  flyer_idle,
  flyer_melee,
  flyer_move_attack2,
  flyer_move_bankleft,
  flyer_move_bankright,
  flyer_move_defense,
  flyer_move_end_melee,
  flyer_move_loop_melee,
  flyer_move_pain1,
  flyer_move_pain2,
  flyer_move_pain3,
  flyer_move_rollleft,
  flyer_move_rollright,
  flyer_move_run,
  flyer_move_stand,
  flyer_move_start,
  flyer_move_start_melee,
  flyer_move_stop,
  flyer_move_walk,
  flyer_nextmove,
  flyer_pain,
  flyer_pop_blades,
  flyer_run,
  flyer_setstart,
  flyer_sight,
  flyer_slash_left,
  flyer_slash_right,
  flyer_stand,
  flyer_start,
  flyer_stop,
  flyer_walk
} from "../../packages/game/src/m_flyer.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsFlying();
  verifyStartupThinkCompletesFlyingMonsterSetup();
  verifySpawnRegistryCallsMonsterFlyer();
  verifyMoveTablesMatchSourceFrames();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyStateTransitions();
  verifySightIdleAndBladeSounds();
  verifyBlasterAttack();
  verifyMeleeAttacks();
  verifyPainBranches();
  verifyDeathBranches();
  verifyJail5MapBugFix();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-flyer: ok");
}

function verifySpawnRegistersAssetsAndStartsFlying(): void {
  const runtime = createHarnessRuntime();
  const flyer = createFlyer(runtime, 1);

  SP_monster_flyer(flyer, runtime);

  assert.equal(flyer.movetype, MOVETYPE_STEP);
  assert.equal(flyer.solid, SOLID_BBOX);
  assert.deepEqual(flyer.mins, [-16, -16, -24]);
  assert.deepEqual(flyer.maxs, [16, 16, 32]);
  assert.equal(flyer.health, 50);
  assert.equal(flyer.mass, 50);
  assert.equal(flyer.flags & FL_FLY, FL_FLY);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_stand);
  assert.equal(flyer.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[flyer.s.modelindex - 1], "models/monsters/flyer/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "flyer/flysght1.wav",
    "flyer/flysrch1.wav",
    "flyer/flypain1.wav",
    "flyer/flypain2.wav",
    "flyer/flyatck2.wav",
    "flyer/flyatck1.wav",
    "flyer/flydeth1.wav",
    "flyer/flyatck3.wav",
    "flyer/flyidle1.wav"
  ]);
  assert.equal(runtime.assets.soundPaths[flyer.s.sound - 1], "flyer/flyidle1.wav");
  assert.ok(flyer.think, "flymonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesFlyingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const flyer = createFlyer(runtime, 2);

  SP_monster_flyer(flyer, runtime);
  flyer.think!(flyer, runtime);

  assert.equal(flyer.yaw_speed, 10);
  assert.equal(flyer.viewheight, 25);
  assert.equal(flyer.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(flyer.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(flyer.max_health, 50);
  assert.equal(flyer.think?.name, "monster_think");
  assert.equal(flyer.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterFlyer(): void {
  const runtime = createHarnessRuntime();
  const flyer = createFlyer(runtime, 3);

  ED_CallSpawn(flyer, runtime);

  assert.equal(flyer.health, 50);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_stand);
}

function verifyMoveTablesMatchSourceFrames(): void {
  assertMove("stand", flyer_move_stand, FRAME_stand01, FRAME_stand45, new Array<number>(45).fill(0));
  assertMove("walk", flyer_move_walk, FRAME_stand01, FRAME_stand45, new Array<number>(45).fill(5));
  assertMove("run", flyer_move_run, FRAME_stand01, FRAME_stand45, new Array<number>(45).fill(10));
  assertMove("start", flyer_move_start, FRAME_start01, FRAME_start06, new Array<number>(6).fill(0), [[5, "flyer_nextmove"]]);
  assertMove("stop", flyer_move_stop, FRAME_stop01, FRAME_stop07, new Array<number>(7).fill(0), [[6, "flyer_nextmove"]]);
  assertMove("rollright", flyer_move_rollright, FRAME_rollr01, FRAME_rollr09, new Array<number>(9).fill(0));
  assertMove("rollleft", flyer_move_rollleft, FRAME_rollf01, FRAME_rollf09, new Array<number>(9).fill(0));
  assertMove("pain3", flyer_move_pain3, FRAME_pain301, FRAME_pain304, new Array<number>(4).fill(0));
  assert.equal(flyer_move_pain3.endfunc?.name, "flyer_run");
  assertMove("pain2", flyer_move_pain2, FRAME_pain201, FRAME_pain204, new Array<number>(4).fill(0));
  assert.equal(flyer_move_pain2.endfunc?.name, "flyer_run");
  assertMove("pain1", flyer_move_pain1, FRAME_pain101, FRAME_pain109, new Array<number>(9).fill(0));
  assert.equal(flyer_move_pain1.endfunc?.name, "flyer_run");
  assertMove("defense", flyer_move_defense, FRAME_defens01, FRAME_defens06, new Array<number>(6).fill(0));
  assertMove("bankright", flyer_move_bankright, FRAME_bankr01, FRAME_bankr07, new Array<number>(7).fill(0));
  assertMove("bankleft", flyer_move_bankleft, FRAME_bankl01, FRAME_bankl07, new Array<number>(7).fill(0));
  assertMove("attack2", flyer_move_attack2, FRAME_attak201, FRAME_attak217, [0, 0, 0, -10, -10, -10, -10, -10, -10, -10, -10, 0, 0, 0, 0, 0, 0], [
    [3, "flyer_fireleft"],
    [4, "flyer_fireright"],
    [5, "flyer_fireleft"],
    [6, "flyer_fireright"],
    [7, "flyer_fireleft"],
    [8, "flyer_fireright"],
    [9, "flyer_fireleft"],
    [10, "flyer_fireright"]
  ]);
  assert.equal(flyer_move_attack2.endfunc?.name, "flyer_run");
  assertMove("start_melee", flyer_move_start_melee, FRAME_attak101, FRAME_attak106, new Array<number>(6).fill(0), [[0, "flyer_pop_blades"]]);
  assert.equal(flyer_move_start_melee.endfunc?.name, "flyer_loop_melee");
  assertMove("end_melee", flyer_move_end_melee, FRAME_attak119, FRAME_attak121, new Array<number>(3).fill(0));
  assert.equal(flyer_move_end_melee.endfunc?.name, "flyer_run");
  assertMove("loop_melee", flyer_move_loop_melee, FRAME_attak107, FRAME_attak118, new Array<number>(12).fill(0), [
    [2, "flyer_slash_left"],
    [7, "flyer_slash_right"]
  ]);
  assert.equal(flyer_move_loop_melee.endfunc?.name, "flyer_check_melee");
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_flyer"), SP_monster_flyer);
  assert.equal(findGameSaveFunction("flyer_pain"), flyer_pain);
  assert.equal(findGameSaveFunction("flyer_die"), flyer_die);
  assert.equal(findGameSaveFunction("flyer_sight"), flyer_sight);
  assert.equal(findGameSaveMove("flyer_move_stand"), flyer_move_stand);
  assert.equal(findGameSaveMove("flyer_move_attack2"), flyer_move_attack2);
  assert.equal(findGameSaveMove("flyer_move_loop_melee"), flyer_move_loop_melee);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const flyer = createFlyer(runtime, 4);
  const enemy = createEnemy(runtime, 5);

  flyer_stand(flyer);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_stand);
  flyer_walk(flyer);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_walk);
  flyer_run(flyer);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_run);
  flyer.monsterinfo.aiflags |= AI_STAND_GROUND;
  flyer_run(flyer);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_stand);
  flyer_stop(flyer);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_stop);
  flyer_start(flyer);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_start);
  flyer_attack(flyer);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_attack2);
  flyer_melee(flyer);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_start_melee);
  flyer_setstart(flyer);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_start);
  flyer_nextmove(flyer);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_run);

  flyer.enemy = enemy;
  enemy.s.origin = [40, 0, 0];
  withMathRandom([0.5], () => flyer_check_melee(flyer));
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_loop_melee);
  withMathRandom([0.9], () => flyer_check_melee(flyer));
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_end_melee);

  void runtime;
}

function verifySightIdleAndBladeSounds(): void {
  const runtime = createHarnessRuntime();
  const flyer = createFlyer(runtime, 6);
  SP_monster_flyer(flyer, runtime);

  flyer_sight(flyer, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "flyer/flysght1.wav");

  flyer_idle(flyer, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "flyer/flysrch1.wav");

  flyer_pop_blades(flyer, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "flyer/flyatck1.wav");
}

function verifyBlasterAttack(): void {
  const runtime = createHarnessRuntime();
  const flyer = createFlyer(runtime, 7);
  const enemy = createEnemy(runtime, 8);
  enemy.s.origin = [128, 0, 24];
  enemy.origin = [...enemy.s.origin];
  enemy.viewheight = 22;

  SP_monster_flyer(flyer, runtime);
  flyer.s.origin = [0, 0, 0];
  flyer.origin = [...flyer.s.origin];
  flyer.s.angles = [0, 0, 0];
  flyer.angles = [...flyer.s.angles];
  flyer.enemy = enemy;
  flyer.s.frame = 82;

  flyer_fireleft(flyer, runtime);

  const bolt = runtime.entities.find((entity) => entity?.classname === "bolt");
  assert.ok(bolt, "flyer_fireleft should spawn a blaster bolt");
  assert.equal(bolt.owner, flyer);
  assert.equal(bolt.dmg, 1);
  assert.equal((bolt.s.effects & EF_HYPERBLASTER) !== 0, true, "source hyperblaster frames should use EF_HYPERBLASTER");
  assert.equal(runtime.assets.modelPaths[bolt.s.modelindex - 1], "models/objects/laser/tris.md2");

  let flashes = drainMonsterMuzzleFlashEvents(runtime);
  assert.equal(flashes.length, 1, "flyer_fireleft should queue one monster muzzleflash");
  assert.equal(flashes[0].entityIndex, flyer.index);
  assert.equal(flashes[0].flashNumber, 58);
  assert.deepEqual(flashes[0].origin, bolt.s.origin);

  flyer.s.frame = 83;
  flyer_fireright(flyer, runtime);
  flashes = drainMonsterMuzzleFlashEvents(runtime);
  assert.equal(flashes[0].flashNumber, 59);
}

function verifyMeleeAttacks(): void {
  const runtime = createHarnessRuntime();
  const flyer = createFlyer(runtime, 9);
  const enemy = createEnemy(runtime, 10);
  enemy.s.origin = [40, 0, 0];
  enemy.origin = [...enemy.s.origin];
  flyer.enemy = enemy;
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);

  SP_monster_flyer(flyer, runtime);
  flyer_slash_left(flyer, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "flyer/flyatck2.wav");
  assert.equal(enemy.health, 95);

  enemy.health = 100;
  flyer_slash_right(flyer, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "flyer/flyatck2.wav");
  assert.equal(enemy.health, 95);
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const flyer = createFlyer(runtime, 11);
  SP_monster_flyer(flyer, runtime);
  flyer.max_health = 50;
  flyer.health = 20;

  withMathRandom([0], () => flyer_pain(flyer, null, 0, 5, runtime));
  assert.equal(flyer.s.skinnum, 1);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_pain1);

  runtime.time = 4;
  withMathRandom([1 / 0x7fffffff], () => flyer_pain(flyer, null, 0, 5, runtime));
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_pain2);

  runtime.time = 8;
  withMathRandom([2 / 0x7fffffff], () => flyer_pain(flyer, null, 0, 5, runtime));
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_pain3);

  runtime.skill = 3;
  runtime.time = 12;
  flyer.monsterinfo.currentmove = flyer_move_stand;
  flyer_pain(flyer, null, 0, 5, runtime);
  assert.equal(flyer.monsterinfo.currentmove, flyer_move_stand, "nightmare pain should not start a pain animation");
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const flyer = createFlyer(runtime, 12);
  SP_monster_flyer(flyer, runtime);

  flyer_die(flyer, null, null, 20, runtime);

  assert.equal(drainGameSoundEvents(runtime)[0]?.soundPath, "flyer/flydeth1.wav");
  assert.equal(drainGameTempEntityEvents(runtime)[0]?.type, temp_event_t.TE_EXPLOSION1);
  assert.equal(flyer.inuse, false);
}

function verifyJail5MapBugFix(): void {
  const runtime = createHarnessRuntime();
  runtime.mapname = "jail5";
  const flyer = createFlyer(runtime, 13);
  flyer.s.origin = [0, 0, -104];
  flyer.origin = [...flyer.s.origin];
  flyer.target = "old-target";

  SP_monster_flyer(flyer, runtime);

  assert.equal(flyer.targetname, "old-target");
  assert.equal(flyer.target, undefined);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const flyer = createFlyer(runtime, 14);

  SP_monster_flyer(flyer, runtime);

  assert.equal(flyer.inuse, false);
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

function createFlyer(runtime: GameRuntime, index: number): GameEntity {
  const flyer = createRuntimeEntity({ classname: "monster_flyer" }, index);
  runtime.entities[index] = flyer;
  return flyer;
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
