# Inventaire runtime Phase 03 - Quake-2-master/client/qmenu.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/qmenu.ts
- Cibles TS declarees : packages/client/src/qmenu.ts, packages/client/src/keys.ts, packages/client/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | __QMENU_H__ | 21 | a-auditer | |
| macro | MAXMENUITEMS | 23 | a-auditer | |
| macro | MTYPE_SLIDER | 25 | a-auditer | |
| macro | MTYPE_LIST | 26 | a-auditer | |
| macro | MTYPE_ACTION | 27 | a-auditer | |
| macro | MTYPE_SPINCONTROL | 28 | a-auditer | |
| macro | MTYPE_SEPARATOR | 29 | a-auditer | |
| macro | MTYPE_FIELD | 30 | a-auditer | |
| macro | K_TAB | 32 | a-auditer | |
| macro | K_ENTER | 33 | a-auditer | |
| macro | K_ESCAPE | 34 | a-auditer | |
| macro | K_SPACE | 35 | a-auditer | |
| macro | K_BACKSPACE | 39 | a-auditer | |
| macro | K_UPARROW | 40 | a-auditer | |
| macro | K_DOWNARROW | 41 | a-auditer | |
| macro | K_LEFTARROW | 42 | a-auditer | |
| macro | K_RIGHTARROW | 43 | a-auditer | |
| macro | QMF_LEFT_JUSTIFY | 45 | a-auditer | |
| macro | QMF_GRAYED | 46 | a-auditer | |
| macro | QMF_NUMBERSONLY | 47 | a-auditer | |
| struct | _tag_menuframework | 49 | a-auditer | |
| global | cursor | 52 | a-auditer | |
| global | nitems | 54 | a-auditer | |
| global | nslots | 55 | a-auditer | |
| global | statusbar | 58 | a-auditer | |
| struct | menucommon_s | 64 | a-auditer | |
| global | type | 66 | a-auditer | |
| global | name | 67 | a-auditer | |
| global | cursor_offset | 70 | a-auditer | |
| global | localdata | 71 | a-auditer | |
| global | flags | 72 | a-auditer | |
| global | statusbar | 74 | a-auditer | |
| struct | menufield_s | 82 | a-auditer | |
| global | buffer | 86 | a-auditer | |
| global | cursor | 87 | a-auditer | |
| global | length | 88 | a-auditer | |
| global | visible_length | 89 | a-auditer | |
| global | visible_offset | 90 | a-auditer | |
| struct | menuslider_s | 93 | a-auditer | |
| global | minvalue | 97 | a-auditer | |
| global | maxvalue | 98 | a-auditer | |
| global | curvalue | 99 | a-auditer | |
| global | range | 101 | a-auditer | |
| struct | menulist_s | 104 | a-auditer | |
| global | curvalue | 108 | a-auditer | |
| struct | menuaction_s | 113 | a-auditer | |
| struct | menuseparator_s | 118 | a-auditer | |
| function | Field_Key | 123 | a-auditer | |
| function | Menu_AddItem | 125 | a-auditer | |
| function | Menu_AdjustCursor | 126 | a-auditer | |
| function | Menu_Center | 127 | a-auditer | |
| function | Menu_Draw | 128 | a-auditer | |
| function | Menu_ItemAtCursor | 129 | a-auditer | |
| function | Menu_SelectItem | 130 | a-auditer | |
| function | Menu_SetStatusBar | 131 | a-auditer | |
| function | Menu_SlideItem | 132 | a-auditer | |
| function | Menu_TallySlots | 133 | a-auditer | |
| function | Menu_DrawString | 135 | a-auditer | |
| function | Menu_DrawStringDark | 136 | a-auditer | |
| function | Menu_DrawStringR2L | 137 | a-auditer | |
| function | Menu_DrawStringR2LDark | 138 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

