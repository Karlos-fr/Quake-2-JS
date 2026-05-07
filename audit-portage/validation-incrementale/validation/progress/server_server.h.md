# Progress - Quake-2-master/server/server.h

## Lot valide pendant cette session

- Dernier lot header `server.h` traite en lot large: `SV_DemoCompleted`, `SV_SendClientMessages`, `SV_Multicast`, `SV_StartSound`, `SV_ClientPrintf`, `SV_BroadcastPrintf`, `SV_BroadcastCommand`, `SV_Nextserver`, `SV_ExecuteClientMessage`, `SV_ReadLevelFile`, `SV_Status_f`, `SV_WriteFrameToClient`, `SV_RecordDemoMessage`, `SV_BuildClientFrame`, `SV_InitGameProgs`, `SV_ShutdownGameProgs`, `SV_InitEdict`, `SV_ClearWorld`, `SV_UnlinkEdict`, `SV_LinkEdict`, `SV_AreaEdicts`, `SV_PointContents`, `SV_Trace`.
- Declaration header orpheline classee `Non applicable`: `SV_Error`, aucune definition C trouvee dans `Quake-2-master/server`; les helpers TS `SV_Error` sont des adapters locaux vers le callback runtime et ne sont pas le port proprietaire d'une definition C.
- Prototypes header et bloc redirect: `SV_ExecuteUserCommand`, `SV_InitOperatorCommands`, `SV_UserinfoChanged`, `Master_Heartbeat`, `SV_InitGame`, `SV_Map`, `SV_PrepWorldFrame`, `redirect_t`, `SV_OUTPUTBUF_LENGTH`, `sv_outputbuf`, `SV_FlushRedirect`.
- Declarations header orphelines classees `Non applicable`: `SV_WriteClientdataToMessage`, `SV_SendServerinfo`, `Master_Packet`.
- Externs/globals header: `net_message`, `sv`, `sv_paused`, `maxclients`, `sv_noreload`, `sv_airaccelerate`, `sv_enforcetime`, `sv_player`.
- Premiers prototypes header coherents avec ce bloc: `SV_FinalMessage`, `SV_DropClient`, `SV_ModelIndex`, `SV_SoundIndex`, `SV_ImageIndex`.

## Preuves

- Comparaison source `Quake-2-master/server/server.h` vs `packages/server/src/server.ts`: toutes les declarations du dernier bloc pointent vers les interfaces proprietaires `ServerSendProcedures`, `ServerUserProcedures`, `ServerConsoleProcedures`, `ServerEntityProcedures`, `ServerGameProcedures` et `ServerWorldProcedures`.
- Comparaison des definitions C proprietaires dans `Quake-2-master/server/sv_send.c`, `sv_user.c`, `sv_ccmds.c`, `sv_ents.c`, `sv_game.c`, `sv_world.c` avec les cibles TS `packages/server/src/sv_send.ts`, `sv_user.ts`, `sv_ccmds.ts`, `sv_ents.ts`, `sv_game.ts`, `sv_world.ts` et leur cablage dans `packages/server/src/runtime.ts`.
- Recherche `rg` confirmee pendant la session: `SV_Error` est seulement declare dans `server.h`, sans definition C dans `Quake-2-master/server`.
- Commentaires d'en-tete verifies pour `SV_DemoCompleted`, `SV_SendClientMessages`, `SV_Multicast`, `SV_StartSound`, `SV_ClientPrintf`, `SV_BroadcastPrintf`, `SV_BroadcastCommand`, `SV_Nextserver`, `SV_ExecuteClientMessage`, `SV_ReadLevelFile`, `SV_Status_f`, `SV_WriteFrameToClient`, `SV_RecordDemoMessage`, `SV_InitGameProgs`, `SV_ShutdownGameProgs`, `SV_InitEdict`; commentaires ajoutes pour `SV_BuildClientFrame`, `SV_ClearWorld`, `SV_UnlinkEdict`, `SV_LinkEdict`, `SV_AreaEdicts`, `SV_PointContents`, `SV_Trace`.
- `npm run verify:server:header`
- `npm run verify:server:send`
- `npm run verify:server:user`
- `npm run verify:server:ccmds`
- `npm run verify:server:ents`
- `npm run verify:server:game`
- `npm run verify:server:world`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run verify:audio:phase11`
- `npm run typecheck`
- Comparaison source `Quake-2-master/server/server.h` vs port proprietaire `packages/server/src/server.ts` pour les signatures `ServerMainProcedures`, `ServerUserProcedures`, `ServerConsoleProcedures`, `ServerInitProcedures`, `ServerSendProcedures`, `redirect_t`, `SV_OUTPUTBUF_LENGTH` et `ServerHeaderState.sv_outputbuf`.
- Comparaison des definitions C proprietaires dans `Quake-2-master/server/sv_main.c`, `sv_user.c`, `sv_ccmds.c`, `sv_init.c` et `sv_send.c` avec les cibles TS `packages/server/src/sv_main.ts`, `sv_user.ts`, `sv_ccmds.ts`, `sv_init.ts`, `sv_send.ts` et le cablage `packages/server/src/runtime.ts`.
- Recherche `rg` confirmee pendant la session: `SV_WriteClientdataToMessage`, `SV_SendServerinfo` et `Master_Packet` n'ont pas de definition ni d'usage dans `Quake-2-master/server`; `server.ts` conserve seulement des signatures optionnelles.
- Commentaires d'en-tete verifies pour `SV_ExecuteUserCommand`, `SV_InitOperatorCommands`, `SV_UserinfoChanged`, `Master_Heartbeat`, `SV_InitGame`, `SV_Map`, `SV_PrepWorldFrame`, `redirect_t`, `SV_OUTPUTBUF_LENGTH`, `SV_FlushRedirect` et les interfaces de declarations header concernees.
- `npm run verify:server:main`
- `npm run verify:server:user`
- `npm run verify:server:ccmds`
- `npm run verify:server:init`
- `npm run verify:server:send`
- Ad hoc `npx tsx` pour `SV_FlushRedirect` (`RD_CLIENT` vers `svc_print`, `RD_PACKET` vers paquet OOB).
- Comparaison source `Quake-2-master/server/server.h` vs port proprietaire `packages/server/src/server.ts`.
- Comparaison des definitions C proprietaires dans `Quake-2-master/server/sv_main.c`, `sv_init.c`, `sv_user.c` et usages des cvars/globals dans les modules serveur.
- Comparaison avec les cibles TS `packages/server/src/server.ts`, `sv_main.ts`, `sv_init.ts`, `sv_user.ts`, `runtime.ts` et le host `apps/web/src/full-game-server-host.ts`.
- Commentaires d'en-tete verifies pour `ServerHeaderState`, `ServerMainProcedures`, `ServerInitProcedures`, `createServerHeaderState`, `SV_FinalMessage`, `SV_DropClient`, `SV_ModelIndex`, `SV_SoundIndex`, `SV_ImageIndex`.
- Assertions ajoutees dans `scripts/verify/quake2-server-header.ts` pour les defaults des externs `net_message`, cvars et `sv_player`.
- Assertions ajoutees dans `scripts/verify/quake2-server-runtime.ts` pour l'exposition runtime de `SV_FinalMessage`, `SV_DropClient`, `SV_ModelIndex`, `SV_SoundIndex`, `SV_ImageIndex` et l'allocation/reutilisation des configstrings precache.
- `npm run verify:server:header`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Decisions d'integration

- Runtime: le dernier bloc est integre dans `createServerRuntimeFacade`. `sv_main.SV_Frame` appelle `SV_SendClientMessages` et `SV_RecordDemoMessage`; `sv_send` appelle `SV_BuildClientFrame`, `SV_WriteFrameToClient`, `SV_DropClient`, `SV_Nextserver`; `sv_init` appelle `SV_ClearWorld`, `SV_Multicast`, `SV_BroadcastCommand`, `SV_SendClientMessages`, `SV_InitGameProgs`, `SV_ReadLevelFile`; `sv_game` expose les callbacks engine vers `SV_Multicast`, `SV_StartSound`, `SV_ClientPrintf`, `SV_BroadcastPrintf`, `SV_LinkEdict`, `SV_UnlinkEdict`, `SV_AreaEdicts`, `SV_Trace`, `SV_PointContents`.
- `apps/web`: integre via `createFullGameServerHost`, qui utilise la facade serveur complete, appelle les frames serveur, ecrit les snapshots locaux via `SV_BuildClientFrame`/`SV_WriteFrameToClient`, fournit les callbacks save/load `SV_ReadLevelFile`, et consomme les configstrings/snapshots/sons dans le client local.
- `packages/renderer-three`: integration indirecte attendue et verifiee. Les sorties visibles de ce lot sont les packet entities, playerstate/camera, areabits, modeles/configstrings, sons et entites liees; elles sont consommees via `apps/web` puis `CL_ParseServerMessage`, `full-game-render-source`, `full-game-render-loop` et les adapters `renderer-three` de modeles/frames/camera/scene. Aucun branchement renderer direct supplementaire n'est attendu dans `server.h`.
- Runtime: `SV_ExecuteUserCommand` est atteint depuis `SV_ExecuteClientMessage`; `SV_InitOperatorCommands` est appele par `SV_Init` et `apps/web` initialise explicitement les commandes du facade; `SV_UserinfoChanged` est appele depuis connect et `clc_userinfo`; `Master_Heartbeat` et `SV_PrepWorldFrame` sont appeles depuis `SV_Frame`; `SV_InitGame`/`SV_Map` sont cables par `runtime.ts` et `sv_ccmds.ts`; `SV_FlushRedirect` est expose par `sv_send.ts`. `sv_outputbuf` reste un etat header conserve, avec redirection rcon adaptee via callback au lieu d'un buffer global partage.
- `apps/web`: flux integre via `createFullGameServerHost`, `facade.console.SV_InitOperatorCommands()`, `facade.main.SV_Frame()`, `facade.init.SV_Map()` via commandes serveur, snapshots locaux et configstrings. Les declarations orphelines n'ont pas de flux web attendu.
- `packages/renderer-three`: aucune consommation directe attendue pour les prototypes console/rcon/master; consommation indirecte verifiee pour les sorties visibles du serveur via snapshots/configstrings/areabits/camera dans le flux full-game three renderer.
- Runtime: integre via `createServerHeaderState`, `createServerRuntimeFacade`, `sv_main` pour `SV_FinalMessage`/`SV_DropClient`, `sv_init` pour les index precache et `sv_user` pour `sv_player`/`net_message` pendant les messages client.
- `apps/web`: integre via `createFullGameServerHost`, qui instancie les cvars serveur (`maxclients`, `paused`, `sv_enforcetime`, `sv_noreload`, `sv_airaccelerate`), transfere le `net_message` local et consomme les configstrings/snapshots.
- `packages/renderer-three`: integration indirecte attendue et verifiee via les configstrings modele/son/image et les snapshots client; les modeles, sons/effects, images, areabits, entites packetisees et camera issus du serveur alimentent les adapters renderer.

## Prochain lot recommande

- Aucun lot restant dans `server_server.h.md`: toutes les lignes sont `Valide` ou `Non applicable`.

## Blocages

- Aucun.

## Historique precedent

- Bloc `client_s` / `client_t` complet de `userinfo` a `netchan`: struct `client_s` ciblee par `client_t`, champs `userinfo`, `lastframe`, `lastcmd`, `commandMsec`, `frame_latency`, `ping`, `message_size`, `rate`, `surpressCount`, `edict`, `name`, `messagelevel`, `datagram`, `datagram_buf`, `frames`, `download`, `downloadsize`, `downloadcount`, `lastmessage`, `lastconnect`, `challenge`, `netchan`.
- Bloc serveur statique suivant: `MAX_CHALLENGES`, `challenge_t` et ses champs generes (`challenge`, `time`), `server_static_t` et ses champs generes par la matrice (`initialized`, `realtime`, `mapcmd`, `spawncount`, `num_client_entities`, `next_client_entities`, `client_entities`, `last_heartbeat`, `demofile`, `demo_multicast`, `demo_multicast_buf`).
- Bloc initial `server.h`: `MAX_MASTERS`, `server_state_t`, `server_t` et ses champs generes par la matrice (`attractloop`, `loadgame`, `time`, `framenum`, `name`, `models`, `baselines`, `multicast`, `multicast_buf`, `demofile`, `timedemo`), macros `EDICT_NUM` / `NUM_FOR_EDICT`, `client_state_t`, `client_frame_t` et ses champs (`areabytes`, `areabits`, `ps`, `num_entities`, `first_entity`, `senttime`), puis `LATENCY_COUNTS` et `RATE_MESSAGES`.
