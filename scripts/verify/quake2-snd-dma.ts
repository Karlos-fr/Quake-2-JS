/**
 * File: quake2-snd-dma.ts
 * Purpose: Verify the first `client/snd_dma.c` port for registration, playsound pools, raw samples and soundtime update behavior.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for an in-progress `snd_dma.c` runtime port.
 *
 * Dependencies:
 * - packages/client/src/snd_dma.ts
 * - packages/client/src/snd_loc.ts
 * - packages/client/src/client.ts
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
} from "../../packages/client/src/client.js";
import { createClientSoundLocalContext, createSfx, createSfxCache } from "../../packages/client/src/snd_loc.js";
import {
  createClientSndDmaContext,
  S_AliasName as S_DMA_AliasName,
  S_AddLoopSounds as S_DMA_AddLoopSounds,
  S_BeginRegistration as S_DMA_BeginRegistration,
  S_ClearBuffer as S_DMA_ClearBuffer,
  S_EndRegistration as S_DMA_EndRegistration,
  S_FindName as S_DMA_FindName,
  S_Init as S_DMA_Init,
  S_IssuePlaysound as S_DMA_IssuePlaysound,
  S_PickChannel as S_DMA_PickChannel,
  S_RawSamples as S_DMA_RawSamples,
  S_RegisterSexedSound as S_DMA_RegisterSexedSound,
  S_RegisterSound as S_DMA_RegisterSound,
  S_Shutdown as S_DMA_Shutdown,
  S_SpatializeOrigin as S_DMA_SpatializeOrigin,
  S_StartLocalSound as S_DMA_StartLocalSound,
  S_StartSound as S_DMA_StartSound,
  S_StopAllSounds as S_DMA_StopAllSounds,
  S_Update as S_DMA_Update,
  S_Update_ as S_DMA_Update_,
  GetSoundtime as S_DMA_GetSoundtime
} from "../../packages/client/src/snd_dma.js";

let dmaPos = 0;
let beginPaintingCalls = 0;
let submitCalls = 0;
let lastPaintEndtime = 0;

const client = createClientRuntime();
const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
const local = createClientSoundLocalContext({
  onSNDDMA_Init: () => true,
  onSNDDMA_GetDMAPos: () => dmaPos,
  onSNDDMA_BeginPainting: () => {
    beginPaintingCalls += 1;
  },
  onSNDDMA_Submit: () => {
    submitCalls += 1;
  },
  onS_PaintChannels: (endtime) => {
    lastPaintEndtime = endtime;
    local.state.paintedtime = endtime;
  }
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

let registered = S_DMA_RegisterSound(context, "misc/step.wav");
assert.equal(registered?.name, "misc/step.wav", "S_RegisterSound mismatch");
assert.ok(registered, "S_RegisterSound should return a sound effect");
registered!.cache = createCachedSfx(32);

let loadCount = 0;
local.hooks.onS_LoadSound = (sfxToLoad) => {
  loadCount += 1;
  if (!sfxToLoad.cache) {
    sfxToLoad.cache = createCachedSfx(16);
  }
  return sfxToLoad.cache;
};

const stale = S_DMA_FindName(context, "misc/stale.wav", true);
assert.ok(stale, "S_FindName should create stale registration probe");
stale!.registration_sequence = context.state.s_registration_sequence - 1;
stale!.cache = createCachedSfx(8);
S_DMA_BeginRegistration(context);
const current = S_DMA_RegisterSound(context, "misc/current.wav");
assert.equal(context.state.s_registering, true, "S_BeginRegistration should set registering flag");
assert.equal(current?.registration_sequence, context.state.s_registration_sequence, "S_RegisterSound should stamp current sequence");
assert.equal(loadCount, 0, "S_RegisterSound should defer loading while registering");
S_DMA_EndRegistration(context);
assert.equal(context.state.s_registering, false, "S_EndRegistration should clear registering flag");
assert.equal(stale?.name, "", "S_EndRegistration should clear stale sounds");
assert.equal(loadCount > 0, true, "S_EndRegistration should load current sounds");

registered = S_DMA_RegisterSound(context, "misc/step.wav");
assert.ok(registered, "S_RegisterSound should recreate a playback sound after registration cleanup");
registered!.cache = createCachedSfx(32);

S_DMA_StopAllSounds(context);
assert.equal(context.sound.state.s_pendingplays.next, context.sound.state.s_pendingplays, "S_StopAllSounds pending sentinel mismatch");
assert.equal(context.state.s_freeplays.next !== null, true, "S_StopAllSounds free list mismatch");
assert.deepEqual(Array.from(context.sound.state.dma.buffer ?? []), new Array(8).fill(0x80), "S_StopAllSounds clear buffer mismatch");

context.sound.state.dma.speed = 11025;
context.sound.state.paintedtime = 100;
client.cl.frame.servertime = 0;
S_DMA_StartSound(context, [10, 20, 30], 9, 2, registered, 0.5, 1, 0.05);
const queued = context.sound.state.s_pendingplays.next;
assert.ok(queued && queued !== context.sound.state.s_pendingplays, "S_StartSound should queue one playsound");
assert.equal(queued?.entnum, 9, "S_StartSound queued entnum mismatch");
assert.equal(queued?.entchannel, 2, "S_StartSound queued entchannel mismatch");
assert.equal(queued?.volume, Math.trunc(0.5 * 255), "S_StartSound queued volume mismatch");
assert.equal(queued?.begin, 100 + Math.trunc(0.05 * 11025), "S_StartSound timeofs scheduling mismatch");

const issuedFromReturn = S_DMA_IssuePlaysound(context, queued!);
const issuedChannel = context.sound.state.channels.find((channel) => channel.sfx === registered);
assert.ok(issuedChannel, "S_IssuePlaysound should assign a mixer channel");
assert.equal(issuedFromReturn, issuedChannel, "S_IssuePlaysound should return the assigned mixer channel");
assert.equal(issuedChannel?.entnum, 9, "S_IssuePlaysound channel entnum mismatch");
assert.equal(issuedChannel?.entchannel, 2, "S_IssuePlaysound channel entchannel mismatch");
assert.equal(issuedChannel?.end, context.sound.state.paintedtime + 32, "S_IssuePlaysound channel end mismatch");

S_DMA_StartLocalSound(context, "misc/talk.wav");
const localQueued = context.sound.state.s_pendingplays.next;
assert.ok(localQueued && localQueued !== context.sound.state.s_pendingplays, "S_StartLocalSound should queue one local playsound");
assert.equal(localQueued?.entnum, client.cl.playernum + 1, "S_StartLocalSound should use the listener entity");
assert.equal(localQueued?.volume, 255, "S_StartLocalSound should queue full volume");

const overrideTarget = issuedChannel!;
overrideTarget.end = 9999;
const overrideChannel = S_DMA_PickChannel(context, 9, 2);
assert.equal(overrideChannel, overrideTarget, "S_PickChannel should override matching entnum + entchannel");

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

const autosound = context.sound.state.channels[2];
autosound.sfx = registered;
autosound.autosound = true;
autosound.leftvol = 200;
autosound.rightvol = 200;
S_DMA_Update(context, [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
assert.equal(autosound.sfx, null, "S_Update should clear old autosound channels before adding loops");

const loopSfx = createSfx();
loopSfx.name = "world/loop.wav";
loopSfx.cache = createCachedSfx(64);
client.cl.sound_prepped = true;
client.cl.sound_precache[5] = loopSfx;
client.cl.frame.num_entities = 1;
client.cl.frame.parse_entities = 0;
client.cl_parse_entities[0].sound = 5;
client.cl_parse_entities[0].origin = [0, 128, 0];
context.sound.state.paintedtime = 12;
S_DMA_AddLoopSounds(context);
const loopChannel = context.sound.state.channels.find((channel) => channel.autosound && channel.sfx === loopSfx);
assert.ok(loopChannel, "S_AddLoopSounds should create an autosound loop channel from frame entities");
assert.equal(loopChannel?.pos, 12 % 64, "S_AddLoopSounds loop position mismatch");

context.sound.state.s_rawend = 0;
context.sound.state.paintedtime = 0;
S_DMA_RawSamples(context, 2, 11025, 1, 1, new Uint8Array([0, 255]));
assert.equal(context.sound.state.s_rawend, 2, "S_RawSamples rawend mismatch");
assert.equal(context.sound.state.s_rawsamples[0].left, -128 << 16, "S_RawSamples mono8 sample 0 mismatch");
assert.equal(context.sound.state.s_rawsamples[1].right, 127 << 16, "S_RawSamples mono8 sample 1 mismatch");

context.sound.state.s_rawend = 0;
context.sound.state.paintedtime = 0;
context.sound.state.dma.speed = 11025;
S_DMA_RawSamples(context, 2, 22050, 2, 2, new Uint8Array([
  0x01, 0x00, 0x02, 0x00,
  0x03, 0x00, 0x04, 0x00
]));
assert.equal(context.sound.state.s_rawend, 1, "S_RawSamples stereo16 resample rawend mismatch");
assert.equal(context.sound.state.s_rawsamples[0].left, 1 << 8, "S_RawSamples stereo16 left mismatch");
assert.equal(context.sound.state.s_rawsamples[0].right, 2 << 8, "S_RawSamples stereo16 right mismatch");

context.state.buffers = 0;
context.state.oldsamplepos = 6;
context.sound.state.dma.channels = 2;
context.sound.state.dma.samples = 8;
context.sound.state.dma.speed = 11025;
dmaPos = 2;
S_DMA_GetSoundtime(context);
assert.equal(context.state.buffers, 1, "GetSoundtime wrap mismatch");
assert.equal(context.state.soundtime, 5, "GetSoundtime computed mismatch");

context.state.soundtime = 0;
context.state.buffers = 0;
context.state.oldsamplepos = 0;
context.sound.state.paintedtime = 0;
context.sound.state.dma.channels = 2;
context.sound.state.dma.samples = 16;
context.sound.state.dma.submission_chunk = 4;
context.sound.state.dma.speed = 20;
context.sound.state.dma.buffer = new Uint8Array(16);
dmaPos = 0;
beginPaintingCalls = 0;
submitCalls = 0;
lastPaintEndtime = 0;
S_DMA_Update_(context);
assert.equal(beginPaintingCalls, 1, "S_Update_ should begin DMA painting");
assert.equal(lastPaintEndtime, 4, "S_Update_ should mix to the aligned mix-ahead endtime");
assert.equal(submitCalls, 1, "S_Update_ should submit DMA after painting");

S_DMA_ClearBuffer(context);
assert.deepEqual(Array.from(context.sound.state.dma.buffer?.slice(0, 16) ?? []), new Array(16).fill(0x80), "S_ClearBuffer mismatch");

S_DMA_Shutdown(context);
assert.equal(context.state.sound_started, 0, "S_Shutdown sound_started mismatch");
assert.equal(context.state.snd_initialized, false, "S_Shutdown snd_initialized mismatch");
assert.equal(Cmd_Exists(cmd, "play"), false, "S_Shutdown play command mismatch");
assert.equal(Cmd_Exists(cmd, "soundinfo"), false, "S_Shutdown soundinfo command mismatch");

console.log("quake2-snd-dma: ok");

function createCachedSfx(length: number) {
  const cache = createSfxCache();
  cache.length = length;
  cache.loopstart = -1;
  cache.speed = 11025;
  cache.width = 1;
  cache.stereo = 1;
  cache.data = new Uint8Array(length);
  return cache;
}
