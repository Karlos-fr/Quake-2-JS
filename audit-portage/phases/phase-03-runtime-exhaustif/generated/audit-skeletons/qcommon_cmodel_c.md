# Inventaire runtime Phase 03 - Quake-2-master/qcommon/cmodel.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/qcommon/src/cmodel.ts
- Cibles TS declarees : packages/qcommon/src/cmodel.ts, packages/qcommon/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| struct | cnode_t | 24 | a-auditer | |
| global | children | 27 | a-auditer | |
| struct | cbrushside_t | 30 | a-auditer | |
| struct | cleaf_t | 36 | a-auditer | |
| global | contents | 38 | a-auditer | |
| global | cluster | 39 | a-auditer | |
| global | area | 40 | a-auditer | |
| global | firstleafbrush | 41 | a-auditer | |
| global | numleafbrushes | 42 | a-auditer | |
| struct | cbrush_t | 45 | a-auditer | |
| global | contents | 47 | a-auditer | |
| global | numsides | 48 | a-auditer | |
| global | firstbrushside | 49 | a-auditer | |
| global | checkcount | 50 | a-auditer | |
| struct | carea_t | 53 | a-auditer | |
| global | numareaportals | 55 | a-auditer | |
| global | firstareaportal | 56 | a-auditer | |
| global | floodnum | 57 | a-auditer | |
| global | floodvalid | 58 | a-auditer | |
| global | checkcount | 61 | a-auditer | |
| global | map_name | 63 | a-auditer | |
| global | numbrushsides | 65 | a-auditer | |
| global | numtexinfo | 68 | a-auditer | |
| global | numplanes | 71 | a-auditer | |
| global | numnodes | 74 | a-auditer | |
| global | map_nodes | 75 | a-auditer | |
| global | numleafs | 77 | a-auditer | |
| global | map_leafs | 78 | a-auditer | |
| global | numleafbrushes | 81 | a-auditer | |
| global | map_leafbrushes | 82 | a-auditer | |
| global | numcmodels | 84 | a-auditer | |
| global | numbrushes | 87 | a-auditer | |
| global | numvisibility | 90 | a-auditer | |
| global | map_visibility | 91 | a-auditer | |
| global | map_vis | 92 | a-auditer | |
| global | numentitychars | 94 | a-auditer | |
| global | map_entitystring | 95 | a-auditer | |
| global | numareas | 97 | a-auditer | |
| global | map_areas | 98 | a-auditer | |
| global | numareaportals | 100 | a-auditer | |
| global | numclusters | 103 | a-auditer | |
| global | floodvalid | 107 | a-auditer | |
| global | portalopen | 109 | a-auditer | |
| global | map_noareas | 112 | a-auditer | |
| function | CM_InitBoxHull | 114 | a-auditer | |
| function | FloodAreaConnections | 115 | a-auditer | |
| global | c_pointcontents | 118 | a-auditer | |
| global | cmod_base | 130 | a-auditer | |
| function | CMod_LoadSubmodels | 137 | a-auditer | |
| function | CMod_LoadSurfaces | 175 | a-auditer | |
| function | CMod_LoadNodes | 209 | a-auditer | |
| global | in | 211 | a-auditer | |
| global | child | 212 | a-auditer | |
| global | out | 213 | a-auditer | |
| function | CMod_LoadBrushes | 248 | a-auditer | |
| function | CMod_LoadLeafs | 280 | a-auditer | |
| global | i | 282 | a-auditer | |
| global | out | 283 | a-auditer | |
| global | in | 284 | a-auditer | |
| global | count | 285 | a-auditer | |
| function | CMod_LoadPlanes | 335 | a-auditer | |
| global | in | 339 | a-auditer | |
| global | count | 340 | a-auditer | |
| global | bits | 341 | a-auditer | |
| function | CMod_LoadLeafBrushes | 378 | a-auditer | |
| global | i | 380 | a-auditer | |
| global | out | 381 | a-auditer | |
| global | in | 382 | a-auditer | |
| global | count | 383 | a-auditer | |
| function | CMod_LoadBrushSides | 408 | a-auditer | |
| global | in | 412 | a-auditer | |
| global | count | 413 | a-auditer | |
| global | num | 414 | a-auditer | |
| function | CMod_LoadAreas | 444 | a-auditer | |
| global | i | 446 | a-auditer | |
| global | out | 447 | a-auditer | |
| global | in | 448 | a-auditer | |
| global | count | 449 | a-auditer | |
| function | CMod_LoadAreaPortals | 476 | a-auditer | |
| global | i | 478 | a-auditer | |
| global | out | 479 | a-auditer | |
| global | in | 480 | a-auditer | |
| global | count | 481 | a-auditer | |
| function | CMod_LoadVisibility | 506 | a-auditer | |
| global | i | 508 | a-auditer | |
| function | CMod_LoadEntityString | 530 | a-auditer | |
| function | CM_LoadMap | 548 | a-auditer | |
| global | buf | 550 | a-auditer | |
| global | i | 551 | a-auditer | |
| global | header | 552 | a-auditer | |
| global | length | 553 | a-auditer | |
| global | last_checksum | 554 | a-auditer | |
| function | CM_InlineModel | 639 | a-auditer | |
| global | num | 641 | a-auditer | |
| function | CM_NumClusters | 652 | a-auditer | |
| function | CM_NumInlineModels | 657 | a-auditer | |
| function | CM_EntityString | 662 | a-auditer | |
| function | CM_LeafContents | 667 | a-auditer | |
| function | CM_LeafCluster | 674 | a-auditer | |
| function | CM_LeafArea | 681 | a-auditer | |
| global | box_headnode | 692 | a-auditer | |
| global | box_leaf | 694 | a-auditer | |
| function | CM_InitBoxHull | 704 | a-auditer | |
| global | i | 706 | a-auditer | |
| global | side | 707 | a-auditer | |
| global | c | 708 | a-auditer | |
| function | CM_HeadnodeForBox | 775 | a-auditer | |
| function | CM_PointLeafnum_r | 800 | a-auditer | |
| global | d | 802 | a-auditer | |
| global | node | 803 | a-auditer | |
| global | d | 814 | a-auditer | |
| global | num | 818 | a-auditer | |
| function | CM_PointLeafnum | 826 | a-auditer | |
| function | CM_PointLeafnum_r | 830 | a-auditer | |
| global | leaf_list | 843 | a-auditer | |
| global | leaf_topnode | 845 | a-auditer | |
| function | CM_BoxLeafnums_r | 847 | a-auditer | |
| global | node | 850 | a-auditer | |
| global | s | 851 | a-auditer | |
| function | CM_BoxLeafnums_headnode | 885 | a-auditer | |
| function | CM_BoxLeafnums | 903 | a-auditer | |
| function | CM_BoxLeafnums_headnode | 905 | a-auditer | |
| function | CM_PointContents | 917 | a-auditer | |
| global | l | 919 | a-auditer | |
| function | CM_TransformedPointContents | 937 | a-auditer | |
| global | p_l | 939 | a-auditer | |
| global | temp | 940 | a-auditer | |
| global | l | 942 | a-auditer | |
| macro | DIST_EPSILON | 974 | a-auditer | |
| global | trace_trace | 980 | a-auditer | |
| global | trace_contents | 981 | a-auditer | |
| global | trace_ispoint | 982 | a-auditer | |
| function | CM_ClipBoxToBrush | 989 | a-auditer | |
| global | dist | 994 | a-auditer | |
| global | ofs | 996 | a-auditer | |
| global | f | 999 | a-auditer | |
| global | ofs | 1033 | a-auditer | |
| function | CM_TestBoxInBrush | 1103 | a-auditer | |
| global | dist | 1108 | a-auditer | |
| global | ofs | 1109 | a-auditer | |
| global | d1 | 1110 | a-auditer | |
| global | ofs | 1133 | a-auditer | |
| function | CM_TraceToLeaf | 1158 | a-auditer | |
| global | k | 1160 | a-auditer | |
| global | brushnum | 1161 | a-auditer | |
| global | leaf | 1162 | a-auditer | |
| function | CM_TestInLeaf | 1192 | a-auditer | |
| global | k | 1194 | a-auditer | |
| global | brushnum | 1195 | a-auditer | |
| global | leaf | 1196 | a-auditer | |
| function | CM_RecursiveHullCheck | 1227 | a-auditer | |
| global | node | 1229 | a-auditer | |
| global | idist | 1233 | a-auditer | |
| global | i | 1234 | a-auditer | |
| global | mid | 1235 | a-auditer | |
| global | side | 1236 | a-auditer | |
| global | midf | 1237 | a-auditer | |
| global | offset | 1269 | a-auditer | |
| function | CM_BoxTrace | 1350 | a-auditer | |
| global | i | 1354 | a-auditer | |
| global | leafs | 1379 | a-auditer | |
| global | topnode | 1382 | a-auditer | |
| function | CM_TransformedBoxTrace | 1451 | a-auditer | |
| global | trace | 1456 | a-auditer | |
| global | a | 1458 | a-auditer | |
| global | temp | 1460 | a-auditer | |
| global | rotated | 1461 | a-auditer | |
| global | rotated | 1472 | a-auditer | |
| function | CM_DecompressVis | 1530 | a-auditer | |
| global | c | 1532 | a-auditer | |
| global | out_p | 1533 | a-auditer | |
| global | row | 1534 | a-auditer | |
| global | pvsrow | 1572 | a-auditer | |
| global | phsrow | 1573 | a-auditer | |
| function | CM_ClusterPVS | 1575 | a-auditer | |
| function | CM_DecompressVis | 1580 | a-auditer | |
| function | CM_ClusterPHS | 1584 | a-auditer | |
| function | CM_DecompressVis | 1589 | a-auditer | |
| function | FloodArea_r | 1602 | a-auditer | |
| global | i | 1604 | a-auditer | |
| function | FloodAreaConnections | 1631 | a-auditer | |
| global | i | 1633 | a-auditer | |
| global | floodnum | 1635 | a-auditer | |
| function | CM_SetAreaPortalState | 1653 | a-auditer | |
| function | CM_AreasConnected | 1662 | a-auditer | |
| function | CM_WriteAreaBits | 1686 | a-auditer | |
| global | i | 1688 | a-auditer | |
| global | floodnum | 1689 | a-auditer | |
| global | bytes | 1690 | a-auditer | |
| function | CM_WritePortalState | 1721 | a-auditer | |
| function | CM_ReadPortalState | 1734 | a-auditer | |
| function | CM_HeadnodeVisible | 1748 | a-auditer | |
| global | leafnum | 1750 | a-auditer | |
| global | cluster | 1751 | a-auditer | |
| function | CM_HeadnodeVisible | 1768 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

