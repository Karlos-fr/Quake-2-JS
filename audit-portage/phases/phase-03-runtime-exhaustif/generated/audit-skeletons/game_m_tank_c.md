# Inventaire runtime Phase 03 - Quake-2-master/game/m_tank.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_tank.ts
- Cibles TS declarees : packages/game/src/m_tank.ts, packages/game/src/g_save.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts, packages/game/src/m_flash.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | tank_refire_rocket | 32 | a-auditer | |
| function | tank_doattack_rocket | 33 | a-auditer | |
| function | tank_reattack_blaster | 34 | a-auditer | |
| global | sound_thud | 36 | a-auditer | |
| global | sound_pain | 37 | a-auditer | |
| global | sound_idle | 38 | a-auditer | |
| global | sound_die | 39 | a-auditer | |
| global | sound_step | 40 | a-auditer | |
| global | sound_sight | 41 | a-auditer | |
| global | sound_windup | 42 | a-auditer | |
| global | sound_strike | 43 | a-auditer | |
| function | tank_sight | 49 | a-auditer | |
| function | tank_footstep | 55 | a-auditer | |
| function | tank_thud | 60 | a-auditer | |
| function | tank_windup | 65 | a-auditer | |
| function | tank_idle | 70 | a-auditer | |
| global | tank_frames_stand | 80 | a-auditer | |
| table | tank_frames_stand | 80 | a-auditer | |
| global | tank_move_stand | 113 | a-auditer | |
| function | tank_stand | 115 | a-auditer | |
| function | tank_walk | 125 | a-auditer | |
| global | tank_frames_start_walk | 127 | a-auditer | |
| table | tank_frames_start_walk | 127 | a-auditer | |
| global | tank_move_start_walk | 134 | a-auditer | |
| global | tank_frames_walk | 136 | a-auditer | |
| table | tank_frames_walk | 136 | a-auditer | |
| global | tank_move_walk | 155 | a-auditer | |
| global | tank_frames_stop_walk | 157 | a-auditer | |
| table | tank_frames_stop_walk | 157 | a-auditer | |
| global | tank_move_stop_walk | 165 | a-auditer | |
| function | tank_walk | 167 | a-auditer | |
| function | tank_run | 177 | a-auditer | |
| global | tank_frames_start_run | 179 | a-auditer | |
| table | tank_frames_start_run | 179 | a-auditer | |
| global | tank_move_start_run | 186 | a-auditer | |
| global | tank_frames_run | 188 | a-auditer | |
| table | tank_frames_run | 188 | a-auditer | |
| global | tank_move_run | 207 | a-auditer | |
| global | tank_frames_stop_run | 209 | a-auditer | |
| table | tank_frames_stop_run | 209 | a-auditer | |
| global | tank_move_stop_run | 217 | a-auditer | |
| function | tank_run | 219 | a-auditer | |
| global | tank_frames_pain1 | 247 | a-auditer | |
| table | tank_frames_pain1 | 247 | a-auditer | |
| global | tank_move_pain1 | 254 | a-auditer | |
| global | tank_frames_pain2 | 256 | a-auditer | |
| table | tank_frames_pain2 | 256 | a-auditer | |
| global | tank_move_pain2 | 264 | a-auditer | |
| global | tank_frames_pain3 | 266 | a-auditer | |
| table | tank_frames_pain3 | 266 | a-auditer | |
| global | tank_move_pain3 | 285 | a-auditer | |
| function | tank_pain | 288 | a-auditer | |
| function | TankBlaster | 331 | a-auditer | |
| global | flash_number | 337 | a-auditer | |
| global | flash_number | 344 | a-auditer | |
| function | TankStrike | 356 | a-auditer | |
| function | TankRocket | 361 | a-auditer | |
| global | flash_number | 367 | a-auditer | |
| global | flash_number | 374 | a-auditer | |
| function | TankMachineGun | 387 | a-auditer | |
| global | flash_number | 393 | a-auditer | |
| global | dir | 415 | a-auditer | |
| global | tank_frames_attack_blast | 424 | a-auditer | |
| table | tank_frames_attack_blast | 424 | a-auditer | |
| global | tank_move_attack_blast | 443 | a-auditer | |
| global | tank_frames_reattack_blast | 445 | a-auditer | |
| table | tank_frames_reattack_blast | 445 | a-auditer | |
| global | tank_move_reattack_blast | 454 | a-auditer | |
| global | tank_frames_attack_post_blast | 456 | a-auditer | |
| table | tank_frames_attack_post_blast | 456 | a-auditer | |
| global | tank_move_attack_post_blast | 465 | a-auditer | |
| function | tank_reattack_blaster | 467 | a-auditer | |
| function | tank_poststrike | 481 | a-auditer | |
| global | tank_frames_attack_strike | 487 | a-auditer | |
| table | tank_frames_attack_strike | 487 | a-auditer | |
| global | tank_move_attack_strike | 528 | a-auditer | |
| global | tank_frames_attack_pre_rocket | 530 | a-auditer | |
| table | tank_frames_attack_pre_rocket | 530 | a-auditer | |
| global | tank_move_attack_pre_rocket | 556 | a-auditer | |
| global | tank_frames_attack_fire_rocket | 558 | a-auditer | |
| table | tank_frames_attack_fire_rocket | 558 | a-auditer | |
| global | tank_move_attack_fire_rocket | 570 | a-auditer | |
| global | tank_frames_attack_post_rocket | 572 | a-auditer | |
| table | tank_frames_attack_post_rocket | 572 | a-auditer | |
| global | tank_move_attack_post_rocket | 600 | a-auditer | |
| global | tank_frames_attack_chain | 602 | a-auditer | |
| table | tank_frames_attack_chain | 602 | a-auditer | |
| global | tank_move_attack_chain | 634 | a-auditer | |
| function | tank_refire_rocket | 636 | a-auditer | |
| function | tank_doattack_rocket | 650 | a-auditer | |
| function | tank_attack | 655 | a-auditer | |
| global | range | 658 | a-auditer | |
| global | r | 659 | a-auditer | |
| function | tank_dead | 706 | a-auditer | |
| global | tank_frames_death1 | 716 | a-auditer | |
| table | tank_frames_death1 | 716 | a-auditer | |
| global | tank_move_death | 751 | a-auditer | |
| function | tank_die | 753 | a-auditer | |
| global | n | 755 | a-auditer | |
| function | SP_monster_tank | 792 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

