# Progress - Quake-2-master/qcommon/cmodel.c

## Session 2026-05-06

- Lot traite: debut du fichier jusqu'aux helpers de chargement et accessors simples: structs `cnode_t`, `cbrushside_t`, `cleaf_t`, `cbrush_t`, `carea_t`, etat global de carte, `CM_InitBoxHull`, `FloodAreaConnections`, `CMod_Load*`, `CM_LoadMap`, `CM_InlineModel`, `CM_NumClusters`, `CM_NumInlineModels`, `CM_EntityString`, `CM_LeafContents`, `CM_LeafCluster`, `CM_LeafArea`.
- Corrections: ajout des commentaires d'en-tete/renommage `Original name` pour les interfaces `Collision*`; ajout d'une note d'adapter sur `createCollisionWorld`; ajout de l'en-tete ported pour `CM_InlineModel`.
- Validation C vs TS: les loaders C `CMod_Load*` sont remplaces par `parseBsp` + `createCollisionWorld`; les champs et tableaux C sont portes dans `CollisionWorld` / `CollisionModelRuntime`.
- Runtime: branche depuis `SV_InitGame`/`SV_SpawnServer` via `CM_LoadMap`, puis `SV_BuildClientFrame`, `SV_FatPVS`, game runtime, client prediction et view via les accessors collision.
- apps/web: le host full-game fournit le `collisionWorld`; `full-game.ts` consomme `CM_InlineModel` pour `CL_PrepRefresh` et `createClientPredictionCollisionSource` pour prediction locale.
- renderer-three: les sorties visibles attendues de ce lot sont indirectes: inline brush models, PVS/PHS et `areabits`. Elles sont consommees via le client/refdef et `gl-world-scene-adapter`/`gl_rsurf`.
- Tests lances:
  - `npx tsx ./scripts/verify/quake2-cmodel.ts` passe avec `Quake 2/baseq2/pak0.pak` et `maps/base1.bsp`.
  - `npm run typecheck` a d'abord echoue hors lot pendant les runs concurrents sur `packages/qcommon/src/cmd.ts:611`, puis repasse OK au controle central apres consolidation.
- Matrice: 65 `Valide`, 35 `Non applicable`, 95 `A verifier`.

## Session 2026-05-06 - bloc collision/leaf

- Lot traite: `box_headnode`, `box_leaf`, second bloc `CM_InitBoxHull`, `CM_HeadnodeForBox`, `CM_PointLeafnum_r`, `CM_PointLeafnum`, `CM_BoxLeafnums_r`, `CM_BoxLeafnums_headnode`, `CM_BoxLeafnums`, et faux positifs locaux associes (`i`, `side`, `c`, `d`, `node`, `num`, `leaf_list`, `leaf_topnode`, `s`).
- Corrections: en-tete de `CM_BoxLeafnums_r` corrige en `Category: Ported` avec `Original name`/`Source`; harness `quake2-cmodel.ts` renforce avec une preuve directe `CM_BoxLeafnums_headnode` sur le box hull synthetique et `world.box_leaf`.
- Validation C vs TS: `CM_InitBoxHull` remplace les file-static C `box_headnode`/`box_leaf` par `CollisionWorld.box_headnode`/`CollisionWorld.box_leaf`; les plans, children et brush/leaf synthetiques suivent la structure C. `CM_HeadnodeForBox` met a jour les 12 distances de plans dans le meme ordre. `CM_PointLeafnum_r` et les fonctions `CM_BoxLeafnums*` conservent le parcours BSP, les leafs negatifs et `topnode`; les globals temporaires C `leaf_list`/`leaf_topnode` sont remplaces par parametres explicites.
- Runtime: branche via `SV_LinkEdict`/`SV_AreaEdicts`, `SV_BuildClientFrame`, `SV_FatPVS`, `SV_PointContents`, game imports (`pointcontents`, `inPVS`, `inPHS`) et prediction client (`CM_HeadnodeForBox`, traces BModels/AABB).
- apps/web: le full-game host fournit `collisionWorld`; `apps/web/src/full-game.ts` consomme ce flux via le runtime serveur, `CM_InlineModel` et `createClientPredictionCollisionSource`, sans logique collision parallele masquant le runtime.
- renderer-three: pas d'appel direct attendu a ces helpers; leurs sorties visibles sont les leafs/clusters/areabits/PVS produits cote serveur/client et consommes par `gl_rsurf`/`gl-world-scene-adapter` pour filtrer la scene.
- Tests lances:
  - `npx tsx ./scripts/verify/quake2-cmodel.ts` passe avec `Quake 2/baseq2/pak0.pak` et `maps/base1.bsp`.
  - `npm run typecheck` passe.
  - `npm run verify:cl-pred` passe.
  - `npm run verify:full-game:server-host` passe.
  - `npm run verify:full-game:three-renderer` passe.
  - `npm run verify:server:world` passe.
  - `npm run verify:server:ents` passe.
  - Tentatives de scripts inexistants: `verify:sv-world`, `verify:sv-ents`, `verify:server:entities`; remplacees par les noms ci-dessus.
- Matrice: 76 `Valide`, 46 `Non applicable`, 73 `A verifier`.

## Prochain lot recommande

Reprendre a `CM_PointContents`, `CM_TransformedPointContents`, puis `DIST_EPSILON`, `CM_ClipBoxToBrush` et l'etat de trace associe si le lot reste coherent.
