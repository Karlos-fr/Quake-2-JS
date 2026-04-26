# Inventaire Portage Quake II - server/sv_user.c

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/server/sv_user.c`
- Sources C/H secondaires : `Quake-2-master/server/server.h`, qcommon msg/cmd/cvar/filesystem/protocol, game exports/edicts
- Package cible principal : `packages/server`
- Fichier TS principal pressenti : `packages/server/src/sv_user.ts`
- Fichiers TS secondaires pressentis : `packages/server/src/server.ts`, `packages/server/src/runtime.ts`, `packages/server/src/sv_main.ts`, `packages/server/src/sv_send.ts`, `packages/server/src/index.ts`
- Domaine : serveur, bootstrap client, user string commands, downloads, nextserver, execution usercmd reseau
- Niveau de fidelite attendu : Strict/Close selon adaptations I/O fichier/demo et contexte explicite
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`
- Exception de decoupage documentee : aucune pour le comportement principal ; `runtime.ts` injecte seulement les callbacks croises et I/O.
- Justification si `1 fichier C != 1 fichier TS` : non applicable ; `packages/server/src/sv_user.ts` reste le point principal identifiable.

## Inventaire source

### Fonctions

- [x] Nom : `SV_BeginDemoserver`
  - Source : `sv_user.c:40`
  - Role : ouvre le fichier demo `demos/<sv.name>` pour un serveur demo.
  - Cible TS pressentie : `sv_user.ts:138`
  - Statut : porte Close
  - Notes : I/O adaptee via `openDemoFile`.

- [x] Nom : `SV_New_f`
  - Source : `sv_user.c:58`
  - Role : envoie `svc_serverdata`, attache l'edict client et lance `configstrings`.
  - Cible TS pressentie : `sv_user.ts:152`
  - Statut : porte Close
  - Notes : `EDICT_NUM` remplace l'arithmetique de pointeur.

- [x] Nom : `SV_Configstrings_f`
  - Source : `sv_user.c:124`
  - Role : stream les configstrings par paquets jusqu'a `MAX_CONFIGSTRINGS`.
  - Cible TS pressentie : `sv_user.ts:202`
  - Statut : porte Close
  - Notes : conserve la relance `SV_New_f` si `spawncount` diverge.

- [x] Nom : `SV_Baselines_f`
  - Source : `sv_user.c:179`
  - Role : stream les baselines d'entites puis lance `precache`.
  - Cible TS pressentie : `sv_user.ts:243`
  - Statut : porte Close
  - Notes : `createEntityState()` remplace le `memset` de `nullstate`.

- [x] Nom : `SV_Begin_f`
  - Source : `sv_user.c:238`
  - Role : passe le client en `cs_spawned`, appelle `ge.ClientBegin`, insere les commandes defer.
  - Cible TS pressentie : `sv_user.ts:284`
  - Statut : porte Close
  - Notes : `sv_player` est maintenu localement dans la closure.

- [x] Nom : `SV_NextDownload_f`
  - Source : `sv_user.c:265`
  - Role : envoie un chunk de download de 1024 octets et libere a la fin.
  - Cible TS pressentie : `sv_user.ts:305`
  - Statut : porte Close
  - Notes : `FS_FreeFile` adapte en `freeDownload`.

- [x] Nom : `SV_BeginDownload_f`
  - Source : `sv_user.c:302`
  - Role : valide/refuse une demande download, charge le fichier, envoie le premier chunk.
  - Cible TS pressentie : `sv_user.ts:346`
  - Statut : porte Close
  - Notes : `FS_LoadFile`, `file_from_pak` et `FS_FreeFile` adaptes en callbacks.

- [x] Nom : `SV_Disconnect_f`
  - Source : `sv_user.c:385`
  - Role : drop immediat du client courant.
  - Cible TS pressentie : `sv_user.ts:407`
  - Statut : porte Strict
  - Notes : callback `SV_DropClient` depuis `sv_main`.

- [x] Nom : `SV_ShowServerinfo_f`
  - Source : `sv_user.c:399`
  - Role : affiche `Cvar_Serverinfo()` via `Info_Print`.
  - Cible TS pressentie : `sv_user.ts:417`
  - Statut : porte Close
  - Notes : retourne les lignes pour test en plus de `onPrintf`.

- [x] Nom : `SV_Nextserver`
  - Source : `sv_user.c:405`
  - Role : avance `spawncount`, execute `nextserver` ou `killserver`.
  - Cible TS pressentie : `sv_user.ts:431`
  - Statut : porte Close
  - Notes : conserve le cas ZOID `ss_pic` + coop.

- [x] Nom : `SV_Nextserver_f`
  - Source : `sv_user.c:433`
  - Role : commande client validant `spawncount` avant `SV_Nextserver`.
  - Cible TS pressentie : `sv_user.ts:450`
  - Statut : porte local
  - Notes : helper local non expose dans `server.h`, comme le C.

- [x] Nom : `SV_ExecuteUserCommand`
  - Source : `sv_user.c:477`
  - Role : tokenize et dispatch les commandes utilisateur (`new`, `begin`, `download`, etc.).
  - Cible TS pressentie : `sv_user.ts:467`
  - Statut : porte Close
  - Notes : table `ucmds[]` adaptee en `switch` equivalent.

- [x] Nom : `SV_ClientThink`
  - Source : `sv_user.c:509`
  - Role : debite `commandMsec`, applique `sv_enforcetime`, appelle `ge.ClientThink`.
  - Cible TS pressentie : `sv_user.ts:514`
  - Statut : porte Strict
  - Notes : garde defensive si edict nul.

- [x] Nom : `SV_ExecuteClientMessage`
  - Source : `sv_user.c:533`
  - Role : parse `net_message`, applique `clc_userinfo`, `clc_move`, `clc_stringcmd`.
  - Cible TS pressentie : `sv_user.ts:538`
  - Statut : porte Close
  - Notes : lit `context.qnet.net_message` laisse par `Netchan_Process`.

### Structures / types

- [x] Nom : `sv_player`
  - Source : `sv_user.c:25`, `server.h`
  - Role : edict du client courant.
  - Representation TS pressentie : variable locale `sv_player`
  - Statut : adapte
  - Notes : closure dans `createServerUserProcedures`.

- [x] Nom : `sv_client`
  - Source : `server.h`
  - Role : client courant pour string commands et packet parsing.
  - Representation TS pressentie : variable locale `sv_client`
  - Statut : adapte
  - Notes : remplace le global C.

- [x] Nom : `ucmd_t` / `ucmds[]`
  - Source : `sv_user.c:445`, `sv_user.c:451`
  - Role : table de dispatch des string commands.
  - Representation TS pressentie : `switch` dans `SV_ExecuteUserCommand`
  - Statut : adapte
  - Notes : ordre et commandes conserves.

- [x] Nom : `ServerUserContext`
  - Source : nouveau contexte TS
  - Role : remplace les globals `sv/svs/ge/cmd/cvar/qnet` et callbacks filesystem/demo/main.
  - Representation TS pressentie : `sv_user.ts:75`
  - Statut : nouveau contexte
  - Notes : adaptation conforme README.

- [x] Nom : `client_t`, `server_t`, `server_static_t`, `edict_t`, `usercmd_t`
  - Source : `server.h`, game/qcommon headers
  - Role : etat client/serveur, entite joueur, commandes mouvement.
  - Representation TS pressentie : `server.ts`, qcommon/game exports
  - Statut : consomme
  - Notes : structures centrales portees separement.

### Enums / constantes / flags / macros utiles

- [x] Nom : `MAX_STRINGCMDS`
  - Source : `sv_user.c:525`
  - Valeur / role : `8`, limite de string commands par packet.
  - Cible TS pressentie : `sv_user.ts:69`
  - Statut : porte
  - Notes : condition `< MAX_STRINGCMDS` conservee.

- [x] Nom : chunk download `1024`
  - Source : `sv_user.c:273`
  - Valeur / role : taille max d'un chunk download.
  - Cible TS pressentie : `DOWNLOAD_CHUNK_SIZE`
  - Statut : porte
  - Notes : constante locale explicite.

- [x] Nom : `MAX_OSPATH`, `MAX_MSGLEN`, `MAX_CONFIGSTRINGS`, `MAX_EDICTS`, `MAX_INFO_STRING`
  - Source : qcommon/server headers
  - Valeur / role : bornes chemins, messages, configstrings, baselines, userinfo.
  - Cible TS pressentie : qcommon imports
  - Statut : consomme
  - Notes : valeurs source conservees.

- [x] Nom : `svc_serverdata`, `svc_stufftext`, `svc_configstring`, `svc_spawnbaseline`, `svc_download`
  - Source : qcommon protocol
  - Valeur / role : opcodes serveur.
  - Cible TS pressentie : `svc_ops_e`
  - Statut : consomme
  - Notes : encodage conserve.

- [x] Nom : `clc_nop`, `clc_userinfo`, `clc_move`, `clc_stringcmd`
  - Source : qcommon protocol
  - Valeur / role : opcodes client.
  - Cible TS pressentie : `clc_ops_e`
  - Statut : consomme
  - Notes : parsing conserve.

- [x] Nom : `PROTOCOL_VERSION`, `UPDATE_MASK`, `LATENCY_COUNTS`
  - Source : qcommon/server headers
  - Valeur / role : handshake et historique frames.
  - Cible TS pressentie : qcommon/server imports
  - Statut : consomme
  - Notes : strict.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `sv_player` | global | `sv_user.ts` | `sv_player` closure | OK Close | contexte explicite |
| `SV_BeginDemoserver` | procedure | `sv_user.ts` | `SV_BeginDemoserver` | OK Close | I/O callback |
| `SV_New_f` | procedure | `sv_user.ts` | `SV_New_f` | OK Close | exposee |
| `SV_Configstrings_f` | procedure | `sv_user.ts` | `SV_Configstrings_f` | OK Close | exposee |
| `SV_Baselines_f` | procedure | `sv_user.ts` | `SV_Baselines_f` | OK Close | exposee |
| `SV_Begin_f` | procedure | `sv_user.ts` | `SV_Begin_f` | OK Close | exposee |
| `SV_NextDownload_f` | procedure | `sv_user.ts` | `SV_NextDownload_f` | OK Close | exposee |
| `SV_BeginDownload_f` | procedure | `sv_user.ts` | `SV_BeginDownload_f` | OK Close | exposee |
| `SV_Disconnect_f` | procedure | `sv_user.ts` | `SV_Disconnect_f` | OK Strict | exposee |
| `SV_ShowServerinfo_f` | procedure | `sv_user.ts` | `SV_ShowServerinfo_f` | OK Close | retourne lignes pour test |
| `SV_Nextserver` | procedure | `sv_user.ts` | `SV_Nextserver` | OK Close | exposee |
| `SV_Nextserver_f` | helper | `sv_user.ts` | `SV_Nextserver_f` | OK local | non exposee |
| `ucmds[]` | dispatch table | `sv_user.ts` | `switch` | OK adapte | ordre conserve |
| `SV_ExecuteUserCommand` | procedure | `sv_user.ts` | `SV_ExecuteUserCommand` | OK Close | exposee |
| `SV_ClientThink` | procedure | `sv_user.ts` | `SV_ClientThink` | OK Strict | exposee |
| `SV_ExecuteClientMessage` | procedure | `sv_user.ts` | `SV_ExecuteClientMessage` | OK Close | exposee |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/server/src/runtime.ts`
- Client : packets reseau et `svc_*` consommes par le pipeline client via netchan/messages
- Server : `sv_main.ts`, `sv_send.ts`, `server.ts`, `index.ts`
- Renderer common : non applicable direct
- Renderer three : non applicable direct
- Web / platform : non applicable direct au comportement principal
- Audio : non applicable direct
- Tests existants : `scripts/verify/quake2-sv-user.ts`, `scripts/verify/quake2-server-runtime.ts`, `scripts/verify/quake2-sv-main.ts`
