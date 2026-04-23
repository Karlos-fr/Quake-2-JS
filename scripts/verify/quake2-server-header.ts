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
assert.equal(server_state_t.ss_pic, 5, "server_state_t ss_pic mismatch");
assert.equal(client_state_t.cs_free, 0, "client_state_t cs_free mismatch");
assert.equal(client_state_t.cs_spawned, 3, "client_state_t cs_spawned mismatch");
assert.equal(redirect_t.RD_NONE, 0, "redirect_t RD_NONE mismatch");
assert.equal(redirect_t.RD_PACKET, 2, "redirect_t RD_PACKET mismatch");

const sv = createServerState();
assert.equal(sv.models.length, 256, "createServerState models length mismatch");
assert.equal(sv.configstrings.length, 2080, "createServerState configstrings length mismatch");
assert.equal(sv.baselines.length, 1024, "createServerState baselines length mismatch");
assert.equal(sv.multicast_buf.length, 1400, "createServerState multicast buffer mismatch");

const client = createServerClient();
assert.equal(client.frame_latency.length, LATENCY_COUNTS, "createServerClient frame latency length mismatch");
assert.equal(client.message_size.length, RATE_MESSAGES, "createServerClient message size length mismatch");
assert.equal(client.frames.length, 16, "createServerClient frame history length mismatch");
assert.equal(client.datagram_buf.length, 1400, "createServerClient datagram buffer mismatch");

const svs = createServerStatic();
assert.equal(svs.challenges.length, MAX_CHALLENGES, "createServerStatic challenge table length mismatch");
assert.equal(svs.demo_multicast_buf.length, 1400, "createServerStatic demo multicast buffer mismatch");
assert.equal(computeServerClientEntityCapacity(4), 4096, "computeServerClientEntityCapacity mismatch");

const globals = createServerHeaderState();
assert.equal(globals.master_adr.length, MAX_MASTERS, "createServerHeaderState master address count mismatch");
assert.equal(globals.sv.state, server_state_t.ss_dead, "createServerHeaderState sv state mismatch");
assert.equal(globals.svs.challenges.length, MAX_CHALLENGES, "createServerHeaderState challenge count mismatch");

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
