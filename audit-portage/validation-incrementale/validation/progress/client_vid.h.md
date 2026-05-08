# Progress - Quake-2-master/client/vid.h

## Etat

- Statut: Partiel
- Lot traite pendant cette session: tout `client/vid.h`.
- Entites validees: `vrect_s` via `vrect_t`, `viddef_t`, `viddef_t.width`, `viddef_t.height`, `VID_MenuInit`, `VID_MenuDraw`, `VID_MenuKey`.
- Entites partielles: `VID_Init`, `VID_Shutdown`, `VID_CheckChanges`.

## Preuves de validation

- Source C/H comparee: `Quake-2-master/client/vid.h`, implementations/runtime historiques dans `Quake-2-master/win32/vid_dll.c`, `Quake-2-master/win32/vid_menu.c`, appels depuis `Quake-2-master/client/cl_main.c` et `Quake-2-master/client/menu.c`.
- Cible TS comparee: `packages/client/src/vid.ts`, `packages/client/src/vid-menu.ts`, `packages/client/src/cl_scrn.ts`, `packages/client/src/cl_main.ts`, `packages/client/src/menu-misc.ts`.
- Ownership: `vid.ts` est le point d'attache du header; `vrect_t` est defini dans `cl_scrn.ts` car partage avec `screen.h`, puis reexporte par `vid.ts`; le menu concret vit dans `vid-menu.ts` comme adapter de `win32/vid_menu.c`.
- Commentaires d'en-tete verifies et ajustes pour `ClientVidHooks`, `ClientVidContext`, `createVidDef`, `createClientVidContext`, `ClientVidMenuHooks`, `ClientVidMenuController`, `createClientVidMenuController` et `vrect_t`.
- Runtime: `M_Menu_Video_f` appelle `VID_MenuInit`, `VID_MenuDraw` et `VID_MenuKey`; le controleur `vid-menu.ts` reproduit le menu video Win32 via cvars, dessin de la banniere, navigation et retour sonore.
- Runtime partiel: `CL_Frame`, `CL_Init` et `CL_Shutdown` exposent des hooks video (`onVideoCheckChanges`, `onVideoInit`, `onVideoShutdown`), mais les wrappers `VID_CheckChanges`, `VID_Init` et `VID_Shutdown` ne sont pas branches dans le flux normal pendant cette session.
- `apps/web`: `full-game.ts` cree `ClientVidContext`, initialise `vid.viddef` a `LOGICAL_WIDTH`/`LOGICAL_HEIGHT` et branche `createClientVidMenuController` pour le menu video; les hooks lifecycle `VID_Init`, `VID_CheckChanges`, `VID_Shutdown` restent absents.
- `renderer-three`: le header client ne produit pas directement modeles, frames, particules, beams, dlights, areabits ou scene; la sortie visible attendue est indirecte via `vrect_t`/refdef et via le contexte renderer `ref_gl/gl_local.h`. `ref-gl-host.ts` synchronise bien le `vid` renderer vers draw/rmisc, mais cela ne ferme pas le manque lifecycle client.

## Tests lances

- `npm run verify:ref-gl-host`: passe.
- Harnais direct `vid.ts` via `npx tsx -`: passe (`vid-direct: ok`).
- Harnais direct `vid-menu.ts` via `npx tsx -`: passe (`vid-menu-direct: ok`).
- Harnais statique web/renderer via `npx tsx -`: passe (`vid-web-renderer-static: ok`) et confirme le manque `VID_Init`/`VID_CheckChanges`/`VID_Shutdown` dans `apps/web`.
- `npm run verify:vid:header`: bloque hors lot sur `packages/game/src/g_main.ts:615` (`Expected "}" but found ")"`).
- `npm run verify:menu`: bloque hors lot sur `packages/game/src/g_main.ts:615`.
- `npm run verify:cl-main`: bloque hors lot sur `packages/game/src/g_main.ts:615`.
- `npm run verify:full-game:three-renderer`: bloque hors lot sur l'assertion `pointer lock should accept the clicked renderer viewport child`.
- `npm run typecheck`: bloque hors lot sur `packages/game/src/g_main.ts(615,6): error TS1005: ',' expected`.
- `git diff --check` sur les fichiers touches: passe; avertissements CRLF seulement.

## Corrections appliquees

- `audit-portage/validation-incrementale/validation/matrices/client_vid.h.md`: correction de l'ownership `vrect_t`, correction `width`/`height` en champs de `viddef_t`, statuts mis a jour.
- `packages/client/src/vid.ts`: metadonnees de commentaires ajoutees pour les entites TS nouvelles rattachees au header.
- `packages/client/src/vid-menu.ts`: metadonnees de commentaires ajoutees pour l'adapter menu video.
- `packages/client/src/cl_scrn.ts`: note de portage ajoutant la correspondance `vrect_s` -> `vrect_t`.
- `scripts/verify/quake2-vid-header.ts`: assertions de forme ajoutees pour `vrect_t` et `viddef_t`.

## Decisions

- `vrect_s` est valide sous le nom public `vrect_t`: le tag C n'est pas l'API consommee, et le typedef est partage par `vid.h` et `screen.h`.
- `width` et `height` ne sont pas des globals du header; ils sont les champs de `viddef_t`.
- `VID_Init`, `VID_Shutdown` et `VID_CheckChanges` restent `Partiel`: le port public et les hooks sont presents, mais le branchement runtime attendu depuis `CL_Init`/`CL_Frame`/`CL_Shutdown` et le host web n'est pas ferme.
- `VID_MenuInit`, `VID_MenuDraw` et `VID_MenuKey` sont valides: wrappers, menu runtime, controller web et comportement cle/retour sonore ont ete compares et prouves.

## Prochain lot recommande

Aucun lot restant dans `client_vid.h.md` cote entites `A verifier`. Prochaine action de coordination: traiter le reliquat lifecycle video en branchant ou documentant explicitement `VID_Init(vid)`, `VID_CheckChanges(vid)` et `VID_Shutdown(vid)` dans le flux client/web, puis relancer les tests officiels apres correction des blocages hors lot `packages/game/src/g_main.ts` et `verify:full-game:three-renderer`.

## Proposition AVANCEMENT_GLOBAL

Mettre la ligne `Quake-2-master/client/vid.h` a `Partiel` avec `Entites=10`, `Validees=7`, `Partielles=3`, `Manquantes=0`, `Non conformes=0`, `Non applicables=0`, `Progress=progress/client_vid.h.md`, `Prochain lot=Brancher ou justifier explicitement VID_Init/VID_CheckChanges/VID_Shutdown dans le lifecycle client/web; relancer verify:vid:header, verify:menu, verify:cl-main, verify:full-game:three-renderer et typecheck apres correction des blocages hors lot.`

## Consolidation coordinateur - 2026-05-08

- Apres fin du lot parallele `game/g_main.c`, le blocage syntaxique temporaire `packages/game/src/g_main.ts(615,6)` est leve.
- Reverification centrale OK: `npm run typecheck`, `npm run verify:vid:header`, `npm run verify:full-game:server-host`, `npm run verify:full-game:render-source`.
- Blocage restant confirme hors lot: `npm run verify:full-game:three-renderer` echoue sur `pointer lock should accept the clicked renderer viewport child`.
