/**
 * File: quake2-door-phase7.ts
 * Purpose: Verify that gameplay-owned BSP inline models synchronize into the Three.js scene graph.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 7 of the door plan.
 *
 * Dependencies:
 * - packages/formats
 * - packages/game
 * - packages/renderer-common
 * - packages/renderer-three
 * - three
 */

import fs from "node:fs";
import path from "node:path";
import { Group, type Object3D } from "three";
import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import { parseBsp } from "../../packages/formats/src/bsp.js";
import {
  createGameRuntimeFromBspMap,
  initializeDoorPlanEntities,
  runGameFrames,
  spawnGameEntity,
  touchTriggerEntities,
  useGameEntity,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { buildBspSurfaces } from "../../packages/renderer-common/src/index.js";
import { buildThreeBspGroup, createThreeBrushModelSync } from "../../packages/renderer-three/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base2.bsp";
const LINEAR_DOOR_INDEX = 363;
const ROTATING_DOOR_INDEX = 473;

main();

/**
 * Category: New
 * Purpose: Run the phase-7 render-sync verification against one translating and one rotating brush model.
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

  const linearRuntime = createRuntime(map);
  const linearDoor = linearRuntime.entities[LINEAR_DOOR_INDEX];
  const linearTrigger = findDoorTrigger(linearRuntime, linearDoor);
  if (!linearTrigger) {
    throw new Error("Trigger de porte lineaire introuvable");
  }

  const linearPlayer = createVerificationPlayer(linearRuntime, computeBoundsCenter(linearTrigger));
  runGameFrames(linearRuntime, 2.0, () => {
    linearPlayer.origin = computeBoundsCenter(linearTrigger);
    touchTriggerEntities(linearRuntime, linearPlayer);
  });
  const linearGroupRoot = createSceneGroup(map);
  createThreeBrushModelSync(linearGroupRoot).apply(buildBrushSnapshots(linearRuntime));

  const rotatingRuntime = createRuntime(map);
  const rotatingDoor = rotatingRuntime.entities[ROTATING_DOOR_INDEX];
  const rotatingPlayer = createVerificationPlayer(rotatingRuntime, [...rotatingDoor.origin]);
  useGameEntity(rotatingRuntime, rotatingDoor, rotatingPlayer, rotatingPlayer);
  runGameFrames(rotatingRuntime, 1.5);
  const rotatingGroupRoot = createSceneGroup(map);
  createThreeBrushModelSync(rotatingGroupRoot).apply(buildBrushSnapshots(rotatingRuntime));

  const linearGroup = requireModelGroup(linearGroupRoot, 27);
  const rotatingGroup = requireModelGroup(rotatingGroupRoot, 40);

  console.log(`Verification phase 7 - ${MAP_PATH}`);
  console.log(`linear group position: ${formatVec3(linearGroup.position.toArray() as [number, number, number])}`);
  console.log(`linear door origin: ${formatVec3(linearDoor.origin)}`);
  console.log(`rotating group rotation(deg): ${formatVec3([
    rotatingGroup.rotation.x * 180 / Math.PI,
    rotatingGroup.rotation.y * 180 / Math.PI,
    rotatingGroup.rotation.z * 180 / Math.PI
  ])}`);
  console.log(`rotating door angles: ${formatVec3(rotatingDoor.angles)}`);
}

/**
 * Category: New
 * Purpose: Build one Three.js BSP root configured like the browser scene for the current map.
 */
function createSceneGroup(map: ReturnType<typeof parseBsp>): Group {
  const surfaces = buildBspSurfaces(map);
  return buildThreeBspGroup(surfaces, {
    resolveModelOrigin: (modelIndex) => getInlineModelRenderOrigin(map, modelIndex)
  });
}

/**
 * Category: New
 * Purpose: Create one gameplay runtime for the current map and initialize the ported brush entities.
 */
function createRuntime(map: ReturnType<typeof parseBsp>): GameRuntime {
  const runtime = createGameRuntimeFromBspMap(map);
  initializeDoorPlanEntities(runtime);
  runGameFrames(runtime, 0.1);
  return runtime;
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
 * Purpose: Extract the current inline brush model transforms from one gameplay runtime.
 */
function buildBrushSnapshots(runtime: GameRuntime): Array<{ model: string | undefined; origin: [number, number, number]; angles: [number, number, number] }> {
  return runtime.entities
    .filter((entity) => entity.inuse && entity.model?.startsWith("*"))
    .map((entity) => ({
      model: entity.model,
      origin: [...entity.origin],
      angles: [...entity.angles]
    }));
}

/**
 * Category: New
 * Purpose: Resolve the compiled render origin used for one BSP inline model group.
 */
function getInlineModelRenderOrigin(map: ReturnType<typeof parseBsp>, modelIndex: number): [number, number, number] {
  if (modelIndex <= 0) {
    return [0, 0, 0];
  }

  const modelName = `*${modelIndex}`;
  const entity = map.parsedEntities.find((candidate) => candidate.properties.model === modelName);
  if (entity?.properties.origin) {
    const origin = parseEntityOrigin(entity.properties.origin);
    if (origin) {
      return origin;
    }
  }

  const model = map.models[modelIndex];
  return model ? [...model.origin] : [0, 0, 0];
}

/**
 * Category: New
 * Purpose: Parse one Quake-style entity origin string into a numeric tuple.
 */
function parseEntityOrigin(value: string): [number, number, number] | null {
  const parts = value.trim().split(/\s+/).map((part) => Number.parseFloat(part));
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  return [parts[0], parts[1], parts[2]];
}

/**
 * Category: New
 * Purpose: Require one `bsp-model:N` group from the generated Three.js BSP root.
 */
function requireModelGroup(root: Group, modelIndex: number): Group {
  const name = `bsp-model:${modelIndex}`;
  let found: Group | null = null;

  root.traverse((object) => {
    if (object instanceof Group && object.name === name) {
      found = object;
    }
  });

  if (!found) {
    throw new Error(`Groupe ${name} introuvable`);
  }

  return found;
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
 * Purpose: Format a 3D vector for compact verification output.
 */
function formatVec3(vector: [number, number, number]): string {
  return `${vector[0].toFixed(3)}, ${vector[1].toFixed(3)}, ${vector[2].toFixed(3)}`;
}
