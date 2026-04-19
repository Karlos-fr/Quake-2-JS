/**
 * File: quake2-door-phase2.ts
 * Purpose: Verify that a local player entity can trigger Quake II touch volumes by presence in `base1`.
 *
 * This file is not a direct source port.
 * It is a verification harness for the gameplay trigger-touch integration.
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
  findRuntimeEntitiesByTargetname,
  getRuntimeEntityLabel,
  initializeDoorPlanEntities,
  runPendingThinks,
  spawnGameEntity,
  touchTriggerEntities,
  type GameEntity,
  type GameRuntimeLogEntry
} from "../../packages/game/src/index.js";

const MAP_PATH = "maps/base1.bsp";
const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");

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

  const player = createVerificationPlayer(runtime, [128, -320, 24]);
  runPendingThinks(runtime, 0.2);
  touchTriggerEntities(runtime, player);
  runPendingThinks(runtime, 0.2);

  console.log(`Verification phase 2 - ${MAP_PATH}`);
  console.log(`player: ${getRuntimeEntityLabel(player)} @ ${player.origin.join(", ")}`);
  console.log(`targets t70: ${findRuntimeEntitiesByTargetname(runtime, "t70").map((entity) => getRuntimeEntityLabel(entity)).join(" | ")}`);
  console.log("");

  for (const entry of runtime.logEntries) {
    console.log(formatLogEntry(entry));
  }
}

/**
 * Category: New
 * Purpose: Create one local verification player using the original Quake II trigger hull dimensions.
 */
function createVerificationPlayer(runtime: ReturnType<typeof createGameRuntimeFromBspMap>, origin: [number, number, number]): GameEntity {
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

function formatLogEntry(entry: GameRuntimeLogEntry): string {
  return `[t=${entry.time.toFixed(3)}] ${entry.kind} :: ${entry.message}`;
}
