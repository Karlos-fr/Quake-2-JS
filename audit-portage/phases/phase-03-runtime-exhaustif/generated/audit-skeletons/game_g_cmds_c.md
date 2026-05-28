# Inventaire runtime Phase 03 - Quake-2-master/game/g_cmds.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_cmds.ts
- Cibles TS declarees : packages/game/src/g_cmds.ts, packages/game/src/g_items.ts, packages/game/src/g_main.ts, packages/game/src/index.ts, packages/game/src/p_client.ts, packages/game/src/p_hud.ts, packages/game/src/p_weapon.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | ClientTeam | 24 | a-auditer | |
| global | p | 26 | a-auditer | |
| global | value | 27 | a-auditer | |
| function | OnSameTeam | 49 | a-auditer | |
| global | ent1Team | 51 | a-auditer | |
| global | ent2Team | 52 | a-auditer | |
| function | SelectNextItem | 66 | a-auditer | |
| global | it | 70 | a-auditer | |
| function | SelectPrevItem | 98 | a-auditer | |
| global | it | 102 | a-auditer | |
| function | ValidateSelectedItem | 130 | a-auditer | |
| function | Cmd_Give_f | 152 | a-auditer | |
| global | name | 154 | a-auditer | |
| global | it | 155 | a-auditer | |
| global | index | 156 | a-auditer | |
| global | i | 157 | a-auditer | |
| global | give_all | 158 | a-auditer | |
| global | it_ent | 159 | a-auditer | |
| global | give_all | 172 | a-auditer | |
| function | Cmd_God_f | 308 | a-auditer | |
| global | msg | 310 | a-auditer | |
| global | msg | 322 | a-auditer | |
| function | Cmd_Notarget_f | 337 | a-auditer | |
| global | msg | 339 | a-auditer | |
| global | msg | 351 | a-auditer | |
| function | Cmd_Noclip_f | 364 | a-auditer | |
| global | msg | 366 | a-auditer | |
| function | Cmd_Use_f | 396 | a-auditer | |
| global | index | 398 | a-auditer | |
| global | it | 399 | a-auditer | |
| global | s | 400 | a-auditer | |
| function | Cmd_Drop_f | 432 | a-auditer | |
| global | index | 434 | a-auditer | |
| global | it | 435 | a-auditer | |
| global | s | 436 | a-auditer | |
| function | Cmd_Inven_f | 466 | a-auditer | |
| global | i | 468 | a-auditer | |
| function | Cmd_InvUse_f | 497 | a-auditer | |
| global | it | 499 | a-auditer | |
| function | Cmd_WeapPrev_f | 523 | a-auditer | |
| global | it | 527 | a-auditer | |
| global | selected_weapon | 528 | a-auditer | |
| function | Cmd_WeapNext_f | 559 | a-auditer | |
| global | it | 563 | a-auditer | |
| global | selected_weapon | 564 | a-auditer | |
| function | Cmd_WeapLast_f | 595 | a-auditer | |
| global | index | 598 | a-auditer | |
| global | it | 599 | a-auditer | |
| function | Cmd_InvDrop_f | 622 | a-auditer | |
| global | it | 624 | a-auditer | |
| function | Cmd_Kill_f | 648 | a-auditer | |
| function | Cmd_PutAway_f | 663 | a-auditer | |
| function | PlayerSort | 671 | a-auditer | |
| function | Cmd_Players_f | 693 | a-auditer | |
| global | i | 695 | a-auditer | |
| global | count | 696 | a-auditer | |
| global | small | 697 | a-auditer | |
| global | large | 698 | a-auditer | |
| global | index | 699 | a-auditer | |
| function | Cmd_Wave_f | 736 | a-auditer | |
| global | i | 738 | a-auditer | |
| function | Cmd_Say_f | 787 | a-auditer | |
| global | other | 790 | a-auditer | |
| global | p | 791 | a-auditer | |
| global | text | 792 | a-auditer | |
| function | Com_sprintf | 804 | a-auditer | |
| function | Cmd_PlayerList_f | 872 | a-auditer | |
| global | i | 874 | a-auditer | |
| global | st | 875 | a-auditer | |
| global | text | 876 | a-auditer | |
| global | e2 | 877 | a-auditer | |
| function | ClientCommand | 908 | a-auditer | |
| global | cmd | 910 | a-auditer | |
| function | Cmd_Say_f | 991 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

