# Progress - Quake-2-master/qcommon/cmd.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `Cbuf_AddEarlyCommands`, `Cbuf_AddLateCommands`, commandes scripts simples (`Cmd_Exec_f`, `Cmd_Echo_f`, `Cmd_Alias_f`), registre `cmd_function_s`/`CommandRegistration`, et accesseurs `Cmd_Argc`, `Cmd_Argv`, `Cmd_Args`, avec reclassification des variables locales associees.
- Verdict du lot: Valide pour les entites portees; `Non applicable` pour les variables locales C extraites comme pseudo-globals.

## Preuves session

- Comparaison source: `Quake-2-master/qcommon/cmd.c`
- Cible TS: `packages/qcommon/src/cmd.ts`
- Runtime verifie: `packages/qcommon/src/runtime.ts`, `packages/client/src/cl_main.ts`, `packages/server/src/sv_user.ts`, `apps/web/src/full-game.ts`, `apps/web/src/full-game-server-host.ts`
- `npm run verify:cmd`
- `npm run typecheck`
- `npm run verify:qcommon:header`

## Corrections appliquees

- `packages/qcommon/src/cmd.ts`
  - Ajout de `MAX_ALIAS_NAME = 32`.
  - `Cbuf_AddText` aligne sur le C: overflow signale via `onPrint` puis retour sans ajout.
  - `Cmd_Alias_f` refuse les alias dont le nom atteint `MAX_ALIAS_NAME`, comme le C.
- `scripts/verify/quake2-cmd.ts`
  - Ajout de tests pour overflow `Cbuf_AddText` et garde `MAX_ALIAS_NAME`.
- `packages/qcommon/src/cmd.ts`
  - `Cbuf_AddLateCommands` ignore maintenant un `+` final sans commande, comme la boucle C `i < s - 1`.
- `scripts/verify/quake2-cmd.ts`
  - Ajout de tests pour `Cbuf_AddEarlyCommands` avec/sans clear, `Cbuf_AddLateCommands` sans commande et avec `+` terminal, `Cmd_Argv` hors bornes, remplacement d'alias, `Cmd_Exec_f` usage/fichier absent, et `Cmd_Echo_f` sans argument.

## Decisions runtime / web / renderer

- Runtime: integre. `Cmd_Init` est appele par `createQcommonRuntime` et par `apps/web/src/full-game.ts`; les commandes `exec`, `echo`, `alias`, les buffers early/late et les accesseurs argv sont le chemin normal des callbacks client/serveur (`CL_Frame`, commandes serveur et cvars).
- apps/web: integre. Le host web initialise le runtime de commandes, charge les scripts via `loadTextFile`, execute les commandes console/runtime et ajoute seulement des bridges de host (`newgame`, `map`, `gamemap`) sans remplacer le port qcommon.
- renderer-three: non applicable pour ce lot. Ces entites ne produisent pas directement modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene; le renderer consomme seulement l'interface de commandes pour enregistrer ses callbacks (`imagelist`, `screenshot`, `modellist`, `gl_strings`).

## Prochain lot recommande

Continuer avec `Cmd_MacroExpandString`, variables locales associees (`inquote`, `scan`, `expanded`, `temporary`) puis `Cmd_TokenizeString` si le lot reste coherent.
