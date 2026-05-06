# Progress - Quake-2-master/qcommon/cvar.c

## Dernier lot valide

- Lot du 2026-05-06: `cvar_vars`, `Cvar_InfoValidate`, `Cvar_FindVar`, `Cvar_VariableValue`, `Cvar_VariableString`, `Cvar_CompleteVariable`.
- Faux positifs locaux traites: `var` lie aux fonctions du lot, `cvar`, `len`.
- `atof` marque `Non applicable`: appel libc externe, adapte cote TS par `parseCvarFloat` et couvert par les tests de valeur numerique/non numerique.

## Decisions

- `cvar_vars` est porte comme `CvarRuntime.cvar_vars`, et non comme global module-level, conformement a l'ownership TS existant du runtime cvar.
- Les commentaires d'en-tete des fonctions portees du lot ont ete verifies dans `packages/qcommon/src/cvar.ts`.
- Runtime: lot integre via `createQcommonRuntime`, `Cvar_Init`, `Cmd_ExecuteString`, client/server/menu et helpers de config.
- `apps/web`: integre via `full-game.ts`, `local-client-controller.ts`, `full-game-render-source.ts` et les sessions full-game; pas de logique cvar parallele masquant ce lot.
- `renderer-three`: consommation attendue via l'interface ref `ri.Cvar_Get` et les cvars de rendu; ce lot ne produit pas directement de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene, mais fournit les valeurs runtime lues par le renderer.

## Tests de reference

- `npm run verify:cvar`
- `npm run verify:full-game:commands`
- `npm run verify:full-game:render-source`
- `npm run verify:gl-rmain`

## Prochain lot recommande

- `Cvar_Get` jusqu'a la creation de cvar et les validations userinfo/serverinfo, avec le faux positif local `var`.
- Garder `Cvar_Set2` pour une session separee si le lot devient trop large.

## Blocages

- Aucun blocage observe pour ce lot.
