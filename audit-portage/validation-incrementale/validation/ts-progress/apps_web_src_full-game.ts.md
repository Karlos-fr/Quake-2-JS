# Progress TS - apps/web/src/full-game.ts

## Etat

- Statut: En cours
- Dernier lot traite: `resizeCanvas`, `syncFullGameViewportVisibility`, `clearCanvas`, `resetFullGameMouseLook`, `releaseFullGameMouseLook`, `requestFullGamePointerLock`, `handleMouseMove`, `isFullGamePointerLocked`, `isFullGameMouseLookActive`, `applyFullGameMouseLook`
- Verdict: 10 symboles `Valide`; viewport/canvas classes `New`, pointer-lock et mouse-look classes `New` ou `Adapter` selon ownership navigateur.

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
- Checklist TS appliquee au lot console/canvas: identification TS, export non, `Original name: N/A`, sources declarees `N/A (web console adapter)`, `N/A (web console canvas helper)`, `N/A (web ref console adapter)`, `N/A (web console canvas adapter)`, `N/A (web console fallback)`, `N/A (web captured draw adapter)` et `N/A (web canvas draw adapter/helper)`, categories `Adapter` ou `New`, absence de matrice C/H liee pour ces symboles web.
- Croisement ownership: les proprietaires C/H restent `packages/client/src/console.ts` pour `Con_DrawConsole`, `packages/client/src/cl_scrn.ts` pour `SCR_RunConsole`/`SCR_DrawConsole`, et `packages/renderer-three/src/gl_draw.ts` pour `Draw_Char`, `Draw_Fill`, `Draw_Pic`, `Draw_StretchRaw`; le lot `apps/web` consomme ces sorties ou rejoue des commandes capturees sans se presenter comme portage proprietaire.
- Recherche de doublons/ownership: aucun doublon proprietaire detecte dans `apps/web/src/full-game.ts`; `drawGlyph`, `drawPaletteFill` et `drawRawIndexedImage` sont des adapters canvas de secours et non les proprietaires `ref_gl`.
- Checklist TS appliquee au lot assets/input: identification TS, export non, `Original name: N/A`, sources declarees `N/A (web canvas asset adapter)`, `N/A (local canvas helper)`, `N/A (web input adapter)`, `N/A (web console adapter)`, `N/A (web audio debug helper)` et `N/A (web input helper)`, categories `Adapter` ou `New`, absence de matrice C/H liee.
- Croisement C/H/ownership: les proprietaires restent `packages/renderer-three/src/gl_draw.ts` pour `Draw_FindPic`/`Draw_Char`/`Draw_Pic`, `packages/renderer-three/src/gl_image.ts` et `packages/formats/src/pcx.ts` pour le decodage PCX, `packages/client/src/keys.ts` pour `Key_Event`, `packages/client/src/console.ts` pour `Con_ToggleConsole_f` et `packages/client/src/menu-runtime.ts` pour `M_Keydown`. Le lot web route les evenements DOM et convertit des assets vers canvas sans revendiquer ces portages.
- Recherche de doublons/ownership: les symboles du lot ne sont definis que dans `apps/web/src/full-game.ts`; aucun doublon de portage proprietaire ni mauvais package detecte.
- Checklist TS appliquee au lot keyup/souris: identification TS, export non, `Original name: N/A`, sources declarees `N/A (web input adapter)`, `N/A (web pointer-lock adapter)` et `N/A (web input helper)`, categories `Adapter` ou `New`, absence de matrice C/H liee pour ces symboles web.
- En-tetes ajoutes dans `apps/web/src/full-game.ts` pour `handleKeyUp`, `handlePointerDown`, `handlePointerLockChange`, `routeFullGameEscapeToClient`, `handleMouseButton`, `handleMouseWheel`, `mapMouseButton` et `isTextInputTarget`.
- Croisement C/H/ownership: les proprietaires restent `packages/client/src/keys.ts` pour `Key_Event` et les constantes `K_ESCAPE`, `K_MOUSE*`, `K_MWHEEL*`; les matrices `client_keys.c.md` et `client_keys.h.md` les marquent `Valide`. Le lot web convertit les evenements DOM et appelle `Key_Event` sans revendiquer ces portages.
- Ecart de matrice: `mapDomKey`, `mapFunctionKey` et `mapPrintableDomKey` ne sont plus des symboles de `apps/web/src/full-game.ts`; la logique de keymap est dans `apps/web/src/full-game-keymap.ts` via `mapFullGameDomKey`, appelee par `full-game.ts`. Lignes marquees `Partiel` dans la matrice de ce fichier, a reprendre hors lot/fichier si l'index TS doit etre regenere.
- Checklist TS appliquee au lot viewport/mouse-look: identification TS, export non, `Original name: N/A`, sources declarees `N/A (web canvas helper)`, `N/A (web viewport adapter)`, `N/A (web pointer-lock helper)`, `N/A (web pointer-lock adapter)`, `N/A (web mouse-look helper)` et `N/A (web mouse-look adapter)`, categories `New` ou `Adapter`, absence de matrice C/H liee.
- En-tetes ajoutes dans `apps/web/src/full-game.ts` pour `resizeCanvas`, `syncFullGameViewportVisibility`, `clearCanvas`, `resetFullGameMouseLook`, `releaseFullGameMouseLook`, `requestFullGamePointerLock`, `handleMouseMove`, `isFullGamePointerLocked`, `isFullGameMouseLookActive` et `applyFullGameMouseLook`.
- Croisement C/H/ownership: les proprietaires restent `packages/client/src/cl_input.ts` pour `CL_AdjustAngles`/creation des commandes et `packages/client/src/cl_main.ts` pour les cvars `sensitivity`, `m_yaw`, `m_pitch`; le lot web adapte les deltas DOM/pointer-lock vers l'etat client porte sans revendiquer ces portages.
- Recherche de doublons/ownership: les symboles du lot ne sont definis que dans `apps/web/src/full-game.ts`; aucun doublon de portage proprietaire ni mauvais package detecte.

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
- Runtime: lot console/canvas integre comme adapter; il appelle les producteurs portes `SCR_RunConsole` et `Con_DrawConsole` et consomme les commandes de dessin deja emises par le client/menu au lieu de dupliquer l'etat runtime.
- apps/web: applicable et integre; rendu console via canvas fallback, overlay Three, chemin `refexport_t` frontend et replay des commandes capturees sont branches dans la boucle full-game.
- renderer-three: applicable indirectement; l'overlay console est transmis au render loop Three et les vrais ports `Draw_*` restent dans `packages/renderer-three/src/gl_draw.ts`.
- Runtime: lot assets/input integre comme adapter; les touches DOM sont routees vers `Key_Event`, `M_Keydown`, `Con_ToggleConsole_f`, `SCR_StopCinematic` et `SCR_FinishCinematic` portes, sans dupliquer leur comportement.
- apps/web: applicable et integre; le chargement PCX canvas alimente le fallback canvas et les hooks `refexport_t`, tandis que le keydown global pilote console, menu, cinematic et gameplay depuis `bootstrap`.
- renderer-three: applicable indirectement; les chemins de rendu Three/ref_gl gardent leurs proprietaires `gl_draw`/`gl_image`, et ce lot fournit seulement les assets canvas de secours et le routage navigateur.
- Runtime: lot keyup/souris integre comme adapter; keyup, boutons souris, molette et Escape synthetique passent par `Key_Event`, puis `executeRuntimeCommandBuffer`, sans remplacer le port `keys.c`.
- apps/web: applicable et integre; les listeners DOM `keyup`, `pointerdown`, `pointerlockchange`, `mousedown`, `mouseup` et `wheel` branchent ces adapters depuis `bootstrap`.
- renderer-three: non applicable justifie pour ce lot; aucun rendu visible n'est produit directement, le lot ne fait que router les entrees navigateur vers runtime/client.
- Runtime: lot viewport/mouse-look integre comme adapter; les cvars portees `sensitivity`, `m_yaw` et `m_pitch` pilotent les deltas souris, et les viewangles restent ceux du `ClientRuntime` consommes ensuite par les commandes/prediction client.
- apps/web: applicable et integre; `resize`, `mousemove`, `blur`, les transitions menu/game et la boucle `frame` branchent le canvas, la visibilite des viewports et la capture souris dans le meme host.
- renderer-three: applicable indirectement pour le viewport; `syncFullGameViewportVisibility` choisit entre game/frontend/canvas, tandis que le rendu visible reste produit par `full-game-render-loop` et `renderer-three`.

## Tests lances

- `npm run typecheck` passe.
- `npm run verify:full-game:audio-routing` passe.
- `npm run verify:full-game:commands` passe.
- `npm run verify:full-game:three-renderer` passe; l'assertion obsolete sur `drawCenteredPicture(page, runtime, "loading")` a ete corrigee pour le flux loading actuel.
- `npm run verify:full-game:demo-cleanup` passe.
- `npm run verify:full-game:console-background` passe.
- `npm run verify:full-game:commands` passe.
- `npm run verify:full-game:three-renderer` passe.
- `npm run typecheck` passe.
- `npm run verify:full-game:input-bindings` passe.
- `npm run verify:full-game:audio-routing` passe.
- `npm run verify:full-game:three-renderer` passe.
- `npm run typecheck` passe.
- `npm run verify:full-game:input-bindings` passe.
- `npm run verify:full-game:authoritative-input` passe.
- `npm run typecheck` passe.
- `npm run typecheck` passe.
- `npm run verify:full-game:input-bindings` passe.
- `npm run verify:full-game:authoritative-input` passe.
- `npm run verify:full-game:three-renderer` passe.

## Prochain lot recommande

Traiter le bloc final suivant dans `apps/web/src/full-game.ts`: `createNoopQglBindings`, `createFullGameRefImports`, `requireFullGameRefCvar`, `appendLog`. Reprendre separement les lignes `mapDomKey`, `mapFunctionKey`, `mapPrintableDomKey` lors de la validation de `apps/web/src/full-game-keymap.ts` ou apres regeneration de la matrice TS.
