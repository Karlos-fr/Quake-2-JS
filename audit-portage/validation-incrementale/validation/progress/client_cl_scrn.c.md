# Progress - Quake-2-master/client/cl_scrn.c

## Statut

Partiel.

## Lot valide

Bloc ecran/HUD/loading/console screen elargi :
`SCR_Init`, cvars/globals ecran, `CL_AddNetgraph`, `SCR_DebugGraph`, `SCR_DrawDebugGraph`, center print, vrect/size/sky, loading plaque, console scroll, dirty rects, HUD strings/fields/layouts, stats/layout, et snapshot `SCR_UpdateScreen`.

## Corrections

- `SCR_BeginLoadingPlaque` respecte maintenant les gardes C `developer`, etat deconnecte et console ouverte.
- `SCR_BeginLoadingPlaque` expose les callbacks host pour stop sons, stop CDAudio et flush screen avant `disable_screen`.
- Tests `verify:cl-scrn` et `verify:screen:header` renforces sur ces branches.

## Integration

- Runtime : branchements confirmes via `SCR_Init` commandes/cvars, `CL_ParseServerMessage -> CL_AddNetgraph`, `CL_Frame`/hooks web et `SCR_UpdateScreen`.
- `apps/web` : HUD/layout/loading consommes via `createFullGameServerRenderSource`, `full-game-render-loop` et `full-game.ts`.
- `renderer-three` : overlays HUD/loading/console passent par `SCR_DrawHudRef`, `createRefGlHost`, `gl_draw` et `three-gl-draw-adapter`; pas de sortie monde/camera nouvelle dans ce lot.

## Reliquats

- `SCR_TimeRefresh_f` : commande et garde actifs, mais sweep renderer 128 frames a couvrir/brancher.
- `SCR_DrawConsole` : orchestration console proprietaire `cl_scrn.c` encore partielle, actuellement portee par les flux web/console.
- `SCR_TileClear` : dirty rects portes, mais clear `backtile` pour viewsize reduit reste a brancher.
- `SCR_UpdateScreen` : snapshot/HUD/loading valide, mais il reste a fermer stereo BeginFrame/EndFrame, guard `scr_initialized`/`con.initialized`, `SCR_TileClear` et `SCR_DrawConsole`.

## Tests

- `npm run verify:cl-scrn`
- `npm run verify:screen:header`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:web-render-order`
- `npm run verify:three-gl-draw-adapter`
- `npm run typecheck`

## Prochain lot recommande

Fermer les reliquats proprietaires `SCR_TileClear`, `SCR_DrawConsole`, `SCR_TimeRefresh_f`, puis completer `SCR_UpdateScreen` avec stereo/BeginFrame/EndFrame et guards d'initialisation.
