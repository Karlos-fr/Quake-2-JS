# Progress TS - packages/game/src/m_insane.ts

- Fichier TS: `packages/game/src/m_insane.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_m_insane.ts.md`
- Statut: Termine
- Total symboles: 345
- Couvert C/H: 335
- Reste a auditer: 0

## Lots valides

- `FRAME_stand1` a `FRAME_cross28` (`280` macros de frames)
  - Verdict: `Couvert C/H`
  - Preuves: valeurs TS/H alignees de `0` a `279`, matrice C/H `game_m_insane.h.md` en `Valide`, proprietaire attendu `packages/game/src/m_insane.ts`, package `packages/game` conforme, aucun doublon d'en-tete `m_insane.h` trouve ailleurs dans les sources TS.
- `FRAME_cross29`, `FRAME_cross30`, `MODEL_SCALE`, sons, handles runtime, tables/moves, fonctions `insane_*`, `SP_misc_insane` et helpers locaux (`65` symboles)
  - Verdict: `Couvert C/H` pour les `55` symboles portes, `Valide` pour les `10` symboles `Category: New`.
  - Preuves: macros H `FRAME_cross29=280`, `FRAME_cross30=281`, `MODEL_SCALE=1.000000` alignees avec TS; matrices C/H `game_m_insane.h.md` et `game_m_insane.c.md` en `Valide`; proprietaire attendu `packages/game/src/m_insane.ts`; fonctions/tables/moves couverts par `npm run verify:m-insane`; entetes `Category: New` ajoutes pour constantes locales d'assets et helpers.

## Tests et verifications

- Comparaison Node TS/H/C-H du lot initial: OK.
- Recherche d'en-tetes/doublons `m_insane.h` dans les sources TS: OK.
- `npm run verify:m-insane:header`: OK.
- `npm run verify:m-insane`: OK.
- `npm run typecheck`: OK.
- `git diff --check`: OK, avec seulement avertissements LF/CRLF habituels du workspace.

## Integration

- Runtime: integre via `SP_misc_insane`, callbacks `monsterinfo`, moves, sons, douleur/mort/gibs et `walkmonster_start`/`flymonster_start`.
- `apps/web`: pas de correction dediee attendue; le web consomme le runtime porte et ses sorties.
- `renderer-three`: pas de correction renderer dediee; les entites, modeles et frames sont produits par le runtime et consommes par le rendu.

## Prochain lot recommande

- Aucun.
