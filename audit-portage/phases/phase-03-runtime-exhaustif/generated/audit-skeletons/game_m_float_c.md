# Inventaire runtime Phase 03 - Quake-2-master/game/m_float.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_float.ts
- Cibles TS declarees : packages/game/src/m_float.ts, packages/game/src/g_save.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sound_attack2 | 32 | a-auditer | |
| global | sound_attack3 | 33 | a-auditer | |
| global | sound_death1 | 34 | a-auditer | |
| global | sound_idle | 35 | a-auditer | |
| global | sound_pain1 | 36 | a-auditer | |
| global | sound_pain2 | 37 | a-auditer | |
| global | sound_sight | 38 | a-auditer | |
| function | floater_sight | 41 | a-auditer | |
| function | floater_idle | 46 | a-auditer | |
| function | floater_dead | 53 | a-auditer | |
| function | floater_die | 54 | a-auditer | |
| function | floater_run | 55 | a-auditer | |
| function | floater_wham | 56 | a-auditer | |
| function | floater_zap | 57 | a-auditer | |
| function | floater_fire_blaster | 60 | a-auditer | |
| global | effect | 66 | a-auditer | |
| global | effect | 71 | a-auditer | |
| global | floater_frames_stand1 | 83 | a-auditer | |
| table | floater_frames_stand1 | 83 | a-auditer | |
| global | floater_move_stand1 | 138 | a-auditer | |
| global | floater_frames_stand2 | 140 | a-auditer | |
| table | floater_frames_stand2 | 140 | a-auditer | |
| global | floater_move_stand2 | 195 | a-auditer | |
| function | floater_stand | 197 | a-auditer | |
| global | floater_frames_activate | 205 | a-auditer | |
| table | floater_frames_activate | 205 | a-auditer | |
| global | floater_move_activate | 238 | a-auditer | |
| global | floater_frames_attack1 | 240 | a-auditer | |
| table | floater_frames_attack1 | 240 | a-auditer | |
| global | floater_move_attack1 | 257 | a-auditer | |
| global | floater_frames_attack2 | 259 | a-auditer | |
| table | floater_frames_attack2 | 259 | a-auditer | |
| global | floater_move_attack2 | 287 | a-auditer | |
| global | floater_frames_attack3 | 289 | a-auditer | |
| table | floater_frames_attack3 | 289 | a-auditer | |
| global | floater_move_attack3 | 326 | a-auditer | |
| global | floater_frames_death | 328 | a-auditer | |
| table | floater_frames_death | 328 | a-auditer | |
| global | floater_move_death | 344 | a-auditer | |
| global | floater_frames_pain1 | 346 | a-auditer | |
| table | floater_frames_pain1 | 346 | a-auditer | |
| global | floater_move_pain1 | 356 | a-auditer | |
| global | floater_frames_pain2 | 358 | a-auditer | |
| table | floater_frames_pain2 | 358 | a-auditer | |
| global | floater_move_pain2 | 369 | a-auditer | |
| global | floater_frames_pain3 | 371 | a-auditer | |
| table | floater_frames_pain3 | 371 | a-auditer | |
| global | floater_move_pain3 | 386 | a-auditer | |
| global | floater_frames_walk | 388 | a-auditer | |
| table | floater_frames_walk | 388 | a-auditer | |
| global | floater_move_walk | 443 | a-auditer | |
| global | floater_frames_run | 445 | a-auditer | |
| table | floater_frames_run | 445 | a-auditer | |
| global | floater_move_run | 500 | a-auditer | |
| function | floater_run | 502 | a-auditer | |
| function | floater_walk | 510 | a-auditer | |
| function | floater_wham | 515 | a-auditer | |
| function | floater_zap | 522 | a-auditer | |
| function | floater_attack | 551 | a-auditer | |
| function | floater_melee | 557 | a-auditer | |
| function | floater_pain | 566 | a-auditer | |
| global | n | 568 | a-auditer | |
| function | floater_dead | 593 | a-auditer | |
| function | floater_die | 603 | a-auditer | |
| function | SP_monster_floater | 611 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

