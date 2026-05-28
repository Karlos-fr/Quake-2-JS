# Inventaire runtime Phase 03 - Quake-2-master/game/g_chase.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_chase.ts
- Cibles TS declarees : packages/game/src/g_chase.ts, packages/game/src/g_cmds.ts, packages/game/src/index.ts, packages/game/src/p_client.ts, packages/game/src/p_hud.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | UpdateChaseCam | 22 | a-auditer | |
| global | targ | 25 | a-auditer | |
| global | trace | 27 | a-auditer | |
| global | i | 28 | a-auditer | |
| global | old | 35 | a-auditer | |
| function | ChaseNext | 111 | a-auditer | |
| global | i | 113 | a-auditer | |
| global | e | 114 | a-auditer | |
| function | ChasePrev | 135 | a-auditer | |
| global | i | 137 | a-auditer | |
| global | e | 138 | a-auditer | |
| function | GetChaseTarget | 159 | a-auditer | |
| global | i | 161 | a-auditer | |
| global | other | 162 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

