# Progress TS - packages/renderer-three/src/gl_rsurf.ts

## Etat courant

- Statut: Termine
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_renderer-three_src_gl_rsurf.ts.md`
- Fichier TS: `packages/renderer-three/src/gl_rsurf.ts`
- Dernier lot valide: fichier complet, jusqu'aux helpers prives `getImageSize` a `setImageTextureChain`.
- Prochain lot recommande: aucun.

## Session 2026-05-27 - gros lot surface/lightmap

- Lot traite: 64 symboles.
- Verdict: 30 `Couvert C/H`, 34 `Valide`, 13 restants.
- Preuves C/H: `ref_gl_gl_rsurf.c.md` pour les macros/fonctions proprietaires; `ref_gl_gl_local.h.md` pour `BACKFACE_EPSILON`.
- Decisions importantes:
  - `R_TextureAnimation` est present dans `Quake-2-master/ref_gl/gl_rsurf.c`, mais absent de la matrice C/H generee; statut TS `Valide`, pas `Couvert C/H`.
  - `GL_LIGHTMAP_FORMAT` et les helpers `DrawGLWaterPoly`, `DrawGLWaterPolyLightmap`, `DrawGLPoly`, `DrawGLFlowingPoly` ont ete ajoutes a la matrice TS car ils sont presents dans le fichier TS et couverts par la matrice C/H.
  - Les helpers `Category: New` du lot ont maintenant `Original name: N/A` et `Source: N/A (<raison courte>)` dans les en-tetes et la matrice.

## Session 2026-05-27 - helpers prives finaux

- Lot traite: 13 helpers prives de `getImageSize` a `setImageTextureChain`.
- Verdict: 13 `Valide`, 0 restant.
- Preuves:
  - `getImageSize`, `readNumericProperty`, `readNestedQuakeDimension` et `isMNode` sont des helpers TS locaux avec `Original name: N/A`, `Source: N/A (<raison courte>)`, `Category: New`.
  - `dotTexAxis`, `queueSurfaceLightmap`, `evaluateDynamicLightmapState`, `computeFlowingScroll`, `resolveLightmapInternalFormat`, `resolveSurfaceAlpha`, `getImageRegistrationSequence`, `getImageTextureChain` et `setImageTextureChain` sont des adapters/extractions de blocs `ref_gl/gl_rsurf.c` deja rattaches aux fonctions proprietaires validees; ils ne sont pas marques `Couvert C/H` pour ne pas masquer l'ownership des fonctions sources.
- Integration: helpers prives consommes uniquement par les chemins renderer-three de `GL_BuildPolygonFromSurface`, `R_RenderBrushPoly`, `GL_RenderLightmappedPoly`, `DrawTextureChains`, `R_DrawAlphaSurfaces` et les setters de texture chain; pas d'integration apps/web distincte attendue.
- Tests: `npm run verify:gl-rsurf`, `npm run verify:gl-local:header`, `npm run verify:ref-gl-host`, `npm run typecheck`, `git diff --check`.

## Tests de reference

- `npm run verify:gl-rsurf`
- `npm run verify:gl-local:header`
- `npm run verify:ref-gl-host`
- `npm run typecheck`
- `git diff --check`
