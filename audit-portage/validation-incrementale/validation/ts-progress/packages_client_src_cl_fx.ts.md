# Progress TS croise - packages/client/src/cl_fx.ts

- Fichier TS: `packages/client/src/cl_fx.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_fx.ts.md`
- Statut: En cours

## Dernier lot traite

- Lot: 24 premieres entrees, de `PARTICLE_GRAVITY` a `CL_ClearEffects`.
- Verdict: valide pour les helpers/descripteurs New et adapters du lot; couvert C/H pour les symboles proprietaires deja valides dans `client_cl_fx.c.md`.
- Corrections: entetes TS completes pour `PARTICLE_GRAVITY`, `FLY_BEAM_LENGTH`, `flyAvelocities`, `ClientLightStyle`, `ClientActionEffect`, `ClientPacketEntityEffectSource`, `CL_BlueBlasterParticles`, `CL_BuildMuzzleFlashEffects`; `CL_BlueBlasterParticles` reclasse en Adapter.
- Tests: `npm run verify:cl-fx`, `npm run verify:particle-sync`, `npm run verify:web-render-order`, `npm run typecheck`.

## Decisions

- `PARTICLE_GRAVITY` et `flyAvelocities` sont verifies directement dans `Quake-2-master/client/cl_fx.c`, mais restent sans entree C/H dediee dans la matrice source.
- `CL_BlueBlasterParticles` est un adapter local: `client/cl_tent.c` declare le symbole, mais le switch source utilise `CL_BlasterParticles` directement.
- Les signatures de surcharge TS de `CL_BlueBlasterParticles` sont classees `Non applicable`; l'implementation est la ligne auditee.

## Prochain lot recommande

Continuer avec `CL_BuildMuzzleFlash2Effects`, `CL_BuildTempEntityEffects`, `CL_ExecuteTempEntityEffects`, `CL_ExecutePacketEntityEffects`, `CL_BuildParticleEffects`, puis le bloc `CL_TeleporterParticles` / `CL_LogoutEffect` / `CL_ItemRespawnParticles` si le temps le permet.

## Blocages

Aucun.
