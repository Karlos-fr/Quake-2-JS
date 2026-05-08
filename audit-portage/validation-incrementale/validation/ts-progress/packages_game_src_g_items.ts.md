# Progress TS - packages/game/src/g_items.ts

- Statut: Termine
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_g_items.ts.md`
- Fichier TS: `packages/game/src/g_items.ts`
- Derniere session: classement des types/helpers locaux de dispatch et des vues itemlist TS.

## Dernier lot valide

- `GameItemPickupKind`, `GameItemUseKind`, `GameItemDropKind`, `GameItemWeaponThinkKind`, `RawGameItemDefinition`, `itemlist`, `GetGameItems`, `GetArmorInfoByItem`, `GetAmmoItemForWeapon`, `FindWeaponItemByThink`, `ITEM_INDEX`, `requireClient`, `getArmorInfoByIndex`, `getAmmoMax`, `grantAmmoPickup`, `callItemPickup` et `callItemUse` classes `New` avec `Original name: N/A`, `Source declaree: N/A (<raison locale>)` et entetes ajoutees/completes dans `packages/game/src/g_items.ts`.
- Les types de dispatch sont des remplacements locaux des pointeurs de fonctions `gitem_t` (`pickup`, `use`, `drop`, `weaponthink`) declares dans `game/g_local.h`; ils ne sont pas des portages proprietaires autonomes et restent subordonnes a `GameItemDefinition`/`rawItemlist` et aux fonctions portees qu'ils dispatchent.
- `jacketarmor_info`, `combatarmor_info` et `bodyarmor_info` rattaches a `Quake-2-master/game/g_items.c` avec entetes `Ported`; valeurs comparees directement pendant cette session aux globals C `{25,50,.30,.00,ARMOR_JACKET}`, `{50,100,.60,.30,ARMOR_COMBAT}` et `{100,200,.80,.60,ARMOR_BODY}`.
- `ITEM_INDEX` local classe comme helper prive nullable; le proprietaire public du macro header `ITEM_INDEX` reste `packages/game/src/g_local.ts`.
- Matrice TS ajustee: plus aucun `A verifier` ni `Entete incomplet` pour `packages/game/src/g_items.ts`.
- Integration runtime: conservee via `rawItemlist`/`itemlist`, `InitItems`, `SetItemNames`, `FindItem`, `GetItemByIndex`, `SpawnItem`, `Touch_Item`, `Pickup_*`, `Use_*`, `Drop_*`, `g_spawn.ts`, `g_cmds.ts`, `g_combat.ts`, `p_weapon.ts` et `local-game-bootstrap.ts`.
- `apps/web`: consommation indirecte via runtime local/full-game, commandes, inventaire/HUD, configstrings, sons et snapshots; aucune logique parallele itemlist/dispatch detectee dans ce lot.
- `renderer-three`: pas de branchement gameplay dedie attendu; il consomme les sorties visibles generiques produites par le runtime (entites items MD2, disparition/respawn/drop, effets joueur en aval).

## Tests de reference

- `npm run verify:g-items`
- `npm run verify:g-local:header`
- `npm run verify:p-weapon`
- `npm run verify:local-gameplay-sync`
- `npm run verify:p-hud`
- `npm run verify:p-view`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Blocages

- Aucun pour ce lot.

## Prochain lot recommande

- Aucun pour `packages/game/src/g_items.ts` cote matrice TS actuelle; reprendre un autre fichier `En cours` depuis `AVANCEMENT_GLOBAL_TS.md`.
