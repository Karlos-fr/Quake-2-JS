/**
 * File: quake2-qcommon-header.ts
 * Purpose: Verify the principal TypeScript attachment point for `qcommon/qcommon.h`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - packages/qcommon/src/qcommon.ts
 * - packages/qcommon/src/protocol.ts
 * - packages/qcommon/src/messages.ts
 * - packages/memory/src/sizebuf.ts
 */

import { strict as assert } from "node:assert";

import { createSizeBuffer, SZ_Print } from "../../packages/memory/src/index.js";
import { COM_Argv, COM_InitArgv, createCommonRuntime } from "../../packages/qcommon/src/common.js";
import {
  Cbuf_AddEarlyCommands,
  Cbuf_AddLateCommands,
  Cmd_ForwardToServer,
  Cmd_TokenizeString,
  createCommandRuntime
} from "../../packages/qcommon/src/cmd.js";
import {
  BUILDSTRING,
  CM_ANGLE1,
  CM_BUTTONS,
  COM_BlockSequenceCRCByte,
  CPUSTRING,
  CRC_Block,
  CRC_Init,
  CRC_ProcessByte,
  CRC_Value,
  Com_BlockChecksum,
  Com_DPrintf,
  Com_Error,
  Com_Quit,
  Com_ServerState,
  Com_SetServerState,
  Con_Print,
  CopyString,
  CL_Drop,
  CL_Frame,
  CL_Init,
  CL_Shutdown,
  createNetchan,
  createQcommonGlobals,
  createQcommonHostRuntime,
  createQcommonMiscRuntime,
  crand,
  ERR_DROP,
  ERR_FATAL,
  ERR_QUIT,
  frand,
  MAX_LATENT,
  MAX_MSGLEN,
  NET_AdrToString,
  NET_CompareAdr,
  NET_CompareBaseAdr,
  NET_GetPacket,
  NET_Init,
  NET_IsLocalAddress,
  NET_StringToAdr,
  Netchan_CanReliable,
  Netchan_Init,
  Netchan_NeedReliable,
  Netchan_OutOfBand,
  Netchan_OutOfBandPrint,
  Netchan_Process,
  Netchan_Setup,
  Netchan_Transmit,
  netadrtype_t,
  netsrc_t,
  NUMVERTEXNORMALS,
  OLD_AVG,
  PACKET_HEADER,
  PORT_ANY,
  PORT_CLIENT,
  PORT_MASTER,
  PORT_SERVER,
  Qcommon_Frame,
  Qcommon_Init,
  Qcommon_Shutdown,
  SCR_BeginLoadingPlaque,
  SCR_DebugGraph,
  SV_Frame,
  SV_Init,
  SV_Shutdown,
  Sys_AppActivate,
  Sys_ConsoleInput,
  Sys_ConsoleOutput,
  Sys_CopyProtect,
  Sys_GetClipboardData,
  Sys_GetGameAPI,
  Sys_Init,
  Sys_Quit,
  Sys_SendKeyEvents,
  Sys_UnloadGame,
  VERSION,
  createNetAdr,
  createQcommonNetRuntime,
  Z_Free,
  Z_FreeTags,
  Z_Malloc,
  Z_TagMalloc
} from "../../packages/qcommon/src/qcommon.js";
import {
  MSG_BeginReading,
  MSG_ReadByte,
  MSG_ReadDeltaUsercmd,
  MSG_ReadDir,
  MSG_ReadLong,
  MSG_ReadShort,
  MSG_ReadString,
  MSG_WriteByte,
  MSG_WriteDeltaEntity,
  MSG_WriteDeltaUsercmd,
  MSG_WriteDir,
  MSG_WriteLong,
  MSG_WriteShort,
  MSG_WriteString
} from "../../packages/qcommon/src/messages.js";
import {
  BASEDIRNAME,
  DEFAULT_SOUND_PACKET_ATTENUATION,
  DEFAULT_SOUND_PACKET_VOLUME,
  PROTOCOL_VERSION,
  U_ANGLE1,
  U_ANGLE2,
  U_ANGLE3,
  U_EFFECTS16,
  U_EFFECTS8,
  U_EVENT,
  U_FRAME16,
  U_FRAME8,
  U_MODEL,
  U_MODEL2,
  U_MODEL3,
  U_MODEL4,
  U_MOREBITS1,
  U_MOREBITS2,
  U_MOREBITS3,
  U_NUMBER16,
  U_OLDORIGIN,
  U_ORIGIN1,
  U_ORIGIN2,
  U_ORIGIN3,
  U_RENDERFX16,
  U_RENDERFX8,
  U_SKIN16,
  U_SKIN8,
  U_SOLID,
  U_SOUND,
  UPDATE_BACKUP,
  UPDATE_MASK,
  clc_ops_e,
  svc_ops_e
} from "../../packages/qcommon/src/protocol.js";
import { MAX_EDICTS, createEntityState, type usercmd_t } from "../../packages/qcommon/src/q_shared.js";

assert.equal(VERSION, 3.19, "VERSION mismatch");
assert.equal(PORT_MASTER, 27900, "PORT_MASTER mismatch");
assert.equal(PORT_CLIENT, 27901, "PORT_CLIENT mismatch");
assert.equal(PORT_SERVER, 27910, "PORT_SERVER mismatch");
assert.equal(PORT_ANY, -1, "PORT_ANY mismatch");
assert.equal(MAX_MSGLEN, 1400, "MAX_MSGLEN mismatch");
assert.equal(PACKET_HEADER, 10, "PACKET_HEADER mismatch");
assert.equal(OLD_AVG, 0.99, "OLD_AVG mismatch");
assert.equal(MAX_LATENT, 32, "MAX_LATENT mismatch");
assert.equal(ERR_FATAL, 0, "ERR_FATAL mismatch");
assert.equal(ERR_DROP, 1, "ERR_DROP mismatch");
assert.equal(ERR_QUIT, 2, "ERR_QUIT mismatch");
assert.equal(NUMVERTEXNORMALS, 162, "NUMVERTEXNORMALS mismatch");
assert.equal(PROTOCOL_VERSION, 34, "PROTOCOL_VERSION mismatch");
assert.equal(UPDATE_BACKUP, 16, "UPDATE_BACKUP mismatch");
assert.equal(UPDATE_MASK, 15, "UPDATE_MASK mismatch");
assert.equal(DEFAULT_SOUND_PACKET_VOLUME, 1.0, "DEFAULT_SOUND_PACKET_VOLUME mismatch");
assert.equal(DEFAULT_SOUND_PACKET_ATTENUATION, 1.0, "DEFAULT_SOUND_PACKET_ATTENUATION mismatch");
assert.equal(CM_ANGLE1, 1 << 0, "CM_ANGLE1 mismatch");
assert.equal(CM_BUTTONS, 1 << 6, "CM_BUTTONS mismatch");
assert.equal(BUILDSTRING, "TypeScript", "BUILDSTRING mismatch");
assert.equal(CPUSTRING, "portable", "CPUSTRING mismatch");
assert.equal(BASEDIRNAME, "baseq2", "BASEDIRNAME mismatch");

let crc = CRC_Init();
for (const byte of new Uint8Array([49, 50, 51, 52, 53, 54, 55, 56, 57])) {
  crc = CRC_ProcessByte(crc, byte);
}
assert.equal(CRC_Value(crc), 0x29b1, "CRC iterative mismatch");
assert.equal(CRC_Block(new Uint8Array([49, 50, 51, 52, 53, 54, 55, 56, 57])), 0x29b1, "CRC block mismatch");
assert.equal(COM_BlockSequenceCRCByte(new Uint8Array([1, 2, 3, 4, 5]), 5, 7), 201, "COM_BlockSequenceCRCByte mismatch");
assert.equal(Com_BlockChecksum(new Uint8Array([97, 98, 99])), 1570836014, "Com_BlockChecksum mismatch");

const globals = createQcommonGlobals();
assert.equal(Com_ServerState(globals), 0, "Com_ServerState default mismatch");
Com_SetServerState(globals, 2);
assert.equal(Com_ServerState(globals), 2, "Com_SetServerState mismatch");
assert.equal(CopyString("baseq2"), "baseq2", "CopyString mismatch");

const printed: string[] = [];
const misc = createQcommonMiscRuntime({
  onPrintf: (message) => printed.push(message)
});
Com_DPrintf(globals, misc, "hidden");
assert.deepEqual(printed, [], "Com_DPrintf should respect developer");
globals.developer = {
  name: "developer",
  string: "1",
  latched_string: null,
  flags: 0,
  modified: false,
  value: 1
};
Com_DPrintf(globals, misc, "visible");
assert.deepEqual(printed, ["visible"], "Com_DPrintf output mismatch");

Qcommon_Init(misc);
assert.equal(misc.initialized, true, "Qcommon_Init mismatch");
Qcommon_Frame(misc, 16);
assert.equal(misc.last_frame_msec, 16, "Qcommon_Frame mismatch");
const tag0 = Z_Malloc(misc, 8);
const tag3 = Z_TagMalloc(misc, 4, 3);
assert.equal(tag0.length, 8, "Z_Malloc length mismatch");
assert.equal(tag3.length, 4, "Z_TagMalloc length mismatch");
assert.equal(tag3[0], 0, "Z_TagMalloc zero-fill mismatch");
Z_Free(misc, tag0);
assert.equal(misc.zone_allocations.has(tag0), false, "Z_Free mismatch");
Z_FreeTags(misc, 3);
assert.equal(misc.zone_allocations.has(tag3), false, "Z_FreeTags mismatch");
Qcommon_Shutdown(misc);
assert.equal(misc.initialized, false, "Qcommon_Shutdown mismatch");

assert.throws(
  () => Com_Error(createQcommonMiscRuntime(), ERR_DROP, "boom"),
  (error: unknown) =>
    error instanceof Error &&
    "signal" in error &&
    "code" in error &&
    (error as { signal: string; code: number }).signal === "error" &&
    (error as { signal: string; code: number }).code === ERR_DROP,
  "Com_Error mismatch"
);
assert.throws(
  () => Com_Quit(createQcommonMiscRuntime()),
  (error: unknown) =>
    error instanceof Error &&
    "signal" in error &&
    "code" in error &&
    (error as { signal: string; code: number }).signal === "quit" &&
    (error as { signal: string; code: number }).code === ERR_QUIT,
  "Com_Quit mismatch"
);

const hostEvents: string[] = [];
const host = createQcommonHostRuntime({
  sysInit: () => hostEvents.push("sysInit"),
  sysAppActivate: () => hostEvents.push("sysAppActivate"),
  sysUnloadGame: () => hostEvents.push("sysUnloadGame"),
  sysGetGameAPI: (parms) => ({ parms }),
  sysConsoleInput: () => "status",
  sysConsoleOutput: (text) => hostEvents.push(`sysConsoleOutput:${text}`),
  sysSendKeyEvents: () => hostEvents.push("sysSendKeyEvents"),
  sysGetClipboardData: () => "clipboard",
  sysCopyProtect: () => hostEvents.push("sysCopyProtect"),
  clInit: () => hostEvents.push("clInit"),
  clDrop: () => hostEvents.push("clDrop"),
  clShutdown: () => hostEvents.push("clShutdown"),
  clFrame: (msec) => hostEvents.push(`clFrame:${msec}`),
  conPrint: (text) => hostEvents.push(`conPrint:${text}`),
  scrBeginLoadingPlaque: () => hostEvents.push("scrBeginLoadingPlaque"),
  svInit: () => hostEvents.push("svInit"),
  svShutdown: (finalmsg, reconnect) => hostEvents.push(`svShutdown:${finalmsg}:${reconnect}`),
  svFrame: (msec) => hostEvents.push(`svFrame:${msec}`),
  scrDebugGraph: (value, color) => hostEvents.push(`scrDebugGraph:${value}:${color}`),
  sysQuit: () => {
    throw new Error("host quit");
  }
});
Sys_Init(host);
Sys_AppActivate(host);
Sys_UnloadGame(host);
assert.deepEqual(Sys_GetGameAPI(host, 123), { parms: 123 }, "Sys_GetGameAPI mismatch");
assert.equal(Sys_ConsoleInput(host), "status", "Sys_ConsoleInput mismatch");
Sys_ConsoleOutput(host, "line");
Sys_SendKeyEvents(host);
assert.equal(Sys_GetClipboardData(host), "clipboard", "Sys_GetClipboardData mismatch");
Sys_CopyProtect(host);
CL_Init(host);
CL_Drop(host);
CL_Shutdown(host);
CL_Frame(host, 33);
Con_Print(host, "hello");
SCR_BeginLoadingPlaque(host);
SV_Init(host);
SV_Shutdown(host, "bye", true);
SV_Frame(host, 44);
SCR_DebugGraph(host, 1.5, 7);
assert.deepEqual(host.debugGraph, [{ value: 1.5, color: 7 }], "SCR_DebugGraph storage mismatch");
assert.throws(() => Sys_Quit(host), /host quit/, "Sys_Quit host mismatch");
assert.deepEqual(hostEvents, [
  "sysInit",
  "sysAppActivate",
  "sysUnloadGame",
  "sysConsoleOutput:line",
  "sysSendKeyEvents",
  "sysCopyProtect",
  "clInit",
  "clDrop",
  "clShutdown",
  "clFrame:33",
  "conPrint:hello",
  "scrBeginLoadingPlaque",
  "svInit",
  "svShutdown:bye:true",
  "svFrame:44",
  "scrDebugGraph:1.5:7"
], "host tail mismatch");

const random = frand();
assert.ok(random >= 0 && random < 1, "frand range mismatch");
const centered = crand();
assert.ok(centered >= -1 && centered < 1, "crand range mismatch");

const netchan = createNetchan(netsrc_t.NS_SERVER);
assert.equal(netchan.sock, netsrc_t.NS_SERVER, "createNetchan sock mismatch");
assert.equal(netchan.remote_address.type, netadrtype_t.NA_LOOPBACK, "createNetchan address type mismatch");
assert.equal(netchan.message_buf.length, MAX_MSGLEN - 16, "createNetchan message_buf mismatch");
assert.equal(netchan.reliable_buf.length, MAX_MSGLEN - 16, "createNetchan reliable_buf mismatch");

const parsedAdr = createNetAdr();
assert.equal(NET_StringToAdr("127.0.0.1:27910", parsedAdr), true, "NET_StringToAdr parse mismatch");
assert.equal(parsedAdr.type, netadrtype_t.NA_IP, "NET_StringToAdr type mismatch");
assert.equal(parsedAdr.port, 27910, "NET_StringToAdr port mismatch");
assert.equal(NET_AdrToString(parsedAdr), "127.0.0.1:27910", "NET_AdrToString mismatch");
assert.equal(NET_IsLocalAddress(createNetAdr(netadrtype_t.NA_LOOPBACK)), true, "NET_IsLocalAddress mismatch");
const parsedAdrCopy = createNetAdr();
NET_StringToAdr("127.0.0.1:27910", parsedAdrCopy);
assert.equal(NET_CompareAdr(parsedAdr, parsedAdrCopy), true, "NET_CompareAdr mismatch");
parsedAdrCopy.port = 27901;
assert.equal(NET_CompareAdr(parsedAdr, parsedAdrCopy), false, "NET_CompareAdr port mismatch");
assert.equal(NET_CompareBaseAdr(parsedAdr, parsedAdrCopy), true, "NET_CompareBaseAdr mismatch");

const sentPackets: Array<{ sock: netsrc_t; data: Uint8Array; to: string }> = [];
const incomingPackets = [
  {
    from: parsedAdr,
    data: new Uint8Array([9, 8, 7])
  }
];
let fakeNow = 1234;
const net = createQcommonNetRuntime({
  now: () => fakeNow,
  sendPacket: (sock, data, to) => {
    sentPackets.push({ sock, data: new Uint8Array(data), to: NET_AdrToString(to) });
  },
  getPacket: () => incomingPackets.shift() ?? null
});
NET_Init(net);
assert.equal(net.qport, 1234 & 0xffff, "NET_Init qport mismatch");
assert.equal(NET_GetPacket(net, netsrc_t.NS_CLIENT), true, "NET_GetPacket mismatch");
assert.equal(NET_AdrToString(net.net_from), "127.0.0.1:27910", "NET_GetPacket source mismatch");
assert.deepEqual(Array.from(net.net_message.data.subarray(0, net.net_message.cursize)), [9, 8, 7], "NET_GetPacket payload mismatch");
assert.equal(NET_GetPacket(net, netsrc_t.NS_CLIENT), false, "NET_GetPacket empty mismatch");

Netchan_Init(net);
assert.equal(net.qport, 1234 & 0xffff, "Netchan_Init qport mismatch");
const clientChan = createNetchan(netsrc_t.NS_CLIENT);
Netchan_Setup(net, netsrc_t.NS_CLIENT, clientChan, parsedAdr, 55);
assert.equal(clientChan.outgoing_sequence, 1, "Netchan_Setup outgoing_sequence mismatch");
assert.equal(clientChan.qport, 55, "Netchan_Setup qport mismatch");
assert.equal(clientChan.message.allowoverflow, true, "Netchan_Setup allowoverflow mismatch");
assert.equal(Netchan_CanReliable(clientChan), true, "Netchan_CanReliable mismatch");
clientChan.message_buf[0] = 42;
clientChan.message.cursize = 1;
assert.equal(Netchan_NeedReliable(clientChan), true, "Netchan_NeedReliable mismatch");
Netchan_Transmit(net, clientChan, 2, new Uint8Array([1, 2]));
assert.equal(sentPackets.length >= 1, true, "Netchan_Transmit send mismatch");
const transmitted = sentPackets[sentPackets.length - 1]!;
const transmittedMessage = createSizeBuffer(new Uint8Array(transmitted.data));
transmittedMessage.cursize = transmitted.data.length;
MSG_BeginReading(transmittedMessage);
assert.equal(MSG_ReadLong(transmittedMessage), -2147483647, "Netchan_Transmit w1 mismatch");
assert.equal(MSG_ReadLong(transmittedMessage), 0, "Netchan_Transmit w2 mismatch");
assert.equal(MSG_ReadShort(transmittedMessage), net.qport, "Netchan_Transmit qport write mismatch");
assert.equal(MSG_ReadByte(transmittedMessage), 42, "Netchan_Transmit reliable byte mismatch");
assert.equal(MSG_ReadByte(transmittedMessage), 1, "Netchan_Transmit unreliable first byte mismatch");
assert.equal(MSG_ReadByte(transmittedMessage), 2, "Netchan_Transmit unreliable second byte mismatch");

const serverChan = createNetchan(netsrc_t.NS_SERVER);
Netchan_Setup(net, netsrc_t.NS_SERVER, serverChan, parsedAdr, 0);
const incomingMessage = createSizeBuffer(32);
MSG_WriteLong(incomingMessage, (1 | (1 << 31)) >> 0);
MSG_WriteLong(incomingMessage, 0);
MSG_WriteShort(incomingMessage, 77);
MSG_WriteByte(incomingMessage, 99);
fakeNow = 4321;
assert.equal(Netchan_Process(net, serverChan, incomingMessage), true, "Netchan_Process mismatch");
assert.equal(serverChan.incoming_sequence, 1, "Netchan_Process sequence mismatch");
assert.equal(serverChan.incoming_reliable_sequence, 1, "Netchan_Process reliable toggle mismatch");
assert.equal(serverChan.last_received, 4321, "Netchan_Process timestamp mismatch");
assert.equal(MSG_ReadByte(incomingMessage), 99, "Netchan_Process payload offset mismatch");

Netchan_OutOfBand(net, netsrc_t.NS_CLIENT, parsedAdr, 3, new Uint8Array([5, 6, 7]));
Netchan_OutOfBandPrint(net, netsrc_t.NS_CLIENT, parsedAdr, "ping");
const outOfBandBinary = sentPackets[sentPackets.length - 2]!;
const outOfBandPrint = sentPackets[sentPackets.length - 1]!;
const binaryMessage = createSizeBuffer(new Uint8Array(outOfBandBinary.data));
binaryMessage.cursize = outOfBandBinary.data.length;
MSG_BeginReading(binaryMessage);
assert.equal(MSG_ReadLong(binaryMessage), -1, "Netchan_OutOfBand header mismatch");
assert.deepEqual(Array.from(binaryMessage.data.subarray(binaryMessage.readcount, binaryMessage.cursize)), [5, 6, 7], "Netchan_OutOfBand payload mismatch");
const printMessage = createSizeBuffer(new Uint8Array(outOfBandPrint.data));
printMessage.cursize = outOfBandPrint.data.length;
MSG_BeginReading(printMessage);
assert.equal(MSG_ReadLong(printMessage), -1, "Netchan_OutOfBandPrint header mismatch");
assert.equal(MSG_ReadString(printMessage), "ping", "Netchan_OutOfBandPrint payload mismatch");

const sb = createSizeBuffer(64);
MSG_WriteByte(sb, 123);
MSG_WriteString(sb, "quake");
sb.readcount = 0;
assert.equal(MSG_ReadByte(sb), 123, "message byte mismatch");
assert.equal(MSG_ReadString(sb), "quake", "message string mismatch");

const fromCmd: usercmd_t = {
  msec: 10,
  buttons: 1,
  angles: [100, 200, 300],
  forwardmove: 20,
  sidemove: 30,
  upmove: 40,
  impulse: 2,
  lightlevel: 3
};
const nextCmd: usercmd_t = {
  msec: 16,
  buttons: 5,
  angles: [100, 222, 300],
  forwardmove: 20,
  sidemove: -12,
  upmove: 40,
  impulse: 9,
  lightlevel: 77
};
const cmdBuffer = createSizeBuffer(64);
MSG_WriteDeltaUsercmd(cmdBuffer, fromCmd, nextCmd);
cmdBuffer.readcount = 0;
assert.deepEqual(MSG_ReadDeltaUsercmd(cmdBuffer, fromCmd), nextCmd, "MSG delta usercmd mismatch");

const dirBuffer = createSizeBuffer(8);
MSG_WriteDir(dirBuffer, [0, 0, 1]);
dirBuffer.readcount = 0;
assert.deepEqual(MSG_ReadDir(dirBuffer), [0, 0, 1], "MSG dir roundtrip mismatch");

const baseEntity = createEntityState();
baseEntity.number = 300;
const deltaEntity = createEntityState();
deltaEntity.number = 300;
deltaEntity.modelindex = 7;
deltaEntity.frame = 4;
deltaEntity.skinnum = 9;
deltaEntity.origin = [12.5, 0, 0];
deltaEntity.renderfx = 12;
deltaEntity.sound = 6;
deltaEntity.event = 3;
deltaEntity.old_origin = [1, 2, 3];
const entityBuffer = createSizeBuffer(128);
MSG_WriteDeltaEntity(baseEntity, deltaEntity, entityBuffer, false, true);
entityBuffer.readcount = 0;
const entityBits =
  MSG_ReadByte(entityBuffer) |
  (MSG_ReadByte(entityBuffer) << 8) |
  (MSG_ReadByte(entityBuffer) << 16) |
  (MSG_ReadByte(entityBuffer) << 24);
assert.equal(
  entityBits,
  U_NUMBER16 |
    U_MODEL |
    U_FRAME8 |
    U_SKIN8 |
    U_ORIGIN1 |
    U_RENDERFX8 |
    U_SOUND |
    U_EVENT |
    U_OLDORIGIN |
    U_MOREBITS1 |
    U_MOREBITS2 |
    U_MOREBITS3,
  "MSG delta entity bits mismatch"
);
assert.equal(MSG_ReadShort(entityBuffer), 300, "MSG delta entity number mismatch");
assert.equal(MSG_ReadByte(entityBuffer), 7, "MSG delta entity model mismatch");
assert.equal(MSG_ReadByte(entityBuffer), 4, "MSG delta entity frame mismatch");
assert.equal(MSG_ReadByte(entityBuffer), 9, "MSG delta entity skinnum mismatch");
assert.equal(MSG_ReadByte(entityBuffer), 12, "MSG delta entity renderfx mismatch");
assert.equal(MSG_ReadShort(entityBuffer), 100, "MSG delta entity origin mismatch");
assert.equal(MSG_ReadShort(entityBuffer), 8, "MSG delta entity old_origin[0] mismatch");
assert.equal(MSG_ReadShort(entityBuffer), 16, "MSG delta entity old_origin[1] mismatch");
assert.equal(MSG_ReadShort(entityBuffer), 24, "MSG delta entity old_origin[2] mismatch");
assert.equal(MSG_ReadByte(entityBuffer), 6, "MSG delta entity sound mismatch");
assert.equal(MSG_ReadByte(entityBuffer), 3, "MSG delta entity event mismatch");

const forcedEntity = createEntityState();
forcedEntity.number = 42;
const forcedBuffer = createSizeBuffer(8);
MSG_WriteDeltaEntity(forcedEntity, forcedEntity, forcedBuffer, false, false);
assert.equal(forcedBuffer.cursize, 0, "MSG delta entity should skip unchanged unforced states");
MSG_WriteDeltaEntity(forcedEntity, forcedEntity, forcedBuffer, true, false);
forcedBuffer.readcount = 0;
assert.equal(MSG_ReadByte(forcedBuffer), 0, "MSG delta entity forced bits mismatch");
assert.equal(MSG_ReadByte(forcedBuffer), 42, "MSG delta entity forced number mismatch");

const fullBase = createEntityState();
fullBase.number = 12;
const fullDelta = createEntityState();
fullDelta.number = 12;
fullDelta.modelindex = 1;
fullDelta.modelindex2 = 2;
fullDelta.modelindex3 = 3;
fullDelta.modelindex4 = 4;
fullDelta.frame = 300;
fullDelta.skinnum = 0x12345;
fullDelta.effects = 0x9000;
fullDelta.renderfx = 0x9000;
fullDelta.origin = [1, 2, 3];
fullDelta.angles = [90, 180, 270];
fullDelta.old_origin = [4, 5, 6];
fullDelta.sound = 7;
fullDelta.event = 8;
fullDelta.solid = 0x1234;
const fullBuffer = createSizeBuffer(128);
MSG_WriteDeltaEntity(fullBase, fullDelta, fullBuffer, false, true);
fullBuffer.readcount = 0;
const fullBits =
  MSG_ReadByte(fullBuffer) |
  (MSG_ReadByte(fullBuffer) << 8) |
  (MSG_ReadByte(fullBuffer) << 16) |
  (MSG_ReadByte(fullBuffer) << 24);
assert.equal(
  fullBits,
  U_MODEL |
    U_MODEL2 |
    U_MODEL3 |
    U_MODEL4 |
    U_FRAME16 |
    U_SKIN8 |
    U_SKIN16 |
    U_EFFECTS8 |
    U_EFFECTS16 |
    U_RENDERFX8 |
    U_RENDERFX16 |
    U_ORIGIN1 |
    U_ORIGIN2 |
    U_ORIGIN3 |
    U_ANGLE1 |
    U_ANGLE2 |
    U_ANGLE3 |
    U_OLDORIGIN |
    U_SOUND |
    U_EVENT |
    U_SOLID |
    U_MOREBITS1 |
    U_MOREBITS2 |
    U_MOREBITS3,
  "MSG delta entity full bits mismatch"
);
assert.equal(MSG_ReadByte(fullBuffer), 12, "MSG delta entity full number mismatch");
assert.equal(MSG_ReadByte(fullBuffer), 1, "MSG delta entity modelindex mismatch");
assert.equal(MSG_ReadByte(fullBuffer), 2, "MSG delta entity modelindex2 mismatch");
assert.equal(MSG_ReadByte(fullBuffer), 3, "MSG delta entity modelindex3 mismatch");
assert.equal(MSG_ReadByte(fullBuffer), 4, "MSG delta entity modelindex4 mismatch");
assert.equal(MSG_ReadShort(fullBuffer), 300, "MSG delta entity frame16 mismatch");
assert.equal(MSG_ReadLong(fullBuffer), 0x12345, "MSG delta entity skin long mismatch");
assert.equal(MSG_ReadLong(fullBuffer), 0x9000, "MSG delta entity effects long mismatch");
assert.equal(MSG_ReadLong(fullBuffer), 0x9000, "MSG delta entity renderfx long mismatch");
assert.deepEqual(
  [MSG_ReadShort(fullBuffer), MSG_ReadShort(fullBuffer), MSG_ReadShort(fullBuffer)],
  [8, 16, 24],
  "MSG delta entity origin coords mismatch"
);
assert.deepEqual(
  [MSG_ReadByte(fullBuffer), MSG_ReadByte(fullBuffer), MSG_ReadByte(fullBuffer)],
  [64, 128, 192],
  "MSG delta entity angle bytes mismatch"
);
assert.deepEqual(
  [MSG_ReadShort(fullBuffer), MSG_ReadShort(fullBuffer), MSG_ReadShort(fullBuffer)],
  [32, 40, 48],
  "MSG delta entity old origin coords mismatch"
);
assert.equal(MSG_ReadByte(fullBuffer), 7, "MSG delta entity full sound mismatch");
assert.equal(MSG_ReadByte(fullBuffer), 8, "MSG delta entity full event mismatch");
assert.equal(MSG_ReadShort(fullBuffer), 0x1234, "MSG delta entity solid mismatch");

const invalidEntity = createEntityState();
invalidEntity.number = MAX_EDICTS;
assert.throws(
  () => MSG_WriteDeltaEntity(createEntityState(), invalidEntity, createSizeBuffer(8), true, true),
  /entity number >= MAX_EDICTS/,
  "MSG delta entity must reject numbers outside MAX_EDICTS"
);

const printBuffer = createSizeBuffer(16);
SZ_Print(printBuffer, "a");
SZ_Print(printBuffer, "b");
assert.deepEqual(Array.from(printBuffer.data.subarray(0, printBuffer.cursize)), [97, 98, 0], "SZ_Print reuse mismatch");

assert.equal(svc_ops_e.svc_frame, 20, "svc_ops_e mismatch");
assert.equal(clc_ops_e.clc_stringcmd, 4, "clc_ops_e mismatch");

const common = createCommonRuntime();
COM_InitArgv(common, ["quake2", "+set", "game", "xatrix", "+map", "base1", "+exec", "autoexec.cfg"]);
const earlyRuntime = createCommandRuntime();
Cbuf_AddEarlyCommands(earlyRuntime, common, false);
assert.equal(
  new TextDecoder("latin1").decode(earlyRuntime.cmd_text.data.subarray(0, earlyRuntime.cmd_text.cursize)),
  "set game xatrix\n",
  "Cbuf_AddEarlyCommands mismatch"
);
Cbuf_AddEarlyCommands(earlyRuntime, common, true);
assert.equal(COM_Argv(common, 1), "", "Cbuf_AddEarlyCommands clear mismatch");

const lateRuntime = createCommandRuntime();
assert.equal(Cbuf_AddLateCommands(lateRuntime, common), true, "Cbuf_AddLateCommands return mismatch");
assert.equal(
  new TextDecoder("latin1").decode(lateRuntime.cmd_text.data.subarray(0, lateRuntime.cmd_text.cursize)),
  "map base1 \nexec autoexec.cfg\n",
  "Cbuf_AddLateCommands payload mismatch"
);

let forwarded = "";
const forwardRuntime = createCommandRuntime({
  forwardToServer: (text) => {
    forwarded = text;
  }
});
Cmd_TokenizeString(forwardRuntime, "god", true);
Cmd_ForwardToServer(forwardRuntime);
assert.equal(forwarded, "god", "Cmd_ForwardToServer mismatch");

console.log("quake2-qcommon-header: ok");
