/**
 * File: quake2-cl-parse.ts
 * Purpose: Verify the closed `client/cl_parse.c` behavior anchored in `packages/client/src/parse.ts`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the client parse module.
 *
 * Dependencies:
 * - packages/client/src/parse.ts
 * - packages/client/src/types.ts
 * - packages/qcommon/src/messages.ts
 */

import { strict as assert } from "node:assert";

import {
  CL_ParseConfigString,
  CL_ParseDownload,
  CL_ParseServerData,
  CL_ParseServerMessage,
  CL_WriteStringCmd
} from "../../packages/client/src/parse.js";
import { createClientRuntime, connstate_t } from "../../packages/client/src/types.js";
import {
  CS_CDTRACK,
  CS_IMAGES,
  CS_LIGHTS,
  CS_MODELS,
  CS_PLAYERSKINS,
  CS_SOUNDS,
  MSG_WriteByte,
  MSG_WriteLong,
  MSG_WriteShort,
  MSG_WriteString,
  PRINT_CHAT,
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
let serverDataName = "";

resetIncoming(runtime);
MSG_WriteByte(runtime.net_message, svc_ops_e.svc_print);
MSG_WriteByte(runtime.net_message, PRINT_CHAT);
MSG_WriteString(runtime.net_message, "hello marine");
MSG_WriteByte(runtime.net_message, svc_ops_e.svc_stufftext);
MSG_WriteString(runtime.net_message, "cmd test\n");
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
assert.deepEqual(executedStufftexts, ["cmd test\n"], "CL_ParseServerMessage stufftext mismatch");
assert.equal(executedBuffer, 1, "CL_ParseServerMessage command-buffer execution mismatch");
assert.equal(serverDataName, "Map Unit", "CL_ParseServerMessage serverdata handoff mismatch");
assert.equal(wroteDemo, 1, "CL_ParseServerMessage demo write mismatch");
assert.equal(runtime.cl.screen.graph_current, 1, "CL_ParseServerMessage should add one netgraph ping sample");

console.log("quake2-cl-parse: ok");
