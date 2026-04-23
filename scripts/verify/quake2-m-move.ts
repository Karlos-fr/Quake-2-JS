/**
 * File: quake2-m-move.ts
 * Purpose: Verify the direct TypeScript port of `game/m_move.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict gameplay movement port.
 *
 * Dependencies:
 * - packages/game/src/m_move.ts
 * - packages/game/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import { AI_NOSTEP, FL_FLY, FL_PARTIALGROUND } from "../../packages/game/src/g-local.js";
import {
  M_ChangeYaw,
  M_CheckBottom,
  M_MoveToGoal,
  M_walkmove,
  SV_CloseEnough,
  SV_FixCheckBottom,
  SV_NewChaseDir,
  SV_StepDirection,
  SV_movestep
} from "../../packages/game/src/m_move.js";
import { createGameRuntimeFromBspEntities, createRuntimeEntity, refreshEntitySpatialState } from "../../packages/game/src/runtime.js";

const CONTENTS_SOLID = 1;

function makeTrace(overrides: Partial<ReturnType<NonNullable<typeof runtime.collision>["trace"]>> = {}) {
  return {
    allsolid: false,
    startsolid: false,
    fraction: 1,
    endpos: [0, 0, 0] as [number, number, number],
    plane: {
      normal: [0, 0, 0] as [number, number, number],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0] as [number, number]
    },
    surface: null,
    contents: 0,
    ent: null,
    ...overrides
  };
}

const runtime = createGameRuntimeFromBspEntities([]);
const monster = createRuntimeEntity({}, 1);
monster.mins = [-16, -16, -24];
monster.maxs = [16, 16, 32];
monster.s.origin = [0, 0, 24];
monster.origin = [0, 0, 24];
monster.viewheight = 16;
monster.yaw_speed = 20;
monster.groundentity = monster;
refreshEntitySpatialState(monster);

let traceQueue: ReturnType<typeof makeTrace>[] = [];
runtime.collision = {
  world: {} as never,
  trace: () => {
    return traceQueue.shift() ?? makeTrace({ fraction: 0.5, endpos: [0, 0, 0], ent: monster });
  },
  pointcontents: () => CONTENTS_SOLID
};

traceQueue = [makeTrace({ fraction: 0.5, endpos: [0, 0, -4] }), makeTrace({ fraction: 0.5, endpos: [-16, -16, -4] }), makeTrace({ fraction: 0.5, endpos: [-16, 16, -4] }), makeTrace({ fraction: 0.5, endpos: [16, -16, -4] }), makeTrace({ fraction: 0.5, endpos: [16, 16, -4] })];
assert.equal(M_CheckBottom(monster, runtime), true, "M_CheckBottom mismatch");

monster.s.angles[1] = 10;
monster.angles[1] = 10;
monster.ideal_yaw = 350;
monster.yaw_speed = 15;
M_ChangeYaw(monster);
assert.equal(Math.abs(monster.s.angles[1] - 355) < 0.01, true, "M_ChangeYaw mismatch");

traceQueue = [makeTrace({ fraction: 0.5, endpos: [10, 0, 0], ent: monster })];
runtime.collision.pointcontents = () => 0;
assert.equal(SV_movestep(monster, [10, 0, 0], true, runtime), true, "SV_movestep basic step mismatch");

monster.flags |= FL_PARTIALGROUND;
traceQueue = [makeTrace({ fraction: 1, endpos: [0, 0, 0] })];
assert.equal(SV_movestep(monster, [4, 0, 0], true, runtime), true, "SV_movestep partial ground mismatch");
monster.flags &= ~FL_PARTIALGROUND;

monster.groundentity = monster;
traceQueue = [makeTrace({ fraction: 0.5, endpos: [4, 0, 0], ent: monster })];
assert.equal(M_walkmove(monster, 0, 4, runtime), true, "M_walkmove mismatch");

traceQueue = [makeTrace({ fraction: 0.5, endpos: [8, 0, 0], ent: monster })];
assert.equal(SV_StepDirection(monster, 0, 8, runtime), true, "SV_StepDirection mismatch");

const goal = createRuntimeEntity({}, 2);
goal.absmin = [0, 0, 0];
goal.absmax = [16, 16, 16];
monster.absmin = [10, 10, 10];
monster.absmax = [20, 20, 20];
assert.equal(SV_CloseEnough(monster, goal, 5), true, "SV_CloseEnough mismatch");

SV_FixCheckBottom(monster);
assert.equal((monster.flags & FL_PARTIALGROUND) !== 0, true, "SV_FixCheckBottom mismatch");

const enemy = createRuntimeEntity({}, 3);
enemy.s.origin = [100, 100, 0];
enemy.origin = [100, 100, 0];
monster.s.origin = [0, 0, 0];
monster.origin = [0, 0, 0];
monster.goalentity = enemy;
monster.enemy = enemy;
monster.ideal_yaw = 0;
traceQueue = [
  makeTrace({ fraction: 0.5, endpos: [4, 4, 0], ent: monster }),
  makeTrace({ fraction: 0.5, endpos: [4, 4, 0], ent: monster })
];
SV_NewChaseDir(monster, enemy, 4, runtime);
assert.equal(monster.ideal_yaw !== 0 || monster.s.origin[0] !== 0 || monster.s.origin[1] !== 0, true, "SV_NewChaseDir mismatch");

monster.goalentity = enemy;
monster.groundentity = monster;
traceQueue = [makeTrace({ fraction: 0.5, endpos: [4, 0, 0], ent: monster })];
M_MoveToGoal(monster, 4, runtime);

const flyer = createRuntimeEntity({}, 4);
flyer.flags = FL_FLY;
flyer.enemy = enemy;
flyer.goalentity = enemy;
flyer.s.origin = [0, 0, 0];
flyer.origin = [0, 0, 0];
flyer.mins = [-16, -16, -16];
flyer.maxs = [16, 16, 16];
traceQueue = [makeTrace({ fraction: 1, endpos: [8, 0, 8] })];
runtime.collision.pointcontents = () => 0;
assert.equal(SV_movestep(flyer, [8, 0, 0], true, runtime), true, "SV_movestep fly mismatch");

monster.monsterinfo.aiflags = AI_NOSTEP;
traceQueue = [makeTrace({ fraction: 0.5, endpos: [2, 0, 0], ent: monster })];
runtime.collision.pointcontents = () => 0;
assert.equal(SV_movestep(monster, [2, 0, 0], true, runtime), true, "SV_movestep no-step mismatch");

console.log("quake2-m-move: ok");
