# Progress TS - packages/renderer-three/src/particle-sync.ts

- Statut: Termine
- Dernier lot valide: `ThreeParticleSync`, `ThreeParticleSyncOptions`, `createThreeParticleSync`, `computePointParameterSize`, `clamp01`, `createRuntimeCvar`, `loadPaletteTable`.
- Verdict: toutes les entites de la matrice sont `Valide` en `Category: New`.
- Decision: `particle-sync.ts` est un synchroniseur Three.js des particules du `ClientRefreshFrame`; le portage proprietaire C/H de `R_DrawParticles` et `GL_DrawParticles` reste `packages/renderer-three/src/gl_rmain.ts`.
- Integration: renderer-three integre via le point cloud `refresh-particles` alimente par `R_DrawParticles`; apps-web consomme indirectement via `full-game-render-loop`, `full-game`, `main` et `web-demo-loop`; runtime consomme les particules deja produites dans le `ClientRefreshFrame`.
- Tests de reference: `npm run verify:particle-sync`, `npm run verify:gl-rmain`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.
- Blocages: aucun.
- Prochain lot recommande: aucun.
