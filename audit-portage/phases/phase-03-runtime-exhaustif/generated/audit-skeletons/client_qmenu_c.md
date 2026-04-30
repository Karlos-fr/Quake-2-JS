# Inventaire runtime Phase 03 - Quake-2-master/client/qmenu.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/qmenu.ts
- Cibles TS declarees : packages/client/src/qmenu.ts, packages/client/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | Action_DoEnter | 26 | a-auditer | |
| function | Action_Draw | 27 | a-auditer | |
| function | Menu_DrawStatusBar | 28 | a-auditer | |
| function | Menulist_DoEnter | 29 | a-auditer | |
| function | MenuList_Draw | 30 | a-auditer | |
| function | Separator_Draw | 31 | a-auditer | |
| function | Slider_DoSlide | 32 | a-auditer | |
| function | Slider_Draw | 33 | a-auditer | |
| function | SpinControl_DoEnter | 34 | a-auditer | |
| function | SpinControl_Draw | 35 | a-auditer | |
| function | SpinControl_DoSlide | 36 | a-auditer | |
| macro | RCOLUMN_OFFSET | 38 | a-auditer | |
| macro | LCOLUMN_OFFSET | 39 | a-auditer | |
| macro | VID_WIDTH | 44 | a-auditer | |
| macro | VID_HEIGHT | 45 | a-auditer | |
| macro | Draw_Char | 47 | a-auditer | |
| macro | Draw_Fill | 48 | a-auditer | |
| function | Action_DoEnter | 50 | a-auditer | |
| function | Action_Draw | 56 | a-auditer | |
| function | Menu_DrawString | 63 | a-auditer | |
| function | Menu_DrawStringR2L | 70 | a-auditer | |
| function | Field_DoEnter | 76 | a-auditer | |
| function | Field_Draw | 86 | a-auditer | |
| global | i | 88 | a-auditer | |
| global | tempbuffer | 89 | a-auditer | |
| global | offset | 112 | a-auditer | |
| global | offset | 117 | a-auditer | |
| function | Field_Key | 134 | a-auditer | |
| global | keydown | 136 | a-auditer | |
| global | cbd | 200 | a-auditer | |
| function | Menu_AddItem | 265 | a-auditer | |
| function | Menu_AdjustCursor | 287 | a-auditer | |
| function | Menu_Center | 335 | a-auditer | |
| global | height | 337 | a-auditer | |
| function | Menu_Draw | 345 | a-auditer | |
| global | i | 347 | a-auditer | |
| function | Menu_DrawStatusBar | 407 | a-auditer | |
| function | Menu_DrawStatusBar | 416 | a-auditer | |
| global | l | 420 | a-auditer | |
| global | maxrow | 421 | a-auditer | |
| global | maxcol | 422 | a-auditer | |
| global | col | 423 | a-auditer | |
| function | Menu_DrawString | 434 | a-auditer | |
| global | i | 436 | a-auditer | |
| function | Menu_DrawStringDark | 444 | a-auditer | |
| global | i | 446 | a-auditer | |
| function | Menu_DrawStringR2L | 454 | a-auditer | |
| global | i | 456 | a-auditer | |
| function | Menu_DrawStringR2LDark | 464 | a-auditer | |
| global | i | 466 | a-auditer | |
| function | Menu_ItemAtCursor | 474 | a-auditer | |
| function | Menu_SelectItem | 482 | a-auditer | |
| function | Field_DoEnter | 491 | a-auditer | |
| function | Menu_SetStatusBar | 506 | a-auditer | |
| function | Menu_SlideItem | 511 | a-auditer | |
| function | Menu_TallySlots | 529 | a-auditer | |
| global | i | 531 | a-auditer | |
| global | total | 532 | a-auditer | |
| global | nitems | 538 | a-auditer | |
| function | Menulist_DoEnter | 555 | a-auditer | |
| global | start | 557 | a-auditer | |
| function | MenuList_Draw | 567 | a-auditer | |
| global | y | 570 | a-auditer | |
| function | Separator_Draw | 586 | a-auditer | |
| function | Slider_DoSlide | 592 | a-auditer | |
| macro | SLIDER_RANGE | 605 | a-auditer | |
| function | Slider_Draw | 607 | a-auditer | |
| global | i | 609 | a-auditer | |
| function | SpinControl_DoEnter | 628 | a-auditer | |
| function | SpinControl_DoSlide | 638 | a-auditer | |
| function | SpinControl_Draw | 651 | a-auditer | |
| global | buffer | 653 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

