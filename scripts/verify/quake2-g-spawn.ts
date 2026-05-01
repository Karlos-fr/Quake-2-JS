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

import {
  CS_CDTRACK,
  CS_ITEMS,
  CS_MAXCLIENTS,
  CS_NAME,
  RF_GLOW,
  CS_SKY,
  CS_SKYAXIS,
  CS_SKYROTATE
} from "../../packages/qcommon/src/index.js";
import { FL_TEAMSLAVE, MOVETYPE_PUSH, SOLID_BSP } from "../../packages/game/src/runtime.js";
import {
  SPAWNFLAG_NOT_DEATHMATCH,
  SPAWNFLAG_NOT_EASY,
  SPAWNFLAG_NOT_HARD,
  SPAWNFLAG_NOT_MEDIUM
} from "../../packages/game/src/g_local.js";
import { ED_CallSpawn, G_FindTeams, spawns } from "../../packages/game/src/g_spawn.js";
import { InitGame, SpawnEntities, createGameMainContext } from "../../packages/game/src/g_main.js";
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

SpawnEntities(
  context,
  "base1",
  `{
"classname" "worldspawn"
"message" "Unit Test Level"
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
`,
  "start"
);

const worldspawn = context.runtime.entities[0]!;
assert.equal(worldspawn.movetype, MOVETYPE_PUSH, "worldspawn movetype mismatch");
assert.equal(worldspawn.solid, SOLID_BSP, "worldspawn solid mismatch");
assert.equal(worldspawn.s.modelindex, 1, "worldspawn modelindex mismatch");
assert.equal(context.runtime.mapname, "base1", "runtime.mapname must follow SpawnEntities");
assert.equal(context.level.mapname, "base1", "level.mapname must follow SpawnEntities");
assert.equal(context.level.level_name, "Unit Test Level", "worldspawn message must set level name");
assert.equal(context.level.nextmap, "unit_next", "worldspawn nextmap mismatch");
assert.equal(context.runtime.gravity, 600, "worldspawn gravity must update runtime gravity");
assert.equal(cvarValues.get("sv_gravity"), "600", "worldspawn gravity must call cvar_set");
assert.equal(configstrings.get(CS_NAME), "Unit Test Level", "CS_NAME mismatch");
assert.equal(configstrings.get(CS_SKY), "space1", "CS_SKY mismatch");
assert.equal(configstrings.get(CS_SKYROTATE), "5", "CS_SKYROTATE mismatch");
assert.equal(configstrings.get(CS_SKYAXIS), "0 0 1", "CS_SKYAXIS mismatch");
assert.equal(configstrings.get(CS_CDTRACK), "7", "CS_CDTRACK mismatch");
assert.equal(configstrings.get(CS_MAXCLIENTS), "4", "CS_MAXCLIENTS mismatch");
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

const firstDoor = context.runtime.entities[5]!;
const secondDoor = context.runtime.entities[6]!;
assert.equal(firstDoor.teamchain, secondDoor, "team master should chain to second door");
assert.equal(secondDoor.teammaster, firstDoor, "team slave should reference team master");
assert.equal((secondDoor.flags & FL_TEAMSLAVE) !== 0, true, "team slave flag mismatch");

const warnedUnknown = context.runtime.logEntries.some(
  (entry) => entry.kind === "warning" && entry.message.includes("mystery_thing doesn't have a spawn function")
);
assert.equal(warnedUnknown, true, "ED_CallSpawn must warn on unknown classnames");

const nullClassEntity = spawnGameEntity(context.runtime);
nullClassEntity.classname = "";
ED_CallSpawn(nullClassEntity, context.runtime);
const warnedNull = context.runtime.logEntries.some(
  (entry) => entry.kind === "warning" && entry.message.includes("ED_CallSpawn: NULL classname")
);
assert.equal(warnedNull, true, "ED_CallSpawn must warn on null classname");

const wallEntity = spawnGameEntity(context.runtime);
wallEntity.classname = "func_wall";
ED_CallSpawn(wallEntity, context.runtime);
assert.equal(wallEntity.solid, SOLID_BSP, "ED_CallSpawn must dispatch func_wall");

const objectEntity = spawnGameEntity(context.runtime);
objectEntity.classname = "func_object";
ED_CallSpawn(objectEntity, context.runtime);
assert.equal(objectEntity.solid, SOLID_BSP, "ED_CallSpawn must dispatch func_object");

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
