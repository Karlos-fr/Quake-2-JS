# Inventaire runtime Phase 03 - Quake-2-master/qcommon/common.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/qcommon/src/common.ts
- Cibles TS declarees : packages/qcommon/src/common.ts, packages/qcommon/src/messages.ts, packages/memory/src/sizebuf.ts, packages/qcommon/src/qcommon.ts, packages/qcommon/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | MAXPRINTMSG | 24 | a-auditer | |
| macro | MAX_NUM_ARGVS | 26 | a-auditer | |
| global | com_argc | 29 | a-auditer | |
| global | com_argv | 30 | a-auditer | |
| global | realtime | 32 | a-auditer | |
| global | host_speeds | 39 | a-auditer | |
| global | log_stats | 40 | a-auditer | |
| global | developer | 41 | a-auditer | |
| global | timescale | 42 | a-auditer | |
| global | fixedtime | 43 | a-auditer | |
| global | logfile_active | 44 | a-auditer | |
| global | showtrace | 45 | a-auditer | |
| global | dedicated | 46 | a-auditer | |
| global | server_state | 50 | a-auditer | |
| global | time_before_game | 53 | a-auditer | |
| global | time_after_game | 54 | a-auditer | |
| global | time_before_ref | 55 | a-auditer | |
| global | time_after_ref | 56 | a-auditer | |
| global | rd_target | 66 | a-auditer | |
| global | rd_buffer | 67 | a-auditer | |
| global | rd_buffersize | 68 | a-auditer | |
| function | Com_BeginRedirect | 71 | a-auditer | |
| function | Com_EndRedirect | 83 | a-auditer | |
| function | Com_Printf | 101 | a-auditer | |
| global | argptr | 103 | a-auditer | |
| global | msg | 104 | a-auditer | |
| global | name | 129 | a-auditer | |
| function | Com_DPrintf | 151 | a-auditer | |
| global | argptr | 153 | a-auditer | |
| global | msg | 154 | a-auditer | |
| function | Com_Error | 175 | a-auditer | |
| global | argptr | 177 | a-auditer | |
| global | msg | 178 | a-auditer | |
| global | recursive | 179 | a-auditer | |
| function | jmp | 193 | a-auditer | |
| function | jmp | 201 | a-auditer | |
| function | Com_Quit | 227 | a-auditer | |
| function | Com_ServerState | 247 | a-auditer | |
| function | Com_SetServerState | 257 | a-auditer | |
| function | MSG_WriteChar | 281 | a-auditer | |
| global | buf | 283 | a-auditer | |
| function | MSG_WriteByte | 294 | a-auditer | |
| global | buf | 296 | a-auditer | |
| function | MSG_WriteShort | 307 | a-auditer | |
| global | buf | 309 | a-auditer | |
| function | MSG_WriteLong | 321 | a-auditer | |
| global | buf | 323 | a-auditer | |
| function | MSG_WriteFloat | 332 | a-auditer | |
| global | f | 336 | a-auditer | |
| global | l | 337 | a-auditer | |
| function | MSG_WriteString | 347 | a-auditer | |
| function | SZ_Write | 352 | a-auditer | |
| function | MSG_WriteCoord | 355 | a-auditer | |
| function | MSG_WritePos | 360 | a-auditer | |
| function | MSG_WriteAngle | 367 | a-auditer | |
| function | MSG_WriteAngle16 | 372 | a-auditer | |
| function | MSG_WriteDeltaUsercmd | 378 | a-auditer | |
| global | bits | 380 | a-auditer | |
| function | MSG_WriteDir | 429 | a-auditer | |
| function | MSG_ReadDir | 455 | a-auditer | |
| global | b | 457 | a-auditer | |
| function | MSG_WriteDeltaEntity | 474 | a-auditer | |
| global | bits | 476 | a-auditer | |
| function | MSG_WriteByte | 601 | a-auditer | |
| function | MSG_BeginReading | 675 | a-auditer | |
| function | MSG_ReadChar | 681 | a-auditer | |
| global | c | 683 | a-auditer | |
| global | c | 688 | a-auditer | |
| function | MSG_ReadByte | 694 | a-auditer | |
| global | c | 696 | a-auditer | |
| global | c | 701 | a-auditer | |
| function | MSG_ReadShort | 707 | a-auditer | |
| global | c | 709 | a-auditer | |
| global | c | 714 | a-auditer | |
| function | MSG_ReadLong | 722 | a-auditer | |
| global | c | 724 | a-auditer | |
| global | c | 729 | a-auditer | |
| function | MSG_ReadFloat | 739 | a-auditer | |
| global | b | 743 | a-auditer | |
| global | f | 744 | a-auditer | |
| global | l | 745 | a-auditer | |
| function | MSG_ReadString | 764 | a-auditer | |
| global | string | 766 | a-auditer | |
| function | MSG_ReadStringLine | 784 | a-auditer | |
| global | string | 786 | a-auditer | |
| function | MSG_ReadCoord | 804 | a-auditer | |
| function | MSG_ReadPos | 809 | a-auditer | |
| function | MSG_ReadAngle | 816 | a-auditer | |
| function | MSG_ReadAngle16 | 821 | a-auditer | |
| function | SHORT2ANGLE | 823 | a-auditer | |
| function | MSG_ReadDeltaUsercmd | 826 | a-auditer | |
| global | bits | 828 | a-auditer | |
| function | MSG_ReadData | 865 | a-auditer | |
| global | i | 867 | a-auditer | |
| function | SZ_Init | 876 | a-auditer | |
| function | SZ_Clear | 883 | a-auditer | |
| function | SZ_GetSpace | 889 | a-auditer | |
| function | SZ_Write | 912 | a-auditer | |
| function | SZ_Print | 917 | a-auditer | |
| global | len | 919 | a-auditer | |
| function | memcpy | 928 | a-auditer | |
| function | memcpy | 931 | a-auditer | |
| function | COM_CheckParm | 946 | a-auditer | |
| global | i | 948 | a-auditer | |
| function | COM_Argc | 959 | a-auditer | |
| function | COM_Argv | 964 | a-auditer | |
| function | COM_ClearArgv | 971 | a-auditer | |
| function | COM_InitArgv | 984 | a-auditer | |
| global | i | 986 | a-auditer | |
| global | com_argv | 996 | a-auditer | |
| function | COM_AddParm | 1007 | a-auditer | |
| function | memsearch | 1018 | a-auditer | |
| global | i | 1020 | a-auditer | |
| function | CopyString | 1029 | a-auditer | |
| global | out | 1031 | a-auditer | |
| function | Info_Print | 1040 | a-auditer | |
| global | key | 1042 | a-auditer | |
| global | value | 1043 | a-auditer | |
| global | o | 1044 | a-auditer | |
| global | l | 1045 | a-auditer | |
| global | o | 1062 | a-auditer | |
| macro | Z_MAGIC | 1094 | a-auditer | |
| struct | zhead_s | 1097 | a-auditer | |
| global | magic | 1100 | a-auditer | |
| global | tag | 1101 | a-auditer | |
| global | size | 1102 | a-auditer | |
| global | z_chain | 1105 | a-auditer | |
| function | Z_Free | 1113 | a-auditer | |
| function | Z_Stats_f | 1136 | a-auditer | |
| function | Z_FreeTags | 1146 | a-auditer | |
| function | Z_TagMalloc | 1163 | a-auditer | |
| function | Z_Malloc | 1191 | a-auditer | |
| function | Z_TagMalloc | 1193 | a-auditer | |
| function | COM_BlockSequenceCheckByte | 1211 | a-auditer | |
| global | chktbl | 1255 | a-auditer | |
| function | COM_BlockSequenceCRCByte | 1329 | a-auditer | |
| global | n | 1331 | a-auditer | |
| global | p | 1332 | a-auditer | |
| global | x | 1333 | a-auditer | |
| global | chkb | 1334 | a-auditer | |
| global | crc | 1335 | a-auditer | |
| function | frand | 1366 | a-auditer | |
| function | crand | 1371 | a-auditer | |
| function | Key_Init | 1376 | a-auditer | |
| function | SCR_EndLoadingPlaque | 1377 | a-auditer | |
| function | Com_Error_f | 1387 | a-auditer | |
| function | Qcommon_Init | 1398 | a-auditer | |
| global | s | 1400 | a-auditer | |
| function | Cbuf_AddText | 1474 | a-auditer | |
| function | Qcommon_Frame | 1491 | a-auditer | |
| global | s | 1493 | a-auditer | |
| global | c_pointcontents | 1535 | a-auditer | |
| function | Qcommon_Shutdown | 1586 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

