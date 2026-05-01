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
  Drop_Ammo,
  Drop_General,
  Drop_Item,
  FL_TEAMSLAVE,
  FL_POWER_ARMOR,
  FL_RESPAWN,
  FRAMETIME,
  FindItem,
  FindItemByClassname,
  G_RunFrame,
  GetGameItems,
  GetItemByIndex,
  G_SetClientEffects,
  G_SetStats,
  InitItems,
  ITEM_NO_TOUCH,
  ITEM_TRIGGER_SPAWN,
  MegaHealth_think,
  MOVETYPE_TOSS,
  Pickup_Health,
  Pickup_Adrenaline,
  Pickup_AncientHead,
  Pickup_Bandolier,
  Pickup_Pack,
  Pickup_Armor,
  Pickup_Key,
  Pickup_Ammo,
  Pickup_PowerArmor,
  Pickup_Powerup,
  PowerArmorType,
  PrecacheItem,
  SetItemNames,
  SetRespawn,
  SOLID_BBOX,
  SOLID_NOT,
  SOLID_TRIGGER,
  SpawnItem,
  SP_item_health,
  SP_item_health_large,
  SP_item_health_mega,
  SP_item_health_small,
  Touch_Item,
  Use_Item,
  Use_Breather,
  Use_Envirosuit,
  Use_Invulnerability,
  Use_PowerArmor,
  Use_Quad,
  Use_Silencer,
  SVF_NOCLIENT,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  drainGameSoundEvents,
  droptofloor,
  linkGameEntity,
  runPendingThinks,
  spawnGameEntity
} from "../../packages/game/src/index.js";
import { DROPPED_ITEM, DROPPED_PLAYER_ITEM, ITEM_TARGETS_USED, POWER_ARMOR_SCREEN, POWER_ARMOR_SHIELD } from "../../packages/game/src/g_local.js";
import { CS_ITEMS, DF_INFINITE_AMMO, DF_INSTANT_ITEMS, DF_NO_ARMOR, DF_NO_HEALTH, DF_NO_ITEMS, EF_PENT, EF_ROTATE, MASK_SOLID, RF_GLOW, STAT_PICKUP_ICON, STAT_PICKUP_STRING, STAT_SELECTED_ITEM, STAT_TIMER, STAT_TIMER_ICON, entity_event_t } from "../../packages/qcommon/src/index.js";
import { CONTENTS_SOLID } from "../../packages/qcommon/src/q_shared.js";
import type { GameEntity, GameItemDefinition, GameRuntime } from "../../packages/game/src/index.js";
import type { trace_t, vec3_t } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyAddAmmoCapsToMax();
  verifyPickupAmmoCountWeaponSelectionAndRespawn();
  verifyDropAmmoInventoryCountAndGrenadeGuard();
  verifySetRespawnRoundTrip();
  verifyDoRespawnTeamChoice();
  verifyTouchHealthPickup();
  verifyMegaHealthAndPickupHealthRules();
  verifyTouchHealthPickupUsesItemPath();
  verifyPickupAdrenalineHealthAndRespawn();
  verifyPickupAncientHeadMaxHealthAndRespawn();
  verifyPickupBandolierAmmoCapsAndRespawn();
  verifyPickupPackAmmoCapsAndRespawn();
  verifyTouchRejectedPickupStillUsesTargets();
  verifyTouchAmmoPickupUsesItemPath();
  verifyTouchWeaponPickupUsesWeaponPath();
  verifyTouchCoopStayWeaponRemainsTouchable();
  verifyDropTempTouchAndDeathmatchFree();
  verifyDropItemPlacementAndTrace();
  verifyDropGeneralInventoryAndSelection();
  verifyUseItemTriggerSpawnActivation();
  verifyDropToFloorPlacementAndFlags();
  verifyDropToFloorTeamRespawnAndStartSolid();
  verifyItemlistShapeAndHealthSentinel();
  verifyHealthSpawnFunctionsUseGenericHealthItem();
  verifyArmorAndPowerArmorIndices();
  verifyPickupArmorConversions();
  verifyPrecacheItemAssetsAndValidation();
  verifyUsePowerArmorRequiresCells();
  verifyPickupPowerArmorIndexQuantityAndRespawn();
  verifyPickupPowerupLimitsRespawnAndInstantUse();
  verifyUseQuadTimeoutAndDroppedHack();
  verifyUseBreatherTimeout();
  verifyUseEnvirosuitTimeout();
  verifyUseInvulnerabilityTimeout();
  verifyUseSilencerShots();
  verifyPickupKeyCoopAndPowerCubeRules();
  verifyItemLookupHelpers();
  verifyCoopPowerCubeSpawnFlags();
  verifyInvalidSpawnFlagsAreClearedForNonPowerCube();
  verifySpawnItemDeathmatchFilters();

  console.log("Verification g_items - pickup/drop/respawn gameplay OK");
}

function verifyItemlistShapeAndHealthSentinel(): void {
  const itemCount = InitItems();
  const items = GetGameItems();
  const health = requireItem("Health");
  const airstrike = requireItem("Airstrike Marker");

  assertNumber(itemCount, 41, "InitItems returns the original game.num_items equivalent without the C end marker");
  assertNumber(items.length, itemCount, "GetGameItems length stays aligned with InitItems");
  assertNumber(airstrike.index, 40, "Airstrike Marker keeps the original itemlist slot before generic health");
  assertNumber(health.index, 41, "Generic Health keeps the original final itemlist slot");
  assertBoolean(GetItemByIndex(0) === null, true, "GetItemByIndex preserves the C null slot 0 as not addressable");
  assertBoolean(GetItemByIndex(health.index) === health, true, "GetItemByIndex resolves the generic Health slot");
  assertBoolean(FindItem("Health") === health, true, "FindItem resolves the single generic Health entry");
  assertBoolean(FindItem("item_health_small") === null, true, "item_health_small is not a pickup name in the C itemlist");
  assertBoolean(items.filter((item) => item.pickupName === "Health").length === 1, true, "itemlist contains exactly one generic Health pickup");

  assertNumber(health.quantity, 0, "Generic Health quantity is zero like the C table");
  assertBoolean(health.worldModel === "", true, "Generic Health has no world model in the C table");
  assertBoolean(health.classname === "", true, "Generic Health keeps the C NULL classname as an empty TS classname");
  assertBoolean(health.precaches.includes("items/m_health.wav"), true, "Generic Health preserves health sound precaches");

  const names = SetItemNames();
  assertNumber(names.length, itemCount, "SetItemNames exposes one configstring name per itemlist entry");
  assertBoolean(names[names.length - 1] === "Health", true, "SetItemNames ends with the generic Health pickup name");
}

function verifyItemLookupHelpers(): void {
  const machinegun = requireItem("Machinegun");

  assertBoolean(GetItemByIndex(-1) === null, true, "GetItemByIndex rejects negative indices");
  assertBoolean(GetItemByIndex(0) === null, true, "GetItemByIndex rejects the original C null slot");
  assertBoolean(GetItemByIndex(machinegun.index) === machinegun, true, "GetItemByIndex translates itemlist indices to TS storage");
  assertBoolean(GetItemByIndex(InitItems()) === requireItem("Health"), true, "GetItemByIndex accepts the last real C item index");
  assertBoolean(GetItemByIndex(InitItems() + 1) === null, true, "GetItemByIndex rejects the original C end marker index");

  assertBoolean(FindItemByClassname("weapon_machinegun") === machinegun, true, "FindItemByClassname resolves a direct classname");
  assertBoolean(FindItemByClassname("WEAPON_MACHINEGUN") === machinegun, true, "FindItemByClassname preserves Q_stricmp case-insensitive matching");
  assertBoolean(FindItemByClassname("") === null, true, "FindItemByClassname skips the C NULL classname sentinel represented as an empty string");
  assertBoolean(FindItemByClassname("item_health") === null, true, "FindItemByClassname does not resolve health spawn classnames that are not itemlist classnames");

  assertBoolean(FindItem("Machinegun") === machinegun, true, "FindItem resolves a direct pickup name");
  assertBoolean(FindItem("MACHINEGUN") === machinegun, true, "FindItem preserves Q_stricmp case-insensitive pickup matching");
  assertBoolean(FindItem("weapon_machinegun") === null, true, "FindItem does not resolve classnames through the pickup-name lookup");
  assertBoolean(FindItem("") === null, true, "FindItem skips the hidden C null slot and end marker");
}

function verifyHealthSpawnFunctionsUseGenericHealthItem(): void {
  const mediumRuntime = createHarnessRuntime();
  const medium = spawnGameEntity(mediumRuntime);
  medium.classname = "item_health";

  SP_item_health(medium, mediumRuntime);

  assertNumber(medium.count, 10, "SP_item_health writes the original medium health count");
  assertBoolean(medium.item === requireItem("Health"), true, "SP_item_health attaches the generic Health item");
  assertBoolean(medium.itemWorldModel === "models/items/healing/medium/tris.md2", true, "SP_item_health keeps the map model outside itemlist metadata");
  assertBoolean(mediumRuntime.assets.soundPaths.includes("items/n_health.wav"), true, "SP_item_health registers the medium health pickup sound");
  assertBoolean(mediumRuntime.assets.modelPaths.includes("models/items/healing/medium/tris.md2"), true, "SP_item_health registers the medium health model through SpawnItem");

  const smallRuntime = createHarnessRuntime();
  const small = spawnFreeableEntity(smallRuntime);
  small.classname = "item_health_small";

  SP_item_health_small(small, smallRuntime);

  assertNumber(small.count, 2, "SP_item_health_small writes the original small health count");
  assertNumber(small.style, 1, "SP_item_health_small sets HEALTH_IGNORE_MAX after SpawnItem like the C source");
  assertBoolean(small.item === requireItem("Health"), true, "SP_item_health_small attaches the generic Health item");
  assertBoolean(small.itemWorldModel === "models/items/healing/stimpack/tris.md2", true, "SP_item_health_small keeps the variant model outside itemlist metadata");
  assertBoolean(smallRuntime.assets.soundPaths.includes("items/s_health.wav"), true, "SP_item_health_small registers the small health pickup sound");

  const largeRuntime = createHarnessRuntime();
  const large = spawnFreeableEntity(largeRuntime);
  large.classname = "item_health_large";

  SP_item_health_large(large, largeRuntime);

  assertNumber(large.count, 25, "SP_item_health_large writes the original large health count");
  assertNumber(large.style, 0, "SP_item_health_large leaves health style unchanged like the C source");
  assertBoolean(large.item === requireItem("Health"), true, "SP_item_health_large attaches the generic Health item");
  assertBoolean(large.itemWorldModel === "models/items/healing/large/tris.md2", true, "SP_item_health_large keeps the variant model outside itemlist metadata");
  assertBoolean(largeRuntime.assets.soundPaths.includes("items/l_health.wav"), true, "SP_item_health_large registers the large health pickup sound");

  const megaRuntime = createHarnessRuntime();
  const mega = spawnFreeableEntity(megaRuntime);
  mega.classname = "item_health_mega";

  SP_item_health_mega(mega, megaRuntime);

  assertNumber(mega.count, 100, "SP_item_health_mega writes the original mega-health count");
  assertNumber(mega.style, 3, "SP_item_health_mega sets HEALTH_IGNORE_MAX|HEALTH_TIMED after SpawnItem like the C source");
  assertBoolean(mega.item === requireItem("Health"), true, "SP_item_health_mega attaches the generic Health item");
  assertBoolean(mega.itemWorldModel === "models/items/mega_h/tris.md2", true, "SP_item_health_mega keeps the variant model outside itemlist metadata");
  assertBoolean(megaRuntime.assets.soundPaths.includes("items/m_health.wav"), true, "SP_item_health_mega registers the mega-health pickup sound");

  const noHealthRuntime = createHarnessRuntime();
  noHealthRuntime.deathmatch = true;
  noHealthRuntime.dmflags = DF_NO_HEALTH;
  const inhibited = spawnFreeableEntity(noHealthRuntime);

  SP_item_health_mega(inhibited, noHealthRuntime);

  assertNumber(inhibited.inuse ? 1 : 0, 0, "SP_item_health_mega frees health immediately under DF_NO_HEALTH");
  assertNumber(noHealthRuntime.assets.modelPaths.length, 0, "SP_item_health_mega returns before registering assets under DF_NO_HEALTH");
}

function verifyAddAmmoCapsToMax(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const client = player.client!;
  const ammoCases: Array<{ name: string; maxField: keyof typeof client.pers; max: number; start: number; count: number }> = [
    { name: "Bullets", maxField: "max_bullets", max: 200, start: 190, count: 25 },
    { name: "Shells", maxField: "max_shells", max: 100, start: 95, count: 10 },
    { name: "Rockets", maxField: "max_rockets", max: 50, start: 49, count: 5 },
    { name: "Grenades", maxField: "max_grenades", max: 50, start: 45, count: 10 },
    { name: "Cells", maxField: "max_cells", max: 200, start: 175, count: 50 },
    { name: "Slugs", maxField: "max_slugs", max: 50, start: 40, count: 15 }
  ];

  for (const ammoCase of ammoCases) {
    const item = requireItem(ammoCase.name);
    client.pers[ammoCase.maxField] = ammoCase.max;
    client.pers.inventory[item.index] = ammoCase.start;

    const accepted = Add_Ammo(player, item, ammoCase.count, runtime);
    assertBoolean(accepted, true, `Add_Ammo accepts partial ${ammoCase.name} refill`);
    assertNumber(client.pers.inventory[item.index], ammoCase.max, `Add_Ammo caps ${ammoCase.name} to ${String(ammoCase.maxField)}`);
  }

  const shells = requireItem("Shells");
  client.pers.inventory[shells.index] = client.pers.max_shells;
  assertBoolean(Add_Ammo(player, shells, 1, runtime), false, "Add_Ammo rejects already-full ammo");
  assertNumber(client.pers.inventory[shells.index], client.pers.max_shells, "Add_Ammo leaves full ammo unchanged");

  const unknownAmmo = { ...requireItem("Health"), tag: 9999 };
  assertBoolean(Add_Ammo(player, unknownAmmo, 10, runtime), false, "Add_Ammo rejects unknown ammo tags");

  const nonClient = spawnGameEntity(runtime);
  assertBoolean(Add_Ammo(nonClient, requireItem("Bullets"), 10, runtime), false, "Add_Ammo rejects entities without clients");
}

function verifyPickupAmmoCountWeaponSelectionAndRespawn(): void {
  const shellsRuntime = createHarnessRuntime();
  const shellsPlayer = createPlayer(shellsRuntime);
  const shellsEntity = spawnFreeableEntity(shellsRuntime);
  const shells = requireItem("Shells");

  shellsPlayer.client!.pers.inventory[shells.index] = 90;
  shellsEntity.item = shells;
  shellsEntity.count = 7;

  assertBoolean(Pickup_Ammo(shellsEntity, shellsPlayer, shellsRuntime), true, "Pickup_Ammo accepts explicit ent.count ammo");
  assertNumber(shellsPlayer.client!.pers.inventory[shells.index], 97, "Pickup_Ammo uses ent.count before item.quantity");

  const fullRuntime = createHarnessRuntime();
  const fullPlayer = createPlayer(fullRuntime);
  const fullShellsEntity = spawnFreeableEntity(fullRuntime);
  fullPlayer.client!.pers.inventory[shells.index] = fullPlayer.client!.pers.max_shells;
  fullShellsEntity.item = shells;

  assertBoolean(Pickup_Ammo(fullShellsEntity, fullPlayer, fullRuntime), false, "Pickup_Ammo returns false when Add_Ammo rejects full ammo");

  const weaponRuntime = createHarnessRuntime();
  weaponRuntime.deathmatch = true;
  weaponRuntime.dmflags = DF_INFINITE_AMMO;
  const weaponPlayer = createPlayer(weaponRuntime);
  const grenadeEntity = spawnFreeableEntity(weaponRuntime);
  const grenades = requireItem("Grenades");

  weaponPlayer.client!.pers.weapon = requireItem("Blaster");
  weaponPlayer.client!.pers.inventory[grenades.index] = 0;
  grenadeEntity.item = grenades;
  grenadeEntity.count = 1;
  grenadeEntity.spawnflags = 0;

  assertBoolean(Pickup_Ammo(grenadeEntity, weaponPlayer, weaponRuntime), true, "Pickup_Ammo accepts grenade weapon ammo");
  assertNumber(weaponPlayer.client!.pers.inventory[grenades.index], weaponPlayer.client!.pers.max_grenades, "Pickup_Ammo applies DF_INFINITE_AMMO count and clamps to ammo max");
  assertBoolean(weaponPlayer.client!.newweapon === grenades, true, "Pickup_Ammo selects weapon ammo when oldcount was zero and current weapon is blaster");
  assertNumber(grenadeEntity.svflags & SVF_NOCLIENT, SVF_NOCLIENT, "Pickup_Ammo schedules deathmatch respawn for map ammo");
  assertNumber(grenadeEntity.solid, SOLID_NOT, "Pickup_Ammo hides respawning ammo");
  assertNumber(grenadeEntity.nextthink, weaponRuntime.time + 30, "Pickup_Ammo respawns map ammo after 30 seconds");

  const oldcountRuntime = createHarnessRuntime();
  oldcountRuntime.deathmatch = true;
  const oldcountPlayer = createPlayer(oldcountRuntime);
  const oldcountGrenadeEntity = spawnFreeableEntity(oldcountRuntime);
  oldcountPlayer.client!.pers.weapon = requireItem("Blaster");
  oldcountPlayer.client!.pers.inventory[grenades.index] = 1;
  oldcountGrenadeEntity.item = grenades;
  oldcountGrenadeEntity.spawnflags = DROPPED_PLAYER_ITEM;

  assertBoolean(Pickup_Ammo(oldcountGrenadeEntity, oldcountPlayer, oldcountRuntime), true, "Pickup_Ammo accepts weapon ammo when oldcount was non-zero");
  assertBoolean(oldcountPlayer.client!.newweapon === null, true, "Pickup_Ammo does not select weapon ammo when oldcount was non-zero");
  assertNumber(oldcountGrenadeEntity.nextthink, 0, "Pickup_Ammo does not respawn dropped player ammo");

  const noSwitchRuntime = createHarnessRuntime();
  noSwitchRuntime.deathmatch = true;
  const noSwitchPlayer = createPlayer(noSwitchRuntime);
  const noSwitchGrenadeEntity = spawnFreeableEntity(noSwitchRuntime);
  noSwitchPlayer.client!.pers.weapon = requireItem("Shotgun");
  noSwitchPlayer.client!.pers.inventory[grenades.index] = 0;
  noSwitchGrenadeEntity.item = grenades;
  noSwitchGrenadeEntity.spawnflags = DROPPED_ITEM;

  assertBoolean(Pickup_Ammo(noSwitchGrenadeEntity, noSwitchPlayer, noSwitchRuntime), true, "Pickup_Ammo accepts deathmatch weapon ammo with non-blaster current weapon");
  assertBoolean(noSwitchPlayer.client!.newweapon === null, true, "Pickup_Ammo does not auto-switch in deathmatch from a non-blaster weapon");
}

function verifyDropAmmoInventoryCountAndGrenadeGuard(): void {
  const runtime = createHarnessRuntime();
  const shells = requireItem("Shells");
  const player = createPlayer(runtime);
  player.s.origin = [16, 32, 48];
  player.origin = [16, 32, 48];
  player.client!.v_angle = [0, 0, 0];
  player.client!.pers.inventory[shells.index] = 25;
  player.client!.pers.selected_item = shells.index;

  const entityCountBeforeFullDrop = runtime.entities.length;
  Drop_Ammo(player, shells, runtime);
  const fullDrop = runtime.entities.at(-1);

  assertNumber(runtime.entities.length, entityCountBeforeFullDrop + 1, "Drop_Ammo creates one dropped ammo entity");
  assertBoolean(fullDrop?.item === shells, true, "Drop_Ammo delegates to Drop_Item with the ammo definition");
  assertNumber(fullDrop?.count ?? 0, shells.quantity, "Drop_Ammo caps dropped count to item.quantity");
  assertNumber(player.client!.pers.inventory[shells.index], 15, "Drop_Ammo subtracts dropped ammo from ITEM_INDEX(item)");
  assertNumber(player.client!.pers.selected_item, shells.index, "Drop_Ammo keeps a still-stocked selected ammo item selected");
  assertNumber(fullDrop?.spawnflags ?? 0, DROPPED_ITEM, "Drop_Ammo produces a DROPPED_ITEM entity");
  assertNumber(fullDrop?.s.modelindex && fullDrop.s.modelindex > 0 ? 1 : 0, 1, "Drop_Ammo produces a renderer-visible ammo model");

  const partialRuntime = createHarnessRuntime();
  const partialPlayer = createPlayer(partialRuntime);
  partialPlayer.client!.pers.inventory[shells.index] = 4;
  partialPlayer.client!.pers.selected_item = shells.index;

  Drop_Ammo(partialPlayer, shells, partialRuntime);
  const partialDrop = partialRuntime.entities.at(-1);

  assertNumber(partialDrop?.count ?? 0, 4, "Drop_Ammo drops the remaining inventory when below item.quantity");
  assertNumber(partialPlayer.client!.pers.inventory[shells.index], 0, "Drop_Ammo clears the ammo slot after a partial drop");
  assertNumber(partialPlayer.client!.pers.selected_item, -1, "Drop_Ammo validates away an emptied selected ammo item");

  const grenadeRuntime = createHarnessRuntime();
  while (grenadeRuntime.entities.length <= grenadeRuntime.maxclients + 8) {
    spawnGameEntity(grenadeRuntime);
  }
  const grenades = requireItem("Grenades");
  const grenadePlayer = createPlayer(grenadeRuntime);
  grenadePlayer.client!.pers.weapon = grenades;
  grenadePlayer.client!.pers.inventory[grenades.index] = grenades.quantity;
  grenadePlayer.client!.pers.selected_item = grenades.index;

  Drop_Ammo(grenadePlayer, grenades, grenadeRuntime);
  const refusedDrop = grenadeRuntime.entities.at(-1);

  assertNumber(grenadePlayer.client!.pers.inventory[grenades.index], grenades.quantity, "Drop_Ammo refuses to drop the last current grenade weapon ammo");
  assertNumber(refusedDrop?.inuse ? 1 : 0, 0, "Drop_Ammo frees the refused grenade drop entity");
  assertBoolean(
    grenadeRuntime.logEntries.some((entry) => entry.message.includes("Can't drop current weapon")),
    true,
    "Drop_Ammo reports the original current-weapon grenade refusal"
  );

  const spareGrenadeRuntime = createHarnessRuntime();
  const spareGrenadePlayer = createPlayer(spareGrenadeRuntime);
  spareGrenadePlayer.client!.pers.weapon = grenades;
  spareGrenadePlayer.client!.pers.inventory[grenades.index] = grenades.quantity + 2;

  Drop_Ammo(spareGrenadePlayer, grenades, spareGrenadeRuntime);
  const allowedGrenadeDrop = spareGrenadeRuntime.entities.at(-1);

  assertNumber(allowedGrenadeDrop?.count ?? 0, grenades.quantity, "Drop_Ammo still drops one grenade-ammo quantity when spare ammo remains");
  assertNumber(spareGrenadePlayer.client!.pers.inventory[grenades.index], 2, "Drop_Ammo leaves spare grenade ammo after an allowed current-weapon drop");
  assertNumber(allowedGrenadeDrop?.inuse ? 1 : 0, 1, "Drop_Ammo keeps an allowed grenade drop in use");
}

function verifySetRespawnRoundTrip(): void {
  const runtime = createHarnessRuntime();
  const entity = spawnGameEntity(runtime);
  const item = requireItem("Shells");
  let engineLinkCount = 0;
  let engineUnlinkCount = 0;

  runtime.engineLinkEntity = () => {
    engineLinkCount += 1;
  };
  runtime.engineUnlinkEntity = () => {
    engineUnlinkCount += 1;
  };

  SpawnItem(entity, item, runtime);
  entity.think?.(entity, runtime);
  const linkcountBeforeRespawn = entity.linkcount;

  SetRespawn(entity, FRAMETIME, runtime);

  assertBoolean((entity.flags & FL_RESPAWN) !== 0, true, "SetRespawn marks the item with FL_RESPAWN");
  assertBoolean((entity.svflags & SVF_NOCLIENT) !== 0, true, "SetRespawn hides the item from client snapshots");
  assertNumber(entity.solid, SOLID_NOT, "SetRespawn makes the item non-solid");
  assertNumber(entity.nextthink, runtime.time + FRAMETIME, "SetRespawn schedules nextthink at level.time + delay");
  assertBoolean(entity.think === DoRespawn, true, "SetRespawn installs DoRespawn as the next think callback");
  assertNumber(entity.linkcount, linkcountBeforeRespawn + 1, "SetRespawn relinks the hidden item");
  assertBoolean(runtime.linkedTriggerEntities.includes(entity), false, "SetRespawn removes the item from trigger links while hidden");
  assertBoolean(runtime.linkedSolidEntities.includes(entity), false, "SetRespawn keeps the hidden item out of solid links");

  G_RunFrame(runtime);

  assertNumber(entity.solid, SOLID_TRIGGER, "G_RunFrame runs DoRespawn and restores SOLID_TRIGGER");
  assertBoolean((entity.svflags & SVF_NOCLIENT) === 0, true, "DoRespawn clears SVF_NOCLIENT after the scheduled think");
  assertBoolean(runtime.linkedTriggerEntities.includes(entity), true, "DoRespawn relinks the item as a trigger");
  assertNumber(entity.s.event, entity_event_t.EV_ITEM_RESPAWN, "DoRespawn emits EV_ITEM_RESPAWN");
  assertBoolean(engineLinkCount >= 3, true, "SpawnItem/droptofloor/SetRespawn/DoRespawn all relink through the runtime bridge");
  assertBoolean(engineUnlinkCount >= 3, true, "Relinks also notify the runtime unlink bridge before relinking");
}

function verifyDoRespawnTeamChoice(): void {
  const runtime = createHarnessRuntime();
  const master = spawnGameEntity(runtime);
  const firstSlave = spawnGameEntity(runtime);
  const secondSlave = spawnGameEntity(runtime);

  master.team = "ammo_team";
  firstSlave.team = "ammo_team";
  secondSlave.team = "ammo_team";
  master.teammaster = master;
  firstSlave.teammaster = master;
  secondSlave.teammaster = master;
  master.chain = firstSlave;
  firstSlave.chain = secondSlave;
  for (const entity of [master, firstSlave, secondSlave]) {
    entity.svflags |= SVF_NOCLIENT;
    entity.solid = SOLID_NOT;
  }

  const originalRandom = Math.random;
  Math.random = () => 0.5;
  try {
    DoRespawn(master, runtime);
  } finally {
    Math.random = originalRandom;
  }

  assertNumber(master.solid, SOLID_NOT, "DoRespawn keeps non-selected team items hidden");
  assertNumber(firstSlave.solid, SOLID_TRIGGER, "DoRespawn selects the rand()%count team item");
  assertNumber(secondSlave.solid, SOLID_NOT, "DoRespawn leaves later non-selected team items hidden");
  assertBoolean((firstSlave.svflags & SVF_NOCLIENT) === 0, true, "DoRespawn clears SVF_NOCLIENT on the selected team item");
  assertNumber(firstSlave.s.event, entity_event_t.EV_ITEM_RESPAWN, "DoRespawn emits EV_ITEM_RESPAWN on the selected team item");
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

function verifyMegaHealthAndPickupHealthRules(): void {
  const cappedRuntime = createHarnessRuntime();
  const cappedHealth = spawnFreeableEntity(cappedRuntime);
  const cappedPlayer = createPlayer(cappedRuntime);
  cappedPlayer.health = 100;
  cappedPlayer.max_health = 100;
  cappedHealth.count = 25;
  cappedHealth.style = 0;
  assertBoolean(Pickup_Health(cappedHealth, cappedPlayer, cappedRuntime), false, "Pickup_Health rejects non-ignore-max health at max health");
  assertNumber(cappedPlayer.health, 100, "Pickup_Health leaves rejected player health unchanged");

  cappedPlayer.health = 90;
  assertBoolean(Pickup_Health(cappedHealth, cappedPlayer, cappedRuntime), true, "Pickup_Health accepts non-ignore-max health below max health");
  assertNumber(cappedPlayer.health, 100, "Pickup_Health clamps non-ignore-max health to max_health");

  const megaRuntime = createHarnessRuntime();
  megaRuntime.deathmatch = true;
  megaRuntime.time = 10;
  const mega = spawnFreeableEntity(megaRuntime);
  const megaPlayer = createPlayer(megaRuntime);
  megaPlayer.health = 90;
  megaPlayer.max_health = 100;
  mega.count = 100;
  mega.style = 1 | 2;
  mega.spawnflags = 0;

  assertBoolean(Pickup_Health(mega, megaPlayer, megaRuntime), true, "Pickup_Health accepts timed mega health");
  assertNumber(megaPlayer.health, 190, "Pickup_Health lets timed ignore-max health exceed max_health");
  assertBoolean(mega.think === MegaHealth_think, true, "Pickup_Health installs MegaHealth_think for timed health");
  assertNumber(mega.nextthink, 15, "Pickup_Health schedules first mega health decay five seconds later");
  assertBoolean(mega.owner === megaPlayer, true, "Pickup_Health stores the health owner for timed decay");
  assertBoolean((mega.flags & FL_RESPAWN) !== 0, true, "Pickup_Health marks timed health as respawning");
  assertNumber(mega.svflags & SVF_NOCLIENT, SVF_NOCLIENT, "Pickup_Health hides timed health while it decays");
  assertNumber(mega.solid, SOLID_NOT, "Pickup_Health makes timed health non-solid while it decays");

  runPendingThinks(megaRuntime, 15);
  assertNumber(megaPlayer.health, 189, "MegaHealth_think subtracts one health while owner is above max_health");
  assertNumber(mega.nextthink, 16, "MegaHealth_think reschedules one second later while above max_health");
  assertBoolean(mega.think === MegaHealth_think, true, "MegaHealth_think keeps itself installed while draining");

  megaPlayer.health = 100;
  runPendingThinks(megaRuntime, 16);
  assertNumber(mega.nextthink, 36, "MegaHealth_think schedules deathmatch map mega health respawn after twenty seconds");
  assertBoolean((mega.svflags & SVF_NOCLIENT) !== 0, true, "MegaHealth_think leaves map mega health hidden until respawn");
  assertNumber(mega.solid, SOLID_NOT, "MegaHealth_think leaves map mega health non-solid until respawn");

  const droppedRuntime = createHarnessRuntime();
  droppedRuntime.deathmatch = true;
  droppedRuntime.time = 4;
  const droppedMega = spawnFreeableEntity(droppedRuntime);
  const droppedOwner = createPlayer(droppedRuntime);
  droppedOwner.health = 100;
  droppedOwner.max_health = 100;
  droppedMega.owner = droppedOwner;
  droppedMega.spawnflags = DROPPED_ITEM;
  droppedMega.think = MegaHealth_think;
  droppedMega.nextthink = 5;

  runPendingThinks(droppedRuntime, 5);
  assertNumber(droppedMega.inuse ? 1 : 0, 0, "MegaHealth_think frees dropped mega health when decay is complete");
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

function verifyPickupAdrenalineHealthAndRespawn(): void {
  const singlePlayerRuntime = createHarnessRuntime();
  const singlePlayerAdrenaline = spawnFreeableEntity(singlePlayerRuntime);
  const singlePlayer = createPlayer(singlePlayerRuntime);

  singlePlayer.health = 40;
  singlePlayer.max_health = 100;
  singlePlayerAdrenaline.item = requireItem("Adrenaline");
  singlePlayerAdrenaline.spawnflags = 0;

  assertBoolean(Pickup_Adrenaline(singlePlayerAdrenaline, singlePlayer, singlePlayerRuntime), true, "Pickup_Adrenaline accepts single-player adrenaline");
  assertNumber(singlePlayer.max_health, 101, "Pickup_Adrenaline increments max_health outside deathmatch");
  assertNumber(singlePlayer.health, 101, "Pickup_Adrenaline heals the player up to the new max_health");
  assertNumber(singlePlayerAdrenaline.nextthink, 0, "Pickup_Adrenaline does not respawn single-player adrenaline");

  const deathmatchRuntime = createHarnessRuntime();
  deathmatchRuntime.deathmatch = true;
  deathmatchRuntime.time = 12;
  const deathmatchAdrenaline = spawnFreeableEntity(deathmatchRuntime);
  const deathmatchPlayer = createPlayer(deathmatchRuntime);
  const adrenaline = requireItem("Adrenaline");

  deathmatchPlayer.health = 80;
  deathmatchPlayer.max_health = 100;
  deathmatchAdrenaline.item = adrenaline;
  deathmatchAdrenaline.spawnflags = 0;

  Touch_Item(deathmatchAdrenaline, deathmatchPlayer, deathmatchRuntime);

  assertNumber(deathmatchPlayer.max_health, 100, "Touch_Item routes adrenaline without max_health gain in deathmatch");
  assertNumber(deathmatchPlayer.health, 100, "Deathmatch adrenaline still tops health up to current max_health");
  assertNumber(deathmatchAdrenaline.svflags & SVF_NOCLIENT, SVF_NOCLIENT, "Deathmatch adrenaline is hidden for respawn");
  assertNumber(deathmatchAdrenaline.solid, SOLID_NOT, "Deathmatch adrenaline is made nonsolid while respawning");
  assertNumber(deathmatchAdrenaline.nextthink, 72, "Deathmatch adrenaline uses item quantity as respawn delay");
  assertNumber(deathmatchPlayer.client!.ps.stats[STAT_PICKUP_STRING], CS_ITEMS + adrenaline.index, "Touch_Item reports the adrenaline pickup string");
  assertBoolean(drainGameSoundEvents(deathmatchRuntime).some((event) => event.soundPath === "items/pkup.wav"), true, "Touch_Item queues the adrenaline pickup sound");

  const droppedRuntime = createHarnessRuntime();
  droppedRuntime.deathmatch = true;
  const droppedAdrenaline = spawnFreeableEntity(droppedRuntime);
  const droppedPlayer = createPlayer(droppedRuntime);

  droppedPlayer.health = 25;
  droppedPlayer.max_health = 100;
  droppedAdrenaline.item = adrenaline;
  droppedAdrenaline.spawnflags = DROPPED_ITEM;

  assertBoolean(Pickup_Adrenaline(droppedAdrenaline, droppedPlayer, droppedRuntime), true, "Pickup_Adrenaline accepts dropped adrenaline");
  assertNumber(droppedAdrenaline.nextthink, 0, "Dropped adrenaline does not schedule map-item respawn");
}

function verifyPickupAncientHeadMaxHealthAndRespawn(): void {
  const singlePlayerRuntime = createHarnessRuntime();
  const singlePlayerHead = spawnFreeableEntity(singlePlayerRuntime);
  const singlePlayer = createPlayer(singlePlayerRuntime);

  singlePlayer.health = 40;
  singlePlayer.max_health = 100;
  singlePlayerHead.item = requireItem("Ancient Head");
  singlePlayerHead.spawnflags = 0;

  assertBoolean(Pickup_AncientHead(singlePlayerHead, singlePlayer, singlePlayerRuntime), true, "Pickup_AncientHead accepts single-player ancient head");
  assertNumber(singlePlayer.max_health, 102, "Pickup_AncientHead increments max_health by two");
  assertNumber(singlePlayer.health, 40, "Pickup_AncientHead does not top up current health");
  assertNumber(singlePlayerHead.nextthink, 0, "Pickup_AncientHead does not respawn single-player ancient head");

  const deathmatchRuntime = createHarnessRuntime();
  deathmatchRuntime.deathmatch = true;
  deathmatchRuntime.time = 20;
  const deathmatchHead = spawnFreeableEntity(deathmatchRuntime);
  const deathmatchPlayer = createPlayer(deathmatchRuntime);
  const ancientHead = requireItem("Ancient Head");

  deathmatchPlayer.health = 80;
  deathmatchPlayer.max_health = 100;
  deathmatchHead.item = ancientHead;
  deathmatchHead.spawnflags = 0;
  deathmatchHead.touch = Touch_Item;
  deathmatchHead.solid = SOLID_TRIGGER;
  linkGameEntity(deathmatchRuntime, deathmatchHead);

  Touch_Item(deathmatchHead, deathmatchPlayer, deathmatchRuntime);

  assertNumber(deathmatchPlayer.max_health, 102, "Touch_Item routes Ancient Head max_health gain in deathmatch");
  assertNumber(deathmatchPlayer.health, 80, "Deathmatch Ancient Head does not top up current health");
  assertNumber(deathmatchHead.svflags & SVF_NOCLIENT, SVF_NOCLIENT, "Deathmatch Ancient Head is hidden for respawn");
  assertNumber(deathmatchHead.solid, SOLID_NOT, "Deathmatch Ancient Head is made nonsolid while respawning");
  assertNumber(deathmatchHead.nextthink, 80, "Deathmatch Ancient Head uses item quantity as respawn delay");
  assertNumber(deathmatchPlayer.client!.ps.stats[STAT_PICKUP_STRING], CS_ITEMS + ancientHead.index, "Touch_Item reports the Ancient Head pickup string");
  assertBoolean(drainGameSoundEvents(deathmatchRuntime).some((event) => event.soundPath === "items/pkup.wav"), true, "Touch_Item queues the Ancient Head pickup sound");

  const droppedRuntime = createHarnessRuntime();
  droppedRuntime.deathmatch = true;
  const droppedHead = spawnFreeableEntity(droppedRuntime);
  const droppedPlayer = createPlayer(droppedRuntime);

  droppedPlayer.health = 25;
  droppedPlayer.max_health = 100;
  droppedHead.item = ancientHead;
  droppedHead.spawnflags = DROPPED_ITEM;

  assertBoolean(Pickup_AncientHead(droppedHead, droppedPlayer, droppedRuntime), true, "Pickup_AncientHead accepts dropped ancient head");
  assertNumber(droppedPlayer.max_health, 102, "Dropped Ancient Head still increments max_health");
  assertNumber(droppedHead.nextthink, 0, "Dropped Ancient Head does not schedule map-item respawn");
}

function verifyPickupBandolierAmmoCapsAndRespawn(): void {
  const singlePlayerRuntime = createHarnessRuntime();
  const singlePlayerBandolier = spawnFreeableEntity(singlePlayerRuntime);
  const singlePlayer = createPlayer(singlePlayerRuntime);
  const bandolier = requireItem("Bandolier");
  const bullets = requireItem("Bullets");
  const shells = requireItem("Shells");
  const cells = requireItem("Cells");
  const slugs = requireItem("Slugs");

  singlePlayerBandolier.item = bandolier;
  singlePlayer.client!.pers.max_bullets = 240;
  singlePlayer.client!.pers.max_shells = 149;
  singlePlayer.client!.pers.max_cells = 120;
  singlePlayer.client!.pers.max_slugs = 20;
  singlePlayer.client!.pers.inventory[bullets.index] = 225;
  singlePlayer.client!.pers.inventory[shells.index] = 145;
  singlePlayer.client!.pers.inventory[cells.index] = 7;
  singlePlayer.client!.pers.inventory[slugs.index] = 3;

  assertBoolean(Pickup_Bandolier(singlePlayerBandolier, singlePlayer, singlePlayerRuntime), true, "Pickup_Bandolier accepts the map bandolier");
  assertNumber(singlePlayer.client!.pers.max_bullets, 250, "Pickup_Bandolier raises max_bullets to the C minimum");
  assertNumber(singlePlayer.client!.pers.max_shells, 150, "Pickup_Bandolier raises max_shells to the C minimum");
  assertNumber(singlePlayer.client!.pers.max_cells, 250, "Pickup_Bandolier raises max_cells to the C minimum");
  assertNumber(singlePlayer.client!.pers.max_slugs, 75, "Pickup_Bandolier raises max_slugs to the C minimum");
  assertNumber(singlePlayer.client!.pers.inventory[bullets.index], 250, "Pickup_Bandolier grants Bullets quantity and clamps to max_bullets");
  assertNumber(singlePlayer.client!.pers.inventory[shells.index], 150, "Pickup_Bandolier grants Shells quantity and clamps to max_shells");
  assertNumber(singlePlayer.client!.pers.inventory[cells.index], 7, "Pickup_Bandolier does not grant Cells ammo");
  assertNumber(singlePlayer.client!.pers.inventory[slugs.index], 3, "Pickup_Bandolier does not grant Slugs ammo");
  assertNumber(singlePlayerBandolier.nextthink, 0, "Pickup_Bandolier does not respawn single-player bandolier");

  const deathmatchRuntime = createHarnessRuntime();
  deathmatchRuntime.deathmatch = true;
  deathmatchRuntime.time = 9;
  const deathmatchBandolier = spawnFreeableEntity(deathmatchRuntime);
  const deathmatchPlayer = createPlayer(deathmatchRuntime);

  deathmatchBandolier.item = bandolier;
  deathmatchBandolier.touch = Touch_Item;
  deathmatchBandolier.solid = SOLID_TRIGGER;
  deathmatchPlayer.client!.pers.max_bullets = 300;
  deathmatchPlayer.client!.pers.max_shells = 200;
  deathmatchPlayer.client!.pers.max_cells = 300;
  deathmatchPlayer.client!.pers.max_slugs = 100;
  deathmatchPlayer.client!.pers.inventory[bullets.index] = 1;
  deathmatchPlayer.client!.pers.inventory[shells.index] = 2;
  linkGameEntity(deathmatchRuntime, deathmatchBandolier);

  Touch_Item(deathmatchBandolier, deathmatchPlayer, deathmatchRuntime);

  assertNumber(deathmatchPlayer.client!.pers.max_bullets, 300, "Pickup_Bandolier preserves higher max_bullets");
  assertNumber(deathmatchPlayer.client!.pers.max_shells, 200, "Pickup_Bandolier preserves higher max_shells");
  assertNumber(deathmatchPlayer.client!.pers.inventory[bullets.index], 51, "Touch_Item routes Bandolier bullet grant through FindItem quantity");
  assertNumber(deathmatchPlayer.client!.pers.inventory[shells.index], 12, "Touch_Item routes Bandolier shell grant through FindItem quantity");
  assertNumber(deathmatchBandolier.svflags & SVF_NOCLIENT, SVF_NOCLIENT, "Deathmatch Bandolier is hidden for respawn");
  assertNumber(deathmatchBandolier.solid, SOLID_NOT, "Deathmatch Bandolier is made nonsolid while respawning");
  assertNumber(deathmatchBandolier.nextthink, 69, "Deathmatch Bandolier uses item quantity as respawn delay");
  assertNumber(deathmatchPlayer.client!.ps.stats[STAT_PICKUP_STRING], CS_ITEMS + bandolier.index, "Touch_Item reports the Bandolier pickup string");
  assertBoolean(drainGameSoundEvents(deathmatchRuntime).some((event) => event.soundPath === "items/pkup.wav"), true, "Touch_Item queues the Bandolier pickup sound");

  const droppedRuntime = createHarnessRuntime();
  droppedRuntime.deathmatch = true;
  const droppedBandolier = spawnFreeableEntity(droppedRuntime);
  const droppedPlayer = createPlayer(droppedRuntime);

  droppedBandolier.item = bandolier;
  droppedBandolier.spawnflags = DROPPED_ITEM;

  assertBoolean(Pickup_Bandolier(droppedBandolier, droppedPlayer, droppedRuntime), true, "Pickup_Bandolier accepts dropped bandolier");
  assertNumber(droppedBandolier.nextthink, 0, "Dropped Bandolier does not schedule map-item respawn");
}

function verifyPickupPackAmmoCapsAndRespawn(): void {
  const singlePlayerRuntime = createHarnessRuntime();
  const singlePlayerPack = spawnFreeableEntity(singlePlayerRuntime);
  const singlePlayer = createPlayer(singlePlayerRuntime);
  const pack = requireItem("Ammo Pack");
  const bullets = requireItem("Bullets");
  const shells = requireItem("Shells");
  const cells = requireItem("Cells");
  const grenades = requireItem("Grenades");
  const rockets = requireItem("Rockets");
  const slugs = requireItem("Slugs");

  singlePlayerPack.item = pack;
  singlePlayer.client!.pers.max_bullets = 290;
  singlePlayer.client!.pers.max_shells = 195;
  singlePlayer.client!.pers.max_rockets = 98;
  singlePlayer.client!.pers.max_grenades = 96;
  singlePlayer.client!.pers.max_cells = 275;
  singlePlayer.client!.pers.max_slugs = 95;
  singlePlayer.client!.pers.inventory[bullets.index] = 280;
  singlePlayer.client!.pers.inventory[shells.index] = 193;
  singlePlayer.client!.pers.inventory[cells.index] = 260;
  singlePlayer.client!.pers.inventory[grenades.index] = 98;
  singlePlayer.client!.pers.inventory[rockets.index] = 96;
  singlePlayer.client!.pers.inventory[slugs.index] = 92;

  assertBoolean(Pickup_Pack(singlePlayerPack, singlePlayer, singlePlayerRuntime), true, "Pickup_Pack accepts the map ammo pack");
  assertNumber(singlePlayer.client!.pers.max_bullets, 300, "Pickup_Pack raises max_bullets to the C minimum");
  assertNumber(singlePlayer.client!.pers.max_shells, 200, "Pickup_Pack raises max_shells to the C minimum");
  assertNumber(singlePlayer.client!.pers.max_rockets, 100, "Pickup_Pack raises max_rockets to the C minimum");
  assertNumber(singlePlayer.client!.pers.max_grenades, 100, "Pickup_Pack raises max_grenades to the C minimum");
  assertNumber(singlePlayer.client!.pers.max_cells, 300, "Pickup_Pack raises max_cells to the C minimum");
  assertNumber(singlePlayer.client!.pers.max_slugs, 100, "Pickup_Pack raises max_slugs to the C minimum");
  assertNumber(singlePlayer.client!.pers.inventory[bullets.index], 300, "Pickup_Pack grants Bullets quantity and clamps to max_bullets");
  assertNumber(singlePlayer.client!.pers.inventory[shells.index], 200, "Pickup_Pack grants Shells quantity and clamps to max_shells");
  assertNumber(singlePlayer.client!.pers.inventory[cells.index], 300, "Pickup_Pack grants Cells quantity and clamps to max_cells");
  assertNumber(singlePlayer.client!.pers.inventory[grenades.index], 100, "Pickup_Pack grants Grenades quantity and clamps to max_grenades");
  assertNumber(singlePlayer.client!.pers.inventory[rockets.index], 100, "Pickup_Pack grants Rockets quantity and clamps to max_rockets");
  assertNumber(singlePlayer.client!.pers.inventory[slugs.index], 100, "Pickup_Pack grants Slugs quantity and clamps to max_slugs");
  assertNumber(singlePlayerPack.nextthink, 0, "Pickup_Pack does not respawn single-player ammo pack");

  const deathmatchRuntime = createHarnessRuntime();
  deathmatchRuntime.deathmatch = true;
  deathmatchRuntime.time = 13;
  const deathmatchPack = spawnFreeableEntity(deathmatchRuntime);
  const deathmatchPlayer = createPlayer(deathmatchRuntime);

  deathmatchPack.item = pack;
  deathmatchPack.touch = Touch_Item;
  deathmatchPack.solid = SOLID_TRIGGER;
  deathmatchPlayer.client!.pers.max_bullets = 350;
  deathmatchPlayer.client!.pers.max_shells = 225;
  deathmatchPlayer.client!.pers.max_rockets = 125;
  deathmatchPlayer.client!.pers.max_grenades = 125;
  deathmatchPlayer.client!.pers.max_cells = 350;
  deathmatchPlayer.client!.pers.max_slugs = 125;
  deathmatchPlayer.client!.pers.inventory[bullets.index] = 1;
  deathmatchPlayer.client!.pers.inventory[shells.index] = 2;
  deathmatchPlayer.client!.pers.inventory[cells.index] = 3;
  deathmatchPlayer.client!.pers.inventory[grenades.index] = 4;
  deathmatchPlayer.client!.pers.inventory[rockets.index] = 5;
  deathmatchPlayer.client!.pers.inventory[slugs.index] = 6;
  linkGameEntity(deathmatchRuntime, deathmatchPack);

  Touch_Item(deathmatchPack, deathmatchPlayer, deathmatchRuntime);

  assertNumber(deathmatchPlayer.client!.pers.max_bullets, 350, "Pickup_Pack preserves higher max_bullets");
  assertNumber(deathmatchPlayer.client!.pers.max_shells, 225, "Pickup_Pack preserves higher max_shells");
  assertNumber(deathmatchPlayer.client!.pers.max_rockets, 125, "Pickup_Pack preserves higher max_rockets");
  assertNumber(deathmatchPlayer.client!.pers.max_grenades, 125, "Pickup_Pack preserves higher max_grenades");
  assertNumber(deathmatchPlayer.client!.pers.max_cells, 350, "Pickup_Pack preserves higher max_cells");
  assertNumber(deathmatchPlayer.client!.pers.max_slugs, 125, "Pickup_Pack preserves higher max_slugs");
  assertNumber(deathmatchPlayer.client!.pers.inventory[bullets.index], 51, "Touch_Item routes Pack bullet grant through FindItem quantity");
  assertNumber(deathmatchPlayer.client!.pers.inventory[shells.index], 12, "Touch_Item routes Pack shell grant through FindItem quantity");
  assertNumber(deathmatchPlayer.client!.pers.inventory[cells.index], 53, "Touch_Item routes Pack cell grant through FindItem quantity");
  assertNumber(deathmatchPlayer.client!.pers.inventory[grenades.index], 9, "Touch_Item routes Pack grenade grant through FindItem quantity");
  assertNumber(deathmatchPlayer.client!.pers.inventory[rockets.index], 10, "Touch_Item routes Pack rocket grant through FindItem quantity");
  assertNumber(deathmatchPlayer.client!.pers.inventory[slugs.index], 16, "Touch_Item routes Pack slug grant through FindItem quantity");
  assertNumber(deathmatchPack.svflags & SVF_NOCLIENT, SVF_NOCLIENT, "Deathmatch Pack is hidden for respawn");
  assertNumber(deathmatchPack.solid, SOLID_NOT, "Deathmatch Pack is made nonsolid while respawning");
  assertNumber(deathmatchPack.nextthink, 193, "Deathmatch Pack uses item quantity as respawn delay");
  assertNumber(deathmatchPlayer.client!.ps.stats[STAT_PICKUP_STRING], CS_ITEMS + pack.index, "Touch_Item reports the Ammo Pack pickup string");
  assertBoolean(drainGameSoundEvents(deathmatchRuntime).some((event) => event.soundPath === "items/pkup.wav"), true, "Touch_Item queues the Ammo Pack pickup sound");

  const droppedRuntime = createHarnessRuntime();
  droppedRuntime.deathmatch = true;
  const droppedPack = spawnFreeableEntity(droppedRuntime);
  const droppedPlayer = createPlayer(droppedRuntime);

  droppedPack.item = pack;
  droppedPack.spawnflags = DROPPED_ITEM;

  assertBoolean(Pickup_Pack(droppedPack, droppedPlayer, droppedRuntime), true, "Pickup_Pack accepts dropped ammo pack");
  assertNumber(droppedPack.nextthink, 0, "Dropped Pack does not schedule map-item respawn");
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

function verifyDropGeneralInventoryAndSelection(): void {
  const runtime = createHarnessRuntime();
  const quad = requireItem("Quad Damage");
  const player = createPlayer(runtime);
  player.s.origin = [2, 4, 6];
  player.origin = [2, 4, 6];
  player.client!.v_angle = [0, 0, 0];
  player.client!.pers.inventory[quad.index] = 1;
  player.client!.pers.selected_item = quad.index;

  const entityCountBeforeDrop = runtime.entities.length;
  Drop_General(player, quad, runtime);
  const dropped = runtime.entities.at(-1);

  assertNumber(player.client!.pers.inventory[quad.index], 0, "Drop_General decrements exactly one inventory slot");
  assertNumber(player.client!.pers.selected_item, -1, "Drop_General validates away an emptied selected item");
  assertNumber(runtime.entities.length, entityCountBeforeDrop + 1, "Drop_General creates one visible dropped item entity");
  assertBoolean(dropped?.item === quad, true, "Drop_General delegates to Drop_Item with the same item definition");
  assertNumber(dropped?.spawnflags ?? 0, DROPPED_ITEM, "Drop_General produces a dropped item entity");
  assertNumber(dropped?.solid ?? 0, SOLID_TRIGGER, "Drop_General leaves the dropped item touchable for snapshots/runtime pickup");
  assertNumber(dropped?.s.modelindex && dropped.s.modelindex > 0 ? 1 : 0, 1, "Drop_General produces a renderer-visible item model");
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

function verifyPrecacheItemAssetsAndValidation(): void {
  const runtime = createHarnessRuntime();
  const shotgun = requireItem("Shotgun");

  PrecacheItem(runtime, shotgun);

  assertBoolean(runtime.assets.soundPaths.includes("misc/w_pkup.wav"), true, "PrecacheItem registers pickup_sound");
  assertBoolean(runtime.assets.modelPaths.includes("models/weapons/g_shotg/tris.md2"), true, "PrecacheItem registers world_model");
  assertBoolean(runtime.assets.modelPaths.includes("models/weapons/v_shotg/tris.md2"), true, "PrecacheItem registers view_model");
  assertBoolean(runtime.assets.imagePaths.includes("w_shotgun"), true, "PrecacheItem registers icon");
  assertBoolean(runtime.assets.modelPaths.includes("models/items/ammo/shells/medium/tris.md2"), true, "PrecacheItem recursively precaches the ammo item");
  assertBoolean(runtime.assets.imagePaths.includes("a_shells"), true, "PrecacheItem recursively registers the ammo icon");
  assertBoolean(runtime.assets.soundPaths.includes("weapons/shotgf1b.wav"), true, "PrecacheItem parses wav precache tokens");

  const badItem: GameItemDefinition = {
    ...shotgun,
    classname: "weapon_bad_precache",
    precaches: "bad"
  };
  assertThrows(() => PrecacheItem(createHarnessRuntime(), badItem), "bad precache string", "PrecacheItem rejects tokens shorter than the original minimum");

  const longItem: GameItemDefinition = {
    ...shotgun,
    classname: "weapon_long_precache",
    precaches: `${"a".repeat(61)}.wav`
  };
  assertThrows(() => PrecacheItem(createHarnessRuntime(), longItem), "bad precache string", "PrecacheItem rejects tokens at or beyond MAX_QPATH");
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

function verifyPickupPowerArmorIndexQuantityAndRespawn(): void {
  const powerShield = requireItem("Power Shield");
  const cells = requireItem("Cells");

  const firstRuntime = createHarnessRuntime();
  firstRuntime.deathmatch = true;
  firstRuntime.time = 12;
  const firstPlayer = createPlayer(firstRuntime);
  const firstEntity = spawnFreeableEntity(firstRuntime);
  firstEntity.item = powerShield;
  firstEntity.svflags = 0;
  firstEntity.solid = SOLID_TRIGGER;
  firstPlayer.client!.pers.inventory[cells.index] = 3;
  firstPlayer.client!.pers.inventory[powerShield.index] = 0;

  assertBoolean(Pickup_PowerArmor(firstEntity, firstPlayer, firstRuntime), true, "Pickup_PowerArmor accepts a deathmatch map power armor");
  assertNumber(firstPlayer.client!.pers.inventory[powerShield.index], 1, "Pickup_PowerArmor increments inventory through ITEM_INDEX(item)");
  assertNumber(firstEntity.nextthink, 72, "Pickup_PowerArmor schedules deathmatch respawn using item.quantity");
  assertNumber(firstEntity.svflags & SVF_NOCLIENT, SVF_NOCLIENT, "Pickup_PowerArmor hides respawning map items");
  assertNumber(firstEntity.solid, SOLID_NOT, "Pickup_PowerArmor makes respawning map items nonsolid");
  assertBoolean((firstPlayer.flags & FL_POWER_ARMOR) !== 0, true, "Pickup_PowerArmor auto-uses the first deathmatch pickup from pre-increment quantity");

  const secondRuntime = createHarnessRuntime();
  secondRuntime.deathmatch = true;
  const secondPlayer = createPlayer(secondRuntime);
  const secondEntity = spawnFreeableEntity(secondRuntime);
  secondEntity.item = powerShield;
  secondEntity.spawnflags = DROPPED_ITEM;
  secondPlayer.client!.pers.inventory[cells.index] = 3;
  secondPlayer.client!.pers.inventory[powerShield.index] = 1;

  assertBoolean(Pickup_PowerArmor(secondEntity, secondPlayer, secondRuntime), true, "Pickup_PowerArmor accepts a dropped power armor");
  assertNumber(secondPlayer.client!.pers.inventory[powerShield.index], 2, "Pickup_PowerArmor preserves the ITEM_INDEX slot for repeated pickups");
  assertNumber(secondEntity.nextthink, 0, "Pickup_PowerArmor does not respawn dropped items");
  assertNumber(secondPlayer.flags & FL_POWER_ARMOR, 0, "Pickup_PowerArmor does not auto-use when pre-increment quantity was nonzero");
}

function verifyPickupPowerupLimitsRespawnAndInstantUse(): void {
  const quad = requireItem("Quad Damage");
  const invulnerability = requireItem("Invulnerability");
  const breather = requireItem("Rebreather");

  const normalSkillRuntime = createHarnessRuntime();
  normalSkillRuntime.skill = 1;
  const normalSkillPlayer = createPlayer(normalSkillRuntime);
  normalSkillPlayer.client!.pers.inventory[quad.index] = 2;
  const normalSkillQuad = spawnFreeableEntity(normalSkillRuntime);
  normalSkillQuad.item = quad;
  assertBoolean(Pickup_Powerup(normalSkillQuad, normalSkillPlayer, normalSkillRuntime), false, "Pickup_Powerup rejects a third powerup on skill 1");
  assertNumber(normalSkillPlayer.client!.pers.inventory[quad.index], 2, "Pickup_Powerup leaves inventory unchanged when skill 1 cap rejects pickup");

  const hardSkillRuntime = createHarnessRuntime();
  hardSkillRuntime.skill = 2;
  const hardSkillPlayer = createPlayer(hardSkillRuntime);
  hardSkillPlayer.client!.pers.inventory[quad.index] = 1;
  const hardSkillQuad = spawnFreeableEntity(hardSkillRuntime);
  hardSkillQuad.item = quad;
  assertBoolean(Pickup_Powerup(hardSkillQuad, hardSkillPlayer, hardSkillRuntime), false, "Pickup_Powerup rejects a second powerup on skill 2+");
  assertNumber(hardSkillPlayer.client!.pers.inventory[quad.index], 1, "Pickup_Powerup leaves inventory unchanged when skill 2 cap rejects pickup");

  const coopRuntime = createHarnessRuntime();
  coopRuntime.coop = true;
  const coopPlayer = createPlayer(coopRuntime);
  coopPlayer.client!.pers.inventory[breather.index] = 1;
  const coopBreather = spawnFreeableEntity(coopRuntime);
  coopBreather.item = breather;
  assertBoolean(Pickup_Powerup(coopBreather, coopPlayer, coopRuntime), false, "Pickup_Powerup rejects duplicate IT_STAY_COOP powerups in coop");
  assertNumber(coopPlayer.client!.pers.inventory[breather.index], 1, "Pickup_Powerup leaves coop duplicate inventory unchanged");

  const respawnRuntime = createHarnessRuntime();
  respawnRuntime.deathmatch = true;
  respawnRuntime.time = 7;
  const respawnPlayer = createPlayer(respawnRuntime);
  const respawnQuad = spawnFreeableEntity(respawnRuntime);
  respawnQuad.item = quad;
  respawnQuad.svflags = 0;
  respawnQuad.solid = SOLID_TRIGGER;
  assertBoolean(Pickup_Powerup(respawnQuad, respawnPlayer, respawnRuntime), true, "Pickup_Powerup accepts a deathmatch map powerup");
  assertNumber(respawnPlayer.client!.pers.inventory[quad.index], 1, "Pickup_Powerup grants one stored powerup without instant items");
  assertNumber(respawnQuad.svflags & SVF_NOCLIENT, SVF_NOCLIENT, "Pickup_Powerup hides map powerups through SetRespawn");
  assertNumber(respawnQuad.solid, SOLID_NOT, "Pickup_Powerup makes respawning map powerups nonsolid");
  assertNumber(respawnQuad.nextthink, 67, "Pickup_Powerup schedules deathmatch respawn using item quantity");
  assertBoolean(respawnQuad.think !== null, true, "Pickup_Powerup installs the respawn think callback");

  const instantRuntime = createHarnessRuntime();
  instantRuntime.deathmatch = true;
  instantRuntime.dmflags = DF_INSTANT_ITEMS;
  instantRuntime.time = 4;
  instantRuntime.framenum = 50;
  const instantPlayer = createPlayer(instantRuntime);
  const instantInvulnerability = spawnFreeableEntity(instantRuntime);
  instantInvulnerability.item = invulnerability;
  instantInvulnerability.svflags = 0;
  instantInvulnerability.solid = SOLID_TRIGGER;

  Touch_Item(instantInvulnerability, instantPlayer, instantRuntime);

  assertNumber(instantPlayer.client!.pers.inventory[invulnerability.index], 0, "Pickup_Powerup auto-use consumes instant deathmatch powerups");
  assertNumber(instantPlayer.client!.invincible_framenum, 350, "Pickup_Powerup instant use starts the original invulnerability timer");
  assertNumber(instantInvulnerability.svflags & SVF_NOCLIENT, SVF_NOCLIENT, "Pickup_Powerup instant map item remains hidden for respawn");
  assertNumber(instantInvulnerability.solid, SOLID_NOT, "Pickup_Powerup instant map item remains nonsolid for respawn");
  assertNumber(instantInvulnerability.nextthink, 304, "Pickup_Powerup instant map item uses item quantity as respawn delay");
  assertNumber(instantPlayer.client!.ps.stats[STAT_PICKUP_STRING], CS_ITEMS + invulnerability.index, "Touch_Item reports the powerup pickup string");
  assertNumber(instantPlayer.client!.ps.stats[STAT_PICKUP_ICON] > 0 ? 1 : 0, 1, "Touch_Item reports the powerup pickup icon");

  const sounds = drainGameSoundEvents(instantRuntime);
  assertBoolean(sounds.some((event) => event.soundPath === "items/pkup.wav"), true, "Touch_Item queues the powerup pickup sound");
  assertBoolean(sounds.some((event) => event.soundPath === "items/protect.wav"), true, "Pickup_Powerup instant use queues the use sound");

  G_SetStats(instantPlayer, instantRuntime);
  assertNumber(instantPlayer.client!.ps.stats[STAT_TIMER], 30, "Pickup_Powerup instant use feeds the HUD timer");
  assertNumber(instantPlayer.client!.ps.stats[STAT_TIMER_ICON] > 0 ? 1 : 0, 1, "Pickup_Powerup instant use feeds the HUD timer icon");

  G_SetClientEffects(instantPlayer, instantRuntime);
  assertNumber(instantPlayer.s.effects & EF_PENT, EF_PENT, "Pickup_Powerup instant use produces the visible invulnerability effect");
}

function verifyUseQuadTimeoutAndDroppedHack(): void {
  const quad = requireItem("Quad Damage");

  const directRuntime = createHarnessRuntime();
  directRuntime.framenum = 100;
  const directPlayer = createPlayer(directRuntime);
  directPlayer.client!.pers.inventory[quad.index] = 2;
  directPlayer.client!.pers.selected_item = quad.index;
  Use_Quad(directPlayer, quad, directRuntime);
  assertNumber(directPlayer.client!.pers.inventory[quad.index], 1, "Use_Quad consumes one Quad inventory slot");
  assertNumber(directPlayer.client!.quad_framenum, 400, "Use_Quad starts the original 300-frame timeout");
  assertNumber(directPlayer.client!.pers.selected_item, quad.index, "Use_Quad keeps a still-owned selected Quad valid");
  assertBoolean(drainGameSoundEvents(directRuntime).some((event) => event.soundPath === "items/damage.wav"), true, "Use_Quad queues the original activation sound");

  directPlayer.client!.pers.inventory[quad.index] = 1;
  Use_Quad(directPlayer, quad, directRuntime);
  assertNumber(directPlayer.client!.quad_framenum, 700, "Use_Quad extends an active Quad by the same timeout");
  assertNumber(directPlayer.client!.pers.selected_item, -1, "Use_Quad revalidates selected item after consuming the last Quad");

  const droppedRuntime = createHarnessRuntime();
  droppedRuntime.deathmatch = true;
  droppedRuntime.dmflags = DF_INSTANT_ITEMS;
  droppedRuntime.time = 12;
  droppedRuntime.framenum = 120;
  const droppedPlayer = createPlayer(droppedRuntime);
  const droppedQuad = spawnFreeableEntity(droppedRuntime);
  droppedQuad.classname = "item_quad";
  droppedQuad.item = quad;
  droppedQuad.spawnflags = DROPPED_ITEM | DROPPED_PLAYER_ITEM;
  droppedQuad.nextthink = 20;

  Touch_Item(droppedQuad, droppedPlayer, droppedRuntime);

  assertNumber(droppedPlayer.client!.pers.inventory[quad.index], 0, "Dropped instant Quad is used immediately after pickup");
  assertNumber(droppedPlayer.client!.quad_framenum, 200, "Dropped instant Quad keeps its remaining timeout through quad_drop_timeout_hack");
}

function verifyUseBreatherTimeout(): void {
  const breather = requireItem("Rebreather");
  const runtime = createHarnessRuntime();
  runtime.framenum = 200;
  const player = createPlayer(runtime);
  player.client!.pers.inventory[breather.index] = 2;
  player.client!.pers.selected_item = breather.index;

  Use_Breather(player, breather, runtime);

  assertNumber(player.client!.pers.inventory[breather.index], 1, "Use_Breather consumes one Rebreather inventory slot");
  assertNumber(player.client!.breather_framenum, 500, "Use_Breather starts the original 300-frame timeout");
  assertNumber(player.client!.pers.selected_item, breather.index, "Use_Breather keeps a still-owned selected Rebreather valid");
  assertNumber(drainGameSoundEvents(runtime).length, 0, "Use_Breather preserves the original commented-out activation sound");

  G_SetStats(player, runtime);
  assertNumber(player.client!.ps.stats[STAT_TIMER], 30, "Use_Breather feeds the HUD timer through breather_framenum");
  assertNumber(player.client!.ps.stats[STAT_TIMER_ICON] > 0 ? 1 : 0, 1, "Use_Breather feeds the HUD Rebreather timer icon");

  player.client!.pers.inventory[breather.index] = 1;
  Use_Breather(player, breather, runtime);

  assertNumber(player.client!.breather_framenum, 800, "Use_Breather extends an active Rebreather by the same timeout");
  assertNumber(player.client!.pers.selected_item, -1, "Use_Breather revalidates selected item after consuming the last Rebreather");
}

function verifyUseEnvirosuitTimeout(): void {
  const envirosuit = requireItem("Environment Suit");
  const runtime = createHarnessRuntime();
  runtime.framenum = 200;
  const player = createPlayer(runtime);
  player.client!.pers.inventory[envirosuit.index] = 2;
  player.client!.pers.selected_item = envirosuit.index;

  Use_Envirosuit(player, envirosuit, runtime);

  assertNumber(player.client!.pers.inventory[envirosuit.index], 1, "Use_Envirosuit consumes one Environment Suit inventory slot");
  assertNumber(player.client!.enviro_framenum, 500, "Use_Envirosuit starts the original 300-frame timeout");
  assertNumber(player.client!.pers.selected_item, envirosuit.index, "Use_Envirosuit keeps a still-owned Environment Suit selected");
  assertNumber(drainGameSoundEvents(runtime).length, 0, "Use_Envirosuit preserves the original commented-out activation sound");

  G_SetStats(player, runtime);
  assertNumber(player.client!.ps.stats[STAT_TIMER], 30, "Use_Envirosuit feeds the HUD timer through enviro_framenum");
  assertNumber(player.client!.ps.stats[STAT_TIMER_ICON] > 0 ? 1 : 0, 1, "Use_Envirosuit feeds the HUD Environment Suit timer icon");

  player.client!.pers.inventory[envirosuit.index] = 1;
  Use_Envirosuit(player, envirosuit, runtime);

  assertNumber(player.client!.enviro_framenum, 800, "Use_Envirosuit extends an active Environment Suit by the same timeout");
  assertNumber(player.client!.pers.selected_item, -1, "Use_Envirosuit revalidates selected item after consuming the last Environment Suit");
}

function verifyUseInvulnerabilityTimeout(): void {
  const invulnerability = requireItem("Invulnerability");
  const runtime = createHarnessRuntime();
  runtime.framenum = 200;
  const player = createPlayer(runtime);
  player.client!.pers.inventory[invulnerability.index] = 2;
  player.client!.pers.selected_item = invulnerability.index;

  Use_Invulnerability(player, invulnerability, runtime);

  assertNumber(player.client!.pers.inventory[invulnerability.index], 1, "Use_Invulnerability consumes one Invulnerability inventory slot");
  assertNumber(player.client!.invincible_framenum, 500, "Use_Invulnerability starts the original 300-frame timeout");
  assertNumber(player.client!.pers.selected_item, invulnerability.index, "Use_Invulnerability keeps a still-owned Invulnerability selected");
  assertBoolean(drainGameSoundEvents(runtime).some((event) => event.soundPath === "items/protect.wav"), true, "Use_Invulnerability queues the original activation sound");

  G_SetStats(player, runtime);
  assertNumber(player.client!.ps.stats[STAT_TIMER], 30, "Use_Invulnerability feeds the HUD timer through invincible_framenum");
  assertNumber(player.client!.ps.stats[STAT_TIMER_ICON] > 0 ? 1 : 0, 1, "Use_Invulnerability feeds the HUD Invulnerability timer icon");

  G_SetClientEffects(player, runtime);
  assertNumber(player.s.effects & EF_PENT, EF_PENT, "Use_Invulnerability produces the visible EF_PENT effect");

  player.client!.pers.inventory[invulnerability.index] = 1;
  Use_Invulnerability(player, invulnerability, runtime);

  assertNumber(player.client!.invincible_framenum, 800, "Use_Invulnerability extends an active Invulnerability by the same timeout");
  assertNumber(player.client!.pers.selected_item, -1, "Use_Invulnerability revalidates selected item after consuming the last Invulnerability");
}

function verifyUseSilencerShots(): void {
  const silencer = requireItem("Silencer");
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  player.client!.pers.inventory[silencer.index] = 2;
  player.client!.pers.selected_item = silencer.index;

  Use_Silencer(player, silencer, runtime);

  assertNumber(player.client!.pers.inventory[silencer.index], 1, "Use_Silencer consumes one Silencer inventory slot");
  assertNumber(player.client!.silencer_shots, 30, "Use_Silencer grants the original 30 silenced shots");
  assertNumber(player.client!.pers.selected_item, silencer.index, "Use_Silencer keeps a still-owned Silencer selected");
  assertNumber(drainGameSoundEvents(runtime).length, 0, "Use_Silencer preserves the original commented-out activation sound");

  Use_Silencer(player, silencer, runtime);

  assertNumber(player.client!.silencer_shots, 60, "Use_Silencer stacks another 30 silenced shots on repeated use");
  assertNumber(player.client!.pers.selected_item, -1, "Use_Silencer revalidates selected item after consuming the last Silencer");
}

function verifyPickupKeyCoopAndPowerCubeRules(): void {
  const dataCd = requireItem("Data CD");
  const powerCube = requireItem("Power Cube");

  const soloRuntime = createHarnessRuntime();
  const soloPlayer = createPlayer(soloRuntime);
  const soloKey = spawnGameEntity(soloRuntime);
  soloKey.classname = "key_data_cd";
  soloKey.item = dataCd;

  assertBoolean(Pickup_Key(soloKey, soloPlayer, soloRuntime), true, "Pickup_Key accepts a single-player key pickup");
  assertBoolean(Pickup_Key(soloKey, soloPlayer, soloRuntime), true, "Pickup_Key accepts duplicate single-player key pickups");
  assertNumber(soloPlayer.client!.pers.inventory[dataCd.index], 2, "Pickup_Key increments non-coop key inventory each time");

  const coopRuntime = createHarnessRuntime();
  coopRuntime.coop = true;
  const coopPlayer = createPlayer(coopRuntime);
  const coopKey = spawnGameEntity(coopRuntime);
  coopKey.classname = "key_data_cd";
  coopKey.item = dataCd;

  assertBoolean(Pickup_Key(coopKey, coopPlayer, coopRuntime), true, "Pickup_Key accepts the first coop normal key pickup");
  assertNumber(coopPlayer.client!.pers.inventory[dataCd.index], 1, "Pickup_Key stores coop normal keys as a single owned slot");
  assertBoolean(Pickup_Key(coopKey, coopPlayer, coopRuntime), false, "Pickup_Key rejects duplicate coop normal keys");
  assertNumber(coopPlayer.client!.pers.inventory[dataCd.index], 1, "Pickup_Key leaves duplicate coop normal key inventory unchanged");

  const cubeEntity = spawnGameEntity(coopRuntime);
  cubeEntity.classname = "key_power_cube";
  cubeEntity.item = powerCube;
  cubeEntity.spawnflags = 1 << 10;

  assertBoolean(Pickup_Key(cubeEntity, coopPlayer, coopRuntime), true, "Pickup_Key accepts the first coop power cube bit");
  assertNumber(coopPlayer.client!.pers.inventory[powerCube.index], 1, "Pickup_Key increments power cube inventory on first bit pickup");
  assertNumber(coopPlayer.client!.pers.power_cubes, 4, "Pickup_Key records the shifted coop power cube bitmask");
  assertBoolean(Pickup_Key(cubeEntity, coopPlayer, coopRuntime), false, "Pickup_Key rejects a duplicate coop power cube bit");
  assertNumber(coopPlayer.client!.pers.inventory[powerCube.index], 1, "Pickup_Key leaves duplicate power cube inventory unchanged");

  const touchRuntime = createHarnessRuntime();
  touchRuntime.coop = true;
  const touchPlayer = createPlayer(touchRuntime);
  const touchKey = spawnGameEntity(touchRuntime);
  touchKey.classname = "key_data_cd";
  touchKey.item = dataCd;
  touchPlayer.client!.pers.selected_item = -1;

  Touch_Item(touchKey, touchPlayer, touchRuntime);

  assertNumber(touchPlayer.client!.pers.inventory[dataCd.index], 1, "Touch_Item routes key pickup through Pickup_Key");
  assertNumber(touchPlayer.client!.ps.stats[STAT_PICKUP_STRING], CS_ITEMS + dataCd.index, "Touch_Item reports the key pickup string");
  assertNumber(touchPlayer.client!.ps.stats[STAT_PICKUP_ICON] > 0 ? 1 : 0, 1, "Touch_Item reports the key pickup icon");
  assertNumber(touchPlayer.client!.pers.selected_item, -1, "Touch_Item does not select keys because they have no use callback");
  assertBoolean(drainGameSoundEvents(touchRuntime).some((event) => event.soundPath === "items/pkup.wav"), true, "Touch_Item emits the key pickup sound");
  assertBoolean(touchKey.inuse, true, "Touch_Item keeps coop stay keys in the world after pickup");

  Touch_Item(touchKey, touchPlayer, touchRuntime);
  assertNumber(touchPlayer.client!.pers.inventory[dataCd.index], 1, "Touch_Item duplicate coop key rejection leaves inventory unchanged");
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

function verifySpawnItemDeathmatchFilters(): void {
  const noArmorRuntime = createHarnessRuntime();
  noArmorRuntime.deathmatch = true;
  noArmorRuntime.dmflags = DF_NO_ARMOR;
  const armorEntity = spawnFreeableEntity(noArmorRuntime);
  armorEntity.classname = "item_armor_jacket";
  SpawnItem(armorEntity, requireItem("Jacket Armor"), noArmorRuntime);
  assertNumber(armorEntity.inuse ? 1 : 0, 0, "SpawnItem frees armor when DF_NO_ARMOR is set");
  assertBoolean(noArmorRuntime.assets.modelPaths.includes("models/items/armor/jacket/tris.md2"), true, "SpawnItem precaches before deathmatch inhibition");

  const noItemsRuntime = createHarnessRuntime();
  noItemsRuntime.deathmatch = true;
  noItemsRuntime.dmflags = DF_NO_ITEMS;
  const quadEntity = spawnFreeableEntity(noItemsRuntime);
  quadEntity.classname = "item_quad";
  SpawnItem(quadEntity, requireItem("Quad Damage"), noItemsRuntime);
  assertNumber(quadEntity.inuse ? 1 : 0, 0, "SpawnItem frees powerups when DF_NO_ITEMS is set");

  const weaponRuntime = createHarnessRuntime();
  weaponRuntime.deathmatch = true;
  weaponRuntime.dmflags = DF_NO_ITEMS;
  const weaponEntity = spawnGameEntity(weaponRuntime);
  weaponEntity.classname = "weapon_shotgun";
  SpawnItem(weaponEntity, requireItem("Shotgun"), weaponRuntime);
  assertNumber(weaponEntity.inuse ? 1 : 0, 1, "SpawnItem does not treat DF_NO_ITEMS as a blanket non-key filter");

  const noHealthRuntime = createHarnessRuntime();
  noHealthRuntime.deathmatch = true;
  noHealthRuntime.dmflags = DF_NO_HEALTH;
  const healthEntity = spawnFreeableEntity(noHealthRuntime);
  healthEntity.classname = "item_health";
  SpawnItem(healthEntity, requireItem("Health"), noHealthRuntime);
  assertNumber(healthEntity.inuse ? 1 : 0, 0, "SpawnItem frees health when DF_NO_HEALTH is set");

  const infiniteAmmoRuntime = createHarnessRuntime();
  infiniteAmmoRuntime.deathmatch = true;
  infiniteAmmoRuntime.dmflags = DF_INFINITE_AMMO;
  const bulletsEntity = spawnFreeableEntity(infiniteAmmoRuntime);
  bulletsEntity.classname = "ammo_bullets";
  SpawnItem(bulletsEntity, requireItem("Bullets"), infiniteAmmoRuntime);
  assertNumber(bulletsEntity.inuse ? 1 : 0, 0, "SpawnItem frees pure ammo when DF_INFINITE_AMMO is set");

  const grenadesEntity = spawnGameEntity(infiniteAmmoRuntime);
  grenadesEntity.classname = "ammo_grenades";
  SpawnItem(grenadesEntity, requireItem("Grenades"), infiniteAmmoRuntime);
  assertNumber(grenadesEntity.inuse ? 1 : 0, 1, "SpawnItem preserves grenade weapon/ammo because item.flags is not exactly IT_AMMO");

  const bfgEntity = spawnFreeableEntity(infiniteAmmoRuntime);
  bfgEntity.classname = "weapon_bfg";
  SpawnItem(bfgEntity, requireItem("BFG10K"), infiniteAmmoRuntime);
  assertNumber(bfgEntity.inuse ? 1 : 0, 0, "SpawnItem frees weapon_bfg when DF_INFINITE_AMMO is set");
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

function assertThrows(callback: () => void, expectedMessagePart: string, label: string): void {
  try {
    callback();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes(expectedMessagePart)) {
      return;
    }
    throw new Error(`${label}: message inattendu "${message}"`);
  }

  throw new Error(`${label}: exception attendue`);
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
