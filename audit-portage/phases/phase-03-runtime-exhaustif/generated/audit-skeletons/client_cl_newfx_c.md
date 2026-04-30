# Inventaire runtime Phase 03 - Quake-2-master/client/cl_newfx.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cl_newfx.ts
- Cibles TS declarees : packages/client/src/cl_newfx.ts, packages/client/src/cl_tent.ts, packages/client/src/cl_fx.ts, packages/client/src/cl_parse.ts, packages/client/src/refresh.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | cl_numparticles | 26 | a-auditer | |
| global | vid_ref | 27 | a-auditer | |
| function | MakeNormalVectors | 29 | a-auditer | |
| function | vectoangles2 | 37 | a-auditer | |
| global | forward | 39 | a-auditer | |
| global | pitch | 48 | a-auditer | |
| global | yaw | 58 | a-auditer | |
| function | CL_Flashlight | 76 | a-auditer | |
| function | CL_ColorFlash | 95 | a-auditer | |
| function | CL_DebugTrail | 123 | a-auditer | |
| global | move | 125 | a-auditer | |
| global | vec | 126 | a-auditer | |
| global | len | 127 | a-auditer | |
| global | dec | 130 | a-auditer | |
| function | CL_SmokeTrail | 187 | a-auditer | |
| global | move | 189 | a-auditer | |
| global | vec | 190 | a-auditer | |
| global | len | 191 | a-auditer | |
| global | j | 192 | a-auditer | |
| function | CL_ForceWall | 230 | a-auditer | |
| global | move | 232 | a-auditer | |
| global | vec | 233 | a-auditer | |
| global | len | 234 | a-auditer | |
| global | j | 235 | a-auditer | |
| function | CL_FlameEffects | 279 | a-auditer | |
| global | j | 282 | a-auditer | |
| function | CL_GenericParticleEffect | 344 | a-auditer | |
| global | d | 348 | a-auditer | |
| function | CL_BubbleTrail2 | 388 | a-auditer | |
| global | move | 390 | a-auditer | |
| global | vec | 391 | a-auditer | |
| global | len | 392 | a-auditer | |
| global | dec | 395 | a-auditer | |
| macro | RINGS | 435 | a-auditer | |
| function | CL_Heatbeam | 439 | a-auditer | |
| global | move | 441 | a-auditer | |
| global | vec | 442 | a-auditer | |
| global | len | 443 | a-auditer | |
| global | i | 447 | a-auditer | |
| global | dir | 449 | a-auditer | |
| global | ltime | 450 | a-auditer | |
| global | step | 451 | a-auditer | |
| function | CL_Heatbeam | 525 | a-auditer | |
| global | move | 527 | a-auditer | |
| global | vec | 528 | a-auditer | |
| global | len | 529 | a-auditer | |
| global | j | 530 | a-auditer | |
| global | i | 533 | a-auditer | |
| global | dir | 535 | a-auditer | |
| global | ltime | 536 | a-auditer | |
| global | step | 537 | a-auditer | |
| global | start_pt | 538 | a-auditer | |
| global | rot | 539 | a-auditer | |
| global | variance | 540 | a-auditer | |
| global | end | 541 | a-auditer | |
| function | CL_Heatbeam | 623 | a-auditer | |
| global | move | 625 | a-auditer | |
| global | vec | 626 | a-auditer | |
| global | len | 627 | a-auditer | |
| global | j | 628 | a-auditer | |
| global | i | 631 | a-auditer | |
| global | dir | 633 | a-auditer | |
| global | ltime | 634 | a-auditer | |
| global | step | 635 | a-auditer | |
| global | start_pt | 636 | a-auditer | |
| global | rot | 637 | a-auditer | |
| function | CL_ParticleSteamEffect | 749 | a-auditer | |
| global | d | 753 | a-auditer | |
| function | CL_ParticleSteamEffect2 | 792 | a-auditer | |
| global | d | 797 | a-auditer | |
| global | dir | 799 | a-auditer | |
| function | CL_TrackerTrail | 844 | a-auditer | |
| global | move | 846 | a-auditer | |
| global | vec | 847 | a-auditer | |
| global | len | 849 | a-auditer | |
| global | j | 850 | a-auditer | |
| global | dec | 852 | a-auditer | |
| global | dist | 853 | a-auditer | |
| function | CL_Tracker_Shell | 898 | a-auditer | |
| global | dir | 900 | a-auditer | |
| global | i | 901 | a-auditer | |
| global | p | 902 | a-auditer | |
| function | CL_MonsterPlasma_Shell | 929 | a-auditer | |
| global | dir | 931 | a-auditer | |
| global | i | 932 | a-auditer | |
| global | p | 933 | a-auditer | |
| function | CL_Widowbeamout | 961 | a-auditer | |
| global | dir | 963 | a-auditer | |
| global | i | 964 | a-auditer | |
| global | p | 965 | a-auditer | |
| global | colortable | 966 | a-auditer | |
| global | ratio | 967 | a-auditer | |
| function | CL_Nukeblast | 997 | a-auditer | |
| global | dir | 999 | a-auditer | |
| global | i | 1000 | a-auditer | |
| global | p | 1001 | a-auditer | |
| global | colortable | 1002 | a-auditer | |
| global | ratio | 1003 | a-auditer | |
| function | CL_WidowSplash | 1033 | a-auditer | |
| global | colortable | 1035 | a-auditer | |
| global | i | 1036 | a-auditer | |
| global | dir | 1038 | a-auditer | |
| function | CL_Tracker_Explode | 1067 | a-auditer | |
| global | i | 1070 | a-auditer | |
| global | p | 1071 | a-auditer | |
| function | CL_TagTrail | 1107 | a-auditer | |
| global | move | 1109 | a-auditer | |
| global | vec | 1110 | a-auditer | |
| global | len | 1111 | a-auditer | |
| global | j | 1112 | a-auditer | |
| global | dec | 1114 | a-auditer | |
| function | CL_ColorExplosionParticles | 1156 | a-auditer | |
| function | CL_ParticleSmokeEffect | 1192 | a-auditer | |
| global | d | 1196 | a-auditer | |
| function | CL_BlasterParticles2 | 1238 | a-auditer | |
| global | d | 1242 | a-auditer | |
| global | count | 1243 | a-auditer | |
| function | CL_BlasterTrail2 | 1280 | a-auditer | |
| global | move | 1282 | a-auditer | |
| global | vec | 1283 | a-auditer | |
| global | len | 1284 | a-auditer | |
| global | j | 1285 | a-auditer | |
| global | dec | 1287 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

