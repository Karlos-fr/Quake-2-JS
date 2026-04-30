# Inventaire runtime Phase 03 - Quake-2-master/client/cl_scrn.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cl_scrn.ts
- Cibles TS declarees : packages/client/src/cl_scrn.ts, packages/client/src/cl_main.ts, packages/client/src/client.ts, packages/renderer-three/src/gl_draw.ts, packages/renderer-three/src/three-gl-draw-adapter.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | scr_con_current | 37 | a-auditer | |
| global | scr_conlines | 38 | a-auditer | |
| global | scr_initialized | 40 | a-auditer | |
| global | scr_draw_loading | 42 | a-auditer | |
| global | scr_vrect | 44 | a-auditer | |
| global | scr_viewsize | 47 | a-auditer | |
| global | scr_conspeed | 48 | a-auditer | |
| global | scr_centertime | 49 | a-auditer | |
| global | scr_showturtle | 50 | a-auditer | |
| global | scr_showpause | 51 | a-auditer | |
| global | scr_printspeed | 52 | a-auditer | |
| global | scr_netgraph | 54 | a-auditer | |
| global | scr_timegraph | 55 | a-auditer | |
| global | scr_debuggraph | 56 | a-auditer | |
| global | scr_graphheight | 57 | a-auditer | |
| global | scr_graphscale | 58 | a-auditer | |
| global | scr_graphshift | 59 | a-auditer | |
| global | scr_drawall | 60 | a-auditer | |
| struct | dirty_t | 62 | a-auditer | |
| global | crosshair_pic | 69 | a-auditer | |
| function | SCR_TimeRefresh_f | 72 | a-auditer | |
| function | SCR_Loading_f | 73 | a-auditer | |
| function | CL_AddNetgraph | 91 | a-auditer | |
| global | i | 93 | a-auditer | |
| global | in | 94 | a-auditer | |
| global | ping | 95 | a-auditer | |
| struct | graphsamp_t | 118 | a-auditer | |
| global | value | 120 | a-auditer | |
| global | color | 121 | a-auditer | |
| global | current | 124 | a-auditer | |
| function | SCR_DebugGraph | 132 | a-auditer | |
| function | SCR_DrawDebugGraph | 144 | a-auditer | |
| global | v | 147 | a-auditer | |
| global | color | 148 | a-auditer | |
| global | scr_centerstring | 182 | a-auditer | |
| global | scr_centertime_start | 183 | a-auditer | |
| global | scr_centertime_off | 184 | a-auditer | |
| global | scr_center_lines | 185 | a-auditer | |
| global | scr_erase_center | 186 | a-auditer | |
| function | SCR_CenterPrint | 196 | a-auditer | |
| global | s | 198 | a-auditer | |
| global | line | 199 | a-auditer | |
| function | SCR_DrawCenterString | 251 | a-auditer | |
| global | start | 253 | a-auditer | |
| global | l | 254 | a-auditer | |
| global | j | 255 | a-auditer | |
| global | remaining | 257 | a-auditer | |
| global | y | 268 | a-auditer | |
| function | SCR_CheckDrawCenterString | 297 | a-auditer | |
| function | SCR_CalcVrect | 316 | a-auditer | |
| global | size | 318 | a-auditer | |
| function | SCR_SizeUp_f | 346 | a-auditer | |
| function | SCR_SizeDown_f | 359 | a-auditer | |
| function | SCR_Sky_f | 371 | a-auditer | |
| global | rotate | 373 | a-auditer | |
| global | rotate | 384 | a-auditer | |
| function | SCR_Init | 408 | a-auditer | |
| function | SCR_DrawNet | 442 | a-auditer | |
| function | SCR_DrawPause | 456 | a-auditer | |
| function | SCR_DrawLoading | 475 | a-auditer | |
| function | SCR_RunConsole | 496 | a-auditer | |
| global | scr_conlines | 502 | a-auditer | |
| function | SCR_DrawConsole | 525 | a-auditer | |
| function | SCR_BeginLoadingPlaque | 560 | a-auditer | |
| global | scr_draw_loading | 576 | a-auditer | |
| function | SCR_EndLoadingPlaque | 587 | a-auditer | |
| function | SCR_Loading_f | 598 | a-auditer | |
| function | entitycmpfnc | 608 | a-auditer | |
| function | SCR_TimeRefresh_f | 623 | a-auditer | |
| global | i | 625 | a-auditer | |
| global | time | 627 | a-auditer | |
| function | SCR_AddDirtyPoint | 666 | a-auditer | |
| function | SCR_DirtyScreen | 678 | a-auditer | |
| function | SCR_TileClear | 691 | a-auditer | |
| global | i | 693 | a-auditer | |
| macro | STAT_MINUS | 778 | a-auditer | |
| macro | ICON_WIDTH | 787 | a-auditer | |
| macro | ICON_HEIGHT | 788 | a-auditer | |
| macro | CHAR_WIDTH | 789 | a-auditer | |
| macro | ICON_SPACE | 790 | a-auditer | |
| function | SizeHUDString | 801 | a-auditer | |
| function | DrawHUDString | 829 | a-auditer | |
| global | margin | 831 | a-auditer | |
| global | line | 832 | a-auditer | |
| global | width | 833 | a-auditer | |
| global | i | 834 | a-auditer | |
| global | x | 849 | a-auditer | |
| function | SCR_DrawField | 870 | a-auditer | |
| global | l | 873 | a-auditer | |
| global | frame | 874 | a-auditer | |
| global | frame | 898 | a-auditer | |
| function | SCR_TouchPics | 915 | a-auditer | |
| function | SCR_ExecuteLayoutString | 941 | a-auditer | |
| global | value | 944 | a-auditer | |
| global | token | 945 | a-auditer | |
| global | width | 946 | a-auditer | |
| global | index | 947 | a-auditer | |
| global | block | 1057 | a-auditer | |
| function | DrawString | 1085 | a-auditer | |
| global | color | 1110 | a-auditer | |
| global | color | 1119 | a-auditer | |
| global | color | 1130 | a-auditer | |
| global | continue | 1139 | a-auditer | |
| global | color | 1150 | a-auditer | |
| function | SCR_DrawStats | 1236 | a-auditer | |
| macro | STAT_LAYOUTS | 1248 | a-auditer | |
| function | SCR_DrawLayout | 1250 | a-auditer | |
| function | SCR_UpdateScreen | 1267 | a-auditer | |
| global | numframes | 1269 | a-auditer | |
| global | i | 1270 | a-auditer | |
| global | separation | 1271 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

