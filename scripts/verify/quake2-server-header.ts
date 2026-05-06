/**
 * File: quake2-server-header.ts
 * Purpose: Verify the TypeScript port target for `server/server.h`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the server header declarations.
 *
 * Dependencies:
 * - packages/server/src/server.ts
 * - packages/game/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import { createRuntimeEntity } from "../../packages/game/src/index.js";
import type { game_export_t } from "../../packages/game/src/index.js";
import {
  client_state_t,
  computeServerClientEntityCapacity,
  createChallenge,
  createClientFrame,
  createServerClient,
  createServerHeaderState,
  createServerState,
  createServerStatic,
  EDICT_NUM,
  LATENCY_COUNTS,
  MAX_CHALLENGES,
  MAX_MASTERS,
  MAX_PACKET_ENTITIES,
  NUM_FOR_EDICT,
  RATE_MESSAGES,
  redirect_t,
  server_state_t,
  SV_OUTPUTBUF_LENGTH
} from "../../packages/server/src/index.js";

assert.equal(MAX_MASTERS, 8, "MAX_MASTERS mismatch");
assert.equal(LATENCY_COUNTS, 16, "LATENCY_COUNTS mismatch");
assert.equal(RATE_MESSAGES, 10, "RATE_MESSAGES mismatch");
assert.equal(MAX_CHALLENGES, 1024, "MAX_CHALLENGES mismatch");
assert.equal(MAX_PACKET_ENTITIES, 64, "MAX_PACKET_ENTITIES mismatch");
assert.equal(SV_OUTPUTBUF_LENGTH, 1384, "SV_OUTPUTBUF_LENGTH mismatch");

assert.equal(server_state_t.ss_dead, 0, "server_state_t ss_dead mismatch");
assert.equal(server_state_t.ss_loading, 1, "server_state_t ss_loading mismatch");
assert.equal(server_state_t.ss_game, 2, "server_state_t ss_game mismatch");
assert.equal(server_state_t.ss_cinematic, 3, "server_state_t ss_cinematic mismatch");
assert.equal(server_state_t.ss_demo, 4, "server_state_t ss_demo mismatch");
assert.equal(server_state_t.ss_pic, 5, "server_state_t ss_pic mismatch");
assert.equal(client_state_t.cs_free, 0, "client_state_t cs_free mismatch");
assert.equal(client_state_t.cs_zombie, 1, "client_state_t cs_zombie mismatch");
assert.equal(client_state_t.cs_connected, 2, "client_state_t cs_connected mismatch");
assert.equal(client_state_t.cs_spawned, 3, "client_state_t cs_spawned mismatch");
assert.equal(redirect_t.RD_NONE, 0, "redirect_t RD_NONE mismatch");
assert.equal(redirect_t.RD_PACKET, 2, "redirect_t RD_PACKET mismatch");

const sv = createServerState();
assert.equal(sv.state, server_state_t.ss_dead, "createServerState default state mismatch");
assert.equal(sv.attractloop, false, "createServerState attractloop default mismatch");
assert.equal(sv.loadgame, false, "createServerState loadgame default mismatch");
assert.equal(sv.time, 0, "createServerState time default mismatch");
assert.equal(sv.framenum, 0, "createServerState framenum default mismatch");
assert.equal(sv.name, "", "createServerState name default mismatch");
assert.equal(sv.models.length, 256, "createServerState models length mismatch");
assert.equal(sv.models.every((model) => model === null), true, "createServerState models default mismatch");
assert.equal(sv.configstrings.length, 2080, "createServerState configstrings length mismatch");
assert.equal(sv.configstrings.every((value) => value === ""), true, "createServerState configstrings default mismatch");
assert.equal(sv.baselines.length, 1024, "createServerState baselines length mismatch");
assert.notEqual(sv.baselines[0], sv.baselines[1], "createServerState baselines should be independent states");
assert.equal(sv.multicast.maxsize, 1400, "createServerState multicast maxsize mismatch");
assert.equal(sv.multicast_buf.length, 1400, "createServerState multicast buffer mismatch");
assert.equal(sv.demofile, null, "createServerState demofile default mismatch");
assert.equal(sv.timedemo, false, "createServerState timedemo default mismatch");

const frame = createClientFrame();
assert.equal(frame.areabytes, 0, "createClientFrame areabytes default mismatch");
assert.equal(frame.areabits.length, 32, "createClientFrame areabits length mismatch");
assert.equal(frame.areabits.every((value) => value === 0), true, "createClientFrame areabits default mismatch");
assert.equal(frame.num_entities, 0, "createClientFrame num_entities default mismatch");
assert.equal(frame.first_entity, 0, "createClientFrame first_entity default mismatch");
assert.equal(frame.senttime, 0, "createClientFrame senttime default mismatch");

const client = createServerClient();
assert.equal(client.state, client_state_t.cs_free, "createServerClient state default mismatch");
assert.equal(client.userinfo, "", "createServerClient userinfo default mismatch");
assert.equal(client.lastframe, 0, "createServerClient lastframe default mismatch");
assert.deepEqual(
  client.lastcmd,
  {
    msec: 0,
    buttons: 0,
    angles: [0, 0, 0],
    forwardmove: 0,
    sidemove: 0,
    upmove: 0,
    impulse: 0,
    lightlevel: 0
  },
  "createServerClient lastcmd default mismatch"
);
assert.equal(client.commandMsec, 0, "createServerClient commandMsec default mismatch");
assert.equal(client.frame_latency.length, LATENCY_COUNTS, "createServerClient frame latency length mismatch");
assert.equal(client.frame_latency.every((value) => value === 0), true, "createServerClient frame latency default mismatch");
assert.equal(client.ping, 0, "createServerClient ping default mismatch");
assert.equal(client.message_size.length, RATE_MESSAGES, "createServerClient message size length mismatch");
assert.equal(client.message_size.every((value) => value === 0), true, "createServerClient message size default mismatch");
assert.equal(client.rate, 0, "createServerClient rate default mismatch");
assert.equal(client.surpressCount, 0, "createServerClient surpressCount default mismatch");
assert.equal(client.edict, null, "createServerClient edict default mismatch");
assert.equal(client.name, "", "createServerClient name default mismatch");
assert.equal(client.messagelevel, 0, "createServerClient messagelevel default mismatch");
assert.equal(client.frames.length, 16, "createServerClient frame history length mismatch");
assert.notEqual(client.frames[0], client.frames[1], "createServerClient frames should be independent states");
assert.equal(client.datagram.allowoverflow, true, "createServerClient datagram overflow flag mismatch");
assert.equal(client.datagram.maxsize, 1400, "createServerClient datagram maxsize mismatch");
assert.equal(client.datagram_buf.length, 1400, "createServerClient datagram buffer mismatch");
assert.equal(client.download, null, "createServerClient download default mismatch");
assert.equal(client.downloadsize, 0, "createServerClient downloadsize default mismatch");
assert.equal(client.downloadcount, 0, "createServerClient downloadcount default mismatch");
assert.equal(client.lastmessage, 0, "createServerClient lastmessage default mismatch");
assert.equal(client.lastconnect, 0, "createServerClient lastconnect default mismatch");
assert.equal(client.challenge, 0, "createServerClient challenge default mismatch");
assert.equal(client.netchan.message.allowoverflow, false, "createServerClient netchan pre-setup overflow flag mismatch");

const challenge = createChallenge();
assert.equal(challenge.challenge, 0, "createChallenge challenge default mismatch");
assert.equal(challenge.time, 0, "createChallenge time default mismatch");
assert.equal(challenge.adr.ip.length, 4, "createChallenge netadr ip length mismatch");

const svs = createServerStatic();
assert.equal(svs.initialized, false, "createServerStatic initialized default mismatch");
assert.equal(svs.realtime, 0, "createServerStatic realtime default mismatch");
assert.equal(svs.mapcmd, "", "createServerStatic mapcmd default mismatch");
assert.equal(svs.spawncount, 0, "createServerStatic spawncount default mismatch");
assert.equal(svs.clients.length, 0, "createServerStatic clients default mismatch");
assert.equal(svs.num_client_entities, 0, "createServerStatic num_client_entities default mismatch");
assert.equal(svs.next_client_entities, 0, "createServerStatic next_client_entities default mismatch");
assert.equal(svs.client_entities.length, 0, "createServerStatic client_entities default mismatch");
assert.equal(svs.last_heartbeat, 0, "createServerStatic last_heartbeat default mismatch");
assert.equal(svs.challenges.length, MAX_CHALLENGES, "createServerStatic challenge table length mismatch");
assert.notEqual(svs.challenges[0], svs.challenges[1], "createServerStatic challenges should be independent states");
assert.equal(svs.demofile, null, "createServerStatic demofile default mismatch");
assert.equal(svs.demo_multicast.allowoverflow, true, "createServerStatic demo multicast overflow flag mismatch");
assert.equal(svs.demo_multicast.maxsize, 1400, "createServerStatic demo multicast maxsize mismatch");
assert.equal(svs.demo_multicast_buf.length, 1400, "createServerStatic demo multicast buffer mismatch");
assert.equal(computeServerClientEntityCapacity(4), 4096, "computeServerClientEntityCapacity mismatch");

const globals = createServerHeaderState();
assert.equal(globals.net_message.maxsize, 1400, "createServerHeaderState net_message maxsize mismatch");
assert.equal(globals.net_message.allowoverflow, true, "createServerHeaderState net_message overflow flag mismatch");
assert.equal(globals.master_adr.length, MAX_MASTERS, "createServerHeaderState master address count mismatch");
assert.equal(globals.sv.state, server_state_t.ss_dead, "createServerHeaderState sv state mismatch");
assert.equal(globals.svs.challenges.length, MAX_CHALLENGES, "createServerHeaderState challenge count mismatch");
assert.equal(globals.sv_paused, null, "createServerHeaderState sv_paused default mismatch");
assert.equal(globals.maxclients, null, "createServerHeaderState maxclients default mismatch");
assert.equal(globals.sv_noreload, null, "createServerHeaderState sv_noreload default mismatch");
assert.equal(globals.sv_airaccelerate, null, "createServerHeaderState sv_airaccelerate default mismatch");
assert.equal(globals.sv_enforcetime, null, "createServerHeaderState sv_enforcetime default mismatch");
assert.equal(globals.sv_player, null, "createServerHeaderState sv_player default mismatch");

const edict0 = createRuntimeEntity({}, 0);
const edict1 = createRuntimeEntity({}, 1);
const gameExports = {
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
  edicts: [edict0, edict1],
  edict_size: 0,
  num_edicts: 2,
  max_edicts: 1024
} satisfies game_export_t;

assert.equal(EDICT_NUM(gameExports, 1), edict1, "EDICT_NUM mismatch");
assert.equal(NUM_FOR_EDICT(gameExports, edict1), 1, "NUM_FOR_EDICT mismatch");

console.log("quake2-server-header: ok");
