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
  CL_ParseParticles,
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
  CL_Precache_f,
  CL_RequestNextDownload
} from "./precache.js";
export {
  CL_RegisterSounds
} from "./sound.js";
export {
  DrawHUDString,
  Inv_DrawString,
  CL_DrawInventory,
  SCR_BuildHudDrawCommands,
  SCR_ExecuteLayoutString,
  SCR_DrawField,
  SCR_DrawLayout,
  SCR_DrawStats,
  SCR_TouchPics,
  SetStringHighBit,
  SizeHUDString,
  SCR_BeginLoadingPlaque,
  SCR_BuildScreenState,
  SCR_CenterPrint,
  SCR_CheckDrawCenterString,
  SCR_EndLoadingPlaque
} from "./screen.js";
export {
  Cmd_ForwardToServer,
  CL_Changing_f,
  CL_Connect_f,
  CL_Disconnect,
  CL_Disconnect_f,
  CL_ForwardToServer_f,
  CL_InitLocal,
  CL_Pause_f,
  CL_PingServers_f,
  CL_Quit_f,
  CL_Rcon_f,
  CL_Reconnect_f,
  CL_Setenv_f,
  CL_Snd_Restart_f,
  CL_Skins_f,
  CL_TogglePause,
  CL_Userinfo_f,
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
  CL_BuildFrameEntityEventEffects,
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
  CL_ClearTEnts,
  CL_RegisterTEntModels,
  CL_RegisterTEntSounds
} from "./tent.js";
export {
  CL_BuildSkySnapshot
} from "./sky.js";
export {
  CL_BuildActionEffects,
  CL_BuildParticleEffects,
  CL_BuildEntityEventEffects,
  CL_BuildMuzzleFlash2Effects,
  CL_BuildMuzzleFlashEffects,
  CL_BuildTempEntityEffects,
  CL_BlasterParticles,
  CL_BlasterParticles2,
  CL_BlueBlasterParticles,
  CL_BubbleTrail,
  CL_BubbleTrail2,
  CL_BFGExplosionParticles,
  CL_ClearEffects,
  CL_ClearParticles,
  CL_ColorExplosionParticles,
  CL_ColorFlash,
  CL_DebugTrail,
  CL_ExplosionParticles,
  CL_Heatbeam,
  CL_ParticleSmokeEffect,
  CL_ParticleSteamEffect,
  CL_ParticleSteamEffect2,
  CL_MonsterPlasma_Shell,
  CL_ParticleEffect,
  CL_ParticleEffect2,
  CL_ParticleEffect3,
  CL_RailTrail,
  CL_TeleportParticles,
  CL_WidowSplash,
  CL_BigTeleportParticles
} from "./effects.js";

export { svc_strings } from "../../qcommon/src/index.js";

export {
  CMD_BACKUP,
  MAX_BEAMS,
  MAX_EXPLOSIONS,
  MAX_LASERS,
  MAX_SUSTAINS,
  MAX_PARTICLES,
  MAX_CLIENTWEAPONMODELS,
  MAX_PARSE_ENTITIES,
  INSTANT_PARTICLE,
  connstate_t,
  createClientBeam,
  createCentity,
  createClientExplosion,
  createClientPrecacheState,
  createClientForceWall,
  createClientinfo,
  createClientSkyState,
  createKbutton,
  createClientLaser,
  createClientTempLight,
  createCparticle,
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
  client_precache_state_t,
  client_sky_t,
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
export type { ClientDynamicLight, ClientRefreshFrame, ClientRenderEntity, ClientRenderParticle } from "./refresh.js";
export type { ClientBeamRender, ClientExplosionRender, ClientForceWallRender, ClientSustainRender, ClientTEntRefresh } from "./tent.js";
export type {
  ClientDownloadBlock,
  ClientMuzzleFlash2Packet,
  ClientMuzzleFlashPacket,
  ClientParticleEffectPacket,
  ClientParseHooks,
  ClientSoundPacket,
  ClientTempEntityPacket
} from "./parse.js";
export type { ClientMainContext, ClientMainHooks } from "./main.js";
export type { ClientDownloadHooks } from "./download.js";
export type { ClientPrecacheHooks } from "./precache.js";
export type { ClientSoundRegistrationHooks } from "./sound.js";
export type {
  ClientCenterPrintState,
  ClientHudBounds,
  ClientHudDrawCommand,
  ClientHudFillCommand,
  ClientInventoryBindingMap,
  ClientHudLayoutContext,
  ClientHudNumberCommand,
  ClientHudPictureCommand,
  ClientHudStringMeasure,
  ClientHudTextCommand,
  ClientLoadingOverlayState,
  ClientNetOverlayState,
  ClientPauseOverlayState,
  ClientScreenBuildOptions,
  ClientScreenHudState
} from "./screen.js";
export type { ClientInputContext, ClientInputFrameOptions } from "./input.js";
export type { ClientViewOptions, ClientViewValues } from "./view.js";
export type { QuakeSkySnapshot } from "../../renderer-common/src/index.js";

export type {
  HudBounds,
  HudDrawCommand,
  HudFillCommand,
  HudNumberCommand,
  HudPictureCommand,
  HudPictureResourceResolver,
  HudTextCommand
} from "../../renderer-common/src/index.js";
