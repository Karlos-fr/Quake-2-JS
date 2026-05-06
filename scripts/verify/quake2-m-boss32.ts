/**
 * File: quake2-m-boss32.ts
 * Purpose: Verify the gameplay port of `game/m_boss32.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for monster_makron behavior.
 *
 * Dependencies:
 * - packages/game/src/m_boss32.ts
 */

import { strict as assert } from "node:assert";

import { ATTN_NONE, ATTN_NORM, CHAN_AUTO, CHAN_BODY, CHAN_VOICE, CHAN_WEAPON, type trace_t, type vec3_t } from "../../packages/qcommon/src/index.js";
import {
  AI_STAND_GROUND,
  AS_MISSILE,
  AS_SLIDING,
  DEAD_DEAD,
  FRAMETIME,
  M_MoveFrame,
  MOVETYPE_STEP,
  MOVETYPE_TOSS,
  SOLID_NOT,
  SOLID_BBOX,
  SVF_DEADMONSTER,
  SVF_MONSTER,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  damage_t,
  drainGameSoundEvents,
  drainMonsterMuzzleFlashEvents,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { FL_FLY } from "../../packages/game/src/g_local.js";
import { ED_CallSpawn } from "../../packages/game/src/g_spawn.js";
import { findGameSaveFunction, findGameSaveMove } from "../../packages/game/src/g_save.js";
import {
  Makron_CheckAttack,
  MakronHyperblaster,
  MakronRailgun,
  MakronSpawn,
  MakronSaveloc,
  MakronToss,
  MZ2_MAKRON_BFG,
  MZ2_MAKRON_BLASTER_1,
  MZ2_MAKRON_RAILGUN_1,
  SP_monster_makron,
  FRAME_attak405,
  FRAME_death295,
  FRAME_pain401,
  FRAME_pain404,
  FRAME_pain501,
  FRAME_pain504,
  FRAME_pain601,
  FRAME_pain627,
  FRAME_stand201,
  FRAME_stand260,
  FRAME_walk204,
  FRAME_walk213,
  makronBFG,
  makron_brainsplorch,
  makron_dead,
  makron_attack,
  makron_frames_pain4,
  makron_frames_pain5,
  makron_frames_pain6,
  makron_frames_walk,
  makron_die,
  makron_hit,
  makron_move_attack3,
  makron_move_attack4,
  makron_move_attack5,
  makron_move_pain4,
  makron_move_pain5,
  makron_move_pain6,
  makron_move_run,
  makron_move_sight,
  makron_move_stand,
  makron_move_walk,
  makron_pain,
  makron_popup,
  makron_prerailgun,
  makron_run,
  makron_stand,
  makron_step_left,
  makron_step_right,
  makron_taunt,
  makron_walk
} from "../../packages/game/src/m_boss32.js";

main();

function main(): void {
  verifySpawnRegistersAssetsAndStartsWalking();
  verifySpawnRegistryExcludesStandaloneMakron();
  verifySaveRegistryRestoresCallbacksAndMoves();
  verifyStandRunTablesAndCallbacks();
  verifyPainTablesAndMoves();
  verifyStateTransitions();
  verifySoundCallbacks();
  verifyPainBranchesPreserveSourceDanglingElse();
  verifyWeaponCallbacks();
  verifyCheckAttack();
  verifyDeathBranchesAndTorso();
  verifyMakronTossAndSpawnJump();
  verifyDeathmatchSpawnFreesEntity();

  console.log("quake2-m-boss32: ok");
}

function verifySpawnRegistersAssetsAndStartsWalking(): void {
  const runtime = createHarnessRuntime();
  const makron = createMakron(runtime, 1);

  SP_monster_makron(makron, runtime);

  assert.equal(makron.movetype, MOVETYPE_STEP);
  assert.equal(makron.solid, SOLID_BBOX);
  assert.deepEqual(makron.mins, [-30, -30, 0]);
  assert.deepEqual(makron.maxs, [30, 30, 90]);
  assert.equal(makron.health, 3000);
  assert.equal(makron.gib_health, -2000);
  assert.equal(makron.mass, 500);
  assert.equal(makron.monsterinfo.currentmove, makron_move_sight);
  assert.equal(makron.monsterinfo.scale, 1);
  assert.equal(runtime.assets.modelPaths[makron.s.modelindex - 1], "models/monsters/boss3/rider/tris.md2");
  assert.deepEqual(runtime.assets.soundPaths.slice(0, 14), [
    "makron/pain3.wav",
    "makron/pain2.wav",
    "makron/pain1.wav",
    "makron/death.wav",
    "makron/step1.wav",
    "makron/step2.wav",
    "makron/bfg_fire.wav",
    "makron/brain1.wav",
    "makron/rail_up.wav",
    "makron/popup.wav",
    "makron/voice4.wav",
    "makron/voice3.wav",
    "makron/voice.wav",
    "makron/bhit.wav"
  ]);

  makron.think!(makron, runtime);
  assert.equal(makron.yaw_speed, 20);
  assert.equal(makron.viewheight, 25);
  assert.equal(makron.svflags & SVF_MONSTER, SVF_MONSTER);
  assert.equal(makron.takedamage, damage_t.DAMAGE_AIM);
  assert.equal(makron.max_health, 3000);
  assert.equal(makron.think?.name, "monster_think");
  assert.equal(makron.nextthink, runtime.time + FRAMETIME);
}

function verifySpawnRegistryExcludesStandaloneMakron(): void {
  const runtime = createHarnessRuntime();
  const makron = createMakron(runtime, 2);

  ED_CallSpawn(makron, runtime);

  assert.equal(makron.health, 0);
  assert.equal(makron.monsterinfo.currentmove, null);
}

function verifySaveRegistryRestoresCallbacksAndMoves(): void {
  assert.equal(findGameSaveFunction("SP_monster_makron"), SP_monster_makron);
  assert.equal(findGameSaveFunction("makron_pain"), makron_pain);
  assert.equal(findGameSaveFunction("makron_die"), makron_die);
  assert.equal(findGameSaveFunction("MakronSpawn"), MakronSpawn);
  assert.equal(findGameSaveFunction("MakronToss"), MakronToss);
  assert.equal(findGameSaveFunction("Makron_CheckAttack"), Makron_CheckAttack);
  assert.equal(findGameSaveFunction("MakronHyperblaster"), MakronHyperblaster);
  assert.equal(findGameSaveFunction("MakronRailgun"), MakronRailgun);
  assert.equal(findGameSaveFunction("MakronSaveloc"), MakronSaveloc);
  assert.equal(findGameSaveMove("makron_move_stand"), makron_move_stand);
  assert.equal(findGameSaveMove("makron_move_sight"), makron_move_sight);
  assert.equal(findGameSaveMove("makron_move_run"), makron_move_run);
  assert.equal(findGameSaveMove("makron_move_walk"), makron_move_walk);
  assert.equal(findGameSaveMove("makron_move_pain4"), makron_move_pain4);
  assert.equal(findGameSaveMove("makron_move_pain5"), makron_move_pain5);
  assert.equal(findGameSaveMove("makron_move_pain6"), makron_move_pain6);
  assert.equal(findGameSaveMove("makron_move_attack3"), makron_move_attack3);
  assert.equal(findGameSaveMove("makron_move_attack4"), makron_move_attack4);
  assert.equal(findGameSaveMove("makron_move_attack5"), makron_move_attack5);
}

function verifyStandRunTablesAndCallbacks(): void {
  assert.equal(makron_move_stand.firstframe, FRAME_stand201);
  assert.equal(makron_move_stand.lastframe, FRAME_stand260);
  assert.equal(makron_move_stand.frame.length, 60);
  assert.equal(makron_move_stand.endfunc, undefined);
  assert.deepEqual(makron_move_stand.frame.map((frame) => frame.aifunc?.name), new Array<string>(60).fill("ai_stand"));
  assert.deepEqual(makron_move_stand.frame.map((frame) => frame.dist), new Array<number>(60).fill(0));
  assert.ok(makron_move_stand.frame.every((frame) => frame.thinkfunc === undefined));

  assert.equal(makron_move_run.firstframe, FRAME_walk204);
  assert.equal(makron_move_run.lastframe, FRAME_walk213);
  assert.equal(makron_move_run.frame.length, 10);
  assert.equal(makron_move_run.endfunc, undefined);
  assert.deepEqual(makron_move_run.frame.map((frame) => frame.aifunc?.name), new Array<string>(10).fill("ai_run"));
  assert.deepEqual(makron_move_run.frame.map((frame) => frame.dist), [3, 12, 8, 8, 8, 6, 12, 9, 6, 12]);
  assert.deepEqual(
    makron_move_run.frame.map((frame) => frame.thinkfunc?.name),
    ["makron_step_left", undefined, undefined, undefined, "makron_step_right", undefined, undefined, undefined, undefined, undefined]
  );

  assert.equal(makron_frames_walk.length, 10);
  assert.deepEqual(makron_frames_walk.map((frame) => frame.aifunc?.name), new Array<string>(10).fill("ai_walk"));
  assert.deepEqual(makron_frames_walk.map((frame) => frame.dist), [3, 12, 8, 8, 8, 6, 12, 9, 6, 12]);
  assert.deepEqual(
    makron_frames_walk.map((frame) => frame.thinkfunc?.name),
    ["makron_step_left", undefined, undefined, undefined, "makron_step_right", undefined, undefined, undefined, undefined, undefined]
  );
  assert.equal(makron_move_walk.firstframe, FRAME_walk204);
  assert.equal(makron_move_walk.lastframe, FRAME_walk213);
  assert.equal(makron_move_walk.frame, makron_move_run.frame, "source m_boss32.c points makron_move_walk at makron_frames_run");
  assert.equal(makron_move_walk.endfunc, undefined);
}

function verifyPainTablesAndMoves(): void {
  assert.equal(makron_move_pain6.firstframe, FRAME_pain601);
  assert.equal(makron_move_pain6.lastframe, FRAME_pain627);
  assert.equal(makron_move_pain6.frame, makron_frames_pain6);
  assert.equal(makron_move_pain6.endfunc, makron_run);
  assert.equal(makron_frames_pain6.length, 27);
  assert.deepEqual(makron_frames_pain6.map((frame) => frame.aifunc?.name), new Array<string>(27).fill("ai_move"));
  assert.deepEqual(makron_frames_pain6.map((frame) => frame.dist), new Array<number>(27).fill(0));
  assert.deepEqual(
    makron_frames_pain6.map((frame) => frame.thinkfunc?.name),
    [
      undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined, undefined, undefined, "makron_popup", undefined, undefined,
      undefined, undefined, undefined, undefined, undefined, "makron_taunt", undefined, undefined, undefined
    ]
  );

  assert.equal(makron_move_pain5.firstframe, FRAME_pain501);
  assert.equal(makron_move_pain5.lastframe, FRAME_pain504);
  assert.equal(makron_move_pain5.frame, makron_frames_pain5);
  assert.equal(makron_move_pain5.endfunc, makron_run);
  assert.equal(makron_frames_pain5.length, 4);
  assert.deepEqual(makron_frames_pain5.map((frame) => frame.aifunc?.name), new Array<string>(4).fill("ai_move"));
  assert.deepEqual(makron_frames_pain5.map((frame) => frame.dist), new Array<number>(4).fill(0));
  assert.ok(makron_frames_pain5.every((frame) => frame.thinkfunc === undefined));

  assert.equal(makron_move_pain4.firstframe, FRAME_pain401);
  assert.equal(makron_move_pain4.lastframe, FRAME_pain404);
  assert.equal(makron_move_pain4.frame, makron_frames_pain4);
  assert.equal(makron_move_pain4.endfunc, makron_run);
  assert.equal(makron_frames_pain4.length, 4);
  assert.deepEqual(makron_frames_pain4.map((frame) => frame.aifunc?.name), new Array<string>(4).fill("ai_move"));
  assert.deepEqual(makron_frames_pain4.map((frame) => frame.dist), new Array<number>(4).fill(0));
  assert.ok(makron_frames_pain4.every((frame) => frame.thinkfunc === undefined));
}

function verifyStateTransitions(): void {
  const runtime = createHarnessRuntime();
  const makron = createMakron(runtime, 3);
  const enemy = createEnemy(runtime, 4);
  SP_monster_makron(makron, runtime);

  makron_stand(makron);
  assert.equal(makron.monsterinfo.currentmove, makron_move_stand);
  makron_walk(makron);
  assert.equal(makron.monsterinfo.currentmove?.firstframe, makron_move_run.firstframe);
  makron_run(makron);
  assert.equal(makron.monsterinfo.currentmove, makron_move_run);
  makron.monsterinfo.aiflags |= AI_STAND_GROUND;
  makron_run(makron);
  assert.equal(makron.monsterinfo.currentmove, makron_move_stand);

  makron.enemy = enemy;
  withMathRandom([0.2], () => makron_attack(makron, runtime));
  assert.equal(makron.monsterinfo.currentmove, makron_move_attack3);
  withMathRandom([0.5], () => makron_attack(makron, runtime));
  assert.equal(makron.monsterinfo.currentmove, makron_move_attack4);
  withMathRandom([0.9], () => makron_attack(makron, runtime));
  assert.equal(makron.monsterinfo.currentmove, makron_move_attack5);
}

function verifySoundCallbacks(): void {
  const runtime = createHarnessRuntime();
  const makron = createMakron(runtime, 5);
  SP_monster_makron(makron, runtime);

  makron_step_left(makron, runtime);
  assertSound(drainGameSoundEvents(runtime).at(-1), "makron/step1.wav", CHAN_BODY, ATTN_NORM);
  makron_step_right(makron, runtime);
  assertSound(drainGameSoundEvents(runtime).at(-1), "makron/step2.wav", CHAN_BODY, ATTN_NORM);
  makron_popup(makron, runtime);
  assertSound(drainGameSoundEvents(runtime).at(-1), "makron/popup.wav", CHAN_BODY, ATTN_NONE);
  makron_brainsplorch(makron, runtime);
  assertSound(drainGameSoundEvents(runtime).at(-1), "makron/brain1.wav", CHAN_VOICE, ATTN_NORM);
  makron_prerailgun(makron, runtime);
  assertSound(drainGameSoundEvents(runtime).at(-1), "makron/rail_up.wav", CHAN_WEAPON, ATTN_NORM);
  makron_hit(makron, runtime);
  assertSound(drainGameSoundEvents(runtime).at(-1), "makron/bhit.wav", CHAN_AUTO, ATTN_NONE);

  withMathRandom([0.2], () => makron_taunt(makron, runtime));
  assertSound(drainGameSoundEvents(runtime).at(-1), "makron/voice4.wav", CHAN_AUTO, ATTN_NONE);
  withMathRandom([0.5], () => makron_taunt(makron, runtime));
  assertSound(drainGameSoundEvents(runtime).at(-1), "makron/voice3.wav", CHAN_AUTO, ATTN_NONE);
  withMathRandom([0.9], () => makron_taunt(makron, runtime));
  assertSound(drainGameSoundEvents(runtime).at(-1), "makron/voice.wav", CHAN_AUTO, ATTN_NONE);
}

function verifyPainBranchesPreserveSourceDanglingElse(): void {
  const runtime = createHarnessRuntime();
  const makron = createMakron(runtime, 14);
  SP_monster_makron(makron, runtime);
  makron.max_health = 3000;
  makron.health = 1400;

  withMathRandom([0.9], () => makron_pain(makron, null, 0, 40, runtime));
  assert.equal(makron.s.skinnum, 1);
  assert.equal(makron.monsterinfo.currentmove, makron_move_pain4);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "makron/pain3.wav");

  runtime.time = 4;
  makron_pain(makron, null, 0, 110, runtime);
  assert.equal(makron.monsterinfo.currentmove, makron_move_pain5);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "makron/pain2.wav");

  runtime.time = 8;
  makron.monsterinfo.currentmove = makron_move_stand;
  withMathRandom([0.9, 0.1], () => makron_pain(makron, null, 0, 150, runtime));
  assert.equal(makron.monsterinfo.currentmove, makron_move_pain6);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "makron/pain1.wav");

  runtime.time = 12;
  makron.monsterinfo.currentmove = makron_move_stand;
  withMathRandom([0.1], () => makron_pain(makron, null, 0, 151, runtime));
  assert.equal(makron.monsterinfo.currentmove, makron_move_stand, "source dangling-else leaves damage > 150 without pain6");
}

function verifyWeaponCallbacks(): void {
  const runtime = createHarnessRuntime();
  const makron = createMakron(runtime, 6);
  const enemy = createEnemy(runtime, 7, [256, 0, 24]);
  SP_monster_makron(makron, runtime);
  makron.enemy = enemy;
  makron.s.origin = [0, 0, 0];
  makron.origin = [...makron.s.origin];
  makron.s.angles = [0, 0, 0];
  makron.angles = [...makron.s.angles];

  makronBFG(makron, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_MAKRON_BFG);
  assert.ok(runtime.entities.some((entity) => entity.classname === "bfg blast"));
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "makron/bfg_fire.wav");

  makron.s.frame = FRAME_attak405;
  MakronHyperblaster(makron, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_MAKRON_BLASTER_1);
  assert.ok(runtime.entities.some((entity) => entity.classname === "bolt"));

  MakronSaveloc(makron);
  assert.deepEqual(makron.pos1, [256, 0, 48]);
  MakronRailgun(makron, runtime);
  assert.equal(drainMonsterMuzzleFlashEvents(runtime).at(-1)?.flashNumber, MZ2_MAKRON_RAILGUN_1);
}

function verifyCheckAttack(): void {
  const runtime = createHarnessRuntime();
  const makron = createMakron(runtime, 8);
  const enemy = createEnemy(runtime, 9, [128, 0, 24]);
  SP_monster_makron(makron, runtime);
  makron.enemy = enemy;
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);

  withMathRandom([0.1, 0.25], () => {
    assert.equal(Makron_CheckAttack(makron, runtime), true);
  });
  assert.equal(makron.monsterinfo.attack_state, AS_MISSILE);
  assert.equal(makron.monsterinfo.attack_finished, 0.5);
  assert.equal(makron.ideal_yaw, 0);

  runtime.time = 1;
  makron.monsterinfo.attack_finished = 4;
  assert.equal(Makron_CheckAttack(makron, runtime), false);

  runtime.time = 5;
  makron.monsterinfo.attack_finished = 0;
  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(null, end);
  assert.equal(Makron_CheckAttack(makron, runtime), false);

  runtime.collision!.trace = (_start, _mins, _maxs, end) => makeTrace(enemy, end);
  makron.flags |= FL_FLY;
  withMathRandom([0.95, 0.2], () => {
    assert.equal(Makron_CheckAttack(makron, runtime), false);
  });
  assert.equal(makron.monsterinfo.attack_state, AS_SLIDING);
}

function verifyDeathBranchesAndTorso(): void {
  const runtime = createHarnessRuntime();
  const makron = createMakron(runtime, 10);
  SP_monster_makron(makron, runtime);
  makron.s.origin = [64, 32, 12];
  makron.origin = [...makron.s.origin];
  makron.s.angles = [0, 90, 0];
  makron.angles = [...makron.s.angles];

  makron_die(makron, null, null, 80, runtime);
  assert.equal(makron.deadflag, DEAD_DEAD);
  assert.equal(makron.takedamage, damage_t.DAMAGE_YES);
  assert.equal(makron.monsterinfo.currentmove?.lastframe, FRAME_death295);
  assert.equal(drainGameSoundEvents(runtime).at(-1)?.soundPath, "makron/death.wav");

  const torso = runtime.entities.find((entity) => entity?.think?.name === "makron_torso_think");
  assert.ok(torso, "makron_die should spawn the cycling torso entity");
  assert.deepEqual(torso.s.origin, [64, -52, 12]);
  assert.deepEqual(torso.origin, [64, -52, 12]);
  assert.equal(torso.solid, SOLID_NOT);
  assert.equal(torso.s.frame, 346);
  assert.equal(runtime.assets.soundPaths[torso.s.sound - 1], "makron/spine.wav");

  torso.s.frame = 364;
  torso.think!(torso, runtime);
  assert.equal(torso.s.frame, 346);
  assert.equal(torso.nextthink, runtime.time + FRAMETIME);

  makron.s.frame = FRAME_death295;
  M_MoveFrame(makron, runtime);
  assert.equal(makron.movetype, MOVETYPE_TOSS);
  assert.equal(makron.svflags & SVF_DEADMONSTER, SVF_DEADMONSTER);
  assert.deepEqual(makron.mins, [-60, -60, 0]);
  assert.deepEqual(makron.maxs, [60, 60, 72]);

  const gibRuntime = createHarnessRuntime();
  const gibMakron = createMakron(gibRuntime, 11);
  SP_monster_makron(gibMakron, gibRuntime);
  gibMakron.health = gibMakron.gib_health;
  makron_die(gibMakron, null, null, 120, gibRuntime);
  assert.equal(gibMakron.deadflag, DEAD_DEAD);
  assert.equal(drainGameSoundEvents(gibRuntime).at(-1)?.soundPath, "misc/udeath.wav");

  makron_dead(gibMakron, gibRuntime);
  assert.equal(gibMakron.movetype, MOVETYPE_TOSS);
}

function verifyMakronTossAndSpawnJump(): void {
  const runtime = createHarnessRuntime();
  const jorg = createRuntimeEntity({ classname: "monster_jorg" }, 12);
  runtime.entities[12] = jorg;
  jorg.target = "after_jorg";
  jorg.s.origin = [64, 32, 12];
  runtime.sight_client = createEnemy(runtime, 13);
  runtime.sight_client.s.origin = [164, 32, 12];

  MakronToss(jorg, runtime);
  const makron = runtime.entities.find((entity) => entity?.think === MakronSpawn);
  assert.ok(makron, "MakronToss should schedule MakronSpawn");
  assert.equal(makron.target, "after_jorg");
  assert.deepEqual(makron.s.origin, [64, 32, 12]);

  MakronSpawn(makron, runtime);
  assert.equal(makron.health, 3000);
  assert.equal(makron.s.angles[1], 0);
  assert.equal(makron.angles[1], 0);
  assert.deepEqual(makron.velocity, [400, 0, 200]);
  assert.equal(makron.groundentity, null);
}

function verifyDeathmatchSpawnFreesEntity(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  const makron = createMakron(runtime, 20);

  SP_monster_makron(makron, runtime);

  assert.equal(makron.inuse, false);
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

function createMakron(runtime: GameRuntime, index: number): GameEntity {
  const makron = createRuntimeEntity({ classname: "monster_makron" }, index);
  runtime.entities[index] = makron;
  return makron;
}

function createEnemy(runtime: GameRuntime, index: number, origin: vec3_t = [128, 0, 24]): GameEntity {
  const enemy = createRuntimeEntity({ classname: "target_dummy" }, index);
  enemy.inuse = true;
  enemy.health = 100;
  enemy.max_health = 100;
  enemy.takedamage = damage_t.DAMAGE_YES;
  enemy.s.origin = [...origin];
  enemy.origin = [...enemy.s.origin];
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

function assertSound(
  event: ReturnType<typeof drainGameSoundEvents>[number] | undefined,
  soundPath: string,
  channel: number,
  attenuation: number
): void {
  assert.equal(event?.soundPath, soundPath);
  assert.equal(event?.channel, channel);
  assert.equal(event?.volume, 1);
  assert.equal(event?.attenuation, attenuation);
  assert.equal(event?.timeofs, 0);
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
