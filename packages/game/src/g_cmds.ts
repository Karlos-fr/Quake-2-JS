/**
 * File: g_cmds.ts
 * Source: Quake II original / game/g_cmds.c
 * Purpose: Port of the first inventory-selection command helpers tied to spectator chase mode.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Focuses on the selection helpers currently needed by the gameplay runtime.
 *
 * Notes:
 * - This file is intended to stay close to the original C source.
 */

import { MAX_ITEMS } from "../../qcommon/src/index.js";
import { IT_POWERUP, IT_WEAPON } from "./g-local.js";
import { ChaseNext, ChasePrev } from "./g_chase.js";
import { GetItemByIndex } from "./g_items.js";
import type { GameEntity, GameRuntime } from "./runtime.js";

/**
 * Original name: SelectNextItem
 * Source: game/g_cmds.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Advances the currently selected inventory item to the next usable entry matching `itflags`.
 */
export function SelectNextItem(ent: GameEntity, itflags: number, runtime: GameRuntime): void {
  const cl = ent.client;
  if (!cl) {
    return;
  }

  if (cl.chase_target) {
    ChaseNext(ent, runtime);
    return;
  }

  for (let i = 1; i <= MAX_ITEMS; i += 1) {
    const index = (cl.pers.selected_item + i) % MAX_ITEMS;
    if (!cl.pers.inventory[index]) {
      continue;
    }

    const it = GetItemByIndex(index);
    if (!it?.use) {
      continue;
    }
    if ((it.flags & itflags) === 0) {
      continue;
    }

    cl.pers.selected_item = index;
    return;
  }

  cl.pers.selected_item = -1;
}

/**
 * Original name: SelectPrevItem
 * Source: game/g_cmds.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Moves the selected inventory item backward to the previous usable entry matching `itflags`.
 */
export function SelectPrevItem(ent: GameEntity, itflags: number, runtime: GameRuntime): void {
  const cl = ent.client;
  if (!cl) {
    return;
  }

  if (cl.chase_target) {
    ChasePrev(ent, runtime);
    return;
  }

  for (let i = 1; i <= MAX_ITEMS; i += 1) {
    const index = (cl.pers.selected_item + MAX_ITEMS - i) % MAX_ITEMS;
    if (!cl.pers.inventory[index]) {
      continue;
    }

    const it = GetItemByIndex(index);
    if (!it?.use) {
      continue;
    }
    if ((it.flags & itflags) === 0) {
      continue;
    }

    cl.pers.selected_item = index;
    return;
  }

  cl.pers.selected_item = -1;
}

/**
 * Original name: ValidateSelectedItem
 * Source: game/g_cmds.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Ensures the currently selected item is still present, otherwise selects the next valid item.
 */
export function ValidateSelectedItem(ent: GameEntity, runtime: GameRuntime): void {
  const cl = ent.client;
  if (!cl) {
    return;
  }

  if (cl.pers.selected_item >= 0 && cl.pers.inventory[cl.pers.selected_item]) {
    return;
  }

  SelectNextItem(ent, -1, runtime);
}

export { IT_POWERUP, IT_WEAPON };
