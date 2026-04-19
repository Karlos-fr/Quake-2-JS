/**
 * File: quake2-collision-phase3.ts
 * Purpose: Verify gameplay spatial linking and BoxEdicts queries for solids and triggers.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 3 of the collision plan.
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
  AREA_SOLID,
  AREA_TRIGGERS,
  BoxEdicts,
  classifyGameEntity,
  createGameRuntimeFromBspMap,
  initializeDoorPlanEntities,
  isDynamicBoxEntity,
  isInlineBspEntity,
  isRuntimeTriggerEntity,
  linkGameEntity,
  refreshEntitySpatialState,
  runGameFrames,
  SOLID_BSP,
  spawnGameEntity,
  unlinkGameEntity,
  type GameEntity
} from "../../packages/game/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base1.bsp";
const DOOR_MODEL = "*32";

main();

/**
 * Category: New
 * Purpose: Run the phase-3 spatial linking verification.
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
  runGameFrames(runtime, 0.2);

  const door = requireEntityByModel(runtime.entities, DOOR_MODEL);
  const trigger = requireEntityByClassname(runtime.entities, "door_trigger");
  const player = spawnGameEntity(runtime);
  player.classname = "player";
  player.solid = SOLID_BSP;
  player.origin = [
    trigger.absmin[0] + 8,
    trigger.absmin[1] + 8,
    trigger.absmin[2] + 8
  ];
  player.mins = [-16, -16, -24];
  player.maxs = [16, 16, 32];
  refreshEntitySpatialState(player);
  linkGameEntity(runtime, player);

  const triggerHits = BoxEdicts(runtime, player.absmin, player.absmax, AREA_TRIGGERS);
  const solidHits = BoxEdicts(runtime, door.absmin, door.absmax, AREA_SOLID);

  console.log(`Verification collision phase 3 - ${MAP_PATH}`);
  console.log(`linked solids: ${runtime.linkedSolidEntities.length}`);
  console.log(`linked triggers: ${runtime.linkedTriggerEntities.length}`);
  console.log(`linked inline bsp: ${runtime.linkedInlineBspEntities.length}`);
  console.log(`linked runtime triggers: ${runtime.linkedRuntimeTriggerEntities.length}`);
  console.log(`linked dynamic boxes: ${runtime.linkedDynamicBoxEntities.length}`);
  console.log(`trigger hits: ${triggerHits.map((entity) => `${entity.index}:${entity.classname}`).join(", ")}`);
  console.log(`solid hits: ${solidHits.map((entity) => `${entity.index}:${entity.classname}`).join(", ")}`);
  console.log(`door kind: ${classifyGameEntity(door)}`);
  console.log(`trigger kind: ${classifyGameEntity(trigger)}`);
  console.log(`player kind: ${classifyGameEntity(player)}`);

  assertBoolean(runtime.linkedSolidEntities.includes(door), true, "door linked in solids");
  assertBoolean(runtime.linkedTriggerEntities.includes(trigger), true, "trigger linked in triggers");
  assertBoolean(runtime.linkedInlineBspEntities.includes(door), true, "door linked in inline bsp");
  assertBoolean(runtime.linkedRuntimeTriggerEntities.includes(trigger), true, "trigger linked in runtime triggers");
  assertBoolean(runtime.linkedDynamicBoxEntities.includes(player), true, "player linked in dynamic boxes");
  assertBoolean(triggerHits.includes(trigger), true, "BoxEdicts trigger");
  assertBoolean(solidHits.includes(door), true, "BoxEdicts solid");
  assertBoolean(isInlineBspEntity(door), true, "door inline bsp");
  assertBoolean(isRuntimeTriggerEntity(trigger), true, "trigger runtime trigger");
  assertBoolean(isDynamicBoxEntity(player), true, "player dynamic box");

  unlinkGameEntity(runtime, trigger);
  const triggerHitsAfterUnlink = BoxEdicts(runtime, player.absmin, player.absmax, AREA_TRIGGERS);
  console.log(`trigger hits after unlink: ${triggerHitsAfterUnlink.map((entity) => `${entity.index}:${entity.classname}`).join(", ")}`);
  assertBoolean(triggerHitsAfterUnlink.includes(trigger), false, "unlink trigger");
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
 * Purpose: Find one runtime entity by classname.
 */
function requireEntityByClassname(entities: GameEntity[], classname: string): GameEntity {
  const entity = entities.find((candidate) => candidate.inuse && candidate.classname === classname);
  if (!entity) {
    throw new Error(`Entite ${classname} introuvable`);
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
