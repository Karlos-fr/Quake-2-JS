/**
 * File: quake2-door-phase5.ts
 * Purpose: Verify that Quake II pushers now move brush origins and angles frame by frame.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 5 of the door plan.
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
  createGameRuntimeFromBspMap,
  getRuntimeEntityLabel,
  initializeDoorPlanEntities,
  runGameFrames,
  spawnGameEntity,
  touchTriggerEntities,
  useGameEntity,
  type GameEntity,
  type GameRuntime,
  type GameRuntimeLogEntry
} from "../../packages/game/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base2.bsp";
const LINEAR_DOOR_INDEX = 363;
const ROTATING_DOOR_INDEX = 473;
const PLAT_INDEX = 550;

main();

/**
 * Category: New
 * Purpose: Run the phase-5 verification flow over one linear door, one rotating door and one platform.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const pak = parsePak(pakBytes, pakPath);

  const linearDoorScenario = runLinearDoorScenario(pak);
  const rotatingDoorScenario = runRotatingDoorScenario(pak);
  const platScenario = runPlatScenario(pak);

  console.log(`Verification phase 5 - ${MAP_PATH}`);
  console.log("");
  printScenario("Porte lineaire", linearDoorScenario.runtime.logEntries, [
    `door: ${getRuntimeEntityLabel(linearDoorScenario.entity)}`,
    `initial origin: ${linearDoorScenario.initialOrigin.join(", ")}`,
    `final origin: ${linearDoorScenario.entity.origin.join(", ")}`,
    `final state: ${linearDoorScenario.entity.moveinfo.state}`
  ]);
  printScenario("Porte rotative", rotatingDoorScenario.runtime.logEntries, [
    `door: ${getRuntimeEntityLabel(rotatingDoorScenario.entity)}`,
    `initial angles: ${rotatingDoorScenario.initialAngles.join(", ")}`,
    `final angles: ${rotatingDoorScenario.entity.angles.join(", ")}`,
    `final state: ${rotatingDoorScenario.entity.moveinfo.state}`
  ]);
  printScenario("Plateforme", platScenario.runtime.logEntries, [
    `plat: ${getRuntimeEntityLabel(platScenario.entity)}`,
    `initial origin: ${platScenario.initialOrigin.join(", ")}`,
    `final origin: ${platScenario.entity.origin.join(", ")}`,
    `final state: ${platScenario.entity.moveinfo.state}`
  ]);
}

/**
 * Category: New
 * Purpose: Verify that one translating brush door now updates its world origin over pusher frames.
 */
function runLinearDoorScenario(pak: ReturnType<typeof parsePak>): {
  runtime: GameRuntime;
  entity: GameEntity;
  initialOrigin: [number, number, number];
} {
  const runtime = createRuntimeForMap(pak);
  const door = runtime.entities[LINEAR_DOOR_INDEX];
  const initialOrigin: [number, number, number] = [...door.origin];

  runGameFrames(runtime, 0.1);
  const trigger = findDoorTrigger(runtime, door);
  if (!trigger) {
    throw new Error(`Aucun trigger de porte trouve pour ${getRuntimeEntityLabel(door)}`);
  }

  const player = createVerificationPlayer(runtime, computeBoundsCenter(trigger));
  runGameFrames(runtime, 6.0, () => {
    player.origin = computeBoundsCenter(trigger);
    touchTriggerEntities(runtime, player);
  });

  return { runtime, entity: door, initialOrigin };
}

/**
 * Category: New
 * Purpose: Verify that one rotating brush door now updates its world angles over pusher frames.
 */
function runRotatingDoorScenario(pak: ReturnType<typeof parsePak>): {
  runtime: GameRuntime;
  entity: GameEntity;
  initialAngles: [number, number, number];
} {
  const runtime = createRuntimeForMap(pak);
  const door = runtime.entities[ROTATING_DOOR_INDEX];
  const initialAngles: [number, number, number] = [...door.angles];
  const player = createVerificationPlayer(runtime, [...door.origin]);

  useGameEntity(runtime, door, player, player);
  runGameFrames(runtime, 4.0);

  return { runtime, entity: door, initialAngles };
}

/**
 * Category: New
 * Purpose: Verify that one platform now updates its world origin over pusher frames.
 */
function runPlatScenario(pak: ReturnType<typeof parsePak>): {
  runtime: GameRuntime;
  entity: GameEntity;
  initialOrigin: [number, number, number];
} {
  const runtime = createRuntimeForMap(pak);
  const plat = runtime.entities[PLAT_INDEX];
  const initialOrigin: [number, number, number] = [...plat.origin];
  const trigger = findPlatTrigger(runtime, plat);
  if (!trigger) {
    throw new Error(`Aucun trigger de plat trouve pour ${getRuntimeEntityLabel(plat)}`);
  }

  const player = createVerificationPlayer(runtime, computeBoundsCenter(trigger));
  runGameFrames(runtime, 20.0, () => {
    player.origin = computeBoundsCenter(trigger);
    touchTriggerEntities(runtime, player);
  });

  return { runtime, entity: plat, initialOrigin };
}

/**
 * Category: New
 * Purpose: Create one gameplay runtime for `base2` and initialize the currently ported brush entities.
 */
function createRuntimeForMap(pak: ReturnType<typeof parsePak>): GameRuntime {
  const bspEntry = findPakEntry(pak, MAP_PATH);
  if (!bspEntry) {
    throw new Error(`${MAP_PATH} introuvable dans ${pak.sourcePath}`);
  }

  const map = parseBsp(readPakEntryData(pak, bspEntry), MAP_PATH);
  const runtime = createGameRuntimeFromBspMap(map);
  initializeDoorPlanEntities(runtime);
  return runtime;
}

/**
 * Category: New
 * Purpose: Create one local verification player using the original Quake II trigger hull dimensions.
 */
function createVerificationPlayer(runtime: GameRuntime, origin: [number, number, number]): GameEntity {
  const player = spawnGameEntity(runtime);
  player.classname = "player";
  player.client = true;
  player.health = 100;
  player.origin = [...origin];
  player.mins = [-16, -16, -24];
  player.maxs = [16, 16, 32];
  player.size = [32, 32, 56];
  return player;
}

/**
 * Category: New
 * Purpose: Find the helper trigger spawned for one touch-open door.
 */
function findDoorTrigger(runtime: GameRuntime, door: GameEntity): GameEntity | null {
  for (const entity of runtime.entities) {
    if (!entity.inuse || entity.classname !== "door_trigger" || entity.owner !== door) {
      continue;
    }

    return entity;
  }

  return null;
}

/**
 * Category: New
 * Purpose: Find the helper trigger spawned for one platform lift.
 */
function findPlatTrigger(runtime: GameRuntime, plat: GameEntity): GameEntity | null {
  for (const entity of runtime.entities) {
    if (!entity.inuse || entity.classname !== "plat_trigger" || entity.enemy !== plat) {
      continue;
    }

    return entity;
  }

  return null;
}

/**
 * Category: New
 * Purpose: Place the verification player at the center of one trigger helper volume.
 */
function computeBoundsCenter(entity: GameEntity): [number, number, number] {
  return [
    (entity.mins[0] + entity.maxs[0]) * 0.5,
    (entity.mins[1] + entity.maxs[1]) * 0.5,
    (entity.mins[2] + entity.maxs[2]) * 0.5
  ];
}

/**
 * Category: New
 * Purpose: Print one verification scenario with summary lines followed by runtime logs.
 */
function printScenario(title: string, entries: GameRuntimeLogEntry[], summaryLines: string[]): void {
  console.log(`=== ${title} ===`);
  for (const line of summaryLines) {
    console.log(line);
  }
  console.log("");
  for (const entry of entries) {
    console.log(formatLogEntry(entry));
  }
  console.log("");
}

/**
 * Category: New
 * Purpose: Format one runtime log entry for console verification output.
 */
function formatLogEntry(entry: GameRuntimeLogEntry): string {
  return `[t=${entry.time.toFixed(3)}] ${entry.kind} :: ${entry.message}`;
}
