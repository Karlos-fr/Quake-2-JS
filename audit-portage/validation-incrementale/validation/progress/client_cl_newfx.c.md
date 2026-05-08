# Progress - Quake-2-master/client/cl_newfx.c

## Dernier lot valide

Lot final particules Rogue valide : `CL_ParticleSteamEffect`, `CL_ParticleSteamEffect2`, `CL_TrackerTrail`, `CL_Tracker_Shell`, `CL_MonsterPlasma_Shell`, `CL_Widowbeamout`, `CL_Nukeblast`, `CL_WidowSplash`, `CL_Tracker_Explode`, `CL_TagTrail`, `CL_ColorExplosionParticles`, `CL_ParticleSmokeEffect`, `CL_BlasterParticles2`, `CL_BlasterTrail2` et locaux associes. Le fichier `client/cl_newfx.c` est clos: toutes les entrees sont `Valide` ou `Non applicable`.

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
- `npm run verify:beam-sync`
- `npm run typecheck`

## Decisions importantes

- `cl_numparticles` et `vid_ref` sont des declarations externes dans `cl_newfx.c`; elles ne sont pas des entites proprietaires du fichier.
- `CL_ColorFlash` preserve maintenant la branche software `vidref_val == VIDREF_SOFT` via `runtime.cl.vidref_val`; le navigateur/full-game reste par defaut sur le chemin GL.
- Les lignes `move`, `vec`, `len`, `dec`, `j`, `d` du lot sont des variables locales C, parfois avec cible automatique incorrecte vers `cl_fx.ts`.
- `RINGS` est la variante `CL_Heatbeam` active; les blocs CORKSCREW et SPRAY restent non applicables. `CL_Heatbeam` preserve maintenant le decalage `right/up` seulement quand `runtime.cl.vidref_val == VIDREF_GL`.
- Le branchement runtime heatbeam passe par `CL_AddPlayerBeams` / `createHeatbeamRender` dans `cl_tent.ts`; les particules emises par `CL_Heatbeam` rejoignent `CL_AddParticles`, puis `CL_BuildRefreshFrame`, `apps/web` et `renderer-three` via `particle-sync`.
- Le branchement runtime du lot final passe par les temp entities (`TE_HEATBEAM_SPARKS`, `TE_HEATBEAM_STEAM`, `TE_STEAM`, `TE_CHAINFIST_SMOKE`, `TE_BLASTER2`, `TE_FLECHETTE`, `TE_TRACKER_EXPLOSION`, `TE_WIDOWSPLASH`), les sustains (`CL_ProcessSustain`) et les trails packet entities (`EF_BLASTER | EF_TRACKER`).
- `CL_Widowbeamout` et `CL_Nukeblast` ne modifient pas `nextthink`; seul `CL_ParticleSteamEffect2` l'avance, comme dans `client/cl_newfx.c`.

## Prochain lot recommande

Aucun lot restant dans `client_cl_newfx.c.md`: toutes les lignes sont `Valide` ou `Non applicable`. Reprendre un autre fichier depuis `AVANCEMENT_GLOBAL.md`.
