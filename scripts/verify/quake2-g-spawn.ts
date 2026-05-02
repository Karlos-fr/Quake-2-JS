/**
 * File: quake2-g-spawn.ts
 * Purpose: Verify the TypeScript attachment points that now cover the remaining `game/g_spawn.c` behavior.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for `ED_CallSpawn`, `G_FindTeams`, `SP_worldspawn` and the `SpawnEntities` worldspawn path.
 *
 * Dependencies:
 * - packages/game/src/g_spawn.ts
 * - packages/game/src/g_main.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

import {
  CS_CDTRACK,
  CS_ITEMS,
  CS_LIGHTS,
  CS_MAXCLIENTS,
  CS_NAME,
  DF_NO_HEALTH,
  EF_ANIM01,
  EF_ANIM_ALL,
  EF_ANIM_ALLFAST,
  RF_GLOW,
  CS_SKY,
  CS_SKYAXIS,
  CS_SKYROTATE,
  CS_STATUSBAR,
  MAX_EDICTS
} from "../../packages/qcommon/src/index.js";
import { FL_TEAMSLAVE, FRAMETIME, MOVETYPE_PUSH, MOVETYPE_STOP, MOVETYPE_TOSS, SOLID_BBOX, SOLID_BSP, SOLID_NOT, SOLID_TRIGGER, STATE_BOTTOM, STATE_UP, SVF_NOCLIENT } from "../../packages/game/src/runtime.js";
import {
  SPAWNFLAG_NOT_DEATHMATCH,
  SPAWNFLAG_NOT_EASY,
  SPAWNFLAG_NOT_HARD,
  SPAWNFLAG_NOT_MEDIUM,
  createSpawnTemp,
  damage_t
} from "../../packages/game/src/g_local.js";
import { ED_CallSpawn, ED_NewString, ED_ParseEdict, ED_ParseField, G_FindTeams, SpawnEntities, dm_statusbar, single_statusbar, spawns } from "../../packages/game/src/g_spawn.js";
import { G_RunFrame, InitGame, createGameMainContext } from "../../packages/game/src/g_main.js";
import { spawnGameEntity } from "../../packages/game/src/runtime.js";

const configstrings = new Map<number, string>();
const cvarValues = new Map<string, string>();
const soundIndexes: string[] = [];

const imports = {
  bprintf: () => {},
  dprintf: () => {},
  cprintf: () => {},
  centerprintf: () => {},
  sound: () => {},
  positioned_sound: () => {},
  configstring: (num: number, value: string) => {
    configstrings.set(num, value);
  },
  error: (fmt: string, ...args: unknown[]) => {
    throw new Error(formatPrintf(fmt, args));
  },
  modelindex: () => 0,
  soundindex: (name: string) => {
    soundIndexes.push(name);
    return soundIndexes.length;
  },
  imageindex: (_name: string) => 1,
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
  multicast: () => {},
  unicast: () => {},
  WriteChar: () => {},
  WriteByte: () => {},
  WriteShort: () => {},
  WriteLong: () => {},
  WriteFloat: () => {},
  WriteString: () => {},
  WritePosition: () => {},
  WriteDir: () => {},
  WriteAngle: () => {},
  TagMalloc: () => ({}),
  TagFree: () => {},
  FreeTags: () => {},
  cvar: (name: string, value: string) => createCvar(name, value),
  cvar_set: (name: string, value: string) => {
    cvarValues.set(name, value);
    return createCvar(name, value);
  },
  cvar_forceset: (name: string, value: string) => {
    cvarValues.set(name, value);
    return createCvar(name, value);
  },
  argc: () => 0,
  argv: () => "",
  args: () => "",
  AddCommandString: () => {},
  DebugGraph: () => {}
};

const context = createGameMainContext(imports);
InitGame(context);
verifySpawnTableParity();

SpawnEntities(
  context,
  "base1",
  `{
"classname" "worldspawn"
"message" "Unit\\nTest Level"
"nextmap" "unit_next"
"sky" "space1"
"skyrotate" "5"
"skyaxis" "0 0 1"
"gravity" "600"
"sounds" "7"
}
{
"classname" "func_door"
"model" "*1"
"team" "alpha"
}
{
"classname" "func_door"
"model" "*2"
"team" "alpha"
}
{
"classname" "mystery_thing"
}
{
"ClassName" "mystery_case"
}
`,
  "start"
);

const worldspawn = context.runtime.entities[0]!;
assert.equal(worldspawn.movetype, MOVETYPE_PUSH, "worldspawn movetype mismatch");
assert.equal(worldspawn.solid, SOLID_BSP, "worldspawn solid mismatch");
assert.equal(worldspawn.s.modelindex, 1, "worldspawn modelindex mismatch");
assert.equal(context.runtime.mapname, "base1", "runtime.mapname must follow SpawnEntities");
assert.equal(context.level.mapname, "base1", "level.mapname must follow SpawnEntities");
assert.equal(context.level.level_name, "Unit\nTest Level", "worldspawn message must set level name through ED_NewString");
assert.equal(context.level.nextmap, "unit_next", "worldspawn nextmap mismatch");
assert.equal(context.runtime.gravity, 600, "worldspawn gravity must update runtime gravity");
assert.equal(cvarValues.get("sv_gravity"), "600", "worldspawn gravity must call cvar_set");
assert.equal(configstrings.get(CS_NAME), "Unit\nTest Level", "CS_NAME mismatch");
assert.equal(configstrings.get(CS_SKY), "space1", "CS_SKY mismatch");
assert.equal(configstrings.get(CS_SKYROTATE), "5", "CS_SKYROTATE mismatch");
assert.equal(configstrings.get(CS_SKYAXIS), "0 0 1", "CS_SKYAXIS mismatch");
assert.equal(configstrings.get(CS_CDTRACK), "7", "CS_CDTRACK mismatch");
assert.equal(configstrings.get(CS_MAXCLIENTS), "4", "CS_MAXCLIENTS mismatch");
assert.equal(configstrings.get(CS_STATUSBAR), single_statusbar, "single-player CS_STATUSBAR mismatch");
assert.equal(configstrings.get(CS_LIGHTS + 0), "m", "worldspawn lightstyle 0 mismatch");
assert.equal(configstrings.get(CS_LIGHTS + 1), "mmnmmommommnonmmonqnmmo", "worldspawn lightstyle 1 mismatch");
assert.equal(
  configstrings.get(CS_LIGHTS + 2),
  "abcdefghijklmnopqrstuvwxyzyxwvutsrqponmlkjihgfedcba",
  "worldspawn lightstyle 2 mismatch"
);
assert.equal(configstrings.get(CS_LIGHTS + 4), "mamamamamama", "worldspawn lightstyle 4 mismatch");
assert.equal(configstrings.get(CS_LIGHTS + 63), "a", "worldspawn lightstyle 63 mismatch");
assert.equal(configstrings.get(CS_ITEMS + 1), "Body Armor", "first item configstring mismatch");
assert.equal(context.runtime.playerTrail.trail_active, true, "PlayerTrail_Init should run after SpawnEntities");
assert.equal(context.runtime.assets.soundPaths[0], "player/fry.wav", "worldspawn must precache fry sound first");
assert.equal(context.runtime.assets.soundPaths.includes("weapons/blastf1a.wav"), true, "worldspawn must precache Blaster fire sound");
assert.equal(context.runtime.assets.soundPaths.includes("*jump1.wav"), true, "worldspawn must precache sexed jump sound");
assert.equal(context.runtime.assets.soundPaths.includes("infantry/inflies1.wav"), true, "worldspawn must precache monster idle fly loop");
assert.equal(soundIndexes.includes("player/fry.wav"), true, "worldspawn must call gi.soundindex for fry sound");
assert.equal(soundIndexes.includes("weapons/blastf1a.wav"), true, "worldspawn must call gi.soundindex for Blaster sounds");

const unnamedContext = createGameMainContext(imports);
InitGame(unnamedContext);
SpawnEntities(
  unnamedContext,
  "base2",
  `{
"classname" "worldspawn"
}
`,
  ""
);
assert.equal(unnamedContext.level.level_name, "base2", "worldspawn without message must use mapname as level_name");
assert.equal(unnamedContext.level.nextmap, "", "worldspawn without nextmap must leave level.nextmap empty");
assert.equal(configstrings.get(CS_SKY), "unit1_", "worldspawn without sky must publish the original default sky");
assert.equal(configstrings.get(CS_SKYROTATE), "0", "worldspawn without skyrotate must publish the original default rotation");
assert.equal(configstrings.get(CS_SKYAXIS), "0 0 0", "worldspawn without skyaxis must publish the original default axis");

const deathmatchStatusContext = createGameMainContext(imports);
InitGame(deathmatchStatusContext);
deathmatchStatusContext.cvars.deathmatch = createCvar("deathmatch", "1");
SpawnEntities(
  deathmatchStatusContext,
  "dm1",
  `{
"classname" "worldspawn"
}
`,
  ""
);
assert.equal(configstrings.get(CS_STATUSBAR), dm_statusbar, "deathmatch CS_STATUSBAR mismatch");

const firstDoor = context.runtime.entities[5]!;
const secondDoor = context.runtime.entities[6]!;
assert.equal(firstDoor.teamchain, secondDoor, "team master should chain to second door");
assert.equal(secondDoor.teammaster, firstDoor, "team slave should reference team master");
assert.equal((secondDoor.flags & FL_TEAMSLAVE) !== 0, true, "team slave flag mismatch");

const warnedUnknown = context.runtime.logEntries.some(
  (entry) => entry.kind === "warning" && entry.message.includes("mystery_thing doesn't have a spawn function")
);
assert.equal(warnedUnknown, true, "ED_CallSpawn must warn on unknown classnames");
const warnedCaseInsensitiveField = context.runtime.logEntries.some(
  (entry) => entry.kind === "warning" && entry.message.includes("mystery_case doesn't have a spawn function")
);
assert.equal(warnedCaseInsensitiveField, true, "SpawnEntities must reach ED_ParseField case-insensitive key parsing");

const nullClassEntity = spawnGameEntity(context.runtime);
nullClassEntity.classname = "";
ED_CallSpawn(nullClassEntity, context.runtime);
const warnedNull = context.runtime.logEntries.some(
  (entry) => entry.kind === "warning" && entry.message.includes("ED_CallSpawn: NULL classname")
);
assert.equal(warnedNull, true, "ED_CallSpawn must warn on null classname");

assert.equal(ED_NewString("line\\nnext"), "line\nnext", "ED_NewString must translate newline escapes");
assert.equal(ED_NewString("sound\\xname"), "sound\\name", "ED_NewString must preserve C unknown backslash escape behavior");

const parsedFieldEntity = spawnGameEntity(context.runtime);
const parsedSpawnTemp = createSpawnTemp();
ED_ParseField("ClassName", "func_door", parsedFieldEntity, context.runtime, parsedSpawnTemp);
ED_ParseField("message", "hello\\nmarine", parsedFieldEntity, context.runtime, parsedSpawnTemp);
ED_ParseField("origin", "1 2 3", parsedFieldEntity, context.runtime, parsedSpawnTemp);
ED_ParseField("angles", "4 5 6", parsedFieldEntity, context.runtime, parsedSpawnTemp);
ED_ParseField("angle", "90", parsedFieldEntity, context.runtime, parsedSpawnTemp);
ED_ParseField("spawnflags", "12", parsedFieldEntity, context.runtime, parsedSpawnTemp);
ED_ParseField("speed", "123.5", parsedFieldEntity, context.runtime, parsedSpawnTemp);
ED_ParseField("light", "ignored", parsedFieldEntity, context.runtime, parsedSpawnTemp);
ED_ParseField("enemy", "7", parsedFieldEntity, context.runtime, parsedSpawnTemp);
ED_ParseField("noise", "plats\\ntrain.wav", parsedFieldEntity, context.runtime, parsedSpawnTemp);
ED_ParseField("skyaxis", "0 0 1", parsedFieldEntity, context.runtime, parsedSpawnTemp);
ED_ParseField("unknown_field", "value", parsedFieldEntity, context.runtime, parsedSpawnTemp);
assert.equal(parsedFieldEntity.classname, "func_door", "ED_ParseField must match keys case-insensitively");
assert.equal(parsedFieldEntity.message, "hello\nmarine", "ED_ParseField must apply ED_NewString to entity strings");
assert.deepEqual(parsedFieldEntity.s.origin, [1, 2, 3], "ED_ParseField must parse origin vectors into entity_state");
assert.deepEqual(parsedFieldEntity.origin, [1, 2, 3], "ED_ParseField must keep runtime origin in sync");
assert.deepEqual(parsedFieldEntity.s.angles, [0, 90, 0], "ED_ParseField anglehack must write yaw-only angles");
assert.deepEqual(parsedFieldEntity.angles, [0, 90, 0], "ED_ParseField anglehack must keep runtime angles in sync");
assert.equal(parsedFieldEntity.spawnflags, 12, "ED_ParseField must parse integer fields");
assert.equal(parsedFieldEntity.speed, 123.5, "ED_ParseField must parse float fields");
assert.equal(parsedFieldEntity.enemy, null, "ED_ParseField must skip FFL_NOSPAWN fields during spawn parsing");
assert.equal(parsedFieldEntity.properties.light, "ignored", "ED_ParseField F_IGNORE must preserve the source property without mutating gameplay fields");
assert.equal(parsedFieldEntity.properties.noise, "plats\ntrain.wav", "ED_ParseField must preserve spawn-temp string fields for TS spawn callbacks");
assert.equal(parsedSpawnTemp.noise, "plats\ntrain.wav", "ED_ParseField must fill optional spawn_temp_t string fields");
assert.deepEqual(parsedSpawnTemp.skyaxis, [0, 0, 1], "ED_ParseField must fill optional spawn_temp_t vector fields");
assert.equal(
  context.runtime.logEntries.some((entry) => entry.kind === "warning" && entry.message.includes("unknown_field is not a field")),
  true,
  "ED_ParseField must warn on unknown fields"
);

const parsedEdictEntity = spawnGameEntity(context.runtime);
const parsedEdictEnd = ED_ParseEdict(
  `{
"_comment" "discarded"
"classname" "info_player_intermission"
"angle" "270"
"message" "edict\\nmessage"
}
{
"classname" "info_null"
}
`,
  1,
  parsedEdictEntity,
  context.runtime
);
assert.notEqual(parsedEdictEnd, null, "ED_ParseEdict must return the next scan position after the closing brace");
assert.equal(parsedEdictEntity.classname, "info_player_intermission", "ED_ParseEdict must parse key/value pairs into the edict");
assert.equal(parsedEdictEntity.message, "edict\nmessage", "ED_ParseEdict must route string fields through ED_ParseField");
assert.deepEqual(parsedEdictEntity.s.angles, [0, 270, 0], "ED_ParseEdict must preserve the C anglehack path from angle to yaw angles");
assert.equal(parsedEdictEntity.properties._comment, undefined, "ED_ParseEdict must discard utility keys with a leading underscore");

const emptyParsedEdict = spawnGameEntity(context.runtime);
emptyParsedEdict.classname = "before_empty_parse";
ED_ParseEdict(`{
}
`, 1, emptyParsedEdict, context.runtime);
assert.equal(emptyParsedEdict.inuse, false, "ED_ParseEdict must clear an edict with no parsed fields");
assert.equal(emptyParsedEdict.classname, "", "ED_ParseEdict empty dictionaries must clear classname state");

assert.throws(
  () => ED_ParseEdict(`{
"classname"`, 1, spawnGameEntity(context.runtime), context.runtime),
  /EOF without closing brace/,
  "ED_ParseEdict must error on EOF before a closing brace"
);
assert.throws(
  () => ED_ParseEdict(`{
"classname" }
`, 1, spawnGameEntity(context.runtime), context.runtime),
  /closing brace without data/,
  "ED_ParseEdict must error on a closing brace where a value is expected"
);

const itemSpawnEntity = spawnGameEntity(context.runtime);
itemSpawnEntity.classname = "weapon_machinegun";
ED_CallSpawn(itemSpawnEntity, context.runtime);
assert.equal(itemSpawnEntity.itemPickupName, "Machinegun", "ED_CallSpawn must check itemlist before spawns[]");
assert.equal(itemSpawnEntity.think?.name, "droptofloor", "ED_CallSpawn item path must call SpawnItem");

const uppercaseItemClassEntity = spawnGameEntity(context.runtime);
uppercaseItemClassEntity.classname = "WEAPON_MACHINEGUN";
ED_CallSpawn(uppercaseItemClassEntity, context.runtime);
assert.equal(uppercaseItemClassEntity.itemPickupName ?? null, null, "ED_CallSpawn itemlist path must preserve strcmp case sensitivity");
assert.equal(
  context.runtime.logEntries.some((entry) => entry.kind === "warning" && entry.message.includes("WEAPON_MACHINEGUN doesn't have a spawn function")),
  true,
  "ED_CallSpawn uppercase item classname must fall through to the warning path"
);

const wallEntity = spawnGameEntity(context.runtime);
wallEntity.classname = "func_wall";
ED_CallSpawn(wallEntity, context.runtime);
assert.equal(wallEntity.solid, SOLID_BSP, "ED_CallSpawn must dispatch func_wall");

const objectEntity = spawnGameEntity(context.runtime);
objectEntity.classname = "func_object";
ED_CallSpawn(objectEntity, context.runtime);
assert.equal(objectEntity.solid, SOLID_BSP, "ED_CallSpawn must dispatch func_object");

const conveyorEntity = spawnGameEntity(context.runtime);
conveyorEntity.classname = "func_conveyor";
ED_CallSpawn(conveyorEntity, context.runtime);
assert.equal(conveyorEntity.solid, SOLID_BSP, "ED_CallSpawn must dispatch func_conveyor");

assert.equal(spawns.some((entry) => entry.name === "func_conveyor"), true, "spawns[] must expose func_conveyor");
assert.equal(spawns.some((entry) => entry.name === "func_wall"), true, "spawns[] must expose func_wall");
assert.equal(spawns.some((entry) => entry.name === "func_object"), true, "spawns[] must expose func_object");

const lightSpawnEntry = spawns.find((spawn) => spawn.name === "light");
assert.ok(lightSpawnEntry, "spawn table must include light");
assert.equal(typeof lightSpawnEntry.spawn, "function", "light spawn_t.spawn must be a function");

const lightEntity = spawnGameEntity(context.runtime);
lightEntity.classname = "light";
lightEntity.targetname = "toggle_light";
lightEntity.style = 33;
lightEntity.spawnflags = 1;
ED_CallSpawn(lightEntity, context.runtime);
assert.equal(typeof lightEntity.use, "function", "SP_light must install light_use for targeted custom styles");
assert.equal(context.runtime.configstrings.get(CS_LIGHTS + 33), "a", "START_OFF SP_light must publish the off lightstyle");
lightEntity.use?.(lightEntity, null, lightEntity, context.runtime);
assert.equal((lightEntity.spawnflags & 1) === 0, true, "light_use must clear START_OFF when turning on");
assert.equal(context.runtime.configstrings.get(CS_LIGHTS + 33), "m", "light_use must publish the on lightstyle");
lightEntity.use?.(lightEntity, null, lightEntity, context.runtime);
assert.equal((lightEntity.spawnflags & 1) !== 0, true, "light_use must restore START_OFF when turning off");
assert.equal(context.runtime.configstrings.get(CS_LIGHTS + 33), "a", "light_use must publish the off lightstyle again");

const styleZeroLight = spawnGameEntity(context.runtime);
styleZeroLight.classname = "light";
styleZeroLight.targetname = "ambient_light";
styleZeroLight.style = 0;
ED_CallSpawn(styleZeroLight, context.runtime);
assert.equal(styleZeroLight.use, undefined, "SP_light must leave non-custom style lights without a use callback");

while (context.runtime.entities.length <= context.runtime.maxclients + 8) {
  spawnGameEntity(context.runtime);
}
const deathmatchLight = spawnGameEntity(context.runtime);
deathmatchLight.classname = "light";
deathmatchLight.targetname = "dm_toggle_light";
deathmatchLight.style = 34;
context.runtime.deathmatch = true;
ED_CallSpawn(deathmatchLight, context.runtime);
context.runtime.deathmatch = false;
assert.equal(deathmatchLight.inuse, false, "SP_light must free targeted lights in deathmatch");

const teamRuntime = createGameMainContext(imports).runtime;
const teamMaster = spawnGameEntity(teamRuntime);
teamMaster.classname = "func_door";
teamMaster.team = "beta";
const teamSlave = spawnGameEntity(teamRuntime);
teamSlave.classname = "func_door";
teamSlave.team = "beta";
const unrelated = spawnGameEntity(teamRuntime);
unrelated.classname = "func_door";
unrelated.team = "gamma";

const teamResult = G_FindTeams(teamRuntime);
assert.deepEqual(teamResult, { teamCount: 2, entityCount: 3 }, "G_FindTeams count mismatch");
assert.equal(teamMaster.teamchain, teamSlave, "G_FindTeams must chain team members in entity order");
assert.equal(teamSlave.teammaster, teamMaster, "G_FindTeams teammaster mismatch");
assert.equal((teamSlave.flags & FL_TEAMSLAVE) !== 0, true, "G_FindTeams team slave flag mismatch");

const healthSpawnNames = [
  "item_health",
  "item_health_small",
  "item_health_large",
  "item_health_mega"
] as const;

for (const name of healthSpawnNames) {
  const entry = spawns.find((spawn) => spawn.name === name);
  assert.ok(entry, `spawn table must include ${name}`);
  assert.equal(typeof entry.name, "string", `${name} spawn_t.name must be a string`);
  assert.equal(typeof entry.spawn, "function", `${name} spawn_t.spawn must be a function`);
}

const playerSpawnNames = [
  "info_player_start",
  "info_player_deathmatch",
  "info_player_coop",
  "info_player_intermission"
] as const;

for (const name of playerSpawnNames) {
  const entry = spawns.find((spawn) => spawn.name === name);
  assert.ok(entry, `spawn table must include ${name}`);
  assert.equal(typeof entry.name, "string", `${name} spawn_t.name must be a string`);
  assert.equal(typeof entry.spawn, "function", `${name} spawn_t.spawn must be a function`);
}

const funcSpawnNames = [
  "func_plat",
  "func_rotating",
  "func_button",
  "func_door",
  "func_door_secret",
  "func_door_rotating",
  "func_water",
  "func_train",
  "func_clock"
] as const;

for (const name of funcSpawnNames) {
  const entry = spawns.find((spawn) => spawn.name === name);
  assert.ok(entry, `spawn table must include ${name}`);
  assert.equal(typeof entry.spawn, "function", `${name} spawn_t.spawn must be a function`);
}

const playerSpawnMapContext = createGameMainContext(imports);
InitGame(playerSpawnMapContext);
SpawnEntities(
  playerSpawnMapContext,
  "player_spawns",
  `{
"classname" "worldspawn"
}
{
"classname" "info_player_start"
"origin" "10 20 30"
"angles" "0 90 0"
}
{
"classname" "info_player_deathmatch"
"origin" "40 50 60"
}
{
"classname" "info_player_coop"
"origin" "70 80 90"
}
{
"classname" "info_player_intermission"
"origin" "100 110 120"
"angles" "15 180 5"
}
`,
  ""
);

const defaultStart = playerSpawnMapContext.runtime.entities.find((entity) => entity.classname === "info_player_start");
assert.ok(defaultStart?.inuse, "info_player_start must survive normal map spawning");
assert.equal(defaultStart.think, undefined, "info_player_start must not schedule the security coop hack outside coop");
const protectedDeathmatchSpot = playerSpawnMapContext.runtime.entities.find((entity) => entity.classname === "info_player_deathmatch");
assert.ok(protectedDeathmatchSpot, "info_player_deathmatch map entity should still be present in the protected edict prefix");
assert.equal(protectedDeathmatchSpot.linked, false, "info_player_deathmatch outside deathmatch must not be linked or visible");
assert.equal(protectedDeathmatchSpot.s.modelindex, 0, "info_player_deathmatch outside deathmatch must not publish a modelindex");
const protectedCoopSpot = playerSpawnMapContext.runtime.entities.find((entity) => entity.classname === "info_player_coop");
assert.ok(protectedCoopSpot, "info_player_coop map entity should still be present in the protected edict prefix");
assert.equal(protectedCoopSpot.linked, false, "info_player_coop outside coop must not be linked or visible");
const defaultIntermission = playerSpawnMapContext.runtime.entities.find((entity) => entity.classname === "info_player_intermission");
assert.ok(defaultIntermission?.inuse, "info_player_intermission must remain available for BeginIntermission");
assert.deepEqual(defaultIntermission.s.origin, [100, 110, 120], "info_player_intermission origin must be preserved");
assert.deepEqual(defaultIntermission.s.angles, [15, 180, 5], "info_player_intermission angles must be preserved");

let unprotectedDeathmatchSpot = spawnGameEntity(playerSpawnMapContext.runtime);
while (unprotectedDeathmatchSpot.index <= playerSpawnMapContext.runtime.maxclients + 8) {
  unprotectedDeathmatchSpot = spawnGameEntity(playerSpawnMapContext.runtime);
}
unprotectedDeathmatchSpot.classname = "info_player_deathmatch";
ED_CallSpawn(unprotectedDeathmatchSpot, playerSpawnMapContext.runtime);
assert.equal(unprotectedDeathmatchSpot.inuse, false, "info_player_deathmatch must call G_FreeEdict outside deathmatch");

let unprotectedCoopSpot = spawnGameEntity(playerSpawnMapContext.runtime);
while (unprotectedCoopSpot.index <= playerSpawnMapContext.runtime.maxclients + 8) {
  unprotectedCoopSpot = spawnGameEntity(playerSpawnMapContext.runtime);
}
unprotectedCoopSpot.classname = "info_player_coop";
ED_CallSpawn(unprotectedCoopSpot, playerSpawnMapContext.runtime);
assert.equal(unprotectedCoopSpot.inuse, false, "info_player_coop must call G_FreeEdict outside coop");

const deathmatchSpawnContext = createGameMainContext(imports);
InitGame(deathmatchSpawnContext);
deathmatchSpawnContext.cvars.deathmatch!.value = 1;
deathmatchSpawnContext.cvars.deathmatch!.string = "1";
SpawnEntities(
  deathmatchSpawnContext,
  "deathmatch_spawns",
  `{
"classname" "worldspawn"
}
{
"classname" "info_player_deathmatch"
"origin" "40 50 60"
}
`,
  ""
);
const deathmatchSpot = deathmatchSpawnContext.runtime.entities.find((entity) => entity.classname === "info_player_deathmatch");
assert.ok(deathmatchSpot?.inuse, "info_player_deathmatch must survive in deathmatch");
assert.equal(deathmatchSpot.model, "models/objects/dmspot/tris.md2", "info_player_deathmatch must spawn the teleporter destination model");
assert.equal(deathmatchSpot.solid, SOLID_BBOX, "info_player_deathmatch teleporter destination solid mismatch");
assert.equal(deathmatchSpot.s.modelindex > 0, true, "info_player_deathmatch must publish a modelindex for the dm spot");
assert.equal(
  deathmatchSpawnContext.runtime.assets.modelPaths[deathmatchSpot.s.modelindex - 1],
  "models/objects/dmspot/tris.md2",
  "info_player_deathmatch modelindex must resolve to the dm spot model"
);

const coopSecurityContext = createGameMainContext(imports);
InitGame(coopSecurityContext);
coopSecurityContext.cvars.coop!.value = 1;
coopSecurityContext.cvars.coop!.string = "1";
SpawnEntities(
  coopSecurityContext,
  "security",
  `{
"classname" "worldspawn"
}
{
"classname" "info_player_start"
"origin" "10 20 30"
}
`,
  ""
);
const securityStart = coopSecurityContext.runtime.entities.find((entity) => entity.classname === "info_player_start");
assert.ok(securityStart?.inuse, "security info_player_start must survive coop spawning");
assert.equal(typeof securityStart.think, "function", "security info_player_start must schedule SP_CreateCoopSpots in coop");
assert.equal(securityStart.nextthink, FRAMETIME, "security info_player_start nextthink must match level.time + FRAMETIME");
G_RunFrame(coopSecurityContext);
const securityCoopSpots = coopSecurityContext.runtime.entities.filter((entity) => entity.inuse && entity.classname === "info_player_coop");
assert.equal(securityCoopSpots.length, 3, "security coop hack must create the three original info_player_coop spots");
assert.deepEqual(securityCoopSpots.map((entity) => entity.s.origin), [[124, -164, 80], [252, -164, 80], [316, -164, 80]], "security coop spot origins mismatch");
assert.deepEqual(securityCoopSpots.map((entity) => entity.targetname), ["jail3", "jail3", "jail3"], "security coop spot targetnames mismatch");
assert.deepEqual(securityCoopSpots.map((entity) => entity.s.angles[1]), [90, 90, 90], "security coop spot yaw mismatch");

const coopFixupContext = createGameMainContext(imports);
InitGame(coopFixupContext);
coopFixupContext.cvars.coop!.value = 1;
coopFixupContext.cvars.coop!.string = "1";
SpawnEntities(
  coopFixupContext,
  "jail2",
  `{
"classname" "worldspawn"
}
{
"classname" "info_player_start"
"origin" "0 0 0"
"targetname" "entry_a"
}
{
"classname" "info_player_coop"
"origin" "128 0 0"
}
`,
  ""
);
const coopSpot = coopFixupContext.runtime.entities.find((entity) => entity.classname === "info_player_coop");
assert.ok(coopSpot?.inuse, "info_player_coop must survive in coop");
assert.equal(typeof coopSpot.think, "function", "jail2 info_player_coop must schedule SP_FixCoopSpots");
assert.equal(coopSpot.nextthink, FRAMETIME, "jail2 info_player_coop nextthink must match level.time + FRAMETIME");
G_RunFrame(coopFixupContext);
assert.equal(coopSpot.targetname, "entry_a", "SP_FixCoopSpots must copy the nearest named info_player_start targetname");

const healthCases = [
  { classname: "item_health", model: "models/items/healing/medium/tris.md2", count: 10, style: 0, sound: "items/n_health.wav" },
  { classname: "item_health_small", model: "models/items/healing/stimpack/tris.md2", count: 2, style: 1, sound: "items/s_health.wav" },
  { classname: "item_health_large", model: "models/items/healing/large/tris.md2", count: 25, style: 0, sound: "items/l_health.wav" },
  { classname: "item_health_mega", model: "models/items/mega_h/tris.md2", count: 100, style: 3, sound: "items/m_health.wav" }
] as const;

for (const healthCase of healthCases) {
  const healthContext = createGameMainContext(imports);
  InitGame(healthContext);
  const healthEntity = spawnGameEntity(healthContext.runtime);
  healthEntity.classname = healthCase.classname;

  ED_CallSpawn(healthEntity, healthContext.runtime);

  assert.equal(healthEntity.model, healthCase.model, `${healthCase.classname} model mismatch`);
  assert.equal(healthEntity.count, healthCase.count, `${healthCase.classname} count mismatch`);
  assert.equal(healthEntity.style, healthCase.style, `${healthCase.classname} style mismatch`);
  assert.equal(healthEntity.itemPickupName, "Health", `${healthCase.classname} must use the Health item`);
  assert.equal(healthEntity.s.renderfx, RF_GLOW, `${healthCase.classname} renderfx mismatch`);
  assert.equal(healthContext.runtime.assets.modelPaths.includes(healthCase.model), true, `${healthCase.classname} must register its model`);
  assert.equal(healthContext.runtime.assets.soundPaths.includes(healthCase.sound), true, `${healthCase.classname} must register its sound`);
}

const healthMapContext = createGameMainContext(imports);
InitGame(healthMapContext);
SpawnEntities(
  healthMapContext,
  "healthmap",
  `{
"classname" "worldspawn"
}
{
"classname" "item_health"
"origin" "8 0 24"
}
{
"classname" "item_health_small"
"origin" "16 0 24"
}
{
"classname" "item_health_large"
"origin" "24 0 24"
}
{
"classname" "item_health_mega"
"origin" "32 0 24"
}
`,
  ""
);
G_RunFrame(healthMapContext);
G_RunFrame(healthMapContext);

for (const healthCase of healthCases) {
  const entity = healthMapContext.runtime.entities.find((candidate) => candidate.inuse && candidate.classname === healthCase.classname);
  assert.ok(entity, `SpawnEntities must keep ${healthCase.classname} in the runtime`);
  assert.equal(entity.model, healthCase.model, `SpawnEntities ${healthCase.classname} model mismatch`);
  assert.equal(entity.count, healthCase.count, `SpawnEntities ${healthCase.classname} count mismatch`);
  assert.equal(entity.style, healthCase.style, `SpawnEntities ${healthCase.classname} style mismatch`);
  assert.equal(entity.itemPickupName, "Health", `SpawnEntities ${healthCase.classname} must use Health item`);
  assert.equal(entity.s.renderfx, RF_GLOW, `SpawnEntities ${healthCase.classname} renderfx mismatch`);
  assert.equal(entity.s.modelindex > 0, true, `G_RunFrame/droptofloor must publish ${healthCase.classname} modelindex`);
  assert.equal(
    healthMapContext.runtime.assets.modelPaths[entity.s.modelindex - 1],
    healthCase.model,
    `${healthCase.classname} modelindex must resolve to the spawned health model`
  );
}

const noHealthContext = createGameMainContext(imports);
InitGame(noHealthContext);
noHealthContext.cvars.deathmatch!.value = 1;
noHealthContext.cvars.deathmatch!.string = "1";
noHealthContext.runtime.deathmatch = true;
noHealthContext.runtime.dmflags = DF_NO_HEALTH;
for (const healthCase of healthCases) {
  let healthEntity = spawnGameEntity(noHealthContext.runtime);
  while (healthEntity.index <= noHealthContext.runtime.maxclients + 8) {
    healthEntity = spawnGameEntity(noHealthContext.runtime);
  }
  healthEntity.classname = healthCase.classname;
  ED_CallSpawn(healthEntity, noHealthContext.runtime);
  assert.equal(healthEntity.inuse, false, `${healthCase.classname} must be freed by DF_NO_HEALTH in deathmatch`);
}

const skillContext = createGameMainContext(imports);
InitGame(skillContext);
skillContext.cvars.skill!.value = 0;
skillContext.cvars.skill!.string = "0";
SpawnEntities(
  skillContext,
  "skilltest",
  `{
"classname" "worldspawn"
}
{
"classname" "func_door"
"model" "*1"
"targetname" "easy_only_filtered"
"spawnflags" "${SPAWNFLAG_NOT_EASY}"
}
{
"classname" "func_door"
"model" "*2"
"targetname" "medium_only_survives"
"spawnflags" "${SPAWNFLAG_NOT_MEDIUM}"
}
`,
  ""
);
assert.equal(
  skillContext.runtime.entities.some((entity) => entity.inuse && entity.targetname === "easy_only_filtered"),
  false,
  "SPAWNFLAG_NOT_EASY must inhibit entities on skill 0"
);
const mediumSurvivor = skillContext.runtime.entities.find((entity) => entity.inuse && entity.targetname === "medium_only_survives");
assert.ok(mediumSurvivor, "non-matching skill spawnflag entity should survive");
assert.equal(mediumSurvivor.spawnflags & SPAWNFLAG_NOT_MEDIUM, 0, "surviving spawnflags must be stripped");

const deathmatchContext = createGameMainContext(imports);
InitGame(deathmatchContext);
deathmatchContext.cvars.deathmatch!.value = 1;
deathmatchContext.cvars.deathmatch!.string = "1";
SpawnEntities(
  deathmatchContext,
  "dmtest",
  `{
"classname" "worldspawn"
}
{
"classname" "func_door"
"model" "*1"
"targetname" "dm_filtered"
"spawnflags" "${SPAWNFLAG_NOT_DEATHMATCH}"
}
`,
  ""
);
assert.equal(
  deathmatchContext.runtime.entities.some((entity) => entity.inuse && entity.targetname === "dm_filtered"),
  false,
  "SPAWNFLAG_NOT_DEATHMATCH must inhibit entities in deathmatch"
);

const allocationContext = createGameMainContext(imports);
InitGame(allocationContext);
const manyUntargetedLights = Array.from({ length: 1100 }, (_, index) => `{
"classname" "light"
"style" "${32 + index}"
}`).join("\n");
SpawnEntities(
  allocationContext,
  "allocation_reuse",
  `{
"classname" "worldspawn"
}
${manyUntargetedLights}
{
"classname" "func_door"
"model" "*30"
"targetname" "late_visible_door"
}
`,
  ""
);
assert.equal(
  allocationContext.runtime.entities.length < MAX_EDICTS,
  true,
  "SpawnEntities must reuse freed edicts instead of prebuilding every BSP entity"
);
const lateVisibleDoor = allocationContext.runtime.entities.find((entity) => entity.inuse && entity.targetname === "late_visible_door");
assert.ok(lateVisibleDoor, "late visible brush entity should survive after many freed spawns");
assert.equal(
  lateVisibleDoor.index < MAX_EDICTS,
  true,
  "visible entities emitted by SpawnEntities must stay inside the server baseline range"
);

const funcBrushContext = createGameMainContext(imports);
InitGame(funcBrushContext);
SpawnEntities(
  funcBrushContext,
  "func_brushes",
  `{
"classname" "worldspawn"
}
{
"classname" "func_plat"
"model" "*10"
"targetname" "lift"
"height" "24"
}
{
"classname" "func_rotating"
"model" "*11"
"spawnflags" "${1 | 4 | 64 | 128}"
"speed" "90"
}
{
"classname" "func_button"
"model" "*12"
"angle" "0"
"lip" "4"
"wait" "2"
}
{
"classname" "func_door"
"model" "*13"
"angle" "0"
"spawnflags" "${16 | 64}"
"targetname" "remote_door"
}
{
"classname" "func_door_secret"
"model" "*14"
"angle" "0"
"targetname" "secret_door"
"message" "secret"
}
{
"classname" "func_door_rotating"
"model" "*15"
"spawnflags" "${2 | 16 | 64}"
"distance" "45"
"targetname" "rotating_remote"
}
{
"classname" "func_water"
"model" "*16"
"angle" "-1"
"sounds" "1"
}
{
"classname" "path_corner"
"targetname" "train_start"
"target" "train_next"
"origin" "96 0 0"
}
{
"classname" "path_corner"
"targetname" "train_next"
"origin" "160 0 0"
}
{
"classname" "func_train"
"model" "*17"
"target" "train_start"
"speed" "80"
"noise" "plats/train.wav"
}
{
"classname" "func_conveyor"
"model" "*18"
"speed" "120"
}
{
"classname" "func_wall"
"model" "*19"
"spawnflags" "${1 | 2 | 8 | 16}"
}
{
"classname" "func_object"
"model" "*20"
"origin" "32 48 64"
"mins" "-16 -16 0"
"maxs" "16 16 32"
"spawnflags" "${2 | 4}"
}
{
"classname" "func_object"
"model" "*21"
"origin" "64 48 64"
"mins" "-16 -16 0"
"maxs" "16 16 32"
}
{
"classname" "func_areaportal"
"targetname" "test_portal"
"style" "3"
}
{
"classname" "func_explosive"
"model" "*22"
"spawnflags" "${1 | 2 | 4}"
"mass" "125"
"dmg" "80"
}
{
"classname" "func_explosive"
"model" "*23"
"targetname" "targeted_explosive"
}
`,
  ""
);

const spawnedPlat = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_plat");
assert.ok(spawnedPlat, "SpawnEntities must keep func_plat in the runtime");
assert.equal(spawnedPlat.movetype, MOVETYPE_PUSH, "SpawnEntities func_plat movetype mismatch");
assert.equal(spawnedPlat.solid, SOLID_BSP, "SpawnEntities func_plat solid mismatch");
assert.equal(spawnedPlat.moveinfo.state, STATE_UP, "targetnamed func_plat must start in STATE_UP");
assert.equal(spawnedPlat.moveinfo.distance, 24, "SpawnEntities func_plat height distance mismatch");
assert.equal(spawnedPlat.s.modelindex > 0, true, "SpawnEntities func_plat must publish an inline brush modelindex");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedPlat.s.modelindex - 1], "*10", "func_plat modelindex must resolve to *10");
const spawnedPlatTrigger = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "plat_trigger");
assert.ok(spawnedPlatTrigger, "SP_func_plat must spawn its center trigger through ED_CallSpawn");
assert.equal(spawnedPlatTrigger.solid, SOLID_TRIGGER, "func_plat trigger solid mismatch");
assert.equal(spawnedPlatTrigger.enemy, spawnedPlat, "func_plat trigger must target the platform");

const spawnedRotating = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_rotating");
assert.ok(spawnedRotating, "SpawnEntities must keep func_rotating in the runtime");
assert.equal(spawnedRotating.movetype, MOVETYPE_PUSH, "SpawnEntities func_rotating movetype mismatch");
assert.deepEqual(spawnedRotating.movedir, [0, 0, 1], "SpawnEntities func_rotating X_AXIS movedir mismatch");
assert.deepEqual(spawnedRotating.avelocity, [0, 0, 90], "SpawnEntities func_rotating START_ON velocity mismatch");
assert.equal((spawnedRotating.s.effects & EF_ANIM_ALL) !== 0, true, "SpawnEntities func_rotating EF_ANIM_ALL mismatch");
assert.equal((spawnedRotating.s.effects & EF_ANIM_ALLFAST) !== 0, true, "SpawnEntities func_rotating EF_ANIM_ALLFAST mismatch");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedRotating.s.modelindex - 1], "*11", "func_rotating modelindex must resolve to *11");

const spawnedButton = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_button");
assert.ok(spawnedButton, "SpawnEntities must keep func_button in the runtime");
assert.equal(spawnedButton.movetype, MOVETYPE_STOP, "SpawnEntities func_button movetype mismatch");
assert.equal(spawnedButton.solid, SOLID_BSP, "SpawnEntities func_button solid mismatch");
assert.equal(spawnedButton.moveinfo.state, STATE_BOTTOM, "SpawnEntities func_button initial state mismatch");
assert.equal(spawnedButton.moveinfo.wait, 2, "SpawnEntities func_button wait mismatch");
assert.equal((spawnedButton.s.effects & EF_ANIM01) !== 0, true, "SpawnEntities func_button idle animation mismatch");
assert.equal(typeof spawnedButton.touch, "function", "SpawnEntities func_button must be touchable when untargeted");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedButton.s.modelindex - 1], "*12", "func_button modelindex must resolve to *12");

const spawnedDoor = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_door" && entity.targetname === "remote_door");
assert.ok(spawnedDoor, "SpawnEntities must keep func_door in the runtime");
assert.equal(spawnedDoor.movetype, MOVETYPE_PUSH, "SpawnEntities func_door movetype mismatch");
assert.equal(spawnedDoor.solid, SOLID_BSP, "SpawnEntities func_door solid mismatch");
assert.equal(spawnedDoor.moveinfo.state, STATE_BOTTOM, "SpawnEntities func_door initial state mismatch");
assert.equal(typeof spawnedDoor.use, "function", "SpawnEntities func_door must expose the runtime use callback");
assert.equal(typeof spawnedDoor.think, "function", "targetnamed func_door must schedule move-speed calculation");
assert.equal(spawnedDoor.nextthink, FRAMETIME, "targetnamed func_door nextthink mismatch");
assert.equal((spawnedDoor.s.effects & EF_ANIM_ALL) !== 0, true, "SpawnEntities func_door EF_ANIM_ALL mismatch");
assert.equal((spawnedDoor.s.effects & EF_ANIM_ALLFAST) !== 0, true, "SpawnEntities func_door EF_ANIM_ALLFAST mismatch");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedDoor.s.modelindex - 1], "*13", "func_door modelindex must resolve to *13");
G_RunFrame(funcBrushContext);
assert.equal(spawnedDoor.nextthink, 0, "G_RunFrame must execute func_door scheduled move-speed think");
assert.equal(
  funcBrushContext.runtime.logEntries.some((entry) => entry.kind === "think" && entry.entityIndex === spawnedDoor.index && entry.message.includes("calc move speed")),
  true,
  "G_RunFrame must log func_door move-speed calculation"
);

const spawnedSecretDoor = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.targetname === "secret_door");
assert.ok(spawnedSecretDoor, "SpawnEntities must keep func_door_secret in the runtime");
assert.equal(spawnedSecretDoor.classname, "func_door", "SP_func_door_secret must rewrite classname to func_door");
assert.equal(spawnedSecretDoor.movetype, MOVETYPE_PUSH, "SpawnEntities func_door_secret movetype mismatch");
assert.equal(spawnedSecretDoor.solid, SOLID_BSP, "SpawnEntities func_door_secret solid mismatch");
assert.equal(typeof spawnedSecretDoor.use, "function", "SpawnEntities func_door_secret must expose use callback");
assert.equal(typeof spawnedSecretDoor.touch, "function", "SpawnEntities func_door_secret target message must expose touch callback");
assert.equal(spawnedSecretDoor.moveinfo.speed, 50, "SpawnEntities func_door_secret speed mismatch");
assert.equal(spawnedSecretDoor.moveinfo.sound_start > 0, true, "SpawnEntities func_door_secret start sound mismatch");
assert.equal(funcBrushContext.runtime.assets.soundPaths.includes("misc/talk.wav"), true, "SP_func_door_secret message must precache talk sound");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedSecretDoor.s.modelindex - 1], "*14", "func_door_secret modelindex must resolve to *14");

const spawnedRotatingDoor = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_door_rotating");
assert.ok(spawnedRotatingDoor, "SpawnEntities must keep func_door_rotating in the runtime");
assert.equal(spawnedRotatingDoor.movetype, MOVETYPE_PUSH, "SpawnEntities func_door_rotating movetype mismatch");
assert.equal(spawnedRotatingDoor.solid, SOLID_BSP, "SpawnEntities func_door_rotating solid mismatch");
assert.deepEqual(spawnedRotatingDoor.movedir.map((value) => Object.is(value, -0) ? 0 : value), [0, 0, -1], "SpawnEntities func_door_rotating reversed X_AXIS movedir mismatch");
assert.deepEqual(spawnedRotatingDoor.pos2, [0, 0, -45], "SpawnEntities func_door_rotating distance mismatch");
assert.equal(spawnedRotatingDoor.moveinfo.state, STATE_BOTTOM, "SpawnEntities func_door_rotating initial state mismatch");
assert.equal(typeof spawnedRotatingDoor.use, "function", "SpawnEntities func_door_rotating must expose use callback");
assert.equal(spawnedRotatingDoor.nextthink, 0, "G_RunFrame must execute func_door_rotating scheduled move-speed think");
assert.equal(
  funcBrushContext.runtime.logEntries.some((entry) => entry.kind === "think" && entry.entityIndex === spawnedRotatingDoor.index && entry.message.includes("calc move speed")),
  true,
  "G_RunFrame must log func_door_rotating move-speed calculation"
);
assert.equal((spawnedRotatingDoor.s.effects & EF_ANIM_ALL) !== 0, true, "SpawnEntities func_door_rotating EF_ANIM_ALL mismatch");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedRotatingDoor.s.modelindex - 1], "*15", "func_door_rotating modelindex must resolve to *15");

const spawnedWater = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.model === "*16");
assert.ok(spawnedWater, "SpawnEntities must keep func_water in the runtime");
assert.equal(spawnedWater.classname, "func_door", "SP_func_water must rewrite classname to func_door");
assert.equal(spawnedWater.movetype, MOVETYPE_PUSH, "SpawnEntities func_water movetype mismatch");
assert.equal(spawnedWater.solid, SOLID_BSP, "SpawnEntities func_water solid mismatch");
assert.deepEqual(spawnedWater.movedir, [0, 0, 1], "SpawnEntities func_water movedir mismatch");
assert.equal(spawnedWater.wait, -1, "SpawnEntities func_water default wait mismatch");
assert.equal((spawnedWater.spawnflags & 32) !== 0, true, "SpawnEntities func_water wait -1 must set DOOR_TOGGLE");
assert.equal(spawnedWater.moveinfo.sound_start > 0, true, "SpawnEntities func_water start sound mismatch");
assert.equal(funcBrushContext.runtime.assets.soundPaths[spawnedWater.moveinfo.sound_start - 1], "world/mov_watr.wav", "func_water sound_start path mismatch");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedWater.s.modelindex - 1], "*16", "func_water modelindex must resolve to *16");

const spawnedTrain = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_train");
assert.ok(spawnedTrain, "SpawnEntities must keep func_train in the runtime");
assert.equal(spawnedTrain.movetype, MOVETYPE_PUSH, "SpawnEntities func_train movetype mismatch");
assert.equal(spawnedTrain.solid, SOLID_BSP, "SpawnEntities func_train solid mismatch");
assert.equal(spawnedTrain.moveinfo.speed, 80, "SpawnEntities func_train speed mismatch");
assert.equal(spawnedTrain.moveinfo.sound_middle > 0, true, "SpawnEntities func_train noise registration mismatch");
assert.equal(funcBrushContext.runtime.assets.soundPaths[spawnedTrain.moveinfo.sound_middle - 1], "plats/train.wav", "func_train noise path mismatch");
assert.equal(typeof spawnedTrain.use, "function", "SpawnEntities func_train must expose use callback");
assert.deepEqual(spawnedTrain.origin, [96, 0, 0], "G_RunFrame must execute func_train_find and move train to first path_corner");
assert.equal(spawnedTrain.target, "train_next", "func_train_find must hand off target to next path_corner");
assert.equal((spawnedTrain.spawnflags & 1) !== 0, true, "func_train_find must start untargeted trains");
assert.equal(spawnedTrain.nextthink, funcBrushContext.runtime.time + FRAMETIME, "func_train_find must schedule train_next for started trains");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedTrain.s.modelindex - 1], "*17", "func_train modelindex must resolve to *17");

const spawnedConveyor = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_conveyor");
assert.ok(spawnedConveyor, "SpawnEntities must keep func_conveyor in the runtime");
assert.equal(spawnedConveyor.solid, SOLID_BSP, "SpawnEntities func_conveyor solid mismatch");
assert.equal(spawnedConveyor.speed, 0, "func_conveyor without START_ON must start stopped");
assert.equal(spawnedConveyor.count, 120, "func_conveyor must store the parsed speed while stopped");
assert.equal(typeof spawnedConveyor.use, "function", "func_conveyor must expose the runtime use callback");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedConveyor.s.modelindex - 1], "*18", "func_conveyor modelindex must resolve to *18");
spawnedConveyor.use?.(spawnedConveyor, null, null, funcBrushContext.runtime);
assert.equal(spawnedConveyor.speed, 120, "func_conveyor use must restore the stored speed");
assert.equal((spawnedConveyor.spawnflags & 1) !== 0, true, "func_conveyor use must set START_ON");
assert.equal(spawnedConveyor.count, 0, "one-shot func_conveyor use must clear stored speed without TOGGLE");

const spawnedWall = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_wall");
assert.ok(spawnedWall, "SpawnEntities must keep func_wall in the runtime");
assert.equal(spawnedWall.movetype, MOVETYPE_PUSH, "SpawnEntities func_wall movetype mismatch");
assert.equal(spawnedWall.solid, SOLID_NOT, "trigger-spawn func_wall must start hidden when START_ON is absent");
assert.equal((spawnedWall.svflags & SVF_NOCLIENT) !== 0, true, "hidden func_wall must set SVF_NOCLIENT");
assert.equal((spawnedWall.s.effects & EF_ANIM_ALL) !== 0, true, "func_wall EF_ANIM_ALL mismatch");
assert.equal((spawnedWall.s.effects & EF_ANIM_ALLFAST) !== 0, true, "func_wall EF_ANIM_ALLFAST mismatch");
assert.equal(typeof spawnedWall.use, "function", "func_wall must expose the runtime use callback");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedWall.s.modelindex - 1], "*19", "func_wall modelindex must resolve to *19");
spawnedWall.use?.(spawnedWall, null, null, funcBrushContext.runtime);
assert.equal(spawnedWall.solid, SOLID_BSP, "func_wall use must make the brush solid");
assert.equal((spawnedWall.svflags & SVF_NOCLIENT) === 0, true, "func_wall use must make the brush client-visible");

const spawnedTriggerObject = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_object" && entity.model === "*20");
assert.ok(spawnedTriggerObject, "SpawnEntities must keep trigger-spawn func_object in the runtime");
assert.equal(spawnedTriggerObject.movetype, MOVETYPE_PUSH, "trigger-spawn func_object movetype mismatch");
assert.equal(spawnedTriggerObject.solid, SOLID_NOT, "trigger-spawn func_object must start hidden");
assert.equal((spawnedTriggerObject.svflags & SVF_NOCLIENT) !== 0, true, "trigger-spawn func_object must set SVF_NOCLIENT");
assert.equal((spawnedTriggerObject.s.effects & EF_ANIM_ALL) !== 0, true, "func_object EF_ANIM_ALL mismatch");
assert.equal((spawnedTriggerObject.s.effects & EF_ANIM_ALLFAST) !== 0, true, "func_object EF_ANIM_ALLFAST mismatch");
assert.equal(typeof spawnedTriggerObject.use, "function", "trigger-spawn func_object must expose the runtime use callback");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedTriggerObject.s.modelindex - 1], "*20", "trigger-spawn func_object modelindex must resolve to *20");
spawnedTriggerObject.use?.(spawnedTriggerObject, null, null, funcBrushContext.runtime);
assert.equal(spawnedTriggerObject.solid, SOLID_BSP, "func_object use must make the brush solid");
assert.equal((spawnedTriggerObject.svflags & SVF_NOCLIENT) === 0, true, "func_object use must make the brush client-visible");
assert.equal(spawnedTriggerObject.movetype, MOVETYPE_TOSS, "func_object use must release the brush into toss physics");

const spawnedPlainObject = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_object" && entity.model === "*21");
assert.ok(spawnedPlainObject, "SpawnEntities must keep plain func_object in the runtime");
assert.equal(spawnedPlainObject.solid, SOLID_BSP, "plain func_object must start solid");
assert.equal(spawnedPlainObject.movetype, MOVETYPE_PUSH, "plain func_object must wait as MOVETYPE_PUSH");
assert.equal(spawnedPlainObject.nextthink, 2 * FRAMETIME, "plain func_object must schedule release after two frames");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedPlainObject.s.modelindex - 1], "*21", "plain func_object modelindex must resolve to *21");

const spawnedAreaPortal = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_areaportal");
assert.ok(spawnedAreaPortal, "SpawnEntities must keep func_areaportal in the runtime");
assert.equal(spawnedAreaPortal.count, 0, "SP_func_areaportal must always start closed");
assert.equal(typeof spawnedAreaPortal.use, "function", "SP_func_areaportal must expose the use callback");
spawnedAreaPortal.use?.(spawnedAreaPortal, null, null, funcBrushContext.runtime);
assert.equal(spawnedAreaPortal.count, 1, "func_areaportal use must toggle the portal state open");
spawnedAreaPortal.use?.(spawnedAreaPortal, null, null, funcBrushContext.runtime);
assert.equal(spawnedAreaPortal.count, 0, "func_areaportal use must toggle the portal state closed");

const spawnedTriggerExplosive = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_explosive" && entity.model === "*22");
assert.ok(spawnedTriggerExplosive, "SpawnEntities must keep trigger-spawn func_explosive in the runtime");
assert.equal(spawnedTriggerExplosive.movetype, MOVETYPE_PUSH, "func_explosive movetype mismatch");
assert.equal(spawnedTriggerExplosive.solid, SOLID_NOT, "trigger-spawn func_explosive must start hidden");
assert.equal((spawnedTriggerExplosive.svflags & SVF_NOCLIENT) !== 0, true, "trigger-spawn func_explosive must set SVF_NOCLIENT");
assert.equal((spawnedTriggerExplosive.s.effects & EF_ANIM_ALL) !== 0, true, "func_explosive EF_ANIM_ALL mismatch");
assert.equal((spawnedTriggerExplosive.s.effects & EF_ANIM_ALLFAST) !== 0, true, "func_explosive EF_ANIM_ALLFAST mismatch");
assert.equal(spawnedTriggerExplosive.takedamage, damage_t.DAMAGE_YES, "trigger-spawn func_explosive must become shootable after reveal path is armed");
assert.equal(typeof spawnedTriggerExplosive.use, "function", "trigger-spawn func_explosive must expose the spawn callback");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedTriggerExplosive.s.modelindex - 1], "*22", "trigger-spawn func_explosive modelindex must resolve to *22");
spawnedTriggerExplosive.use?.(spawnedTriggerExplosive, null, null, funcBrushContext.runtime);
assert.equal(spawnedTriggerExplosive.solid, SOLID_BSP, "func_explosive spawn callback must make the brush solid");
assert.equal((spawnedTriggerExplosive.svflags & SVF_NOCLIENT) === 0, true, "func_explosive spawn callback must make the brush client-visible");

const spawnedTargetedExplosive = funcBrushContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_explosive" && entity.targetname === "targeted_explosive");
assert.ok(spawnedTargetedExplosive, "SpawnEntities must keep targeted func_explosive in the runtime");
assert.equal(spawnedTargetedExplosive.solid, SOLID_BSP, "targeted func_explosive must spawn solid");
assert.equal(spawnedTargetedExplosive.takedamage, damage_t.DAMAGE_NO, "targeted func_explosive must not be shootable");
assert.equal(spawnedTargetedExplosive.health, 0, "targeted func_explosive must not install default shootable health");
assert.equal(typeof spawnedTargetedExplosive.use, "function", "targeted func_explosive must expose trigger use");
assert.equal(funcBrushContext.runtime.assets.modelPaths[spawnedTargetedExplosive.s.modelindex - 1], "*23", "targeted func_explosive modelindex must resolve to *23");

const timerKillboxContext = createGameMainContext(imports);
InitGame(timerKillboxContext);
SpawnEntities(
  timerKillboxContext,
  "timer_killbox",
  `{
"classname" "worldspawn"
}
{
"classname" "func_timer"
"spawnflags" "1"
"wait" "1"
"random" "0"
"pausetime" "0.8"
"target" "timer_map_target"
}
{
"classname" "func_killbox"
"model" "*24"
}
`,
  ""
);

const spawnedTimer = timerKillboxContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_timer");
assert.ok(spawnedTimer, "SpawnEntities must keep func_timer in the runtime");
assert.equal(spawnedTimer.wait, 1, "SP_func_timer default/parsed wait mismatch");
assert.equal(spawnedTimer.random, 0, "SP_func_timer random mismatch");
assert.equal((spawnedTimer.svflags & SVF_NOCLIENT) !== 0, true, "func_timer must be hidden from clients");
assert.equal(typeof spawnedTimer.use, "function", "func_timer must expose the use callback");
assert.equal(typeof spawnedTimer.think, "function", "func_timer must expose the think callback");
assert.equal(spawnedTimer.activator, spawnedTimer, "START_ON func_timer activator mismatch");
assert.equal(spawnedTimer.nextthink, 2.8, "START_ON func_timer nextthink must include pausetime and wait");

const timerMapTarget = spawnGameEntity(timerKillboxContext.runtime);
timerMapTarget.classname = "timer_map_target";
timerMapTarget.targetname = "timer_map_target";
let timerMapTargetUseCount = 0;
timerMapTarget.use = (_self, other, activator) => {
  timerMapTargetUseCount += 1;
  assert.equal(other, spawnedTimer, "func_timer G_RunFrame target caller mismatch");
  assert.equal(activator, spawnedTimer, "func_timer G_RunFrame target activator mismatch");
};
timerKillboxContext.runtime.framenum = 27;
G_RunFrame(timerKillboxContext);
assert.equal(timerMapTargetUseCount, 1, "G_RunFrame must execute START_ON func_timer targets");
assert.equal(spawnedTimer.nextthink, timerKillboxContext.runtime.time + spawnedTimer.wait, "func_timer_think must reschedule from runtime time");

const spawnedKillbox = timerKillboxContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_killbox");
assert.ok(spawnedKillbox, "SpawnEntities must keep func_killbox in the runtime");
assert.equal((spawnedKillbox.svflags & SVF_NOCLIENT) !== 0, true, "func_killbox must be hidden from clients");
assert.equal(typeof spawnedKillbox.use, "function", "func_killbox must expose the use callback");
assert.equal(timerKillboxContext.runtime.assets.modelPaths[spawnedKillbox.s.modelindex - 1], "*24", "func_killbox modelindex must resolve to *24");
const killboxBlocker = spawnGameEntity(timerKillboxContext.runtime);
killboxBlocker.classname = "killbox blocker";
killboxBlocker.solid = SOLID_BSP;
killboxBlocker.health = 100;
let killboxTraceCalls = 0;
timerKillboxContext.runtime.collision = {
  world: {} as never,
  trace: () => ({
    allsolid: false,
    startsolid: false,
    fraction: 0,
    endpos: [...spawnedKillbox.s.origin],
    plane: {
      normal: [0, 0, 0],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0]
    },
    surface: null,
    contents: 0,
    ent: killboxTraceCalls++ === 0 ? killboxBlocker : null
  }),
  pointcontents: () => 0
};
spawnedKillbox.use?.(spawnedKillbox, null, null, timerKillboxContext.runtime);
assert.equal(killboxBlocker.solid, 0, "func_killbox use must delegate to KillBox telefrag damage");

const clockContext = createGameMainContext(imports);
InitGame(clockContext);
SpawnEntities(
  clockContext,
  "clock_map",
  `{
"classname" "worldspawn"
}
{
"classname" "target_string"
"targetname" "clock_display"
"team" "clock_digits"
}
{
"classname" "target_character"
"team" "clock_digits"
"model" "*30"
"count" "1"
}
{
"classname" "target_character"
"team" "clock_digits"
"model" "*31"
"count" "3"
}
{
"classname" "target_character"
"team" "clock_digits"
"model" "*32"
"count" "4"
}
{
"classname" "func_clock"
"target" "clock_display"
"spawnflags" "5"
"style" "1"
"count" "2"
}
`,
  ""
);
const spawnedClock = clockContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "func_clock");
assert.ok(spawnedClock, "SpawnEntities must keep func_clock in the runtime");
assert.equal(spawnedClock.message?.length, 16, "SP_func_clock must allocate the fixed CLOCK_MESSAGE_SIZE buffer");
assert.equal(spawnedClock.health, 0, "START_OFF TIMER_UP func_clock must reset health to zero");
assert.equal(spawnedClock.wait, 2, "START_OFF TIMER_UP func_clock must copy count into wait");
assert.equal(typeof spawnedClock.use, "function", "START_OFF func_clock must expose func_clock_use");
assert.equal(typeof spawnedClock.think, "function", "func_clock must expose func_clock_think");
spawnedClock.use?.(spawnedClock, null, spawnedClock, clockContext.runtime);
const clockDisplay = clockContext.runtime.entities.find((entity) => entity.inuse && entity.classname === "target_string");
assert.equal(clockDisplay?.message, " 0:00", "func_clock_use must immediately push the first formatted message");
const clockDigits = clockContext.runtime.entities.filter((entity) => entity.inuse && entity.classname === "target_character");
assert.equal(clockDigits.find((entity) => entity.count === 1)?.s.frame, 12, "target_character count 1 must display the leading blank from func_clock");
assert.equal(clockDigits.find((entity) => entity.count === 3)?.s.frame, 11, "target_character count 3 must display the func_clock colon");
assert.equal(clockDigits.find((entity) => entity.count === 4)?.s.frame, 0, "target_character count 4 must display the func_clock minute digit");
clockContext.runtime.framenum = 9;
G_RunFrame(clockContext);
assert.equal(clockDisplay?.message, " 0:01", "G_RunFrame must execute func_clock_think and update target_string");
assert.equal(clockDigits.find((entity) => entity.count === 4)?.s.frame, 0, "renderer-visible target_character frame must remain synchronized for minutes");
assert.equal(clockDigits.find((entity) => entity.count === 1)?.s.modelindex > 0, true, "target_character digits must publish inline brush modelindexes");

const commandContext = createGameMainContext(imports);
InitGame(commandContext);
commandContext.cvars.skill!.value = 3;
commandContext.cvars.skill!.string = "3";
SpawnEntities(
  commandContext,
  "command",
  `{
"classname" "worldspawn"
}
{
"classname" "trigger_once"
"model" "*27"
"targetname" "command_hack_survives"
"spawnflags" "${SPAWNFLAG_NOT_HARD}"
}
`,
  ""
);
const commandHackEntity = commandContext.runtime.entities.find(
  (entity) => entity.inuse && entity.targetname === "command_hack_survives"
);
assert.ok(commandHackEntity, "command trigger_once *27 hack must clear SPAWNFLAG_NOT_HARD before skill filtering");
assert.equal(commandHackEntity.spawnflags & SPAWNFLAG_NOT_HARD, 0, "command hack survivor must have spawnflags stripped");

console.log("quake2-g-spawn: ok");

function createCvar(name: string, value: string) {
  return {
    name,
    string: value,
    latched_string: null,
    flags: 0,
    modified: false,
    value: Number.parseFloat(value) || 0
  };
}

function formatPrintf(fmt: string, args: unknown[]): string {
  let cursor = 0;
  return fmt.replace(/%[siuf]/g, () => String(args[cursor++]));
}

function verifySpawnTableParity(): void {
  const source = readFileSync("Quake-2-master/game/g_spawn.c", "utf8");
  const tableMatch = /spawn_t\s+spawns\[\]\s*=\s*\{(?<body>[\s\S]*?)\{NULL, NULL\}/.exec(source);
  assert.ok(tableMatch?.groups?.body, "source g_spawn.c spawns[] table must be parseable");

  const expected = Array.from(
    tableMatch.groups.body.matchAll(/\{"([^"]+)",\s*([A-Za-z0-9_]+)\}/g),
    (match) => `${match[1]}=>${match[2]}`
  ).sort();
  const actual = spawns.map((entry) => `${entry.name}=>${entry.spawn.name}`);

  assert.deepEqual(actual.toSorted(), expected, "TS spawns[] must mirror game/g_spawn.c classnames and callback ownership");
  assert.equal(new Set(spawns.map((entry) => entry.name)).size, spawns.length, "spawns[] must not contain duplicate classnames");
}
