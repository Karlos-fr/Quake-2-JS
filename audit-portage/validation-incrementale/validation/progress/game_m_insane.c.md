# Progress - Quake-2-master/game/m_insane.c

## Session 2026-05-06 - lot marche/course et douleur debout

- Lot traite: `insane_frames_walk_normal`, `insane_move_walk_normal`, `insane_move_run_normal`, `insane_frames_walk_insane`, `insane_move_walk_insane`, `insane_move_run_insane`, `insane_frames_stand_pain`, `insane_move_stand_pain`, et les lignes declaratives croisees `insane_frames_walk_normal`, `insane_frames_walk_insane`, `insane_frames_stand_pain`.
- Verdict: lot valide; aucune correction TS necessaire.
- Checklist appliquee: ownership confirme dans `packages/game/src/m_insane.ts`; comparaison C vs TS des distances, bornes de frames, callbacks `insane_scream`, `endfunc` `insane_walk`/`insane_run`, et table douleur debout; commentaires d'en-tete des fonctions portees `insane_walk`, `insane_run` et `insane_pain` verifies; runtime atteignable via `SP_misc_insane` dans `g_spawn.ts`, `monsterinfo.walk`/`monsterinfo.run`/`pain`, puis `M_MoveFrame`; `apps/web` consomme le flux full-game/runtime sans logique parallele `misc_insane`; `renderer-three` doit consommer les sorties visibles generales `modelindex`, `frame`, `oldframe` et les sons via les adapters existants, sans branchement specifique `insane` attendu pour ces tables.
- Tests lances et OK: `npm run verify:m-insane`, `npm run verify:m-insane:header`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`.
- Prochain lot recommande: continuer avec `insane_frames_stand_death`, `insane_move_stand_death`, `insane_frames_crawl`, `insane_move_crawl`, `insane_move_runcrawl`, `insane_frames_crawl_pain`, `insane_move_crawl_pain`, puis `insane_frames_crawl_death`/`insane_move_crawl_death` si le lot reste coherent.
- Blocages: aucun.

## Session 2026-05-06 - lot initial large

- Lot traite: sons/globals initiaux `sound_fist`, `sound_shake`, `sound_moan`, `sound_scream`; fonctions sonores `insane_fist`, `insane_shake`, `insane_moan`, `insane_scream`; prototypes initiaux `insane_stand` a `insane_onground` reclasses comme doublons non applicables; premieres tables/moves de `insane_frames_stand_normal` a `insane_move_down`, incluant les lignes declaratives croisees correspondantes.
- Verdict: lot valide; aucune correction TS necessaire.
- Checklist appliquee: ownership confirme dans `packages/game/src/m_insane.ts`; doublons/prototypes identifies; comparaison C vs TS des sons, callbacks, distances, bornes de frames et `thinkfunc`; commentaires d'en-tete des fonctions portees verifies; runtime atteignable via `SP_misc_insane` dans `g_spawn.ts`, puis `walkmonster_start`/`flymonster_start` et `M_MoveFrame`; `apps/web` consomme le flux full-game/runtime sans logique parallele `misc_insane`; `renderer-three` doit consommer les sorties visibles `modelindex`, `frame`, `oldframe` et sons/effets via les adapters existants, pas de branchement specifique `insane` attendu pour ce lot.
- Tests lances et OK: `npm run verify:m-insane`, `npm run verify:m-insane:header`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`, `npm run typecheck`, `git diff --check`.
- Prochain lot recommande: continuer avec `insane_frames_walk_normal`, `insane_move_walk_normal`, `insane_move_run_normal`, `insane_frames_walk_insane`, `insane_move_walk_insane`, `insane_move_run_insane`, puis `insane_frames_stand_pain`/`insane_move_stand_pain` si le lot reste coherent.
- Blocages: aucun. Le worktree contenait deja une modification non liee dans `scripts/verify/quake2-m-hover-header.ts`, laissee intacte.
