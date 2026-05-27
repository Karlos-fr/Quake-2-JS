# Progress TS - packages/qcommon/src/md4.ts

## Etat courant

- Statut: Termine
- Lot courant: validation croisee complete des 30 symboles de `packages/qcommon/src/md4.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_qcommon_src_md4.ts.md`
- Matrice C/H principale: `audit-portage/validation-incrementale/validation/matrices/qcommon_md4.c.md`

## Derniere session

- Lot traite: `UINT4`, constantes `S11` a `S34`, `PADDING`, `MD4_CTX`, `createMD4Context`, fonctions publiques MD4, helpers prives `F`/`G`/`H`/`ROTATE_LEFT`/`FF`/`GG`/`HH`, `MD4Transform`, `Encode`, `Decode`.
- Verdict: 29 symboles marques `Couvert C/H` via `qcommon_md4.c.md`; `createMD4Context` marque `Valide` comme helper `Category: New` avec `Original name: N/A` et `Source declaree: N/A (TS context factory)`.
- Corrections: en-tetes completes dans `packages/qcommon/src/md4.ts` pour `UINT4`, `createMD4Context` et `MD4Transform`.
- Ownership: conforme, le port MD4 appartient bien a `packages/qcommon/src/md4.ts`; aucune duplication proprietaire detectee.
- Integration runtime/apps/web/renderer: `Com_BlockChecksum` reste consomme par `packages/qcommon/src/cmodel.ts` et reexporte depuis qcommon; aucune integration web/renderer directe attendue pour les helpers MD4 prives.
- Prochain lot: aucun.

## Tests de reference

- `npm run verify:md4`
- `npm run typecheck`
