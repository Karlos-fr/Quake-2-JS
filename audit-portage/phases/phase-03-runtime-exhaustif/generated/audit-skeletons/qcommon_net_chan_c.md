# Inventaire runtime Phase 03 - Quake-2-master/qcommon/net_chan.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/qcommon/src/net_chan.ts
- Cibles TS declarees : packages/qcommon/src/net_chan.ts, packages/qcommon/src/qcommon.ts, packages/qcommon/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | showpackets | 77 | a-auditer | |
| global | showdrop | 78 | a-auditer | |
| global | qport | 79 | a-auditer | |
| global | net_message | 82 | a-auditer | |
| global | net_message_buffer | 83 | a-auditer | |
| function | Netchan_Init | 91 | a-auditer | |
| global | port | 93 | a-auditer | |
| function | Netchan_OutOfBand | 110 | a-auditer | |
| global | send | 112 | a-auditer | |
| global | send_buf | 113 | a-auditer | |
| function | Netchan_OutOfBandPrint | 132 | a-auditer | |
| global | argptr | 134 | a-auditer | |
| global | string | 135 | a-auditer | |
| function | Netchan_Setup | 152 | a-auditer | |
| function | Netchan_CanReliable | 175 | a-auditer | |
| function | Netchan_NeedReliable | 183 | a-auditer | |
| global | send_reliable | 185 | a-auditer | |
| function | Netchan_Transmit | 213 | a-auditer | |
| global | send | 215 | a-auditer | |
| global | send_buf | 216 | a-auditer | |
| global | send_reliable | 217 | a-auditer | |
| function | Com_Printf | 267 | a-auditer | |
| function | Com_Printf | 282 | a-auditer | |
| function | Netchan_Process | 298 | a-auditer | |
| global | qport | 302 | a-auditer | |
| function | Com_Printf | 329 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

