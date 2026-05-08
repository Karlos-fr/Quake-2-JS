# Progress - Quake-2-master/client/screen.h

## Etat courant

- Statut: En cours
- Dernier lot valide: screen header runtime/HUD principal hors cinematic: `SCR_Init`, `SCR_UpdateScreen`, `SCR_SizeUp`, `SCR_SizeDown`, `SCR_CenterPrint`, `SCR_BeginLoadingPlaque`, `SCR_EndLoadingPlaque`, `SCR_DebugGraph`, `SCR_TouchPics`, `SCR_RunConsole`, `scr_con_current`, `scr_conlines`, `sb_lines`, `scr_viewsize`, `crosshair`, `scr_vrect`, `crosshair_pic`.
- Prochain lot recommande: `SCR_AddDirtyPoint` et `SCR_DirtyScreen`, puis traiter les fonctions cinematic dans un lot separe.

## Session 2026-05-08

Checklist appliquee sur le lot valide:

- Source C/H comparee: declarations `Quake-2-master/client/screen.h`, definitions et globals proches dans `Quake-2-master/client/cl_scrn.c`.
- Cible TS comparee: `packages/client/src/cl_scrn.ts` et etat runtime centralise dans `packages/client/src/client.ts`.
- Commentaires d'en-tete verifies pour les fonctions portees du lot. `SCR_SizeUp`/`SCR_SizeDown` gardent les noms exportes du header TS, avec commentaires pointant vers les fonctions C proprietaires `SCR_SizeUp_f`/`SCR_SizeDown_f`.
- Ownership verifie: fonctions screen dans `packages/client/src/cl_scrn.ts`; globals d'etat client dans `packages/client/src/client.ts`; cvars `scr_viewsize` et `crosshair` dans `ClientScreenContext`.
- Doublons verifies via recherche repo: pas de port proprietaire concurrent pour ce lot dans `packages/client`.
- Runtime verifie: `SCR_Init` est appele par `apps/web/src/full-game.ts`; `SCR_RunConsole` est appele dans les flux console web; `SCR_UpdateScreen` et les helpers alimentent le snapshot HUD/ref; `SCR_CenterPrint` est atteint depuis `CL_ParseServerMessage`; loading plaque est branche via client cinematic et host serveur.
- `apps/web` verifie: le flux full-game initialise le screen context, consomme `crosshair`, `screenState`, loading plaque et console overlay. Pas de compensation web masquant un manque runtime pour ce lot.
- `packages/renderer-three` verifie: les sorties visibles du lot sont HUD/overlay 2D (`DrawPic`, `DrawChar`, `DrawFill`, crosshair, loading, console canvas) consommees via `apps/web/src/full-game-render-loop.ts` et `three-gl-draw-adapter`; pas de sortie modele/frame/particle/beam/dlight/areabits/camera propre a brancher directement dans renderer-three.
- Correction appliquee: `packages/client/src/cl_scrn.ts` force maintenant une valeur de crosshair hors plage vers `ch3`, comme `SCR_TouchPics` en C.
- Test ajoute: `scripts/verify/quake2-screen-header.ts` couvre le crosshair invalide.

Tests lances:

- `npm run verify:screen:header`
- `npm run verify:client:header`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Blocages

- Aucun blocage pour le lot courant.
