# Inventaire runtime Phase 03 - Quake-2-master/game/m_gladiator.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_gladiator.ts
- Cibles TS declarees : packages/game/src/m_gladiator.ts, packages/game/src/g_save.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sound_pain1 | 32 | a-auditer | |
| global | sound_pain2 | 33 | a-auditer | |
| global | sound_die | 34 | a-auditer | |
| global | sound_gun | 35 | a-auditer | |
| global | sound_cleaver_swing | 36 | a-auditer | |
| global | sound_cleaver_hit | 37 | a-auditer | |
| global | sound_cleaver_miss | 38 | a-auditer | |
| global | sound_idle | 39 | a-auditer | |
| global | sound_search | 40 | a-auditer | |
| global | sound_sight | 41 | a-auditer | |
| function | gladiator_idle | 44 | a-auditer | |
| function | gladiator_sight | 49 | a-auditer | |
| function | gladiator_search | 54 | a-auditer | |
| function | gladiator_cleaver_swing | 59 | a-auditer | |
| global | gladiator_frames_stand | 64 | a-auditer | |
| table | gladiator_frames_stand | 64 | a-auditer | |
| global | gladiator_move_stand | 74 | a-auditer | |
| function | gladiator_stand | 76 | a-auditer | |
| global | gladiator_frames_walk | 82 | a-auditer | |
| table | gladiator_frames_walk | 82 | a-auditer | |
| global | gladiator_move_walk | 101 | a-auditer | |
| function | gladiator_walk | 103 | a-auditer | |
| global | gladiator_frames_run | 109 | a-auditer | |
| table | gladiator_frames_run | 109 | a-auditer | |
| global | gladiator_move_run | 118 | a-auditer | |
| function | gladiator_run | 120 | a-auditer | |
| function | GaldiatorMelee | 129 | a-auditer | |
| global | gladiator_frames_attack_melee | 140 | a-auditer | |
| table | gladiator_frames_attack_melee | 140 | a-auditer | |
| global | gladiator_move_attack_melee | 160 | a-auditer | |
| function | gladiator_melee | 162 | a-auditer | |
| function | GladiatorGun | 168 | a-auditer | |
| global | gladiator_frames_attack_gun | 184 | a-auditer | |
| table | gladiator_frames_attack_gun | 184 | a-auditer | |
| global | gladiator_move_attack_gun | 196 | a-auditer | |
| function | gladiator_attack | 198 | a-auditer | |
| global | range | 200 | a-auditer | |
| global | gladiator_frames_pain | 217 | a-auditer | |
| table | gladiator_frames_pain | 217 | a-auditer | |
| global | gladiator_move_pain | 226 | a-auditer | |
| global | gladiator_frames_pain_air | 228 | a-auditer | |
| table | gladiator_frames_pain_air | 228 | a-auditer | |
| global | gladiator_move_pain_air | 238 | a-auditer | |
| function | gladiator_pain | 240 | a-auditer | |
| function | gladiator_dead | 271 | a-auditer | |
| global | gladiator_frames_death | 281 | a-auditer | |
| table | gladiator_frames_death | 281 | a-auditer | |
| global | gladiator_move_death | 306 | a-auditer | |
| function | gladiator_die | 308 | a-auditer | |
| global | n | 310 | a-auditer | |
| function | SP_monster_gladiator | 339 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

