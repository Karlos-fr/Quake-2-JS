# Progress TS - packages/game/src/m_float.ts

- Fichier TS: `packages/game/src/m_float.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_m_float.ts.md`
- Statut: En cours

## Lots traites

- `FRAME_actvat01` a `FRAME_actvat31`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_float.ts`, source declaree `Quake-2-master/game/m_float.h`, matrice C/H `game_m_float.h.md` validee; marquees `Couvert C/H` dans la matrice TS.
- `FRAME_attak101` a `FRAME_attak114`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_float.ts`, source declaree `Quake-2-master/game/m_float.h`, matrice C/H `game_m_float.h.md` validee; marquees `Couvert C/H` dans la matrice TS.
- `FRAME_attak201` a `FRAME_attak225`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_float.ts`, source declaree `Quake-2-master/game/m_float.h`, matrice C/H `game_m_float.h.md` validee; marquees `Couvert C/H` dans la matrice TS.
- `FRAME_attak301` a `FRAME_attak334`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_float.ts`, source declaree `Quake-2-master/game/m_float.h`, matrice C/H `game_m_float.h.md` validee; marquees `Couvert C/H` dans la matrice TS.
- `FRAME_death01` a `FRAME_stand152`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_float.ts`, source declaree `Quake-2-master/game/m_float.h`, matrice C/H `game_m_float.h.md` validee; marquees `Couvert C/H` dans la matrice TS.
- `FRAME_stand201` a `FRAME_stand252`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_float.ts`, source declaree `Quake-2-master/game/m_float.h`, matrice C/H `game_m_float.h.md` validee; marquees `Couvert C/H` dans la matrice TS.

## Preuves consultees

- `packages/game/src/m_float.ts`: constantes exportees `FRAME_actvat01` a `FRAME_actvat31` aux valeurs 0 a 30.
- `Quake-2-master/game/m_float.h`: macros `FRAME_actvat01` a `FRAME_actvat31` aux valeurs 0 a 30.
- `audit-portage/validation-incrementale/validation/matrices/game_m_float.h.md`: lignes macros `FRAME_actvat01` a `FRAME_actvat31` ciblees vers `packages/game/src/m_float.ts`, statut C/H `Valide`.
- `packages/game/src/m_float.ts`: constantes exportees `FRAME_attak101` a `FRAME_attak114` aux valeurs 31 a 44.
- `Quake-2-master/game/m_float.h`: macros `FRAME_attak101` a `FRAME_attak114` aux valeurs 31 a 44.
- `audit-portage/validation-incrementale/validation/matrices/game_m_float.h.md`: lignes macros `FRAME_attak101` a `FRAME_attak114` ciblees vers `packages/game/src/m_float.ts`, statut C/H `Valide`.
- `packages/game/src/m_float.ts`: constantes exportees `FRAME_attak201` a `FRAME_attak225` aux valeurs 45 a 69.
- `Quake-2-master/game/m_float.h`: macros `FRAME_attak201` a `FRAME_attak225` aux valeurs 45 a 69.
- `audit-portage/validation-incrementale/validation/matrices/game_m_float.h.md`: lignes macros `FRAME_attak201` a `FRAME_attak225` ciblees vers `packages/game/src/m_float.ts`, statut C/H `Valide`.
- `packages/game/src/m_float.ts`: constantes exportees `FRAME_attak301` a `FRAME_attak334` aux valeurs 70 a 103.
- `Quake-2-master/game/m_float.h`: macros `FRAME_attak301` a `FRAME_attak334` aux valeurs 70 a 103.
- `audit-portage/validation-incrementale/validation/matrices/game_m_float.h.md`: lignes macros `FRAME_attak301` a `FRAME_attak334` ciblees vers `packages/game/src/m_float.ts`, statut C/H `Valide`.
- Recherche doublons dans `packages`: homonymes `FRAME_attak101` a `FRAME_attak334` presents dans d'autres monstres, mais avec sources/proprietaires distincts; ownership `packages/game` conforme a `game/m_float.h`.
- `packages/game/src/m_float.ts`: constantes exportees `FRAME_death01` a `FRAME_stand152` aux valeurs 104 a 195.
- `Quake-2-master/game/m_float.h`: macros `FRAME_death01` a `FRAME_stand152` aux valeurs 104 a 195.
- `audit-portage/validation-incrementale/validation/matrices/game_m_float.h.md`: lignes macros `FRAME_death01` a `FRAME_stand152` ciblees vers `packages/game/src/m_float.ts`, statut C/H `Valide`.
- Recherche doublons dans `packages/game/src`: homonymes `FRAME_death*`, `FRAME_pain*` et `FRAME_stand*` presents dans d'autres monstres, mais avec sources/proprietaires distincts; aucun doublon du couple `Original name` + `Source declaree` pour `Quake-2-master/game/m_float.h`.
- `packages/game/src/m_float.ts`: constantes exportees `FRAME_stand201` a `FRAME_stand252` aux valeurs 196 a 247.
- `Quake-2-master/game/m_float.h`: macros `FRAME_stand201` a `FRAME_stand252` aux valeurs 196 a 247.
- `audit-portage/validation-incrementale/validation/matrices/game_m_float.h.md`: lignes macros `FRAME_stand201` a `FRAME_stand252` ciblees vers `packages/game/src/m_float.ts`, statut C/H `Valide`.
- Recherche doublons dans `packages` et les matrices TS: homonymes `FRAME_stand201`/`FRAME_stand252` presents dans d'autres monstres, mais avec sources/proprietaires distincts; aucun doublon du couple `Original name` + `Source declaree` pour `Quake-2-master/game/m_float.h`.

## Tests

- Non lances: aucune modification de code TS, uniquement reclassement documentaire de constantes deja couvertes par la matrice C/H.
## Session 2026-05-27 - lot elargi

- Lot: `MODEL_SCALE`.
- Verdict: `Couvert C/H` pour 1 macro(s) portee(s) depuis `Quake-2-master/game/m_float.h`.
- Preuves: valeurs TS comparees aux macros H, matrice C/H `game_m_float.h.md` avec statut `Valide` et proprietaire attendu `packages/game/src/m_float.ts`; ownership package `packages/game` conforme au module source `game`; pas de doublon du couple `Original name` + `Source declaree` dans ce fichier.
- Corrections: matrice TS completee avec `Original name`, `Source declaree`, `Category: Ported`, lien C/H, `Statut croise` et `Validation TS`. Aucun code TS modifie.
- Integration runtime/apps-web/renderer-three: constantes de frames/scale consommees par les moves/spawn du gameplay via `G_RunFrame`/`M_MoveFrame` ou `monsterinfo.scale`; pas d'integration web/renderer directe attendue pour ces macros seules.
- Tests: non lances; modification documentaire uniquement.
- Prochain lot recommande: aucun dans la matrice TS actuelle; les lignes restantes sont deja classees `Valide` hors C/H par validations anterieures.

## Session 2026-05-27 - lot final elargi

- Lot: tous les symboles restants de `packages/game/src/m_float.ts`: constantes locales `MZ2_FLOAT_BLASTER_1`, `FLOAT_ZAP_OFFSET`, sons/handles runtime, tables `floater_frames_*`, moves `floater_move_*`, fonctions `floater_*`, `SP_monster_floater`, helpers `makeFrames`, `indexedThinks`, `precacheFloaterAssets`, `setVec3`, `subtractVec3` et `randomInt`.
- Verdict: `Couvert C/H` pour `MODEL_SCALE` et pour les fonctions/tables/moves portees dont le symbole TS est le proprietaire attendu dans `game_m_float.c.md`; `Valide` pour les helpers/constantes `Category: New` sans entite C/H proprietaire.
- Preuves: `game_m_float.h.md` valide `MODEL_SCALE`; `game_m_float.c.md` valide les fonctions et tables/moves floater avec cible `packages/game/src/m_float.ts`; `scripts/verify/quake2-m-float-source-parity.ts` compare les tables, moves, ordre de precache et consommateurs `random()`/`rand()`; `scripts/verify/quake2-m-float.ts` couvre spawn, moves, sons, blaster, melee, pain, mort et registre save; recherche `rg` sans doublon proprietaire pour le couple `Original name` + `Source declaree`.
- Corrections: commentaires d'entete ajoutes aux symboles `Category: New` dans `packages/game/src/m_float.ts`; matrice TS completee avec `Original name: N/A`, `Source declaree: N/A (<raison courte>)`, `Category: New` pour ces symboles; compteurs TS mis a jour.
- Integration runtime/apps-web/renderer-three: runtime integre via `ED_CallSpawn`/`SP_monster_floater`, callbacks `monsterinfo`, `G_RunFrame`/moves, sons, temp entities et blaster. `apps/web` consomme ce flux via le runtime full-game sans logique parallele dans ce lot. `renderer-three` consomme les entites/frames/temp entities produits par le runtime; pas d'adapter renderer propre a corriger dans `m_float.ts`.
- Tests: `npm run verify:m-float:header` OK, `npm run verify:m-float:source-parity` OK, `npm run verify:m-float` OK et `npm run typecheck` OK.
- Prochain lot recommande: aucun dans la matrice TS actuelle; les lignes restantes sont deja classees `Valide` hors C/H par validations anterieures.
