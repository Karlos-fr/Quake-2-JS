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
  Cmd_Args,
  Cmd_Argv,
  Cvar_Get,
  Cvar_Userinfo,
  Cvar_VariableString,
  Cvar_VariableValue,
  Cvar_SetValue,
  CVAR_NOSET,
  CVAR_ARCHIVE,
  Info_Print,
  PROTOCOL_VERSION,
  type CommandRuntime,
  type CvarRuntime,
  type cvar_t,
  CS_PLAYERSKINS,
  MAX_CLIENTS
} from "../../qcommon/src/index.js";
import { CL_Download_f, type ClientDownloadHooks } from "./download.js";
import { CL_Precache_f, type ClientPrecacheHooks } from "./precache.js";
import { type ClientParseHooks, CL_ClearState, CL_ParseClientinfo, CL_WriteStringCmd } from "./parse.js";
import { CL_RegisterSounds, type ClientSoundRegistrationHooks } from "./sound.js";
import { createClientPrecacheState, type ClientRuntime, connstate_t } from "./types.js";

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
  rcon_client_password: cvar_t | null;
  rcon_address: cvar_t | null;
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
  allowDownload?: ClientPrecacheHooks["allowDownload"];
  allowDownloadMaps?: ClientPrecacheHooks["allowDownloadMaps"];
  allowDownloadModels?: ClientPrecacheHooks["allowDownloadModels"];
  allowDownloadPlayers?: ClientPrecacheHooks["allowDownloadPlayers"];
  allowDownloadSounds?: ClientPrecacheHooks["allowDownloadSounds"];
  loadBinaryFile?: ClientPrecacheHooks["loadBinaryFile"];
  getMapInfo?: ClientPrecacheHooks["getMapInfo"];
  environment?: Record<string, string>;
  isDownloading?: () => boolean;
  onDisconnect?: () => void;
  onBegin?: ClientPrecacheHooks["onBegin"];
  onBeginLoadingPlaque?: () => void;
  onEnableRemoteNetworking?: () => void;
  onPingServer?: (message: string, destination: string, kind: "broadcast" | "broadcast_ipx" | "addressbook") => void;
  onSendRcon?: (message: string, destination: string) => void;
  onServerConnectRequest?: (servername: string) => void;
  onPrepRefresh?: ClientPrecacheHooks["onPrepRefresh"];
  onPrint?: (line: string) => void;
  onQuit?: () => void;
  onBeginSoundRegistration?: ClientSoundRegistrationHooks["onBeginRegistration"];
  onRegisterSounds?: ClientPrecacheHooks["onRegisterSounds"];
  onRegisterSound?: ClientSoundRegistrationHooks["onRegisterSound"];
  onEndSoundRegistration?: ClientSoundRegistrationHooks["onEndRegistration"];
  onSoundInit?: () => void;
  onSoundShutdown?: () => void;
  onStopAllSounds?: () => void;
  onShutdownLocalServer?: () => void;
  onPumpEvents?: ClientSoundRegistrationHooks["onPumpEvents"];
  validateAddressString?: (value: string) => boolean;
  serverRunning?: () => boolean;
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
    cl_vwep: null,
    rcon_client_password: null,
    rcon_address: null
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
  context.client.cls.precache = createClientPrecacheState();

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
 * Original name: CL_Connect_f
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Starts a new client connection attempt toward the requested server.
 *
 * Porting notes:
 * - Defers local-server shutdown and network enabling to hooks.
 * - Preserves the immediate resend timing by setting `connect_time` to `-99999`.
 */
export function CL_Connect_f(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  if (Cmd_Argc(context.cmd) !== 2) {
    hooks.onPrint?.("usage: connect <server>");
    return;
  }

  if (hooks.serverRunning?.() === true) {
    hooks.onShutdownLocalServer?.();
  } else {
    CL_Disconnect(context, hooks);
  }

  const server = Cmd_Argv(context.cmd, 1);
  hooks.onEnableRemoteNetworking?.();

  CL_Disconnect(context, hooks);

  context.client.cls.state = connstate_t.ca_connecting;
  context.client.cls.servername = server;
  context.client.cls.connect_time = -99999;
  hooks.onServerConnectRequest?.(server);
}

/**
 * Original name: CL_Rcon_f
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Builds and sends one remote-console command as an out-of-band packet.
 *
 * Porting notes:
 * - Defers actual packet transport and address parsing to hooks.
 * - Uses the current `rcon_password` and `rcon_address` cvars from the client cvar runtime.
 */
export function CL_Rcon_f(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  const password = Cvar_VariableString(context.cvar, "rcon_password");
  if (password.length === 0) {
    hooks.onPrint?.("You must set 'rcon_password' before\nissuing an rcon command.");
    return;
  }

  hooks.onEnableRemoteNetworking?.();

  const parts = ["rcon", password];
  for (let index = 1; index < Cmd_Argc(context.cmd); index += 1) {
    parts.push(Cmd_Argv(context.cmd, index));
  }
  const message = `\xff\xff\xff\xff${parts.join(" ")} `;

  let destination = "";
  if (context.client.cls.state >= connstate_t.ca_connected) {
    destination = context.client.cls.servername;
  } else {
    destination = Cvar_VariableString(context.cvar, "rcon_address");
    if (destination.length === 0) {
      hooks.onPrint?.("You must either be connected,\nor set the 'rcon_address' cvar\nto issue rcon commands");
      return;
    }
  }

  hooks.onSendRcon?.(message, destination);
}

/**
 * Original name: CL_PingServers_f
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Broadcasts Quake II `info` probes and pings every populated address-book entry.
 *
 * Porting notes:
 * - Defers actual packet emission and address validation to hooks.
 * - Recreates the original `noudp`, `noipx` and `adr0..adr15` cvar usage locally.
 */
export function CL_PingServers_f(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  hooks.onEnableRemoteNetworking?.();
  hooks.onPrint?.("pinging broadcast...");

  const noudp = Cvar_Get(context.cvar, "noudp", "0", CVAR_NOSET);
  if (!noudp?.value) {
    hooks.onPingServer?.(`info ${PROTOCOL_VERSION}`, "broadcast", "broadcast");
  }

  const noipx = Cvar_Get(context.cvar, "noipx", "0", CVAR_NOSET);
  if (!noipx?.value) {
    hooks.onPingServer?.(`info ${PROTOCOL_VERSION}`, "broadcast_ipx", "broadcast_ipx");
  }

  for (let index = 0; index < 16; index += 1) {
    const cvarName = `adr${index}`;
    const address = Cvar_VariableString(context.cvar, cvarName);
    if (address.length === 0) {
      continue;
    }

    hooks.onPrint?.(`pinging ${address}...`);
    if (hooks.validateAddressString?.(address) === false) {
      hooks.onPrint?.(`Bad address: ${address}`);
      continue;
    }

    hooks.onPingServer?.(`info ${PROTOCOL_VERSION}`, address, "addressbook");
  }
}

/**
 * Original name: CL_Userinfo_f
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Prints the current Quake II userinfo string in a readable key/value layout.
 *
 * Porting notes:
 * - Reuses the ported `Cvar_Userinfo` and `Info_Print` helpers.
 */
export function CL_Userinfo_f(context: ClientMainContext, hooks: ClientMainHooks = {}): string[] {
  const lines = ["User info settings:", ...Info_Print(Cvar_Userinfo(context.cvar))];
  for (const line of lines) {
    hooks.onPrint?.(line);
  }
  return lines;
}

/**
 * Original name: Cmd_ForwardToServer
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Forwards the full current command line to the server string-command channel.
 *
 * Porting notes:
 * - Keeps the original early rejection for local-only `+` and `-` commands.
 */
export function Cmd_ForwardToServer(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  const command = Cmd_Argv(context.cmd, 0);
  if (context.client.cls.state <= connstate_t.ca_connected || command.startsWith("-") || command.startsWith("+")) {
    hooks.onPrint?.(`Unknown command "${command}"`);
    return;
  }

  let text = command;
  const args = Cmd_Args(context.cmd);
  if (args.length > 0) {
    text += ` ${args}`;
  }

  CL_WriteStringCmd(context.client, text);
}

/**
 * Original name: CL_Setenv_f
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Sets or prints one environment variable from the console command path.
 *
 * Porting notes:
 * - Uses a hook-owned environment dictionary instead of process-wide `putenv`.
 */
export function CL_Setenv_f(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  const argc = Cmd_Argc(context.cmd);

  if (argc > 2) {
    const key = Cmd_Argv(context.cmd, 1);
    const parts: string[] = [];
    for (let index = 2; index < argc; index += 1) {
      parts.push(Cmd_Argv(context.cmd, index));
    }

    if (hooks.environment) {
      hooks.environment[key] = `${parts.join(" ")} `;
    }
    return;
  }

  if (argc === 2) {
    const key = Cmd_Argv(context.cmd, 1);
    const value = hooks.environment?.[key];
    if (value !== undefined) {
      hooks.onPrint?.(`${key}=${value}`);
    } else {
      hooks.onPrint?.(`${key} undefined`);
    }
  }
}

/**
 * Original name: CL_Changing_f
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Moves the client back to a loading/connected state during a server map change.
 *
 * Porting notes:
 * - Defers the loading-plaque UI effect to a host hook.
 */
export function CL_Changing_f(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  if (hooks.isDownloading?.() === true) {
    return;
  }

  hooks.onBeginLoadingPlaque?.();
  context.client.cls.state = connstate_t.ca_connected;
  hooks.onPrint?.("\nChanging map...");
}

/**
 * Original name: CL_Snd_Restart_f
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Restarts the sound subsystem and then re-registers client sounds.
 *
 * Porting notes:
 * - Defers concrete sound backend shutdown/init to hooks.
 */
export function CL_Snd_Restart_f(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  hooks.onSoundShutdown?.();
  hooks.onSoundInit?.();
  CL_RegisterSounds(context.client, {
    ...(hooks.onBeginSoundRegistration ? { onBeginRegistration: hooks.onBeginSoundRegistration } : {}),
    ...(hooks.onRegisterSound ? { onRegisterSound: hooks.onRegisterSound } : {}),
    ...(hooks.onEndSoundRegistration ? { onEndRegistration: hooks.onEndSoundRegistration } : {}),
    ...(hooks.onPumpEvents ? { onPumpEvents: hooks.onPumpEvents } : {})
  });
  hooks.onRegisterSounds?.();
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
  const precacheHooks: ClientPrecacheHooks = {
    ...downloadHooks,
    ...(hooks.allowDownload !== undefined ? { allowDownload: hooks.allowDownload } : {}),
    ...(hooks.allowDownloadMaps !== undefined ? { allowDownloadMaps: hooks.allowDownloadMaps } : {}),
    ...(hooks.allowDownloadModels !== undefined ? { allowDownloadModels: hooks.allowDownloadModels } : {}),
    ...(hooks.allowDownloadPlayers !== undefined ? { allowDownloadPlayers: hooks.allowDownloadPlayers } : {}),
    ...(hooks.allowDownloadSounds !== undefined ? { allowDownloadSounds: hooks.allowDownloadSounds } : {}),
    ...(hooks.loadBinaryFile ? { loadBinaryFile: hooks.loadBinaryFile } : {}),
    ...(hooks.getMapInfo ? { getMapInfo: hooks.getMapInfo } : {}),
    ...(hooks.onPrepRefresh ? { onPrepRefresh: hooks.onPrepRefresh } : {}),
    ...(hooks.onRegisterSounds ? { onRegisterSounds: hooks.onRegisterSounds } : {}),
    ...(hooks.onBegin ? { onBegin: hooks.onBegin } : {})
  };

  context.cl_predict = Cvar_Get(context.cvar, "cl_predict", "1", 0);
  context.cl_showmiss = Cvar_Get(context.cvar, "cl_showmiss", "0", 0);
  context.cl_showclamp = Cvar_Get(context.cvar, "cl_showclamp", "0", 0);
  context.cl_paused = Cvar_Get(context.cvar, "paused", "0", 0);
  context.cl_timedemo = Cvar_Get(context.cvar, "timedemo", "0", 0);
  context.cl_vwep = Cvar_Get(context.cvar, "cl_vwep", "1", CVAR_ARCHIVE);
  context.rcon_client_password = Cvar_Get(context.cvar, "rcon_password", "", 0);
  context.rcon_address = Cvar_Get(context.cvar, "rcon_address", "", CVAR_NOSET);

  Cmd_AddCommand(context.cmd, "skins", () => {
    CL_Skins_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "cmd", () => {
    CL_ForwardToServer_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "changing", () => {
    CL_Changing_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "connect", () => {
    CL_Connect_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "disconnect", () => {
    CL_Disconnect_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "download", () => {
    CL_Download_f(context.client, context.cmd, downloadHooks);
  });
  Cmd_AddCommand(context.cmd, "pause", () => {
    CL_Pause_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "pingservers", () => {
    CL_PingServers_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "precache", () => {
    CL_Precache_f(context.client, context.cmd, precacheHooks);
  });
  Cmd_AddCommand(context.cmd, "quit", () => {
    CL_Quit_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "rcon", () => {
    CL_Rcon_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "reconnect", () => {
    CL_Reconnect_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "setenv", () => {
    CL_Setenv_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "snd_restart", () => {
    CL_Snd_Restart_f(context, hooks);
  });
  Cmd_AddCommand(context.cmd, "userinfo", () => {
    CL_Userinfo_f(context, hooks);
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
 * Original name: CL_Reconnect_f
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Handles reconnect requests during level changes or after a dropped connection.
 *
 * Porting notes:
 * - Defers sound shutdown to a host hook.
 * - Preserves the original resend timing adjustments.
 */
export function CL_Reconnect_f(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  if (hooks.isDownloading?.() === true) {
    return;
  }

  hooks.onStopAllSounds?.();

  if (context.client.cls.state === connstate_t.ca_connected) {
    hooks.onPrint?.("reconnecting...");
    context.client.cls.state = connstate_t.ca_connected;
    CL_WriteStringCmd(context.client, "new");
    return;
  }

  if (context.client.cls.servername.length > 0) {
    if (context.client.cls.state >= connstate_t.ca_connected) {
      CL_Disconnect(context, hooks);
      context.client.cls.connect_time = context.client.cls.realtime - 1500;
    } else {
      context.client.cls.connect_time = -99999;
    }

    context.client.cls.state = connstate_t.ca_connecting;
    hooks.onPrint?.("reconnecting...");
  }
}

/**
 * Original name: CL_Pause_f
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Toggles pause, except when multiplayer or no local server is running.
 *
 * Porting notes:
 * - Uses cvar runtime state plus an optional hook for the local-server presence check.
 */
export function CL_Pause_f(context: ClientMainContext, hooks: ClientMainHooks = {}): void {
  if (Cvar_VariableValue(context.cvar, "maxclients") > 1 || hooks.serverRunning?.() === false) {
    Cvar_SetValue(context.cvar, "paused", 0);
    return;
  }

  Cvar_SetValue(context.cvar, "paused", context.cl_paused?.value ? 0 : 1);
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
