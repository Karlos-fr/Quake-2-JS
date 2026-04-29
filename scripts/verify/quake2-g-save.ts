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
writeContext.game.helpmessage1 = "help one";
writeContext.game.serverflags = 3;

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
assert.ok(gameJson.includes("\"health\": 75"), "WriteGame must call SaveClientData before manual saves");

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
assert.equal(readContext.game.serverflags, 3, "ReadGame serverflags mismatch");
assert.equal(readContext.game.clients[0]?.pers.health, 75, "ReadGame client pers health mismatch");

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
writeContext.level.sound_entity = target;
WriteLevel(writeContext, "save/level.sav");

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
