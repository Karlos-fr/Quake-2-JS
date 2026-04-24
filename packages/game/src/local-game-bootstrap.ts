/**
 * File: local-game-bootstrap.ts
 * Purpose: Hold the non-web local gameplay bootstrap helpers used to drive the current standalone Quake II runtime loop.
 *
 * This file is not a direct source port.
 * It is a gameplay-side bootstrap layer that reuses already ported weapon and item code without living in a browser adapter.
 *
 * Dependencies:
 * - packages/game/src/p_weapon.ts
 * - packages/game/src/g_weapon.ts
 * - packages/game/src/g_items.ts
 */

import { DF_INFINITE_AMMO, multicast_t, type vec3_t } from "../../qcommon/src/index.js";
import {
  attachGameClient,
  emitGameTempEntity,
  emitGameSound,
  emitPlayerMuzzleFlash,
  linkGameEntity,
  refreshEntitySpatialState,
  spawnGameEntity,
  type GameClient,
  type GameEntity,
  type GameRuntime
} from "./runtime.js";
import {
  fire_bfg,
  fire_blaster,
  fire_bullet,
  fire_grenade,
  fire_grenade2,
  fire_rail,
  fire_rocket,
  fire_shotgun,
  type GameWeaponWorldHooks
} from "./g_weapon.js";
import {
  ChangeWeapon,
  Think_Weapon,
  type GameWeaponHooks,
  Use_Weapon,
  Weapon_BFG,
  Weapon_Blaster,
  Weapon_Chaingun,
  Weapon_Grenade,
  Weapon_GrenadeLauncher,
  Weapon_HyperBlaster,
  Weapon_Machinegun,
  Weapon_Railgun,
  Weapon_RocketLauncher,
  Weapon_Shotgun,
  Weapon_SuperShotgun
} from "./p_weapon.js";
import { Add_Ammo, Drop_Item, FindItem, GetAmmoItemForWeapon, SetRespawn } from "./g_items.js";

const LOCAL_PLAYER_TRIGGER_MINS: vec3_t = [-16, -16, -24];
const LOCAL_PLAYER_TRIGGER_MAXS: vec3_t = [16, 16, 32];
const LOCAL_PLAYER_VIEWHEIGHT = 22;

/**
 * Category: New
 * Purpose: Preserve the local browser/demo weapon-slot mapping outside the web adapter.
 *
 * Constraints:
 * - Must keep the currently tested weapon ordering explicit.
 */
export type LocalWeaponSlotKey =
  | "Backquote"
  | "Digit1"
  | "Digit2"
  | "Digit3"
  | "Digit4"
  | "Digit5"
  | "Digit6"
  | "Digit7"
  | "Digit8"
  | "Digit9"
  | "Digit0";

/**
 * Category: New
 * Purpose: Map the current local weapon-slot keys to Quake II pickup names.
 *
 * Constraints:
 * - Must stay aligned with the currently bootstrapped standalone weapon loop.
 */
export const LOCAL_WEAPON_SLOTS: Record<LocalWeaponSlotKey, string> = {
  Backquote: "Blaster",
  Digit1: "Shotgun",
  Digit2: "Super Shotgun",
  Digit3: "Machinegun",
  Digit4: "Chaingun",
  Digit5: "Grenades",
  Digit6: "Grenade Launcher",
  Digit7: "Rocket Launcher",
  Digit8: "HyperBlaster",
  Digit9: "Railgun",
  Digit0: "BFG10K"
};

const LOCAL_AMMO_GRANTS: Array<[string, number]> = [
  ["Shells", 50],
  ["Bullets", 200],
  ["Grenades", 25],
  ["Rockets", 50],
  ["Cells", 200],
  ["Slugs", 50]
];

/**
 * Category: New
 * Purpose: Describe one local inventory grant used by the current standalone bootstrap.
 */
export interface LocalInventoryGrant {
  index: number;
  count: number;
}

/**
 * Category: New
 * Purpose: Describe one item configstring payload derived from the current local standalone item bootstrap.
 */
export interface LocalItemStringEntry {
  index: number;
  pickupName: string;
}

/**
 * Category: New
 * Purpose: Describe the local weapon/bootstrap data shared between gameplay seeding and the client HUD bootstrap.
 */
export interface LocalWeaponBootstrapData {
  imageNames: string[];
  inventory: LocalInventoryGrant[];
  itemStrings: LocalItemStringEntry[];
  selectedWeaponIndex: number;
  selectedWeaponIcon: string | null;
  selectedAmmoIndex: number;
  selectedAmmoIcon: string | null;
  selectedAmmoCount: number;
}

/**
 * Category: New
 * Purpose: Reuse the currently ported `p_weapon.c` and `g_weapon.c` routines as the standalone gameplay weapon hook table.
 *
 * Constraints:
 * - Must keep still-explicit gameplay hook wiring outside the web adapter.
 */
export const LOCAL_GAME_WEAPON_HOOKS: GameWeaponHooks = {
  Add_Ammo,
  Drop_Item,
  SetRespawn,
  emitPlayerMuzzleFlash: (ent, weapon, runtime) => {
    emitPlayerMuzzleFlash(runtime, ent, weapon);
  },
  playWeaponSound: (ent, soundPath, _channel, runtime) => {
    emitGameSound(runtime, ent, soundPath);
  },
  fire_bfg: (ent, start, dir, damage, speed, damageRadius, runtime) =>
    fire_bfg(ent, start, dir, damage, speed, damageRadius, runtime, LOCAL_GAME_WORLD_WEAPON_HOOKS),
  fire_blaster: (ent, start, dir, damage, speed, effect, hyper, runtime) =>
    fire_blaster(ent, start, dir, damage, speed, effect, hyper, runtime, LOCAL_GAME_WORLD_WEAPON_HOOKS),
  fire_bullet: (ent, start, aimdir, damage, kick, hspread, vspread, mod, runtime) =>
    fire_bullet(ent, start, aimdir, damage, kick, hspread, vspread, mod, runtime, LOCAL_GAME_WORLD_WEAPON_HOOKS),
  fire_grenade: (ent, start, dir, damage, speed, timer, damageRadius, runtime) =>
    fire_grenade(ent, start, dir, damage, speed, timer, damageRadius, runtime, LOCAL_GAME_WORLD_WEAPON_HOOKS),
  fire_grenade2: (ent, start, dir, damage, speed, timer, damageRadius, held, runtime) =>
    fire_grenade2(ent, start, dir, damage, speed, timer, damageRadius, held, runtime, LOCAL_GAME_WORLD_WEAPON_HOOKS),
  fire_rail: (ent, start, dir, damage, kick, runtime) =>
    fire_rail(ent, start, dir, damage, kick, runtime, LOCAL_GAME_WORLD_WEAPON_HOOKS),
  fire_rocket: (ent, start, dir, damage, speed, damageRadius, radiusDamage, runtime) =>
    fire_rocket(ent, start, dir, damage, speed, damageRadius, radiusDamage, runtime, LOCAL_GAME_WORLD_WEAPON_HOOKS),
  fire_shotgun: (ent, start, aimdir, damage, kick, hspread, vspread, count, mod, runtime) =>
    fire_shotgun(ent, start, aimdir, damage, kick, hspread, vspread, count, mod, runtime, LOCAL_GAME_WORLD_WEAPON_HOOKS),
  weaponThink: {
    Weapon_Blaster,
    Weapon_Shotgun,
    Weapon_SuperShotgun,
    Weapon_Machinegun,
    Weapon_Chaingun,
    Weapon_Grenade,
    Weapon_GrenadeLauncher,
    Weapon_RocketLauncher,
    Weapon_HyperBlaster,
    Weapon_Railgun,
    Weapon_BFG
  }
};

const LOCAL_GAME_WORLD_WEAPON_HOOKS: GameWeaponWorldHooks = {
  emitTempEntity: (event, payload, runtime) => {
    const origin = readTempEntityOrigin(payload) ?? [0, 0, 0];
    emitGameTempEntity(runtime, event, origin, multicast_t.MULTICAST_PVS, payload);
  }
};

function readTempEntityOrigin(payload: Record<string, unknown>): vec3_t | null {
  const origin = payload.origin;
  if (isVec3(origin)) {
    return [...origin];
  }

  const end = payload.end;
  if (isVec3(end)) {
    return [...end];
  }

  const start = payload.start;
  if (isVec3(start)) {
    return [...start];
  }

  return null;
}

function isVec3(value: unknown): value is vec3_t {
  return Array.isArray(value)
    && value.length === 3
    && value.every((component) => typeof component === "number" && Number.isFinite(component));
}

/**
 * Category: New
 * Purpose: Seed one local gameplay player with the currently bootstrapped standalone inventory and initial weapon.
 *
 * Constraints:
 * - Must rely on the already ported item and weapon code.
 */
export function seedLocalWeaponInventory(
  player: GameEntity,
  client: GameClient,
  runtime: GameRuntime,
  hooks: GameWeaponHooks = LOCAL_GAME_WEAPON_HOOKS
): void {
  runtime.dmflags |= DF_INFINITE_AMMO;
  const bootstrap = buildLocalWeaponBootstrapData();

  for (const entry of bootstrap.inventory) {
    client.pers.inventory[entry.index] = entry.count;
  }

  const initialWeapon = FindItem("Shotgun") ?? FindItem("Machinegun") ?? FindItem("Grenades");
  if (initialWeapon) {
    client.newweapon = initialWeapon;
    ChangeWeapon(player, runtime, hooks);
  }
}

/**
 * Category: New
 * Purpose: Create the standalone local gameplay player proxy used by the browser/runtime loop.
 *
 * Constraints:
 * - Must preserve the original player trigger hull dimensions.
 * - Must seed the same local bootstrap inventory as the current standalone path.
 */
export function createLocalGameplayPlayer(runtime: GameRuntime): GameEntity {
  const player = spawnGameEntity(runtime);
  player.classname = "player";
  const client = attachGameClient(player);
  player.health = 100;
  player.viewheight = LOCAL_PLAYER_VIEWHEIGHT;
  player.mins = [...LOCAL_PLAYER_TRIGGER_MINS];
  player.maxs = [...LOCAL_PLAYER_TRIGGER_MAXS];
  seedLocalWeaponInventory(player, client, runtime);
  refreshEntitySpatialState(player);
  linkGameEntity(runtime, player);
  return player;
}

/**
 * Category: New
 * Purpose: Request one local weapon switch from the standalone controls using the original `Use_Weapon` path.
 *
 * Constraints:
 * - Must ignore unknown or unavailable weapons cleanly.
 */
export function selectLocalWeapon(player: GameEntity, weaponName: string, runtime: GameRuntime): number | null {
  const weapon = FindItem(weaponName);
  const client = player.client;
  if (!weapon || !client || client.pers.inventory[weapon.index] <= 0) {
    return null;
  }

  Use_Weapon(player, weapon, runtime);
  return weapon.index;
}

/**
 * Category: New
 * Purpose: Keep the standalone browser demo inventory in a weapon-ready state with direct slot access and effectively infinite ammo.
 *
 * Constraints:
 * - Must stay local-demo-only and avoid changing the general gameplay weapon rules.
 */
export function refillLocalDemoInventory(player: GameEntity, runtime: GameRuntime): void {
  const client = player.client;
  if (!client) {
    return;
  }

  runtime.dmflags |= DF_INFINITE_AMMO;

  for (const weaponName of Object.values(LOCAL_WEAPON_SLOTS)) {
    const weapon = FindItem(weaponName);
    if (!weapon) {
      continue;
    }

    client.pers.inventory[weapon.index] = Math.max(1, client.pers.inventory[weapon.index] ?? 0);
  }

  for (const [ammoName, amount] of LOCAL_AMMO_GRANTS) {
    const ammo = FindItem(ammoName);
    if (!ammo) {
      continue;
    }

    client.pers.inventory[ammo.index] = Math.max(amount, client.pers.inventory[ammo.index] ?? 0);
  }
}

/**
 * Category: New
 * Purpose: Force one local demo weapon slot switch while keeping the browser demo inventory primed for immediate use.
 *
 * Constraints:
 * - Must preserve the original `Use_Weapon` switch path after topping up the needed local inventory.
 */
export function selectLocalDemoWeapon(player: GameEntity, weaponName: string, runtime: GameRuntime): number | null {
  refillLocalDemoInventory(player, runtime);
  return selectLocalWeapon(player, weaponName, runtime);
}

/**
 * Category: New
 * Purpose: Build the current standalone weapon bootstrap payload shared by gameplay and client bootstrap code.
 *
 * Constraints:
 * - Must stay aligned with `LOCAL_WEAPON_SLOTS` and the local ammo grants.
 */
export function buildLocalWeaponBootstrapData(): LocalWeaponBootstrapData {
  const inventory = new Map<number, number>();
  const itemStrings = new Map<number, string>();
  const imageNames = new Set<string>(["i_health", "i_combatarmor"]);

  for (const weaponName of Object.values(LOCAL_WEAPON_SLOTS)) {
    const weapon = FindItem(weaponName);
    if (!weapon) {
      continue;
    }

    inventory.set(weapon.index, 1);
    itemStrings.set(weapon.index, weapon.pickupName);
    if (weapon.icon) {
      imageNames.add(weapon.icon);
    }

    const ammo = GetAmmoItemForWeapon(weapon);
    if (!ammo) {
      continue;
    }

    itemStrings.set(ammo.index, ammo.pickupName);
    if (ammo.icon) {
      imageNames.add(ammo.icon);
    }
  }

  for (const [ammoName, amount] of LOCAL_AMMO_GRANTS) {
    const ammo = FindItem(ammoName);
    if (!ammo) {
      continue;
    }

    inventory.set(ammo.index, amount);
    itemStrings.set(ammo.index, ammo.pickupName);
    if (ammo.icon) {
      imageNames.add(ammo.icon);
    }
  }

  const selectedWeapon = FindItem("Shotgun");
  const selectedAmmo = GetAmmoItemForWeapon(selectedWeapon);
  if (selectedWeapon?.icon) {
    imageNames.add(selectedWeapon.icon);
  }
  if (selectedAmmo?.icon) {
    imageNames.add(selectedAmmo.icon);
  }

  return {
    imageNames: [...imageNames],
    inventory: [...inventory.entries()].map(([index, count]) => ({ index, count })),
    itemStrings: [...itemStrings.entries()].map(([index, pickupName]) => ({ index, pickupName })),
    selectedWeaponIndex: selectedWeapon?.index ?? 0,
    selectedWeaponIcon: selectedWeapon?.icon ?? null,
    selectedAmmoIndex: selectedAmmo?.index ?? 0,
    selectedAmmoIcon: selectedAmmo?.icon ?? null,
    selectedAmmoCount: selectedAmmo ? inventory.get(selectedAmmo.index) ?? 0 : 0
  };
}

/**
 * Category: New
 * Purpose: Advance the current standalone gameplay weapon state machine through the already ported `p_weapon.c` path.
 *
 * Constraints:
 * - Must keep the local hook table explicit until the full standalone/game loop is better centralized.
 */
export function thinkLocalWeapon(
  player: GameEntity,
  runtime: GameRuntime,
  hooks: GameWeaponHooks = LOCAL_GAME_WEAPON_HOOKS
): void {
  Think_Weapon(player, runtime, hooks);
}
