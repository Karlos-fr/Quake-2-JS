# Progress TS - packages/renderer-three/src/sky-scene-adapter.ts

- Statut: Termine
- Dernier lot valide: 2026-05-28 - validation des 12 symboles du fichier.
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:sky:phase3`
  - `npm run verify:sky:phase4`
  - `npm run verify:sky:phase5`
  - `npm run verify:three-world-warp-sky`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
  - `git diff --check`

## Decisions

- `sky-scene-adapter.ts` est un adapter Three.js hors ownership C/H direct.
- Le portage proprietaire de `ref_gl/gl_warp.c` reste `packages/renderer-three/src/gl_warp.ts`, notamment `MakeSkyVec`, `R_DrawSkyBox`, `R_SetSky`, `skytexorder` et les etats sky.
- Les 12 symboles de ce fichier sont classes `Category: New` avec `Original name: N/A` et une `Source` `N/A (...)` explicite; ils consomment les sorties portees de `gl_warp.ts` sans les presenter comme portage proprietaire.

## Integration

- Runtime: non applicable directement; le fichier consomme le snapshot sky client et les faces produites par le renderer.
- apps/web: integre via `full-game-render-loop.ts`, `full-game.ts`, `main.ts` et `web-demo-loop.ts`.
- renderer-three: integre via `gl-world-scene-adapter.ts` qui produit `skyFaces` depuis `R_ClearSkyBox`, `R_AddSkySurface` et `R_DrawSkyBox`, puis via `sky-scene-adapter.ts` qui rend le mesh Three.js.
