/**
 * File: quake2-m-gladiator.ts
 * Purpose: Verify the initial gameplay port of `game/m_gladiator.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_gladiator behavior.
 *
 * Dependencies:
 * - packages/game/src/m_gladiator.ts
 */

import { strict as assert } from "node:assert";

import type { cvar_t, trace_t, vec3_t } from "../../packages/qcommon/src/index.js";
import {
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
import { createGameMainContext, ReadLevel, WriteLevel } from "../../packages/game/src/g_main.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  FRAME_attack1,
  FRAME_attack9,
  FRAME_death1,
  FRAME_death22,
  FRAME_melee1,
  FRAME_melee17,
  FRAME_pain1,
  FRAME_pain6,
  FRAME_painup1,
  FRAME_painup7,
  FRAME_run1,
  FRAME_run6,
  FRAME_stand1,
  FRAME_stand7,
  FRAME_walk1,
  FRAME_walk16,
  GaldiatorMelee,
  GladiatorGun,
  SP_monster_gladiator,
  gladiator_attack,
  gladiator_cleaver_swing,
  gladiator_dead,
  gladiator_die,
  gladiator_idle,
  gladiator_melee,
  gladiator_move_attack_gun,
  gladiator_move_attack_melee,
  gladiator_move_death,
  gladiator_move_pain,
  gladiator_move_pain_air,
  gladiator_move_run,
  gladiator_move_stand,
  gladiator_move_walk,
  gladiator_pain,
  gladiator_run,
  gladiator_search,
  gladiator_sight,
  gladiator_stand,
  gladiator_walk
} from "../../packages/game/src/m_gladiator.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifyStartupThinkCompletesWalkingMonsterSetup();
  verifySpawnRegistryCallsMonsterGladiator();
  verifyMoveTablesMatchSourceFrames();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifySaveRestoreAfterStartup();
  verifyStateTransitions();
  verifySightSearchIdleSounds();
  verifyMeleeCallbacks();
  verifyRailgunAttack();
  verifyMoveFrameCallbacks();
  verifyPainBranches();
  verifyDeathBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-gladiator: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const gladiator = createGladiator(runtime, 1);

  SP_monster_gladiator(gladiator, runtime);

  assert.equal(gladiator.movetype, MOVETYPE_STEP);
  assert.equal(gladiator.solid, SOLID_BBOX);
  assert.deepEqual(gladiator.mins, [-32, -32, -24]);
  assert.deepEqual(gladiator.maxs, [32, 32, 64]);
  assert.equal(gladiator.health, 400);
  assert.equal(gladiator.gib_health, -175);
  assert.equal(gladiator.mass, 400);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_stand);
  assert.equal(gladiator.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[gladiator.s.modelindex - 1], "models/monsters/gladiatr/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "gladiator/pain.wav",
    "gladiator/gldpain2.wav",
    "gladiator/glddeth2.wav",
    "gladiator/railgun.wav",
    "gladiator/melee1.wav",
    "gladiator/melee2.wav",
    "gladiator/melee3.wav",
    "gladiator/gldidle1.wav",
    "gladiator/gldsrch1.wav",
    "gladiator/sight.wav"
  ]);
  assert.ok(gladiator.think, "walkmonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesWalkingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const gladiator = createGladiator(runtime, 2);

  SP_monster_gladiator(gladiator, runtime);
  gladiator.think!(gladiator, runtime);

  assert.equal(gladiator.yaw_speed, 20);
  assert.equal(gladiator.viewheight, 25);
  assert.equal(gladiator.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(gladiator.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(gladiator.max_health, 400);
  assert.equal(gladiator.think?.name, "monster_think");
  assert.equal(gladiator.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterGladiator(): void {
  const runtime = createHarnessRuntime();
  const gladiator = createGladiator(runtime, 3);

  ED_CallSpawn(gladiator, runtime);

  assert.equal(gladiator.health, 400);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_stand);
}

function verifyMoveTablesMatchSourceFrames(): void {
  assertMove("stand", gladiator_move_stand, FRAME_stand1, FRAME_stand7, new Array<number>(7).fill(0));
  assertMove("walk", gladiator_move_walk, FRAME_walk1, FRAME_walk16, [15, 7, 6, 5, 2, 0, 2, 8, 12, 8, 5, 5, 2, 2, 1, 8]);
  assertMove("run", gladiator_move_run, FRAME_run1, FRAME_run6, [23, 14, 14, 21, 12, 13]);
  assertMove("melee", gladiator_move_attack_melee, FRAME_melee1, FRAME_melee17, new Array<number>(17).fill(0), [
    [4, "gladiator_cleaver_swing"],
    [6, "GaldiatorMelee"],
    [10, "gladiator_cleaver_swing"],
    [13, "GaldiatorMelee"]
  ]);
  assert.equal(gladiator_move_attack_melee.endfunc?.name, "gladiator_run");
  assertMove("gun", gladiator_move_attack_gun, FRAME_attack1, FRAME_attack9, new Array<number>(9).fill(0), [[3, "GladiatorGun"]]);
  assert.equal(gladiator_move_attack_gun.endfunc?.name, "gladiator_run");
  assertMove("pain", gladiator_move_pain, FRAME_pain1, FRAME_pain6, new Array<number>(6).fill(0));
  assertMove("pain_air", gladiator_move_pain_air, FRAME_painup1, FRAME_painup7, new Array<number>(7).fill(0));
  assertMove("death", gladiator_move_death, FRAME_death1, FRAME_death22, new Array<number>(22).fill(0));
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_gladiator"), SP_monster_gladiator);
  assert.equal(findGameSaveFunction("gladiator_pain"), gladiator_pain);
  assert.equal(findGameSaveFunction("gladiator_die"), gladiator_die);
  assert.equal(findGameSaveFunction("gladiator_sight"), gladiator_sight);
  assert.equal(findGameSaveFunction("GladiatorGun"), GladiatorGun);
  assert.equal(findGameSaveMove("gladiator_move_stand"), gladiator_move_stand);
  assert.equal(findGameSaveMove("gladiator_move_attack_gun"), gladiator_move_attack_gun);
  assert.equal(findGameSaveMove("gladiator_move_death"), gladiator_move_death);
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

  const gladiator = createGladiator(writeContext.runtime, 16);
  SP_monster_gladiator(gladiator, writeContext.runtime);
  gladiator.think!(gladiator, writeContext.runtime);
  gladiator.monsterinfo.currentmove = gladiator_move_attack_gun;
  gladiator.s.frame = FRAME_attack1 + 3;

  WriteLevel(writeContext, "save/gladiator-level.sav");

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

  ReadLevel(readContext, "save/gladiator-level.sav");

  const restored = readContext.runtime.entities[16];
  assert.equal(restored?.classname, "monster_gladiator");
  assert.equal(restored?.pain, gladiator_pain);
  assert.equal(restored?.die, gladiator_die);
  assert.equal(restored?.monsterinfo.stand, gladiator_stand);
  assert.equal(restored?.monsterinfo.walk, gladiator_walk);
  assert.equal(restored?.monsterinfo.run, gladiator_run);
  assert.equal(restored?.monsterinfo.attack, gladiator_attack);
  assert.equal(restored?.monsterinfo.melee, gladiator_melee);
  assert.equal(restored?.monsterinfo.sight, gladiator_sight);
  assert.equal(restored?.monsterinfo.idle, gladiator_idle);
  assert.equal(restored?.monsterinfo.search, gladiator_search);
  assert.equal(restored?.monsterinfo.currentmove, gladiator_move_attack_gun);
  assert.ok(linked.includes(16), "ReadLevel must relink restored monster_gladiator");
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const gladiator = createGladiator(runtime, 4);
  void runtime;

  gladiator_stand(gladiator);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_stand);
  gladiator_walk(gladiator);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_walk);
  gladiator_run(gladiator);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_run);
  gladiator.monsterinfo.aiflags |= AI_STAND_GROUND;
  gladiator_run(gladiator);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_stand);
  gladiator_melee(gladiator);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_attack_melee);
}

function verifySightSearchIdleSounds(): void {
  const runtime = createHarnessRuntime();
  const gladiator = createGladiator(runtime, 5);
  SP_monster_gladiator(gladiator, runtime);

  gladiator_sight(gladiator, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gladiator/sight.wav");

  gladiator_search(gladiator, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gladiator/gldsrch1.wav");

  gladiator_idle(gladiator, runtime);
  const idleSound = drainGameSoundEvents(runtime).at(-1);
  assert.equal(idleSound?.soundPath, "gladiator/gldidle1.wav");
  assert.equal(idleSound?.attenuation, 2);
}

function verifyMeleeCallbacks(): void {
  const runtime = createHarnessRuntime();
  const gladiator = createGladiator(runtime, 6);
  const enemy = createEnemy(runtime, 7);
  enemy.s.origin = [40, 0, 0];
  enemy.origin = [...enemy.s.origin];
  gladiator.enemy = enemy;
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);

  SP_monster_gladiator(gladiator, runtime);
  gladiator_cleaver_swing(gladiator, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gladiator/melee1.wav");

  withMathRandom([0], () => GaldiatorMelee(gladiator, runtime));
  assert.equal(enemy.health, 80);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gladiator/melee2.wav");

  enemy.health = 100;
  enemy.s.origin = [200, 0, 0];
  enemy.origin = [...enemy.s.origin];
  GaldiatorMelee(gladiator, runtime);
  assert.equal(enemy.health, 100);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gladiator/melee3.wav");
}

function verifyRailgunAttack(): void {
  const runtime = createHarnessRuntime();
  const gladiator = createGladiator(runtime, 8);
  const enemy = createEnemy(runtime, 9);
  enemy.s.origin = [256, 0, 0];
  enemy.origin = [...enemy.s.origin];
  enemy.viewheight = 22;

  SP_monster_gladiator(gladiator, runtime);
  gladiator.s.origin = [0, 0, 0];
  gladiator.origin = [...gladiator.s.origin];
  gladiator.s.angles = [0, 0, 0];
  gladiator.angles = [...gladiator.s.angles];
  gladiator.enemy = enemy;
  runtime.collision!.trace = (_start, _mins, _maxs, end, passent) => makeTrace(passent === enemy ? null : enemy, end);

  gladiator_attack(gladiator, runtime);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_attack_gun);
  assert.deepEqual(gladiator.pos1, [256, 0, 22]);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gladiator/railgun.wav");

  GladiatorGun(gladiator, runtime);

  assert.equal(enemy.health, 50);
  const flashes = drainMonsterMuzzleFlashEvents(runtime);
  assert.equal(flashes.length, 1);
  assert.equal(flashes[0].entityIndex, gladiator.index);
  assert.equal(flashes[0].flashNumber, 61);

  enemy.s.origin = [60, 0, 0];
  enemy.origin = [...enemy.s.origin];
  gladiator.monsterinfo.currentmove = gladiator_move_stand;
  gladiator_attack(gladiator, runtime);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_stand, "safe-zone target should suppress railgun attack");
}

function verifyMoveFrameCallbacks(): void {
  const runtime = createHarnessRuntime();
  const gladiator = createGladiator(runtime, 10);
  const enemy = createEnemy(runtime, 11);
  enemy.s.origin = [40, 0, 0];
  enemy.origin = [...enemy.s.origin];
  gladiator.enemy = enemy;

  SP_monster_gladiator(gladiator, runtime);
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);

  gladiator.monsterinfo.currentmove = gladiator_move_attack_melee;
  gladiator.s.frame = FRAME_melee1 + 3;
  M_MoveFrame(gladiator, runtime);
  assert.equal(gladiator.s.frame, FRAME_melee1 + 4);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gladiator/melee1.wav");

  gladiator.s.frame = FRAME_melee1 + 5;
  withMathRandom([0], () => M_MoveFrame(gladiator, runtime));
  assert.equal(gladiator.s.frame, FRAME_melee1 + 6);
  assert.equal(enemy.health, 80);

  gladiator.monsterinfo.currentmove = gladiator_move_attack_gun;
  gladiator.s.frame = FRAME_attack9;
  M_MoveFrame(gladiator, runtime);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_run);
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const gladiator = createGladiator(runtime, 12);
  SP_monster_gladiator(gladiator, runtime);
  gladiator.max_health = 400;
  gladiator.health = 150;

  withMathRandom([0.25], () => gladiator_pain(gladiator, null, 0, 20, runtime));
  assert.equal(gladiator.s.skinnum, 1);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_pain);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gladiator/pain.wav");

  runtime.time = 1;
  gladiator.velocity[2] = 150;
  gladiator_pain(gladiator, null, 0, 20, runtime);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_pain_air);

  runtime.time = 4;
  withMathRandom([0.75], () => gladiator_pain(gladiator, null, 0, 20, runtime));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gladiator/gldpain2.wav");
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_pain_air);

  runtime.skill = 3;
  runtime.time = 8;
  gladiator.velocity[2] = 0;
  gladiator.monsterinfo.currentmove = gladiator_move_stand;
  gladiator_pain(gladiator, null, 0, 20, runtime);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_stand, "nightmare pain should not start a pain animation");
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const gladiator = createGladiator(runtime, 13);
  SP_monster_gladiator(gladiator, runtime);

  gladiator_die(gladiator, null, null, 60, runtime);
  assert.equal(gladiator.deadflag, DEAD_DEAD);
  assert.equal(gladiator.takedamage, damage_t.DAMAGE_YES);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_death);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "gladiator/glddeth2.wav");

  gladiator.monsterinfo.currentmove = gladiator_move_stand;
  gladiator_die(gladiator, null, null, 60, runtime);
  assert.equal(gladiator.monsterinfo.currentmove, gladiator_move_stand, "already-dead gladiator should ignore repeated death calls");

  gladiator_dead(gladiator, runtime);
  assert.deepEqual(gladiator.mins, [-16, -16, -24]);
  assert.deepEqual(gladiator.maxs, [16, 16, -8]);
  assert.equal(gladiator.movetype, MOVETYPE_TOSS);
  assert.equal(gladiator.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
  assert.equal(gladiator.nextthink, 0);

  const gibGladiator = createGladiator(runtime, 14);
  SP_monster_gladiator(gibGladiator, runtime);
  gibGladiator.health = -175;
  gladiator_die(gibGladiator, null, null, 25, runtime);
  assert.equal(gibGladiator.deadflag, DEAD_DEAD);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/bone/tris.md2").length, 2);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2").length, 4);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/head2/tris.md2").length, 1);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const gladiator = createGladiator(runtime, 15);

  SP_monster_gladiator(gladiator, runtime);

  assert.equal(gladiator.inuse, false);
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

function createGladiator(runtime: GameRuntime, index: number): GameEntity {
  const gladiator = createRuntimeEntity({ classname: "monster_gladiator" }, index);
  runtime.entities[index] = gladiator;
  return gladiator;
}

function createEnemy(runtime: GameRuntime, index: number): GameEntity {
  const enemy = createRuntimeEntity({ classname: "target_dummy" }, index);
  enemy.inuse = true;
  enemy.health = 100;
  enemy.max_health = 100;
  enemy.takedamage = damage_t.DAMAGE_YES;
  enemy.svflags |= SVF_MONSTER;
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
