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

/**
 * Original name: N/A
 * Source: N/A (legacy web adapter)
 * Category: New
 * Purpose: Expose the browser-only legacy local-session harness used by transitional demo/tests.
 *
 * Constraints:
 * - Must stay out of the active `full-game.html` authoritative gameplay path.
 * - Must consume ported client/game/runtime state instead of replacing it with web-only gameplay.
 */
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

/**
 * Original name: N/A
 * Source: N/A (legacy web adapter)
 * Category: New
 * Purpose: Describe the dependencies required to build the legacy local-session adapter.
 *
 * Constraints:
 * - Must receive already-initialized ported runtimes from the caller.
 */
export interface FullGameLocalSessionOptions {
  filesystem: VirtualFilesystem;
  client: ClientRuntime;
  inputContext: ClientInputContext;
  cvar: CvarRuntime;
  mapRequest: string;
}

/**
 * Original name: N/A
 * Source: N/A (legacy web adapter)
 * Category: New
 * Purpose: Normalize a full-game map request into the BSP path and spawnpoint used by the legacy adapter.
 *
 * Constraints:
 * - Must remain a web adapter contract, not the authoritative server map-selection owner.
 */
export interface FullGameMapTarget {
  mapName: string;
  mapPath: string;
  spawnpoint: string;
}

/**
 * Original name: N/A
 * Source: N/A (legacy web adapter)
 * Category: New
 * Purpose: Build the browser-only legacy local-session harness from ported client/game runtime pieces.
 *
 * Constraints:
 * - Must not be imported by the active authoritative `full-game.html` path.
 * - Must leave map parsing, client frame construction and gameplay stepping to the ported packages.
 */
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

/**
 * Original name: N/A
 * Source: N/A (legacy web adapter)
 * Category: New
 * Purpose: Convert legacy full-game map requests into a map name, BSP path and spawnpoint tuple.
 *
 * Constraints:
 * - Must stay a request normalizer for the legacy harness, not the server-side map command owner.
 */
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

/**
 * Original name: N/A
 * Source: N/A (legacy web adapter)
 * Category: New
 * Purpose: Advance the legacy local-session harness through the ported local client-session runtime.
 *
 * Constraints:
 * - Must route command creation and prediction through client package APIs.
 */
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

/**
 * Original name: N/A
 * Source: N/A (legacy web adapter)
 * Category: New
 * Purpose: Build the current refresh frame exposed by the legacy web session.
 *
 * Constraints:
 * - Must delegate refresh-frame construction to the ported client package.
 */
function buildRefreshFrame(client: ClientRuntime): ClientRefreshFrame {
  return CL_BuildRefreshFrame(client, {
    predictMovement: true,
    drawGun: true
  });
}

/**
 * Original name: N/A
 * Source: N/A (legacy web adapter)
 * Category: New
 * Purpose: Project legacy web scoreboard and inventory toggles onto the Quake II layout stat bits.
 *
 * Constraints:
 * - Must only toggle the overlay bits owned by the web harness state.
 */
function applyFullGameOverlayBits(
  client: ClientRuntime,
  state: { scoreboardVisible: boolean; inventoryVisible: boolean }
): void {
  let layouts = client.cl.frame.playerstate.stats[STAT_LAYOUTS] ?? 0;
  layouts = state.scoreboardVisible ? (layouts | 1) : (layouts & ~1);
  layouts = state.inventoryVisible ? (layouts | 2) : (layouts & ~2);
  client.cl.frame.playerstate.stats[STAT_LAYOUTS] = layouts;
}

/**
 * Original name: N/A
 * Source: N/A (legacy web adapter)
 * Category: New
 * Purpose: Seed the legacy local-session harness with neutral input while bound client input drives commands.
 *
 * Constraints:
 * - Must not reintroduce demo-only movement defaults.
 */
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
