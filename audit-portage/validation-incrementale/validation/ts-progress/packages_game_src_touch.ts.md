# Progress TS - packages/game/src/touch.ts

- Statut: En cours
- Dernier lot valide: `G_TouchTriggers` et `G_TouchSolids`.
- Prochain lot recommande: completer les metadonnees `Category: New` de `touchTriggerEntities`, puis verifier `getActorBounds` et `hasNonZeroExtents`.

## Preuves de session

- Matrice TS lue: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_touch.ts.md`.
- Matrice C/H lue: `audit-portage/validation-incrementale/validation/matrices/game_g_utils.c.md`.
- Sources C/H lues: `Quake-2-master/game/g_utils.c`, `Quake-2-master/game/g_local.h`.
- Usages verifies: `packages/game/src/g_phys.ts`, `packages/game/src/m_move.ts`, `packages/game/src/p_client.ts`, `packages/client/src/local-gameplay-sync.ts`, `packages/game/src/index.ts`.

## Decisions

- `G_TouchTriggers` et `G_TouchSolids` sont les proprietaires attendus des entites `game/g_utils.c` deja validees dans la matrice C/H; statut TS `Couvert C/H`.
- Aucun doublon proprietaire trouve pour `Original name: G_TouchTriggers` ou `Original name: G_TouchSolids`.
- `touchTriggerEntities` reste un helper local `Category: New` et doit recevoir `Original name: N/A` et une `Source declaree: N/A (...)` dans le prochain lot.

## Tests

- `npm run verify:g-utils` OK.
- `npm run verify:collision:phase7` OK.

## Blocages

- Aucun.
