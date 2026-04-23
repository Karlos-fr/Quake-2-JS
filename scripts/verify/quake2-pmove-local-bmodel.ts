/**
 * File: quake2-pmove-local-bmodel.ts
 * Purpose: Verify that the local standalone prediction path follows moving BSP brush models through the ported `cl_pred.c` collision helpers.
 *
 * This file is not a direct source port.
 * It is a targeted integration harness for the `pmove` / `cl_pred` path on a real BSP map.
 *
 * Dependencies:
 * - packages/client
 * - packages/formats
 * - packages/game
 * - packages/qcommon
 */

import fs from "node:fs";
import path from "node:path";
import {
  buildBrushModelSnapshots,
  cloneBrushModelSnapshots,
  createClientPredictionCollisionSource,
  createClientInputContext,
  createClientMainContext,
  createClientRuntime,
  initializeLocalClientSession,
  syncLocalGameplayFrame,
  CL_InitInput,
  CL_InitLocal,
  CL_PMTrace
} from "../../packages/client/src/index.js";
import { findPrimarySpawnPoint, parseBsp } from "../../packages/formats/src/bsp.js";
import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import {
  runGameFrames,
  useGameEntity
} from "../../packages/game/src/index.js";
import {
  createCommandRuntime,
  createCvarRuntime,
  MASK_PLAYERSOLID,
  type vec3_t
} from "../../packages/qcommon/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base2.bsp";
const DOOR_INDEX = 363;

main();

/**
 * Category: New
 * Purpose: Run the local-session prediction collision verification against one moving BSP door.
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
  const spawn = findPrimarySpawnPoint(map);
  if (!spawn) {
    throw new Error(`aucun info_player_start valide dans ${MAP_PATH}`);
  }

  const runtime = createClientRuntime();
  const cmdRuntime = createCommandRuntime();
  const cvarRuntime = createCvarRuntime();
  CL_InitLocal(createClientMainContext(runtime, cmdRuntime, cvarRuntime));
  CL_InitInput(createClientInputContext(runtime, cmdRuntime, cvarRuntime));

  const session = initializeLocalClientSession(runtime, map, spawn, createLocalCollisionAdapter, {
    buildSnapshots: buildBrushModelSnapshots,
    cloneSnapshots: cloneBrushModelSnapshots
  });

  const { gameplayRuntime, gameplayPlayer } = session;
  gameplayPlayer.origin = [52, -950, 40];
  gameplayPlayer.s.origin = [...gameplayPlayer.origin];
  gameplayPlayer.s.old_origin = [...gameplayPlayer.origin];
  runGameFrames(gameplayRuntime, 0.1);
  syncLocalGameplayFrame(runtime, gameplayRuntime);

  const door = gameplayRuntime.entities[DOOR_INDEX];
  const start: vec3_t = [52, -820, 40];
  const end: vec3_t = [52, -780, 40];
  const mins: vec3_t = [0, 0, 0];
  const maxs: vec3_t = [0, 0, 0];
  const closedSource = createClientPredictionCollisionSource(runtime, gameplayRuntime.collision!.world);
  const closedDoorState = closedSource.entities.find((entity) => entity.number === door.s.number);

  const closedTrace = CL_PMTrace(start, mins, maxs, end, closedSource);

  useGameEntity(gameplayRuntime, door, gameplayPlayer, gameplayPlayer);
  runGameFrames(gameplayRuntime, 2.0);
  syncLocalGameplayFrame(runtime, gameplayRuntime);

  const openSource = createClientPredictionCollisionSource(runtime, gameplayRuntime.collision!.world);
  const openDoorState = openSource.entities.find((entity) => entity.number === door.s.number);
  const openTrace = CL_PMTrace(start, mins, maxs, end, openSource);

  console.log(`Verification pmove/cl_pred local bmodel - ${MAP_PATH}`);
  console.log(`spawn origin: ${spawn.origin.join(", ")} @ ${spawn.angle}`);
  console.log(`player origin: ${gameplayPlayer.origin.join(", ")}`);
  console.log(`door origin: ${door.origin.join(", ")}`);
  console.log(`closed snapshot door origin: ${closedDoorState?.origin.join(", ") ?? "absent"}`);
  console.log(`open snapshot door origin: ${openDoorState?.origin.join(", ") ?? "absent"}`);
  console.log(`closed trace fraction: ${closedTrace.fraction.toFixed(4)}`);
  console.log(`open trace fraction: ${openTrace.fraction.toFixed(4)}`);

  assertBoolean(Boolean(closedDoorState), true, "closed door is present in client prediction snapshot");
  assertBoolean(Boolean(openDoorState), true, "open door is present in client prediction snapshot");
  assertBoolean(closedTrace.startsolid, true, "closed door blocks local prediction trace");
  assertBoolean(openTrace.fraction === 1 && !openTrace.startsolid, true, "open door frees local prediction trace");
  console.log("Verification pmove/cl_pred local bmodel: OK");
}

/**
 * Category: New
 * Purpose: Build the local collision adapter required by the standalone local-session bootstrap.
 */
function createLocalCollisionAdapter(gameplayRuntime: NonNullable<ReturnType<typeof initializeLocalClientSession<unknown>>["gameplayRuntime"]>, gameplayPlayer: typeof gameplayRuntime.entities[number]) {
  return {
    trace: (start: vec3_t, mins: vec3_t, maxs: vec3_t, end: vec3_t) => {
      if (!gameplayRuntime.collision) {
        throw new Error("createLocalCollisionAdapter requires gameplay collision bridge");
      }

      return gameplayRuntime.collision.trace(start, mins, maxs, end, gameplayPlayer, MASK_PLAYERSOLID);
    },
    pointcontents: (point: vec3_t) => {
      if (!gameplayRuntime.collision) {
        throw new Error("createLocalCollisionAdapter requires gameplay collision bridge");
      }

      return gameplayRuntime.collision.pointcontents(point, gameplayPlayer);
    }
  };
}

/**
 * Category: New
 * Purpose: Assert one boolean equality in the integration harness.
 */
function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
}
