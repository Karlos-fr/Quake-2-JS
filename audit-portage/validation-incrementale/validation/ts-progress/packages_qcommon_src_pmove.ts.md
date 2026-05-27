# Progress TS - packages/qcommon/src/pmove.ts

- Fichier TS: `packages/qcommon/src/pmove.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_qcommon_src_pmove.ts.md`
- Source principale: `Quake-2-master/qcommon/pmove.c`
- Matrice C/H principale: `audit-portage/validation-incrementale/validation/matrices/qcommon_pmove.c.md`
- Etat courant: Termine

## 2026-05-27 - Gros lot 35 symboles avant `Pmove`

- Lot traite: `STEPSIZE` a `PM_DropTimers` inclus, soit 35 symboles; `Pmove` reste hors lot.
- Verdict: 26 symboles marques `Couvert C/H`, 9 symboles marques `Valide`.
- Preuves C/H: `qcommon_pmove.c.md` contient les lignes `Valide` pour les macros, `pml_t`, les fonctions `PM_*` auditees, `jitterbits` et `offset`, avec `packages/qcommon/src/pmove.ts` comme cible proprietaire.
- Corrections: entetes TS completes pour les entites `Category: New` incompletes (`PmoveOptions`, `createCplane`, `createPmlState`, `createPmoveContext`, `PM_InitLocalState`, `PM_SyncToState`, `PM_ClearResults`) avec `Original name: N/A` et `Source: N/A (...)`; `PM_DropTimers` reclasse en `Category: Adapter`.
- Tests: `npm run verify:pmove`, `npm run verify:client:pmove:viewheight`, `npm run verify:pmove:local-bmodel`, `npm run typecheck`.
- Integration runtime: couverte par `Pmove`/client prediction; le lot ne modifie pas le branchement.
- Integration apps/web: non applicable pour ce lot, les symboles restent des primitives qcommon appelees via runtime/client.
- Integration renderer-three: non applicable, aucun symbole du lot ne produit directement de donnees renderer.
- Prochain lot recommande: auditer `Pmove`, verifier l'entete/options d'orchestration et croiser avec `qcommon_pmove.c.md` et `qcommon_qcommon.h.md`.

## 2026-05-27 - Lot final `Pmove`

- Lot traite: `Pmove`.
- Verdict: `Pmove` marque `Couvert C/H`; `pmove.ts` termine.
- Preuves C/H: `qcommon_pmove.c.md` contient `Pmove` `Valide` avec cible proprietaire `packages/qcommon/src/pmove.ts`; `qcommon_qcommon.h.md` contient le prototype `Pmove` `Valide` vers le meme symbole TS.
- Verification TS: entete `Original name: Pmove`, `Source: qcommon/pmove.c`, `Category: Ported`, export public; le package `qcommon` correspond au module source, sans doublon proprietaire trouve.
- Orchestration/options: le chemin par defaut suit l'ordre C (`clear results`, reset `pml`, clamp angles, spectator, dead/freeze, duck, initial snap, categorization, special movement, timers, movement branch, final categorization, snap). Les options `PmoveOptions` restent des gates de harness; leur commentaire a ete clarifie pour indiquer que les valeurs omises preservent le chemin original.
- Integration runtime: branchee via `packages/game/src/p_client.ts`, `packages/server/src/sv_game.ts`, `packages/client/src/local-loop.ts` et `packages/client/src/view.ts`.
- Integration apps/web: couverte par le runtime/client/server qui appellent `Pmove`; pas de logique web parallele attendue pour ce symbole qcommon.
- Integration renderer-three: non applicable directement; `Pmove` produit un etat joueur/camera consomme en aval par le client, pas des primitives renderer.
- Tests: `npm run verify:pmove`, `npm run verify:client:pmove:viewheight`, `npm run verify:pmove:local-bmodel`, `npm run verify:qcommon:header`, `npm run typecheck`.
- Prochain lot recommande: aucun pour `packages/qcommon/src/pmove.ts`.
