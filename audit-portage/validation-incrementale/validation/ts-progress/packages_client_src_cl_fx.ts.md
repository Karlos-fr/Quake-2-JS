# Progress TS croise - packages/client/src/cl_fx.ts

- Fichier TS: `packages/client/src/cl_fx.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_fx.ts.md`
- Statut: En cours

## Dernier lot traite

- Lot: `CL_AddParticles`, `CL_BuildEntityEventEffects`, `CL_BuildActionEffects`, `getMuzzleFlashDefinition`, `getMuzzleFlash2Kind`, `getTempEntityKind`, `createMuzzleDefinition`, `createParticleBurst`, `createTempEntityMarker`, `createParticleEffectMarker`, `appendTempEntitySound`, `createEntityEventSound`, `promoteToEntityEvent`.
- Verdict: `CL_AddParticles` et `CL_BuildEntityEventEffects` sont les proprietaires TS attendus deja valides dans `client_cl_fx.c.md`; les onze autres symboles sont des helpers/dispatchers locaux `New` sans portage C/H proprietaire.
- Corrections: en-tetes TS et matrice TS completes pour les helpers `New` avec `Original name: N/A`, `Source declaree: N/A (...)`, `Category: New`; `CL_AddParticles` et `CL_BuildEntityEventEffects` rattaches au statut `Couvert C/H`.
- Tests: `npm run verify:cl-fx`, `npm run verify:particle-sync`, `npm run verify:web-render-order`, `npm run verify:full-game:three-renderer`, `npm run verify:full-game:audio-routing`, `npm run typecheck`.

## Decisions

- `PARTICLE_GRAVITY` et `flyAvelocities` sont verifies directement dans `Quake-2-master/client/cl_fx.c`, mais restent sans entree C/H dediee dans la matrice source.
- `CL_BlueBlasterParticles` est un adapter local: `client/cl_tent.c` declare le symbole, mais le switch source utilise `CL_BlasterParticles` directement.
- Les signatures de surcharge TS de `CL_BlueBlasterParticles` sont classees `Non applicable`; l'implementation est la ligne auditee.
- `CL_ExecuteTempEntityEffects` et `CL_ExecutePacketEntityEffects` sont des executors split dans `cl_fx.ts`: ils portent les effets runtime immediats, mais les proprietaires C/H restent respectivement `CL_ParseTEnt` dans `cl_parse.ts` et `CL_AddPacketEntities` dans `cl_ents.ts`.
- `CL_BuildParticleEffects` est un builder de metadata New; le port proprietaire de `CL_ParseParticles` reste `packages/client/src/cl_parse.ts`.
- `CL_TeleporterParticles`, `CL_LogoutEffect` et `CL_ItemRespawnParticles` sont les symboles TS proprietaires attendus pour `client/cl_fx.c`; leurs lignes de surcharges TS sont classees `Non applicable`.
- `CL_ExplosionParticles`, `CL_BigTeleportParticles`, `CL_BlasterParticles`, `CL_BlasterTrail`, `CL_QuadTrail`, `CL_FlagTrail` et `CL_DiminishingTrail` sont les symboles TS proprietaires attendus pour `client/cl_fx.c`; leurs preuves C/H couvrent runtime, metadata `apps/web`, particules `renderer-three` et typecheck selon la matrice C/H.
- Les signatures de surcharge TS de `CL_ExplosionParticles`, `CL_BigTeleportParticles`, `CL_BlasterParticles`, `CL_BlasterTrail` et `CL_DiminishingTrail` ne sont pas des portages proprietaires distincts.
- `MakeNormalVectors`, `CL_RocketTrail`, `CL_RailTrail`, `CL_IonripperTrail` et `CL_BubbleTrail` sont les symboles TS proprietaires attendus pour `client/cl_fx.c`; leurs lignes C/H sont deja `Valide` dans `client_cl_fx.c.md` avec preuves runtime, metadata web/renderer selon les effets concernes.
- Les signatures de surcharge TS de `CL_RocketTrail`, `CL_RailTrail` et `CL_BubbleTrail` ne sont pas des portages proprietaires distincts.
- `CL_FlyParticles`, `CL_FlyEffect`, `CL_BfgParticles`, `CL_TrapParticles`, `CL_BFGExplosionParticles` et `CL_TeleportParticles` sont les symboles TS proprietaires attendus pour `client/cl_fx.c`; leurs lignes C/H sont deja `Valide` dans `client_cl_fx.c.md` avec preuves runtime, metadata `apps/web`, particules `renderer-three` et typecheck selon les effets concernes.
- `CL_FlyEffectRuntime` et `spawnFlyParticles` sont des helpers/adapters runtime prives; ils ne remplacent pas les proprietaires C/H `CL_FlyEffect` et `CL_FlyParticles`.
- Les signatures de surcharge TS de `CL_FlyParticles`, `CL_BFGExplosionParticles` et `CL_TeleportParticles` ne sont pas des portages proprietaires distincts.
- `CL_AddParticles` est le proprietaire TS attendu pour l'avancement des particules refresh; la ligne C/H est `Valide` avec preuves particle-sync, ordre web-render, renderer Three et typecheck.
- `CL_BuildEntityEventEffects` est le proprietaire TS attendu pour le port split de `CL_EntityEvent`; le flux est appele depuis `cl_ents.ts` et `apps/web` consomme aussi le builder pour les effets autoritatifs.
- `CL_BuildActionEffects` est un dispatcher runtime `New`, pas un portage proprietaire de `CL_ParseMuzzleFlash`, `CL_ParseMuzzleFlash2`, `CL_ParseTEnt` ou `CL_ParseParticles`.
- Les helpers `getMuzzleFlashDefinition`, `getMuzzleFlash2Kind`, `getTempEntityKind`, `createMuzzleDefinition`, `createParticleBurst`, `createTempEntityMarker`, `createParticleEffectMarker`, `appendTempEntitySound`, `createEntityEventSound` et `promoteToEntityEvent` sont des helpers locaux `New` de metadata/action effects.

## Prochain lot recommande

Continuer avec `spawnSimpleTrailParticles`, `spawnDiminishingTrailParticles`, `spawnRailTrailParticles`, `createTrailEffect`, `buildMuzzleFlashEffects`, `normalizeVector` et `crossProduct`, puis reclasser les premiers doublons/adapters muzzleflash si le lot reste stable.

## Blocages

Aucun.
