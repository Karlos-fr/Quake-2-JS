/**
 * File: snd_loc.ts
 * Source: Quake II original / client/snd_loc.h
 * Purpose: Port the private Quake II sound mixing declarations shared across the client sound subsystem.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Uses explicit state objects and hook-based procedure forwarding instead of C globals and direct DMA backends.
 * - Represents variable-sized sample data with `Uint8Array`.
 *
 * Notes:
 * - This file is the principal attachment point for `client/snd_loc.h`.
 */

import type { cvar_t, qboolean, vec3_t, vec_t } from "../../qcommon/src/index.js";
import { MAX_QPATH } from "../../qcommon/src/index.js";
import {
  GetWavinfo as GetWavinfo_Impl,
  S_LoadSound as S_LoadSound_Impl
} from "./snd_mem.js";
import {
  type ClientSoundMixState,
  S_InitScaletable as S_InitScaletable_Impl,
  S_PaintChannels as S_PaintChannels_Impl,
  createClientSoundMixState
} from "./snd_mix.js";

export const MAX_CHANNELS = 32;
export const MAX_RAW_SAMPLES = 8192;

/**
 * Original name: portable_samplepair_t
 * Source: client/snd_loc.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Stores one mixed stereo sample pair in the portable paint/raw sample buffers.
 */
export interface portable_samplepair_t {
  left: number;
  right: number;
}

/**
 * Original name: sfxcache_t
 * Source: client/snd_loc.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Stores one decoded sound effect cache block and its PCM payload.
 *
 * Porting notes:
 * - Uses a `Uint8Array` for the variable-sized `data[1]` tail.
 */
export interface sfxcache_t {
  length: number;
  loopstart: number;
  speed: number;
  width: number;
  stereo: number;
  data: Uint8Array;
}

/**
 * Original name: sfx_t
 * Source: client/snd_loc.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Tracks one registered sound effect, its decoded cache, and optional alias target.
 *
 * Porting notes:
 * - `name[MAX_QPATH]` and `truename` are represented as strings; `cache` remains nullable like the C pointer.
 */
export interface sfx_t {
  name: string;
  registration_sequence: number;
  cache: sfxcache_t | null;
  truename: string | null;
}

/**
 * Original name: playsound_t
 * Source: client/snd_loc.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Describes one scheduled playsound waiting to be assigned to a mixer channel.
 *
 * Porting notes:
 * - Replaces linked-list pointers with nullable object references.
 */
export interface playsound_t {
  prev: playsound_t | null;
  next: playsound_t | null;
  sfx: sfx_t | null;
  volume: number;
  attenuation: number;
  entnum: number;
  entchannel: number;
  fixed_origin: qboolean;
  origin: vec3_t;
  begin: number;
}

/**
 * Original name: dma_t
 * Source: client/snd_loc.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Describes the active DMA-style output buffer and playback cursor used by the mixer.
 *
 * Porting notes:
 * - `buffer` is a nullable `Uint8Array` owned by the host DMA adapter.
 */
export interface dma_t {
  channels: number;
  samples: number;
  submission_chunk: number;
  samplepos: number;
  samplebits: number;
  speed: number;
  buffer: Uint8Array | null;
}

/**
 * Original name: channel_t
 * Source: client/snd_loc.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Stores one active mixer channel, including volume, entity ownership, origin and loop/autosound state.
 *
 * Porting notes:
 * - Pointer fields are nullable object references; vector fields preserve the Quake numeric tuple layout.
 */
export interface channel_t {
  sfx: sfx_t | null;
  leftvol: number;
  rightvol: number;
  end: number;
  pos: number;
  looping: number;
  entnum: number;
  entchannel: number;
  origin: vec3_t;
  dist_mult: vec_t;
  master_vol: number;
  fixed_origin: qboolean;
  autosound: qboolean;
}

/**
 * Original name: wavinfo_t
 * Source: client/snd_loc.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Carries parsed WAV metadata returned by `GetWavinfo` and consumed by `S_LoadSound`.
 */
export interface wavinfo_t {
  rate: number;
  width: number;
  channels: number;
  loopstart: number;
  samples: number;
  dataofs: number;
}

/**
 * Category: New
 * Purpose: Group the public `snd_loc.h` globals in one explicit client sound-local state object.
 *
 * Constraints:
 * - Must preserve the original split between mixer channels, listener state, DMA state, raw sample ring and sound cvar references.
 */
export interface ClientSoundLocalState {
  channels: channel_t[];
  paintedtime: number;
  s_rawend: number;
  listener_origin: vec3_t;
  listener_forward: vec3_t;
  listener_right: vec3_t;
  listener_up: vec3_t;
  dma: dma_t;
  mix: ClientSoundMixState;
  s_pendingplays: playsound_t;
  s_rawsamples: portable_samplepair_t[];
  s_volume: cvar_t | null;
  s_nosound: cvar_t | null;
  s_loadas8bit: cvar_t | null;
  s_khz: cvar_t | null;
  s_show: cvar_t | null;
  s_mixahead: cvar_t | null;
  s_testsound: cvar_t | null;
  s_primary: cvar_t | null;
}

/**
 * Category: New
 * Purpose: Describe the host-side implementations for the private sound procedures declared by `snd_loc.h`.
 *
 * Constraints:
 * - Must keep the low-level DMA and mixer procedure boundaries explicit until the corresponding C files are ported.
 */
export interface ClientSoundLocalHooks {
  onSNDDMA_Init?: () => qboolean;
  onSNDDMA_GetDMAPos?: () => number;
  onSNDDMA_Shutdown?: () => void;
  onSNDDMA_BeginPainting?: () => void;
  onSNDDMA_Submit?: () => void;
  onFS_LoadFile?: (path: string) => Uint8Array | null | undefined;
  onFS_FreeFile?: (buffer: Uint8Array) => void;
  onComPrintf?: (message: string) => void;
  onComDPrintf?: (message: string) => void;
  onComError?: (code: number, message: string) => never;
  onGetWavinfo?: (name: string, wav: Uint8Array, wavlength: number) => wavinfo_t;
  onS_InitScaletable?: () => void;
  onS_LoadSound?: (sfx: sfx_t) => sfxcache_t | null;
  onS_IssuePlaysound?: (ps: playsound_t) => void;
  onS_PaintChannels?: (endtime: number) => void;
  onS_PickChannel?: (entnum: number, entchannel: number) => channel_t | null;
  onS_Spatialize?: (channel: channel_t) => void;
}

export interface ClientSoundLocalContext {
  state: ClientSoundLocalState;
  hooks: ClientSoundLocalHooks;
}

/**
 * Original name: portable_samplepair_t zero-initialization
 * Source: client/snd_loc.h
 * Category: Adapter
 * Fidelity level: Strict
 *
 * Behavior:
 * - Creates the TypeScript equivalent of a zeroed C `portable_samplepair_t`.
 */
export function createPortableSamplePair(): portable_samplepair_t {
  return { left: 0, right: 0 };
}

/**
 * Original name: sfxcache_t zero-initialization
 * Source: client/snd_loc.h
 * Category: Adapter
 * Fidelity level: Close
 *
 * Behavior:
 * - Creates an empty sound cache block with Quake-compatible scalar defaults.
 *
 * Porting notes:
 * - Uses an empty `Uint8Array` until `S_LoadSound` installs decoded PCM bytes.
 */
export function createSfxCache(): sfxcache_t {
  return {
    length: 0,
    loopstart: -1,
    speed: 0,
    width: 0,
    stereo: 0,
    data: new Uint8Array(0)
  };
}

/**
 * Original name: sfx_t zero-initialization
 * Source: client/snd_loc.h
 * Category: Adapter
 * Fidelity level: Close
 *
 * Behavior:
 * - Creates an unregistered sound effect record with null pointer fields.
 */
export function createSfx(): sfx_t {
  return {
    name: "",
    registration_sequence: 0,
    cache: null,
    truename: null
  };
}

/**
 * Original name: playsound_t zero-initialization
 * Source: client/snd_loc.h
 * Category: Adapter
 * Fidelity level: Close
 *
 * Behavior:
 * - Creates an empty scheduled playsound node suitable for pending/free linked lists.
 */
export function createPlaySound(): playsound_t {
  return {
    prev: null,
    next: null,
    sfx: null,
    volume: 0,
    attenuation: 0,
    entnum: 0,
    entchannel: 0,
    fixed_origin: false,
    origin: [0, 0, 0],
    begin: 0
  };
}

/**
 * Original name: dma_t zero-initialization
 * Source: client/snd_loc.h
 * Category: Adapter
 * Fidelity level: Close
 *
 * Behavior:
 * - Creates an uninitialized DMA descriptor whose backend buffer is absent.
 */
export function createDmaState(): dma_t {
  return {
    channels: 0,
    samples: 0,
    submission_chunk: 0,
    samplepos: 0,
    samplebits: 0,
    speed: 0,
    buffer: null
  };
}

/**
 * Original name: channel_t zero-initialization
 * Source: client/snd_loc.h
 * Category: Adapter
 * Fidelity level: Close
 *
 * Behavior:
 * - Creates an inactive mixer channel with zeroed volumes, ownership and spatial state.
 */
export function createChannel(): channel_t {
  return {
    sfx: null,
    leftvol: 0,
    rightvol: 0,
    end: 0,
    pos: 0,
    looping: 0,
    entnum: 0,
    entchannel: 0,
    origin: [0, 0, 0],
    dist_mult: 0,
    master_vol: 0,
    fixed_origin: false,
    autosound: false
  };
}

/**
 * Original name: wavinfo_t zero-initialization
 * Source: client/snd_loc.h
 * Category: Adapter
 * Fidelity level: Strict
 *
 * Behavior:
 * - Creates the empty metadata value used when no valid WAV data is available.
 */
export function createWavInfo(): wavinfo_t {
  return {
    rate: 0,
    width: 0,
    channels: 0,
    loopstart: -1,
    samples: 0,
    dataofs: 0
  };
}

export function createClientSoundLocalContext(hooks: ClientSoundLocalHooks = {}): ClientSoundLocalContext {
  return {
    state: {
      channels: Array.from({ length: MAX_CHANNELS }, () => createChannel()),
      paintedtime: 0,
      s_rawend: 0,
      listener_origin: [0, 0, 0],
      listener_forward: [0, 0, 0],
      listener_right: [0, 0, 0],
      listener_up: [0, 0, 0],
      dma: createDmaState(),
      mix: createClientSoundMixState(),
      s_pendingplays: createPlaySound(),
      s_rawsamples: Array.from({ length: MAX_RAW_SAMPLES }, () => createPortableSamplePair()),
      s_volume: null,
      s_nosound: null,
      s_loadas8bit: null,
      s_khz: null,
      s_show: null,
      s_mixahead: null,
      s_testsound: null,
      s_primary: null
    },
    hooks
  };
}

export function SNDDMA_Init(context: ClientSoundLocalContext): qboolean {
  return context.hooks.onSNDDMA_Init?.() ?? false;
}

export function SNDDMA_GetDMAPos(context: ClientSoundLocalContext): number {
  return context.hooks.onSNDDMA_GetDMAPos?.() ?? context.state.dma.samplepos;
}

export function SNDDMA_Shutdown(context: ClientSoundLocalContext): void {
  context.hooks.onSNDDMA_Shutdown?.();
}

export function SNDDMA_BeginPainting(context: ClientSoundLocalContext): void {
  context.hooks.onSNDDMA_BeginPainting?.();
}

export function SNDDMA_Submit(context: ClientSoundLocalContext): void {
  context.hooks.onSNDDMA_Submit?.();
}

export function GetWavinfo(context: ClientSoundLocalContext, name: string, wav: Uint8Array, wavlength: number): wavinfo_t {
  return context.hooks.onGetWavinfo?.(name, wav, wavlength) ?? GetWavinfo_Impl(name, wav, wavlength, context.hooks);
}

export function S_InitScaletable(context: ClientSoundLocalContext): void {
  if (context.hooks.onS_InitScaletable) {
    context.hooks.onS_InitScaletable();
    return;
  }

  S_InitScaletable_Impl(context);
}

export function S_LoadSound(context: ClientSoundLocalContext, sfx: sfx_t): sfxcache_t | null {
  return context.hooks.onS_LoadSound?.(sfx) ?? S_LoadSound_Impl(context, sfx);
}

export function S_IssuePlaysound(context: ClientSoundLocalContext, ps: playsound_t): void {
  context.hooks.onS_IssuePlaysound?.(ps);
}

export function S_PaintChannels(context: ClientSoundLocalContext, endtime: number): void {
  if (context.hooks.onS_PaintChannels) {
    context.hooks.onS_PaintChannels(endtime);
    return;
  }

  S_PaintChannels_Impl(context, endtime);
}

export function S_PickChannel(context: ClientSoundLocalContext, entnum: number, entchannel: number): channel_t | null {
  return context.hooks.onS_PickChannel?.(entnum, entchannel) ?? null;
}

export function S_Spatialize(context: ClientSoundLocalContext, channel: channel_t): void {
  context.hooks.onS_Spatialize?.(channel);
}

/**
 * Category: New
 * Purpose: Return the fixed Quake II `MAX_QPATH`-sized name slot budget used by `sfx_t`.
 *
 * Constraints:
 * - Must remain exactly aligned with `snd_loc.h` through `q-shared.h`.
 */
export function getSoundNameCapacity(): number {
  return MAX_QPATH;
}
