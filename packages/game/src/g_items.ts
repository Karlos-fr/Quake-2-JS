/**
 * File: g_items.ts
 * Source: Quake II original / game/g_items.c
 * Purpose: Port the first item definitions and spawn helpers required to preserve visible world pickups.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - The current port focuses on spawn-side visual state and omits pickup/inventory gameplay.
 * - `droptofloor` keeps the original delayed spawn structure but uses the local gameplay collision bridge instead of `gi.trace`.
 *
 * Notes:
 * - This file is intended to stay close to the original item spawn path.
 */

import { EF_GIB, EF_ROTATE, MASK_SOLID, RF_GLOW } from "../../qcommon/src/index.js";
import {
  FRAMETIME,
  MOVETYPE_TOSS,
  SOLID_NOT,
  SOLID_TRIGGER,
  SVF_NOCLIENT,
  freeGameEntity,
  linkGameEntity,
  refreshEntitySpatialState,
  registerGameImage,
  registerGameModel,
  registerGameSound,
  type GameEntity,
  type GameRuntime
} from "./runtime.js";

const HEALTH_IGNORE_MAX = 1;
const HEALTH_TIMED = 2;
const ITEM_TRIGGER_SPAWN = 0x00000001;
const ITEM_NO_TOUCH = 0x00000002;
const IT_WEAPON = 1;
const IT_AMMO = 2;
const IT_ARMOR = 4;
const IT_STAY_COOP = 8;
const IT_KEY = 16;
const IT_POWERUP = 32;
const ARMOR_JACKET = 1;
const ARMOR_COMBAT = 2;
const ARMOR_BODY = 3;
const ARMOR_SHARD = 4;
const WEAP_SHOTGUN = 2;
const WEAP_SUPERSHOTGUN = 3;
const WEAP_MACHINEGUN = 4;
const WEAP_CHAINGUN = 5;
const WEAP_GRENADES = 6;
const WEAP_GRENADELAUNCHER = 7;
const WEAP_ROCKETLAUNCHER = 8;
const WEAP_HYPERBLASTER = 9;
const WEAP_RAILGUN = 10;
const WEAP_BFG = 11;
const AMMO_SHELLS = 1;
const AMMO_BULLETS = 2;
const AMMO_CELLS = 3;
const AMMO_ROCKETS = 4;
const AMMO_SLUGS = 5;
const AMMO_GRENADES = 6;

export type GameItemPickupKind =
  | "Pickup_Armor"
  | "Pickup_PowerArmor"
  | "Pickup_Weapon"
  | "Pickup_Ammo"
  | "Pickup_Powerup"
  | "Pickup_AncientHead"
  | "Pickup_Adrenaline"
  | "Pickup_Bandolier"
  | "Pickup_Pack"
  | "Pickup_Key"
  | "Pickup_Health";

export type GameItemUseKind =
  | "Use_Weapon"
  | "Use_PowerArmor"
  | "Use_Quad"
  | "Use_Invulnerability"
  | "Use_Silencer"
  | "Use_Breather"
  | "Use_Envirosuit";

export type GameItemDropKind =
  | "Drop_Weapon"
  | "Drop_Ammo"
  | "Drop_General"
  | "Drop_PowerArmor";

export type GameItemWeaponThinkKind =
  | "Weapon_Blaster"
  | "Weapon_Shotgun"
  | "Weapon_SuperShotgun"
  | "Weapon_Machinegun"
  | "Weapon_Chaingun"
  | "Weapon_Grenade"
  | "Weapon_GrenadeLauncher"
  | "Weapon_RocketLauncher"
  | "Weapon_HyperBlaster"
  | "Weapon_Railgun"
  | "Weapon_BFG";

/**
 * Category: New
 * Purpose: Describe the subset of `gitem_t` currently required to spawn visible Quake II pickups faithfully.
 *
 * Constraints:
 * - Must preserve the original classname, world model and world-model flags.
 */
export interface GameItemDefinition {
  index: number;
  classname: string;
  pickup: GameItemPickupKind | null;
  use: GameItemUseKind | null;
  drop: GameItemDropKind | null;
  weaponThink: GameItemWeaponThinkKind | null;
  pickupName: string;
  pickupSound: string | null;
  worldModel: string;
  worldModelFlags: number;
  viewModel: string | null;
  icon: string | null;
  countWidth: number;
  quantity: number;
  ammo: string | null;
  flags: number;
  weapmodel: number;
  tag: number;
  precaches: string;
}

interface RawGameItemDefinition extends Omit<GameItemDefinition, "index"> {}

const rawItemlist: readonly RawGameItemDefinition[] = [
  { classname: "item_armor_body", pickup: "Pickup_Armor", use: null, drop: null, weaponThink: null, pickupName: "Body Armor", pickupSound: "misc/ar1_pkup.wav", worldModel: "models/items/armor/body/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "i_bodyarmor", countWidth: 3, quantity: 0, ammo: null, flags: IT_ARMOR, weapmodel: 0, tag: ARMOR_BODY, precaches: "" },
  { classname: "item_armor_combat", pickup: "Pickup_Armor", use: null, drop: null, weaponThink: null, pickupName: "Combat Armor", pickupSound: "misc/ar1_pkup.wav", worldModel: "models/items/armor/combat/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "i_combatarmor", countWidth: 3, quantity: 0, ammo: null, flags: IT_ARMOR, weapmodel: 0, tag: ARMOR_COMBAT, precaches: "" },
  { classname: "item_armor_jacket", pickup: "Pickup_Armor", use: null, drop: null, weaponThink: null, pickupName: "Jacket Armor", pickupSound: "misc/ar1_pkup.wav", worldModel: "models/items/armor/jacket/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "i_jacketarmor", countWidth: 3, quantity: 0, ammo: null, flags: IT_ARMOR, weapmodel: 0, tag: ARMOR_JACKET, precaches: "" },
  { classname: "item_armor_shard", pickup: "Pickup_Armor", use: null, drop: null, weaponThink: null, pickupName: "Armor Shard", pickupSound: "misc/ar2_pkup.wav", worldModel: "models/items/armor/shard/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "i_jacketarmor", countWidth: 3, quantity: 0, ammo: null, flags: IT_ARMOR, weapmodel: 0, tag: ARMOR_SHARD, precaches: "" },
  { classname: "item_power_screen", pickup: "Pickup_PowerArmor", use: "Use_PowerArmor", drop: "Drop_PowerArmor", weaponThink: null, pickupName: "Power Screen", pickupSound: "misc/ar3_pkup.wav", worldModel: "models/items/armor/screen/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "i_powerscreen", countWidth: 0, quantity: 60, ammo: null, flags: IT_ARMOR, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "item_power_shield", pickup: "Pickup_PowerArmor", use: "Use_PowerArmor", drop: "Drop_PowerArmor", weaponThink: null, pickupName: "Power Shield", pickupSound: "misc/ar3_pkup.wav", worldModel: "models/items/armor/shield/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "i_powershield", countWidth: 0, quantity: 60, ammo: null, flags: IT_ARMOR, weapmodel: 0, tag: 0, precaches: "misc/power2.wav misc/power1.wav" },
  { classname: "weapon_shotgun", pickup: "Pickup_Weapon", use: "Use_Weapon", drop: "Drop_Weapon", weaponThink: "Weapon_Shotgun", pickupName: "Shotgun", pickupSound: "misc/w_pkup.wav", worldModel: "models/weapons/g_shotg/tris.md2", worldModelFlags: EF_ROTATE, viewModel: "models/weapons/v_shotg/tris.md2", icon: "w_shotgun", countWidth: 0, quantity: 1, ammo: "Shells", flags: IT_WEAPON | IT_STAY_COOP, weapmodel: WEAP_SHOTGUN, tag: 0, precaches: "weapons/shotgf1b.wav weapons/shotgr1b.wav" },
  { classname: "weapon_supershotgun", pickup: "Pickup_Weapon", use: "Use_Weapon", drop: "Drop_Weapon", weaponThink: "Weapon_SuperShotgun", pickupName: "Super Shotgun", pickupSound: "misc/w_pkup.wav", worldModel: "models/weapons/g_shotg2/tris.md2", worldModelFlags: EF_ROTATE, viewModel: "models/weapons/v_shotg2/tris.md2", icon: "w_sshotgun", countWidth: 0, quantity: 2, ammo: "Shells", flags: IT_WEAPON | IT_STAY_COOP, weapmodel: WEAP_SUPERSHOTGUN, tag: 0, precaches: "weapons/sshotf1b.wav" },
  { classname: "weapon_machinegun", pickup: "Pickup_Weapon", use: "Use_Weapon", drop: "Drop_Weapon", weaponThink: "Weapon_Machinegun", pickupName: "Machinegun", pickupSound: "misc/w_pkup.wav", worldModel: "models/weapons/g_machn/tris.md2", worldModelFlags: EF_ROTATE, viewModel: "models/weapons/v_machn/tris.md2", icon: "w_machinegun", countWidth: 0, quantity: 1, ammo: "Bullets", flags: IT_WEAPON | IT_STAY_COOP, weapmodel: WEAP_MACHINEGUN, tag: 0, precaches: "weapons/machgf1b.wav weapons/machgf2b.wav weapons/machgf3b.wav weapons/machgf4b.wav weapons/machgf5b.wav" },
  { classname: "weapon_chaingun", pickup: "Pickup_Weapon", use: "Use_Weapon", drop: "Drop_Weapon", weaponThink: "Weapon_Chaingun", pickupName: "Chaingun", pickupSound: "misc/w_pkup.wav", worldModel: "models/weapons/g_chain/tris.md2", worldModelFlags: EF_ROTATE, viewModel: "models/weapons/v_chain/tris.md2", icon: "w_chaingun", countWidth: 0, quantity: 1, ammo: "Bullets", flags: IT_WEAPON | IT_STAY_COOP, weapmodel: WEAP_CHAINGUN, tag: 0, precaches: "weapons/chngnu1a.wav weapons/chngnl1a.wav weapons/machgf3b.wav weapons/chngnd1a.wav" },
  { classname: "ammo_grenades", pickup: "Pickup_Ammo", use: "Use_Weapon", drop: "Drop_Ammo", weaponThink: "Weapon_Grenade", pickupName: "Grenades", pickupSound: "misc/am_pkup.wav", worldModel: "models/items/ammo/grenades/medium/tris.md2", worldModelFlags: 0, viewModel: "models/weapons/v_handgr/tris.md2", icon: "a_grenades", countWidth: 3, quantity: 5, ammo: "grenades", flags: IT_AMMO | IT_WEAPON, weapmodel: WEAP_GRENADES, tag: AMMO_GRENADES, precaches: "weapons/hgrent1a.wav weapons/hgrena1b.wav weapons/hgrenc1b.wav weapons/hgrenb1a.wav weapons/hgrenb2a.wav" },
  { classname: "weapon_grenadelauncher", pickup: "Pickup_Weapon", use: "Use_Weapon", drop: "Drop_Weapon", weaponThink: "Weapon_GrenadeLauncher", pickupName: "Grenade Launcher", pickupSound: "misc/w_pkup.wav", worldModel: "models/weapons/g_launch/tris.md2", worldModelFlags: EF_ROTATE, viewModel: "models/weapons/v_launch/tris.md2", icon: "w_glauncher", countWidth: 0, quantity: 1, ammo: "Grenades", flags: IT_WEAPON | IT_STAY_COOP, weapmodel: WEAP_GRENADELAUNCHER, tag: 0, precaches: "models/objects/grenade/tris.md2 weapons/grenlf1a.wav weapons/grenlr1b.wav weapons/grenlb1b.wav" },
  { classname: "weapon_rocketlauncher", pickup: "Pickup_Weapon", use: "Use_Weapon", drop: "Drop_Weapon", weaponThink: "Weapon_RocketLauncher", pickupName: "Rocket Launcher", pickupSound: "misc/w_pkup.wav", worldModel: "models/weapons/g_rocket/tris.md2", worldModelFlags: EF_ROTATE, viewModel: "models/weapons/v_rocket/tris.md2", icon: "w_rlauncher", countWidth: 0, quantity: 1, ammo: "Rockets", flags: IT_WEAPON | IT_STAY_COOP, weapmodel: WEAP_ROCKETLAUNCHER, tag: 0, precaches: "models/objects/rocket/tris.md2 weapons/rockfly.wav weapons/rocklf1a.wav weapons/rocklr1b.wav models/objects/debris2/tris.md2" },
  { classname: "weapon_hyperblaster", pickup: "Pickup_Weapon", use: "Use_Weapon", drop: "Drop_Weapon", weaponThink: "Weapon_HyperBlaster", pickupName: "HyperBlaster", pickupSound: "misc/w_pkup.wav", worldModel: "models/weapons/g_hyperb/tris.md2", worldModelFlags: EF_ROTATE, viewModel: "models/weapons/v_hyperb/tris.md2", icon: "w_hyperblaster", countWidth: 0, quantity: 1, ammo: "Cells", flags: IT_WEAPON | IT_STAY_COOP, weapmodel: WEAP_HYPERBLASTER, tag: 0, precaches: "weapons/hyprbu1a.wav weapons/hyprbl1a.wav weapons/hyprbf1a.wav weapons/hyprbd1a.wav misc/lasfly.wav" },
  { classname: "weapon_railgun", pickup: "Pickup_Weapon", use: "Use_Weapon", drop: "Drop_Weapon", weaponThink: "Weapon_Railgun", pickupName: "Railgun", pickupSound: "misc/w_pkup.wav", worldModel: "models/weapons/g_rail/tris.md2", worldModelFlags: EF_ROTATE, viewModel: "models/weapons/v_rail/tris.md2", icon: "w_railgun", countWidth: 0, quantity: 1, ammo: "Slugs", flags: IT_WEAPON | IT_STAY_COOP, weapmodel: WEAP_RAILGUN, tag: 0, precaches: "weapons/rg_hum.wav" },
  { classname: "weapon_bfg", pickup: "Pickup_Weapon", use: "Use_Weapon", drop: "Drop_Weapon", weaponThink: "Weapon_BFG", pickupName: "BFG10K", pickupSound: "misc/w_pkup.wav", worldModel: "models/weapons/g_bfg/tris.md2", worldModelFlags: EF_ROTATE, viewModel: "models/weapons/v_bfg/tris.md2", icon: "w_bfg", countWidth: 0, quantity: 50, ammo: "Cells", flags: IT_WEAPON | IT_STAY_COOP, weapmodel: WEAP_BFG, tag: 0, precaches: "sprites/s_bfg1.sp2 sprites/s_bfg2.sp2 sprites/s_bfg3.sp2 weapons/bfg__f1y.wav weapons/bfg__l1a.wav weapons/bfg__x1b.wav weapons/bfg_hum.wav" },
  { classname: "ammo_shells", pickup: "Pickup_Ammo", use: null, drop: "Drop_Ammo", weaponThink: null, pickupName: "Shells", pickupSound: "misc/am_pkup.wav", worldModel: "models/items/ammo/shells/medium/tris.md2", worldModelFlags: 0, viewModel: null, icon: "a_shells", countWidth: 3, quantity: 10, ammo: null, flags: IT_AMMO, weapmodel: 0, tag: AMMO_SHELLS, precaches: "" },
  { classname: "ammo_bullets", pickup: "Pickup_Ammo", use: null, drop: "Drop_Ammo", weaponThink: null, pickupName: "Bullets", pickupSound: "misc/am_pkup.wav", worldModel: "models/items/ammo/bullets/medium/tris.md2", worldModelFlags: 0, viewModel: null, icon: "a_bullets", countWidth: 3, quantity: 50, ammo: null, flags: IT_AMMO, weapmodel: 0, tag: AMMO_BULLETS, precaches: "" },
  { classname: "ammo_cells", pickup: "Pickup_Ammo", use: null, drop: "Drop_Ammo", weaponThink: null, pickupName: "Cells", pickupSound: "misc/am_pkup.wav", worldModel: "models/items/ammo/cells/medium/tris.md2", worldModelFlags: 0, viewModel: null, icon: "a_cells", countWidth: 3, quantity: 50, ammo: null, flags: IT_AMMO, weapmodel: 0, tag: AMMO_CELLS, precaches: "" },
  { classname: "ammo_rockets", pickup: "Pickup_Ammo", use: null, drop: "Drop_Ammo", weaponThink: null, pickupName: "Rockets", pickupSound: "misc/am_pkup.wav", worldModel: "models/items/ammo/rockets/medium/tris.md2", worldModelFlags: 0, viewModel: null, icon: "a_rockets", countWidth: 3, quantity: 5, ammo: null, flags: IT_AMMO, weapmodel: 0, tag: AMMO_ROCKETS, precaches: "" },
  { classname: "ammo_slugs", pickup: "Pickup_Ammo", use: null, drop: "Drop_Ammo", weaponThink: null, pickupName: "Slugs", pickupSound: "misc/am_pkup.wav", worldModel: "models/items/ammo/slugs/medium/tris.md2", worldModelFlags: 0, viewModel: null, icon: "a_slugs", countWidth: 3, quantity: 10, ammo: null, flags: IT_AMMO, weapmodel: 0, tag: AMMO_SLUGS, precaches: "" },
  { classname: "item_quad", pickup: "Pickup_Powerup", use: "Use_Quad", drop: "Drop_General", weaponThink: null, pickupName: "Quad Damage", pickupSound: "items/pkup.wav", worldModel: "models/items/quaddama/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "p_quad", countWidth: 2, quantity: 60, ammo: null, flags: IT_POWERUP, weapmodel: 0, tag: 0, precaches: "items/damage.wav items/damage2.wav items/damage3.wav" },
  { classname: "item_invulnerability", pickup: "Pickup_Powerup", use: "Use_Invulnerability", drop: "Drop_General", weaponThink: null, pickupName: "Invulnerability", pickupSound: "items/pkup.wav", worldModel: "models/items/invulner/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "p_invulnerability", countWidth: 2, quantity: 300, ammo: null, flags: IT_POWERUP, weapmodel: 0, tag: 0, precaches: "items/protect.wav items/protect2.wav items/protect4.wav" },
  { classname: "item_silencer", pickup: "Pickup_Powerup", use: "Use_Silencer", drop: "Drop_General", weaponThink: null, pickupName: "Silencer", pickupSound: "items/pkup.wav", worldModel: "models/items/silencer/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "p_silencer", countWidth: 2, quantity: 60, ammo: null, flags: IT_POWERUP, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "item_breather", pickup: "Pickup_Powerup", use: "Use_Breather", drop: "Drop_General", weaponThink: null, pickupName: "Rebreather", pickupSound: "items/pkup.wav", worldModel: "models/items/breather/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "p_rebreather", countWidth: 2, quantity: 60, ammo: null, flags: IT_STAY_COOP | IT_POWERUP, weapmodel: 0, tag: 0, precaches: "items/airout.wav" },
  { classname: "item_enviro", pickup: "Pickup_Powerup", use: "Use_Envirosuit", drop: "Drop_General", weaponThink: null, pickupName: "Environment Suit", pickupSound: "items/pkup.wav", worldModel: "models/items/enviro/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "p_envirosuit", countWidth: 2, quantity: 60, ammo: null, flags: IT_STAY_COOP | IT_POWERUP, weapmodel: 0, tag: 0, precaches: "items/airout.wav" },
  { classname: "item_ancient_head", pickup: "Pickup_AncientHead", use: null, drop: null, weaponThink: null, pickupName: "Ancient Head", pickupSound: "items/pkup.wav", worldModel: "models/items/c_head/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "i_fixme", countWidth: 2, quantity: 60, ammo: null, flags: 0, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "item_adrenaline", pickup: "Pickup_Adrenaline", use: null, drop: null, weaponThink: null, pickupName: "Adrenaline", pickupSound: "items/pkup.wav", worldModel: "models/items/adrenal/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "p_adrenaline", countWidth: 2, quantity: 60, ammo: null, flags: 0, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "item_bandolier", pickup: "Pickup_Bandolier", use: null, drop: null, weaponThink: null, pickupName: "Bandolier", pickupSound: "items/pkup.wav", worldModel: "models/items/band/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "p_bandolier", countWidth: 2, quantity: 60, ammo: null, flags: 0, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "item_pack", pickup: "Pickup_Pack", use: null, drop: null, weaponThink: null, pickupName: "Ammo Pack", pickupSound: "items/pkup.wav", worldModel: "models/items/pack/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "i_pack", countWidth: 2, quantity: 180, ammo: null, flags: 0, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "key_data_cd", pickup: "Pickup_Key", use: null, drop: "Drop_General", weaponThink: null, pickupName: "Data CD", pickupSound: "items/pkup.wav", worldModel: "models/items/keys/data_cd/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "k_datacd", countWidth: 2, quantity: 0, ammo: null, flags: IT_STAY_COOP | IT_KEY, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "key_power_cube", pickup: "Pickup_Key", use: null, drop: "Drop_General", weaponThink: null, pickupName: "Power Cube", pickupSound: "items/pkup.wav", worldModel: "models/items/keys/power/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "k_powercube", countWidth: 2, quantity: 0, ammo: null, flags: IT_STAY_COOP | IT_KEY, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "key_pyramid", pickup: "Pickup_Key", use: null, drop: "Drop_General", weaponThink: null, pickupName: "Pyramid Key", pickupSound: "items/pkup.wav", worldModel: "models/items/keys/pyramid/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "k_pyramid", countWidth: 2, quantity: 0, ammo: null, flags: IT_STAY_COOP | IT_KEY, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "key_data_spinner", pickup: "Pickup_Key", use: null, drop: "Drop_General", weaponThink: null, pickupName: "Data Spinner", pickupSound: "items/pkup.wav", worldModel: "models/items/keys/spinner/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "k_dataspin", countWidth: 2, quantity: 0, ammo: null, flags: IT_STAY_COOP | IT_KEY, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "key_pass", pickup: "Pickup_Key", use: null, drop: "Drop_General", weaponThink: null, pickupName: "Security Pass", pickupSound: "items/pkup.wav", worldModel: "models/items/keys/pass/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "k_security", countWidth: 2, quantity: 0, ammo: null, flags: IT_STAY_COOP | IT_KEY, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "key_blue_key", pickup: "Pickup_Key", use: null, drop: "Drop_General", weaponThink: null, pickupName: "Blue Key", pickupSound: "items/pkup.wav", worldModel: "models/items/keys/key/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "k_bluekey", countWidth: 2, quantity: 0, ammo: null, flags: IT_STAY_COOP | IT_KEY, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "key_red_key", pickup: "Pickup_Key", use: null, drop: "Drop_General", weaponThink: null, pickupName: "Red Key", pickupSound: "items/pkup.wav", worldModel: "models/items/keys/red_key/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "k_redkey", countWidth: 2, quantity: 0, ammo: null, flags: IT_STAY_COOP | IT_KEY, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "key_commander_head", pickup: "Pickup_Key", use: null, drop: "Drop_General", weaponThink: null, pickupName: "Commander's Head", pickupSound: "items/pkup.wav", worldModel: "models/monsters/commandr/head/tris.md2", worldModelFlags: EF_GIB, viewModel: null, icon: "k_comhead", countWidth: 2, quantity: 0, ammo: null, flags: IT_STAY_COOP | IT_KEY, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "key_airstrike_target", pickup: "Pickup_Key", use: null, drop: "Drop_General", weaponThink: null, pickupName: "Airstrike Marker", pickupSound: "items/pkup.wav", worldModel: "models/items/keys/target/tris.md2", worldModelFlags: EF_ROTATE, viewModel: null, icon: "i_airstrike", countWidth: 2, quantity: 0, ammo: null, flags: IT_STAY_COOP | IT_KEY, weapmodel: 0, tag: 0, precaches: "" },
  { classname: "item_health", pickup: "Pickup_Health", use: null, drop: null, weaponThink: null, pickupName: "Health", pickupSound: "items/pkup.wav", worldModel: "models/items/healing/medium/tris.md2", worldModelFlags: 0, viewModel: null, icon: "i_health", countWidth: 3, quantity: 10, ammo: null, flags: 0, weapmodel: 0, tag: 0, precaches: "items/s_health.wav items/n_health.wav items/l_health.wav items/m_health.wav" },
  { classname: "item_health_small", pickup: "Pickup_Health", use: null, drop: null, weaponThink: null, pickupName: "Health", pickupSound: "items/pkup.wav", worldModel: "models/items/healing/stimpack/tris.md2", worldModelFlags: 0, viewModel: null, icon: "i_health", countWidth: 3, quantity: 2, ammo: null, flags: 0, weapmodel: 0, tag: 0, precaches: "items/s_health.wav items/n_health.wav items/l_health.wav items/m_health.wav" },
  { classname: "item_health_large", pickup: "Pickup_Health", use: null, drop: null, weaponThink: null, pickupName: "Health", pickupSound: "items/pkup.wav", worldModel: "models/items/healing/large/tris.md2", worldModelFlags: 0, viewModel: null, icon: "i_health", countWidth: 3, quantity: 25, ammo: null, flags: 0, weapmodel: 0, tag: 0, precaches: "items/s_health.wav items/n_health.wav items/l_health.wav items/m_health.wav" },
  { classname: "item_health_mega", pickup: "Pickup_Health", use: null, drop: null, weaponThink: null, pickupName: "Health", pickupSound: "items/pkup.wav", worldModel: "models/items/mega_h/tris.md2", worldModelFlags: 0, viewModel: null, icon: "i_health", countWidth: 3, quantity: 100, ammo: null, flags: 0, weapmodel: 0, tag: 0, precaches: "items/s_health.wav items/n_health.wav items/l_health.wav items/m_health.wav" }
] as const;

const itemlist: readonly GameItemDefinition[] = rawItemlist.map((item, index) => ({
  index: index + 1,
  ...item
}));

/**
 * Original name: FindItemByClassname
 * Source: game/g_items.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Finds one item definition by its entity classname.
 */
export function FindItemByClassname(classname: string): GameItemDefinition | null {
  if (
    classname === "item_health" ||
    classname === "item_health_small" ||
    classname === "item_health_large" ||
    classname === "item_health_mega"
  ) {
    return null;
  }

  for (const item of itemlist) {
    if (item.classname === classname) {
      return item;
    }
  }

  return null;
}

/**
 * Original name: GetItemByIndex
 * Source: game/g_items.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Returns one item definition from the stable Quake II itemlist index space.
 */
export function GetItemByIndex(index: number): GameItemDefinition | null {
  if (index <= 0 || index > itemlist.length) {
    return null;
  }

  return itemlist[index - 1] ?? null;
}

/**
 * Original name: FindItem
 * Source: game/g_items.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Finds one item definition by its pickup name.
 */
export function FindItem(pickupName: string): GameItemDefinition | null {
  for (const item of itemlist) {
    if (item.pickupName === pickupName) {
      return item;
    }
  }

  return null;
}

/**
 * Original name: InitItems
 * Source: game/g_items.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Returns the Quake II item count excluding the null sentinel entry.
 */
export function InitItems(): number {
  return itemlist.length;
}

/**
 * Original name: SetItemNames
 * Source: game/g_items.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Exposes the pickup-name list in original itemlist order for later configstring wiring.
 */
export function SetItemNames(): string[] {
  return itemlist.map((item) => item.pickupName);
}

/**
 * Original name: PrecacheItem
 * Source: game/g_items.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Registers the visible asset references used by one item definition.
 */
export function PrecacheItem(runtime: GameRuntime, item: GameItemDefinition): void {
  registerGameModel(runtime, item.worldModel);

  if (item.pickupSound) {
    registerGameSound(runtime, item.pickupSound);
  }

  if (item.icon) {
    registerGameImage(runtime, item.icon);
  }

  for (const assetPath of item.precaches.split(/\s+/).filter((value) => value.length > 0)) {
    if (assetPath.endsWith(".md2") || assetPath.endsWith(".sp2")) {
      registerGameModel(runtime, assetPath);
      continue;
    }
    if (assetPath.endsWith(".wav")) {
      registerGameSound(runtime, assetPath);
      continue;
    }
    if (assetPath.endsWith(".pcx")) {
      registerGameImage(runtime, assetPath);
    }
  }
}

/**
 * Original name: droptofloor
 * Source: game/g_items.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Finalizes one item entity after the original delayed spawn window.
 *
 * Porting notes:
 * - Uses the local collision bridge when available.
 * - Keeps the original delayed-link structure even though pickup gameplay remains to be ported.
 */
export function droptofloor(ent: GameEntity, runtime: GameRuntime): void {
  ent.mins = [-15, -15, -15];
  ent.maxs = [15, 15, 15];

  const modelPath = ent.model ?? ent.itemWorldModel;
  if (modelPath) {
    ent.s.modelindex = registerGameModel(runtime, modelPath);
  }

  ent.solid = SOLID_TRIGGER;
  ent.movetype = MOVETYPE_TOSS;

  if (runtime.collision) {
    const dest: [number, number, number] = [ent.origin[0], ent.origin[1], ent.origin[2] - 128];
    const trace = runtime.collision.trace(ent.origin, ent.mins, ent.maxs, dest, ent, MASK_SOLID);
    if (trace.startsolid) {
      freeGameEntity(runtime, ent);
      return;
    }

    ent.origin = [...trace.endpos];
  }

  if ((ent.spawnflags & ITEM_NO_TOUCH) !== 0) {
    ent.solid = SOLID_NOT;
    ent.s.effects &= ~EF_ROTATE;
    ent.s.renderfx &= ~RF_GLOW;
  }

  if ((ent.spawnflags & ITEM_TRIGGER_SPAWN) !== 0) {
    ent.solid = SOLID_NOT;
    ent.svflags |= SVF_NOCLIENT;
  }

  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: SpawnItem
 * Source: game/g_items.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Schedules one world item for delayed floor placement and initializes its visible render state.
 *
 * Porting notes:
 * - Focuses on the spawn-time visual fields needed by later client/entity rendering phases.
 */
export function SpawnItem(ent: GameEntity, item: GameItemDefinition, runtime: GameRuntime): void {
  PrecacheItem(runtime, item);

  ent.itemIndex = item.index;
  ent.itemClassname = item.classname;
  ent.itemPickupName = item.pickupName;
  ent.itemWorldModel = ent.model ?? item.worldModel;
  ent.itemWorldModelFlags = item.worldModelFlags;
  ent.nextthink = runtime.time + 2 * FRAMETIME;
  ent.think = droptofloor;
  ent.s.effects = item.worldModelFlags;
  ent.s.renderfx = RF_GLOW;

  if (ent.model) {
    registerGameModel(runtime, ent.model);
  }
}

/**
 * Original name: SP_item_health
 * Source: game/g_items.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the medium health pickup.
 */
export function SP_item_health(self: GameEntity, runtime: GameRuntime): void {
  self.model = "models/items/healing/medium/tris.md2";
  self.count = 10;
  const item = FindItem("Health");
  if (item) {
    SpawnItem(self, item, runtime);
  }
  registerGameSound(runtime, "items/n_health.wav");
}

/**
 * Original name: SP_item_health_small
 * Source: game/g_items.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the small stimpack health pickup.
 */
export function SP_item_health_small(self: GameEntity, runtime: GameRuntime): void {
  self.model = "models/items/healing/stimpack/tris.md2";
  self.count = 2;
  const item = FindItem("Health");
  if (item) {
    SpawnItem(self, item, runtime);
  }
  self.style = HEALTH_IGNORE_MAX;
  registerGameSound(runtime, "items/s_health.wav");
}

/**
 * Original name: SP_item_health_large
 * Source: game/g_items.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the large health pickup.
 */
export function SP_item_health_large(self: GameEntity, runtime: GameRuntime): void {
  self.model = "models/items/healing/large/tris.md2";
  self.count = 25;
  const item = FindItem("Health");
  if (item) {
    SpawnItem(self, item, runtime);
  }
  registerGameSound(runtime, "items/l_health.wav");
}

/**
 * Original name: SP_item_health_mega
 * Source: game/g_items.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the mega-health pickup.
 */
export function SP_item_health_mega(self: GameEntity, runtime: GameRuntime): void {
  self.model = "models/items/mega_h/tris.md2";
  self.count = 100;
  const item = FindItem("Health");
  if (item) {
    SpawnItem(self, item, runtime);
  }
  self.style = HEALTH_IGNORE_MAX | HEALTH_TIMED;
  registerGameSound(runtime, "items/m_health.wav");
}
