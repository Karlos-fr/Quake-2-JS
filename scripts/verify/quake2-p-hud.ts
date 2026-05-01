/**
 * File: quake2-p-hud.ts
 * Purpose: Verify the `game/p_hud.c` TypeScript attachment point.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for scoreboard, intermission and help-layout helpers.
 *
 * Dependencies:
 * - packages/game/src/p_hud.ts
 */

import { strict as assert } from "node:assert";

import {
  CS_IMAGES,
  CS_PLAYERSKINS,
  pmtype_t,
  RDF_UNDERWATER,
  STAT_AMMO_ICON,
  STAT_CHASE,
  STAT_HEALTH,
  STAT_HEALTH_ICON,
  STAT_LAYOUTS,
  STAT_SPECTATOR
} from "../../packages/qcommon/src/index.js";
import { FindItem } from "../../packages/game/src/g_items.js";
import { FL_POWER_ARMOR, ITEM_INDEX } from "../../packages/game/src/g_local.js";
import {
  BeginIntermission,
  Cmd_Help_f,
  Cmd_Score_f,
  DeathmatchScoreboard,
  DeathmatchScoreboardMessage,
  G_CheckChaseStats,
  G_SetSpectatorStats,
  G_SetStats,
  HelpComputer,
  MoveClientToIntermission,
  type GameHudHelpComputerData
} from "../../packages/game/src/p_hud.js";
import { attachGameClient, createGameRuntimeFromBspEntities } from "../../packages/game/src/runtime.js";

const runtime = createGameRuntimeFromBspEntities([
  { properties: { classname: "worldspawn" } },
  { properties: { classname: "info_player_intermission" } }
]);
runtime.maxclients = 3;
runtime.deathmatch = true;
runtime.intermission_origin = [128, 64, 32];
runtime.intermission_angle = [0, 90, 0];
runtime.framenum = 1200;
runtime.time = 42;
runtime.pic_health = 77;
const engineImageIndexes = new Map<string, number>([
  ["a_cells", 42]
]);
runtime.engineImageIndex = (path) => engineImageIndexes.get(path) ?? 0;

while (runtime.entities.length <= runtime.maxclients) {
  runtime.entities.push({
    ...runtime.entities[0]!,
    index: runtime.entities.length,
    inuse: false,
    classname: "player"
  });
}

for (let i = 1; i <= runtime.maxclients; i += 1) {
  const ent = runtime.entities[i]!;
  attachGameClient(ent);
  ent.inuse = true;
  ent.health = 100;
  ent.client!.ping = 30 + i;
  ent.client!.resp.score = i === 1 ? 10 : i === 2 ? 20 : 5;
  ent.client!.resp.enterframe = 600 - i * 60;
  ent.client!.pers.health = 100;
}

const layouts: Array<{ ent: number; layout: string }> = [];
const hooks = {
  emitLayout: (ent, layout) => {
    layouts.push({ ent: ent.index, layout });
  }
};

const scoreboardLayout = DeathmatchScoreboardMessage(runtime.entities[1]!, runtime.entities[2]!, runtime);
assert.ok(scoreboardLayout.includes("client 0 32 1 20"), "DeathmatchScoreboardMessage must sort highest score first");
assert.ok(scoreboardLayout.includes("picn tag1") || scoreboardLayout.includes("picn tag2"), "DeathmatchScoreboardMessage tag mismatch");

DeathmatchScoreboard(runtime.entities[1]!, runtime, hooks);
assert.ok(layouts.at(-1)?.layout.includes("client"), "DeathmatchScoreboard emit mismatch");

Cmd_Score_f(runtime.entities[1]!, runtime, hooks);
assert.equal(runtime.entities[1]!.client!.showscores, true, "Cmd_Score_f enable mismatch");
Cmd_Score_f(runtime.entities[1]!, runtime, hooks);
assert.equal(runtime.entities[1]!.client!.showscores, false, "Cmd_Score_f toggle mismatch");

runtime.entities[1]!.client!.quad_framenum = 1300;
runtime.entities[1]!.client!.pers.selected_item = -1;
G_SetStats(runtime.entities[1]!, runtime);
assert.ok(runtime.entities[1]!.client!.ps.stats[STAT_LAYOUTS] >= 0, "G_SetStats layouts mismatch");
assert.equal(runtime.entities[1]!.client!.ps.stats[STAT_HEALTH], 100, "G_SetStats health value mismatch");
assert.equal(runtime.entities[1]!.client!.ps.stats[STAT_HEALTH_ICON], 77, "G_SetStats level health icon mismatch");

const ammoCells = FindItem("Cells");
if (ammoCells) {
  runtime.entities[1]!.client!.ammo_index = ITEM_INDEX(ammoCells);
  runtime.entities[1]!.client!.pers.inventory[ITEM_INDEX(ammoCells)] = 200;
  G_SetStats(runtime.entities[1]!, runtime);
  assert.equal(runtime.entities[1]!.client!.ps.stats[STAT_AMMO_ICON], 42, "G_SetStats must resolve HUD ammo icons through the engine image table when available");
  assert.equal(runtime.assets.imagePaths[41], "a_cells", "engine-backed image registration should mirror the gameplay image table");
  assert.equal(runtime.configstrings.has(CS_IMAGES + 42), false, "engine-backed image registration should leave authoritative CS_IMAGES ownership to the server import");
}

const powerShield = FindItem("Power Shield");
const cells = FindItem("Cells");
if (powerShield && cells) {
  runtime.entities[1]!.flags |= FL_POWER_ARMOR;
  runtime.entities[1]!.client!.pers.inventory[ITEM_INDEX(powerShield)] = 1;
  runtime.entities[1]!.client!.pers.inventory[ITEM_INDEX(cells)] = 0;
  G_SetStats(runtime.entities[1]!, runtime);
  assert.equal((runtime.entities[1]!.flags & FL_POWER_ARMOR), 0, "G_SetStats power armor flag clear mismatch");
  assert.ok(runtime.soundEvents.some((event) => event.soundPath === "misc/power2.wav"), "G_SetStats power armor shutdown sound mismatch");
}

runtime.entities[2]!.client!.chase_target = runtime.entities[1]!;
runtime.entities[2]!.client!.showscores = true;
G_CheckChaseStats(runtime.entities[1]!, runtime);
assert.equal(runtime.entities[2]!.client!.ps.stats[STAT_SPECTATOR], 1, "G_CheckChaseStats spectator mismatch");

G_SetSpectatorStats(runtime.entities[2]!, runtime);
assert.equal(
  runtime.entities[2]!.client!.ps.stats[STAT_CHASE],
  CS_PLAYERSKINS + runtime.entities[1]!.index - 1,
  "G_SetSpectatorStats chase mismatch"
);

runtime.entities[1]!.client!.ps.rdflags |= RDF_UNDERWATER;
runtime.entities[1]!.client!.quad_framenum = 10;
runtime.entities[1]!.solid = 3;
MoveClientToIntermission(runtime.entities[1]!, runtime, hooks);
assert.equal(runtime.entities[1]!.client!.ps.pmove.pm_type, pmtype_t.PM_FREEZE, "MoveClientToIntermission freeze mismatch");
assert.deepEqual(runtime.entities[1]!.s.origin, [128, 64, 32], "MoveClientToIntermission origin mismatch");
assert.deepEqual(runtime.entities[1]!.client!.ps.pmove.origin, [1024, 512, 256], "MoveClientToIntermission pmove origin mismatch");
assert.deepEqual(runtime.entities[1]!.client!.ps.viewangles, [0, 90, 0], "MoveClientToIntermission viewangles mismatch");
assert.equal(runtime.entities[1]!.client!.ps.blend[3], 0, "MoveClientToIntermission blend mismatch");
assert.equal(runtime.entities[1]!.solid, 0, "MoveClientToIntermission solid mismatch");
assert.ok(layouts.at(-1)?.layout.includes("client"), "MoveClientToIntermission scoreboard emit mismatch");

const helpData: GameHudHelpComputerData = {
  skill: 2,
  level_name: "Unit Test",
  helpmessage1: "Find the exit",
  helpmessage2: "Do not die",
  killed_monsters: 1,
  total_monsters: 3,
  found_goals: 2,
  total_goals: 4,
  found_secrets: 1,
  total_secrets: 2
};

const helpLayout = HelpComputer(runtime.entities[1]!, runtime, helpData, hooks);
assert.ok(helpLayout.includes('picn help'), "HelpComputer background mismatch");
assert.ok(helpLayout.includes('cstring2 "Unit Test"'), "HelpComputer level name mismatch");

runtime.deathmatch = false;
runtime.helpchanged = 3;
runtime.entities[1]!.client!.pers.game_helpchanged = 2;
runtime.entities[1]!.client!.showhelp = false;
Cmd_Help_f(runtime.entities[1]!, runtime, helpData, hooks);
assert.equal(runtime.entities[1]!.client!.showhelp, true, "Cmd_Help_f enable mismatch");
assert.equal(runtime.entities[1]!.client!.pers.helpchanged, 0, "Cmd_Help_f helpchanged reset mismatch");

runtime.entities[1]!.client!.showhelp = true;
runtime.entities[1]!.client!.pers.game_helpchanged = runtime.helpchanged;
Cmd_Help_f(runtime.entities[1]!, runtime, helpData, hooks);
assert.equal(runtime.entities[1]!.client!.showhelp, false, "Cmd_Help_f toggle mismatch");

const keyItem = FindItem("Data CD");
if (keyItem) {
  runtime.entities[1]!.client!.pers.inventory[keyItem.index] = 1;
}
runtime.coop = true;
runtime.deathmatch = false;
runtime.intermissiontime = 0;
runtime.autosaved = true;
runtime.entities[1]!.s.origin = [256, 128, 64];
runtime.entities[1]!.s.angles = [15, 180, 5];
BeginIntermission(
  {
    ...runtime.entities[0]!,
    map: "unit*1"
  },
  runtime,
  hooks
);
assert.ok(runtime.intermissiontime > 0, "BeginIntermission time mismatch");
assert.equal(runtime.autosaved, false, "BeginIntermission autosaved clear mismatch");
assert.deepEqual(runtime.intermission_origin, [256, 128, 64], "BeginIntermission intermission_origin mismatch");
assert.deepEqual(runtime.intermission_angle, [15, 180, 5], "BeginIntermission intermission_angle mismatch");
assert.deepEqual(runtime.entities[1]!.client!.ps.pmove.origin, [2048, 1024, 512], "BeginIntermission must move clients to intermission pmove origin");
assert.deepEqual(runtime.entities[1]!.client!.ps.viewangles, [15, 180, 5], "BeginIntermission must move clients to intermission angles");
if (keyItem) {
  assert.equal(runtime.entities[1]!.client!.pers.inventory[keyItem.index], 0, "BeginIntermission coop key strip mismatch");
}

console.log("quake2-p-hud: ok");
