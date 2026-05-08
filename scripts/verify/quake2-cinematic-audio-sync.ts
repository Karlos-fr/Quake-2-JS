/**
 * File: quake2-cinematic-audio-sync.ts
 * Purpose: Verify Phase 9 cinematic PCM scheduling against the 14 Hz Quake II cinematic timeline.
 */

import { strict as assert } from "node:assert";

import {
  SCR_DrawCinematic,
  SCR_PlayCinematic,
  SCR_RunCinematic
} from "../../packages/client/src/cl_scrn.js";
import { createClientRuntime } from "../../packages/client/src/client.js";
import { clc_ops_e } from "../../packages/qcommon/src/index.js";

function createLittleLong(value: number): number[] {
  const normalized = value >>> 0;
  return [
    normalized & 0xff,
    (normalized >>> 8) & 0xff,
    (normalized >>> 16) & 0xff,
    (normalized >>> 24) & 0xff
  ];
}

function appendFrame(bytes: number[], options: { palette: boolean; sample: number }): void {
  bytes.push(...createLittleLong(options.palette ? 1 : 0));
  if (options.palette) {
    const palette = new Uint8Array(768);
    palette[21] = 45;
    palette[22] = 123;
    palette[23] = 200;
    bytes.push(...palette);
  }

  bytes.push(...createLittleLong(5));
  bytes.push(1, 0, 0, 0, 0);
  bytes.push(...new Array<number>(1000).fill(options.sample));
}

function createTwoFrameCin(): Uint8Array {
  const bytes: number[] = [];
  bytes.push(...createLittleLong(1));
  bytes.push(...createLittleLong(1));
  bytes.push(...createLittleLong(14000));
  bytes.push(...createLittleLong(1));
  bytes.push(...createLittleLong(1));

  for (let prev = 0; prev < 256; prev += 1) {
    const counts = new Uint8Array(256);
    if (prev === 0) {
      counts[7] = 1;
      counts[8] = 1;
    }
    bytes.push(...counts);
  }

  appendFrame(bytes, { palette: true, sample: 11 });
  appendFrame(bytes, { palette: false, sample: 22 });
  bytes.push(...createLittleLong(2));
  return Uint8Array.from(bytes);
}

const client = createClientRuntime();
client.cls.realtime = 1;
client.cl.servercount = 77;

const rawChunks: Array<{
  count: number;
  sampleRate: number;
  sampleWidth: number;
  channels: number;
  firstSample: number;
}> = [];
const restarts: Array<number | undefined> = [];
let cdStops = 0;

const hooks = {
  loadBinaryFile: (path: string) => path === "video/sync.cin" ? createTwoFrameCin() : null,
  onCDAudioStop: () => {
    cdStops += 1;
  },
  getCurrentSoundKhz: () => 11,
  onCinematicSoundRestart: (targetKhz?: number) => {
    restarts.push(targetKhz);
  },
  onCinematicRawSamples: (
    count: number,
    sampleRate: number,
    sampleWidth: number,
    channels: number,
    samples: Uint8Array
  ) => {
    rawChunks.push({
      count,
      sampleRate,
      sampleWidth,
      channels,
      firstSample: samples[0]
    });
  }
};

assert.equal(SCR_PlayCinematic(client, "sync.cin", hooks), true, "SCR_PlayCinematic should start synthetic cinematic");
assert.equal(cdStops, 1, "SCR_PlayCinematic should stop CD audio before video playback");
assert.deepEqual(restarts, [14], "SCR_PlayCinematic should request sound restart at cinematic rate");
assert.deepEqual(rawChunks, [{
  count: 1000,
  sampleRate: 14000,
  sampleWidth: 1,
  channels: 1,
  firstSample: 11
}], "first cinematic frame should queue exactly one 14 Hz audio slice");

const firstDraw = SCR_DrawCinematic(client, { viewportWidth: 320, viewportHeight: 200 });
assert.equal(firstDraw.cinematic?.pixels[0], 7, "first cinematic image should be available immediately");

SCR_RunCinematic(client, { currentTimeMs: 70, keyDest: "game" }, hooks);
assert.equal(rawChunks.length, 1, "cinematic should not queue audio before the next 14 Hz frame boundary");

SCR_RunCinematic(client, { currentTimeMs: 144, keyDest: "menu" }, hooks);
assert.equal(rawChunks.length, 1, "cinematic should pause without queueing audio when key_dest is not game");

SCR_RunCinematic(client, { currentTimeMs: 216, keyDest: "game" }, hooks);
assert.equal(rawChunks.length, 2, "cinematic should queue the next audio slice at the next 14 Hz frame boundary");
assert.deepEqual(rawChunks[1], {
  count: 1000,
  sampleRate: 14000,
  sampleWidth: 1,
  channels: 1,
  firstSample: 22
}, "second cinematic frame audio slice mismatch after pause");

SCR_RunCinematic(client, { currentTimeMs: 358, keyDest: "game" }, hooks);
assert.equal(client.cl.cinematic.cinematictime, 0, "cinematic should stop after the stream terminator");
assert.deepEqual(restarts, [14, undefined], "cinematic completion should restore the previous sound backend rate");
assert.equal(client.cls.netchan.message.data[0], clc_ops_e.clc_stringcmd, "cinematic completion should queue nextserver as an outgoing string command");
assert.equal(
  new TextDecoder("latin1").decode(client.cls.netchan.message.data.subarray(1, client.cls.netchan.message.cursize)).replace(/\0$/, ""),
  "nextserver 77\n",
  "cinematic completion should preserve the source nextserver command"
);

console.log("quake2-cinematic-audio-sync: ok");
