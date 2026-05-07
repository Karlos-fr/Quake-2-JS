# Progress - Quake-2-master/client/cl_newfx.c

## Dernier lot valide

Premier gros lot effets/particules valide : declarations externes initiales, `vectoangles2`, `CL_Flashlight`, `CL_ColorFlash`, `CL_DebugTrail`, `CL_SmokeTrail`, `CL_ForceWall`, `CL_FlameEffects`, `CL_GenericParticleEffect`, `CL_BubbleTrail2`, et les variables locales associees.

## Preuves obtenues

- Comparaison C/TS effectuee contre `Quake-2-master/client/cl_newfx.c` et `packages/client/src/cl_newfx.ts`.
- Commentaires d'en-tete ajoutes/verifies pour les fonctions du lot.
- Runtime verifie depuis les appels directs et `CL_ExecuteTempEntityEffects` pour les temp entities concernees.
- `apps/web` verifie via `createFullGameServerRenderSource` / `CL_BuildRefreshFrame`.
- `renderer-three` verifie comme consommateur des sorties visibles particules et dlights via les adapters de render loop.

## Tests de reference

- `npm run verify:cl-newfx`
- `npm run verify:cl-fx`
- `npm run verify:cl-parse`
- `npm run verify:particle-sync`
- `npm run verify:dlight-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Decisions importantes

- `cl_numparticles` et `vid_ref` sont des declarations externes dans `cl_newfx.c`; elles ne sont pas des entites proprietaires du fichier.
- `CL_ColorFlash` preserve maintenant la branche software `vidref_val == VIDREF_SOFT` via `runtime.cl.vidref_val`; le navigateur/full-game reste par defaut sur le chemin GL.
- Les lignes `move`, `vec`, `len`, `dec`, `j`, `d` du lot sont des variables locales C, parfois avec cible automatique incorrecte vers `cl_fx.ts`.

## Prochain lot recommande

`RINGS` puis `CL_Heatbeam` (variante active RINGS) et ses locaux associes (`move`, `vec`, `len`, `i`, `j`, `dir`, `ltime`, `step`, `start_pt`, `rot`, `variance`, `end`), en verifiant le branchement `cl_tent.ts` heatbeam et la consommation renderer des particules.
