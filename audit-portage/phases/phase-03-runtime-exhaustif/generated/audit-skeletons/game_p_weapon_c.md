# Inventaire runtime Phase 03 - Quake-2-master/game/p_weapon.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/p_weapon.ts
- Cibles TS declarees : packages/game/src/p_weapon.ts, packages/game/src/runtime.ts, packages/game/src/g_items.ts, packages/game/src/g_weapon.ts, packages/game/src/local-game-bootstrap.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | is_quad | 26 | a-auditer | |
| global | is_silenced | 27 | a-auditer | |
| function | weapon_grenade_fire | 30 | a-auditer | |
| function | P_ProjectSource | 33 | a-auditer | |
| function | PlayerNoise | 58 | a-auditer | |
| global | noise | 60 | a-auditer | |
| function | Pickup_Weapon | 118 | a-auditer | |
| global | index | 120 | a-auditer | |
| global | ammo | 121 | a-auditer | |
| function | Add_Ammo | 141 | a-auditer | |
| function | SetRespawn | 150 | a-auditer | |
| function | ChangeWeapon | 174 | a-auditer | |
| global | i | 176 | a-auditer | |
| global | i | 196 | a-auditer | |
| function | NoAmmoWeaponChange | 234 | a-auditer | |
| function | Think_Weapon | 282 | a-auditer | |
| global | is_silenced | 298 | a-auditer | |
| function | Use_Weapon | 311 | a-auditer | |
| global | ammo_index | 313 | a-auditer | |
| global | ammo_item | 314 | a-auditer | |
| function | Drop_Weapon | 349 | a-auditer | |
| global | index | 351 | a-auditer | |
| macro | FRAME_FIRE_FIRST | 376 | a-auditer | |
| macro | FRAME_IDLE_FIRST | 377 | a-auditer | |
| macro | FRAME_DEACTIVATE_FIRST | 378 | a-auditer | |
| function | Weapon_Generic | 380 | a-auditer | |
| global | n | 382 | a-auditer | |
| macro | GRENADE_TIMER | 542 | a-auditer | |
| macro | GRENADE_MINSPEED | 543 | a-auditer | |
| macro | GRENADE_MAXSPEED | 544 | a-auditer | |
| function | weapon_grenade_fire | 546 | a-auditer | |
| global | damage | 551 | a-auditer | |
| global | timer | 552 | a-auditer | |
| global | speed | 553 | a-auditer | |
| global | radius | 554 | a-auditer | |
| function | Weapon_Grenade | 595 | a-auditer | |
| function | weapon_grenadelauncher_fire | 709 | a-auditer | |
| global | damage | 714 | a-auditer | |
| global | radius | 715 | a-auditer | |
| function | Weapon_GrenadeLauncher | 743 | a-auditer | |
| global | pause_frames | 745 | a-auditer | |
| table | pause_frames | 745 | a-auditer | |
| global | fire_frames | 746 | a-auditer | |
| table | fire_frames | 746 | a-auditer | |
| function | Weapon_RocketLauncher_Fire | 759 | a-auditer | |
| global | damage | 763 | a-auditer | |
| global | damage_radius | 764 | a-auditer | |
| global | radius_damage | 765 | a-auditer | |
| function | Weapon_RocketLauncher | 799 | a-auditer | |
| global | pause_frames | 801 | a-auditer | |
| table | pause_frames | 801 | a-auditer | |
| global | fire_frames | 802 | a-auditer | |
| table | fire_frames | 802 | a-auditer | |
| function | Blaster_Fire | 816 | a-auditer | |
| function | Weapon_Blaster_Fire | 847 | a-auditer | |
| global | damage | 849 | a-auditer | |
| global | damage | 854 | a-auditer | |
| function | Weapon_Blaster | 859 | a-auditer | |
| global | pause_frames | 861 | a-auditer | |
| table | pause_frames | 861 | a-auditer | |
| global | fire_frames | 862 | a-auditer | |
| table | fire_frames | 862 | a-auditer | |
| function | Weapon_HyperBlaster_Fire | 868 | a-auditer | |
| global | rotation | 870 | a-auditer | |
| global | effect | 872 | a-auditer | |
| global | damage | 873 | a-auditer | |
| global | effect | 902 | a-auditer | |
| global | damage | 906 | a-auditer | |
| function | Weapon_HyperBlaster | 937 | a-auditer | |
| global | pause_frames | 939 | a-auditer | |
| table | pause_frames | 939 | a-auditer | |
| global | fire_frames | 940 | a-auditer | |
| table | fire_frames | 940 | a-auditer | |
| function | Machinegun_Fire | 953 | a-auditer | |
| global | i | 955 | a-auditer | |
| global | start | 956 | a-auditer | |
| global | angles | 958 | a-auditer | |
| global | damage | 959 | a-auditer | |
| global | kick | 960 | a-auditer | |
| global | offset | 961 | a-auditer | |
| function | Weapon_Machinegun | 1039 | a-auditer | |
| global | pause_frames | 1041 | a-auditer | |
| table | pause_frames | 1041 | a-auditer | |
| global | fire_frames | 1042 | a-auditer | |
| table | fire_frames | 1042 | a-auditer | |
| function | Chaingun_Fire | 1047 | a-auditer | |
| global | i | 1049 | a-auditer | |
| global | shots | 1050 | a-auditer | |
| global | start | 1051 | a-auditer | |
| global | offset | 1054 | a-auditer | |
| global | damage | 1055 | a-auditer | |
| global | kick | 1056 | a-auditer | |
| global | damage | 1061 | a-auditer | |
| global | shots | 1111 | a-auditer | |
| global | shots | 1114 | a-auditer | |
| function | Weapon_Chaingun | 1167 | a-auditer | |
| global | pause_frames | 1169 | a-auditer | |
| table | pause_frames | 1169 | a-auditer | |
| global | fire_frames | 1170 | a-auditer | |
| table | fire_frames | 1170 | a-auditer | |
| function | weapon_shotgun_fire | 1184 | a-auditer | |
| global | start | 1186 | a-auditer | |
| global | offset | 1188 | a-auditer | |
| global | damage | 1189 | a-auditer | |
| global | kick | 1190 | a-auditer | |
| function | fire_shotgun | 1215 | a-auditer | |
| function | Weapon_Shotgun | 1230 | a-auditer | |
| global | pause_frames | 1232 | a-auditer | |
| table | pause_frames | 1232 | a-auditer | |
| global | fire_frames | 1233 | a-auditer | |
| table | fire_frames | 1233 | a-auditer | |
| function | weapon_supershotgun_fire | 1239 | a-auditer | |
| global | start | 1241 | a-auditer | |
| global | offset | 1243 | a-auditer | |
| global | v | 1244 | a-auditer | |
| global | damage | 1245 | a-auditer | |
| global | kick | 1246 | a-auditer | |
| function | Weapon_SuperShotgun | 1284 | a-auditer | |
| global | pause_frames | 1286 | a-auditer | |
| table | pause_frames | 1286 | a-auditer | |
| global | fire_frames | 1287 | a-auditer | |
| table | fire_frames | 1287 | a-auditer | |
| function | weapon_railgun_fire | 1302 | a-auditer | |
| global | start | 1304 | a-auditer | |
| global | offset | 1306 | a-auditer | |
| global | damage | 1307 | a-auditer | |
| global | kick | 1308 | a-auditer | |
| function | Weapon_Railgun | 1350 | a-auditer | |
| global | pause_frames | 1352 | a-auditer | |
| table | pause_frames | 1352 | a-auditer | |
| global | fire_frames | 1353 | a-auditer | |
| table | fire_frames | 1353 | a-auditer | |
| function | weapon_bfg_fire | 1367 | a-auditer | |
| global | damage | 1371 | a-auditer | |
| global | damage_radius | 1372 | a-auditer | |
| global | damage | 1377 | a-auditer | |
| function | Weapon_BFG | 1425 | a-auditer | |
| global | pause_frames | 1427 | a-auditer | |
| table | pause_frames | 1427 | a-auditer | |
| global | fire_frames | 1428 | a-auditer | |
| table | fire_frames | 1428 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

