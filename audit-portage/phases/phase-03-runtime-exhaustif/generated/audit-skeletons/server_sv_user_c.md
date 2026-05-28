# Inventaire runtime Phase 03 - Quake-2-master/server/sv_user.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/server/src/sv_user.ts
- Cibles TS declarees : packages/server/src/sv_user.ts, packages/server/src/index.ts, packages/server/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sv_player | 24 | a-auditer | |
| function | SV_BeginDemoserver | 40 | a-auditer | |
| global | name | 42 | a-auditer | |
| function | SV_New_f | 58 | a-auditer | |
| global | gamedir | 60 | a-auditer | |
| global | playernum | 61 | a-auditer | |
| global | ent | 62 | a-auditer | |
| global | playernum | 95 | a-auditer | |
| function | SV_Configstrings_f | 124 | a-auditer | |
| global | start | 126 | a-auditer | |
| function | SV_Baselines_f | 179 | a-auditer | |
| global | start | 181 | a-auditer | |
| global | nullstate | 182 | a-auditer | |
| global | base | 183 | a-auditer | |
| function | SV_Begin_f | 238 | a-auditer | |
| function | SV_NextDownload_f | 265 | a-auditer | |
| global | r | 267 | a-auditer | |
| global | percent | 268 | a-auditer | |
| global | size | 269 | a-auditer | |
| function | SV_BeginDownload_f | 302 | a-auditer | |
| global | name | 304 | a-auditer | |
| global | allow_download | 305 | a-auditer | |
| global | allow_download_players | 306 | a-auditer | |
| global | allow_download_models | 307 | a-auditer | |
| global | allow_download_sounds | 308 | a-auditer | |
| global | allow_download_maps | 309 | a-auditer | |
| global | file_from_pak | 310 | a-auditer | |
| global | offset | 311 | a-auditer | |
| function | SV_Disconnect_f | 385 | a-auditer | |
| function | SV_ShowServerinfo_f | 399 | a-auditer | |
| function | SV_Nextserver | 405 | a-auditer | |
| global | v | 407 | a-auditer | |
| function | SV_Nextserver_f | 433 | a-auditer | |
| struct | ucmd_t | 445 | a-auditer | |
| global | name | 447 | a-auditer | |
| table | ucmds | 451 | a-auditer | |
| function | SV_ExecuteUserCommand | 477 | a-auditer | |
| function | SV_ClientThink | 509 | a-auditer | |
| macro | MAX_STRINGCMDS | 525 | a-auditer | |
| function | SV_ExecuteClientMessage | 533 | a-auditer | |
| global | c | 535 | a-auditer | |
| global | s | 536 | a-auditer | |
| global | nullcmd | 538 | a-auditer | |
| global | net_drop | 540 | a-auditer | |
| global | stringCmdCount | 541 | a-auditer | |
| global | checksumIndex | 543 | a-auditer | |
| global | move_issued | 544 | a-auditer | |
| global | lastframe | 545 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

