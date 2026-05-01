# Progress - Quake-2-master/game/g_items.c

## Dernier lot valide

- `Weapon_Machinegun` reference par `g_items.c` et porte dans `packages/game/src/p_weapon.ts`, avec entree `weapon_machinegun` alignee dans `packages/game/src/g_items.ts`.

Passe rapide post-validation du 2026-04-30: controle limite aux lignes deja `Valide` (`Pickup_Weapon`, `Use_Weapon`). Branchements runtime confirmes (`Touch_Item`/dispatch item pour pickup, commandes et bootstrap local pour use); integration `apps/web` attendue via la synchro gameplay/client et le bootstrap local; pas de branchement dedie `renderer-three` attendu au niveau de ces fonctions, les sorties visibles transitant par les entites refresh MD2 generiques et le HUD client.

Validation `Drop_Weapon` du 2026-04-30: comparaison avec `game/p_weapon.c` confirmee (`DF_WEAPONS_STAY`, refus du dernier exemplaire de l'arme courante/nouvelle, `Drop_Item`, decrement inventaire). Header TS mis a jour pour documenter que `Drop_Item` porte est le chemin par defaut. Runtime branche via `Cmd_Drop_f`/`Cmd_InvDrop_f` et dispatch `g_cmds.ts`; `apps/web` passe par les commandes client forwardees au runtime; `renderer-three` non specifique, il consomme l'entite item visible generique produite par `Drop_Item`.

Validation `Weapon_Blaster` du 2026-04-30: comparaison avec `game/p_weapon.c` confirmee (`Weapon_Generic(ent, 4, 8, 52, 55, [19, 32, 0], [5, 0], Weapon_Blaster_Fire)`, degats 10 solo / 15 deathmatch, `Blaster_Fire` non hyper avec `EF_BLASTER`, increment `gunframe`). Entree `weapon_blaster` de `g_items.c` alignee dans `rawItemlist` (`Use_Weapon`, pas de pickup/drop, view model `models/weapons/v_blast/tris.md2`, icone `w_blaster`, flags `IT_WEAPON|IT_STAY_COOP`, `WEAP_BLASTER`, precaches). Headers TS verifies pour `Blaster_Fire`, `Weapon_Blaster_Fire` et `Weapon_Blaster`. Runtime branche via `Think_Weapon` depuis `ClientThink`/`ClientBeginServerFrame` et depuis `local-game-bootstrap.ts`; `apps/web` attendu via ce runtime local/commandes, sans logique gameplay parallele; `renderer-three` consomme les sorties visibles generiques produites en aval (bolt `EF_BLASTER`, muzzle/temp effects, dlights/trails via client refresh), pas de branchement dedie requis.

Validation `Weapon_Shotgun` du 2026-04-30: comparaison avec `game/p_weapon.c` confirmee (`Weapon_Generic(ent, 7, 18, 36, 39, [22, 28, 34, 0], [8, 9, 0], weapon_shotgun_fire)`, degats 4/kick 8, quad x4, `fire_shotgun` avec spread 500/500, count `DEFAULT_SHOTGUN_COUNT` ou `DEFAULT_DEATHMATCH_SHOTGUN_COUNT`, `MZ_SHOTGUN`, increment `gunframe`, `PlayerNoise`, decrement ammo hors `DF_INFINITE_AMMO`, frame 9 sans second tir). Entree `weapon_shotgun` de `g_items.c` alignee dans `rawItemlist` (`Pickup_Weapon`, `Use_Weapon`, `Drop_Weapon`, view/world models shotgun, icone `w_shotgun`, quantity 1, ammo `Shells`, flags `IT_WEAPON|IT_STAY_COOP`, `WEAP_SHOTGUN`, precaches `weapons/shotgf1b.wav weapons/shotgr1b.wav`). Headers TS verifies pour `weapon_shotgun_fire`, `Weapon_Shotgun` et `fire_shotgun`. Runtime branche via `Think_Weapon`/`Weapon_Generic` depuis `ClientThink`/`ClientBeginServerFrame` et depuis `local-game-bootstrap.ts`; `apps/web` attendu via runtime local/commandes et bindings HUD/demo, sans logique gameplay parallele; `renderer-three` consomme les sorties visibles generiques (view weapon MD2, `MZ_SHOTGUN`, `TE_SHOTGUN`, dlight/audio/particules client), pas de branchement dedie requis.

Validation `Weapon_SuperShotgun` du 2026-04-30: comparaison avec `game/p_weapon.c` confirmee (`Weapon_Generic(ent, 6, 17, 57, 61, [29, 42, 57, 0], [7, 0], weapon_supershotgun_fire)`, degats 6/kick 12, quad x4, deux appels `fire_shotgun` avec yaw -5/+5, spread `DEFAULT_SHOTGUN_HSPREAD`/`DEFAULT_SHOTGUN_VSPREAD`, count `DEFAULT_SSHOTGUN_COUNT/2`, `MOD_SSHOTGUN`, `MZ_SSHOTGUN`, increment `gunframe`, `PlayerNoise`, decrement de 2 shells hors `DF_INFINITE_AMMO`). Entree `weapon_supershotgun` de `g_items.c` alignee dans `rawItemlist` (`Pickup_Weapon`, `Use_Weapon`, `Drop_Weapon`, view/world models super shotgun, icone `w_sshotgun`, quantity 2, ammo `Shells`, flags `IT_WEAPON|IT_STAY_COOP`, `WEAP_SUPERSHOTGUN`, precache `weapons/sshotf1b.wav`). Headers TS verifies pour `weapon_supershotgun_fire` et `Weapon_SuperShotgun`. Runtime branche via `Think_Weapon`/`Weapon_Generic` depuis `ClientThink`/`ClientBeginServerFrame` et depuis `local-game-bootstrap.ts`; `apps/web` attendu via runtime local/commandes, sans logique gameplay parallele; `renderer-three` consomme les sorties visibles generiques (view weapon MD2, `MZ_SSHOTGUN`, temp effects/dlights/particules client), pas de branchement dedie requis.

Validation `Weapon_Machinegun` du 2026-05-01: comparaison avec `game/p_weapon.c` confirmee (`Weapon_Generic(ent, 3, 5, 45, 49, [23, 45, 0], [4, 5, 0], Machinegun_Fire)`, degats 8/kick 2, quad x4, alternance `gunframe` 4/5, reset `machinegun_shots` quand attaque relachee, recoil plafonne a 9 hors deathmatch, `fire_bullet` avec spread balle par defaut et `MOD_MACHINEGUN`, `MZ_MACHINEGUN`, `PlayerNoise`, decrement d'une bullet hors `DF_INFINITE_AMMO`). Entree `weapon_machinegun` de `g_items.c` alignee dans `rawItemlist` (`Pickup_Weapon`, `Use_Weapon`, `Drop_Weapon`, view/world models machinegun, icone `w_machinegun`, quantity 1, ammo `Bullets`, flags `IT_WEAPON|IT_STAY_COOP`, `WEAP_MACHINEGUN`, precaches `weapons/machgf1b.wav weapons/machgf2b.wav weapons/machgf3b.wav weapons/machgf4b.wav weapons/machgf5b.wav`). Headers TS verifies pour `Machinegun_Fire` et `Weapon_Machinegun`. Correction appliquee dans `packages/game/src/p_weapon.ts`: sons `weapons/noammo.wav` remis sur `CHAN_VOICE` comme le C pour les branches no-ammo du port. Runtime branche via `Think_Weapon`/`Weapon_Generic` depuis `ClientThink`/`ClientBeginServerFrame` et depuis `local-game-bootstrap.ts`; `apps/web` attendu via runtime local/commandes, sans logique gameplay parallele; `renderer-three` consomme les sorties visibles generiques (view weapon MD2, `MZ_MACHINEGUN`, `TE_GUNSHOT`, dlights/particules/audio client), pas de branchement dedie requis.

## Tests de reference

- `npm run verify:g-items`
- `npm run verify:p-weapon`
- `npm run verify:full-game:three-renderer`
- `npm run verify:refresh-entity:weapon`
- `npm run typecheck` si TS modifie
- Sonde directe `Drop_Weapon` normal/current/DF_WEAPONS_STAY via `npx tsx` stdin.
- Sonde directe `Weapon_Blaster` solo/deathmatch via `npx tsx` stdin: degats, `EF_BLASTER`, `gunframe`, muzzleflash.
- Sonde directe `Weapon_Shotgun` solo/deathmatch/quad/infinite ammo/frame 9 via `npx tsx` stdin: degats/kick, spreads/count/mod, `MZ_SHOTGUN`, `gunframe`, ammo.
- Sonde directe `weapon_supershotgun_fire` normal/quad/infinite ammo via `npx tsx` stdin: deux groupes, yaw -5/+5, degats/kick, spreads/count/mod, `MZ_SSHOTGUN`, `gunframe`, ammo.
- Sonde `Weapon_Machinegun` ajoutee a `npm run verify:p-weapon`: degats/kick quad, spreads/mod, `MZ_MACHINEGUN`, alternance `gunframe`, recoil, ammo normal/`DF_INFINITE_AMMO`, relachement attaque et canal no-ammo `CHAN_VOICE`.

## Blocages

- `npm run verify:full-game:gameplay` a echoue avant le flux gameplay sur `ERR_MODULE_NOT_FOUND` pour `packages/client/src/main.js` importe par `scripts/verify/quake2-full-game-gameplay-commands.ts` (reconfirme le 2026-05-01 pendant le lot `Weapon_Machinegun`).

## Prochain lot recommande

- `Weapon_Chaingun`, en gardant la meme attention au rattachement `g_items.c` declarations/table vers le corps original `game/p_weapon.c` et le port `packages/game/src/p_weapon.ts`.
