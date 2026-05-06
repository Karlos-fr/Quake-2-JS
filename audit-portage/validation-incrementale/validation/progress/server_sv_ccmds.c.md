# Progress - Quake-2-master/server/sv_ccmds.c

## Etat

- Statut: En cours
- Dernier lot valide: bloc commandes operateur de `SV_Kick_f` a `SV_ServerStop_f`.
- Compteurs matrice: 57 entites, 22 `Valide`, 32 `Non applicable`.

## Lot valide pendant cette session

- Fonctions validees: `SV_Kick_f`, `SV_Status_f`, `SV_ConSay_f`, `SV_Heartbeat_f`, `SV_Serverinfo_f`, `SV_DumpUser_f`, `SV_ServerRecord_f`, `SV_ServerStop_f`.
- Faux positifs marques `Non applicable`: variables locales generees dans la matrice (`s`, `ping`, `j`, `p`, `text`, `name`, `buf_data`, `buf`, `len`, `i`).

## Lots precedents

- Fonctions validees: `SV_SetMaster_f`, `SV_SetPlayer`, `SV_WipeSavegame`, `CopyFile`, `SV_CopySaveGame`, `SV_WriteLevelFile`, `SV_ReadLevelFile`, `SV_WriteServerFile`, `SV_ReadServerFile`, `SV_DemoMap_f`, `SV_GameMap_f`, `SV_Map_f`, `SV_Loadgame_f`, `SV_Savegame_f`.
- Faux positifs marques `Non applicable`: variables locales generees dans la matrice (`i`, `idnum`, `s`, `name`, `l`, `buffer`, `found`, `var`, `comment`, `mapcmd`, `map`, `savedInuse`, `expanded`, `dir`).

## Decisions

- `CopyFile` est conserve comme fonction proprietaire TS interne dans `packages/server/src/sv_ccmds.ts`; l'I/O directe C est remplacee par callbacks explicites pour les hosts web/tests.
- Les flux save/load/map sont integres au runtime via `createServerRuntimeFacade`, `SV_InitOperatorCommands`, `SV_Map` et les callbacks de stockage.
- `apps/web` declenche le flux via `full-game-server-host.ts` et l'enregistrement des commandes operateur.
- `renderer-three` n'a pas d'appel direct attendu pour ce lot, mais consomme indirectement les sorties runtime issues des maps/snapshots/configstrings apres load/map.
- Les commandes operateur `kick`, `status`, `say`, `heartbeat`, `serverinfo`, `dumpuser`, `serverrecord` et `serverstop` sont branchees via `SV_InitOperatorCommands`.
- `serverrecord` produit une sortie runtime visible indirecte via signon/configstrings/snapshots de demo; le flux renderer n'a pas d'appel direct attendu, mais les donnees configstrings/entities/snapshots restent consommees apres parsing client.
- `npm run verify:server:runtime` a echoue pendant cette session sur `SV_ModelIndex configstring slot mismatch`, hors du lot `server/sv_ccmds.c`; ne pas considerer comme preuve de regression de ce fichier sans revalidation par l'agent proprietaire `server/runtime`/`server.h`.

## Tests de reference

- `npm run verify:server:ccmds`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

Traiter le dernier bloc du fichier: `SV_KillServer_f`, `SV_ServerCommand_f`, `SV_InitOperatorCommands`.
