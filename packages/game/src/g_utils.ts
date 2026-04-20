/**
 * File: g_utils.ts
 * Source: Quake II original / game/g_utils.c
 * Purpose: Port the first gameplay utility routines required by Quake II door and trigger target resolution.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Searches by field name instead of C struct field offsets.
 * - Uses an explicit runtime object for entity storage, time and logging.
 *
 * Notes:
 * - This file is intended to stay close to the original C source.
 */

import {
  Think_Delay,
  freeGameEntity,
  getRuntimeEntityLabel,
  spawnGameEntity
} from "./runtime.js";
import type {
  GameEntity,
  GameEntityFieldName,
  GameRuntime
} from "./runtime.js";

/**
 * Original name: G_Find
 * Source: game/g_utils.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Searches active entities beginning just after `from` for the next matching string field.
 *
 * Porting notes:
 * - Uses named fields instead of `FOFS(...)` byte offsets.
 */
export function G_Find(
  runtime: GameRuntime,
  from: GameEntity | null,
  field: GameEntityFieldName,
  match: string
): GameEntity | null {
  let index = from ? from.index + 1 : 0;

  for (; index < runtime.entities.length; index += 1) {
    const candidate = runtime.entities[index];
    if (!candidate.inuse) {
      continue;
    }

    const value = candidate[field];
    if (typeof value !== "string") {
      continue;
    }

    if (equalsIgnoreCase(value, match)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Original name: G_UseTargets
 * Source: game/g_utils.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Fires `message`, `killtarget` and `target` chains from one activating entity.
 *
 * Porting notes:
 * - Logs the message branch instead of driving centerprint/sound side effects.
 * - Keeps delayed use through a temporary entity so later phases can reuse the same shape.
 */
export function G_UseTargets(runtime: GameRuntime, ent: GameEntity, activator: GameEntity | null): void {
  runtime.log({
    kind: "use-targets",
    message: `${getRuntimeEntityLabel(ent)} G_UseTargets activator=${getRuntimeEntityLabel(activator)}`,
    entityIndex: ent.index,
    entityClassname: ent.classname,
    otherIndex: activator?.index,
    otherClassname: activator?.classname
  });

  if (ent.delay) {
    const delayed = spawnGameEntity(runtime);
    delayed.classname = "DelayedUse";
    delayed.nextthink = runtime.time + ent.delay;
    delayed.think = Think_Delay;
    delayed.activator = activator;
    delayed.message = ent.message;
    delayed.target = ent.target;
    delayed.killtarget = ent.killtarget;

    runtime.log({
      kind: "delay-scheduled",
      message: `${getRuntimeEntityLabel(ent)} scheduled delayed use at ${delayed.nextthink.toFixed(3)}`,
      entityIndex: ent.index,
      entityClassname: ent.classname
    });
    return;
  }

  if (ent.message && activator) {
    runtime.log({
      kind: "message",
      message: `${getRuntimeEntityLabel(ent)} message -> ${getRuntimeEntityLabel(activator)} :: ${ent.message}`,
      entityIndex: ent.index,
      entityClassname: ent.classname,
      otherIndex: activator.index,
      otherClassname: activator.classname
    });
  }

  if (ent.killtarget) {
    let target: GameEntity | null = null;

    while ((target = G_Find(runtime, target, "targetname", ent.killtarget)) !== null) {
      runtime.log({
        kind: "killtarget",
        message: `${getRuntimeEntityLabel(ent)} killtarget -> ${getRuntimeEntityLabel(target)}`,
        entityIndex: ent.index,
        entityClassname: ent.classname,
        otherIndex: target.index,
        otherClassname: target.classname
      });
      freeGameEntity(runtime, target);

      if (!ent.inuse) {
        runtime.log({
          kind: "warning",
          message: "entity was removed while using killtargets",
          entityIndex: ent.index,
          entityClassname: ent.classname
        });
        return;
      }
    }
  }

  if (!ent.target) {
    return;
  }

  let target: GameEntity | null = null;
  while ((target = G_Find(runtime, target, "targetname", ent.target)) !== null) {
    if (
      equalsIgnoreCase(target.classname, "func_areaportal") &&
      (equalsIgnoreCase(ent.classname, "func_door") || equalsIgnoreCase(ent.classname, "func_door_rotating"))
    ) {
      continue;
    }

    runtime.log({
      kind: "fire-target",
      message: `${getRuntimeEntityLabel(ent)} target -> ${getRuntimeEntityLabel(target)}`,
      entityIndex: ent.index,
      entityClassname: ent.classname,
      otherIndex: target.index,
      otherClassname: target.classname
    });

    if (target === ent) {
      runtime.log({
        kind: "warning",
        message: "WARNING: Entity used itself.",
        entityIndex: ent.index,
        entityClassname: ent.classname
      });
    } else if (target.use) {
      target.use(target, ent, activator, runtime);
    }

    if (!ent.inuse) {
      runtime.log({
        kind: "warning",
        message: "entity was removed while using targets",
        entityIndex: ent.index,
        entityClassname: ent.classname
      });
      return;
    }
  }
}

/**
 * Original name: findradius
 * Source: game/g_utils.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns successive active solid entities whose origins lie within the requested spherical radius.
 *
 * Porting notes:
 * - Preserves the original `from` restart semantics instead of returning a prebuilt list.
 */
export function findradius(
  runtime: GameRuntime,
  from: GameEntity | null,
  origin: [number, number, number],
  radius: number
): GameEntity | null {
  let index = from ? from.index + 1 : 0;

  for (; index < runtime.entities.length; index += 1) {
    const entity = runtime.entities[index];
    if (!entity.inuse) {
      continue;
    }
    if (entity.solid === 0) {
      continue;
    }

    const eorg: [number, number, number] = [
      origin[0] - (entity.s.origin[0] + (entity.mins[0] + entity.maxs[0]) * 0.5),
      origin[1] - (entity.s.origin[1] + (entity.mins[1] + entity.maxs[1]) * 0.5),
      origin[2] - (entity.s.origin[2] + (entity.mins[2] + entity.maxs[2]) * 0.5)
    ];
    if (vectorLength(eorg) > radius) {
      continue;
    }

    return entity;
  }

  return null;
}

function equalsIgnoreCase(left: string, right: string): boolean {
  return left.localeCompare(right, undefined, { sensitivity: "accent", usage: "search" }) === 0;
}

/**
 * Category: New
 * Purpose: Compute one vector length for the strict `findradius` port.
 */
function vectorLength(vector: [number, number, number]): number {
  return Math.hypot(vector[0], vector[1], vector[2]);
}
