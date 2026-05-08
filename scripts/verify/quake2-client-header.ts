/**
 * File: quake2-client-header.ts
 * Purpose: Verify that the TypeScript target for `client/client.h` preserves the header-visible client runtime structures and cross-module declarations.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the mixed client header.
 *
 * Dependencies:
 * - packages/client/src/index.ts
 * - packages/client/src/client.ts
 * - packages/client/src/keys.ts
 */

import { strict as assert } from "node:assert";

import * as clientIndex from "../../packages/client/src/index.js";
import {
  CMD_BACKUP,
  CL_AddDLights,
  CL_AddEntities,
  CL_AddLightStyles,
  CL_AddParticles,
  CL_AddTEnts,
  CL_AllocDlight,
  CL_BlasterParticles2,
  CL_BlasterTrail,
  CL_BlasterTrail2,
  CL_BfgParticles,
  CL_BigTeleportParticles,
  CL_BubbleTrail,
  CL_BubbleTrail2,
  CL_BuildRefreshFrame,
  CL_BaseMove,
  CL_CheckPredictionError,
  CL_ClearState,
  CL_DebugTrail,
  CL_Disconnect,
  CL_Disconnect_f,
  CL_FixUpGender,
  CL_Init,
  CL_InitInput,
  CL_ParseConfigString,
  CL_ParseClientinfo,
  CL_ParseDelta,
  CL_ParseEntityBits,
  CL_ParseFrame,
  CL_ParseInventory,
  CL_ParseLayout,
  CL_ParseMuzzleFlash,
  CL_ParseMuzzleFlash2,
  CL_ParseServerMessage,
  CL_ParseTEnt,
  CL_LoadClientinfo,
  CL_Download_f,
  CL_PingServers_f,
  CL_PrepRefresh,
  CL_PredictMovement,
  CL_Flashlight,
  CL_FlameEffects,
  CL_ForceWall,
  CL_FlagTrail,
  CL_FlyEffect,
  CL_GenericParticleEffect,
  CL_Heatbeam,
  CL_IonripperTrail,
  CL_ParticleSteamEffect,
  CL_QuadTrail,
  CL_Quit_f,
  CL_RailTrail,
  CL_ReadPackets,
  CL_RegisterSounds,
  CL_RegisterTEntModels,
  CL_RegisterTEntSounds,
  CL_RequestNextDownload,
  CL_RocketTrail,
  CL_RunDLights,
  CL_RunLightStyles,
  CL_SendCmd,
  CL_SetLightstyle,
  CL_SmokeAndFlash,
  SHOWNET,
  CL_SmokeTrail,
  CL_Snd_Restart_f,
  CL_DiminishingTrail,
  CL_DrawInventory,
  CL_EntityEvent,
  CL_TrapParticles,
  M_AddToServerList,
  M_Draw,
  M_ForceMenuOff,
  M_Init,
  M_Keydown,
  M_Menu_Main_f,
  V_AddEntity,
  V_AddLight,
  V_AddLightStyle,
  V_AddParticle,
  V_Init,
  V_RenderView,
  INSTANT_PARTICLE,
  MAX_CLIENTWEAPONMODELS,
  MAX_DLIGHTS,
  MAX_PARSE_ENTITIES,
  MAX_PARTICLES,
  MAX_SUSTAINS,
  connstate_t,
  createCentity,
  createClientRuntime,
  createClientState,
  createClientStatic,
  createClientinfo,
  createFrame,
  createKbutton,
  dltype_t,
  IN_CenterView,
  CL_KeyState,
  keydest_t
} from "../../packages/client/src/index.js";
import {
  MAX_CLIENTS,
  MAX_CONFIGSTRINGS,
  MAX_EDICTS,
  MAX_IMAGES,
  MAX_ITEMS,
  MAX_MAP_AREAS,
  MAX_MODELS,
  MAX_SOUNDS,
  UPDATE_BACKUP,
  svc_ops_e,
  svc_strings
} from "../../packages/qcommon/src/index.js";

assert.equal(CMD_BACKUP, 64, "CMD_BACKUP mismatch");
assert.equal(MAX_CLIENTWEAPONMODELS, 20, "MAX_CLIENTWEAPONMODELS mismatch");
assert.equal(MAX_PARSE_ENTITIES, 1024, "MAX_PARSE_ENTITIES mismatch");
assert.equal(MAX_SUSTAINS, 32, "MAX_SUSTAINS mismatch");
assert.equal(MAX_DLIGHTS, 32, "MAX_DLIGHTS mismatch");
assert.equal(MAX_PARTICLES, 4096, "MAX_PARTICLES mismatch");
assert.equal(INSTANT_PARTICLE, -10000.0, "INSTANT_PARTICLE mismatch");
assert.equal(svc_strings[svc_ops_e.svc_muzzleflash2], "svc_muzzlflash2", "svc_strings shownet label mismatch");

assert.equal(typeof CL_ParseEntityBits, "function", "CL_ParseEntityBits export mismatch");
assert.equal(typeof CL_ParseDelta, "function", "CL_ParseDelta export mismatch");
assert.equal(typeof CL_ParseFrame, "function", "CL_ParseFrame export mismatch");
assert.equal(typeof CL_ParseTEnt, "function", "CL_ParseTEnt export mismatch");
assert.equal(typeof CL_ParseConfigString, "function", "CL_ParseConfigString export mismatch");
assert.equal(typeof CL_ParseLayout, "function", "CL_ParseLayout export mismatch");
assert.equal(typeof CL_ParseMuzzleFlash, "function", "CL_ParseMuzzleFlash export mismatch");
assert.equal(typeof CL_ParseMuzzleFlash2, "function", "CL_ParseMuzzleFlash2 export mismatch");
assert.equal(typeof CL_ParseServerMessage, "function", "CL_ParseServerMessage export mismatch");
assert.equal(typeof CL_LoadClientinfo, "function", "CL_LoadClientinfo export mismatch");
assert.equal(typeof SHOWNET, "function", "SHOWNET export mismatch");
assert.equal(typeof CL_ParseClientinfo, "function", "CL_ParseClientinfo export mismatch");
assert.equal(typeof CL_Download_f, "function", "CL_Download_f export mismatch");
assert.equal(typeof CL_SetLightstyle, "function", "CL_SetLightstyle export mismatch");
assert.equal(typeof CL_RunDLights, "function", "CL_RunDLights export mismatch");
assert.equal(typeof CL_RunLightStyles, "function", "CL_RunLightStyles export mismatch");
assert.equal(typeof CL_AddDLights, "function", "CL_AddDLights export mismatch");
assert.equal(typeof CL_AddLightStyles, "function", "CL_AddLightStyles export mismatch");
assert.equal(typeof CL_AddTEnts, "function", "CL_AddTEnts export mismatch");
assert.equal(typeof CL_BlasterTrail, "function", "CL_BlasterTrail export mismatch");
assert.equal(typeof CL_QuadTrail, "function", "CL_QuadTrail export mismatch");
assert.equal(typeof CL_RailTrail, "function", "CL_RailTrail export mismatch");
assert.equal(typeof CL_BubbleTrail, "function", "CL_BubbleTrail export mismatch");
assert.equal(typeof CL_FlagTrail, "function", "CL_FlagTrail export mismatch");
assert.equal(typeof CL_IonripperTrail, "function", "CL_IonripperTrail export mismatch");
assert.equal(typeof CL_BlasterParticles2, "function", "CL_BlasterParticles2 export mismatch");
assert.equal(typeof CL_BlasterTrail2, "function", "CL_BlasterTrail2 export mismatch");
assert.equal(typeof CL_DebugTrail, "function", "CL_DebugTrail export mismatch");
assert.equal(typeof CL_SmokeTrail, "function", "CL_SmokeTrail export mismatch");
assert.equal(typeof CL_Flashlight, "function", "CL_Flashlight export mismatch");
assert.equal(typeof CL_ForceWall, "function", "CL_ForceWall export mismatch");
assert.equal(typeof CL_FlameEffects, "function", "CL_FlameEffects export mismatch");
assert.equal(typeof CL_GenericParticleEffect, "function", "CL_GenericParticleEffect export mismatch");
assert.equal(typeof CL_BubbleTrail2, "function", "CL_BubbleTrail2 export mismatch");
assert.equal(typeof CL_Heatbeam, "function", "CL_Heatbeam export mismatch");
assert.equal(typeof CL_ParticleSteamEffect, "function", "CL_ParticleSteamEffect export mismatch");
assert.equal(typeof CL_PrepRefresh, "function", "CL_PrepRefresh export mismatch");
assert.equal(typeof CL_RegisterSounds, "function", "CL_RegisterSounds export mismatch");
assert.equal(typeof CL_Quit_f, "function", "CL_Quit_f export mismatch");
assert.equal(typeof CL_Init, "function", "CL_Init export mismatch");
assert.equal(typeof CL_FixUpGender, "function", "CL_FixUpGender export mismatch");
assert.equal(typeof CL_Disconnect, "function", "CL_Disconnect export mismatch");
assert.equal(typeof CL_Disconnect_f, "function", "CL_Disconnect_f export mismatch");
assert.equal(typeof CL_PingServers_f, "function", "CL_PingServers_f export mismatch");
assert.equal(typeof CL_Snd_Restart_f, "function", "CL_Snd_Restart_f export mismatch");
assert.equal(typeof CL_RequestNextDownload, "function", "CL_RequestNextDownload export mismatch");
assert.equal(typeof CL_InitInput, "function", "CL_InitInput export mismatch");
assert.equal(typeof CL_SendCmd, "function", "CL_SendCmd export mismatch");
assert.equal(typeof CL_ClearState, "function", "CL_ClearState export mismatch");
assert.equal(typeof CL_ReadPackets, "function", "CL_ReadPackets export mismatch");
assert.equal(typeof CL_BaseMove, "function", "CL_BaseMove export mismatch");
assert.equal(typeof IN_CenterView, "function", "IN_CenterView export mismatch");
assert.equal(typeof CL_KeyState, "function", "CL_KeyState export mismatch");
assert.equal(CL_AddEntities, CL_BuildRefreshFrame, "CL_AddEntities should expose CL_BuildRefreshFrame adapter");
assert.equal(typeof V_Init, "function", "V_Init export mismatch");
assert.equal(typeof V_RenderView, "function", "V_RenderView export mismatch");
assert.equal(typeof V_AddEntity, "function", "V_AddEntity export mismatch");
assert.equal(typeof V_AddParticle, "function", "V_AddParticle export mismatch");
assert.equal(typeof V_AddLight, "function", "V_AddLight export mismatch");
assert.equal(typeof V_AddLightStyle, "function", "V_AddLightStyle export mismatch");
assert.equal(typeof CL_RegisterTEntSounds, "function", "CL_RegisterTEntSounds export mismatch");
assert.equal(typeof CL_RegisterTEntModels, "function", "CL_RegisterTEntModels export mismatch");
assert.equal(typeof CL_SmokeAndFlash, "function", "CL_SmokeAndFlash export mismatch");
assert.equal(typeof CL_CheckPredictionError, "function", "CL_CheckPredictionError export mismatch");
assert.equal(typeof CL_AllocDlight, "function", "CL_AllocDlight export mismatch");
assert.equal(typeof CL_BigTeleportParticles, "function", "CL_BigTeleportParticles export mismatch");
assert.equal(typeof CL_RocketTrail, "function", "CL_RocketTrail export mismatch");
assert.equal(typeof CL_DiminishingTrail, "function", "CL_DiminishingTrail export mismatch");
assert.equal(typeof CL_FlyEffect, "function", "CL_FlyEffect export mismatch");
assert.equal(typeof CL_BfgParticles, "function", "CL_BfgParticles export mismatch");
assert.equal(typeof CL_AddParticles, "function", "CL_AddParticles export mismatch");
assert.equal(typeof CL_EntityEvent, "function", "CL_EntityEvent export mismatch");
assert.equal(typeof CL_TrapParticles, "function", "CL_TrapParticles export mismatch");
assert.equal(typeof M_Init, "function", "M_Init export mismatch");
assert.equal(typeof M_Keydown, "function", "M_Keydown export mismatch");
assert.equal(typeof M_Draw, "function", "M_Draw export mismatch");
assert.equal(typeof M_Menu_Main_f, "function", "M_Menu_Main_f export mismatch");
assert.equal(typeof M_ForceMenuOff, "function", "M_ForceMenuOff export mismatch");
assert.equal(typeof M_AddToServerList, "function", "M_AddToServerList export mismatch");
assert.equal(typeof CL_ParseInventory, "function", "CL_ParseInventory export mismatch");
assert.equal(typeof CL_DrawInventory, "function", "CL_DrawInventory export mismatch");
assert.equal(typeof CL_PredictMovement, "function", "CL_PredictMovement export mismatch");
assert.equal("CL_RunParticles" in clientIndex, false, "CL_RunParticles is an unused original header declaration without a C definition");
assert.equal("IN_Accumulate" in clientIndex, false, "IN_Accumulate is an unused original header declaration without a C definition");
assert.equal("CL_GetChallengePacket" in clientIndex, false, "CL_GetChallengePacket is an unused original header declaration without a C definition");
assert.equal("CL_SendMove" in clientIndex, false, "CL_SendMove is an unused original header declaration without a C definition");
assert.equal("CL_ReadFromServer" in clientIndex, false, "CL_ReadFromServer is an unused original header declaration without a C definition");
assert.equal("CL_WriteToServer" in clientIndex, false, "CL_WriteToServer is an unused original header declaration without a C definition");
assert.equal("CL_InitPrediction" in clientIndex, false, "CL_InitPrediction is an unused original header declaration without a C definition");
assert.equal("CL_PredictMove" in clientIndex, false, "CL_PredictMove is an unused original header declaration without a C definition");
assert.equal("CL_KeyInventory" in clientIndex, false, "CL_KeyInventory is an unused original header declaration without a C definition");
assert.equal("x86_TimerStart" in clientIndex, false, "x86_TimerStart is an x86 profiling helper excluded from the browser runtime");
assert.equal("x86_TimerStop" in clientIndex, false, "x86_TimerStop is an x86 profiling helper excluded from the browser runtime");
assert.equal("x86_TimerInit" in clientIndex, false, "x86_TimerInit is an x86 profiling helper excluded from the browser runtime");
assert.equal("x86_TimerGetHistogram" in clientIndex, false, "x86_TimerGetHistogram is an x86 profiling helper excluded from the browser runtime");

assert.equal(connstate_t.ca_uninitialized, 0, "connstate_t ca_uninitialized mismatch");
assert.equal(connstate_t.ca_disconnected, 1, "connstate_t ca_disconnected mismatch");
assert.equal(connstate_t.ca_connecting, 2, "connstate_t ca_connecting mismatch");
assert.equal(connstate_t.ca_connected, 3, "connstate_t ca_connected mismatch");
assert.equal(connstate_t.ca_active, 4, "connstate_t ca_active mismatch");

assert.equal(dltype_t.dl_none, 0, "dltype_t dl_none mismatch");
assert.equal(dltype_t.dl_model, 1, "dltype_t dl_model mismatch");
assert.equal(dltype_t.dl_sound, 2, "dltype_t dl_sound mismatch");
assert.equal(dltype_t.dl_skin, 3, "dltype_t dl_skin mismatch");
assert.equal(dltype_t.dl_single, 4, "dltype_t dl_single mismatch");

assert.equal(keydest_t.key_game, 0, "keydest_t key_game mismatch");
assert.equal(keydest_t.key_console, 1, "keydest_t key_console mismatch");
assert.equal(keydest_t.key_message, 2, "keydest_t key_message mismatch");
assert.equal(keydest_t.key_menu, 3, "keydest_t key_menu mismatch");

const frame = createFrame();
assert.equal(frame.valid, false, "createFrame valid mismatch");
assert.equal(frame.serverframe, 0, "createFrame serverframe mismatch");
assert.equal(frame.servertime, 0, "createFrame servertime mismatch");
assert.equal(frame.deltaframe, 0, "createFrame deltaframe mismatch");
assert.equal(frame.areabits.length, MAX_MAP_AREAS / 8, "createFrame areabits length mismatch");
assert.equal(frame.num_entities, 0, "createFrame num_entities mismatch");
assert.equal(frame.parse_entities, 0, "createFrame parse_entities mismatch");

const centity = createCentity();
assert.equal(centity.serverframe, 0, "createCentity serverframe mismatch");
assert.deepEqual(centity.lerp_origin, [0, 0, 0], "createCentity lerp_origin mismatch");
assert.equal(centity.trailcount, 0, "createCentity trailcount mismatch");
assert.equal(centity.fly_stoptime, 0, "createCentity fly_stoptime mismatch");

const clientInfo = createClientinfo();
assert.equal(clientInfo.name, "", "createClientinfo name mismatch");
assert.equal(clientInfo.cinfo, "", "createClientinfo cinfo mismatch");
assert.equal(clientInfo.skin, null, "createClientinfo skin handle mismatch");
assert.equal(clientInfo.icon, null, "createClientinfo icon handle mismatch");
assert.equal(clientInfo.iconname, "", "createClientinfo iconname mismatch");
assert.equal(clientInfo.model, null, "createClientinfo model handle mismatch");
assert.equal(clientInfo.weaponmodel.length, MAX_CLIENTWEAPONMODELS, "createClientinfo weaponmodel length mismatch");
assert.equal(clientInfo.weaponmodel_paths.length, MAX_CLIENTWEAPONMODELS, "createClientinfo weaponmodel_paths length mismatch");
assert.equal(clientInfo.valid, false, "createClientinfo valid mismatch");

const button = createKbutton();
assert.deepEqual(button.down, [0, 0], "createKbutton down mismatch");
assert.equal(button.downtime, 0, "createKbutton downtime mismatch");
assert.equal(button.msec, 0, "createKbutton msec mismatch");
assert.equal(button.state, 0, "createKbutton state mismatch");

const clientState = createClientState();
assert.equal(clientState.timeoutcount, 0, "createClientState timeoutcount mismatch");
assert.equal(clientState.timedemo_frames, 0, "createClientState timedemo_frames mismatch");
assert.equal(clientState.timedemo_start, 0, "createClientState timedemo_start mismatch");
assert.equal(clientState.refresh_prepped, false, "createClientState refresh_prepped mismatch");
assert.equal(clientState.sound_prepped, false, "createClientState sound_prepped mismatch");
assert.equal(clientState.force_refdef, false, "createClientState force_refdef mismatch");
assert.equal(clientState.parse_entities, 0, "createClientState parse_entities mismatch");
assert.equal(clientState.cmds.length, CMD_BACKUP, "createClientState cmds length mismatch");
assert.equal(clientState.cmd_time.length, CMD_BACKUP, "createClientState cmd_time length mismatch");
assert.equal(clientState.predicted_origins.length, CMD_BACKUP, "createClientState predicted_origins length mismatch");
assert.equal(clientState.predicted_step, 0, "createClientState predicted_step mismatch");
assert.equal(clientState.predicted_step_time, 0, "createClientState predicted_step_time mismatch");
assert.deepEqual(clientState.predicted_origin, [0, 0, 0], "createClientState predicted_origin mismatch");
assert.deepEqual(clientState.predicted_angles, [0, 0, 0], "createClientState predicted_angles mismatch");
assert.deepEqual(clientState.prediction_error, [0, 0, 0], "createClientState prediction_error mismatch");
assert.equal(clientState.frame.valid, false, "createClientState frame validity mismatch");
assert.equal(clientState.surpressCount, 0, "createClientState surpressCount mismatch");
assert.equal(clientState.frames.length, UPDATE_BACKUP, "createClientState frames length mismatch");
assert.deepEqual(clientState.viewangles, [0, 0, 0], "createClientState viewangles mismatch");
assert.equal(clientState.time, 0, "createClientState time mismatch");
assert.equal(clientState.lerpfrac, 0, "createClientState lerpfrac mismatch");
assert.equal(clientState.layout, "", "createClientState layout mismatch");
assert.equal(clientState.inventory.length, MAX_ITEMS, "createClientState inventory length mismatch");
assert.equal(clientState.attractloop, false, "createClientState attractloop mismatch");
assert.equal(clientState.servercount, 0, "createClientState servercount mismatch");
assert.equal(clientState.gamedir, "", "createClientState gamedir mismatch");
assert.equal(clientState.playernum, 0, "createClientState playernum mismatch");
assert.equal(clientState.configstrings.length, MAX_CONFIGSTRINGS, "createClientState configstrings length mismatch");
assert.equal(clientState.model_draw.length, MAX_MODELS, "createClientState model_draw length mismatch");
assert.equal(clientState.model_clip.length, MAX_MODELS, "createClientState model_clip length mismatch");
assert.equal(clientState.sound_precache.length, MAX_SOUNDS, "createClientState sound_precache length mismatch");
assert.equal(clientState.image_precache.length, MAX_IMAGES, "createClientState image_precache length mismatch");
assert.equal(clientState.dlights.length, MAX_DLIGHTS, "createClientState dlights length mismatch");
assert.equal(clientState.particles.length, MAX_PARTICLES, "createClientState particles length mismatch");
assert.equal(clientState.cl_weaponmodels[0], "weapon.md2", "createClientState default weapon model mismatch");
assert.equal(clientState.num_cl_weaponmodels, 1, "createClientState num_cl_weaponmodels mismatch");
assert.equal(clientState.clientinfo.length, MAX_CLIENTS, "createClientState clientinfo length mismatch");
assert.equal(clientState.baseclientinfo.name, "", "createClientState baseclientinfo name mismatch");
assert.equal(clientState.tents.sustains.length, MAX_SUSTAINS, "createClientState sustains length mismatch");

const clientStatic = createClientStatic();
assert.equal(clientStatic.state, connstate_t.ca_disconnected, "createClientStatic state mismatch");
assert.equal(clientStatic.realtime, 0, "createClientStatic realtime mismatch");
assert.equal(clientStatic.frametime, 0, "createClientStatic frametime mismatch");
assert.equal(clientStatic.framecount, 0, "createClientStatic framecount mismatch");
assert.equal(clientStatic.disable_screen, 0, "createClientStatic disable_screen mismatch");
assert.equal(clientStatic.disable_servercount, 0, "createClientStatic disable_servercount mismatch");
assert.equal(clientStatic.servername, "", "createClientStatic servername mismatch");
assert.equal(clientStatic.connect_time, 0, "createClientStatic connect_time mismatch");
assert.equal(clientStatic.quakePort, 0, "createClientStatic quakePort mismatch");
assert.equal(clientStatic.serverProtocol, 0, "createClientStatic serverProtocol mismatch");
assert.equal(clientStatic.challenge, 0, "createClientStatic challenge mismatch");
assert.equal(clientStatic.download, null, "createClientStatic download handle mismatch");
assert.equal(clientStatic.downloadtempname, "", "createClientStatic downloadtempname mismatch");
assert.equal(clientStatic.downloadname, "", "createClientStatic downloadname mismatch");
assert.equal(clientStatic.downloadnumber, 0, "createClientStatic downloadnumber mismatch");
assert.equal(clientStatic.downloadtype, dltype_t.dl_none, "createClientStatic downloadtype mismatch");
assert.equal(clientStatic.downloadpercent, 0, "createClientStatic downloadpercent mismatch");
assert.equal(clientStatic.demorecording, false, "createClientStatic demorecording mismatch");
assert.equal(clientStatic.demowaiting, false, "createClientStatic demowaiting mismatch");
assert.equal(clientStatic.demofile, null, "createClientStatic demofile mismatch");
assert.equal(clientStatic.netchan.message.maxsize, 1384, "createClientStatic netchan message size mismatch");
assert.equal(clientStatic.precache.precache_check, 0, "createClientStatic precache_check mismatch");
assert.equal("key_dest" in clientStatic, false, "client_static_t key_dest should remain split into keys.ts");

const runtime = createClientRuntime();
assert.equal(runtime.cl_parse_entities.length, MAX_PARSE_ENTITIES, "createClientRuntime parse_entities length mismatch");
assert.equal(runtime.cl_entities.length, MAX_EDICTS, "createClientRuntime entities length mismatch");
assert.equal(runtime.cls.downloadtype, dltype_t.dl_none, "createClientRuntime persistent downloadtype mismatch");
assert.equal(runtime.net_message.maxsize, 65536, "createClientRuntime net_message size mismatch");

console.log("quake2-client-header: ok");
