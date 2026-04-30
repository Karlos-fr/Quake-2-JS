# Inventaire runtime Phase 03 - Quake-2-master/qcommon/cvar.c

## Rattachement Phase 02

- Statut structurel : strict-ok
- Cible TS principale : packages/qcommon/src/cvar.ts
- Cibles TS declarees : packages/qcommon/src/cvar.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | cvar_vars | 24 | a-auditer | |
| function | Cvar_InfoValidate | 31 | a-auditer | |
| function | Cvar_FindVar | 47 | a-auditer | |
| global | var | 49 | a-auditer | |
| function | Cvar_VariableValue | 63 | a-auditer | |
| global | var | 65 | a-auditer | |
| function | atof | 70 | a-auditer | |
| function | Cvar_VariableString | 79 | a-auditer | |
| global | var | 81 | a-auditer | |
| function | Cvar_CompleteVariable | 95 | a-auditer | |
| global | cvar | 97 | a-auditer | |
| global | len | 98 | a-auditer | |
| function | Cvar_Get | 127 | a-auditer | |
| global | var | 129 | a-auditer | |
| function | Cvar_Set2 | 179 | a-auditer | |
| global | var | 181 | a-auditer | |
| function | Cvar_Get | 186 | a-auditer | |
| function | Cvar_ForceSet | 268 | a-auditer | |
| function | Cvar_Set2 | 270 | a-auditer | |
| function | Cvar_Set | 278 | a-auditer | |
| function | Cvar_Set2 | 280 | a-auditer | |
| function | Cvar_FullSet | 288 | a-auditer | |
| global | var | 290 | a-auditer | |
| function | Cvar_Get | 295 | a-auditer | |
| function | Cvar_SetValue | 317 | a-auditer | |
| global | val | 319 | a-auditer | |
| function | Com_sprintf | 324 | a-auditer | |
| function | Cvar_GetLatchedVars | 336 | a-auditer | |
| global | var | 338 | a-auditer | |
| function | Cvar_Command | 363 | a-auditer | |
| global | v | 365 | a-auditer | |
| function | Cvar_Set_f | 391 | a-auditer | |
| global | c | 393 | a-auditer | |
| global | flags | 394 | a-auditer | |
| function | Cvar_Set | 417 | a-auditer | |
| function | Cvar_WriteVariables | 429 | a-auditer | |
| global | var | 431 | a-auditer | |
| global | buffer | 432 | a-auditer | |
| function | Cvar_List_f | 453 | a-auditer | |
| global | var | 455 | a-auditer | |
| global | i | 456 | a-auditer | |
| function | Com_Printf | 464 | a-auditer | |
| function | Com_Printf | 468 | a-auditer | |
| function | Com_Printf | 472 | a-auditer | |
| function | Com_Printf | 478 | a-auditer | |
| global | userinfo_modified | 485 | a-auditer | |
| function | Cvar_BitInfo | 488 | a-auditer | |
| global | info | 490 | a-auditer | |
| global | var | 491 | a-auditer | |
| function | Cvar_Userinfo | 504 | a-auditer | |
| function | Cvar_BitInfo | 506 | a-auditer | |
| function | Cvar_Serverinfo | 510 | a-auditer | |
| function | Cvar_BitInfo | 512 | a-auditer | |
| function | Cvar_Init | 522 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

