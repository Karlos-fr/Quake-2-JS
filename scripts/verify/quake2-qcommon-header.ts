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

import {
  createSizeBuffer,
  MSG_BeginReading,
  SZ_Clear,
  SZ_GetSpace,
  SZ_Init,
  SZ_Print,
  SZ_Write
} from "../../packages/memory/src/index.js";
import {
  BigFloat,
  BigLong,
  BigShort,
  COM_AddParm,
  COM_Argc,
  COM_Argv,
  COM_CheckParm,
  COM_ClearArgv,
  COM_InitArgv,
  Com_BeginRedirect,
  Com_EndRedirect,
  Com_Printf,
  Info_Print,
  LittleFloat,
  LittleLong,
  LittleShort,
  Swap_Init,
  bigendien,
  createCommonRuntime
} from "../../packages/qcommon/src/common.js";
import {
  Cbuf_AddText,
  Cbuf_AddEarlyCommands,
  Cbuf_AddLateCommands,
  Cbuf_CopyToDefer,
  Cbuf_Execute,
  Cbuf_ExecuteText,
  Cbuf_Init,
  Cbuf_InsertFromDefer,
  Cbuf_InsertText,
  Cmd_AddCommand,
  Cmd_Argc,
  Cmd_Args,
  Cmd_Argv,
  Cmd_CompleteCommand,
  Cmd_ExecuteString,
  Cmd_Exists,
  Cmd_ForwardToServer,
  Cmd_Init,
  Cmd_RemoveCommand,
  Cmd_TokenizeString,
  createCommandRuntime,
  EXEC_APPEND,
  EXEC_INSERT,
  EXEC_NOW
} from "../../packages/qcommon/src/cmd.js";
import {
  CVAR_ARCHIVE,
  CVAR_LATCH,
  CVAR_NOSET,
  CVAR_SERVERINFO,
  CVAR_USERINFO,
  Cvar_Command,
  Cvar_CompleteVariable,
  Cvar_ForceSet,
  Cvar_FullSet,
  Cvar_Get,
  Cvar_GetLatchedVars,
  Cvar_Init,
  Cvar_Serverinfo,
  Cvar_Set,
  Cvar_SetServerState,
  Cvar_SetValue,
  Cvar_Userinfo,
  Cvar_VariableString,
  Cvar_VariableValue,
  Cvar_WriteVariables,
  createCvarRuntime
} from "../../packages/qcommon/src/cvar.js";
import {
  BUILDSTRING,
  CM_ANGLE1,
  CM_ANGLE2,
  CM_ANGLE3,
  CM_BUTTONS,
  CM_FORWARD,
  CM_IMPULSE,
  CM_SIDE,
  CM_UP,
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
  NET_Config,
  NET_GetPacket,
  NET_Init,
  NET_IsLocalAddress,
  NET_SendPacket,
  NET_Shutdown,
  NET_Sleep,
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
  MSG_ReadAngle,
  MSG_ReadAngle16,
  MSG_ReadByte,
  MSG_ReadChar,
  MSG_ReadCoord,
  MSG_ReadData,
  MSG_ReadDeltaUsercmd,
  MSG_ReadDir,
  MSG_ReadFloat,
  MSG_ReadLong,
  MSG_ReadPos,
  MSG_ReadShort,
  MSG_ReadString,
  MSG_ReadStringLine,
  MSG_WriteAngle,
  MSG_WriteAngle16,
  MSG_WriteByte,
  MSG_WriteChar,
  MSG_WriteCoord,
  MSG_WriteDeltaEntity,
  MSG_WriteDeltaUsercmd,
  MSG_WriteDir,
  MSG_WriteFloat,
  MSG_WriteLong,
  MSG_WritePos,
  MSG_WriteShort,
  MSG_WriteString
} from "../../packages/qcommon/src/messages.js";
import { PM_AirAccelerate, Pmove, createPmoveContext } from "../../packages/qcommon/src/pmove.js";
import {
  FS_ExecAutoexec,
  FS_FreeFile,
  FS_Gamedir,
  FS_InitFilesystem,
  FS_LoadFile,
  FS_NextPath,
  FS_Read,
  FS_SetGamedir,
  createVirtualFilesystem,
  mountDirectory,
  readMountedFile
} from "../../packages/filesystem/src/index.js";
import {
  BASEDIRNAME,
  DEFAULT_SOUND_PACKET_ATTENUATION,
  DEFAULT_SOUND_PACKET_VOLUME,
  PROTOCOL_VERSION,
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
  SND_ATTENUATION,
  SND_ENT,
  SND_OFFSET,
  SND_POS,
  SND_VOLUME,
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
  U_REMOVE,
  U_SKIN16,
  U_SKIN8,
  U_SOLID,
  U_SOUND,
  UPDATE_BACKUP,
  UPDATE_MASK,
  clc_ops_e,
  svc_ops_e
} from "../../packages/qcommon/src/protocol.js";
import {
  MAX_EDICTS,
  MAX_TOKEN_CHARS,
  PMF_ON_GROUND,
  PRINT_ALL,
  PRINT_DEVELOPER,
  createEntityState,
  pmtype_t,
  type pmove_t,
  type trace_t,
  type usercmd_t,
  type vec3_t
} from "../../packages/qcommon/src/q_shared.js";

assert.equal(VERSION, 3.19, "VERSION mismatch");
assert.equal(PORT_MASTER, 27900, "PORT_MASTER mismatch");
assert.equal(PORT_CLIENT, 27901, "PORT_CLIENT mismatch");
assert.equal(PORT_SERVER, 27910, "PORT_SERVER mismatch");
assert.equal(PORT_ANY, -1, "PORT_ANY mismatch");
assert.equal(MAX_MSGLEN, 1400, "MAX_MSGLEN mismatch");
assert.equal(PACKET_HEADER, 10, "PACKET_HEADER mismatch");
assert.equal(netadrtype_t.NA_LOOPBACK, 0, "netadrtype_t.NA_LOOPBACK mismatch");
assert.equal(netadrtype_t.NA_BROADCAST, 1, "netadrtype_t.NA_BROADCAST mismatch");
assert.equal(netadrtype_t.NA_IP, 2, "netadrtype_t.NA_IP mismatch");
assert.equal(netadrtype_t.NA_IPX, 3, "netadrtype_t.NA_IPX mismatch");
assert.equal(netadrtype_t.NA_BROADCAST_IPX, 4, "netadrtype_t.NA_BROADCAST_IPX mismatch");
assert.equal(netsrc_t.NS_CLIENT, 0, "netsrc_t.NS_CLIENT mismatch");
assert.equal(netsrc_t.NS_SERVER, 1, "netsrc_t.NS_SERVER mismatch");
assert.equal(OLD_AVG, 0.99, "OLD_AVG mismatch");
assert.equal(MAX_LATENT, 32, "MAX_LATENT mismatch");
assert.equal(ERR_FATAL, 0, "ERR_FATAL mismatch");
assert.equal(ERR_DROP, 1, "ERR_DROP mismatch");
assert.equal(ERR_QUIT, 2, "ERR_QUIT mismatch");
assert.equal(PRINT_ALL, 0, "PRINT_ALL mismatch");
assert.equal(PRINT_DEVELOPER, 1, "PRINT_DEVELOPER mismatch");
assert.equal(NUMVERTEXNORMALS, 162, "NUMVERTEXNORMALS mismatch");
assert.equal(PROTOCOL_VERSION, 34, "PROTOCOL_VERSION mismatch");
assert.equal(UPDATE_BACKUP, 16, "UPDATE_BACKUP mismatch");
assert.equal(UPDATE_MASK, 15, "UPDATE_MASK mismatch");
assert.equal(svc_ops_e.svc_bad, 0, "svc_ops_e.svc_bad mismatch");
assert.equal(svc_ops_e.svc_muzzleflash, 1, "svc_ops_e.svc_muzzleflash mismatch");
assert.equal(svc_ops_e.svc_muzzleflash2, 2, "svc_ops_e.svc_muzzleflash2 mismatch");
assert.equal(svc_ops_e.svc_temp_entity, 3, "svc_ops_e.svc_temp_entity mismatch");
assert.equal(svc_ops_e.svc_layout, 4, "svc_ops_e.svc_layout mismatch");
assert.equal(svc_ops_e.svc_inventory, 5, "svc_ops_e.svc_inventory mismatch");
assert.equal(svc_ops_e.svc_nop, 6, "svc_ops_e.svc_nop mismatch");
assert.equal(svc_ops_e.svc_disconnect, 7, "svc_ops_e.svc_disconnect mismatch");
assert.equal(svc_ops_e.svc_reconnect, 8, "svc_ops_e.svc_reconnect mismatch");
assert.equal(svc_ops_e.svc_sound, 9, "svc_ops_e.svc_sound mismatch");
assert.equal(svc_ops_e.svc_print, 10, "svc_ops_e.svc_print mismatch");
assert.equal(svc_ops_e.svc_stufftext, 11, "svc_ops_e.svc_stufftext mismatch");
assert.equal(svc_ops_e.svc_serverdata, 12, "svc_ops_e.svc_serverdata mismatch");
assert.equal(svc_ops_e.svc_configstring, 13, "svc_ops_e.svc_configstring mismatch");
assert.equal(svc_ops_e.svc_spawnbaseline, 14, "svc_ops_e.svc_spawnbaseline mismatch");
assert.equal(svc_ops_e.svc_centerprint, 15, "svc_ops_e.svc_centerprint mismatch");
assert.equal(svc_ops_e.svc_download, 16, "svc_ops_e.svc_download mismatch");
assert.equal(svc_ops_e.svc_playerinfo, 17, "svc_ops_e.svc_playerinfo mismatch");
assert.equal(svc_ops_e.svc_packetentities, 18, "svc_ops_e.svc_packetentities mismatch");
assert.equal(svc_ops_e.svc_deltapacketentities, 19, "svc_ops_e.svc_deltapacketentities mismatch");
assert.equal(svc_ops_e.svc_frame, 20, "svc_ops_e.svc_frame mismatch");
assert.equal(clc_ops_e.clc_bad, 0, "clc_ops_e.clc_bad mismatch");
assert.equal(clc_ops_e.clc_nop, 1, "clc_ops_e.clc_nop mismatch");
assert.equal(clc_ops_e.clc_move, 2, "clc_ops_e.clc_move mismatch");
assert.equal(clc_ops_e.clc_userinfo, 3, "clc_ops_e.clc_userinfo mismatch");
assert.equal(clc_ops_e.clc_stringcmd, 4, "clc_ops_e.clc_stringcmd mismatch");
assert.equal(PS_M_TYPE, 1 << 0, "PS_M_TYPE mismatch");
assert.equal(PS_M_ORIGIN, 1 << 1, "PS_M_ORIGIN mismatch");
assert.equal(PS_M_VELOCITY, 1 << 2, "PS_M_VELOCITY mismatch");
assert.equal(PS_M_TIME, 1 << 3, "PS_M_TIME mismatch");
assert.equal(PS_M_FLAGS, 1 << 4, "PS_M_FLAGS mismatch");
assert.equal(PS_M_GRAVITY, 1 << 5, "PS_M_GRAVITY mismatch");
assert.equal(PS_M_DELTA_ANGLES, 1 << 6, "PS_M_DELTA_ANGLES mismatch");
assert.equal(PS_VIEWOFFSET, 1 << 7, "PS_VIEWOFFSET mismatch");
assert.equal(PS_VIEWANGLES, 1 << 8, "PS_VIEWANGLES mismatch");
assert.equal(PS_KICKANGLES, 1 << 9, "PS_KICKANGLES mismatch");
assert.equal(PS_BLEND, 1 << 10, "PS_BLEND mismatch");
assert.equal(PS_FOV, 1 << 11, "PS_FOV mismatch");
assert.equal(PS_WEAPONINDEX, 1 << 12, "PS_WEAPONINDEX mismatch");
assert.equal(PS_WEAPONFRAME, 1 << 13, "PS_WEAPONFRAME mismatch");
assert.equal(PS_RDFLAGS, 1 << 14, "PS_RDFLAGS mismatch");
assert.equal(SND_VOLUME, 1 << 0, "SND_VOLUME mismatch");
assert.equal(SND_ATTENUATION, 1 << 1, "SND_ATTENUATION mismatch");
assert.equal(SND_POS, 1 << 2, "SND_POS mismatch");
assert.equal(SND_ENT, 1 << 3, "SND_ENT mismatch");
assert.equal(SND_OFFSET, 1 << 4, "SND_OFFSET mismatch");
assert.equal(DEFAULT_SOUND_PACKET_VOLUME, 1.0, "DEFAULT_SOUND_PACKET_VOLUME mismatch");
assert.equal(DEFAULT_SOUND_PACKET_ATTENUATION, 1.0, "DEFAULT_SOUND_PACKET_ATTENUATION mismatch");
assert.equal(CM_ANGLE1, 1 << 0, "CM_ANGLE1 mismatch");
assert.equal(CM_ANGLE2, 1 << 1, "CM_ANGLE2 mismatch");
assert.equal(CM_ANGLE3, 1 << 2, "CM_ANGLE3 mismatch");
assert.equal(CM_FORWARD, 1 << 3, "CM_FORWARD mismatch");
assert.equal(CM_SIDE, 1 << 4, "CM_SIDE mismatch");
assert.equal(CM_UP, 1 << 5, "CM_UP mismatch");
assert.equal(CM_BUTTONS, 1 << 6, "CM_BUTTONS mismatch");
assert.equal(CM_IMPULSE, 1 << 7, "CM_IMPULSE mismatch");
assert.equal(Swap_Init().bigendien, bigendien, "bigendien/Swap_Init mismatch");
if (bigendien) {
  assert.equal(BigShort(0x1234), 0x1234, "BigShort big-endian mismatch");
  assert.equal(LittleShort(0x1234), 0x3412, "LittleShort big-endian mismatch");
  assert.equal(BigLong(0x12345678), 0x12345678, "BigLong big-endian mismatch");
  assert.equal(LittleLong(0x12345678), 0x78563412, "LittleLong big-endian mismatch");
  assert.equal(BigFloat(Math.fround(1.25)), Math.fround(1.25), "BigFloat big-endian mismatch");
  assert.equal(LittleFloat(LittleFloat(Math.fround(1.25))), Math.fround(1.25), "LittleFloat big-endian roundtrip mismatch");
} else {
  assert.equal(BigShort(0x1234), 0x3412, "BigShort little-endian mismatch");
  assert.equal(LittleShort(0x1234), 0x1234, "LittleShort little-endian mismatch");
  assert.equal(BigLong(0x12345678), 0x78563412, "BigLong little-endian mismatch");
  assert.equal(LittleLong(0x12345678), 0x12345678, "LittleLong little-endian mismatch");
  assert.equal(BigFloat(BigFloat(Math.fround(1.25))), Math.fround(1.25), "BigFloat little-endian roundtrip mismatch");
  assert.equal(LittleFloat(Math.fround(1.25)), Math.fround(1.25), "LittleFloat little-endian mismatch");
}
assert.equal(U_ORIGIN1, 1 << 0, "U_ORIGIN1 mismatch");
assert.equal(U_ORIGIN2, 1 << 1, "U_ORIGIN2 mismatch");
assert.equal(U_ANGLE2, 1 << 2, "U_ANGLE2 mismatch");
assert.equal(U_ANGLE3, 1 << 3, "U_ANGLE3 mismatch");
assert.equal(U_FRAME8, 1 << 4, "U_FRAME8 mismatch");
assert.equal(U_EVENT, 1 << 5, "U_EVENT mismatch");
assert.equal(U_REMOVE, 1 << 6, "U_REMOVE mismatch");
assert.equal(U_MOREBITS1, 1 << 7, "U_MOREBITS1 mismatch");
assert.equal(U_NUMBER16, 1 << 8, "U_NUMBER16 mismatch");
assert.equal(U_ORIGIN3, 1 << 9, "U_ORIGIN3 mismatch");
assert.equal(U_ANGLE1, 1 << 10, "U_ANGLE1 mismatch");
assert.equal(U_MODEL, 1 << 11, "U_MODEL mismatch");
assert.equal(U_RENDERFX8, 1 << 12, "U_RENDERFX8 mismatch");
assert.equal(U_EFFECTS8, 1 << 14, "U_EFFECTS8 mismatch");
assert.equal(U_MOREBITS2, 1 << 15, "U_MOREBITS2 mismatch");
assert.equal(U_SKIN8, 1 << 16, "U_SKIN8 mismatch");
assert.equal(U_FRAME16, 1 << 17, "U_FRAME16 mismatch");
assert.equal(U_RENDERFX16, 1 << 18, "U_RENDERFX16 mismatch");
assert.equal(U_EFFECTS16, 1 << 19, "U_EFFECTS16 mismatch");
assert.equal(U_MODEL2, 1 << 20, "U_MODEL2 mismatch");
assert.equal(U_MODEL3, 1 << 21, "U_MODEL3 mismatch");
assert.equal(U_MODEL4, 1 << 22, "U_MODEL4 mismatch");
assert.equal(U_MOREBITS3, 1 << 23, "U_MOREBITS3 mismatch");
assert.equal(U_OLDORIGIN, 1 << 24, "U_OLDORIGIN mismatch");
assert.equal(U_SKIN16, 1 << 25, "U_SKIN16 mismatch");
assert.equal(U_SOUND, 1 << 26, "U_SOUND mismatch");
assert.equal(U_SOLID, 1 << 27, "U_SOLID mismatch");
const C_U_ORIGIN1 = 0x00000001;
const C_U_ORIGIN2 = 0x00000002;
const C_U_ANGLE2 = 0x00000004;
const C_U_ANGLE3 = 0x00000008;
const C_U_FRAME8 = 0x00000010;
const C_U_EVENT = 0x00000020;
const C_U_REMOVE = 0x00000040;
const C_U_MOREBITS1 = 0x00000080;
const C_U_NUMBER16 = 0x00000100;
const C_U_ORIGIN3 = 0x00000200;
const C_U_ANGLE1 = 0x00000400;
const C_U_MODEL = 0x00000800;
const C_U_RENDERFX8 = 0x00001000;
const C_U_EFFECTS8 = 0x00004000;
const C_U_MOREBITS2 = 0x00008000;
const C_U_SKIN8 = 0x00010000;
const C_U_FRAME16 = 0x00020000;
const C_U_RENDERFX16 = 0x00040000;
const C_U_EFFECTS16 = 0x00080000;
const C_U_MODEL2 = 0x00100000;
const C_U_MODEL3 = 0x00200000;
const C_U_MODEL4 = 0x00400000;
const C_U_MOREBITS3 = 0x00800000;
const C_U_OLDORIGIN = 0x01000000;
const C_U_SKIN16 = 0x02000000;
const C_U_SOUND = 0x04000000;
const C_U_SOLID = 0x08000000;
assert.deepEqual(
  [
    U_ORIGIN1,
    U_ORIGIN2,
    U_ANGLE2,
    U_ANGLE3,
    U_FRAME8,
    U_EVENT,
    U_REMOVE,
    U_MOREBITS1,
    U_NUMBER16,
    U_ORIGIN3,
    U_ANGLE1,
    U_MODEL,
    U_RENDERFX8,
    U_EFFECTS8,
    U_MOREBITS2,
    U_SKIN8,
    U_FRAME16,
    U_RENDERFX16,
    U_EFFECTS16,
    U_MODEL2,
    U_MODEL3,
    U_MODEL4,
    U_MOREBITS3,
    U_OLDORIGIN,
    U_SKIN16,
    U_SOUND,
    U_SOLID
  ],
  [
    C_U_ORIGIN1,
    C_U_ORIGIN2,
    C_U_ANGLE2,
    C_U_ANGLE3,
    C_U_FRAME8,
    C_U_EVENT,
    C_U_REMOVE,
    C_U_MOREBITS1,
    C_U_NUMBER16,
    C_U_ORIGIN3,
    C_U_ANGLE1,
    C_U_MODEL,
    C_U_RENDERFX8,
    C_U_EFFECTS8,
    C_U_MOREBITS2,
    C_U_SKIN8,
    C_U_FRAME16,
    C_U_RENDERFX16,
    C_U_EFFECTS16,
    C_U_MODEL2,
    C_U_MODEL3,
    C_U_MODEL4,
    C_U_MOREBITS3,
    C_U_OLDORIGIN,
    C_U_SKIN16,
    C_U_SOUND,
    C_U_SOLID
  ],
  "U_* numeric values must match qcommon.h"
);
assert.equal(BUILDSTRING, "TypeScript", "BUILDSTRING mismatch");
assert.equal(CPUSTRING, "portable", "CPUSTRING mismatch");
assert.equal(BASEDIRNAME, "baseq2", "BASEDIRNAME mismatch");

const headerPmoveTrace = (start: vec3_t, _mins: vec3_t, _maxs: vec3_t, end: vec3_t): trace_t => ({
  allsolid: false,
  startsolid: false,
  fraction: 1,
  endpos: [...end],
  plane: {
    normal: [0, 0, 1],
    dist: 0,
    type: 0,
    signbits: 0,
    pad: [0, 0]
  },
  surface: {
    name: "",
    flags: 0,
    value: 0
  },
  contents: 0,
  ent: end[2] < start[2] ? { kind: "ground" } : null
});

const headerPmove: pmove_t = {
  s: {
    pm_type: pmtype_t.PM_NORMAL,
    origin: [0, 0, 0],
    velocity: [0, 0, 0],
    pm_flags: PMF_ON_GROUND,
    pm_time: 0,
    gravity: 800,
    delta_angles: [0, 0, 0]
  },
  cmd: {
    msec: 50,
    buttons: 0,
    angles: [0, 0, 0],
    forwardmove: 100,
    sidemove: 0,
    upmove: -1,
    impulse: 0,
    lightlevel: 0
  },
  snapinitial: false,
  numtouch: 0,
  touchents: [],
  viewangles: [0, 0, 0],
  viewheight: 0,
  mins: [0, 0, 0],
  maxs: [0, 0, 0],
  groundentity: null,
  watertype: 0,
  waterlevel: 0,
  trace: headerPmoveTrace,
  pointcontents: () => 0
};
const headerPmoveContext = createPmoveContext(headerPmove);
assert.equal(headerPmoveContext.pm_airaccelerate, 0, "pm_airaccelerate default mismatch");
headerPmoveContext.pml.frametime = 0.1;
PM_AirAccelerate(headerPmoveContext, [1, 0, 0], 100, 10);
assert.equal(headerPmoveContext.pml.velocity[0], 30, "PM_AirAccelerate capped wishspd mismatch");
assert.equal(headerPmoveContext.pml.velocity[1], 0, "PM_AirAccelerate lateral velocity mismatch");
Pmove(headerPmoveContext, { allowSnapPosition: false });
assert.equal(headerPmove.viewheight, -2, "Pmove ducked viewheight mismatch");
assert.equal(headerPmove.s.pm_flags & PMF_ON_GROUND, PMF_ON_GROUND, "Pmove ground flag mismatch");

const headerFilesystem = createVirtualFilesystem();
mountDirectory(headerFilesystem, "baseq2", {
  "autoexec.cfg": new Uint8Array([101, 99, 104, 111]),
  "maps/base1.bsp": new Uint8Array([1, 2, 3])
});
assert.equal(FS_Gamedir(headerFilesystem), "baseq2", "FS_Gamedir header mismatch");
assert.equal(readMountedFile(headerFilesystem, "maps/base1.bsp")?.bytes.byteLength, 3, "FS_FOpenFile/readMountedFile header mismatch");
const headerLoadedFile = FS_LoadFile(headerFilesystem, "maps/base1.bsp");
assert.deepEqual(Array.from(headerLoadedFile ?? new Uint8Array()), [1, 2, 3], "FS_LoadFile header mismatch");
if (headerLoadedFile) {
  headerLoadedFile[0] = 9;
}
assert.deepEqual(
  Array.from(readMountedFile(headerFilesystem, "maps/base1.bsp")?.bytes ?? new Uint8Array()),
  [1, 2, 3],
  "FS_LoadFile ownership header mismatch"
);
const headerReadTarget = new Uint8Array(3);
FS_Read(headerReadTarget, 3, new Uint8Array([4, 5, 6]));
assert.deepEqual(Array.from(headerReadTarget), [4, 5, 6], "FS_Read header mismatch");
FS_FreeFile(headerReadTarget);
assert.equal(FS_ExecAutoexec(headerFilesystem), true, "FS_ExecAutoexec header mismatch");
assert.equal(FS_SetGamedir(headerFilesystem, "rogue", { "maps/rogue1.bsp": new Uint8Array([7]) }), true, "FS_SetGamedir header mismatch");
assert.equal(FS_Gamedir(headerFilesystem), "rogue", "FS_SetGamedir gamedir header mismatch");
assert.equal(FS_NextPath(headerFilesystem, null), "rogue", "FS_NextPath first header mismatch");
assert.equal(FS_NextPath(headerFilesystem, "rogue"), "baseq2", "FS_NextPath second header mismatch");

const headerInitializedFilesystem = createVirtualFilesystem();
const headerRegisteredCommands: string[] = [];
const headerCvars: Array<{ name: string; value: string; flags: number }> = [];
FS_InitFilesystem(headerInitializedFilesystem, {
  commands: {
    addCommand: (name) => {
      headerRegisteredCommands.push(name);
    }
  },
  cvars: {
    get: (name, value, flags) => {
      headerCvars.push({ name, value, flags });
      return { string: name === "game" ? "xatrix" : value };
    }
  },
  resolveDirectoryFiles: (path) => (
    path === "baseq2"
      ? { "maps/base1.bsp": new Uint8Array([8]) }
      : path === "xatrix"
        ? { "maps/base1.bsp": new Uint8Array([9]) }
        : undefined
  )
});
assert.deepEqual(headerRegisteredCommands.sort(), ["dir", "link", "path"], "FS_InitFilesystem command header mismatch");
assert.deepEqual(headerCvars, [
  { name: "basedir", value: ".", flags: 8 },
  { name: "cddir", value: "", flags: 8 },
  { name: "game", value: "", flags: 20 }
], "FS_InitFilesystem cvar header mismatch");
assert.equal(FS_Gamedir(headerInitializedFilesystem), "xatrix", "FS_InitFilesystem game header mismatch");

const initializedStorage = new Uint8Array([1, 2, 3, 4]);
const initializedBuffer = createSizeBuffer(1, true);
initializedBuffer.overflowed = true;
initializedBuffer.cursize = 1;
initializedBuffer.readcount = 1;
SZ_Init(initializedBuffer, initializedStorage);
assert.equal(initializedBuffer.allowoverflow, false, "SZ_Init allowoverflow mismatch");
assert.equal(initializedBuffer.overflowed, false, "SZ_Init overflowed mismatch");
assert.equal(initializedBuffer.data, initializedStorage, "SZ_Init data ownership mismatch");
assert.equal(initializedBuffer.maxsize, 4, "SZ_Init maxsize mismatch");
assert.equal(initializedBuffer.cursize, 0, "SZ_Init cursize mismatch");
assert.equal(initializedBuffer.readcount, 0, "SZ_Init readcount mismatch");

SZ_Write(initializedBuffer, new Uint8Array([9, 8]));
assert.deepEqual(
  Array.from(initializedBuffer.data.subarray(0, initializedBuffer.cursize)),
  [9, 8],
  "SZ_Write payload mismatch"
);
const reserved = SZ_GetSpace(initializedBuffer, 2);
reserved.set([7, 6]);
assert.equal(initializedBuffer.cursize, 4, "SZ_GetSpace cursize mismatch");
assert.deepEqual(Array.from(initializedBuffer.data), [9, 8, 7, 6], "SZ_GetSpace returned window mismatch");
assert.throws(
  () => SZ_GetSpace(initializedBuffer, 1),
  /overflow without allowoverflow set/,
  "SZ_GetSpace fixed buffer overflow mismatch"
);

initializedBuffer.allowoverflow = true;
const overflowWindow = SZ_GetSpace(initializedBuffer, 3);
overflowWindow.set([5, 4, 3]);
assert.equal(initializedBuffer.overflowed, true, "SZ_GetSpace overflow flag mismatch");
assert.equal(initializedBuffer.cursize, 3, "SZ_GetSpace overflow cursize mismatch");
assert.deepEqual(
  Array.from(initializedBuffer.data.subarray(0, initializedBuffer.cursize)),
  [5, 4, 3],
  "SZ_GetSpace overflow clear mismatch"
);
assert.throws(
  () => SZ_GetSpace(initializedBuffer, 5),
  /is > full buffer size/,
  "SZ_GetSpace oversized write mismatch"
);

initializedBuffer.readcount = 2;
MSG_BeginReading(initializedBuffer);
assert.equal(initializedBuffer.readcount, 0, "MSG_BeginReading readcount mismatch");
initializedBuffer.allowoverflow = true;
initializedBuffer.readcount = 2;
SZ_Clear(initializedBuffer);
assert.equal(initializedBuffer.cursize, 0, "SZ_Clear cursize mismatch");
assert.equal(initializedBuffer.overflowed, false, "SZ_Clear overflowed mismatch");
assert.equal(initializedBuffer.allowoverflow, true, "SZ_Clear allowoverflow preservation mismatch");
assert.equal(initializedBuffer.readcount, 2, "SZ_Clear readcount preservation mismatch");

const printInitial = createSizeBuffer(16);
SZ_Print(printInitial, "abc");
assert.deepEqual(
  Array.from(printInitial.data.subarray(0, printInitial.cursize)),
  [97, 98, 99, 0],
  "SZ_Print initial payload mismatch"
);
printInitial.data[printInitial.cursize - 1] = 33;
SZ_Print(printInitial, "d");
assert.deepEqual(
  Array.from(printInitial.data.subarray(0, printInitial.cursize)),
  [97, 98, 99, 33, 100, 0],
  "SZ_Print append without trailing nul mismatch"
);
const printEmpty = createSizeBuffer(4);
SZ_Print(printEmpty, "");
assert.deepEqual(Array.from(printEmpty.data.subarray(0, printEmpty.cursize)), [0], "SZ_Print empty initial mismatch");
SZ_Print(printEmpty, "");
assert.deepEqual(Array.from(printEmpty.data.subarray(0, printEmpty.cursize)), [0], "SZ_Print empty reuse mismatch");

let crc = CRC_Init();
for (const byte of new Uint8Array([49, 50, 51, 52, 53, 54, 55, 56, 57])) {
  crc = CRC_ProcessByte(crc, byte);
}
assert.equal(CRC_Value(crc), 0x29b1, "CRC iterative mismatch");
assert.equal(CRC_Block(new Uint8Array([49, 50, 51, 52, 53, 54, 55, 56, 57])), 0x29b1, "CRC block mismatch");
assert.equal(CRC_Init(), 0xffff, "CRC_Init seed mismatch");
assert.equal(CRC_Value(CRC_Init()), 0xffff, "CRC_Value seed mismatch");
assert.equal(CRC_ProcessByte(0xffff, 49), 0xc782, "CRC_ProcessByte first-step mismatch");
assert.equal(CRC_Block(new Uint8Array([1, 2, 3, 4, 5]), 3), 0xadad, "CRC_Block partial-count mismatch");
assert.equal(CRC_Block(new Uint8Array()), 0xffff, "CRC_Block empty mismatch");
assert.equal(COM_BlockSequenceCRCByte(new Uint8Array([1, 2, 3, 4, 5]), 5, 7), 201, "COM_BlockSequenceCRCByte mismatch");
assert.equal(
  COM_BlockSequenceCRCByte(new Uint8Array(Array.from({ length: 80 }, (_, index) => index)), 80, 1234),
  80,
  "COM_BlockSequenceCRCByte length clamp mismatch"
);
assert.throws(
  () => COM_BlockSequenceCRCByte(new Uint8Array([1]), 1, -1),
  /sequence < 0/,
  "COM_BlockSequenceCRCByte negative sequence mismatch"
);
assert.equal(Com_BlockChecksum(new Uint8Array([97, 98, 99])), 1570836014, "Com_BlockChecksum mismatch");
assert.equal(Com_BlockChecksum(new Uint8Array([97, 98, 99, 100]), 3), 1570836014, "Com_BlockChecksum length mismatch");

const globals = createQcommonGlobals();
assert.equal(Com_ServerState(globals), 0, "Com_ServerState default mismatch");
Com_SetServerState(globals, 2);
assert.equal(Com_ServerState(globals), 2, "Com_SetServerState mismatch");
const globalsCvars = createCvarRuntime();
globals.developer = Cvar_Get(globalsCvars, "developer", "0", 0);
globals.dedicated = Cvar_Get(globalsCvars, "dedicated", "1", CVAR_NOSET);
globals.host_speeds = Cvar_Get(globalsCvars, "host_speeds", "0", 0);
globals.log_stats = Cvar_Get(globalsCvars, "log_stats", "0", 0);
assert.equal(globals.developer?.value, 0, "developer cvar default mismatch");
assert.equal(globals.dedicated?.flags, CVAR_NOSET, "dedicated cvar flags mismatch");
assert.equal(globals.host_speeds?.string, "0", "host_speeds cvar default mismatch");
assert.equal(globals.log_stats?.string, "0", "log_stats cvar default mismatch");
globals.time_before_game = 11;
globals.time_after_game = 17;
globals.time_before_ref = 19;
globals.time_after_ref = 23;
assert.deepEqual(
  [globals.time_before_game, globals.time_after_game, globals.time_before_ref, globals.time_after_ref],
  [11, 17, 19, 23],
  "host_speeds timer globals mismatch"
);
assert.equal(CopyString("baseq2"), "baseq2", "CopyString mismatch");
assert.equal(CopyString(""), "", "CopyString empty mismatch");
assert.equal(CopyString("line\nbreak"), "line\nbreak", "CopyString content preservation mismatch");
assert.deepEqual(Info_Print("\\name\\quake\\skill\\2"), ["name                quake", "skill               2"], "Info_Print basic alignment mismatch");
assert.deepEqual(Info_Print("missing"), ["missing             MISSING VALUE"], "Info_Print missing value mismatch");
assert.deepEqual(Info_Print("\\abcdefghijklmnopqrstuv\\value"), ["abcdefghijklmnopqrstuvvalue"], "Info_Print long key mismatch");

const printed: string[] = [];
const misc = createQcommonMiscRuntime({
  onPrintf: (message) => printed.push(message)
});

const redirected = createCommonRuntime();
const redirectFlushes: Array<{ target: number; buffer: string }> = [];
Com_BeginRedirect(redirected, 4, 12, (target, buffer) => redirectFlushes.push({ target, buffer }));
Com_Printf(redirected, "%s", "alphabet");
Com_Printf(redirected, "%s", "beta");
assert.deepEqual(redirectFlushes, [{ target: 4, buffer: "alphabet" }], "Com_Printf redirect overflow flush mismatch");
Com_EndRedirect(redirected);
assert.deepEqual(
  redirectFlushes,
  [
    { target: 4, buffer: "alphabet" },
    { target: 4, buffer: "beta" }
  ],
  "Com_EndRedirect flush mismatch"
);
assert.equal(redirected.rd_target, 0, "Com_EndRedirect target reset mismatch");

const printfSink: string[] = [];
Com_Printf(createCommonRuntime(), "value %i %s", (line) => printfSink.push(line), 7, "ok");
assert.deepEqual(printfSink, ["value 7 ok"], "Com_Printf sink/format mismatch");

const disabledRedirect = createCommonRuntime();
Com_BeginRedirect(disabledRedirect, 0, 16, () => {
  throw new Error("disabled redirect should not flush");
});
Com_EndRedirect(disabledRedirect);
assert.equal(disabledRedirect.rd_target, 0, "Com_BeginRedirect disabled target mismatch");

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
assert.deepEqual(misc.zone_allocations.get(tag0), { tag: 0, size: 8 }, "Z_Malloc metadata mismatch");
assert.deepEqual(misc.zone_allocations.get(tag3), { tag: 3, size: 4 }, "Z_TagMalloc metadata mismatch");
Z_Free(misc, tag0);
assert.equal(misc.zone_allocations.has(tag0), false, "Z_Free mismatch");
assert.throws(
  () => Z_Free(misc, tag0),
  /Z_Free: bad allocation reference/,
  "Z_Free should reject an already freed allocation"
);
Z_FreeTags(misc, 3);
assert.equal(misc.zone_allocations.has(tag3), false, "Z_FreeTags mismatch");
const shutdownAllocation = Z_TagMalloc(misc, 2, 7);
assert.equal(misc.zone_allocations.has(shutdownAllocation), true, "Qcommon_Shutdown setup mismatch");
Qcommon_Shutdown(misc);
assert.equal(misc.initialized, false, "Qcommon_Shutdown mismatch");
assert.equal(misc.zone_allocations.size, 0, "Qcommon_Shutdown should release tracked zone allocations");

const lifecycleCalls: string[] = [];
const lifecycleRuntime = createQcommonMiscRuntime({
  onInit: () => lifecycleCalls.push("init"),
  onFrame: (msec) => lifecycleCalls.push(`frame:${msec}`),
  onShutdown: () => lifecycleCalls.push("shutdown")
});
Qcommon_Init(lifecycleRuntime);
Qcommon_Frame(lifecycleRuntime, 33.8);
Qcommon_Shutdown(lifecycleRuntime);
assert.deepEqual(lifecycleCalls, ["init", "frame:33", "shutdown"], "Qcommon lifecycle hook order mismatch");

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

const originalRandom = Math.random;
try {
  Math.random = () => 0;
  assert.equal(frand(), 0, "frand low endpoint mismatch");
  assert.equal(crand(), -1, "crand low endpoint mismatch");
  Math.random = () => 0.9999999999999999;
  assert.equal(frand(), 1, "frand high endpoint mismatch");
  assert.equal(crand(), 1, "crand high endpoint mismatch");
  Math.random = originalRandom;
  const random = frand();
  assert.ok(random >= 0 && random <= 1, "frand range mismatch");
  const centered = crand();
  assert.ok(centered >= -1 && centered <= 1, "crand range mismatch");
} finally {
  Math.random = originalRandom;
}

const netchan = createNetchan(netsrc_t.NS_SERVER);
assert.equal(netchan.sock, netsrc_t.NS_SERVER, "createNetchan sock mismatch");
assert.equal(netchan.remote_address.type, netadrtype_t.NA_LOOPBACK, "createNetchan address type mismatch");
assert.equal(netchan.message_buf.length, MAX_MSGLEN - 16, "createNetchan message_buf mismatch");
assert.equal(netchan.reliable_buf.length, MAX_MSGLEN - 16, "createNetchan reliable_buf mismatch");

const parsedAdr = createNetAdr();
assert.equal(NET_StringToAdr("127.0.0.1:27910", parsedAdr), true, "NET_StringToAdr parse mismatch");
assert.equal(parsedAdr.type, netadrtype_t.NA_IP, "NET_StringToAdr type mismatch");
assert.deepEqual(Array.from(parsedAdr.ip), [127, 0, 0, 1], "NET_StringToAdr ip bytes mismatch");
assert.deepEqual(Array.from(parsedAdr.ipx), Array(10).fill(0), "NET_StringToAdr ipx clear mismatch");
assert.equal(parsedAdr.port, 27910, "NET_StringToAdr port mismatch");
assert.equal(NET_AdrToString(parsedAdr), "127.0.0.1:27910", "NET_AdrToString mismatch");
const loopbackAdr = createNetAdr(netadrtype_t.NA_IP);
loopbackAdr.ip.fill(255);
loopbackAdr.ipx.fill(255);
loopbackAdr.port = 1234;
assert.equal(NET_StringToAdr("localhost", loopbackAdr), true, "NET_StringToAdr localhost mismatch");
assert.equal(loopbackAdr.type, netadrtype_t.NA_LOOPBACK, "NET_StringToAdr localhost type mismatch");
assert.equal(loopbackAdr.port, 0, "NET_StringToAdr localhost port clear mismatch");
assert.deepEqual(Array.from(loopbackAdr.ip), [0, 0, 0, 0], "NET_StringToAdr localhost ip clear mismatch");
assert.equal(NET_StringToAdr("bad host", createNetAdr()), false, "NET_StringToAdr invalid mismatch");
assert.equal(NET_StringToAdr("127.0.0.256", createNetAdr()), false, "NET_StringToAdr octet range mismatch");
assert.equal(NET_AdrToString(loopbackAdr), "loopback", "NET_AdrToString loopback mismatch");
assert.equal(NET_IsLocalAddress(createNetAdr(netadrtype_t.NA_LOOPBACK)), true, "NET_IsLocalAddress mismatch");
assert.equal(NET_IsLocalAddress(parsedAdr), false, "NET_IsLocalAddress remote mismatch");
const parsedAdrCopy = createNetAdr();
NET_StringToAdr("127.0.0.1:27910", parsedAdrCopy);
assert.equal(NET_CompareAdr(parsedAdr, parsedAdrCopy), true, "NET_CompareAdr mismatch");
parsedAdrCopy.port = 27901;
assert.equal(NET_CompareAdr(parsedAdr, parsedAdrCopy), false, "NET_CompareAdr port mismatch");
assert.equal(NET_CompareBaseAdr(parsedAdr, parsedAdrCopy), true, "NET_CompareBaseAdr mismatch");
parsedAdrCopy.ip[3] = 2;
assert.equal(NET_CompareBaseAdr(parsedAdr, parsedAdrCopy), false, "NET_CompareBaseAdr ip mismatch");
const ipxAdr = createNetAdr(netadrtype_t.NA_IPX);
ipxAdr.ipx.set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
ipxAdr.port = 3000;
const ipxAdrCopy = createNetAdr(netadrtype_t.NA_IPX);
ipxAdrCopy.ipx.set(ipxAdr.ipx);
ipxAdrCopy.port = 3000;
assert.equal(NET_CompareAdr(ipxAdr, ipxAdrCopy), true, "NET_CompareAdr ipx mismatch");
ipxAdrCopy.port = 3001;
assert.equal(NET_CompareAdr(ipxAdr, ipxAdrCopy), false, "NET_CompareAdr ipx port mismatch");
assert.equal(NET_CompareBaseAdr(ipxAdr, ipxAdrCopy), true, "NET_CompareBaseAdr ipx mismatch");
assert.equal(NET_AdrToString(ipxAdr), "00010203040506070809:3000", "NET_AdrToString ipx mismatch");

const sentPackets: Array<{ sock: netsrc_t; data: Uint8Array; to: string }> = [];
const incomingPackets = [
  {
    from: parsedAdr,
    data: new Uint8Array([9, 8, 7])
  }
];
let fakeNow = 1234;
let configValue: boolean | null = null;
const sleeps: number[] = [];
const net = createQcommonNetRuntime({
  now: () => fakeNow,
  config: (multiplayer) => {
    configValue = multiplayer;
  },
  sendPacket: (sock, data, to) => {
    sentPackets.push({ sock, data: new Uint8Array(data), to: NET_AdrToString(to) });
  },
  getPacket: () => incomingPackets.shift() ?? null,
  sleep: (msec) => sleeps.push(msec)
});
NET_Init(net);
assert.equal(net.qport, 1234 & 0xffff, "NET_Init qport mismatch");
assert.equal(net.net_message.maxsize, MAX_MSGLEN, "NET_Init net_message maxsize mismatch");
NET_Config(net, true);
assert.equal(net.multiplayer, true, "NET_Config multiplayer mismatch");
assert.equal(configValue, true, "NET_Config hook mismatch");
assert.equal(NET_GetPacket(net, netsrc_t.NS_CLIENT), true, "NET_GetPacket mismatch");
assert.equal(NET_AdrToString(net.net_from), "127.0.0.1:27910", "NET_GetPacket source mismatch");
assert.deepEqual(Array.from(net.net_message.data.subarray(0, net.net_message.cursize)), [9, 8, 7], "NET_GetPacket payload mismatch");
assert.equal(NET_GetPacket(net, netsrc_t.NS_CLIENT), false, "NET_GetPacket empty mismatch");
const sendTarget = createNetAdr(netadrtype_t.NA_IP);
sendTarget.ip.set([10, 20, 30, 40]);
sendTarget.port = 27910;
const sendData = new Uint8Array([1, 2, 3, 4, 5]);
NET_SendPacket(net, netsrc_t.NS_SERVER, 3, sendData, sendTarget);
sendTarget.ip[0] = 99;
assert.deepEqual(sentPackets.at(-1), {
  sock: netsrc_t.NS_SERVER,
  data: new Uint8Array([1, 2, 3]),
  to: "10.20.30.40:27910"
}, "NET_SendPacket payload/address mismatch");
NET_Sleep(net, 17);
assert.deepEqual(sleeps, [17], "NET_Sleep hook mismatch");
NET_Shutdown(net);
assert.equal(net.multiplayer, false, "NET_Shutdown multiplayer mismatch");
assert.equal(net.net_from.type, netadrtype_t.NA_LOOPBACK, "NET_Shutdown net_from mismatch");

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

const primitiveBuffer = createSizeBuffer(128);
MSG_WriteChar(primitiveBuffer, -1);
MSG_WriteByte(primitiveBuffer, 255);
MSG_WriteShort(primitiveBuffer, -12345);
MSG_WriteLong(primitiveBuffer, -123456789);
MSG_WriteFloat(primitiveBuffer, 123.5);
MSG_WriteString(primitiveBuffer, null);
MSG_WriteString(primitiveBuffer, "idtail");
MSG_WriteCoord(primitiveBuffer, -12.75);
MSG_WritePos(primitiveBuffer, [1.25, -2.5, 3.875]);
MSG_WriteAngle(primitiveBuffer, 450);
MSG_WriteAngle16(primitiveBuffer, -90);
assert.deepEqual(
  Array.from(primitiveBuffer.data.subarray(0, primitiveBuffer.cursize)),
  [
    255,
    255,
    199,
    207,
    235,
    50,
    164,
    248,
    0,
    0,
    247,
    66,
    0,
    105,
    100,
    116,
    97,
    105,
    108,
    0,
    154,
    255,
    10,
    0,
    236,
    255,
    31,
    0,
    64,
    0,
    192
  ],
  "MSG primitive write byte layout mismatch"
);
primitiveBuffer.readcount = 0;
primitiveBuffer.readcount = 99;
MSG_BeginReading(primitiveBuffer);
assert.equal(primitiveBuffer.readcount, 0, "MSG_BeginReading should reset primitive read cursor");
assert.equal(MSG_ReadChar(primitiveBuffer), -1, "MSG_WriteChar roundtrip mismatch");
assert.equal(MSG_ReadByte(primitiveBuffer), 255, "MSG_WriteByte roundtrip mismatch");
assert.equal(MSG_ReadShort(primitiveBuffer), -12345, "MSG_WriteShort roundtrip mismatch");
assert.equal(MSG_ReadLong(primitiveBuffer), -123456789, "MSG_WriteLong roundtrip mismatch");
assert.equal(MSG_ReadFloat(primitiveBuffer), 123.5, "MSG_WriteFloat roundtrip mismatch");
assert.equal(MSG_ReadString(primitiveBuffer), "", "MSG_WriteString null roundtrip mismatch");
assert.equal(MSG_ReadString(primitiveBuffer), "idtail", "MSG_WriteString roundtrip mismatch");
assert.equal(MSG_ReadCoord(primitiveBuffer), -12.75, "MSG_WriteCoord roundtrip mismatch");
assert.deepEqual(MSG_ReadPos(primitiveBuffer), [1.25, -2.5, 3.875], "MSG_WritePos roundtrip mismatch");
assert.equal(MSG_ReadAngle(primitiveBuffer), 90, "MSG_WriteAngle roundtrip mismatch");
assert.equal(MSG_ReadAngle16(primitiveBuffer), -90, "MSG_WriteAngle16 roundtrip mismatch");

const lineBuffer = createSizeBuffer(new Uint8Array([97, 108, 112, 104, 97, 10, 98, 101, 116, 97, 0]));
lineBuffer.cursize = lineBuffer.data.length;
assert.equal(MSG_ReadStringLine(lineBuffer), "alpha", "MSG_ReadStringLine newline stop mismatch");
assert.equal(MSG_ReadString(lineBuffer), "beta", "MSG_ReadString after line mismatch");

const rawDataBuffer = createSizeBuffer(new Uint8Array([1, 2, 3, 4]));
rawDataBuffer.cursize = rawDataBuffer.data.length;
assert.deepEqual(Array.from(MSG_ReadData(rawDataBuffer, 3)), [1, 2, 3], "MSG_ReadData bytes mismatch");
assert.equal(rawDataBuffer.readcount, 3, "MSG_ReadData readcount mismatch");

const overflowByteBuffer = createSizeBuffer(new Uint8Array([0xaa]));
overflowByteBuffer.cursize = 0;
assert.equal(MSG_ReadChar(overflowByteBuffer), -1, "MSG_ReadChar overflow value mismatch");
assert.equal(overflowByteBuffer.readcount, 1, "MSG_ReadChar overflow readcount mismatch");
const overflowShortBuffer = createSizeBuffer(new Uint8Array([0xaa]));
overflowShortBuffer.cursize = 1;
assert.equal(MSG_ReadShort(overflowShortBuffer), -1, "MSG_ReadShort overflow value mismatch");
assert.equal(overflowShortBuffer.readcount, 2, "MSG_ReadShort overflow readcount mismatch");
const overflowLongBuffer = createSizeBuffer(new Uint8Array([0xaa, 0xbb, 0xcc]));
overflowLongBuffer.cursize = 3;
assert.equal(MSG_ReadLong(overflowLongBuffer), -1, "MSG_ReadLong overflow value mismatch");
assert.equal(overflowLongBuffer.readcount, 4, "MSG_ReadLong overflow readcount mismatch");
const overflowFloatBuffer = createSizeBuffer(new Uint8Array([0xaa, 0xbb, 0xcc]));
overflowFloatBuffer.cursize = 3;
assert.equal(MSG_ReadFloat(overflowFloatBuffer), -1, "MSG_ReadFloat overflow value mismatch");
assert.equal(overflowFloatBuffer.readcount, 4, "MSG_ReadFloat overflow readcount mismatch");
const overflowDataBuffer = createSizeBuffer(new Uint8Array([9]));
overflowDataBuffer.cursize = 1;
assert.deepEqual(Array.from(MSG_ReadData(overflowDataBuffer, 3)), [9, 255, 255], "MSG_ReadData overflow byte coercion mismatch");
assert.equal(overflowDataBuffer.readcount, 3, "MSG_ReadData overflow readcount mismatch");

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
assert.deepEqual(
  Array.from(cmdBuffer.data.subarray(0, cmdBuffer.cursize)),
  [CM_ANGLE2 | CM_SIDE | CM_BUTTONS | CM_IMPULSE, 222, 0, 244, 255, 5, 9, 16, 77],
  "MSG delta usercmd byte layout mismatch"
);
cmdBuffer.readcount = 0;
assert.deepEqual(MSG_ReadDeltaUsercmd(cmdBuffer, fromCmd), nextCmd, "MSG delta usercmd mismatch");

const unchangedCmdBuffer = createSizeBuffer(new Uint8Array([0, 20, 33]));
unchangedCmdBuffer.cursize = unchangedCmdBuffer.data.length;
const unchangedCmd = MSG_ReadDeltaUsercmd(unchangedCmdBuffer, fromCmd);
assert.deepEqual(
  unchangedCmd,
  { ...fromCmd, angles: [...fromCmd.angles], msec: 20, lightlevel: 33 },
  "MSG_ReadDeltaUsercmd unchanged fields mismatch"
);
unchangedCmd.angles[0] = 999;
assert.equal(fromCmd.angles[0], 100, "MSG_ReadDeltaUsercmd must clone angle array");

const dirBuffer = createSizeBuffer(8);
MSG_WriteDir(dirBuffer, [0, 0, 1]);
MSG_WriteDir(dirBuffer, null);
dirBuffer.readcount = 0;
assert.deepEqual(MSG_ReadDir(dirBuffer), [0, 0, 1], "MSG dir roundtrip mismatch");
assert.deepEqual(MSG_ReadDir(dirBuffer), [-0.525731, 0, 0.850651], "MSG dir null fallback mismatch");
const invalidDirBuffer = createSizeBuffer(new Uint8Array([255]));
invalidDirBuffer.cursize = 1;
assert.throws(() => MSG_ReadDir(invalidDirBuffer), /out of range/, "MSG_ReadDir invalid index mismatch");

const C_ENTITY_DELTA_HEADER =
  C_U_NUMBER16 |
  C_U_MODEL |
  C_U_FRAME8 |
  C_U_SKIN8 |
  C_U_ORIGIN1 |
  C_U_RENDERFX8 |
  C_U_SOUND |
  C_U_EVENT |
  C_U_OLDORIGIN |
  C_U_MOREBITS1 |
  C_U_MOREBITS2 |
  C_U_MOREBITS3;
assert.equal(C_ENTITY_DELTA_HEADER, 0x058199b1, "C MSG_WriteDeltaEntity representative header expectation mismatch");
const C_ENTITY_DELTA_FULL_HEADER =
  C_U_MODEL |
  C_U_MODEL2 |
  C_U_MODEL3 |
  C_U_MODEL4 |
  C_U_FRAME16 |
  C_U_SKIN8 |
  C_U_SKIN16 |
  C_U_EFFECTS8 |
  C_U_EFFECTS16 |
  C_U_RENDERFX8 |
  C_U_RENDERFX16 |
  C_U_ORIGIN1 |
  C_U_ORIGIN2 |
  C_U_ORIGIN3 |
  C_U_ANGLE1 |
  C_U_ANGLE2 |
  C_U_ANGLE3 |
  C_U_OLDORIGIN |
  C_U_SOUND |
  C_U_EVENT |
  C_U_SOLID |
  C_U_MOREBITS1 |
  C_U_MOREBITS2 |
  C_U_MOREBITS3;
assert.equal(C_ENTITY_DELTA_FULL_HEADER, 0x0fffdeaf, "C MSG_WriteDeltaEntity full header expectation mismatch");

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
assert.deepEqual(
  Array.from(entityBuffer.data.subarray(0, 4)),
  [C_ENTITY_DELTA_HEADER & 255, (C_ENTITY_DELTA_HEADER >> 8) & 255, (C_ENTITY_DELTA_HEADER >> 16) & 255, (C_ENTITY_DELTA_HEADER >> 24) & 255],
  "MSG delta entity header bytes mismatch"
);
entityBuffer.readcount = 0;
const entityBits =
  MSG_ReadByte(entityBuffer) |
  (MSG_ReadByte(entityBuffer) << 8) |
  (MSG_ReadByte(entityBuffer) << 16) |
  (MSG_ReadByte(entityBuffer) << 24);
assert.equal(
  entityBits,
  C_ENTITY_DELTA_HEADER,
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
assert.deepEqual(
  Array.from(fullBuffer.data.subarray(0, 4)),
  [C_ENTITY_DELTA_FULL_HEADER & 255, (C_ENTITY_DELTA_FULL_HEADER >> 8) & 255, (C_ENTITY_DELTA_FULL_HEADER >> 16) & 255, (C_ENTITY_DELTA_FULL_HEADER >> 24) & 255],
  "MSG delta entity full header bytes mismatch"
);
fullBuffer.readcount = 0;
const fullBits =
  MSG_ReadByte(fullBuffer) |
  (MSG_ReadByte(fullBuffer) << 8) |
  (MSG_ReadByte(fullBuffer) << 16) |
  (MSG_ReadByte(fullBuffer) << 24);
assert.equal(
  fullBits,
  C_ENTITY_DELTA_FULL_HEADER,
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
assert.equal(COM_Argc(common), 8, "COM_Argc mismatch");
assert.equal(COM_Argv(common, 0), "quake2", "COM_Argv argv0 mismatch");
assert.equal(COM_Argv(common, -1), "", "COM_Argv negative fallback mismatch");
assert.equal(COM_Argv(common, 8), "", "COM_Argv overflow fallback mismatch");
assert.equal(COM_CheckParm(common, "+map"), 4, "COM_CheckParm found mismatch");
assert.equal(COM_CheckParm(common, "-missing"), 0, "COM_CheckParm missing mismatch");
COM_ClearArgv(common, -1);
assert.equal(COM_Argv(common, 0), "quake2", "COM_ClearArgv invalid index mismatch");

const sanitizedCommon = createCommonRuntime();
COM_InitArgv(sanitizedCommon, ["quake2", "", "x".repeat(MAX_TOKEN_CHARS)]);
assert.equal(COM_Argv(sanitizedCommon, 1), "", "COM_InitArgv empty string mismatch");
assert.equal(COM_Argv(sanitizedCommon, 2), "", "COM_InitArgv MAX_TOKEN_CHARS sanitization mismatch");

const addParmCommon = createCommonRuntime();
COM_InitArgv(addParmCommon, ["quake2"]);
COM_AddParm(addParmCommon, "+connect");
assert.equal(COM_Argc(addParmCommon), 2, "COM_AddParm argc mismatch");
assert.equal(COM_Argv(addParmCommon, 1), "+connect", "COM_AddParm argv mismatch");

const fullArgvCommon = createCommonRuntime();
COM_InitArgv(fullArgvCommon, Array.from({ length: 50 }, (_, index) => String(index)));
assert.throws(() => COM_AddParm(fullArgvCommon, "overflow"), /COM_AddParm: MAX_NUM_ARGVS/, "COM_AddParm overflow mismatch");
assert.throws(
  () => COM_InitArgv(createCommonRuntime(), Array.from({ length: 51 }, (_, index) => String(index))),
  /argc > MAX_NUM_ARGVS/,
  "COM_InitArgv overflow mismatch"
);

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

assert.equal(EXEC_NOW, 0, "EXEC_NOW mismatch");
assert.equal(EXEC_INSERT, 1, "EXEC_INSERT mismatch");
assert.equal(EXEC_APPEND, 2, "EXEC_APPEND mismatch");

const commandProofRuntime = createCommandRuntime();
const commandProofExecuted: string[] = [];
Cbuf_Init(commandProofRuntime);
Cmd_AddCommand(commandProofRuntime, "record", () => {
  commandProofExecuted.push(Cmd_Args(commandProofRuntime));
});
assert.equal(Cmd_Exists(commandProofRuntime, "record"), true, "Cmd_AddCommand/Cmd_Exists mismatch");
assert.equal(Cmd_CompleteCommand(commandProofRuntime, "rec"), "record", "Cmd_CompleteCommand mismatch");
Cmd_ExecuteString(commandProofRuntime, "record alpha beta");
assert.equal(Cmd_Argc(commandProofRuntime), 3, "Cmd_Argc mismatch");
assert.equal(Cmd_Argv(commandProofRuntime, 1), "alpha", "Cmd_Argv mismatch");
assert.equal(Cmd_Args(commandProofRuntime), "alpha beta", "Cmd_Args mismatch");
assert.deepEqual(commandProofExecuted, ["alpha beta"], "Cmd_ExecuteString mismatch");
Cmd_RemoveCommand(commandProofRuntime, "record");
assert.equal(Cmd_Exists(commandProofRuntime, "record"), false, "Cmd_RemoveCommand mismatch");

const bufferProofRuntime = createCommandRuntime();
const bufferProofExecuted: string[] = [];
Cmd_AddCommand(bufferProofRuntime, "record", () => {
  bufferProofExecuted.push(Cmd_Argv(bufferProofRuntime, 1));
});
Cbuf_AddText(bufferProofRuntime, "record tail\n");
Cbuf_InsertText(bufferProofRuntime, "record head\n");
Cbuf_Execute(bufferProofRuntime);
assert.deepEqual(bufferProofExecuted, ["head", "tail"], "Cbuf_AddText/Cbuf_InsertText/Cbuf_Execute mismatch");
Cbuf_ExecuteText(bufferProofRuntime, EXEC_NOW, "record now");
Cbuf_ExecuteText(bufferProofRuntime, EXEC_INSERT, "record inserted\n");
Cbuf_ExecuteText(bufferProofRuntime, EXEC_APPEND, "record appended\n");
Cbuf_Execute(bufferProofRuntime);
assert.deepEqual(
  bufferProofExecuted.slice(-3),
  ["now", "inserted", "appended"],
  "Cbuf_ExecuteText modes mismatch"
);
Cbuf_AddText(bufferProofRuntime, "record deferred\n");
Cbuf_CopyToDefer(bufferProofRuntime);
assert.equal(bufferProofRuntime.cmd_text.cursize, 0, "Cbuf_CopyToDefer clear mismatch");
Cbuf_InsertFromDefer(bufferProofRuntime);
Cbuf_Execute(bufferProofRuntime);
assert.equal(bufferProofExecuted.at(-1), "deferred", "Cbuf_InsertFromDefer mismatch");

const initProofRuntime = createCommandRuntime();
Cmd_Init(initProofRuntime);
assert.equal(Cmd_Exists(initProofRuntime, "exec"), true, "Cmd_Init exec registration mismatch");
assert.equal(Cmd_Exists(initProofRuntime, "wait"), true, "Cmd_Init wait registration mismatch");

const cvarPrinted: string[] = [];
const cvarGameDirs: string[] = [];
let cvarAutoexecs = 0;
const cvarProofRuntime = createCvarRuntime({
  onPrint: (line) => cvarPrinted.push(line),
  onGameDirChange: (value) => cvarGameDirs.push(value),
  onExecAutoexec: () => {
    cvarAutoexecs += 1;
  }
});
assert.deepEqual(cvarProofRuntime.cvar_vars, [], "cvar_vars should start empty");
const cvarSkill = Cvar_Get(cvarProofRuntime, "skill", "1", CVAR_SERVERINFO | CVAR_ARCHIVE);
assert.ok(cvarSkill, "Cvar_Get should create a missing cvar");
assert.equal(cvarProofRuntime.cvar_vars[0], cvarSkill, "Cvar_Get should link cvar_vars at the head");
assert.equal(Cvar_Get(cvarProofRuntime, "skill", "2", CVAR_USERINFO), cvarSkill, "Cvar_Get should return existing cvar");
assert.equal(Cvar_VariableString(cvarProofRuntime, "skill"), "1", "Cvar_VariableString mismatch");
assert.equal(Cvar_VariableValue(cvarProofRuntime, "skill"), 1, "Cvar_VariableValue mismatch");
assert.equal(Cvar_CompleteVariable(cvarProofRuntime, "ski"), "skill", "Cvar_CompleteVariable mismatch");
Cvar_FullSet(cvarProofRuntime, "rate", "25000", CVAR_USERINFO | CVAR_ARCHIVE);
Cvar_Set(cvarProofRuntime, "rate", "30000");
assert.equal(Cvar_VariableString(cvarProofRuntime, "rate"), "30000", "Cvar_Set mismatch");
assert.equal(cvarProofRuntime.userinfo_modified, true, "Cvar_Set userinfo_modified mismatch");
Cvar_SetValue(cvarProofRuntime, "fraglimit", 2.5);
assert.equal(Cvar_VariableString(cvarProofRuntime, "fraglimit"), "2.500000", "Cvar_SetValue float formatting mismatch");
const cvarGame = Cvar_Get(cvarProofRuntime, "game", "baseq2", CVAR_LATCH);
assert.ok(cvarGame, "latched game cvar should be created");
Cvar_SetServerState(cvarProofRuntime, 1);
Cvar_Set(cvarProofRuntime, "game", "rogue");
assert.equal(cvarGame.latched_string, "rogue", "Cvar_Set should defer latched cvars while running");
Cvar_GetLatchedVars(cvarProofRuntime);
assert.equal(Cvar_VariableString(cvarProofRuntime, "game"), "rogue", "Cvar_GetLatchedVars should apply pending value");
assert.deepEqual(cvarGameDirs, ["rogue"], "Cvar_GetLatchedVars game dir hook mismatch");
assert.equal(cvarAutoexecs, 1, "Cvar_GetLatchedVars autoexec hook mismatch");
Cvar_ForceSet(cvarProofRuntime, "game", "baseq2");
assert.equal(Cvar_VariableString(cvarProofRuntime, "game"), "baseq2", "Cvar_ForceSet mismatch");
assert.equal(Cvar_Userinfo(cvarProofRuntime), "\\rate\\30000\\skill\\1", "Cvar_Userinfo mismatch");
assert.equal(Cvar_Serverinfo(cvarProofRuntime), "\\skill\\1", "Cvar_Serverinfo mismatch");
assert.deepEqual(
  Cvar_WriteVariables(cvarProofRuntime).split("\n").filter(Boolean),
  ['set rate "30000"', 'set skill "1"'],
  "Cvar_WriteVariables mismatch"
);
const cvarCommandRuntime = createCommandRuntime();
Cvar_Init(cvarProofRuntime, cvarCommandRuntime);
assert.equal(Cmd_Exists(cvarCommandRuntime, "set"), true, "Cvar_Init set registration mismatch");
assert.equal(Cmd_Exists(cvarCommandRuntime, "cvarlist"), true, "Cvar_Init cvarlist registration mismatch");
Cmd_TokenizeString(cvarCommandRuntime, "rate", true);
assert.deepEqual(Cvar_Command(cvarProofRuntime, cvarCommandRuntime), { handled: true, output: "\"rate\" is \"30000\"" }, "Cvar_Command inspect mismatch");
Cmd_TokenizeString(cvarCommandRuntime, "rate 32000", true);
assert.deepEqual(Cvar_Command(cvarProofRuntime, cvarCommandRuntime), { handled: true }, "Cvar_Command set mismatch");
assert.equal(Cvar_VariableString(cvarProofRuntime, "rate"), "32000", "Cvar_Command mutation mismatch");

console.log("quake2-qcommon-header: ok");
