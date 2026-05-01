# Progress TS - apps/web/src/local-collision-adapter.ts

## Lot traite

- `createLocalCollisionAdapter`

## Decisions

- Symbole classe `Category: New`, avec `Original name: N/A` et `Source: N/A (web adapter)`.
- Pas de matrice C/H applicable: adapter web local qui delegue a `gameplayRuntime.collision.trace` et `pointcontents`.
- Ownership coherent: `apps/web` est autorise pour les adapters client/web.
- Aucun doublon de portage C/H applicable pour ce helper nouveau.
- L'en-tete ne presente pas ce helper comme portage proprietaire.

## Tests

- `npm run typecheck` OK.
- `npm run verify:collision:phase8` bloque avant scenario sur resolution module `packages/formats/src/bsp.js`.

## Prochain lot recommande

- Aucun pour ce fichier.
