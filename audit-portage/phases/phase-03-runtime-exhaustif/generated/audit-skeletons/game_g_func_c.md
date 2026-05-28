# Inventaire runtime Phase 03 - Quake-2-master/game/g_func.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_func.ts
- Cibles TS declarees : packages/game/src/g_func.ts, packages/game/src/g_misc.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | PLAT_LOW_TRIGGER | 56 | a-auditer | |
| macro | STATE_TOP | 58 | a-auditer | |
| macro | STATE_BOTTOM | 59 | a-auditer | |
| macro | STATE_UP | 60 | a-auditer | |
| macro | STATE_DOWN | 61 | a-auditer | |
| macro | DOOR_START_OPEN | 63 | a-auditer | |
| macro | DOOR_REVERSE | 64 | a-auditer | |
| macro | DOOR_CRUSHER | 65 | a-auditer | |
| macro | DOOR_NOMONSTER | 66 | a-auditer | |
| macro | DOOR_TOGGLE | 67 | a-auditer | |
| macro | DOOR_X_AXIS | 68 | a-auditer | |
| macro | DOOR_Y_AXIS | 69 | a-auditer | |
| function | Move_Done | 76 | a-auditer | |
| function | Move_Final | 82 | a-auditer | |
| function | Move_Begin | 96 | a-auditer | |
| global | frames | 98 | a-auditer | |
| function | Think_AccelMove | 112 | a-auditer | |
| function | Move_Calc | 114 | a-auditer | |
| function | AngleMove_Done | 147 | a-auditer | |
| function | AngleMove_Final | 153 | a-auditer | |
| function | VectorSubtract | 160 | a-auditer | |
| function | AngleMove_Begin | 174 | a-auditer | |
| global | len | 177 | a-auditer | |
| global | traveltime | 178 | a-auditer | |
| global | frames | 179 | a-auditer | |
| function | VectorSubtract | 185 | a-auditer | |
| function | AngleMove_Calc | 209 | a-auditer | |
| macro | AccelerationDistance | 233 | a-auditer | |
| function | plat_CalcAcceleratedMove | 235 | a-auditer | |
| global | accel_dist | 237 | a-auditer | |
| global | decel_dist | 238 | a-auditer | |
| global | f | 253 | a-auditer | |
| function | plat_Accelerate | 263 | a-auditer | |
| global | p1_distance | 286 | a-auditer | |
| global | p2_distance | 287 | a-auditer | |
| global | distance | 288 | a-auditer | |
| global | old_speed | 301 | a-auditer | |
| global | p1_distance | 302 | a-auditer | |
| global | p1_speed | 303 | a-auditer | |
| global | p2_distance | 304 | a-auditer | |
| global | distance | 305 | a-auditer | |
| function | Think_AccelMove | 334 | a-auditer | |
| function | plat_go_down | 356 | a-auditer | |
| function | plat_hit_top | 358 | a-auditer | |
| function | plat_hit_bottom | 372 | a-auditer | |
| function | plat_go_down | 383 | a-auditer | |
| function | plat_go_up | 395 | a-auditer | |
| function | plat_blocked | 407 | a-auditer | |
| function | Use_Plat | 428 | a-auditer | |
| function | Touch_Plat_Center | 436 | a-auditer | |
| function | plat_spawn_inside_trigger | 451 | a-auditer | |
| global | trigger | 453 | a-auditer | |
| function | SP_func_plat | 513 | a-auditer | |
| function | rotating_blocked | 595 | a-auditer | |
| function | rotating_touch | 600 | a-auditer | |
| function | rotating_use | 606 | a-auditer | |
| function | SP_func_rotating | 623 | a-auditer | |
| function | button_done | 692 | a-auditer | |
| function | button_return | 699 | a-auditer | |
| function | button_wait | 711 | a-auditer | |
| function | button_fire | 726 | a-auditer | |
| function | button_use | 737 | a-auditer | |
| function | button_touch | 743 | a-auditer | |
| function | button_killed | 755 | a-auditer | |
| function | SP_func_button | 763 | a-auditer | |
| global | dist | 766 | a-auditer | |
| function | door_use_areaportals | 852 | a-auditer | |
| global | t | 854 | a-auditer | |
| function | door_go_down | 868 | a-auditer | |
| function | door_hit_top | 870 | a-auditer | |
| function | door_hit_bottom | 888 | a-auditer | |
| function | door_go_down | 900 | a-auditer | |
| function | door_go_up | 921 | a-auditer | |
| function | door_use | 949 | a-auditer | |
| global | ent | 951 | a-auditer | |
| function | Touch_DoorTrigger | 980 | a-auditer | |
| function | Think_CalcMoveSpeed | 998 | a-auditer | |
| global | ent | 1000 | a-auditer | |
| global | min | 1001 | a-auditer | |
| global | time | 1002 | a-auditer | |
| global | newspeed | 1003 | a-auditer | |
| global | ratio | 1004 | a-auditer | |
| global | dist | 1005 | a-auditer | |
| function | Think_SpawnDoorTrigger | 1038 | a-auditer | |
| global | other | 1040 | a-auditer | |
| function | door_blocked | 1076 | a-auditer | |
| global | ent | 1078 | a-auditer | |
| function | door_killed | 1113 | a-auditer | |
| global | ent | 1115 | a-auditer | |
| function | door_touch | 1125 | a-auditer | |
| function | SP_func_door | 1138 | a-auditer | |
| function | SP_func_door_rotating | 1261 | a-auditer | |
| function | SP_func_water | 1378 | a-auditer | |
| macro | TRAIN_START_ON | 1445 | a-auditer | |
| macro | TRAIN_TOGGLE | 1446 | a-auditer | |
| macro | TRAIN_BLOCK_STOPS | 1447 | a-auditer | |
| function | train_next | 1459 | a-auditer | |
| function | train_blocked | 1461 | a-auditer | |
| function | train_wait | 1482 | a-auditer | |
| global | savetarget | 1486 | a-auditer | |
| global | ent | 1487 | a-auditer | |
| function | train_next | 1529 | a-auditer | |
| global | ent | 1531 | a-auditer | |
| global | dest | 1532 | a-auditer | |
| global | first | 1533 | a-auditer | |
| function | train_resume | 1586 | a-auditer | |
| global | ent | 1588 | a-auditer | |
| function | func_train_find | 1601 | a-auditer | |
| global | ent | 1603 | a-auditer | |
| function | train_use | 1633 | a-auditer | |
| function | train_next | 1650 | a-auditer | |
| function | SP_func_train | 1654 | a-auditer | |
| function | trigger_elevator_use | 1699 | a-auditer | |
| global | target | 1701 | a-auditer | |
| function | trigger_elevator_init | 1726 | a-auditer | |
| function | SP_trigger_elevator | 1750 | a-auditer | |
| function | func_timer_think | 1771 | a-auditer | |
| function | func_timer_use | 1777 | a-auditer | |
| function | func_timer_think | 1792 | a-auditer | |
| function | SP_func_timer | 1795 | a-auditer | |
| function | func_conveyor_use | 1825 | a-auditer | |
| function | SP_func_conveyor | 1842 | a-auditer | |
| macro | SECRET_ALWAYS_SHOOT | 1874 | a-auditer | |
| macro | SECRET_1ST_LEFT | 1875 | a-auditer | |
| macro | SECRET_1ST_DOWN | 1876 | a-auditer | |
| function | door_secret_move1 | 1878 | a-auditer | |
| function | door_secret_move2 | 1879 | a-auditer | |
| function | door_secret_move3 | 1880 | a-auditer | |
| function | door_secret_move4 | 1881 | a-auditer | |
| function | door_secret_move5 | 1882 | a-auditer | |
| function | door_secret_move6 | 1883 | a-auditer | |
| function | door_secret_done | 1884 | a-auditer | |
| function | door_secret_use | 1886 | a-auditer | |
| function | door_secret_move1 | 1896 | a-auditer | |
| function | door_secret_move2 | 1902 | a-auditer | |
| function | door_secret_move3 | 1907 | a-auditer | |
| function | door_secret_move4 | 1915 | a-auditer | |
| function | door_secret_move5 | 1920 | a-auditer | |
| function | door_secret_move6 | 1926 | a-auditer | |
| function | door_secret_done | 1931 | a-auditer | |
| function | door_secret_blocked | 1941 | a-auditer | |
| function | door_secret_die | 1960 | a-auditer | |
| function | SP_func_door_secret | 1966 | a-auditer | |
| global | side | 1969 | a-auditer | |
| global | width | 1970 | a-auditer | |
| global | length | 1971 | a-auditer | |
| global | width | 2008 | a-auditer | |
| function | VectorMA | 2013 | a-auditer | |
| function | use_killbox | 2037 | a-auditer | |
| function | SP_func_killbox | 2042 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

