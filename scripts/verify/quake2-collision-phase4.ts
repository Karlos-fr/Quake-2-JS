/**
 * File: quake2-collision-phase4.ts
 * Purpose: Verify `SV_TestEntityPosition`, `SV_Impact` and `SV_PushEntity` against the gameplay collision bridge.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 4 of the collision plan.
 *
 * Dependencies:
 * - packages/formats
 * - packages/game
 */

import fs from "node:fs";
import path from "node:path";
import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import { parseBsp } from "../../packages/formats/src/bsp.js";
import {
  SOLID_BSP,
  SOLID_TRIGGER,
  SV_PushEntity,
  SV_TestEntityPosition,
  createGameRuntimeFromBspEntities,
  createGameRuntimeFromBspMap,
  initializeDoorPlanEntities,
  linkGameEntity,
  refreshEntitySpatialState,
  runGameFrames,
  spawnGameEntity,
  type GameRuntime,
  type GameEntity
} from "../../packages/game/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base1.bsp";
const DOOR_MODEL = "*32";

main();

/**
 * Category: New
 * Purpose: Run the phase-4 gameplay collision verification suite.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const pak = parsePak(pakBytes, pakPath);
  const bspEntry = findPakEntry(pak, MAP_PATH);
  if (!bspEntry) {
    throw new Error(`${MAP_PATH} introuvable dans ${pakPath}`);
  }

  const map = parseBsp(readPakEntryData(pak, bspEntry), MAP_PATH);
  const runtime = createGameRuntimeFromBspMap(map);
  initializeDoorPlanEntities(runtime);
  runGameFrames(runtime, 0.2);

  const door = requireEntityByModel(runtime.entities, DOOR_MODEL);
  const actor = spawnDynamicBox(runtime, "phase4_actor");

  actor.origin = [door.absmin[0] - actor.maxs[0] + 1, center(door.absmin[1], door.absmax[1]), door.absmin[2] + 24];
  refreshEntitySpatialState(actor);
  linkGameEntity(runtime, actor);

  const blocked = SV_TestEntityPosition(actor, runtime);
  const doorProbe = spawnDynamicBox(runtime, "phase4_door_probe");
  doorProbe.origin = [door.absmin[0] - 128, center(door.absmin[1], door.absmax[1]), door.absmin[2] + 24];
  refreshEntitySpatialState(doorProbe);
  linkGameEntity(runtime, doorProbe);
  const doorTrace = SV_PushEntity(doorProbe, [96, 0, 0], runtime);

  const touched: string[] = [];
  const callbackRuntime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  const target = spawnDynamicBox(callbackRuntime, "phase4_target");
  target.origin = [0, 0, 0];
  refreshEntitySpatialState(target);
  linkGameEntity(callbackRuntime, target);

  const blocker = spawnDynamicBox(callbackRuntime, "phase4_blocker");
  blocker.origin = [80, 0, 0];
  blocker.touch = (self, other) => {
    touched.push(`${self.classname}<-${other.classname}`);
  };
  target.touch = (self, other) => {
    touched.push(`${self.classname}->${other.classname}`);
  };
  refreshEntitySpatialState(blocker);
  linkGameEntity(callbackRuntime, blocker);

  callbackRuntime.collision = {
    world: runtime.collision!.world,
    trace: (start, mins, maxs, end, passent) => {
      if (passent === target) {
        return {
          allsolid: false,
          startsolid: false,
          fraction: 0.5,
          endpos: [48, 0, 0],
          plane: {
            normal: [-1, 0, 0],
            dist: 0,
            type: 0,
            signbits: 0,
            pad: [0, 0]
          },
          surface: null,
          contents: 0,
          ent: blocker
        };
      }

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
    },
    pointcontents: () => 0
  };

  const impactTrace = SV_PushEntity(target, [96, 0, 0], callbackRuntime);

  const triggerTouches: string[] = [];
  const triggerActor = spawnDynamicBox(callbackRuntime, "phase4_trigger_actor");
  triggerActor.origin = [0, 0, 0];
  refreshEntitySpatialState(triggerActor);
  linkGameEntity(callbackRuntime, triggerActor);

  const trigger = spawnGameEntity(callbackRuntime);
  trigger.classname = "phase4_trigger";
  trigger.solid = SOLID_TRIGGER;
  trigger.mins = [48, -32, -24];
  trigger.maxs = [112, 32, 32];
  trigger.touch = (self, other) => {
    triggerTouches.push(`${self.classname}:${other.classname}`);
  };
  refreshEntitySpatialState(trigger);
  linkGameEntity(callbackRuntime, trigger);

  callbackRuntime.collision.trace = (_start, _mins, _maxs, end) => ({
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
  });
  const triggerTrace = SV_PushEntity(triggerActor, [96, 0, 0], callbackRuntime);

  console.log(`Verification collision phase 4 - ${MAP_PATH}`);
  console.log(`actor blocked at start: ${blocked ? blocked.classname : "null"}`);
  console.log(`door trace fraction: ${doorTrace.fraction.toFixed(4)}`);
  console.log(`door trace ent: ${doorTrace.ent && typeof doorTrace.ent === "object" && "classname" in (doorTrace.ent as object) ? (doorTrace.ent as GameEntity).classname : "null"}`);
  console.log(`impact trace fraction: ${impactTrace.fraction.toFixed(4)}`);
  console.log(`touch callbacks: ${touched.join(", ")}`);
  console.log(`trigger trace fraction: ${triggerTrace.fraction.toFixed(4)}`);
  console.log(`trigger touches: ${triggerTouches.join(", ")}`);
  console.log(`target final origin: ${target.origin.join(", ")}`);

  assertBoolean(blocked !== null, true, "SV_TestEntityPosition startsolid");
  assertBoolean(doorTrace.fraction < 1, true, "SV_PushEntity blocked by moving door");
  assertBoolean(impactTrace.fraction < 1, true, "SV_PushEntity blocked by dynamic box");
  assertBoolean(touched.includes("phase4_target->phase4_blocker"), true, "touch callback actor->blocker");
  assertBoolean(touched.includes("phase4_blocker<-phase4_target"), true, "touch callback blocker<-actor");
  assertBoolean(triggerTrace.fraction === 1, true, "SV_PushEntity trigger path free");
  assertBoolean(triggerTouches.includes("phase4_trigger:phase4_trigger_actor"), true, "G_TouchTriggers equivalent after push");
}

/**
 * Category: New
 * Purpose: Spawn one linked dynamic gameplay box used by the verification harness.
 */
function spawnDynamicBox(runtime: GameRuntime, classname: string): GameEntity {
  const entity = spawnGameEntity(runtime);
  entity.classname = classname;
  entity.solid = SOLID_BSP;
  entity.mins = [-16, -16, -24];
  entity.maxs = [16, 16, 32];
  refreshEntitySpatialState(entity);
  linkGameEntity(runtime, entity);
  return entity;
}

/**
 * Category: New
 * Purpose: Find one runtime entity by inline model name.
 */
function requireEntityByModel(entities: GameEntity[], model: string): GameEntity {
  const entity = entities.find((candidate) => candidate.inuse && candidate.model === model);
  if (!entity) {
    throw new Error(`Entite ${model} introuvable`);
  }

  return entity;
}

/**
 * Category: New
 * Purpose: Compute the center of one scalar interval.
 */
function center(min: number, max: number): number {
  return (min + max) * 0.5;
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
