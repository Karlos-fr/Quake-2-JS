# Progress - Quake-2-master/game/g_items.c

## Dernier lot valide

- `Weapon_Blaster` reference par `g_items.c` et porte dans `packages/game/src/p_weapon.ts`, avec entree `weapon_blaster` alignee dans `packages/game/src/g_items.ts`.

Passe rapide post-validation du 2026-04-30: controle limite aux lignes deja `Valide` (`Pickup_Weapon`, `Use_Weapon`). Branchements runtime confirmes (`Touch_Item`/dispatch item pour pickup, commandes et bootstrap local pour use); integration `apps/web` attendue via la synchro gameplay/client et le bootstrap local; pas de branchement dedie `renderer-three` attendu au niveau de ces fonctions, les sorties visibles transitant par les entites refresh MD2 generiques et le HUD client.

Validation `Drop_Weapon` du 2026-04-30: comparaison avec `game/p_weapon.c` confirmee (`DF_WEAPONS_STAY`, refus du dernier exemplaire de l'arme courante/nouvelle, `Drop_Item`, decrement inventaire). Header TS mis a jour pour documenter que `Drop_Item` porte est le chemin par defaut. Runtime branche via `Cmd_Drop_f`/`Cmd_InvDrop_f` et dispatch `g_cmds.ts`; `apps/web` passe par les commandes client forwardees au runtime; `renderer-three` non specifique, il consomme l'entite item visible generique produite par `Drop_Item`.

Validation `Weapon_Blaster` du 2026-04-30: comparaison avec `game/p_weapon.c` confirmee (`Weapon_Generic(ent, 4, 8, 52, 55, [19, 32, 0], [5, 0], Weapon_Blaster_Fire)`, degats 10 solo / 15 deathmatch, `Blaster_Fire` non hyper avec `EF_BLASTER`, increment `gunframe`). Entree `weapon_blaster` de `g_items.c` alignee dans `rawItemlist` (`Use_Weapon`, pas de pickup/drop, view model `models/weapons/v_blast/tris.md2`, icone `w_blaster`, flags `IT_WEAPON|IT_STAY_COOP`, `WEAP_BLASTER`, precaches). Headers TS verifies pour `Blaster_Fire`, `Weapon_Blaster_Fire` et `Weapon_Blaster`. Runtime branche via `Think_Weapon` depuis `ClientThink`/`ClientBeginServerFrame` et depuis `local-game-bootstrap.ts`; `apps/web` attendu via ce runtime local/commandes, sans logique gameplay parallele; `renderer-three` consomme les sorties visibles generiques produites en aval (bolt `EF_BLASTER`, muzzle/temp effects, dlights/trails via client refresh), pas de branchement dedie requis.

## Tests de reference

- `npm run verify:g-items`
- `npm run verify:p-weapon`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck` si TS modifie
- Sonde directe `Drop_Weapon` normal/current/DF_WEAPONS_STAY via `npx tsx` stdin.
- Sonde directe `Weapon_Blaster` solo/deathmatch via `npx tsx` stdin: degats, `EF_BLASTER`, `gunframe`, muzzleflash.

## Blocages

- `npm run verify:full-game:gameplay` a echoue avant le flux gameplay sur `ERR_MODULE_NOT_FOUND` pour `packages/client/src/main.js` importe par `scripts/verify/quake2-full-game-gameplay-commands.ts`.

## Prochain lot recommande

- `Weapon_Shotgun`, en gardant la meme attention au rattachement `g_items.c` declarations/table vers le corps original `game/p_weapon.c` et le port `packages/game/src/p_weapon.ts`.
