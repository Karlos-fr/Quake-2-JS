# Inventaire runtime Phase 03 - Quake-2-master/client/cl_pred.c

## Rattachement Phase 02

- Statut structurel : strict-ok
- Cible TS principale : packages/client/src/cl_pred.ts
- Cibles TS declarees : packages/client/src/cl_pred.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | CL_CheckPredictionError | 29 | a-auditer | |
| global | frame | 31 | a-auditer | |
| global | delta | 32 | a-auditer | |
| global | i | 33 | a-auditer | |
| global | len | 34 | a-auditer | |
| function | CL_ClipMoveToEntities | 73 | a-auditer | |
| global | trace | 76 | a-auditer | |
| global | headnode | 77 | a-auditer | |
| global | angles | 78 | a-auditer | |
| global | ent | 79 | a-auditer | |
| global | num | 80 | a-auditer | |
| global | cmodel | 81 | a-auditer | |
| global | tr | 135 | a-auditer | |
| function | CL_PMTrace | 148 | a-auditer | |
| global | t | 150 | a-auditer | |
| function | CL_PMpointcontents | 163 | a-auditer | |
| global | i | 165 | a-auditer | |
| global | ent | 166 | a-auditer | |
| global | num | 167 | a-auditer | |
| global | cmodel | 168 | a-auditer | |
| global | contents | 169 | a-auditer | |
| function | CL_PredictMovement | 199 | a-auditer | |
| global | frame | 202 | a-auditer | |
| global | oldframe | 203 | a-auditer | |
| global | cmd | 204 | a-auditer | |
| global | pm | 205 | a-auditer | |
| global | i | 206 | a-auditer | |
| global | step | 207 | a-auditer | |
| global | oldz | 208 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

