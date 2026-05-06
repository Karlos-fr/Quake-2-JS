/**
 * File: quake2-m-actor.ts
 * Purpose: Verify the first gameplay port of game/m_actor.c.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_actor.ts
 * - packages/game/src/g_spawn.ts
 */

import { strict as assert } from "node:assert";
import {
  AI_HOLD_FRAME,
  AI_GOOD_GUY,
  AI_BRUTAL,
  AI_STAND_GROUND,
  DEAD_DEAD,
  ED_CallSpawn,
  G_TouchTriggers,
  M_MoveFrame,
  MOVETYPE_STEP,
  MOVETYPE_TOSS,
  MOD_HIT,
  SOLID_BBOX,
  SOLID_NOT,
  SOLID_TRIGGER,
  SVF_DEADMONSTER,
  SVF_NOCLIENT,
  ai_move,
  ai_run,
  ai_walk,
  ai_stand,
  ai_turn,
  actorFrames,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  drainGameCprintfEvents,
  drainGameSoundEvents,
  drainMonsterMuzzleFlashEvents,
  linkGameEntity,
  ai_charge,
  damage_t,
  T_Damage,
  spawnGameEntity
} from "../../packages/game/src/index.js";

const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
runtime.maxclients = 1;
const player = runtime.entities[1] ?? spawnGameEntity(runtime);
player.classname = "player";
player.inuse = true;
attachGameClient(player);

assert.equal(actorFrames.MAX_ACTOR_NAMES, 8, "MAX_ACTOR_NAMES matches m_actor.c");
assert.deepEqual(
  [...actorFrames.actor_names],
  ["Hellrot", "Tokay", "Killme", "Disruptor", "Adrianator", "Rambear", "Titus", "Bitterman"],
  "actor_names matches m_actor.c"
);
assert.deepEqual(
  [...actorFrames.messages],
  ["Watch it", "#$@*&", "Idiot", "Check your targets"],
  "messages matches m_actor.c"
);

assert.equal(actorFrames.actor_frames_stand.length, 40, "actor_frames_stand has 40 C frames");
for (const [index, frame] of actorFrames.actor_frames_stand.entries()) {
  assert.equal(frame.aifunc, ai_stand, `actor_frames_stand[${index}] uses ai_stand`);
  assert.equal(frame.dist, 0, `actor_frames_stand[${index}] distance`);
  assert.equal(frame.thinkfunc, undefined, `actor_frames_stand[${index}] thinkfunc`);
}
assert.equal(actorFrames.actor_move_stand.firstframe, actorFrames.FRAME_stand101, "actor_move_stand firstframe");
assert.equal(actorFrames.actor_move_stand.lastframe, actorFrames.FRAME_stand140, "actor_move_stand lastframe");
assert.equal(actorFrames.actor_move_stand.frame, actorFrames.actor_frames_stand, "actor_move_stand frame table");
assert.equal(actorFrames.actor_move_stand.endfunc, undefined, "actor_move_stand endfunc");

const expectedWalkDistances = [0, 6, 10, 3, 2, 7, 10, 1, 4, 0, 0];
assert.equal(actorFrames.actor_frames_walk.length, expectedWalkDistances.length, "actor_frames_walk has 11 C frames");
for (const [index, frame] of actorFrames.actor_frames_walk.entries()) {
  assert.equal(frame.aifunc, ai_walk, `actor_frames_walk[${index}] uses ai_walk`);
  assert.equal(frame.dist, expectedWalkDistances[index], `actor_frames_walk[${index}] distance`);
  assert.equal(frame.thinkfunc, undefined, `actor_frames_walk[${index}] thinkfunc`);
}
assert.equal(actorFrames.actor_move_walk.firstframe, actorFrames.FRAME_walk01, "actor_move_walk firstframe");
assert.equal(actorFrames.actor_move_walk.lastframe, actorFrames.FRAME_walk08, "actor_move_walk lastframe");
assert.equal(actorFrames.actor_move_walk.frame, actorFrames.actor_frames_walk, "actor_move_walk frame table");
assert.equal(actorFrames.actor_move_walk.endfunc, undefined, "actor_move_walk endfunc");

const expectedRunDistances = [4, 15, 15, 8, 20, 15, 8, 17, 12, -2, -2, -1];
assert.equal(actorFrames.actor_frames_run.length, expectedRunDistances.length, "actor_frames_run has 12 C frames");
for (const [index, frame] of actorFrames.actor_frames_run.entries()) {
  assert.equal(frame.aifunc, ai_run, `actor_frames_run[${index}] uses ai_run`);
  assert.equal(frame.dist, expectedRunDistances[index], `actor_frames_run[${index}] distance`);
  assert.equal(frame.thinkfunc, undefined, `actor_frames_run[${index}] thinkfunc`);
}
assert.equal(actorFrames.actor_move_run.firstframe, actorFrames.FRAME_run02, "actor_move_run firstframe");
assert.equal(actorFrames.actor_move_run.lastframe, actorFrames.FRAME_run07, "actor_move_run lastframe");
assert.equal(actorFrames.actor_move_run.frame, actorFrames.actor_frames_run, "actor_move_run frame table");
assert.equal(actorFrames.actor_move_run.endfunc, undefined, "actor_move_run endfunc");

const expectedPain1Distances = [-5, 4, 1];
assert.equal(actorFrames.actor_frames_pain1.length, expectedPain1Distances.length, "actor_frames_pain1 has 3 C frames");
for (const [index, frame] of actorFrames.actor_frames_pain1.entries()) {
  assert.equal(frame.aifunc, ai_move, `actor_frames_pain1[${index}] uses ai_move`);
  assert.equal(frame.dist, expectedPain1Distances[index], `actor_frames_pain1[${index}] distance`);
  assert.equal(frame.thinkfunc, undefined, `actor_frames_pain1[${index}] thinkfunc`);
}
assert.equal(actorFrames.actor_move_pain1.firstframe, actorFrames.FRAME_pain101, "actor_move_pain1 firstframe");
assert.equal(actorFrames.actor_move_pain1.lastframe, actorFrames.FRAME_pain103, "actor_move_pain1 lastframe");
assert.equal(actorFrames.actor_move_pain1.frame, actorFrames.actor_frames_pain1, "actor_move_pain1 frame table");
assert.equal(actorFrames.actor_move_pain1.endfunc, actorFrames.actor_run, "actor_move_pain1 endfunc");

const expectedPain2Distances = [-4, 4, 0];
assert.equal(actorFrames.actor_frames_pain2.length, expectedPain2Distances.length, "actor_frames_pain2 has 3 C frames");
for (const [index, frame] of actorFrames.actor_frames_pain2.entries()) {
  assert.equal(frame.aifunc, ai_move, `actor_frames_pain2[${index}] uses ai_move`);
  assert.equal(frame.dist, expectedPain2Distances[index], `actor_frames_pain2[${index}] distance`);
  assert.equal(frame.thinkfunc, undefined, `actor_frames_pain2[${index}] thinkfunc`);
}
assert.equal(actorFrames.actor_move_pain2.firstframe, actorFrames.FRAME_pain201, "actor_move_pain2 firstframe");
assert.equal(actorFrames.actor_move_pain2.lastframe, actorFrames.FRAME_pain203, "actor_move_pain2 lastframe");
assert.equal(actorFrames.actor_move_pain2.frame, actorFrames.actor_frames_pain2, "actor_move_pain2 frame table");
assert.equal(actorFrames.actor_move_pain2.endfunc, actorFrames.actor_run, "actor_move_pain2 endfunc");

const expectedPain3Distances = [-1, 1, 0];
assert.equal(actorFrames.actor_frames_pain3.length, expectedPain3Distances.length, "actor_frames_pain3 has 3 C frames");
for (const [index, frame] of actorFrames.actor_frames_pain3.entries()) {
  assert.equal(frame.aifunc, ai_move, `actor_frames_pain3[${index}] uses ai_move`);
  assert.equal(frame.dist, expectedPain3Distances[index], `actor_frames_pain3[${index}] distance`);
  assert.equal(frame.thinkfunc, undefined, `actor_frames_pain3[${index}] thinkfunc`);
}
assert.equal(actorFrames.actor_move_pain3.firstframe, actorFrames.FRAME_pain301, "actor_move_pain3 firstframe");
assert.equal(actorFrames.actor_move_pain3.lastframe, actorFrames.FRAME_pain303, "actor_move_pain3 lastframe");
assert.equal(actorFrames.actor_move_pain3.frame, actorFrames.actor_frames_pain3, "actor_move_pain3 frame table");
assert.equal(actorFrames.actor_move_pain3.endfunc, actorFrames.actor_run, "actor_move_pain3 endfunc");

assert.equal(actorFrames.actor_frames_flipoff.length, 14, "actor_frames_flipoff has 14 C frames");
for (const [index, frame] of actorFrames.actor_frames_flipoff.entries()) {
  assert.equal(frame.aifunc, ai_turn, `actor_frames_flipoff[${index}] uses ai_turn`);
  assert.equal(frame.dist, 0, `actor_frames_flipoff[${index}] distance`);
  assert.equal(frame.thinkfunc, undefined, `actor_frames_flipoff[${index}] thinkfunc`);
}
assert.equal(actorFrames.actor_move_flipoff.firstframe, actorFrames.FRAME_flip01, "actor_move_flipoff firstframe");
assert.equal(actorFrames.actor_move_flipoff.lastframe, actorFrames.FRAME_flip14, "actor_move_flipoff lastframe");
assert.equal(actorFrames.actor_move_flipoff.frame, actorFrames.actor_frames_flipoff, "actor_move_flipoff frame table");
assert.equal(actorFrames.actor_move_flipoff.endfunc, actorFrames.actor_run, "actor_move_flipoff endfunc");

assert.equal(actorFrames.actor_frames_taunt.length, 17, "actor_frames_taunt has 17 C frames");
for (const [index, frame] of actorFrames.actor_frames_taunt.entries()) {
  assert.equal(frame.aifunc, ai_turn, `actor_frames_taunt[${index}] uses ai_turn`);
  assert.equal(frame.dist, 0, `actor_frames_taunt[${index}] distance`);
  assert.equal(frame.thinkfunc, undefined, `actor_frames_taunt[${index}] thinkfunc`);
}
assert.equal(actorFrames.actor_move_taunt.firstframe, actorFrames.FRAME_taunt01, "actor_move_taunt firstframe");
assert.equal(actorFrames.actor_move_taunt.lastframe, actorFrames.FRAME_taunt17, "actor_move_taunt lastframe");
assert.equal(actorFrames.actor_move_taunt.frame, actorFrames.actor_frames_taunt, "actor_move_taunt frame table");
assert.equal(actorFrames.actor_move_taunt.endfunc, actorFrames.actor_run, "actor_move_taunt endfunc");

const expectedAttackDistances = [-2, -2, 3, 2];
assert.equal(actorFrames.actor_frames_attack.length, expectedAttackDistances.length, "actor_frames_attack has 4 C frames");
for (const [index, frame] of actorFrames.actor_frames_attack.entries()) {
  assert.equal(frame.aifunc, ai_charge, `actor_frames_attack[${index}] uses ai_charge`);
  assert.equal(frame.dist, expectedAttackDistances[index], `actor_frames_attack[${index}] distance`);
  assert.equal(frame.thinkfunc, index === 0 ? actorFrames.actor_fire : undefined, `actor_frames_attack[${index}] thinkfunc`);
}
assert.equal(actorFrames.actor_move_attack.firstframe, actorFrames.FRAME_attak01, "actor_move_attack firstframe");
assert.equal(actorFrames.actor_move_attack.lastframe, actorFrames.FRAME_attak04, "actor_move_attack lastframe");
assert.equal(actorFrames.actor_move_attack.frame, actorFrames.actor_frames_attack, "actor_move_attack frame table");
assert.equal(actorFrames.actor_move_attack.endfunc, actorFrames.actor_run, "actor_move_attack endfunc");

const expectedDeath1Distances = [0, 0, -13, 14, 3, -2, 1];
assert.equal(actorFrames.actor_frames_death1.length, expectedDeath1Distances.length, "actor_frames_death1 has 7 C frames");
for (const [index, frame] of actorFrames.actor_frames_death1.entries()) {
  assert.equal(frame.aifunc, ai_move, `actor_frames_death1[${index}] uses ai_move`);
  assert.equal(frame.dist, expectedDeath1Distances[index], `actor_frames_death1[${index}] distance`);
  assert.equal(frame.thinkfunc, undefined, `actor_frames_death1[${index}] thinkfunc`);
}
assert.equal(actorFrames.actor_move_death1.firstframe, actorFrames.FRAME_death101, "actor_move_death1 firstframe");
assert.equal(actorFrames.actor_move_death1.lastframe, actorFrames.FRAME_death107, "actor_move_death1 lastframe");
assert.equal(actorFrames.actor_move_death1.frame, actorFrames.actor_frames_death1, "actor_move_death1 frame table");
assert.equal(actorFrames.actor_move_death1.endfunc, actorFrames.actor_dead, "actor_move_death1 endfunc");

const expectedDeath2Distances = [0, 7, -6, -5, 1, 0, -1, -2, -1, -9, -13, -13, 0];
assert.equal(actorFrames.actor_frames_death2.length, expectedDeath2Distances.length, "actor_frames_death2 has 13 C frames");
for (const [index, frame] of actorFrames.actor_frames_death2.entries()) {
  assert.equal(frame.aifunc, ai_move, `actor_frames_death2[${index}] uses ai_move`);
  assert.equal(frame.dist, expectedDeath2Distances[index], `actor_frames_death2[${index}] distance`);
  assert.equal(frame.thinkfunc, undefined, `actor_frames_death2[${index}] thinkfunc`);
}
assert.equal(actorFrames.actor_move_death2.firstframe, actorFrames.FRAME_death201, "actor_move_death2 firstframe");
assert.equal(actorFrames.actor_move_death2.lastframe, actorFrames.FRAME_death213, "actor_move_death2 lastframe");
assert.equal(actorFrames.actor_move_death2.frame, actorFrames.actor_frames_death2, "actor_move_death2 frame table");
assert.equal(actorFrames.actor_move_death2.endfunc, actorFrames.actor_dead, "actor_move_death2 endfunc");

const path = spawnGameEntity(runtime);
path.classname = "target_actor";
path.targetname = "actor_path";
path.spawnflags = 1;
path.properties.height = "240";
path.s.angles = [0, 0, 0];
ED_CallSpawn(path, runtime);

assert.equal(path.solid, SOLID_TRIGGER, "target_actor solid");
assert.equal(path.svflags, SVF_NOCLIENT, "target_actor svflags");
assert.equal(path.speed, 200, "target_actor default speed");
assert.equal(path.movedir[2], 240, "target_actor jump height");
assert.deepEqual(path.mins, [-8, -8, -8], "target_actor mins");
assert.deepEqual(path.maxs, [8, 8, 8], "target_actor maxs");
assert.equal(path.linked, true, "target_actor is linked as trigger");

const actor = spawnGameEntity(runtime);
actor.classname = "misc_actor";
actor.targetname = "wake_actor";
actor.target = "actor_path";
ED_CallSpawn(actor, runtime);

assert.equal(actor.movetype, MOVETYPE_STEP, "misc_actor movetype");
assert.equal(actor.solid, SOLID_BBOX, "misc_actor solid");
assert.equal(actor.health, 100, "misc_actor default health");
assert.equal(actor.mass, 200, "misc_actor mass");
assert.equal((actor.monsterinfo.aiflags & AI_GOOD_GUY) !== 0, true, "misc_actor good guy");
assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_stand, "misc_actor stand move");
assert.equal(actor.monsterinfo.scale, actorFrames.MODEL_SCALE, "misc_actor scale");
assert.equal(runtime.assets.modelPaths[actor.s.modelindex - 1], "players/male/tris.md2", "misc_actor model");
assert.equal(typeof actor.pain, "function", "misc_actor pain callback");
assert.equal(typeof actor.die, "function", "misc_actor die callback");
assert.equal(typeof actor.use, "function", "misc_actor use callback");

const dmRuntime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
dmRuntime.deathmatch = true;
dmRuntime.maxclients = 1;
for (let n = 0; n < 10; n += 1) {
  const filler = spawnGameEntity(dmRuntime);
  filler.classname = "reserved_test_slot";
}
const dmActor = spawnGameEntity(dmRuntime);
dmActor.classname = "misc_actor";
dmActor.targetname = "dm_actor";
dmActor.target = "actor_path";
ED_CallSpawn(dmActor, dmRuntime);
assert.equal(dmActor.inuse, false, "SP_misc_actor frees actors in deathmatch");

while (runtime.entities.length <= runtime.maxclients + 9) {
  const filler = spawnGameEntity(runtime);
  filler.classname = "reserved_test_slot";
}
const untargetedActor = spawnGameEntity(runtime);
untargetedActor.classname = "misc_actor";
untargetedActor.target = "actor_path";
ED_CallSpawn(untargetedActor, runtime);
assert.equal(untargetedActor.inuse, false, "SP_misc_actor frees untargeted actors");

const noTargetActor = spawnGameEntity(runtime);
noTargetActor.classname = "misc_actor";
noTargetActor.targetname = "no_target_actor";
ED_CallSpawn(noTargetActor, runtime);
assert.equal(noTargetActor.inuse, false, "SP_misc_actor frees actors with no target");

const originalRandom = Math.random;
try {
  Math.random = () => 0.5;
  runtime.time = 0;
  actor.s.frame = 0;
  actorFrames.actor_stand(actor, runtime);
  assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_stand, "actor_stand selects stand move");
  assert.equal(actor.s.frame, actorFrames.FRAME_stand101 + 20, "actor_stand randomizes startup frame inside stand span");

  runtime.time = 1;
  actor.s.frame = 1234;
  actorFrames.actor_stand(actor, runtime);
  assert.equal(actor.s.frame, 1234, "actor_stand preserves frame after startup window");
} finally {
  Math.random = originalRandom;
}

actorFrames.actor_walk(actor);
assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_walk, "actor_walk selects walk move");

runtime.time = actor.pain_debounce_time - 0.1;
actor.enemy = null;
actor.movetarget = path;
actorFrames.actor_run(actor, runtime);
assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_walk, "actor_run walks during pain debounce when movetarget exists");

actor.movetarget = null;
actorFrames.actor_run(actor, runtime);
assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_stand, "actor_run stands during pain debounce without enemy or movetarget");

runtime.time = actor.pain_debounce_time + 0.1;
actor.monsterinfo.aiflags |= AI_STAND_GROUND;
actorFrames.actor_run(actor, runtime);
assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_stand, "actor_run stands when AI_STAND_GROUND is set");

actor.monsterinfo.aiflags &= ~AI_STAND_GROUND;
actor.enemy = player;
actorFrames.actor_run(actor, runtime);
assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_run, "actor_run selects run move outside debounce and stand-ground");
actor.enemy = null;

for (const [randomValue, expectedMove] of [
  [0, actorFrames.actor_move_pain1],
  [0.4, actorFrames.actor_move_pain2],
  [0.9, actorFrames.actor_move_pain3]
] as const) {
  try {
    Math.random = () => randomValue;
    runtime.time = actor.pain_debounce_time + 0.1;
    actor.pain_debounce_time = runtime.time - 1;
    actor.health = actor.max_health;
    actor.s.skinnum = 0;
    actorFrames.actor_pain(actor, null, 0, 1, runtime);
    assert.equal(actor.pain_debounce_time, runtime.time + 3, "actor_pain sets 3 second debounce");
    assert.equal(actor.s.skinnum, 0, "actor_pain preserves skin above half health");
    assert.equal(actor.monsterinfo.currentmove, expectedMove, "actor_pain selects the C pain move for rand()%3");
  } finally {
    Math.random = originalRandom;
  }
}

try {
  Math.random = () => 0;
  runtime.time = actor.pain_debounce_time + 0.1;
  actor.pain_debounce_time = runtime.time - 1;
  actor.health = Math.trunc(actor.max_health / 2) - 1;
  actor.s.skinnum = 0;
  actorFrames.actor_pain(actor, null, 0, 1, runtime);
  assert.equal(actor.s.skinnum, 1, "actor_pain switches skin below half health");

  const moveBeforeDebounce = actor.monsterinfo.currentmove;
  const debounceBeforeReturn = actor.pain_debounce_time;
  actor.health = actor.max_health;
  actor.s.skinnum = 0;
  runtime.time = debounceBeforeReturn - 0.1;
  actorFrames.actor_pain(actor, null, 0, 1, runtime);
  assert.equal(actor.s.skinnum, 0, "actor_pain checks skin before debounce return");
  assert.equal(actor.pain_debounce_time, debounceBeforeReturn, "actor_pain debounce return preserves debounce time");
  assert.equal(actor.monsterinfo.currentmove, moveBeforeDebounce, "actor_pain debounce return preserves current move");
  assert.equal(drainGameCprintfEvents(runtime).length, 0, "actor_pain debounce return emits no chat");
} finally {
  Math.random = originalRandom;
}

try {
  Math.random = (() => {
    const values = [0.2, 0.25, 0.65];
    return () => values.shift() ?? 0;
  })();
  runtime.time = actor.pain_debounce_time + 0.1;
  actor.pain_debounce_time = runtime.time - 1;
  actor.health = actor.max_health;
  actor.s.origin = [0, 0, 0];
  player.s.origin = [0, 64, 0];
  actorFrames.actor_pain(actor, player, 0, 1, runtime);
  const painPrints = drainGameCprintfEvents(runtime);
  assert.equal(actor.ideal_yaw, 90, "actor_pain faces the attacking client");
  assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_flipoff, "actor_pain client branch can select flipoff");
  assert.equal(painPrints.length, 1, "actor_pain player taunt emits one cprintf");
  assert.equal(painPrints[0].entityIndex, player.index, "actor_pain message targets attacker client");
  assert.equal(
    painPrints[0].message,
    `${actorFrames.actor_names[actor.index % actorFrames.MAX_ACTOR_NAMES]}: #$@*&!\n`,
    "actor_pain message uses the C messages table"
  );
} finally {
  Math.random = originalRandom;
}

try {
  Math.random = (() => {
    const values = [0.2, 0.75, 0.1];
    return () => values.shift() ?? 0;
  })();
  runtime.time = actor.pain_debounce_time + 0.1;
  actor.pain_debounce_time = runtime.time - 1;
  actorFrames.actor_pain(actor, player, 0, 1, runtime);
  const painPrints = drainGameCprintfEvents(runtime);
  assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_taunt, "actor_pain client branch can select taunt");
  assert.equal(
    painPrints[0]?.message,
    `${actorFrames.actor_names[actor.index % actorFrames.MAX_ACTOR_NAMES]}: Watch it!\n`,
    "actor_pain chat uses rand()%3 and excludes the fourth C table string"
  );
} finally {
  Math.random = originalRandom;
}

actor.use?.(actor, player, player, runtime);
assert.equal(actor.movetarget, path, "actor_use picks target_actor");
assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_walk, "actor_use starts walking");
assert.equal(actor.target, undefined, "actor_use clears actor target after starting path");

const yawPath = spawnGameEntity(runtime);
yawPath.classname = "target_actor";
yawPath.targetname = "actor_path_yaw";
yawPath.origin = [0, 64, 0];
yawPath.s.origin = [0, 64, 0];
ED_CallSpawn(yawPath, runtime);
const yawActor = spawnGameEntity(runtime);
yawActor.classname = "misc_actor";
yawActor.targetname = "yaw_actor";
yawActor.target = "actor_path_yaw";
yawActor.origin = [0, 0, 0];
yawActor.s.origin = [0, 0, 0];
ED_CallSpawn(yawActor, runtime);
yawActor.use?.(yawActor, player, player, runtime);
assert.equal(yawActor.ideal_yaw, 90, "actor_use computes yaw toward selected target_actor");
assert.equal(yawActor.s.angles[1], 90, "actor_use stores yaw in entity state angles");
assert.equal(yawActor.monsterinfo.currentmove, actorFrames.actor_move_walk, "actor_use starts yaw actor walking");

const wrongTarget = spawnGameEntity(runtime);
wrongTarget.classname = "info_not_actor";
wrongTarget.targetname = "wrong_actor_target";
const badActor = spawnGameEntity(runtime);
badActor.classname = "misc_actor";
badActor.targetname = "bad_actor";
badActor.target = "wrong_actor_target";
badActor.monsterinfo.stand = actorFrames.actor_stand;
runtime.logEntries.length = 0;
badActor.use = actorFrames.actor_use;
badActor.use(badActor, player, player, runtime);
assert.equal(badActor.target, undefined, "actor_use bad target clears target");
assert.equal(badActor.monsterinfo.pausetime, 100000000, "actor_use bad target pauses forever");
assert.equal(badActor.monsterinfo.currentmove, actorFrames.actor_move_stand, "actor_use bad target returns to stand");
assert.equal(
  runtime.logEntries.some((entry) => entry.message.includes("misc_actor has bad target wrong_actor_target")),
  true,
  "actor_use bad target emits warning"
);

actorFrames.actorMachineGun(actor, runtime);
const flashes = drainMonsterMuzzleFlashEvents(runtime);
assert.equal(flashes.length, 1, "actor machinegun queues one monster muzzleflash");
assert.equal(flashes[0].entityIndex, actor.index, "actor muzzleflash source entity");
assert.equal(flashes[0].flashNumber, actorFrames.MZ2_ACTOR_MACHINEGUN_1, "actor muzzleflash id");

actor.enemy = player;
actor.s.angles = [0, 90, 0];
actor.s.origin = [48, 64, 24];
player.health = 100;
player.s.origin = [128, 64, 32];
player.velocity = [10, 0, 0];
player.viewheight = 22;
actorFrames.actorMachineGun(actor, runtime);
const aimedFlash = drainMonsterMuzzleFlashEvents(runtime);
assert.equal(aimedFlash.length, 1, "actorMachineGun live enemy branch emits one muzzleflash");
assert.equal(aimedFlash[0].flashNumber, actorFrames.MZ2_ACTOR_MACHINEGUN_1, "actorMachineGun live enemy flash id");

player.health = 0;
player.absmin = [120, 56, 16];
player.size = [16, 16, 48];
actorFrames.actorMachineGun(actor, runtime);
const deadEnemyFlash = drainMonsterMuzzleFlashEvents(runtime);
assert.equal(deadEnemyFlash.length, 1, "actorMachineGun dead enemy branch emits one muzzleflash");

actor.enemy = null;
runtime.time = 12;
actor.monsterinfo.pausetime = runtime.time + 0.2;
actor.monsterinfo.aiflags &= ~AI_HOLD_FRAME;
actorFrames.actor_fire(actor, runtime);
assert.equal((actor.monsterinfo.aiflags & AI_HOLD_FRAME) !== 0, true, "actor_fire holds frame before pausetime");
assert.equal(drainMonsterMuzzleFlashEvents(runtime).length, 1, "actor_fire emits machinegun muzzleflash");

actor.monsterinfo.pausetime = runtime.time;
actorFrames.actor_fire(actor, runtime);
assert.equal((actor.monsterinfo.aiflags & AI_HOLD_FRAME) === 0, true, "actor_fire clears hold frame at pausetime");
assert.equal(drainMonsterMuzzleFlashEvents(runtime).length, 1, "actor_fire clear branch still fires");

try {
  Math.random = () => 0;
  runtime.time = 20;
  actorFrames.actor_attack(actor, runtime);
  assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_attack, "actor_attack selects attack move");
  assert.equal(actor.monsterinfo.pausetime, runtime.time + 10 * 0.1, "actor_attack lower random bound matches (rand&15)+10 frames");
} finally {
  Math.random = originalRandom;
}

try {
  Math.random = () => 0.999999;
  actorFrames.actor_attack(actor, runtime);
  assert.equal(actor.monsterinfo.pausetime >= runtime.time + 10 * 0.1, true, "actor_attack pausetime keeps C lower bound");
  assert.equal(actor.monsterinfo.pausetime <= runtime.time + 25 * 0.1, true, "actor_attack pausetime keeps C upper bound");
} finally {
  Math.random = originalRandom;
}

actor.enemy = player;
player.health = 100;
runtime.time = 30;
actor.monsterinfo.aiflags &= ~AI_HOLD_FRAME;
actor.monsterinfo.pausetime = runtime.time + 0.5;
actor.monsterinfo.currentmove = actorFrames.actor_move_attack;
actor.s.frame = 999;
M_MoveFrame(actor, runtime);
const moveFrameFlash = drainMonsterMuzzleFlashEvents(runtime);
assert.equal(actor.s.frame, actorFrames.FRAME_attak01, "M_MoveFrame enters actor attack first frame");
assert.equal(moveFrameFlash.length, 1, "M_MoveFrame reaches actor_fire and queues muzzleflash");
assert.equal((actor.monsterinfo.aiflags & AI_HOLD_FRAME) !== 0, true, "actor_fire hold flag affects M_MoveFrame attack loop");

const deathActor = spawnGameEntity(runtime);
deathActor.classname = "misc_actor";
deathActor.targetname = "death_actor";
deathActor.target = "actor_path";
ED_CallSpawn(deathActor, runtime);
deathActor.takedamage = damage_t.DAMAGE_YES;

try {
  Math.random = () => 0;
  deathActor.health = 10;
  deathActor.deadflag = 0;
  T_Damage(deathActor, player, player, [1, 0, 0], deathActor.s.origin, [0, 0, 1], 15, 0, 0, MOD_HIT, runtime);
  assert.equal(deathActor.deadflag, DEAD_DEAD, "actor_die marks ordinary death as DEAD_DEAD via T_Damage");
  assert.equal(deathActor.takedamage, damage_t.DAMAGE_YES, "actor_die keeps corpse damage enabled like DAMAGE_YES");
  assert.equal(deathActor.monsterinfo.currentmove, actorFrames.actor_move_death1, "actor_die rand()%2 lower branch selects death1");
  assert.equal(drainGameSoundEvents(runtime).length, 0, "actor_die ordinary death emits no sound because C sound call is commented");
} finally {
  Math.random = originalRandom;
}

const deadMoveBefore = deathActor.monsterinfo.currentmove;
deathActor.s.frame = actorFrames.actor_move_death1.lastframe;
const linkcountBeforeDead = deathActor.linkcount;
M_MoveFrame(deathActor, runtime);
assert.equal(deathActor.monsterinfo.currentmove, deadMoveBefore, "actor_dead leaves death move in place");
assert.deepEqual(deathActor.mins, [-16, -16, -24], "actor_dead final mins");
assert.deepEqual(deathActor.maxs, [16, 16, -8], "actor_dead final maxs");
assert.equal(deathActor.movetype, MOVETYPE_TOSS, "actor_dead switches to MOVETYPE_TOSS");
assert.equal((deathActor.svflags & SVF_DEADMONSTER) !== 0, true, "actor_dead sets SVF_DEADMONSTER");
assert.equal(deathActor.nextthink, 0, "actor_dead clears nextthink");
assert.equal(deathActor.linked, true, "actor_dead relinks corpse");
assert.equal(deathActor.linkcount, linkcountBeforeDead + 1, "actor_dead relink increments linkcount");
assert.deepEqual(deathActor.absmin, deathActor.s.origin.map((value, index) => value + deathActor.mins[index]), "actor_dead refreshes absmin for corpse bbox");

try {
  Math.random = () => 0.75;
  deathActor.health = 10;
  deathActor.deadflag = 0;
  actorFrames.actor_die(deathActor, player, player, 15, runtime);
  assert.equal(deathActor.monsterinfo.currentmove, actorFrames.actor_move_death2, "actor_die rand()%2 upper branch selects death2");
} finally {
  Math.random = originalRandom;
}

const unchangedMove = deathActor.monsterinfo.currentmove;
actorFrames.actor_die(deathActor, player, player, 15, runtime);
assert.equal(deathActor.monsterinfo.currentmove, unchangedMove, "actor_die returns when already DEAD_DEAD");

const gibActor = spawnGameEntity(runtime);
gibActor.classname = "misc_actor";
gibActor.targetname = "gib_actor";
gibActor.target = "actor_path";
ED_CallSpawn(gibActor, runtime);
gibActor.takedamage = damage_t.DAMAGE_YES;
gibActor.health = -90;
const existingEntityIndexesBeforeGibs = new Set(runtime.entities.filter((entity) => entity?.inuse).map((entity) => entity.index));
try {
  Math.random = () => 0;
  actorFrames.actor_die(gibActor, player, player, 120, runtime);
} finally {
  Math.random = originalRandom;
}
const spawnedGibs = runtime.entities.filter(
  (entity) => entity?.inuse && !existingEntityIndexesBeforeGibs.has(entity.index)
);
const spawnedGibModels = spawnedGibs.map((entity) => runtime.assets.modelPaths[entity.s.modelindex - 1]);
assert.equal(gibActor.deadflag, DEAD_DEAD, "actor_die gib branch marks DEAD_DEAD");
assert.equal(spawnedGibs.length, 6, "actor_die gib branch spawns two bone and four meat gibs");
assert.equal(
  spawnedGibModels.filter((model) => model === "models/objects/gibs/bone/tris.md2").length,
  2,
  "actor_die local n loop spawns two bone gibs"
);
assert.equal(
  spawnedGibModels.filter((model) => model === "models/objects/gibs/sm_meat/tris.md2").length,
  4,
  "actor_die local n loop spawns four meat gibs"
);
assert.equal(runtime.assets.modelPaths[gibActor.s.modelindex - 1], "models/objects/gibs/head2/tris.md2", "actor_die throws head model");
assert.equal(gibActor.solid, SOLID_NOT, "actor_die head gib becomes nonsolid");
assert.equal(drainGameSoundEvents(runtime).length, 0, "actor_die gib death emits no sound because C sound call is commented");

actor.enemy = null;
actor.movetarget = path;
path.message = "move out";
path.touch?.(path, actor, runtime);
const prints = drainGameCprintfEvents(runtime);
assert.equal(prints.length, 1, "target_actor message emits one cprintf for one client");
assert.equal(prints[0].entityIndex, player.index, "target_actor message target client");
assert.equal(
  prints[0].message,
  `${actorFrames.actor_names[actor.index % actorFrames.MAX_ACTOR_NAMES]}: move out\n`,
  "target_actor message uses actor_names indexed by entity number modulo MAX_ACTOR_NAMES"
);
assert.equal(prints[0].message.endsWith(": move out\n"), true, "target_actor message text");

assert.equal(actor.groundentity, null, "target_actor jump clears ground entity when absent");

path.message = undefined;
path.spawnflags = 1;
path.speed = 250;
path.movedir = [0.5, 0.25, 300];
actor.movetarget = path;
actor.enemy = null;
actor.velocity = [0, 0, 0];
actor.groundentity = player;
path.touch?.(path, actor, runtime);
const jumpSounds = drainGameSoundEvents(runtime);
assert.deepEqual(actor.velocity, [125, 62.5, 300], "target_actor jump applies movedir speed and height");
assert.equal(actor.groundentity, null, "target_actor jump clears groundentity");
assert.equal(jumpSounds.at(-1)?.soundPath, "player/male/jump1.wav", "target_actor grounded jump emits jump sound");
assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_stand, "target_actor terminal jump returns actor to stand");
assert.equal(actor.monsterinfo.pausetime, runtime.time + 100000000, "target_actor terminal jump pauses actor forever");

path.spawnflags = 4 | 16 | 32;
path.pathtarget = "enemy_target";
const enemy = spawnGameEntity(runtime);
enemy.classname = "enemy_target";
enemy.targetname = "enemy_target";
actor.movetarget = path;
actor.enemy = null;
path.touch?.(path, actor, runtime);
assert.equal(actor.enemy, enemy, "target_actor attack picks pathtarget enemy");
assert.equal((actor.monsterinfo.aiflags & AI_STAND_GROUND) !== 0, true, "target_actor hold sets stand ground");
assert.equal((actor.monsterinfo.aiflags & AI_BRUTAL) !== 0, true, "target_actor brutal flag");

path.spawnflags = 4;
actor.movetarget = path;
actor.enemy = null;
actor.monsterinfo.aiflags &= ~AI_STAND_GROUND;
path.touch?.(path, actor, runtime);
assert.equal(actor.enemy, enemy, "target_actor attack without hold picks enemy");
assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_run, "target_actor attack without hold starts actor_run");

path.spawnflags = 2 | 4;
actor.movetarget = path;
actor.enemy = null;
path.touch?.(path, actor, runtime);
assert.equal(actor.enemy, null, "target_actor SHOOT branch stays empty and suppresses ATTACK branch like C");

const nextPath = spawnGameEntity(runtime);
nextPath.classname = "target_actor";
nextPath.targetname = "next_actor_path";
nextPath.origin = [128, 0, 0];
nextPath.s.origin = [128, 0, 0];
ED_CallSpawn(nextPath, runtime);
path.spawnflags = 0;
path.pathtarget = undefined;
path.target = "next_actor_path";
actor.origin = [0, 0, 0];
actor.s.origin = [0, 0, 0];
actor.movetarget = path;
actor.enemy = null;
actor.goalentity = null;
path.touch?.(path, actor, runtime);
assert.equal(actor.movetarget, nextPath, "target_actor selects next path target");
assert.equal(actor.goalentity, nextPath, "target_actor uses next path as goal when no goalentity exists");
assert.equal(actor.ideal_yaw, 0, "target_actor faces the next path target");

const pathtargetTrigger = spawnGameEntity(runtime);
pathtargetTrigger.classname = "target_actor";
pathtargetTrigger.targetname = "pathtarget_trigger";
pathtargetTrigger.target = "restore_target";
pathtargetTrigger.pathtarget = "script_action";
ED_CallSpawn(pathtargetTrigger, runtime);
actor.movetarget = pathtargetTrigger;
actor.enemy = null;
runtime.logEntries.length = 0;
pathtargetTrigger.touch?.(pathtargetTrigger, actor, runtime);
assert.equal(pathtargetTrigger.target, "restore_target", "target_actor restores target after pathtarget G_UseTargets");
assert.equal(
  runtime.logEntries.some((entry) => entry.kind === "use-targets" && entry.entityIndex === pathtargetTrigger.index),
  true,
  "target_actor pathtarget dispatches G_UseTargets"
);

path.message = "runtime touch";
path.spawnflags = 0;
path.target = undefined;
path.pathtarget = undefined;
path.origin = [...actor.origin];
path.s.origin = [...actor.s.origin];
actor.movetarget = path;
actor.enemy = null;
linkGameEntity(runtime, path);
linkGameEntity(runtime, actor);
G_TouchTriggers(runtime, actor);
const runtimeTouchPrints = drainGameCprintfEvents(runtime);
assert.equal(runtimeTouchPrints.at(-1)?.message.endsWith(": runtime touch\n"), true, "G_TouchTriggers reaches target_actor_touch");

const namelessTarget = spawnGameEntity(runtime);
namelessTarget.classname = "target_actor";
runtime.logEntries.length = 0;
ED_CallSpawn(namelessTarget, runtime);
assert.equal(namelessTarget.solid, SOLID_TRIGGER, "SP_target_actor without targetname still spawns trigger");
assert.equal(
  runtime.logEntries.some((entry) => entry.message.includes("target_actor with no targetname")),
  true,
  "SP_target_actor logs missing targetname"
);

console.log("quake2-m-actor: ok");
