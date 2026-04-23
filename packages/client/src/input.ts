/**
 * File: input.ts
 * Source: Quake II original / client/cl_input.c
 * Purpose: Port the Quake II client input button tracking and base usercmd construction logic.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Uses explicit context objects instead of file-static globals.
 * - Uses hooks only for `CL_FixUpGender`, which belongs to `cl_main.c` and is not part of this source file.
 *
 * Notes:
 * - This file is intended to stay conceptually close to the original C source.
 */

import {
  ANGLE2SHORT,
  BUTTON_ANY,
  BUTTON_ATTACK,
  BUTTON_USE,
  COM_BlockSequenceCRCByte,
  Cvar_Userinfo,
  Cvar_Get,
  CVAR_ARCHIVE,
  Cmd_AddCommand,
  Cmd_Argv,
  MSG_WriteByte,
  MSG_WriteDeltaUsercmd,
  MSG_WriteLong,
  MSG_WriteString,
  Netchan_Transmit,
  PITCH,
  SHORT2ANGLE,
  YAW,
  clc_ops_e,
  type CommandRuntime,
  type CvarRuntime,
  type QcommonNetRuntime,
  type cvar_t,
  type usercmd_t
} from "../../qcommon/src/index.js";
import { createSizeBuffer } from "../../memory/src/index.js";
import { IN_Move, type ClientInputDeviceContext } from "./input-device.js";
import { SCR_FinishCinematic } from "./screen.js";
import { CMD_BACKUP, connstate_t, type ClientRuntime, createKbutton, type kbutton_t } from "./types.js";

/**
 * Category: New
 * Purpose: Hold the client input button state and the cvars used by the first `cl_input.c` port.
 *
 * Constraints:
 * - Must keep button objects stable across frames.
 */
export interface ClientInputContext {
  client: ClientRuntime;
  cmd: CommandRuntime;
  cvar: CvarRuntime;
  qnet: QcommonNetRuntime | null;
  inputDevice: ClientInputDeviceContext | null;
  hooks: ClientInputHooks;
  sys_frame_time: number;
  frame_msec: number;
  old_sys_frame_time: number;
  in_klook: kbutton_t;
  in_left: kbutton_t;
  in_right: kbutton_t;
  in_forward: kbutton_t;
  in_back: kbutton_t;
  in_lookup: kbutton_t;
  in_lookdown: kbutton_t;
  in_moveleft: kbutton_t;
  in_moveright: kbutton_t;
  in_strafe: kbutton_t;
  in_speed: kbutton_t;
  in_use: kbutton_t;
  in_attack: kbutton_t;
  in_up: kbutton_t;
  in_down: kbutton_t;
  in_impulse: number;
  cl_nodelta: cvar_t | null;
  cl_upspeed: cvar_t | null;
  cl_forwardspeed: cvar_t | null;
  cl_sidespeed: cvar_t | null;
  cl_yawspeed: cvar_t | null;
  cl_pitchspeed: cvar_t | null;
  cl_run: cvar_t | null;
  cl_anglespeedkey: cvar_t | null;
  cl_lightlevel: cvar_t | null;
}

/**
 * Category: New
 * Purpose: Describe cross-file callbacks needed by the `cl_input.c` packet path.
 *
 * Constraints:
 * - Must not hide behavior owned by this source file; hooks are only for routines attached to other source files.
 */
export interface ClientInputHooks {
  onFixUpGender?: () => void;
}

/**
 * Category: New
 * Purpose: Describe the host-side frame and key-state values needed by `CL_FinishMove`.
 *
 * Constraints:
 * - Must default to a normal in-game frame with no extra key activity.
 */
export interface ClientInputFrameOptions {
  anykeydown?: boolean;
  key_game_active?: boolean;
}

/**
 * Category: New
 * Purpose: Create the client input context used by the first `cl_input.c` port.
 *
 * Constraints:
 * - Must start with zeroed button state and unresolved cvar references.
 */
export function createClientInputContext(
  client: ClientRuntime,
  cmd: CommandRuntime,
  cvar: CvarRuntime,
  options: {
    qnet?: QcommonNetRuntime | null;
    inputDevice?: ClientInputDeviceContext | null;
    hooks?: ClientInputHooks;
  } = {}
): ClientInputContext {
  return {
    client,
    cmd,
    cvar,
    qnet: options.qnet ?? null,
    inputDevice: options.inputDevice ?? null,
    hooks: options.hooks ?? {},
    sys_frame_time: 0,
    frame_msec: 1,
    old_sys_frame_time: 0,
    in_klook: createKbutton(),
    in_left: createKbutton(),
    in_right: createKbutton(),
    in_forward: createKbutton(),
    in_back: createKbutton(),
    in_lookup: createKbutton(),
    in_lookdown: createKbutton(),
    in_moveleft: createKbutton(),
    in_moveright: createKbutton(),
    in_strafe: createKbutton(),
    in_speed: createKbutton(),
    in_use: createKbutton(),
    in_attack: createKbutton(),
    in_up: createKbutton(),
    in_down: createKbutton(),
    in_impulse: 0,
    cl_nodelta: null,
    cl_upspeed: null,
    cl_forwardspeed: null,
    cl_sidespeed: null,
    cl_yawspeed: null,
    cl_pitchspeed: null,
    cl_run: null,
    cl_anglespeedkey: null,
    cl_lightlevel: null
  };
}

/**
 * Original name: KeyDown
 * Source: client/cl_input.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Tracks one press event for a continuous client input button.
 *
 * Porting notes:
 * - Reads command arguments from the explicit command runtime instead of file-static globals.
 */
export function KeyDown(context: ClientInputContext, button: kbutton_t): void {
  const keyText = Cmd_Argv(context.cmd, 1);
  const key = keyText.length > 0 ? Number.parseInt(keyText, 10) : -1;

  if (key === button.down[0] || key === button.down[1]) {
    return;
  }

  if (button.down[0] === 0) {
    button.down[0] = key;
  } else if (button.down[1] === 0) {
    button.down[1] = key;
  } else {
    return;
  }

  if ((button.state & 1) !== 0) {
    return;
  }

  const downtimeText = Cmd_Argv(context.cmd, 2);
  button.downtime = Number.parseInt(downtimeText, 10);
  if (!button.downtime) {
    button.downtime = context.sys_frame_time - 100;
  }

  button.state |= 1 + 2;
}

/**
 * Original name: KeyUp
 * Source: client/cl_input.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Tracks one release event for a continuous client input button.
 *
 * Porting notes:
 * - Reads command arguments from the explicit command runtime instead of file-static globals.
 */
export function KeyUp(context: ClientInputContext, button: kbutton_t): void {
  const keyText = Cmd_Argv(context.cmd, 1);
  if (keyText.length === 0) {
    button.down = [0, 0];
    button.state = 4;
    return;
  }

  const key = Number.parseInt(keyText, 10);
  if (button.down[0] === key) {
    button.down[0] = 0;
  } else if (button.down[1] === key) {
    button.down[1] = 0;
  } else {
    return;
  }

  if (button.down[0] !== 0 || button.down[1] !== 0) {
    return;
  }

  if ((button.state & 1) === 0) {
    return;
  }

  const uptimeText = Cmd_Argv(context.cmd, 2);
  const uptime = Number.parseInt(uptimeText, 10);
  if (uptime) {
    button.msec += uptime - button.downtime;
  } else {
    button.msec += 10;
  }

  button.state &= ~1;
  button.state |= 4;
}

/**
 * Original name: CL_KeyState
 * Source: client/cl_input.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns the fraction of the current frame that the given button was held.
 *
 * Porting notes:
 * - Preserves impulse clearing and frame-time clamping behavior.
 */
export function CL_KeyState(context: ClientInputContext, key: kbutton_t): number {
  key.state &= 1;

  let msec = key.msec;
  key.msec = 0;

  if ((key.state & 1) !== 0) {
    msec += context.sys_frame_time - key.downtime;
    key.downtime = context.sys_frame_time;
  }

  let value = msec / context.frame_msec;
  if (value < 0) {
    value = 0;
  }
  if (value > 1) {
    value = 1;
  }

  return value;
}

/**
 * Original name: CL_AdjustAngles
 * Source: client/cl_input.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Updates local view angles from the current button states.
 *
 * Porting notes:
 * - Reads the already-ported client timing state from the runtime context.
 */
export function CL_AdjustAngles(context: ClientInputContext): void {
  const anglespeedkey = context.cl_anglespeedkey?.value ?? 1;
  const yawspeed = context.cl_yawspeed?.value ?? 140;
  const pitchspeed = context.cl_pitchspeed?.value ?? 150;
  const speed = (context.in_speed.state & 1) !== 0
    ? context.client.cls.frametime * anglespeedkey
    : context.client.cls.frametime;

  if ((context.in_strafe.state & 1) === 0) {
    context.client.cl.viewangles[YAW] -= speed * yawspeed * CL_KeyState(context, context.in_right);
    context.client.cl.viewangles[YAW] += speed * yawspeed * CL_KeyState(context, context.in_left);
  }

  if ((context.in_klook.state & 1) !== 0) {
    context.client.cl.viewangles[PITCH] -= speed * pitchspeed * CL_KeyState(context, context.in_forward);
    context.client.cl.viewangles[PITCH] += speed * pitchspeed * CL_KeyState(context, context.in_back);
  }

  const up = CL_KeyState(context, context.in_lookup);
  const down = CL_KeyState(context, context.in_lookdown);
  context.client.cl.viewangles[PITCH] -= speed * pitchspeed * up;
  context.client.cl.viewangles[PITCH] += speed * pitchspeed * down;
}

/**
 * Original name: CL_BaseMove
 * Source: client/cl_input.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Builds the base keyboard-driven movement command for the current frame.
 *
 * Porting notes:
 * - Returns the mutated command for convenience while preserving original side effects.
 */
export function CL_BaseMove(context: ClientInputContext, cmd: usercmd_t): usercmd_t {
  CL_AdjustAngles(context);

  cmd.msec = 0;
  cmd.buttons = 0;
  cmd.angles = [...context.client.cl.viewangles];
  cmd.forwardmove = 0;
  cmd.sidemove = 0;
  cmd.upmove = 0;
  cmd.impulse = 0;
  cmd.lightlevel = 0;

  const sidespeed = context.cl_sidespeed?.value ?? 350;
  const upspeed = context.cl_upspeed?.value ?? 200;
  const forwardspeed = context.cl_forwardspeed?.value ?? 200;

  if ((context.in_strafe.state & 1) !== 0) {
    cmd.sidemove += sidespeed * CL_KeyState(context, context.in_right);
    cmd.sidemove -= sidespeed * CL_KeyState(context, context.in_left);
  }

  cmd.sidemove += sidespeed * CL_KeyState(context, context.in_moveright);
  cmd.sidemove -= sidespeed * CL_KeyState(context, context.in_moveleft);
  cmd.upmove += upspeed * CL_KeyState(context, context.in_up);
  cmd.upmove -= upspeed * CL_KeyState(context, context.in_down);

  if ((context.in_klook.state & 1) === 0) {
    cmd.forwardmove += forwardspeed * CL_KeyState(context, context.in_forward);
    cmd.forwardmove -= forwardspeed * CL_KeyState(context, context.in_back);
  }

  if (((context.in_speed.state & 1) !== 0) !== Boolean(Math.trunc(context.cl_run?.value ?? 0))) {
    cmd.forwardmove *= 2;
    cmd.sidemove *= 2;
    cmd.upmove *= 2;
  }

  return cmd;
}

/**
 * Original name: CL_ClampPitch
 * Source: client/cl_input.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Clamps the local pitch while accounting for the server-provided delta angles.
 *
 * Porting notes:
 * - Mutates the shared client viewangles in place, matching the original path.
 */
export function CL_ClampPitch(context: ClientInputContext): void {
  let pitch = SHORT2ANGLE(context.client.cl.frame.playerstate.pmove.delta_angles[PITCH]);
  if (pitch > 180) {
    pitch -= 360;
  }

  if (context.client.cl.viewangles[PITCH] + pitch > 89) {
    context.client.cl.viewangles[PITCH] = 89 - pitch;
  }
  if (context.client.cl.viewangles[PITCH] + pitch < -89) {
    context.client.cl.viewangles[PITCH] = -89 - pitch;
  }
}

/**
 * Original name: CL_FinishMove
 * Source: client/cl_input.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Finalizes button bits, timing, angle packing and impulse/lightlevel for one usercmd.
 *
 * Porting notes:
 * - Accepts a small host-state options bag instead of depending on broader UI globals.
 */
export function CL_FinishMove(context: ClientInputContext, cmd: usercmd_t, options: ClientInputFrameOptions = {}): void {
  if ((context.in_attack.state & 3) !== 0) {
    cmd.buttons |= BUTTON_ATTACK;
  }
  context.in_attack.state &= ~2;

  if ((context.in_use.state & 3) !== 0) {
    cmd.buttons |= BUTTON_USE;
  }
  context.in_use.state &= ~2;

  if (options.anykeydown && options.key_game_active) {
    cmd.buttons |= BUTTON_ANY;
  }

  let ms = context.client.cls.frametime * 1000;
  if (ms > 250) {
    ms = 100;
  }
  cmd.msec = ms;

  CL_ClampPitch(context);
  for (let index = 0; index < 3; index += 1) {
    cmd.angles[index] = ANGLE2SHORT(context.client.cl.viewangles[index]);
  }

  cmd.impulse = context.in_impulse;
  context.in_impulse = 0;
  cmd.lightlevel = Math.trunc(context.cl_lightlevel?.value ?? 0) & 0xff;
}

/**
 * Original name: CL_CreateCmd
 * Source: client/cl_input.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Builds one complete usercmd from the current frame input state.
 *
 * Porting notes:
 * - Calls the explicit `inputDevice` context as the replacement for the original `IN_Move` backend hook.
 */
export function CL_CreateCmd(context: ClientInputContext, options: ClientInputFrameOptions = {}): usercmd_t {
  context.frame_msec = context.sys_frame_time - context.old_sys_frame_time;
  if (context.frame_msec < 1) {
    context.frame_msec = 1;
  }
  if (context.frame_msec > 200) {
    context.frame_msec = 200;
  }

  const cmd: usercmd_t = {
    msec: 0,
    buttons: 0,
    angles: [0, 0, 0],
    forwardmove: 0,
    sidemove: 0,
    upmove: 0,
    impulse: 0,
    lightlevel: 0
  };

  CL_BaseMove(context, cmd);
  if (context.inputDevice) {
    IN_Move(context.inputDevice, cmd);
  }
  CL_FinishMove(context, cmd, options);
  context.old_sys_frame_time = context.sys_frame_time;
  return cmd;
}

function cloneUsercmd(cmd: usercmd_t): usercmd_t {
  return {
    msec: cmd.msec,
    buttons: cmd.buttons,
    angles: [cmd.angles[0], cmd.angles[1], cmd.angles[2]],
    forwardmove: cmd.forwardmove,
    sidemove: cmd.sidemove,
    upmove: cmd.upmove,
    impulse: cmd.impulse,
    lightlevel: cmd.lightlevel
  };
}

function createNullUsercmd(): usercmd_t {
  return {
    msec: 0,
    buttons: 0,
    angles: [0, 0, 0],
    forwardmove: 0,
    sidemove: 0,
    upmove: 0,
    impulse: 0,
    lightlevel: 0
  };
}

/**
 * Original name: CL_SendCmd
 * Source: client/cl_input.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Builds the current `usercmd_t`, stores it for prediction and sends the Quake II `clc_move` packet when connected.
 *
 * Porting notes:
 * - Uses `context.qnet` as the explicit replacement for qcommon net globals required by `Netchan_Transmit`.
 * - Uses `onFixUpGender` for the cross-file `CL_FixUpGender` call, while preserving the userinfo write sequence here.
 */
export function CL_SendCmd(context: ClientInputContext, options: ClientInputFrameOptions = {}): void {
  const qnet = context.qnet;
  const cls = context.client.cls;
  const cl = context.client.cl;

  let index = cls.netchan.outgoing_sequence & (CMD_BACKUP - 1);
  const created = CL_CreateCmd(context, options);
  cl.cmds[index] = cloneUsercmd(created);
  cl.cmd_time[index] = cls.realtime;
  cl.cmd = cloneUsercmd(created);

  if (cls.state === connstate_t.ca_disconnected || cls.state === connstate_t.ca_connecting) {
    return;
  }

  if (!qnet) {
    return;
  }

  if (cls.state === connstate_t.ca_connected) {
    if (cls.netchan.message.cursize !== 0 || cls.realtime - cls.netchan.last_sent > 1000) {
      Netchan_Transmit(qnet, cls.netchan, 0, new Uint8Array(0));
    }
    return;
  }

  if (context.cvar.userinfo_modified) {
    context.hooks.onFixUpGender?.();
    context.cvar.userinfo_modified = false;
    MSG_WriteByte(cls.netchan.message, clc_ops_e.clc_userinfo);
    MSG_WriteString(cls.netchan.message, Cvar_Userinfo(context.cvar));
  }

  const buf = createSizeBuffer(new Uint8Array(128));

  if (
    created.buttons !== 0 &&
    cl.cinematic.cinematictime > 0 &&
    !cl.attractloop &&
    cls.realtime - cl.cinematic.cinematictime > 1000
  ) {
    SCR_FinishCinematic(context.client);
  }

  MSG_WriteByte(buf, clc_ops_e.clc_move);

  const checksumIndex = buf.cursize;
  MSG_WriteByte(buf, 0);

  if ((context.cl_nodelta?.value ?? 0) !== 0 || !cl.frame.valid || cls.demowaiting) {
    MSG_WriteLong(buf, -1);
  } else {
    MSG_WriteLong(buf, cl.frame.serverframe);
  }

  index = (cls.netchan.outgoing_sequence - 2) & (CMD_BACKUP - 1);
  let cmd = cl.cmds[index];
  const nullcmd = createNullUsercmd();
  MSG_WriteDeltaUsercmd(buf, nullcmd, cmd);
  let oldcmd = cmd;

  index = (cls.netchan.outgoing_sequence - 1) & (CMD_BACKUP - 1);
  cmd = cl.cmds[index];
  MSG_WriteDeltaUsercmd(buf, oldcmd, cmd);
  oldcmd = cmd;

  index = cls.netchan.outgoing_sequence & (CMD_BACKUP - 1);
  cmd = cl.cmds[index];
  MSG_WriteDeltaUsercmd(buf, oldcmd, cmd);

  buf.data[checksumIndex] = COM_BlockSequenceCRCByte(
    buf.data.subarray(checksumIndex + 1),
    buf.cursize - checksumIndex - 1,
    cls.netchan.outgoing_sequence
  );

  Netchan_Transmit(qnet, cls.netchan, buf.cursize, buf.data);
}

/**
 * Original name: IN_CenterView
 * Source: client/cl_input.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Recenters local pitch using the current server delta angle.
 *
 * Porting notes:
 * - Mutates the shared client viewangles in place.
 */
export function IN_CenterView(context: ClientInputContext): void {
  context.client.cl.viewangles[PITCH] = -SHORT2ANGLE(context.client.cl.frame.playerstate.pmove.delta_angles[PITCH]);
}

/**
 * Original name: CL_InitInput
 * Source: client/cl_input.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Registers the first input-related commands and cvars needed to build usercmds.
 *
 * Porting notes:
 * - Registers the command callbacks directly against the existing command runtime.
 */
export function CL_InitInput(context: ClientInputContext): void {
  Cmd_AddCommand(context.cmd, "centerview", () => {
    IN_CenterView(context);
  });

  bindButtonCommands(context, "+moveup", "-moveup", context.in_up);
  bindButtonCommands(context, "+movedown", "-movedown", context.in_down);
  bindButtonCommands(context, "+left", "-left", context.in_left);
  bindButtonCommands(context, "+right", "-right", context.in_right);
  bindButtonCommands(context, "+forward", "-forward", context.in_forward);
  bindButtonCommands(context, "+back", "-back", context.in_back);
  bindButtonCommands(context, "+lookup", "-lookup", context.in_lookup);
  bindButtonCommands(context, "+lookdown", "-lookdown", context.in_lookdown);
  bindButtonCommands(context, "+strafe", "-strafe", context.in_strafe);
  bindButtonCommands(context, "+moveleft", "-moveleft", context.in_moveleft);
  bindButtonCommands(context, "+moveright", "-moveright", context.in_moveright);
  bindButtonCommands(context, "+speed", "-speed", context.in_speed);
  bindButtonCommands(context, "+attack", "-attack", context.in_attack);
  bindButtonCommands(context, "+use", "-use", context.in_use);
  bindButtonCommands(context, "+klook", "-klook", context.in_klook);

  Cmd_AddCommand(context.cmd, "impulse", () => {
    context.in_impulse = Number.parseInt(Cmd_Argv(context.cmd, 1), 10) || 0;
  });

  context.cl_nodelta = Cvar_Get(context.cvar, "cl_nodelta", "0", 0);
  context.cl_upspeed = Cvar_Get(context.cvar, "cl_upspeed", "200", 0);
  context.cl_forwardspeed = Cvar_Get(context.cvar, "cl_forwardspeed", "200", 0);
  context.cl_sidespeed = Cvar_Get(context.cvar, "cl_sidespeed", "350", 0);
  context.cl_yawspeed = Cvar_Get(context.cvar, "cl_yawspeed", "140", 0);
  context.cl_pitchspeed = Cvar_Get(context.cvar, "cl_pitchspeed", "150", 0);
  context.cl_run = Cvar_Get(context.cvar, "cl_run", "0", CVAR_ARCHIVE);
  context.cl_anglespeedkey = Cvar_Get(context.cvar, "cl_anglespeedkey", "1.5", 0);
  context.cl_lightlevel = Cvar_Get(context.cvar, "cl_lightlevel", "0", 0);
}

/**
 * Category: New
 * Purpose: Update the current frame time used by the input command builder.
 *
 * Constraints:
 * - Must preserve millisecond-style monotonic input timing.
 */
export function CL_SetInputFrameTime(context: ClientInputContext, sys_frame_time: number): void {
  context.sys_frame_time = sys_frame_time;
}

/**
 * Category: New
 * Purpose: Register paired `+command` / `-command` handlers for one tracked key button.
 *
 * Constraints:
 * - Must preserve direct forwarding to the shared `KeyDown` / `KeyUp` ports.
 */
function bindButtonCommands(context: ClientInputContext, downName: string, upName: string, button: kbutton_t): void {
  Cmd_AddCommand(context.cmd, downName, () => {
    KeyDown(context, button);
  });
  Cmd_AddCommand(context.cmd, upName, () => {
    KeyUp(context, button);
  });
}
