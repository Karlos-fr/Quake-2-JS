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

## Tests

- Non lances: aucune modification de code TS, uniquement reclassement documentaire de constantes deja couvertes par la matrice C/H.

## Prochain lot recommande

- Continuer avec les macros de marche `FRAME_walk01` a `FRAME_walk27`.
