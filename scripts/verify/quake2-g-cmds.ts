/**
 * File: quake2-g-cmds.ts
 * Purpose: Verify the TypeScript port of `game/g_cmds.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for player commands, inventory selection and chat dispatch.
 *
 * Dependencies:
 * - packages/game/src/g_cmds.ts
 * - packages/game/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import { DF_MODELTEAMS, MAX_ITEMS, PRINT_CHAT, PRINT_HIGH, STAT_FRAGS, type cvar_t } from "../../packages/qcommon/src/index.js";
import {
  DEAD_DEAD,
  Cmd_Drop_f,
  Cmd_Give_f,
  Cmd_Inven_f,
  Cmd_InvDrop_f,
  Cmd_InvUse_f,
  Cmd_Kill_f,
  Cmd_Players_f,
  Cmd_WeapLast_f,
  Cmd_PlayerList_f,
  Cmd_PutAway_f,
  Cmd_Say_f,
  Cmd_WeapNext_f,
  Cmd_WeapPrev_f,
  Cmd_Wave_f,
  FindItem,
  FL_GODMODE,
  GameCommandsClientCommand,
  IT_WEAPON,
  MOVETYPE_NOCLIP,
  MOVETYPE_TOSS,
  MOVETYPE_WALK,
  OnSameTeam,
  PlayerSort,
  SelectNextItem,
  SelectPrevItem,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  svc_inventory,
  type GameCommandContext,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { MOD_SUICIDE } from "../../packages/game/src/g_local.js";

const prints: Array<{ ent: GameEntity | null; level: number; message: string }> = [];
const writes: number[] = [];
const unicasts: Array<{ ent: GameEntity; reliable: boolean }> = [];
let command = { argv: ["say"], args: "hello" };

const context = createContext(createRuntime());

verifyTeamParsing();
verifyInventorySelection();
verifyCommandsAndChat();
verifyDropCommand();
verifyInventorySerialization();
verifyInventoryUseCommand();
verifyInventoryDropCommand();
verifyWeaponPreviousCommand();
verifyWeaponNextCommand();
verifyWeaponLastCommand();
verifyKillCommand();
verifyPutAwayCommand();
verifyPlayersCommand();
verifyPlayerListAndWave();

console.log("Verification g_cmds - client commands OK");

function verifyTeamParsing(): void {
  const runtime = createRuntime();
  runtime.dmflags = DF_MODELTEAMS;
  const player1 = createClient(runtime, 1, "one", "\\skin\\male/grunt");
  const player2 = createClient(runtime, 2, "two", "\\skin\\male/major");
  const player3 = createClient(runtime, 3, "three", "\\skin\\female/athena");

  assert.equal(OnSameTeam(player1, player2, runtime), true, "OnSameTeam should compare model team when DF_MODELTEAMS is set");
  assert.equal(OnSameTeam(player1, player3, runtime), false, "OnSameTeam should reject different model teams");
}

function verifyInventorySelection(): void {
  const runtime = createRuntime();
  const player = createClient(runtime, 1, "player");
  const shotgun = requireItem("Shotgun");
  const superShotgun = requireItem("Super Shotgun");

  player.client!.pers.selected_item = shotgun.index;
  player.client!.pers.inventory[shotgun.index] = 1;
  player.client!.pers.inventory[superShotgun.index] = 1;

  SelectNextItem(player, -1, runtime);
  assert.equal(player.client!.pers.selected_item, superShotgun.index, "SelectNextItem should find next usable inventory item");

  SelectPrevItem(player, IT_WEAPON, runtime);
  assert.equal(player.client!.pers.selected_item, shotgun.index, "SelectPrevItem should filter by weapon flags");
}

function verifyCommandsAndChat(): void {
  const runtime = createRuntime();
  const localContext = createContext(runtime);
  const player1 = createClient(runtime, 1, "alpha");
  const player2 = createClient(runtime, 2, "beta");

  runCommand(localContext, ["god"]);
  GameCommandsClientCommand(localContext, player1);
  assert.match(lastPrint().message, /godmode ON/, "ClientCommand should dispatch god");

  runCommand(localContext, ["noclip"]);
  GameCommandsClientCommand(localContext, player1);
  assert.equal(player1.movetype, MOVETYPE_NOCLIP, "ClientCommand should dispatch noclip ON");
  runCommand(localContext, ["noclip"]);
  GameCommandsClientCommand(localContext, player1);
  assert.equal(player1.movetype, MOVETYPE_WALK, "ClientCommand should dispatch noclip OFF");

  const shells = requireItem("Shells");
  runCommand(localContext, ["give", "Shells", "17"], "Shells");
  Cmd_Give_f(player1, localContext);
  assert.equal(player1.client!.pers.inventory[shells.index], 17, "Cmd_Give_f should grant explicit ammo count");

  runCommand(localContext, ["say", "hello"], "hello");
  Cmd_Say_f(player1, false, false, localContext);
  assert.deepEqual(
    prints.filter((entry) => entry.level === PRINT_CHAT).map((entry) => entry.ent?.index),
    [player1.index, player2.index],
    "Cmd_Say_f should send chat to all active clients"
  );
}

function verifyDropCommand(): void {
  const runtime = createRuntime();
  const localContext = createContext(runtime);
  const player = createClient(runtime, 1, "dropper");

  runCommand(localContext, ["drop", "Mystery"], "Mystery");
  Cmd_Drop_f(player, localContext);
  assert.equal(lastPrint().message, "unknown item: Mystery\n", "Cmd_Drop_f should reject unknown items");

  runCommand(localContext, ["drop", "Body Armor"], "Body Armor");
  Cmd_Drop_f(player, localContext);
  assert.equal(lastPrint().message, "Item is not dropable.\n", "Cmd_Drop_f should reject items without drop callbacks");

  const shells = requireItem("Shells");
  runCommand(localContext, ["drop", "Shells"], "Shells");
  Cmd_Drop_f(player, localContext);
  assert.equal(lastPrint().message, "Out of item: Shells\n", "Cmd_Drop_f should reject absent inventory");

  player.client!.pers.inventory[shells.index] = 25;
  Cmd_Drop_f(player, localContext);
  assert.equal(player.client!.pers.inventory[shells.index], 15, "Cmd_Drop_f should dispatch item drop and reduce inventory");
  const droppedShells = runtime.entities.find((entity) => entity.classname === shells.classname && entity.owner === player);
  assert.ok(droppedShells, "Cmd_Drop_f should spawn the dropped item entity through the item drop callback");
  assert.equal(droppedShells.count, 10, "Cmd_Drop_f should preserve the item drop quantity");
}

function verifyInventorySerialization(): void {
  const runtime = createRuntime();
  const localContext = createContext(runtime);
  const player = createClient(runtime, 1, "inventory");
  const cells = requireItem("Cells");

  player.client!.showscores = true;
  player.client!.showhelp = true;
  player.client!.pers.inventory[cells.index] = 25;
  Cmd_Inven_f(player, localContext);

  assert.equal(player.client!.showscores, false, "Cmd_Inven_f should hide scores");
  assert.equal(player.client!.showhelp, false, "Cmd_Inven_f should hide help");
  assert.equal(player.client!.showinventory, true, "Cmd_Inven_f should show inventory");
  assert.equal(writes[0], svc_inventory, "Cmd_Inven_f should write svc_inventory");
  assert.equal(writes.length, 1 + MAX_ITEMS, "Cmd_Inven_f should serialize all inventory slots");
  assert.equal(writes[1 + cells.index], 25, "Cmd_Inven_f should serialize inventory shorts");
  assert.deepEqual(unicasts, [{ ent: player, reliable: true }], "Cmd_Inven_f should reliable-unicast the inventory payload");

  writes.length = 0;
  unicasts.length = 0;
  player.client!.showscores = true;
  player.client!.showhelp = true;
  Cmd_Inven_f(player, localContext);

  assert.equal(player.client!.showscores, false, "Cmd_Inven_f should hide scores when closing inventory");
  assert.equal(player.client!.showhelp, false, "Cmd_Inven_f should hide help when closing inventory");
  assert.equal(player.client!.showinventory, false, "Cmd_Inven_f should close an already visible inventory");
  assert.equal(writes.length, 0, "Cmd_Inven_f should not write inventory payload when closing");
  assert.equal(unicasts.length, 0, "Cmd_Inven_f should not unicast when closing inventory");
}

function verifyInventoryUseCommand(): void {
  const runtime = createRuntime();
  const localContext = createContext(runtime);
  const player = createClient(runtime, 1, "inventory-use");
  const shells = requireItem("Shells");
  const blaster = requireItem("Blaster");
  const shotgun = requireItem("Shotgun");

  player.client!.pers.selected_item = -1;
  Cmd_InvUse_f(player, localContext);
  assert.equal(lastPrint().message, "No item to use.\n", "Cmd_InvUse_f should reject an empty selection");

  player.client!.pers.selected_item = shells.index;
  player.client!.pers.inventory[shells.index] = 1;
  Cmd_InvUse_f(player, localContext);
  assert.equal(lastPrint().message, "Item is not usable.\n", "Cmd_InvUse_f should reject selected items without use callbacks");

  player.client!.pers.selected_item = shotgun.index;
  player.client!.pers.inventory[shells.index] = 0;
  player.client!.pers.inventory[shotgun.index] = 0;
  player.client!.pers.inventory[blaster.index] = 1;
  Cmd_InvUse_f(player, localContext);
  assert.equal(player.client!.newweapon, blaster, "Cmd_InvUse_f should revalidate stale selected inventory slots");

  player.client!.newweapon = null;
  player.client!.pers.selected_item = shotgun.index;
  player.client!.pers.inventory[shells.index] = 1;
  player.client!.pers.inventory[shotgun.index] = 1;
  Cmd_InvUse_f(player, localContext);
  assert.equal(player.client!.newweapon, shotgun, "Cmd_InvUse_f should dispatch the selected item use callback");
}

function verifyInventoryDropCommand(): void {
  const runtime = createRuntime();
  const localContext = createContext(runtime);
  const player = createClient(runtime, 1, "inventory-drop");
  const armor = requireItem("Body Armor");
  const bullets = requireItem("Bullets");
  const shells = requireItem("Shells");
  const shotgun = requireItem("Shotgun");

  player.client!.pers.selected_item = -1;
  Cmd_InvDrop_f(player, localContext);
  assert.equal(lastPrint().message, "No item to drop.\n", "Cmd_InvDrop_f should reject an empty selection");

  player.client!.pers.selected_item = armor.index;
  player.client!.pers.inventory[armor.index] = 1;
  Cmd_InvDrop_f(player, localContext);
  assert.equal(lastPrint().message, "Item is not dropable.\n", "Cmd_InvDrop_f should reject selected items without drop callbacks");

  player.client!.pers.selected_item = armor.index;
  player.client!.pers.inventory[armor.index] = 0;
  player.client!.pers.inventory[shotgun.index] = 1;
  Cmd_InvDrop_f(player, localContext);
  assert.equal(player.client!.pers.selected_item, shotgun.index, "Cmd_InvDrop_f should revalidate stale selected inventory slots through SelectNextItem");
  assert.equal(player.client!.pers.inventory[shotgun.index], 0, "Cmd_InvDrop_f should dispatch the revalidated item drop callback");
  const droppedShotgun = runtime.entities.find((entity) => entity.classname === shotgun.classname && entity.owner === player);
  assert.ok(droppedShotgun, "Cmd_InvDrop_f should spawn the revalidated selected item entity");

  player.client!.pers.inventory[shells.index] = 25;
  player.client!.pers.selected_item = shells.index;
  Cmd_InvDrop_f(player, localContext);
  assert.equal(player.client!.pers.inventory[shells.index], 15, "Cmd_InvDrop_f should drop selected ammo even though inventory selection normally scans usable items");

  player.client!.pers.inventory[bullets.index] = 50;
  player.client!.pers.selected_item = bullets.index;
  runCommand(localContext, ["invdrop"]);
  GameCommandsClientCommand(localContext, player);
  assert.equal(player.client!.pers.inventory[bullets.index], 0, "ClientCommand should dispatch invdrop");
}

function verifyWeaponPreviousCommand(): void {
  const runtime = createRuntime();
  const player = createClient(runtime, 1, "weapon-prev");
  const shells = requireItem("Shells");
  const shotgun = requireItem("Shotgun");
  const superShotgun = requireItem("Super Shotgun");

  Cmd_WeapPrev_f(player, runtime);
  assert.equal(player.client!.newweapon, null, "Cmd_WeapPrev_f should ignore clients with no current weapon");

  player.client!.pers.weapon = shotgun;
  player.client!.pers.inventory[shells.index] = 2;
  player.client!.pers.inventory[shotgun.index] = 1;
  player.client!.pers.inventory[superShotgun.index] = 1;

  Cmd_WeapPrev_f(player, runtime);
  assert.equal(player.client!.newweapon, superShotgun, "Cmd_WeapPrev_f should scan forward from selected_weapon and use the next valid weapon");

  player.client!.newweapon = null;
  const localContext = createContext(runtime);
  runCommand(localContext, ["weapprev"]);
  GameCommandsClientCommand(localContext, player);
  assert.equal(player.client!.newweapon, superShotgun, "ClientCommand should dispatch weapprev");
}

function verifyWeaponNextCommand(): void {
  const runtime = createRuntime();
  const player = createClient(runtime, 1, "weapon-next");
  const shells = requireItem("Shells");
  const blaster = requireItem("Blaster");
  const shotgun = requireItem("Shotgun");
  const superShotgun = requireItem("Super Shotgun");

  Cmd_WeapNext_f(player, runtime);
  assert.equal(player.client!.newweapon, null, "Cmd_WeapNext_f should ignore clients with no current weapon");

  player.client!.pers.weapon = superShotgun;
  player.client!.pers.inventory[shells.index] = 2;
  player.client!.pers.inventory[shotgun.index] = 1;
  player.client!.pers.inventory[superShotgun.index] = 1;
  player.client!.pers.inventory[blaster.index] = 1;

  Cmd_WeapNext_f(player, runtime);
  assert.equal(player.client!.newweapon, blaster, "Cmd_WeapNext_f should preserve the C scan and success check when walking backward from selected_weapon");

  player.client!.newweapon = null;
  const localContext = createContext(runtime);
  runCommand(localContext, ["weapnext"]);
  GameCommandsClientCommand(localContext, player);
  assert.equal(player.client!.newweapon, blaster, "ClientCommand should dispatch weapnext");
}

function verifyWeaponLastCommand(): void {
  const runtime = createRuntime();
  const player = createClient(runtime, 1, "weapon-last");
  const shells = requireItem("Shells");
  const quad = requireItem("Quad Damage");
  const blaster = requireItem("Blaster");
  const shotgun = requireItem("Shotgun");

  Cmd_WeapLast_f(player, runtime);
  assert.equal(player.client!.newweapon, null, "Cmd_WeapLast_f should ignore clients with no current weapon");

  player.client!.pers.weapon = blaster;
  Cmd_WeapLast_f(player, runtime);
  assert.equal(player.client!.newweapon, null, "Cmd_WeapLast_f should ignore clients with no last weapon");

  player.client!.pers.lastweapon = shotgun;
  Cmd_WeapLast_f(player, runtime);
  assert.equal(player.client!.newweapon, null, "Cmd_WeapLast_f should reject missing last weapon inventory");

  player.client!.pers.lastweapon = shells;
  player.client!.pers.inventory[shells.index] = 5;
  Cmd_WeapLast_f(player, runtime);
  assert.equal(player.client!.newweapon, null, "Cmd_WeapLast_f should reject last items without use callbacks");

  player.client!.pers.lastweapon = quad;
  player.client!.pers.inventory[quad.index] = 1;
  Cmd_WeapLast_f(player, runtime);
  assert.equal(player.client!.newweapon, null, "Cmd_WeapLast_f should reject usable non-weapon last items");

  player.client!.pers.lastweapon = shotgun;
  player.client!.pers.inventory[shotgun.index] = 1;
  Cmd_WeapLast_f(player, runtime);
  assert.equal(player.client!.newweapon, shotgun, "Cmd_WeapLast_f should dispatch the last weapon use callback");

  player.client!.newweapon = null;
  const localContext = createContext(runtime);
  runCommand(localContext, ["weaplast"]);
  GameCommandsClientCommand(localContext, player);
  assert.equal(player.client!.newweapon, shotgun, "ClientCommand should dispatch weaplast");
}

function verifyKillCommand(): void {
  const runtime = createRuntime();
  const localContext = createContext(runtime);
  localContext.hooks = {
    TossClientWeapon: () => undefined,
    onDeathSound: () => undefined
  };
  const player = createClient(runtime, 1, "kill");

  runtime.time = 10;
  player.client!.respawn_time = 6;
  player.flags |= FL_GODMODE;
  Cmd_Kill_f(player, localContext);
  assert.equal(player.health, 100, "Cmd_Kill_f should ignore suicide attempts before the 5 second respawn guard expires");
  assert.equal((player.flags & FL_GODMODE) !== 0, true, "Cmd_Kill_f should leave godmode untouched during the respawn guard");

  runtime.time = 12;
  Cmd_Kill_f(player, localContext);
  assert.equal(player.flags & FL_GODMODE, 0, "Cmd_Kill_f should clear godmode before killing the player");
  assert.equal(player.health, 0, "Cmd_Kill_f should zero health before player_die");
  assert.equal(runtime.meansOfDeath, MOD_SUICIDE, "Cmd_Kill_f should set suicide as means of death");
  assert.equal(player.deadflag, DEAD_DEAD, "Cmd_Kill_f should run the player death path");
  assert.equal(player.movetype, MOVETYPE_TOSS, "Cmd_Kill_f should leave the player in death toss movement");

  const dispatched = createClient(runtime, 2, "kill-dispatch");
  runtime.time = 20;
  dispatched.client!.respawn_time = 0;
  dispatched.flags |= FL_GODMODE;
  runCommand(localContext, ["kill"]);
  GameCommandsClientCommand(localContext, dispatched);
  assert.equal(dispatched.deadflag, DEAD_DEAD, "ClientCommand should dispatch kill");
}

function verifyPutAwayCommand(): void {
  const runtime = createRuntime();
  const localContext = createContext(runtime);
  const player = createClient(runtime, 1, "putaway");

  player.client!.showscores = true;
  player.client!.showhelp = true;
  player.client!.showinventory = true;
  Cmd_PutAway_f(player);
  assert.equal(player.client!.showscores, false, "Cmd_PutAway_f should hide scores");
  assert.equal(player.client!.showhelp, false, "Cmd_PutAway_f should hide help");
  assert.equal(player.client!.showinventory, false, "Cmd_PutAway_f should hide inventory");

  player.client!.showscores = true;
  player.client!.showhelp = true;
  player.client!.showinventory = true;
  runCommand(localContext, ["putaway"]);
  GameCommandsClientCommand(localContext, player);
  assert.equal(player.client!.showscores, false, "ClientCommand should dispatch putaway for scores");
  assert.equal(player.client!.showhelp, false, "ClientCommand should dispatch putaway for help");
  assert.equal(player.client!.showinventory, false, "ClientCommand should dispatch putaway for inventory");
}

function verifyPlayersCommand(): void {
  const runtime = createRuntime();
  const localContext = createContext(runtime);
  const requester = createClient(runtime, 1, "requester");
  const low = createClient(runtime, 2, "low");
  const high = createClient(runtime, 3, "high");
  const disconnected = createClient(runtime, 4, "disconnected");
  runtime.maxclients = 4;

  requester.client!.ps.stats[STAT_FRAGS] = 5;
  low.client!.ps.stats[STAT_FRAGS] = -2;
  high.client!.ps.stats[STAT_FRAGS] = 15;
  disconnected.client!.ps.stats[STAT_FRAGS] = 99;
  disconnected.client!.pers.connected = false;

  assert.equal(PlayerSort(1, 2, runtime), -1, "PlayerSort should order lower frag totals first");
  assert.equal(PlayerSort(2, 1, runtime), 1, "PlayerSort should order higher frag totals last");
  assert.equal(PlayerSort(1, 1, runtime), 0, "PlayerSort should report equal frag totals");

  Cmd_Players_f(requester, localContext);
  const direct = lastPrint().message;
  assert.match(direct, / -2 low\n  5 requester\n 15 high\n\n3 players\n/, "Cmd_Players_f should print connected players sorted by frags");
  assert.doesNotMatch(direct, /disconnected/, "Cmd_Players_f should ignore disconnected clients");

  runCommand(localContext, ["players"]);
  GameCommandsClientCommand(localContext, requester);
  assert.match(lastPrint().message, /3 players/, "ClientCommand should dispatch players before intermission gating");
}

function verifyPlayerListAndWave(): void {
  const runtime = createRuntime();
  const localContext = createContext(runtime);
  const player1 = createClient(runtime, 1, "alpha");
  const player2 = createClient(runtime, 2, "beta");
  player1.client!.ps.stats[STAT_FRAGS] = 9;
  player2.client!.ps.stats[STAT_FRAGS] = 2;
  player1.client!.resp.enterframe = 0;
  player2.client!.resp.enterframe = 10;
  runtime.framenum = 610;

  Cmd_PlayerList_f(player1, localContext);
  assert.match(lastPrint().message, /alpha/, "Cmd_PlayerList_f should list active players");

  runCommand(localContext, ["wave", "3"]);
  Cmd_Wave_f(player1, localContext);
  assert.match(lastPrint().message, /wave/, "Cmd_Wave_f should print selected wave animation");
  assert.equal(player1.client!.anim_end, 122, "Cmd_Wave_f should set wave animation end frame");
}

function createRuntime(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  runtime.maxclients = 4;
  runtime.maxentities = 64;
  return runtime;
}

function createClient(runtime: GameRuntime, index: number, name: string, userinfo = "\\skin\\male/grunt"): GameEntity {
  while (runtime.entities.length <= index) {
    runtime.entities.push(createGameRuntimeFromBspEntities([{ properties: { classname: "placeholder" } }]).entities[0]!);
  }
  const ent = runtime.entities[index]!;
  ent.index = index;
  ent.inuse = true;
  ent.classname = "player";
  ent.health = 100;
  ent.max_health = 100;
  attachGameClient(ent);
  ent.client!.pers.connected = true;
  ent.client!.pers.netname = name;
  ent.client!.pers.userinfo = userinfo;
  ent.client!.pers.max_shells = 100;
  ent.client!.pers.max_cells = 200;
  return ent;
}

function createContext(runtime: GameRuntime): GameCommandContext {
  prints.length = 0;
  writes.length = 0;
  unicasts.length = 0;
  command = { argv: ["say"], args: "hello" };
  return {
    runtime,
    cvars: {
      sv_cheats: cvar("cheats", 1),
      dedicated: cvar("dedicated", 0),
      flood_msgs: cvar("flood_msgs", 0),
      flood_persecond: cvar("flood_persecond", 4),
      flood_waitdelay: cvar("flood_waitdelay", 10)
    },
    gi: {
      argc: () => command.argv.length,
      argv: (index) => command.argv[index] ?? "",
      args: () => command.args,
      cprintf: (ent, level, _fmt, ...args) => {
        prints.push({ ent, level, message: String(args[0] ?? _fmt) });
      },
      WriteByte: (value) => writes.push(value),
      WriteShort: (value) => writes.push(value),
      unicast: (ent, reliable) => {
        unicasts.push({ ent, reliable });
      }
    }
  };
}

function runCommand(localContext: GameCommandContext, argv: string[], args = argv.slice(1).join(" ")): void {
  void localContext;
  command = { argv, args };
}

function requireItem(name: string) {
  const item = FindItem(name);
  assert.ok(item, `missing test item ${name}`);
  return item;
}

function lastPrint() {
  const entry = prints.at(-1);
  assert.ok(entry, "expected a print");
  return entry;
}

function cvar(name: string, value: number): cvar_t {
  return { name, string: String(value), latched_string: null, flags: 0, modified: false, value };
}
