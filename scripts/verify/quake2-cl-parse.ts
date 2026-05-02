/**
 * File: quake2-cl-parse.ts
 * Purpose: Verify the closed `client/cl_parse.c` behavior anchored in `packages/client/src/cl_parse.ts`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the client parse module.
 *
 * Dependencies:
 * - packages/client/src/cl_parse.ts
 * - packages/client/src/client.ts
 * - packages/qcommon/src/messages.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CL_ParseConfigString,
  CL_ParseDownload,
  CL_ParseMuzzleFlash,
  CL_ParseMuzzleFlash2,
  CL_ParseServerData,
  CL_ParseStartSoundPacket,
  CL_ParseServerMessage,
  CL_WriteStringCmd
} from "../../packages/client/src/cl_parse.js";
import { createClientRuntime, connstate_t } from "../../packages/client/src/client.js";
import {
  CS_CDTRACK,
  CS_IMAGES,
  CS_LIGHTS,
  CS_MODELS,
  CS_PLAYERSKINS,
  CS_SOUNDS,
  MSG_WriteByte,
  MSG_WriteLong,
  MSG_WritePos,
  MSG_WriteShort,
  MSG_WriteString,
  MZ_BLASTER,
  MZ_SILENCED,
  MAX_EDICTS,
  PRINT_CHAT,
  SND_ATTENUATION,
  SND_ENT,
  SND_OFFSET,
  SND_POS,
  SND_VOLUME,
  svc_ops_e
} from "../../packages/qcommon/src/index.js";

function resetIncoming(runtime: ReturnType<typeof createClientRuntime>): void {
  runtime.net_message.cursize = 0;
  runtime.net_message.readcount = 0;
}

function resetOutgoing(runtime: ReturnType<typeof createClientRuntime>): void {
  runtime.cls.netchan.message.cursize = 0;
  runtime.cls.netchan.message.readcount = 0;
}

const runtime = createClientRuntime();
const parseSource = readFileSync(join(process.cwd(), "packages", "client", "src", "cl_parse.ts"), "utf8");
assert.ok(
  parseSource.includes("incomingAcknowledged: runtime.cls.netchan.incoming_acknowledged"),
  "CL_ParseFrame should check prediction error against the acknowledged usercmd, not the serverframe"
);

resetOutgoing(runtime);
resetIncoming(runtime);
CL_WriteStringCmd(runtime, "download maps/test.bsp");
assert.equal(runtime.net_message.cursize, 0, "CL_WriteStringCmd should not write into incoming net_message");
assert.ok(runtime.cls.netchan.message.cursize > 0, "CL_WriteStringCmd should append to outgoing netchan message");

resetIncoming(runtime);
MSG_WriteLong(runtime.net_message, 34);
MSG_WriteLong(runtime.net_message, 12);
MSG_WriteByte(runtime.net_message, 1);
MSG_WriteString(runtime.net_message, "baseq2");
MSG_WriteShort(runtime.net_message, 3);
MSG_WriteString(runtime.net_message, "Unit Test Level");
runtime.net_message.readcount = 0;
CL_ParseServerData(runtime);
assert.equal(runtime.cls.state, connstate_t.ca_connected, "CL_ParseServerData state mismatch");
assert.equal(runtime.cls.serverProtocol, 34, "CL_ParseServerData protocol mismatch");
assert.equal(runtime.cl.servercount, 12, "CL_ParseServerData servercount mismatch");
assert.equal(runtime.cl.attractloop, true, "CL_ParseServerData attractloop mismatch");
assert.equal(runtime.cl.gamedir, "baseq2", "CL_ParseServerData gamedir mismatch");
assert.equal(runtime.cl.playernum, 3, "CL_ParseServerData playernum mismatch");
assert.equal(runtime.cl.refresh_prepped, false, "CL_ParseServerData should clear refresh_prepped for level loads");

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, 7);
MSG_WriteByte(runtime.net_message, MZ_BLASTER | MZ_SILENCED);
runtime.net_message.readcount = 0;
let parsedMuzzleFlash: unknown = null;
const muzzleFlashPacket = CL_ParseMuzzleFlash(runtime, {
  onMuzzleFlash: (packet) => {
    parsedMuzzleFlash = packet;
  }
});
assert.deepEqual(muzzleFlashPacket, {
  entity: 7,
  weapon: MZ_BLASTER | MZ_SILENCED,
  silenced: true
}, "CL_ParseMuzzleFlash packet mismatch");
assert.deepEqual(parsedMuzzleFlash, muzzleFlashPacket, "CL_ParseMuzzleFlash hook mismatch");

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, 0);
MSG_WriteByte(runtime.net_message, MZ_BLASTER);
runtime.net_message.readcount = 0;
assert.throws(() => CL_ParseMuzzleFlash(runtime), /bad entity 0/, "CL_ParseMuzzleFlash bad entity guard mismatch");

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, 12);
MSG_WriteByte(runtime.net_message, 26);
runtime.net_message.readcount = 0;
let parsedMonsterMuzzleFlash: unknown = null;
const monsterMuzzleFlashPacket = CL_ParseMuzzleFlash2(runtime, {
  onMuzzleFlash2: (packet) => {
    parsedMonsterMuzzleFlash = packet;
  }
});
assert.deepEqual(monsterMuzzleFlashPacket, {
  entity: 12,
  flashNumber: 26
}, "CL_ParseMuzzleFlash2 packet mismatch");
assert.deepEqual(parsedMonsterMuzzleFlash, monsterMuzzleFlashPacket, "CL_ParseMuzzleFlash2 hook mismatch");

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, MAX_EDICTS);
MSG_WriteByte(runtime.net_message, 26);
runtime.net_message.readcount = 0;
assert.throws(() => CL_ParseMuzzleFlash2(runtime), /bad entity 1024/, "CL_ParseMuzzleFlash2 bad entity guard mismatch");

resetIncoming(runtime);
let cinematicName = "";
MSG_WriteLong(runtime.net_message, 34);
MSG_WriteLong(runtime.net_message, 99);
MSG_WriteByte(runtime.net_message, 0);
MSG_WriteString(runtime.net_message, "baseq2");
MSG_WriteShort(runtime.net_message, -1);
MSG_WriteString(runtime.net_message, "pics/test.pcx");
runtime.net_message.readcount = 0;
CL_ParseServerData(runtime, {
  onPlayCinematic: (name) => {
    cinematicName = name;
  }
});
assert.equal(cinematicName, "pics/test.pcx", "CL_ParseServerData cinematic handoff mismatch");

runtime.cl.refresh_prepped = true;
const registeredModels: string[] = [];
const registeredSounds: string[] = [];
const registeredPics: string[] = [];
const playedTracks: Array<{ track: number; looping: boolean }> = [];

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_MODELS + 1);
MSG_WriteString(runtime.net_message, "maps/unit1.bsp");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime, {
  registerModel: (path) => {
    registeredModels.push(path);
    return `model:${path}`;
  }
});
assert.equal(runtime.cl.model_draw[1], "model:maps/unit1.bsp", "CL_ParseConfigString model registration mismatch");

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_MODELS + 2);
MSG_WriteString(runtime.net_message, "*1");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime, {
  registerModel: (path) => `model:${path}`,
  inlineModel: (path) => `inline:${path}`
});
assert.equal(runtime.cl.model_clip[2], "inline:*1", "CL_ParseConfigString inline model mismatch");

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_SOUNDS + 1);
MSG_WriteString(runtime.net_message, "world/ambience.wav");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime, {
  registerSound: (path) => {
    registeredSounds.push(path);
    return `sound:${path}`;
  }
});
assert.equal(runtime.cl.sound_precache[1], "sound:world/ambience.wav", "CL_ParseConfigString sound registration mismatch");

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_IMAGES + 1);
MSG_WriteString(runtime.net_message, "i_health");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime, {
  registerPic: (path) => {
    registeredPics.push(path);
    return `pic:${path}`;
  }
});
assert.equal(runtime.cl.image_precache[1], "pic:i_health", "CL_ParseConfigString image registration mismatch");

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_CDTRACK);
MSG_WriteString(runtime.net_message, "7");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime, {
  onPlayCdTrack: (track, looping) => {
    playedTracks.push({ track, looping });
  }
});
assert.deepEqual(playedTracks, [{ track: 7, looping: true }], "CL_ParseConfigString cd track mismatch");

const ambienceSound = { name: "world/ambience.wav" };
runtime.cl.sound_precache[3] = ambienceSound;
const startedSounds: Array<{
  origin: [number, number, number] | null;
  ent: number;
  channel: number;
  sound: unknown;
  volume: number;
  attenuation: number;
  timeofs: number;
}> = [];
resetIncoming(runtime);
MSG_WriteByte(runtime.net_message, SND_VOLUME | SND_ATTENUATION | SND_OFFSET | SND_ENT | SND_POS);
MSG_WriteByte(runtime.net_message, 3);
MSG_WriteByte(runtime.net_message, 128);
MSG_WriteByte(runtime.net_message, 32);
MSG_WriteByte(runtime.net_message, 25);
MSG_WriteShort(runtime.net_message, (9 << 3) | 2);
MSG_WritePos(runtime.net_message, [64, 128, 16]);
runtime.net_message.readcount = 0;
const soundPacket = CL_ParseStartSoundPacket(runtime, {
  onStartSound: (origin, ent, channel, sound, volume, attenuation, timeofs) => {
    startedSounds.push({ origin, ent, channel, sound, volume, attenuation, timeofs });
  }
});
assert.equal(soundPacket.sound_num, 3, "CL_ParseStartSoundPacket sound index mismatch");
assert.equal(startedSounds.length, 1, "CL_ParseStartSoundPacket should call S_StartSound hook for precached sounds");
assert.deepEqual(startedSounds[0]?.origin, [64, 128, 16], "CL_ParseStartSoundPacket origin mismatch");
assert.equal(startedSounds[0]?.ent, 9, "CL_ParseStartSoundPacket ent mismatch");
assert.equal(startedSounds[0]?.channel, 2, "CL_ParseStartSoundPacket channel mismatch");
assert.equal(startedSounds[0]?.sound, ambienceSound, "CL_ParseStartSoundPacket sound handle mismatch");
assert.equal(startedSounds[0]?.volume, 128 / 255, "CL_ParseStartSoundPacket volume mismatch");
assert.equal(startedSounds[0]?.attenuation, 32 / 64, "CL_ParseStartSoundPacket attenuation mismatch");
assert.equal(startedSounds[0]?.timeofs, 0.025, "CL_ParseStartSoundPacket offset mismatch");

resetIncoming(runtime);
MSG_WriteByte(runtime.net_message, 0);
MSG_WriteByte(runtime.net_message, 4);
runtime.net_message.readcount = 0;
CL_ParseStartSoundPacket(runtime, {
  onStartSound: () => {
    throw new Error("CL_ParseStartSoundPacket should ignore unregistered sound indices");
  }
});

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_LIGHTS);
MSG_WriteString(runtime.net_message, "abc");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime);
assert.equal(runtime.cl.lightstyles[0].length, 3, "CL_ParseConfigString lightstyle mismatch");

runtime.cl.refresh_prepped = true;
runtime.cl.num_cl_weaponmodels = 1;
runtime.cl.cl_weaponmodels[0] = "weapon.md2";
resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_PLAYERSKINS);
MSG_WriteString(runtime.net_message, "Ranger\\female/athena");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime, {
  registerModel: (path) => `model:${path}`,
  registerSkin: (path) => `skin:${path}`,
  registerPic: (path) => `pic:${path}`
});
assert.equal(runtime.cl.clientinfo[0].name, "Ranger", "CL_ParseConfigString clientinfo name mismatch");
assert.equal(runtime.cl.clientinfo[0].model_filename, "players/female/tris.md2", "CL_ParseConfigString clientinfo model mismatch");
assert.equal(runtime.cl.clientinfo[0].weaponmodel[0], "model:players/female/weapon.md2", "CL_ParseConfigString clientinfo weapon registration mismatch");
assert.equal(runtime.cl.clientinfo[0].valid, true, "CL_ParseConfigString clientinfo validity mismatch");

let requestedDownloads = 0;
resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, -1);
MSG_WriteByte(runtime.net_message, 0);
runtime.net_message.readcount = 0;
const missingDownload = CL_ParseDownload(runtime, {
  onRequestNextDownload: () => {
    requestedDownloads += 1;
  }
});
assert.equal(missingDownload.missing, true, "CL_ParseDownload missing block mismatch");
assert.equal(requestedDownloads, 1, "CL_ParseDownload missing next-request mismatch");

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, 3);
MSG_WriteByte(runtime.net_message, 100);
MSG_WriteByte(runtime.net_message, 10);
MSG_WriteByte(runtime.net_message, 20);
MSG_WriteByte(runtime.net_message, 30);
runtime.net_message.readcount = 0;
const finalDownload = CL_ParseDownload(runtime, {
  onRequestNextDownload: () => {
    requestedDownloads += 1;
  }
});
assert.equal(finalDownload.bytes[2], 30, "CL_ParseDownload payload mismatch");
assert.equal(runtime.cls.downloadpercent, 0, "CL_ParseDownload percent reset mismatch");
assert.equal(requestedDownloads, 2, "CL_ParseDownload final next-request mismatch");

runtime.cls.realtime = 300;
runtime.cls.netchan.incoming_acknowledged = 0;
runtime.cl.cmd_time[0] = 0;
runtime.cls.demorecording = true;
runtime.cls.demowaiting = false;
runtime.cl.refresh_prepped = true;

const executedStufftexts: string[] = [];
let executedBuffer = 0;
let wroteDemo = 0;
const startedLocalSounds: string[] = [];
const parsedServerSounds: unknown[] = [];
let serverDataName = "";

resetIncoming(runtime);
MSG_WriteByte(runtime.net_message, svc_ops_e.svc_print);
MSG_WriteByte(runtime.net_message, PRINT_CHAT);
MSG_WriteString(runtime.net_message, "hello marine");
MSG_WriteByte(runtime.net_message, svc_ops_e.svc_stufftext);
MSG_WriteString(runtime.net_message, "cmd test\n");
MSG_WriteByte(runtime.net_message, svc_ops_e.svc_sound);
MSG_WriteByte(runtime.net_message, SND_ENT);
MSG_WriteByte(runtime.net_message, 3);
MSG_WriteShort(runtime.net_message, (5 << 3) | 1);
MSG_WriteByte(runtime.net_message, svc_ops_e.svc_serverdata);
MSG_WriteLong(runtime.net_message, 34);
MSG_WriteLong(runtime.net_message, 123);
MSG_WriteByte(runtime.net_message, 0);
MSG_WriteString(runtime.net_message, "baseq2");
MSG_WriteShort(runtime.net_message, 1);
MSG_WriteString(runtime.net_message, "Map Unit");
runtime.net_message.readcount = 0;
CL_ParseServerMessage(runtime, {
  onStartLocalSound: (path) => {
    startedLocalSounds.push(path);
  },
  onStartSound: (_origin, ent, channel, sound) => {
    parsedServerSounds.push({ ent, channel, sound });
  },
  onStufftext: (text) => {
    executedStufftexts.push(text);
  },
  onExecuteCommandBuffer: () => {
    executedBuffer += 1;
  },
  onServerData: (name) => {
    serverDataName = name;
  },
  onWriteDemoMessage: () => {
    wroteDemo += 1;
  }
});
assert.deepEqual(startedLocalSounds, ["misc/talk.wav"], "CL_ParseServerMessage chat sound mismatch");
assert.deepEqual(parsedServerSounds, [{ ent: 5, channel: 1, sound: ambienceSound }], "CL_ParseServerMessage sound handoff mismatch");
assert.deepEqual(executedStufftexts, ["cmd test\n"], "CL_ParseServerMessage stufftext mismatch");
assert.equal(executedBuffer, 1, "CL_ParseServerMessage command-buffer execution mismatch");
assert.equal(serverDataName, "Map Unit", "CL_ParseServerMessage serverdata handoff mismatch");
assert.equal(wroteDemo, 1, "CL_ParseServerMessage demo write mismatch");
assert.equal(runtime.cl.screen.graph_current, 1, "CL_ParseServerMessage should add one netgraph ping sample");

console.log("quake2-cl-parse: ok");
