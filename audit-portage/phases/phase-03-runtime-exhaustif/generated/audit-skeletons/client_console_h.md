# Inventaire runtime Phase 03 - Quake-2-master/client/console.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/console.ts
- Cibles TS declarees : packages/client/src/console.ts, packages/client/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | NUM_CON_TIMES | 25 | a-auditer | |
| macro | CON_TEXTSIZE | 27 | a-auditer | |
| struct | console_t | 28 | a-auditer | |
| global | initialized | 30 | a-auditer | |
| global | text | 32 | a-auditer | |
| global | current | 33 | a-auditer | |
| global | x | 34 | a-auditer | |
| global | display | 35 | a-auditer | |
| global | ormask | 37 | a-auditer | |
| global | linewidth | 39 | a-auditer | |
| global | totallines | 40 | a-auditer | |
| global | cursorspeed | 42 | a-auditer | |
| global | vislines | 44 | a-auditer | |
| global | times | 46 | a-auditer | |
| function | Con_DrawCharacter | 52 | a-auditer | |
| function | Con_CheckResize | 54 | a-auditer | |
| function | Con_Init | 55 | a-auditer | |
| function | Con_DrawConsole | 56 | a-auditer | |
| function | Con_Print | 57 | a-auditer | |
| function | Con_CenteredPrint | 58 | a-auditer | |
| function | Con_Clear_f | 59 | a-auditer | |
| function | Con_DrawNotify | 60 | a-auditer | |
| function | Con_ClearNotify | 61 | a-auditer | |
| function | Con_ToggleConsole_f | 62 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

