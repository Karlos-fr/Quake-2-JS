/**
 * File: quake2-keys.ts
 * Purpose: Verify that the TypeScript target for `client/keys.c` preserves binding commands, console editing and key dispatch behavior.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the strict `client/keys.c` port.
 *
 * Dependencies:
 * - packages/client/src/keys.ts
 * - packages/client/src/client.ts
 * - packages/qcommon/src/cmd.ts
 */

import { strict as assert } from "node:assert";

import { Cmd_ExecuteString, createCommandRuntime, STAT_LAYOUTS } from "../../packages/qcommon/src/index.js";
import {
  KEY_ARRAY_SIZE,
  K_ALT,
  K_AUX1,
  K_AUX2,
  K_AUX3,
  K_AUX4,
  K_AUX5,
  K_AUX6,
  K_AUX7,
  K_AUX8,
  K_AUX9,
  K_AUX10,
  K_AUX11,
  K_AUX12,
  K_AUX13,
  K_AUX14,
  K_AUX15,
  K_AUX16,
  K_AUX17,
  K_AUX18,
  K_AUX19,
  K_AUX20,
  K_AUX21,
  K_AUX22,
  K_AUX23,
  K_AUX24,
  K_AUX25,
  K_AUX26,
  K_AUX27,
  K_AUX28,
  K_AUX29,
  K_AUX30,
  K_AUX31,
  K_AUX32,
  K_BACKSPACE,
  K_CTRL,
  K_DEL,
  K_DOWNARROW,
  K_END,
  K_ENTER,
  K_ESCAPE,
  K_F1,
  K_F10,
  K_F11,
  K_F12,
  K_F2,
  K_F3,
  K_F4,
  K_F5,
  K_F6,
  K_F7,
  K_F8,
  K_F9,
  K_HOME,
  K_INS,
  K_JOY1,
  K_JOY2,
  K_JOY3,
  K_JOY4,
  K_KP_5,
  K_KP_DEL,
  K_KP_DOWNARROW,
  K_KP_END,
  K_KP_ENTER,
  K_KP_HOME,
  K_KP_INS,
  K_KP_LEFTARROW,
  K_KP_MINUS,
  K_KP_PGDN,
  K_KP_PGUP,
  K_KP_PLUS,
  K_KP_RIGHTARROW,
  K_KP_SLASH,
  K_KP_UPARROW,
  K_LEFTARROW,
  K_MOUSE1,
  K_MOUSE2,
  K_MOUSE3,
  K_MWHEELDOWN,
  K_MWHEELUP,
  K_PAUSE,
  K_PGDN,
  K_PGUP,
  K_RIGHTARROW,
  K_SHIFT,
  K_SPACE,
  K_TAB,
  K_UPARROW,
  Key_Bind_f,
  Key_ClearStates,
  Key_Console,
  Key_Event,
  Key_GetKey,
  Key_Init,
  Key_KeynumToString,
  Key_Message,
  Key_SetBinding,
  Key_StringToKeynum,
  Key_WriteBindings,
  CompleteCommand,
  createClientKeyContext,
  keydest_t
} from "../../packages/client/src/index.js";
import { createClientRuntime, connstate_t } from "../../packages/client/src/client.js";

const prints: string[] = [];
const addedText: string[] = [];
let menuKeydown = -1;
let menuOpened = false;
let toggleCount = 0;

const cmd = createCommandRuntime();
const client = createClientRuntime();
client.cls.state = connstate_t.ca_active;

const context = createClientKeyContext({
  cmd,
  client,
  hooks: {
    onPrint: (line) => {
      prints.push(line);
    },
    onAddText: (text) => {
      addedText.push(text);
    },
    onMenuKeydown: (key) => {
      menuKeydown = key;
    },
    onMenuMain: () => {
      menuOpened = true;
    },
    onToggleConsole: (ctx) => {
      toggleCount += 1;
      ctx.state.console_open = !ctx.state.console_open;
      ctx.state.key_dest = ctx.state.console_open ? keydest_t.key_console : keydest_t.key_game;
    },
    onCompleteCommand: (partial) => partial === "te" ? "testcmd" : null,
    onWaitForKey: () => K_F2
  }
});

assert.equal(KEY_ARRAY_SIZE, 256, "KEY_ARRAY_SIZE mismatch");
for (const [name, actual, expected] of [
  ["K_TAB", K_TAB, 9],
  ["K_ENTER", K_ENTER, 13],
  ["K_ESCAPE", K_ESCAPE, 27],
  ["K_SPACE", K_SPACE, 32],
  ["K_BACKSPACE", K_BACKSPACE, 127],
  ["K_UPARROW", K_UPARROW, 128],
  ["K_DOWNARROW", K_DOWNARROW, 129],
  ["K_LEFTARROW", K_LEFTARROW, 130],
  ["K_RIGHTARROW", K_RIGHTARROW, 131],
  ["K_ALT", K_ALT, 132],
  ["K_CTRL", K_CTRL, 133],
  ["K_SHIFT", K_SHIFT, 134],
  ["K_F1", K_F1, 135],
  ["K_F2", K_F2, 136],
  ["K_F3", K_F3, 137],
  ["K_F4", K_F4, 138],
  ["K_F5", K_F5, 139],
  ["K_F6", K_F6, 140],
  ["K_F7", K_F7, 141],
  ["K_F8", K_F8, 142],
  ["K_F9", K_F9, 143],
  ["K_F10", K_F10, 144],
  ["K_F11", K_F11, 145],
  ["K_F12", K_F12, 146],
  ["K_INS", K_INS, 147],
  ["K_DEL", K_DEL, 148],
  ["K_PGDN", K_PGDN, 149],
  ["K_PGUP", K_PGUP, 150],
  ["K_HOME", K_HOME, 151],
  ["K_END", K_END, 152],
  ["K_KP_HOME", K_KP_HOME, 160],
  ["K_KP_UPARROW", K_KP_UPARROW, 161],
  ["K_KP_PGUP", K_KP_PGUP, 162],
  ["K_KP_LEFTARROW", K_KP_LEFTARROW, 163],
  ["K_KP_5", K_KP_5, 164],
  ["K_KP_RIGHTARROW", K_KP_RIGHTARROW, 165],
  ["K_KP_END", K_KP_END, 166],
  ["K_KP_DOWNARROW", K_KP_DOWNARROW, 167],
  ["K_KP_PGDN", K_KP_PGDN, 168],
  ["K_KP_ENTER", K_KP_ENTER, 169],
  ["K_KP_INS", K_KP_INS, 170],
  ["K_KP_DEL", K_KP_DEL, 171],
  ["K_KP_SLASH", K_KP_SLASH, 172],
  ["K_KP_MINUS", K_KP_MINUS, 173],
  ["K_KP_PLUS", K_KP_PLUS, 174],
  ["K_MOUSE1", K_MOUSE1, 200],
  ["K_MOUSE2", K_MOUSE2, 201],
  ["K_MOUSE3", K_MOUSE3, 202],
  ["K_JOY1", K_JOY1, 203],
  ["K_JOY2", K_JOY2, 204],
  ["K_JOY3", K_JOY3, 205],
  ["K_JOY4", K_JOY4, 206],
  ["K_AUX1", K_AUX1, 207],
  ["K_AUX2", K_AUX2, 208],
  ["K_AUX3", K_AUX3, 209],
  ["K_AUX4", K_AUX4, 210],
  ["K_AUX5", K_AUX5, 211],
  ["K_AUX6", K_AUX6, 212],
  ["K_AUX7", K_AUX7, 213],
  ["K_AUX8", K_AUX8, 214],
  ["K_AUX9", K_AUX9, 215],
  ["K_AUX10", K_AUX10, 216],
  ["K_AUX11", K_AUX11, 217],
  ["K_AUX12", K_AUX12, 218],
  ["K_AUX13", K_AUX13, 219],
  ["K_AUX14", K_AUX14, 220],
  ["K_AUX15", K_AUX15, 221],
  ["K_AUX16", K_AUX16, 222],
  ["K_AUX17", K_AUX17, 223],
  ["K_AUX18", K_AUX18, 224],
  ["K_AUX19", K_AUX19, 225],
  ["K_AUX20", K_AUX20, 226],
  ["K_AUX21", K_AUX21, 227],
  ["K_AUX22", K_AUX22, 228],
  ["K_AUX23", K_AUX23, 229],
  ["K_AUX24", K_AUX24, 230],
  ["K_AUX25", K_AUX25, 231],
  ["K_AUX26", K_AUX26, 232],
  ["K_AUX27", K_AUX27, 233],
  ["K_AUX28", K_AUX28, 234],
  ["K_AUX29", K_AUX29, 235],
  ["K_AUX30", K_AUX30, 236],
  ["K_AUX31", K_AUX31, 237],
  ["K_AUX32", K_AUX32, 238],
  ["K_MWHEELDOWN", K_MWHEELDOWN, 239],
  ["K_MWHEELUP", K_MWHEELUP, 240],
  ["K_PAUSE", K_PAUSE, 255]
] as const) {
  assert.equal(actual, expected, `${name} mismatch`);
}
assert.equal(Key_StringToKeynum("TAB"), K_TAB, "Key_StringToKeynum named mismatch");
assert.equal(Key_StringToKeynum("a"), "a".charCodeAt(0), "Key_StringToKeynum ascii mismatch");
assert.equal(Key_KeynumToString(K_TAB), "TAB", "Key_KeynumToString named mismatch");
assert.equal(Key_KeynumToString("z".charCodeAt(0)), "z", "Key_KeynumToString ascii mismatch");

Key_Init(context);
assert.equal(context.state.key_lines[0], "]", "Key_Init prompt mismatch");
assert.equal(context.state.key_linepos, 1, "Key_Init linepos mismatch");
assert.equal(context.state.consolekeys[K_TAB], true, "Key_Init console key mismatch");
assert.equal(context.state.menubound[K_ESCAPE], true, "Key_Init menu key mismatch");
assert.equal(context.state.keyshift["a".charCodeAt(0)], "A".charCodeAt(0), "Key_Init keyshift mismatch");

Cmd_ExecuteString(cmd, "bind TAB +showscores");
assert.equal(context.state.keybindings[K_TAB], "+showscores", "bind command mismatch");

const writes: string[] = [];
Key_WriteBindings(context, {
  write: (chunk) => {
    writes.push(chunk);
  }
});
assert.deepEqual(writes, ["bind TAB \"+showscores\"\n"], "Key_WriteBindings mismatch");

Cmd_ExecuteString(cmd, "bind TAB");
assert.equal(prints.at(-1), "\"TAB\" = \"+showscores\"\n", "bind query print mismatch");

Cmd_ExecuteString(cmd, "unbind TAB");
assert.equal(context.state.keybindings[K_TAB], "", "unbind command mismatch");

Cmd_ExecuteString(cmd, "bind TAB +showscores");
Cmd_ExecuteString(cmd, "unbindall");
assert.equal(context.state.keybindings[K_TAB], "", "unbindall command mismatch");

context.state.key_lines[context.state.edit_line] = "]te";
context.state.key_linepos = 3;
CompleteCommand(context);
assert.equal(context.state.key_lines[context.state.edit_line], "]/testcmd ", "CompleteCommand mismatch");

context.state.key_dest = keydest_t.key_console;
context.state.key_lines[context.state.edit_line] = "]";
context.state.key_linepos = 1;
const pasteContext = createClientKeyContext({
  hooks: {
    onGetClipboardData: () => "clip\nignored"
  }
});
Key_Init(pasteContext);
pasteContext.state.keydown[K_CTRL] = true;
pasteContext.state.key_dest = keydest_t.key_console;
Key_Console(pasteContext, "v".charCodeAt(0));
assert.equal(pasteContext.state.key_lines[pasteContext.state.edit_line], "]clip", "clipboard paste mismatch");

pasteContext.state.con_current = 80;
pasteContext.state.con_totallines = 40;
Key_Console(pasteContext, K_HOME);
assert.equal(pasteContext.state.con_display, 50, "Key_Console home scrollback mismatch");

Key_Event(context, "`".charCodeAt(0), true, 1);
assert.equal(toggleCount, 1, "console toggle mismatch");

context.state.key_dest = keydest_t.key_message;
Key_Message(context, "h".charCodeAt(0));
Key_Message(context, "i".charCodeAt(0));
assert.equal(context.state.chat_buffer, "hi", "Key_Message append mismatch");
Key_Message(context, K_ENTER);
assert.deepEqual(addedText.slice(-3), ["say \"", "hi", "\"\n"], "Key_Message send mismatch");
assert.equal(context.state.chat_bufferlen, 0, "Key_Message clear mismatch");
assert.equal(context.state.key_dest, keydest_t.key_game, "Key_Message key_dest mismatch");

Key_SetBinding(context, K_MOUSE1, "+attack");
context.state.key_dest = keydest_t.key_game;
Key_Event(context, K_MOUSE1, true, 123);
Key_Event(context, K_MOUSE1, false, 456);
assert.deepEqual(addedText.slice(-2), ["+attack 200 123\n", "-attack 200 456\n"], "Key_Event button binding mismatch");
assert.equal(context.state.anykeydown, 0, "Key_Event anykeydown mismatch");

Key_SetBinding(context, "1".charCodeAt(0), "+slot1");
context.state.keydown[K_SHIFT] = true;
context.state.shift_down = true;
context.state.key_dest = keydest_t.key_game;
Key_Event(context, "1".charCodeAt(0), false, 789);
assert.equal(addedText.at(-1), "-slot1 49 789\n", "shifted key release mismatch");
context.state.keydown[K_SHIFT] = false;
context.state.shift_down = false;

client.cl.frame.playerstate.stats[STAT_LAYOUTS] = 1;
context.state.key_dest = keydest_t.key_game;
Key_Event(context, K_ESCAPE, true, 999);
assert.equal(addedText.at(-1), "cmd putaway\n", "layout escape mismatch");
Key_Event(context, K_ESCAPE, false, 999);
client.cl.frame.playerstate.stats[STAT_LAYOUTS] = 0;

context.state.key_dest = keydest_t.key_menu;
Key_Event(context, K_ESCAPE, true, 1000);
assert.equal(menuKeydown, K_ESCAPE, "menu escape mismatch");
Key_Event(context, K_ESCAPE, false, 1000);

context.state.key_dest = keydest_t.key_game;
Key_Event(context, K_ESCAPE, true, 1001);
assert.equal(menuOpened, true, "menu open mismatch");

Key_SetBinding(context, K_MOUSE1, "+attack");
Key_Event(context, K_MOUSE1, true, 1100);
assert.equal(context.state.key_repeats[K_MOUSE1], 1, "repeat start mismatch");
Key_ClearStates(context);
assert.equal(context.state.key_repeats[K_MOUSE1], 0, "Key_ClearStates repeat mismatch");
assert.equal(context.state.keydown[K_MOUSE1], false, "Key_ClearStates keydown mismatch");
assert.equal(addedText.at(-1), "-attack 200 0\n", "Key_ClearStates release mismatch");

assert.equal(Key_GetKey(context), K_F2, "Key_GetKey mismatch");

assert.equal(context.state.consolekeys[K_SHIFT], true, "console shift key mismatch");
assert.equal(context.state.keybindings.length, KEY_ARRAY_SIZE, "keybindings length mismatch");

console.log("quake2-keys: ok");
