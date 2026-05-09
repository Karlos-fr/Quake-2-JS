# Progress TS - packages/client/src/ref.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 35 symboles.
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:ref:header`
  - `npm run verify:ref-gl-host`
  - `npm run verify:gl-rmain`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Blocages: Aucun.

## Decisions

- Les macros, structs et typedefs proprietaires de `Quake-2-master/client/ref.h` sont marques `Couvert C/H` sur preuve de la matrice `client_ref.h.md`, deja `Valide` et pointant vers `packages/client/src/ref.ts`.
- `entity_t` est rattache a la ligne C/H `entity_s`, le typedef public etant `entity_t` dans `client/ref.h`.
- `model_s` et `image_s` sont classes `Adapter`: ils representent des handles opaques `struct model_s` / `struct image_s` exposes par `client/ref.h`, pas des portages proprietaires de definitions renderer.
- Les interfaces de resultats structures et les factories `create*` sont `Category: New` avec `Original name: N/A` et `Source: N/A (...)` explicites dans les entetes et la matrice.
