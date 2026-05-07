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
  BUTTON_ATTACK,
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
  CL_KeyState,
  CL_SendCmd,
  CL_SetInputFrameTime,
  createClientInputContext,
  createClientInputDeviceContext,
  createClientRuntime,
  connstate_t
} from "../../packages/client/src/index.js";
import type { usercmd_t } from "../../packages/qcommon/src/index.js";

function readMoveDeltaFrame(packetBytes: Uint8Array): number {
  const packet = createSizeBuffer(packetBytes);
  packet.cursize = packetBytes.length;
  MSG_BeginReading(packet);
  MSG_ReadLong(packet);
  MSG_ReadLong(packet);
  MSG_ReadShort(packet);

  while (packet.readcount < packet.cursize) {
    const opcode = MSG_ReadByte(packet);
    if (opcode === clc_ops_e.clc_userinfo) {
      while (MSG_ReadByte(packet) !== 0) {
        // consume the userinfo string
      }
      continue;
    }

    assert.equal(opcode, clc_ops_e.clc_move, "expected clc_move opcode while reading delta frame");
    MSG_ReadByte(packet);
    return MSG_ReadLong(packet);
  }

  assert.fail("expected one clc_move payload");
}

const sentPackets: Uint8Array[] = [];
let movedByDevice = false;
let fixedGender = false;

const client = createClientRuntime();
const commandPrints: string[] = [];
const cmd = createCommandRuntime({
  onPrint: (line) => {
    commandPrints.push(line);
  }
});
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
const expectedInputCommands = [
  "centerview",
  "+moveup", "-moveup",
  "+movedown", "-movedown",
  "+left", "-left",
  "+right", "-right",
  "+forward", "-forward",
  "+back", "-back",
  "+lookup", "-lookup",
  "+lookdown", "-lookdown",
  "+strafe", "-strafe",
  "+moveleft", "-moveleft",
  "+moveright", "-moveright",
  "+speed", "-speed",
  "+attack", "-attack",
  "+use", "-use",
  "impulse",
  "+klook", "-klook"
];
assert.deepEqual(
  cmd.cmd_functions.slice(0, expectedInputCommands.length).map((entry) => entry.name),
  [...expectedInputCommands].reverse(),
  "CL_InitInput should register cl_input.c command callbacks through Cmd_AddCommand's head insertion order"
);
client.cls.frametime = 0.05;
CL_SetInputFrameTime(input, 100);
Cmd_ExecuteString(cmd, "+forward 11 0");
assert.deepEqual(input.in_forward.down, [11, 0], "KeyDown should remember the first physical key");
assert.equal(input.in_forward.state, 3, "KeyDown should set down and impulse-down bits");
assert.equal(input.in_forward.downtime, 0, "KeyDown zero timestamp should fall back to sys_frame_time - 100");
Cmd_ExecuteString(cmd, "+forward 11 0");
assert.deepEqual(input.in_forward.down, [11, 0], "KeyDown should ignore repeated key presses");
Cmd_ExecuteString(cmd, "+forward 12 50");
assert.deepEqual(input.in_forward.down, [11, 12], "KeyDown should track a second physical key");
Cmd_ExecuteString(cmd, "+forward 13 60");
assert.equal(commandPrints.includes("Three keys down for a button!\n"), true, "KeyDown should report a third physical key");
Cmd_ExecuteString(cmd, "-forward 11 70");
assert.deepEqual(input.in_forward.down, [0, 12], "KeyUp should keep the button held while another key is down");
Cmd_ExecuteString(cmd, "-forward 12 90");
assert.equal(input.in_forward.state, 6, "KeyUp should clear down and set impulse-up while preserving impulse-down until CL_KeyState");
assert.equal(input.in_forward.msec, 90, "KeyUp should accumulate held milliseconds from timestamps");
input.frame_msec = 100;
assert.equal(CL_KeyState(input, input.in_forward), 0.9, "CL_KeyState should return the held fraction for a released key");
assert.equal(input.in_forward.state, 0, "CL_KeyState should clear impulse bits");
assert.equal(input.in_forward.msec, 0, "CL_KeyState should clear accumulated msec");

Cmd_ExecuteString(cmd, "+back 21 100");
Cmd_ExecuteString(cmd, "-back");
assert.deepEqual(input.in_back.down, [0, 0], "manual KeyUp should clear both key slots");
assert.equal(input.in_back.state, 4, "manual KeyUp should set impulse-up for unsticking");

Cmd_ExecuteString(cmd, "impulse 7");
assert.equal(input.in_impulse, 7, "IN_Impulse should store the next impulse number");
Cmd_ExecuteString(cmd, "+forward 11 0");

const created = CL_CreateCmd(input);
assert.equal(movedByDevice, true, "CL_CreateCmd should call IN_Move");
assert.equal(created.forwardmove, 200, "CL_CreateCmd forward movement mismatch");
assert.equal(created.sidemove, 25, "CL_CreateCmd should preserve external IN_Move mutation");
assert.equal(created.msec, 50, "CL_CreateCmd msec mismatch");
assert.equal(created.impulse, 7, "CL_CreateCmd should include the pending impulse");
assert.equal(input.in_impulse, 0, "CL_CreateCmd should clear the pending impulse");

const angleClient = createClientRuntime();
const angleCmd = createCommandRuntime();
const angleCvar = createCvarRuntime();
const angleInput = createClientInputContext(angleClient, angleCmd, angleCvar);
CL_InitInput(angleInput);
angleClient.cls.frametime = 0.1;
CL_SetInputFrameTime(angleInput, 100);
Cmd_ExecuteString(angleCmd, "+klook 1 0");
Cmd_ExecuteString(angleCmd, "+forward 2 0");
const klookCmd = CL_CreateCmd(angleInput);
assert.equal(klookCmd.forwardmove, 0, "+klook should convert +forward into pitch adjustment instead of forwardmove");
assert.equal(angleClient.cl.viewangles[0] < 0, true, "+klook +forward should pitch up like CL_AdjustAngles");
Cmd_ExecuteString(angleCmd, "-forward 2 100");
Cmd_ExecuteString(angleCmd, "-klook 1 100");

const yawBeforeStrafe = angleClient.cl.viewangles[1];
CL_SetInputFrameTime(angleInput, 200);
Cmd_ExecuteString(angleCmd, "+strafe 3 100");
Cmd_ExecuteString(angleCmd, "+right 4 100");
const strafeCmd = CL_CreateCmd(angleInput);
assert.equal(angleClient.cl.viewangles[1], yawBeforeStrafe, "+strafe should prevent +right from changing yaw");
assert.equal(strafeCmd.sidemove > 0, true, "+strafe +right should produce positive sidemove");

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

sentPackets.length = 0;
client.cls.state = connstate_t.ca_disconnected;
client.cls.realtime = 5000;
client.cls.netchan.outgoing_sequence = 4;
CL_SetInputFrameTime(input, 250);
CL_SendCmd(input);
assert.equal(sentPackets.length, 0, "CL_SendCmd disconnected state should not transmit packets");
assert.equal(client.cl.cmd_time[4], 5000, "CL_SendCmd disconnected state should still store command timing");

sentPackets.length = 0;
client.cls.state = connstate_t.ca_connecting;
client.cls.realtime = 5100;
client.cls.netchan.outgoing_sequence = 5;
CL_SetInputFrameTime(input, 260);
CL_SendCmd(input);
assert.equal(sentPackets.length, 0, "CL_SendCmd connecting state should not transmit packets");
assert.equal(client.cl.cmd_time[5], 5100, "CL_SendCmd connecting state should still build a command");

client.cls.state = connstate_t.ca_active;
client.cls.netchan.outgoing_sequence = 6;
client.cls.realtime = 6200;
client.cl.frame.valid = true;
client.cl.frame.serverframe = 88;
input.cl_nodelta!.value = 1;
CL_SetInputFrameTime(input, 320);
sentPackets.length = 0;
CL_SendCmd(input);
assert.equal(readMoveDeltaFrame(sentPackets[0]!), -1, "CL_SendCmd should force no-delta mode when cl_nodelta is set");
input.cl_nodelta!.value = 0;

client.cls.netchan.outgoing_sequence = 7;
client.cls.realtime = 6300;
client.cl.frame.valid = false;
CL_SetInputFrameTime(input, 330);
sentPackets.length = 0;
CL_SendCmd(input);
assert.equal(readMoveDeltaFrame(sentPackets[0]!), -1, "CL_SendCmd should force no-delta mode when the frame is invalid");
client.cl.frame.valid = true;

client.cls.netchan.outgoing_sequence = 8;
client.cls.realtime = 6400;
client.cls.demowaiting = true;
CL_SetInputFrameTime(input, 340);
sentPackets.length = 0;
CL_SendCmd(input);
assert.equal(readMoveDeltaFrame(sentPackets[0]!), -1, "CL_SendCmd should force no-delta mode while waiting for demo playback");
client.cls.demowaiting = false;

client.cls.netchan.outgoing_sequence = 9;
client.cls.realtime = 8000;
client.cl.cinematic.cinematictime = 6000;
client.cl.attractloop = false;
client.net_message.cursize = 0;
client.net_message.readcount = 0;
input.in_attack.state = 3;
CL_SetInputFrameTime(input, 350);
sentPackets.length = 0;
CL_SendCmd(input);
assert.equal(client.cl.cmd.buttons & BUTTON_ATTACK, BUTTON_ATTACK, "CL_SendCmd cinematic skip path should preserve the attack button");
MSG_BeginReading(client.net_message);
assert.equal(MSG_ReadByte(client.net_message), clc_ops_e.clc_stringcmd, "CL_SendCmd cinematic skip path should queue nextserver");
assert.equal(MSG_ReadByte(client.net_message), "n".charCodeAt(0), "CL_SendCmd cinematic skip path should start the nextserver string");

console.log("quake2-cl-input: ok");
