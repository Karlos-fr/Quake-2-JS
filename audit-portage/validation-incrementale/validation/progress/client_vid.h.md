# Progress - Quake-2-master/client/vid.h

## Etat

- Statut: Termine
- Lot traite pendant cette session: reliquats lifecycle `VID_Init`, `VID_CheckChanges`, `VID_Shutdown`.
- Entites validees: `vrect_s` via `vrect_t`, `viddef_t`, `viddef_t.width`, `viddef_t.height`, `VID_MenuInit`, `VID_MenuDraw`, `VID_MenuKey`.
- Entites validees pendant cette session: `VID_Init`, `VID_CheckChanges`, `VID_Shutdown`.
- Entites partielles: aucune.

## Preuves de validation

- Source C/H comparee: `Quake-2-master/client/vid.h`, implementations/runtime historiques dans `Quake-2-master/win32/vid_dll.c`, `Quake-2-master/win32/vid_menu.c`, appels depuis `Quake-2-master/client/cl_main.c` et `Quake-2-master/client/menu.c`.
- Cible TS comparee: `packages/client/src/vid.ts`, `packages/client/src/vid-menu.ts`, `packages/client/src/cl_scrn.ts`, `packages/client/src/cl_main.ts`, `packages/client/src/menu-misc.ts`.
- Ownership: `vid.ts` est le point d'attache du header; `vrect_t` est defini dans `cl_scrn.ts` car partage avec `screen.h`, puis reexporte par `vid.ts`; le menu concret vit dans `vid-menu.ts` comme adapter de `win32/vid_menu.c`.
- Commentaires d'en-tete verifies et ajustes pour `ClientVidHooks`, `ClientVidContext`, `createVidDef`, `createClientVidContext`, `ClientVidMenuHooks`, `ClientVidMenuController`, `createClientVidMenuController` et `vrect_t`.
- Runtime: `M_Menu_Video_f` appelle `VID_MenuInit`, `VID_MenuDraw` et `VID_MenuKey`; le controleur `vid-menu.ts` reproduit le menu video Win32 via cvars, dessin de la banniere, navigation et retour sonore.
- Runtime: `CL_Init`, `CL_Frame` et `CL_Shutdown` conservent les positions source des hooks video (`onVideoInit`, `onVideoCheckChanges`, `onVideoShutdown`); `apps/web/src/full-game.ts` branche le contexte video vers les wrappers `VID_Init(vid)`, `VID_CheckChanges(vid)` et `VID_Shutdown(vid)`.
- `apps/web`: `full-game.ts` cree `ClientVidContext`, initialise les cvars video web (`vid_ref`, `vid_xpos`, `vid_ypos`, `vid_fullscreen`, `vid_gamma`, `win_noalttab`), enregistre `vid_restart`/`vid_front`, synchronise `vid.viddef` a `LOGICAL_WIDTH`/`LOGICAL_HEIGHT`, route le check video depuis `CL_Frame`, puis route le teardown navigateur via `CL_Shutdown` et `VID_Shutdown`.
- `renderer-three`: le header client ne produit pas directement modeles, frames, particules, beams, dlights, temp entities, areabits, camera ou scene; la sortie visible attendue reste indirecte via dimensions video/refdef et via le contexte renderer `ref_gl/gl_local.h`. `verify:ref-gl-host` confirme la synchronisation renderer existante.

## Tests lances

- `npm run verify:ref-gl-host`: passe.
- `npm run verify:vid:header`: passe et verifie aussi les branchements statiques `apps/web` pour `VID_Init`, `VID_CheckChanges`, `CL_Shutdown` et `VID_Shutdown`.
- `npm run verify:cl-main`: passe.
- `npm run verify:menu`: passe.
- `npm run typecheck`: passe.
- `npm run verify:full-game:three-renderer`: bloque hors lot sur l'assertion deja connue `pointer lock should accept the clicked renderer viewport child`.
- Harnais direct `vid.ts` via `npx tsx -`: passe (`vid-direct: ok`).
- Harnais direct `vid-menu.ts` via `npx tsx -`: passe (`vid-menu-direct: ok`).
- `git diff --check` sur les fichiers touches: passe; avertissements CRLF seulement.

## Corrections appliquees

- `audit-portage/validation-incrementale/validation/matrices/client_vid.h.md`: correction de l'ownership `vrect_t`, correction `width`/`height` en champs de `viddef_t`, statuts mis a jour.
- `packages/client/src/vid.ts`: metadonnees de commentaires ajoutees pour les entites TS nouvelles rattachees au header.
- `packages/client/src/vid-menu.ts`: metadonnees de commentaires ajoutees pour l'adapter menu video.
- `packages/client/src/cl_scrn.ts`: note de portage ajoutant la correspondance `vrect_s` -> `vrect_t`.
- `scripts/verify/quake2-vid-header.ts`: assertions de forme ajoutees pour `vrect_t` et `viddef_t`.
- `apps/web/src/full-game.ts`: branche `VID_Init(vid)`, `VID_CheckChanges(vid)` depuis le hook de frame, et `VID_Shutdown(vid)` via `CL_Shutdown` au teardown navigateur; l'adapter web garde les dimensions logiques et les cvars video en etat.
- `scripts/verify/quake2-vid-header.ts`: assertions statiques ajoutees pour le branchement lifecycle `apps/web`.
- `packages/client/src/cl_main.ts`: typage `getPartialDownloadSize` resserre pour conserver la compatibilite `ClientParseHooks` sous `exactOptionalPropertyTypes`.

## Decisions

- `vrect_s` est valide sous le nom public `vrect_t`: le tag C n'est pas l'API consommee, et le typedef est partage par `vid.h` et `screen.h`.
- `width` et `height` ne sont pas des globals du header; ils sont les champs de `viddef_t`.
- `VID_Init`, `VID_Shutdown` et `VID_CheckChanges` sont valides: le port public, les commentaires, les hooks runtime et le branchement web sont prouves dans cette session.
- `VID_MenuInit`, `VID_MenuDraw` et `VID_MenuKey` sont valides: wrappers, menu runtime, controller web et comportement cle/retour sonore ont ete compares et prouves.

## Prochain lot recommande

Aucun lot restant dans `client_vid.h.md`: toutes les lignes sont `Valide`.

## Proposition AVANCEMENT_GLOBAL

Mettre la ligne `Quake-2-master/client/vid.h` a `Termine` avec `Entites=10`, `Validees=10`, `Partielles=0`, `Manquantes=0`, `Non conformes=0`, `Non applicables=0`, `Progress=progress/client_vid.h.md`, `Prochain lot=Aucun lot restant dans client_vid.h.md: toutes les lignes sont Valide.`

## Consolidation coordinateur - 2026-05-08

- Apres fin du lot parallele `game/g_main.c`, le blocage syntaxique temporaire `packages/game/src/g_main.ts(615,6)` est leve.
- Reverification centrale OK: `npm run typecheck`, `npm run verify:vid:header`, `npm run verify:full-game:server-host`, `npm run verify:full-game:render-source`.
- Blocage restant confirme hors lot: `npm run verify:full-game:three-renderer` echoue sur `pointer lock should accept the clicked renderer viewport child`.
