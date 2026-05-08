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

Valider `menufield_s`, `menuslider_s`, `menulist_s`, `menuaction_s`, `menuseparator_s` et leurs champs, sans traiter les prototypes de fonctions.
