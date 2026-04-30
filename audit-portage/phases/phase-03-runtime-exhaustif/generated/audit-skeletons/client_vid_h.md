# Inventaire runtime Phase 03 - Quake-2-master/client/vid.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/vid.ts
- Cibles TS declarees : packages/client/src/vid.ts, packages/client/src/cl_scrn.ts, packages/client/src/vid-menu.ts, packages/client/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| struct | vrect_s | 22 | a-auditer | |
| struct | viddef_t | 27 | a-auditer | |
| global | width | 29 | a-auditer | |
| global | height | 30 | a-auditer | |
| function | VID_Init | 36 | a-auditer | |
| function | VID_Shutdown | 37 | a-auditer | |
| function | VID_CheckChanges | 38 | a-auditer | |
| function | VID_MenuInit | 40 | a-auditer | |
| function | VID_MenuDraw | 41 | a-auditer | |
| function | VID_MenuKey | 42 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

