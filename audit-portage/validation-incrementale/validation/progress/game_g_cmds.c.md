# Progress - Quake-2-master/game/g_cmds.c

## Session 2026-04-30

- Lot valide: `ClientTeam`, `OnSameTeam` et temporaires C associes (`p`, `value`, `ent1Team`, `ent2Team`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; branchement runtime verifie via `Cmd_Say_f`, `ClientCommand`, `g_main.ts` et exports `index.ts`.
- Integration web/renderer: aucune reference directe dans `apps/web` ou `packages/renderer-three`; logique gameplay portee dans `packages/game`.
- Corrections: commentaires d'en-tete completes pour `ClientTeam` et `OnSameTeam` dans `packages/game/src/g_cmds.ts`.
- Tests de reference: `npm run verify:g-cmds`; `npm run typecheck`.
- Blocages: aucun pour ce lot.
- Lot valide: `SelectNextItem`, `SelectPrevItem`, `ValidateSelectedItem` et temporaires C associes (`it`; `cl`, `i`, `index` controles dans les boucles TS).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; branchement runtime verifie via `ClientCommand` (`invnext`, `invprev`, `invnextw`, `invprevw`, `invnextp`, `invprevp`), `Cmd_InvUse_f`, `Cmd_InvDrop_f` et les appels depuis `g_items.ts`.
- Integration web/renderer: aucune logique runtime remplacee dans `apps/web`; aucune compensation gameplay dans `packages/renderer-three`.
- Corrections: commentaires d'en-tete completes pour `SelectNextItem`, `SelectPrevItem` et `ValidateSelectedItem` dans `packages/game/src/g_cmds.ts`.
- Tests de reference: `npm run verify:g-cmds`; `npm run typecheck`.
- Blocages: aucun pour ce lot.
- Prochain lot recommande: `Cmd_Give_f` et temporaires locaux associes (`name`, `it`, `index`, `i`, `give_all`, `it_ent`).
- Lot valide: `Cmd_Give_f` et temporaires C associes (`name`, `it`, `index`, `i`, `give_all`, `it_ent`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; branchement runtime verifie via `ClientCommand` (`give`) et relais `g_main.ts`.
- Integration web/renderer: aucune reference directe dans `apps/web` ou `packages/renderer-three`; logique gameplay portee dans `packages/game`.
- Corrections: commentaire d'en-tete complete pour `Cmd_Give_f` dans `packages/game/src/g_cmds.ts`.
- Tests de reference: `npm run verify:g-cmds`; `npm run typecheck`.
- Blocages: aucun pour ce lot.
- Prochain lot recommande: `Cmd_God_f` et temporaires locaux associes (`msg`).

Passe rapide post-validation: controle limite aux lignes deja marquees `Valide` dans la matrice. Branchement runtime confirme via `SV_ExecuteUserCommand` -> `ge.ClientCommand` -> `g_main.ClientCommand` -> `g_cmds.ClientCommand`, avec dispatch `give` et `invnext`/`invprev`/variantes; integration `apps/web` confirmee par `createFullGameServerHost` qui charge `GetGameApiFunction` et par le pont `createClientSendCmdBridge`, sans raccord web specifique attendu pour ces helpers gameplay. `packages/renderer-three` ne porte pas ces commandes directement: les sorties visibles passent par les snapshots/entites/HUD consommes par le render loop, donc aucun statut `Valide` retrograde sur cette passe. Commandes de controle: recherches `rg` ciblees, pas de revalidation C/TS complete.

## Session 2026-04-30 - Cmd_God_f

- Lot valide: `Cmd_God_f` et temporaires C associes (`msg`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme gate `deathmatch && !sv_cheats`, bascule `FL_GODMODE`, message ON/OFF, retour sans effet si cheats interdits.
- Branchement runtime: `ClientCommand` dispatch `god`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `sv_user`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` envoie les commandes par le pont client/serveur et charge l'API game; aucune logique web parallele attendue. `packages/renderer-three` non applicable directement: `Cmd_God_f` modifie un flag gameplay, les effets visibles eventuels passent par snapshots/HUD/player effects.
- Corrections: aucune correction TS necessaire; commentaire d'en-tete existant verifie pour `Cmd_God_f`.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:full-game:bridge`; `npm run verify:server:user`; `npm run typecheck`.
- Blocages: `npm run verify:full-game:gameplay` et `npm run verify:full-game:forward` echouent avant execution sur import obsolete `packages/client/src/main.js`; non corrige hors perimetre.
- Prochain lot recommande: `Cmd_Notarget_f` et temporaires locaux associes (`msg`).
