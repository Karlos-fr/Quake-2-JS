# Progress - Quake-2-master/client/cl_scrn.c

## Statut

Termine.

## Lot valide

Bloc ecran/HUD/loading/console screen complet :
`SCR_Init`, cvars/globals ecran, `CL_AddNetgraph`, `SCR_DebugGraph`, `SCR_DrawDebugGraph`, center print, vrect/size/sky, loading plaque, console scroll/draw orchestration, dirty rects et `SCR_TileClear`, HUD strings/fields/layouts, stats/layout, `SCR_TimeRefresh_f`, et `SCR_UpdateScreen` avec guards d'initialisation, stereo `BeginFrame`/`RenderFrame`/`EndFrame` et pont `refexport_t`.

## Corrections

- `SCR_BeginLoadingPlaque` respecte maintenant les gardes C `developer`, etat deconnecte et console ouverte.
- `SCR_BeginLoadingPlaque` expose les callbacks host pour stop sons, stop CDAudio et flush screen avant `disable_screen`.
- Tests `verify:cl-scrn` et `verify:screen:header` renforces sur ces branches.
- `SCR_TileClear` porte le clear `backtile` avec union dirty/current/old dirty et chemin `SCR_TileClearRef`.
- `SCR_DrawConsole` porte l'orchestration proprietaire `cl_scrn.c` sous forme de plan console, l'execution `Con_*` restant owned par `console.c`.
- `SCR_TimeRefresh_f` drive maintenant le sweep 128 frames via `BeginFrame`/`RenderFrame`/`EndFrame`.
- `SCR_UpdateScreen` verifie `scr_initialized`/`con.initialized` via options runtime, clamp la separation stereo et drive les frames stereo sur un `refexport_t` fourni.

## Integration

- Runtime : branchements confirmes via `SCR_Init` commandes/cvars, `CL_ParseServerMessage -> CL_AddNetgraph`, `CL_Frame`/hooks web, `SCR_UpdateScreen`, `SCR_TimeRefresh_f` et `refexport_t`.
- `apps/web` : HUD/layout/loading/console consommes via `createFullGameServerRenderSource`, `full-game-render-loop` et `full-game.ts`; le rendu monde full-game reste volontairement split par `CL_BuildRefreshFrame` et adapters Three, verifie par `verify:web-render-order`.
- `renderer-three` : `BeginFrame`/`EndFrame` et `DrawTileClear` consommes par `createRefGlHost`, `gl_rmain`, `gl_draw` et `three-gl-draw-adapter`; pas de nouvelle sortie modele/frame/particule/beam/dlight/temp entity/areabits/camera non branchee dans ce lot.

## Reliquats

Aucun reliquat `A verifier` ou `Partiel` restant dans `client_cl_scrn.c.md`.

## Tests

- `npm run verify:cl-scrn`
- `npm run verify:screen:header`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:web-render-order`
- `npm run verify:three-gl-draw-adapter`
- `npm run typecheck`

Note session 2026-05-08 : `npm run verify:full-game:three-renderer` echoue sur `pointer lock should accept the clicked renderer viewport child`, assertion apps/web non liee aux entites `cl_scrn.c` traitees ici.

## Prochain lot recommande

Aucun pour `client/cl_scrn.c`; reprendre le prochain fichier `En cours` ou `Partiel` dans `AVANCEMENT_GLOBAL.md`.
