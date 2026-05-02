# Progress - Quake-2-master/client/cl_fx.c

- Statut: En cours
- Dernier lot valide: `CL_LogoutEffect`, `CL_ItemRespawnParticles` (prototypes et definitions representes en double dans la matrice).
- Tests de reference lances:
  - `npm run verify:cl-fx`
  - `npm run verify:particle-sync`
  - `npx tsx ./scripts/verify/quake2-full-game-three-renderer.ts`
  - `npm run typecheck`
- Decisions:
  - `CL_LogoutEffect` et `CL_ItemRespawnParticles` restent proprietaires de `packages/client/src/cl_fx.ts`.
  - `appendLogoutEffect` est un adapter de `CL_ParseMuzzleFlash`, pas un second port proprietaire de `CL_LogoutEffect`; son en-tete a ete corrige en `Category: Adapter`.
  - `CL_ItemRespawnParticles` doit etre applique depuis `apps/web` pour `EV_ITEM_RESPAWN`, car l'evenement produit des particules visibles consommees ensuite par `ClientRefreshFrame.particles` puis `packages/renderer-three/src/particle-sync.ts`.
  - `renderer-three` est integre indirectement via `CL_AddParticles` -> `ClientRefreshFrame.particles` -> `createThreeParticleSync`; aucun branchement renderer specifique supplementaire n'est requis pour ce lot.
- Blocages: aucun.
- Prochain lot recommande: `clightstyle_t`, `CL_ClearLightStyles`, `CL_RunLightStyles`, `CL_SetLightstyle`, `CL_AddLightStyles` si le lot reste raisonnable.
