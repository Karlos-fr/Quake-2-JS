# Progress TS - packages/client/src/local-brush-models.ts

- Statut: Termine
- Dernier lot valide: tout le fichier (`BrushModelSnapshot`, `buildBrushModelSnapshots`, `createBrushModelInterpolationState`, `buildInterpolatedBrushModelSnapshots`, `cloneBrushModelSnapshots`, `cloneBrushModelSnapshot`, `lerpValue`, `clamp01`)
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:local-gameplay-sync`
  - `npm run verify:pmove:local-bmodel`
  - `npm run verify:full-game:newgame`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Decisions:
  - Les 8 symboles sont du code `Category: New` sans proprietaire C/H direct.
  - Les en-tetes et la matrice utilisent `Original name: N/A` et `Source: N/A (local brush-model helper)`.
  - Correction appliquee pendant la validation: `buildInterpolatedBrushModelSnapshots` calcule maintenant sa fraction depuis `previousTime`, avec test cible dans `verify:local-gameplay-sync`.
  - Le fichier fournit une couche runtime locale de snapshots/interpolation de brush models, consommee par les sessions web/locales et par le renderer Three via l'adapter de scene monde.
- Blocages: Aucun.
