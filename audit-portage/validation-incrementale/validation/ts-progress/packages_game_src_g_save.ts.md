# Progress TS - packages/game/src/g_save.ts

- Dernier lot traite: validation complete des 47 symboles de `packages/game/src/g_save.ts`.
- Verdict du lot: termine pour la validation TS croisee.
- Corrections appliquees:
  - Entetes `Category: New` completes dans `packages/game/src/g_save.ts` avec `Original name: N/A` et `Source: N/A (...)`.
  - Matrice TS mise a jour pour les tables, registres, wrappers de save/load, helpers JSON structures, et doublons resolus avec `g_main.ts`.
- Tests de reference:
  - `npm run verify:g-save`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-save-storage`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Integration runtime/apps/web/renderer-three:
  - Runtime: branche via `g_main.ts` slots `WriteGame`/`ReadGame`/`WriteLevel`/`ReadLevel`, puis `server/sv_ccmds.ts` et hooks serveur.
  - apps/web: branche via `apps/web/src/full-game-server-host.ts` et stockage save web.
  - renderer-three: non direct; les entites et level locals restaures alimentent ensuite les snapshots/scene.
- Blocages: aucun.
- Prochain lot recommande: aucun pour `packages/game/src/g_save.ts`; reprendre un autre fichier TS en cours dans `AVANCEMENT_GLOBAL_TS.md`.
