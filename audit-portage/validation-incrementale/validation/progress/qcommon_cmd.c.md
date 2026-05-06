# Progress - Quake-2-master/qcommon/cmd.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `Cmd_AddCommand`, `Cmd_RemoveCommand`, `Cmd_Exists`, `Cmd_CompleteCommand`, et faux positifs locaux associes (`len`, `a`).
- Verdict du lot: Valide pour les entites portees; `Non applicable` pour les variables locales C extraites comme pseudo-globals.

## Preuves session

- Comparaison source: `Quake-2-master/qcommon/cmd.c`
- Cible TS: `packages/qcommon/src/cmd.ts`
- Runtime verifie: `packages/qcommon/src/runtime.ts`, `packages/client/src/cl_main.ts`, `packages/server/src/sv_user.ts`, `apps/web/src/full-game.ts`, `apps/web/src/full-game-server-host.ts`
- `npm run verify:cmd`
- `npm run typecheck`
- `npm run verify:qcommon:header`
- `npm run verify:full-game:commands`
- `npm run verify:ref-gl-host`
- `npm run verify:gl-rmain` bloque sur import local manquant `packages/renderer-three/src/gl-local.js` dans le harness.

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
- `packages/qcommon/src/cmd.ts`
  - `Cmd_MacroExpandString` aligne mieux le C: commentaire de portage, limite initiale `MAX_STRING_CHARS`, messages `Com_Printf` via `onPrint`, boucle a 100 expansions, unmatched quote, et parsing de token via `COM_Parse`.
- `scripts/verify/quake2-cmd.ts`
  - Ajout de tests pour expansion recursive, macro avec whitespace parsee par `COM_Parse`, macro dans quotes, boucle, unmatched quote avec/sans hook, ligne trop longue et expansion trop longue.
- `packages/qcommon/src/cmd.ts`
  - `Cmd_AddCommand` et `Cmd_RemoveCommand` alignes sur le C: les erreurs doublon/cvar/commande absente impriment via `onPrint` puis retournent, sans exception.
- `scripts/verify/quake2-cmd.ts`
  - Ajout de tests pour doublon/cvar/commande absente sans throw, recherche case-sensitive, completion vide, exact/partial, et priorite commande avant alias.

## Decisions runtime / web / renderer

- Runtime: integre. `Cmd_Init` est appele par `createQcommonRuntime` et par `apps/web/src/full-game.ts`; `Cmd_TokenizeString` est le chemin normal de `Cmd_ExecuteString`, commandes serveur utilisateur, commandes serveur main et callbacks client/serveur. `Cmd_MacroExpandString` utilise le hook cvar de `createQcommonRuntime`.
- apps/web: integre. Le host web initialise le runtime de commandes, charge les scripts via `loadTextFile`, execute les commandes console/runtime et ajoute seulement des bridges de host (`newgame`, `map`, `gamemap`) sans remplacer le port qcommon; la tokenization/macro expansion est donc consommee par les flux console et full-game.
- renderer-three: non applicable pour ce lot. Ces entites ne produisent pas directement modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene; le renderer consomme seulement l'interface de commandes pour enregistrer ses callbacks (`imagelist`, `screenshot`, `modellist`, `gl_strings`).
- Runtime: integre pour le registre de commandes. `Cmd_AddCommand`, `Cmd_RemoveCommand`, `Cmd_Exists` et `Cmd_CompleteCommand` sont appeles par les modules client/server, la console, les bindings et `Cmd_ExecuteString`; les erreurs non fatales correspondent maintenant a `Com_Printf` + retour du C.
- apps/web: integre. `apps/web/src/full-game.ts`, `full-game-command-bridge.ts` et `web-config-commands.ts` passent par le registre qcommon porte; `verify:full-game:commands` confirme 117 commandes enregistrees.
- renderer-three: integre comme import de commandes, sans sortie visible directe a consommer. Le renderer appelle `ri.Cmd_AddCommand`/`ri.Cmd_RemoveCommand` pour `imagelist`, `screenshot`, `modellist`, `gl_strings`; `verify:ref-gl-host` passe. `verify:gl-rmain` reste bloque par un import de harness `gl-local.js` manquant, a traiter hors lot.

## Prochain lot recommande

Continuer avec `Cmd_ExecuteString` et faux positif local associe (`a`), puis `Cmd_List_f`, son local `i`, et `Cmd_Init` si le lot reste coherent.
