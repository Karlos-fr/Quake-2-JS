/**
 * File: full-game-command-bridge.ts
 * Purpose: Register the final-game command bridge used by `full-game.html`.
 *
 * This file is not a direct source port.
 * It is a web host bridge that keeps the source command chain intact while the local server/game runtime is being connected.
 *
 * Dependencies:
 * - packages/client
 * - packages/qcommon
 */

import type { ClientRuntime } from "../../../packages/client/src/client.js";
import {
  Cbuf_AddText,
  Cmd_AddCommand,
  Cmd_Argc,
  Cmd_Argv,
  Cmd_Exists,
  Cvar_ForceSet,
  type CommandRuntime,
  type CvarRuntime
} from "../../../packages/qcommon/src/index.js";

/**
 * Original name: N/A
 * Source: N/A (web host bridge)
 * Category: New
 * Purpose: Track the browser host phase while source-style commands bootstrap the final-game runtime.
 */
export type FullGameCommandBridgePhase = "idle" | "loading" | "newgame" | "gamemap" | "map";

/**
 * Original name: N/A
 * Source: N/A (web host bridge)
 * Category: New
 * Purpose: Store command bridge state shared between the command callbacks and the full-game frame loop.
 */
export interface FullGameCommandBridgeState {
  phase: FullGameCommandBridgePhase;
  requestedMap: string | null;
  transitions: string[];
  serverRunning: boolean;
}

/**
 * Original name: N/A
 * Source: N/A (web host bridge)
 * Category: New
 * Purpose: Expose host callbacks used to connect command execution to browser UI and local server setup.
 */
export interface FullGameCommandBridgeHooks {
  onPrint?: (message: string) => void;
  onBeginLoading?: () => void;
  onKillServer?: () => void;
  onMapRequested?: (map: string, source: "gamemap" | "map") => void;
}

/**
 * Original name: N/A
 * Source: N/A (web host bridge)
 * Category: New
 * Purpose: Create the zeroed browser-side command bridge state.
 */
export function createFullGameCommandBridgeState(): FullGameCommandBridgeState {
  return {
    phase: "idle",
    requestedMap: null,
    transitions: [],
    serverRunning: false
  };
}

/**
 * Original name: N/A
 * Source: N/A (web host bridge)
 * Category: New
 * Purpose: Register browser-host command shims until the authoritative server command ports own the full command path.
 *
 * Porting notes:
 * - Does not claim ownership of `SV_KillServer_f`, `SV_GameMap_f` or `SV_Map_f`; those remain in `packages/server`.
 */
export function registerFullGameCommandBridge(
  cmd: CommandRuntime,
  cvar: CvarRuntime,
  client: ClientRuntime,
  state: FullGameCommandBridgeState,
  hooks: FullGameCommandBridgeHooks = {}
): void {
  registerCommand(cmd, "killserver", () => {
    state.transitions.push("killserver");
    state.serverRunning = false;
    state.requestedMap = null;
    hooks.onKillServer?.();
    hooks.onPrint?.("Server shutdown.");
  });

  registerCommand(cmd, "newgame", () => {
    state.phase = "newgame";
    state.transitions.push("newgame");
    state.requestedMap = "*base1";
    Cvar_ForceSet(cvar, "deathmatch", "0");
    Cvar_ForceSet(cvar, "coop", "0");
    Cbuf_AddText(cmd, "gamemap \"*base1\"\n");
  });

  registerCommand(cmd, "gamemap", () => {
    if (Cmd_Argc(cmd) !== 2) {
      hooks.onPrint?.("USAGE: gamemap <map>");
      return;
    }

    const map = Cmd_Argv(cmd, 1);
    state.phase = "gamemap";
    state.requestedMap = map;
    state.serverRunning = true;
    state.transitions.push(`gamemap ${map}`);
    hooks.onMapRequested?.(map, "gamemap");
  });

  registerCommand(cmd, "map", () => {
    if (Cmd_Argc(cmd) !== 2) {
      hooks.onPrint?.("USAGE: map <map>");
      return;
    }

    const map = Cmd_Argv(cmd, 1);
    state.phase = "map";
    state.transitions.push(`map ${map}`);
    Cbuf_AddText(cmd, `gamemap "${map}"\n`);
    hooks.onMapRequested?.(map, "map");
  });
}

/**
 * Original name: N/A
 * Source: N/A (web host bridge)
 * Category: New
 * Purpose: Reflect a ported loading-plaque state into the web host bridge without owning `SCR_BeginLoadingPlaque`.
 */
export function syncFullGameLoadingState(
  client: ClientRuntime,
  state: FullGameCommandBridgeState,
  hooks: Pick<FullGameCommandBridgeHooks, "onBeginLoading" | "onPrint"> = {}
): boolean {
  if (client.cl.screen.scr_draw_loading === 0 || state.phase !== "idle") {
    return false;
  }

  state.phase = "loading";
  state.transitions.push("loading");
  hooks.onBeginLoading?.();
  hooks.onPrint?.("Loading plaque.");
  return true;
}

/**
 * Original name: N/A
 * Source: N/A (local helper)
 * Category: New
 * Purpose: Add a command callback only when the ported command runtime has no existing owner for that name.
 */
function registerCommand(runtime: CommandRuntime, name: string, handler: () => void): void {
  if (!Cmd_Exists(runtime, name)) {
    Cmd_AddCommand(runtime, name, handler);
  }
}
