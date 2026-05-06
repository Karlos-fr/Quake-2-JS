/**
 * File: quake2-server-runtime.ts
 * Purpose: Verify the integrated server runtime facade wiring.
 *
 * This file is not a direct source port.
 * It validates that the composed server facade links `sv_main`, `sv_user`, `sv_send`, `sv_ents` and `sv_world`.
 *
 * Dependencies:
 * - packages/server/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import { createRuntimeEntity } from "../../packages/game/src/index.js";
import { createGameClient } from "../../packages/game/src/runtime.js";
import type { game_export_t } from "../../packages/game/src/index.js";
import {
  configureServerHostFromFacade,
  createServerClient,
  createServerRuntimeFacade,
  resetServerHost,
  SV_Frame,
  SV_Init,
  SV_Shutdown,
  createServerState,
  createServerStatic
} from "../../packages/server/src/index.js";
import { client_state_t, server_state_t } from "../../packages/server/src/server.js";
import {
  Cvar_Get,
  CS_IMAGES,
  CS_MODELS,
  CS_SOUNDS,
  MSG_WriteByte,
  MSG_WriteString,
  clc_ops_e,
  createCommandRuntime,
  createCvarRuntime,
  createQcommonNetRuntime,
  type CollisionWorld
} from "../../packages/qcommon/src/index.js";
import { SZ_Clear } from "../../packages/memory/src/index.js";

const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const qnet = createQcommonNetRuntime({
  now: () => 1000,
  sendPacket: (_sock, data) => {
    transmittedPackets.push(new Uint8Array(data));
  }
});
const sv = createServerState();
const svs = createServerStatic();
const client = createServerClient();
client.state = client_state_t.cs_connected;
client.edict = createRuntimeEntity({}, 1);
client.edict.client = createGameClient();
svs.clients = [client];
svs.initialized = true;
sv.state = server_state_t.ss_game;

let runFrameCalls = 0;
const transmittedPackets: Uint8Array[] = [];
const freedDownloads: Uint8Array[] = [];

const ge = createGameExports();
const facade = createServerRuntimeFacade({
  sv,
  svs,
  ge,
  collisionWorld: {} as CollisionWorld,
  qnet,
  cmd,
  cvar,
  maxclients: Cvar_Get(cvar, "maxclients", "1", 0),
  hostname: Cvar_Get(cvar, "hostname", "quake2js", 0),
  rcon_password: Cvar_Get(cvar, "rcon_password", "secret", 0),
  timeout: Cvar_Get(cvar, "timeout", "125", 0),
  zombietime: Cvar_Get(cvar, "zombietime", "2", 0),
  sv_paused: Cvar_Get(cvar, "paused", "0", 0),
  sv_timedemo: Cvar_Get(cvar, "timedemo", "0", 0),
  sv_showclamp: Cvar_Get(cvar, "showclamp", "0", 0),
  sv_enforcetime: Cvar_Get(cvar, "sv_enforcetime", "0", 0),
  allow_download: Cvar_Get(cvar, "allow_download", "1", 0),
  allow_download_players: Cvar_Get(cvar, "allow_download_players", "1", 0),
  allow_download_models: Cvar_Get(cvar, "allow_download_models", "1", 0),
  allow_download_sounds: Cvar_Get(cvar, "allow_download_sounds", "1", 0),
  allow_download_maps: Cvar_Get(cvar, "allow_download_maps", "1", 0),
  sv_reconnect_limit: Cvar_Get(cvar, "sv_reconnect_limit", "3", 0),
  dedicated: Cvar_Get(cvar, "dedicated", "0", 0),
  public_server: Cvar_Get(cvar, "public", "0", 0),
  master_adr: [],
  writeDemoMessage: () => {},
  loadDownloadFile: (path) => {
    if (path === "players/male/tris.md2") {
      return { data: new Uint8Array(64).fill(5), fromPak: false };
    }
    return null;
  },
  onFreeDownload: (download) => {
    freedDownloads.push(download);
  },
  nowMs: () => 1000,
  onPrintf: () => {},
  onDPrintf: () => {}
});

assert.ok(facade.main, "createServerRuntimeFacade should expose sv_main procedures");
assert.ok(facade.user, "createServerRuntimeFacade should expose sv_user procedures");
assert.ok(facade.send, "createServerRuntimeFacade should expose sv_send procedures");
assert.ok(facade.ents, "createServerRuntimeFacade should expose sv_ents procedures");
assert.ok(facade.world, "createServerRuntimeFacade should expose sv_world procedures");
assert.equal(typeof facade.main.SV_FinalMessage, "function", "facade should expose SV_FinalMessage from server.h");
assert.equal(typeof facade.main.SV_DropClient, "function", "facade should expose SV_DropClient from server.h");
assert.equal(typeof facade.init.SV_ModelIndex, "function", "facade should expose SV_ModelIndex from server.h");
assert.equal(typeof facade.init.SV_SoundIndex, "function", "facade should expose SV_SoundIndex from server.h");
assert.equal(typeof facade.init.SV_ImageIndex, "function", "facade should expose SV_ImageIndex from server.h");

sv.state = server_state_t.ss_loading;
assert.equal(facade.init.SV_ModelIndex("models/items/armor/body/tris.md2"), 1, "SV_ModelIndex should allocate model configstrings");
assert.equal(facade.init.SV_ModelIndex("models/items/armor/body/tris.md2"), 1, "SV_ModelIndex should reuse existing model configstrings");
assert.equal(facade.init.SV_SoundIndex("misc/secret.wav"), 1, "SV_SoundIndex should allocate sound configstrings");
assert.equal(facade.init.SV_ImageIndex("i_health"), 1, "SV_ImageIndex should allocate image configstrings");
assert.equal(sv.configstrings[CS_MODELS + 1], "models/items/armor/body/tris.md2", "SV_ModelIndex configstring slot mismatch");
assert.equal(sv.configstrings[CS_SOUNDS + 1], "misc/secret.wav", "SV_SoundIndex configstring slot mismatch");
assert.equal(sv.configstrings[CS_IMAGES + 1], "i_health", "SV_ImageIndex configstring slot mismatch");
sv.state = server_state_t.ss_game;

facade.procedures.SV_Frame(100);
assert.equal(sv.framenum, 1, "facade.procedures.SV_Frame should route to the integrated sv_main frame loop");
assert.equal(sv.time, 100, "facade.procedures.SV_Frame should advance server time");
assert.equal(runFrameCalls, 1, "facade.procedures.SV_Frame should call the game RunFrame through sv_main");
assert.equal(client.state, client_state_t.cs_connected, "SV_Frame should preserve a connected client without forcing a send-frame path");

configureServerHostFromFacade({
  facade,
  sv,
  svs
});
SV_Init();
assert.equal(svs.initialized, true, "top-level SV_Init should mark the configured server runtime initialized");
SV_Frame(100);
assert.equal(sv.framenum, 2, "top-level SV_Frame should forward to the configured runtime facade");
assert.equal(runFrameCalls, 2, "top-level SV_Frame should drive the integrated server frame loop");
client.state = client_state_t.cs_connected;
SV_Shutdown("Server restarting", true);
assert.equal(svs.initialized, false, "top-level SV_Shutdown should mark the configured server runtime uninitialized");
assert.equal(sv.state, server_state_t.ss_dead, "top-level SV_Shutdown should return the server state to ss_dead");
assert.equal(client.state, client_state_t.cs_free, "top-level SV_Shutdown should free client slots");
assert.ok(transmittedPackets.length >= 2, "top-level SV_Shutdown should send the final message through sv_main");
resetServerHost();

sv.state = server_state_t.ss_cinematic;
Cvar_Get(cvar, "nextserver", "map unit1", 0);
facade.user.SV_Nextserver();
const queued = decodeCommandBuffer(cmd);
assert.ok(queued.includes("map unit1"), "SV_Nextserver should enqueue the nextserver command through the integrated facade");

client.state = client_state_t.cs_spawned;
SZ_Clear(qnet.net_message);
MSG_WriteByte(qnet.net_message, clc_ops_e.clc_stringcmd);
MSG_WriteString(qnet.net_message, "download players/male/tris.md2 0");
qnet.net_message.readcount = 0;
facade.user.SV_ExecuteClientMessage(client);
assert.ok(client.download === null, "integrated sv_user download path should complete and free a short download");
assert.equal(freedDownloads.length, 1, "integrated sv_user download path should call the configured free callback");

console.log("quake2-server-runtime: ok");

function decodeCommandBuffer(runtime: ReturnType<typeof createCommandRuntime>): string {
  let text = "";
  for (let i = 0; i < runtime.cmd_text.cursize; i += 1) {
    const c = runtime.cmd_text.data[i]!;
    if (c === 0) {
      break;
    }
    text += String.fromCharCode(c);
  }
  return text;
}

function createGameExports(): game_export_t {
  const worldspawn = createRuntimeEntity({}, 0);
  worldspawn.inuse = true;
  const player = createRuntimeEntity({}, 1);
  player.inuse = true;
  player.client = createGameClient();

  return {
    apiversion: 3,
    Init: () => {},
    Shutdown: () => {},
    SpawnEntities: () => {},
    WriteGame: () => {},
    ReadGame: () => {},
    WriteLevel: () => {},
    ReadLevel: () => {},
    ClientConnect: () => true,
    ClientBegin: () => {},
    ClientUserinfoChanged: () => {},
    ClientDisconnect: () => {},
    ClientCommand: () => {},
    ClientThink: () => {},
    RunFrame: () => {
      runFrameCalls += 1;
    },
    ServerCommand: () => {},
    edicts: [worldspawn, player],
    edict_size: 0,
    num_edicts: 2,
    max_edicts: 1024
  };
}
