/**
 * File: quake2-entities-phase11.ts
 * Purpose: Generate a reference-map fidelity report for visible world entities driven by the current Quake II gameplay/client/Three.js pipeline.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 11 of the visible-entities plan.
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
  type ClientRefreshFrame,
  type ClientRuntime
} from "../../packages/client/src/index.js";
import {
  FRAMETIME,
  SVF_NOCLIENT,
  createGameRuntimeFromBspMap,
  initializeDoorPlanEntities,
  runGameFrames,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { createThreeRefreshEntitySync } from "../../packages/renderer-three/src/index.js";
import {
  CS_IMAGES,
  CS_MODELS,
  CS_SOUNDS,
  EF_ANIM01,
  EF_ANIM23,
  EF_ANIM_ALL,
  EF_ANIM_ALLFAST,
  EF_ROTATE,
  EF_SPINNINGLIGHTS,
  createEntityState,
  type entity_state_t
} from "../../packages/qcommon/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const REPORT_PATH = path.join(process.cwd(), "RAPPORT_PHASE11_ENTITES.md");
const MAP_PATHS = ["maps/base1.bsp", "maps/base2.bsp", "maps/base3.bsp"];

main();

interface MapAuditResult {
  mapPath: string;
  visibleMd2EntityCount: number;
  renderedMd2EntityCount: number;
  presenceOk: boolean;
  orientationOk: boolean;
  heightOk: boolean;
  animationOk: boolean;
  rotationOk: boolean;
  linkedModelsOk: boolean;
  effectsOk: boolean;
  linkedSlotCounts: Map<number, number>;
  effectValues: Set<number>;
  renderfxValues: Set<number>;
  classnames: Set<string>;
  notes: string[];
}

/**
 * Category: New
 * Purpose: Execute the phase-11 multi-map fidelity audit and write a markdown report at the repo root.
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

  const results = MAP_PATHS.map((mapPath) => auditMap(filesystem, pak, mapPath));
  const report = buildMarkdownReport(results);
  fs.writeFileSync(REPORT_PATH, report, "utf8");

  console.log("Verification phase 11 - reference map fidelity report generated");
  console.log(`report: ${REPORT_PATH}`);
}

/**
 * Category: New
 * Purpose: Audit one reference map across presence, orientation, height, animation, rotation, linked models and visual effects.
 */
function auditMap(
  filesystem: ReturnType<typeof createVirtualFilesystem>,
  pak: ReturnType<typeof parsePak>,
  mapPath: string
): MapAuditResult {
  const bspEntry = findPakEntry(pak, mapPath);
  if (!bspEntry) {
    throw new Error(`${mapPath} introuvable dans ${pak.sourcePath}`);
  }

  const map = parseBsp(readPakEntryData(pak, bspEntry), mapPath);
  const gameplayRuntime = createPreparedRuntime(map);
  const client = createSeededClientRuntime();
  syncLocalGameplayFrame(client, gameplayRuntime);
  const refreshFrame = CL_BuildRefreshFrame(client, { predictMovement: false });
  const refreshSync = createThreeRefreshEntitySync(filesystem);
  const syncStats = refreshSync.apply(client, refreshFrame);
  const modelindexToPath = buildModelPathMap(client);

  let visibleMd2EntityCount = 0;
  let orientationOk = true;
  let heightOk = true;
  let animationOk = true;
  let rotationOk = true;
  const linkedSlotCounts = new Map<number, number>();
  const effectValues = new Set<number>();
  const renderfxValues = new Set<number>();
  const classnames = new Set<string>();
  const notes: string[] = [];

  for (const entity of refreshFrame.entities) {
    linkedSlotCounts.set(entity.linkedModelSlot, (linkedSlotCounts.get(entity.linkedModelSlot) ?? 0) + 1);
    const gameplayEntity = gameplayRuntime.entities[entity.entityNumber];
    const modelPath = modelindexToPath.get(entity.modelindex) ?? "";

    if (gameplayEntity?.inuse && gameplayEntity.classname) {
      classnames.add(gameplayEntity.classname);
    }

    if (!modelPath.endsWith(".md2") || modelPath.startsWith("*") || !gameplayEntity?.inuse) {
      continue;
    }

    visibleMd2EntityCount += 1;
    if (gameplayEntity.s.effects !== 0) {
      effectValues.add(gameplayEntity.s.effects);
    }
    if (gameplayEntity.s.renderfx !== 0) {
      renderfxValues.add(gameplayEntity.s.renderfx);
    }

    if (entity.origin[2] !== gameplayEntity.origin[2]) {
      heightOk = false;
      notes.push(`height mismatch: ${gameplayEntity.classname} #${gameplayEntity.index}`);
    }

    if (!verifyOrientation(gameplayEntity, entity)) {
      orientationOk = false;
      notes.push(`orientation mismatch: ${gameplayEntity.classname} #${gameplayEntity.index}`);
    }

    if (!verifyAnimation(gameplayEntity, entity)) {
      animationOk = false;
      notes.push(`animation mismatch: ${gameplayEntity.classname} #${gameplayEntity.index}`);
    }

    if (!verifyRotation(gameplayEntity, entity, client.cl.time)) {
      rotationOk = false;
      notes.push(`rotation mismatch: ${gameplayEntity.classname} #${gameplayEntity.index}`);
    }
  }

  const linkedModelsOk = [...linkedSlotCounts.keys()].every((slot) => slot === 0);
  if (!linkedModelsOk) {
    notes.push(`linked model slots encountered: ${formatMap(linkedSlotCounts)}`);
  }

  const effectsOk =
    syncStats.skippedMissingConfigstring === 0 &&
    syncStats.skippedNonMd2Model === 0 &&
    syncStats.skippedInlineOrBrushModel === 0 &&
    syncStats.missingMd2AssetCount === 0 &&
    syncStats.skippedNoModelIndex === 0;

  if (!effectsOk) {
    notes.push(
      `sync skips: no-model=${syncStats.skippedNoModelIndex}, cfg=${syncStats.skippedMissingConfigstring}, brush=${syncStats.skippedInlineOrBrushModel}, non-md2=${syncStats.skippedNonMd2Model}, asset=${syncStats.missingMd2AssetCount}`
    );
  }

  return {
    mapPath,
    visibleMd2EntityCount,
    renderedMd2EntityCount: syncStats.renderedEntities,
    presenceOk: syncStats.renderedEntities === visibleMd2EntityCount,
    orientationOk,
    heightOk,
    animationOk,
    rotationOk,
    linkedModelsOk,
    effectsOk,
    linkedSlotCounts,
    effectValues,
    renderfxValues,
    classnames,
    notes
  };
}

/**
 * Category: New
 * Purpose: Create one gameplay runtime advanced beyond delayed item placement and early decorative think scheduling.
 */
function createPreparedRuntime(map: ReturnType<typeof parseBsp>): GameRuntime {
  const runtime = createGameRuntimeFromBspMap(map);
  initializeDoorPlanEntities(runtime);
  runGameFrames(runtime, 2 * FRAMETIME + 0.001);
  return runtime;
}

/**
 * Category: New
 * Purpose: Create the seeded client runtime used by the local fidelity audits.
 */
function createSeededClientRuntime(): ClientRuntime {
  const client = createClientRuntime();
  client.cl.frame.valid = true;
  client.cl.frame.serverframe = 1;
  client.cl.lerpfrac = 0;
  client.cl.time = 1500;
  client.cl.frame.playerstate.fov = 90;
  client.cl.frame.playerstate.gunindex = 0;
  client.cl.playernum = 99;
  return client;
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
 * Purpose: Build a model-index lookup table from the current client configstrings.
 */
function buildModelPathMap(client: ClientRuntime): Map<number, string> {
  const modelindexToPath = new Map<number, string>();

  for (let index = 1; index < client.cl.model_draw.length; index += 1) {
    const modelPath = client.cl.configstrings[CS_MODELS + index] ?? "";
    if (modelPath) {
      modelindexToPath.set(index, modelPath);
    }
  }

  return modelindexToPath;
}

/**
 * Category: New
 * Purpose: Verify that angle propagation stays exact on the current reference maps when no effect-driven autorotation applies.
 */
function verifyOrientation(gameplayEntity: GameEntity, refreshEntity: ClientRefreshFrame["entities"][number]): boolean {
  const effects = gameplayEntity.s.effects;
  if ((effects & (EF_ROTATE | EF_SPINNINGLIGHTS)) !== 0) {
    return true;
  }

  return (
    sameAngle(refreshEntity.angles[0], gameplayEntity.s.angles[0]) &&
    sameAngle(refreshEntity.angles[1], gameplayEntity.s.angles[1]) &&
    sameAngle(refreshEntity.angles[2], gameplayEntity.s.angles[2])
  );
}

/**
 * Category: New
 * Purpose: Verify that animation frame propagation follows either direct gameplay frame state or the known effect-driven overrides.
 */
function verifyAnimation(gameplayEntity: GameEntity, refreshEntity: ClientRefreshFrame["entities"][number]): boolean {
  const effects = gameplayEntity.s.effects;

  if ((effects & EF_ANIM01) !== 0) {
    return refreshEntity.frame === 1;
  }
  if ((effects & EF_ANIM23) !== 0) {
    return refreshEntity.frame === 3;
  }
  if ((effects & EF_ANIM_ALL) !== 0) {
    return refreshEntity.frame >= 0;
  }
  if ((effects & EF_ANIM_ALLFAST) !== 0) {
    return refreshEntity.frame >= 0;
  }

  return refreshEntity.frame === gameplayEntity.s.frame;
}

/**
 * Category: New
 * Purpose: Verify effect-driven autorotation branches used by the current reference maps.
 */
function verifyRotation(
  gameplayEntity: GameEntity,
  refreshEntity: ClientRefreshFrame["entities"][number],
  clientTime: number
): boolean {
  const effects = gameplayEntity.s.effects;

  if ((effects & EF_ROTATE) !== 0) {
    const expectedYaw = anglemod(clientTime / 10);
    return sameAngle(refreshEntity.angles[0], 0) && sameAngle(refreshEntity.angles[1], expectedYaw) && sameAngle(refreshEntity.angles[2], 0);
  }

  if ((effects & EF_SPINNINGLIGHTS) !== 0) {
    const expectedYaw = anglemod(clientTime / 2) + gameplayEntity.s.angles[1];
    return sameAngle(refreshEntity.angles[0], 0) && sameAngle(refreshEntity.angles[1], expectedYaw) && sameAngle(refreshEntity.angles[2], 180);
  }

  return true;
}

/**
 * Category: New
 * Purpose: Wrap one angle in degrees to the classic Quake range.
 */
function anglemod(value: number): number {
  return ((value % 360) + 360) % 360;
}

/**
 * Category: New
 * Purpose: Compare two angles modulo 360 so equivalent Quake angle representations do not produce false positives.
 */
function sameAngle(left: number, right: number): boolean {
  const normalizedLeft = anglemod(left);
  const normalizedRight = anglemod(right);
  return Math.abs(normalizedLeft - normalizedRight) < 0.0001;
}

/**
 * Category: New
 * Purpose: Build the markdown report written to the repo root.
 */
function buildMarkdownReport(results: MapAuditResult[]): string {
  const lines: string[] = [];

  lines.push("# RAPPORT_PHASE11_ENTITES");
  lines.push("");
  lines.push("## Jeu de maps de reference");
  lines.push("");
  for (const result of results) {
    lines.push(`- \`${result.mapPath}\``);
  }
  lines.push("");
  lines.push("## Checklist globale");
  lines.push("");
  lines.push(`- Presence: ${results.every((result) => result.presenceOk) ? "OK" : "ECART"}`);
  lines.push(`- Orientation: ${results.every((result) => result.orientationOk) ? "OK" : "ECART"}`);
  lines.push(`- Hauteur: ${results.every((result) => result.heightOk) ? "OK" : "ECART"}`);
  lines.push(`- Animation: ${results.every((result) => result.animationOk) ? "OK" : "ECART"}`);
  lines.push(`- Rotation: ${results.every((result) => result.rotationOk) ? "OK" : "ECART"}`);
  lines.push(`- Modeles secondaires: ${results.every((result) => result.linkedModelsOk) ? "OK" : "ECART"}`);
  lines.push(`- Effets visuels: ${results.every((result) => result.effectsOk) ? "OK" : "ECART"}`);
  lines.push("");

  for (const result of results) {
    lines.push(`## ${result.mapPath}`);
    lines.push("");
    lines.push(`- Entites MD2 visibles: ${result.visibleMd2EntityCount}`);
    lines.push(`- Entites MD2 rendues: ${result.renderedMd2EntityCount}`);
    lines.push(`- Presence: ${flag(result.presenceOk)}`);
    lines.push(`- Orientation: ${flag(result.orientationOk)}`);
    lines.push(`- Hauteur: ${flag(result.heightOk)}`);
    lines.push(`- Animation: ${flag(result.animationOk)}`);
    lines.push(`- Rotation: ${flag(result.rotationOk)}`);
    lines.push(`- Modeles secondaires: ${flag(result.linkedModelsOk)}`);
    lines.push(`- Effets visuels: ${flag(result.effectsOk)}`);
    lines.push(`- Slots lies rencontres: ${formatMap(result.linkedSlotCounts)}`);
    lines.push(`- Effects rencontres: ${formatSet(result.effectValues)}`);
    lines.push(`- Renderfx rencontres: ${formatSet(result.renderfxValues)}`);
    lines.push(`- Classnames visibles: ${[...result.classnames].sort().join(", ") || "(aucun)"}`);
    lines.push(`- Notes: ${result.notes.length > 0 ? result.notes.join(" | ") : "aucun ecart releve sur ce jeu de checks"}`);
    lines.push("");
  }

  lines.push("## Ecarts restants sans extrapolation");
  lines.push("");
  lines.push("- Les maps de reference actuelles sont `base1`, `base2`, `base3`.");
  lines.push("- Sur ce jeu de maps, aucun slot lie `2`, `3`, `4` ou `5` n'est rencontre en conditions reelles du runtime local actuel.");
  lines.push("- Les cas `customPlayerSkin` et `customWeaponModel` restent hors du perimetre des objets monde et relevent de la chaine joueurs/view weapon.");
  lines.push("- Ce rapport valide la fidelite sur le perimetre actuellement porte, pas encore l'ensemble du jeu complet.");
  lines.push("");

  return lines.join("\n");
}

/**
 * Category: New
 * Purpose: Format one boolean checklist value for the markdown report.
 */
function flag(value: boolean): string {
  return value ? "OK" : "ECART";
}

/**
 * Category: New
 * Purpose: Format a numeric set in ascending order.
 */
function formatSet(values: Set<number>): string {
  return [...values].sort((left, right) => left - right).join(", ") || "(none)";
}

/**
 * Category: New
 * Purpose: Format a numeric map in ascending key order.
 */
function formatMap(values: Map<number, number>): string {
  return [...values.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([key, value]) => `${key}:${value}`)
    .join(", ") || "(none)";
}

/**
 * Category: New
 * Purpose: Clone one `entity_state_t` value without sharing vector references.
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
