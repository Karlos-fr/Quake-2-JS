# Progress - Quake-2-master/client/cl_tent.c

## 2026-05-08 - Lot temp entities persistantes / beams / explosions

Statut: `En cours`

Lot traite:
- Ownership TS valide pour les structures/slots `exptype_t`, `explosion_t`, `beam_t`, `laser_t`, `MAX_EXPLOSIONS`, `MAX_BEAMS`, `MAX_LASERS`.
- Validation de `CL_RegisterTEntSounds`, `CL_RegisterTEntModels`, `CL_ClearTEnts`, `CL_AllocExplosion`, `CL_SmokeAndFlash`.
- Validation des parseurs persistants `CL_ParseBeam`, `CL_ParseBeam2`, `CL_ParsePlayerBeam`, `CL_ParseLightning`, `CL_ParseLaser`, `CL_ParseSteam`, `CL_ParseWidow`, `CL_ParseNuke`.
- Validation des builders runtime `CL_AddBeams`, `CL_AddPlayerBeams`, `CL_AddExplosions`, `CL_AddLasers`, `CL_ProcessSustain`, `CL_AddTEnts`.
- `CL_ParseTEnt` marque `Partiel`: les branches persistantes beams/lasers/explosions/sustains sont validees; les branches particules/sounds non persistantes, `CL_ParseParticles` et `splash_color` restent a fermer.

Runtime / web / renderer:
- Runtime verifie via `CL_ParseServerMessage -> CL_ParseTEnt -> CL_AddTEntPacket` et `CL_BuildRefreshFrame -> CL_BuildTEntRefresh`.
- `apps/web` verifie via `createFullGameServerRenderSource`, hook `onTempEntity`, et debug layer forcewalls/sustains.
- `renderer-three` verifie pour beams/lasers via `three-beam-sync` / `R_DrawBeam`, particules via `particle-sync`, dlights via `dlight-sync`, explosions modeles via refresh entities, forcewalls/sustains via layer web.

Tests:
- `npm run verify:cl-tent`
- `npm run verify:beam-sync`
- `npm run verify:particle-sync`
- `npm run verify:dlight-sync`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Prochain lot recommande:
- Fermer `CL_ParseParticles`, `splash_color` / table `splash_color`, puis les branches restantes non persistantes de `CL_ParseTEnt` (particules et sons: blood/sparks/splash/railtrail/bubble/teleport/boss teleport, etc.) en s'appuyant sur les preuves existantes `cl_fx.c` / `cl_newfx.c` sans modifier leurs matrices.
