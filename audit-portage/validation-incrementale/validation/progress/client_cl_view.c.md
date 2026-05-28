# Progress - Quake-2-master/client/cl_view.c

## Etat courant

- Statut: Termine
- Dernier lot valide: lot final elargi autour de `CL_PrepRefresh`, registration/loading assets, pics/crosshair, modeles et inline models, weapon models, images, clientinfo, sky, temp entities, notify/update/CD, puis `CalcFov`, commandes debug gun, `SCR_DrawCrosshair`, `V_RenderView`, `V_Viewpos_f` et `V_Init`.
- Verdict du lot: Valide apres comparaison C/TS, corrections de parite dans `CL_PrepRefresh` et `V_RenderView`, verification runtime/web/renderer et tests.

## Checklist appliquee

- Identification: toutes les entrees restantes de `client/cl_view.c` ont ete rapprochees de `packages/client/src/view.ts`; les variables locales generees `mapname`, `i`, `name`, `rotate`, `axis`, `a`, `x` et `name` de `V_Gun_Model_f` sont marquees `Non applicable` avec justification dans la matrice.
- Comparaison C/H vs TS: `CL_PrepRefresh` compare pour garde map chargee, dirty points, extraction mapname, ordre `SCR_UpdateScreen`/registration/pump, `SCR_TouchPics`, temp entities, modeles inline et weapon models, images, clientinfo, baseclientinfo, sky, `EndRegistration`, `Con_ClearNotify`, refresh flags et CD track. `V_RenderView` compare pour gardes active/prepped, timedemo, frame valide, scene build, toggles debug, stereo, offset 1/16, viewport, FOV, areabits, toggles add, rdflags, sort/staging, render, stats, dirty points et crosshair.
- Commentaires d'en-tete: les fonctions portees du fichier ont `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior` et notes de portage quand utile.
- Runtime: `CL_PrepRefresh` est atteint depuis le flux precache/loading full-game; `V_Init` enregistre commandes/cvars; `V_RenderView` et `CL_BuildRefreshFrame` alimentent le flux client actif depuis les boucles de frame/render.
- apps/web: `apps/web` declenche `CL_PrepRefresh` dans `full-game.ts`, initialise `V_Init`, et consomme `CL_BuildRefreshFrame` via `full-game-render-source`, `full-game-local-session`, `full-game-render-loop` et `local-client-controller`; pas de logique parallele masquant ce lot.
- renderer-three: les sorties visibles du lot sont consommees par camera/refdef, world scene adapter, `refresh-entity-sync`, `particle-sync`, `three-beam-sync` et `three-dlight-sync`; les modeles, skins, frames, particules, beams, dlights, areabits et camera sont couverts.
- Tests: `npm run verify:cl-view`, `npm run verify:refresh-entity:alias-flags`, `npm run verify:refresh-entity:sprite`, `npm run verify:refresh-entity:weapon`, `npm run verify:particle-sync`, `npm run verify:dlight-sync`, `npm run verify:beam-sync`, `npm run verify:full-game:render-source`, `npm run verify:full-game:authoritative-handshake`, `npm run verify:full-game:authoritative-input`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`, `npm run typecheck`.

## Corrections

- `packages/client/src/view.ts`: `CL_PrepRefresh` appelle maintenant `onUpdateScreen` et `onPumpEvents` pour chaque modele, y compris les inline models `*`, et conserve le clear de ligne apres les weapon models `#`, comme le C.
- `packages/client/src/view.ts`: `V_RenderView` calcule la ligne `cl_stats` depuis les compteurs du `refdef` final afin de respecter les toggles `addEntities`, `addParticles` et `addLights`.
- `packages/client/src/view.ts`: commentaires d'en-tete renforces pour `V_Gun_Next_f`, `V_Gun_Prev_f`, `V_Gun_Model_f` et `V_Viewpos_f`.
- `scripts/verify/quake2-cl-view.ts`: ajout de preuves pour `V_Init`, les commandes debug gun/viewpos, cvars, l'ordre de `CL_PrepRefresh`, crosshair, stereo, blend, stats et toggles de rendu.

## Prochain lot recommande

Aucun pour `client/cl_view.c`: toutes les entrees sont maintenant `Valide` ou `Non applicable`.

## Blocages

- Aucun.

## Session 2026-05-28 - redecoupage lot 2

- Lot traite: separation de `client/cl_view.c` et `client/cl_pred.c`.
- Correction appliquee: l'ancien `packages/client/src/view.ts` a ete remplace par `packages/client/src/cl_view.ts` comme cible principale de `client/cl_view.c`.
- Raccord final: aucune facade `view.ts` conservee; les consommateurs importent directement `cl_view.ts` ou `cl_pred.ts`.
- Deplacement hors fichier: les fonctions et helpers de prediction `client/cl_pred.c` vivent maintenant dans `packages/client/src/cl_pred.ts`.
- Imports mis a jour: `cl_tent.ts`, `local-loop.ts`, `menu-player-config.ts`, `refresh.ts`, `apps/web/src/app-runtime.ts` et `packages/client/src/index.ts` consomment directement `cl_view.ts`.
- Matrice: `client_cl_view.c.md` mise a jour vers `packages/client/src/cl_view.ts`, verdict `strict-ok`.
- Validations lancees: `npm run typecheck` OK; `npm run build --workspace @quake2js/web` OK.
