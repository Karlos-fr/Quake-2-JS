# Progress - Quake-2-master/server/sv_ccmds.c

## Etat

- Statut: Termine cote fichier; laisser le coordinateur reporter dans `AVANCEMENT_GLOBAL.md`.
- Dernier lot valide: dernier bloc commandes operateur `SV_KillServer_f`, `SV_ServerCommand_f`, `SV_InitOperatorCommands`.
- Compteurs matrice: 57 entites, 25 `Valide`, 32 `Non applicable`, 0 restant `A verifier`.

## Lot valide pendant cette session

- Fonctions validees: `SV_KillServer_f`, `SV_ServerCommand_f`, `SV_InitOperatorCommands`.
- Comparaison C/TS: `SV_KillServer_f` conserve le garde `svs.initialized`, appelle `SV_Shutdown("Server was killed.\n", false)` puis `NET_Config(false)`; `SV_ServerCommand_f` conserve le rejet sans `ge` et la delegation `ge.ServerCommand()`; `SV_InitOperatorCommands` enregistre les memes commandes que le C et garde `say` conditionne par `dedicated`.
- Commentaires d'en-tete TS verifies dans `packages/server/src/sv_ccmds.ts`: `Original name`, `Source`, `Category: Ported`, `Fidelity level` presents pour les trois fonctions, avec comportement decrit pour `SV_KillServer_f` et `SV_InitOperatorCommands`.
- Branchement runtime verifie: `SV_Init` appelle `SV_InitOperatorCommands`; les commandes `killserver` et `sv` sont atteignables via le runtime de commandes, et `packages/server/src/sv_user.ts`/flux menu-client peuvent ajouter `killserver` au buffer.
- `apps/web` verifie: `apps/web/src/full-game-server-host.ts` appelle `facade.console.SV_InitOperatorCommands()`, donc les commandes serveur portees sont exposees au host web; `full-game-command-bridge` contient seulement un adapter UI separe et ne revendique pas l'ownership de `SV_KillServer_f`.
- `renderer-three` verifie: ce bloc ne produit directement ni modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene. Les effets visibles attendus sont indirects via arret/changement de serveur puis snapshots/maps, couverts par les flux full-game.
- Tests lances: `npm run verify:server:ccmds`, harness inline `SV_KillServer_f`/`SV_ServerCommand_f`/registration, `npm run verify:server:runtime`, `npm run verify:full-game:server-host`, `npm run verify:full-game:server-snapshots`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Lot precedent

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
- `npm run verify:server:runtime` passe pendant la session de cloture du fichier.

## Tests de reference

- `npm run verify:server:ccmds`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

Aucun lot restant dans `server/sv_ccmds.c.md`: toutes les lignes sont `Valide` ou `Non applicable`. Le coordinateur peut passer `Quake-2-master/server/sv_ccmds.c` a `Termine` dans `AVANCEMENT_GLOBAL.md` avec 57 entites, 25 validees, 32 non applicables.
