/**
 * File: view.ts
 * Source: Quake II original / client/cl_pred.c and client/cl_ents.c
 * Purpose: Port the first client-side prediction error and logical view interpolation helpers.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Exposes view values as a returned object instead of mutating renderer-facing globals.
 * - Accepts prediction-related toggles as arguments while matching original branch behavior.
 *
 * Notes:
 * - This file is intended to stay conceptually close to the original C source.
 */

import {
  AngleVectors,
  CS_AIRACCEL,
  LerpAngle,
  PMF_NO_PREDICTION,
  PMF_ON_GROUND,
  Pmove,
  SHORT2ANGLE,
  createPmoveContext,
  pmtype_t,
  type cplane_t,
  type PmoveContext,
  type csurface_t,
  type pmove_t,
  type pmove_state_t,
  type trace_t,
  type usercmd_t,
  type vec3_t
} from "../../qcommon/src/index.js";
import { CMD_BACKUP, type ClientRuntime, connstate_t } from "./types.js";
import { UPDATE_MASK } from "../../qcommon/src/index.js";

/**
 * Category: New
 * Purpose: Hold the logical refdef-style values calculated from parsed client frames.
 *
 * Constraints:
 * - Must preserve Quake II view vectors and blend/fov state for later renderer adapters.
 */
export interface ClientViewValues {
  vieworg: vec3_t;
  viewangles: vec3_t;
  forward: vec3_t;
  right: vec3_t;
  up: vec3_t;
  fov_x: number;
  blend: [number, number, number, number];
}

/**
 * Category: New
 * Purpose: Describe the runtime knobs needed by the current lightweight prediction/view helpers.
 *
 * Constraints:
 * - Defaults should mirror the common Quake II enabled path.
 */
export interface ClientViewOptions {
  predictMovement?: boolean;
  timedemo?: boolean;
  paused?: boolean;
  showmiss?: boolean;
  incomingAcknowledged?: number;
  outgoingSequence?: number;
  trace?: (start: vec3_t, mins: vec3_t, maxs: vec3_t, end: vec3_t) => trace_t;
  pointcontents?: (point: vec3_t) => number;
}

/**
 * Original name: CL_CheckPredictionError
 * Source: client/cl_pred.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Compares the predicted origin with the last server-acknowledged player origin and stores a smoothed error term.
 *
 * Porting notes:
 * - Reads the acknowledged frame index from options instead of `cls.netchan`.
 */
export function CL_CheckPredictionError(runtime: ClientRuntime, options: ClientViewOptions = {}): void {
  if (!options.predictMovement || (runtime.cl.frame.playerstate.pmove.pm_flags & PMF_NO_PREDICTION) !== 0) {
    return;
  }

  const frame = (options.incomingAcknowledged ?? 0) & (runtime.cl.predicted_origins.length - 1);
  const predicted = runtime.cl.predicted_origins[frame];
  const actual = runtime.cl.frame.playerstate.pmove.origin;
  const delta: vec3_t = [
    actual[0] - predicted[0],
    actual[1] - predicted[1],
    actual[2] - predicted[2]
  ];

  const len = Math.abs(delta[0]) + Math.abs(delta[1]) + Math.abs(delta[2]);
  if (len > 640) {
    runtime.cl.prediction_error = [0, 0, 0];
    return;
  }

  runtime.cl.predicted_origins[frame] = [...actual];
  runtime.cl.prediction_error = [
    delta[0] * 0.125,
    delta[1] * 0.125,
    delta[2] * 0.125
  ];
}

/**
 * Original name: CL_AddEntities
 * Source: client/cl_ents.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Updates `cl.time` clamping and computes the current interpolation fraction.
 *
 * Porting notes:
 * - Only ports the time/lerp portion for now, leaving entity emission to later adapters.
 */
export function CL_UpdateLerpFraction(runtime: ClientRuntime, options: ClientViewOptions = {}): number {
  if (runtime.cls.state !== connstate_t.ca_active) {
    runtime.cl.lerpfrac = 1;
    return runtime.cl.lerpfrac;
  }

  if (runtime.cl.time > runtime.cl.frame.servertime) {
    runtime.cl.time = runtime.cl.frame.servertime;
    runtime.cl.lerpfrac = 1;
  } else if (runtime.cl.time < runtime.cl.frame.servertime - 100) {
    runtime.cl.time = runtime.cl.frame.servertime - 100;
    runtime.cl.lerpfrac = 0;
  } else {
    runtime.cl.lerpfrac = 1 - (runtime.cl.frame.servertime - runtime.cl.time) * 0.01;
  }

  if (options.timedemo) {
    runtime.cl.lerpfrac = 1;
  }

  return runtime.cl.lerpfrac;
}

/**
 * Original name: CL_CalcViewValues
 * Source: client/cl_ents.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Computes the interpolated logical camera origin, angles, vectors, fov and blend from current and previous frames.
 *
 * Porting notes:
 * - Returns a value object instead of mutating `cl.refdef`.
 * - Focuses on the already-portable math and prediction branches.
 */
export function CL_CalcViewValues(runtime: ClientRuntime, options: ClientViewOptions = {}): ClientViewValues {
  const ps = runtime.cl.frame.playerstate;
  let oldframe = runtime.cl.frames[(runtime.cl.frame.serverframe - 1) & UPDATE_MASK];
  if (oldframe.serverframe !== runtime.cl.frame.serverframe - 1 || !oldframe.valid) {
    oldframe = runtime.cl.frame;
  }

  let ops = oldframe.playerstate;
  if (
    Math.abs(ops.pmove.origin[0] - ps.pmove.origin[0]) > 256 * 8 ||
    Math.abs(ops.pmove.origin[1] - ps.pmove.origin[1]) > 256 * 8 ||
    Math.abs(ops.pmove.origin[2] - ps.pmove.origin[2]) > 256 * 8
  ) {
    ops = ps;
  }

  const lerp = runtime.cl.lerpfrac;
  const backlerp = 1 - lerp;
  const vieworg: vec3_t = [0, 0, 0];
  const viewangles: vec3_t = [0, 0, 0];

  if (options.predictMovement && (runtime.cl.frame.playerstate.pmove.pm_flags & PMF_NO_PREDICTION) === 0) {
    for (let index = 0; index < 3; index += 1) {
      vieworg[index] =
        runtime.cl.predicted_origin[index] +
        ops.viewoffset[index] +
        runtime.cl.lerpfrac * (ps.viewoffset[index] - ops.viewoffset[index]) -
        backlerp * runtime.cl.prediction_error[index];
    }

    const delta = runtime.cls.realtime - runtime.cl.predicted_step_time;
    if (delta < 100) {
      vieworg[2] -= runtime.cl.predicted_step * (100 - delta) * 0.01;
    }
  } else {
    for (let index = 0; index < 3; index += 1) {
      const oldValue = ops.pmove.origin[index] * 0.125 + ops.viewoffset[index];
      const newValue = ps.pmove.origin[index] * 0.125 + ps.viewoffset[index];
      vieworg[index] = oldValue + lerp * (newValue - oldValue);
    }
  }

  if (runtime.cl.frame.playerstate.pmove.pm_type < pmtype_t.PM_DEAD) {
    for (let index = 0; index < 3; index += 1) {
      viewangles[index] = runtime.cl.predicted_angles[index];
    }
  } else {
    for (let index = 0; index < 3; index += 1) {
      viewangles[index] = LerpAngle(ops.viewangles[index], ps.viewangles[index], lerp);
    }
  }

  for (let index = 0; index < 3; index += 1) {
    viewangles[index] += LerpAngle(ops.kick_angles[index], ps.kick_angles[index], lerp);
  }

  const vectors = AngleVectors(viewangles);
  return {
    vieworg,
    viewangles,
    forward: vectors.forward,
    right: vectors.right,
    up: vectors.up,
    fov_x: ops.fov + lerp * (ps.fov - ops.fov),
    blend: [...ps.blend]
  };
}

/**
 * Original name: CL_PredictMovement
 * Source: client/cl_pred.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Applies the no-prediction branch that still derives predicted angles from viewangles and delta angles.
 *
 * Porting notes:
 * - Keeps only the currently usable branch until pmove/collision are ported.
 */
export function CL_PredictMovement(runtime: ClientRuntime, options: ClientViewOptions = {}): void {
  if (runtime.cls.state !== connstate_t.ca_active) {
    return;
  }

  if (options.paused) {
    return;
  }

  if (!options.predictMovement || (runtime.cl.frame.playerstate.pmove.pm_flags & PMF_NO_PREDICTION) !== 0) {
    for (let index = 0; index < 3; index += 1) {
      runtime.cl.predicted_angles[index] =
        runtime.cl.viewangles[index] + SHORT2ANGLE(runtime.cl.frame.playerstate.pmove.delta_angles[index]);
    }
    return;
  }

  const ack = options.incomingAcknowledged ?? 0;
  const current = options.outgoingSequence ?? ack;

  if (current - ack >= CMD_BACKUP) {
    return;
  }

  const context = createPredictedPmove(runtime, options);
  let runningAck = ack;
  let frame = 0;

  while (++runningAck < current) {
    frame = runningAck & (CMD_BACKUP - 1);
    context.pm.cmd = cloneUsercmd(runtime.cl.cmds[frame]);
    Pmove(context);
    runtime.cl.predicted_origins[frame] = [...context.pm.s.origin];
  }

  const oldframe = (runningAck - 2) & (CMD_BACKUP - 1);
  const oldz = runtime.cl.predicted_origins[oldframe][2];
  const step = context.pm.s.origin[2] - oldz;
  if (step > 63 && step < 160 && (context.pm.s.pm_flags & PMF_ON_GROUND) !== 0) {
    runtime.cl.predicted_step = step * 0.125;
    runtime.cl.predicted_step_time = runtime.cls.realtime - runtime.cls.frametime * 500;
  }

  runtime.cl.predicted_origin[0] = context.pm.s.origin[0] * 0.125;
  runtime.cl.predicted_origin[1] = context.pm.s.origin[1] * 0.125;
  runtime.cl.predicted_origin[2] = context.pm.s.origin[2] * 0.125;
  runtime.cl.predicted_pmove = clonePmoveState(context.pm.s);
  runtime.cl.predicted_angles = [...context.pm.viewangles];
}

/**
 * Category: New
 * Purpose: Build the temporary `pmove_t` bundle used by the first client-side `Pmove` prediction integration.
 *
 * Constraints:
 * - Must clone mutable state away from the parsed authoritative frame before local prediction mutates it.
 */
function createPredictedPmove(runtime: ClientRuntime, options: ClientViewOptions): PmoveContext {
  const defaultTrace = options.trace ?? ((start, _mins, _maxs, end) => createPassThroughTrace(end));
  const defaultPointcontents = options.pointcontents ?? (() => 0);
  const airaccelerateText = runtime.cl.configstrings[CS_AIRACCEL];
  const airaccelerate = airaccelerateText.length > 0 ? Number.parseFloat(airaccelerateText) : 0;

  const pm: pmove_t = {
    s: clonePmoveState(runtime.cl.frame.playerstate.pmove),
    cmd: cloneUsercmd(runtime.cl.cmd),
    snapinitial: false,
    numtouch: 0,
    touchents: [],
    viewangles: [0, 0, 0],
    viewheight: 0,
    mins: [0, 0, 0],
    maxs: [0, 0, 0],
    groundentity: null,
    watertype: 0,
    waterlevel: 0,
    trace: defaultTrace,
    pointcontents: defaultPointcontents
  };

  const context = createPmoveContext(pm);
  context.pm_airaccelerate = Number.isFinite(airaccelerate) ? airaccelerate : 0;
  return context;
}

/**
 * Category: New
 * Purpose: Clone one packed `pmove_state_t` before local prediction mutates it.
 */
function clonePmoveState(state: pmove_state_t): pmove_state_t {
  return {
    pm_type: state.pm_type,
    origin: [...state.origin],
    velocity: [...state.velocity],
    pm_flags: state.pm_flags,
    pm_time: state.pm_time,
    gravity: state.gravity,
    delta_angles: [...state.delta_angles]
  };
}

/**
 * Category: New
 * Purpose: Clone one `usercmd_t` so client prediction can mutate command state without touching the runtime source buffer.
 */
function cloneUsercmd(cmd: usercmd_t): usercmd_t {
  return {
    msec: cmd.msec,
    buttons: cmd.buttons,
    angles: [...cmd.angles],
    forwardmove: cmd.forwardmove,
    sidemove: cmd.sidemove,
    upmove: cmd.upmove,
    impulse: cmd.impulse,
    lightlevel: cmd.lightlevel
  };
}

/**
 * Category: New
 * Purpose: Create a default trace result for prediction modes that do not yet provide collision callbacks.
 */
function createPassThroughTrace(end: vec3_t): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction: 1,
    endpos: [...end],
    plane: createDefaultPlane(),
    surface: createDefaultSurface(),
    contents: 0,
    ent: null
  };
}

/**
 * Category: New
 * Purpose: Create a neutral plane used by fallback trace results.
 */
function createDefaultPlane(): cplane_t {
  return {
    normal: [0, 0, 1],
    dist: 0,
    type: 0,
    signbits: 0,
    pad: [0, 0]
  };
}

/**
 * Category: New
 * Purpose: Create a neutral surface used by fallback trace results.
 */
function createDefaultSurface(): csurface_t {
  return {
    name: "",
    flags: 0,
    value: 0
  };
}
