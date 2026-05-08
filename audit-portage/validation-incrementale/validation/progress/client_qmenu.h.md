# Progress - Quake-2-master/client/qmenu.h

## Session 2026-05-08

- Lot traite: include guard `__QMENU_H__`, constantes `MAXMENUITEMS`, `MTYPE_*`, touches `K_TAB` a `K_RIGHTARROW`, flags `QMF_*`, debut des structures `_tag_menuframework` / `menuframework_s` et `menucommon_s` avec champs associes presents dans la matrice.
- Source comparee: `Quake-2-master/client/qmenu.h`.
- Cibles comparees: `packages/client/src/qmenu.ts`, `packages/client/src/keys.ts`, `packages/client/src/index.ts`, flux menu dans `packages/client/src/menu-runtime.ts`, integration web dans `apps/web/src/full-game.ts`.
- Verdict: lot valide, sauf `__QMENU_H__` marque `Non applicable` car c'est un include guard C sans equivalent necessaire dans un module TypeScript.
- Runtime: integre. Les types/constantes alimentent les menus portes, `Default_MenuKey`, `M_Keydown`, `Key_Event` et les draw commands `qmenu`.
- apps/web: integre. Les touches DOM sont mappees vers les codes portes et routent vers `M_Keydown`/`Key_Event`; les sorties draw menu sont consommees par le canvas 2D de `full-game.ts`.
- renderer-three: non applicable justifie pour ce lot. Les entites validees ne produisent pas de modeles, frames, images 3D, particules, beams, dlights, temp entities, areabits, camera ou scene; le rendu attendu est le menu 2D via l'adapter web.
- Commentaires d'en-tete: aucune fonction traitee dans ce lot; entete fichier `qmenu.ts` verifiee comme source de portage `client/qmenu.c + client/qmenu.h`.
- Tests lances: `npm run verify:qmenu:header`, `npm run verify:keys:header`, `npm run verify:full-game:input-bindings`.
- Corrections code: aucune.

## Prochain lot recommande

Lot termine pendant la reprise 2026-05-08. Aucun lot restant dans `client_qmenu.h.md`: toutes les lignes sont `Valide` ou `Non applicable`.

## Session 2026-05-08 - reprise

- Lot traite: structures `menufield_s`, `menuslider_s`, `menulist_s`, `menuaction_s`, `menuseparator_s`, leurs champs generes (`buffer`, `cursor`, `length`, `visible_length`, `visible_offset`, `minvalue`, `maxvalue`, `curvalue`, `range`) et les prototypes `Field_Key`, `Menu_AddItem`, `Menu_AdjustCursor`, `Menu_Center`, `Menu_Draw`, `Menu_ItemAtCursor`, `Menu_SelectItem`, `Menu_SetStatusBar`, `Menu_SlideItem`, `Menu_TallySlots`, `Menu_DrawString`, `Menu_DrawStringDark`, `Menu_DrawStringR2L`, `Menu_DrawStringR2LDark`.
- Source comparee: `Quake-2-master/client/qmenu.h` et definitions associees dans `Quake-2-master/client/qmenu.c`.
- Cibles comparees: `packages/client/src/qmenu.ts`, `packages/client/src/index.ts`, `packages/client/src/menu-runtime.ts`, menus consommateurs dans `packages/client/src/menu-*.ts`, integration web dans `apps/web/src/full-game.ts`, draw adapter Three dans `packages/renderer-three/src/gl_rmain.ts` et `packages/renderer-three/src/gl_draw.ts`.
- Verdict: fichier clos. Les champs de structures et les prototypes publics du header sont portes et couverts par les tests de session. `__QMENU_H__` reste `Non applicable` avec justification existante.
- Runtime: integre. Les structures alimentent les menus portes; les fonctions sont atteignables via `M_Init`, commandes `menu_*`, `M_PushMenu`, `M_Draw`, `M_Keydown`, `Default_MenuKey` et callbacks menu.
- apps/web: integre. `full-game.ts` cree le contexte qmenu, mappe clipboard/timing/draw hooks, route les touches menu via `Key_Event`/`M_Keydown`, appelle `M_Draw` et consomme les commandes `DrawChar`/`DrawFill`.
- renderer-three: applicable seulement comme adapter de sortie 2D. Les entites du lot produisent du menu/HUD 2D, pas de modeles, frames, particules, beams, dlights, temp entities, areabits, camera ou scene; le renderer expose bien `DrawChar`/`DrawFill` via `refexport_t` et `gl_draw`.
- Commentaires d'en-tete: fonctions publiques verifiees; commentaires `Original name`, `Source`, `Category: Ported`, `Fidelity level`, `Behavior` presents. Les quatre `Menu_DrawString*` documentent maintenant leur adaptation en commande structuree.
- Tests lances: OK `npm run verify:qmenu:header`, OK `npm run verify:qmenu`, OK `npm run verify:full-game:three-renderer`, OK `npm run typecheck`. Bloque hors lot: `npm run verify:menu` echoue sur `scripts/verify/quake2-menu.ts` deja modifie (`rules spincontrol should switch to cooperative` apres changements de scenario de test), et `npm run verify:full-game:input-bindings` echoue sur une assertion textuelle impactee par `apps/web/src/full-game.ts` deja modifie.
- Corrections code: commentaires `Porting notes` ajoutes dans `packages/client/src/qmenu.ts` pour `Menu_DrawString`, `Menu_DrawStringDark`, `Menu_DrawStringR2L`, `Menu_DrawStringR2LDark`.

## Prochain lot recommande

Aucun pour `Quake-2-master/client/qmenu.h`.
