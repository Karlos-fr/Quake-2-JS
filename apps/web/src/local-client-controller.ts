/**
 * File: local-client-controller.ts
 * Purpose: Bridge the ported Quake II client input and prediction runtime to the web demo camera and DOM input events.
 *
 * This file is not a direct source port.
 * It is an adapter layer between the client runtime, browser input and the BSP collision backend.
 *
 * Dependencies:
 * - packages/client
 * - packages/qcommon
 * - three
 */

import { PerspectiveCamera, Vector3 } from "three";
import {
  CL_BuildRefreshFrame,
  CL_BuildSkySnapshot,
  CL_CalcViewValues,
  CL_CreateCmd,
  CL_InitInput,
  CL_InitLocal,
  CL_PredictMovement,
  SCR_BuildScreenState,
  CL_SetInputFrameTime,
  CL_UpdateLerpFraction,
  connstate_t,
  createClientInputContext,
  createClientMainContext,
  createClientRuntime,
  type ClientRefreshFrame,
  type ClientInputContext,
  type ClientScreenHudState,
  type ClientRuntime,
  type QuakeSkySnapshot
} from "../../../packages/client/src/index.js";
import {
  createGameRuntimeFromBspMap,
  FRAMETIME,
  G_RunFrame,
  initializeDoorPlanEntities,
  linkGameEntity,
  refreshEntitySpatialState,
  spawnGameEntity,
  touchTriggerEntities,
  SVF_NOCLIENT,
  type GameEntity,
  type GameRuntime
} from "../../../packages/game/src/index.js";
import type { BrushModelSnapshot } from "../../../packages/renderer-three/src/index.js";
import {
  AngleVectors,
  CS_IMAGES,
  CS_ITEMS,
  CS_MODELS,
  CS_SOUNDS,
  CS_STATUSBAR,
  CS_AIRACCEL,
  CS_SKY,
  CS_SKYAXIS,
  CS_SKYROTATE,
  LerpAngle,
  MASK_PLAYERSOLID,
  PMF_DUCKED,
  PITCH,
  pmtype_t,
  STAT_AMMO,
  STAT_AMMO_ICON,
  STAT_ARMOR,
  STAT_ARMOR_ICON,
  STAT_FRAGS,
  STAT_HEALTH,
  STAT_HEALTH_ICON,
  STAT_LAYOUTS,
  STAT_PICKUP_ICON,
  STAT_PICKUP_STRING,
  STAT_SELECTED_ICON,
  STAT_SELECTED_ITEM,
  STAT_TIMER,
  STAT_TIMER_ICON,
  Pmove,
  YAW,
  createEntityState,
  createCommandRuntime,
  createPmoveContext,
  createCvarRuntime,
  type entity_state_t,
  type trace_t,
  type pmove_t,
  type vec3_t
} from "../../../packages/qcommon/src/index.js";
import type { BspSpawnPoint, BspMap } from "../../../packages/formats/src/index.js";

const CAMERA_MOUSE_SENSITIVITY = 0.0022;
const DEFAULT_VIEWHEIGHT = 22;
const DUCKED_VIEWHEIGHT = -2;
const DEFAULT_SPAWN_LIFT = 24;
const DEBUG_REFRESH_INTERVAL_MS = 100;
const PLAYER_TRIGGER_MINS: vec3_t = [-16, -16, -24];
const PLAYER_TRIGGER_MAXS: vec3_t = [16, 16, 32];
const PLAYER_DUCKED_MAXS: vec3_t = [16, 16, 4];
const PLAYER_GIB_MINS: vec3_t = [-16, -16, 0];
const PLAYER_GIB_MAXS: vec3_t = [16, 16, 16];
const LOCAL_SINGLE_STATUSBAR =
  "yb -24 "
  + "xv 0 "
  + "hnum "
  + "xv 50 "
  + "pic 0 "
  + "if 2 "
  + " xv 100 "
  + " anum "
  + " xv 150 "
  + " pic 2 "
  + "endif "
  + "if 4 "
  + " xv 200 "
  + " rnum "
  + " xv 250 "
  + " pic 4 "
  + "endif "
  + "if 6 "
  + " xv 296 "
  + " pic 6 "
  + "endif "
  + "yb -50 "
  + "if 7 "
  + " xv 0 "
  + " pic 7 "
  + " xv 26 "
  + " yb -42 "
  + " stat_string 8 "
  + " yb -50 "
  + "endif "
  + "if 9 "
  + " xv 262 "
  + " num 2 10 "
  + " xv 296 "
  + " pic 9 "
  + "endif "
  + "if 11 "
  + " xv 148 "
  + " pic 11 "
  + "endif ";
const LOCAL_SCOREBOARD_LAYOUT =
  "xv 0 yv 32 picn inventory "
  + "client 0 32 0 7 32 5 "
  + "client 0 64 1 3 48 3 ";

type MovementKey = "forward" | "backward" | "left" | "right" | "up" | "down";

/**
 * Category: New
 * Purpose: Expose the web-local client prediction driver used by the browser demo.
 *
 * Constraints:
 * - Must keep browser event handling and client runtime state explicit.
 */
export interface LocalClientController {
  runtime: ClientRuntime;
  gameplayRuntime: GameRuntime;
  refreshFrame: ClientRefreshFrame | null;
  screenState: ClientScreenHudState;
  skySnapshot: QuakeSkySnapshot | null;
  ghostMode: boolean;
  getBrushModelSnapshots: () => BrushModelSnapshot[];
  setGhostMode: (enabled: boolean) => void;
  update: (deltaSeconds: number) => void;
}

/**
 * Category: New
 * Purpose: Preserve the previous and current brush-model poses required to interpolate moving BSP submodels like the original client.
 *
 * Constraints:
 * - Must keep timestamps aligned with fixed Quake II server frames.
 * - Must preserve per-model pairing through the original `*N` model name.
 */
interface BrushModelInterpolationState {
  previousSnapshots: BrushModelSnapshot[];
  currentSnapshots: BrushModelSnapshot[];
  previousTime: number;
  currentTime: number;
}

/**
 * Category: New
 * Purpose: Create a local client controller that drives the browser camera from the ported Quake II client prediction path.
 *
 * Constraints:
 * - Must use the shared BSP collision callbacks for `trace` and `pointcontents`.
 */
export function createLocalClientController(
  viewport: HTMLDivElement,
  camera: PerspectiveCamera,
  map: BspMap,
  spawn: BspSpawnPoint | null
): LocalClientController {
  const runtime = createClientRuntime();
  const cmdRuntime = createCommandRuntime();
  const cvarRuntime = createCvarRuntime();
  const mainContext = createClientMainContext(runtime, cmdRuntime, cvarRuntime);
  CL_InitLocal(mainContext);

  const inputContext = createClientInputContext(runtime, cmdRuntime, cvarRuntime);
  CL_InitInput(inputContext);

  const gameplayRuntime = createGameRuntimeFromBspMap(map);
  initializeDoorPlanEntities(gameplayRuntime);
  const gameplayPlayer = createLocalGameplayPlayer(gameplayRuntime);
  const collision = createLocalCollisionAdapter(gameplayRuntime, gameplayPlayer);
  const brushModelInterpolation = createBrushModelInterpolationState(gameplayRuntime);

  const spawnOrigin: vec3_t = spawn
    ? [spawn.origin[0], spawn.origin[1], spawn.origin[2] + DEFAULT_SPAWN_LIFT]
    : [0, 0, DEFAULT_SPAWN_LIFT];
  const spawnYaw = spawn?.angle ?? 0;

  runtime.cls.state = connstate_t.ca_active;
  runtime.cl.frame.valid = true;
  runtime.cl.frame.serverframe = 0;
  runtime.cl.frame.servertime = 0;
  runtime.cl.frame.playerstate.pmove.pm_type = 0;
  runtime.cl.frame.playerstate.pmove.origin = [
    Math.trunc(spawnOrigin[0] * 8),
    Math.trunc(spawnOrigin[1] * 8),
    Math.trunc(spawnOrigin[2] * 8)
  ];
  runtime.cl.frame.playerstate.pmove.velocity = [0, 0, 0];
  runtime.cl.frame.playerstate.pmove.gravity = 800;
  runtime.cl.frame.playerstate.pmove.delta_angles = [0, 0, 0];
  runtime.cl.frame.playerstate.viewoffset = [0, 0, DEFAULT_VIEWHEIGHT];
  runtime.cl.frame.playerstate.viewangles = [0, spawnYaw, 0];
  runtime.cl.viewangles = [0, spawnYaw, 0];
  runtime.cl.predicted_origin = [...spawnOrigin];
  runtime.cl.predicted_angles = [0, spawnYaw, 0];
  runtime.cl.configstrings[CS_AIRACCEL] = "0";

  initializeSpawnPrediction(runtime, collision, spawnOrigin);
  initializeLocalHudState(runtime);
  initializeLocalSkyState(runtime, map);
  syncLocalGameplayFrame(runtime, gameplayRuntime);

  const pressedKeys: Record<MovementKey, boolean> = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  };

  let pointerLocked = false;
  let realtimeMs = 0;
  let nextCommandSequence = 1;
  let nextDebugRefreshAtMs = 0;
  let ghostMode = true;

  const codeBindings: Record<string, MovementKey> = {
    Space: "up",
    ControlLeft: "down",
    ControlRight: "down"
  };

  const keyBindings: Record<string, MovementKey> = {
    z: "forward",
    s: "backward",
    q: "left",
    d: "right"
  };

  viewport.addEventListener("click", () => {
    void viewport.requestPointerLock();
  });

  document.addEventListener("pointerlockchange", () => {
    pointerLocked = document.pointerLockElement === viewport;
    if (!pointerLocked) {
      clearMovementState(inputContext, pressedKeys);
    }
  });

  document.addEventListener("mousemove", (event) => {
    if (!pointerLocked) {
      return;
    }

    runtime.cl.viewangles[YAW] -= event.movementX * CAMERA_MOUSE_SENSITIVITY * 180 / Math.PI;
    runtime.cl.viewangles[PITCH] -= event.movementY * CAMERA_MOUSE_SENSITIVITY * 180 / Math.PI;
    runtime.cl.viewangles[PITCH] = Math.max(-89, Math.min(89, runtime.cl.viewangles[PITCH]));
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Tab") {
      setLayoutBit(runtime, 1, true);
      event.preventDefault();
      return;
    }

    if (event.key.toLowerCase() === "i") {
      toggleLayoutBit(runtime, 2);
      event.preventDefault();
      return;
    }

    const binding = codeBindings[event.code] ?? keyBindings[event.key.toLowerCase()];
    if (!binding) {
      return;
    }

    pressedKeys[binding] = true;
    event.preventDefault();
  });

  window.addEventListener("keyup", (event) => {
    if (event.code === "Tab") {
      setLayoutBit(runtime, 1, false);
      event.preventDefault();
      return;
    }

    const binding = codeBindings[event.code] ?? keyBindings[event.key.toLowerCase()];
    if (!binding) {
      return;
    }

    pressedKeys[binding] = false;
    event.preventDefault();
  });

  window.addEventListener("blur", () => {
    clearMovementState(inputContext, pressedKeys);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
      clearMovementState(inputContext, pressedKeys);
    }
  });

  let refreshFrame: ClientRefreshFrame | null = CL_BuildRefreshFrame(runtime, {
    predictMovement: true
  });

  return {
    runtime,
    gameplayRuntime,
    get refreshFrame() {
      return refreshFrame;
    },
    get ghostMode() {
      return ghostMode;
    },
    get screenState() {
      return SCR_BuildScreenState(runtime, {
        paused: false,
        outgoingSequence: nextCommandSequence,
        incomingAcknowledged: nextCommandSequence - 1,
        commandBackup: 64
      });
    },
    get skySnapshot() {
      return CL_BuildSkySnapshot(runtime);
    },
    getBrushModelSnapshots: () => buildInterpolatedBrushModelSnapshots(brushModelInterpolation, realtimeMs / 1000),
    setGhostMode: (enabled) => {
      ghostMode = enabled;
      applyMovementMode(runtime, ghostMode);
    },
    update: (deltaSeconds) => {
      realtimeMs += deltaSeconds * 1000;
      runtime.cls.realtime = realtimeMs;
      runtime.cls.frametime = deltaSeconds;
      runtime.cl.time = realtimeMs;
      applyMovementMode(runtime, ghostMode);
      advanceGameplayRuntime(gameplayRuntime, realtimeMs, brushModelInterpolation);

      CL_SetInputFrameTime(inputContext, realtimeMs);
      syncMovementButtons(inputContext, pressedKeys, realtimeMs);

      const cmd = CL_CreateCmd(inputContext, {
        anykeydown: Object.values(pressedKeys).some(Boolean),
        key_game_active: true
      });

      const frameIndex = nextCommandSequence & 63;
      runtime.cl.cmd = cmd;
      runtime.cl.cmds[frameIndex] = cloneUsercmd(cmd);
      runtime.cl.cmd_time[frameIndex] = realtimeMs;

      CL_PredictMovement(runtime, {
        predictMovement: true,
        paused: false,
        incomingAcknowledged: nextCommandSequence - 1,
        outgoingSequence: nextCommandSequence + 1,
        trace: collision.trace,
        pointcontents: collision.pointcontents
      });

      promotePredictedState(runtime, realtimeMs);
      updateGameplayRuntimePlayer(gameplayRuntime, gameplayPlayer, runtime);
      syncLocalGameplayFrame(runtime, gameplayRuntime);
      applyPredictedCamera(camera, runtime);

      if (realtimeMs >= nextDebugRefreshAtMs) {
        refreshFrame = CL_BuildRefreshFrame(runtime, {
          predictMovement: true
        });
        nextDebugRefreshAtMs = realtimeMs + DEBUG_REFRESH_INTERVAL_MS;
      }

      nextCommandSequence += 1;
    }
  };
}

/**
 * Category: New
 * Purpose: Create the local gameplay actor used to touch Quake II trigger volumes during the browser demo.
 *
 * Constraints:
 * - Must preserve the original player trigger hull dimensions.
 */
function createLocalGameplayPlayer(runtime: GameRuntime): GameEntity {
  const player = spawnGameEntity(runtime);
  player.classname = "player";
  player.client = true;
  player.health = 100;
  player.mins = [...PLAYER_TRIGGER_MINS];
  player.maxs = [...PLAYER_TRIGGER_MAXS];
  refreshEntitySpatialState(player);
  linkGameEntity(runtime, player);
  return player;
}

/**
 * Category: New
 * Purpose: Advance the local gameplay trigger runtime so presence-based map triggers can fire in the web demo.
 *
 * Constraints:
 * - Must run scheduled `think` callbacks before and after touch dispatch.
 * - Must keep the local player origin aligned with predicted movement.
 */
function advanceGameplayRuntime(
  gameplayRuntime: GameRuntime,
  realtimeMs: number,
  interpolationState: BrushModelInterpolationState
): void {
  const timeSeconds = realtimeMs / 1000;

  while ((gameplayRuntime.time + FRAMETIME) <= (timeSeconds + 0.0001)) {
    interpolationState.previousSnapshots = cloneBrushModelSnapshots(interpolationState.currentSnapshots);
    interpolationState.previousTime = interpolationState.currentTime;
    G_RunFrame(gameplayRuntime);
    interpolationState.currentSnapshots = buildBrushModelSnapshots(gameplayRuntime);
    interpolationState.currentTime = gameplayRuntime.time;
  }
}

/**
 * Category: New
 * Purpose: Keep the local gameplay player entity aligned with predicted movement after browser-side prediction.
 *
 * Constraints:
 * - Must update trigger touches after the authoritative pusher frame advance already happened.
 */
function updateGameplayRuntimePlayer(
  gameplayRuntime: GameRuntime,
  gameplayPlayer: GameEntity,
  runtime: ClientRuntime
): void {
  gameplayPlayer.origin = [...runtime.cl.predicted_origin];
  applyPredictedGameplayHull(gameplayPlayer, runtime.cl.predicted_pmove);
  refreshEntitySpatialState(gameplayPlayer);
  linkGameEntity(gameplayRuntime, gameplayPlayer);
  touchTriggerEntities(gameplayRuntime, gameplayPlayer);
}

/**
 * Category: New
 * Purpose: Snap the initial local player state onto a valid BSP position before the interactive loop starts.
 *
 * Constraints:
 * - Must use the same `pmove` collision callbacks as runtime prediction.
 */
function initializeSpawnPrediction(
  runtime: ClientRuntime,
  collision: {
    trace: (start: vec3_t, mins: vec3_t, maxs: vec3_t, end: vec3_t) => trace_t;
    pointcontents: (point: vec3_t) => number;
  },
  spawnOrigin: vec3_t
): void {
  const pm: pmove_t = {
    s: {
      ...runtime.cl.frame.playerstate.pmove,
      origin: [
        Math.trunc(spawnOrigin[0] * 8),
        Math.trunc(spawnOrigin[1] * 8),
        Math.trunc(spawnOrigin[2] * 8)
      ],
      velocity: [0, 0, 0],
      delta_angles: [...runtime.cl.frame.playerstate.pmove.delta_angles]
    },
    cmd: {
      msec: 16,
      buttons: 0,
      angles: [0, 0, 0],
      forwardmove: 0,
      sidemove: 0,
      upmove: 0,
      impulse: 0,
      lightlevel: 0
    },
    snapinitial: true,
    numtouch: 0,
    touchents: [],
    viewangles: [0, 0, 0],
    viewheight: 0,
    mins: [0, 0, 0],
    maxs: [0, 0, 0],
    groundentity: null,
    watertype: 0,
    waterlevel: 0,
    trace: collision.trace,
    pointcontents: collision.pointcontents
  };

  const context = createPmoveContext(pm);
  Pmove(context);

  runtime.cl.frame.playerstate.pmove = {
    pm_type: context.pm.s.pm_type,
    origin: [...context.pm.s.origin],
    velocity: [...context.pm.s.velocity],
    pm_flags: context.pm.s.pm_flags,
    pm_time: context.pm.s.pm_time,
    gravity: context.pm.s.gravity,
    delta_angles: [...context.pm.s.delta_angles]
  };
  runtime.cl.frame.playerstate.viewoffset = [0, 0, context.pm.viewheight];
  runtime.cl.predicted_pmove = {
    ...runtime.cl.frame.playerstate.pmove,
    origin: [...runtime.cl.frame.playerstate.pmove.origin],
    velocity: [...runtime.cl.frame.playerstate.pmove.velocity],
    delta_angles: [...runtime.cl.frame.playerstate.pmove.delta_angles]
  };
  runtime.cl.predicted_origin = [
    runtime.cl.frame.playerstate.pmove.origin[0] * 0.125,
    runtime.cl.frame.playerstate.pmove.origin[1] * 0.125,
    runtime.cl.frame.playerstate.pmove.origin[2] * 0.125
  ];
}

/**
 * Category: New
 * Purpose: Seed the browser-local client with minimal HUD stats so the web overlay can reflect the real screen snapshot path.
 *
 * Constraints:
 * - Must only touch current local bootstrap values until authoritative server stats exist.
 */
function initializeLocalHudState(runtime: ClientRuntime): void {
  runtime.cl.configstrings[CS_STATUSBAR] = LOCAL_SINGLE_STATUSBAR;
  runtime.cl.configstrings[CS_IMAGES + 1] = "i_health";
  runtime.cl.configstrings[CS_IMAGES + 2] = "a_shells";
  runtime.cl.configstrings[CS_IMAGES + 3] = "i_combatarmor";
  runtime.cl.configstrings[CS_IMAGES + 4] = "w_blaster";
  runtime.cl.configstrings[CS_ITEMS + 1] = "Blaster";
  runtime.cl.configstrings[CS_ITEMS + 2] = "Shotgun";
  runtime.cl.configstrings[CS_ITEMS + 3] = "Shells";
  runtime.cl.layout = LOCAL_SCOREBOARD_LAYOUT;
  runtime.cl.inventory[1] = 1;
  runtime.cl.inventory[2] = 1;
  runtime.cl.inventory[3] = 50;
  runtime.cl.playernum = 0;
  runtime.cl.clientinfo[0].name = "Player";
  runtime.cl.clientinfo[0].iconname = "players/male/grunt_i.pcx";
  runtime.cl.clientinfo[1].name = "Bitterman";
  runtime.cl.clientinfo[1].iconname = "players/male/major_i.pcx";
  runtime.cl.baseclientinfo.name = "Player";
  runtime.cl.baseclientinfo.iconname = "players/male/grunt_i.pcx";

  runtime.cl.frame.playerstate.stats[STAT_HEALTH_ICON] = 1;
  runtime.cl.frame.playerstate.stats[STAT_HEALTH] = 100;
  runtime.cl.frame.playerstate.stats[STAT_AMMO_ICON] = 2;
  runtime.cl.frame.playerstate.stats[STAT_AMMO] = 50;
  runtime.cl.frame.playerstate.stats[STAT_ARMOR_ICON] = 3;
  runtime.cl.frame.playerstate.stats[STAT_ARMOR] = 50;
  runtime.cl.frame.playerstate.stats[STAT_SELECTED_ICON] = 4;
  runtime.cl.frame.playerstate.stats[STAT_SELECTED_ITEM] = 1;
  runtime.cl.frame.playerstate.stats[STAT_PICKUP_ICON] = 0;
  runtime.cl.frame.playerstate.stats[STAT_PICKUP_STRING] = 0;
  runtime.cl.frame.playerstate.stats[STAT_TIMER_ICON] = 0;
  runtime.cl.frame.playerstate.stats[STAT_TIMER] = 0;
  runtime.cl.frame.playerstate.stats[STAT_FRAGS] = 0;
  runtime.cl.frame.playerstate.stats[STAT_LAYOUTS] = 0;
}

/**
 * Category: New
 * Purpose: Serialize the current local gameplay visual state into the client frame buffers used by the Quake II refresh path.
 *
 * Constraints:
 * - Must preserve stable entity numbering from the gameplay runtime.
 * - Must keep the client parse-entity ring coherent with the current frame metadata.
 * - Must only expose entities that are currently client-visible.
 */
function syncLocalGameplayFrame(runtime: ClientRuntime, gameplayRuntime: GameRuntime): void {
  syncLocalGameplayAssetConfigstrings(runtime, gameplayRuntime);

  const currentFrameServerframe = runtime.cl.frame.serverframe;
  const previousFrameServerframe = currentFrameServerframe - 1;
  const parseEntityMask = runtime.cl_parse_entities.length - 1;
  const visibleStates = collectVisibleGameplayEntityStates(gameplayRuntime);

  runtime.cl.frame.parse_entities = runtime.cl.parse_entities;
  runtime.cl.frame.num_entities = 0;

  for (const state of visibleStates) {
    const entity = runtime.cl_entities[state.number];
    const storedState = runtime.cl_parse_entities[runtime.cl.parse_entities & parseEntityMask];
    runtime.cl.parse_entities += 1;
    runtime.cl.frame.num_entities += 1;

    const needsNoLerpReset =
      state.modelindex !== entity.current.modelindex ||
      state.modelindex2 !== entity.current.modelindex2 ||
      state.modelindex3 !== entity.current.modelindex3 ||
      state.modelindex4 !== entity.current.modelindex4 ||
      Math.abs(state.origin[0] - entity.current.origin[0]) > 512 ||
      Math.abs(state.origin[1] - entity.current.origin[1]) > 512 ||
      Math.abs(state.origin[2] - entity.current.origin[2]) > 512;

    copyEntityState(state, storedState);

    if (needsNoLerpReset) {
      entity.serverframe = -99;
    }

    if (entity.serverframe !== previousFrameServerframe) {
      entity.trailcount = 1024;
      copyEntityState(storedState, entity.prev);
      entity.prev.origin = [...storedState.old_origin];
      entity.lerp_origin = [...storedState.old_origin];
    } else {
      copyEntityState(entity.current, entity.prev);
    }

    entity.serverframe = currentFrameServerframe;
    copyEntityState(storedState, entity.current);
    entity.current.event = 0;
  }
}

/**
 * Category: New
 * Purpose: Mirror the local gameplay asset registries into the client configstring slots consumed by refresh-side model resolution.
 *
 * Constraints:
 * - Must preserve Quake-style stable 1-based asset indices.
 * - Must clear stale configstrings when one local map/runtime registers fewer assets than the previous one.
 */
function syncLocalGameplayAssetConfigstrings(runtime: ClientRuntime, gameplayRuntime: GameRuntime): void {
  for (let index = 1; index < runtime.cl.model_draw.length; index += 1) {
    runtime.cl.configstrings[CS_MODELS + index] = gameplayRuntime.assets.modelPaths[index - 1] ?? "";
    runtime.cl.model_draw[index] = runtime.cl.configstrings[CS_MODELS + index] || null;
  }

  for (let index = 1; index < runtime.cl.sound_precache.length; index += 1) {
    runtime.cl.configstrings[CS_SOUNDS + index] = gameplayRuntime.assets.soundPaths[index - 1] ?? "";
    runtime.cl.sound_precache[index] = runtime.cl.configstrings[CS_SOUNDS + index] || null;
  }

  for (let index = 1; index < runtime.cl.image_precache.length; index += 1) {
    runtime.cl.configstrings[CS_IMAGES + index] = gameplayRuntime.assets.imagePaths[index - 1] ?? runtime.cl.configstrings[CS_IMAGES + index] ?? "";
    runtime.cl.image_precache[index] = runtime.cl.configstrings[CS_IMAGES + index] || null;
  }
}

/**
 * Category: New
 * Purpose: Collect the current gameplay entities that should surface through the client entity snapshot path.
 *
 * Constraints:
 * - Must skip non-client and free entities.
 * - Must clone states so the client ring keeps value semantics.
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
 * Purpose: Clone one entity state while preserving the exact field set used by Quake II packet entities.
 */
function cloneEntityState(state: entity_state_t): entity_state_t {
  const clone = createEntityState();
  copyEntityState(state, clone);
  return clone;
}

/**
 * Category: New
 * Purpose: Copy one entity-state payload field-by-field without sharing tuple references.
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
 * Purpose: Seed the browser-local client sky configstrings from the loaded BSP worldspawn metadata.
 *
 * Constraints:
 * - Must keep the structured client sky state aligned with the raw configstring slots.
 * - Must tolerate maps that omit sky rotation or axis fields.
 */
function initializeLocalSkyState(runtime: ClientRuntime, map: BspMap): void {
  const worldspawn = map.parsedEntities[0]?.properties ?? {};
  const skyName = worldspawn.sky ?? "";
  const skyRotate = worldspawn.skyrotate ?? "";
  const skyAxis = worldspawn.skyaxis ?? "";

  runtime.cl.configstrings[CS_SKY] = skyName;
  runtime.cl.configstrings[CS_SKYROTATE] = skyRotate;
  runtime.cl.configstrings[CS_SKYAXIS] = skyAxis;
  runtime.cl.sky.name = skyName;
  runtime.cl.sky.rotate = parseLocalSkyRotate(skyRotate);
  runtime.cl.sky.axis = parseLocalSkyAxis(skyAxis);
}

/**
 * Category: New
 * Purpose: Apply the current browser movement mode onto the predicted Quake II pmove state.
 *
 * Constraints:
 * - Must switch cleanly between `PM_NORMAL` and `PM_SPECTATOR`.
 * - Must keep the local frame and predicted state aligned before prediction runs.
 */
function applyMovementMode(runtime: ClientRuntime, ghostMode: boolean): void {
  const pmType = ghostMode ? pmtype_t.PM_SPECTATOR : pmtype_t.PM_NORMAL;
  runtime.cl.frame.playerstate.pmove.pm_type = pmType;
  runtime.cl.predicted_pmove.pm_type = pmType;
}

/**
 * Category: New
 * Purpose: Build the local collision adapter that reuses the gameplay collision bridge for browser-side prediction.
 *
 * Constraints:
 * - Must stay close to Quake II `CL_PMTrace` / `CL_PMpointcontents` behavior.
 * - Must consume the current transformed inline-model poses from the gameplay runtime.
 */
export function createLocalCollisionAdapter(
  gameplayRuntime: GameRuntime,
  gameplayPlayer: GameEntity | null
): {
  trace: (start: vec3_t, mins: vec3_t, maxs: vec3_t, end: vec3_t) => trace_t;
  pointcontents: (point: vec3_t) => number;
} {
  return {
    trace: (start, mins, maxs, end) => {
      if (!gameplayRuntime.collision) {
        throw new Error("createLocalCollisionAdapter requires gameplay collision bridge");
      }

      return gameplayRuntime.collision.trace(start, mins, maxs, end, gameplayPlayer, MASK_PLAYERSOLID);
    },
    pointcontents: (point) => {
      if (!gameplayRuntime.collision) {
        throw new Error("createLocalCollisionAdapter requires gameplay collision bridge");
      }

      return gameplayRuntime.collision.pointcontents(point, gameplayPlayer);
    }
  };
}

/**
 * Category: New
 * Purpose: Copy the newest predicted state back into the local frame so the browser demo can behave like a minimal standalone client.
 *
 * Constraints:
 * - Must keep the frame authoritative enough for the next local prediction step.
 */
function promotePredictedState(runtime: ClientRuntime, realtimeMs: number): void {
  runtime.cl.frame.valid = true;
  runtime.cl.frame.serverframe += 1;
  runtime.cl.frame.servertime = realtimeMs;
  runtime.cl.frame.playerstate.pmove = {
    pm_type: runtime.cl.predicted_pmove.pm_type,
    origin: [...runtime.cl.predicted_pmove.origin],
    velocity: [...runtime.cl.predicted_pmove.velocity],
    pm_flags: runtime.cl.predicted_pmove.pm_flags,
    pm_time: runtime.cl.predicted_pmove.pm_time,
    gravity: runtime.cl.predicted_pmove.gravity,
    delta_angles: [...runtime.cl.predicted_pmove.delta_angles]
  };
  runtime.cl.frame.playerstate.viewangles = [...runtime.cl.predicted_angles];
  runtime.cl.frame.playerstate.viewoffset = [0, 0, getPredictedViewheight(runtime.cl.predicted_pmove)];
}

/**
 * Category: New
 * Purpose: Set or clear one `STAT_LAYOUTS` bit inside the local bootstrap player-state stats.
 */
function setLayoutBit(runtime: ClientRuntime, bitMask: number, enabled: boolean): void {
  const current = runtime.cl.frame.playerstate.stats[STAT_LAYOUTS] ?? 0;
  runtime.cl.frame.playerstate.stats[STAT_LAYOUTS] = enabled ? (current | bitMask) : (current & ~bitMask);
}

/**
 * Category: New
 * Purpose: Toggle one `STAT_LAYOUTS` bit for the browser-local HUD demo controls.
 */
function toggleLayoutBit(runtime: ClientRuntime, bitMask: number): void {
  const current = runtime.cl.frame.playerstate.stats[STAT_LAYOUTS] ?? 0;
  runtime.cl.frame.playerstate.stats[STAT_LAYOUTS] = current ^ bitMask;
}

/**
 * Category: New
 * Purpose: Apply the predicted client eye position and angles to the active camera.
 *
 * Constraints:
 * - Must preserve the shared Z-up world convention.
 * - Must use the eye origin already produced by `CL_CalcViewValues`.
 */
function applyPredictedCamera(camera: PerspectiveCamera, runtime: ClientRuntime): void {
  CL_UpdateLerpFraction(runtime, { timedemo: false });
  const view = CL_CalcViewValues(runtime, { predictMovement: true });
  const eye = new Vector3(
    view.vieworg[0],
    view.vieworg[1],
    view.vieworg[2]
  );
  const vectors = AngleVectors(view.viewangles);
  const forward = new Vector3(vectors.forward[0], vectors.forward[1], vectors.forward[2]);
  const up = new Vector3(vectors.up[0], vectors.up[1], vectors.up[2]);

  camera.position.copy(eye);
  camera.up.copy(up);
  camera.lookAt(eye.clone().add(forward));
}

/**
 * Category: New
 * Purpose: Mirror browser key states into the ported Quake II button structures consumed by `CL_CreateCmd`.
 *
 * Constraints:
 * - Must preserve the held/released timing semantics closely enough for local prediction.
 */
function syncMovementButtons(
  context: ClientInputContext,
  pressedKeys: Record<MovementKey, boolean>,
  realtimeMs: number
): void {
  setButtonHeld(context.in_forward, pressedKeys.forward, realtimeMs);
  setButtonHeld(context.in_back, pressedKeys.backward, realtimeMs);
  setButtonHeld(context.in_moveleft, pressedKeys.left, realtimeMs);
  setButtonHeld(context.in_moveright, pressedKeys.right, realtimeMs);
  setButtonHeld(context.in_up, pressedKeys.up, realtimeMs);
  setButtonHeld(context.in_down, pressedKeys.down, realtimeMs);
}

/**
 * Category: New
 * Purpose: Apply one held/not-held boolean to a ported Quake II key button structure.
 *
 * Constraints:
 * - Must only emit transitions when the held state changes.
 */
function setButtonHeld(button: ClientInputContext["in_forward"], held: boolean, realtimeMs: number): void {
  const isDown = (button.state & 1) !== 0;
  if (held === isDown) {
    return;
  }

  if (held) {
    button.down[0] = 1;
    button.downtime = realtimeMs - 1;
    button.state |= 1 + 2;
    return;
  }

  button.down = [0, 0];
  button.msec += Math.max(1, realtimeMs - button.downtime);
  button.state &= ~1;
  button.state |= 4;
}

/**
 * Category: New
 * Purpose: Clear all browser movement states and their mirrored Quake button states after focus loss.
 *
 * Constraints:
 * - Must prevent sticky movement when the browser misses one keyup event.
 */
function clearMovementState(
  context: ClientInputContext,
  pressedKeys: Record<MovementKey, boolean>
): void {
  for (const key of Object.keys(pressedKeys) as MovementKey[]) {
    pressedKeys[key] = false;
  }

  resetButtonState(context.in_forward);
  resetButtonState(context.in_back);
  resetButtonState(context.in_moveleft);
  resetButtonState(context.in_moveright);
  resetButtonState(context.in_up);
  resetButtonState(context.in_down);
}

/**
 * Category: New
 * Purpose: Fully reset one mirrored Quake key button after an external focus interruption.
 *
 * Constraints:
 * - Must clear held and impulse bits together to avoid residual movement next frame.
 */
function resetButtonState(button: ClientInputContext["in_forward"]): void {
  button.down = [0, 0];
  button.downtime = 0;
  button.msec = 0;
  button.state = 0;
}

/**
 * Category: New
 * Purpose: Clone one command before storing it in the circular client command buffer.
 */
function cloneUsercmd(cmd: ClientRuntime["cl"]["cmd"]): ClientRuntime["cl"]["cmd"] {
  return {
    msec: cmd.msec,
    buttons: cmd.buttons,
    angles: [...cmd.angles],
    forwardmove: cmd.forwardmove,
    sidemove: cmd.sidemove,
    upmove: cmd.upmove,
    impulse: cmd.impulse,
    lightlevel: cmd.lightlevel
  };
}

/**
 * Category: New
 * Purpose: Extract the current inline brush model transforms from the local gameplay runtime.
 *
 * Constraints:
 * - Must only include active entities backed by BSP inline models.
 */
function buildBrushModelSnapshots(runtime: GameRuntime): BrushModelSnapshot[] {
  const snapshots: BrushModelSnapshot[] = [];

  for (const entity of runtime.entities) {
    if (!entity.inuse || !entity.model?.startsWith("*")) {
      continue;
    }

    snapshots.push({
      model: entity.model,
      origin: [...entity.origin],
      angles: [...entity.angles]
    });
  }

  return snapshots;
}

/**
 * Category: New
 * Purpose: Derive the predicted Quake II eye height from the current packed pmove state using the existing `PM_CheckDuck` rules.
 *
 * Constraints:
 * - Must preserve the standing and ducked viewheight values already ported in `pmove.ts`.
 */
function getPredictedViewheight(pmove: ClientRuntime["cl"]["predicted_pmove"]): number {
  return (pmove.pm_flags & PMF_DUCKED) !== 0 ? DUCKED_VIEWHEIGHT : DEFAULT_VIEWHEIGHT;
}

/**
 * Category: New
 * Purpose: Apply the predicted Quake II player hull to the local gameplay proxy so runtime collision and triggers use the same crouch state as prediction.
 *
 * Constraints:
 * - Must match the normal, ducked and gib bounds selected by `PM_CheckDuck`.
 */
function applyPredictedGameplayHull(
  gameplayPlayer: GameEntity,
  pmove: ClientRuntime["cl"]["predicted_pmove"]
): void {
  if (pmove.pm_type === pmtype_t.PM_GIB) {
    gameplayPlayer.mins = [...PLAYER_GIB_MINS];
    gameplayPlayer.maxs = [...PLAYER_GIB_MAXS];
    return;
  }

  gameplayPlayer.mins = [...PLAYER_TRIGGER_MINS];
  gameplayPlayer.maxs = (pmove.pm_flags & PMF_DUCKED) !== 0
    ? [...PLAYER_DUCKED_MAXS]
    : [...PLAYER_TRIGGER_MAXS];
}

/**
 * Category: New
 * Purpose: Create the initial brush-model interpolation state from the current gameplay runtime pose.
 *
 * Constraints:
 * - Must start with identical previous and current poses to avoid bootstrap pops.
 */
function createBrushModelInterpolationState(runtime: GameRuntime): BrushModelInterpolationState {
  const snapshots = buildBrushModelSnapshots(runtime);

  return {
    previousSnapshots: cloneBrushModelSnapshots(snapshots),
    currentSnapshots: cloneBrushModelSnapshots(snapshots),
    previousTime: runtime.time,
    currentTime: runtime.time
  };
}

/**
 * Category: New
 * Purpose: Interpolate the current brush-model render pose from the last two gameplay snapshots like the original Quake II client entity path.
 *
 * Constraints:
 * - Must linearly interpolate origins.
 * - Must use `LerpAngle` for angular interpolation.
 * - Must match the original client rule where interpolation progresses during the current server-frame window.
 */
function buildInterpolatedBrushModelSnapshots(
  interpolationState: BrushModelInterpolationState,
  renderTimeSeconds: number
): BrushModelSnapshot[] {
  const currentSnapshots = interpolationState.currentSnapshots;
  const previousByModel = new Map<string, BrushModelSnapshot>();

  for (const snapshot of interpolationState.previousSnapshots) {
    if (snapshot.model) {
      previousByModel.set(snapshot.model, snapshot);
    }
  }

  const lerpFraction = interpolationState.currentTime > interpolationState.previousTime
    ? clamp01((renderTimeSeconds - interpolationState.currentTime) / (interpolationState.currentTime - interpolationState.previousTime))
    : 1;

  return currentSnapshots.map((currentSnapshot) => {
    if (!currentSnapshot.model) {
      return cloneBrushModelSnapshot(currentSnapshot);
    }

    const previousSnapshot = previousByModel.get(currentSnapshot.model);
    if (!previousSnapshot) {
      return cloneBrushModelSnapshot(currentSnapshot);
    }

    return {
      model: currentSnapshot.model,
      origin: [
        lerpValue(previousSnapshot.origin[0], currentSnapshot.origin[0], lerpFraction),
        lerpValue(previousSnapshot.origin[1], currentSnapshot.origin[1], lerpFraction),
        lerpValue(previousSnapshot.origin[2], currentSnapshot.origin[2], lerpFraction)
      ],
      angles: [
        LerpAngle(previousSnapshot.angles[0], currentSnapshot.angles[0], lerpFraction),
        LerpAngle(previousSnapshot.angles[1], currentSnapshot.angles[1], lerpFraction),
        LerpAngle(previousSnapshot.angles[2], currentSnapshot.angles[2], lerpFraction)
      ]
    };
  });
}

/**
 * Category: New
 * Purpose: Clone one list of brush-model snapshots so interpolation state keeps value semantics across fixed frames.
 */
function cloneBrushModelSnapshots(snapshots: BrushModelSnapshot[]): BrushModelSnapshot[] {
  return snapshots.map(cloneBrushModelSnapshot);
}

/**
 * Category: New
 * Purpose: Clone one brush-model snapshot without sharing mutable tuple references.
 */
function cloneBrushModelSnapshot(snapshot: BrushModelSnapshot): BrushModelSnapshot {
  return {
    model: snapshot.model,
    origin: [...snapshot.origin],
    angles: [...snapshot.angles]
  };
}

/**
 * Category: New
 * Purpose: Interpolate one scalar with a clamped fraction.
 */
function lerpValue(previous: number, current: number, fraction: number): number {
  return previous + (current - previous) * fraction;
}

/**
 * Category: New
 * Purpose: Clamp one interpolation fraction to the inclusive `[0, 1]` interval.
 */
function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Category: New
 * Purpose: Parse one local BSP worldspawn `skyrotate` property into the browser-local client bootstrap state.
 *
 * Constraints:
 * - Must fall back to `0` when the property is absent or invalid.
 */
function parseLocalSkyRotate(value: string): number {
  const parsed = Number.parseFloat(value.trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Category: New
 * Purpose: Parse one local BSP worldspawn `skyaxis` property into a three-component axis tuple.
 *
 * Constraints:
 * - Must fall back to `[0, 0, 0]` when the property is absent or invalid.
 */
function parseLocalSkyAxis(value: string): [number, number, number] {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .map((part) => Number.parseFloat(part));

  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    return [0, 0, 0];
  }

  return [parts[0], parts[1], parts[2]];
}
