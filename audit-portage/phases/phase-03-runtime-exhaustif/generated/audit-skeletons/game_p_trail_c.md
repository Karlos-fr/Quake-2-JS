# Inventaire runtime Phase 03 - Quake-2-master/game/p_trail.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/p_trail.ts
- Cibles TS declarees : packages/game/src/p_trail.ts, packages/game/src/g_ai.ts, packages/game/src/index.ts, packages/game/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | TRAIL_LENGTH | 39 | a-auditer | |
| global | trail | 41 | a-auditer | |
| global | trail_head | 42 | a-auditer | |
| global | trail_active | 43 | a-auditer | |
| macro | NEXT | 45 | a-auditer | |
| macro | PREV | 46 | a-auditer | |
| function | PlayerTrail_Init | 49 | a-auditer | |
| global | n | 51 | a-auditer | |
| function | PlayerTrail_Add | 67 | a-auditer | |
| function | PlayerTrail_New | 85 | a-auditer | |
| function | PlayerTrail_PickFirst | 95 | a-auditer | |
| global | marker | 97 | a-auditer | |
| global | n | 98 | a-auditer | |
| global | break | 108 | a-auditer | |
| function | PlayerTrail_PickNext | 124 | a-auditer | |
| global | marker | 126 | a-auditer | |
| global | n | 127 | a-auditer | |
| global | break | 137 | a-auditer | |
| function | PlayerTrail_LastSpot | 143 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

