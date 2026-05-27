# Progress TS - packages/game/src/m_hover.ts

- Fichier TS: `packages/game/src/m_hover.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_m_hover.ts.md`
- Statut: Termine
- Derniere session: validation croisee complete du fichier `m_hover.ts`.

## Lots valides

- `FRAME_stand01` a `FRAME_attak108`, puis `MODEL_SCALE`.
- Verdict: `Couvert C/H` pour 206 symboles.
- Preuves: valeurs TS/H alignees (`0..204`, `MODEL_SCALE = 1.0` vs `1.000000`), matrice C/H `game_m_hover.h.md` en `Valide`, proprietaire attendu `packages/game/src/m_hover.ts`.
- Ownership/package: conforme (`game` vers `packages/game`).
- Doublons: les noms de frames homonymes d'autres monstres appartiennent a d'autres sources.

- `MZ2_HOVER_BLASTER_1`, constantes sons restantes, caches runtime, tables/moves et fonctions restantes.
- Verdict: `Couvert C/H` pour 53 symboles ported, `Valide` pour 14 symboles `Category: New`.
- Preuves: matrice C/H `game_m_hover.c.md` en `Valide`, proprietaire attendu `packages/game/src/m_hover.ts`, source `Quake-2-master/game/m_hover.c` comparee pour sons, tables/moves, fonctions et spawn; `MZ2_HOVER_BLASTER_1` verifie a `62` contre `q_shared.h`.
- `Category: New`: alias local `MZ2_HOVER_BLASTER_1`, constantes asset locales `SOUND_ATTACK`/`SOUND_IDLE`, caches runtime `sound_*`, et helpers locaux `makeFrames`, `precacheHoverAssets`, `setVec3`, `subtractVec3`, avec `Original name: N/A` et `Source declaree: N/A (...)` dans le TS et la matrice.
- Ownership/package: conforme (`game` vers `packages/game`); pas de doublon proprietaire detecte dans le lot.

## Tests de reference

- `npm run verify:m-hover:header`: OK.
- `npm run verify:m-hover:source-parity`: OK.
- `npm run verify:m-hover`: OK.
- `npm run typecheck`: OK.
- `git diff --check`: OK, avec seulement avertissements LF/CRLF habituels.

## Prochain lot recommande

Aucun. La matrice TS actuelle de `packages/game/src/m_hover.ts` est terminee.
