/**
 * File: quake2-m-hover.ts
 * Purpose: Verify the initial gameplay port of `game/m_hover.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_hover behavior.
 *
 * Dependencies:
 * - packages/game/src/m_hover.ts
 */

import { strict as assert } from "node:assert";

import { EF_HYPERBLASTER, type vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_STAND_GROUND,
  DEAD_DEAD,
  FRAMETIME,
  MOVETYPE_STEP,
  MOVETYPE_TOSS,
  SOLID_BBOX,
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
import { FL_FLY } from "../../packages/game/src/g_local.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  FRAME_attak101,
  FRAME_attak103,
  FRAME_attak104,
  FRAME_attak106,
  FRAME_attak107,
  FRAME_attak108,
  FRAME_backwd01,
  FRAME_backwd24,
  FRAME_death101,
  FRAME_death111,
  FRAME_forwrd01,
  FRAME_forwrd35,
  FRAME_land01,
  FRAME_pain101,
  FRAME_pain128,
  FRAME_pain201,
  FRAME_pain212,
  FRAME_pain301,
  FRAME_pain309,
  FRAME_stand01,
  FRAME_stand30,
  FRAME_stop101,
  FRAME_stop109,
  FRAME_stop201,
  FRAME_stop208,
  FRAME_takeof01,
  FRAME_takeof30,
  SP_monster_hover,
  hover_attack,
  hover_dead,
  hover_deadthink,
  hover_die,
  hover_fire_blaster,
  hover_move_attack1,
  hover_move_backward,
  hover_move_death1,
  hover_move_end_attack,
  hover_move_forward,
  hover_move_land,
  hover_move_pain1,
  hover_move_pain2,
  hover_move_pain3,
  hover_move_run,
  hover_move_stand,
  hover_move_start_attack,
  hover_move_stop1,
  hover_move_stop2,
  hover_move_takeoff,
  hover_move_walk,
  hover_pain,
  hover_reattack,
  hover_run,
  hover_search,
  hover_sight,
  hover_stand,
  hover_start_attack,
  hover_walk
} from "../../packages/game/src/m_hover.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsFlying();
  verifyStartupThinkCompletesFlyingMonsterSetup();
  verifySpawnRegistryCallsMonsterHover();
  verifyMoveTablesMatchSourceFrames();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyStateTransitions();
  verifySightSearchSounds();
  verifyBlasterAttack();
  verifyPainBranches();
  verifyDeathBranches();
  verifyDeadthinkBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-hover: ok");
}

function verifySpawnRegistersAssetsAndStartsFlying(): void {
  const runtime = createHarnessRuntime();
  const hover = createHover(runtime, 1);

  SP_monster_hover(hover, runtime);

  assert.equal(hover.movetype, MOVETYPE_STEP);
  assert.equal(hover.solid, SOLID_BBOX);
  assert.deepEqual(hover.mins, [-24, -24, -24]);
  assert.deepEqual(hover.maxs, [24, 24, 32]);
  assert.equal(hover.health, 240);
  assert.equal(hover.gib_health, -100);
  assert.equal(hover.mass, 150);
  assert.equal(hover.flags & FL_FLY, FL_FLY);
  assert.equal(hover.monsterinfo.currentmove, hover_move_stand);
  assert.equal(hover.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[hover.s.modelindex - 1], "models/monsters/hover/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "hover/hovpain1.wav",
    "hover/hovpain2.wav",
    "hover/hovdeth1.wav",
    "hover/hovdeth2.wav",
    "hover/hovsght1.wav",
    "hover/hovsrch1.wav",
    "hover/hovsrch2.wav",
    "hover/hovatck1.wav",
    "hover/hovidle1.wav"
  ]);
  assert.equal(runtime.assets.soundPaths[hover.s.sound - 1], "hover/hovidle1.wav");
  assert.ok(hover.think, "flymonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesFlyingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const hover = createHover(runtime, 2);

  SP_monster_hover(hover, runtime);
  hover.think!(hover, runtime);

  assert.equal(hover.yaw_speed, 10);
  assert.equal(hover.viewheight, 25);
  assert.equal(hover.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(hover.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(hover.max_health, 240);
  assert.equal(hover.think?.name, "monster_think");
  assert.equal(hover.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterHover(): void {
  const runtime = createHarnessRuntime();
  const hover = createHover(runtime, 3);

  ED_CallSpawn(hover, runtime);

  assert.equal(hover.health, 240);
  assert.equal(hover.monsterinfo.currentmove, hover_move_stand);
}

function verifyMoveTablesMatchSourceFrames(): void {
  assertMove("stand", hover_move_stand, FRAME_stand01, FRAME_stand30, new Array<number>(30).fill(0));
  assertMove("stop1", hover_move_stop1, FRAME_stop101, FRAME_stop109, new Array<number>(9).fill(0));
  assertMove("stop2", hover_move_stop2, FRAME_stop201, FRAME_stop208, new Array<number>(8).fill(0));
  assertMove("takeoff", hover_move_takeoff, FRAME_takeof01, FRAME_takeof30, [
    0, -2, 5, -1, 1, 0, 0, -1, -1, -1,
    0, 2, 2, 1, 1, -6, -9, 1, 0, 2,
    2, 1, 1, 1, 2, 0, 2, 3, 2, 0
  ]);
  assertMove("pain3", hover_move_pain3, FRAME_pain301, FRAME_pain309, new Array<number>(9).fill(0));
  assert.equal(hover_move_pain3.endfunc?.name, "hover_run");
  assertMove("pain2", hover_move_pain2, FRAME_pain201, FRAME_pain212, new Array<number>(12).fill(0));
  assert.equal(hover_move_pain2.endfunc?.name, "hover_run");
  assertMove("pain1", hover_move_pain1, FRAME_pain101, FRAME_pain128, [
    0, 0, 2, -8, -4, -6, -4, -3, 1, 0, 0, 0, 3, 1,
    0, 2, 3, 2, 7, 1, 0, 0, 2, 0, 0, 5, 3, 4
  ]);
  assert.equal(hover_move_pain1.endfunc?.name, "hover_run");
  assertMove("land", hover_move_land, FRAME_land01, FRAME_land01, [0]);
  assertMove("forward", hover_move_forward, FRAME_forwrd01, FRAME_forwrd35, new Array<number>(35).fill(0));
  assertMove("walk", hover_move_walk, FRAME_forwrd01, FRAME_forwrd35, new Array<number>(35).fill(4));
  assertMove("run", hover_move_run, FRAME_forwrd01, FRAME_forwrd35, new Array<number>(35).fill(10));
  assertMove("death1", hover_move_death1, FRAME_death101, FRAME_death111, [0, 0, 0, 0, 0, 0, -10, 3, 5, 4, 7]);
  assert.equal(hover_move_death1.endfunc?.name, "hover_dead");
  assertMove("backward", hover_move_backward, FRAME_backwd01, FRAME_backwd24, new Array<number>(24).fill(0));
  assertMove("start_attack", hover_move_start_attack, FRAME_attak101, FRAME_attak103, [1, 1, 1]);
  assert.equal(hover_move_start_attack.endfunc?.name, "hover_attack");
  assertMove("attack1", hover_move_attack1, FRAME_attak104, FRAME_attak106, [-10, -10, 0], [
    [0, "hover_fire_blaster"],
    [1, "hover_fire_blaster"],
    [2, "hover_reattack"]
  ]);
  assertMove("end_attack", hover_move_end_attack, FRAME_attak107, FRAME_attak108, [1, 1]);
  assert.equal(hover_move_end_attack.endfunc?.name, "hover_run");
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_hover"), SP_monster_hover);
  assert.equal(findGameSaveFunction("hover_pain"), hover_pain);
  assert.equal(findGameSaveFunction("hover_die"), hover_die);
  assert.equal(findGameSaveFunction("hover_deadthink"), hover_deadthink);
  assert.equal(findGameSaveMove("hover_move_stand"), hover_move_stand);
  assert.equal(findGameSaveMove("hover_move_attack1"), hover_move_attack1);
  assert.equal(findGameSaveMove("hover_move_death1"), hover_move_death1);
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const hover = createHover(runtime, 4);

  hover_stand(hover);
  assert.equal(hover.monsterinfo.currentmove, hover_move_stand);
  hover_walk(hover);
  assert.equal(hover.monsterinfo.currentmove, hover_move_walk);
  hover_run(hover);
  assert.equal(hover.monsterinfo.currentmove, hover_move_run);
  hover.monsterinfo.aiflags |= AI_STAND_GROUND;
  hover_run(hover);
  assert.equal(hover.monsterinfo.currentmove, hover_move_stand);
  hover_start_attack(hover);
  assert.equal(hover.monsterinfo.currentmove, hover_move_start_attack);
  hover_attack(hover);
  assert.equal(hover.monsterinfo.currentmove, hover_move_attack1);

  const enemy = createRuntimeEntity({ classname: "player" }, 5);
  runtime.entities[5] = enemy;
  enemy.health = 100;
  hover.enemy = enemy;

  withMathRandom([0.5], () => hover_reattack(hover, runtime));
  assert.equal(hover.monsterinfo.currentmove, hover_move_attack1);
  enemy.health = 0;
  hover_reattack(hover, runtime);
  assert.equal(hover.monsterinfo.currentmove, hover_move_end_attack);
}

function verifySightSearchSounds(): void {
  const runtime = createHarnessRuntime();
  const hover = createHover(runtime, 11);
  SP_monster_hover(hover, runtime);

  hover_sight(hover, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "hover/hovsght1.wav");

  withMathRandom([0.25], () => hover_search(hover, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "hover/hovsrch1.wav");

  withMathRandom([0.75], () => hover_search(hover, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "hover/hovsrch2.wav");
}

function verifyBlasterAttack(): void {
  const runtime = createHarnessRuntime();
  const hover = createHover(runtime, 12);
  const enemy = createRuntimeEntity({ classname: "player" }, 13);
  runtime.entities[13] = enemy;
  enemy.s.origin = [128, 0, 24];
  enemy.origin = [...enemy.s.origin];
  enemy.viewheight = 22;

  SP_monster_hover(hover, runtime);
  hover.s.origin = [0, 0, 0];
  hover.origin = [...hover.s.origin];
  hover.s.angles = [0, 0, 0];
  hover.angles = [...hover.s.angles];
  hover.enemy = enemy;
  hover.s.frame = FRAME_attak104;

  hover_fire_blaster(hover, runtime);

  const bolt = runtime.entities.find((entity) => entity?.classname === "bolt");
  assert.ok(bolt, "hover_fire_blaster should spawn a blaster bolt");
  assert.equal(bolt.owner, hover);
  assert.equal(bolt.dmg, 1);
  assert.equal((bolt.s.effects & EF_HYPERBLASTER) !== 0, true, "first hover blaster frame should use EF_HYPERBLASTER");
  assert.equal(runtime.assets.modelPaths[bolt.s.modelindex - 1], "models/objects/laser/tris.md2");
  assert.equal(runtime.assets.soundPaths[bolt.s.sound - 1], "misc/lasfly.wav");

  const flashes = drainMonsterMuzzleFlashEvents(runtime);
  assert.equal(flashes.length, 1, "hover_fire_blaster should queue one monster muzzleflash");
  assert.equal(flashes[0].entityIndex, hover.index);
  assert.equal(flashes[0].flashNumber, 62);
  assert.deepEqual(flashes[0].origin, bolt.s.origin);
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const hover = createHover(runtime, 6);
  SP_monster_hover(hover, runtime);
  hover.max_health = 240;
  hover.health = 100;

  withMathRandom([0.25], () => hover_pain(hover, null, 0, 20, runtime));
  assert.equal(hover.s.skinnum, 1);
  assert.equal(hover.monsterinfo.currentmove, hover_move_pain3);

  runtime.time = 4;
  withMathRandom([0.75], () => hover_pain(hover, null, 0, 20, runtime));
  assert.equal(hover.monsterinfo.currentmove, hover_move_pain2);

  runtime.time = 8;
  hover_pain(hover, null, 0, 30, runtime);
  assert.equal(hover.monsterinfo.currentmove, hover_move_pain1);
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const hover = createHover(runtime, 7);
  SP_monster_hover(hover, runtime);

  withMathRandom([0.25], () => hover_die(hover, null, null, 10, runtime));
  assert.equal(hover.deadflag, DEAD_DEAD);
  assert.equal(hover.takedamage, damage_t.DAMAGE_YES);
  assert.equal(hover.monsterinfo.currentmove, hover_move_death1);

  const gibHover = createHover(runtime, 8);
  SP_monster_hover(gibHover, runtime);
  gibHover.health = -100;
  hover_die(gibHover, null, null, 50, runtime);
  assert.equal(gibHover.deadflag, DEAD_DEAD);
}

function verifyDeadthinkBranches(): void {
  const runtime = createHarnessRuntime();
  const hover = createHover(runtime, 9);
  SP_monster_hover(hover, runtime);
  hover_dead(hover, runtime);

  assert.equal(hover.movetype, MOVETYPE_TOSS);
  assert.deepEqual(hover.mins, [-16, -16, -24]);
  assert.deepEqual(hover.maxs, [16, 16, -8]);
  assert.equal(hover.think, hover_deadthink);
  assert.equal(hover.nextthink, runtime.time + FRAMETIME);
  assert.equal(hover.timestamp, runtime.time + 15);

  hover.nextthink = 0;
  hover_deadthink(hover, runtime);
  assert.equal(hover.nextthink, runtime.time + FRAMETIME);

  runtime.time = 16;
  hover_deadthink(hover, runtime);
  assert.equal(hover.inuse, false);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const hover = createHover(runtime, 10);

  SP_monster_hover(hover, runtime);

  assert.equal(hover.inuse, false);
}

function createHarnessRuntime(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([
    { properties: { classname: "worldspawn" } }
  ]);
  runtime.collision = {
    world: {} as never,
    trace: (_start: vec3_t, _mins: vec3_t, _maxs: vec3_t, end: vec3_t) => ({
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [...end],
      plane: {
        normal: [0, 0, 1],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: 0,
      ent: null
    }),
    pointcontents: () => 0
  };
  return runtime;
}

function createHover(runtime: GameRuntime, index: number): GameEntity {
  const hover = createRuntimeEntity({ classname: "monster_hover" }, index);
  runtime.entities[index] = hover;
  return hover;
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
