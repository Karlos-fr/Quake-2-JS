/**
 * File: quake2-console.ts
 * Purpose: Verify that the TypeScript target for `client/console.c` preserves the main interactive console behaviors.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the `client/console.c` runtime port.
 *
 * Dependencies:
 * - packages/client/src/console.ts
 */

import { strict as assert } from "node:assert";

import { createVirtualFilesystem } from "../../packages/filesystem/src/index.js";
import {
  Con_ClearNotify,
  Con_CenteredPrint,
  Con_DrawConsole,
  Con_DrawInput,
  Con_DrawNotify,
  Con_Dump_f,
  Con_Init,
  Con_MessageMode2_f,
  Con_MessageMode_f,
  Con_Print,
  Con_ToggleChat_f,
  Con_ToggleConsole_f,
  DrawAltString,
  DrawString,
  Key_ClearTyping,
  createClientConsoleContext,
  createConsoleState
} from "../../packages/client/src/console.js";
import { createClientKeyContext, keydest_t } from "../../packages/client/src/keys.js";
import { createClientRuntime, connstate_t } from "../../packages/client/src/client.js";
import {
  Cbuf_Execute,
  Cmd_ExecuteString,
  Cvar_Get,
  Cvar_VariableValue,
  createCommandRuntime,
  createCvarRuntime,
  createQcommonGlobals
} from "../../packages/qcommon/src/index.js";

function decodeCommandBuffer(runtime: ReturnType<typeof createCommandRuntime>): string {
  return String.fromCharCode(...runtime.cmd_text.data.slice(0, runtime.cmd_text.cursize));
}

function readConsoleRow(con: ReturnType<typeof createConsoleState>, line = con.current): string {
  const row = ((line % con.totallines) + con.totallines) % con.totallines;
  return con.text.slice(row * con.linewidth, row * con.linewidth + con.linewidth).join("");
}

const printed: string[] = [];
const writtenFiles = new Map<string, string>();

const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const globals = createQcommonGlobals();
const client = createClientRuntime();
const keys = createClientKeyContext({ cmd, cvar, client });
const filesystem = createVirtualFilesystem("baseq2");

const context = createClientConsoleContext({
  keys,
  client,
  cmd,
  cvar,
  globals,
  filesystem,
  hooks: {
    SCR_EndLoadingPlaque(runtime) {
      runtime.cl.screen.scr_draw_loading = 0;
      runtime.cls.disable_screen = 0;
    },
    onWriteTextFile(path, contents) {
      writtenFiles.set(path, contents);
    },
    onPrint(line) {
      printed.push(line);
    }
  }
});

Cvar_Get(cvar, "paused", "0", 0);
Cvar_Get(cvar, "maxclients", "1", 0);

Con_Init(context, 320);
assert.equal(context.con.initialized, true, "Con_Init must initialize console");
assert.equal(context.con_notifytime?.string, "3", "Con_Init must resolve con_notifytime");
assert.equal(printed.includes("Console initialized.\n"), true, "Con_Init must print initialization banner");

Cmd_ExecuteString(cmd, "messagemode");
assert.equal(keys.state.key_dest, keydest_t.key_message, "messagemode must switch to message mode");
assert.equal(keys.state.chat_team, false, "messagemode must disable team chat");

Cmd_ExecuteString(cmd, "messagemode2");
assert.equal(keys.state.key_dest, keydest_t.key_message, "messagemode2 must keep message mode");
assert.equal(keys.state.chat_team, true, "messagemode2 must enable team chat");

Con_MessageMode_f(context);
assert.equal(keys.state.chat_team, false, "Con_MessageMode_f direct call mismatch");
Con_MessageMode2_f(context);
assert.equal(keys.state.chat_team, true, "Con_MessageMode2_f direct call mismatch");

client.cl.attractloop = true;
Cmd_ExecuteString(cmd, "toggleconsole");
assert.equal(decodeCommandBuffer(cmd), "killserver\n", "toggleconsole attractloop must queue killserver");
client.cl.attractloop = false;
cmd.cmd_text.cursize = 0;

client.cls.state = connstate_t.ca_disconnected;
Con_ToggleConsole_f(context);
assert.equal(decodeCommandBuffer(cmd), "d1\n", "toggleconsole disconnected must queue demo restart");
cmd.cmd_text.cursize = 0;

client.cls.state = connstate_t.ca_active;
globals.server_state = 1;
keys.state.key_dest = keydest_t.key_game;
Con_ToggleConsole_f(context);
assert.equal(keys.state.key_dest, keydest_t.key_console, "toggleconsole must open console");
assert.equal(Cvar_VariableValue(cvar, "paused"), 1, "toggleconsole must pause single-player local server");

Con_ToggleConsole_f(context);
assert.equal(keys.state.key_dest, keydest_t.key_game, "toggleconsole must close console through M_ForceMenuOff semantics");
assert.equal(Cvar_VariableValue(cvar, "paused"), 0, "toggleconsole close must clear paused");

keys.state.key_lines[keys.state.edit_line] = "]status";
keys.state.key_linepos = 7;
Key_ClearTyping(context);
assert.equal(keys.state.key_lines[keys.state.edit_line], "]", "Key_ClearTyping must clear the edit line");
assert.equal(keys.state.key_linepos, 1, "Key_ClearTyping must reset line position");
keys.state.key_lines[keys.state.edit_line] = "]status";
keys.state.key_linepos = 7;
keys.state.key_dest = keydest_t.key_console;
client.cls.realtime = 512;
const input = Con_DrawInput(context);
assert.equal(input?.text.startsWith("]status"), true, "Con_DrawInput must expose edit line text");

assert.deepEqual(DrawString(8, 16, "abc"), { x: 8, y: 16, text: "abc", variant: "normal" }, "DrawString mismatch");
assert.deepEqual(
  DrawAltString(8, 16, "abc"),
  { x: 8, y: 16, text: "\u00e1\u00e2\u00e3", variant: "alt" },
  "DrawAltString mismatch"
);

const isolatedCon = createConsoleState();
Con_Init(isolatedCon, 320);
Con_Print(isolatedCon, "status\r", 900);
Con_Print(isolatedCon, "ready\n", 901);
assert.equal(
  readConsoleRow(isolatedCon).startsWith("ready "),
  true,
  "Con_Print must preserve C static carriage-return state across calls"
);
Con_Print(isolatedCon, "\u0001red\n", 902);
assert.equal(
  readConsoleRow(isolatedCon)[0]?.charCodeAt(0),
  "r".charCodeAt(0) | 0x80,
  "Con_Print high-bit mask mismatch"
);
Con_CenteredPrint(isolatedCon, "quake", 903);
assert.equal(
  readConsoleRow(isolatedCon).startsWith("                quake"),
  true,
  "Con_CenteredPrint must center against current linewidth"
);

Con_Print(context.con, "hello world\nsecond line\n", 1000);
Con_Print(context.con, "\u0001colored\n", 1200);
context.keys.state.con_current = context.con.current;
context.keys.state.con_display = context.con.current;

const notify = Con_DrawNotify(context, 320);
assert.equal(notify.lines.length >= 1, true, "Con_DrawNotify must expose recent notify lines");
assert.equal(
  Con_DrawNotify(context.con, 6000, 3000).some((line) => line.text.includes("colored")),
  false,
  "Con_DrawNotify header form must drop expired lines"
);

keys.state.key_dest = keydest_t.key_message;
keys.state.chat_team = true;
keys.state.chat_buffer = "0123456789abcdefghijklmnopqrstuvwxyz";
keys.state.chat_bufferlen = keys.state.chat_buffer.length;
const notifyWithChat = Con_DrawNotify(context, 320);
assert.equal(
  notifyWithChat.lines.some((line) => line.text.startsWith("say_team:")),
  true,
  "Con_DrawNotify must include chat prompt line"
);
assert.equal(
  notifyWithChat.lines.at(-1)?.text.includes("0123456789"),
  false,
  "Con_DrawNotify must horizontally scroll long chat input"
);
assert.equal(notifyWithChat.dirty !== null, true, "Con_DrawNotify must report dirty overlay bounds");

keys.state.key_dest = keydest_t.key_console;
keys.state.con_display = context.con.current - 1;
context.client.cls.downloadname = "maps/base1.bsp";
context.client.cls.downloadpercent = 42;
const consoleSnapshot = Con_DrawConsole(context, 0.5, 320, 240);
assert.equal(consoleSnapshot !== null, true, "Con_DrawConsole must build a draw snapshot");
assert.equal(consoleSnapshot?.background.pic, "conback", "Con_DrawConsole background mismatch");
assert.equal(consoleSnapshot?.lines, 120, "Con_DrawConsole visible line count mismatch");
assert.equal(consoleSnapshot?.version.text, "\u00f6\u00b3\u00ae\u00b1\u00b9", "Con_DrawConsole version text mismatch");
assert.equal(consoleSnapshot?.backscroll !== null, true, "Con_DrawConsole must show backscroll arrows");
assert.equal(consoleSnapshot?.downloadBar?.text.includes("42%"), true, "Con_DrawConsole download bar mismatch");
assert.equal(consoleSnapshot?.input !== null, true, "Con_DrawConsole must include input line");
assert.equal(Con_DrawConsole(context, 0, 320, 240), null, "Con_DrawConsole must skip zero-height draws");

keys.state.key_linepos = context.con.linewidth + 2;
keys.state.key_lines[keys.state.edit_line] = `]${"x".repeat(context.con.linewidth + 3)}`;
const scrolledInput = Con_DrawInput(context);
assert.equal(scrolledInput?.text.length, context.con.linewidth, "Con_DrawInput must clamp to console linewidth");
assert.equal(scrolledInput?.text.startsWith("xxx"), true, "Con_DrawInput must horizontally scroll long input lines");

Con_ClearNotify(context.con);
assert.equal(Con_DrawNotify(context.con, 1500, 3000).length, 0, "Con_ClearNotify must clear header notify snapshot");

keys.state.key_dest = keydest_t.key_game;
Con_ToggleChat_f(context);
assert.equal(keys.state.key_dest, keydest_t.key_console, "Con_ToggleChat_f must open console from game");
Con_ToggleChat_f(context);
assert.equal(keys.state.key_dest, keydest_t.key_game, "Con_ToggleChat_f must return to game when active");

cmd.cmd_text.cursize = 0;
Cmd_ExecuteString(cmd, "condump test_console");
const condumpUsageOrResult = Con_Dump_f(context);
assert.equal(condumpUsageOrResult, undefined, "Con_Dump_f direct call should write through hook when configured");
assert.equal(writtenFiles.has("baseq2/test_console.txt"), true, "Con_Dump_f must write a text file");
assert.equal(
  writtenFiles.get("baseq2/test_console.txt")?.includes("hello world"),
  true,
  "Con_Dump_f output must contain console text"
);

console.log("quake2-console: ok");
