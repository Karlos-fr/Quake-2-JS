/**
 * File: quake2-local-demo-weapons.ts
 * Purpose: Verify the standalone browser-demo weapon shortcuts and infinite-ammo refill helpers.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the local demo weapon bootstrap.
 *
 * Dependencies:
 * - packages/game
 */

import {
  ChangeWeapon,
  FindItem,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  refillLocalDemoInventory,
  selectLocalDemoWeapon,
  spawnGameEntity,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { DF_INFINITE_AMMO } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyRefillLocalDemoInventoryRestoresWeaponsAndAmmo();
  verifySelectLocalDemoWeaponSwitchesEvenAfterAmmoDepletion();
  console.log("quake2-local-demo-weapons: ok");
}

function verifyRefillLocalDemoInventoryRestoresWeaponsAndAmmo(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const client = player.client!;
  const chaingun = requireItem("Chaingun");
  const bullets = requireItem("Bullets");

  client.pers.inventory[chaingun.index] = 0;
  client.pers.inventory[bullets.index] = 0;

  refillLocalDemoInventory(player, runtime);

  assertNumber(runtime.dmflags & DF_INFINITE_AMMO, DF_INFINITE_AMMO, "demo runtime must enable infinite ammo");
  assertNumber(client.pers.inventory[chaingun.index], 1, "demo refill must restore missing weapons");
  assertNumber(client.pers.inventory[bullets.index], 200, "demo refill must restore bullet stock");
}

function verifySelectLocalDemoWeaponSwitchesEvenAfterAmmoDepletion(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const client = player.client!;
  const railgun = requireItem("Railgun");
  const slugs = requireItem("Slugs");

  client.pers.weapon = requireItem("Blaster");
  client.pers.inventory[railgun.index] = 0;
  client.pers.inventory[slugs.index] = 0;

  const selectedIndex = selectLocalDemoWeapon(player, "Railgun", runtime);
  assertNumber(selectedIndex ?? 0, railgun.index, "demo weapon shortcut must return selected railgun index");
  assertNumber(client.pers.inventory[railgun.index], 1, "demo weapon shortcut must restore railgun ownership");
  assertNumber(client.pers.inventory[slugs.index], 50, "demo weapon shortcut must restore railgun ammo");
  assertString(client.newweapon?.pickupName ?? "", "Railgun", "demo weapon shortcut must queue railgun switch");

  ChangeWeapon(player, runtime);
  assertString(client.pers.weapon?.pickupName ?? "", "Railgun", "demo weapon shortcut must activate the requested weapon");
}

function createHarnessRuntime(): GameRuntime {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}

function createPlayer(runtime: GameRuntime): GameEntity {
  const player = spawnGameEntity(runtime);
  player.classname = "player";
  player.health = 100;
  player.max_health = 100;
  attachGameClient(player);
  refillLocalDemoInventory(player, runtime);
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

function assertString(actual: string, expected: string, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}
