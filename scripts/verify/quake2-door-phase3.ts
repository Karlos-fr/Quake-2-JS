/**
 * File: quake2-door-phase3.ts
 * Purpose: Verify the first Quake II door lifecycle port on a touch-open brush door from `base1`.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 3 of the door plan.
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
  touchTriggerEntities,
  spawnGameEntity,
  type GameEntity,
  type GameRuntime,
  type GameRuntimeLogEntry
} from "../../packages/game/src/index.js";

const MAP_PATH = "maps/base1.bsp";
const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const DOOR_INDEX = 571;

main();

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

  const door = runtime.entities[DOOR_INDEX];
  runGameFrames(runtime, 0.1);
  const trigger = findDoorTrigger(runtime, door);
  if (!trigger) {
    throw new Error(`Aucun trigger de porte trouve pour ${getRuntimeEntityLabel(door)}`);
  }

  const player = createVerificationPlayer(runtime, computeBoundsCenter(trigger));
  touchTriggerEntities(runtime, player);
  runGameFrames(runtime, 6.0, () => {
    player.origin = computeBoundsCenter(trigger);
    touchTriggerEntities(runtime, player);
  });

  console.log(`Verification phase 3 - ${MAP_PATH}`);
  console.log(`door: ${getRuntimeEntityLabel(door)}`);
  console.log(`trigger: ${getRuntimeEntityLabel(trigger)}`);
  console.log(`player: ${getRuntimeEntityLabel(player)} @ ${player.origin.join(", ")}`);
  console.log(`final state: ${door.moveinfo.state}`);
  console.log(`final origin: ${door.origin.join(", ")}`);
  console.log("");

  for (const entry of runtime.logEntries) {
    console.log(formatLogEntry(entry));
  }
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
 * Purpose: Place the verification player at the center of one trigger helper volume.
 */
function computeBoundsCenter(entity: GameEntity): [number, number, number] {
  return [
    (entity.mins[0] + entity.maxs[0]) * 0.5,
    (entity.mins[1] + entity.maxs[1]) * 0.5,
    (entity.mins[2] + entity.maxs[2]) * 0.5
  ];
}

function formatLogEntry(entry: GameRuntimeLogEntry): string {
  return `[t=${entry.time.toFixed(3)}] ${entry.kind} :: ${entry.message}`;
}
