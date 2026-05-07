/**
 * File: quake2-sv-user.ts
 * Purpose: Verify the TypeScript port target for `server/sv_user.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for server-side client bootstrap, download and usercmd execution.
 *
 * Dependencies:
 * - packages/server/src/sv_user.ts
 */

import { strict as assert } from "node:assert";

import { SZ_Clear } from "../../packages/memory/src/index.js";
import { createRuntimeEntity } from "../../packages/game/src/index.js";
import { createGameClient } from "../../packages/game/src/runtime.js";
import type { game_export_t } from "../../packages/game/src/index.js";
import {
  createServerClient,
  createServerMainProcedures,
  createServerState,
  createServerStatic,
  createServerUserProcedures
} from "../../packages/server/src/index.js";
import { client_state_t, server_state_t } from "../../packages/server/src/server.js";
import {
  COM_BlockSequenceCRCByte,
  CS_NAME,
  CVAR_SERVERINFO,
  Cvar_Get,
  Cvar_Set,
  MSG_WriteByte,
  MSG_WriteDeltaUsercmd,
  MSG_WriteLong,
  MSG_WriteString,
  createCommandRuntime,
  createCvarRuntime,
  createQcommonNetRuntime,
  svc_ops_e,
  clc_ops_e
} from "../../packages/qcommon/src/index.js";
import type { usercmd_t } from "../../packages/qcommon/src/index.js";

const began: number[] = [];
const thought: usercmd_t[] = [];
const forwardedCommands: number[] = [];
const printed: string[] = [];
const dprinted: string[] = [];
const freedDownloads: Uint8Array[] = [];
const openedDemoPaths: string[] = [];

const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const qnet = createQcommonNetRuntime();
const sv = createServerState();
const svs = createServerStatic();
sv.state = server_state_t.ss_game;
sv.name = "unit.dm2";
svs.spawncount = 7;
sv.configstrings[CS_NAME] = "Unit Test";
sv.configstrings[1] = "maps/unit.bsp";
sv.baselines[1]!.number = 1;
sv.baselines[1]!.modelindex = 3;

Cvar_Get(cvar, "gamedir", "baseq2", 0);
Cvar_Get(cvar, "hostname", "quake2js", CVAR_SERVERINFO);
Cvar_Get(cvar, "protocol", "34", CVAR_SERVERINFO);
Cvar_Get(cvar, "nextserver", "map base1", 0);
Cvar_Get(cvar, "coop", "0", 0);

const worldspawn = createRuntimeEntity({}, 0);
worldspawn.inuse = true;
const player = createRuntimeEntity({}, 1);
player.inuse = true;
player.client = createGameClient();

const ge = createGameExports([worldspawn, player]);
const client = createServerClient();
client.state = client_state_t.cs_connected;
client.name = "Tester";
svs.clients = [client];

const main = createServerMainProcedures({
  sv,
  svs,
  ge,
  cmd,
  qnet,
  maxclients: cvarState("maxclients", 1),
  hostname: cvarState("hostname", 0),
  rcon_password: cvarState("rcon_password", 0),
  timeout: cvarState("timeout", 125),
  zombietime: cvarState("zombietime", 2),
  sv_paused: cvarState("paused", 0),
  sv_timedemo: cvarState("timedemo", 0),
  sv_showclamp: cvarState("showclamp", 0),
  sv_reconnect_limit: cvarState("sv_reconnect_limit", 3),
  dedicated: cvarState("dedicated", 0),
  public_server: cvarState("public", 0),
  master_adr: [],
  getServerInfo: () => "\\hostname\\quake2js"
});

const user = createServerUserProcedures({
  sv,
  svs,
  ge,
  cmd,
  cvar,
  qnet,
  sv_paused: cvarValue(0),
  sv_enforcetime: cvarValue(1),
  allow_download: cvarValue(1),
  allow_download_players: cvarValue(1),
  allow_download_models: cvarValue(1),
  allow_download_sounds: cvarValue(1),
  allow_download_maps: cvarValue(1),
  openDemoFile: (path) => {
    openedDemoPaths.push(path);
    return { path };
  },
  loadDownloadFile: (path) => {
    if (path === "players/male/tris.md2") {
      return { data: new Uint8Array(1500).fill(7), fromPak: false };
    }
    if (path === "maps/unit.bsp") {
      return { data: new Uint8Array(64).fill(3), fromPak: true };
    }
    return null;
  },
  freeDownload: (data) => {
    freedDownloads.push(data);
  },
  SV_DropClient: (cl) => {
    cl.state = client_state_t.cs_zombie;
  },
  SV_UserinfoChanged: main.SV_UserinfoChanged,
  onPrintf: (message) => {
    printed.push(message);
  },
  onDPrintf: (message) => {
    dprinted.push(message);
  }
});

verifyNewConfigstringsBaselinesBegin();
verifyDemoServerBootstrap();
verifyDownloadFlow();
verifyDownloadRefusals();
verifyExecuteClientMessageMoveAndUserinfo();
verifyClientMessageMoveReplayAndGuards();
verifyNextserverAndServerinfo();

console.log("quake2-sv-user: ok");

function verifyNewConfigstringsBaselinesBegin(): void {
  sv.state = server_state_t.ss_game;
  client.state = client_state_t.cs_connected;
  resetClientMessage();
  executeStringCmd("new");
  assert.ok(client.edict, "SV_New_f should bind the player edict");
  assert.equal(client.edict?.s.number, 1, "SV_New_f should number the client edict");
  assert.equal(client.netchan.message.data[0], svc_ops_e.svc_serverdata, "SV_New_f should start with svc_serverdata");
  assert.ok(messageText().includes("configstrings"), "SV_New_f should request configstrings");

  resetClientMessage();
  executeStringCmd("configstrings 7 0");
  assert.ok(messageText().includes("maps/unit.bsp"), "SV_Configstrings_f should send populated configstrings");
  assert.ok(messageText().includes("baselines"), "SV_Configstrings_f should chain to baselines");

  resetClientMessage();
  executeStringCmd("baselines 7 0");
  assert.equal(client.netchan.message.data[0], svc_ops_e.svc_spawnbaseline, "SV_Baselines_f should emit svc_spawnbaseline");
  assert.ok(messageText().includes("precache"), "SV_Baselines_f should finish with precache");

  resetClientMessage();
  executeStringCmd("begin 7");
  assert.equal(client.state, client_state_t.cs_spawned, "SV_Begin_f should spawn the client");
  assert.deepEqual(began, [1], "SV_Begin_f should call game ClientBegin");
}

function verifyDemoServerBootstrap(): void {
  sv.state = server_state_t.ss_demo;
  client.state = client_state_t.cs_connected;
  sv.demofile = null;
  resetClientMessage();
  executeStringCmd("new");
  assert.deepEqual(openedDemoPaths, ["demos/unit.dm2"], "SV_BeginDemoserver should open the demo path derived from sv.name");
  assert.ok(sv.demofile, "SV_BeginDemoserver should keep the opened demo handle on sv.demofile");
}

function verifyDownloadFlow(): void {
  sv.state = server_state_t.ss_game;
  client.state = client_state_t.cs_spawned;
  resetClientMessage();
  executeStringCmd("download players/male/tris.md2 0");
  assert.equal(client.netchan.message.data[0], svc_ops_e.svc_download, "SV_BeginDownload_f should emit svc_download");
  assert.equal(client.downloadcount, 1024, "SV_BeginDownload_f should send the first 1024-byte chunk");
  assert.ok(client.download, "SV_BeginDownload_f should keep unfinished download buffer");

  resetClientMessage();
  executeStringCmd("nextdl");
  assert.equal(client.download, null, "SV_NextDownload_f should free the download at completion");
  assert.ok(freedDownloads.length >= 1, "SV_NextDownload_f should free completed download buffers");
}

function verifyDownloadRefusals(): void {
  client.state = client_state_t.cs_spawned;

  resetClientMessage();
  executeStringCmd("download ../config.cfg 0");
  assert.equal(client.netchan.message.data[0], svc_ops_e.svc_download, "refused downloads should still emit svc_download");
  assert.equal(readLittleShort(client.netchan.message.data, 1), -1, "refused path traversal should send -1 length");

  resetClientMessage();
  executeStringCmd("download maps/unit.bsp 0");
  assert.equal(readLittleShort(client.netchan.message.data, 1), -1, "maps loaded from pak should be refused");
  assert.equal(client.download, null, "refused map downloads should clear the temporary download buffer");
}

function verifyExecuteClientMessageMoveAndUserinfo(): void {
  sv.state = server_state_t.ss_game;
  client.state = client_state_t.cs_spawned;
  client.edict = player;
  client.commandMsec = 1800;
  client.netchan.incoming_sequence = 1;
  client.netchan.dropped = 0;
  svs.realtime = 5000;
  client.frames[3].senttime = 4900;

  resetNetMessage();
  MSG_WriteByte(qnet.net_message, clc_ops_e.clc_userinfo);
  MSG_WriteString(qnet.net_message, "\\name\\User");
  MSG_WriteByte(qnet.net_message, clc_ops_e.clc_move);
  const checksumIndex = qnet.net_message.cursize;
  MSG_WriteByte(qnet.net_message, 0);
  MSG_WriteLong(qnet.net_message, 3);

  const nullcmd = zeroCmd();
  const oldest = { ...zeroCmd(), msec: 10 };
  const oldcmd = { ...zeroCmd(), msec: 11 };
  const newcmd = { ...zeroCmd(), msec: 12, forwardmove: 200 };
  MSG_WriteDeltaUsercmd(qnet.net_message, nullcmd, oldest);
  MSG_WriteDeltaUsercmd(qnet.net_message, oldest, oldcmd);
  MSG_WriteDeltaUsercmd(qnet.net_message, oldcmd, newcmd);

  qnet.net_message.data[checksumIndex] = COM_BlockSequenceCRCByte(
    qnet.net_message.data.subarray(checksumIndex + 1, qnet.net_message.cursize),
    qnet.net_message.cursize - checksumIndex - 1,
    client.netchan.incoming_sequence
  );

  qnet.net_message.readcount = 0;
  user.SV_ExecuteClientMessage(client);

  assert.equal(client.name, "User", "clc_userinfo should route through SV_UserinfoChanged");
  assert.equal(client.lastframe, 3, "clc_move should update lastframe");
  assert.equal(client.frame_latency[3 & 15], 100, "clc_move should update frame latency");
  assert.equal(client.lastcmd.forwardmove, 200, "clc_move should persist the newest usercmd");
  assert.equal(thought.length, 1, "SV_ExecuteClientMessage should think once when no drops occurred");
}

function verifyClientMessageMoveReplayAndGuards(): void {
  sv.state = server_state_t.ss_game;
  client.state = client_state_t.cs_spawned;
  client.edict = player;
  client.netchan.incoming_sequence = 2;
  client.netchan.dropped = 3;
  client.commandMsec = 1800;
  svs.realtime = 6000;
  client.frames[4].senttime = 5900;
  client.lastcmd = { ...zeroCmd(), angles: [0, 0, 0], forwardmove: 1 };
  thought.length = 0;

  writeMovePacket({
    lastframe: 4,
    oldest: { ...zeroCmd(), angles: [0, 0, 0], forwardmove: 2 },
    oldcmd: { ...zeroCmd(), angles: [0, 0, 0], forwardmove: 3 },
    newcmd: { ...zeroCmd(), angles: [0, 0, 0], forwardmove: 4 }
  });
  user.SV_ExecuteClientMessage(client);

  assert.deepEqual(
    thought.map((cmd) => cmd.forwardmove),
    [1, 2, 3, 4],
    "SV_ExecuteClientMessage should replay dropped last/old movement commands before the newest command"
  );
  assert.equal(client.lastcmd.forwardmove, 4, "clc_move replay should still persist the newest usercmd");

  thought.length = 0;
  client.netchan.dropped = 0;
  client.commandMsec = 1800;
  client.lastcmd = zeroCmd();
  writeMovePacket({
    lastframe: 5,
    oldest: { ...zeroCmd(), angles: [0, 0, 0], msec: 1 },
    oldcmd: { ...zeroCmd(), angles: [0, 0, 0], msec: 2 },
    newcmd: { ...zeroCmd(), angles: [0, 0, 0], msec: 3, forwardmove: 321 },
    badChecksum: true
  });
  user.SV_ExecuteClientMessage(client);
  assert.equal(thought.length, 0, "bad clc_move checksum should ignore movement without ClientThink");
  assert.equal(client.lastcmd.forwardmove, 0, "bad clc_move checksum should not persist the newest usercmd");

  forwardedCommands.length = 0;
  client.state = client_state_t.cs_spawned;
  resetNetMessage();
  for (let i = 0; i < 10; i += 1) {
    MSG_WriteByte(qnet.net_message, clc_ops_e.clc_stringcmd);
    MSG_WriteString(qnet.net_message, `say limited-${i}`);
  }
  qnet.net_message.readcount = 0;
  user.SV_ExecuteClientMessage(client);
  assert.equal(forwardedCommands.length, 7, "MAX_STRINGCMDS should allow exactly seven string commands per client message");
}

function verifyNextserverAndServerinfo(): void {
  sv.state = server_state_t.ss_cinematic;
  executeStringCmd("nextserver 7");
  assert.equal(svs.spawncount, 8, "SV_Nextserver should advance spawncount outside normal gameplay");
  assert.ok(cmd.cmd_text.cursize > 0, "SV_Nextserver should enqueue the nextserver command text");

  Cvar_Set(cvar, "nextserver", "map base1");
  resetClientMessage();
  executeStringCmd("info");
  assert.ok(printed.some((line) => line.includes("hostname")), "SV_ShowServerinfo_f should print serverinfo lines");

  sv.state = server_state_t.ss_game;
  forwardedCommands.length = 0;
  executeStringCmd("say hello");
  assert.deepEqual(forwardedCommands, [1], "unknown stringcmds should forward to game ClientCommand in ss_game");
}

function executeStringCmd(text: string): void {
  resetNetMessage();
  MSG_WriteByte(qnet.net_message, clc_ops_e.clc_stringcmd);
  MSG_WriteString(qnet.net_message, text);
  qnet.net_message.readcount = 0;
  user.SV_ExecuteClientMessage(client);
}

function resetClientMessage(): void {
  SZ_Clear(client.netchan.message);
}

function resetNetMessage(): void {
  SZ_Clear(qnet.net_message);
}

function messageText(): string {
  let text = "";
  for (let i = 0; i < client.netchan.message.cursize; i += 1) {
    const c = client.netchan.message.data[i]!;
    if (c >= 32 && c <= 126) {
      text += String.fromCharCode(c);
    }
  }
  return text;
}

function readLittleShort(data: Uint8Array, offset: number): number {
  return new DataView(data.buffer, data.byteOffset, data.byteLength).getInt16(offset, true);
}

function zeroCmd(): usercmd_t {
  return {
    msec: 0,
    buttons: 0,
    angles: [0, 0, 0],
    forwardmove: 0,
    sidemove: 0,
    upmove: 0,
    impulse: 0,
    lightlevel: 0
  };
}

function writeMovePacket(options: {
  lastframe: number;
  oldest: usercmd_t;
  oldcmd: usercmd_t;
  newcmd: usercmd_t;
  badChecksum?: boolean;
}): void {
  resetNetMessage();
  MSG_WriteByte(qnet.net_message, clc_ops_e.clc_move);
  const checksumIndex = qnet.net_message.cursize;
  MSG_WriteByte(qnet.net_message, 0);
  MSG_WriteLong(qnet.net_message, options.lastframe);
  MSG_WriteDeltaUsercmd(qnet.net_message, zeroCmd(), options.oldest);
  MSG_WriteDeltaUsercmd(qnet.net_message, options.oldest, options.oldcmd);
  MSG_WriteDeltaUsercmd(qnet.net_message, options.oldcmd, options.newcmd);

  qnet.net_message.data[checksumIndex] = options.badChecksum
    ? 0xff
    : COM_BlockSequenceCRCByte(
        qnet.net_message.data.subarray(checksumIndex + 1, qnet.net_message.cursize),
        qnet.net_message.cursize - checksumIndex - 1,
        client.netchan.incoming_sequence
      );
  qnet.net_message.readcount = 0;
}

function cvarValue(value: number) {
  return {
    value
  };
}

function cvarState(name: string, value: number) {
  return {
    name,
    string: `${value}`,
    latched_string: null,
    flags: 0,
    modified: false,
    value
  };
}

function createGameExports(edicts: ReturnType<typeof createRuntimeEntity>[]): game_export_t {
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
    ClientBegin: (ent) => {
      began.push(ent.index);
    },
    ClientUserinfoChanged: () => {},
    ClientDisconnect: () => {},
    ClientCommand: (ent) => {
      forwardedCommands.push(ent.index);
    },
    ClientThink: (_ent, cmd) => {
      thought.push(cmd);
    },
    RunFrame: () => {},
    ServerCommand: () => {},
    edicts,
    edict_size: 0,
    num_edicts: edicts.length,
    max_edicts: 1024
  };
}
