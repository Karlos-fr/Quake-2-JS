# Progress TS - packages/client/src/vid.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 11 symboles.
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:vid:header`
  - `npm run verify:menu`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Blocages: Aucun.

## Decisions

- `viddef_t` et les six fonctions `VID_*` sont `Couvert C/H` via `client_vid.h.md`, qui marque les entites `Valide` avec `packages/client/src/vid.ts` comme proprietaire TS attendu.
- `ClientVidHooks`, `ClientVidContext`, `createVidDef` et `createClientVidContext` sont `Category: New` avec `Original name: N/A` et une `Source declaree: N/A (...)` explicite.
- Le `viddef_t` de `packages/renderer-three/src/gl_local.ts` n'est pas un doublon proprietaire de `client/vid.h`; il est rattache a `ref_gl/gl_local.h`.
