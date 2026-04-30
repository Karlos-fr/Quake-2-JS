# Inventaire runtime Phase 03 - Quake-2-master/server/sv_main.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/server/src/sv_main.ts
- Cibles TS declarees : packages/server/src/sv_main.ts, packages/server/src/host.ts, packages/server/src/runtime.ts, packages/server/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sv_paused | 27 | a-auditer | |
| global | sv_timedemo | 28 | a-auditer | |
| global | sv_enforcetime | 30 | a-auditer | |
| global | timeout | 32 | a-auditer | |
| global | zombietime | 33 | a-auditer | |
| global | rcon_password | 35 | a-auditer | |
| global | allow_download | 37 | a-auditer | |
| global | allow_download_players | 38 | a-auditer | |
| global | allow_download_models | 39 | a-auditer | |
| global | allow_download_sounds | 40 | a-auditer | |
| global | allow_download_maps | 41 | a-auditer | |
| global | sv_airaccelerate | 43 | a-auditer | |
| global | sv_noreload | 45 | a-auditer | |
| global | maxclients | 47 | a-auditer | |
| global | sv_showclamp | 48 | a-auditer | |
| global | hostname | 50 | a-auditer | |
| global | public_server | 51 | a-auditer | |
| global | sv_reconnect_limit | 53 | a-auditer | |
| function | Master_Shutdown | 55 | a-auditer | |
| function | SV_DropClient | 70 | a-auditer | |
| function | SV_StatusString | 109 | a-auditer | |
| global | player | 111 | a-auditer | |
| global | status | 112 | a-auditer | |
| global | i | 113 | a-auditer | |
| global | statusLength | 115 | a-auditer | |
| global | playerLength | 116 | a-auditer | |
| function | SVC_Status | 147 | a-auditer | |
| function | SVC_Ack | 163 | a-auditer | |
| function | SVC_Info | 176 | a-auditer | |
| global | string | 178 | a-auditer | |
| global | version | 180 | a-auditer | |
| function | SVC_Ping | 209 | a-auditer | |
| function | SVC_GetChallenge | 226 | a-auditer | |
| global | i | 228 | a-auditer | |
| global | oldest | 229 | a-auditer | |
| global | oldestTime | 230 | a-auditer | |
| function | SVC_DirectConnect | 267 | a-auditer | |
| global | userinfo | 269 | a-auditer | |
| global | i | 271 | a-auditer | |
| global | ent | 274 | a-auditer | |
| global | edictnum | 275 | a-auditer | |
| global | version | 276 | a-auditer | |
| global | qport | 277 | a-auditer | |
| global | challenge | 278 | a-auditer | |
| function | Netchan_OutOfBandPrint | 391 | a-auditer | |
| function | Rcon_Validate | 413 | a-auditer | |
| function | SVC_RemoteCommand | 433 | a-auditer | |
| global | i | 435 | a-auditer | |
| global | remaining | 436 | a-auditer | |
| function | Com_Printf | 443 | a-auditer | |
| function | SV_ConnectionlessPacket | 477 | a-auditer | |
| global | s | 479 | a-auditer | |
| global | c | 480 | a-auditer | |
| function | Com_Printf | 507 | a-auditer | |
| function | SV_CalcPings | 521 | a-auditer | |
| function | SV_GiveMsec | 573 | a-auditer | |
| global | i | 575 | a-auditer | |
| function | SV_ReadPackets | 597 | a-auditer | |
| global | i | 599 | a-auditer | |
| global | qport | 601 | a-auditer | |
| function | SV_CheckTimeouts | 663 | a-auditer | |
| global | i | 665 | a-auditer | |
| global | droppoint | 667 | a-auditer | |
| global | zombiepoint | 668 | a-auditer | |
| function | SV_PrepWorldFrame | 703 | a-auditer | |
| global | ent | 705 | a-auditer | |
| global | i | 706 | a-auditer | |
| function | SV_RunGameFrame | 723 | a-auditer | |
| function | SV_Frame | 760 | a-auditer | |
| macro | HEARTBEAT_SECONDS | 826 | a-auditer | |
| function | Master_Heartbeat | 827 | a-auditer | |
| global | string | 829 | a-auditer | |
| global | i | 830 | a-auditer | |
| function | Master_Shutdown | 867 | a-auditer | |
| global | i | 869 | a-auditer | |
| function | SV_UserinfoChanged | 898 | a-auditer | |
| global | val | 900 | a-auditer | |
| global | i | 901 | a-auditer | |
| function | SV_Init | 945 | a-auditer | |
| function | SV_FinalMessage | 993 | a-auditer | |
| global | i | 995 | a-auditer | |
| function | MSG_WriteByte | 1006 | a-auditer | |
| function | SV_Shutdown | 1032 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

