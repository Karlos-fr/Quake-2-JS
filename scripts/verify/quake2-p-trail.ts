/**
 * File: quake2-p-trail.ts
 * Purpose: Verify the direct TypeScript port of `game/p_trail.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict gameplay port.
 *
 * Dependencies:
 * - packages/game/src/p_trail.ts
 * - packages/game/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import {
  PlayerTrail_Add,
  PlayerTrail_Init,
  PlayerTrail_LastSpot,
  PlayerTrail_New,
  PlayerTrail_PickFirst,
  PlayerTrail_PickNext,
  TRAIL_LENGTH
} from "../../packages/game/src/p_trail.js";
import { createGameRuntimeFromBspEntities, createRuntimeEntity } from "../../packages/game/src/runtime.js";

const runtime = createGameRuntimeFromBspEntities([]);
runtime.collision = {
  world: {} as never,
  trace: (start) => ({
    allsolid: false,
    startsolid: false,
    fraction: start[0] === 0 ? 1 : 0.5,
    endpos: [...start],
    plane: {
      normal: [0, 0, 0],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0]
    },
    surface: null,
    contents: 0,
    ent: null
  }),
  pointcontents: () => 0
};
PlayerTrail_Init(runtime);

assert.equal(runtime.playerTrail.trail_active, true, "trail must activate after init");
assert.equal(runtime.playerTrail.trail.length, TRAIL_LENGTH, "trail length mismatch");
assert.equal(runtime.playerTrail.trail_head, 0, "trail head init mismatch");

runtime.time = 1;
PlayerTrail_Add(runtime, [10, 0, 0]);
runtime.time = 2;
PlayerTrail_Add(runtime, [20, 10, 0]);

const lastSpot = PlayerTrail_LastSpot(runtime);
assert.ok(lastSpot, "last spot must exist");
assert.deepEqual(lastSpot!.s.origin, [20, 10, 0], "last spot origin mismatch");
assert.equal(Math.round(lastSpot!.s.angles[1]), 45, "last spot yaw mismatch");

const monster = createRuntimeEntity({}, 99);
monster.monsterinfo.trail_time = 0;

const firstVisible = PlayerTrail_PickFirst(monster, runtime);
assert.equal(firstVisible, runtime.playerTrail.trail[0], "pick first visible mismatch");

const nextSpot = PlayerTrail_PickNext(monster, runtime);
assert.equal(nextSpot, runtime.playerTrail.trail[0], "pick next mismatch");

PlayerTrail_New(runtime, [30, 30, 0]);
assert.equal(runtime.playerTrail.trail_head, 1, "trail new must reinit then add one marker");
assert.deepEqual(runtime.playerTrail.trail[0]?.s.origin, [30, 30, 0], "trail new first spot mismatch");

const deathmatchRuntime = createGameRuntimeFromBspEntities([]);
deathmatchRuntime.deathmatch = true;
PlayerTrail_Init(deathmatchRuntime);
assert.equal(deathmatchRuntime.playerTrail.trail_active, false, "deathmatch must keep trail inactive");

console.log("quake2-p-trail: ok");
