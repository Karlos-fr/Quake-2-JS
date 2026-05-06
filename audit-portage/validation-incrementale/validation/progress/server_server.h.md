# Progress - Quake-2-master/server/server.h

## Lot valide pendant cette session

- Bloc `client_s` / `client_t` complet de `userinfo` a `netchan`: struct `client_s` ciblee par `client_t`, champs `userinfo`, `lastframe`, `lastcmd`, `commandMsec`, `frame_latency`, `ping`, `message_size`, `rate`, `surpressCount`, `edict`, `name`, `messagelevel`, `datagram`, `datagram_buf`, `frames`, `download`, `downloadsize`, `downloadcount`, `lastmessage`, `lastconnect`, `challenge`, `netchan`.
- Bloc serveur statique suivant: `MAX_CHALLENGES`, `challenge_t` et ses champs generes (`challenge`, `time`), `server_static_t` et ses champs generes par la matrice (`initialized`, `realtime`, `mapcmd`, `spawncount`, `num_client_entities`, `next_client_entities`, `client_entities`, `last_heartbeat`, `demofile`, `demo_multicast`, `demo_multicast_buf`).

## Preuves

- Comparaison source `Quake-2-master/server/server.h` vs port proprietaire `packages/server/src/server.ts`.
- Commentaires d'en-tete verifies pour `client_t`, `challenge_t`, `server_static_t`, `createServerClient`, `createChallenge`, `createServerStatic` et helpers associes.
- Assertions ajoutees dans `scripts/verify/quake2-server-header.ts` pour les defaults et tailles des champs `client_t`, `challenge_t` et `server_static_t`.
- `npm run verify:server:header`
- `npm run verify:server:main`
- `npm run verify:server:send`
- `npm run verify:server:user`
- `npm run verify:server:ents`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Decisions d'integration

- Runtime: integre via `createServerClient`, `createServerStatic`, `SV_InitGame` pour l'allocation clients/ring entities, `SVC_DirectConnect`/`SV_UserinfoChanged`/`Netchan_Setup`, `SV_ExecuteClientMessage`, `SV_SendClientMessages`, `SV_BuildClientFrame` et `SV_WriteFrameToClient`.
- `apps/web`: integre via `createFullGameServerHost`, qui cree le client serveur local, pousse `userinfo`, construit frames/snapshots, transfere datagram et consomme les sorties serveur dans le flux full-game.
- `packages/renderer-three`: integration indirecte attendue et verifiee via snapshots client; `areabits`, playerstate, entites packetisees, configstrings et baselines produites par les frames serveur alimentent le rendu Three.

## Prochain lot recommande

- Continuer les externs/globals header: `net_message`, `sv`, `sv_paused`, `maxclients`, `sv_noreload`, `sv_airaccelerate`, `sv_enforcetime`, `sv_player`, puis les premiers prototypes `SV_FinalMessage` / `SV_DropClient` / index precache si le lot reste coherent.

## Blocages

- Aucun.

## Historique precedent

- Bloc initial `server.h`: `MAX_MASTERS`, `server_state_t`, `server_t` et ses champs generes par la matrice (`attractloop`, `loadgame`, `time`, `framenum`, `name`, `models`, `baselines`, `multicast`, `multicast_buf`, `demofile`, `timedemo`), macros `EDICT_NUM` / `NUM_FOR_EDICT`, `client_state_t`, `client_frame_t` et ses champs (`areabytes`, `areabits`, `ps`, `num_entities`, `first_entity`, `senttime`), puis `LATENCY_COUNTS` et `RATE_MESSAGES`.
