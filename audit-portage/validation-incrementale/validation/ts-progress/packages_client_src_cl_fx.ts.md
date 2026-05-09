# Progress TS croise - packages/client/src/cl_fx.ts

- Fichier TS: `packages/client/src/cl_fx.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_fx.ts.md`
- Statut: En cours

## Dernier lot traite

- Lot: `CL_BuildMuzzleFlash2Effects`, `CL_BuildTempEntityEffects`, `CL_ExecuteTempEntityEffects`, `CL_ExecutePacketEntityEffects`, `CL_BuildParticleEffects`, puis `CL_TeleporterParticles`, `CL_LogoutEffect`, `CL_ItemRespawnParticles` et leurs surcharges TS.
- Verdict: valide pour les builders New et les executors split/adapters du lot; couvert C/H pour les trois symboles proprietaires deja valides dans `client_cl_fx.c.md`; surcharges TS classees non applicables.
- Corrections: entetes TS completes pour `CL_BuildMuzzleFlash2Effects`, `CL_BuildTempEntityEffects` et `CL_BuildParticleEffects`; `CL_ExecuteTempEntityEffects` reclasse en `Ported integration`; `CL_ExecutePacketEntityEffects` rattache explicitement a `CL_AddPacketEntities`; `CL_BuildParticleEffects` reclasse en New pour ne pas doubler le port proprietaire `CL_ParseParticles` de `cl_parse.ts`.
- Tests: `npm run verify:cl-fx`, `npm run verify:particle-sync`, `npm run verify:web-render-order`, `npm run typecheck`.

## Decisions

- `PARTICLE_GRAVITY` et `flyAvelocities` sont verifies directement dans `Quake-2-master/client/cl_fx.c`, mais restent sans entree C/H dediee dans la matrice source.
- `CL_BlueBlasterParticles` est un adapter local: `client/cl_tent.c` declare le symbole, mais le switch source utilise `CL_BlasterParticles` directement.
- Les signatures de surcharge TS de `CL_BlueBlasterParticles` sont classees `Non applicable`; l'implementation est la ligne auditee.
- `CL_ExecuteTempEntityEffects` et `CL_ExecutePacketEntityEffects` sont des executors split dans `cl_fx.ts`: ils portent les effets runtime immediats, mais les proprietaires C/H restent respectivement `CL_ParseTEnt` dans `cl_parse.ts` et `CL_AddPacketEntities` dans `cl_ents.ts`.
- `CL_BuildParticleEffects` est un builder de metadata New; le port proprietaire de `CL_ParseParticles` reste `packages/client/src/cl_parse.ts`.
- `CL_TeleporterParticles`, `CL_LogoutEffect` et `CL_ItemRespawnParticles` sont les symboles TS proprietaires attendus pour `client/cl_fx.c`; leurs lignes de surcharges TS sont classees `Non applicable`.

## Prochain lot recommande

Continuer avec `CL_ExplosionParticles`, `CL_BigTeleportParticles`, `CL_BlasterParticles`, `CL_BlasterTrail`, `CL_QuadTrail`, `CL_FlagTrail`, `CL_DiminishingTrail`, puis leurs surcharges TS si presentes.

## Blocages

Aucun.
