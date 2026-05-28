# Progress TS - packages/renderer-three/src/anormtab.ts

- Fichier TS: `packages/renderer-three/src/anormtab.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_renderer-three_src_anormtab.ts.md`
- Statut: Termine

## Dernier lot traite

- 2026-05-28: `SHADEDOT_QUANT`, `SHADEDOT_NORMALS`, `R_AVERTEXNORMAL_DOTS`, `getAliasShadedots`, `getAliasShadedot`.
- `R_AVERTEXNORMAL_DOTS` marque `Couvert C/H` via `ref_gl_anormtab.h.md`.
- `SHADEDOT_QUANT` classe `Adapter`: la matrice C/H `ref_gl_gl_mesh.c.md` pointe vers le proprietaire `packages/renderer-three/src/gl_mesh.ts`; ici la constante ne sert qu'a indexer la table portee.
- `SHADEDOT_NORMALS`, `getAliasShadedots`, `getAliasShadedot`: `Category: New`, `Original name: N/A`, `Source: N/A (...)`, hors C/H.

## Preuves de session

- Matrice TS lue: `audit-portage/validation-incrementale/validation/ts-matrices/packages_renderer-three_src_anormtab.ts.md`.
- Matrices C/H lues: `ref_gl_anormtab.h.md`, `ref_gl_gl_mesh.c.md`.
- Les helpers de lookup ne masquent aucun portage proprietaire; ils exposent la table portee de facon typee.

## Integration runtime/apps-web/renderer-three

- Runtime: non applicable, table renderer.
- apps-web: consomme indirectement via le renderer-three selectionne par le web host.
- renderer-three: integre via l'eclairage alias model et les imports renderer; la table est dans le package proprietaire `renderer-three`.

## Tests

- `npm run verify:anormtab`
- `npm run verify:gl-mesh`
- `npm run typecheck`

## Prochain lot recommande

- Aucun: matrice TS close pour `packages/renderer-three/src/anormtab.ts`.

## Blocages

- Aucun.
