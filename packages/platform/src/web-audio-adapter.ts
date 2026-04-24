/**
 * File: web-audio-adapter.ts
 * Purpose: Adapt the ported Quake II client sound runtime to Web Audio.
 *
 * This file is not a direct source port.
 * It is an adapter layer between `packages/client/src/snd_*.ts` and browser audio nodes.
 *
 * Dependencies:
 * - packages/client
 * - packages/filesystem
 */

import { readMountedFile, type VirtualFilesystem } from "../../filesystem/src/index.js";
import type { channel_t, sfx_t, sfxcache_t } from "../../client/src/sound-local.js";

export interface WebAudioAdapterLogHooks {
  onInfo?: (message: string) => void;
  onWarning?: (message: string) => void;
}

export interface QuakeWebAudioAdapterOptions {
  context?: AudioContext | null;
  createContext?: () => AudioContext | null;
  logs?: WebAudioAdapterLogHooks;
}

export interface QuakeWebAudioAdapter {
  readonly context: AudioContext | null;
  readonly unlocked: boolean;
  readonly muted: boolean;
  unlock: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  setMuted: (muted: boolean) => void;
  setMasterVolume: (volume: number) => void;
  stopAll: () => void;
  stopRaw: () => void;
  playSfx: (sfx: sfx_t, options?: WebAudioSfxPlaybackOptions) => void;
  playChannel: (channel: channel_t) => void;
  syncLoopChannels: (channels: readonly channel_t[]) => void;
  queueRawSamples: (
    count: number,
    sampleRate: number,
    sampleWidth: number,
    channels: number,
    samples: Uint8Array
  ) => void;
  playWav: (filesystem: VirtualFilesystem, name: string) => void;
}

export interface WebAudioSfxPlaybackOptions {
  leftVolume?: number;
  rightVolume?: number;
  entnum?: number;
  entchannel?: number;
  loopKey?: string;
  loop?: boolean;
  offsetSamples?: number;
}

interface ActiveSource {
  source: AudioBufferSourceNode;
  gain: GainNode;
  panner: StereoPannerNode | null;
  key: string | null;
}

interface PendingRawChunk {
  count: number;
  sampleRate: number;
  sampleWidth: number;
  channels: number;
  samples: Uint8Array;
}

export function createQuakeWebAudioAdapter(options: QuakeWebAudioAdapterOptions = {}): QuakeWebAudioAdapter {
  const context = options.context ?? options.createContext?.() ?? createDefaultAudioContext();
  const logs = options.logs ?? {};
  const decodedWavCache = new Map<string, AudioBuffer | null>();
  const sfxBufferCache = new WeakMap<sfxcache_t, AudioBuffer>();
  const activeSources: ActiveSource[] = [];
  const activeLoops = new Map<string, ActiveSource>();
  const activeRawSources: AudioBufferSourceNode[] = [];
  const pendingRawChunks: PendingRawChunk[] = [];
  const masterGain = context?.createGain() ?? null;
  let unlocked = false;
  let muted = false;
  let masterVolume = 1;
  let nextRawStartTime = 0;
  let rawChunkLogCount = 0;

  if (context && masterGain) {
    masterGain.gain.value = 1;
    masterGain.connect(context.destination);
  }

  const adapter: QuakeWebAudioAdapter = {
    context,
    get unlocked() {
      return unlocked;
    },
    get muted() {
      return muted;
    },
    unlock: async () => {
      if (!context) {
        logs.onWarning?.("Web Audio indisponible dans ce navigateur.");
        return;
      }

      if (context.state !== "running") {
        await context.resume();
      }
      unlocked = context.state === "running";
      if (!unlocked) {
        logs.onWarning?.(`audio suspendu (${context.state})`);
        return;
      }

      logs.onInfo?.(`audio actif (${context.sampleRate} Hz), chunks en attente: ${pendingRawChunks.length}`);
      const queued = pendingRawChunks.splice(0);
      for (const chunk of queued) {
        adapter.queueRawSamples(chunk.count, chunk.sampleRate, chunk.sampleWidth, chunk.channels, chunk.samples);
      }
    },
    pause: async () => {
      if (context && context.state === "running") {
        await context.suspend();
      }
    },
    resume: async () => {
      await adapter.unlock();
    },
    setMuted: (nextMuted) => {
      muted = nextMuted;
      updateMasterGain(masterGain, muted, masterVolume);
    },
    setMasterVolume: (volume) => {
      masterVolume = clamp01(volume);
      updateMasterGain(masterGain, muted, masterVolume);
    },
    stopAll: () => {
      stopActiveSources(activeSources);
      activeLoops.clear();
      adapter.stopRaw();
    },
    stopRaw: () => {
      for (const source of activeRawSources.splice(0)) {
        stopSource(source);
      }
      nextRawStartTime = context ? context.currentTime : 0;
    },
    playSfx: (sfx, playOptions = {}) => {
      if (!context || !masterGain || !unlocked || context.state !== "running") {
        return;
      }
      const cache = sfx.cache;
      if (!cache) {
        return;
      }

      const buffer = getSfxAudioBuffer(context, sfxBufferCache, cache);
      const key = playOptions.loopKey ?? makeChannelKey(playOptions.entnum ?? 0, playOptions.entchannel ?? 0);
      if (key) {
        stopMatchingSources(activeSources, key);
      }

      const active = createSpatialSource(context, masterGain, buffer, {
        leftVolume: playOptions.leftVolume ?? 255,
        rightVolume: playOptions.rightVolume ?? 255,
        key,
        loop: playOptions.loop ?? cache.loopstart >= 0,
        offsetSamples: playOptions.offsetSamples ?? 0
      });
      activeSources.push(active);
      if (playOptions.loop && key) {
        activeLoops.set(key, active);
      }
      active.source.onended = () => {
        removeActiveSource(activeSources, active);
        if (key && activeLoops.get(key) === active) {
          activeLoops.delete(key);
        }
      };
    },
    playChannel: (channel) => {
      if (!channel.sfx) {
        return;
      }
      adapter.playSfx(channel.sfx, {
        leftVolume: channel.leftvol,
        rightVolume: channel.rightvol,
        entnum: channel.entnum,
        entchannel: channel.entchannel,
        loop: channel.autosound || channel.looping !== 0,
        offsetSamples: channel.pos
      });
    },
    syncLoopChannels: (channels) => {
      const wanted = new Set<string>();
      for (const channel of channels) {
        if (!channel.sfx || (!channel.autosound && channel.looping === 0)) {
          continue;
        }
        const key = makeChannelKey(channel.entnum, channel.entchannel) ?? `autosound:${channel.sfx.name}`;
        wanted.add(key);
        const active = activeLoops.get(key);
        if (active) {
          applyQuakeStereoVolumes(active.gain, active.panner, channel.leftvol, channel.rightvol);
          continue;
        }
        adapter.playSfx(channel.sfx, {
        leftVolume: channel.leftvol,
        rightVolume: channel.rightvol,
        entnum: channel.entnum,
        entchannel: channel.entchannel,
        loopKey: key,
        loop: true,
        offsetSamples: channel.pos
      });
      }

      for (const [key, active] of activeLoops) {
        if (wanted.has(key)) {
          continue;
        }
        stopSource(active.source);
        activeLoops.delete(key);
        removeActiveSource(activeSources, active);
      }
    },
    queueRawSamples: (count, sampleRate, sampleWidth, channels, samples) => {
      if (!context || !masterGain) {
        return;
      }
      if (!unlocked || context.state !== "running") {
        if (pendingRawChunks.length < 96) {
          pendingRawChunks.push({ count, sampleRate, sampleWidth, channels, samples: samples.slice() });
        }
        return;
      }

      if (rawChunkLogCount < 3) {
        logs.onInfo?.(`audio cin: ${count} samples, ${sampleRate} Hz, ${sampleWidth * 8} bit, ${channels} ch`);
        rawChunkLogCount += 1;
      }

      const audioBuffer = context.createBuffer(Math.max(1, channels), count, sampleRate);
      writeRawSamplesToAudioBuffer(audioBuffer, count, sampleWidth, channels, samples);

      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(masterGain);
      source.onended = () => {
        const index = activeRawSources.indexOf(source);
        if (index >= 0) {
          activeRawSources.splice(index, 1);
        }
      };

      const startTime = Math.max(context.currentTime + 0.02, nextRawStartTime);
      source.start(startTime);
      nextRawStartTime = startTime + audioBuffer.duration;
      activeRawSources.push(source);
    },
    playWav: (filesystem, name) => {
      if (!context || !masterGain || !unlocked || context.state !== "running") {
        return;
      }
      void playDecodedWav(context, masterGain, decodedWavCache, filesystem, name, logs);
    }
  };

  return adapter;
}

export function resolveQuakeSoundPath(name: string): string {
  const normalized = name.replaceAll("\\", "/").replace(/^\/+/, "");
  return normalized.startsWith("sound/") ? normalized : `sound/${normalized}`;
}

export function computeQuakeChannelGain(leftVolume: number, rightVolume: number): { gain: number; pan: number } {
  const left = clamp01(leftVolume / 255);
  const right = clamp01(rightVolume / 255);
  const loudest = Math.max(left, right);
  if (loudest === 0) {
    return { gain: 0, pan: 0 };
  }

  return {
    gain: loudest,
    pan: clampSigned(right - left)
  };
}

export function writeRawSamplesToAudioBuffer(
  audioBuffer: AudioBuffer,
  count: number,
  sampleWidth: number,
  channels: number,
  samples: Uint8Array
): void {
  const view = new DataView(samples.buffer, samples.byteOffset, samples.byteLength);

  for (let frame = 0; frame < count; frame += 1) {
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
      const sourceChannel = Math.min(channel, channels - 1);
      let value = 0;

      if (sampleWidth === 2) {
        const offset = (frame * channels + sourceChannel) * 2;
        value = offset + 1 < samples.byteLength ? view.getInt16(offset, true) / 32768 : 0;
      } else {
        const offset = frame * channels + sourceChannel;
        value = offset < samples.byteLength ? (samples[offset] - 128) / 128 : 0;
      }

      audioBuffer.getChannelData(channel)[frame] = Math.max(-1, Math.min(1, value));
    }
  }
}

function createDefaultAudioContext(): AudioContext | null {
  const AudioContextCtor = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  return AudioContextCtor ? new AudioContextCtor() : null;
}

function getSfxAudioBuffer(
  context: AudioContext,
  cache: WeakMap<sfxcache_t, AudioBuffer>,
  sfxCache: sfxcache_t
): AudioBuffer {
  const existing = cache.get(sfxCache);
  if (existing) {
    return existing;
  }

  const channels = sfxCache.stereo ? 2 : 1;
  const buffer = context.createBuffer(channels, Math.max(1, sfxCache.length), sfxCache.speed || context.sampleRate);
  writeSfxCacheToAudioBuffer(buffer, sfxCache);
  cache.set(sfxCache, buffer);
  return buffer;
}

function writeSfxCacheToAudioBuffer(audioBuffer: AudioBuffer, sfxCache: sfxcache_t): void {
  const channels = sfxCache.stereo ? 2 : 1;
  const view = new DataView(sfxCache.data.buffer, sfxCache.data.byteOffset, sfxCache.data.byteLength);

  for (let frame = 0; frame < sfxCache.length; frame += 1) {
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
      const sourceChannel = Math.min(channel, channels - 1);
      const sourceIndex = frame * channels + sourceChannel;
      let value = 0;
      if (sfxCache.width === 2) {
        const offset = sourceIndex * 2;
        value = offset + 1 < sfxCache.data.byteLength ? view.getInt16(offset, true) / 32768 : 0;
      } else {
        value = sourceIndex < sfxCache.data.byteLength ? toSignedByte(sfxCache.data[sourceIndex]) / 128 : 0;
      }
      audioBuffer.getChannelData(channel)[frame] = Math.max(-1, Math.min(1, value));
    }
  }
}

function createSpatialSource(
  context: AudioContext,
  destination: AudioNode,
  buffer: AudioBuffer,
  options: {
    leftVolume: number;
    rightVolume: number;
    key: string | null;
    loop: boolean;
    offsetSamples: number;
  }
): ActiveSource {
  const source = context.createBufferSource();
  const gain = context.createGain();
  const panner = typeof context.createStereoPanner === "function" ? context.createStereoPanner() : null;
  source.buffer = buffer;
  source.loop = options.loop;
  if (options.loop && buffer.length > 0) {
    source.loopStart = 0;
    source.loopEnd = buffer.duration;
  }
  applyQuakeStereoVolumes(gain, panner, options.leftVolume, options.rightVolume);

  source.connect(gain);
  if (panner) {
    gain.connect(panner);
    panner.connect(destination);
  } else {
    gain.connect(destination);
  }

  const offsetSeconds = buffer.sampleRate > 0
    ? Math.max(0, options.offsetSamples) / buffer.sampleRate
    : 0;
  source.start(0, Math.min(offsetSeconds, Math.max(0, buffer.duration - 0.001)));
  return { source, gain, panner, key: options.key };
}

function applyQuakeStereoVolumes(
  gainNode: GainNode,
  pannerNode: StereoPannerNode | null,
  leftVolume: number,
  rightVolume: number
): void {
  const values = computeQuakeChannelGain(leftVolume, rightVolume);
  gainNode.gain.value = values.gain;
  if (pannerNode) {
    pannerNode.pan.value = values.pan;
  }
}

async function playDecodedWav(
  context: AudioContext,
  destination: AudioNode,
  cache: Map<string, AudioBuffer | null>,
  filesystem: VirtualFilesystem,
  name: string,
  logs: WebAudioAdapterLogHooks
): Promise<void> {
  const path = resolveQuakeSoundPath(name);
  let buffer = cache.get(path);

  if (buffer === undefined) {
    const file = readMountedFile(filesystem, path);
    if (!file) {
      cache.set(path, null);
      return;
    }

    try {
      const wavBytes = new Uint8Array(file.bytes.byteLength);
      wavBytes.set(file.bytes);
      const audioData = new ArrayBuffer(wavBytes.byteLength);
      new Uint8Array(audioData).set(wavBytes);
      buffer = await context.decodeAudioData(audioData);
      cache.set(path, buffer);
    } catch (error) {
      cache.set(path, null);
      logs.onWarning?.(`son illisible: ${path} (${error instanceof Error ? error.message : error})`);
      return;
    }
  }

  if (!buffer) {
    return;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(destination);
  source.start();
}

function makeChannelKey(entnum: number, entchannel: number): string | null {
  return entchannel !== 0 ? `${entnum}:${entchannel}` : null;
}

function stopMatchingSources(sources: ActiveSource[], key: string): void {
  for (let index = sources.length - 1; index >= 0; index -= 1) {
    const active = sources[index];
    if (active.key !== key) {
      continue;
    }
    stopSource(active.source);
    sources.splice(index, 1);
  }
}

function stopActiveSources(sources: ActiveSource[]): void {
  for (const active of sources.splice(0)) {
    stopSource(active.source);
  }
}

function removeActiveSource(sources: ActiveSource[], active: ActiveSource): void {
  const index = sources.indexOf(active);
  if (index >= 0) {
    sources.splice(index, 1);
  }
}

function stopSource(source: AudioBufferSourceNode): void {
  try {
    source.stop();
  } catch {
    // The browser throws if a source is already stopped; Quake's stop path is idempotent.
  }
}

function updateMasterGain(masterGain: GainNode | null, muted: boolean, volume: number): void {
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : clamp01(volume);
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampSigned(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function toSignedByte(value: number): number {
  return (value << 24) >> 24;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }

  var webkitAudioContext: typeof AudioContext | undefined;
}
