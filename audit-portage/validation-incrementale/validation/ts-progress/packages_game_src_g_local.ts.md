# Progress TS - packages/game/src/g_local.ts

- Fichier TS: `packages/game/src/g_local.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_g_local.ts.md`
- Source principale: `Quake-2-master/game/g_local.h`
- Statut courant: En cours

## Dernier lot valide

- 2026-05-08: gros bloc declaratif apres `RANGE_FAR`, de `GIB_ORGANIC` a `PNOISE_IMPACT`, marque `Couvert C/H` par croisement avec `validation/matrices/game_g_local.h.md`.
- Preuves session: lecture de `README.md`, `CHECKLIST_VALIDATION_TS.md`, `CHECKLIST_VALIDATION_ENTITES.md`, `ORGANISATION_AGENTS.md`, matrice TS, matrice C/H `game_g_local.h.md`, source `Quake-2-master/game/g_local.h`; verification de l'unicite des declarations dans `packages/game/src` et des assertions existantes dans `scripts/verify/quake2-g-local-header.ts`.
- 2026-05-08: bloc initial de macros exportees `GAMEVERSION` a `RANGE_FAR` marque `Couvert C/H` par croisement avec `validation/matrices/game_g_local.h.md`.
- Preuves session: lecture de `README.md`, `CHECKLIST_VALIDATION_TS.md`, `CHECKLIST_VALIDATION_ENTITES.md`, `ORGANISATION_AGENTS.md`, matrice TS, matrice C/H `game_g_local.h.md`, source `Quake-2-master/game/g_local.h`; recherche d'usages/doublons TS.
- Doublons locaux constates hors lot: `BODY_QUEUE_SIZE` et `TAG_LEVEL` existent aussi en constantes locales non exportees dans `packages/game/src/g_utils.ts`; a traiter dans la matrice TS de `g_utils.ts`, pas dans ce fichier.

## Tests de reference

- `npm run verify:g-local:header`

## Blocages

- Aucun pour `g_local.ts` dans ce lot.

## Prochain lot recommande

- Continuer au premier symbole non couvert apres `PNOISE_IMPACT`: bloc items/spawnflags `IT_WEAPON` a `ITEM_TARGETS_USED`, puis `FFL_SPAWNTEMP`/`FFL_NOSPAWN`, en recroisant avec `game_g_local.h.md`, `g_items.ts`, `p_weapon.ts`, `g_spawn`/save-fields selon le symbole.
