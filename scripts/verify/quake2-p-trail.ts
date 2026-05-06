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
assert.ok(
  runtime.playerTrail.trail.every((marker) => marker.classname === "player_trail"),
  "init must spawn canonical player_trail markers"
);

runtime.time = 1;
PlayerTrail_Add(runtime, [10, 0, 0]);
runtime.time = 2;
PlayerTrail_Add(runtime, [20, 10, 0]);

const lastSpot = PlayerTrail_LastSpot(runtime);
assert.ok(lastSpot, "last spot must exist");
assert.deepEqual(lastSpot!.s.origin, [20, 10, 0], "last spot origin mismatch");
assert.equal(lastSpot!.s.angles[1], 45, "last spot yaw mismatch");

runtime.time = 3;
PlayerTrail_Add(runtime, [22, 9, 0]);
const truncatedSpot = PlayerTrail_LastSpot(runtime);
assert.ok(truncatedSpot, "truncated spot must exist");
assert.equal(
  truncatedSpot!.s.angles[1],
  334,
  "PlayerTrail_Add must use the official g_utils.vectoyaw C truncation and negative wrap"
);

const monster = createRuntimeEntity({}, 99);
monster.monsterinfo.trail_time = 0;

const firstVisible = PlayerTrail_PickFirst(monster, runtime);
assert.equal(firstVisible, runtime.playerTrail.trail[0], "pick first visible mismatch");

const nextSpot = PlayerTrail_PickNext(monster, runtime);
assert.equal(nextSpot, runtime.playerTrail.trail[0], "pick next mismatch");

PlayerTrail_New(runtime, [30, 30, 0]);
assert.equal(runtime.playerTrail.trail_head, 1, "trail new must reinit then add one marker");
assert.deepEqual(runtime.playerTrail.trail[0]?.s.origin, [30, 30, 0], "trail new first spot mismatch");

const wrapRuntime = createGameRuntimeFromBspEntities([]);
PlayerTrail_Init(wrapRuntime);
for (let i = 0; i < TRAIL_LENGTH + 2; i += 1) {
  wrapRuntime.time = i + 1;
  PlayerTrail_Add(wrapRuntime, [i * 8, i, 0]);
}
assert.equal(wrapRuntime.playerTrail.trail_head, 2, "trail head must wrap with NEXT macro semantics");
const wrappedLastSpot = PlayerTrail_LastSpot(wrapRuntime);
assert.deepEqual(wrappedLastSpot?.s.origin, [72, 9, 0], "last spot must use PREV(head) after wrap");

const fallbackRuntime = createGameRuntimeFromBspEntities([]);
fallbackRuntime.collision = {
  world: {} as never,
  trace: (_start, _mins, _maxs, end) => ({
    allsolid: false,
    startsolid: false,
    fraction: end[0] === 10 ? 1 : 0.5,
    endpos: [...end],
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
PlayerTrail_Init(fallbackRuntime);
fallbackRuntime.playerTrail.trail_head = 1;
fallbackRuntime.playerTrail.trail[0]!.timestamp = 5;
fallbackRuntime.playerTrail.trail[0]!.s.origin = [10, 0, 0];
fallbackRuntime.playerTrail.trail[7]!.timestamp = 4;
fallbackRuntime.playerTrail.trail[7]!.s.origin = [10, 0, 0];
fallbackRuntime.playerTrail.trail[1]!.timestamp = 6;
fallbackRuntime.playerTrail.trail[1]!.s.origin = [20, 0, 0];
const fallbackMonster = createRuntimeEntity({}, 100);
fallbackMonster.monsterinfo.trail_time = 4;
const fallbackSpot = PlayerTrail_PickFirst(fallbackMonster, fallbackRuntime);
assert.equal(fallbackSpot, fallbackRuntime.playerTrail.trail[0], "PickFirst must fall back to PREV(marker) when current is not visible");

const inactiveRuntime = createGameRuntimeFromBspEntities([]);
assert.equal(PlayerTrail_LastSpot(inactiveRuntime), null, "inactive runtime adapter should not expose an uninitialized last spot");
PlayerTrail_Add(inactiveRuntime, [1, 2, 3]);
assert.equal(inactiveRuntime.playerTrail.trail_head, 0, "inactive add must be a no-op");
assert.equal(PlayerTrail_PickFirst(createRuntimeEntity({}, 101), inactiveRuntime), null, "inactive PickFirst must return null");
assert.equal(PlayerTrail_PickNext(createRuntimeEntity({}, 102), inactiveRuntime), null, "inactive PickNext must return null");

const deathmatchRuntime = createGameRuntimeFromBspEntities([]);
deathmatchRuntime.deathmatch = true;
PlayerTrail_Init(deathmatchRuntime);
assert.equal(deathmatchRuntime.playerTrail.trail_active, false, "deathmatch must keep trail inactive");

console.log("quake2-p-trail: ok");
