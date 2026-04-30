# Inventaire runtime Phase 03 - Quake-2-master/game/g_monster.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_monster.ts
- Cibles TS declarees : packages/game/src/g_monster.ts, packages/game/src/runtime.ts, packages/game/src/g_ai.ts, packages/game/src/g_items.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | monster_fire_bullet | 31 | a-auditer | |
| function | monster_fire_shotgun | 41 | a-auditer | |
| function | monster_fire_blaster | 51 | a-auditer | |
| function | monster_fire_grenade | 61 | a-auditer | |
| function | monster_fire_rocket | 71 | a-auditer | |
| function | monster_fire_railgun | 81 | a-auditer | |
| function | monster_fire_bfg | 91 | a-auditer | |
| function | M_FliesOff | 107 | a-auditer | |
| function | M_FliesOn | 113 | a-auditer | |
| function | M_FlyCheck | 123 | a-auditer | |
| function | AttackFinished | 135 | a-auditer | |
| function | M_CheckGround | 141 | a-auditer | |
| global | point | 143 | a-auditer | |
| global | trace | 144 | a-auditer | |
| function | M_CatagorizePosition | 183 | a-auditer | |
| global | point | 185 | a-auditer | |
| global | cont | 186 | a-auditer | |
| function | M_WorldEffects | 218 | a-auditer | |
| global | dmg | 220 | a-auditer | |
| function | M_droptofloor | 310 | a-auditer | |
| global | end | 312 | a-auditer | |
| global | trace | 313 | a-auditer | |
| function | M_SetEffects | 332 | a-auditer | |
| function | M_MoveFrame | 361 | a-auditer | |
| global | move | 363 | a-auditer | |
| global | index | 364 | a-auditer | |
| function | monster_think | 419 | a-auditer | |
| function | monster_use | 440 | a-auditer | |
| function | monster_start_go | 457 | a-auditer | |
| function | monster_triggered_spawn | 460 | a-auditer | |
| function | monster_triggered_spawn_use | 483 | a-auditer | |
| function | monster_triggered_start | 493 | a-auditer | |
| function | monster_death_use | 511 | a-auditer | |
| function | monster_start | 534 | a-auditer | |
| function | monster_start_go | 583 | a-auditer | |
| global | notcombat | 593 | a-auditer | |
| global | fixup | 594 | a-auditer | |
| global | target | 595 | a-auditer | |
| global | target | 621 | a-auditer | |
| function | walkmonster_start_go | 671 | a-auditer | |
| function | walkmonster_start | 692 | a-auditer | |
| function | flymonster_start_go | 699 | a-auditer | |
| function | flymonster_start | 715 | a-auditer | |
| function | swimmonster_start_go | 723 | a-auditer | |
| function | swimmonster_start | 735 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

