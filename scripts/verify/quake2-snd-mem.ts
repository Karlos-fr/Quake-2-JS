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
const oddJunkWav = createPcm8BitWav({
  rate: 11025,
  channels: 1,
  samples: [0, 128],
  prefixJunk: [1, 2, 3]
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

const oddJunkInfo = GetWavinfo("misc/odd-junk.wav", oddJunkWav, oddJunkWav.length);
assert.equal(oddJunkInfo.rate, 11025, "GetWavinfo should skip odd-sized unknown chunks");
assert.equal(oddJunkInfo.width, 1, "GetWavinfo odd-sized chunk width mismatch");
assert.equal(oddJunkInfo.channels, 1, "GetWavinfo odd-sized chunk channel mismatch");
assert.equal(oddJunkInfo.loopstart, -1, "GetWavinfo odd-sized chunk loopstart mismatch");
assert.equal(oddJunkInfo.samples, 2, "GetWavinfo odd-sized chunk sample count mismatch");
assert.equal(oddJunkInfo.dataofs, 56, "GetWavinfo odd-sized chunk data offset mismatch");
assert.deepEqual(DumpChunks(oddJunkWav), [
  "0x10 : JUNK (3)",
  "0x1c : fmt  (16)",
  "0x34 : data (2)"
], "DumpChunks odd-sized chunk mismatch");

const parserMessages: string[] = [];
const parserHooks = {
  onComPrintf: (message: string) => {
    parserMessages.push(message.trim());
  }
};
const missingRiffInfo = GetWavinfo(
  "misc/missing-riff.wav",
  replaceFourCC(wav, "RIFF", "RIFX"),
  wav.length,
  parserHooks
);
assert.equal(missingRiffInfo.samples, 0, "GetWavinfo missing RIFF should return empty info");
const missingFmtInfo = GetWavinfo(
  "misc/missing-fmt.wav",
  replaceFourCC(wav, "fmt ", "JUNK"),
  wav.length,
  parserHooks
);
assert.equal(missingFmtInfo.samples, 0, "GetWavinfo missing fmt should return empty info");
const nonPcmWav = replaceFourCC(wav, "fmt ", "fmt ");
new DataView(nonPcmWav.buffer, nonPcmWav.byteOffset, nonPcmWav.byteLength).setUint16(20, 3, true);
const nonPcmInfo = GetWavinfo("misc/non-pcm.wav", nonPcmWav, nonPcmWav.length, parserHooks);
assert.equal(nonPcmInfo.samples, 0, "GetWavinfo non-PCM should return empty info");
const simpleWav = createMono8BitWav({ rate: 11025, samples: [0, 128] });
const missingDataInfo = GetWavinfo(
  "misc/missing-data.wav",
  replaceFourCC(simpleWav, "data", "JUNK"),
  simpleWav.length,
  parserHooks
);
assert.equal(missingDataInfo.samples, 0, "GetWavinfo missing data should return empty info");
assert.deepEqual(parserMessages, [
  "Missing RIFF/WAVE chunks",
  "Missing fmt chunk",
  "Microsoft PCM format only",
  "Missing data chunk"
], "GetWavinfo parser diagnostic mismatch");

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
  prefixJunk?: number[];
}): Uint8Array {
  const sampleBytes = Uint8Array.from(options.samples);
  const prefixJunkBytes = Uint8Array.from(options.prefixJunk ?? []);
  const hasCue = options.loopstart !== undefined && options.loopLength !== undefined;
  const fmtChunkSize = 16;
  const prefixJunkSize = prefixJunkBytes.length;
  const cueChunkSize = hasCue ? 28 : 0;
  const listChunkSize = hasCue ? 28 : 0;
  const dataChunkSize = sampleBytes.length;
  const riffSize = 4
    + (prefixJunkSize > 0 ? 8 + ((prefixJunkSize + 1) & ~1) : 0)
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

  if (prefixJunkSize > 0) {
    writeFourCC(wav, offset, "JUNK");
    offset += 4;
    view.setUint32(offset, prefixJunkSize, true);
    offset += 4;
    wav.set(prefixJunkBytes, offset);
    offset += (prefixJunkSize + 1) & ~1;
  }

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

function replaceFourCC(buffer: Uint8Array, from: string, to: string): Uint8Array {
  const copy = new Uint8Array(buffer);
  for (let offset = 0; offset <= copy.length - 4; offset += 1) {
    if (String.fromCharCode(copy[offset], copy[offset + 1], copy[offset + 2], copy[offset + 3]) === from) {
      writeFourCC(copy, offset, to);
      return copy;
    }
  }

  throw new Error(`missing fourCC ${from}`);
}
