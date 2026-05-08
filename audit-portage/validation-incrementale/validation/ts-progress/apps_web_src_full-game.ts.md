# Progress TS - apps/web/src/full-game.ts

## Etat

- Statut: En cours
- Dernier lot traite: `createCanvasRef`, `startNextCinematic`, `enterMainMenu`, `frame`, `executeRuntimeCommandBuffer`, `syncFullGameActiveView`, `drawCinematicFrame`, `drawMenuFrame`, `drawLoadingFrame`, `drawGameFrame`, `ensureFullGameRenderer`, `disposeFullGameRenderer`, `createFullGameThreeRenderer`, `syncThreeCameraToRefresh`, `getAuthoritativeMapPath`
- Verdict: 15 symboles `Valide`; boucle full-game, orchestration loading/menu/game et adapters renderer `Category: New`, sans proprietaire C/H attendu.

## Preuves de la session

- Checklist TS appliquee: identification TS, export non, `Original name: N/A`, `Source: N/A (web adapter)`, `Category: New`, absence de matrice C/H liee, ownership `apps/web`.
- Recherche de doublons: `BASEQ2_PAK_CANDIDATES` existe aussi dans `apps/web/src/main.ts`, comme constante locale de page demo; pas un doublon de portage C/H proprietaire.
- En-tete ajoute dans `apps/web/src/full-game.ts` pour expliciter le lot de constantes `New`.
- Checklist TS appliquee au lot large: identification TS, export non, `Original name: N/A`, sources declarees `N/A (web adapter types)`, `N/A (web app bootstrap)`, `N/A (web page adapter)`, `N/A (web filesystem bootstrap)`, `N/A (web runtime assembly)`, `N/A (web console filter)`, `N/A (web audio adapter)` et `N/A (web config bootstrap)`, `Category: New`, absence de matrice C/H liee.
- Les symboles audites assemblent ou adaptent les ports `packages/client`, `packages/qcommon`, `packages/server`, `packages/filesystem`, `packages/platform` et `packages/renderer-three`; aucun n'est proprietaire d'une entite C/H.
- Recherche de doublons/ownership: les noms du lot sont locaux a `apps/web/src/full-game.ts` ou consommes par ce fichier; pas de doublon de portage proprietaire masque ni de mauvais package detecte dans le lot.
- Checklist TS appliquee au lot rendu/loading: identification TS, export non, `Original name: N/A`, sources declarees `N/A (web canvas ref adapter)`, `N/A (web full-game loop)`, `N/A (web render orchestration)`, `N/A (web renderer adapter)`, `Category: New`, absence de matrice C/H liee.
- Helpers contigus examines: `startFullGameAttractLoop`, `shouldDrawFullGameLoadingFrame`, `shouldDrawAttractLoopMenuOverlay`, `shouldHideAttractLoopLoading`, `drawFullGamePictureRef`, `createFullGameAutosizedPictureCommand`, `drawMenuOverlayRef`, `ensureFullGameFrontendRenderer`, `warmFullGameFrontendPics`, `warmFullGameMenuPics`, `createFullGameFrontendRenderer`, `resizeFullGameFrontendRenderer`, `getContainedLogicalViewportSize`, `disposeFullGameFrontendRenderer`. Ils restent hors matrice TS courante sauf en-tetes ajoutes pour les helpers de loading inclus dans le flux.
- Correction du verify renderer: l'ancienne preuve cherchait `drawCenteredPicture(page, runtime, "loading")`; le code valide maintenant la plaque issue de `SCR_DrawLoading` via `loadingCommand.pic` sur le fallback canvas et via `drawFullGamePictureRef` sur le frontend ref_gl.

## Jugement integration

- Runtime: non applicable justifie; ces constantes parametrent le chargement navigateur et la taille logique, sans remplacer une entite C/H proprietaire.
- apps/web: integre dans `createMountedFilesystem`, `createPage`, les refs de dessin et les renderers frontend/game du meme fichier.
- renderer-three: integre indirectement via les dimensions logiques transmises aux adapters Three.js; aucune logique renderer proprietaire remplacee.
- Runtime: lot large integre comme assemblage host; il appelle les ports runtime au lieu de les dupliquer (`Qcommon_Init`, `Qcommon_Frame`, contexts client/menu/console/sound).
- apps/web: applicable et integre; DOM, assets navigateur, stockage config/save, commandes de bootstrap et WebAudio sont branches depuis `bootstrap`/`createFullGameRuntime`.
- renderer-three: applicable seulement comme adapter consomme par `FullGameRendererState`; aucune validation comportementale ref_gl proprietaire n'a ete revendiquee pour ce lot.
- Runtime: lot rendu/loading integre via `Cbuf_Execute`, `SCR_PlayCinematic`, `SCR_RunCinematic`, `SCR_DrawLoading`, `M_Draw`, `Qcommon_Frame` et la source de rendu client; le comportement porteur reste dans les packages client/qcommon/server.
- apps/web: integre dans la boucle `requestAnimationFrame`, les viewports DOM, le status browser, les commandes loading/menu et les fallbacks canvas.
- renderer-three: integre via `createRefGlHost`, `createFullGameRenderLoop`, les adapters Three (`world`, `sky`, entites, particules, beams, dlights, polyblend) et `syncThreeCameraToRefresh`; ce lot ne revendique pas d'ownership `ref_gl`, seulement l'assemblage web.

## Tests lances

- `npm run typecheck` passe.
- `npm run verify:full-game:audio-routing` passe.
- `npm run verify:full-game:commands` passe.
- `npm run verify:full-game:three-renderer` passe; l'assertion obsolete sur `drawCenteredPicture(page, runtime, "loading")` a ete corrigee pour le flux loading actuel.
- `npm run verify:full-game:demo-cleanup` passe.

## Prochain lot recommande

Traiter le bloc console/canvas suivant: `drawConsoleFrame`, `prepareConsoleCanvasOverlay`, `drawConsoleSnapshotToCanvas`, `drawConsoleSnapshotCanvas`, `drawOpaqueConsoleBackground`, `drawConsoleFrameRef`, `drawConsoleTextRef`, `drawConsoleText`, `drawConsoleTextFallback`, `drawCapturedCommands`, `drawCenteredPicture`, `drawRawIndexedImage`, `drawGlyph`, `drawPaletteFill`.
