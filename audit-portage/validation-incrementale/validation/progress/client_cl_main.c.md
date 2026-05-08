# Progress - Quake-2-master/client/cl_main.c

## Dernier lot valide

Troisieme gros lot `cl_main.c` : bloc connectionless/network-read `CL_Skins_f`, `CL_ConnectionlessPacket`, `CL_DumpPackets`, `CL_ReadPackets`, `CL_FixUpGender`, `CL_Userinfo_f`, `CL_Snd_Restart_f` et locaux C associes (`i`, `s`, `c`, `p`, `sk`). Lots precedents conserves : commandes client reseau/connexion `CL_Connect_f`, `CL_Rcon_f`, `CL_Packet_f`, `CL_Changing_f`, `CL_Reconnect_f`, `CL_ParseStatusMessage`, `CL_PingServers_f`; cvars/globals de startup `freelook` a `cl_vwep`, etat client `cl_entities` / `cl_parse_entities`, externs `allow_download*`, demo record/stop/write, forwarding console, `setenv`, pause/quit/drop, connect-packet/resend, `CL_ClearState`, `CL_Disconnect`, `CL_Disconnect_f`.

## Preuves obtenues

- Comparaison C/TS : `Quake-2-master/client/cl_main.c`, `packages/client/src/cl_main.ts`, `packages/client/src/cl_parse.ts`, `packages/client/src/client.ts`.
- Commentaires d'en-tete verifies pour les fonctions portees du lot; `Original name`, `Source: client/cl_main.c`, `Category: Ported` et niveau de fidelite presents.
- Runtime : commandes `skins`, `userinfo`, `snd_restart` atteignables via `CL_InitLocal -> Cmd_AddCommand`; `CL_ReadPackets` atteint via `CL_Frame`/`Qcommon_Frame`, dispatch connectionless vers `CL_ConnectionlessPacket`, et `CL_ConnectionlessPacket` couvre `client_connect`, `info`, `cmd`, `print`, `ping`, `challenge`, `echo`; `CL_DumpPackets` reste un helper porte appelable explicitement comme dans le C.
- `apps/web` : `apps/web/src/full-game.ts` installe `CL_InitLocal`, `CL_Frame`, `CL_ReadPackets`, `CL_Snd_Restart_f` via commande, le transport local `qnet`, et route maintenant les reponses `info` connectionless vers `M_AddToServerList` via `onAddToServerList`; aucune logique web parallele ne remplace ce flux.
- `renderer-three` : pas de sortie runtime visible directe pour ce lot; `CL_Skins_f` peut recharger des clientinfo/skins qui seront ensuite consommes indirectement par les refresh entities et le renderer, tandis que les autres entites concernent reseau, userinfo, sound restart et server-list sans modeles/frames/images/particules/beams/dlights/temp entities/areabits/camera produits directement.

## Tests lances

- `npm run verify:cl-main`
- `npm run verify:full-game:local-transport`
- `npm run verify:full-game:authoritative-handshake`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Decisions

- `allow_download*` dans `client/cl_main.c` sont des declarations `extern`; l'ownership C est `server/sv_main.c`. Cote client TS, les valeurs attendues sont injectees dans `precache.ts` via hooks `allowDownload*`, donc les lignes de cette matrice sont `Non applicable`.
- `CL_Disconnect` a ete aligne sur le C pour transmettre trois paquets `disconnect` quand un runtime qnet est fourni; `CL_ClearState` vide maintenant aussi `cls.netchan.message`.
- `cl_gun` a ete restaure dans `ClientMainContext` et enregistre par `CL_InitLocal`.
- `CL_Rcon_f` cible maintenant `cls.netchan.remote_address` quand le client est connecte, et envoie via `NET_SendPacket` quand `qnet` est fourni; `CL_PingServers_f` emet les probes `info` via `Netchan_OutOfBandPrint` quand `qnet` est fourni.
- `CL_Packet_f` reste non enregistre par `CL_InitLocal`, conformement a la ligne C `Cmd_AddCommand ("packet", CL_Packet_f)` commentee comme dangereuse.
- `CL_Skins_f` a ete aligne sur les effets C `Com_Printf`, `SCR_UpdateScreen`, `Sys_SendKeyEvents` avant `CL_ParseClientinfo`.
- `apps/web` branche les paquets `info` connectionless sur le menu server-list via `M_AddToServerList`.

## Prochain lot recommande

Bloc precache/autodownload : `precache_check`, `precache_spawncount`, `precache_tex`, `precache_model_skin`, `precache_model`, macros `PLAYER_MULT` / `ENV_CNT` / `TEXTURE_CNT`, `env_suf`, puis `CL_RequestNextDownload` si le lot reste coherent.

## Blocages

Aucun blocage sur ce lot.
