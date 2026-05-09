# Progress TS - packages/client/src/cl_scrn.ts

- Dernier lot traite: bloc initial `STAT_MINUS` -> `SCR_DrawHudRef`.
- Verdict lot: Valide / Couvert C/H selon entite; doublons `*Ref` classes comme adapters.
- Tests lances:
  - `npm run verify:cl-scrn`: ok.
  - `npm run typecheck`: ok.
  - `npm run verify:screen:header`: echec existant observe sur `SCR_PlayCinematic missing video should queue nextserver`; hors bloc traite.
- Decisions:
  - `STAT_MINUS`, `CHAR_WIDTH`, `vrect_t` et les fonctions portees proprietaires du bloc sont marquees `Couvert C/H` uniquement quand une matrice C/H valide a ete consultee dans cette session.
  - `sb_nums` est valide directement depuis `client/cl_scrn.c`; aucune ligne C/H generee ne le couvre.
  - Les DTO et helpers `New` du bloc ont maintenant `Original name: N/A` et `Source: N/A (...)` dans l'entete et la matrice.
  - Les variantes `DrawHUDStringRef`, `SCR_DrawFieldRef`, `SCR_ExecuteLayoutStringRef`, `SCR_DrawStatsRef`, `SCR_DrawLayoutRef` sont des adapters `refexport_t`; le proprietaire portage reste le symbole non-`Ref`.
- Prochain lot recommande: continuer avec `SCR_DrawCrosshairRef`, `CL_AddNetgraph`, `SCR_DebugGraph`, `SCR_DrawDebugGraph`, `SCR_CenterPrint`, `SCR_CheckDrawCenterString`, `SCR_BeginLoadingPlaque`, `SCR_EndLoadingPlaque`, `SCR_Loading_f`.
