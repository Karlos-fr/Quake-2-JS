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
import { resolveWebCdTrackCandidates } from "../../packages/platform/src/index.js";

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

console.log("quake2-cdaudio: ok");
