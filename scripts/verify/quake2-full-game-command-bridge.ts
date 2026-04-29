/**
 * File: quake2-full-game-command-bridge.ts
 * Purpose: Verify the source-style Game menu command bridge used by `full-game.html`.
 *
 * This file is not a direct source port.
 * It validates that `StartGame` keeps queuing the original command chain and that the web host bridge handles it.
 *
 * Dependencies:
 * - apps/web/src/full-game-command-bridge.ts
 * - packages/client
 * - packages/qcommon
 */

import { strict as assert } from "node:assert";

import {
  K_ENTER,
  M_Init,
  M_Keydown,
  M_Menu_Main_f,
  SCR_Init,
  createClientKeyContext,
  createClientMenuContext,
  createClientQMenuContext,
  createClientRuntime,
  createClientScreenContext,
  createClientVidContext,
  createRefExport,
  keydest_t
} from "../../packages/client/src/index.js";
import {
  Cbuf_Execute,
  Cmd_Init,
  Cvar_FindVar,
  Cvar_Init,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import {
  createFullGameCommandBridgeState,
  registerFullGameCommandBridge,
  syncFullGameLoadingState
} from "../../apps/web/src/full-game-command-bridge.js";

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const keys = createClientKeyContext({ client, cmd, cvar });

Cmd_Init(cmd);
Cvar_Init(cvar, cmd);
SCR_Init(createClientScreenContext(client, cmd, cvar));

const bridge = createFullGameCommandBridgeState();
const prints: string[] = [];
registerFullGameCommandBridge(cmd, cvar, client, bridge, {
  onPrint: (message) => {
    prints.push(message);
  },
  onMapRequested: (map, source) => {
    prints.push(`${source} ${map}: preparation du host jeu final.`);
  }
});

const qmenu = createClientQMenuContext();
const menu = createClientMenuContext({
  client,
  keys,
  qmenu,
  cmd,
  cvar,
  vid: createClientVidContext(),
  ref: createRefExport()
});
M_Init(menu);
M_Menu_Main_f(menu);

menu.state.m_main_cursor = 0;
M_Keydown(menu, K_ENTER);
menu.state.s_game_menu.cursor = 0;
M_Keydown(menu, K_ENTER);

assert.equal(Cvar_FindVar(cvar, "skill")?.string, "0", "Game > Easy should force skill 0");
assert.equal(keys.state.key_dest, keydest_t.key_game, "StartGame should switch to key_game");

Cbuf_Execute(cmd);
const enteredLoading = syncFullGameLoadingState(client, bridge);
assert.equal(enteredLoading, true, "loading sync should report the host loading transition");
assert.equal(client.cl.screen.scr_draw_loading, 1, "loading command should activate the loading plaque");
assert.deepEqual(bridge.transitions, ["killserver", "loading"], "first command pass should stop at wait after loading and killserver");
assert.equal(syncFullGameLoadingState(client, bridge), false, "loading sync should not duplicate the transition");

Cbuf_Execute(cmd);
assert.equal(bridge.requestedMap, "*base1", "newgame should route to the source base1 map");
assert.deepEqual(bridge.transitions, [
  "killserver",
  "loading",
  "newgame",
  "gamemap *base1"
], "second command pass should execute newgame and gamemap");
assert.equal(bridge.serverRunning, true, "gamemap should mark the host server bridge active");
assert.equal(prints.at(-1), "gamemap *base1: preparation du host jeu final.", "gamemap hook print mismatch");

console.log("quake2-full-game-command-bridge: ok");
