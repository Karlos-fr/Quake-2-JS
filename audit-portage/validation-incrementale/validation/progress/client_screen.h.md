# Progress - Quake-2-master/client/screen.h

## Etat courant

- Statut: Termine
- Dernier lot valide: dirty rect et cinematic header: `SCR_AddDirtyPoint`, `SCR_DirtyScreen`, `SCR_PlayCinematic`, `SCR_DrawCinematic`, `SCR_RunCinematic`, `SCR_StopCinematic`, `SCR_FinishCinematic`.
- Prochain lot recommande: aucun pour `client/screen.h`; toutes les lignes sont `Valide`.

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

## Session 2026-05-08 - cloture header

Checklist appliquee sur le lot valide:

- Source C/H comparee: declarations `Quake-2-master/client/screen.h`, dirty rect dans `Quake-2-master/client/cl_scrn.c`, cinematics dans `Quake-2-master/client/cl_cin.c`.
- Cible TS comparee: facade `packages/client/src/cl_scrn.ts`, logique cinematic proprietaire `packages/client/src/cl_cin.ts`, etat runtime dans `packages/client/src/client.ts`.
- Commentaires d'en-tete verifies pour `SCR_AddDirtyPoint`, `SCR_DirtyScreen`, `SCR_PlayCinematic`, `SCR_DrawCinematic`, `SCR_DrawCinematicRef`, `SCR_RunCinematic`, `SCR_StopCinematic`, `SCR_FinishCinematic`; la separation facade `screen.h` / port `cl_cin.c` est documentee dans les commentaires et la matrice.
- Ownership verifie: dirty rect dans `cl_scrn.ts`; cinematic dans `cl_cin.ts` avec exports facade `cl_scrn.ts`; pas de doublon proprietaire concurrent detecte.
- Runtime verifie: dirty rect appele par HUD/view/menu/console; cinematics atteignables depuis `CL_ParseServerData`, `CL_Frame` via `onRunCinematic`, skip input via `CL_SendCmd`, et commandes `nextserver`.
- `apps/web` verifie: le flux full-game charge PCX/CIN depuis le filesystem monte, transmet audio brut, stoppe CD audio, execute `SCR_RunCinematic`, puis dessine via `SCR_DrawCinematicRef` et l'adapter ref/canvas.
- `packages/renderer-three` verifie: les sorties visibles attendues sont images cinematic, palette et raw upload; elles sont consommees via `ref_gl` (`CinematicSetPalette`, `DrawStretchRaw`), `ref-gl-host`, `gl_draw` et `three-gl-draw-adapter`. Pas de sortie modele/frame/particule/beam/dlight/temp entity/areabits/camera/scene propre a ce lot.
- Correction appliquee: aucune correction de code necessaire pendant cette session.

Tests lances:

- `npm run verify:screen:header`
- `npm run verify:cinematic:audio-sync`
- `npm run verify:cl-scrn`
- `npm run verify:ref-gl-host`
- `npm run verify:gl-draw`
- `npm run verify:three-gl-draw-adapter`
- `npm run verify:full-game:three-renderer`
- `npm run verify:web-render-order`
- `npm run typecheck`
