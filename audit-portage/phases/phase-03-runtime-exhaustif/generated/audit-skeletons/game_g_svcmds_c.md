# Inventaire runtime Phase 03 - Quake-2-master/game/g_svcmds.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_svcmds.ts
- Cibles TS declarees : packages/game/src/g_svcmds.ts, packages/game/src/g_main.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | Svcmd_Test_f | 24 | a-auditer | |
| struct | ipfilter_t | 60 | a-auditer | |
| global | mask | 62 | a-auditer | |
| global | compare | 63 | a-auditer | |
| macro | MAX_IPFILTERS | 66 | a-auditer | |
| global | numipfilters | 69 | a-auditer | |
| function | StringToFilter | 76 | a-auditer | |
| global | num | 78 | a-auditer | |
| global | b | 80 | a-auditer | |
| global | m | 81 | a-auditer | |
| function | SV_FilterPacket | 123 | a-auditer | |
| global | i | 125 | a-auditer | |
| global | in | 126 | a-auditer | |
| global | m | 127 | a-auditer | |
| global | p | 128 | a-auditer | |
| function | SVCmd_AddIP_f | 158 | a-auditer | |
| global | i | 160 | a-auditer | |
| function | SVCmd_RemoveIP_f | 189 | a-auditer | |
| function | SVCmd_ListIP_f | 220 | a-auditer | |
| global | i | 222 | a-auditer | |
| global | b | 223 | a-auditer | |
| function | SVCmd_WriteIP_f | 238 | a-auditer | |
| global | name | 241 | a-auditer | |
| global | b | 242 | a-auditer | |
| global | i | 243 | a-auditer | |
| global | game | 244 | a-auditer | |
| function | sprintf | 251 | a-auditer | |
| function | ServerCommand | 282 | a-auditer | |
| global | cmd | 284 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

