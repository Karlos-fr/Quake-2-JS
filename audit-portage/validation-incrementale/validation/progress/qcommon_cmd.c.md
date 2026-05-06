# Progress - Quake-2-master/qcommon/cmd.c

## Etat courant

- Statut: En cours
- Dernier lot traite: debut de `cmd.c` jusqu'a `Cbuf_Execute` inclus, avec constantes/etat associes (`MAX_ALIAS_NAME`, `ALIAS_LOOP_COUNT`, `cmd_wait`, `alias_count`, `cmd_text`, buffers defer) et reclassification des variables locales generees par erreur.
- Verdict du lot: Valide pour les entites portees; `Non applicable` pour les variables locales C extraites comme pseudo-globals.

## Preuves session

- Comparaison source: `Quake-2-master/qcommon/cmd.c`
- Cible TS: `packages/qcommon/src/cmd.ts`
- Runtime verifie: `packages/qcommon/src/runtime.ts`, `packages/client/src/cl_main.ts`, `packages/server/src/sv_user.ts`, `apps/web/src/full-game.ts`, `apps/web/src/full-game-server-host.ts`
- `npm run verify:cmd`
- `npm run typecheck`

## Corrections appliquees

- `packages/qcommon/src/cmd.ts`
  - Ajout de `MAX_ALIAS_NAME = 32`.
  - `Cbuf_AddText` aligne sur le C: overflow signale via `onPrint` puis retour sans ajout.
  - `Cmd_Alias_f` refuse les alias dont le nom atteint `MAX_ALIAS_NAME`, comme le C.
- `scripts/verify/quake2-cmd.ts`
  - Ajout de tests pour overflow `Cbuf_AddText` et garde `MAX_ALIAS_NAME`.

## Decisions runtime / web / renderer

- Runtime: integre. `Cmd_Init` est appele par `createQcommonRuntime` et par `apps/web/src/full-game.ts`; `Cbuf_Execute` est appele dans le flux client normal (`CL_Frame`/full-game) et les commandes/defer sont consommees par client/serveur.
- apps/web: integre. `apps/web/src/full-game.ts` initialise et execute le runtime de commandes; `full-game-server-host.ts` branche `Cbuf_CopyToDefer` pour les transitions serveur.
- renderer-three: non applicable pour ce lot. Le buffer de commandes ne produit pas directement modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene; le renderer enregistre seulement ses propres callbacks via l'interface `Cmd_AddCommand`, hors lot `Cbuf_*`.

## Prochain lot recommande

Continuer avec `Cbuf_AddEarlyCommands` et `Cbuf_AddLateCommands`, puis les temporaires locaux associes (`i`, `s`) dans la matrice.
