# Progress - ref_gl/gl_rsurf.c

## Session 2026-05-06

Lot traite:
- Constantes lightmap: `DYNAMIC_LIGHT_WIDTH`, `DYNAMIC_LIGHT_HEIGHT`, `LIGHTMAP_BYTES`, `BLOCK_WIDTH`, `BLOCK_HEIGHT`, `MAX_LIGHTMAPS`, `GL_LIGHTMAP_FORMAT`.
- Etat lightmap: `gl_lms`, `current_lightmap_texture`, `internal_format`.
- Fonctions lightmap/surface BSP initiales: `LM_InitBlock`, `LM_AllocBlock`, `LM_UploadBlock`, `GL_CreateSurfaceLightmap`, `GL_BeginBuildingLightmaps`, `GL_EndBuildingLightmaps`, `GL_BuildPolygonFromSurface`.
- Faux positif limite au lot: ligne `typedef internal_format` marquee `Non applicable` car il s'agit du champ `internal_format` de `gllightmapstate_t`, pas d'un typedef proprietaire.

Preuves obtenues:
- Source C relue dans `Quake-2-master/ref_gl/gl_rsurf.c`.
- Cible TS relue dans `packages/renderer-three/src/gl_rsurf.ts`.
- En-tetes des fonctions portees du lot verifies: `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior` presents.
- Runtime verifie: `createGlRsurfModelHooks` branche `GL_BeginBuildingLightmaps`, `GL_CreateSurfaceLightmap`, `GL_BuildPolygonFromSurface`, `GL_EndBuildingLightmaps` dans le chargement BSP via `gl-world-scene-adapter.ts`.
- `apps/web` verifie: `full-game-render-loop.ts` appelle `glWorldAdapter.update`, qui declenche `R_MarkLeaves`/`R_DrawWorld` et consomme les surfaces BSP chargees.
- `packages/renderer-three` verifie: `gl-world-scene-adapter.ts` consomme les polygones, UVs, lightmaps statiques/dynamiques et textures RGBA produites par le port.
- Correction appliquee: ajout de `GL_LIGHTMAP_FORMAT` dans `packages/renderer-three/src/gl_rsurf.ts`, export dans `packages/renderer-three/src/index.ts`, assertion dans `scripts/verify/quake2-gl-rsurf.ts`.

Tests lances:
- `npm run verify:gl-rsurf` -> OK.
- `npm run verify:three-world-alpha` -> OK (`maps/base1.bsp`).
- `npm run typecheck` -> OK.

Decision:
- Lot valide, sauf le faux positif `typedef internal_format` justifie en `Non applicable`.
- Aucun manque runtime, `apps/web` ou `renderer-three` ouvert pour ce lot.

Prochain lot recommande:
- Fonctions de dessin polygonal et chaines de texture: `DrawGLPoly`, `DrawGLFlowingPoly`, `DrawGLPolyChain`, `DrawTextureChains`, `R_RenderBrushPoly`, puis `R_BlendLightmaps` si le lot reste coherent.
