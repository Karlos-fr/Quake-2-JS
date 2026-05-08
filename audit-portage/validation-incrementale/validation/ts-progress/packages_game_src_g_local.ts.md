# Progress TS - packages/game/src/g_local.ts

- Fichier TS: `packages/game/src/g_local.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_g_local.ts.md`
- Source principale: `Quake-2-master/game/g_local.h`
- Statut courant: En cours

## Dernier lot valide

- 2026-05-08: bloc items/spawnflags/moyens de mort de `IT_WEAPON` a `MOD_TARGET_BLASTER` marque `Couvert C/H` par croisement avec `validation/matrices/game_g_local.h.md`.
- Preuves session: lecture de `README.md`, `CHECKLIST_VALIDATION_TS.md`, `CHECKLIST_VALIDATION_ENTITES.md`, `ORGANISATION_AGENTS.md`, matrice TS, matrice C/H `game_g_local.h.md`, source `Quake-2-master/game/g_local.h`; verification d'usages runtime dans `g_items.ts`, `g_cmds.ts`, `g_spawn.ts`, `g_save.ts`, `g_monster.ts`, `g_trigger.ts`, `p_client.ts`, `p_view.ts`, et exports publics dans `packages/game/src/index.ts`.
- Correction locale `packages/game/src/g_local.ts`: suppression de dependances d'initialisation cycliques pour `movetype_t`/`MOVETYPE_*` et aliases locaux `AMMO_*`, en conservant les valeurs numeriques originales. Cette correction debloque les tests du lot sans changer l'API publique.
- `VEC_UP`, `MOVEDIR_UP`, `VEC_DOWN`, `MOVEDIR_DOWN` restent `Partiel`: ils proviennent de `Quake-2-master/game/g_utils.c` et sont aussi declares localement dans `packages/game/src/g_utils.ts`; ownership a traiter dans un lot dedie `g_utils.ts` ou decision explicite de rattachement.
- 2026-05-08: gros bloc declaratif apres `RANGE_FAR`, de `GIB_ORGANIC` a `PNOISE_IMPACT`, marque `Couvert C/H` par croisement avec `validation/matrices/game_g_local.h.md`.
- Preuves session: lecture de `README.md`, `CHECKLIST_VALIDATION_TS.md`, `CHECKLIST_VALIDATION_ENTITES.md`, `ORGANISATION_AGENTS.md`, matrice TS, matrice C/H `game_g_local.h.md`, source `Quake-2-master/game/g_local.h`; verification de l'unicite des declarations dans `packages/game/src` et des assertions existantes dans `scripts/verify/quake2-g-local-header.ts`.
- 2026-05-08: bloc initial de macros exportees `GAMEVERSION` a `RANGE_FAR` marque `Couvert C/H` par croisement avec `validation/matrices/game_g_local.h.md`.
- Preuves session: lecture de `README.md`, `CHECKLIST_VALIDATION_TS.md`, `CHECKLIST_VALIDATION_ENTITES.md`, `ORGANISATION_AGENTS.md`, matrice TS, matrice C/H `game_g_local.h.md`, source `Quake-2-master/game/g_local.h`; recherche d'usages/doublons TS.
- Doublons locaux constates hors lot: `BODY_QUEUE_SIZE` et `TAG_LEVEL` existent aussi en constantes locales non exportees dans `packages/game/src/g_utils.ts`; a traiter dans la matrice TS de `g_utils.ts`, pas dans ce fichier.

## Tests de reference

- `npm run verify:g-local:header`
- `npm run verify:g-items`
- `npm run verify:g-save`
- `npm run verify:g-spawn`
- `npm run verify:g-monster`
- `npm run verify:g-trigger`
- `npm run verify:p-client`
- `npm run verify:p-view`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:three-renderer`
- `npm run verify:full-game:input-bindings`
- `npm run verify:full-game:render-source`
- `npm run typecheck`

## Blocages

- Aucun bloquant pour le bloc `IT_WEAPON` a `MOD_TARGET_BLASTER`.
- Point ouvert hors `g_local.h`: ownership de `VEC_UP`/`MOVEDIR_UP`/`VEC_DOWN`/`MOVEDIR_DOWN`, declares dans `g_utils.c` et dupliques dans `g_utils.ts`.

## Prochain lot recommande

- Traiter la decision d'ownership pour `VEC_UP`/`MOVEDIR_UP`/`VEC_DOWN`/`MOVEDIR_DOWN` avec `g_utils.ts`, ou reprendre `g_local.ts` au bloc suivant `MOVETYPE_*` si le prochain lot doit rester strictement dans ce fichier.
