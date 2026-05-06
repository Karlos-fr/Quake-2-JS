/**
 * File: quake2-sv-ccmds.ts
 * Purpose: Verify the currently ported subset of `server/sv_ccmds.c`.
 *
 * This file is not a direct source port.
 * It validates operator command registration and command-side effects.
 *
 * Dependencies:
 * - packages/server/src/sv_ccmds.ts
 */

import { strict as assert } from "node:assert";

import { createRuntimeEntity } from "../../packages/game/src/index.js";
import { createGameClient } from "../../packages/game/src/runtime.js";
import type { game_export_t } from "../../packages/game/src/index.js";
import {
  CVAR_LATCH,
  CVAR_SERVERINFO,
  Cmd_ExecuteString,
  CS_NAME,
  Cvar_ForceSet,
  Cvar_Get,
  Cvar_VariableString,
  MAX_CONFIGSTRINGS,
  MAX_OSPATH,
  MAX_QPATH,
  MAX_TOKEN_CHARS,
  PRINT_CHAT,
  STAT_FRAGS,
  STAT_HEALTH,
  svc_ops_e,
  createCommandRuntime,
  createCvarRuntime,
  createNetAdr,
  createQcommonNetRuntime
} from "../../packages/qcommon/src/index.js";
import {
  MAX_MASTERS,
  client_state_t,
  createServerClient,
  createServerConsoleProcedures,
  createServerState,
  createServerStatic,
  server_state_t
} from "../../packages/server/src/index.js";

const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const qnet = createQcommonNetRuntime();
const sv = createServerState();
const svs = createServerStatic();
const maxclients = Cvar_Get(cvar, "maxclients", "4", 0);
const dedicated = Cvar_Get(cvar, "dedicated", "1", 0);
const master_adr = Array.from({ length: MAX_MASTERS }, () => createNetAdr());

const playerEdict = createRuntimeEntity({}, 1);
playerEdict.client = createGameClient();
playerEdict.client.ps.stats[STAT_FRAGS] = 7;
playerEdict.inuse = true;
const client = createServerClient();
client.state = client_state_t.cs_spawned;
client.name = "PlayerOne";
client.userinfo = "\\name\\PlayerOne\\skin\\male/grunt";
client.edict = playerEdict;

const connectedClient = createServerClient();
connectedClient.state = client_state_t.cs_connected;
connectedClient.name = "Connecting";
connectedClient.lastmessage = 4500;
connectedClient.netchan.qport = 12345;

const zombieClient = createServerClient();
zombieClient.state = client_state_t.cs_zombie;
zombieClient.name = "Zombie";
zombieClient.lastmessage = 4000;
zombieClient.netchan.qport = 54321;

svs.clients = [client, connectedClient, zombieClient];
svs.initialized = true;
svs.realtime = 5000;
sv.name = "base1";

const printed: string[] = [];
let dropped = 0;
let broadcasts = 0;
let chats = 0;
const mapCalls: Array<{ attractloop: boolean; levelstring: string; loadgame: boolean }> = [];
let wipedCurrent = 0;
let copiedCurrentToSave0 = 0;
let copiedCurrentToSlot = 0;
let copiedCurrentToAny = 0;
let wroteLevel = 0;
let wroteServerAutosave = 0;
let wroteServerManual = 0;
let readServer = 0;
let openedDemos = 0;
let closedDemos = 0;
const demoWrites: Uint8Array[] = [];
let levelWriteSawClientInuseFalse = false;
let createdDemoPath = "";

const procedures = createServerConsoleProcedures({
  sv,
  svs,
  ge: null,
  cmd,
  cvar,
  qnet,
  maxclients,
  dedicated,
  master_adr,
  SV_Map: (attractloop, levelstring, loadgame) => {
    mapCalls.push({ attractloop, levelstring, loadgame });
  },
  SV_BroadcastPrintf: () => {
    broadcasts += 1;
  },
  SV_ClientPrintf: (_client, level, _fmt, text) => {
    if (level === PRINT_CHAT && String(text).startsWith("console:")) {
      chats += 1;
    }
  },
  SV_DropClient: () => {
    dropped += 1;
  },
  savegameExists: (path) => path === "baseq2/save/slot1/server.ssv",
  SV_WipeSavegame: (savename) => {
    if (savename === "current") {
      wipedCurrent += 1;
    }
  },
  SV_CopySaveGame: (src, dst) => {
    if (src === "current" && dst === "save0") {
      copiedCurrentToSave0 += 1;
    }
    if (src === "current" && dst === "slot1") {
      copiedCurrentToSlot += 1;
    }
    if (src === "current") {
      copiedCurrentToAny += 1;
    }
  },
  SV_WriteLevelFile: () => {
    wroteLevel += 1;
    if (playerEdict.inuse === false) {
      levelWriteSawClientInuseFalse = true;
    }
  },
  SV_WriteServerFile: (autosave) => {
    if (autosave) {
      wroteServerAutosave += 1;
    } else {
      wroteServerManual += 1;
    }
  },
  SV_ReadServerFile: () => {
    readServer += 1;
    svs.mapcmd = "base2";
  },
  openDemoFile: (_path) => {
    openedDemos += 1;
    return { tag: "demo-file" };
  },
  createPath: (path) => {
    createdDemoPath = path;
  },
  closeDemoFile: (_demofile) => {
    closedDemos += 1;
  },
  writeDemoMessage: (_demofile, payload) => {
    demoWrites.push(new Uint8Array(payload));
  },
  onPrintf: (message) => {
    printed.push(message);
  }
});

procedures.SV_InitOperatorCommands();

Cvar_Get(cvar, "hostname", "unit-host", CVAR_SERVERINFO);

svs.last_heartbeat = 12345;
Cmd_ExecuteString(cmd, "heartbeat");
assert.equal(svs.last_heartbeat, -9999999, "SV_Heartbeat_f should force the next heartbeat tick");

Cmd_ExecuteString(cmd, "status");
assert.ok(printed.some((line) => line.includes("map              : base1")), "SV_Status_f should print current map");
assert.ok(printed.some((line) => line.includes("CNCT") && line.includes("Connecting")), "SV_Status_f should show connecting clients");
assert.ok(printed.some((line) => line.includes("ZMBI") && line.includes("Zombie")), "SV_Status_f should show zombie clients");

Cmd_ExecuteString(cmd, "serverinfo");
assert.ok(printed.some((line) => line.includes("Server info settings:")), "SV_Serverinfo_f should print its header");
assert.ok(printed.some((line) => line.includes("hostname") && line.includes("unit-host")), "SV_Serverinfo_f should print serverinfo cvars");

Cmd_ExecuteString(cmd, "dumpuser 0");
assert.ok(printed.some((line) => line.includes("userinfo")), "SV_DumpUser_f should print its header");
assert.ok(printed.some((line) => line.includes("skin") && line.includes("male/grunt")), "SV_DumpUser_f should print selected userinfo");

Cmd_ExecuteString(cmd, "say \"hello\"");
assert.equal(chats, 1, "SV_ConSay_f should forward one chat message to spawned clients");

Cmd_ExecuteString(cmd, "kick 0");
assert.equal(dropped, 1, "SV_Kick_f should drop the selected client");
assert.equal(broadcasts, 1, "SV_Kick_f should broadcast a kick notice");

Cmd_ExecuteString(cmd, "setmaster 127.0.0.1");
assert.equal(master_adr[1].port, 27900, "SV_SetMaster_f should apply default master port");
assert.ok(printed.some((line) => line.includes("Master server at")), "SV_SetMaster_f should print configured master");

Cmd_ExecuteString(cmd, "demomap intro.cin");
assert.deepEqual(mapCalls.at(-1), { attractloop: true, levelstring: "intro.cin", loadgame: false }, "SV_DemoMap_f should start attract-loop map");

sv.state = server_state_t.ss_game;
Cmd_ExecuteString(cmd, "gamemap unit1");
assert.deepEqual(mapCalls.at(-1), { attractloop: false, levelstring: "unit1", loadgame: false }, "SV_GameMap_f should map to requested level");
assert.equal(wroteLevel, 1, "SV_GameMap_f should write level file when leaving a game");
assert.equal(wroteServerAutosave, 0, "SV_GameMap_f should not autosave on dedicated server");
assert.equal(levelWriteSawClientInuseFalse, true, "SV_GameMap_f should clear client edict inuse while writing level");
assert.equal(playerEdict.inuse, true, "SV_GameMap_f should restore client edict inuse after writing level");

sv.state = server_state_t.ss_game;
Cmd_ExecuteString(cmd, "save slot1");
assert.equal(wroteLevel, 2, "SV_Savegame_f should archive level state");
assert.equal(wroteServerManual, 1, "SV_Savegame_f should write non-autosave server state");
assert.equal(copiedCurrentToSlot, 1, "SV_Savegame_f should copy current save to target slot");

Cmd_ExecuteString(cmd, "load slot1");
assert.equal(readServer, 1, "SV_Loadgame_f should read server save data");
assert.deepEqual(mapCalls.at(-1), { attractloop: false, levelstring: "base2", loadgame: true }, "SV_Loadgame_f should map using restored mapcmd");

Cmd_ExecuteString(cmd, "load ../slot1");
assert.equal(readServer, 1, "SV_Loadgame_f should warn on bad savedir, then fail on missing save without reading server file");

Cmd_ExecuteString(cmd, "map base3");
assert.equal(wipedCurrent, 1, "SV_Map_f should wipe current save slot");
assert.deepEqual(mapCalls.at(-1), { attractloop: false, levelstring: "base3", loadgame: false }, "SV_Map_f should route through SV_GameMap_f");

sv.state = server_state_t.ss_game;
Cmd_ExecuteString(cmd, "save ../slot1");
assert.equal(copiedCurrentToAny, 2, "SV_Savegame_f should keep running after warning on bad savedir, matching original flow");

sv.state = server_state_t.ss_game;
svs.spawncount = 12;
sv.configstrings[0] = "Unit Test Level";
Cvar_Get(cvar, "gamedir", "baseq2", 0);
Cmd_ExecuteString(cmd, "serverrecord unittest");
assert.equal(openedDemos, 1, "SV_ServerRecord_f should open one demo file");
assert.equal(createdDemoPath, "demos/unittest.dm2", "SV_ServerRecord_f should create demo path before opening");
assert.equal(demoWrites.length, 1, "SV_ServerRecord_f should write one signon payload");
assert.ok(svs.demofile, "SV_ServerRecord_f should keep server demo handle");
const signon = demoWrites[0]!;
const signonLength = new DataView(signon.buffer, signon.byteOffset, signon.byteLength).getInt32(0, true);
assert.equal(signonLength, signon.length - 4, "SV_ServerRecord_f should prefix payload with little-endian byte length");
assert.equal(signon[4], svc_ops_e.svc_serverdata, "SV_ServerRecord_f signon should start with svc_serverdata");

Cmd_ExecuteString(cmd, "serverrecord duplicate");
assert.equal(openedDemos, 1, "SV_ServerRecord_f should reject duplicate recordings");
assert.ok(printed.some((line) => line.includes("Already recording.")), "SV_ServerRecord_f should report duplicate recordings");

Cmd_ExecuteString(cmd, "serverstop");
assert.equal(closedDemos, 1, "SV_ServerStop_f should close active server demo");
assert.equal(svs.demofile, null, "SV_ServerStop_f should clear server demo handle");

Cmd_ExecuteString(cmd, "serverstop");
assert.equal(closedDemos, 1, "SV_ServerStop_f should not close when no demo is active");
assert.ok(printed.some((line) => line.includes("Not doing a serverrecord.")), "SV_ServerStop_f should report inactive demo state");

Cmd_ExecuteString(cmd, "sv");
assert.ok(printed.some((line) => line.includes("No game loaded.")), "SV_ServerCommand_f should reject when game dll is absent");

// Fallback I/O path without specialized savegame callbacks.
const cmd2 = createCommandRuntime();
const cvar2 = createCvarRuntime();
const qnet2 = createQcommonNetRuntime();
const sv2 = createServerState();
const svs2 = createServerStatic();
const maxclients2 = Cvar_Get(cvar2, "maxclients", "1", 0);
const dedicated2 = Cvar_Get(cvar2, "dedicated", "1", 0);
Cvar_Get(cvar2, "deathmatch", "0", 0);
Cvar_Get(cvar2, "skill", "2", CVAR_LATCH);
Cvar_Get(cvar2, "ui_name", "Player", 0);
const player2 = createRuntimeEntity({}, 1);
player2.client = createGameClient();
player2.client.ps.stats[STAT_HEALTH] = 100;
const cl2 = createServerClient();
cl2.state = client_state_t.cs_spawned;
cl2.edict = player2;
svs2.clients = [cl2];
sv2.state = server_state_t.ss_game;
sv2.name = "unitmap";
sv2.configstrings[CS_NAME] = "Unit Test";
svs2.mapcmd = "unitmap";

const fs = new Map<string, Uint8Array>();
const mapCalls2: Array<{ attractloop: boolean; levelstring: string; loadgame: boolean }> = [];
let readLevelPath = "";
let writeLevelPath = "";
let readGamePath = "";
let writeGamePath = "";

const ge2 = {
  apiversion: 3,
  Init: () => {},
  Shutdown: () => {},
  SpawnEntities: () => {},
  WriteGame: (filename: string, _autosave: boolean) => {
    writeGamePath = filename;
  },
  ReadGame: (filename: string) => {
    readGamePath = filename;
  },
  WriteLevel: (filename: string) => {
    writeLevelPath = filename;
  },
  ReadLevel: (filename: string) => {
    readLevelPath = filename;
  },
  ClientConnect: () => true,
  ClientBegin: () => {},
  ClientUserinfoChanged: () => {},
  ClientDisconnect: () => {},
  ClientCommand: () => {},
  ClientThink: () => {},
  RunFrame: () => {},
  ServerCommand: () => {},
  edicts: [createRuntimeEntity({}, 0), player2],
  edict_size: 0,
  num_edicts: 2,
  max_edicts: 1024
} satisfies game_export_t;

const procedures2 = createServerConsoleProcedures({
  sv: sv2,
  svs: svs2,
  ge: ge2,
  cmd: cmd2,
  cvar: cvar2,
  qnet: qnet2,
  maxclients: maxclients2,
  dedicated: dedicated2,
  master_adr: Array.from({ length: MAX_MASTERS }, () => createNetAdr()),
  SV_Map: (attractloop, levelstring, loadgame) => {
    mapCalls2.push({ attractloop, levelstring, loadgame });
  },
  SV_InitGame: () => {},
  FS_Gamedir: () => "baseq2",
  createPath: () => {},
  readBinaryFile: (path) => fs.get(path) ? new Uint8Array(fs.get(path)!) : null,
  writeBinaryFile: (path, data) => {
    fs.set(path, new Uint8Array(data));
    return true;
  },
  removeFile: (path) => {
    fs.delete(path);
  },
  listFiles: (pattern) => {
    const normalized = pattern.replace(/\\/g, "/");
    const star = normalized.indexOf("*");
    const prefix = star >= 0 ? normalized.slice(0, star) : normalized;
    const suffix = star >= 0 ? normalized.slice(star + 1) : "";
    const out: string[] = [];
    for (const key of fs.keys()) {
      const file = key.replace(/\\/g, "/");
      if (!file.startsWith(prefix)) {
        continue;
      }
      if (!suffix || file.endsWith(suffix)) {
        out.push(key);
      }
    }
    return out;
  }
});

procedures2.SV_InitOperatorCommands();
Cmd_ExecuteString(cmd2, "save slotA");
assert.ok(fs.has("baseq2/save/current/unitmap.sv2"), "fallback save path should write current .sv2");
assert.ok(fs.has("baseq2/save/current/server.ssv"), "fallback save path should write current server.ssv");
assert.ok(fs.has("baseq2/save/slotA/server.ssv"), "fallback save path should copy save slot server.ssv");
assert.equal(writeLevelPath, "baseq2/save/current/unitmap.sav", "fallback save path should call ge.WriteLevel");
assert.equal(writeGamePath, "baseq2/save/current/game.ssv", "fallback save path should call ge.WriteGame");
const sv2Payload = fs.get("baseq2/save/current/unitmap.sv2")!;
assert.equal(
  sv2Payload.length,
  MAX_CONFIGSTRINGS * MAX_QPATH,
  "fallback .sv2 payload should match fixed configstrings block size when no portal state is present"
);
assert.equal(
  String.fromCharCode(...sv2Payload.subarray(0, "Unit Test".length)),
  "Unit Test",
  "fallback .sv2 should start with encoded configstring[0]"
);

const serverSsv = fs.get("baseq2/save/current/server.ssv")!;
assert.ok(serverSsv.length >= 32 + MAX_TOKEN_CHARS, "server.ssv payload should include comment and mapcmd blocks");
const mapcmdBytes = serverSsv.subarray(32, 32 + MAX_TOKEN_CHARS);
const mapcmdText = String.fromCharCode(...mapcmdBytes.subarray(0, "unitmap".length));
assert.equal(mapcmdText, "unitmap", "server.ssv should encode svs.mapcmd in the fixed mapcmd block");
assert.equal(
  (serverSsv.length - (32 + MAX_TOKEN_CHARS)) % (MAX_OSPATH + 128),
  0,
  "server.ssv cvar section should be an integral sequence of fixed-size cvar records"
);

Cvar_ForceSet(cvar2, "skill", "0");
assert.equal(Cvar_VariableString(cvar2, "skill"), "0", "precondition: skill cvar should be changed before load");

Cmd_ExecuteString(cmd2, "load slotA");
assert.deepEqual(mapCalls2.at(-1), { attractloop: false, levelstring: "unitmap", loadgame: true }, "fallback load path should map restored slot");
assert.equal(readGamePath, "baseq2/save/current/game.ssv", "fallback load path should call ge.ReadGame");
assert.equal(readLevelPath, "", "fallback load path should not force ReadLevel in sv_ccmds load flow");
assert.equal(Cvar_VariableString(cvar2, "skill"), "2", "fallback load path should restore CVAR_LATCH values from server.ssv");

console.log("quake2-sv-ccmds: ok");
