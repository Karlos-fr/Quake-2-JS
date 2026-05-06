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

## Session 2026-05-06 - PM_StepSlideMove_ interne

Lot traite:
- `MIN_STEP_NORMAL`
- `MAX_CLIP_PLANES`
- `PM_StepSlideMove_`
- locaux directs: `dir`, `d`, `numplanes`, `planes`, `primal_velocity`, `trace`, `end`, `time_left`

Verdict:
- Lot valide.
- `MIN_STEP_NORMAL` conserve la valeur C `0.7`.
- `MAX_CLIP_PLANES` conserve la valeur C `5`.
- `PM_StepSlideMove_` conserve le coeur C: `numbumps = 4`, copie de `primal_velocity`, `time_left = pml.frametime`, calcul de `end`, appel `pm.trace`, branche `allsolid`, copie `trace.endpos` quand `fraction > 0`, sauvegarde `touchents`, reduction de `time_left`, accumulation des plans, clipping par `PM_ClipVelocity`, projection sur crease via `CrossProduct`/`DotProduct`/`VectorScale`, arret si la velocite s'oppose a `primal_velocity`, restauration de `primal_velocity` quand `pm.s.pm_time` est actif.
- Le local C `d` est renomme en `distance` en TS pour expliciter le scalaire de projection; ownership inchangé dans `packages/qcommon/src/pmove.ts`.
- Entete de `PM_StepSlideMove_` verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`, `Porting notes`.

Preuves:
- Comparaison directe C vs TS sur `qcommon/pmove.c` et `packages/qcommon/src/pmove.ts`.
- Tests cibles ajoutes dans `scripts/verify/quake2-pmove.ts`: constantes, branche `allsolid`, trace partielle avec contact et second trace par `time_left`, clipping sur plan, restauration `pm_time`.
- Runtime: integre via `PM_StepSlideMove`, `PM_WaterMove`, `PM_AirMove` et le flux `Pmove`; racines confirmees via `packages/game/src/p_client.ts`, `packages/server/src/sv_game.ts`, `packages/client/src/view.ts` et `packages/client/src/local-loop.ts`.
- `apps/web`: applicable et integre via `apps/web/src/local-client-controller.ts` et `apps/web/src/full-game.ts`; le navigateur declenche ce flux par prediction/jeu local et ne contient pas de logique parallele masquant ce lot.
- `renderer-three`: sortie visible indirecte attendue oui, car le slide move influence origine/camera et step smoothing; consommation confirmee via `ClientRefreshFrame.view.vieworg`, `refdef.vieworg`, puis `R_RenderFrame`/adapters Three. Pas de sortie propre a ce helper pour modeles, frames, images, particules, beams, dlights, temp entities ou areabits.

Tests lances:
- `npm run verify:pmove`
- `npm run verify:client:pmove:viewheight`
- `npm run verify:pmove:local-bmodel`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Corrections appliquees:
- `scripts/verify/quake2-pmove.ts`: assertions ciblees ajoutees pour le lot interne `PM_StepSlideMove_`.
- `audit-portage/validation-incrementale/validation/matrices/qcommon_pmove.c.md`: lot marque `Valide`, cible locale `d` renseignee comme `distance`.

Prochain lot recommande:
- `PM_StepSlideMove`, son `trace` local et ses locaux de comparaison/step (`start_o`, `start_v`, `down_o`, `down_v`, `up`, `down`, `down_dist`, `up_dist`) dans une session separee.

## Session 2026-05-06 - PM_StepSlideMove et PM_Friction

Lot traite:
- `PM_StepSlideMove`
- locaux directs de `PM_StepSlideMove`: `trace`, `start_o`, `start_v`, `down_o`, `down_v`, `up`, `down`, `down_dist`, `up_dist`
- `PM_Friction`
- locaux directs de `PM_Friction`: `vel`, `friction`, `drop`

Verdict:
- Lot valide.
- `PM_StepSlideMove` conserve le flux C: sauvegarde origine/velocite, slide bas, sauvegarde `down_o`/`down_v`, probe `up = start_o + STEPSIZE`, retour si `trace.allsolid`, retry depuis `up` avec `start_v`, push-down final, comparaison XY `down_dist`/`up_dist`, restauration du chemin bas si plus long ou si la normale de pose est sous `MIN_STEP_NORMAL`, puis copie du Z de `down_v`.
- Le `trace` C local est scinde en TS entre `initialTrace` pour le probe vertical immobile et `trace` pour le push-down final; le comportement reste strict et le renommage evite de reutiliser deux resultats de trace differents sous le meme binding `const`.
- `PM_Friction` conserve le pointeur local C `vel` comme alias de `pml.velocity`, le calcul `speed`, le branchement `speed < 1`, l'accumulation `drop`, la friction sol non-slick/ladder, la friction eau hors ladder, puis le scaling final.
- Entetes verifies pour `PM_StepSlideMove` et `PM_Friction`: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`.

Preuves:
- Comparaison directe C vs TS sur `qcommon/pmove.c` et `packages/qcommon/src/pmove.ts`.
- Tests cibles ajoutes dans `scripts/verify/quake2-pmove.ts`: `PM_StepSlideMove` step-up allsolid, step-up accepte, step plus court, step sur plan trop raide, `PM_Friction` vitesse < 1, friction sol, sol slick, eau et ladder.
- Runtime: `PM_StepSlideMove` est appele par `PM_WaterMove`, `PM_AirMove`, `PM_FlyMove` et `Pmove`; `PM_Friction` est appele depuis `Pmove`. Racines confirmees via `packages/game/src/p_client.ts`, `packages/server/src/sv_game.ts`, `packages/client/src/view.ts` et `packages/client/src/local-loop.ts`.
- `apps/web`: applicable et integre via `apps/web/src/local-client-controller.ts`, `apps/web/src/full-game-render-source.ts`, `apps/web/src/full-game-render-loop.ts` et `apps/web/src/full-game.ts`; pas de logique web parallele qui remplace ce lot.
- `renderer-three`: sortie visible indirecte attendue oui, car origine/velocite de prediction alimentent camera/vieworg et step smoothing. Consommation confirmee via `ClientRefreshFrame.view.vieworg`, `R_RenderFrame`, `gl-world-scene-adapter`, `particle-sync`, `three-dlight-sync` et `refresh-entity-sync`. Pas de sortie propre a ce lot pour modeles, frames, images, particules, beams, dlights, temp entities ou areabits hors camera/scene derivee.

Tests lances:
- `npm run verify:pmove`
- `npm run verify:client:pmove:viewheight`
- `npm run verify:pmove:local-bmodel`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Corrections appliquees:
- `scripts/verify/quake2-pmove.ts`: assertions ciblees ajoutees pour `PM_StepSlideMove`, ses locaux de comparaison/step et les branches directes de `PM_Friction`.
- `audit-portage/validation-incrementale/validation/matrices/qcommon_pmove.c.md`: lot marque `Valide`; lignes ajoutees pour les locaux `start_o`, `start_v`, `down_o`, `down_v`, `up`, `down`, `down_dist`, `up_dist` demandes mais absents de la matrice.

Prochain lot recommande:
- `PM_Accelerate` et son local `i`, puis `PM_AirAccelerate` et son local `i` si le lot reste coherent.

## Session 2026-05-06 - Acceleration, currents, water move et air move

Lot traite:
- `PM_Accelerate` et locaux directs: `i`, `addspeed`, `accelspeed`, `currentspeed`
- `PM_AirAccelerate` et locaux directs: `i`, `addspeed`, `accelspeed`, `currentspeed`, `wishspd`
- `PM_AddCurrents` et locaux/parametre directs: `v`, `s`, `wishvel`
- `PM_WaterMove` et locaux directs: `i`, `wishvel`, `wishdir`, `wishspeed`
- `PM_AirMove` et locaux directs: `i`, `wishvel`, `fmove`, `smove`, `wishdir`, `wishspeed`, `maxspeed`

Verdict:
- Lot valide.
- `PM_Accelerate` conserve le calcul C `currentspeed`, `addspeed`, retour si `addspeed <= 0`, clamp de `accelspeed`, puis ajout axe par axe; le local `i` est renomme `index` en TS.
- `PM_AirAccelerate` conserve le cap C `wishspd = min(wishspeed, 30)` tout en gardant `wishspeed` dans le calcul de `accelspeed`; le local `i` est renomme `index`.
- `PM_AddCurrents` conserve les branches ladder, courants d'eau et convoyeurs sol; le local C `s` est renomme `speed`.
- `PM_WaterMove` conserve la construction du wish velocity avec forward/right complets, le drift `-60` sans intention utilisateur, `PM_AddCurrents`, normalisation, clamp `pm_maxspeed`, demi-vitesse eau, acceleration eau et `PM_StepSlideMove`.
- `PM_AirMove` conserve la construction XY du wish velocity, l'appel aux courants, le clamp duck/maxspeed, les branches ladder, sol et air libre, y compris damping vertical ladder, gravite positive/negative au sol et choix `PM_AirAccelerate` quand `pm_airaccelerate` est actif.
- Entetes verifies pour les fonctions portees du lot: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`.

Preuves:
- Comparaison directe C vs TS sur `Quake-2-master/qcommon/pmove.c` et `packages/qcommon/src/pmove.ts`.
- Tests cibles ajoutes dans `scripts/verify/quake2-pmove.ts`: acceleration bornee, early return acceleration, air acceleration avec cap 30, branches ladder/eau/convoyeur de `PM_AddCurrents`, drift eau sans input, ladder `PM_AirMove`, et branche airaccelerate active.
- Runtime: flux attendu oui; le lot est appele depuis `Pmove` via `PM_WaterMove`/`PM_AirMove` et atteint les racines `packages/game/src/p_client.ts`, `packages/server/src/sv_game.ts`, `packages/client/src/view.ts` et `packages/client/src/local-loop.ts`.
- `apps/web`: flux attendu oui; le navigateur declenche ou consomme ce mouvement via `apps/web/src/local-client-controller.ts`, `apps/web/src/full-game.ts`, `apps/web/src/full-game-render-source.ts` et `apps/web/src/full-game-render-loop.ts`. Pas de logique web parallele masquant ce lot.
- `renderer-three`: sortie visible indirecte attendue oui, car acceleration/courants/eau/air modifient origine, velocite, vieworg et camera/scene derivee. Consommation verifiee via `ClientRefreshFrame.view.vieworg`, `R_RenderFrame`, `gl-world-scene-adapter`, `gl_rmain`, `gl_rsurf`, `particle-sync`, `three-dlight-sync` et `refresh-entity-sync`. Pas de sortie propre a ce lot pour modeles, frames, images, particules, beams, dlights, temp entities ou areabits hors camera/scene derivee.

Tests lances:
- `npm run verify:pmove`
- `npm run verify:client:pmove:viewheight`
- `npm run verify:pmove:local-bmodel`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Corrections appliquees:
- `scripts/verify/quake2-pmove.ts`: assertions ciblees ajoutees pour le lot.
- `audit-portage/validation-incrementale/validation/matrices/qcommon_pmove.c.md`: lot marque `Valide`; lignes ajoutees pour les locaux directs absents de la matrice.

Prochain lot recommande:
- `PM_CatagorizePosition` et ses locaux directs (`point`, `cont`, `trace`, `sample1`, `sample2`).

## Session 2026-05-06 - PM_CatagorizePosition

Lot traite:
- `PM_CatagorizePosition`
- locaux directs: `point`, `cont`, `trace`, `sample1`, `sample2`

Verdict:
- Lot valide.
- `PM_CatagorizePosition` conserve le flux C: point de probe sol a `origin.z - 0.25`, bypass sol si `velocity.z > 180`, copie de `trace.plane`/`surface`/`contents`, rejet sans `trace.ent` ou avec normale Z `< 0.7` hors `startsolid`, stockage `groundentity`, fin de `PMF_TIME_WATERJUMP`, timer de landing a `18` ou `25`, enregistrement `touchents`, puis remise a zero et detection `watertype`/`waterlevel`.
- Les locaux C sont preserves en TS: `point` mutable reutilise pour les probes, `cont` comme contenu courant, `trace` comme resultat du callback, `sample1 = sample2 / 2`, `sample2 = viewheight - mins[2]`.
- Entete de `PM_CatagorizePosition` verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`, `Porting notes`.

Preuves:
- Comparaison directe C vs TS sur `Quake-2-master/qcommon/pmove.c` et `packages/qcommon/src/pmove.ts`.
- Tests cibles ajoutes dans `scripts/verify/quake2-pmove.ts`: contact sol avec timer de landing, mouvement ascendant `> 180`, copie trace/surface/contents, nettoyage waterjump, rejection de plan trop raide, enregistrement touch entity, et sequence des trois probes eau `origin + mins + 1/sample1/sample2`.
- Runtime: flux attendu oui; `PM_CatagorizePosition` est appele deux fois depuis `Pmove`, avant le choix special/jump/move puis apres le mouvement. Racines confirmees via `packages/game/src/p_client.ts`, `packages/server/src/sv_game.ts`, `packages/client/src/view.ts` et `packages/client/src/local-loop.ts`.
- `apps/web`: flux attendu oui; le navigateur declenche/consomme ce flux via `apps/web/src/local-client-controller.ts`, `apps/web/src/full-game.ts`, `apps/web/src/full-game-render-source.ts` et `apps/web/src/full-game-render-loop.ts`. Pas de logique web parallele masquant ground/water/runtime pmove.
- `renderer-three`: sortie visible indirecte attendue oui, car le lot influence `groundentity`, waterlevel/watertype, origine packed, viewheight et donc camera/vieworg/scene derivee. Consommation verifiee via `ClientRefreshFrame.view.vieworg`, `R_RenderFrame`, `gl-world-scene-adapter`, `gl_rmain`, `gl_rsurf`, `particle-sync`, `three-dlight-sync`, `three-beam-sync` et `refresh-entity-sync`. Pas de sortie propre a ce lot pour modeles, frames, images, particules, beams, dlights, temp entities ou areabits hors camera/scene derivee.

Tests lances:
- `npm run verify:pmove`
- `npm run verify:client:pmove:viewheight`
- `npm run verify:pmove:local-bmodel`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Corrections appliquees:
- `scripts/verify/quake2-pmove.ts`: assertions ciblees ajoutees pour `PM_CatagorizePosition` et ses locaux directs.
- `audit-portage/validation-incrementale/validation/matrices/qcommon_pmove.c.md`: lot marque `Valide`.

Prochain lot recommande:
- `PM_CheckJump`, puis `PM_CheckSpecialMovement` et ses locaux directs (`cont`, `trace`) si le lot reste coherent.

## Session 2026-05-06 - fin PM_CheckJump a Pmove

Lot traite:
- `PM_CheckJump`
- `PM_CheckSpecialMovement` et locaux directs `cont`, `trace`
- `PM_FlyMove` et locaux directs `i`, `wishvel`, `wishdir`, `wishspeed`, `end`, `trace`
- `PM_CheckDuck` et local direct `trace`
- `PM_DeadMove` et local direct `forward`
- `PM_GoodPosition` et locaux directs `trace`, `i`
- `PM_SnapPosition` et locaux directs `sign`, `base`, `jitterbits`
- `PM_InitialSnapPosition` et locaux directs `base`, `offset`
- `PM_ClampAngles` et locaux directs `temp`, `i`
- `Pmove` et local direct `msec`

Verdict:
- Lot valide, fin de fichier validee.
- Les fonctions TS conservent le flux C pour jump/swim-up, ladder/waterjump, fly/spectator, duck/gib/dead hulls, dead friction, position validity, snap jitter/fallback, initial snap offsets, angle clamp et orchestration `Pmove`.
- Les renommages locaux idiomatiques restent confines a `packages/qcommon/src/pmove.ts`: `i` vers `index`, `jitterbits` vers `PM_SNAP_JITTER_BITS`, `offset` vers `PM_INITIAL_SNAP_OFFSET`.
- Entetes verifies pour toutes les fonctions portees du lot: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`; `Pmove` documente les gates optionnels comme instrumentation/staged verification.

Preuves:
- Comparaison directe C vs TS sur `Quake-2-master/qcommon/pmove.c` et `packages/qcommon/src/pmove.ts`.
- Tests cibles ajoutes dans `scripts/verify/quake2-pmove.ts`: ladder/waterjump direct, early returns `PM_CheckSpecialMovement`, gib/dead/command duck, `PM_GoodPosition`, jitterbits de `PM_SnapPosition`, offset order de `PM_InitialSnapPosition`, clamp angles teleport/pitch, branches haut niveau spectator/freeze/waterjump de `Pmove`.
- Runtime: flux attendu oui; `Pmove` est appele depuis le gameplay serveur, la prediction client et le loop local via `createPmoveContext`.
- `apps/web`: flux attendu oui; le navigateur declenche/consomme les sorties pmove via le controller local et le full-game runtime. Pas de logique web parallele masquant ce lot.
- `renderer-three`: sortie visible indirecte attendue oui, car le lot produit origine/velocity/viewheight/viewangles/camera et scene derivee; le renderer consomme ces sorties via les refresh frames et adapters Three. Pas de sortie propre a ce lot pour modeles, frames, images, particules, beams, dlights, temp entities ou areabits hors camera/scene derivee.

Tests lances:
- `npm run verify:pmove`
- `npm run verify:client:pmove:viewheight`
- `npm run verify:pmove:local-bmodel`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Corrections appliquees:
- `scripts/verify/quake2-pmove.ts`: assertions ciblees ajoutees pour le lot final.
- `audit-portage/validation-incrementale/validation/matrices/qcommon_pmove.c.md`: toutes les lignes restantes marquees `Valide`; cibles des locaux/tableaux renommes renseignees.

Prochain lot recommande:
- Aucun pour `qcommon/pmove.c`: toutes les entrees de la matrice sont validees.
