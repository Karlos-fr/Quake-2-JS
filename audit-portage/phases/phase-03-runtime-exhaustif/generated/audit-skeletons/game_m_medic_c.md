# Inventaire runtime Phase 03 - Quake-2-master/game/m_medic.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_medic.ts
- Cibles TS declarees : packages/game/src/m_medic.ts, packages/game/src/g_spawn.ts, packages/game/src/g_save.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | visible | 31 | a-auditer | |
| global | sound_idle1 | 34 | a-auditer | |
| global | sound_pain1 | 35 | a-auditer | |
| global | sound_pain2 | 36 | a-auditer | |
| global | sound_die | 37 | a-auditer | |
| global | sound_sight | 38 | a-auditer | |
| global | sound_search | 39 | a-auditer | |
| global | sound_hook_launch | 40 | a-auditer | |
| global | sound_hook_hit | 41 | a-auditer | |
| global | sound_hook_heal | 42 | a-auditer | |
| global | sound_hook_retract | 43 | a-auditer | |
| function | medic_FindDeadMonster | 46 | a-auditer | |
| global | ent | 48 | a-auditer | |
| global | best | 49 | a-auditer | |
| function | medic_idle | 80 | a-auditer | |
| global | ent | 82 | a-auditer | |
| function | medic_search | 96 | a-auditer | |
| global | ent | 98 | a-auditer | |
| function | medic_sight | 116 | a-auditer | |
| global | medic_frames_stand | 122 | a-auditer | |
| table | medic_frames_stand | 122 | a-auditer | |
| global | medic_move_stand | 216 | a-auditer | |
| function | medic_stand | 218 | a-auditer | |
| global | medic_frames_walk | 224 | a-auditer | |
| table | medic_frames_walk | 224 | a-auditer | |
| global | medic_move_walk | 239 | a-auditer | |
| function | medic_walk | 241 | a-auditer | |
| global | medic_frames_run | 247 | a-auditer | |
| table | medic_frames_run | 247 | a-auditer | |
| global | medic_move_run | 257 | a-auditer | |
| function | medic_run | 259 | a-auditer | |
| global | ent | 263 | a-auditer | |
| global | medic_frames_pain1 | 284 | a-auditer | |
| table | medic_frames_pain1 | 284 | a-auditer | |
| global | medic_move_pain1 | 295 | a-auditer | |
| global | medic_frames_pain2 | 297 | a-auditer | |
| table | medic_frames_pain2 | 297 | a-auditer | |
| global | medic_move_pain2 | 315 | a-auditer | |
| function | medic_pain | 317 | a-auditer | |
| function | medic_fire_blaster | 342 | a-auditer | |
| global | effect | 348 | a-auditer | |
| global | effect | 355 | a-auditer | |
| function | medic_dead | 368 | a-auditer | |
| global | medic_frames_death | 378 | a-auditer | |
| table | medic_frames_death | 378 | a-auditer | |
| global | medic_move_death | 411 | a-auditer | |
| function | medic_die | 413 | a-auditer | |
| global | n | 415 | a-auditer | |
| function | medic_duck_down | 446 | a-auditer | |
| function | medic_duck_hold | 457 | a-auditer | |
| function | medic_duck_up | 465 | a-auditer | |
| global | medic_frames_duck | 473 | a-auditer | |
| table | medic_frames_duck | 473 | a-auditer | |
| global | medic_move_duck | 492 | a-auditer | |
| function | medic_dodge | 494 | a-auditer | |
| global | medic_frames_attackHyperBlaster | 505 | a-auditer | |
| table | medic_frames_attackHyperBlaster | 505 | a-auditer | |
| global | medic_move_attackHyperBlaster | 524 | a-auditer | |
| function | medic_continue | 527 | a-auditer | |
| global | medic_frames_attackBlaster | 535 | a-auditer | |
| table | medic_frames_attackBlaster | 535 | a-auditer | |
| global | medic_move_attackBlaster | 552 | a-auditer | |
| function | medic_hook_launch | 555 | a-auditer | |
| function | ED_CallSpawn | 560 | a-auditer | |
| table | medic_cable_offsets | 562 | a-auditer | |
| function | medic_cable_attack | 576 | a-auditer | |
| global | tr | 579 | a-auditer | |
| global | distance | 581 | a-auditer | |
| function | medic_hook_retract | 656 | a-auditer | |
| global | medic_frames_attackCable | 662 | a-auditer | |
| table | medic_frames_attackCable | 662 | a-auditer | |
| global | medic_move_attackCable | 693 | a-auditer | |
| function | medic_attack | 696 | a-auditer | |
| function | medic_checkattack | 704 | a-auditer | |
| function | M_CheckAttack | 712 | a-auditer | |
| function | SP_monster_medic | 718 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

