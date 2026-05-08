# Progress - Quake-2-master/client/qmenu.c

- Source: `Quake-2-master/client/qmenu.c`
- Matrice: `audit-portage/validation-incrementale/validation/matrices/client_qmenu.c.md`
- Cible TS proprietaire: `packages/client/src/qmenu.ts`
- Statut: En cours

## Dernier lot traite

Lot initial large: constantes de colonnes/dimensions/dessin, actions, field enter/draw/key, helpers de menu generiques et draw strings:

- `RCOLUMN_OFFSET`, `LCOLUMN_OFFSET`, `VID_WIDTH`, `VID_HEIGHT`, `Draw_Char`, `Draw_Fill`
- `Action_DoEnter`, `Action_Draw`
- `Field_DoEnter`, `Field_Draw`, `Field_Key`
- `Menu_AddItem`, `Menu_AdjustCursor`, `Menu_Center`, `Menu_Draw`, `Menu_DrawStatusBar`
- `Menu_DrawString`, `Menu_DrawStringDark`, `Menu_DrawStringR2L`, `Menu_DrawStringR2LDark`
- `Menu_ItemAtCursor`, `Menu_SelectItem`, `Menu_SetStatusBar`, `Menu_SlideItem`, `Menu_TallySlots`

## Validation effectuee

- Source C comparee a `packages/client/src/qmenu.ts`.
- Ownership confirme: portage central dans `packages/client/src/qmenu.ts`, re-export dans `packages/client/src/index.ts`.
- Doublons: la matrice contient des doublons generes pour certaines declarations/definitions; les occurrences du lot ont ete validees contre la meme implementation TS.
- Faux positifs locaux marques `Non applicable`: variables locales `i`, `tempbuffer`, `offset`, `cbd`, `height`, `l`, `maxrow`, `maxcol`, `col`, `total`, `nitems`.
- Commentaires d'en-tete verifies; ajoutes dans `packages/client/src/qmenu.ts` pour `Action_DoEnter`, `Action_Draw`, `Field_DoEnter`, `Field_Draw` et `Menu_DrawStatusBar`.
- Runtime: flux atteignable via `M_Draw`/`M_Keydown`, `Default_MenuKey`, les menus portes et `VID_MenuDraw`; draw bas niveau remplace `Draw_Char`/`Draw_Fill` par `emitDrawChar`/`emitDrawFill`.
- `apps/web`: `apps/web/src/full-game.ts` cree `createClientQMenuContext`, branche `getMilliseconds`, clipboard, `onDrawChar` et `onDrawFill`, nettoie les buffers qmenu par frame et appelle `M_Draw`.
- `packages/renderer-three`: applicable comme adaptateur ref bas niveau via `ref-gl-host.ts`/`gl_draw.ts` pour `Draw_Char` et `Draw_Fill`; pas de sortie scene 3D attendue pour ces entites qmenu hors glyphes/fill 2D.

## Tests de reference

- `npm run verify:qmenu` OK
- `npm run verify:qmenu:header` OK
- `npm run verify:full-game:newgame` OK
- `npm run typecheck` OK

## Prochain lot recommande

Traiter la famille widgets de fin de fichier:

- `Menulist_DoEnter`, `MenuList_Draw`, variable locale `start`, variable locale `y`
- `Separator_Draw`
- `Slider_DoSlide`, `SLIDER_RANGE`, `Slider_Draw`, variable locale `i`
- `SpinControl_DoEnter`, `SpinControl_DoSlide`, `SpinControl_Draw`, variable locale `buffer`

Verifier explicitement le rendu visible via `drawChars`/`drawFills`, le branchement `apps/web`, et l'adaptation `renderer-three` pour les glyphes/fills 2D.
