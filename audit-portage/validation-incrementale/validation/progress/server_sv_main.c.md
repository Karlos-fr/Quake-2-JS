# Progress - Quake-2-master/server/sv_main.c

## Dernier lot valide

- Lot traite: bloc connectionless `SVC_Status`, `SVC_Ack`, `SVC_Info`, `SVC_Ping`, `SVC_GetChallenge`, `SVC_DirectConnect`, `Rcon_Validate`, `SVC_RemoteCommand`, `SV_ConnectionlessPacket`, plus locaux C generes associes et locaux restants de `SV_StatusString`.
- Source C comparee: definitions dans `Quake-2-master/server/sv_main.c`, de `SVC_Status` a `SV_ConnectionlessPacket`.
- Cible TS comparee: `packages/server/src/sv_main.ts`, avec integration runtime dans `packages/server/src/runtime.ts`, top-level host dans `packages/server/src/host.ts`, adapter navigateur dans `apps/web/src/full-game-server-host.ts`, et absence de consommation directe attendue dans `packages/renderer-three`.
- Corrections appliquees: `SV_ConnectionlessPacket` utilise maintenant `onDPrintf` pour le log debug `Packet ...`, comme le `Com_DPrintf` C; ajout d'un commentaire d'en-tete portage pour `Rcon_Validate`; mise a jour de la note d'en-tete `SV_ConnectionlessPacket`.
- Commentaires d'en-tete verifies: `SVC_Status`, `SVC_Ack`, `SVC_Info`, `SVC_Ping`, `SVC_GetChallenge`, `SVC_DirectConnect`, `Rcon_Validate`, `SVC_RemoteCommand`, `SV_ConnectionlessPacket`.
- Branchement runtime: valide via `SV_ReadPackets`, appele par `SV_Frame`, et via `createServerRuntimeFacade`; les commandes connectionless sont atteignables par `NET_GetPacket` sur `NS_SERVER`.
- `apps/web`: valide via `createFullGameServerHost` et le transport local `qcommon`; le web delegue au runtime serveur porte et ne remplace pas les handlers connectionless.
- `renderer-three`: non applicable justifie pour ce lot; ces handlers reseau/connexion/rcon ne produisent pas directement modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene. Les sorties visibles attendues passent ensuite par les snapshots serveur/client et le flux full-game deja verifie.

## Tests lances

- `npm run verify:server:main`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Decisions importantes

- La premiere ligne `Master_Shutdown` de la matrice correspond a la declaration avancee C; elle est marquee `Non applicable` avec justification. La definition plus bas est validee.
- Les cvars `allow_download*`, `sv_enforcetime`, `sv_noreload` et `sv_airaccelerate` restent partagees avec les modules qui les consomment (`sv_user`, `sv_init`) via le facade runtime; `sv_main.ts` conserve leur registration d'origine dans `SV_Init`.
- Les variables locales C detectees par la matrice pour `SV_StatusString` et le bloc connectionless sont marquees `Non applicable`: elles ne sont pas des entites proprietaires TS separees et sont couvertes par les fonctions portees.
- `SVC_RemoteCommand` reste `Close`: le redirect C global `Com_BeginRedirect`/`Com_EndRedirect` est modele par le callback `executeRconCommand` et une reponse out-of-band `print`.

## Prochain lot recommande

- Continuer apres le bloc connectionless: `SV_CalcPings`, `SV_GiveMsec`, `SV_ReadPackets`, `SV_CheckTimeouts`, `SV_PrepWorldFrame`, `SV_RunGameFrame`, `SV_Frame` et locaux associes si le lot reste coherent.
