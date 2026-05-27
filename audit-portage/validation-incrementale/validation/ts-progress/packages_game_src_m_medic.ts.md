# Progress TS croise - packages/game/src/m_medic.ts

- Fichier TS: `packages/game/src/m_medic.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_m_medic.ts.md`
- Statut: Termine
- Dernier lot valide: `MZ2_MEDIC_BLASTER_1` a `vec3Distance`
- Prochain lot recommande: Aucun.

## 2026-05-27 - Gros bloc initial

- Lot traite: 238 symboles issus de `Quake-2-master/game/m_medic.h`: toutes les macros `FRAME_*` (`FRAME_walk1` a `FRAME_attack60`) et `MODEL_SCALE`.
- Verdict: `Couvert C/H` pour tout le lot.
- Preuves: valeurs TS comparees aux macros H, matrice C/H `game_m_medic.h.md` en `Valide`, proprietaire attendu `packages/game/src/m_medic.ts`, package `packages/game` conforme.
- Corrections: aucune modification de code TS.
- Tests/verifications: comparaison PowerShell H/TS du lot OK; controle C/H ponctuel `FRAME_walk1`, `FRAME_attack60`, `MODEL_SCALE`; `npm run verify:m-medic:header`; `git diff --check`.
- Integration: frames consommees par les moves du runtime gameplay via `G_RunFrame` / `M_MoveFrame`; `MODEL_SCALE` applique au spawn medic. Pas d'integration directe `apps/web` ou `renderer-three` attendue pour ces constantes seules.

## 2026-05-27 - Fin de matrice

- Lot traite: 73 symboles restants, de `MZ2_MEDIC_BLASTER_1` a `vec3Distance`: alias flash local, constantes sons, caches runtime, fonctions/tables/moves `medic_*`, spawn et helpers locaux.
- Verdict: `Couvert C/H` pour 53 symboles ported via `game_m_medic.c.md`; `Valide` pour 20 symboles `Category: New` avec `Original name: N/A` et `Source declaree: N/A (<raison courte>)`.
- Preuves: matrice C/H `game_m_medic.c.md` en `Valide`, proprietaire attendu `packages/game/src/m_medic.ts`, package `packages/game` conforme, en-tetes ported existants pour les fonctions, en-tetes New ajoutes/verifies pour alias, caches et helpers.
- Corrections: ajout d'en-tetes `Category: New`/`Ported` dans `packages/game/src/m_medic.ts`; mise a jour de la matrice TS, de ce progress file et de la ligne globale `m_medic.ts`.
- Tests/verifications: `npm run verify:m-medic:header`, `npm run verify:m-medic:source-parity`, `npm run verify:m-medic`, `npm run typecheck`, `git diff --check`.
- Integration: runtime integre via `SP_monster_medic`, precache, callbacks `monsterinfo`, moves, sons, blaster, cable de resurrection, temp entity `TE_MEDIC_CABLE_ATTACK` et `walkmonster_start`. `apps/web` consomme le runtime full-game; `renderer-three` consomme les entites/frames/temp entities produites, sans correction dediee attendue dans ce lot.
