/**
 * File: quake2-sv-game.ts
 * Purpose: Verify the TypeScript port target for `server/sv_game.c` (current subset).
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the server/game import bridge and `SV_InitGameProgs`.
 *
 * Dependencies:
 * - packages/server/src/sv_game.ts
 */

import fs from "node:fs";
import path from "node:path";
import { strict as assert } from "node:assert";

import { findPakEntry, parseBsp, parsePak, readPakEntryData } from "../../packages/formats/src/index.js";
import { GAME_API_VERSION, createRuntimeEntity } from "../../packages/game/src/index.js";
import { createGameClient } from "../../packages/game/src/runtime.js";
import type { game_export_t, game_import_t } from "../../packages/game/src/index.js";
import { createServerClient, createServerGameProcedures, createServerState, createServerStatic } from "../../packages/server/src/index.js";
import {
  Cvar_Get,
  createCommandRuntime,
  createCollisionWorld,
  createCvarRuntime,
  svc_ops_e
} from "../../packages/qcommon/src/index.js";
import { SZ_Clear } from "../../packages/memory/src/index.js";
import { server_state_t } from "../../packages/server/src/server.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base1.bsp";

main();

function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pak = parsePak(new Uint8Array(fs.readFileSync(pakPath)), pakPath);
  const bspEntry = findPakEntry(pak, MAP_PATH);
  if (!bspEntry) {
    throw new Error(`${MAP_PATH} introuvable dans ${pakPath}`);
  }

  const map = parseBsp(readPakEntryData(pak, bspEntry), MAP_PATH);
  const collisionWorld = createCollisionWorld(map);
  const cmd = createCommandRuntime();
  const cvar = createCvarRuntime();
  const sv = createServerState();
  const svs = createServerStatic();
  const placeholderGe = createPlaceholderGe();
  const maxclients = Cvar_Get(cvar, "maxclients", "1", 0);
  const client = createServerClient();
  const player = createRuntimeEntity({}, 1);
  player.inuse = true;
  player.client = createGameClient();
  svs.clients = [client];
  client.edict = player;
  client.state = 2;
  placeholderGe.edicts = [createRuntimeEntity({}, 0), player];

  let multicastCalls = 0;
  const procedures = createServerGameProcedures({
    sv,
    svs,
    ge: placeholderGe,
    cmd,
    cvar,
    collisionWorld,
    maxclients,
    SV_Multicast: () => {
      multicastCalls += 1;
    },
    SV_ClientPrintf: () => {},
    SV_BroadcastPrintf: () => {},
    SV_StartSound: () => {},
    SV_LinkEdict: () => {},
    SV_UnlinkEdict: () => {},
    SV_AreaEdicts: () => 0,
    SV_Trace: () => ({
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [0, 0, 0],
      plane: { normal: [0, 0, 0], dist: 0, type: 0, signbits: 0 },
      surface: null,
      contents: 0,
      ent: null
    }),
    SV_PointContents: () => 0,
    SV_ModelIndex: (name) => {
      sv.configstrings[32 + 1] = name;
      return 1;
    },
    SV_SoundIndex: () => 1,
    SV_ImageIndex: () => 1
  });

  procedures.SV_InitGameProgs();
  assert.equal(placeholderGe.apiversion, 3, "SV_InitGameProgs should attach the Quake II game export table");
  assert.equal(typeof placeholderGe.Init, "function", "SV_InitGameProgs should expose game Init");

  placeholderGe.ClientUserinfoChanged(player, "\\name\\Player");
  assert.equal(player.client?.pers.netname, "Player", "game imports should drive the gameplay userinfo path");

  sv.state = server_state_t.ss_game;
  placeholderGe.SpawnEntities("base1", map.entities, "");
  assert.ok(placeholderGe.num_edicts > 1, "SpawnEntities should populate gameplay entities through the bridged game export");
  assert.equal(multicastCalls >= 1, true, "PF_Configstring should multicast gameplay configstrings when not loading");
  assert.equal(sv.configstrings[0].length > 0, true, "SpawnEntities should update server configstrings through PF_Configstring");

  procedures.SV_ShutdownGameProgs();
  verifyImportTable(collisionWorld);
  console.log("quake2-sv-game: ok");
}

function verifyImportTable(collisionWorld: ReturnType<typeof createCollisionWorld>): void {
  const cmd = createCommandRuntime();
  const cvar = createCvarRuntime();
  const sv = createServerState();
  const svs = createServerStatic();
  const ge = createPlaceholderGe();
  const maxclients = Cvar_Get(cvar, "maxclients", "1", 0);
  const client = createServerClient();
  const player = createRuntimeEntity({}, 1);
  player.inuse = true;
  player.client = createGameClient();
  client.edict = player;
  svs.clients = [client];
  ge.edicts = [createRuntimeEntity({}, 0), player];

  let capturedImports: game_import_t | null = null;
  let initCalls = 0;
  let shutdownCalls = 0;
  let multicastCalls = 0;
  let clientPrintfCalls = 0;
  let broadcastPrintfCalls = 0;
  let startSoundCalls = 0;
  let linkCalls = 0;
  let unlinkCalls = 0;
  let areaEdictCalls = 0;
  let traceCalls = 0;
  let pointContentsCalls = 0;
  let debugGraphCalls = 0;
  let printfText = "";

  const procedures = createServerGameProcedures({
    sv,
    svs,
    ge,
    cmd,
    cvar,
    collisionWorld,
    maxclients,
    getGameApi: (imports) => {
      capturedImports = imports;
      const loadedGe = createPlaceholderGe();
      loadedGe.apiversion = GAME_API_VERSION;
      loadedGe.edicts = ge.edicts;
      loadedGe.num_edicts = ge.edicts.length;
      loadedGe.Init = () => {
        initCalls += 1;
      };
      loadedGe.Shutdown = () => {
        shutdownCalls += 1;
      };
      return loadedGe;
    },
    SV_Multicast: () => {
      multicastCalls += 1;
      SZ_Clear(sv.multicast);
    },
    SV_ClientPrintf: (_client, _level, _fmt, text) => {
      clientPrintfCalls += 1;
      assert.equal(text, "direct message");
    },
    SV_BroadcastPrintf: (_level, fmt, value) => {
      broadcastPrintfCalls += 1;
      assert.equal(fmt, "broadcast %i");
      assert.equal(value, 9);
    },
    SV_StartSound: (origin, entity, channel, soundindex, volume, attenuation, timeofs) => {
      startSoundCalls += 1;
      assert.equal(entity, player);
      assert.equal(channel, 2);
      assert.equal(soundindex, 3);
      assert.equal(volume, 1);
      assert.equal(attenuation, 0);
      assert.equal(timeofs, 0);
      if (startSoundCalls === 2) {
        assert.deepEqual(origin, [1, 2, 3]);
      }
    },
    SV_LinkEdict: () => {
      linkCalls += 1;
    },
    SV_UnlinkEdict: () => {
      unlinkCalls += 1;
    },
    SV_AreaEdicts: () => {
      areaEdictCalls += 1;
      return 0;
    },
    SV_Trace: () => {
      traceCalls += 1;
      return {
        allsolid: false,
        startsolid: false,
        fraction: 1,
        endpos: [0, 0, 0],
        plane: { normal: [0, 0, 0], dist: 0, type: 0, signbits: 0 },
        surface: null,
        contents: 0,
        ent: null
      };
    },
    SV_PointContents: () => {
      pointContentsCalls += 1;
      return 0;
    },
    SV_ModelIndex: (name) => {
      assert.equal(name, "models/test.md2");
      return 7;
    },
    SV_SoundIndex: (name) => name.length,
    SV_ImageIndex: (name) => name.length,
    debugGraph: () => {
      debugGraphCalls += 1;
    },
    onPrintf: (message) => {
      printfText += message;
    },
    SV_Error: (error, ...args) => {
      throw new Error(`${error}:${args.join(",")}`);
    }
  });

  procedures.SV_InitGameProgs();
  assert.equal(initCalls, 1, "SV_InitGameProgs should call the loaded game Init");
  assert.ok(capturedImports, "SV_InitGameProgs should pass an import table to GetGameApi");

  const imports = capturedImports;
  imports.bprintf(2, "broadcast %i", 9);
  assert.equal(broadcastPrintfCalls, 1, "bprintf should forward to SV_BroadcastPrintf");

  imports.dprintf("debug %s", "line");
  assert.equal(printfText, "debug line", "dprintf should print through the server console hook");

  imports.cprintf(player, 2, "direct %s", "message");
  assert.equal(clientPrintfCalls, 1, "cprintf should forward valid clients to SV_ClientPrintf");

  imports.centerprintf(player, "center");
  assert.ok(client.netchan.message.cursize > 0, "centerprintf should unicast reliable centerprint bytes");

  SZ_Clear(client.netchan.message);
  imports.WriteByte(svc_ops_e.svc_nop);
  imports.unicast(player, true);
  assert.ok(client.netchan.message.cursize > 0, "unicast reliable should write to netchan.message");
  assert.equal(sv.multicast.cursize, 0, "unicast should clear sv.multicast");

  imports.WriteByte(svc_ops_e.svc_nop);
  imports.unicast(player, false);
  assert.ok(client.datagram.cursize > 0, "unicast unreliable should write to datagram");

  imports.setmodel(player, "models/test.md2");
  assert.equal(player.s.modelindex, 7, "setmodel should update entity modelindex");

  sv.state = server_state_t.ss_loading;
  imports.configstring(5, "loading-value");
  assert.equal(multicastCalls, 0, "configstring should not multicast while loading");
  sv.state = server_state_t.ss_game;
  imports.configstring(5, "game-value");
  assert.equal(multicastCalls, 1, "configstring should multicast while server is active");

  imports.sound(player, 2, 3, 1, 0, 0);
  imports.positioned_sound([1, 2, 3], player, 2, 3, 1, 0, 0);
  assert.equal(startSoundCalls, 2, "sound imports should forward to SV_StartSound");

  imports.linkentity(player);
  imports.unlinkentity(player);
  imports.BoxEdicts([0, 0, 0], [1, 1, 1], [], 0, 0);
  imports.trace([0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1], null, 0);
  imports.pointcontents([0, 0, 0]);
  assert.equal(linkCalls, 1, "linkentity should forward to SV_LinkEdict");
  assert.equal(unlinkCalls, 1, "unlinkentity should forward to SV_UnlinkEdict");
  assert.equal(areaEdictCalls, 1, "BoxEdicts should forward to SV_AreaEdicts");
  assert.equal(traceCalls, 1, "trace should forward to SV_Trace");
  assert.equal(pointContentsCalls, 1, "pointcontents should forward to SV_PointContents");

  const beforeWrite = sv.multicast.cursize;
  imports.WriteChar(1);
  imports.WriteShort(2);
  imports.WriteLong(3);
  imports.WriteFloat(4);
  imports.WriteString("five");
  imports.WritePosition([1, 2, 3]);
  imports.WriteDir([0, 0, 1]);
  imports.WriteAngle(90);
  assert.ok(sv.multicast.cursize > beforeWrite, "PF_Write* imports should append to sv.multicast");

  const allocation = imports.TagMalloc(16, 12);
  assert.ok(allocation instanceof Uint8Array, "TagMalloc should return a Uint8Array allocation");
  imports.TagFree(allocation);
  imports.FreeTags(12);

  assert.equal(imports.cvar("sv_game_test", "1", 0)?.string, "1", "cvar should forward to Cvar_Get");
  assert.equal(imports.cvar_set("sv_game_test", "2")?.string, "2", "cvar_set should forward to Cvar_Set");
  assert.equal(imports.cvar_forceset("sv_game_test", "3")?.string, "3", "cvar_forceset should forward to Cvar_ForceSet");

  cmd.cmd_argc = 2;
  cmd.cmd_argv = ["say", "hello"];
  cmd.cmd_args = "hello";
  assert.equal(imports.argc(), 2, "argc should expose command runtime argc");
  assert.equal(imports.argv(1), "hello", "argv should expose command runtime argv");
  assert.equal(imports.args(), "hello", "args should expose command runtime args");
  imports.AddCommandString("echo ok\n");
  assert.ok(cmd.cmd_text.cursize > 0, "AddCommandString should append to the command buffer");

  imports.DebugGraph(1, 2);
  assert.equal(debugGraphCalls, 1, "DebugGraph should forward to the debug graph hook");

  assert.equal(imports.AreasConnected(0, 0), true, "AreasConnected should use collision area state");
  imports.SetAreaPortalState(0, true);
  assert.equal(imports.inPVS([0, 0, 0], [0, 0, 0]), true, "inPVS should answer visibility for same point");
  assert.equal(imports.inPHS([0, 0, 0], [0, 0, 0]), true, "inPHS should answer hearability for same point");

  assert.throws(() => imports.error("fatal %i", 7), /Game Error: fatal 7/, "error should route through SV_Error");

  procedures.SV_InitGameProgs();
  assert.equal(shutdownCalls, 1, "SV_InitGameProgs should shutdown an already loaded game before replacing it");
  assert.equal(initCalls, 2, "SV_InitGameProgs should initialize the replacement game");
  procedures.SV_ShutdownGameProgs();
  assert.equal(shutdownCalls, 2, "SV_ShutdownGameProgs should call game Shutdown once");
}

function createPlaceholderGe(): game_export_t {
  const world = createRuntimeEntity({}, 0);
  world.inuse = true;
  return {
    apiversion: 0,
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
    edicts: [world],
    edict_size: 0,
    num_edicts: 1,
    max_edicts: 1024
  };
}
