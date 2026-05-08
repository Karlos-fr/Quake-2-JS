# Progress - Quake-2-master/client/keys.h

## Etat courant

- Statut: Termine
- Dernier lot valide: macros keypad `K_KP_HOME` a `K_KP_PLUS`, `K_PAUSE`, macros souris/joystick/AUX/molette, globals externes et prototypes declares dans `client/keys.h`.
- Matrice: `audit-portage/validation-incrementale/validation/matrices/client_keys.h.md`
- Cible TS proprietaire: `packages/client/src/keys.ts`

## Preuves de session

- Comparaison source: `Quake-2-master/client/keys.h`, avec croisements runtime dans `Quake-2-master/client/keys.c`, `menu.c`, `qmenu.c`, `console.c`, `cl_input.c`, `cl_inv.c`, `cl_main.c` et les entrees plateforme `win32`.
- Comparaison cible: `packages/client/src/keys.ts`, `packages/client/src/index.ts`, `packages/client/src/menu-runtime.ts`, `packages/client/src/qmenu.ts`, `packages/client/src/console.ts`, `packages/client/src/cl_input.ts`, `packages/client/src/cl_main.ts`, `apps/web/src/full-game.ts`.
- Runtime: constantes exportees et consommees par `Key_Event`, `Key_Console`, `Key_Message`, `Key_Init`, `Key_ClearStates`, `Key_GetKey`, menus, qmenu, bindings, inventaire et ecriture config. Les globals C externes sont portes comme champs de `client_key_state_t` dans un contexte explicite.
- apps/web: keypad, pause, souris et molette sont mappes depuis les evenements DOM/pointer/wheel vers `Key_Event`; `anykeydown` et `keybindings` sont consommes par le flux full-game/HUD.
- renderer-three: non applicable justifie; `keys.h` fournit uniquement des codes d'entree, etats de binding/chat et prototypes input. Ces entites ne produisent pas directement de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene.
- Tests lances:
  - `npm run verify:keys`
  - `npm run verify:keys:header`
  - `npm run verify:full-game:input-bindings`
  - `npm run verify:menu`
  - `npm run verify:qmenu`
  - `npm run typecheck`

## Decisions

- Les commentaires d'en-tete de fonction sont presents pour les prototypes declares par `keys.h`; `Key_Event`, `Key_ClearStates` et `Key_GetKey` ont ete ajoutes pendant cette session.
- Aucun doublon proprietaire trouve pour les constantes ou prototypes du header: ownership conserve dans `packages/client/src/keys.ts`, reexport dans `packages/client/src/index.ts`.
- Le renommage des globals C vers champs de contexte est volontaire et documente par l'en-tete de `client_key_state_t`; la matrice pointe vers les champs cibles.

## Prochain lot recommande

- Aucun lot restant dans `client_keys.h.md`: toutes les lignes sont `Valide`.
