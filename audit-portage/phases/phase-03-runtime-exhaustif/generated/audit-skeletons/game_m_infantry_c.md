# Inventaire runtime Phase 03 - Quake-2-master/game/m_infantry.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_infantry.ts
- Cibles TS declarees : packages/game/src/m_infantry.ts, packages/game/src/g_spawn.ts, packages/game/src/g_save.ts, packages/game/src/g_turret.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | InfantryMachineGun | 31 | a-auditer | |
| global | sound_pain1 | 34 | a-auditer | |
| global | sound_pain2 | 35 | a-auditer | |
| global | sound_die1 | 36 | a-auditer | |
| global | sound_die2 | 37 | a-auditer | |
| global | sound_gunshot | 39 | a-auditer | |
| global | sound_weapon_cock | 40 | a-auditer | |
| global | sound_punch_swing | 41 | a-auditer | |
| global | sound_punch_hit | 42 | a-auditer | |
| global | sound_sight | 43 | a-auditer | |
| global | sound_search | 44 | a-auditer | |
| global | sound_idle | 45 | a-auditer | |
| global | infantry_frames_stand | 48 | a-auditer | |
| table | infantry_frames_stand | 48 | a-auditer | |
| global | infantry_move_stand | 73 | a-auditer | |
| function | infantry_stand | 75 | a-auditer | |
| global | infantry_frames_fidget | 81 | a-auditer | |
| table | infantry_frames_fidget | 81 | a-auditer | |
| global | infantry_move_fidget | 133 | a-auditer | |
| function | infantry_fidget | 135 | a-auditer | |
| global | infantry_frames_walk | 141 | a-auditer | |
| table | infantry_frames_walk | 141 | a-auditer | |
| global | infantry_move_walk | 156 | a-auditer | |
| function | infantry_walk | 158 | a-auditer | |
| global | infantry_frames_run | 163 | a-auditer | |
| table | infantry_frames_run | 163 | a-auditer | |
| global | infantry_move_run | 174 | a-auditer | |
| function | infantry_run | 176 | a-auditer | |
| global | infantry_frames_pain1 | 185 | a-auditer | |
| table | infantry_frames_pain1 | 185 | a-auditer | |
| global | infantry_move_pain1 | 198 | a-auditer | |
| global | infantry_frames_pain2 | 200 | a-auditer | |
| table | infantry_frames_pain2 | 200 | a-auditer | |
| global | infantry_move_pain2 | 213 | a-auditer | |
| function | infantry_pain | 215 | a-auditer | |
| global | n | 217 | a-auditer | |
| table | aimangles | 244 | a-auditer | |
| function | InfantryMachineGun | 260 | a-auditer | |
| global | flash_number | 265 | a-auditer | |
| function | infantry_sight | 299 | a-auditer | |
| function | infantry_dead | 304 | a-auditer | |
| global | infantry_frames_death1 | 315 | a-auditer | |
| table | infantry_frames_death1 | 315 | a-auditer | |
| global | infantry_move_death1 | 338 | a-auditer | |
| global | infantry_frames_death2 | 341 | a-auditer | |
| table | infantry_frames_death2 | 341 | a-auditer | |
| global | infantry_move_death2 | 369 | a-auditer | |
| global | infantry_frames_death3 | 371 | a-auditer | |
| table | infantry_frames_death3 | 371 | a-auditer | |
| global | infantry_move_death3 | 383 | a-auditer | |
| function | infantry_die | 386 | a-auditer | |
| global | n | 388 | a-auditer | |
| function | infantry_duck_down | 429 | a-auditer | |
| function | infantry_duck_hold | 440 | a-auditer | |
| function | infantry_duck_up | 448 | a-auditer | |
| global | infantry_frames_duck | 456 | a-auditer | |
| table | infantry_frames_duck | 456 | a-auditer | |
| global | infantry_move_duck | 464 | a-auditer | |
| function | infantry_dodge | 466 | a-auditer | |
| function | infantry_cock_gun | 478 | a-auditer | |
| global | n | 480 | a-auditer | |
| function | infantry_fire | 487 | a-auditer | |
| global | infantry_frames_attack1 | 497 | a-auditer | |
| table | infantry_frames_attack1 | 497 | a-auditer | |
| global | infantry_move_attack1 | 515 | a-auditer | |
| function | infantry_swing | 518 | a-auditer | |
| function | infantry_smack | 523 | a-auditer | |
| global | infantry_frames_attack2 | 532 | a-auditer | |
| table | infantry_frames_attack2 | 532 | a-auditer | |
| global | infantry_move_attack2 | 543 | a-auditer | |
| function | infantry_attack | 545 | a-auditer | |
| function | SP_monster_infantry | 556 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

