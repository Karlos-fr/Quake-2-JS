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
