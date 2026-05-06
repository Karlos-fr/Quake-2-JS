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

## Session 2026-05-06 - bloc contents/trace

- Lot traite: `CM_PointContents`, `CM_TransformedPointContents`, `DIST_EPSILON`, et bloc trace complet jusqu'a `CM_TransformedBoxTrace`: `CM_ClipBoxToBrush`, `CM_TestBoxInBrush`, `CM_TraceToLeaf`, `CM_TestInLeaf`, `CM_RecursiveHullCheck`, `CM_BoxTrace`, plus les faux positifs locaux et etats file-static C associes (`l`, `p_l`, `temp`, `trace_trace`, `trace_contents`, `trace_ispoint`, `dist`, `ofs`, `f`, `d1`, `k`, `brushnum`, `leaf`, `node`, `idist`, `i`, `mid`, `side`, `midf`, `offset`, `leafs`, `topnode`, `trace`, `a`, `rotated`).
- Corrections: commentaire `CM_BoxTrace` corrige pour ne plus indiquer que les traces transformees/rotatives ne sont pas portees; harness `quake2-cmodel.ts` renforce avec preuves directes pour contents transformes, `DIST_EPSILON`, trace point, trace AABB avec expansion mins/maxs, contents de brush et position test `startsolid/allsolid`.
- Validation C vs TS: les file-static C `trace_trace`, `trace_contents` et `trace_ispoint` sont remplaces par `TraceWork` et un `trace_t` par appel; `checkcount`/`brush->checkcount` est remplace par `checkedBrushes`. `CM_TestInLeaf` est porte comme adapter explicite `CM_TestInLeafs` pour eviter les globals temporaires tout en conservant la collecte leafs puis tests brushs.
- Runtime: branche via `SV_PointContents`, `SV_Trace`, game imports `pointcontents`/`trace`, client view/prediction et adapters PMove; les traces world et bmodels atteignent `CM_BoxTrace`/`CM_TransformedBoxTrace`.
- apps/web: le full-game host web utilise le runtime serveur/client porte; pas de logique collision parallele attendue ni observee pour masquer ces fonctions.
- renderer-three: pas d'appel direct attendu; les sorties visibles dependantes de ce lot sont camera/prediction, collision avec brush models et areabits/PVS produits en amont, consommes via le flux client/refdef et verifies par le test three.
- Tests lances:
  - `npx tsx ./scripts/verify/quake2-cmodel.ts` passe avec `Quake 2/baseq2/pak0.pak` et `maps/base1.bsp`.
  - `npx tsx ./scripts/verify/quake2-collision-phase1.ts` passe avec `maps/base2.bsp`.
  - `npm run verify:cl-pred` passe.
  - `npm run verify:server:world` passe.
  - `npm run verify:server:ents` passe.
  - `npm run verify:full-game:server-host` passe.
  - `npm run verify:full-game:three-renderer` passe.
  - `npm run typecheck` passe.
- Matrice: 86 `Valide`, 82 `Non applicable`, 27 `A verifier`.

## Session 2026-05-06 - bloc vis/PVS/PHS

- Lot traite: `CM_DecompressVis`, `CM_ClusterPVS`, `CM_ClusterPHS`, doublons de detection `CM_DecompressVis`, et faux positifs locaux/statics associes (`c`, `out_p`, `row`, `pvsrow`, `phsrow`).
- Corrections: `getClusterVis` corrige pour conserver le comportement C sans lump VIS: les clusters valides retournent une ligne tout-visible via `CM_DecompressVis`, tandis que `cluster == -1` reste une ligne zero. Commentaires `CM_ClusterPVS`/`CM_ClusterPHS` completes pour documenter le remplacement des buffers statiques C par des `Uint8Array` par appel; metadonnees `Category: New` completees sur les helpers locaux.
- Validation C vs TS: `CM_DecompressVis` conserve la taille `(numclusters + 7) >> 3`, les literals RLE, les runs zero bornes a la ligne, et le fallback `0xff` quand les donnees VIS sont absentes. `CM_ClusterPVS`/`CM_ClusterPHS` conservent le choix PVS/PHS et le cas `cluster == -1`; ecart volontaire: pas de `pvsrow`/`phsrow` file-static partage, la ligne est retournee comme buffer neuf pour eviter un etat global mutable.
- Runtime: branche depuis `SV_FatPVS`/`SV_BuildClientFrame`, `SV_Multicast`, `SV_StartSound`, imports game `inPVS`/`inPHS`, et `g_ai` PHS; les flux serveur normaux atteignent `CM_ClusterPVS`/`CM_ClusterPHS`.
- apps/web: le host full-game web utilise le runtime serveur/client porte; pas de logique PVS/PHS parallele dans `apps/web` qui masquerait ce lot. Flux valide par `verify:full-game:server-host`.
- renderer-three: pas de consommation directe attendue de `CM_ClusterPVS`/`CM_ClusterPHS` cote qcommon; les sorties visibles serveur sont les snapshots/temp entities/sounds filtres par PVS/PHS, puis consommes par le client et `renderer-three`. Le renderer a son propre port `Mod_ClusterPVS` pour le marquage BSP visible (`R_MarkLeaves`), verifie separement par le test three.
- Tests lances:
  - `npx tsx ./scripts/verify/quake2-cmodel.ts` passe avec preuves directes RLE/no-vis/PVS/PHS.
  - `npm run typecheck` passe.
  - `npm run verify:server:ents` passe.
  - `npm run verify:server:world` passe.
  - `npm run verify:cl-pred` passe.
  - `npm run verify:full-game:server-host` passe.
  - `npm run verify:full-game:three-renderer` passe.
  - `npx tsx ./scripts/verify/quake2-sv-send.ts` passe.
- Matrice: 91 `Valide`, 87 `Non applicable`, 17 `A verifier`.

## Session 2026-05-06 - bloc areaportals/areabits

- Lot traite: `FloodArea_r`, second `FloodAreaConnections`, `CM_SetAreaPortalState`, `CM_AreasConnected`, `CM_WriteAreaBits`, et faux positifs locaux associes (`i`, `floodnum`, `bytes`).
- Corrections: aucune correction de `packages/qcommon/src/cmodel.ts` necessaire. Harness `quake2-cmodel.ts` renforce avec un monde synthetique a 4 areas et 1 portail logique pour prouver portail ferme/ouvert, reflood, area 0, `map_noareas`, et restauration `portalopen`.
- Validation C vs TS: `FloodArea_r` conserve la detection reflood, les `floodnum`/`floodvalid` mutables et la recursion via `portalopen[portalnum]`; `FloodAreaConnections` invalide les floods puis saute area 0; `CM_SetAreaPortalState` met a jour le portail et reflood; `CM_AreasConnected` respecte `map_noareas`; `CM_WriteAreaBits` ecrit les bits par flood, force tout visible pour area 0 et pour `map_noareas`.
- Runtime: branche via `SV_BuildClientFrame`/`SV_WriteFrameToClient`, filtres `SV_AreasConnected`, `SV_Multicast`/`SV_StartSound`, game imports `SetAreaPortalState`/`AreasConnected`, portes et triggers areaportal (`door_use_areaportals`, `func_areaportal`).
- apps/web: le host full-game web consomme le runtime serveur/client porte; les `areabits` passent par snapshots et parsing client, sans logique web parallele masquant le runtime.
- renderer-three: sortie visible attendue bien consommee: `CM_WriteAreaBits` alimente `frame.areabits`, le client la copie dans `refdef.areabits`, puis `renderer-three` filtre les surfaces par `leaf.area` dans `gl_rsurf`.
- Tests lances:
  - `npx tsx ./scripts/verify/quake2-cmodel.ts` passe avec preuves synthetiques areaportals/areabits.
  - `npm run typecheck` passe.
  - `npm run verify:server:ents` passe.
  - `npm run verify:server:world` passe.
  - `npm run verify:full-game:server-host` passe.
  - `npm run verify:full-game:three-renderer` passe.
  - `npx tsx ./scripts/verify/quake2-sv-send.ts` passe.
- Matrice: 96 `Valide`, 93 `Non applicable`, 6 `A verifier`.

## Session 2026-05-06 - bloc sauvegarde portails/headnode visible

- Lot traite: `CM_WritePortalState`, `CM_ReadPortalState`, `CM_HeadnodeVisible`, doublon de detection `CM_HeadnodeVisible`, et faux positifs locaux associes (`leafnum`, `cluster`).
- Corrections: aucune correction fonctionnelle de `packages/qcommon/src/cmodel.ts` necessaire. Harness `quake2-cmodel.ts` renforce avec un monde synthetique pour prouver recursion de headnode, leaf visible, leaf invisible, cluster `-1`, plus restauration de portail depuis qboolean non canonique non nul et rejet de bytes tronques.
- Validation C vs TS: `CM_WritePortalState` conserve la disposition savegame `portalopen` de 1024 `qboolean` int32 little-endian; `CM_ReadPortalState` restaure tous les qboolean et relance `FloodAreaConnections`; `CM_HeadnodeVisible` conserve la recursion BSP, la conversion leaf negative `-1 - nodenum`, l'ignorance des clusters `-1` et le test de bit PVS.
- Runtime: branche via sauvegarde/chargement serveur (`sv_ccmds`), host web full-game, culling serveur `SV_BuildClientFrame`/`SV_WriteFrameToClient` et envoi de snapshots.
- apps/web: `apps/web/src/full-game-server-host.ts` sauvegarde/restaure explicitement l'etat portail via `CM_WritePortalState`/`CM_ReadPortalState`; pas de logique web parallele masquant ce lot.
- renderer-three: pas d'appel direct a `CM_HeadnodeVisible` attendu cote renderer; la sortie visible est le filtrage serveur des entites/snapshots, puis `areabits`/entites sont consommes par le client et `renderer-three`. Le flux renderer full-game passe.
- Tests lances:
  - `npx tsx ./scripts/verify/quake2-cmodel.ts` passe avec preuves save/read portal state et headnode visible.
  - `npm run typecheck` passe.
  - `npm run verify:server:ents` passe.
  - `npm run verify:server:world` passe.
  - `npm run verify:full-game:server-host` passe.
  - `npm run verify:full-game:three-renderer` passe.
  - `npx tsx ./scripts/verify/quake2-sv-send.ts` passe.
- Matrice: 100 `Valide`, 95 `Non applicable`, 0 `A verifier`.

## Prochain lot recommande

Aucun lot restant dans `qcommon_cmodel.c.md`: toutes les lignes sont `Valide` ou `Non applicable`. Laisser le coordinateur centraliser `AVANCEMENT_GLOBAL.md`.
