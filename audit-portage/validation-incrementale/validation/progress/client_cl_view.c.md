# Progress - Quake-2-master/client/cl_view.c

## Etat courant

- Statut: En cours
- Dernier lot valide: scene staging initial et debug visible: `r_numdlights`, `r_numentities`, `r_numparticles`, `V_ClearScene`, `V_AddEntity`, `V_AddParticle`, `V_AddLight`, `V_AddLightStyle`, `V_TestParticles`, `V_TestEntities`, `V_TestLights`.
- Verdict du lot: Valide apres comparaison C/TS, correction de parite `memset` pour `V_TestEntities`/`V_TestLights`, verification runtime/web/renderer et tests.

## Checklist appliquee

- Identification: entites de `client/cl_view.c` mappees vers `packages/client/src/view.ts`; buffers globaux portes dans `ClientViewScene`; pas de doublon proprietaire trouve pour les fonctions du lot.
- Comparaison C/H vs TS: entrees/sorties, compteurs, limites `MAX_*`, copies de vecteurs, lightstyle `white`, grilles debug particules/entites/lumieres comparees.
- Commentaires d'en-tete: les fonctions portees du lot ont `Original name`, `Source`, `Category`, `Fidelity level` et `Behavior`.
- Runtime: les helpers sont atteignables via `V_RenderView` et `CL_BuildRefreshFrame` quand `CL_Frame`/flux client actif produit une frame; les helpers de debug sont declenches par les cvars `cl_testparticles`, `cl_testentities`, `cl_testlights`.
- apps/web: le navigateur consomme `CL_BuildRefreshFrame` via `full-game`, `full-game-render-source`, `full-game-local-session` et `local-client-controller`; pas de logique parallele masquant ce lot.
- renderer-three: les sorties visibles du lot sont consommees par `refresh-entity-sync`, `particle-sync` et `three-dlight-sync`; les lightstyles/refdef passent via le flux refresh/world adapter.
- Tests: `npx tsx ./scripts/verify/quake2-cl-view.ts`, `npm run verify:refresh-entity:alias-flags`, `npm run verify:refresh-entity:sprite`, `npm run verify:refresh-entity:weapon`, `npm run verify:particle-sync`, `npm run verify:dlight-sync`, `npm run typecheck`.

## Corrections

- `packages/client/src/view.ts`: `V_TestEntities` recree maintenant chaque `entity_t` de test comme le `memset` C avant de remplir origine/model/skin.
- `packages/client/src/view.ts`: `V_TestLights` recree chaque `dlight_t` de test comme le `memset` C avant de remplir origine/couleur/intensite.
- `scripts/verify/quake2-cl-view.ts`: ajout d'un harness cible pour les helpers de scene, limites, copies defensives et remise a zero debug.

## Prochain lot recommande

Traiter `CL_PrepRefresh` et ses locaux generes (`mapname`, `i`, `name`, `rotate`, `axis`) avec le flux registration/loading: dirty points, map registration, pics/crosshair, modeles/inline models, weapon models, images, clientinfo, sky, temp entities, notify clear, update screen, CD track.

## Blocages

- Aucun.
