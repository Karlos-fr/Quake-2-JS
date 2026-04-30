# Inventaire runtime Phase 03 - Quake-2-master/client/input.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/input.ts
- Cibles TS declarees : packages/client/src/input.ts, packages/client/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | IN_Init | 22 | a-auditer | |
| function | IN_Shutdown | 24 | a-auditer | |
| function | IN_Commands | 26 | a-auditer | |
| function | IN_Frame | 29 | a-auditer | |
| function | IN_Move | 31 | a-auditer | |
| function | IN_Activate | 34 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

