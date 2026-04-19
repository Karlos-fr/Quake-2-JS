/**
 * File: runtime.ts
 * Purpose: Provide a first gameplay entity runtime for BSP-spawned Quake II entities and delayed target dispatch.
 *
 * This file is not a direct source port.
 * It is a runtime support layer that keeps entity data close to Quake II gameplay conventions.
 *
 * Dependencies:
 * - packages/formats
 * - packages/game/src/g_utils.ts
 */

import type { BspEntity, BspMap } from "../../formats/src/bsp.js";
import { G_UseTargets } from "./g_utils.js";

/**
 * Category: New
 * Purpose: Name the string-backed entity fields searchable through the first `G_Find` port.
 *
 * Constraints:
 * - Must stay aligned with the BSP-backed entity fields already required by the door plan.
 */
export type GameEntityFieldName =
  | "classname"
  | "target"
  | "targetname"
  | "killtarget"
  | "message"
  | "model";

/**
 * Category: New
 * Purpose: Preserve the `use` callback shape used by Quake II gameplay entities.
 *
 * Constraints:
 * - Must receive the runtime so delayed dispatch and instrumentation can stay explicit.
 */
export type GameEntityUse = (self: GameEntity, other: GameEntity | null, activator: GameEntity | null, runtime: GameRuntime) => void;

/**
 * Category: New
 * Purpose: Preserve the `touch` callback shape used by trigger entities.
 *
 * Constraints:
 * - Must stay close to the Quake II touch calling convention while omitting plane/surface for now.
 */
export type GameEntityTouch = (self: GameEntity, other: GameEntity, runtime: GameRuntime) => void;

/**
 * Category: New
 * Purpose: Preserve the `blocked` callback shape used by pushers such as doors and platforms.
 *
 * Constraints:
 * - Must keep the original Quake-style `(self, other)` behavior while receiving the runtime explicitly.
 */
export type GameEntityBlocked = (self: GameEntity, other: GameEntity, runtime: GameRuntime) => void;

/**
 * Category: New
 * Purpose: Preserve the `die` callback shape used by shootable brush entities such as doors.
 *
 * Constraints:
 * - Must preserve the Quake-style `(self, inflictor, attacker, damage)` flow while receiving the runtime explicitly.
 */
export type GameEntityDie = (self: GameEntity, inflictor: GameEntity | null, attacker: GameEntity | null, damage: number, runtime: GameRuntime) => void;

/**
 * Category: New
 * Purpose: Hold the first movement state fields needed by doors and plats.
 *
 * Constraints:
 * - Keeps the original Quake II field names so later movement ports can plug in incrementally.
 */
export interface GameMoveInfo {
  state: number;
  speed: number;
  accel: number;
  decel: number;
  wait: number;
  distance: number;
  start_origin: [number, number, number];
  end_origin: [number, number, number];
  start_angles: [number, number, number];
  end_angles: [number, number, number];
  dir: [number, number, number];
  current_speed: number;
  move_speed: number;
  next_speed: number;
  remaining_distance: number;
  decel_distance: number;
  endfunc: GameEntityThink | undefined;
  sound_start: number;
  sound_middle: number;
  sound_end: number;
}

/**
 * Category: New
 * Purpose: Preserve the `think` callback shape used by delayed gameplay entities.
 *
 * Constraints:
 * - Must receive the runtime so entity allocation and logging stay centralized.
 */
export type GameEntityThink = (self: GameEntity, runtime: GameRuntime) => void;

/**
 * Category: New
 * Purpose: Represent one BSP-spawned gameplay entity in a Quake-like mutable runtime shape.
 *
 * Constraints:
 * - Must preserve the original BSP property bag for later spawn-field expansion.
 */
export interface GameEntity {
  index: number;
  inuse: boolean;
  freetime: number;
  properties: Record<string, string>;
  classname: string;
  client: boolean;
  owner: GameEntity | null;
  enemy: GameEntity | null;
  team: string | undefined;
  teammaster: GameEntity | null;
  teamchain: GameEntity | null;
  target: string | undefined;
  targetname: string | undefined;
  killtarget: string | undefined;
  message: string | undefined;
  model: string | undefined;
  spawnflags: number;
  flags: number;
  wait: number;
  speed: number;
  accel: number;
  decel: number;
  sounds: number;
  noise_index: number;
  solid: number;
  movetype: number;
  svflags: number;
  linkcount: number;
  health: number;
  max_health: number;
  dmg: number;
  touch_debounce_time: number;
  delay: number;
  nextthink: number;
  activator: GameEntity | null;
  use: GameEntityUse | undefined;
  think: GameEntityThink | undefined;
  touch: GameEntityTouch | undefined;
  blocked: GameEntityBlocked | undefined;
  die: GameEntityDie | undefined;
  movedir: [number, number, number];
  velocity: [number, number, number];
  avelocity: [number, number, number];
  origin: [number, number, number];
  angles: [number, number, number];
  pos1: [number, number, number];
  pos2: [number, number, number];
  mins: [number, number, number];
  maxs: [number, number, number];
  size: [number, number, number];
  moveinfo: GameMoveInfo;
}

/**
 * Category: New
 * Purpose: Describe one runtime instrumentation event emitted while resolving targets.
 *
 * Constraints:
 * - Must be readable enough for the phase-1 verification harness.
 */
export interface GameRuntimeLogEntry {
  time: number;
  kind:
    | "use"
    | "use-targets"
    | "delay-scheduled"
    | "message"
    | "killtarget"
    | "fire-target"
    | "warning"
    | "entity-freed"
    | "think";
  message: string;
  entityIndex?: number | undefined;
  entityClassname?: string | undefined;
  otherIndex?: number | undefined;
  otherClassname?: string | undefined;
}

/**
 * Category: New
 * Purpose: Hold the mutable gameplay entity list plus minimal timing and log state.
 *
 * Constraints:
 * - Entity order must remain stable so future `edict`-style references stay predictable.
 */
export interface GameRuntime {
  entities: GameEntity[];
  time: number;
  current_entity: GameEntity | null;
  logEntries: GameRuntimeLogEntry[];
  log: (entry: Omit<GameRuntimeLogEntry, "time">) => void;
}

/**
 * Category: New
 * Purpose: Keep the first trigger/runtime constants in one place while later gameplay ports grow.
 *
 * Constraints:
 * - Values only need local consistency for now because no network serialization depends on them yet.
 */
export const SOLID_NOT = 0;
export const SOLID_TRIGGER = 1;
export const SOLID_BSP = 2;
export const MOVETYPE_NONE = 0;
export const MOVETYPE_PUSH = 1;
export const FL_TEAMSLAVE = 0x00000400;
export const SVF_NOCLIENT = 1 << 0;
export const SVF_MONSTER = 1 << 1;
export const FRAMETIME = 0.1;
export const STATE_TOP = 0;
export const STATE_BOTTOM = 1;
export const STATE_UP = 2;
export const STATE_DOWN = 3;
export const DOOR_START_OPEN = 1;
export const DOOR_REVERSE = 2;
export const DOOR_CRUSHER = 4;
export const DOOR_NOMONSTER = 8;
export const DOOR_TOGGLE = 32;
export const DOOR_X_AXIS = 64;
export const DOOR_Y_AXIS = 128;
export const PLAT_LOW_TRIGGER = 1;

/**
 * Category: New
 * Purpose: Convert one parsed BSP entity into the mutable runtime shape used by the first gameplay ports.
 *
 * Constraints:
 * - Must preserve source strings exactly while parsing numeric delay values conservatively.
 */
export function createRuntimeEntity(properties: Record<string, string>, index: number): GameEntity {
  const origin = parseEntityVector(properties.origin);
  const angles = parseEntityAngles(properties);

  return {
    index,
    inuse: true,
    freetime: -1,
    properties: { ...properties },
    classname: properties.classname ?? "noclass",
    client: false,
    owner: null,
    enemy: null,
    team: properties.team,
    teammaster: null,
    teamchain: null,
    target: properties.target,
    targetname: properties.targetname,
    killtarget: properties.killtarget,
    message: properties.message,
    model: properties.model,
    spawnflags: parseEntityInteger(properties.spawnflags),
    flags: 0,
    wait: parseEntityFloat(properties.wait),
    speed: parseEntityFloat(properties.speed),
    accel: parseEntityFloat(properties.accel),
    decel: parseEntityFloat(properties.decel),
    sounds: parseEntityInteger(properties.sounds),
    noise_index: 0,
    solid: SOLID_NOT,
    movetype: MOVETYPE_NONE,
    svflags: 0,
    linkcount: 0,
    health: parseEntityInteger(properties.health),
    max_health: 0,
    dmg: parseEntityInteger(properties.dmg),
    touch_debounce_time: 0,
    delay: parseEntityFloat(properties.delay),
    nextthink: 0,
    activator: null,
    use: undefined,
    think: undefined,
    touch: undefined,
    blocked: undefined,
    die: undefined,
    movedir: [0, 0, 0],
    velocity: [0, 0, 0],
    avelocity: [0, 0, 0],
    origin,
    angles,
    pos1: [...origin],
    pos2: [...origin],
    mins: [0, 0, 0],
    maxs: [0, 0, 0],
    size: [0, 0, 0],
    moveinfo: createMoveInfo()
  };
}

/**
 * Category: New
 * Purpose: Create the first gameplay runtime from BSP entities while preserving map ordering.
 *
 * Constraints:
 * - Must expose centralized logging for the verification harness.
 */
export function createGameRuntimeFromBspEntities(entities: BspEntity[]): GameRuntime {
  const runtime: GameRuntime = {
    entities: entities.map((entity, index) => createRuntimeEntity(entity.properties, index)),
    time: 0,
    current_entity: null,
    logEntries: [],
    log: (entry) => {
      runtime.logEntries.push({
        ...entry,
        time: runtime.time
      });
    }
  };

  return runtime;
}

/**
 * Category: New
 * Purpose: Create a gameplay runtime from one parsed BSP map and enrich brush entities with inline model bounds.
 *
 * Constraints:
 * - Must preserve BSP entity ordering.
 */
export function createGameRuntimeFromBspMap(map: BspMap): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities(map.parsedEntities);

  for (const entity of runtime.entities) {
    applyInlineModelBounds(entity, map);
  }

  return runtime;
}

/**
 * Category: New
 * Purpose: Advance and execute all `think` callbacks scheduled up to one absolute time.
 *
 * Constraints:
 * - Must run in time order to preserve delayed target semantics.
 */
export function runPendingThinks(runtime: GameRuntime, upToTime = Number.POSITIVE_INFINITY): void {
  while (true) {
    const nextEntity = findNextThinkEntity(runtime, upToTime);
    if (!nextEntity || !nextEntity.think) {
      runtime.time = Math.max(runtime.time, Number.isFinite(upToTime) ? upToTime : runtime.time);
      return;
    }

    runtime.time = Math.max(runtime.time, nextEntity.nextthink);
    nextEntity.nextthink = 0;
    const think = nextEntity.think;
    nextEntity.think = undefined;
    runtime.log({
      kind: "think",
      message: `${getRuntimeEntityLabel(nextEntity)} think`,
      entityIndex: nextEntity.index,
      entityClassname: nextEntity.classname
    });
    think(nextEntity, runtime);
  }
}

/**
 * Category: New
 * Purpose: Invoke one entity `use` callback while journaling the activation for verification.
 *
 * Constraints:
 * - Must keep the Quake-style `(self, other, activator)` calling convention.
 */
export function useGameEntity(
  runtime: GameRuntime,
  entity: GameEntity,
  other: GameEntity | null = null,
  activator: GameEntity | null = other
): void {
  runtime.log({
    kind: "use",
    message: `${getRuntimeEntityLabel(entity)} used by ${getRuntimeEntityLabel(activator)}`,
    entityIndex: entity.index,
    entityClassname: entity.classname,
    otherIndex: activator?.index,
    otherClassname: activator?.classname
  });

  entity.use?.(entity, other, activator, runtime);
}

/**
 * Category: New
 * Purpose: Provide a human-readable label for one runtime entity in verification output.
 *
 * Constraints:
 * - Must remain stable across runs for log diffing.
 */
export function getRuntimeEntityLabel(entity: GameEntity | null): string {
  if (!entity) {
    return "null";
  }

  const parts = [`#${entity.index}`, entity.classname];
  if (entity.targetname) {
    parts.push(`targetname=${entity.targetname}`);
  }
  if (entity.target) {
    parts.push(`target=${entity.target}`);
  }
  return parts.join(" ");
}

/**
 * Category: New
 * Purpose: Find all currently active entities with one exact `targetname`.
 *
 * Constraints:
 * - Must preserve runtime order.
 */
export function findRuntimeEntitiesByTargetname(runtime: GameRuntime, targetname: string): GameEntity[] {
  return runtime.entities.filter((entity) => entity.inuse && entity.targetname === targetname);
}

/**
 * Category: New
 * Purpose: Build the delayed `think` helper used by `G_UseTargets`.
 *
 * Constraints:
 * - Must free the temporary entity after the delayed dispatch runs.
 */
export function Think_Delay(ent: GameEntity, runtime: GameRuntime): void {
  G_UseTargets(runtime, ent, ent.activator);
  freeGameEntity(runtime, ent);
}

/**
 * Category: New
 * Purpose: Allocate one new temporary runtime entity appended after the BSP-spawned entity set.
 *
 * Constraints:
 * - Must preserve stable indices for already existing entities.
 */
export function spawnGameEntity(runtime: GameRuntime): GameEntity {
  const entity: GameEntity = {
    index: runtime.entities.length,
    inuse: true,
    freetime: -1,
    properties: {},
    classname: "noclass",
    client: false,
    owner: null,
    enemy: null,
    team: undefined,
    teammaster: null,
    teamchain: null,
    target: undefined,
    targetname: undefined,
    killtarget: undefined,
    message: undefined,
    model: undefined,
    spawnflags: 0,
    flags: 0,
    wait: 0,
    speed: 0,
    accel: 0,
    decel: 0,
    sounds: 0,
    noise_index: 0,
    solid: SOLID_NOT,
    movetype: MOVETYPE_NONE,
    svflags: 0,
    linkcount: 0,
    health: 0,
    max_health: 0,
    dmg: 0,
    touch_debounce_time: 0,
    delay: 0,
    nextthink: 0,
    activator: null,
    use: undefined,
    think: undefined,
    touch: undefined,
    blocked: undefined,
    die: undefined,
    movedir: [0, 0, 0],
    velocity: [0, 0, 0],
    avelocity: [0, 0, 0],
    origin: [0, 0, 0],
    angles: [0, 0, 0],
    pos1: [0, 0, 0],
    pos2: [0, 0, 0],
    mins: [0, 0, 0],
    maxs: [0, 0, 0],
    size: [0, 0, 0],
    moveinfo: createMoveInfo()
  };

  runtime.entities.push(entity);
  return entity;
}

/**
 * Category: New
 * Purpose: Mark one runtime entity as freed while keeping its slot available for log references.
 *
 * Constraints:
 * - Must preserve the entity index and freetime for later diagnostics.
 */
export function freeGameEntity(runtime: GameRuntime, entity: GameEntity): void {
  const freedIndex = entity.index;
  entity.inuse = false;
  entity.freetime = runtime.time;
  entity.nextthink = 0;
  entity.think = undefined;
  entity.use = undefined;
  entity.activator = null;
  entity.blocked = undefined;
  entity.properties = {};
  entity.classname = "freed";
  entity.client = false;
  entity.owner = null;
  entity.enemy = null;
  entity.team = undefined;
  entity.teammaster = null;
  entity.teamchain = null;
  entity.target = undefined;
  entity.targetname = undefined;
  entity.killtarget = undefined;
  entity.message = undefined;
  entity.model = undefined;
  entity.spawnflags = 0;
  entity.flags = 0;
  entity.wait = 0;
  entity.speed = 0;
  entity.accel = 0;
  entity.decel = 0;
  entity.sounds = 0;
  entity.noise_index = 0;
  entity.solid = SOLID_NOT;
  entity.movetype = MOVETYPE_NONE;
  entity.svflags = 0;
  entity.linkcount = 0;
  entity.health = 0;
  entity.max_health = 0;
  entity.dmg = 0;
  entity.touch_debounce_time = 0;
  entity.delay = 0;
  entity.touch = undefined;
  entity.die = undefined;
  entity.movedir = [0, 0, 0];
  entity.velocity = [0, 0, 0];
  entity.avelocity = [0, 0, 0];
  entity.origin = [0, 0, 0];
  entity.angles = [0, 0, 0];
  entity.pos1 = [0, 0, 0];
  entity.pos2 = [0, 0, 0];
  entity.mins = [0, 0, 0];
  entity.maxs = [0, 0, 0];
  entity.size = [0, 0, 0];
  entity.moveinfo = createMoveInfo();

  runtime.log({
    kind: "entity-freed",
    message: `#${freedIndex} freed`,
    entityIndex: freedIndex,
    entityClassname: "freed"
  });
}

/**
 * Category: New
 * Purpose: Find the next scheduled thinker to execute up to one absolute time limit.
 *
 * Constraints:
 * - Must preserve deterministic entity order when several thinkers share the same frame time.
 */
function findNextThinkEntity(runtime: GameRuntime, upToTime: number): GameEntity | null {
  let nextEntity: GameEntity | null = null;

  for (const entity of runtime.entities) {
    if (!entity.inuse || !entity.think || entity.nextthink <= 0 || entity.nextthink > upToTime) {
      continue;
    }

    if (!nextEntity || entity.nextthink < nextEntity.nextthink) {
      nextEntity = entity;
    }
  }

  return nextEntity;
}

/**
 * Category: New
 * Purpose: Parse one optional float-like BSP property with a zero fallback.
 */
function parseEntityFloat(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Category: New
 * Purpose: Parse one optional integer-like BSP property with a zero fallback.
 */
function parseEntityInteger(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Category: New
 * Purpose: Create the zero-initialized `moveinfo` block used by early door and plat ports.
 */
function createMoveInfo(): GameMoveInfo {
  return {
    state: STATE_BOTTOM,
    speed: 0,
    accel: 0,
    decel: 0,
    wait: 0,
    distance: 0,
    start_origin: [0, 0, 0],
    end_origin: [0, 0, 0],
    start_angles: [0, 0, 0],
    end_angles: [0, 0, 0],
    dir: [0, 0, 0],
    current_speed: 0,
    move_speed: 0,
    next_speed: 0,
    remaining_distance: 0,
    decel_distance: 0,
    endfunc: undefined,
    sound_start: 0,
    sound_middle: 0,
    sound_end: 0
  };
}

/**
 * Category: New
 * Purpose: Parse one Quake-style origin vector into a numeric tuple with a safe zero fallback.
 */
function parseEntityVector(value: string | undefined): [number, number, number] {
  if (!value) {
    return [0, 0, 0];
  }

  const parts = value.trim().split(/\s+/).map((part) => Number.parseFloat(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return [0, 0, 0];
  }

  return [parts[0], parts[1], parts[2]];
}

/**
 * Category: New
 * Purpose: Parse the first Quake entity angle conventions into a three-component angle tuple.
 *
 * Constraints:
 * - Must support both `angles` and the shorthand single `angle` yaw field.
 */
function parseEntityAngles(properties: Record<string, string>): [number, number, number] {
  if (properties.angles) {
    const parts = properties.angles.trim().split(/\s+/).map((part) => Number.parseFloat(part));
    if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
      return [parts[0], parts[1], parts[2]];
    }
  }

  if (properties.angle) {
    const yaw = Number.parseFloat(properties.angle);
    if (Number.isFinite(yaw)) {
      return [0, yaw, 0];
    }
  }

  return [0, 0, 0];
}

/**
 * Category: New
 * Purpose: Attach inline BSP model bounds to one runtime brush entity.
 *
 * Constraints:
 * - Must ignore invalid or non-inline model references without failing runtime creation.
 */
function applyInlineModelBounds(entity: GameEntity, map: BspMap): void {
  const model = entity.model;
  if (!model || !model.startsWith("*")) {
    return;
  }

  const modelIndex = Number.parseInt(model.slice(1), 10);
  if (!Number.isFinite(modelIndex) || modelIndex < 0 || modelIndex >= map.models.length) {
    return;
  }

  const inlineModel = map.models[modelIndex];
  entity.mins = [...inlineModel.mins];
  entity.maxs = [...inlineModel.maxs];
  entity.size = [
    inlineModel.maxs[0] - inlineModel.mins[0],
    inlineModel.maxs[1] - inlineModel.mins[1],
    inlineModel.maxs[2] - inlineModel.mins[2]
  ];
}
