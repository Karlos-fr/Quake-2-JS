# Progress - Quake-2-master/client/cl_pred.c

Statut: Termine

## Lot valide

- Bloc complet prediction/mouvement client: `CL_CheckPredictionError`, `CL_ClipMoveToEntities`, `CL_PMTrace`, `CL_PMpointcontents`, `CL_PredictMovement`.
- Les temporaires locaux C generes dans la matrice (`frame`, `delta`, `i`, `len`, `trace`, `headnode`, `angles`, `ent`, `num`, `cmodel`, `tr`, `t`, `contents`, `oldframe`, `cmd`, `pm`, `step`, `oldz`) sont marques `Non applicable`.

## Decisions

- Ownership TS conserve dans `packages/client/src/view.ts`: le fichier regroupe deja `client/cl_view.c` et les helpers logiques `client/cl_pred.c`; les fonctions gardent leur nom original et leurs commentaires d'en-tete pointent vers `client/cl_pred.c`.
- Les extensions TS `predicted_pmove` et `predicted_viewheight` sont acceptees comme adaptation runtime pour exposer la sortie `Pmove` deja calculee, sans remplacer le flux original.
- `renderer-three` ne consomme pas directement `cl_pred.c`; la sortie visible attendue est la camera/refdef construite ensuite par `CL_CalcViewValues`, `CL_BuildRefreshFrame` et consommee par les adapters three.

## Preuves runtime / web / renderer

- Runtime: `CL_ParseFrame -> CL_CheckPredictionError`, `CL_Frame -> onPredictMovement -> CL_PredictMovement`, `CL_PredictMovement -> Pmove`, `CL_PMTrace` et `CL_PMpointcontents`.
- `apps/web`: flux full-game via `Qcommon_Frame -> CL_Frame`, hook `predictAuthoritativeClientMovement`, input `CL_SendCmd`, collision `createClientPredictionCollisionSource`, puis `CL_CalcViewValues`.
- `renderer-three`: camera, scene, refdef, interpolation et view weapon consomment les sorties via `refreshFrame.view`, `syncThreeCameraToRefresh`, `gl-world-scene-adapter`, `refresh-entity-sync`, `gl_rmain`.

## Tests de reference

- `npm run verify:cl-pred`
- `npm run verify:cl-input`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

- Aucun pour `client/cl_pred.c`: toutes les entrees de la matrice sont `Valide` ou `Non applicable`.

## Session 2026-05-28 - redecoupage lot 2

- Lot traite: separation de `client/cl_pred.c` hors de l'ancien fichier mixte `view.ts`.
- Correction appliquee: creation de `packages/client/src/cl_pred.ts` comme cible principale de `client/cl_pred.c`.
- Deplacement: `CL_CheckPredictionError`, `CL_ClipMoveToEntities`, `CL_PMTrace`, `CL_PMpointcontents`, `CL_PredictMovement`, `createClientPredictionCollisionSource` et les helpers prediction locaux ont ete sortis de `cl_view.ts`.
- Raccord final: aucune facade `view.ts` conservee; les consommateurs importent directement `cl_pred.ts` ou `cl_view.ts`.
- Imports mis a jour: `cl_parse.ts`, `local-session.ts`, `apps/web/src/app-runtime.ts` et `packages/client/src/index.ts` consomment directement `cl_pred.ts`.
- Matrice: `client_cl_pred.c.md` mise a jour vers `packages/client/src/cl_pred.ts`, verdict `strict-ok`.
- Validations lancees: `npm run typecheck` OK; `npm run build --workspace @quake2js/web` OK.
