# Inventaire runtime Phase 03 - Quake-2-master/game/m_gunner.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_gunner.ts
- Cibles TS declarees : packages/game/src/m_gunner.ts, packages/game/src/g_save.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts, packages/game/src/m_flash.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sound_pain | 32 | a-auditer | |
| global | sound_pain2 | 33 | a-auditer | |
| global | sound_death | 34 | a-auditer | |
| global | sound_idle | 35 | a-auditer | |
| global | sound_open | 36 | a-auditer | |
| global | sound_search | 37 | a-auditer | |
| global | sound_sight | 38 | a-auditer | |
| function | gunner_idlesound | 41 | a-auditer | |
| function | gunner_sight | 46 | a-auditer | |
| function | gunner_search | 51 | a-auditer | |
| function | visible | 57 | a-auditer | |
| function | GunnerGrenade | 58 | a-auditer | |
| function | GunnerFire | 59 | a-auditer | |
| function | gunner_fire_chain | 60 | a-auditer | |
| function | gunner_refire_chain | 61 | a-auditer | |
| function | gunner_stand | 64 | a-auditer | |
| global | gunner_frames_fidget | 66 | a-auditer | |
| table | gunner_frames_fidget | 66 | a-auditer | |
| global | gunner_move_fidget | 122 | a-auditer | |
| function | gunner_fidget | 124 | a-auditer | |
| global | gunner_frames_stand | 132 | a-auditer | |
| table | gunner_frames_stand | 132 | a-auditer | |
| global | gunner_move_stand | 167 | a-auditer | |
| function | gunner_stand | 169 | a-auditer | |
| global | gunner_frames_walk | 175 | a-auditer | |
| table | gunner_frames_walk | 175 | a-auditer | |
| global | gunner_move_walk | 191 | a-auditer | |
| function | gunner_walk | 193 | a-auditer | |
| global | gunner_frames_run | 198 | a-auditer | |
| table | gunner_frames_run | 198 | a-auditer | |
| global | gunner_move_run | 210 | a-auditer | |
| function | gunner_run | 212 | a-auditer | |
| global | gunner_frames_runandshoot | 220 | a-auditer | |
| table | gunner_frames_runandshoot | 220 | a-auditer | |
| global | gunner_move_runandshoot | 230 | a-auditer | |
| function | gunner_runandshoot | 232 | a-auditer | |
| global | gunner_frames_pain3 | 237 | a-auditer | |
| table | gunner_frames_pain3 | 237 | a-auditer | |
| global | gunner_move_pain3 | 245 | a-auditer | |
| global | gunner_frames_pain2 | 247 | a-auditer | |
| table | gunner_frames_pain2 | 247 | a-auditer | |
| global | gunner_move_pain2 | 258 | a-auditer | |
| global | gunner_frames_pain1 | 260 | a-auditer | |
| table | gunner_frames_pain1 | 260 | a-auditer | |
| global | gunner_move_pain1 | 281 | a-auditer | |
| function | gunner_pain | 283 | a-auditer | |
| function | gunner_dead | 309 | a-auditer | |
| global | gunner_frames_death | 319 | a-auditer | |
| table | gunner_frames_death | 319 | a-auditer | |
| global | gunner_move_death | 333 | a-auditer | |
| function | gunner_die | 335 | a-auditer | |
| global | n | 337 | a-auditer | |
| function | gunner_duck_down | 363 | a-auditer | |
| function | gunner_duck_hold | 380 | a-auditer | |
| function | gunner_duck_up | 388 | a-auditer | |
| global | gunner_frames_duck | 396 | a-auditer | |
| table | gunner_frames_duck | 396 | a-auditer | |
| global | gunner_move_duck | 407 | a-auditer | |
| function | gunner_dodge | 409 | a-auditer | |
| function | gunner_opengun | 421 | a-auditer | |
| function | GunnerFire | 426 | a-auditer | |
| global | flash_number | 432 | a-auditer | |
| function | GunnerGrenade | 449 | a-auditer | |
| global | flash_number | 454 | a-auditer | |
| global | flash_number | 463 | a-auditer | |
| global | gunner_frames_attack_chain | 474 | a-auditer | |
| table | gunner_frames_attack_chain | 474 | a-auditer | |
| global | gunner_move_attack_chain | 494 | a-auditer | |
| global | gunner_frames_fire_chain | 496 | a-auditer | |
| table | gunner_frames_fire_chain | 496 | a-auditer | |
| global | gunner_move_fire_chain | 507 | a-auditer | |
| global | gunner_frames_endfire_chain | 509 | a-auditer | |
| table | gunner_frames_endfire_chain | 509 | a-auditer | |
| global | gunner_move_endfire_chain | 519 | a-auditer | |
| global | gunner_frames_attack_grenade | 521 | a-auditer | |
| table | gunner_frames_attack_grenade | 521 | a-auditer | |
| global | gunner_move_attack_grenade | 545 | a-auditer | |
| function | gunner_attack | 547 | a-auditer | |
| function | gunner_fire_chain | 562 | a-auditer | |
| function | gunner_refire_chain | 567 | a-auditer | |
| function | SP_monster_gunner | 581 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

