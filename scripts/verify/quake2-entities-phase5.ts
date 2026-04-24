/**
 * File: quake2-entities-phase5.ts
 * Purpose: Verify the client-side `cl_ents.c` entity composition branches used for visible world objects.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 5 of the visible-entities plan.
 *
 * Dependencies:
 * - packages/client
 * - packages/qcommon
 */

import {
  CL_BuildPacketEntitySnapshots,
  CL_BuildRefreshFrame,
  createClientRuntime,
  type ClientRuntime
} from "../../packages/client/src/index.js";
import {
  EF_ANIM01,
  EF_ANIM23,
  EF_ANIM_ALL,
  EF_ANIM_ALLFAST,
  EF_DOUBLE,
  EF_ROTATE,
  EF_SPINNINGLIGHTS,
  RF_FRAMELERP,
  RF_SHELL_DOUBLE,
  RF_TRANSLUCENT,
  anglemod,
  createEntityState,
  type entity_state_t
} from "../../packages/qcommon/src/index.js";

main();

/**
 * Category: New
 * Purpose: Execute the phase-5 entity-composition checks over synthetic client entity states.
 */
function main(): void {
  verifyAnimatedEffects();
  verifyRotationEffects();
  verifyLinkedModels();
  verifyRenderFlags();
  verifyShellPromotionEffects();

  console.log("Verification phase 5 - cl_ents entity composition OK");
}

/**
 * Category: New
 * Purpose: Verify that Quake II animation effects remap frames exactly as expected by the client entity snapshot builder.
 */
function verifyAnimatedEffects(): void {
  const runtime = createSeededRuntime();
  runtime.cl.time = 1500;

  const anim01 = setSingleEntity(runtime, { effects: EF_ANIM01, frame: 7 });
  assertNumber(CL_BuildPacketEntitySnapshots(runtime)[0]?.frame ?? -1, 1, "EF_ANIM01 frame");

  const anim23 = setSingleEntity(runtime, { effects: EF_ANIM23, frame: 7 });
  assertNumber(CL_BuildPacketEntitySnapshots(runtime)[0]?.frame ?? -1, 3, "EF_ANIM23 frame");

  const animAll = setSingleEntity(runtime, { effects: EF_ANIM_ALL, frame: 7 });
  assertNumber(CL_BuildPacketEntitySnapshots(runtime)[0]?.frame ?? -1, 3, "EF_ANIM_ALL frame");

  const animAllFast = setSingleEntity(runtime, { effects: EF_ANIM_ALLFAST, frame: 7 });
  assertNumber(CL_BuildPacketEntitySnapshots(runtime)[0]?.frame ?? -1, 15, "EF_ANIM_ALLFAST frame");

  void anim01;
  void anim23;
  void animAll;
  void animAllFast;
}

/**
 * Category: New
 * Purpose: Verify that rotation-style effects modify angles through the same branches as the original client.
 */
function verifyRotationEffects(): void {
  const rotateRuntime = createSeededRuntime();
  rotateRuntime.cl.time = 1234;
  setSingleEntity(rotateRuntime, {
    effects: EF_ROTATE,
    angles: [11, 22, 33]
  });
  const rotateSnapshot = CL_BuildPacketEntitySnapshots(rotateRuntime)[0];
  assertNumber(rotateSnapshot?.angles[0] ?? -1, 0, "EF_ROTATE pitch");
  assertNumber(rotateSnapshot?.angles[2] ?? -1, 0, "EF_ROTATE roll");

  const spinningRuntime = createSeededRuntime();
  spinningRuntime.cl.time = 2000;
  setSingleEntity(spinningRuntime, {
    effects: EF_SPINNINGLIGHTS,
    angles: [0, 15, 0]
  });
  const spinningSnapshot = CL_BuildPacketEntitySnapshots(spinningRuntime)[0];
  assertNumber(spinningSnapshot?.angles[2] ?? -1, 180, "EF_SPINNINGLIGHTS roll");
  assertClose(spinningSnapshot?.angles[1] ?? -1, anglemod(2000 / 2) + 15, 0.0001, "EF_SPINNINGLIGHTS yaw");
}

/**
 * Category: New
 * Purpose: Verify that linked model slots are emitted as separate refresh entities when the snapshot contains `modelindex2/3/4`.
 */
function verifyLinkedModels(): void {
  const runtime = createSeededRuntime();
  setSingleEntity(runtime, {
    modelindex: 1,
    modelindex2: 130,
    modelindex3: 7,
    modelindex4: 9
  });

  const refresh = CL_BuildRefreshFrame(runtime, { predictMovement: false });
  assertNumber(refresh.entities.length, 4, "linked model refresh entity count");
  assertNumber(refresh.entities[0]?.linkedModelSlot ?? -1, 0, "primary linkedModelSlot");
  assertNumber(refresh.entities[1]?.linkedModelSlot ?? -1, 2, "modelindex2 linkedModelSlot");
  assertNumber(refresh.entities[2]?.linkedModelSlot ?? -1, 3, "modelindex3 linkedModelSlot");
  assertNumber(refresh.entities[3]?.linkedModelSlot ?? -1, 4, "modelindex4 linkedModelSlot");
  assertNumber(refresh.entities[1]?.modelindex ?? -1, 2, "translucent linked model strips high bit");
}

/**
 * Category: New
 * Purpose: Verify that refresh-facing entities preserve `RF_TRANSLUCENT` alpha handling and `RF_FRAMELERP` metadata.
 */
function verifyRenderFlags(): void {
  const runtime = createSeededRuntime();
  setSingleEntity(runtime, {
    modelindex: 1,
    renderfx: RF_TRANSLUCENT | RF_FRAMELERP
  }, {
    frame: 2,
    previousFrame: 1
  });

  const snapshot = CL_BuildPacketEntitySnapshots(runtime)[0];
  const refresh = CL_BuildRefreshFrame(runtime, { predictMovement: false });
  const renderEntity = refresh.entities[0];

  assertBoolean(((snapshot?.flags ?? 0) & RF_FRAMELERP) !== 0, true, "RF_FRAMELERP kept in snapshot flags");
  assertNumber(snapshot?.oldframe ?? -1, 1, "oldframe propagated");
  assertBoolean(Math.abs((snapshot?.backlerp ?? -1) - 1) < 0.0001, true, "backlerp propagated");
  assertBoolean(((renderEntity?.flags ?? 0) & RF_FRAMELERP) !== 0, true, "RF_FRAMELERP kept in refresh entity flags");
  assertBoolean(((renderEntity?.flags ?? 0) & RF_TRANSLUCENT) !== 0, true, "RF_TRANSLUCENT kept in refresh entity flags");
  assertBoolean(Math.abs((renderEntity?.alpha ?? -1) - 1) < 0.0001, true, "RF_TRANSLUCENT keeps default alpha in render entity");
}

/**
 * Category: New
 * Purpose: Verify that the Rogue `EF_DOUBLE` shell promotion still maps onto the original renderfx bit.
 */
function verifyShellPromotionEffects(): void {
  const runtime = createSeededRuntime();
  setSingleEntity(runtime, {
    modelindex: 1,
    effects: EF_DOUBLE
  });

  const snapshot = CL_BuildPacketEntitySnapshots(runtime)[0];
  assertBoolean(((snapshot?.effects ?? 0) & EF_DOUBLE) === 0, true, "EF_DOUBLE cleared after shell promotion");
  assertBoolean(((snapshot?.renderfx ?? 0) & RF_SHELL_DOUBLE) !== 0, true, "EF_DOUBLE promotes RF_SHELL_DOUBLE");
  assertNumber(snapshot?.flags ?? -1, 0, "color shell keeps primary entity flags clear");
}

/**
 * Category: New
 * Purpose: Create a minimal client runtime with one valid frame and enough seeded state for deterministic entity snapshot tests.
 */
function createSeededRuntime(): ClientRuntime {
  const runtime = createClientRuntime();
  runtime.cl.frame.valid = true;
  runtime.cl.frame.serverframe = 1;
  runtime.cl.frame.num_entities = 1;
  runtime.cl.frame.parse_entities = 0;
  runtime.cl.time = 0;
  runtime.cl.lerpfrac = 0;
  runtime.cl.playernum = 99;
  runtime.cl.frame.playerstate.fov = 90;
  runtime.cl.frame.playerstate.gunindex = 0;
  runtime.cl.configstrings[33] = "models/items/armor/body/tris.md2";
  runtime.cl.configstrings[34] = "models/items/armor/combat/tris.md2";
  runtime.cl.configstrings[39] = "models/items/keys/pyramid/tris.md2";
  runtime.cl.configstrings[41] = "models/items/keys/red_key/tris.md2";
  return runtime;
}

/**
 * Category: New
 * Purpose: Seed one synthetic entity into the parse ring and centity buffers so refresh-side composition can be evaluated deterministically.
 */
function setSingleEntity(
  runtime: ClientRuntime,
  stateOverrides: Partial<entity_state_t>,
  centityOverrides: {
    previousFrame?: number;
    currentFrame?: number;
    previousOrigin?: [number, number, number];
    currentOrigin?: [number, number, number];
    previousAngles?: [number, number, number];
    currentAngles?: [number, number, number];
  } = {}
): entity_state_t {
  const state = createEntityState();
  state.number = 1;
  state.modelindex = 1;
  Object.assign(state, stateOverrides);
  runtime.cl_parse_entities[0] = cloneEntityState(state);

  const centity = runtime.cl_entities[1];
  centity.serverframe = 0;
  centity.prev = cloneEntityState({
    ...state,
    frame: centityOverrides.previousFrame ?? state.frame,
    origin: centityOverrides.previousOrigin ?? [0, 0, 0],
    angles: centityOverrides.previousAngles ?? [0, 0, 0],
    old_origin: centityOverrides.previousOrigin ?? [0, 0, 0]
  });
  centity.current = cloneEntityState({
    ...state,
    frame: centityOverrides.currentFrame ?? state.frame,
    origin: centityOverrides.currentOrigin ?? state.origin,
    angles: centityOverrides.currentAngles ?? state.angles,
    old_origin: centityOverrides.previousOrigin ?? [0, 0, 0]
  });

  return state;
}

/**
 * Category: New
 * Purpose: Clone one entity state used by the synthetic phase-5 harness.
 */
function cloneEntityState(state: entity_state_t): entity_state_t {
  return {
    number: state.number,
    origin: [...state.origin],
    angles: [...state.angles],
    old_origin: [...state.old_origin],
    modelindex: state.modelindex,
    modelindex2: state.modelindex2,
    modelindex3: state.modelindex3,
    modelindex4: state.modelindex4,
    frame: state.frame,
    skinnum: state.skinnum,
    effects: state.effects,
    renderfx: state.renderfx,
    solid: state.solid,
    sound: state.sound,
    event: state.event
  };
}

/**
 * Category: New
 * Purpose: Assert one numeric equality with a readable label.
 */
function assertNumber(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: ${actual} != ${expected}`);
  }
}

/**
 * Category: New
 * Purpose: Assert one boolean equality with a readable label.
 */
function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: ${actual} != ${expected}`);
  }
}

/**
 * Category: New
 * Purpose: Assert one floating-point value within a fixed tolerance.
 */
function assertClose(actual: number, expected: number, tolerance: number, label: string): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label}: ${actual} != ${expected} (tol ${tolerance})`);
  }
}
