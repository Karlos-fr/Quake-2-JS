# Inventaire runtime Phase 03 - Quake-2-master/game/m_insane.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_insane.ts
- Cibles TS declarees : packages/game/src/m_insane.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sound_fist | 32 | a-auditer | |
| global | sound_shake | 33 | a-auditer | |
| global | sound_moan | 34 | a-auditer | |
| global | sound_scream | 35 | a-auditer | |
| function | insane_fist | 37 | a-auditer | |
| function | insane_shake | 42 | a-auditer | |
| function | insane_moan | 47 | a-auditer | |
| function | insane_scream | 52 | a-auditer | |
| function | insane_stand | 58 | a-auditer | |
| function | insane_dead | 59 | a-auditer | |
| function | insane_cross | 60 | a-auditer | |
| function | insane_walk | 61 | a-auditer | |
| function | insane_run | 62 | a-auditer | |
| function | insane_checkdown | 63 | a-auditer | |
| function | insane_checkup | 64 | a-auditer | |
| function | insane_onground | 65 | a-auditer | |
| global | insane_frames_stand_normal | 68 | a-auditer | |
| table | insane_frames_stand_normal | 68 | a-auditer | |
| global | insane_move_stand_normal | 77 | a-auditer | |
| global | insane_frames_stand_insane | 79 | a-auditer | |
| table | insane_frames_stand_insane | 79 | a-auditer | |
| global | insane_move_stand_insane | 112 | a-auditer | |
| global | insane_frames_uptodown | 114 | a-auditer | |
| table | insane_frames_uptodown | 114 | a-auditer | |
| global | insane_move_uptodown | 160 | a-auditer | |
| global | insane_frames_downtoup | 163 | a-auditer | |
| table | insane_frames_downtoup | 163 | a-auditer | |
| global | insane_move_downtoup | 185 | a-auditer | |
| global | insane_frames_jumpdown | 187 | a-auditer | |
| table | insane_frames_jumpdown | 187 | a-auditer | |
| global | insane_move_jumpdown | 195 | a-auditer | |
| global | insane_frames_down | 198 | a-auditer | |
| table | insane_frames_down | 198 | a-auditer | |
| global | insane_move_down | 262 | a-auditer | |
| global | insane_frames_walk_normal | 264 | a-auditer | |
| table | insane_frames_walk_normal | 264 | a-auditer | |
| global | insane_move_walk_normal | 280 | a-auditer | |
| global | insane_move_run_normal | 281 | a-auditer | |
| global | insane_frames_walk_insane | 283 | a-auditer | |
| table | insane_frames_walk_insane | 283 | a-auditer | |
| global | insane_move_walk_insane | 312 | a-auditer | |
| global | insane_move_run_insane | 313 | a-auditer | |
| global | insane_frames_stand_pain | 315 | a-auditer | |
| table | insane_frames_stand_pain | 315 | a-auditer | |
| global | insane_move_stand_pain | 329 | a-auditer | |
| global | insane_frames_stand_death | 331 | a-auditer | |
| table | insane_frames_stand_death | 331 | a-auditer | |
| global | insane_move_stand_death | 351 | a-auditer | |
| global | insane_frames_crawl | 353 | a-auditer | |
| table | insane_frames_crawl | 353 | a-auditer | |
| global | insane_move_crawl | 365 | a-auditer | |
| global | insane_move_runcrawl | 366 | a-auditer | |
| global | insane_frames_crawl_pain | 368 | a-auditer | |
| table | insane_frames_crawl_pain | 368 | a-auditer | |
| global | insane_move_crawl_pain | 380 | a-auditer | |
| global | insane_frames_crawl_death | 382 | a-auditer | |
| table | insane_frames_crawl_death | 382 | a-auditer | |
| global | insane_move_crawl_death | 392 | a-auditer | |
| global | insane_frames_cross | 394 | a-auditer | |
| table | insane_frames_cross | 394 | a-auditer | |
| global | insane_move_cross | 412 | a-auditer | |
| global | insane_frames_struggle_cross | 414 | a-auditer | |
| table | insane_frames_struggle_cross | 414 | a-auditer | |
| global | insane_move_struggle_cross | 432 | a-auditer | |
| function | insane_cross | 434 | a-auditer | |
| function | insane_walk | 442 | a-auditer | |
| function | insane_run | 459 | a-auditer | |
| function | insane_pain | 477 | a-auditer | |
| global | l | 496 | a-auditer | |
| function | insane_onground | 519 | a-auditer | |
| function | insane_checkdown | 524 | a-auditer | |
| function | insane_checkup | 536 | a-auditer | |
| function | insane_stand | 546 | a-auditer | |
| function | insane_dead | 563 | a-auditer | |
| function | insane_die | 581 | a-auditer | |
| global | n | 583 | a-auditer | |
| function | SP_misc_insane | 621 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

