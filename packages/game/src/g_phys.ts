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
  getRuntimeEntityLabel
} from "./runtime.js";
import type { GameEntity, GameRuntime } from "./runtime.js";

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
  pusher.origin = [
    pusher.origin[0] + move[0],
    pusher.origin[1] + move[1],
    pusher.origin[2] + move[2]
  ];
  pusher.angles = [
    pusher.angles[0] + amove[0],
    pusher.angles[1] + amove[1],
    pusher.angles[2] + amove[2]
  ];
  pusher.linkcount = (pusher.linkcount ?? 0) + 1;

  runtime.log({
    kind: "think",
    message: `${getRuntimeEntityLabel(pusher)} pushed to origin ${formatVec3(pusher.origin)} angles ${formatVec3(pusher.angles)}`,
    entityIndex: pusher.index,
    entityClassname: pusher.classname
  });

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

    part.blocked?.(part, ent, runtime);
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
