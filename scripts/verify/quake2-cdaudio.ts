/**
 * File: quake2-cdaudio.ts
 * Purpose: Verify the logical `client/cdaudio.h` port and web CD-track mapping helpers.
 */

import assert from "node:assert/strict";
import {
  CDAudio_Activate,
  CDAudio_Init,
  CDAudio_Pause,
  CDAudio_Play,
  CDAudio_Resume,
  CDAudio_Shutdown,
  CDAudio_Stop,
  CDAudio_Update,
  createClientCDAudioContext
} from "../../packages/client/src/index.js";
import { createVirtualFilesystem, mountDirectory } from "../../packages/filesystem/src/index.js";
import { createWebCDAudioAdapter, resolveWebCdTrackCandidates } from "../../packages/platform/src/index.js";

const calls: string[] = [];
const cd = createClientCDAudioContext({
  onInit: () => {
    calls.push("init");
    return true;
  },
  onPlay: (track, looping) => calls.push(`play:${track}:${looping ? 1 : 0}`),
  onStop: () => calls.push("stop"),
  onPause: () => calls.push("pause"),
  onResume: () => calls.push("resume"),
  onUpdate: () => calls.push("update"),
  onShutdown: () => calls.push("shutdown")
});

assert.equal(CDAudio_Init(cd), 0, "CDAudio_Init status mismatch");
assert.equal(cd.state.initialized, true, "CDAudio_Init initialized state mismatch");

CDAudio_Play(cd, 3, true);
CDAudio_Play(cd, 3, true);
assert.equal(cd.state.playTrack, 3, "CDAudio_Play track mismatch");
assert.equal(cd.state.playing, true, "CDAudio_Play playing state mismatch");

CDAudio_Pause(cd);
assert.equal(cd.state.wasPlaying, true, "CDAudio_Pause wasPlaying mismatch");
CDAudio_Resume(cd);
assert.equal(cd.state.playing, true, "CDAudio_Resume playing mismatch");

CDAudio_Activate(cd, false);
CDAudio_Activate(cd, true);
CDAudio_Update(cd);
CDAudio_Stop(cd);
CDAudio_Shutdown(cd);

assert.deepEqual(
  calls,
  ["init", "play:3:1", "pause", "resume", "pause", "resume", "update", "stop", "shutdown"],
  "CDAudio hook order mismatch"
);

assert.deepEqual(
  resolveWebCdTrackCandidates(7).slice(0, 6),
  [
    "music/track07.ogg",
    "music/track07.mp3",
    "music/track07.wav",
    "music/track7.ogg",
    "music/track7.mp3",
    "music/track7.wav"
  ],
  "web CD track candidates mismatch"
);

const filesystem = createVirtualFilesystem();
mountDirectory(filesystem, "baseq2", [["music/track04.ogg", new Uint8Array([1, 2, 3, 4])]]);

const fakeGain = {
  gain: { value: -1 },
  connect: () => undefined
};
const fakeSources: Array<{ loop: boolean; started: boolean; stopped: boolean }> = [];
const fakeContext = {
  destination: {},
  createGain: () => fakeGain,
  createBufferSource: () => {
    const source = {
      buffer: null as unknown,
      loop: false,
      onended: null as (() => void) | null,
      started: false,
      stopped: false,
      connect: () => undefined,
      start: () => {
        source.started = true;
      },
      stop: () => {
        source.stopped = true;
        source.onended?.();
      }
    };
    fakeSources.push(source);
    return source;
  },
  decodeAudioData: async (audioData: ArrayBuffer) => ({ byteLength: audioData.byteLength })
} as unknown as AudioContext;

const webCd = createWebCDAudioAdapter({
  context: fakeContext,
  filesystem,
  logs: {}
});

webCd.setMasterVolume(0.5);
webCd.setMusicVolume(0.25);
webCd.play(4, true);
await new Promise((resolve) => setTimeout(resolve, 0));

assert.equal(webCd.currentTrack, 4, "web CD current track mismatch");
assert.equal(webCd.playing, true, "web CD playing state mismatch");
assert.equal(fakeSources.length, 1, "web CD source creation mismatch");
assert.equal(fakeSources[0].loop, true, "web CD looping flag mismatch");
assert.equal(fakeSources[0].started, true, "web CD source start mismatch");
assert.equal(fakeGain.gain.value, 0.125, "web CD initial music gain mismatch");

webCd.pause();
assert.equal(webCd.playing, false, "web CD pause playing state mismatch");
assert.equal(webCd.paused, true, "web CD pause flag mismatch");
assert.equal(fakeGain.gain.value, 0, "web CD paused gain mismatch");

webCd.resume();
assert.equal(webCd.playing, true, "web CD resume playing state mismatch");
assert.equal(fakeGain.gain.value, 0.125, "web CD resumed gain mismatch");

webCd.setMasterVolume(2);
assert.equal(fakeGain.gain.value, 0.25, "web CD master volume clamp mismatch");
webCd.setMusicVolume(-1);
assert.equal(fakeGain.gain.value, 0, "web CD music volume clamp mismatch");

webCd.stop();
assert.equal(fakeSources[0].stopped, true, "web CD stop source mismatch");
assert.equal(webCd.currentTrack, 0, "web CD stop track mismatch");

console.log("quake2-cdaudio: ok");
