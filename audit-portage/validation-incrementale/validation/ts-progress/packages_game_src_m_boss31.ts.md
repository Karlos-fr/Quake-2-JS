# Progress TS - packages/game/src/m_boss31.ts

## Dernier lot traite

- Lot: constantes de frames `FRAME_pain301` a `FRAME_pain325`.
- Verdict: `Couvert C/H` pour les 25 macros portees depuis `Quake-2-master/game/m_boss31.h`.
- Preuves: matrice C/H `game_m_boss31.h.md` ouverte; chaque macro du lot y pointe vers `packages/game/src/m_boss31.ts` avec cible homonyme `Valide`; comparaison locale des valeurs H/TS confirmee de 87 a 111.
- Corrections: matrice TS completee avec `Original name`, `Source declaree`, `Category: Ported`, lien C/H, `Statut croise` et `Validation TS`.

## Tests de reference

- Aucun test lance: modification documentaire uniquement; verification ponctuelle par extraction des constantes C/H et TS.

## Decisions importantes

- Le fichier TS proprietaire attendu est bien `packages/game/src/m_boss31.ts` pour les macros de `game/m_boss31.h`; les homonymes d'autres monstres restent proprietaires de leurs propres fichiers `.h` et `.ts`.
- L'entete de fichier TS couvre explicitement `game/m_boss31.h` et `game/m_boss31.c`; aucun entete par constante n'a ete ajoute pour eviter un bruit disproportionne sur les macros generees.
- Les homonymes `FRAME_pain301` a `FRAME_pain325` existent dans d'autres monstres, notamment `m_boss32.ts`, mais avec leurs propres sources/proprietaires; pas de doublon du couple `Original name` + `Source declaree`.

## Prochain lot recommande

- Continuer avec les constantes `FRAME_stand01` a `FRAME_stand51`.
