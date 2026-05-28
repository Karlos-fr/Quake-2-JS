# Progress TS - packages/renderer-three/src/three-polyblend-overlay.ts

- Statut: Termine
- Dernier lot valide: 2026-05-28 - Validation des 4 symboles de `three-polyblend-overlay.ts`.
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:polyblend-overlay`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
  - `git diff --check`
- Decisions:
  - `three-polyblend-overlay.ts` est un adapter de scene Three.js pour afficher le blend de vue produit par le runtime `ref_gl`.
  - Le portage proprietaire de `R_PolyBlend` reste `packages/renderer-three/src/gl_rmain.ts`, couvert par `ref_gl_gl_rmain.c.md`.
  - Les 4 symboles de ce fichier sont `Category: New`, avec `Original name: N/A` et `Source declaree: N/A (...)` explicites.
  - Aucun symbole de ce fichier n'est marque `Couvert C/H`.
- Integration: l'adapter est exporte par `packages/renderer-three/src/index.ts` et consomme par les chemins `apps/web` full-game/render-loop/main/demo; il recoit le hook `polyBlend` appele par `R_PolyBlend`.
- Blocages: Aucun.
