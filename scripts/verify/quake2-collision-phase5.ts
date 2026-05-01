/**
 * File: quake2-collision-phase5.ts
 * Purpose: Verify `SV_Push` pusher behavior including clamp, rider transport, rotation, rollback and trigger touches.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 5 of the collision plan.
 *
 * Dependencies:
 * - packages/game
 */

import {
  MOVETYPE_PUSH,
  MOVETYPE_STEP,
  SOLID_BSP,
  SOLID_BBOX,
  SOLID_TRIGGER,
  SV_Physics_Pusher,
  SV_Push,
  createGameRuntimeFromBspEntities,
  linkGameEntity,
  refreshEntitySpatialState,
  spawnGameEntity,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import type { trace_t, vec3_t } from "../../packages/qcommon/src/index.js";

main();

/**
 * Category: New
 * Purpose: Run the phase-5 pusher verification suite.
 */
function main(): void {
  const linearResult = verifyLinearCarryAndTriggerTouch();
  const rotationResult = verifyRotatingCarry();
  const rollbackResult = verifyRollbackAndBlockedCallback();

  console.log("Verification collision phase 5");
  console.log(`linear pusher origin: ${linearResult.pusherOrigin.join(", ")}`);
  console.log(`linear rider origin: ${linearResult.riderOrigin.join(", ")}`);
  console.log(`trigger touches: ${linearResult.triggerTouches.join(", ")}`);
  console.log(`rotating rider origin: ${rotationResult.riderOrigin.join(", ")}`);
  console.log(`rollback pusher origin: ${rollbackResult.pusherOrigin.join(", ")}`);
  console.log(`rollback rider origin: ${rollbackResult.riderOrigin.join(", ")}`);
  console.log(`blocked calls: ${rollbackResult.blockedCalls.join(", ")}`);

  assertNumber(linearResult.pusherOrigin[0], 1.125, "clamp move to 1/8");
  assertNumber(linearResult.riderOrigin[0], 1.125, "carry rider along move");
  assertBoolean(linearResult.triggerTouches.includes("phase5_trigger:phase5_rider"), true, "trigger touch on successful push");
  assertBoolean(Math.abs(rotationResult.riderOrigin[0]) < 0.001, true, "rotation moves rider off original x");
  assertBoolean(Math.abs(Math.abs(rotationResult.riderOrigin[1]) - 64) < 0.001, true, "rotation keeps rider radius");
  assertNumber(rollbackResult.pusherOrigin[0], 0, "rollback restores pusher origin");
  assertNumber(rollbackResult.riderOrigin[0], 0, "rollback restores rider origin");
  assertBoolean(rollbackResult.blockedCalls.includes("phase5_pusher_blocked:phase5_rider_blocked"), true, "blocked callback receives obstacle");
}

/**
 * Category: New
 * Purpose: Verify linear push transport, clamp and trigger touches.
 */
function verifyLinearCarryAndTriggerTouch(): {
  pusherOrigin: vec3_t;
  riderOrigin: vec3_t;
  triggerTouches: string[];
} {
  const runtime = createRuntimeWithFreeCollision();
  const pusher = spawnPusher(runtime, "phase5_pusher");
  const rider = spawnDynamicBox(runtime, "phase5_rider");
  rider.origin = [0, 0, 80];
  rider.groundentity = pusher;
  refreshEntitySpatialState(rider);
  linkGameEntity(runtime, rider);

  const triggerTouches: string[] = [];
  const trigger = spawnGameEntity(runtime);
  trigger.classname = "phase5_trigger";
  trigger.solid = SOLID_TRIGGER;
  trigger.mins = [-32, -32, 48];
  trigger.maxs = [32, 32, 128];
  trigger.touch = (self, other) => {
    triggerTouches.push(`${self.classname}:${other.classname}`);
  };
  refreshEntitySpatialState(trigger);
  linkGameEntity(runtime, trigger);

  SV_Push(pusher, [1.13, 0, 0], [0, 0, 0], runtime);

  return {
    pusherOrigin: [...pusher.origin],
    riderOrigin: [...rider.origin],
    triggerTouches
  };
}

/**
 * Category: New
 * Purpose: Verify angular carry compensation for entities riding one rotating pusher.
 */
function verifyRotatingCarry(): { riderOrigin: vec3_t } {
  const runtime = createRuntimeWithFreeCollision();
  const pusher = spawnPusher(runtime, "phase5_rotating_pusher");
  const rider = spawnDynamicBox(runtime, "phase5_rotating_rider");
  rider.origin = [64, 0, 80];
  rider.groundentity = pusher;
  refreshEntitySpatialState(rider);
  linkGameEntity(runtime, rider);

  SV_Push(pusher, [0, 0, 0], [0, 90, 0], runtime);

  return {
    riderOrigin: [...rider.origin]
  };
}

/**
 * Category: New
 * Purpose: Verify failed pushes roll back and route the obstacle to the blocked callback.
 */
function verifyRollbackAndBlockedCallback(): {
  pusherOrigin: vec3_t;
  riderOrigin: vec3_t;
  blockedCalls: string[];
} {
  const runtime = createRuntimeWithFreeCollision();
  const pusher = spawnPusher(runtime, "phase5_pusher_blocked");
  const rider = spawnDynamicBox(runtime, "phase5_rider_blocked");
  rider.origin = [0, 0, 80];
  rider.groundentity = pusher;
  refreshEntitySpatialState(rider);
  linkGameEntity(runtime, rider);

  const blockedCalls: string[] = [];
  pusher.blocked = (self, other) => {
    blockedCalls.push(`${self.classname}:${other.classname}`);
  };
  pusher.velocity = [20, 0, 0];

  runtime.collision!.trace = (start, mins, maxs, end, passent) => {
    if (passent === rider) {
      return createBlockedTrace(start, end, start[0] === 0 ? 0 : 0, rider);
    }

    return createFreeTrace(end);
  };

  SV_Physics_Pusher(pusher, runtime);

  return {
    pusherOrigin: [...pusher.origin],
    riderOrigin: [...rider.origin],
    blockedCalls
  };
}

/**
 * Category: New
 * Purpose: Build one isolated gameplay runtime with a collision bridge that never blocks by default.
 */
function createRuntimeWithFreeCollision(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  runtime.collision = {
    world: {} as GameRuntime["collision"] extends infer T ? T extends { world: infer W } ? W : never : never,
    trace: (_start, _mins, _maxs, end) => createFreeTrace(end),
    pointcontents: () => 0
  };
  return runtime;
}

/**
 * Category: New
 * Purpose: Spawn one pusher entity used by the phase-5 harness.
 */
function spawnPusher(runtime: GameRuntime, classname: string): GameEntity {
  const pusher = spawnGameEntity(runtime);
  pusher.classname = classname;
  pusher.movetype = MOVETYPE_PUSH;
  pusher.solid = SOLID_BSP;
  pusher.mins = [-32, -32, 0];
  pusher.maxs = [32, 32, 64];
  refreshEntitySpatialState(pusher);
  linkGameEntity(runtime, pusher);
  return pusher;
}

/**
 * Category: New
 * Purpose: Spawn one dynamic box entity used by the phase-5 harness.
 */
function spawnDynamicBox(runtime: GameRuntime, classname: string): GameEntity {
  const entity = spawnGameEntity(runtime);
  entity.classname = classname;
  entity.movetype = MOVETYPE_STEP;
  entity.solid = SOLID_BBOX;
  entity.mins = [-16, -16, -24];
  entity.maxs = [16, 16, 32];
  refreshEntitySpatialState(entity);
  linkGameEntity(runtime, entity);
  return entity;
}

/**
 * Category: New
 * Purpose: Build one free trace result ending at the requested endpoint.
 */
function createFreeTrace(end: vec3_t): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction: 1,
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
  };
}

/**
 * Category: New
 * Purpose: Build one startsolid trace used to force blocked push rollback in the harness.
 */
function createBlockedTrace(start: vec3_t, end: vec3_t, fraction: number, ent: GameEntity): trace_t {
  return {
    allsolid: true,
    startsolid: true,
    fraction,
    endpos: fraction === 0 ? [...start] : [...end],
    plane: {
      normal: [0, 0, 0],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0]
    },
    surface: null,
    contents: 0,
    ent
  };
}

/**
 * Category: New
 * Purpose: Assert one boolean equality in verification output.
 */
function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
}

/**
 * Category: New
 * Purpose: Assert one numeric equality with a strict epsilon suitable for deterministic harnesses.
 */
function assertNumber(actual: number, expected: number, label: string): void {
  if (Math.abs(actual - expected) > 0.0001) {
    throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
}
