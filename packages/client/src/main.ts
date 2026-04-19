/**
 * File: main.ts
 * Source: Quake II original / client/cl_main.c
 * Purpose: Port the first client bootstrap, cvar initialization and console command bindings needed by the Quake II client runtime.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Defers networking, renderer, demo and audio shutdown side effects to hooks.
 * - Uses explicit runtime/context objects instead of file-static globals.
 *
 * Notes:
 * - This file is intended to stay conceptually close to the original C source.
 */

import {
  Cmd_AddCommand,
  Cmd_Argc,
  Cmd_Argv,
  Cvar_Get,
  Cvar_SetValue,
  CVAR_ARCHIVE,
  type CommandRuntime,
  type CvarRuntime,
  type cvar_t,
  CS_PLAYERSKINS,
  MAX_CLIENTS
} from "../../qcommon/src/index.js";
import { CL_Download_f, type ClientDownloadHooks } from "./download.js";
import { type ClientParseHooks, CL_ClearState, CL_ParseClientinfo, CL_WriteStringCmd } from "./parse.js";
import { type ClientRuntime, connstate_t } from "./types.js";

/**
 * Category: New
 * Purpose: Group the client runtime with the command and cvar runtimes it depends on for `cl_main.c` style initialization.
 *
 * Constraints:
 * - Must keep the three runtimes explicit to preserve incremental port traceability.
 */
export interface ClientMainContext {
  client: ClientRuntime;
  cmd: CommandRuntime;
  cvar: CvarRuntime;
  cl_predict: cvar_t | null;
  cl_showmiss: cvar_t | null;
  cl_showclamp: cvar_t | null;
  cl_paused: cvar_t | null;
  cl_timedemo: cvar_t | null;
  cl_vwep: cvar_t | null;
}

/**
 * Category: New
 * Purpose: Describe host-side callbacks used by the partial `cl_main.c` port.
 *
 * Constraints:
 * - Must keep the runtime testable without real network or renderer shutdown code.
 */
export interface ClientMainHooks extends ClientParseHooks {
  fileExists?: ClientDownloadHooks["fileExists"];
  getPartialDownloadSize?: ClientDownloadHooks["getPartialDownloadSize"];
  onDisconnect?: () => void;
  onPrint?: (line: string) => void;
  onQuit?: () => void;
}

/**
 * Category: New
 * Purpose: Create the composite context used by the ported `cl_main.c` subset.
 *
 * Constraints:
 * - Must start with unresolved cvar references before `CL_InitLocal`.
 */
export function createClientMainContext(client: ClientRuntime, cmd: CommandRuntime, cvar: CvarRuntime): ClientMainContext {
  return {
    client,
    cmd,
    cvar,
    cl_predict: null,
    cl_showmiss: null,
    cl_showclamp: null,
    cl_paused: null,
    cl_timedemo: null,
    cl_vwep: null
  };
}

/**
 * Original name: CL_Skins_f
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Rebuilds parsed clientinfo data for every active player skin configstring.
 *
 * Porting notes:
 * - Reuses the ported `CL_ParseClientinfo` hook-based path instead of renderer registration.
 */
export function CL_Skins_f(context: ClientMainContext, hooks: ClientMainHooks = {}): number {
  let count = 0;

  for (let index = 0; index < MAX_CLIENTS; index += 1) {
    if (!context.client.cl.configstrings[CS_PLAYERSKINS + index]) {
      continue;
    }

    CL_ParseClientinfo(context.client, index, hooks);
    count += 1;
  }

  return count;
}

/**
 * Original name: CL_Disconnect
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Drops the current client connection state and clears level-scoped client data.
 *
 * Porting notes:
 * - Leaves demo/netchan shutdown and cinematic teardown to future hooks.
 */
export function CL_Disconnect(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  context.client.cls.state = connstate_t.ca_disconnected;
  context.client.cls.connect_time = 0;
  context.client.cls.downloadname = "";
  context.client.cls.downloadtempname = "";
  context.client.cls.downloadnumber = 0;
  context.client.cls.downloadpercent = 0;
  context.client.cls.demorecording = false;
  context.client.cls.demowaiting = false;

  CL_ClearState(context.client);
  hooks.onDisconnect?.();
}

/**
 * Original name: CL_Disconnect_f
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Console-facing wrapper around `CL_Disconnect`.
 *
 * Porting notes:
 * - Reuses the shared disconnect implementation directly.
 */
export function CL_Disconnect_f(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  CL_Disconnect(context, hooks);
}

/**
 * Original name: CL_Quit_f
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Disconnects the client and requests host shutdown.
 *
 * Porting notes:
 * - Uses a hook instead of calling host-wide shutdown APIs directly.
 */
export function CL_Quit_f(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  CL_Disconnect(context, hooks);
  hooks.onQuit?.();
}

/**
 * Original name: CL_InitLocal
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Registers the first client-side cvars and console commands needed by the local client runtime.
 *
 * Porting notes:
 * - Focuses on the cvars already consumed by the current client ports.
 */
export function CL_InitLocal(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  const downloadHooks: ClientDownloadHooks = {
    ...(hooks.fileExists ? { fileExists: hooks.fileExists } : {}),
    ...(hooks.getPartialDownloadSize ? { getPartialDownloadSize: hooks.getPartialDownloadSize } : {}),
    ...(hooks.onPrint ? { onPrint: hooks.onPrint } : {})
  };

  context.cl_predict = Cvar_Get(context.cvar, "cl_predict", "1", 0);
  context.cl_showmiss = Cvar_Get(context.cvar, "cl_showmiss", "0", 0);
  context.cl_showclamp = Cvar_Get(context.cvar, "cl_showclamp", "0", 0);
  context.cl_paused = Cvar_Get(context.cvar, "paused", "0", 0);
  context.cl_timedemo = Cvar_Get(context.cvar, "timedemo", "0", 0);
  context.cl_vwep = Cvar_Get(context.cvar, "cl_vwep", "1", CVAR_ARCHIVE);

  Cmd_AddCommand(context.cmd, "skins", () => {
    CL_Skins_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "disconnect", () => {
    CL_Disconnect_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "download", () => {
    CL_Download_f(context.client, context.cmd, downloadHooks);
  });
  Cmd_AddCommand(context.cmd, "quit", () => {
    CL_Quit_f(context, hooks);
  });
}

/**
 * Category: New
 * Purpose: Forward the current command line to the server-side string command channel.
 *
 * Constraints:
 * - Must preserve the original no-forward behavior when the client is not connected.
 */
export function CL_ForwardToServer_f(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  if (context.client.cls.state !== connstate_t.ca_connected && context.client.cls.state !== connstate_t.ca_active) {
    hooks.onPrint?.(`Can't "${Cmd_Argv(context.cmd, 0)}", not connected`);
    return;
  }

  if (Cmd_Argc(context.cmd) > 1) {
    CL_WriteStringCmd(context.client, Cmd_Argv(context.cmd, 1) ? context.cmd.cmd_args : "");
  }
}

/**
 * Category: New
 * Purpose: Toggle the paused cvar using the same value-flip behavior as the original pause command path.
 *
 * Constraints:
 * - Must no-op safely if `CL_InitLocal` has not yet resolved `cl_paused`.
 */
export function CL_TogglePause(context: ClientMainContext): void {
  if (!context.cl_paused) {
    return;
  }

  Cvar_SetValue(context.cvar, "paused", context.cl_paused.value ? 0 : 1);
}
