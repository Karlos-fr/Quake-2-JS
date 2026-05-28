# Inventaire runtime Phase 03 - Quake-2-master/client/cl_tent.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cl_tent.ts
- Cibles TS declarees : packages/client/src/cl_tent.ts, packages/client/src/sound-registration.ts, packages/client/src/cl_fx.ts, packages/client/src/cl_newfx.ts, packages/client/src/cl_parse.ts, packages/client/src/client.ts, packages/client/src/refresh.ts, packages/client/src/sound.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| enum | exptype_t | 24 | a-auditer | |
| struct | explosion_t | 29 | a-auditer | |
| global | frames | 34 | a-auditer | |
| global | light | 35 | a-auditer | |
| global | lightcolor | 36 | a-auditer | |
| global | start | 37 | a-auditer | |
| global | baseframe | 38 | a-auditer | |
| macro | MAX_EXPLOSIONS | 43 | a-auditer | |
| macro | MAX_BEAMS | 47 | a-auditer | |
| struct | beam_t | 48 | a-auditer | |
| global | entity | 50 | a-auditer | |
| global | dest_entity | 51 | a-auditer | |
| global | endtime | 53 | a-auditer | |
| global | cl_beams | 57 | a-auditer | |
| global | cl_playerbeams | 59 | a-auditer | |
| macro | MAX_LASERS | 62 | a-auditer | |
| struct | laser_t | 63 | a-auditer | |
| global | endtime | 66 | a-auditer | |
| global | cl_lasers | 68 | a-auditer | |
| function | CL_TeleportParticles | 75 | a-auditer | |
| function | CL_BlasterParticles | 78 | a-auditer | |
| function | CL_ExplosionParticles | 79 | a-auditer | |
| function | CL_BFGExplosionParticles | 80 | a-auditer | |
| function | CL_BlueBlasterParticles | 82 | a-auditer | |
| function | CL_RegisterTEntSounds | 125 | a-auditer | |
| global | i | 127 | a-auditer | |
| global | name | 128 | a-auditer | |
| function | CL_RegisterTEntModels | 172 | a-auditer | |
| function | CL_ClearTEnts | 213 | a-auditer | |
| function | CL_AllocExplosion | 230 | a-auditer | |
| global | i | 232 | a-auditer | |
| global | time | 233 | a-auditer | |
| global | index | 234 | a-auditer | |
| function | CL_SmokeAndFlash | 263 | a-auditer | |
| function | CL_ParseParticles | 289 | a-auditer | |
| function | CL_ParseBeam | 309 | a-auditer | |
| global | ent | 311 | a-auditer | |
| global | i | 314 | a-auditer | |
| function | CL_ParseBeam2 | 357 | a-auditer | |
| global | ent | 359 | a-auditer | |
| global | i | 362 | a-auditer | |
| function | CL_ParsePlayerBeam | 411 | a-auditer | |
| global | ent | 413 | a-auditer | |
| global | i | 416 | a-auditer | |
| function | MSG_ReadPos | 431 | a-auditer | |
| function | CL_ParseLightning | 475 | a-auditer | |
| global | i | 480 | a-auditer | |
| function | CL_ParseLaser | 528 | a-auditer | |
| global | i | 533 | a-auditer | |
| function | CL_ParseSteam | 557 | a-auditer | |
| global | r | 561 | a-auditer | |
| global | cnt | 562 | a-auditer | |
| global | color | 563 | a-auditer | |
| global | magnitude | 564 | a-auditer | |
| function | CL_ParseWidow | 619 | a-auditer | |
| function | CL_ParseNuke | 652 | a-auditer | |
| global | i | 655 | a-auditer | |
| global | splash_color | 692 | a-auditer | |
| table | splash_color | 692 | a-auditer | |
| function | CL_ParseTEnt | 694 | a-auditer | |
| global | type | 696 | a-auditer | |
| global | cnt | 699 | a-auditer | |
| global | color | 700 | a-auditer | |
| global | r | 701 | a-auditer | |
| global | ent | 702 | a-auditer | |
| global | magnitude | 703 | a-auditer | |
| function | CL_ParticleEffect | 723 | a-auditer | |
| function | CL_ParticleEffect | 748 | a-auditer | |
| global | color | 768 | a-auditer | |
| function | S_StartSound | 779 | a-auditer | |
| function | S_StartSound | 856 | a-auditer | |
| function | S_StartSound | 909 | a-auditer | |
| function | CL_BlasterParticles2 | 1009 | a-auditer | |
| function | S_StartSound | 1081 | a-auditer | |
| function | CL_AddBeams | 1206 | a-auditer | |
| global | b | 1209 | a-auditer | |
| global | d | 1211 | a-auditer | |
| global | forward | 1214 | a-auditer | |
| global | model_length | 1216 | a-auditer | |
| global | pitch | 1241 | a-auditer | |
| global | yaw | 1251 | a-auditer | |
| global | hand | 1338 | a-auditer | |
| function | CL_AddPlayerBeams | 1346 | a-auditer | |
| global | b | 1349 | a-auditer | |
| global | d | 1351 | a-auditer | |
| global | forward | 1354 | a-auditer | |
| global | framenum | 1356 | a-auditer | |
| global | model_length | 1357 | a-auditer | |
| global | hand_multiplier | 1359 | a-auditer | |
| global | oldframe | 1360 | a-auditer | |
| global | hand_multiplier | 1371 | a-auditer | |
| function | VectorCopy | 1418 | a-auditer | |
| global | pitch | 1456 | a-auditer | |
| global | yaw | 1466 | a-auditer | |
| function | CL_AddExplosions | 1596 | a-auditer | |
| global | i | 1599 | a-auditer | |
| global | frac | 1601 | a-auditer | |
| global | f | 1602 | a-auditer | |
| function | CL_AddLasers | 1700 | a-auditer | |
| global | l | 1702 | a-auditer | |
| global | i | 1703 | a-auditer | |
| function | CL_ProcessSustain | 1713 | a-auditer | |
| global | i | 1716 | a-auditer | |
| function | CL_AddTEnts | 1736 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

