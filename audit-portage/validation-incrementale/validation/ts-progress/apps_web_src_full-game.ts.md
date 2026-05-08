# Progress TS - apps/web/src/full-game.ts

## Etat

- Statut: En cours
- Dernier lot traite: `DrawCommand`, `FullGamePage`, `CanvasAssetCache`, `FullGameRuntime`, `FullGameAudioDebugState`, `FullGameRendererState`, `FullGameMouseState`, `bootstrap`, `requireApp`, `createPage`, `createMountedFilesystem`, `fetchFirstBytes`, `createFullGameRuntime`, `shouldSuppressFullGameConsoleLine`, `initializeWebSoundDma`, `getWebSoundDmaPosition`, `playIssuedWebSound`, `formatWebAudioInfo`, `buildFullGameAudioListener`, `isSfx`, `describeAuthoritativeSound`, `getRequestedSoundRate`, `queueFullGameConfigBootstrap`, `registerFullGameToggleConsoleCommand`, `seedMenuCvars`
- Verdict: 25 symboles `Valide`; declarations et helpers d'assemblage apps/web `Category: New`, sans proprietaire C/H attendu.

## Preuves de la session

- Checklist TS appliquee: identification TS, export non, `Original name: N/A`, `Source: N/A (web adapter)`, `Category: New`, absence de matrice C/H liee, ownership `apps/web`.
- Recherche de doublons: `BASEQ2_PAK_CANDIDATES` existe aussi dans `apps/web/src/main.ts`, comme constante locale de page demo; pas un doublon de portage C/H proprietaire.
- En-tete ajoute dans `apps/web/src/full-game.ts` pour expliciter le lot de constantes `New`.
- Checklist TS appliquee au lot large: identification TS, export non, `Original name: N/A`, sources declarees `N/A (web adapter types)`, `N/A (web app bootstrap)`, `N/A (web page adapter)`, `N/A (web filesystem bootstrap)`, `N/A (web runtime assembly)`, `N/A (web console filter)`, `N/A (web audio adapter)` et `N/A (web config bootstrap)`, `Category: New`, absence de matrice C/H liee.
- Les symboles audites assemblent ou adaptent les ports `packages/client`, `packages/qcommon`, `packages/server`, `packages/filesystem`, `packages/platform` et `packages/renderer-three`; aucun n'est proprietaire d'une entite C/H.
- Recherche de doublons/ownership: les noms du lot sont locaux a `apps/web/src/full-game.ts` ou consommes par ce fichier; pas de doublon de portage proprietaire masque ni de mauvais package detecte dans le lot.

## Jugement integration

- Runtime: non applicable justifie; ces constantes parametrent le chargement navigateur et la taille logique, sans remplacer une entite C/H proprietaire.
- apps/web: integre dans `createMountedFilesystem`, `createPage`, les refs de dessin et les renderers frontend/game du meme fichier.
- renderer-three: integre indirectement via les dimensions logiques transmises aux adapters Three.js; aucune logique renderer proprietaire remplacee.
- Runtime: lot large integre comme assemblage host; il appelle les ports runtime au lieu de les dupliquer (`Qcommon_Init`, `Qcommon_Frame`, contexts client/menu/console/sound).
- apps/web: applicable et integre; DOM, assets navigateur, stockage config/save, commandes de bootstrap et WebAudio sont branches depuis `bootstrap`/`createFullGameRuntime`.
- renderer-three: applicable seulement comme adapter consomme par `FullGameRendererState`; aucune validation comportementale ref_gl proprietaire n'a ete revendiquee pour ce lot.

## Tests lances

- `npm run typecheck` passe.
- `npm run verify:full-game:audio-routing` passe.
- `npm run verify:full-game:commands` passe.
- `npm run verify:full-game:three-renderer` echoue hors lot sur l'assertion `full-game should draw the original loading picture centered`; a reprendre avec le prochain lot rendu/loading.

## Prochain lot recommande

Traiter `createCanvasRef`, `startNextCinematic`, `enterMainMenu`, `frame`, `executeRuntimeCommandBuffer`, `syncFullGameActiveView`, `drawCinematicFrame`, `drawMenuFrame`, `drawLoadingFrame`, `drawGameFrame`, puis les helpers renderer contigus si le lot reste coherent.
