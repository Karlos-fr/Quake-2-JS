# Progress TS - packages/client/src/local-loop.ts

- Statut: Termine
- Dernier lot valide: tout le fichier (`LocalClientCollisionAdapter`, `applyLocalMovementMode`, `initializeLocalSpawnPrediction`, `promoteLocalPredictedState`, `buildLocalPredictedViewState`, `cloneLocalUsercmd`, `getPredictedViewheight`, `storeLocalClientFrame`)
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:local-gameplay-sync`
  - `npm run verify:pmove:local-bmodel`
  - `npm run verify:full-game:newgame`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Decisions:
  - Les 8 symboles sont du code `Category: New` sans proprietaire C/H direct.
  - Les en-tetes et la matrice utilisent `Original name: N/A` et `Source: N/A (standalone local-client helper)`.
  - Le fichier fournit une couche runtime locale de prediction/vue, consommee par `local-session.ts`, `local-gameplay-sync.ts` et `apps/web/src/local-client-controller.ts`.
  - `renderer-three` consomme les sorties via le refresh frame/camera produit par le runtime et l'adapter web, sans ownership direct dans ce fichier.
- Blocages: Aucun.
