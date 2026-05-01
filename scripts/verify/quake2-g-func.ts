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
  Think_CalcMoveSpeed,
  Think_SpawnDoorTrigger,
  Touch_Plat_Center,
  Touch_DoorTrigger,
  Use_Plat,
  button_fire,
  button_killed,
  button_return,
  button_touch,
  button_use,
  button_wait,
  door_blocked,
  door_use,
  door_go_down,
  door_go_up,
  door_hit_bottom,
  door_hit_top,
  door_killed,
  door_use_areaportals,
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
  DOOR_START_OPEN,
  DOOR_TOGGLE,
  FL_TEAMSLAVE,
  PLAT_LOW_TRIGGER,
  SOLID_BSP,
  SOLID_TRIGGER,
  STATE_BOTTOM,
  STATE_DOWN,
  STATE_TOP,
  STATE_UP,
  SVF_MONSTER,
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
assert.equal(button.use, button_use, "SP_func_button use callback mismatch");
assert.equal(button.moveinfo.state, STATE_BOTTOM, "SP_func_button state mismatch");
assert.equal(button.moveinfo.speed, 40, "SP_func_button default speed mismatch");
assert.equal(button.moveinfo.accel, 40, "SP_func_button default accel mismatch");
assert.equal(button.moveinfo.decel, 40, "SP_func_button default decel mismatch");
assert.equal(button.moveinfo.wait, 2, "SP_func_button wait mismatch");
assert.deepEqual(button.pos1, [0, 0, 0], "SP_func_button pos1 mismatch");
assert.deepEqual(button.pos2, [60, 0, 0], "SP_func_button pos2 mismatch");
assert.deepEqual(button.moveinfo.start_origin, [0, 0, 0], "SP_func_button start origin mismatch");
assert.deepEqual(button.moveinfo.end_origin, [60, 0, 0], "SP_func_button end origin mismatch");
assert.deepEqual(button.moveinfo.start_angles, [0, 0, 0], "SP_func_button start angles mismatch");
assert.deepEqual(button.moveinfo.end_angles, [0, 0, 0], "SP_func_button end angles mismatch");
assert.equal((button.s.effects & EF_ANIM01) !== 0, true, "SP_func_button initial animation mismatch");
assert.equal(button.moveinfo.sound_start > 0, true, "SP_func_button default sound mismatch");
assert.equal(button.touch, button_touch, "SP_func_button untargeted non-shootable touch mismatch");
assert.equal(button.linked, true, "SP_func_button link mismatch");
const silentButton = entity("func_button", 34, { sounds: "1" });
SP_func_button(silentButton, runtime);
assert.equal(silentButton.moveinfo.sound_start, 0, "SP_func_button sounds=1 must suppress start sound");
const targetedButton = entity("func_button", 35, { targetname: "button_targetname" });
SP_func_button(targetedButton, runtime);
assert.equal(targetedButton.touch, undefined, "SP_func_button targeted button must not get touch callback");
assert.equal(targetedButton.use, button_use, "SP_func_button targeted use callback mismatch");
button_fire_forSound(button);
assert.equal(button.moveinfo.state, STATE_UP, "button_fire state mismatch");
assert.deepEqual(button.moveinfo.dir, [1, 0, 0], "button_fire direction mismatch");
assert.equal(button.moveinfo.remaining_distance, 60, "button_fire distance mismatch");
assert.equal(button.moveinfo.endfunc, button_wait, "button_fire endfunc mismatch");
const firingSoundCount = runtime.soundEvents.length;
button_fire(button, runtime);
assert.equal(runtime.soundEvents.length, firingSoundCount, "button_fire must ignore STATE_UP");
button.moveinfo.state = STATE_TOP;
button_fire(button, runtime);
assert.equal(runtime.soundEvents.length, firingSoundCount, "button_fire must ignore STATE_TOP");
const teamButton = entity("func_button", 28);
teamButton.moveinfo.state = STATE_BOTTOM;
teamButton.moveinfo.end_origin = [8, 0, 0];
teamButton.moveinfo.sound_start = button.moveinfo.sound_start;
teamButton.flags |= FL_TEAMSLAVE;
button_fire(teamButton, runtime);
assert.equal(teamButton.moveinfo.state, STATE_UP, "button_fire team slave state mismatch");
assert.equal(runtime.soundEvents.length, firingSoundCount, "button_fire team slave must not emit sound");
const buttonActivator = entity("button activator", 25);
const buttonTarget = entity("button target", 26, { targetname: "button_target" });
let buttonTargetUse = 0;
buttonTarget.use = (_self, other, activator) => {
  buttonTargetUse += 1;
  assert.equal(other, button, "button_wait target caller mismatch");
  assert.equal(activator, buttonActivator, "button_wait activator mismatch");
};
button.target = "button_target";
button.activator = buttonActivator;
button_wait(button, runtime);
assert.equal(button.moveinfo.state, STATE_TOP, "button_wait state mismatch");
assert.equal((button.s.effects & EF_ANIM01) === 0, true, "button_wait must clear idle animation");
assert.equal((button.s.effects & EF_ANIM23) !== 0, true, "button_wait animation mismatch");
assert.equal(buttonTargetUse, 1, "button_wait target dispatch mismatch");
assert.equal(button.s.frame, 1, "button_wait frame mismatch");
assert.equal(button.nextthink, runtime.time + button.moveinfo.wait, "button_wait nextthink mismatch");
assert.equal(button.think?.name, "button_return", "button_wait return think mismatch");
const holdButton = entity("func_button", 27);
holdButton.moveinfo.wait = -1;
holdButton.s.effects = EF_ANIM01;
button_wait(holdButton, runtime);
assert.equal(holdButton.nextthink, 0, "button_wait hold button must not schedule return");
assert.equal(holdButton.think, undefined, "button_wait hold button must not set return think");
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

const touchButton = entity("func_button", 29);
touchButton.moveinfo.state = STATE_BOTTOM;
touchButton.moveinfo.end_origin = [12, 0, 0];
touchButton.moveinfo.sound_start = button.moveinfo.sound_start;
const nonClientToucher = entity("monster toucher", 30);
nonClientToucher.health = 40;
button_touch(touchButton, nonClientToucher, runtime);
assert.equal(touchButton.activator, null, "button_touch must ignore non-clients");
assert.equal(touchButton.moveinfo.state, STATE_BOTTOM, "button_touch non-client must not fire");
const deadClientToucher = entity("dead client toucher", 31);
deadClientToucher.client = createGameClient();
deadClientToucher.health = 0;
button_touch(touchButton, deadClientToucher, runtime);
assert.equal(touchButton.activator, null, "button_touch must ignore dead clients");
assert.equal(touchButton.moveinfo.state, STATE_BOTTOM, "button_touch dead client must not fire");
const liveClientToucher = entity("live client toucher", 32);
liveClientToucher.client = createGameClient();
liveClientToucher.health = 100;
button_touch(touchButton, liveClientToucher, runtime);
assert.equal(touchButton.activator, liveClientToucher, "button_touch activator mismatch");
assert.equal(touchButton.moveinfo.state, STATE_UP, "button_touch live client must fire");
assert.equal(touchButton.moveinfo.endfunc, button_wait, "button_touch must delegate to button_fire");

const shootButton = entity("func_button", 3, { angle: "90", health: "10" });
shootButton.size = [16, 64, 16];
shootButton.maxs = [16, 64, 16];
SP_func_button(shootButton, runtime);
assert.equal(shootButton.max_health, 10, "SP_func_button shootable max health mismatch");
assert.equal(shootButton.takedamage, damage_t.DAMAGE_YES, "SP_func_button shootable damage flag mismatch");
assert.equal(shootButton.die, button_killed, "SP_func_button shootable die callback mismatch");
assert.equal(shootButton.touch, undefined, "SP_func_button shootable must not get touch callback");
shootButton.health = 4;
const shooter = entity("attacker", 33);
button_killed(shootButton, null, shooter, 10, runtime);
assert.equal(shootButton.activator, shooter, "button_killed activator mismatch");
assert.equal(shootButton.health, shootButton.max_health, "button_killed must restore health");
assert.equal(shootButton.takedamage, 0, "button_killed must disable damage while moving");
assert.equal(shootButton.moveinfo.state !== STATE_BOTTOM, true, "button_killed must fire button");
assert.equal(shootButton.moveinfo.endfunc, button_wait, "button_killed must delegate to button_fire");

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
door.activator = shooter;
door_go_up(door, button, runtime);
assert.equal(runtime.soundEvents.at(-1)?.soundPath, "doors/dr1_strt.wav", "door_go_up start sound mismatch");
assert.equal(door.s.sound, door.moveinfo.sound_middle, "door_go_up loop sound mismatch");
assert.equal(door.moveinfo.state, STATE_UP, "door_go_up state mismatch");
assert.equal(door.moveinfo.endfunc, door_hit_top, "door_go_up must move toward top callback");
assert.equal(door.activator, shooter, "door_go_up must not overwrite activator field");
door_hit_top(door, runtime);
assert.equal(runtime.soundEvents.at(-1)?.soundPath, "doors/dr1_end.wav", "door_hit_top end sound mismatch");
assert.equal(door.s.sound, 0, "door_hit_top must clear loop sound");
assert.equal(door.moveinfo.state, STATE_TOP, "door_hit_top state mismatch");
assert.equal(door.think, door_go_down, "door_hit_top must schedule door_go_down");
assert.equal(door.nextthink, runtime.time + door.moveinfo.wait, "door_hit_top wait scheduling mismatch");
door.health = 3;
door.max_health = 40;
door.takedamage = damage_t.DAMAGE_NO;
door_go_down(door, runtime);
assert.equal(runtime.soundEvents.at(-1)?.soundPath, "doors/dr1_strt.wav", "door_go_down start sound mismatch");
assert.equal(door.s.sound, door.moveinfo.sound_middle, "door_go_down loop sound mismatch");
assert.equal(door.health, 40, "door_go_down must restore shootable door health");
assert.equal(door.takedamage, damage_t.DAMAGE_YES, "door_go_down must reactivate shootable door damage");
assert.equal(door.moveinfo.state, STATE_DOWN, "door_go_down state mismatch");
assert.equal(door.moveinfo.endfunc, door_hit_bottom, "door_go_down must move toward bottom callback");
const upwardDoor = entity("func_door", 34);
upwardDoor.moveinfo.state = STATE_UP;
upwardDoor.nextthink = 321;
door_go_up(upwardDoor, button, runtime);
assert.equal(upwardDoor.nextthink, 321, "door_go_up STATE_UP guard must leave timing untouched");
const topDoor = entity("func_door", 38);
topDoor.moveinfo.state = STATE_TOP;
topDoor.moveinfo.wait = 4;
topDoor.nextthink = 321;
door_go_up(topDoor, button, runtime);
assert.equal(topDoor.nextthink, runtime.time + 4, "door_go_up STATE_TOP must reset wait timing");
const toggleDoor = entity("func_door", 35, { angle: "0", spawnflags: String(32), wait: "2" });
toggleDoor.moveinfo.sound_end = door.moveinfo.sound_end;
toggleDoor.moveinfo.wait = 2;
toggleDoor.nextthink = 123;
door_hit_top(toggleDoor, runtime);
assert.equal(toggleDoor.moveinfo.state, STATE_TOP, "door_hit_top toggle state mismatch");
assert.equal(toggleDoor.think, undefined, "door_hit_top toggle must not schedule return");
assert.equal(toggleDoor.nextthink, 123, "door_hit_top toggle must leave nextthink untouched");
const rotatingDoor = entity("func_door_rotating", 39);
rotatingDoor.moveinfo.sound_start = door.moveinfo.sound_start;
rotatingDoor.moveinfo.sound_middle = door.moveinfo.sound_middle;
door_go_up(rotatingDoor, button, runtime);
assert.equal(rotatingDoor.moveinfo.state, STATE_UP, "door_go_up rotating state mismatch");
assert.equal(rotatingDoor.moveinfo.endfunc, door_hit_top, "door_go_up rotating callback mismatch");
door_go_down(rotatingDoor, runtime);
assert.equal(rotatingDoor.moveinfo.state, STATE_DOWN, "door_go_down rotating state mismatch");
assert.equal(rotatingDoor.moveinfo.endfunc, door_hit_bottom, "door_go_down rotating callback mismatch");
const slaveOnlyDoor = entity("func_door", 40);
slaveOnlyDoor.flags |= FL_TEAMSLAVE;
slaveOnlyDoor.moveinfo.state = STATE_BOTTOM;
door_use(slaveOnlyDoor, null, button, runtime);
assert.equal(slaveOnlyDoor.moveinfo.state, STATE_BOTTOM, "door_use must ignore FL_TEAMSLAVE even without teammaster");
const teamDoorMaster = entity("func_door", 41);
const teamDoorSlave = entity("func_door", 42);
teamDoorMaster.teammaster = teamDoorMaster;
teamDoorMaster.teamchain = teamDoorSlave;
teamDoorSlave.teammaster = teamDoorMaster;
teamDoorSlave.flags |= FL_TEAMSLAVE;
teamDoorMaster.message = "team";
teamDoorSlave.message = "team";
teamDoorMaster.touch = Touch_Plat_Center;
teamDoorSlave.touch = Touch_Plat_Center;
door_use(teamDoorMaster, null, button, runtime);
assert.equal(teamDoorMaster.message, undefined, "door_use must clear master message before opening");
assert.equal(teamDoorSlave.message, undefined, "door_use must clear slave message before opening");
assert.equal(teamDoorMaster.touch, undefined, "door_use must clear master touch before opening");
assert.equal(teamDoorSlave.touch, undefined, "door_use must clear slave touch before opening");
assert.equal(teamDoorMaster.moveinfo.state, STATE_UP, "door_use must open master");
assert.equal(teamDoorSlave.moveinfo.state, STATE_UP, "door_use must open chained slave");
assert.equal(teamDoorMaster.moveinfo.endfunc, door_hit_top, "door_use master open callback mismatch");
assert.equal(teamDoorSlave.moveinfo.endfunc, door_hit_top, "door_use slave open callback mismatch");
teamDoorMaster.spawnflags |= DOOR_TOGGLE;
teamDoorMaster.moveinfo.state = STATE_TOP;
teamDoorSlave.moveinfo.state = STATE_UP;
teamDoorMaster.message = "team";
teamDoorSlave.message = "team";
teamDoorMaster.touch = Touch_Plat_Center;
teamDoorSlave.touch = Touch_Plat_Center;
door_use(teamDoorMaster, null, button, runtime);
assert.equal(teamDoorMaster.message, undefined, "door_use toggle must clear master message before closing");
assert.equal(teamDoorSlave.message, undefined, "door_use toggle must clear slave message before closing");
assert.equal(teamDoorMaster.touch, undefined, "door_use toggle must clear master touch before closing");
assert.equal(teamDoorSlave.touch, undefined, "door_use toggle must clear slave touch before closing");
assert.equal(teamDoorMaster.moveinfo.state, STATE_DOWN, "door_use toggle must close master");
assert.equal(teamDoorSlave.moveinfo.state, STATE_DOWN, "door_use toggle must close chained slave");
assert.equal(teamDoorMaster.moveinfo.endfunc, door_hit_bottom, "door_use master close callback mismatch");
assert.equal(teamDoorSlave.moveinfo.endfunc, door_hit_bottom, "door_use slave close callback mismatch");
const shootableDoorMaster = entity("func_door", 49);
const shootableDoorSlave = entity("func_door", 50);
const doorShooter = entity("player", 51);
doorShooter.client = createGameClient();
shootableDoorMaster.teammaster = shootableDoorMaster;
shootableDoorMaster.teamchain = shootableDoorSlave;
shootableDoorSlave.teammaster = shootableDoorMaster;
shootableDoorSlave.flags |= FL_TEAMSLAVE;
shootableDoorMaster.health = 1;
shootableDoorMaster.max_health = 20;
shootableDoorMaster.takedamage = damage_t.DAMAGE_YES;
shootableDoorSlave.health = 2;
shootableDoorSlave.max_health = 30;
shootableDoorSlave.takedamage = damage_t.DAMAGE_YES;
door_killed(shootableDoorSlave, null, doorShooter, 99, runtime);
assert.equal(shootableDoorMaster.health, 20, "door_killed must restore master health");
assert.equal(shootableDoorSlave.health, 30, "door_killed must restore chained slave health");
assert.equal(shootableDoorMaster.takedamage, damage_t.DAMAGE_NO, "door_killed must disable master damage");
assert.equal(shootableDoorSlave.takedamage, damage_t.DAMAGE_NO, "door_killed must disable chained slave damage");
assert.equal(shootableDoorMaster.moveinfo.state, STATE_UP, "door_killed must open team master");
assert.equal(shootableDoorSlave.moveinfo.state, STATE_UP, "door_killed must open chained slave");
const triggerDoor = entity("func_door", 43);
triggerDoor.moveinfo.state = STATE_BOTTOM;
triggerDoor.moveinfo.end_origin = [16, 0, 0];
const doorTrigger = entity("door_trigger", 44);
doorTrigger.owner = triggerDoor;
const deadDoorToucher = entity("dead door toucher", 45);
deadDoorToucher.client = createGameClient();
deadDoorToucher.health = 0;
Touch_DoorTrigger(doorTrigger, deadDoorToucher, runtime);
assert.equal(doorTrigger.touch_debounce_time, 0, "Touch_DoorTrigger must ignore dead touchers");
const nonClientDoorToucher = entity("non-client door toucher", 46);
nonClientDoorToucher.health = 100;
Touch_DoorTrigger(doorTrigger, nonClientDoorToucher, runtime);
assert.equal(doorTrigger.touch_debounce_time, 0, "Touch_DoorTrigger must ignore non-player non-monsters");
triggerDoor.spawnflags |= 8;
const monsterDoorToucher = entity("monster door toucher", 47);
monsterDoorToucher.health = 100;
monsterDoorToucher.svflags = SVF_MONSTER;
Touch_DoorTrigger(doorTrigger, monsterDoorToucher, runtime);
assert.equal(doorTrigger.touch_debounce_time, 0, "Touch_DoorTrigger must honor DOOR_NOMONSTER");
triggerDoor.spawnflags = 0;
const liveDoorClient = entity("live door client", 48);
liveDoorClient.client = createGameClient();
liveDoorClient.health = 100;
Touch_DoorTrigger(doorTrigger, liveDoorClient, runtime);
assert.equal(doorTrigger.touch_debounce_time, runtime.time + 1, "Touch_DoorTrigger debounce mismatch");
assert.equal(triggerDoor.moveinfo.state, STATE_UP, "Touch_DoorTrigger must open owner door");
assert.equal(triggerDoor.moveinfo.endfunc, door_hit_top, "Touch_DoorTrigger owner open callback mismatch");
triggerDoor.moveinfo.state = STATE_BOTTOM;
runtime.time += 0.5;
Touch_DoorTrigger(doorTrigger, liveDoorClient, runtime);
assert.equal(triggerDoor.moveinfo.state, STATE_BOTTOM, "Touch_DoorTrigger must debounce repeated touches");
const doorBlocker = entity("door blocker", 56);
doorBlocker.health = 25;
doorBlocker.takedamage = damage_t.DAMAGE_YES;
doorBlocker.s.origin = [4, 5, 6];
door_blocked(triggerDoor, doorBlocker, runtime);
assert.equal(doorBlocker.inuse, false, "door_blocked must explode non-monster non-client blockers");
assert.equal(runtime.tempEntityEvents.at(-1)?.origin[0], 4, "door_blocked explosion origin mismatch");
const crusherDoor = entity("func_door", 57, { spawnflags: "4", dmg: "12" });
const crusherClient = entity("crusher door client", 58);
crusherClient.client = createGameClient();
crusherClient.health = 40;
crusherClient.takedamage = damage_t.DAMAGE_YES;
runtime.meansOfDeath = 0;
door_blocked(crusherDoor, crusherClient, runtime);
assert.equal(crusherClient.health, 28, "door_blocked crusher damage mismatch");
assert.equal(runtime.meansOfDeath, MOD_CRUSH, "door_blocked crusher mod mismatch");
assert.equal(crusherDoor.moveinfo.state, STATE_BOTTOM, "door_blocked crusher must not reverse");
const blockedDoorMaster = entity("func_door", 59, { dmg: "10" });
const blockedDoorSlave = entity("func_door", 60);
const doorMonsterBlocker = entity("door monster blocker", 61);
blockedDoorMaster.teammaster = blockedDoorMaster;
blockedDoorMaster.teamchain = blockedDoorSlave;
blockedDoorSlave.teammaster = blockedDoorMaster;
blockedDoorMaster.moveinfo.state = STATE_DOWN;
blockedDoorSlave.moveinfo.state = STATE_DOWN;
blockedDoorMaster.moveinfo.end_origin = [16, 0, 0];
blockedDoorSlave.moveinfo.end_origin = [32, 0, 0];
doorMonsterBlocker.svflags = SVF_MONSTER;
doorMonsterBlocker.health = 35;
doorMonsterBlocker.takedamage = damage_t.DAMAGE_YES;
door_blocked(blockedDoorMaster, doorMonsterBlocker, runtime);
assert.equal(doorMonsterBlocker.health, 25, "door_blocked monster damage mismatch");
assert.equal(blockedDoorMaster.moveinfo.state, STATE_UP, "door_blocked STATE_DOWN master reverse mismatch");
assert.equal(blockedDoorSlave.moveinfo.state, STATE_UP, "door_blocked STATE_DOWN slave reverse mismatch");
assert.equal(blockedDoorMaster.moveinfo.endfunc, door_hit_top, "door_blocked master reverse callback mismatch");
blockedDoorMaster.moveinfo.state = STATE_UP;
blockedDoorSlave.moveinfo.state = STATE_UP;
blockedDoorMaster.moveinfo.start_origin = [0, 0, 0];
blockedDoorSlave.moveinfo.start_origin = [0, 0, 0];
door_blocked(blockedDoorMaster, doorMonsterBlocker, runtime);
assert.equal(blockedDoorMaster.moveinfo.state, STATE_DOWN, "door_blocked STATE_UP master reverse mismatch");
assert.equal(blockedDoorSlave.moveinfo.state, STATE_DOWN, "door_blocked STATE_UP slave reverse mismatch");
assert.equal(blockedDoorMaster.moveinfo.endfunc, door_hit_bottom, "door_blocked close callback mismatch");
const speedDoorMaster = entity("func_door", 49);
const speedDoorSlave = entity("func_door", 50);
speedDoorMaster.teamchain = speedDoorSlave;
speedDoorMaster.moveinfo.distance = 50;
speedDoorMaster.moveinfo.speed = 100;
speedDoorMaster.moveinfo.accel = 100;
speedDoorMaster.moveinfo.decel = 25;
speedDoorSlave.moveinfo.distance = 100;
speedDoorSlave.moveinfo.speed = 40;
speedDoorSlave.moveinfo.accel = 20;
speedDoorSlave.moveinfo.decel = 40;
Think_CalcMoveSpeed(speedDoorMaster, runtime);
assert.equal(speedDoorMaster.moveinfo.speed, 100, "Think_CalcMoveSpeed master speed mismatch");
assert.equal(speedDoorMaster.moveinfo.accel, 100, "Think_CalcMoveSpeed master accel equality branch mismatch");
assert.equal(speedDoorMaster.moveinfo.decel, 25, "Think_CalcMoveSpeed master decel ratio branch mismatch");
assert.equal(speedDoorSlave.moveinfo.speed, 200, "Think_CalcMoveSpeed slave speed mismatch");
assert.equal(speedDoorSlave.moveinfo.accel, 100, "Think_CalcMoveSpeed slave accel ratio branch mismatch");
assert.equal(speedDoorSlave.moveinfo.decel, 200, "Think_CalcMoveSpeed slave decel equality branch mismatch");
const speedDoorFlagSlave = entity("func_door", 51);
speedDoorFlagSlave.flags |= FL_TEAMSLAVE;
speedDoorFlagSlave.moveinfo.distance = 64;
speedDoorFlagSlave.moveinfo.speed = 32;
Think_CalcMoveSpeed(speedDoorFlagSlave, runtime);
assert.equal(speedDoorFlagSlave.moveinfo.speed, 32, "Think_CalcMoveSpeed must ignore FL_TEAMSLAVE");
const triggerSpawnSlave = entity("func_door", 52);
triggerSpawnSlave.flags |= FL_TEAMSLAVE;
const entityCountBeforeSlaveTrigger = runtime.entities.filter((candidate) => candidate?.inuse).length;
Think_SpawnDoorTrigger(triggerSpawnSlave, runtime);
assert.equal(
  runtime.entities.filter((candidate) => candidate?.inuse).length,
  entityCountBeforeSlaveTrigger,
  "Think_SpawnDoorTrigger must ignore FL_TEAMSLAVE"
);
const triggerSpawnMaster = entity("func_door", 53, { spawnflags: String(DOOR_START_OPEN) });
triggerSpawnMaster.target = "portal_pair";
triggerSpawnMaster.absmin = [10, 20, 30];
triggerSpawnMaster.absmax = [30, 40, 50];
triggerSpawnMaster.mins = [10, 20, 30];
triggerSpawnMaster.maxs = [30, 40, 50];
triggerSpawnMaster.moveinfo.distance = 50;
triggerSpawnMaster.moveinfo.speed = 100;
const triggerSpawnMember = entity("func_door", 54);
triggerSpawnMember.absmin = [-20, 15, 25];
triggerSpawnMember.absmax = [5, 80, 60];
triggerSpawnMember.mins = [-20, 15, 25];
triggerSpawnMember.maxs = [5, 80, 60];
triggerSpawnMember.moveinfo.distance = 100;
triggerSpawnMember.moveinfo.speed = 50;
triggerSpawnMaster.teamchain = triggerSpawnMember;
const triggerPortal = entity("func_areaportal", 55);
triggerPortal.targetname = "portal_pair";
triggerPortal.style = 3;
Think_SpawnDoorTrigger(triggerSpawnMaster, runtime);
const spawnedDoorTrigger = runtime.entities.find(
  (candidate) => candidate?.inuse && candidate.classname === "door_trigger" && candidate.owner === triggerSpawnMaster
);
assert.ok(spawnedDoorTrigger, "Think_SpawnDoorTrigger must spawn a helper trigger");
assert.equal(spawnedDoorTrigger.solid, SOLID_TRIGGER, "Think_SpawnDoorTrigger helper solid mismatch");
assert.equal(spawnedDoorTrigger.movetype, MOVETYPE_NONE, "Think_SpawnDoorTrigger helper movetype mismatch");
assert.equal(spawnedDoorTrigger.touch, Touch_DoorTrigger, "Think_SpawnDoorTrigger helper touch mismatch");
assert.deepEqual(spawnedDoorTrigger.mins, [-80, -45, 25], "Think_SpawnDoorTrigger helper mins mismatch");
assert.deepEqual(spawnedDoorTrigger.maxs, [90, 140, 60], "Think_SpawnDoorTrigger helper maxs mismatch");
assert.equal(spawnedDoorTrigger.linked, true, "Think_SpawnDoorTrigger must link helper trigger");
assert.equal(
  runtime.logEntries.some((entry) => entry.kind === "think" && entry.otherIndex === spawnedDoorTrigger.index),
  true,
  "Think_SpawnDoorTrigger log helper mismatch"
);
assert.equal(
  runtime.logEntries.some((entry) => entry.kind === "use" && entry.otherIndex === triggerPortal.index),
  true,
  "Think_SpawnDoorTrigger must open START_OPEN areaportal"
);
assert.equal(triggerSpawnMaster.moveinfo.speed, 100, "Think_SpawnDoorTrigger must recalc master speed");
assert.equal(triggerSpawnMember.moveinfo.speed, 200, "Think_SpawnDoorTrigger must recalc team speed");
const areaportalRuntime = createGameRuntimeFromBspEntities([]);
areaportalRuntime.collision = {
  world: {
    map_areas: [
      { numareaportals: 0, firstareaportal: 0, floodnum: 0, floodvalid: 0 },
      { numareaportals: 1, firstareaportal: 0, floodnum: 0, floodvalid: 0 },
      { numareaportals: 1, firstareaportal: 1, floodnum: 0, floodvalid: 0 }
    ],
    map_areaportals: [
      { portalnum: 1, otherarea: 2 },
      { portalnum: 1, otherarea: 1 }
    ],
    numareas: 3,
    floodvalid: 0,
    portalopen: new Uint8Array(2)
  } as never,
  trace: () => {
    throw new Error("unexpected areaportal trace");
  },
  pointcontents: () => 0
};
const portalDoor = createRuntimeEntity({ classname: "func_door", target: "portal_pair" }, 36);
portalDoor.inuse = true;
const portal = createRuntimeEntity({ classname: "func_areaportal", targetname: "portal_pair" }, 37);
portal.inuse = true;
portal.style = 1;
areaportalRuntime.entities[36] = portalDoor;
areaportalRuntime.entities[37] = portal;
door_use_areaportals(portalDoor, true, areaportalRuntime);
assert.equal(areaportalRuntime.collision.world.portalopen[1], 1, "door_use_areaportals must open targeted portal");
assert.equal(areaportalRuntime.logEntries.at(-1)?.otherIndex, 37, "door_use_areaportals log target mismatch");
portalDoor.s.sound = 99;
portalDoor.moveinfo.sound_end = door.moveinfo.sound_end;
door_hit_bottom(portalDoor, areaportalRuntime);
assert.equal(portalDoor.moveinfo.state, STATE_BOTTOM, "door_hit_bottom state mismatch");
assert.equal(portalDoor.s.sound, 0, "door_hit_bottom must clear loop sound");
assert.equal(areaportalRuntime.collision.world.portalopen[1], 0, "door_hit_bottom must close targeted portal");

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
