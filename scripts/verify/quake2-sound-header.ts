/**
 * File: quake2-sound-header.ts
 * Purpose: Verify that the TypeScript target for `client/sound.h` preserves the public client sound API.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - packages/client/src/sound-public.ts
 * - packages/client/src/sound-local.ts
 */

import { strict as assert } from "node:assert";

import {
  CL_GetEntitySoundOrigin,
  S_Activate,
  S_BeginRegistration,
  S_EndRegistration,
  S_FindName,
  S_Init,
  S_RawSamples,
  S_RegisterSound,
  S_Shutdown,
  S_StartLocalSound,
  S_StartSound,
  S_StopAllSounds,
  S_Update,
  createClientSoundPublicContext,
  createRawSampleBuffer
} from "../../packages/client/src/sound-public.js";
import { createSfx } from "../../packages/client/src/sound-local.js";

const log: string[] = [];
const registered = createSfx();
registered.name = "misc/menu1.wav";

const context = createClientSoundPublicContext({
  onInit: () => {
    log.push("init");
  },
  onShutdown: () => {
    log.push("shutdown");
  },
  onStartSound: (origin, entnum, entchannel, sfx, fvol, attenuation, timeofs) => {
    log.push(`start:${origin ? origin.join(",") : "null"}:${entnum}:${entchannel}:${sfx?.name ?? "null"}:${fvol}:${attenuation}:${timeofs}`);
  },
  onStartLocalSound: (name) => {
    log.push(`local:${name}`);
  },
  onRawSamples: (samples, rate, width, channels, data) => {
    log.push(`raw:${samples}:${rate}:${width}:${channels}:${data.length}`);
  },
  onStopAllSounds: () => {
    log.push("stop");
  },
  onUpdate: (origin, forward, right, up) => {
    log.push(`update:${origin.join(",")}:${forward.join(",")}:${right.join(",")}:${up.join(",")}`);
  },
  onActivate: (active) => {
    log.push(`activate:${active}`);
  },
  onBeginRegistration: () => {
    log.push("begin-reg");
  },
  onRegisterSound: (sample) => {
    log.push(`register:${sample}`);
    return registered;
  },
  onEndRegistration: () => {
    log.push("end-reg");
  },
  onFindName: (name, create) => {
    log.push(`find:${name}:${create}`);
    return create ? registered : null;
  },
  onGetEntitySoundOrigin: (ent) => {
    log.push(`origin:${ent}`);
    return [ent, ent + 1, ent + 2];
  }
});

const raw = createRawSampleBuffer([1, 2, 3, 4]);
assert.deepEqual(Array.from(raw), [1, 2, 3, 4], "createRawSampleBuffer mismatch");

S_Init(context);
S_StartSound(context, null, 7, 2, registered, 1, 0.5, 0.1);
S_StartLocalSound(context, "misc/menu1.wav");
S_RawSamples(context, 32, 22050, 2, 2, raw);
S_StopAllSounds(context);
S_Update(context, [1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]);
S_Activate(context, true);
S_BeginRegistration(context);
assert.equal(S_RegisterSound(context, "misc/menu1.wav"), registered, "S_RegisterSound mismatch");
S_EndRegistration(context);
assert.equal(S_FindName(context, "misc/menu1.wav", true), registered, "S_FindName mismatch");

const org: [number, number, number] = [0, 0, 0];
CL_GetEntitySoundOrigin(context, 9, org);
assert.deepEqual(org, [9, 10, 11], "CL_GetEntitySoundOrigin mismatch");

S_Shutdown(context);

assert.deepEqual(log, [
  "init",
  "start:null:7:2:misc/menu1.wav:1:0.5:0.1",
  "local:misc/menu1.wav",
  "raw:32:22050:2:2:4",
  "stop",
  "update:1,2,3:4,5,6:7,8,9:10,11,12",
  "activate:true",
  "begin-reg",
  "register:misc/menu1.wav",
  "end-reg",
  "find:misc/menu1.wav:true",
  "origin:9",
  "shutdown"
], "sound.h hook forwarding mismatch");

const noOp = createClientSoundPublicContext();
assert.equal(S_RegisterSound(noOp, "none.wav"), null, "S_RegisterSound default mismatch");
assert.equal(S_FindName(noOp, "none.wav", false), null, "S_FindName default mismatch");
const emptyOrg: [number, number, number] = [5, 5, 5];
CL_GetEntitySoundOrigin(noOp, 1, emptyOrg);
assert.deepEqual(emptyOrg, [0, 0, 0], "CL_GetEntitySoundOrigin default mismatch");

console.log("quake2-sound-header: ok");
