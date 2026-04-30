# Inventaire runtime Phase 03 - Quake-2-master/game/m_flipper.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_flipper.ts
- Cibles TS declarees : packages/game/src/m_flipper.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts, packages/game/src/g_save.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sound_chomp | 32 | a-auditer | |
| global | sound_attack | 33 | a-auditer | |
| global | sound_pain1 | 34 | a-auditer | |
| global | sound_pain2 | 35 | a-auditer | |
| global | sound_death | 36 | a-auditer | |
| global | sound_idle | 37 | a-auditer | |
| global | sound_search | 38 | a-auditer | |
| global | sound_sight | 39 | a-auditer | |
| function | flipper_stand | 42 | a-auditer | |
| global | flipper_frames_stand | 44 | a-auditer | |
| table | flipper_frames_stand | 44 | a-auditer | |
| global | flipper_move_stand | 49 | a-auditer | |
| function | flipper_stand | 51 | a-auditer | |
| macro | FLIPPER_RUN_SPEED | 56 | a-auditer | |
| global | flipper_frames_run | 58 | a-auditer | |
| table | flipper_frames_run | 58 | a-auditer | |
| global | flipper_move_run_loop | 87 | a-auditer | |
| function | flipper_run_loop | 89 | a-auditer | |
| global | flipper_frames_run_start | 94 | a-auditer | |
| table | flipper_frames_run_start | 94 | a-auditer | |
| global | flipper_move_run_start | 103 | a-auditer | |
| function | flipper_run | 105 | a-auditer | |
| global | flipper_frames_walk | 111 | a-auditer | |
| table | flipper_frames_walk | 111 | a-auditer | |
| global | flipper_move_walk | 138 | a-auditer | |
| function | flipper_walk | 140 | a-auditer | |
| global | flipper_frames_start_run | 145 | a-auditer | |
| table | flipper_frames_start_run | 145 | a-auditer | |
| global | flipper_move_start_run | 153 | a-auditer | |
| function | flipper_start_run | 155 | a-auditer | |
| global | flipper_frames_pain2 | 160 | a-auditer | |
| table | flipper_frames_pain2 | 160 | a-auditer | |
| global | flipper_move_pain2 | 168 | a-auditer | |
| global | flipper_frames_pain1 | 170 | a-auditer | |
| table | flipper_frames_pain1 | 170 | a-auditer | |
| global | flipper_move_pain1 | 178 | a-auditer | |
| function | flipper_bite | 180 | a-auditer | |
| function | flipper_preattack | 188 | a-auditer | |
| global | flipper_frames_attack | 193 | a-auditer | |
| table | flipper_frames_attack | 193 | a-auditer | |
| global | flipper_move_attack | 216 | a-auditer | |
| function | flipper_melee | 218 | a-auditer | |
| function | flipper_pain | 223 | a-auditer | |
| global | n | 225 | a-auditer | |
| function | flipper_dead | 251 | a-auditer | |
| global | flipper_frames_death | 261 | a-auditer | |
| table | flipper_frames_death | 261 | a-auditer | |
| global | flipper_move_death | 325 | a-auditer | |
| function | flipper_sight | 327 | a-auditer | |
| function | flipper_die | 332 | a-auditer | |
| global | n | 334 | a-auditer | |
| function | SP_monster_flipper | 361 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

