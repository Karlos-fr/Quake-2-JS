# Inventaire runtime Phase 03 - Quake-2-master/game/p_client.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/p_client.ts
- Cibles TS declarees : packages/game/src/p_client.ts, packages/game/src/g_items.ts, packages/game/src/g_utils.ts, packages/game/src/g_misc.ts, packages/game/src/p_hud.ts, packages/game/src/g_spawn.ts, packages/game/src/g_combat.ts, packages/game/src/runtime.ts, packages/game/src/g_chase.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | ClientUserinfoChanged | 23 | a-auditer | |
| function | SP_misc_teleporter_dest | 25 | a-auditer | |
| function | SP_FixCoopSpots | 39 | a-auditer | |
| global | spot | 41 | a-auditer | |
| function | SP_CreateCoopSpots | 70 | a-auditer | |
| global | spot | 72 | a-auditer | |
| function | SP_info_player_start | 108 | a-auditer | |
| function | SP_info_player_deathmatch | 123 | a-auditer | |
| function | SP_info_player_coop | 137 | a-auditer | |
| function | SP_info_player_intermission | 171 | a-auditer | |
| function | player_pain | 179 | a-auditer | |
| function | IsFemale | 185 | a-auditer | |
| global | info | 187 | a-auditer | |
| function | IsNeutral | 198 | a-auditer | |
| global | info | 200 | a-auditer | |
| function | ClientObituary | 211 | a-auditer | |
| global | mod | 213 | a-auditer | |
| global | message | 214 | a-auditer | |
| global | message2 | 215 | a-auditer | |
| global | ff | 216 | a-auditer | |
| global | message | 281 | a-auditer | |
| global | message | 289 | a-auditer | |
| global | message | 300 | a-auditer | |
| function | Touch_Item | 408 | a-auditer | |
| function | TossClientWeapon | 410 | a-auditer | |
| global | item | 412 | a-auditer | |
| global | drop | 413 | a-auditer | |
| global | quad | 414 | a-auditer | |
| global | spread | 415 | a-auditer | |
| global | quad | 429 | a-auditer | |
| global | spread | 434 | a-auditer | |
| function | LookAtKiller | 463 | a-auditer | |
| global | dir | 465 | a-auditer | |
| function | player_die | 501 | a-auditer | |
| global | n | 503 | a-auditer | |
| global | i | 563 | a-auditer | |
| function | InitClientPersistant | 607 | a-auditer | |
| global | item | 609 | a-auditer | |
| function | InitClientResp | 633 | a-auditer | |
| function | SaveClientData | 650 | a-auditer | |
| global | i | 652 | a-auditer | |
| global | ent | 653 | a-auditer | |
| function | FetchClientEntData | 668 | a-auditer | |
| function | PlayersRangeFromSpot | 694 | a-auditer | |
| global | player | 696 | a-auditer | |
| global | bestplayerdistance | 697 | a-auditer | |
| global | n | 699 | a-auditer | |
| global | playerdistance | 700 | a-auditer | |
| function | SelectRandomDeathmatchSpawnPoint | 733 | a-auditer | |
| global | count | 736 | a-auditer | |
| global | selection | 737 | a-auditer | |
| function | SelectFarthestDeathmatchSpawnPoint | 789 | a-auditer | |
| global | bestspot | 791 | a-auditer | |
| global | spot | 793 | a-auditer | |
| function | SelectDeathmatchSpawnPoint | 822 | a-auditer | |
| function | SelectFarthestDeathmatchSpawnPoint | 825 | a-auditer | |
| function | SelectRandomDeathmatchSpawnPoint | 827 | a-auditer | |
| function | SelectCoopSpawnPoint | 831 | a-auditer | |
| global | index | 833 | a-auditer | |
| global | spot | 834 | a-auditer | |
| global | target | 835 | a-auditer | |
| function | SelectSpawnPoint | 875 | a-auditer | |
| global | spot | 877 | a-auditer | |
| function | InitBodyQue | 918 | a-auditer | |
| global | i | 920 | a-auditer | |
| global | ent | 921 | a-auditer | |
| function | body_die | 931 | a-auditer | |
| global | n | 933 | a-auditer | |
| function | CopyToBodyQue | 946 | a-auditer | |
| global | body | 948 | a-auditer | |
| function | respawn | 980 | a-auditer | |
| function | spectator_respawn | 1010 | a-auditer | |
| global | value | 1018 | a-auditer | |
| global | value | 1047 | a-auditer | |
| function | PutClientInServer | 1097 | a-auditer | |
| global | index | 1101 | a-auditer | |
| global | i | 1104 | a-auditer | |
| global | userinfo | 1119 | a-auditer | |
| global | userinfo | 1129 | a-auditer | |
| function | ClientBeginDeathmatch | 1266 | a-auditer | |
| function | ClientBegin | 1296 | a-auditer | |
| global | i | 1298 | a-auditer | |
| function | ClientUserinfoChanged | 1362 | a-auditer | |
| global | s | 1364 | a-auditer | |
| global | playernum | 1365 | a-auditer | |
| function | ClientConnect | 1431 | a-auditer | |
| global | value | 1433 | a-auditer | |
| function | ClientDisconnect | 1504 | a-auditer | |
| global | playernum | 1506 | a-auditer | |
| global | pm_passent | 1534 | a-auditer | |
| function | PM_trace | 1537 | a-auditer | |
| function | CheckBlock | 1545 | a-auditer | |
| function | PrintPmove | 1553 | a-auditer | |
| function | ClientThink | 1570 | a-auditer | |
| global | other | 1573 | a-auditer | |
| global | pm | 1575 | a-auditer | |
| function | GetChaseTarget | 1732 | a-auditer | |
| function | ClientBeginServerFrame | 1755 | a-auditer | |
| global | buttonMask | 1758 | a-auditer | |
| global | buttonMask | 1787 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

