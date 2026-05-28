# Inventaire runtime Phase 03 - Quake-2-master/server/sv_ccmds.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/server/src/sv_ccmds.ts
- Cibles TS declarees : packages/server/src/sv_ccmds.ts, packages/server/src/index.ts, packages/server/src/runtime.ts, packages/server/src/server.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | SV_SetMaster_f | 39 | a-auditer | |
| function | SV_SetPlayer | 91 | a-auditer | |
| global | i | 94 | a-auditer | |
| global | idnum | 95 | a-auditer | |
| global | s | 96 | a-auditer | |
| function | SV_WipeSavegame | 156 | a-auditer | |
| global | name | 158 | a-auditer | |
| global | s | 159 | a-auditer | |
| function | CopyFile | 192 | a-auditer | |
| global | l | 195 | a-auditer | |
| global | buffer | 196 | a-auditer | |
| function | SV_CopySaveGame | 228 | a-auditer | |
| global | found | 232 | a-auditer | |
| function | SV_WriteLevelFile | 278 | a-auditer | |
| global | name | 280 | a-auditer | |
| function | SV_ReadLevelFile | 306 | a-auditer | |
| global | name | 308 | a-auditer | |
| function | SV_WriteServerFile | 334 | a-auditer | |
| global | var | 337 | a-auditer | |
| global | comment | 339 | a-auditer | |
| function | SV_ReadServerFile | 407 | a-auditer | |
| global | comment | 411 | a-auditer | |
| global | mapcmd | 412 | a-auditer | |
| function | SV_DemoMap_f | 465 | a-auditer | |
| function | SV_GameMap_f | 488 | a-auditer | |
| global | map | 490 | a-auditer | |
| global | i | 491 | a-auditer | |
| global | savedInuse | 493 | a-auditer | |
| function | SV_Map_f | 557 | a-auditer | |
| global | map | 559 | a-auditer | |
| global | expanded | 560 | a-auditer | |
| function | SV_Loadgame_f | 594 | a-auditer | |
| global | name | 596 | a-auditer | |
| global | dir | 598 | a-auditer | |
| function | SV_Savegame_f | 641 | a-auditer | |
| global | dir | 643 | a-auditer | |
| function | SV_Kick_f | 706 | a-auditer | |
| function | SV_Status_f | 737 | a-auditer | |
| global | s | 741 | a-auditer | |
| global | ping | 742 | a-auditer | |
| function | SV_ConSay_f | 794 | a-auditer | |
| global | j | 797 | a-auditer | |
| global | p | 798 | a-auditer | |
| global | text | 799 | a-auditer | |
| function | SV_Heartbeat_f | 829 | a-auditer | |
| function | SV_Serverinfo_f | 842 | a-auditer | |
| function | SV_DumpUser_f | 856 | a-auditer | |
| function | SV_ServerRecord_f | 882 | a-auditer | |
| global | name | 884 | a-auditer | |
| global | buf_data | 885 | a-auditer | |
| global | buf | 886 | a-auditer | |
| global | len | 887 | a-auditer | |
| global | i | 888 | a-auditer | |
| function | SV_ServerStop_f | 970 | a-auditer | |
| function | SV_KillServer_f | 991 | a-auditer | |
| function | SV_ServerCommand_f | 1006 | a-auditer | |
| function | SV_InitOperatorCommands | 1024 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

