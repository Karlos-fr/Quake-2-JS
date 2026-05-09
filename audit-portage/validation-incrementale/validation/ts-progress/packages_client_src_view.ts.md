# Progress TS - packages/client/src/view.ts

- Statut: Termine
- Lot traite: fichier complet, 57 symboles
- Dernier lot valide: validation TS croisee complete de `packages/client/src/view.ts`
- Prochain lot recommande: Aucun.

## Decisions

- Les 23 symboles proprietaires couverts par `client_cl_view.c.md`, `client_cl_pred.c.md` et `client_cl_ents.c.md` sont marques `Couvert C/H` uniquement lorsque la matrice C/H indique `Valide` avec `packages/client/src/view.ts` comme proprietaire TS attendu.
- `SCR_DrawCrosshair` reste le proprietaire TS du portage `client/cl_view.c`; `SCR_DrawCrosshairRef` dans `cl_scrn.ts` reste un adapter ref/HUD deja valide.
- `CL_UpdateLerpFraction` ne porte pas proprietairement `CL_AddEntities`; il est reclasse `Adapter` avec `Original name: N/A` et `Source: N/A (CL_AddEntities lerp helper)`. Le proprietaire TS de `CL_AddEntities` reste `packages/client/src/refresh.ts` `CL_BuildRefreshFrame`.
- Les contrats, factories et helpers locaux sont explicites avec `Original name: N/A`, `Source: N/A (...)`, `Category: New`.
- Les adapters prives de construction de scene/refdef, resolution model/skin, disguise et clientinfo ne masquent pas les proprietaires C/H (`refresh.ts`, `cl_ents.ts`, `cl_parse.ts`).

## Tests de reference

- `npm run verify:cl-view`
- `npm run verify:cl-pred`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:refresh-entity:weapon`
- `npm run verify:refresh-entity:alias-flags`
- `npm run typecheck`

## Blocages

- Aucun blocage ouvert pour `view.ts`.
