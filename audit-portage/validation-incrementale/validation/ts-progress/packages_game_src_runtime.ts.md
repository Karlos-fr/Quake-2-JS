# Progress TS - packages/game/src/runtime.ts

## Etat courant

- Statut: Termine.
- Dernier lot valide: 10 entites restantes: structures client/entity, helpers d'initialisation client, `Think_Delay`, `reserveModelConfigstring`.
- Verdict du lot: `1 Couvert C/H`, `9 Valide`, `0` non conforme.
- Preuves: en-tetes TS verifies dans `packages/game/src/runtime.ts`; matrices C/H croisees `game_g_local.h.md`, `game_g_utils.c.md`, `packages_game_src_g_local.ts.md`, `packages_game_src_game.ts.md`; ownership confirme pour `Think_Delay` dans runtime.ts, structures runtime avec alias C-name dans `g_local.ts`/`game.ts`, helpers d'initialisation classes `Adapter`, et helper local `reserveModelConfigstring` classe `New`.

## Tests de reference

- Verification statique Node des valeurs: 111 constantes runtime/reexports alignees avec C/H.
- Verification statique Node des compteurs matrice: 211 symboles, 95 `Couvert C/H`, 116 `Valide`, 0 `A verifier`.
- `npm run typecheck`
- `git diff --check -- packages/game/src/runtime.ts audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_runtime.ts.md audit-portage/validation-incrementale/validation/ts-progress/packages_game_src_runtime.ts.md audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL_TS.md`

## Decisions

- Les entites `Category: New` du lot sont des types, interfaces et helpers du runtime adapter TypeScript, sans proprietaire C/H direct; elles sont donc classees explicitement avec `Original name: N/A` et `Source declaree: N/A (game runtime adapter)`.
- Les reexports `AREA_*`, `DF_*` et `SPLASH_*` restent des adapters runtime: le proprietaire C/H canonique est `packages/qcommon/src/q_shared.ts`.
- Les constantes `MOVETYPE_*` sont les valeurs de l'enum C `movetype_t`; `runtime.ts` est le proprietaire effectif consomme par le runtime et reexporte par `g_local.ts`.
- Les constantes `STATE_*`, `DOOR_*` et `PLAT_LOW_TRIGGER` viennent de `game/g_func.c`; elles restent dans runtime.ts comme constantes partagees consommees par `g_func.ts`, donc marquees `Valide` sans les compter comme `Couvert C/H`.
- `GameClientPersistant`, `GameClientRespawn`, `GameClient` et `GameEntity` restent proprietaires structurels dans `runtime.ts`; les noms C historiques sont exposes par aliases dans `g_local.ts` et `game.ts`.
- Les helpers `createGameClientPersistant`, `createGameClientRespawn`, `cloneGameClientPersistant` et `createGameClient` sont classes `Adapter`: ils initialisent ou copient les structures portees mais ne correspondent pas a une fonction C proprietaire.
- `Think_Delay` est le seul symbole de ce lot marque `Couvert C/H`, avec proprietaire C/H direct dans `game_g_utils.c.md`.
- `reserveModelConfigstring` est un helper local `Category: New` avec `Original name: N/A` et `Source declaree: N/A (game runtime adapter)`.

## Prochain lot recommande

Aucun pour `packages/game/src/runtime.ts`: les 211 symboles sont classes.
