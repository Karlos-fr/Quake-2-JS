# Inventaire runtime Phase 03 - Quake-2-master/client/cl_fx.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cl_fx.ts
- Cibles TS declarees : packages/client/src/cl_fx.ts, packages/client/src/cl_newfx.ts, packages/client/src/cl_parse.ts, packages/client/src/refresh.ts, packages/client/src/monster-flash.ts, packages/client/src/cl_ents.ts, packages/client/src/cl_main.ts, packages/client/src/client.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | CL_LogoutEffect | 24 | a-auditer | |
| function | CL_ItemRespawnParticles | 25 | a-auditer | |
| struct | clightstyle_t | 40 | a-auditer | |
| global | length | 42 | a-auditer | |
| global | value | 43 | a-auditer | |
| global | map | 44 | a-auditer | |
| global | lastofs | 48 | a-auditer | |
| function | CL_ClearLightStyles | 55 | a-auditer | |
| function | CL_RunLightStyles | 66 | a-auditer | |
| global | ofs | 68 | a-auditer | |
| global | i | 69 | a-auditer | |
| function | CL_SetLightstyle | 92 | a-auditer | |
| global | s | 94 | a-auditer | |
| function | CL_AddLightStyles | 114 | a-auditer | |
| global | i | 116 | a-auditer | |
| global | cl_dlights | 131 | a-auditer | |
| function | CL_ClearDlights | 138 | a-auditer | |
| function | CL_AllocDlight | 149 | a-auditer | |
| global | i | 151 | a-auditer | |
| function | CL_NewDlight | 192 | a-auditer | |
| function | CL_RunDLights | 211 | a-auditer | |
| global | i | 213 | a-auditer | |
| function | CL_ParseMuzzleFlash | 238 | a-auditer | |
| global | silenced | 244 | a-auditer | |
| global | volume | 245 | a-auditer | |
| global | soundname | 246 | a-auditer | |
| global | volume | 273 | a-auditer | |
| function | CL_ParseMuzzleFlash2 | 429 | a-auditer | |
| global | ent | 431 | a-auditer | |
| global | origin | 432 | a-auditer | |
| global | flash_number | 433 | a-auditer | |
| global | soundname | 436 | a-auditer | |
| function | CL_AddDLights | 812 | a-auditer | |
| global | i | 814 | a-auditer | |
| global | cl_numparticles | 888 | a-auditer | |
| function | CL_ClearParticles | 896 | a-auditer | |
| global | i | 898 | a-auditer | |
| function | CL_ParticleEffect | 916 | a-auditer | |
| global | d | 920 | a-auditer | |
| function | CL_ParticleEffect2 | 955 | a-auditer | |
| global | d | 959 | a-auditer | |
| function | CL_ParticleEffect3 | 995 | a-auditer | |
| global | d | 999 | a-auditer | |
| function | CL_TeleporterParticles | 1033 | a-auditer | |
| function | CL_LogoutEffect | 1074 | a-auditer | |
| function | CL_ItemRespawnParticles | 1119 | a-auditer | |
| function | CL_ExplosionParticles | 1158 | a-auditer | |
| function | CL_BigTeleportParticles | 1195 | a-auditer | |
| global | i | 1197 | a-auditer | |
| global | colortable | 1200 | a-auditer | |
| function | CL_BlasterParticles | 1242 | a-auditer | |
| global | d | 1246 | a-auditer | |
| global | count | 1247 | a-auditer | |
| function | CL_BlasterTrail | 1284 | a-auditer | |
| global | move | 1286 | a-auditer | |
| global | vec | 1287 | a-auditer | |
| global | len | 1288 | a-auditer | |
| global | j | 1289 | a-auditer | |
| global | dec | 1291 | a-auditer | |
| function | CL_QuadTrail | 1335 | a-auditer | |
| global | move | 1337 | a-auditer | |
| global | vec | 1338 | a-auditer | |
| global | len | 1339 | a-auditer | |
| global | j | 1340 | a-auditer | |
| global | dec | 1342 | a-auditer | |
| function | CL_FlagTrail | 1385 | a-auditer | |
| global | move | 1387 | a-auditer | |
| global | vec | 1388 | a-auditer | |
| global | len | 1389 | a-auditer | |
| global | j | 1390 | a-auditer | |
| global | dec | 1392 | a-auditer | |
| function | CL_DiminishingTrail | 1435 | a-auditer | |
| global | move | 1437 | a-auditer | |
| global | vec | 1438 | a-auditer | |
| global | len | 1439 | a-auditer | |
| global | j | 1440 | a-auditer | |
| global | dec | 1442 | a-auditer | |
| global | orgscale | 1443 | a-auditer | |
| global | velscale | 1444 | a-auditer | |
| function | MakeNormalVectors | 1534 | a-auditer | |
| global | d | 1536 | a-auditer | |
| function | CL_RocketTrail | 1556 | a-auditer | |
| global | move | 1558 | a-auditer | |
| global | vec | 1559 | a-auditer | |
| global | len | 1560 | a-auditer | |
| global | j | 1561 | a-auditer | |
| global | dec | 1563 | a-auditer | |
| function | CL_RailTrail | 1613 | a-auditer | |
| global | move | 1615 | a-auditer | |
| global | vec | 1616 | a-auditer | |
| global | len | 1617 | a-auditer | |
| global | j | 1618 | a-auditer | |
| global | dec | 1620 | a-auditer | |
| global | i | 1622 | a-auditer | |
| global | dir | 1624 | a-auditer | |
| global | clr | 1625 | a-auditer | |
| function | CL_IonripperTrail | 1704 | a-auditer | |
| global | len | 1708 | a-auditer | |
| global | j | 1709 | a-auditer | |
| global | dec | 1711 | a-auditer | |
| global | left | 1712 | a-auditer | |
| function | CL_BubbleTrail | 1768 | a-auditer | |
| global | move | 1770 | a-auditer | |
| global | vec | 1771 | a-auditer | |
| global | len | 1772 | a-auditer | |
| global | dec | 1775 | a-auditer | |
| macro | BEAMLENGTH | 1818 | a-auditer | |
| function | CL_FlyParticles | 1819 | a-auditer | |
| global | i | 1821 | a-auditer | |
| global | angle | 1823 | a-auditer | |
| global | forward | 1825 | a-auditer | |
| global | dist | 1826 | a-auditer | |
| global | ltime | 1827 | a-auditer | |
| function | CL_FlyEffect | 1882 | a-auditer | |
| global | n | 1884 | a-auditer | |
| global | count | 1885 | a-auditer | |
| global | starttime | 1886 | a-auditer | |
| global | count | 1907 | a-auditer | |
| macro | BEAMLENGTH | 1920 | a-auditer | |
| function | CL_BfgParticles | 1921 | a-auditer | |
| global | i | 1923 | a-auditer | |
| global | angle | 1925 | a-auditer | |
| global | forward | 1927 | a-auditer | |
| global | dist | 1928 | a-auditer | |
| global | v | 1929 | a-auditer | |
| global | ltime | 1930 | a-auditer | |
| function | CL_TrapParticles | 1990 | a-auditer | |
| global | move | 1992 | a-auditer | |
| global | vec | 1993 | a-auditer | |
| global | len | 1995 | a-auditer | |
| global | j | 1996 | a-auditer | |
| global | dec | 1998 | a-auditer | |
| global | vel | 2046 | a-auditer | |
| global | dir | 2047 | a-auditer | |
| global | org | 2048 | a-auditer | |
| function | CL_BFGExplosionParticles | 2097 | a-auditer | |
| function | CL_TeleportParticles | 2135 | a-auditer | |
| global | vel | 2139 | a-auditer | |
| global | dir | 2140 | a-auditer | |
| function | CL_AddParticles | 2182 | a-auditer | |
| global | alpha | 2185 | a-auditer | |
| global | org | 2187 | a-auditer | |
| global | color | 2188 | a-auditer | |
| function | CL_EntityEvent | 2258 | a-auditer | |
| function | CL_ClearEffects | 2293 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

