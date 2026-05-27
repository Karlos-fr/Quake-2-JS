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

## Tests

- Non lances: aucune modification de code TS, uniquement reclassement documentaire de constantes deja couvertes par la matrice C/H.

## Prochain lot recommande

- Continuer les macros de frames avec `FRAME_stand201` a `FRAME_stand252`.
