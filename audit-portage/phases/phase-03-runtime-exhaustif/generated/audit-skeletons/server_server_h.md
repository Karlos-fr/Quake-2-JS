# Inventaire runtime Phase 03 - Quake-2-master/server/server.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/server/src/server.ts
- Cibles TS declarees : packages/server/src/server.ts, packages/server/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | MAX_MASTERS | 30 | a-auditer | |
| enum | server_state_t | 32 | a-auditer | |
| struct | server_t | 43 | a-auditer | |
| global | attractloop | 47 | a-auditer | |
| global | loadgame | 48 | a-auditer | |
| global | time | 50 | a-auditer | |
| global | framenum | 51 | a-auditer | |
| global | name | 53 | a-auditer | |
| global | models | 54 | a-auditer | |
| global | baselines | 57 | a-auditer | |
| global | multicast | 61 | a-auditer | |
| global | multicast_buf | 62 | a-auditer | |
| global | demofile | 65 | a-auditer | |
| global | timedemo | 66 | a-auditer | |
| macro | EDICT_NUM | 69 | a-auditer | |
| macro | NUM_FOR_EDICT | 70 | a-auditer | |
| enum | client_state_t | 73 | a-auditer | |
| struct | client_frame_t | 82 | a-auditer | |
| global | areabytes | 84 | a-auditer | |
| global | areabits | 85 | a-auditer | |
| global | ps | 86 | a-auditer | |
| global | num_entities | 87 | a-auditer | |
| global | first_entity | 88 | a-auditer | |
| global | senttime | 89 | a-auditer | |
| macro | LATENCY_COUNTS | 92 | a-auditer | |
| macro | RATE_MESSAGES | 93 | a-auditer | |
| struct | client_s | 95 | a-auditer | |
| global | userinfo | 99 | a-auditer | |
| global | lastframe | 101 | a-auditer | |
| global | lastcmd | 102 | a-auditer | |
| global | commandMsec | 104 | a-auditer | |
| global | frame_latency | 107 | a-auditer | |
| global | ping | 108 | a-auditer | |
| global | message_size | 110 | a-auditer | |
| global | rate | 111 | a-auditer | |
| global | surpressCount | 112 | a-auditer | |
| global | edict | 114 | a-auditer | |
| global | name | 115 | a-auditer | |
| global | messagelevel | 116 | a-auditer | |
| global | datagram | 120 | a-auditer | |
| global | datagram_buf | 121 | a-auditer | |
| global | frames | 123 | a-auditer | |
| global | download | 125 | a-auditer | |
| global | downloadsize | 126 | a-auditer | |
| global | downloadcount | 127 | a-auditer | |
| global | lastmessage | 129 | a-auditer | |
| global | lastconnect | 130 | a-auditer | |
| global | challenge | 132 | a-auditer | |
| global | netchan | 134 | a-auditer | |
| macro | MAX_CHALLENGES | 148 | a-auditer | |
| struct | challenge_t | 150 | a-auditer | |
| global | challenge | 153 | a-auditer | |
| global | time | 154 | a-auditer | |
| struct | server_static_t | 158 | a-auditer | |
| global | initialized | 160 | a-auditer | |
| global | realtime | 161 | a-auditer | |
| global | mapcmd | 163 | a-auditer | |
| global | spawncount | 165 | a-auditer | |
| global | num_client_entities | 169 | a-auditer | |
| global | next_client_entities | 170 | a-auditer | |
| global | client_entities | 171 | a-auditer | |
| global | last_heartbeat | 173 | a-auditer | |
| global | demofile | 178 | a-auditer | |
| global | demo_multicast | 179 | a-auditer | |
| global | demo_multicast_buf | 180 | a-auditer | |
| global | net_message | 186 | a-auditer | |
| global | sv | 191 | a-auditer | |
| global | sv_paused | 193 | a-auditer | |
| global | maxclients | 194 | a-auditer | |
| global | sv_noreload | 195 | a-auditer | |
| global | sv_airaccelerate | 196 | a-auditer | |
| global | sv_enforcetime | 198 | a-auditer | |
| global | sv_player | 201 | a-auditer | |
| function | SV_FinalMessage | 208 | a-auditer | |
| function | SV_DropClient | 209 | a-auditer | |
| function | SV_ModelIndex | 211 | a-auditer | |
| function | SV_SoundIndex | 212 | a-auditer | |
| function | SV_ImageIndex | 213 | a-auditer | |
| function | SV_WriteClientdataToMessage | 215 | a-auditer | |
| function | SV_ExecuteUserCommand | 217 | a-auditer | |
| function | SV_InitOperatorCommands | 218 | a-auditer | |
| function | SV_SendServerinfo | 220 | a-auditer | |
| function | SV_UserinfoChanged | 221 | a-auditer | |
| function | Master_Heartbeat | 224 | a-auditer | |
| function | Master_Packet | 225 | a-auditer | |
| function | SV_InitGame | 230 | a-auditer | |
| function | SV_Map | 231 | a-auditer | |
| function | SV_PrepWorldFrame | 237 | a-auditer | |
| enum | redirect_t | 242 | a-auditer | |
| macro | SV_OUTPUTBUF_LENGTH | 243 | a-auditer | |
| global | sv_outputbuf | 245 | a-auditer | |
| function | SV_FlushRedirect | 247 | a-auditer | |
| function | SV_DemoCompleted | 249 | a-auditer | |
| function | SV_SendClientMessages | 250 | a-auditer | |
| function | SV_Multicast | 252 | a-auditer | |
| function | SV_StartSound | 253 | a-auditer | |
| function | SV_ClientPrintf | 256 | a-auditer | |
| function | SV_BroadcastPrintf | 257 | a-auditer | |
| function | SV_BroadcastCommand | 258 | a-auditer | |
| function | SV_Nextserver | 263 | a-auditer | |
| function | SV_ExecuteClientMessage | 264 | a-auditer | |
| function | SV_ReadLevelFile | 269 | a-auditer | |
| function | SV_Status_f | 270 | a-auditer | |
| function | SV_WriteFrameToClient | 275 | a-auditer | |
| function | SV_RecordDemoMessage | 276 | a-auditer | |
| function | SV_BuildClientFrame | 277 | a-auditer | |
| function | SV_Error | 280 | a-auditer | |
| function | SV_InitGameProgs | 287 | a-auditer | |
| function | SV_ShutdownGameProgs | 288 | a-auditer | |
| function | SV_InitEdict | 289 | a-auditer | |
| function | SV_ClearWorld | 299 | a-auditer | |
| function | SV_UnlinkEdict | 302 | a-auditer | |
| function | SV_LinkEdict | 306 | a-auditer | |
| function | SV_AreaEdicts | 313 | a-auditer | |
| function | SV_PointContents | 326 | a-auditer | |
| function | SV_Trace | 331 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

