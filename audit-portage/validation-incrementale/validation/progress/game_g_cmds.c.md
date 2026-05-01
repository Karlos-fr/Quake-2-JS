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

## Session 2026-05-01 - Cmd_WeapPrev_f

- Lot valide: `Cmd_WeapPrev_f` et temporaires C associes (`it`, `selected_weapon`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme retour si `pers.weapon` absent, meme calcul `selected_weapon = ITEM_INDEX(cl->pers.weapon)`, meme scan avant `(selected_weapon + i) % MAX_ITEMS`, memes filtres inventaire/callback `use`/`IT_WEAPON`, puis dispatch `it->use` via `callItemUse`.
- Branchement runtime: `ClientCommand` dispatch `weapprev`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `SV_ExecuteUserCommand`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` transmet les commandes par `createClientSendCmdBridge` et charge l'API game, sans logique parallele pour `weapprev`. `packages/renderer-three` consomme les effets visibles indirects par le chemin arme vue/HUD: le changement d'arme met a jour `client.newweapon`, puis `pers.weapon`, `player_state_t.gunindex` et les refresh entities d'arme.
- Corrections: commentaire d'en-tete complete pour `Cmd_WeapPrev_f`; test cible ajoute dans `scripts/verify/quake2-g-cmds.ts` pour absence d'arme, scan depuis `selected_weapon` et dispatch `weapprev`.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:commands`; `npm run verify:full-game:bridge`; `npm run verify:p-weapon`; `npm run verify:refresh-entity:weapon`; `npm run verify:full-game:three-renderer`; `npm run typecheck`.
- Blocages: aucun pour le lot.
- Prochain lot recommande: `Cmd_WeapNext_f` et temporaires locaux associes (`it`, `selected_weapon`).

## Session 2026-05-01 - Cmd_WeapNext_f

- Lot valide: `Cmd_WeapNext_f` et temporaires C associes (`it`, `selected_weapon`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c`, `Quake-2-master/game/p_weapon.c`, `packages/game/src/g_cmds.ts` et `packages/game/src/p_weapon.ts`; meme retour si `pers.weapon` absent, meme calcul `selected_weapon = ITEM_INDEX(cl->pers.weapon)`, meme scan arriere `(selected_weapon + MAX_ITEMS - i) % MAX_ITEMS`, memes filtres inventaire/callback `use`/`IT_WEAPON`, meme dispatch `it->use` via `callItemUse`, et meme test de succes sur `pers.weapon == it` plutot que sur `newweapon`.
- Branchement runtime: `ClientCommand` dispatch `weapnext`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `SV_ExecuteUserCommand`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` transmet les commandes par `createClientSendCmdBridge` et charge l'API game, sans logique parallele pour `weapnext`. `packages/renderer-three` consomme les effets visibles indirects par le chemin arme vue/HUD: le changement d'arme met a jour `client.newweapon`, puis `pers.weapon`, `player_state_t.gunindex` et les refresh entities d'arme.
- Corrections: commentaire d'en-tete complete pour `Cmd_WeapNext_f`; test cible ajoute dans `scripts/verify/quake2-g-cmds.ts` pour absence d'arme, scan arriere depuis `selected_weapon`, subtilite `pers.weapon`/`newweapon`, et dispatch `weapnext`.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:commands`; `npm run verify:full-game:bridge`; `npm run verify:refresh-entity:weapon`; `npm run verify:full-game:three-renderer`; `npm run typecheck`.
- Blocages: `npm run verify:p-weapon` echoue hors perimetre sur `Hand grenade no-ammo should select the next available weapon: attendu Rocket Launcher, recu Shotgun`; non corrige dans ce lot.
- Prochain lot recommande: `Cmd_WeapLast_f` et temporaires locaux associes (`index`, `it`).

## Session 2026-05-01 - Cmd_WeapLast_f

- Lot valide: `Cmd_WeapLast_f` et temporaires C associes (`index`, `it`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme retour si `pers.weapon` ou `pers.lastweapon` absent, meme calcul `index = ITEM_INDEX(lastweapon)`, meme rejet si inventaire absent, callback `use` absent ou item non `IT_WEAPON`, puis dispatch `it->use` via `callItemUse`.
- Branchement runtime: `ClientCommand` dispatch `weaplast`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `SV_ExecuteUserCommand`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` transmet les commandes par `createClientSendCmdBridge` et charge l'API game, sans logique parallele pour `weaplast`. `packages/renderer-three` consomme les effets visibles indirects par le chemin arme vue/HUD: le changement d'arme met a jour `client.newweapon`, puis `pers.weapon`, `player_state_t.gunindex` et les refresh entities d'arme.
- Corrections: commentaire d'en-tete complete pour `Cmd_WeapLast_f`; test cible ajoute dans `scripts/verify/quake2-g-cmds.ts` pour absence d'arme courante, absence de derniere arme, inventaire absent, item sans `use`, item utilisable non-weapon, callback d'arme et dispatch `weaplast`.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:commands`; `npm run verify:full-game:bridge`; `npm run verify:p-weapon`; `npm run verify:refresh-entity:weapon`; `npm run verify:full-game:three-renderer`; `npm run typecheck`.
- Blocages: aucun pour le lot.
- Prochain lot recommande: `Cmd_InvDrop_f` et temporaire local associe (`it`).

## Session 2026-05-01 - Cmd_InvDrop_f

- Lot valide: `Cmd_InvDrop_f` et temporaire C associe (`it`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme appel initial a `ValidateSelectedItem`, meme rejet `selected_item == -1`, meme rejet item sans callback `drop`, puis dispatch `it->drop` via `callItemDrop`. Subtilite verifiee: `ValidateSelectedItem` rescane selon les items utilisables, mais un slot ammo deja selectionne et possede reste droppable comme en C.
- Branchement runtime: `ClientCommand` dispatch `invdrop`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `SV_ExecuteUserCommand`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` transmet les commandes par `createClientSendCmdBridge` et charge l'API game, sans logique parallele pour `invdrop`. `packages/renderer-three` consomme les sorties visibles indirectes du drop par le chemin snapshot/client refresh: l'entite item creee porte modele/effets/renderfx et passe par `refresh-entity-sync`.
- Corrections: commentaire d'en-tete complete pour `Cmd_InvDrop_f`; test cible ajoute dans `scripts/verify/quake2-g-cmds.ts` pour selection vide, item non droppable, selection perimee, ammo selectionnee, callback drop et dispatch `invdrop`.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:commands`; `npm run verify:full-game:bridge`; `npm run verify:refresh-entity:alias-flags`; `npm run verify:full-game:three-renderer`; `npm run typecheck`.
- Blocages: aucun pour le lot.
- Prochain lot recommande: `Cmd_Kill_f`.

## Session 2026-05-01 - Cmd_Kill_f

- Lot valide: `Cmd_Kill_f`.
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme garde `(level.time - respawn_time) < 5`, meme suppression `FL_GODMODE`, meme mise a zero de `health`, meme `MOD_SUICIDE`, puis meme passage par `player_die` avec un dommage massif.
- Branchement runtime: `ClientCommand` dispatch `kill`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `SV_ExecuteUserCommand`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` transmet les commandes client par le pont runtime et ne remplace pas la logique suicide. `packages/renderer-three` consomme les effets visibles indirects via le chemin snapshot/client refresh: `player_die` pose l'etat mort, le mouvement toss, les frames/sons/gibs eventuels et la synchronisation entite joueur existante.
- Corrections: commentaire d'en-tete complete pour `Cmd_Kill_f`; test cible ajoute dans `scripts/verify/quake2-g-cmds.ts` pour la garde de 5 secondes, la suppression de godmode, `MOD_SUICIDE`, le passage `player_die` et le dispatch `kill`.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:commands`; `npm run verify:full-game:bridge`; `npm run verify:full-game:three-renderer`; `npm run typecheck`.
- Blocages: aucun pour le lot.
- Prochain lot recommande: `Cmd_PutAway_f`.

## Session 2026-05-01 - Cmd_PutAway_f

- Lot valide: `Cmd_PutAway_f`.
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme remise a false de `showscores`, `showhelp` et `showinventory`. Le guard TS `!client` reste defensif pour les adapters runtime et ne change pas le flux C attendu pour une entite client valide.
- Branchement runtime: `ClientCommand` dispatch `putaway`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `SV_ExecuteUserCommand`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` et le client envoient `cmd putaway` depuis Escape quand `STAT_LAYOUTS` indique un overlay; le pont full-game transmet ensuite la commande au runtime porte, sans logique gameplay parallele. `packages/renderer-three` non applicable directement: `Cmd_PutAway_f` ferme des overlays HUD client/game, sans entite visible, modele, particule, beam, dlight ou donnee scene 3D.
- Corrections: commentaire d'en-tete complete pour `Cmd_PutAway_f`; test cible ajoute dans `scripts/verify/quake2-g-cmds.ts` pour fermeture directe des trois overlays et dispatch `putaway`.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:commands`; `npm run verify:full-game:bridge`; `npm run typecheck`.
- Blocages: aucun pour le lot.
- Prochain lot recommande: `PlayerSort`, `Cmd_Players_f` et temporaires locaux associes (`i`, `count`, `small`, `large`, `index`) si le lot reste raisonnable; sinon commencer par `PlayerSort` seul.

## Session 2026-05-01 - PlayerSort / Cmd_Players_f

- Lot valide: `PlayerSort`, `Cmd_Players_f` et temporaires C associes (`i`, `count`, `small`, `large`, `index`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c` et `packages/game/src/g_cmds.ts`; meme collecte des clients connectes, meme tri ascendant par `STAT_FRAGS`, meme format `%3i %s\n`, meme garde de paquet `1280 - 100`, meme suffixe `...\n` et meme resume final `%i players`.
- Branchement runtime: `ClientCommand` dispatch `players` avant la garde intermission, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `SV_ExecuteUserCommand`/`ge.ClientCommand`.
- Integration web/renderer: `apps/web` transmet les commandes client par `createClientSendCmdBridge` et ne remplace pas la logique `players`; la sortie est un `cprintf` console/HUD client. `packages/renderer-three` non applicable directement: aucune entite visible, modele, particule, beam, dlight, camera ou donnee scene 3D n'est produite par cette commande.
- Corrections: commentaires d'en-tete completes pour `PlayerSort` et `Cmd_Players_f`; test cible ajoute dans `scripts/verify/quake2-g-cmds.ts` pour tri direct, impression `players`, exclusion des clients deconnectes et dispatch `ClientCommand`.
- Tests de reference: `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:commands`; `npm run verify:full-game:bridge`; `npm run verify:full-game:three-renderer`; `npm run typecheck`.
- Blocages: aucun pour le lot.
- Prochain lot recommande: `Cmd_Wave_f` et temporaire local associe (`i`).

## Session 2026-05-01 - Cmd_Wave_f

- Lot valide: `Cmd_Wave_f` et temporaire C associe (`i`).
- Verification: comparaison C/TS effectuee contre `Quake-2-master/game/g_cmds.c`, `Quake-2-master/game/m_player.h`, `packages/game/src/g_cmds.ts` et `packages/game/src/m_player.ts`; meme lecture `atoi(gi.argv(1))`, meme refus si `PMF_DUCKED`, meme refus si `anim_priority > ANIM_WAVE`, meme passage a `ANIM_WAVE`, memes messages `flipoff`/`salute`/`taunt`/`wave`/`point`, memes frames de depart `FRAME_*01 - 1` et memes `anim_end`.
- Branchement runtime: `ClientCommand` dispatch `wave`, relaye depuis `g_main.ClientCommand` et `GetGameApiFunction`, atteignable via `SV_ExecuteUserCommand`/`ge.ClientCommand`; cote client, `CL_InitLocal` enregistre `wave` comme commande forwardee au serveur.
- Integration web/renderer: `apps/web` transmet les commandes par `createClientSendCmdBridge` et charge l'API game, sans logique parallele pour `wave`. `packages/renderer-three` consomme les sorties visibles indirectes: `Cmd_Wave_f` modifie `ent.s.frame`/`anim_end`, `G_SetClientFrame` fait avancer l'animation joueur, puis les frames d'entite passent par snapshots/client refresh vers le renderer.
- Corrections: commentaire d'en-tete complete pour `Cmd_Wave_f` dans `packages/game/src/g_cmds.ts`; aucune correction comportementale necessaire.
- Tests de reference: controle cible inline `npx tsx` pour les cinq gestes, valeur non numerique, defaut, refus ducked, refus priorite haute et dispatch `ClientCommand`; `npm run verify:g-cmds`; `npm run verify:server:user`; `npm run verify:full-game:commands`; `npm run verify:full-game:bridge`; `npm run verify:full-game:three-renderer`; `npm run typecheck`.
- Blocages: aucun pour le lot.
- Prochain lot recommande: `Cmd_Say_f` et temporaires locaux associes (`other`, `p`, `text`), avec `Com_sprintf` si le lot reste coherent.
