/**
 * File: quake2-sv-send.ts
 * Purpose: Verify the TypeScript port target for `server/sv_send.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for server multicast/send procedures.
 *
 * Dependencies:
 * - packages/server/src/sv_send.ts
 */

import fs from "node:fs";
import path from "node:path";
import { strict as assert } from "node:assert";

import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import { parseBsp } from "../../packages/formats/src/bsp.js";
import { createRuntimeEntity } from "../../packages/game/src/index.js";
import { createGameClient } from "../../packages/game/src/runtime.js";
import type { game_export_t } from "../../packages/game/src/index.js";
import {
  createServerClient,
  createServerSendProcedures,
  createServerState,
  createServerStatic
} from "../../packages/server/src/index.js";
import { SZ_Clear } from "../../packages/memory/src/index.js";
import {
  CHAN_RELIABLE,
  MSG_WriteByte,
  createCollisionWorld,
  createQcommonNetRuntime,
  multicast_t,
  netadrtype_t,
  netsrc_t,
  svc_ops_e
} from "../../packages/qcommon/src/index.js";
import { client_state_t, server_state_t } from "../../packages/server/src/server.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base1.bsp";

main();

function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const pak = parsePak(pakBytes, pakPath);
  const bspEntry = findPakEntry(pak, MAP_PATH);
  if (!bspEntry) {
    throw new Error(`${MAP_PATH} introuvable dans ${pakPath}`);
  }

  const map = parseBsp(readPakEntryData(pak, bspEntry), MAP_PATH);
  const collisionWorld = createCollisionWorld(map);

  const qnetPackets: Uint8Array[] = [];
  const qnet = createQcommonNetRuntime({
    now: () => 2000,
    sendPacket: (_sock, data) => {
      qnetPackets.push(new Uint8Array(data));
    }
  });

  const sv = createServerState();
  const svs = createServerStatic();
  sv.state = server_state_t.ss_game;

  const worldspawn = createRuntimeEntity({}, 0);
  worldspawn.inuse = true;
  const player = createRuntimeEntity({}, 1);
  player.inuse = true;
  player.client = createGameClient();
  player.s.origin = [0, 0, 32];

  const ge = createGameExports([worldspawn, player]);

  const client = createServerClient();
  client.state = client_state_t.cs_spawned;
  client.messagelevel = 0;
  client.rate = 100000;
  client.edict = player;
  client.netchan.sock = netsrc_t.NS_SERVER;
  client.netchan.remote_address.type = netadrtype_t.NA_LOOPBACK;
  client.netchan.message.allowoverflow = true;
  svs.clients = [client];
  let dropCalls = 0;
  let nextserverCalls = 0;
  let readDemoCalls = 0;

  const send = createServerSendProcedures({
    sv,
    svs,
    ge,
    collisionWorld,
    qnet,
    maxclients: cvar("maxclients", 1),
    dedicated: cvar("dedicated", 0),
    sv_paused: cvar("sv_paused", 0),
    sv_client: client,
    net_from: client.netchan.remote_address,
    SV_BuildClientFrame: () => {},
    SV_WriteFrameToClient: (_c, msg) => {
      MSG_WriteByte(msg, svc_ops_e.svc_nop);
    },
    SV_DropClient: () => {
      dropCalls += 1;
      client.state = client_state_t.cs_zombie;
    },
    SV_Nextserver: () => {
      nextserverCalls += 1;
    },
    readDemoMessage: (_demofile) => {
      readDemoCalls += 1;
      return new Uint8Array([svc_ops_e.svc_nop]);
    }
  });

  send.SV_ClientPrintf(client, 1, "hello %s", "world");
  assert.ok(client.netchan.message.cursize > 0, "SV_ClientPrintf should append bytes to reliable channel");

  SZ_Clear(client.netchan.message);
  send.SV_BroadcastPrintf(1, "broadcast %i", 7);
  assert.ok(client.netchan.message.cursize > 0, "SV_BroadcastPrintf should append bytes for spawned clients");

  SZ_Clear(client.netchan.message);
  send.SV_BroadcastCommand("cmd %s\n", "test");
  assert.equal(sv.multicast.cursize, 0, "SV_BroadcastCommand should clear sv.multicast through SV_Multicast");
  assert.ok(client.netchan.message.cursize > 0, "SV_BroadcastCommand should enqueue reliable multicast bytes");

  SZ_Clear(client.datagram);
  send.SV_StartSound([10, 20, 30], player, 0, 3, 1.0, 0, 0);
  assert.equal(sv.multicast.cursize, 0, "SV_StartSound should clear sv.multicast after dispatch");
  assert.ok(client.datagram.cursize > 0, "SV_StartSound should queue datagram bytes for non-reliable path");

  SZ_Clear(client.datagram);
  SZ_Clear(client.netchan.message);
  send.SV_StartSound([10, 20, 30], player, CHAN_RELIABLE, 4, 1.0, 0, 0);
  assert.equal(sv.multicast.cursize, 0, "SV_StartSound should clear reliable multicast bytes");
  assert.ok(client.netchan.message.cursize > 0, "SV_StartSound should queue reliable sound bytes on netchan.message");
  assert.equal(client.datagram.cursize, 0, "SV_StartSound should not write reliable sound bytes to datagram");

  assert.throws(
    () => send.SV_Multicast(null, multicast_t.MULTICAST_PHS),
    /origin is null/i,
    "SV_Multicast should reject null origin for PHS/PVS modes"
  );

  qnetPackets.length = 0;
  sv.framenum = 1;
  send.SV_SendClientMessages();
  assert.ok(qnetPackets.length >= 1, "SV_SendClientMessages should transmit one packet for spawned client");
  assert.ok(client.message_size[sv.framenum % 10] >= 0, "SV_SendClientMessages should update rate history");

  client.state = client_state_t.cs_spawned;
  client.netchan.message.overflowed = true;
  send.SV_SendClientMessages();
  assert.equal(dropCalls, 1, "SV_SendClientMessages should drop client when reliable channel overflowed");

  client.state = client_state_t.cs_spawned;
  client.netchan.message.overflowed = false;
  client.netchan.remote_address.type = netadrtype_t.NA_IP;
  client.rate = 1;
  client.message_size.fill(2);
  client.surpressCount = 0;
  qnetPackets.length = 0;
  send.SV_SendClientMessages();
  assert.equal(client.surpressCount, 1, "SV_SendClientMessages should increment surpressCount when rate dropping");
  assert.equal(qnetPackets.length, 0, "SV_SendClientMessages should skip datagram transmission when rate dropping");

  client.netchan.remote_address.type = netadrtype_t.NA_LOOPBACK;
  client.rate = 1;
  client.message_size.fill(2);
  client.surpressCount = 0;
  qnetPackets.length = 0;
  send.SV_SendClientMessages();
  assert.ok(qnetPackets.length >= 1, "SV_SendClientMessages should never rate drop loopback clients");

  client.state = client_state_t.cs_spawned;
  client.netchan.message.overflowed = false;
  sv.state = server_state_t.ss_demo;
  sv.demofile = {};
  qnetPackets.length = 0;
  send.SV_SendClientMessages();
  assert.equal(readDemoCalls, 1, "SV_SendClientMessages should read one demo payload in ss_demo");
  assert.ok(qnetPackets.length >= 1, "SV_SendClientMessages should transmit demo payload");
  assert.equal(nextserverCalls, 0, "SV_DemoCompleted should not run when demo payload exists");

  sv.state = server_state_t.ss_demo;
  sv.demofile = {};
  qnetPackets.length = 0;
  send.SV_SendClientMessages();
  assert.equal(readDemoCalls, 2, "SV_SendClientMessages should read another demo payload when unpaused");

  const previousDemoReads = readDemoCalls;
  sv.state = server_state_t.ss_demo;
  sv.demofile = {};
  qnetPackets.length = 0;
  const pausedSend = createServerSendProcedures({
    sv,
    svs,
    ge,
    collisionWorld,
    qnet,
    maxclients: cvar("maxclients", 1),
    dedicated: cvar("dedicated", 0),
    sv_paused: cvar("sv_paused", 1),
    sv_client: client,
    net_from: client.netchan.remote_address,
    SV_BuildClientFrame: () => {},
    SV_WriteFrameToClient: (_c, msg) => {
      MSG_WriteByte(msg, svc_ops_e.svc_nop);
    },
    SV_DropClient: () => {},
    SV_Nextserver: () => {
      nextserverCalls += 1;
    },
    readDemoMessage: () => {
      readDemoCalls += 1;
      return new Uint8Array([svc_ops_e.svc_nop]);
    }
  });
  pausedSend.SV_SendClientMessages();
  assert.equal(readDemoCalls, previousDemoReads, "SV_SendClientMessages should not read demo payloads while paused");
  assert.ok(qnetPackets.length >= 1, "SV_SendClientMessages should still transmit an empty paused-demo packet");

  const eofSend = createServerSendProcedures({
    sv,
    svs,
    ge,
    collisionWorld,
    qnet,
    maxclients: cvar("maxclients", 1),
    dedicated: cvar("dedicated", 0),
    sv_paused: cvar("sv_paused", 0),
    sv_client: client,
    net_from: client.netchan.remote_address,
    SV_BuildClientFrame: () => {},
    SV_WriteFrameToClient: (_c, msg) => {
      MSG_WriteByte(msg, svc_ops_e.svc_nop);
    },
    SV_DropClient: () => {},
    SV_Nextserver: () => {
      nextserverCalls += 1;
    },
    closeDemoFile: () => {},
    readDemoMessage: () => null
  });
  sv.demofile = {};
  eofSend.SV_SendClientMessages();
  assert.equal(nextserverCalls, 1, "SV_SendClientMessages should complete demo on EOF");
  assert.equal(sv.demofile, null, "SV_DemoCompleted should clear sv.demofile");

  sv.state = server_state_t.ss_game;
  client.state = client_state_t.cs_connected;
  SZ_Clear(client.netchan.message);
  client.netchan.last_sent = 500;
  qnetPackets.length = 0;
  const pulseSend = createServerSendProcedures({
    sv,
    svs,
    ge,
    collisionWorld,
    qnet,
    maxclients: cvar("maxclients", 1),
    dedicated: cvar("dedicated", 0),
    sv_paused: cvar("sv_paused", 0),
    sv_client: client,
    net_from: client.netchan.remote_address,
    SV_BuildClientFrame: () => {},
    SV_WriteFrameToClient: (_c, msg) => {
      MSG_WriteByte(msg, svc_ops_e.svc_nop);
    },
    SV_DropClient: () => {},
    SV_Nextserver: () => {},
    nowMs: () => 1000
  });
  pulseSend.SV_SendClientMessages();
  assert.equal(qnetPackets.length, 0, "SV_SendClientMessages should not pulse connected clients before timeout without reliable bytes");

  client.netchan.last_sent = -1;
  qnetPackets.length = 0;
  pulseSend.SV_SendClientMessages();
  assert.ok(qnetPackets.length >= 1, "SV_SendClientMessages should send a reliable-only pulse after one second");

  sv.state = server_state_t.ss_game;
  const localMulticast = createServerSendProcedures({
    sv,
    svs,
    ge,
    collisionWorld,
    qnet,
    maxclients: cvar("maxclients", 1),
    dedicated: cvar("dedicated", 0),
    sv_paused: cvar("sv_paused", 0),
    sv_client: client,
    net_from: client.netchan.remote_address,
    SV_BuildClientFrame: () => {},
    SV_WriteFrameToClient: (_c, msg) => {
      MSG_WriteByte(msg, svc_ops_e.svc_nop);
    },
    SV_DropClient: () => {},
    SV_Nextserver: () => {}
  });
  MSG_WriteByte(sv.multicast, svc_ops_e.svc_nop);
  localMulticast.SV_Multicast(null, multicast_t.MULTICAST_ALL);
  assert.equal(sv.multicast.cursize, 0, "SV_Multicast should clear multicast buffer");

  console.log("quake2-sv-send: ok");
}

function cvar(name: string, value: number) {
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
    ClientBegin: () => {},
    ClientUserinfoChanged: () => {},
    ClientDisconnect: () => {},
    ClientCommand: () => {},
    ClientThink: () => {},
    RunFrame: () => {},
    ServerCommand: () => {},
    edicts,
    edict_size: 0,
    num_edicts: edicts.length,
    max_edicts: 1024
  };
}
