# Inventaire runtime Phase 03 - Quake-2-master/client/screen.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cl_scrn.ts
- Cibles TS declarees : packages/client/src/cl_scrn.ts, packages/client/src/screen.ts, packages/client/src/cl_cin.ts, packages/client/src/client.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | SCR_Init | 22 | a-auditer | |
| function | SCR_UpdateScreen | 24 | a-auditer | |
| function | SCR_SizeUp | 26 | a-auditer | |
| function | SCR_SizeDown | 27 | a-auditer | |
| function | SCR_CenterPrint | 28 | a-auditer | |
| function | SCR_BeginLoadingPlaque | 29 | a-auditer | |
| function | SCR_EndLoadingPlaque | 30 | a-auditer | |
| function | SCR_DebugGraph | 32 | a-auditer | |
| function | SCR_TouchPics | 34 | a-auditer | |
| function | SCR_RunConsole | 36 | a-auditer | |
| global | scr_con_current | 38 | a-auditer | |
| global | scr_conlines | 39 | a-auditer | |
| global | sb_lines | 41 | a-auditer | |
| global | scr_viewsize | 43 | a-auditer | |
| global | crosshair | 44 | a-auditer | |
| global | scr_vrect | 46 | a-auditer | |
| global | crosshair_pic | 48 | a-auditer | |
| function | SCR_AddDirtyPoint | 51 | a-auditer | |
| function | SCR_DirtyScreen | 52 | a-auditer | |
| function | SCR_PlayCinematic | 57 | a-auditer | |
| function | SCR_DrawCinematic | 58 | a-auditer | |
| function | SCR_RunCinematic | 59 | a-auditer | |
| function | SCR_StopCinematic | 60 | a-auditer | |
| function | SCR_FinishCinematic | 61 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

