# Inventaire runtime Phase 03 - Quake-2-master/game/g_combat.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_combat.ts
- Cibles TS declarees : packages/game/src/g_combat.ts, packages/game/src/g_weapon.ts, packages/game/src/g_utils.ts, packages/game/src/g_items.ts, packages/game/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | CanDamage | 32 | a-auditer | |
| global | trace | 35 | a-auditer | |
| function | Killed | 92 | a-auditer | |
| function | SpawnDamage | 134 | a-auditer | |
| function | CheckPowerArmor | 171 | a-auditer | |
| global | save | 174 | a-auditer | |
| global | power_armor_type | 175 | a-auditer | |
| global | index | 176 | a-auditer | |
| global | damagePerCell | 177 | a-auditer | |
| global | pa_te_type | 178 | a-auditer | |
| global | power | 179 | a-auditer | |
| global | power_used | 180 | a-auditer | |
| global | vec | 214 | a-auditer | |
| global | dot | 215 | a-auditer | |
| global | forward | 216 | a-auditer | |
| function | CheckArmor | 255 | a-auditer | |
| global | save | 258 | a-auditer | |
| global | index | 259 | a-auditer | |
| global | armor | 260 | a-auditer | |
| global | save | 282 | a-auditer | |
| function | M_ReactToDamage | 295 | a-auditer | |
| function | CheckTeamDamage | 370 | a-auditer | |
| function | T_Damage | 377 | a-auditer | |
| global | take | 380 | a-auditer | |
| global | save | 381 | a-auditer | |
| global | asave | 382 | a-auditer | |
| global | psave | 383 | a-auditer | |
| global | te_sparks | 384 | a-auditer | |
| global | te_sparks | 417 | a-auditer | |
| global | mass | 434 | a-auditer | |
| global | mass | 439 | a-auditer | |
| function | VectorScale | 444 | a-auditer | |
| function | SpawnDamage | 492 | a-auditer | |
| function | T_RadiusDamage | 547 | a-auditer | |
| global | points | 549 | a-auditer | |
| global | ent | 550 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

