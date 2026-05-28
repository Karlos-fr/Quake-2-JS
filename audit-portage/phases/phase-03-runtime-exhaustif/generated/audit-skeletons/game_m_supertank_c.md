# Inventaire runtime Phase 03 - Quake-2-master/game/m_supertank.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_supertank.ts
- Cibles TS declarees : packages/game/src/m_supertank.ts, packages/game/src/g_save.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts, packages/game/src/m_flash.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | visible | 31 | a-auditer | |
| global | sound_pain1 | 33 | a-auditer | |
| global | sound_pain2 | 34 | a-auditer | |
| global | sound_pain3 | 35 | a-auditer | |
| global | sound_death | 36 | a-auditer | |
| global | sound_search1 | 37 | a-auditer | |
| global | sound_search2 | 38 | a-auditer | |
| global | tread_sound | 40 | a-auditer | |
| function | BossExplode | 42 | a-auditer | |
| function | TreadSound | 44 | a-auditer | |
| function | supertank_search | 49 | a-auditer | |
| function | supertank_dead | 58 | a-auditer | |
| function | supertankRocket | 59 | a-auditer | |
| function | supertankMachineGun | 60 | a-auditer | |
| function | supertank_reattack1 | 61 | a-auditer | |
| global | supertank_frames_stand | 68 | a-auditer | |
| table | supertank_frames_stand | 68 | a-auditer | |
| global | supertank_move_stand | 131 | a-auditer | |
| function | supertank_stand | 133 | a-auditer | |
| global | supertank_frames_run | 139 | a-auditer | |
| table | supertank_frames_run | 139 | a-auditer | |
| global | supertank_move_run | 160 | a-auditer | |
| global | supertank_frames_forward | 167 | a-auditer | |
| table | supertank_frames_forward | 167 | a-auditer | |
| global | supertank_move_forward | 188 | a-auditer | |
| function | supertank_forward | 190 | a-auditer | |
| function | supertank_walk | 195 | a-auditer | |
| function | supertank_run | 200 | a-auditer | |
| global | supertank_frames_turn_right | 208 | a-auditer | |
| table | supertank_frames_turn_right | 208 | a-auditer | |
| global | supertank_move_turn_right | 229 | a-auditer | |
| global | supertank_frames_turn_left | 231 | a-auditer | |
| table | supertank_frames_turn_left | 231 | a-auditer | |
| global | supertank_move_turn_left | 252 | a-auditer | |
| global | supertank_frames_pain3 | 255 | a-auditer | |
| table | supertank_frames_pain3 | 255 | a-auditer | |
| global | supertank_move_pain3 | 262 | a-auditer | |
| global | supertank_frames_pain2 | 264 | a-auditer | |
| table | supertank_frames_pain2 | 264 | a-auditer | |
| global | supertank_move_pain2 | 271 | a-auditer | |
| global | supertank_frames_pain1 | 273 | a-auditer | |
| table | supertank_frames_pain1 | 273 | a-auditer | |
| global | supertank_move_pain1 | 280 | a-auditer | |
| global | supertank_frames_death1 | 282 | a-auditer | |
| table | supertank_frames_death1 | 282 | a-auditer | |
| global | supertank_move_death | 309 | a-auditer | |
| global | supertank_frames_backward | 311 | a-auditer | |
| table | supertank_frames_backward | 311 | a-auditer | |
| global | supertank_move_backward | 332 | a-auditer | |
| global | supertank_frames_attack4 | 334 | a-auditer | |
| table | supertank_frames_attack4 | 334 | a-auditer | |
| global | supertank_move_attack4 | 343 | a-auditer | |
| global | supertank_frames_attack3 | 345 | a-auditer | |
| table | supertank_frames_attack3 | 345 | a-auditer | |
| global | supertank_move_attack3 | 375 | a-auditer | |
| global | supertank_frames_attack2 | 377 | a-auditer | |
| table | supertank_frames_attack2 | 377 | a-auditer | |
| global | supertank_move_attack2 | 407 | a-auditer | |
| global | supertank_frames_attack1 | 409 | a-auditer | |
| table | supertank_frames_attack1 | 409 | a-auditer | |
| global | supertank_move_attack1 | 419 | a-auditer | |
| global | supertank_frames_end_attack1 | 421 | a-auditer | |
| table | supertank_frames_end_attack1 | 421 | a-auditer | |
| global | supertank_move_end_attack1 | 438 | a-auditer | |
| function | supertank_reattack1 | 441 | a-auditer | |
| function | supertank_pain | 452 | a-auditer | |
| function | supertankRocket | 494 | a-auditer | |
| global | flash_number | 500 | a-auditer | |
| global | flash_number | 507 | a-auditer | |
| function | supertankMachineGun | 520 | a-auditer | |
| global | flash_number | 526 | a-auditer | |
| function | supertank_attack | 551 | a-auditer | |
| global | range | 554 | a-auditer | |
| function | supertank_dead | 583 | a-auditer | |
| function | BossExplode | 594 | a-auditer | |
| global | n | 597 | a-auditer | |
| function | supertank_die | 657 | a-auditer | |
| function | SP_monster_supertank | 672 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

