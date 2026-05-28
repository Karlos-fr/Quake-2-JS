# Progress TS - packages/renderer-three/src/ref-gl-bootstrap.ts

- Statut: Termine
- Dernier lot valide: fichier complet `ref-gl-bootstrap.ts` (`RefGlBootstrapRuntimeHooks`, `RefGlBootstrapOptions`, `RefGlBootstrap`, `createRefGlBootstrap`).
- Prochain lot recommande: aucun pour cette matrice TS.
- Tests de reference:
  - `npm run verify:qgl:header`
  - `npm run verify:gl-rmain`
  - `npm run verify:ref-gl-host`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Decisions:
  - Le fichier est un assemblage `New` du runtime `gl_rmain` et des hooks `qgl`, pas un portage proprietaire de `R_Init`, `GetRefAPI`, `QGL_Init` ou des declarations `GLimp_*`.
  - Les proprietaires C/H restent `packages/renderer-three/src/gl_rmain.ts`, `packages/renderer-three/src/qgl.ts` et les fichiers `ref_gl` deja valides par leurs matrices.
  - Les quatre entites ont `Original name: N/A`, `Source: N/A (renderer ref_gl bootstrap)` et `Category: New` dans les en-tetes et la matrice.
- Integration:
  - Runtime renderer-three: integre via `createRefGlHost`, qui consomme `createRefGlBootstrap`, expose `GetRefAPI` et synchronise les runtimes renderer.
  - apps/web: integre indirectement via `apps/web/src/main.ts` et `apps/web/src/full-game.ts`, qui construisent le host ref_gl.
  - renderer-three: integre comme couche bootstrap locale; les sorties visibles restent produites par `gl_rmain`, `qgl`, `gl_image`, `gl_draw`, `gl_rsurf`, `gl_light`, `gl_warp` et les adapters Three.
- Blocages: aucun.
