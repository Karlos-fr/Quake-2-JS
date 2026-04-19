/**
 * File: quake2-collision-phase2.ts
 * Purpose: Verify runtime spatial fields and absolute bounds refresh for gameplay entities.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 2 of the collision plan.
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
  refreshEntitySpatialState,
  spawnGameEntity,
  type GameEntity
} from "../../packages/game/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base1.bsp";
const DOOR_MODEL = "*32";

main();

/**
 * Category: New
 * Purpose: Run the phase-2 spatial runtime verification.
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
  const door = requireEntityByModel(runtime.entities, DOOR_MODEL);
  const player = spawnGameEntity(runtime);

  player.classname = "player";
  player.origin = [128, 256, 64];
  player.mins = [-16, -16, -24];
  player.maxs = [16, 16, 32];
  refreshEntitySpatialState(player);

  console.log(`Verification collision phase 2 - ${MAP_PATH}`);
  console.log(`door headnode: ${door.headnode}`);
  console.log(`door absmin: ${formatVec3(door.absmin)}`);
  console.log(`door absmax: ${formatVec3(door.absmax)}`);
  console.log(`player size: ${formatVec3(player.size)}`);
  console.log(`player absmin: ${formatVec3(player.absmin)}`);
  console.log(`player absmax: ${formatVec3(player.absmax)}`);

  assertBoolean(door.headnode !== 0, true, "door headnode");
  assertBoolean(door.absmin[0] !== door.absmax[0] || door.absmin[1] !== door.absmax[1] || door.absmin[2] !== door.absmax[2], true, "door abs bounds");
  assertVecEqual(player.size, [32, 32, 56], "player size");
  assertVecEqual(player.absmin, [112, 240, 40], "player absmin");
  assertVecEqual(player.absmax, [144, 272, 96], "player absmax");
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
 * Purpose: Assert one boolean equality in verification output.
 */
function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
}

/**
 * Category: New
 * Purpose: Assert one exact vector equality.
 */
function assertVecEqual(actual: [number, number, number], expected: [number, number, number], label: string): void {
  for (let index = 0; index < 3; index += 1) {
    if (actual[index] !== expected[index]) {
      throw new Error(`${label}[${index}]: attendu ${expected[index]}, obtenu ${actual[index]}`);
    }
  }
}

/**
 * Category: New
 * Purpose: Format one vector for console output.
 */
function formatVec3(vector: [number, number, number]): string {
  return `${vector[0].toFixed(3)},${vector[1].toFixed(3)},${vector[2].toFixed(3)}`;
}
