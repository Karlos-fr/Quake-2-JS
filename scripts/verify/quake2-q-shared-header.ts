/**
 * File: quake2-q-shared-header.ts
 * Purpose: Verify the primary TypeScript target for `game/q_shared.h` and its split declarations.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict shared-header port.
 *
 * Dependencies:
 * - packages/qcommon/src/q-shared.ts
 * - packages/qcommon/src/cvar.ts
 * - packages/math/src/index.ts
 * - packages/game/src/m_flash.ts
 */

import { strict as assert } from "node:assert";

import {
  _DotProduct,
  _VectorAdd,
  _VectorCopy,
  _VectorSubtract,
  AddPointToBounds,
  anglemod,
  BoxOnPlaneSide,
  BoxOnPlaneSide2,
  ClearBounds,
  CrossProduct,
  PerpendicularVector,
  ProjectPointOnPlane,
  Q_fabs,
  Q_log2,
  R_ConcatRotations,
  R_ConcatTransforms,
  RotatePointAroundVector,
  VectorCompare,
  VectorInverse,
  VectorLength,
  VectorMA,
  VectorNormalize,
  VectorNormalize2,
  VectorScale,
  vec3_origin
} from "../../packages/math/src/q_shared.js";
import { monster_flash_offset } from "../../packages/game/src/m_flash.js";
import {
  BigFloat,
  BigLong,
  BigShort,
  COM_DefaultExtension,
  COM_FileBase,
  COM_FileExtension,
  COM_FilePath,
  COM_Parse,
  COM_SkipPath,
  COM_StripExtension,
  Info_RemoveKey,
  Info_SetValueForKey,
  Info_Validate,
  Info_ValueForKey,
  LittleFloat,
  LittleLong,
  LittleShort,
  Q_strcasecmp,
  Q_stricmp,
  Q_strncasecmp,
  Swap_Init,
  va
} from "../../packages/qcommon/src/common.js";
import {
  Com_PageInMemory,
  createSystemRuntime,
  get_curtime,
  Hunk_Alloc,
  Hunk_Begin,
  Hunk_End,
  Hunk_Free,
  Sys_Error,
  Sys_FindClose,
  Sys_FindFirst,
  Sys_FindNext,
  Sys_Milliseconds,
  Sys_Mkdir
} from "../../packages/qcommon/src/system.js";
import {
  ANGLE2SHORT,
  CPLANE_DIST,
  CPLANE_NORMAL_X,
  CPLANE_NORMAL_Y,
  CPLANE_NORMAL_Z,
  CPLANE_PAD0,
  CPLANE_PAD1,
  CPLANE_SIGNBITS,
  CPLANE_TYPE,
  CS_GENERAL,
  CS_IMAGES,
  CS_ITEMS,
  CS_LIGHTS,
  CS_MODELS,
  CS_PLAYERSKINS,
  CS_SOUNDS,
  ERR_DISCONNECT,
  ERR_DROP,
  ERR_FATAL,
  DF_FIXED_FOV,
  DF_NO_HEALTH,
  DF_QUADFIRE_DROP,
  EF_DOUBLE,
  EF_TRAP,
  IS_NAN,
  LAST_VISIBLE_CONTENTS,
  MAX_CLIENTS,
  MAX_GENERAL,
  MAX_IMAGES,
  MAX_ITEMS,
  MAX_LIGHTSTYLES,
  MAX_MODELS,
  MAX_SOUNDS,
  MZ_SILENCED,
  nanmask,
  Q_ftol,
  ROGUE_VERSION_ID,
  ROGUE_VERSION_STRING,
  SHORT2ANGLE,
  SPLASH_BLOOD,
  VIDREF_GL,
  VIDREF_OTHER,
  VIDREF_SOFT,
  AngleVectors,
  createEntityState,
  createPlayerState
} from "../../packages/qcommon/src/q_shared.js";
import { CVAR_ARCHIVE, CVAR_LATCH, CVAR_NOSET, CVAR_SERVERINFO, CVAR_USERINFO } from "../../packages/qcommon/src/cvar.js";

assert.equal(LAST_VISIBLE_CONTENTS, 64, "LAST_VISIBLE_CONTENTS mismatch");
assert.equal(DF_NO_HEALTH, 0x00000001, "DF_NO_HEALTH mismatch");
assert.equal(DF_FIXED_FOV, 0x00008000, "DF_FIXED_FOV mismatch");
assert.equal(DF_QUADFIRE_DROP, 0x00010000, "DF_QUADFIRE_DROP mismatch");
assert.equal(EF_TRAP, 0x02000000, "EF_TRAP mismatch");
assert.equal(EF_DOUBLE, 0x08000000, "EF_DOUBLE mismatch");
assert.equal(SPLASH_BLOOD, 6, "SPLASH_BLOOD mismatch");
assert.equal(MZ_SILENCED, 128, "MZ_SILENCED mismatch");
assert.equal(ERR_FATAL, 0, "ERR_FATAL mismatch");
assert.equal(ERR_DROP, 1, "ERR_DROP mismatch");
assert.equal(ERR_DISCONNECT, 2, "ERR_DISCONNECT mismatch");
assert.equal(nanmask, 255 << 23, "nanmask mismatch");
assert.equal(IS_NAN(Number.NaN), true, "IS_NAN true mismatch");
assert.equal(IS_NAN(1), false, "IS_NAN false mismatch");
assert.equal(Q_ftol(3.9), 3, "Q_ftol positive mismatch");
assert.equal(Q_ftol(-3.9), -3, "Q_ftol negative mismatch");

assert.equal(CVAR_ARCHIVE, 1, "CVAR_ARCHIVE mismatch");
assert.equal(CVAR_USERINFO, 2, "CVAR_USERINFO mismatch");
assert.equal(CVAR_SERVERINFO, 4, "CVAR_SERVERINFO mismatch");
assert.equal(CVAR_NOSET, 8, "CVAR_NOSET mismatch");
assert.equal(CVAR_LATCH, 16, "CVAR_LATCH mismatch");

assert.equal(CS_SOUNDS, CS_MODELS + MAX_MODELS, "CS_SOUNDS chain mismatch");
assert.equal(CS_IMAGES, CS_SOUNDS + MAX_SOUNDS, "CS_IMAGES chain mismatch");
assert.equal(CS_LIGHTS, CS_IMAGES + MAX_IMAGES, "CS_LIGHTS chain mismatch");
assert.equal(CS_ITEMS, CS_LIGHTS + MAX_LIGHTSTYLES, "CS_ITEMS chain mismatch");
assert.equal(CS_PLAYERSKINS, CS_ITEMS + MAX_ITEMS, "CS_PLAYERSKINS chain mismatch");
assert.equal(CS_GENERAL, CS_PLAYERSKINS + MAX_CLIENTS, "CS_GENERAL chain mismatch");
assert.equal(MAX_GENERAL, MAX_CLIENTS * 2, "MAX_GENERAL mismatch");

assert.equal(VIDREF_GL, 1, "VIDREF_GL mismatch");
assert.equal(VIDREF_SOFT, 2, "VIDREF_SOFT mismatch");
assert.equal(VIDREF_OTHER, 3, "VIDREF_OTHER mismatch");
assert.equal(ROGUE_VERSION_ID, 1278, "ROGUE_VERSION_ID mismatch");
assert.equal(ROGUE_VERSION_STRING, "08/21/1998 Beta 2 for Ensemble", "ROGUE_VERSION_STRING mismatch");

const shortAngle = ANGLE2SHORT(180);
assert.equal(shortAngle, 32768, "ANGLE2SHORT 180 mismatch");
assert.equal(SHORT2ANGLE(shortAngle), 180, "SHORT2ANGLE mismatch");

assert.deepEqual(vec3_origin, [0, 0, 0], "vec3_origin mismatch");
assert.ok(monster_flash_offset.length > 200, "monster_flash_offset table must preserve MZ2 coverage");
assert.equal(COM_SkipPath("textures/e1u1/wall.wal"), "wall.wal", "COM_SkipPath mismatch");
assert.equal(COM_StripExtension("maps/base1.bsp"), "maps/base1", "COM_StripExtension mismatch");
assert.equal(COM_FileExtension("maps/base1.bsp"), "bsp", "COM_FileExtension mismatch");
assert.equal(COM_FileExtension("archive.tar.longext"), "tar.lon", "COM_FileExtension static buffer width mismatch");
assert.equal(COM_FileBase("maps/base1.bsp"), "base1", "COM_FileBase mismatch");
assert.equal(COM_FilePath("maps/base1.bsp"), "maps", "COM_FilePath mismatch");
assert.equal(COM_DefaultExtension("maps/base1", ".bsp"), "maps/base1.bsp", "COM_DefaultExtension mismatch");
assert.equal(COM_DefaultExtension("maps/base1.bsp", ".wal"), "maps/base1.bsp", "COM_DefaultExtension existing ext mismatch");

const parseSource = "   // comment\n\"hello world\" next";
const parseResult = COM_Parse(parseSource);
assert.equal(parseResult.token, "hello world", "COM_Parse quoted token mismatch");
assert.equal(COM_Parse(parseSource, parseResult.nextIndex ?? 0).token, "next", "COM_Parse next token mismatch");

let info = "";
info = Info_SetValueForKey(info, "name", "player");
info = Info_SetValueForKey(info, "skin", "male/grunt");
assert.equal(Info_ValueForKey(info, "name"), "player", "Info_ValueForKey mismatch");
assert.equal(Info_RemoveKey(info, "name"), "\\skin\\male/grunt", "Info_RemoveKey mismatch");
assert.equal(Info_Validate("\\name\\ok"), true, "Info_Validate valid mismatch");
assert.equal(Info_Validate("\\name\\bad;value"), false, "Info_Validate invalid mismatch");

assert.equal(BigShort(0x1234), 0x3412, "BigShort mismatch on little-endian host expectation");
assert.equal(LittleShort(0x1234), 0x1234, "LittleShort mismatch");
assert.equal(BigLong(0x12345678), 0x78563412, "BigLong mismatch on little-endian host expectation");
assert.equal(LittleLong(0x12345678), 0x12345678, "LittleLong mismatch");
assert.ok(Math.abs(BigFloat(1.0) - 4.600602988224807e-41) < 1e-45, "BigFloat mismatch");
assert.equal(LittleFloat(1.0), 1.0, "LittleFloat mismatch");
assert.equal(Swap_Init().bigendien, false, "Swap_Init host-endian detection mismatch");
assert.equal(va("a", 1, "b"), "a1b", "va mismatch");
assert.equal(Q_stricmp("Blaster", "blaster"), 0, "Q_stricmp mismatch");
assert.equal(Q_strcasecmp("Rocket", "rocket"), 0, "Q_strcasecmp mismatch");
assert.equal(Q_strncasecmp("Machinegun", "machine", 7), 0, "Q_strncasecmp prefix mismatch");
assert.equal(Q_strncasecmp("Rocket", "Rail", 3), -1, "Q_strncasecmp mismatch");

const systemCalls: string[] = [];
const systemRuntime = createSystemRuntime({
  milliseconds: () => 1234,
  mkdir: (path) => systemCalls.push(`mkdir:${path}`),
  error: (message) => {
    throw new Error(`fatal:${message}`);
  },
  find: (path) => [
    { path: `${path}/first` },
    { path: `${path}/second` }
  ]
});

assert.equal(Sys_Milliseconds(systemRuntime), 1234, "Sys_Milliseconds mismatch");
assert.equal(get_curtime(systemRuntime), 1234, "curtime mismatch");
Sys_Mkdir(systemRuntime, "baseq2/save");
assert.deepEqual(systemCalls, ["mkdir:baseq2/save"], "Sys_Mkdir mismatch");

const hunk = Hunk_Begin(systemRuntime, 16);
assert.equal(hunk.length, 16, "Hunk_Begin mismatch");
const chunk = Hunk_Alloc(systemRuntime, 4);
chunk[0] = 7;
assert.equal(Hunk_End(systemRuntime), 4, "Hunk_End mismatch");
Hunk_Free(systemRuntime, hunk);
assert.equal(Hunk_End(systemRuntime), 0, "Hunk_Free mismatch");

assert.equal(Sys_FindFirst(systemRuntime, "maps", 0, 0), "maps/first", "Sys_FindFirst mismatch");
assert.equal(Sys_FindNext(systemRuntime, 0, 0), "maps/second", "Sys_FindNext mismatch");
Sys_FindClose(systemRuntime);
assert.equal(Sys_FindNext(systemRuntime, 0, 0), null, "Sys_FindClose mismatch");

Com_PageInMemory(systemRuntime, new Uint8Array([1, 2, 3, 4]), 4);
assert.equal(systemRuntime.paged_total, 4, "Com_PageInMemory mismatch");

assert.throws(() => Sys_Error(systemRuntime, "boom"), /fatal:boom/, "Sys_Error mismatch");

const mins: [number, number, number] = [0, 0, 0];
const maxs: [number, number, number] = [0, 0, 0];
ClearBounds(mins, maxs);
assert.deepEqual(mins, [99999, 99999, 99999], "ClearBounds mins mismatch");
assert.deepEqual(maxs, [-99999, -99999, -99999], "ClearBounds maxs mismatch");
AddPointToBounds([4, -2, 8], mins, maxs);
assert.deepEqual(mins, [4, -2, 8], "AddPointToBounds mins mismatch");
assert.deepEqual(maxs, [4, -2, 8], "AddPointToBounds maxs mismatch");
assert.equal(VectorCompare([1, 2, 3], [1, 2, 3]), 1, "VectorCompare equal mismatch");
assert.equal(VectorCompare([1, 2, 3], [1, 2, 4]), 0, "VectorCompare mismatch");
assert.equal(Q_fabs(-3.5), 3.5, "Q_fabs negative mismatch");
assert.equal(Q_fabs(3.5), 3.5, "Q_fabs positive mismatch");

const normalizedInPlace: [number, number, number] = [0, 3, 4];
assert.equal(VectorNormalize(normalizedInPlace), 5, "VectorNormalize length mismatch");
assert.ok(
  Math.abs(normalizedInPlace[0]) < 1e-12 &&
  Math.abs(normalizedInPlace[1] - 0.6) < 1e-12 &&
  Math.abs(normalizedInPlace[2] - 0.8) < 1e-12,
  "VectorNormalize in-place vector mismatch"
);

const normalizedOut: [number, number, number] = [0, 0, 0];
assert.equal(VectorNormalize2([0, 3, 4], normalizedOut), 5, "VectorNormalize2 length mismatch");
assert.ok(
  Math.abs(normalizedOut[0]) < 1e-12 &&
  Math.abs(normalizedOut[1] - 0.6) < 1e-12 &&
  Math.abs(normalizedOut[2] - 0.8) < 1e-12,
  "VectorNormalize2 vector mismatch"
);
const inverse: [number, number, number] = [1, -2, 3];
VectorInverse(inverse);
assert.deepEqual(inverse, [-1, 2, -3], "VectorInverse mismatch");
assert.equal(VectorLength([2, 3, 6]), 7, "VectorLength mismatch");
const scaled: [number, number, number] = [0, 0, 0];
VectorScale([2, -3, 4], 2.5, scaled);
assert.deepEqual(scaled, [5, -7.5, 10], "VectorScale mismatch");
const ma: [number, number, number] = [0, 0, 0];
VectorMA([1, 2, 3], 4, [5, 6, 7], ma);
assert.deepEqual(ma, [21, 26, 31], "VectorMA mismatch");
const cross: [number, number, number] = [0, 0, 0];
CrossProduct([1, 0, 0], [0, 1, 0], cross);
assert.deepEqual(cross, [0, 0, 1], "CrossProduct mismatch");
assert.equal(Q_log2(8), 3, "Q_log2 mismatch");
assert.equal(_DotProduct([1, 2, 3], [4, 5, 6]), 32, "_DotProduct mismatch");

const added: [number, number, number] = [0, 0, 0];
_VectorAdd([1, 2, 3], [4, 5, 6], added);
assert.deepEqual(added, [5, 7, 9], "_VectorAdd mismatch");
const subtracted: [number, number, number] = [0, 0, 0];
_VectorSubtract([4, 5, 6], [1, 2, 3], subtracted);
assert.deepEqual(subtracted, [3, 3, 3], "_VectorSubtract mismatch");
const copied: [number, number, number] = [0, 0, 0];
_VectorCopy([7, 8, 9], copied);
assert.deepEqual(copied, [7, 8, 9], "_VectorCopy mismatch");

assert.equal(anglemod(450), 90, "anglemod mismatch");
const projected: [number, number, number] = [0, 0, 0];
ProjectPointOnPlane(projected, [1, 2, 3], [0, 0, 1]);
assert.deepEqual(projected, [1, 2, 0], "ProjectPointOnPlane mismatch");
const perpendicular: [number, number, number] = [0, 0, 0];
PerpendicularVector(perpendicular, [0, 0, 1]);
assert.ok(Math.abs(perpendicular[2]) < 1e-6, "PerpendicularVector mismatch");

const rotationLeft = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1]
];
const rotationRight = [
  [0, -1, 0],
  [1, 0, 0],
  [0, 0, 1]
];
const rotationOut = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
];
R_ConcatRotations(rotationLeft, rotationRight, rotationOut);
assert.deepEqual(rotationOut, rotationRight, "R_ConcatRotations mismatch");

const transformLeft = [
  [1, 0, 0, 5],
  [0, 1, 0, 6],
  [0, 0, 1, 7]
];
const transformRight = [
  [1, 0, 0, 1],
  [0, 1, 0, 2],
  [0, 0, 1, 3]
];
const transformOut = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
];
R_ConcatTransforms(transformLeft, transformRight, transformOut);
assert.deepEqual(transformOut, [
  [1, 0, 0, 6],
  [0, 1, 0, 8],
  [0, 0, 1, 10]
], "R_ConcatTransforms mismatch");

const rotatedPoint: [number, number, number] = [0, 0, 0];
RotatePointAroundVector(rotatedPoint, [0, 0, 1], [1, 0, 0], 90);
assert.ok(Math.abs(rotatedPoint[0]) < 1e-6 && Math.abs(rotatedPoint[1] - 1) < 1e-6, "RotatePointAroundVector mismatch");

assert.equal(BoxOnPlaneSide([-1, -1, -1], [1, 1, 1], {
  normal: [1, 0, 0],
  dist: 0,
  type: 0,
  signbits: 0
}), 3, "BoxOnPlaneSide mismatch");
assert.equal(BoxOnPlaneSide2([-1, -1, -1], [1, 1, 1], {
  normal: [1, 0, 0],
  dist: 0,
  type: 0,
  signbits: 0
}), 3, "BoxOnPlaneSide2 mismatch");

const forwardOut: [number, number, number] = [0, 0, 0];
const rightOut: [number, number, number] = [0, 0, 0];
const upOut: [number, number, number] = [0, 0, 0];
const angleVectors = AngleVectors([0, 90, 0], forwardOut, rightOut, upOut);
assert.ok(Math.abs(forwardOut[0]) < 1e-6 && Math.abs(forwardOut[1] - 1) < 1e-6, "AngleVectors forward out mismatch");
assert.deepEqual(forwardOut, angleVectors.forward, "AngleVectors return/out forward mismatch");
assert.deepEqual(rightOut, angleVectors.right, "AngleVectors return/out right mismatch");
assert.deepEqual(upOut, angleVectors.up, "AngleVectors return/out up mismatch");

const entityState = createEntityState();
assert.equal(entityState.number, 0, "createEntityState default number mismatch");
assert.equal(entityState.event, 0, "createEntityState default event mismatch");

const playerState = createPlayerState();
assert.equal(playerState.stats.length, 32, "createPlayerState stats width mismatch");
assert.deepEqual(playerState.viewangles, [0, 0, 0], "createPlayerState default viewangles mismatch");

console.log("quake2-q-shared-header: ok");
assert.deepEqual({
  CPLANE_NORMAL_X,
  CPLANE_NORMAL_Y,
  CPLANE_NORMAL_Z,
  CPLANE_DIST,
  CPLANE_TYPE,
  CPLANE_SIGNBITS,
  CPLANE_PAD0,
  CPLANE_PAD1
}, {
  CPLANE_NORMAL_X: 0,
  CPLANE_NORMAL_Y: 4,
  CPLANE_NORMAL_Z: 8,
  CPLANE_DIST: 12,
  CPLANE_TYPE: 16,
  CPLANE_SIGNBITS: 17,
  CPLANE_PAD0: 18,
  CPLANE_PAD1: 19
}, "cplane offset constants mismatch");
