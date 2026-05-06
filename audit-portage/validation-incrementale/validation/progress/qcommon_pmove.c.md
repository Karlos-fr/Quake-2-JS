# Progress - Quake-2-master/qcommon/pmove.c

Source: `Quake-2-master/qcommon/pmove.c`
Matrice: `audit-portage/validation-incrementale/validation/matrices/qcommon_pmove.c.md`
Cible TS proprietaire: `packages/qcommon/src/pmove.ts`

## Session 2026-05-06

Lot traite:
- `STEPSIZE`
- `pml_t`
- globals/runtime state initiaux: `origin`, `velocity`, `frametime`, `groundcontents`, `previous_origin`, `ladder`, `pm`, `pml`
- tunables de mouvement: `pm_stopspeed`, `pm_maxspeed`, `pm_duckspeed`, `pm_accelerate`, `pm_airaccelerate`, `pm_wateraccelerate`, `pm_friction`, `pm_waterfriction`, `pm_waterspeed`

Verdict:
- Lot valide.
- Le port TS possede les globals C file-scope via `PmoveContext` et `pml_t`, avec remise a zero de `context.pml` au debut de `Pmove`, ce qui preserve l'ownership et evite les doublons de state global partage entre client et serveur.
- `pml_t` a un entete `Original name` / `Source` / `Category` / `Fidelity level` / `Behavior` / `Porting notes`.
- `PmoveContext` reste `Category: New` avec `Original name: N/A` et `Source: N/A`, car c'est le wrapper TS explicite des globals `pm`, `pml` et tunables.

Preuves:
- Comparaison C vs TS: `STEPSIZE = 18`; champs `pml_t` conserves; defaults tunables C `100/300/100/10/0/10/6/1/400`; conversion `origin`/`velocity` en `0.125`; `previous_origin` garde les packed shorts; `Pmove` recree `pml` avant chaque execution.
- Ownership/doublons: aucun doublon officiel des globals `pmove.c`; l'ownership est centralise dans `packages/qcommon/src/pmove.ts`.
- Runtime: integre via `Pmove(createPmoveContext(...))` dans `packages/game/src/p_client.ts`, `packages/client/src/view.ts` et `packages/client/src/local-loop.ts`.
- `apps/web`: integre via `apps/web/src/local-client-controller.ts` et `apps/web/src/full-game.ts`, qui consomment les sorties prediction/refresh issues de `Pmove`.
- `renderer-three`: sortie visible attendue oui, car `Pmove` produit origine/viewheight/angles de camera; le renderer consomme `refreshFrame.view.vieworg` via `apps/web/src/full-game.ts`, `packages/client/src/view.ts` et les adapters renderer Three.

Tests lances:
- `npm run verify:pmove`
- `npm run verify:client:pmove:viewheight`
- `npm run verify:pmove:local-bmodel`
- `npm run verify:full-game:three-renderer`
- `npm run verify:local-gameplay-sync`
- `npm run typecheck`

Corrections appliquees:
- `packages/qcommon/src/pmove.ts`: entetes enrichis pour `pml_t` et `PmoveContext`.
- `scripts/verify/quake2-pmove.ts`: assertions ajoutees pour le lot initial.
- `audit-portage/validation-incrementale/validation/matrices/qcommon_pmove.c.md`: cibles reelles et statuts du lot mis a jour.

Prochain lot recommande:
- `STOP_EPSILON`, `PM_ClipVelocity`, et locaux `backoff`, `change`, `i`, puis stopper avant `PM_StepSlideMove_` si le lot devient trop large.
