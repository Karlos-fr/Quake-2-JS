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
  AI_GOOD_GUY,
  AI_BRUTAL,
  AI_STAND_GROUND,
  ED_CallSpawn,
  MOVETYPE_STEP,
  SOLID_BBOX,
  SOLID_TRIGGER,
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
  drainMonsterMuzzleFlashEvents,
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
assert.equal(typeof actor.use, "function", "misc_actor use callback");

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

try {
  Math.random = (() => {
    const values = [0.2, 0.25, 0.65];
    return () => values.shift() ?? 0;
  })();
  runtime.time = actor.pain_debounce_time + 0.1;
  actor.pain_debounce_time = runtime.time - 1;
  actor.health = actor.max_health;
  actorFrames.actor_pain(actor, player, 0, 1, runtime);
  const painPrints = drainGameCprintfEvents(runtime);
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

actor.use?.(actor, player, player, runtime);
assert.equal(actor.movetarget, path, "actor_use picks target_actor");
assert.equal(actor.monsterinfo.currentmove, actorFrames.actor_move_walk, "actor_use starts walking");

actorFrames.actorMachineGun(actor, runtime);
const flashes = drainMonsterMuzzleFlashEvents(runtime);
assert.equal(flashes.length, 1, "actor machinegun queues one monster muzzleflash");
assert.equal(flashes[0].entityIndex, actor.index, "actor muzzleflash source entity");
assert.equal(flashes[0].flashNumber, actorFrames.MZ2_ACTOR_MACHINEGUN_1, "actor muzzleflash id");

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

console.log("quake2-m-actor: ok");
