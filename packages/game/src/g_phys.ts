/**
 * File: g_phys.ts
 * Source: Quake II original / game/g_phys.c
 * Purpose: Port the first pusher-frame runtime needed by moving Quake II brush entities.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - `SV_Push` currently applies pusher movement without full dynamic obstruction resolution or rollback.
 * - The runtime has no `gi.linkentity`, so world-link side effects are reduced to origin/angle updates plus `linkcount`.
 *
 * Notes:
 * - This file is intended to stay close to the original pusher/think frame flow.
 */

import {
  FL_TEAMSLAVE,
  FRAMETIME,
  MOVETYPE_NONE,
  MOVETYPE_PUSH,
  SOLID_NOT,
  getRuntimeEntityLabel
} from "./runtime.js";
import type { GameEntity, GameRuntime } from "./runtime.js";
import { AngleVectors, MASK_SOLID, type trace_t } from "../../qcommon/src/index.js";
import { DotProduct } from "../../math/src/index.js";
import { linkGameEntity } from "./runtime.js";
import { touchTriggerEntities } from "./touch.js";

/**
 * Category: New
 * Purpose: Preserve the rollback state recorded for each entity moved during one pusher step.
 *
 * Constraints:
 * - Must capture enough state to restore failed pushes deterministically.
 */
interface pushed_t {
  ent: GameEntity;
  origin: [number, number, number];
  angles: [number, number, number];
  groundentity: GameEntity | null;
  groundentity_linkcount: number;
}

let obstacle: GameEntity | null = null;

/**
 * Original name: SV_RunThink
 * Source: game/g_phys.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Runs one entity `think` callback if it is due for the current frame time.
 */
export function SV_RunThink(ent: GameEntity, runtime: GameRuntime): boolean {
  const thinktime = ent.nextthink;
  if (thinktime <= 0) {
    return true;
  }
  if (thinktime > runtime.time + 0.001) {
    return true;
  }

  ent.nextthink = 0;
  const think = ent.think;
  ent.think = undefined;
  if (!think) {
    throw new Error(`SV_RunThink: NULL ent.think for ${getRuntimeEntityLabel(ent)}`);
  }

  runtime.log({
    kind: "think",
    message: `${getRuntimeEntityLabel(ent)} think`,
    entityIndex: ent.index,
    entityClassname: ent.classname
  });
  think(ent, runtime);
  return false;
}

/**
 * Original name: SV_TestEntityPosition
 * Source: game/g_phys.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Tests whether one entity currently starts inside any blocking solid.
 *
 * Porting notes:
 * - Returns the runtime worldspawn entity when blocked, matching the original sentinel-style usage.
 */
export function SV_TestEntityPosition(ent: GameEntity, runtime: GameRuntime): GameEntity | null {
  if (!runtime.collision) {
    throw new Error("SV_TestEntityPosition requires runtime collision bridge");
  }

  const mask = ent.clipmask || MASK_SOLID;
  const trace = runtime.collision.trace(ent.origin, ent.mins, ent.maxs, ent.origin, ent, mask);
  if (trace.startsolid) {
    return runtime.entities[0] ?? ent;
  }

  return null;
}

/**
 * Original name: SV_Impact
 * Source: game/g_phys.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Dispatches touch callbacks for both entities involved in one blocking trace.
 *
 * Porting notes:
 * - The current touch signature still omits plane and surface arguments.
 */
export function SV_Impact(e1: GameEntity, trace: trace_t, runtime: GameRuntime): void {
  const e2 = asGameEntity(trace.ent);
  if (!e2) {
    return;
  }

  if (e1.touch && e1.solid !== SOLID_NOT) {
    e1.touch(e1, e2, runtime);
  }

  if (e2.touch && e2.solid !== SOLID_NOT) {
    e2.touch(e2, e1, runtime);
  }
}

/**
 * Original name: SV_PushEntity
 * Source: game/g_phys.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Moves one entity through the gameplay collision bridge without mutating its velocity.
 *
 * Porting notes:
 * - Re-links the entity after each move attempt and retries when the impacted entity disappears.
 */
export function SV_PushEntity(ent: GameEntity, push: [number, number, number], runtime: GameRuntime): trace_t {
  if (!runtime.collision) {
    throw new Error("SV_PushEntity requires runtime collision bridge");
  }

  const start: [number, number, number] = [...ent.origin];
  const end: [number, number, number] = [
    start[0] + push[0],
    start[1] + push[1],
    start[2] + push[2]
  ];

  for (;;) {
    const mask = ent.clipmask || MASK_SOLID;
    const trace = runtime.collision.trace(start, ent.mins, ent.maxs, end, ent, mask);

    ent.origin = [...trace.endpos];
    linkGameEntity(runtime, ent);

    if (trace.fraction !== 1.0) {
      SV_Impact(ent, trace, runtime);

      const impacted = asGameEntity(trace.ent);
      if (impacted && !impacted.inuse && ent.inuse) {
        ent.origin = [...start];
        linkGameEntity(runtime, ent);
        continue;
      }
    }

    if (ent.inuse) {
      touchTriggerEntities(runtime, ent);
    }

    return trace;
  }
}

/**
 * Original name: SV_Push
 * Source: game/g_phys.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Applies one pusher translation/rotation step for the current server frame.
 *
 * Porting notes:
 * - Dynamic obstruction resolution is deferred until collision-backed gameplay entities exist in this runtime.
 */
export function SV_Push(pusher: GameEntity, move: [number, number, number], amove: [number, number, number], runtime: GameRuntime): boolean {
  const pushed: pushed_t[] = [];
  const clampedMove = clampPushMove(move);
  const mins: [number, number, number] = [
    pusher.absmin[0] + clampedMove[0],
    pusher.absmin[1] + clampedMove[1],
    pusher.absmin[2] + clampedMove[2]
  ];
  const maxs: [number, number, number] = [
    pusher.absmax[0] + clampedMove[0],
    pusher.absmax[1] + clampedMove[1],
    pusher.absmax[2] + clampedMove[2]
  ];
  const inverseAmove: [number, number, number] = [-amove[0], -amove[1], -amove[2]];
  const rotationBasis = AngleVectors(inverseAmove);

  obstacle = null;
  pushed.push(capturePushedState(pusher));

  pusher.origin = addVec3(pusher.origin, clampedMove);
  pusher.angles = addVec3(pusher.angles, amove);
  linkGameEntity(runtime, pusher);

  for (const check of runtime.entities) {
    if (!check.inuse || check === pusher) {
      continue;
    }

    if (check.solid === SOLID_NOT) {
      continue;
    }

    if (check.movetype === MOVETYPE_PUSH || check.movetype === MOVETYPE_NONE) {
      continue;
    }

    if (!check.linked) {
      continue;
    }

    if (check.groundentity !== pusher) {
      if (
        check.absmin[0] >= maxs[0] ||
        check.absmin[1] >= maxs[1] ||
        check.absmin[2] >= maxs[2] ||
        check.absmax[0] <= mins[0] ||
        check.absmax[1] <= mins[1] ||
        check.absmax[2] <= mins[2]
      ) {
        continue;
      }

      if (!SV_TestEntityPosition(check, runtime)) {
        continue;
      }
    }

    pushed.push(capturePushedState(check));

    check.origin = addVec3(check.origin, clampedMove);
    const move2 = rotateEntityByPusher(check, pusher, rotationBasis.forward, rotationBasis.right, rotationBasis.up);
    check.origin = addVec3(check.origin, move2);

    if (check.groundentity !== pusher) {
      check.groundentity = null;
    }

    let block = SV_TestEntityPosition(check, runtime);
    if (!block) {
      linkGameEntity(runtime, check);
      continue;
    }

    check.origin = subtractVec3(check.origin, clampedMove);
    block = SV_TestEntityPosition(check, runtime);
    if (!block) {
      pushed.pop();
      linkGameEntity(runtime, check);
      continue;
    }

    obstacle = check;
    rollbackPush(pushed, runtime);
    return false;
  }

  runtime.log({
    kind: "think",
    message: `${getRuntimeEntityLabel(pusher)} pushed to origin ${formatVec3(pusher.origin)} angles ${formatVec3(pusher.angles)}`,
    entityIndex: pusher.index,
    entityClassname: pusher.classname
  });

  for (let index = pushed.length - 1; index >= 0; index -= 1) {
    touchTriggerEntities(runtime, pushed[index].ent);
  }

  return true;
}

/**
 * Original name: SV_Physics_Pusher
 * Source: game/g_phys.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Advances one pusher entity or pusher team for the current server frame and then runs due thinks.
 */
export function SV_Physics_Pusher(ent: GameEntity, runtime: GameRuntime): void {
  if ((ent.flags & FL_TEAMSLAVE) !== 0) {
    return;
  }

  let part: GameEntity | null = ent;
  for (; part; part = part.teamchain) {
    if (!hasMovement(part)) {
      continue;
    }

    const move = scaleVec3(part.velocity, FRAMETIME);
    const amove = scaleVec3(part.avelocity, FRAMETIME);
    if (!SV_Push(part, move, amove, runtime)) {
      break;
    }
  }

  if (part) {
    for (let member: GameEntity | null = ent; member; member = member.teamchain) {
      if (member.nextthink > 0) {
        member.nextthink += FRAMETIME;
      }
    }

    if (obstacle) {
      part.blocked?.(part, obstacle, runtime);
    }
    return;
  }

  for (let member: GameEntity | null = ent; member; member = member.teamchain) {
    SV_RunThink(member, runtime);
  }
}

/**
 * Category: New
 * Purpose: Execute the no-physics branch used by simple thinker entities.
 */
export function SV_Physics_None(ent: GameEntity, runtime: GameRuntime): void {
  SV_RunThink(ent, runtime);
}

/**
 * Original name: G_RunEntity
 * Source: game/g_phys.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Dispatches one entity to the physics branch matching its current `movetype`.
 */
export function G_RunEntity(ent: GameEntity, runtime: GameRuntime): void {
  switch (ent.movetype) {
    case MOVETYPE_PUSH:
      SV_Physics_Pusher(ent, runtime);
      break;
    case MOVETYPE_NONE:
      SV_Physics_None(ent, runtime);
      break;
    default:
      SV_Physics_None(ent, runtime);
      break;
  }
}

/**
 * Category: New
 * Purpose: Advance the local gameplay runtime by one Quake II server frame.
 *
 * Constraints:
 * - Must run all active entities at the new frame time.
 */
export function G_RunFrame(runtime: GameRuntime): void {
  runtime.time += FRAMETIME;

  for (const ent of runtime.entities) {
    if (!ent.inuse) {
      continue;
    }

    runtime.current_entity = ent;
    G_RunEntity(ent, runtime);
  }

  runtime.current_entity = null;
}

/**
 * Category: New
 * Purpose: Advance the local gameplay runtime up to one target time using fixed Quake II server frames.
 *
 * Constraints:
 * - Must never skip a full frame between executed pusher updates.
 */
export function runGameFrames(runtime: GameRuntime, upToTime: number, beforeFrame?: (runtime: GameRuntime) => void): void {
  while ((runtime.time + FRAMETIME) <= (upToTime + 0.0001)) {
    beforeFrame?.(runtime);
    G_RunFrame(runtime);
  }
}

/**
 * Category: New
 * Purpose: Test whether one entity currently carries linear or angular movement for pusher execution.
 */
function hasMovement(entity: GameEntity): boolean {
  return !isZeroVec3(entity.velocity) || !isZeroVec3(entity.avelocity);
}

/**
 * Category: New
 * Purpose: Multiply one vector by a scalar without mutating the source.
 */
function scaleVec3(vector: [number, number, number], scalar: number): [number, number, number] {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

/**
 * Category: New
 * Purpose: Detect a zero vector for lightweight physics branching.
 */
function isZeroVec3(vector: [number, number, number]): boolean {
  return vector[0] === 0 && vector[1] === 0 && vector[2] === 0;
}

/**
 * Category: New
 * Purpose: Format one vector compactly for verification logs.
 */
function formatVec3(vector: [number, number, number]): string {
  return `${vector[0].toFixed(3)},${vector[1].toFixed(3)},${vector[2].toFixed(3)}`;
}

/**
 * Category: New
 * Purpose: Clamp one pusher translation to 1/8 unit increments for prediction-safe movement.
 */
function clampPushMove(move: [number, number, number]): [number, number, number] {
  return [
    clampPushAxis(move[0]),
    clampPushAxis(move[1]),
    clampPushAxis(move[2])
  ];
}

/**
 * Category: New
 * Purpose: Clamp one scalar push axis to the original Quake II 1/8 unit grid.
 */
function clampPushAxis(value: number): number {
  let temp = value * 8.0;
  if (temp > 0.0) {
    temp += 0.5;
  } else {
    temp -= 0.5;
  }

  return 0.125 * Math.trunc(temp);
}

/**
 * Category: New
 * Purpose: Snapshot one moved entity before a pusher step so failed pushes can roll back.
 */
function capturePushedState(ent: GameEntity): pushed_t {
  return {
    ent,
    origin: [...ent.origin],
    angles: [...ent.angles],
    groundentity: ent.groundentity,
    groundentity_linkcount: ent.groundentity_linkcount
  };
}

/**
 * Category: New
 * Purpose: Restore all entities moved during one failed pusher step in reverse order.
 */
function rollbackPush(pushed: pushed_t[], runtime: GameRuntime): void {
  for (let index = pushed.length - 1; index >= 0; index -= 1) {
    const state = pushed[index];
    state.ent.origin = [...state.origin];
    state.ent.angles = [...state.angles];
    state.ent.groundentity = state.groundentity;
    state.ent.groundentity_linkcount = state.groundentity_linkcount;
    linkGameEntity(runtime, state.ent);
  }
}

/**
 * Category: New
 * Purpose: Apply the pusher angular compensation used to carry riders around rotating brush models.
 */
function rotateEntityByPusher(
  check: GameEntity,
  pusher: GameEntity,
  forward: [number, number, number],
  right: [number, number, number],
  up: [number, number, number]
): [number, number, number] {
  const org = subtractVec3(check.origin, pusher.origin);
  const org2: [number, number, number] = [
    DotProduct(org, forward),
    -DotProduct(org, right),
    DotProduct(org, up)
  ];

  return subtractVec3(org2, org);
}

/**
 * Category: New
 * Purpose: Add two vectors without mutating either input.
 */
function addVec3(left: [number, number, number], right: [number, number, number]): [number, number, number] {
  return [left[0] + right[0], left[1] + right[1], left[2] + right[2]];
}

/**
 * Category: New
 * Purpose: Subtract two vectors without mutating either input.
 */
function subtractVec3(left: [number, number, number], right: [number, number, number]): [number, number, number] {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

/**
 * Category: New
 * Purpose: Narrow one trace entity payload to the gameplay entity runtime shape when possible.
 */
function asGameEntity(value: unknown): GameEntity | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (!("inuse" in value) || !("classname" in value)) {
    return null;
  }

  return value as GameEntity;
}
