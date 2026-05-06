# Progress - Quake-2-master/qcommon/cvar.c

## Dernier lot valide

- Lot du 2026-05-06: `Cvar_Set2`, `Cvar_ForceSet`, `Cvar_Set`, `Cvar_FullSet`, `Cvar_SetValue`.
- Faux positifs locaux/appels internes traites: `var` de `Cvar_Set2`, `var` de `Cvar_FullSet`, `val` de `Cvar_SetValue`, appels internes `Cvar_Get` et `Cvar_Set2` deja proprietaires ailleurs dans la matrice.
- Corrections: `Cvar_Set2` emet maintenant les diagnostics `invalid info cvar value\n`, `%s is write protected.\n` et `%s will be changed for next game.\n` via `onPrint`; `Cvar_SetValue` formate les flottants comme le `%f` C a six decimales; les adapters ref web dans `apps/web/src/full-game.ts` et `apps/web/src/main.ts` appellent maintenant `Cvar_Set`/`Cvar_SetValue` portees au lieu de modifier les `cvar_t` directement.
- Preuves ajoutees: validation info sur `Cvar_Set`, preservation de valeur invalide, diagnostic NOSET, diagnostic LATCH, latch serveur/idle, force set, hook gamedir/autoexec, `userinfo_modified`, creation par setter, `Cvar_FullSet` et format entier/flottant de `Cvar_SetValue`.
- Lot du 2026-05-06: `Cvar_Get` jusqu'a la creation de cvar et validations userinfo/serverinfo.
- Faux positif local traite: `var` lie a `Cvar_Get`.
- Correction: `Cvar_Get` emet maintenant les diagnostics `invalid info cvar name\n` et `invalid info cvar value\n` via `onPrint`, en plus du hook specialise TS.
- Preuves ajoutees: creation (`name`, `string`, `modified`, `value`, `flags`), valeur par defaut `NULL`, rejet info invalides sans chainage, flags OR sur cvar existante et conservation de la valeur existante.
- Lot du 2026-05-06: `cvar_vars`, `Cvar_InfoValidate`, `Cvar_FindVar`, `Cvar_VariableValue`, `Cvar_VariableString`, `Cvar_CompleteVariable`.
- Faux positifs locaux traites: `var` lie aux fonctions du lot, `cvar`, `len`.
- `atof` marque `Non applicable`: appel libc externe, adapte cote TS par `parseCvarFloat` et couvert par les tests de valeur numerique/non numerique.

## Decisions

- `cvar_vars` est porte comme `CvarRuntime.cvar_vars`, et non comme global module-level, conformement a l'ownership TS existant du runtime cvar.
- Les commentaires d'en-tete des fonctions portees du lot ont ete verifies dans `packages/qcommon/src/cvar.ts`.
- Runtime: lot integre via `createQcommonRuntime`, `Cvar_Init`, `Cmd_ExecuteString`, client/server/menu et helpers de config.
- `apps/web`: integre via `full-game.ts`, `local-client-controller.ts`, `full-game-render-source.ts` et les sessions full-game; pas de logique cvar parallele masquant ce lot.
- `renderer-three`: consommation attendue via l'interface ref `ri.Cvar_Get` et les cvars de rendu; ce lot ne produit pas directement de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene, mais fournit les valeurs runtime lues par le renderer.
- `Cvar_Get`: les validations userinfo/serverinfo reproduisent maintenant le diagnostic observable du C (`Com_Printf`) via `onPrint`; `apps/web` et `renderer-three` consomment ce chemin par leurs adapters `Cvar_Get`.
- `Cvar_Set2`/wrappers: comportement runtime integre via `createQcommonRuntime`, `Cvar_Init`, `Cmd_ExecuteString`, client/server/menu, game API et commandes serveur; les wrappers `Cvar_Set`/`Cvar_ForceSet`/`Cvar_SetValue` sont aussi utilises par client, serveur et menus.
- `apps/web`: integre via `full-game.ts`, `main.ts`, `full-game-command-bridge.ts`, `local-client-controller.ts` et les flux full-game; les adapters ref web ne contournent plus la logique portee pour `Cvar_Set`/`Cvar_SetValue`.
- `renderer-three`: consommation attendue via `ri.Cvar_Get`, `ri.Cvar_Set` et `ri.Cvar_SetValue` pour les cvars de rendu (`gl_*`, `vid_*`, `scr_drawall`, etc.); le lot ne produit pas directement de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene, mais il fournit les valeurs et mutations runtime lues par le renderer.

## Tests de reference

- `npm run verify:cvar`
- `npm run verify:full-game:commands`
- `npm run verify:full-game:render-source`
- `npm run verify:gl-rmain`
- `npm run typecheck`

## Prochain lot recommande

- `Cvar_GetLatchedVars` avec local `var`, puis `Cvar_Command` avec local `v` si le lot reste coherent.
- Verifier explicitement application des latched vars, `game`/gamedir, `userinfo_modified`, inspection/mutation par commande, runtime via `Cmd_ExecuteString`, `apps/web` via console full-game et renderer-three comme consommateur indirect des cvars.

## Blocages

- Aucun blocage observe pour ce lot.
