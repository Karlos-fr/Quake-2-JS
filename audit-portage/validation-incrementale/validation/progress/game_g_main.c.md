# Progress - Quake-2-master/game/g_main.c

## Dernier lot traite

- 2026-05-01: cvars `fraglimit`, `timelimit`, `password`, `spectator_password`, `maxclients`, `maxspectators`, `maxentities`.
- 2026-05-01: groupe d'etat runtime/cvars `g_edicts`, `deathmatch`, `coop`, `dmflags`, `skill`.
- 2026-04-30: globals initiaux `sm_meat_index`, `snd_fry`, `meansOfDeath`.

## Verdict du lot

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

- `npm run verify:g-main`: ok le 2026-05-01, couverture ajoutee pour defaults/flags `fraglimit`, `timelimit`, `password`, `spectator_password`, `maxclients`, `maxspectators`, `maxentities`; couvre aussi DM rules frag/time, export `max_edicts` et reservation des edicts joueurs.
- `npm run verify:full-game:rules-transitions`: ok le 2026-05-01, confirme le flux full-game des transitions de regles.
- `npm run typecheck`: ok le 2026-05-01.
- `npm run verify:g-main`: ok le 2026-05-01, couvre export `edicts`, init cvars `deathmatch`/`coop`/`dmflags`/`skill`, clamp/forceset `skill`, `SpawnEntities`, DM rules, `G_RunFrame` et shutdown.
- `npm run typecheck`: ok le 2026-05-01.
- `npm run verify:g-misc`: ok.
- `npm run verify:g-main`: ok apres correction coordinateur de l'import de harness `g-local.js` vers `g_local.js`.
- `npm run verify:p-view`: ok apres correction coordinateur des imports de harness `q-shared.js` vers `q_shared.js` et `g-local.js` vers `g_local.js`.

## Blocages / decisions

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

- Continuer avec les cvars suivantes de `g_main.c`: `g_select_empty`, `dedicated`, `filterban`, `sv_maxvelocity`, `sv_gravity`, `sv_rollspeed`, `sv_rollangle`.
