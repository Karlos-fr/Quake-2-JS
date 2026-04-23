/**
 * File: sound-public.ts
 * Source: Quake II original / client/sound.h
 * Purpose: Port the public Quake II client sound API exposed to the rest of the client runtime.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Uses an explicit hook/context bundle instead of process-global sound backends.
 * - Represents sample buffers with `Uint8Array` and nullable origins explicitly.
 *
 * Notes:
 * - This file is the principal attachment point for `client/sound.h`.
 */

import type { byte, qboolean, vec3_t } from "../../qcommon/src/index.js";
import type { sfx_t } from "./sound-local.js";

/**
 * Category: New
 * Purpose: Describe the host-side implementations for the public sound procedures declared by `client/sound.h`.
 *
 * Constraints:
 * - Must preserve the original split between lifecycle, playback, registration and entity-origin callback procedures.
 */
export interface ClientSoundPublicHooks {
  onInit?: () => void;
  onShutdown?: () => void;
  onStartSound?: (
    origin: vec3_t | null,
    entnum: number,
    entchannel: number,
    sfx: sfx_t | null,
    fvol: number,
    attenuation: number,
    timeofs: number
  ) => void;
  onStartLocalSound?: (name: string) => void;
  onRawSamples?: (samples: number, rate: number, width: number, channels: number, data: Uint8Array) => void;
  onStopAllSounds?: () => void;
  onUpdate?: (origin: vec3_t, forward: vec3_t, right: vec3_t, up: vec3_t) => void;
  onActivate?: (active: qboolean) => void;
  onBeginRegistration?: () => void;
  onRegisterSound?: (sample: string) => sfx_t | null;
  onEndRegistration?: () => void;
  onFindName?: (name: string, create: qboolean) => sfx_t | null;
  onGetEntitySoundOrigin?: (ent: number) => vec3_t;
}

export interface ClientSoundPublicContext {
  hooks: ClientSoundPublicHooks;
}

export function createClientSoundPublicContext(hooks: ClientSoundPublicHooks = {}): ClientSoundPublicContext {
  return { hooks };
}

export function S_Init(context: ClientSoundPublicContext): void {
  context.hooks.onInit?.();
}

export function S_Shutdown(context: ClientSoundPublicContext): void {
  context.hooks.onShutdown?.();
}

/**
 * Original name: S_StartSound
 * Source: client/sound.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Starts one spatialized or entity-following sound event.
 *
 * Porting notes:
 * - Uses `null` to represent the original nullable `vec3_t origin` pointer.
 */
export function S_StartSound(
  context: ClientSoundPublicContext,
  origin: vec3_t | null,
  entnum: number,
  entchannel: number,
  sfx: sfx_t | null,
  fvol: number,
  attenuation: number,
  timeofs: number
): void {
  context.hooks.onStartSound?.(origin, entnum, entchannel, sfx, fvol, attenuation, timeofs);
}

export function S_StartLocalSound(context: ClientSoundPublicContext, name: string): void {
  context.hooks.onStartLocalSound?.(name);
}

export function S_RawSamples(
  context: ClientSoundPublicContext,
  samples: number,
  rate: number,
  width: number,
  channels: number,
  data: Uint8Array
): void {
  context.hooks.onRawSamples?.(samples, rate, width, channels, data);
}

export function S_StopAllSounds(context: ClientSoundPublicContext): void {
  context.hooks.onStopAllSounds?.();
}

export function S_Update(
  context: ClientSoundPublicContext,
  origin: vec3_t,
  v_forward: vec3_t,
  v_right: vec3_t,
  v_up: vec3_t
): void {
  context.hooks.onUpdate?.(origin, v_forward, v_right, v_up);
}

export function S_Activate(context: ClientSoundPublicContext, active: qboolean): void {
  context.hooks.onActivate?.(active);
}

export function S_BeginRegistration(context: ClientSoundPublicContext): void {
  context.hooks.onBeginRegistration?.();
}

export function S_RegisterSound(context: ClientSoundPublicContext, sample: string): sfx_t | null {
  return context.hooks.onRegisterSound?.(sample) ?? null;
}

export function S_EndRegistration(context: ClientSoundPublicContext): void {
  context.hooks.onEndRegistration?.();
}

export function S_FindName(context: ClientSoundPublicContext, name: string, create: qboolean): sfx_t | null {
  return context.hooks.onFindName?.(name, create) ?? null;
}

/**
 * Original name: CL_GetEntitySoundOrigin
 * Source: client/sound.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Returns the current origin used to spatialize sounds emitted by one entity.
 *
 * Porting notes:
 * - Returns a copied vector or `[0, 0, 0]` when no hook is attached.
 */
export function CL_GetEntitySoundOrigin(context: ClientSoundPublicContext, ent: number, org: vec3_t): void {
  const origin = context.hooks.onGetEntitySoundOrigin?.(ent) ?? [0, 0, 0];
  org[0] = origin[0];
  org[1] = origin[1];
  org[2] = origin[2];
}

/**
 * Category: New
 * Purpose: Create a stable byte buffer used by `S_RawSamples` verification and adapters.
 *
 * Constraints:
 * - Must preserve raw byte payload identity without reinterpretation.
 */
export function createRawSampleBuffer(values: byte[] | Uint8Array): Uint8Array {
  return values instanceof Uint8Array ? new Uint8Array(values) : new Uint8Array(values);
}
