# Progress - Quake-2-master/client/cl_fx.c

- Statut: En cours
- Dernier lot valide: `clightstyle_t`, ses champs `length`/`value`/`map`, `lastofs`, `CL_ClearLightStyles`, `CL_RunLightStyles`, `CL_SetLightstyle`, `CL_AddLightStyles`; variables locales generees `ofs`, `i`, `s` marquees non applicables.
- Tests de reference lances:
  - `npm run verify:cl-fx`
  - `npm run verify:particle-sync`
  - `npx tsx ./scripts/verify/quake2-full-game-three-renderer.ts`
  - `npm run verify:local-gameplay-sync`
  - `npm run typecheck`
- Decisions:
  - `CL_LogoutEffect` et `CL_ItemRespawnParticles` restent proprietaires de `packages/client/src/cl_fx.ts`.
  - `appendLogoutEffect` est un adapter de `CL_ParseMuzzleFlash`, pas un second port proprietaire de `CL_LogoutEffect`; son en-tete a ete corrige en `Category: Adapter`.
  - `CL_ItemRespawnParticles` doit etre applique depuis `apps/web` pour `EV_ITEM_RESPAWN`, car l'evenement produit des particules visibles consommees ensuite par `ClientRefreshFrame.particles` puis `packages/renderer-three/src/particle-sync.ts`.
  - `renderer-three` est integre indirectement via `CL_AddParticles` -> `ClientRefreshFrame.particles` -> `createThreeParticleSync`; aucun branchement renderer specifique supplementaire n'est requis pour ce lot.
  - Les lightstyles sont visuels: la source C appelle `CL_SetLightstyle` depuis les configstrings, avance les styles par `cl.time / 100`, puis appelle `V_AddLightStyle`. Le port TS conserve ce flux via `CL_ParseConfigString`/`syncLocalGameplayFrame` -> `CL_SetLightstyle` -> `CL_BuildRefreshFrame` -> `ClientRefreshFrame.lightStyles` -> `V_AddLightStyle`/`gl-world-scene-adapter` -> `gl_rsurf` lightmap styles.
- Blocages: aucun.
- Prochain lot recommande: `cl_dlights`, `CL_ClearDlights`, `CL_AllocDlight`, `CL_NewDlight`, `CL_RunDLights`, `CL_AddDLights` si le lot reste raisonnable; reduire a clear/alloc si besoin.
