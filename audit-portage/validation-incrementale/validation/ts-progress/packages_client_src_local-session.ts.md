# Progress TS - packages/client/src/local-session.ts

## Session 2026-05-09

- Lot traite: fichier complet, 8 symboles audites (`DEFAULT_SPAWN_LIFT`, `DEFAULT_VIEWHEIGHT`, `LocalClientSessionState`, `LocalClientSessionInputState`, `LocalClientSessionSnapshotHooks`, `LocalClientSessionOptions`, `initializeLocalClientSession`, `stepLocalClientSession`).
- Decision: toutes les entites sont `Category: New`, avec `Original name: N/A` et `Source: N/A (...)` explicites dans les entetes et la matrice.
- Croisement C/H: aucune matrice C/H proprietaire attendue; le fichier est un coordinateur runtime local qui compose les portages proprietaires client/game/qcommon sans les remplacer.
- Ownership/doublons: package `packages/client` coherent pour la session client locale; recherche de doublons propre pour les symboles du lot; les helpers constants restent locaux et non exportes.
- Runtime: integre via `apps/web/src/local-client-controller.ts`, `apps/web/src/full-game-local-session.ts`, et reexport partiel par `packages/client/src/index.ts`.
- apps/web: applicable et branche; `full-game.ts` ne depend pas de ce harnais local standalone, ce qui preserve le chemin autoritaire.
- renderer-three: non applicable direct; le fichier ne produit pas de rendu, il transmet les snapshots/runtime que les adapters existants consomment via les chemins web.
- Tests de reference: `npm run verify:pmove:local-bmodel`, `npm run verify:full-game:demo-cleanup`, `npm run typecheck`.
- Prochain lot recommande: aucun dans cette matrice; si la matrice TS est regeneree, verifier que les deux fonctions exportees restent listees.
