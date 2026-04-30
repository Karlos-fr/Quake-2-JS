# Inventaire runtime Phase 03 - Quake-2-master/client/cl_inv.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cl_inv.ts
- Cibles TS declarees : packages/client/src/cl_inv.ts, packages/client/src/cl_parse.ts, packages/client/src/cl_scrn.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | CL_ParseInventory | 29 | a-auditer | |
| global | i | 31 | a-auditer | |
| function | Inv_DrawString | 43 | a-auditer | |
| function | SetStringHighBit | 53 | a-auditer | |
| macro | DISPLAY_ITEMS | 64 | a-auditer | |
| function | CL_DrawInventory | 66 | a-auditer | |
| global | index | 70 | a-auditer | |
| global | string | 71 | a-auditer | |
| global | binding | 73 | a-auditer | |
| global | bind | 74 | a-auditer | |
| global | selected | 75 | a-auditer | |
| global | top | 76 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

