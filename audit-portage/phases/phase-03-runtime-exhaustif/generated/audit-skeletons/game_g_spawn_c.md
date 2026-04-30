# Inventaire runtime Phase 03 - Quake-2-master/game/g_spawn.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_spawn.ts
- Cibles TS declarees : packages/game/src/g_spawn.ts, packages/game/src/g_main.ts, packages/formats/src/qfiles.ts, packages/game/src/g_items.ts, packages/game/src/g_misc.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| struct | spawn_t | 23 | a-auditer | |
| global | name | 25 | a-auditer | |
| function | SP_item_health | 30 | a-auditer | |
| function | SP_item_health_small | 31 | a-auditer | |
| function | SP_item_health_large | 32 | a-auditer | |
| function | SP_item_health_mega | 33 | a-auditer | |
| function | SP_info_player_start | 35 | a-auditer | |
| function | SP_info_player_deathmatch | 36 | a-auditer | |
| function | SP_info_player_coop | 37 | a-auditer | |
| function | SP_info_player_intermission | 38 | a-auditer | |
| function | SP_func_plat | 40 | a-auditer | |
| function | SP_func_rotating | 41 | a-auditer | |
| function | SP_func_button | 42 | a-auditer | |
| function | SP_func_door | 43 | a-auditer | |
| function | SP_func_door_secret | 44 | a-auditer | |
| function | SP_func_door_rotating | 45 | a-auditer | |
| function | SP_func_water | 46 | a-auditer | |
| function | SP_func_train | 47 | a-auditer | |
| function | SP_func_conveyor | 48 | a-auditer | |
| function | SP_func_wall | 49 | a-auditer | |
| function | SP_func_object | 50 | a-auditer | |
| function | SP_func_explosive | 51 | a-auditer | |
| function | SP_func_timer | 52 | a-auditer | |
| function | SP_func_areaportal | 53 | a-auditer | |
| function | SP_func_clock | 54 | a-auditer | |
| function | SP_func_killbox | 55 | a-auditer | |
| function | SP_trigger_always | 57 | a-auditer | |
| function | SP_trigger_once | 58 | a-auditer | |
| function | SP_trigger_multiple | 59 | a-auditer | |
| function | SP_trigger_relay | 60 | a-auditer | |
| function | SP_trigger_push | 61 | a-auditer | |
| function | SP_trigger_hurt | 62 | a-auditer | |
| function | SP_trigger_key | 63 | a-auditer | |
| function | SP_trigger_counter | 64 | a-auditer | |
| function | SP_trigger_elevator | 65 | a-auditer | |
| function | SP_trigger_gravity | 66 | a-auditer | |
| function | SP_trigger_monsterjump | 67 | a-auditer | |
| function | SP_target_temp_entity | 69 | a-auditer | |
| function | SP_target_speaker | 70 | a-auditer | |
| function | SP_target_explosion | 71 | a-auditer | |
| function | SP_target_changelevel | 72 | a-auditer | |
| function | SP_target_secret | 73 | a-auditer | |
| function | SP_target_goal | 74 | a-auditer | |
| function | SP_target_splash | 75 | a-auditer | |
| function | SP_target_spawner | 76 | a-auditer | |
| function | SP_target_blaster | 77 | a-auditer | |
| function | SP_target_crosslevel_trigger | 78 | a-auditer | |
| function | SP_target_crosslevel_target | 79 | a-auditer | |
| function | SP_target_laser | 80 | a-auditer | |
| function | SP_target_help | 81 | a-auditer | |
| function | SP_target_actor | 82 | a-auditer | |
| function | SP_target_lightramp | 83 | a-auditer | |
| function | SP_target_earthquake | 84 | a-auditer | |
| function | SP_target_character | 85 | a-auditer | |
| function | SP_target_string | 86 | a-auditer | |
| function | SP_worldspawn | 88 | a-auditer | |
| function | SP_viewthing | 89 | a-auditer | |
| function | SP_light | 91 | a-auditer | |
| function | SP_light_mine1 | 92 | a-auditer | |
| function | SP_light_mine2 | 93 | a-auditer | |
| function | SP_info_null | 94 | a-auditer | |
| function | SP_info_notnull | 95 | a-auditer | |
| function | SP_path_corner | 96 | a-auditer | |
| function | SP_point_combat | 97 | a-auditer | |
| function | SP_misc_explobox | 99 | a-auditer | |
| function | SP_misc_banner | 100 | a-auditer | |
| function | SP_misc_satellite_dish | 101 | a-auditer | |
| function | SP_misc_actor | 102 | a-auditer | |
| function | SP_misc_gib_arm | 103 | a-auditer | |
| function | SP_misc_gib_leg | 104 | a-auditer | |
| function | SP_misc_gib_head | 105 | a-auditer | |
| function | SP_misc_insane | 106 | a-auditer | |
| function | SP_misc_deadsoldier | 107 | a-auditer | |
| function | SP_misc_viper | 108 | a-auditer | |
| function | SP_misc_viper_bomb | 109 | a-auditer | |
| function | SP_misc_bigviper | 110 | a-auditer | |
| function | SP_misc_strogg_ship | 111 | a-auditer | |
| function | SP_misc_teleporter | 112 | a-auditer | |
| function | SP_misc_teleporter_dest | 113 | a-auditer | |
| function | SP_misc_blackhole | 114 | a-auditer | |
| function | SP_misc_eastertank | 115 | a-auditer | |
| function | SP_misc_easterchick | 116 | a-auditer | |
| function | SP_misc_easterchick2 | 117 | a-auditer | |
| function | SP_monster_berserk | 119 | a-auditer | |
| function | SP_monster_gladiator | 120 | a-auditer | |
| function | SP_monster_gunner | 121 | a-auditer | |
| function | SP_monster_infantry | 122 | a-auditer | |
| function | SP_monster_soldier_light | 123 | a-auditer | |
| function | SP_monster_soldier | 124 | a-auditer | |
| function | SP_monster_soldier_ss | 125 | a-auditer | |
| function | SP_monster_tank | 126 | a-auditer | |
| function | SP_monster_medic | 127 | a-auditer | |
| function | SP_monster_flipper | 128 | a-auditer | |
| function | SP_monster_chick | 129 | a-auditer | |
| function | SP_monster_parasite | 130 | a-auditer | |
| function | SP_monster_flyer | 131 | a-auditer | |
| function | SP_monster_brain | 132 | a-auditer | |
| function | SP_monster_floater | 133 | a-auditer | |
| function | SP_monster_hover | 134 | a-auditer | |
| function | SP_monster_mutant | 135 | a-auditer | |
| function | SP_monster_supertank | 136 | a-auditer | |
| function | SP_monster_boss2 | 137 | a-auditer | |
| function | SP_monster_jorg | 138 | a-auditer | |
| function | SP_monster_boss3_stand | 139 | a-auditer | |
| function | SP_monster_commander_body | 141 | a-auditer | |
| function | SP_turret_breach | 143 | a-auditer | |
| function | SP_turret_base | 144 | a-auditer | |
| function | SP_turret_driver | 145 | a-auditer | |
| table | spawns | 148 | a-auditer | |
| function | ED_CallSpawn | 278 | a-auditer | |
| global | item | 281 | a-auditer | |
| global | i | 282 | a-auditer | |
| function | ED_NewString | 319 | a-auditer | |
| function | ED_ParseField | 358 | a-auditer | |
| global | b | 361 | a-auditer | |
| global | v | 362 | a-auditer | |
| global | b | 372 | a-auditer | |
| function | ED_ParseEdict | 414 | a-auditer | |
| global | init | 416 | a-auditer | |
| global | keyname | 417 | a-auditer | |
| global | com_token | 418 | a-auditer | |
| function | G_FindTeams | 470 | a-auditer | |
| function | SpawnEntities | 520 | a-auditer | |
| global | ent | 522 | a-auditer | |
| global | inhibit | 523 | a-auditer | |
| global | com_token | 524 | a-auditer | |
| global | i | 525 | a-auditer | |
| global | skill_level | 526 | a-auditer | |
| global | ent | 566 | a-auditer | |
| global | single_statusbar | 648 | a-auditer | |
| global | dm_statusbar | 706 | a-auditer | |
| function | SP_worldspawn | 796 | a-auditer | |
| function | strncpy | 822 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

