# Progress TS - packages/game/src/g_items.ts

- Statut: En cours
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_g_items.ts.md`
- Fichier TS: `packages/game/src/g_items.ts`
- Derniere session: validation des globals caches armor/power armor et du helper `cacheItemIndices`.

## Dernier lot valide

- `jacket_armor_index`, `combat_armor_index`, `body_armor_index`, `power_screen_index`, `power_shield_index` et `quad_drop_timeout_hack` croises avec `game_g_items.c.md`: globals statiques C proprietaires de `game/g_items.c`, initialises/consommes dans le flux `SetItemNames`/pickups/Use_Quad et deja valides cote C/H pendant cette session.
- `cacheItemIndices` classe `New` avec `Original name: N/A` et `Source: N/A (local cache helper)`; entete ajoutee dans `packages/game/src/g_items.ts`.
- Correction locale dans `packages/game/src/g_items.ts`: `ArmorIndex` et `PowerArmorType` consomment maintenant les caches portes (`*_armor_index`, `power_*_index`) au lieu de refaire des lookups `FindItem`, ce qui rapproche le TS des usages C.
- Matrice TS ajustee: les six globals passent `Couvert C/H`; `cacheItemIndices` passe `Valide`.
- Integration runtime: conservee via `InitItems`/`SetItemNames`, `ArmorIndex`, `Pickup_Armor`, `PowerArmorType`, `Pickup_Powerup` et `Use_Quad`.
- `apps/web`: consommation indirecte via runtime local/full-game, inventaire/HUD/configstrings/snapshots; aucune logique parallele detectee dans le lot.
- `renderer-three`: pas de branchement dedie attendu pour ces caches; les sorties visibles restent les entites item generiques et les effets powerup/power armor produits en aval.

## Tests de reference

- `npm run verify:g-items`
- `npm run verify:p-hud`
- `npm run verify:p-view`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Blocages

- Aucun pour ce lot.

## Prochain lot recommande

- Classer les types de dispatch locaux (`GameItemPickupKind`, `GameItemUseKind`, `GameItemDropKind`, `GameItemWeaponThinkKind`) puis `RawGameItemDefinition` si le lot reste petit.
