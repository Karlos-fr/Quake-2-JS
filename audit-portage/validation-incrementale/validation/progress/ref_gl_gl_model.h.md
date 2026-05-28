# Progress - Quake-2-master/ref_gl/gl_model.h

## Etat courant

- Statut: Termine
- Dernier lot valide: gros bloc header complet `gl_model.h`: constantes `SIDE_*`, flags `SURF_*`, `VERTEXSIZE`, `modtype_t`, champs de structures et structures renderer `mvertex_t`, `mmodel_t`, `medge_t`, `mtexinfo_t`, `glpoly_t`, `msurface_t`, `mnode_t`, `mleaf_t`, `model_t`.
- Prototypes de fonctions du header: marques `Non applicable` dans cette matrice quand l'ownership appartient a `ref_gl/gl_model.c`, ou quand il s'agit de l'allocator C legacy `Hunk_*` abstrait par les allocations JS/TS.

## Integration verifiee

- Runtime ref_gl: types consommes par `gl_model.ts`, `gl_rsurf.ts`, `gl_light.ts`, `gl_warp.ts`, `gl_rmain.ts`.
- apps/web: flux full-game Three renderer charge le BSP via le runtime ref_gl, sans logique parallele masquant le chargement de modeles.
- renderer-three: consommation visible des modeles brush/sprite/alias, surfaces BSP, frames/skins, lightmaps, areabits et scene via `gl-world-scene-adapter.ts`.

## Tests de reference

- `npm run verify:gl-model:header`
- `npm run verify:gl-model:phase4`
- `npm run verify:gl-model:phase5`
- `npm run verify:gl-model:phase8`
- `npm run verify:gl-model:phase9`
- `npm run verify:gl-rsurf`
- `npm run verify:three-world-alpha`
- `npm run verify:three-world-warp-sky`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Session 2026-05-28 - redecoupage lot 4

- Checklist TS appliquee au rattachement strict de `ref_gl/gl_model.h`: entete, `Original name`, `Source declaree`, `Category`, `Export`, ownership et doublons compares pour `packages/renderer-three/src/gl_model.ts`.
- `gl_model.ts` porte le header et le runtime `gl_model.c`; les prototypes du header qui appartiennent a l'implementation restent `Non applicable` dans cette matrice.
- Matrice mise a jour: cible proprietaire `packages/renderer-three/src/gl_model.ts`, statut automatique `matched`, verdict Phase 03 `strict-ok`.

## Prochain lot recommande

- Aucun lot restant dans `ref_gl/gl_model.h.md`: toutes les lignes sont `Valide` ou `Non applicable`.
- Reprendre la matrice proprietaire `ref_gl/gl_model.c` pour les implementations `Mod_*`, `R_*`, `CalcSurfaceExtents`, loaders BSP/sprite/alias et variables runtime.

## Blocages

- Aucun.
