/**
 * File: quake2-input-header.ts
 * Purpose: Verify that the TypeScript target for `client/input.h` preserves the external input-device contract.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - packages/client/src/input-device.ts
 * - packages/client/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  IN_Activate,
  IN_Commands,
  IN_Frame,
  IN_Init,
  IN_Move,
  IN_Shutdown,
  createClientInputDeviceContext
} from "../../packages/client/src/index.js";

const callLog: string[] = [];
const activations: boolean[] = [];
const cmd = {
  msec: 0,
  buttons: 0,
  angles: [0, 0, 0] as [number, number, number],
  forwardmove: 0,
  sidemove: 0,
  upmove: 0,
  impulse: 0,
  lightlevel: 0
};

const context = createClientInputDeviceContext({
  onInit: () => {
    callLog.push("init");
  },
  onShutdown: () => {
    callLog.push("shutdown");
  },
  onCommands: () => {
    callLog.push("commands");
  },
  onFrame: () => {
    callLog.push("frame");
  },
  onMove: (incomingCmd) => {
    callLog.push("move");
    incomingCmd.forwardmove += 25;
  },
  onActivate: (active) => {
    callLog.push("activate");
    activations.push(active);
  }
});

IN_Init(context);
IN_Commands(context);
IN_Frame(context);
IN_Move(context, cmd);
IN_Activate(context, true);
IN_Activate(context, false);
IN_Shutdown(context);

assert.deepEqual(callLog, ["init", "commands", "frame", "move", "activate", "activate", "shutdown"], "call order mismatch");
assert.equal(cmd.forwardmove, 25, "IN_Move must forward the mutable usercmd_t");
assert.deepEqual(activations, [true, false], "IN_Activate mismatch");

const noOpContext = createClientInputDeviceContext();
assert.equal(IN_Init(noOpContext), undefined, "IN_Init no-op mismatch");
assert.equal(IN_Commands(noOpContext), undefined, "IN_Commands no-op mismatch");
assert.equal(IN_Frame(noOpContext), undefined, "IN_Frame no-op mismatch");
assert.equal(IN_Move(noOpContext, cmd), undefined, "IN_Move no-op mismatch");
assert.equal(IN_Activate(noOpContext, true), undefined, "IN_Activate no-op mismatch");
assert.equal(IN_Shutdown(noOpContext), undefined, "IN_Shutdown no-op mismatch");

console.log("quake2-input-header: ok");
