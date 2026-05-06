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

## Prochain lot recommande

Valider le bloc grenade launcher: `weapon_grenadelauncher_fire`, ses variables locales `damage`/`radius`, puis `Weapon_GrenadeLauncher` avec `pause_frames` et `fire_frames`.
