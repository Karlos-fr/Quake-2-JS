# Inventaire Portage Quake II - server/sv_ccmds.c

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/server/sv_ccmds.c`
- Sources C/H secondaires : `Quake-2-master/server/server.h`, `qcommon/qcommon.h`, `game/game.h`
- Package cible principal : `packages/server`
- Fichier TS principal pressenti : `packages/server/src/sv_ccmds.ts`
- Fichiers TS secondaires pressentis : `packages/server/src/runtime.ts`, `packages/server/src/server.ts`, `packages/server/src/index.ts`, `packages/qcommon/src/*`, `packages/memory/src/*`
- Domaine : commandes operateur serveur, savegames, server demos
- Niveau de fidelite attendu : Close/Strict selon fonction ; adaptations IO documentees
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`
- Exception de decoupage documentee : aucune pour le port principal ; les operations fichier passent par callbacks/adapters injectes.
- Justification si `1 fichier C != 1 fichier TS` : non applicable ; `sv_ccmds.ts` reste le point de rattachement, `runtime.ts` ne fait que l'instancier.

## Inventaire source

### Fonctions

- [x] Nom : `SV_SetMaster_f`
  - Source : `sv_ccmds.c:39`
  - Role : configure les master servers et envoie un ping.
  - Cible TS pressentie : `sv_ccmds.ts:267`
  - Statut : porte Close
  - Notes : conserve dedicated/public/reset/heartbeat ; le port indexe par `slot` pour eviter une fragilite source si une adresse invalide precede une valide.

- [x] Nom : `SV_SetPlayer`
  - Source : `sv_ccmds.c:91`
  - Role : resout `sv_client` / `sv_player` par slot numerique ou nom.
  - Cible TS pressentie : `sv_ccmds.ts:212`
  - Statut : porte Close
  - Notes : etat local closure au lieu de globals `sv_client` / `sv_player`.

- [x] Nom : `SV_WipeSavegame`
  - Source : `sv_ccmds.c:156`
  - Role : supprime `server.ssv`, `game.ssv`, `*.sav`, `*.sv2`.
  - Cible TS pressentie : `sv_ccmds.ts:316`
  - Statut : porte Close
  - Notes : callbacks specialises prioritaires, fallback `removeFile/listFiles`.

- [x] Nom : `CopyFile`
  - Source : `sv_ccmds.c:192`
  - Role : copie binaire par blocs.
  - Cible TS pressentie : `copyBinaryFile` dans `sv_ccmds.ts:184`
  - Statut : adapte
  - Notes : lecture/ecriture callbacks, pas de streaming C.

- [x] Nom : `SV_CopySaveGame`
  - Source : `sv_ccmds.c:228`
  - Role : copie un slot savegame vers un autre.
  - Cible TS pressentie : `sv_ccmds.ts:333`
  - Statut : porte Close
  - Notes : conserve wipe cible, server/game, `.sav` et `.sv2`.

- [x] Nom : `SV_WriteLevelFile`
  - Source : `sv_ccmds.c:278`
  - Role : ecrit configstrings + portal state puis `ge->WriteLevel`.
  - Cible TS pressentie : `sv_ccmds.ts:355`
  - Statut : porte Close
  - Notes : binaire encode explicitement, portal state via `CM_WritePortalState`.

- [x] Nom : `SV_ReadLevelFile`
  - Source : `sv_ccmds.c:306`
  - Role : restaure configstrings + portal state puis `ge->ReadLevel`.
  - Cible TS pressentie : `sv_ccmds.ts:921`
  - Statut : porte Close
  - Notes : expose dans `ServerConsoleProcedures`, branche par `sv_init`.

- [x] Nom : `SV_WriteServerFile`
  - Source : `sv_ccmds.c:334`
  - Role : ecrit commentaire, mapcmd, cvars `CVAR_LATCH`, puis game state.
  - Cible TS pressentie : `sv_ccmds.ts:378`
  - Statut : porte Close
  - Notes : date JS adaptee, tailles fixes conservees.

- [x] Nom : `SV_ReadServerFile`
  - Source : `sv_ccmds.c:407`
  - Role : restaure mapcmd et cvars latch, init game, puis `ge->ReadGame`.
  - Cible TS pressentie : `sv_ccmds.ts:426`
  - Statut : porte Close
  - Notes : boucle records fixes `MAX_OSPATH + 128`.

- [x] Nom : `SV_DemoMap_f`
  - Source : `sv_ccmds.c:465`
  - Role : appelle `SV_Map(true, arg, false)`.
  - Cible TS pressentie : `sv_ccmds.ts:471`
  - Statut : porte Strict
  - Notes : comportement direct.

- [x] Nom : `SV_GameMap_f`
  - Source : `sv_ccmds.c:488`
  - Role : transition map avec sauvegarde niveau et autosave non dedicated.
  - Cible TS pressentie : `sv_ccmds.ts:484`
  - Statut : porte Close
  - Notes : conserve clear `inuse` clients, restore, `mapcmd`, autosave.

- [x] Nom : `SV_Map_f`
  - Source : `sv_ccmds.c:557`
  - Role : map direct dev, verification BSP puis wipe current et gamemap.
  - Cible TS pressentie : `sv_ccmds.ts:536`
  - Statut : porte Close
  - Notes : verification map via callback optionnel `loadMapFile`.

- [x] Nom : `SV_Loadgame_f`
  - Source : `sv_ccmds.c:594`
  - Role : charge une sauvegarde puis map avec `loadgame`.
  - Cible TS pressentie : `sv_ccmds.ts:557`
  - Statut : porte Close
  - Notes : conserve warning bad savedir sans retour immediat.

- [x] Nom : `SV_Savegame_f`
  - Source : `sv_ccmds.c:641`
  - Role : sauvegarde manuelle d'une partie.
  - Cible TS pressentie : `sv_ccmds.ts:588`
  - Statut : porte Close
  - Notes : garde state, argc, deathmatch, current, dead player, bad savedir warning.

- [x] Nom : `SV_Kick_f`
  - Source : `sv_ccmds.c:706`
  - Role : kick un client selectionne.
  - Cible TS pressentie : `sv_ccmds.ts:638`
  - Statut : porte Strict
  - Notes : broadcast, client print, drop, lastmessage.

- [x] Nom : `SV_Status_f`
  - Source : `sv_ccmds.c:737`
  - Role : imprime tableau statut clients.
  - Cible TS pressentie : `sv_ccmds.ts:672`
  - Statut : porte Close
  - Notes : format adapte mais informations conservees.

- [x] Nom : `SV_ConSay_f`
  - Source : `sv_ccmds.c:794`
  - Role : chat console vers clients spawned.
  - Cible TS pressentie : `sv_ccmds.ts:719`
  - Statut : porte Strict
  - Notes : quote stripping et prefix `console:`.

- [x] Nom : `SV_Heartbeat_f`
  - Source : `sv_ccmds.c:829`
  - Role : force heartbeat.
  - Cible TS pressentie : `sv_ccmds.ts:746`
  - Statut : porte Strict
  - Notes : `last_heartbeat = -9999999`.

- [x] Nom : `SV_Serverinfo_f`
  - Source : `sv_ccmds.c:842`
  - Role : imprime serverinfo.
  - Cible TS pressentie : `sv_ccmds.ts:756`
  - Statut : porte Strict
  - Notes : `Info_Print(Cvar_Serverinfo())`.

- [x] Nom : `SV_DumpUser_f`
  - Source : `sv_ccmds.c:856`
  - Role : imprime userinfo client selectionne.
  - Cible TS pressentie : `sv_ccmds.ts:770`
  - Statut : porte Strict
  - Notes : utilise `SV_SetPlayer`.

- [x] Nom : `SV_ServerRecord_f`
  - Source : `sv_ccmds.c:882`
  - Role : ouvre un server demo et ecrit signon complet.
  - Cible TS pressentie : `sv_ccmds.ts:830`
  - Statut : porte Close
  - Notes : open/write via callbacks, signon bytes preserves.

- [x] Nom : `SV_ServerStop_f`
  - Source : `sv_ccmds.c:970`
  - Role : arrete server demo.
  - Cible TS pressentie : `sv_ccmds.ts:901`
  - Statut : porte Strict
  - Notes : ferme handle callback et nullifie.

- [x] Nom : `SV_KillServer_f`
  - Source : `sv_ccmds.c:991`
  - Role : shutdown serveur et ferme sockets.
  - Cible TS pressentie : `sv_ccmds.ts:797`
  - Statut : porte Close
  - Notes : `NET_Config(false)` via qnet runtime.

- [x] Nom : `SV_ServerCommand_f`
  - Source : `sv_ccmds.c:1006`
  - Role : delegue commande au game dll.
  - Cible TS pressentie : `sv_ccmds.ts:812`
  - Statut : porte Strict
  - Notes : garde no game loaded.

- [x] Nom : `SV_InitOperatorCommands`
  - Source : `sv_ccmds.c:1024`
  - Role : enregistre les commandes operateur.
  - Cible TS pressentie : `sv_ccmds.ts:957`
  - Statut : porte Close
  - Notes : `say` seulement dedicated, commandes source conservees.

### Structures / types

- [x] Nom : `ServerConsoleContext`
  - Source : globals `sv`, `svs`, `ge`, cvars, callbacks systeme
  - Role : remplace les globals et fonctions systeme C.
  - Representation TS pressentie : `sv_ccmds.ts:63`
  - Statut : nouveau contexte
  - Notes : adaptation autorisee.

- [x] Nom : `ServerConsoleProcedures`
  - Source : declarations `server.h`
  - Role : surface publique console.
  - Representation TS pressentie : `server.ts`
  - Statut : consomme
  - Notes : expose `SV_ReadLevelFile`, `SV_Status_f`, `SV_InitOperatorCommands`.

- [x] Nom : `client_t`, `server_t`, `server_static_t`, `game_export_t`, `edict_t`
  - Source : `server.h` / `game.h`
  - Role : etat serveur/client et callbacks game.
  - Representation TS pressentie : `server.ts`, `game/src`
  - Statut : consomme
  - Notes : port principal hors de ce fichier.

### Enums / constantes / flags / macros utiles

- [x] Nom : `MAX_MASTERS`, `PORT_MASTER`
  - Source : server/qcommon
  - Valeur / role : master servers et port par defaut.
  - Cible TS pressentie : imports
  - Statut : consomme
  - Notes : teste.

- [x] Nom : `MAX_CONFIGSTRINGS`, `MAX_QPATH`, `MAX_OSPATH`, `MAX_TOKEN_CHARS`
  - Source : qcommon/server
  - Valeur / role : tailles fixes savegame.
  - Cible TS pressentie : imports qcommon
  - Statut : consomme
  - Notes : harnais verifie payloads.

- [x] Nom : `CVAR_LATCH`, `CS_NAME`, `STAT_HEALTH`, `STAT_FRAGS`
  - Source : qcommon/game
  - Valeur / role : savegame cvars, nom niveau, stats save/status.
  - Cible TS pressentie : imports
  - Statut : consomme
  - Notes : valeurs portees ailleurs.

- [x] Nom : `svc_serverdata`, `svc_configstring`, `PROTOCOL_VERSION`
  - Source : qcommon protocol
  - Valeur / role : signon server demo.
  - Cible TS pressentie : imports
  - Statut : consomme
  - Notes : harnais verifie debut payload.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `SV_SetMaster_f` | fonction | `sv_ccmds.ts` | `SV_SetMaster_f` | OK Close | deviation slot documentee |
| `SV_SetPlayer` | fonction | `sv_ccmds.ts` | `SV_SetPlayer` | OK Close | closure state |
| `SV_WipeSavegame` | fonction | `sv_ccmds.ts` | `SV_WipeSavegame` | OK Close | callbacks/fallback |
| `CopyFile` | fonction | `sv_ccmds.ts` | `copyBinaryFile` | OK Adapter | callbacks binaires |
| `SV_CopySaveGame` | fonction | `sv_ccmds.ts` | `SV_CopySaveGame` | OK Close | save slots |
| `SV_WriteLevelFile` | fonction | `sv_ccmds.ts` | `SV_WriteLevelFile` | OK Close | configstrings/portal |
| `SV_ReadLevelFile` | fonction | `sv_ccmds.ts` | `SV_ReadLevelFile` | OK Close | exposee |
| `SV_WriteServerFile` | fonction | `sv_ccmds.ts` | `SV_WriteServerFile` | OK Close | cvars latch |
| `SV_ReadServerFile` | fonction | `sv_ccmds.ts` | `SV_ReadServerFile` | OK Close | mapcmd/game |
| `SV_DemoMap_f` | fonction | `sv_ccmds.ts` | `SV_DemoMap_f` | OK Strict | map attract |
| `SV_GameMap_f` | fonction | `sv_ccmds.ts` | `SV_GameMap_f` | OK Close | save transition |
| `SV_Map_f` | fonction | `sv_ccmds.ts` | `SV_Map_f` | OK Close | map dev |
| `SV_Loadgame_f` | fonction | `sv_ccmds.ts` | `SV_Loadgame_f` | OK Close | save load |
| `SV_Savegame_f` | fonction | `sv_ccmds.ts` | `SV_Savegame_f` | OK Close | save manual |
| `SV_Kick_f` | fonction | `sv_ccmds.ts` | `SV_Kick_f` | OK Strict | kick flow |
| `SV_Status_f` | fonction | `sv_ccmds.ts` | `SV_Status_f` | OK Close | formatting adapte |
| `SV_ConSay_f` | fonction | `sv_ccmds.ts` | `SV_ConSay_f` | OK Strict | chat |
| `SV_Heartbeat_f` | fonction | `sv_ccmds.ts` | `SV_Heartbeat_f` | OK Strict | heartbeat |
| `SV_Serverinfo_f` | fonction | `sv_ccmds.ts` | `SV_Serverinfo_f` | OK Strict | serverinfo |
| `SV_DumpUser_f` | fonction | `sv_ccmds.ts` | `SV_DumpUser_f` | OK Strict | userinfo |
| `SV_ServerRecord_f` | fonction | `sv_ccmds.ts` | `SV_ServerRecord_f` | OK Close | demo callbacks |
| `SV_ServerStop_f` | fonction | `sv_ccmds.ts` | `SV_ServerStop_f` | OK Strict | stop demo |
| `SV_KillServer_f` | fonction | `sv_ccmds.ts` | `SV_KillServer_f` | OK Close | shutdown + net config |
| `SV_ServerCommand_f` | fonction | `sv_ccmds.ts` | `SV_ServerCommand_f` | OK Strict | game command |
| `SV_InitOperatorCommands` | fonction | `sv_ccmds.ts` | `SV_InitOperatorCommands` | OK Close | registration |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/server/src/runtime.ts`
- Client : non applicable direct
- Server : `sv_main.ts` appelle `SV_InitOperatorCommands`, `sv_init.ts` consomme `SV_ReadLevelFile`, runtime facade
- Renderer common : non applicable
- Renderer three : non applicable
- Web / platform : callbacks IO/FS possibles, pas port principal
- Audio : non applicable direct
- Tests existants : `scripts/verify/quake2-sv-ccmds.ts`, script npm `verify:server:ccmds`
