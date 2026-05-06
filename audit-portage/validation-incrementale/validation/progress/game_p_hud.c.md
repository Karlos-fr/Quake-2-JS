# Progress - Quake-2-master/game/p_hud.c

- Statut: Termine
- Dernier lot valide: tout le fichier, soit les fonctions `MoveClientToIntermission`, `BeginIntermission`, `DeathmatchScoreboardMessage`, `DeathmatchScoreboard`, `Cmd_Score_f`, `HelpComputer`, `Cmd_Help_f`, `G_SetStats`, `G_CheckChaseStats`, `G_SetSpectatorStats`.
- Entrees retirees de la matrice: variables locales C generees comme globals (`entry`, `string`, `stringlength`, `sorted`, `sortedscores`, `picnum`, `cl_ent`, `tag`, `sk`, `item`, `power_armor_type`, `i`), non proprietaires de `p_hud.c`.
- Corrections: branchement HUD runtime par defaut ajoute dans `createGameMainContext` pour emettre `svc_layout`, `WriteString` et `unicast` depuis les helpers `p_hud.ts`; `verify:p-hud` couvre ce flux via `ClientCommand score`.
- Tests de reference:
  - `npm run verify:p-hud`
  - `npm run verify:g-main`
  - `npm run verify:full-game:render-source`
  - `npm run verify:full-game:three-renderer`
  - `npm run verify:web-render-order`
  - `npm run typecheck`
- Runtime: integre via `ClientCommand`, `BeginIntermission` depuis target/changelevel, et `ClientEndServerFrame`.
- apps/web: integre via le host full-game, les layouts `svc_layout`, les stats HUD/playerstate et les overlays scoreboard/inventory/help.
- renderer-three: integre pour les sorties visibles attendues via les stats HUD, layouts client, camera/playerstate et draw commands 2D; pas de sortie scene 3D propre a `p_hud.c`.
- Prochain lot recommande: aucun pour `p_hud.c`.
