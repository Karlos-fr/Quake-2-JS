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
import type { GameClientServerFields, gclient_s, gclient_t, link_s, link_t } from "../../packages/game/src/game.js";
import { createGameClient, createRuntimeEntity } from "../../packages/game/src/runtime.js";

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

const sourceNamedClient: gclient_s = client;
const typedefClient: gclient_t = sourceNamedClient;
const serverFields: GameClientServerFields = typedefClient;
assert.equal(serverFields.ps, client.ps, "gclient_s.ps must be the first server-visible player_state_t field");
assert.equal(client.ping, 0, "gclient_t server-visible ping field must be present");
serverFields.ping = 42;
assert.equal(client.ping, 42, "gclient_s/gclient_t ping aliases must reference the same runtime field");
assert.equal(entity.num_clusters, 0, "edict_t num_clusters must be initialized");
assert.equal(entity.clusternums.length, MAX_ENT_CLUSTERS, "edict_t clusternums must keep fixed inline capacity");
assert.equal(entity.area.prev, null, "edict_t area link must start detached");
assert.equal(entity.area.next, null, "edict_t area link must start detached");

const detachedLink: link_s = { prev: entity.area, next: null };
const typedefLink: link_t = detachedLink;
entity.area.next = typedefLink;
assert.equal(entity.area.next, detachedLink, "link_s/link_t must preserve the double-linked node shape");
assert.equal(entity.area.next.prev, entity.area, "link_s.prev must be able to reference another link_s node");
assert.ok(entity.clusternums instanceof Int32Array, "edict_t clusternums must keep integer inline storage");

console.log("quake2-game-header: ok");
