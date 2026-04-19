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
  type ClientRuntime
} from "../../../packages/client/src/index.js";
import {
  createGameRuntimeFromBspMap,
  initializeDoorPlanEntities,
  runGameFrames,
  spawnGameEntity,
  touchTriggerEntities,
  type GameEntity,
  type GameRuntime
} from "../../../packages/game/src/index.js";
import type { BrushModelSnapshot } from "../../../packages/renderer-three/src/index.js";
import {
  AngleVectors,
  CM_BoxTrace,
  CM_PointContents,
  CS_IMAGES,
  CS_ITEMS,
  CS_STATUSBAR,
  CS_AIRACCEL,
  MASK_PLAYERSOLID,
  PITCH,
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
  createCollisionPointContents,
  createCollisionTrace,
  createCollisionWorld,
  createCommandRuntime,
  createPmoveContext,
  createCvarRuntime,
  type pmove_t,
  type vec3_t
} from "../../../packages/qcommon/src/index.js";
import type { BspSpawnPoint, BspMap } from "../../../packages/formats/src/index.js";

const CAMERA_MOUSE_SENSITIVITY = 0.0022;
const DEFAULT_VIEWHEIGHT = 22;
const DEFAULT_SPAWN_LIFT = 24;
const PLAYER_TRIGGER_MINS: vec3_t = [-16, -16, -24];
const PLAYER_TRIGGER_MAXS: vec3_t = [16, 16, 32];
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
  getBrushModelSnapshots: () => BrushModelSnapshot[];
  update: (deltaSeconds: number) => void;
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

  const collisionWorld = createCollisionWorld(map);
  const collision = createLocalCollisionAdapter(collisionWorld, map);
  const gameplayRuntime = createGameRuntimeFromBspMap(map);
  initializeDoorPlanEntities(gameplayRuntime);
  const gameplayPlayer = createLocalGameplayPlayer(gameplayRuntime);

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

  let refreshFrame: ClientRefreshFrame | null = null;

  return {
    runtime,
    gameplayRuntime,
    get refreshFrame() {
      return refreshFrame;
    },
    get screenState() {
      return SCR_BuildScreenState(runtime, {
        paused: false,
        outgoingSequence: nextCommandSequence,
        incomingAcknowledged: nextCommandSequence - 1,
        commandBackup: 64
      });
    },
    getBrushModelSnapshots: () => buildBrushModelSnapshots(gameplayRuntime),
    update: (deltaSeconds) => {
      realtimeMs += deltaSeconds * 1000;
      runtime.cls.realtime = realtimeMs;
      runtime.cls.frametime = deltaSeconds;
      runtime.cl.time = realtimeMs;

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
      updateGameplayRuntime(gameplayRuntime, gameplayPlayer, runtime, realtimeMs);
      applyPredictedCamera(camera, runtime);
      refreshFrame = CL_BuildRefreshFrame(runtime, {
        predictMovement: true
      });
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
  player.size = [
    player.maxs[0] - player.mins[0],
    player.maxs[1] - player.mins[1],
    player.maxs[2] - player.mins[2]
  ];
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
function updateGameplayRuntime(
  gameplayRuntime: GameRuntime,
  gameplayPlayer: GameEntity,
  runtime: ClientRuntime,
  realtimeMs: number
): void {
  const timeSeconds = realtimeMs / 1000;
  runGameFrames(gameplayRuntime, timeSeconds, () => {
    gameplayPlayer.origin = [...runtime.cl.predicted_origin];
    touchTriggerEntities(gameplayRuntime, gameplayPlayer);
  });
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
    trace: (start: vec3_t, mins: vec3_t, maxs: vec3_t, end: vec3_t) => ReturnType<ReturnType<typeof createCollisionTrace>>;
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
 * Purpose: Build the local collision adapter that combines worldspawn and static BSP inline models for browser-side prediction.
 *
 * Constraints:
 * - Must stay close to Quake II `CL_PMTrace` / `CL_PMpointcontents` behavior.
 * - Current phase assumes BSP inline models stay at their compiled world transforms.
 */
function createLocalCollisionAdapter(
  world: ReturnType<typeof createCollisionWorld>,
  map: BspMap
): {
  trace: (start: vec3_t, mins: vec3_t, maxs: vec3_t, end: vec3_t) => ReturnType<ReturnType<typeof createCollisionTrace>>;
  pointcontents: (point: vec3_t) => number;
} {
  const worldTrace = createCollisionTrace(world, 0, MASK_PLAYERSOLID);
  const worldPointContents = createCollisionPointContents(world, 0);
  const inlineModels = map.parsedEntities
    .map((entity) => {
      const modelText = entity.properties.model;
      if (!modelText || !modelText.startsWith("*")) {
        return null;
      }

      const modelIndex = Number.parseInt(modelText.slice(1), 10);
      if (!Number.isFinite(modelIndex) || modelIndex <= 0 || modelIndex >= map.models.length) {
        return null;
      }

      return {
        entity,
        modelIndex,
        headnode: map.models[modelIndex].headnode
      };
    })
    .filter((value): value is { entity: BspMap["parsedEntities"][number]; modelIndex: number; headnode: number } => value !== null);

  return {
    trace: (start, mins, maxs, end) => {
      let bestTrace = worldTrace(start, mins, maxs, end);

      for (const inlineModel of inlineModels) {
        const trace = CM_BoxTrace(world, start, end, mins, maxs, inlineModel.headnode, MASK_PLAYERSOLID);
        if (trace.allsolid || trace.startsolid || trace.fraction < bestTrace.fraction) {
          trace.ent = inlineModel.entity;
          if (bestTrace.startsolid) {
            trace.startsolid = true;
          }
          bestTrace = trace;
        } else if (trace.startsolid) {
          bestTrace.startsolid = true;
        }
      }

      return bestTrace;
    },
    pointcontents: (point) => {
      let contents = worldPointContents(point);

      for (const inlineModel of inlineModels) {
        contents |= CM_PointContents(world, point, inlineModel.headnode);
      }

      return contents;
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
  runtime.cl.frame.playerstate.viewoffset = [0, 0, DEFAULT_VIEWHEIGHT];
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
