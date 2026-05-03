/**
 * File: quake2-g-utils.ts
 * Purpose: Verify the TypeScript target for the remaining direct helpers ported from `game/g_utils.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict gameplay utility port.
 *
 * Dependencies:
 * - packages/game/src/g_utils.ts
 * - packages/game/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import { MOD_TELEFRAG } from "../../packages/game/src/g_local.js";
import {
  G_UseTargets,
  G_CopyString,
  G_Find,
  G_FreeEdict,
  G_InitEdict,
  G_PickTarget,
  G_ProjectSource,
  G_SetMovedir,
  G_Spawn,
  KillBox,
  findradius,
  tv,
  vectoyaw,
  vectoangles,
  vtos
} from "../../packages/game/src/g_utils.js";
import {
  SVF_MONSTER,
  Think_Delay,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  drainGameCenterprintEvents,
  drainGameSoundEvents,
  refreshEntitySpatialState,
  registerGameSound,
  runPendingThinks
} from "../../packages/game/src/runtime.js";

const runtime = createGameRuntimeFromBspEntities([]);
runtime.maxclients = 1;
runtime.maxentities = 64;

const targetA = createRuntimeEntity({ classname: "target_a", targetname: "pick_me" }, 1);
const targetB = createRuntimeEntity({ classname: "target_b", targetname: "pick_me" }, 2);
const inactiveMatch = createRuntimeEntity({ classname: "target_inactive", targetname: "pick_me" }, 3);
inactiveMatch.inuse = false;
const nonStringField = createRuntimeEntity({ classname: "target_non_string", targetname: "skip_me" }, 4);
nonStringField.message = undefined;
const caseMatch = createRuntimeEntity({ classname: "target_case", targetname: "PICK_CASE" }, 5);
const emptyTargetname = createRuntimeEntity({ classname: "target_empty", targetname: "" }, 6);
runtime.entities[1] = targetA;
runtime.entities[2] = targetB;
runtime.entities[3] = inactiveMatch;
runtime.entities[4] = nonStringField;
runtime.entities[5] = caseMatch;
runtime.entities[6] = emptyTargetname;

assert.equal(G_Find(runtime, null, "targetname", "pick_me"), targetA, "G_Find first match mismatch");
assert.equal(G_Find(runtime, targetA, "targetname", "pick_me"), targetB, "G_Find next match mismatch");
assert.equal(G_Find(runtime, targetB, "targetname", "pick_me"), null, "G_Find must skip inactive entities and return null at list end");
assert.equal(G_Find(runtime, targetB, "targetname", "pick_case"), caseMatch, "G_Find must compare strings like Q_stricmp");
assert.equal(G_Find(runtime, nonStringField, "message", "missing"), null, "G_Find must skip null string fields and return null at list end");

function withRandom<T>(value: number, callback: () => T): T {
  const originalRandom = Math.random;
  Math.random = () => value;
  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

assert.equal(withRandom(0.9, () => G_PickTarget(runtime, "pick_me")), targetB, "G_PickTarget mismatch");
assert.equal(withRandom(0, () => G_PickTarget(runtime, "")), emptyTargetname, "G_PickTarget must treat an empty string as a non-NULL C string");

const missingBefore = runtime.logEntries.length;
assert.equal(G_PickTarget(runtime, "missing_target"), null, "G_PickTarget must return null when no choices exist");
assert.equal(
  runtime.logEntries.slice(missingBefore).some((entry) => entry.kind === "warning" && entry.message === "G_PickTarget: target missing_target not found"),
  true,
  "G_PickTarget missing-target warning mismatch"
);
const nullBefore = runtime.logEntries.length;
assert.equal(G_PickTarget(runtime, null), null, "G_PickTarget must return null for NULL targetname");
assert.equal(
  runtime.logEntries.slice(nullBefore).some((entry) => entry.kind === "warning" && entry.message === "G_PickTarget called with NULL targetname"),
  true,
  "G_PickTarget NULL-target warning mismatch"
);

const cappedRuntime = createGameRuntimeFromBspEntities([]);
cappedRuntime.maxentities = 16;
const cappedChoices = Array.from({ length: 10 }, (_, index) => createRuntimeEntity({ classname: `capped_${index + 1}`, targetname: "capped" }, index + 1));
for (const choice of cappedChoices) {
  cappedRuntime.entities[choice.index] = choice;
}
assert.equal(
  withRandom(0.99, () => G_PickTarget(cappedRuntime, "capped")),
  cappedChoices[7],
  "G_PickTarget must cap the local choice buffer at MAXCHOICES"
);

assert.deepEqual(
  G_ProjectSource([10, 20, 30], [2, 3, 4], [1, 0, 0], [0, 1, 0]),
  [12, 23, 34],
  "G_ProjectSource mismatch"
);
assert.deepEqual(
  G_ProjectSource([5, -2, 7], [3, -4, 6], [0.5, 1, -2], [-1, 2, 0.25]),
  [10.5, -7, 6],
  "G_ProjectSource must match the C projection formula for mixed basis vectors"
);

const radiusRuntime = createGameRuntimeFromBspEntities([]);
radiusRuntime.maxentities = 16;
const solidMiss = createRuntimeEntity({ classname: "radius_miss" }, 1);
solidMiss.s.origin = [40, 0, 0];
solidMiss.origin = [...solidMiss.s.origin];
solidMiss.mins = [-4, -4, -4];
solidMiss.maxs = [4, 4, 4];
solidMiss.solid = 1;
const inactiveInside = createRuntimeEntity({ classname: "radius_inactive" }, 2);
inactiveInside.s.origin = [2, 0, 0];
inactiveInside.origin = [...inactiveInside.s.origin];
inactiveInside.solid = 1;
inactiveInside.inuse = false;
const nonsolidInside = createRuntimeEntity({ classname: "radius_nonsolid" }, 3);
nonsolidInside.s.origin = [3, 0, 0];
nonsolidInside.origin = [...nonsolidInside.s.origin];
nonsolidInside.solid = 0;
const centeredInside = createRuntimeEntity({ classname: "radius_centered" }, 4);
centeredInside.s.origin = [14, 0, 0];
centeredInside.origin = [...centeredInside.s.origin];
centeredInside.mins = [-12, -2, -2];
centeredInside.maxs = [0, 2, 2];
centeredInside.solid = 1;
const edgeInside = createRuntimeEntity({ classname: "radius_edge" }, 5);
edgeInside.s.origin = [0, 10, 0];
edgeInside.origin = [...edgeInside.s.origin];
edgeInside.solid = 1;
const afterEdge = createRuntimeEntity({ classname: "radius_after_edge" }, 6);
afterEdge.s.origin = [0, 8, 0];
afterEdge.origin = [...afterEdge.s.origin];
afterEdge.solid = 1;
radiusRuntime.entities[1] = solidMiss;
radiusRuntime.entities[2] = inactiveInside;
radiusRuntime.entities[3] = nonsolidInside;
radiusRuntime.entities[4] = centeredInside;
radiusRuntime.entities[5] = edgeInside;
radiusRuntime.entities[6] = afterEdge;
assert.equal(findradius(radiusRuntime, null, [0, 0, 0], 10), centeredInside, "findradius must skip inactive/non-solid/out-of-radius entities and use bbox center");
assert.equal(findradius(radiusRuntime, centeredInside, [0, 0, 0], 10), edgeInside, "findradius must resume after the previous entity and accept distance equal to radius");
assert.equal(findradius(radiusRuntime, edgeInside, [0, 0, 0], 10), afterEdge, "findradius must continue iteration after an accepted entity");
assert.equal(findradius(radiusRuntime, afterEdge, [0, 0, 0], 10), null, "findradius must return null after the final candidate");

const useRuntime = createGameRuntimeFromBspEntities([]);
useRuntime.maxentities = 32;
useRuntime.time = 10;
const activator = createRuntimeEntity({ classname: "player" }, 1);
const delayedSource = createRuntimeEntity({ classname: "trigger_once", target: "delayed_target", killtarget: "delayed_kill", message: "wait for it", delay: "2.5" }, 2);
useRuntime.entities[1] = activator;
useRuntime.entities[2] = delayedSource;
G_UseTargets(useRuntime, delayedSource, activator);
const delayed = useRuntime.entities.find((entity) => entity?.classname === "DelayedUse");
assert.ok(delayed, "G_UseTargets must spawn a DelayedUse entity when delay is set");
assert.equal(delayed.nextthink, 12.5, "G_UseTargets delayed nextthink mismatch");
assert.equal(delayed.think, Think_Delay, "G_UseTargets delayed think callback mismatch");
assert.equal(delayed.activator, activator, "G_UseTargets must copy activator into the delayed entity");
assert.equal(delayed.message, "wait for it", "G_UseTargets must copy message into the delayed entity");
assert.equal(delayed.target, "delayed_target", "G_UseTargets must copy target into the delayed entity");
assert.equal(delayed.killtarget, "delayed_kill", "G_UseTargets must copy killtarget into the delayed entity");

const delayedKilled = createRuntimeEntity({ classname: "delayed_killed", targetname: "delayed_kill" }, 4);
let delayedUseCalls = 0;
const delayedTarget = createRuntimeEntity({ classname: "delayed_target", targetname: "delayed_target" }, 5);
delayedTarget.use = (self, other, usedActivator) => {
  delayedUseCalls += 1;
  assert.equal(self, delayedTarget, "Think_Delay target self mismatch");
  assert.equal(other, delayed, "Think_Delay must use the temporary entity as other");
  assert.equal(usedActivator, activator, "Think_Delay activator mismatch");
};
useRuntime.entities[4] = delayedKilled;
useRuntime.entities[5] = delayedTarget;
runPendingThinks(useRuntime, 12.5);
assert.equal(delayedKilled.inuse, false, "Think_Delay/G_UseTargets must free copied killtargets");
assert.equal(delayedUseCalls, 1, "Think_Delay must dispatch copied targets exactly once");
assert.equal(delayed.inuse, false, "Think_Delay must free the temporary entity after dispatch");

const noActivatorRuntime = createGameRuntimeFromBspEntities([]);
const noActivatorSource = createRuntimeEntity({ classname: "trigger_once", target: "later", delay: "1" }, 1);
noActivatorRuntime.entities[1] = noActivatorSource;
G_UseTargets(noActivatorRuntime, noActivatorSource, null);
assert.equal(
  noActivatorRuntime.logEntries.some((entry) => entry.kind === "warning" && entry.message === "Think_Delay with no activator"),
  true,
  "G_UseTargets must warn when scheduling Think_Delay without an activator"
);

const immediateRuntime = createGameRuntimeFromBspEntities([]);
immediateRuntime.maxentities = 32;
const immediateActivator = createRuntimeEntity({ classname: "player" }, 1);
const messageSoundIndex = registerGameSound(immediateRuntime, "world/custom.wav");
const immediateSource = createRuntimeEntity({ classname: "trigger_multiple", target: "fire_me", killtarget: "kill_me", message: "hello", noise: "world/custom.wav" }, 2);
immediateSource.noise_index = messageSoundIndex;
const killMe = createRuntimeEntity({ classname: "target_remove", targetname: "kill_me" }, 3);
let usedFireTarget = false;
const fireMe = createRuntimeEntity({ classname: "target_relay", targetname: "fire_me" }, 4);
fireMe.use = (self, other, usedActivator) => {
  usedFireTarget = true;
  assert.equal(self, fireMe, "G_UseTargets fire target self mismatch");
  assert.equal(other, immediateSource, "G_UseTargets must pass source entity as other");
  assert.equal(usedActivator, immediateActivator, "G_UseTargets fire target activator mismatch");
};
const skippedAreaPortal = createRuntimeEntity({ classname: "func_areaportal", targetname: "fire_me" }, 5);
skippedAreaPortal.use = () => assert.fail("G_UseTargets must skip door-fired func_areaportal targets");
const selfUse = immediateSource;
selfUse.targetname = "fire_me";
immediateSource.classname = "func_door";
immediateRuntime.entities[1] = immediateActivator;
immediateRuntime.entities[2] = immediateSource;
immediateRuntime.entities[3] = killMe;
immediateRuntime.entities[4] = fireMe;
immediateRuntime.entities[5] = skippedAreaPortal;
G_UseTargets(immediateRuntime, immediateSource, immediateActivator);
assert.equal(drainGameCenterprintEvents(immediateRuntime).at(-1)?.message, "hello", "G_UseTargets must centerprint messages to non-monster activators");
assert.equal(drainGameSoundEvents(immediateRuntime).at(-1)?.soundPath, "world/custom.wav", "G_UseTargets must play noise_index sound when present");
assert.equal(killMe.inuse, false, "G_UseTargets must free killtargets");
assert.equal(usedFireTarget, true, "G_UseTargets must call target use callbacks");
assert.equal(
  immediateRuntime.logEntries.some((entry) => entry.kind === "warning" && entry.message === "WARNING: Entity used itself."),
  true,
  "G_UseTargets must warn on self-use targets"
);

const monsterRuntime = createGameRuntimeFromBspEntities([]);
const monsterActivator = createRuntimeEntity({ classname: "monster_soldier" }, 1);
monsterActivator.svflags |= SVF_MONSTER;
const monsterMessage = createRuntimeEntity({ classname: "trigger_multiple", message: "not for monsters" }, 2);
monsterRuntime.entities[1] = monsterActivator;
monsterRuntime.entities[2] = monsterMessage;
G_UseTargets(monsterRuntime, monsterMessage, monsterActivator);
assert.equal(drainGameCenterprintEvents(monsterRuntime).length, 0, "G_UseTargets must not centerprint messages to monster activators");
assert.equal(drainGameSoundEvents(monsterRuntime).length, 0, "G_UseTargets must not play message sounds to monster activators");

const movedir: [number, number, number] = [0, 0, 0];
const angles: [number, number, number] = [0, -1, 0];
G_SetMovedir(angles, movedir);
assert.deepEqual(movedir, [0, 0, 1], "G_SetMovedir up mismatch");
assert.deepEqual(angles, [0, 0, 0], "G_SetMovedir must clear source angles");
const downMovedir: [number, number, number] = [0, 0, 0];
const downAngles: [number, number, number] = [0, -2, 0];
G_SetMovedir(downAngles, downMovedir);
assert.deepEqual(downMovedir, [0, 0, -1], "G_SetMovedir down mismatch");
assert.deepEqual(downAngles, [0, 0, 0], "G_SetMovedir must clear down sentinel angles");
const forwardMovedir: [number, number, number] = [0, 0, 0];
const forwardAngles: [number, number, number] = [0, 90, 0];
G_SetMovedir(forwardAngles, forwardMovedir);
assert.equal(Math.abs(forwardMovedir[0]) < 1e-12, true, "G_SetMovedir AngleVectors forward X mismatch");
assert.equal(Math.abs(forwardMovedir[1] - 1) < 1e-12, true, "G_SetMovedir AngleVectors forward Y mismatch");
assert.equal(Math.abs(forwardMovedir[2]) < 1e-12, true, "G_SetMovedir AngleVectors forward Z mismatch");
assert.deepEqual(forwardAngles, [0, 0, 0], "G_SetMovedir must clear non-sentinel angles");

assert.equal(vectoyaw([0, 0, 4]), 0, "vectoyaw zero horizontal vector must return 0");
assert.equal(vectoyaw([0, 5, 0]), 90, "vectoyaw positive Y axis mismatch");
assert.equal(vectoyaw([0, -5, 0]), -90, "vectoyaw negative Y axis keeps C sentinel value");
assert.equal(vectoyaw([1, 1, 0]), 45, "vectoyaw diagonal mismatch");
assert.equal(vectoyaw([1, -1, 0]), 315, "vectoyaw negative atan2 result must wrap to positive degrees");
assert.equal(vectoyaw([2, 1, 0]), 26, "vectoyaw must truncate like the C int cast");
const convertedAngles = vectoangles([0, 1, 0]);
assert.equal(Math.abs(convertedAngles[0]), 0, "vectoangles pitch mismatch");
assert.equal(convertedAngles[1], 90, "vectoangles yaw mismatch");
assert.equal(convertedAngles[2], 0, "vectoangles roll mismatch");
assert.deepEqual(vectoangles([0, 0, 5]), [-90, 0, 0], "vectoangles vertical up branch mismatch");
assert.deepEqual(vectoangles([0, 0, -5]), [-270, 0, 0], "vectoangles vertical down branch mismatch");
const diagonalAngles = vectoangles([1, 1, 0]);
assert.equal(Math.abs(diagonalAngles[0]), 0, "vectoangles diagonal pitch mismatch");
assert.equal(diagonalAngles[1], 45, "vectoangles diagonal yaw mismatch");
assert.equal(diagonalAngles[2], 0, "vectoangles diagonal roll mismatch");
const negativeYawAngles = vectoangles([1, -1, 0]);
assert.equal(Math.abs(negativeYawAngles[0]), 0, "vectoangles negative yaw pitch mismatch");
assert.equal(negativeYawAngles[1], 315, "vectoangles negative yaw must wrap");
assert.equal(negativeYawAngles[2], 0, "vectoangles negative yaw roll mismatch");
assert.deepEqual(vectoangles([2, 0, 1]), [-26, 0, 0], "vectoangles pitch must truncate like the C int cast");
assert.deepEqual(vectoangles([0, -2, -1]), [-334, 270, 0], "vectoangles negative pitch must wrap before final sign");
assert.deepEqual(tv(1, 2, 3), [1, 2, 3], "tv mismatch");
const tvSlots = Array.from({ length: 8 }, (_, index) => tv(index, index + 10, index + 20));
const wrappedTvSlot = tv(99, 100, 101);
assert.equal(wrappedTvSlot, tvSlots[0], "tv must rotate through the original 8-vector static pool");
assert.deepEqual(tvSlots[0], [99, 100, 101], "tv wrapped slot contents mismatch");
assert.deepEqual(tvSlots[1], [1, 11, 21], "tv must leave non-wrapped temporary vectors intact");
assert.equal(vtos([1.8, -2.2, 3.9]), "(1 -2 3)", "vtos mismatch");
const vtosSlots = Array.from({ length: 8 }, (_, index) => vtos([index + 0.9, -(index + 0.9), index + 20.9]));
const wrappedVtosSlot = vtos([99.9, -100.9, 101.9]);
assert.deepEqual(vtosSlots, [
  "(0 0 20)",
  "(1 -1 21)",
  "(2 -2 22)",
  "(3 -3 23)",
  "(4 -4 24)",
  "(5 -5 25)",
  "(6 -6 26)",
  "(7 -7 27)"
], "vtos must truncate components toward zero like C integer casts");
assert.equal(wrappedVtosSlot, "(99 -100 101)", "vtos must keep rotating through the original 8-string static pool");
assert.equal(G_CopyString("quake"), "quake", "G_CopyString mismatch");
assert.equal(G_CopyString(""), "", "G_CopyString must preserve empty strings like strcpy");
assert.equal(G_CopyString("line\nbreak"), "line\nbreak", "G_CopyString must preserve copied string contents exactly");

const reusable = createRuntimeEntity({}, 3);
reusable.inuse = false;
reusable.freetime = 0;
runtime.entities[3] = reusable;
const spawned = G_Spawn(runtime);
assert.equal(spawned, reusable, "G_Spawn must reuse eligible freed entity");
assert.equal(spawned.classname, "noclass", "G_InitEdict must reset classname");
assert.equal(spawned.gravity, 1, "G_InitEdict must reset gravity");

const protectedEntity = createRuntimeEntity({}, 4);
runtime.entities[4] = protectedEntity;
G_InitEdict(protectedEntity);
G_FreeEdict(runtime, protectedEntity);
assert.equal(protectedEntity.inuse, true, "G_FreeEdict must not free protected edicts");

const freeable = createRuntimeEntity({}, 20);
runtime.entities[20] = freeable;
G_InitEdict(freeable);
G_FreeEdict(runtime, freeable);
assert.equal(freeable.inuse, false, "G_FreeEdict must free normal edicts");

const blocker = createRuntimeEntity({}, 21);
blocker.solid = 1;
blocker.health = 100;
refreshEntitySpatialState(blocker);

const telefragger = createRuntimeEntity({}, 22);
telefragger.s.origin = [0, 0, 0];
telefragger.origin = [0, 0, 0];
telefragger.mins = [-16, -16, -16];
telefragger.maxs = [16, 16, 16];

let damageCalls = 0;
runtime.collision = {
  world: {} as never,
  trace: () => ({
    allsolid: false,
    startsolid: false,
    fraction: 0,
    endpos: [0, 0, 0],
    plane: {
      normal: [0, 0, 0],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0]
    },
    surface: null,
    contents: 0,
    ent: damageCalls === 0 ? blocker : null
  }),
  pointcontents: () => 0
};
blocker.pain = (_self, _attacker, _knockback, damage) => {
  damageCalls += 1;
  blocker.health -= damage;
  blocker.solid = 0;
};
assert.equal(KillBox(runtime, telefragger), true, "KillBox must clear blocker");
assert.equal(damageCalls > 0, true, "KillBox must apply telefrag damage");

let repeatedTraceCalls = 0;
blocker.solid = 0;
runtime.collision.trace = () => {
  repeatedTraceCalls += 1;
  return {
    allsolid: false,
    startsolid: false,
    fraction: 0,
    endpos: [0, 0, 0],
    plane: {
      normal: [0, 0, 0],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0]
    },
    surface: null,
    contents: 0,
    ent: blocker
  };
};
assert.equal(KillBox(runtime, telefragger), true, "KillBox must stop if collision repeats a cleared blocker");
assert.equal(repeatedTraceCalls, 2, "KillBox repeated-blocker guard should stop after one retry");
assert.equal(MOD_TELEFRAG, 21, "MOD_TELEFRAG mismatch");

console.log("quake2-g-utils: ok");
