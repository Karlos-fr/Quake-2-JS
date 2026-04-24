/**
 * File: cdaudio.ts
 * Source: Quake II original / client/cdaudio.h and native cd_*.c backends
 * Purpose: Port the logical CD-audio control surface used by the client runtime.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Uses an explicit context and host hooks instead of native CD-ROM APIs.
 * - Keeps pause/resume explicit because the browser adapter needs them for focus and visibility changes.
 *
 * Notes:
 * - Native platform commands such as eject/remap are not modeled here; browser music mapping lives in platform adapters.
 */

import type { qboolean } from "../../qcommon/src/index.js";

export interface ClientCDAudioHooks {
  onInit?: () => boolean | number | void;
  onShutdown?: () => void;
  onPlay?: (track: number, looping: qboolean) => void;
  onStop?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onUpdate?: () => void;
}

export interface ClientCDAudioState {
  initialized: qboolean;
  enabled: qboolean;
  playing: qboolean;
  wasPlaying: qboolean;
  playLooping: qboolean;
  playTrack: number;
}

export interface ClientCDAudioContext {
  state: ClientCDAudioState;
  hooks: ClientCDAudioHooks;
}

export function createClientCDAudioContext(hooks: ClientCDAudioHooks = {}): ClientCDAudioContext {
  return {
    state: {
      initialized: false,
      enabled: true,
      playing: false,
      wasPlaying: false,
      playLooping: false,
      playTrack: 0
    },
    hooks
  };
}

/**
 * Original name: CDAudio_Init
 * Source: client/cdaudio.h
 * Category: Ported
 * Fidelity level: Close
 */
export function CDAudio_Init(context: ClientCDAudioContext): number {
  const result = context.hooks.onInit?.();
  const status = typeof result === "number" ? result : result === false ? -1 : 0;
  context.state.initialized = status === 0;
  context.state.enabled = status === 0;
  return status;
}

/**
 * Original name: CDAudio_Shutdown
 * Source: client/cdaudio.h
 * Category: Ported
 * Fidelity level: Close
 */
export function CDAudio_Shutdown(context: ClientCDAudioContext): void {
  if (!context.state.initialized) {
    return;
  }

  CDAudio_Stop(context);
  context.hooks.onShutdown?.();
  context.state.initialized = false;
  context.state.enabled = false;
}

/**
 * Original name: CDAudio_Play
 * Source: client/cdaudio.h
 * Category: Ported
 * Fidelity level: Close
 */
export function CDAudio_Play(context: ClientCDAudioContext, track: number, looping: qboolean): void {
  if (!context.state.enabled) {
    return;
  }
  if (track <= 0) {
    CDAudio_Stop(context);
    return;
  }
  if (context.state.playing && context.state.playTrack === Math.trunc(track)) {
    return;
  }
  if (context.state.playing) {
    CDAudio_Stop(context);
  }

  context.state.playTrack = Math.trunc(track);
  context.state.playLooping = looping;
  context.state.playing = true;
  context.state.wasPlaying = false;
  context.hooks.onPlay?.(context.state.playTrack, looping);
}

/**
 * Original name: CDAudio_Stop
 * Source: client/cdaudio.h
 * Category: Ported
 * Fidelity level: Close
 */
export function CDAudio_Stop(context: ClientCDAudioContext): void {
  if (!context.state.playing && !context.state.wasPlaying) {
    return;
  }

  context.hooks.onStop?.();
  context.state.playing = false;
  context.state.wasPlaying = false;
}

/**
 * Original name: CDAudio_Pause
 * Source: native cd_*.c backends
 * Category: Ported
 * Fidelity level: Close
 */
export function CDAudio_Pause(context: ClientCDAudioContext): void {
  if (!context.state.enabled || !context.state.playing) {
    return;
  }

  context.hooks.onPause?.();
  context.state.wasPlaying = true;
  context.state.playing = false;
}

/**
 * Original name: CDAudio_Resume
 * Source: native cd_*.c backends
 * Category: Ported
 * Fidelity level: Close
 */
export function CDAudio_Resume(context: ClientCDAudioContext): void {
  if (!context.state.enabled || !context.state.wasPlaying) {
    return;
  }

  context.hooks.onResume?.();
  context.state.playing = true;
  context.state.wasPlaying = false;
}

/**
 * Original name: CDAudio_Update
 * Source: client/cdaudio.h
 * Category: Ported
 * Fidelity level: Close
 */
export function CDAudio_Update(context: ClientCDAudioContext): void {
  if (!context.state.enabled) {
    return;
  }

  context.hooks.onUpdate?.();
}

/**
 * Original name: CDAudio_Activate
 * Source: client/cdaudio.h
 * Category: Ported
 * Fidelity level: Close
 */
export function CDAudio_Activate(context: ClientCDAudioContext, active: qboolean): void {
  if (active) {
    CDAudio_Resume(context);
  } else {
    CDAudio_Pause(context);
  }
}
