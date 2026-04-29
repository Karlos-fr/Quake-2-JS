/**
 * File: quake2-g-main.ts
 * Purpose: Verify the first `game/g_main.c` TypeScript attachment point and export table wiring.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for `GetGameApi`, `InitGame`, `SpawnEntities` and `ShutdownGame`.
 *
 * Dependencies:
 * - packages/game/src/g_main.ts
 */

import { strict as assert } from "node:assert";

import { DF_SAME_LEVEL, MZ_BLASTER, type cvar_t } from "../../packages/qcommon/src/index.js";
import { TAG_GAME, TAG_LEVEL, svc_muzzleflash } from "../../packages/game/src/g-local.js";
import { GAME_API_VERSION } from "../../packages/game/src/game.js";
import { attachGameClient, emitPlayerMuzzleFlash } from "../../packages/game/src/runtime.js";
import { CheckDMRules, ClientEndServerFrames, ExitLevel, G_RunFrame, GetGameApi, createGameMainContext } from "../../packages/game/src/g_main.js";

const dprints: string[] = [];
const bprints: string[] = [];
const freeTags: number[] = [];
const addedCommands: string[] = [];
const writeBytes: number[] = [];
const writeShorts: number[] = [];
const multicasts: Array<{ origin: [number, number, number]; to: number }> = [];
const command = { argv: ["sv"], args: "" };
const cvars = new Map<string, cvar_t>();

const imports = {
  bprintf: () => {},
  dprintf: (fmt, ...args) => {
    dprints.push(formatPrintf(fmt, args));
  },
  cprintf: () => {},
  centerprintf: () => {},
  sound: () => {},
  positioned_sound: () => {},
  configstring: () => {},
  error: (fmt, ...args) => {
    throw new Error(formatPrintf(fmt, args));
  },
  modelindex: () => 0,
  soundindex: () => 0,
  imageindex: () => 0,
  setmodel: () => {},
  trace: () => {
    throw new Error("trace should not be used in this harness");
  },
  pointcontents: () => 0,
  inPVS: () => false,
  inPHS: () => false,
  SetAreaPortalState: () => {},
  AreasConnected: () => false,
  linkentity: () => {},
  unlinkentity: () => {},
  BoxEdicts: () => 0,
  Pmove: () => {},
  multicast: (origin, to) => {
    multicasts.push({ origin: [...origin], to });
  },
  unicast: () => {},
  WriteChar: () => {},
  WriteByte: (value) => {
    writeBytes.push(value);
  },
  WriteShort: (value) => {
    writeShorts.push(value);
  },
  WriteLong: () => {},
  WriteFloat: () => {},
  WriteString: () => {},
  WritePosition: () => {},
  WriteDir: () => {},
  WriteAngle: () => {},
  TagMalloc: () => ({}),
  TagFree: () => {},
  FreeTags: (tag) => {
    freeTags.push(tag);
  },
  cvar: (name, value) => {
    let variable = cvars.get(name);
    if (!variable) {
      variable = createCvar(name, value);
      cvars.set(name, variable);
    }
    return variable;
  },
  cvar_set: () => null,
  cvar_forceset: () => null,
  argc: () => command.argv.length,
  argv: (n) => command.argv[n] ?? "",
  args: () => command.args,
  AddCommandString: (text) => {
    addedCommands.push(text);
  },
  DebugGraph: () => {}
};

imports.bprintf = (printLevel, fmt, ...args) => {
  void printLevel;
  bprints.push(formatPrintf(fmt, args));
};

const api = GetGameApi(imports);

assert.equal(api.apiversion, GAME_API_VERSION, "GetGameApi apiversion mismatch");

api.Init();
assert.ok(dprints.includes("==== InitGame ====\n"), "InitGame banner mismatch");
assert.equal(api.max_edicts, 1024, "InitGame maxentities cvar mismatch");

const entityString = `
{
"classname" "worldspawn"
}
{
"classname" "func_door"
"model" "*1"
}
`;

api.SpawnEntities("base1", entityString, "start");
assert.equal(api.edicts[0]?.classname, "worldspawn", "worldspawn must stay at edict 0");
assert.ok(api.edicts[1]?.client, "first reserved client slot must have a client block");
assert.equal(api.edicts[5]?.classname, "func_door", "map entities must be shifted behind reserved player slots");
assert.equal(api.num_edicts, 22, "SpawnEntities must include reserved body queue and player trail edicts");
assert.deepEqual(
  api.edicts.slice(6).map((ent) => ent?.classname),
  [
    "bodyque",
    "bodyque",
    "bodyque",
    "bodyque",
    "bodyque",
    "bodyque",
    "bodyque",
    "bodyque",
    "player_trail",
    "player_trail",
    "player_trail",
    "player_trail",
    "player_trail",
    "player_trail",
    "player_trail",
    "player_trail"
  ],
  "SpawnEntities post-map edict bootstrap mismatch"
);

command.argv = ["sv", "test"];
command.args = "test";
api.ServerCommand();

const dmContext = createGameMainContext(imports);
dmContext.runtime.maxclients = 2;
dmContext.runtime.entities = [
  { ...api.edicts[0]! },
  api.edicts[1]!,
  api.edicts[2]!,
  api.edicts[5]!
];
dmContext.runtime.entities[1].inuse = true;
dmContext.runtime.entities[1].health = 120;
dmContext.runtime.entities[1].client!.pers.max_health = 100;
dmContext.runtime.entities[1].client!.resp.score = 3;
dmContext.level.mapname = "q2dm1";
dmContext.runtime.deathmatch = true;
dmContext.cvars.timelimit = createCvar("timelimit", "1");
dmContext.cvars.fraglimit = createCvar("fraglimit", "0");
dmContext.cvars.sv_maplist = createCvar("sv_maplist", "q2dm1 q2dm2");
dmContext.cvars.dmflags = createCvar("dmflags", "0");
dmContext.runtime.time = 60;
dmContext.runtime.framenum = 600;

CheckDMRules(dmContext);
assert.equal(bprints.pop(), "Timelimit hit.\n", "CheckDMRules timelimit announce mismatch");
assert.equal(dmContext.runtime.changemap, "q2dm2", "EndDMLevel must choose the next maplist entry");
assert.ok(dmContext.runtime.intermissiontime > 0, "EndDMLevel must begin intermission");

dmContext.level.changemap = dmContext.runtime.changemap;
dmContext.level.exitintermission = 1;
dmContext.runtime.exitintermission = 1;
ExitLevel(dmContext);
assert.equal(addedCommands.pop(), "gamemap \"q2dm2\"\n", "ExitLevel command mismatch");
assert.equal(dmContext.runtime.intermissiontime, 0, "ExitLevel must clear intermissiontime");
assert.equal(dmContext.runtime.entities[1].health, 100, "ExitLevel must clamp health to pers.max_health");

const sameLevelContext = createGameMainContext(imports);
sameLevelContext.runtime.maxclients = 1;
sameLevelContext.runtime.entities = [{ ...api.edicts[0]! }, api.edicts[1]!];
sameLevelContext.runtime.entities[1].client!.resp.score = 5;
sameLevelContext.runtime.entities[1].inuse = true;
sameLevelContext.level.mapname = "fact1";
sameLevelContext.runtime.deathmatch = true;
sameLevelContext.cvars.timelimit = createCvar("timelimit", "0");
sameLevelContext.cvars.fraglimit = createCvar("fraglimit", "5");
sameLevelContext.cvars.dmflags = createCvar("dmflags", String(DF_SAME_LEVEL));
sameLevelContext.runtime.dmflags = DF_SAME_LEVEL;
CheckDMRules(sameLevelContext);
assert.equal(bprints.pop(), "Fraglimit hit.\n", "CheckDMRules fraglimit announce mismatch");
assert.equal(sameLevelContext.runtime.changemap, "fact1", "DF_SAME_LEVEL must keep the current map");

const helpContext = createGameMainContext(imports);
helpContext.runtime.maxclients = 1;
helpContext.runtime.entities = [{ ...api.edicts[0]! }, { ...api.edicts[1]! }];
helpContext.runtime.entities[1].client = helpContext.runtime.entities[1].client ?? attachGameClient(helpContext.runtime.entities[1]);
helpContext.runtime.entities[1].inuse = true;
helpContext.game.helpchanged = 7;
helpContext.runtime.entities[1].client!.resp.spectator = true;
helpContext.runtime.entities[1].client!.ps.stats = helpContext.runtime.entities[1].client!.ps.stats.slice();
ClientEndServerFrames(helpContext);
assert.equal(helpContext.runtime.helpchanged, 7, "ClientEndServerFrames helpchanged sync mismatch");

const frameContext = createGameMainContext(imports);
frameContext.runtime.maxclients = 1;
frameContext.runtime.entities = [{ ...api.edicts[0]! }, { ...api.edicts[1]! }];
frameContext.runtime.entities[1].client = frameContext.runtime.entities[1].client ?? attachGameClient(frameContext.runtime.entities[1]);
frameContext.runtime.entities[1].inuse = true;
frameContext.runtime.entities[1].s.origin = [11, 22, 33];
frameContext.runtime.entities[1].s.old_origin = [0, 0, 0];
writeBytes.length = 0;
writeShorts.length = 0;
multicasts.length = 0;
emitPlayerMuzzleFlash(frameContext.runtime, frameContext.runtime.entities[1], MZ_BLASTER);
G_RunFrame(frameContext);
assert.equal(frameContext.runtime.framenum, 1, "G_RunFrame framenum mismatch");
assert.equal(frameContext.runtime.time, 0.1, "G_RunFrame must advance using FRAMETIME");
assert.deepEqual(frameContext.runtime.entities[1].s.old_origin, [11, 22, 33], "G_RunFrame old_origin copy mismatch");
assert.equal(frameContext.level.current_entity, null, "G_RunFrame must clear level.current_entity after the entity loop");
assert.deepEqual(writeBytes.slice(-2), [svc_muzzleflash, MZ_BLASTER], "G_RunFrame must flush player weapon muzzleflash bytes");
assert.equal(writeShorts.at(-1), 1, "G_RunFrame must flush player muzzleflash entity index");
assert.deepEqual(multicasts.at(-1)?.origin, [11, 22, 33], "G_RunFrame must multicast player muzzleflash at player origin");

api.Shutdown();
assert.ok(dprints.includes("==== ShutdownGame ====\n"), "ShutdownGame banner mismatch");
assert.deepEqual(freeTags, [TAG_LEVEL, TAG_GAME], "ShutdownGame FreeTags mismatch");

console.log("quake2-g-main: ok");

function createCvar(name: string, stringValue: string): cvar_t {
  return {
    name,
    string: stringValue,
    latched_string: null,
    flags: 0,
    modified: false,
    value: Number.parseFloat(stringValue) || 0
  };
}

function formatPrintf(fmt: string, args: unknown[]): string {
  let cursor = 0;
  return fmt.replace(/%s/g, () => String(args[cursor++]));
}
