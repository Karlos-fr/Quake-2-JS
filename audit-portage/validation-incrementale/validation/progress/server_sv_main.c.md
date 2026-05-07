# Progress - Quake-2-master/server/sv_main.c

## Dernier lot valide

- Lot traite: boucle frame serveur `SV_CalcPings`, `SV_GiveMsec`, `SV_ReadPackets`, `SV_CheckTimeouts`, `SV_PrepWorldFrame`, `SV_RunGameFrame`, `SV_Frame`, plus locaux C generes associes (`i`, `qport`, `droppoint`, `zombiepoint`, `ent`).
- Source C comparee: definitions dans `Quake-2-master/server/sv_main.c`, de `SV_CalcPings` a `SV_Frame`.
- Cible TS comparee: `packages/server/src/sv_main.ts`, avec integration runtime dans `packages/server/src/runtime.ts`, bridge top-level `packages/server/src/host.ts`, appel `qcommon` `SV_Frame`, adapter navigateur `apps/web/src/full-game-server-host.ts`, et consommation renderer via snapshots/refresh frames.
- Corrections appliquees: `SV_Frame` appelle maintenant `context.randomInt?.()` apres l'avance realtime pour conserver l'effet C `rand()` par frame active; le reset `time_before_game`/`time_after_game` est effectue avant le retour serveur non initialise comme dans le C; le harness `quake2-sv-main.ts` verifie l'appel random.
- Commentaires d'en-tete verifies: `SV_CalcPings`, `SV_GiveMsec`, `SV_ReadPackets`, `SV_CheckTimeouts`, `SV_PrepWorldFrame`, `SV_RunGameFrame`, `SV_Frame`.
- Branchement runtime: valide via `createServerRuntimeFacade`, `createServerHostBindings`, `packages/server/src/host.ts`, et `packages/qcommon/src/qcommon.ts`; `SV_Frame` atteint les fonctions du lot et le flux `SV_ReadPackets`/`SV_ExecuteClientMessage`, `SV_SendClientMessages`, `SV_RecordDemoMessage`.
- `apps/web`: valide via `createFullGameServerHost.frame()`, qui appelle le runtime serveur porte; le web delegue les packets, frames, snapshots et map state au runtime sans remplacer la logique serveur.
- `renderer-three`: valide pour la consommation attendue; le lot produit indirectement les sorties visibles via `SV_RunGameFrame`, `SV_SendClientMessages`, snapshots/full-game frames, puis le renderer consomme camera, entites, areabits, dlights/particles/beams par le flux full-game verifie. Aucune integration directe `renderer-three` n'est attendue dans `sv_main.ts`.

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
- `SV_ReadPackets` expose un retour `number` TS pour le harness, alors que le C est `void`; ce retour ne change pas les effets runtime.
- `SV_Frame` reste `Close`: l'appel C `rand()` est modele par le callback optionnel `randomInt` du contexte runtime.

## Prochain lot recommande

- Continuer apres la boucle frame serveur: `HEARTBEAT_SECONDS`, `Master_Heartbeat`, locaux associes (`string`, `i`), puis revalidation de la definition `Master_Shutdown` si le lot reste coherent.
