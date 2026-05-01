# Progress - Quake-2-master/game/g_main.c

## Dernier lot traite

- 2026-05-01: cvars serveur/commande `sv_cheats`, `flood_msgs`, `flood_persecond`, `flood_waitdelay`, `sv_maplist`.
- 2026-05-01: cvars de vue/arme `gun_x`, `gun_y`, `gun_z`, `run_pitch`, `run_roll`, `bob_up`, `bob_pitch`, `bob_roll`.
- 2026-05-01: cvars `g_select_empty`, `dedicated`, `filterban`, `sv_maxvelocity`, `sv_gravity`, `sv_rollspeed`, `sv_rollangle`.
- 2026-05-01: cvars `fraglimit`, `timelimit`, `password`, `spectator_password`, `maxclients`, `maxspectators`, `maxentities`.
- 2026-05-01: groupe d'etat runtime/cvars `g_edicts`, `deathmatch`, `coop`, `dmflags`, `skill`.
- 2026-04-30: globals initiaux `sm_meat_index`, `snd_fry`, `meansOfDeath`.

## Verdict du lot

- `sv_cheats`: valide. Cvar init portee avec nom `cheats`, default `0` et flags `CVAR_SERVERINFO | CVAR_LATCH`; `ClientCommand` transmet le handle a `g_cmds.ts`, ou les commandes `give`/`god`/`notarget`/`noclip` gardent le gate original `deathmatch && !sv_cheats`.
- `flood_msgs`: valide. Cvar init portee avec default `4` et flags `0`; `ClientCommand` transmet le handle a `g_cmds.ts`, ou `Cmd_Say_f` l'utilise comme fenetre de messages pour la protection flood.
- `flood_persecond`: valide. Cvar init portee avec default `4` et flags `0`; `Cmd_Say_f` compare bien `runtime.time - flood_when[i]` a cette valeur, comme le C compare `level.time` a `flood_persecond->value`.
- `flood_waitdelay`: valide. Cvar init portee avec default `10` et flags `0`; `Cmd_Say_f` applique bien `flood_locktill = runtime.time + flood_waitdelay` et le message de blocage associe.
- `sv_maplist`: valide. Cvar init portee avec default vide et flags `0`; `EndDMLevel` relit le cvar, tokenise avec les separateurs C equivalents, choisit la carte suivante ou reboucle sur la premiere, puis lance l'intermission.
- `gun_x`: valide apres correction. Cvar init portee avec default `0` et flags `0`; `ClientEndServerFrames` transmet maintenant la valeur a `p_view.ts`, qui l'applique dans `SV_CalcGunOffset` sur l'axe right.
- `gun_y`: valide apres correction. Cvar init portee avec default `0` et flags `0`; la valeur est transmise a `SV_CalcGunOffset` pour l'offset forward.
- `gun_z`: valide apres correction. Cvar init portee avec default `0` et flags `0`; la valeur est transmise a `SV_CalcGunOffset` pour l'offset vertical negatif, comme le C.
- `run_pitch`: valide apres correction. Cvar init portee avec default `0.002` et flags `0`; `ClientEndServerFrames` la transmet a `SV_CalcViewOffset` pour le pitch lie a la vitesse.
- `run_roll`: valide apres correction. Cvar init portee avec default `0.005` et flags `0`; `ClientEndServerFrames` la transmet a `SV_CalcViewOffset` pour le roll lie a la vitesse.
- `bob_up`: valide apres correction. Cvar init portee avec default `0.005` et flags `0`; `ClientEndServerFrames` la transmet a `SV_CalcViewOffset` pour le bob vertical borne.
- `bob_pitch`: valide apres correction. Cvar init portee avec default `0.002` et flags `0`; `ClientEndServerFrames` la transmet a `SV_CalcViewOffset` pour le bob pitch.
- `bob_roll`: valide apres correction. Cvar init portee avec default `0.002` et flags `0`; `ClientEndServerFrames` la transmet a `SV_CalcViewOffset` pour le bob roll.
- `g_select_empty`: valide. Cvar init portee avec default `0` et `CVAR_ARCHIVE`; `applyMainCvarsToRuntime` alimente `runtime.g_select_empty`, consomme par `p_weapon.ts` pour autoriser/refuser la selection d'armes sans munitions.
- `dedicated`: valide. Cvar init portee avec default `0` et `CVAR_NOSET`; `ClientCommand` transmet le handle a `g_cmds.ts`, ou le chat echo dedie suit la branche originale.
- `filterban`: valide. Cvar init portee avec default `1` et flags `0`; la commande serveur portee dans `g_svcmds.ts` relit le cvar via `gi.cvar` pour `SV_FilterPacket` et `writeip`.
- `sv_maxvelocity`: partiel. Cvar init portee avec default `2000` et flags `0`; en revanche le consommateur original `g_phys.c` est encore code en TS avec la constante locale `SV_MAXVELOCITY = 2000`, sans lecture du cvar/runtime.
- `sv_gravity`: partiel. Cvar init portee avec default `800` et flags `0`; `runtime.gravity` et PMove client sont branches, et worldspawn applique bien `cvar_set("sv_gravity", ...)`. Reste un ecart cote `g_phys.ts`, qui utilise encore `SV_GRAVITY = 800` pour la physique entite et le seuil de hitsound au lieu d'une valeur runtime/cvar.
- `sv_rollspeed`: valide apres correction. `g_main.ts` cree maintenant le cvar avec default `200` et flags `0`, puis `ClientEndServerFrames` le transmet a `p_view.ts` pour `SV_CalcRoll`.
- `sv_rollangle`: valide apres correction. `g_main.ts` cree maintenant le cvar avec default `2` et flags `0`, puis `ClientEndServerFrames` le transmet a `p_view.ts` pour `SV_CalcRoll`.
- `fraglimit`: valide. Cvar init portee avec default `0` et `CVAR_SERVERINFO`; `CheckDMRules` la relit depuis `G_RunFrame`, parcourt les clients actifs via `runtime.maxclients`, annonce `Fraglimit hit.` puis declenche `EndDMLevel`.
- `timelimit`: valide. Cvar init portee avec default `0` et `CVAR_SERVERINFO`; `CheckDMRules` la relit depuis `G_RunFrame`, compare `level.time >= timelimit * 60`, annonce `Timelimit hit.` puis declenche `EndDMLevel`.
- `password`: partiel. Cvar init portee avec default vide et `CVAR_USERINFO`; en revanche le rejet original des connexions non-spectateur et des sorties de spectator dans `p_client.c` est actuellement delegue a des hooks TS, sans hook par defaut dans `g_main.ts` qui lise `context.cvars.password`.
- `spectator_password`: partiel. Cvar init portee avec default vide et `CVAR_USERINFO`; en revanche le rejet original des connexions/entrees spectator dans `p_client.c` est actuellement delegue a des hooks TS, sans hook par defaut dans `g_main.ts` qui lise `context.cvars.spectator_password`.
- `maxclients`: valide. Cvar init portee avec default `4` et `CVAR_SERVERINFO | CVAR_LATCH`; `applyMainCvarsToRuntime` alimente `runtime.maxclients`/`game.maxclients`, `SpawnEntities` reserve les slots joueurs `1..maxclients`, et les boucles frame/DM/serveur consomment cette valeur.
- `maxspectators`: partiel. Cvar init portee avec default `4` et `CVAR_SERVERINFO`; en revanche le comptage/rejet original des spectateurs en trop dans `p_client.c` est actuellement delegue a des hooks TS, sans hook par defaut dans `g_main.ts` qui lise `context.cvars.maxspectators`.
- `maxentities`: valide. Cvar init portee avec default `1024` et `CVAR_LATCH`; `applyMainCvarsToRuntime` alimente `runtime.maxentities`/`game.maxentities`, `GetGameApi.max_edicts` l'expose, et `G_Spawn` applique la limite d'allocation.
- `g_edicts`: valide. Le pointeur global C est porte comme tableau `context.runtime.entities`, expose par `GetGameApi().edicts`; `SpawnEntities` reconstruit ce tableau avec worldspawn en slot 0, joueurs reserves en `1..maxclients`, entites map ensuite, puis body queue/player trail. Les chemins serveur consomment `ge.edicts`/`ge.num_edicts` pour snapshots, world traces et frames.
- `deathmatch`: valide. Cvar init portee avec default `0` et `CVAR_LATCH`; `applyMainCvarsToRuntime` alimente `runtime.deathmatch`, consomme par spawn filtering, DM rules et gameplay.
- `coop`: valide. Cvar init portee avec default `0` et `CVAR_LATCH`; `applyMainCvarsToRuntime` alimente `runtime.coop`, consomme par spawn/player/gameplay.
- `dmflags`: valide. Cvar init portee avec default `0` et `CVAR_SERVERINFO`; `applyMainCvarsToRuntime` alimente `runtime.dmflags`, consomme par DM rules et flags gameplay.
- `skill`: valide apres correction. `SpawnEntities` force maintenant `skill` au floor borne `0..3` via `gi.cvar_forceset`, comme le C, avant d'appliquer `runtime.skill`.
- `meansOfDeath`: valide. Le global C est porte comme `runtime.meansOfDeath` dans `packages/game/src/runtime.ts`, initialise a `0`, ecrit par `g_combat.ts`/`g_cmds.ts` et lu par `p_client.ts`.
- `sm_meat_index`: partiel. Le comportement consommateur est remplace par une comparaison de chemin de modele dans `g_misc.ts`, mais aucun champ runtime/global explicite ne porte l'index stocke par `g_main.c`/`g_spawn.c`.
- `snd_fry`: partiel. `p_view.ts` utilise directement l'index du son `player/fry.wav` via le registre runtime, mais aucun champ runtime/global explicite ne porte l'index stocke par `g_main.c`/`g_spawn.c`.

## Tests de reference

- `npm run verify:g-main`: ok le 2026-05-01 pour le flux `InitGame`/`EndDMLevel` deja couvert.
- `npm run verify:g-cmds`: ok le 2026-05-01, confirme les branches client-command incluant cheats et flood protection.
- Verification inline TS le 2026-05-01: defaults/flags exacts pour `cheats`, `flood_msgs`, `flood_persecond`, `flood_waitdelay`, `sv_maplist`, et choix `sv_maplist` `q2dm1 -> q2dm2` par `EndDMLevel`.
- `npm run verify:full-game:rules-transitions`: ok le 2026-05-01.
- `npm run verify:full-game:gameplay`: bloque le 2026-05-01 avant execution utile par import manquant `packages/client/src/main.js` dans `scripts/verify/quake2-full-game-gameplay-commands.ts`; non corrige dans ce lot.
- `npm run typecheck`: ok le 2026-05-01.
- `npm run verify:g-main`: ok le 2026-05-01, couverture ajoutee pour defaults/flags `gun_x`, `gun_y`, `gun_z`, `run_pitch`, `run_roll`, `bob_up`, `bob_pitch`, `bob_roll`, et verification que `ClientEndServerFrames` transmet ces cvars a `p_view.ts`.
- `npm run verify:p-view`: ok le 2026-05-01, confirme les fonctions consommatrices `SV_CalcViewOffset`, `SV_CalcGunOffset` et `ClientEndServerFrame`.
- `npm run verify:full-game:three-renderer`: ok le 2026-05-01.
- `npm run verify:refresh-entity:weapon`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.
- `npm run verify:full-game:render-source`: bloque le 2026-05-01 avant execution utile par import manquant `packages/client/src/types.js` dans `scripts/verify/quake2-full-game-render-source.ts`; non corrige dans ce lot.
- `npm run verify:g-main`: ok le 2026-05-01, couverture ajoutee pour defaults/flags `g_select_empty`, `dedicated`, `filterban`, `sv_maxvelocity`, `sv_gravity`, `sv_rollspeed`, `sv_rollangle`, mirroring runtime `g_select_empty`/`sv_gravity`, et passage `sv_rollspeed`/`sv_rollangle` a `ClientEndServerFrames`.
- `npm run verify:g-svcmds`: ok le 2026-05-01, confirme `filterban` dans `SV_FilterPacket` et `writeip`.
- `npm run verify:g-cmds`: ok le 2026-05-01, confirme les branches client-command dont le chat dedie.
- `npm run verify:p-weapon`: ok le 2026-05-01, controle les regressions gameplay armes consommatrices de `runtime.g_select_empty`.
- `npm run verify:p-view`: ok le 2026-05-01, confirme `SV_CalcRoll`/`ClientEndServerFrame`.
- `npm run verify:g-spawn`: ok le 2026-05-01, confirme l'application worldspawn de `sv_gravity`.
- `npm run verify:g-phys`: ok le 2026-05-01, coverage physique existante; l'ecart cvar `sv_maxvelocity`/partiel `sv_gravity` reste documente.
- `npm run typecheck`: ok le 2026-05-01.
- `npm run verify:g-main`: ok le 2026-05-01, couverture ajoutee pour defaults/flags `fraglimit`, `timelimit`, `password`, `spectator_password`, `maxclients`, `maxspectators`, `maxentities`; couvre aussi DM rules frag/time, export `max_edicts` et reservation des edicts joueurs.
- `npm run verify:full-game:rules-transitions`: ok le 2026-05-01, confirme le flux full-game des transitions de regles.
- `npm run typecheck`: ok le 2026-05-01.
- `npm run verify:g-main`: ok le 2026-05-01, couvre export `edicts`, init cvars `deathmatch`/`coop`/`dmflags`/`skill`, clamp/forceset `skill`, `SpawnEntities`, DM rules, `G_RunFrame` et shutdown.
- `npm run typecheck`: ok le 2026-05-01.
- `npm run verify:g-misc`: ok.
- `npm run verify:g-main`: ok apres correction coordinateur de l'import de harness `g-local.js` vers `g_local.js`.
- `npm run verify:p-view`: ok apres correction coordinateur des imports de harness `q-shared.js` vers `q_shared.js` et `g-local.js` vers `g_local.js`.

## Blocages / decisions

- Aucune correction TS necessaire pour ce lot.
- Commentaires verifies: `InitGame`, `ClientCommand` et `EndDMLevel` dans `packages/game/src/g_main.ts`, et `ClientCommand`/commandes consommatrices dans `packages/game/src/g_cmds.ts`.
- `apps/web`: integration jugee presente via `full-game-server-host.ts`, qui instancie le `GetGameApiFunction` porte avec un runtime server-backed; le bridge console/client envoie les commandes au runtime au lieu de dupliquer la logique cheats/flood/maplist. Aucun manque web detecte dans le perimetre de ce lot.
- `packages/renderer-three`: aucune integration directe attendue. Les cvars cheats/flood ne produisent pas de sortie visible; `sv_maplist` declenche une transition de map serveur, puis le renderer consomme uniquement les donnees normales de chargement/refresh apres changement de carte.
- Correction appliquee dans `packages/game/src/g_main.ts`: ajout des handles cvars `gun_x`, `gun_y`, `gun_z`, `run_pitch`, `run_roll`, `bob_up`, `bob_pitch`, `bob_roll`, initialisation C-equivalente, et transmission groupee a `ClientEndServerFrame`.
- Correction appliquee dans `scripts/verify/quake2-g-main.ts`: assertions defaults/flags du lot et effets runtime sur `gunoffset`, `kick_angles` et `viewoffset`.
- Commentaires verifies: `InitGame` et `ClientEndServerFrames` dans `g_main.ts`, `SV_CalcViewOffset`/`SV_CalcGunOffset`/`ClientEndServerFrame` dans `p_view.ts`. Pas d'ajout necessaire.
- `apps/web`: integration jugee presente pour le chemin full-game via le runtime server-backed; le navigateur consomme les `playerstate` produits. Les helpers standalone de demo locale ne remplacent pas cette logique serveur.
- `packages/renderer-three`: pas de cvar directe attendue; le renderer consomme les sorties client/refresh deja derivees des `playerstate` (`viewoffset`, `gunoffset`, `gunangles`).
- Blocage hors lot: `verify:full-game:render-source` echoue sur un import `packages/client/src/types.js` absent avant de tester le flux; laisse ouvert pour le fichier/proprietaire concerne.
- Correction appliquee dans `packages/game/src/g_main.ts`: ajout de `sv_rollspeed`/`sv_rollangle` au contexte cvars, init C-equivalente, et transmission a `ClientEndServerFrame`.
- Correction appliquee dans `scripts/verify/quake2-g-main.ts`: assertions de defaults/flags du lot, mirroring runtime `g_select_empty`/`sv_gravity`, et verification du roll branche par cvars.
- Pas de correction appliquee dans `packages/game/src/g_phys.ts`: `sv_maxvelocity` et le reliquat `sv_gravity` dependent du port de `g_phys.c`, fichier potentiellement traite par un autre agent; statuts gardes `Partiel` avec action suivante explicite.
- `apps/web`: integration jugee presente via `full-game-server-host.ts` et le runtime server-backed. Aucune logique web parallele ne remplace `g_select_empty`, `filterban`, les cvars physiques ou le roll.
- `packages/renderer-three`: pas d'integration directe attendue. Le roll/vue et les entites visibles arrivent via les etats client/serveur deja produits; `filterban`, `dedicated`, `g_select_empty` et les cvars physiques ne produisent pas de sortie renderer directe.
- Correction appliquee dans `scripts/verify/quake2-g-main.ts`: ajout d'assertions ciblees sur les defaults/flags des cvars du lot.
- Pas de correction runtime appliquee pour `password`/`spectator_password`/`maxspectators`: le comportement C depend de `p_client.c` et la version TS actuelle documente explicitement une delegation aux hooks. Une correction fidele toucherait la frontiere `g_main.ts`/`p_client.ts` et doit etre traitee dans un lot dedie ClientConnect/spectator_respawn.
- `apps/web`: integration presente pour les cvars de regles via le runtime server-backed (`full-game-server-host.ts`) et les ecritures de menu/client; aucune logique web parallele ne remplace `CheckDMRules`. Les politiques password/spectator ne sont pas compensees cote web.
- `packages/renderer-three`: aucune integration directe attendue pour ce lot. Les cvars de regles et de capacite n'emettent pas de donnees de rendu; les entites visibles atteignent le renderer via snapshots client/serveur.
- Correction appliquee dans `packages/game/src/g_main.ts`: ajout de la normalisation `skill` au debut de `SpawnEntities`.
- `apps/web`: integration jugee presente via `full-game-server-host.ts`, qui instancie `GetGameApiFunction` avec un runtime serveur-backed; `full-game.ts`/`full-game-command-bridge.ts` seedent ou forcent les cvars menu/newgame sans remplacer la logique gameplay.
- `packages/renderer-three`: pas d'integration directe attendue pour ces globals/cvars. Les entites visibles issues de `g_edicts` passent par le serveur (`SV_BuildClientFrame`/packet entities), puis le client et `apps/web/src/full-game-render-source.ts`; le renderer consomme la source client, pas les globals gameplay.
- Pas de correction appliquee: une correction fidele de `sm_meat_index`/`snd_fry` toucherait probablement `runtime.ts`, `g_spawn.ts`, `g_misc.ts` et `p_view.ts`, donc au-dela du fichier TS cible principal de ce lot.
- `apps/web` et `packages/renderer-three` ne remplacent pas ces globals d'apres la recherche de references.
- Les blocages de harness initiaux ont ete leves cote coordinateur; les statuts `Partiel` restent intentionnels pour absence de champ global/runtime explicite.

## Passe rapide post-validation

- 2026-04-30: controle limite aux lignes deja `Valide` de la matrice. Seul `meansOfDeath` etait concerne; statut conserve `Valide`. Le branchement runtime attendu/reel passe par `runtime.meansOfDeath`, ecrit par `g_combat.ts`/`g_cmds.ts` puis lu par `p_client.ts`. `apps/web` est integre indirectement via `full-game-server-host.ts` qui fournit `GetGameApiFunction` avec un runtime serveur-backed et redirige les sorties visibles via `onPrint`; aucun etat applicatif local n'est attendu. `packages/renderer-three` n'a pas d'integration attendue pour ce global: les recherches ne montrent que des `MOD_` renderer sans rapport avec les modes de mort gameplay, et les sorties visibles de `meansOfDeath` sont des messages/score, pas du rendu.

## Prochain lot recommande

- Continuer avec le prochain symbole `g_main.c` dans la matrice: `SpawnEntities`.
