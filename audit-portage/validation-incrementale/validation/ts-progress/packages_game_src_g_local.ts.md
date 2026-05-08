# Progress TS - packages/game/src/g_local.ts

- Fichier TS: `packages/game/src/g_local.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_g_local.ts.md`
- Source principale: `Quake-2-master/game/g_local.h`
- Statut courant: En cours

## Dernier lot valide

- 2026-05-08: bloc `MOVETYPE_*` puis bloc declaratif/macros jusqu'a `CLOFS` valide. `MOVETYPE_NONE` a `MOVETYPE_BOUNCE`, `fieldtype_t`, `gitem_armor_t`, `client_persistant_t`, `client_respawn_t`, `mframe_t`, `mmove_t`, `monsterinfo_t`, `moveinfo_t`, `field_t`, `ITEM_INDEX`, `world`, `FOFS`, `STOFS`, `LLOFS` et `CLOFS` marques `Couvert C/H` par croisement avec `validation/matrices/game_g_local.h.md`. `gitem_t` marque `Valide` par lecture directe du typedef `struct gitem_s`; `createGameLocals`, `createLevelLocals` et `createSpawnTemp` marques `Valide` comme helpers `New` avec `Original name: N/A` et `Source declaree: N/A (local zero-initializer)`.
- Preuves session: lecture explicite de `README.md`, `CHECKLIST_VALIDATION_TS.md`, `CHECKLIST_VALIDATION_ENTITES.md`, `ORGANISATION_AGENTS.md`, matrice TS, progress file TS, `AVANCEMENT_GLOBAL_TS.md`, matrice C/H `game_g_local.h.md`, source `Quake-2-master/game/g_local.h`; verification usages runtime dans `g_phys.ts`, `g_save.ts`, `g_spawn.ts`, `g_items.ts`, `g_cmds.ts`, `g_trigger.ts`, `p_client.ts`, `p_weapon.ts`, `p_hud.ts`, exports publics dans `packages/game/src/index.ts`, et absence d'integration principale dans `apps/web`/`renderer-three`.
- Correction locale `packages/game/src/g_local.ts`: entete ajoutee pour `field_t`; commentaires de `createGameLocals`, `createLevelLocals`, `createSpawnTemp` corriges en `N/A`; commentaires de `ITEM_INDEX`, `world`, `FOFS`, `STOFS`, `LLOFS`, `CLOFS` corriges en `Category: Ported`.
- Doublons constates hors lot strict: `MOVETYPE_*` existent aussi exportes dans `packages/game/src/runtime.ts`; helpers locaux homonymes `ITEM_INDEX` existent dans `packages/game/src/g_items.ts` et `packages/game/src/p_weapon.ts`. A traiter dans les matrices de ces fichiers, sans modification ici.
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

- Aucun bloquant pour le bloc `MOVETYPE_*` a `CLOFS`.
- Point ouvert hors `g_local.h`: ownership de `VEC_UP`/`MOVEDIR_UP`/`VEC_DOWN`/`MOVEDIR_DOWN`, declares dans `g_utils.c` et dupliques dans `g_utils.ts`.

## Prochain lot recommande

- Si le prochain lot doit rester strictement dans `g_local.ts`, traiter les aliases prives `AMMO_BULLETS` a `AMMO_SLUGS`.
- Sinon, traiter la decision d'ownership pour `VEC_UP`/`MOVEDIR_UP`/`VEC_DOWN`/`MOVEDIR_DOWN` avec `g_utils.ts`, sans modifier `g_local.ts` en parallele.
