# Progress TS - packages/game/src/g_items.ts

- Statut: En cours
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_g_items.ts.md`
- Fichier TS: `packages/game/src/g_items.ts`
- Derniere session: validation du lot constantes/macros locales.

## Dernier lot valide

- `HEALTH_IGNORE_MAX` et `HEALTH_TIMED` croises avec `game_g_items.c.md`: macros C proprietaires de `game/g_items.c`, valeurs TS privees conformes et deja validees cote C/H.
- Correction locale dans `packages/game/src/g_items.ts`: suppression des alias locaux `ARMOR_*` et `AMMO_*`, qui doublonnaient les proprietaires `g_local.ts`/`runtime.ts`; `g_items.ts` importe maintenant les constantes armor proprietaires et utilise `ammo_t.*` directement.
- Matrice TS ajustee: les 10 alias retires ne sont plus des symboles TS de ce fichier; les deux macros health sont marquees `Couvert C/H`.
- Integration runtime: conservee via `SP_item_health*`, `Pickup_Health`, itemlist armor/ammo et `getAmmoMax`.
- `apps/web`: non specifique au lot, consommation indirecte via runtime/HUD/snapshots sans logique parallele.
- `renderer-three`: non specifique au lot, consommation uniquement via entites item visibles generiques.

## Tests de reference

- `npm run verify:g-items`
- `npm run typecheck`

## Blocages

- Aucun pour les lignes `Couvert C/H` auditees.

## Prochain lot recommande

- Traiter les globals caches non couverts (`jacket_armor_index`, `combat_armor_index`, `body_armor_index`, `power_screen_index`, `power_shield_index`, `quad_drop_timeout_hack`) puis `cacheItemIndices`.
