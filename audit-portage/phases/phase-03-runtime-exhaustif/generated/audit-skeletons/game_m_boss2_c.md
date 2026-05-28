# Inventaire runtime Phase 03 - Quake-2-master/game/m_boss2.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_boss2.ts
- Cibles TS declarees : packages/game/src/m_boss2.ts, packages/game/src/g_save.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | BossExplode | 31 | a-auditer | |
| function | infront | 33 | a-auditer | |
| global | sound_pain1 | 35 | a-auditer | |
| global | sound_pain2 | 36 | a-auditer | |
| global | sound_pain3 | 37 | a-auditer | |
| global | sound_death | 38 | a-auditer | |
| global | sound_search1 | 39 | a-auditer | |
| function | boss2_search | 41 | a-auditer | |
| function | boss2_run | 47 | a-auditer | |
| function | boss2_stand | 48 | a-auditer | |
| function | boss2_dead | 49 | a-auditer | |
| function | boss2_attack | 50 | a-auditer | |
| function | boss2_attack_mg | 51 | a-auditer | |
| function | boss2_reattack_mg | 52 | a-auditer | |
| function | boss2_die | 53 | a-auditer | |
| function | Boss2Rocket | 55 | a-auditer | |
| function | boss2_firebullet_right | 97 | a-auditer | |
| function | boss2_firebullet_left | 113 | a-auditer | |
| function | Boss2MachineGun | 130 | a-auditer | |
| global | boss2_frames_stand | 154 | a-auditer | |
| table | boss2_frames_stand | 154 | a-auditer | |
| global | boss2_move_stand | 178 | a-auditer | |
| global | boss2_frames_fidget | 180 | a-auditer | |
| table | boss2_frames_fidget | 180 | a-auditer | |
| global | boss2_move_fidget | 213 | a-auditer | |
| global | boss2_frames_walk | 215 | a-auditer | |
| table | boss2_frames_walk | 215 | a-auditer | |
| global | boss2_move_walk | 238 | a-auditer | |
| global | boss2_frames_run | 241 | a-auditer | |
| table | boss2_frames_run | 241 | a-auditer | |
| global | boss2_move_run | 264 | a-auditer | |
| global | boss2_frames_attack_pre_mg | 266 | a-auditer | |
| table | boss2_frames_attack_pre_mg | 266 | a-auditer | |
| global | boss2_move_attack_pre_mg | 278 | a-auditer | |
| global | boss2_frames_attack_mg | 282 | a-auditer | |
| table | boss2_frames_attack_mg | 282 | a-auditer | |
| global | boss2_move_attack_mg | 291 | a-auditer | |
| global | boss2_frames_attack_post_mg | 293 | a-auditer | |
| table | boss2_frames_attack_post_mg | 293 | a-auditer | |
| global | boss2_move_attack_post_mg | 300 | a-auditer | |
| global | boss2_frames_attack_rocket | 302 | a-auditer | |
| table | boss2_frames_attack_rocket | 302 | a-auditer | |
| global | boss2_move_attack_rocket | 326 | a-auditer | |
| global | boss2_frames_pain_heavy | 328 | a-auditer | |
| table | boss2_frames_pain_heavy | 328 | a-auditer | |
| global | boss2_move_pain_heavy | 349 | a-auditer | |
| global | boss2_frames_pain_light | 351 | a-auditer | |
| table | boss2_frames_pain_light | 351 | a-auditer | |
| global | boss2_move_pain_light | 358 | a-auditer | |
| global | boss2_frames_death | 360 | a-auditer | |
| table | boss2_frames_death | 360 | a-auditer | |
| global | boss2_move_death | 412 | a-auditer | |
| function | boss2_stand | 414 | a-auditer | |
| function | boss2_run | 419 | a-auditer | |
| function | boss2_walk | 427 | a-auditer | |
| function | boss2_attack | 432 | a-auditer | |
| global | range | 435 | a-auditer | |
| function | boss2_attack_mg | 453 | a-auditer | |
| function | boss2_reattack_mg | 458 | a-auditer | |
| function | boss2_pain | 470 | a-auditer | |
| function | boss2_dead | 497 | a-auditer | |
| function | boss2_die | 507 | a-auditer | |
| function | Boss2_CheckAttack | 540 | a-auditer | |
| global | chance | 544 | a-auditer | |
| global | tr | 545 | a-auditer | |
| global | enemy_infront | 546 | a-auditer | |
| global | enemy_range | 547 | a-auditer | |
| global | enemy_yaw | 548 | a-auditer | |
| function | SP_monster_boss2 | 636 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

