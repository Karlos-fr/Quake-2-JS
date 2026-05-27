# Progress TS croise - packages/renderer-three/src/gl_rmain.ts

## Etat courant

- Statut: Termine
- Symboles TS: 63
- Couvert C/H: 30
- Valide TS: 33
- Partiel: 0
- Reste a auditer: 0

## Session 2026-05-27 - gros lot render main initial

Lot traite: 49 symboles, de `NUM_BEAM_SEGS` a `GetRefAPI`.

Preuves et decisions:
- `ref_gl_gl_rmain.c.md` marque les proprietaires `NUM_BEAM_SEGS`, `SignbitsForPlane`, `R_CullBox`, `R_RotateForEntity`, `R_SetFrustum`, `R_SetupFrame`, `MYgluPerspective`, `R_SetupGL`, `R_Clear`, `R_SetGL2D`, `GL_DrawColoredStereoLinePair`, `GL_DrawStereoPattern`, `R_PolyBlend`, `R_Flash`, `R_DrawBeam`, `R_SetPalette`, `R_DrawSpriteModel`, `R_DrawNullModel`, `GL_DrawParticles`, `R_DrawParticles`, `R_DrawEntitiesOnList`, `R_RenderView`, `R_RenderFrame`, `R_BeginFrame`, `R_SetLightLevel`, `R_Register`, `R_Init`, `R_SetMode`, `R_Shutdown` et `GetRefAPI` comme `Valide` avec cible `packages/renderer-three/src/gl_rmain.ts`; ces lignes TS sont donc `Couvert C/H`.
- Les DTO, hooks, runtime explicite, binders et constantes de shim sans entite C proprietaire sont `Category: New`, avec `Original name: N/A` et `Source declaree: N/A (<raison courte>)` dans le code et la matrice.
- `V_AddBlend` reste `Partiel`: `ref_gl/gl_local.h` declare le symbole mais aucune definition C n'a ete trouvee dans `Quake-2-master/ref_gl`; le TS conserve le helper sans le masquer sous `Couvert C/H`.

Tests de reference:
- `npm run verify:gl-rmain`
- `npm run verify:ref-gl-host`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

Aucun dans la matrice actuelle.

## Session 2026-05-27 - helpers prives finaux

Lot traite: 15 symboles restants, de `detectRendererFlags` a `failSysError`, plus decision finale `V_AddBlend`.

Preuves et decisions:
- Les helpers de bootstrap `detectRendererFlags`, `applyRendererSpecificDefaults`, `detectBackendExtensions`, `hasExtension` et `reportBootstrapGlError` sont des extractions du flux `R_Init` dans `ref_gl/gl_rmain.c`; ils restent `Adapter` / `Valide`, pas `Couvert C/H`.
- `buildWorldMatrix` est l'adapter TS du bloc modelview de `R_SetupGL`; `rotationMat4`, `translationMat4` et `multiplyMat4` sont des helpers `New` explicites avec `Original name: N/A` et `Source: N/A (renderer matrix helper)`.
- `isBackendProcResolved`, `resetBootstrapRuntimeState`, `cloneRefdef` et `createPlane` sont des helpers `New` de runtime/harness renderer avec metadonnees N/A explicites.
- `failSysError` est l'adapter des appels `ri.Sys_Error` de `gl_rmain.c`, route par hook ou exception de test.
- `V_AddBlend` est tranche `Adapter` / `Valide`: `ref_gl/gl_local.h` declare le symbole et `gl_light.c` ne l'appelle que dans un bloc `#if 0`; aucune definition C `ref_gl` n'a ete trouvee. Il n'est donc pas marque `Couvert C/H`.

Tests de reference:
- `npm run verify:gl-rmain`
- `npm run verify:ref-gl-host`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`
- `git diff --check`
