# Progress - Quake-2-master/game/p_weapon.c

## Session 2026-05-06

- Lot traite: bloc initial `is_quad`/`is_silenced`, `P_ProjectSource`, `PlayerNoise`, `Pickup_Weapon`, `ChangeWeapon`, `NoAmmoWeaponChange`, `Think_Weapon`, `Use_Weapon`, `Drop_Weapon`, macros locales `FRAME_*`, `Weapon_Generic`, et faux positifs de variables locales associes.
- Comparaison C/TS: comportements compares contre `Quake-2-master/game/p_weapon.c` et `packages/game/src/p_weapon.ts`; les commentaires d'en-tete des fonctions portees du lot sont presents avec `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior` et notes utiles.
- Runtime: fonctions atteignables via `Touch_Item`/`Pickup_Weapon`, commandes `use`/`drop`, `ClientThink`, `ClientBeginServerFrame`, `ChangeWeapon` et le bootstrap local. Les sorties visibles de tir passent par les events runtime de muzzleflash/sons et par `local-gameplay-sync`.
- apps/web: le flux navigateur consomme le runtime par `local-client-controller` et la boucle `full-game-render-loop`; aucune logique web parallele ne remplace le lot.
- renderer-three: les effets visibles attendus de ce lot sont indirects (view weapon, muzzleflash/dlights, sons, frames joueur). Ils sont consommes via `ClientRefreshFrame`, `CL_BuildMuzzleFlashEffects`, `refresh-entity-sync`, `dlight-sync` et les tests renderer/client.
- Corrections: ajout d'assertions ciblees dans `scripts/verify/quake2-p-weapon.ts` pour handedness de `P_ProjectSource`, pickup/use/drop/change weapon et bit `MZ_SILENCED`.
- Tests lances: `npm run verify:p-weapon`, `npm run verify:local-gameplay-sync`, `npm run verify:cl-fx`, `npm run verify:refresh-entity:weapon`.

## Prochain lot recommande

Valider le bloc grenade: `GRENADE_TIMER`, `GRENADE_MINSPEED`, `GRENADE_MAXSPEED`, l'implementation `weapon_grenade_fire`, ses variables locales, puis `Weapon_Grenade`.
