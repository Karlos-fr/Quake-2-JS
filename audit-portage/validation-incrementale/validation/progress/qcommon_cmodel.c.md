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

## Prochain lot recommande

Reprendre a `box_headnode`, `box_leaf`, le second bloc `CM_InitBoxHull`, puis `CM_HeadnodeForBox`, `CM_PointLeafnum_r`, `CM_PointLeafnum`, `CM_BoxLeafnums_r`, `CM_BoxLeafnums_headnode` et `CM_BoxLeafnums`, avec verification runtime prediction/serveur et consommation renderer si les leafs/areabits changent.
