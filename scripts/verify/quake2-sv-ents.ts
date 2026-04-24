/**
 * File: quake2-sv-ents.ts
 * Purpose: Verify the TypeScript port target for `server/sv_ents.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for server frame construction and encoding.
 *
 * Dependencies:
 * - packages/server/src/sv_ents.ts
 * - packages/server/src/sv_world.ts
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
  createServerEntityProcedures,
  createServerState,
  createServerStatic,
  createServerWorldProcedures
} from "../../packages/server/src/index.js";
import {
  MAX_MSGLEN,
  MSG_WriteByte,
  createCollisionWorld,
  createEntityState,
  svc_ops_e
} from "../../packages/qcommon/src/index.js";
import { createSizeBuffer } from "../../packages/memory/src/index.js";

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

  const sv = createServerState();
  const svs = createServerStatic();
  sv.models[1] = collisionWorld.map_cmodels[0];
  svs.num_client_entities = 256;
  svs.client_entities = Array.from({ length: svs.num_client_entities }, () => createEntityState());

  const worldspawn = createRuntimeEntity({}, 0);
  worldspawn.inuse = true;

  const player = createRuntimeEntity({}, 1);
  player.inuse = true;
  player.client = createGameClient();
  player.client.ps.pmove.origin = [0, 0, 256];
  player.client.ps.viewoffset = [0, 0, 22];
  player.s.origin = [0, 0, 32];
  player.s.modelindex = 255;
  player.mins = [-16, -16, -24];
  player.maxs = [16, 16, 32];

  const item = createRuntimeEntity({}, 2);
  item.inuse = true;
  item.s.origin = [64, 0, 32];
  item.s.modelindex = 1;
  item.mins = [-16, -16, -16];
  item.maxs = [16, 16, 16];

  const ge = createGameExports([worldspawn, player, item]);
  const world = createServerWorldProcedures({ sv, ge, collisionWorld });
  world.SV_ClearWorld();
  world.SV_LinkEdict(player);
  world.SV_LinkEdict(item);

  const client = createServerClient();
  client.edict = player;
  sv.framenum = 1;

  const demoWrites: Uint8Array[] = [];
  const ents = createServerEntityProcedures({
    sv,
    svs,
    ge,
    collisionWorld,
    maxclients: {
      name: "maxclients",
      string: "1",
      latched_string: null,
      flags: 0,
      modified: false,
      value: 1
    },
    writeDemoMessage: (_demofile, payload) => {
      demoWrites.push(payload);
    }
  });

  ents.SV_BuildClientFrame(client);
  const frame = client.frames[sv.framenum & 15]!;
  assert.equal(frame.senttime, svs.realtime, "SV_BuildClientFrame should store realtime senttime");
  assert.ok(frame.num_entities >= 1, "SV_BuildClientFrame should collect at least the player entity");

  const msg = createSizeBuffer(MAX_MSGLEN);
  ents.SV_WriteFrameToClient(client, msg);
  assert.ok(msg.cursize > 0, "SV_WriteFrameToClient should write bytes");
  assert.equal(msg.data[0], svc_ops_e.svc_frame, "SV_WriteFrameToClient should start with svc_frame");

  svs.demofile = {};
  MSG_WriteByte(svs.demo_multicast, 123);
  ents.SV_RecordDemoMessage();
  assert.equal(demoWrites.length, 1, "SV_RecordDemoMessage should emit one binary payload");
  assert.equal(svs.demo_multicast.cursize, 0, "SV_RecordDemoMessage should clear demo multicast buffer");

  console.log("quake2-sv-ents: ok");
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
