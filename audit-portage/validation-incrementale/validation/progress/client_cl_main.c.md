# Progress - Quake-2-master/client/cl_main.c

## Dernier lot valide

Premier gros lot `cl_main.c` : cvars/globals de startup `freelook` a `cl_vwep`, etat client `cl_entities` / `cl_parse_entities`, externs `allow_download*`, demo record/stop/write, forwarding console, `setenv`, pause/quit/drop, connect-packet/resend, `CL_ClearState`, `CL_Disconnect`, `CL_Disconnect_f`.

## Preuves obtenues

- Comparaison C/TS : `Quake-2-master/client/cl_main.c`, `packages/client/src/cl_main.ts`, `packages/client/src/cl_parse.ts`, `packages/client/src/client.ts`.
- Commentaires d'en-tete verifies pour les fonctions portees du lot; helpers/adapters `Category: New` presents.
- Runtime : atteint via `CL_InitLocal`, commandes `Cmd_AddCommand`, `CL_Frame -> CL_SendCommand -> CL_CheckForResend`, `CL_ReadPackets`, et lifecycle client qcommon.
- `apps/web` : full-game appelle `CL_InitLocal`, `CL_Frame`, `CL_ReadPackets`, `Cmd_ForwardToServer` via le runtime porte; pas de logique parallele masquant ce lot.
- `renderer-three` : pas d'appel direct attendu pour les cvars/lifecycle, sauf consommation indirecte des sorties visibles via render-source/Three; `cl_gun`, `hand`, `r_lightlevel`, entites/camera restent couverts par les flux view/render.

## Tests lances

- `npm run verify:cl-main`
- `npm run verify:cl-parse`
- `npm run verify:client:header`
- `npm run verify:cl-input`
- `npm run verify:full-game:authoritative-handshake`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Decisions

- `allow_download*` dans `client/cl_main.c` sont des declarations `extern`; l'ownership C est `server/sv_main.c`. Cote client TS, les valeurs attendues sont injectees dans `precache.ts` via hooks `allowDownload*`, donc les lignes de cette matrice sont `Non applicable`.
- `CL_Disconnect` a ete aligne sur le C pour transmettre trois paquets `disconnect` quand un runtime qnet est fourni; `CL_ClearState` vide maintenant aussi `cls.netchan.message`.
- `cl_gun` a ete restaure dans `ClientMainContext` et enregistre par `CL_InitLocal`.

## Prochain lot recommande

`CL_Connect_f`, local `server`, puis `CL_Rcon_f` et locaux `message`/`i`, ensuite `CL_Packet_f`, `CL_Changing_f`, `CL_Reconnect_f`, `CL_ParseStatusMessage`, `CL_PingServers_f` si le lot reste coherent.

## Blocages

Aucun blocage sur ce lot.
