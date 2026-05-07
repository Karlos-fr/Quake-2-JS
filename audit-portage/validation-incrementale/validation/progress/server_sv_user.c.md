# Progress - Quake-2-master/server/sv_user.c

- Statut: Termine
- Dernier lot valide: fichier termine. Lots valides: `sv_player`, bootstrap client (`SV_BeginDemoserver`, `SV_New_f`, `SV_Configstrings_f`, `SV_Baselines_f`, `SV_Begin_f`), download (`SV_NextDownload_f`, `SV_BeginDownload_f`), disconnect/info/nextserver (`SV_Disconnect_f`, `SV_ShowServerinfo_f`, `SV_Nextserver`, `SV_Nextserver_f`), commandes utilisateur/message client (`ucmd_t`, `ucmds`, `SV_ExecuteUserCommand`, `SV_ClientThink`, `MAX_STRINGCMDS`, `SV_ExecuteClientMessage`) et faux positifs locaux associes.
- Corrections TS: ajout du commentaire d'en-tete de portage pour `SV_Nextserver_f` dans `packages/server/src/sv_user.ts`; reintroduction de `ucmd_t`/`ucmds` dans `packages/server/src/sv_user.ts`; ajout de preuves `clc_move`/checksum/replay/drop/`MAX_STRINGCMDS` dans `scripts/verify/quake2-sv-user.ts`.
- Tests de reference lances et OK: `npm run verify:server:user`, `npm run verify:server:runtime`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`, `npm run verify:full-game:authoritative-input`, `npm run typecheck`.
- Decisions: les `allow_download*` et `file_from_pak` declares `extern` dans `SV_BeginDownload_f` sont des dependances injectees par `ServerUserContext`/`createServerRuntimeFacade`; ils ne sont pas proprietaires de `sv_user.c`.
- Integration runtime: validee via `SV_ReadPackets` -> `SV_ExecuteClientMessage` dans `createServerRuntimeFacade`, parsing `clc_userinfo`/`clc_move`/`clc_stringcmd`, dispatch `ucmds`, checksum, replay des drops et appel `ge.ClientThink`.
- Integration apps/web: validee via `createFullGameServerHost` et `verify:full-game:authoritative-input`; le web produit/consomme le flux usercmd par le runtime serveur au lieu de remplacer `SV_ExecuteClientMessage`.
- Integration renderer-three: non applicable direct pour `ucmd_t`/`ucmds`/string commands; applicable indirectement pour les sorties visibles de `SV_ClientThink` via playerstate/camera/snapshots, verifie par `verify:full-game:three-renderer`.
- Prochain lot recommande: aucun dans `server/sv_user.c`; toutes les lignes sont `Valide` ou `Non applicable`.
- Blocages: aucun.
