/**
 * File: quake2-game-header.ts
 * Purpose: Verify that the TypeScript target for `game/game.h` preserves the key server-visible declarations.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - packages/game/src/game.ts
 * - packages/game/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import {
  GAME_API_VERSION,
  MAX_ENT_CLUSTERS,
  SVF_DEADMONSTER,
  SVF_MONSTER,
  SVF_NOCLIENT,
  solid_t
} from "../../packages/game/src/game.js";
import type {
  edict_s,
  edict_t,
  GameClientServerFields,
  GameEdictServerFields,
  game_export_t,
  game_import_t,
  gclient_s,
  gclient_t,
  link_s,
  link_t
} from "../../packages/game/src/game.js";
import { attachGameClient, createGameClient, createRuntimeEntity } from "../../packages/game/src/runtime.js";

const client = createGameClient();
const entity = createRuntimeEntity({}, 1);

assert.equal(GAME_API_VERSION, 3, "GAME_API_VERSION must stay aligned with game/game.h");
assert.equal(MAX_ENT_CLUSTERS, 16, "MAX_ENT_CLUSTERS must stay aligned with game/game.h");

assert.equal(solid_t.SOLID_NOT, 0, "solid_t.SOLID_NOT mismatch");
assert.equal(solid_t.SOLID_TRIGGER, 1, "solid_t.SOLID_TRIGGER mismatch");
assert.equal(solid_t.SOLID_BBOX, 2, "solid_t.SOLID_BBOX mismatch");
assert.equal(solid_t.SOLID_BSP, 3, "solid_t.SOLID_BSP mismatch");

assert.equal(SVF_NOCLIENT, 0x00000001, "SVF_NOCLIENT mismatch");
assert.equal(SVF_DEADMONSTER, 0x00000002, "SVF_DEADMONSTER mismatch");
assert.equal(SVF_MONSTER, 0x00000004, "SVF_MONSTER mismatch");

const gameImportKeys = [
  "bprintf",
  "dprintf",
  "cprintf",
  "centerprintf",
  "sound",
  "positioned_sound",
  "configstring",
  "error",
  "modelindex",
  "soundindex",
  "imageindex",
  "setmodel",
  "trace",
  "pointcontents",
  "inPVS",
  "inPHS",
  "SetAreaPortalState",
  "AreasConnected",
  "linkentity",
  "unlinkentity",
  "BoxEdicts",
  "Pmove",
  "multicast",
  "unicast",
  "WriteChar",
  "WriteByte",
  "WriteShort",
  "WriteLong",
  "WriteFloat",
  "WriteString",
  "WritePosition",
  "WriteDir",
  "WriteAngle",
  "TagMalloc",
  "TagFree",
  "FreeTags",
  "cvar",
  "cvar_set",
  "cvar_forceset",
  "argc",
  "argv",
  "args",
  "AddCommandString",
  "DebugGraph"
] satisfies Array<keyof game_import_t>;

assert.equal(gameImportKeys.length, 44, "game_import_t must expose every callback declared in game/game.h");

const gameExportKeys = [
  "apiversion",
  "Init",
  "Shutdown",
  "SpawnEntities",
  "WriteGame",
  "ReadGame",
  "WriteLevel",
  "ReadLevel",
  "ClientConnect",
  "ClientBegin",
  "ClientUserinfoChanged",
  "ClientDisconnect",
  "ClientCommand",
  "ClientThink",
  "RunFrame",
  "ServerCommand",
  "edicts",
  "edict_size",
  "num_edicts",
  "max_edicts"
] satisfies Array<keyof game_export_t>;

assert.equal(gameExportKeys.length, 20, "game_export_t must expose every field declared in game/game.h");

const sourceNamedClient: gclient_s = client;
const typedefClient: gclient_t = sourceNamedClient;
const serverFields: GameClientServerFields = typedefClient;
assert.equal(serverFields.ps, client.ps, "gclient_s.ps must be the first server-visible player_state_t field");
assert.equal(client.ping, 0, "gclient_t server-visible ping field must be present");
serverFields.ping = 42;
assert.equal(client.ping, 42, "gclient_s/gclient_t ping aliases must reference the same runtime field");

const sourceNamedEntity: edict_s = entity;
const typedefEntity: edict_t = sourceNamedEntity;
const edictServerFields: GameEdictServerFields = typedefEntity;
assert.equal(edictServerFields.s.number, 1, "edict_s.s must be the leading server-visible entity_state_t field");
assert.deepEqual(edictServerFields.s.origin, [0, 0, 0], "edict_s.s must preserve entity_state_t origin storage");
assert.equal(edictServerFields.client, null, "edict_s.client must start as a nullable gclient_s pointer");
const attachedClient = attachGameClient(entity);
assert.equal(edictServerFields.client, attachedClient, "edict_s.client must reference the attached runtime gclient_s");
assert.equal(edictServerFields.inuse, true, "edict_s.inuse must default to active for allocated runtime entities");
edictServerFields.inuse = false;
assert.equal(entity.inuse, false, "edict_s.inuse must alias the runtime entity inuse field");
edictServerFields.inuse = true;

assert.equal(edictServerFields.linkcount, 0, "edict_s.linkcount must start at zero like C zeroed storage");
edictServerFields.linkcount = 7;
assert.equal(entity.linkcount, 7, "edict_s.linkcount must alias runtime relink bookkeeping");
edictServerFields.linkcount = 0;
assert.equal(edictServerFields.area, entity.area, "edict_s.area must expose the embedded link_t node");
const originalArea = entity.area;
const replacementArea: link_t = { prev: null, next: originalArea };
edictServerFields.area = replacementArea;
assert.equal(entity.area, replacementArea, "edict_s.area must be mutable link_t storage");
edictServerFields.area = originalArea;
assert.equal(entity.num_clusters, 0, "edict_t num_clusters must be initialized");
edictServerFields.num_clusters = 2;
assert.equal(entity.num_clusters, 2, "edict_s.num_clusters must alias runtime cluster count");
edictServerFields.clusternums[0] = 3;
edictServerFields.clusternums[1] = 5;
assert.deepEqual(Array.from(entity.clusternums.slice(0, 2)), [3, 5], "edict_s.clusternums must expose mutable inline cluster storage");
assert.equal(entity.clusternums.length, MAX_ENT_CLUSTERS, "edict_t clusternums must keep fixed inline capacity");
assert.equal(edictServerFields.headnode, 0, "edict_s.headnode must start unused while num_clusters is not -1");
edictServerFields.headnode = 1234;
assert.equal(entity.headnode, 1234, "edict_s.headnode must alias runtime headnode visibility storage");
assert.equal(edictServerFields.svflags, 0, "edict_s.svflags must start clear like C zeroed storage");
edictServerFields.svflags = SVF_NOCLIENT | SVF_MONSTER;
assert.equal(entity.svflags, SVF_NOCLIENT | SVF_MONSTER, "edict_s.svflags must alias runtime server flags");
assert.equal(edictServerFields.solid, solid_t.SOLID_NOT, "edict_s.solid must default to SOLID_NOT");
edictServerFields.solid = solid_t.SOLID_BBOX;
assert.equal(entity.solid, solid_t.SOLID_BBOX, "edict_s.solid must alias runtime solidity");
assert.equal(edictServerFields.clipmask, 0, "edict_s.clipmask must start clear");
edictServerFields.clipmask = 0x6000001;
assert.equal(entity.clipmask, 0x6000001, "edict_s.clipmask must alias runtime collision mask");
assert.equal(edictServerFields.owner, null, "edict_s.owner must start as a nullable edict_t pointer");
const ownerEntity = createRuntimeEntity({}, 2);
edictServerFields.owner = ownerEntity;
assert.equal(entity.owner, ownerEntity, "edict_s.owner must alias runtime ownership pointer");
edictServerFields.headnode = 0;
edictServerFields.svflags = 0;
edictServerFields.solid = solid_t.SOLID_NOT;
edictServerFields.clipmask = 0;
edictServerFields.owner = null;
assert.equal(entity.area.prev, null, "edict_t area link must start detached");
assert.equal(entity.area.next, null, "edict_t area link must start detached");

const detachedLink: link_s = { prev: entity.area, next: null };
const typedefLink: link_t = detachedLink;
entity.area.next = typedefLink;
assert.equal(entity.area.next, detachedLink, "link_s/link_t must preserve the double-linked node shape");
assert.equal(entity.area.next.prev, entity.area, "link_s.prev must be able to reference another link_s node");
assert.ok(entity.clusternums instanceof Int32Array, "edict_t clusternums must keep integer inline storage");

console.log("quake2-game-header: ok");
