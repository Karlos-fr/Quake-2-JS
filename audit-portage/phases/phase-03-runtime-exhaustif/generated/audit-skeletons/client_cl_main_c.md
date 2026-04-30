# Inventaire runtime Phase 03 - Quake-2-master/client/cl_main.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cl_main.ts
- Cibles TS declarees : packages/client/src/cl_main.ts, packages/client/src/download.ts, packages/client/src/precache.ts, packages/client/src/sound.ts, packages/client/src/cl_parse.ts, packages/client/src/sky.ts, packages/client/src/client.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | freelook | 24 | a-auditer | |
| global | adr0 | 26 | a-auditer | |
| global | adr1 | 27 | a-auditer | |
| global | adr2 | 28 | a-auditer | |
| global | adr3 | 29 | a-auditer | |
| global | adr4 | 30 | a-auditer | |
| global | adr5 | 31 | a-auditer | |
| global | adr6 | 32 | a-auditer | |
| global | adr7 | 33 | a-auditer | |
| global | adr8 | 34 | a-auditer | |
| global | cl_stereo_separation | 36 | a-auditer | |
| global | cl_stereo | 37 | a-auditer | |
| global | rcon_client_password | 39 | a-auditer | |
| global | rcon_address | 40 | a-auditer | |
| global | cl_noskins | 42 | a-auditer | |
| global | cl_autoskins | 43 | a-auditer | |
| global | cl_footsteps | 44 | a-auditer | |
| global | cl_timeout | 45 | a-auditer | |
| global | cl_predict | 46 | a-auditer | |
| global | cl_maxfps | 48 | a-auditer | |
| global | cl_gun | 49 | a-auditer | |
| global | cl_add_particles | 51 | a-auditer | |
| global | cl_add_lights | 52 | a-auditer | |
| global | cl_add_entities | 53 | a-auditer | |
| global | cl_add_blend | 54 | a-auditer | |
| global | cl_shownet | 56 | a-auditer | |
| global | cl_showmiss | 57 | a-auditer | |
| global | cl_showclamp | 58 | a-auditer | |
| global | cl_paused | 60 | a-auditer | |
| global | cl_timedemo | 61 | a-auditer | |
| global | lookspring | 63 | a-auditer | |
| global | lookstrafe | 64 | a-auditer | |
| global | sensitivity | 65 | a-auditer | |
| global | m_pitch | 67 | a-auditer | |
| global | m_yaw | 68 | a-auditer | |
| global | m_forward | 69 | a-auditer | |
| global | m_side | 70 | a-auditer | |
| global | cl_lightlevel | 72 | a-auditer | |
| global | info_password | 77 | a-auditer | |
| global | info_spectator | 78 | a-auditer | |
| global | name | 79 | a-auditer | |
| global | skin | 80 | a-auditer | |
| global | rate | 81 | a-auditer | |
| global | fov | 82 | a-auditer | |
| global | msg | 83 | a-auditer | |
| global | hand | 84 | a-auditer | |
| global | gender | 85 | a-auditer | |
| global | gender_auto | 86 | a-auditer | |
| global | cl_vwep | 88 | a-auditer | |
| global | cl_entities | 93 | a-auditer | |
| global | cl_parse_entities | 95 | a-auditer | |
| global | allow_download | 97 | a-auditer | |
| global | allow_download_players | 98 | a-auditer | |
| global | allow_download_models | 99 | a-auditer | |
| global | allow_download_sounds | 100 | a-auditer | |
| global | allow_download_maps | 101 | a-auditer | |
| function | CL_WriteDemoMessage | 113 | a-auditer | |
| function | CL_Stop_f | 132 | a-auditer | |
| global | len | 134 | a-auditer | |
| function | CL_Record_f | 160 | a-auditer | |
| global | name | 162 | a-auditer | |
| global | buf_data | 163 | a-auditer | |
| global | buf | 164 | a-auditer | |
| global | i | 165 | a-auditer | |
| global | len | 166 | a-auditer | |
| global | ent | 167 | a-auditer | |
| global | nullstate | 168 | a-auditer | |
| function | Cmd_ForwardToServer | 284 | a-auditer | |
| global | cmd | 286 | a-auditer | |
| function | CL_Setenv_f | 304 | a-auditer | |
| global | argc | 306 | a-auditer | |
| global | buffer | 310 | a-auditer | |
| global | i | 311 | a-auditer | |
| global | env | 326 | a-auditer | |
| function | CL_ForwardToServer_f | 345 | a-auditer | |
| function | CL_Pause_f | 367 | a-auditer | |
| function | CL_Quit_f | 384 | a-auditer | |
| function | CL_Drop | 397 | a-auditer | |
| function | CL_SendConnectPacket | 420 | a-auditer | |
| global | port | 423 | a-auditer | |
| function | CL_CheckForResend | 448 | a-auditer | |
| function | CL_Connect_f | 494 | a-auditer | |
| global | server | 496 | a-auditer | |
| function | CL_Rcon_f | 533 | a-auditer | |
| global | message | 535 | a-auditer | |
| global | i | 536 | a-auditer | |
| function | CL_ClearState | 592 | a-auditer | |
| function | CL_Disconnect | 615 | a-auditer | |
| global | final | 617 | a-auditer | |
| global | time | 624 | a-auditer | |
| function | CL_Disconnect_f | 662 | a-auditer | |
| function | CL_Packet_f | 677 | a-auditer | |
| global | send | 679 | a-auditer | |
| function | CL_Changing_f | 728 | a-auditer | |
| function | CL_Reconnect_f | 748 | a-auditer | |
| function | CL_ParseStatusMessage | 783 | a-auditer | |
| global | s | 785 | a-auditer | |
| function | CL_PingServers_f | 799 | a-auditer | |
| global | i | 801 | a-auditer | |
| global | name | 803 | a-auditer | |
| global | adrstring | 804 | a-auditer | |
| global | noudp | 805 | a-auditer | |
| global | noipx | 806 | a-auditer | |
| function | CL_Skins_f | 857 | a-auditer | |
| global | i | 859 | a-auditer | |
| function | CL_ConnectionlessPacket | 880 | a-auditer | |
| global | s | 882 | a-auditer | |
| global | c | 883 | a-auditer | |
| function | CL_DumpPackets | 974 | a-auditer | |
| function | CL_ReadPackets | 987 | a-auditer | |
| function | CL_FixUpGender | 1050 | a-auditer | |
| global | p | 1052 | a-auditer | |
| global | sk | 1053 | a-auditer | |
| function | Cvar_Set | 1071 | a-auditer | |
| function | CL_Userinfo_f | 1081 | a-auditer | |
| function | CL_Snd_Restart_f | 1095 | a-auditer | |
| global | precache_check | 1102 | a-auditer | |
| global | precache_spawncount | 1103 | a-auditer | |
| global | precache_tex | 1104 | a-auditer | |
| global | precache_model_skin | 1105 | a-auditer | |
| global | precache_model | 1107 | a-auditer | |
| macro | PLAYER_MULT | 1109 | a-auditer | |
| macro | ENV_CNT | 1112 | a-auditer | |
| macro | TEXTURE_CNT | 1113 | a-auditer | |
| global | env_suf | 1115 | a-auditer | |
| function | CL_RequestNextDownload | 1117 | a-auditer | |
| global | map_checksum | 1119 | a-auditer | |
| global | fn | 1120 | a-auditer | |
| global | p | 1247 | a-auditer | |
| global | n | 1325 | a-auditer | |
| function | Com_sprintf | 1331 | a-auditer | |
| global | numtexinfo | 1348 | a-auditer | |
| global | fn | 1353 | a-auditer | |
| function | CL_Precache_f | 1379 | a-auditer | |
| global | map_checksum | 1384 | a-auditer | |
| function | CL_InitLocal | 1406 | a-auditer | |
| function | CL_WriteConfiguration | 1556 | a-auditer | |
| global | path | 1559 | a-auditer | |
| struct | cheatvar_t | 1587 | a-auditer | |
| global | name | 1589 | a-auditer | |
| global | value | 1590 | a-auditer | |
| global | var | 1591 | a-auditer | |
| table | cheatvars | 1594 | a-auditer | |
| global | numcheatvars | 1609 | a-auditer | |
| function | CL_FixCvarCheats | 1611 | a-auditer | |
| global | i | 1613 | a-auditer | |
| function | CL_SendCommand | 1649 | a-auditer | |
| function | CL_Frame | 1677 | a-auditer | |
| global | extratime | 1679 | a-auditer | |
| global | lasttimecalled | 1680 | a-auditer | |
| global | now | 1762 | a-auditer | |
| function | CL_Init | 1780 | a-auditer | |
| function | CL_Shutdown | 1825 | a-auditer | |
| global | isdown | 1827 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

