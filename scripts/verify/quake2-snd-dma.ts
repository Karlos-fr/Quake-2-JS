/**
 * File: quake2-snd-dma.ts
 * Purpose: Verify the first `client/snd_dma.c` port for registration, playsound pools, raw samples and soundtime update behavior.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for an in-progress `snd_dma.c` runtime port.
 *
 * Dependencies:
 * - packages/client/src/snd_dma.ts
 * - packages/client/src/sound-local.ts
 * - packages/client/src/types.ts
 */

import { strict as assert } from "node:assert";

import {
  CS_PLAYERSKINS,
  Cmd_Exists,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import {
  connstate_t,
  createClientRuntime
} from "../../packages/client/src/types.js";
import { createClientSoundLocalContext, createSfx } from "../../packages/client/src/sound-local.js";
import {
  createClientSndDmaContext,
  S_AliasName as S_DMA_AliasName,
  S_ClearBuffer as S_DMA_ClearBuffer,
  S_FindName as S_DMA_FindName,
  S_Init as S_DMA_Init,
  S_PickChannel as S_DMA_PickChannel,
  S_RawSamples as S_DMA_RawSamples,
  S_RegisterSexedSound as S_DMA_RegisterSexedSound,
  S_RegisterSound as S_DMA_RegisterSound,
  S_Shutdown as S_DMA_Shutdown,
  S_SpatializeOrigin as S_DMA_SpatializeOrigin,
  S_StopAllSounds as S_DMA_StopAllSounds,
  GetSoundtime as S_DMA_GetSoundtime
} from "../../packages/client/src/snd_dma.js";

let dmaPos = 0;

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const local = createClientSoundLocalContext({
  onSNDDMA_Init: () => true,
  onSNDDMA_GetDMAPos: () => dmaPos
});
const context = createClientSndDmaContext(client, cmd, cvar, local);

context.sound.state.dma.channels = 2;
context.sound.state.dma.samples = 8;
context.sound.state.dma.samplebits = 8;
context.sound.state.dma.speed = 11025;
context.sound.state.dma.submission_chunk = 1;
context.sound.state.dma.buffer = new Uint8Array(8);
context.sound.state.s_volume = { value: 1, modified: false } as never;
context.sound.state.s_mixahead = { value: 0.2, modified: false } as never;
context.state.sound_started = 1;

S_DMA_Init(context);
assert.equal(context.state.snd_initialized, true, "S_Init snd_initialized mismatch");
assert.equal(Cmd_Exists(cmd, "play"), true, "S_Init play command mismatch");
assert.equal(Cmd_Exists(cmd, "soundinfo"), true, "S_Init soundinfo command mismatch");

const sfx = S_DMA_FindName(context, "misc/menu1.wav", true);
assert.ok(sfx, "S_FindName create mismatch");
assert.equal(S_DMA_FindName(context, "misc/menu1.wav", false), sfx, "S_FindName reuse mismatch");

const alias = S_DMA_AliasName(context, "#players/female/pain.wav", "player/male/pain.wav");
assert.equal(alias.truename, "player/male/pain.wav", "S_AliasName truename mismatch");

client.cl.configstrings[CS_PLAYERSKINS] = "player\\female/athena";
local.hooks.onFS_LoadFile = (path) => {
  if (path === "players/female/pain.wav") {
    return new Uint8Array([1]);
  }
  return null;
};
local.hooks.onFS_FreeFile = () => {};
const sexed = S_DMA_RegisterSexedSound(context, 1, "*pain.wav");
assert.equal(sexed?.name, "#players/female/pain.wav", "S_RegisterSexedSound filename mismatch");

local.hooks.onFS_LoadFile = () => null;
const fallback = S_DMA_RegisterSexedSound(context, 1, "*death.wav");
assert.equal(fallback?.name, "#players/female/death.wav", "S_RegisterSexedSound alias filename mismatch");
assert.equal(fallback?.truename, "player/male/death.wav", "S_RegisterSexedSound fallback mismatch");

const registered = S_DMA_RegisterSound(context, "misc/step.wav");
assert.equal(registered?.name, "misc/step.wav", "S_RegisterSound mismatch");

S_DMA_StopAllSounds(context);
assert.equal(context.sound.state.s_pendingplays.next, context.sound.state.s_pendingplays, "S_StopAllSounds pending sentinel mismatch");
assert.equal(context.state.s_freeplays.next !== null, true, "S_StopAllSounds free list mismatch");
assert.deepEqual(Array.from(context.sound.state.dma.buffer ?? []), new Array(8).fill(0x80), "S_StopAllSounds clear buffer mismatch");

context.sound.state.paintedtime = 10;
context.sound.state.channels[0].entnum = client.cl.playernum + 1;
context.sound.state.channels[0].entchannel = 2;
context.sound.state.channels[0].sfx = createSfx();
context.sound.state.channels[0].end = 40;
const picked = S_DMA_PickChannel(context, 7, 0);
assert.ok(picked, "S_PickChannel should find a slot");
assert.notEqual(picked, context.sound.state.channels[0], "S_PickChannel should not steal player slot");

client.cls.state = connstate_t.ca_active;
context.sound.state.listener_origin = [0, 0, 0];
context.sound.state.listener_right = [1, 0, 0];
const spatial = S_DMA_SpatializeOrigin(context, [100, 0, 0], 255, 0.001);
assert.equal(spatial.left < spatial.right, true, "S_SpatializeOrigin stereo mismatch");

context.sound.state.s_rawend = 0;
context.sound.state.paintedtime = 0;
S_DMA_RawSamples(context, 2, 11025, 1, 1, new Uint8Array([0, 255]));
assert.equal(context.sound.state.s_rawend, 2, "S_RawSamples rawend mismatch");
assert.equal(context.sound.state.s_rawsamples[0].left, -128 << 16, "S_RawSamples mono8 sample 0 mismatch");
assert.equal(context.sound.state.s_rawsamples[1].right, 127 << 16, "S_RawSamples mono8 sample 1 mismatch");

context.state.buffers = 0;
context.state.oldsamplepos = 6;
context.sound.state.dma.channels = 2;
context.sound.state.dma.samples = 8;
dmaPos = 2;
S_DMA_GetSoundtime(context);
assert.equal(context.state.buffers, 1, "GetSoundtime wrap mismatch");
assert.equal(context.state.soundtime, 5, "GetSoundtime computed mismatch");

S_DMA_ClearBuffer(context);
assert.deepEqual(Array.from(context.sound.state.dma.buffer ?? []), new Array(8).fill(0x80), "S_ClearBuffer mismatch");

S_DMA_Shutdown(context);
assert.equal(context.state.sound_started, 0, "S_Shutdown sound_started mismatch");
assert.equal(context.state.snd_initialized, false, "S_Shutdown snd_initialized mismatch");
assert.equal(Cmd_Exists(cmd, "play"), false, "S_Shutdown play command mismatch");
assert.equal(Cmd_Exists(cmd, "soundinfo"), false, "S_Shutdown soundinfo command mismatch");

console.log("quake2-snd-dma: ok");
