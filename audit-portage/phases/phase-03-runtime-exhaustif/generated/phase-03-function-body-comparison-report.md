# Comparaison fonction par fonction Phase 03

Comparaison outillee des corps de fonctions C actifs avec les corps TS de meme nom dans les cibles rattachees. Le statut `matched-name-needs-behavior-review` signifie que la lecture comportementale reste a faire.

## Resume

- Fonctions source C actives : 1848
- Fonctions avec corps TS de meme nom : 1800
- Fonctions sans corps TS trouve : 48
- Fonctions sans cible TS : 0

## Comparaisons

| Source | Fonction | Statut | TS matches | Notes | Findings |
| --- | --- | --- | --- | --- | --- |
| Quake-2-master/client/cl_cin.c:64 | SCR_LoadPCX | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/cl_cin.c:153 | SCR_StopCinematic | matched-name-needs-behavior-review | packages/client/src/cl_cin.ts:98 calls 0/4 branches 1/6<br>packages/client/src/cl_scrn.ts:2254 calls 0/4 branches 0/6 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_cin.c:198 | SCR_FinishCinematic | matched-name-needs-behavior-review | packages/client/src/cl_cin.ts:131 calls 1/3 branches 0/0<br>packages/client/src/cl_scrn.ts:2270 calls 0/3 branches 0/0 | call-count-differs<br>call-count-differs |  |
| Quake-2-master/client/cl_cin.c:212 | SmallestNode1 | matched-name-needs-behavior-review | packages/client/src/cl_cin.ts:439 calls 0/0 branches 9/9 |  |  |
| Quake-2-master/client/cl_cin.c:247 | Huff1TableInit | matched-name-needs-behavior-review | packages/client/src/cl_cin.ts:473 calls 1/4 branches 9/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_cin.c:298 | Huff1Decompress | matched-name-needs-behavior-review | packages/client/src/cl_cin.ts:529 calls 0/2 branches 8/27 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_cin.c:427 | SCR_ReadNextFrame | matched-name-needs-behavior-review | packages/client/src/cl_cin.ts:577 calls 1/6 branches 14/8 | branch-count-differs |  |
| Quake-2-master/client/cl_cin.c:490 | SCR_RunCinematic | matched-name-needs-behavior-review | packages/client/src/cl_cin.ts:148 calls 4/6 branches 10/12<br>packages/client/src/cl_scrn.ts:2287 calls 0/6 branches 0/12 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_cin.c:541 | SCR_DrawCinematic | matched-name-needs-behavior-review | packages/client/src/cl_cin.ts:205 calls 0/2 branches 0/8<br>packages/client/src/cl_scrn.ts:2311 calls 0/2 branches 0/8 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_cin.c:576 | SCR_PlayCinematic | matched-name-needs-behavior-review | packages/client/src/cl_cin.ts:304 calls 4/19 branches 12/7<br>packages/client/src/cl_scrn.ts:2356 calls 0/19 branches 1/7 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_ents.c:202 | CL_ParseEntityBits | matched-name-needs-behavior-review | packages/client/src/cl_ents.ts:449 calls 0/2 branches 0/8 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_ents.c:247 | CL_ParseDelta | matched-name-needs-behavior-review | packages/client/src/cl_ents.ts:481 calls 6/7 branches 30/32 | branch-count-differs |  |
| Quake-2-master/client/cl_ents.c:327 | CL_DeltaEntity | matched-name-needs-behavior-review | packages/client/src/cl_ents.ts:758 calls 2/3 branches 5/5 |  |  |
| Quake-2-master/client/cl_ents.c:388 | CL_ParsePacketEntities | matched-name-needs-behavior-review | packages/client/src/cl_ents.ts:810 calls 2/4 branches 22/31 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_ents.c:515 | CL_ParsePlayerstate | matched-name-needs-behavior-review | packages/client/src/cl_ents.ts:571 calls 5/6 branches 18/20 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_ents.c:639 | CL_FireEntityEvents | matched-name-needs-behavior-review | packages/client/src/cl_ents.ts:173 calls 0/2 branches 4/3 | branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_ents.c:663 | CL_ParseFrame | matched-name-needs-behavior-review | packages/client/src/cl_ents.ts:671 calls 7/14 branches 12/17 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_ents.c:780 | S_RegisterSexedModel | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/cl_ents.c:834 | CL_AddPacketEntities | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/cl_ents.c:1293 | CL_AddViewWeapon | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/cl_ents.c:1352 | CL_CalcViewValues | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/cl_ents.c:1438 | CL_AddEntities | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/cl_ents.c:1490 | CL_GetEntitySoundOrigin | matched-name-needs-behavior-review | packages/client/src/refresh.ts:311 calls 0/2 branches 2/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:55 | CL_ClearLightStyles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:377 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_fx.c:66 | CL_RunLightStyles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:398 calls 0/0 branches 5/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:92 | CL_SetLightstyle | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:431 calls 0/2 branches 3/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:114 | CL_AddLightStyles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:462 calls 0/1 branches 1/1 |  |  |
| Quake-2-master/client/cl_fx.c:138 | CL_ClearDlights | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:481 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_fx.c:149 | CL_AllocDlight | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:505 calls 0/1 branches 8/8 |  |  |
| Quake-2-master/client/cl_fx.c:192 | CL_NewDlight | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:536 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_fx.c:211 | CL_RunDLights | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:565 calls 0/0 branches 6/6 |  |  |
| Quake-2-master/client/cl_fx.c:238 | CL_ParseMuzzleFlash | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:3860 calls 2/12 branches 2/60 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:429 | CL_ParseMuzzleFlash2 | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:3888 calls 2/12 branches 2/232 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:812 | CL_AddDLights | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:596 calls 0/1 branches 1/9 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:896 | CL_ClearParticles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:621 calls 0/0 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/cl_fx.c:916 | CL_ParticleEffect | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:223 calls 2/3 branches 4/4 | call-count-differs |  |
| Quake-2-master/client/cl_fx.c:955 | CL_ParticleEffect2 | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:259 calls 2/3 branches 4/4 | call-count-differs |  |
| Quake-2-master/client/cl_fx.c:995 | CL_ParticleEffect3 | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:295 calls 2/3 branches 4/4 | call-count-differs |  |
| Quake-2-master/client/cl_fx.c:1033 | CL_TeleporterParticles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1476 calls 1/2 branches 5/4<br>packages/client/src/cl_fx.ts:1477 calls 1/2 branches 5/4<br>packages/client/src/cl_fx.ts:1478 calls 1/2 branches 5/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:1074 | CL_LogoutEffect | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1528 calls 2/3 branches 12/8<br>packages/client/src/cl_fx.ts:1529 calls 2/3 branches 12/8<br>packages/client/src/cl_fx.ts:1530 calls 2/3 branches 12/8 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:1119 | CL_ItemRespawnParticles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1598 calls 2/3 branches 5/4<br>packages/client/src/cl_fx.ts:1599 calls 2/3 branches 5/4<br>packages/client/src/cl_fx.ts:1600 calls 2/3 branches 5/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:1158 | CL_ExplosionParticles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1634 calls 1/2 branches 6/4<br>packages/client/src/cl_fx.ts:1635 calls 1/2 branches 6/4<br>packages/client/src/cl_fx.ts:1636 calls 1/2 branches 6/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:1195 | CL_BigTeleportParticles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1672 calls 3/4 branches 5/3<br>packages/client/src/cl_fx.ts:1673 calls 3/4 branches 5/3<br>packages/client/src/cl_fx.ts:1674 calls 3/4 branches 5/3 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:1242 | CL_BlasterParticles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1724 calls 2/3 branches 6/4<br>packages/client/src/cl_fx.ts:1725 calls 2/3 branches 6/4<br>packages/client/src/cl_fx.ts:1726 calls 2/3 branches 6/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:1284 | CL_BlasterTrail | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1778 calls 0/8 branches 2/4<br>packages/client/src/cl_fx.ts:1779 calls 0/8 branches 2/4<br>packages/client/src/cl_fx.ts:1780 calls 0/8 branches 2/4 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:1335 | CL_QuadTrail | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1813 calls 0/8 branches 2/4<br>packages/client/src/cl_fx.ts:1814 calls 0/8 branches 2/4<br>packages/client/src/cl_fx.ts:1815 calls 0/8 branches 2/4 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:1385 | CL_FlagTrail | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1848 calls 0/8 branches 2/4<br>packages/client/src/cl_fx.ts:1849 calls 0/8 branches 2/4<br>packages/client/src/cl_fx.ts:1850 calls 0/8 branches 2/4 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:1435 | CL_DiminishingTrail | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1884 calls 0/9 branches 3/16<br>packages/client/src/cl_fx.ts:1885 calls 0/9 branches 3/16<br>packages/client/src/cl_fx.ts:1886 calls 0/9 branches 3/16 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:1534 | MakeNormalVectors | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1935 calls 0/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/cl_fx.c:1556 | CL_RocketTrail | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1955 calls 1/10 branches 2/5<br>packages/client/src/cl_fx.ts:1956 calls 1/10 branches 2/5<br>packages/client/src/cl_fx.ts:1957 calls 1/10 branches 2/5 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:1613 | CL_RailTrail | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:1999 calls 0/13 branches 2/8<br>packages/client/src/cl_fx.ts:2000 calls 0/13 branches 2/8<br>packages/client/src/cl_fx.ts:2001 calls 0/13 branches 2/8 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:1704 | CL_IonripperTrail | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:2028 calls 0/8 branches 2/6<br>packages/client/src/cl_fx.ts:2029 calls 0/8 branches 2/6<br>packages/client/src/cl_fx.ts:2030 calls 0/8 branches 2/6 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:1768 | CL_BubbleTrail | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:2056 calls 2/9 branches 6/4<br>packages/client/src/cl_fx.ts:2057 calls 2/9 branches 6/4<br>packages/client/src/cl_fx.ts:2058 calls 2/9 branches 6/4 | branch-count-differs<br>branch-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:1819 | CL_FlyParticles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:2111 calls 0/4 branches 3/6<br>packages/client/src/cl_fx.ts:2112 calls 0/4 branches 3/6<br>packages/client/src/cl_fx.ts:2113 calls 0/4 branches 3/6 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:1882 | CL_FlyEffect | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:2138 calls 1/1 branches 5/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:1921 | CL_BfgParticles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:2186 calls 0/7 branches 3/5<br>packages/client/src/cl_fx.ts:2187 calls 0/7 branches 3/5<br>packages/client/src/cl_fx.ts:2188 calls 0/7 branches 3/5 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:1990 | CL_TrapParticles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:2216 calls 0/9 branches 3/9<br>packages/client/src/cl_fx.ts:2217 calls 0/9 branches 3/9<br>packages/client/src/cl_fx.ts:2218 calls 0/9 branches 3/9 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_fx.c:2097 | CL_BFGExplosionParticles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:2246 calls 1/2 branches 6/4<br>packages/client/src/cl_fx.ts:2247 calls 1/2 branches 6/4<br>packages/client/src/cl_fx.ts:2248 calls 1/2 branches 6/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:2135 | CL_TeleportParticles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:2285 calls 0/3 branches 7/5<br>packages/client/src/cl_fx.ts:2286 calls 0/3 branches 7/5<br>packages/client/src/cl_fx.ts:2287 calls 0/3 branches 7/5 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:2182 | CL_AddParticles | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:2340 calls 0/1 branches 10/9 | branch-count-differs |  |
| Quake-2-master/client/cl_fx.c:2258 | CL_EntityEvent | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/cl_fx.c:2293 | CL_ClearEffects | matched-name-needs-behavior-review | packages/client/src/cl_fx.ts:645 calls 3/3 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:66 | KeyDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:205 calls 1/3 branches 11/13 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_input.c:102 | KeyUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:247 calls 1/2 branches 13/14 | branch-count-differs |  |
| Quake-2-master/client/cl_input.c:142 | IN_KLookDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:319 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:143 | IN_KLookUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:322 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:144 | IN_UpDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:325 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:145 | IN_UpUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:328 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:146 | IN_DownDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:331 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:147 | IN_DownUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:334 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:148 | IN_LeftDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:337 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:149 | IN_LeftUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:340 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:150 | IN_RightDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:343 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:151 | IN_RightUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:346 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:152 | IN_ForwardDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:349 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:153 | IN_ForwardUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:352 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:154 | IN_BackDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:355 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:155 | IN_BackUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:358 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:156 | IN_LookupDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:361 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:157 | IN_LookupUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:364 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:158 | IN_LookdownDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:367 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:159 | IN_LookdownUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:370 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:160 | IN_MoveleftDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:373 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:161 | IN_MoveleftUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:376 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:162 | IN_MoverightDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:379 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:163 | IN_MoverightUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:382 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:165 | IN_SpeedDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:385 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:166 | IN_SpeedUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:388 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:167 | IN_StrafeDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:391 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:168 | IN_StrafeUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:394 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:170 | IN_AttackDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:397 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:171 | IN_AttackUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:400 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:173 | IN_UseDown | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:403 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:174 | IN_UseUp | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:406 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:176 | IN_Impulse | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:420 calls 1/2 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:185 | CL_KeyState | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:296 calls 0/0 branches 4/4 |  |  |
| Quake-2-master/client/cl_input.c:241 | CL_AdjustAngles | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:436 calls 1/1 branches 2/4 | branch-count-differs |  |
| Quake-2-master/client/cl_input.c:276 | CL_BaseMove | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:472 calls 2/4 branches 4/3 | branch-count-differs |  |
| Quake-2-master/client/cl_input.c:312 | CL_ClampPitch | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:524 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/client/cl_input.c:330 | CL_FinishMove | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:550 calls 2/2 branches 5/5 | call-count-differs |  |
| Quake-2-master/client/cl_input.c:371 | CL_CreateCmd | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:593 calls 3/3 branches 4/3 | branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_input.c:397 | IN_CenterView | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:770 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_input.c:407 | CL_InitInput | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:786 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/cl_input.c:453 | CL_SendCmd | matched-name-needs-behavior-review | packages/client/src/cl_input.ts:679 calls 9/12 branches 11/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_inv.c:29 | CL_ParseInventory | matched-name-needs-behavior-review | packages/client/src/cl_inv.ts:326 calls 1/1 branches 2/1 | branch-count-differs |  |
| Quake-2-master/client/cl_inv.c:43 | Inv_DrawString | matched-name-needs-behavior-review | packages/client/src/cl_inv.ts:81 calls 0/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/cl_inv.c:53 | SetStringHighBit | matched-name-needs-behavior-review | packages/client/src/cl_inv.ts:123 calls 0/0 branches 2/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_inv.c:66 | CL_DrawInventory | matched-name-needs-behavior-review | packages/client/src/cl_inv.ts:143 calls 2/8 branches 12/12 | call-count-differs |  |
| Quake-2-master/client/cl_main.c:113 | CL_WriteDemoMessage | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1161 calls 1/2 branches 5/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:132 | CL_Stop_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1190 calls 0/3 branches 4/2 | branch-count-differs |  |
| Quake-2-master/client/cl_main.c:160 | CL_Record_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1221 calls 0/17 branches 0/15 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_main.c:284 | Cmd_ForwardToServer | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:617 calls 2/6 branches 3/3 | call-count-differs |  |
| Quake-2-master/client/cl_main.c:304 | CL_Setenv_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:645 calls 2/7 branches 7/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:345 | CL_ForwardToServer_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1704 calls 2/6 branches 3/3 | call-count-differs |  |
| Quake-2-master/client/cl_main.c:367 | CL_Pause_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1767 calls 2/3 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/cl_main.c:384 | CL_Quit_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:421 calls 1/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/cl_main.c:397 | CL_Drop | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:855 calls 1/2 branches 3/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:420 | CL_SendConnectPacket | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:766 calls 3/6 branches 5/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:448 | CL_CheckForResend | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:805 calls 3/7 branches 10/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:494 | CL_Connect_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:439 calls 3/9 branches 4/4 | call-count-differs |  |
| Quake-2-master/client/cl_main.c:533 | CL_Rcon_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:475 calls 4/9 branches 12/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:592 | CL_ClearState | matched-name-needs-behavior-review | packages/client/src/cl_parse.ts:282 calls 2/5 branches 2/0 | branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_main.c:615 | CL_Disconnect | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:357 calls 3/12 branches 5/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:662 | CL_Disconnect_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:405 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_main.c:677 | CL_Packet_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1322 calls 5/8 branches 11/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:728 | CL_Changing_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:684 calls 0/2 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/cl_main.c:748 | CL_Reconnect_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1728 calls 1/5 branches 7/7 | call-count-differs |  |
| Quake-2-master/client/cl_main.c:783 | CL_ParseStatusMessage | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:879 calls 1/3 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:799 | CL_PingServers_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:536 calls 4/9 branches 11/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:857 | CL_Skins_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:325 calls 1/4 branches 4/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:880 | CL_ConnectionlessPacket | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:901 calls 13/19 branches 22/18 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:974 | CL_DumpPackets | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1373 calls 1/2 branches 4/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:987 | CL_ReadPackets | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1398 calls 7/9 branches 19/15 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:1050 | CL_FixUpGender | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:730 calls 1/4 branches 8/8 |  |  |
| Quake-2-master/client/cl_main.c:1081 | CL_Userinfo_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:597 calls 2/3 branches 2/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:1095 | CL_Snd_Restart_f | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:706 calls 1/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/cl_main.c:1117 | CL_RequestNextDownload | matched-name-needs-behavior-review | packages/client/src/precache.ts:103 calls 1/16 branches 57/81 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:1379 | CL_Precache_f | matched-name-needs-behavior-review | packages/client/src/precache.ts:342 calls 3/7 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/cl_main.c:1406 | CL_InitLocal | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1537 calls 1/4 branches 5/0 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_main.c:1556 | CL_WriteConfiguration | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1472 calls 0/8 branches 0/4 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_main.c:1611 | CL_FixCvarCheats | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:987 calls 2/3 branches 5/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:1649 | CL_SendCommand | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1016 calls 3/6 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/cl_main.c:1677 | CL_Frame | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1037 calls 1/15 branches 17/18 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_main.c:1780 | CL_Init | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1125 calls 1/11 branches 3/3 | call-count-differs |  |
| Quake-2-master/client/cl_main.c:1825 | CL_Shutdown | matched-name-needs-behavior-review | packages/client/src/cl_main.ts:1511 calls 1/6 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/cl_newfx.c:37 | vectoangles2 | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:1420 calls 2/2 branches 9/10 | branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:76 | CL_Flashlight | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:530 calls 0/2 branches 2/0<br>packages/client/src/cl_newfx.ts:531 calls 0/2 branches 2/0<br>packages/client/src/cl_newfx.ts:532 calls 0/2 branches 2/0 | branch-count-differs<br>branch-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:95 | CL_ColorFlash | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:456 calls 0/2 branches 3/1<br>packages/client/src/cl_newfx.ts:464 calls 0/2 branches 3/1<br>packages/client/src/cl_newfx.ts:473 calls 0/2 branches 3/1 | branch-count-differs<br>body-size-differs<br>branch-count-differs<br>body-size-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_newfx.c:123 | CL_DebugTrail | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:337 calls 0/8 branches 5/3<br>packages/client/src/cl_newfx.ts:338 calls 0/8 branches 5/3<br>packages/client/src/cl_newfx.ts:339 calls 0/8 branches 5/3 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:187 | CL_SmokeTrail | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:567 calls 2/9 branches 6/4<br>packages/client/src/cl_newfx.ts:574 calls 2/9 branches 6/4<br>packages/client/src/cl_newfx.ts:582 calls 2/9 branches 6/4 | branch-count-differs<br>branch-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:230 | CL_ForceWall | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:648 calls 2/8 branches 8/5<br>packages/client/src/cl_newfx.ts:649 calls 2/8 branches 8/5<br>packages/client/src/cl_newfx.ts:650 calls 2/8 branches 8/5 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:279 | CL_FlameEffects | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:716 calls 2/4 branches 10/8<br>packages/client/src/cl_newfx.ts:717 calls 2/4 branches 10/8<br>packages/client/src/cl_newfx.ts:718 calls 2/4 branches 10/8 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:344 | CL_GenericParticleEffect | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:787 calls 2/3 branches 7/6<br>packages/client/src/cl_newfx.ts:796 calls 2/3 branches 7/6<br>packages/client/src/cl_newfx.ts:806 calls 2/3 branches 7/6 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:388 | CL_BubbleTrail2 | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:394 calls 2/9 branches 6/4<br>packages/client/src/cl_newfx.ts:395 calls 2/9 branches 6/4<br>packages/client/src/cl_newfx.ts:396 calls 2/9 branches 6/4 | branch-count-differs<br>branch-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:439 | CL_Heatbeam | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:1227 calls 2/10 branches 8/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:525 | CL_Heatbeam | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:1227 calls 2/11 branches 8/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:623 | CL_Heatbeam | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:1227 calls 2/11 branches 8/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:749 | CL_ParticleSteamEffect | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:45 calls 3/6 branches 6/4<br>packages/client/src/cl_newfx.ts:52 calls 3/6 branches 6/4<br>packages/client/src/cl_newfx.ts:60 calls 3/6 branches 6/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:792 | CL_ParticleSteamEffect2 | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:133 calls 3/7 branches 6/4<br>packages/client/src/cl_newfx.ts:134 calls 3/7 branches 6/4<br>packages/client/src/cl_newfx.ts:135 calls 3/7 branches 6/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:844 | CL_TrackerTrail | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:876 calls 3/11 branches 5/4<br>packages/client/src/cl_newfx.ts:877 calls 3/11 branches 5/4<br>packages/client/src/cl_newfx.ts:878 calls 3/11 branches 5/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:898 | CL_Tracker_Shell | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:935 calls 0/4 branches 3/3 | call-count-differs |  |
| Quake-2-master/client/cl_newfx.c:929 | CL_MonsterPlasma_Shell | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:1301 calls 0/4 branches 3/3 | call-count-differs |  |
| Quake-2-master/client/cl_newfx.c:961 | CL_Widowbeamout | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:1330 calls 0/5 branches 3/3 |  |  |
| Quake-2-master/client/cl_newfx.c:997 | CL_Nukeblast | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:1363 calls 0/5 branches 3/3 |  |  |
| Quake-2-master/client/cl_newfx.c:1033 | CL_WidowSplash | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:1114 calls 1/5 branches 5/3<br>packages/client/src/cl_newfx.ts:1115 calls 1/5 branches 5/3<br>packages/client/src/cl_newfx.ts:1116 calls 1/5 branches 5/3 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:1067 | CL_Tracker_Explode | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:961 calls 0/5 branches 3/3 | call-count-differs |  |
| Quake-2-master/client/cl_newfx.c:1107 | CL_TagTrail | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:992 calls 2/8 branches 6/4<br>packages/client/src/cl_newfx.ts:993 calls 2/8 branches 6/4<br>packages/client/src/cl_newfx.ts:994 calls 2/8 branches 6/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:1156 | CL_ColorExplosionParticles | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:1166 calls 1/2 branches 6/4<br>packages/client/src/cl_newfx.ts:1167 calls 1/2 branches 6/4<br>packages/client/src/cl_newfx.ts:1168 calls 1/2 branches 6/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:1192 | CL_ParticleSmokeEffect | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:190 calls 3/6 branches 6/4<br>packages/client/src/cl_newfx.ts:197 calls 3/6 branches 6/4<br>packages/client/src/cl_newfx.ts:205 calls 3/6 branches 6/4 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_newfx.c:1238 | CL_BlasterParticles2 | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:278 calls 2/3 branches 6/4<br>packages/client/src/cl_newfx.ts:279 calls 2/3 branches 6/4<br>packages/client/src/cl_newfx.ts:280 calls 2/3 branches 6/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_newfx.c:1280 | CL_BlasterTrail2 | matched-name-needs-behavior-review | packages/client/src/cl_newfx.ts:1054 calls 2/8 branches 6/4<br>packages/client/src/cl_newfx.ts:1055 calls 2/8 branches 6/4<br>packages/client/src/cl_newfx.ts:1056 calls 2/8 branches 6/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_parse.c:53 | CL_DownloadFileName | matched-name-needs-behavior-review | packages/client/src/download.ts:51 calls 0/3 branches 1/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_parse.c:69 | CL_CheckOrDownloadFile | matched-name-needs-behavior-review | packages/client/src/download.ts:69 calls 1/13 branches 7/7 | call-count-differs |  |
| Quake-2-master/client/cl_parse.c:132 | CL_Download_f | matched-name-needs-behavior-review | packages/client/src/download.ts:114 calls 2/12 branches 6/6 | call-count-differs |  |
| Quake-2-master/client/cl_parse.c:176 | CL_RegisterSounds | matched-name-needs-behavior-review | packages/client/src/sound-registration.ts:52 calls 1/5 branches 5/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_parse.c:200 | CL_ParseDownload | matched-name-needs-behavior-review | packages/client/src/cl_parse.ts:411 calls 2/12 branches 12/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_parse.c:298 | CL_ParseServerData | matched-name-needs-behavior-review | packages/client/src/cl_parse.ts:670 calls 6/13 branches 4/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_parse.c:359 | CL_ParseBaseline | matched-name-needs-behavior-review | packages/client/src/cl_parse.ts:323 calls 2/3 branches 0/0 |  |  |
| Quake-2-master/client/cl_parse.c:380 | CL_LoadClientinfo | matched-name-needs-behavior-review | packages/client/src/cl_parse.ts:510 calls 0/11 branches 8/14 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_parse.c:501 | CL_ParseClientinfo | matched-name-needs-behavior-review | packages/client/src/cl_parse.ts:574 calls 1/1 branches 3/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_parse.c:519 | CL_ParseConfigString | matched-name-needs-behavior-review | packages/client/src/cl_parse.ts:619 calls 4/12 branches 12/19 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_parse.c:581 | CL_ParseStartSoundPacket | matched-name-needs-behavior-review | packages/client/src/cl_parse.ts:342 calls 3/5 branches 4/13 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_parse.c:641 | SHOWNET | matched-name-needs-behavior-review | packages/client/src/cl_parse.ts:393 calls 0/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/cl_parse.c:652 | CL_ParseServerMessage | matched-name-needs-behavior-review | packages/client/src/cl_parse.ts:712 calls 15/24 branches 50/54 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_pred.c:29 | CL_CheckPredictionError | matched-name-needs-behavior-review | packages/client/src/cl_pred.ts:96 calls 1/5 branches 5/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_pred.c:73 | CL_ClipMoveToEntities | matched-name-needs-behavior-review | packages/client/src/cl_pred.ts:204 calls 2/2 branches 17/16 | branch-count-differs |  |
| Quake-2-master/client/cl_pred.c:148 | CL_PMTrace | matched-name-needs-behavior-review | packages/client/src/cl_pred.ts:293 calls 2/2 branches 2/2 |  |  |
| Quake-2-master/client/cl_pred.c:163 | CL_PMpointcontents | matched-name-needs-behavior-review | packages/client/src/cl_pred.ts:317 calls 2/2 branches 6/6 |  |  |
| Quake-2-master/client/cl_pred.c:199 | CL_PredictMovement | matched-name-needs-behavior-review | packages/client/src/cl_pred.ts:140 calls 2/6 branches 12/12 | call-count-differs |  |
| Quake-2-master/client/cl_scrn.c:91 | CL_AddNetgraph | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1344 calls 1/1 branches 5/5 | call-count-differs |  |
| Quake-2-master/client/cl_scrn.c:132 | SCR_DebugGraph | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1375 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/client/cl_scrn.c:144 | SCR_DrawDebugGraph | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1395 calls 0/1 branches 5/2 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_scrn.c:196 | SCR_CenterPrint | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1471 calls 0/3 branches 0/11 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_scrn.c:251 | SCR_DrawCenterString | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/cl_scrn.c:297 | SCR_CheckDrawCenterString | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1490 calls 0/1 branches 3/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:316 | SCR_CalcVrect | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:2415 calls 0/1 branches 3/2 | branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:346 | SCR_SizeUp_f | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/cl_scrn.c:359 | SCR_SizeDown_f | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/cl_scrn.c:371 | SCR_Sky_f | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:2220 calls 2/5 branches 5/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:408 | SCR_Init | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:718 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/cl_scrn.c:442 | SCR_DrawNet | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1613 calls 0/1 branches 3/2 | branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:456 | SCR_DrawPause | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1641 calls 0/2 branches 3/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:475 | SCR_DrawLoading | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1662 calls 0/2 branches 3/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:496 | SCR_RunConsole | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1579 calls 0/0 branches 6/7 | branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:525 | SCR_DrawConsole | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1859 calls 0/4 branches 7/7 | call-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_scrn.c:560 | SCR_BeginLoadingPlaque | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1516 calls 0/4 branches 8/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:587 | SCR_EndLoadingPlaque | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1549 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/cl_scrn.c:598 | SCR_Loading_f | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1563 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_scrn.c:608 | entitycmpfnc | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/cl_scrn.c:623 | SCR_TimeRefresh_f | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:2167 calls 0/7 branches 0/6 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_scrn.c:666 | SCR_AddDirtyPoint | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1680 calls 0/0 branches 4/4 |  |  |
| Quake-2-master/client/cl_scrn.c:678 | SCR_DirtyScreen | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1704 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/cl_scrn.c:691 | SCR_TileClear | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1722 calls 1/2 branches 22/19 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:801 | SizeHUDString | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:502 calls 0/0 branches 5/4 | branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:829 | DrawHUDString | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:539 calls 0/1 branches 2/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:870 | SCR_DrawField | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:604 calls 0/4 branches 3/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:915 | SCR_TouchPics | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:670 calls 0/3 branches 7/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:941 | SCR_ExecuteLayoutString | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:791 calls 2/12 branches 66/72 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:1236 | SCR_DrawStats | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:969 calls 1/1 branches 1/0 | branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:1250 | SCR_DrawLayout | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:982 calls 1/1 branches 3/2 | branch-count-differs |  |
| Quake-2-master/client/cl_scrn.c:1267 | SCR_UpdateScreen | matched-name-needs-behavior-review | packages/client/src/cl_scrn.ts:1966 calls 7/23 branches 23/26 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_tent.c:125 | CL_RegisterTEntSounds | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:230 calls 0/3 branches 1/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_tent.c:172 | CL_RegisterTEntModels | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:271 calls 0/2 branches 0/0 | call-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:213 | CL_ClearTEnts | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:205 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/cl_tent.c:230 | CL_AllocExplosion | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:1503 calls 0/1 branches 6/6 |  |  |
| Quake-2-master/client/cl_tent.c:263 | CL_SmokeAndFlash | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:1258 calls 0/2 branches 0/0 | call-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:289 | CL_ParseParticles | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:1656 calls 3/4 branches 1/0 | branch-count-differs |  |
| Quake-2-master/client/cl_tent.c:309 | CL_ParseBeam | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:1876 calls 2/5 branches 1/7 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:357 | CL_ParseBeam2 | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:1894 calls 2/4 branches 1/7 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:411 | CL_ParsePlayerBeam | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:1912 calls 2/5 branches 3/11 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:475 | CL_ParseLightning | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:1941 calls 2/5 branches 1/7 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:528 | CL_ParseLaser | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:1960 calls 1/3 branches 1/3 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:557 | CL_ParseSteam | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:1976 calls 4/6 branches 3/7 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:619 | CL_ParseWidow | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:2009 calls 2/2 branches 1/5 | branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:652 | CL_ParseNuke | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:2026 calls 1/1 branches 1/5 | branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:694 | CL_ParseTEnt | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:1683 calls 11/42 branches 74/144 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:1206 | CL_AddBeams | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:537 calls 0/10 branches 1/22 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:1346 | CL_AddPlayerBeams | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:584 calls 0/17 branches 1/47 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:1596 | CL_AddExplosions | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:727 calls 0/5 branches 0/32 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/cl_tent.c:1700 | CL_AddLasers | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:628 calls 0/1 branches 1/2 | branch-count-differs |  |
| Quake-2-master/client/cl_tent.c:1713 | CL_ProcessSustain | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:1125 calls 0/1 branches 1/5 | branch-count-differs |  |
| Quake-2-master/client/cl_tent.c:1736 | CL_AddTEnts | matched-name-needs-behavior-review | packages/client/src/cl_tent.ts:507 calls 0/5 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_view.c:63 | V_ClearScene | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:325 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/client/cl_view.c:77 | V_AddEntity | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:340 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/client/cl_view.c:91 | V_AddParticle | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:363 calls 0/1 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/cl_view.c:109 | V_AddLight | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:384 calls 0/1 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/cl_view.c:130 | V_AddLightStyle | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:405 calls 0/1 branches 1/1 |  |  |
| Quake-2-master/client/cl_view.c:151 | V_TestParticles | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:424 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/client/cl_view.c:181 | V_TestEntities | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:455 calls 0/1 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/cl_view.c:213 | V_TestLights | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:485 calls 0/1 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/cl_view.c:248 | CL_PrepRefresh | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:676 calls 11/22 branches 23/14 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_view.c:363 | CalcFov | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:517 calls 2/3 branches 2/2 |  |  |
| Quake-2-master/client/cl_view.c:383 | V_Gun_Next_f | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:536 calls 0/1 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_view.c:389 | V_Gun_Prev_f | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:550 calls 0/1 branches 2/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_view.c:397 | V_Gun_Model_f | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:570 calls 0/4 branches 3/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_view.c:418 | SCR_DrawCrosshair | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:602 calls 0/2 branches 6/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_view.c:442 | V_RenderView | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:829 calls 5/18 branches 11/18 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/cl_view.c:556 | V_Viewpos_f | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:589 calls 0/1 branches 1/0 | branch-count-differs |  |
| Quake-2-master/client/cl_view.c:568 | V_Init | matched-name-needs-behavior-review | packages/client/src/cl_view.ts:639 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/console.c:35 | DrawString | matched-name-needs-behavior-review | packages/client/src/console.ts:301 calls 0/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/console.c:45 | DrawAltString | matched-name-needs-behavior-review | packages/client/src/console.ts:319 calls 0/1 branches 1/1 |  |  |
| Quake-2-master/client/console.c:56 | Key_ClearTyping | matched-name-needs-behavior-review | packages/client/src/console.ts:337 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/client/console.c:67 | Con_ToggleConsole_f | matched-name-needs-behavior-review | packages/client/src/console.ts:698 calls 6/8 branches 12/7<br>packages/client/src/console.ts:699 calls 6/8 branches 12/7<br>packages/client/src/console.ts:700 calls 6/8 branches 12/7 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/console.c:107 | Con_ToggleChat_f | matched-name-needs-behavior-review | packages/client/src/console.ts:755 calls 2/3 branches 3/3 |  |  |
| Quake-2-master/client/console.c:130 | Con_Clear_f | matched-name-needs-behavior-review | packages/client/src/console.ts:597 calls 0/1 branches 0/0<br>packages/client/src/console.ts:598 calls 0/1 branches 0/0<br>packages/client/src/console.ts:599 calls 0/1 branches 0/0 | call-count-differs<br>call-count-differs<br>call-count-differs |  |
| Quake-2-master/client/console.c:143 | Con_Dump_f | matched-name-needs-behavior-review | packages/client/src/console.ts:616 calls 3/10 branches 7/16 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/console.c:207 | Con_ClearNotify | matched-name-needs-behavior-review | packages/client/src/console.ts:652 calls 0/0 branches 0/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/console.c:221 | Con_MessageMode_f | matched-name-needs-behavior-review | packages/client/src/console.ts:665 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/client/console.c:232 | Con_MessageMode2_f | matched-name-needs-behavior-review | packages/client/src/console.ts:680 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/client/console.c:245 | Con_CheckResize | matched-name-needs-behavior-review | packages/client/src/console.ts:364 calls 1/3 branches 9/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/console.c:304 | Con_Init | matched-name-needs-behavior-review | packages/client/src/console.ts:423 calls 2/4 branches 5/0<br>packages/client/src/console.ts:424 calls 2/4 branches 5/0<br>packages/client/src/console.ts:425 calls 2/4 branches 5/0 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/console.c:332 | Con_Linefeed | matched-name-needs-behavior-review | packages/client/src/console.ts:480 calls 0/1 branches 2/1 | branch-count-differs |  |
| Quake-2-master/client/console.c:351 | Con_Print | matched-name-needs-behavior-review | packages/client/src/console.ts:505 calls 1/1 branches 18/19 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/console.c:427 | Con_CenteredPrint | matched-name-needs-behavior-review | packages/client/src/console.ts:577 calls 1/5 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/console.c:458 | Con_DrawInput | matched-name-needs-behavior-review | packages/client/src/console.ts:781 calls 0/1 branches 10/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/console.c:500 | Con_DrawNotify | matched-name-needs-behavior-review | packages/client/src/console.ts:829 calls 0/3 branches 19/14<br>packages/client/src/console.ts:830 calls 0/3 branches 19/14<br>packages/client/src/console.ts:831 calls 0/3 branches 19/14 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/console.c:569 | Con_DrawConsole | matched-name-needs-behavior-review | packages/client/src/console.ts:941 calls 1/11 branches 15/23<br>packages/client/src/console.ts:942 calls 1/11 branches 15/23<br>packages/client/src/console.ts:948 calls 1/11 branches 15/23 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/keys.c:164 | CompleteCommand | matched-name-needs-behavior-review | packages/client/src/keys.ts:478 calls 2/4 branches 4/4 | call-count-differs |  |
| Quake-2-master/client/keys.c:194 | Key_Console | matched-name-needs-behavior-review | packages/client/src/keys.ts:514 calls 1/11 branches 37/70 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/keys.c:393 | Key_Message | matched-name-needs-behavior-review | packages/client/src/keys.ts:639 calls 0/1 branches 11/13 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/keys.c:451 | Key_StringToKeynum | matched-name-needs-behavior-review | packages/client/src/keys.ts:687 calls 0/1 branches 8/8 | call-count-differs |  |
| Quake-2-master/client/keys.c:477 | Key_KeynumToString | matched-name-needs-behavior-review | packages/client/src/keys.ts:714 calls 0/0 branches 8/8 | call-count-differs |  |
| Quake-2-master/client/keys.c:504 | Key_SetBinding | matched-name-needs-behavior-review | packages/client/src/keys.ts:745 calls 0/4 branches 2/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/keys.c:532 | Key_Unbind_f | matched-name-needs-behavior-review | packages/client/src/keys.ts:763 calls 4/5 branches 6/4 | branch-count-differs |  |
| Quake-2-master/client/keys.c:552 | Key_Unbindall_f | matched-name-needs-behavior-review | packages/client/src/keys.ts:791 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/client/keys.c:567 | Key_Bind_f | matched-name-needs-behavior-review | packages/client/src/keys.ts:809 calls 4/6 branches 11/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/keys.c:614 | Key_WriteBindings | matched-name-needs-behavior-review | packages/client/src/keys.ts:854 calls 1/2 branches 2/2 |  |  |
| Quake-2-master/client/keys.c:630 | Key_Bindlist_f | matched-name-needs-behavior-review | packages/client/src/keys.ts:872 calls 1/2 branches 2/2 |  |  |
| Quake-2-master/client/keys.c:645 | Key_Init | matched-name-needs-behavior-review | packages/client/src/keys.ts:895 calls 0/1 branches 6/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/keys.c:740 | Key_Event | matched-name-needs-behavior-review | packages/client/src/keys.ts:1013 calls 3/10 branches 52/53 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/keys.c:913 | Key_ClearStates | matched-name-needs-behavior-review | packages/client/src/keys.ts:1164 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/client/keys.c:934 | Key_GetKey | matched-name-needs-behavior-review | packages/client/src/keys.ts:1193 calls 1/1 branches 6/2 | branch-count-differs |  |
| Quake-2-master/client/menu.c:75 | M_Banner | matched-name-needs-behavior-review | packages/client/src/menu-draw.ts:16 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:83 | M_PushMenu | matched-name-needs-behavior-review | packages/client/src/menu-runtime.ts:108 calls 2/4 branches 5/5 |  |  |
| Quake-2-master/client/menu.c:117 | M_ForceMenuOff | matched-name-needs-behavior-review | packages/client/src/menu-runtime.ts:147 calls 2/2 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:127 | M_PopMenu | matched-name-needs-behavior-review | packages/client/src/menu-runtime.ts:162 calls 1/3 branches 2/2 |  |  |
| Quake-2-master/client/menu.c:142 | Default_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-runtime.ts:184 calls 6/6 branches 71/71 | call-count-differs |  |
| Quake-2-master/client/menu.c:269 | M_DrawCharacter | matched-name-needs-behavior-review | packages/client/src/menu-draw.ts:31 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:274 | M_Print | matched-name-needs-behavior-review | packages/client/src/menu-draw.ts:45 calls 1/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/menu.c:284 | M_PrintWhite | matched-name-needs-behavior-review | packages/client/src/menu-draw.ts:58 calls 1/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/menu.c:294 | M_DrawPic | matched-name-needs-behavior-review | packages/client/src/menu-draw.ts:71 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:309 | M_DrawCursor | matched-name-needs-behavior-review | packages/client/src/menu-draw.ts:85 calls 2/3 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/menu.c:331 | M_DrawTextBox | matched-name-needs-behavior-review | packages/client/src/menu-draw.ts:103 calls 1/1 branches 4/4 |  |  |
| Quake-2-master/client/menu.c:385 | M_Main_Draw | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:54 calls 3/5 branches 4/4 | call-count-differs |  |
| Quake-2-master/client/menu.c:434 | M_Main_Key | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:105 calls 6/6 branches 28/25 | branch-count-differs |  |
| Quake-2-master/client/menu.c:488 | M_Menu_Main_f | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:164 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:505 | Multiplayer_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:103 calls 3/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:513 | PlayerSetupFunc | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:73 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:518 | JoinNetworkServerFunc | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:83 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:523 | StartNetworkServerFunc | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:93 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:528 | Multiplayer_MenuInit | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:116 calls 3/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:563 | Multiplayer_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:166 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/client/menu.c:568 | M_Menu_Multiplayer_f | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:176 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:640 | M_UnbindCommand | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:127 calls 1/3 branches 4/4 | call-count-differs |  |
| Quake-2-master/client/menu.c:658 | M_FindKeysForCommand | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:148 calls 0/2 branches 7/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/menu.c:684 | KeyCursorDrawFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:177 calls 0/2 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/menu.c:692 | DrawKeyBindingFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:196 calls 2/4 branches 3/3 |  |  |
| Quake-2-master/client/menu.c:722 | KeyBindingFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:224 calls 3/3 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/menu.c:737 | Keys_MenuInit | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:243 calls 3/3 branches 1/0 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/menu.c:960 | Keys_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:282 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:966 | Keys_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:294 calls 7/8 branches 14/12 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/menu.c:1001 | M_Menu_Keys_f | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:333 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:1036 | CrosshairFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:348 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1041 | JoystickFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:358 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1046 | CustomizeControlsFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:368 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1051 | AlwaysRunFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:378 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1056 | FreeLookFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:388 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1061 | MouseSpeedFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:398 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1066 | NoAltTabFunc | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/menu.c:1071 | ClampCvar | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:408 calls 0/0 branches 5/5 |  |  |
| Quake-2-master/client/menu.c:1078 | ControlsSetMenuItemValues | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:424 calls 3/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:1108 | ControlsResetDefaultsFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:459 calls 3/3 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1116 | InvertMouseFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:471 calls 1/2 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/menu.c:1128 | LookspringFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:486 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1133 | LookstrafeFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:496 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1138 | UpdateVolumeFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:506 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1143 | UpdateCDVolumeFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:516 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:1148 | ConsoleFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:526 calls 2/4 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/menu.c:1168 | UpdateSoundQualityFunc | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:545 calls 4/5 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/menu.c:1194 | Options_MenuInit | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:571 calls 3/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:1371 | Options_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:724 calls 3/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:1378 | Options_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:737 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/client/menu.c:1383 | M_Menu_Options_f | matched-name-needs-behavior-review | packages/client/src/menu-options-keys.ts:747 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:1397 | M_Menu_Video_f | matched-name-needs-behavior-review | packages/client/src/menu-misc.ts:19 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:1761 | M_Credits_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:686 calls 1/2 branches 6/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/menu.c:1804 | M_Credits_Key | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:727 calls 1/2 branches 2/5 | branch-count-differs |  |
| Quake-2-master/client/menu.c:1821 | M_Menu_Credits_f | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:747 calls 2/3 branches 6/15 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/menu.c:1893 | StartGame | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:184 calls 3/3 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1907 | EasyGameFunc | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:200 calls 2/2 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1913 | MediumGameFunc | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:211 calls 2/2 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1919 | HardGameFunc | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:222 calls 2/2 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1925 | LoadGameFunc | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:233 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1930 | SaveGameFunc | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:243 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1935 | CreditsFunc | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:253 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:1940 | Game_MenuInit | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:780 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:2009 | Game_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:870 calls 3/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:2016 | Game_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:883 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/client/menu.c:2021 | M_Menu_Game_f | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:893 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:2046 | Create_Savestrings | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:912 calls 0/6 branches 3/3 | call-count-differs |  |
| Quake-2-master/client/menu.c:2070 | LoadGameCallback | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:938 calls 2/3 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/menu.c:2079 | LoadGame_MenuInit | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:951 calls 2/2 branches 1/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/menu.c:2107 | LoadGame_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:983 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:2114 | LoadGame_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:995 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/client/menu.c:2125 | M_Menu_LoadGame_f | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:1012 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:2142 | SaveGameCallback | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:1030 calls 2/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:2150 | SaveGame_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:1041 calls 3/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:2157 | SaveGame_MenuInit | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:1054 calls 2/2 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/menu.c:2184 | SaveGame_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:1086 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/client/menu.c:2195 | M_Menu_SaveGame_f | matched-name-needs-behavior-review | packages/client/src/menu-main-game.ts:1103 calls 3/4 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/menu.c:2230 | M_AddToServerList | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:206 calls 0/2 branches 5/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/menu.c:2250 | JoinServerFunc | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:230 calls 3/5 branches 8/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/menu.c:2268 | AddressBookFunc | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:260 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:2273 | NullCursorDraw | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/menu.c:2277 | SearchLocalGames | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:270 calls 3/5 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/menu.c:2297 | SearchLocalGamesFunc | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:292 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:2302 | JoinServer_MenuInit | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:302 calls 3/4 branches 3/3 | call-count-differs |  |
| Quake-2-master/client/menu.c:2353 | JoinServer_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:369 calls 2/2 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/menu.c:2360 | JoinServer_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:384 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/client/menu.c:2365 | M_Menu_JoinServer_f | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:394 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:2392 | DMOptionsFunc | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:449 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/client/menu.c:2399 | RulesChangeFunc | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:463 calls 1/3 branches 8/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/menu.c:2436 | StartServerActionFunc | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:532 calls 5/12 branches 5/21 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/menu.c:2507 | StartServer_MenuInit | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:592 calls 6/24 branches 0/16 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/menu.c:2712 | StartServer_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:718 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:2717 | StartServer_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:729 calls 1/2 branches 2/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/menu.c:2736 | M_Menu_StartServer_f | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:745 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:2776 | DMFlagCallback | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:776 calls 3/4 branches 55/55 |  |  |
| Quake-2-master/client/menu.c:2919 | DMOptions_MenuInit | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:895 calls 6/6 branches 5/2 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/menu.c:3129 | DMOptions_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:969 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:3134 | DMOptions_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:980 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/client/menu.c:3139 | M_Menu_DMOptions_f | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:990 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:3161 | DownloadCallback | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:1005 calls 1/1 branches 9/9 |  |  |
| Quake-2-master/client/menu.c:3191 | DownloadOptions_MenuInit | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:1051 calls 2/3 branches 1/1 | call-count-differs<br>body-size-differs |  |
| Quake-2-master/client/menu.c:3261 | DownloadOptions_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:1091 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:3266 | DownloadOptions_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:1102 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/client/menu.c:3271 | M_Menu_DownloadOptions_f | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:1112 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:3288 | AddressBook_MenuInit | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:1127 calls 2/4 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/menu.c:3321 | AddressBook_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:1161 calls 2/3 branches 3/3 | call-count-differs |  |
| Quake-2-master/client/menu.c:3337 | AddressBook_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:1177 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:3343 | M_Menu_AddressBook_f | matched-name-needs-behavior-review | packages/client/src/menu-multiplayer.ts:1189 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:3387 | DownloadOptionsFunc | matched-name-needs-behavior-review | packages/client/src/menu-player-config.ts:91 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:3392 | HandednessCallback | matched-name-needs-behavior-review | packages/client/src/menu-player-config.ts:104 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/menu.c:3397 | RateCallback | matched-name-needs-behavior-review | packages/client/src/menu-player-config.ts:117 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/client/menu.c:3403 | ModelCallback | matched-name-needs-behavior-review | packages/client/src/menu-player-config.ts:132 calls 0/0 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:3409 | FreeFileList | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/menu.c:3424 | IconOfSkinExists | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/menu.c:3604 | PlayerConfig_MenuInit | matched-name-needs-behavior-review | packages/client/src/menu-player-config.ts:283 calls 5/11 branches 13/17 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/menu.c:3767 | PlayerConfig_MenuDraw | matched-name-needs-behavior-review | packages/client/src/menu-player-config.ts:454 calls 7/10 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/menu.c:3827 | PlayerConfig_MenuKey | matched-name-needs-behavior-review | packages/client/src/menu-player-config.ts:538 calls 2/4 branches 3/5 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/menu.c:3862 | M_Menu_PlayerConfig_f | matched-name-needs-behavior-review | packages/client/src/menu-player-config.ts:564 calls 3/3 branches 2/2 | call-count-differs |  |
| Quake-2-master/client/menu.c:3899 | M_Quit_Key | matched-name-needs-behavior-review | packages/client/src/menu-misc.ts:40 calls 1/2 branches 10/10 | call-count-differs |  |
| Quake-2-master/client/menu.c:3924 | M_Quit_Draw | matched-name-needs-behavior-review | packages/client/src/menu-misc.ts:69 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:3933 | M_Menu_Quit_f | matched-name-needs-behavior-review | packages/client/src/menu-misc.ts:87 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/menu.c:3949 | M_Init | matched-name-needs-behavior-review | packages/client/src/menu-runtime.ts:323 calls 0/1 branches 0/0 | call-count-differs<br>body-size-differs |  |
| Quake-2-master/client/menu.c:3975 | M_Draw | matched-name-needs-behavior-review | packages/client/src/menu-runtime.ts:383 calls 3/5 branches 5/5 |  |  |
| Quake-2-master/client/menu.c:4007 | M_Keydown | matched-name-needs-behavior-review | packages/client/src/menu-runtime.ts:414 calls 0/2 branches 1/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/qmenu.c:50 | Action_DoEnter | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:571 calls 0/1 branches 0/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/qmenu.c:56 | Action_Draw | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:587 calls 0/5 branches 2/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/qmenu.c:76 | Field_DoEnter | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:609 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/client/qmenu.c:86 | Field_Draw | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:630 calls 1/6 branches 3/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/qmenu.c:134 | Field_Key | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:802 calls 0/8 branches 29/58 | branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/qmenu.c:265 | Menu_AddItem | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:878 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/client/qmenu.c:287 | Menu_AdjustCursor | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:901 calls 1/1 branches 13/16 | branch-count-differs |  |
| Quake-2-master/client/qmenu.c:335 | Menu_Center | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:947 calls 0/0 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/qmenu.c:345 | Menu_Draw | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:993 calls 10/12 branches 30/27 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/qmenu.c:416 | Menu_DrawStatusBar | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:968 calls 0/3 branches 2/2 |  |  |
| Quake-2-master/client/qmenu.c:434 | Menu_DrawString | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1066 calls 0/2 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/qmenu.c:444 | Menu_DrawStringDark | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1082 calls 0/2 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/qmenu.c:454 | Menu_DrawStringR2L | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1098 calls 0/2 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/qmenu.c:464 | Menu_DrawStringR2LDark | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1114 calls 0/2 branches 1/1 | call-count-differs |  |
| Quake-2-master/client/qmenu.c:474 | Menu_ItemAtCursor | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1127 calls 0/0 branches 3/3 |  |  |
| Quake-2-master/client/qmenu.c:482 | Menu_SelectItem | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1144 calls 3/3 branches 12/11 | branch-count-differs |  |
| Quake-2-master/client/qmenu.c:506 | Menu_SetStatusBar | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1175 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/client/qmenu.c:511 | Menu_SlideItem | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1188 calls 3/3 branches 7/6 | branch-count-differs |  |
| Quake-2-master/client/qmenu.c:529 | Menu_TallySlots | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1214 calls 0/0 branches 7/5 | branch-count-differs |  |
| Quake-2-master/client/qmenu.c:555 | Menulist_DoEnter | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/qmenu.c:567 | MenuList_Draw | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1250 calls 0/2 branches 3/1 | branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/qmenu.c:586 | Separator_Draw | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1300 calls 0/1 branches 1/1 |  |  |
| Quake-2-master/client/qmenu.c:592 | Slider_DoSlide | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1322 calls 0/1 branches 3/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/qmenu.c:607 | Slider_Draw | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1343 calls 0/2 branches 3/3 | call-count-differs<br>body-size-differs |  |
| Quake-2-master/client/qmenu.c:628 | SpinControl_DoEnter | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/qmenu.c:638 | SpinControl_DoSlide | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1399 calls 0/1 branches 3/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/qmenu.c:651 | SpinControl_Draw | matched-name-needs-behavior-review | packages/client/src/qmenu.ts:1420 calls 0/4 branches 3/3 | call-count-differs<br>body-size-differs |  |
| Quake-2-master/client/snd_dma.c:92 | S_SoundInfo_f | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/client/snd_dma.c:116 | S_Init | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:246 calls 4/6 branches 4/4 | call-count-differs |  |
| Quake-2-master/client/snd_dma.c:164 | S_Shutdown | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:302 calls 1/4 branches 5/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_dma.c:205 | S_FindName | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:334 calls 0/5 branches 14/14 | call-count-differs |  |
| Quake-2-master/client/snd_dma.c:256 | S_AliasName | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:385 calls 0/4 branches 6/6 | call-count-differs |  |
| Quake-2-master/client/snd_dma.c:293 | S_BeginRegistration | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:419 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/client/snd_dma.c:305 | S_RegisterSound | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:433 calls 2/2 branches 6/4 | branch-count-differs |  |
| Quake-2-master/client/snd_dma.c:328 | S_EndRegistration | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:464 calls 2/4 branches 9/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_dma.c:375 | S_PickChannel | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:506 calls 0/2 branches 10/10<br>packages/client/src/snd_loc.ts:603 calls 0/2 branches 1/10 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/snd_dma.c:425 | S_SpatializeOrigin | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:558 calls 0/3 branches 0/7 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/snd_dma.c:477 | S_Spatialize | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:619 calls 1/3 branches 2/4<br>packages/client/src/snd_loc.ts:616 calls 0/3 branches 0/4 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/snd_dma.c:505 | S_AllocPlaysound | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:641 calls 0/0 branches 3/3 | call-count-differs |  |
| Quake-2-master/client/snd_dma.c:526 | S_FreePlaysound | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:657 calls 0/0 branches 0/0 | call-count-differs |  |
| Quake-2-master/client/snd_dma.c:550 | S_IssuePlaysound | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:671 calls 4/6 branches 4/5<br>packages/client/src/snd_loc.ts:572 calls 0/6 branches 0/5 | branch-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/snd_dma.c:587 | S_RegisterSexedSound | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:712 calls 3/8 branches 8/8 | call-count-differs |  |
| Quake-2-master/client/snd_dma.c:655 | S_StartSound | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:757 calls 3/4 branches 16/18 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_dma.c:738 | S_StartLocalSound | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:852 calls 2/3 branches 4/4 |  |  |
| Quake-2-master/client/snd_dma.c:760 | S_ClearBuffer | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:875 calls 2/3 branches 3/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_dma.c:785 | S_StopAllSounds | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:899 calls 1/2 branches 3/3 | call-count-differs |  |
| Quake-2-master/client/snd_dma.c:820 | S_AddLoopSounds | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:926 calls 2/2 branches 21/23 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_dma.c:910 | S_RawSamples | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:1006 calls 0/1 branches 16/25 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_dma.c:1009 | S_Update | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:1072 calls 5/8 branches 15/15 | call-count-differs |  |
| Quake-2-master/client/snd_dma.c:1082 | GetSoundtime | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:1135 calls 2/2 branches 4/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_dma.c:1112 | S_Update_ | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:1173 calls 4/5 branches 7/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_dma.c:1159 | S_Play | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:1217 calls 4/7 branches 2/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_dma.c:1181 | S_SoundList | matched-name-needs-behavior-review | packages/client/src/snd_dma.ts:1242 calls 0/1 branches 0/9 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/snd_mem.c:34 | ResampleSfx | matched-name-needs-behavior-review | packages/client/src/snd_mem.ts:79 calls 0/2 branches 11/13 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_mem.c:98 | S_LoadSound | matched-name-needs-behavior-review | packages/client/src/snd_mem.ts:149 calls 2/9 branches 9/15<br>packages/client/src/snd_loc.ts:559 calls 0/9 branches 1/15 | branch-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/snd_mem.c:190 | GetLittleShort | matched-name-needs-behavior-review | packages/client/src/snd_mem.ts:341 calls 0/0 branches 3/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_mem.c:199 | GetLittleLong | matched-name-needs-behavior-review | packages/client/src/snd_mem.ts:364 calls 0/0 branches 3/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_mem.c:210 | FindNextChunk | matched-name-needs-behavior-review | packages/client/src/snd_mem.ts:391 calls 1/2 branches 9/7 | branch-count-differs |  |
| Quake-2-master/client/snd_mem.c:238 | FindChunk | matched-name-needs-behavior-review | packages/client/src/snd_mem.ts:430 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/client/snd_mem.c:245 | DumpChunks | matched-name-needs-behavior-review | packages/client/src/snd_mem.ts:210 calls 1/4 branches 3/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_mem.c:266 | GetWavinfo | matched-name-needs-behavior-review | packages/client/src/snd_mem.ts:245 calls 4/8 branches 17/18<br>packages/client/src/snd_loc.ts:528 calls 0/8 branches 1/18 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/snd_mix.c:36 | S_WriteLinearBlastStereo16 | matched-name-needs-behavior-review | packages/client/src/snd_mix.ts:84 calls 0/0 branches 1/9 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/snd_mix.c:108 | S_TransferStereo16 | matched-name-needs-behavior-review | packages/client/src/snd_mix.ts:106 calls 1/1 branches 4/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_mix.c:143 | S_TransferPaintBuffer | matched-name-needs-behavior-review | packages/client/src/snd_mix.ts:151 calls 2/2 branches 11/15 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/client/snd_mix.c:224 | S_PaintChannels | matched-name-needs-behavior-review | packages/client/src/snd_mix.ts:212 calls 5/6 branches 25/28<br>packages/client/src/snd_loc.ts:585 calls 0/6 branches 2/28 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/client/snd_mix.c:350 | S_InitScaletable | matched-name-needs-behavior-review | packages/client/src/snd_mix.ts:301 calls 0/0 branches 3/2<br>packages/client/src/snd_loc.ts:541 calls 0/0 branches 2/2 | call-count-differs<br>branch-count-differs<br>call-count-differs |  |
| Quake-2-master/client/snd_mix.c:368 | S_PaintChannelFrom8 | matched-name-needs-behavior-review | packages/client/src/snd_mix.ts:325 calls 0/0 branches 3/3 |  |  |
| Quake-2-master/client/snd_mix.c:472 | S_PaintChannelFrom16 | matched-name-needs-behavior-review | packages/client/src/snd_mix.ts:362 calls 0/0 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/g_ai.c:50 | AI_SetSightClient | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:127 calls 0/0 branches 7/8 | branch-count-differs |  |
| Quake-2-master/game/g_ai.c:92 | ai_move | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:168 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_ai.c:106 | ai_stand | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:181 calls 7/10 branches 13/13 | call-count-differs |  |
| Quake-2-master/game/g_ai.c:163 | ai_walk | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:233 calls 4/4 branches 5/5 |  |  |
| Quake-2-master/game/g_ai.c:194 | ai_charge | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:263 calls 3/4 branches 3/1 | branch-count-differs |  |
| Quake-2-master/game/g_ai.c:215 | ai_turn | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:286 calls 3/3 branches 3/3 |  |  |
| Quake-2-master/game/g_ai.c:264 | range | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:307 calls 0/2 branches 7/7 |  |  |
| Quake-2-master/game/g_ai.c:287 | visible | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:336 calls 1/2 branches 3/3 | call-count-differs |  |
| Quake-2-master/game/g_ai.c:312 | infront | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:360 calls 1/4 branches 1/3 | branch-count-differs |  |
| Quake-2-master/game/g_ai.c:331 | HuntTarget | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:380 calls 2/5 branches 5/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_ai.c:347 | FoundTarget | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:413 calls 3/6 branches 7/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_ai.c:407 | FindTarget | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:469 calls 7/12 branches 66/68 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_ai.c:594 | FacingIdeal | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:615 calls 1/1 branches 1/3 | branch-count-differs |  |
| Quake-2-master/game/g_ai.c:607 | M_CheckAttack | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:634 calls 2/4 branches 33/33 | call-count-differs |  |
| Quake-2-master/game/g_ai.c:703 | ai_run_melee | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:720 calls 2/3 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/g_ai.c:723 | ai_run_missile | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:743 calls 2/3 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/g_ai.c:743 | ai_run_slide | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:762 calls 2/2 branches 2/4 | branch-count-differs |  |
| Quake-2-master/game/g_ai.c:771 | ai_checkattack | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:788 calls 7/12 branches 36/34 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_ai.c:914 | ai_run | matched-name-needs-behavior-review | packages/game/src/g_ai.ts:896 calls 12/17 branches 33/34 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_chase.c:22 | UpdateChaseCam | matched-name-needs-behavior-review | packages/game/src/g_chase.ts:46 calls 7/8 branches 17/13 | branch-count-differs |  |
| Quake-2-master/game/g_chase.c:111 | ChaseNext | matched-name-needs-behavior-review | packages/game/src/g_chase.ts:156 calls 0/0 branches 10/8 | branch-count-differs |  |
| Quake-2-master/game/g_chase.c:135 | ChasePrev | matched-name-needs-behavior-review | packages/game/src/g_chase.ts:196 calls 0/0 branches 10/8 | branch-count-differs |  |
| Quake-2-master/game/g_chase.c:159 | GetChaseTarget | matched-name-needs-behavior-review | packages/game/src/g_chase.ts:236 calls 1/2 branches 5/3 | branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:24 | ClientTeam | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:133 calls 1/3 branches 7/7 |  |  |
| Quake-2-master/game/g_cmds.c:49 | OnSameTeam | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:159 calls 1/3 branches 3/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:66 | SelectNextItem | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:175 calls 1/1 branches 12/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:98 | SelectPrevItem | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:215 calls 1/1 branches 12/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:130 | ValidateSelectedItem | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:255 calls 1/1 branches 4/2 | branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:152 | Cmd_Give_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:280 calls 8/13 branches 41/49 | branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:308 | Cmd_God_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:393 calls 1/1 branches 2/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:337 | Cmd_Notarget_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:407 calls 1/1 branches 2/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:364 | Cmd_Noclip_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:421 calls 1/1 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/g_cmds.c:396 | Cmd_Use_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:440 calls 4/5 branches 6/6 |  |  |
| Quake-2-master/game/g_cmds.c:432 | Cmd_Drop_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:466 calls 4/5 branches 6/6 |  |  |
| Quake-2-master/game/g_cmds.c:466 | Cmd_Inven_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:496 calls 3/3 branches 5/3 | branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:497 | Cmd_InvUse_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:529 calls 2/3 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/g_cmds.c:523 | Cmd_WeapPrev_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:556 calls 0/2 branches 0/11 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_cmds.c:559 | Cmd_WeapNext_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:573 calls 0/2 branches 0/11 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_cmds.c:595 | Cmd_WeapLast_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:588 calls 1/2 branches 4/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:622 | Cmd_InvDrop_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:613 calls 2/3 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/g_cmds.c:648 | Cmd_Kill_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:640 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/g_cmds.c:663 | Cmd_PutAway_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:662 calls 0/0 branches 2/0 | branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:671 | PlayerSort | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:683 calls 0/0 branches 1/5 | branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:693 | Cmd_Players_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:699 calls 1/5 branches 7/5 | branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:736 | Cmd_Wave_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:738 calls 3/3 branches 17/15 | branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:787 | Cmd_Say_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:790 calls 5/8 branches 17/26 | branch-count-differs |  |
| Quake-2-master/game/g_cmds.c:872 | Cmd_PlayerList_f | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:846 calls 1/4 branches 5/5 |  |  |
| Quake-2-master/game/g_cmds.c:908 | ClientCommand | matched-name-needs-behavior-review | packages/game/src/g_cmds.ts:885 calls 23/24 branches 58/58<br>packages/game/src/g_main.ts:801 calls 0/24 branches 2/58 | call-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_combat.c:32 | CanDamage | matched-name-needs-behavior-review | packages/game/src/g_combat.ts:299 calls 1/4 branches 17/17 |  |  |
| Quake-2-master/game/g_combat.c:92 | Killed | matched-name-needs-behavior-review | packages/game/src/g_combat.ts:461 calls 0/3 branches 8/8 | call-count-differs |  |
| Quake-2-master/game/g_combat.c:134 | SpawnDamage | matched-name-needs-behavior-review | packages/game/src/g_combat.ts:433 calls 0/4 branches 0/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_combat.c:171 | CheckPowerArmor | matched-name-needs-behavior-review | packages/game/src/g_combat.ts:141 calls 4/8 branches 24/24 |  |  |
| Quake-2-master/game/g_combat.c:255 | CheckArmor | matched-name-needs-behavior-review | packages/game/src/g_combat.ts:236 calls 4/4 branches 14/14 | call-count-differs |  |
| Quake-2-master/game/g_combat.c:295 | M_ReactToDamage | matched-name-needs-behavior-review | packages/game/src/g_combat.ts:510 calls 2/3 branches 24/24 | call-count-differs |  |
| Quake-2-master/game/g_combat.c:370 | CheckTeamDamage | matched-name-needs-behavior-review | packages/game/src/g_combat.ts:586 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/game/g_combat.c:377 | T_Damage | matched-name-needs-behavior-review | packages/game/src/g_combat.ts:605 calls 6/14 branches 32/39 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_combat.c:547 | T_RadiusDamage | matched-name-needs-behavior-review | packages/game/src/g_combat.ts:351 calls 3/7 branches 12/8 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_func.c:76 | Move_Done | matched-name-needs-behavior-review | packages/game/src/g_func.ts:148 calls 0/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_func.c:82 | Move_Final | matched-name-needs-behavior-review | packages/game/src/g_func.ts:162 calls 1/2 branches 2/2 |  |  |
| Quake-2-master/game/g_func.c:96 | Move_Begin | matched-name-needs-behavior-review | packages/game/src/g_func.ts:183 calls 2/3 branches 2/2 |  |  |
| Quake-2-master/game/g_func.c:114 | Move_Calc | matched-name-needs-behavior-review | packages/game/src/g_func.ts:317 calls 1/4 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/g_func.c:147 | AngleMove_Done | matched-name-needs-behavior-review | packages/game/src/g_func.ts:351 calls 0/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_func.c:153 | AngleMove_Final | matched-name-needs-behavior-review | packages/game/src/g_func.ts:365 calls 1/4 branches 2/4 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:174 | AngleMove_Begin | matched-name-needs-behavior-review | packages/game/src/g_func.ts:389 calls 2/5 branches 2/4 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:209 | AngleMove_Calc | matched-name-needs-behavior-review | packages/game/src/g_func.ts:416 calls 1/2 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/g_func.c:235 | plat_CalcAcceleratedMove | matched-name-needs-behavior-review | packages/game/src/g_func.ts:205 calls 1/2 branches 3/3 |  |  |
| Quake-2-master/game/g_func.c:263 | plat_Accelerate | matched-name-needs-behavior-review | packages/game/src/g_func.ts:234 calls 0/0 branches 13/15 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:334 | Think_AccelMove | matched-name-needs-behavior-review | packages/game/src/g_func.ts:289 calls 3/4 branches 3/3 |  |  |
| Quake-2-master/game/g_func.c:358 | plat_hit_top | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1051 calls 0/1 branches 0/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:372 | plat_hit_bottom | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1074 calls 0/1 branches 0/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:383 | plat_go_down | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1094 calls 1/2 branches 0/2 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:395 | plat_go_up | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1109 calls 1/2 branches 0/2 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:407 | plat_blocked | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1124 calls 4/4 branches 6/6 |  |  |
| Quake-2-master/game/g_func.c:428 | Use_Plat | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1151 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/g_func.c:436 | Touch_Plat_Center | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1168 calls 1/1 branches 9/7 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:451 | plat_spawn_inside_trigger | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1198 calls 0/3 branches 3/3 | call-count-differs |  |
| Quake-2-master/game/g_func.c:513 | SP_func_plat | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1260 calls 1/6 branches 12/12 | call-count-differs |  |
| Quake-2-master/game/g_func.c:595 | rotating_blocked | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1337 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:600 | rotating_touch | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1350 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/game/g_func.c:606 | rotating_use | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1365 calls 0/3 branches 3/3 | call-count-differs |  |
| Quake-2-master/game/g_func.c:623 | SP_func_rotating | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1389 calls 0/5 branches 12/13 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:692 | button_done | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1439 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:699 | button_return | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1455 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/game/g_func.c:711 | button_wait | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1473 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/game/g_func.c:726 | button_fire | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1495 calls 1/2 branches 3/3 |  |  |
| Quake-2-master/game/g_func.c:737 | button_use | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1515 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:743 | button_touch | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1530 calls 1/1 branches 2/4 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:755 | button_killed | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1548 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:763 | SP_func_button | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1567 calls 1/7 branches 9/9 | call-count-differs |  |
| Quake-2-master/game/g_func.c:852 | door_use_areaportals | matched-name-needs-behavior-review | packages/game/src/g_func.ts:441 calls 1/4 branches 6/4 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:870 | door_hit_top | matched-name-needs-behavior-review | packages/game/src/g_func.ts:475 calls 0/1 branches 3/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:888 | door_hit_bottom | matched-name-needs-behavior-review | packages/game/src/g_func.ts:504 calls 1/2 branches 0/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:900 | door_go_down | matched-name-needs-behavior-review | packages/game/src/g_func.ts:525 calls 2/4 branches 4/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:921 | door_go_up | matched-name-needs-behavior-review | packages/game/src/g_func.ts:549 calls 4/6 branches 8/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:949 | door_use | matched-name-needs-behavior-review | packages/game/src/g_func.ts:581 calls 2/2 branches 4/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:980 | Touch_DoorTrigger | matched-name-needs-behavior-review | packages/game/src/g_func.ts:611 calls 1/1 branches 9/8 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:998 | Think_CalcMoveSpeed | matched-name-needs-behavior-review | packages/game/src/g_func.ts:646 calls 0/1 branches 8/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:1038 | Think_SpawnDoorTrigger | matched-name-needs-behavior-review | packages/game/src/g_func.ts:702 calls 2/6 branches 3/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:1076 | door_blocked | matched-name-needs-behavior-review | packages/game/src/g_func.ts:745 calls 4/4 branches 8/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:1113 | door_killed | matched-name-needs-behavior-review | packages/game/src/g_func.ts:792 calls 1/1 branches 0/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:1125 | door_touch | matched-name-needs-behavior-review | packages/game/src/g_func.ts:813 calls 0/3 branches 4/4 |  |  |
| Quake-2-master/game/g_func.c:1138 | SP_func_door | matched-name-needs-behavior-review | packages/game/src/g_func.ts:846 calls 1/7 branches 15/17 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:1261 | SP_func_door_rotating | matched-name-needs-behavior-review | packages/game/src/g_func.ts:946 calls 0/9 branches 17/19 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:1378 | SP_func_water | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1631 calls 1/7 branches 6/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:1461 | train_blocked | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1688 calls 2/2 branches 5/7 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:1482 | train_wait | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1713 calls 2/4 branches 9/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:1529 | train_next | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1756 calls 3/8 branches 11/9 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:1586 | train_resume | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1809 calls 1/3 branches 2/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:1601 | func_train_find | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1835 calls 1/4 branches 6/6 | call-count-differs |  |
| Quake-2-master/game/g_func.c:1633 | train_use | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1871 calls 2/3 branches 6/6 | call-count-differs |  |
| Quake-2-master/game/g_func.c:1654 | SP_func_train | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1900 calls 1/6 branches 5/7 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:1699 | trigger_elevator_use | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1944 calls 2/3 branches 7/6 | branch-count-differs |  |
| Quake-2-master/game/g_func.c:1726 | trigger_elevator_init | matched-name-needs-behavior-review | packages/game/src/g_func.ts:1976 calls 1/3 branches 6/6 | call-count-differs |  |
| Quake-2-master/game/g_func.c:1750 | SP_trigger_elevator | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2003 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:1771 | func_timer_think | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2018 calls 2/2 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:1777 | func_timer_use | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2038 calls 1/1 branches 4/4 |  |  |
| Quake-2-master/game/g_func.c:1795 | SP_func_timer | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2066 calls 2/3 branches 3/3 | call-count-differs |  |
| Quake-2-master/game/g_func.c:1825 | func_conveyor_use | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2095 calls 0/0 branches 3/3 |  |  |
| Quake-2-master/game/g_func.c:1842 | SP_func_conveyor | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2122 calls 0/2 branches 3/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:1886 | door_secret_use | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2149 calls 2/3 branches 2/2 |  |  |
| Quake-2-master/game/g_func.c:1896 | door_secret_move1 | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2166 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:1902 | door_secret_move2 | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2180 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:1907 | door_secret_move3 | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2194 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/g_func.c:1915 | door_secret_move4 | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2211 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:1920 | door_secret_move5 | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2224 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:1926 | door_secret_move6 | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2238 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:1931 | door_secret_done | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2252 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/game/g_func.c:1941 | door_secret_blocked | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2273 calls 2/2 branches 5/5 |  |  |
| Quake-2-master/game/g_func.c:1960 | door_secret_die | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2298 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:1966 | SP_func_door_secret | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2317 calls 1/8 branches 7/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_func.c:2037 | use_killbox | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2378 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_func.c:2042 | SP_func_killbox | matched-name-needs-behavior-review | packages/game/src/g_func.ts:2394 calls 0/1 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:62 | GetItemByIndex | matched-name-needs-behavior-review | packages/game/src/g_items.ts:434 calls 0/0 branches 3/3 |  |  |
| Quake-2-master/game/g_items.c:77 | FindItemByClassname | matched-name-needs-behavior-review | packages/game/src/g_items.ts:409 calls 1/1 branches 6/6 |  |  |
| Quake-2-master/game/g_items.c:100 | FindItem | matched-name-needs-behavior-review | packages/game/src/g_items.ts:454 calls 1/1 branches 4/6 | branch-count-differs |  |
| Quake-2-master/game/g_items.c:119 | DoRespawn | matched-name-needs-behavior-review | packages/game/src/g_items.ts:699 calls 0/2 branches 2/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:146 | SetRespawn | matched-name-needs-behavior-review | packages/game/src/g_items.ts:726 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/g_items.c:159 | Pickup_Powerup | matched-name-needs-behavior-review | packages/game/src/g_items.ts:811 calls 2/3 branches 11/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:187 | Drop_General | matched-name-needs-behavior-review | packages/game/src/g_items.ts:856 calls 3/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_items.c:197 | Pickup_Adrenaline | matched-name-needs-behavior-review | packages/game/src/g_items.ts:876 calls 1/1 branches 4/4 |  |  |
| Quake-2-master/game/g_items.c:211 | Pickup_AncientHead | matched-name-needs-behavior-review | packages/game/src/g_items.ts:905 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/g_items.c:221 | Pickup_Bandolier | matched-name-needs-behavior-review | packages/game/src/g_items.ts:927 calls 1/3 branches 2/10 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_items.c:259 | Pickup_Pack | matched-name-needs-behavior-review | packages/game/src/g_items.ts:956 calls 1/3 branches 2/20 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_items.c:339 | Use_Quad | matched-name-needs-behavior-review | packages/game/src/g_items.ts:987 calls 2/4 branches 2/4 | branch-count-differs |  |
| Quake-2-master/game/g_items.c:366 | Use_Breather | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1011 calls 2/2 branches 0/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:381 | Use_Envirosuit | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1026 calls 2/2 branches 0/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:396 | Use_Invulnerability | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1041 calls 2/4 branches 0/2 | branch-count-differs |  |
| Quake-2-master/game/g_items.c:411 | Use_Silencer | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1059 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_items.c:422 | Pickup_Key | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1076 calls 1/2 branches 11/9 | branch-count-differs |  |
| Quake-2-master/game/g_items.c:447 | Add_Ammo | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1113 calls 1/1 branches 8/19 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:483 | Pickup_Ammo | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1146 calls 4/4 branches 8/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:513 | Drop_Ammo | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1183 calls 4/5 branches 2/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:541 | MegaHealth_think | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1222 calls 2/2 branches 4/4 |  |  |
| Quake-2-master/game/g_items.c:556 | Pickup_Health | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1250 calls 1/1 branches 7/9 | branch-count-differs |  |
| Quake-2-master/game/g_items.c:590 | ArmorIndex | matched-name-needs-behavior-review | packages/game/src/g_items.ts:486 calls 0/0 branches 9/9 | call-count-differs |  |
| Quake-2-master/game/g_items.c:607 | Pickup_Armor | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1286 calls 3/3 branches 21/18 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:688 | PowerArmorType | matched-name-needs-behavior-review | packages/game/src/g_items.ts:516 calls 0/0 branches 9/9 | call-count-differs |  |
| Quake-2-master/game/g_items.c:705 | Use_PowerArmor | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1358 calls 2/5 branches 5/5 |  |  |
| Quake-2-master/game/g_items.c:727 | Pickup_PowerArmor | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1393 calls 2/3 branches 6/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:747 | Drop_PowerArmor | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1425 calls 3/3 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/g_items.c:761 | Touch_Item | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1443 calls 3/7 branches 23/23 | call-count-differs |  |
| Quake-2-master/game/g_items.c:825 | drop_temp_touch | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1510 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/g_items.c:833 | drop_make_touchable | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1531 calls 0/0 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/g_items.c:843 | Drop_Item | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1553 calls 3/9 branches 3/3 | call-count-differs |  |
| Quake-2-master/game/g_items.c:892 | Use_Item | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1600 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/game/g_items.c:918 | droptofloor | matched-name-needs-behavior-review | packages/game/src/g_items.ts:747 calls 2/9 branches 8/8 | call-count-differs |  |
| Quake-2-master/game/g_items.c:993 | PrecacheItem | matched-name-needs-behavior-review | packages/game/src/g_items.ts:637 calls 2/8 branches 17/20 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:1061 | SpawnItem | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1627 calls 2/6 branches 17/18 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:2121 | SP_item_health | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1695 calls 3/4 branches 3/2 | branch-count-differs |  |
| Quake-2-master/game/g_items.c:2137 | SP_item_health_small | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1719 calls 3/4 branches 3/2 | branch-count-differs |  |
| Quake-2-master/game/g_items.c:2154 | SP_item_health_large | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1744 calls 3/4 branches 3/2 | branch-count-differs |  |
| Quake-2-master/game/g_items.c:2170 | SP_item_health_mega | matched-name-needs-behavior-review | packages/game/src/g_items.ts:1768 calls 3/4 branches 3/2 | branch-count-differs |  |
| Quake-2-master/game/g_items.c:2186 | InitItems | matched-name-needs-behavior-review | packages/game/src/g_items.ts:606 calls 0/0 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_items.c:2200 | SetItemNames | matched-name-needs-behavior-review | packages/game/src/g_items.ts:620 calls 0/3 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/g_main.c:93 | ShutdownGame | matched-name-needs-behavior-review | packages/game/src/g_main.ts:192 calls 2/2 branches 0/0 |  |  |
| Quake-2-master/game/g_main.c:110 | GetGameAPI | matched-name-needs-behavior-review | packages/game/src/g_main.ts:526 calls 0/0 branches 5/1 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_main.c:142 | Sys_Error | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/game/g_main.c:154 | Com_Printf | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/game/g_main.c:176 | ClientEndServerFrames | matched-name-needs-behavior-review | packages/game/src/g_main.ts:210 calls 1/1 branches 3/3 | call-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_main.c:200 | CreateTargetChangeLevel | matched-name-needs-behavior-review | packages/game/src/g_main.ts:379 calls 1/2 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/g_main.c:218 | EndDMLevel | matched-name-needs-behavior-review | packages/game/src/g_main.ts:396 calls 3/8 branches 9/15 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_main.c:276 | CheckDMRules | matched-name-needs-behavior-review | packages/game/src/g_main.ts:441 calls 2/2 branches 13/13 | call-count-differs |  |
| Quake-2-master/game/g_main.c:321 | ExitLevel | matched-name-needs-behavior-review | packages/game/src/g_main.ts:488 calls 2/3 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/g_main.c:353 | G_RunFrame | matched-name-needs-behavior-review | packages/game/src/g_main.ts:327 calls 7/8 branches 9/9 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:31 | Use_Areaportal | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:266 calls 0/1 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:44 | SP_func_areaportal | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:296 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:58 | VelocityForDamage | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:215 calls 2/3 branches 1/2 | branch-count-differs |  |
| Quake-2-master/game/g_misc.c:70 | ClipGibVelocity | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:235 calls 0/0 branches 0/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:92 | gib_think | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:311 calls 1/1 branches 2/1 | branch-count-differs |  |
| Quake-2-master/game/g_misc.c:104 | gib_touch | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:392 calls 2/4 branches 5/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:130 | gib_die | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:331 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:135 | ThrowGib | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:351 calls 5/10 branches 0/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:183 | ThrowHead | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:435 calls 4/8 branches 0/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:229 | ThrowClientHead | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/game/g_misc.c:281 | debris_die | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1019 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:286 | ThrowDebris | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1040 calls 3/7 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:314 | BecomeExplosion1 | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:988 calls 1/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:325 | BecomeExplosion2 | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1005 calls 1/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:342 | path_corner_touch | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:510 calls 3/6 branches 8/12 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:399 | SP_path_corner | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:562 calls 2/5 branches 2/2 |  |  |
| Quake-2-master/game/g_misc.c:422 | point_combat_touch | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:595 calls 2/5 branches 9/14 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:474 | SP_point_combat | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:643 calls 1/3 branches 2/2 |  |  |
| Quake-2-master/game/g_misc.c:493 | TH_viewthing | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:667 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:499 | SP_viewthing | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:685 calls 0/4 branches 0/1 | branch-count-differs |  |
| Quake-2-master/game/g_misc.c:519 | SP_info_null | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:713 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:528 | SP_info_notnull | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:726 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:545 | light_use | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:744 calls 0/1 branches 0/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:559 | SP_light | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:774 calls 1/2 branches 3/5 | branch-count-differs |  |
| Quake-2-master/game/g_misc.c:593 | func_wall_use | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:796 calls 1/2 branches 3/3 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:612 | SP_func_wall | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:831 calls 0/3 branches 9/9 |  |  |
| Quake-2-master/game/g_misc.c:665 | func_object_touch | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:880 calls 1/1 branches 4/6 | branch-count-differs |  |
| Quake-2-master/game/g_misc.c:677 | func_object_release | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:900 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:683 | func_object_use | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:915 calls 2/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:692 | SP_func_object | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:940 calls 0/2 branches 6/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:745 | func_explosive_explode | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1069 calls 6/11 branches 5/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:809 | func_explosive_use | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1130 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:814 | func_explosive_spawn | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1148 calls 1/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:823 | SP_func_explosive | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1172 calls 1/4 branches 10/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:873 | barrel_touch | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1224 calls 2/3 branches 2/2 |  |  |
| Quake-2-master/game/g_misc.c:887 | barrel_explode | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1243 calls 5/7 branches 3/2 | branch-count-differs |  |
| Quake-2-master/game/g_misc.c:966 | barrel_delay | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1294 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:974 | SP_misc_explobox | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1319 calls 1/4 branches 5/5 |  |  |
| Quake-2-master/game/g_misc.c:1021 | misc_blackhole_use | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1516 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:1032 | misc_blackhole_think | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1534 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/g_misc.c:1043 | SP_misc_blackhole | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1555 calls 0/3 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:1060 | misc_eastertank_think | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1578 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/g_misc.c:1071 | SP_misc_eastertank | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1599 calls 0/3 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:1088 | misc_easterchick_think | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1621 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/g_misc.c:1099 | SP_misc_easterchick | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1642 calls 0/3 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:1116 | misc_easterchick2_think | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1664 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/g_misc.c:1127 | SP_misc_easterchick2 | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1685 calls 0/3 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:1146 | commander_body_think | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1710 calls 0/2 branches 3/3 |  |  |
| Quake-2-master/game/g_misc.c:1157 | commander_body_use | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1737 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:1164 | commander_body_drop | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1764 calls 0/0 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:1170 | SP_monster_commander_body | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1781 calls 0/4 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:1196 | misc_banner_think | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1365 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:1202 | SP_misc_banner | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1383 calls 0/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:1217 | misc_deadsoldier_die | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:476 calls 2/4 branches 3/3 |  |  |
| Quake-2-master/game/g_misc.c:1230 | SP_misc_deadsoldier | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2128 calls 1/4 branches 12/12 |  |  |
| Quake-2-master/game/g_misc.c:1278 | misc_viper_use | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1809 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:1285 | SP_misc_viper | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1831 calls 2/6 branches 3/3 |  |  |
| Quake-2-master/game/g_misc.c:1316 | SP_misc_bigviper | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1494 calls 0/3 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:1330 | misc_viper_bomb_touch | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1889 calls 3/3 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:1339 | misc_viper_bomb_prethink | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1906 calls 1/2 branches 1/1 |  |  |
| Quake-2-master/game/g_misc.c:1358 | misc_viper_bomb_use | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1932 calls 0/4 branches 1/0 | branch-count-differs |  |
| Quake-2-master/game/g_misc.c:1378 | SP_misc_viper_bomb | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2504 calls 0/3 branches 1/1 |  |  |
| Quake-2-master/game/g_misc.c:1408 | misc_strogg_ship_use | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1867 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:1415 | SP_misc_strogg_ship | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2019 calls 2/6 branches 3/3 |  |  |
| Quake-2-master/game/g_misc.c:1445 | misc_satellite_dish_think | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1403 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/game/g_misc.c:1452 | misc_satellite_dish_use | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1420 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:1459 | SP_misc_satellite_dish | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1440 calls 0/3 branches 0/0 |  |  |
| Quake-2-master/game/g_misc.c:1473 | SP_light_mine1 | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1460 calls 0/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:1484 | SP_light_mine2 | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1477 calls 0/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:1496 | SP_misc_gib_arm | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2202 calls 0/3 branches 0/0 | call-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_misc.c:1517 | SP_misc_gib_leg | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2218 calls 0/3 branches 0/0 | call-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_misc.c:1538 | SP_misc_gib_head | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2234 calls 0/3 branches 0/0 | call-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_misc.c:1563 | SP_target_character | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2250 calls 0/2 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:1577 | target_string_use | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2270 calls 0/1 branches 11/11 |  |  |
| Quake-2-master/game/g_misc.c:1607 | SP_target_string | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2307 calls 0/0 branches 0/1 | branch-count-differs |  |
| Quake-2-master/game/g_misc.c:1633 | func_clock_reset | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2321 calls 0/0 branches 3/3 |  |  |
| Quake-2-master/game/g_misc.c:1648 | func_clock_format_countdown | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2341 calls 0/1 branches 5/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:1675 | func_clock_think | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2372 calls 4/9 branches 13/15 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:1740 | func_clock_use | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2434 calls 0/1 branches 3/3 |  |  |
| Quake-2-master/game/g_misc.c:1750 | SP_func_clock | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2460 calls 3/5 branches 7/7 |  |  |
| Quake-2-master/game/g_misc.c:1783 | teleporter_touch | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:1967 calls 2/9 branches 6/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_misc.c:1830 | SP_misc_teleporter | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2060 calls 1/8 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/g_misc.c:1866 | SP_misc_teleporter_dest | matched-name-needs-behavior-review | packages/game/src/g_misc.ts:2105 calls 0/3 branches 0/0 |  |  |
| Quake-2-master/game/g_monster.c:31 | monster_fire_bullet | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:134 calls 1/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:41 | monster_fire_shotgun | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:159 calls 1/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:51 | monster_fire_blaster | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:185 calls 1/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:61 | monster_fire_grenade | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:209 calls 1/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:71 | monster_fire_rocket | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:232 calls 1/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:81 | monster_fire_railgun | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:255 calls 1/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:91 | monster_fire_bfg | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:278 calls 1/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:107 | M_FliesOff | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:324 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_monster.c:113 | M_FliesOn | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:338 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/game/g_monster.c:123 | M_FlyCheck | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:358 calls 1/1 branches 4/4 |  |  |
| Quake-2-master/game/g_monster.c:135 | AttackFinished | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:380 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_monster.c:141 | M_CheckGround | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:393 calls 1/2 branches 8/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_monster.c:183 | M_CatagorizePosition | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:433 calls 1/1 branches 6/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_monster.c:218 | M_WorldEffects | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:477 calls 3/5 branches 27/29 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_monster.c:310 | M_droptofloor | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:564 calls 3/5 branches 3/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_monster.c:332 | M_SetEffects | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:595 calls 0/0 branches 7/7 |  |  |
| Quake-2-master/game/g_monster.c:361 | M_MoveFrame | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:630 calls 2/3 branches 15/14 | branch-count-differs |  |
| Quake-2-master/game/g_monster.c:419 | monster_think | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:696 calls 5/5 branches 1/1 |  |  |
| Quake-2-master/game/g_monster.c:440 | monster_use | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:719 calls 1/1 branches 12/8 | branch-count-differs |  |
| Quake-2-master/game/g_monster.c:460 | monster_triggered_spawn | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:759 calls 3/4 branches 4/2 | branch-count-differs |  |
| Quake-2-master/game/g_monster.c:483 | monster_triggered_spawn_use | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:797 calls 0/0 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:493 | monster_triggered_start | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:821 calls 0/0 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:511 | monster_death_use | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:840 calls 1/2 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:534 | monster_start | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:875 calls 3/6 branches 10/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_monster.c:583 | monster_start_go | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:948 calls 5/11 branches 17/17 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:671 | walkmonster_start_go | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:1045 calls 5/6 branches 5/5 |  |  |
| Quake-2-master/game/g_monster.c:692 | walkmonster_start | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:1082 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:699 | flymonster_start_go | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:1096 calls 4/5 branches 3/3 |  |  |
| Quake-2-master/game/g_monster.c:715 | flymonster_start | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:1127 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_monster.c:723 | swimmonster_start_go | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:1142 calls 2/2 branches 2/2 |  |  |
| Quake-2-master/game/g_monster.c:735 | swimmonster_start | matched-name-needs-behavior-review | packages/game/src/g_monster.ts:1164 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_phys.c:49 | SV_TestEntityPosition | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:97 calls 1/1 branches 3/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_phys.c:72 | SV_CheckVelocity | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:122 calls 0/0 branches 4/4 |  |  |
| Quake-2-master/game/g_phys.c:95 | SV_RunThink | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:141 calls 1/2 branches 7/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_phys.c:120 | SV_Impact | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:176 calls 1/1 branches 4/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_phys.c:145 | ClipVelocity | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:200 calls 1/1 branches 5/5 |  |  |
| Quake-2-master/game/g_phys.c:183 | SV_FlyMove | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:235 calls 4/8 branches 29/28 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_phys.c:322 | SV_AddGravity | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:365 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_phys.c:342 | SV_PushEntity | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:378 calls 2/6 branches 6/6 | call-count-differs |  |
| Quake-2-master/game/g_phys.c:403 | SV_Push | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:422 calls 2/8 branches 22/29 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_phys.c:562 | SV_Physics_Pusher | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:535 calls 2/5 branches 13/13 | call-count-differs |  |
| Quake-2-master/game/g_phys.c:630 | SV_Physics_None | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:581 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_phys.c:643 | SV_Physics_Noclip | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:594 calls 1/3 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/g_phys.c:670 | SV_Physics_Toss | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:636 calls 6/12 branches 18/21 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_phys.c:791 | SV_AddRotationalFriction | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:716 calls 0/1 branches 5/5 | call-count-differs |  |
| Quake-2-master/game/g_phys.c:815 | SV_Physics_Step | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:744 calls 7/13 branches 19/25 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_phys.c:932 | G_RunEntity | matched-name-needs-behavior-review | packages/game/src/g_phys.ts:836 calls 5/7 branches 17/16 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_save.c:152 | InitGame | matched-name-needs-behavior-review | packages/game/src/g_main.ts:277 calls 3/5 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_save.c:226 | WriteField1 | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/game/g_save.c:299 | WriteField2 | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/game/g_save.c:320 | ReadField | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/game/g_save.c:403 | WriteClient | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/game/g_save.c:434 | ReadClient | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/game/g_save.c:460 | WriteGame | matched-name-needs-behavior-review | packages/game/src/g_save.ts:415 calls 1/8 branches 1/3<br>packages/game/src/g_main.ts:845 calls 0/8 branches 0/3 | branch-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_save.c:487 | ReadGame | matched-name-needs-behavior-review | packages/game/src/g_save.ts:457 calls 1/8 branches 0/3<br>packages/game/src/g_main.ts:859 calls 0/8 branches 0/3 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_save.c:527 | WriteEdict | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/game/g_save.c:559 | WriteLevelLocals | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/game/g_save.c:591 | ReadEdict | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/game/g_save.c:610 | ReadLevelLocals | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/game/g_save.c:628 | WriteLevel | matched-name-needs-behavior-review | packages/game/src/g_save.ts:491 calls 0/6 branches 0/4<br>packages/game/src/g_main.ts:872 calls 0/6 branches 0/4 | branch-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_save.c:682 | ReadLevel | matched-name-needs-behavior-review | packages/game/src/g_save.ts:519 calls 2/11 branches 7/14<br>packages/game/src/g_main.ts:885 calls 0/11 branches 0/14 | call-count-differs<br>branch-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_spawn.c:278 | ED_CallSpawn | matched-name-needs-behavior-review | packages/game/src/g_spawn.ts:676 calls 2/4 branches 11/10 | branch-count-differs |  |
| Quake-2-master/game/g_spawn.c:319 | ED_NewString | matched-name-needs-behavior-review | packages/game/src/g_spawn.ts:725 calls 0/2 branches 4/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_spawn.c:358 | ED_ParseField | matched-name-needs-behavior-review | packages/game/src/g_spawn.ts:753 calls 0/6 branches 5/18 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_spawn.c:414 | ED_ParseEdict | matched-name-needs-behavior-review | packages/game/src/g_spawn.ts:791 calls 1/4 branches 8/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_spawn.c:470 | G_FindTeams | matched-name-needs-behavior-review | packages/game/src/g_spawn.ts:850 calls 0/2 branches 0/15 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_spawn.c:796 | SP_worldspawn | matched-name-needs-behavior-review | packages/game/src/g_spawn.ts:657 calls 0/12 branches 0/9 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_svcmds.c:24 | Svcmd_Test_f | matched-name-needs-behavior-review | packages/game/src/g_svcmds.ts:100 calls 2/2 branches 0/0 |  |  |
| Quake-2-master/game/g_svcmds.c:76 | StringToFilter | matched-name-needs-behavior-review | packages/game/src/g_svcmds.ts:114 calls 1/2 branches 12/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_svcmds.c:123 | SV_FilterPacket | matched-name-needs-behavior-review | packages/game/src/g_svcmds.ts:167 calls 0/0 branches 10/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_svcmds.c:158 | SVCmd_AddIP_f | matched-name-needs-behavior-review | packages/game/src/g_svcmds.ts:218 calls 4/4 branches 9/9 |  |  |
| Quake-2-master/game/g_svcmds.c:189 | SVCmd_RemoveIP_f | matched-name-needs-behavior-review | packages/game/src/g_svcmds.ts:253 calls 4/4 branches 8/8 |  |  |
| Quake-2-master/game/g_svcmds.c:220 | SVCmd_ListIP_f | matched-name-needs-behavior-review | packages/game/src/g_svcmds.ts:289 calls 1/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/g_svcmds.c:238 | SVCmd_WriteIP_f | matched-name-needs-behavior-review | packages/game/src/g_svcmds.ts:318 calls 2/6 branches 4/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_svcmds.c:282 | ServerCommand | matched-name-needs-behavior-review | packages/game/src/g_svcmds.ts:351 calls 7/8 branches 10/10 |  |  |
| Quake-2-master/game/g_target.c:26 | Use_Target_Tent | matched-name-needs-behavior-review | packages/game/src/g_target.ts:126 calls 0/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_target.c:34 | SP_target_temp_entity | matched-name-needs-behavior-review | packages/game/src/g_target.ts:138 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_target.c:58 | Use_Target_Speaker | matched-name-needs-behavior-review | packages/game/src/g_target.ts:154 calls 0/1 branches 2/6 | branch-count-differs |  |
| Quake-2-master/game/g_target.c:81 | SP_target_speaker | matched-name-needs-behavior-review | packages/game/src/g_target.ts:185 calls 1/7 branches 7/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_target.c:118 | Use_Target_Help | matched-name-needs-behavior-review | packages/game/src/g_target.ts:228 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/game/g_target.c:131 | SP_target_help | matched-name-needs-behavior-review | packages/game/src/g_target.ts:247 calls 1/3 branches 4/4 |  |  |
| Quake-2-master/game/g_target.c:154 | use_target_secret | matched-name-needs-behavior-review | packages/game/src/g_target.ts:279 calls 2/3 branches 0/0 |  |  |
| Quake-2-master/game/g_target.c:164 | SP_target_secret | matched-name-needs-behavior-review | packages/game/src/g_target.ts:303 calls 0/3 branches 3/4 | branch-count-differs |  |
| Quake-2-master/game/g_target.c:189 | use_target_goal | matched-name-needs-behavior-review | packages/game/src/g_target.ts:335 calls 2/4 branches 1/1 |  |  |
| Quake-2-master/game/g_target.c:202 | SP_target_goal | matched-name-needs-behavior-review | packages/game/src/g_target.ts:363 calls 0/2 branches 2/3 | branch-count-differs |  |
| Quake-2-master/game/g_target.c:227 | target_explosion_explode | matched-name-needs-behavior-review | packages/game/src/g_target.ts:392 calls 2/5 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/g_target.c:244 | use_target_explosion | matched-name-needs-behavior-review | packages/game/src/g_target.ts:412 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/g_target.c:258 | SP_target_explosion | matched-name-needs-behavior-review | packages/game/src/g_target.ts:433 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_target.c:270 | use_target_changelevel | matched-name-needs-behavior-review | packages/game/src/g_target.ts:452 calls 2/4 branches 9/10 | branch-count-differs |  |
| Quake-2-master/game/g_target.c:302 | SP_target_changelevel | matched-name-needs-behavior-review | packages/game/src/g_target.ts:498 calls 1/4 branches 3/3 |  |  |
| Quake-2-master/game/g_target.c:338 | use_target_splash | matched-name-needs-behavior-review | packages/game/src/g_target.ts:532 calls 1/5 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/g_target.c:352 | SP_target_splash | matched-name-needs-behavior-review | packages/game/src/g_target.ts:553 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/game/g_target.c:380 | use_target_spawner | matched-name-needs-behavior-review | packages/game/src/g_target.ts:578 calls 3/6 branches 2/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_target.c:396 | SP_target_spawner | matched-name-needs-behavior-review | packages/game/src/g_target.ts:606 calls 1/2 branches 1/1 |  |  |
| Quake-2-master/game/g_target.c:416 | use_target_blaster | matched-name-needs-behavior-review | packages/game/src/g_target.ts:629 calls 1/2 branches 0/4 | branch-count-differs |  |
| Quake-2-master/game/g_target.c:431 | SP_target_blaster | matched-name-needs-behavior-review | packages/game/src/g_target.ts:651 calls 1/2 branches 2/2 |  |  |
| Quake-2-master/game/g_target.c:451 | trigger_crosslevel_trigger_use | matched-name-needs-behavior-review | packages/game/src/g_target.ts:678 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/g_target.c:457 | SP_target_crosslevel_trigger | matched-name-needs-behavior-review | packages/game/src/g_target.ts:692 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_target.c:469 | target_crosslevel_target_think | matched-name-needs-behavior-review | packages/game/src/g_target.ts:711 calls 1/2 branches 1/1 |  |  |
| Quake-2-master/game/g_target.c:478 | SP_target_crosslevel_target | matched-name-needs-behavior-review | packages/game/src/g_target.ts:728 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/game/g_target.c:495 | target_laser_think | matched-name-needs-behavior-review | packages/game/src/g_target.ts:753 calls 2/11 branches 9/11 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_target.c:560 | target_laser_on | matched-name-needs-behavior-review | packages/game/src/g_target.ts:812 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/game/g_target.c:569 | target_laser_off | matched-name-needs-behavior-review | packages/game/src/g_target.ts:829 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_target.c:576 | target_laser_use | matched-name-needs-behavior-review | packages/game/src/g_target.ts:843 calls 2/2 branches 2/2 |  |  |
| Quake-2-master/game/g_target.c:585 | target_laser_start | matched-name-needs-behavior-review | packages/game/src/g_target.ts:863 calls 5/9 branches 16/18 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_target.c:642 | SP_target_laser | matched-name-needs-behavior-review | packages/game/src/g_target.ts:923 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_target.c:656 | target_lightramp_think | matched-name-needs-behavior-review | packages/game/src/g_target.ts:943 calls 0/1 branches 5/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_target.c:679 | target_lightramp_use | matched-name-needs-behavior-review | packages/game/src/g_target.ts:976 calls 3/8 branches 6/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_target.c:715 | SP_target_lightramp | matched-name-needs-behavior-review | packages/game/src/g_target.ts:1022 calls 2/5 branches 6/6 | call-count-differs |  |
| Quake-2-master/game/g_target.c:755 | target_earthquake_think | matched-name-needs-behavior-review | packages/game/src/g_target.ts:1070 calls 1/2 branches 5/9 | branch-count-differs |  |
| Quake-2-master/game/g_target.c:785 | target_earthquake_use | matched-name-needs-behavior-review | packages/game/src/g_target.ts:1108 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_target.c:793 | SP_target_earthquake | matched-name-needs-behavior-review | packages/game/src/g_target.ts:1125 calls 1/3 branches 3/3 |  |  |
| Quake-2-master/game/g_trigger.c:23 | InitTrigger | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:94 calls 2/3 branches 1/1 |  |  |
| Quake-2-master/game/g_trigger.c:36 | multi_wait | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:115 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_trigger.c:45 | multi_trigger | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:128 calls 1/1 branches 4/4 |  |  |
| Quake-2-master/game/g_trigger.c:66 | Use_Multi | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:155 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_trigger.c:72 | Touch_Multi | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:169 calls 3/4 branches 12/12 |  |  |
| Quake-2-master/game/g_trigger.c:111 | trigger_enable | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:202 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/g_trigger.c:118 | SP_trigger_multiple | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:217 calls 2/5 branches 9/9 |  |  |
| Quake-2-master/game/g_trigger.c:168 | SP_trigger_once | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:260 calls 2/4 branches 1/1 |  |  |
| Quake-2-master/game/g_trigger.c:189 | trigger_relay_use | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:285 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_trigger.c:194 | SP_trigger_relay | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:298 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_trigger.c:212 | trigger_key_use | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:312 calls 2/6 branches 20/26 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_trigger.c:282 | SP_trigger_key | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:383 calls 2/4 branches 8/8 | body-size-differs |  |
| Quake-2-master/game/g_trigger.c:326 | trigger_counter_use | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:430 calls 1/4 branches 6/6 | call-count-differs |  |
| Quake-2-master/game/g_trigger.c:352 | SP_trigger_counter | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:477 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/game/g_trigger.c:373 | SP_trigger_always | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:495 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/game/g_trigger.c:394 | trigger_push_touch | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:511 calls 0/5 branches 6/6 | call-count-differs |  |
| Quake-2-master/game/g_trigger.c:424 | SP_trigger_push | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:540 calls 1/3 branches 1/1 |  |  |
| Quake-2-master/game/g_trigger.c:455 | hurt_use | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:559 calls 0/1 branches 1/3 | branch-count-differs |  |
| Quake-2-master/game/g_trigger.c:468 | hurt_touch | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:577 calls 1/2 branches 7/10 | branch-count-differs |  |
| Quake-2-master/game/g_trigger.c:496 | SP_trigger_hurt | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:609 calls 1/3 branches 2/4 | branch-count-differs |  |
| Quake-2-master/game/g_trigger.c:532 | trigger_gravity_touch | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:635 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_trigger.c:537 | SP_trigger_gravity | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:648 calls 2/5 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/g_trigger.c:566 | trigger_monsterjump_touch | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:676 calls 0/0 branches 8/8 |  |  |
| Quake-2-master/game/g_trigger.c:586 | SP_trigger_monsterjump | matched-name-needs-behavior-review | packages/game/src/g_trigger.ts:707 calls 1/1 branches 2/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_turret.c:25 | AnglesNormalize | matched-name-needs-behavior-review | packages/game/src/g_turret.ts:90 calls 0/0 branches 4/4 |  |  |
| Quake-2-master/game/g_turret.c:37 | SnapToEights | matched-name-needs-behavior-review | packages/game/src/g_turret.ts:114 calls 0/0 branches 3/3 | call-count-differs |  |
| Quake-2-master/game/g_turret.c:48 | turret_blocked | matched-name-needs-behavior-review | packages/game/src/g_turret.ts:133 calls 1/1 branches 2/3 | branch-count-differs |  |
| Quake-2-master/game/g_turret.c:78 | turret_breach_fire | matched-name-needs-behavior-review | packages/game/src/g_turret.ts:165 calls 3/6 branches 2/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_turret.c:96 | turret_breach_think | matched-name-needs-behavior-review | packages/game/src/g_turret.ts:202 calls 6/10 branches 16/26 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_turret.c:201 | turret_breach_finish_init | matched-name-needs-behavior-review | packages/game/src/g_turret.ts:293 calls 4/6 branches 3/2 | branch-count-differs |  |
| Quake-2-master/game/g_turret.c:220 | SP_turret_breach | matched-name-needs-behavior-review | packages/game/src/g_turret.ts:324 calls 0/2 branches 3/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_turret.c:259 | SP_turret_base | matched-name-needs-behavior-review | packages/game/src/g_turret.ts:367 calls 0/2 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_turret.c:278 | turret_driver_die | matched-name-needs-behavior-review | packages/game/src/g_turret.ts:388 calls 1/1 branches 4/1 | branch-count-differs |  |
| Quake-2-master/game/g_turret.c:300 | turret_driver_think | matched-name-needs-behavior-review | packages/game/src/g_turret.ts:430 calls 3/5 branches 15/13 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_turret.c:354 | turret_driver_link | matched-name-needs-behavior-review | packages/game/src/g_turret.ts:487 calls 3/6 branches 3/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_turret.c:387 | SP_turret_driver | matched-name-needs-behavior-review | packages/game/src/g_turret.ts:541 calls 3/8 branches 4/4 |  |  |
| Quake-2-master/game/g_utils.c:25 | G_ProjectSource | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:68 calls 0/0 branches 1/0 | branch-count-differs |  |
| Quake-2-master/game/g_utils.c:45 | G_Find | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:88 calls 0/1 branches 10/10 |  |  |
| Quake-2-master/game/g_utils.c:78 | findradius | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:316 calls 0/1 branches 11/12 | branch-count-differs |  |
| Quake-2-master/game/g_utils.c:118 | G_PickTarget | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:132 calls 1/4 branches 8/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_utils.c:151 | Think_Delay | matched-name-needs-behavior-review | packages/game/src/runtime.ts:1726 calls 1/2 branches 0/0 |  |  |
| Quake-2-master/game/g_utils.c:173 | G_UseTargets | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:175 calls 2/10 branches 20/21 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/g_utils.c:266 | tv | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:363 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/game/g_utils.c:293 | vtos | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:384 calls 0/1 branches 1/1 |  |  |
| Quake-2-master/game/g_utils.c:314 | G_SetMovedir | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:401 calls 2/4 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/g_utils.c:333 | vectoyaw | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:435 calls 1/1 branches 7/7 | call-count-differs |  |
| Quake-2-master/game/g_utils.c:356 | vectoangles | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:469 calls 2/2 branches 9/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_utils.c:391 | G_CopyString | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:513 calls 0/3 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/g_utils.c:401 | G_InitEdict | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:531 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/g_utils.c:420 | G_Spawn | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:551 calls 1/2 branches 10/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_utils.c:452 | G_FreeEdict | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:589 calls 0/2 branches 2/2 |  |  |
| Quake-2-master/game/g_utils.c:475 | G_TouchTriggers | matched-name-needs-behavior-review | packages/game/src/touch.ts:35 calls 2/2 branches 9/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_utils.c:508 | G_TouchSolids | matched-name-needs-behavior-review | packages/game/src/touch.ts:76 calls 1/2 branches 8/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_utils.c:549 | KillBox | matched-name-needs-behavior-review | packages/game/src/g_utils.ts:613 calls 1/2 branches 10/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:32 | check_dodge | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:1115 calls 4/7 branches 7/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:63 | fire_hit | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:174 calls 2/7 branches 18/14 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:134 | fire_lead | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:1162 calls 6/20 branches 16/22 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:277 | fire_bullet | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:574 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/g_weapon.c:290 | fire_shotgun | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:598 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/game/g_weapon.c:306 | blaster_touch | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:697 calls 1/7 branches 7/11 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:345 | fire_blaster | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:269 calls 3/13 branches 5/3 | branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:398 | Grenade_Explode | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:839 calls 1/11 branches 8/14 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:455 | Grenade_Touch | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:743 calls 2/5 branches 8/10 | branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:486 | fire_grenade | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:339 calls 1/11 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:519 | fire_grenade2 | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:395 calls 2/14 branches 3/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:569 | rocket_touch | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:785 calls 2/10 branches 9/12 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:620 | fire_rocket | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:460 calls 1/9 branches 2/1 | branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:658 | fire_rail | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:628 calls 2/8 branches 12/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:721 | bfg_explode | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:898 calls 3/11 branches 16/12 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:765 | bfg_touch | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:957 calls 1/12 branches 6/6 |  |  |
| Quake-2-master/game/g_weapon.c:804 | bfg_think | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:1015 calls 2/12 branches 15/17 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/g_weapon.c:882 | fire_bfg | matched-name-needs-behavior-review | packages/game/src/g_weapon.ts:519 calls 1/9 branches 2/1 | branch-count-differs |  |
| Quake-2-master/game/m_actor.c:87 | actor_stand | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:675 calls 0/1 branches 1/1 |  |  |
| Quake-2-master/game/m_actor.c:113 | actor_walk | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:693 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_actor.c:136 | actor_run | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:706 calls 2/2 branches 6/6 |  |  |
| Quake-2-master/game/m_actor.c:230 | actor_pain | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:737 calls 2/5 branches 9/11 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_actor.c:269 | actorMachineGun | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:781 calls 3/7 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/m_actor.c:299 | actor_dead | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:821 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_actor.c:339 | actor_die | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:839 calls 2/3 branches 6/8 | branch-count-differs |  |
| Quake-2-master/game/m_actor.c:372 | actor_fire | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:876 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/m_actor.c:391 | actor_attack | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:898 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_actor.c:401 | actor_use | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:913 calls 3/8 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/m_actor.c:425 | SP_misc_actor | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:949 calls 3/7 branches 7/7 |  |  |
| Quake-2-master/game/m_actor.c:496 | target_actor_touch | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:1018 calls 5/10 branches 22/22 |  |  |
| Quake-2-master/game/m_actor.c:585 | SP_target_actor | matched-name-needs-behavior-review | packages/game/src/m_actor.ts:1112 calls 2/5 branches 5/5 | call-count-differs |  |
| Quake-2-master/game/m_berserk.c:39 | berserk_sight | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:345 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_berserk.c:44 | berserk_search | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:363 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_berserk.c:61 | berserk_stand | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:393 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_berserk.c:91 | berserk_fidget | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:417 calls 1/2 branches 4/4 |  |  |
| Quake-2-master/game/m_berserk.c:120 | berserk_walk | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:453 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_berserk.c:161 | berserk_run | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:474 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_berserk.c:170 | berserk_attack_spike | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:494 calls 1/2 branches 0/0 |  |  |
| Quake-2-master/game/m_berserk.c:177 | berserk_swing | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:508 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_berserk.c:196 | berserk_attack_club | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:541 calls 1/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_berserk.c:222 | berserk_strike | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:570 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_berserk.c:249 | berserk_melee | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:597 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/game/m_berserk.c:315 | berserk_pain | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:633 calls 1/2 branches 7/7 |  |  |
| Quake-2-master/game/m_berserk.c:336 | berserk_dead | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:676 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_berserk.c:381 | berserk_die | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:710 calls 2/4 branches 8/8 |  |  |
| Quake-2-master/game/m_berserk.c:413 | SP_monster_berserk | matched-name-needs-behavior-review | packages/game/src/m_berserk.ts:759 calls 2/6 branches 2/2 |  |  |
| Quake-2-master/game/m_boss2.c:41 | boss2_search | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:327 calls 1/2 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/m_boss2.c:55 | Boss2Rocket | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:345 calls 1/6 branches 2/0 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/m_boss2.c:97 | boss2_firebullet_right | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:366 calls 0/6 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss2.c:113 | boss2_firebullet_left | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:379 calls 0/6 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss2.c:130 | Boss2MachineGun | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:395 calls 2/2 branches 0/0 |  |  |
| Quake-2-master/game/m_boss2.c:414 | boss2_stand | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:513 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_boss2.c:419 | boss2_run | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:526 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_boss2.c:427 | boss2_walk | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:543 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_boss2.c:432 | boss2_attack | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:560 calls 1/3 branches 4/4 |  |  |
| Quake-2-master/game/m_boss2.c:453 | boss2_attack_mg | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:582 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_boss2.c:458 | boss2_reattack_mg | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:599 calls 2/2 branches 2/4 | branch-count-differs |  |
| Quake-2-master/game/m_boss2.c:470 | boss2_pain | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:620 calls 0/1 branches 7/7 | call-count-differs |  |
| Quake-2-master/game/m_boss2.c:497 | boss2_dead | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:657 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_boss2.c:507 | boss2_die | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:675 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss2.c:540 | Boss2_CheckAttack | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:704 calls 4/7 branches 28/28 | call-count-differs |  |
| Quake-2-master/game/m_boss2.c:636 | SP_monster_boss2 | matched-name-needs-behavior-review | packages/game/src/m_boss2.ts:780 calls 2/6 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/m_boss3.c:31 | Use_Boss3 | matched-name-needs-behavior-review | packages/game/src/m_boss3.ts:55 calls 1/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss3.c:40 | Think_Boss3Stand | matched-name-needs-behavior-review | packages/game/src/m_boss3.ts:74 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_boss3.c:53 | SP_monster_boss3_stand | matched-name-needs-behavior-review | packages/game/src/m_boss3.ts:92 calls 1/5 branches 2/2 |  |  |
| Quake-2-master/game/m_boss31.c:53 | jorg_search | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:316 calls 1/2 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/m_boss31.c:139 | jorg_idle | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:337 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss31.c:144 | jorg_death_hit | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:350 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss31.c:150 | jorg_step_left | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:363 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss31.c:155 | jorg_step_right | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:376 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss31.c:161 | jorg_stand | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:404 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_boss31.c:229 | jorg_walk | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:453 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_boss31.c:234 | jorg_run | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:466 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_boss31.c:394 | jorg_reattack1 | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:562 calls 2/2 branches 4/4 |  |  |
| Quake-2-master/game/m_boss31.c:411 | jorg_attack1 | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:585 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_boss31.c:416 | jorg_pain | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:601 calls 1/2 branches 18/22 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_boss31.c:475 | jorgBFG | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:661 calls 3/7 branches 2/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_boss31.c:501 | jorg_firebullet_right | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:685 calls 0/6 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss31.c:517 | jorg_firebullet_left | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:698 calls 0/6 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss31.c:533 | jorg_firebullet | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:711 calls 2/2 branches 0/0 |  |  |
| Quake-2-master/game/m_boss31.c:539 | jorg_attack | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:737 calls 1/5 branches 4/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_boss31.c:560 | jorg_dead | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:761 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_boss31.c:589 | jorg_die | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:774 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss31.c:599 | Jorg_CheckAttack | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:798 calls 4/7 branches 26/28 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_boss31.c:696 | SP_monster_jorg | matched-name-needs-behavior-review | packages/game/src/m_boss31.ts:874 calls 3/7 branches 2/2 |  |  |
| Quake-2-master/game/m_boss32.c:56 | makron_taunt | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:641 calls 1/2 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/m_boss32.c:138 | makron_stand | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:670 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_boss32.c:158 | makron_hit | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:695 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss32.c:163 | makron_popup | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:708 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss32.c:168 | makron_step_left | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:721 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss32.c:173 | makron_step_right | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:734 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss32.c:178 | makron_brainsplorch | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:747 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss32.c:183 | makron_prerailgun | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:760 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss32.c:204 | makron_walk | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:789 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_boss32.c:209 | makron_run | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:802 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_boss32.c:410 | makronBFG | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:896 calls 3/7 branches 2/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_boss32.c:494 | MakronSaveloc | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:957 calls 0/1 branches 2/0 | branch-count-differs |  |
| Quake-2-master/game/m_boss32.c:501 | MakronRailgun | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:978 calls 3/5 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_boss32.c:518 | MakronHyperblaster | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:998 calls 4/6 branches 3/4 | branch-count-differs |  |
| Quake-2-master/game/m_boss32.c:555 | makron_pain | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:1035 calls 1/2 branches 14/16 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_boss32.c:601 | makron_sight | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:1088 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_boss32.c:606 | makron_attack | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:1105 calls 1/3 branches 6/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_boss32.c:632 | makron_torso_think | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:1132 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_boss32.c:643 | makron_torso | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:1154 calls 0/4 branches 0/0 |  |  |
| Quake-2-master/game/m_boss32.c:662 | makron_dead | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:1179 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_boss32.c:673 | makron_die | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:1201 calls 4/7 branches 5/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_boss32.c:711 | Makron_CheckAttack | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:1254 calls 4/7 branches 26/28 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_boss32.c:808 | MakronPrecache | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:1327 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_boss32.c:830 | SP_monster_makron | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:1355 calls 3/6 branches 2/2 |  |  |
| Quake-2-master/game/m_boss32.c:877 | MakronSpawn | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:1401 calls 2/5 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/m_boss32.c:904 | MakronToss | matched-name-needs-behavior-review | packages/game/src/m_boss32.ts:1427 calls 1/2 branches 0/0 |  |  |
| Quake-2-master/game/m_brain.c:48 | brain_sight | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:323 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_brain.c:53 | brain_search | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:335 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_brain.c:104 | brain_stand | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:355 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_brain.c:151 | brain_idle | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:375 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_brain.c:234 | brain_walk | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:401 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_brain.c:313 | brain_duck_down | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:444 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/game/m_brain.c:323 | brain_duck_hold | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:461 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_brain.c:331 | brain_duck_up | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:476 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_brain.c:352 | brain_dodge | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:508 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/game/m_brain.c:403 | brain_swing_right | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:544 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_brain.c:408 | brain_hit_right | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:556 calls 1/4 branches 1/1 |  |  |
| Quake-2-master/game/m_brain.c:417 | brain_swing_left | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:570 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_brain.c:422 | brain_hit_left | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:582 calls 1/4 branches 1/1 |  |  |
| Quake-2-master/game/m_brain.c:454 | brain_chest_open | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:614 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_brain.c:461 | brain_tentacle_attack | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:628 calls 1/4 branches 1/1 |  |  |
| Quake-2-master/game/m_brain.c:471 | brain_chest_closed | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:644 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/game/m_brain.c:503 | brain_melee | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:676 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/m_brain.c:532 | brain_run | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:700 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_brain.c:542 | brain_pain | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:717 calls 1/2 branches 9/9 | call-count-differs |  |
| Quake-2-master/game/m_brain.c:574 | brain_dead | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:757 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_brain.c:586 | brain_die | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:774 calls 3/5 branches 8/8 | call-count-differs |  |
| Quake-2-master/game/m_brain.c:621 | SP_monster_brain | matched-name-needs-behavior-review | packages/game/src/m_brain.ts:819 calls 2/6 branches 2/2 |  |  |
| Quake-2-master/game/m_chick.c:56 | ChickMoan | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:409 calls 1/2 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/m_chick.c:99 | chick_fidget | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:443 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/game/m_chick.c:143 | chick_stand | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:476 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_chick.c:196 | chick_walk | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:516 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_chick.c:201 | chick_run | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:532 calls 0/0 branches 4/4 |  |  |
| Quake-2-master/game/m_chick.c:266 | chick_pain | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:584 calls 1/2 branches 13/13 | call-count-differs |  |
| Quake-2-master/game/m_chick.c:297 | chick_dead | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:635 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_chick.c:353 | chick_die | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:673 calls 2/5 branches 8/8 | call-count-differs |  |
| Quake-2-master/game/m_chick.c:391 | chick_duck_down | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:721 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/game/m_chick.c:402 | chick_duck_hold | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:741 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_chick.c:410 | chick_duck_up | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:761 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_chick.c:430 | chick_dodge | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:796 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/game/m_chick.c:441 | ChickSlash | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:820 calls 1/4 branches 1/0 | branch-count-differs |  |
| Quake-2-master/game/m_chick.c:451 | ChickRocket | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:841 calls 3/6 branches 2/0 | branch-count-differs |  |
| Quake-2-master/game/m_chick.c:469 | Chick_PreAttack1 | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:867 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_chick.c:474 | ChickReload | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:883 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_chick.c:529 | chick_rerocket | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:934 calls 3/3 branches 2/5 | branch-count-differs |  |
| Quake-2-master/game/m_chick.c:544 | chick_attack1 | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:961 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_chick.c:573 | chick_reslash | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:1000 calls 2/2 branches 4/6 | branch-count-differs |  |
| Quake-2-master/game/m_chick.c:592 | chick_slash | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:1026 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_chick.c:608 | chick_melee | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:1050 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_chick.c:614 | chick_attack | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:1066 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_chick.c:619 | chick_sight | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:1082 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_chick.c:626 | SP_monster_chick | matched-name-needs-behavior-review | packages/game/src/m_chick.ts:1099 calls 2/6 branches 2/2 |  |  |
| Quake-2-master/game/m_flipper.c:51 | flipper_stand | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:252 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flipper.c:89 | flipper_run_loop | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:273 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flipper.c:105 | flipper_run | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:294 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flipper.c:140 | flipper_walk | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:315 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flipper.c:155 | flipper_start_run | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:340 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flipper.c:180 | flipper_bite | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:369 calls 1/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_flipper.c:188 | flipper_preattack | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:383 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_flipper.c:218 | flipper_melee | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:417 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flipper.c:223 | flipper_pain | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:430 calls 0/2 branches 7/7 |  |  |
| Quake-2-master/game/m_flipper.c:251 | flipper_dead | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:480 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_flipper.c:327 | flipper_sight | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:506 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_flipper.c:332 | flipper_die | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:524 calls 2/4 branches 6/6 |  |  |
| Quake-2-master/game/m_flipper.c:361 | SP_monster_flipper | matched-name-needs-behavior-review | packages/game/src/m_flipper.ts:568 calls 2/6 branches 2/2 |  |  |
| Quake-2-master/game/m_float.c:41 | floater_sight | matched-name-needs-behavior-review | packages/game/src/m_float.ts:381 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_float.c:46 | floater_idle | matched-name-needs-behavior-review | packages/game/src/m_float.ts:399 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_float.c:60 | floater_fire_blaster | matched-name-needs-behavior-review | packages/game/src/m_float.ts:417 calls 3/5 branches 2/2 |  |  |
| Quake-2-master/game/m_float.c:197 | floater_stand | matched-name-needs-behavior-review | packages/game/src/m_float.ts:457 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/m_float.c:502 | floater_run | matched-name-needs-behavior-review | packages/game/src/m_float.ts:574 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_float.c:510 | floater_walk | matched-name-needs-behavior-review | packages/game/src/m_float.ts:591 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_float.c:515 | floater_wham | matched-name-needs-behavior-review | packages/game/src/m_float.ts:604 calls 1/3 branches 0/0 |  |  |
| Quake-2-master/game/m_float.c:522 | floater_zap | matched-name-needs-behavior-review | packages/game/src/m_float.ts:624 calls 3/11 branches 2/0 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/m_float.c:551 | floater_attack | matched-name-needs-behavior-review | packages/game/src/m_float.ts:670 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_float.c:557 | floater_melee | matched-name-needs-behavior-review | packages/game/src/m_float.ts:683 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/m_float.c:566 | floater_pain | matched-name-needs-behavior-review | packages/game/src/m_float.ts:700 calls 0/2 branches 7/7 |  |  |
| Quake-2-master/game/m_float.c:593 | floater_dead | matched-name-needs-behavior-review | packages/game/src/m_float.ts:749 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_float.c:603 | floater_die | matched-name-needs-behavior-review | packages/game/src/m_float.ts:767 calls 1/2 branches 0/0 |  |  |
| Quake-2-master/game/m_float.c:611 | SP_monster_floater | matched-name-needs-behavior-review | packages/game/src/m_float.ts:792 calls 3/7 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/m_flyer.c:52 | flyer_sight | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:421 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:57 | flyer_idle | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:439 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:62 | flyer_pop_blades | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:457 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:219 | flyer_run | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:475 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_flyer.c:227 | flyer_walk | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:492 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:232 | flyer_stand | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:505 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:260 | flyer_stop | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:518 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:265 | flyer_start | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:531 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:367 | flyer_fire | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:544 calls 3/5 branches 2/2 |  |  |
| Quake-2-master/game/m_flyer.c:389 | flyer_fireleft | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:573 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:394 | flyer_fireright | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:586 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:423 | flyer_slash_left | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:599 calls 1/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_flyer.c:432 | flyer_slash_right | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:619 calls 1/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_flyer.c:479 | flyer_loop_melee | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:639 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:489 | flyer_attack | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:652 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:497 | flyer_setstart | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:665 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:503 | flyer_nextmove | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:679 calls 0/0 branches 5/5 |  |  |
| Quake-2-master/game/m_flyer.c:513 | flyer_melee | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:698 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:520 | flyer_check_melee | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:714 calls 2/2 branches 4/4 |  |  |
| Quake-2-master/game/m_flyer.c:531 | flyer_pain | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:735 calls 0/2 branches 9/9 |  |  |
| Quake-2-master/game/m_flyer.c:564 | flyer_die | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:792 calls 1/2 branches 0/0 |  |  |
| Quake-2-master/game/m_flyer.c:573 | SP_monster_flyer | matched-name-needs-behavior-review | packages/game/src/m_flyer.ts:817 calls 2/7 branches 3/3 | call-count-differs |  |
| Quake-2-master/game/m_gladiator.c:44 | gladiator_idle | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:192 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_gladiator.c:49 | gladiator_sight | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:210 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_gladiator.c:54 | gladiator_search | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:228 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_gladiator.c:59 | gladiator_cleaver_swing | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:246 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_gladiator.c:76 | gladiator_stand | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:272 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_gladiator.c:103 | gladiator_walk | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:293 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_gladiator.c:120 | gladiator_run | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:314 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_gladiator.c:129 | GaldiatorMelee | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:331 calls 1/4 branches 0/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_gladiator.c:162 | gladiator_melee | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:368 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_gladiator.c:168 | GladiatorGun | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:381 calls 3/5 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_gladiator.c:198 | gladiator_attack | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:410 calls 0/4 branches 4/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_gladiator.c:240 | gladiator_pain | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:459 calls 1/2 branches 10/10 | body-size-differs |  |
| Quake-2-master/game/m_gladiator.c:271 | gladiator_dead | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:515 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_gladiator.c:308 | gladiator_die | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:541 calls 2/4 branches 6/6 |  |  |
| Quake-2-master/game/m_gladiator.c:339 | SP_monster_gladiator | matched-name-needs-behavior-review | packages/game/src/m_gladiator.ts:585 calls 2/6 branches 2/2 |  |  |
| Quake-2-master/game/m_gunner.c:41 | gunner_idlesound | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:297 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_gunner.c:46 | gunner_sight | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:301 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_gunner.c:51 | gunner_search | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:305 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_gunner.c:124 | gunner_fidget | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:329 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/game/m_gunner.c:169 | gunner_stand | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:354 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_gunner.c:193 | gunner_walk | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:366 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_gunner.c:212 | gunner_run | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:378 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_gunner.c:232 | gunner_runandshoot | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:394 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_gunner.c:283 | gunner_pain | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:422 calls 0/2 branches 11/11 | call-count-differs |  |
| Quake-2-master/game/m_gunner.c:309 | gunner_dead | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:458 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_gunner.c:335 | gunner_die | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:475 calls 2/4 branches 6/6 | call-count-differs |  |
| Quake-2-master/game/m_gunner.c:363 | gunner_duck_down | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:513 calls 2/3 branches 3/4 | branch-count-differs |  |
| Quake-2-master/game/m_gunner.c:380 | gunner_duck_hold | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:528 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_gunner.c:388 | gunner_duck_up | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:536 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_gunner.c:409 | gunner_dodge | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:568 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/game/m_gunner.c:421 | gunner_opengun | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:580 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_gunner.c:426 | GunnerFire | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:584 calls 3/7 branches 2/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_gunner.c:449 | GunnerGrenade | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:610 calls 3/4 branches 6/6 |  |  |
| Quake-2-master/game/m_gunner.c:547 | gunner_attack | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:685 calls 2/2 branches 4/4 |  |  |
| Quake-2-master/game/m_gunner.c:562 | gunner_fire_chain | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:695 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_gunner.c:567 | gunner_refire_chain | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:707 calls 2/2 branches 2/4 | branch-count-differs |  |
| Quake-2-master/game/m_gunner.c:581 | SP_monster_gunner | matched-name-needs-behavior-review | packages/game/src/m_gunner.ts:715 calls 2/6 branches 2/2 |  |  |
| Quake-2-master/game/m_hover.c:43 | hover_sight | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:310 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_hover.c:48 | hover_search | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:331 calls 1/2 branches 0/2 | branch-count-differs |  |
| Quake-2-master/game/m_hover.c:421 | hover_reattack | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:493 calls 2/2 branches 2/4 | branch-count-differs |  |
| Quake-2-master/game/m_hover.c:434 | hover_fire_blaster | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:510 calls 3/5 branches 2/2 |  |  |
| Quake-2-master/game/m_hover.c:458 | hover_stand | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:534 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_hover.c:463 | hover_run | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:547 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_hover.c:471 | hover_walk | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:564 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_hover.c:476 | hover_start_attack | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:577 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_hover.c:481 | hover_attack | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:590 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_hover.c:487 | hover_pain | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:606 calls 1/2 branches 9/9 |  |  |
| Quake-2-master/game/m_hover.c:520 | hover_deadthink | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:665 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/m_hover.c:530 | hover_dead | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:682 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_hover.c:541 | hover_die | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:704 calls 3/5 branches 6/8 | branch-count-differs |  |
| Quake-2-master/game/m_hover.c:573 | SP_monster_hover | matched-name-needs-behavior-review | packages/game/src/m_hover.ts:750 calls 2/6 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/m_infantry.c:75 | infantry_stand | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:341 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_infantry.c:135 | infantry_fidget | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:364 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_infantry.c:158 | infantry_walk | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:390 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_infantry.c:176 | infantry_run | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:410 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_infantry.c:215 | infantry_pain | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:440 calls 0/2 branches 7/7 | call-count-differs |  |
| Quake-2-master/game/m_infantry.c:260 | InfantryMachineGun | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:476 calls 3/6 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/m_infantry.c:299 | infantry_sight | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:523 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_infantry.c:304 | infantry_dead | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:535 calls 1/3 branches 0/0 |  |  |
| Quake-2-master/game/m_infantry.c:386 | infantry_die | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:593 calls 2/5 branches 10/10 | call-count-differs |  |
| Quake-2-master/game/m_infantry.c:429 | infantry_duck_down | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:640 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/game/m_infantry.c:440 | infantry_duck_hold | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:658 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_infantry.c:448 | infantry_duck_up | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:673 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_infantry.c:466 | infantry_dodge | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:703 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/game/m_infantry.c:478 | infantry_cock_gun | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:723 calls 0/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_infantry.c:487 | infantry_fire | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:736 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/m_infantry.c:518 | infantry_swing | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:768 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_infantry.c:523 | infantry_smack | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:780 calls 1/4 branches 1/1 |  |  |
| Quake-2-master/game/m_infantry.c:545 | infantry_attack | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:809 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/m_infantry.c:556 | SP_monster_infantry | matched-name-needs-behavior-review | packages/game/src/m_infantry.ts:825 calls 2/6 branches 2/2 |  |  |
| Quake-2-master/game/m_insane.c:37 | insane_fist | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:372 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_insane.c:42 | insane_shake | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:390 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_insane.c:47 | insane_moan | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:408 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_insane.c:52 | insane_scream | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:426 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_insane.c:434 | insane_cross | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:641 calls 1/1 branches 0/2 | branch-count-differs |  |
| Quake-2-master/game/m_insane.c:442 | insane_walk | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:657 calls 1/1 branches 6/7 | branch-count-differs |  |
| Quake-2-master/game/m_insane.c:459 | insane_run | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:684 calls 1/1 branches 6/7 | branch-count-differs |  |
| Quake-2-master/game/m_insane.c:477 | insane_pain | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:708 calls 0/4 branches 14/14 | call-count-differs |  |
| Quake-2-master/game/m_insane.c:519 | insane_onground | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:760 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_insane.c:524 | insane_checkdown | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:776 calls 1/1 branches 3/5 | branch-count-differs |  |
| Quake-2-master/game/m_insane.c:536 | insane_checkup | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:797 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/game/m_insane.c:546 | insane_stand | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:818 calls 1/1 branches 6/6 |  |  |
| Quake-2-master/game/m_insane.c:563 | insane_dead | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:840 calls 0/2 branches 2/2 |  |  |
| Quake-2-master/game/m_insane.c:581 | insane_die | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:862 calls 3/7 branches 10/10 | call-count-differs |  |
| Quake-2-master/game/m_insane.c:621 | SP_misc_insane | matched-name-needs-behavior-review | packages/game/src/m_insane.ts:908 calls 3/8 branches 5/5 |  |  |
| Quake-2-master/game/m_medic.c:46 | medic_FindDeadMonster | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:361 calls 1/2 branches 21/20 | branch-count-differs |  |
| Quake-2-master/game/m_medic.c:80 | medic_idle | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:407 calls 2/3 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/m_medic.c:96 | medic_search | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:426 calls 2/3 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/m_medic.c:116 | medic_sight | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:448 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_medic.c:218 | medic_stand | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:467 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_medic.c:241 | medic_walk | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:486 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_medic.c:259 | medic_run | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:505 calls 2/2 branches 5/5 |  |  |
| Quake-2-master/game/m_medic.c:317 | medic_pain | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:549 calls 1/2 branches 7/7 | call-count-differs |  |
| Quake-2-master/game/m_medic.c:342 | medic_fire_blaster | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:587 calls 3/5 branches 5/4 | branch-count-differs |  |
| Quake-2-master/game/m_medic.c:368 | medic_dead | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:620 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_medic.c:413 | medic_die | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:645 calls 2/4 branches 7/7 | call-count-differs |  |
| Quake-2-master/game/m_medic.c:446 | medic_duck_down | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:686 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/game/m_medic.c:457 | medic_duck_hold | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:704 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_medic.c:465 | medic_duck_up | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:719 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_medic.c:494 | medic_dodge | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:750 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/game/m_medic.c:527 | medic_continue | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:795 calls 2/2 branches 1/2 | branch-count-differs |  |
| Quake-2-master/game/m_medic.c:555 | medic_hook_launch | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:826 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_medic.c:576 | medic_cable_attack | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:857 calls 7/17 branches 16/16 | call-count-differs |  |
| Quake-2-master/game/m_medic.c:656 | medic_hook_retract | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:930 calls 0/1 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_medic.c:696 | medic_attack | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:976 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_medic.c:704 | medic_checkattack | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:993 calls 2/2 branches 3/3 |  |  |
| Quake-2-master/game/m_medic.c:718 | SP_monster_medic | matched-name-needs-behavior-review | packages/game/src/m_medic.ts:1016 calls 2/6 branches 2/2 |  |  |
| Quake-2-master/game/m_move.c:37 | M_CheckBottom | matched-name-needs-behavior-review | packages/game/src/m_move.ts:62 calls 1/3 branches 5/12 | branch-count-differs |  |
| Quake-2-master/game/m_move.c:112 | SV_movestep | matched-name-needs-behavior-review | packages/game/src/m_move.ts:101 calls 3/7 branches 48/52 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_move.c:304 | M_ChangeYaw | matched-name-needs-behavior-review | packages/game/src/m_move.ts:271 calls 1/1 branches 10/10 |  |  |
| Quake-2-master/game/m_move.c:353 | SV_StepDirection | matched-name-needs-behavior-review | packages/game/src/m_move.ts:311 calls 4/7 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/m_move.c:389 | SV_FixCheckBottom | matched-name-needs-behavior-review | packages/game/src/m_move.ts:341 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_move.c:403 | SV_NewChaseDir | matched-name-needs-behavior-review | packages/game/src/m_move.ts:354 calls 5/6 branches 29/33 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_move.c:495 | SV_CloseEnough | matched-name-needs-behavior-review | packages/game/src/m_move.ts:439 calls 0/0 branches 6/6 |  |  |
| Quake-2-master/game/m_move.c:515 | M_MoveToGoal | matched-name-needs-behavior-review | packages/game/src/m_move.ts:460 calls 3/4 branches 6/6 |  |  |
| Quake-2-master/game/m_move.c:542 | M_walkmove | matched-name-needs-behavior-review | packages/game/src/m_move.ts:487 calls 3/3 branches 3/3 |  |  |
| Quake-2-master/game/m_mutant.c:50 | mutant_step | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:264 calls 0/2 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/m_mutant.c:62 | mutant_sight | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:284 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_mutant.c:67 | mutant_search | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:297 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_mutant.c:72 | mutant_swing | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:310 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_mutant.c:143 | mutant_stand | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:331 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_mutant.c:153 | mutant_idle_loop | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:347 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/game/m_mutant.c:177 | mutant_idle | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:370 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_mutant.c:207 | mutant_walk_loop | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:397 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_mutant.c:221 | mutant_walk | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:418 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_mutant.c:242 | mutant_run | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:442 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_mutant.c:255 | mutant_hit_left | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:462 calls 1/4 branches 2/2 |  |  |
| Quake-2-master/game/m_mutant.c:266 | mutant_hit_right | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:483 calls 1/4 branches 2/2 |  |  |
| Quake-2-master/game/m_mutant.c:277 | mutant_check_refire | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:504 calls 2/2 branches 3/3 |  |  |
| Quake-2-master/game/m_mutant.c:298 | mutant_melee | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:535 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_mutant.c:308 | mutant_jump_touch | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:551 calls 3/7 branches 6/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_mutant.c:345 | mutant_jump_takeoff | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:584 calls 1/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_mutant.c:360 | mutant_check_landing | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:606 calls 0/1 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/m_mutant.c:389 | mutant_jump | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:641 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_mutant.c:399 | mutant_check_melee | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:654 calls 1/1 branches 1/3 | branch-count-differs |  |
| Quake-2-master/game/m_mutant.c:406 | mutant_check_jump | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:670 calls 1/2 branches 11/10 | branch-count-differs |  |
| Quake-2-master/game/m_mutant.c:433 | mutant_checkattack | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:709 calls 2/2 branches 7/7 |  |  |
| Quake-2-master/game/m_mutant.c:496 | mutant_pain | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:763 calls 1/2 branches 9/9 | call-count-differs |  |
| Quake-2-master/game/m_mutant.c:534 | mutant_dead | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:806 calls 1/3 branches 0/0 |  |  |
| Quake-2-master/game/m_mutant.c:574 | mutant_die | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:843 calls 3/5 branches 6/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_mutant.c:611 | SP_monster_mutant | matched-name-needs-behavior-review | packages/game/src/m_mutant.ts:886 calls 2/6 branches 2/2 |  |  |
| Quake-2-master/game/m_parasite.c:55 | parasite_launch | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:271 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:60 | parasite_reel_in | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:284 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:65 | parasite_sight | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:297 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:70 | parasite_tap | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:310 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:75 | parasite_scratch | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:323 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:80 | parasite_search | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:336 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:119 | parasite_end_fidget | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:373 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:124 | parasite_do_fidget | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:386 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:129 | parasite_refidget | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:399 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/m_parasite.c:137 | parasite_idle | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:416 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:165 | parasite_stand | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:441 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:201 | parasite_start_run | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:478 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_parasite.c:209 | parasite_run | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:495 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_parasite.c:248 | parasite_start_walk | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:536 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:253 | parasite_walk | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:549 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:275 | parasite_pain | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:571 calls 1/2 branches 7/7 |  |  |
| Quake-2-master/game/m_parasite.c:297 | parasite_drain_attack_ok | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:610 calls 1/4 branches 6/6 |  |  |
| Quake-2-master/game/m_parasite.c:316 | parasite_drain_attack | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:639 calls 5/13 branches 11/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_parasite.c:433 | parasite_attack | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:730 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:449 | parasite_dead | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:743 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_parasite.c:471 | parasite_die | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:769 calls 2/4 branches 6/6 |  |  |
| Quake-2-master/game/m_parasite.c:506 | SP_monster_parasite | matched-name-needs-behavior-review | packages/game/src/m_parasite.ts:808 calls 2/6 branches 2/2 |  |  |
| Quake-2-master/game/m_soldier.c:44 | soldier_idle | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:617 calls 1/2 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/m_soldier.c:50 | soldier_cock | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:631 calls 0/1 branches 0/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_soldier.c:211 | soldier_stand | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:665 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/game/m_soldier.c:224 | soldier_walk1_random | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:681 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/game/m_soldier.c:283 | soldier_walk | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:714 calls 1/1 branches 0/2 | branch-count-differs |  |
| Quake-2-master/game/m_soldier.c:316 | soldier_run | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:741 calls 0/0 branches 4/4 |  |  |
| Quake-2-master/game/m_soldier.c:409 | soldier_pain | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:798 calls 1/2 branches 16/16 | call-count-differs |  |
| Quake-2-master/game/m_soldier.c:462 | soldier_fire | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:851 calls 7/12 branches 13/13 | call-count-differs |  |
| Quake-2-master/game/m_soldier.c:528 | soldier_fire1 | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:913 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/m_soldier.c:533 | soldier_attack1_refire1 | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:968 calls 2/2 branches 2/6 | branch-count-differs |  |
| Quake-2-master/game/m_soldier.c:547 | soldier_attack1_refire2 | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:984 calls 2/2 branches 3/5 | branch-count-differs |  |
| Quake-2-master/game/m_soldier.c:578 | soldier_fire2 | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:922 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/m_soldier.c:583 | soldier_attack2_refire1 | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1013 calls 2/2 branches 2/6 | branch-count-differs |  |
| Quake-2-master/game/m_soldier.c:597 | soldier_attack2_refire2 | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1029 calls 2/2 branches 3/5 | branch-count-differs |  |
| Quake-2-master/game/m_soldier.c:634 | soldier_duck_down | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1058 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/game/m_soldier.c:645 | soldier_duck_up | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1076 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/m_soldier.c:653 | soldier_fire3 | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1090 calls 2/2 branches 0/0 |  |  |
| Quake-2-master/game/m_soldier.c:659 | soldier_attack3_refire | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1102 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/game/m_soldier.c:681 | soldier_fire4 | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:931 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/m_soldier.c:736 | soldier_fire8 | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:940 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/m_soldier.c:741 | soldier_attack6_refire | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1135 calls 1/1 branches 5/5 |  |  |
| Quake-2-master/game/m_soldier.c:772 | soldier_attack | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1169 calls 1/1 branches 2/4 | branch-count-differs |  |
| Quake-2-master/game/m_soldier.c:792 | soldier_sight | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1185 calls 2/3 branches 3/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_soldier.c:810 | soldier_duck_hold | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1204 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_soldier.c:828 | soldier_dodge | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1233 calls 1/1 branches 9/13 | branch-count-differs |  |
| Quake-2-master/game/m_soldier.c:874 | soldier_fire6 | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:949 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/m_soldier.c:879 | soldier_fire7 | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:958 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/m_soldier.c:884 | soldier_dead | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1265 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_soldier.c:1144 | soldier_die | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1337 calls 2/6 branches 19/19 | call-count-differs |  |
| Quake-2-master/game/m_soldier.c:1200 | SP_monster_soldier_x | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1398 calls 1/6 branches 0/0 |  |  |
| Quake-2-master/game/m_soldier.c:1238 | SP_monster_soldier_light | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1434 calls 2/4 branches 2/2 |  |  |
| Quake-2-master/game/m_soldier.c:1261 | SP_monster_soldier | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1458 calls 2/3 branches 2/2 |  |  |
| Quake-2-master/game/m_soldier.c:1282 | SP_monster_soldier_ss | matched-name-needs-behavior-review | packages/game/src/m_soldier.ts:1480 calls 2/3 branches 2/2 |  |  |
| Quake-2-master/game/m_supertank.c:44 | TreadSound | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:379 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_supertank.c:49 | supertank_search | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:395 calls 1/2 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/m_supertank.c:133 | supertank_stand | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:420 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_supertank.c:190 | supertank_forward | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:457 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_supertank.c:195 | supertank_walk | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:470 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_supertank.c:200 | supertank_run | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:483 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/m_supertank.c:441 | supertank_reattack1 | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:623 calls 2/2 branches 4/4 |  |  |
| Quake-2-master/game/m_supertank.c:452 | supertank_pain | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:648 calls 1/2 branches 13/15 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_supertank.c:494 | supertankRocket | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:702 calls 3/6 branches 6/4 | branch-count-differs |  |
| Quake-2-master/game/m_supertank.c:520 | supertankMachineGun | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:739 calls 3/7 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/m_supertank.c:551 | supertank_attack | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:777 calls 1/3 branches 6/4 | branch-count-differs |  |
| Quake-2-master/game/m_supertank.c:583 | supertank_dead | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:804 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_supertank.c:594 | BossExplode | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:826 calls 2/7 branches 21/21 | call-count-differs |  |
| Quake-2-master/game/m_supertank.c:657 | supertank_die | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:896 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_supertank.c:672 | SP_monster_supertank | matched-name-needs-behavior-review | packages/game/src/m_supertank.ts:919 calls 2/6 branches 2/2 |  |  |
| Quake-2-master/game/m_tank.c:49 | tank_sight | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:421 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_tank.c:55 | tank_footstep | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:434 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_tank.c:60 | tank_thud | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:447 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_tank.c:65 | tank_windup | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:460 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_tank.c:70 | tank_idle | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:473 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_tank.c:115 | tank_stand | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:494 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_tank.c:167 | tank_walk | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:535 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_tank.c:219 | tank_run | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:576 calls 0/0 branches 6/6 |  |  |
| Quake-2-master/game/m_tank.c:288 | tank_pain | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:632 calls 1/2 branches 18/19 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/m_tank.c:331 | TankBlaster | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:691 calls 3/5 branches 6/4 | branch-count-differs |  |
| Quake-2-master/game/m_tank.c:356 | TankStrike | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:723 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/m_tank.c:361 | TankRocket | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:738 calls 3/6 branches 6/4 | branch-count-differs |  |
| Quake-2-master/game/m_tank.c:387 | TankMachineGun | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:770 calls 4/6 branches 3/4 | branch-count-differs |  |
| Quake-2-master/game/m_tank.c:467 | tank_reattack_blaster | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:846 calls 2/2 branches 2/5 | branch-count-differs |  |
| Quake-2-master/game/m_tank.c:481 | tank_poststrike | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:864 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/m_tank.c:636 | tank_refire_rocket | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:940 calls 2/2 branches 2/5 | branch-count-differs |  |
| Quake-2-master/game/m_tank.c:650 | tank_doattack_rocket | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:958 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/m_tank.c:655 | tank_attack | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:973 calls 1/3 branches 12/14 | branch-count-differs |  |
| Quake-2-master/game/m_tank.c:706 | tank_dead | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:1011 calls 0/2 branches 0/0 |  |  |
| Quake-2-master/game/m_tank.c:753 | tank_die | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:1041 calls 2/4 branches 6/6 | call-count-differs |  |
| Quake-2-master/game/m_tank.c:792 | SP_monster_tank | matched-name-needs-behavior-review | packages/game/src/m_tank.ts:1078 calls 2/7 branches 5/5 | call-count-differs |  |
| Quake-2-master/game/p_client.c:39 | SP_FixCoopSpots | matched-name-needs-behavior-review | packages/game/src/p_client.ts:412 calls 1/5 branches 8/8 | call-count-differs |  |
| Quake-2-master/game/p_client.c:70 | SP_CreateCoopSpots | matched-name-needs-behavior-review | packages/game/src/p_client.ts:445 calls 0/2 branches 2/2 | body-size-differs |  |
| Quake-2-master/game/p_client.c:108 | SP_info_player_start | matched-name-needs-behavior-review | packages/game/src/p_client.ts:463 calls 0/1 branches 3/3 | call-count-differs |  |
| Quake-2-master/game/p_client.c:123 | SP_info_player_deathmatch | matched-name-needs-behavior-review | packages/game/src/p_client.ts:480 calls 2/2 branches 2/2 |  |  |
| Quake-2-master/game/p_client.c:137 | SP_info_player_coop | matched-name-needs-behavior-review | packages/game/src/p_client.ts:495 calls 1/2 branches 3/3 | call-count-differs<br>body-size-differs |  |
| Quake-2-master/game/p_client.c:171 | SP_info_player_intermission | matched-name-needs-behavior-review | packages/game/src/p_client.ts:513 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/p_client.c:179 | player_pain | matched-name-needs-behavior-review | packages/game/src/p_client.ts:389 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/p_client.c:185 | IsFemale | matched-name-needs-behavior-review | packages/game/src/p_client.ts:364 calls 1/1 branches 1/5 | branch-count-differs |  |
| Quake-2-master/game/p_client.c:198 | IsNeutral | matched-name-needs-behavior-review | packages/game/src/p_client.ts:375 calls 1/1 branches 1/5 | branch-count-differs |  |
| Quake-2-master/game/p_client.c:211 | ClientObituary | matched-name-needs-behavior-review | packages/game/src/p_client.ts:530 calls 2/3 branches 101/99 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:410 | TossClientWeapon | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1163 calls 1/3 branches 11/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:463 | LookAtKiller | matched-name-needs-behavior-review | packages/game/src/p_client.ts:321 calls 1/2 branches 13/11 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:501 | player_die | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1222 calls 3/12 branches 19/17 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:607 | InitClientPersistant | matched-name-needs-behavior-review | packages/game/src/p_client.ts:222 calls 2/3 branches 1/0 | branch-count-differs |  |
| Quake-2-master/game/p_client.c:633 | InitClientResp | matched-name-needs-behavior-review | packages/game/src/p_client.ts:253 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/game/p_client.c:650 | SaveClientData | matched-name-needs-behavior-review | packages/game/src/p_client.ts:270 calls 0/0 branches 4/4 |  |  |
| Quake-2-master/game/p_client.c:668 | FetchClientEntData | matched-name-needs-behavior-review | packages/game/src/p_client.ts:297 calls 0/0 branches 3/1 | branch-count-differs |  |
| Quake-2-master/game/p_client.c:694 | PlayersRangeFromSpot | matched-name-needs-behavior-review | packages/game/src/p_client.ts:805 calls 0/2 branches 5/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:733 | SelectRandomDeathmatchSpawnPoint | matched-name-needs-behavior-review | packages/game/src/p_client.ts:835 calls 2/4 branches 11/11 |  |  |
| Quake-2-master/game/p_client.c:789 | SelectFarthestDeathmatchSpawnPoint | matched-name-needs-behavior-review | packages/game/src/p_client.ts:887 calls 2/3 branches 5/5 | call-count-differs |  |
| Quake-2-master/game/p_client.c:822 | SelectDeathmatchSpawnPoint | matched-name-needs-behavior-review | packages/game/src/p_client.ts:913 calls 2/2 branches 3/4 | branch-count-differs |  |
| Quake-2-master/game/p_client.c:831 | SelectCoopSpawnPoint | matched-name-needs-behavior-review | packages/game/src/p_client.ts:929 calls 1/3 branches 8/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:875 | SelectSpawnPoint | matched-name-needs-behavior-review | packages/game/src/p_client.ts:750 calls 0/7 branches 0/14 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/p_client.c:918 | InitBodyQue | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1106 calls 0/1 branches 1/1 |  |  |
| Quake-2-master/game/p_client.c:931 | body_die | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1123 calls 2/4 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/p_client.c:946 | CopyToBodyQue | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1361 calls 0/3 branches 2/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:980 | respawn | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1407 calls 2/3 branches 4/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:1010 | spectator_respawn | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1440 calls 1/10 branches 9/13 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:1097 | PutClientInServer | matched-name-needs-behavior-review | packages/game/src/p_client.ts:964 calls 6/15 branches 9/16 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:1266 | ClientBeginDeathmatch | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1618 calls 3/8 branches 2/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:1296 | ClientBegin | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1652 calls 5/11 branches 10/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:1362 | ClientUserinfoChanged | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1487 calls 2/9 branches 5/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:1431 | ClientConnect | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1537 calls 3/8 branches 8/16 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:1504 | ClientDisconnect | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1584 calls 0/6 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/p_client.c:1537 | PM_trace | matched-name-needs-behavior-review | packages/game/src/p_client.ts:2140 calls 1/1 branches 1/4 | branch-count-differs |  |
| Quake-2-master/game/p_client.c:1545 | CheckBlock | matched-name-needs-behavior-review | packages/game/src/p_client.ts:2175 calls 0/0 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/p_client.c:1553 | PrintPmove | matched-name-needs-behavior-review | packages/game/src/p_client.ts:2193 calls 1/2 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_client.c:1570 | ClientThink | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1701 calls 6/15 branches 28/41 | branch-count-differs |  |
| Quake-2-master/game/p_client.c:1755 | ClientBeginServerFrame | matched-name-needs-behavior-review | packages/game/src/p_client.ts:1835 calls 6/6 branches 14/14 |  |  |
| Quake-2-master/game/p_hud.c:32 | MoveClientToIntermission | matched-name-needs-behavior-review | packages/game/src/p_hud.ts:86 calls 0/3 branches 4/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_hud.c:73 | BeginIntermission | matched-name-needs-behavior-review | packages/game/src/p_hud.ts:137 calls 3/7 branches 24/24 |  |  |
| Quake-2-master/game/p_hud.c:164 | DeathmatchScoreboardMessage | matched-name-needs-behavior-review | packages/game/src/p_hud.ts:219 calls 0/6 branches 13/18 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_hud.c:262 | DeathmatchScoreboard | matched-name-needs-behavior-review | packages/game/src/p_hud.ts:280 calls 1/2 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_hud.c:276 | Cmd_Score_f | matched-name-needs-behavior-review | packages/game/src/p_hud.ts:295 calls 1/1 branches 6/4 | branch-count-differs |  |
| Quake-2-master/game/p_hud.c:302 | HelpComputer | matched-name-needs-behavior-review | packages/game/src/p_hud.ts:326 calls 0/4 branches 1/6 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/p_hud.c:346 | Cmd_Help_f | matched-name-needs-behavior-review | packages/game/src/p_hud.ts:354 calls 2/2 branches 6/4 | branch-count-differs |  |
| Quake-2-master/game/p_hud.c:377 | G_SetStats | matched-name-needs-behavior-review | packages/game/src/p_hud.ts:392 calls 5/8 branches 31/29 | branch-count-differs |  |
| Quake-2-master/game/p_hud.c:530 | G_CheckChaseStats | matched-name-needs-behavior-review | packages/game/src/p_hud.ts:505 calls 1/2 branches 3/3 |  |  |
| Quake-2-master/game/p_hud.c:549 | G_SetSpectatorStats | matched-name-needs-behavior-review | packages/game/src/p_hud.ts:527 calls 1/1 branches 7/5 | branch-count-differs |  |
| Quake-2-master/game/p_trail.c:49 | PlayerTrail_Init | matched-name-needs-behavior-review | packages/game/src/p_trail.ts:73 calls 0/1 branches 3/3 | call-count-differs |  |
| Quake-2-master/game/p_trail.c:67 | PlayerTrail_Add | matched-name-needs-behavior-review | packages/game/src/p_trail.ts:99 calls 3/5 branches 4/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_trail.c:85 | PlayerTrail_New | matched-name-needs-behavior-review | packages/game/src/p_trail.ts:134 calls 2/2 branches 2/2 |  |  |
| Quake-2-master/game/p_trail.c:95 | PlayerTrail_PickFirst | matched-name-needs-behavior-review | packages/game/src/p_trail.ts:153 calls 3/3 branches 13/11 | branch-count-differs |  |
| Quake-2-master/game/p_trail.c:124 | PlayerTrail_PickNext | matched-name-needs-behavior-review | packages/game/src/p_trail.ts:195 calls 1/1 branches 7/7 |  |  |
| Quake-2-master/game/p_trail.c:143 | PlayerTrail_LastSpot | matched-name-needs-behavior-review | packages/game/src/p_trail.ts:223 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/game/p_view.c:42 | SV_CalcRoll | matched-name-needs-behavior-review | packages/game/src/p_view.ts:120 calls 0/2 branches 3/3 |  |  |
| Quake-2-master/game/p_view.c:71 | P_DamageFeedback | matched-name-needs-behavior-review | packages/game/src/p_view.ts:318 calls 1/11 branches 26/31 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_view.c:222 | SV_CalcViewOffset | matched-name-needs-behavior-review | packages/game/src/p_view.ts:637 calls 0/4 branches 11/18 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_view.c:345 | SV_CalcGunOffset | matched-name-needs-behavior-review | packages/game/src/p_view.ts:739 calls 0/1 branches 8/8 |  |  |
| Quake-2-master/game/p_view.c:397 | SV_AddBlend | matched-name-needs-behavior-review | packages/game/src/p_view.ts:798 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/p_view.c:418 | SV_CalcBlend | matched-name-needs-behavior-review | packages/game/src/p_view.ts:826 calls 2/5 branches 28/26 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_view.c:501 | P_FallingDamage | matched-name-needs-behavior-review | packages/game/src/p_view.ts:438 calls 1/2 branches 22/25 | branch-count-differs |  |
| Quake-2-master/game/p_view.c:579 | P_WorldEffects | matched-name-needs-behavior-review | packages/game/src/p_view.ts:513 calls 2/5 branches 30/36 | branch-count-differs |  |
| Quake-2-master/game/p_view.c:745 | G_SetClientEffects | matched-name-needs-behavior-review | packages/game/src/p_view.ts:148 calls 1/1 branches 13/11 | branch-count-differs |  |
| Quake-2-master/game/p_view.c:798 | G_SetClientEvent | matched-name-needs-behavior-review | packages/game/src/p_view.ts:200 calls 0/0 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/p_view.c:815 | G_SetClientSound | matched-name-needs-behavior-review | packages/game/src/p_view.ts:221 calls 0/3 branches 12/12 | call-count-differs |  |
| Quake-2-master/game/p_view.c:855 | G_SetClientFrame | matched-name-needs-behavior-review | packages/game/src/p_view.ts:261 calls 0/0 branches 20/30 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_view.c:958 | ClientEndServerFrame | matched-name-needs-behavior-review | packages/game/src/p_view.ts:921 calls 16/22 branches 17/16 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:33 | P_ProjectSource | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:213 calls 0/2 branches 4/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:58 | PlayerNoise | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:246 calls 0/6 branches 12/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:118 | Pickup_Weapon | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:303 calls 2/4 branches 14/13 | branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:174 | ChangeWeapon | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:369 calls 3/4 branches 6/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:234 | NoAmmoWeaponChange | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:419 calls 1/2 branches 12/12 | call-count-differs |  |
| Quake-2-master/game/p_weapon.c:282 | Think_Weapon | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:462 calls 1/2 branches 5/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:311 | Use_Weapon | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:498 calls 2/3 branches 9/9 | call-count-differs |  |
| Quake-2-master/game/p_weapon.c:349 | Drop_Weapon | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:535 calls 1/3 branches 4/4 |  |  |
| Quake-2-master/game/p_weapon.c:380 | Weapon_Generic | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:564 calls 3/6 branches 44/42 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:546 | weapon_grenade_fire | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1241 calls 2/4 branches 8/8 |  |  |
| Quake-2-master/game/p_weapon.c:595 | Weapon_Grenade | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1290 calls 3/6 branches 29/30 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:709 | weapon_grenadelauncher_fire | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1389 calls 3/9 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/p_weapon.c:743 | Weapon_GrenadeLauncher | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1423 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/p_weapon.c:759 | Weapon_RocketLauncher_Fire | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1436 calls 4/10 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/p_weapon.c:799 | Weapon_RocketLauncher | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1472 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/p_weapon.c:816 | Blaster_Fire | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:715 calls 3/10 branches 1/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:847 | Weapon_Blaster_Fire | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:751 calls 1/1 branches 0/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:859 | Weapon_Blaster | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:767 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/p_weapon.c:868 | Weapon_HyperBlaster_Fire | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:932 calls 4/6 branches 10/14 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:937 | Weapon_HyperBlaster | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:990 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/p_weapon.c:953 | Machinegun_Fire | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1006 calls 5/14 branches 12/14 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:1039 | Weapon_Machinegun | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1093 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/p_weapon.c:1047 | Chaingun_Fire | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1109 calls 5/12 branches 21/26 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:1167 | Weapon_Chaingun | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1214 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/p_weapon.c:1184 | weapon_shotgun_fire | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:783 calls 3/9 branches 4/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:1230 | Weapon_Shotgun | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:835 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/p_weapon.c:1239 | weapon_supershotgun_fire | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:851 calls 3/9 branches 2/2 | call-count-differs |  |
| Quake-2-master/game/p_weapon.c:1284 | Weapon_SuperShotgun | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:916 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/p_weapon.c:1302 | weapon_railgun_fire | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1485 calls 3/9 branches 4/4 | call-count-differs |  |
| Quake-2-master/game/p_weapon.c:1350 | Weapon_Railgun | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1528 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/p_weapon.c:1367 | weapon_bfg_fire | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1541 calls 4/10 branches 6/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/p_weapon.c:1425 | Weapon_BFG | matched-name-needs-behavior-review | packages/game/src/p_weapon.ts:1588 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/q_shared.c:32 | RotatePointAroundVector | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:607 calls 5/8 branches 3/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/q_shared.c:93 | AngleVectors | matched-name-needs-behavior-review | packages/qcommon/src/q_shared.ts:694 calls 0/2 branches 0/3 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/q_shared.c:130 | ProjectPointOnPlane | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:553 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/game/q_shared.c:152 | PerpendicularVector | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:574 calls 2/3 branches 2/2 |  |  |
| Quake-2-master/game/q_shared.c:191 | R_ConcatRotations | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:481 calls 0/0 branches 2/0 | branch-count-differs |  |
| Quake-2-master/game/q_shared.c:219 | R_ConcatTransforms | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:505 calls 0/0 branches 1/0 | branch-count-differs |  |
| Quake-2-master/game/q_shared.c:251 | Q_fabs | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:188 calls 0/0 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:283 | LerpAngle | matched-name-needs-behavior-review | packages/qcommon/src/q_shared.ts:670 calls 0/0 branches 3/3 |  |  |
| Quake-2-master/game/q_shared.c:293 | anglemod | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:540 calls 0/0 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:310 | BoxOnPlaneSide2 | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:740 calls 1/1 branches 6/6 |  |  |
| Quake-2-master/game/q_shared.c:349 | BoxOnPlaneSide | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:665 calls 0/1 branches 27/27 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:650 | ClearBounds | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:355 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/q_shared.c:656 | AddPointToBounds | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:369 calls 0/0 branches 3/3 |  |  |
| Quake-2-master/game/q_shared.c:672 | VectorCompare | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:394 calls 0/0 branches 1/3 | branch-count-differs |  |
| Quake-2-master/game/q_shared.c:681 | VectorNormalize | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:273 calls 0/1 branches 3/2 | branch-count-differs |  |
| Quake-2-master/game/q_shared.c:700 | VectorNormalize2 | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:407 calls 0/1 branches 3/2 | branch-count-differs |  |
| Quake-2-master/game/q_shared.c:719 | VectorMA | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:205 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/q_shared.c:727 | _DotProduct | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:295 calls 0/0 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:732 | _VectorSubtract | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:308 calls 0/0 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:739 | _VectorAdd | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:325 calls 0/0 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:746 | _VectorCopy | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:342 calls 0/0 branches 0/0 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:753 | CrossProduct | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:238 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/q_shared.c:762 | VectorLength | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:257 calls 1/1 branches 1/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/q_shared.c:775 | VectorInverse | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:432 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/q_shared.c:782 | VectorScale | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:166 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/game/q_shared.c:790 | Q_log2 | matched-name-needs-behavior-review | packages/math/src/q_shared.ts:447 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/game/q_shared.c:807 | COM_SkipPath | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:346 calls 0/0 branches 1/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/q_shared.c:826 | COM_StripExtension | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:363 calls 0/0 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:838 | COM_FileExtension | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:377 calls 0/0 branches 3/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/q_shared.c:859 | COM_FileBase | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:395 calls 0/2 branches 3/4 | branch-count-differs |  |
| Quake-2-master/game/q_shared.c:888 | COM_FilePath | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:416 calls 0/2 branches 1/1 |  |  |
| Quake-2-master/game/q_shared.c:907 | COM_DefaultExtension | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:430 calls 0/2 branches 3/3 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:945 | BigShort | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:607 calls 0/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:946 | LittleShort | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:620 calls 0/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:947 | BigLong | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:633 calls 0/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:948 | LittleLong | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:646 calls 0/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:949 | BigFloat | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:659 calls 0/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:950 | LittleFloat | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:672 calls 0/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:952 | ShortSwap | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:685 calls 0/0 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:962 | ShortNoSwap | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:700 calls 0/0 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:967 | LongSwap | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:713 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/game/q_shared.c:979 | LongNoSwap | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:730 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/game/q_shared.c:984 | FloatSwap | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:743 calls 0/0 branches 1/1 | call-count-differs |  |
| Quake-2-master/game/q_shared.c:1001 | FloatNoSwap | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:767 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/game/q_shared.c:1011 | Swap_Init | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:783 calls 0/0 branches 0/2 | branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/q_shared.c:1050 | va | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:552 calls 0/3 branches 21/1 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/game/q_shared.c:1072 | COM_Parse | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:452 calls 0/0 branches 22/16 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/q_shared.c:1161 | Com_PageInMemory | matched-name-needs-behavior-review | packages/qcommon/src/system.ts:313 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/game/q_shared.c:1180 | Q_stricmp | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:847 calls 0/2 branches 1/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/q_shared.c:1190 | Q_strncasecmp | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:798 calls 0/0 branches 8/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/q_shared.c:1216 | Q_strcasecmp | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:834 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/game/q_shared.c:1223 | Com_sprintf | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:532 calls 0/5 branches 3/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/q_shared.c:1253 | Info_ValueForKey | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:860 calls 0/1 branches 8/12 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/game/q_shared.c:1295 | Info_RemoveKey | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:902 calls 0/3 branches 11/14 | branch-count-differs |  |
| Quake-2-master/game/q_shared.c:1353 | Info_Validate | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:949 calls 0/1 branches 1/5 | branch-count-differs |  |
| Quake-2-master/game/q_shared.c:1362 | Info_SetValueForKey | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:965 calls 1/5 branches 11/14 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmd.c:54 | Cmd_Wait_f | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:685 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/qcommon/cmd.c:78 | Cbuf_Init | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:142 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/qcommon/cmd.c:90 | Cbuf_AddText | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:158 calls 1/3 branches 2/2 | call-count-differs |  |
| Quake-2-master/qcommon/cmd.c:114 | Cbuf_InsertText | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:180 calls 3/6 branches 1/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmd.c:147 | Cbuf_CopyToDefer | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:201 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/cmd.c:159 | Cbuf_InsertFromDefer | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:218 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/qcommon/cmd.c:171 | Cbuf_ExecuteText | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:235 calls 3/4 branches 7/7 |  |  |
| Quake-2-master/qcommon/cmd.c:194 | Cbuf_Execute | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:263 calls 1/3 branches 4/11 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/qcommon/cmd.c:263 | Cbuf_AddEarlyCommands | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:295 calls 4/6 branches 4/4 | call-count-differs |  |
| Quake-2-master/qcommon/cmd.c:296 | Cbuf_AddLateCommands | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:326 calls 3/7 branches 10/10 | call-count-differs |  |
| Quake-2-master/qcommon/cmd.c:371 | Cmd_Exec_f | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:731 calls 3/9 branches 4/4 | call-count-differs |  |
| Quake-2-master/qcommon/cmd.c:409 | Cmd_Echo_f | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:758 calls 2/3 branches 2/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmd.c:425 | Cmd_Alias_f | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:652 calls 2/10 branches 6/11 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/qcommon/cmd.c:507 | Cmd_Argc | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:377 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/qcommon/cmd.c:517 | Cmd_Argv | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:393 calls 0/0 branches 3/3 |  |  |
| Quake-2-master/qcommon/cmd.c:531 | Cmd_Args | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:413 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/qcommon/cmd.c:542 | Cmd_MacroExpandString | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:799 calls 1/6 branches 15/17 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmd.c:620 | Cmd_TokenizeString | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:429 calls 1/6 branches 10/18 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmd.c:691 | Cmd_AddCommand | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:480 calls 0/4 branches 4/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmd.c:724 | Cmd_RemoveCommand | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:506 calls 0/3 branches 2/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmd.c:752 | Cmd_Exists | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:528 calls 0/1 branches 1/4 | branch-count-differs |  |
| Quake-2-master/qcommon/cmd.c:772 | Cmd_CompleteCommand | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:544 calls 0/3 branches 15/15 | call-count-differs |  |
| Quake-2-master/qcommon/cmd.c:811 | Cmd_ExecuteString | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:588 calls 5/10 branches 13/14 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmd.c:865 | Cmd_List_f | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:779 calls 0/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/qcommon/cmd.c:881 | Cmd_Init | matched-name-needs-behavior-review | packages/qcommon/src/cmd.ts:701 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:137 | CMod_LoadSubmodels | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:175 | CMod_LoadSurfaces | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:209 | CMod_LoadNodes | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:248 | CMod_LoadBrushes | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:280 | CMod_LoadLeafs | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:335 | CMod_LoadPlanes | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:378 | CMod_LoadLeafBrushes | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:408 | CMod_LoadBrushSides | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:444 | CMod_LoadAreas | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:476 | CMod_LoadAreaPortals | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:506 | CMod_LoadVisibility | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:530 | CMod_LoadEntityString | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:548 | CM_LoadMap | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:365 calls 1/25 branches 8/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:639 | CM_InlineModel | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:646 calls 0/2 branches 5/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:652 | CM_NumClusters | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:672 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/qcommon/cmodel.c:657 | CM_NumInlineModels | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:685 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/qcommon/cmodel.c:662 | CM_EntityString | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:698 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/qcommon/cmodel.c:667 | CM_LeafContents | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:711 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/qcommon/cmodel.c:674 | CM_LeafCluster | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:728 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/qcommon/cmodel.c:681 | CM_LeafArea | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:745 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/qcommon/cmodel.c:704 | CM_InitBoxHull | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:1662 calls 1/2 branches 2/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:775 | CM_HeadnodeForBox | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:778 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/qcommon/cmodel.c:800 | CM_PointLeafnum_r | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:1069 calls 1/1 branches 4/6 | branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:826 | CM_PointLeafnum | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:762 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/qcommon/cmodel.c:847 | CM_BoxLeafnums_r | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:1319 calls 1/2 branches 10/10 | call-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:885 | CM_BoxLeafnums_headnode | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:805 calls 0/1 branches 0/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:903 | CM_BoxLeafnums | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:838 calls 0/1 branches 0/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:917 | CM_PointContents | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:434 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/qcommon/cmodel.c:937 | CM_TransformedPointContents | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:452 calls 1/5 branches 2/2 | call-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:989 | CM_ClipBoxToBrush | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:1135 calls 1/1 branches 19/24 | branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:1103 | CM_TestBoxInBrush | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:1097 calls 1/1 branches 6/8 | branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:1158 | CM_TraceToLeaf | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:1234 calls 1/1 branches 9/9 | call-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:1192 | CM_TestInLeaf | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/cmodel.c:1227 | CM_RecursiveHullCheck | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:1374 calls 3/4 branches 18/22 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:1350 | CM_BoxTrace | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:482 calls 2/7 branches 10/14 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:1451 | CM_TransformedBoxTrace | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:554 calls 1/6 branches 3/5 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/qcommon/cmodel.c:1530 | CM_DecompressVis | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:858 calls 0/1 branches 9/8 | branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:1575 | CM_ClusterPVS | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:908 calls 0/2 branches 1/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:1584 | CM_ClusterPHS | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:924 calls 0/2 branches 1/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:1602 | FloodArea_r | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:1806 calls 1/2 branches 9/5 | branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:1631 | FloodAreaConnections | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:1842 calls 1/1 branches 3/3 |  |  |
| Quake-2-master/qcommon/cmodel.c:1653 | CM_SetAreaPortalState | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:937 calls 1/2 branches 1/1 |  |  |
| Quake-2-master/qcommon/cmodel.c:1662 | CM_AreasConnected | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:955 calls 0/1 branches 4/6 | branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:1686 | CM_WriteAreaBits | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:976 calls 0/1 branches 5/5 |  |  |
| Quake-2-master/qcommon/cmodel.c:1721 | CM_WritePortalState | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:1004 calls 0/1 branches 2/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:1734 | CM_ReadPortalState | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:1024 calls 1/2 branches 2/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cmodel.c:1748 | CM_HeadnodeVisible | matched-name-needs-behavior-review | packages/qcommon/src/cmodel.ts:1046 calls 1/1 branches 5/9 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:71 | Com_BeginRedirect | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:256 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/qcommon/common.c:83 | Com_EndRedirect | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:284 calls 1/1 branches 2/0 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:101 | Com_Printf | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:311 calls 1/13 branches 3/7<br>packages/qcommon/src/common.ts:312 calls 1/13 branches 3/7<br>packages/qcommon/src/common.ts:313 calls 1/13 branches 3/7 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/qcommon/common.c:151 | Com_DPrintf | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:999 calls 0/4 branches 2/2 | call-count-differs |  |
| Quake-2-master/qcommon/common.c:175 | Com_Error | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:1023 calls 0/11 branches 2/6 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/qcommon/common.c:227 | Com_Quit | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:1045 calls 0/4 branches 0/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/common.c:247 | Com_ServerState | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:888 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/qcommon/common.c:257 | Com_SetServerState | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:901 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/qcommon/common.c:281 | MSG_WriteChar | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:154 calls 1/2 branches 0/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/common.c:294 | MSG_WriteByte | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:170 calls 1/2 branches 0/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/common.c:307 | MSG_WriteShort | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:186 calls 1/2 branches 0/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/common.c:321 | MSG_WriteLong | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:204 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/qcommon/common.c:332 | MSG_WriteFloat | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:224 calls 1/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/common.c:347 | MSG_WriteString | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:242 calls 1/2 branches 3/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/common.c:355 | MSG_WriteCoord | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:268 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/common.c:360 | MSG_WritePos | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:284 calls 0/1 branches 0/0 |  |  |
| Quake-2-master/qcommon/common.c:367 | MSG_WriteAngle | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:302 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/common.c:372 | MSG_WriteAngle16 | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:318 calls 2/2 branches 0/0 |  |  |
| Quake-2-master/qcommon/common.c:378 | MSG_WriteDeltaUsercmd | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:334 calls 2/2 branches 16/16 |  |  |
| Quake-2-master/qcommon/common.c:429 | MSG_WriteDir | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:405 calls 2/2 branches 4/4 |  |  |
| Quake-2-master/qcommon/common.c:455 | MSG_ReadDir | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:946 calls 1/3 branches 2/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/common.c:474 | MSG_WriteDeltaEntity | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:437 calls 5/6 branches 78/80 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:675 | MSG_BeginReading | matched-name-needs-behavior-review | packages/memory/src/sizebuf.ts:113 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/qcommon/common.c:681 | MSG_ReadChar | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:664 calls 0/0 branches 2/3 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:694 | MSG_ReadByte | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:686 calls 0/0 branches 2/3 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:707 | MSG_ReadShort | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:707 calls 0/0 branches 2/3 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:722 | MSG_ReadLong | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:729 calls 0/0 branches 2/3 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:739 | MSG_ReadFloat | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:754 calls 0/1 branches 3/3 | call-count-differs |  |
| Quake-2-master/qcommon/common.c:764 | MSG_ReadString | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:781 calls 0/1 branches 1/4 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:784 | MSG_ReadStringLine | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:797 calls 0/1 branches 1/4 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:804 | MSG_ReadCoord | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:813 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/qcommon/common.c:809 | MSG_ReadPos | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:829 calls 0/1 branches 1/0 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:816 | MSG_ReadAngle | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:845 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/qcommon/common.c:821 | MSG_ReadAngle16 | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:861 calls 2/2 branches 1/1 |  |  |
| Quake-2-master/qcommon/common.c:826 | MSG_ReadDeltaUsercmd | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:877 calls 2/3 branches 9/8 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:865 | MSG_ReadData | matched-name-needs-behavior-review | packages/qcommon/src/messages.ts:926 calls 1/1 branches 2/1 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/common.c:876 | SZ_Init | matched-name-needs-behavior-review | packages/memory/src/sizebuf.ts:75 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/common.c:883 | SZ_Clear | matched-name-needs-behavior-review | packages/memory/src/sizebuf.ts:96 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/qcommon/common.c:889 | SZ_GetSpace | matched-name-needs-behavior-review | packages/memory/src/sizebuf.ts:130 calls 1/3 branches 4/4 |  |  |
| Quake-2-master/qcommon/common.c:912 | SZ_Write | matched-name-needs-behavior-review | packages/memory/src/sizebuf.ts:161 calls 1/2 branches 0/0 |  |  |
| Quake-2-master/qcommon/common.c:917 | SZ_Print | matched-name-needs-behavior-review | packages/memory/src/sizebuf.ts:177 calls 0/3 branches 2/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/common.c:946 | COM_CheckParm | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:234 calls 0/1 branches 4/4 | call-count-differs |  |
| Quake-2-master/qcommon/common.c:959 | COM_Argc | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:133 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/qcommon/common.c:964 | COM_Argv | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:149 calls 0/0 branches 3/3 |  |  |
| Quake-2-master/qcommon/common.c:971 | COM_ClearArgv | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:169 calls 0/0 branches 2/2 |  |  |
| Quake-2-master/qcommon/common.c:984 | COM_InitArgv | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:112 calls 0/2 branches 1/4 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:1007 | COM_AddParm | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:189 calls 0/1 branches 1/1 |  |  |
| Quake-2-master/qcommon/common.c:1018 | memsearch | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:210 calls 0/0 branches 4/4 | call-count-differs |  |
| Quake-2-master/qcommon/common.c:1029 | CopyString | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:875 calls 0/3 branches 1/1 | call-count-differs |  |
| Quake-2-master/qcommon/common.c:1040 | Info_Print | matched-name-needs-behavior-review | packages/qcommon/src/common.ts:1012 calls 0/2 branches 4/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/common.c:1113 | Z_Free | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:1088 calls 0/2 branches 1/1 |  |  |
| Quake-2-master/qcommon/common.c:1136 | Z_Stats_f | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:1123 calls 0/1 branches 2/0 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:1146 | Z_FreeTags | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:1103 calls 0/1 branches 2/2 |  |  |
| Quake-2-master/qcommon/common.c:1163 | Z_TagMalloc | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:1059 calls 0/3 branches 1/2 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:1191 | Z_Malloc | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:1075 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/qcommon/common.c:1211 | COM_BlockSequenceCheckByte | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:949 calls 0/1 branches 0/1 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:1329 | COM_BlockSequenceCRCByte | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:967 calls 1/3 branches 3/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/common.c:1366 | frand | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:917 calls 0/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/qcommon/common.c:1371 | crand | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:933 calls 0/1 branches 1/1 | call-count-differs |  |
| Quake-2-master/qcommon/common.c:1387 | Com_Error_f | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:1179 calls 2/2 branches 1/0 | branch-count-differs |  |
| Quake-2-master/qcommon/common.c:1398 | Qcommon_Init | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:1196 calls 2/23 branches 2/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/common.c:1491 | Qcommon_Frame | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:1238 calls 2/12 branches 11/19 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/common.c:1586 | Qcommon_Shutdown | matched-name-needs-behavior-review | packages/qcommon/src/qcommon.ts:1302 calls 0/0 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/crc.c:67 | CRC_Init | matched-name-needs-behavior-review | packages/qcommon/src/crc.ts:83 calls 0/0 branches 1/0 | branch-count-differs |  |
| Quake-2-master/qcommon/crc.c:72 | CRC_ProcessByte | matched-name-needs-behavior-review | packages/qcommon/src/crc.ts:99 calls 0/0 branches 1/0 | branch-count-differs |  |
| Quake-2-master/qcommon/crc.c:77 | CRC_Value | matched-name-needs-behavior-review | packages/qcommon/src/crc.ts:112 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/qcommon/crc.c:82 | CRC_Block | matched-name-needs-behavior-review | packages/qcommon/src/crc.ts:125 calls 1/1 branches 2/2 | call-count-differs |  |
| Quake-2-master/qcommon/cvar.c:31 | Cvar_InfoValidate | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:552 calls 0/1 branches 1/7 | branch-count-differs |  |
| Quake-2-master/qcommon/cvar.c:47 | Cvar_FindVar | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:536 calls 0/1 branches 1/4 | branch-count-differs |  |
| Quake-2-master/qcommon/cvar.c:63 | Cvar_VariableValue | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:121 calls 1/2 branches 1/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cvar.c:79 | Cvar_VariableString | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:138 calls 1/1 branches 1/3 | branch-count-differs |  |
| Quake-2-master/qcommon/cvar.c:95 | Cvar_CompleteVariable | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:155 calls 0/3 branches 9/9 | call-count-differs |  |
| Quake-2-master/qcommon/cvar.c:127 | Cvar_Get | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:187 calls 2/6 branches 9/11 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cvar.c:179 | Cvar_Set2 | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:581 calls 3/11 branches 25/26 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cvar.c:268 | Cvar_ForceSet | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:235 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/qcommon/cvar.c:278 | Cvar_Set | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:251 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/qcommon/cvar.c:288 | Cvar_FullSet | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:267 calls 2/5 branches 4/4 | call-count-differs |  |
| Quake-2-master/qcommon/cvar.c:317 | Cvar_SetValue | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:296 calls 1/2 branches 1/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cvar.c:336 | Cvar_GetLatchedVars | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:313 calls 0/5 branches 4/4 | call-count-differs |  |
| Quake-2-master/qcommon/cvar.c:363 | Cvar_Command | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:342 calls 0/5 branches 0/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cvar.c:391 | Cvar_Set_f | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:477 calls 4/6 branches 8/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cvar.c:429 | Cvar_WriteVariables | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:429 calls 0/4 branches 4/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/cvar.c:453 | Cvar_List_f | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:513 calls 0/1 branches 2/11 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/qcommon/cvar.c:488 | Cvar_BitInfo | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:371 calls 1/1 branches 4/3 | branch-count-differs |  |
| Quake-2-master/qcommon/cvar.c:504 | Cvar_Userinfo | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:397 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/qcommon/cvar.c:510 | Cvar_Serverinfo | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:413 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/qcommon/cvar.c:522 | Cvar_Init | matched-name-needs-behavior-review | packages/qcommon/src/cvar.ts:456 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/files.c:104 | FS_filelength | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/files.c:125 | FS_CreatePath | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/files.c:149 | FS_FCloseFile | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/files.c:159 | Developer_searchpath | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:641 calls 0/1 branches 6/9 | branch-count-differs |  |
| Quake-2-master/qcommon/files.c:206 | FS_FOpenFile | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/files.c:282 | FS_FOpenFile | missing-ts-body |  |  | missing-ts-function-body |
| Quake-2-master/qcommon/files.c:346 | FS_Read | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:573 calls 0/3 branches 3/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/files.c:394 | FS_LoadFile | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:549 calls 1/4 branches 3/6 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/qcommon/files.c:433 | FS_FreeFile | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:608 calls 0/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/files.c:448 | FS_LoadPackFile | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:357 calls 0/10 branches 1/8 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/qcommon/files.c:513 | FS_AddGameDirectory | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:297 calls 0/4 branches 0/3 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/qcommon/files.c:555 | FS_Gamedir | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:463 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/qcommon/files.c:565 | FS_ExecAutoexec | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:625 calls 0/5 branches 1/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/files.c:588 | FS_SetGamedir | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:426 calls 1/10 branches 6/8 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/qcommon/files.c:645 | FS_Link_f | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:374 calls 0/8 branches 6/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/files.c:733 | FS_Dir_f | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:799 calls 2/9 branches 3/8 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/qcommon/files.c:786 | FS_Path_f | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:685 calls 0/2 branches 6/5 | branch-count-differs |  |
| Quake-2-master/qcommon/files.c:814 | FS_NextPath | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:723 calls 0/0 branches 8/8 |  |  |
| Quake-2-master/qcommon/files.c:841 | FS_InitFilesystem | matched-name-needs-behavior-review | packages/filesystem/src/files.ts:237 calls 2/5 branches 2/2 | call-count-differs |  |
| Quake-2-master/qcommon/md4.c:98 | MD4Init | matched-name-needs-behavior-review | packages/qcommon/src/md4.ts:85 calls 0/0 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/md4.c:110 | MD4Update | matched-name-needs-behavior-review | packages/qcommon/src/md4.ts:104 calls 1/2 branches 3/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/md4.c:145 | MD4Final | matched-name-needs-behavior-review | packages/qcommon/src/md4.ts:141 calls 2/3 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/md4.c:170 | MD4Transform | matched-name-needs-behavior-review | packages/qcommon/src/md4.ts:280 calls 4/5 branches 0/0 |  |  |
| Quake-2-master/qcommon/md4.c:241 | Encode | matched-name-needs-behavior-review | packages/qcommon/src/md4.ts:355 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/qcommon/md4.c:255 | Decode | matched-name-needs-behavior-review | packages/qcommon/src/md4.ts:373 calls 0/0 branches 1/1 |  |  |
| Quake-2-master/qcommon/md4.c:265 | Com_BlockChecksum | matched-name-needs-behavior-review | packages/qcommon/src/md4.ts:165 calls 3/3 branches 1/1 | call-count-differs |  |
| Quake-2-master/qcommon/net_chan.c:91 | Netchan_Init | matched-name-needs-behavior-review | packages/qcommon/src/net_chan.ts:48 calls 1/3 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/net_chan.c:110 | Netchan_OutOfBand | matched-name-needs-behavior-review | packages/qcommon/src/net_chan.ts:140 calls 3/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/net_chan.c:132 | Netchan_OutOfBandPrint | matched-name-needs-behavior-review | packages/qcommon/src/net_chan.ts:165 calls 1/5 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/net_chan.c:152 | Netchan_Setup | matched-name-needs-behavior-review | packages/qcommon/src/net_chan.ts:71 calls 1/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/qcommon/net_chan.c:175 | Netchan_CanReliable | matched-name-needs-behavior-review | packages/qcommon/src/net_chan.ts:101 calls 0/0 branches 1/3 | branch-count-differs |  |
| Quake-2-master/qcommon/net_chan.c:183 | Netchan_NeedReliable | matched-name-needs-behavior-review | packages/qcommon/src/net_chan.ts:114 calls 0/0 branches 3/3 |  |  |
| Quake-2-master/qcommon/net_chan.c:213 | Netchan_Transmit | matched-name-needs-behavior-review | packages/qcommon/src/net_chan.ts:184 calls 6/9 branches 8/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/net_chan.c:298 | Netchan_Process | matched-name-needs-behavior-review | packages/qcommon/src/net_chan.ts:251 calls 4/5 branches 9/12 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/pmove.c:80 | PM_ClipVelocity | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:264 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/qcommon/pmove.c:113 | PM_StepSlideMove_ | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:288 calls 6/6 branches 25/24 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/pmove.c:271 | PM_StepSlideMove | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:391 calls 3/3 branches 6/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/pmove.c:345 | PM_Friction | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:457 calls 1/1 branches 5/5 |  |  |
| Quake-2-master/qcommon/pmove.c:397 | PM_Accelerate | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:502 calls 1/1 branches 4/4 |  |  |
| Quake-2-master/qcommon/pmove.c:414 | PM_AirAccelerate | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:528 calls 1/1 branches 5/5 |  |  |
| Quake-2-master/qcommon/pmove.c:438 | PM_AddCurrents | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:559 calls 2/3 branches 30/30 |  |  |
| Quake-2-master/qcommon/pmove.c:533 | PM_WaterMove | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:1022 calls 6/6 branches 4/4 |  |  |
| Quake-2-master/qcommon/pmove.c:575 | PM_AirMove | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:738 calls 7/7 branches 17/17 |  |  |
| Quake-2-master/qcommon/pmove.c:671 | PM_CatagorizePosition | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:820 calls 2/2 branches 13/13 | call-count-differs |  |
| Quake-2-master/qcommon/pmove.c:778 | PM_CheckJump | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:906 calls 0/0 branches 19/19 |  |  |
| Quake-2-master/qcommon/pmove.c:831 | PM_CheckSpecialMovement | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:965 calls 5/5 branches 11/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/pmove.c:882 | PM_FlyMove | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:1062 calls 6/7 branches 13/12 | branch-count-differs |  |
| Quake-2-master/qcommon/pmove.c:976 | PM_CheckDuck | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:656 calls 1/1 branches 11/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/pmove.c:1034 | PM_DeadMove | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:1146 calls 4/4 branches 4/4 |  |  |
| Quake-2-master/qcommon/pmove.c:1057 | PM_GoodPosition | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:1171 calls 1/1 branches 5/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/pmove.c:1081 | PM_SnapPosition | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:1203 calls 2/2 branches 8/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/qcommon/pmove.c:1168 | PM_InitialSnapPosition | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:1248 calls 2/3 branches 5/5 | call-count-differs |  |
| Quake-2-master/qcommon/pmove.c:1204 | PM_ClampAngles | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:705 calls 2/2 branches 6/6 | call-count-differs |  |
| Quake-2-master/qcommon/pmove.c:1240 | Pmove | matched-name-needs-behavior-review | packages/qcommon/src/pmove.ts:1310 calls 15/17 branches 22/19 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:39 | SV_SetMaster_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:283 calls 6/9 branches 11/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:91 | SV_SetPlayer | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:228 calls 2/5 branches 16/14 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:192 | CopyFile | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:210 calls 0/6 branches 2/7 | call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/server/sv_ccmds.c:278 | SV_WriteLevelFile | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:407 calls 3/10 branches 5/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:306 | SV_ReadLevelFile | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:994 calls 3/10 branches 6/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:334 | SV_WriteServerFile | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:442 calls 2/15 branches 11/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:407 | SV_ReadServerFile | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:499 calls 3/13 branches 9/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:465 | SV_DemoMap_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:544 calls 1/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:488 | SV_GameMap_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:557 calls 7/16 branches 10/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:557 | SV_Map_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:609 calls 3/7 branches 3/3 | call-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:594 | SV_Loadgame_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:630 calls 4/11 branches 5/5 | call-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:641 | SV_Savegame_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:661 calls 6/9 branches 12/12 | call-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:706 | SV_Kick_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:711 calls 2/6 branches 8/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:737 | SV_Status_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:745 calls 1/3 branches 9/11 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:794 | SV_ConSay_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:792 calls 2/6 branches 6/6 |  |  |
| Quake-2-master/server/sv_ccmds.c:829 | SV_Heartbeat_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:819 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/server/sv_ccmds.c:842 | SV_Serverinfo_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:829 calls 2/3 branches 1/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:856 | SV_DumpUser_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:843 calls 3/4 branches 5/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:882 | SV_ServerRecord_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:903 calls 8/16 branches 13/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:970 | SV_ServerStop_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:974 calls 0/2 branches 2/2 | call-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:991 | SV_KillServer_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:870 calls 1/2 branches 2/2 | call-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:1006 | SV_ServerCommand_f | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:885 calls 1/2 branches 2/2 | call-count-differs |  |
| Quake-2-master/server/sv_ccmds.c:1024 | SV_InitOperatorCommands | matched-name-needs-behavior-review | packages/server/src/sv_ccmds.ts:1030 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/server/sv_ents.c:125 | SV_EmitPacketEntities | matched-name-needs-behavior-review | packages/server/src/sv_ents.ts:160 calls 3/3 branches 11/17 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ents.c:220 | SV_WritePlayerstateToClient | matched-name-needs-behavior-review | packages/server/src/sv_ents.ts:227 calls 5/6 branches 33/35 | branch-count-differs |  |
| Quake-2-master/server/sv_ents.c:413 | SV_WriteFrameToClient | matched-name-needs-behavior-review | packages/server/src/sv_ents.ts:427 calls 5/5 branches 3/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ents.c:475 | SV_FatPVS | matched-name-needs-behavior-review | packages/server/src/sv_ents.ts:704 calls 4/6 branches 9/10 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_ents.c:522 | SV_BuildClientFrame | matched-name-needs-behavior-review | packages/server/src/sv_ents.ts:522 calls 10/12 branches 32/32 | call-count-differs |  |
| Quake-2-master/server/sv_ents.c:680 | SV_RecordDemoMessage | matched-name-needs-behavior-review | packages/server/src/sv_ents.ts:468 calls 6/11 branches 7/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_game.c:34 | PF_Unicast | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:155 calls 3/3 branches 8/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_game.c:64 | PF_dprintf | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:186 calls 0/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/server/sv_game.c:84 | PF_cprintf | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:196 calls 2/7 branches 3/4 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_game.c:115 | PF_centerprintf | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:217 calls 4/7 branches 4/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_game.c:142 | PF_error | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:239 calls 0/4 branches 0/0 | call-count-differs |  |
| Quake-2-master/server/sv_game.c:162 | PF_setmodel | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:249 calls 3/5 branches 3/2 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_game.c:192 | PF_Configstring | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:279 calls 5/7 branches 2/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_game.c:216 | PF_WriteChar | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:302 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/server/sv_game.c:217 | PF_WriteByte | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:310 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/server/sv_game.c:218 | PF_WriteShort | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:318 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/server/sv_game.c:219 | PF_WriteLong | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:326 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/server/sv_game.c:220 | PF_WriteFloat | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:334 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/server/sv_game.c:221 | PF_WriteString | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:342 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/server/sv_game.c:222 | PF_WritePos | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:350 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/server/sv_game.c:223 | PF_WriteDir | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:358 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/server/sv_game.c:224 | PF_WriteAngle | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:366 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/server/sv_game.c:234 | PF_inPVS | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:374 calls 5/5 branches 5/5 |  |  |
| Quake-2-master/server/sv_game.c:264 | PF_inPHS | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:399 calls 5/5 branches 5/5 |  |  |
| Quake-2-master/server/sv_game.c:287 | PF_StartSound | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:424 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/server/sv_game.c:305 | SV_ShutdownGameProgs | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:445 calls 1/2 branches 2/2 | call-count-differs |  |
| Quake-2-master/server/sv_game.c:323 | SV_InitGameProgs | matched-name-needs-behavior-review | packages/server/src/sv_game.ts:460 calls 2/4 branches 6/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_init.c:32 | SV_FindIndex | matched-name-needs-behavior-review | packages/server/src/sv_init.ts:162 calls 5/8 branches 10/10 | call-count-differs |  |
| Quake-2-master/server/sv_init.c:64 | SV_ModelIndex | matched-name-needs-behavior-review | packages/server/src/sv_init.ts:204 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/server/sv_init.c:69 | SV_SoundIndex | matched-name-needs-behavior-review | packages/server/src/sv_init.ts:217 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/server/sv_init.c:74 | SV_ImageIndex | matched-name-needs-behavior-review | packages/server/src/sv_init.ts:230 calls 1/1 branches 1/1 |  |  |
| Quake-2-master/server/sv_init.c:89 | SV_CreateBaseline | matched-name-needs-behavior-review | packages/server/src/sv_init.ts:246 calls 1/2 branches 5/5 |  |  |
| Quake-2-master/server/sv_init.c:117 | SV_CheckForSavegame | matched-name-needs-behavior-review | packages/server/src/sv_init.ts:276 calls 3/8 branches 8/8 | call-count-differs |  |
| Quake-2-master/server/sv_init.c:169 | SV_SpawnServer | matched-name-needs-behavior-review | packages/server/src/sv_init.ts:316 calls 13/21 branches 12/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_init.c:289 | SV_InitGame | matched-name-needs-behavior-review | packages/server/src/sv_init.ts:421 calls 6/17 branches 16/16 | call-count-differs |  |
| Quake-2-master/server/sv_init.c:393 | SV_Map | matched-name-needs-behavior-review | packages/server/src/sv_init.ts:493 calls 4/14 branches 12/13 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_main.c:70 | SV_DropClient | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:181 calls 2/3 branches 2/2 | call-count-differs |  |
| Quake-2-master/server/sv_main.c:109 | SV_StatusString | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:1106 calls 0/5 branches 7/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_main.c:147 | SVC_Status | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:447 calls 2/2 branches 0/0 |  |  |
| Quake-2-master/server/sv_main.c:163 | SVC_Ack | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:295 calls 1/2 branches 0/0 | call-count-differs |  |
| Quake-2-master/server/sv_main.c:176 | SVC_Info | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:473 calls 2/4 branches 6/6 | call-count-differs |  |
| Quake-2-master/server/sv_main.c:209 | SVC_Ping | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:460 calls 1/1 branches 0/0 |  |  |
| Quake-2-master/server/sv_main.c:226 | SVC_GetChallenge | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:507 calls 2/3 branches 5/5 | call-count-differs |  |
| Quake-2-master/server/sv_main.c:267 | SVC_DirectConnect | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:548 calls 12/18 branches 31/29 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_main.c:413 | Rcon_Validate | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:1138 calls 1/3 branches 3/5 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_main.c:433 | SVC_RemoteCommand | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:682 calls 4/9 branches 5/5 | call-count-differs |  |
| Quake-2-master/server/sv_main.c:477 | SV_ConnectionlessPacket | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:719 calls 13/16 branches 15/14 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_main.c:521 | SV_CalcPings | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:871 calls 0/0 branches 6/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_main.c:573 | SV_GiveMsec | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:905 calls 0/0 branches 5/5 | call-count-differs |  |
| Quake-2-master/server/sv_main.c:597 | SV_ReadPackets | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:762 calls 7/9 branches 17/16 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_main.c:663 | SV_CheckTimeouts | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:831 calls 1/2 branches 7/5 | branch-count-differs |  |
| Quake-2-master/server/sv_main.c:703 | SV_PrepWorldFrame | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:929 calls 1/1 branches 3/1 | branch-count-differs |  |
| Quake-2-master/server/sv_main.c:723 | SV_RunGameFrame | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:948 calls 1/3 branches 5/5 | call-count-differs |  |
| Quake-2-master/server/sv_main.c:760 | SV_Frame | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:981 calls 8/12 branches 6/6<br>packages/server/src/host.ts:145 calls 0/12 branches 0/6 | call-count-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/server/sv_main.c:827 | Master_Heartbeat | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:308 calls 3/4 branches 10/9 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_main.c:867 | Master_Shutdown | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:417 calls 2/3 branches 8/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_main.c:898 | SV_UserinfoChanged | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:209 calls 2/5 branches 6/6 | call-count-differs |  |
| Quake-2-master/server/sv_main.c:945 | SV_Init | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:350 calls 1/4 branches 1/0<br>packages/server/src/host.ts:113 calls 0/4 branches 0/0 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>body-size-differs |  |
| Quake-2-master/server/sv_main.c:993 | SV_FinalMessage | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:245 calls 3/4 branches 5/6 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_main.c:1032 | SV_Shutdown | matched-name-needs-behavior-review | packages/server/src/sv_main.ts:1027 calls 2/7 branches 9/5<br>packages/server/src/host.ts:129 calls 0/7 branches 0/5 | call-count-differs<br>branch-count-differs<br>body-size-differs<br>call-count-differs<br>branch-count-differs<br>body-size-differs |  |
| Quake-2-master/server/sv_null.c:4 | SV_Init | matched-name-needs-behavior-review | packages/server/src/sv_null.ts:30 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/server/sv_null.c:8 | SV_Shutdown | matched-name-needs-behavior-review | packages/server/src/sv_null.ts:45 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/server/sv_null.c:12 | SV_Frame | matched-name-needs-behavior-review | packages/server/src/sv_null.ts:62 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/server/sv_send.c:34 | SV_FlushRedirect | matched-name-needs-behavior-review | packages/server/src/sv_send.ts:126 calls 3/3 branches 3/3 |  |  |
| Quake-2-master/server/sv_send.c:65 | SV_ClientPrintf | matched-name-needs-behavior-review | packages/server/src/sv_send.ts:148 calls 2/5 branches 2/2 | call-count-differs |  |
| Quake-2-master/server/sv_send.c:89 | SV_BroadcastPrintf | matched-name-needs-behavior-review | packages/server/src/sv_send.ts:168 calls 2/6 branches 8/7 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_send.c:132 | SV_BroadcastCommand | matched-name-needs-behavior-review | packages/server/src/sv_send.ts:203 calls 3/6 branches 2/2 | call-count-differs |  |
| Quake-2-master/server/sv_send.c:161 | SV_Multicast | matched-name-needs-behavior-review | packages/server/src/sv_send.ts:223 calls 8/9 branches 34/25 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_send.c:272 | SV_StartSound | matched-name-needs-behavior-review | packages/server/src/sv_send.ts:326 calls 5/7 branches 22/25 | branch-count-differs |  |
| Quake-2-master/server/sv_send.c:395 | SV_SendClientDatagram | matched-name-needs-behavior-review | packages/server/src/sv_send.ts:522 calls 5/7 branches 6/6 | call-count-differs |  |
| Quake-2-master/server/sv_send.c:440 | SV_DemoCompleted | matched-name-needs-behavior-review | packages/server/src/sv_send.ts:432 calls 1/2 branches 1/1 | call-count-differs |  |
| Quake-2-master/server/sv_send.c:459 | SV_RateDrop | matched-name-needs-behavior-review | packages/server/src/sv_send.ts:556 calls 0/0 branches 6/6 |  |  |
| Quake-2-master/server/sv_send.c:490 | SV_SendClientMessages | matched-name-needs-behavior-review | packages/server/src/sv_send.ts:449 calls 7/10 branches 18/21 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_user.c:40 | SV_BeginDemoserver | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:159 calls 0/3 branches 1/1 | call-count-differs |  |
| Quake-2-master/server/sv_user.c:58 | SV_New_f | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:173 calls 8/12 branches 7/7 |  |  |
| Quake-2-master/server/sv_user.c:124 | SV_Configstrings_f | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:223 calls 6/10 branches 8/8 | call-count-differs |  |
| Quake-2-master/server/sv_user.c:179 | SV_Baselines_f | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:264 calls 6/11 branches 8/8 | call-count-differs |  |
| Quake-2-master/server/sv_user.c:238 | SV_Begin_f | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:305 calls 5/8 branches 2/2 |  |  |
| Quake-2-master/server/sv_user.c:265 | SV_NextDownload_f | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:326 calls 3/4 branches 6/6 | call-count-differs |  |
| Quake-2-master/server/sv_user.c:302 | SV_BeginDownload_f | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:367 calls 3/11 branches 9/8 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_user.c:385 | SV_Disconnect_f | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:428 calls 1/1 branches 0/0 | call-count-differs |  |
| Quake-2-master/server/sv_user.c:399 | SV_ShowServerinfo_f | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:438 calls 2/2 branches 2/0 | branch-count-differs |  |
| Quake-2-master/server/sv_user.c:405 | SV_Nextserver | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:452 calls 4/4 branches 4/4 |  |  |
| Quake-2-master/server/sv_user.c:433 | SV_Nextserver_f | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:477 calls 3/5 branches 2/2 |  |  |
| Quake-2-master/server/sv_user.c:477 | SV_ExecuteUserCommand | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:497 calls 4/5 branches 8/4 | branch-count-differs |  |
| Quake-2-master/server/sv_user.c:509 | SV_ClientThink | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:530 calls 1/2 branches 3/2 | branch-count-differs |  |
| Quake-2-master/server/sv_user.c:533 | SV_ExecuteClientMessage | matched-name-needs-behavior-review | packages/server/src/sv_user.ts:571 calls 9/14 branches 32/32 | call-count-differs |  |
| Quake-2-master/server/sv_world.c:64 | ClearLink | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:577 calls 0/0 branches 0/0 |  |  |
| Quake-2-master/server/sv_world.c:69 | RemoveLink | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:594 calls 0/0 branches 2/0 | branch-count-differs |  |
| Quake-2-master/server/sv_world.c:75 | InsertLinkBefore | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:615 calls 0/0 branches 2/0 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_world.c:90 | SV_CreateAreaNode | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:637 calls 3/4 branches 3/5 | branch-count-differs |  |
| Quake-2-master/server/sv_world.c:135 | SV_ClearWorld | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:187 calls 1/2 branches 2/0 | branch-count-differs |  |
| Quake-2-master/server/sv_world.c:149 | SV_UnlinkEdict | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:208 calls 1/1 branches 2/2 |  |  |
| Quake-2-master/server/sv_world.c:165 | SV_LinkEdict | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:227 calls 8/10 branches 52/50 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_world.c:354 | SV_AreaEdicts_r | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:687 calls 1/3 branches 11/13 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_world.c:408 | SV_AreaEdicts | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:411 calls 1/1 branches 2/1 | branch-count-differs |  |
| Quake-2-master/server/sv_world.c:431 | SV_PointContents | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:442 calls 4/4 branches 6/3 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_world.c:488 | SV_HullForEntity | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:743 calls 1/2 branches 4/4 | call-count-differs |  |
| Quake-2-master/server/sv_world.c:517 | SV_ClipMoveToEntities | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:766 calls 2/3 branches 19/22 | call-count-differs<br>branch-count-differs |  |
| Quake-2-master/server/sv_world.c:589 | SV_TraceBounds | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:853 calls 0/0 branches 3/3 |  |  |
| Quake-2-master/server/sv_world.c:624 | SV_Trace | matched-name-needs-behavior-review | packages/server/src/sv_world.ts:481 calls 3/5 branches 3/5 | call-count-differs<br>branch-count-differs |  |

