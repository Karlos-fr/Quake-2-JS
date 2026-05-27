# Progress TS - packages/game/src/m_supertank.ts

## Session 2026-05-27 - validation TS croisee gros lot

- Lot traite: `FRAME_attak1_1` a `FRAME_right_4` (180 symboles).
- Verdict: `Couvert C/H` pour les macros dont la matrice C/H `game_m_supertank.h.md` est `Valide` avec proprietaire `packages/game/src/m_supertank.ts`; valeurs TS controlees contre `Quake-2-master/game/m_supertank.h`.
- Corrections: documentation uniquement, aucun code TS modifie.
- Tests/verifications: comparaison mecanisee macros H/TS, ownership C/H et valeurs numeriques; pas de typecheck car aucun code TS modifie.
- Integration runtime/apps-web/renderer-three: non applicable pour ce lot isole de constantes de frames/macros; consommation via les moves/runtime du monstre.
- Prochain lot recommande: traiter le premier symbole non couvert ou suspect restant.

## Session 2026-05-27 - validation TS croisee fin de fichier

- Lot traite: tous les 152 symboles restants, de `FRAME_right_5` a `randomInt`.
- Verdict: fichier termine. `FRAME_right_5` a `FRAME_stand_60` et `MODEL_SCALE` sont `Couvert C/H` via `game_m_supertank.h.md`; les sons, tables, moves et fonctions proprietaires sont `Couvert C/H` via `game_m_supertank.c.md`; les aliases locaux `MZ2_SUPERTANK_*`, `SOUND_TREAD`, handles runtime non proprietaires et helpers locaux sont `Valide` en `Category: New` avec `Original name: N/A` et `Source declaree: N/A (...)`.
- Corrections: ajout d'en-tetes explicites `Category: New` dans `packages/game/src/m_supertank.ts`; mise a jour de la matrice TS, du progress file et de la ligne globale TS de ce fichier.
- Tests/verifications: croisement des valeurs H/TS pour les macros restantes, matrice C/H `game_m_supertank.h.md` et `game_m_supertank.c.md`, ownership `packages/game/src/m_supertank.ts`, recherche des doublons/mauvais ownership pour les symboles du lot; tests npm listes dans le rapport final.
- Integration runtime/apps-web/renderer-three: runtime integre via le spawn `monster_supertank`, callbacks `monsterinfo`, moves, sons, tirs, temp entities et registre de spawn; `apps/web` consomme le runtime porte; `renderer-three` consomme les entites/frames/temp entities produites, sans correction renderer dediee a faire dans ce lot.
- Prochain lot recommande: aucun dans la matrice TS actuelle.
