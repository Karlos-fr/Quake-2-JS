# Inventaire runtime Phase 03 - Quake-2-master/game/m_actor.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_actor.ts
- Cibles TS declarees : packages/game/src/m_actor.ts, packages/client/src/local-gameplay-sync.ts, packages/game/src/g_main.ts, packages/game/src/g_monster.ts, packages/game/src/g_spawn.ts, packages/game/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | MAX_ACTOR_NAMES | 25 | a-auditer | |
| global | actor_names | 26 | a-auditer | |
| global | actor_frames_stand | 39 | a-auditer | |
| table | actor_frames_stand | 39 | a-auditer | |
| global | actor_move_stand | 85 | a-auditer | |
| function | actor_stand | 87 | a-auditer | |
| global | actor_frames_walk | 97 | a-auditer | |
| table | actor_frames_walk | 97 | a-auditer | |
| global | actor_move_walk | 111 | a-auditer | |
| function | actor_walk | 113 | a-auditer | |
| global | actor_frames_run | 119 | a-auditer | |
| table | actor_frames_run | 119 | a-auditer | |
| global | actor_move_run | 134 | a-auditer | |
| function | actor_run | 136 | a-auditer | |
| function | actor_stand | 143 | a-auditer | |
| global | actor_frames_pain1 | 157 | a-auditer | |
| table | actor_frames_pain1 | 157 | a-auditer | |
| global | actor_move_pain1 | 163 | a-auditer | |
| global | actor_frames_pain2 | 165 | a-auditer | |
| table | actor_frames_pain2 | 165 | a-auditer | |
| global | actor_move_pain2 | 171 | a-auditer | |
| global | actor_frames_pain3 | 173 | a-auditer | |
| table | actor_frames_pain3 | 173 | a-auditer | |
| global | actor_move_pain3 | 179 | a-auditer | |
| global | actor_frames_flipoff | 181 | a-auditer | |
| table | actor_frames_flipoff | 181 | a-auditer | |
| global | actor_move_flipoff | 198 | a-auditer | |
| global | actor_frames_taunt | 200 | a-auditer | |
| table | actor_frames_taunt | 200 | a-auditer | |
| global | actor_move_taunt | 220 | a-auditer | |
| global | messages | 222 | a-auditer | |
| function | actor_pain | 230 | a-auditer | |
| global | n | 232 | a-auditer | |
| global | name | 246 | a-auditer | |
| function | actorMachineGun | 269 | a-auditer | |
| function | actor_dead | 299 | a-auditer | |
| global | actor_frames_death1 | 309 | a-auditer | |
| table | actor_frames_death1 | 309 | a-auditer | |
| global | actor_move_death1 | 319 | a-auditer | |
| global | actor_frames_death2 | 321 | a-auditer | |
| table | actor_frames_death2 | 321 | a-auditer | |
| global | actor_move_death2 | 337 | a-auditer | |
| function | actor_die | 339 | a-auditer | |
| global | n | 341 | a-auditer | |
| function | actor_fire | 372 | a-auditer | |
| global | actor_frames_attack | 382 | a-auditer | |
| table | actor_frames_attack | 382 | a-auditer | |
| global | actor_move_attack | 389 | a-auditer | |
| function | actor_attack | 391 | a-auditer | |
| global | n | 393 | a-auditer | |
| function | actor_use | 401 | a-auditer | |
| global | v | 403 | a-auditer | |
| function | SP_misc_actor | 425 | a-auditer | |
| function | target_actor_touch | 496 | a-auditer | |
| global | n | 510 | a-auditer | |
| global | ent | 511 | a-auditer | |
| global | savetarget | 560 | a-auditer | |
| function | SP_target_actor | 585 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

