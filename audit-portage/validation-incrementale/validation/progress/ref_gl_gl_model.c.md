# Progress - Quake-2-master/ref_gl/gl_model.c

## Etat

- Statut: `Termine`
- Dernier lot valide: fichier complet `gl_model.c` cote ownership reel.
- Entites validees: 38.
- Entites non applicables: 14.

## Lot traite

Validation complete du port `packages/renderer-three/src/gl-model-loader.ts` pour:

- runtime model registry: `Mod_Init`, `Mod_ForName`, `Mod_Modellist_f`, `Mod_Free`, `Mod_FreeAll`, globals portes dans `GlModelRuntime`;
- helpers vis/BSP: `Mod_PointInLeaf`, `Mod_DecompressVis`, `Mod_ClusterPVS`, `RadiusFromBounds`;
- loaders BSP: lighting, visibility, vertexes, submodels, edges, texinfo, surface extents, faces, parents/nodes/leafs, marksurfaces, surfedges, planes, brush model;
- loaders alias/sprite: `Mod_LoadAliasModel`, `Mod_LoadSpriteModel`;
- registration ref_gl: `R_BeginRegistration`, `R_RegisterModel`, `R_EndRegistration`.

## Decisions

- `model_s` appartient a `ref_gl/gl_model.h` / `packages/renderer-three/src/gl-model.ts`; il reste hors ownership de cette matrice.
- Les lignes `bits`, `c`, `corner`, `count`, `d`, `i`, `next`, `node`, `row`, `ti`, `total`, `v`, `version` sont des variables locales C detectees comme globals par la matrice initiale.
- Le nom TS proprietaire reste `gl-model-loader.ts` malgre le statut automatique `wrong-name`: c'est le module de loader runtime deja reference par l'index renderer et les tests `gl-model:phase*`.
- Correction de branchement faite dans `ref-gl-host.ts`: `BeginRegistration`, `RegisterModel`, `EndRegistration`, `modellist`, `Mod_Init` et `Mod_FreeAll` passent maintenant par le runtime `gl_model.c` porte par defaut.

## Tests de reference

- `npm run verify:gl-model:phase1`
- `npm run verify:gl-model:phase2`
- `npm run verify:gl-model:phase3`
- `npm run verify:gl-model:phase4`
- `npm run verify:gl-model:phase5`
- `npm run verify:gl-model:phase6`
- `npm run verify:gl-model:phase7`
- `npm run verify:gl-model:phase8`
- `npm run verify:gl-model:phase9`
- `npm run verify:ref-gl-host`
- `npm run verify:gl-rsurf`
- `npm run verify:three-world-alpha`
- `npm run verify:three-world-warp-sky`
- `npm run verify:gl-model:header`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

Aucun lot restant dans `ref_gl/gl_model.c`; reprendre une autre matrice proprietaire ref_gl encore ouverte, par exemple `ref_gl/gl_mesh.c`, `ref_gl/gl_rmain.c`, `ref_gl/gl_rsurf.c` ou `ref_gl/gl_warp.c`.
