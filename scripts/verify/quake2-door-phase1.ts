/**
 * File: quake2-door-phase1.ts
 * Purpose: Verify the first Quake II door trigger/runtime pipeline against `base1` without rendering.
 *
 * This file is not a direct source port.
 * It is a verification harness for the gameplay runtime being ported.
 *
 * Dependencies:
 * - packages/formats
 * - packages/game
 */

import fs from "node:fs";
import path from "node:path";
import { parseBsp } from "../../packages/formats/src/bsp.js";
import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import {
  G_UseTargets,
  SVF_MONSTER,
  createGameRuntimeFromBspMap,
  findRuntimeEntitiesByTargetname,
  getRuntimeEntityLabel,
  initializeDoorPlanEntities,
  runPendingThinks,
  spawnGameEntity,
  useGameEntity
} from "../../packages/game/src/index.js";
import type { GameEntity, GameRuntime, GameRuntimeLogEntry } from "../../packages/game/src/index.js";

const MAP_PATH = "maps/base1.bsp";
const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");

interface VerificationScenario {
  label: string;
  mode: "targets" | "use" | "touch";
  entityIndex?: number;
  entityClassname?: string;
  actor: "player" | "monster";
}

const SCENARIOS: VerificationScenario[] = [
  { label: "button -> t4", mode: "targets", entityIndex: 573, actor: "player" },
  { label: "trigger_multiple use -> t37", mode: "use", entityIndex: 401, actor: "player" },
  { label: "trigger_once touch -> t70", mode: "touch", entityIndex: 261, actor: "player" },
  { label: "trigger_relay use -> t151", mode: "use", entityIndex: 35, actor: "player" },
  { label: "trigger_multiple touch by player", mode: "touch", entityIndex: 401, actor: "player" },
  { label: "door trigger touch by player", mode: "touch", entityClassname: "door_trigger", actor: "player" }
];

main();

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

  console.log(`Verification phases 1-3 - ${MAP_PATH}`);
  console.log(`Entites parsees: ${map.parsedEntities.length}`);
  console.log("");

  for (const targetname of ["t4", "t37", "t70", "t75"]) {
    const runtime = createPreparedRuntime(map);
    const matches = findRuntimeEntitiesByTargetname(runtime, targetname);
    const labels = matches.map((entity) => getRuntimeEntityLabel(entity));
    console.log(`[targetname=${targetname}] ${matches.length} correspondance(s)`);
    console.log(labels.length > 0 ? `  ${labels.join(" | ")}` : "  aucune cible resolue");
  }

  console.log("");

  for (const scenario of SCENARIOS) {
    const runtime = createPreparedRuntime(map);
    const entity = resolveScenarioEntity(runtime, scenario);
    const actor = createHarnessActor(runtime, scenario.actor);
    console.log(`=== ${scenario.label} ===`);
    console.log(`source: ${getRuntimeEntityLabel(entity)}`);

    if (scenario.mode === "targets") {
      G_UseTargets(runtime, entity, actor);
    } else if (scenario.mode === "use") {
      useGameEntity(runtime, entity, actor, actor);
    } else {
      touchGameEntity(runtime, entity, actor);
    }

    runPendingThinks(runtime, runtime.time + 1.0);

    for (const entry of runtime.logEntries) {
      console.log(formatLogEntry(entry));
    }

    console.log("");
  }
}

function createPreparedRuntime(map: ReturnType<typeof parseBsp>): GameRuntime {
  const runtime = createGameRuntimeFromBspMap(map);
  initializeDoorPlanEntities(runtime);
  runPendingThinks(runtime, runtime.time + 0.1);

  for (const entity of runtime.entities) {
    if (!entity.use) {
      entity.use = createInstrumentationUse();
    }
  }

  return runtime;
}

function resolveScenarioEntity(runtime: GameRuntime, scenario: VerificationScenario): GameEntity {
  if (scenario.entityIndex !== undefined) {
    return runtime.entities[scenario.entityIndex];
  }

  const entity = runtime.entities.find((candidate) => candidate.classname === scenario.entityClassname);
  if (!entity) {
    throw new Error(`Entite de scenario introuvable: ${scenario.entityClassname}`);
  }

  return entity;
}

function createHarnessActor(runtime: GameRuntime, actor: "player" | "monster"): GameEntity {
  const entity = spawnGameEntity(runtime);
  entity.classname = actor === "player" ? "player" : "monster";
  entity.client = actor === "player";
  entity.health = 100;
  if (actor === "monster") {
    entity.svflags |= SVF_MONSTER;
  }
  return entity;
}

function touchGameEntity(runtime: GameRuntime, entity: GameEntity, other: GameEntity): void {
  runtime.log({
    kind: "use",
    message: `${getRuntimeEntityLabel(other)} touches ${getRuntimeEntityLabel(entity)}`,
    entityIndex: entity.index,
    entityClassname: entity.classname,
    otherIndex: other.index,
    otherClassname: other.classname
  });

  entity.touch?.(entity, other, runtime);
}

function createInstrumentationUse() {
  return (self: GameEntity, other: GameEntity | null, activator: GameEntity | null, runtime: GameRuntime): void => {
    runtime.log({
      kind: "use",
      message: `${getRuntimeEntityLabel(self)} placeholder use other=${getRuntimeEntityLabel(other)} activator=${getRuntimeEntityLabel(activator)}`,
      entityIndex: self.index,
      entityClassname: self.classname,
      otherIndex: activator?.index,
      otherClassname: activator?.classname
    });
  };
}

function formatLogEntry(entry: GameRuntimeLogEntry): string {
  return `[t=${entry.time.toFixed(3)}] ${entry.kind} :: ${entry.message}`;
}
