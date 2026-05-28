# Inventaire runtime Phase 03 - Quake-2-master/game/m_chick.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_chick.ts
- Cibles TS declarees : packages/game/src/m_chick.ts, packages/game/src/g_save.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | visible | 31 | a-auditer | |
| function | chick_stand | 33 | a-auditer | |
| function | chick_run | 34 | a-auditer | |
| function | chick_reslash | 35 | a-auditer | |
| function | chick_rerocket | 36 | a-auditer | |
| function | chick_attack1 | 37 | a-auditer | |
| global | sound_missile_prelaunch | 39 | a-auditer | |
| global | sound_missile_launch | 40 | a-auditer | |
| global | sound_melee_swing | 41 | a-auditer | |
| global | sound_melee_hit | 42 | a-auditer | |
| global | sound_missile_reload | 43 | a-auditer | |
| global | sound_death1 | 44 | a-auditer | |
| global | sound_death2 | 45 | a-auditer | |
| global | sound_fall_down | 46 | a-auditer | |
| global | sound_idle1 | 47 | a-auditer | |
| global | sound_idle2 | 48 | a-auditer | |
| global | sound_pain1 | 49 | a-auditer | |
| global | sound_pain2 | 50 | a-auditer | |
| global | sound_pain3 | 51 | a-auditer | |
| global | sound_sight | 52 | a-auditer | |
| global | sound_search | 53 | a-auditer | |
| function | ChickMoan | 56 | a-auditer | |
| global | chick_frames_fidget | 64 | a-auditer | |
| table | chick_frames_fidget | 64 | a-auditer | |
| global | chick_move_fidget | 97 | a-auditer | |
| function | chick_fidget | 99 | a-auditer | |
| global | chick_frames_stand | 107 | a-auditer | |
| table | chick_frames_stand | 107 | a-auditer | |
| global | chick_move_stand | 141 | a-auditer | |
| function | chick_stand | 143 | a-auditer | |
| global | chick_frames_start_run | 148 | a-auditer | |
| table | chick_frames_start_run | 148 | a-auditer | |
| global | chick_move_start_run | 161 | a-auditer | |
| global | chick_frames_run | 163 | a-auditer | |
| table | chick_frames_run | 163 | a-auditer | |
| global | chick_move_run | 178 | a-auditer | |
| global | chick_frames_walk | 180 | a-auditer | |
| table | chick_frames_walk | 180 | a-auditer | |
| global | chick_move_walk | 194 | a-auditer | |
| function | chick_walk | 196 | a-auditer | |
| function | chick_run | 201 | a-auditer | |
| global | chick_frames_pain1 | 220 | a-auditer | |
| table | chick_frames_pain1 | 220 | a-auditer | |
| global | chick_move_pain1 | 228 | a-auditer | |
| global | chick_frames_pain2 | 230 | a-auditer | |
| table | chick_frames_pain2 | 230 | a-auditer | |
| global | chick_move_pain2 | 238 | a-auditer | |
| global | chick_frames_pain3 | 240 | a-auditer | |
| table | chick_frames_pain3 | 240 | a-auditer | |
| global | chick_move_pain3 | 264 | a-auditer | |
| function | chick_pain | 266 | a-auditer | |
| global | r | 268 | a-auditer | |
| function | chick_dead | 297 | a-auditer | |
| global | chick_frames_death2 | 307 | a-auditer | |
| table | chick_frames_death2 | 307 | a-auditer | |
| global | chick_move_death2 | 333 | a-auditer | |
| global | chick_frames_death1 | 335 | a-auditer | |
| table | chick_frames_death1 | 335 | a-auditer | |
| global | chick_move_death1 | 351 | a-auditer | |
| function | chick_die | 353 | a-auditer | |
| global | n | 355 | a-auditer | |
| function | chick_duck_down | 391 | a-auditer | |
| function | chick_duck_hold | 402 | a-auditer | |
| function | chick_duck_up | 410 | a-auditer | |
| global | chick_frames_duck | 418 | a-auditer | |
| table | chick_frames_duck | 418 | a-auditer | |
| global | chick_move_duck | 428 | a-auditer | |
| function | chick_dodge | 430 | a-auditer | |
| function | ChickSlash | 441 | a-auditer | |
| function | ChickRocket | 451 | a-auditer | |
| function | Chick_PreAttack1 | 469 | a-auditer | |
| function | ChickReload | 474 | a-auditer | |
| global | chick_frames_start_attack1 | 480 | a-auditer | |
| table | chick_frames_start_attack1 | 480 | a-auditer | |
| global | chick_move_start_attack1 | 496 | a-auditer | |
| global | chick_frames_attack1 | 499 | a-auditer | |
| table | chick_frames_attack1 | 499 | a-auditer | |
| global | chick_move_attack1 | 517 | a-auditer | |
| global | chick_frames_end_attack1 | 519 | a-auditer | |
| table | chick_frames_end_attack1 | 519 | a-auditer | |
| global | chick_move_end_attack1 | 527 | a-auditer | |
| function | chick_rerocket | 529 | a-auditer | |
| function | chick_attack1 | 544 | a-auditer | |
| global | chick_frames_slash | 549 | a-auditer | |
| table | chick_frames_slash | 549 | a-auditer | |
| global | chick_move_slash | 561 | a-auditer | |
| global | chick_frames_end_slash | 563 | a-auditer | |
| table | chick_frames_end_slash | 563 | a-auditer | |
| global | chick_move_end_slash | 570 | a-auditer | |
| function | chick_reslash | 573 | a-auditer | |
| function | chick_slash | 592 | a-auditer | |
| global | chick_frames_start_slash | 598 | a-auditer | |
| table | chick_frames_start_slash | 598 | a-auditer | |
| global | chick_move_start_slash | 604 | a-auditer | |
| function | chick_melee | 608 | a-auditer | |
| function | chick_attack | 614 | a-auditer | |
| function | chick_sight | 619 | a-auditer | |
| function | SP_monster_chick | 626 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

