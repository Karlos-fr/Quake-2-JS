# Progress - Quake-2-master/server/sv_user.c

- Statut: En cours
- Dernier lot valide: `sv_player`, bootstrap client (`SV_BeginDemoserver`, `SV_New_f`, `SV_Configstrings_f`, `SV_Baselines_f`, `SV_Begin_f`), download (`SV_NextDownload_f`, `SV_BeginDownload_f`), disconnect/info/nextserver (`SV_Disconnect_f`, `SV_ShowServerinfo_f`, `SV_Nextserver`, `SV_Nextserver_f`) et faux positifs locaux associes.
- Corrections TS: ajout du commentaire d'en-tete de portage pour `SV_Nextserver_f` dans `packages/server/src/sv_user.ts`.
- Tests de reference lances et OK: `npm run verify:server:user`, `npm run verify:server:runtime`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.
- Decisions: les `allow_download*` et `file_from_pak` declares `extern` dans `SV_BeginDownload_f` sont des dependances injectees par `ServerUserContext`/`createServerRuntimeFacade`; ils ne sont pas proprietaires de `sv_user.c`.
- Integration runtime: validee via `SV_ExecuteClientMessage`/stringcmds, `createServerRuntimeFacade`, `SV_ReadPackets` indirect, downloads et nextserver.
- Integration apps/web: validee via `createFullGameServerHost`, qui injecte `allow_download*`, `loadDownloadFile`, les configstrings/baselines et synchronise les precaches vers le client web.
- Integration renderer-three: non applicable direct pour les commandes serveur; les sorties visibles indirectes `configstrings`/baselines/snapshots sont consommees via le client/full-game et verifiees par `verify:full-game:three-renderer`.
- Prochain lot recommande: `ucmd_t`, `ucmds`, `SV_ExecuteUserCommand`, `SV_ClientThink`, `MAX_STRINGCMDS`, `SV_ExecuteClientMessage` et variables locales associees.
- Blocages: aucun.
