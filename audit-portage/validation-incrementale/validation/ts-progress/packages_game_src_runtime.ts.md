# Progress TS - packages/game/src/runtime.ts

## Etat courant

- Statut: En cours.
- Dernier lot valide: 111 constantes runtime/reexports, de `WEAP_BLASTER` a `PLAT_LOW_TRIGGER`.
- Verdict du lot: `88 Couvert C/H`, `23 Valide` adapters/redecoupages, `0` non conforme.
- Preuves: valeurs TS comparees avec `Quake-2-master/game/g_local.h`, `game/game.h`, `game/g_func.c` et `game/q_shared.h`; matrices C/H croisees `game_g_local.h.md`, `game_game.h.md`, `game_g_func.c.md`, `game_q_shared.h.md`; ownership confirme pour les constantes runtime, reexports qcommon classes `Adapter`, et constantes `STATE_*`/`DOOR_*`/`PLAT_LOW_TRIGGER` classees `Valide` car partagees dans runtime.ts mais consommees par `g_func.ts`.

## Tests de reference

- Verification statique Node des valeurs: 111 constantes runtime/reexports alignees avec C/H.
- Verification statique Node des compteurs matrice: 211 symboles, 94 `Couvert C/H`, 107 `Valide`, 10 `A verifier`.
- `npm run typecheck`
- `git diff --check -- packages/game/src/runtime.ts audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_runtime.ts.md audit-portage/validation-incrementale/validation/ts-progress/packages_game_src_runtime.ts.md audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL_TS.md`

## Decisions

- Les entites `Category: New` du lot sont des types, interfaces et helpers du runtime adapter TypeScript, sans proprietaire C/H direct; elles sont donc classees explicitement avec `Original name: N/A` et `Source declaree: N/A (game runtime adapter)`.
- Les reexports `AREA_*`, `DF_*` et `SPLASH_*` restent des adapters runtime: le proprietaire C/H canonique est `packages/qcommon/src/q_shared.ts`.
- Les constantes `MOVETYPE_*` sont les valeurs de l'enum C `movetype_t`; `runtime.ts` est le proprietaire effectif consomme par le runtime et reexporte par `g_local.ts`.
- Les constantes `STATE_*`, `DOOR_*` et `PLAT_LOW_TRIGGER` viennent de `game/g_func.c`; elles restent dans runtime.ts comme constantes partagees consommees par `g_func.ts`, donc marquees `Valide` sans les compter comme `Couvert C/H`.
- Les entites portees encore marquees `Entete incomplet` dans la matrice (`GameClientPersistant`, `GameClientRespawn`, `GameClient`, `GameEntity`, fonctions de creation client, `Think_Delay`, `reserveModelConfigstring`) demandent une passe ownership dediee.

## Prochain lot recommande

Traiter les 10 entites restantes a en-tete incomplet ou sans lien source: `GameClientPersistant`, `GameClientRespawn`, `GameClient`, `GameEntity`, `createGameClientPersistant`, `createGameClientRespawn`, `cloneGameClientPersistant`, `createGameClient`, `Think_Delay`, `reserveModelConfigstring`.
