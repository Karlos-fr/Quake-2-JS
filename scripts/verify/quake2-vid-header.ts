/**
 * File: quake2-vid-header.ts
 * Purpose: Verify that the TypeScript target for `client/vid.h` preserves the public video-driver declarations.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - packages/client/src/vid.ts
 * - packages/client/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  VID_CheckChanges,
  VID_Init,
  VID_MenuDraw,
  VID_MenuInit,
  VID_MenuKey,
  VID_Shutdown,
  createClientVidContext,
  createVidDef
} from "../../packages/client/src/index.js";

const viddef = createVidDef();
assert.deepEqual(viddef, { width: 0, height: 0 }, "createVidDef mismatch");

const callLog: string[] = [];
const context = createClientVidContext({
  onInit: () => {
    callLog.push("init");
  },
  onShutdown: () => {
    callLog.push("shutdown");
  },
  onCheckChanges: () => {
    callLog.push("check");
  },
  onMenuInit: () => {
    callLog.push("menu-init");
  },
  onMenuDraw: () => {
    callLog.push("menu-draw");
  },
  onMenuKey: (key) => {
    callLog.push(`menu-key:${key}`);
    return key === 13 ? "misc/menu1.wav" : null;
  }
});

assert.equal(context.viddef.width, 0, "ClientVidContext viddef width mismatch");
assert.equal(context.viddef.height, 0, "ClientVidContext viddef height mismatch");

VID_Init(context);
VID_CheckChanges(context);
VID_MenuInit(context);
VID_MenuDraw(context);
assert.equal(VID_MenuKey(context, 13), "misc/menu1.wav", "VID_MenuKey mismatch");
VID_Shutdown(context);

assert.deepEqual(callLog, ["init", "check", "menu-init", "menu-draw", "menu-key:13", "shutdown"], "vid.h hook forwarding mismatch");

const noOp = createClientVidContext();
assert.equal(VID_MenuKey(noOp, 27), null, "VID_MenuKey default mismatch");

console.log("quake2-vid-header: ok");
