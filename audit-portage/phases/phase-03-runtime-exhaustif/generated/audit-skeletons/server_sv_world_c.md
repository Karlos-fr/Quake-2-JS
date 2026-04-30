# Inventaire runtime Phase 03 - Quake-2-master/server/sv_world.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/server/src/sv_world.ts
- Cibles TS declarees : packages/server/src/sv_world.ts, packages/server/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | STRUCT_FROM_LINK | 36 | a-auditer | |
| macro | EDICT_FROM_AREA | 38 | a-auditer | |
| struct | areanode_s | 40 | a-auditer | |
| global | axis | 42 | a-auditer | |
| global | dist | 43 | a-auditer | |
| macro | AREA_DEPTH | 49 | a-auditer | |
| macro | AREA_NODES | 50 | a-auditer | |
| global | sv_numareanodes | 53 | a-auditer | |
| global | area_type | 58 | a-auditer | |
| function | SV_HullForEntity | 60 | a-auditer | |
| function | ClearLink | 64 | a-auditer | |
| function | RemoveLink | 69 | a-auditer | |
| function | InsertLinkBefore | 75 | a-auditer | |
| function | SV_CreateAreaNode | 90 | a-auditer | |
| global | size | 93 | a-auditer | |
| function | SV_ClearWorld | 135 | a-auditer | |
| function | SV_UnlinkEdict | 149 | a-auditer | |
| macro | MAX_TOTAL_ENT_LEAFS | 164 | a-auditer | |
| function | SV_LinkEdict | 165 | a-auditer | |
| global | leafs | 168 | a-auditer | |
| global | clusters | 169 | a-auditer | |
| global | num_leafs | 170 | a-auditer | |
| global | area | 172 | a-auditer | |
| global | topnode | 173 | a-auditer | |
| global | i | 224 | a-auditer | |
| global | break | 336 | a-auditer | |
| function | InsertLinkBefore | 343 | a-auditer | |
| function | SV_AreaEdicts_r | 354 | a-auditer | |
| global | check | 357 | a-auditer | |
| global | count | 358 | a-auditer | |
| global | start | 366 | a-auditer | |
| function | SV_AreaEdicts | 408 | a-auditer | |
| function | SV_PointContents | 431 | a-auditer | |
| global | headnode | 436 | a-auditer | |
| global | angles | 437 | a-auditer | |
| struct | moveclip_t | 465 | a-auditer | |
| global | trace | 471 | a-auditer | |
| global | passedict | 472 | a-auditer | |
| global | contentmask | 473 | a-auditer | |
| function | SV_HullForEntity | 488 | a-auditer | |
| function | CM_HeadnodeForBox | 505 | a-auditer | |
| function | SV_ClipMoveToEntities | 517 | a-auditer | |
| global | trace | 521 | a-auditer | |
| global | headnode | 522 | a-auditer | |
| global | angles | 523 | a-auditer | |
| global | trace | 562 | a-auditer | |
| function | SV_TraceBounds | 589 | a-auditer | |
| global | i | 596 | a-auditer | |
| function | SV_Trace | 624 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

