# Inventaire runtime Phase 03 - Quake-2-master/game/g_misc.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_misc.ts
- Cibles TS declarees : packages/game/src/g_misc.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | Use_Areaportal | 31 | a-auditer | |
| function | SP_func_areaportal | 44 | a-auditer | |
| function | VelocityForDamage | 58 | a-auditer | |
| function | VectorScale | 67 | a-auditer | |
| function | ClipGibVelocity | 70 | a-auditer | |
| function | gib_think | 92 | a-auditer | |
| function | gib_touch | 104 | a-auditer | |
| function | gib_die | 130 | a-auditer | |
| function | ThrowGib | 135 | a-auditer | |
| global | gib | 137 | a-auditer | |
| global | vscale | 141 | a-auditer | |
| function | ThrowHead | 183 | a-auditer | |
| global | vscale | 186 | a-auditer | |
| function | ThrowClientHead | 229 | a-auditer | |
| global | gibname | 232 | a-auditer | |
| function | debris_die | 281 | a-auditer | |
| function | ThrowDebris | 286 | a-auditer | |
| global | chunk | 288 | a-auditer | |
| function | BecomeExplosion1 | 314 | a-auditer | |
| function | BecomeExplosion2 | 325 | a-auditer | |
| function | path_corner_touch | 342 | a-auditer | |
| global | v | 344 | a-auditer | |
| global | next | 345 | a-auditer | |
| global | savetarget | 355 | a-auditer | |
| global | next | 366 | a-auditer | |
| function | SP_path_corner | 399 | a-auditer | |
| function | point_combat_touch | 422 | a-auditer | |
| global | activator | 424 | a-auditer | |
| global | savetarget | 457 | a-auditer | |
| global | activator | 468 | a-auditer | |
| function | SP_point_combat | 474 | a-auditer | |
| function | TH_viewthing | 493 | a-auditer | |
| function | SP_viewthing | 499 | a-auditer | |
| function | SP_info_null | 519 | a-auditer | |
| function | SP_info_notnull | 528 | a-auditer | |
| macro | START_OFF | 543 | a-auditer | |
| function | light_use | 545 | a-auditer | |
| function | SP_light | 559 | a-auditer | |
| function | func_wall_use | 593 | a-auditer | |
| function | SP_func_wall | 612 | a-auditer | |
| function | func_object_touch | 665 | a-auditer | |
| function | func_object_release | 677 | a-auditer | |
| function | func_object_use | 683 | a-auditer | |
| function | SP_func_object | 692 | a-auditer | |
| function | func_explosive_explode | 745 | a-auditer | |
| global | count | 750 | a-auditer | |
| global | mass | 751 | a-auditer | |
| function | G_FreeEdict | 806 | a-auditer | |
| function | func_explosive_use | 809 | a-auditer | |
| function | func_explosive_spawn | 814 | a-auditer | |
| function | SP_func_explosive | 823 | a-auditer | |
| function | barrel_touch | 873 | a-auditer | |
| global | ratio | 876 | a-auditer | |
| function | barrel_explode | 887 | a-auditer | |
| global | spd | 890 | a-auditer | |
| function | BecomeExplosion1 | 963 | a-auditer | |
| function | barrel_delay | 966 | a-auditer | |
| function | SP_misc_explobox | 974 | a-auditer | |
| function | misc_blackhole_use | 1021 | a-auditer | |
| function | misc_blackhole_think | 1032 | a-auditer | |
| function | SP_misc_blackhole | 1043 | a-auditer | |
| function | misc_eastertank_think | 1060 | a-auditer | |
| function | SP_misc_eastertank | 1071 | a-auditer | |
| function | misc_easterchick_think | 1088 | a-auditer | |
| function | SP_misc_easterchick | 1099 | a-auditer | |
| function | misc_easterchick2_think | 1116 | a-auditer | |
| function | SP_misc_easterchick2 | 1127 | a-auditer | |
| function | commander_body_think | 1146 | a-auditer | |
| function | commander_body_use | 1157 | a-auditer | |
| function | commander_body_drop | 1164 | a-auditer | |
| function | SP_monster_commander_body | 1170 | a-auditer | |
| function | misc_banner_think | 1196 | a-auditer | |
| function | SP_misc_banner | 1202 | a-auditer | |
| function | misc_deadsoldier_die | 1217 | a-auditer | |
| global | n | 1219 | a-auditer | |
| function | SP_misc_deadsoldier | 1230 | a-auditer | |
| function | train_use | 1275 | a-auditer | |
| function | func_train_find | 1276 | a-auditer | |
| function | misc_viper_use | 1278 | a-auditer | |
| function | SP_misc_viper | 1285 | a-auditer | |
| function | SP_misc_bigviper | 1316 | a-auditer | |
| function | misc_viper_bomb_touch | 1330 | a-auditer | |
| function | misc_viper_bomb_prethink | 1339 | a-auditer | |
| global | diff | 1342 | a-auditer | |
| function | misc_viper_bomb_use | 1358 | a-auditer | |
| global | viper | 1360 | a-auditer | |
| function | SP_misc_viper_bomb | 1378 | a-auditer | |
| function | train_use | 1405 | a-auditer | |
| function | func_train_find | 1406 | a-auditer | |
| function | misc_strogg_ship_use | 1408 | a-auditer | |
| function | SP_misc_strogg_ship | 1415 | a-auditer | |
| function | misc_satellite_dish_think | 1445 | a-auditer | |
| function | misc_satellite_dish_use | 1452 | a-auditer | |
| function | SP_misc_satellite_dish | 1459 | a-auditer | |
| function | SP_light_mine1 | 1473 | a-auditer | |
| function | SP_light_mine2 | 1484 | a-auditer | |
| function | SP_misc_gib_arm | 1496 | a-auditer | |
| function | SP_misc_gib_leg | 1517 | a-auditer | |
| function | SP_misc_gib_head | 1538 | a-auditer | |
| function | SP_target_character | 1563 | a-auditer | |
| function | target_string_use | 1577 | a-auditer | |
| global | e | 1579 | a-auditer | |
| global | c | 1581 | a-auditer | |
| function | SP_target_string | 1607 | a-auditer | |
| macro | CLOCK_MESSAGE_SIZE | 1628 | a-auditer | |
| function | func_clock_reset | 1633 | a-auditer | |
| function | func_clock_format_countdown | 1648 | a-auditer | |
| function | func_clock_think | 1675 | a-auditer | |
| global | gmtime | 1697 | a-auditer | |
| global | savetarget | 1716 | a-auditer | |
| global | savemessage | 1717 | a-auditer | |
| function | func_clock_use | 1740 | a-auditer | |
| function | SP_func_clock | 1750 | a-auditer | |
| function | teleporter_touch | 1783 | a-auditer | |
| global | dest | 1785 | a-auditer | |
| global | i | 1786 | a-auditer | |
| function | SP_misc_teleporter | 1830 | a-auditer | |
| global | trig | 1832 | a-auditer | |
| function | SP_misc_teleporter_dest | 1866 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

