/**
 * File: quake2-keys.ts
 * Purpose: Verify that the TypeScript target for `client/keys.c` preserves binding commands, console editing and key dispatch behavior.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the strict `client/keys.c` port.
 *
 * Dependencies:
 * - packages/client/src/keys.ts
 * - packages/client/src/types.ts
 * - packages/qcommon/src/cmd.ts
 */

import { strict as assert } from "node:assert";

import { Cmd_ExecuteString, createCommandRuntime, STAT_LAYOUTS } from "../../packages/qcommon/src/index.js";
import {
  KEY_ARRAY_SIZE,
  K_CTRL,
  K_ENTER,
  K_ESCAPE,
  K_F2,
  K_MOUSE1,
  K_SHIFT,
  K_TAB,
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
import { createClientRuntime, connstate_t } from "../../packages/client/src/types.js";

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
