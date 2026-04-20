/**
 * File: quake2-entities-phase10-maps.ts
 * Purpose: Verify that reference-map world objects are rendered through the active client refresh pipeline without any legacy preview fallback.
 *
 * This file is not a direct source port.
 * It is a verification harness for closing phase 10 of the visible-entities plan.
 *
 * Dependencies:
 * - packages/formats
 * - packages/filesystem
 * - packages/game
 * - packages/client
 * - packages/renderer-three
 */

import fs from "node:fs";
import path from "node:path";
import { createVirtualFilesystem, mountPak } from "../../packages/filesystem/src/index.js";
import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import { parseBsp } from "../../packages/formats/src/bsp.js";
import {
  CL_BuildRefreshFrame,
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
import { createThreeRefreshEntitySync } from "../../packages/renderer-three/src/index.js";
import {
  CS_IMAGES,
  CS_MODELS,
  CS_SOUNDS,
  createEntityState,
  type entity_state_t
} from "../../packages/qcommon/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATHS = ["maps/base1.bsp", "maps/base2.bsp", "maps/base3.bsp"];

main();

/**
 * Category: New
 * Purpose: Execute the phase-10 map-driven verification over the current reference maps.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const pak = parsePak(pakBytes, pakPath);
  const filesystem = createVirtualFilesystem();
  mountPak(filesystem, pakBytes, "pak0.pak");

  for (const mapPath of MAP_PATHS) {
    verifyMap(filesystem, pak, mapPath);
  }

  console.log("Verification phase 10 maps - reference world objects use the client refresh pipeline");
}

/**
 * Category: New
 * Purpose: Verify one reference map against the active refresh-entity sync path.
 */
function verifyMap(
  filesystem: ReturnType<typeof createVirtualFilesystem>,
  pak: ReturnType<typeof parsePak>,
  mapPath: string
): void {
  const bspEntry = findPakEntry(pak, mapPath);
  if (!bspEntry) {
    throw new Error(`${mapPath} introuvable dans ${pak.sourcePath}`);
  }

  const map = parseBsp(readPakEntryData(pak, bspEntry), mapPath);
  const gameplayRuntime = createGameRuntimeFromBspMap(map);
  initializeDoorPlanEntities(gameplayRuntime);
  runGameFrames(gameplayRuntime, 2 * FRAMETIME + 0.001);

  const client = createClientRuntime();
  client.cl.frame.valid = true;
  client.cl.frame.serverframe = 1;
  syncLocalGameplayFrame(client, gameplayRuntime);

  const refreshFrame = CL_BuildRefreshFrame(client, { predictMovement: false });
  const sync = createThreeRefreshEntitySync(filesystem);
  const stats = sync.apply(client, refreshFrame);

  assertNumber(stats.skippedMissingConfigstring, 0, `${mapPath} skippedMissingConfigstring`);
  assertNumber(stats.skippedNonMd2Model, 0, `${mapPath} skippedNonMd2Model`);
  assertNumber(stats.skippedInlineOrBrushModel, 0, `${mapPath} skippedInlineOrBrushModel`);
  assertNumber(stats.missingMd2AssetCount, 0, `${mapPath} missingMd2AssetCount`);
  assertNumber(stats.skippedNoModelIndex, 0, `${mapPath} skippedNoModelIndex`);
  assertNumber(stats.renderedEntities, stats.visibleEntities, `${mapPath} renderedEntities`);
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

    copyEntityState(state, storedState);

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
 * Purpose: Assert one numeric equality with a readable label.
 */
function assertNumber(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}
