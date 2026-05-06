# Progress - Quake-2-master/game/m_medic.c

## 2026-05-06 - Lot initial sons/callbacks/moves

- Lot traite: sons/globals initiaux `sound_idle1` a `sound_hook_retract`, `medic_FindDeadMonster`, callbacks simples `medic_idle`, `medic_search`, `medic_sight`, tables/moves/fonctions `stand`, `walk`, `run`, et entrees declaratives correspondantes.
- Verdict: `Valide` pour 29 lignes, `Non applicable` pour 5 variables locales generees (`ent`, `best`).
- Ownership: `packages/game/src/m_medic.ts` est le fichier proprietaire; pas de doublon TS proprietaire trouve pour le lot. Les lignes `ent`/`best` sont des variables locales C, pas des entites de portage autonomes.
- Source C vs TS: sons compares aux `gi.soundindex` de `SP_monster_medic`; `medic_FindDeadMonster` compare aux filtres `findradius`/visible/health/owner/max_health; `idle/search/sight/run` compares aux appels sonores, selection d'ennemi, flags `AI_MEDIC`, `FoundTarget` et choix `stand/run`; tables `stand/walk/run` comparees via `verify:m-medic:source-parity`.
- Commentaires d'en-tete: ajoutes pour `medic_FindDeadMonster`, `medic_idle`, `medic_search`, `medic_sight`, `medic_stand`, `medic_walk`, `medic_run`.
- Runtime: integre via `monster_medic` dans `g_spawn.ts`, `SP_monster_medic`, callbacks `monsterinfo`, `G_RunFrame`/`M_MoveFrame`, sons enregistres et emis par le runtime.
- `apps/web`: le flux full-game consomme le runtime porte, les refresh frames et sons serveur/client; aucune logique medic parallele identifiee.
- `packages/renderer-three`: sorties visibles attendues pour ce lot = modele/frame/oldframe de l'entite medic; consommation presente via `ClientRefreshFrame` et `refresh-entity-sync`. Sons consommes cote web/audio, pas par le renderer.
- Tests lances OK: `npm run verify:m-medic`, `npm run verify:m-medic:source-parity`, `npm run verify:m-medic:header`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`, `npm run typecheck`, `git diff --check`.
- Prochain lot recommande: `medic_frames_pain1`, `medic_move_pain1`, `medic_frames_pain2`, `medic_move_pain2`, `medic_pain`, puis `medic_fire_blaster` si le lot reste coherent.

## 2026-05-06 - Lot douleurs et tir blaster

- Lot traite: `medic_frames_pain1`, `medic_move_pain1`, `medic_frames_pain2`, `medic_move_pain2`, `medic_pain`, `medic_fire_blaster`, variables locales `effect` liees, et entrees declaratives `medic_frames_pain1`/`medic_frames_pain2`.
- Verdict: `Valide` pour 10 lignes, `Non applicable` pour 2 variables locales `effect`.
- Ownership: `packages/game/src/m_medic.ts` reste le fichier proprietaire; `medic_pain` et `medic_fire_blaster` sont exportees par `packages/game/src/index.ts`, et aucun port proprietaire concurrent n'a ete retenu pour ce lot.
- Source C vs TS: tables pain comparees via `verify:m-medic:source-parity`; `medic_pain` compare sur skin, debounce, skip nightmare, choix `random() < 0.5`, moves et sons; `medic_fire_blaster` compare sur selection `EF_BLASTER`/`EF_HYPERBLASTER`/`0`, projection `MZ2_MEDIC_BLASTER_1`, visee enemy viewheight et appel `monster_fire_blaster`.
- Commentaires d'en-tete: `medic_pain` verifie; commentaire ajoute pour `medic_fire_blaster` avec la garde TS sur enemy invalide documentee.
- Runtime: atteignable depuis `monster_medic`/`SP_monster_medic`, callbacks `pain`, moves `medic_move_attackBlaster` et `medic_move_attackHyperBlaster`, puis `G_RunFrame`/`M_MoveFrame`; tir produit projectile, muzzleflash et effets reseau attendus.
- `apps/web`: le flux web ne contient pas de logique medic parallele; il consomme le runtime porte via le full-game, les snapshots/render source et les evenements audio/entites.
- `packages/renderer-three`: sorties visibles attendues = frames/modeles medic via entity state, projectile blaster avec `effects`, et muzzleflash/temp output cote runtime; renderer-three consomme les entites visibles et effets via le chemin render source/three renderer, pas de branchement gameplay local manquant identifie.
- Tests lances OK: `npm run verify:m-medic`, `npm run verify:m-medic:source-parity`, `npm run verify:m-medic:header`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`, `npm run typecheck`.
- Prochain lot recommande: `medic_dead`, `medic_frames_death`, `medic_move_death`, `medic_die`, variable locale `n`, puis `medic_duck_down`/`medic_duck_hold`/`medic_duck_up` si le lot reste coherent.
