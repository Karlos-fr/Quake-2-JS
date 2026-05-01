/**
 * File: quake2-g-phys.ts
 * Purpose: Verify the critical gameplay physics helpers ported from `game/g_phys.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/g_phys.ts
 * - packages/game/src/runtime.ts
 */

import { MASK_MONSTERSOLID, MASK_SOLID, MASK_WATER, multicast_t, temp_event_t, type trace_t } from "../../packages/qcommon/src/index.js";
import {
  G_RunFrame,
  ClipVelocity,
  G_RunEntity,
  SV_AddRotationalFriction,
  SV_AddGravity,
  SV_FlyMove,
  SV_CheckVelocity,
  SV_Impact,
  SV_Push,
  SV_PushEntity,
  SV_Physics_None,
  SV_Physics_Noclip,
  SV_Physics_Toss,
  SV_RunThink,
  SV_TestEntityPosition
} from "../../packages/game/src/g_phys.js";
import {
  MOVETYPE_FLY,
  MOVETYPE_BOUNCE,
  MOVETYPE_FLYMISSILE,
  MOVETYPE_NOCLIP,
  MOVETYPE_NONE,
  MOVETYPE_PUSH,
  MOVETYPE_STEP,
  MOVETYPE_TOSS,
  FL_TEAMSLAVE,
  SOLID_BBOX,
  SOLID_BSP,
  SOLID_NOT,
  SOLID_TRIGGER,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  drainGameSoundEvents,
  drainGameTempEntityEvents,
  emitGameSound,
  emitGameTempEntity,
  linkGameEntity,
  refreshEntitySpatialState,
  spawnGameEntity
} from "../../packages/game/src/runtime.js";
import { FL_FLY, FL_SWIM } from "../../packages/game/src/g_local.js";

function assertEqual<T>(label: string, actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assertVec(label: string, actual: number[], expected: number[]): void {
  for (let index = 0; index < expected.length; index += 1) {
    if (actual[index] !== expected[index]) {
      throw new Error(`${label}[${index}]: expected ${expected[index]}, got ${actual[index]}`);
    }
  }
}

function assertThrows(label: string, callback: () => void, expected: string): void {
  try {
    callback();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) {
      throw new Error(`${label}: expected error containing ${expected}, got ${message}`);
    }
    return;
  }
  throw new Error(`${label}: expected throw`);
}

const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
const worldspawn = runtime.entities[0];
worldspawn.inuse = true;
worldspawn.solid = SOLID_BSP;
worldspawn.linked = true;
let forcedStartSolid = false;
let lastTraceStart: [number, number, number] | null = null;
let lastTraceEnd: [number, number, number] | null = null;
let lastTraceMask = 0;

runtime.collision = {
  world: {} as never,
  trace(start, mins, maxs, end, passent, contentmask) {
    lastTraceStart = [...start];
    lastTraceEnd = [...end];
    lastTraceMask = contentmask;
    const traceEnt = runtime.entities[0];
    const fraction = end[2] < 0 ? 0.5 : 1;
    const endpos: [number, number, number] = fraction === 1
      ? [...end]
      : [start[0] + (end[0] - start[0]) * fraction, start[1] + (end[1] - start[1]) * fraction, 0];

    return {
      allsolid: false,
      startsolid: forcedStartSolid,
      fraction,
      endpos,
      plane: {
        normal: fraction === 1 ? [0, 0, 0] : [0, 0, 1],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: contentmask,
      ent: traceEnt
    };
  },
  pointcontents(point) {
    return point[2] < 0 ? MASK_SOLID : 0;
  }
};

const clipOut: [number, number, number] = [0, 0, 0];
const clipBlocked = ClipVelocity([10, 0, -5], [0, 0, 1], clipOut, 1);
assertEqual("ClipVelocity.blocked", clipBlocked, 1);
assertVec("ClipVelocity.out", clipOut, [10, 0, 0]);

const clipStepOut: [number, number, number] = [0, 0, 0];
const clipStepBlocked = ClipVelocity([3, -7, 2], [0, 1, 0], clipStepOut, 1);
assertEqual("ClipVelocity.step-blocked", clipStepBlocked, 2);
assertVec("ClipVelocity.step-out", clipStepOut, [3, 0, 2]);

const clipOverbounceOut: [number, number, number] = [0, 0, 0];
const clipOverbounceBlocked = ClipVelocity([10, 0, 0], [1, 0, 0], clipOverbounceOut, 1.5);
assertEqual("ClipVelocity.overbounce-blocked", clipOverbounceBlocked, 2);
assertVec("ClipVelocity.overbounce-out", clipOverbounceOut, [-5, 0, 0]);

const clipStopEpsilonOut: [number, number, number] = [0, 0, 0];
ClipVelocity([0.05, -0.099, 0.11], [0, 0, 1], clipStopEpsilonOut, 0);
assertVec("ClipVelocity.stop-epsilon", clipStopEpsilonOut, [0, 0, 0.11]);

const clipAliasVector: [number, number, number] = [2, 4, -1];
ClipVelocity(clipAliasVector, [0, 0, 1], clipAliasVector, 1);
assertVec("ClipVelocity.alias-in-out", clipAliasVector, [2, 4, 0]);

const positionEnt = spawnGameEntity(runtime);
positionEnt.origin = [7, 8, 9];
positionEnt.s.origin = [7, 8, 9];
positionEnt.clipmask = 1234;
forcedStartSolid = true;
assertEqual("SV_TestEntityPosition.blocked", SV_TestEntityPosition(positionEnt, runtime), worldspawn);
assertVec("SV_TestEntityPosition.trace.start", lastTraceStart ?? [], [7, 8, 9]);
assertVec("SV_TestEntityPosition.trace.end", lastTraceEnd ?? [], [7, 8, 9]);
assertEqual("SV_TestEntityPosition.trace.mask", lastTraceMask, 1234);
forcedStartSolid = false;
assertEqual("SV_TestEntityPosition.clear", SV_TestEntityPosition(positionEnt, runtime), null);

const velocityEnt = spawnGameEntity(runtime);
velocityEnt.velocity = [2500, -2500, 100];
SV_CheckVelocity(velocityEnt);
assertVec("SV_CheckVelocity", velocityEnt.velocity, [2000, -2000, 100]);

const flyClampEnt = spawnGameEntity(runtime);
flyClampEnt.classname = "fly-clamp";
flyClampEnt.movetype = MOVETYPE_FLY;
flyClampEnt.solid = SOLID_BBOX;
flyClampEnt.clipmask = MASK_SOLID;
flyClampEnt.mins = [-16, -16, -16];
flyClampEnt.maxs = [16, 16, 16];
flyClampEnt.origin = [0, 0, 8];
flyClampEnt.s.origin = [0, 0, 8];
flyClampEnt.velocity = [25000, -25000, 100];
runtime.maxvelocity = 1200;
linkGameEntity(runtime, flyClampEnt);
G_RunEntity(flyClampEnt, runtime);
assertVec("G_RunEntity.fly-clamp.velocity", flyClampEnt.velocity, [1200, -1200, 100]);
assertVec("G_RunEntity.fly-clamp.origin", flyClampEnt.origin, [120, -120, 18]);
assertVec("G_RunEntity.fly-clamp.s.origin", flyClampEnt.s.origin, [120, -120, 18]);
runtime.maxvelocity = 2000;

const gravityDirectEnt = spawnGameEntity(runtime);
gravityDirectEnt.velocity = [0, 0, 25];
gravityDirectEnt.gravity = 0.5;
SV_AddGravity(gravityDirectEnt, 600);
assertVec("SV_AddGravity.direct-runtime-gravity", gravityDirectEnt.velocity, [0, 0, -5]);

const gravityTossEnt = spawnGameEntity(runtime);
gravityTossEnt.classname = "gravity-toss";
gravityTossEnt.movetype = MOVETYPE_TOSS;
gravityTossEnt.solid = SOLID_BBOX;
gravityTossEnt.clipmask = MASK_SOLID;
gravityTossEnt.origin = [0, 0, 100];
gravityTossEnt.s.origin = [0, 0, 100];
gravityTossEnt.velocity = [0, 0, 0];
gravityTossEnt.gravity = 0.25;
runtime.gravity = 1200;
linkGameEntity(runtime, gravityTossEnt);
G_RunEntity(gravityTossEnt, runtime);
assertVec("SV_AddGravity.runtime-velocity", gravityTossEnt.velocity, [0, 0, -30]);
assertVec("SV_AddGravity.runtime-origin", gravityTossEnt.origin, [0, 0, 97]);
runtime.gravity = 800;

const thinkEnt = spawnGameEntity(runtime);
thinkEnt.classname = "thinker";
thinkEnt.nextthink = runtime.time + 0.0005;
let thinkCount = 0;
thinkEnt.think = () => {
  thinkCount += 1;
};
assertEqual("SV_RunThink.return", SV_RunThink(thinkEnt, runtime), false);
assertEqual("SV_RunThink.count", thinkCount, 1);
assertEqual("SV_RunThink.nextthink", thinkEnt.nextthink, 0);

const noThinkEnt = spawnGameEntity(runtime);
noThinkEnt.classname = "no-think";
noThinkEnt.nextthink = 0;
let noThinkCount = 0;
noThinkEnt.think = () => {
  noThinkCount += 1;
};
assertEqual("SV_RunThink.no-think.return", SV_RunThink(noThinkEnt, runtime), true);
assertEqual("SV_RunThink.no-think.count", noThinkCount, 0);

const futureThinkEnt = spawnGameEntity(runtime);
futureThinkEnt.classname = "future-think";
futureThinkEnt.nextthink = runtime.time + 0.002;
let futureThinkCount = 0;
futureThinkEnt.think = () => {
  futureThinkCount += 1;
};
assertEqual("SV_RunThink.future.return", SV_RunThink(futureThinkEnt, runtime), true);
assertEqual("SV_RunThink.future.count", futureThinkCount, 0);
assertEqual("SV_RunThink.future.nextthink", futureThinkEnt.nextthink, runtime.time + 0.002);

const nullThinkEnt = spawnGameEntity(runtime);
nullThinkEnt.classname = "null-think";
nullThinkEnt.nextthink = runtime.time + 0.0005;
assertThrows("SV_RunThink.null-think", () => {
  SV_RunThink(nullThinkEnt, runtime);
}, "NULL ent.think");

const impactMover = spawnGameEntity(runtime);
const impactTarget = spawnGameEntity(runtime);
impactMover.classname = "impact-mover";
impactTarget.classname = "impact-target";
impactMover.solid = SOLID_BBOX;
impactTarget.solid = SOLID_BBOX;
let impactMoverTouches = 0;
let impactTargetTouches = 0;
let impactMoverOther = "";
let impactTargetOther = "";
let impactMoverPlaneZ: number | null = null;
let impactTargetPlaneIsNull = false;
let impactMoverSurfaceName = "";
let impactTargetSurfaceIsNull = false;
impactMover.touch = (self, other, touchRuntime, plane, surface) => {
  impactMoverTouches += 1;
  impactMoverOther = other.classname ?? "";
  impactMoverPlaneZ = plane?.normal[2] ?? null;
  impactMoverSurfaceName = surface?.rname ?? "";
  self.s.event = 77;
  emitGameSound(touchRuntime, self, "misc/talk1.wav");
};
impactTarget.touch = (self, other, touchRuntime, plane, surface) => {
  impactTargetTouches += 1;
  impactTargetOther = other.classname ?? "";
  impactTargetPlaneIsNull = plane === null;
  impactTargetSurfaceIsNull = surface === null;
  emitGameTempEntity(touchRuntime, temp_event_t.TE_EXPLOSION1, self.s.origin, multicast_t.MULTICAST_PVS);
};
const impactTrace: trace_t = {
  allsolid: false,
  startsolid: false,
  fraction: 0.5,
  endpos: [4, 0, 0],
  plane: {
    normal: [0, 0, 1],
    dist: 0,
    type: 0,
    signbits: 0,
    pad: [0, 0]
  },
  surface: {
    c: {
      name: "impact-surface",
      flags: 0,
      value: 0
    },
    rname: "impact-surface"
  },
  contents: MASK_SOLID,
  ent: impactTarget
};
SV_Impact(impactMover, impactTrace, runtime);
assertEqual("SV_Impact.e1.touch", impactMoverTouches, 1);
assertEqual("SV_Impact.e1.other", impactMoverOther, "impact-target");
assertEqual("SV_Impact.e1.plane", impactMoverPlaneZ, 1);
assertEqual("SV_Impact.e1.surface", impactMoverSurfaceName, "impact-surface");
assertEqual("SV_Impact.e1.visible-event", impactMover.s.event, 77);
assertEqual("SV_Impact.e2.touch", impactTargetTouches, 1);
assertEqual("SV_Impact.e2.other", impactTargetOther, "impact-mover");
assertEqual("SV_Impact.e2.plane-null", impactTargetPlaneIsNull, true);
assertEqual("SV_Impact.e2.surface-null", impactTargetSurfaceIsNull, true);
assertEqual("SV_Impact.sound", drainGameSoundEvents(runtime).some((event) => event.soundPath === "misc/talk1.wav"), true);
assertEqual("SV_Impact.temp-entity", drainGameTempEntityEvents(runtime).some((event) => event.type === temp_event_t.TE_EXPLOSION1), true);

impactMover.solid = SOLID_NOT;
SV_Impact(impactMover, impactTrace, runtime);
assertEqual("SV_Impact.skip-e1-solid-not", impactMoverTouches, 1);
assertEqual("SV_Impact.keep-e2-when-e1-solid-not", impactTargetTouches, 2);
drainGameTempEntityEvents(runtime);

impactMover.solid = SOLID_BBOX;
impactTarget.solid = SOLID_NOT;
SV_Impact(impactMover, impactTrace, runtime);
assertEqual("SV_Impact.keep-e1-when-e2-solid-not", impactMoverTouches, 2);
assertEqual("SV_Impact.skip-e2-solid-not", impactTargetTouches, 2);
drainGameSoundEvents(runtime);

impactTarget.solid = SOLID_BBOX;
impactMoverTouches = 0;
impactTargetTouches = 0;
impactMover.origin = [0, 0, 0];
impactMover.s.origin = [0, 0, 0];
impactMover.velocity = [80, 0, 0];
impactMover.movetype = MOVETYPE_FLY;
impactMover.clipmask = MASK_SOLID;
linkGameEntity(runtime, impactMover);
const defaultCollision = runtime.collision;
runtime.collision = {
  world: {} as never,
  trace(start, mins, maxs, end, passent, contentmask) {
    return {
      allsolid: false,
      startsolid: false,
      fraction: 0.5,
      endpos: [4, 0, 0],
      plane: {
        normal: [-1, 0, 0],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: contentmask,
      ent: impactTarget
    };
  },
  pointcontents(point) {
    return point[2] < 0 ? MASK_SOLID : 0;
  }
};
G_RunEntity(impactMover, runtime);
assertEqual("G_RunEntity.SV_Impact.e1", impactMoverTouches, 1);
assertEqual("G_RunEntity.SV_Impact.e2", impactTargetTouches, 1);
runtime.collision = defaultCollision;
drainGameSoundEvents(runtime);
drainGameTempEntityEvents(runtime);

const pushRuntime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
const pushWorld = pushRuntime.entities[0];
pushWorld.inuse = true;
pushWorld.solid = SOLID_BSP;
pushWorld.linked = true;
const pushActor = spawnGameEntity(pushRuntime);
pushActor.classname = "push-actor";
pushActor.solid = SOLID_BBOX;
pushActor.mins = [-8, -8, -8];
pushActor.maxs = [8, 8, 8];
pushActor.origin = [0, 0, 0];
pushActor.s.origin = [0, 0, 0];
pushActor.velocity = [123, 0, 0];
pushActor.clipmask = MASK_MONSTERSOLID;
const pushBlocker = spawnGameEntity(pushRuntime);
pushBlocker.classname = "push-blocker";
pushBlocker.solid = SOLID_BBOX;
const pushTrigger = spawnGameEntity(pushRuntime);
pushTrigger.classname = "push-trigger";
pushTrigger.solid = SOLID_TRIGGER;
pushTrigger.mins = [8, -12, -12];
pushTrigger.maxs = [12, 12, 12];
let pushActorTouches = 0;
let pushBlockerTouches = 0;
let pushTriggerTouches = 0;
let pushActorPlaneX: number | null = null;
pushActor.touch = (_self, _other, _runtime, plane) => {
  pushActorTouches += 1;
  pushActorPlaneX = plane?.normal[0] ?? null;
};
pushBlocker.touch = (self) => {
  pushBlockerTouches += 1;
  self.inuse = false;
};
pushTrigger.touch = (_self, other) => {
  if (other === pushActor) {
    pushTriggerTouches += 1;
  }
};
refreshEntitySpatialState(pushTrigger);
linkGameEntity(pushRuntime, pushTrigger);
const pushTraceStarts: [number, number, number][] = [];
const pushTraceEnds: [number, number, number][] = [];
const pushTraceMasks: number[] = [];
let pushTraceCount = 0;
pushRuntime.collision = {
  world: {} as never,
  trace(start, mins, maxs, end, passent, contentmask) {
    pushTraceStarts.push([...start] as [number, number, number]);
    pushTraceEnds.push([...end] as [number, number, number]);
    pushTraceMasks.push(contentmask);
    pushTraceCount += 1;

    if (pushTraceCount === 1) {
      return {
        allsolid: false,
        startsolid: false,
        fraction: 0.5,
        endpos: [5, 0, 0],
        plane: {
          normal: [-1, 0, 0],
          dist: 0,
          type: 0,
          signbits: 0,
          pad: [0, 0]
        },
        surface: null,
        contents: contentmask,
        ent: pushBlocker
      };
    }

    return {
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [...end],
      plane: {
        normal: [0, 0, 0],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: contentmask,
      ent: pushWorld
    };
  },
  pointcontents() {
    return 0;
  }
};
const pushTrace = SV_PushEntity(pushActor, [10, 0, 0], pushRuntime);
assertEqual("SV_PushEntity.retry.trace-count", pushTraceCount, 2);
assertEqual("SV_PushEntity.retry.return-fraction", pushTrace.fraction, 1);
assertVec("SV_PushEntity.retry.first-start", pushTraceStarts[0], [0, 0, 0]);
assertVec("SV_PushEntity.retry.first-end", pushTraceEnds[0], [10, 0, 0]);
assertVec("SV_PushEntity.retry.second-start", pushTraceStarts[1], [0, 0, 0]);
assertVec("SV_PushEntity.retry.second-end", pushTraceEnds[1], [10, 0, 0]);
assertEqual("SV_PushEntity.retry.mask", pushTraceMasks[0], MASK_MONSTERSOLID);
assertEqual("SV_PushEntity.retry.mask-repeat", pushTraceMasks[1], MASK_MONSTERSOLID);
assertVec("SV_PushEntity.retry.origin", pushActor.origin, [10, 0, 0]);
assertVec("SV_PushEntity.retry.s-origin", pushActor.s.origin, [10, 0, 0]);
assertVec("SV_PushEntity.retry.velocity-unchanged", pushActor.velocity, [123, 0, 0]);
assertEqual("SV_PushEntity.retry.actor-touch", pushActorTouches, 1);
assertEqual("SV_PushEntity.retry.actor-plane", pushActorPlaneX, -1);
assertEqual("SV_PushEntity.retry.blocker-touch", pushBlockerTouches, 1);
assertEqual("SV_PushEntity.retry.blocker-freed", pushBlocker.inuse, false);
assertEqual("SV_PushEntity.retry.linked", pushActor.linked, true);
assertEqual("SV_PushEntity.retry.trigger-touch", pushTriggerTouches, 1);

const pushDefaultMaskEnt = spawnGameEntity(pushRuntime);
pushDefaultMaskEnt.classname = "push-default-mask";
pushDefaultMaskEnt.solid = SOLID_BBOX;
pushDefaultMaskEnt.mins = [-4, -4, -4];
pushDefaultMaskEnt.maxs = [4, 4, 4];
pushDefaultMaskEnt.origin = [1, 2, 3];
pushDefaultMaskEnt.s.origin = [1, 2, 3];
pushDefaultMaskEnt.clipmask = 0;
let pushDefaultMask = 0;
pushRuntime.collision.trace = (start, _mins, _maxs, end, _passent, contentmask) => {
  pushDefaultMask = contentmask;
  return {
    allsolid: false,
    startsolid: false,
    fraction: 1,
    endpos: [...end],
    plane: {
      normal: [0, 0, 0],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0]
    },
    surface: null,
    contents: contentmask,
    ent: pushWorld
  };
};
SV_PushEntity(pushDefaultMaskEnt, [0, 0, 4], pushRuntime);
assertEqual("SV_PushEntity.default-mask", pushDefaultMask, MASK_SOLID);
assertVec("SV_PushEntity.default-mask.origin", pushDefaultMaskEnt.origin, [1, 2, 7]);

const flyFloor = spawnGameEntity(runtime);
flyFloor.classname = "fly-floor";
flyFloor.solid = SOLID_BSP;
flyFloor.linkcount = 77;
const flyFloorEnt = spawnGameEntity(runtime);
flyFloorEnt.classname = "fly-floor-ent";
flyFloorEnt.solid = SOLID_BBOX;
flyFloorEnt.clipmask = MASK_SOLID;
flyFloorEnt.origin = [0, 0, 8];
flyFloorEnt.s.origin = [0, 0, 8];
flyFloorEnt.velocity = [0, 0, -80];
runtime.collision = {
  world: {} as never,
  trace(start, mins, maxs, end, passent, contentmask) {
    return {
      allsolid: false,
      startsolid: false,
      fraction: 0,
      endpos: [...start],
      plane: {
        normal: [0, 0, 1],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: contentmask,
      ent: flyFloor
    };
  },
  pointcontents(point) {
    return point[2] < 0 ? MASK_SOLID : 0;
  }
};
assertEqual("SV_FlyMove.hit.floor-blocked", SV_FlyMove(flyFloorEnt, 0.1, MASK_SOLID, runtime), 1);
assertEqual("SV_FlyMove.hit.groundentity", flyFloorEnt.groundentity, flyFloor);
assertEqual("SV_FlyMove.hit.groundentity-linkcount", flyFloorEnt.groundentity_linkcount, 77);
assertVec("SV_FlyMove.hit.velocity", flyFloorEnt.velocity, [0, 0, 0]);

const flyCreaseEnt = spawnGameEntity(runtime);
flyCreaseEnt.classname = "fly-crease";
flyCreaseEnt.solid = SOLID_BBOX;
flyCreaseEnt.clipmask = MASK_SOLID;
flyCreaseEnt.origin = [0, 0, 0];
flyCreaseEnt.s.origin = [0, 0, 0];
flyCreaseEnt.velocity = [-10, -10, 5];
const creaseNormals: [number, number, number][] = [
  [1, 0, 0],
  [0, 1, 0]
];
let creaseTraceCount = 0;
runtime.collision = {
  world: {} as never,
  trace(start, mins, maxs, end, passent, contentmask) {
    const normal = creaseNormals[creaseTraceCount];
    creaseTraceCount += 1;
    if (!normal) {
      return {
        allsolid: false,
        startsolid: false,
        fraction: 1,
        endpos: [...end],
        plane: {
          normal: [0, 0, 1],
          dist: 0,
          type: 0,
          signbits: 0,
          pad: [0, 0]
        },
        surface: null,
        contents: contentmask,
        ent: worldspawn
      };
    }

    return {
      allsolid: false,
      startsolid: false,
      fraction: 0,
      endpos: [...start],
      plane: {
        normal,
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: contentmask,
      ent: worldspawn
    };
  },
  pointcontents(point) {
    return point[2] < 0 ? MASK_SOLID : 0;
  }
};
assertEqual("SV_FlyMove.crease.blocked", SV_FlyMove(flyCreaseEnt, 0.1, MASK_SOLID, runtime), 2);
assertEqual("SV_FlyMove.crease.trace-count", creaseTraceCount, 3);
assertVec("SV_FlyMove.crease.dir-d-velocity", flyCreaseEnt.velocity, [0, 0, 5]);

const flyMaxPlanesEnt = spawnGameEntity(runtime);
flyMaxPlanesEnt.classname = "fly-max-planes";
flyMaxPlanesEnt.solid = SOLID_BBOX;
flyMaxPlanesEnt.clipmask = MASK_SOLID;
flyMaxPlanesEnt.origin = [0, 0, 0];
flyMaxPlanesEnt.s.origin = [0, 0, 0];
flyMaxPlanesEnt.velocity = [-10, 0, 5];
let maxPlanesTraceCount = 0;
runtime.collision = {
  world: {} as never,
  trace(start, mins, maxs, end, passent, contentmask) {
    maxPlanesTraceCount += 1;
    return {
      allsolid: false,
      startsolid: false,
      fraction: 0,
      endpos: [...start],
      plane: {
        normal: [1, 0, 0],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: contentmask,
      ent: worldspawn
    };
  },
  pointcontents(point) {
    return point[2] < 0 ? MASK_SOLID : 0;
  }
};
assertEqual("SV_FlyMove.MAX_CLIP_PLANES.numbumps", SV_FlyMove(flyMaxPlanesEnt, 0.1, MASK_SOLID, runtime), 2);
assertEqual("SV_FlyMove.MAX_CLIP_PLANES.trace-count", maxPlanesTraceCount, 4);
assertVec("SV_FlyMove.MAX_CLIP_PLANES.velocity", flyMaxPlanesEnt.velocity, [0, 0, 5]);

const flyPartialEnt = spawnGameEntity(runtime);
flyPartialEnt.classname = "fly-partial";
flyPartialEnt.solid = SOLID_BBOX;
flyPartialEnt.clipmask = MASK_SOLID;
flyPartialEnt.origin = [1, 2, 10];
flyPartialEnt.s.origin = [1, 2, 10];
flyPartialEnt.velocity = [10, 0, -10];
const partialFloor = spawnGameEntity(runtime);
partialFloor.classname = "fly-partial-floor";
partialFloor.solid = SOLID_BSP;
partialFloor.linkcount = 91;
const partialTraceStarts: [number, number, number][] = [];
const partialTraceEnds: [number, number, number][] = [];
let partialTraceCount = 0;
runtime.collision = {
  world: {} as never,
  trace(start, mins, maxs, end, passent, contentmask) {
    partialTraceStarts.push([...start] as [number, number, number]);
    partialTraceEnds.push([...end] as [number, number, number]);
    partialTraceCount += 1;

    if (partialTraceCount === 1) {
      return {
        allsolid: false,
        startsolid: false,
        fraction: 0.25,
        endpos: [3.5, 2, 7.5],
        plane: {
          normal: [0, 0, 1],
          dist: 0,
          type: 0,
          signbits: 0,
          pad: [0, 0]
        },
        surface: null,
        contents: contentmask,
        ent: partialFloor
      };
    }

    if (partialTraceCount === 2) {
      return {
        allsolid: false,
        startsolid: false,
        fraction: 0.5,
        endpos: [7.25, 2, 7.5],
        plane: {
          normal: [0, 1, 0],
          dist: 0,
          type: 0,
          signbits: 0,
          pad: [0, 0]
        },
        surface: null,
        contents: contentmask,
        ent: worldspawn
      };
    }

    return {
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [...end],
      plane: {
        normal: [0, 0, 1],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: contentmask,
      ent: worldspawn
    };
  },
  pointcontents(point) {
    return point[2] < 0 ? MASK_SOLID : 0;
  }
};
assertEqual("SV_FlyMove.locals.blocked", SV_FlyMove(flyPartialEnt, 1, MASK_SOLID, runtime), 3);
assertEqual("SV_FlyMove.locals.trace-count", partialTraceCount, 3);
assertVec("SV_FlyMove.locals.first-end", partialTraceEnds[0], [11, 2, 0]);
assertVec("SV_FlyMove.locals.second-start", partialTraceStarts[1], [3.5, 2, 7.5]);
assertVec("SV_FlyMove.locals.second-end-time-left", partialTraceEnds[1], [11, 2, 7.5]);
assertVec("SV_FlyMove.locals.final-origin", flyPartialEnt.origin, [11, 2, 7.5]);
assertVec("SV_FlyMove.locals.final-s-origin", flyPartialEnt.s.origin, [11, 2, 7.5]);
assertVec("SV_FlyMove.locals.final-velocity", flyPartialEnt.velocity, [10, 0, 0]);
assertEqual("SV_FlyMove.locals.groundentity", flyPartialEnt.groundentity, partialFloor);
assertEqual("SV_FlyMove.locals.groundentity-linkcount", flyPartialEnt.groundentity_linkcount, 91);
runtime.collision = defaultCollision;

const frameThinkEnt = spawnGameEntity(runtime);
frameThinkEnt.classname = "frame-think";
frameThinkEnt.movetype = MOVETYPE_NONE;
frameThinkEnt.nextthink = runtime.time + 0.1;
let frameThinkCount = 0;
frameThinkEnt.think = (self) => {
  frameThinkCount += 1;
  self.s.event = 42;
};
G_RunFrame(runtime);
assertEqual("G_RunFrame.SV_RunThink.count", frameThinkCount, 1);
assertEqual("G_RunFrame.SV_RunThink.nextthink", frameThinkEnt.nextthink, 0);
assertEqual("G_RunFrame.SV_RunThink.visible-event", frameThinkEnt.s.event, 42);

const nonePhysicsEnt = spawnGameEntity(runtime);
nonePhysicsEnt.classname = "none-physics";
nonePhysicsEnt.movetype = MOVETYPE_NONE;
nonePhysicsEnt.origin = [5, 6, 7];
nonePhysicsEnt.s.origin = [5, 6, 7];
nonePhysicsEnt.velocity = [40, -30, 20];
nonePhysicsEnt.nextthink = runtime.time + 10;
let nonePhysicsThinkCount = 0;
let nonePhysicsTraceCount = 0;
nonePhysicsEnt.think = () => {
  nonePhysicsThinkCount += 1;
};
runtime.collision = {
  ...defaultCollision,
  trace: (...args) => {
    nonePhysicsTraceCount += 1;
    return defaultCollision.trace(...args);
  }
};
SV_Physics_None(nonePhysicsEnt, runtime);
assertEqual("SV_Physics_None.future-think", nonePhysicsThinkCount, 0);
assertEqual("SV_Physics_None.trace-count", nonePhysicsTraceCount, 0);
assertVec("SV_Physics_None.origin", nonePhysicsEnt.origin, [5, 6, 7]);
assertVec("SV_Physics_None.s-origin", nonePhysicsEnt.s.origin, [5, 6, 7]);
assertVec("SV_Physics_None.velocity", nonePhysicsEnt.velocity, [40, -30, 20]);
nonePhysicsEnt.nextthink = runtime.time;
SV_Physics_None(nonePhysicsEnt, runtime);
assertEqual("SV_Physics_None.due-think", nonePhysicsThinkCount, 1);
assertEqual("SV_Physics_None.nextthink", nonePhysicsEnt.nextthink, 0);
runtime.collision = defaultCollision;

const noclipPhysicsEnt = spawnGameEntity(runtime);
let noclipThinkCount = 0;
let noclipTraceCount = 0;
noclipPhysicsEnt.classname = "noclip-direct";
noclipPhysicsEnt.movetype = MOVETYPE_NOCLIP;
noclipPhysicsEnt.origin = [10, 20, 30];
noclipPhysicsEnt.s.origin = [10, 20, 30];
noclipPhysicsEnt.angles = [5, 10, 15];
noclipPhysicsEnt.s.angles = [5, 10, 15];
noclipPhysicsEnt.velocity = [100, -50, 25];
noclipPhysicsEnt.avelocity = [30, -60, 90];
noclipPhysicsEnt.nextthink = runtime.time + 1;
noclipPhysicsEnt.think = () => {
  noclipThinkCount += 1;
};
runtime.collision = {
  ...defaultCollision,
  trace: (...args) => {
    noclipTraceCount += 1;
    return defaultCollision.trace(...args);
  }
};
SV_Physics_Noclip(noclipPhysicsEnt, runtime);
assertEqual("SV_Physics_Noclip.future-think", noclipThinkCount, 0);
assertEqual("SV_Physics_Noclip.trace-count", noclipTraceCount, 0);
assertVec("SV_Physics_Noclip.origin", noclipPhysicsEnt.origin, [20, 15, 32.5]);
assertVec("SV_Physics_Noclip.s-origin", noclipPhysicsEnt.s.origin, [20, 15, 32.5]);
assertVec("SV_Physics_Noclip.angles", noclipPhysicsEnt.angles, [8, 4, 24]);
assertVec("SV_Physics_Noclip.s-angles", noclipPhysicsEnt.s.angles, [8, 4, 24]);
assertEqual("SV_Physics_Noclip.linked", noclipPhysicsEnt.linked, true);

noclipPhysicsEnt.nextthink = runtime.time;
const noclipLinkcount = noclipPhysicsEnt.linkcount;
SV_Physics_Noclip(noclipPhysicsEnt, runtime);
assertEqual("SV_Physics_Noclip.due-think", noclipThinkCount, 1);
assertEqual("SV_Physics_Noclip.nextthink", noclipPhysicsEnt.nextthink, 0);
assertEqual("SV_Physics_Noclip.no-move-after-due-think-linkcount", noclipPhysicsEnt.linkcount, noclipLinkcount);
assertVec("SV_Physics_Noclip.no-move-after-due-think-origin", noclipPhysicsEnt.origin, [20, 15, 32.5]);
assertVec("SV_Physics_Noclip.no-move-after-due-think-angles", noclipPhysicsEnt.angles, [8, 4, 24]);
runtime.collision = defaultCollision;

const tossEnt = spawnGameEntity(runtime);
tossEnt.classname = "crate";
tossEnt.movetype = MOVETYPE_TOSS;
tossEnt.solid = SOLID_BBOX;
tossEnt.clipmask = MASK_SOLID;
tossEnt.mins = [-16, -16, -16];
tossEnt.maxs = [16, 16, 16];
tossEnt.origin = [0, 0, 8];
tossEnt.s.origin = [0, 0, 8];
tossEnt.velocity = [0, 0, -80];
tossEnt.gravity = 1;
linkGameEntity(runtime, tossEnt);
SV_Physics_Toss(tossEnt, runtime);
assertEqual("SV_Physics_Toss.groundentity", tossEnt.groundentity, worldspawn);
assertVec("SV_Physics_Toss.velocity", tossEnt.velocity, [0, 0, 0]);
assertVec("SV_Physics_Toss.avelocity", tossEnt.avelocity, [0, 0, 0]);

const tossTeamSlave = spawnGameEntity(runtime);
let tossTeamSlaveThinkCount = 0;
tossTeamSlave.classname = "toss-teamslave";
tossTeamSlave.movetype = MOVETYPE_TOSS;
tossTeamSlave.flags = FL_TEAMSLAVE;
tossTeamSlave.origin = [1, 2, 40];
tossTeamSlave.s.origin = [1, 2, 40];
tossTeamSlave.velocity = [100, 0, 100];
tossTeamSlave.nextthink = runtime.time;
tossTeamSlave.think = () => {
  tossTeamSlaveThinkCount += 1;
};
SV_Physics_Toss(tossTeamSlave, runtime);
assertEqual("SV_Physics_Toss.teamslave-think", tossTeamSlaveThinkCount, 1);
assertVec("SV_Physics_Toss.teamslave-origin", tossTeamSlave.origin, [1, 2, 40]);
assertVec("SV_Physics_Toss.teamslave-velocity", tossTeamSlave.velocity, [100, 0, 100]);

const tossOnGround = spawnGameEntity(runtime);
tossOnGround.classname = "toss-onground";
tossOnGround.movetype = MOVETYPE_TOSS;
tossOnGround.origin = [5, 6, 7];
tossOnGround.s.origin = [5, 6, 7];
tossOnGround.velocity = [80, 0, -120];
tossOnGround.groundentity = worldspawn;
SV_Physics_Toss(tossOnGround, runtime);
assertVec("SV_Physics_Toss.onground-origin", tossOnGround.origin, [5, 6, 7]);
assertVec("SV_Physics_Toss.onground-velocity", tossOnGround.velocity, [80, 0, -120]);

const tossInvalidGround = spawnGameEntity(runtime);
const freedGround = spawnGameEntity(runtime);
freedGround.inuse = false;
tossInvalidGround.classname = "toss-invalid-ground";
tossInvalidGround.movetype = MOVETYPE_TOSS;
tossInvalidGround.origin = [0, 0, 50];
tossInvalidGround.s.origin = [0, 0, 50];
tossInvalidGround.velocity = [0, 0, 0];
tossInvalidGround.groundentity = freedGround;
SV_Physics_Toss(tossInvalidGround, runtime);
assertEqual("SV_Physics_Toss.invalid-groundentity", tossInvalidGround.groundentity, null);
assertVec("SV_Physics_Toss.invalid-ground-moved", tossInvalidGround.origin, [0, 0, 42]);

const tossFly = spawnGameEntity(runtime);
tossFly.classname = "toss-fly";
tossFly.movetype = MOVETYPE_FLY;
tossFly.origin = [0, 0, 10];
tossFly.s.origin = [0, 0, 10];
tossFly.angles = [0, 10, 20];
tossFly.s.angles = [0, 10, 20];
tossFly.velocity = [10, 20, 30];
tossFly.avelocity = [5, 0, -5];
SV_Physics_Toss(tossFly, runtime);
assertVec("SV_Physics_Toss.fly-origin", tossFly.origin, [1, 2, 13]);
assertVec("SV_Physics_Toss.fly-velocity-no-gravity", tossFly.velocity, [10, 20, 30]);
assertVec("SV_Physics_Toss.fly-angles", tossFly.angles, [0.5, 10, 19.5]);

const tossFlyMissile = spawnGameEntity(runtime);
tossFlyMissile.classname = "toss-flymissile";
tossFlyMissile.movetype = MOVETYPE_FLYMISSILE;
tossFlyMissile.origin = [0, 0, 10];
tossFlyMissile.s.origin = [0, 0, 10];
tossFlyMissile.velocity = [0, 0, 20];
SV_Physics_Toss(tossFlyMissile, runtime);
assertVec("SV_Physics_Toss.flymissile-no-gravity", tossFlyMissile.velocity, [0, 0, 20]);

const bounceEnt = spawnGameEntity(runtime);
bounceEnt.classname = "bounce";
bounceEnt.movetype = MOVETYPE_BOUNCE;
bounceEnt.solid = SOLID_BBOX;
bounceEnt.clipmask = MASK_SOLID;
bounceEnt.origin = [0, 0, 20];
bounceEnt.s.origin = [0, 0, 20];
bounceEnt.velocity = [100, 0, -50];
runtime.collision = {
  ...defaultCollision,
  trace(start, mins, maxs, end, passent, contentmask) {
    return {
      allsolid: false,
      startsolid: false,
      fraction: 0.5,
      endpos: [5, 0, 13.5],
      plane: {
        normal: [0, 0, 1],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: contentmask,
      ent: worldspawn
    };
  },
  pointcontents: () => 0
};
SV_Physics_Toss(bounceEnt, runtime);
assertEqual("SV_Physics_Toss.bounce-no-ground", bounceEnt.groundentity, null);
assertVec("SV_Physics_Toss.bounce-backoff", bounceEnt.velocity, [100, 0, 65]);
runtime.collision = defaultCollision;

const waterEnt = spawnGameEntity(runtime);
waterEnt.classname = "water-toss";
waterEnt.movetype = MOVETYPE_TOSS;
waterEnt.origin = [10, 20, 30];
waterEnt.s.origin = [10, 20, 30];
waterEnt.velocity = [0, 0, 0];
runtime.collision = {
  ...defaultCollision,
  pointcontents(point) {
    return point[2] <= 22 ? MASK_WATER : 0;
  }
};
SV_Physics_Toss(waterEnt, runtime);
let waterSounds = drainGameSoundEvents(runtime).filter((event) => event.soundPath === "misc/h2ohit1.wav");
assertEqual("SV_Physics_Toss.water-enter-count", waterSounds.length, 1);
assertVec("SV_Physics_Toss.water-enter-origin", waterSounds[0].origin ?? [], [10, 20, 30]);
assertEqual("SV_Physics_Toss.water-enter-level", waterEnt.waterlevel, 1);

waterEnt.velocity = [0, 0, 200];
SV_Physics_Toss(waterEnt, runtime);
waterSounds = drainGameSoundEvents(runtime).filter((event) => event.soundPath === "misc/h2ohit1.wav");
assertEqual("SV_Physics_Toss.water-exit-count", waterSounds.length, 1);
assertVec("SV_Physics_Toss.water-exit-origin", waterSounds[0].origin ?? [], [10, 20, 34]);
assertEqual("SV_Physics_Toss.water-exit-level", waterEnt.waterlevel, 0);
runtime.collision = defaultCollision;

const captain = spawnGameEntity(runtime);
const slave = spawnGameEntity(runtime);
captain.classname = "toss-captain";
captain.movetype = MOVETYPE_FLY;
captain.origin = [3, 4, 5];
captain.s.origin = [3, 4, 5];
captain.velocity = [10, 0, 0];
captain.teamchain = slave;
slave.classname = "toss-slave";
slave.origin = [-1, -1, -1];
slave.s.origin = [-1, -1, -1];
SV_Physics_Toss(captain, runtime);
assertVec("SV_Physics_Toss.teamchain-origin", slave.origin, [4, 4, 5]);
assertVec("SV_Physics_Toss.teamchain-s-origin", slave.s.origin, [4, 4, 5]);
assertEqual("SV_Physics_Toss.teamchain-linked", slave.linked, true);

const rotationalFrictionEnt = spawnGameEntity(runtime);
rotationalFrictionEnt.classname = "rotational-friction";
rotationalFrictionEnt.angles = [1, 2, 3];
rotationalFrictionEnt.s.angles = [1, 2, 3];
rotationalFrictionEnt.avelocity = [120, -45, 0];
SV_AddRotationalFriction(rotationalFrictionEnt);
assertVec("SV_AddRotationalFriction.angles", rotationalFrictionEnt.angles, [13, -2.5, 3]);
assertVec("SV_AddRotationalFriction.s-angles", rotationalFrictionEnt.s.angles, [13, -2.5, 3]);
assertVec("SV_AddRotationalFriction.avelocity", rotationalFrictionEnt.avelocity, [60, 0, 0]);

const stepRotationalEnt = spawnGameEntity(runtime);
stepRotationalEnt.classname = "step-rotational-friction";
stepRotationalEnt.movetype = MOVETYPE_STEP;
stepRotationalEnt.groundentity = worldspawn;
stepRotationalEnt.angles = [0, 10, 20];
stepRotationalEnt.s.angles = [0, 10, 20];
stepRotationalEnt.avelocity = [30, -90, 120];
G_RunEntity(stepRotationalEnt, runtime);
assertVec("SV_Physics_Step.rotational-angles", stepRotationalEnt.angles, [3, 1, 32]);
assertVec("SV_Physics_Step.rotational-avelocity", stepRotationalEnt.avelocity, [0, -30, 60]);

const stepFlyFrictionEnt = spawnGameEntity(runtime);
stepFlyFrictionEnt.classname = "step-fly-friction";
stepFlyFrictionEnt.movetype = MOVETYPE_STEP;
stepFlyFrictionEnt.flags = FL_FLY;
stepFlyFrictionEnt.groundentity = worldspawn;
stepFlyFrictionEnt.origin = [0, 0, 100];
stepFlyFrictionEnt.s.origin = [0, 0, 100];
stepFlyFrictionEnt.velocity = [0, 0, 90];
G_RunEntity(stepFlyFrictionEnt, runtime);
assertVec("SV_Physics_Step.fly-friction-velocity", stepFlyFrictionEnt.velocity, [0, 0, 70]);

const stepSwimFrictionEnt = spawnGameEntity(runtime);
stepSwimFrictionEnt.classname = "step-swim-friction";
stepSwimFrictionEnt.movetype = MOVETYPE_STEP;
stepSwimFrictionEnt.flags = FL_SWIM;
stepSwimFrictionEnt.groundentity = worldspawn;
stepSwimFrictionEnt.origin = [0, 0, 100];
stepSwimFrictionEnt.s.origin = [0, 0, 100];
stepSwimFrictionEnt.velocity = [0, 0, 90];
stepSwimFrictionEnt.waterlevel = 2;
G_RunEntity(stepSwimFrictionEnt, runtime);
assertVec("SV_Physics_Step.swim-friction-velocity", stepSwimFrictionEnt.velocity, [0, 0, 70]);

const dispatchEnt = spawnGameEntity(runtime);
let noneBranch = 0;
dispatchEnt.classname = "none";
dispatchEnt.movetype = MOVETYPE_NONE;
dispatchEnt.nextthink = runtime.time + 0.0005;
dispatchEnt.think = () => {
  noneBranch += 1;
};
G_RunEntity(dispatchEnt, runtime);
assertEqual("G_RunEntity.none", noneBranch, 1);

const pusher = spawnGameEntity(runtime);
pusher.classname = "pusher";
pusher.movetype = MOVETYPE_PUSH;
pusher.solid = SOLID_BSP;
pusher.velocity = [64, 0, 0];
linkGameEntity(runtime, pusher);
G_RunEntity(pusher, runtime);
assertEqual("G_RunEntity.push.linked", pusher.linked, true);

const teamRuntime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
teamRuntime.collision = {
  world: {} as never,
  trace(start, _mins, _maxs, end, passent, contentmask) {
    const blocked = passent?.classname === "team-rider-blocked";
    return {
      allsolid: blocked,
      startsolid: blocked,
      fraction: blocked ? 0 : 1,
      endpos: blocked ? [...start] : [...end],
      plane: {
        normal: blocked ? [-1, 0, 0] : [0, 0, 0],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: contentmask,
      ent: teamRuntime.entities[0]
    };
  },
  pointcontents() {
    return 0;
  }
};

const teamCaptain = spawnGameEntity(teamRuntime);
teamCaptain.classname = "team-captain";
teamCaptain.movetype = MOVETYPE_PUSH;
teamCaptain.solid = SOLID_BSP;
teamCaptain.velocity = [80, 0, 0];
teamCaptain.mins = [-32, -32, 0];
teamCaptain.maxs = [32, 32, 64];
refreshEntitySpatialState(teamCaptain);
linkGameEntity(teamRuntime, teamCaptain);

const teamSlave = spawnGameEntity(teamRuntime);
teamSlave.classname = "team-slave";
teamSlave.movetype = MOVETYPE_PUSH;
teamSlave.solid = SOLID_BSP;
teamSlave.origin = [200, 0, 0];
teamSlave.s.origin = [200, 0, 0];
teamSlave.velocity = [80, 0, 0];
teamSlave.mins = [-32, -32, 0];
teamSlave.maxs = [32, 32, 64];
refreshEntitySpatialState(teamSlave);
linkGameEntity(teamRuntime, teamSlave);
teamCaptain.teamchain = teamSlave;

const teamRiderOk = spawnGameEntity(teamRuntime);
teamRiderOk.classname = "team-rider-ok";
teamRiderOk.movetype = MOVETYPE_STEP;
teamRiderOk.solid = SOLID_BBOX;
teamRiderOk.origin = [0, 0, 80];
teamRiderOk.s.origin = [0, 0, 80];
teamRiderOk.mins = [-16, -16, -24];
teamRiderOk.maxs = [16, 16, 32];
teamRiderOk.groundentity = teamCaptain;
teamRiderOk.groundentity_linkcount = teamCaptain.linkcount;
refreshEntitySpatialState(teamRiderOk);
linkGameEntity(teamRuntime, teamRiderOk);

const teamRiderBlocked = spawnGameEntity(teamRuntime);
teamRiderBlocked.classname = "team-rider-blocked";
teamRiderBlocked.movetype = MOVETYPE_STEP;
teamRiderBlocked.solid = SOLID_BBOX;
teamRiderBlocked.origin = [200, 0, 80];
teamRiderBlocked.s.origin = [200, 0, 80];
teamRiderBlocked.mins = [-16, -16, -24];
teamRiderBlocked.maxs = [16, 16, 32];
teamRiderBlocked.groundentity = teamSlave;
teamRiderBlocked.groundentity_linkcount = teamSlave.linkcount;
const blockedClient = attachGameClient(teamRiderBlocked);
blockedClient.ps.pmove.delta_angles[1] = 900;
refreshEntitySpatialState(teamRiderBlocked);
linkGameEntity(teamRuntime, teamRiderBlocked);

let teamBlockedOther = "";
teamSlave.blocked = (_self, other) => {
  teamBlockedOther = other.classname;
};

G_RunEntity(teamCaptain, teamRuntime);
assertVec("SV_Physics_Pusher.team-rollback.captain-origin", teamCaptain.origin, [0, 0, 0]);
assertVec("SV_Physics_Pusher.team-rollback.slave-origin", teamSlave.origin, [200, 0, 0]);
assertVec("SV_Physics_Pusher.team-rollback.rider-ok-origin", teamRiderOk.origin, [0, 0, 80]);
assertVec("SV_Physics_Pusher.team-rollback.rider-blocked-origin", teamRiderBlocked.origin, [200, 0, 80]);
assertEqual("SV_Physics_Pusher.team-rollback.rider-deltayaw", blockedClient.ps.pmove.delta_angles[1], 900);
assertEqual("SV_Physics_Pusher.team-rollback.obstacle", teamBlockedOther, "team-rider-blocked");

const teamSlaveOnly = spawnGameEntity(teamRuntime);
teamSlaveOnly.classname = "team-slave-only";
teamSlaveOnly.movetype = MOVETYPE_PUSH;
teamSlaveOnly.flags = FL_TEAMSLAVE;
teamSlaveOnly.velocity = [80, 0, 0];
teamSlaveOnly.nextthink = teamRuntime.time;
let teamSlaveOnlyThinkCount = 0;
teamSlaveOnly.think = () => {
  teamSlaveOnlyThinkCount += 1;
};
G_RunEntity(teamSlaveOnly, teamRuntime);
assertVec("SV_Physics_Pusher.team-slave-noop.origin", teamSlaveOnly.origin, [0, 0, 0]);
assertEqual("SV_Physics_Pusher.team-slave-noop.think", teamSlaveOnlyThinkCount, 0);

const pusherThinkRuntime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
pusherThinkRuntime.collision = {
  world: {} as never,
  trace(_start, _mins, _maxs, end, _passent, contentmask) {
    return {
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [...end],
      plane: {
        normal: [0, 0, 0],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: contentmask,
      ent: pusherThinkRuntime.entities[0]
    };
  },
  pointcontents() {
    return 0;
  }
};

const movingThinkPusher = spawnGameEntity(pusherThinkRuntime);
movingThinkPusher.classname = "moving-think-pusher";
movingThinkPusher.movetype = MOVETYPE_PUSH;
movingThinkPusher.solid = SOLID_BSP;
movingThinkPusher.velocity = [80, 0, 0];
movingThinkPusher.nextthink = pusherThinkRuntime.time + 0.0005;
let movingThinkCount = 0;
movingThinkPusher.think = () => {
  movingThinkCount += 1;
};
linkGameEntity(pusherThinkRuntime, movingThinkPusher);
G_RunEntity(movingThinkPusher, pusherThinkRuntime);
assertVec("SV_Physics_Pusher.success.origin", movingThinkPusher.origin, [8, 0, 0]);
assertEqual("SV_Physics_Pusher.success.think", movingThinkCount, 1);
assertEqual("SV_Physics_Pusher.success.nextthink", movingThinkPusher.nextthink, 0);
assertEqual("SV_Physics_Pusher.success.linked", movingThinkPusher.linked, true);

const blockedThinkRuntime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
blockedThinkRuntime.collision = {
  world: {} as never,
  trace(start, _mins, _maxs, _end, passent, contentmask) {
    const blocked = passent?.classname === "blocked-think-rider";
    return {
      allsolid: blocked,
      startsolid: blocked,
      fraction: blocked ? 0 : 1,
      endpos: [...start],
      plane: {
        normal: blocked ? [-1, 0, 0] : [0, 0, 0],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: contentmask,
      ent: blockedThinkRuntime.entities[0]
    };
  },
  pointcontents() {
    return 0;
  }
};

const blockedThinkPusher = spawnGameEntity(blockedThinkRuntime);
blockedThinkPusher.classname = "blocked-think-pusher";
blockedThinkPusher.movetype = MOVETYPE_PUSH;
blockedThinkPusher.solid = SOLID_BSP;
blockedThinkPusher.velocity = [80, 0, 0];
blockedThinkPusher.nextthink = blockedThinkRuntime.time + 0.2;
blockedThinkPusher.mins = [-32, -32, 0];
blockedThinkPusher.maxs = [32, 32, 64];
refreshEntitySpatialState(blockedThinkPusher);
linkGameEntity(blockedThinkRuntime, blockedThinkPusher);

const blockedThinkRider = spawnGameEntity(blockedThinkRuntime);
blockedThinkRider.classname = "blocked-think-rider";
blockedThinkRider.movetype = MOVETYPE_STEP;
blockedThinkRider.solid = SOLID_BBOX;
blockedThinkRider.origin = [0, 0, 80];
blockedThinkRider.s.origin = [0, 0, 80];
blockedThinkRider.mins = [-16, -16, -24];
blockedThinkRider.maxs = [16, 16, 32];
blockedThinkRider.groundentity = blockedThinkPusher;
blockedThinkRider.groundentity_linkcount = blockedThinkPusher.linkcount;
refreshEntitySpatialState(blockedThinkRider);
linkGameEntity(blockedThinkRuntime, blockedThinkRider);

let blockedThinkCount = 0;
let blockedOtherClassname = "";
blockedThinkPusher.think = () => {
  blockedThinkCount += 1;
};
blockedThinkPusher.blocked = (_self, other) => {
  blockedOtherClassname = other.classname;
};
G_RunEntity(blockedThinkPusher, blockedThinkRuntime);
assertVec("SV_Physics_Pusher.blocked.origin", blockedThinkPusher.origin, [0, 0, 0]);
assertEqual("SV_Physics_Pusher.blocked.nextthink", blockedThinkPusher.nextthink, 0.30000000000000004);
assertEqual("SV_Physics_Pusher.blocked.think", blockedThinkCount, 0);
assertEqual("SV_Physics_Pusher.blocked.other", blockedOtherClassname, "blocked-think-rider");

const pushDirectRuntime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
const pushDirectWorld = pushDirectRuntime.entities[0];
pushDirectWorld.inuse = true;
pushDirectWorld.solid = SOLID_BSP;
pushDirectWorld.movetype = MOVETYPE_NONE;
pushDirectWorld.linked = true;
pushDirectRuntime.collision = {
  world: {} as never,
  trace(start, _mins, _maxs, _end, passent, contentmask) {
    const blocked = passent?.classname === "push-direct-rider" && start[0] > 0;
    return {
      allsolid: blocked,
      startsolid: blocked,
      fraction: blocked ? 0 : 1,
      endpos: [...start],
      plane: {
        normal: blocked ? [-1, 0, 0] : [0, 0, 0],
        dist: 0,
        type: 0,
        signbits: 0,
        pad: [0, 0]
      },
      surface: null,
      contents: contentmask,
      ent: pushDirectWorld
    };
  },
  pointcontents() {
    return 0;
  }
};

const pushDirectPusher = spawnGameEntity(pushDirectRuntime);
pushDirectPusher.classname = "push-direct-pusher";
pushDirectPusher.movetype = MOVETYPE_PUSH;
pushDirectPusher.solid = SOLID_BSP;
pushDirectPusher.mins = [-8, -8, 0];
pushDirectPusher.maxs = [8, 8, 8];
refreshEntitySpatialState(pushDirectPusher);
linkGameEntity(pushDirectRuntime, pushDirectPusher);

const pushDirectRider = spawnGameEntity(pushDirectRuntime);
pushDirectRider.classname = "push-direct-rider";
pushDirectRider.movetype = MOVETYPE_STEP;
pushDirectRider.solid = SOLID_BBOX;
pushDirectRider.origin = [0, 0, 16];
pushDirectRider.s.origin = [0, 0, 16];
pushDirectRider.mins = [-4, -4, -8];
pushDirectRider.maxs = [4, 4, 8];
pushDirectRider.groundentity = pushDirectPusher;
pushDirectRider.groundentity_linkcount = pushDirectPusher.linkcount;
const pushDirectClient = attachGameClient(pushDirectRider);
pushDirectClient.ps.pmove.delta_angles[1] = 10;
refreshEntitySpatialState(pushDirectRider);
linkGameEntity(pushDirectRuntime, pushDirectRider);
const pushDirectRiderLinkcount = pushDirectRider.linkcount;

assertEqual("SV_Push.direct-old-position.result", SV_Push(pushDirectPusher, [0.07, -0.07, 0.06], [0, 5, 0], pushDirectRuntime), true);
assertVec("SV_Push.direct-old-position.pusher-clamped", pushDirectPusher.origin, [0.125, -0.125, 0]);
assertVec("SV_Push.direct-old-position.rider-origin", pushDirectRider.origin, [0, 0, 16]);
assertEqual("SV_Push.direct-old-position.rider-linkcount", pushDirectRider.linkcount, pushDirectRiderLinkcount);
assertEqual("SV_Push.direct-old-position.rider-deltayaw", pushDirectClient.ps.pmove.delta_angles[1], 15);

const badEnt = spawnGameEntity(runtime);
badEnt.classname = "bad";
badEnt.movetype = MOVETYPE_STEP;
let stepReached = false;
badEnt.nextthink = runtime.time + 0.0005;
badEnt.think = () => {
  stepReached = true;
};
G_RunEntity(badEnt, runtime);
assertEqual("G_RunEntity.step.think", stepReached, true);

console.log("quake2-g-phys: ok");
