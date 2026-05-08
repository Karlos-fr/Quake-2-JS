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

## 2026-05-08 - Lot temp entities non persistantes / particules / sons

Statut: `Termine`

Lot traite:
- Validation de `CL_ParseParticles`: ordre source `MSG_ReadPos`, `MSG_ReadDir`, `color`, `count`; mutation runtime `CL_ParticleEffect`; hook `onParticleEffect`.
- Validation de `splash_color`: table C `{0x00, 0xe0, 0xb0, 0x50, 0xd0, 0xe0, 0xe8}` portee comme helper `mapSplashColor` dans `packages/client/src/cl_fx.ts`, utilisee par `TE_SPLASH`.
- Validation des branches non persistantes de `CL_ParseTEnt`: particules, trails, dlights ponctuelles et sons de temp entities. Correction appliquee pour `TE_HEATBEAM_SPARKS` / `TE_HEATBEAM_STEAM`, qui doivent convertir le `directionByte` lu par `MSG_ReadDir` avec `DirFromByte`.

Runtime / web / renderer:
- Runtime verifie via `CL_ParseServerMessage -> CL_ParseTEnt -> CL_ExecuteTempEntityEffects`, `CL_ParseParticles`, puis `CL_BuildRefreshFrame -> CL_AddParticles`.
- `apps/web` verifie: le navigateur consomme le flux runtime via `createFullGameServerRenderSource`, `onTempEntity`, `startAuthoritativeEffectSounds` et les frames refresh autoritaires; les particules visibles viennent du runtime client, pas d'une logique parallele.
- `renderer-three` verifie: les particules runtime atteignent `ClientRefreshFrame.particles`, puis `particle-sync` / `GL_DrawParticles`; beams/dlights deja couverts par les preuves du lot precedent.

Tests:
- `npm run verify:cl-tent`
- `npm run verify:particle-sync`
- `npm run verify:dlight-sync`
- `npm run verify:beam-sync`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Tests avec reserve:
- `npm run verify:cl-fx` echoue sur `EF_ROCKET should expose the original rocket dlight to refresh`, hors lot `cl_tent.c` constate pendant cette session.

Prochain lot recommande:
- Aucun lot restant dans `client_cl_tent.c.md`: toutes les entrees sont `Valide` ou `Non applicable`.
