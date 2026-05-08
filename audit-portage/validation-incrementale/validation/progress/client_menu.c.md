# Progress - Quake-2-master/client/menu.c

## Session 2026-05-08

- Lot traite: bloc credits complet (`idcredits`, `xatcredits`, `roguecredits`, `M_Credits_MenuDraw`, `M_Credits_Key`, `M_Menu_Credits_f`) plus extension large aux blocs adjacents multiplayer d'entree, keys, options et video (`M_Menu_Multiplayer_f`, `M_Menu_Keys_f`, `M_Menu_Options_f`, `M_Menu_Video_f` et callbacks/tables/globals associes).
- Matrice mise a jour: 156 `Valide`, 0 `Partiel`, 61 `Non applicable`, 145 `A verifier`.
- Corrections appliquees: ajout des commentaires d'en-tete de portage manquants dans `packages/client/src/menu-options-keys.ts` et `packages/client/src/menu-multiplayer.ts`; renommage du helper options `clampCvar` en `ClampCvar` pour conserver le nom source.
- Runtime: menus atteignables via `M_Init`/commandes `menu_*`, `M_Main_Key`, `M_PushMenu`, `M_Draw` et `M_Keydown`; callbacks keys/options/multiplayer/credits compares au C et couverts par `verify:menu`.
- apps/web: integration presente dans `apps/web/src/full-game.ts` via `createClientMenuContext`, `M_Init`, `M_Keydown`, commandes console, flux qmenu/ref 2D, ping server list et bridge menu/full-game; tests web/full-game passes.
- renderer-three: pas de sortie scene 3D directe attendue. Les blocs valides produisent du dessin menu 2D par `ref.DrawChar`/`DrawPic`/qmenu et des commandes/cvars; le renderer consomme seulement le flux visible via l'adapter ref/web, aucune sortie modeles, frames, particules, beams, dlights, areabits, camera ou scene n'est introduite par ce lot.
- Tests lances:
  - `npm run verify:menu` OK
  - `npm run verify:full-game:commands` OK
  - `npm run verify:full-game:three-renderer` OK
  - `npm run verify:web-render-order` OK
  - `npm run verify:vid:header` OK
  - `npm run typecheck` OK

- Lot traite: demarrage large du menu: etat initial du menu, sons, pile runtime, helpers de dessin communs, menu principal, bloc game/load/save.
- Matrice mise a jour: 61 `Valide`, 0 `Partiel`, 35 `Non applicable`, 266 `A verifier`.
- Corrections appliquees: ajout des commentaires d'en-tete de portage manquants pour les callbacks prives du bloc `game/load/save` dans `packages/client/src/menu-main-game.ts`.
- Runtime: `M_Init`, `M_Menu_Main_f`, `M_Draw`, `M_Keydown`, pile menu, sons et commandes menu atteignables depuis les commandes runtime et le flux web.
- apps/web: integration presente dans `apps/web/src/full-game.ts`; `verify:full-game:commands`, `verify:full-game:newgame` et `verify:full-game:bridge` passent. Le harness bridge simule explicitement un client connecte avant `loading`, conforme au guard source de `SCR_BeginLoadingPlaque`.
- renderer-three: pas d'integration directe attendue pour ce lot. Les entites validees produisent des commandes de dessin 2D menu via `ref.DrawPic`/`DrawChar` et du flux input/commande; elles ne produisent pas modeles, frames, particules, beams, dlights, areabits, camera ou scene 3D a consommer par `packages/renderer-three`.
- Tests lances:
  - `npm run verify:menu` OK
  - `npm run verify:full-game:commands` OK
  - `npm run verify:full-game:newgame` OK
  - `npm run typecheck` OK
  - `npm run verify:full-game:bridge` OK apres correction du harness connecte

## Prochain lot recommande

Reprendre le bloc join-server et start-server: `MAX_LOCAL_SERVERS`, `NO_SERVER_STRING`, `M_AddToServerList`, `JoinServerFunc`, `SearchLocalGames`, `JoinServer_MenuInit/Draw/Key`, `M_Menu_JoinServer_f`, puis `DMOptionsFunc`, `RulesChangeFunc`, `StartServerActionFunc` et `StartServer_MenuInit` si le lot reste coherent.
