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

## Complement session - 2026-05-02

- Lot limite a `MSG_WriteDeltaEntity()` uniquement; aucun temporaire local, `MSG_WriteByte` ou autre entite de `qcommon/common.c` traite.
- Source C relue: garde `number`, calcul des bits delta, `U_OLDORIGIN` pour nouvelle entite ou `RF_BEAM`, cascade `U_MOREBITS*`, ordre d'ecriture des champs reseau.
- Cible TS relue: commentaire d'en-tete complet, ownership `packages/qcommon/src/messages.ts`, garde `MAX_EDICTS`, branches et ordre d'ecriture equivalents au C.
- Runtime verifie: appelee par `SV_EmitPacketEntities`, baselines client et demo serveur; consommee par `CL_ParseServerMessage` -> `CL_ParsePacketEntities` -> `CL_DeltaEntity`.
- apps/web verifie: flux attendu via `full-game-server-host.ts` (`SV_WriteFrameToClient` puis `CL_ParseServerMessage`) et render loop, sans encodeur delta parallele.
- renderer-three verifie: les deltas alimentent `ClientRefreshFrame`; les sorties visibles attendues sont consommees via `refresh-entity-sync`, `three-beam-sync`, `three-dlight-sync`, particules, areabits/camera/scene selon les champs.
- Tests session OK: `npm run verify:qcommon:header`, `npm run verify:cl-parse`, `npm run verify:full-game:server-snapshots`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`, `npm run typecheck`.
