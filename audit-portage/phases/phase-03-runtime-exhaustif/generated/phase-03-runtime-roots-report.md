# Rapport racines runtime Phase 03.C

Ce rapport est genere depuis les index de symboles et graphes d'appels Phase 03. Il etablit une atteignabilite statique indicative, a verifier ensuite manuellement sur les chemins critiques.

## Resume

- Racines analysees : 12
- Racines tracees C et TS : 11
- Racines avec findings : 12
- Aretes callgraph C : 6408
- Aretes callgraph TS : 9000
- Fonctions C atteignables depuis au moins une racine : 648
- Fonctions TS atteignables depuis au moins une racine : 562
- Fonctions C non atteintes par ces racines : 1791
- Fonctions TS non atteintes par ces racines : 2458

## Racines

| Racine | Statut | C atteignables | TS atteignables | Fichiers C | Fichiers TS | Source-only | TS-only | Findings |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Qcommon_Frame | traced-c-and-ts | 590 | 28 | 75 | 10 | 570 | 8 | source-only-reachable-functions:570<br>ts-only-reachable-functions:8 |
| SV_Frame | traced-c-and-ts | 434 | 89 | 74 | 21 | 375 | 30 | source-only-reachable-functions:375<br>ts-only-reachable-functions:30 |
| SV_RunGameFrame | blocked-no-ts-calls | 10 | 1 | 21 | 1 | 9 | 0 | ts-root-has-no-extracted-outgoing-calls<br>source-only-reachable-functions:9 |
| G_RunFrame | traced-c-and-ts | 127 | 236 | 47 | 56 | 30 | 139 | source-only-reachable-functions:30<br>ts-only-reachable-functions:139 |
| ClientThink | traced-c-and-ts | 88 | 138 | 45 | 48 | 29 | 78 | source-only-reachable-functions:29<br>ts-only-reachable-functions:78 |
| ClientBeginServerFrame | traced-c-and-ts | 80 | 135 | 44 | 46 | 31 | 86 | source-only-reachable-functions:31<br>ts-only-reachable-functions:86 |
| CL_Frame | traced-c-and-ts | 434 | 50 | 55 | 14 | 396 | 12 | source-only-reachable-functions:396<br>ts-only-reachable-functions:12 |
| CL_SendCommand | traced-c-and-ts | 267 | 48 | 52 | 13 | 230 | 11 | source-only-reachable-functions:230<br>ts-only-reachable-functions:11 |
| CL_SendCmd | traced-c-and-ts | 250 | 40 | 52 | 16 | 221 | 11 | source-only-reachable-functions:221<br>ts-only-reachable-functions:11 |
| CL_ReadPackets | traced-c-and-ts | 370 | 212 | 52 | 58 | 247 | 89 | source-only-reachable-functions:247<br>ts-only-reachable-functions:89 |
| CL_ParseServerMessage | traced-c-and-ts | 350 | 165 | 52 | 51 | 259 | 74 | source-only-reachable-functions:259<br>ts-only-reachable-functions:74 |
| PMove | traced-c-and-ts | 38 | 36 | 26 | 17 | 10 | 8 | source-only-reachable-functions:10<br>ts-only-reachable-functions:8 |

## Echantillons Source-only

### Qcommon_Frame

Add_Ammo, AngleVectors, ArmorIndex, AttackFinished, BigShort, CDAudio_Play, CDAudio_Shutdown, CDAudio_Stop, CDAudio_Update, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddNetgraph, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_AdjustAngles, CL_AllocDlight, CL_AllocExplosion, CL_BFGExplosionParticles, CL_BaseMove, CL_BfgParticles, CL_BigTeleportParticles, CL_BlasterParticles, CL_BlasterParticles2, CL_BlasterTrail, CL_BlasterTrail2, CL_BubbleTrail, CL_BubbleTrail2, CL_CalcViewValues, CL_CheckForResend, CL_CheckOrDownloadFile, CL_CheckPredictionError, CL_ClampPitch, CL_ClearDlights, CL_ClearEffects, CL_ClearLightStyles, CL_ClearParticles, CL_ClearState, CL_ClearTEnts, CL_ColorExplosionParticles, CL_ColorFlash, CL_ConnectionlessPacket, CL_CreateCmd, CL_DebugTrail, CL_DeltaEntity, CL_DiminishingTrail, CL_Disconnect, CL_DownloadFileName, CL_DrawInventory, CL_Drop, CL_EntityEvent, CL_ExplosionParticles, CL_FinishMove, CL_FireEntityEvents, CL_FixCvarCheats, CL_FixUpGender, CL_FlagTrail, CL_Flashlight, CL_FlyEffect, CL_FlyParticles, CL_ForceWall, CL_Frame, CL_GetEntitySoundOrigin, CL_Heatbeam, CL_IonripperTrail, CL_ItemRespawnParticles, CL_KeyState, CL_LoadClientinfo, CL_LogoutEffect, CL_MonsterPlasma_Shell, CL_ParseBaseline, CL_ParseBeam, CL_ParseBeam2, CL_ParseClientinfo

### SV_Frame

Add_Ammo, AngleVectors, ArmorIndex, AttackFinished, CDAudio_Shutdown, CDAudio_Stop, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_BfgParticles, CL_BlasterTrail, CL_BlasterTrail2, CL_CalcViewValues, CL_ClearDlights, CL_ClearEffects, CL_ClearLightStyles, CL_ClearParticles, CL_ClearState, CL_ClearTEnts, CL_DiminishingTrail, CL_Disconnect, CL_DrawInventory, CL_Drop, CL_FlagTrail, CL_FlyEffect, CL_FlyParticles, CL_Heatbeam, CL_IonripperTrail, CL_MonsterPlasma_Shell, CL_ProcessSustain, CL_RegisterSounds, CL_RegisterTEntSounds, CL_RocketTrail, CL_Shutdown, CL_Snd_Restart_f, CL_Stop_f, CL_TagTrail, CL_TrackerTrail, CL_Tracker_Shell, CL_TrapParticles, CL_WriteConfiguration, CM_AreasConnected, CM_BoxLeafnums, CM_BoxLeafnums_headnode, CM_BoxLeafnums_r, CM_ClusterPHS, CM_ClusterPVS, CM_DecompressVis, CM_HeadnodeVisible, CM_LeafArea, CM_LeafCluster, CM_NumClusters, CM_PointLeafnum, CM_PointLeafnum_r, CM_WriteAreaBits, COM_BlockSequenceCRCByte, CRC_Block, CRC_Init, CalcFov, CanDamage, Cbuf_AddText, Cbuf_InsertText, ChangeWeapon, ChaseNext, ChasePrev, CheckArmor, CheckPowerArmor, CheckTeamDamage, ClientCommand, ClientObituary, ClientTeam, ClientThink

### SV_RunGameFrame

Com_Printf, Com_sprintf, Con_Linefeed, Con_Print, FS_Gamedir, Sys_ConsoleOutput, Sys_Milliseconds, memset, strncpy

### G_RunFrame

AttackFinished, ClientUserinfoChanged, Com_Printf, Com_sprintf, Con_Linefeed, Con_Print, Drop_Item, FS_Gamedir, FoundTarget, G_PickTarget, G_ProjectSource, G_UseTargets, HuntTarget, Info_Validate, M_ReactToDamage, Sys_ConsoleOutput, VectorCopy, VectorNormalize, VectorScale, VectorSubtract, _stricmp, memcpy, memset, monster_death_use, sqrt, strcmp, strcpy, strncpy, va, vtos

### ClientThink

AttackFinished, Com_DPrintf, Com_Printf, Com_sprintf, Con_Linefeed, Con_Print, Drop_Item, FS_Gamedir, FoundTarget, G_Find, G_InitEdict, G_PickTarget, G_ProjectSource, G_Spawn, G_UseTargets, HuntTarget, M_ReactToDamage, Sys_ConsoleOutput, VectorSubtract, _stricmp, memset, monster_death_use, sqrt, strcmp, strcpy, strncpy, vectoyaw, visible, vtos

### ClientBeginServerFrame

AttackFinished, ClientUserinfoChanged, Com_Printf, Com_sprintf, Con_Linefeed, Con_Print, Drop_Item, FS_Gamedir, FoundTarget, G_PickTarget, G_ProjectSource, G_UseTargets, HuntTarget, Info_Validate, M_ReactToDamage, Sys_ConsoleOutput, VectorCopy, VectorMA, VectorNormalize, VectorScale, VectorSubtract, _stricmp, memcpy, memset, monster_death_use, sqrt, strcmp, strcpy, strncpy, va, vtos

### CL_Frame

AngleVectors, BigShort, CDAudio_Play, CDAudio_Shutdown, CDAudio_Stop, CDAudio_Update, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddNetgraph, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_AdjustAngles, CL_AllocDlight, CL_AllocExplosion, CL_BFGExplosionParticles, CL_BaseMove, CL_BfgParticles, CL_BigTeleportParticles, CL_BlasterParticles, CL_BlasterParticles2, CL_BlasterTrail, CL_BlasterTrail2, CL_BubbleTrail, CL_BubbleTrail2, CL_CalcViewValues, CL_CheckOrDownloadFile, CL_CheckPredictionError, CL_ClampPitch, CL_ClearDlights, CL_ClearEffects, CL_ClearLightStyles, CL_ClearParticles, CL_ClearState, CL_ClearTEnts, CL_ColorExplosionParticles, CL_ColorFlash, CL_ConnectionlessPacket, CL_CreateCmd, CL_DebugTrail, CL_DeltaEntity, CL_DiminishingTrail, CL_Disconnect, CL_DownloadFileName, CL_DrawInventory, CL_Drop, CL_EntityEvent, CL_ExplosionParticles, CL_FinishMove, CL_FireEntityEvents, CL_FixUpGender, CL_FlagTrail, CL_Flashlight, CL_FlyEffect, CL_FlyParticles, CL_ForceWall, CL_GetEntitySoundOrigin, CL_Heatbeam, CL_IonripperTrail, CL_ItemRespawnParticles, CL_KeyState, CL_LoadClientinfo, CL_LogoutEffect, CL_MonsterPlasma_Shell, CL_ParseBaseline, CL_ParseBeam, CL_ParseBeam2, CL_ParseClientinfo, CL_ParseConfigString, CL_ParseDelta, CL_ParseDownload, CL_ParseEntityBits, CL_ParseFrame, CL_ParseInventory

### CL_SendCommand

AngleVectors, BigShort, CDAudio_Shutdown, CDAudio_Stop, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_AdjustAngles, CL_BaseMove, CL_BfgParticles, CL_BlasterTrail, CL_BlasterTrail2, CL_CalcViewValues, CL_ClampPitch, CL_ClearDlights, CL_ClearEffects, CL_ClearLightStyles, CL_ClearParticles, CL_ClearState, CL_ClearTEnts, CL_CreateCmd, CL_DiminishingTrail, CL_Disconnect, CL_DrawInventory, CL_Drop, CL_FinishMove, CL_FixUpGender, CL_FlagTrail, CL_FlyEffect, CL_FlyParticles, CL_Heatbeam, CL_IonripperTrail, CL_KeyState, CL_MonsterPlasma_Shell, CL_ProcessSustain, CL_RegisterSounds, CL_RegisterTEntSounds, CL_RocketTrail, CL_SendCmd, CL_Shutdown, CL_Snd_Restart_f, CL_Stop_f, CL_TagTrail, CL_TrackerTrail, CL_Tracker_Shell, CL_TrapParticles, CL_WriteConfiguration, COM_BlockSequenceCRCByte, CRC_Block, CRC_Init, CalcFov, Cmd_AddCommand, Cmd_CompleteCommand, Cmd_RemoveCommand, Com_BlockChecksum, Com_DPrintf, Com_Error, Com_PageInMemory, Com_Printf, Com_ServerState, Com_SetServerState, Com_sprintf, CompleteCommand, Con_CheckResize, Con_ClearNotify, Con_DrawConsole, Con_DrawInput, Con_DrawNotify, Con_Linefeed, Con_Print, Con_ToggleConsole_f, CopyString

### CL_SendCmd

AngleVectors, CDAudio_Shutdown, CDAudio_Stop, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_BfgParticles, CL_BlasterTrail, CL_BlasterTrail2, CL_CalcViewValues, CL_ClearDlights, CL_ClearEffects, CL_ClearLightStyles, CL_ClearParticles, CL_ClearState, CL_ClearTEnts, CL_DiminishingTrail, CL_Disconnect, CL_DrawInventory, CL_Drop, CL_FixUpGender, CL_FlagTrail, CL_FlyEffect, CL_FlyParticles, CL_Heatbeam, CL_IonripperTrail, CL_MonsterPlasma_Shell, CL_ProcessSustain, CL_RegisterSounds, CL_RegisterTEntSounds, CL_RocketTrail, CL_Shutdown, CL_Snd_Restart_f, CL_Stop_f, CL_TagTrail, CL_TrackerTrail, CL_Tracker_Shell, CL_TrapParticles, CL_WriteConfiguration, COM_Parse, CalcFov, Cbuf_AddText, Cmd_AddCommand, Cmd_CompleteCommand, Cmd_RemoveCommand, Com_BlockChecksum, Com_DPrintf, Com_Error, Com_PageInMemory, Com_Printf, Com_ServerState, Com_SetServerState, Com_sprintf, CompleteCommand, Con_CheckResize, Con_ClearNotify, Con_DrawConsole, Con_DrawInput, Con_DrawNotify, Con_Linefeed, Con_Print, Con_ToggleConsole_f, CopyString, Cvar_CompleteVariable, Cvar_FindVar, Cvar_FullSet, Cvar_Get, Cvar_InfoValidate, Cvar_Set, Cvar_Set2, Cvar_SetValue, Cvar_VariableString

### CL_ReadPackets

AngleVectors, BigShort, CDAudio_Play, CDAudio_Shutdown, CDAudio_Stop, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_BfgParticles, CL_BlasterTrail, CL_BlasterTrail2, CL_CalcViewValues, CL_CheckOrDownloadFile, CL_DiminishingTrail, CL_DownloadFileName, CL_DrawInventory, CL_Drop, CL_EntityEvent, CL_FlagTrail, CL_FlyEffect, CL_FlyParticles, CL_Heatbeam, CL_IonripperTrail, CL_ItemRespawnParticles, CL_LogoutEffect, CL_MonsterPlasma_Shell, CL_PrepRefresh, CL_ProcessSustain, CL_RegisterSounds, CL_RegisterTEntModels, CL_RegisterTEntSounds, CL_RequestNextDownload, CL_RocketTrail, CL_Shutdown, CL_Snd_Restart_f, CL_TagTrail, CL_TeleporterParticles, CL_TrackerTrail, CL_Tracker_Shell, CL_TrapParticles, CL_WriteConfiguration, CL_WriteDemoMessage, CM_InitBoxHull, CM_InlineModel, CM_LoadMap, CMod_LoadAreaPortals, CMod_LoadAreas, CMod_LoadBrushSides, CMod_LoadBrushes, CMod_LoadEntityString, CMod_LoadLeafBrushes, CMod_LoadLeafs, CMod_LoadNodes, CMod_LoadPlanes, CMod_LoadSubmodels, CMod_LoadSurfaces, CMod_LoadVisibility, COM_StripExtension, CalcFov, Cbuf_Execute, Cbuf_InsertText, Cmd_AddCommand, Cmd_Argc, Cmd_Args, Cmd_CompleteCommand, Cmd_ExecuteString, Cmd_ForwardToServer, Cmd_RemoveCommand, Com_BlockChecksum, Com_DPrintf, Com_Error, Com_PageInMemory

### CL_ParseServerMessage

AngleVectors, CDAudio_Play, CDAudio_Shutdown, CDAudio_Stop, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_BfgParticles, CL_BlasterTrail, CL_BlasterTrail2, CL_CalcViewValues, CL_CheckOrDownloadFile, CL_DiminishingTrail, CL_Disconnect, CL_DownloadFileName, CL_DrawInventory, CL_Drop, CL_EntityEvent, CL_FlagTrail, CL_FlyEffect, CL_FlyParticles, CL_Heatbeam, CL_IonripperTrail, CL_ItemRespawnParticles, CL_LogoutEffect, CL_MonsterPlasma_Shell, CL_PrepRefresh, CL_ProcessSustain, CL_RegisterSounds, CL_RegisterTEntModels, CL_RegisterTEntSounds, CL_RequestNextDownload, CL_RocketTrail, CL_Shutdown, CL_Snd_Restart_f, CL_Stop_f, CL_TagTrail, CL_TeleporterParticles, CL_TrackerTrail, CL_Tracker_Shell, CL_TrapParticles, CL_WriteConfiguration, CL_WriteDemoMessage, CM_InitBoxHull, CM_InlineModel, CM_LoadMap, CMod_LoadAreaPortals, CMod_LoadAreas, CMod_LoadBrushSides, CMod_LoadBrushes, CMod_LoadEntityString, CMod_LoadLeafBrushes, CMod_LoadLeafs, CMod_LoadNodes, CMod_LoadPlanes, CMod_LoadSubmodels, CMod_LoadSurfaces, CMod_LoadVisibility, COM_Parse, COM_StripExtension, CalcFov, Cbuf_AddText, Cbuf_Execute, Cbuf_InsertText, Cmd_AddCommand, Cmd_Argc, Cmd_Args, Cmd_Argv, Cmd_CompleteCommand, Cmd_ExecuteString, Cmd_ForwardToServer, Cmd_MacroExpandString

### PMove

Com_DPrintf, Com_Printf, Com_sprintf, Con_Linefeed, Con_Print, FS_Gamedir, Sys_ConsoleOutput, memset, sqrt, strncpy

