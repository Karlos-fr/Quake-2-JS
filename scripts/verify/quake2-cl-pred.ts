/**
 * File: quake2-cl-pred.ts
 * Purpose: Verify the direct `client/cl_pred.c` prediction and collision helpers now ported.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for `CL_CheckPredictionError`, `CL_PredictMovement`, `CL_PMTrace` and `CL_PMpointcontents`.
 *
 * Dependencies:
 * - packages/client
 * - packages/formats
 * - packages/qcommon
 */

import fs from "node:fs";
import path from "node:path";
import { parseBsp } from "../../packages/formats/src/bsp.js";
import { findPakEntry, parsePak, readPakEntryData } from "../../packages/formats/src/pak.js";
import {
  CL_CheckPredictionError,
  CL_PredictMovement,
  CL_PMTrace,
  CL_PMpointcontents,
  connstate_t,
  createClientRuntime
} from "../../packages/client/src/index.js";
import {
  CM_HeadnodeForBox,
  PMF_ON_GROUND,
  createCollisionWorld,
  createEntityState,
  type cplane_t,
  type cmodel_t
} from "../../packages/qcommon/src/index.js";
import type { csurface_t, trace_t, vec3_t } from "../../packages/qcommon/src/index.js";
import { CONTENTS_MONSTER } from "../../packages/qcommon/src/q-shared.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base1.bsp";

main();

/**
 * Category: New
 * Purpose: Run focused prediction and collision assertions against one real BSP world plus synthetic solids.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const pak = parsePak(pakBytes, pakPath);
  const bspEntry = findPakEntry(pak, MAP_PATH);
  if (!bspEntry) {
    throw new Error(`${MAP_PATH} introuvable dans ${pakPath}`);
  }

  const map = parseBsp(readPakEntryData(pak, bspEntry), MAP_PATH);
  const world = createCollisionWorld(map);
  const runtime = createClientRuntime();

  const brushHeadnode = CM_HeadnodeForBox(world, [-16, -16, -16], [16, 16, 16]);
  const brushModel: cmodel_t = {
    mins: [-16, -16, -16],
    maxs: [16, 16, 16],
    origin: [0, 0, 0],
    headnode: brushHeadnode
  };

  runtime.cl.model_clip[1] = brushModel;

  const bmodel = createEntityState();
  bmodel.number = 2;
  bmodel.modelindex = 1;
  bmodel.solid = 31;
  bmodel.origin = [64, 0, 0];
  bmodel.angles = [0, 0, 0];

  const bbox = createEntityState();
  bbox.number = 3;
  bbox.solid = (2) | (2 << 5) | (8 << 10);
  bbox.origin = [128, 0, 0];
  bbox.angles = [0, 0, 0];

  const trace = CL_PMTrace([32, 0, 0], [0, 0, 0], [0, 0, 0], [96, 0, 0], {
    world,
    entities: [bmodel],
    modelClip: runtime.cl.model_clip as Array<cmodel_t | null>,
    playernum: runtime.cl.playernum
  });

  const bmodelContents = CL_PMpointcontents([64, 0, 0], {
    world,
    entities: [bmodel],
    modelClip: runtime.cl.model_clip as Array<cmodel_t | null>,
    playernum: runtime.cl.playernum
  });

  const bboxTrace = CL_PMTrace([96, 0, 0], [0, 0, 0], [0, 0, 0], [160, 0, 0], {
    world,
    entities: [bbox],
    modelClip: runtime.cl.model_clip as Array<cmodel_t | null>,
    playernum: runtime.cl.playernum
  });

  verifyPredictionErrorSmoothing();
  verifyPredictionErrorTeleportReset();
  verifyNoPredictionBranch();
  verifyPredictedMovementLoop();
  verifyCmdBackupGuard();

  console.log(`Verification cl_pred - ${MAP_PATH}`);
  console.log(`bmodel trace fraction: ${trace.fraction.toFixed(4)}`);
  console.log(`bmodel point contents: ${bmodelContents}`);
  console.log(`bbox trace fraction: ${bboxTrace.fraction.toFixed(4)}`);

  assert(trace.fraction < 1, "bmodel should clip prediction trace");
  assert(trace.ent === bmodel, "bmodel trace should report the clipped entity");
  assert((bmodelContents & CONTENTS_MONSTER) !== 0, "bmodel point contents should include transformed box contents");
  assert(bboxTrace.fraction < 1, "encoded bbox should clip prediction trace");
  assert(bboxTrace.ent === bbox, "encoded bbox trace should report the clipped entity");

  console.log("Verification cl_pred: OK");
}

/**
 * Category: New
 * Purpose: Assert that `CL_CheckPredictionError` stores the smoothed delta and refreshes the acknowledged predicted origin.
 */
function verifyPredictionErrorSmoothing(): void {
  const runtime = createClientRuntime();
  runtime.cl.predicted_origins[3] = [80, 160, 240];
  runtime.cl.frame.playerstate.pmove.origin = [88, 176, 264];
  runtime.cl.frame.serverframe = 42;
  const messages: string[] = [];

  CL_CheckPredictionError(runtime, {
    predictMovement: true,
    incomingAcknowledged: 3,
    showmiss: true,
    onPredictionMessage: (message) => messages.push(message)
  });

  assertVector(runtime.cl.prediction_error, [1, 2, 3], "prediction error smoothing mismatch");
  assertVector(runtime.cl.predicted_origins[3], [88, 176, 264], "prediction error should refresh stored origin");
  assertEqual(messages.length, 1, "prediction miss message count mismatch");
  assertEqual(messages[0], "prediction miss on 42: 48", "prediction miss message mismatch");
}

/**
 * Category: New
 * Purpose: Assert that large deltas reset the smoothed prediction error like teleports in the original code.
 */
function verifyPredictionErrorTeleportReset(): void {
  const runtime = createClientRuntime();
  runtime.cl.prediction_error = [5, 6, 7];
  runtime.cl.predicted_origins[1] = [0, 0, 0];
  runtime.cl.frame.playerstate.pmove.origin = [512, 128, 32];

  CL_CheckPredictionError(runtime, {
    predictMovement: true,
    incomingAcknowledged: 1
  });

  assertVector(runtime.cl.prediction_error, [0, 0, 0], "large prediction errors should reset interpolation");
}

/**
 * Category: New
 * Purpose: Assert that the no-prediction branch still mirrors viewangles plus delta angles.
 */
function verifyNoPredictionBranch(): void {
  const runtime = createClientRuntime();
  runtime.cls.state = connstate_t.ca_active;
  runtime.cl.viewangles = [10, 20, 30];
  runtime.cl.frame.playerstate.pmove.delta_angles = [0, 1024, -2048];
  runtime.cl.frame.playerstate.viewoffset = [0, 0, 22];

  CL_PredictMovement(runtime, {
    predictMovement: false
  });

  assertClose(runtime.cl.predicted_angles[0], 10, "no-prediction pitch mismatch");
  assertClose(runtime.cl.predicted_angles[1], 20 + 1024 * (360 / 65536), "no-prediction yaw mismatch");
  assertClose(runtime.cl.predicted_angles[2], 30 - 2048 * (360 / 65536), "no-prediction roll mismatch");
  assertEqual(runtime.cl.predicted_viewheight, 22, "no-prediction viewheight mismatch");
}

/**
 * Category: New
 * Purpose: Assert that the predicted branch runs `Pmove`, stores the packed origin and preserves crouch viewheight.
 */
function verifyPredictedMovementLoop(): void {
  const runtime = createClientRuntime();
  runtime.cls.state = connstate_t.ca_active;
  runtime.cls.realtime = 1000;
  runtime.cls.frametime = 0.05;
  runtime.cl.frame.playerstate.pmove.pm_flags = PMF_ON_GROUND;
  runtime.cl.frame.playerstate.pmove.gravity = 800;
  runtime.cl.frame.playerstate.pmove.origin = [0, 0, 0];
  runtime.cl.frame.playerstate.pmove.velocity = [0, 0, 0];
  runtime.cl.frame.playerstate.pmove.delta_angles = [0, 0, 0];
  runtime.cl.frame.playerstate.viewoffset = [0, 0, 22];
  runtime.cl.cmd = {
    msec: 50,
    buttons: 0,
    angles: [0, 0, 0],
    forwardmove: 0,
    sidemove: 0,
    upmove: -1,
    impulse: 0,
    lightlevel: 0
  };
  runtime.cl.cmds[1] = { ...runtime.cl.cmd, angles: [0, 0, 0] };
  runtime.cl.predicted_origins[63] = [0, 0, 0];

  CL_PredictMovement(runtime, {
    predictMovement: true,
    incomingAcknowledged: 0,
    outgoingSequence: 2,
    trace: createPassThroughTrace,
    pointcontents: () => 0
  });

  assertVector(runtime.cl.predicted_origins[1], runtime.cl.predicted_pmove.origin, "predicted origin ring mismatch");
  assertVector(
    runtime.cl.predicted_origin,
    [
      runtime.cl.predicted_pmove.origin[0] * 0.125,
      runtime.cl.predicted_pmove.origin[1] * 0.125,
      runtime.cl.predicted_pmove.origin[2] * 0.125
    ],
    "predicted origin scaling mismatch"
  );
  assertEqual(runtime.cl.predicted_viewheight, -2, "predicted movement should preserve crouch viewheight");
}

/**
 * Category: New
 * Purpose: Assert that the original `CMD_BACKUP` guard freezes prediction when acknowledgements are too old.
 */
function verifyCmdBackupGuard(): void {
  const runtime = createClientRuntime();
  runtime.cls.state = connstate_t.ca_active;
  runtime.cl.predicted_origin = [11, 22, 33];
  runtime.cl.predicted_viewheight = 44;
  runtime.cl.predicted_angles = [1, 2, 3];
  runtime.cl.frame.playerstate.pmove.pm_flags = 0;
  const messages: string[] = [];

  CL_PredictMovement(runtime, {
    predictMovement: true,
    incomingAcknowledged: 0,
    outgoingSequence: 64,
    showmiss: true,
    onPredictionMessage: (message) => messages.push(message),
    trace: createPassThroughTrace,
    pointcontents: () => 0
  });

  assertVector(runtime.cl.predicted_origin, [11, 22, 33], "CMD_BACKUP guard should freeze predicted origin");
  assertEqual(runtime.cl.predicted_viewheight, 44, "CMD_BACKUP guard should freeze predicted viewheight");
  assertVector(runtime.cl.predicted_angles, [1, 2, 3], "CMD_BACKUP guard should freeze predicted angles");
  assertEqual(messages.length, 1, "CMD_BACKUP debug message count mismatch");
  assertEqual(messages[0], "exceeded CMD_BACKUP", "CMD_BACKUP debug message mismatch");
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
 * Purpose: Assert one invariant in the prediction-collision harness.
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Category: New
 * Purpose: Assert one strict numeric equality in the harness.
 */
function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: attendu ${expected}, obtenu ${actual}`);
  }
}

/**
 * Category: New
 * Purpose: Assert one approximate numeric equality in the harness.
 */
function assertClose(actual: number, expected: number, message: string): void {
  if (Math.abs(actual - expected) > 1e-6) {
    throw new Error(`${message}: attendu ${expected}, obtenu ${actual}`);
  }
}

/**
 * Category: New
 * Purpose: Assert one 3-component vector equality in the harness.
 */
function assertVector(actual: vec3_t, expected: vec3_t, message: string): void {
  for (let index = 0; index < 3; index += 1) {
    if (actual[index] !== expected[index]) {
      throw new Error(`${message}: attendu ${expected.join(",")}, obtenu ${actual.join(",")}`);
    }
  }
}
