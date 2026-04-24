/**
 * File: quake2-web-audio-adapter.ts
 * Purpose: Verify the Web Audio adapter helpers used by Quake II audio Phase 7.
 */

import assert from "node:assert/strict";
import {
  computeQuakeChannelGain,
  resolveQuakeSoundPath,
  writeRawSamplesToAudioBuffer
} from "../../packages/platform/src/index.js";

class FakeAudioBuffer {
  readonly numberOfChannels: number;
  private readonly channels: Float32Array[];

  constructor(channelCount: number, length: number) {
    this.numberOfChannels = channelCount;
    this.channels = Array.from({ length: channelCount }, () => new Float32Array(length));
  }

  getChannelData(channel: number): Float32Array {
    return this.channels[channel];
  }
}

assert.equal(resolveQuakeSoundPath("misc/menu1.wav"), "sound/misc/menu1.wav", "relative sound path mismatch");
assert.equal(resolveQuakeSoundPath("sound/misc/menu1.wav"), "sound/misc/menu1.wav", "prefixed sound path mismatch");
assert.equal(resolveQuakeSoundPath("\\misc\\menu1.wav"), "sound/misc/menu1.wav", "backslash sound path mismatch");

assert.deepEqual(computeQuakeChannelGain(255, 255), { gain: 1, pan: 0 }, "centered channel gain mismatch");
assert.deepEqual(computeQuakeChannelGain(255, 0), { gain: 1, pan: -1 }, "left channel pan mismatch");
assert.deepEqual(computeQuakeChannelGain(0, 255), { gain: 1, pan: 1 }, "right channel pan mismatch");
assert.deepEqual(computeQuakeChannelGain(0, 0), { gain: 0, pan: 0 }, "silent channel gain mismatch");

const mono8 = new FakeAudioBuffer(1, 2);
writeRawSamplesToAudioBuffer(mono8 as unknown as AudioBuffer, 2, 1, 1, new Uint8Array([0, 255]));
assert.equal(mono8.getChannelData(0)[0], -1, "mono 8-bit sample 0 mismatch");
assert.ok(Math.abs(mono8.getChannelData(0)[1] - (127 / 128)) < 0.000001, "mono 8-bit sample 1 mismatch");

const stereo16 = new FakeAudioBuffer(2, 1);
writeRawSamplesToAudioBuffer(stereo16 as unknown as AudioBuffer, 1, 2, 2, new Uint8Array([0, 128, 255, 127]));
assert.equal(stereo16.getChannelData(0)[0], -1, "stereo 16-bit left sample mismatch");
assert.ok(Math.abs(stereo16.getChannelData(1)[0] - (32767 / 32768)) < 0.000001, "stereo 16-bit right sample mismatch");

console.log("quake2-web-audio-adapter: ok");
