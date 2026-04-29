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
  CS_SKY,
  CS_SKYAXIS,
  CS_SKYROTATE
} from "../../packages/qcommon/src/index.js";
import { FL_TEAMSLAVE, MOVETYPE_PUSH, SOLID_BSP } from "../../packages/game/src/runtime.js";
import { ED_CallSpawn, G_FindTeams } from "../../packages/game/src/g_spawn.js";
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
assert.equal(context.level.level_name, "Unit Test Level", "worldspawn message must set level name");
assert.equal(context.level.nextmap, "", "worldspawn nextmap default mismatch");
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
