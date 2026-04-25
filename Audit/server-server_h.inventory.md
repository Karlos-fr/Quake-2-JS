# Inventaire Portage Quake II - server/server.h

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/server/server.h`
- Sources C/H secondaires : `Quake-2-master/qcommon/qcommon.h`, `Quake-2-master/game/game.h`
- Package cible principal : `packages/server`
- Fichier TS principal pressenti : `packages/server/src/server.ts`
- Fichiers TS secondaires pressentis : `packages/server/src/index.ts`, `packages/server/src/runtime.ts`, `packages/server/src/sv_main.ts`, `packages/server/src/sv_init.ts`, `packages/server/src/sv_send.ts`, `packages/server/src/sv_user.ts`, `packages/server/src/sv_ccmds.ts`, `packages/server/src/sv_ents.ts`, `packages/server/src/sv_game.ts`, `packages/server/src/sv_world.ts`
- Domaine : declarations serveur partagees, constantes, structures, enums, globals, contrats `SV_*`
- Niveau de fidelite attendu : Strict pour constantes/enums/signatures, Close pour representations de structs C en interfaces TS
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 fichier H = 1 fichier TS`
- Exception de decoupage documentee : les implementations vivent dans les fichiers `sv_*.ts`; `server.ts` reste le header principal et expose les contrats de signatures.
- Justification si `1 fichier C != 1 fichier TS` : non applicable ; header mixte porte principalement dans `server.ts`.

## Inventaire source

### Fonctions

- [x] Nom : `EDICT_NUM`
  - Source : `server.h:69`
  - Role : macro pointer arithmetic vers l'edict d'index `n`.
  - Cible TS pressentie : `server.ts:602`
  - Statut : porte Close
  - Notes : remplace par indexation explicite `game.edicts[index]`.

- [x] Nom : `NUM_FOR_EDICT`
  - Source : `server.h:70`
  - Role : macro pointer subtraction pour obtenir l'index d'un edict.
  - Cible TS pressentie : `server.ts:618`
  - Statut : porte Close
  - Notes : remplace par `Array#indexOf`.

- [x] Nom : declarations `sv_main.c`
  - Source : `server.h:205`
  - Role : contrats `SV_FinalMessage`, `SV_DropClient`, index helpers, clientdata, userinfo, heartbeat.
  - Cible TS pressentie : `ServerMainProcedures`, `ServerInitProcedures`, `ServerUserProcedures`, `ServerConsoleProcedures`
  - Statut : porte
  - Notes : `SV_WriteClientdataToMessage`, `SV_SendServerinfo`, `Master_Packet` restent visibles comme contrats optionnels car aucun corps source n'est present dans ce depot.

- [x] Nom : declarations `sv_init.c`
  - Source : `server.h:229`
  - Role : `SV_InitGame`, `SV_Map`.
  - Cible TS pressentie : `ServerInitProcedures`
  - Statut : porte
  - Notes : interface contient aussi les helpers indexes portes par `sv_init.c`.

- [x] Nom : declarations `sv_phys.c`
  - Source : `server.h:236`
  - Role : `SV_PrepWorldFrame`.
  - Cible TS pressentie : `ServerPhysicsProcedures` et `ServerMainProcedures`
  - Statut : porte
  - Notes : expose le contrat.

- [x] Nom : declarations `sv_send.c`
  - Source : `server.h:241`
  - Role : redirect, multicast, sons, prints, messages clients.
  - Cible TS pressentie : `redirect_t`, `SV_OUTPUTBUF_LENGTH`, `ServerSendProcedures`
  - Statut : porte
  - Notes : signatures variadiques adaptees par `...args`.

- [x] Nom : declarations `sv_user.c`
  - Source : `server.h:261`
  - Role : `SV_Nextserver`, `SV_ExecuteClientMessage`.
  - Cible TS pressentie : `ServerUserProcedures`
  - Statut : porte
  - Notes : interface contient aussi les commandes utilisateur internes portees.

- [x] Nom : declarations `sv_ccmds.c`
  - Source : `server.h:267`
  - Role : `SV_ReadLevelFile`, `SV_Status_f`.
  - Cible TS pressentie : `ServerConsoleProcedures`
  - Statut : porte
  - Notes : `SV_InitOperatorCommands` rattache aussi ici.

- [x] Nom : declarations `sv_ents.c`
  - Source : `server.h:273`
  - Role : frames clients, demo messages, client frame build, error.
  - Cible TS pressentie : `ServerEntityProcedures`
  - Statut : porte
  - Notes : `SV_Error` typable comme never dans contexts concrets, contrat header reste void-like.

- [x] Nom : declarations `sv_game.c`
  - Source : `server.h:283`
  - Role : `ge`, init/shutdown game progs, init edict.
  - Cible TS pressentie : `ServerHeaderState.ge`, `ServerGameProcedures`
  - Statut : porte
  - Notes : `ge` dans bundle globals.

- [x] Nom : declarations `sv_world.c`
  - Source : `server.h:298`
  - Role : clear/link/query/trace monde serveur.
  - Cible TS pressentie : `ServerWorldProcedures`
  - Statut : porte
  - Notes : consommateurs runtime et gameplay verifies dans audit `sv_world`.

### Structures / types

- [x] Nom : `server_state_t`
  - Source : `server.h:33`
  - Role : etats serveur.
  - Representation TS pressentie : `server_state_t`
  - Statut : porte Strict
  - Notes : valeurs ordinales conservees.

- [x] Nom : `server_t`
  - Source : `server.h:44`
  - Role : etat serveur par map.
  - Representation TS pressentie : `server_t`
  - Statut : porte Close
  - Notes : arrays fixes via JS arrays/buffers, `FILE *` en `unknown | null`.

- [x] Nom : `client_state_t`
  - Source : `server.h:75`
  - Role : etats client serveur.
  - Representation TS pressentie : `client_state_t`
  - Statut : porte Strict
  - Notes : valeurs ordinales conservees.

- [x] Nom : `client_frame_t`
  - Source : `server.h:84`
  - Role : frame historique delta/ping.
  - Representation TS pressentie : `client_frame_t`
  - Statut : porte Close
  - Notes : `areabits` en `Uint8Array(MAX_MAP_AREAS/8)`.

- [x] Nom : `client_t`
  - Source : `server.h:99`
  - Role : slot client serveur.
  - Representation TS pressentie : `client_t`
  - Statut : porte Close
  - Notes : buffers, frames, netchan et download representes explicitement.

- [x] Nom : `challenge_t`
  - Source : `server.h:152`
  - Role : challenge anti spoofing/DoS.
  - Representation TS pressentie : `challenge_t`
  - Statut : porte Strict
  - Notes : adr/challenge/time.

- [x] Nom : `server_static_t`
  - Source : `server.h:160`
  - Role : etat persistant serveur.
  - Representation TS pressentie : `server_static_t`
  - Statut : porte Close
  - Notes : clients/client_entities dynamiques, challenges fixes.

- [x] Nom : `redirect_t`
  - Source : `server.h:242`
  - Role : destination redirect console.
  - Representation TS pressentie : `redirect_t`
  - Statut : porte Strict
  - Notes : valeurs ordinales conservees.

- [x] Nom : extern globals
  - Source : `server.h:184`
  - Role : `net_from`, `net_message`, `master_adr`, `svs`, `sv`, cvars, current client/player, `ge`, outputbuf.
  - Representation TS pressentie : `ServerHeaderState`
  - Statut : porte
  - Notes : bundle explicite conforme README.

### Enums / constantes / flags / macros utiles

- [x] Nom : `MAX_MASTERS`
  - Source : `server.h:31`
  - Valeur / role : `8`
  - Cible TS pressentie : `server.ts`
  - Statut : porte
  - Notes : teste.

- [x] Nom : `LATENCY_COUNTS`
  - Source : `server.h:94`
  - Valeur / role : `16`
  - Cible TS pressentie : `server.ts`
  - Statut : porte
  - Notes : teste.

- [x] Nom : `RATE_MESSAGES`
  - Source : `server.h:95`
  - Valeur / role : `10`
  - Cible TS pressentie : `server.ts`
  - Statut : porte
  - Notes : teste.

- [x] Nom : `MAX_CHALLENGES`
  - Source : `server.h:150`
  - Valeur / role : `1024`
  - Cible TS pressentie : `server.ts`
  - Statut : porte
  - Notes : teste.

- [x] Nom : `SV_OUTPUTBUF_LENGTH`
  - Source : `server.h:243`
  - Valeur / role : `MAX_MSGLEN - 16`
  - Cible TS pressentie : `server.ts`
  - Statut : porte
  - Notes : teste `1384`.

- [x] Nom : `MAX_PACKET_ENTITIES`
  - Source : dependance implicite de `server.h` via `UPDATE_BACKUP * MAX_PACKET_ENTITIES`
  - Valeur / role : `64`
  - Cible TS pressentie : `server.ts`
  - Statut : porte derive
  - Notes : helper `computeServerClientEntityCapacity`.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `MAX_MASTERS` | constante | `server.ts` | `MAX_MASTERS` | OK | `8` |
| `server_state_t` | enum | `server.ts` | `server_state_t` | OK | valeurs conservees |
| `server_t` | struct | `server.ts` | `server_t` | OK | factory associee |
| `EDICT_NUM` | macro | `server.ts` | `EDICT_NUM` | OK | array indexing |
| `NUM_FOR_EDICT` | macro | `server.ts` | `NUM_FOR_EDICT` | OK | `indexOf` |
| `client_state_t` | enum | `server.ts` | `client_state_t` | OK | valeurs conservees |
| `client_frame_t` | struct | `server.ts` | `client_frame_t` | OK | factory associee |
| `client_t` | struct | `server.ts` | `client_t` | OK | factory associee |
| `MAX_CHALLENGES` | constante | `server.ts` | `MAX_CHALLENGES` | OK | `1024` |
| `challenge_t` | struct | `server.ts` | `challenge_t` | OK | factory associee |
| `server_static_t` | struct | `server.ts` | `server_static_t` | OK | factory associee |
| extern globals | globals | `server.ts` | `ServerHeaderState` | OK | contexte explicite |
| `redirect_t` | enum | `server.ts` | `redirect_t` | OK | valeurs conservees |
| `SV_OUTPUTBUF_LENGTH` | constante | `server.ts` | `SV_OUTPUTBUF_LENGTH` | OK | `MAX_MSGLEN - 16` |
| declarations `SV_*` | prototypes | `server.ts` | `Server*Procedures` | OK apres correction | contrats groupes par module |

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
- Server : tous les `packages/server/src/sv_*.ts`, `host.ts`, `index.ts`
- Renderer common : non applicable
- Renderer three : non applicable
- Web / platform : non applicable direct
- Audio : non applicable direct
- Tests existants : `scripts/verify/quake2-server-header.ts`, integrations serveur dependantes
