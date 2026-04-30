# Rapport racines runtime Phase 03.C

Ce rapport est genere depuis les index de symboles et graphes d'appels Phase 03. Il etablit une atteignabilite statique indicative, a verifier ensuite manuellement sur les chemins critiques.

## Resume

- Racines analysees : 12
- Racines tracees C et TS : 10
- Racines avec findings : 12
- Aretes callgraph C : 6529
- Aretes callgraph TS : 8345
- Fonctions C atteignables depuis au moins une racine : 648
- Fonctions TS atteignables depuis au moins une racine : 521
- Fonctions C non atteintes par ces racines : 1791
- Fonctions TS non atteintes par ces racines : 2380

## Racines

| Racine | Statut | C atteignables | TS atteignables | Fichiers C | Fichiers TS | Source-only | TS-only | Findings |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Qcommon_Frame | blocked-no-ts-calls | 590 | 1 | 75 | 1 | 589 | 0 | ts-root-has-no-extracted-outgoing-calls<br>source-only-reachable-functions:589 |
| SV_Frame | traced-c-and-ts | 434 | 82 | 74 | 21 | 379 | 27 | source-only-reachable-functions:379<br>ts-only-reachable-functions:27 |
| SV_RunGameFrame | blocked-no-ts-calls | 10 | 1 | 21 | 1 | 9 | 0 | ts-root-has-no-extracted-outgoing-calls<br>source-only-reachable-functions:9 |
| G_RunFrame | traced-c-and-ts | 127 | 206 | 47 | 51 | 37 | 116 | source-only-reachable-functions:37<br>ts-only-reachable-functions:116 |
| ClientThink | traced-c-and-ts | 88 | 90 | 45 | 26 | 49 | 51 | source-only-reachable-functions:49<br>ts-only-reachable-functions:51 |
| ClientBeginServerFrame | traced-c-and-ts | 80 | 95 | 44 | 30 | 50 | 65 | source-only-reachable-functions:50<br>ts-only-reachable-functions:65 |
| CL_Frame | traced-c-and-ts | 434 | 47 | 55 | 14 | 400 | 13 | source-only-reachable-functions:400<br>ts-only-reachable-functions:13 |
| CL_SendCommand | traced-c-and-ts | 267 | 45 | 52 | 13 | 234 | 12 | source-only-reachable-functions:234<br>ts-only-reachable-functions:12 |
| CL_SendCmd | traced-c-and-ts | 250 | 39 | 52 | 15 | 221 | 10 | source-only-reachable-functions:221<br>ts-only-reachable-functions:10 |
| CL_ReadPackets | traced-c-and-ts | 370 | 201 | 52 | 55 | 253 | 84 | source-only-reachable-functions:253<br>ts-only-reachable-functions:84 |
| CL_ParseServerMessage | traced-c-and-ts | 350 | 160 | 52 | 48 | 260 | 70 | source-only-reachable-functions:260<br>ts-only-reachable-functions:70 |
| PMove | traced-c-and-ts | 38 | 36 | 26 | 17 | 10 | 8 | source-only-reachable-functions:10<br>ts-only-reachable-functions:8 |

## Echantillons Source-only

### Qcommon_Frame

Add_Ammo, AngleVectors, ArmorIndex, AttackFinished, BigShort, CDAudio_Play, CDAudio_Shutdown, CDAudio_Stop, CDAudio_Update, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddNetgraph, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_AdjustAngles, CL_AllocDlight, CL_AllocExplosion, CL_BFGExplosionParticles, CL_BaseMove, CL_BfgParticles, CL_BigTeleportParticles, CL_BlasterParticles, CL_BlasterParticles2, CL_BlasterTrail, CL_BlasterTrail2, CL_BubbleTrail, CL_BubbleTrail2, CL_CalcViewValues, CL_CheckForResend, CL_CheckOrDownloadFile, CL_CheckPredictionError, CL_ClampPitch, CL_ClearDlights, CL_ClearEffects, CL_ClearLightStyles, CL_ClearParticles, CL_ClearState, CL_ClearTEnts, CL_ColorExplosionParticles, CL_ColorFlash, CL_ConnectionlessPacket, CL_CreateCmd, CL_DebugTrail, CL_DeltaEntity, CL_DiminishingTrail, CL_Disconnect, CL_DownloadFileName, CL_DrawInventory, CL_Drop, CL_EntityEvent, CL_ExplosionParticles, CL_FinishMove, CL_FireEntityEvents, CL_FixCvarCheats, CL_FixUpGender, CL_FlagTrail, CL_Flashlight, CL_FlyEffect, CL_FlyParticles, CL_ForceWall, CL_Frame, CL_GetEntitySoundOrigin, CL_Heatbeam, CL_IonripperTrail, CL_ItemRespawnParticles, CL_KeyState, CL_LoadClientinfo, CL_LogoutEffect, CL_MonsterPlasma_Shell, CL_ParseBaseline, CL_ParseBeam, CL_ParseBeam2, CL_ParseClientinfo

### SV_Frame

Add_Ammo, AngleVectors, ArmorIndex, AttackFinished, CDAudio_Shutdown, CDAudio_Stop, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_BfgParticles, CL_BlasterTrail, CL_BlasterTrail2, CL_CalcViewValues, CL_ClearDlights, CL_ClearEffects, CL_ClearLightStyles, CL_ClearParticles, CL_ClearState, CL_ClearTEnts, CL_DiminishingTrail, CL_Disconnect, CL_DrawInventory, CL_Drop, CL_FlagTrail, CL_FlyEffect, CL_FlyParticles, CL_Heatbeam, CL_IonripperTrail, CL_MonsterPlasma_Shell, CL_ProcessSustain, CL_RegisterSounds, CL_RegisterTEntSounds, CL_RocketTrail, CL_Shutdown, CL_Snd_Restart_f, CL_Stop_f, CL_TagTrail, CL_TrackerTrail, CL_Tracker_Shell, CL_TrapParticles, CL_WriteConfiguration, CM_AreasConnected, CM_BoxLeafnums, CM_BoxLeafnums_headnode, CM_BoxLeafnums_r, CM_ClusterPHS, CM_ClusterPVS, CM_DecompressVis, CM_HeadnodeVisible, CM_LeafArea, CM_LeafCluster, CM_NumClusters, CM_PointLeafnum, CM_PointLeafnum_r, CM_WriteAreaBits, COM_BlockSequenceCRCByte, COM_Parse, CRC_Block, CRC_Init, CalcFov, CanDamage, Cbuf_AddText, Cbuf_InsertText, ChangeWeapon, ChaseNext, ChasePrev, CheckArmor, CheckPowerArmor, CheckTeamDamage, ClientCommand, ClientObituary, ClientTeam

### SV_RunGameFrame

Com_Printf, Com_sprintf, Con_Linefeed, Con_Print, FS_Gamedir, Sys_ConsoleOutput, Sys_Milliseconds, memset, strncpy

### G_RunFrame

AttackFinished, CanDamage, ClientUserinfoChanged, Com_Printf, Com_sprintf, Con_Linefeed, Con_Print, Drop_Item, FS_Gamedir, FoundTarget, G_PickTarget, G_ProjectSource, G_UseTargets, Grenade_Explode, HuntTarget, Info_Validate, M_ReactToDamage, Q_stricmp, Sys_ConsoleOutput, T_RadiusDamage, VectorCopy, VectorNormalize, VectorScale, VectorSubtract, _stricmp, findradius, fire_grenade2, memcpy, memset, monster_death_use, sqrt, strcmp, strcpy, strncpy, va, vectoangles, vtos

### ClientThink

ArmorIndex, AttackFinished, CanDamage, CheckArmor, CheckPowerArmor, CheckTeamDamage, ClientTeam, Com_DPrintf, Com_Printf, Com_sprintf, Con_Linefeed, Con_Print, Drop_Item, FS_Gamedir, FoundTarget, G_Find, G_FreeEdict, G_InitEdict, G_PickTarget, G_ProjectSource, G_Spawn, G_UseTargets, GetItemByIndex, Grenade_Explode, HuntTarget, Info_ValueForKey, Killed, M_ReactToDamage, OnSameTeam, PowerArmorType, Q_stricmp, SpawnDamage, Sys_ConsoleOutput, T_Damage, T_RadiusDamage, VectorSubtract, _stricmp, findradius, fire_grenade2, memset, monster_death_use, sqrt, strcmp, strcpy, strncpy, vectoangles, vectoyaw, visible, vtos

### ClientBeginServerFrame

ArmorIndex, AttackFinished, CanDamage, CheckArmor, CheckPowerArmor, CheckTeamDamage, ClientTeam, ClientUserinfoChanged, Com_Printf, Com_sprintf, Con_Linefeed, Con_Print, Drop_Item, FS_Gamedir, FoundTarget, G_PickTarget, G_ProjectSource, G_UseTargets, Grenade_Explode, HuntTarget, Info_Validate, Killed, M_ReactToDamage, OnSameTeam, PlayerNoise, PowerArmorType, Q_stricmp, SpawnDamage, Sys_ConsoleOutput, T_Damage, T_RadiusDamage, VectorCopy, VectorLength, VectorMA, VectorNormalize, VectorScale, VectorSubtract, _stricmp, findradius, fire_grenade2, memcpy, memset, monster_death_use, sqrt, strcmp, strcpy, strncpy, va, vectoangles, vtos

### CL_Frame

AngleVectors, BigShort, CDAudio_Play, CDAudio_Shutdown, CDAudio_Stop, CDAudio_Update, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddNetgraph, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_AdjustAngles, CL_AllocDlight, CL_AllocExplosion, CL_BFGExplosionParticles, CL_BaseMove, CL_BfgParticles, CL_BigTeleportParticles, CL_BlasterParticles, CL_BlasterParticles2, CL_BlasterTrail, CL_BlasterTrail2, CL_BubbleTrail, CL_BubbleTrail2, CL_CalcViewValues, CL_CheckOrDownloadFile, CL_CheckPredictionError, CL_ClampPitch, CL_ClearDlights, CL_ClearEffects, CL_ClearLightStyles, CL_ClearParticles, CL_ClearState, CL_ClearTEnts, CL_ColorExplosionParticles, CL_ColorFlash, CL_ConnectionlessPacket, CL_CreateCmd, CL_DebugTrail, CL_DeltaEntity, CL_DiminishingTrail, CL_Disconnect, CL_DownloadFileName, CL_DrawInventory, CL_Drop, CL_EntityEvent, CL_ExplosionParticles, CL_FinishMove, CL_FireEntityEvents, CL_FixUpGender, CL_FlagTrail, CL_Flashlight, CL_FlyEffect, CL_FlyParticles, CL_ForceWall, CL_GetEntitySoundOrigin, CL_Heatbeam, CL_IonripperTrail, CL_ItemRespawnParticles, CL_KeyState, CL_LoadClientinfo, CL_LogoutEffect, CL_MonsterPlasma_Shell, CL_ParseBaseline, CL_ParseBeam, CL_ParseBeam2, CL_ParseClientinfo, CL_ParseConfigString, CL_ParseDelta, CL_ParseDownload, CL_ParseEntityBits, CL_ParseFrame, CL_ParseInventory

### CL_SendCommand

AngleVectors, BigShort, CDAudio_Shutdown, CDAudio_Stop, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_AdjustAngles, CL_BaseMove, CL_BfgParticles, CL_BlasterTrail, CL_BlasterTrail2, CL_CalcViewValues, CL_ClampPitch, CL_ClearDlights, CL_ClearEffects, CL_ClearLightStyles, CL_ClearParticles, CL_ClearState, CL_ClearTEnts, CL_CreateCmd, CL_DiminishingTrail, CL_Disconnect, CL_DrawInventory, CL_Drop, CL_FinishMove, CL_FixUpGender, CL_FlagTrail, CL_FlyEffect, CL_FlyParticles, CL_Heatbeam, CL_IonripperTrail, CL_KeyState, CL_MonsterPlasma_Shell, CL_ProcessSustain, CL_RegisterSounds, CL_RegisterTEntSounds, CL_RocketTrail, CL_SendCmd, CL_Shutdown, CL_Snd_Restart_f, CL_Stop_f, CL_TagTrail, CL_TrackerTrail, CL_Tracker_Shell, CL_TrapParticles, CL_WriteConfiguration, COM_BlockSequenceCRCByte, COM_Parse, CRC_Block, CRC_Init, CalcFov, Cmd_AddCommand, Cmd_CompleteCommand, Cmd_RemoveCommand, Com_BlockChecksum, Com_DPrintf, Com_Error, Com_PageInMemory, Com_Printf, Com_ServerState, Com_SetServerState, Com_sprintf, CompleteCommand, Con_CheckResize, Con_ClearNotify, Con_DrawConsole, Con_DrawInput, Con_DrawNotify, Con_Linefeed, Con_Print, Con_ToggleConsole_f

### CL_SendCmd

AngleVectors, CDAudio_Shutdown, CDAudio_Stop, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_BfgParticles, CL_BlasterTrail, CL_BlasterTrail2, CL_CalcViewValues, CL_ClearDlights, CL_ClearEffects, CL_ClearLightStyles, CL_ClearParticles, CL_ClearState, CL_ClearTEnts, CL_DiminishingTrail, CL_Disconnect, CL_DrawInventory, CL_Drop, CL_FixUpGender, CL_FlagTrail, CL_FlyEffect, CL_FlyParticles, CL_Heatbeam, CL_IonripperTrail, CL_MonsterPlasma_Shell, CL_ProcessSustain, CL_RegisterSounds, CL_RegisterTEntSounds, CL_RocketTrail, CL_Shutdown, CL_Snd_Restart_f, CL_Stop_f, CL_TagTrail, CL_TrackerTrail, CL_Tracker_Shell, CL_TrapParticles, CL_WriteConfiguration, COM_Parse, CalcFov, Cbuf_AddText, Cmd_AddCommand, Cmd_CompleteCommand, Cmd_RemoveCommand, Com_BlockChecksum, Com_DPrintf, Com_Error, Com_PageInMemory, Com_Printf, Com_ServerState, Com_SetServerState, Com_sprintf, CompleteCommand, Con_CheckResize, Con_ClearNotify, Con_DrawConsole, Con_DrawInput, Con_DrawNotify, Con_Linefeed, Con_Print, Con_ToggleConsole_f, CopyString, Cvar_CompleteVariable, Cvar_FindVar, Cvar_FullSet, Cvar_Get, Cvar_InfoValidate, Cvar_Set, Cvar_Set2, Cvar_SetValue, Cvar_VariableString

### CL_ReadPackets

AngleVectors, BigShort, CDAudio_Play, CDAudio_Shutdown, CDAudio_Stop, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_BfgParticles, CL_BlasterTrail, CL_BlasterTrail2, CL_CalcViewValues, CL_CheckOrDownloadFile, CL_DiminishingTrail, CL_DownloadFileName, CL_DrawInventory, CL_Drop, CL_EntityEvent, CL_FlagTrail, CL_FlyEffect, CL_FlyParticles, CL_Heatbeam, CL_IonripperTrail, CL_ItemRespawnParticles, CL_LogoutEffect, CL_MonsterPlasma_Shell, CL_PrepRefresh, CL_ProcessSustain, CL_RegisterSounds, CL_RegisterTEntModels, CL_RegisterTEntSounds, CL_RequestNextDownload, CL_RocketTrail, CL_Shutdown, CL_Snd_Restart_f, CL_Stop_f, CL_TagTrail, CL_TeleporterParticles, CL_TrackerTrail, CL_Tracker_Shell, CL_TrapParticles, CL_WriteConfiguration, CL_WriteDemoMessage, CM_InitBoxHull, CM_InlineModel, CM_LoadMap, CMod_LoadAreaPortals, CMod_LoadAreas, CMod_LoadBrushSides, CMod_LoadBrushes, CMod_LoadEntityString, CMod_LoadLeafBrushes, CMod_LoadLeafs, CMod_LoadNodes, CMod_LoadPlanes, CMod_LoadSubmodels, CMod_LoadSurfaces, CMod_LoadVisibility, COM_Parse, COM_StripExtension, CalcFov, Cbuf_Execute, Cbuf_InsertText, Cmd_AddCommand, Cmd_Argc, Cmd_Args, Cmd_CompleteCommand, Cmd_ExecuteString, Cmd_ForwardToServer, Cmd_RemoveCommand, Com_BlockChecksum, Com_DPrintf

### CL_ParseServerMessage

AngleVectors, CDAudio_Play, CDAudio_Shutdown, CDAudio_Stop, CL_AddBeams, CL_AddDLights, CL_AddEntities, CL_AddExplosions, CL_AddLasers, CL_AddLightStyles, CL_AddPacketEntities, CL_AddParticles, CL_AddPlayerBeams, CL_AddTEnts, CL_AddViewWeapon, CL_BfgParticles, CL_BlasterTrail, CL_BlasterTrail2, CL_CalcViewValues, CL_CheckOrDownloadFile, CL_DiminishingTrail, CL_Disconnect, CL_DownloadFileName, CL_DrawInventory, CL_Drop, CL_EntityEvent, CL_FlagTrail, CL_FlyEffect, CL_FlyParticles, CL_Heatbeam, CL_IonripperTrail, CL_ItemRespawnParticles, CL_LogoutEffect, CL_MonsterPlasma_Shell, CL_PrepRefresh, CL_ProcessSustain, CL_RegisterSounds, CL_RegisterTEntModels, CL_RegisterTEntSounds, CL_RequestNextDownload, CL_RocketTrail, CL_Shutdown, CL_Snd_Restart_f, CL_Stop_f, CL_TagTrail, CL_TeleporterParticles, CL_TrackerTrail, CL_Tracker_Shell, CL_TrapParticles, CL_WriteConfiguration, CL_WriteDemoMessage, CM_InitBoxHull, CM_InlineModel, CM_LoadMap, CMod_LoadAreaPortals, CMod_LoadAreas, CMod_LoadBrushSides, CMod_LoadBrushes, CMod_LoadEntityString, CMod_LoadLeafBrushes, CMod_LoadLeafs, CMod_LoadNodes, CMod_LoadPlanes, CMod_LoadSubmodels, CMod_LoadSurfaces, CMod_LoadVisibility, COM_Parse, COM_StripExtension, CalcFov, Cbuf_AddText, Cbuf_Execute, Cbuf_InsertText, Cmd_AddCommand, Cmd_Argc, Cmd_Args, Cmd_Argv, Cmd_CompleteCommand, Cmd_ExecuteString, Cmd_ForwardToServer, Cmd_MacroExpandString

### PMove

Com_DPrintf, Com_Printf, Com_sprintf, Con_Linefeed, Con_Print, FS_Gamedir, Sys_ConsoleOutput, memset, sqrt, strncpy

