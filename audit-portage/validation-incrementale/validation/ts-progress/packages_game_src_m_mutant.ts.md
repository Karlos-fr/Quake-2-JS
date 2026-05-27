# Progress TS - packages/game/src/m_mutant.ts

- Statut: Termine
- Symboles: 235
- Couvert C/H: 212
- Valide/New: 23
- A auditer: 0

## Dernier lot valide

Validation TS croisee complete du fichier. Lot traite: toutes les entrees de la matrice actuelle, de `FRAME_attack01` a `randomInt`.

Preuves obtenues pendant la session:
- macros `FRAME_*` et `MODEL_SCALE` croisees avec `game_m_mutant.h.md`, proprietaire attendu `packages/game/src/m_mutant.ts`;
- constantes `SOUND_*`, fonctions, tables `mutant_frames_*`, moves `mutant_move_*` et `SP_monster_mutant` croises avec `game_m_mutant.c.md`;
- caches runtime de sons et helpers locaux classes `Category: New` avec `Original name: N/A` et `Source declaree: N/A (...)`;
- package/ownership conforme `game` vers `packages/game`;
- aucun doublon proprietaire detecte dans le lot: les caches `sound_*` TS restent `New`, tandis que les entites C `sound_*` sont portees par les constantes `SOUND_*`.

## Tests de reference

- `npm run verify:m-mutant:header`
- `npm run verify:m-mutant:source-parity`
- `npm run verify:m-mutant`
- `npm run typecheck`
- `git diff --check`

## Prochain lot recommande

Aucun dans la matrice TS actuelle.
