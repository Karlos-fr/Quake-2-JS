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

## Session 2026-05-06 - PM_ClipVelocity

Lot traite:
- `STOP_EPSILON`
- `PM_ClipVelocity`
- locaux de `PM_ClipVelocity`: `backoff`, `change`, `i`

Verdict:
- Lot valide.
- `STOP_EPSILON` conserve la valeur C `0.1`.
- `PM_ClipVelocity` conserve la signature comportementale C: calcule `backoff = DotProduct(in, normal) * overbounce`, applique `change = normal[i] * backoff`, ecrit `out[i] = in[i] - change`, puis zero les composantes strictement entre `-STOP_EPSILON` et `STOP_EPSILON`.
- Le cas in-place C `PM_ClipVelocity(pml.velocity, plane, pml.velocity, 1.01)` est preserve en TS par calcul prealable de `backoff` puis ecriture axe par axe.
- Le local C `i` est renomme en `index` en TS pour idiome local; pas de doublon d'ownership.
- Entete de `PM_ClipVelocity` verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`.

Preuves:
- Comparaison directe C vs TS sur `qcommon/pmove.c` et `packages/qcommon/src/pmove.ts`.
- Runtime: `PM_ClipVelocity` est appele depuis `PM_StepSlideMove_`, lui-meme appele par `PM_StepSlideMove`, `PM_WaterMove`, `PM_AirMove` et `Pmove`; `Pmove` est appele depuis `packages/game/src/p_client.ts`, `packages/server/src/sv_game.ts`, `packages/client/src/view.ts` et `packages/client/src/local-loop.ts`.
- `apps/web`: flux attendu oui via prediction/jeu local; verifie par `apps/web/src/local-client-controller.ts`, `apps/web/src/full-game.ts` et le test renderer full-game. Pas de logique web parallele masquant ce lot.
- `renderer-three`: sortie visible indirecte attendue oui, car le clipping de mouvement influence origine/view/camera; la consommation reste via `ClientRefreshFrame.view.vieworg` et les adapters Three (`gl-world-scene-adapter`, `gl_rmain`, sync refresh). Pas de sortie modele/frame/image/particule/beam/dlight/temp entity/areabits propre a `PM_ClipVelocity`.

Tests lances:
- `npm run verify:pmove`
- `npm run verify:client:pmove:viewheight`
- `npm run verify:pmove:local-bmodel`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Corrections appliquees:
- `scripts/verify/quake2-pmove.ts`: ajout d'assertions ciblees pour `STOP_EPSILON`, le calcul `backoff`/`change`, le seuil strict et l'aliasing in/out de `PM_ClipVelocity`.
- `audit-portage/validation-incrementale/validation/matrices/qcommon_pmove.c.md`: lot marque `Valide`, cible locale `i` renseignee comme `index`.

Prochain lot recommande:
- `MIN_STEP_NORMAL`, `MAX_CLIP_PLANES`, `PM_StepSlideMove_`, et locaux directs `dir`, `d`, `numplanes`, `planes`, `primal_velocity`, `trace`, `end`, `time_left`.
