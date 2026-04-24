/**
 * File: quake2-g-chase.ts
 * Purpose: Verify the direct TypeScript port of `game/g_chase.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for spectator chase-camera behavior.
 *
 * Dependencies:
 * - packages/game/src/g_chase.ts
 * - packages/game/src/runtime.ts
 */

import { strict as assert } from "node:assert";

import {
  ANGLE2SHORT,
  MASK_SOLID,
  PMF_NO_PREDICTION,
  PITCH,
  ROLL,
  YAW,
  pmtype_t,
  type vec3_t
} from "../../packages/qcommon/src/index.js";
import {
  ChaseNext,
  ChasePrev,
  GetChaseTarget,
  UpdateChaseCam
} from "../../packages/game/src/g_chase.js";
import {
  attachGameClient,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  type GameEntity
} from "../../packages/game/src/runtime.js";

const runtime = createGameRuntimeFromBspEntities([]);
runtime.maxclients = 4;

const player1 = createClientEntity(1, false);
player1.s.origin = [100, 50, 20];
player1.origin = [...player1.s.origin];
player1.viewheight = 22;
player1.client!.v_angle = [10, 90, 5];
player1.groundentity = createRuntimeEntity({ classname: "world" }, 20);

const spectator2 = createClientEntity(2, true);
const player3 = createClientEntity(3, false);
player3.s.origin = [200, 0, 0];
player3.origin = [...player3.s.origin];

const spectator4 = createClientEntity(4, true);
spectator4.s.origin = [0, 0, 0];
spectator4.origin = [0, 0, 0];
spectator4.client!.resp.cmd_angles = [1, 2, 3];
spectator4.client!.chase_target = player1;

runtime.entities[1] = player1;
runtime.entities[2] = spectator2;
runtime.entities[3] = player3;
runtime.entities[4] = spectator4;

runtime.collision = createPassThroughCollision();

ChaseNext(spectator4, runtime);
assert.equal(spectator4.client!.chase_target, player3, "ChaseNext must skip spectators and choose the next live player");
assert.equal(spectator4.client!.update_chase, true, "ChaseNext must request chase update");

spectator4.client!.update_chase = false;
ChasePrev(spectator4, runtime);
assert.equal(spectator4.client!.chase_target, player1, "ChasePrev must skip spectators and choose the previous live player");
assert.equal(spectator4.client!.update_chase, true, "ChasePrev must request chase update");

spectator4.client!.update_chase = false;
UpdateChaseCam(spectator4, runtime);
assert.equal(spectator4.client!.ps.pmove.pm_type, pmtype_t.PM_FREEZE, "UpdateChaseCam must freeze live target spectators");
assert.equal((spectator4.client!.ps.pmove.pm_flags & PMF_NO_PREDICTION) !== 0, true, "UpdateChaseCam must disable prediction");
assert.deepEqual(spectator4.client!.ps.viewangles, player1.client!.v_angle, "UpdateChaseCam must copy live target viewangles");
assert.deepEqual(spectator4.client!.v_angle, player1.client!.v_angle, "UpdateChaseCam must copy live target client v_angle");
assert.equal(spectator4.viewheight, 0, "UpdateChaseCam must clear spectator viewheight");
assert.equal(spectator4.linkcount, 1, "UpdateChaseCam must relink the spectator entity");
assert.deepEqual(
  Array.from(spectator4.client!.ps.pmove.delta_angles),
  player1.client!.v_angle.map((angle, index) => ANGLE2SHORT(angle - spectator4.client!.resp.cmd_angles[index])),
  "UpdateChaseCam must preserve delta_angles calculation"
);
assert.notDeepEqual(spectator4.s.origin, [0, 0, 0], "UpdateChaseCam must move the spectator camera");

player1.deadflag = 1;
player1.client!.killer_yaw = 123;
UpdateChaseCam(spectator4, runtime);
assert.equal(spectator4.client!.ps.pmove.pm_type, pmtype_t.PM_DEAD, "UpdateChaseCam must use PM_DEAD for dead targets");
assert.equal(spectator4.client!.ps.viewangles[ROLL], 40, "dead target chase roll mismatch");
assert.equal(spectator4.client!.ps.viewangles[PITCH], -15, "dead target chase pitch mismatch");
assert.equal(spectator4.client!.ps.viewangles[YAW], 123, "dead target chase yaw mismatch");

player1.deadflag = 0;
spectator4.client!.ps.pmove.pm_flags |= PMF_NO_PREDICTION;
player1.client!.resp.spectator = true;
player3.client!.resp.spectator = true;
UpdateChaseCam(spectator4, runtime);
assert.equal(spectator4.client!.chase_target, null, "UpdateChaseCam must clear chase target when no replacement exists");
assert.equal((spectator4.client!.ps.pmove.pm_flags & PMF_NO_PREDICTION) === 0, true, "UpdateChaseCam must restore prediction when chase ends");

player1.client!.resp.spectator = false;
player3.client!.resp.spectator = false;
spectator4.client!.chase_target = null;
spectator4.client!.update_chase = false;
GetChaseTarget(spectator4, runtime);
assert.equal(spectator4.client!.chase_target, player1, "GetChaseTarget must select the first non-spectator client");
assert.equal(spectator4.client!.update_chase, true, "GetChaseTarget must request chase update");

player1.client!.resp.spectator = true;
player3.client!.resp.spectator = true;
spectator4.client!.chase_target = null;
runtime.logEntries.length = 0;
GetChaseTarget(spectator4, runtime);
assert.equal(spectator4.client!.chase_target, null, "GetChaseTarget must leave target empty when none can be chased");
assert.equal(
  runtime.logEntries.some((entry) => entry.message.includes("No other players to chase.")),
  true,
  "GetChaseTarget must emit the no-target message"
);

console.log("quake2-g-chase: ok");

function createClientEntity(index: number, spectator: boolean): GameEntity {
  const entity = createRuntimeEntity({ classname: "player" }, index);
  entity.inuse = true;
  entity.health = 100;
  const client = attachGameClient(entity);
  client.resp.spectator = spectator;
  return entity;
}

function createPassThroughCollision() {
  return {
    world: {} as never,
    trace: (start: vec3_t, mins: vec3_t, maxs: vec3_t, end: vec3_t, passent: GameEntity | null, contentmask: number) => {
      assert.deepEqual(mins, [0, 0, 0], "UpdateChaseCam trace mins mismatch");
      assert.deepEqual(maxs, [0, 0, 0], "UpdateChaseCam trace maxs mismatch");
      assert.equal(passent, player1, "UpdateChaseCam trace passent mismatch");
      assert.equal(contentmask, MASK_SOLID, "UpdateChaseCam trace mask mismatch");
      return {
        allsolid: false,
        startsolid: false,
        fraction: 1,
        endpos: [...end],
        plane: {
          normal: [0, 0, 1] as vec3_t,
          dist: 0,
          type: 0,
          signbits: 0,
          pad: [0, 0]
        },
        surface: null,
        contents: 0,
        ent: null
      };
    },
    pointcontents: () => 0
  };
}
