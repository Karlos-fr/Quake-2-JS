# Progress TS - packages/game/src/m_flyer.ts

- Fichier TS: `packages/game/src/m_flyer.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_m_flyer.ts.md`
- Statut: Termine
- Symboles: 240
- Couvert C/H: 221
- Category New valides: 19
- A auditer: 0

## Dernier lot valide

Session courante: validation TS croisee complete du fichier.

- Macros H `ACTION_*`, `FRAME_*` et `MODEL_SCALE`: croisees avec `game_m_flyer.h.md`, proprietaire attendu `packages/game/src/m_flyer.ts`, valeurs TS/H verifiees par `npm run verify:m-flyer:header`.
- Entites C `nextmove`, constantes de sons proprietaires, tables/moves `flyer_frames_*` / `flyer_move_*`, fonctions `flyer_*` et `SP_monster_flyer`: croisees avec `game_m_flyer.c.md`, proprietaire TS confirme, source parity verifiee par `npm run verify:m-flyer:source-parity` et `npm run verify:m-flyer`.
- Entites `Category: New`: aliases locaux `MZ2_FLYER_BLASTER_*`, constantes locales `SOUND_ATTACK3` / `SOUND_LOOP_IDLE`, handles runtime de sons et helpers locaux documentes avec `Original name: N/A`, `Source declaree: N/A (<raison courte>)`, `Category: New`.

## Tests de reference

- `npm run verify:m-flyer:header`
- `npm run verify:m-flyer:source-parity`
- `npm run verify:m-flyer`
- `npm run typecheck`
- `git diff --check -- packages/game/src/m_flyer.ts audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_m_flyer.ts.md audit-portage/validation-incrementale/validation/ts-progress/packages_game_src_m_flyer.ts.md audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL_TS.md`

## Decisions / integration

- Runtime: integre via `SP_monster_flyer`, callbacks `monsterinfo`, moves, sons, blaster/melee, `flymonster_start` et registre de spawn.
- apps/web: consomme le runtime full-game; pas de logique web parallele a corriger pour ce fichier.
- renderer-three: consomme les entites, modeles, frames et effets produits par le runtime; pas de correction renderer dediee pour ce lot.

## Prochain lot recommande

Aucun dans la matrice TS actuelle.
