# Inventaire runtime Phase 03 - Quake-2-master/server/sv_send.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/server/src/sv_send.ts
- Cibles TS declarees : packages/server/src/sv_send.ts, packages/server/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sv_outputbuf | 32 | a-auditer | |
| function | SV_FlushRedirect | 34 | a-auditer | |
| function | SV_ClientPrintf | 65 | a-auditer | |
| global | argptr | 67 | a-auditer | |
| global | string | 68 | a-auditer | |
| function | SV_BroadcastPrintf | 89 | a-auditer | |
| global | argptr | 91 | a-auditer | |
| global | string | 92 | a-auditer | |
| global | i | 94 | a-auditer | |
| global | copy | 103 | a-auditer | |
| global | i | 104 | a-auditer | |
| function | SV_BroadcastCommand | 132 | a-auditer | |
| global | argptr | 134 | a-auditer | |
| global | string | 135 | a-auditer | |
| function | SV_Multicast | 161 | a-auditer | |
| global | mask | 164 | a-auditer | |
| global | j | 166 | a-auditer | |
| global | reliable | 167 | a-auditer | |
| function | SZ_Write | 239 | a-auditer | |
| function | SV_StartSound | 272 | a-auditer | |
| global | sendchan | 276 | a-auditer | |
| global | flags | 277 | a-auditer | |
| global | i | 278 | a-auditer | |
| global | ent | 279 | a-auditer | |
| global | origin_v | 280 | a-auditer | |
| global | use_phs | 281 | a-auditer | |
| global | use_phs | 303 | a-auditer | |
| function | SV_Multicast | 368 | a-auditer | |
| function | SV_Multicast | 375 | a-auditer | |
| function | SV_SendClientDatagram | 395 | a-auditer | |
| global | msg_buf | 397 | a-auditer | |
| global | msg | 398 | a-auditer | |
| function | SZ_Write | 416 | a-auditer | |
| function | SV_DemoCompleted | 440 | a-auditer | |
| function | SV_RateDrop | 459 | a-auditer | |
| global | total | 461 | a-auditer | |
| global | i | 462 | a-auditer | |
| function | SV_SendClientMessages | 490 | a-auditer | |
| global | i | 492 | a-auditer | |
| global | msglen | 494 | a-auditer | |
| global | msgbuf | 495 | a-auditer | |
| global | r | 496 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

