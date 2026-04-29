/**
 * File: full-game-local-session.ts
 * Purpose: Keep the legacy level-A local-session harness for transitional demo/tests.
 *
 * This file is not a direct source port.
 * It is not part of the normal `full-game.html` gameplay path. The active path now
 * runs through the local authoritative server and loopback transport.
 *
 * Dependencies:
 * - packages/client
 * - packages/filesystem
 * - packages/formats
 * - packages/qcommon
 * - apps/web/src/local-collision-adapter.ts
 */

import {
  findPrimarySpawnPoint,
  parseBsp,
  type BspMap,
  type BspSpawnPoint
} from "../../../packages/formats/src/index.js";
import {
  readMountedFile,
  type VirtualFilesystem
} from "../../../packages/filesystem/src/index.js";
import {
  buildBrushModelSnapshots,
  buildInterpolatedBrushModelSnapshots,
  CL_BuildRefreshFrame,
  CL_BuildSkySnapshot,
  CL_CreateCmd,
  CL_PredictMovement,
  CL_SetInputFrameTime,
  cloneBrushModelSnapshots,
  initializeLocalClientSession,
  SCR_BuildScreenState,
  stepLocalClientSession,
  type BrushModelSnapshot,
  type ClientInputContext,
  type ClientRefreshFrame,
  type ClientRuntime,
  type ClientScreenHudState,
  type LocalClientSessionInputState,
  type LocalClientSessionState,
  type QuakeSkySnapshot
} from "../../../packages/client/src/index.js";
import {
  Cvar_VariableValue,
  STAT_LAYOUTS,
  type CvarRuntime
} from "../../../packages/qcommon/src/index.js";
import { type GameRuntime } from "../../../packages/game/src/index.js";
import { createLocalCollisionAdapter } from "./local-collision-adapter.js";

export interface FullGameLocalSession {
  runtime: ClientRuntime;
  mapName: string;
  mapPath: string;
  spawnpoint: string;
  map: BspMap;
  spawn: BspSpawnPoint | null;
  gameplayRuntime: GameRuntime;
  refreshFrame: ClientRefreshFrame;
  screenState: ClientScreenHudState;
  skySnapshot: QuakeSkySnapshot | null;
  getBrushModelSnapshots: () => BrushModelSnapshot[];
  getCvarValue: (name: string) => number;
  setScoreboardVisible: (visible: boolean) => void;
  toggleInventory: () => void;
  update: (deltaSeconds: number, consumeServerFrame?: () => boolean) => void;
}

export interface FullGameLocalSessionOptions {
  filesystem: VirtualFilesystem;
  client: ClientRuntime;
  inputContext: ClientInputContext;
  cvar: CvarRuntime;
  mapRequest: string;
}

export interface FullGameMapTarget {
  mapName: string;
  mapPath: string;
  spawnpoint: string;
}

export function createFullGameLocalSession(options: FullGameLocalSessionOptions): FullGameLocalSession {
  const target = resolveFullGameMapTarget(options.mapRequest);
  const bspFile = readMountedFile(options.filesystem, target.mapPath);
  if (!bspFile) {
    throw new Error(`Map introuvable: ${target.mapPath}`);
  }

  const map = parseBsp(bspFile.bytes, bspFile.path);
  const spawn = findPrimarySpawnPoint(map, target.spawnpoint);
  const session = initializeLocalClientSession(
    options.client,
    map,
    spawn,
    createLocalCollisionAdapter,
    {
      buildSnapshots: buildBrushModelSnapshots,
      cloneSnapshots: cloneBrushModelSnapshots
    },
    {
      demoInventory: false,
      ghostMode: false,
      refillDemoInventoryEachFrame: false
    }
  );
  session.realtimeMs = options.client.cls.realtime;
  const inputState = createIdleInputState();
  const collision = createLocalCollisionAdapter(session.gameplayRuntime, session.gameplayPlayer);
  const overlayState = {
    scoreboardVisible: false,
    inventoryVisible: false
  };
  let refreshFrame = buildRefreshFrame(options.client);
  applyFullGameOverlayBits(options.client, overlayState);

  return {
    runtime: options.client,
    mapName: target.mapName,
    mapPath: target.mapPath,
    spawnpoint: target.spawnpoint,
    map,
    spawn,
    gameplayRuntime: session.gameplayRuntime,
    get refreshFrame() {
      return refreshFrame;
    },
    get screenState() {
      return SCR_BuildScreenState(options.client, {
        paused: false,
        outgoingSequence: session.nextCommandSequence,
        incomingAcknowledged: session.nextCommandSequence - 1,
        commandBackup: 64
      });
    },
    get skySnapshot() {
      return CL_BuildSkySnapshot(options.client);
    },
    getBrushModelSnapshots: () => buildInterpolatedBrushModelSnapshots(
      session.brushModelInterpolation,
      session.realtimeMs / 1000
    ),
    getCvarValue: (name) => Cvar_VariableValue(options.cvar, name),
    setScoreboardVisible: (visible) => {
      overlayState.scoreboardVisible = visible;
      applyFullGameOverlayBits(options.client, overlayState);
    },
    toggleInventory: () => {
      overlayState.inventoryVisible = !overlayState.inventoryVisible;
      applyFullGameOverlayBits(options.client, overlayState);
    },
    update: (deltaSeconds, consumeServerFrame) => {
      stepFullGameLocalSession(options.client, options.inputContext, session, inputState, collision, deltaSeconds);
      consumeServerFrame?.();
      applyFullGameOverlayBits(options.client, overlayState);
      refreshFrame = buildRefreshFrame(options.client);
    }
  };
}

export function resolveFullGameMapTarget(mapRequest: string): FullGameMapTarget {
  const withoutQuotes = mapRequest.trim().replace(/^"+|"+$/g, "");
  const withoutLoadFlag = withoutQuotes.startsWith("*") ? withoutQuotes.slice(1) : withoutQuotes;
  const withoutNextServer = withoutLoadFlag.split("+", 1)[0] ?? withoutLoadFlag;
  const [rawMapName, rawSpawnpoint = ""] = withoutNextServer.split("$", 2);
  const mapName = (rawMapName || "base1").replace(/^maps\//, "").replace(/\.bsp$/i, "");
  const spawnpoint = rawSpawnpoint.trim();

  return {
    mapName,
    mapPath: `maps/${mapName}.bsp`,
    spawnpoint
  };
}

function stepFullGameLocalSession(
  client: ClientRuntime,
  inputContext: ClientInputContext,
  session: LocalClientSessionState<BrushModelSnapshot>,
  inputState: LocalClientSessionInputState,
  collision: ReturnType<typeof createLocalCollisionAdapter>,
  deltaSeconds: number
): void {
  client.cls.frametime = Math.max(0, Math.min(deltaSeconds, 0.05));
  stepLocalClientSession(
    client,
    inputContext,
    session,
    inputState,
    collision,
    (context, commandOptions) => {
      client.cls.realtime = session.realtimeMs;
      CL_SetInputFrameTime(context, session.realtimeMs);
      return CL_CreateCmd(context, commandOptions);
    },
    CL_PredictMovement,
    {
      buildSnapshots: buildBrushModelSnapshots,
      cloneSnapshots: cloneBrushModelSnapshots
    }
  );
}

function buildRefreshFrame(client: ClientRuntime): ClientRefreshFrame {
  return CL_BuildRefreshFrame(client, {
    predictMovement: true,
    drawGun: true
  });
}

function applyFullGameOverlayBits(
  client: ClientRuntime,
  state: { scoreboardVisible: boolean; inventoryVisible: boolean }
): void {
  let layouts = client.cl.frame.playerstate.stats[STAT_LAYOUTS] ?? 0;
  layouts = state.scoreboardVisible ? (layouts | 1) : (layouts & ~1);
  layouts = state.inventoryVisible ? (layouts | 2) : (layouts & ~2);
  client.cl.frame.playerstate.stats[STAT_LAYOUTS] = layouts;
}

function createIdleInputState(): LocalClientSessionInputState {
  return {
    pressedKeys: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false
    },
    attackPressed: false,
    useBoundInput: true
  };
}
