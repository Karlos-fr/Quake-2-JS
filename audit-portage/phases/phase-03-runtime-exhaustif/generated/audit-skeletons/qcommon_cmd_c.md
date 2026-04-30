# Inventaire runtime Phase 03 - Quake-2-master/qcommon/cmd.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/qcommon/src/cmd.ts
- Cibles TS declarees : packages/qcommon/src/cmd.ts, packages/qcommon/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | Cmd_ForwardToServer | 24 | a-auditer | |
| macro | MAX_ALIAS_NAME | 26 | a-auditer | |
| struct | cmdalias_s | 28 | a-auditer | |
| global | name | 31 | a-auditer | |
| global | value | 32 | a-auditer | |
| global | cmd_wait | 37 | a-auditer | |
| macro | ALIAS_LOOP_COUNT | 39 | a-auditer | |
| global | alias_count | 40 | a-auditer | |
| function | Cmd_Wait_f | 54 | a-auditer | |
| global | cmd_text | 68 | a-auditer | |
| global | cmd_text_buf | 69 | a-auditer | |
| global | defer_text_buf | 71 | a-auditer | |
| function | Cbuf_Init | 78 | a-auditer | |
| function | Cbuf_AddText | 90 | a-auditer | |
| global | l | 92 | a-auditer | |
| function | Cbuf_InsertText | 114 | a-auditer | |
| global | temp | 116 | a-auditer | |
| global | templen | 117 | a-auditer | |
| global | temp | 128 | a-auditer | |
| function | Cbuf_CopyToDefer | 147 | a-auditer | |
| function | Cbuf_InsertFromDefer | 159 | a-auditer | |
| function | Cbuf_ExecuteText | 171 | a-auditer | |
| function | Cbuf_Execute | 194 | a-auditer | |
| global | i | 196 | a-auditer | |
| global | text | 197 | a-auditer | |
| global | line | 198 | a-auditer | |
| global | quotes | 199 | a-auditer | |
| function | Cbuf_AddEarlyCommands | 263 | a-auditer | |
| global | i | 265 | a-auditer | |
| global | s | 266 | a-auditer | |
| function | Cbuf_AddLateCommands | 296 | a-auditer | |
| global | s | 299 | a-auditer | |
| global | argc | 301 | a-auditer | |
| global | ret | 302 | a-auditer | |
| function | Cmd_Exec_f | 371 | a-auditer | |
| global | len | 374 | a-auditer | |
| function | Cmd_Echo_f | 409 | a-auditer | |
| global | i | 411 | a-auditer | |
| function | Cmd_Alias_f | 425 | a-auditer | |
| global | cmd | 428 | a-auditer | |
| global | s | 430 | a-auditer | |
| struct | cmd_function_s | 487 | a-auditer | |
| global | name | 490 | a-auditer | |
| global | function | 491 | a-auditer | |
| global | cmd_argc | 495 | a-auditer | |
| global | cmd_argv | 496 | a-auditer | |
| global | cmd_null_string | 497 | a-auditer | |
| global | cmd_args | 498 | a-auditer | |
| function | Cmd_Argc | 507 | a-auditer | |
| function | Cmd_Argv | 517 | a-auditer | |
| function | Cmd_Args | 531 | a-auditer | |
| function | Cmd_MacroExpandString | 542 | a-auditer | |
| global | inquote | 545 | a-auditer | |
| global | scan | 546 | a-auditer | |
| global | expanded | 547 | a-auditer | |
| global | temporary | 548 | a-auditer | |
| function | Cmd_TokenizeString | 620 | a-auditer | |
| global | i | 622 | a-auditer | |
| global | com_token | 623 | a-auditer | |
| global | l | 658 | a-auditer | |
| global | break | 668 | a-auditer | |
| function | Cmd_AddCommand | 691 | a-auditer | |
| function | Cmd_RemoveCommand | 724 | a-auditer | |
| function | Cmd_Exists | 752 | a-auditer | |
| function | Cmd_CompleteCommand | 772 | a-auditer | |
| global | len | 775 | a-auditer | |
| global | a | 776 | a-auditer | |
| function | Cmd_ExecuteString | 811 | a-auditer | |
| global | a | 814 | a-auditer | |
| function | Cmd_List_f | 865 | a-auditer | |
| global | i | 868 | a-auditer | |
| function | Cmd_Init | 881 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

