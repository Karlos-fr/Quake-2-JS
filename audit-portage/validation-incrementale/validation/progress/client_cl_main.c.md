# Progress - Quake-2-master/client/cl_main.c

## Dernier lot valide

Cinquieme gros lot `cl_main.c` : bloc final runtime/init/frame `CL_InitLocal`, `CL_WriteConfiguration`, `cheatvar_t`, `cheatvars`, `CL_FixCvarCheats`, `CL_SendCommand`, `CL_Frame`, `CL_Init`, `CL_Shutdown`, et etats/locaux associes (`path`, champs `name`/`value`/`var`, `numcheatvars`, `i`, `extratime`, `lasttimecalled`, `now`, `isdown`). Lots precedents conserves : bloc precache/autodownload complet `precache_check`, `precache_spawncount`, `precache_tex`, `precache_model_skin`, `precache_model`, `PLAYER_MULT`, `ENV_CNT`, `TEXTURE_CNT`, `env_suf`, `CL_RequestNextDownload`, `CL_Precache_f`; bloc connectionless/network-read `CL_Skins_f`, `CL_ConnectionlessPacket`, `CL_DumpPackets`, `CL_ReadPackets`, `CL_FixUpGender`, `CL_Userinfo_f`, `CL_Snd_Restart_f`; commandes client reseau/connexion `CL_Connect_f`, `CL_Rcon_f`, `CL_Packet_f`, `CL_Changing_f`, `CL_Reconnect_f`, `CL_ParseStatusMessage`, `CL_PingServers_f`; cvars/globals de startup `freelook` a `cl_vwep`, etat client `cl_entities` / `cl_parse_entities`, externs `allow_download*`, demo record/stop/write, forwarding console, `setenv`, pause/quit/drop, connect-packet/resend, `CL_ClearState`, `CL_Disconnect`, `CL_Disconnect_f`.

## Preuves obtenues

- Comparaison C/TS : `Quake-2-master/client/cl_main.c`, `packages/client/src/cl_main.ts`, `packages/client/src/cl_input.ts`, `packages/client/src/precache.ts`, `packages/client/src/client.ts`, `packages/qcommon/src/qcommon.ts`, `apps/web/src/full-game.ts`, `packages/renderer-three`.
- Commentaires d'en-tete verifies pour `CL_InitLocal`, `CL_WriteConfiguration`, `CL_FixCvarCheats`, `CL_SendCommand`, `CL_Frame`, `CL_Init` et `CL_Shutdown`; `Original name`, `Source: client/cl_main.c`, `Category: Ported`, niveau de fidelite, behavior et notes de portage presents.
- Runtime : `CL_Frame` est atteint depuis `Qcommon_Frame -> qcommonHooks.onFrame -> CL_Frame` dans `apps/web/src/full-game.ts`; il preserve l'ordre input/read/send/predict/refresh/screen/audio/effects. `CL_SendCommand` appelle `Cbuf_Execute`, `CL_FixCvarCheats`, le pont `CL_SendCmd` et `CL_CheckForResend`. `CL_InitLocal` enregistre les commandes et cvars; les cvars d'input appelees par le C depuis `CL_InitLocal -> CL_InitInput` restent proprietaires de `cl_input.c` et sont initialisees par `CL_InitInput`.
- `apps/web` : `apps/web/src/full-game.ts` appelle `CL_InitLocal`, pompe `CL_Frame` via `Qcommon_Frame`, branche `CL_ReadPackets`, `CL_SendCmd`, prediction, refresh, sons et ecriture config via `CL_WriteConfiguration`; `beforeunload` appelle `finishConfigBootstrap`, `writeConfiguration` puis `Qcommon_Shutdown`.
- `renderer-three` : integration indirecte validee. Le lot produit les donnees visibles via le chemin `CL_Frame -> CL_PredictMovement/CL_PrepRefresh/SCR_UpdateScreen` et les sorties de scene/camera/areabits/dlights/particules/modeles sont consommees par le render-source et le render loop Three.

## Tests lances

- `npm run verify:cl-main`
- `npm run verify:full-game:local-transport`
- `npm run verify:full-game:authoritative-handshake`
- `npm run verify:full-game:authoritative-input`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:web-config-writeconfig`
- `npm run verify:web-config-write`
- `npm run typecheck`

## Decisions

- `allow_download*` dans `client/cl_main.c` sont des declarations `extern`; l'ownership C est `server/sv_main.c`. Cote client TS, les valeurs attendues sont injectees dans `precache.ts` via hooks `allowDownload*`, donc les lignes de cette matrice sont `Non applicable`.
- `CL_Disconnect` a ete aligne sur le C pour transmettre trois paquets `disconnect` quand un runtime qnet est fourni; `CL_ClearState` vide maintenant aussi `cls.netchan.message`.
- `cl_gun` a ete restaure dans `ClientMainContext` et enregistre par `CL_InitLocal`.
- `CL_Rcon_f` cible maintenant `cls.netchan.remote_address` quand le client est connecte, et envoie via `NET_SendPacket` quand `qnet` est fourni; `CL_PingServers_f` emet les probes `info` via `Netchan_OutOfBandPrint` quand `qnet` est fourni.
- `CL_Packet_f` reste non enregistre par `CL_InitLocal`, conformement a la ligne C `Cmd_AddCommand ("packet", CL_Packet_f)` commentee comme dangereuse.
- `CL_Skins_f` a ete aligne sur les effets C `Com_Printf`, `SCR_UpdateScreen`, `Sys_SendKeyEvents` avant `CL_ParseClientinfo`.
- `apps/web` branche les paquets `info` connectionless sur le menu server-list via `M_AddToServerList`.
- Les compteurs C `precache_*` sont portes dans `client_precache_state_t`; `precache_model` n'est pas conserve comme pointeur global TS, le modele est recharge via hook au moment de poursuivre la traversal, avec comportement observable couvert.
- `PLAYER_MULT`, `ENV_CNT`, `TEXTURE_CNT` et `env_suf` sont exportes depuis `precache.ts` pour verification explicite de parite.
- `CL_Precache_f` old-demo appelle maintenant le hook map avant registration sounds / prep refresh, comme le chemin C `CM_LoadMap`.
- `CL_RequestNextDownload` reutilise l'info map chargee pendant la traversal complete pour verifier checksum puis enumerer les textures BSP sans double chargement dans la meme passe.
- `cheatvar_t` est represente par le type inline des entrees `ClientMainContext.cheatvars`; `numcheatvars` est remplace par la longueur du tableau et la resolution paresseuse par entree.
- Les statics C `extratime`, `lasttimecalled` et `isdown` sont portes comme `ClientMainContext.frame_extratime`, `ClientMainContext.frame_lasttimecalled` et `ClientMainContext.shutdown_in_progress` pour conserver un etat reentrant.
- `CL_Init` reste un port hooke de l'ordre d'initialisation; `apps/web` initialise explicitement `CL_InitLocal` et `CL_InitInput`, tandis que le lifecycle qcommon appelle le frame client via `Qcommon_Frame`.

## Prochain lot recommande

Aucun lot restant dans `client_cl_main.c.md`: toutes les entrees sont `Valide` ou `Non applicable`.

## Blocages

Aucun blocage sur ce lot.
