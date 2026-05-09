# Progress TS croise - packages/client/src/cl_fx.ts

- Fichier TS: `packages/client/src/cl_fx.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_fx.ts.md`
- Statut: En cours

## Dernier lot traite

- Lot: `CL_FlyParticles`, `CL_FlyEffect`, `CL_FlyEffectRuntime`, `CL_BfgParticles`, `CL_TrapParticles`, `CL_BFGExplosionParticles`, `CL_TeleportParticles`, leurs surcharges TS presentes, et le helper runtime prive `spawnFlyParticles`.
- Verdict: couvert C/H pour les six symboles proprietaires deja valides dans `client_cl_fx.c.md`; `CL_FlyEffectRuntime` et `spawnFlyParticles` classes adapters runtime prives; surcharges TS classees `Non applicable`.
- Corrections: matrice TS mise a jour pour rattacher les proprietaires au statut `Couvert C/H`, expliciter les surcharges avec `Original name: N/A`, `Source declaree: N/A (TS overload)`, `Category: New`, et lever les faux doublons des adapters.
- Tests: `npm run verify:cl-fx`, `npm run verify:particle-sync`, `npm run verify:web-render-order`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

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

## Prochain lot recommande

Continuer avec `CL_AddParticles`, `CL_BuildEntityEventEffects`, puis `CL_BuildActionEffects` et les premiers helpers `New` a entete incomplete si le lot reste stable.

## Blocages

Aucun.
