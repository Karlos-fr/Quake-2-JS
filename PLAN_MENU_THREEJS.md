# Plan de correction - Menu principal dans le rendu Three.js

## Contexte

Le menu principal Quake II est deja porte cote client TypeScript a partir du code original `client/menu.c`.
Le probleme n'est donc pas le comportement du menu, mais son integration web actuelle.

Actuellement, dans `apps/web/src/full-game.ts`, le menu est dessine hors du rendu Three.js :

- `M_Draw` et les fonctions de menu portees appellent bien `ref.DrawPic`, `ref.DrawChar`, `ref.DrawFill` et `ref.DrawFadeScreen`.
- Ce `ref` est cependant fourni par `createCanvasRef`, un faux `refexport_t` qui capture des commandes.
- Les commandes sont ensuite rejouees dans un canvas 2D DOM via `drawCapturedCommands`.
- Le canvas DOM, `menuBackdrop`, `status` et `log` sont superposes au rendu jeu avec du style CSS.

La cible souhaitee est que le menu principal soit integre au pipeline de rendu Three.js/ref_gl, pas rendu par une couche DOM/canvas 2D separee.

## Constat architectural

Le portage menu cote client est sain :

- `packages/client/src/menu-runtime.ts` conserve le flux original `M_Draw -> DrawFadeScreen -> m_drawfunc`.
- `packages/client/src/menu-main-game.ts` dessine le main menu via les assets Quake II originaux.
- `packages/client/src/menu-draw.ts` conserve les primitives `M_Banner`, `M_DrawPic`, `M_DrawCursor`, `M_Print`, etc.
- `packages/client/src/qmenu.ts` capture les primitives qmenu de facon explicite, mais reste independant du backend.

Le rendu Three/ref_gl existe deja :

- `packages/renderer-three/src/gl_draw.ts` porte `ref_gl/gl_draw.c`.
- `packages/renderer-three/src/three-gl-draw-adapter.ts` projette les primitives `gl_draw` dans une scene Three.js orthographique.
- `packages/renderer-three/src/ref-gl-host.ts` expose un `refexport_t` compatible client via `createRefGlHost`.

Le correctif doit donc rebrancher le menu sur ce `refexport_t` Three/ref_gl, sans deplacer la logique menu dans `apps/web` ni dans Three.js.

## Plan de correction

1. Creer un renderer Three/ref_gl pour les ecrans frontend.
   - Initialiser un `createRenderer()`, un `createThreeGlDrawAdapter()`, un `createGlImageRuntime()` et un `createRefGlHost()` des le demarrage du full-game.
   - Ce renderer n'a pas besoin de map BSP pour afficher le menu.
   - Il doit rendre uniquement la scene HUD orthographique exposee par `glDrawAdapter.scene`.

2. Remplacer le `ref` canvas utilise par le menu.
   - Dans `createFullGameRuntime`, ne plus construire le menu avec `createCanvasRef`.
   - Fournir au `ClientMenuContext` le `refGlHost.api` cree pour le rendu frontend.
   - Garder `packages/client` intact : `M_Draw`, `M_Main_Draw`, `Menu_Draw`, `qmenu` ne doivent pas changer pour ce besoin.

3. Rendre le menu par Three.js.
   - Remplacer le chemin actuel de `drawMenuFrame` :
     - vider `runtime.drawCommands`,
     - appeler `M_Draw(runtime.menu)`,
     - rejouer `drawCapturedCommands` dans le canvas DOM 2D.
   - Nouveau chemin cible :
     - `glDrawAdapter.clear()`,
     - `M_Draw(runtime.menu)`,
     - `renderer.clear()`,
     - `renderer.render(glDrawAdapter.scene, glDrawAdapter.camera)`.
   - Le menu principal ne doit plus dependre de `drawCapturedCommands`.

4. Integrer les overlays menu pendant le jeu.
   - Aujourd'hui, quand le menu est ouvert pendant l'attract loop, le jeu Three est rendu puis le menu est redessine dans le canvas DOM 2D.
   - Utiliser plutot le hook `drawOverlay` de `createFullGameRenderLoop`.
   - Appeler `M_Draw(runtime.menu)` dans ce hook avec le meme `refGlHost.api`, afin que le menu soit compose dans la passe Three.js.

5. Reduire les elements DOM superposes.
   - Supprimer ou masquer `menuBackdrop` pour le menu principal.
   - S'appuyer sur `DrawFadeScreen`, deja porte dans `gl_draw.ts`, pour le fond noir translucide original.
   - Garder temporairement `status` et `log` uniquement comme debug web, pas comme UI de jeu.
   - Reporter eventuellement console/loading/cinematics vers le meme pipeline dans une phase suivante.

6. Conserver la separation de responsabilites.
   - `packages/client` reste proprietaire du comportement menu original.
   - `packages/renderer-three` reste proprietaire du rendu `ref_gl/gl_draw.c`.
   - `apps/web/full-game.ts` ne fait que cabler le runtime client et le backend Three/ref_gl.
   - Ne pas reimplementer le menu en objets Three.js ad hoc : Three.js doit executer les primitives `ref.Draw*`.

7. Validation.
   - Verifier que le menu principal affiche bien :
     - `m_main_game`
     - `m_main_multiplayer`
     - `m_main_options`
     - `m_main_video`
     - `m_main_quit`
     - `m_main_plaque`
     - `m_main_logo`
   - Verifier la navigation clavier : haut, bas, entree, escape.
   - Verifier le menu seul apres les cinematiques.
   - Verifier le menu par-dessus l'attract loop.
   - Verifier le retour jeu depuis le menu.
   - Lancer une verification TypeScript ciblee.
   - Faire un test visuel dans `full-game.html`.

## Contraintes

- Ne pas modifier le port du comportement original pour contourner le probleme d'integration.
- Ne pas deplacer la logique menu dans `apps/web`.
- Ne pas introduire une UI CSS ou DOM pour le menu principal.
- Ne pas casser le rendu Three.js de la map, du HUD et des overlays deja branches.
- Respecter la regle du README : moteur, rendu et UI ne doivent pas etre melanges dans un meme module.

## Risques identifies

- Le menu utilise des coordonnees logiques 640x480, alors que le renderer Three utilise la taille reelle du viewport. Il faudra verifier l'echelle et le centrage.
- `DrawFadeScreen` depend de l'etat `vid.width` / `vid.height` synchronise par `ref-gl-host`. Il faudra confirmer que l'etat video du frontend menu est bien coherent.
- Les cinematiques et le loading utilisent encore le canvas 2D. Le plan cible d'abord le menu principal pour limiter le rayon d'action.
- La console dispose deja d'un chemin partiel dans Three via `renderCanvasOverlay`; il ne faut pas le casser en rebranchant le menu.

