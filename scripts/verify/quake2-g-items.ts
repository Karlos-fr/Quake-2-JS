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
  DoRespawn,
  Drop_Item,
  FL_TEAMSLAVE,
  FL_POWER_ARMOR,
  FL_RESPAWN,
  FRAMETIME,
  FindItem,
  InitItems,
  ITEM_NO_TOUCH,
  ITEM_TRIGGER_SPAWN,
  MOVETYPE_TOSS,
  Pickup_Health,
  Pickup_Armor,
  PowerArmorType,
  SetRespawn,
  SOLID_BBOX,
  SOLID_NOT,
  SOLID_TRIGGER,
  SpawnItem,
  Touch_Item,
  Use_Item,
  Use_PowerArmor,
  SVF_NOCLIENT,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  drainGameSoundEvents,
  droptofloor,
  linkGameEntity,
  runPendingThinks,
  spawnGameEntity
} from "../../packages/game/src/index.js";
import { ITEM_TARGETS_USED, POWER_ARMOR_SCREEN, POWER_ARMOR_SHIELD } from "../../packages/game/src/g_local.js";
import { CS_ITEMS, EF_ROTATE, MASK_SOLID, RF_GLOW, STAT_PICKUP_ICON, STAT_PICKUP_STRING, STAT_SELECTED_ITEM, entity_event_t } from "../../packages/qcommon/src/index.js";
import { CONTENTS_SOLID } from "../../packages/qcommon/src/q_shared.js";
import type { GameEntity, GameRuntime } from "../../packages/game/src/index.js";
import type { trace_t, vec3_t } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyAddAmmoCapsToMax();
  verifySetRespawnRoundTrip();
  verifyTouchHealthPickup();
  verifyTouchHealthPickupUsesItemPath();
  verifyTouchRejectedPickupStillUsesTargets();
  verifyTouchAmmoPickupUsesItemPath();
  verifyTouchWeaponPickupUsesWeaponPath();
  verifyTouchCoopStayWeaponRemainsTouchable();
  verifyDropTempTouchAndDeathmatchFree();
  verifyDropItemPlacementAndTrace();
  verifyUseItemTriggerSpawnActivation();
  verifyDropToFloorPlacementAndFlags();
  verifyDropToFloorTeamRespawnAndStartSolid();
  verifyArmorAndPowerArmorIndices();
  verifyPickupArmorConversions();
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
  const itemEntity = spawnFreeableEntity(runtime);
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
  const itemEntity = spawnFreeableEntity(runtime);
  const player = createPlayer(runtime);
  const health = requireItem("Health");

  player.health = 40;
  itemEntity.item = health;
  itemEntity.count = 25;
  itemEntity.spawnflags = 0;
  itemEntity.touch = Touch_Item;
  itemEntity.solid = 1;
  player.client!.pers.selected_item = 7;
  player.client!.ps.stats[STAT_SELECTED_ITEM] = 7;
  linkGameEntity(runtime, itemEntity);

  Touch_Item(itemEntity, player, runtime);

  assertNumber(player.health, 65, "Touch_Item routes health pickups to Pickup_Health");
  assertNumber(itemEntity.solid, 0, "Touch_Item hides a taken health pickup");
  assertNumber(itemEntity.inuse ? 1 : 0, 0, "Touch_Item frees a taken non-respawning health pickup");
  assertNumber(player.client!.ps.stats[STAT_PICKUP_STRING], CS_ITEMS + health.index, "Touch_Item writes the health pickup string stat");
  assertNumber(player.client!.pers.selected_item, 7, "Touch_Item does not select health items without a use callback");
  assertNumber(player.client!.ps.stats[STAT_SELECTED_ITEM], 7, "Touch_Item leaves selected item stat unchanged for health");

  const events = drainGameSoundEvents(runtime);
  assertBoolean(events.some((event) => event.soundPath === "items/l_health.wav"), true, "Touch_Item plays the count-specific large health sound");
}

function verifyTouchRejectedPickupStillUsesTargets(): void {
  const runtime = createHarnessRuntime();
  const itemEntity = spawnGameEntity(runtime);
  const target = spawnGameEntity(runtime);
  const player = createPlayer(runtime);
  const health = requireItem("Health");
  let useCount = 0;

  player.health = 100;
  player.max_health = 100;
  itemEntity.item = health;
  itemEntity.count = 25;
  itemEntity.target = "after_refusal";
  itemEntity.spawnflags = 0;
  itemEntity.touch = Touch_Item;
  target.targetname = "after_refusal";
  target.use = () => {
    useCount++;
  };

  Touch_Item(itemEntity, player, runtime);

  assertNumber(useCount, 1, "Touch_Item fires targets even when the pickup function returns false");
  assertNumber(itemEntity.spawnflags & ITEM_TARGETS_USED, ITEM_TARGETS_USED, "Touch_Item marks targets as used after firing");
  assertNumber(itemEntity.inuse ? 1 : 0, 1, "Touch_Item keeps an untaken item in use");
  assertNumber(player.client!.ps.stats[STAT_PICKUP_STRING], 0, "Touch_Item does not write pickup stats for rejected pickups");
}

function verifyTouchAmmoPickupUsesItemPath(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const ammoEntity = spawnFreeableEntity(runtime);
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
  assertNumber(ammoEntity.inuse ? 1 : 0, 0, "Touch_Item frees a taken non-respawning ammo pickup");
  assertNumber(player.client!.ps.stats[STAT_PICKUP_ICON] > 0 ? 1 : 0, 1, "Touch_Item writes the ammo pickup icon stat");
  assertNumber(player.client!.ps.stats[STAT_PICKUP_STRING], CS_ITEMS + shells.index, "Touch_Item writes the ammo pickup string stat");
}

function verifyTouchWeaponPickupUsesWeaponPath(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const weaponEntity = spawnFreeableEntity(runtime);
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
  assertNumber(weaponEntity.inuse ? 1 : 0, 0, "Touch_Item frees a taken non-respawning world weapon");
  assertNumber(player.client!.pers.selected_item, weapon.index, "Touch_Item selects usable weapon pickups");
  assertNumber(player.client!.ps.stats[STAT_SELECTED_ITEM], weapon.index, "Touch_Item writes selected item stat for usable pickups");
}

function verifyTouchCoopStayWeaponRemainsTouchable(): void {
  const runtime = createHarnessRuntime();
  runtime.coop = true;
  const player = createPlayer(runtime);
  const weaponEntity = spawnGameEntity(runtime);
  const weapon = requireItem("Shotgun");

  player.client!.pers.weapon = FindItem("Blaster");
  player.client!.pers.inventory[weapon.index] = 0;
  weaponEntity.item = weapon;
  weaponEntity.spawnflags = 0;
  weaponEntity.classname = weapon.classname;
  weaponEntity.touch = Touch_Item;
  weaponEntity.solid = SOLID_TRIGGER;

  Touch_Item(weaponEntity, player, runtime);

  assertNumber(player.client!.pers.inventory[weapon.index], 1, "Touch_Item grants coop stay weapon inventory");
  assertNumber(weaponEntity.inuse ? 1 : 0, 1, "Touch_Item keeps coop stay weapons in use");
  assertNumber(weaponEntity.solid, SOLID_TRIGGER, "Touch_Item leaves coop stay weapons touchable");
  assertBoolean(weaponEntity.touch === Touch_Item, true, "Touch_Item leaves coop stay weapon touch callback installed");
}

function verifyDropTempTouchAndDeathmatchFree(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  while (runtime.entities.length <= runtime.maxclients + 8) {
    spawnGameEntity(runtime);
  }
  const owner = createPlayer(runtime);
  const other = createPlayer(runtime);
  const shells = requireItem("Shells");

  owner.s.origin = [10, 20, 30];
  owner.origin = [10, 20, 30];
  owner.client!.v_angle = [0, 0, 0];
  owner.client!.pers.inventory[shells.index] = 0;
  other.client!.pers.inventory[shells.index] = 0;

  const dropped = Drop_Item(owner, shells, runtime);
  assertBoolean(dropped.owner === owner, true, "Drop_Item stores the original owner");

  dropped.touch?.(dropped, owner, runtime);
  assertNumber(owner.client!.pers.inventory[shells.index], 0, "drop_temp_touch ignores the owner");
  assertNumber(dropped.inuse ? 1 : 0, 1, "drop_temp_touch keeps the ignored drop in use");

  dropped.touch?.(dropped, other, runtime);
  assertNumber(other.client!.pers.inventory[shells.index], shells.quantity, "drop_temp_touch delegates non-owner touches to Touch_Item");
  assertNumber(dropped.inuse ? 1 : 0, 0, "Touch_Item frees picked dropped items immediately");
  assertNumber(dropped.freetime, runtime.time, "G_FreeEdict stamps the picked dropped item free time");

  const timeoutDrop = Drop_Item(owner, shells, runtime);
  runPendingThinks(runtime, runtime.time + 1);
  assertBoolean(timeoutDrop.touch === Touch_Item, true, "drop_make_touchable restores the normal Touch_Item callback");
  assertNumber(timeoutDrop.nextthink, runtime.time + 29, "drop_make_touchable schedules the original deathmatch free delay");

  runPendingThinks(runtime, runtime.time + 29);
  assertNumber(timeoutDrop.inuse ? 1 : 0, 0, "deathmatch dropped items are freed through G_FreeEdict after timeout");
  assertNumber(timeoutDrop.freetime, runtime.time, "G_FreeEdict stamps the timed-out dropped item free time");
}

function verifyDropItemPlacementAndTrace(): void {
  const runtime = createHarnessRuntime();
  const shells = requireItem("Shells");
  const tracedEnd: vec3_t = [111, 222, 333];
  const traceCalls: Array<{ start: vec3_t; mins: vec3_t; maxs: vec3_t; end: vec3_t; passent: GameEntity | null; mask: number }> = [];

  runtime.collision.trace = (start, mins, maxs, end, passent, mask) => {
    traceCalls.push({
      start: [...start],
      mins: [...mins],
      maxs: [...maxs],
      end: [...end],
      passent,
      mask
    });
    return createTrace(tracedEnd, null);
  };

  const playerOwner = createPlayer(runtime);
  playerOwner.s.origin = [10, 20, 30];
  playerOwner.origin = [10, 20, 30];
  playerOwner.client!.v_angle = [0, 90, 0];

  const playerDrop = Drop_Item(playerOwner, shells, runtime);

  assertNumber(traceCalls.length, 1, "Drop_Item traces projected client drops once");
  assertVec3(traceCalls[0].start, [10, 20, 30], "Drop_Item trace starts at the owner origin");
  assertVec3(traceCalls[0].mins, [-15, -15, -15], "Drop_Item trace uses the dropped item mins");
  assertVec3(traceCalls[0].maxs, [15, 15, 15], "Drop_Item trace uses the dropped item maxs");
  assertVec3(traceCalls[0].end, [10, 44, 14], "Drop_Item projects client drops with offset 24,0,-16");
  assertBoolean(traceCalls[0].passent === playerOwner, true, "Drop_Item trace ignores the owner");
  assertNumber(traceCalls[0].mask, CONTENTS_SOLID, "Drop_Item trace uses CONTENTS_SOLID like the C source");
  assertVec3(playerDrop.s.origin, tracedEnd, "Drop_Item copies trace.endpos to dropped.s.origin");
  assertVec3(playerDrop.origin, tracedEnd, "Drop_Item keeps runtime origin in sync with trace.endpos");
  assertVec3(playerDrop.velocity, [0, 100, 300], "Drop_Item scales the client forward vector into velocity");
  assertNumber(playerDrop.s.renderfx, RF_GLOW, "Drop_Item applies RF_GLOW to visible dropped items");
  assertNumber(playerDrop.s.modelindex > 0 ? 1 : 0, 1, "Drop_Item registers the dropped item world model");

  const nonClientOwner = spawnGameEntity(runtime);
  nonClientOwner.s.origin = [7, 8, 9];
  nonClientOwner.origin = [7, 8, 9];
  nonClientOwner.s.angles = [0, 0, 0];
  traceCalls.length = 0;

  const nonClientDrop = Drop_Item(nonClientOwner, shells, runtime);

  assertNumber(traceCalls.length, 0, "Drop_Item does not trace non-client owner drops");
  assertVec3(nonClientDrop.s.origin, [7, 8, 9], "Drop_Item places non-client drops at the owner origin");
  assertVec3(nonClientDrop.velocity, [100, 0, 300], "Drop_Item uses non-client angles only for velocity");
}

function verifyUseItemTriggerSpawnActivation(): void {
  const runtime = createHarnessRuntime();
  const normalItem = spawnGameEntity(runtime);
  normalItem.spawnflags = ITEM_TRIGGER_SPAWN;
  normalItem.svflags = SVF_NOCLIENT;
  normalItem.use = Use_Item;
  normalItem.solid = SOLID_NOT;

  Use_Item(normalItem, null, null, runtime);

  assertNumber(normalItem.svflags & SVF_NOCLIENT, 0, "Use_Item clears SVF_NOCLIENT");
  assertBoolean(normalItem.use === undefined, true, "Use_Item clears the use callback");
  assertNumber(normalItem.solid, SOLID_TRIGGER, "Use_Item arms normal items as SOLID_TRIGGER");
  assertBoolean(normalItem.touch === Touch_Item, true, "Use_Item installs Touch_Item on normal items");

  const noTouchItem = spawnGameEntity(runtime);
  noTouchItem.spawnflags = ITEM_TRIGGER_SPAWN | ITEM_NO_TOUCH;
  noTouchItem.svflags = SVF_NOCLIENT;
  noTouchItem.use = Use_Item;
  noTouchItem.touch = Touch_Item;

  Use_Item(noTouchItem, null, null, runtime);

  assertNumber(noTouchItem.svflags & SVF_NOCLIENT, 0, "Use_Item reveals no-touch trigger-spawn items");
  assertNumber(noTouchItem.solid, SOLID_BBOX, "Use_Item arms no-touch items as SOLID_BBOX");
  assertBoolean(noTouchItem.touch === undefined, true, "Use_Item clears touch on no-touch items");
}

function verifyDropToFloorPlacementAndFlags(): void {
  const runtime = createHarnessRuntime();
  const shells = requireItem("Shells");
  const itemEntity = spawnGameEntity(runtime);
  const traceEnd: vec3_t = [7, 8, -32];
  const traceCalls: Array<{ start: vec3_t; mins: vec3_t; maxs: vec3_t; end: vec3_t; passent: GameEntity | null; mask: number }> = [];

  runtime.collision.trace = (start, mins, maxs, end, passent, mask) => {
    traceCalls.push({
      start: [...start],
      mins: [...mins],
      maxs: [...maxs],
      end: [...end],
      passent,
      mask
    });
    return createTrace(traceEnd, null);
  };

  itemEntity.classname = "ammo_shells";
  itemEntity.item = shells;
  itemEntity.origin = [7, 8, 96];
  itemEntity.s.origin = [7, 8, 96];
  itemEntity.s.effects = EF_ROTATE;
  itemEntity.s.renderfx = RF_GLOW;

  droptofloor(itemEntity, runtime);

  assertVec3(itemEntity.mins, [-15, -15, -15], "droptofloor writes original mins via local v");
  assertVec3(itemEntity.maxs, [15, 15, 15], "droptofloor writes original maxs via local v");
  assertNumber(traceCalls.length, 1, "droptofloor traces once");
  assertVec3(traceCalls[0].start, [7, 8, 96], "droptofloor trace starts at item origin");
  assertVec3(traceCalls[0].mins, [-15, -15, -15], "droptofloor trace uses item mins");
  assertVec3(traceCalls[0].maxs, [15, 15, 15], "droptofloor trace uses item maxs");
  assertVec3(traceCalls[0].end, [7, 8, -32], "droptofloor dest is origin plus local v [0,0,-128]");
  assertBoolean(traceCalls[0].passent === itemEntity, true, "droptofloor passes the item as ignored entity");
  assertNumber(traceCalls[0].mask, MASK_SOLID, "droptofloor uses MASK_SOLID");
  assertVec3(itemEntity.s.origin, traceEnd, "droptofloor copies tr.endpos to s.origin");
  assertVec3(itemEntity.origin, traceEnd, "droptofloor keeps runtime origin synced to tr.endpos");
  assertNumber(itemEntity.s.modelindex > 0 ? 1 : 0, 1, "droptofloor registers the item world model");
  assertNumber(itemEntity.solid, SOLID_TRIGGER, "droptofloor arms default items as SOLID_TRIGGER");
  assertNumber(itemEntity.movetype, MOVETYPE_TOSS, "droptofloor preserves MOVETYPE_TOSS");
  assertBoolean(itemEntity.touch === Touch_Item, true, "droptofloor installs Touch_Item");

  const noTouchEntity = spawnGameEntity(runtime);
  noTouchEntity.classname = "ammo_shells";
  noTouchEntity.item = shells;
  noTouchEntity.spawnflags = ITEM_NO_TOUCH;
  noTouchEntity.s.effects = EF_ROTATE;
  noTouchEntity.s.renderfx = RF_GLOW;

  droptofloor(noTouchEntity, runtime);

  assertNumber(noTouchEntity.solid, SOLID_BBOX, "droptofloor arms ITEM_NO_TOUCH items as SOLID_BBOX");
  assertBoolean(noTouchEntity.touch === undefined, true, "droptofloor clears touch for ITEM_NO_TOUCH");
  assertNumber(noTouchEntity.s.effects & EF_ROTATE, 0, "droptofloor clears EF_ROTATE for ITEM_NO_TOUCH");
  assertNumber(noTouchEntity.s.renderfx & RF_GLOW, 0, "droptofloor clears RF_GLOW for ITEM_NO_TOUCH");

  const triggerEntity = spawnGameEntity(runtime);
  triggerEntity.classname = "ammo_shells";
  triggerEntity.item = shells;
  triggerEntity.spawnflags = ITEM_TRIGGER_SPAWN;

  droptofloor(triggerEntity, runtime);

  assertNumber(triggerEntity.solid, SOLID_NOT, "droptofloor hides ITEM_TRIGGER_SPAWN items");
  assertBoolean((triggerEntity.svflags & SVF_NOCLIENT) !== 0, true, "droptofloor sets SVF_NOCLIENT for ITEM_TRIGGER_SPAWN");
  assertBoolean(triggerEntity.use === Use_Item, true, "droptofloor installs Use_Item for ITEM_TRIGGER_SPAWN");
}

function verifyDropToFloorTeamRespawnAndStartSolid(): void {
  const runtime = createHarnessRuntime();
  const shells = requireItem("Shells");
  const master = spawnGameEntity(runtime);
  const slave = spawnGameEntity(runtime);

  master.classname = "ammo_shells";
  master.item = shells;
  master.team = "ammo_team";
  master.teammaster = master;
  master.teamchain = slave;
  master.flags = FL_TEAMSLAVE;
  slave.team = "ammo_team";

  droptofloor(master, runtime);

  assertNumber(master.flags & FL_TEAMSLAVE, 0, "droptofloor clears FL_TEAMSLAVE on team entities");
  assertBoolean(master.chain === slave, true, "droptofloor copies teamchain into chain");
  assertBoolean(master.teamchain === null, true, "droptofloor clears teamchain");
  assertBoolean((master.svflags & SVF_NOCLIENT) !== 0, true, "droptofloor hides team items");
  assertNumber(master.solid, SOLID_NOT, "droptofloor makes team items non-solid");
  assertNumber(master.nextthink, runtime.time + FRAMETIME, "droptofloor schedules team master respawn");
  assertBoolean(master.think === DoRespawn, true, "droptofloor schedules DoRespawn on the team master");

  const blocked = spawnFreeableEntity(runtime);
  blocked.classname = "ammo_shells";
  blocked.item = shells;
  runtime.collision.trace = (_start, _mins, _maxs, end) => ({
    ...createTrace(end, null),
    startsolid: true
  });

  droptofloor(blocked, runtime);

  assertNumber(blocked.inuse ? 1 : 0, 0, "droptofloor frees startsolid items");
  assertNumber(blocked.freetime, runtime.time, "droptofloor startsolid free stamps freetime");
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

function verifyPickupArmorConversions(): void {
  InitItems();

  const runtime = createHarnessRuntime();
  const body = requireItem("Body Armor");
  const combat = requireItem("Combat Armor");
  const jacket = requireItem("Jacket Armor");
  const shard = requireItem("Armor Shard");

  const barePlayer = createPlayer(runtime);
  const jacketEntity = spawnGameEntity(runtime);
  jacketEntity.item = jacket;
  assertBoolean(Pickup_Armor(jacketEntity, barePlayer, runtime), true, "Pickup_Armor accepts base armor when no armor is held");
  assertNumber(barePlayer.client!.pers.inventory[jacket.index], 25, "Pickup_Armor grants jacket base_count to an unarmored player");

  const shardPlayer = createPlayer(runtime);
  shardPlayer.client!.pers.inventory[combat.index] = 50;
  const shardEntity = spawnGameEntity(runtime);
  shardEntity.item = shard;
  assertBoolean(Pickup_Armor(shardEntity, shardPlayer, runtime), true, "Pickup_Armor accepts armor shards with existing armor");
  assertNumber(shardPlayer.client!.pers.inventory[combat.index], 52, "Armor shards add two points to the active armor type");

  const upgradePlayer = createPlayer(runtime);
  upgradePlayer.client!.pers.inventory[jacket.index] = 25;
  const combatEntity = spawnGameEntity(runtime);
  combatEntity.item = combat;
  assertBoolean(Pickup_Armor(combatEntity, upgradePlayer, runtime), true, "Pickup_Armor accepts better armor upgrades");
  assertNumber(upgradePlayer.client!.pers.inventory[jacket.index], 0, "Better armor pickup clears the old armor slot");
  assertNumber(upgradePlayer.client!.pers.inventory[combat.index], 62, "Better armor pickup preserves truncated salvage from old armor");

  const salvagePlayer = createPlayer(runtime);
  salvagePlayer.client!.pers.inventory[body.index] = 100;
  const weakerCombatEntity = spawnGameEntity(runtime);
  weakerCombatEntity.item = combat;
  assertBoolean(Pickup_Armor(weakerCombatEntity, salvagePlayer, runtime), true, "Pickup_Armor accepts weaker armor when it adds salvage");
  assertNumber(salvagePlayer.client!.pers.inventory[body.index], 137, "Weaker armor pickup adds truncated salvage to current armor");
  assertNumber(salvagePlayer.client!.pers.inventory[combat.index], 0, "Weaker armor pickup keeps the current better armor slot");

  const maxedPlayer = createPlayer(runtime);
  maxedPlayer.client!.pers.inventory[body.index] = 200;
  const weakJacketEntity = spawnGameEntity(runtime);
  weakJacketEntity.item = jacket;
  assertBoolean(Pickup_Armor(weakJacketEntity, maxedPlayer, runtime), false, "Pickup_Armor rejects weaker armor when current armor is already maxed");
  assertNumber(maxedPlayer.client!.pers.inventory[body.index], 200, "Rejected weaker armor leaves current armor unchanged");

  const deathmatchRuntime = createHarnessRuntime();
  deathmatchRuntime.deathmatch = true;
  const deathmatchPlayer = createPlayer(deathmatchRuntime);
  const respawningArmor = spawnGameEntity(deathmatchRuntime);
  respawningArmor.item = combat;
  assertBoolean(Pickup_Armor(respawningArmor, deathmatchPlayer, deathmatchRuntime), true, "Pickup_Armor accepts deathmatch armor pickup");
  assertBoolean((respawningArmor.flags & FL_RESPAWN) !== 0, true, "Pickup_Armor schedules respawn for non-dropped deathmatch armor");
  assertNumber(respawningArmor.nextthink, deathmatchRuntime.time + 20, "Pickup_Armor uses the original 20 second armor respawn delay");
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
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  runtime.collision = {
    world: {} as never,
    trace: (_start, _mins, _maxs, end) => createTrace(end, null),
    pointcontents: () => 0
  };
  return runtime;
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

function spawnFreeableEntity(runtime: GameRuntime): GameEntity {
  while (runtime.entities.length <= runtime.maxclients + 8) {
    spawnGameEntity(runtime);
  }
  return spawnGameEntity(runtime);
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

function assertVec3(actual: vec3_t, expected: vec3_t, label: string): void {
  for (let i = 0; i < 3; i++) {
    if (Math.abs(actual[i] - expected[i]) > 0.0001) {
      throw new Error(`${label}: attendu [${expected.join(", ")}], recu [${actual.join(", ")}]`);
    }
  }
}

function createTrace(endpos: vec3_t, ent: GameEntity | null): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction: ent ? 0.5 : 1,
    endpos: [...endpos],
    plane: {
      normal: [0, 0, 1],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0]
    },
    surface: null,
    contents: 0,
    ent
  };
}
