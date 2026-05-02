/**
 * File: quake2-audio-phase11.ts
 * Purpose: Verify Quake II audio fidelity invariants across server packets, client parsing and gameplay audio triggers.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for Phase 11 of the audio porting plan.
 *
 * Dependencies:
 * - packages/server/src/sv_init.ts
 * - packages/server/src/sv_send.ts
 * - packages/client/src/cl_parse.ts
 * - packages/game/src/g_target.ts
 */

import { strict as assert } from "node:assert";

import { createRuntimeEntity, type game_export_t } from "../../packages/game/src/index.js";
import { createCommandRuntime, createCvarRuntime, createQcommonNetRuntime } from "../../packages/qcommon/src/index.js";
import {
  ATTN_STATIC,
  ATTN_NONE,
  CHAN_NO_PHS_ADD,
  CHAN_VOICE,
  CS_SOUNDS,
  MSG_ReadByte,
  SND_ATTENUATION,
  SND_ENT,
  SND_OFFSET,
  SND_POS,
  SND_VOLUME,
  createCollisionModelRuntime,
  createNetAdr,
  svc_ops_e
} from "../../packages/qcommon/src/index.js";
import {
  createServerClient,
  createServerSendProcedures,
  createServerState,
  createServerStatic,
  server_state_t,
  client_state_t
} from "../../packages/server/src/index.js";
import { createServerInitProcedures } from "../../packages/server/src/sv_init.js";
import { CL_ParseStartSoundPacket } from "../../packages/client/src/cl_parse.js";
import { createClientRuntime } from "../../packages/client/src/client.js";
import { createGameRuntimeFromBspEntities, spawnGameEntity } from "../../packages/game/src/runtime.js";
import { SP_target_speaker } from "../../packages/game/src/g_target.js";

verifySoundIndexStability();
verifySvcSoundRoundTrip();
verifyGameplayLoopAndOneShotSpeaker();

console.log("quake2-audio-phase11: ok");

function verifySoundIndexStability(): void {
  const sv = createServerState();
  const svs = createServerStatic();
  sv.state = server_state_t.ss_loading;

  const init = createServerInitProcedures({
    sv,
    svs,
    ge: createGameExports([]),
    cmd: createCommandRuntime(),
    cvar: createCvarRuntime(),
    qnet: createQcommonNetRuntime(),
    collisionModelRuntime: createCollisionModelRuntime(),
    maxclients: cvar("maxclients", 1),
    dedicated: cvar("dedicated", 0),
    sv_noreload: cvar("sv_noreload", 0),
    sv_airaccelerate: cvar("sv_airaccelerate", 0),
    master_adr: [],
    SV_Multicast: () => {},
    SV_ClearWorld: () => {}
  });

  const first = init.SV_SoundIndex("world/ambience.wav");
  const second = init.SV_SoundIndex("weapons/blastf1a.wav");
  const firstAgain = init.SV_SoundIndex("world/ambience.wav");

  assert.equal(first, 1, "SV_SoundIndex should allocate first sound at Quake index 1");
  assert.equal(second, 2, "SV_SoundIndex should allocate the next sound sequentially");
  assert.equal(firstAgain, first, "SV_SoundIndex should return stable indices for repeated paths");
  assert.equal(sv.configstrings[CS_SOUNDS + first], "world/ambience.wav", "CS_SOUNDS first entry mismatch");
  assert.equal(sv.configstrings[CS_SOUNDS + second], "weapons/blastf1a.wav", "CS_SOUNDS second entry mismatch");
}

function verifySvcSoundRoundTrip(): void {
  const worldspawn = createRuntimeEntity({}, 0);
  worldspawn.inuse = true;

  const player = createRuntimeEntity({}, 1);
  player.inuse = true;
  player.s.origin = [8, 16, 24];

  const sv = createServerState();
  const svs = createServerStatic();
  sv.state = server_state_t.ss_game;

  const serverClient = createServerClient();
  serverClient.state = client_state_t.cs_spawned;
  serverClient.edict = player;
  svs.clients = [serverClient];

  const send = createServerSendProcedures({
    sv,
    svs,
    ge: createGameExports([worldspawn, player]),
    collisionWorld: {} as never,
    qnet: createQcommonNetRuntime(),
    maxclients: cvar("maxclients", 1),
    dedicated: cvar("dedicated", 0),
    sv_paused: cvar("sv_paused", 0),
    sv_client: serverClient,
    net_from: createNetAdr(),
    SV_BuildClientFrame: () => {},
    SV_WriteFrameToClient: () => {},
    SV_DropClient: () => {},
    SV_Nextserver: () => {}
  });

  send.SV_StartSound([10, 20, 30], player, 2, 7, 0.5, ATTN_NONE, 0.125);

  const client = createClientRuntime();
  const soundHandle = { name: "world/ambience.wav" };
  client.cl.sound_precache[7] = soundHandle;
  client.net_message.cursize = serverClient.datagram.cursize;
  client.net_message.data.set(serverClient.datagram.data.subarray(0, serverClient.datagram.cursize));
  client.net_message.readcount = 0;

  assert.equal(MSG_ReadByte(client.net_message), svc_ops_e.svc_sound, "server should prefix the sound packet with svc_sound");

  const starts: unknown[] = [];
  const packet = CL_ParseStartSoundPacket(client, {
    onStartSound: (origin, ent, channel, sound, volume, attenuation, timeofs) => {
      starts.push({ origin, ent, channel, sound, volume, attenuation, timeofs });
    }
  });

  assert.equal(packet.flags & SND_VOLUME, SND_VOLUME, "svc_sound volume flag mismatch");
  assert.equal(packet.flags & SND_ATTENUATION, SND_ATTENUATION, "svc_sound attenuation flag mismatch");
  assert.equal(packet.flags & SND_OFFSET, SND_OFFSET, "svc_sound offset flag mismatch");
  assert.equal(packet.flags & SND_ENT, SND_ENT, "svc_sound entity/channel flag mismatch");
  assert.equal(packet.flags & SND_POS, SND_POS, "svc_sound positional flag mismatch");
  assert.equal(packet.sound_num, 7, "svc_sound sound index mismatch");
  assert.equal(packet.ent, 1, "svc_sound entity index mismatch");
  assert.equal(packet.channel, 2, "svc_sound channel mismatch");
  assert.deepEqual(packet.pos, [10, 20, 30], "svc_sound position round-trip mismatch");
  assert.equal(packet.volume, Math.trunc(0.5 * 255) / 255, "svc_sound volume quantization mismatch");
  assert.equal(packet.attenuation, 0, "svc_sound ATTN_NONE round-trip mismatch");
  assert.equal(packet.ofs, 0.125, "svc_sound time offset mismatch");
  assert.deepEqual(starts, [{
    origin: [10, 20, 30],
    ent: 1,
    channel: 2,
    sound: soundHandle,
    volume: Math.trunc(0.5 * 255) / 255,
    attenuation: 0,
    timeofs: 0.125
  }], "CL_ParseStartSoundPacket handoff mismatch");

  serverClient.datagram.cursize = 0;
  send.SV_StartSound([11, 22, 33], player, CHAN_NO_PHS_ADD + CHAN_VOICE, 8, 1, ATTN_STATIC, 0);
  client.cl.sound_precache[8] = { name: "doors/dr1_strt.wav" };
  client.net_message.cursize = serverClient.datagram.cursize;
  client.net_message.data.set(serverClient.datagram.data.subarray(0, serverClient.datagram.cursize));
  client.net_message.readcount = 0;

  assert.equal(MSG_ReadByte(client.net_message), svc_ops_e.svc_sound, "door sound should be sent as svc_sound");
  const doorStarts: unknown[] = [];
  const doorPacket = CL_ParseStartSoundPacket(client, {
    onStartSound: (origin, ent, channel, sound, volume, attenuation, timeofs) => {
      doorStarts.push({ origin, ent, channel, sound, volume, attenuation, timeofs });
    }
  });
  assert.equal(doorPacket.channel, CHAN_VOICE, "door CHAN_NO_PHS_ADD must not leak into client channel id");
  assert.equal(doorPacket.attenuation, ATTN_STATIC, "door mover sound attenuation mismatch");
  assert.deepEqual(doorStarts, [{
    origin: [11, 22, 33],
    ent: 1,
    channel: CHAN_VOICE,
    sound: client.cl.sound_precache[8],
    volume: 1,
    attenuation: ATTN_STATIC,
    timeofs: 0
  }], "door mover sound packet handoff mismatch");
}

function verifyGameplayLoopAndOneShotSpeaker(): void {
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);

  const oneShot = spawnGameEntity(runtime);
  oneShot.classname = "target_speaker";
  oneShot.properties.noise = "misc/talk";
  SP_target_speaker(oneShot, runtime);
  oneShot.use?.(oneShot, null, null, runtime);
  assert.equal(runtime.soundEvents.at(-1)?.soundPath, "misc/talk.wav", "target_speaker one-shot sound mismatch");

  const looped = spawnGameEntity(runtime);
  looped.classname = "target_speaker";
  looped.properties.noise = "world/hum.wav";
  looped.spawnflags = 1;
  SP_target_speaker(looped, runtime);
  assert.equal(looped.s.sound, looped.noise_index, "target_speaker loop sound index mismatch");
  looped.use?.(looped, null, null, runtime);
  assert.equal(looped.s.sound, 0, "target_speaker loop toggle-off mismatch");
  looped.use?.(looped, null, null, runtime);
  assert.equal(looped.s.sound, looped.noise_index, "target_speaker loop toggle-on mismatch");
}

function cvar(name: string, value: number) {
  return {
    name,
    string: `${value}`,
    latched_string: null,
    flags: 0,
    modified: false,
    value
  };
}

function createGameExports(edicts: ReturnType<typeof createRuntimeEntity>[]): game_export_t {
  return {
    apiversion: 3,
    Init: () => {},
    Shutdown: () => {},
    SpawnEntities: () => {},
    WriteGame: () => {},
    ReadGame: () => {},
    WriteLevel: () => {},
    ReadLevel: () => {},
    ClientConnect: () => true,
    ClientBegin: () => {},
    ClientUserinfoChanged: () => {},
    ClientDisconnect: () => {},
    ClientCommand: () => {},
    ClientThink: () => {},
    RunFrame: () => {},
    ServerCommand: () => {},
    edicts,
    edict_size: 0,
    num_edicts: edicts.length,
    max_edicts: 1024
  };
}
