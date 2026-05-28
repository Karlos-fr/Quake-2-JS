# Inventaire runtime Phase 03 - Quake-2-master/game/g_target.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_target.ts
- Cibles TS declarees : packages/game/src/g_target.ts, packages/game/src/g_main.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts, packages/game/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | Use_Target_Tent | 26 | a-auditer | |
| function | SP_target_temp_entity | 34 | a-auditer | |
| function | Use_Target_Speaker | 58 | a-auditer | |
| global | chan | 60 | a-auditer | |
| global | chan | 74 | a-auditer | |
| function | SP_target_speaker | 81 | a-auditer | |
| global | buffer | 83 | a-auditer | |
| function | strncpy | 93 | a-auditer | |
| function | Use_Target_Help | 118 | a-auditer | |
| function | strncpy | 123 | a-auditer | |
| function | SP_target_help | 131 | a-auditer | |
| function | use_target_secret | 154 | a-auditer | |
| function | SP_target_secret | 164 | a-auditer | |
| function | use_target_goal | 189 | a-auditer | |
| function | SP_target_goal | 202 | a-auditer | |
| function | target_explosion_explode | 227 | a-auditer | |
| global | save | 229 | a-auditer | |
| function | use_target_explosion | 244 | a-auditer | |
| function | SP_target_explosion | 258 | a-auditer | |
| function | use_target_changelevel | 270 | a-auditer | |
| function | SP_target_changelevel | 302 | a-auditer | |
| function | use_target_splash | 338 | a-auditer | |
| function | SP_target_splash | 352 | a-auditer | |
| function | ED_CallSpawn | 378 | a-auditer | |
| function | use_target_spawner | 380 | a-auditer | |
| global | ent | 382 | a-auditer | |
| function | SP_target_spawner | 396 | a-auditer | |
| function | use_target_blaster | 416 | a-auditer | |
| global | effect | 418 | a-auditer | |
| global | effect | 425 | a-auditer | |
| function | SP_target_blaster | 431 | a-auditer | |
| function | trigger_crosslevel_trigger_use | 451 | a-auditer | |
| function | SP_target_crosslevel_trigger | 457 | a-auditer | |
| function | target_crosslevel_target_think | 469 | a-auditer | |
| function | SP_target_crosslevel_target | 478 | a-auditer | |
| function | target_laser_think | 495 | a-auditer | |
| global | ignore | 497 | a-auditer | |
| global | tr | 500 | a-auditer | |
| global | count | 503 | a-auditer | |
| global | count | 508 | a-auditer | |
| function | target_laser_on | 560 | a-auditer | |
| function | target_laser_off | 569 | a-auditer | |
| function | target_laser_use | 576 | a-auditer | |
| function | target_laser_on | 582 | a-auditer | |
| function | target_laser_start | 585 | a-auditer | |
| global | ent | 587 | a-auditer | |
| function | target_laser_off | 639 | a-auditer | |
| function | SP_target_laser | 642 | a-auditer | |
| function | target_lightramp_think | 656 | a-auditer | |
| global | style | 658 | a-auditer | |
| global | temp | 670 | a-auditer | |
| function | target_lightramp_use | 679 | a-auditer | |
| global | e | 683 | a-auditer | |
| function | SP_target_lightramp | 715 | a-auditer | |
| function | target_earthquake_think | 755 | a-auditer | |
| global | i | 757 | a-auditer | |
| global | e | 758 | a-auditer | |
| function | target_earthquake_use | 785 | a-auditer | |
| function | SP_target_earthquake | 793 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

