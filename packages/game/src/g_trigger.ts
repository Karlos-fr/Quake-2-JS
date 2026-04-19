/**
 * File: g_trigger.ts
 * Source: Quake II original / game/g_trigger.c
 * Purpose: Port the first trigger entities required by Quake II door and platform activation chains.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Omits geometry linking and directional movedir checks for now.
 * - Uses explicit runtime entity fields instead of full edict/world integration.
 *
 * Notes:
 * - This file is intended to stay close to the original trigger flow.
 */

import { G_UseTargets } from "./g_utils.js";
import {
  FRAMETIME,
  MOVETYPE_NONE,
  SOLID_NOT,
  SOLID_TRIGGER,
  SVF_MONSTER,
  SVF_NOCLIENT,
  freeGameEntity,
  getRuntimeEntityLabel
} from "./runtime.js";
import { G_TouchSolids } from "./touch.js";
import type { GameEntity, GameRuntime } from "./runtime.js";

/**
 * Original name: multi_wait
 * Source: game/g_trigger.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Clears the trigger cooldown so a repeatable trigger can fire again.
 */
export function multi_wait(ent: GameEntity, _runtime: GameRuntime): void {
  ent.nextthink = 0;
}

/**
 * Original name: multi_trigger
 * Source: game/g_trigger.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Fires one multi trigger, then either rearms it after `wait` or frees it on the next frame.
 */
export function multi_trigger(ent: GameEntity, runtime: GameRuntime): void {
  if (ent.nextthink) {
    return;
  }

  G_UseTargets(runtime, ent, ent.activator);

  if (ent.wait > 0) {
    ent.think = multi_wait;
    ent.nextthink = runtime.time + ent.wait;
    return;
  }

  ent.touch = undefined;
  ent.nextthink = runtime.time + FRAMETIME;
  ent.think = freeTriggerEntity;
}

/**
 * Original name: Use_Multi
 * Source: game/g_trigger.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Activates one multi trigger through its explicit `use` path.
 */
export function Use_Multi(ent: GameEntity, _other: GameEntity | null, activator: GameEntity | null, runtime: GameRuntime): void {
  ent.activator = activator;
  multi_trigger(ent, runtime);
}

/**
 * Original name: Touch_Multi
 * Source: game/g_trigger.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Activates one multi trigger when touched by an eligible player or monster.
 *
 * Porting notes:
 * - Directional movedir filtering is intentionally deferred.
 */
export function Touch_Multi(self: GameEntity, other: GameEntity, runtime: GameRuntime): void {
  if (other.client) {
    if ((self.spawnflags & 2) !== 0) {
      return;
    }
  } else if ((other.svflags & SVF_MONSTER) !== 0) {
    if ((self.spawnflags & 1) === 0) {
      return;
    }
  } else {
    return;
  }

  self.activator = other;
  multi_trigger(self, runtime);
}

/**
 * Original name: trigger_enable
 * Source: game/g_trigger.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Enables a previously disabled trigger and reconnects its `use` path.
 */
export function trigger_enable(self: GameEntity, _other: GameEntity | null, _activator: GameEntity | null, runtime: GameRuntime): void {
  self.solid = SOLID_TRIGGER;
  self.use = Use_Multi;
  G_TouchSolids(runtime, self);
  runtime.log({
    kind: "use",
    message: `${getRuntimeEntityLabel(self)} enabled`,
    entityIndex: self.index,
    entityClassname: self.classname
  });
}

/**
 * Original name: SP_trigger_multiple
 * Source: game/g_trigger.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Initializes one repeatable trigger volume from BSP entity properties.
 */
export function SP_trigger_multiple(ent: GameEntity, _runtime: GameRuntime): void {
  if (!ent.wait) {
    ent.wait = 0.2;
  }

  ent.touch = Touch_Multi;
  ent.movetype = MOVETYPE_NONE;
  ent.svflags |= SVF_NOCLIENT;

  if ((ent.spawnflags & 4) !== 0) {
    ent.solid = SOLID_NOT;
    ent.use = trigger_enable;
  } else {
    ent.solid = SOLID_TRIGGER;
    ent.use = Use_Multi;
  }
}

/**
 * Original name: SP_trigger_once
 * Source: game/g_trigger.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Initializes a single-use trigger by reusing `trigger_multiple` with `wait = -1`.
 */
export function SP_trigger_once(ent: GameEntity, runtime: GameRuntime): void {
  if ((ent.spawnflags & 1) !== 0) {
    runtime.log({
      kind: "warning",
      message: `${getRuntimeEntityLabel(ent)} fixed legacy TRIGGERED flag from bit 1 to bit 4`,
      entityIndex: ent.index,
      entityClassname: ent.classname
    });
    ent.spawnflags &= ~1;
    ent.spawnflags |= 4;
  }

  ent.wait = -1;
  SP_trigger_multiple(ent, runtime);
}

/**
 * Original name: trigger_relay_use
 * Source: game/g_trigger.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Forwards activation directly to the relay's linked targets.
 */
export function trigger_relay_use(self: GameEntity, _other: GameEntity | null, activator: GameEntity | null, runtime: GameRuntime): void {
  G_UseTargets(runtime, self, activator);
}

/**
 * Original name: SP_trigger_relay
 * Source: game/g_trigger.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Initializes a relay trigger that can only be activated through `use`.
 */
export function SP_trigger_relay(self: GameEntity, _runtime: GameRuntime): void {
  self.use = trigger_relay_use;
  self.solid = SOLID_NOT;
}

/**
 * Category: New
 * Purpose: Free a trigger entity after the deferred one-frame removal used by Quake II touch loops.
 */
function freeTriggerEntity(self: GameEntity, runtime: GameRuntime): void {
  freeGameEntity(runtime, self);
}
