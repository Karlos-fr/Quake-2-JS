# Inventaire runtime Phase 03 - Quake-2-master/client/console.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/console.ts
- Cibles TS declarees : packages/client/src/console.ts, packages/client/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | con_notifytime | 26 | a-auditer | |
| macro | MAXCMDLINE | 29 | a-auditer | |
| global | edit_line | 31 | a-auditer | |
| global | key_linepos | 32 | a-auditer | |
| function | DrawString | 35 | a-auditer | |
| function | DrawAltString | 45 | a-auditer | |
| function | Key_ClearTyping | 56 | a-auditer | |
| function | Con_ToggleConsole_f | 67 | a-auditer | |
| function | Con_ToggleChat_f | 107 | a-auditer | |
| function | Con_Clear_f | 130 | a-auditer | |
| function | Con_Dump_f | 143 | a-auditer | |
| global | line | 146 | a-auditer | |
| global | buffer | 148 | a-auditer | |
| global | name | 149 | a-auditer | |
| global | break | 190 | a-auditer | |
| function | Con_ClearNotify | 207 | a-auditer | |
| global | i | 209 | a-auditer | |
| function | Con_MessageMode_f | 221 | a-auditer | |
| function | Con_MessageMode2_f | 232 | a-auditer | |
| function | Con_CheckResize | 245 | a-auditer | |
| global | tbuf | 248 | a-auditer | |
| function | Con_Init | 304 | a-auditer | |
| function | Con_Linefeed | 332 | a-auditer | |
| function | Con_Print | 351 | a-auditer | |
| global | y | 353 | a-auditer | |
| global | cr | 355 | a-auditer | |
| global | mask | 356 | a-auditer | |
| global | mask | 367 | a-auditer | |
| function | Con_CenteredPrint | 427 | a-auditer | |
| global | l | 429 | a-auditer | |
| global | buffer | 430 | a-auditer | |
| function | Con_DrawInput | 458 | a-auditer | |
| global | y | 460 | a-auditer | |
| global | i | 461 | a-auditer | |
| global | text | 462 | a-auditer | |
| function | Con_DrawNotify | 500 | a-auditer | |
| global | text | 503 | a-auditer | |
| global | i | 504 | a-auditer | |
| global | time | 505 | a-auditer | |
| global | s | 506 | a-auditer | |
| global | skip | 507 | a-auditer | |
| function | Con_DrawConsole | 569 | a-auditer | |
| global | rows | 572 | a-auditer | |
| global | text | 573 | a-auditer | |
| global | row | 574 | a-auditer | |
| global | lines | 575 | a-auditer | |
| global | version | 576 | a-auditer | |
| global | dlbar | 577 | a-auditer | |
| global | text | 640 | a-auditer | |
| global | n | 659 | a-auditer | |
| global | dlbar | 665 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

