# Progress TS - packages/qcommon/src/cmd.ts

## Etat courant

- Statut: Termine
- Dernier lot traite: bloc execution/alias/builtins et helpers locaux, de `Cmd_AddCommand` a `emitCommandOutput`.
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_qcommon_src_cmd.ts.md`
- Fichier TS: `packages/qcommon/src/cmd.ts`

## Session 2026-05-27

- Lot: 24 symboles (`EXEC_NOW`, `EXEC_INSERT`, `EXEC_APPEND`, `ALIAS_LOOP_COUNT`, `COMMAND_BUFFER_SIZE`, `xcommand_t`, `CommandRegistration`, `CommandAlias`, `CommandHooks`, `CommandRuntime`, `createCommandRuntime`, `Cbuf_Init`, `Cbuf_AddText`, `Cbuf_InsertText`, `Cbuf_CopyToDefer`, `Cbuf_InsertFromDefer`, `Cbuf_ExecuteText`, `Cbuf_Execute`, `Cbuf_AddEarlyCommands`, `Cbuf_AddLateCommands`, `Cmd_Argc`, `Cmd_Argv`, `Cmd_Args`, `Cmd_TokenizeString`).
- Verdict: 20 `Couvert C/H`, 4 `Valide`.
- Preuves: croisement avec `qcommon_cmd.c.md` et `qcommon_qcommon.h.md`; les lignes C/H proprietaires sont deja `Valide`; verification d'ownership dans `packages/qcommon/src/cmd.ts`; recherche de doublons par `Original name`/source; controle des usages runtime/web/server/client.
- Corrections: metadonnees d'en-tete ajoutees pour les constantes initiales, types/interfaces runtime et `createCommandRuntime`; `Category: New` renseigne avec `Original name: N/A` et `Source: N/A (...)`.
- Tests: `npm run verify:cmd`; `npm run verify:qcommon:header`; `npm run typecheck`.

## Session 2026-05-27 - lot final

- Lot: 21 symboles (`MAX_ALIAS_NAME`, `Cmd_AddCommand`, `Cmd_RemoveCommand`, `Cmd_Exists`, `Cmd_CompleteCommand`, `Cmd_ExecuteString`, `Cmd_ForwardToServer`, `Cmd_Alias_f`, `Cmd_Wait_f`, `Cmd_Init`, `Cmd_Exec_f`, `Cmd_Echo_f`, `Cmd_List_f`, `Cmd_MacroExpandString`, `parseCommandToken`, `findCommandSplitIndex`, `encodeAscii`, `decodeAscii`, `buildAliasValue`, `equalsIgnoreCase`, `emitCommandOutput`).
- Verdict: 13 `Couvert C/H`, 8 `Valide`.
- Preuves: croisement avec `qcommon_cmd.c.md` pour les fonctions proprietaires et `qcommon_qcommon.h.md` pour le prototype `Cmd_ForwardToServer`; verification d'ownership qcommon/client; recherche de doublons par `Original name`/source; controle des usages runtime, web, client, server et renderer.
- Corrections: ajout des metadonnees `Original name: N/A` et `Source: N/A (...)` dans les en-tetes des helpers `New`; `MAX_ALIAS_NAME` remplace la ligne stale `expandMacroPass` dans la matrice; `Cmd_ForwardToServer` classe `Adapter` pour ne pas masquer l'implementation cliente proprietaire.
- Tests: `npm run verify:cmd`; `npm run verify:qcommon:header`; `npm run typecheck`; `git diff --check`.

## Prochain lot recommande

Aucun dans la matrice actuelle.

## Points d'attention

- `CommandRuntime` est l'adapter explicite des globals statiques de `qcommon/cmd.c`; ne pas le marquer `Couvert C/H`.
- `Cmd_ForwardToServer` dans `qcommon/src/cmd.ts` reste un adapter de hook; le port proprietaire client est `packages/client/src/cl_main.ts`.
