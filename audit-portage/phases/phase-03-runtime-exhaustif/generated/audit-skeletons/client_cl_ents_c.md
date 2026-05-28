# Inventaire runtime Phase 03 - Quake-2-master/client/cl_ents.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cl_ents.ts
- Cibles TS declarees : packages/client/src/cl_ents.ts, packages/client/src/refresh.ts, packages/client/src/cl_newfx.ts, packages/client/src/cl_parse.ts, packages/client/src/cl_tent.ts, packages/renderer-three/src/md2-mesh-builder.ts, packages/renderer-three/src/refresh-entity-sync.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | vidref_val | 28 | a-auditer | |
| global | bitcounts | 201 | a-auditer | |
| function | CL_ParseEntityBits | 202 | a-auditer | |
| global | i | 205 | a-auditer | |
| global | number | 206 | a-auditer | |
| global | number | 233 | a-auditer | |
| function | CL_ParseDelta | 247 | a-auditer | |
| function | CL_DeltaEntity | 327 | a-auditer | |
| global | state | 330 | a-auditer | |
| function | CL_ParsePacketEntities | 388 | a-auditer | |
| global | newnum | 390 | a-auditer | |
| global | bits | 391 | a-auditer | |
| global | oldstate | 392 | a-auditer | |
| function | CL_ParsePlayerstate | 515 | a-auditer | |
| global | flags | 517 | a-auditer | |
| global | state | 518 | a-auditer | |
| global | i | 519 | a-auditer | |
| global | statbits | 520 | a-auditer | |
| function | memset | 528 | a-auditer | |
| function | CL_FireEntityEvents | 639 | a-auditer | |
| global | s1 | 641 | a-auditer | |
| function | CL_ParseFrame | 663 | a-auditer | |
| global | cmd | 665 | a-auditer | |
| global | len | 666 | a-auditer | |
| global | old | 667 | a-auditer | |
| function | S_RegisterSexedModel | 780 | a-auditer | |
| global | n | 782 | a-auditer | |
| global | p | 783 | a-auditer | |
| global | model | 785 | a-auditer | |
| global | buffer | 786 | a-auditer | |
| function | CL_AddPacketEntities | 834 | a-auditer | |
| global | ent | 836 | a-auditer | |
| global | s1 | 837 | a-auditer | |
| global | autorotate | 838 | a-auditer | |
| global | i | 839 | a-auditer | |
| global | pnum | 840 | a-auditer | |
| global | cent | 841 | a-auditer | |
| global | autoanim | 842 | a-auditer | |
| global | ci | 843 | a-auditer | |
| function | V_AddLight | 1171 | a-auditer | |
| global | bfg_lightramp | 1187 | a-auditer | |
| global | intensity | 1229 | a-auditer | |
| function | V_AddLight | 1236 | a-auditer | |
| function | V_AddLight | 1251 | a-auditer | |
| function | CL_AddViewWeapon | 1293 | a-auditer | |
| global | i | 1296 | a-auditer | |
| function | CL_CalcViewValues | 1352 | a-auditer | |
| global | i | 1354 | a-auditer | |
| global | oldframe | 1357 | a-auditer | |
| global | delta | 1380 | a-auditer | |
| function | CL_AddEntities | 1438 | a-auditer | |
| function | CL_GetEntitySoundOrigin | 1490 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

