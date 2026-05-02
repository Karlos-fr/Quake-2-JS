# Progress - Quake-2-master/qcommon/common.c

## Statut

- Statut: En cours
- Dernier lot valide: `MSG_WriteDeltaEntity()` uniquement
- Prochain lot recommande: reprendre la matrice autour de `MSG_WriteDeltaEntity()` sous consigne separee; ne pas elargir automatiquement aux temporaires locaux si la regle super admin reste active.

## Preuves session

- Source C lue: `Quake-2-master/qcommon/common.c`, fonction `MSG_WriteDeltaEntity()`.
- Cible TS lue/corrigee: `packages/qcommon/src/messages.ts`, fonction `MSG_WriteDeltaEntity`.
- Commentaire d'en-tete verifie: `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior` et `Porting notes` presents.
- Runtime: appels verifies depuis `packages/server/src/sv_ents.ts`, `packages/server/src/sv_user.ts` et `packages/client/src/cl_main.ts`; consommation client via `CL_ParsePacketEntities`/`CL_DeltaEntity`.
- apps/web: flux attendu via le serveur local et `CL_ParseServerMessage`, sans logique parallele d'encodage des deltas.
- renderer-three: sorties visibles attendues consommees indirectement via les entites parsees, `ClientRefreshFrame`, `refresh-entity-sync`, `three-beam-sync`, dlights/particles/temp entities selon les champs deltas.

## Tests

- `npm run verify:qcommon:header`: OK
- `npm run verify:cl-parse`: OK
- `npm run verify:full-game:server-snapshots`: OK
- `npm run verify:full-game:render-source`: OK
- `npm run verify:full-game:three-renderer`: OK
- `npm run typecheck`: OK
- `npm run verify:server:ents`: bloque avant execution sur import manquant `packages/formats/src/bsp.js`.

## Decisions

- Correction appliquee: ajout du rejet TypeScript pour `to.number >= MAX_EDICTS`, equivalent au `Com_Error(ERR_FATAL, "Entity number >= MAX_EDICTS")` original.
- Tests renforces: encodage complet des champs entity delta, skip sans `force`, ecriture forcee et garde-fou `MAX_EDICTS`.
