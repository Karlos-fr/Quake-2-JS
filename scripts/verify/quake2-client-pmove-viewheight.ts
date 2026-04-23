/**
 * File: quake2-client-pmove-viewheight.ts
 * Purpose: Verify that local client prediction preserves the exact `pmove`-computed viewheight instead of re-deriving it later.
 *
 * This file is not a direct source port.
 * It is a verification harness for the client-side integration of shared `pmove`.
 *
 * Dependencies:
 * - packages/client
 * - packages/qcommon
 */

import {
  CL_PredictMovement,
  connstate_t,
  createClientRuntime
} from "../../packages/client/src/index.js";
import {
  PMF_ON_GROUND,
  type cplane_t,
  type csurface_t,
  type trace_t,
  type vec3_t
} from "../../packages/qcommon/src/index.js";

main();

/**
 * Category: New
 * Purpose: Run the focused client-prediction viewheight regression checks.
 */
function main(): void {
  verifyPredictedViewheightTracksDuckState();
  verifyNoPredictionBranchPreservesServerViewoffset();
  console.log("Verification client pmove viewheight: OK");
}

/**
 * Category: New
 * Purpose: Assert that the predicted path keeps the exact `pm.viewheight` computed by `Pmove`.
 */
function verifyPredictedViewheightTracksDuckState(): void {
  const runtime = createClientRuntime();
  runtime.cls.state = connstate_t.ca_active;
  runtime.cl.frame.playerstate.pmove.pm_flags = PMF_ON_GROUND;
  runtime.cl.frame.playerstate.pmove.gravity = 800;
  runtime.cl.frame.playerstate.viewoffset = [0, 0, 22];
  runtime.cl.cmds[1] = {
    msec: 50,
    buttons: 0,
    angles: [0, 0, 0],
    forwardmove: 0,
    sidemove: 0,
    upmove: -1,
    impulse: 0,
    lightlevel: 0
  };
  runtime.cl.cmd = runtime.cl.cmds[1];

  CL_PredictMovement(runtime, {
    predictMovement: true,
    incomingAcknowledged: 0,
    outgoingSequence: 2,
    trace: createPassThroughTrace,
    pointcontents: () => 0
  });

  assertEqual(runtime.cl.predicted_viewheight, -2, "prediction stores crouched pmove viewheight");
}

/**
 * Category: New
 * Purpose: Assert that the no-prediction branch still mirrors the current server viewoffset.
 */
function verifyNoPredictionBranchPreservesServerViewoffset(): void {
  const runtime = createClientRuntime();
  runtime.cls.state = connstate_t.ca_active;
  runtime.cl.frame.playerstate.viewoffset = [0, 0, 22];
  runtime.cl.predicted_viewheight = 22;

  CL_PredictMovement(runtime, {
    predictMovement: false
  });

  assertEqual(runtime.cl.predicted_viewheight, 22, "no-prediction branch keeps current server viewheight");
}

/**
 * Category: New
 * Purpose: Return a miss trace suitable for lightweight `pmove` prediction tests.
 */
function createPassThroughTrace(_start: vec3_t, _mins: vec3_t, _maxs: vec3_t, end: vec3_t): trace_t {
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
 * Purpose: Create the neutral plane used by pass-through client prediction traces.
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
 * Purpose: Create the neutral surface used by pass-through client prediction traces.
 */
function createDefaultSurface(): csurface_t {
  return {
    name: "",
    flags: 0,
    value: 0
  };
}

/**
 * Category: New
 * Purpose: Assert one strict numeric equality in the harness.
 */
function assertEqual(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
}
