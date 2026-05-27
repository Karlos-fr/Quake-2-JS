# Progress TS - packages/game/src/m_parasite.ts

- Fichier TS: `packages/game/src/m_parasite.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_m_parasite.ts.md`
- Statut: Termine
- Symboles: 197
- Couvert C/H: 180
- Category New valides: 17
- A auditer: 0

## Dernier lot valide

Session courante: validation TS croisee complete du fichier.

- Macros H `FRAME_*` et `MODEL_SCALE`: croisees avec `game_m_parasite.h.md`, proprietaire attendu `packages/game/src/m_parasite.ts`, valeurs TS/H verifiees par `npm run verify:m-parasite:header`.
- Entites C proprietaires: constantes de sons `SOUND_*`, tables/moves `parasite_frames_*` / `parasite_move_*`, fonctions `parasite_*` et `SP_monster_parasite` croisees avec `game_m_parasite.c.md`, proprietaire TS confirme, source parity verifiee par `npm run verify:m-parasite:source-parity` et `npm run verify:m-parasite`.
- Entites `Category: New`: caches runtime de sons, `makeFrames`, `indexedThinks`, `precacheParasiteAssets`, `setVec3`, `subtractVec3` et `vec3Length` documentes avec `Original name: N/A`, `Source declaree: N/A (<raison courte>)`, `Category: New`.

## Tests de reference

- `npm run verify:m-parasite:header`
- `npm run verify:m-parasite:source-parity`
- `npm run verify:m-parasite`
- `npm run typecheck`
- `git diff --check -- packages/game/src/m_parasite.ts audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_m_parasite.ts.md audit-portage/validation-incrementale/validation/ts-progress/packages_game_src_m_parasite.ts.md audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL_TS.md`

## Decisions / integration

- Runtime: integre via `SP_monster_parasite`, callbacks `monsterinfo`, moves, sons, attaque drain, temp entity `TE_PARASITE_ATTACK`, dommages et `walkmonster_start`.
- apps/web: consomme le runtime full-game et ses sorties; pas de logique web parallele a corriger pour ce fichier.
- renderer-three: consomme les entites, modeles, frames et temp entities produits par le runtime; pas de correction renderer dediee pour ce lot.

## Prochain lot recommande

Aucun dans la matrice TS actuelle.
