# Inventaire runtime Phase 03 - Quake-2-master/game/m_soldier.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_soldier.ts
- Cibles TS declarees : packages/game/src/m_soldier.ts, packages/game/src/g_combat.ts, packages/game/src/g_save.ts, packages/game/src/g_spawn.ts, packages/game/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sound_idle | 32 | a-auditer | |
| global | sound_sight1 | 33 | a-auditer | |
| global | sound_sight2 | 34 | a-auditer | |
| global | sound_pain_light | 35 | a-auditer | |
| global | sound_pain | 36 | a-auditer | |
| global | sound_pain_ss | 37 | a-auditer | |
| global | sound_death_light | 38 | a-auditer | |
| global | sound_death | 39 | a-auditer | |
| global | sound_death_ss | 40 | a-auditer | |
| global | sound_cock | 41 | a-auditer | |
| function | soldier_idle | 44 | a-auditer | |
| function | soldier_cock | 50 | a-auditer | |
| function | soldier_stand | 61 | a-auditer | |
| global | soldier_frames_stand1 | 63 | a-auditer | |
| table | soldier_frames_stand1 | 63 | a-auditer | |
| global | soldier_move_stand1 | 98 | a-auditer | |
| global | soldier_frames_stand3 | 100 | a-auditer | |
| table | soldier_frames_stand3 | 100 | a-auditer | |
| global | soldier_move_stand3 | 145 | a-auditer | |
| function | soldier_stand | 211 | a-auditer | |
| function | soldier_walk1_random | 224 | a-auditer | |
| global | soldier_frames_walk1 | 230 | a-auditer | |
| table | soldier_frames_walk1 | 230 | a-auditer | |
| global | soldier_move_walk1 | 266 | a-auditer | |
| global | soldier_frames_walk2 | 268 | a-auditer | |
| table | soldier_frames_walk2 | 268 | a-auditer | |
| global | soldier_move_walk2 | 281 | a-auditer | |
| function | soldier_walk | 283 | a-auditer | |
| function | soldier_run | 296 | a-auditer | |
| global | soldier_frames_start_run | 298 | a-auditer | |
| table | soldier_frames_start_run | 298 | a-auditer | |
| global | soldier_move_start_run | 303 | a-auditer | |
| global | soldier_frames_run | 305 | a-auditer | |
| table | soldier_frames_run | 305 | a-auditer | |
| global | soldier_move_run | 314 | a-auditer | |
| function | soldier_run | 316 | a-auditer | |
| global | soldier_frames_pain1 | 341 | a-auditer | |
| table | soldier_frames_pain1 | 341 | a-auditer | |
| global | soldier_move_pain1 | 349 | a-auditer | |
| global | soldier_frames_pain2 | 351 | a-auditer | |
| table | soldier_frames_pain2 | 351 | a-auditer | |
| global | soldier_move_pain2 | 361 | a-auditer | |
| global | soldier_frames_pain3 | 363 | a-auditer | |
| table | soldier_frames_pain3 | 363 | a-auditer | |
| global | soldier_move_pain3 | 384 | a-auditer | |
| global | soldier_frames_pain4 | 386 | a-auditer | |
| table | soldier_frames_pain4 | 386 | a-auditer | |
| global | soldier_move_pain4 | 406 | a-auditer | |
| function | soldier_pain | 409 | a-auditer | |
| global | r | 411 | a-auditer | |
| global | n | 412 | a-auditer | |
| global | blaster_flash | 458 | a-auditer | |
| table | blaster_flash | 458 | a-auditer | |
| global | shotgun_flash | 459 | a-auditer | |
| table | shotgun_flash | 459 | a-auditer | |
| global | machinegun_flash | 460 | a-auditer | |
| table | machinegun_flash | 460 | a-auditer | |
| function | soldier_fire | 462 | a-auditer | |
| global | flash_index | 470 | a-auditer | |
| global | flash_index | 477 | a-auditer | |
| function | soldier_fire1 | 528 | a-auditer | |
| function | soldier_attack1_refire1 | 533 | a-auditer | |
| function | soldier_attack1_refire2 | 547 | a-auditer | |
| global | soldier_frames_attack1 | 559 | a-auditer | |
| table | soldier_frames_attack1 | 559 | a-auditer | |
| global | soldier_move_attack1 | 574 | a-auditer | |
| function | soldier_fire2 | 578 | a-auditer | |
| function | soldier_attack2_refire1 | 583 | a-auditer | |
| function | soldier_attack2_refire2 | 597 | a-auditer | |
| global | soldier_frames_attack2 | 609 | a-auditer | |
| table | soldier_frames_attack2 | 609 | a-auditer | |
| global | soldier_move_attack2 | 630 | a-auditer | |
| function | soldier_duck_down | 634 | a-auditer | |
| function | soldier_duck_up | 645 | a-auditer | |
| function | soldier_fire3 | 653 | a-auditer | |
| function | soldier_attack3_refire | 659 | a-auditer | |
| global | soldier_frames_attack3 | 665 | a-auditer | |
| table | soldier_frames_attack3 | 665 | a-auditer | |
| global | soldier_move_attack3 | 677 | a-auditer | |
| function | soldier_fire4 | 681 | a-auditer | |
| global | soldier_frames_attack4 | 692 | a-auditer | |
| table | soldier_frames_attack4 | 692 | a-auditer | |
| global | soldier_move_attack4 | 701 | a-auditer | |
| function | soldier_fire8 | 736 | a-auditer | |
| function | soldier_attack6_refire | 741 | a-auditer | |
| global | soldier_frames_attack6 | 753 | a-auditer | |
| table | soldier_frames_attack6 | 753 | a-auditer | |
| global | soldier_move_attack6 | 770 | a-auditer | |
| function | soldier_attack | 772 | a-auditer | |
| function | soldier_sight | 792 | a-auditer | |
| function | soldier_duck_hold | 810 | a-auditer | |
| global | soldier_frames_duck | 818 | a-auditer | |
| table | soldier_frames_duck | 818 | a-auditer | |
| global | soldier_move_duck | 826 | a-auditer | |
| function | soldier_dodge | 828 | a-auditer | |
| global | r | 830 | a-auditer | |
| function | soldier_fire6 | 874 | a-auditer | |
| function | soldier_fire7 | 879 | a-auditer | |
| function | soldier_dead | 884 | a-auditer | |
| global | soldier_frames_death1 | 894 | a-auditer | |
| table | soldier_frames_death1 | 894 | a-auditer | |
| global | soldier_move_death1 | 936 | a-auditer | |
| global | soldier_frames_death2 | 938 | a-auditer | |
| table | soldier_frames_death2 | 938 | a-auditer | |
| global | soldier_move_death2 | 979 | a-auditer | |
| global | soldier_frames_death3 | 981 | a-auditer | |
| table | soldier_frames_death3 | 981 | a-auditer | |
| global | soldier_move_death3 | 1033 | a-auditer | |
| global | soldier_frames_death4 | 1035 | a-auditer | |
| table | soldier_frames_death4 | 1035 | a-auditer | |
| global | soldier_move_death4 | 1096 | a-auditer | |
| global | soldier_frames_death5 | 1098 | a-auditer | |
| table | soldier_frames_death5 | 1098 | a-auditer | |
| global | soldier_move_death5 | 1127 | a-auditer | |
| global | soldier_frames_death6 | 1129 | a-auditer | |
| table | soldier_frames_death6 | 1129 | a-auditer | |
| global | soldier_move_death6 | 1142 | a-auditer | |
| function | soldier_die | 1144 | a-auditer | |
| global | n | 1146 | a-auditer | |
| function | SP_monster_soldier_x | 1200 | a-auditer | |
| function | SP_monster_soldier_light | 1238 | a-auditer | |
| function | SP_monster_soldier | 1261 | a-auditer | |
| function | SP_monster_soldier_ss | 1282 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

