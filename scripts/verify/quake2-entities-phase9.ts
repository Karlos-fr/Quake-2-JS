/**
 * File: quake2-entities-phase9.ts
 * Purpose: Audit real and synthetic composed-entity paths driven by `modelindex2/3/4` in the Quake II client refresh pipeline.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 9 of the visible-entities plan.
 *
 * Dependencies:
 * - packages/formats
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
  CL_GetFrameEntityStates,
  createClientRuntime,
  type ClientRefreshFrame,
  type ClientRuntime
} from "../../packages/client/src/index.js";
import { createThreeRefreshEntitySync } from "../../packages/renderer-three/src/index.js";
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
  EF_POWERSCREEN,
  RF_SHELL_GREEN,
  RF_TRANSLUCENT,
  createEntityState,
  type entity_state_t
} from "../../packages/qcommon/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATHS = ["maps/base1.bsp", "maps/base2.bsp", "maps/base3.bsp"];

main();

/**
 * Category: New
 * Purpose: Execute the phase-9 linked-model audit over reference maps and one synthetic composite case.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const pak = parsePak(pakBytes, pakPath);

  verifySyntheticLinkedModels();
  verifyThreeBridgeCompositeCase(pakBytes);
  auditReferenceMaps();
}

/**
 * Category: New
 * Purpose: Verify the client refresh frame still preserves distinct linked-model slots for one synthetic composite entity.
 */
function verifySyntheticLinkedModels(): void {
  const runtime = createSeededClientRuntime();
  runtime.cl.configstrings[CS_MODELS + 1] = "models/weapons/g_shotg/tris.md2";
  runtime.cl.configstrings[CS_MODELS + 2] = "models/items/armor/combat/tris.md2";
  runtime.cl.configstrings[CS_MODELS + 3] = "models/items/keys/pyramid/tris.md2";
  runtime.cl.configstrings[CS_MODELS + 4] = "models/items/keys/red_key/tris.md2";

  const state = createEntityState();
  state.number = 1;
  state.modelindex = 1;
  state.modelindex2 = 0x80 | 2;
  state.modelindex3 = 3;
  state.modelindex4 = 4;
  state.effects = EF_POWERSCREEN;
  runtime.cl_parse_entities[0] = cloneEntityState(state);
  copyEntityState(state, runtime.cl_entities[1].current);
  copyEntityState(state, runtime.cl_entities[1].prev);

  const refreshFrame = CL_BuildRefreshFrame(runtime, { predictMovement: false });
  const slots = refreshFrame.entities.map((entity) => entity.linkedModelSlot).join(", ");
  if (slots !== "0, 5, 2, 3, 4") {
    throw new Error(`Slots linked inattendus: ${slots}`);
  }

  const linkedModel2 = refreshFrame.entities.find((entity) => entity.linkedModelSlot === 2);
  const powerscreen = refreshFrame.entities.find((entity) => entity.linkedModelSlot === 5);
  assertNumber(linkedModel2?.modelindex ?? -1, 2, "modelindex2 strips translucency high bit");
  assertBoolean(Math.abs((linkedModel2?.alpha ?? -1) - 0.32) < 0.0001, true, "linked translucent model alpha");
  assertBoolean(((powerscreen?.flags ?? 0) & RF_TRANSLUCENT) !== 0, true, "powerscreen keeps translucent flag");
  assertBoolean(((powerscreen?.flags ?? 0) & RF_SHELL_GREEN) !== 0, true, "powerscreen keeps shell flag");
  assertBoolean(Math.abs((powerscreen?.alpha ?? -1) - 0.3) < 0.0001, true, "powerscreen alpha");
}

/**
 * Category: New
 * Purpose: Verify the active Three.js bridge instantiates all MD2-backed linked models while leaving the shell-only powerscreen layer out of the MD2 path.
 */
function verifyThreeBridgeCompositeCase(pakBytes: Uint8Array): void {
  const runtime = createSeededClientRuntime();
  runtime.cl.configstrings[CS_MODELS + 1] = "models/weapons/g_shotg/tris.md2";
  runtime.cl.configstrings[CS_MODELS + 2] = "models/items/armor/combat/tris.md2";
  runtime.cl.configstrings[CS_MODELS + 3] = "models/items/keys/pyramid/tris.md2";
  runtime.cl.configstrings[CS_MODELS + 4] = "models/items/keys/red_key/tris.md2";

  const state = createEntityState();
  state.number = 1;
  state.modelindex = 1;
  state.modelindex2 = 2;
  state.modelindex3 = 3;
  state.modelindex4 = 4;
  state.effects = EF_POWERSCREEN;
  runtime.cl_parse_entities[0] = cloneEntityState(state);
  copyEntityState(state, runtime.cl_entities[1].current);
  copyEntityState(state, runtime.cl_entities[1].prev);

  const refreshFrame = CL_BuildRefreshFrame(runtime, { predictMovement: false });
  const filesystem = createVirtualFilesystem();
  mountPak(filesystem, pakBytes, "pak0.pak");
  const sync = createThreeRefreshEntitySync(filesystem);
  const stats = sync.apply(runtime, refreshFrame);

  assertNumber(stats.visibleEntities, 5, "three bridge visible composite count");
  assertNumber(stats.renderedEntities, 4, "three bridge rendered MD2 composite count");
  assertNumber(stats.skippedNoModelIndex, 1, "three bridge shell-only composite skip count");
  assertNumber(sync.root.children.length, 4, "three bridge created MD2 instances");
}

/**
 * Category: New
 * Purpose: Print the linked-model-slot distribution actually encountered on the current reference maps.
 */
function auditReferenceMaps(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const pak = parsePak(pakBytes, pakPath);
  const client = createClientRuntime();
  const slotCounts = new Map<number, number>();

  for (const mapPath of MAP_PATHS) {
    const runtime = createRuntimeForMap(pak, mapPath);
    client.cl.frame.valid = true;
    client.cl.frame.serverframe += 1;
    syncLocalGameplayFrame(client, runtime);
    const refreshFrame = CL_BuildRefreshFrame(client, { predictMovement: false });
    accumulateSlotCounts(slotCounts, refreshFrame);
  }

  console.log("Verification phase 9 - composed entity audit");
  console.log(`maps: ${MAP_PATHS.join(", ")}`);
  console.log(`linked-model slots encountered: ${formatSlotCounts(slotCounts)}`);
}

/**
 * Category: New
 * Purpose: Create the minimal seeded client runtime required by the synthetic linked-model verification.
 */
function createSeededClientRuntime(): ClientRuntime {
  const runtime = createClientRuntime();
  runtime.cl.frame.valid = true;
  runtime.cl.frame.serverframe = 1;
  runtime.cl.frame.num_entities = 1;
  runtime.cl.frame.parse_entities = 0;
  runtime.cl.time = 0;
  runtime.cl.lerpfrac = 0;
  runtime.cl.playernum = 99;
  runtime.cl.frame.playerstate.fov = 90;
  runtime.cl.frame.playerstate.gunindex = 0;
  return runtime;
}

/**
 * Category: New
 * Purpose: Create one initialized gameplay runtime and advance it beyond delayed world-item placement.
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
 * Purpose: Count the linked-model slots emitted by one refresh frame.
 */
function accumulateSlotCounts(slotCounts: Map<number, number>, refreshFrame: ClientRefreshFrame): void {
  for (const entity of refreshFrame.entities) {
    slotCounts.set(entity.linkedModelSlot, (slotCounts.get(entity.linkedModelSlot) ?? 0) + 1);
  }
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
 * Purpose: Format the linked-model-slot counts in ascending slot order.
 */
function formatSlotCounts(slotCounts: Map<number, number>): string {
  return [...slotCounts.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([slot, count]) => `${slot}:${count}`)
    .join(", ") || "(none)";
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

/**
 * Category: New
 * Purpose: Assert one boolean condition with a readable label.
 */
function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}
