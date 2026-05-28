# Inventaire runtime Phase 03 - Quake-2-master/game/g_items.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_items.ts
- Cibles TS declarees : packages/game/src/g_items.ts, packages/game/src/g_combat.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts, packages/game/src/local-game-bootstrap.ts, packages/game/src/p_weapon.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | Pickup_Weapon | 23 | a-auditer | |
| function | Use_Weapon | 24 | a-auditer | |
| function | Drop_Weapon | 25 | a-auditer | |
| function | Weapon_Blaster | 27 | a-auditer | |
| function | Weapon_Shotgun | 28 | a-auditer | |
| function | Weapon_SuperShotgun | 29 | a-auditer | |
| function | Weapon_Machinegun | 30 | a-auditer | |
| function | Weapon_Chaingun | 31 | a-auditer | |
| function | Weapon_HyperBlaster | 32 | a-auditer | |
| function | Weapon_RocketLauncher | 33 | a-auditer | |
| function | Weapon_Grenade | 34 | a-auditer | |
| function | Weapon_GrenadeLauncher | 35 | a-auditer | |
| function | Weapon_Railgun | 36 | a-auditer | |
| function | Weapon_BFG | 37 | a-auditer | |
| global | jacket_armor_index | 43 | a-auditer | |
| global | combat_armor_index | 44 | a-auditer | |
| global | body_armor_index | 45 | a-auditer | |
| global | power_screen_index | 46 | a-auditer | |
| global | power_shield_index | 47 | a-auditer | |
| macro | HEALTH_IGNORE_MAX | 49 | a-auditer | |
| macro | HEALTH_TIMED | 50 | a-auditer | |
| function | Use_Quad | 52 | a-auditer | |
| global | quad_drop_timeout_hack | 53 | a-auditer | |
| function | GetItemByIndex | 62 | a-auditer | |
| function | FindItemByClassname | 77 | a-auditer | |
| global | i | 79 | a-auditer | |
| global | it | 80 | a-auditer | |
| function | FindItem | 100 | a-auditer | |
| global | i | 102 | a-auditer | |
| global | it | 103 | a-auditer | |
| function | DoRespawn | 119 | a-auditer | |
| global | master | 123 | a-auditer | |
| global | count | 124 | a-auditer | |
| global | choice | 125 | a-auditer | |
| function | SetRespawn | 146 | a-auditer | |
| function | Pickup_Powerup | 159 | a-auditer | |
| global | quantity | 161 | a-auditer | |
| function | Drop_General | 187 | a-auditer | |
| function | Pickup_Adrenaline | 197 | a-auditer | |
| function | Pickup_AncientHead | 211 | a-auditer | |
| function | Pickup_Bandolier | 221 | a-auditer | |
| global | item | 223 | a-auditer | |
| global | index | 224 | a-auditer | |
| function | Pickup_Pack | 259 | a-auditer | |
| global | item | 261 | a-auditer | |
| global | index | 262 | a-auditer | |
| function | Use_Quad | 339 | a-auditer | |
| global | timeout | 341 | a-auditer | |
| function | Use_Breather | 366 | a-auditer | |
| function | Use_Envirosuit | 381 | a-auditer | |
| function | Use_Invulnerability | 396 | a-auditer | |
| function | Use_Silencer | 411 | a-auditer | |
| function | Pickup_Key | 422 | a-auditer | |
| function | Add_Ammo | 447 | a-auditer | |
| global | index | 449 | a-auditer | |
| global | max | 450 | a-auditer | |
| function | Pickup_Ammo | 483 | a-auditer | |
| global | oldcount | 485 | a-auditer | |
| global | count | 486 | a-auditer | |
| global | weapon | 487 | a-auditer | |
| global | count | 495 | a-auditer | |
| function | Drop_Ammo | 513 | a-auditer | |
| global | dropped | 515 | a-auditer | |
| global | index | 516 | a-auditer | |
| function | MegaHealth_think | 541 | a-auditer | |
| function | G_FreeEdict | 553 | a-auditer | |
| function | Pickup_Health | 556 | a-auditer | |
| function | ArmorIndex | 590 | a-auditer | |
| function | Pickup_Armor | 607 | a-auditer | |
| global | old_armor_index | 609 | a-auditer | |
| global | newcount | 612 | a-auditer | |
| global | salvage | 613 | a-auditer | |
| global | salvagecount | 614 | a-auditer | |
| global | oldinfo | 645 | a-auditer | |
| function | PowerArmorType | 688 | a-auditer | |
| function | Use_PowerArmor | 705 | a-auditer | |
| global | index | 707 | a-auditer | |
| function | Pickup_PowerArmor | 727 | a-auditer | |
| global | quantity | 729 | a-auditer | |
| function | Drop_PowerArmor | 747 | a-auditer | |
| function | Touch_Item | 761 | a-auditer | |
| global | taken | 763 | a-auditer | |
| function | G_FreeEdict | 819 | a-auditer | |
| function | drop_temp_touch | 825 | a-auditer | |
| function | drop_make_touchable | 833 | a-auditer | |
| function | Drop_Item | 843 | a-auditer | |
| global | dropped | 845 | a-auditer | |
| global | trace | 866 | a-auditer | |
| function | Use_Item | 892 | a-auditer | |
| function | droptofloor | 918 | a-auditer | |
| global | tr | 920 | a-auditer | |
| global | dest | 921 | a-auditer | |
| global | v | 922 | a-auditer | |
| function | PrecacheItem | 993 | a-auditer | |
| global | data | 996 | a-auditer | |
| global | len | 997 | a-auditer | |
| global | ammo | 998 | a-auditer | |
| function | SpawnItem | 1061 | a-auditer | |
| global | itemlist | 1134 | a-auditer | |
| table | itemlist | 1134 | a-auditer | |
| function | SP_item_health | 2121 | a-auditer | |
| function | SP_item_health_small | 2137 | a-auditer | |
| function | SP_item_health_large | 2154 | a-auditer | |
| function | SP_item_health_mega | 2170 | a-auditer | |
| function | InitItems | 2186 | a-auditer | |
| function | SetItemNames | 2200 | a-auditer | |
| global | i | 2202 | a-auditer | |
| global | it | 2203 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

