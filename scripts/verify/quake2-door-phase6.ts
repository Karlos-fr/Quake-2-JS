/**
 * File: quake2-door-phase6.ts
 * Purpose: Verify that real Quake II doors and platforms now consume the collision-backed pusher chain.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 6 of the collision and brush-entity plan.
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
  FL_TEAMSLAVE,
  MOVETYPE_NONE,
  MOVETYPE_STEP,
  SOLID_BSP,
  SOLID_NOT,
  attachGameClient,
  createGameRuntimeFromBspMap,
  getRuntimeEntityLabel,
  initializeDoorPlanEntities,
  linkGameEntity,
  refreshEntitySpatialState,
  runGameFrames,
  spawnGameEntity,
  touchTriggerEntities,
  useGameEntity,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const BASE1_MAP_PATH = "maps/base1.bsp";
const BASE2_MAP_PATH = "maps/base2.bsp";
const TEAM_DOOR_MASTER_INDEX = 571;
const TEAM_DOOR_SLAVE_INDEX = 572;
const BLOCKING_DOOR_INDEX = 363;
const ROTATING_DOOR_INDEX = 473;
const PLAT_INDEX = 550;

main();

/**
 * Category: New
 * Purpose: Run the phase-6 collision-backed brush gameplay verification suite.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const pak = parsePak(pakBytes, pakPath);

  const teamDoorScenario = runTeamDoorScenario(pak);
  const blockedDoorScenario = runBlockedDoorScenario(pak);
  const rotatingDoorScenario = runRotatingDoorScenario(pak);
  const platScenario = runPlatScenario(pak);

  console.log("Verification phase 6 - collision-backed doors and plats");
  console.log(`team door master origin: ${teamDoorScenario.initialMasterOrigin.join(", ")} -> ${teamDoorScenario.master.origin.join(", ")}`);
  console.log(`team door slave origin: ${teamDoorScenario.initialSlaveOrigin.join(", ")} -> ${teamDoorScenario.slave.origin.join(", ")}`);
  console.log(`blocked door final state: ${blockedDoorScenario.door.moveinfo.state}`);
  console.log(`blocked door warnings: ${blockedDoorScenario.blockedWarnings.length}`);
  console.log(`rotating door rider: ${rotatingDoorScenario.initialRiderOrigin.join(", ")} -> ${rotatingDoorScenario.rider.origin.join(", ")}`);
  console.log(`plat origin: ${platScenario.initialOrigin.join(", ")} -> ${platScenario.plat.origin.join(", ")}`);
  console.log(`plat blocked warnings: ${platScenario.blockedWarnings.length}`);

  assertBoolean(teamDoorScenario.master.teamchain === teamDoorScenario.slave, true, "team door master chains to slave");
  assertBoolean(teamDoorScenario.slave.teammaster === teamDoorScenario.master, true, "team door slave references master");
  assertBoolean((teamDoorScenario.slave.flags & FL_TEAMSLAVE) !== 0, true, "team slave flag set");
  assertBoolean(vectorChanged(teamDoorScenario.initialMasterOrigin, teamDoorScenario.master.origin), true, "team door master moved");
  assertBoolean(vectorChanged(teamDoorScenario.initialSlaveOrigin, teamDoorScenario.slave.origin), true, "team door slave moved");
  assertBoolean(blockedDoorScenario.blockedWarnings.length > 0, true, "real blocked door warning emitted");
  assertBoolean(blockedDoorScenario.door.moveinfo.state !== 2, true, "blocked door did not stay in opening state");
  assertBoolean(vectorChanged(rotatingDoorScenario.initialRiderOrigin, rotatingDoorScenario.rider.origin), true, "rotating door moved rider");
  assertBoolean(vectorChanged(platScenario.initialOrigin, platScenario.plat.origin), true, "plat moved after trigger touch");
  assertBoolean(platScenario.blockedWarnings.length > 0, true, "real plat_blocked warning emitted");
}

/**
 * Category: New
 * Purpose: Verify that one team of real map doors opens through its trigger helper and moves both members.
 */
function runTeamDoorScenario(pak: ReturnType<typeof parsePak>): {
  master: GameEntity;
  slave: GameEntity;
  initialMasterOrigin: [number, number, number];
  initialSlaveOrigin: [number, number, number];
} {
  const runtime = createRuntimeForMap(pak, BASE1_MAP_PATH);
  const master = runtime.entities[TEAM_DOOR_MASTER_INDEX];
  const slave = runtime.entities[TEAM_DOOR_SLAVE_INDEX];
  runGameFrames(runtime, 0.1);

  const trigger = requireDoorTrigger(runtime, master);
  const opener = createVerificationActor(runtime, "team_door_opener", computeBoundsCenter(trigger), SOLID_NOT);
  const triggerCenter = computeBoundsCenter(trigger);
  const initialMasterOrigin: [number, number, number] = [...master.origin];
  const initialSlaveOrigin: [number, number, number] = [...slave.origin];

  runGameFrames(runtime, 2.0, () => {
    opener.origin = [...triggerCenter];
    refreshEntitySpatialState(opener);
    linkGameEntity(runtime, opener);
    touchTriggerEntities(runtime, opener);
  });

  return { master, slave, initialMasterOrigin, initialSlaveOrigin };
}

/**
 * Category: New
 * Purpose: Verify that one real map door routes a true obstacle through `door_blocked`.
 */
function runBlockedDoorScenario(pak: ReturnType<typeof parsePak>): {
  door: GameEntity;
  blockedWarnings: string[];
} {
  const runtime = createRuntimeForMap(pak, BASE2_MAP_PATH);
  const door = runtime.entities[BLOCKING_DOOR_INDEX];
  runGameFrames(runtime, 0.1);

  const trigger = requireDoorTrigger(runtime, door);
  const triggerCenter = computeBoundsCenter(trigger);
  const opener = createVerificationActor(runtime, "blocked_door_opener", [...triggerCenter], SOLID_NOT);
  const blocker = createVerificationActor(runtime, "blocked_door_blocker", [52, -800, 40]);
  const blockedWarnings: string[] = [];

  runGameFrames(runtime, 1.0, () => {
    opener.origin = [...triggerCenter];
    refreshEntitySpatialState(opener);
    linkGameEntity(runtime, opener);
    refreshEntitySpatialState(blocker);
    linkGameEntity(runtime, blocker);
    touchTriggerEntities(runtime, opener);
  });

  for (const entry of runtime.logEntries) {
    if (entry.kind === "warning" && entry.message.includes("blocked")) {
      blockedWarnings.push(entry.message);
    }
  }

  return { door, blockedWarnings };
}

/**
 * Category: New
 * Purpose: Verify that one rotating real map door carries one rider through the pusher chain.
 */
function runRotatingDoorScenario(pak: ReturnType<typeof parsePak>): {
  rider: GameEntity;
  initialRiderOrigin: [number, number, number];
} {
  const runtime = createRuntimeForMap(pak, BASE2_MAP_PATH);
  const door = runtime.entities[ROTATING_DOOR_INDEX];
  runGameFrames(runtime, 0.1);

  const rider = createVerificationActor(runtime, "rotating_door_rider", [450, -900, -10]);
  const initialRiderOrigin: [number, number, number] = [...rider.origin];
  useGameEntity(runtime, door, rider, rider);
  runGameFrames(runtime, 3.0);

  return { rider, initialRiderOrigin };
}

/**
 * Category: New
 * Purpose: Verify that one platform trigger opens a real map platform through the runtime trigger path.
 */
function runPlatScenario(pak: ReturnType<typeof parsePak>): {
  plat: GameEntity;
  initialOrigin: [number, number, number];
  blockedWarnings: string[];
} {
  const runtime = createRuntimeForMap(pak, BASE2_MAP_PATH);
  const plat = runtime.entities[PLAT_INDEX];
  runGameFrames(runtime, 0.1);

  const trigger = requirePlatTrigger(runtime, plat);
  const player = createVerificationActor(runtime, "plat_player", computeBoundsCenter(trigger), SOLID_NOT);
  const blocker = createVerificationActor(runtime, "plat_blocker", [-84, 1408, -30]);
  const initialOrigin: [number, number, number] = [...plat.origin];
  const triggerCenter = computeBoundsCenter(trigger);

  runGameFrames(runtime, 6.0, () => {
    player.origin = [...triggerCenter];
    refreshEntitySpatialState(player);
    linkGameEntity(runtime, player);
    refreshEntitySpatialState(blocker);
    linkGameEntity(runtime, blocker);
    touchTriggerEntities(runtime, player);
  });

  const blockedWarnings = runtime.logEntries
    .filter((entry) => entry.kind === "warning" && entry.message.includes("plat blocked"))
    .map((entry) => entry.message);

  return { plat, initialOrigin, blockedWarnings };
}

/**
 * Category: New
 * Purpose: Create one gameplay runtime for the requested BSP map and initialize the currently ported entities.
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
 * Purpose: Create one linked runtime actor using the Quake II player hull for trigger and blocker scenarios.
 */
function createVerificationActor(
  runtime: GameRuntime,
  classname: string,
  origin: [number, number, number],
  solid = SOLID_BSP
): GameEntity {
  const actor = spawnGameEntity(runtime);
  actor.classname = classname;
  attachGameClient(actor);
  actor.health = 100;
  actor.movetype = solid === SOLID_NOT ? MOVETYPE_NONE : MOVETYPE_STEP;
  actor.solid = solid;
  actor.origin = [...origin];
  actor.mins = [-16, -16, -24];
  actor.maxs = [16, 16, 32];
  refreshEntitySpatialState(actor);
  linkGameEntity(runtime, actor);
  return actor;
}

/**
 * Category: New
 * Purpose: Find the helper trigger spawned for one real map door.
 */
function requireDoorTrigger(runtime: GameRuntime, door: GameEntity): GameEntity {
  const trigger = runtime.entities.find((entity) => entity.inuse && entity.classname === "door_trigger" && entity.owner === door);
  if (!trigger) {
    throw new Error(`Aucun trigger de porte trouve pour ${getRuntimeEntityLabel(door)}`);
  }

  return trigger;
}

/**
 * Category: New
 * Purpose: Find the helper trigger spawned for one real map platform.
 */
function requirePlatTrigger(runtime: GameRuntime, plat: GameEntity): GameEntity {
  const trigger = runtime.entities.find((entity) => entity.inuse && entity.classname === "plat_trigger" && entity.enemy === plat);
  if (!trigger) {
    throw new Error(`Aucun trigger de plat trouve pour ${getRuntimeEntityLabel(plat)}`);
  }

  return trigger;
}

/**
 * Category: New
 * Purpose: Compute the center of one linked trigger volume from its absolute bounds.
 */
function computeBoundsCenter(entity: GameEntity): [number, number, number] {
  return [
    (entity.absmin[0] + entity.absmax[0]) * 0.5,
    (entity.absmin[1] + entity.absmax[1]) * 0.5,
    (entity.absmin[2] + entity.absmax[2]) * 0.5
  ];
}

/**
 * Category: New
 * Purpose: Detect whether one vector changed by more than a tiny deterministic epsilon.
 */
function vectorChanged(before: [number, number, number], after: [number, number, number]): boolean {
  return (
    Math.abs(before[0] - after[0]) > 0.001 ||
    Math.abs(before[1] - after[1]) > 0.001 ||
    Math.abs(before[2] - after[2]) > 0.001
  );
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
