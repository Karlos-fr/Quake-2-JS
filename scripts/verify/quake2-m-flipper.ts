/**
 * File: quake2-m-flipper.ts
 * Purpose: Verify the initial gameplay port of `game/m_flipper.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_flipper behavior.
 *
 * Dependencies:
 * - packages/game/src/m_flipper.ts
 */

import { strict as assert } from "node:assert";

import type { trace_t, vec3_t } from "../../packages/qcommon/src/index.js";
import type { cvar_t } from "../../packages/qcommon/src/index.js";
import {
  DEAD_DEAD,
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
  M_MoveFrame,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { FL_SWIM } from "../../packages/game/src/g-local.js";
import {
  FRAME_flpbit01,
  FRAME_flpbit20,
  FRAME_flpdth01,
  FRAME_flpdth56,
  FRAME_flphor01,
  FRAME_flphor05,
  FRAME_flphor24,
  FRAME_flppn101,
  FRAME_flppn105,
  FRAME_flppn201,
  FRAME_flppn205,
  FRAME_flpver01,
  FRAME_flpver06,
  FRAME_flpver29,
  SP_monster_flipper,
  flipper_bite,
  flipper_dead,
  flipper_die,
  flipper_melee,
  flipper_move_attack,
  flipper_move_death,
  flipper_move_pain1,
  flipper_move_pain2,
  flipper_move_run_loop,
  flipper_move_run_start,
  flipper_move_stand,
  flipper_move_start_run,
  flipper_move_walk,
  flipper_pain,
  flipper_preattack,
  flipper_run,
  flipper_run_loop,
  flipper_sight,
  flipper_stand,
  flipper_start_run,
  flipper_walk
} from "../../packages/game/src/m_flipper.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import { createGameMainContext, ReadLevel, WriteLevel } from "../../packages/game/src/g_main.js";
import type { GameMonsterFrame, GameMonsterMove } from "../../packages/game/src/runtime.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsSwimming();
  verifyStartupThinkCompletesSwimmingMonsterSetup();
  verifySpawnRegistryCallsMonsterFlipper();
  verifyMoveTablesMatchSourceFrames();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifySaveRestoreAfterStartup();
  verifyStateTransitions();
  verifyAttackCallbacks();
  verifyMoveFrameCallbacks();
  verifyPainBranches();
  verifyDeathBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-flipper: ok");
}

function verifySpawnRegistersAssetsAndStartsSwimming(): void {
  const runtime = createHarnessRuntime();
  const flipper = createFlipper(runtime, 1);

  SP_monster_flipper(flipper, runtime);

  assert.equal(flipper.movetype, MOVETYPE_STEP);
  assert.equal(flipper.solid, SOLID_BBOX);
  assert.deepEqual(flipper.mins, [-16, -16, 0]);
  assert.deepEqual(flipper.maxs, [16, 16, 32]);
  assert.equal(flipper.health, 50);
  assert.equal(flipper.gib_health, -30);
  assert.equal(flipper.mass, 100);
  assert.equal(flipper.flags & FL_SWIM, FL_SWIM);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_stand);
  assert.equal(flipper.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[flipper.s.modelindex - 1], "models/monsters/flipper/tris.md2");
  assert.ok(runtime.assets.soundPaths.includes("flipper/flppain1.wav"));
  assert.ok(runtime.assets.soundPaths.includes("flipper/flpsght1.wav"));
  assert.ok(flipper.think, "swimmonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesSwimmingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const flipper = createFlipper(runtime, 10);

  SP_monster_flipper(flipper, runtime);
  assert.ok(flipper.think, "swimmonster_start should arm startup think");
  flipper.think!(flipper, runtime);

  assert.equal(flipper.yaw_speed, 10);
  assert.equal(flipper.viewheight, 10);
  assert.equal(flipper.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(flipper.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(flipper.max_health, 50);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_stand);
  assert.equal(flipper.think?.name, "monster_think");
  assert.equal(flipper.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterFlipper(): void {
  const runtime = createHarnessRuntime();
  const flipper = createFlipper(runtime, 2);

  ED_CallSpawn(flipper, runtime);

  assert.equal(flipper.health, 50);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_stand);
}

function verifyMoveTablesMatchSourceFrames(): void {
  assertMove("stand", flipper_move_stand, FRAME_flphor01, FRAME_flphor01, [0]);
  assertMove("run_loop", flipper_move_run_loop, FRAME_flpver06, FRAME_flpver29, new Array<number>(24).fill(24));
  assertMove("run_start", flipper_move_run_start, FRAME_flpver01, FRAME_flpver06, [8, 8, 8, 8, 8, 8]);
  assert.equal(flipper_move_run_start.endfunc?.name, "flipper_run_loop");
  assertMove("walk", flipper_move_walk, FRAME_flphor01, FRAME_flphor24, new Array<number>(24).fill(4));
  assertMove("start_run", flipper_move_start_run, FRAME_flphor01, FRAME_flphor05, [8, 8, 8, 8, 8], [[4, "flipper_run"]]);
  assertMove("pain2", flipper_move_pain2, FRAME_flppn101, FRAME_flppn105, new Array<number>(5).fill(0));
  assertMove("pain1", flipper_move_pain1, FRAME_flppn201, FRAME_flppn205, new Array<number>(5).fill(0));
  assertMove("attack", flipper_move_attack, FRAME_flpbit01, FRAME_flpbit20, new Array<number>(20).fill(0), [
    [0, "flipper_preattack"],
    [13, "flipper_bite"],
    [18, "flipper_bite"]
  ]);
  assertMove("death", flipper_move_death, FRAME_flpdth01, FRAME_flpdth56, new Array<number>(56).fill(0));
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_flipper"), SP_monster_flipper);
  assert.equal(findGameSaveFunction("flipper_pain"), flipper_pain);
  assert.equal(findGameSaveFunction("flipper_die"), flipper_die);
  assert.equal(findGameSaveFunction("flipper_sight"), flipper_sight);
  assert.equal(findGameSaveFunction("flipper_start_run"), flipper_start_run);
  assert.equal(findGameSaveMove("flipper_move_stand"), flipper_move_stand);
  assert.equal(findGameSaveMove("flipper_move_attack"), flipper_move_attack);
  assert.equal(findGameSaveMove("flipper_move_death"), flipper_move_death);
}

function verifySaveRestoreAfterStartup(): void {
  const files = new Map<string, string>();
  const linked: number[] = [];
  const writeContext = createGameMainContext(createGameImports(linked), {
    hooks: {
      readFile: (path) => files.get(path) ?? null,
      writeFile: (path, contents) => {
        files.set(path, contents);
        return true;
      }
    }
  });
  writeContext.runtime = createHarnessRuntime();
  writeContext.runtime.maxclients = 0;
  writeContext.runtime.maxentities = 64;
  writeContext.game.maxclients = 0;
  writeContext.game.maxentities = 64;

  const flipper = createFlipper(writeContext.runtime, 11);
  SP_monster_flipper(flipper, writeContext.runtime);
  flipper.think!(flipper, writeContext.runtime);
  flipper.monsterinfo.currentmove = flipper_move_attack;
  flipper.s.frame = FRAME_flpbit01 + 13;

  WriteLevel(writeContext, "save/flipper-level.sav");

  const readContext = createGameMainContext(createGameImports(linked), {
    hooks: {
      readFile: (path) => files.get(path) ?? null,
      writeFile: (path, contents) => {
        files.set(path, contents);
        return true;
      }
    }
  });
  readContext.runtime.maxclients = 0;
  readContext.runtime.maxentities = 64;

  ReadLevel(readContext, "save/flipper-level.sav");

  const restored = readContext.runtime.entities[11];
  assert.equal(restored?.classname, "monster_flipper");
  assert.equal(restored?.pain, flipper_pain);
  assert.equal(restored?.die, flipper_die);
  assert.equal(restored?.monsterinfo.stand, flipper_stand);
  assert.equal(restored?.monsterinfo.walk, flipper_walk);
  assert.equal(restored?.monsterinfo.run, flipper_start_run);
  assert.equal(restored?.monsterinfo.melee, flipper_melee);
  assert.equal(restored?.monsterinfo.sight, flipper_sight);
  assert.equal(restored?.monsterinfo.currentmove, flipper_move_attack);
  assert.ok(linked.includes(11), "ReadLevel must relink restored monster_flipper");
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const flipper = createFlipper(runtime, 3);
  void runtime;

  flipper_stand(flipper);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_stand);
  flipper_walk(flipper);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_walk);
  flipper_start_run(flipper);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_start_run);
  flipper_run(flipper);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_run_start);
  flipper_run_loop(flipper);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_run_loop);
  flipper_melee(flipper);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_attack);
}

function verifyAttackCallbacks(): void {
  const runtime = createHarnessRuntime();
  const flipper = createFlipper(runtime, 6);
  const enemy = createRuntimeEntity({ classname: "target_dummy" }, 7);
  enemy.inuse = true;
  enemy.health = 20;
  enemy.takedamage = 1;
  enemy.s.origin = [40, 0, 0];
  enemy.origin = [40, 0, 0];
  runtime.entities[7] = enemy;
  flipper.enemy = enemy;

  SP_monster_flipper(flipper, runtime);
  runtime.collision = {
    world: {} as never,
    trace: () => makeTrace(enemy),
    pointcontents: () => 0
  };

  flipper_preattack(flipper, runtime);
  const preattackSound = drainGameSoundEvents(runtime).at(-1);
  assert.equal(preattackSound?.soundPath, "flipper/flpatck1.wav");
  assert.equal(preattackSound?.channel, 1);

  flipper_bite(flipper, runtime);
  assert.equal(enemy.health, 15);
}

function verifyMoveFrameCallbacks(): void {
  const runtime = createHarnessRuntime();
  const flipper = createFlipper(runtime, 8);
  const enemy = createRuntimeEntity({ classname: "target_dummy" }, 9);
  enemy.inuse = true;
  enemy.health = 20;
  enemy.takedamage = 1;
  enemy.s.origin = [40, 0, 0];
  enemy.origin = [40, 0, 0];
  runtime.entities[9] = enemy;
  flipper.enemy = enemy;

  SP_monster_flipper(flipper, runtime);
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => makeTrace(enemy, end),
    pointcontents: () => 0
  };

  flipper.monsterinfo.currentmove = flipper_move_attack;
  flipper.s.frame = FRAME_flpbit01 - 1;
  M_MoveFrame(flipper, runtime);
  assert.equal(flipper.s.frame, FRAME_flpbit01);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "flipper/flpatck1.wav");

  flipper.s.frame = FRAME_flpbit01 + 12;
  M_MoveFrame(flipper, runtime);
  assert.equal(flipper.s.frame, FRAME_flpbit01 + 13);
  assert.equal(enemy.health, 15);

  flipper.monsterinfo.currentmove = flipper_move_run_start;
  flipper.s.frame = FRAME_flpver06;
  M_MoveFrame(flipper, runtime);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_run_loop);
  assert.equal(flipper.s.frame, FRAME_flpver06 + 1);
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const flipper = createFlipper(runtime, 4);
  SP_monster_flipper(flipper, runtime);

  flipper.health = 20;
  withMathRandom([1.5 / 0x7fffffff], () => flipper_pain(flipper, null, 0, 5, runtime));
  assert.equal(flipper.s.skinnum, 1);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_pain1);

  runtime.time = 4;
  withMathRandom([0], () => flipper_pain(flipper, null, 0, 5, runtime));
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_pain2);

  flipper_sight(flipper, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "flipper/flpsght1.wav");

  runtime.skill = 3;
  runtime.time = 8;
  flipper.monsterinfo.currentmove = flipper_move_stand;
  flipper_pain(flipper, null, 0, 5, runtime);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_stand, "nightmare pain should not start a pain animation");
  assert.equal(flipper.pain_debounce_time, 11, "nightmare pain should still debounce before returning");
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const flipper = createFlipper(runtime, 12);
  SP_monster_flipper(flipper, runtime);

  flipper.health = 1;
  flipper_die(flipper, null, null, 25, runtime);
  assert.equal(flipper.deadflag, DEAD_DEAD);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_death);

  flipper.monsterinfo.currentmove = flipper_move_stand;
  flipper_die(flipper, null, null, 25, runtime);
  assert.equal(flipper.monsterinfo.currentmove, flipper_move_stand, "already-dead flipper should ignore repeated death calls");

  flipper_dead(flipper, runtime);
  assert.deepEqual(flipper.mins, [-16, -16, -24]);
  assert.deepEqual(flipper.maxs, [16, 16, -8]);
  assert.equal(flipper.movetype, MOVETYPE_TOSS);
  assert.equal(flipper.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
  assert.equal(flipper.nextthink, 0);

  const gibRuntime = createHarnessRuntime();
  const gibFlipper = createFlipper(gibRuntime, 13);
  SP_monster_flipper(gibFlipper, gibRuntime);
  gibFlipper.health = -30;
  gibFlipper.gib_health = -30;
  gibFlipper.size = [32, 32, 32];
  gibFlipper.absmin = [-16, -16, 0];
  gibFlipper.velocity = [0, 0, 0];

  flipper_die(gibFlipper, null, null, 25, gibRuntime);

  assert.equal(gibFlipper.deadflag, DEAD_DEAD);
  assert.equal(drainGameSoundEvents(gibRuntime)[0]?.soundPath, "misc/udeath.wav");
  assert.equal(gibRuntime.entities.filter((entity) => entity.model === "models/objects/gibs/bone/tris.md2").length, 2);
  assert.equal(gibRuntime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2").length, 3);
  assert.equal(gibFlipper.svflags & SVF_MONSTER, 0, "ThrowHead should clear the monster server flag on gib death");
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const flipper = createFlipper(runtime, 20);

  SP_monster_flipper(flipper, runtime);

  assert.equal(flipper.inuse, false);
}

function createHarnessRuntime(): GameRuntime {
  return createGameRuntimeFromBspEntities([
    { properties: { classname: "worldspawn" } }
  ]);
}

function createGameImports(linked: number[] = []) {
  const cvars = new Map<string, cvar_t>();
  return {
    bprintf: () => {},
    dprintf: () => {},
    cprintf: () => {},
    centerprintf: () => {},
    sound: () => {},
    positioned_sound: () => {},
    configstring: () => {},
    error: (fmt: string, ...args: unknown[]) => {
      throw new Error(formatPrintf(fmt, args));
    },
    modelindex: () => 0,
    soundindex: () => 0,
    imageindex: () => 0,
    setmodel: () => {},
    trace: () => {
      throw new Error("trace should not be used in this harness");
    },
    pointcontents: () => 0,
    inPVS: () => false,
    inPHS: () => false,
    SetAreaPortalState: () => {},
    AreasConnected: () => false,
    linkentity: (ent: GameEntity) => {
      linked.push(ent.index);
    },
    unlinkentity: () => {},
    BoxEdicts: () => 0,
    Pmove: () => {},
    multicast: () => {},
    unicast: () => {},
    WriteChar: () => {},
    WriteByte: () => {},
    WriteShort: () => {},
    WriteLong: () => {},
    WriteFloat: () => {},
    WriteString: () => {},
    WritePosition: () => {},
    WriteDir: () => {},
    WriteAngle: () => {},
    TagMalloc: () => ({}),
    TagFree: () => {},
    FreeTags: () => {},
    cvar: (name: string, value: string) => {
      let variable = cvars.get(name);
      if (!variable) {
        variable = createCvar(name, value);
        cvars.set(name, variable);
      }
      return variable;
    },
    cvar_set: () => null,
    cvar_forceset: () => null,
    argc: () => 0,
    argv: () => "",
    args: () => "",
    AddCommandString: () => {},
    DebugGraph: () => {}
  };
}

function createFlipper(runtime: GameRuntime, index: number): GameEntity {
  const flipper = createRuntimeEntity({ classname: "monster_flipper" }, index);
  runtime.entities[index] = flipper;
  return flipper;
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

function createCvar(name: string, stringValue: string): cvar_t {
  const numericValue = Number(stringValue);
  return {
    name,
    string: stringValue,
    latched_string: null,
    flags: 0,
    modified: false,
    value: Number.isFinite(numericValue) ? numericValue : 0
  };
}

function formatPrintf(fmt: string, args: unknown[]): string {
  let index = 0;
  return fmt.replace(/%s|%d|%i|%f/g, () => String(args[index++] ?? ""));
}
