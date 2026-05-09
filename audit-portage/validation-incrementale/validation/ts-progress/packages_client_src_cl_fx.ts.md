# Progress TS croise - packages/client/src/cl_fx.ts

- Fichier TS: `packages/client/src/cl_fx.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_fx.ts.md`
- Statut: En cours

## Dernier lot traite

- Lot: `CL_ExplosionParticles`, `CL_BigTeleportParticles`, `CL_BlasterParticles`, `CL_BlasterTrail`, `CL_QuadTrail`, `CL_FlagTrail`, `CL_DiminishingTrail`, puis leurs surcharges TS presentes.
- Verdict: couvert C/H pour les sept symboles proprietaires deja valides dans `client_cl_fx.c.md`; surcharges TS classees `Non applicable`.
- Corrections: matrice TS mise a jour pour rattacher les proprietaires au statut `Couvert C/H`; surcharges explicitees avec `Original name: N/A`, `Source declaree: N/A (TS overload)`, `Category: New`.
- Tests: `npm run verify:cl-fx`, `npm run verify:particle-sync`, `npm run verify:web-render-order`, `npm run verify:full-game:three-renderer`, `npm run verify:local-gameplay-sync`, `npm run typecheck`.

## Decisions

- `PARTICLE_GRAVITY` et `flyAvelocities` sont verifies directement dans `Quake-2-master/client/cl_fx.c`, mais restent sans entree C/H dediee dans la matrice source.
- `CL_BlueBlasterParticles` est un adapter local: `client/cl_tent.c` declare le symbole, mais le switch source utilise `CL_BlasterParticles` directement.
- Les signatures de surcharge TS de `CL_BlueBlasterParticles` sont classees `Non applicable`; l'implementation est la ligne auditee.
- `CL_ExecuteTempEntityEffects` et `CL_ExecutePacketEntityEffects` sont des executors split dans `cl_fx.ts`: ils portent les effets runtime immediats, mais les proprietaires C/H restent respectivement `CL_ParseTEnt` dans `cl_parse.ts` et `CL_AddPacketEntities` dans `cl_ents.ts`.
- `CL_BuildParticleEffects` est un builder de metadata New; le port proprietaire de `CL_ParseParticles` reste `packages/client/src/cl_parse.ts`.
- `CL_TeleporterParticles`, `CL_LogoutEffect` et `CL_ItemRespawnParticles` sont les symboles TS proprietaires attendus pour `client/cl_fx.c`; leurs lignes de surcharges TS sont classees `Non applicable`.
- `CL_ExplosionParticles`, `CL_BigTeleportParticles`, `CL_BlasterParticles`, `CL_BlasterTrail`, `CL_QuadTrail`, `CL_FlagTrail` et `CL_DiminishingTrail` sont les symboles TS proprietaires attendus pour `client/cl_fx.c`; leurs preuves C/H couvrent runtime, metadata `apps/web`, particules `renderer-three` et typecheck selon la matrice C/H.
- Les signatures de surcharge TS de `CL_ExplosionParticles`, `CL_BigTeleportParticles`, `CL_BlasterParticles`, `CL_BlasterTrail` et `CL_DiminishingTrail` ne sont pas des portages proprietaires distincts.

## Prochain lot recommande

Continuer avec `MakeNormalVectors`, `CL_RocketTrail`, `CL_RailTrail`, `CL_IonripperTrail`, `CL_BubbleTrail`, puis leurs surcharges TS si presentes.

## Blocages

Aucun.
