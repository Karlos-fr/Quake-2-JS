/**
 * File: quake2-menu.ts
 * Purpose: Verify the first TypeScript port blocks of `client/menu.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the menu stack, drawing helpers and the first menu entry points.
 *
 * Dependencies:
 * - packages/client/src/menu.ts
 * - packages/client/src/qmenu.ts
 * - packages/client/src/keys.ts
 * - packages/qcommon/src/cmd.ts
 * - packages/qcommon/src/cvar.ts
 */

import { strict as assert } from "node:assert";

import {
  Cmd_ExecuteString,
  Cvar_Set,
  DF_ALLOW_EXIT,
  DF_FIXED_FOV,
  DF_FORCE_RESPAWN,
  DF_INFINITE_AMMO,
  DF_INSTANT_ITEMS,
  DF_MODELTEAMS,
  DF_NO_ARMOR,
  DF_NO_FALLING,
  DF_NO_FRIENDLY_FIRE,
  DF_NO_HEALTH,
  DF_NO_ITEMS,
  DF_NO_MINES,
  DF_NO_NUKES,
  DF_NO_SPHERES,
  DF_NO_STACK_DOUBLE,
  DF_QUAD_DROP,
  DF_SAME_LEVEL,
  DF_SKINTEAMS,
  DF_SPAWN_FARTHEST,
  DF_WEAPONS_STAY,
  createCommandRuntime,
  createCvarRuntime,
  createNetAdr,
  netadrtype_t
} from "../../packages/qcommon/src/index.js";
import {
  Create_Savestrings,
  K_BACKSPACE,
  K_DOWNARROW,
  K_ENTER,
  K_ESCAPE,
  K_LEFTARROW,
  K_RIGHTARROW,
  K_UPARROW,
  DMFlagCallback,
  M_Draw,
  M_ForceMenuOff,
  M_Init,
  M_Keydown,
  M_AddToServerList,
  M_Menu_Credits_f,
  M_Menu_DMOptions_f,
  M_Menu_DownloadOptions_f,
  M_Menu_LoadGame_f,
  M_Menu_Main_f,
  M_Menu_Quit_f,
  M_Menu_SaveGame_f,
  M_Menu_StartServer_f,
  StartServer_MenuKey,
  Key_SetBinding,
  createClientKeyContext,
  createClientMenuContext,
  createClientQMenuContext,
  createClientRuntime,
  createClientVidContext,
  createRefExport,
  idcredits,
  keydest_t
} from "../../packages/client/src/index.js";
import type { PlayerConfigPreview, PlayerModelInfo } from "../../packages/client/src/index.js";

const drawPics: Array<{ x: number; y: number; name: string }> = [];
const drawChars: Array<{ x: number; y: number; c: number }> = [];
const drawFills: Array<{ x: number; y: number; w: number; h: number; c: number }> = [];
const registeredPics: string[] = [];
const sounds: string[] = [];
let videoMenuInitCalls = 0;
let videoMenuDrawCalls = 0;
let videoMenuKey = -1;
let joinedServer = 0;
let startedServer = 0;
let quitCalled = 0;
let pingServersCalls = 0;
let soundRestartCalls = 0;
let clearTypingCalls = 0;
let clearNotifyCalls = 0;
let endFrameCalls = 0;
let developerSearchpath = 0;
let creditsText: string | null = null;
let playerModels: PlayerModelInfo[] | null = null;
const playerPreviews: PlayerConfigPreview[] = [];

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const keys = createClientKeyContext({ cmd, client });
const qmenu = createClientQMenuContext({
  getMilliseconds: () => 500
});
const vid = createClientVidContext({
  onMenuInit: () => {
    videoMenuInitCalls += 1;
  },
  onMenuDraw: () => {
    videoMenuDrawCalls += 1;
  },
  onMenuKey: (key) => {
    videoMenuKey = key;
    return "misc/menu2.wav";
  }
});

vid.viddef.width = 640;
vid.viddef.height = 480;
client.cls.realtime = 1234;

const ref = createRefExport();
ref.DrawGetPicSize = (name) => {
  if (name === "m_main_plaque") {
    return { width: 64, height: 32 };
  }

  if (name === "quit") {
    return { width: 48, height: 24 };
  }

  return { width: 128, height: 24 };
};
ref.DrawPic = (x, y, name) => {
  drawPics.push({ x, y, name });
};
ref.DrawChar = (x, y, c) => {
  drawChars.push({ x, y, c });
};
ref.DrawFill = (x, y, w, h, c) => {
  drawFills.push({ x, y, w, h, c });
};
ref.DrawFadeScreen = () => {
  drawFills.push({ x: -1, y: -1, w: 0, h: 0, c: -1 });
};
ref.RegisterPic = (name) => {
  registeredPics.push(name);
  return null;
};
ref.EndFrame = () => {
  endFrameCalls += 1;
};

const menu = createClientMenuContext({
  client,
  keys,
  qmenu,
  cmd,
  cvar,
  vid,
  ref,
  hooks: {
    startLocalSound: (name) => {
      sounds.push(name);
    },
    getServerState: () => 1,
    getMapList: () => [
      { shortName: "bunk1", longName: "Outer Base" },
      { shortName: "base2", longName: "Installation" }
    ],
    onMenuJoinServer: () => {
      joinedServer += 1;
    },
    onMenuStartServer: () => {
      startedServer += 1;
    },
    onQuit: () => {
      quitCalled += 1;
    },
    getDeveloperSearchpath: () => {
      return developerSearchpath;
    },
    getCreditsText: () => {
      return creditsText;
    },
    getPlayerModels: () => {
      return playerModels;
    },
    onPlayerConfigPreview: (preview) => {
      playerPreviews.push(preview);
    },
    onPingServers: () => {
      pingServersCalls += 1;
    },
    onSoundRestart: () => {
      soundRestartCalls += 1;
    },
    onClearTyping: () => {
      clearTypingCalls += 1;
    },
    onClearNotify: () => {
      clearNotifyCalls += 1;
    },
    getSaveSlots: () => {
      const slots = Array.from({ length: 15 }, () => null);
      slots[0] = { label: "AUTOSAVE", valid: true };
      slots[1] = { label: "Unit 1", valid: true };
      slots[2] = { label: "Unit 2", valid: false };
      return slots;
    }
  }
});

Cvar_Set(cvar, "maxclients", "1");

M_Init(menu);
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_main"), true, "M_Init should register menu_main");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_loadgame"), true, "M_Init should register menu_loadgame");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_savegame"), true, "M_Init should register menu_savegame");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_credits"), true, "M_Init should register menu_credits");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_multiplayer"), true, "M_Init should register menu_multiplayer");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_joinserver"), true, "M_Init should register menu_joinserver");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_addressbook"), true, "M_Init should register menu_addressbook");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_startserver"), true, "M_Init should register menu_startserver");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_dmoptions"), true, "M_Init should register menu_dmoptions");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_downloadoptions"), true, "M_Init should register menu_downloadoptions");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_playerconfig"), true, "M_Init should register menu_playerconfig");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_video"), true, "M_Init should register menu_video");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_options"), true, "M_Init should register menu_options");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_keys"), true, "M_Init should register menu_keys");
assert.equal(cmd.cmd_functions.some((entry) => entry.name === "menu_quit"), true, "M_Init should register menu_quit");

Cmd_ExecuteString(cmd, "menu_credits");
assert.equal(menu.state.credits, idcredits, "menu_credits command should open credits menu");
M_Keydown(menu, K_ESCAPE);

Cvar_Set(cvar, "dmflags", "0");
Cmd_ExecuteString(cmd, "menu_dmoptions");
assert.equal(menu.state.s_dmoptions_menu.nitems, 15, "menu_dmoptions command should open DMOptions");
M_ForceMenuOff(menu);

Cmd_ExecuteString(cmd, "menu_downloadoptions");
assert.equal(menu.state.s_downloadoptions_menu.nitems, 6, "menu_downloadoptions command should open Download Options");
M_ForceMenuOff(menu);

playerModels = [
  { directory: "male", skins: ["grunt"] }
];
Cmd_ExecuteString(cmd, "menu_playerconfig");
assert.equal(menu.state.s_player_config_menu.nitems, 10, "menu_playerconfig command should open Player Config");
M_Keydown(menu, K_ESCAPE);
playerModels = null;

Cmd_ExecuteString(cmd, "menu_main");
assert.equal(keys.state.key_dest, keydest_t.key_menu, "M_Menu_Main_f should switch key_dest to menu");
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "paused")?.string, "1", "M_PushMenu should pause local single-player server");

drawPics.length = 0;
drawChars.length = 0;
drawFills.length = 0;
registeredPics.length = 0;
sounds.length = 0;
M_Draw(menu);

assert.equal(sounds[0], "misc/menu1.wav", "M_Draw should play enter sound after drawing");
assert.ok(drawPics.some((entry) => entry.name === "m_main_game_sel"), "M_Main_Draw selected pic mismatch");
assert.ok(drawPics.some((entry) => entry.name === "m_main_plaque"), "M_Main_Draw plaque pic mismatch");
assert.equal(registeredPics.length, 15, "M_DrawCursor should register all cursor frames once");
assert.equal(drawFills.some((entry) => entry.c === -1), true, "M_Draw should fade the background when not in cinematic");

M_Keydown(menu, K_DOWNARROW);
assert.equal(menu.state.m_main_cursor, 1, "M_Main_Key down mismatch");
assert.equal(sounds.at(-1), "misc/menu2.wav", "M_Keydown move sound mismatch");

M_Keydown(menu, K_UPARROW);
assert.equal(menu.state.m_main_cursor, 0, "M_Main_Key up mismatch");

menu.state.m_main_cursor = 1;
M_Keydown(menu, K_ENTER);
assert.equal(menu.state.m_menudepth, 2, "entering multiplayer should push one menu layer");
assert.equal(keys.state.key_dest, keydest_t.key_menu, "multiplayer menu should keep menu focus");

drawChars.length = 0;
drawFills.length = 0;
qmenu.state.drawChars.length = 0;
M_Draw(menu);
assert.ok(qmenu.state.drawChars.length > 0, "Multiplayer_MenuDraw should emit qmenu characters");

M_Keydown(menu, K_ENTER);
assert.equal(menu.state.m_menudepth, 3, "multiplayer select should open the join server menu");
assert.equal(menu.state.s_joinserver_menu.nitems, 11, "JoinServer_MenuInit item count mismatch");
assert.equal(menu.state.s_joinserver_server_actions[0].generic.name, "<no server>", "JoinServer_MenuInit empty server label mismatch");
assert.equal(pingServersCalls, 1, "JoinServer_MenuInit should ping for local servers");

Cvar_Set(cvar, "adr0", "quake.example.net");
menu.state.s_joinserver_menu.cursor = 0;
M_Keydown(menu, K_ENTER);
assert.equal(menu.state.m_menudepth, 4, "address book action should push the address book menu");
assert.equal(menu.state.s_addressbook_menu.nitems, 9, "AddressBook_MenuInit item count mismatch");
assert.equal(menu.state.s_addressbook_fields[0].buffer, "quake.example.net", "AddressBook_MenuInit should load adr cvar values");
drawPics.length = 0;
M_Draw(menu);
assert.ok(drawPics.some((entry) => entry.name === "m_banner_addressbook"), "AddressBook_MenuDraw should draw the address-book banner");
menu.state.s_addressbook_fields[0].buffer = "192.168.0.42";
M_Keydown(menu, K_ESCAPE);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "adr0")?.string, "192.168.0.42", "AddressBook_MenuKey escape should persist adr cvars");

const serverAddress = createNetAdr(netadrtype_t.NA_IP);
serverAddress.ip[0] = 127;
serverAddress.ip[1] = 0;
serverAddress.ip[2] = 0;
serverAddress.ip[3] = 1;
serverAddress.port = 27910;
M_AddToServerList(menu, serverAddress, " local game");
M_AddToServerList(menu, serverAddress, "local game");
assert.equal(menu.state.m_num_servers, 1, "M_AddToServerList should ignore duplicate display names");
menu.state.s_joinserver_menu.cursor = 3;
M_Keydown(menu, K_ENTER);
assert.equal(decodeCommandBuffer(cmd).includes("connect 127.0.0.1:27910\n"), true, "JoinServerFunc should queue a connect command");
assert.equal(keys.state.key_dest, keydest_t.key_game, "JoinServerFunc should close menus after connect");

M_Menu_Main_f(menu);
menu.state.m_main_cursor = 1;
M_Keydown(menu, K_ENTER);
M_Keydown(menu, K_DOWNARROW);
M_Keydown(menu, K_ENTER);
assert.equal(menu.state.m_menudepth, 3, "multiplayer second item should open the start server menu");
assert.equal(menu.state.s_startserver_menu.nitems, 8, "StartServer_MenuInit item count mismatch");
assert.equal(menu.state.s_startmap_list.itemnames?.[0], "Outer Base\nBUNK1", "StartServer_MenuInit should format maps.lst entries");
assert.equal(menu.state.s_maxclients_field.buffer, "8", "StartServer_MenuInit should default single-player maxclients to 8");
assert.equal(menu.state.s_startserver_start_action.generic.name, " begin", "StartServer_MenuInit begin action mismatch");

Cvar_Set(cvar, "dmflags", "0");
menu.state.s_startserver_menu.cursor = 6;
M_Keydown(menu, K_ENTER);
assert.equal(menu.state.m_menudepth, 4, "deathmatch flags should open DMOptions menu");
assert.equal(menu.state.s_dmoptions_menu.nitems, 15, "DMOptions_MenuInit base item count mismatch");
assert.equal(menu.state.s_dmoptions_menu.statusbar, "dmflags = 0", "DMOptions_MenuInit statusbar mismatch");
assert.equal(menu.state.s_falls_box.curvalue, 1, "DMOptions_MenuInit falling damage initial value mismatch");
assert.equal(menu.state.s_teamplay_box.curvalue, 0, "DMOptions_MenuInit teamplay initial value mismatch");

qmenu.state.drawStrings.length = 0;
M_Draw(menu);
assert.ok(qmenu.state.drawStrings.some((entry) => entry.text === "falling damage"), "DMOptions_MenuDraw should draw falling damage");

const assertDmFlagCallback = (item: { curvalue: number }, curvalue: number, flag: number, message: string): void => {
  Cvar_Set(cvar, "dmflags", "0");
  item.curvalue = curvalue;
  DMFlagCallback(menu, item);
  assert.equal((Number(cvar.cvar_vars.find((entry) => entry.name === "dmflags")?.string) & flag) !== 0, true, message);
};

assertDmFlagCallback(menu.state.s_weapons_stay_box, 1, DF_WEAPONS_STAY, "weapons stay should set DF_WEAPONS_STAY");
assertDmFlagCallback(menu.state.s_instant_powerups_box, 1, DF_INSTANT_ITEMS, "instant powerups should set DF_INSTANT_ITEMS");
assertDmFlagCallback(menu.state.s_powerups_box, 0, DF_NO_ITEMS, "disallowing powerups should set DF_NO_ITEMS");
assertDmFlagCallback(menu.state.s_health_box, 0, DF_NO_HEALTH, "disallowing health should set DF_NO_HEALTH");
assertDmFlagCallback(menu.state.s_armor_box, 0, DF_NO_ARMOR, "disallowing armor should set DF_NO_ARMOR");
assertDmFlagCallback(menu.state.s_spawn_farthest_box, 1, DF_SPAWN_FARTHEST, "spawn farthest should set DF_SPAWN_FARTHEST");
assertDmFlagCallback(menu.state.s_samelevel_box, 1, DF_SAME_LEVEL, "same map should set DF_SAME_LEVEL");
assertDmFlagCallback(menu.state.s_force_respawn_box, 1, DF_FORCE_RESPAWN, "force respawn should set DF_FORCE_RESPAWN");
assertDmFlagCallback(menu.state.s_allow_exit_box, 1, DF_ALLOW_EXIT, "allow exit should set DF_ALLOW_EXIT");
assertDmFlagCallback(menu.state.s_infinite_ammo_box, 1, DF_INFINITE_AMMO, "infinite ammo should set DF_INFINITE_AMMO");
assertDmFlagCallback(menu.state.s_fixed_fov_box, 1, DF_FIXED_FOV, "fixed FOV should set DF_FIXED_FOV");
assertDmFlagCallback(menu.state.s_quad_drop_box, 1, DF_QUAD_DROP, "quad drop should set DF_QUAD_DROP");
assertDmFlagCallback(menu.state.s_friendlyfire_box, 0, DF_NO_FRIENDLY_FIRE, "disabling friendly fire should set DF_NO_FRIENDLY_FIRE");
Cvar_Set(cvar, "dmflags", "0");

menu.state.s_dmoptions_menu.cursor = 0;
M_Keydown(menu, K_LEFTARROW);
assert.equal(Number(cvar.cvar_vars.find((entry) => entry.name === "dmflags")?.string), DF_NO_FALLING, "falling damage toggle should set DF_NO_FALLING");
assert.equal(menu.state.s_dmoptions_menu.statusbar, `dmflags = ${DF_NO_FALLING}`, "DMFlagCallback should update statusbar");

menu.state.s_dmoptions_menu.cursor = 9;
M_Keydown(menu, K_RIGHTARROW);
let dmflagsValue = Number(cvar.cvar_vars.find((entry) => entry.name === "dmflags")?.string);
assert.equal((dmflagsValue & DF_SKINTEAMS) !== 0, true, "teamplay by skin should set DF_SKINTEAMS");
assert.equal((dmflagsValue & DF_MODELTEAMS) === 0, true, "teamplay by skin should clear DF_MODELTEAMS");
M_Keydown(menu, K_RIGHTARROW);
dmflagsValue = Number(cvar.cvar_vars.find((entry) => entry.name === "dmflags")?.string);
assert.equal((dmflagsValue & DF_MODELTEAMS) !== 0, true, "teamplay by model should set DF_MODELTEAMS");
assert.equal((dmflagsValue & DF_SKINTEAMS) === 0, true, "teamplay by model should clear DF_SKINTEAMS");

M_Keydown(menu, K_ESCAPE);
assert.equal(menu.state.m_menudepth, 3, "escape from DMOptions should return to start server");
menu.state.mapnames = ["Outer Base\nBUNK1", "Installation\nBASE2"];
menu.state.nummaps = 2;
menu.state.s_startmap_list.itemnames = menu.state.mapnames;
StartServer_MenuKey(menu, K_ESCAPE);
assert.equal(menu.state.nummaps, 0, "StartServer_MenuKey escape should clear the map count");
assert.deepEqual(menu.state.mapnames, [], "StartServer_MenuKey escape should release formatted map names");
assert.equal(menu.state.s_startmap_list.itemnames, null, "StartServer_MenuKey escape should detach start-map itemnames");
M_Menu_StartServer_f(menu);

developerSearchpath = 2;
Cvar_Set(cvar, "dmflags", "0");
M_Menu_DMOptions_f(menu);
assert.equal(menu.state.s_dmoptions_menu.nitems, 19, "DMOptions_MenuInit Rogue item count mismatch");
assert.equal(menu.state.s_no_mines_box.generic.name, "remove mines", "DMOptions_MenuInit should add Rogue remove mines option");
assert.equal(menu.state.s_no_nukes_box.generic.name, "remove nukes", "DMOptions_MenuInit should add Rogue remove nukes option");
assert.equal(menu.state.s_stack_double_box.generic.name, "2x/4x stacking off", "DMOptions_MenuInit should add Rogue stacking option");
assert.equal(menu.state.s_no_spheres_box.generic.name, "remove spheres", "DMOptions_MenuInit should add Rogue remove spheres option");
menu.state.s_dmoptions_menu.cursor = 15;
M_Keydown(menu, K_RIGHTARROW);
assert.equal(Number(cvar.cvar_vars.find((entry) => entry.name === "dmflags")?.string), DF_NO_MINES, "Rogue remove mines should set DF_NO_MINES");
assertDmFlagCallback(menu.state.s_no_nukes_box, 1, DF_NO_NUKES, "Rogue remove nukes should set DF_NO_NUKES");
assertDmFlagCallback(menu.state.s_stack_double_box, 1, DF_NO_STACK_DOUBLE, "Rogue stacking off should set DF_NO_STACK_DOUBLE");
assertDmFlagCallback(menu.state.s_no_spheres_box, 1, DF_NO_SPHERES, "Rogue remove spheres should set DF_NO_SPHERES");
M_Keydown(menu, K_ESCAPE);
developerSearchpath = 0;

Cvar_Set(cvar, "allow_download", "1");
Cvar_Set(cvar, "allow_download_maps", "0");
Cvar_Set(cvar, "allow_download_players", "1");
Cvar_Set(cvar, "allow_download_models", "0");
Cvar_Set(cvar, "allow_download_sounds", "1");
M_Menu_DownloadOptions_f(menu);
assert.equal(menu.state.s_downloadoptions_menu.nitems, 6, "DownloadOptions_MenuInit item count mismatch");
assert.equal(menu.state.s_downloadoptions_menu.cursor, 1, "DownloadOptions_MenuInit should skip the title cursor slot");
assert.equal(menu.state.s_download_title.generic.name, "Download Options", "DownloadOptions_MenuInit title mismatch");
assert.equal(menu.state.s_allow_download_box.curvalue, 1, "allow_download initial value mismatch");
assert.equal(menu.state.s_allow_download_maps_box.curvalue, 0, "allow_download_maps initial value mismatch");
assert.equal(menu.state.s_allow_download_players_box.curvalue, 1, "allow_download_players initial value mismatch");
assert.equal(menu.state.s_allow_download_models_box.curvalue, 0, "allow_download_models initial value mismatch");
assert.equal(menu.state.s_allow_download_sounds_box.curvalue, 1, "allow_download_sounds initial value mismatch");

qmenu.state.drawStrings.length = 0;
M_Draw(menu);
assert.ok(qmenu.state.drawStrings.some((entry) => entry.text === "Download Options"), "DownloadOptions_MenuDraw should draw the title");
assert.ok(qmenu.state.drawStrings.some((entry) => entry.text === "player models/skins"), "DownloadOptions_MenuDraw should draw player models/skins");

menu.state.s_downloadoptions_menu.cursor = 1;
M_Keydown(menu, K_LEFTARROW);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "allow_download")?.string, "0", "allow downloading should update allow_download");
menu.state.s_downloadoptions_menu.cursor = 2;
M_Keydown(menu, K_RIGHTARROW);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "allow_download_maps")?.string, "1", "maps should update allow_download_maps");
menu.state.s_downloadoptions_menu.cursor = 3;
M_Keydown(menu, K_LEFTARROW);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "allow_download_players")?.string, "0", "player models/skins should update allow_download_players");
menu.state.s_downloadoptions_menu.cursor = 4;
M_Keydown(menu, K_RIGHTARROW);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "allow_download_models")?.string, "1", "models should update allow_download_models");
menu.state.s_downloadoptions_menu.cursor = 5;
M_Keydown(menu, K_LEFTARROW);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "allow_download_sounds")?.string, "0", "sounds should update allow_download_sounds");
M_Keydown(menu, K_ESCAPE);

menu.state.s_startserver_menu.cursor = 1;
M_Keydown(menu, K_RIGHTARROW);
assert.equal(menu.state.s_rules_box.curvalue, 1, "rules spincontrol should switch to cooperative");
assert.equal(menu.state.s_maxclients_field.buffer, "4", "RulesChangeFunc should clamp coop maxclients to 4");
assert.equal(menu.state.s_startserver_dmoptions_action.generic.statusbar, "N/A for cooperative", "RulesChangeFunc coop dmoptions status mismatch");

menu.state.s_startserver_menu.cursor = 7;
M_Keydown(menu, K_ENTER);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "deathmatch")?.string, "0", "StartServerActionFunc coop deathmatch mismatch");
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "coop")?.string, "1", "StartServerActionFunc coop cvar mismatch");
assert.equal(decodeCommandBuffer(cmd).includes("disconnect\ngamemap \"*BUNK1$start\"\n"), true, "StartServerActionFunc coop map command mismatch");
assert.equal(keys.state.key_dest, keydest_t.key_game, "StartServerActionFunc should close menus");

M_Menu_Main_f(menu);
menu.state.m_main_cursor = 1;
M_Keydown(menu, K_ENTER);
M_Keydown(menu, K_DOWNARROW);
M_Keydown(menu, K_DOWNARROW);
M_Keydown(menu, K_ENTER);
assert.equal(menu.state.s_multiplayer_menu.statusbar, "No valid player models found", "player setup without models should report missing player models");
assert.equal(menu.state.m_menudepth, 2, "player setup without models should leave multiplayer menu active");

Cvar_Set(cvar, "name", "Ranger");
Cvar_Set(cvar, "skin", "female/athena");
Cvar_Set(cvar, "hand", "0");
Cvar_Set(cvar, "rate", "5000");
playerModels = [
  { directory: "cyborg", skins: ["oni", "ps9000"] },
  { directory: "female", skins: ["athena", "venus"] },
  { directory: "male", skins: ["grunt", "major"] }
];
M_Keydown(menu, K_ENTER);
assert.equal(menu.state.m_menudepth, 3, "player setup with models should push player config");
assert.equal(menu.state.s_player_config_menu.nitems, 10, "PlayerConfig_MenuInit item count mismatch");
assert.equal(menu.state.s_player_name_field.buffer, "Ranger", "PlayerConfig_MenuInit name field mismatch");
assert.equal(menu.state.s_player_model_box.itemnames?.slice(0, 3).join(","), "male,female,cyborg", "PlayerConfig_MenuInit should sort male/female first");
assert.equal(menu.state.s_player_model_box.curvalue, 1, "PlayerConfig_MenuInit current model mismatch");
assert.equal(menu.state.s_player_skin_box.curvalue, 0, "PlayerConfig_MenuInit current skin mismatch");
assert.equal(menu.state.s_player_rate_box.curvalue, 2, "PlayerConfig_MenuInit rate mismatch");

playerPreviews.length = 0;
drawPics.length = 0;
M_Draw(menu);
assert.equal(playerPreviews.length, 1, "PlayerConfig_MenuDraw should emit a preview snapshot");
assert.equal(playerPreviews[0]?.modelPath, "players/female/tris.md2", "PlayerConfig preview model path mismatch");
assert.equal(playerPreviews[0]?.skinPath, "players/female/athena.pcx", "PlayerConfig preview skin path mismatch");
assert.ok(drawPics.some((entry) => entry.name === "/players/female/athena_i.pcx"), "PlayerConfig_MenuDraw should draw skin icon");

menu.state.s_player_config_menu.cursor = 2;
M_Keydown(menu, K_RIGHTARROW);
assert.equal(menu.state.s_player_model_box.curvalue, 2, "ModelCallback should advance selected model");
assert.equal(menu.state.s_player_skin_box.curvalue, 0, "ModelCallback should reset skin index");
assert.equal(menu.state.s_player_skin_box.itemnames?.[0], "oni", "ModelCallback should replace skin list");

menu.state.s_player_config_menu.cursor = 6;
M_Keydown(menu, K_RIGHTARROW);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "hand")?.string, "1", "HandednessCallback should set hand");

menu.state.s_player_config_menu.cursor = 8;
M_Keydown(menu, K_RIGHTARROW);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "rate")?.string, "10000", "RateCallback should set rate");

menu.state.s_player_config_menu.cursor = 9;
M_Keydown(menu, K_ENTER);
assert.equal(menu.state.m_menudepth, 4, "download options action should push download options from player config");
M_Keydown(menu, K_ESCAPE);

menu.state.s_player_name_field.buffer = "Marine";
menu.state.s_player_config_menu.cursor = 0;
M_Keydown(menu, K_ESCAPE);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "name")?.string, "Marine", "PlayerConfig_MenuKey escape should persist name");
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "skin")?.string, "cyborg/oni", "PlayerConfig_MenuKey escape should persist skin");
assert.equal(menu.state.s_numplayermodels, 0, "PlayerConfig_MenuKey escape should clear temporary model state");
playerModels = null;

M_Keydown(menu, K_ESCAPE);
assert.equal(menu.state.m_menudepth, 1, "escape from multiplayer should pop one menu layer");
assert.equal(sounds.at(-1), "misc/menu3.wav", "M_PopMenu sound mismatch");

menu.state.m_main_cursor = 2;
Cvar_Set(cvar, "s_volume", "0.7");
Cvar_Set(cvar, "cd_nocd", "1");
Cvar_Set(cvar, "s_loadas8bit", "1");
Cvar_Set(cvar, "s_primary", "0");
Cvar_Set(cvar, "sensitivity", "5");
Cvar_Set(cvar, "cl_run", "1");
Cvar_Set(cvar, "m_pitch", "-0.022");
Cvar_Set(cvar, "lookspring", "1");
Cvar_Set(cvar, "lookstrafe", "0");
Cvar_Set(cvar, "freelook", "1");
Cvar_Set(cvar, "crosshair", "3");
Cvar_Set(cvar, "in_joystick", "1");
Cvar_Set(cvar, "win_noalttab", "0");
M_Keydown(menu, K_ENTER);
assert.equal(menu.state.m_menudepth, 2, "options entry should push the options menu");
assert.equal(menu.state.s_options_menu.nitems, 15, "Options_MenuInit item count mismatch");
assert.equal(menu.state.s_options_menu.items[0]?.generic.name, "effects volume", "Options_MenuInit first item mismatch");
assert.equal(menu.state.s_options_menu.items[12]?.generic.name, "customize controls", "Options_MenuInit customize item mismatch");
assert.equal(menu.state.s_options_menu.items[13]?.generic.name, "reset defaults", "Options_MenuInit defaults item mismatch");
assert.equal(menu.state.s_options_menu.items[14]?.generic.name, "go to console", "Options_MenuInit console item mismatch");
assert.equal(menu.state.s_options_sfxvolume_slider.curvalue, 7, "Options_MenuInit effects volume mismatch");
assert.equal(menu.state.s_options_cdvolume_box.curvalue, 0, "Options_MenuInit CD music mismatch");
assert.equal(menu.state.s_options_quality_list.curvalue, 0, "Options_MenuInit sound quality mismatch");
assert.equal(menu.state.s_options_compatibility_list.curvalue, 0, "Options_MenuInit sound compatibility mismatch");
assert.equal(menu.state.s_options_sensitivity_slider.curvalue, 10, "Options_MenuInit mouse speed mismatch");
assert.equal(menu.state.s_options_alwaysrun_box.curvalue, 1, "Options_MenuInit always run mismatch");
assert.equal(menu.state.s_options_invertmouse_box.curvalue, 1, "Options_MenuInit invert mouse mismatch");
assert.equal(menu.state.s_options_lookspring_box.curvalue, 1, "Options_MenuInit lookspring mismatch");
assert.equal(menu.state.s_options_lookstrafe_box.curvalue, 0, "Options_MenuInit lookstrafe mismatch");
assert.equal(menu.state.s_options_freelook_box.curvalue, 1, "Options_MenuInit freelook mismatch");
assert.equal(menu.state.s_options_crosshair_box.curvalue, 3, "Options_MenuInit crosshair mismatch");
assert.equal(menu.state.s_options_joystick_box.curvalue, 1, "Options_MenuInit joystick mismatch");

drawPics.length = 0;
qmenu.state.drawChars.length = 0;
M_Draw(menu);
assert.ok(drawPics.some((entry) => entry.name === "m_banner_options"), "Options_MenuDraw banner mismatch");
assert.ok(qmenu.state.drawChars.length > 0, "Options_MenuDraw should emit qmenu characters");

menu.state.s_options_menu.cursor = 2;
M_Keydown(menu, K_RIGHTARROW);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "s_khz")?.string, "22", "sound quality should set s_khz");
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "s_loadas8bit")?.string, "0", "sound quality should disable 8-bit loading");
assert.equal(soundRestartCalls, 1, "sound quality should request sound restart");
assert.equal(endFrameCalls, 2, "sound quality should end the frame before restart");

menu.state.s_options_menu.cursor = 3;
M_Keydown(menu, K_RIGHTARROW);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "s_primary")?.string, "1", "sound compatibility should update s_primary");
assert.equal(soundRestartCalls, 2, "sound compatibility should request sound restart");
assert.equal(endFrameCalls, 3, "sound compatibility should end the frame before restart");

menu.state.s_options_menu.cursor = 12;
M_Keydown(menu, K_ENTER);
assert.equal(menu.state.m_menudepth, 3, "customize controls should push the keys menu");
assert.equal(menu.state.s_keys_menu.nitems, 23, "Keys_MenuInit item count mismatch");
assert.equal(menu.state.s_keys_menu.statusbar, "enter to change, backspace to clear", "Keys_MenuInit status bar mismatch");

Key_SetBinding(keys, "w".charCodeAt(0), "+forward");
Key_SetBinding(keys, "s".charCodeAt(0), "+back");
qmenu.state.drawStrings.length = 0;
qmenu.state.drawChars.length = 0;
M_Draw(menu);
assert.ok(qmenu.state.drawStrings.some((entry) => entry.text === "w"), "Keys_MenuDraw should render the first binding");
assert.ok(qmenu.state.drawStrings.some((entry) => entry.text === "s"), "Keys_MenuDraw should render another binding");

menu.state.s_keys_menu.cursor = 0;
M_Keydown(menu, K_ENTER);
assert.equal(menu.state.bind_grab, true, "Keys_MenuKey enter should arm bind capture");
assert.equal(menu.state.s_keys_menu.statusbar, "press a key or button for this action", "bind capture status bar mismatch");

M_Keydown(menu, "f".charCodeAt(0));
assert.equal(menu.state.bind_grab, false, "Keys_MenuKey should clear bind capture after storing a key");
assert.equal(decodeCommandBuffer(cmd).includes("bind \"f\" \"+attack\"\n"), true, "Keys_MenuKey should queue bind command");
assert.equal(menu.state.s_keys_menu.statusbar, "enter to change, backspace to clear", "bind capture should restore status bar");

Key_SetBinding(keys, "g".charCodeAt(0), "+attack");
menu.state.s_keys_menu.cursor = 0;
M_Keydown(menu, K_BACKSPACE);
assert.notEqual(keys.state.keybindings["f".charCodeAt(0)], "+attack", "Keys_MenuKey backspace should clear one matching binding");
assert.notEqual(keys.state.keybindings["g".charCodeAt(0)], "+attack", "Keys_MenuKey backspace should clear all matching bindings");

M_Keydown(menu, K_ESCAPE);
assert.equal(menu.state.m_menudepth, 2, "escape from keys should pop back to options");

menu.state.s_options_menu.cursor = 14;
M_Keydown(menu, K_ENTER);
assert.equal(clearTypingCalls, 1, "go to console should clear typing state");
assert.equal(clearNotifyCalls, 1, "go to console should clear notify lines");
assert.equal(keys.state.key_dest, keydest_t.key_console, "go to console should switch key_dest to console");
assert.equal(menu.state.m_menudepth, 0, "go to console should close the menu stack");

M_Menu_Main_f(menu);

menu.state.m_main_cursor = 0;
M_Keydown(menu, K_ENTER);
assert.equal(menu.state.m_menudepth, 2, "game entry should push the game menu");
assert.equal(menu.state.s_game_menu.nitems, 8, "Game_MenuInit item count mismatch");
assert.equal(menu.state.s_game_menu.items[4]?.generic.name, "load game", "Game_MenuInit load item mismatch");
assert.equal(menu.state.s_game_menu.items[5]?.generic.name, "save game", "Game_MenuInit save item mismatch");

menu.state.s_game_menu.cursor = 0;
M_Keydown(menu, K_ENTER);
assert.equal(cvar.cvar_vars.find((entry) => entry.name === "skill")?.string, "0", "easy skill mismatch");
assert.equal(client.cl.servercount, -1, "StartGame servercount mismatch");
assert.equal(keys.state.key_dest, keydest_t.key_game, "StartGame key_dest mismatch");
assert.equal(decodeCommandBuffer(cmd).includes("loading ; killserver ; wait ; newgame\n"), true, "StartGame command buffer mismatch");

M_Menu_Main_f(menu);
menu.state.m_main_cursor = 0;
M_Keydown(menu, K_ENTER);
menu.state.s_game_menu.cursor = 7;
M_Keydown(menu, K_ENTER);
assert.equal(menu.state.credits, idcredits, "credits action should open id fallback credits");
assert.equal(menu.state.credits_start_time, client.cls.realtime, "M_Menu_Credits_f should capture start time");

drawChars.length = 0;
client.cls.realtime += 40;
M_Draw(menu);
assert.ok(drawChars.some((entry) => entry.c === "Q".charCodeAt(0) + 128), "M_Credits_MenuDraw should render bold title chars");

M_Keydown(menu, K_ESCAPE);
assert.equal(menu.state.m_menudepth, 2, "credits escape should pop back to the game menu");

developerSearchpath = 1;
M_Menu_Credits_f(menu);
assert.equal(menu.state.credits[0], "+QUAKE II MISSION PACK: THE RECKONING", "xatrix developer path should select xatrix credits");
M_Keydown(menu, K_ESCAPE);

developerSearchpath = 2;
M_Menu_Credits_f(menu);
assert.equal(menu.state.credits[0], "+QUAKE II MISSION PACK 2: GROUND ZERO", "rogue developer path should select rogue credits");
M_Keydown(menu, K_ESCAPE);

developerSearchpath = 0;
creditsText = "+CUSTOM CREDITS\r\nFirst Line\nSecond Line";
M_Menu_Credits_f(menu);
assert.equal(menu.state.creditsBuffer, creditsText, "loaded credits should be retained while credits menu is active");
assert.deepEqual(menu.state.credits.slice(0, 4), ["+CUSTOM CREDITS", "First Line", "Second Line", null], "loaded credits parser should split CR/LF source-style");
M_Keydown(menu, K_ESCAPE);
assert.equal(menu.state.creditsBuffer, null, "credits escape should clear loaded credits buffer");
assert.equal(menu.state.creditsIndex[0], null, "credits escape should clear loaded credits index");
creditsText = null;

Create_Savestrings(menu);
assert.deepEqual(menu.state.m_savestrings.slice(0, 3), ["AUTOSAVE", "Unit 1", "Unit 2"], "Create_Savestrings labels mismatch");
assert.deepEqual(menu.state.m_savevalid.slice(0, 3), [true, true, false], "Create_Savestrings validity mismatch");
assert.equal(menu.state.m_savestrings[3], "<EMPTY>", "Create_Savestrings empty fallback mismatch");

M_Menu_LoadGame_f(menu);
assert.equal(menu.state.s_loadgame_menu.nitems, 15, "LoadGame_MenuInit slot count mismatch");
assert.equal(menu.state.s_loadgame_actions[0].generic.name, "AUTOSAVE", "LoadGame_MenuInit autosave label mismatch");
assert.equal(menu.state.s_loadgame_actions[1].generic.y, 20, "LoadGame_MenuInit spacing mismatch");
menu.state.s_loadgame_menu.cursor = 2;
M_Keydown(menu, K_ENTER);
assert.equal(decodeCommandBuffer(cmd).includes("load save2\n"), false, "invalid load slot should not queue a command");
assert.equal(keys.state.key_dest, keydest_t.key_game, "LoadGame invalid selection should close menus");

M_Menu_LoadGame_f(menu);
menu.state.s_loadgame_menu.cursor = 1;
M_Keydown(menu, K_ENTER);
assert.equal(decodeCommandBuffer(cmd).includes("load save1\n"), true, "valid load slot should queue command");

M_Menu_SaveGame_f(menu);
assert.equal(menu.state.s_savegame_menu.nitems, 14, "SaveGame_MenuInit should skip autosave slot");
assert.equal(menu.state.s_savegame_actions[0].generic.name, "Unit 1", "SaveGame_MenuInit first label mismatch");
assert.equal(menu.state.s_savegame_actions[0].generic.localdata[0], 1, "SaveGame_MenuInit first slot index mismatch");
menu.state.s_savegame_menu.cursor = 0;
M_Keydown(menu, K_ENTER);
assert.equal(decodeCommandBuffer(cmd).includes("save save1\n"), true, "SaveGame valid selection should queue command");

menu.hooks.getServerState = () => 0;
const saveDepthBefore = menu.state.m_menudepth;
M_Menu_SaveGame_f(menu);
assert.equal(menu.state.m_menudepth, saveDepthBefore, "M_Menu_SaveGame_f should no-op when no server is running");
menu.hooks.getServerState = () => 1;

M_Menu_Main_f(menu);
menu.state.m_main_cursor = 3;
M_Keydown(menu, K_ENTER);
assert.equal(videoMenuInitCalls, 1, "video menu should call VID_MenuInit");
M_Draw(menu);
assert.equal(videoMenuDrawCalls, 1, "video menu should call VID_MenuDraw");
M_Keydown(menu, K_ENTER);
assert.equal(videoMenuKey, K_ENTER, "video menu should route key presses to VID_MenuKey");
assert.equal(sounds.at(-1), "misc/menu2.wav", "VID_MenuKey returned sound mismatch");
M_Keydown(menu, K_ESCAPE);

M_Menu_Quit_f(menu);
drawPics.length = 0;
M_Draw(menu);
assert.ok(drawPics.some((entry) => entry.name === "quit"), "M_Quit_Draw mismatch");
M_Keydown(menu, "y".charCodeAt(0));
assert.equal(quitCalled, 1, "M_Quit_Key should trigger quit hook");
assert.equal(keys.state.key_dest, keydest_t.key_console, "M_Quit_Key should switch to console destination on confirm");

console.log("quake2-menu: ok");

function decodeCommandBuffer(runtime: ReturnType<typeof createCommandRuntime>): string {
  let text = "";
  for (let i = 0; i < runtime.cmd_text.cursize; i += 1) {
    text += String.fromCharCode(runtime.cmd_text.data[i] ?? 0);
  }
  return text;
}
