# Progress TS - packages/client/src/menu-player-config.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 21 symboles (`MAX_DISPLAYNAME`, `MAX_PLAYERMODELS`, `rate_tbl`, `rate_names`, `handedness`, callbacks player-config, helpers locaux, scan/init/draw/key/push).
- Prochain lot recommande: Aucun.
- Tests de reference: `npm run verify:menu`, `npm run verify:full-game:commands`, `npm run typecheck`.
- Blocages: Aucun.

## Decisions

- Les symboles proprietaires deja valides dans `client_menu.c.md` sont marques `Couvert C/H` sans revalidation comportementale inutile.
- `pmicmpfnc` est conserve en `Ported` et marque `Valide`: la source C existe dans `Quake-2-master/client/menu.c`, mais la matrice C/H actuelle n'a pas de ligne dediee pour ce comparateur.
- `normalizePlayerModel`, `stripPath`, `stripExtension`, `splitSkin` et `skinItemNames` sont des helpers locaux `Category: New` avec `Original name: N/A` et `Source: N/A (local helper)`.
- `clearPlayerModels` est un `Adapter` de `FreeFileList`: le nettoyage d'allocations C devient une remise a zero des tableaux temporaires sous GC JS.
