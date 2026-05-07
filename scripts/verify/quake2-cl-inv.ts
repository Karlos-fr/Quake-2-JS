/**
 * File: quake2-cl-inv.ts
 * Purpose: Verify the Quake II `client/cl_inv.c` TypeScript port.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for inventory parsing and HUD drawing.
 *
 * Dependencies:
 * - packages/client/src/cl_inv.ts
 * - packages/client/src/cl_parse.ts
 * - packages/client/src/client.ts
 * - packages/qcommon/src/messages.ts
 */

import assert from "node:assert/strict";

import { createClientRuntime, type ClientRuntime } from "../../packages/client/src/client.js";
import {
  CL_DrawInventory,
  CL_DrawInventoryRef,
  DISPLAY_ITEMS,
  Inv_DrawString,
  SetStringHighBit
} from "../../packages/client/src/cl_inv.js";
import { CL_ParseInventory, CL_ParseServerMessage } from "../../packages/client/src/cl_parse.js";
import type { refexport_t } from "../../packages/client/src/ref.js";
import {
  CS_ITEMS,
  MAX_ITEMS,
  STAT_LAYOUTS,
  STAT_SELECTED_ITEM,
  svc_ops_e
} from "../../packages/qcommon/src/index.js";
import { MSG_WriteByte, MSG_WriteShort } from "../../packages/qcommon/src/messages.js";

const inactiveClient = createClientRuntime();
assert.deepEqual(
  CL_DrawInventory(inactiveClient, { viewportWidth: 640, viewportHeight: 480, active: false }),
  [],
  "CL_DrawInventory should not draw while inactive"
);

const parsed = createClientRuntime();
parsed.net_message.cursize = 0;
parsed.net_message.readcount = 0;
MSG_WriteByte(parsed.net_message, svc_ops_e.svc_inventory);
for (let item = 0; item < MAX_ITEMS; item += 1) {
  MSG_WriteShort(parsed.net_message, item === 7 ? 32767 : item === 8 ? -2 : item + 1);
}
CL_ParseServerMessage(parsed);
assert.equal(parsed.cl.inventory[0], 1, "CL_ParseInventory first short mismatch");
assert.equal(parsed.cl.inventory[7], 32767, "CL_ParseInventory positive signed-short mismatch");
assert.equal(parsed.cl.inventory[8], -2, "CL_ParseInventory negative signed-short mismatch");
assert.equal(parsed.cl.inventory[MAX_ITEMS - 1], MAX_ITEMS, "CL_ParseInventory must read MAX_ITEMS shorts");
assert.equal(parsed.net_message.readcount, parsed.net_message.cursize + 1, "CL_ParseServerMessage should stop after EOF byte probe");

const directParsed = createClientRuntime();
directParsed.net_message.cursize = 0;
directParsed.net_message.readcount = 0;
for (let item = 0; item < MAX_ITEMS; item += 1) {
  MSG_WriteShort(directParsed.net_message, item === 42 ? 13 : 0);
}
const parsedInventory = CL_ParseInventory(directParsed);
assert.equal(parsedInventory, directParsed.cl.inventory, "CL_ParseInventory should update the inventory array in place");
assert.equal(directParsed.cl.inventory[42], 13, "CL_ParseInventory direct parse slot mismatch");
assert.equal(directParsed.net_message.readcount, MAX_ITEMS * 2, "CL_ParseInventory readcount mismatch");

const highBit = SetStringHighBit("Az 9");
assert.deepEqual(
  [...highBit].map((char) => char.charCodeAt(0)),
  ["A", "z", " ", "9"].map((char) => char.charCodeAt(0) | 128),
  "SetStringHighBit must set every high bit"
);
assert.deepEqual(
  Inv_DrawString(16, 24, "test"),
  {
    type: "text",
    x: 16,
    y: 24,
    text: "test",
    xorMask: 0,
    centerWidth: 0,
    variant: "normal",
    bounds: {
      x: 16,
      y: 24,
      width: 32,
      height: 8
    }
  },
  "Inv_DrawString command mismatch"
);

const hudClient = createInventoryHudClient();
hudClient.cls.realtime = 0.1;
const commands = CL_DrawInventory(
  hudClient,
  { viewportWidth: 640, viewportHeight: 480, active: true },
  { Item18: "E" }
);
assert.equal(DISPLAY_ITEMS, 17, "DISPLAY_ITEMS macro mismatch");
assert.ok(commands.some((command) => command.type === "picture" && command.pic === "inventory" && command.x === 192 && command.y === 128), "CL_DrawInventory inventory picture mismatch");
assert.ok(commands.some((command) => command.type === "text" && command.text === "hotkey ### item" && command.x === 216 && command.y === 144), "CL_DrawInventory header mismatch");

const itemLines = commands
  .filter((command) => command.type === "text")
  .map((command) => command.text);
assert.equal(itemLines.some((line) => line.includes("Item2")), false, "CL_DrawInventory scroll top should hide earlier items");
assert.equal(itemLines.some((line) => line.includes("Item3")), false, "CL_DrawInventory non-selected lines should be high-bit encoded");
assert.ok(itemLines.some((line) => decodeHighBit(line).includes("Item3")), "CL_DrawInventory first visible scrolled item mismatch");
assert.ok(itemLines.some((line) => decodeHighBit(line).includes("Item19")), "CL_DrawInventory last visible scrolled item mismatch");
assert.ok(itemLines.some((line) => line === "     E  19 Item18"), "CL_DrawInventory selected item binding/count mismatch");
assert.ok(commands.some((command) => command.type === "text" && command.text === String.fromCharCode(15) && command.x === 208 && command.y === 280), "CL_DrawInventory selected cursor mismatch");

const refCalls: string[] = [];
CL_DrawInventoryRef(
  hudClient,
  createRecordingRef(refCalls),
  { viewportWidth: 640, viewportHeight: 480, active: true },
  { Item18: "E" }
);
assert.ok(refCalls.includes("pic:inventory:192:128"), "CL_DrawInventoryRef picture mismatch");
assert.ok(refCalls.includes("char:15:208:280"), "CL_DrawInventoryRef cursor mismatch");
assert.ok(refCalls.some((call) => call.startsWith("char:104:216:144")), "CL_DrawInventoryRef header char mismatch");

console.log("quake2-cl-inv: ok");

function createInventoryHudClient(): ClientRuntime {
  const runtime = createClientRuntime();
  runtime.cl.frame.playerstate.stats[STAT_LAYOUTS] = 2;
  runtime.cl.frame.playerstate.stats[STAT_SELECTED_ITEM] = 18;
  for (let item = 0; item < 20; item += 1) {
    runtime.cl.inventory[item] = item + 1;
    runtime.cl.configstrings[CS_ITEMS + item] = `Item${item}`;
  }
  return runtime;
}

function decodeHighBit(text: string): string {
  let decoded = "";
  for (const char of text) {
    decoded += String.fromCharCode(char.charCodeAt(0) & 0x7f);
  }
  return decoded;
}

function createRecordingRef(calls: string[]): refexport_t {
  return {
    api_version: 3,
    Init: () => true,
    Shutdown: () => {},
    BeginRegistration: () => {},
    RegisterModel: () => null,
    RegisterSkin: () => null,
    RegisterPic: () => null,
    SetSky: () => {},
    EndRegistration: () => {},
    RenderFrame: () => {},
    DrawGetPicSize: () => ({ width: 0, height: 0 }),
    DrawPic: (x, y, name) => {
      calls.push(`pic:${name}:${x}:${y}`);
    },
    DrawStretchPic: () => {},
    DrawChar: (x, y, num) => {
      calls.push(`char:${num}:${x}:${y}`);
    },
    DrawTileClear: () => {},
    DrawFill: () => {},
    DrawFadeScreen: () => {},
    DrawStretchRaw: () => {},
    CinematicSetPalette: () => {},
    BeginFrame: () => {},
    EndFrame: () => {},
    AppActivate: () => {}
  };
}
