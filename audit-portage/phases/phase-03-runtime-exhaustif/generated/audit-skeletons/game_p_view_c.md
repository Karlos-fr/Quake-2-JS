# Inventaire runtime Phase 03 - Quake-2-master/game/p_view.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/p_view.ts
- Cibles TS declarees : packages/game/src/p_view.ts, packages/game/src/g_main.ts, packages/game/src/index.ts, packages/game/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | current_player | 26 | a-auditer | |
| global | xyspeed | 30 | a-auditer | |
| global | bobmove | 32 | a-auditer | |
| global | bobcycle | 33 | a-auditer | |
| global | bobfracsin | 34 | a-auditer | |
| function | SV_CalcRoll | 42 | a-auditer | |
| global | sign | 44 | a-auditer | |
| global | side | 45 | a-auditer | |
| global | value | 46 | a-auditer | |
| global | side | 57 | a-auditer | |
| function | P_DamageFeedback | 71 | a-auditer | |
| global | side | 74 | a-auditer | |
| global | i | 99 | a-auditer | |
| global | l | 143 | a-auditer | |
| function | SV_CalcViewOffset | 222 | a-auditer | |
| global | angles | 224 | a-auditer | |
| global | bob | 225 | a-auditer | |
| global | ratio | 226 | a-auditer | |
| global | delta | 227 | a-auditer | |
| global | v | 228 | a-auditer | |
| function | SV_CalcGunOffset | 345 | a-auditer | |
| global | i | 347 | a-auditer | |
| global | delta | 348 | a-auditer | |
| function | SV_AddBlend | 397 | a-auditer | |
| function | SV_CalcBlend | 418 | a-auditer | |
| global | contents | 420 | a-auditer | |
| global | remaining | 422 | a-auditer | |
| function | P_FallingDamage | 501 | a-auditer | |
| global | delta | 503 | a-auditer | |
| global | damage | 504 | a-auditer | |
| function | P_WorldEffects | 579 | a-auditer | |
| global | breather | 581 | a-auditer | |
| global | envirosuit | 582 | a-auditer | |
| function | T_Damage | 726 | a-auditer | |
| function | G_SetClientEffects | 745 | a-auditer | |
| global | pa_type | 747 | a-auditer | |
| global | remaining | 748 | a-auditer | |
| function | G_SetClientEvent | 798 | a-auditer | |
| function | G_SetClientSound | 815 | a-auditer | |
| global | weap | 817 | a-auditer | |
| global | weap | 836 | a-auditer | |
| function | G_SetClientFrame | 855 | a-auditer | |
| global | duck | 868 | a-auditer | |
| global | run | 872 | a-auditer | |
| function | ClientEndServerFrame | 958 | a-auditer | |
| global | bobtime | 960 | a-auditer | |
| global | i | 961 | a-auditer | |
| global | bobmove | 1028 | a-auditer | |
| function | G_SetStats | 1062 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

