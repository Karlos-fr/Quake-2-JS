/**
 * File: quake2-g-trigger.ts
 * Purpose: Verify the Quake II `game/g_trigger.c` port against the current gameplay runtime.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the trigger families now attached to `packages/game/src/g_trigger.ts`.
 *
 * Dependencies:
 * - packages/game/src/g_trigger.ts
 * - packages/game/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import {
  FRAMETIME,
  ITEM_INDEX,
  SOLID_NOT,
  SOLID_TRIGGER,
  SVF_MONSTER,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  linkGameEntity,
  runPendingThinks,
  spawnGameEntity
} from "../../packages/game/src/index.js";
import { FindItemByClassname } from "../../packages/game/src/g_items.js";
import {
  SP_trigger_counter,
  SP_trigger_gravity,
  SP_trigger_hurt,
  SP_trigger_key,
  SP_trigger_always,
  SP_trigger_monsterjump,
  SP_trigger_multiple,
  SP_trigger_once,
  SP_trigger_push,
  SP_trigger_relay,
  Touch_Multi,
  trigger_counter_use,
  trigger_key_use,
  trigger_push_touch,
  trigger_relay_use
} from "../../packages/game/src/g_trigger.js";
import type { GameEntity, GameRuntime } from "../../packages/game/src/index.js";

verifyTriggerMultipleDirectionalTouch();
verifyTriggerOnceRemoval();
verifyTriggerRelay();
verifyTriggerKey();
verifyTriggerCounter();
verifyTriggerAlways();
verifyTriggerPush();
verifyTriggerHurt();
verifyTriggerGravity();
verifyTriggerMonsterJump();

console.log("quake2-g-trigger: ok");

function verifyTriggerMultipleDirectionalTouch(): void {
  const runtime = createRuntime();
  const ent = spawnGameEntity(runtime);
  ent.classname = "trigger_multiple";
  ent.model = "models/test/trigger.md2";
  ent.s.angles = [0, 90, 0];
  ent.angles = [0, 90, 0];

  SP_trigger_multiple(ent, runtime);
  assert.equal(ent.wait, 0.2, "trigger_multiple default wait mismatch");
  assert.equal(ent.solid, SOLID_TRIGGER, "trigger_multiple solid mismatch");
  assert.ok(ent.linked, "trigger_multiple must relink after spawn");
  assert.ok(ent.s.modelindex > 0, "trigger_multiple must register its model");

  const actor = createPlayer(runtime);
  actor.s.angles = [0, 270, 0];
  Touch_Multi(ent, actor, runtime);
  assert.equal(ent.nextthink, 0, "back-facing activator must not trigger directional trigger");

  actor.s.angles = [0, 90, 0];
  Touch_Multi(ent, actor, runtime);
  assert.equal(ent.activator, actor, "touch activator mismatch");
  assert.equal(ent.nextthink, runtime.time + ent.wait, "touch activation wait mismatch");
}

function verifyTriggerOnceRemoval(): void {
  const runtime = createRuntime();
  const legacy = spawnGameEntity(runtime);
  legacy.classname = "trigger_once";
  legacy.spawnflags = 1;
  SP_trigger_once(legacy, runtime);
  assert.equal((legacy.spawnflags & 4) !== 0, true, "legacy TRIGGERED flag fixup mismatch");

  const ent = spawnGameEntity(runtime);
  ent.classname = "trigger_once";
  SP_trigger_once(ent, runtime);

  const actor = createPlayer(runtime);
  ent.use?.(ent, null, actor, runtime);
  runPendingThinks(runtime, runtime.time + FRAMETIME);
  assert.equal(ent.inuse, false, "trigger_once must free itself after firing");
}

function verifyTriggerRelay(): void {
  const runtime = createRuntime();
  const relay = spawnGameEntity(runtime);
  relay.classname = "trigger_relay";
  relay.target = "relay_target";
  SP_trigger_relay(relay, runtime);

  assert.equal(relay.solid, SOLID_NOT, "trigger_relay must remain non-solid");
  assert.equal(relay.use, trigger_relay_use, "trigger_relay use callback mismatch");

  const target = spawnGameEntity(runtime);
  target.classname = "target_test";
  target.targetname = "relay_target";
  let used = false;
  target.use = (_self, other, activator) => {
    used = other === relay && activator?.classname === "player";
  };

  const actor = createPlayer(runtime);
  relay.use?.(relay, null, actor, runtime);
  assert.equal(used, true, "trigger_relay must fire its targets with the original activator");
}

function verifyTriggerKey(): void {
  const runtime = createRuntime();
  const keyItem = FindItemByClassname("key_data_cd");
  assert.ok(keyItem, "key_data_cd item missing");

  const player = createPlayer(runtime);
  const coopMate = createPlayer(runtime);

  const trigger = spawnGameEntity(runtime);
  trigger.classname = "trigger_key";
  trigger.properties.item = "key_data_cd";
  trigger.target = "door_target";
  SP_trigger_key(trigger, runtime);

  trigger_key_use(trigger, null, player, runtime);
  assert.equal(runtime.soundEvents.at(-1)?.soundPath, "misc/keytry.wav", "missing-key sound mismatch");

  player.client!.pers.inventory[ITEM_INDEX(keyItem)] = 1;
  coopMate.client!.pers.inventory[ITEM_INDEX(keyItem)] = 1;

  trigger_key_use(trigger, null, player, runtime);
  assert.equal(player.client!.pers.inventory[ITEM_INDEX(keyItem)], 0, "trigger_key must consume activator key");
  assert.equal(coopMate.client!.pers.inventory[ITEM_INDEX(keyItem)], 0, "trigger_key must clear coop keys");
  assert.equal(trigger.use, undefined, "trigger_key must disable itself after success");
}

function verifyTriggerCounter(): void {
  const runtime = createRuntime();
  const trigger = spawnGameEntity(runtime);
  trigger.classname = "trigger_counter";
  SP_trigger_counter(trigger, runtime);

  const activator = createPlayer(runtime);
  trigger_counter_use(trigger, null, activator, runtime);
  assert.equal(trigger.count, 1, "trigger_counter first decrement mismatch");
  assert.equal(runtime.logEntries.at(-1)?.message, "1 more to go...", "trigger_counter countdown message mismatch");
  assert.equal(runtime.soundEvents.at(-1)?.soundPath, "misc/talk1.wav", "trigger_counter countdown sound mismatch");

  trigger_counter_use(trigger, null, activator, runtime);
  assert.equal(trigger.count, 0, "trigger_counter final decrement mismatch");
  assert.equal(runtime.logEntries.at(-2)?.message, "Sequence completed!", "trigger_counter completion message mismatch");
  assert.equal(runtime.soundEvents.at(-1)?.soundPath, "misc/talk1.wav", "trigger_counter completion sound mismatch");
  assert.equal(trigger.nextthink, runtime.time + FRAMETIME, "trigger_counter should schedule deferred removal");

  const silent = spawnGameEntity(runtime);
  silent.classname = "trigger_counter";
  silent.spawnflags = 1;
  SP_trigger_counter(silent, runtime);
  const logCount = runtime.logEntries.length;
  const soundCount = runtime.soundEvents.length;
  trigger_counter_use(silent, null, activator, runtime);
  assert.equal(runtime.logEntries.length, logCount, "trigger_counter nomessage must suppress countdown log");
  assert.equal(runtime.soundEvents.length, soundCount, "trigger_counter nomessage must suppress countdown sound");
}

function verifyTriggerAlways(): void {
  const runtime = createRuntime();
  const trigger = spawnGameEntity(runtime);
  trigger.classname = "trigger_always";
  trigger.target = "always_target";

  const target = spawnGameEntity(runtime);
  target.classname = "target_test";
  target.targetname = "always_target";
  let used = false;
  target.use = (_self, other, activator) => {
    used = other?.classname === "DelayedUse" && activator === trigger;
  };

  SP_trigger_always(trigger, runtime);
  assert.equal(trigger.delay, 0.2, "trigger_always must enforce the original minimum delay");
  assert.equal(used, false, "trigger_always must delay target firing until the next think window");
  runPendingThinks(runtime, runtime.time + 0.2);
  assert.equal(used, true, "trigger_always must fire targets with itself as activator");
}

function verifyTriggerPush(): void {
  const runtime = createRuntime();
  const trigger = spawnGameEntity(runtime);
  trigger.classname = "trigger_push";
  trigger.s.angles = [0, -1, 0];
  trigger.angles = [0, -1, 0];
  SP_trigger_push(trigger, runtime);
  assert.equal(trigger.touch, trigger_push_touch, "trigger_push touch callback mismatch");
  assert.equal(trigger.speed, 1000, "trigger_push default speed mismatch");
  assert.equal(trigger.solid, SOLID_TRIGGER, "trigger_push solid mismatch");
  assert.ok(trigger.linked, "trigger_push must relink after spawn");
  assert.equal(runtime.assets.soundPaths[trigger.noise_index - 1], "misc/windfly.wav", "trigger_push wind sound registration mismatch");

  const grenade = spawnGameEntity(runtime);
  grenade.classname = "grenade";
  grenade.health = 0;
  trigger.touch?.(trigger, grenade, runtime);
  assert.deepEqual(grenade.velocity, [0, 0, 10000], "trigger_push must push grenades regardless of health");
  assert.equal(runtime.soundEvents.length, 0, "trigger_push grenade branch must not play wind sound");

  const actor = createPlayer(runtime);
  actor.health = 100;

  trigger.touch?.(trigger, actor, runtime);
  assert.deepEqual(actor.velocity, [0, 0, 10000], "trigger_push must apply movedir * speed * 10");
  assert.deepEqual(actor.client?.oldvelocity, actor.velocity, "trigger_push must copy oldvelocity");
  assert.equal(runtime.soundEvents.length, 0, "trigger_push must require fly_sound_debounce_time < level.time");

  runtime.time = 0.1;
  trigger.touch?.(trigger, actor, runtime);
  assert.equal(actor.fly_sound_debounce_time, runtime.time + 1.5, "trigger_push sound debounce time mismatch");
  assert.equal(runtime.soundEvents.at(-1)?.soundPath, "misc/windfly.wav", "trigger_push wind sound mismatch");
  const soundCount = runtime.soundEvents.length;
  trigger.touch?.(trigger, actor, runtime);
  assert.equal(runtime.soundEvents.length, soundCount, "trigger_push must debounce repeated wind sounds");

  runtime.time += 1.6;
  trigger.touch?.(trigger, actor, runtime);
  assert.equal(runtime.soundEvents.length, soundCount + 1, "trigger_push must play wind sound after debounce expires");

  const corpse = spawnGameEntity(runtime);
  corpse.classname = "corpse";
  corpse.health = 0;
  trigger.touch?.(trigger, corpse, runtime);
  assert.deepEqual(corpse.velocity, [0, 0, 0], "trigger_push must ignore non-grenade dead entities");

  const once = spawnGameEntity(runtime);
  once.classname = "trigger_push";
  once.spawnflags = 1;
  once.s.angles = [0, -1, 0];
  once.angles = [0, -1, 0];
  SP_trigger_push(once, runtime);
  const pushed = createPlayer(runtime);
  once.touch?.(once, pushed, runtime);
  assert.equal(once.inuse, false, "trigger_push PUSH_ONCE must free itself after touch");
}

function verifyTriggerHurt(): void {
  const runtime = createRuntime();
  const trigger = spawnGameEntity(runtime);
  trigger.classname = "trigger_hurt";
  SP_trigger_hurt(trigger, runtime);

  const victim = createPlayer(runtime);
  victim.health = 100;
  victim.takedamage = 1;

  trigger.touch?.(trigger, victim, runtime);
  assert.equal(victim.health < 100, true, "trigger_hurt must damage touching targets");

  const toggled = spawnGameEntity(runtime);
  toggled.classname = "trigger_hurt";
  toggled.spawnflags = 1 | 2;
  SP_trigger_hurt(toggled, runtime);
  assert.equal(toggled.solid, SOLID_NOT, "trigger_hurt START_OFF mismatch");
  toggled.use?.(toggled, null, victim, runtime);
  assert.equal(toggled.solid, SOLID_TRIGGER, "trigger_hurt toggle mismatch");
}

function verifyTriggerGravity(): void {
  const runtime = createRuntime();
  const trigger = spawnGameEntity(runtime);
  trigger.classname = "trigger_gravity";
  trigger.properties.gravity = "300";
  SP_trigger_gravity(trigger, runtime);

  const actor = createPlayer(runtime);
  actor.gravity = 1;

  trigger.touch?.(trigger, actor, runtime);
  assert.equal(actor.gravity, 300, "trigger_gravity must override entity gravity");
}

function verifyTriggerMonsterJump(): void {
  const runtime = createRuntime();
  const trigger = spawnGameEntity(runtime);
  trigger.classname = "trigger_monsterjump";
  trigger.properties.height = "260";
  SP_trigger_monsterjump(trigger, runtime);

  const monster = spawnGameEntity(runtime);
  monster.classname = "monster_soldier";
  monster.health = 100;
  monster.svflags |= SVF_MONSTER;
  monster.groundentity = runtime.entities[0] ?? null;
  linkGameEntity(runtime, monster);

  trigger.touch?.(trigger, monster, runtime);
  assert.equal(monster.velocity[2], 260, "trigger_monsterjump vertical velocity mismatch");
  assert.equal(monster.groundentity, null, "trigger_monsterjump must clear groundentity");
}

function createRuntime(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  runtime.maxclients = 4;
  runtime.coop = true;
  return runtime;
}

function createPlayer(runtime: GameRuntime): GameEntity {
  const player = spawnGameEntity(runtime);
  player.classname = "player";
  attachGameClient(player);
  player.health = 100;
  player.takedamage = 1;
  return player;
}
