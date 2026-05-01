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

import { EF_ROTATE } from "../../packages/qcommon/src/index.js";
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
  ARMOR_BODY,
  ARMOR_COMBAT,
  ARMOR_JACKET,
  ARMOR_NONE,
  ARMOR_SHARD,
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
  IT_AMMO,
  IT_ARMOR,
  IT_KEY,
  IT_POWERUP,
  IT_STAY_COOP,
  IT_WEAPON,
  LEFT_HANDED,
  LLOFS,
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
  WEAP_BFG,
  WEAP_BLASTER,
  WEAP_CHAINGUN,
  WEAP_GRENADELAUNCHER,
  WEAP_GRENADES,
  WEAP_HYPERBLASTER,
  WEAP_MACHINEGUN,
  WEAP_RAILGUN,
  WEAP_ROCKETLAUNCHER,
  WEAP_SHOTGUN,
  WEAP_SUPERSHOTGUN,
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
import type { game_locals_t, gitem_armor_t, gitem_t, level_locals_t } from "../../packages/game/src/g_local.js";
import {
  ARMOR_BODY as INDEX_ARMOR_BODY,
  ARMOR_COMBAT as INDEX_ARMOR_COMBAT,
  ARMOR_JACKET as INDEX_ARMOR_JACKET,
  ARMOR_NONE as INDEX_ARMOR_NONE,
  ARMOR_SHARD as INDEX_ARMOR_SHARD,
  IT_AMMO as INDEX_IT_AMMO,
  IT_ARMOR as INDEX_IT_ARMOR,
  IT_KEY as INDEX_IT_KEY,
  IT_POWERUP as INDEX_IT_POWERUP,
  IT_STAY_COOP as INDEX_IT_STAY_COOP,
  IT_WEAPON as INDEX_IT_WEAPON,
  MOVETYPE_BOUNCE as INDEX_MOVETYPE_BOUNCE,
  MOVETYPE_FLY as INDEX_MOVETYPE_FLY,
  MOVETYPE_FLYMISSILE as INDEX_MOVETYPE_FLYMISSILE,
  MOVETYPE_NOCLIP as INDEX_MOVETYPE_NOCLIP,
  MOVETYPE_NONE as INDEX_MOVETYPE_NONE,
  MOVETYPE_PUSH as INDEX_MOVETYPE_PUSH,
  MOVETYPE_STEP as INDEX_MOVETYPE_STEP,
  MOVETYPE_STOP as INDEX_MOVETYPE_STOP,
  MOVETYPE_TOSS as INDEX_MOVETYPE_TOSS,
  MOVETYPE_WALK as INDEX_MOVETYPE_WALK,
  WEAP_BFG as INDEX_WEAP_BFG,
  WEAP_BLASTER as INDEX_WEAP_BLASTER,
  WEAP_CHAINGUN as INDEX_WEAP_CHAINGUN,
  WEAP_GRENADELAUNCHER as INDEX_WEAP_GRENADELAUNCHER,
  WEAP_GRENADES as INDEX_WEAP_GRENADES,
  WEAP_HYPERBLASTER as INDEX_WEAP_HYPERBLASTER,
  WEAP_MACHINEGUN as INDEX_WEAP_MACHINEGUN,
  WEAP_RAILGUN as INDEX_WEAP_RAILGUN,
  WEAP_ROCKETLAUNCHER as INDEX_WEAP_ROCKETLAUNCHER,
  WEAP_SHOTGUN as INDEX_WEAP_SHOTGUN,
  WEAP_SUPERSHOTGUN as INDEX_WEAP_SUPERSHOTGUN
} from "../../packages/game/src/index.js";
import { FindItem, GetArmorInfoByItem, GetItemByIndex, PrecacheItem } from "../../packages/game/src/g_items.js";
import { createGameRuntimeFromBspEntities, createRuntimeEntity } from "../../packages/game/src/runtime.js";

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
assert.equal(IT_WEAPON, 1, "IT_WEAPON mismatch");
assert.equal(IT_AMMO, 2, "IT_AMMO mismatch");
assert.equal(IT_ARMOR, 4, "IT_ARMOR mismatch");
assert.equal(IT_STAY_COOP, 8, "IT_STAY_COOP mismatch");
assert.equal(IT_KEY, 16, "IT_KEY mismatch");
assert.equal(IT_POWERUP, 32, "IT_POWERUP mismatch");
assert.equal(INDEX_IT_WEAPON, IT_WEAPON, "public IT_WEAPON export mismatch");
assert.equal(INDEX_IT_AMMO, IT_AMMO, "public IT_AMMO export mismatch");
assert.equal(INDEX_IT_ARMOR, IT_ARMOR, "public IT_ARMOR export mismatch");
assert.equal(INDEX_IT_STAY_COOP, IT_STAY_COOP, "public IT_STAY_COOP export mismatch");
assert.equal(INDEX_IT_KEY, IT_KEY, "public IT_KEY export mismatch");
assert.equal(INDEX_IT_POWERUP, IT_POWERUP, "public IT_POWERUP export mismatch");
assert.equal(WEAP_BLASTER, 1, "WEAP_BLASTER mismatch");
assert.equal(WEAP_SHOTGUN, 2, "WEAP_SHOTGUN mismatch");
assert.equal(WEAP_SUPERSHOTGUN, 3, "WEAP_SUPERSHOTGUN mismatch");
assert.equal(WEAP_MACHINEGUN, 4, "WEAP_MACHINEGUN mismatch");
assert.equal(WEAP_CHAINGUN, 5, "WEAP_CHAINGUN mismatch");
assert.equal(WEAP_GRENADES, 6, "WEAP_GRENADES mismatch");
assert.equal(WEAP_GRENADELAUNCHER, 7, "WEAP_GRENADELAUNCHER mismatch");
assert.equal(WEAP_ROCKETLAUNCHER, 8, "WEAP_ROCKETLAUNCHER mismatch");
assert.equal(WEAP_HYPERBLASTER, 9, "WEAP_HYPERBLASTER mismatch");
assert.equal(WEAP_RAILGUN, 10, "WEAP_RAILGUN mismatch");
assert.equal(WEAP_BFG, 11, "WEAP_BFG mismatch");
assert.equal(INDEX_WEAP_BLASTER, WEAP_BLASTER, "public WEAP_BLASTER export mismatch");
assert.equal(INDEX_WEAP_SHOTGUN, WEAP_SHOTGUN, "public WEAP_SHOTGUN export mismatch");
assert.equal(INDEX_WEAP_SUPERSHOTGUN, WEAP_SUPERSHOTGUN, "public WEAP_SUPERSHOTGUN export mismatch");
assert.equal(INDEX_WEAP_MACHINEGUN, WEAP_MACHINEGUN, "public WEAP_MACHINEGUN export mismatch");
assert.equal(INDEX_WEAP_CHAINGUN, WEAP_CHAINGUN, "public WEAP_CHAINGUN export mismatch");
assert.equal(INDEX_WEAP_GRENADES, WEAP_GRENADES, "public WEAP_GRENADES export mismatch");
assert.equal(INDEX_WEAP_GRENADELAUNCHER, WEAP_GRENADELAUNCHER, "public WEAP_GRENADELAUNCHER export mismatch");
assert.equal(INDEX_WEAP_ROCKETLAUNCHER, WEAP_ROCKETLAUNCHER, "public WEAP_ROCKETLAUNCHER export mismatch");
assert.equal(INDEX_WEAP_HYPERBLASTER, WEAP_HYPERBLASTER, "public WEAP_HYPERBLASTER export mismatch");
assert.equal(INDEX_WEAP_RAILGUN, WEAP_RAILGUN, "public WEAP_RAILGUN export mismatch");
assert.equal(INDEX_WEAP_BFG, WEAP_BFG, "public WEAP_BFG export mismatch");
assert.equal(ARMOR_NONE, 0, "ARMOR_NONE mismatch");
assert.equal(ARMOR_JACKET, 1, "ARMOR_JACKET mismatch");
assert.equal(ARMOR_COMBAT, 2, "ARMOR_COMBAT mismatch");
assert.equal(ARMOR_BODY, 3, "ARMOR_BODY mismatch");
assert.equal(ARMOR_SHARD, 4, "ARMOR_SHARD mismatch");
assert.equal(INDEX_ARMOR_NONE, ARMOR_NONE, "public ARMOR_NONE export mismatch");
assert.equal(INDEX_ARMOR_JACKET, ARMOR_JACKET, "public ARMOR_JACKET export mismatch");
assert.equal(INDEX_ARMOR_COMBAT, ARMOR_COMBAT, "public ARMOR_COMBAT export mismatch");
assert.equal(INDEX_ARMOR_BODY, ARMOR_BODY, "public ARMOR_BODY export mismatch");
assert.equal(INDEX_ARMOR_SHARD, ARMOR_SHARD, "public ARMOR_SHARD export mismatch");
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
const gameLocals = game satisfies game_locals_t;
assert.equal(gameLocals.helpmessage1, "", "game_locals_t helpmessage1 default mismatch");
assert.equal(gameLocals.helpmessage2, "", "game_locals_t helpmessage2 default mismatch");
assert.equal(gameLocals.helpchanged, 0, "game_locals_t helpchanged default mismatch");
assert.deepEqual(gameLocals.clients, [], "game_locals_t clients default mismatch");
assert.equal(gameLocals.spawnpoint, "", "game_locals_t spawnpoint default mismatch");
assert.equal(gameLocals.maxclients, 0, "game_locals_t maxclients default mismatch");
assert.equal(gameLocals.maxentities, 0, "game_locals_t maxentities default mismatch");
assert.equal(gameLocals.serverflags, 0, "game_locals_t serverflags default mismatch");
assert.equal(gameLocals.num_items, 0, "game_locals_t num_items default mismatch");
assert.equal(gameLocals.autosaved, false, "game_locals_t autosaved default mismatch");

gameLocals.spawnpoint = "unit_start";
gameLocals.maxclients = 3;
gameLocals.maxentities = 128;
gameLocals.serverflags = SFL_CROSS_TRIGGER_1 | SFL_CROSS_TRIGGER_3;
assert.equal(game.spawnpoint, "unit_start", "game_locals_t spawnpoint string field mismatch");
assert.equal(game.maxclients, 3, "game_locals_t maxclients field mismatch");
assert.equal(game.maxentities, 128, "game_locals_t maxentities field mismatch");
assert.equal(game.serverflags, SFL_CROSS_TRIGGER_1 | SFL_CROSS_TRIGGER_3, "game_locals_t serverflags field mismatch");
const levelLocals = level satisfies level_locals_t;
assert.deepEqual(
  Object.keys(levelLocals),
  [
    "framenum",
    "time",
    "level_name",
    "mapname",
    "nextmap",
    "intermissiontime",
    "changemap",
    "exitintermission",
    "intermission_origin",
    "intermission_angle",
    "sight_client",
    "sight_entity",
    "sight_entity_framenum",
    "sound_entity",
    "sound_entity_framenum",
    "sound2_entity",
    "sound2_entity_framenum",
    "pic_health",
    "total_secrets",
    "found_secrets",
    "total_goals",
    "found_goals",
    "total_monsters",
    "killed_monsters",
    "current_entity",
    "body_que",
    "power_cubes"
  ],
  "level_locals_t field order mismatch"
);
assert.equal(levelLocals.framenum, 0, "level_locals_t framenum default mismatch");
assert.equal(levelLocals.time, 0, "level_locals_t time default mismatch");
assert.equal(levelLocals.level_name, "", "level_locals_t level_name default mismatch");
assert.equal(levelLocals.mapname, "", "level_locals_t mapname default mismatch");
assert.equal(levelLocals.nextmap, "", "level_locals_t nextmap default mismatch");
assert.equal(levelLocals.intermissiontime, 0, "level_locals_t intermissiontime default mismatch");
assert.equal(levelLocals.changemap, null, "level_locals_t changemap default mismatch");
assert.equal(levelLocals.exitintermission, 0, "level_locals_t exitintermission default mismatch");
assert.deepEqual(levelLocals.intermission_origin, [0, 0, 0], "level_locals_t intermission_origin default mismatch");
assert.deepEqual(levelLocals.intermission_angle, [0, 0, 0], "level_locals_t intermission_angle default mismatch");
assert.equal(levelLocals.sight_client, null, "level_locals_t sight_client default mismatch");
assert.equal(levelLocals.sight_entity, null, "level_locals_t sight_entity default mismatch");
assert.equal(levelLocals.sight_entity_framenum, 0, "level_locals_t sight_entity_framenum default mismatch");
assert.equal(levelLocals.sound_entity, null, "level_locals_t sound_entity default mismatch");
assert.equal(levelLocals.sound_entity_framenum, 0, "level_locals_t sound_entity_framenum default mismatch");
assert.equal(levelLocals.sound2_entity, null, "level_locals_t sound2_entity default mismatch");
assert.equal(levelLocals.sound2_entity_framenum, 0, "level_locals_t sound2_entity_framenum default mismatch");
assert.equal(levelLocals.pic_health, 0, "level_locals_t pic_health default mismatch");
assert.equal(levelLocals.total_secrets, 0, "level_locals_t total_secrets default mismatch");
assert.equal(levelLocals.found_secrets, 0, "level_locals_t found_secrets default mismatch");
assert.equal(levelLocals.total_goals, 0, "level_locals_t total_goals default mismatch");
assert.equal(levelLocals.found_goals, 0, "level_locals_t found_goals default mismatch");
assert.equal(levelLocals.total_monsters, 0, "level_locals_t total_monsters default mismatch");
assert.equal(levelLocals.killed_monsters, 0, "level_locals_t killed_monsters default mismatch");
assert.equal(levelLocals.body_que, 0, "level_locals_t body_que mismatch");
levelLocals.framenum = 42;
levelLocals.time = 4.2;
levelLocals.level_name = "Outer Base";
levelLocals.mapname = "base1";
levelLocals.nextmap = "base2";
levelLocals.intermissiontime = 5.5;
levelLocals.changemap = "base3";
levelLocals.exitintermission = 1;
levelLocals.intermission_origin = [128, -64, 32];
levelLocals.intermission_angle = [10, 90, 0];
levelLocals.sight_client = entity;
levelLocals.sight_entity = entity;
levelLocals.sight_entity_framenum = 43;
levelLocals.sound_entity = entity;
levelLocals.sound_entity_framenum = 44;
levelLocals.sound2_entity = entity;
levelLocals.sound2_entity_framenum = 45;
levelLocals.pic_health = 46;
levelLocals.total_secrets = 3;
levelLocals.found_secrets = 1;
levelLocals.total_goals = 4;
levelLocals.found_goals = 2;
levelLocals.total_monsters = 12;
levelLocals.killed_monsters = 5;
assert.equal(level.framenum, 42, "level_locals_t framenum field mismatch");
assert.equal(level.time, 4.2, "level_locals_t time field mismatch");
assert.equal(level.level_name, "Outer Base", "level_locals_t level_name field mismatch");
assert.equal(level.mapname, "base1", "level_locals_t mapname field mismatch");
assert.equal(level.nextmap, "base2", "level_locals_t nextmap field mismatch");
assert.equal(level.intermissiontime, 5.5, "level_locals_t intermissiontime field mismatch");
assert.equal(level.changemap, "base3", "level_locals_t changemap field mismatch");
assert.equal(level.exitintermission, 1, "level_locals_t exitintermission field mismatch");
assert.deepEqual(level.intermission_origin, [128, -64, 32], "level_locals_t intermission_origin field mismatch");
assert.deepEqual(level.intermission_angle, [10, 90, 0], "level_locals_t intermission_angle field mismatch");
assert.equal(level.sight_client, entity, "level_locals_t sight_client field mismatch");
assert.equal(level.sight_entity, entity, "level_locals_t sight_entity field mismatch");
assert.equal(level.sight_entity_framenum, 43, "level_locals_t sight_entity_framenum field mismatch");
assert.equal(level.sound_entity, entity, "level_locals_t sound_entity field mismatch");
assert.equal(level.sound_entity_framenum, 44, "level_locals_t sound_entity_framenum field mismatch");
assert.equal(level.sound2_entity, entity, "level_locals_t sound2_entity field mismatch");
assert.equal(level.sound2_entity_framenum, 45, "level_locals_t sound2_entity_framenum field mismatch");
assert.equal(level.pic_health, 46, "level_locals_t pic_health field mismatch");
assert.equal(level.total_secrets, 3, "level_locals_t total_secrets field mismatch");
assert.equal(level.found_secrets, 1, "level_locals_t found_secrets field mismatch");
assert.equal(level.total_goals, 4, "level_locals_t total_goals field mismatch");
assert.equal(level.found_goals, 2, "level_locals_t found_goals field mismatch");
assert.equal(level.total_monsters, 12, "level_locals_t total_monsters field mismatch");
assert.equal(level.killed_monsters, 5, "level_locals_t killed_monsters field mismatch");
assert.equal(st.sky, null, "spawn_temp sky default mismatch");
assert.equal(monsterinfo.saved_goal[2], 0, "monsterinfo saved_goal mismatch");
assert.equal(FOFS("classname"), "classname", "FOFS selector mismatch");
assert.equal(LLOFS("framenum"), "framenum", "LLOFS framenum selector mismatch");
assert.equal(LLOFS("time"), "time", "LLOFS time selector mismatch");
assert.equal(LLOFS("level_name"), "level_name", "LLOFS level_name selector mismatch");
assert.equal(LLOFS("mapname"), "mapname", "LLOFS mapname selector mismatch");
assert.equal(LLOFS("nextmap"), "nextmap", "LLOFS nextmap selector mismatch");
assert.equal(LLOFS("intermissiontime"), "intermissiontime", "LLOFS intermissiontime selector mismatch");
assert.equal(LLOFS("changemap"), "changemap", "LLOFS changemap selector mismatch");
assert.equal(LLOFS("exitintermission"), "exitintermission", "LLOFS exitintermission selector mismatch");
assert.equal(LLOFS("intermission_origin"), "intermission_origin", "LLOFS intermission_origin selector mismatch");
assert.equal(LLOFS("intermission_angle"), "intermission_angle", "LLOFS intermission_angle selector mismatch");
assert.equal(LLOFS("sight_client"), "sight_client", "LLOFS sight_client selector mismatch");
assert.equal(LLOFS("sight_entity"), "sight_entity", "LLOFS sight_entity selector mismatch");
assert.equal(LLOFS("sight_entity_framenum"), "sight_entity_framenum", "LLOFS sight_entity_framenum selector mismatch");
assert.equal(LLOFS("sound_entity"), "sound_entity", "LLOFS sound_entity selector mismatch");
assert.equal(LLOFS("sound_entity_framenum"), "sound_entity_framenum", "LLOFS sound_entity_framenum selector mismatch");
assert.equal(LLOFS("sound2_entity"), "sound2_entity", "LLOFS sound2_entity selector mismatch");
assert.equal(LLOFS("sound2_entity_framenum"), "sound2_entity_framenum", "LLOFS sound2_entity_framenum selector mismatch");
assert.equal(LLOFS("pic_health"), "pic_health", "LLOFS pic_health selector mismatch");
assert.equal(LLOFS("total_secrets"), "total_secrets", "LLOFS total_secrets selector mismatch");
assert.equal(LLOFS("found_secrets"), "found_secrets", "LLOFS found_secrets selector mismatch");
assert.equal(LLOFS("total_goals"), "total_goals", "LLOFS total_goals selector mismatch");
assert.equal(LLOFS("found_goals"), "found_goals", "LLOFS found_goals selector mismatch");
assert.equal(LLOFS("total_monsters"), "total_monsters", "LLOFS total_monsters selector mismatch");
assert.equal(LLOFS("killed_monsters"), "killed_monsters", "LLOFS killed_monsters selector mismatch");
assert.equal(world([entity]), entity, "world helper mismatch");
assert.equal(ITEM_INDEX(shotgun!), 2, "ITEM_INDEX mismatch");

const jacket = FindItem("Jacket Armor");
const combat = FindItem("Combat Armor");
const body = FindItem("Body Armor");
const shard = FindItem("Armor Shard");
const jacketInfo = GetArmorInfoByItem(jacket) satisfies gitem_armor_t | null;
const combatInfo = GetArmorInfoByItem(combat) satisfies gitem_armor_t | null;
const bodyInfo = GetArmorInfoByItem(body) satisfies gitem_armor_t | null;
assert.deepEqual(jacketInfo, {
  base_count: 25,
  max_count: 50,
  normal_protection: 0.30,
  energy_protection: 0.00,
  armor: ARMOR_JACKET
}, "gitem_armor_t jacketarmor_info mismatch");
assert.deepEqual(combatInfo, {
  base_count: 50,
  max_count: 100,
  normal_protection: 0.60,
  energy_protection: 0.30,
  armor: ARMOR_COMBAT
}, "gitem_armor_t combatarmor_info mismatch");
assert.deepEqual(bodyInfo, {
  base_count: 100,
  max_count: 200,
  normal_protection: 0.80,
  energy_protection: 0.60,
  armor: ARMOR_BODY
}, "gitem_armor_t bodyarmor_info mismatch");
assert.equal(jacket?.tag, ARMOR_JACKET, "Jacket Armor item tag mismatch");
assert.equal(combat?.tag, ARMOR_COMBAT, "Combat Armor item tag mismatch");
assert.equal(body?.tag, ARMOR_BODY, "Body Armor item tag mismatch");
assert.equal(shard?.tag, ARMOR_SHARD, "Armor Shard item tag mismatch");
assert.equal(GetArmorInfoByItem(shard), null, "Armor Shard must not expose gitem_armor_t info");

const blaster = FindItem("Blaster");
const shotgunItem = FindItem("Shotgun");
const superShotgun = FindItem("Super Shotgun");
const machinegun = FindItem("Machinegun");
const chaingun = FindItem("Chaingun");
const grenades = FindItem("Grenades");
const grenadeLauncher = FindItem("Grenade Launcher");
const rocketLauncher = FindItem("Rocket Launcher");
const hyperBlaster = FindItem("HyperBlaster");
const railgun = FindItem("Railgun");
const bfg = FindItem("BFG10K");
const shells = FindItem("Shells");
const cells = FindItem("Cells");
const quad = FindItem("Quad Damage");
const invulnerability = FindItem("Invulnerability");
const breather = FindItem("Rebreather");
const dataCd = FindItem("Data CD");
const shotgunGItem = shotgunItem satisfies gitem_t | null;
assert.ok(shotgunGItem, "Shotgun gitem_t must resolve by pickup name");
assert.equal(shotgunGItem.classname, "weapon_shotgun", "gitem_s classname field mismatch");
assert.equal(shotgunGItem.pickupSound, "misc/w_pkup.wav", "gitem_s pickup_sound field mismatch");
assert.equal(shotgunGItem.worldModel, "models/weapons/g_shotg/tris.md2", "gitem_s world_model field mismatch");
assert.equal(shotgunGItem.worldModelFlags, EF_ROTATE, "gitem_s world_model_flags field mismatch");
assert.equal(shotgunGItem.viewModel, "models/weapons/v_shotg/tris.md2", "gitem_s view_model field mismatch");
assert.equal(shotgunGItem.icon, "w_shotgun", "gitem_s icon field mismatch");
assert.equal(shotgunGItem.pickupName, "Shotgun", "gitem_s pickup_name field mismatch");
assert.equal(shotgunGItem.countWidth, 0, "gitem_s count_width field mismatch");
assert.equal(shotgunGItem.quantity, 1, "gitem_s quantity field mismatch");
assert.equal(shotgunGItem.ammo, "Shells", "gitem_s ammo field mismatch");
assert.equal(blaster?.classname, "weapon_blaster", "gitem_s classname for Blaster mismatch");
assert.equal(blaster?.worldModel, "", "gitem_s empty world_model sentinel for Blaster mismatch");
assert.equal(blaster?.viewModel, "models/weapons/v_blast/tris.md2", "gitem_s view_model for Blaster mismatch");
assert.equal(blaster?.icon, "w_blaster", "gitem_s icon for Blaster mismatch");
assert.equal(blaster?.countWidth, 0, "gitem_s count_width for Blaster mismatch");
assert.equal(blaster?.quantity, 0, "gitem_s quantity for Blaster mismatch");
assert.equal(blaster?.ammo, null, "gitem_s NULL ammo mapping for Blaster mismatch");
assert.equal(shells?.pickupSound, "misc/am_pkup.wav", "gitem_s pickup_sound for Shells mismatch");
assert.equal(shells?.worldModelFlags, 0, "gitem_s world_model_flags for Shells mismatch");
assert.equal(shells?.viewModel, null, "gitem_s NULL view_model mapping for Shells mismatch");
assert.equal(shells?.icon, "a_shells", "gitem_s icon for Shells mismatch");
assert.equal(shells?.pickupName, "Shells", "gitem_s pickup_name for Shells mismatch");
assert.equal(shells?.countWidth, 3, "gitem_s count_width for Shells mismatch");
assert.equal(shells?.quantity, 10, "gitem_s quantity for Shells mismatch");
assert.equal(shells?.ammo, null, "gitem_s NULL ammo mapping for Shells mismatch");
assert.equal(grenades?.icon, "a_grenades", "gitem_s icon for Grenades mismatch");
assert.equal(grenades?.countWidth, 3, "gitem_s count_width for Grenades mismatch");
assert.equal(grenades?.quantity, 5, "gitem_s quantity for Grenades mismatch");
assert.equal(grenades?.ammo, "grenades", "gitem_s ammo self-name for Grenades mismatch");
assert.equal(quad?.icon, "p_quad", "gitem_s icon for Quad Damage mismatch");
assert.equal(quad?.countWidth, 2, "gitem_s count_width for Quad Damage mismatch");
assert.equal(quad?.quantity, 60, "gitem_s quantity for Quad Damage mismatch");
assert.equal(quad?.ammo, null, "gitem_s NULL ammo mapping for Quad Damage mismatch");
assert.equal(dataCd?.worldModelFlags, EF_ROTATE, "gitem_s world_model_flags for Data CD mismatch");
assert.equal(dataCd?.icon, "k_datacd", "gitem_s icon for Data CD mismatch");
assert.equal(dataCd?.pickupName, "Data CD", "gitem_s pickup_name for Data CD mismatch");
assert.equal(dataCd?.countWidth, 2, "gitem_s count_width for Data CD mismatch");
assert.equal(dataCd?.quantity, 0, "gitem_s quantity for Data CD mismatch");
assert.equal(dataCd?.ammo, null, "gitem_s NULL ammo mapping for Data CD mismatch");
assert.equal((jacket?.flags ?? 0) & IT_ARMOR, IT_ARMOR, "Jacket Armor item IT_ARMOR flag mismatch");
assert.equal((blaster?.flags ?? 0) & IT_WEAPON, IT_WEAPON, "Blaster item IT_WEAPON flag mismatch");
assert.equal((blaster?.flags ?? 0) & IT_STAY_COOP, IT_STAY_COOP, "Blaster item IT_STAY_COOP flag mismatch");
assert.equal(blaster?.weapmodel, WEAP_BLASTER, "Blaster weapmodel mismatch");
assert.equal(shotgunItem?.weapmodel, WEAP_SHOTGUN, "Shotgun weapmodel mismatch");
assert.equal(superShotgun?.weapmodel, WEAP_SUPERSHOTGUN, "Super Shotgun weapmodel mismatch");
assert.equal(machinegun?.weapmodel, WEAP_MACHINEGUN, "Machinegun weapmodel mismatch");
assert.equal(chaingun?.weapmodel, WEAP_CHAINGUN, "Chaingun weapmodel mismatch");
assert.equal(grenades?.weapmodel, WEAP_GRENADES, "Grenades weapmodel mismatch");
assert.equal(grenadeLauncher?.weapmodel, WEAP_GRENADELAUNCHER, "Grenade Launcher weapmodel mismatch");
assert.equal(rocketLauncher?.weapmodel, WEAP_ROCKETLAUNCHER, "Rocket Launcher weapmodel mismatch");
assert.equal(hyperBlaster?.weapmodel, WEAP_HYPERBLASTER, "HyperBlaster weapmodel mismatch");
assert.equal(railgun?.weapmodel, WEAP_RAILGUN, "Railgun weapmodel mismatch");
assert.equal(bfg?.weapmodel, WEAP_BFG, "BFG10K weapmodel mismatch");
assert.equal((grenades?.flags ?? 0) & (IT_AMMO | IT_WEAPON), IT_AMMO | IT_WEAPON, "Grenades item IT_AMMO|IT_WEAPON flags mismatch");
assert.equal(shells?.flags, IT_AMMO, "Shells item IT_AMMO flag mismatch");
assert.equal(shells?.tag, ammo_t.AMMO_SHELLS, "Shells item tag mismatch");
assert.equal(cells?.flags, IT_AMMO, "Cells item IT_AMMO flag mismatch");
assert.equal(cells?.tag, ammo_t.AMMO_CELLS, "Cells item tag mismatch");
assert.equal(grenades?.tag, ammo_t.AMMO_GRENADES, "Grenades item tag mismatch");
assert.equal(quad?.flags, IT_POWERUP, "Quad Damage item IT_POWERUP flag mismatch");
assert.equal(quad?.tag, 0, "Quad Damage item tag mismatch");
assert.equal((breather?.flags ?? 0) & (IT_STAY_COOP | IT_POWERUP), IT_STAY_COOP | IT_POWERUP, "Rebreather item IT_STAY_COOP|IT_POWERUP flags mismatch");
assert.equal((dataCd?.flags ?? 0) & (IT_STAY_COOP | IT_KEY), IT_STAY_COOP | IT_KEY, "Data CD item IT_STAY_COOP|IT_KEY flags mismatch");
assert.equal(dataCd?.tag, 0, "Data CD item tag mismatch");
assert.equal(GetArmorInfoByItem(jacket)?.armor, jacket?.tag, "gitem_s info adapter must resolve Jacket Armor tag");
assert.equal(GetArmorInfoByItem(combat)?.armor, combat?.tag, "gitem_s info adapter must resolve Combat Armor tag");
assert.equal(GetArmorInfoByItem(body)?.armor, body?.tag, "gitem_s info adapter must resolve Body Armor tag");
assert.equal(GetArmorInfoByItem(shotgunItem), null, "gitem_s info adapter must preserve NULL info for weapons");
assert.equal(GetArmorInfoByItem(quad), null, "gitem_s info adapter must preserve NULL info for powerups");
assert.equal(shotgunItem?.precaches, "weapons/shotgf1b.wav weapons/shotgr1b.wav", "Shotgun precaches mismatch");
assert.equal(bfg?.precaches, "sprites/s_bfg1.sp2 sprites/s_bfg2.sp2 sprites/s_bfg3.sp2 weapons/bfg__f1y.wav weapons/bfg__l1a.wav weapons/bfg__x1b.wav weapons/bfg_hum.wav", "BFG10K precaches mismatch");
assert.equal(quad?.precaches, "items/damage.wav items/damage2.wav items/damage3.wav", "Quad Damage precaches mismatch");
assert.equal(invulnerability?.precaches, "items/protect.wav items/protect2.wav items/protect4.wav", "Invulnerability precaches mismatch");
assert.equal(shells?.precaches, "", "Shells empty precaches mismatch");
assert.equal(dataCd?.precaches, "", "Data CD empty precaches mismatch");

const precacheRuntime = createGameRuntimeFromBspEntities([]);
PrecacheItem(precacheRuntime, bfg);
assert.ok(precacheRuntime.assets.modelPaths.includes("models/weapons/g_bfg/tris.md2"), "PrecacheItem must register BFG world model");
assert.ok(precacheRuntime.assets.modelPaths.includes("models/weapons/v_bfg/tris.md2"), "PrecacheItem must register BFG view model");
assert.ok(precacheRuntime.assets.modelPaths.includes("sprites/s_bfg1.sp2"), "PrecacheItem must register BFG sprite precache token");
assert.ok(precacheRuntime.assets.soundPaths.includes("weapons/bfg_hum.wav"), "PrecacheItem must register BFG sound precache token");
assert.ok(precacheRuntime.assets.modelPaths.includes("models/items/ammo/cells/medium/tris.md2"), "PrecacheItem must recursively register BFG ammo model");
assert.ok(precacheRuntime.assets.imagePaths.includes("a_cells"), "PrecacheItem must recursively register BFG ammo icon");

console.log("quake2-g-local-header: ok");
