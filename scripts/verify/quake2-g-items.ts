/**
 * File: quake2-g-items.ts
 * Purpose: Verify the gameplay-side pickup, ammo, respawn and drop behaviors ported from `game/g_items.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for the `g_items.ts` runtime behavior.
 *
 * Dependencies:
 * - packages/game
 */

import {
  Add_Ammo,
  ArmorIndex,
  FL_POWER_ARMOR,
  FRAMETIME,
  FindItem,
  InitItems,
  Pickup_Health,
  Pickup_Armor,
  PowerArmorType,
  SetRespawn,
  SpawnItem,
  Touch_Item,
  Use_PowerArmor,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  drainGameSoundEvents,
  linkGameEntity,
  runPendingThinks,
  spawnGameEntity
} from "../../packages/game/src/index.js";
import { POWER_ARMOR_SCREEN, POWER_ARMOR_SHIELD } from "../../packages/game/src/g_local.js";
import { CS_ITEMS, STAT_PICKUP_ICON, STAT_PICKUP_STRING, entity_event_t } from "../../packages/qcommon/src/index.js";
import type { GameEntity, GameRuntime } from "../../packages/game/src/index.js";

main();

function main(): void {
  verifyAddAmmoCapsToMax();
  verifySetRespawnRoundTrip();
  verifyTouchHealthPickup();
  verifyTouchHealthPickupUsesItemPath();
  verifyTouchAmmoPickupUsesItemPath();
  verifyTouchWeaponPickupUsesWeaponPath();
  verifyArmorAndPowerArmorIndices();
  verifyUsePowerArmorRequiresCells();
  verifyCoopPowerCubeSpawnFlags();
  verifyInvalidSpawnFlagsAreClearedForNonPowerCube();

  console.log("Verification g_items - pickup/drop/respawn gameplay OK");
}

function verifyAddAmmoCapsToMax(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const bullets = requireItem("Bullets");

  player.client!.pers.max_bullets = 200;
  player.client!.pers.inventory[bullets.index] = 190;

  const accepted = Add_Ammo(player, bullets, 25, runtime);
  assertBoolean(accepted, true, "Add_Ammo accepts partial bullet refill");
  assertNumber(player.client!.pers.inventory[bullets.index], 200, "Add_Ammo caps bullets to max_bullets");
}

function verifySetRespawnRoundTrip(): void {
  const runtime = createHarnessRuntime();
  const entity = spawnGameEntity(runtime);
  const item = requireItem("Shells");

  SpawnItem(entity, item, runtime);
  entity.think?.(entity, runtime);
  SetRespawn(entity, 5, runtime);

  assertNumber(entity.solid, 0, "SetRespawn hides the item");

  runPendingThinks(runtime, runtime.time + 5);
  assertNumber(entity.solid, 1, "DoRespawn restores SOLID_TRIGGER");
  assertNumber(entity.s.event, entity_event_t.EV_ITEM_RESPAWN, "DoRespawn emits EV_ITEM_RESPAWN");
}

function verifyTouchHealthPickup(): void {
  const runtime = createHarnessRuntime();
  const itemEntity = spawnGameEntity(runtime);
  const player = createPlayer(runtime);

  player.health = 60;
  player.max_health = 100;
  itemEntity.item = requireItem("Health");
  itemEntity.count = 25;
  itemEntity.style = 0;
  itemEntity.spawnflags = 0;

  const taken = Pickup_Health(itemEntity, player, runtime);
  assertBoolean(taken, true, "Pickup_Health accepts missing health");
  assertNumber(player.health, 85, "Pickup_Health adds count");
}

function verifyTouchHealthPickupUsesItemPath(): void {
  const runtime = createHarnessRuntime();
  const itemEntity = spawnGameEntity(runtime);
  const player = createPlayer(runtime);
  const health = requireItem("Health");

  player.health = 40;
  itemEntity.item = health;
  itemEntity.count = 25;
  itemEntity.spawnflags = 0;
  itemEntity.touch = Touch_Item;
  itemEntity.solid = 1;
  linkGameEntity(runtime, itemEntity);

  Touch_Item(itemEntity, player, runtime);

  assertNumber(player.health, 65, "Touch_Item routes health pickups to Pickup_Health");
  assertNumber(itemEntity.solid, 0, "Touch_Item hides a taken health pickup");
  assertNumber(player.client!.ps.stats[STAT_PICKUP_STRING], CS_ITEMS + health.index, "Touch_Item writes the health pickup string stat");
}

function verifyTouchAmmoPickupUsesItemPath(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const ammoEntity = spawnGameEntity(runtime);
  const shells = requireItem("Shells");

  player.client!.pers.inventory[shells.index] = 5;
  ammoEntity.item = shells;
  ammoEntity.spawnflags = 0;
  ammoEntity.classname = shells.classname;
  ammoEntity.touch = Touch_Item;
  ammoEntity.solid = 1;
  linkGameEntity(runtime, ammoEntity);

  Touch_Item(ammoEntity, player, runtime);

  assertNumber(player.client!.pers.inventory[shells.index], 15, "Touch_Item routes ammo pickups to Pickup_Ammo");
  assertNumber(ammoEntity.solid, 0, "Touch_Item hides a taken ammo pickup");
  assertNumber(player.client!.ps.stats[STAT_PICKUP_ICON] > 0 ? 1 : 0, 1, "Touch_Item writes the ammo pickup icon stat");
  assertNumber(player.client!.ps.stats[STAT_PICKUP_STRING], CS_ITEMS + shells.index, "Touch_Item writes the ammo pickup string stat");
}

function verifyTouchWeaponPickupUsesWeaponPath(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const weaponEntity = spawnGameEntity(runtime);
  const weapon = requireItem("Shotgun");
  const shells = requireItem("Shells");

  player.client!.pers.weapon = FindItem("Blaster");
  player.client!.pers.inventory[weapon.index] = 0;
  player.client!.pers.inventory[shells.index] = 0;

  weaponEntity.item = weapon;
  weaponEntity.spawnflags = 0;
  weaponEntity.classname = weapon.classname;
  weaponEntity.touch = Touch_Item;
  weaponEntity.solid = 1;
  linkGameEntity(runtime, weaponEntity);

  Touch_Item(weaponEntity, player, runtime);

  assertNumber(player.client!.pers.inventory[weapon.index], 1, "Touch_Item routes weapon pickups to Pickup_Weapon");
  assertNumber(player.client!.pers.inventory[shells.index], shells.quantity, "Weapon pickup grants default ammo through Add_Ammo");
  assertNumber(weaponEntity.solid, 0, "Touch_Item hides a taken world weapon");
}

function verifyArmorAndPowerArmorIndices(): void {
  InitItems();

  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const body = requireItem("Body Armor");
  const combat = requireItem("Combat Armor");
  const jacket = requireItem("Jacket Armor");
  const shard = requireItem("Armor Shard");
  const powerScreen = requireItem("Power Screen");
  const powerShield = requireItem("Power Shield");

  assertNumber(body.index, 1, "Body Armor index must match the original itemlist slot");
  assertNumber(combat.index, 2, "Combat Armor index must match the original itemlist slot");
  assertNumber(jacket.index, 3, "Jacket Armor index must match the original itemlist slot");
  assertNumber(powerScreen.index, 5, "Power Screen index must match the original itemlist slot");
  assertNumber(powerShield.index, 6, "Power Shield index must match the original itemlist slot");

  player.client!.pers.inventory[body.index] = 100;
  player.client!.pers.inventory[combat.index] = 50;
  player.client!.pers.inventory[jacket.index] = 25;
  assertNumber(ArmorIndex(player), jacket.index, "ArmorIndex must preserve jacket/combat/body priority order");

  const shardEntity = spawnGameEntity(runtime);
  const shardPlayer = createPlayer(runtime);
  shardEntity.item = shard;
  Pickup_Armor(shardEntity, shardPlayer, runtime);
  assertNumber(shardPlayer.client!.pers.inventory[jacket.index], 2, "Armor shards must seed jacket armor when no armor is held");

  player.flags |= FL_POWER_ARMOR;
  player.client!.pers.inventory[powerScreen.index] = 1;
  assertNumber(PowerArmorType(player), POWER_ARMOR_SCREEN, "PowerArmorType must detect power screen when active");
  player.client!.pers.inventory[powerShield.index] = 1;
  assertNumber(PowerArmorType(player), POWER_ARMOR_SHIELD, "PowerArmorType must prefer power shield over power screen");
}

function verifyUsePowerArmorRequiresCells(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const powerShield = requireItem("Power Shield");
  const cells = requireItem("Cells");

  player.client!.pers.inventory[powerShield.index] = 1;
  player.client!.pers.inventory[cells.index] = 0;
  Use_PowerArmor(player, powerShield, runtime);
  assertNumber(player.flags, 0, "Use_PowerArmor refuses activation without cells");

  player.client!.pers.inventory[cells.index] = 5;
  Use_PowerArmor(player, powerShield, runtime);
  assertBoolean(player.flags !== 0, true, "Use_PowerArmor enables power armor with cells");

  const events = drainGameSoundEvents(runtime);
  assertBoolean(events.some((event) => event.soundPath === "misc/power1.wav"), true, "Use_PowerArmor queues activation sound");
}

function verifyCoopPowerCubeSpawnFlags(): void {
  const runtime = createHarnessRuntime();
  runtime.coop = true;

  const firstCube = spawnGameEntity(runtime);
  firstCube.classname = "key_power_cube";
  SpawnItem(firstCube, requireItem("Power Cube"), runtime);
  assertNumber(firstCube.spawnflags & 0x0000ff00, 1 << 8, "First coop power cube gets the first level bit");
  assertNumber(runtime.power_cubes, 1, "First coop power cube increments runtime power_cubes");

  const secondCube = spawnGameEntity(runtime);
  secondCube.classname = "key_power_cube";
  SpawnItem(secondCube, requireItem("Power Cube"), runtime);
  assertNumber(secondCube.spawnflags & 0x0000ff00, 1 << 9, "Second coop power cube gets the next level bit");
  assertNumber(runtime.power_cubes, 2, "Second coop power cube increments runtime power_cubes");
}

function verifyInvalidSpawnFlagsAreClearedForNonPowerCube(): void {
  const runtime = createHarnessRuntime();
  const entity = spawnGameEntity(runtime);
  entity.classname = "ammo_shells";
  entity.spawnflags = 0x1234;

  SpawnItem(entity, requireItem("Shells"), runtime);
  assertNumber(entity.spawnflags, 0, "SpawnItem clears invalid spawnflags on non-power-cube items");
}

function createHarnessRuntime(): GameRuntime {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}

function createPlayer(runtime: GameRuntime): GameEntity {
  const player = spawnGameEntity(runtime);
  player.classname = "player";
  const client = attachGameClient(player);
  client.pers.max_bullets = 200;
  client.pers.max_shells = 100;
  client.pers.max_rockets = 50;
  client.pers.max_grenades = 50;
  client.pers.max_cells = 200;
  client.pers.max_slugs = 50;
  player.health = 100;
  player.max_health = 100;
  return player;
}

function requireItem(name: string) {
  const item = FindItem(name);
  if (!item) {
    throw new Error(`Item introuvable: ${name}`);
  }
  return item;
}

function assertNumber(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}

function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}
