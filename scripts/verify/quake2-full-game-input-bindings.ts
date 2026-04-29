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
import { createFullGameLocalSession } from "../../apps/web/src/full-game-local-session.js";

const repoRoot = process.cwd();
const fullGameSource = readFileSync(join(repoRoot, "apps", "web", "src", "full-game.ts"), "utf8");
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
  "window.addEventListener(\"wheel\"",
  "case \"Shift\": return K_SHIFT",
  "case \"Control\": return K_CTRL",
  "case \"Alt\": return K_ALT",
  "case \"Insert\": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_INS : K_INS",
  "case \"/\": return event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ? K_KP_SLASH",
  "return index >= 1 && index <= 12 ? K_F1 + index - 1 : null"
]) {
  assert.ok(fullGameSource.includes(expected), `full-game keyboard mapping should include ${expected}`);
}

for (const expected of [
  "requestFullGamePointerLock(runtime, page, event.target)",
  "document.addEventListener(\"pointerlockchange\"",
  "window.addEventListener(\"pointerlockerror\"",
  "handleMouseMove(event, runtime, page)",
  "runtime.mouse.lookActive = true",
  "isFullGamePointerLocked(page)",
  "isFullGameMouseLookActive(runtime, page, event)",
  "applyFullGameMouseLook(runtime, event.movementX, event.movementY)"
]) {
  assert.ok(fullGameSource.includes(expected), `full-game mouse look path should include ${expected}`);
}

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
