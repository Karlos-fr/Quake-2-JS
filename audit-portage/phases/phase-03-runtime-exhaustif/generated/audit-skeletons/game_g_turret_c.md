# Inventaire runtime Phase 03 - Quake-2-master/game/g_turret.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_turret.ts
- Cibles TS declarees : packages/game/src/g_turret.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | AnglesNormalize | 25 | a-auditer | |
| function | SnapToEights | 37 | a-auditer | |
| function | turret_blocked | 48 | a-auditer | |
| global | attacker | 50 | a-auditer | |
| global | attacker | 57 | a-auditer | |
| function | turret_breach_fire | 78 | a-auditer | |
| global | damage | 82 | a-auditer | |
| global | speed | 83 | a-auditer | |
| function | turret_breach_think | 96 | a-auditer | |
| global | ent | 98 | a-auditer | |
| global | angle | 165 | a-auditer | |
| global | target_z | 166 | a-auditer | |
| global | diff | 167 | a-auditer | |
| function | turret_breach_finish_init | 201 | a-auditer | |
| function | SP_turret_breach | 220 | a-auditer | |
| function | SP_turret_base | 259 | a-auditer | |
| function | infantry_die | 274 | a-auditer | |
| function | infantry_stand | 275 | a-auditer | |
| function | monster_use | 276 | a-auditer | |
| function | turret_driver_die | 278 | a-auditer | |
| global | ent | 280 | a-auditer | |
| function | FindTarget | 298 | a-auditer | |
| function | turret_driver_think | 300 | a-auditer | |
| global | reaction_time | 304 | a-auditer | |
| function | turret_driver_link | 354 | a-auditer | |
| global | ent | 357 | a-auditer | |
| function | SP_turret_driver | 387 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

