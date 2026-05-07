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
  applyLocalMovementMode,
  buildBrushModelSnapshots,
  buildInterpolatedBrushModelSnapshots,
  buildLocalPredictedViewState,
  CL_BuildRefreshFrame,
  CL_BuildSkySnapshot,
  CL_CreateCmd,
  CL_InitInput,
  CL_InitLocal,
  CL_PredictMovement,
  SCR_BuildScreenState,
  SCR_CenterPrint,
  CL_SetInputFrameTime,
  clearLocalMovementState,
  cloneBrushModelSnapshots,
  createClientViewContext,
  createClientInputContext,
  createClientMainContext,
  createClientRuntime,
  initializeLocalClientSession,
  setLocalLayoutBit,
  stepLocalClientSession,
  toggleLocalLayoutBit,
  type BrushModelSnapshot,
  type ClientRefreshFrame,
  type LocalClientSessionInputState,
  type ClientScreenHudState,
  type ClientRuntime,
  V_Init,
  type QuakeSkySnapshot
} from "../../../packages/client/src/index.js";
import {
  LOCAL_WEAPON_SLOTS,
  drainGameCenterprintEvents,
  drainGameSoundEvents,
  selectLocalDemoWeapon,
  type GameSoundEvent,
  type GameRuntime
} from "../../../packages/game/src/index.js";
import {
  AngleVectors,
  CVAR_ARCHIVE,
  Cvar_Get,
  Cvar_SetValue,
  Cvar_VariableValue,
  PITCH,
  STAT_SELECTED_ITEM,
  YAW,
  createCommandRuntime,
  createCvarRuntime,
} from "../../../packages/qcommon/src/index.js";
import type { BspSpawnPoint, BspMap } from "../../../packages/formats/src/index.js";
import { createLocalCollisionAdapter } from "./local-collision-adapter.js";
const CAMERA_MOUSE_SENSITIVITY = 0.0022;
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
  getCvarValue: (name: string) => number;
  resolveSoundPath: (soundIndex: number) => string | null;
  drainLocalGameplaySounds: () => GameSoundEvent[];
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
  const viewContext = createClientViewContext(runtime, cmdRuntime, cvarRuntime);
  V_Init(viewContext);
  Cvar_SetValue(cvarRuntime, "crosshair", 1);
  Cvar_Get(cvarRuntime, "vid_gamma", "1", CVAR_ARCHIVE);
  Cvar_Get(cvarRuntime, "intensity", "2", 0);
  Cvar_Get(cvarRuntime, "gl_polyblend", "1", 0);
  Cvar_Get(cvarRuntime, "gl_shadows", "0", CVAR_ARCHIVE);

  const inputContext = createClientInputContext(runtime, cmdRuntime, cvarRuntime);
  CL_InitInput(inputContext);

  const inputState: LocalClientSessionInputState = {
    pressedKeys: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false
    },
    attackPressed: false
  };
  let pointerLocked = false;
  const session = initializeLocalClientSession(runtime, map, spawn, createLocalCollisionAdapter, {
    buildSnapshots: buildBrushModelSnapshots,
    cloneSnapshots: cloneBrushModelSnapshots
  });
  const { gameplayRuntime, gameplayPlayer, brushModelInterpolation } = session;
  const collision = createLocalCollisionAdapter(gameplayRuntime, gameplayPlayer);

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
      clearLocalMovementState(inputContext, inputState.pressedKeys);
    }
  });

  document.addEventListener("mousemove", (event) => {
    if (!pointerLocked) {
      return;
    }

    runtime.cl.viewangles[YAW] -= event.movementX * CAMERA_MOUSE_SENSITIVITY * 180 / Math.PI;
    runtime.cl.viewangles[PITCH] += event.movementY * CAMERA_MOUSE_SENSITIVITY * 180 / Math.PI;
    runtime.cl.viewangles[PITCH] = Math.max(-89, Math.min(89, runtime.cl.viewangles[PITCH]));
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Tab") {
      setLocalLayoutBit(runtime, 1, true);
      event.preventDefault();
      return;
    }

    if (event.key.toLowerCase() === "i") {
      toggleLocalLayoutBit(runtime, 2);
      event.preventDefault();
      return;
    }

    if (event.code in LOCAL_WEAPON_SLOTS) {
      const selectedIndex = selectLocalDemoWeapon(
        gameplayPlayer,
        LOCAL_WEAPON_SLOTS[event.code as keyof typeof LOCAL_WEAPON_SLOTS],
        gameplayRuntime
      );
      if (selectedIndex !== null) {
        runtime.cl.frame.playerstate.stats[STAT_SELECTED_ITEM] = selectedIndex;
      }
      event.preventDefault();
      return;
    }

    const binding = codeBindings[event.code] ?? keyBindings[event.key.toLowerCase()];
    if (!binding) {
      return;
    }

    inputState.pressedKeys[binding] = true;
    event.preventDefault();
  });

  window.addEventListener("keyup", (event) => {
    if (event.code === "Tab") {
      setLocalLayoutBit(runtime, 1, false);
      event.preventDefault();
      return;
    }

    const binding = codeBindings[event.code] ?? keyBindings[event.key.toLowerCase()];
    if (!binding) {
      return;
    }

    inputState.pressedKeys[binding] = false;
    event.preventDefault();
  });

  window.addEventListener("mousedown", (event) => {
    if (event.button !== 0) {
      return;
    }

    inputState.attackPressed = true;
    event.preventDefault();
  });

  window.addEventListener("mouseup", (event) => {
    if (event.button !== 0) {
      return;
    }

    inputState.attackPressed = false;
    event.preventDefault();
  });

  window.addEventListener("blur", () => {
    clearLocalMovementState(inputContext, inputState.pressedKeys);
    inputState.attackPressed = false;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
      clearLocalMovementState(inputContext, inputState.pressedKeys);
      inputState.attackPressed = false;
    }
  });

  let refreshFrame: ClientRefreshFrame | null = buildLocalRefreshFrame();

  return {
    runtime,
    gameplayRuntime,
    get refreshFrame() {
      return refreshFrame;
    },
    get ghostMode() {
      return session.ghostMode;
    },
    get screenState() {
      return SCR_BuildScreenState(runtime, {
        paused: false,
        outgoingSequence: session.nextCommandSequence,
        incomingAcknowledged: session.nextCommandSequence - 1,
        commandBackup: 64
      });
    },
    get skySnapshot() {
      return CL_BuildSkySnapshot(runtime);
    },
    getBrushModelSnapshots: () => buildInterpolatedBrushModelSnapshots(brushModelInterpolation, session.realtimeMs / 1000),
    getCvarValue: (name) => Cvar_VariableValue(cvarRuntime, name),
    resolveSoundPath: (soundIndex) => gameplayRuntime.assets.soundPaths[soundIndex - 1] ?? null,
    drainLocalGameplaySounds: () => drainGameSoundEvents(gameplayRuntime),
    setGhostMode: (enabled) => {
      session.ghostMode = enabled;
      applyLocalMovementMode(runtime, session.ghostMode);
    },
    update: (deltaSeconds) => {
      runtime.cls.frametime = deltaSeconds;
      stepLocalClientSession(
        runtime,
        inputContext,
        session,
        inputState,
        collision,
        (context, options) => {
          runtime.cls.realtime = session.realtimeMs;
          CL_SetInputFrameTime(context, session.realtimeMs);
          return CL_CreateCmd(context, options);
        },
        CL_PredictMovement,
        {
          buildSnapshots: buildBrushModelSnapshots,
          cloneSnapshots: cloneBrushModelSnapshots
        }
      );
      for (const event of drainGameCenterprintEvents(gameplayRuntime)) {
        SCR_CenterPrint(runtime, event.message);
      }
      applyPredictedCamera(camera, runtime);

      refreshFrame = buildLocalRefreshFrame();
    }
  };

  function buildLocalRefreshFrame(): ClientRefreshFrame {
    return CL_BuildRefreshFrame(runtime, {
      predictMovement: true,
      drawGun: (viewContext.cl_gun?.value ?? 1) !== 0,
      gunFrameOverride: viewContext.debug.gun_frame,
      gunModelOverride: viewContext.debug.gun_model
    });
  }
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
  const view = buildLocalPredictedViewState(runtime);
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
