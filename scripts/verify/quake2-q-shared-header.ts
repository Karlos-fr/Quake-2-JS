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
  VectorClear,
  VectorCompare,
  VectorCopy,
  VectorInverse,
  VectorLength,
  VectorMA,
  VectorNegate,
  VectorNormalize,
  VectorNormalize2,
  VectorScale,
  VectorSet,
  vec3_origin
} from "../../packages/math/src/q_shared.js";
import * as RogueMuzzle from "../../packages/game/src/m_flash.js";
import { monster_flash_offset } from "../../packages/game/src/m_flash.js";
import {
  MZ2_TANK_BLASTER_1,
  MZ2_TANK_BLASTER_2,
  MZ2_TANK_BLASTER_3,
  MZ2_TANK_MACHINEGUN_1,
  MZ2_TANK_MACHINEGUN_2,
  MZ2_TANK_MACHINEGUN_3,
  MZ2_TANK_MACHINEGUN_4,
  MZ2_TANK_MACHINEGUN_5,
  MZ2_TANK_MACHINEGUN_6,
  MZ2_TANK_MACHINEGUN_7,
  MZ2_TANK_MACHINEGUN_8,
  MZ2_TANK_MACHINEGUN_9,
  MZ2_TANK_MACHINEGUN_10,
  MZ2_TANK_MACHINEGUN_11,
  MZ2_TANK_MACHINEGUN_12,
  MZ2_TANK_MACHINEGUN_13,
  MZ2_TANK_MACHINEGUN_14,
  MZ2_TANK_MACHINEGUN_15,
  MZ2_TANK_MACHINEGUN_16,
  MZ2_TANK_MACHINEGUN_17,
  MZ2_TANK_MACHINEGUN_18,
  MZ2_TANK_MACHINEGUN_19,
  MZ2_TANK_ROCKET_1,
  MZ2_TANK_ROCKET_2,
  MZ2_TANK_ROCKET_3
} from "../../packages/game/src/m_tank.js";
import * as ActorMuzzle from "../../packages/game/src/m_actor.js";
import * as Boss31Muzzle from "../../packages/game/src/m_boss31.js";
import * as Boss32Muzzle from "../../packages/game/src/m_boss32.js";
import * as Boss2Muzzle from "../../packages/game/src/m_boss2.js";
import * as ChickMuzzle from "../../packages/game/src/m_chick.js";
import * as FloatMuzzle from "../../packages/game/src/m_float.js";
import * as FlyerMuzzle from "../../packages/game/src/m_flyer.js";
import * as GladiatorMuzzle from "../../packages/game/src/m_gladiator.js";
import * as GunnerMuzzle from "../../packages/game/src/m_gunner.js";
import * as HoverMuzzle from "../../packages/game/src/m_hover.js";
import * as InfantryMuzzle from "../../packages/game/src/m_infantry.js";
import * as MedicMuzzle from "../../packages/game/src/m_medic.js";
import * as SoldierMuzzle from "../../packages/game/src/m_soldier.js";
import * as SupertankMuzzle from "../../packages/game/src/m_supertank.js";
import * as FormatQfiles from "../../packages/formats/src/qfiles.js";
import {
  BigFloat,
  BigLong,
  BigShort,
  Com_BeginRedirect,
  Com_EndRedirect,
  Com_Printf,
  Com_sprintf,
  COM_DefaultExtension,
  COM_FileBase,
  COM_FileExtension,
  COM_FilePath,
  COM_Parse,
  COM_SkipPath,
  COM_StripExtension,
  createCommonRuntime,
  Info_RemoveKey,
  Info_SetValueForKey,
  Info_Validate,
  Info_ValueForKey,
  FloatNoSwap,
  FloatSwap,
  LittleFloat,
  LittleLong,
  LittleShort,
  LongNoSwap,
  LongSwap,
  Q_strcasecmp,
  Q_stricmp,
  Q_strncasecmp,
  ShortNoSwap,
  ShortSwap,
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
  AREA_SOLID,
  AREA_TRIGGERS,
  ATTN_IDLE,
  ATTN_NONE,
  ATTN_NORM,
  ATTN_STATIC,
  CHAN_AUTO,
  CHAN_BODY,
  CHAN_ITEM,
  CHAN_NO_PHS_ADD,
  CHAN_RELIABLE,
  CHAN_VOICE,
  CHAN_WEAPON,
  CPLANE_DIST,
  CPLANE_NORMAL_X,
  CPLANE_NORMAL_Y,
  CPLANE_NORMAL_Z,
  CPLANE_PAD0,
  CPLANE_PAD1,
  CPLANE_SIGNBITS,
  CPLANE_TYPE,
  CS_AIRACCEL,
  CS_CDTRACK,
  CS_GENERAL,
  CS_IMAGES,
  CS_ITEMS,
  CS_LIGHTS,
  CS_MAPCHECKSUM,
  CS_MAXCLIENTS,
  CS_MODELS,
  CS_NAME,
  CS_PLAYERSKINS,
  CS_SKY,
  CS_SKYAXIS,
  CS_SKYROTATE,
  CS_SOUNDS,
  CS_STATUSBAR,
  CONTENTS_AREAPORTAL,
  CONTENTS_AUX,
  CONTENTS_CURRENT_0,
  CONTENTS_CURRENT_90,
  CONTENTS_CURRENT_180,
  CONTENTS_CURRENT_270,
  CONTENTS_CURRENT_DOWN,
  CONTENTS_CURRENT_UP,
  CONTENTS_DEADMONSTER,
  CONTENTS_DETAIL,
  CONTENTS_LADDER,
  CONTENTS_LAVA,
  CONTENTS_MIST,
  CONTENTS_MONSTER,
  CONTENTS_MONSTERCLIP,
  CONTENTS_ORIGIN,
  CONTENTS_PLAYERCLIP,
  CONTENTS_SLIME,
  CONTENTS_SOLID,
  CONTENTS_TRANSLUCENT,
  CONTENTS_WATER,
  CONTENTS_WINDOW,
  ERR_DISCONNECT,
  ERR_DROP,
  ERR_FATAL,
  DF_FIXED_FOV,
  DF_NO_HEALTH,
  DF_QUADFIRE_DROP,
  EF_ANIM01,
  EF_ANIM23,
  EF_ANIM_ALL,
  EF_ANIM_ALLFAST,
  EF_BFG,
  EF_BLASTER,
  EF_BLUEHYPERBLASTER,
  EF_COLOR_SHELL,
  EF_DOUBLE,
  EF_FLAG1,
  EF_FLAG2,
  EF_FLIES,
  EF_GIB,
  EF_GREENGIB,
  EF_GRENADE,
  EF_HALF_DAMAGE,
  EF_HYPERBLASTER,
  EF_IONRIPPER,
  EF_PENT,
  EF_PLASMA,
  EF_POWERSCREEN,
  EF_QUAD,
  EF_ROCKET,
  EF_ROTATE,
  EF_SPHERETRANS,
  EF_SPINNINGLIGHTS,
  EF_TAGTRAIL,
  EF_TELEPORTER,
  EF_TRACKER,
  EF_TRACKERTRAIL,
  EF_TRAP,
  IS_NAN,
  LAST_VISIBLE_CONTENTS,
  MASK_ALL,
  MASK_CURRENT,
  MASK_DEADSOLID,
  MASK_MONSTERSOLID,
  MASK_OPAQUE,
  MASK_PLAYERSOLID,
  MASK_SHOT,
  MASK_SOLID,
  MASK_WATER,
  MAX_CLIENTS,
  MAX_CONFIGSTRINGS,
  MAX_GENERAL,
  MAX_IMAGES,
  MAX_INFO_KEY,
  MAX_INFO_STRING,
  MAX_INFO_VALUE,
  MAX_ITEMS,
  MAX_LIGHTSTYLES,
  MAX_MODELS,
  MAX_SOUNDS,
  MZ_BFG,
  MZ_BLASTER,
  MZ_BLASTER2,
  MZ_BLUEHYPERBLASTER,
  MZ_CHAINGUN1,
  MZ_CHAINGUN2,
  MZ_CHAINGUN3,
  MZ_ETF_RIFLE,
  MZ_GRENADE,
  MZ_HEATBEAM,
  MZ_HYPERBLASTER,
  MZ_IONRIPPER,
  MZ_ITEMRESPAWN,
  MZ_LOGIN,
  MZ_LOGOUT,
  MZ_MACHINEGUN,
  MZ_NUKE1,
  MZ_NUKE2,
  MZ_NUKE4,
  MZ_NUKE8,
  MZ_PHALANX,
  MZ_RAILGUN,
  MZ_RESPAWN,
  MZ_ROCKET,
  MZ_SHOTGUN,
  MZ_SHOTGUN2,
  MZ_SILENCED,
  MZ_SSHOTGUN,
  MZ_TRACKER,
  MZ_UNUSED,
  nanmask,
  Q_ftol,
  RDF_IRGOGGLES,
  RDF_NOWORLDMODEL,
  RDF_UNDERWATER,
  RDF_UVGOGGLES,
  RF_BEAM,
  RF_CUSTOMSKIN,
  RF_DEPTHHACK,
  RF_FRAMELERP,
  RF_FULLBRIGHT,
  RF_GLOW,
  RF_IR_VISIBLE,
  RF_MINLIGHT,
  RF_SHELL_BLUE,
  RF_SHELL_DOUBLE,
  RF_SHELL_GREEN,
  RF_SHELL_HALF_DAM,
  RF_SHELL_RED,
  RF_TRANSLUCENT,
  RF_USE_DISGUISE,
  RF_VIEWERMODEL,
  RF_WEAPONMODEL,
  ROGUE_VERSION_ID,
  ROGUE_VERSION_STRING,
  SFF_ARCH,
  SFF_HIDDEN,
  SFF_RDONLY,
  SFF_SUBDIR,
  SFF_SYSTEM,
  SHORT2ANGLE,
  SPLASH_BLOOD,
  SPLASH_BLUE_WATER,
  SPLASH_BROWN_WATER,
  SPLASH_LAVA,
  SPLASH_SLIME,
  SPLASH_SPARKS,
  SPLASH_UNKNOWN,
  SURF_FLOWING,
  SURF_LIGHT,
  SURF_NODRAW,
  SURF_SKY,
  SURF_SLICK,
  SURF_TRANS33,
  SURF_TRANS66,
  SURF_WARP,
  VIDREF_GL,
  VIDREF_OTHER,
  VIDREF_SOFT,
  AngleVectors,
  BUTTON_ANY,
  BUTTON_ATTACK,
  BUTTON_USE,
  type cmodel_t,
  type cplane_t,
  type csurface_t,
  type mapsurface_t,
  MAXTOUCH,
  PMF_DUCKED,
  PMF_JUMP_HELD,
  PMF_NO_PREDICTION,
  PMF_ON_GROUND,
  PMF_TIME_LAND,
  PMF_TIME_TELEPORT,
  PMF_TIME_WATERJUMP,
  pmtype_t,
  type pmove_state_t,
  type pmove_t,
  type trace_t,
  temp_event_t,
  type usercmd_t,
  createEntityState,
  createPlayerState
} from "../../packages/qcommon/src/q_shared.js";
import { CVAR_ARCHIVE, CVAR_LATCH, CVAR_NOSET, CVAR_SERVERINFO, CVAR_USERINFO } from "../../packages/qcommon/src/cvar.js";

assert.equal(LAST_VISIBLE_CONTENTS, 64, "LAST_VISIBLE_CONTENTS mismatch");
assert.equal(DF_NO_HEALTH, 0x00000001, "DF_NO_HEALTH mismatch");
assert.equal(DF_FIXED_FOV, 0x00008000, "DF_FIXED_FOV mismatch");
assert.equal(DF_QUADFIRE_DROP, 0x00010000, "DF_QUADFIRE_DROP mismatch");
assert.equal(EF_ROTATE, 0x00000001, "EF_ROTATE mismatch");
assert.equal(EF_GIB, 0x00000002, "EF_GIB mismatch");
assert.equal(EF_BLASTER, 0x00000008, "EF_BLASTER mismatch");
assert.equal(EF_ROCKET, 0x00000010, "EF_ROCKET mismatch");
assert.equal(EF_GRENADE, 0x00000020, "EF_GRENADE mismatch");
assert.equal(EF_HYPERBLASTER, 0x00000040, "EF_HYPERBLASTER mismatch");
assert.equal(EF_BFG, 0x00000080, "EF_BFG mismatch");
assert.equal(EF_COLOR_SHELL, 0x00000100, "EF_COLOR_SHELL mismatch");
assert.equal(EF_POWERSCREEN, 0x00000200, "EF_POWERSCREEN mismatch");
assert.equal(EF_ANIM01, 0x00000400, "EF_ANIM01 mismatch");
assert.equal(EF_ANIM23, 0x00000800, "EF_ANIM23 mismatch");
assert.equal(EF_ANIM_ALL, 0x00001000, "EF_ANIM_ALL mismatch");
assert.equal(EF_ANIM_ALLFAST, 0x00002000, "EF_ANIM_ALLFAST mismatch");
assert.equal(EF_FLIES, 0x00004000, "EF_FLIES mismatch");
assert.equal(EF_QUAD, 0x00008000, "EF_QUAD mismatch");
assert.equal(EF_PENT, 0x00010000, "EF_PENT mismatch");
assert.equal(EF_TELEPORTER, 0x00020000, "EF_TELEPORTER mismatch");
assert.equal(EF_FLAG1, 0x00040000, "EF_FLAG1 mismatch");
assert.equal(EF_FLAG2, 0x00080000, "EF_FLAG2 mismatch");
assert.equal(EF_IONRIPPER, 0x00100000, "EF_IONRIPPER mismatch");
assert.equal(EF_GREENGIB, 0x00200000, "EF_GREENGIB mismatch");
assert.equal(EF_BLUEHYPERBLASTER, 0x00400000, "EF_BLUEHYPERBLASTER mismatch");
assert.equal(EF_SPINNINGLIGHTS, 0x00800000, "EF_SPINNINGLIGHTS mismatch");
assert.equal(EF_PLASMA, 0x01000000, "EF_PLASMA mismatch");
assert.equal(EF_TRAP, 0x02000000, "EF_TRAP mismatch");
assert.equal(EF_TRACKER, 0x04000000, "EF_TRACKER mismatch");
assert.equal(EF_DOUBLE, 0x08000000, "EF_DOUBLE mismatch");
assert.equal(EF_SPHERETRANS, 0x10000000, "EF_SPHERETRANS mismatch");
assert.equal(EF_TAGTRAIL, 0x20000000, "EF_TAGTRAIL mismatch");
assert.equal(EF_HALF_DAMAGE, 0x40000000, "EF_HALF_DAMAGE mismatch");
assert.equal(EF_TRACKERTRAIL, 0x80000000, "EF_TRACKERTRAIL mismatch");
assert.equal(RF_MINLIGHT, 1, "RF_MINLIGHT mismatch");
assert.equal(RF_VIEWERMODEL, 2, "RF_VIEWERMODEL mismatch");
assert.equal(RF_WEAPONMODEL, 4, "RF_WEAPONMODEL mismatch");
assert.equal(RF_FULLBRIGHT, 8, "RF_FULLBRIGHT mismatch");
assert.equal(RF_DEPTHHACK, 16, "RF_DEPTHHACK mismatch");
assert.equal(RF_TRANSLUCENT, 32, "RF_TRANSLUCENT mismatch");
assert.equal(RF_FRAMELERP, 64, "RF_FRAMELERP mismatch");
assert.equal(RF_BEAM, 128, "RF_BEAM mismatch");
assert.equal(RF_CUSTOMSKIN, 256, "RF_CUSTOMSKIN mismatch");
assert.equal(RF_GLOW, 512, "RF_GLOW mismatch");
assert.equal(RF_SHELL_RED, 1024, "RF_SHELL_RED mismatch");
assert.equal(RF_SHELL_GREEN, 2048, "RF_SHELL_GREEN mismatch");
assert.equal(RF_SHELL_BLUE, 4096, "RF_SHELL_BLUE mismatch");
assert.equal(RF_IR_VISIBLE, 0x00008000, "RF_IR_VISIBLE mismatch");
assert.equal(RF_SHELL_DOUBLE, 0x00010000, "RF_SHELL_DOUBLE mismatch");
assert.equal(RF_SHELL_HALF_DAM, 0x00020000, "RF_SHELL_HALF_DAM mismatch");
assert.equal(RF_USE_DISGUISE, 0x00040000, "RF_USE_DISGUISE mismatch");
assert.equal(RDF_UNDERWATER, 1, "RDF_UNDERWATER mismatch");
assert.equal(RDF_NOWORLDMODEL, 2, "RDF_NOWORLDMODEL mismatch");
assert.equal(RDF_IRGOGGLES, 4, "RDF_IRGOGGLES mismatch");
assert.equal(RDF_UVGOGGLES, 8, "RDF_UVGOGGLES mismatch");
assert.deepEqual(
  Object.entries(temp_event_t)
    .filter(([_name, value]) => typeof value === "number")
    .map(([name, value]) => [name, value]),
  [
    ["TE_GUNSHOT", 0],
    ["TE_BLOOD", 1],
    ["TE_BLASTER", 2],
    ["TE_RAILTRAIL", 3],
    ["TE_SHOTGUN", 4],
    ["TE_EXPLOSION1", 5],
    ["TE_EXPLOSION2", 6],
    ["TE_ROCKET_EXPLOSION", 7],
    ["TE_GRENADE_EXPLOSION", 8],
    ["TE_SPARKS", 9],
    ["TE_SPLASH", 10],
    ["TE_BUBBLETRAIL", 11],
    ["TE_SCREEN_SPARKS", 12],
    ["TE_SHIELD_SPARKS", 13],
    ["TE_BULLET_SPARKS", 14],
    ["TE_LASER_SPARKS", 15],
    ["TE_PARASITE_ATTACK", 16],
    ["TE_ROCKET_EXPLOSION_WATER", 17],
    ["TE_GRENADE_EXPLOSION_WATER", 18],
    ["TE_MEDIC_CABLE_ATTACK", 19],
    ["TE_BFG_EXPLOSION", 20],
    ["TE_BFG_BIGEXPLOSION", 21],
    ["TE_BOSSTPORT", 22],
    ["TE_BFG_LASER", 23],
    ["TE_GRAPPLE_CABLE", 24],
    ["TE_WELDING_SPARKS", 25],
    ["TE_GREENBLOOD", 26],
    ["TE_BLUEHYPERBLASTER", 27],
    ["TE_PLASMA_EXPLOSION", 28],
    ["TE_TUNNEL_SPARKS", 29],
    ["TE_BLASTER2", 30],
    ["TE_RAILTRAIL2", 31],
    ["TE_FLAME", 32],
    ["TE_LIGHTNING", 33],
    ["TE_DEBUGTRAIL", 34],
    ["TE_PLAIN_EXPLOSION", 35],
    ["TE_FLASHLIGHT", 36],
    ["TE_FORCEWALL", 37],
    ["TE_HEATBEAM", 38],
    ["TE_MONSTER_HEATBEAM", 39],
    ["TE_STEAM", 40],
    ["TE_BUBBLETRAIL2", 41],
    ["TE_MOREBLOOD", 42],
    ["TE_HEATBEAM_SPARKS", 43],
    ["TE_HEATBEAM_STEAM", 44],
    ["TE_CHAINFIST_SMOKE", 45],
    ["TE_ELECTRIC_SPARKS", 46],
    ["TE_TRACKER_EXPLOSION", 47],
    ["TE_TELEPORT_EFFECT", 48],
    ["TE_DBALL_GOAL", 49],
    ["TE_WIDOWBEAMOUT", 50],
    ["TE_NUKEBLAST", 51],
    ["TE_WIDOWSPLASH", 52],
    ["TE_EXPLOSION1_BIG", 53],
    ["TE_EXPLOSION1_NP", 54],
    ["TE_FLECHETTE", 55]
  ],
  "temp_event_t numeric sequence mismatch"
);
assert.equal(SPLASH_UNKNOWN, 0, "SPLASH_UNKNOWN mismatch");
assert.equal(SPLASH_SPARKS, 1, "SPLASH_SPARKS mismatch");
assert.equal(SPLASH_BLUE_WATER, 2, "SPLASH_BLUE_WATER mismatch");
assert.equal(SPLASH_BROWN_WATER, 3, "SPLASH_BROWN_WATER mismatch");
assert.equal(SPLASH_SLIME, 4, "SPLASH_SLIME mismatch");
assert.equal(SPLASH_LAVA, 5, "SPLASH_LAVA mismatch");
assert.equal(SPLASH_BLOOD, 6, "SPLASH_BLOOD mismatch");
assert.equal(CHAN_AUTO, 0, "CHAN_AUTO mismatch");
assert.equal(CHAN_WEAPON, 1, "CHAN_WEAPON mismatch");
assert.equal(CHAN_VOICE, 2, "CHAN_VOICE mismatch");
assert.equal(CHAN_ITEM, 3, "CHAN_ITEM mismatch");
assert.equal(CHAN_BODY, 4, "CHAN_BODY mismatch");
assert.equal(CHAN_NO_PHS_ADD, 8, "CHAN_NO_PHS_ADD mismatch");
assert.equal(CHAN_RELIABLE, 16, "CHAN_RELIABLE mismatch");
assert.equal(ATTN_NONE, 0, "ATTN_NONE mismatch");
assert.equal(ATTN_NORM, 1, "ATTN_NORM mismatch");
assert.equal(ATTN_IDLE, 2, "ATTN_IDLE mismatch");
assert.equal(ATTN_STATIC, 3, "ATTN_STATIC mismatch");
assert.equal(MZ_BLASTER, 0, "MZ_BLASTER mismatch");
assert.equal(MZ_MACHINEGUN, 1, "MZ_MACHINEGUN mismatch");
assert.equal(MZ_SHOTGUN, 2, "MZ_SHOTGUN mismatch");
assert.equal(MZ_CHAINGUN1, 3, "MZ_CHAINGUN1 mismatch");
assert.equal(MZ_CHAINGUN2, 4, "MZ_CHAINGUN2 mismatch");
assert.equal(MZ_CHAINGUN3, 5, "MZ_CHAINGUN3 mismatch");
assert.equal(MZ_RAILGUN, 6, "MZ_RAILGUN mismatch");
assert.equal(MZ_ROCKET, 7, "MZ_ROCKET mismatch");
assert.equal(MZ_GRENADE, 8, "MZ_GRENADE mismatch");
assert.equal(MZ_LOGIN, 9, "MZ_LOGIN mismatch");
assert.equal(MZ_LOGOUT, 10, "MZ_LOGOUT mismatch");
assert.equal(MZ_RESPAWN, 11, "MZ_RESPAWN mismatch");
assert.equal(MZ_BFG, 12, "MZ_BFG mismatch");
assert.equal(MZ_SSHOTGUN, 13, "MZ_SSHOTGUN mismatch");
assert.equal(MZ_HYPERBLASTER, 14, "MZ_HYPERBLASTER mismatch");
assert.equal(MZ_ITEMRESPAWN, 15, "MZ_ITEMRESPAWN mismatch");
assert.equal(MZ_IONRIPPER, 16, "MZ_IONRIPPER mismatch");
assert.equal(MZ_BLUEHYPERBLASTER, 17, "MZ_BLUEHYPERBLASTER mismatch");
assert.equal(MZ_PHALANX, 18, "MZ_PHALANX mismatch");
assert.equal(MZ_ETF_RIFLE, 30, "MZ_ETF_RIFLE mismatch");
assert.equal(MZ_UNUSED, 31, "MZ_UNUSED mismatch");
assert.equal(MZ_SHOTGUN2, 32, "MZ_SHOTGUN2 mismatch");
assert.equal(MZ_HEATBEAM, 33, "MZ_HEATBEAM mismatch");
assert.equal(MZ_BLASTER2, 34, "MZ_BLASTER2 mismatch");
assert.equal(MZ_TRACKER, 35, "MZ_TRACKER mismatch");
assert.equal(MZ_NUKE1, 36, "MZ_NUKE1 mismatch");
assert.equal(MZ_NUKE2, 37, "MZ_NUKE2 mismatch");
assert.equal(MZ_NUKE4, 38, "MZ_NUKE4 mismatch");
assert.equal(MZ_NUKE8, 39, "MZ_NUKE8 mismatch");
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

assert.equal(CS_NAME, 0, "CS_NAME mismatch");
assert.equal(CS_CDTRACK, 1, "CS_CDTRACK mismatch");
assert.equal(CS_SKY, 2, "CS_SKY mismatch");
assert.equal(CS_SKYAXIS, 3, "CS_SKYAXIS mismatch");
assert.equal(CS_SKYROTATE, 4, "CS_SKYROTATE mismatch");
assert.equal(CS_STATUSBAR, 5, "CS_STATUSBAR mismatch");
assert.equal(CS_AIRACCEL, 29, "CS_AIRACCEL mismatch");
assert.equal(CS_MAXCLIENTS, 30, "CS_MAXCLIENTS mismatch");
assert.equal(CS_MAPCHECKSUM, 31, "CS_MAPCHECKSUM mismatch");
assert.equal(CS_MODELS, 32, "CS_MODELS mismatch");
assert.equal(CS_SOUNDS, CS_MODELS + MAX_MODELS, "CS_SOUNDS chain mismatch");
assert.equal(CS_IMAGES, CS_SOUNDS + MAX_SOUNDS, "CS_IMAGES chain mismatch");
assert.equal(CS_LIGHTS, CS_IMAGES + MAX_IMAGES, "CS_LIGHTS chain mismatch");
assert.equal(CS_ITEMS, CS_LIGHTS + MAX_LIGHTSTYLES, "CS_ITEMS chain mismatch");
assert.equal(CS_PLAYERSKINS, CS_ITEMS + MAX_ITEMS, "CS_PLAYERSKINS chain mismatch");
assert.equal(CS_GENERAL, CS_PLAYERSKINS + MAX_CLIENTS, "CS_GENERAL chain mismatch");
assert.equal(MAX_CONFIGSTRINGS, CS_GENERAL + MAX_GENERAL, "MAX_CONFIGSTRINGS mismatch");
assert.equal(MAX_GENERAL, MAX_CLIENTS * 2, "MAX_GENERAL mismatch");
assert.equal(MAX_INFO_KEY, 64, "MAX_INFO_KEY mismatch");
assert.equal(MAX_INFO_VALUE, 64, "MAX_INFO_VALUE mismatch");
assert.equal(MAX_INFO_STRING, 512, "MAX_INFO_STRING mismatch");
assert.equal(SFF_ARCH, 0x01, "SFF_ARCH mismatch");
assert.equal(SFF_HIDDEN, 0x02, "SFF_HIDDEN mismatch");
assert.equal(SFF_RDONLY, 0x04, "SFF_RDONLY mismatch");
assert.equal(SFF_SUBDIR, 0x08, "SFF_SUBDIR mismatch");
assert.equal(SFF_SYSTEM, 0x10, "SFF_SYSTEM mismatch");
assert.equal(CONTENTS_SOLID, 1, "CONTENTS_SOLID mismatch");
assert.equal(CONTENTS_WINDOW, 2, "CONTENTS_WINDOW mismatch");
assert.equal(CONTENTS_AUX, 4, "CONTENTS_AUX mismatch");
assert.equal(CONTENTS_LAVA, 8, "CONTENTS_LAVA mismatch");
assert.equal(CONTENTS_SLIME, 16, "CONTENTS_SLIME mismatch");
assert.equal(CONTENTS_WATER, 32, "CONTENTS_WATER mismatch");
assert.equal(CONTENTS_MIST, 64, "CONTENTS_MIST mismatch");
assert.equal(LAST_VISIBLE_CONTENTS, CONTENTS_MIST, "LAST_VISIBLE_CONTENTS chain mismatch");
assert.equal(CONTENTS_AREAPORTAL, 0x8000, "CONTENTS_AREAPORTAL mismatch");
assert.equal(CONTENTS_PLAYERCLIP, 0x10000, "CONTENTS_PLAYERCLIP mismatch");
assert.equal(CONTENTS_MONSTERCLIP, 0x20000, "CONTENTS_MONSTERCLIP mismatch");
assert.equal(CONTENTS_CURRENT_0, 0x40000, "CONTENTS_CURRENT_0 mismatch");
assert.equal(CONTENTS_CURRENT_90, 0x80000, "CONTENTS_CURRENT_90 mismatch");
assert.equal(CONTENTS_CURRENT_180, 0x100000, "CONTENTS_CURRENT_180 mismatch");
assert.equal(CONTENTS_CURRENT_270, 0x200000, "CONTENTS_CURRENT_270 mismatch");
assert.equal(CONTENTS_CURRENT_UP, 0x400000, "CONTENTS_CURRENT_UP mismatch");
assert.equal(CONTENTS_CURRENT_DOWN, 0x800000, "CONTENTS_CURRENT_DOWN mismatch");
assert.equal(CONTENTS_ORIGIN, 0x1000000, "CONTENTS_ORIGIN mismatch");
assert.equal(CONTENTS_MONSTER, 0x2000000, "CONTENTS_MONSTER mismatch");
assert.equal(CONTENTS_DEADMONSTER, 0x4000000, "CONTENTS_DEADMONSTER mismatch");
assert.equal(CONTENTS_DETAIL, 0x8000000, "CONTENTS_DETAIL mismatch");
assert.equal(CONTENTS_TRANSLUCENT, 0x10000000, "CONTENTS_TRANSLUCENT mismatch");
assert.equal(CONTENTS_LADDER, 0x20000000, "CONTENTS_LADDER mismatch");
assert.equal(SURF_LIGHT, 0x1, "SURF_LIGHT mismatch");
assert.equal(SURF_SLICK, 0x2, "SURF_SLICK mismatch");
assert.equal(SURF_SKY, 0x4, "SURF_SKY mismatch");
assert.equal(SURF_WARP, 0x8, "SURF_WARP mismatch");
assert.equal(SURF_TRANS33, 0x10, "SURF_TRANS33 mismatch");
assert.equal(SURF_TRANS66, 0x20, "SURF_TRANS66 mismatch");
assert.equal(SURF_FLOWING, 0x40, "SURF_FLOWING mismatch");
assert.equal(SURF_NODRAW, 0x80, "SURF_NODRAW mismatch");
assert.equal(MASK_ALL, -1, "MASK_ALL mismatch");
assert.equal(MASK_SOLID, CONTENTS_SOLID | CONTENTS_WINDOW, "MASK_SOLID chain mismatch");
assert.equal(
  MASK_PLAYERSOLID,
  CONTENTS_SOLID | CONTENTS_PLAYERCLIP | CONTENTS_WINDOW | CONTENTS_MONSTER,
  "MASK_PLAYERSOLID chain mismatch"
);
assert.equal(
  MASK_DEADSOLID,
  CONTENTS_SOLID | CONTENTS_PLAYERCLIP | CONTENTS_WINDOW,
  "MASK_DEADSOLID chain mismatch"
);
assert.equal(
  MASK_MONSTERSOLID,
  CONTENTS_SOLID | CONTENTS_MONSTERCLIP | CONTENTS_WINDOW | CONTENTS_MONSTER,
  "MASK_MONSTERSOLID chain mismatch"
);
assert.equal(MASK_WATER, CONTENTS_WATER | CONTENTS_LAVA | CONTENTS_SLIME, "MASK_WATER chain mismatch");
assert.equal(MASK_OPAQUE, CONTENTS_SOLID | CONTENTS_SLIME | CONTENTS_LAVA, "MASK_OPAQUE chain mismatch");
assert.equal(
  MASK_SHOT,
  CONTENTS_SOLID | CONTENTS_MONSTER | CONTENTS_WINDOW | CONTENTS_DEADMONSTER,
  "MASK_SHOT chain mismatch"
);
assert.equal(
  MASK_CURRENT,
  CONTENTS_CURRENT_0 |
    CONTENTS_CURRENT_90 |
    CONTENTS_CURRENT_180 |
    CONTENTS_CURRENT_270 |
    CONTENTS_CURRENT_UP |
    CONTENTS_CURRENT_DOWN,
  "MASK_CURRENT chain mismatch"
);
for (const name of [
  "CONTENTS_SOLID",
  "CONTENTS_WINDOW",
  "CONTENTS_AUX",
  "CONTENTS_LAVA",
  "CONTENTS_SLIME",
  "CONTENTS_WATER",
  "CONTENTS_MIST",
  "LAST_VISIBLE_CONTENTS",
  "CONTENTS_AREAPORTAL",
  "CONTENTS_PLAYERCLIP",
  "CONTENTS_MONSTERCLIP",
  "CONTENTS_CURRENT_0",
  "CONTENTS_CURRENT_90",
  "CONTENTS_CURRENT_180",
  "CONTENTS_CURRENT_270",
  "CONTENTS_CURRENT_UP",
  "CONTENTS_CURRENT_DOWN",
  "CONTENTS_ORIGIN",
  "CONTENTS_MONSTER",
  "CONTENTS_DEADMONSTER",
  "CONTENTS_DETAIL",
  "CONTENTS_TRANSLUCENT",
  "CONTENTS_LADDER",
  "SURF_LIGHT",
  "SURF_SLICK",
  "SURF_SKY",
  "SURF_WARP",
  "SURF_TRANS33",
  "SURF_TRANS66",
  "SURF_FLOWING",
  "SURF_NODRAW"
] as const) {
  assert.equal(FormatQfiles[name], {
    CONTENTS_SOLID,
    CONTENTS_WINDOW,
    CONTENTS_AUX,
    CONTENTS_LAVA,
    CONTENTS_SLIME,
    CONTENTS_WATER,
    CONTENTS_MIST,
    LAST_VISIBLE_CONTENTS,
    CONTENTS_AREAPORTAL,
    CONTENTS_PLAYERCLIP,
    CONTENTS_MONSTERCLIP,
    CONTENTS_CURRENT_0,
    CONTENTS_CURRENT_90,
    CONTENTS_CURRENT_180,
    CONTENTS_CURRENT_270,
    CONTENTS_CURRENT_UP,
    CONTENTS_CURRENT_DOWN,
    CONTENTS_ORIGIN,
    CONTENTS_MONSTER,
    CONTENTS_DEADMONSTER,
    CONTENTS_DETAIL,
    CONTENTS_TRANSLUCENT,
    CONTENTS_LADDER,
    SURF_LIGHT,
    SURF_SLICK,
    SURF_SKY,
    SURF_WARP,
    SURF_TRANS33,
    SURF_TRANS66,
    SURF_FLOWING,
    SURF_NODRAW
  }[name], `${name} qfiles duplicate mismatch`);
}

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
assert.deepEqual([
  MZ2_TANK_BLASTER_1,
  MZ2_TANK_BLASTER_2,
  MZ2_TANK_BLASTER_3,
  MZ2_TANK_MACHINEGUN_1,
  MZ2_TANK_MACHINEGUN_2,
  MZ2_TANK_MACHINEGUN_3,
  MZ2_TANK_MACHINEGUN_4,
  MZ2_TANK_MACHINEGUN_5,
  MZ2_TANK_MACHINEGUN_6,
  MZ2_TANK_MACHINEGUN_7,
  MZ2_TANK_MACHINEGUN_8,
  MZ2_TANK_MACHINEGUN_9,
  MZ2_TANK_MACHINEGUN_10,
  MZ2_TANK_MACHINEGUN_11,
  MZ2_TANK_MACHINEGUN_12,
  MZ2_TANK_MACHINEGUN_13,
  MZ2_TANK_MACHINEGUN_14,
  MZ2_TANK_MACHINEGUN_15,
  MZ2_TANK_MACHINEGUN_16,
  MZ2_TANK_MACHINEGUN_17,
  MZ2_TANK_MACHINEGUN_18,
  MZ2_TANK_MACHINEGUN_19,
  MZ2_TANK_ROCKET_1,
  MZ2_TANK_ROCKET_2,
  MZ2_TANK_ROCKET_3
], Array.from({ length: 25 }, (_, index) => index + 1), "MZ2_TANK_* q_shared.h numeric range mismatch");
assert.deepEqual(monster_flash_offset[MZ2_TANK_BLASTER_1], [20.7, -18.5, 28.7], "MZ2_TANK_BLASTER_1 offset mismatch");
assert.deepEqual(monster_flash_offset[MZ2_TANK_MACHINEGUN_19], [21.6, -7.0, 26.4], "MZ2_TANK_MACHINEGUN_19 offset mismatch");
assert.deepEqual(monster_flash_offset[MZ2_TANK_ROCKET_3], [8.3, 17.8, 49.5], "MZ2_TANK_ROCKET_3 offset mismatch");
assert.deepEqual([
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_1,
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_2,
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_3,
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_4,
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_5,
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_6,
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_7,
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_8,
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_9,
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_10,
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_11,
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_12,
  InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_13
], Array.from({ length: 13 }, (_, index) => index + 26), "MZ2_INFANTRY_MACHINEGUN_* q_shared.h numeric range mismatch");
assert.deepEqual([
  SoldierMuzzle.MZ2_SOLDIER_BLASTER_1,
  SoldierMuzzle.MZ2_SOLDIER_BLASTER_2,
  SoldierMuzzle.MZ2_SOLDIER_SHOTGUN_1,
  SoldierMuzzle.MZ2_SOLDIER_SHOTGUN_2,
  SoldierMuzzle.MZ2_SOLDIER_MACHINEGUN_1,
  SoldierMuzzle.MZ2_SOLDIER_MACHINEGUN_2
], [39, 40, 41, 42, 43, 44], "MZ2_SOLDIER first q_shared.h range mismatch");
assert.deepEqual([
  GunnerMuzzle.MZ2_GUNNER_MACHINEGUN_1,
  GunnerMuzzle.MZ2_GUNNER_MACHINEGUN_2,
  GunnerMuzzle.MZ2_GUNNER_MACHINEGUN_3,
  GunnerMuzzle.MZ2_GUNNER_MACHINEGUN_4,
  GunnerMuzzle.MZ2_GUNNER_MACHINEGUN_5,
  GunnerMuzzle.MZ2_GUNNER_MACHINEGUN_6,
  GunnerMuzzle.MZ2_GUNNER_MACHINEGUN_7,
  GunnerMuzzle.MZ2_GUNNER_MACHINEGUN_8,
  GunnerMuzzle.MZ2_GUNNER_GRENADE_1,
  GunnerMuzzle.MZ2_GUNNER_GRENADE_2,
  GunnerMuzzle.MZ2_GUNNER_GRENADE_3,
  GunnerMuzzle.MZ2_GUNNER_GRENADE_4
], Array.from({ length: 12 }, (_, index) => index + 45), "MZ2_GUNNER_* q_shared.h numeric range mismatch");
assert.deepEqual([
  ChickMuzzle.MZ2_CHICK_ROCKET_1,
  FlyerMuzzle.MZ2_FLYER_BLASTER_1,
  FlyerMuzzle.MZ2_FLYER_BLASTER_2,
  MedicMuzzle.MZ2_MEDIC_BLASTER_1,
  GladiatorMuzzle.MZ2_GLADIATOR_RAILGUN_1,
  HoverMuzzle.MZ2_HOVER_BLASTER_1,
  ActorMuzzle.MZ2_ACTOR_MACHINEGUN_1
], [57, 58, 59, 60, 61, 62, 63], "MZ2 single-monster q_shared.h numeric range mismatch");
assert.deepEqual([
  SupertankMuzzle.MZ2_SUPERTANK_MACHINEGUN_1,
  SupertankMuzzle.MZ2_SUPERTANK_MACHINEGUN_2,
  SupertankMuzzle.MZ2_SUPERTANK_MACHINEGUN_3,
  SupertankMuzzle.MZ2_SUPERTANK_MACHINEGUN_4,
  SupertankMuzzle.MZ2_SUPERTANK_MACHINEGUN_5,
  SupertankMuzzle.MZ2_SUPERTANK_MACHINEGUN_6,
  SupertankMuzzle.MZ2_SUPERTANK_ROCKET_1,
  SupertankMuzzle.MZ2_SUPERTANK_ROCKET_2,
  SupertankMuzzle.MZ2_SUPERTANK_ROCKET_3
], Array.from({ length: 9 }, (_, index) => index + 64), "MZ2_SUPERTANK_* q_shared.h numeric range mismatch");
assert.deepEqual([
  Boss2Muzzle.MZ2_BOSS2_MACHINEGUN_L1,
  Boss2Muzzle.MZ2_BOSS2_MACHINEGUN_L2,
  Boss2Muzzle.MZ2_BOSS2_MACHINEGUN_L3,
  Boss2Muzzle.MZ2_BOSS2_MACHINEGUN_L4,
  Boss2Muzzle.MZ2_BOSS2_MACHINEGUN_L5,
  Boss2Muzzle.MZ2_BOSS2_ROCKET_1,
  Boss2Muzzle.MZ2_BOSS2_ROCKET_2,
  Boss2Muzzle.MZ2_BOSS2_ROCKET_3,
  Boss2Muzzle.MZ2_BOSS2_ROCKET_4,
  FloatMuzzle.MZ2_FLOAT_BLASTER_1
], Array.from({ length: 10 }, (_, index) => index + 73), "MZ2_BOSS2/FLOAT q_shared.h numeric range mismatch");
assert.deepEqual([
  SoldierMuzzle.MZ2_SOLDIER_BLASTER_3,
  SoldierMuzzle.MZ2_SOLDIER_SHOTGUN_3,
  SoldierMuzzle.MZ2_SOLDIER_MACHINEGUN_3,
  SoldierMuzzle.MZ2_SOLDIER_BLASTER_4,
  SoldierMuzzle.MZ2_SOLDIER_SHOTGUN_4,
  SoldierMuzzle.MZ2_SOLDIER_MACHINEGUN_4,
  SoldierMuzzle.MZ2_SOLDIER_BLASTER_5,
  SoldierMuzzle.MZ2_SOLDIER_SHOTGUN_5,
  SoldierMuzzle.MZ2_SOLDIER_MACHINEGUN_5,
  SoldierMuzzle.MZ2_SOLDIER_BLASTER_6,
  SoldierMuzzle.MZ2_SOLDIER_SHOTGUN_6,
  SoldierMuzzle.MZ2_SOLDIER_MACHINEGUN_6,
  SoldierMuzzle.MZ2_SOLDIER_BLASTER_7,
  SoldierMuzzle.MZ2_SOLDIER_SHOTGUN_7,
  SoldierMuzzle.MZ2_SOLDIER_MACHINEGUN_7,
  SoldierMuzzle.MZ2_SOLDIER_BLASTER_8,
  SoldierMuzzle.MZ2_SOLDIER_SHOTGUN_8,
  SoldierMuzzle.MZ2_SOLDIER_MACHINEGUN_8
], Array.from({ length: 18 }, (_, index) => index + 83), "MZ2_SOLDIER later q_shared.h range mismatch");
assert.deepEqual(monster_flash_offset[InfantryMuzzle.MZ2_INFANTRY_MACHINEGUN_13], [-12.4, 13.0, 20.2], "MZ2_INFANTRY_MACHINEGUN_13 offset mismatch");
assert.deepEqual(monster_flash_offset[GunnerMuzzle.MZ2_GUNNER_GRENADE_4], [4.6 * 1.15, -16.8 * 1.15, 7.3 * 1.15], "MZ2_GUNNER_GRENADE_4 offset mismatch");
assert.deepEqual(monster_flash_offset[SupertankMuzzle.MZ2_SUPERTANK_ROCKET_3], [16.0, -42.8, 83.3], "MZ2_SUPERTANK_ROCKET_3 offset mismatch");
assert.deepEqual(monster_flash_offset[Boss2Muzzle.MZ2_BOSS2_ROCKET_4], [22.0, -16.0, 10.0], "MZ2_BOSS2_ROCKET_4 offset mismatch");
assert.deepEqual(monster_flash_offset[SoldierMuzzle.MZ2_SOLDIER_MACHINEGUN_8], [34.5 * 1.2, 9.6 * 1.2, 6.1 * 1.2], "MZ2_SOLDIER_MACHINEGUN_8 offset mismatch");
assert.deepEqual([
  Boss32Muzzle.MZ2_MAKRON_BFG,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_1,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_2,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_3,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_4,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_5,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_6,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_7,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_8,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_9,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_10,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_11,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_12,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_13,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_14,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_15,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_16,
  Boss32Muzzle.MZ2_MAKRON_BLASTER_17,
  Boss32Muzzle.MZ2_MAKRON_RAILGUN_1,
  Boss31Muzzle.MZ2_JORG_MACHINEGUN_L1,
  Boss31Muzzle.MZ2_JORG_MACHINEGUN_L2,
  Boss31Muzzle.MZ2_JORG_MACHINEGUN_L3,
  Boss31Muzzle.MZ2_JORG_MACHINEGUN_L4,
  Boss31Muzzle.MZ2_JORG_MACHINEGUN_L5,
  Boss31Muzzle.MZ2_JORG_MACHINEGUN_L6,
  Boss31Muzzle.MZ2_JORG_MACHINEGUN_R1,
  Boss31Muzzle.MZ2_JORG_MACHINEGUN_R2,
  Boss31Muzzle.MZ2_JORG_MACHINEGUN_R3,
  Boss31Muzzle.MZ2_JORG_MACHINEGUN_R4,
  Boss31Muzzle.MZ2_JORG_MACHINEGUN_R5,
  Boss31Muzzle.MZ2_JORG_MACHINEGUN_R6,
  Boss31Muzzle.MZ2_JORG_BFG_1,
  Boss2Muzzle.MZ2_BOSS2_MACHINEGUN_R1,
  Boss2Muzzle.MZ2_BOSS2_MACHINEGUN_R2,
  Boss2Muzzle.MZ2_BOSS2_MACHINEGUN_R3,
  Boss2Muzzle.MZ2_BOSS2_MACHINEGUN_R4,
  Boss2Muzzle.MZ2_BOSS2_MACHINEGUN_R5
], Array.from({ length: 37 }, (_, index) => index + 101), "MZ2_MAKRON/JORG/BOSS2 right q_shared.h range mismatch");
assert.deepEqual(monster_flash_offset[Boss32Muzzle.MZ2_MAKRON_BFG], [17, -19.5, 62.9], "MZ2_MAKRON_BFG offset mismatch");
assert.deepEqual(monster_flash_offset[Boss32Muzzle.MZ2_MAKRON_BLASTER_17], [-1.8, -25.5, 59.5], "MZ2_MAKRON_BLASTER_17 offset mismatch");
assert.deepEqual(monster_flash_offset[Boss32Muzzle.MZ2_MAKRON_RAILGUN_1], [-17.3, 7.8, 72.4], "MZ2_MAKRON_RAILGUN_1 offset mismatch");
assert.deepEqual(monster_flash_offset[Boss31Muzzle.MZ2_JORG_MACHINEGUN_L6], [78.5, -47.1, 96], "MZ2_JORG_MACHINEGUN_L6 offset mismatch");
assert.deepEqual(monster_flash_offset[Boss31Muzzle.MZ2_JORG_MACHINEGUN_R6], [78.5, 46.7, 96], "MZ2_JORG_MACHINEGUN_R6 offset mismatch");
assert.deepEqual(monster_flash_offset[Boss31Muzzle.MZ2_JORG_BFG_1], [6.3, -9, 111.2], "MZ2_JORG_BFG_1 offset mismatch");
assert.deepEqual(monster_flash_offset[Boss2Muzzle.MZ2_BOSS2_MACHINEGUN_R5], [32, 40, 70], "MZ2_BOSS2_MACHINEGUN_R5 offset mismatch");
assert.deepEqual([
  RogueMuzzle.MZ2_CARRIER_MACHINEGUN_L1,
  RogueMuzzle.MZ2_CARRIER_MACHINEGUN_R1,
  RogueMuzzle.MZ2_CARRIER_GRENADE,
  RogueMuzzle.MZ2_TURRET_MACHINEGUN,
  RogueMuzzle.MZ2_TURRET_ROCKET,
  RogueMuzzle.MZ2_TURRET_BLASTER,
  RogueMuzzle.MZ2_STALKER_BLASTER,
  RogueMuzzle.MZ2_DAEDALUS_BLASTER,
  RogueMuzzle.MZ2_MEDIC_BLASTER_2,
  RogueMuzzle.MZ2_CARRIER_RAILGUN,
  RogueMuzzle.MZ2_WIDOW_DISRUPTOR,
  RogueMuzzle.MZ2_WIDOW_BLASTER,
  RogueMuzzle.MZ2_WIDOW_RAIL,
  RogueMuzzle.MZ2_WIDOW_PLASMABEAM,
  RogueMuzzle.MZ2_CARRIER_MACHINEGUN_L2,
  RogueMuzzle.MZ2_CARRIER_MACHINEGUN_R2,
  RogueMuzzle.MZ2_WIDOW_RAIL_LEFT,
  RogueMuzzle.MZ2_WIDOW_RAIL_RIGHT,
  RogueMuzzle.MZ2_WIDOW_BLASTER_SWEEP1,
  RogueMuzzle.MZ2_WIDOW_BLASTER_SWEEP2,
  RogueMuzzle.MZ2_WIDOW_BLASTER_SWEEP3,
  RogueMuzzle.MZ2_WIDOW_BLASTER_SWEEP4,
  RogueMuzzle.MZ2_WIDOW_BLASTER_SWEEP5,
  RogueMuzzle.MZ2_WIDOW_BLASTER_SWEEP6,
  RogueMuzzle.MZ2_WIDOW_BLASTER_SWEEP7,
  RogueMuzzle.MZ2_WIDOW_BLASTER_SWEEP8,
  RogueMuzzle.MZ2_WIDOW_BLASTER_SWEEP9,
  RogueMuzzle.MZ2_WIDOW_BLASTER_100,
  RogueMuzzle.MZ2_WIDOW_BLASTER_90,
  RogueMuzzle.MZ2_WIDOW_BLASTER_80,
  RogueMuzzle.MZ2_WIDOW_BLASTER_70,
  RogueMuzzle.MZ2_WIDOW_BLASTER_60,
  RogueMuzzle.MZ2_WIDOW_BLASTER_50,
  RogueMuzzle.MZ2_WIDOW_BLASTER_40,
  RogueMuzzle.MZ2_WIDOW_BLASTER_30,
  RogueMuzzle.MZ2_WIDOW_BLASTER_20,
  RogueMuzzle.MZ2_WIDOW_BLASTER_10,
  RogueMuzzle.MZ2_WIDOW_BLASTER_0,
  RogueMuzzle.MZ2_WIDOW_BLASTER_10L,
  RogueMuzzle.MZ2_WIDOW_BLASTER_20L,
  RogueMuzzle.MZ2_WIDOW_BLASTER_30L,
  RogueMuzzle.MZ2_WIDOW_BLASTER_40L,
  RogueMuzzle.MZ2_WIDOW_BLASTER_50L,
  RogueMuzzle.MZ2_WIDOW_BLASTER_60L,
  RogueMuzzle.MZ2_WIDOW_BLASTER_70L,
  RogueMuzzle.MZ2_WIDOW_RUN_1,
  RogueMuzzle.MZ2_WIDOW_RUN_2,
  RogueMuzzle.MZ2_WIDOW_RUN_3,
  RogueMuzzle.MZ2_WIDOW_RUN_4,
  RogueMuzzle.MZ2_WIDOW_RUN_5,
  RogueMuzzle.MZ2_WIDOW_RUN_6,
  RogueMuzzle.MZ2_WIDOW_RUN_7,
  RogueMuzzle.MZ2_WIDOW_RUN_8,
  RogueMuzzle.MZ2_CARRIER_ROCKET_1,
  RogueMuzzle.MZ2_CARRIER_ROCKET_2,
  RogueMuzzle.MZ2_CARRIER_ROCKET_3,
  RogueMuzzle.MZ2_CARRIER_ROCKET_4,
  RogueMuzzle.MZ2_WIDOW2_BEAMER_1,
  RogueMuzzle.MZ2_WIDOW2_BEAMER_2,
  RogueMuzzle.MZ2_WIDOW2_BEAMER_3,
  RogueMuzzle.MZ2_WIDOW2_BEAMER_4,
  RogueMuzzle.MZ2_WIDOW2_BEAMER_5,
  RogueMuzzle.MZ2_WIDOW2_BEAM_SWEEP_1,
  RogueMuzzle.MZ2_WIDOW2_BEAM_SWEEP_2,
  RogueMuzzle.MZ2_WIDOW2_BEAM_SWEEP_3,
  RogueMuzzle.MZ2_WIDOW2_BEAM_SWEEP_4,
  RogueMuzzle.MZ2_WIDOW2_BEAM_SWEEP_5,
  RogueMuzzle.MZ2_WIDOW2_BEAM_SWEEP_6,
  RogueMuzzle.MZ2_WIDOW2_BEAM_SWEEP_7,
  RogueMuzzle.MZ2_WIDOW2_BEAM_SWEEP_8,
  RogueMuzzle.MZ2_WIDOW2_BEAM_SWEEP_9,
  RogueMuzzle.MZ2_WIDOW2_BEAM_SWEEP_10,
  RogueMuzzle.MZ2_WIDOW2_BEAM_SWEEP_11
], Array.from({ length: 73 }, (_, index) => index + 138), "MZ2 Rogue q_shared.h numeric range mismatch");
assert.deepEqual(monster_flash_offset[RogueMuzzle.MZ2_CARRIER_MACHINEGUN_L1], [56, -32, 32], "MZ2_CARRIER_MACHINEGUN_L1 offset mismatch");
assert.deepEqual(monster_flash_offset[RogueMuzzle.MZ2_TURRET_MACHINEGUN], [16, 0, 0], "MZ2_TURRET_MACHINEGUN offset mismatch");
assert.deepEqual(monster_flash_offset[RogueMuzzle.MZ2_STALKER_BLASTER], [24, 0, 6], "MZ2_STALKER_BLASTER offset mismatch");
assert.deepEqual(monster_flash_offset[RogueMuzzle.MZ2_WIDOW_DISRUPTOR], [57.72, 14.50, 88.81], "MZ2_WIDOW_DISRUPTOR offset mismatch");
assert.deepEqual(monster_flash_offset[RogueMuzzle.MZ2_WIDOW_BLASTER_SWEEP9], [67, -20, 90], "MZ2_WIDOW_BLASTER_SWEEP9 offset mismatch");
assert.deepEqual(monster_flash_offset[RogueMuzzle.MZ2_WIDOW_RUN_8], [68.55, 9.54, 87.36], "MZ2_WIDOW_RUN_8 offset mismatch");
assert.deepEqual(monster_flash_offset[RogueMuzzle.MZ2_CARRIER_ROCKET_4], [0, 0, -5], "MZ2_CARRIER_ROCKET_4 offset mismatch");
assert.deepEqual(monster_flash_offset[RogueMuzzle.MZ2_WIDOW2_BEAMER_1], [69.00, -17.63, 93.77], "MZ2_WIDOW2_BEAMER_1 offset mismatch");
assert.deepEqual(monster_flash_offset[RogueMuzzle.MZ2_WIDOW2_BEAM_SWEEP_11], [58.29, 27.11, 92], "MZ2_WIDOW2_BEAM_SWEEP_11 offset mismatch");
assert.equal(COM_SkipPath("textures/e1u1/wall.wal"), "wall.wal", "COM_SkipPath mismatch");
assert.equal(COM_StripExtension("maps/base1.bsp"), "maps/base1", "COM_StripExtension mismatch");
assert.equal(COM_FileExtension("maps/base1.bsp"), "bsp", "COM_FileExtension mismatch");
assert.equal(COM_FileExtension("archive.tar.longext"), "tar.lon", "COM_FileExtension static buffer width mismatch");
assert.equal(COM_FileBase("maps/base1.bsp"), "base1", "COM_FileBase mismatch");
assert.equal(COM_FileBase("maps/a.bsp"), "", "COM_FileBase single-character base mismatch");
assert.equal(COM_FilePath("maps/base1.bsp"), "maps", "COM_FilePath mismatch");
assert.equal(COM_DefaultExtension("maps/base1", ".bsp"), "maps/base1.bsp", "COM_DefaultExtension mismatch");
assert.equal(COM_DefaultExtension("maps/base1.bsp", ".wal"), "maps/base1.bsp", "COM_DefaultExtension existing ext mismatch");

const parseSource = "   // comment\n\"hello world\" next";
const parseResult = COM_Parse(parseSource);
assert.equal(parseResult.token, "hello world", "COM_Parse quoted token mismatch");
assert.equal(COM_Parse(parseSource, parseResult.nextIndex ?? 0).token, "next", "COM_Parse next token mismatch");
assert.deepEqual(COM_Parse(null), { token: "", nextIndex: null }, "COM_Parse null input mismatch");
assert.deepEqual(COM_Parse("   \t\n"), { token: "", nextIndex: null }, "COM_Parse whitespace EOF mismatch");
assert.equal(COM_Parse("// only comment\nword").token, "word", "COM_Parse comment skip mismatch");
assert.equal(COM_Parse("unterminated").nextIndex, null, "COM_Parse terminal word pointer mismatch");
assert.equal(COM_Parse("x".repeat(128)).token, "", "COM_Parse overlong regular token discard mismatch");
assert.equal(COM_Parse(`"${"q".repeat(128)}"`).token.length, 128, "COM_Parse quoted token length mismatch");

let info = "";
info = Info_SetValueForKey(info, "name", "player");
info = Info_SetValueForKey(info, "skin", "male/grunt");
assert.equal(Info_ValueForKey(info, "name"), "player", "Info_ValueForKey mismatch");
assert.equal(Info_RemoveKey(info, "name"), "\\skin\\male/grunt", "Info_RemoveKey mismatch");
assert.equal(Info_ValueForKey("\\name\\first\\name\\second", "name"), "first", "Info_ValueForKey should return the first matching key");
assert.equal(Info_RemoveKey("\\name\\first\\name\\second", "name"), "\\name\\second", "Info_RemoveKey should remove only the first matching key");
assert.equal(Info_RemoveKey("\\name\\player\\dangling", "skin"), "\\name\\player\\dangling", "Info_RemoveKey should preserve malformed nonmatching tails");
assert.equal(Info_SetValueForKey("", "motd", "hello;world"), "\\motd\\hello;world", "Info_SetValueForKey value semicolon mismatch");
assert.equal(Info_SetValueForKey("\\name\\player", "name", ""), "", "Info_SetValueForKey empty value removal mismatch");
assert.equal(Info_SetValueForKey("\\name\\player", "bad;key", "value"), "\\name\\player", "Info_SetValueForKey key semicolon guard mismatch");
assert.equal(Info_SetValueForKey("\\name\\player", "skin", "bad\\value"), "\\name\\player", "Info_SetValueForKey value backslash guard mismatch");
assert.equal(Info_SetValueForKey("\\name\\player", "skin", "\"bad\""), "\\name\\player", "Info_SetValueForKey value quote guard mismatch");
assert.equal(Info_SetValueForKey("", "hi", "A\u00e9B"), "\\hi\\AiB", "Info_SetValueForKey should strip high bits and keep printable ASCII");
assert.equal(Info_Validate("\\name\\ok"), true, "Info_Validate valid mismatch");
assert.equal(Info_Validate("\\name\\bad;value"), false, "Info_Validate invalid mismatch");

assert.equal(BigShort(0x1234), 0x3412, "BigShort mismatch on little-endian host expectation");
assert.equal(LittleShort(0x1234), 0x1234, "LittleShort mismatch");
assert.equal(BigLong(0x12345678), 0x78563412, "BigLong mismatch on little-endian host expectation");
assert.equal(LittleLong(0x12345678), 0x12345678, "LittleLong mismatch");
assert.ok(Math.abs(BigFloat(1.0) - 4.600602988224807e-41) < 1e-45, "BigFloat mismatch");
assert.equal(LittleFloat(1.0), 1.0, "LittleFloat mismatch");
assert.equal(ShortSwap(0x0080), -32768, "ShortSwap signed result mismatch");
assert.equal(ShortNoSwap(0x8000), -32768, "ShortNoSwap signed result mismatch");
assert.equal(LongSwap(0x12345678), 0x78563412, "LongSwap mismatch");
assert.equal(LongNoSwap(-1), -1, "LongNoSwap mismatch");
assert.ok(Math.abs(FloatSwap(1.0) - 4.600602988224807e-41) < 1e-45, "FloatSwap mismatch");
assert.equal(FloatNoSwap(1.0), 1.0, "FloatNoSwap mismatch");
assert.equal(Swap_Init().bigendien, false, "Swap_Init host-endian detection mismatch");
assert.equal(va("%s%i%s", "a", 1, "b"), "a1b", "va string/integer format mismatch");
assert.equal(va("%04i %.2f %% %X", 7, 1.25, 255), "0007 1.25 % FF", "va numeric format mismatch");
assert.equal(Q_stricmp("Blaster", "blaster"), 0, "Q_stricmp mismatch");
assert.equal(Q_strcasecmp("Rocket", "rocket"), 0, "Q_strcasecmp mismatch");
assert.equal(Q_strncasecmp("Machinegun", "machine", 7), 0, "Q_strncasecmp prefix mismatch");
assert.equal(Q_strncasecmp("Rocket", "Rail", 3), -1, "Q_strncasecmp mismatch");
assert.equal(Q_strncasecmp("a", "b", 0), 0, "Q_strncasecmp zero-count mismatch");
assert.equal(Q_strncasecmp("a", "b", -1), -1, "Q_strncasecmp negative-count mismatch");
assert.equal(Com_sprintf(64, "maps/base1.bsp"), "maps/base1.bsp", "Com_sprintf in-bounds mismatch");
assert.equal(Com_sprintf(8, "0123456789"), "0123456", "Com_sprintf clamp mismatch");
assert.equal(Com_sprintf(0, "ignored"), "", "Com_sprintf zero-size mismatch");
const commonPrintRuntime = createCommonRuntime();
const printed: string[] = [];
Com_Printf(commonPrintRuntime, "hello %s %04i %.1f %%\n", (line) => printed.push(line), "quake", 2, 3.25);
assert.deepEqual(printed, ["hello quake 0002 3.3 %\n"], "Com_Printf sink/format mismatch");
const redirected: Array<{ target: number; buffer: string }> = [];
Com_BeginRedirect(commonPrintRuntime, 7, 11, (target, buffer) => redirected.push({ target, buffer }));
Com_Printf(commonPrintRuntime, "abc");
Com_Printf(commonPrintRuntime, "defghi");
Com_Printf(commonPrintRuntime, "Z%s", "Z");
assert.deepEqual(redirected, [{ target: 7, buffer: "abcdefghi" }], "Com_Printf redirect overflow flush mismatch");
Com_EndRedirect(commonPrintRuntime);
assert.deepEqual(
  redirected,
  [
    { target: 7, buffer: "abcdefghi" },
    { target: 7, buffer: "ZZ" }
  ],
  "Com_Printf redirect final flush mismatch"
);

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

const hunk = Hunk_Begin(systemRuntime, 64);
assert.equal(hunk.length, 64, "Hunk_Begin mismatch");
const chunk = Hunk_Alloc(systemRuntime, 4);
assert.equal(chunk.length, 4, "Hunk_Alloc returned slice mismatch");
chunk[0] = 7;
assert.equal(Hunk_End(systemRuntime), 32, "Hunk_End aligned size mismatch");
Hunk_Free(systemRuntime, hunk);
assert.equal(Hunk_End(systemRuntime), 0, "Hunk_Free mismatch");
assert.throws(() => Hunk_Alloc(systemRuntime, 1), /Hunk_Alloc called before Hunk_Begin/, "Hunk_Alloc pre-begin guard mismatch");
Hunk_Begin(systemRuntime, 16);
assert.throws(() => Hunk_Alloc(systemRuntime, 17), /Hunk_Alloc overflow/, "Hunk_Alloc aligned overflow mismatch");
Hunk_Free(systemRuntime, systemRuntime.activeHunk);

assert.equal(Sys_FindFirst(systemRuntime, "maps", 0, 0), "maps/first", "Sys_FindFirst mismatch");
assert.equal(Sys_FindNext(systemRuntime, 0, 0), "maps/second", "Sys_FindNext mismatch");
Sys_FindClose(systemRuntime);
assert.equal(Sys_FindNext(systemRuntime, 0, 0), null, "Sys_FindClose mismatch");

Com_PageInMemory(systemRuntime, new Uint8Array([1, 2, 3, 4]), 4);
assert.equal(systemRuntime.paged_total, 4, "Com_PageInMemory mismatch");
const pagedBuffer = new Uint8Array(8193);
pagedBuffer[4096] = 5;
pagedBuffer[8192] = 7;
Com_PageInMemory(systemRuntime, pagedBuffer, pagedBuffer.length);
assert.equal(systemRuntime.paged_total, 16, "Com_PageInMemory page stride mismatch");

assert.throws(() => Sys_Error(systemRuntime, "boom"), /fatal:boom/, "Sys_Error mismatch");
assert.throws(() => Sys_Error(systemRuntime, "fatal %s %d", "map", 7), /fatal:fatal map 7/, "Sys_Error varargs mismatch");

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
const copiedByMacro: [number, number, number] = [0, 0, 0];
VectorCopy([9, 8, 7], copiedByMacro);
assert.deepEqual(copiedByMacro, [9, 8, 7], "VectorCopy macro mismatch");
const clearedByMacro: [number, number, number] = [1, 2, 3];
VectorClear(clearedByMacro);
assert.deepEqual(clearedByMacro, [0, 0, 0], "VectorClear macro mismatch");
const negatedByMacro: [number, number, number] = [0, 0, 0];
VectorNegate([1, -2, 3], negatedByMacro);
assert.deepEqual(negatedByMacro, [-1, 2, -3], "VectorNegate macro mismatch");
const setByMacro: [number, number, number] = [0, 0, 0];
VectorSet(setByMacro, 4, -5, 6);
assert.deepEqual(setByMacro, [4, -5, 6], "VectorSet macro mismatch");
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
assert.equal(Q_log2(1), 0, "Q_log2 one mismatch");
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
assert.equal(BoxOnPlaneSide([-1, -1, -1], [1, 1, 1], {
  normal: [0, 1, 0],
  dist: -2,
  type: 1,
  signbits: 0
}), 1, "BoxOnPlaneSide axial front mismatch");
assert.equal(BoxOnPlaneSide([-1, -1, -1], [1, 1, 1], {
  normal: [0, 0, 1],
  dist: 2,
  type: 2,
  signbits: 0
}), 2, "BoxOnPlaneSide axial back mismatch");
assert.equal(BoxOnPlaneSide([-1, -1, -1], [1, 1, 1], {
  normal: [-1, 2, -3],
  dist: 0,
  type: 3,
  signbits: 5
}), 3, "BoxOnPlaneSide signbits mismatch");
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

assert.equal(AREA_SOLID, 1, "AREA_SOLID mismatch");
assert.equal(AREA_TRIGGERS, 2, "AREA_TRIGGERS mismatch");
const planeShape: cplane_t = { normal: [1, -2, 3], dist: 12.5, type: 4, signbits: 2, pad: [0, 0] };
assert.deepEqual(planeShape.normal, [1, -2, 3], "cplane_t normal field mismatch");
assert.equal(planeShape.dist, 12.5, "cplane_t dist field mismatch");
assert.equal(planeShape.type, 4, "cplane_t type field mismatch");
assert.equal(planeShape.signbits, 2, "cplane_t signbits field mismatch");
assert.deepEqual(planeShape.pad, [0, 0], "cplane_t pad field mismatch");
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

const cmodelShape: cmodel_t = { mins: [-16, -24, -32], maxs: [16, 24, 32], origin: [8, 9, 10], headnode: 42 };
assert.deepEqual(cmodelShape.mins, [-16, -24, -32], "cmodel_t mins field mismatch");
assert.deepEqual(cmodelShape.maxs, [16, 24, 32], "cmodel_t maxs field mismatch");
assert.deepEqual(cmodelShape.origin, [8, 9, 10], "cmodel_t origin field mismatch");
assert.equal(cmodelShape.headnode, 42, "cmodel_t headnode field mismatch");

const csurfaceShape: csurface_t = { name: "e1u1/metal", flags: SURF_SLICK, value: 7 };
assert.equal(csurfaceShape.name, "e1u1/metal", "csurface_t name field mismatch");
assert.equal(csurfaceShape.flags, SURF_SLICK, "csurface_t flags field mismatch");
assert.equal(csurfaceShape.value, 7, "csurface_t value field mismatch");

const mapsurfaceShape: mapsurface_t = { c: csurfaceShape, rname: "e1u1/metal_long_material_name" };
assert.equal(mapsurfaceShape.c, csurfaceShape, "mapsurface_t c field mismatch");
assert.equal(mapsurfaceShape.rname, "e1u1/metal_long_material_name", "mapsurface_t rname field mismatch");

const traceEntity = { id: 7 };
const traceShape: trace_t = {
  allsolid: false,
  startsolid: true,
  fraction: 0.375,
  endpos: [12, 24, 36],
  plane: planeShape,
  surface: csurfaceShape,
  contents: CONTENTS_SOLID,
  ent: traceEntity
};
assert.equal(traceShape.allsolid, false, "trace_t allsolid field mismatch");
assert.equal(traceShape.startsolid, true, "trace_t startsolid field mismatch");
assert.equal(traceShape.fraction, 0.375, "trace_t fraction field mismatch");
assert.deepEqual(traceShape.endpos, [12, 24, 36], "trace_t endpos field mismatch");
assert.equal(traceShape.plane, planeShape, "trace_t plane field mismatch");
assert.equal(traceShape.surface, csurfaceShape, "trace_t surface field mismatch");
assert.equal(traceShape.contents, CONTENTS_SOLID, "trace_t contents field mismatch");
assert.equal(traceShape.ent, traceEntity, "trace_t ent field mismatch");

assert.equal(pmtype_t.PM_NORMAL, 0, "PM_NORMAL mismatch");
assert.equal(pmtype_t.PM_SPECTATOR, 1, "PM_SPECTATOR mismatch");
assert.equal(pmtype_t.PM_DEAD, 2, "PM_DEAD mismatch");
assert.equal(pmtype_t.PM_GIB, 3, "PM_GIB mismatch");
assert.equal(pmtype_t.PM_FREEZE, 4, "PM_FREEZE mismatch");
assert.equal(PMF_DUCKED, 1, "PMF_DUCKED mismatch");
assert.equal(PMF_JUMP_HELD, 2, "PMF_JUMP_HELD mismatch");
assert.equal(PMF_ON_GROUND, 4, "PMF_ON_GROUND mismatch");
assert.equal(PMF_TIME_WATERJUMP, 8, "PMF_TIME_WATERJUMP mismatch");
assert.equal(PMF_TIME_LAND, 16, "PMF_TIME_LAND mismatch");
assert.equal(PMF_TIME_TELEPORT, 32, "PMF_TIME_TELEPORT mismatch");
assert.equal(PMF_NO_PREDICTION, 64, "PMF_NO_PREDICTION mismatch");

const pmoveStateShape: pmove_state_t = {
  pm_type: pmtype_t.PM_NORMAL,
  origin: [1, 2, 3],
  velocity: [4, 5, 6],
  pm_flags: PMF_DUCKED | PMF_ON_GROUND,
  pm_time: 9,
  gravity: 800,
  delta_angles: [10, 20, 30]
};
assert.equal(pmoveStateShape.pm_type, pmtype_t.PM_NORMAL, "pmove_state_t pm_type field mismatch");
assert.deepEqual(pmoveStateShape.origin, [1, 2, 3], "pmove_state_t origin field mismatch");
assert.deepEqual(pmoveStateShape.velocity, [4, 5, 6], "pmove_state_t velocity field mismatch");
assert.equal(pmoveStateShape.pm_flags, PMF_DUCKED | PMF_ON_GROUND, "pmove_state_t pm_flags field mismatch");
assert.equal(pmoveStateShape.pm_time, 9, "pmove_state_t pm_time field mismatch");
assert.equal(pmoveStateShape.gravity, 800, "pmove_state_t gravity field mismatch");
assert.deepEqual(pmoveStateShape.delta_angles, [10, 20, 30], "pmove_state_t delta_angles field mismatch");

assert.equal(BUTTON_ATTACK, 1, "BUTTON_ATTACK mismatch");
assert.equal(BUTTON_USE, 2, "BUTTON_USE mismatch");
assert.equal(BUTTON_ANY, 128, "BUTTON_ANY mismatch");
const usercmdShape: usercmd_t = {
  msec: 8,
  buttons: BUTTON_ATTACK | BUTTON_USE,
  angles: [100, 200, 300],
  forwardmove: 400,
  sidemove: -50,
  upmove: 25,
  impulse: 3,
  lightlevel: 128
};
assert.equal(usercmdShape.msec, 8, "usercmd_t msec field mismatch");
assert.equal(usercmdShape.buttons, BUTTON_ATTACK | BUTTON_USE, "usercmd_t buttons field mismatch");
assert.deepEqual(usercmdShape.angles, [100, 200, 300], "usercmd_t angles field mismatch");
assert.equal(usercmdShape.forwardmove, 400, "usercmd_t forwardmove field mismatch");
assert.equal(usercmdShape.sidemove, -50, "usercmd_t sidemove field mismatch");
assert.equal(usercmdShape.upmove, 25, "usercmd_t upmove field mismatch");
assert.equal(usercmdShape.impulse, 3, "usercmd_t impulse field mismatch");
assert.equal(usercmdShape.lightlevel, 128, "usercmd_t lightlevel field mismatch");

assert.equal(MAXTOUCH, 32, "MAXTOUCH mismatch");
const pmoveShape: pmove_t = {
  s: pmoveStateShape,
  cmd: usercmdShape,
  snapinitial: true,
  numtouch: 1,
  touchents: [traceEntity],
  viewangles: [90, 0, 0],
  viewheight: 22,
  mins: [-16, -16, -24],
  maxs: [16, 16, 32],
  groundentity: traceEntity,
  watertype: CONTENTS_WATER,
  waterlevel: 2,
  trace: (_start, _mins, _maxs, end) => ({ ...traceShape, endpos: [...end] }),
  pointcontents: () => CONTENTS_WATER
};
assert.equal(pmoveShape.s, pmoveStateShape, "pmove_t s field mismatch");
assert.equal(pmoveShape.cmd, usercmdShape, "pmove_t cmd field mismatch");
assert.equal(pmoveShape.snapinitial, true, "pmove_t snapinitial field mismatch");
assert.equal(pmoveShape.numtouch, 1, "pmove_t numtouch field mismatch");
assert.deepEqual(pmoveShape.touchents, [traceEntity], "pmove_t touchents field mismatch");
assert.deepEqual(pmoveShape.viewangles, [90, 0, 0], "pmove_t viewangles field mismatch");
assert.equal(pmoveShape.viewheight, 22, "pmove_t viewheight field mismatch");
assert.deepEqual(pmoveShape.mins, [-16, -16, -24], "pmove_t mins field mismatch");
assert.deepEqual(pmoveShape.maxs, [16, 16, 32], "pmove_t maxs field mismatch");
assert.equal(pmoveShape.groundentity, traceEntity, "pmove_t groundentity field mismatch");
assert.equal(pmoveShape.watertype, CONTENTS_WATER, "pmove_t watertype field mismatch");
assert.equal(pmoveShape.waterlevel, 2, "pmove_t waterlevel field mismatch");
assert.deepEqual(pmoveShape.trace?.([0, 0, 0], [0, 0, 0], [0, 0, 0], [7, 8, 9]).endpos, [7, 8, 9], "pmove_t trace callback mismatch");
assert.equal(pmoveShape.pointcontents?.([0, 0, 0]), CONTENTS_WATER, "pmove_t pointcontents callback mismatch");

const entityState = createEntityState();
assert.equal(entityState.number, 0, "createEntityState default number mismatch");
assert.equal(entityState.event, 0, "createEntityState default event mismatch");

const playerState = createPlayerState();
assert.equal(playerState.stats.length, 32, "createPlayerState stats width mismatch");
assert.deepEqual(playerState.viewangles, [0, 0, 0], "createPlayerState default viewangles mismatch");

console.log("quake2-q-shared-header: ok");
