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

## Session 2026-04-30 - Cmd_Notarget_f

- Lot valide: `Cmd_Notarget_f` et temporaires C associes (`msg`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme gate `deathmatch && !sv_cheats`, bascule XOR `FL_NOTARGET`, messages `notarget ON/OFF`, retour sans effet si cheats interdits.
- Branchement runtime: `ClientCommand` dispatch `notarget`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `sv_user`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` passe par le pont client/serveur et ne remplace pas la logique runtime. `packages/renderer-three` non applicable directement: `FL_NOTARGET` est un flag gameplay consomme par IA/monstres/armes, sans sortie renderer directe; les effets visibles restent ceux des snapshots/entites existants.
- Corrections: aucune correction TS necessaire; commentaire d'en-tete existant verifie pour `Cmd_Notarget_f`.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:bridge`; controle cible `npx tsx` inline pour ON/OFF et refus deathmatch sans cheats.
- Blocages: controle cible relance apres un premier import incorrect de `FL_NOTARGET` depuis `packages/game/src/index.ts`; passage OK en important le flag depuis `packages/game/src/g_local.ts`.
- Prochain lot recommande: `Cmd_Noclip_f` et temporaires locaux associes (`msg`).

## Session 2026-04-30 - Cmd_Noclip_f

- Lot valide: `Cmd_Noclip_f` et temporaire C associe (`msg`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme gate `deathmatch && !sv_cheats`, meme bascule `MOVETYPE_NOCLIP` -> `MOVETYPE_WALK` sinon `MOVETYPE_NOCLIP`, messages `noclip OFF/ON`, retour sans effet si cheats interdits.
- Branchement runtime: `ClientCommand` dispatch `noclip`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `sv_user`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` transmet les commandes par le pont client/serveur et charge l'API game; aucune logique web parallele pour `noclip`. `packages/renderer-three` non applicable directement: `movetype` pilote simulation/physique et prediction, sans sortie renderer propre; les effets visibles passent par snapshots, camera et etats client existants.
- Corrections: aucune correction TS necessaire; commentaire d'en-tete existant verifie pour `Cmd_Noclip_f`.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:bridge`; `npm run typecheck`; controle cible `npx tsx` inline pour refus deathmatch sans cheats puis activation avec cheats.
- Blocages: aucun pour le lot. Deux premiers essais du controle inline ont echoue sur le harnais local uniquement (`tsx -e` resolution `.js`, puis import `PRINT_HIGH` depuis le mauvais index), relance OK avec imports `.ts` et `PRINT_HIGH` depuis `qcommon`.
- Prochain lot recommande: `Cmd_Use_f` et temporaires locaux associes (`index`, `it`, `s`).

## Session 2026-04-30 - Cmd_Use_f

- Lot valide: `Cmd_Use_f` et temporaires C associes (`index`, `it`, `s`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme sequence `gi.args`/`FindItem`, rejet item inconnu, rejet item sans callback `use`, controle inventaire via `ITEM_INDEX`, puis dispatch `it->use` via `callItemUse`.
- Branchement runtime: `ClientCommand` dispatch `use`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `sv_user`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` transmet `use` comme commande client forwardee via le pont full-game et ne remplace pas la logique runtime. `packages/renderer-three` non applicable directement: `Cmd_Use_f` modifie l'etat gameplay/inventaire/arme/powerup; les effets visibles passent ensuite par snapshots, stats HUD, effets joueur ou modele d'arme existants.
- Corrections: aucune correction TS necessaire; commentaire d'en-tete existant verifie pour `Cmd_Use_f`.
- Tests de reference: controle cible inline `npx tsx` pour branches unknown/not usable/out/success; `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:bridge`; `npm run verify:full-game:commands`; `npm run typecheck`.
- Blocages: aucun pour le lot.
- Prochain lot recommande: `Cmd_Drop_f` et temporaires locaux associes (`index`, `it`, `s`).

## Session 2026-05-01 - Cmd_Drop_f

- Lot valide: `Cmd_Drop_f` et temporaires C associes (`index`, `it`, `s`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme sequence `gi.args`/`FindItem`, rejet item inconnu, rejet item sans callback `drop`, controle inventaire via `ITEM_INDEX`, puis dispatch `it->drop` via `callItemDrop`.
- Branchement runtime: `ClientCommand` dispatch `drop`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `sv_user`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` transmet `drop` comme commande client forwardee via le pont full-game et ne remplace pas la logique runtime. `packages/renderer-three` consomme les sorties visibles par le chemin snapshot/client refresh: le drop cree une entite item avec `modelindex`, `effects` et `renderfx`, transformee en refresh entity puis synchronisee par `refresh-entity-sync`.
- Corrections: commentaire d'en-tete complete pour `Cmd_Drop_f`; test cible ajoute dans `scripts/verify/quake2-g-cmds.ts` pour branches unknown/not dropable/out/success.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:commands`; `npm run verify:full-game:bridge`; `npm run verify:refresh-entity:alias-flags`; `npm run typecheck`.
- Blocages: aucun pour le lot.
- Prochain lot recommande: `Cmd_Inven_f` et temporaire local associe (`i`).

## Session 2026-05-01 - Cmd_Inven_f

- Lot valide: `Cmd_Inven_f` et temporaire C associe (`i`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme remise a false de `showscores`/`showhelp`, meme bascule de `showinventory`, meme emission `svc_inventory` suivie de `MAX_ITEMS` shorts et `unicast(ent, true)` seulement a l'ouverture.
- Branchement runtime: `ClientCommand` dispatch `inven`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `SV_ExecuteUserCommand`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` transmet les commandes par le pont client/serveur et ne remplace pas la logique game; le flux visible passe par `svc_inventory`, `CL_ParseInventory`, `STAT_LAYOUTS` et `CL_DrawInventory`. `packages/renderer-three` non applicable directement: l'inventaire est un overlay HUD client, sans entite/modele/particule/beam/dlight/scene 3D produit par cette commande.
- Corrections: commentaire d'en-tete complete pour `Cmd_Inven_f`; test cible renforce dans `scripts/verify/quake2-g-cmds.ts` pour ouverture, fermeture, `MAX_ITEMS`, `svc_inventory` et `unicast` fiable.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:p-hud`; `npm run verify:full-game:commands`; `npm run verify:full-game:bridge`; `npm run verify:full-game:demo-cleanup`; `npm run verify:full-game:three-renderer`; `npm run typecheck`.
- Blocages: `npm run verify:cl-parse`, `npm run verify:cl-scrn` et `npm run verify:screen:header` echouent avant execution sur imports obsoletes `packages/client/src/parse.js`/`screen.js`; non corrige hors perimetre.
- Prochain lot recommande: `Cmd_InvUse_f` et temporaire local associe (`it`).

## Session 2026-05-01 - Cmd_InvUse_f

- Lot valide: `Cmd_InvUse_f` et temporaire C associe (`it`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme appel initial a `ValidateSelectedItem`, meme rejet `selected_item == -1`, meme rejet item sans callback `use`, puis dispatch `it->use` via `callItemUse`.
- Branchement runtime: `ClientCommand` dispatch `invuse`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `SV_ExecuteUserCommand`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` transmet les commandes par `createClientSendCmdBridge` et charge l'API game, sans logique parallele pour `invuse`. `packages/renderer-three` consomme les effets visibles indirects par le chemin client refresh: selection/usage d'arme met a jour `player_state_t.gunindex` et les refresh entities de l'arme vue; les overlays inventaire/HUD restent cote client.
- Corrections: commentaire d'en-tete complete pour `Cmd_InvUse_f`; test cible ajoute dans `scripts/verify/quake2-g-cmds.ts` pour selection vide, item non utilisable, selection perimee et callback d'arme.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:commands`; `npm run verify:full-game:bridge`; `npm run verify:full-game:three-renderer`; `npm run typecheck`.
- Blocages: aucun pour le lot.
- Prochain lot recommande: `Cmd_WeapPrev_f` et temporaires locaux associes (`it`, `selected_weapon`).
