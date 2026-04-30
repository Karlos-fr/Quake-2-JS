# Inventaire runtime Phase 03 - Quake-2-master/client/keys.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/keys.ts
- Cibles TS declarees : packages/client/src/keys.ts, packages/client/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | MAXCMDLINE | 29 | a-auditer | |
| global | key_linepos | 31 | a-auditer | |
| global | shift_down | 32 | a-auditer | |
| global | anykeydown | 33 | a-auditer | |
| global | edit_line | 35 | a-auditer | |
| global | history_line | 36 | a-auditer | |
| global | key_waiting | 38 | a-auditer | |
| global | keybindings | 39 | a-auditer | |
| global | consolekeys | 40 | a-auditer | |
| global | menubound | 41 | a-auditer | |
| global | keyshift | 42 | a-auditer | |
| global | key_repeats | 43 | a-auditer | |
| global | keydown | 44 | a-auditer | |
| struct | keyname_t | 46 | a-auditer | |
| global | name | 48 | a-auditer | |
| global | keynum | 49 | a-auditer | |
| table | keynames | 52 | a-auditer | |
| function | CompleteCommand | 164 | a-auditer | |
| function | Key_Console | 194 | a-auditer | |
| global | cbd | 246 | a-auditer | |
| global | i | 250 | a-auditer | |
| function | Cbuf_AddText | 284 | a-auditer | |
| global | chat_team | 389 | a-auditer | |
| global | chat_buffer | 390 | a-auditer | |
| global | chat_bufferlen | 391 | a-auditer | |
| function | Key_Message | 393 | a-auditer | |
| function | Cbuf_AddText | 401 | a-auditer | |
| function | Key_StringToKeynum | 451 | a-auditer | |
| function | Key_KeynumToString | 477 | a-auditer | |
| global | tinystr | 480 | a-auditer | |
| function | Key_SetBinding | 504 | a-auditer | |
| global | new | 506 | a-auditer | |
| global | l | 507 | a-auditer | |
| function | Key_Unbind_f | 532 | a-auditer | |
| global | b | 534 | a-auditer | |
| function | Key_Unbindall_f | 552 | a-auditer | |
| global | i | 554 | a-auditer | |
| function | Key_Bind_f | 567 | a-auditer | |
| global | cmd | 570 | a-auditer | |
| function | Com_Printf | 591 | a-auditer | |
| function | Key_WriteBindings | 614 | a-auditer | |
| global | i | 616 | a-auditer | |
| function | Key_Bindlist_f | 630 | a-auditer | |
| global | i | 632 | a-auditer | |
| function | Key_Init | 645 | a-auditer | |
| global | i | 647 | a-auditer | |
| function | Key_Event | 740 | a-auditer | |
| global | kb | 742 | a-auditer | |
| global | cmd | 743 | a-auditer | |
| function | Key_ClearStates | 913 | a-auditer | |
| global | i | 915 | a-auditer | |
| function | Key_GetKey | 934 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

