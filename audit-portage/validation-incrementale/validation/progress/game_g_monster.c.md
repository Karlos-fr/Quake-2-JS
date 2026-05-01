# Progress - Quake-2-master/game/g_monster.c

- Statut: En cours
- Dernier lot valide: `M_FliesOff`, `M_FliesOn`, `M_FlyCheck`
- Prochain lot recommande: `AttackFinished`
- Tests de reference: `npm run verify:g-monster`, `npm run typecheck`
- Blocages: aucun pour le lot valide

## Session courante

- Lot traite: `M_FliesOff`, `M_FliesOn`, `M_FlyCheck`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaires d'en-tete TS verifies, tests ajoutes dans `scripts/verify/quake2-g-monster.ts` et `scripts/verify/quake2-local-gameplay-sync.ts`, `npm run verify:g-monster` OK, `npm run verify:local-gameplay-sync` OK, `npm run typecheck` OK.
- Runtime: atteignable depuis `G_RunFrame` via les callbacks de mort `infantry_dead` et `mutant_dead` qui appellent `M_FlyCheck`; les callbacks `think` planifient ensuite `M_FliesOn` puis `M_FliesOff`.
- apps/web: pas d'appel direct attendu; le navigateur consomme le son loope via le champ entity `s.sound` dans `full-game-render-loop.ts`.
- renderer-three: sortie visible attendue par `EF_FLIES`; correction appliquee dans `packages/client/src/cl_fx.ts` pour generer les particules `CL_FlyEffect` dans le `ClientRefreshFrame`, ensuite consommees par `particle-sync`.
