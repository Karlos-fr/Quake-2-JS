# Inventaire runtime Phase 03 - Quake-2-master/game/g_main.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_main.ts
- Cibles TS declarees : packages/game/src/g_main.ts, packages/game/src/g_svcmds.ts, packages/game/src/g_save.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sm_meat_index | 29 | a-auditer | |
| global | snd_fry | 30 | a-auditer | |
| global | meansOfDeath | 31 | a-auditer | |
| global | g_edicts | 33 | a-auditer | |
| global | deathmatch | 35 | a-auditer | |
| global | coop | 36 | a-auditer | |
| global | dmflags | 37 | a-auditer | |
| global | skill | 38 | a-auditer | |
| global | fraglimit | 39 | a-auditer | |
| global | timelimit | 40 | a-auditer | |
| global | password | 41 | a-auditer | |
| global | spectator_password | 42 | a-auditer | |
| global | maxclients | 43 | a-auditer | |
| global | maxspectators | 44 | a-auditer | |
| global | maxentities | 45 | a-auditer | |
| global | g_select_empty | 46 | a-auditer | |
| global | dedicated | 47 | a-auditer | |
| global | filterban | 49 | a-auditer | |
| global | sv_maxvelocity | 51 | a-auditer | |
| global | sv_gravity | 52 | a-auditer | |
| global | sv_rollspeed | 54 | a-auditer | |
| global | sv_rollangle | 55 | a-auditer | |
| global | gun_x | 56 | a-auditer | |
| global | gun_y | 57 | a-auditer | |
| global | gun_z | 58 | a-auditer | |
| global | run_pitch | 60 | a-auditer | |
| global | run_roll | 61 | a-auditer | |
| global | bob_up | 62 | a-auditer | |
| global | bob_pitch | 63 | a-auditer | |
| global | bob_roll | 64 | a-auditer | |
| global | sv_cheats | 66 | a-auditer | |
| global | flood_msgs | 68 | a-auditer | |
| global | flood_persecond | 69 | a-auditer | |
| global | flood_waitdelay | 70 | a-auditer | |
| global | sv_maplist | 72 | a-auditer | |
| function | SpawnEntities | 74 | a-auditer | |
| function | ClientThink | 75 | a-auditer | |
| function | ClientConnect | 76 | a-auditer | |
| function | ClientUserinfoChanged | 77 | a-auditer | |
| function | ClientDisconnect | 78 | a-auditer | |
| function | ClientBegin | 79 | a-auditer | |
| function | ClientCommand | 80 | a-auditer | |
| function | RunEntity | 81 | a-auditer | |
| function | WriteGame | 82 | a-auditer | |
| function | ReadGame | 83 | a-auditer | |
| function | WriteLevel | 84 | a-auditer | |
| function | ReadLevel | 85 | a-auditer | |
| function | InitGame | 86 | a-auditer | |
| function | G_RunFrame | 87 | a-auditer | |
| function | ShutdownGame | 93 | a-auditer | |
| function | GetGameAPI | 110 | a-auditer | |
| function | Sys_Error | 142 | a-auditer | |
| global | argptr | 144 | a-auditer | |
| global | text | 145 | a-auditer | |
| function | Com_Printf | 154 | a-auditer | |
| global | argptr | 156 | a-auditer | |
| global | text | 157 | a-auditer | |
| function | ClientEndServerFrames | 176 | a-auditer | |
| global | i | 178 | a-auditer | |
| global | ent | 179 | a-auditer | |
| function | CreateTargetChangeLevel | 200 | a-auditer | |
| global | ent | 202 | a-auditer | |
| function | EndDMLevel | 218 | a-auditer | |
| global | ent | 220 | a-auditer | |
| global | seps | 222 | a-auditer | |
| function | BeginIntermission | 244 | a-auditer | |
| function | CheckDMRules | 276 | a-auditer | |
| global | i | 278 | a-auditer | |
| function | ExitLevel | 321 | a-auditer | |
| global | i | 323 | a-auditer | |
| global | ent | 324 | a-auditer | |
| global | command | 325 | a-auditer | |
| function | G_RunFrame | 353 | a-auditer | |
| global | i | 355 | a-auditer | |
| global | ent | 356 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

