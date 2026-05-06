# Progress - Quake-2-master/game/p_weapon.c

## Session 2026-05-06

- Lot traite: bloc initial `is_quad`/`is_silenced`, `P_ProjectSource`, `PlayerNoise`, `Pickup_Weapon`, `ChangeWeapon`, `NoAmmoWeaponChange`, `Think_Weapon`, `Use_Weapon`, `Drop_Weapon`, macros locales `FRAME_*`, `Weapon_Generic`, et faux positifs de variables locales associes.
- Comparaison C/TS: comportements compares contre `Quake-2-master/game/p_weapon.c` et `packages/game/src/p_weapon.ts`; les commentaires d'en-tete des fonctions portees du lot sont presents avec `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior` et notes utiles.
- Runtime: fonctions atteignables via `Touch_Item`/`Pickup_Weapon`, commandes `use`/`drop`, `ClientThink`, `ClientBeginServerFrame`, `ChangeWeapon` et le bootstrap local. Les sorties visibles de tir passent par les events runtime de muzzleflash/sons et par `local-gameplay-sync`.
- apps/web: le flux navigateur consomme le runtime par `local-client-controller` et la boucle `full-game-render-loop`; aucune logique web parallele ne remplace le lot.
- renderer-three: les effets visibles attendus de ce lot sont indirects (view weapon, muzzleflash/dlights, sons, frames joueur). Ils sont consommes via `ClientRefreshFrame`, `CL_BuildMuzzleFlashEffects`, `refresh-entity-sync`, `dlight-sync` et les tests renderer/client.
- Corrections: ajout d'assertions ciblees dans `scripts/verify/quake2-p-weapon.ts` pour handedness de `P_ProjectSource`, pickup/use/drop/change weapon et bit `MZ_SILENCED`.
- Tests lances: `npm run verify:p-weapon`, `npm run verify:local-gameplay-sync`, `npm run verify:cl-fx`, `npm run verify:refresh-entity:weapon`.

## Session 2026-05-06 - bloc grenade

- Lot traite: `GRENADE_TIMER`, `GRENADE_MINSPEED`, `GRENADE_MAXSPEED`, `weapon_grenade_fire`, variables locales `damage`/`timer`/`speed`/`radius`, et `Weapon_Grenade`.
- Comparaison C/TS: timers `3.0`, vitesses `400`/`800`, degats `125`, rayon `damage + 40`, quad, projection `[8, 8, viewheight - 8]`, fuse restant, vitesse cookee, `fire_grenade2`, consommation ammo, debounce `grenade_time`, animations debout/accroupi, gardes cadavre/modele, et etat `WEAPON_READY`/`WEAPON_ACTIVATING`/`WEAPON_FIRING` compares contre le C.
- Commentaires d'en-tete: `weapon_grenade_fire` et `Weapon_Grenade` ont ete verifies avec `Original name`, `Source: game/p_weapon.c`, `Category: Ported`, niveau de fidelite et comportement.
- Runtime: integre via `g_items` (`ammo_grenades` -> `Weapon_Grenade`), `Think_Weapon`, `ClientThink`/`ClientBeginServerFrame` et `local-game-bootstrap`; `weapon_grenade_fire` produit bien le projectile via `fire_grenade2`.
- apps/web: le navigateur passe par le runtime serveur/local et la boucle full-game; aucune logique web parallele ne remplace ce bloc.
- renderer-three: sortie visible attendue = projectile `hgrenade` avec modele `models/objects/grenade2/tris.md2`, effet `EF_GRENADE`, son de vol et explosion/temp entity via `g_weapon`/client effects; elle est consommee par le flux snapshot/client/refresh puis renderer.
- Corrections: ajout d'assertions ciblees dans `scripts/verify/quake2-p-weapon.ts` pour `weapon_grenade_fire` direct, projection, timers/vitesse, ammo infini, animations et garde cadavre.
- Tests lances: `npm run verify:p-weapon`.

## Session 2026-05-06 - bloc grenade launcher

- Lot traite: `weapon_grenadelauncher_fire`, variables locales `damage`/`radius`, `Weapon_GrenadeLauncher`, tables locales `pause_frames` et `fire_frames`.
- Comparaison C/TS: degats `120`, rayon `damage + 40` calcule avant quad, quad damage, projection `[8, 8, viewheight - 8]` via `P_ProjectSource`, kick origin/angle, `fire_grenade` avec vitesse `600` et timer `2.5`, muzzleflash `MZ_GRENADE | is_silenced`, `PlayerNoise`, consommation ammo et `DF_INFINITE_AMMO` compares contre le C. `Weapon_GrenadeLauncher` appelle `Weapon_Generic(ent, 5, 16, 59, 64, {34, 51, 59, 0}, {6, 0}, weapon_grenadelauncher_fire)`.
- Commentaires d'en-tete: `weapon_grenadelauncher_fire` et `Weapon_GrenadeLauncher` verifies avec `Original name`, `Source: game/p_weapon.c`, `Category: Ported`, niveau de fidelite et comportement.
- Runtime: integre via `g_items` (`weapon_grenadelauncher` -> `Weapon_GrenadeLauncher`), `Think_Weapon`, `ClientThink`/`ClientBeginServerFrame`, `local-game-bootstrap` et hooks `fire_grenade`.
- apps/web: le navigateur selectionne l'arme via les bindings full-game/local et consomme le runtime porte; aucune logique web parallele ne remplace ce bloc.
- renderer-three: sortie visible attendue = projectile `grenade` avec modele `models/objects/grenade/tris.md2`, `EF_GRENADE`, muzzleflash/dlight `MZ_GRENADE`, sons et explosion/temp entity; elle est consommee par snapshots, `cl_fx`, refresh entity, dlights et renderer-three.
- Corrections: ajout d'assertions ciblees dans `scripts/verify/quake2-p-weapon.ts` pour `weapon_grenadelauncher_fire` direct, frames `pause_frames`/`fire_frames`, ammo infini et parametres projectile.
- Tests lances: `npm run verify:p-weapon`, `npm run typecheck`, `npm run verify:local-gameplay-sync`, `npm run verify:cl-fx`, `npm run verify:full-game:three-renderer`, `npm run verify:refresh-entity:weapon`.

## Session 2026-05-06 - bloc rocket launcher

- Lot traite: `Weapon_RocketLauncher_Fire`, variables locales `damage`/`damage_radius`/`radius_damage`, `Weapon_RocketLauncher`, tables locales `pause_frames` et `fire_frames`.
- Comparaison C/TS: degats `100 + (int)(random() * 20.0)`, `radius_damage = 120`, `damage_radius = 120`, quad applique aux degats directs et splash seulement, projection `[8, 8, viewheight - 8]`, kick origin/angle, `fire_rocket` avec vitesse `650`, muzzleflash `MZ_ROCKET | is_silenced`, `PlayerNoise`, consommation ammo et `DF_INFINITE_AMMO` compares contre le C. `Weapon_RocketLauncher` appelle `Weapon_Generic(ent, 4, 12, 50, 54, {25, 33, 42, 50, 0}, {5, 0}, Weapon_RocketLauncher_Fire)`.
- Commentaires d'en-tete: `Weapon_RocketLauncher_Fire` et `Weapon_RocketLauncher` verifies avec `Original name`, `Source: game/p_weapon.c`, `Category: Ported`, niveau de fidelite et comportement.
- Runtime: integre via `g_items` (`weapon_rocketlauncher` -> `Weapon_RocketLauncher`), `Think_Weapon`, `ClientThink`/`ClientBeginServerFrame`, `local-game-bootstrap` et hooks `fire_rocket`.
- apps/web: le navigateur selectionne l'arme via les bindings full-game/local et consomme le runtime porte; aucune logique web parallele ne remplace ce bloc.
- renderer-three: sortie visible attendue = projectile `rocket` avec modele `models/objects/rocket/tris.md2`, `EF_ROCKET`, muzzleflash/dlight `MZ_ROCKET`, son de vol, trail rocket et explosion/temp entity; elle est consommee par snapshots, `cl_fx`, refresh entity/dlights et renderer-three.
- Corrections: ajout d'assertions ciblees dans `scripts/verify/quake2-p-weapon.ts` pour `Weapon_RocketLauncher_Fire` direct, projection, bit silencieux, parametres projectile, ammo infini et tables `pause_frames`/`fire_frames`.
- Tests lances: `npm run verify:p-weapon`, `npm run typecheck`, `npm run verify:local-gameplay-sync`, `npm run verify:cl-fx`, `npm run verify:full-game:three-renderer`, `npm run verify:refresh-entity:weapon`.

## Session 2026-05-06 - bloc blaster

- Lot traite: `Blaster_Fire`, `Weapon_Blaster_Fire`, variables locales/parametres `damage`, `Weapon_Blaster`, tables locales `pause_frames` et `fire_frames`.
- Comparaison C/TS: quad damage, choix solo/deathmatch `10`/`15`, projection `[24, 8, viewheight - 8] + g_offset`, kick origin/angle, `fire_blaster` vitesse `1000`, passage `effect`/`hyper`, muzzleflash `MZ_BLASTER` ou `MZ_HYPERBLASTER` avec bit silencieux, `PlayerNoise`, avance gunframe et `Weapon_Generic(ent, 4, 8, 52, 55, {19, 32, 0}, {5, 0}, Weapon_Blaster_Fire)` compares contre le C.
- Commentaires d'en-tete: `Blaster_Fire`, `Weapon_Blaster_Fire` et `Weapon_Blaster` verifies avec `Original name`, `Source: game/p_weapon.c`, `Category: Ported`, niveau de fidelite et comportement.
- Runtime: integre via `g_items` (`weapon_blaster` -> `Weapon_Blaster`), `Think_Weapon`, `ClientThink`/`ClientBeginServerFrame`, `local-game-bootstrap` et hooks `fire_blaster`.
- apps/web: le navigateur declenche le tir via les flux serveur/local/full-game et consomme le runtime porte; aucune logique web parallele ne remplace ce bloc.
- renderer-three: sorties visibles attendues = bolt blaster/hyperblaster, `EF_BLASTER`/`EF_HYPERBLASTER`, muzzleflash/dlight `MZ_BLASTER`/`MZ_HYPERBLASTER`, bruit, trail blaster et impact `TE_BLASTER`; elles sont consommees par snapshots, `cl_fx`, refresh entity/particles/dlights et renderer-three.
- Corrections: ajout d'assertions ciblees dans `scripts/verify/quake2-p-weapon.ts` pour `Blaster_Fire` direct, projection avec `g_offset`, damage quad, bit silencieux, `Weapon_Blaster_Fire`, degats deathmatch, bruit joueur et tables `pause_frames`/`fire_frames`.
- Tests lances: `npm run verify:p-weapon`, `npm run typecheck`, `npm run verify:local-gameplay-sync`, `npm run verify:cl-fx`, `npm run verify:full-game:three-renderer`, `npm run verify:refresh-entity:weapon`.

## Session 2026-05-06 - bloc hyperblaster

- Lot traite: `Weapon_HyperBlaster_Fire`, variables locales `rotation`/`effect`/`damage`, `Weapon_HyperBlaster`, tables locales `pause_frames` et `fire_frames`.
- Comparaison C/TS: son loop `weapons/hyprbl1a.wav`, relache attaque, chemin no-ammo avec `CHAN_VOICE` et `NoAmmoWeaponChange`, rotation `(gunframe - 5) * 2*pi/6`, offset circulaire `[-4*sin(rotation), 0, 4*cos(rotation)]`, `EF_HYPERBLASTER` seulement aux frames 6 et 9, degats solo/deathmatch `20`/`15`, delegation `Blaster_Fire(..., hyper=true)`, consommation cells sauf `DF_INFINITE_AMMO`, animations debout/accroupi, boucle frame 12 vers 6 quand il reste des cells, wind-down `weapons/hyprbd1a.wav`, et `Weapon_Generic(ent, 5, 20, 49, 53, {0}, {6, 7, 8, 9, 10, 11, 0}, Weapon_HyperBlaster_Fire)` compares contre le C.
- Commentaires d'en-tete: `Weapon_HyperBlaster_Fire` et `Weapon_HyperBlaster` verifies avec `Original name`, `Source: game/p_weapon.c`, `Category: Ported`, niveau de fidelite et comportement.
- Runtime: integre via `g_items` (`weapon_hyperblaster` -> `Weapon_HyperBlaster`), `Think_Weapon`, `ClientThink`/`ClientBeginServerFrame`, `local-game-bootstrap` et hook `fire_blaster`.
- apps/web: le navigateur declenche le tir via les flux serveur/local/full-game et consomme le runtime porte; aucune logique web parallele ne remplace ce bloc.
- renderer-three: sorties visibles attendues = bolt hyperblaster, modele laser, `EF_HYPERBLASTER`, muzzleflash/dlight `MZ_HYPERBLASTER`, son loop/wind-down, trail et impact `TE_BLASTER`; elles sont consommees par snapshots, `cl_fx`, refresh entity/particles/dlights et renderer-three.
- Corrections: ajout d'assertions ciblees dans `scripts/verify/quake2-p-weapon.ts` pour appel direct `Weapon_HyperBlaster_Fire`, offset circulaire, bit silencieux, animations debout/accroupi, ammo infini et tables `pause_frames`/`fire_frames`.
- Tests lances: `npm run verify:p-weapon`, `npm run typecheck`, `npm run verify:local-gameplay-sync`, `npm run verify:cl-fx`, `npm run verify:full-game:three-renderer`, `npm run verify:refresh-entity:weapon`.

## Session 2026-05-06 - bloc machinegun

- Lot traite: `Machinegun_Fire`, variables locales `i`/`start`/`angles`/`damage`/`kick`/`offset`, `Weapon_Machinegun`, tables locales `pause_frames` et `fire_frames`.
- Comparaison C/TS: relache attaque et reset `machinegun_shots`, alternance gunframe `4`/`5`, chemin no-ammo `CHAN_VOICE` et `NoAmmoWeaponChange`, degats/kick `8`/`2` et quad `32`/`8`, recul aleatoire, plafonnement solo a `9`, absence d'accumulation deathmatch, projection `[0, 8, viewheight - 8]`, `fire_bullet` avec spreads par defaut et `MOD_MACHINEGUN`, muzzleflash `MZ_MACHINEGUN | is_silenced`, `PlayerNoise`, consommation ammo/`DF_INFINITE_AMMO`, animations debout/accroupi, et `Weapon_Generic(ent, 3, 5, 45, 49, {23, 45, 0}, {4, 5, 0}, Machinegun_Fire)` compares contre le C.
- Commentaires d'en-tete: `Machinegun_Fire` et `Weapon_Machinegun` verifies avec `Original name`, `Source: game/p_weapon.c`, `Category: Ported`, niveau de fidelite et comportement.
- Runtime: integre via `g_items` (`weapon_machinegun` -> `Weapon_Machinegun`), `Think_Weapon`, `ClientThink`/`ClientBeginServerFrame`, `G_RunFrame`, `local-game-bootstrap` et hook `fire_bullet`.
- apps/web: le navigateur declenche le tir via les flux serveur/local/full-game et consomme le runtime porte; aucune logique web parallele ne remplace ce bloc.
- renderer-three: sorties visibles attendues = muzzleflash/dlight `MZ_MACHINEGUN`, sons de tir machinegun, impacts `TE_GUNSHOT`, particules/dlights client et view weapon `models/weapons/v_machn/tris.md2`; elles sont consommees par snapshots, `local-gameplay-sync`, `cl_fx`, refresh entity/dlights et renderer-three.
- Corrections: ajout d'assertions ciblees dans `scripts/verify/quake2-p-weapon.ts` pour `Machinegun_Fire` direct, projection, direction, bit silencieux, degats/kick base et quad, ammo infini, no-ammo, reset, tables `pause_frames`/`fire_frames` et frames non-fire.
- Tests lances: `npm run verify:p-weapon`, `npm run typecheck`, `npm run verify:local-gameplay-sync`, `npm run verify:cl-fx`, `npm run verify:full-game:three-renderer`, `npm run verify:refresh-entity:weapon`.

## Session 2026-05-06 - bloc chaingun

- Lot traite: `Chaingun_Fire`, variables locales `i`/`shots`/`start`/`offset`/`damage`/`kick` et doublons generes, `Weapon_Chaingun`, tables locales `pause_frames` et `fire_frames`.
- Comparaison C/TS: degats solo/deathmatch `8`/`6`, kick `2`, quad damage/kick, son windup frame `5`, relache frame `14` vers `32`, boucle frame `21` vers `15` avec attaque+ammo, wind-down frame `22`, sons `chngnu1a`/`chngnl1a`/`chngnd1a`, animations debout/accroupi, choix `shots` `1`/`2`/`3`, clamp ammo, branche no-ammo `CHAN_VOICE` et `NoAmmoWeaponChange`, recul aleatoire, projection `[0, 7 + crandom()*4, crandom()*4 + viewheight - 8]`, `fire_bullet` avec spreads par defaut et `MOD_CHAINGUN`, muzzleflash `MZ_CHAINGUN1/2/3 | is_silenced`, `PlayerNoise`, consommation ammo/`DF_INFINITE_AMMO`, et `Weapon_Generic(ent, 4, 31, 61, 64, {38, 43, 51, 61, 0}, {5..21, 0}, Chaingun_Fire)` compares contre le C.
- Commentaires d'en-tete: `Chaingun_Fire` et `Weapon_Chaingun` verifies avec `Original name`, `Source: game/p_weapon.c`, `Category: Ported`, niveau de fidelite et comportement.
- Runtime: integre via `g_items` (`weapon_chaingun` -> `Weapon_Chaingun`), `Think_Weapon`, `ClientThink`/`ClientBeginServerFrame`, `G_RunFrame`, `local-game-bootstrap` et hook `fire_bullet`.
- apps/web: le navigateur declenche le tir via les flux serveur/local/full-game et consomme le runtime porte; le binding arme `Chaingun: "4"` est un adapter d'input, pas une logique parallele de tir.
- renderer-three: sorties visibles attendues = view/world model `v_chain`/`g_chain`, muzzleflash/dlights `MZ_CHAINGUN1/2/3`, sons chaingun, impacts `TE_GUNSHOT`, particules/dlights client et frames joueur; elles sont consommees par snapshots, `local-gameplay-sync`, `cl_fx`, refresh entity/dlights et renderer-three.
- Corrections: ajout d'assertions ciblees dans `scripts/verify/quake2-p-weapon.ts` pour `Chaingun_Fire` direct, projection, bruit joueur silencieux/non silencieux, sons windup/wind-down/loop, `MZ_CHAINGUN1/2/3`, degats/kick solo/deathmatch/quad, clamp ammo, ammo infini, no-ammo, boucle frame `21`, relache frame `14`, tables `pause_frames`/`fire_frames` et frames non-fire.
- Tests lances: `npm run verify:p-weapon`, `npm run typecheck`, `npm run verify:local-gameplay-sync`, `npm run verify:cl-fx`, `npm run verify:full-game:three-renderer`, `npm run verify:refresh-entity:weapon`.

## Session 2026-05-06 - bloc shotgun

- Lot traite: `weapon_shotgun_fire`, variables locales `start`/`offset`/`damage`/`kick`, `Weapon_Shotgun`, tables locales `pause_frames` et `fire_frames`.
- Comparaison C/TS: quirk frame `9` qui avance sans tirer, `AngleVectors`, kick origin `forward * -2`, kick angle `-2`, projection `[0, 8, viewheight - 8]`, degats/kick `4`/`8` et quad `16`/`32`, `fire_shotgun` avec spreads `500`/`500`, counts solo/deathmatch, `MOD_SHOTGUN`, muzzleflash `MZ_SHOTGUN | is_silenced`, `PlayerNoise`, consommation ammo et `DF_INFINITE_AMMO` compares contre le C. `Weapon_Shotgun` appelle `Weapon_Generic(ent, 7, 18, 36, 39, {22, 28, 34, 0}, {8, 9, 0}, weapon_shotgun_fire)`.
- Commentaires d'en-tete: `weapon_shotgun_fire` et `Weapon_Shotgun` verifies avec `Original name`, `Source: game/p_weapon.c`, `Category: Ported`, niveau de fidelite et comportement.
- Runtime: integre via `g_items` (`weapon_shotgun` -> `Weapon_Shotgun`), `Think_Weapon`, `ClientThink`/`ClientBeginServerFrame`, `G_RunFrame`, `local-game-bootstrap` et hook `fire_shotgun`.
- apps/web: le navigateur declenche le tir via les flux serveur/local/full-game et consomme le runtime porte; le binding arme `Shotgun: "1"` est un adapter d'input, pas une logique parallele de tir.
- renderer-three: sorties visibles attendues = view/world model `v_shotg`/`g_shotg`, muzzleflash/dlight `MZ_SHOTGUN`, sons shotgun, impacts `TE_SHOTGUN`, particules/dlights client et frames joueur; elles sont consommees par snapshots, `local-gameplay-sync`, `cl_fx`, refresh entity/dlights et renderer-three.
- Corrections: ajout d'assertions ciblees dans `scripts/verify/quake2-p-weapon.ts` pour `weapon_shotgun_fire` direct, projection, bruit joueur silencieux/non silencieux, frame `9`, degats/kick base et quad, count solo/deathmatch, ammo infini, tables `pause_frames`/`fire_frames` et frames non-fire.
- Tests lances: `npm run verify:p-weapon`, `npm run typecheck`, `npm run verify:local-gameplay-sync`, `npm run verify:cl-fx`, `npm run verify:full-game:three-renderer`, `npm run verify:refresh-entity:weapon`.

## Session 2026-05-06 - bloc super shotgun

- Lot traite: `weapon_supershotgun_fire`, variables locales `start`/`offset`/`v`/`damage`/`kick`, `Weapon_SuperShotgun`, tables locales `pause_frames` et `fire_frames`.
- Comparaison C/TS: kick origin `forward * -2`, kick angle `-2`, projection `[0, 8, viewheight - 8]`, degats/kick `6`/`12` et quad `24`/`48`, deux appels `fire_shotgun` avec yaw `-5` puis `+5`, spreads `DEFAULT_SHOTGUN_HSPREAD`/`DEFAULT_SHOTGUN_VSPREAD`, count `DEFAULT_SSHOTGUN_COUNT / 2`, `MOD_SSHOTGUN`, muzzleflash `MZ_SSHOTGUN | is_silenced`, `PlayerNoise`, avance gunframe, consommation de 2 shells et `DF_INFINITE_AMMO` compares contre le C. `Weapon_SuperShotgun` appelle `Weapon_Generic(ent, 6, 17, 57, 61, {29, 42, 57, 0}, {7, 0}, weapon_supershotgun_fire)`.
- Commentaires d'en-tete: `weapon_supershotgun_fire` et `Weapon_SuperShotgun` verifies avec `Original name`, `Source: game/p_weapon.c`, `Category: Ported`, niveau de fidelite et comportement.
- Runtime: integre via `g_items` (`weapon_supershotgun` -> `Weapon_SuperShotgun`), `Think_Weapon`, `ClientThink`/`ClientBeginServerFrame`, `G_RunFrame`, `local-game-bootstrap` et hook `fire_shotgun`.
- apps/web: le navigateur declenche le tir via les flux serveur/local/full-game et consomme le runtime porte; le binding arme `Super Shotgun: "2"` est un adapter d'input, pas une logique parallele de tir.
- renderer-three: sorties visibles attendues = view/world model `v_shotg2`/`g_shotg2`, muzzleflash/dlight `MZ_SSHOTGUN`, son super shotgun, impacts `TE_SHOTGUN`, particules/dlights client et frames joueur; elles sont consommees par snapshots, `local-gameplay-sync`, `cl_fx`, refresh entity/dlights et renderer-three.
- Corrections: ajout d'assertions ciblees dans `scripts/verify/quake2-p-weapon.ts` pour `weapon_supershotgun_fire` direct, deux directions yaw `-5`/`+5`, projection, bruit joueur silencieux/non silencieux, degats/kick base et quad, count divise en deux, ammo infini, tables `pause_frames`/`fire_frames` et frames non-fire.
- Tests lances: `npm run verify:p-weapon`, `npm run typecheck`, `npm run verify:local-gameplay-sync`, `npm run verify:cl-fx`, `npm run verify:full-game:three-renderer`, `npm run verify:refresh-entity:weapon`.

## Prochain lot recommande

Valider le bloc railgun: `weapon_railgun_fire`, variables locales `start`/`offset`/`damage`/`kick`, puis `Weapon_Railgun` avec `pause_frames` et `fire_frames`.
