# Inventaire runtime Phase 03 - Quake-2-master/game/g_trigger.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_trigger.ts
- Cibles TS declarees : packages/game/src/g_trigger.ts, packages/game/src/g_combat.ts, packages/game/src/g_items.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts, packages/game/src/touch.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | InitTrigger | 23 | a-auditer | |
| function | multi_wait | 36 | a-auditer | |
| function | multi_trigger | 45 | a-auditer | |
| function | Use_Multi | 66 | a-auditer | |
| function | Touch_Multi | 72 | a-auditer | |
| global | return | 85 | a-auditer | |
| function | trigger_enable | 111 | a-auditer | |
| function | SP_trigger_multiple | 118 | a-auditer | |
| function | SP_trigger_once | 168 | a-auditer | |
| function | trigger_relay_use | 189 | a-auditer | |
| function | SP_trigger_relay | 194 | a-auditer | |
| function | trigger_key_use | 212 | a-auditer | |
| global | index | 214 | a-auditer | |
| global | player | 235 | a-auditer | |
| global | ent | 236 | a-auditer | |
| global | cube | 240 | a-auditer | |
| function | SP_trigger_key | 282 | a-auditer | |
| function | trigger_counter_use | 326 | a-auditer | |
| function | SP_trigger_counter | 352 | a-auditer | |
| function | SP_trigger_always | 373 | a-auditer | |
| macro | PUSH_ONCE | 390 | a-auditer | |
| global | windsound | 392 | a-auditer | |
| function | trigger_push_touch | 394 | a-auditer | |
| function | SP_trigger_push | 424 | a-auditer | |
| function | hurt_use | 455 | a-auditer | |
| function | hurt_touch | 468 | a-auditer | |
| global | dflags | 470 | a-auditer | |
| global | dflags | 492 | a-auditer | |
| function | SP_trigger_hurt | 496 | a-auditer | |
| function | trigger_gravity_touch | 532 | a-auditer | |
| function | SP_trigger_gravity | 537 | a-auditer | |
| function | trigger_monsterjump_touch | 566 | a-auditer | |
| function | SP_trigger_monsterjump | 586 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

