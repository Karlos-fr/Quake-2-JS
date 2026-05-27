# Progress TS - packages/game/src/m_soldier.ts

- Statut: Termine

## Session 2026-05-27 - lot elargi initial

- Lot: 200 premieres macros de frames de `FRAME_attak101` a `FRAME_stand324`.
- Verdict: `Couvert C/H` pour les 200 constantes portees depuis `Quake-2-master/game/m_soldier.h`.
- Preuves: valeurs TS comparees aux macros H; matrice C/H `game_m_soldier.h.md` avec statut `Valide` et proprietaire attendu `packages/game/src/m_soldier.ts`; ownership `packages/game` conforme au module source `game/m_soldier.h`; homonymes eventuels dans d'autres monstres traites comme sources/proprietaires distincts.
- Corrections: matrice TS completee avec `Original name`, `Source declaree`, `Category: Ported`, lien C/H, `Statut croise` et `Validation TS`. Aucun code TS modifie.
- Integration runtime/apps-web/renderer-three: macros de frames consommees par les moves soldier via `G_RunFrame`/`M_MoveFrame`; pas d'integration web/renderer directe attendue pour ces constantes seules.
- Tests: non lances; modification documentaire uniquement.
- Prochain lot recommande: `FRAME_stand325` et suivants, puis les autres macros de frames contigues avant sons/helpers/fonctions.

## Session 2026-05-27 - gros lot frames stand/death

- Lot: 250 macros de frames contigues de `FRAME_stand325` a `FRAME_death509`.
- Verdict: `Couvert C/H` pour les 250 constantes portees depuis `Quake-2-master/game/m_soldier.h`.
- Preuves: valeurs TS comparees aux macros H (`200..449`); matrice C/H `game_m_soldier.h.md` avec statut `Valide` et proprietaire attendu `packages/game/src/m_soldier.ts`; ownership `packages/game` conforme au module source `game/m_soldier.h`; recherche ciblee des bornes du lot sans doublon proprietaire hors `m_soldier.ts`.
- Corrections: matrice TS completee avec `Original name`, `Source declaree`, `Category: Ported`, lien C/H, `Statut croise` et `Validation TS`. Aucun code TS modifie.
- Integration runtime/apps-web/renderer-three: macros de frames consommees par les moves soldier via `G_RunFrame`/`M_MoveFrame`; pas d'integration web/renderer directe attendue pour ces constantes seules.
- Tests: comparaison PowerShell TS/H/C-H du lot; `npm run verify:m-soldier:header` OK; `git diff --check` OK avec avertissements LF/CRLF habituels.
- Prochain lot recommande: `FRAME_death510` a `FRAME_death610`, puis `MODEL_SCALE` avant sons/helpers/fonctions.

## Session 2026-05-27 - fin du fichier

- Lot: 160 symboles restants, de `FRAME_death510` a `crandom`: dernier bloc de frames, `MODEL_SCALE`, aliases muzzle flash, constantes/handles de sons, tables/moves/fonctions soldier, spawn wrappers et helpers locaux.
- Verdict: fichier termine dans la matrice TS actuelle. `Couvert C/H` pour les 116 symboles ported du lot; `Valide` pour 43 symboles `Category: New`; `Non applicable` pour `crandom`, importe depuis `g_local` et non proprietaire de `m_soldier.ts`.
- Preuves: dernieres macros comparees a `Quake-2-master/game/m_soldier.h`; matrice C/H `game_m_soldier.h.md` en `Valide`; fonctions/tables/moves/globals croises avec `game_m_soldier.c.md` en `Valide` et proprietaire attendu `packages/game/src/m_soldier.ts`; ownership `packages/game` conforme.
- Corrections: ajout d'en-tetes `Category: New` dans `m_soldier.ts` pour aliases muzzle flash, caches runtime de sons et helpers locaux; matrice TS completee; avancement global mis a jour.
- Integration runtime/apps-web/renderer-three: runtime integre via spawn soldiers, callbacks `monsterinfo`, moves, sons, tirs, mort/gibs et `walkmonster_start`; `apps/web` consomme le runtime full-game; `renderer-three` consomme entites/frames/temp entities produites, sans correction dediee attendue dans ce lot.
- Tests: `npm run verify:m-soldier:header` OK; `npm run verify:m-soldier:source-parity` OK; `npm run verify:m-soldier` OK; `npm run typecheck` OK; `git diff --check` OK avec avertissements LF/CRLF habituels.
- Prochain lot recommande: aucun.
