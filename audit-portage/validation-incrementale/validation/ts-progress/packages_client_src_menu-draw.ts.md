# Progress TS - packages/client/src/menu-draw.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 7 symboles (`M_Banner` a `M_DrawTextBox`).
- Prochain lot recommande: aucun.

## Preuves de session

- Matrice C/H lue: `audit-portage/validation-incrementale/validation/matrices/client_menu.c.md`.
- Source C lue: `Quake-2-master/client/menu.c` pour `M_Banner`, `M_DrawCharacter`, `M_Print`, `M_PrintWhite`, `M_DrawPic`, `M_DrawCursor` et `M_DrawTextBox`.
- Doublons recherches: aucun autre symbole TS porteur des memes `Original name` dans `packages/`.
- Usages verifies: `packages/client/src/index.ts`, `packages/client/src/menu.ts`, `packages/client/src/menu-main-game.ts`, `packages/client/src/menu-multiplayer.ts`, `packages/client/src/menu-options-keys.ts`, `packages/client/src/menu-player-config.ts`.

## Decisions

- Les 7 symboles sont `Category: Ported`, exportes depuis le package client attendu, avec entetes `Original name` et `Source` coherents.
- La matrice C/H `client_menu.c.md` marque les 7 fonctions comme `Valide` et designe `packages/client/src/menu-draw.ts` comme fichier cible proprietaire; statut TS `Couvert C/H`.
- `M_DrawCursor` conserve le cache statique C via `ClientMenuState.cursorPicsCached` et `NUM_CURSOR_FRAMES`; le test menu couvre l'enregistrement unique des curseurs.
- Ces helpers produisent des appels `ref.Draw*` consommes par le runtime menu; `apps/web` et `renderer-three` restent des adaptateurs de presentation, sans ownership menu a deplacer dans ce lot.

## Tests

- `npm run verify:menu`

## Blocages

- Aucun.
