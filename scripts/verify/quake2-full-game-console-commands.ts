/**
 * File: quake2-full-game-console-commands.ts
 * Purpose: Verify the command groups that `full-game.html` is expected to expose through the Quake II console.
 *
 * This file is not a direct source port.
 * It is a focused integration harness for the command registration path used by `apps/web/src/full-game.ts`.
 *
 * Dependencies:
 * - packages/client
 * - packages/qcommon
 */

import { strict as assert } from "node:assert";

import {
  CL_InitInput,
  CL_InitLocal,
  Con_Init,
  Key_Init,
  M_Init,
  SCR_Init,
  V_Init,
  createClientConsoleContext,
  createClientInputContext,
  createClientKeyContext,
  createClientMainContext,
  createClientMenuContext,
  createClientQMenuContext,
  createClientRuntime,
  createClientScreenContext,
  createClientSoundLocalContext,
  createClientVidContext,
  createClientViewContext,
  createRefExport
} from "../../packages/client/src/index.js";
import {
  createClientSndDmaContext,
  S_Init as S_DMA_Init
} from "../../packages/client/src/snd_dma.js";
import {
  Cmd_Exists,
  Cmd_Init,
  Cvar_Init,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import {
  createFullGameCommandBridgeState,
  registerFullGameCommandBridge
} from "../../apps/web/src/full-game-command-bridge.js";
import { registerWebConfigCommands } from "../../apps/web/src/web-config-commands.js";

const EXPECTED_COMMANDS: Record<string, string[]> = {
  qcommon: [
    "cmdlist",
    "exec",
    "echo",
    "alias",
    "wait"
  ],
  cvar: [
    "set",
    "cvarlist"
  ],
  console: [
    "toggleconsole",
    "togglechat",
    "messagemode",
    "messagemode2",
    "clear",
    "condump"
  ],
  keys: [
    "bind",
    "unbind",
    "unbindall",
    "bindlist"
  ],
  menu: [
    "menu_main",
    "menu_game",
    "menu_loadgame",
    "menu_savegame",
    "menu_credits",
    "menu_multiplayer",
    "menu_joinserver",
    "menu_addressbook",
    "menu_startserver",
    "menu_dmoptions",
    "menu_downloadoptions",
    "menu_playerconfig",
    "menu_video",
    "menu_options",
    "menu_keys",
    "menu_quit"
  ],
  clientMain: [
    "skins",
    "cmd",
    "changing",
    "connect",
    "disconnect",
    "download",
    "pause",
    "pingservers",
    "precache",
    "quit",
    "rcon",
    "reconnect",
    "setenv",
    "snd_restart",
    "userinfo"
  ],
  clientForwarded: [
    "wave",
    "inven",
    "kill",
    "use",
    "drop",
    "say",
    "say_team",
    "info",
    "prog",
    "give",
    "god",
    "notarget",
    "noclip",
    "invuse",
    "invprev",
    "invnext",
    "invdrop",
    "weapnext",
    "weapprev"
  ],
  input: [
    "centerview",
    "+moveup",
    "-moveup",
    "+movedown",
    "-movedown",
    "+left",
    "-left",
    "+right",
    "-right",
    "+forward",
    "-forward",
    "+back",
    "-back",
    "+lookup",
    "-lookup",
    "+lookdown",
    "-lookdown",
    "+strafe",
    "-strafe",
    "+moveleft",
    "-moveleft",
    "+moveright",
    "-moveright",
    "+speed",
    "-speed",
    "+attack",
    "-attack",
    "+use",
    "-use",
    "+klook",
    "-klook",
    "impulse"
  ],
  screen: [
    "sizeup",
    "sizedown",
    "loading",
    "timerefresh",
    "sky"
  ],
  view: [
    "gun_next",
    "gun_prev",
    "gun_model",
    "viewpos"
  ],
  audio: [
    "play",
    "stopsound",
    "soundlist",
    "soundinfo"
  ],
  webConfig: [
    "writeconfig"
  ],
  gameBridge: [
    "killserver",
    "newgame",
    "gamemap",
    "map"
  ]
};

const NOT_YET_REGISTERED = [
  "save",
  "load",
  "fly"
];

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();

Cmd_Init(cmd);
Cvar_Init(cvar, cmd);

const keys = createClientKeyContext({ client, cmd, cvar });
Key_Init(keys);

const consoleContext = createClientConsoleContext({
  client,
  keys,
  cmd,
  cvar,
  hooks: {}
});
Con_Init(consoleContext, 640);

CL_InitLocal(createClientMainContext(client, cmd, cvar), {
  getMilliseconds: () => client.cls.realtime,
  onWriteConfigFile: () => false
});
CL_InitInput(createClientInputContext(client, cmd, cvar));
V_Init(createClientViewContext(client, cmd, cvar));
SCR_Init(createClientScreenContext(client, cmd, cvar));
registerFullGameCommandBridge(cmd, cvar, client, createFullGameCommandBridgeState());
registerWebConfigCommands(cmd, {
  writeConfiguration: () => true
});

const soundLocal = createClientSoundLocalContext({
  onSNDDMA_Init: () => {
    soundLocal.state.dma.channels = 2;
    soundLocal.state.dma.samples = 4096;
    soundLocal.state.dma.samplepos = 0;
    soundLocal.state.dma.samplebits = 16;
    soundLocal.state.dma.speed = 11025;
    soundLocal.state.dma.submission_chunk = 1;
    soundLocal.state.dma.buffer = new Uint8Array(4096 * 2);
    return true;
  }
});
S_DMA_Init(createClientSndDmaContext(client, cmd, cvar, soundLocal));

const qmenu = createClientQMenuContext();
const vid = createClientVidContext();
const menu = createClientMenuContext({
  client,
  keys,
  qmenu,
  cmd,
  cvar,
  vid,
  ref: createRefExport()
});
M_Init(menu);

for (const [group, commands] of Object.entries(EXPECTED_COMMANDS)) {
  for (const command of commands) {
    assert.equal(Cmd_Exists(cmd, command), true, `${group} command should be registered: ${command}`);
  }
}

for (const command of NOT_YET_REGISTERED) {
  assert.equal(Cmd_Exists(cmd, command), false, `server/game command should still be explicitly unregistered: ${command}`);
}

const registered = new Set(cmd.cmd_functions.map((entry) => entry.name));
const expectedCount = Object.values(EXPECTED_COMMANDS).flat().length;
assert.equal(registered.size >= expectedCount, true, "registered command set should cover every expected full-game group");

console.log(`quake2-full-game-console-commands: ok (${registered.size} commands registered)`);
