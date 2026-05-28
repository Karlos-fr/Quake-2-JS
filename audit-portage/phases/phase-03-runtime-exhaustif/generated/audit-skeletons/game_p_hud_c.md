# Inventaire runtime Phase 03 - Quake-2-master/game/p_hud.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/p_hud.ts
- Cibles TS declarees : packages/game/src/p_hud.ts, packages/game/src/g_main.ts, packages/game/src/index.ts, packages/game/src/p_client.ts, packages/game/src/p_view.ts, packages/game/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | MoveClientToIntermission | 32 | a-auditer | |
| function | BeginIntermission | 73 | a-auditer | |
| function | DeathmatchScoreboardMessage | 164 | a-auditer | |
| global | entry | 166 | a-auditer | |
| global | string | 167 | a-auditer | |
| global | stringlength | 168 | a-auditer | |
| global | sorted | 170 | a-auditer | |
| global | sortedscores | 171 | a-auditer | |
| global | picnum | 173 | a-auditer | |
| global | cl_ent | 176 | a-auditer | |
| global | tag | 177 | a-auditer | |
| global | tag | 226 | a-auditer | |
| function | DeathmatchScoreboard | 262 | a-auditer | |
| function | Cmd_Score_f | 276 | a-auditer | |
| function | HelpComputer | 302 | a-auditer | |
| global | string | 304 | a-auditer | |
| global | sk | 305 | a-auditer | |
| global | sk | 314 | a-auditer | |
| function | Cmd_Help_f | 346 | a-auditer | |
| function | G_SetStats | 377 | a-auditer | |
| global | item | 379 | a-auditer | |
| global | power_armor_type | 381 | a-auditer | |
| function | G_CheckChaseStats | 530 | a-auditer | |
| global | i | 532 | a-auditer | |
| function | G_SetSpectatorStats | 549 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

