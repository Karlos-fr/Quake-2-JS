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
assert.equal(cache.loopstart, -1, "createSfxCache loopstart mismatch");
assert.equal(cache.data.length, 0, "createSfxCache data mismatch");

const sfx = createSfx();
assert.equal(sfx.name, "", "createSfx name mismatch");
assert.equal(sfx.cache, null, "createSfx cache mismatch");

const playSound = createPlaySound();
assert.equal(playSound.sfx, null, "createPlaySound sfx mismatch");
assert.deepEqual(playSound.origin, [0, 0, 0], "createPlaySound origin mismatch");

const dma = createDmaState();
assert.equal(dma.buffer, null, "createDmaState buffer mismatch");

const channel = createChannel();
assert.equal(channel.master_vol, 0, "createChannel master_vol mismatch");

const wavInfo = createWavInfo();
assert.equal(wavInfo.loopstart, -1, "createWavInfo loopstart mismatch");

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
