# Progress - Quake-2-master/client/menu.c

## Session 2026-05-08

- Lot traite: fermeture du bloc player config restant et runtime final (`PlayerConfig_MenuInit` avec locaux `name`, `team`, `skin`, `currentdirectory`, `currentskin`, `i`, `currentdirectoryindex`, `currentskinindex`, `hand`, `handedness`, `j`; `PlayerConfig_MenuDraw` avec `scratch`, `yaw`, `maxframe`; `PlayerConfig_MenuKey` avec `i`, `scratch`, `j`, appel `Default_MenuKey`; `M_Menu_PlayerConfig_f`; puis `M_Quit_Key`, `M_Quit_Draw`, `M_Menu_Quit_f`, `M_Init`, `M_Draw`, `M_Keydown`, local `s`).
- Matrice mise a jour: 233 `Valide`, 0 `Partiel`, 130 `Non applicable`, 0 `A verifier`.
- Corrections appliquees: `PlayerConfig_MenuDraw` appelle maintenant `context.ref.RenderFrame(refdef)` comme le C apres construction du `refdef` et de l'entite preview; commentaires d'en-tete renforces pour `PlayerConfig_MenuInit`, `PlayerConfig_MenuDraw`, `PlayerConfig_MenuKey`, `M_Menu_PlayerConfig_f`, `M_Quit_Key`, `M_Quit_Draw`, `M_Menu_Quit_f`, `M_Init`, `M_Draw`, `M_Keydown`; tests renforces dans `scripts/verify/quake2-menu.ts` et `scripts/verify/quake2-full-game-three-renderer.ts`.
- Runtime: `M_Init` enregistre `menu_playerconfig` et `menu_quit`; `M_Menu_PlayerConfig_f`/`M_Menu_Quit_f` poussent les draw/key handlers; `M_Draw` appelle le draw handler actif; `M_Keydown` appelle le key handler actif et joue le son retourne. Player config persiste `name`/`skin`, met a jour `hand`/`rate`, et nettoie l'etat temporaire au retour Escape.
- apps/web: integration presente via `createClientMenuContext`, `M_Init`, commandes console, input clavier vers `M_Keydown`, `M_Draw` dans la boucle full-game, `getPlayerModels: () => readFullGamePlayerModels(filesystem)`, et ref full-game. Le navigateur consomme le runtime porte et ne remplace pas ce bloc par une logique parallele.
- renderer-three: applicable pour la preview player config. Le lot produit un modele, une skin/image, une frame/entity et un `refdef` `RDF_NOWORLDMODEL`; le manque d'appel `RenderFrame` a ete corrige, donc le ref_gl/Three host peut maintenant consommer la sortie visible. L'icone de skin reste dessinee via `DrawPic`.
- Tests lances:
  - `npm run verify:menu` OK
  - `npm run verify:full-game:three-renderer` OK
  - `npm run verify:web-render-order` OK
  - `npm run typecheck` OK

- Lot traite: bloc player config initial (`s_player_name_field`, `s_player_model_box`, `s_player_skin_box`, `s_player_handedness_box`, `s_player_rate_box`, `s_player_download_action`, `MAX_DISPLAYNAME`, `MAX_PLAYERMODELS`, `playermodelinfo_s`, champs `nskins`/`displayname`/`directory`, `s_pmnames`, `s_numplayermodels`, `rate_tbl`, `rate_names`, callbacks `DownloadOptionsFunc`, `HandednessCallback`, `RateCallback`, `ModelCallback`, plus `FreeFileList`, `IconOfSkinExists`, `PlayerConfig_ScanDirectories` et locaux associes).
- Matrice mise a jour: 222 `Valide`, 0 `Partiel`, 111 `Non applicable`, 29 `A verifier`.
- Corrections appliquees: ajout des commentaires d'en-tete de portage manquants sur les callbacks player-config dans `packages/client/src/menu-player-config.ts`; branchement `apps/web` de `getPlayerModels` dans `apps/web/src/full-game.ts` via `readFullGamePlayerModels(filesystem)`, avec scan loose `FS_NextPath`/`FS_ListFiles`, scan des PAK montes et verification skin/icon type `IconOfSkinExists`; renforcement de `scripts/verify/quake2-full-game-three-renderer.ts`.
- Runtime: le menu player-config est atteignable via `M_Init` (`menu_playerconfig`), `M_Menu_Multiplayer_f`/`PlayerSetupFunc`, `M_PushMenu`, `M_Draw`, `M_Keydown` et callbacks qmenu; les callbacks download/handedness/rate/model modifient les cvars ou menus comme le C.
- apps/web: manque corrige pendant cette session. Le navigateur ne renvoie plus `getPlayerModels: () => null`; il fournit maintenant les modeles/skins issus du filesystem Quake monte, y compris `pak0.pak`, au runtime menu porte.
- renderer-three: pas de sortie renderer-three directe produite par les entites validees dans ce lot. Elles preparent la liste modeles/skins et les callbacks; la preview visible (`PlayerConfig_MenuDraw`, `RegisterModel`/`RegisterSkin`, `onPlayerConfigPreview`, icone) reste dans le prochain lot et devra etre jugee explicitement sans masquer le branchement renderer/web.
- Tests lances:
  - `npm run verify:menu` OK
  - `npm run verify:full-game:three-renderer` OK
  - `npm run typecheck` OK

- Lot traite: gros bloc start-server/DM options/download options/address book (`StartServer_MenuDraw`, `StartServer_MenuKey`, `M_Menu_StartServer_f`, `dmoptions_statusbar`, `DMFlagCallback`, `DMOptions_MenuInit/Draw/Key`, `M_Menu_DMOptions_f`, `DownloadCallback`, `DownloadOptions_MenuInit/Draw/Key`, `M_Menu_DownloadOptions_f`, `NUM_ADDRESSBOOK_ENTRIES`, `s_addressbook_fields`, `AddressBook_MenuInit/Key/Draw`, `M_Menu_AddressBook_f` et locaux associes).
- Matrice mise a jour: 199 `Valide`, 0 `Partiel`, 99 `Non applicable`, 64 `A verifier`.
- Corrections appliquees: renforcement du harness `scripts/verify/quake2-menu.ts` pour couvrir explicitement le nettoyage ESC de `StartServer_MenuKey`, les flags DM/Rogue de `DMFlagCallback`, le rendu du carnet d'adresses et les callbacks download existants.
- Runtime: start-server, DM options, download options et address book atteignables via `M_Init` (`menu_startserver`, `menu_dmoptions`, `menu_downloadoptions`, `menu_addressbook`), via les callbacks multiplayer/start-server/player-config, puis `M_PushMenu`, `M_Draw`, `M_Keydown` et `Default_MenuKey`; `dmflags`, `allow_download*` et `adr0..adr8` sont bien modifies par les callbacks portes.
- apps/web: integration presente via `apps/web/src/full-game.ts`, `createClientMenuContext`, commandes console, mapping input et hook `getMapList`; le navigateur consomme les menus par le runtime porte et ne remplace pas ce bloc par une logique parallele.
- renderer-three: pas de sortie scene 3D directe attendue pour ce lot. Les entites produisent du menu 2D, des commandes, cvars et champs texte; aucune sortie modeles, frames, images de scene, particules, beams, dlights, temp entities, areabits, camera ou scene n'est attendue dans `packages/renderer-three`.
- Tests lances:
  - `npm run verify:menu` OK
  - `npm run verify:full-game:commands` OK
  - `npm run verify:full-game:three-renderer` OK
  - `npm run verify:web-render-order` OK
  - `npm run typecheck` OK

- Lot traite: bloc join-server complet et debut start-server (`MAX_LOCAL_SERVERS`, `NO_SERVER_STRING`, etats join-server, `M_AddToServerList`, `JoinServerFunc`, `AddressBookFunc`, `NullCursorDraw`, `SearchLocalGames`, `SearchLocalGamesFunc`, `JoinServer_MenuInit`, `JoinServer_MenuDraw`, `JoinServer_MenuKey`, `M_Menu_JoinServer_f`, puis `nummaps`, `DMOptionsFunc`, `RulesChangeFunc`, `StartServerActionFunc`, `StartServer_MenuInit` et locaux associes).
- Matrice mise a jour: 176 `Valide`, 0 `Partiel`, 84 `Non applicable`, 102 `A verifier`.
- Corrections appliquees: branchement `apps/web` du menu start-server corrige dans `apps/web/src/full-game.ts` avec lecture/parsing de `maps.lst` via `FS_LoadFile` et `COM_Parse`; ajout d'une assertion anti-regression dans `scripts/verify/quake2-full-game-three-renderer.ts`.
- Runtime: join-server/start-server atteignables via `M_Init` (`menu_joinserver`, `menu_startserver`), `M_Menu_Multiplayer_f`, callbacks qmenu, `M_PushMenu`, `M_Draw` et `M_Keydown`; `SearchLocalGames` appelle le hook de ping, `M_AddToServerList` recoit les reponses status, `JoinServerFunc` emet `connect`, `StartServerActionFunc` pose les cvars et emet `map`/`gamemap`.
- apps/web: join-server integre par `onAddToServerList` vers `M_AddToServerList`; start-server integre pendant cette session par `getMapList: () => readFullGameMapList(filesystem)`, ce qui evite le hook vide precedent.
- renderer-three: pas de sortie scene 3D directe attendue pour ce lot. Les menus produisent du dessin 2D via qmenu/ref et des commandes/cvars/requetes reseau; aucune nouvelle sortie modeles, frames, images de scene, particules, beams, dlights, temp entities, areabits, camera ou scene n'est produite par ces entites. Le flux visible reste consomme via l'adapter ref/web et le test three-renderer verifie l'integration full-game pertinente.
- Tests lances:
  - `npm run verify:menu` OK
  - `npm run verify:full-game:commands` OK
  - `npm run verify:full-game:three-renderer` OK
  - `npm run typecheck` OK

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

Aucun lot restant dans `client_menu.c.md`: toutes les lignes sont `Valide` ou `Non applicable`. Laisser le coordinateur passer `client/menu.c` en `Termine` dans `AVANCEMENT_GLOBAL.md`.
