# Progress TS - packages/game/src/m_gunner.ts

## Session 2026-05-27 - validation TS croisee gros lot

- Lot traite: `FRAME_stand01` a `FRAME_pain203` (180 symboles).
- Verdict: `Couvert C/H` pour les macros dont la matrice C/H `game_m_gunner.h.md` est `Valide` avec proprietaire `packages/game/src/m_gunner.ts`; valeurs TS controlees contre `Quake-2-master/game/m_gunner.h`.
- Corrections: documentation uniquement, aucun code TS modifie.
- Tests/verifications: comparaison mecanisee macros H/TS, ownership C/H et valeurs numeriques; pas de typecheck car aucun code TS modifie.
- Integration runtime/apps-web/renderer-three: non applicable pour ce lot isole de constantes de frames/macros; consommation via les moves/runtime du monstre.
- Prochain lot recommande: traiter le premier symbole non couvert ou suspect restant.

## Session 2026-05-27 - validation TS croisee fin gros lot

- Lot traite: tout le reste, de `FRAME_pain204` a `randomInt` (117 symboles).
- Verdict: 99 symboles `Couvert C/H` et 18 helpers/caches locaux `Category: New` marques `Valide`.
- Preuves: macros H `m_gunner.h` et `q_shared.h` verifiees via matrices C/H `game_m_gunner.h.md` / `game_q_shared.h.md`; fonctions, tables, moves et constantes sons croisees avec `game_m_gunner.c.md`; proprietaire attendu `packages/game/src/m_gunner.ts`.
- Corrections: ajout d'entetes explicites `Original name: N/A`, `Source: N/A (...)`, `Category: New` pour les caches de sons runtime et helpers locaux.
- Tests/verifications: `npm run verify:m-gunner:header`, `npm run verify:m-gunner:source-parity`, `npm run verify:m-gunner`, `npm run typecheck`, `git diff --check`.
- Integration runtime/apps-web/renderer-three: runtime integre via spawn `monster_gunner`, callbacks `monsterinfo`, moves, sons, fire bullet/grenade, spawn registry et exports; `apps/web` consomme le runtime full-game; `renderer-three` consomme entites, frames, sons/temp entities produits, sans correction renderer dediee dans ce lot.
- Prochain lot recommande: aucun, matrice TS terminee.
