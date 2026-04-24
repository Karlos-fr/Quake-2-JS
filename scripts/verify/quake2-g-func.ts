/**
 * File: quake2-g-func.ts
 * Purpose: Verify the closed TypeScript port of `game/g_func.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for brush entity routines.
 *
 * Dependencies:
 * - packages/game/src/g_func.ts
 * - packages/game/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import {
  EF_ANIM_ALL,
  EF_ANIM_ALLFAST,
  EF_ANIM01,
  EF_ANIM23,
  entity_event_t
} from "../../packages/qcommon/src/index.js";
import {
  SP_func_button,
  SP_func_conveyor,
  SP_func_door_secret,
  SP_func_killbox,
  SP_func_rotating,
  SP_func_timer,
  SP_func_train,
  SP_func_water,
  SP_trigger_elevator,
  button_killed,
  button_wait,
  func_conveyor_use,
  func_timer_use,
  train_next,
  trigger_elevator_use
} from "../../packages/game/src/g_func.js";
import {
  MOVETYPE_PUSH,
  MOVETYPE_STOP,
  SOLID_BSP,
  STATE_BOTTOM,
  STATE_TOP,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  type GameEntity
} from "../../packages/game/src/runtime.js";

const runtime = createGameRuntimeFromBspEntities([]);
runtime.time = 10;

const rotating = entity("func_rotating", 1, { spawnflags: String(1 | 4 | 64 | 128), speed: "75", dmg: "4" });
SP_func_rotating(rotating, runtime);
assert.equal(rotating.movetype, MOVETYPE_PUSH, "SP_func_rotating movetype mismatch");
assert.deepEqual(rotating.movedir, [0, 0, 1], "SP_func_rotating axis mismatch");
assert.deepEqual(rotating.avelocity, [0, 0, 75], "SP_func_rotating START_ON velocity mismatch");
assert.equal((rotating.s.effects & EF_ANIM_ALL) !== 0, true, "SP_func_rotating EF_ANIM_ALL mismatch");
assert.equal((rotating.s.effects & EF_ANIM_ALLFAST) !== 0, true, "SP_func_rotating EF_ANIM_ALLFAST mismatch");

const button = entity("func_button", 2, { angle: "0", lip: "4", wait: "2" });
button.size = [64, 16, 16];
button.maxs = [64, 16, 16];
SP_func_button(button, runtime);
assert.equal(button.movetype, MOVETYPE_STOP, "SP_func_button movetype mismatch");
assert.equal(button.solid, SOLID_BSP, "SP_func_button solid mismatch");
assert.deepEqual(button.moveinfo.end_origin, [60, 0, 0], "SP_func_button end origin mismatch");
assert.equal((button.s.effects & EF_ANIM01) !== 0, true, "SP_func_button initial animation mismatch");
button_wait(button, runtime);
assert.equal(button.moveinfo.state, STATE_TOP, "button_wait state mismatch");
assert.equal((button.s.effects & EF_ANIM23) !== 0, true, "button_wait animation mismatch");
assert.equal(button.think?.name, "button_return", "button_wait return think mismatch");

const shootButton = entity("func_button", 3, { angle: "90", health: "10" });
shootButton.size = [16, 64, 16];
shootButton.maxs = [16, 64, 16];
SP_func_button(shootButton, runtime);
button_killed(shootButton, null, button, 10, runtime);
assert.equal(shootButton.takedamage, 0, "button_killed must disable damage while moving");
assert.equal(shootButton.moveinfo.state !== STATE_BOTTOM, true, "button_killed must fire button");

const water = entity("func_water", 4, { angle: "-1", sounds: "1", lip: "4", wait: "0" });
water.size = [32, 32, 96];
water.maxs = [32, 32, 96];
SP_func_water(water, runtime);
assert.equal(water.classname, "func_door", "SP_func_water must reuse door classname");
assert.equal(water.moveinfo.wait, -1, "SP_func_water default wait mismatch");
assert.equal(water.moveinfo.sound_start > 0, true, "SP_func_water sound registration mismatch");

const conveyor = entity("func_conveyor", 5, { speed: "120" });
SP_func_conveyor(conveyor, runtime);
assert.equal(conveyor.speed, 0, "SP_func_conveyor should start stopped without START_ON");
assert.equal(conveyor.count, 120, "SP_func_conveyor saved speed mismatch");
func_conveyor_use(conveyor, null, null, runtime);
assert.equal(conveyor.speed, 120, "func_conveyor_use should restore speed");

const timerActivator = entity("activator", 6);
const timer = entity("func_timer", 7, { wait: "1", random: "0", delay: "0.5" });
SP_func_timer(timer, runtime);
func_timer_use(timer, null, timerActivator, runtime);
assert.equal(timer.activator, timerActivator, "func_timer_use activator mismatch");
assert.equal(timer.nextthink, runtime.time + 0.5, "func_timer_use delay mismatch");
assert.equal(timer.think?.name, "func_timer_think", "func_timer_use think mismatch");
timer.think!(timer, runtime);
assert.equal(timer.nextthink, runtime.time + 1, "func_timer_think reschedule mismatch");

const path1 = entity("path_corner", 8, { targetname: "p1", target: "p2" });
path1.s.origin = [100, 0, 0];
path1.origin = [100, 0, 0];
path1.wait = 0.25;
const path2 = entity("path_corner", 9, { targetname: "p2", target: "p1", spawnflags: "1" });
path2.s.origin = [200, 0, 0];
path2.origin = [200, 0, 0];
runtime.entities[8] = path1;
runtime.entities[9] = path2;

const train = entity("func_train", 10, { target: "p1", speed: "50" });
train.mins = [10, 0, 0];
SP_func_train(train, runtime);
train.think!(train, runtime);
assert.deepEqual(train.origin, [90, 0, 0], "func_train_find origin mismatch");
train_next(train, runtime);
assert.equal(train.target_ent, path1, "train_next must continue after one teleport path_corner");
assert.equal(train.s.event, entity_event_t.EV_OTHER_TELEPORT, "train_next teleport event mismatch");

const elevatorTarget = entity("func_train", 11);
const elevatorCorner = entity("path_corner", 12, { targetname: "e2" });
runtime.entities[11] = elevatorTarget;
runtime.entities[12] = elevatorCorner;
const elevator = entity("trigger_elevator", 13, { target: "elevator_train" });
elevatorTarget.targetname = "elevator_train";
elevatorTarget.classname = "func_train";
SP_trigger_elevator(elevator, runtime);
elevator.think!(elevator, runtime);
assert.equal(elevator.movetarget, elevatorTarget, "trigger_elevator_init movetarget mismatch");
const caller = entity("path_corner", 14, { pathtarget: "e2" });
trigger_elevator_use(elevator, caller, caller, runtime);
assert.equal(elevatorTarget.target_ent, elevatorCorner, "trigger_elevator_use target_ent mismatch");

const secret = entity("func_door_secret", 15, { angle: "0", wait: "1" });
secret.size = [32, 64, 16];
SP_func_door_secret(secret, runtime);
assert.equal(secret.classname, "func_door", "SP_func_door_secret classname mismatch");
assert.deepEqual(secret.pos1, [0, -64, 0], "SP_func_door_secret first move mismatch");
assert.deepEqual(secret.pos2, [32, -64, 0], "SP_func_door_secret second move mismatch");

const killbox = entity("func_killbox", 16);
SP_func_killbox(killbox, runtime);
assert.equal(killbox.use?.name, "use_killbox", "SP_func_killbox use mismatch");

console.log("quake2-g-func: ok");

function entity(classname: string, index: number, properties: Record<string, string> = {}): GameEntity {
  const ent = createRuntimeEntity({ classname, ...properties }, index);
  ent.inuse = true;
  ent.s.origin = [...ent.origin];
  runtime.entities[index] = ent;
  return ent;
}
