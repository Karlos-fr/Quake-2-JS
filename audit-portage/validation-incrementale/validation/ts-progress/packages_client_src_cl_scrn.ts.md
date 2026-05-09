# Progress TS - packages/client/src/cl_scrn.ts

- Dernier lot traite: `SCR_RunConsole`, `SCR_DrawNet`, `SCR_DrawPause`, `SCR_DrawLoading`, `SCR_AddDirtyPoint`, `SCR_DirtyScreen`, `SCR_BuildScreenState`, `SCR_UpdateScreen`, plus le bloc coherent `buildActiveCinematicScreenFrame`, `buildCenterPrintSnapshot`, `buildLoadingSnapshot`, `buildPauseSnapshot`, `SCR_CalcVrect`, `buildNetSnapshot`.
- Verdict lot: les symboles portes proprietaires `cl_scrn.c` du lot sont `Couvert C/H`; `SCR_BuildScreenState` et les helpers snapshot prives sont `Valide` comme `New`; `SCR_CalcVrect` est rattache a son original static `cl_scrn.c`.
- Tests lances dans cette session:
  - `npm run verify:cl-scrn`: ok.
  - `npm run typecheck`: ok.
- Reference historique:
  - `npm run verify:screen:header`: echec existant observe sur `SCR_PlayCinematic missing video should queue nextserver`; hors bloc traite.
- Decisions:
  - `STAT_MINUS`, `CHAR_WIDTH`, `vrect_t` et les fonctions portees proprietaires du bloc sont marquees `Couvert C/H` uniquement quand une matrice C/H valide a ete consultee dans cette session.
  - `sb_nums` est valide directement depuis `client/cl_scrn.c`; aucune ligne C/H generee ne le couvre.
  - Les DTO et helpers `New` du bloc ont maintenant `Original name: N/A` et `Source: N/A (...)` dans l'entete et la matrice.
  - Les variantes `DrawHUDStringRef`, `SCR_DrawFieldRef`, `SCR_ExecuteLayoutStringRef`, `SCR_DrawStatsRef`, `SCR_DrawLayoutRef` sont des adapters `refexport_t`; le proprietaire portage reste le symbole non-`Ref`.
  - `SCR_DrawCrosshairRef` est un adapter `refexport_t` du portage proprietaire `packages/client/src/view.ts` `SCR_DrawCrosshair`.
  - `CL_AddNetgraph`, `SCR_DebugGraph`, `SCR_DrawDebugGraph`, `SCR_CenterPrint`, `SCR_CheckDrawCenterString`, `SCR_BeginLoadingPlaque`, `SCR_EndLoadingPlaque`, `SCR_Loading_f` ont une matrice C/H `client_cl_scrn.c.md` valide et restent proprietaires dans `packages/client/src/cl_scrn.ts`.
  - `SCR_RunConsole`, `SCR_DrawNet`, `SCR_DrawPause`, `SCR_DrawLoading`, `SCR_AddDirtyPoint`, `SCR_DirtyScreen`, `SCR_UpdateScreen` et `SCR_CalcVrect` ont une matrice C/H `client_cl_scrn.c.md` valide et restent proprietaires dans `packages/client/src/cl_scrn.ts`; `SCR_RunConsole`, `SCR_AddDirtyPoint`, `SCR_DirtyScreen` et `SCR_UpdateScreen` ont aussi des declarations validees dans `client_screen.h.md`.
  - `SCR_BuildScreenState`, `buildActiveCinematicScreenFrame`, `buildCenterPrintSnapshot`, `buildLoadingSnapshot`, `buildPauseSnapshot` et `buildNetSnapshot` sont des helpers/snapshots renderer-neutral sans source C/H directe; leurs entetes et lignes de matrice indiquent `Original name: N/A` et `Source: N/A (...)`.
- Prochain lot recommande: continuer avec `SCR_TileClear`, `SCR_TileClearRef`, `SCR_DrawConsole`, puis `SCR_TimeRefresh_f` et `SCR_Sky_f` si le lot reste stable.
