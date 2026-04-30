# Inventaire runtime Phase 03 - Quake-2-master/game/m_boss31.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_boss31.ts
- Cibles TS declarees : packages/game/src/m_boss31.ts, packages/game/src/m_boss32.ts, packages/game/src/g_spawn.ts, packages/game/src/g_save.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | SP_monster_makron | 31 | a-auditer | |
| function | visible | 32 | a-auditer | |
| global | sound_pain1 | 34 | a-auditer | |
| global | sound_pain2 | 35 | a-auditer | |
| global | sound_pain3 | 36 | a-auditer | |
| global | sound_idle | 37 | a-auditer | |
| global | sound_death | 38 | a-auditer | |
| global | sound_search1 | 39 | a-auditer | |
| global | sound_search2 | 40 | a-auditer | |
| global | sound_search3 | 41 | a-auditer | |
| global | sound_attack1 | 42 | a-auditer | |
| global | sound_attack2 | 43 | a-auditer | |
| global | sound_firegun | 44 | a-auditer | |
| global | sound_step_left | 45 | a-auditer | |
| global | sound_step_right | 46 | a-auditer | |
| global | sound_death_hit | 47 | a-auditer | |
| function | BossExplode | 49 | a-auditer | |
| function | MakronToss | 50 | a-auditer | |
| function | jorg_search | 53 | a-auditer | |
| global | r | 55 | a-auditer | |
| function | jorg_dead | 68 | a-auditer | |
| function | jorgBFG | 69 | a-auditer | |
| function | jorgMachineGun | 70 | a-auditer | |
| function | jorg_firebullet | 71 | a-auditer | |
| function | jorg_reattack1 | 72 | a-auditer | |
| function | jorg_attack1 | 73 | a-auditer | |
| function | jorg_idle | 74 | a-auditer | |
| function | jorg_step_left | 75 | a-auditer | |
| function | jorg_step_right | 76 | a-auditer | |
| function | jorg_death_hit | 77 | a-auditer | |
| global | jorg_frames_stand | 83 | a-auditer | |
| table | jorg_frames_stand | 83 | a-auditer | |
| global | jorg_move_stand | 137 | a-auditer | |
| function | jorg_idle | 139 | a-auditer | |
| function | jorg_death_hit | 144 | a-auditer | |
| function | jorg_step_left | 150 | a-auditer | |
| function | jorg_step_right | 155 | a-auditer | |
| function | jorg_stand | 161 | a-auditer | |
| global | jorg_frames_run | 166 | a-auditer | |
| table | jorg_frames_run | 166 | a-auditer | |
| global | jorg_move_run | 183 | a-auditer | |
| global | jorg_frames_start_walk | 189 | a-auditer | |
| table | jorg_frames_start_walk | 189 | a-auditer | |
| global | jorg_move_start_walk | 197 | a-auditer | |
| global | jorg_frames_walk | 199 | a-auditer | |
| table | jorg_frames_walk | 199 | a-auditer | |
| global | jorg_move_walk | 216 | a-auditer | |
| global | jorg_frames_end_walk | 218 | a-auditer | |
| table | jorg_frames_end_walk | 218 | a-auditer | |
| global | jorg_move_end_walk | 227 | a-auditer | |
| function | jorg_walk | 229 | a-auditer | |
| function | jorg_run | 234 | a-auditer | |
| global | jorg_frames_pain3 | 242 | a-auditer | |
| table | jorg_frames_pain3 | 242 | a-auditer | |
| global | jorg_move_pain3 | 270 | a-auditer | |
| global | jorg_frames_pain2 | 272 | a-auditer | |
| table | jorg_frames_pain2 | 272 | a-auditer | |
| global | jorg_move_pain2 | 278 | a-auditer | |
| global | jorg_frames_pain1 | 280 | a-auditer | |
| table | jorg_frames_pain1 | 280 | a-auditer | |
| global | jorg_move_pain1 | 286 | a-auditer | |
| global | jorg_frames_death1 | 288 | a-auditer | |
| table | jorg_frames_death1 | 288 | a-auditer | |
| global | jorg_move_death | 341 | a-auditer | |
| global | jorg_frames_attack2 | 343 | a-auditer | |
| table | jorg_frames_attack2 | 343 | a-auditer | |
| global | jorg_move_attack2 | 359 | a-auditer | |
| global | jorg_frames_start_attack1 | 361 | a-auditer | |
| table | jorg_frames_start_attack1 | 361 | a-auditer | |
| global | jorg_move_start_attack1 | 372 | a-auditer | |
| global | jorg_frames_attack1 | 374 | a-auditer | |
| table | jorg_frames_attack1 | 374 | a-auditer | |
| global | jorg_move_attack1 | 383 | a-auditer | |
| global | jorg_frames_end_attack1 | 385 | a-auditer | |
| table | jorg_frames_end_attack1 | 385 | a-auditer | |
| global | jorg_move_end_attack1 | 392 | a-auditer | |
| function | jorg_reattack1 | 394 | a-auditer | |
| function | jorg_attack1 | 411 | a-auditer | |
| function | jorg_pain | 416 | a-auditer | |
| function | jorgBFG | 475 | a-auditer | |
| function | jorg_firebullet_right | 501 | a-auditer | |
| function | jorg_firebullet_left | 517 | a-auditer | |
| function | jorg_firebullet | 533 | a-auditer | |
| function | jorg_attack | 539 | a-auditer | |
| global | range | 542 | a-auditer | |
| function | jorg_dead | 560 | a-auditer | |
| function | jorg_die | 589 | a-auditer | |
| function | Jorg_CheckAttack | 599 | a-auditer | |
| global | chance | 603 | a-auditer | |
| global | tr | 604 | a-auditer | |
| global | enemy_infront | 605 | a-auditer | |
| global | enemy_range | 606 | a-auditer | |
| global | enemy_yaw | 607 | a-auditer | |
| function | MakronPrecache | 692 | a-auditer | |
| function | SP_monster_jorg | 696 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

