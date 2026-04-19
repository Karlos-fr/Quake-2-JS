/**
 * File: quake2-collision-phase8.ts
 * Purpose: Verify that the web prediction collision adapter now follows moving brush models from the gameplay runtime.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 8 of the collision plan.
 *
 * Dependencies:
 * - apps/web
 * - packages/formats
 * - packages/game
 * - packages/qcommon
 */

import fs from "node:fs";
import path from "node:path";
import { createLocalCollisionAdapter } from "../../apps/web/src/local-client-controller.js";
import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import { parseBsp } from "../../packages/formats/src/bsp.js";
import {
  createGameRuntimeFromBspMap,
  initializeDoorPlanEntities,
  linkGameEntity,
  refreshEntitySpatialState,
  runGameFrames,
  spawnGameEntity,
  useGameEntity,
  type GameEntity
} from "../../packages/game/src/index.js";
import type { vec3_t } from "../../packages/qcommon/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base2.bsp";
const DOOR_INDEX = 363;

main();

/**
 * Category: New
 * Purpose: Run the phase-8 browser collision adapter verification against one real moving door.
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
  runGameFrames(runtime, 0.1);

  const player = spawnPlayer(runtime, [52, -950, 40]);
  const collision = createLocalCollisionAdapter(runtime, player);
  const door = runtime.entities[DOOR_INDEX];
  const start: vec3_t = [52, -820, 40];
  const end: vec3_t = [52, -780, 40];
  const mins: vec3_t = [0, 0, 0];
  const maxs: vec3_t = [0, 0, 0];
  const closedTrace = collision.trace(start, mins, maxs, end);
  const closedContents = collision.pointcontents([52, -800, 40]);

  useGameEntity(runtime, door, player, player);
  runGameFrames(runtime, 2.0);

  const openTrace = collision.trace(start, mins, maxs, end);
  const openContents = collision.pointcontents([52, -800, 40]);

  console.log(`Verification collision phase 8 - ${MAP_PATH}`);
  console.log(`door origin: ${door.origin.join(", ")}`);
  console.log(`closed trace fraction: ${closedTrace.fraction.toFixed(4)}`);
  console.log(`open trace fraction: ${openTrace.fraction.toFixed(4)}`);
  console.log(`closed point contents: ${closedContents}`);
  console.log(`open point contents: ${openContents}`);

  assertBoolean(closedTrace.startsolid, true, "closed door blocks browser trace");
  assertBoolean(openTrace.fraction === 1 && !openTrace.startsolid, true, "open door frees browser trace");
  assertBoolean(closedContents !== 0, true, "closed door contributes point contents");
  assertBoolean(openContents === 0, true, "open door clears point contents");
}

/**
 * Category: New
 * Purpose: Spawn one local player-shaped actor used as the browser prediction pass entity.
 */
function spawnPlayer(runtime: Parameters<typeof createLocalCollisionAdapter>[0], origin: vec3_t): GameEntity {
  const player = spawnGameEntity(runtime);
  player.classname = "phase8_player";
  player.client = true;
  player.health = 100;
  player.movetype = 2;
  player.solid = 2;
  player.origin = [...origin];
  player.mins = [-16, -16, -24];
  player.maxs = [16, 16, 32];
  refreshEntitySpatialState(player);
  linkGameEntity(runtime, player);
  return player;
}

/**
 * Category: New
 * Purpose: Assert one boolean equality in the verification harness.
 */
function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
}
