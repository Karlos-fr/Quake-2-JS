# Progress - Quake-2-master/client/cl_main.c

## Dernier lot valide

Deuxieme gros lot `cl_main.c` : commandes client reseau/connexion `CL_Connect_f`, `CL_Rcon_f`, `CL_Packet_f`, `CL_Changing_f`, `CL_Reconnect_f`, `CL_ParseStatusMessage`, `CL_PingServers_f` et locaux C associes (`server`, `message`, `i`, `send`, `s`, `name`, `adrstring`, `noudp`, `noipx`). Lot precedent conserve : cvars/globals de startup `freelook` a `cl_vwep`, etat client `cl_entities` / `cl_parse_entities`, externs `allow_download*`, demo record/stop/write, forwarding console, `setenv`, pause/quit/drop, connect-packet/resend, `CL_ClearState`, `CL_Disconnect`, `CL_Disconnect_f`.

## Preuves obtenues

- Comparaison C/TS : `Quake-2-master/client/cl_main.c`, `packages/client/src/cl_main.ts`, `packages/client/src/cl_parse.ts`, `packages/client/src/client.ts`.
- Commentaires d'en-tete verifies pour les fonctions portees du lot; `Original name`, `Source: client/cl_main.c`, `Category: Ported` et niveau de fidelite presents.
- Runtime : commandes `connect`, `rcon`, `reconnect`, `pingservers`, `changing` atteignables via `CL_InitLocal -> Cmd_AddCommand`; `CL_ParseStatusMessage` atteint via `CL_ConnectionlessPacket` sur paquet `info`; `CL_Packet_f` est porte mais son enregistrement commande reste volontairement commente comme dans le C.
- `apps/web` : `apps/web/src/full-game.ts` installe le runtime `CL_InitLocal`, `CL_Frame`, `CL_ReadPackets` et les hooks de connexion; le transport local consomme les paquets `connect`, `rcon` et `pingservers` via `qnet` quand disponible, sans logique web parallele qui remplace le runtime.
- `renderer-three` : pas de sortie runtime visible directe pour ce lot; les effets concernent etat de connexion, commandes reseau, console/loading plaque et liste serveurs, sans modeles/frames/images/particules/beams/dlights/temp entities/areabits/camera a consommer par le renderer.

## Tests lances

- `npm run verify:cl-main`
- `npm run verify:cl-parse`
- `npm run verify:client:header`
- `npm run verify:cl-input`
- `npm run verify:full-game:authoritative-handshake`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`
- `npm run verify:full-game:local-transport`
- `npm run verify:full-game:authoritative-handshake`

## Decisions

- `allow_download*` dans `client/cl_main.c` sont des declarations `extern`; l'ownership C est `server/sv_main.c`. Cote client TS, les valeurs attendues sont injectees dans `precache.ts` via hooks `allowDownload*`, donc les lignes de cette matrice sont `Non applicable`.
- `CL_Disconnect` a ete aligne sur le C pour transmettre trois paquets `disconnect` quand un runtime qnet est fourni; `CL_ClearState` vide maintenant aussi `cls.netchan.message`.
- `cl_gun` a ete restaure dans `ClientMainContext` et enregistre par `CL_InitLocal`.
- `CL_Rcon_f` cible maintenant `cls.netchan.remote_address` quand le client est connecte, et envoie via `NET_SendPacket` quand `qnet` est fourni; `CL_PingServers_f` emet les probes `info` via `Netchan_OutOfBandPrint` quand `qnet` est fourni.
- `CL_Packet_f` reste non enregistre par `CL_InitLocal`, conformement a la ligne C `Cmd_AddCommand ("packet", CL_Packet_f)` commentee comme dangereuse.

## Prochain lot recommande

`CL_Skins_f` et son local `i`, puis `CL_ConnectionlessPacket` et locaux `s`/`c` si le lot reste coherent; verifier le branchement menu/server-list pour `M_AddToServerList` et les paquets `client_connect`, `info`, `cmd`, `print`, `ping`, `challenge`, `echo`.

## Blocages

Aucun blocage sur ce lot.
