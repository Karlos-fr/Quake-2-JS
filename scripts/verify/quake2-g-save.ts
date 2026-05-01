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
import { target_crosslevel_target_think, use_target_secret } from "../../packages/game/src/g_target.js";
import {
  ReadGame,
  ReadLevel,
  WriteGame,
  WriteLevel,
  createGameMainContext
} from "../../packages/game/src/g_main.js";
import { clientfields, fields, levelfields, registerGameSaveMove } from "../../packages/game/src/g_save.js";

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

const testMonsterMove: GameMonsterMove = {
  firstframe: 1,
  lastframe: 1,
  frame: [{ aifunc: undefined, dist: 0, thinkfunc: undefined }],
  endfunc: undefined
};
registerGameSaveMove("test_move_save_restore", testMonsterMove);

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
player.inuse = true;
player.health = 75;
player.max_health = 110;
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

const target = createRuntimeEntity({ classname: "target_crosslevel_target" }, 2);
target.inuse = true;
target.delay = 2.5;
target.owner = player;
target.think = target_crosslevel_target_think;
target.use = use_target_secret;
target.monsterinfo.currentmove = testMonsterMove;
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
writeContext.level.sound_entity = target;
WriteLevel(writeContext, "save/level.sav");
const levelJson = files.get("save/level.sav") ?? "";
assert.ok(levelJson.includes("\"level_name\": \"Saved Unit\""), "WriteLevel must persist level_name");
assert.ok(levelJson.includes("\"mapname\": \"unit1\""), "WriteLevel must persist mapname");
assert.ok(levelJson.includes("\"nextmap\": \"unit2\""), "WriteLevel must persist nextmap");
assert.ok(levelJson.includes("\"intermissiontime\": 8.5"), "WriteLevel must persist intermissiontime");
assert.ok(levelJson.includes("\"changemap\": \"unit3\""), "WriteLevel must persist changemap");
assert.ok(levelJson.includes("\"exitintermission\": 1"), "WriteLevel must persist exitintermission");

readContext.game.clients = [readContext.game.clients[0] ?? client];
readContext.runtime.maxclients = 1;
readContext.runtime.maxentities = 64;
const preservedRuntime = readContext.runtime;
readContext.runtime.entities[2] = createRuntimeEntity({ classname: "stale_entity" }, 2);
ReadLevel(readContext, "save/level.sav");
assert.equal(readContext.runtime, preservedRuntime, "ReadLevel must preserve the existing runtime object");
assert.equal(readContext.runtime.entities[2]?.owner, readContext.runtime.entities[1], "ReadLevel edict reference restore mismatch");
assert.equal(readContext.runtime.entities[2]?.think, target_crosslevel_target_think, "ReadLevel think callback restore mismatch");
assert.equal(readContext.runtime.entities[2]?.use, use_target_secret, "ReadLevel use callback restore mismatch");
assert.equal(readContext.runtime.entities[2]?.monsterinfo.currentmove, testMonsterMove, "ReadLevel currentmove restore mismatch");
assert.equal(readContext.level.sound_entity, readContext.runtime.entities[2], "ReadLevel level edict reference mismatch");
assert.equal(readContext.runtime.sound_entity, readContext.runtime.entities[2], "ReadLevel runtime level mirror mismatch");
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
