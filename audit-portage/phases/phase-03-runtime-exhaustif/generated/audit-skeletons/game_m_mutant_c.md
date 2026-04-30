# Inventaire runtime Phase 03 - Quake-2-master/game/m_mutant.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_mutant.ts
- Cibles TS declarees : packages/game/src/m_mutant.ts, packages/game/src/g_spawn.ts, packages/game/src/g_save.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sound_swing | 32 | a-auditer | |
| global | sound_hit | 33 | a-auditer | |
| global | sound_hit2 | 34 | a-auditer | |
| global | sound_death | 35 | a-auditer | |
| global | sound_idle | 36 | a-auditer | |
| global | sound_pain1 | 37 | a-auditer | |
| global | sound_pain2 | 38 | a-auditer | |
| global | sound_sight | 39 | a-auditer | |
| global | sound_search | 40 | a-auditer | |
| global | sound_step1 | 41 | a-auditer | |
| global | sound_step2 | 42 | a-auditer | |
| global | sound_step3 | 43 | a-auditer | |
| global | sound_thud | 44 | a-auditer | |
| function | mutant_step | 50 | a-auditer | |
| global | n | 52 | a-auditer | |
| function | mutant_sight | 62 | a-auditer | |
| function | mutant_search | 67 | a-auditer | |
| function | mutant_swing | 72 | a-auditer | |
| global | mutant_frames_stand | 82 | a-auditer | |
| table | mutant_frames_stand | 82 | a-auditer | |
| global | mutant_move_stand | 141 | a-auditer | |
| function | mutant_stand | 143 | a-auditer | |
| function | mutant_idle_loop | 153 | a-auditer | |
| global | mutant_frames_idle | 159 | a-auditer | |
| table | mutant_frames_idle | 159 | a-auditer | |
| global | mutant_move_idle | 175 | a-auditer | |
| function | mutant_idle | 177 | a-auditer | |
| function | mutant_walk | 188 | a-auditer | |
| global | mutant_frames_walk | 190 | a-auditer | |
| table | mutant_frames_walk | 190 | a-auditer | |
| global | mutant_move_walk | 205 | a-auditer | |
| function | mutant_walk_loop | 207 | a-auditer | |
| global | mutant_frames_start_walk | 212 | a-auditer | |
| table | mutant_frames_start_walk | 212 | a-auditer | |
| global | mutant_move_start_walk | 219 | a-auditer | |
| function | mutant_walk | 221 | a-auditer | |
| global | mutant_frames_run | 231 | a-auditer | |
| table | mutant_frames_run | 231 | a-auditer | |
| global | mutant_move_run | 240 | a-auditer | |
| function | mutant_run | 242 | a-auditer | |
| function | mutant_hit_left | 255 | a-auditer | |
| function | mutant_hit_right | 266 | a-auditer | |
| function | mutant_check_refire | 277 | a-auditer | |
| global | mutant_frames_attack | 286 | a-auditer | |
| table | mutant_frames_attack | 286 | a-auditer | |
| global | mutant_move_attack | 296 | a-auditer | |
| function | mutant_melee | 298 | a-auditer | |
| function | mutant_jump_touch | 308 | a-auditer | |
| global | damage | 322 | a-auditer | |
| function | mutant_jump_takeoff | 345 | a-auditer | |
| function | mutant_check_landing | 360 | a-auditer | |
| global | mutant_frames_jump | 376 | a-auditer | |
| table | mutant_frames_jump | 376 | a-auditer | |
| global | mutant_move_jump | 387 | a-auditer | |
| function | mutant_jump | 389 | a-auditer | |
| function | mutant_check_melee | 399 | a-auditer | |
| function | mutant_check_jump | 406 | a-auditer | |
| global | distance | 409 | a-auditer | |
| function | mutant_checkattack | 433 | a-auditer | |
| global | mutant_frames_pain1 | 459 | a-auditer | |
| table | mutant_frames_pain1 | 459 | a-auditer | |
| global | mutant_move_pain1 | 467 | a-auditer | |
| global | mutant_frames_pain2 | 469 | a-auditer | |
| table | mutant_frames_pain2 | 469 | a-auditer | |
| global | mutant_move_pain2 | 478 | a-auditer | |
| global | mutant_frames_pain3 | 480 | a-auditer | |
| table | mutant_frames_pain3 | 480 | a-auditer | |
| global | mutant_move_pain3 | 494 | a-auditer | |
| function | mutant_pain | 496 | a-auditer | |
| global | r | 498 | a-auditer | |
| function | mutant_dead | 534 | a-auditer | |
| global | mutant_frames_death1 | 545 | a-auditer | |
| table | mutant_frames_death1 | 545 | a-auditer | |
| global | mutant_move_death1 | 557 | a-auditer | |
| global | mutant_frames_death2 | 559 | a-auditer | |
| table | mutant_frames_death2 | 559 | a-auditer | |
| global | mutant_move_death2 | 572 | a-auditer | |
| function | mutant_die | 574 | a-auditer | |
| global | n | 576 | a-auditer | |
| function | SP_monster_mutant | 611 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

