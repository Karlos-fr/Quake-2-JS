# Inventaire runtime Phase 03 - Quake-2-master/game/g_utils.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_utils.ts
- Cibles TS declarees : packages/game/src/g_utils.ts, packages/game/src/touch.ts, packages/game/src/runtime.ts, packages/game/src/g_weapon.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | G_ProjectSource | 25 | a-auditer | |
| function | G_Find | 45 | a-auditer | |
| global | s | 47 | a-auditer | |
| function | findradius | 78 | a-auditer | |
| global | j | 81 | a-auditer | |
| macro | MAXCHOICES | 116 | a-auditer | |
| function | G_PickTarget | 118 | a-auditer | |
| global | ent | 120 | a-auditer | |
| global | num_choices | 121 | a-auditer | |
| global | choice | 122 | a-auditer | |
| function | Think_Delay | 151 | a-auditer | |
| function | G_UseTargets | 173 | a-auditer | |
| global | t | 175 | a-auditer | |
| function | tv | 266 | a-auditer | |
| global | index | 268 | a-auditer | |
| global | v | 270 | a-auditer | |
| function | vtos | 293 | a-auditer | |
| global | index | 295 | a-auditer | |
| global | s | 297 | a-auditer | |
| function | G_SetMovedir | 314 | a-auditer | |
| function | vectoyaw | 333 | a-auditer | |
| global | yaw | 335 | a-auditer | |
| function | vectoangles | 356 | a-auditer | |
| global | forward | 358 | a-auditer | |
| global | pitch | 367 | a-auditer | |
| global | yaw | 376 | a-auditer | |
| function | G_CopyString | 391 | a-auditer | |
| global | out | 393 | a-auditer | |
| function | G_InitEdict | 401 | a-auditer | |
| function | G_Spawn | 420 | a-auditer | |
| global | i | 422 | a-auditer | |
| global | e | 423 | a-auditer | |
| function | G_FreeEdict | 452 | a-auditer | |
| function | G_TouchTriggers | 475 | a-auditer | |
| function | G_TouchSolids | 508 | a-auditer | |
| function | KillBox | 549 | a-auditer | |
| global | tr | 551 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

