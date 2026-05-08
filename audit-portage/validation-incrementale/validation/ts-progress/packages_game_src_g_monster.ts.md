# Progress TS - packages/game/src/g_monster.ts

- Statut: Termine
- Dernier lot valide: helpers et constantes locaux `NULL_VEC3`, `MONSTER_PAUSE_FOREVER`, `GameMonsterHooks`, `queueMonsterMuzzleFlash`, `asGameEntity`, `setEntityOrigin`, `subtractVec3` classes `New`.
- Prochain lot recommande: aucun pour `packages/game/src/g_monster.ts`.
- Tests de reference: `npm run typecheck` OK; `npm run verify:g-monster` lance mais bloque avant harnais sur `packages/game/src/g_local.ts` (`Cannot access 'RUNTIME_MOVETYPE_NONE' before initialization`).
- Blocages: aucun pour les lignes `Couvert C/H`; blocage de verification runtime externe au lot TS `g_monster.ts`.

## Session helpers locaux g_monster

- Lignes traitees: `NULL_VEC3`, `MONSTER_PAUSE_FOREVER`, `GameMonsterHooks`, `queueMonsterMuzzleFlash`, `asGameEntity`, `setEntityOrigin`, `subtractVec3`.
- Verdict: `Valide` / `Category: New`; metadonnees `Original name: N/A`, `Source declaree: N/A (...)` ajoutees aux en-tetes et a la matrice.
- Preuves: `packages/game/src/g_monster.ts` relu; `Quake-2-master/game/g_monster.c` relu pour confirmer que ces symboles ne sont pas des entites proprietaires C/H mais des constantes/helpers locaux autour de `vec3_origin`, du literal `100000000`, des hooks explicites, des traces et des copies/soustractions de vecteurs.
- Ownership/doublons: helpers non exportes sauf `GameMonsterHooks`, limite a l'API de hooks du fichier; ils ne revendiquent pas le portage proprietaire des primitives vectorielles ni des emissions reseau, deja rattachees aux ports runtime/qcommon appropries.
- Integration: runtime integre via les fonctions portees de `g_monster.ts`; `apps/web` consomme les sorties server/game existantes, dont sons, snapshots et muzzleflash events; `renderer-three` consomme indirectement les entites/frames/effects/temp events, aucune integration directe supplementaire attendue pour ces helpers locaux.
- Tests: `npm run typecheck` OK; `npm run verify:g-monster` echoue avant execution du harnais sur un TDZ `RUNTIME_MOVETYPE_NONE` dans `packages/game/src/g_local.ts`, non corrige car hors fichier TS autorise pour ce lot.
