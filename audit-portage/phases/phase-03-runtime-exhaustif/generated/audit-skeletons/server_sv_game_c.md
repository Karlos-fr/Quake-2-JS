# Inventaire runtime Phase 03 - Quake-2-master/server/sv_game.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/server/src/sv_game.ts
- Cibles TS declarees : packages/server/src/sv_game.ts, packages/server/src/runtime.ts, packages/server/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | PF_Unicast | 34 | a-auditer | |
| global | p | 36 | a-auditer | |
| function | SZ_Write | 51 | a-auditer | |
| function | PF_dprintf | 64 | a-auditer | |
| global | msg | 66 | a-auditer | |
| global | argptr | 67 | a-auditer | |
| function | PF_cprintf | 84 | a-auditer | |
| global | msg | 86 | a-auditer | |
| global | argptr | 87 | a-auditer | |
| global | n | 88 | a-auditer | |
| function | Com_Printf | 104 | a-auditer | |
| function | PF_centerprintf | 115 | a-auditer | |
| global | msg | 117 | a-auditer | |
| global | argptr | 118 | a-auditer | |
| global | n | 119 | a-auditer | |
| function | PF_error | 142 | a-auditer | |
| global | msg | 144 | a-auditer | |
| global | argptr | 145 | a-auditer | |
| function | PF_setmodel | 162 | a-auditer | |
| global | i | 164 | a-auditer | |
| function | PF_Configstring | 192 | a-auditer | |
| function | PF_WriteChar | 216 | a-auditer | |
| function | PF_WriteByte | 217 | a-auditer | |
| function | PF_WriteShort | 218 | a-auditer | |
| function | PF_WriteLong | 219 | a-auditer | |
| function | PF_WriteFloat | 220 | a-auditer | |
| function | PF_WriteString | 221 | a-auditer | |
| function | PF_WritePos | 222 | a-auditer | |
| function | PF_WriteDir | 223 | a-auditer | |
| function | PF_WriteAngle | 224 | a-auditer | |
| function | PF_inPVS | 234 | a-auditer | |
| global | leafnum | 236 | a-auditer | |
| global | cluster | 237 | a-auditer | |
| global | mask | 239 | a-auditer | |
| function | PF_inPHS | 264 | a-auditer | |
| global | leafnum | 266 | a-auditer | |
| global | cluster | 267 | a-auditer | |
| global | mask | 269 | a-auditer | |
| function | PF_StartSound | 287 | a-auditer | |
| function | SV_ShutdownGameProgs | 305 | a-auditer | |
| function | SCR_DebugGraph | 321 | a-auditer | |
| function | SV_InitGameProgs | 323 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

