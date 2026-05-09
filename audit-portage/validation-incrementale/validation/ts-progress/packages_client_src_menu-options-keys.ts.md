# Progress TS - packages/client/src/menu-options-keys.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 35 symboles (`bindnames`, tables options/keys, callbacks keys/options, fonctions menu exportees).
- Prochain lot recommande: Aucun.
- Tests de reference: `npm run verify:menu`, `npm run typecheck`.
- Blocages: Aucun.
- Decisions:
  - `bindnames` est marque `Valide` par verification directe contre `Quake-2-master/client/menu.c`, car la matrice C/H ne contient pas de ligne dediee pour cette table.
  - Les 34 autres symboles sont marques `Couvert C/H` apres verification des lignes `Valide` de `client_menu.c.md` et du proprietaire TS attendu.
