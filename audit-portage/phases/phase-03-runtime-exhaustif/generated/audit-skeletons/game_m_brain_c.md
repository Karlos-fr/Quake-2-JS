# Inventaire runtime Phase 03 - Quake-2-master/game/m_brain.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_brain.ts
- Cibles TS declarees : packages/game/src/m_brain.ts, packages/game/src/g_save.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sound_chest_open | 32 | a-auditer | |
| global | sound_tentacles_extend | 33 | a-auditer | |
| global | sound_tentacles_retract | 34 | a-auditer | |
| global | sound_death | 35 | a-auditer | |
| global | sound_idle1 | 36 | a-auditer | |
| global | sound_idle2 | 37 | a-auditer | |
| global | sound_idle3 | 38 | a-auditer | |
| global | sound_pain1 | 39 | a-auditer | |
| global | sound_pain2 | 40 | a-auditer | |
| global | sound_sight | 41 | a-auditer | |
| global | sound_search | 42 | a-auditer | |
| global | sound_melee1 | 43 | a-auditer | |
| global | sound_melee2 | 44 | a-auditer | |
| global | sound_melee3 | 45 | a-auditer | |
| function | brain_sight | 48 | a-auditer | |
| function | brain_search | 53 | a-auditer | |
| function | brain_run | 59 | a-auditer | |
| function | brain_dead | 60 | a-auditer | |
| global | brain_frames_stand | 67 | a-auditer | |
| table | brain_frames_stand | 67 | a-auditer | |
| global | brain_move_stand | 102 | a-auditer | |
| function | brain_stand | 104 | a-auditer | |
| global | brain_frames_idle | 114 | a-auditer | |
| table | brain_frames_idle | 114 | a-auditer | |
| global | brain_move_idle | 149 | a-auditer | |
| function | brain_idle | 151 | a-auditer | |
| global | brain_frames_walk1 | 161 | a-auditer | |
| table | brain_frames_walk1 | 161 | a-auditer | |
| global | brain_move_walk1 | 175 | a-auditer | |
| function | brain_walk | 234 | a-auditer | |
| global | brain_frames_defense | 244 | a-auditer | |
| table | brain_frames_defense | 244 | a-auditer | |
| global | brain_move_defense | 256 | a-auditer | |
| global | brain_frames_pain3 | 258 | a-auditer | |
| table | brain_frames_pain3 | 258 | a-auditer | |
| global | brain_move_pain3 | 267 | a-auditer | |
| global | brain_frames_pain2 | 269 | a-auditer | |
| table | brain_frames_pain2 | 269 | a-auditer | |
| global | brain_move_pain2 | 280 | a-auditer | |
| global | brain_frames_pain1 | 282 | a-auditer | |
| table | brain_frames_pain1 | 282 | a-auditer | |
| global | brain_move_pain1 | 306 | a-auditer | |
| function | brain_duck_down | 313 | a-auditer | |
| function | brain_duck_hold | 323 | a-auditer | |
| function | brain_duck_up | 331 | a-auditer | |
| global | brain_frames_duck | 339 | a-auditer | |
| table | brain_frames_duck | 339 | a-auditer | |
| global | brain_move_duck | 350 | a-auditer | |
| function | brain_dodge | 352 | a-auditer | |
| global | brain_frames_death2 | 365 | a-auditer | |
| table | brain_frames_death2 | 365 | a-auditer | |
| global | brain_move_death2 | 373 | a-auditer | |
| global | brain_frames_death1 | 375 | a-auditer | |
| table | brain_frames_death1 | 375 | a-auditer | |
| global | brain_move_death1 | 396 | a-auditer | |
| function | brain_swing_right | 403 | a-auditer | |
| function | brain_hit_right | 408 | a-auditer | |
| function | brain_swing_left | 417 | a-auditer | |
| function | brain_hit_left | 422 | a-auditer | |
| global | brain_frames_attack1 | 431 | a-auditer | |
| table | brain_frames_attack1 | 431 | a-auditer | |
| global | brain_move_attack1 | 452 | a-auditer | |
| function | brain_chest_open | 454 | a-auditer | |
| function | brain_tentacle_attack | 461 | a-auditer | |
| function | brain_chest_closed | 471 | a-auditer | |
| global | brain_frames_attack2 | 481 | a-auditer | |
| table | brain_frames_attack2 | 481 | a-auditer | |
| global | brain_move_attack2 | 501 | a-auditer | |
| function | brain_melee | 503 | a-auditer | |
| global | brain_frames_run | 516 | a-auditer | |
| table | brain_frames_run | 516 | a-auditer | |
| global | brain_move_run | 530 | a-auditer | |
| function | brain_run | 532 | a-auditer | |
| function | brain_pain | 542 | a-auditer | |
| global | r | 544 | a-auditer | |
| function | brain_dead | 574 | a-auditer | |
| function | brain_die | 586 | a-auditer | |
| global | n | 588 | a-auditer | |
| function | SP_monster_brain | 621 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

