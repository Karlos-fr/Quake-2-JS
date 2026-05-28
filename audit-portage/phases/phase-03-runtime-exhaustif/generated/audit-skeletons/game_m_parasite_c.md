# Inventaire runtime Phase 03 - Quake-2-master/game/m_parasite.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_parasite.ts
- Cibles TS declarees : packages/game/src/m_parasite.ts, packages/game/src/g_save.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sound_pain1 | 32 | a-auditer | |
| global | sound_pain2 | 33 | a-auditer | |
| global | sound_die | 34 | a-auditer | |
| global | sound_launch | 35 | a-auditer | |
| global | sound_impact | 36 | a-auditer | |
| global | sound_suck | 37 | a-auditer | |
| global | sound_reelin | 38 | a-auditer | |
| global | sound_sight | 39 | a-auditer | |
| global | sound_tap | 40 | a-auditer | |
| global | sound_scratch | 41 | a-auditer | |
| global | sound_search | 42 | a-auditer | |
| function | parasite_stand | 45 | a-auditer | |
| function | parasite_start_run | 46 | a-auditer | |
| function | parasite_run | 47 | a-auditer | |
| function | parasite_walk | 48 | a-auditer | |
| function | parasite_start_walk | 49 | a-auditer | |
| function | parasite_end_fidget | 50 | a-auditer | |
| function | parasite_do_fidget | 51 | a-auditer | |
| function | parasite_refidget | 52 | a-auditer | |
| function | parasite_launch | 55 | a-auditer | |
| function | parasite_reel_in | 60 | a-auditer | |
| function | parasite_sight | 65 | a-auditer | |
| function | parasite_tap | 70 | a-auditer | |
| function | parasite_scratch | 75 | a-auditer | |
| function | parasite_search | 80 | a-auditer | |
| global | parasite_frames_start_fidget | 86 | a-auditer | |
| table | parasite_frames_start_fidget | 86 | a-auditer | |
| global | parasite_move_start_fidget | 93 | a-auditer | |
| global | parasite_frames_fidget | 95 | a-auditer | |
| table | parasite_frames_fidget | 95 | a-auditer | |
| global | parasite_move_fidget | 104 | a-auditer | |
| global | parasite_frames_end_fidget | 106 | a-auditer | |
| table | parasite_frames_end_fidget | 106 | a-auditer | |
| global | parasite_move_end_fidget | 117 | a-auditer | |
| function | parasite_end_fidget | 119 | a-auditer | |
| function | parasite_do_fidget | 124 | a-auditer | |
| function | parasite_refidget | 129 | a-auditer | |
| function | parasite_idle | 137 | a-auditer | |
| global | parasite_frames_stand | 143 | a-auditer | |
| table | parasite_frames_stand | 143 | a-auditer | |
| global | parasite_move_stand | 163 | a-auditer | |
| function | parasite_stand | 165 | a-auditer | |
| global | parasite_frames_run | 171 | a-auditer | |
| table | parasite_frames_run | 171 | a-auditer | |
| global | parasite_move_run | 181 | a-auditer | |
| global | parasite_frames_start_run | 183 | a-auditer | |
| table | parasite_frames_start_run | 183 | a-auditer | |
| global | parasite_move_start_run | 188 | a-auditer | |
| global | parasite_frames_stop_run | 190 | a-auditer | |
| table | parasite_frames_stop_run | 190 | a-auditer | |
| global | parasite_move_stop_run | 199 | a-auditer | |
| function | parasite_start_run | 201 | a-auditer | |
| function | parasite_run | 209 | a-auditer | |
| global | parasite_frames_walk | 218 | a-auditer | |
| table | parasite_frames_walk | 218 | a-auditer | |
| global | parasite_move_walk | 228 | a-auditer | |
| global | parasite_frames_start_walk | 230 | a-auditer | |
| table | parasite_frames_start_walk | 230 | a-auditer | |
| global | parasite_move_start_walk | 235 | a-auditer | |
| global | parasite_frames_stop_walk | 237 | a-auditer | |
| table | parasite_frames_stop_walk | 237 | a-auditer | |
| global | parasite_move_stop_walk | 246 | a-auditer | |
| function | parasite_start_walk | 248 | a-auditer | |
| function | parasite_walk | 253 | a-auditer | |
| global | parasite_frames_pain1 | 259 | a-auditer | |
| table | parasite_frames_pain1 | 259 | a-auditer | |
| global | parasite_move_pain1 | 273 | a-auditer | |
| function | parasite_pain | 275 | a-auditer | |
| function | parasite_drain_attack_ok | 297 | a-auditer | |
| function | parasite_drain_attack | 316 | a-auditer | |
| global | tr | 319 | a-auditer | |
| global | damage | 320 | a-auditer | |
| global | parasite_frames_drain | 366 | a-auditer | |
| table | parasite_frames_drain | 366 | a-auditer | |
| global | parasite_move_drain | 387 | a-auditer | |
| global | parasite_frames_break | 390 | a-auditer | |
| table | parasite_frames_break | 390 | a-auditer | |
| global | parasite_move_break | 425 | a-auditer | |
| function | parasite_attack | 433 | a-auditer | |
| function | parasite_dead | 449 | a-auditer | |
| global | parasite_frames_death | 459 | a-auditer | |
| table | parasite_frames_death | 459 | a-auditer | |
| global | parasite_move_death | 469 | a-auditer | |
| function | parasite_die | 471 | a-auditer | |
| global | n | 473 | a-auditer | |
| function | SP_monster_parasite | 506 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

