# Inventaire runtime Phase 03 - Quake-2-master/game/m_flyer.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_flyer.ts
- Cibles TS declarees : packages/game/src/m_flyer.ts, packages/game/src/g_save.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | visible | 31 | a-auditer | |
| global | nextmove | 33 | a-auditer | |
| global | sound_sight | 35 | a-auditer | |
| global | sound_idle | 36 | a-auditer | |
| global | sound_pain1 | 37 | a-auditer | |
| global | sound_pain2 | 38 | a-auditer | |
| global | sound_slash | 39 | a-auditer | |
| global | sound_sproing | 40 | a-auditer | |
| global | sound_die | 41 | a-auditer | |
| function | flyer_check_melee | 44 | a-auditer | |
| function | flyer_loop_melee | 45 | a-auditer | |
| function | flyer_melee | 46 | a-auditer | |
| function | flyer_setstart | 47 | a-auditer | |
| function | flyer_stand | 48 | a-auditer | |
| function | flyer_nextmove | 49 | a-auditer | |
| function | flyer_sight | 52 | a-auditer | |
| function | flyer_idle | 57 | a-auditer | |
| function | flyer_pop_blades | 62 | a-auditer | |
| global | flyer_frames_stand | 68 | a-auditer | |
| table | flyer_frames_stand | 68 | a-auditer | |
| global | flyer_move_stand | 116 | a-auditer | |
| global | flyer_frames_walk | 119 | a-auditer | |
| table | flyer_frames_walk | 119 | a-auditer | |
| global | flyer_move_walk | 167 | a-auditer | |
| global | flyer_frames_run | 169 | a-auditer | |
| table | flyer_frames_run | 169 | a-auditer | |
| global | flyer_move_run | 217 | a-auditer | |
| function | flyer_run | 219 | a-auditer | |
| function | flyer_walk | 227 | a-auditer | |
| function | flyer_stand | 232 | a-auditer | |
| global | flyer_frames_start | 237 | a-auditer | |
| table | flyer_frames_start | 237 | a-auditer | |
| global | flyer_move_start | 246 | a-auditer | |
| global | flyer_frames_stop | 248 | a-auditer | |
| table | flyer_frames_stop | 248 | a-auditer | |
| global | flyer_move_stop | 258 | a-auditer | |
| function | flyer_stop | 260 | a-auditer | |
| function | flyer_start | 265 | a-auditer | |
| global | flyer_frames_rollright | 271 | a-auditer | |
| table | flyer_frames_rollright | 271 | a-auditer | |
| global | flyer_move_rollright | 283 | a-auditer | |
| global | flyer_frames_rollleft | 285 | a-auditer | |
| table | flyer_frames_rollleft | 285 | a-auditer | |
| global | flyer_move_rollleft | 297 | a-auditer | |
| global | flyer_frames_pain3 | 299 | a-auditer | |
| table | flyer_frames_pain3 | 299 | a-auditer | |
| global | flyer_move_pain3 | 306 | a-auditer | |
| global | flyer_frames_pain2 | 308 | a-auditer | |
| table | flyer_frames_pain2 | 308 | a-auditer | |
| global | flyer_move_pain2 | 315 | a-auditer | |
| global | flyer_frames_pain1 | 317 | a-auditer | |
| table | flyer_frames_pain1 | 317 | a-auditer | |
| global | flyer_move_pain1 | 329 | a-auditer | |
| global | flyer_frames_defense | 331 | a-auditer | |
| table | flyer_frames_defense | 331 | a-auditer | |
| global | flyer_move_defense | 340 | a-auditer | |
| global | flyer_frames_bankright | 342 | a-auditer | |
| table | flyer_frames_bankright | 342 | a-auditer | |
| global | flyer_move_bankright | 352 | a-auditer | |
| global | flyer_frames_bankleft | 354 | a-auditer | |
| table | flyer_frames_bankleft | 354 | a-auditer | |
| global | flyer_move_bankleft | 364 | a-auditer | |
| function | flyer_fire | 367 | a-auditer | |
| global | effect | 373 | a-auditer | |
| global | effect | 378 | a-auditer | |
| function | flyer_fireleft | 389 | a-auditer | |
| function | flyer_fireright | 394 | a-auditer | |
| global | flyer_frames_attack2 | 400 | a-auditer | |
| table | flyer_frames_attack2 | 400 | a-auditer | |
| global | flyer_move_attack2 | 420 | a-auditer | |
| function | flyer_slash_left | 423 | a-auditer | |
| function | flyer_slash_right | 432 | a-auditer | |
| global | flyer_frames_start_melee | 441 | a-auditer | |
| table | flyer_frames_start_melee | 441 | a-auditer | |
| global | flyer_move_start_melee | 450 | a-auditer | |
| global | flyer_frames_end_melee | 452 | a-auditer | |
| table | flyer_frames_end_melee | 452 | a-auditer | |
| global | flyer_move_end_melee | 458 | a-auditer | |
| global | flyer_frames_loop_melee | 461 | a-auditer | |
| table | flyer_frames_loop_melee | 461 | a-auditer | |
| global | flyer_move_loop_melee | 477 | a-auditer | |
| function | flyer_loop_melee | 479 | a-auditer | |
| function | flyer_attack | 489 | a-auditer | |
| function | flyer_setstart | 497 | a-auditer | |
| function | flyer_nextmove | 503 | a-auditer | |
| function | flyer_melee | 513 | a-auditer | |
| function | flyer_check_melee | 520 | a-auditer | |
| function | flyer_pain | 531 | a-auditer | |
| global | n | 533 | a-auditer | |
| function | flyer_die | 564 | a-auditer | |
| function | SP_monster_flyer | 573 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

