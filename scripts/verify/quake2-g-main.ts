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

import { BUTTON_ANY, BUTTON_ATTACK, CS_PLAYERSKINS, CS_STATUSBAR, CVAR_ARCHIVE, CVAR_LATCH, CVAR_NOSET, CVAR_SERVERINFO, CVAR_USERINFO, DF_FIXED_FOV, DF_SAME_LEVEL, MZ_BLASTER, multicast_t, pmtype_t, temp_event_t, type cvar_t, type usercmd_t } from "../../packages/qcommon/src/index.js";
import { TAG_GAME, TAG_LEVEL, svc_muzzleflash, svc_temp_entity } from "../../packages/game/src/g_local.js";
import { GAME_API_VERSION } from "../../packages/game/src/game.js";
import { attachGameClient, createGameRuntimeFromBspEntities, emitGameTempEntity, emitPlayerMuzzleFlash } from "../../packages/game/src/runtime.js";
import { CheckDMRules, ClientEndServerFrames, ExitLevel, G_RunFrame, GetGameApi, InitGame, SpawnEntities, createGameMainContext } from "../../packages/game/src/g_main.js";
import { single_statusbar } from "../../packages/game/src/g_spawn.js";

const dprints: string[] = [];
const bprints: string[] = [];
const freeTags: number[] = [];
const addedCommands: string[] = [];
const writeBytes: number[] = [];
const writeShorts: number[] = [];
const writePositions: Array<[number, number, number]> = [];
const writeDirs: Array<[number, number, number]> = [];
const multicasts: Array<{ origin: [number, number, number]; to: number }> = [];
const command = { argv: ["sv"], args: "" };
const cvars = new Map<string, cvar_t>();
const forcedCvars: Array<{ name: string; value: string }> = [];
const configstrings = new Map<number, string>();

const imports = {
  bprintf: () => {},
  dprintf: (fmt, ...args) => {
    dprints.push(formatPrintf(fmt, args));
  },
  cprintf: () => {},
  centerprintf: () => {},
  sound: () => {},
  positioned_sound: () => {},
  configstring: (index, value) => {
    configstrings.set(index, value);
  },
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
  WritePosition: (value) => {
    writePositions.push([...value]);
  },
  WriteDir: (value) => {
    writeDirs.push([...value]);
  },
  WriteAngle: () => {},
  TagMalloc: () => ({}),
  TagFree: () => {},
  FreeTags: (tag) => {
    freeTags.push(tag);
  },
  cvar: (name, value, flags) => {
    let variable = cvars.get(name);
    if (!variable) {
      variable = createCvar(name, value, flags);
      cvars.set(name, variable);
    }
    return variable;
  },
  cvar_set: () => null,
  cvar_forceset: (name, value) => {
    forcedCvars.push({ name, value });
    const variable = createCvar(name, value);
    cvars.set(name, variable);
    return variable;
  },
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
assert.equal(cvars.get("deathmatch")?.string, "0", "deathmatch default mismatch");
assert.equal(cvars.get("deathmatch")?.flags, CVAR_LATCH, "deathmatch flags mismatch");
assert.equal(cvars.get("coop")?.string, "0", "coop default mismatch");
assert.equal(cvars.get("coop")?.flags, CVAR_LATCH, "coop flags mismatch");
assert.equal(cvars.get("dmflags")?.string, "0", "dmflags default mismatch");
assert.equal(cvars.get("dmflags")?.flags, CVAR_SERVERINFO, "dmflags flags mismatch");
assert.equal(cvars.get("skill")?.string, "1", "skill default mismatch");
assert.equal(cvars.get("skill")?.flags, CVAR_LATCH, "skill flags mismatch");
assert.equal(cvars.get("fraglimit")?.string, "0", "fraglimit default mismatch");
assert.equal(cvars.get("fraglimit")?.flags, CVAR_SERVERINFO, "fraglimit flags mismatch");
assert.equal(cvars.get("timelimit")?.string, "0", "timelimit default mismatch");
assert.equal(cvars.get("timelimit")?.flags, CVAR_SERVERINFO, "timelimit flags mismatch");
assert.equal(cvars.get("password")?.string, "", "password default mismatch");
assert.equal(cvars.get("password")?.flags, CVAR_USERINFO, "password flags mismatch");
assert.equal(cvars.get("spectator_password")?.string, "", "spectator_password default mismatch");
assert.equal(cvars.get("spectator_password")?.flags, CVAR_USERINFO, "spectator_password flags mismatch");
assert.equal(cvars.get("maxclients")?.string, "4", "maxclients default mismatch");
assert.equal(cvars.get("maxclients")?.flags, CVAR_SERVERINFO | CVAR_LATCH, "maxclients flags mismatch");
assert.equal(cvars.get("maxspectators")?.string, "4", "maxspectators default mismatch");
assert.equal(cvars.get("maxspectators")?.flags, CVAR_SERVERINFO, "maxspectators flags mismatch");
assert.equal(cvars.get("maxentities")?.string, "1024", "maxentities default mismatch");
assert.equal(cvars.get("maxentities")?.flags, CVAR_LATCH, "maxentities flags mismatch");
assert.equal(cvars.get("g_select_empty")?.string, "0", "g_select_empty default mismatch");
assert.equal(cvars.get("g_select_empty")?.flags, CVAR_ARCHIVE, "g_select_empty flags mismatch");
assert.equal(cvars.get("dedicated")?.string, "0", "dedicated default mismatch");
assert.equal(cvars.get("dedicated")?.flags, CVAR_NOSET, "dedicated flags mismatch");
assert.equal(cvars.get("filterban")?.string, "1", "filterban default mismatch");
assert.equal(cvars.get("filterban")?.flags, 0, "filterban flags mismatch");
assert.equal(cvars.get("sv_maxvelocity")?.string, "2000", "sv_maxvelocity default mismatch");
assert.equal(cvars.get("sv_maxvelocity")?.flags, 0, "sv_maxvelocity flags mismatch");
assert.equal(cvars.get("sv_gravity")?.string, "800", "sv_gravity default mismatch");
assert.equal(cvars.get("sv_gravity")?.flags, 0, "sv_gravity flags mismatch");
assert.equal(cvars.get("sv_rollspeed")?.string, "200", "sv_rollspeed default mismatch");
assert.equal(cvars.get("sv_rollspeed")?.flags, 0, "sv_rollspeed flags mismatch");
assert.equal(cvars.get("sv_rollangle")?.string, "2", "sv_rollangle default mismatch");
assert.equal(cvars.get("sv_rollangle")?.flags, 0, "sv_rollangle flags mismatch");
assert.equal(cvars.get("gun_x")?.string, "0", "gun_x default mismatch");
assert.equal(cvars.get("gun_x")?.flags, 0, "gun_x flags mismatch");
assert.equal(cvars.get("gun_y")?.string, "0", "gun_y default mismatch");
assert.equal(cvars.get("gun_y")?.flags, 0, "gun_y flags mismatch");
assert.equal(cvars.get("gun_z")?.string, "0", "gun_z default mismatch");
assert.equal(cvars.get("gun_z")?.flags, 0, "gun_z flags mismatch");
assert.equal(cvars.get("run_pitch")?.string, "0.002", "run_pitch default mismatch");
assert.equal(cvars.get("run_pitch")?.flags, 0, "run_pitch flags mismatch");
assert.equal(cvars.get("run_roll")?.string, "0.005", "run_roll default mismatch");
assert.equal(cvars.get("run_roll")?.flags, 0, "run_roll flags mismatch");
assert.equal(cvars.get("bob_up")?.string, "0.005", "bob_up default mismatch");
assert.equal(cvars.get("bob_up")?.flags, 0, "bob_up flags mismatch");
assert.equal(cvars.get("bob_pitch")?.string, "0.002", "bob_pitch default mismatch");
assert.equal(cvars.get("bob_pitch")?.flags, 0, "bob_pitch flags mismatch");
assert.equal(cvars.get("bob_roll")?.string, "0.002", "bob_roll default mismatch");
assert.equal(cvars.get("bob_roll")?.flags, 0, "bob_roll flags mismatch");
assert.equal(api.edicts[0]?.classname, "worldspawn", "g_edicts export must expose the runtime edict array");

const cvarMirrorContext = createGameMainContext(imports);
cvars.set("g_select_empty", createCvar("g_select_empty", "1", CVAR_ARCHIVE));
cvars.set("sv_gravity", createCvar("sv_gravity", "600"));
InitGame(cvarMirrorContext);
assert.equal(cvarMirrorContext.runtime.g_select_empty, true, "InitGame must mirror g_select_empty to the gameplay runtime");
assert.equal(cvarMirrorContext.runtime.gravity, 600, "InitGame must mirror sv_gravity to the gameplay runtime");

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
assert.equal(freeTags[0], TAG_LEVEL, "SpawnEntities must release level tags before rebuilding entities");
assert.equal(configstrings.get(CS_STATUSBAR), single_statusbar, "SpawnEntities must publish the original single-player HUD statusbar");
assert.equal(configstrings.get(CS_STATUSBAR)?.includes("hnum"), true, "statusbar must include the original health field");
assert.equal(configstrings.get(CS_STATUSBAR)?.includes("anum"), true, "statusbar must include the original ammo field");
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
assert.ok(dprints.includes("0 entities inhibited\n"), "SpawnEntities must report the inhibited entity count");

const preservedClient = api.edicts[1]!.client!;
api.edicts[1]!.inuse = true;
api.edicts[1]!.health = 37;
api.edicts[1]!.max_health = 151;
api.SpawnEntities("base1", entityString, "restart");
assert.equal(api.edicts[1]!.client, preservedClient, "SpawnEntities must preserve the persistent client block across level reloads");
assert.equal(api.edicts[1]!.client!.pers.health, 37, "SpawnEntities must save entity health into persistent client data");
assert.equal(api.edicts[1]!.client!.pers.max_health, 151, "SpawnEntities must save entity max_health into persistent client data");

command.argv = ["sv", "test"];
command.args = "test";
api.ServerCommand();

const clientThinkRuntime = createGameRuntimeFromBspEntities([
  { properties: { classname: "worldspawn" } },
  { properties: { classname: "player" } }
]);
clientThinkRuntime.maxclients = 1;
const clientThinkPlayer = clientThinkRuntime.entities[1]!;
clientThinkPlayer.inuse = true;
clientThinkPlayer.client = attachGameClient(clientThinkPlayer);
const clientThinkApi = GetGameApi(imports, { runtime: clientThinkRuntime });
clientThinkRuntime.intermissiontime = 1;
clientThinkRuntime.time = 7;
clientThinkApi.ClientThink(clientThinkPlayer, createUsercmd({ buttons: BUTTON_ANY, lightlevel: 18 }));
assert.equal(clientThinkPlayer.client.ps.pmove.pm_type, pmtype_t.PM_FREEZE, "GetGameApi.ClientThink must delegate intermission freeze to p_client");
assert.equal(clientThinkRuntime.exitintermission, 1, "GetGameApi.ClientThink must delegate intermission exit buttons to p_client");

clientThinkRuntime.intermissiontime = 0;
clientThinkRuntime.exitintermission = 0;
clientThinkPlayer.client.latched_buttons = 0;
clientThinkPlayer.client.buttons = 0;
clientThinkPlayer.client.oldbuttons = 0;
clientThinkApi.ClientThink(clientThinkPlayer, createUsercmd({ buttons: BUTTON_ATTACK, lightlevel: 42 }));
assert.equal(clientThinkRuntime.current_entity, clientThinkPlayer, "ClientThink must set the current entity like the original game export");
assert.equal(clientThinkPlayer.client.buttons, BUTTON_ATTACK, "ClientThink must copy the current command buttons");
assert.equal(clientThinkPlayer.client.oldbuttons, 0, "ClientThink must preserve old buttons before latching");
assert.equal(clientThinkPlayer.client.weapon_thunk, true, "ClientThink must thunk weapon fire from BUTTON_ATTACK");
assert.equal(clientThinkPlayer.light_level, 42, "ClientThink must copy usercmd lightlevel for AI sighting");

const connectRuntime = createGameRuntimeFromBspEntities([
  { properties: { classname: "worldspawn" } },
  { properties: { classname: "player" } },
  { properties: { classname: "player" } }
]);
connectRuntime.maxclients = 2;
connectRuntime.entities[1]!.client = attachGameClient(connectRuntime.entities[1]!);
connectRuntime.entities[2]!.client = attachGameClient(connectRuntime.entities[2]!);
const connectApi = GetGameApi(imports, { runtime: connectRuntime });
connectApi.Init();
setCvar("password", "secret", CVAR_USERINFO);
setCvar("spectator_password", "watch", CVAR_USERINFO);
setCvar("maxclients", "2", CVAR_SERVERINFO | CVAR_LATCH);
setCvar("maxspectators", "1", CVAR_SERVERINFO);
connectRuntime.maxclients = 2;
connectRuntime.deathmatch = true;

command.argv = ["sv", "addip", "203.0.113.7"];
command.args = "addip 203.0.113.7";
connectApi.ServerCommand();
assert.equal(
  connectApi.ClientConnect(connectRuntime.entities[1]!, "\\name\\bad\\password\\secret\\ip\\203.0.113.7:27910"),
  false,
  "ClientConnect must reject banned IPs through the g_svcmds filter"
);
assert.equal(
  connectApi.ClientConnect(connectRuntime.entities[1]!, "\\name\\bad\\password\\wrong\\ip\\198.51.100.1:27910"),
  false,
  "ClientConnect must reject an incorrect player password"
);
assert.equal(
  connectApi.ClientConnect(connectRuntime.entities[1]!, "\\name\\good\\password\\secret\\ip\\198.51.100.1:27910"),
  true,
  "ClientConnect must accept a player with the correct password"
);
assert.equal(connectRuntime.entities[1]!.client!.pers.connected, true, "ClientConnect must mark accepted players connected");
assert.equal(connectRuntime.entities[1]!.client!.pers.netname, "good", "ClientConnect must apply accepted userinfo");
assert.equal(configstrings.get(CS_PLAYERSKINS), "good\\", "ClientConnect must publish the accepted player skin configstring through gi.configstring");

connectRuntime.entities[1]!.inuse = true;
connectRuntime.entities[1]!.client!.pers.spectator = true;
assert.equal(
  connectApi.ClientConnect(connectRuntime.entities[2]!, "\\name\\spec\\spectator\\bad\\ip\\198.51.100.2:27910"),
  false,
  "ClientConnect must reject an incorrect spectator password"
);
assert.equal(
  connectApi.ClientConnect(connectRuntime.entities[2]!, "\\name\\spec\\spectator\\watch\\ip\\198.51.100.2:27910"),
  false,
  "ClientConnect must reject spectators over maxspectators"
);
setCvar("maxspectators", "2", CVAR_SERVERINFO);
assert.equal(
  connectApi.ClientConnect(connectRuntime.entities[2]!, "\\name\\spec\\spectator\\watch\\ip\\198.51.100.2:27910"),
  true,
  "ClientConnect must accept a spectator with the correct password and free slot"
);
assert.equal(connectRuntime.entities[2]!.client!.pers.spectator, true, "ClientConnect must apply spectator userinfo");
assert.equal(configstrings.get(CS_PLAYERSKINS + 1), "spec\\", "ClientConnect must publish spectator userinfo through the player skin configstring");

connectRuntime.dmflags = 0;
connectApi.ClientUserinfoChanged(connectRuntime.entities[1]!, "\\name\\rename\\skin\\female/athena\\spectator\\0\\fov\\200\\hand\\2");
assert.equal(connectRuntime.entities[1]!.client!.pers.netname, "rename", "ClientUserinfoChanged must copy the userinfo name");
assert.equal(connectRuntime.entities[1]!.client!.pers.spectator, false, "ClientUserinfoChanged must clear spectator outside a true spectator value");
assert.equal(connectRuntime.entities[1]!.client!.ps.fov, 160, "ClientUserinfoChanged must clamp high fov like the C code");
assert.equal(connectRuntime.entities[1]!.client!.pers.hand, 2, "ClientUserinfoChanged must copy handedness");
assert.equal(configstrings.get(CS_PLAYERSKINS), "rename\\female/athena", "ClientUserinfoChanged must combine name and skin into CS_PLAYERSKINS");

connectApi.ClientUserinfoChanged(connectRuntime.entities[1]!, "\\skin\\male/grunt\\fov\\0\\hand\\abc");
assert.equal(connectRuntime.entities[1]!.client!.pers.netname, "", "ClientUserinfoChanged must allow an empty name like strncpy from the C source");
assert.equal(connectRuntime.entities[1]!.client!.ps.fov, 90, "ClientUserinfoChanged must reset invalid low fov to 90");
assert.equal(connectRuntime.entities[1]!.client!.pers.hand, 0, "ClientUserinfoChanged must parse invalid hand values as atoi(...)=0");
assert.equal(configstrings.get(CS_PLAYERSKINS), "\\male/grunt", "ClientUserinfoChanged must publish empty-name skin configstrings");

connectRuntime.dmflags = DF_FIXED_FOV;
connectApi.ClientUserinfoChanged(connectRuntime.entities[1]!, "\\name\\fixed\\skin\\male/grunt\\fov\\130\\hand\\1");
assert.equal(connectRuntime.entities[1]!.client!.ps.fov, 90, "ClientUserinfoChanged must force fov 90 when DF_FIXED_FOV is active in deathmatch");

connectApi.ClientUserinfoChanged(connectRuntime.entities[1]!, "\\bad\\info;\\x");
assert.equal(connectRuntime.entities[1]!.client!.pers.userinfo, "\\name\\badinfo\\skin\\male/grunt", "ClientUserinfoChanged must replace malformed userinfo with the C fallback");
assert.equal(configstrings.get(CS_PLAYERSKINS), "badinfo\\male/grunt", "ClientUserinfoChanged must publish the fallback skin configstring");

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

const skillContext = createGameMainContext(imports);
skillContext.cvars.skill = createCvar("skill", "2.7");
SpawnEntities(skillContext, "base1", entityString, "");
assert.deepEqual(forcedCvars.at(-1), { name: "skill", value: "2.000000" }, "SpawnEntities must force skill to the original floored cvar value");
assert.equal(skillContext.runtime.skill, 2, "SpawnEntities must apply the forced skill value to runtime");

const helpContext = createGameMainContext(imports);
helpContext.runtime.maxclients = 1;
helpContext.runtime.entities = [{ ...api.edicts[0]! }, { ...api.edicts[1]! }];
helpContext.runtime.entities[1].client = helpContext.runtime.entities[1].client ?? attachGameClient(helpContext.runtime.entities[1]);
helpContext.runtime.entities[1].inuse = true;
helpContext.game.helpchanged = 7;
helpContext.runtime.entities[1].client!.resp.spectator = true;
helpContext.runtime.entities[1].client!.ps.stats = helpContext.runtime.entities[1].client!.ps.stats.slice();
helpContext.runtime.entities[1].client!.v_angle = [0, 90, 0];
helpContext.runtime.entities[1].velocity = [100, 0, 0];
helpContext.cvars.sv_rollangle = createCvar("sv_rollangle", "6");
helpContext.cvars.sv_rollspeed = createCvar("sv_rollspeed", "100");
helpContext.cvars.gun_x = createCvar("gun_x", "2");
helpContext.cvars.gun_y = createCvar("gun_y", "3");
helpContext.cvars.gun_z = createCvar("gun_z", "4");
helpContext.cvars.run_roll = createCvar("run_roll", "0.5");
ClientEndServerFrames(helpContext);
assert.equal(helpContext.runtime.helpchanged, 7, "ClientEndServerFrames helpchanged sync mismatch");
assert.equal(helpContext.runtime.entities[1].s.angles[2], 24, "ClientEndServerFrames must pass sv_rollangle/sv_rollspeed cvars to p_view");
assert.deepEqual(helpContext.runtime.entities[1].client!.ps.gunoffset.map((value) => Math.round(value)), [2, 3, -4], "ClientEndServerFrames must pass gun_x/gun_y/gun_z cvars to p_view");
assert.ok(Math.abs(helpContext.runtime.entities[1].client!.ps.kick_angles[2]) > 40, "ClientEndServerFrames must pass run_roll cvar to p_view");

const bobContext = createGameMainContext(imports);
bobContext.runtime.maxclients = 1;
bobContext.runtime.entities = [{ ...api.edicts[0]! }, { ...api.edicts[1]! }];
bobContext.runtime.entities[1].client = bobContext.runtime.entities[1].client ?? attachGameClient(bobContext.runtime.entities[1]);
bobContext.runtime.entities[1].inuse = true;
bobContext.runtime.entities[1].viewheight = 22;
bobContext.runtime.entities[1].groundentity = bobContext.runtime.entities[0];
bobContext.runtime.entities[1].client!.v_angle = [0, 0, 0];
bobContext.runtime.entities[1].client!.ps.viewangles = [0, 0, 0];
bobContext.runtime.entities[1].velocity = [100, 0, 0];
bobContext.cvars.run_pitch = createCvar("run_pitch", "0.1");
bobContext.cvars.bob_up = createCvar("bob_up", "1");
bobContext.cvars.bob_pitch = createCvar("bob_pitch", "0.25");
bobContext.cvars.bob_roll = createCvar("bob_roll", "0.5");
ClientEndServerFrames(bobContext);
assert.ok(bobContext.runtime.entities[1].client!.ps.kick_angles[0] > 14, "ClientEndServerFrames must pass run_pitch/bob_pitch cvars to p_view");
assert.ok(bobContext.runtime.entities[1].client!.ps.kick_angles[2] > 9, "ClientEndServerFrames must pass bob_roll cvar to p_view");
assert.equal(bobContext.runtime.entities[1].client!.ps.viewoffset[2], 28, "ClientEndServerFrames must pass bob_up cvar to p_view");

const frameContext = createGameMainContext(imports);
frameContext.runtime.maxclients = 1;
frameContext.runtime.entities = [{ ...api.edicts[0]! }, { ...api.edicts[1]! }];
frameContext.runtime.entities[1].client = frameContext.runtime.entities[1].client ?? attachGameClient(frameContext.runtime.entities[1]);
frameContext.runtime.entities[1].inuse = true;
frameContext.runtime.entities[1].s.origin = [11, 22, 33];
frameContext.runtime.entities[1].s.old_origin = [0, 0, 0];
writeBytes.length = 0;
writeShorts.length = 0;
writePositions.length = 0;
writeDirs.length = 0;
multicasts.length = 0;
emitPlayerMuzzleFlash(frameContext.runtime, frameContext.runtime.entities[1], MZ_BLASTER);
emitGameTempEntity(frameContext.runtime, temp_event_t.TE_BLOOD, [44, 55, 66], multicast_t.MULTICAST_PVS, {
  dir: [0, 0, 1]
});
G_RunFrame(frameContext);
assert.equal(frameContext.runtime.framenum, 1, "G_RunFrame framenum mismatch");
assert.equal(frameContext.runtime.time, 0.1, "G_RunFrame must advance using FRAMETIME");
assert.deepEqual(frameContext.runtime.entities[1].s.old_origin, [11, 22, 33], "G_RunFrame old_origin copy mismatch");
assert.equal(frameContext.level.current_entity, null, "G_RunFrame must clear level.current_entity after the entity loop");
assert.deepEqual(writeBytes.slice(0, 2), [svc_muzzleflash, MZ_BLASTER], "G_RunFrame must flush player weapon muzzleflash bytes");
assert.equal(writeShorts.at(-1), 1, "G_RunFrame must flush player muzzleflash entity index");
assert.deepEqual(writeBytes.slice(-2), [svc_temp_entity, temp_event_t.TE_BLOOD], "G_RunFrame must flush damage temp entity bytes");
assert.deepEqual(writePositions.at(-1), [44, 55, 66], "G_RunFrame must flush damage temp entity origin");
assert.deepEqual(writeDirs.at(-1), [0, 0, 1], "G_RunFrame must flush damage temp entity direction");
assert.deepEqual(multicasts.at(-2)?.origin, [11, 22, 33], "G_RunFrame must multicast player muzzleflash at player origin");
assert.deepEqual(multicasts.at(-1)?.origin, [44, 55, 66], "G_RunFrame must multicast damage temp entity at event origin");

freeTags.length = 0;
api.Shutdown();
assert.ok(dprints.includes("==== ShutdownGame ====\n"), "ShutdownGame banner mismatch");
assert.deepEqual(freeTags, [TAG_LEVEL, TAG_GAME], "ShutdownGame FreeTags mismatch");

console.log("quake2-g-main: ok");

function createCvar(name: string, stringValue: string, flags = 0): cvar_t {
  return {
    name,
    string: stringValue,
    latched_string: null,
    flags,
    modified: false,
    value: Number.parseFloat(stringValue) || 0
  };
}

function setCvar(name: string, stringValue: string, flags = 0): cvar_t {
  const variable = cvars.get(name) ?? createCvar(name, stringValue, flags);
  variable.string = stringValue;
  variable.flags = flags;
  variable.value = Number.parseFloat(stringValue) || 0;
  cvars.set(name, variable);
  return variable;
}

function createUsercmd(overrides: Partial<usercmd_t> = {}): usercmd_t {
  return {
    msec: 0,
    buttons: 0,
    angles: [0, 0, 0],
    forwardmove: 0,
    sidemove: 0,
    upmove: 0,
    impulse: 0,
    lightlevel: 0,
    ...overrides,
    angles: overrides.angles ? [...overrides.angles] : [0, 0, 0]
  };
}

function formatPrintf(fmt: string, args: unknown[]): string {
  let cursor = 0;
  return fmt.replace(/%[siuf]/g, () => String(args[cursor++]));
}
