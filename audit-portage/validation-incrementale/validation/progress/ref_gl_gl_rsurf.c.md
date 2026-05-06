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

## Session 2026-05-06 - lot dessin polygonal / texture chains

Lot traite:
- Fonctions de dessin et chaines: `DrawGLPoly`, `DrawGLFlowingPoly`, `DrawGLPolyChain`, `DrawGLWaterPoly`, `DrawGLWaterPolyLightmap`, `DrawTextureChains`, `GL_RenderLightmappedPoly`, `R_RenderBrushPoly`, `R_BlendLightmaps`, `R_DrawAlphaSurfaces`, `R_DrawTriangleOutlines`.
- Etats/counters associes: `c_visible_lightmaps`, `c_visible_textures`.
- Faux positifs locaux associes au lot marques `Non applicable`: `dynamic`, `i`, `j`, `intens`, `is_dynamic`, `lmtex`, `map`, `maps`, `scroll`, `temp`.

Preuves obtenues:
- Source C relue dans `Quake-2-master/ref_gl/gl_rsurf.c`.
- Cible TS relue dans `packages/renderer-three/src/gl_rsurf.ts`.
- En-tetes des fonctions portees verifies ou ajoutes: `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior` presents.
- Corrections appliquees:
  - Ajout des fonctions portees nommees `DrawGLPoly`, `DrawGLFlowingPoly`, `DrawGLWaterPoly`, `DrawGLWaterPolyLightmap` dans `packages/renderer-three/src/gl_rsurf.ts` et export dans `packages/renderer-three/src/index.ts`.
  - `R_RenderBrushPoly` appelle maintenant ces points d'entree nommes au lieu de hooks anonymes.
  - Correction de l'ordre multitexture dans `DrawTextureChains`: premier passage non-turbulent avant suspension, suspension uniquement pour le passage turbulent, puis reprise.
  - Assertions ajoutees dans `scripts/verify/quake2-gl-rsurf.ts`.
- Runtime verifie: `R_DrawWorld` appelle `DrawTextureChains` puis `R_BlendLightmaps`; `R_DrawInlineBModel`/`R_RenderBrushPoly` couvrent les surfaces inline, dynamiques, flowing et water.
- `apps/web` verifie: le flux full-game appelle `glWorldAdapter.update`, qui execute `R_MarkLeaves`, `R_DrawWorld`, `R_DrawAlphaSurfaces` et consomme les brush models si presents.
- `packages/renderer-three` verifie: `gl-world-scene-adapter.ts` consomme surfaces visibles, alpha, textures animees/flowing, lightmaps statiques et dynamiques via les hooks `renderBrushPoly`, `renderFlowingPoly`, `renderWaterPoly`, `renderAlphaSurface`, `renderLightmappedPolyChain`, `renderLightmapChainSurface`.

Tests lances:
- `npm run verify:gl-rsurf` -> OK.
- `npm run verify:three-world-alpha` -> OK (`maps/base1.bsp`).
- `npm run verify:full-game:three-renderer` -> OK.
- `npm run typecheck` -> OK.

Decision:
- Lot valide.
- Aucun manque runtime, `apps/web` ou `renderer-three` ouvert pour ce lot.

Prochain lot recommande:
- Bloc brush/world traversal: `R_DrawInlineBModel`, `R_DrawBrushModel`, `R_RecursiveWorldNode`, `R_DrawWorld`, `R_MarkLeaves`, avec les etats `modelorg`, `rotated`, `dot`, `ent`, `cluster`, `c` et verification explicite camera/areabits/scene.

## Session 2026-05-06 - lot brush/world traversal

Lot traite:
- Fonctions brush/world traversal: `R_DrawInlineBModel`, `R_DrawBrushModel`, `R_RecursiveWorldNode`, `R_DrawWorld`, `R_MarkLeaves`.
- Etat associe: `modelorg`.
- Faux positifs locaux restants marques `Non applicable`: `c`, `cluster`, `dot`, `ent`, `height`, `rotated`, `texture`, `total`, `vertpage`.

Preuves obtenues:
- Source C relue dans `Quake-2-master/ref_gl/gl_rsurf.c`.
- Cible TS relue dans `packages/renderer-three/src/gl_rsurf.ts`.
- En-tetes des fonctions portees verifies: `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior` presents.
- Assertions ajoutees dans `scripts/verify/quake2-gl-rsurf.ts` pour le culling/backface inline, l'appel de marquage dynamic lights, le calcul `modelorg` avec rotation, les bornes de brush model, le routage sky/alpha/texture chain dans `R_RecursiveWorldNode`, les sorties `R_DrawWorld`, le court-circuit `RDF_NOWORLDMODEL` et `R_MarkLeaves`/`novis`.
- Runtime verifie: le flux normal appelle `R_MarkLeaves`, `R_DrawWorld`, `R_DrawAlphaSurfaces`, et les brush models via `R_DrawBrushModel`.
- `apps/web` verifie: `full-game-render-loop.ts` appelle `glWorldAdapter.update`; `full-game-render-source.ts` fournit les inline brush model snapshots depuis les packet entities.
- `packages/renderer-three` verifie: `gl-world-scene-adapter.ts` consomme camera/refdef/areabits, surfaces visibles, sky surfaces, alpha surfaces, lightmaps et inline brush models.

Tests lances:
- `npm run verify:gl-rsurf` -> OK.
- `npm run verify:three-world-alpha` -> OK.
- `npm run verify:full-game:three-renderer` -> OK.
- `npm run typecheck` -> OK.

Decision:
- Fichier termine: toutes les lignes de `ref_gl_gl_rsurf.c.md` sont `Valide` ou `Non applicable`.
- Aucun manque runtime, `apps/web` ou `renderer-three` ouvert pour ce fichier.

Prochain lot recommande:
- Aucun pour `ref_gl/gl_rsurf.c`; reprendre le prochain fichier prioritaire dans `AVANCEMENT_GLOBAL.md`.
