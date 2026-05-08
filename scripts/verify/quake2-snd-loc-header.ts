/**
 * File: quake2-snd-loc-header.ts
 * Purpose: Verify that the TypeScript target for `client/snd_loc.h` preserves the private sound declarations and public state layout.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - packages/client/src/snd_loc.ts
 * - packages/client/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  MAX_CHANNELS,
  MAX_RAW_SAMPLES,
  GetWavinfo,
  S_InitScaletable,
  S_IssuePlaysound,
  S_LoadSound,
  S_PaintChannels,
  S_PickChannel,
  S_Spatialize,
  SNDDMA_BeginPainting,
  SNDDMA_GetDMAPos,
  SNDDMA_Init,
  SNDDMA_Shutdown,
  SNDDMA_Submit,
  createChannel,
  createClientSoundLocalContext,
  createDmaState,
  createPlaySound,
  createPortableSamplePair,
  createSfx,
  createSfxCache,
  createWavInfo,
  getSoundNameCapacity
} from "../../packages/client/src/index.js";

assert.equal(MAX_CHANNELS, 32, "MAX_CHANNELS mismatch");
assert.equal(MAX_RAW_SAMPLES, 8192, "MAX_RAW_SAMPLES mismatch");
assert.equal(getSoundNameCapacity(), 64, "MAX_QPATH sound name capacity mismatch");

const samplePair = createPortableSamplePair();
assert.deepEqual(samplePair, { left: 0, right: 0 }, "createPortableSamplePair mismatch");

const cache = createSfxCache();
assert.deepEqual({
  length: cache.length,
  loopstart: cache.loopstart,
  speed: cache.speed,
  width: cache.width,
  stereo: cache.stereo,
  dataLength: cache.data.length
}, {
  length: 0,
  loopstart: -1,
  speed: 0,
  width: 0,
  stereo: 0,
  dataLength: 0
}, "createSfxCache layout/default mismatch");

const sfx = createSfx();
assert.deepEqual(sfx, {
  name: "",
  registration_sequence: 0,
  cache: null,
  truename: null
}, "createSfx layout/default mismatch");

const playSound = createPlaySound();
assert.deepEqual(playSound, {
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
}, "createPlaySound layout/default mismatch");

const dma = createDmaState();
assert.deepEqual(dma, {
  channels: 0,
  samples: 0,
  submission_chunk: 0,
  samplepos: 0,
  samplebits: 0,
  speed: 0,
  buffer: null
}, "createDmaState layout/default mismatch");

const channel = createChannel();
assert.deepEqual(channel, {
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
}, "createChannel layout/default mismatch");

const wavInfo = createWavInfo();
assert.deepEqual(wavInfo, {
  rate: 0,
  width: 0,
  channels: 0,
  loopstart: -1,
  samples: 0,
  dataofs: 0
}, "createWavInfo layout/default mismatch");

const callLog: string[] = [];
const context = createClientSoundLocalContext({
  onSNDDMA_Init: () => {
    callLog.push("dma-init");
    return true;
  },
  onSNDDMA_GetDMAPos: () => {
    callLog.push("dma-pos");
    return 77;
  },
  onSNDDMA_Shutdown: () => {
    callLog.push("dma-shutdown");
  },
  onSNDDMA_BeginPainting: () => {
    callLog.push("dma-begin");
  },
  onSNDDMA_Submit: () => {
    callLog.push("dma-submit");
  },
  onGetWavinfo: (name, _wav, wavlength) => {
    callLog.push(`wav:${name}:${wavlength}`);
    return { rate: 22050, width: 2, channels: 2, loopstart: -1, samples: 128, dataofs: 44 };
  },
  onS_InitScaletable: () => {
    callLog.push("scale");
  },
  onS_LoadSound: (incomingSfx) => {
    callLog.push(`load:${incomingSfx.name}`);
    return {
      length: 16,
      loopstart: -1,
      speed: 11025,
      width: 1,
      stereo: 0,
      data: new Uint8Array([1, 2, 3])
    };
  },
  onS_IssuePlaysound: () => {
    callLog.push("issue");
  },
  onS_PaintChannels: (endtime) => {
    callLog.push(`paint:${endtime}`);
  },
  onS_PickChannel: (entnum, entchannel) => {
    callLog.push(`pick:${entnum}:${entchannel}`);
    return channel;
  },
  onS_Spatialize: () => {
    callLog.push("spatialize");
  }
});

assert.equal(context.state.channels.length, MAX_CHANNELS, "channels length mismatch");
assert.equal(context.state.s_rawsamples.length, MAX_RAW_SAMPLES, "raw sample length mismatch");
assert.equal(context.state.s_pendingplays.next, null, "pending plays default mismatch");
assert.equal(context.state.paintedtime, 0, "paintedtime default mismatch");
assert.equal(context.state.s_rawend, 0, "s_rawend default mismatch");
assert.deepEqual(context.state.channels[0], createChannel(), "sound-local channel state mismatch");
assert.deepEqual(context.state.dma, createDmaState(), "sound-local dma state mismatch");
assert.deepEqual(context.state.s_rawsamples[0], createPortableSamplePair(), "sound-local raw sample state mismatch");
assert.deepEqual({
  s_volume: context.state.s_volume,
  s_nosound: context.state.s_nosound,
  s_loadas8bit: context.state.s_loadas8bit,
  s_khz: context.state.s_khz,
  s_show: context.state.s_show,
  s_mixahead: context.state.s_mixahead,
  s_testsound: context.state.s_testsound,
  s_primary: context.state.s_primary
}, {
  s_volume: null,
  s_nosound: null,
  s_loadas8bit: null,
  s_khz: null,
  s_show: null,
  s_mixahead: null,
  s_testsound: null,
  s_primary: null
}, "sound cvar extern defaults mismatch");

sfx.name = "misc/menu1.wav";

assert.equal(SNDDMA_Init(context), true, "SNDDMA_Init mismatch");
assert.equal(SNDDMA_GetDMAPos(context), 77, "SNDDMA_GetDMAPos mismatch");
SNDDMA_BeginPainting(context);
SNDDMA_Submit(context);
SNDDMA_Shutdown(context);
assert.deepEqual(GetWavinfo(context, "misc/menu1.wav", new Uint8Array([82, 73, 70, 70]), 4), {
  rate: 22050,
  width: 2,
  channels: 2,
  loopstart: -1,
  samples: 128,
  dataofs: 44
}, "GetWavinfo mismatch");
S_InitScaletable(context);
assert.equal(S_LoadSound(context, sfx)?.speed, 11025, "S_LoadSound mismatch");
S_IssuePlaysound(context, playSound);
S_PaintChannels(context, 2048);
assert.equal(S_PickChannel(context, 3, 1), channel, "S_PickChannel mismatch");
S_Spatialize(context, channel);

assert.deepEqual(callLog, [
  "dma-init",
  "dma-pos",
  "dma-begin",
  "dma-submit",
  "dma-shutdown",
  "wav:misc/menu1.wav:4",
  "scale",
  "load:misc/menu1.wav",
  "issue",
  "paint:2048",
  "pick:3:1",
  "spatialize"
], "snd_loc hook forwarding mismatch");

const noOpContext = createClientSoundLocalContext();
assert.equal(SNDDMA_Init(noOpContext), false, "SNDDMA_Init default mismatch");
assert.equal(SNDDMA_GetDMAPos(noOpContext), 0, "SNDDMA_GetDMAPos default mismatch");
assert.equal(S_PickChannel(noOpContext, 0, 0), null, "S_PickChannel default mismatch");
assert.deepEqual(GetWavinfo(noOpContext, "empty", new Uint8Array(0), 0), createWavInfo(), "GetWavinfo default mismatch");

console.log("quake2-snd-loc-header: ok");
