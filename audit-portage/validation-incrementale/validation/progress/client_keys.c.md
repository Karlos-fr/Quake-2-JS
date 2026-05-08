# Progress - Quake-2-master/client/keys.c

## Session 2026-05-08

- Lot traite: `MAXCMDLINE`, globals d'etat clavier/console jusqu'a `keydown`, `keyname_t`, `keynames`, conversions de noms de touches, commandes de binding et `Key_Init`.
- Source C comparee: `Quake-2-master/client/keys.c`.
- Cible TS comparee: `packages/client/src/keys.ts`.
- Corrections appliquees: ajout des commentaires d'en-tete structures sur `MAXCMDLINE`, `keyname_t`, le regroupement de globals dans `client_key_state_t`, `keynames`, `Key_StringToKeynum`, `Key_KeynumToString`, `Key_SetBinding`, `Key_Unbind_f`, `Key_Unbindall_f`, `Key_Bind_f`, `Key_WriteBindings`, `Key_Bindlist_f` et `Key_Init`.
- Decisions: les globals C du lot sont portes comme champs de `client_key_state_t`; `name`, `keynum`, `tinystr`, `new`, `l`, `b`, `cmd` et les `i` locaux du lot sont des faux positifs de matrice et sont marques `Non applicable`.
- Runtime: `Key_Init` enregistre `bind`, `unbind`, `unbindall`, `bindlist`; `Key_SetBinding` alimente `Key_Event`, les menus d'options et l'ecriture config via `Key_WriteBindings`.
- apps/web: `apps/web/src/full-game.ts` appelle `Key_Init`, route les evenements DOM par `Key_Event`, transmet `anykeydown` au flux input et derive les hotkeys HUD depuis `runtime.menu.keys.state.keybindings`.
- renderer-three: non applicable pour ce lot; les entites validees ne produisent pas directement modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene. Leur sortie visible eventuelle passe par commandes/input client ulterieurs.
- Tests lances:
  - `npm run verify:keys` OK.
  - `npm run verify:keys:header` OK.
  - `npm run verify:full-game:input-bindings` OK.
  - `npm run verify:web-render-order` OK.
  - `npm run typecheck` KO sur `apps/web/src/full-game-server-host.ts` (`setTimeBeforeGame` optionnel), hors lot `keys.c`.

## Etat

- Dernier lot valide: `CompleteCommand`, `Key_Console`, faux positifs locaux `cbd`/`i`, globals chat `chat_team`/`chat_buffer`/`chat_bufferlen`, `Key_Message`, `Key_Event`, faux positifs locaux `kb`/`cmd`/`i`, `Key_ClearStates` et `Key_GetKey`.
- Prochain lot recommande: aucun dans `client_keys.c.md`; toutes les lignes sont `Valide` ou `Non applicable`.
- Blocages: aucun blocage fonctionnel sur `keys.c`.

## Session 2026-05-08 - cloture

- Lot traite: fin de `keys.c` depuis `CompleteCommand` jusqu'a `Key_GetKey`, avec validation des faux positifs locaux associes.
- Source C comparee: `Quake-2-master/client/keys.c`.
- Cible TS comparee: `packages/client/src/keys.ts`, plus synchronisation console dans `packages/client/src/console.ts`.
- Corrections appliquees: ajout des commentaires d'en-tete structures sur `CompleteCommand`, `Key_Console` et `Key_Message`; ajout du miroir `con_totallines`; correction de la branche Home de `Key_Console` pour reproduire `con.current - con.totallines + 10`; extension de `verify:keys` sur le scrollback Home.
- Decisions: `cbd`, `i`, `kb`, `cmd` et le `i` de `Key_ClearStates` sont des variables locales C generees comme lignes de matrice et marquees `Non applicable`. `chat_team`, `chat_buffer` et `chat_bufferlen` sont portes comme champs de `client_key_state_t`.
- Runtime: `Key_Event` est l'entree normale des transitions clavier; il route console, chat, menu, bindings et releases, et `Key_ClearStates`/`Key_GetKey` restent atteignables via menu/runtime et hooks host.
- apps/web: `apps/web/src/full-game.ts` route les evenements DOM et HUD par `Key_Event`, consomme `anykeydown` pour le flux input et lit `keybindings` pour les bindings HUD; la logique web ne remplace pas le runtime clavier.
- renderer-three: non applicable pour ce lot; ces entites produisent input, commandes, console/chat et etat clavier, sans modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene a consommer directement par `renderer-three`.
- Tests lances:
  - `npm run verify:keys` OK.
  - `npm run verify:keys:header` OK.
  - `npm run verify:full-game:input-bindings` OK.
  - `npm run verify:web-render-order` OK.
  - `npm run verify:console` OK.
  - `npm run typecheck` OK.
