# Inventaire runtime Phase 03 - Quake-2-master/game/g_phys.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_phys.ts
- Cibles TS declarees : packages/game/src/g_phys.ts, packages/game/src/runtime.ts, packages/game/src/touch.ts, packages/game/src/m_move.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | SV_TestEntityPosition | 49 | a-auditer | |
| global | trace | 51 | a-auditer | |
| global | mask | 52 | a-auditer | |
| global | mask | 57 | a-auditer | |
| function | SV_CheckVelocity | 72 | a-auditer | |
| global | i | 74 | a-auditer | |
| function | SV_RunThink | 95 | a-auditer | |
| global | thinktime | 97 | a-auditer | |
| function | SV_Impact | 120 | a-auditer | |
| global | e2 | 122 | a-auditer | |
| macro | STOP_EPSILON | 143 | a-auditer | |
| function | ClipVelocity | 145 | a-auditer | |
| global | backoff | 147 | a-auditer | |
| global | change | 148 | a-auditer | |
| macro | MAX_CLIP_PLANES | 182 | a-auditer | |
| function | SV_FlyMove | 183 | a-auditer | |
| global | hit | 185 | a-auditer | |
| global | dir | 187 | a-auditer | |
| global | d | 188 | a-auditer | |
| global | numplanes | 189 | a-auditer | |
| global | planes | 190 | a-auditer | |
| global | trace | 193 | a-auditer | |
| global | end | 194 | a-auditer | |
| global | time_left | 195 | a-auditer | |
| global | blocked | 196 | a-auditer | |
| function | SV_AddGravity | 322 | a-auditer | |
| function | SV_PushEntity | 342 | a-auditer | |
| global | trace | 344 | a-auditer | |
| global | mask | 347 | a-auditer | |
| global | mask | 356 | a-auditer | |
| struct | pushed_t | 384 | a-auditer | |
| global | ent | 386 | a-auditer | |
| global | deltayaw | 389 | a-auditer | |
| global | obstacle | 393 | a-auditer | |
| function | SV_Push | 403 | a-auditer | |
| global | temp | 415 | a-auditer | |
| function | SV_Physics_Pusher | 562 | a-auditer | |
| function | SV_Physics_None | 630 | a-auditer | |
| function | SV_Physics_Noclip | 643 | a-auditer | |
| function | SV_Physics_Toss | 670 | a-auditer | |
| global | trace | 672 | a-auditer | |
| global | move | 673 | a-auditer | |
| global | backoff | 674 | a-auditer | |
| global | slave | 675 | a-auditer | |
| global | wasinwater | 676 | a-auditer | |
| global | isinwater | 677 | a-auditer | |
| global | old_origin | 678 | a-auditer | |
| global | backoff | 722 | a-auditer | |
| macro | sv_stopspeed | 787 | a-auditer | |
| macro | sv_friction | 788 | a-auditer | |
| macro | sv_waterfriction | 789 | a-auditer | |
| function | SV_AddRotationalFriction | 791 | a-auditer | |
| global | n | 793 | a-auditer | |
| global | adjustment | 794 | a-auditer | |
| function | SV_Physics_Step | 815 | a-auditer | |
| global | wasonground | 817 | a-auditer | |
| global | hitsound | 818 | a-auditer | |
| global | vel | 819 | a-auditer | |
| global | friction | 821 | a-auditer | |
| global | groundentity | 822 | a-auditer | |
| global | mask | 823 | a-auditer | |
| global | wasonground | 836 | a-auditer | |
| global | mask | 907 | a-auditer | |
| function | G_RunEntity | 932 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

