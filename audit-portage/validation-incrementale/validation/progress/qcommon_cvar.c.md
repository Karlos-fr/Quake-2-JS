# Progress - Quake-2-master/qcommon/cvar.c

## Dernier lot valide

- Lot du 2026-05-06: `Cvar_Init` avec enregistrement des commandes `set` et `cvarlist`.
- Corrections: commentaire d'en-tete de `packages/qcommon/src/cvar.ts` corrige de `Category: New` vers portage explicite `Original name: Cvar_Init`, `Source: qcommon/cvar.c`, `Category: Ported`, `Fidelity level: Close`, avec notes d'adaptation runtime.
- Preuves ajoutees: comparaison C vs TS de l'enregistrement `Cmd_AddCommand("set", Cvar_Set_f)` et `Cmd_AddCommand("cvarlist", Cvar_List_f)`, execution des commandes via `Cmd_ExecuteString`, couverture full-game des commandes enregistrees, flux web/gamedir et cvars de rendu `gl_rmain`.
- Lot du 2026-05-06: `userinfo_modified`, `Cvar_BitInfo`, `Cvar_Userinfo`, `Cvar_Serverinfo`.
- Faux positifs locaux/appels internes traites: `info` et `var` de `Cvar_BitInfo`, appels internes `Cvar_BitInfo` depuis `Cvar_Userinfo`/`Cvar_Serverinfo`.
- Corrections: aucune correction du port TS proprietaire requise; renforcement de `scripts/verify/quake2-cvar.ts` pour couvrir default `userinfo_modified`, selection par bit, ordre `cvar_vars`, exclusion des flags non retenus, valeurs vides et delegation user/server.
- Preuves ajoutees: info-string user/server exact, wrappers `Cvar_Userinfo`/`Cvar_Serverinfo`, mutation `userinfo_modified`, emission `clc_userinfo` client et commande serveur `serverinfo`.
- Lot du 2026-05-06: `Cvar_WriteVariables`, `Cvar_List_f`.
- Faux positifs locaux traites: `var`/`buffer` de `Cvar_WriteVariables`, `var`/`i` de `Cvar_List_f`.
- Corrections: aucune correction du port TS proprietaire requise; renforcement de `scripts/verify/quake2-cvar.ts` pour couvrir ordre exact `cvar_vars`, exclusion des cvars non archivees, format `set name "value"`, marqueurs `cvarlist` (`*`, `U`, `S`, `-`, `L`) et compteur total.
- Preuves ajoutees: serialization archive-only via `Cvar_WriteVariables`, format et comptage `Cvar_List_f`, commande `cvarlist` via `Cvar_Init`, delegation `CL_WriteConfiguration`/`writeconfig`, et consommation indirecte des cvars de rendu archivees.
- Lot du 2026-05-06: `Cvar_GetLatchedVars`, `Cvar_Command`, `Cvar_Set_f`.
- Faux positifs locaux/appels internes traites: `var` de `Cvar_GetLatchedVars`, `v` de `Cvar_Command`, `c`/`flags` de `Cvar_Set_f`, appel interne `Cvar_Set` deja proprietaire ailleurs dans la matrice.
- Corrections: aucune correction du port TS proprietaire requise; renforcement de `scripts/verify/quake2-cvar.ts` pour couvrir les branches console du lot.
- Preuves ajoutees: application des latched vars, hooks `game`/autoexec, inspection et mutation par `Cvar_Command`, fallback `Cmd_ExecuteString`, usage/flag invalide de `Cvar_Set_f`, branches `u`/`s`, et sortie `set` via `Cvar_Init`.
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
- `Cvar_GetLatchedVars`: runtime integre via `SV_InitGame`; le changement `game` appelle les hooks TS qui remplacent `FS_SetGamedir`/`FS_ExecAutoexec`.
- `Cvar_Command`/`Cvar_Set_f`: runtime integre via `Cmd_ExecuteString`, le fallback cvar de `createQcommonRuntime`, et `Cvar_Init` qui enregistre `set`.
- `apps/web`: integre via les consoles full-game et config web; `full-game.ts` relie `onGameDirChange` a `FS_SetGamedir` puis `exec config.cfg`, et `onExecAutoexec` a `exec autoexec.cfg`.
- `renderer-three`: aucune sortie visible directe nouvelle; impact indirect attendu par mutation des cvars de rendu (`r_*`, `gl_*`, `vid_*`, `hand`, etc.) consommees par les adapters renderer/ref. Pas de manque renderer observe pour ce lot.
- `Cvar_WriteVariables`: runtime integre via `CL_WriteConfiguration`, appele au shutdown client et par la commande web `writeconfig`; l'adaptation TS retourne le texte a ecrire au lieu d'ouvrir le fichier en append, ce qui est l'ownership attendu cote client/web.
- `Cvar_List_f`: runtime integre via `Cvar_Init` qui enregistre `cvarlist`; la sortie passe par le hook `onPrint` de `emitCvarOutput`.
- `apps/web`: `writeconfig` delegue a `CL_WriteConfiguration`, donc consomme le port `Cvar_WriteVariables`; la console full-game expose `cvarlist` via `Cvar_Init`. Pas de logique parallele observee pour ce lot.
- `renderer-three`: pas de sortie visible directe (modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene); impact indirect attendu et verifie sur les cvars de rendu archivees (`gl_*`, `vid_*`, `hand`) creees par `ri.Cvar_Get` puis serialisables par `Cvar_WriteVariables`.
- `userinfo_modified`: runtime integre via `Cvar_Set2`/`Cvar_FullSet`, puis consomme par `CL_SendCmd` qui appelle `CL_FixUpGender`, remet le flag a false et ecrit `clc_userinfo`.
- `Cvar_Userinfo`: runtime integre dans le paquet de connexion client (`CL_SendConnectPacket`), la commande client `userinfo`, et la transmission fiable `clc_userinfo`.
- `Cvar_Serverinfo`: runtime integre dans les commandes serveur `serverinfo` (`SV_ShowServerinfo_f`/`SV_Serverinfo_f`) et alimente les cvars `CVAR_SERVERINFO` creees par server/game.
- `apps/web`: integre via les flux full-game/console qui pilotent le runtime client/serveur; pas de logique parallele masquant la construction des info strings. `full-game-server-host.ts` garde un userinfo initial d'adapter pour creer un client serveur local, mais les mutations runtime passent par `Cvar_Userinfo` et `clc_userinfo`.
- `renderer-three`: aucune sortie visible directe produite par ce lot (pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene). Impact indirect confirme sur la cvar userinfo `hand` consommee par `renderer-three` via `ri.Cvar_Get`; aucun branchement renderer direct attendu pour `Cvar_BitInfo`.
- `Cvar_Init`: runtime integre via `createQcommonRuntime` et `apps/web/src/full-game.ts` apres `Cmd_Init`; `set` et `cvarlist` sont atteignables par `Cmd_ExecuteString`/console, puis routent vers `Cvar_Set_f` et `Cvar_List_f` avec sortie `onPrint`.
- `apps/web`: integre via la console full-game et les commandes web/config; `verify:full-game:commands` prouve que `set` et `cvarlist` sont enregistrees dans l'ensemble de commandes web runtime.
- `renderer-three`: pas de sortie visible directe de `Cvar_Init` (aucun modele, frame, image, particule, beam, dlight, temp entity, areabit, camera ou scene produit). L'impact attendu est indirect: les commandes peuvent modifier des cvars de rendu, et `renderer-three` consomme ces cvars via `ri.Cvar_Get`/`ri.Cvar_Set`/`ri.Cvar_SetValue`; `verify:gl-rmain` couvre ce branchement.

## Tests de reference

- `npm run verify:cvar`
- `npm run verify:cl-input`
- `npm run verify:cl-main`
- `npm run verify:server:user`
- `npm run verify:full-game:commands`
- `npm run verify:full-game:render-source`
- `npm run verify:gl-rmain`
- `npm run typecheck`

## Prochain lot recommande

- Aucun lot restant dans `qcommon/cvar.c`: toutes les lignes sont `Valide` ou `Non applicable`.

## Blocages

- Aucun blocage observe pour ce lot.
