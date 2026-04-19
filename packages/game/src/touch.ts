/**
 * File: touch.ts
 * Purpose: Dispatch Quake II style trigger touch callbacks against the current gameplay runtime.
 *
 * This file is not a direct source port.
 * It is a small runtime helper that bridges entity bounds to the ported `touch` callbacks.
 *
 * Dependencies:
 * - packages/game/src/runtime.ts
 */

import type { GameEntity, GameRuntime } from "./runtime.js";

/**
 * Category: New
 * Purpose: Invoke every trigger `touch` callback whose bounds overlap the provided actor.
 *
 * Constraints:
 * - Must stay conservative and only touch entities that expose a `touch` callback.
 * - Must preserve runtime entity order.
 */
export function touchTriggerEntities(runtime: GameRuntime, actor: GameEntity): void {
  const actorBounds = getActorBounds(actor);
  if (!actorBounds) {
    return;
  }

  for (const entity of runtime.entities) {
    if (!entity.inuse || !entity.touch) {
      continue;
    }

    const triggerBounds = getTriggerBounds(entity);
    if (!triggerBounds) {
      continue;
    }

    if (!boundsOverlap(actorBounds.mins, actorBounds.maxs, triggerBounds.mins, triggerBounds.maxs)) {
      continue;
    }

    entity.touch(entity, actor, runtime);
  }
}

/**
 * Category: New
 * Purpose: Convert one actor entity into absolute world bounds using Quake-style relative mins/maxs.
 */
function getActorBounds(actor: GameEntity): { mins: [number, number, number]; maxs: [number, number, number] } | null {
  if (!hasNonZeroExtents(actor.mins, actor.maxs)) {
    return null;
  }

  return {
    mins: [
      actor.origin[0] + actor.mins[0],
      actor.origin[1] + actor.mins[1],
      actor.origin[2] + actor.mins[2]
    ],
    maxs: [
      actor.origin[0] + actor.maxs[0],
      actor.origin[1] + actor.maxs[1],
      actor.origin[2] + actor.maxs[2]
    ]
  };
}

/**
 * Category: New
 * Purpose: Resolve one trigger entity to absolute bounds.
 *
 * Constraints:
 * - BSP inline trigger models already expose absolute world mins/maxs.
 * - Runtime-only helper triggers without bounds are ignored.
 */
function getTriggerBounds(entity: GameEntity): { mins: [number, number, number]; maxs: [number, number, number] } | null {
  if (!hasNonZeroExtents(entity.mins, entity.maxs)) {
    return null;
  }

  if (entity.model?.startsWith("*")) {
    return {
      mins: [...entity.mins],
      maxs: [...entity.maxs]
    };
  }

  return {
    mins: [
      entity.origin[0] + entity.mins[0],
      entity.origin[1] + entity.mins[1],
      entity.origin[2] + entity.mins[2]
    ],
    maxs: [
      entity.origin[0] + entity.maxs[0],
      entity.origin[1] + entity.maxs[1],
      entity.origin[2] + entity.maxs[2]
    ]
  };
}

/**
 * Category: New
 * Purpose: Test whether two axis-aligned world bounds overlap.
 */
function boundsOverlap(
  leftMins: [number, number, number],
  leftMaxs: [number, number, number],
  rightMins: [number, number, number],
  rightMaxs: [number, number, number]
): boolean {
  return !(
    leftMaxs[0] <= rightMins[0] ||
    leftMins[0] >= rightMaxs[0] ||
    leftMaxs[1] <= rightMins[1] ||
    leftMins[1] >= rightMaxs[1] ||
    leftMaxs[2] <= rightMins[2] ||
    leftMins[2] >= rightMaxs[2]
  );
}

/**
 * Category: New
 * Purpose: Reject empty placeholder bounds so only meaningful trigger volumes participate.
 */
function hasNonZeroExtents(mins: [number, number, number], maxs: [number, number, number]): boolean {
  return mins[0] !== maxs[0] || mins[1] !== maxs[1] || mins[2] !== maxs[2];
}
