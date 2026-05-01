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
  AI_BRUTAL,
  AI_COMBAT_POINT,
  AI_DUCKED,
  AI_GOOD_GUY,
  AI_MEDIC,
  AI_NOSTEP,
  AI_RESURRECTING,
  AI_SOUND_TARGET,
  AI_STAND_GROUND,
  AI_TEMP_STAND_GROUND,
  BODY_QUEUE_SIZE,
  DEAD_DEAD,
  DEAD_DYING,
  DEAD_NO,
  DEAD_RESPAWNABLE,
  FALL_TIME,
  FOFS,
  GAMEVERSION,
  GIB_METALLIC,
  GIB_ORGANIC,
  ITEM_INDEX,
  MELEE_DISTANCE,
  MOD_TRIGGER_HURT,
  RANGE_FAR,
  RANGE_MELEE,
  RANGE_MID,
  RANGE_NEAR,
  SFL_CROSS_TRIGGER_MASK,
  TAG_GAME,
  TAG_LEVEL,
  createGameClient,
  createGameLocals,
  createLevelLocals,
  createMonsterInfo,
  createSpawnTemp,
  ammo_t,
  damage_t,
  movetype_t,
  weaponstate_t,
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
assert.equal(DEAD_NO, 0, "DEAD_NO mismatch");
assert.equal(DEAD_DYING, 1, "DEAD_DYING mismatch");
assert.equal(DEAD_DEAD, 2, "DEAD_DEAD mismatch");
assert.equal(DEAD_RESPAWNABLE, 3, "DEAD_RESPAWNABLE mismatch");
assert.equal(RANGE_MELEE, 0, "RANGE_MELEE mismatch");
assert.equal(RANGE_NEAR, 1, "RANGE_NEAR mismatch");
assert.equal(RANGE_MID, 2, "RANGE_MID mismatch");
assert.equal(RANGE_FAR, 3, "RANGE_FAR mismatch");
assert.equal(GIB_ORGANIC, 0, "GIB_ORGANIC mismatch");
assert.equal(GIB_METALLIC, 1, "GIB_METALLIC mismatch");
assert.equal(AI_STAND_GROUND, 0x00000001, "AI_STAND_GROUND mismatch");
assert.equal(AI_TEMP_STAND_GROUND, 0x00000002, "AI_TEMP_STAND_GROUND mismatch");
assert.equal(AI_SOUND_TARGET, 0x00000004, "AI_SOUND_TARGET mismatch");
assert.equal(AI_GOOD_GUY, 0x00000100, "AI_GOOD_GUY mismatch");
assert.equal(AI_BRUTAL, 0x00000200, "AI_BRUTAL mismatch");
assert.equal(AI_NOSTEP, 0x00000400, "AI_NOSTEP mismatch");
assert.equal(AI_DUCKED, 0x00000800, "AI_DUCKED mismatch");
assert.equal(AI_COMBAT_POINT, 0x00001000, "AI_COMBAT_POINT mismatch");
assert.equal(AI_MEDIC, 0x00002000, "AI_MEDIC mismatch");
assert.equal(AI_RESURRECTING, 0x00004000, "AI_RESURRECTING mismatch");
assert.equal(SFL_CROSS_TRIGGER_MASK, 0x000000ff, "SFL_CROSS_TRIGGER_MASK mismatch");
assert.equal(MOD_TRIGGER_HURT, 31, "MOD_TRIGGER_HURT mismatch");
assert.equal(damage_t.DAMAGE_NO, 0, "damage_t DAMAGE_NO mismatch");
assert.equal(damage_t.DAMAGE_YES, 1, "damage_t DAMAGE_YES mismatch");
assert.equal(damage_t.DAMAGE_AIM, 2, "damage_t mismatch");
assert.equal(weaponstate_t.WEAPON_READY, 0, "weaponstate_t WEAPON_READY mismatch");
assert.equal(weaponstate_t.WEAPON_ACTIVATING, 1, "weaponstate_t WEAPON_ACTIVATING mismatch");
assert.equal(weaponstate_t.WEAPON_DROPPING, 2, "weaponstate_t WEAPON_DROPPING mismatch");
assert.equal(weaponstate_t.WEAPON_FIRING, 3, "weaponstate_t WEAPON_FIRING mismatch");
assert.equal(ammo_t.AMMO_BULLETS, 0, "ammo_t AMMO_BULLETS mismatch");
assert.equal(ammo_t.AMMO_SHELLS, 1, "ammo_t AMMO_SHELLS mismatch");
assert.equal(ammo_t.AMMO_ROCKETS, 2, "ammo_t AMMO_ROCKETS mismatch");
assert.equal(ammo_t.AMMO_GRENADES, 3, "ammo_t AMMO_GRENADES mismatch");
assert.equal(ammo_t.AMMO_CELLS, 4, "ammo_t AMMO_CELLS mismatch");
assert.equal(ammo_t.AMMO_SLUGS, 5, "ammo_t AMMO_SLUGS mismatch");
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
