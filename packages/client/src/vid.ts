/**
 * File: vid.ts
 * Source: Quake II original / client/vid.h
 * Purpose: Port the public Quake II video-driver declarations used by the client runtime.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Uses an explicit state/context object instead of a C global.
 *
 * Notes:
 * - This file is the principal attachment point for `client/vid.h`.
 */

export type { vrect_t } from "./screen.js";

/**
 * Original name: viddef_t
 * Source: client/vid.h
 * Category: Ported
 * Fidelity level: Strict
 */
export interface viddef_t {
  width: number;
  height: number;
}

/**
 * Category: New
 * Purpose: Describe the host-side implementation hooks for the `VID_*` procedures declared by `client/vid.h`.
 *
 * Constraints:
 * - Must preserve the public split between initialization, shutdown, runtime changes and video menu entry points.
 */
export interface ClientVidHooks {
  onInit?: () => void;
  onShutdown?: () => void;
  onCheckChanges?: () => void;
  onMenuInit?: () => void;
  onMenuDraw?: () => void;
  onMenuKey?: (key: number) => string | null;
}

/**
 * Category: New
 * Purpose: Group the header-visible global video state with the pending `VID_*` implementation hooks.
 *
 * Constraints:
 * - Must keep the `viddef` global explicit and mutable.
 */
export interface ClientVidContext {
  viddef: viddef_t;
  hooks: ClientVidHooks;
}

export function createVidDef(): viddef_t {
  return {
    width: 0,
    height: 0
  };
}

export function createClientVidContext(hooks: ClientVidHooks = {}): ClientVidContext {
  return {
    viddef: createVidDef(),
    hooks
  };
}

export function VID_Init(context: ClientVidContext): void {
  context.hooks.onInit?.();
}

export function VID_Shutdown(context: ClientVidContext): void {
  context.hooks.onShutdown?.();
}

export function VID_CheckChanges(context: ClientVidContext): void {
  context.hooks.onCheckChanges?.();
}

export function VID_MenuInit(context: ClientVidContext): void {
  context.hooks.onMenuInit?.();
}

export function VID_MenuDraw(context: ClientVidContext): void {
  context.hooks.onMenuDraw?.();
}

export function VID_MenuKey(context: ClientVidContext, key: number): string | null {
  return context.hooks.onMenuKey?.(key) ?? null;
}
