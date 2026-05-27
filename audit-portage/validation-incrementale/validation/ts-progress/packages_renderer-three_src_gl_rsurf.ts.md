# Progress TS - packages/renderer-three/src/gl_rsurf.ts

## Etat courant

- Statut: En cours
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_renderer-three_src_gl_rsurf.ts.md`
- Fichier TS: `packages/renderer-three/src/gl_rsurf.ts`
- Dernier lot valide: constantes lightmap/surface, interfaces runtime, bloc surface/lightmap proprietaire jusqu'a `GL_BuildPolygonFromSurface`, puis setters et bridges exportes jusqu'a `createGlRsurfModelHooks`.
- Prochain lot recommande: traiter les helpers prives restants de `getImageSize` a `setImageTextureChain`.

## Session 2026-05-27 - gros lot surface/lightmap

- Lot traite: 64 symboles.
- Verdict: 30 `Couvert C/H`, 34 `Valide`, 13 restants.
- Preuves C/H: `ref_gl_gl_rsurf.c.md` pour les macros/fonctions proprietaires; `ref_gl_gl_local.h.md` pour `BACKFACE_EPSILON`.
- Decisions importantes:
  - `R_TextureAnimation` est present dans `Quake-2-master/ref_gl/gl_rsurf.c`, mais absent de la matrice C/H generee; statut TS `Valide`, pas `Couvert C/H`.
  - `GL_LIGHTMAP_FORMAT` et les helpers `DrawGLWaterPoly`, `DrawGLWaterPolyLightmap`, `DrawGLPoly`, `DrawGLFlowingPoly` ont ete ajoutes a la matrice TS car ils sont presents dans le fichier TS et couverts par la matrice C/H.
  - Les helpers `Category: New` du lot ont maintenant `Original name: N/A` et `Source: N/A (<raison courte>)` dans les en-tetes et la matrice.

## Tests de reference

- `npm run verify:gl-rsurf`
- `npm run verify:gl-local:header`
- `npm run verify:ref-gl-host`
- `npm run typecheck`
- `git diff --check`
