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
  G_CopyString,
  G_Find,
  G_FreeEdict,
  G_InitEdict,
  G_PickTarget,
  G_ProjectSource,
  G_SetMovedir,
  G_Spawn,
  KillBox,
  tv,
  vectoyaw,
  vectoangles,
  vtos
} from "../../packages/game/src/g_utils.js";
import { createGameRuntimeFromBspEntities, createRuntimeEntity, refreshEntitySpatialState } from "../../packages/game/src/runtime.js";

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
runtime.entities[1] = targetA;
runtime.entities[2] = targetB;
runtime.entities[3] = inactiveMatch;
runtime.entities[4] = nonStringField;
runtime.entities[5] = caseMatch;

assert.equal(G_Find(runtime, null, "targetname", "pick_me"), targetA, "G_Find first match mismatch");
assert.equal(G_Find(runtime, targetA, "targetname", "pick_me"), targetB, "G_Find next match mismatch");
assert.equal(G_Find(runtime, targetB, "targetname", "pick_me"), null, "G_Find must skip inactive entities and return null at list end");
assert.equal(G_Find(runtime, targetB, "targetname", "pick_case"), caseMatch, "G_Find must compare strings like Q_stricmp");
assert.equal(G_Find(runtime, nonStringField, "message", "missing"), null, "G_Find must skip null string fields and return null at list end");

const originalRandom = Math.random;
Math.random = () => 0.9;
assert.equal(G_PickTarget(runtime, "pick_me"), targetB, "G_PickTarget mismatch");
Math.random = originalRandom;

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

const movedir: [number, number, number] = [0, 0, 0];
const angles: [number, number, number] = [0, -1, 0];
G_SetMovedir(angles, movedir);
assert.deepEqual(movedir, [0, 0, 1], "G_SetMovedir up mismatch");
assert.deepEqual(angles, [0, 0, 0], "G_SetMovedir must clear source angles");

assert.equal(vectoyaw([1, 1, 0]), 45, "vectoyaw mismatch");
const convertedAngles = vectoangles([0, 1, 0]);
assert.equal(Math.abs(convertedAngles[0]), 0, "vectoangles pitch mismatch");
assert.equal(convertedAngles[1], 90, "vectoangles yaw mismatch");
assert.equal(convertedAngles[2], 0, "vectoangles roll mismatch");
assert.deepEqual(tv(1, 2, 3), [1, 2, 3], "tv mismatch");
assert.equal(vtos([1.8, -2.2, 3.9]), "(1 -2 3)", "vtos mismatch");
assert.equal(G_CopyString("quake"), "quake", "G_CopyString mismatch");

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
