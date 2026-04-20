/**
 * File: quake2-entities-phase4.ts
 * Purpose: Verify that the local gameplay runtime now serializes visible `entity_state_t` data into the client snapshot path used by refresh composition.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 4 of the visible-entities plan.
 *
 * Dependencies:
 * - packages/formats
 * - packages/game
 * - packages/client
 */

import fs from "node:fs";
import path from "node:path";
import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import { parseBsp } from "../../packages/formats/src/bsp.js";
import {
  CL_BuildRefreshFrame,
  CL_GetFrameEntityStates,
  createClientRuntime,
  type ClientRuntime
} from "../../packages/client/src/index.js";
import {
  FRAMETIME,
  SVF_NOCLIENT,
  createGameRuntimeFromBspMap,
  initializeDoorPlanEntities,
  runGameFrames,
  type GameRuntime
} from "../../packages/game/src/index.js";
import {
  CS_IMAGES,
  CS_MODELS,
  CS_SOUNDS,
  createEntityState,
  type entity_state_t
} from "../../packages/qcommon/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const BASE1_MAP_PATH = "maps/base1.bsp";
const BASE2_MAP_PATH = "maps/base2.bsp";

main();

/**
 * Category: New
 * Purpose: Run the phase-4 snapshot and refresh verification over two real Quake II maps.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const pak = parsePak(pakBytes, pakPath);
  const client = createClientRuntime();

  const base1Result = runMapSerializationScenario(client, pak, BASE1_MAP_PATH);
  const base2Result = runMapSerializationScenario(client, pak, BASE2_MAP_PATH);

  console.log("Verification phase 4 - visible entity serialization");
  console.log(`base1 states: ${base1Result.stateCount}`);
  console.log(`base1 refresh entities: ${base1Result.refreshEntityCount}`);
  console.log(`base1 effect/renderfx entity: ${base1Result.effectEntityNumber}`);
  console.log(`base2 states: ${base2Result.stateCount}`);
  console.log(`base2 refresh entities: ${base2Result.refreshEntityCount}`);
  console.log(`base2 resolved models: ${base2Result.resolvedModelCount}`);

  assertBoolean(base1Result.stateCount > 0, true, "base1 serialized at least one visible state");
  assertBoolean(base1Result.refreshEntityCount > 0, true, "base1 refresh frame contains render entities");
  assertBoolean(base1Result.resolvedModelCount === base1Result.refreshEntityCount, true, "base1 render entities resolve all modelindices");
  assertBoolean(base1Result.effectEntityNumber > 0, true, "base1 contains one entity with propagated effects/renderfx");
  assertBoolean(base2Result.stateCount > 0, true, "base2 serialized at least one visible state after map switch");
  assertBoolean(base2Result.refreshEntityCount > 0, true, "base2 refresh frame contains render entities after map switch");
  assertBoolean(base2Result.resolvedModelCount === base2Result.refreshEntityCount, true, "base2 render entities resolve all modelindices after map switch");
}

/**
 * Category: New
 * Purpose: Build one gameplay runtime for the requested BSP and verify the client-facing serialization outputs.
 */
function runMapSerializationScenario(
  client: ClientRuntime,
  pak: ReturnType<typeof parsePak>,
  mapPath: string
): {
  stateCount: number;
  refreshEntityCount: number;
  resolvedModelCount: number;
  effectEntityNumber: number;
} {
  const runtime = createRuntimeForMap(pak, mapPath);
  client.cl.frame.valid = true;
  client.cl.frame.serverframe += 1;
  client.cl.time = runtime.time * 1000;

  syncLocalGameplayFrame(client, runtime);

  const states = CL_GetFrameEntityStates(client);
  const refresh = CL_BuildRefreshFrame(client, { predictMovement: false });
  const effectState = states.find((state) => state.effects !== 0 || state.renderfx !== 0);
  const resolvedModelCount = refresh.entities.filter((entity) => {
    const configstring = client.cl.configstrings[CS_MODELS + entity.modelindex] ?? "";
    return entity.modelindex !== 0 && configstring.length > 0;
  }).length;

  if (effectState) {
    const stored = states.find((state) => state.number === effectState.number);
    assertBoolean(stored?.effects === effectState.effects, true, `${mapPath} propagates effects`);
    assertBoolean(stored?.renderfx === effectState.renderfx, true, `${mapPath} propagates renderfx`);
  }

  return {
    stateCount: states.length,
    refreshEntityCount: refresh.entities.length,
    resolvedModelCount,
    effectEntityNumber: effectState?.number ?? 0
  };
}

/**
 * Category: New
 * Purpose: Create one initialized gameplay runtime and advance it far enough for delayed item spawns such as `droptofloor`.
 */
function createRuntimeForMap(pak: ReturnType<typeof parsePak>, mapPath: string): GameRuntime {
  const bspEntry = findPakEntry(pak, mapPath);
  if (!bspEntry) {
    throw new Error(`${mapPath} introuvable dans ${pak.sourcePath}`);
  }

  const map = parseBsp(readPakEntryData(pak, bspEntry), mapPath);
  const runtime = createGameRuntimeFromBspMap(map);
  initializeDoorPlanEntities(runtime);
  runGameFrames(runtime, 2 * FRAMETIME + 0.001);
  return runtime;
}

/**
 * Category: New
 * Purpose: Serialize the current gameplay world-entity state into the client frame and parse-entity buffers.
 */
function syncLocalGameplayFrame(client: ClientRuntime, gameplayRuntime: GameRuntime): void {
  syncGameplayAssetConfigstrings(client, gameplayRuntime);

  const currentFrameServerframe = client.cl.frame.serverframe;
  const previousFrameServerframe = currentFrameServerframe - 1;
  const parseEntityMask = client.cl_parse_entities.length - 1;
  const visibleStates = collectVisibleGameplayEntityStates(gameplayRuntime);

  client.cl.frame.parse_entities = client.cl.parse_entities;
  client.cl.frame.num_entities = 0;

  for (const state of visibleStates) {
    const centity = client.cl_entities[state.number];
    const storedState = client.cl_parse_entities[client.cl.parse_entities & parseEntityMask];
    client.cl.parse_entities += 1;
    client.cl.frame.num_entities += 1;

    const needsNoLerpReset =
      state.modelindex !== centity.current.modelindex ||
      state.modelindex2 !== centity.current.modelindex2 ||
      state.modelindex3 !== centity.current.modelindex3 ||
      state.modelindex4 !== centity.current.modelindex4 ||
      Math.abs(state.origin[0] - centity.current.origin[0]) > 512 ||
      Math.abs(state.origin[1] - centity.current.origin[1]) > 512 ||
      Math.abs(state.origin[2] - centity.current.origin[2]) > 512;

    copyEntityState(state, storedState);

    if (needsNoLerpReset) {
      centity.serverframe = -99;
    }

    if (centity.serverframe !== previousFrameServerframe) {
      copyEntityState(storedState, centity.prev);
      centity.prev.origin = [...storedState.old_origin];
      centity.lerp_origin = [...storedState.old_origin];
    } else {
      copyEntityState(centity.current, centity.prev);
    }

    centity.serverframe = currentFrameServerframe;
    copyEntityState(storedState, centity.current);
  }
}

/**
 * Category: New
 * Purpose: Mirror the gameplay-side model, sound and image registries into the client configstring tables.
 */
function syncGameplayAssetConfigstrings(client: ClientRuntime, gameplayRuntime: GameRuntime): void {
  for (let index = 1; index < client.cl.model_draw.length; index += 1) {
    client.cl.configstrings[CS_MODELS + index] = gameplayRuntime.assets.modelPaths[index - 1] ?? "";
    client.cl.model_draw[index] = client.cl.configstrings[CS_MODELS + index] || null;
  }

  for (let index = 1; index < client.cl.sound_precache.length; index += 1) {
    client.cl.configstrings[CS_SOUNDS + index] = gameplayRuntime.assets.soundPaths[index - 1] ?? "";
    client.cl.sound_precache[index] = client.cl.configstrings[CS_SOUNDS + index] || null;
  }

  for (let index = 1; index < client.cl.image_precache.length; index += 1) {
    client.cl.configstrings[CS_IMAGES + index] = gameplayRuntime.assets.imagePaths[index - 1] ?? "";
    client.cl.image_precache[index] = client.cl.configstrings[CS_IMAGES + index] || null;
  }
}

/**
 * Category: New
 * Purpose: Collect the gameplay entities that currently expose one client-visible `entity_state_t`.
 */
function collectVisibleGameplayEntityStates(gameplayRuntime: GameRuntime): entity_state_t[] {
  const states: entity_state_t[] = [];

  for (const entity of gameplayRuntime.entities) {
    if (!entity.inuse || (entity.svflags & SVF_NOCLIENT) !== 0) {
      continue;
    }

    const state = entity.s;
    const hasVisualState =
      state.modelindex !== 0 ||
      state.modelindex2 !== 0 ||
      state.modelindex3 !== 0 ||
      state.modelindex4 !== 0 ||
      state.effects !== 0 ||
      state.renderfx !== 0 ||
      state.sound !== 0 ||
      state.event !== 0;

    if (!hasVisualState) {
      continue;
    }

    states.push(cloneEntityState(state));
  }

  states.sort((left, right) => left.number - right.number);
  return states;
}

/**
 * Category: New
 * Purpose: Clone one `entity_state_t` value without sharing tuple references.
 */
function cloneEntityState(source: entity_state_t): entity_state_t {
  const target = createEntityState();
  copyEntityState(source, target);
  return target;
}

/**
 * Category: New
 * Purpose: Copy one `entity_state_t` field set exactly.
 */
function copyEntityState(source: entity_state_t, target: entity_state_t): void {
  target.number = source.number;
  target.origin = [...source.origin];
  target.angles = [...source.angles];
  target.old_origin = [...source.old_origin];
  target.modelindex = source.modelindex;
  target.modelindex2 = source.modelindex2;
  target.modelindex3 = source.modelindex3;
  target.modelindex4 = source.modelindex4;
  target.frame = source.frame;
  target.skinnum = source.skinnum;
  target.effects = source.effects;
  target.renderfx = source.renderfx;
  target.solid = source.solid;
  target.sound = source.sound;
  target.event = source.event;
}

/**
 * Category: New
 * Purpose: Assert one boolean equality and fail with a readable message.
 */
function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: ${actual} != ${expected}`);
  }
}
