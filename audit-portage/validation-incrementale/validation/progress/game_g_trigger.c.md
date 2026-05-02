# Progress - Quake-2-master/game/g_trigger.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `trigger_gravity_touch` et `SP_trigger_gravity`.
- Verdict du lot: valide.

## Preuves session

- C source compare: `Quake-2-master/game/g_trigger.c`
- TS cible compare: `packages/game/src/g_trigger.ts`
- Runtime verifie: `SP_trigger_gravity` initialise `SOLID_TRIGGER`, `MOVETYPE_NONE`, `SVF_NOCLIENT`, stocke le gravity parse comme `atoi`, branche `trigger_gravity_touch`, reste atteignable via `ED_CallSpawn` puis `G_TouchTriggers`, et libere/loggue le trigger si la cle `gravity` est absente.
- `apps/web`: integration attendue indirecte via runtime serveur/full-game; le trigger modifie `other.gravity`, puis la physique serveur et les snapshots/playerstate restent consommes par le flux web, sans logique parallele attendue dans `apps/web`.
- `packages/renderer-three`: integration attendue indirecte via snapshots/camera apres changement de gravite; pas de modele, frame, image, particule, beam, dlight, temp entity ou areabit propre a `trigger_gravity`.

## Tests lances

- `npm run verify:g-trigger`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck` (bloque hors lot: `packages/client/src/local-gameplay-sync.ts` importe `CL_SmokeAndFlash` depuis `./cl_fx.js`, export absent)

## Corrections

- `scripts/verify/quake2-g-trigger.ts`: renforcement de `verifyTriggerGravity` pour couvrir init spawn, callback, touch direct, dispatch runtime `ED_CallSpawn` -> `G_TouchTriggers`, et branche warning/free sans `gravity`.

## Prochain lot recommande

- Continuer avec `trigger_monsterjump_touch` et `SP_trigger_monsterjump`.

## Blocages

- `npm run typecheck` bloque sur un import client hors lot: `packages/client/src/local-gameplay-sync.ts` importe `CL_SmokeAndFlash` depuis `./cl_fx.js`, export absent.
