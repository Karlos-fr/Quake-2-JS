# Progress TS - packages/game/src/m_boss31.ts

## Dernier lot traite

- Lot: constantes `FRAME_walk01` a `FRAME_walk25` et `MODEL_SCALE`.
- Verdict: `Couvert C/H` pour les 26 macros portees depuis `Quake-2-master/game/m_boss31.h`.
- Preuves: matrice C/H `game_m_boss31.h.md` ouverte; chaque macro du lot y pointe vers `packages/game/src/m_boss31.ts` avec cible homonyme `Valide`; comparaison locale des valeurs H/TS confirmee de 163 a 187 et `MODEL_SCALE` `1.000000`/`1.0`.
- Corrections: matrice TS completee avec `Original name`, `Source declaree`, `Category: Ported`, lien C/H, `Statut croise` et `Validation TS`.

## Tests de reference

- Aucun test lance: modification documentaire uniquement; verification ponctuelle par extraction des constantes C/H et TS.
- `git diff --check` a lancer en verification finale de session si aucun code TS ne change.

## Decisions importantes

- Le fichier TS proprietaire attendu est bien `packages/game/src/m_boss31.ts` pour les macros de `game/m_boss31.h`; les homonymes d'autres monstres restent proprietaires de leurs propres fichiers `.h` et `.ts`.
- L'entete de fichier TS couvre explicitement `game/m_boss31.h` et `game/m_boss31.c`; aucun entete par constante n'a ete ajoute pour eviter un bruit disproportionne sur les macros generees.
- Les homonymes `FRAME_stand01` a `FRAME_stand51` existent dans d'autres monstres, notamment `m_boss32.ts`, mais avec leurs propres sources/proprietaires; pas de doublon du couple `Original name` + `Source declaree`.
- Les homonymes `FRAME_walk01` a `FRAME_walk25` existent aussi dans d'autres monstres, mais avec leurs propres sources/proprietaires; pas de doublon du couple `Original name` + `Source declaree`.
- Integration runtime/apps-web/renderer-three: ces constantes alimentent `jorg_move_stand` via `G_RunFrame`/`M_MoveFrame`; `apps/web` et `renderer-three` consomment les frames d'entite produites par le runtime, sans integration specifique attendue pour les constantes elles-memes.
- Integration runtime/apps-web/renderer-three: `FRAME_walk01` a `FRAME_walk25` alimentent `jorg_move_start_walk`, `jorg_move_walk`, `jorg_move_run` et `jorg_move_end_walk`; `MODEL_SCALE` est applique dans `SP_monster_jorg`. Pas d'integration web/renderer directe attendue pour ces constantes seules.
## Session 2026-05-27 - lot elargi

- Lot: `FRAME_walk01` a `FRAME_walk25`, puis `MODEL_SCALE`.
- Verdict: `Couvert C/H` pour 26 macro(s) portee(s) depuis `Quake-2-master/game/m_boss31.h`.
- Preuves: valeurs TS comparees aux macros H, matrice C/H `game_m_boss31.h.md` avec statut `Valide` et proprietaire attendu `packages/game/src/m_boss31.ts`; ownership package `packages/game` conforme au module source `game`; pas de doublon du couple `Original name` + `Source declaree` dans ce fichier.
- Corrections: matrice TS completee avec `Original name`, `Source declaree`, `Category: Ported`, lien C/H, `Statut croise` et `Validation TS`. Aucun code TS modifie.
- Integration runtime/apps-web/renderer-three: constantes de frames/scale consommees par les moves/spawn du gameplay via `G_RunFrame`/`M_MoveFrame` ou `monsterinfo.scale`; pas d'integration web/renderer directe attendue pour ces macros seules.
- Tests: non lances; modification documentaire uniquement.
- Prochain lot recommande: `MZ2_JORG_*`, constantes sons et handles, puis helpers/fonctions Jorg selon risque.

## Session 2026-05-27 - fin de matrice

- Lot: les 89 symboles restants, de `MZ2_JORG_MACHINEGUN_L1` a `normalizeVec3`.
- Verdict: fichier termine dans la matrice TS actuelle avec 278 symboles, 249 `Couvert C/H`, 28 `Category: New` valides, 1 `Category: Adapter` valide et 0 a auditer.
- Preuves: matrice C/H `game_m_boss31.c.md` ouverte; symboles portes verifies comme `Valide` avec proprietaire attendu `packages/game/src/m_boss31.ts`; valeurs `MZ2_JORG_*` comparees aux definitions originales `q_shared.h`/commentaires `m_flash.c`; spawn/runtime verifies via `g_spawn.ts`, `g_save.ts` et les harness `m-boss31`.
- Corrections: ajout d'en-tetes explicites `Original name: N/A`, `Source: N/A (...)`, `Category: New` dans `m_boss31.ts` pour les aliases locaux, caches runtime et helpers locaux. Matrice TS completee avec `Original name`, `Source declaree`, `Category`, lien C/H, `Statut croise` et `Validation TS`.
- Integration runtime/apps-web/renderer-three: runtime integre via `monster_jorg`, `monsterinfo`, moves, sons, projectiles, Makron handoff et registres de spawn/save. `apps/web` consomme le runtime full-game et les evenements sons/temp entities; `renderer-three` consomme les modeles/frames/temp entities produits, sans correction renderer dediee a faire dans ce lot.
- Tests: `npm run verify:m-boss31:header`, `npm run verify:m-boss31:source-parity`, `npm run verify:m-boss31`, `npm run typecheck`, `git diff --check`.
- Prochain lot recommande: aucun.
