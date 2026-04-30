# Inventaire runtime Phase 03 - Quake-2-master/qcommon/pmove.c

## Rattachement Phase 02

- Statut structurel : strict-ok
- Cible TS principale : packages/qcommon/src/pmove.ts
- Cibles TS declarees : packages/qcommon/src/pmove.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | STEPSIZE | 25 | a-auditer | |
| struct | pml_t | 31 | a-auditer | |
| global | origin | 33 | a-auditer | |
| global | velocity | 34 | a-auditer | |
| global | frametime | 37 | a-auditer | |
| global | groundcontents | 42 | a-auditer | |
| global | previous_origin | 44 | a-auditer | |
| global | ladder | 45 | a-auditer | |
| global | pm | 48 | a-auditer | |
| global | pml | 49 | a-auditer | |
| global | pm_stopspeed | 53 | a-auditer | |
| global | pm_maxspeed | 54 | a-auditer | |
| global | pm_duckspeed | 55 | a-auditer | |
| global | pm_accelerate | 56 | a-auditer | |
| global | pm_airaccelerate | 57 | a-auditer | |
| global | pm_wateraccelerate | 58 | a-auditer | |
| global | pm_friction | 59 | a-auditer | |
| global | pm_waterfriction | 60 | a-auditer | |
| global | pm_waterspeed | 61 | a-auditer | |
| macro | STOP_EPSILON | 78 | a-auditer | |
| function | PM_ClipVelocity | 80 | a-auditer | |
| global | backoff | 82 | a-auditer | |
| global | change | 83 | a-auditer | |
| global | i | 84 | a-auditer | |
| macro | MIN_STEP_NORMAL | 111 | a-auditer | |
| macro | MAX_CLIP_PLANES | 112 | a-auditer | |
| function | PM_StepSlideMove_ | 113 | a-auditer | |
| global | dir | 116 | a-auditer | |
| global | d | 117 | a-auditer | |
| global | numplanes | 118 | a-auditer | |
| global | planes | 119 | a-auditer | |
| global | primal_velocity | 120 | a-auditer | |
| global | trace | 122 | a-auditer | |
| global | end | 123 | a-auditer | |
| global | time_left | 124 | a-auditer | |
| function | PM_StepSlideMove | 271 | a-auditer | |
| global | trace | 275 | a-auditer | |
| function | PM_Friction | 345 | a-auditer | |
| global | vel | 347 | a-auditer | |
| global | friction | 349 | a-auditer | |
| global | drop | 350 | a-auditer | |
| function | PM_Accelerate | 397 | a-auditer | |
| global | i | 399 | a-auditer | |
| function | PM_AirAccelerate | 414 | a-auditer | |
| global | i | 416 | a-auditer | |
| function | PM_AddCurrents | 438 | a-auditer | |
| global | s | 441 | a-auditer | |
| global | wishvel | 458 | a-auditer | |
| function | PM_WaterMove | 533 | a-auditer | |
| global | i | 535 | a-auditer | |
| global | wishspeed | 537 | a-auditer | |
| function | PM_AirMove | 575 | a-auditer | |
| global | i | 577 | a-auditer | |
| global | wishvel | 578 | a-auditer | |
| global | wishdir | 580 | a-auditer | |
| global | wishspeed | 581 | a-auditer | |
| global | maxspeed | 582 | a-auditer | |
| function | PM_Accelerate | 657 | a-auditer | |
| function | PM_CatagorizePosition | 671 | a-auditer | |
| global | point | 673 | a-auditer | |
| global | cont | 674 | a-auditer | |
| global | trace | 675 | a-auditer | |
| global | sample1 | 676 | a-auditer | |
| global | sample2 | 677 | a-auditer | |
| function | PM_CheckJump | 778 | a-auditer | |
| function | PM_CheckSpecialMovement | 831 | a-auditer | |
| global | cont | 834 | a-auditer | |
| global | trace | 836 | a-auditer | |
| function | PM_FlyMove | 882 | a-auditer | |
| global | i | 886 | a-auditer | |
| global | wishvel | 887 | a-auditer | |
| global | wishdir | 889 | a-auditer | |
| global | wishspeed | 890 | a-auditer | |
| global | end | 891 | a-auditer | |
| global | trace | 892 | a-auditer | |
| function | PM_CheckDuck | 976 | a-auditer | |
| global | trace | 978 | a-auditer | |
| function | PM_DeadMove | 1034 | a-auditer | |
| global | forward | 1036 | a-auditer | |
| function | PM_GoodPosition | 1057 | a-auditer | |
| global | trace | 1059 | a-auditer | |
| global | i | 1061 | a-auditer | |
| function | PM_SnapPosition | 1081 | a-auditer | |
| global | sign | 1083 | a-auditer | |
| global | base | 1085 | a-auditer | |
| global | jitterbits | 1087 | a-auditer | |
| global | sign | 1098 | a-auditer | |
| function | PM_InitialSnapPosition | 1168 | a-auditer | |
| global | base | 1171 | a-auditer | |
| global | offset | 1172 | a-auditer | |
| function | PM_ClampAngles | 1204 | a-auditer | |
| global | temp | 1206 | a-auditer | |
| global | i | 1207 | a-auditer | |
| function | Pmove | 1240 | a-auditer | |
| global | msec | 1305 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

