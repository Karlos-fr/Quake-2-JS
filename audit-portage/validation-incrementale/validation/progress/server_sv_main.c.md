# Progress - Quake-2-master/server/sv_main.c

## Dernier lot valide

- Lot traite: cvars/globales serveur de debut (`sv_paused`, `sv_timedemo`, `sv_enforcetime`, `timeout`, `zombietime`, `rcon_password`, `allow_download*`, `sv_airaccelerate`, `sv_noreload`, `maxclients`, `sv_showclamp`, `hostname`, `public_server`, `sv_reconnect_limit`), `SV_DropClient`, `SV_StatusString`, `Master_Shutdown`.
- Source C comparee: declarations et definitions dans `Quake-2-master/server/sv_main.c`.
- Cible TS comparee: `packages/server/src/sv_main.ts`, avec integration runtime dans `packages/server/src/runtime.ts`, top-level host dans `packages/server/src/host.ts`, et adapter navigateur dans `apps/web/src/full-game-server-host.ts`.
- Correction appliquee: `SV_Init` lie maintenant les references cvar manquantes du contexte `sv_main.ts` aux cvars enregistrees, tout en conservant les references explicitement fournies par un appelant.
- Commentaires d'en-tete verifies: `SV_DropClient`, `SV_StatusString` via usages connectionless/heartbeat, `Master_Shutdown`; les cvars sont couvertes par le commentaire de fichier et le bloc `SV_Init`.
- Branchement runtime: valide via `createServerRuntimeFacade`, `configureServerHostFromFacade`, `SV_Frame`, `SV_Shutdown`, `SV_DropClient` transmis a `sv_user` et `sv_send`.
- `apps/web`: valide via `createFullGameServerHost`, qui consomme le runtime serveur porte; l'adapter web garde des cvars explicites pour le serveur local.
- `renderer-three`: non applicable justifie pour ce lot; ces entites ne produisent pas directement modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene. Les sorties visibles passent par snapshots/configstrings d'autres lots serveur/client.

## Tests lances

- `npm run verify:server:main`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run typecheck`

## Decisions importantes

- La premiere ligne `Master_Shutdown` de la matrice correspond a la declaration avancee C; elle est marquee `Non applicable` avec justification. La definition plus bas est validee.
- Les cvars `allow_download*`, `sv_enforcetime`, `sv_noreload` et `sv_airaccelerate` restent partagees avec les modules qui les consomment (`sv_user`, `sv_init`) via le facade runtime; `sv_main.ts` conserve leur registration d'origine dans `SV_Init`.

## Prochain lot recommande

- Continuer le bloc connectionless apres `SV_StatusString`: `SVC_Status`, `SVC_Ack`, `SVC_Info`, `SVC_Ping`, `SVC_GetChallenge`, puis les locaux associes si le lot reste coherent.
