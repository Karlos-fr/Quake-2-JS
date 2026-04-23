/**
 * File: quake2-cl-input.ts
 * Purpose: Verify the TypeScript port blocks of `client/cl_input.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for input button tracking, command creation and `CL_SendCmd`.
 *
 * Dependencies:
 * - packages/client/src/input.ts
 * - packages/client/src/input-device.ts
 * - packages/qcommon/src/messages.ts
 * - packages/qcommon/src/net-chan.ts
 */

import { strict as assert } from "node:assert";

import { createSizeBuffer } from "../../packages/memory/src/index.js";
import {
  Cmd_ExecuteString,
  Cvar_Get,
  Cvar_Set,
  CVAR_USERINFO,
  MSG_BeginReading,
  MSG_ReadByte,
  MSG_ReadDeltaUsercmd,
  MSG_ReadLong,
  MSG_ReadShort,
  createCommandRuntime,
  createCvarRuntime,
  createQcommonNetRuntime,
  clc_ops_e
} from "../../packages/qcommon/src/index.js";
import {
  CL_CreateCmd,
  CL_InitInput,
  CL_SendCmd,
  CL_SetInputFrameTime,
  createClientInputContext,
  createClientInputDeviceContext,
  createClientRuntime,
  connstate_t
} from "../../packages/client/src/index.js";
import type { usercmd_t } from "../../packages/qcommon/src/index.js";

const sentPackets: Uint8Array[] = [];
let movedByDevice = false;
let fixedGender = false;

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const qnet = createQcommonNetRuntime({
  now: () => client.cls.realtime,
  sendPacket: (_sock, data) => {
    sentPackets.push(new Uint8Array(data));
  }
});
const inputDevice = createClientInputDeviceContext({
  onMove: (move) => {
    movedByDevice = true;
    move.sidemove += 25;
  }
});
const input = createClientInputContext(client, cmd, cvar, {
  qnet,
  inputDevice,
  hooks: {
    onFixUpGender: () => {
      fixedGender = true;
    }
  }
});

CL_InitInput(input);
client.cls.frametime = 0.05;
CL_SetInputFrameTime(input, 100);
Cmd_ExecuteString(cmd, "+forward 11 0");

const created = CL_CreateCmd(input);
assert.equal(movedByDevice, true, "CL_CreateCmd should call IN_Move");
assert.equal(created.forwardmove, 200, "CL_CreateCmd forward movement mismatch");
assert.equal(created.sidemove, 25, "CL_CreateCmd should preserve external IN_Move mutation");
assert.equal(created.msec, 50, "CL_CreateCmd msec mismatch");

client.cls.state = connstate_t.ca_active;
client.cls.realtime = 2000;
client.cls.netchan.outgoing_sequence = 3;
input.old_sys_frame_time = 100;
CL_SetInputFrameTime(input, 150);
Cvar_Get(cvar, "rate", "25000", CVAR_USERINFO);
Cvar_Set(cvar, "rate", "30000");
client.cl.frame.valid = true;
client.cl.frame.serverframe = 77;

CL_SendCmd(input, { anykeydown: true, key_game_active: true });

assert.equal(fixedGender, true, "CL_SendCmd should call CL_FixUpGender hook before userinfo write");
assert.equal(cvar.userinfo_modified, false, "CL_SendCmd should clear userinfo_modified");
assert.equal(client.cl.cmd_time[3], 2000, "CL_SendCmd should store command time by outgoing sequence");
assert.equal(client.cl.cmd.forwardmove, 200, "CL_SendCmd should copy latest command for prediction");
assert.equal(sentPackets.length, 1, "CL_SendCmd should transmit one active client packet");

const packet = createSizeBuffer(sentPackets[0]!);
packet.cursize = sentPackets[0]!.length;
MSG_BeginReading(packet);
assert.equal(MSG_ReadLong(packet), (3 | (1 << 31)) >> 0, "CL_SendCmd packet outgoing sequence mismatch");
assert.equal(MSG_ReadLong(packet), 0, "CL_SendCmd packet incoming ack mismatch");
assert.equal(MSG_ReadShort(packet), qnet.qport, "CL_SendCmd packet qport mismatch");
assert.equal(MSG_ReadByte(packet), clc_ops_e.clc_userinfo, "CL_SendCmd should prepend pending userinfo reliable message");

let userinfo = "";
for (;;) {
  const value = MSG_ReadByte(packet);
  if (value === 0) {
    break;
  }
  userinfo += String.fromCharCode(value);
}
assert.equal(userinfo, "\\rate\\30000", "CL_SendCmd userinfo payload mismatch");

assert.equal(MSG_ReadByte(packet), clc_ops_e.clc_move, "CL_SendCmd clc_move opcode mismatch");
MSG_ReadByte(packet);
assert.equal(MSG_ReadLong(packet), 77, "CL_SendCmd delta frame mismatch");

const nullcmd: usercmd_t = {
  msec: 0,
  buttons: 0,
  angles: [0, 0, 0],
  forwardmove: 0,
  sidemove: 0,
  upmove: 0,
  impulse: 0,
  lightlevel: 0
};
const first = MSG_ReadDeltaUsercmd(packet, nullcmd);
const second = MSG_ReadDeltaUsercmd(packet, first);
const third = MSG_ReadDeltaUsercmd(packet, second);
assert.equal(third.forwardmove, 200, "CL_SendCmd should delta-write latest forwardmove");
assert.equal(third.sidemove, 25, "CL_SendCmd should delta-write IN_Move sidemove");
assert.equal(third.buttons & 128, 128, "CL_SendCmd should preserve BUTTON_ANY from CL_FinishMove");

sentPackets.length = 0;
client.cls.state = connstate_t.ca_connected;
client.cls.realtime = 4000;
client.cls.netchan.last_sent = 2500;
CL_SetInputFrameTime(input, 200);
CL_SendCmd(input);
assert.equal(sentPackets.length, 1, "CL_SendCmd connected state should send keepalive after timeout");

console.log("quake2-cl-input: ok");
