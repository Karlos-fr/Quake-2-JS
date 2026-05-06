/**
 * File: quake2-pmove.ts
 * Purpose: Verify the strict `qcommon/pmove.c` timer and snap orchestration now matches the original call flow.
 *
 * This file is not a direct source port.
 * It is a verification harness for one targeted `pmove` behavior slice.
 *
 * Dependencies:
 * - packages/qcommon
 */

import {
  PMF_TIME_TELEPORT,
  PMF_TIME_WATERJUMP,
  PMF_DUCKED,
  PMF_JUMP_HELD,
  PMF_ON_GROUND,
  STEPSIZE,
  MIN_STEP_NORMAL,
  MAX_CLIP_PLANES,
  PM_CatagorizePosition,
  PM_AirMove,
  PM_CheckJump,
  PM_CheckDuck,
  PM_DeadMove,
  PM_Friction,
  PM_FlyMove,
  PM_ClipVelocity,
  PM_InitLocalState,
  PM_SnapPosition,
  PM_StepSlideMove,
  PM_StepSlideMove_,
  PM_WaterMove,
  PITCH,
  Pmove,
  createPmlState,
  createPmoveContext,
  pmtype_t,
  type cplane_t,
  type csurface_t,
  type pmove_t,
  type trace_t,
  type vec3_t,
  STOP_EPSILON
} from "../../packages/qcommon/src/index.js";
import {
  CONTENTS_LADDER,
  CONTENTS_SLIME,
  CONTENTS_SOLID,
  CONTENTS_WATER,
  SURF_SLICK
} from "../../packages/qcommon/src/q_shared.js";

main();

/**
 * Category: New
 * Purpose: Run focused `pmove` assertions around timer drop and spectator snap behavior.
 */
function main(): void {
  verifyPmoveFileScopeStateOwnershipAndDefaults();
  verifyClipVelocityStopEpsilonAndInPlaceOutput();
  verifyStepSlideMoveInternalConstantsAndAllSolidStop();
  verifyStepSlideMoveInternalFractionTouchAndPlaneSlide();
  verifyStepSlideMoveInternalTimedMoveRestoresPrimalVelocity();
  verifyTeleportTimerDecrements();
  verifyExpiredWaterjumpTimerClearsFlags();
  verifySnapFallbackUsesPackedPreviousOrigin();
  verifySpecialMovementOptionSkipsLadderAndWaterjumpChecks();
  verifyDuckBlockedStandupPreservesDuckState();
  verifyDuckCanStandWhenClear();
  verifyCategorizePositionSetsLandingTimerOnHardGroundContact();
  verifyCategorizePositionClearsGroundWhenMovingUpFast();
  verifyGroundJumpSetsHeldFlagAndMinimumVerticalSpeed();
  verifyJumpHeldPreventsRepeatJump();
  verifyWaterJumpUsesWatertypeSpecificVerticalSpeed();
  verifyStepSlideMoveStopsWhenStepUpIsSolid();
  verifyStepSlideMovePrefersStepUpWhenFlatMoveIsBlocked();
  verifyStepSlideMoveKeepsDownMoveWhenStepIsSteepOrShorter();
  verifyWaterMoveAcceleratesAndAdvancesWithNoCollision();
  verifyPmoveKeepsFullPitchVectorsForWaterMove();
  verifyAirMoveAcceleratesAndAppliesGravityOffGround();
  verifyAirMoveAcceleratesAndPreservesZeroVerticalSpeedOnGround();
  verifyFlyMoveIntegratesFreelyWithoutClip();
  verifyFlyMoveUsesTraceEndposWhenClipIsEnabled();
  verifyFrictionStopsTinyHorizontalVelocityOnly();
  verifyFrictionAppliesGroundDeceleration();
  verifyFrictionSkipsSlickGroundButAppliesWaterAndLadderRules();
  verifyDeadMoveAppliesExtraGroundFriction();
  console.log("Verification pmove: OK");
}

/**
 * Category: New
 * Purpose: Assert that the initial `pmove.c` constants, `pml_t` locals and movement tunables keep C defaults.
 */
function verifyPmoveFileScopeStateOwnershipAndDefaults(): void {
  assertEqual(STEPSIZE, 18, "STEPSIZE constant mismatch");

  const pml = createPmlState();
  assertVector(pml.origin, [0, 0, 0], "pml.origin default");
  assertVector(pml.velocity, [0, 0, 0], "pml.velocity default");
  assertVector(pml.forward, [0, 0, 0], "pml.forward default");
  assertVector(pml.right, [0, 0, 0], "pml.right default");
  assertVector(pml.up, [0, 0, 0], "pml.up default");
  assertEqual(pml.frametime, 0, "pml.frametime default");
  if (pml.groundsurface !== null) {
    throw new Error("pml.groundsurface default: attendu null");
  }
  assertVector(pml.groundplane.normal, [0, 0, 0], "pml.groundplane.normal default");
  assertEqual(pml.groundcontents, 0, "pml.groundcontents default");
  assertVector(pml.previous_origin, [0, 0, 0], "pml.previous_origin default");
  assertBoolean(pml.ladder, false, "pml.ladder default");

  const pm = createBasePmove();
  pm.s.origin = [8, -16, 24];
  pm.s.velocity = [80, -40, 16];
  const context = createPmoveContext(pm);
  if (context.pm !== pm) {
    throw new Error("context owns the current pmove_t pointer equivalent: attendu meme reference");
  }
  assertEqual(context.pm_stopspeed, 100, "pm_stopspeed default");
  assertEqual(context.pm_maxspeed, 300, "pm_maxspeed default");
  assertEqual(context.pm_duckspeed, 100, "pm_duckspeed default");
  assertEqual(context.pm_accelerate, 10, "pm_accelerate default");
  assertEqual(context.pm_airaccelerate, 0, "pm_airaccelerate default");
  assertEqual(context.pm_wateraccelerate, 10, "pm_wateraccelerate default");
  assertEqual(context.pm_friction, 6, "pm_friction default");
  assertEqual(context.pm_waterfriction, 1, "pm_waterfriction default");
  assertEqual(context.pm_waterspeed, 400, "pm_waterspeed default");

  PM_InitLocalState(context, 0.05);
  assertVector(context.pml.origin, [1, -2, 3], "PM_InitLocalState origin scale");
  assertVector(context.pml.velocity, [10, -5, 2], "PM_InitLocalState velocity scale");
  assertVector(context.pml.previous_origin, [8, -16, 24], "PM_InitLocalState previous_origin packed copy");
  assertEqual(context.pml.frametime, 0.05, "PM_InitLocalState frametime");

  context.pml.ladder = true;
  context.pml.groundcontents = CONTENTS_SOLID;
  Pmove(context, { allowSnapPosition: false });
  assertBoolean(context.pml.ladder, false, "Pmove zeroes pml.ladder before each run");
  assertEqual(context.pml.groundcontents, 0, "Pmove zeroes pml.groundcontents before each run");
}

/**
 * Category: New
 * Purpose: Assert the original `PM_ClipVelocity` backoff/change math and strict `STOP_EPSILON` zeroing.
 */
function verifyClipVelocityStopEpsilonAndInPlaceOutput(): void {
  assertEqual(STOP_EPSILON, 0.1, "STOP_EPSILON constant mismatch");

  const clipped: vec3_t = [0, 0, 0];
  PM_ClipVelocity([10, 3, -4], [0, 1, 0], clipped, 1.5);
  assertEqual(clipped[0], 10, "PM_ClipVelocity preserves orthogonal X");
  assertApprox(clipped[1], -1.5, 0.0000001, "PM_ClipVelocity applies backoff/change math");
  assertEqual(clipped[2], -4, "PM_ClipVelocity preserves orthogonal Z");

  const stopEpsilonOut: vec3_t = [0, 0, 0];
  PM_ClipVelocity([0.099, -0.1, 0.1], [0, 0, 1], stopEpsilonOut, 0);
  assertVector(stopEpsilonOut, [0, -0.1, 0.1], "PM_ClipVelocity strict STOP_EPSILON zeroing");

  const aliasVector: vec3_t = [2, 4, -5];
  PM_ClipVelocity(aliasVector, [0, 0, 1], aliasVector, 1);
  assertVector(aliasVector, [2, 4, 0], "PM_ClipVelocity supports in/out aliasing used by slide move");
}

/**
 * Category: New
 * Purpose: Assert the `PM_StepSlideMove_` constants and trapped-solid branch match the original C helper.
 */
function verifyStepSlideMoveInternalConstantsAndAllSolidStop(): void {
  assertEqual(MIN_STEP_NORMAL, 0.7, "MIN_STEP_NORMAL constant mismatch");
  assertEqual(MAX_CLIP_PLANES, 5, "MAX_CLIP_PLANES constant mismatch");

  const pm = createBasePmove();
  pm.trace = createAlwaysSolidTrace;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.1);
  context.pml.velocity = [20, 30, -400];

  PM_StepSlideMove_(context);

  assertVector(context.pml.origin, [0, 0, 0], "allsolid step-slide keeps origin trapped");
  assertVector(context.pml.velocity, [20, 30, 0], "allsolid step-slide clears only falling velocity");
}

/**
 * Category: New
 * Purpose: Assert `PM_StepSlideMove_` copies partial trace endpos, records touches, shrinks time_left and slides along the clip plane.
 */
function verifyStepSlideMoveInternalFractionTouchAndPlaneSlide(): void {
  const pm = createBasePmove();
  const touched = { kind: "slide-wall" };
  let traceCalls = 0;
  pm.trace = (start, mins, maxs, end) => {
    traceCalls += 1;
    if (traceCalls === 1) {
      return {
        allsolid: false,
        startsolid: false,
        fraction: 0.5,
        endpos: [5, 0, 0],
        plane: {
          ...createDefaultPlane(),
          normal: [0, 1, 0]
        },
        surface: createDefaultSurface(),
        contents: 0,
        ent: touched
      };
    }

    return createPassThroughTrace(start, mins, maxs, end);
  };

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.1);
  context.pml.velocity = [100, 20, 0];

  PM_StepSlideMove_(context);

  assertEqual(traceCalls, 2, "partial slide consumes remaining time in a second trace");
  assertApprox(context.pml.origin[0], 10, 0.0000001, "partial slide advances copied X endpos");
  assertApprox(context.pml.origin[1], -0.01, 0.0000001, "partial slide advances reduced time_left on clipped Y");
  assertApprox(context.pml.origin[2], 0, 0.0000001, "partial slide preserves Z origin");
  assertApprox(context.pml.velocity[0], 100, 0.0000001, "partial slide preserves tangential X velocity");
  assertApprox(context.pml.velocity[1], -0.2, 0.0000001, "partial slide clips velocity along stored plane");
  assertApprox(context.pml.velocity[2], 0, 0.0000001, "partial slide preserves neutral Z velocity");
  assertEqual(pm.numtouch, 1, "partial slide records one touch entity");
  if (pm.touchents[0] !== touched) {
    throw new Error("partial slide stores the touched entity reference");
  }
}

/**
 * Category: New
 * Purpose: Assert active `pm_time` restores `primal_velocity` after the internal slide loop.
 */
function verifyStepSlideMoveInternalTimedMoveRestoresPrimalVelocity(): void {
  const pm = createBasePmove();
  pm.s.pm_time = 3;
  pm.trace = createSinglePlaneThenPassTrace([0, 1, 0]);

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.1);
  context.pml.velocity = [100, 10, 0];

  PM_StepSlideMove_(context);

  assertVector(context.pml.velocity, [100, 10, 0], "timed step-slide restores primal_velocity");
  assertApprox(context.pml.origin[0], 10, 0.0001, "timed step-slide still advances origin before restoring velocity");
}

/**
 * Category: New
 * Purpose: Assert that active teleport timers drop by `max(1, cmd.msec >> 3)` before the teleport hold branch.
 */
function verifyTeleportTimerDecrements(): void {
  const pm = createBasePmove();
  pm.s.pm_flags = PMF_TIME_TELEPORT;
  pm.s.pm_time = 10;
  pm.cmd.msec = 8;

  const context = createPmoveContext(pm);
  Pmove(context);

  assertEqual(pm.s.pm_time, 9, "teleport timer decremented in eighth-msec quanta");
  assertEqual(pm.s.pm_flags & PMF_TIME_TELEPORT, PMF_TIME_TELEPORT, "teleport flag preserved while timer remains");
}

/**
 * Category: New
 * Purpose: Assert that an expired waterjump timer clears the held flags before movement branch selection.
 */
function verifyExpiredWaterjumpTimerClearsFlags(): void {
  const pm = createBasePmove();
  pm.s.pm_flags = PMF_TIME_WATERJUMP;
  pm.s.pm_time = 2;
  pm.cmd.msec = 16;

  const context = createPmoveContext(pm);
  Pmove(context, { allowSnapPosition: false });

  assertEqual(pm.s.pm_time, 0, "expired waterjump timer cleared");
  assertEqual(pm.s.pm_flags & PMF_TIME_WATERJUMP, 0, "expired waterjump flag removed");
}

/**
 * Category: New
 * Purpose: Assert that snap fallback restores the previous packed origin, not the float local origin.
 */
function verifySnapFallbackUsesPackedPreviousOrigin(): void {
  const pm = createBasePmove();
  pm.s.origin = [17, -9, 33];
  pm.trace = createAlwaysSolidTrace;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.016);
  context.pml.origin = [2.375, -1.125, 4.5];

  PM_SnapPosition(context);

  assertEqual(pm.s.origin[0], 17, "snap fallback restores packed previous X");
  assertEqual(pm.s.origin[1], -9, "snap fallback restores packed previous Y");
  assertEqual(pm.s.origin[2], 33, "snap fallback restores packed previous Z");
}

/**
 * Category: New
 * Purpose: Assert that `allowSpecialMovement` gates the ladder and waterjump detection block.
 */
function verifySpecialMovementOptionSkipsLadderAndWaterjumpChecks(): void {
  const enabled = createBasePmove();
  enabled.waterlevel = 2;
  enabled.cmd.msec = 16;
  enabled.trace = createLadderTrace;
  enabled.pointcontents = createWaterjumpPointContents;

  const enabledContext = createPmoveContext(enabled);
  Pmove(enabledContext, { allowSnapPosition: false });

  assertEqual(Number(enabledContext.pml.ladder), 1, "special movement enabled detects ladder");
  assertEqual(enabled.s.pm_flags & PMF_TIME_WATERJUMP, PMF_TIME_WATERJUMP, "special movement enabled triggers waterjump");

  const disabled = createBasePmove();
  disabled.waterlevel = 2;
  disabled.cmd.msec = 16;
  disabled.trace = createLadderTrace;
  disabled.pointcontents = createWaterjumpPointContents;

  const disabledContext = createPmoveContext(disabled);
  Pmove(disabledContext, { allowSnapPosition: false, allowSpecialMovement: false });

  assertEqual(Number(disabledContext.pml.ladder), 0, "special movement disabled skips ladder detection");
  assertEqual(disabled.s.pm_flags & PMF_TIME_WATERJUMP, 0, "special movement disabled skips waterjump");
}

/**
 * Category: New
 * Purpose: Assert that `PM_CheckDuck` keeps the player ducked when the stand-up trace is blocked.
 */
function verifyDuckBlockedStandupPreservesDuckState(): void {
  const pm = createBasePmove();
  pm.s.pm_flags = PMF_DUCKED | PMF_ON_GROUND;
  pm.cmd.upmove = 0;
  pm.trace = createBlockedStandupTrace;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.016);
  PM_CheckDuck(context);

  assertEqual(pm.s.pm_flags & PMF_DUCKED, PMF_DUCKED, "blocked standup keeps duck flag");
  assertEqual(pm.viewheight, -2, "blocked standup keeps ducked viewheight");
  assertEqual(pm.maxs[2], 4, "blocked standup keeps ducked hull");
}

/**
 * Category: New
 * Purpose: Assert that `PM_CheckDuck` clears the duck flag when there is room to stand.
 */
function verifyDuckCanStandWhenClear(): void {
  const pm = createBasePmove();
  pm.s.pm_flags = PMF_DUCKED | PMF_ON_GROUND;
  pm.cmd.upmove = 0;
  pm.trace = createPassThroughTrace;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.016);
  PM_CheckDuck(context);

  assertEqual(pm.s.pm_flags & PMF_DUCKED, 0, "clear standup clears duck flag");
  assertEqual(pm.viewheight, 22, "clear standup restores standing viewheight");
  assertEqual(pm.maxs[2], 32, "clear standup restores standing hull");
}

/**
 * Category: New
 * Purpose: Assert that `PM_CatagorizePosition` sets `PMF_ON_GROUND` and the landing timer after a hard downward impact.
 */
function verifyCategorizePositionSetsLandingTimerOnHardGroundContact(): void {
  const pm = createBasePmove();
  pm.trace = createGroundContactTrace;
  pm.pointcontents = () => 0;
  pm.mins = [-16, -16, -24];
  pm.maxs = [16, 16, 32];
  pm.viewheight = 22;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.016);
  context.pml.velocity[2] = -350;

  PM_CatagorizePosition(context);

  assertBoolean(pm.groundentity !== null, true, "ground contact stores ground entity");
  assertEqual(pm.s.pm_flags & PMF_ON_GROUND, PMF_ON_GROUND, "ground contact sets on-ground flag");
  assertEqual(pm.s.pm_time, 18, "medium landing speed sets short landing timer");
}

/**
 * Category: New
 * Purpose: Assert that `PM_CatagorizePosition` clears ground state when the player is moving upward too fast.
 */
function verifyCategorizePositionClearsGroundWhenMovingUpFast(): void {
  const pm = createBasePmove();
  pm.s.pm_flags = PMF_ON_GROUND;
  pm.groundentity = { kind: "ground" };
  pm.trace = createGroundContactTrace;
  pm.pointcontents = () => 0;
  pm.mins = [-16, -16, -24];
  pm.maxs = [16, 16, 32];
  pm.viewheight = 22;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.016);
  context.pml.velocity[2] = 181;

  PM_CatagorizePosition(context);

  assertEqual(pm.s.pm_flags & PMF_ON_GROUND, 0, "fast upward movement clears on-ground flag");
  assertBoolean(pm.groundentity === null, true, "fast upward movement clears ground entity");
}

/**
 * Category: New
 * Purpose: Assert that one ground jump sets `PMF_JUMP_HELD`, clears ground contact and enforces the original minimum jump speed.
 */
function verifyGroundJumpSetsHeldFlagAndMinimumVerticalSpeed(): void {
  const pm = createBasePmove();
  pm.groundentity = { kind: "ground" };
  pm.cmd.upmove = 20;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.016);
  context.pml.velocity[2] = 100;

  PM_CheckJump(context);

  assertEqual(pm.s.pm_flags & PMF_JUMP_HELD, PMF_JUMP_HELD, "ground jump sets jump-held flag");
  assertBoolean(pm.groundentity === null, true, "ground jump clears ground entity");
  assertEqual(context.pml.velocity[2], 370, "ground jump adds 270 ups to current upward speed");
}

/**
 * Category: New
 * Purpose: Assert that `PMF_JUMP_HELD` prevents repeat jumps until the button is released.
 */
function verifyJumpHeldPreventsRepeatJump(): void {
  const pm = createBasePmove();
  pm.s.pm_flags = PMF_JUMP_HELD;
  pm.groundentity = { kind: "ground" };
  pm.cmd.upmove = 20;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.016);
  context.pml.velocity[2] = 123;

  PM_CheckJump(context);

  assertBoolean(pm.groundentity !== null, true, "repeat jump leaves ground entity untouched");
  assertEqual(context.pml.velocity[2], 123, "repeat jump leaves vertical speed unchanged");
}

/**
 * Category: New
 * Purpose: Assert that swimming jump-up uses the original watertype-specific vertical speeds.
 */
function verifyWaterJumpUsesWatertypeSpecificVerticalSpeed(): void {
  const water = createBasePmove();
  water.waterlevel = 2;
  water.watertype = CONTENTS_WATER;
  water.cmd.upmove = 20;

  const waterContext = createPmoveContext(water);
  PM_InitLocalState(waterContext, 0.016);
  PM_CheckJump(waterContext);
  assertEqual(waterContext.pml.velocity[2], 100, "water jump-up uses 100 ups");

  const slime = createBasePmove();
  slime.waterlevel = 2;
  slime.watertype = CONTENTS_SLIME;
  slime.cmd.upmove = 20;

  const slimeContext = createPmoveContext(slime);
  PM_InitLocalState(slimeContext, 0.016);
  PM_CheckJump(slimeContext);
  assertEqual(slimeContext.pml.velocity[2], 80, "slime jump-up uses 80 ups");
}

/**
 * Category: New
 * Purpose: Assert that `PM_StepSlideMove` returns after the first up probe when the step space is solid.
 */
function verifyStepSlideMoveStopsWhenStepUpIsSolid(): void {
  const pm = createBasePmove();
  let traceCalls = 0;
  pm.trace = (start, mins, maxs, end) => {
    traceCalls += 1;
    if (traceCalls === 1) {
      return createPassThroughTrace(start, mins, maxs, end);
    }

    return createAlwaysSolidTrace(start, mins, maxs, end);
  };

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.1);
  context.pml.origin = [0, 0, 0];
  context.pml.velocity = [100, 0, 20];

  PM_StepSlideMove(context);

  assertEqual(traceCalls, 2, "solid step-up stops after the up probe");
  assertVector(context.pml.origin, [10, 0, 2], "solid step-up keeps the first slide result");
  assertVector(context.pml.velocity, [100, 0, 20], "solid step-up keeps the first slide velocity");
}

/**
 * Category: New
 * Purpose: Assert that `PM_StepSlideMove` prefers the stepped path when a low obstacle blocks the flat move.
 */
function verifyStepSlideMovePrefersStepUpWhenFlatMoveIsBlocked(): void {
  const pm = createBasePmove();
  pm.trace = createStepObstacleTrace;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.1);
  context.pml.origin = [0, 0, 0];
  context.pml.velocity = [100, 0, 0];

  PM_StepSlideMove(context);

  assertEqual(Math.round(context.pml.origin[0]), 10, "step slide move keeps forward progress by stepping up");
  assertEqual(Math.round(context.pml.origin[2]), 0, "step slide move lands back down after stepping");
}

/**
 * Category: New
 * Purpose: Assert that `PM_StepSlideMove` restores `down_o`/`down_v` when the stepped retry is shorter or lands on a steep plane.
 */
function verifyStepSlideMoveKeepsDownMoveWhenStepIsSteepOrShorter(): void {
  const shorterStep = createPmoveContext(createBasePmove());
  shorterStep.pm.trace = createShorterStepTrace;
  PM_InitLocalState(shorterStep, 0.1);
  shorterStep.pml.origin = [0, 0, 0];
  shorterStep.pml.velocity = [100, 0, 30];

  PM_StepSlideMove(shorterStep);

  assertVector(shorterStep.pml.origin, [10, 0, 3], "shorter step restores down_o");
  assertVector(shorterStep.pml.velocity, [100, 0, 30], "shorter step restores down_v");

  const steepStep = createPmoveContext(createBasePmove());
  steepStep.pm.trace = createSteepStepTrace;
  PM_InitLocalState(steepStep, 0.1);
  steepStep.pml.origin = [0, 0, 0];
  steepStep.pml.velocity = [100, 0, 30];

  PM_StepSlideMove(steepStep);

  assertVector(steepStep.pml.origin, [10, 0, 3], "steep step restores down_o");
  assertVector(steepStep.pml.velocity, [100, 0, 30], "steep step restores down_v");
}

/**
 * Category: New
 * Purpose: Assert that `PM_WaterMove` accelerates underwater intent and advances origin through the shared slide move path.
 */
function verifyWaterMoveAcceleratesAndAdvancesWithNoCollision(): void {
  const pm = createBasePmove();
  pm.cmd.forwardmove = 200;
  pm.waterlevel = 3;
  pm.trace = createPassThroughTrace;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.1);
  context.pml.forward = [1, 0, 0];
  context.pml.right = [0, 1, 0];
  context.pml.up = [0, 0, 1];

  PM_WaterMove(context);

  assertApprox(context.pml.velocity[0], 100, 0.0001, "water move accelerates along forward wishdir");
  assertApprox(context.pml.origin[0], 10, 0.0001, "water move advances origin through step-slide move");
  assertApprox(context.pml.velocity[2], 0, 0.0001, "water move keeps neutral vertical speed when no upmove is requested");
}

/**
 * Category: New
 * Purpose: Assert that full `Pmove` preserves the original full-pitch water vector path.
 */
function verifyPmoveKeepsFullPitchVectorsForWaterMove(): void {
  const pm = createBasePmove();
  pm.cmd.msec = 50;
  pm.cmd.angles[PITCH] = 16384;
  pm.cmd.forwardmove = 200;
  pm.mins = [-16, -16, -24];
  pm.maxs = [16, 16, 32];
  pm.trace = createPassThroughTrace;
  pm.pointcontents = () => CONTENTS_WATER;

  const context = createPmoveContext(pm);
  Pmove(context, { allowSnapPosition: false });

  assertApprox(context.pml.velocity[0], 0.8726203218641798, 0.0001, "water pmove keeps full pitch forward X");
  assertApprox(context.pml.velocity[2], -49.992384757819565, 0.0001, "water pmove keeps full pitch forward Z");
}

/**
 * Category: New
 * Purpose: Assert that `PM_AirMove` accelerates in free air, applies gravity and advances through the slide-move path.
 */
function verifyAirMoveAcceleratesAndAppliesGravityOffGround(): void {
  const pm = createBasePmove();
  pm.cmd.forwardmove = 200;
  pm.s.gravity = 800;
  pm.trace = createPassThroughTrace;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.1);
  context.pml.forward = [1, 0, 0];
  context.pml.right = [0, 1, 0];
  context.pml.up = [0, 0, 1];

  PM_AirMove(context);

  assertApprox(context.pml.velocity[0], 20, 0.0001, "air move accelerates forward in free air");
  assertApprox(context.pml.velocity[2], -80, 0.0001, "air move applies gravity off ground");
  assertApprox(context.pml.origin[0], 2, 0.0001, "air move advances origin horizontally");
  assertApprox(context.pml.origin[2], -8, 0.0001, "air move advances origin vertically after gravity");
}

/**
 * Category: New
 * Purpose: Assert that grounded `PM_AirMove` keeps vertical speed pinned to zero with positive gravity.
 */
function verifyAirMoveAcceleratesAndPreservesZeroVerticalSpeedOnGround(): void {
  const pm = createBasePmove();
  pm.cmd.forwardmove = 200;
  pm.s.gravity = 800;
  pm.groundentity = { kind: "ground" };
  pm.trace = createPassThroughTrace;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.1);
  context.pml.forward = [1, 0, 0];
  context.pml.right = [0, 1, 0];
  context.pml.up = [0, 0, 1];
  context.pml.velocity[2] = 50;

  PM_AirMove(context);

  assertApprox(context.pml.velocity[0], 200, 0.0001, "grounded air move accelerates forward");
  assertApprox(context.pml.velocity[2], 0, 0.0001, "grounded air move keeps vertical speed at zero with positive gravity");
  assertApprox(context.pml.origin[0], 20, 0.0001, "grounded air move advances origin horizontally");
  assertApprox(context.pml.origin[2], 0, 0.0001, "grounded air move does not move vertically");
}

/**
 * Category: New
 * Purpose: Assert that `PM_FlyMove` integrates position directly when clipping is disabled.
 */
function verifyFlyMoveIntegratesFreelyWithoutClip(): void {
  const pm = createBasePmove();
  pm.cmd.forwardmove = 200;
  pm.cmd.upmove = 50;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.1);
  context.pml.forward = [1, 0, 0];
  context.pml.right = [0, 1, 0];
  context.pml.up = [0, 0, 1];

  PM_FlyMove(context, false);

  assertApprox(context.pml.velocity[0], 200, 0.0001, "fly move accelerates forward without clipping");
  assertApprox(context.pml.velocity[2], 50, 0.0001, "fly move accelerates upward without clipping");
  assertApprox(context.pml.origin[0], 20, 0.0001, "fly move integrates horizontal origin without clipping");
  assertApprox(context.pml.origin[2], 5, 0.0001, "fly move integrates vertical origin without clipping");
  assertEqual(pm.viewheight, 22, "fly move keeps spectator viewheight");
}

/**
 * Category: New
 * Purpose: Assert that `PM_FlyMove` snaps origin to the trace endpos when clipping is enabled.
 */
function verifyFlyMoveUsesTraceEndposWhenClipIsEnabled(): void {
  const pm = createBasePmove();
  pm.cmd.forwardmove = 200;
  pm.trace = createFlyClipTrace;

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.1);
  context.pml.forward = [1, 0, 0];
  context.pml.right = [0, 1, 0];
  context.pml.up = [0, 0, 1];

  PM_FlyMove(context, true);

  assertApprox(context.pml.origin[0], 3, 0.0001, "fly move uses trace endpos when clipping is enabled");
  assertApprox(context.pml.origin[1], 4, 0.0001, "fly move preserves traced Y endpos when clipping is enabled");
  assertApprox(context.pml.origin[2], 5, 0.0001, "fly move preserves traced Z endpos when clipping is enabled");
}

/**
 * Category: New
 * Purpose: Assert the original `speed < 1` branch zeros only X/Y and leaves Z unchanged.
 */
function verifyFrictionStopsTinyHorizontalVelocityOnly(): void {
  const context = createPmoveContext(createBasePmove());
  PM_InitLocalState(context, 0.1);
  context.pml.velocity = [0.5, 0.25, 0.25];

  PM_Friction(context);

  assertVector(context.pml.velocity, [0, 0, 0.25], "tiny friction branch zeros only horizontal axes");
}

/**
 * Category: New
 * Purpose: Assert that `PM_Friction` applies the original ground deceleration when standing on non-slick ground.
 */
function verifyFrictionAppliesGroundDeceleration(): void {
  const pm = createBasePmove();
  pm.groundentity = { kind: "ground" };

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.1);
  context.pml.velocity = [100, 0, 0];
  context.pml.groundsurface = {
    ...createDefaultSurface(),
    flags: 0
  };

  PM_Friction(context);

  assertApprox(context.pml.velocity[0], 40, 0.0001, "ground friction decelerates horizontal speed");
  assertApprox(context.pml.velocity[1], 0, 0.0001, "ground friction preserves zero lateral Y speed");
  assertApprox(context.pml.velocity[2], 0, 0.0001, "ground friction preserves zero vertical speed");
}

/**
 * Category: New
 * Purpose: Assert water, slick-ground and ladder friction branches match the original `PM_Friction` conditions.
 */
function verifyFrictionSkipsSlickGroundButAppliesWaterAndLadderRules(): void {
  const slick = createPmoveContext(createBasePmove());
  slick.pm.groundentity = { kind: "slick-ground" };
  PM_InitLocalState(slick, 0.1);
  slick.pml.velocity = [100, 0, 0];
  slick.pml.groundsurface = {
    ...createDefaultSurface(),
    flags: SURF_SLICK
  };

  PM_Friction(slick);

  assertApprox(slick.pml.velocity[0], 100, 0.0001, "slick ground skips ground friction");

  const water = createPmoveContext(createBasePmove());
  water.pm.waterlevel = 2;
  PM_InitLocalState(water, 0.1);
  water.pml.velocity = [100, 0, 0];

  PM_Friction(water);

  assertApprox(water.pml.velocity[0], 80, 0.0001, "water friction scales by waterlevel");

  const ladder = createPmoveContext(createBasePmove());
  ladder.pm.waterlevel = 3;
  PM_InitLocalState(ladder, 0.1);
  ladder.pml.velocity = [100, 0, 0];
  ladder.pml.ladder = true;

  PM_Friction(ladder);

  assertApprox(ladder.pml.velocity[0], 40, 0.0001, "ladder uses ground friction and suppresses water friction");
}

/**
 * Category: New
 * Purpose: Assert that `PM_DeadMove` applies the extra dead-slide slowdown while grounded.
 */
function verifyDeadMoveAppliesExtraGroundFriction(): void {
  const pm = createBasePmove();
  pm.groundentity = { kind: "ground" };

  const context = createPmoveContext(pm);
  PM_InitLocalState(context, 0.1);
  context.pml.velocity = [30, 40, 0];

  PM_DeadMove(context);

  assertApprox(context.pml.velocity[0], 18, 0.0001, "dead move scales X velocity after subtracting 20 speed");
  assertApprox(context.pml.velocity[1], 24, 0.0001, "dead move scales Y velocity after subtracting 20 speed");
  assertApprox(context.pml.velocity[2], 0, 0.0001, "dead move preserves zero vertical speed");
}

/**
 * Category: New
 * Purpose: Build one neutral `pmove_t` with pass-through collision callbacks for deterministic harness assertions.
 */
function createBasePmove(): pmove_t {
  return {
    s: {
      pm_type: pmtype_t.PM_NORMAL,
      origin: [0, 0, 0],
      velocity: [0, 0, 0],
      pm_flags: 0,
      pm_time: 0,
      gravity: 800,
      delta_angles: [0, 0, 0]
    },
    cmd: {
      msec: 50,
      buttons: 0,
      angles: [0, 0, 0],
      forwardmove: 0,
      sidemove: 0,
      upmove: 0,
      impulse: 0,
      lightlevel: 0
    },
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
    trace: createPassThroughTrace,
    pointcontents: () => 0
  };
}

/**
 * Category: New
 * Purpose: Return a miss trace that leaves the queried end position untouched.
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
 * Purpose: Return an always-solid trace so `PM_GoodPosition` consistently fails during snap fallback verification.
 */
function createAlwaysSolidTrace(_start: vec3_t, _mins: vec3_t, _maxs: vec3_t, end: vec3_t): trace_t {
  return {
    allsolid: true,
    startsolid: true,
    fraction: 0,
    endpos: [...end],
    plane: createDefaultPlane(),
    surface: createDefaultSurface(),
    contents: 0,
    ent: null
  };
}

/**
 * Category: New
 * Purpose: Return an allsolid trace only for the `PM_CheckDuck` stand-up clearance probe.
 */
function createBlockedStandupTrace(start: vec3_t, mins: vec3_t, maxs: vec3_t, end: vec3_t): trace_t {
  const standingProbe =
    start[0] === end[0] &&
    start[1] === end[1] &&
    start[2] === end[2] &&
    mins[2] === -24 &&
    maxs[2] === 32;

  return standingProbe ? createAlwaysSolidTrace(start, mins, maxs, end) : createPassThroughTrace(start, mins, maxs, end);
}

/**
 * Category: New
 * Purpose: Return a solid floor contact trace for `PM_CatagorizePosition` ground checks.
 */
function createGroundContactTrace(_start: vec3_t, _mins: vec3_t, _maxs: vec3_t, end: vec3_t): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction: 0,
    endpos: [...end],
    plane: {
      ...createDefaultPlane(),
      normal: [0, 0, 1]
    },
    surface: createDefaultSurface(),
    contents: 0,
    ent: { kind: "ground" }
  };
}

/**
 * Category: New
 * Purpose: Return traces that model a knee-high blocker for flat motion but allow the stepped retry path.
 */
function createStepObstacleTrace(start: vec3_t, _mins: vec3_t, _maxs: vec3_t, end: vec3_t): trace_t {
  const horizontalMoveAtGround =
    start[2] === 0 &&
    end[2] === 0 &&
    start[0] === 0 &&
    end[0] > start[0];
  if (horizontalMoveAtGround) {
    return {
      allsolid: false,
      startsolid: false,
      fraction: 0,
      endpos: [...start],
      plane: {
        ...createDefaultPlane(),
        normal: [-1, 0, 0]
      },
      surface: createDefaultSurface(),
      contents: 0,
      ent: { kind: "step-wall" }
    };
  }

  const standStillProbe = start[0] === end[0] && start[1] === end[1] && start[2] === end[2];
  if (standStillProbe) {
    return createPassThroughTrace(start, [0, 0, 0], [0, 0, 0], end);
  }

  const raisedHorizontalMove =
    start[2] === 18 &&
    end[2] === 18 &&
    start[0] === 0 &&
    end[0] > start[0];
  if (raisedHorizontalMove) {
    return createPassThroughTrace(start, [0, 0, 0], [0, 0, 0], end);
  }

  const pushDownAfterStep =
    start[2] === 18 &&
    end[2] === 0 &&
    start[0] === 10 &&
    end[0] === 10;
  if (pushDownAfterStep) {
    return {
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [10, 0, 0],
      plane: {
        ...createDefaultPlane(),
        normal: [0, 0, 1]
      },
      surface: createDefaultSurface(),
      contents: 0,
      ent: { kind: "step-floor" }
    };
  }

  return createPassThroughTrace(start, [0, 0, 0], [0, 0, 0], end);
}

/**
 * Category: New
 * Purpose: Return traces where the flat slide travels farther than the stepped retry.
 */
function createShorterStepTrace(start: vec3_t, mins: vec3_t, maxs: vec3_t, end: vec3_t): trace_t {
  if (start[2] === 18 && end[2] === 18 && end[0] > start[0]) {
    return {
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [5, 0, 21],
      plane: createDefaultPlane(),
      surface: createDefaultSurface(),
      contents: 0,
      ent: null
    };
  }

  if (start[2] === 21 && end[2] === 3) {
    return {
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [5, 0, 3],
      plane: {
        ...createDefaultPlane(),
        normal: [0, 0, 1]
      },
      surface: createDefaultSurface(),
      contents: 0,
      ent: { kind: "short-step-floor" }
    };
  }

  return createPassThroughTrace(start, mins, maxs, end);
}

/**
 * Category: New
 * Purpose: Return traces where the step travels farther but the landing plane is too steep to accept.
 */
function createSteepStepTrace(start: vec3_t, mins: vec3_t, maxs: vec3_t, end: vec3_t): trace_t {
  if (start[2] === 18 && end[2] === 18 && end[0] > start[0]) {
    return {
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [20, 0, 21],
      plane: createDefaultPlane(),
      surface: createDefaultSurface(),
      contents: 0,
      ent: null
    };
  }

  if (start[2] === 21 && end[2] === 3) {
    return {
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [20, 0, 3],
      plane: {
        ...createDefaultPlane(),
        normal: [0, 0, 0.69]
      },
      surface: createDefaultSurface(),
      contents: 0,
      ent: { kind: "steep-step-floor" }
    };
  }

  return createPassThroughTrace(start, mins, maxs, end);
}

/**
 * Category: New
 * Purpose: Return one blocking plane followed by pass-through traces for internal slide-loop assertions.
 */
function createSinglePlaneThenPassTrace(normal: vec3_t): (start: vec3_t, mins: vec3_t, maxs: vec3_t, end: vec3_t) => trace_t {
  let calls = 0;
  return (start: vec3_t, mins: vec3_t, maxs: vec3_t, end: vec3_t): trace_t => {
    calls += 1;
    if (calls === 1) {
      return {
        allsolid: false,
        startsolid: false,
        fraction: 0,
        endpos: [...start],
        plane: {
          ...createDefaultPlane(),
          normal: [...normal]
        },
        surface: createDefaultSurface(),
        contents: 0,
        ent: { kind: "single-plane" }
      };
    }

    return createPassThroughTrace(start, mins, maxs, end);
  };
}

/**
 * Category: New
 * Purpose: Return a custom trace endpos for the clipped `PM_FlyMove` verification.
 */
function createFlyClipTrace(_start: vec3_t, _mins: vec3_t, _maxs: vec3_t, _end: vec3_t): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction: 0.25,
    endpos: [3, 4, 5],
    plane: createDefaultPlane(),
    surface: createDefaultSurface(),
    contents: 0,
    ent: { kind: "clip" }
  };
}

/**
 * Category: New
 * Purpose: Return a partial trace tagged as ladder contents for special-movement detection.
 */
function createLadderTrace(_start: vec3_t, _mins: vec3_t, _maxs: vec3_t, end: vec3_t): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction: 0.5,
    endpos: [...end],
    plane: createDefaultPlane(),
    surface: createDefaultSurface(),
    contents: CONTENTS_LADDER,
    ent: { kind: "ladder" }
  };
}

/**
 * Category: New
 * Purpose: Return synthetic contents that satisfy the original waterjump probe sequence.
 */
function createWaterjumpPointContents(point: vec3_t): number {
  if (point[0] >= 20) {
    return point[2] <= 4 ? CONTENTS_SOLID : 0;
  }

  if (point[2] <= 10) {
    return CONTENTS_WATER;
  }

  return 0;
}

/**
 * Category: New
 * Purpose: Create the neutral plane used by pass-through traces.
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
 * Purpose: Create the neutral surface used by pass-through traces.
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
 * Purpose: Assert one strict equality in the harness output.
 */
function assertEqual(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
}

/**
 * Category: New
 * Purpose: Assert one boolean equality in the harness.
 */
function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
}

/**
 * Category: New
 * Purpose: Assert one vec3 equality in the harness output.
 */
function assertVector(actual: vec3_t, expected: vec3_t, label: string): void {
  for (let index = 0; index < 3; index += 1) {
    if (actual[index] !== expected[index]) {
      throw new Error(`${label}[${index}]: attendu ${expected[index]}, obtenu ${actual[index]}`);
    }
  }
}

/**
 * Category: New
 * Purpose: Assert one numeric value within a tolerance in the harness.
 */
function assertApprox(actual: number, expected: number, epsilon: number, label: string): void {
  if (Math.abs(actual - expected) > epsilon) {
    throw new Error(`${label}: attendu ${expected} +/- ${epsilon}, obtenu ${actual}`);
  }
}
