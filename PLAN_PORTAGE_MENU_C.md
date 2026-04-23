# Plan de portage restant - `client/menu.c`

Objectif: fermer le portage de `Quake-2-master/client/menu.c` en conservant `packages/client/src/menu.ts` comme point d'ancrage principal et en respectant le decoupage deja inscrit dans son header.

## Etat actuel

Le portage est deja avance et couvre:

- Socle runtime: `M_PushMenu`, `M_PopMenu`, `M_ForceMenuOff`, `Default_MenuKey`, `M_Init`, `M_Draw`, `M_Keydown`.
- Primitives de dessin: `M_Banner`, `M_DrawCharacter`, `M_Print`, `M_PrintWhite`, `M_DrawPic`, `M_DrawCursor`, `M_DrawTextBox`.
- Menus principaux: `main`, `game`, `load game`, `save game`, `multiplayer`, `join server`, `address book`, `start server`, `options`, `keys`, `video`, `quit`.
- Verifications: `scripts/verify/quake2-menu.ts` couvre deja le stack menu, les ecrans ci-dessus, les cvars principales, les callbacks de commandes et les chemins `map` / `gamemap`.

Le fichier reste en `🟠` dans `PORTAGE_QUAKE2.md` car plusieurs blocs source sont encore remplaces par hooks ou absents.

## Reste a porter

### 1. Credits menu

Source: `client/menu.c`, bloc credits autour de `M_Credits_MenuDraw`, `M_Credits_Key`, `M_Menu_Credits_f`.

Cible recommandee: `packages/client/src/menu-main-game.ts`.

Statut: porte dans `packages/client/src/menu-main-game.ts`, raccorde a `M_Init` via `menu_credits` et couvert par `scripts/verify/quake2-menu.ts`.

Raison: l'entree `credits` est dans le menu `game`, et `CreditsFunc` ouvre maintenant le menu credits porte.

Fonctions / donnees a porter:

- Tables `idcredits`, `xatcredits`, `roguecredits`.
- Etat `credits`, `creditsIndex`, `creditsBuffer`, `credits_start_time`.
- `M_Credits_MenuDraw`.
- `M_Credits_Key`.
- `M_Menu_Credits_f`.

Adaptations autorisees:

- Remplacer `FS_LoadFile("credits", &creditsBuffer)` par un hook `getCreditsText?: () => string | null`.
- Remplacer `Developer_searchpath(1)` par le hook deja prevu `getDeveloperSearchpath`.
- Garder la logique de scrolling et le parsing CR/LF source-compatible.

Verification attendue:

- `M_Menu_Credits_f` pousse le menu credits depuis l'action `credits`.
- Le fallback id/xatrix/rogue selectionne la bonne table selon `getDeveloperSearchpath(1)`.
- Un texte charge par hook remplace les tables fallback.
- `K_ESCAPE` libere/reinitialise l'etat charge et revient au menu precedent.

### 2. DMOptions menu

Source: `client/menu.c`, bloc `DMOPTIONS BOOK MENU`.

Cible recommandee: `packages/client/src/menu-multiplayer.ts`.

Statut: porte dans `packages/client/src/menu-multiplayer.ts`, raccorde a `M_Init` via `menu_dmoptions` et couvert par `scripts/verify/quake2-menu.ts`.

Raison: le menu est appele depuis `start server`, deja porte dans `menu-multiplayer.ts`.

Fonctions / donnees a porter:

- `dmoptions_statusbar`.
- `s_dmoptions_menu`.
- Les spincontrols `s_friendlyfire_box`, `s_falls_box`, `s_weapons_stay_box`, `s_instant_powerups_box`, `s_powerups_box`, `s_health_box`, `s_spawn_farthest_box`, `s_teamplay_box`, `s_samelevel_box`, `s_force_respawn_box`, `s_armor_box`, `s_allow_exit_box`, `s_infinite_ammo_box`, `s_fixed_fov_box`, `s_quad_drop_box`.
- Les options Rogue: `s_no_mines_box`, `s_no_nukes_box`, `s_stack_double_box`, `s_no_spheres_box`.
- `DMFlagCallback`.
- `DMOptions_MenuInit`.
- `DMOptions_MenuDraw`.
- `DMOptions_MenuKey`.
- `M_Menu_DMOptions_f`.

Adaptations autorisees:

- Utiliser les constantes `DF_*` deja exportees par `packages/qcommon/src/index.ts`.
- Utiliser `getDeveloperSearchpath(2)` pour la branche Rogue.
- Le hook temporaire `onMenuDMOptions` a ete remplace par l'ouverture reelle de `M_Menu_DMOptions_f`.

Verification attendue:

- `menu_dmoptions` est enregistre dans `M_Init`.
- Depuis `start server`, l'action `deathmatch flags` ouvre `dmoptions` si les regles ne sont pas coop.
- Les valeurs initiales refletent `dmflags`.
- Chaque option modifie les bits `dmflags` comme dans le C.
- Le statusbar affiche `dmflags = <value>`.
- Les options Rogue apparaissent uniquement si `getDeveloperSearchpath(2) == 2`.

### 3. Download Options menu

Source: `client/menu.c`, bloc `DOWNLOADOPTIONS BOOK MENU`.

Cible recommandee: `packages/client/src/menu-multiplayer.ts` si conserve avec `player config`, ou sous-fichier dedie futur `menu-player-config.ts` si le bloc joueur devient gros.

Statut: porte dans `packages/client/src/menu-multiplayer.ts`, raccorde a `M_Init` via `menu_downloadoptions` et couvert par `scripts/verify/quake2-menu.ts`.

Raison: ce sous-menu est appele depuis `player config`.

Fonctions / donnees a porter:

- `s_downloadoptions_menu`.
- `s_download_title`.
- `s_allow_download_box`.
- `s_allow_download_maps_box`.
- `s_allow_download_models_box`.
- `s_allow_download_players_box`.
- `s_allow_download_sounds_box`.
- `DownloadCallback`.
- `DownloadOptions_MenuInit`.
- `DownloadOptions_MenuDraw`.
- `DownloadOptions_MenuKey`.
- `M_Menu_DownloadOptions_f`.

Verification attendue:

- `menu_downloadoptions` est enregistre dans `M_Init`.
- Le menu contient le titre et les 5 options source.
- Le curseur saute le titre initial.
- Chaque spincontrol met a jour la cvar correspondante.

### 4. Player Config menu

Source: `client/menu.c`, bloc `PLAYER CONFIG MENU`.

Cible recommandee: creer `packages/client/src/menu-player-config.ts`, puis re-exporter via `menu.ts`.

Statut: porte dans `packages/client/src/menu-player-config.ts`, raccorde a `M_Init` via `menu_playerconfig` et couvert par `scripts/verify/quake2-menu.ts`.

Raison: le bloc est volumineux et combine scan filesystem, cvars userinfo, preview renderer et sous-menu download. Le header actuel ne liste pas encore ce fichier, mais le decoupage est justifie par la taille du bloc et conserve `menu.ts` comme ancrage principal.

Fonctions / donnees a porter:

- Etat menu: `s_player_config_menu`, champs/listes/titres/actions.
- Structures: `playermodelinfo_s`, `s_pmi`, `s_pmnames`, `s_numplayermodels`.
- Tables: `rate_tbl`, `rate_names`.
- `DownloadOptionsFunc`.
- `HandednessCallback`.
- `RateCallback`.
- `ModelCallback`.
- `FreeFileList`.
- `IconOfSkinExists`.
- `PlayerConfig_ScanDirectories`.
- `pmicmpfnc`.
- `PlayerConfig_MenuInit`.
- `PlayerConfig_MenuDraw`.
- `PlayerConfig_MenuKey`.
- `M_Menu_PlayerConfig_f`.

Adaptations autorisees:

- `FS_NextPath`, `FS_ListFiles`, `Sys_FindFirst`, `Sys_FindClose` sont remplaces par le hook explicite `getPlayerModels?: () => PlayerModelInfo[]`.
- Garder le tri source: `male`, `female`, puis alphabetique.
- La preview joueur est exposee via le hook renderer-neutral `onPlayerConfigPreview`, sans importer de renderer adapter.
- Remplacer le rendu direct `re.RenderFrame` par un contrat/hook dans `ClientMenuHooks` ou un type local exporte.
- Conserver `Cvar_Set("name")`, `Cvar_Set("skin")`, `hand`, `rate` et les valeurs `rate_tbl` source.

Verification attendue:

- Sans modele valide, `M_Menu_PlayerConfig_f` laisse le menu multiplayer actif et met le statusbar `No valid player models found`.
- Avec modeles valides, le menu contient name/model/skin/handedness/rate/download options.
- Le tri male/female/autres est preserve.
- Changer de modele remet la skin a 0 et remplace la liste de skins.
- `K_ESCAPE` persiste `name` et `skin` puis nettoie l'etat temporaire.
- Les callbacks `hand` et `rate` mettent a jour les cvars attendues.

### 5. Raccords M_Init et hooks temporaires

Cible recommandee: `packages/client/src/menu-runtime.ts` et `packages/client/src/menu-types.ts`.

Statut: termine. Les commandes restantes sont enregistrees dans `M_Init`, les hooks temporaires de menus actifs sont retires, et `scripts/verify/quake2-menu.ts` execute maintenant les commandes `menu_credits`, `menu_dmoptions`, `menu_downloadoptions` et `menu_playerconfig`.

Actions:

- `menu_dmoptions` est deja enregistre depuis le port du menu DMOptions.
- `menu_playerconfig` est deja enregistre depuis le port du menu Player Config.
- `menu_downloadoptions` est deja enregistre depuis le port du menu Download Options.
- `menu_credits` est deja enregistre depuis le port du menu credits.
- Supprimer ou documenter les hooks temporaires devenus inutiles:
  - `onMenuCredits` est deja supprime depuis le port du menu credits.
  - `onMenuDMOptions` est deja supprime depuis le port du menu DMOptions.
  - `onMenuPlayerConfig` est deja supprime depuis le port du menu Player Config.

Verification attendue:

- Le harnais verifie explicitement les commandes `menu_dmoptions`, `menu_playerconfig`, `menu_downloadoptions`, `menu_credits`.
- Les actions de menus ouvrent les vrais sous-menus et non des hooks.

### 6. Bloc Gallery

Source: `client/menu.c`, bloc `GALLERY MENU` sous `#if 0`.

Decision recommandee: non porte volontairement.

Statut: non porte volontairement. Le bloc reste compile-out dans le source original et aucun `menu_gallery` actif n'est enregistre par `M_Init`.

Justification: code compile-out dans le source original. Le suivi peut le mentionner comme hors perimetre explicite du port de comportement runtime.

## Ordre d'execution recommande

1. Porter `credits`.
2. Porter `dmoptions`.
3. Porter `download options`.
4. Extraire et porter `player config`.
5. Nettoyer `M_Init`, hooks temporaires et exports.
6. Mettre a jour `PORTAGE_QUAKE2.md`.

Cet ordre minimise les risques:

- `credits` est relativement autonome.
- `dmoptions` ferme le trou fonctionnel le plus direct dans `start server`.
- `download options` est petit et prepare `player config`.
- `player config` est le plus gros bloc et doit arriver apres ses sous-menus.

## Criteres de fermeture de `client/menu.c`

`client/menu.c` pourra passer en `✅` seulement quand:

- Tous les blocs actifs du source sont portes ou explicitement marques hors perimetre.
- `M_Init` enregistre toutes les commandes source actives.
- Les actions internes ouvrent les menus reels et non des hooks temporaires.
- Les adaptations filesystem/renderer sont documentees dans les commentaires de fonction ou de module.
- `scripts/verify/quake2-menu.ts` couvre au minimum:
  - credits charge/fallback/key;
  - dmflags et options Rogue;
  - download options;
  - player config init/cvars/skin/rate/handedness;
  - commandes `menu_*` restantes.
- `PORTAGE_QUAKE2.md` reflete le rattachement principal a `packages/client/src/menu.ts` et les sous-fichiers utilises.

## Notes de fidelite

- Ne pas fusionner les comportements `player config` dans un adapter renderer ou web.
- Garder les noms source pour les fonctions portees.
- Les hooks sont acceptables uniquement pour remplacer des dependances non portables du C original: filesystem, renderer preview, recherche de chemin developer.
- Les hooks ne doivent pas masquer un comportement source encore absent; tant qu'un hook remplace un menu actif, le fichier reste en `🟠`.
