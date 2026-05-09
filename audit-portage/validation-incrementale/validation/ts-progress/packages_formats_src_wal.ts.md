# Progress TS - packages/formats/src/wal.ts

- Statut: Termine
- Lot traite: fichier complet, 10 symboles.
- Derniere validation: validation TS croisee complete.
- Prochain lot recommande: aucun.

## Decisions

- `MIPLEVELS` et `miptex_t` sont `Couvert C/H` via `qcommon_qfiles.h.md`, qui designe `packages/formats/src/wal.ts` comme proprietaire TS attendu.
- `packages/formats` est le split legitime des formats de fichiers declares dans `qcommon/qfiles.h`.
- `parseWal` est classe `Adapter`, pas portage proprietaire de `GL_LoadWal`; le port renderer reste `packages/renderer-three/src/gl_image.ts`.
- Les constantes et helpers locaux du parser WAL sont `Category: New` avec `Original name: N/A` et `Source: N/A (...)` explicites.

## Tests

- `npm run verify:qfiles`
- `npm run verify:gl-image`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Blocages

- Aucun.
