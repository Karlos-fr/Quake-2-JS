# Inventaire runtime Phase 03 - Quake-2-master/game/g_ai.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_ai.ts
- Cibles TS declarees : packages/game/src/g_ai.ts, packages/game/src/g_monster.ts, packages/game/src/m_move.ts, packages/game/src/g_utils.ts, packages/game/src/p_trail.ts, packages/game/src/runtime.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | FindTarget | 24 | a-auditer | |
| global | maxclients | 25 | a-auditer | |
| function | ai_checkattack | 27 | a-auditer | |
| global | enemy_vis | 29 | a-auditer | |
| global | enemy_infront | 30 | a-auditer | |
| global | enemy_range | 31 | a-auditer | |
| global | enemy_yaw | 32 | a-auditer | |
| function | AI_SetSightClient | 50 | a-auditer | |
| global | ent | 52 | a-auditer | |
| global | start | 58 | a-auditer | |
| function | ai_move | 92 | a-auditer | |
| function | ai_stand | 106 | a-auditer | |
| function | FindTarget | 128 | a-auditer | |
| function | ai_walk | 163 | a-auditer | |
| function | ai_charge | 194 | a-auditer | |
| function | ai_turn | 215 | a-auditer | |
| function | range | 264 | a-auditer | |
| global | len | 267 | a-auditer | |
| function | visible | 287 | a-auditer | |
| global | trace | 291 | a-auditer | |
| function | infront | 312 | a-auditer | |
| global | dot | 315 | a-auditer | |
| function | HuntTarget | 331 | a-auditer | |
| function | FoundTarget | 347 | a-auditer | |
| function | FindTarget | 407 | a-auditer | |
| global | client | 409 | a-auditer | |
| global | heardit | 410 | a-auditer | |
| global | r | 411 | a-auditer | |
| function | FacingIdeal | 594 | a-auditer | |
| global | delta | 596 | a-auditer | |
| function | M_CheckAttack | 607 | a-auditer | |
| global | chance | 610 | a-auditer | |
| global | tr | 611 | a-auditer | |
| function | ai_run_melee | 703 | a-auditer | |
| function | ai_run_missile | 723 | a-auditer | |
| function | ai_run_slide | 743 | a-auditer | |
| global | ofs | 745 | a-auditer | |
| global | ofs | 753 | a-auditer | |
| function | ai_checkattack | 771 | a-auditer | |
| global | temp | 773 | a-auditer | |
| global | hesDeadJim | 774 | a-auditer | |
| function | ai_run | 914 | a-auditer | |
| global | v | 916 | a-auditer | |
| global | tempgoal | 917 | a-auditer | |
| global | save | 918 | a-auditer | |
| global | new | 919 | a-auditer | |
| global | marker | 920 | a-auditer | |
| global | tr | 922 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

