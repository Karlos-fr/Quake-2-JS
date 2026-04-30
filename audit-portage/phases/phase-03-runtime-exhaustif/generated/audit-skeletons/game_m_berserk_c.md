# Inventaire runtime Phase 03 - Quake-2-master/game/m_berserk.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_berserk.ts
- Cibles TS declarees : packages/game/src/m_berserk.ts, packages/game/src/g_spawn.ts, packages/game/src/g_save.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sound_pain | 32 | a-auditer | |
| global | sound_die | 33 | a-auditer | |
| global | sound_idle | 34 | a-auditer | |
| global | sound_punch | 35 | a-auditer | |
| global | sound_sight | 36 | a-auditer | |
| global | sound_search | 37 | a-auditer | |
| function | berserk_sight | 39 | a-auditer | |
| function | berserk_search | 44 | a-auditer | |
| function | berserk_fidget | 50 | a-auditer | |
| global | berserk_frames_stand | 51 | a-auditer | |
| table | berserk_frames_stand | 51 | a-auditer | |
| global | berserk_move_stand | 59 | a-auditer | |
| function | berserk_stand | 61 | a-auditer | |
| global | berserk_frames_stand_fidget | 66 | a-auditer | |
| table | berserk_frames_stand_fidget | 66 | a-auditer | |
| global | berserk_move_stand_fidget | 89 | a-auditer | |
| function | berserk_fidget | 91 | a-auditer | |
| global | berserk_frames_walk | 103 | a-auditer | |
| table | berserk_frames_walk | 103 | a-auditer | |
| global | berserk_move_walk | 118 | a-auditer | |
| function | berserk_walk | 120 | a-auditer | |
| global | berserk_frames_run1 | 150 | a-auditer | |
| table | berserk_frames_run1 | 150 | a-auditer | |
| global | berserk_move_run1 | 159 | a-auditer | |
| function | berserk_run | 161 | a-auditer | |
| function | berserk_attack_spike | 170 | a-auditer | |
| function | berserk_swing | 177 | a-auditer | |
| global | berserk_frames_attack_spike | 182 | a-auditer | |
| table | berserk_frames_attack_spike | 182 | a-auditer | |
| global | berserk_move_attack_spike | 193 | a-auditer | |
| function | berserk_attack_club | 196 | a-auditer | |
| global | berserk_frames_attack_club | 204 | a-auditer | |
| table | berserk_frames_attack_club | 204 | a-auditer | |
| global | berserk_move_attack_club | 219 | a-auditer | |
| function | berserk_strike | 222 | a-auditer | |
| global | berserk_frames_attack_strike | 228 | a-auditer | |
| table | berserk_frames_attack_strike | 228 | a-auditer | |
| global | berserk_move_attack_strike | 246 | a-auditer | |
| function | berserk_melee | 249 | a-auditer | |
| global | berserk_frames_pain1 | 280 | a-auditer | |
| table | berserk_frames_pain1 | 280 | a-auditer | |
| global | berserk_move_pain1 | 287 | a-auditer | |
| global | berserk_frames_pain2 | 290 | a-auditer | |
| table | berserk_frames_pain2 | 290 | a-auditer | |
| global | berserk_move_pain2 | 313 | a-auditer | |
| function | berserk_pain | 315 | a-auditer | |
| function | berserk_dead | 336 | a-auditer | |
| global | berserk_frames_death1 | 347 | a-auditer | |
| table | berserk_frames_death1 | 347 | a-auditer | |
| global | berserk_move_death1 | 364 | a-auditer | |
| global | berserk_frames_death2 | 367 | a-auditer | |
| table | berserk_frames_death2 | 367 | a-auditer | |
| global | berserk_move_death2 | 378 | a-auditer | |
| function | berserk_die | 381 | a-auditer | |
| global | n | 383 | a-auditer | |
| function | SP_monster_berserk | 413 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

