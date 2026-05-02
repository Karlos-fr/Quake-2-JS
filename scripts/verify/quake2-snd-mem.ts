/**
 * File: quake2-snd-mem.ts
 * Purpose: Verify the `client/snd_mem.c` port for WAV parsing, sound loading and resampling behavior.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the `snd_mem.c` runtime port.
 *
 * Dependencies:
 * - packages/client/src/snd_mem.ts
 * - packages/client/src/snd_loc.ts
 * - packages/client/src/index.ts
 */

import { strict as assert } from "node:assert";
import { ERR_DROP } from "../../packages/qcommon/src/index.js";
import { GetWavinfo, S_LoadSound } from "../../packages/client/src/snd_mem.js";

import {
  DumpChunks,
  ResampleSfx,
  createClientSoundLocalContext,
  createSfx
} from "../../packages/client/src/index.js";

const wav = createMono8BitWav({
  rate: 11025,
  samples: [0, 64, 128, 255],
  loopstart: 1,
  loopLength: 2
});
const badLoopWav = createMono8BitWav({
  rate: 11025,
  samples: [0, 64],
  loopstart: 1,
  loopLength: 8
});
const stereoWav = createPcm8BitWav({
  rate: 11025,
  channels: 2,
  samples: [0, 255, 64, 128]
});

const info = GetWavinfo("misc/test.wav", wav, wav.length);
assert.equal(info.rate, 11025, "GetWavinfo rate mismatch");
assert.equal(info.width, 1, "GetWavinfo width mismatch");
assert.equal(info.channels, 1, "GetWavinfo channels mismatch");
assert.equal(info.loopstart, 1, "GetWavinfo loopstart mismatch");
assert.equal(info.samples, 3, "GetWavinfo loop sample mismatch");
assert.equal(info.dataofs, 116, "GetWavinfo data offset mismatch");

assert.deepEqual(DumpChunks(wav), [
  "0x10 : fmt  (16)",
  "0x28 : cue  (28)",
  "0x4c : LIST (28)",
  "0x70 : data (4)"
], "DumpChunks mismatch");

const resampleContext = createClientSoundLocalContext();
resampleContext.state.dma.speed = 22050;
resampleContext.state.s_loadas8bit = { value: 0 } as never;
const sfx16 = createSfx();
sfx16.cache = {
  length: 4,
  loopstart: 2,
  speed: 11025,
  width: 1,
  stereo: 0,
  data: new Uint8Array(8)
};
ResampleSfx(resampleContext, sfx16, 11025, 1, new Uint8Array([0, 128, 255, 64]));
assert.equal(sfx16.cache.length, 8, "ResampleSfx upsample length mismatch");
assert.equal(sfx16.cache.loopstart, 4, "ResampleSfx loopstart mismatch");
assert.equal(sfx16.cache.speed, 22050, "ResampleSfx speed mismatch");
assert.equal(sfx16.cache.width, 1, "ResampleSfx width mismatch");
assert.deepEqual(Array.from(new Int8Array(sfx16.cache.data.buffer)), [-128, -128, 0, 0, 127, 127, -64, -64], "ResampleSfx 8-bit mismatch");

const loadLog: string[] = [];
const loadContext = createClientSoundLocalContext({
  onFS_LoadFile: (path) => {
    loadLog.push(`load:${path}`);
    return wav;
  },
  onFS_FreeFile: () => {
    loadLog.push("free");
  },
  onComDPrintf: (message) => {
    loadLog.push(`dprintf:${message}`);
  }
});
loadContext.state.dma.speed = 11025;
loadContext.state.s_loadas8bit = { value: 0 } as never;

const sfx = createSfx();
sfx.name = "misc/test.wav";
const loaded = S_LoadSound(loadContext, sfx);
assert.ok(loaded, "S_LoadSound should load a mono WAV");
assert.equal(loaded?.length, 3, "S_LoadSound cache length mismatch");
assert.equal(loaded?.loopstart, 1, "S_LoadSound cache loopstart mismatch");
assert.equal(loaded?.speed, 11025, "S_LoadSound cache speed mismatch");
assert.equal(loaded?.width, 1, "S_LoadSound cache width mismatch");
assert.deepEqual(Array.from(new Int8Array(loaded?.data.buffer ?? new ArrayBuffer(0))), [-128, -64, 0], "S_LoadSound cache data mismatch");
assert.deepEqual(loadLog, ["load:sound/misc/test.wav", "free"], "S_LoadSound hook usage mismatch");
assert.equal(S_LoadSound(loadContext, sfx), loaded, "S_LoadSound should reuse cached sounds");

const starSfx = createSfx();
starSfx.name = "*pain.wav";
assert.equal(S_LoadSound(loadContext, starSfx), null, "S_LoadSound should not load sexed placeholder names directly");

const aliasLoadLog: string[] = [];
const aliasContext = createClientSoundLocalContext({
  onFS_LoadFile: (path) => {
    aliasLoadLog.push(`load:${path}`);
    return wav;
  },
  onFS_FreeFile: () => {
    aliasLoadLog.push("free");
  }
});
aliasContext.state.dma.speed = 11025;
aliasContext.state.s_loadas8bit = { value: 0 } as never;
const aliasSfx = createSfx();
aliasSfx.name = "#players/female/pain.wav";
assert.ok(S_LoadSound(aliasContext, aliasSfx), "S_LoadSound should load # alias paths");
assert.deepEqual(aliasLoadLog, ["load:players/female/pain.wav", "free"], "S_LoadSound # alias path mismatch");

const stereoLog: string[] = [];
const stereoContext = createClientSoundLocalContext({
  onFS_LoadFile: () => stereoWav,
  onFS_FreeFile: () => {
    stereoLog.push("free");
  },
  onComPrintf: (message) => {
    stereoLog.push(message.trim());
  }
});
stereoContext.state.dma.speed = 11025;
stereoContext.state.s_loadas8bit = { value: 0 } as never;
const stereoSfx = createSfx();
stereoSfx.name = "misc/stereo.wav";
assert.equal(S_LoadSound(stereoContext, stereoSfx), null, "S_LoadSound should reject stereo gameplay samples");
assert.deepEqual(stereoLog, ["misc/stereo.wav is a stereo sample", "free"], "S_LoadSound stereo rejection mismatch");

let dropMessage = "";
try {
  GetWavinfo(
    "misc/bad.wav",
    badLoopWav,
    badLoopWav.length,
    {
      onComError: (code, message) => {
        assert.equal(code, ERR_DROP, "GetWavinfo error code mismatch");
        throw new Error(message);
      }
    }
  );
} catch (error) {
  dropMessage = error instanceof Error ? error.message : String(error);
}
assert.equal(dropMessage, "Sound misc/bad.wav has a bad loop length", "GetWavinfo bad loop mismatch");

console.log("quake2-snd-mem: ok");

function createMono8BitWav(options: {
  rate: number;
  samples: number[];
  loopstart?: number;
  loopLength?: number;
}): Uint8Array {
  return createPcm8BitWav({
    rate: options.rate,
    channels: 1,
    samples: options.samples,
    loopstart: options.loopstart,
    loopLength: options.loopLength
  });
}

function createPcm8BitWav(options: {
  rate: number;
  channels: number;
  samples: number[];
  loopstart?: number;
  loopLength?: number;
}): Uint8Array {
  const sampleBytes = Uint8Array.from(options.samples);
  const hasCue = options.loopstart !== undefined && options.loopLength !== undefined;
  const fmtChunkSize = 16;
  const cueChunkSize = hasCue ? 28 : 0;
  const listChunkSize = hasCue ? 28 : 0;
  const dataChunkSize = sampleBytes.length;
  const riffSize = 4
    + (8 + fmtChunkSize)
    + (hasCue ? 8 + cueChunkSize : 0)
    + (hasCue ? 8 + listChunkSize : 0)
    + (8 + dataChunkSize);
  const wav = new Uint8Array(8 + riffSize);
  const view = new DataView(wav.buffer);
  let offset = 0;

  writeFourCC(wav, offset, "RIFF");
  offset += 4;
  view.setUint32(offset, riffSize, true);
  offset += 4;
  writeFourCC(wav, offset, "WAVE");
  offset += 4;

  writeFourCC(wav, offset, "fmt ");
  offset += 4;
  view.setUint32(offset, fmtChunkSize, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, options.channels, true);
  offset += 2;
  view.setUint32(offset, options.rate, true);
  offset += 4;
  view.setUint32(offset, options.rate * options.channels, true);
  offset += 4;
  view.setUint16(offset, options.channels, true);
  offset += 2;
  view.setUint16(offset, 8, true);
  offset += 2;

  if (hasCue) {
    writeFourCC(wav, offset, "cue ");
    offset += 4;
    view.setUint32(offset, cueChunkSize, true);
    offset += 4;
    view.setUint32(offset, 1, true);
    offset += 4;
    view.setUint32(offset, 0, true);
    offset += 4;
    view.setUint32(offset, 0, true);
    offset += 4;
    writeFourCC(wav, offset, "data");
    offset += 4;
    view.setUint32(offset, 0, true);
    offset += 4;
    view.setUint32(offset, 0, true);
    offset += 4;
    view.setUint32(offset, options.loopstart ?? 0, true);
    offset += 4;

    writeFourCC(wav, offset, "LIST");
    offset += 4;
    view.setUint32(offset, listChunkSize, true);
    offset += 4;
    writeFourCC(wav, offset, "adtl");
    offset += 4;
    writeFourCC(wav, offset, "labl");
    offset += 4;
    view.setUint32(offset, 0, true);
    offset += 4;
    view.setUint32(offset, 0, true);
    offset += 4;
    view.setUint32(offset, options.loopLength ?? 0, true);
    offset += 4;
    writeFourCC(wav, offset, "mark");
    offset += 4;
    view.setUint32(offset, 0, true);
    offset += 4;
  }

  writeFourCC(wav, offset, "data");
  offset += 4;
  view.setUint32(offset, dataChunkSize, true);
  offset += 4;
  wav.set(sampleBytes, offset);

  return wav;
}

function writeFourCC(buffer: Uint8Array, offset: number, value: string): void {
  for (let index = 0; index < 4; index += 1) {
    buffer[offset + index] = value.charCodeAt(index);
  }
}
