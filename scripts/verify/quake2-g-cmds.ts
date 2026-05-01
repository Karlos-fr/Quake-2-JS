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

import { DF_MODELTEAMS, PRINT_CHAT, PRINT_HIGH, STAT_FRAGS, type cvar_t } from "../../packages/qcommon/src/index.js";
import {
  Cmd_Drop_f,
  Cmd_Give_f,
  Cmd_Inven_f,
  Cmd_PlayerList_f,
  Cmd_Say_f,
  Cmd_Wave_f,
  FindItem,
  GameCommandsClientCommand,
  IT_WEAPON,
  MOVETYPE_NOCLIP,
  MOVETYPE_WALK,
  OnSameTeam,
  SelectNextItem,
  SelectPrevItem,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  type GameCommandContext,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";

const prints: Array<{ ent: GameEntity | null; level: number; message: string }> = [];
const writes: number[] = [];
let command = { argv: ["say"], args: "hello" };

const context = createContext(createRuntime());

verifyTeamParsing();
verifyInventorySelection();
verifyCommandsAndChat();
verifyDropCommand();
verifyInventorySerialization();
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

  player.client!.pers.inventory[cells.index] = 25;
  Cmd_Inven_f(player, localContext);

  assert.equal(player.client!.showinventory, true, "Cmd_Inven_f should show inventory");
  assert.equal(writes[0], 5, "Cmd_Inven_f should write svc_inventory");
  assert.equal(writes[1 + cells.index], 25, "Cmd_Inven_f should serialize inventory shorts");
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
      unicast: () => {}
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
