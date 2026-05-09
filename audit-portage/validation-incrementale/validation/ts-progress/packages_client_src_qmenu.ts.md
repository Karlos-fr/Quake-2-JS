# Progress TS - packages/client/src/qmenu.ts

- Fichier TS: `packages/client/src/qmenu.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_qmenu.ts.md`
- Statut: Termine
- Dernier lot valide: fichier complet, 76 symboles audites en lot 20x.
- Prochain lot recommande: Aucun dans la matrice TS actuelle.
- Tests de reference:
  - `npm run verify:qmenu`
  - `npm run verify:qmenu:header`
  - `npm run verify:menu`
  - `npm run typecheck`
- Decisions importantes:
  - Les symboles porteurs de `client/qmenu.c` et `client/qmenu.h` sont marques `Couvert C/H` uniquement quand les matrices C/H designent `packages/client/src/qmenu.ts` comme cible et sont deja `Valide`.
  - Les helpers/factories/contexte runtime TypeScript sont `Category: New` avec `Original name: N/A` et une `Source declaree: N/A (...)` explicite.
  - `emitDrawChar` et `emitDrawFill` sont des `Adapter` des macros C `Draw_Char` et `Draw_Fill`, sans deplacer l'ownership du renderer.
- Blocages: Aucun.