# Inventaire runtime Phase 03 - Quake-2-master/client/cl_view.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cl_view.ts
- Cibles TS declarees : packages/client/src/cl_view.ts, packages/client/src/menu-player-config.ts, packages/client/src/refresh.ts, packages/renderer-three/src/refresh-entity-sync.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | gun_frame | 28 | a-auditer | |
| global | crosshair | 33 | a-auditer | |
| global | cl_testparticles | 34 | a-auditer | |
| global | cl_testentities | 35 | a-auditer | |
| global | cl_testlights | 36 | a-auditer | |
| global | cl_testblend | 37 | a-auditer | |
| global | cl_stats | 39 | a-auditer | |
| global | r_numdlights | 42 | a-auditer | |
| global | r_numentities | 45 | a-auditer | |
| global | r_numparticles | 48 | a-auditer | |
| global | num_cl_weaponmodels | 54 | a-auditer | |
| function | V_ClearScene | 63 | a-auditer | |
| function | V_AddEntity | 77 | a-auditer | |
| function | V_AddParticle | 91 | a-auditer | |
| function | V_AddLight | 109 | a-auditer | |
| function | V_AddLightStyle | 130 | a-auditer | |
| function | V_TestParticles | 151 | a-auditer | |
| function | V_TestEntities | 181 | a-auditer | |
| function | V_TestLights | 213 | a-auditer | |
| function | CL_PrepRefresh | 248 | a-auditer | |
| global | mapname | 250 | a-auditer | |
| global | i | 251 | a-auditer | |
| global | name | 252 | a-auditer | |
| global | rotate | 253 | a-auditer | |
| global | axis | 254 | a-auditer | |
| function | CalcFov | 363 | a-auditer | |
| global | a | 365 | a-auditer | |
| global | x | 366 | a-auditer | |
| function | V_Gun_Next_f | 383 | a-auditer | |
| function | V_Gun_Prev_f | 389 | a-auditer | |
| function | V_Gun_Model_f | 397 | a-auditer | |
| global | name | 399 | a-auditer | |
| function | SCR_DrawCrosshair | 418 | a-auditer | |
| function | V_RenderView | 442 | a-auditer | |
| function | entitycmpfnc | 444 | a-auditer | |
| function | V_Viewpos_f | 556 | a-auditer | |
| function | V_Init | 568 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

