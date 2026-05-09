# Progress TS - packages/client/src/vid-menu.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 9 symboles.
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:vid:header`
  - `npm run verify:menu`
  - `npm run typecheck`

## Decisions

- `SOFTWARE_MENU`, `OPENGL_MENU`, `REF_SOFT`, `REF_OPENGL`, `REF_3DFX` et `REF_POWERVR` sont des constantes locales portees directement de `Quake-2-master/win32/vid_menu.c`; aucune matrice C/H n'existe pour ce fichier Win32, donc validation directe par comparaison de source.
- Les proprietaires publics de `VID_MenuInit`, `VID_MenuDraw` et `VID_MenuKey` restent `packages/client/src/vid.ts` via `client/vid.h`; `createClientVidMenuController` est le controleur TypeScript concret branche derriere ces hooks, classe `Category: New`.
- Les interfaces `ClientVidMenuHooks` et `ClientVidMenuController` sont des contrats TypeScript nouveaux, avec `Original name: N/A` et `Source: N/A (...)` explicites.

## Integration

- Runtime: integre via `menu_video` -> `VID_MenuInit` / `M_PushMenu` -> hooks video -> `createClientVidMenuController`.
- apps/web: integre dans `apps/web/src/full-game.ts`, qui instancie le controleur, branche `onMenuInit`, `onMenuDraw`, `onMenuKey` et applique les changements via hook.
- renderer-three: non proprietaire logique; le fichier emet des commandes menu/ref (`DrawGetPicSize`, `DrawPic`, qmenu), le renderer reste adaptateur de rendu.
