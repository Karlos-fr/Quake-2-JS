# Inventaire runtime Phase 03 - Quake-2-master/game/m_hover.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_hover.ts
- Cibles TS declarees : packages/game/src/m_hover.ts, packages/game/src/g_spawn.ts, packages/game/src/g_save.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | visible | 31 | a-auditer | |
| global | sound_pain1 | 34 | a-auditer | |
| global | sound_pain2 | 35 | a-auditer | |
| global | sound_death1 | 36 | a-auditer | |
| global | sound_death2 | 37 | a-auditer | |
| global | sound_sight | 38 | a-auditer | |
| global | sound_search1 | 39 | a-auditer | |
| global | sound_search2 | 40 | a-auditer | |
| function | hover_sight | 43 | a-auditer | |
| function | hover_search | 48 | a-auditer | |
| function | hover_run | 57 | a-auditer | |
| function | hover_stand | 58 | a-auditer | |
| function | hover_dead | 59 | a-auditer | |
| function | hover_attack | 60 | a-auditer | |
| function | hover_reattack | 61 | a-auditer | |
| function | hover_fire_blaster | 62 | a-auditer | |
| function | hover_die | 63 | a-auditer | |
| global | hover_frames_stand | 65 | a-auditer | |
| table | hover_frames_stand | 65 | a-auditer | |
| global | hover_move_stand | 98 | a-auditer | |
| global | hover_frames_stop1 | 100 | a-auditer | |
| table | hover_frames_stop1 | 100 | a-auditer | |
| global | hover_move_stop1 | 112 | a-auditer | |
| global | hover_frames_stop2 | 114 | a-auditer | |
| table | hover_frames_stop2 | 114 | a-auditer | |
| global | hover_move_stop2 | 125 | a-auditer | |
| global | hover_frames_takeoff | 127 | a-auditer | |
| table | hover_frames_takeoff | 127 | a-auditer | |
| global | hover_move_takeoff | 160 | a-auditer | |
| global | hover_frames_pain3 | 162 | a-auditer | |
| table | hover_frames_pain3 | 162 | a-auditer | |
| global | hover_move_pain3 | 174 | a-auditer | |
| global | hover_frames_pain2 | 176 | a-auditer | |
| table | hover_frames_pain2 | 176 | a-auditer | |
| global | hover_move_pain2 | 191 | a-auditer | |
| global | hover_frames_pain1 | 193 | a-auditer | |
| table | hover_frames_pain1 | 193 | a-auditer | |
| global | hover_move_pain1 | 224 | a-auditer | |
| global | hover_frames_land | 226 | a-auditer | |
| table | hover_frames_land | 226 | a-auditer | |
| global | hover_move_land | 230 | a-auditer | |
| global | hover_frames_forward | 232 | a-auditer | |
| table | hover_frames_forward | 232 | a-auditer | |
| global | hover_move_forward | 270 | a-auditer | |
| global | hover_frames_walk | 272 | a-auditer | |
| table | hover_frames_walk | 272 | a-auditer | |
| global | hover_move_walk | 310 | a-auditer | |
| global | hover_frames_run | 312 | a-auditer | |
| table | hover_frames_run | 312 | a-auditer | |
| global | hover_move_run | 350 | a-auditer | |
| global | hover_frames_death1 | 352 | a-auditer | |
| table | hover_frames_death1 | 352 | a-auditer | |
| global | hover_move_death1 | 366 | a-auditer | |
| global | hover_frames_backward | 368 | a-auditer | |
| table | hover_frames_backward | 368 | a-auditer | |
| global | hover_move_backward | 395 | a-auditer | |
| global | hover_frames_start_attack | 397 | a-auditer | |
| table | hover_frames_start_attack | 397 | a-auditer | |
| global | hover_move_start_attack | 403 | a-auditer | |
| global | hover_frames_attack1 | 405 | a-auditer | |
| table | hover_frames_attack1 | 405 | a-auditer | |
| global | hover_move_attack1 | 411 | a-auditer | |
| global | hover_frames_end_attack | 414 | a-auditer | |
| table | hover_frames_end_attack | 414 | a-auditer | |
| global | hover_move_end_attack | 419 | a-auditer | |
| function | hover_reattack | 421 | a-auditer | |
| function | hover_fire_blaster | 434 | a-auditer | |
| global | effect | 440 | a-auditer | |
| global | effect | 445 | a-auditer | |
| function | hover_stand | 458 | a-auditer | |
| function | hover_run | 463 | a-auditer | |
| function | hover_walk | 471 | a-auditer | |
| function | hover_start_attack | 476 | a-auditer | |
| function | hover_attack | 481 | a-auditer | |
| function | hover_pain | 487 | a-auditer | |
| function | hover_deadthink | 520 | a-auditer | |
| function | hover_dead | 530 | a-auditer | |
| function | hover_die | 541 | a-auditer | |
| global | n | 543 | a-auditer | |
| function | SP_monster_hover | 573 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

