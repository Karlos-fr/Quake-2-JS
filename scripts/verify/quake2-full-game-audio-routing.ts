/**
 * File: quake2-full-game-audio-routing.ts
 * Purpose: Verify full-game browser audio routes gameplay SFX through the ported DMA path.
 *
 * This file is not a direct source port.
 * It guards the web adapter wiring around `client/snd_dma.c` so gameplay one-shots,
 * menu sounds and entity loops do not silently regress to ad-hoc WAV playback.
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { CS_SOUNDS, MAX_SOUNDS } from "../../packages/qcommon/src/index.js";
import { CL_RegisterSounds } from "../../packages/client/src/sound.js";
import { createClientRuntime } from "../../packages/client/src/types.js";

const repoRoot = process.cwd();
const fullGameSource = readFileSync(join(repoRoot, "apps", "web", "src", "full-game.ts"), "utf8");
const serverHostSource = readFileSync(join(repoRoot, "apps", "web", "src", "full-game-server-host.ts"), "utf8");
const renderLoopSource = readFileSync(join(repoRoot, "apps", "web", "src", "full-game-render-loop.ts"), "utf8");
const webAudioSource = readFileSync(join(repoRoot, "packages", "platform", "src", "web-audio-adapter.ts"), "utf8");

verifyClientSoundRegistrationStoresBackendHandles();
verifyServerHostPreservesRegisteredSoundHandles();
verifyFullGameUsesDmaForAuthoritativeSfx();
verifyRenderLoopWavAudioDisabledForAuthoritativeFullGame();
verifyWebAudioQueuesDmaSfxUntilUnlock();

console.log("quake2-full-game-audio-routing: ok");

function verifyClientSoundRegistrationStoresBackendHandles(): void {
  const client = createClientRuntime();
  client.cl.configstrings[CS_SOUNDS + 1] = "doors/dr1_strt.wav";
  client.cl.configstrings[CS_SOUNDS + 2] = "doors/dr1_mid.wav";
  client.cl.configstrings[CS_SOUNDS + 3] = "";

  const registered: string[] = [];
  const startHandle = { name: "doors/dr1_strt.wav" };
  const loopHandle = { name: "doors/dr1_mid.wav" };

  const paths = CL_RegisterSounds(client, {
    onRegisterSound: (path) => {
      registered.push(path);
      if (path === startHandle.name) {
        return startHandle;
      }
      if (path === loopHandle.name) {
        return loopHandle;
      }
      return { name: path };
    }
  });

  assert.equal(paths.includes("doors/dr1_strt.wav"), true, "CL_RegisterSounds should preserve returned path list");
  assert.equal(registered.includes("doors/dr1_mid.wav"), true, "CL_RegisterSounds should register loop sounds");
  assert.equal(client.cl.sound_precache[1], startHandle, "CL_RegisterSounds should store start sound backend handle");
  assert.equal(client.cl.sound_precache[2], loopHandle, "CL_RegisterSounds should store loop sound backend handle");
}

function verifyServerHostPreservesRegisteredSoundHandles(): void {
  assert.ok(serverHostSource.includes("preserveSoundPrecacheHandle"), "server host should preserve registered sound handles");
  assert.equal(
    serverHostSource.includes("client.cl.sound_precache[i] = sv.configstrings[CS_SOUNDS + i] || null"),
    false,
    "server host must not overwrite DMA sound handles with raw configstring paths"
  );

  const client = createClientRuntime();
  const loopHandle = { name: "world/amb10.wav", cache: { length: 16 } };
  client.cl.sound_precache[12] = loopHandle;

  const serverConfigstrings = new Array<string>(CS_SOUNDS + MAX_SOUNDS).fill("");
  serverConfigstrings[CS_SOUNDS + 12] = "world/amb10.wav";

  for (let i = 0; i < MAX_SOUNDS; i += 1) {
    const path = serverConfigstrings[CS_SOUNDS + i] || "";
    client.cl.sound_precache[i] = path ? preserveSoundPrecacheHandleForTest(client.cl.sound_precache[i], path) : null;
  }

  assert.equal(client.cl.sound_precache[12], loopHandle, "server sync should keep matching DMA loop sound handle");
}

function verifyFullGameUsesDmaForAuthoritativeSfx(): void {
  assert.ok(fullGameSource.includes("S_StartLocalSound as S_DMA_StartLocalSound"), "menu/local sounds should import the DMA local sound entrypoint");
  assert.ok(fullGameSource.includes("S_DMA_StartLocalSound(sndDmaContext, name)"), "menu/local sounds should route through DMA");
  assert.ok(fullGameSource.includes("S_DMA_StartSound("), "server svc_sound packets should route through DMA");
  assert.ok(fullGameSource.includes("const issued = S_DMA_IssuePlaysound(context, ps);"), "Web bridge should use the channel returned by DMA issue");
  assert.ok(fullGameSource.includes("audio.playChannel(issued)"), "Web bridge should play DMA-issued channels");
  assert.ok(fullGameSource.includes("audio.syncLoopChannels(sndDma.sound.state.channels)"), "entity loop sounds should sync from DMA autosound channels");
  assert.equal(fullGameSource.includes("startLocalSound: (name) => audio.playWav(filesystem, name)"), false, "full-game menu sounds must not bypass DMA through WAV playback");
  assert.equal(fullGameSource.includes("dr1_strt"), false, "door sounds must not have name-specific full-game bypasses");
  assert.equal(fullGameSource.includes("dr1_end"), false, "door sounds must not have name-specific full-game bypasses");
}

function preserveSoundPrecacheHandleForTest(current: unknown, path: string): unknown {
  if (typeof current === "string") {
    return current === path ? current : path;
  }

  if (typeof current === "object" && current !== null && "name" in current) {
    const name = (current as { name?: unknown }).name;
    if (typeof name === "string" && name === path) {
      return current;
    }
  }

  return path;
}

function verifyRenderLoopWavAudioDisabledForAuthoritativeFullGame(): void {
  assert.ok(renderLoopSource.includes("enableRenderSourceAudio = true"), "shared render loop should keep legacy demo WAV audio opt-in by default");
  assert.ok(renderLoopSource.includes("if (enableRenderSourceAudio)"), "shared render loop should gate WAV source audio");
  assert.ok(fullGameSource.includes("enableRenderSourceAudio: false"), "authoritative full-game should disable render-loop WAV SFX");
}

function verifyWebAudioQueuesDmaSfxUntilUnlock(): void {
  assert.ok(webAudioSource.includes("pendingSfxPlaybacks"), "WebAudio adapter should queue DMA SFX before browser unlock");
  assert.ok(webAudioSource.includes("adapter.playSfx(playback.sfx, playback.options)"), "WebAudio adapter should flush queued DMA SFX on unlock");
  assert.ok(webAudioSource.includes("void adapter.unlock().catch(() => undefined);"), "WebAudio adapter should retry browser unlock when DMA SFX arrives");
}
