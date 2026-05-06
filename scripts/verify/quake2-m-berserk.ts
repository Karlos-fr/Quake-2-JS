/**
 * File: quake2-m-berserk.ts
 * Purpose: Verify the initial gameplay port of `game/m_berserk.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_berserk behavior.
 *
 * Dependencies:
 * - packages/game/src/m_berserk.ts
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
  type GameEntity,
  type GameMonsterFrame,
  type GameMonsterMove,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { G_RunFrame, createGameMainContext, ReadLevel, WriteLevel } from "../../packages/game/src/g_main.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  FRAME_att_c1,
  FRAME_att_c8,
  FRAME_att_c9,
  FRAME_att_c20,
  FRAME_att_c21,
  FRAME_att_c34,
  FRAME_death1,
  FRAME_death13,
  FRAME_deathc1,
  FRAME_deathc8,
  FRAME_painb1,
  FRAME_painb20,
  FRAME_painc1,
  FRAME_painc4,
  FRAME_run1,
  FRAME_run6,
  FRAME_stand1,
  FRAME_stand5,
  FRAME_standb1,
  FRAME_standb20,
  FRAME_walkc1,
  FRAME_walkc11,
  SP_monster_berserk,
  berserk_dead,
  berserk_die,
  berserk_fidget,
  berserk_melee,
  berserk_move_attack_club,
  berserk_move_attack_spike,
  berserk_move_attack_strike,
  berserk_move_death1,
  berserk_move_death2,
  berserk_move_pain1,
  berserk_move_pain2,
  berserk_move_run1,
  berserk_move_stand,
  berserk_move_stand_fidget,
  berserk_move_walk,
  berserk_pain,
  berserk_run,
  berserk_search,
  berserk_sight,
  berserk_stand,
  berserk_walk
} from "../../packages/game/src/m_berserk.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifyStartupThinkCompletesWalkingMonsterSetup();
  verifySpawnRegistryCallsMonsterBerserk();
  verifyMoveTablesMatchSourceFrames();
  verifyStandRuntimeFlow();
  verifyStandFidgetRuntimeFlow();
  verifyWalkMoveRuntimeFlow();
  verifyWalkCallbackRuntimeFlow();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifySaveRestoreAfterStartup();
  verifyStateTransitions();
  verifyMoveFrameCallbacks();
  verifyFidgetBranches();
  verifySightSearchSounds();
  verifyAttackCallbacks();
  verifyPainBranches();
  verifyDeathBranches();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-berserk: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const berserk = createBerserk(runtime, 1);

  SP_monster_berserk(berserk, runtime);

  assert.equal(berserk.movetype, MOVETYPE_STEP);
  assert.equal(berserk.solid, SOLID_BBOX);
  assert.deepEqual(berserk.mins, [-16, -16, -24]);
  assert.deepEqual(berserk.maxs, [16, 16, 32]);
  assert.equal(berserk.health, 240);
  assert.equal(berserk.gib_health, -60);
  assert.equal(berserk.mass, 250);
  assert.equal(berserk.monsterinfo.walk, berserk_walk);
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand);
  assert.equal(berserk.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[berserk.s.modelindex - 1], "models/monsters/berserk/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths, [
    "berserk/berpain2.wav",
    "berserk/berdeth2.wav",
    "berserk/beridle1.wav",
    "berserk/attack.wav",
    "berserk/bersrch1.wav",
    "berserk/sight.wav"
  ]);
  assert.ok(berserk.think, "walkmonster_start should arm delayed startup think");
}

function verifyStartupThinkCompletesWalkingMonsterSetup(): void {
  const runtime = createHarnessRuntime();
  const berserk = createBerserk(runtime, 2);

  SP_monster_berserk(berserk, runtime);
  berserk.think!(berserk, runtime);

  assert.equal(berserk.yaw_speed, 20);
  assert.equal(berserk.viewheight, 25);
  assert.equal(berserk.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(berserk.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(berserk.max_health, 240);
  assert.equal(berserk.think?.name, "monster_think");
  assert.equal(berserk.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryCallsMonsterBerserk(): void {
  const runtime = createHarnessRuntime();
  const berserk = createBerserk(runtime, 3);

  ED_CallSpawn(berserk, runtime);

  assert.equal(berserk.health, 240);
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand);
}

function verifyMoveTablesMatchSourceFrames(): void {
  assertMove("stand", berserk_move_stand, FRAME_stand1, FRAME_stand5, new Array<number>(5).fill(0), [[0, "berserk_fidget"]]);
  assertMove("stand_fidget", berserk_move_stand_fidget, FRAME_standb1, FRAME_standb20, new Array<number>(20).fill(0));
  assert.equal(berserk_move_stand_fidget.endfunc?.name, "berserk_stand");
  assertMove("walk", berserk_move_walk, FRAME_walkc1, FRAME_walkc11, [9.1, 6.3, 4.9, 6.7, 6.0, 8.2, 7.2, 6.1, 4.9, 4.7, 4.7, 4.8]);
  assertMove("run1", berserk_move_run1, FRAME_run1, FRAME_run6, [21, 11, 21, 25, 18, 19]);
  assertMove("attack_spike", berserk_move_attack_spike, FRAME_att_c1, FRAME_att_c8, new Array<number>(8).fill(0), [
    [2, "berserk_swing"],
    [3, "berserk_attack_spike"]
  ]);
  assertMove("attack_club", berserk_move_attack_club, FRAME_att_c9, FRAME_att_c20, new Array<number>(12).fill(0), [
    [4, "berserk_swing"],
    [8, "berserk_attack_club"]
  ]);
  assertMove("attack_strike", berserk_move_attack_strike, FRAME_att_c21, FRAME_att_c34, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9.7, 13.6], [
    [3, "berserk_swing"],
    [7, "berserk_strike"]
  ]);
  assertMove("pain1", berserk_move_pain1, FRAME_painc1, FRAME_painc4, new Array<number>(4).fill(0));
  assertMove("pain2", berserk_move_pain2, FRAME_painb1, FRAME_painb20, new Array<number>(20).fill(0));
  assertMove("death1", berserk_move_death1, FRAME_death1, FRAME_death13, new Array<number>(13).fill(0));
  assertMove("death2", berserk_move_death2, FRAME_deathc1, FRAME_deathc8, new Array<number>(8).fill(0));
}

function verifyStandRuntimeFlow(): void {
  const runtime = createHarnessRuntime();
  const context = createGameMainContext(createGameImports(), { runtime });
  const berserk = createBerserk(runtime, 16);

  SP_monster_berserk(berserk, runtime);

  assert.equal(berserk.monsterinfo.stand, berserk_stand);
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand);
  assert.equal(berserk_move_stand.endfunc, undefined);

  berserk.monsterinfo.currentmove = berserk_move_walk;
  berserk.monsterinfo.stand!(berserk, runtime);
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand, "monsterinfo.stand should restore the stand move");

  berserk.think!(berserk, runtime);
  berserk.s.frame = FRAME_stand5;
  withMathRandom([0.99], () => G_RunFrame(context));

  assert.equal(berserk.think?.name, "monster_think");
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand);
  assert.equal(berserk.s.frame, FRAME_stand1, "G_RunFrame should loop the visible stand frames through monster_think");
  assert.equal(berserk.nextthink, runtime.time + FRAMETIME, "monster_think should schedule the next stand tick");
}

function verifyStandFidgetRuntimeFlow(): void {
  const runtime = createHarnessRuntime();
  const context = createGameMainContext(createGameImports(), { runtime });
  const berserk = createBerserk(runtime, 17);

  SP_monster_berserk(berserk, runtime);
  berserk.think!(berserk, runtime);

  berserk.monsterinfo.currentmove = berserk_move_stand_fidget;
  berserk.s.frame = FRAME_standb1 - 1;
  G_RunFrame(context);

  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand_fidget);
  assert.equal(berserk.s.frame, FRAME_standb1, "G_RunFrame should enter the visible stand fidget range");
  assert.equal(berserk.nextthink, runtime.time + FRAMETIME, "stand fidget should schedule the next monster tick");

  berserk.s.frame = FRAME_standb20;
  G_RunFrame(context);

  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand, "stand fidget endfunc should restore the stand move");
  assert.equal(berserk.s.frame, FRAME_stand1, "stand fidget should return to the visible stand frame range");
}

function verifyWalkMoveRuntimeFlow(): void {
  const runtime = createHarnessRuntime();
  const context = createGameMainContext(createGameImports(), { runtime });
  const berserk = createBerserk(runtime, 18);

  SP_monster_berserk(berserk, runtime);
  berserk.think!(berserk, runtime);
  berserk.groundentity = runtime.entities[0] ?? null;
  berserk.monsterinfo.currentmove = berserk_move_walk;
  berserk.s.frame = FRAME_walkc1 - 1;

  G_RunFrame(context);

  assert.equal(berserk.monsterinfo.currentmove, berserk_move_walk);
  assert.equal(berserk.s.frame, FRAME_walkc1, "G_RunFrame should enter the visible walk frame range");
  assert.equal(berserk.nextthink, runtime.time + FRAMETIME, "walk move should schedule the next monster tick");

  berserk.s.frame = FRAME_walkc11;
  G_RunFrame(context);

  assert.equal(berserk.monsterinfo.currentmove, berserk_move_walk);
  assert.equal(berserk.s.frame, FRAME_walkc1, "walk move should loop from FRAME_walkc11 to FRAME_walkc1");
}

function verifyWalkCallbackRuntimeFlow(): void {
  const runtime = createHarnessRuntime();
  const context = createGameMainContext(createGameImports(), { runtime });
  const berserk = createBerserk(runtime, 19);

  SP_monster_berserk(berserk, runtime);
  berserk.think!(berserk, runtime);
  berserk.groundentity = runtime.entities[0] ?? null;
  berserk.monsterinfo.currentmove = berserk_move_stand;
  berserk.monsterinfo.pausetime = runtime.time - FRAMETIME;
  berserk.s.frame = FRAME_stand1 - 1;

  assert.equal(berserk.monsterinfo.walk, berserk_walk);
  G_RunFrame(context);

  assert.equal(berserk.monsterinfo.walk, berserk_walk, "SP_monster_berserk should keep monsterinfo.walk bound to berserk_walk");
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_walk, "ai_stand should reach berserk_walk through monsterinfo.walk");
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_berserk"), SP_monster_berserk);
  assert.equal(findGameSaveFunction("berserk_pain"), berserk_pain);
  assert.equal(findGameSaveFunction("berserk_die"), berserk_die);
  assert.equal(findGameSaveFunction("berserk_sight"), berserk_sight);
  assert.equal(findGameSaveMove("berserk_move_stand"), berserk_move_stand);
  assert.equal(findGameSaveMove("berserk_move_stand_fidget"), berserk_move_stand_fidget);
  assert.equal(findGameSaveMove("berserk_move_walk"), berserk_move_walk);
  assert.equal(findGameSaveMove("berserk_move_attack_spike"), berserk_move_attack_spike);
  assert.equal(findGameSaveMove("berserk_move_death1"), berserk_move_death1);
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

  const berserk = createBerserk(writeContext.runtime, 14);
  SP_monster_berserk(berserk, writeContext.runtime);
  berserk.think!(berserk, writeContext.runtime);
  berserk.monsterinfo.currentmove = berserk_move_attack_spike;
  berserk.s.frame = FRAME_att_c1 + 2;

  WriteLevel(writeContext, "save/berserk-level.sav");

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

  ReadLevel(readContext, "save/berserk-level.sav");

  const restored = readContext.runtime.entities[14];
  assert.equal(restored?.classname, "monster_berserk");
  assert.equal(restored?.pain, berserk_pain);
  assert.equal(restored?.die, berserk_die);
  assert.equal(restored?.monsterinfo.stand, berserk_stand);
  assert.equal(restored?.monsterinfo.walk, berserk_walk);
  assert.equal(restored?.monsterinfo.run, berserk_run);
  assert.equal(restored?.monsterinfo.melee, berserk_melee);
  assert.equal(restored?.monsterinfo.sight, berserk_sight);
  assert.equal(restored?.monsterinfo.search, berserk_search);
  assert.equal(restored?.monsterinfo.currentmove, berserk_move_attack_spike);
  assert.ok(linked.includes(14), "ReadLevel must relink restored monster_berserk");
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const berserk = createBerserk(runtime, 4);
  void runtime;

  berserk_stand(berserk);
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand);
  berserk_walk(berserk);
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_walk);
  berserk_run(berserk);
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_run1);
  berserk.monsterinfo.aiflags |= AI_STAND_GROUND;
  berserk_run(berserk);
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand);

  withMathRandom([0], () => berserk_melee(berserk));
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_attack_spike);
  withMathRandom([0.75], () => berserk_melee(berserk));
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_attack_club);
}

function verifyMoveFrameCallbacks(): void {
  const runtime = createHarnessRuntime();
  const berserk = createBerserk(runtime, 15);
  const enemy = createRuntimeEntity({ classname: "target_dummy" }, 16);
  enemy.inuse = true;
  enemy.health = 100;
  enemy.takedamage = 1;
  enemy.s.origin = [40, 0, 0];
  enemy.origin = [40, 0, 0];
  runtime.entities[16] = enemy;
  berserk.enemy = enemy;

  SP_monster_berserk(berserk, runtime);
  runtime.collision = {
    world: {} as never,
    trace: () => makeTrace(enemy),
    pointcontents: () => 0
  };

  berserk.monsterinfo.currentmove = berserk_move_attack_spike;
  berserk.s.frame = FRAME_att_c1 + 1;
  M_MoveFrame(berserk, runtime);
  assert.equal(berserk.s.frame, FRAME_att_c1 + 2);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "berserk/attack.wav");

  berserk.s.frame = FRAME_att_c1 + 2;
  withMathRandom([0], () => M_MoveFrame(berserk, runtime));
  assert.equal(berserk.s.frame, FRAME_att_c1 + 3);
  assert.equal(enemy.health, 85);

  berserk.monsterinfo.currentmove = berserk_move_attack_club;
  berserk.s.frame = FRAME_att_c20;
  M_MoveFrame(berserk, runtime);
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_run1);
}

function verifySightSearchSounds(): void {
  const runtime = createHarnessRuntime();
  const berserk = createBerserk(runtime, 5);
  SP_monster_berserk(berserk, runtime);

  assert.equal(berserk.monsterinfo.sight, berserk_sight);
  assert.equal(berserk.monsterinfo.search, berserk_search);

  berserk_sight(berserk, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "berserk/sight.wav");

  berserk_search(berserk, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "berserk/bersrch1.wav");

  berserk.monsterinfo.sight!(berserk, null, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "berserk/sight.wav");

  berserk.monsterinfo.search!(berserk, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "berserk/bersrch1.wav");
}

function verifyFidgetBranches(): void {
  const runtime = createHarnessRuntime();
  const berserk = createBerserk(runtime, 11);
  SP_monster_berserk(berserk, runtime);

  withMathRandom([0.1], () => berserk_move_stand.frame[0].thinkfunc!(berserk, runtime));
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand_fidget);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "berserk/beridle1.wav");

  berserk.monsterinfo.currentmove = berserk_move_stand;
  berserk.monsterinfo.aiflags |= AI_STAND_GROUND;
  withMathRandom([0.1], () => berserk_fidget(berserk, runtime));
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand, "AI_STAND_GROUND should suppress fidget");

  berserk.monsterinfo.aiflags &= ~AI_STAND_GROUND;
  withMathRandom([0.2], () => berserk_fidget(berserk, runtime));
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand, "g_local.random() > 0.15 should suppress fidget");

  withMathRandom([0.15001], () => berserk_fidget(berserk, runtime));
  assert.equal(
    berserk.monsterinfo.currentmove,
    berserk_move_stand_fidget,
    "berserk_fidget should use the C 15-bit random() threshold, not raw Math.random()"
  );
}

function verifyAttackCallbacks(): void {
  const runtime = createHarnessRuntime();
  const berserk = createBerserk(runtime, 12);
  const enemy = createRuntimeEntity({ classname: "target_dummy" }, 13);
  enemy.inuse = true;
  enemy.health = 100;
  enemy.takedamage = 1;
  enemy.s.origin = [40, 0, 0];
  enemy.origin = [40, 0, 0];
  runtime.entities[13] = enemy;
  berserk.enemy = enemy;

  SP_monster_berserk(berserk, runtime);
  runtime.collision = {
    world: {} as never,
    trace: () => makeTrace(enemy),
    pointcontents: () => 0
  };

  berserk_move_attack_spike.frame[2].thinkfunc!(berserk, runtime);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "berserk/attack.wav");

  withMathRandom([0], () => berserk_move_attack_spike.frame[3].thinkfunc!(berserk, runtime));
  assert.equal(enemy.health, 85, "spike attack should apply 15 + rand % 6 damage");

  withMathRandom([0.99], () => berserk_move_attack_club.frame[8].thinkfunc!(berserk, runtime));
  assert.equal(enemy.health, 75, "club attack should apply 5 + rand % 6 damage");
}

function verifyPainBranches(): void {
  const runtime = createHarnessRuntime();
  const berserk = createBerserk(runtime, 6);
  SP_monster_berserk(berserk, runtime);
  berserk.max_health = 240;
  berserk.health = 100;

  berserk_pain(berserk, null, 0, 10, runtime);
  assert.equal(berserk.s.skinnum, 1);
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_pain1);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "berserk/berpain2.wav");

  runtime.time = 4;
  withMathRandom([0.75], () => berserk_pain(berserk, null, 0, 30, runtime));
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_pain2);

  runtime.skill = 3;
  runtime.time = 8;
  berserk.monsterinfo.currentmove = berserk_move_stand;
  berserk_pain(berserk, null, 0, 30, runtime);
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_stand, "nightmare pain should not start a pain animation");
}

function verifyDeathBranches(): void {
  const runtime = createHarnessRuntime();
  const berserk = createBerserk(runtime, 7);
  SP_monster_berserk(berserk, runtime);

  berserk_die(berserk, null, null, 60, runtime);
  assert.equal(berserk.deadflag, DEAD_DEAD);
  assert.equal(berserk.takedamage, damage_t.DAMAGE_YES);
  assert.equal(berserk.monsterinfo.currentmove, berserk_move_death1);

  const lightDamageBerserk = createBerserk(runtime, 8);
  SP_monster_berserk(lightDamageBerserk, runtime);
  berserk_die(lightDamageBerserk, null, null, 20, runtime);
  assert.equal(lightDamageBerserk.monsterinfo.currentmove, berserk_move_death2);

  berserk_dead(lightDamageBerserk, runtime);
  assert.deepEqual(lightDamageBerserk.mins, [-16, -16, -24]);
  assert.deepEqual(lightDamageBerserk.maxs, [16, 16, -8]);
  assert.equal(lightDamageBerserk.movetype, MOVETYPE_TOSS);
  assert.equal(lightDamageBerserk.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);

  const gibBerserk = createBerserk(runtime, 9);
  SP_monster_berserk(gibBerserk, runtime);
  gibBerserk.health = -60;
  berserk_die(gibBerserk, null, null, 25, runtime);
  assert.equal(gibBerserk.deadflag, DEAD_DEAD);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/bone/tris.md2").length, 2);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2").length, 4);
  assert.equal(runtime.entities.filter((entity) => entity.model === "models/objects/gibs/head2/tris.md2").length, 1);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const berserk = createBerserk(runtime, 10);

  SP_monster_berserk(berserk, runtime);

  assert.equal(berserk.inuse, false);
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
      ent: runtime.entities[0] ?? null
    }),
    pointcontents: () => 0
  };
  return runtime;
}

function createBerserk(runtime: GameRuntime, index: number): GameEntity {
  const berserk = createRuntimeEntity({ classname: "monster_berserk" }, index);
  runtime.entities[index] = berserk;
  return berserk;
}

function makeTrace(entity: GameEntity | null): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction: 1,
    endpos: entity?.s.origin ? [...entity.s.origin] : [0, 0, 0],
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
