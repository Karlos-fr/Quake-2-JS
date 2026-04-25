# Inventaire Portage Quake II - server/sv_init.c

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/server/sv_init.c`
- Sources C/H secondaires : `Quake-2-master/server/server.h`, qcommon cvar/cmd/net/collision/protocol, game exports/edicts
- Package cible principal : `packages/server`
- Fichier TS principal pressenti : `packages/server/src/sv_init.ts`
- Fichiers TS secondaires pressentis : `packages/server/src/server.ts`, `packages/server/src/runtime.ts`, `packages/server/src/sv_game.ts`, `packages/server/src/sv_world.ts`, `packages/server/src/sv_send.ts`, `packages/server/src/sv_ccmds.ts`, `packages/server/src/index.ts`
- Domaine : serveur, initialisation de partie, map switching, index ressources/configstrings, baselines, savegame reload
- Niveau de fidelite attendu : Strict avec ecarts host/filesystem documentes
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`
- Exception de decoupage documentee : aucune pour le comportement principal ; `runtime.ts` injecte seulement les callbacks et dependances.
- Justification si `1 fichier C != 1 fichier TS` : non applicable ; `packages/server/src/sv_init.ts` reste le fichier principal.

## Inventaire source

### Fonctions

- [x] Nom : `SV_FindIndex`
  - Source : `sv_init.c:32`
  - Role : trouve ou alloue un index configstring ressource, multicast hors loading.
  - Cible TS pressentie : `sv_init.ts:146`
  - Statut : porte Close
  - Notes : `strncpy` adapte en slice string TS.

- [x] Nom : `SV_ModelIndex`
  - Source : `sv_init.c:64`
  - Role : index modeles via `CS_MODELS`.
  - Cible TS pressentie : `sv_init.ts:185`
  - Statut : porte
  - Notes : wrapper strict.

- [x] Nom : `SV_SoundIndex`
  - Source : `sv_init.c:69`
  - Role : index sons via `CS_SOUNDS`.
  - Cible TS pressentie : `sv_init.ts:195`
  - Statut : porte
  - Notes : wrapper strict.

- [x] Nom : `SV_ImageIndex`
  - Source : `sv_init.c:74`
  - Role : index images via `CS_IMAGES`.
  - Cible TS pressentie : `sv_init.ts:205`
  - Statut : porte
  - Notes : wrapper strict.

- [x] Nom : `SV_CreateBaseline`
  - Source : `sv_init.c:89`
  - Role : cree les baselines entity_state pour delta compression.
  - Cible TS pressentie : `sv_init.ts:215`
  - Statut : porte
  - Notes : copie profonde via `cloneEntityState`.

- [x] Nom : `SV_CheckForSavegame`
  - Source : `sv_init.c:117`
  - Role : detecte savegame courant, recharge level file, stabilise 100 frames si retour de niveau.
  - Cible TS pressentie : `sv_init.ts:239`
  - Statut : porte Close
  - Notes : `fopen`/`FS_Gamedir`/`SV_ReadLevelFile` adaptes en callbacks.

- [x] Nom : `SV_SpawnServer`
  - Source : `sv_init.c:169`
  - Role : reset serveur de niveau, charge map, spawn entites, settle frames, baseline et savegame.
  - Cible TS pressentie : `sv_init.ts:273`
  - Statut : porte Close
  - Notes : `memset(&sv,0)` adapte par `Object.assign(createServerState())`, chargement map injectable.

- [x] Nom : `SV_InitGame`
  - Source : `sv_init.c:289`
  - Role : initialise une nouvelle partie, cvars maxclients/mode, clients, network et game progs.
  - Cible TS pressentie : `sv_init.ts:372`
  - Statut : porte Close
  - Notes : allocations `Z_Malloc` remplacees par tableaux TS/factories.

- [x] Nom : `SV_Map`
  - Source : `sv_init.c:393`
  - Role : parse map command, nextserver/spawnpoint, dispatch cinematic/demo/pic/game.
  - Cible TS pressentie : `sv_init.ts:438`
  - Statut : porte Close
  - Notes : extensions comparees en TS via helper insensible a la casse.

### Structures / types

- [x] Nom : `server_static_t svs`
  - Source : `sv_init.c:23`
  - Role : etat serveur persistant.
  - Representation TS pressentie : `ServerInitContext.svs`
  - Statut : porte via contexte
  - Notes : cree par `createServerStatic`.

- [x] Nom : `server_t sv`
  - Source : `sv_init.c:24`
  - Role : etat serveur local au niveau.
  - Representation TS pressentie : `ServerInitContext.sv`
  - Statut : porte via contexte
  - Notes : reset par mutation pour conserver references runtime.

- [x] Nom : `ServerInitContext`
  - Source : nouveau contexte TS
  - Role : regroupe `sv/svs/ge`, cvars, qnet, collision, callbacks host/fichier.
  - Representation TS pressentie : `sv_init.ts:89`
  - Statut : nouveau contexte
  - Notes : adaptation des globals C autorisee.

- [x] Nom : `client_t`, `entity_state_t`, `edict_t`
  - Source : `server.h`, game/qcommon
  - Role : clients, baselines, edicts init.
  - Representation TS pressentie : `server.ts`, `game`, `qcommon`
  - Statut : consomme
  - Notes : factories TS remplacent les `memset`/`Z_Malloc`.

### Enums / constantes / flags / macros utiles

- [x] Nom : `CS_MODELS`, `CS_SOUNDS`, `CS_IMAGES`, `CS_NAME`, `CS_AIRACCEL`, `CS_MAPCHECKSUM`
  - Source : qcommon protocol
  - Valeur / role : indices configstrings serveur.
  - Cible TS pressentie : `packages/qcommon`
  - Statut : consomme
  - Notes : valeurs preservees.

- [x] Nom : `MAX_MODELS`, `MAX_SOUNDS`, `MAX_IMAGES`, `MAX_CLIENTS`, `MAX_QPATH`, `MAX_OSPATH`
  - Source : qcommon/server headers
  - Valeur / role : bornes ressources et chemins.
  - Cible TS pressentie : `packages/qcommon`
  - Statut : consomme
  - Notes : bornes utilisees dans index/path.

- [x] Nom : `ss_dead`, `ss_loading`, `ss_game`, `ss_cinematic`, `ss_demo`, `ss_pic`
  - Source : `server.h`
  - Valeur / role : etats serveur.
  - Cible TS pressentie : `server_state_t`
  - Statut : porte
  - Notes : enum conserve.

- [x] Nom : `cs_connected`
  - Source : `server.h`
  - Valeur / role : etat client reconnect.
  - Cible TS pressentie : `client_state_t.cs_connected`
  - Statut : porte
  - Notes : utilise pendant spawn.

- [x] Nom : `UPDATE_BACKUP * 64`
  - Source : `sv_init.c:364`
  - Valeur / role : capacite ring `client_entities`.
  - Cible TS pressentie : `computeServerClientEntityCapacity`
  - Statut : porte
  - Notes : helper serveur.

- [x] Nom : `PORT_MASTER`
  - Source : qcommon/server
  - Valeur / role : master id `192.246.40.37`.
  - Cible TS pressentie : `packages/qcommon`
  - Statut : consomme
  - Notes : `NET_StringToAdr`.

- [x] Nom : `COPYPROTECT`
  - Source : branches `#ifdef` dans `SV_InitGame`
  - Valeur / role : protection CD historique.
  - Cible TS pressentie : aucune
  - Statut : non porte, compile-time absent
  - Notes : documente comme non applicable navigateur/TS.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `svs` | global | `sv_init.ts` | `context.svs` | OK | contexte explicite |
| `sv` | global | `sv_init.ts` | `context.sv` | OK | contexte explicite |
| `SV_FindIndex` | procedure | `sv_init.ts` | `SV_FindIndex` | OK Close | string slice |
| `SV_ModelIndex` | procedure | `sv_init.ts` | `SV_ModelIndex` | OK | wrapper |
| `SV_SoundIndex` | procedure | `sv_init.ts` | `SV_SoundIndex` | OK | wrapper |
| `SV_ImageIndex` | procedure | `sv_init.ts` | `SV_ImageIndex` | OK | wrapper |
| `SV_CreateBaseline` | procedure | `sv_init.ts` | `SV_CreateBaseline` | OK | clone state |
| `SV_CheckForSavegame` | procedure | `sv_init.ts` | `SV_CheckForSavegame` | OK Close | callbacks FS |
| `SV_SpawnServer` | procedure | `sv_init.ts` | `SV_SpawnServer` | OK Close | reset/load callbacks |
| `SV_InitGame` | procedure | `sv_init.ts` | `SV_InitGame` | OK Close | factories arrays |
| `SV_Map` | procedure | `sv_init.ts` | `SV_Map` | OK Close | extension helper |
| `COPYPROTECT` branches | compile-time | aucun | aucun | N/A | non applicable |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/server/src/runtime.ts`
- Client : indirect via reconnect/changing/configstrings/client arrays
- Server : `packages/server/src/sv_ccmds.ts`, `sv_game.ts`, `sv_world.ts`, `sv_send.ts`, `sv_main.ts`, `server.ts`, `index.ts`
- Renderer common : non applicable direct
- Renderer three : non applicable direct
- Web / platform : host/file callbacks seulement
- Audio : non applicable direct, mais sound indexes sont exposes
- Tests existants : `scripts/verify/quake2-sv-init.ts`, `scripts/verify/quake2-server-runtime.ts`, `scripts/verify/quake2-sv-ccmds.ts`
