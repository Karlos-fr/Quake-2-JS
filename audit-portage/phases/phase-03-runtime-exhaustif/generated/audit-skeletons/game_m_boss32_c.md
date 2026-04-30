# Inventaire runtime Phase 03 - Quake-2-master/game/m_boss32.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_boss32.ts
- Cibles TS declarees : packages/game/src/m_boss32.ts, packages/game/src/m_boss31.ts, packages/game/src/g_spawn.ts, packages/game/src/g_save.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | visible | 31 | a-auditer | |
| function | MakronRailgun | 33 | a-auditer | |
| function | MakronSaveloc | 34 | a-auditer | |
| function | MakronHyperblaster | 35 | a-auditer | |
| function | makron_step_left | 36 | a-auditer | |
| function | makron_step_right | 37 | a-auditer | |
| function | makronBFG | 38 | a-auditer | |
| function | makron_dead | 39 | a-auditer | |
| global | sound_pain4 | 41 | a-auditer | |
| global | sound_pain5 | 42 | a-auditer | |
| global | sound_pain6 | 43 | a-auditer | |
| global | sound_death | 44 | a-auditer | |
| global | sound_step_left | 45 | a-auditer | |
| global | sound_step_right | 46 | a-auditer | |
| global | sound_attack_bfg | 47 | a-auditer | |
| global | sound_brainsplorch | 48 | a-auditer | |
| global | sound_prerailgun | 49 | a-auditer | |
| global | sound_popup | 50 | a-auditer | |
| global | sound_taunt1 | 51 | a-auditer | |
| global | sound_taunt2 | 52 | a-auditer | |
| global | sound_taunt3 | 53 | a-auditer | |
| global | sound_hit | 54 | a-auditer | |
| function | makron_taunt | 56 | a-auditer | |
| global | r | 58 | a-auditer | |
| global | makron_frames_stand | 73 | a-auditer | |
| table | makron_frames_stand | 73 | a-auditer | |
| global | makron_move_stand | 136 | a-auditer | |
| function | makron_stand | 138 | a-auditer | |
| global | makron_frames_run | 143 | a-auditer | |
| table | makron_frames_run | 143 | a-auditer | |
| global | makron_move_run | 156 | a-auditer | |
| function | makron_hit | 158 | a-auditer | |
| function | makron_popup | 163 | a-auditer | |
| function | makron_step_left | 168 | a-auditer | |
| function | makron_step_right | 173 | a-auditer | |
| function | makron_brainsplorch | 178 | a-auditer | |
| function | makron_prerailgun | 183 | a-auditer | |
| global | makron_frames_walk | 189 | a-auditer | |
| table | makron_frames_walk | 189 | a-auditer | |
| global | makron_move_walk | 202 | a-auditer | |
| function | makron_walk | 204 | a-auditer | |
| function | makron_run | 209 | a-auditer | |
| global | makron_frames_pain6 | 217 | a-auditer | |
| table | makron_frames_pain6 | 217 | a-auditer | |
| global | makron_move_pain6 | 247 | a-auditer | |
| global | makron_frames_pain5 | 249 | a-auditer | |
| table | makron_frames_pain5 | 249 | a-auditer | |
| global | makron_move_pain5 | 256 | a-auditer | |
| global | makron_frames_pain4 | 258 | a-auditer | |
| table | makron_frames_pain4 | 258 | a-auditer | |
| global | makron_move_pain4 | 265 | a-auditer | |
| global | makron_frames_death2 | 267 | a-auditer | |
| table | makron_frames_death2 | 267 | a-auditer | |
| global | makron_move_death2 | 365 | a-auditer | |
| global | makron_frames_death3 | 367 | a-auditer | |
| table | makron_frames_death3 | 367 | a-auditer | |
| global | makron_move_death3 | 390 | a-auditer | |
| global | makron_frames_sight | 392 | a-auditer | |
| table | makron_frames_sight | 392 | a-auditer | |
| global | makron_move_sight | 408 | a-auditer | |
| function | makronBFG | 410 | a-auditer | |
| global | makron_frames_attack3 | 429 | a-auditer | |
| table | makron_frames_attack3 | 429 | a-auditer | |
| global | makron_move_attack3 | 440 | a-auditer | |
| global | makron_frames_attack4 | 442 | a-auditer | |
| table | makron_frames_attack4 | 442 | a-auditer | |
| global | makron_move_attack4 | 471 | a-auditer | |
| global | makron_frames_attack5 | 473 | a-auditer | |
| table | makron_frames_attack5 | 473 | a-auditer | |
| global | makron_move_attack5 | 492 | a-auditer | |
| function | MakronSaveloc | 494 | a-auditer | |
| function | MakronRailgun | 501 | a-auditer | |
| function | MakronHyperblaster | 518 | a-auditer | |
| global | flash_number | 524 | a-auditer | |
| global | dir | 546 | a-auditer | |
| function | makron_pain | 555 | a-auditer | |
| function | makron_sight | 601 | a-auditer | |
| function | makron_attack | 606 | a-auditer | |
| global | range | 609 | a-auditer | |
| global | r | 610 | a-auditer | |
| function | makron_torso_think | 632 | a-auditer | |
| function | makron_torso | 643 | a-auditer | |
| function | makron_dead | 662 | a-auditer | |
| function | makron_die | 673 | a-auditer | |
| global | tempent | 675 | a-auditer | |
| global | n | 677 | a-auditer | |
| function | Makron_CheckAttack | 711 | a-auditer | |
| global | chance | 715 | a-auditer | |
| global | tr | 716 | a-auditer | |
| global | enemy_infront | 717 | a-auditer | |
| global | enemy_range | 718 | a-auditer | |
| global | enemy_yaw | 719 | a-auditer | |
| function | MakronPrecache | 808 | a-auditer | |
| function | SP_monster_makron | 830 | a-auditer | |
| function | MakronSpawn | 877 | a-auditer | |
| global | vec | 879 | a-auditer | |
| global | player | 880 | a-auditer | |
| function | MakronToss | 904 | a-auditer | |
| global | ent | 906 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

