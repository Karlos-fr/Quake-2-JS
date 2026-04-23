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

import { MASK_SOLID } from "../../packages/qcommon/src/index.js";
import {
  ClipVelocity,
  G_RunEntity,
  SV_CheckVelocity,
  SV_Physics_Toss,
  SV_RunThink
} from "../../packages/game/src/g_phys.js";
import {
  MOVETYPE_NONE,
  MOVETYPE_PUSH,
  MOVETYPE_STEP,
  MOVETYPE_TOSS,
  SOLID_BBOX,
  SOLID_BSP,
  createGameRuntimeFromBspEntities,
  linkGameEntity,
  spawnGameEntity
} from "../../packages/game/src/runtime.js";

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

const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
const worldspawn = runtime.entities[0];
worldspawn.inuse = true;
worldspawn.solid = SOLID_BSP;
worldspawn.linked = true;

runtime.collision = {
  world: {} as never,
  trace(start, mins, maxs, end, passent, contentmask) {
    const traceEnt = runtime.entities[0];
    const fraction = end[2] < 0 ? 0.5 : 1;
    const endpos: [number, number, number] = fraction === 1
      ? [...end]
      : [start[0] + (end[0] - start[0]) * fraction, start[1] + (end[1] - start[1]) * fraction, 0];

    return {
      allsolid: false,
      startsolid: false,
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

const velocityEnt = spawnGameEntity(runtime);
velocityEnt.velocity = [2500, -2500, 100];
SV_CheckVelocity(velocityEnt);
assertVec("SV_CheckVelocity", velocityEnt.velocity, [2000, -2000, 100]);

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
