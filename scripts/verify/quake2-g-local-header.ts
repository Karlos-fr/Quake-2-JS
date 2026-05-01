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
  AS_MELEE,
  AS_MISSILE,
  AS_SLIDING,
  AS_STRAIGHT,
  BODY_QUEUE_SIZE,
  CENTER_HANDED,
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
  LEFT_HANDED,
  MELEE_DISTANCE,
  MOD_TRIGGER_HURT,
  MOVETYPE_BOUNCE,
  MOVETYPE_FLY,
  MOVETYPE_FLYMISSILE,
  MOVETYPE_NOCLIP,
  MOVETYPE_NONE,
  MOVETYPE_PUSH,
  MOVETYPE_STEP,
  MOVETYPE_STOP,
  MOVETYPE_TOSS,
  MOVETYPE_WALK,
  PNOISE_IMPACT,
  PNOISE_SELF,
  PNOISE_WEAPON,
  POWER_ARMOR_NONE,
  POWER_ARMOR_SCREEN,
  POWER_ARMOR_SHIELD,
  RANGE_FAR,
  RANGE_MELEE,
  RANGE_MID,
  RANGE_NEAR,
  RIGHT_HANDED,
  SFL_CROSS_TRIGGER_1,
  SFL_CROSS_TRIGGER_2,
  SFL_CROSS_TRIGGER_3,
  SFL_CROSS_TRIGGER_4,
  SFL_CROSS_TRIGGER_5,
  SFL_CROSS_TRIGGER_6,
  SFL_CROSS_TRIGGER_7,
  SFL_CROSS_TRIGGER_8,
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
import {
  MOVETYPE_BOUNCE as INDEX_MOVETYPE_BOUNCE,
  MOVETYPE_FLY as INDEX_MOVETYPE_FLY,
  MOVETYPE_FLYMISSILE as INDEX_MOVETYPE_FLYMISSILE,
  MOVETYPE_NOCLIP as INDEX_MOVETYPE_NOCLIP,
  MOVETYPE_NONE as INDEX_MOVETYPE_NONE,
  MOVETYPE_PUSH as INDEX_MOVETYPE_PUSH,
  MOVETYPE_STEP as INDEX_MOVETYPE_STEP,
  MOVETYPE_STOP as INDEX_MOVETYPE_STOP,
  MOVETYPE_TOSS as INDEX_MOVETYPE_TOSS,
  MOVETYPE_WALK as INDEX_MOVETYPE_WALK
} from "../../packages/game/src/index.js";
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
assert.equal(RIGHT_HANDED, 0, "RIGHT_HANDED mismatch");
assert.equal(LEFT_HANDED, 1, "LEFT_HANDED mismatch");
assert.equal(CENTER_HANDED, 2, "CENTER_HANDED mismatch");
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
assert.equal(AS_STRAIGHT, 1, "AS_STRAIGHT mismatch");
assert.equal(AS_SLIDING, 2, "AS_SLIDING mismatch");
assert.equal(AS_MELEE, 3, "AS_MELEE mismatch");
assert.equal(AS_MISSILE, 4, "AS_MISSILE mismatch");
assert.equal(POWER_ARMOR_NONE, 0, "POWER_ARMOR_NONE mismatch");
assert.equal(POWER_ARMOR_SCREEN, 1, "POWER_ARMOR_SCREEN mismatch");
assert.equal(POWER_ARMOR_SHIELD, 2, "POWER_ARMOR_SHIELD mismatch");
assert.equal(SFL_CROSS_TRIGGER_1, 0x00000001, "SFL_CROSS_TRIGGER_1 mismatch");
assert.equal(SFL_CROSS_TRIGGER_2, 0x00000002, "SFL_CROSS_TRIGGER_2 mismatch");
assert.equal(SFL_CROSS_TRIGGER_3, 0x00000004, "SFL_CROSS_TRIGGER_3 mismatch");
assert.equal(SFL_CROSS_TRIGGER_4, 0x00000008, "SFL_CROSS_TRIGGER_4 mismatch");
assert.equal(SFL_CROSS_TRIGGER_5, 0x00000010, "SFL_CROSS_TRIGGER_5 mismatch");
assert.equal(SFL_CROSS_TRIGGER_6, 0x00000020, "SFL_CROSS_TRIGGER_6 mismatch");
assert.equal(SFL_CROSS_TRIGGER_7, 0x00000040, "SFL_CROSS_TRIGGER_7 mismatch");
assert.equal(SFL_CROSS_TRIGGER_8, 0x00000080, "SFL_CROSS_TRIGGER_8 mismatch");
assert.equal(SFL_CROSS_TRIGGER_MASK, 0x000000ff, "SFL_CROSS_TRIGGER_MASK mismatch");
assert.equal(PNOISE_SELF, 0, "PNOISE_SELF mismatch");
assert.equal(PNOISE_WEAPON, 1, "PNOISE_WEAPON mismatch");
assert.equal(PNOISE_IMPACT, 2, "PNOISE_IMPACT mismatch");
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
assert.equal(movetype_t.MOVETYPE_NONE, 0, "movetype_t MOVETYPE_NONE mismatch");
assert.equal(movetype_t.MOVETYPE_NOCLIP, 1, "movetype_t MOVETYPE_NOCLIP mismatch");
assert.equal(movetype_t.MOVETYPE_PUSH, 2, "movetype_t MOVETYPE_PUSH mismatch");
assert.equal(movetype_t.MOVETYPE_STOP, 3, "movetype_t MOVETYPE_STOP mismatch");
assert.equal(movetype_t.MOVETYPE_WALK, 4, "movetype_t MOVETYPE_WALK mismatch");
assert.equal(movetype_t.MOVETYPE_STEP, 5, "movetype_t MOVETYPE_STEP mismatch");
assert.equal(movetype_t.MOVETYPE_FLY, 6, "movetype_t MOVETYPE_FLY mismatch");
assert.equal(movetype_t.MOVETYPE_TOSS, 7, "movetype_t MOVETYPE_TOSS mismatch");
assert.equal(movetype_t.MOVETYPE_FLYMISSILE, 8, "movetype_t MOVETYPE_FLYMISSILE mismatch");
assert.equal(movetype_t.MOVETYPE_BOUNCE, 9, "movetype_t MOVETYPE_BOUNCE mismatch");
assert.equal(MOVETYPE_NONE, 0, "MOVETYPE_NONE mismatch");
assert.equal(MOVETYPE_NOCLIP, 1, "MOVETYPE_NOCLIP mismatch");
assert.equal(MOVETYPE_PUSH, 2, "MOVETYPE_PUSH mismatch");
assert.equal(MOVETYPE_STOP, 3, "MOVETYPE_STOP mismatch");
assert.equal(MOVETYPE_WALK, 4, "MOVETYPE_WALK mismatch");
assert.equal(MOVETYPE_STEP, 5, "MOVETYPE_STEP mismatch");
assert.equal(MOVETYPE_FLY, 6, "MOVETYPE_FLY mismatch");
assert.equal(MOVETYPE_TOSS, 7, "MOVETYPE_TOSS mismatch");
assert.equal(MOVETYPE_FLYMISSILE, 8, "MOVETYPE_FLYMISSILE mismatch");
assert.equal(MOVETYPE_BOUNCE, 9, "MOVETYPE_BOUNCE mismatch");
assert.equal(INDEX_MOVETYPE_NONE, MOVETYPE_NONE, "public MOVETYPE_NONE export mismatch");
assert.equal(INDEX_MOVETYPE_NOCLIP, MOVETYPE_NOCLIP, "public MOVETYPE_NOCLIP export mismatch");
assert.equal(INDEX_MOVETYPE_PUSH, MOVETYPE_PUSH, "public MOVETYPE_PUSH export mismatch");
assert.equal(INDEX_MOVETYPE_STOP, MOVETYPE_STOP, "public MOVETYPE_STOP export mismatch");
assert.equal(INDEX_MOVETYPE_WALK, MOVETYPE_WALK, "public MOVETYPE_WALK export mismatch");
assert.equal(INDEX_MOVETYPE_STEP, MOVETYPE_STEP, "public MOVETYPE_STEP export mismatch");
assert.equal(INDEX_MOVETYPE_FLY, MOVETYPE_FLY, "public MOVETYPE_FLY export mismatch");
assert.equal(INDEX_MOVETYPE_TOSS, MOVETYPE_TOSS, "public MOVETYPE_TOSS export mismatch");
assert.equal(INDEX_MOVETYPE_FLYMISSILE, MOVETYPE_FLYMISSILE, "public MOVETYPE_FLYMISSILE export mismatch");
assert.equal(INDEX_MOVETYPE_BOUNCE, MOVETYPE_BOUNCE, "public MOVETYPE_BOUNCE export mismatch");
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
