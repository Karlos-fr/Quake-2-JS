/**
 * File: quake2-sv-init.ts
 * Purpose: Verify the TypeScript port target for `server/sv_init.c` (current subset).
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for resource indices, baselines, initgame and map/spawn flows.
 *
 * Dependencies:
 * - packages/server/src/sv_init.ts
 */

import { strict as assert } from "node:assert";
import fs from "node:fs";
import path from "node:path";

import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/index.js";
import { createRuntimeEntity } from "../../packages/game/src/index.js";
import { createGameClient } from "../../packages/game/src/runtime.js";
import type { game_export_t } from "../../packages/game/src/index.js";
import {
  createServerInitProcedures,
  createServerState,
  createServerStatic
} from "../../packages/server/src/index.js";
import { server_state_t } from "../../packages/server/src/server.js";
import {
  CS_AIRACCEL,
  CS_IMAGES,
  CS_MAPCHECKSUM,
  CS_MODELS,
  CS_SOUNDS,
  Cvar_Get,
  Cvar_Set,
  createCommandRuntime,
  createCollisionModelRuntime,
  createCvarRuntime,
  createNetAdr,
  createQcommonNetRuntime
} from "../../packages/qcommon/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base1.bsp";

const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
if (!fs.existsSync(pakPath)) {
  throw new Error(`pak0.pak introuvable: ${pakPath}`);
}

const pak = parsePak(new Uint8Array(fs.readFileSync(pakPath)), pakPath);
const cvar = createCvarRuntime();
const cmd = createCommandRuntime();
const qnet = createQcommonNetRuntime();
const collision = createCollisionModelRuntime();
const sv = createServerState();
const svs = createServerStatic();
let spawnEntitiesCalls = 0;
let spawnEntitiesArgs: [string, string, string] | null = null;
let runFrameCalls = 0;
const ge = createGameExports();
const maxclients = Cvar_Get(cvar, "maxclients", "2", 0);
const dedicated = Cvar_Get(cvar, "dedicated", "0", 0);
const sv_noreload = Cvar_Get(cvar, "sv_noreload", "0", 0);
const sv_airaccelerate = Cvar_Get(cvar, "sv_airaccelerate", "5", 0);

const multicastSnapshots: number[] = [];
const broadcasts: string[] = [];
const loadRequests: string[] = [];
const savegameReads: string[] = [];
let clearWorldCalls = 0;
let initGameProgsCalls = 0;
let dropCalls = 0;
let loadingPlaqueCalls = 0;
let deferCalls = 0;
let pmAiraccelerate = -1;

const procedures = createServerInitProcedures({
  sv,
  svs,
  ge,
  cmd,
  cvar,
  qnet,
  collisionModelRuntime: collision,
  loadMapFile: (name) => {
    loadRequests.push(name);
    const entry = findPakEntry(pak, name);
    return entry ? readPakEntryData(pak, entry) : undefined;
  },
  maxclients,
  dedicated,
  sv_noreload,
  sv_airaccelerate,
  master_adr: [createNetAdr()],
  SV_Multicast: () => {
    multicastSnapshots.push(sv.multicast.cursize);
  },
  SV_ClearWorld: () => {
    clearWorldCalls += 1;
  },
  SV_BroadcastCommand: (fmt) => {
    broadcasts.push(fmt);
  },
  SV_SendClientMessages: () => {
    broadcasts.push("send");
  },
  SV_InitGameProgs: () => {
    initGameProgsCalls += 1;
  },
  SV_ReadLevelFile: () => {
    savegameReads.push(sv.name);
  },
  CL_Drop: () => {
    dropCalls += 1;
  },
  SCR_BeginLoadingPlaque: () => {
    loadingPlaqueCalls += 1;
  },
  Cbuf_CopyToDefer: () => {
    deferCalls += 1;
  },
  FS_Gamedir: () => "baseq2",
  savegameExists: (path) => path.endsWith("/unit1.sav"),
  setPmAiraccelerate: (value) => {
    pmAiraccelerate = value;
  },
  randomInt: () => 12345
});

assert.equal(procedures.SV_FindIndex("", CS_MODELS, 256, true), 0, "SV_FindIndex should reject empty names");
assert.equal(procedures.SV_ModelIndex("models/weapon.md2"), 1, "SV_ModelIndex should allocate a model slot");
assert.equal(procedures.SV_ModelIndex("models/weapon.md2"), 1, "SV_ModelIndex should reuse an existing slot");
assert.equal(procedures.SV_FindIndex("models/missing.md2", CS_MODELS, 256, false), 0, "SV_FindIndex should not allocate when create is false");
assert.equal(procedures.SV_SoundIndex("world/ambience.wav"), 1, "SV_SoundIndex should allocate a sound slot");
assert.equal(procedures.SV_ImageIndex("pics/status.pcx"), 1, "SV_ImageIndex should allocate an image slot");
assert.equal(sv.configstrings[CS_SOUNDS + 1], "world/ambience.wav", "SV_SoundIndex should publish into CS_SOUNDS");
assert.equal(sv.configstrings[CS_IMAGES + 1], "pics/status.pcx", "SV_ImageIndex should publish into CS_IMAGES");
assert.throws(
  () => procedures.SV_FindIndex("models/overflow.md2", CS_MODELS, 2, true),
  /overflow/,
  "SV_FindIndex should reject full configstring ranges"
);
assert.ok(multicastSnapshots.length >= 1, "SV_FindIndex should multicast configstring changes outside loading");

ge.edicts[1]!.s.modelindex = 7;
ge.edicts[1]!.s.sound = 2;
ge.edicts[1]!.s.origin = [10, 20, 30];
ge.edicts[2]!.s.effects = 4;
ge.edicts[2]!.s.origin = [4, 5, 6];
procedures.SV_CreateBaseline();
assert.equal(sv.baselines[1]!.modelindex, 7, "SV_CreateBaseline should snapshot modelindex");
assert.deepEqual(sv.baselines[1]!.old_origin, [10, 20, 30], "SV_CreateBaseline should copy origin to old_origin");
assert.equal(sv.baselines[2]!.effects, 4, "SV_CreateBaseline should preserve effect-only entities");

Cvar_Set(cvar, "deathmatch", "0");
Cvar_Set(cvar, "coop", "0");
procedures.SV_InitGame();
assert.equal(dropCalls, 1, "SV_InitGame should drop the local client when starting fresh");
assert.equal(loadingPlaqueCalls, 1, "SV_InitGame should show the loading plaque when starting fresh");
assert.equal(initGameProgsCalls, 1, "SV_InitGame should initialize the game module");
assert.equal(svs.clients.length, 1, "SV_InitGame should clamp maxclients to 1 in single-player");
assert.equal(svs.clients[0]!.edict?.s.number, 1, "SV_InitGame should attach edict 1 to client slot 0");

sv.state = server_state_t.ss_dead;
broadcasts.length = 0;
clearWorldCalls = 0;
savegameReads.length = 0;
pmAiraccelerate = -1;
procedures.SV_Map(false, "intro.dm2+nextmap", false);
assert.ok(broadcasts.includes("changing\n"), "SV_Map should broadcast changing before a spawn");
assert.ok(broadcasts.includes("reconnect\n"), "SV_Map should broadcast reconnect after a spawn");
assert.equal(sv.state, server_state_t.ss_demo, "SV_Map should pick demo state for .dm2");
assert.equal(sv.time, 1000, "SV_SpawnServer should reset server time to 1000");
assert.equal(clearWorldCalls >= 1, true, "SV_SpawnServer should clear the world");
assert.equal(pmAiraccelerate, 0, "SV_SpawnServer should clear pm_airaccelerate outside deathmatch");
assert.equal(sv.configstrings[CS_AIRACCEL], "0", "SV_SpawnServer should publish zero airaccelerate outside deathmatch");
assert.equal(sv.configstrings[CS_MAPCHECKSUM], "0", "SV_SpawnServer should publish checksum 0 for non-game states");
assert.equal(Cvar_Get(cvar, "nextserver", "", 0)?.string, "gamemap \"nextmap\"", "SV_Map should parse nextserver");
assert.equal(loadRequests.length, 0, "SV_SpawnServer should not request external map bytes for demo states");

sv.loadgame = false;
sv.name = "unit1";
sv.state = server_state_t.ss_game;
savegameReads.length = 0;
runFrameCalls = 0;
procedures.SV_CheckForSavegame();
assert.deepEqual(savegameReads, ["unit1"], "SV_CheckForSavegame should read level data when a save exists");
assert.equal(runFrameCalls, 100, "SV_CheckForSavegame should pump ten seconds of game frames");
assert.equal(sv.state, server_state_t.ss_game, "SV_CheckForSavegame should restore the previous server state");

assert.equal(deferCalls, 0, "SV_Map should not defer command buffers for demo states");

broadcasts.length = 0;
procedures.SV_Map(true, "unit.cin", false);
assert.equal(sv.state, server_state_t.ss_cinematic, "SV_Map should pick cinematic state for .cin");
assert.ok(broadcasts.includes("reconnect\n"), "SV_Map should reconnect after cinematic spawns");

procedures.SV_Map(false, "victory.pcx", false);
assert.equal(sv.state, server_state_t.ss_pic, "SV_Map should pick picture state for .pcx");

Cvar_Set(cvar, "deathmatch", "1");
Cvar_Set(cvar, "maxclients", "2");
sv.state = server_state_t.ss_dead;
broadcasts.length = 0;
loadRequests.length = 0;
spawnEntitiesCalls = 0;
spawnEntitiesArgs = null;
runFrameCalls = 0;
deferCalls = 0;
pmAiraccelerate = -1;
procedures.SV_Map(false, "base1$unit_start+boss1", false);
assert.ok(broadcasts.includes("send"), "SV_Map should flush client messages before spawning a game map");
assert.equal(deferCalls, 1, "SV_Map should defer command buffers after game map spawn");
assert.equal(sv.state, server_state_t.ss_game, "SV_Map should pick game state for BSP maps");
assert.deepEqual(loadRequests, [MAP_PATH], "SV_SpawnServer should load the BSP map path for game states");
assert.equal(sv.configstrings[CS_MODELS + 1], MAP_PATH, "SV_SpawnServer should publish the BSP model configstring");
assert.notEqual(sv.configstrings[CS_MAPCHECKSUM], "0", "SV_SpawnServer should publish the loaded BSP checksum");
assert.equal(pmAiraccelerate, 5, "SV_SpawnServer should publish pm_airaccelerate in deathmatch");
assert.equal(sv.configstrings[CS_AIRACCEL], "5", "SV_SpawnServer should publish deathmatch airaccelerate");
assert.equal(spawnEntitiesCalls, 1, "SV_SpawnServer should spawn map entities once");
assert.equal(spawnEntitiesArgs?.[0], "base1", "SV_SpawnServer should pass the map name to SpawnEntities");
assert.equal(spawnEntitiesArgs?.[2], "unit_start", "SV_Map should parse spawnpoint after '$'");
assert.ok((spawnEntitiesArgs?.[1].length ?? 0) > 0, "SV_SpawnServer should pass the BSP entity string to SpawnEntities");
assert.equal(runFrameCalls, 2, "SV_SpawnServer should run two settling frames");
assert.ok(sv.models[1], "SV_SpawnServer should store the world cmodel");
assert.ok(sv.models[2], "SV_SpawnServer should store inline cmodels");
assert.equal(Cvar_Get(cvar, "nextserver", "", 0)?.string, "gamemap \"boss1\"", "SV_Map should parse nextserver after game map spawn");

console.log("quake2-sv-init: ok");

function createGameExports(): game_export_t {
  const worldspawn = createRuntimeEntity({}, 0);
  worldspawn.inuse = true;
  const clientOne = createRuntimeEntity({}, 1);
  clientOne.inuse = true;
  clientOne.client = createGameClient();
  const clientTwo = createRuntimeEntity({}, 2);
  clientTwo.inuse = true;
  clientTwo.client = createGameClient();

  return {
    apiversion: 3,
    Init: () => {},
    Shutdown: () => {},
    SpawnEntities: (mapname, entstring, spawnpoint) => {
      spawnEntitiesCalls += 1;
      spawnEntitiesArgs = [mapname, entstring, spawnpoint];
    },
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
    edicts: [worldspawn, clientOne, clientTwo],
    edict_size: 0,
    num_edicts: 3,
    max_edicts: 1024
  };
}
