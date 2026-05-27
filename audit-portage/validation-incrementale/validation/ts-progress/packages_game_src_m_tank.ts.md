# Progress TS - packages/game/src/m_tank.ts

## Session 2026-05-27 - validation TS croisee gros lot

- Lot traite: `FRAME_stand01` a `FRAME_attak412` (180 symboles).
- Verdict: `Couvert C/H` pour les macros dont la matrice C/H `game_m_tank.h.md` est `Valide` avec proprietaire `packages/game/src/m_tank.ts`; valeurs TS controlees contre `Quake-2-master/game/m_tank.h`.
- Corrections: documentation uniquement, aucun code TS modifie.
- Tests/verifications: comparaison mecanisee macros H/TS, ownership C/H et valeurs numeriques; pas de typecheck car aucun code TS modifie.
- Integration runtime/apps-web/renderer-three: non applicable pour ce lot isole de constantes de frames/macros; consommation via les moves/runtime du monstre.
- Prochain lot recommande: traiter le premier symbole non couvert ou suspect restant.

## Session 2026-05-27 - validation TS croisee fin de fichier

- Lot traite: `FRAME_attak413` a `normalizeVec3` (223 symboles restants).
- Verdicts:
  - `Couvert C/H`: 182 symboles du lot, dont les macros `FRAME_attak413` a `MODEL_SCALE` via `game_m_tank.h.md`, les constantes `SOUND_*`, fonctions, tables, moves et `SP_monster_tank` via `game_m_tank.c.md`.
  - `Valide`: 41 symboles `Category: New` avec `Original name: N/A` et `Source declaree: N/A (<raison courte>)` pour les alias locaux `MZ2_TANK_*`, caches de sons runtime et helpers locaux.
- Corrections: ajout des commentaires d'entete `Category: New` dans `packages/game/src/m_tank.ts` pour les alias flash locaux, caches de sons runtime et helpers locaux; mise a jour de la matrice TS et de l'avancement global.
- Tests/verifications: parite mecanisee des 295 constantes H/TS, croisement des lignes C/H `game_m_tank.h.md` et `game_m_tank.c.md`, verification des proprietaires attendus `packages/game/src/m_tank.ts`, scripts `npm run verify:m-tank:header`, `npm run verify:m-tank:source-parity`, `npm run verify:m-tank`, `npm run typecheck`, `git diff --check`.
- Integration runtime/apps-web/renderer-three: runtime integre via spawn, callbacks `monsterinfo`, moves, sons, tirs, precache et `walkmonster_start`; `apps/web` consomme ce flux via le runtime full-game; `renderer-three` consomme les entites/frames/temp entities produites, sans correction renderer dediee dans ce lot.
- Prochain lot recommande: aucun, la matrice TS actuelle de `m_tank.ts` est terminee.
