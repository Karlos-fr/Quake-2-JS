/**
 * File: index.ts
 * Purpose: Expose the first ported Quake II client runtime structures and parsing routines.
 *
 * This file is not a direct source port.
 * It is a package entry point for early client-side runtime modules.
 *
 * Dependencies:
 * - packages/client/src/types.ts
 * - packages/client/src/parse.ts
 */

export {
  CL_ClearState,
  CL_ParseBaseline,
  CL_ParseConfigString,
  CL_ParseDownload,
  CL_ParseDelta,
  CL_ParseEntityBits,
  CL_ParseFrame,
  CL_ParseMuzzleFlash,
  CL_ParseMuzzleFlash2,
  CL_ParsePlayerstate,
  CL_ParseServerData,
  CL_ParseServerMessage,
  CL_ParseStartSoundPacket,
  CL_ParseTEnt,
  CL_WriteStringCmd
} from "./parse.js";
export {
  CL_CheckOrDownloadFile,
  CL_Download_f,
  CL_DownloadFileName
} from "./download.js";
export {
  CL_Disconnect,
  CL_Disconnect_f,
  CL_ForwardToServer_f,
  CL_InitLocal,
  CL_Quit_f,
  CL_Skins_f,
  CL_TogglePause,
  createClientMainContext
} from "./main.js";
export {
  CL_AdjustAngles,
  CL_BaseMove,
  CL_ClampPitch,
  CL_CreateCmd,
  CL_FinishMove,
  CL_InitInput,
  CL_KeyState,
  CL_SetInputFrameTime,
  IN_CenterView,
  KeyDown,
  KeyUp,
  createClientInputContext
} from "./input.js";
export {
  CL_CalcViewValues,
  CL_CheckPredictionError,
  CL_PredictMovement,
  CL_UpdateLerpFraction
} from "./view.js";
export {
  CL_BuildPacketEntitySnapshots,
  CL_FireEntityEvents,
  CL_GetFrameEntityStates
} from "./entities.js";
export {
  CL_BuildRefreshFrame,
  CL_GetEntitySoundOrigin
} from "./refresh.js";
export {
  CL_AddTEntPacket,
  CL_BuildTEntRefresh,
  CL_ClearTEnts
} from "./tent.js";
export {
  CL_BuildActionEffects,
  CL_BuildMuzzleFlash2Effects,
  CL_BuildMuzzleFlashEffects,
  CL_BuildTempEntityEffects
} from "./effects.js";

export { svc_strings } from "../../qcommon/src/index.js";

export {
  CMD_BACKUP,
  MAX_BEAMS,
  MAX_EXPLOSIONS,
  MAX_LASERS,
  MAX_SUSTAINS,
  MAX_CLIENTWEAPONMODELS,
  MAX_PARSE_ENTITIES,
  connstate_t,
  createClientBeam,
  createCentity,
  createClientExplosion,
  createClientForceWall,
  createClientinfo,
  createKbutton,
  createClientLaser,
  createClientTempLight,
  createClientRuntime,
  createClientSustain,
  createClientState,
  createClientStatic,
  createClientTentState,
  createFrame
} from "./types.js";

export type {
  ClientRuntime,
  client_beam_t,
  client_explosion_t,
  client_force_wall_t,
  client_state_t,
  client_static_t,
  clientinfo_t,
  client_laser_t,
  client_temp_light_t,
  client_sustain_t,
  client_tent_state_t,
  centity_t,
  frame_t,
  kbutton_t
} from "./types.js";

export type { ClientEntityEvent, ClientInterpolatedEntity } from "./entities.js";
export type { ClientActionEffect } from "./effects.js";
export type { ClientDynamicLight, ClientRefreshFrame, ClientRenderEntity } from "./refresh.js";
export type { ClientBeamRender, ClientExplosionRender, ClientForceWallRender, ClientSustainRender, ClientTEntRefresh } from "./tent.js";
export type {
  ClientDownloadBlock,
  ClientMuzzleFlash2Packet,
  ClientMuzzleFlashPacket,
  ClientParseHooks,
  ClientSoundPacket,
  ClientTempEntityPacket
} from "./parse.js";
export type { ClientMainContext, ClientMainHooks } from "./main.js";
export type { ClientDownloadHooks } from "./download.js";
export type { ClientInputContext, ClientInputFrameOptions } from "./input.js";
export type { ClientViewOptions, ClientViewValues } from "./view.js";
