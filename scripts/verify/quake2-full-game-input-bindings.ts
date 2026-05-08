/**
 * File: quake2-full-game-input-bindings.ts
 * Purpose: Verify the legacy local-session harness consumes Quake II key bindings instead of demo-only movement maps.
 *
 * Authoritative full-game input is covered by quake2-full-game-authoritative-input.ts.
 */

import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CL_InitInput,
  CL_InitLocal,
  K_KP_MINUS,
  K_MOUSE1,
  Key_Event,
  Key_Init,
  Key_SetBinding,
  V_Init,
  createClientInputContext,
  createClientKeyContext,
  createClientMainContext,
  createClientRuntime,
  createClientViewContext,
  keydest_t
} from "../../packages/client/src/index.js";
import {
  createVirtualFilesystem,
  mountPak
} from "../../packages/filesystem/src/index.js";
import {
  BUTTON_ATTACK,
  Cbuf_Execute,
  Cmd_Init,
  Cvar_Init,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import { mapFullGameDomKey } from "../../apps/web/src/full-game-keymap.js";
import { createFullGameLocalSession } from "../../apps/web/src/full-game-local-session.js";

const repoRoot = process.cwd();
const fullGameSource = readFileSync(join(repoRoot, "apps", "web", "src", "full-game.ts"), "utf8").replace(/\r\n/g, "\n");
const keymapSource = readFileSync(join(repoRoot, "apps", "web", "src", "full-game-keymap.ts"), "utf8").replace(/\r\n/g, "\n");
const pakPath = [
  join(repoRoot, "Quake 2", "baseq2", "pak0.pak"),
  join(repoRoot, "apps", "web", "public", "baseq2", "pak0.pak")
].find((candidate) => existsSync(candidate));

assert.ok(pakPath, "pak0.pak must be available for full-game input binding verification");
for (const expected of [
  "bind w +forward",
  "bind s +back",
  "bind a +moveleft",
  "bind d +moveright",
  "bind z +forward",
  "bind q +moveleft",
  "bind 6 \\\"use Grenade Launcher\\\"",
  "bind 8 \\\"use HyperBlaster\\\"",
  "bind g \\\"use grenades\\\"",
  "window.addEventListener(\"wheel\"",
  "mapFullGameDomKey(event)"
]) {
  assert.ok(fullGameSource.includes(expected), `full-game keyboard mapping should include ${expected}`);
}

for (const expected of [
  "case \"Shift\": return K_SHIFT",
  "case \"Control\": return K_CTRL",
  "case \"Alt\": return K_ALT",
  "case \"Insert\": return event.location === DOM_KEY_LOCATION_NUMPAD ? K_KP_INS : K_INS",
  "case \"/\": return event.location === DOM_KEY_LOCATION_NUMPAD ? K_KP_SLASH",
  "const digitMatch = /^Digit(\\d)$/.exec(event.code)",
  "return index >= 1 && index <= 12 ? K_F1 + index - 1 : null"
]) {
  assert.ok(keymapSource.includes(expected), `full-game keymap should include ${expected}`);
}

assert.ok(
  keymapSource.indexOf("const topRowDigit = mapTopRowDigitKey(event);") < keymapSource.indexOf("switch (event.key)"),
  "full-game keymap should prefer physical top-row digit codes before localized printable characters"
);

assert.equal(
  mapFullGameDomKey({ key: "-", code: "Digit6", location: 0 }),
  "6".charCodeAt(0),
  "AZERTY top-row Digit6 should activate the Quake key 6, not the printable minus key"
);
assert.equal(
  mapFullGameDomKey({ key: "_", code: "Digit8", location: 0 }),
  "8".charCodeAt(0),
  "AZERTY top-row Digit8 should activate the Quake key 8"
);
assert.equal(
  mapFullGameDomKey({ key: "-", code: "Minus", location: 0 }),
  "-".charCodeAt(0),
  "a non-digit minus key should still map to the Quake minus key"
);
assert.equal(
  mapFullGameDomKey({ key: "-", code: "NumpadSubtract", location: 3 }),
  K_KP_MINUS,
  "numpad minus should keep its keypad key number"
);

assert.ok(
  fullGameSource.includes("Key_Event(runtime.menu.keys, key, true, runtime.client.cls.realtime);\n    executeRuntimeCommandBuffer(runtime, page);\n    syncFullGameKeyDestination(runtime, page);"),
  "full-game in-game keydown path should route Escape through Key_Event before syncing the web view"
);
assert.equal(
  fullGameSource.includes("if (key === K_ESCAPE) {\n      enterMainMenu(runtime, page);\n      return;\n    }"),
  false,
  "full-game should not bypass Key_Event with a web-only Escape menu shortcut"
);
assert.ok(
  fullGameSource.includes("&& keys.state.key_dest !== keydest_t.key_menu"),
  "authoritative active sync should preserve an open Quake II menu"
);
assert.ok(
  fullGameSource.includes("function syncFullGameActiveView"),
  "full-game active view sync should keep runtime.mode aligned with key_dest"
);
assert.equal(
  fullGameSource.includes("bind q +moveleft\\n\");\n  Cbuf_AddText(cmd, \"exec config.cfg\\n\");"),
  true,
  "full-game default weapon binds must be queued before config.cfg so stored user bindings win"
);
assert.ok(
  fullGameSource.includes("runtime.finishConfigBootstrap();"),
  "full-game should finish one-time config bootstrap after the initial command buffer runs"
);
assert.ok(
  fullGameSource.includes("pendingAuthoritativeMapRequest = null;\n    gameBridge.requestedMap = null;"),
  "full-game should clear completed map requests so menu New Game can restart the same map"
);
assert.ok(
  fullGameSource.includes("const requestedMap = runtime.gameBridge.requestedMap;"),
  "full-game should snapshot requestedMap before markAuthoritativeGameActive clears it"
);

for (const expected of [
  "requestFullGamePointerLock(runtime, page)",
  "document.addEventListener(\"pointerlockchange\"",
  "window.addEventListener(\"pointerlockerror\"",
  "handleMouseMove(event, runtime, page)",
  "createClientInputDeviceContext()",
  "createClientInputDeviceMainHooks(inputDevice)",
  "inputDeviceMainHooks.onInputInit();",
  "...inputDeviceMainHooks",
  "inputDevice",
  "IN_Activate(runtime.inputDevice, true)",
  "IN_Activate(runtime.inputDevice, false)",
  "IN_Shutdown(inputDevice)",
  "runtime.mouse.lookActive = true",
  "isFullGamePointerLocked(page)",
  "isFullGameMouseLookActive(runtime, page, event)",
  "applyFullGameMouseLook(runtime, event.movementX, event.movementY)",
  "pointerLockEscapeArmed",
  "const shouldRouteEscape = runtime.mouse.pointerLockEscapeArmed",
  "routeFullGameEscapeToClient(runtime, page);",
  "key === K_ESCAPE\n    && shouldRoutePointerUnlockAsEscape(runtime)",
  "function shouldRoutePointerUnlockAsEscape(runtime: FullGameRuntime): boolean",
  "runtime.mode === \"game\"",
  "runtime.client.cls.state === connstate_t.ca_active",
  "runtime.client.cl.refresh_prepped",
  "!runtime.isAuthoritativeLevelLoading()",
  "runtime.client.cl.screen.scr_draw_loading === 0",
  "suppressNextEscapeKeyUp"
]) {
  assert.ok(fullGameSource.includes(expected), `full-game mouse look path should include ${expected}`);
}

assert.equal(
  fullGameSource.includes("wasPointerLocked || wasMouseLookActive"),
  false,
  "full-game should not treat a plain mouse-look request or pointer-lock denial as Escape"
);

const filesystem = createVirtualFilesystem();
mountPak(filesystem, new Uint8Array(readFileSync(pakPath)), "pak0.pak");

const client = createClientRuntime();
client.cls.realtime = 1000;
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
Cmd_Init(cmd);
Cvar_Init(cvar, cmd);
CL_InitLocal(createClientMainContext(client, cmd, cvar));
V_Init(createClientViewContext(client, cmd, cvar));
const inputContext = createClientInputContext(client, cmd, cvar);
CL_InitInput(inputContext);
const keys = createClientKeyContext({ client, cmd, cvar });
Key_Init(keys);
keys.state.key_dest = keydest_t.key_game;

const session = createFullGameLocalSession({
  filesystem,
  client,
  inputContext,
  cvar,
  mapRequest: "*base1$start"
});

Key_SetBinding(keys, "w".charCodeAt(0), "+forward");
Key_SetBinding(keys, K_MOUSE1, "+attack");

Key_Event(keys, "w".charCodeAt(0), true, client.cls.realtime);
Cbuf_Execute(cmd);
session.update(0.1);
assert.ok(client.cl.cmd.forwardmove > 0, "bound +forward should drive CL_CreateCmd forwardmove");

Key_Event(keys, K_MOUSE1, true, client.cls.realtime);
Cbuf_Execute(cmd);
session.update(0.1);
assert.notEqual(client.cl.cmd.buttons & BUTTON_ATTACK, 0, "bound +attack should drive CL_CreateCmd attack button");

Key_Event(keys, "w".charCodeAt(0), false, client.cls.realtime);
Key_Event(keys, K_MOUSE1, false, client.cls.realtime);
Cbuf_Execute(cmd);
session.update(0.1);
assert.equal(client.cl.cmd.forwardmove, 0, "released +forward bind should stop forwardmove");
assert.equal(client.cl.cmd.buttons & BUTTON_ATTACK, 0, "released +attack bind should clear attack button");

console.log("quake2-full-game-input-bindings: ok");
