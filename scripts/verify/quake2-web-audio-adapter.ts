/**
 * File: quake2-web-audio-adapter.ts
 * Purpose: Verify the Web Audio adapter helpers used by Quake II audio Phase 7.
 */

import assert from "node:assert/strict";
import {
  computeQuakeChannelGain,
  createQuakeWebAudioAdapter,
  resolveQuakeSoundPath,
  writeRawSamplesToAudioBuffer
} from "../../packages/platform/src/index.js";
import type { sfx_t } from "../../packages/client/src/index.js";

class FakeAudioBuffer {
  readonly numberOfChannels: number;
  readonly length: number;
  readonly sampleRate: number;
  readonly duration: number;
  private readonly channels: Float32Array[];

  constructor(channelCount: number, length: number, sampleRate = 11025) {
    this.numberOfChannels = channelCount;
    this.length = length;
    this.sampleRate = sampleRate;
    this.duration = length / sampleRate;
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

function createTestSfx(name: string): sfx_t {
  return {
    name,
    registration_sequence: 1,
    truename: null,
    cache: {
      length: 4,
      loopstart: -1,
      speed: 11025,
      width: 1,
      stereo: 0,
      data: new Uint8Array([128, 160, 96, 128])
    }
  };
}

class FakeAudioContext {
  readonly destination = {};
  readonly sampleRate = 48000;
  readonly listener = {};
  readonly gains: FakeGainNode[] = [];
  readonly sources: FakeAudioBufferSourceNode[] = [];
  currentTime = 0;
  state: AudioContextState = "running";
  failNextStart = false;

  async resume(): Promise<void> {
    this.state = "running";
  }

  createGain(): FakeGainNode {
    const gain = new FakeGainNode();
    this.gains.push(gain);
    return gain;
  }

  createBuffer(channels: number, length: number, sampleRate: number): FakeAudioBuffer {
    return new FakeAudioBuffer(channels, length, sampleRate);
  }

  createBufferSource(): FakeAudioBufferSourceNode {
    const source = new FakeAudioBufferSourceNode(this);
    this.sources.push(source);
    return source;
  }
}

class FakeGainNode {
  readonly gain = { value: 1 };
  disconnects = 0;

  connect(_destination: unknown): void {}

  disconnect(): void {
    this.disconnects += 1;
  }
}

class FakeAudioBufferSourceNode {
  buffer: FakeAudioBuffer | null = null;
  loop = false;
  loopStart = 0;
  loopEnd = 0;
  onended: (() => void) | null = null;
  disconnects = 0;

  constructor(private readonly context: FakeAudioContext) {}

  connect(_destination: unknown): void {}

  disconnect(): void {
    this.disconnects += 1;
  }

  start(_when?: number, _offset?: number): void {
    if (this.context.failNextStart) {
      this.context.failNextStart = false;
      throw new Error("forced start failure");
    }
  }

  stop(): void {
    this.onended?.();
  }
}

const fakeContext = new FakeAudioContext();
const audio = createQuakeWebAudioAdapter({
  context: fakeContext as unknown as AudioContext
});
await audio.unlock();
fakeContext.failNextStart = true;
assert.doesNotThrow(() => audio.playSfx(createTestSfx("boss3/xfire.wav")), "WebAudio playback errors must not escape playSfx");
assert.equal(audio.debug.activeSources, 0, "failed WebAudio source must not be retained");
assert.ok(fakeContext.sources.at(-1)?.disconnects, "failed WebAudio source must be disconnected");
assert.ok(fakeContext.gains.at(-1)?.disconnects, "failed WebAudio gain must be disconnected");
audio.playSfx(createTestSfx("boss3/xfire.wav"));
assert.equal(audio.debug.playedSfx, 1, "WebAudio should recover after one failed source start");
assert.equal(audio.debug.activeSources, 1, "WebAudio recovered source should be tracked");
const recoveredSource = fakeContext.sources.at(-1);
const recoveredGain = fakeContext.gains.at(-1);
recoveredSource?.onended?.();
assert.equal(audio.debug.activeSources, 0, "ended WebAudio source should be untracked");
assert.ok(recoveredSource?.disconnects, "ended WebAudio source must be disconnected");
assert.ok(recoveredGain?.disconnects, "ended WebAudio gain must be disconnected");
audio.playSfx(createTestSfx("world/explode1.wav"));
const stoppedSource = fakeContext.sources.at(-1);
const stoppedGain = fakeContext.gains.at(-1);
assert.equal(audio.debug.activeSources, 1, "WebAudio stopAll setup should track a source");
audio.stopAll();
assert.equal(audio.debug.activeSources, 0, "stopAll should clear tracked WebAudio sources");
assert.ok(stoppedSource?.disconnects, "stopAll WebAudio source must be disconnected");
assert.ok(stoppedGain?.disconnects, "stopAll WebAudio gain must be disconnected");

console.log("quake2-web-audio-adapter: ok");
