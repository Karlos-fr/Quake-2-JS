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
  CL_ParseBaseline,
  CL_ParseDownload,
  CL_ParseDelta,
  CL_ParseEntityBits,
  CL_ParseFrame,
  CL_ParseMuzzleFlash,
  CL_ParseMuzzleFlash2,
  CL_ParseServerData,
  CL_ParseStartSoundPacket,
  CL_ParseServerMessage,
  SHOWNET,
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
  CS_SKY,
  CS_SKYAXIS,
  CS_SKYROTATE,
  MAX_CONFIGSTRINGS,
  MSG_WriteByte,
  MSG_WriteChar,
  MSG_WriteCoord,
  MSG_WriteLong,
  MSG_WritePos,
  MSG_WriteShort,
  MSG_WriteString,
  MSG_WriteAngle,
  MSG_WriteAngle16,
  MZ_BLASTER,
  MZ_SILENCED,
  MAX_EDICTS,
  PMF_TIME_TELEPORT,
  PS_BLEND,
  PS_FOV,
  PS_KICKANGLES,
  PS_M_DELTA_ANGLES,
  PS_M_FLAGS,
  PS_M_GRAVITY,
  PS_M_ORIGIN,
  PS_M_TIME,
  PS_M_TYPE,
  PS_M_VELOCITY,
  PS_RDFLAGS,
  PS_VIEWANGLES,
  PS_VIEWOFFSET,
  PS_WEAPONFRAME,
  PS_WEAPONINDEX,
  PRINT_CHAT,
  SND_ATTENUATION,
  SND_ENT,
  SND_OFFSET,
  SND_POS,
  SND_VOLUME,
  svc_ops_e,
  U_ANGLE1,
  U_ANGLE2,
  U_ANGLE3,
  U_EFFECTS8,
  U_EVENT,
  U_FRAME16,
  U_MODEL,
  U_MODEL2,
  U_MOREBITS1,
  U_MOREBITS2,
  U_MOREBITS3,
  U_NUMBER16,
  U_OLDORIGIN,
  U_ORIGIN1,
  U_ORIGIN2,
  U_ORIGIN3,
  U_REMOVE,
  U_SKIN16,
  U_SKIN8,
  U_SOLID,
  clc_ops_e,
  createEntityState,
  entity_event_t,
  pmtype_t
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
let setGameDir = "";
MSG_WriteLong(runtime.net_message, 34);
MSG_WriteLong(runtime.net_message, 99);
MSG_WriteByte(runtime.net_message, 0);
MSG_WriteString(runtime.net_message, "baseq2");
MSG_WriteShort(runtime.net_message, -1);
MSG_WriteString(runtime.net_message, "pics/test.pcx");
runtime.net_message.readcount = 0;
CL_ParseServerData(runtime, {
  onSetGameDir: (gamedir) => {
    setGameDir = gamedir;
  },
  onPlayCinematic: (name) => {
    cinematicName = name;
  }
});
assert.equal(cinematicName, "pics/test.pcx", "CL_ParseServerData cinematic handoff mismatch");
assert.equal(setGameDir, "baseq2", "CL_ParseServerData game cvar handoff mismatch");

resetIncoming(runtime);
MSG_WriteByte(runtime.net_message, (U_MODEL & 0xff) | U_MOREBITS1);
MSG_WriteByte(runtime.net_message, (U_MODEL >> 8) & 0xff);
MSG_WriteByte(runtime.net_message, 5);
MSG_WriteByte(runtime.net_message, 9);
runtime.net_message.readcount = 0;
CL_ParseBaseline(runtime);
assert.equal(runtime.cl_entities[5].baseline.number, 5, "CL_ParseBaseline entity number mismatch");
assert.equal(runtime.cl_entities[5].baseline.modelindex, 9, "CL_ParseBaseline delta payload mismatch");

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

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_SKY);
MSG_WriteString(runtime.net_message, "unit_sky");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime);
resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_SKYROTATE);
MSG_WriteString(runtime.net_message, "45");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime);
resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_SKYAXIS);
MSG_WriteString(runtime.net_message, "0 1 0");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime);
assert.equal(runtime.cl.sky.name, "unit_sky", "CL_ParseConfigString sky name mismatch");
assert.equal(runtime.cl.sky.rotate, 45, "CL_ParseConfigString sky rotate mismatch");
assert.deepEqual(runtime.cl.sky.axis, [0, 1, 0], "CL_ParseConfigString sky axis mismatch");

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, MAX_CONFIGSTRINGS);
MSG_WriteString(runtime.net_message, "bad");
runtime.net_message.readcount = 0;
assert.throws(() => CL_ParseConfigString(runtime), /configstring > MAX_CONFIGSTRINGS/, "CL_ParseConfigString bounds guard mismatch");

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
const defaultSoundPacket = CL_ParseStartSoundPacket(runtime, {
  onStartSound: () => {
    throw new Error("CL_ParseStartSoundPacket should ignore unregistered sound indices");
  }
});
assert.equal(defaultSoundPacket.volume, 1, "CL_ParseStartSoundPacket default volume mismatch");
assert.equal(defaultSoundPacket.attenuation, 1, "CL_ParseStartSoundPacket default attenuation mismatch");
assert.equal(defaultSoundPacket.ofs, 0, "CL_ParseStartSoundPacket default offset mismatch");
assert.equal(defaultSoundPacket.ent, 0, "CL_ParseStartSoundPacket default entity mismatch");
assert.equal(defaultSoundPacket.channel, 0, "CL_ParseStartSoundPacket default channel mismatch");
assert.equal(defaultSoundPacket.pos, null, "CL_ParseStartSoundPacket default position mismatch");

resetIncoming(runtime);
MSG_WriteByte(runtime.net_message, SND_ENT);
MSG_WriteByte(runtime.net_message, 3);
MSG_WriteShort(runtime.net_message, ((MAX_EDICTS + 1) << 3) | 1);
runtime.net_message.readcount = 0;
assert.throws(
  () => CL_ParseStartSoundPacket(runtime),
  /CL_ParseStartSoundPacket: ent = 1025/,
  "CL_ParseStartSoundPacket MAX_EDICTS guard mismatch"
);

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

runtime.cl.clientinfo[1].name = "";
runtime.cl.refresh_prepped = false;
resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_PLAYERSKINS + 1);
MSG_WriteString(runtime.net_message, "Sleepy\\female/athena");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime, {
  onClientinfo: () => {
    throw new Error("CL_ParseConfigString should defer clientinfo parsing until refresh_prepped");
  }
});
assert.equal(runtime.cl.configstrings[CS_PLAYERSKINS + 1], "Sleepy\\female/athena", "CL_ParseConfigString should still store deferred playerskin");
assert.equal(runtime.cl.clientinfo[1].name, "", "CL_ParseConfigString should not parse clientinfo before refresh prep");

runtime.cl.refresh_prepped = true;
runtime.cl.num_cl_weaponmodels = 2;
runtime.cl.cl_weaponmodels[0] = "weapon.md2";
runtime.cl.cl_weaponmodels[1] = "w_blaster.md2";
const fallbackAttempts: string[] = [];
resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_PLAYERSKINS + 2);
MSG_WriteString(runtime.net_message, "Fallback\\female/rare");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime, {
  registerModel: (path) => {
    fallbackAttempts.push(`model:${path}`);
    return path === "players/female/tris.md2" ? null : `model:${path}`;
  },
  registerSkin: (path) => {
    fallbackAttempts.push(`skin:${path}`);
    return path === "players/male/rare.pcx" ? null : `skin:${path}`;
  },
  registerPic: (path) => `pic:${path}`
});
assert.ok(fallbackAttempts.includes("model:players/female/tris.md2"), "CL_LoadClientinfo should try requested model first");
assert.ok(fallbackAttempts.includes("model:players/male/tris.md2"), "CL_LoadClientinfo should fall back to male model");
assert.ok(fallbackAttempts.includes("skin:players/male/rare.pcx"), "CL_LoadClientinfo should try male skin fallback");
assert.ok(fallbackAttempts.includes("skin:players/male/grunt.pcx"), "CL_LoadClientinfo should fall back to grunt skin");
assert.equal(runtime.cl.clientinfo[2].model_filename, "players/male/tris.md2", "CL_LoadClientinfo fallback model filename mismatch");
assert.equal(runtime.cl.clientinfo[2].skin_filename, "players/male/grunt.pcx", "CL_LoadClientinfo fallback skin filename mismatch");
assert.equal(runtime.cl.clientinfo[2].weaponmodel[1], "model:players/male/w_blaster.md2", "CL_LoadClientinfo fallback weapon model mismatch");

resetIncoming(runtime);
MSG_WriteShort(runtime.net_message, CS_PLAYERSKINS + 3);
MSG_WriteString(runtime.net_message, "Cyborg\\cyborg/oni");
runtime.net_message.readcount = 0;
CL_ParseConfigString(runtime, {
  registerModel: (path) => path === "players/cyborg/w_blaster.md2" ? null : `model:${path}`,
  registerSkin: (path) => `skin:${path}`,
  registerPic: (path) => `pic:${path}`
});
assert.equal(runtime.cl.clientinfo[3].weaponmodel[1], "model:players/male/w_blaster.md2", "CL_LoadClientinfo cyborg weapon fallback mismatch");

let requestedDownloads = 0;
resetIncoming(runtime);
runtime.cls.download = { partial: true };
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
assert.equal(runtime.cls.download, null, "CL_ParseDownload missing block should clear active download");

resetIncoming(runtime);
resetOutgoing(runtime);
MSG_WriteShort(runtime.net_message, 2);
MSG_WriteByte(runtime.net_message, 42);
MSG_WriteByte(runtime.net_message, 7);
MSG_WriteByte(runtime.net_message, 8);
runtime.net_message.readcount = 0;
const partialDownload = CL_ParseDownload(runtime);
const queuedDownloadCommand = String.fromCharCode(...runtime.cls.netchan.message.data.subarray(1, runtime.cls.netchan.message.cursize - 1));
assert.equal(partialDownload.missing, false, "CL_ParseDownload partial block mismatch");
assert.equal(runtime.cls.downloadpercent, 42, "CL_ParseDownload partial percent mismatch");
assert.equal(runtime.cls.netchan.message.data[0], clc_ops_e.clc_stringcmd, "CL_ParseDownload partial should queue a string command");
assert.equal(queuedDownloadCommand, "nextdl", "CL_ParseDownload partial should request the next block");

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
assert.equal(runtime.cls.download, null, "CL_ParseDownload final block should clear active download");
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
const shownetLines: string[] = [];

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
  },
  getShownet: () => 2,
  onNetDebugPrint: (line) => {
    shownetLines.push(line);
  }
});
assert.deepEqual(startedLocalSounds, ["misc/talk.wav"], "CL_ParseServerMessage chat sound mismatch");
assert.deepEqual(parsedServerSounds, [{ ent: 5, channel: 1, sound: ambienceSound }], "CL_ParseServerMessage sound handoff mismatch");
assert.deepEqual(executedStufftexts, ["cmd test\n"], "CL_ParseServerMessage stufftext mismatch");
assert.equal(executedBuffer, 1, "CL_ParseServerMessage command-buffer execution mismatch");
assert.equal(serverDataName, "Map Unit", "CL_ParseServerMessage serverdata handoff mismatch");
assert.equal(wroteDemo, 1, "CL_ParseServerMessage demo write mismatch");
assert.equal(runtime.cl.screen.graph_current, 1, "CL_ParseServerMessage should add one netgraph ping sample");
assert.ok(shownetLines.includes("------------------\n"), "CL_ParseServerMessage shownet separator mismatch");
assert.ok(shownetLines.some((line) => line.endsWith(":svc_print\n")), "CL_ParseServerMessage shownet command label mismatch");
assert.ok(shownetLines.some((line) => line.endsWith(":END OF MESSAGE\n")), "CL_ParseServerMessage shownet end marker mismatch");

resetIncoming(runtime);
const directShownetLines: string[] = [];
MSG_WriteByte(runtime.net_message, svc_ops_e.svc_nop);
runtime.net_message.readcount = 1;
SHOWNET(runtime, "svc_nop", {
  getShownet: () => 2,
  onNetDebugPrint: (line) => {
    directShownetLines.push(line);
  }
});
assert.deepEqual(directShownetLines, ["  0:svc_nop\n"], "SHOWNET direct trace mismatch");

runtime.cls.download = { partial: true };
runtime.cls.downloadpercent = 77;
resetIncoming(runtime);
MSG_WriteByte(runtime.net_message, svc_ops_e.svc_reconnect);
runtime.net_message.readcount = 0;
CL_ParseServerMessage(runtime);
assert.equal(runtime.cls.download, null, "CL_ParseServerMessage reconnect should clear active download");
assert.equal(runtime.cls.downloadpercent, 0, "CL_ParseServerMessage reconnect should reset download percent");
assert.equal(runtime.cls.state, connstate_t.ca_connecting, "CL_ParseServerMessage reconnect state mismatch");

const entityBitsRuntime = createClientRuntime();
const extendedBits = U_MOREBITS1 | U_MOREBITS2 | U_MOREBITS3 | U_NUMBER16 | U_MODEL | U_MODEL2 | U_SOLID;
MSG_WriteByte(entityBitsRuntime.net_message, extendedBits & 0xff);
MSG_WriteByte(entityBitsRuntime.net_message, (extendedBits >> 8) & 0xff);
MSG_WriteByte(entityBitsRuntime.net_message, (extendedBits >> 16) & 0xff);
MSG_WriteByte(entityBitsRuntime.net_message, (extendedBits >> 24) & 0xff);
MSG_WriteShort(entityBitsRuntime.net_message, 513);
entityBitsRuntime.net_message.readcount = 0;
assert.deepEqual(
  CL_ParseEntityBits(entityBitsRuntime),
  { bits: extendedBits, number: 513 },
  "CL_ParseEntityBits should preserve extended bit headers and 16-bit entity numbers"
);

const deltaRuntime = createClientRuntime();
const deltaFrom = createEntityState();
deltaFrom.origin = [1, 2, 3];
deltaFrom.angles = [4, 5, 6];
deltaFrom.modelindex = 9;
deltaFrom.frame = 1;
const deltaTo = createEntityState();
const deltaBits = U_MODEL | U_FRAME16 | U_SKIN8 | U_SKIN16 | U_EFFECTS8 | U_ORIGIN1 | U_ORIGIN2 | U_ORIGIN3 | U_ANGLE1 | U_ANGLE2 | U_ANGLE3 | U_OLDORIGIN | U_EVENT | U_SOLID;
MSG_WriteByte(deltaRuntime.net_message, 17);
MSG_WriteShort(deltaRuntime.net_message, 321);
MSG_WriteLong(deltaRuntime.net_message, 0x11223344);
MSG_WriteByte(deltaRuntime.net_message, 0x7f);
MSG_WriteCoord(deltaRuntime.net_message, 12.25);
MSG_WriteCoord(deltaRuntime.net_message, -8.5);
MSG_WriteCoord(deltaRuntime.net_message, 0.125);
MSG_WriteAngle(deltaRuntime.net_message, 90);
MSG_WriteAngle(deltaRuntime.net_message, 180);
MSG_WriteAngle(deltaRuntime.net_message, 270);
MSG_WritePos(deltaRuntime.net_message, [5, 6, 7]);
MSG_WriteByte(deltaRuntime.net_message, entity_event_t.EV_OTHER_TELEPORT);
MSG_WriteShort(deltaRuntime.net_message, 0x1234);
deltaRuntime.net_message.readcount = 0;
CL_ParseDelta(deltaRuntime, deltaFrom, deltaTo, 42, deltaBits);
assert.equal(deltaTo.number, 42, "CL_ParseDelta should stamp the new entity number");
assert.equal(deltaTo.modelindex, 17, "CL_ParseDelta should parse modelindex");
assert.equal(deltaTo.frame, 321, "CL_ParseDelta should parse 16-bit frame");
assert.equal(deltaTo.skinnum, 0x11223344, "CL_ParseDelta should parse combined 32-bit skinnum");
assert.equal(deltaTo.effects, 0x7f, "CL_ParseDelta should parse 8-bit effects");
assert.deepEqual(deltaTo.origin, [12.25, -8.5, 0.125], "CL_ParseDelta should parse coordinates");
assert.deepEqual(deltaTo.old_origin, [5, 6, 7], "CL_ParseDelta should parse explicit old_origin");
assert.equal(deltaTo.event, entity_event_t.EV_OTHER_TELEPORT, "CL_ParseDelta should parse events");
assert.equal(deltaTo.solid, 0x1234, "CL_ParseDelta should parse solid");

const frameRuntime = createClientRuntime();
frameRuntime.cls.serverProtocol = 34;
frameRuntime.cl.time = 400;
frameRuntime.cl_entities[5].baseline.modelindex = 2;
frameRuntime.cl_entities[5].baseline.origin = [10, 20, 30];
frameRuntime.cl_entities[5].baseline.old_origin = [9, 19, 29];
frameRuntime.cl_parse_entities[0].number = 3;
frameRuntime.cl_parse_entities[0].modelindex = 8;
frameRuntime.cl_parse_entities[0].origin = [1, 1, 1];
frameRuntime.cl_parse_entities[0].old_origin = [0, 0, 0];
frameRuntime.cl_parse_entities[1].number = 7;
frameRuntime.cl_parse_entities[1].modelindex = 9;
frameRuntime.cl_parse_entities[1].origin = [2, 2, 2];
frameRuntime.cl_parse_entities[1].old_origin = [1, 1, 1];
frameRuntime.cl.parse_entities = 2;
const oldFrame = frameRuntime.cl.frames[4];
oldFrame.valid = true;
oldFrame.serverframe = 4;
oldFrame.parse_entities = 0;
oldFrame.num_entities = 2;
oldFrame.playerstate.pmove.pm_type = pmtype_t.PM_NORMAL;
oldFrame.playerstate.pmove.velocity = [1, 2, 3];
oldFrame.playerstate.pmove.pm_flags = 0;
oldFrame.playerstate.pmove.gravity = 600;
oldFrame.playerstate.viewoffset = [1, 2, 3];
oldFrame.playerstate.viewangles = [10, 20, 30];
oldFrame.playerstate.fov = 80;
oldFrame.playerstate.rdflags = 0;
oldFrame.playerstate.stats[3] = 33;
oldFrame.playerstate.stats[5] = 55;

MSG_WriteLong(frameRuntime.net_message, 5);
MSG_WriteLong(frameRuntime.net_message, 4);
MSG_WriteByte(frameRuntime.net_message, 0);
MSG_WriteByte(frameRuntime.net_message, 2);
MSG_WriteByte(frameRuntime.net_message, 0xaa);
MSG_WriteByte(frameRuntime.net_message, 0x55);
MSG_WriteByte(frameRuntime.net_message, svc_ops_e.svc_playerinfo);
MSG_WriteShort(
  frameRuntime.net_message,
  PS_M_TYPE |
    PS_M_ORIGIN |
    PS_M_TIME |
    PS_M_FLAGS |
    PS_M_GRAVITY |
    PS_M_DELTA_ANGLES |
    PS_VIEWOFFSET |
    PS_VIEWANGLES |
    PS_KICKANGLES |
    PS_WEAPONINDEX |
    PS_WEAPONFRAME |
    PS_BLEND |
    PS_FOV |
    PS_RDFLAGS
);
MSG_WriteByte(frameRuntime.net_message, pmtype_t.PM_DEAD);
MSG_WriteShort(frameRuntime.net_message, 80);
MSG_WriteShort(frameRuntime.net_message, 160);
MSG_WriteShort(frameRuntime.net_message, 240);
MSG_WriteByte(frameRuntime.net_message, 7);
MSG_WriteByte(frameRuntime.net_message, PMF_TIME_TELEPORT);
MSG_WriteShort(frameRuntime.net_message, 800);
MSG_WriteShort(frameRuntime.net_message, 1000);
MSG_WriteShort(frameRuntime.net_message, 2000);
MSG_WriteShort(frameRuntime.net_message, 3000);
MSG_WriteChar(frameRuntime.net_message, 4);
MSG_WriteChar(frameRuntime.net_message, -8);
MSG_WriteChar(frameRuntime.net_message, 88);
MSG_WriteAngle16(frameRuntime.net_message, 45);
MSG_WriteAngle16(frameRuntime.net_message, 90);
MSG_WriteAngle16(frameRuntime.net_message, 180);
MSG_WriteChar(frameRuntime.net_message, 2);
MSG_WriteChar(frameRuntime.net_message, 4);
MSG_WriteChar(frameRuntime.net_message, 6);
MSG_WriteByte(frameRuntime.net_message, 12);
MSG_WriteByte(frameRuntime.net_message, 9);
MSG_WriteChar(frameRuntime.net_message, 1);
MSG_WriteChar(frameRuntime.net_message, 2);
MSG_WriteChar(frameRuntime.net_message, 3);
MSG_WriteChar(frameRuntime.net_message, 4);
MSG_WriteChar(frameRuntime.net_message, 5);
MSG_WriteChar(frameRuntime.net_message, 6);
MSG_WriteByte(frameRuntime.net_message, 64);
MSG_WriteByte(frameRuntime.net_message, 128);
MSG_WriteByte(frameRuntime.net_message, 192);
MSG_WriteByte(frameRuntime.net_message, 255);
MSG_WriteByte(frameRuntime.net_message, 100);
MSG_WriteByte(frameRuntime.net_message, 4);
MSG_WriteLong(frameRuntime.net_message, 1 << 3);
MSG_WriteShort(frameRuntime.net_message, 444);
MSG_WriteByte(frameRuntime.net_message, svc_ops_e.svc_packetentities);
MSG_WriteByte(frameRuntime.net_message, U_MOREBITS1);
MSG_WriteByte(frameRuntime.net_message, (U_MODEL >> 8) & 0xff);
MSG_WriteByte(frameRuntime.net_message, 5);
MSG_WriteByte(frameRuntime.net_message, 11);
MSG_WriteByte(frameRuntime.net_message, U_REMOVE);
MSG_WriteByte(frameRuntime.net_message, 7);
MSG_WriteByte(frameRuntime.net_message, U_EVENT);
MSG_WriteByte(frameRuntime.net_message, 9);
MSG_WriteByte(frameRuntime.net_message, entity_event_t.EV_FOOTSTEP);
MSG_WriteByte(frameRuntime.net_message, 0);
MSG_WriteByte(frameRuntime.net_message, 0);
frameRuntime.net_message.readcount = 0;
const frameEntityEvents: unknown[] = [];
CL_ParseFrame(frameRuntime, { onEntityEvent: (event) => frameEntityEvents.push(event) });
assert.equal(frameRuntime.cl.frame.valid, true, "CL_ParseFrame should accept a valid delta frame");
assert.equal(frameRuntime.cl.frame.parse_entities, 2, "CL_ParsePacketEntities should append after the previous parse ring");
assert.equal(frameRuntime.cl.frame.num_entities, 3, "CL_ParsePacketEntities should include unchanged, baseline and event entities but not removed ones");
assert.equal(frameRuntime.cl_parse_entities[2].number, 3, "CL_ParsePacketEntities should carry unchanged old entities before new baselines");
assert.equal(frameRuntime.cl_parse_entities[3].number, 5, "CL_ParsePacketEntities should parse new baseline entities");
assert.equal(frameRuntime.cl_parse_entities[3].modelindex, 11, "CL_DeltaEntity should apply packet bits over the baseline");
assert.equal(frameRuntime.cl_entities[5].serverframe, 5, "CL_DeltaEntity should update centity serverframe");
assert.equal(frameRuntime.cl_entities[5].trailcount, 1024, "CL_DeltaEntity should reset trailcount for newly linked entities");
assert.deepEqual(frameRuntime.cl.frame.areabits.subarray(0, 2), new Uint8Array([0xaa, 0x55]), "CL_ParseFrame should preserve areabits for renderer visibility");
assert.equal(frameRuntime.cl.frame.playerstate.pmove.pm_type, pmtype_t.PM_DEAD, "CL_ParsePlayerstate should parse pm_type");
assert.deepEqual(frameRuntime.cl.frame.playerstate.pmove.origin, [80, 160, 240], "CL_ParsePlayerstate should parse pmove origin shorts");
assert.deepEqual(frameRuntime.cl.frame.playerstate.pmove.velocity, [1, 2, 3], "CL_ParsePlayerstate should inherit omitted pmove velocity from the delta frame");
assert.equal(frameRuntime.cl.frame.playerstate.pmove.pm_time, 7, "CL_ParsePlayerstate should parse pm_time");
assert.equal(frameRuntime.cl.frame.playerstate.pmove.pm_flags, PMF_TIME_TELEPORT, "CL_ParsePlayerstate should parse pm_flags");
assert.equal(frameRuntime.cl.frame.playerstate.pmove.gravity, 800, "CL_ParsePlayerstate should parse gravity");
assert.deepEqual(frameRuntime.cl.frame.playerstate.pmove.delta_angles, [1000, 2000, 3000], "CL_ParsePlayerstate should parse delta angles");
assert.deepEqual(frameRuntime.cl.frame.playerstate.viewoffset, [1, -2, 22], "CL_ParsePlayerstate should scale view offsets by 0.25");
assert.deepEqual(frameRuntime.cl.frame.playerstate.viewangles, [45, 90, -180], "CL_ParsePlayerstate should parse 16-bit view angles for camera state");
assert.deepEqual(frameRuntime.cl.frame.playerstate.kick_angles, [0.5, 1, 1.5], "CL_ParsePlayerstate should scale kick angles by 0.25");
assert.equal(frameRuntime.cl.frame.playerstate.gunindex, 12, "CL_ParsePlayerstate should parse gun index");
assert.equal(frameRuntime.cl.frame.playerstate.gunframe, 9, "CL_ParsePlayerstate should parse gun frame");
assert.deepEqual(frameRuntime.cl.frame.playerstate.gunoffset, [0.25, 0.5, 0.75], "CL_ParsePlayerstate should scale gun offsets by 0.25");
assert.deepEqual(frameRuntime.cl.frame.playerstate.gunangles, [1, 1.25, 1.5], "CL_ParsePlayerstate should scale gun angles by 0.25");
assert.deepEqual(frameRuntime.cl.frame.playerstate.blend, [64 / 255, 128 / 255, 192 / 255, 1], "CL_ParsePlayerstate should normalize blend bytes");
assert.equal(frameRuntime.cl.frame.playerstate.fov, 100, "CL_ParsePlayerstate should parse fov");
assert.equal(frameRuntime.cl.frame.playerstate.rdflags, 4, "CL_ParsePlayerstate should parse rdflags consumed by renderer adapters");
assert.equal(frameRuntime.cl.frame.playerstate.stats[3], 444, "CL_ParsePlayerstate should parse statbits-selected stats");
assert.equal(frameRuntime.cl.frame.playerstate.stats[5], 55, "CL_ParsePlayerstate should inherit omitted stats from the delta frame");
assert.equal(frameRuntime.cl.predicted_origin[0], 10, "CL_ParseFrame should seed predicted origin X from parsed playerstate");
assert.equal(frameRuntime.cl.predicted_origin[1], 20, "CL_ParseFrame should seed predicted origin Y from parsed playerstate");
assert.equal(frameRuntime.cl.predicted_origin[2], 30, "CL_ParseFrame should seed predicted origin Z from parsed playerstate");
assert.deepEqual(frameRuntime.cl.predicted_angles, [45, 90, -180], "CL_ParseFrame should seed predicted angles from parsed playerstate");
assert.equal(frameEntityEvents.length, 1, "CL_ParseFrame should fire parsed entity events through the runtime hook");

console.log("quake2-cl-parse: ok");
