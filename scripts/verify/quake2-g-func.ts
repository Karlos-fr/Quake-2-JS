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
  button_done,
  SP_func_conveyor,
  SP_func_door,
  SP_func_door_secret,
  SP_func_killbox,
  SP_func_plat,
  SP_func_rotating,
  SP_func_timer,
  SP_func_train,
  SP_func_water,
  SP_trigger_elevator,
  Touch_Plat_Center,
  Use_Plat,
  button_killed,
  button_return,
  button_wait,
  door_go_up,
  door_hit_top,
  func_conveyor_use,
  func_timer_use,
  plat_go_down,
  plat_blocked,
  rotating_blocked,
  rotating_touch,
  rotating_use,
  train_next,
  trigger_elevator_use
} from "../../packages/game/src/g_func.js";
import { MOD_CRUSH, damage_t } from "../../packages/game/src/g_local.js";
import {
  MOVETYPE_PUSH,
  MOVETYPE_NONE,
  MOVETYPE_STOP,
  PLAT_LOW_TRIGGER,
  SOLID_BSP,
  SOLID_TRIGGER,
  STATE_BOTTOM,
  STATE_DOWN,
  STATE_TOP,
  STATE_UP,
  createGameClient,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  type GameEntity
} from "../../packages/game/src/runtime.js";

const runtime = createGameRuntimeFromBspEntities([]);
runtime.time = 10;

const rotating = entity("func_rotating", 1, { spawnflags: String(1 | 4 | 64 | 128), speed: "75", dmg: "4" });
rotating.model = "*1";
SP_func_rotating(rotating, runtime);
assert.equal(rotating.solid, SOLID_BSP, "SP_func_rotating solid mismatch");
assert.equal(rotating.movetype, MOVETYPE_PUSH, "SP_func_rotating movetype mismatch");
assert.deepEqual(rotating.movedir, [0, 0, 1], "SP_func_rotating axis mismatch");
assert.deepEqual(rotating.avelocity, [0, 0, 75], "SP_func_rotating START_ON velocity mismatch");
assert.equal((rotating.s.effects & EF_ANIM_ALL) !== 0, true, "SP_func_rotating EF_ANIM_ALL mismatch");
assert.equal((rotating.s.effects & EF_ANIM_ALLFAST) !== 0, true, "SP_func_rotating EF_ANIM_ALLFAST mismatch");
assert.equal(rotating.use, rotating_use, "SP_func_rotating use callback mismatch");
assert.equal(rotating.blocked, rotating_blocked, "SP_func_rotating blocked callback mismatch");
assert.equal(rotating.s.modelindex > 0, true, "SP_func_rotating model index mismatch");
assert.equal(rotating.linked, true, "SP_func_rotating link mismatch");
assert.equal(runtime.assets.modelPaths[rotating.s.modelindex - 1], "*1", "SP_func_rotating model registration mismatch");
const defaultRotating = entity("func_rotating", 23);
SP_func_rotating(defaultRotating, runtime);
assert.equal(defaultRotating.speed, 100, "SP_func_rotating default speed mismatch");
assert.equal(defaultRotating.dmg, 2, "SP_func_rotating default damage mismatch");
assert.deepEqual(defaultRotating.movedir, [0, 1, 0], "SP_func_rotating default axis mismatch");
assert.deepEqual(defaultRotating.avelocity, [0, 0, 0], "SP_func_rotating must not start without START_ON");
assert.equal(defaultRotating.movetype, MOVETYPE_PUSH, "SP_func_rotating default movetype mismatch");
const stopReverseRotating = entity("func_rotating", 24, { spawnflags: String(2 | 8 | 32), speed: "30", dmg: "9" });
SP_func_rotating(stopReverseRotating, runtime);
assert.equal(stopReverseRotating.movetype, MOVETYPE_STOP, "SP_func_rotating STOP movetype mismatch");
assert.equal(stopReverseRotating.movedir[0], -1, "SP_func_rotating reverse/Y_AXIS X axis mismatch");
assert.ok(stopReverseRotating.movedir[1] === 0, "SP_func_rotating reverse/Y_AXIS Y axis mismatch");
assert.ok(stopReverseRotating.movedir[2] === 0, "SP_func_rotating reverse/Y_AXIS Z axis mismatch");
assert.equal(stopReverseRotating.speed, 30, "SP_func_rotating explicit speed mismatch");
assert.equal(stopReverseRotating.dmg, 9, "SP_func_rotating explicit damage mismatch");
assert.equal((stopReverseRotating.s.effects & EF_ANIM_ALL) !== 0, false, "SP_func_rotating unexpected EF_ANIM_ALL");
assert.equal((stopReverseRotating.s.effects & EF_ANIM_ALLFAST) !== 0, false, "SP_func_rotating unexpected EF_ANIM_ALLFAST");
const rotatingBlocker = entity("blocker", 18);
rotatingBlocker.health = 20;
rotatingBlocker.takedamage = damage_t.DAMAGE_YES;
rotatingBlocker.s.origin = [16, 24, 32];
rotating_blocked(rotating, rotatingBlocker, runtime);
assert.equal(rotatingBlocker.health, 16, "rotating_blocked damage mismatch");
assert.equal(runtime.meansOfDeath, MOD_CRUSH, "rotating_blocked damage mod mismatch");
const idleRotating = entity("func_rotating", 19, { dmg: "7" });
const idleRotatingToucher = entity("idle rotating toucher", 20);
idleRotatingToucher.health = 30;
idleRotatingToucher.takedamage = damage_t.DAMAGE_YES;
runtime.meansOfDeath = 0;
rotating_touch(idleRotating, idleRotatingToucher, runtime);
assert.equal(idleRotatingToucher.health, 30, "rotating_touch must not damage when idle");
assert.equal(runtime.meansOfDeath, 0, "rotating_touch idle damage mod mismatch");
const activeRotatingToucher = entity("active rotating toucher", 21);
activeRotatingToucher.health = 30;
activeRotatingToucher.takedamage = damage_t.DAMAGE_YES;
activeRotatingToucher.s.origin = [4, 8, 12];
runtime.meansOfDeath = 0;
rotating_touch(rotating, activeRotatingToucher, runtime);
assert.equal(activeRotatingToucher.health, 26, "rotating_touch damage mismatch");
assert.equal(runtime.meansOfDeath, MOD_CRUSH, "rotating_touch damage mod mismatch");
const touchPainRotating = entity("func_rotating", 22, { spawnflags: "16", speed: "25" });
touchPainRotating.movedir = [1, 0, 0];
touchPainRotating.moveinfo.sound_middle = 123;
rotating_use(touchPainRotating, null, null, runtime);
assert.equal(touchPainRotating.s.sound, 123, "rotating_use must start middle sound");
assert.deepEqual(touchPainRotating.avelocity, [25, 0, 0], "rotating_use start velocity mismatch");
assert.equal(touchPainRotating.touch, rotating_touch, "rotating_use must attach TOUCH_PAIN callback");
rotating_use(touchPainRotating, null, null, runtime);
assert.equal(touchPainRotating.s.sound, 0, "rotating_use must stop sound when toggled off");
assert.deepEqual(touchPainRotating.avelocity, [0, 0, 0], "rotating_use stop velocity mismatch");
assert.equal(touchPainRotating.touch, undefined, "rotating_use must clear touch when toggled off");

const button = entity("func_button", 2, { angle: "0", lip: "4", wait: "2" });
button.size = [64, 16, 16];
button.maxs = [64, 16, 16];
SP_func_button(button, runtime);
assert.equal(button.movetype, MOVETYPE_STOP, "SP_func_button movetype mismatch");
assert.equal(button.solid, SOLID_BSP, "SP_func_button solid mismatch");
assert.deepEqual(button.moveinfo.end_origin, [60, 0, 0], "SP_func_button end origin mismatch");
assert.equal((button.s.effects & EF_ANIM01) !== 0, true, "SP_func_button initial animation mismatch");
assert.equal(button.moveinfo.sound_start > 0, true, "SP_func_button default sound mismatch");
button_fire_forSound(button);
button_wait(button, runtime);
assert.equal(button.moveinfo.state, STATE_TOP, "button_wait state mismatch");
assert.equal((button.s.effects & EF_ANIM23) !== 0, true, "button_wait animation mismatch");
assert.equal(button.think?.name, "button_return", "button_wait return think mismatch");
button.origin = [...button.moveinfo.end_origin];
button.s.origin = [...button.moveinfo.end_origin];
button.s.frame = 1;
button.health = 25;
button.takedamage = 0;
button_return(button, runtime);
assert.equal(button.moveinfo.state, STATE_DOWN, "button_return state mismatch");
assert.deepEqual(button.moveinfo.dir, [-1, 0, 0], "button_return direction mismatch");
assert.equal(button.moveinfo.remaining_distance, 60, "button_return distance mismatch");
assert.equal(button.moveinfo.endfunc, button_done, "button_return endfunc mismatch");
assert.equal(button.s.frame, 0, "button_return frame mismatch");
assert.equal(button.takedamage, damage_t.DAMAGE_YES, "button_return shootable damage mismatch");
button_done(button, runtime);
assert.equal(button.moveinfo.state, STATE_BOTTOM, "button_done state mismatch");
assert.equal((button.s.effects & EF_ANIM23) === 0, true, "button_done must clear active animation");
assert.equal((button.s.effects & EF_ANIM01) !== 0, true, "button_done must restore idle animation");

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

const door = entity("func_door", 17, { angle: "0" });
door.size = [64, 16, 16];
door.maxs = [64, 16, 16];
SP_func_door(door, runtime);
assert.equal(door.s.modelindex, 0, "SP_func_door without model should not invent a modelindex");
assert.equal(door.moveinfo.sound_start > 0, true, "SP_func_door start sound registration mismatch");
door_go_up(door, button, runtime);
assert.equal(runtime.soundEvents.at(-1)?.soundPath, "doors/dr1_strt.wav", "door_go_up start sound mismatch");
assert.equal(door.s.sound, door.moveinfo.sound_middle, "door_go_up loop sound mismatch");
door_hit_top(door, runtime);
assert.equal(runtime.soundEvents.at(-1)?.soundPath, "doors/dr1_end.wav", "door_hit_top end sound mismatch");
assert.equal(door.s.sound, 0, "door_hit_top must clear loop sound");

const plat = entity("func_plat", 18);
plat.size = [64, 64, 32];
plat.maxs = [64, 64, 32];
SP_func_plat(plat, runtime);
assert.deepEqual(plat.angles, [0, 0, 0], "SP_func_plat must clear angles");
assert.equal(plat.solid, SOLID_BSP, "SP_func_plat solid mismatch");
assert.equal(plat.movetype, MOVETYPE_PUSH, "SP_func_plat movetype mismatch");
assert.equal(plat.blocked, plat_blocked, "SP_func_plat blocked callback mismatch");
assert.equal(plat.speed, 20, "SP_func_plat default speed mismatch");
assert.equal(plat.accel, 5, "SP_func_plat default accel mismatch");
assert.equal(plat.decel, 5, "SP_func_plat default decel mismatch");
assert.equal(plat.dmg, 2, "SP_func_plat default damage mismatch");
assert.deepEqual(plat.pos1, [0, 0, 0], "SP_func_plat top position mismatch");
assert.deepEqual(plat.pos2, [0, 0, -24], "SP_func_plat bottom position mismatch");
assert.deepEqual(plat.origin, [0, 0, -24], "SP_func_plat untargeted origin mismatch");
assert.equal(plat.use, Use_Plat, "SP_func_plat use callback mismatch");
assert.equal(plat.moveinfo.state, STATE_BOTTOM, "SP_func_plat untargeted state mismatch");
assert.equal(plat.moveinfo.speed, plat.speed, "SP_func_plat moveinfo speed mismatch");
assert.equal(plat.moveinfo.accel, plat.accel, "SP_func_plat moveinfo accel mismatch");
assert.equal(plat.moveinfo.decel, plat.decel, "SP_func_plat moveinfo decel mismatch");
assert.equal(plat.moveinfo.wait, plat.wait, "SP_func_plat moveinfo wait mismatch");
assert.equal(plat.moveinfo.distance, 24, "SP_func_plat moveinfo distance mismatch");
assert.deepEqual(plat.moveinfo.start_origin, plat.pos1, "SP_func_plat moveinfo start origin mismatch");
assert.deepEqual(plat.moveinfo.end_origin, plat.pos2, "SP_func_plat moveinfo end origin mismatch");
assert.deepEqual(plat.moveinfo.start_angles, [0, 0, 0], "SP_func_plat moveinfo start angles mismatch");
assert.deepEqual(plat.moveinfo.end_angles, [0, 0, 0], "SP_func_plat moveinfo end angles mismatch");
assert.equal(plat.moveinfo.sound_start > 0, true, "SP_func_plat start sound registration mismatch");
const platTrigger = findPlatTrigger(runtime, plat);
assert.ok(platTrigger, "SP_func_plat must spawn the center trigger");
assert.equal(platTrigger.touch, Touch_Plat_Center, "plat_spawn_inside_trigger touch mismatch");
assert.equal(platTrigger.movetype, MOVETYPE_NONE, "plat_spawn_inside_trigger movetype mismatch");
assert.equal(platTrigger.solid, SOLID_TRIGGER, "plat_spawn_inside_trigger solid mismatch");
assert.equal(platTrigger.enemy, plat, "plat_spawn_inside_trigger enemy mismatch");
assert.deepEqual(platTrigger.mins, [25, 25, 8], "plat_spawn_inside_trigger mins mismatch");
assert.deepEqual(platTrigger.maxs, [39, 39, 40], "plat_spawn_inside_trigger maxs mismatch");
const nonClient = entity("monster", 30);
Touch_Plat_Center(platTrigger, nonClient, runtime);
assert.equal(plat.moveinfo.state, STATE_BOTTOM, "Touch_Plat_Center must ignore non-clients");
const deadClient = entity("dead-player", 31);
deadClient.client = createGameClient();
deadClient.health = 0;
Touch_Plat_Center(platTrigger, deadClient, runtime);
assert.equal(plat.moveinfo.state, STATE_BOTTOM, "Touch_Plat_Center must ignore dead clients");
const liveClient = entity("player", 32);
liveClient.client = createGameClient();
liveClient.health = 100;
Touch_Plat_Center(platTrigger, liveClient, runtime);
assert.equal(plat.moveinfo.state, STATE_UP, "Touch_Plat_Center must raise a bottomed platform");
plat.moveinfo.state = STATE_TOP;
plat.nextthink = 0;
Touch_Plat_Center(platTrigger, liveClient, runtime);
assert.equal(plat.nextthink, runtime.time + 1, "Touch_Plat_Center must delay top-platform descent");
plat_go_down(plat, runtime);
assert.equal(runtime.soundEvents.at(-1)?.soundPath, "plats/pt1_strt.wav", "plat_go_down start sound mismatch");

const lowPlat = entity("func_plat", 33, { spawnflags: String(PLAT_LOW_TRIGGER) });
lowPlat.size = [40, 40, 32];
lowPlat.maxs = [40, 40, 32];
SP_func_plat(lowPlat, runtime);
const lowPlatTrigger = findPlatTrigger(runtime, lowPlat);
assert.ok(lowPlatTrigger, "SP_func_plat must spawn a low center trigger");
assert.deepEqual(lowPlatTrigger.mins, [20, 20, 8], "PLAT_LOW_TRIGGER collapsed mins mismatch");
assert.deepEqual(lowPlatTrigger.maxs, [21, 21, 16], "PLAT_LOW_TRIGGER collapsed maxs mismatch");

const targetedPlat = entity("func_plat", 34, {
  targetname: "lift_once",
  speed: "200",
  accel: "10",
  decel: "20",
  dmg: "7",
  height: "12",
  angle: "90"
});
targetedPlat.size = [64, 64, 32];
targetedPlat.maxs = [64, 64, 32];
SP_func_plat(targetedPlat, runtime);
assert.equal(targetedPlat.speed, 20, "SP_func_plat scaled speed mismatch");
assert.equal(targetedPlat.accel, 1, "SP_func_plat scaled accel mismatch");
assert.equal(targetedPlat.decel, 2, "SP_func_plat scaled decel mismatch");
assert.equal(targetedPlat.dmg, 7, "SP_func_plat explicit damage mismatch");
assert.deepEqual(targetedPlat.pos1, [0, 0, 0], "SP_func_plat targeted top position mismatch");
assert.deepEqual(targetedPlat.pos2, [0, 0, -12], "SP_func_plat height bottom position mismatch");
assert.deepEqual(targetedPlat.origin, [0, 0, 0], "SP_func_plat targeted origin mismatch");
assert.equal(targetedPlat.moveinfo.state, STATE_UP, "SP_func_plat targeted state mismatch");
assert.equal(targetedPlat.moveinfo.distance, 12, "SP_func_plat targeted distance mismatch");
assert.deepEqual(targetedPlat.moveinfo.end_origin, [0, 0, -12], "SP_func_plat targeted end origin mismatch");

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

function button_fire_forSound(button: GameEntity): void {
  const before = runtime.soundEvents.length;
  button.use?.(button, null, button, runtime);
  assert.equal(runtime.soundEvents.length, before + 1, "button_fire must emit default sound");
  assert.equal(runtime.soundEvents.at(-1)?.soundPath, "switches/butn2.wav", "button_fire sound mismatch");
}

function findPlatTrigger(runtime: ReturnType<typeof createGameRuntimeFromBspEntities>, plat: GameEntity): GameEntity {
  const trigger = runtime.entities.find((entity) => entity?.inuse && entity.classname === "plat_trigger" && entity.enemy === plat);
  assert.ok(trigger, "missing plat trigger");
  return trigger;
}
