# Progress TS - packages/game/src/m_chick.ts

- Fichier TS: `packages/game/src/m_chick.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_m_chick.ts.md`
- Statut: En cours

## Lots traites

- `FRAME_attak101` a `FRAME_attak113`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_chick.ts`, source declaree `Quake-2-master/game/m_chick.h`, matrice C/H `game_m_chick.h.md` validee; marquees `Couvert C/H` dans la matrice TS.
- `FRAME_attak114` a `FRAME_attak132`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_chick.ts`, source declaree `Quake-2-master/game/m_chick.h`, matrice C/H `game_m_chick.h.md` validee; marquees `Couvert C/H` dans la matrice TS.
- `FRAME_attak201` a `FRAME_attak216`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_chick.ts`, source declaree `Quake-2-master/game/m_chick.h`, matrice C/H `game_m_chick.h.md` validee; marquees `Couvert C/H` dans la matrice TS.
- `FRAME_death101` a `FRAME_death112`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_chick.ts`, source declaree `Quake-2-master/game/m_chick.h`, matrice C/H `game_m_chick.h.md` validee; marquees `Couvert C/H` dans la matrice TS.
- `FRAME_death201` a `FRAME_death223`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_chick.ts`, source declaree `Quake-2-master/game/m_chick.h`, matrice C/H `game_m_chick.h.md` validee; marquees `Couvert C/H` dans la matrice TS.
- `FRAME_duck01` a `FRAME_duck07`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_chick.ts`, source declaree `Quake-2-master/game/m_chick.h`, matrice C/H `game_m_chick.h.md` validee; marquees `Couvert C/H` dans la matrice TS.

- `FRAME_pain101` a `FRAME_stand230`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_chick.ts`, source declaree `Quake-2-master/game/m_chick.h`, matrice C/H `game_m_chick.h.md` validee; marquees `Couvert C/H` dans la matrice TS.
- `FRAME_walk01` a `FRAME_walk27`: macros de frames exportees, proprietaire TS confirme dans `packages/game/src/m_chick.ts`, source declaree `Quake-2-master/game/m_chick.h`, matrice C/H `game_m_chick.h.md` validee; marquees `Couvert C/H` dans la matrice TS.

## Preuves consultees

- `packages/game/src/m_chick.ts`: constantes exportees `FRAME_attak101` a `FRAME_attak113` aux valeurs 0 a 12.
- `Quake-2-master/game/m_chick.h`: macros `FRAME_attak101` a `FRAME_attak113` aux valeurs 0 a 12.
- `audit-portage/validation-incrementale/validation/matrices/game_m_chick.h.md`: lignes macros `FRAME_attak101` a `FRAME_attak113` ciblees vers `packages/game/src/m_chick.ts`, statut C/H `Valide`.
- `packages/game/src/m_chick.ts`: constantes exportees `FRAME_attak114` a `FRAME_attak132` aux valeurs 13 a 31.
- `Quake-2-master/game/m_chick.h`: macros `FRAME_attak114` a `FRAME_attak132` aux valeurs 13 a 31.
- `audit-portage/validation-incrementale/validation/matrices/game_m_chick.h.md`: lignes macros `FRAME_attak114` a `FRAME_attak132` ciblees vers `packages/game/src/m_chick.ts`, statut C/H `Valide`.
- `packages/game/src/m_chick.ts`: constantes exportees `FRAME_attak201` a `FRAME_attak216` aux valeurs 32 a 47.
- `Quake-2-master/game/m_chick.h`: macros `FRAME_attak201` a `FRAME_attak216` aux valeurs 32 a 47.
- `audit-portage/validation-incrementale/validation/matrices/game_m_chick.h.md`: lignes macros `FRAME_attak201` a `FRAME_attak216` ciblees vers `packages/game/src/m_chick.ts`, statut C/H `Valide`.
- `packages/game/src/m_chick.ts`: constantes exportees `FRAME_death101` a `FRAME_death112` aux valeurs 48 a 59.
- `Quake-2-master/game/m_chick.h`: macros `FRAME_death101` a `FRAME_death112` aux valeurs 48 a 59.
- `audit-portage/validation-incrementale/validation/matrices/game_m_chick.h.md`: lignes macros `FRAME_death101` a `FRAME_death112` ciblees vers `packages/game/src/m_chick.ts`, statut C/H `Valide`.
- Recherche doublons dans `packages`: homonymes de frames dans d'autres monstres, mais pas le meme couple `Original name` + `Source declaree`; ownership `packages/game` conforme a `game/m_chick.h`.
- `packages/game/src/m_chick.ts`: constantes exportees `FRAME_death201` a `FRAME_death223` aux valeurs 60 a 82.
- `Quake-2-master/game/m_chick.h`: macros `FRAME_death201` a `FRAME_death223` aux valeurs 60 a 82.
- `audit-portage/validation-incrementale/validation/matrices/game_m_chick.h.md`: lignes macros `FRAME_death201` a `FRAME_death223` ciblees vers `packages/game/src/m_chick.ts`, statut C/H `Valide`.
- Recherche doublons/imports dans `packages`: homonymes de frames dans d'autres monstres, mais sources/proprietaires distincts; aucun mauvais package ni mauvais ownership detecte pour le lot.
- `packages/game/src/m_chick.ts`: constantes exportees `FRAME_duck01` a `FRAME_duck07` aux valeurs 83 a 89.
- `Quake-2-master/game/m_chick.h`: macros `FRAME_duck01` a `FRAME_duck07` aux valeurs 83 a 89.
- `audit-portage/validation-incrementale/validation/matrices/game_m_chick.h.md`: lignes macros `FRAME_duck01` a `FRAME_duck07` ciblees vers `packages/game/src/m_chick.ts`, statut C/H `Valide`.
- Recherche doublons/imports dans `packages`: homonymes de frames dans d'autres monstres, mais sources/proprietaires distincts; aucun mauvais package ni mauvais ownership detecte pour le lot.

- `packages/game/src/m_chick.ts`: constantes exportees `FRAME_pain101` a `FRAME_stand230` aux valeurs 90 a 180.
- `Quake-2-master/game/m_chick.h`: macros `FRAME_pain101` a `FRAME_stand230` aux valeurs 90 a 180.
- `audit-portage/validation-incrementale/validation/matrices/game_m_chick.h.md`: lignes macros `FRAME_pain101` a `FRAME_stand230` ciblees vers `packages/game/src/m_chick.ts`, statut C/H `Valide`.
- Recherche doublons/imports dans `packages`: homonymes de frames dans d'autres monstres, mais sources/proprietaires distincts; aucun mauvais package ni mauvais ownership detecte pour le lot elargi.
- `packages/game/src/m_chick.ts`: constantes exportees `FRAME_walk01` a `FRAME_walk27` aux valeurs 181 a 207.
- `Quake-2-master/game/m_chick.h`: macros `FRAME_walk01` a `FRAME_walk27` aux valeurs 181 a 207.
- `audit-portage/validation-incrementale/validation/matrices/game_m_chick.h.md`: lignes macros `FRAME_walk01` a `FRAME_walk27` ciblees vers `packages/game/src/m_chick.ts`, statut C/H `Valide`.
- Entete fichier TS verifiee: `m_chick.ts` declare la source `game/m_chick.h` et `game/m_chick.c`; pour ces constantes simples, la matrice porte les metadonnees par symbole (`Original name`, `Source declaree`, `Category`).
- Recherche doublons/imports dans `packages` et `apps`: homonymes `FRAME_walk01`/`FRAME_walk27` dans d'autres monstres, mais sources/proprietaires distincts; aucun mauvais package ni mauvais ownership detecte pour le lot.

## Tests

- Non lances: aucune modification de code TS, uniquement reclassement documentaire de constantes deja couvertes par la matrice C/H.
## Session 2026-05-27 - lot elargi

- Lot: `FRAME_recln201` a `FRAME_recln240`, `FRAME_recln101` a `FRAME_recln140`, puis `MODEL_SCALE`.
- Verdict: `Couvert C/H` pour 81 macro(s) portee(s) depuis `Quake-2-master/game/m_chick.h`.
- Preuves: valeurs TS comparees aux macros H, matrice C/H `game_m_chick.h.md` avec statut `Valide` et proprietaire attendu `packages/game/src/m_chick.ts`; ownership package `packages/game` conforme au module source `game`; pas de doublon du couple `Original name` + `Source declaree` dans ce fichier.
- Corrections: matrice TS completee avec `Original name`, `Source declaree`, `Category: Ported`, lien C/H, `Statut croise` et `Validation TS`. Aucun code TS modifie.
- Integration runtime/apps-web/renderer-three: constantes de frames/scale consommees par les moves/spawn du gameplay via `G_RunFrame`/`M_MoveFrame` ou `monsterinfo.scale`; pas d'integration web/renderer directe attendue pour ces macros seules.
- Tests: non lances; modification documentaire uniquement.
- Prochain lot recommande: classer les constantes sons/handles et les tables `chick_frames_*` / `chick_move_*`.

## Session 2026-05-27 - fin de matrice TS

- Lot: les 73 symboles restants, de `MZ2_CHICK_ROCKET_1` a `randomInt`.
- Verdict: fichier termine dans la matrice TS actuelle: 386 symboles, 362 `Couvert C/H`, 24 `Category: New` valides, 0 a auditer.
- `Couvert C/H`: constantes `SOUND_*` proprietaires des globals sons selon `game_m_chick.c.md`, tables `chick_frames_*` et moves `chick_move_*` proprietaires attendus selon la matrice C/H `game_m_chick.c.md`.
- `Valide/New`: alias local `MZ2_CHICK_ROCKET_1`, caches runtime `sound_*`, et helpers locaux `makeFrames`, `indexedThinks`, `precacheChickAssets`, `soundOptions`, `setVec3`, `subtractVec3`, `normalizeVec3`, `randomInt`, avec entetes et matrice `Original name: N/A`, `Source declaree: N/A (<raison courte>)`, `Category: New`.
- Preuves: symboles presents dans `packages/game/src/m_chick.ts`; source C `Quake-2-master/game/m_chick.c`; flash id original dans `Quake-2-master/game/q_shared.h`; matrice C/H `game_m_chick.c.md` en `Valide`; ownership `packages/game` conforme au module source `game`.
- Doublons/ownership/package: aucun doublon proprietaire du meme couple `Original name` + `Source declaree` detecte dans ce fichier; les helpers locaux ne sont pas presentes comme portage proprietaire; imports inchanges.
- Corrections: ajout d'entetes `Category: New` dans `packages/game/src/m_chick.ts`; matrice TS completee; ligne globale mise a jour.
- Integration runtime/apps-web/renderer-three: runtime integre via `SP_monster_chick`, callbacks `monsterinfo`, moves, sons, rocket fire, precache et `walkmonster_start`; `apps/web` consomme le runtime porte; `renderer-three` consomme les entites/frames/temp entities produites, sans correction dediee attendue pour ce lot.
- Tests: `npm run verify:m-chick:header`, `npm run verify:m-chick:source-parity`, `npm run verify:m-chick`, `npm run typecheck`, `git diff --check`.
- Prochain lot recommande: aucun.
