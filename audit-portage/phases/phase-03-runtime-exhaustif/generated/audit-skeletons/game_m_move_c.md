# Inventaire runtime Phase 03 - Quake-2-master/game/m_move.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_move.ts
- Cibles TS declarees : packages/game/src/m_move.ts, packages/game/src/index.ts, packages/game/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | STEPSIZE | 24 | a-auditer | |
| function | M_CheckBottom | 37 | a-auditer | |
| global | trace | 40 | a-auditer | |
| function | SV_movestep | 112 | a-auditer | |
| global | dz | 114 | a-auditer | |
| global | trace | 116 | a-auditer | |
| global | i | 117 | a-auditer | |
| global | stepsize | 118 | a-auditer | |
| global | test | 119 | a-auditer | |
| global | contents | 120 | a-auditer | |
| global | stepsize | 210 | a-auditer | |
| function | M_ChangeYaw | 304 | a-auditer | |
| global | ideal | 306 | a-auditer | |
| global | current | 307 | a-auditer | |
| global | move | 308 | a-auditer | |
| global | speed | 309 | a-auditer | |
| function | SV_StepDirection | 353 | a-auditer | |
| global | delta | 356 | a-auditer | |
| function | SV_FixCheckBottom | 389 | a-auditer | |
| macro | DI_NODIR | 402 | a-auditer | |
| function | SV_NewChaseDir | 403 | a-auditer | |
| global | d | 406 | a-auditer | |
| global | d | 423 | a-auditer | |
| global | d | 429 | a-auditer | |
| global | tdir | 437 | a-auditer | |
| function | SV_CloseEnough | 495 | a-auditer | |
| global | i | 497 | a-auditer | |
| function | M_MoveToGoal | 515 | a-auditer | |
| global | goal | 517 | a-auditer | |
| function | M_walkmove | 542 | a-auditer | |
| function | SV_movestep | 555 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

