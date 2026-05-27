# Progress TS - packages/game/src/m_infantry.ts

## Session 2026-05-27 - validation TS croisee gros lot

- Lot traite: `FRAME_gun02` a `FRAME_block01` (180 symboles).
- Verdict: `Couvert C/H` pour les macros dont la matrice C/H `game_m_infantry.h.md` est `Valide` avec proprietaire `packages/game/src/m_infantry.ts`; valeurs TS controlees contre `Quake-2-master/game/m_infantry.h`.
- Corrections: documentation uniquement, aucun code TS modifie.
- Tests/verifications: comparaison mecanisee macros H/TS, ownership C/H et valeurs numeriques; pas de typecheck car aucun code TS modifie.
- Integration runtime/apps-web/renderer-three: non applicable pour ce lot isole de constantes de frames/macros; consommation via les moves/runtime du monstre.
- Prochain lot recommande: traiter le premier symbole non couvert ou suspect restant.

## Session 2026-05-27 - validation TS croisee fin de fichier

- Lot traite: les 107 symboles restants, de `FRAME_block02` a `randomInt`.
- Verdict:
  - `Couvert C/H` pour 85 symboles portes: fin des macros `m_infantry.h`, `MODEL_SCALE`, les deux constantes `MZ2_INFANTRY_MACHINEGUN_*` presentes dans la matrice TS, les constantes de sons, `aimangles`, les tables/moves et les fonctions du monstre.
  - `Valide` pour 22 symboles `Category: New`: caches runtime de sons et helpers locaux (`makeFrames`, `indexedThinks`, `precacheInfantryAssets`, `soundOptions`, `infantryFlashOffset`, helpers vec3 et `randomInt`).
- Preuves: matrices C/H `game_m_infantry.h.md`, `game_q_shared.h.md` et `game_m_infantry.c.md` vues pendant la session, toutes avec proprietaire attendu `packages/game/src/m_infantry.ts` et statut C/H `Valide` ou portage deja couvert; valeurs des macros H/TS controlees mecaniquement.
- Corrections: ajout d'en-tetes `Category: New` dans `packages/game/src/m_infantry.ts` pour les caches/helpers locaux; mise a jour de la matrice TS et de l'avancement global pour ce fichier uniquement.
- Tests/verifications: `npm run verify:m-infantry:header`, `npm run verify:m-infantry:source-parity`, `npm run verify:m-infantry`, `npm run typecheck`, `git diff --check`.
- Integration runtime/apps-web/renderer-three: runtime integre via spawn, callbacks `monsterinfo`, moves, sons, melee/machinegun, mort/gibs et `walkmonster_start`; `apps/web` et `renderer-three` consomment les sorties runtime, sans logique parallele ni correction dediee attendue pour ce lot.
- Prochain lot recommande: aucun, la matrice TS actuelle est terminee.
