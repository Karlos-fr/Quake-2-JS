# Progress TS - packages/game/src/m_flipper.ts

## Dernier lot traite

- Lot: constantes de frames `FRAME_flppn201` a `FRAME_flpdth56`.
- Verdict: `Couvert C/H` pour les 61 macros portees depuis `Quake-2-master/game/m_flipper.h`.
- Preuves: matrice C/H `game_m_flipper.h.md` ouverte; chaque macro du lot y pointe vers `packages/game/src/m_flipper.ts` avec cible homonyme `Valide`; comparaison locale des valeurs H/TS confirmee de 99 a 159.
- Corrections: matrice TS completee avec `Original name`, `Source declaree`, `Category: Ported`, lien C/H, `Statut croise` et `Validation TS`.

## Tests de reference

- Aucun test lance: aucune modification de code TS/import; validation documentaire, ownership et comparaison ponctuelle source H/TS uniquement.

## Decisions importantes

- Le fichier TS proprietaire attendu est bien `packages/game/src/m_flipper.ts` pour les macros de `game/m_flipper.h`; l'entete de fichier TS couvre explicitement `game/m_flipper.h` et `game/m_flipper.c`.
- Aucun doublon proprietaire avec le meme couple `Original name` + `Source declaree` n'a ete trouve dans `packages/`; les occurrences restantes du lot sont la definition proprietaire et les usages attendus dans `m_flipper.ts`.
- Les lots precedents `FRAME_flpbit01` a `FRAME_flpbit20`, `FRAME_flptal01` a `FRAME_flptal21`, `FRAME_flphor01` a `FRAME_flphor24`, `FRAME_flpver01` a `FRAME_flpver29` et `FRAME_flppn101` a `FRAME_flppn105` restent `Couvert C/H`; le cumul audite est maintenant de 160 macros.

## Prochain lot recommande

- Continuer avec `MODEL_SCALE`, puis classer les constantes sons/helpers ou passer aux fonctions selon la coordination globale.
