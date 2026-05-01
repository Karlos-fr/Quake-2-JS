/**
 * File: quake2-g-save.ts
 * Purpose: Verify the first `game/g_save.c` TypeScript attachment point.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for structured game/level save and restore.
 *
 * Dependencies:
 * - packages/game/src/g_save.ts
 */

import { strict as assert } from "node:assert";

import type { cvar_t } from "../../packages/qcommon/src/index.js";
import { attachGameClient, createRuntimeEntity, type GameMonsterMove } from "../../packages/game/src/runtime.js";
import { FindItem } from "../../packages/game/src/g_items.js";
import { target_crosslevel_target_think, use_target_secret } from "../../packages/game/src/g_target.js";
import {
  ReadGame,
  ReadLevel,
  WriteGame,
  WriteLevel,
  createGameMainContext
} from "../../packages/game/src/g_main.js";
import {
  clientfields,
  fields,
  findGameSaveFunction,
  findGameSaveMove,
  levelfields,
  mmove_reloc,
  registerGameSaveFunction,
  registerGameSaveMove
} from "../../packages/game/src/g_save.js";
import { CLOFS, FFL_NOSPAWN, FFL_SPAWNTEMP, ITEM_INDEX, LLOFS, STOFS, fieldtype_t } from "../../packages/game/src/g_local.js";

const files = new Map<string, string>();
const linked: number[] = [];
const cvars = new Map<string, cvar_t>();

const imports = {
  bprintf: () => {},
  dprintf: () => {},
  cprintf: () => {},
  centerprintf: () => {},
  sound: () => {},
  positioned_sound: () => {},
  configstring: () => {},
  error: (fmt: string, ...args: unknown[]) => {
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
  linkentity: (ent) => {
    linked.push(ent.index);
  },
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
  cvar: (name: string, value: string) => {
    let variable = cvars.get(name);
    if (!variable) {
      variable = createCvar(name, value);
      cvars.set(name, variable);
    }
    return variable;
  },
  cvar_set: () => null,
  cvar_forceset: () => null,
  argc: () => 0,
  argv: () => "",
  args: () => "",
  AddCommandString: () => {},
  DebugGraph: () => {}
};

assert.equal(fields[0]?.name, "classname", "fields must preserve the original first edict field");
assert.ok(fields.some((field) => field.name === "goalentity"), "fields must include edict reference metadata");
assert.equal(levelfields[0]?.name, "changemap", "levelfields must preserve changemap metadata");
assert.equal(clientfields[0]?.name, "pers.weapon", "clientfields must preserve weapon item metadata");
assert.deepEqual(mmove_reloc, {}, "mmove_reloc must remain the symbolic data-segment relocation anchor");

const saveHarnessCallback = () => "save-harness";
registerGameSaveFunction("saveHarnessCallback", saveHarnessCallback);
assert.equal(findGameSaveFunction("saveHarnessCallback"), saveHarnessCallback, "Function macro adapter must restore callbacks by name");
assert.equal(findGameSaveFunction(null), undefined, "Function macro adapter must preserve null callbacks");

const expectedFields = [
  ["classname", "classname", fieldtype_t.F_LSTRING, 0],
  ["model", "model", fieldtype_t.F_LSTRING, 0],
  ["spawnflags", "spawnflags", fieldtype_t.F_INT, 0],
  ["speed", "speed", fieldtype_t.F_FLOAT, 0],
  ["accel", "accel", fieldtype_t.F_FLOAT, 0],
  ["decel", "decel", fieldtype_t.F_FLOAT, 0],
  ["target", "target", fieldtype_t.F_LSTRING, 0],
  ["targetname", "targetname", fieldtype_t.F_LSTRING, 0],
  ["pathtarget", "pathtarget", fieldtype_t.F_LSTRING, 0],
  ["deathtarget", "deathtarget", fieldtype_t.F_LSTRING, 0],
  ["killtarget", "killtarget", fieldtype_t.F_LSTRING, 0],
  ["combattarget", "combattarget", fieldtype_t.F_LSTRING, 0],
  ["message", "message", fieldtype_t.F_LSTRING, 0],
  ["team", "team", fieldtype_t.F_LSTRING, 0],
  ["wait", "wait", fieldtype_t.F_FLOAT, 0],
  ["delay", "delay", fieldtype_t.F_FLOAT, 0],
  ["random", "random", fieldtype_t.F_FLOAT, 0],
  ["move_origin", "move_origin", fieldtype_t.F_VECTOR, 0],
  ["move_angles", "move_angles", fieldtype_t.F_VECTOR, 0],
  ["style", "style", fieldtype_t.F_INT, 0],
  ["count", "count", fieldtype_t.F_INT, 0],
  ["health", "health", fieldtype_t.F_INT, 0],
  ["sounds", "sounds", fieldtype_t.F_INT, 0],
  ["light", "", fieldtype_t.F_IGNORE, 0],
  ["dmg", "dmg", fieldtype_t.F_INT, 0],
  ["mass", "mass", fieldtype_t.F_INT, 0],
  ["volume", "volume", fieldtype_t.F_FLOAT, 0],
  ["attenuation", "attenuation", fieldtype_t.F_FLOAT, 0],
  ["map", "map", fieldtype_t.F_LSTRING, 0],
  ["origin", "s.origin", fieldtype_t.F_VECTOR, 0],
  ["angles", "s.angles", fieldtype_t.F_VECTOR, 0],
  ["angle", "s.angles", fieldtype_t.F_ANGLEHACK, 0],
  ["goalentity", "goalentity", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["movetarget", "movetarget", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["enemy", "enemy", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["oldenemy", "oldenemy", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["activator", "activator", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["groundentity", "groundentity", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["teamchain", "teamchain", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["teammaster", "teammaster", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["owner", "owner", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["mynoise", "mynoise", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["mynoise2", "mynoise2", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["target_ent", "target_ent", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["chain", "chain", fieldtype_t.F_EDICT, FFL_NOSPAWN],
  ["prethink", "prethink", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["think", "think", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["blocked", "blocked", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["touch", "touch", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["use", "use", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["pain", "pain", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["die", "die", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["stand", "monsterinfo.stand", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["idle", "monsterinfo.idle", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["search", "monsterinfo.search", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["walk", "monsterinfo.walk", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["run", "monsterinfo.run", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["dodge", "monsterinfo.dodge", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["attack", "monsterinfo.attack", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["melee", "monsterinfo.melee", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["sight", "monsterinfo.sight", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["checkattack", "monsterinfo.checkattack", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["currentmove", "monsterinfo.currentmove", fieldtype_t.F_MMOVE, FFL_NOSPAWN],
  ["endfunc", "moveinfo.endfunc", fieldtype_t.F_FUNCTION, FFL_NOSPAWN],
  ["lip", "lip", fieldtype_t.F_INT, FFL_SPAWNTEMP],
  ["distance", "distance", fieldtype_t.F_INT, FFL_SPAWNTEMP],
  ["height", "height", fieldtype_t.F_INT, FFL_SPAWNTEMP],
  ["noise", "noise", fieldtype_t.F_LSTRING, FFL_SPAWNTEMP],
  ["pausetime", "pausetime", fieldtype_t.F_FLOAT, FFL_SPAWNTEMP],
  ["item", "item", fieldtype_t.F_LSTRING, FFL_SPAWNTEMP],
  ["item", "item", fieldtype_t.F_ITEM, 0],
  ["gravity", "gravity", fieldtype_t.F_LSTRING, FFL_SPAWNTEMP],
  ["sky", "sky", fieldtype_t.F_LSTRING, FFL_SPAWNTEMP],
  ["skyrotate", "skyrotate", fieldtype_t.F_FLOAT, FFL_SPAWNTEMP],
  ["skyaxis", "skyaxis", fieldtype_t.F_VECTOR, FFL_SPAWNTEMP],
  ["minyaw", "minyaw", fieldtype_t.F_FLOAT, FFL_SPAWNTEMP],
  ["maxyaw", "maxyaw", fieldtype_t.F_FLOAT, FFL_SPAWNTEMP],
  ["minpitch", "minpitch", fieldtype_t.F_FLOAT, FFL_SPAWNTEMP],
  ["maxpitch", "maxpitch", fieldtype_t.F_FLOAT, FFL_SPAWNTEMP],
  ["nextmap", "nextmap", fieldtype_t.F_LSTRING, FFL_SPAWNTEMP]
];
assert.deepEqual(
  fields.map((field) => [field.name, field.ofs, field.type, field.flags]),
  expectedFields,
  "fields must preserve the original game/g_save.c edict field table order, selectors, types, and flags"
);
assert.deepEqual(
  fields
    .filter((field) => [
      "lip",
      "distance",
      "height",
      "noise",
      "pausetime",
      "item",
      "gravity",
      "minyaw",
      "maxyaw",
      "minpitch",
      "maxpitch"
    ].includes(field.name) && field.flags === FFL_SPAWNTEMP)
    .map((field) => [field.name, field.ofs, field.type]),
  [
    ["lip", STOFS("lip"), fieldtype_t.F_INT],
    ["distance", STOFS("distance"), fieldtype_t.F_INT],
    ["height", STOFS("height"), fieldtype_t.F_INT],
    ["noise", STOFS("noise"), fieldtype_t.F_LSTRING],
    ["pausetime", STOFS("pausetime"), fieldtype_t.F_FLOAT],
    ["item", STOFS("item"), fieldtype_t.F_LSTRING],
    ["gravity", STOFS("gravity"), fieldtype_t.F_LSTRING],
    ["minyaw", STOFS("minyaw"), fieldtype_t.F_FLOAT],
    ["maxyaw", STOFS("maxyaw"), fieldtype_t.F_FLOAT],
    ["minpitch", STOFS("minpitch"), fieldtype_t.F_FLOAT],
    ["maxpitch", STOFS("maxpitch"), fieldtype_t.F_FLOAT]
  ],
  "fields must preserve spawn_temp movement/audio timing metadata"
);

assert.deepEqual(
  levelfields.map((field) => [field.name, field.ofs, field.type, field.flags]),
  [
    ["changemap", LLOFS("changemap"), fieldtype_t.F_LSTRING, 0],
    ["sight_client", LLOFS("sight_client"), fieldtype_t.F_EDICT, 0],
    ["sight_entity", LLOFS("sight_entity"), fieldtype_t.F_EDICT, 0],
    ["sound_entity", LLOFS("sound_entity"), fieldtype_t.F_EDICT, 0],
    ["sound2_entity", LLOFS("sound2_entity"), fieldtype_t.F_EDICT, 0]
  ],
  "levelfields must preserve the original game/g_save.c level field table order, selectors, types, and flags"
);

assert.deepEqual(
  clientfields.map((field) => [field.name, field.ofs, field.type, field.flags]),
  [
    ["pers.weapon", "pers.weapon", fieldtype_t.F_ITEM, 0],
    ["pers.lastweapon", "pers.lastweapon", fieldtype_t.F_ITEM, 0],
    ["newweapon", CLOFS("newweapon"), fieldtype_t.F_ITEM, 0]
  ],
  "clientfields must preserve the original game/g_save.c client field table order, selectors, types, and flags"
);

const testMonsterMove: GameMonsterMove = {
  firstframe: 1,
  lastframe: 1,
  frame: [{ aifunc: undefined, dist: 0, thinkfunc: undefined }],
  endfunc: undefined
};
registerGameSaveMove("test_move_save_restore", testMonsterMove);
assert.equal(findGameSaveMove("test_move_save_restore"), testMonsterMove, "mmove relocation adapter must restore moves by name");
assert.equal(findGameSaveMove(null), undefined, "mmove relocation adapter must preserve null moves");

const writeContext = createGameMainContext(imports, {
  hooks: {
    readFile: (path) => files.get(path) ?? null,
    writeFile: (path, contents) => {
      files.set(path, contents);
      return true;
    }
  }
});
writeContext.runtime.maxclients = 1;
writeContext.runtime.maxentities = 64;
writeContext.game.maxclients = 1;
writeContext.game.maxentities = 64;
writeContext.game.spawnpoint = "unit_start";
writeContext.game.helpmessage1 = "help one";
writeContext.game.num_items = 41;
writeContext.runtime.serverflags = 3;

const player = createRuntimeEntity({ classname: "player" }, 1);
const client = attachGameClient(player);
const blaster = FindItem("Blaster");
const shotgun = FindItem("Shotgun");
assert.ok(blaster, "Save harness requires the Blaster item");
assert.ok(shotgun, "Save harness requires the Shotgun item");
player.inuse = true;
player.health = 75;
player.max_health = 110;
client.pers.weapon = blaster;
client.pers.lastweapon = shotgun;
client.newweapon = shotgun;
client.resp.score = 9;
writeContext.game.clients = [client];
writeContext.runtime.entities = [createRuntimeEntity({ classname: "worldspawn" }, 0), player];

WriteGame(writeContext, "save/game.sav", false);
const gameJson = files.get("save/game.sav") ?? "";
assert.ok(gameJson.includes("\"helpmessage1\": \"help one\""), "WriteGame must persist game locals");
assert.ok(gameJson.includes("\"spawnpoint\": \"unit_start\""), "WriteGame must persist game spawnpoint");
assert.ok(gameJson.includes("\"maxclients\": 1"), "WriteGame must persist game maxclients");
assert.ok(gameJson.includes("\"maxentities\": 64"), "WriteGame must persist game maxentities");
assert.ok(gameJson.includes("\"serverflags\": 3"), "WriteGame must persist runtime serverflags through game locals");
assert.ok(gameJson.includes("\"num_items\": 41"), "WriteGame must persist game num_items");
assert.ok(gameJson.includes("\"autosaved\": false"), "manual WriteGame must persist autosaved false");
assert.ok(gameJson.includes("\"health\": 75"), "WriteGame must call SaveClientData before manual saves");
const gameSave = JSON.parse(gameJson) as { clients: Array<{ pers: { weapon: number; lastweapon: number }; newweapon: number }> };
assert.equal(gameSave.clients[0]?.pers.weapon, ITEM_INDEX(blaster), "WriteGame must encode client pers.weapon as the C F_ITEM index");
assert.equal(gameSave.clients[0]?.pers.lastweapon, ITEM_INDEX(shotgun), "WriteGame must encode client pers.lastweapon as the C F_ITEM index");
assert.equal(gameSave.clients[0]?.newweapon, ITEM_INDEX(shotgun), "WriteGame must encode client newweapon as the C F_ITEM index");

WriteGame(writeContext, "save/game-auto.ssv", true);
const autosaveJson = files.get("save/game-auto.ssv") ?? "";
assert.ok(autosaveJson.includes("\"autosaved\": true"), "autosave WriteGame must snapshot autosaved true");
assert.equal(writeContext.game.autosaved, false, "WriteGame must clear game.autosaved after writing");
assert.equal(writeContext.runtime.autosaved, false, "WriteGame must clear runtime.autosaved after writing");

writeContext.runtime.helpmessage1 = "runtime help one";
writeContext.runtime.helpmessage2 = "runtime help two";
writeContext.runtime.helpchanged = 2;
WriteGame(writeContext, "save/game-runtime.sav", false);
const runtimeGameJson = files.get("save/game-runtime.sav") ?? "";
assert.ok(runtimeGameJson.includes("\"helpmessage1\": \"runtime help one\""), "WriteGame must persist newer runtime helpmessage1");
assert.ok(runtimeGameJson.includes("\"helpmessage2\": \"runtime help two\""), "WriteGame must persist newer runtime helpmessage2");
assert.ok(runtimeGameJson.includes("\"helpchanged\": 2"), "WriteGame must persist newer runtime helpchanged");

const readContext = createGameMainContext(imports, {
  hooks: {
    readFile: (path) => files.get(path) ?? null,
    writeFile: (path, contents) => {
      files.set(path, contents);
      return true;
    }
  }
});
ReadGame(readContext, "save/game.sav");
assert.equal(readContext.game.helpmessage1, "help one", "ReadGame helpmessage mismatch");
assert.equal(readContext.game.spawnpoint, "unit_start", "ReadGame game spawnpoint mismatch");
assert.equal(readContext.runtime.spawnpoint, "unit_start", "ReadGame runtime spawnpoint mismatch");
assert.equal(readContext.game.maxclients, 1, "ReadGame game maxclients mismatch");
assert.equal(readContext.runtime.maxclients, 1, "ReadGame runtime maxclients mismatch");
assert.equal(readContext.game.maxentities, 64, "ReadGame game maxentities mismatch");
assert.equal(readContext.runtime.maxentities, 64, "ReadGame runtime maxentities mismatch");
assert.equal(readContext.game.serverflags, 3, "ReadGame serverflags mismatch");
assert.equal(readContext.runtime.serverflags, 3, "ReadGame runtime serverflags mismatch");
assert.equal(readContext.game.num_items, 41, "ReadGame num_items mismatch");
assert.equal(readContext.game.autosaved, false, "ReadGame game autosaved mismatch");
assert.equal(readContext.runtime.autosaved, false, "ReadGame runtime autosaved mismatch");
assert.equal(readContext.game.clients[0]?.pers.health, 75, "ReadGame client pers health mismatch");

ReadGame(readContext, "save/game-auto.ssv");
assert.equal(readContext.game.autosaved, true, "ReadGame game autosaved true mismatch");
assert.equal(readContext.runtime.autosaved, true, "ReadGame runtime autosaved true mismatch");

const target = createRuntimeEntity({
  classname: "target_crosslevel_target",
  target: "after_save_target",
  targetname: "saved_targetname",
  message: "Saved string payload",
  team: "saved_team",
  map: "unit_exit"
}, 2);
target.inuse = true;
target.delay = 2.5;
target.owner = player;
target.enemy = player;
target.item = shotgun;
target.moveinfo.start_origin = [16, 24, 32];
target.moveinfo.start_angles = [0, 90, 0];
target.moveinfo.end_origin = [128, 24, 48];
target.moveinfo.end_angles = [0, 180, 0];
target.moveinfo.sound_start = 11;
target.moveinfo.sound_middle = 12;
target.moveinfo.sound_end = 13;
target.moveinfo.accel = 14.5;
target.moveinfo.speed = 80;
target.moveinfo.decel = 21.25;
target.moveinfo.distance = 256;
target.moveinfo.wait = 1.75;
target.moveinfo.state = 2;
target.moveinfo.dir = [0, 1, 0];
target.moveinfo.current_speed = 32;
target.moveinfo.move_speed = 64;
target.moveinfo.next_speed = 16;
target.moveinfo.remaining_distance = 48;
target.moveinfo.decel_distance = 24;
target.moveinfo.endfunc = saveHarnessCallback;
target.think = target_crosslevel_target_think;
target.use = use_target_secret;
target.monsterinfo.currentmove = testMonsterMove;
target.monsterinfo.aiflags = 0x104;
target.monsterinfo.nextframe = 12;
target.monsterinfo.scale = 1.5;
writeContext.runtime.entities.push(target);
const unsaved = createRuntimeEntity({ classname: "unsaved_temp_entity" }, 3);
unsaved.inuse = false;
writeContext.runtime.entities.push(unsaved);
writeContext.level.time = 12;
writeContext.level.framenum = 120;
writeContext.level.level_name = "Saved Unit";
writeContext.level.mapname = "unit1";
writeContext.level.nextmap = "unit2";
writeContext.level.intermissiontime = 8.5;
writeContext.level.changemap = "unit3";
writeContext.level.exitintermission = 1;
writeContext.level.intermission_origin = [320, -128, 48];
writeContext.level.intermission_angle = [20, 270, 0];
writeContext.level.sight_client = player;
writeContext.level.sight_entity = target;
writeContext.level.sight_entity_framenum = 121;
writeContext.level.sound_entity = target;
writeContext.level.sound_entity_framenum = 122;
writeContext.level.sound2_entity = player;
writeContext.level.sound2_entity_framenum = 123;
writeContext.level.pic_health = 77;
writeContext.level.total_secrets = 6;
writeContext.level.found_secrets = 2;
writeContext.level.total_goals = 5;
writeContext.level.found_goals = 3;
writeContext.level.total_monsters = 11;
writeContext.level.killed_monsters = 7;
writeContext.level.current_entity = target;
writeContext.level.body_que = 2;
writeContext.level.power_cubes = 4;
WriteLevel(writeContext, "save/level.sav");
const levelJson = files.get("save/level.sav") ?? "";
assert.ok(levelJson.includes("\"level_name\": \"Saved Unit\""), "WriteLevel must persist level_name");
assert.ok(levelJson.includes("\"mapname\": \"unit1\""), "WriteLevel must persist mapname");
assert.ok(levelJson.includes("\"nextmap\": \"unit2\""), "WriteLevel must persist nextmap");
assert.ok(levelJson.includes("\"intermissiontime\": 8.5"), "WriteLevel must persist intermissiontime");
assert.ok(levelJson.includes("\"changemap\": \"unit3\""), "WriteLevel must persist changemap");
assert.ok(levelJson.includes("\"exitintermission\": 1"), "WriteLevel must persist exitintermission");
assert.ok(levelJson.includes("\"intermission_origin\": ["), "WriteLevel must persist intermission_origin");
assert.ok(levelJson.includes("\"intermission_angle\": ["), "WriteLevel must persist intermission_angle");
assert.ok(levelJson.includes("\"sight_client\": 1"), "WriteLevel must persist sight_client edict reference");
assert.ok(levelJson.includes("\"sight_entity\": 2"), "WriteLevel must persist sight_entity edict reference");
assert.ok(levelJson.includes("\"sight_entity_framenum\": 121"), "WriteLevel must persist sight_entity_framenum");
assert.ok(levelJson.includes("\"sound_entity\": 2"), "WriteLevel must persist sound_entity edict reference");
assert.ok(levelJson.includes("\"sound_entity_framenum\": 122"), "WriteLevel must persist sound_entity_framenum");
assert.ok(levelJson.includes("\"sound2_entity\": 1"), "WriteLevel must persist sound2_entity edict reference");
assert.ok(levelJson.includes("\"sound2_entity_framenum\": 123"), "WriteLevel must persist sound2_entity_framenum");
assert.ok(levelJson.includes("\"pic_health\": 77"), "WriteLevel must persist pic_health");
assert.ok(levelJson.includes("\"total_secrets\": 6"), "WriteLevel must persist total_secrets");
assert.ok(levelJson.includes("\"found_secrets\": 2"), "WriteLevel must persist found_secrets");
assert.ok(levelJson.includes("\"total_goals\": 5"), "WriteLevel must persist total_goals");
assert.ok(levelJson.includes("\"found_goals\": 3"), "WriteLevel must persist found_goals");
assert.ok(levelJson.includes("\"total_monsters\": 11"), "WriteLevel must persist total_monsters");
assert.ok(levelJson.includes("\"killed_monsters\": 7"), "WriteLevel must persist killed_monsters");
assert.ok(levelJson.includes("\"current_entity\": 2"), "WriteLevel must persist current_entity edict reference");
assert.ok(levelJson.includes("\"body_que\": 2"), "WriteLevel must persist body_que");
assert.ok(levelJson.includes("\"power_cubes\": 4"), "WriteLevel must persist power_cubes");
assert.ok(levelJson.includes("\"start_origin\": ["), "WriteLevel must persist moveinfo start_origin");
assert.ok(levelJson.includes("\"start_angles\": ["), "WriteLevel must persist moveinfo start_angles");
assert.ok(levelJson.includes("\"end_origin\": ["), "WriteLevel must persist moveinfo end_origin");
assert.ok(levelJson.includes("\"end_angles\": ["), "WriteLevel must persist moveinfo end_angles");
assert.ok(levelJson.includes("\"sound_start\": 11"), "WriteLevel must persist moveinfo sound_start");
assert.ok(levelJson.includes("\"sound_middle\": 12"), "WriteLevel must persist moveinfo sound_middle");
assert.ok(levelJson.includes("\"sound_end\": 13"), "WriteLevel must persist moveinfo sound_end");
assert.ok(levelJson.includes("\"accel\": 14.5"), "WriteLevel must persist moveinfo accel");
assert.ok(levelJson.includes("\"speed\": 80"), "WriteLevel must persist moveinfo speed");
assert.ok(levelJson.includes("\"decel\": 21.25"), "WriteLevel must persist moveinfo decel");
assert.ok(levelJson.includes("\"distance\": 256"), "WriteLevel must persist moveinfo distance");
assert.ok(levelJson.includes("\"wait\": 1.75"), "WriteLevel must persist moveinfo wait");
assert.ok(levelJson.includes("\"state\": 2"), "WriteLevel must persist moveinfo state");
assert.ok(levelJson.includes("\"dir\": ["), "WriteLevel must persist moveinfo dir");
assert.ok(levelJson.includes("\"current_speed\": 32"), "WriteLevel must persist moveinfo current_speed");
assert.ok(levelJson.includes("\"move_speed\": 64"), "WriteLevel must persist moveinfo move_speed");
assert.ok(levelJson.includes("\"next_speed\": 16"), "WriteLevel must persist moveinfo next_speed");
assert.ok(levelJson.includes("\"remaining_distance\": 48"), "WriteLevel must persist moveinfo remaining_distance");
assert.ok(levelJson.includes("\"decel_distance\": 24"), "WriteLevel must persist moveinfo decel_distance");
assert.ok(levelJson.includes("\"endfunc\": \"saveHarnessCallback\""), "WriteLevel must persist moveinfo endfunc callback");
const levelSave = JSON.parse(levelJson) as {
  level: { changemap: string; sight_client: number; sight_entity: number; sound_entity: number; sound2_entity: number; current_entity: number };
  entities: Array<{
    entnum: number;
    entity: {
      classname: string;
      target: string;
      targetname: string;
      message: string;
      team: string;
      map: string;
      owner: number;
      enemy: number;
      item: number;
      callbacks: {
        think: string | null;
        use: string | null;
        monsterinfo: { currentmove: string | null };
        moveinfo: { endfunc: string | null };
      };
      monsterinfo: {
        aiflags: number;
        nextframe: number;
        scale: number;
      };
    };
  }>;
};
const targetSave = levelSave.entities.find((record) => record.entnum === target.index)?.entity;
assert.ok(targetSave, "WriteLevel must write the in-use target entity");
assert.equal(typeof targetSave.classname, "string", "WriteField2 len adapter must persist classname as a string payload, not a numeric length");
assert.equal(typeof targetSave.message, "string", "WriteField2 len adapter must persist message as a string payload, not a numeric length");
assert.equal(targetSave.classname, "target_crosslevel_target", "WriteLevel must persist entity classname F_LSTRING payload");
assert.equal(targetSave.target, "after_save_target", "WriteLevel must persist entity target F_LSTRING payload");
assert.equal(targetSave.targetname, "saved_targetname", "WriteLevel must persist entity targetname F_LSTRING payload");
assert.equal(targetSave.message, "Saved string payload", "WriteLevel must persist entity message F_LSTRING payload");
assert.equal(targetSave.team, "saved_team", "WriteLevel must persist entity team F_LSTRING payload");
assert.equal(targetSave.map, "unit_exit", "WriteLevel must persist entity map F_LSTRING payload");
assert.equal(levelSave.level.changemap, writeContext.level.changemap, "WriteField2 p adapter must read the level F_LSTRING from the original level field");
assert.equal(targetSave.target, target.target, "WriteField2 p adapter must read the entity F_LSTRING from the original entity field");
assert.equal(target.message, "Saved string payload", "WriteField2 structured adapter must not mutate the original entity string into a length");
assert.equal(levelSave.level.sight_client, player.index, "WriteLevel must encode level sight_client as the C F_EDICT index");
assert.equal(levelSave.level.sight_entity, target.index, "WriteLevel must encode level sight_entity as the C F_EDICT index");
assert.equal(levelSave.level.sound_entity, target.index, "WriteLevel must encode level sound_entity as the C F_EDICT index");
assert.equal(levelSave.level.sound2_entity, player.index, "WriteLevel must encode level sound2_entity as the C F_EDICT index");
assert.equal(levelSave.level.current_entity, target.index, "WriteLevel must encode level current_entity as the C F_EDICT index");
assert.equal(targetSave.owner, player.index, "WriteLevel must encode entity owner as the C F_EDICT index");
assert.equal(targetSave.enemy, player.index, "WriteLevel must encode entity enemy as the C F_EDICT index");
assert.equal(targetSave.item, ITEM_INDEX(shotgun), "WriteLevel must encode entity item as the C F_ITEM index");
assert.equal(targetSave.callbacks.think, "target_crosslevel_target_think", "WriteLevel must encode entity think by stable function name");
assert.equal(targetSave.callbacks.use, "use_target_secret", "WriteLevel must encode entity use by stable function name");
assert.equal(targetSave.callbacks.monsterinfo.currentmove, "test_move_save_restore", "WriteLevel must encode monster currentmove by stable mmove name");
assert.equal(targetSave.monsterinfo.aiflags, 0x104, "WriteLevel must persist monsterinfo aiflags");
assert.equal(targetSave.monsterinfo.nextframe, 12, "WriteLevel must persist monsterinfo nextframe");
assert.equal(targetSave.monsterinfo.scale, 1.5, "WriteLevel must persist monsterinfo scale");
assert.equal(targetSave.callbacks.moveinfo.endfunc, "saveHarnessCallback", "WriteLevel must encode moveinfo endfunc by stable function name");

readContext.game.clients = [readContext.game.clients[0] ?? client];
readContext.runtime.maxclients = 1;
readContext.runtime.maxentities = 64;
const preservedRuntime = readContext.runtime;
readContext.runtime.entities[2] = createRuntimeEntity({ classname: "stale_entity" }, 2);
ReadLevel(readContext, "save/level.sav");
assert.equal(readContext.runtime, preservedRuntime, "ReadLevel must preserve the existing runtime object");
assert.equal(readContext.runtime.entities[2]?.owner, readContext.runtime.entities[1], "ReadLevel edict reference restore mismatch");
assert.equal(readContext.runtime.entities[2]?.enemy, readContext.runtime.entities[1], "ReadLevel enemy edict reference restore mismatch");
assert.equal(readContext.runtime.entities[2]?.item, shotgun, "ReadLevel item index restore mismatch");
assert.equal(readContext.runtime.entities[2]?.think, target_crosslevel_target_think, "ReadLevel think callback restore mismatch");
assert.equal(readContext.runtime.entities[2]?.use, use_target_secret, "ReadLevel use callback restore mismatch");
assert.equal(readContext.runtime.entities[2]?.monsterinfo.currentmove, testMonsterMove, "ReadLevel currentmove restore mismatch");
assert.equal(readContext.runtime.entities[2]?.monsterinfo.aiflags, 0x104, "ReadLevel monsterinfo aiflags restore mismatch");
assert.equal(readContext.runtime.entities[2]?.monsterinfo.nextframe, 12, "ReadLevel monsterinfo nextframe restore mismatch");
assert.equal(readContext.runtime.entities[2]?.monsterinfo.scale, 1.5, "ReadLevel monsterinfo scale restore mismatch");
assert.deepEqual(readContext.runtime.entities[2]?.moveinfo.start_origin, [16, 24, 32], "ReadLevel moveinfo start_origin mismatch");
assert.deepEqual(readContext.runtime.entities[2]?.moveinfo.start_angles, [0, 90, 0], "ReadLevel moveinfo start_angles mismatch");
assert.deepEqual(readContext.runtime.entities[2]?.moveinfo.end_origin, [128, 24, 48], "ReadLevel moveinfo end_origin mismatch");
assert.deepEqual(readContext.runtime.entities[2]?.moveinfo.end_angles, [0, 180, 0], "ReadLevel moveinfo end_angles mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.sound_start, 11, "ReadLevel moveinfo sound_start mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.sound_middle, 12, "ReadLevel moveinfo sound_middle mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.sound_end, 13, "ReadLevel moveinfo sound_end mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.accel, 14.5, "ReadLevel moveinfo accel mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.speed, 80, "ReadLevel moveinfo speed mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.decel, 21.25, "ReadLevel moveinfo decel mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.distance, 256, "ReadLevel moveinfo distance mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.wait, 1.75, "ReadLevel moveinfo wait mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.state, 2, "ReadLevel moveinfo state mismatch");
assert.deepEqual(readContext.runtime.entities[2]?.moveinfo.dir, [0, 1, 0], "ReadLevel moveinfo dir mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.current_speed, 32, "ReadLevel moveinfo current_speed mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.move_speed, 64, "ReadLevel moveinfo move_speed mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.next_speed, 16, "ReadLevel moveinfo next_speed mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.remaining_distance, 48, "ReadLevel moveinfo remaining_distance mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.decel_distance, 24, "ReadLevel moveinfo decel_distance mismatch");
assert.equal(readContext.runtime.entities[2]?.moveinfo.endfunc, saveHarnessCallback, "ReadLevel moveinfo endfunc restore mismatch");
assert.equal(readContext.level.sound_entity, readContext.runtime.entities[2], "ReadLevel level edict reference mismatch");
assert.equal(readContext.runtime.sound_entity, readContext.runtime.entities[2], "ReadLevel runtime level mirror mismatch");
assert.equal(readContext.level.sound_entity_framenum, 122, "ReadLevel sound_entity_framenum mismatch");
assert.equal(readContext.runtime.sound_entity_framenum, 122, "ReadLevel runtime sound_entity_framenum mismatch");
assert.equal(readContext.level.sound2_entity, readContext.runtime.entities[1], "ReadLevel sound2_entity mismatch");
assert.equal(readContext.runtime.sound2_entity, readContext.runtime.entities[1], "ReadLevel runtime sound2_entity mismatch");
assert.equal(readContext.level.sound2_entity_framenum, 123, "ReadLevel sound2_entity_framenum mismatch");
assert.equal(readContext.runtime.sound2_entity_framenum, 123, "ReadLevel runtime sound2_entity_framenum mismatch");
assert.equal(readContext.runtime.time, 12, "ReadLevel must restore runtime time from level locals");
assert.equal(readContext.level.level_name, "Saved Unit", "ReadLevel level_name mismatch");
assert.equal(readContext.level.mapname, "unit1", "ReadLevel mapname mismatch");
assert.equal(readContext.level.nextmap, "unit2", "ReadLevel nextmap mismatch");
assert.equal(readContext.level.intermissiontime, 8.5, "ReadLevel intermissiontime mismatch");
assert.equal(readContext.runtime.intermissiontime, 8.5, "ReadLevel runtime intermissiontime mismatch");
assert.equal(readContext.level.changemap, "unit3", "ReadLevel changemap mismatch");
assert.equal(readContext.runtime.changemap, "unit3", "ReadLevel runtime changemap mismatch");
assert.equal(readContext.level.exitintermission, 1, "ReadLevel exitintermission mismatch");
assert.equal(readContext.runtime.exitintermission, 1, "ReadLevel runtime exitintermission mismatch");
assert.deepEqual(readContext.level.intermission_origin, [320, -128, 48], "ReadLevel intermission_origin mismatch");
assert.deepEqual(readContext.runtime.intermission_origin, [320, -128, 48], "ReadLevel runtime intermission_origin mismatch");
assert.deepEqual(readContext.level.intermission_angle, [20, 270, 0], "ReadLevel intermission_angle mismatch");
assert.deepEqual(readContext.runtime.intermission_angle, [20, 270, 0], "ReadLevel runtime intermission_angle mismatch");
assert.equal(readContext.level.sight_client, readContext.runtime.entities[1], "ReadLevel sight_client mismatch");
assert.equal(readContext.runtime.sight_client, readContext.runtime.entities[1], "ReadLevel runtime sight_client mismatch");
assert.equal(readContext.level.sight_entity, readContext.runtime.entities[2], "ReadLevel sight_entity mismatch");
assert.equal(readContext.runtime.sight_entity, readContext.runtime.entities[2], "ReadLevel runtime sight_entity mismatch");
assert.equal(readContext.level.sight_entity_framenum, 121, "ReadLevel sight_entity_framenum mismatch");
assert.equal(readContext.runtime.sight_entity_framenum, 121, "ReadLevel runtime sight_entity_framenum mismatch");
assert.equal(readContext.level.pic_health, 77, "ReadLevel pic_health mismatch");
assert.equal(readContext.runtime.pic_health, 77, "ReadLevel runtime pic_health mismatch");
assert.equal(readContext.level.total_secrets, 6, "ReadLevel total_secrets mismatch");
assert.equal(readContext.runtime.total_secrets, 6, "ReadLevel runtime total_secrets mismatch");
assert.equal(readContext.level.found_secrets, 2, "ReadLevel found_secrets mismatch");
assert.equal(readContext.runtime.found_secrets, 2, "ReadLevel runtime found_secrets mismatch");
assert.equal(readContext.level.total_goals, 5, "ReadLevel total_goals mismatch");
assert.equal(readContext.runtime.total_goals, 5, "ReadLevel runtime total_goals mismatch");
assert.equal(readContext.level.found_goals, 3, "ReadLevel found_goals mismatch");
assert.equal(readContext.runtime.found_goals, 3, "ReadLevel runtime found_goals mismatch");
assert.equal(readContext.level.total_monsters, 11, "ReadLevel total_monsters mismatch");
assert.equal(readContext.runtime.total_monsters, 11, "ReadLevel runtime total_monsters mismatch");
assert.equal(readContext.level.killed_monsters, 7, "ReadLevel killed_monsters mismatch");
assert.equal(readContext.runtime.killed_monsters, 7, "ReadLevel runtime killed_monsters mismatch");
assert.equal(readContext.level.current_entity, readContext.runtime.entities[2], "ReadLevel current_entity mismatch");
assert.equal(readContext.runtime.current_entity, readContext.runtime.entities[2], "ReadLevel runtime current_entity mismatch");
assert.equal(readContext.level.body_que, 2, "ReadLevel body_que mismatch");
assert.equal(readContext.runtime.body_que, 2, "ReadLevel runtime body_que mismatch");
assert.equal(readContext.level.power_cubes, 4, "ReadLevel power_cubes mismatch");
assert.equal(readContext.runtime.power_cubes, 4, "ReadLevel runtime power_cubes mismatch");
assert.equal(readContext.runtime.entities[3]?.inuse, undefined, "ReadLevel must wipe entities not present in the save");
assert.equal(readContext.runtime.entities[2]?.nextthink, 14.5, "ReadLevel cross-level target nextthink mismatch");
assert.equal(readContext.runtime.entities[1]?.client?.pers.connected, false, "ReadLevel must mark client slots disconnected");
assert.ok(linked.includes(2), "ReadLevel must relink restored in-use entities");

console.log("quake2-g-save: ok");

function createCvar(name: string, stringValue: string): cvar_t {
  const numericValue = Number(stringValue);
  return {
    name,
    string: stringValue,
    latched_string: null,
    flags: 0,
    modified: false,
    value: Number.isFinite(numericValue) ? numericValue : 0
  };
}

function formatPrintf(fmt: string, args: unknown[]): string {
  let index = 0;
  return fmt.replace(/%s|%d|%i|%f/g, () => String(args[index++] ?? ""));
}
