/**
 * File: quake2-door-phase6.ts
 * Purpose: Verify Quake II spawn registry wiring, team linking and inline brush entity setup.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 6 of the door plan.
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
  FL_TEAMSLAVE,
  createGameRuntimeFromBspMap,
  getRuntimeEntityLabel,
  initializeDoorPlanEntities,
  runGameFrames,
  spawnGameEntity,
  touchTriggerEntities,
  type GameEntity,
  type GameRuntime,
  type GameRuntimeLogEntry
} from "../../packages/game/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base1.bsp";
const TEAM_DOOR_MASTER_INDEX = 571;
const TEAM_DOOR_SLAVE_INDEX = 572;
const BRUSH_ENTITY_INDICES = [564, 571, 572];

main();

/**
 * Category: New
 * Purpose: Run the phase-6 verification flow against a real double door on `base1`.
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

  const master = runtime.entities[TEAM_DOOR_MASTER_INDEX];
  const slave = runtime.entities[TEAM_DOOR_SLAVE_INDEX];
  runGameFrames(runtime, 0.1);
  const trigger = findDoorTrigger(runtime, master);
  if (!trigger) {
    throw new Error(`Aucun trigger de porte trouve pour ${getRuntimeEntityLabel(master)}`);
  }

  const player = createVerificationPlayer(runtime, computeBoundsCenter(trigger));
  const initialMasterOrigin: [number, number, number] = [...master.origin];
  const initialSlaveOrigin: [number, number, number] = [...slave.origin];

  runGameFrames(runtime, 2.0, () => {
    player.origin = computeBoundsCenter(trigger);
    touchTriggerEntities(runtime, player);
  });

  console.log(`Verification phase 6 - ${MAP_PATH}`);
  console.log(`master: ${getRuntimeEntityLabel(master)}`);
  console.log(`slave: ${getRuntimeEntityLabel(slave)}`);
  console.log(`team link: master->teamchain = ${master.teamchain?.index ?? "null"}, slave->teammaster = ${slave.teammaster?.index ?? "null"}`);
  console.log(`team flags: master=${Boolean(master.flags & FL_TEAMSLAVE)}, slave=${Boolean(slave.flags & FL_TEAMSLAVE)}`);
  console.log(`master origin: ${initialMasterOrigin.join(", ")} -> ${master.origin.join(", ")}`);
  console.log(`slave origin: ${initialSlaveOrigin.join(", ")} -> ${slave.origin.join(", ")}`);
  console.log(`brush bounds: ${formatBrushBounds(runtime, BRUSH_ENTITY_INDICES)}`);
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
 * Purpose: Find the helper trigger spawned for one touch-open door team.
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

/**
 * Category: New
 * Purpose: Summarize that selected BSP brush entities kept their inline-model bounds after spawn.
 */
function formatBrushBounds(runtime: GameRuntime, entityIndices: number[]): string {
  return entityIndices.map((index) => {
    const entity = runtime.entities[index];
    const size = entity.size.join("/");
    return `#${index}:${entity.model ?? "?"}:${size}`;
  }).join(" | ");
}

/**
 * Category: New
 * Purpose: Format one runtime log entry for console verification output.
 */
function formatLogEntry(entry: GameRuntimeLogEntry): string {
  return `[t=${entry.time.toFixed(3)}] ${entry.kind} :: ${entry.message}`;
}
