/**
 * File: quake2-g-local-header.ts
 * Purpose: Verify that the TypeScript target for `game/g_local.h` preserves the key gameplay declarations.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - packages/game/src/g-local.ts
 * - packages/game/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import {
  AI_MEDIC,
  BODY_QUEUE_SIZE,
  FALL_TIME,
  FOFS,
  GAMEVERSION,
  ITEM_INDEX,
  MELEE_DISTANCE,
  MOD_TRIGGER_HURT,
  SFL_CROSS_TRIGGER_MASK,
  TAG_GAME,
  TAG_LEVEL,
  createGameClient,
  createGameLocals,
  createLevelLocals,
  createMonsterInfo,
  createSpawnTemp,
  damage_t,
  movetype_t,
  world
} from "../../packages/game/src/g_local.js";
import { GetItemByIndex } from "../../packages/game/src/g_items.js";
import { createRuntimeEntity } from "../../packages/game/src/runtime.js";

const client = createGameClient();
const entity = createRuntimeEntity({}, 0);
const game = createGameLocals();
const level = createLevelLocals();
const st = createSpawnTemp();
const monsterinfo = createMonsterInfo();
const shotgun = GetItemByIndex(2);

assert.equal(GAMEVERSION, "baseq2", "GAMEVERSION mismatch");
assert.equal(FALL_TIME, 0.3, "FALL_TIME mismatch");
assert.equal(TAG_GAME, 765, "TAG_GAME mismatch");
assert.equal(TAG_LEVEL, 766, "TAG_LEVEL mismatch");
assert.equal(MELEE_DISTANCE, 80, "MELEE_DISTANCE mismatch");
assert.equal(BODY_QUEUE_SIZE, 8, "BODY_QUEUE_SIZE mismatch");
assert.equal(AI_MEDIC, 0x00002000, "AI_MEDIC mismatch");
assert.equal(SFL_CROSS_TRIGGER_MASK, 0x000000ff, "SFL_CROSS_TRIGGER_MASK mismatch");
assert.equal(MOD_TRIGGER_HURT, 31, "MOD_TRIGGER_HURT mismatch");
assert.equal(damage_t.DAMAGE_AIM, 2, "damage_t mismatch");
assert.equal(movetype_t.MOVETYPE_STEP, 5, "movetype_t mismatch");
assert.equal(client.pers.netname, "", "client pers netname must exist");
assert.equal(client.flood_when.length, 10, "client flood_when inline array mismatch");
assert.equal(entity.monsterinfo.aiflags, 0, "entity monsterinfo must exist");
assert.equal(entity.gravity, 1, "entity gravity default mismatch");
assert.equal(entity.prethink, undefined, "entity prethink default mismatch");
assert.equal(game.maxclients, 0, "game_locals maxclients mismatch");
assert.equal(level.body_que, 0, "level_locals body_que mismatch");
assert.equal(st.sky, null, "spawn_temp sky default mismatch");
assert.equal(monsterinfo.saved_goal[2], 0, "monsterinfo saved_goal mismatch");
assert.equal(FOFS("classname"), "classname", "FOFS selector mismatch");
assert.equal(world([entity]), entity, "world helper mismatch");
assert.equal(ITEM_INDEX(shotgun!), 2, "ITEM_INDEX mismatch");

console.log("quake2-g-local-header: ok");
