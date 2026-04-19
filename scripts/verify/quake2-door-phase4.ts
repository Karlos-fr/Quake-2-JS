/**
 * File: quake2-door-phase4.ts
 * Purpose: Verify the first Quake II platform lift port on one touch plat and one targeted plat.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 4 of the door plan.
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
  getRuntimeEntityLabel,
  initializeDoorPlanEntities,
  runGameFrames,
  spawnGameEntity,
  touchTriggerEntities,
  useGameEntity,
  type GameEntity,
  type GameRuntime,
  type GameRuntimeLogEntry
} from "../../packages/game/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const TOUCH_MAP_PATH = "maps/base2.bsp";
const TARGETED_MAP_PATH = "maps/bunk1.bsp";

main();

/**
 * Category: New
 * Purpose: Run the phase-4 verification flow over one standard plat and one targeted plat.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const pak = parsePak(pakBytes, pakPath);

  const touchScenario = runTouchPlatScenario(pak);
  const targetedScenario = runTargetedPlatScenario(pak);

  console.log(`Verification phase 4 - ${TOUCH_MAP_PATH} + ${TARGETED_MAP_PATH}`);
  console.log("");
  printScenario("Plat tactile", touchScenario.runtime.logEntries, [
    `plat: ${getRuntimeEntityLabel(touchScenario.plat)}`,
    `trigger: ${getRuntimeEntityLabel(touchScenario.trigger)}`,
    `player: ${getRuntimeEntityLabel(touchScenario.player)} @ ${touchScenario.player.origin.join(", ")}`,
    `final state: ${touchScenario.plat.moveinfo.state}`,
    `final origin: ${touchScenario.plat.origin.join(", ")}`
  ]);
  printScenario("Plat cible", targetedScenario.runtime.logEntries, [
    `plat: ${getRuntimeEntityLabel(targetedScenario.plat)}`,
    `activator: ${getRuntimeEntityLabel(targetedScenario.player)}`,
    `final state: ${targetedScenario.plat.moveinfo.state}`,
    `final origin: ${targetedScenario.plat.origin.join(", ")}`
  ]);
}

/**
 * Category: New
 * Purpose: Verify one standard platform that must react to a center touch trigger.
 */
function runTouchPlatScenario(pak: ReturnType<typeof parsePak>): {
  runtime: GameRuntime;
  plat: GameEntity;
  trigger: GameEntity;
  player: GameEntity;
} {
  const runtime = createRuntimeForMap(pak, TOUCH_MAP_PATH);
  const plat = findFirstPlat(runtime, false);
  const trigger = findPlatTrigger(runtime, plat);
  if (!trigger) {
    throw new Error(`Aucun trigger de plat trouve pour ${getRuntimeEntityLabel(plat)}`);
  }

  const player = createVerificationPlayer(runtime, computeBoundsCenter(trigger));
  runGameFrames(runtime, 25.0, () => {
    player.origin = computeBoundsCenter(trigger);
    touchTriggerEntities(runtime, player);
  });

  return { runtime, plat, trigger, player };
}

/**
 * Category: New
 * Purpose: Verify one targeted platform that must lower when explicitly used.
 */
function runTargetedPlatScenario(pak: ReturnType<typeof parsePak>): {
  runtime: GameRuntime;
  plat: GameEntity;
  player: GameEntity;
} {
  const runtime = createRuntimeForMap(pak, TARGETED_MAP_PATH);
  const plat = findFirstPlat(runtime, true);
  const player = createVerificationPlayer(runtime, [...plat.origin]);

  useGameEntity(runtime, plat, player, player);
  runGameFrames(runtime, 20.0);

  return { runtime, plat, player };
}

/**
 * Category: New
 * Purpose: Create one gameplay runtime for the requested BSP map and initialize door-plan entities.
 */
function createRuntimeForMap(pak: ReturnType<typeof parsePak>, mapPath: string): GameRuntime {
  const bspEntry = findPakEntry(pak, mapPath);
  if (!bspEntry) {
    throw new Error(`${mapPath} introuvable dans ${pak.sourcePath}`);
  }

  const map = parseBsp(readPakEntryData(pak, bspEntry), mapPath);
  const runtime = createGameRuntimeFromBspMap(map);
  initializeDoorPlanEntities(runtime);
  return runtime;
}

/**
 * Category: New
 * Purpose: Find the first `func_plat` matching the requested targeted state.
 */
function findFirstPlat(runtime: GameRuntime, targeted: boolean): GameEntity {
  const plat = runtime.entities.find(
    (entity) => entity.inuse && entity.classname === "func_plat" && Boolean(entity.targetname) === targeted
  );
  if (!plat) {
    throw new Error(`Aucun func_plat ${targeted ? "cible" : "standard"} trouve`);
  }

  return plat;
}

/**
 * Category: New
 * Purpose: Find the helper trigger spawned for one platform lift.
 */
function findPlatTrigger(runtime: GameRuntime, plat: GameEntity): GameEntity | null {
  for (const entity of runtime.entities) {
    if (!entity.inuse || entity.classname !== "plat_trigger" || entity.enemy !== plat) {
      continue;
    }

    return entity;
  }

  return null;
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
 * Purpose: Print one verification scenario with summary lines followed by runtime logs.
 */
function printScenario(title: string, entries: GameRuntimeLogEntry[], summaryLines: string[]): void {
  console.log(`=== ${title} ===`);
  for (const line of summaryLines) {
    console.log(line);
  }
  console.log("");
  for (const entry of entries) {
    console.log(formatLogEntry(entry));
  }
  console.log("");
}

/**
 * Category: New
 * Purpose: Format one runtime log entry for console verification output.
 */
function formatLogEntry(entry: GameRuntimeLogEntry): string {
  return `[t=${entry.time.toFixed(3)}] ${entry.kind} :: ${entry.message}`;
}
