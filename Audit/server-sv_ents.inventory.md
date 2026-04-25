# Inventaire Portage Quake II - server/sv_ents.c

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/server/sv_ents.c`
- Sources C/H secondaires : `Quake-2-master/server/server.h`, protocol/message qcommon, structures `client_t`, `client_frame_t`, `server_static_t`, `edict_t`
- Package cible principal : `packages/server`
- Fichier TS principal pressenti : `packages/server/src/sv_ents.ts`
- Fichiers TS secondaires pressentis : `packages/server/src/server.ts`, `packages/server/src/runtime.ts`, `packages/server/src/sv_send.ts`, `packages/server/src/sv_main.ts`, `packages/server/src/index.ts`
- Domaine : serveur, construction des frames client, encodage delta reseau, PVS/PHS, enregistrement demo
- Niveau de fidelite attendu : Strict
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`
- Exception de decoupage documentee : aucune pour le comportement principal ; `server.ts`, `runtime.ts`, `sv_send.ts` et `sv_main.ts` exposent ou consomment seulement les procedures.
- Justification si `1 fichier C != 1 fichier TS` : non applicable ; `packages/server/src/sv_ents.ts` reste le fichier principal de rattachement.

## Inventaire source

### Fonctions

- [x] Nom : `SV_AddProjectileUpdate`
  - Source : `sv_ents.c:40`
  - Role : protocole special projectiles.
  - Cible TS pressentie : aucune
  - Statut : non porte, code source sous `#if 0`
  - Notes : bloc inactif dans la source originale.

- [x] Nom : `SV_EmitProjectileUpdate`
  - Source : `sv_ents.c:57`
  - Role : encodage special projectiles.
  - Cible TS pressentie : aucune
  - Statut : non porte, code source sous `#if 0`
  - Notes : bloc inactif dans la source originale.

- [x] Nom : `SV_EmitPacketEntities`
  - Source : `sv_ents.c:125`
  - Role : ecrit le delta d'une liste `entity_state_t`.
  - Cible TS pressentie : `sv_ents.ts:126`
  - Statut : porte helper local
  - Notes : conserve sentinelle `9999`, ring `svs.client_entities`, baseline, removals et terminator `0`.

- [x] Nom : `SV_WritePlayerstateToClient`
  - Source : `sv_ents.c:220`
  - Role : encode le delta `player_state_t`.
  - Cible TS pressentie : `sv_ents.ts:193`
  - Statut : porte helper local
  - Notes : conserve flags `PS_*`, ordre d'ecriture, conversions char/byte/short et `MAX_STATS`.

- [x] Nom : `SV_WriteFrameToClient`
  - Source : `sv_ents.c:413`
  - Role : ecrit une frame serveur complete vers un client.
  - Cible TS pressentie : `sv_ents.ts:393`
  - Statut : porte
  - Notes : conserve selection oldframe, `svc_frame`, areabits, playerstate puis packet entities.

- [x] Nom : `SV_FatPVS`
  - Source : `sv_ents.c:475`
  - Role : construit un PVS elargi autour de la position vue client.
  - Cible TS pressentie : `sv_ents.ts:622`
  - Statut : porte helper local
  - Notes : conserve bbox +/-8, 64 leafs, conversion leaf->cluster, OR des PVS distincts.

- [x] Nom : `SV_BuildClientFrame`
  - Source : `sv_ents.c:522`
  - Role : choisit les entites visibles et copie playerstate/areabits.
  - Cible TS pressentie : `sv_ents.ts:467`
  - Statut : porte
  - Notes : conserve PVS/PHS, area checks, beam path, sound attenuation, ring client entities et owner solid=0.

- [x] Nom : `SV_RecordDemoMessage`
  - Source : `sv_ents.c:680`
  - Role : enregistre les entites visibles sans delta pour les demos.
  - Cible TS pressentie : `sv_ents.ts:422`
  - Statut : porte avec adaptation I/O
  - Notes : `fwrite` remplace par callback `writeDemoMessage`, comportement binaire prepare dans le package serveur.

### Structures / types

- [x] Nom : `client_frame_t`
  - Source : `server.h:82`
  - Role : historique de frame client pour delta compression.
  - Representation TS pressentie : `server.ts:174`
  - Statut : porte
  - Notes : champs `areabytes`, `areabits`, `ps`, `num_entities`, `first_entity`, `senttime`.

- [x] Nom : `client_t`
  - Source : `server.h:93`
  - Role : slot client serveur et historique de frames.
  - Representation TS pressentie : `server.ts:188`
  - Statut : porte
  - Notes : `frames[UPDATE_BACKUP]`, `surpressCount`, `edict`, `datagram`.

- [x] Nom : `server_static_t`
  - Source : `server.h:144`
  - Role : etat persistant serveur, ring `client_entities`, demo multicast.
  - Representation TS pressentie : `server.ts:239`
  - Statut : porte
  - Notes : `num_client_entities` et `next_client_entities` explicites.

- [x] Nom : `entity_state_t`, `player_state_t`, `sizebuf_t`
  - Source : qcommon/protocol
  - Role : etats encodes et buffer reseau.
  - Representation TS pressentie : `packages/qcommon`, `packages/memory`
  - Statut : consomme
  - Notes : mutations effectuees via helpers `MSG_*` et `SZ_*`.

- [x] Nom : `ServerEntityContext`
  - Source : nouveau contexte TS
  - Role : regroupe `sv`, `svs`, `ge`, `collisionWorld`, `maxclients`, callbacks erreur/I/O.
  - Representation TS pressentie : `sv_ents.ts:85`
  - Statut : nouveau contexte
  - Notes : adaptation des globals C autorisee par la procedure.

### Enums / constantes / flags / macros utiles

- [x] Nom : `UPDATE_BACKUP`, `UPDATE_MASK`
  - Source : qcommon protocol / `server.h`
  - Valeur / role : `16`, masque ring de frames.
  - Cible TS pressentie : `packages/qcommon/src/protocol.ts`
  - Statut : consomme
  - Notes : valeurs conservees.

- [x] Nom : `MAX_PACKET_ENTITIES`
  - Source : `server.h`
  - Valeur / role : `64`, budget par paquet client.
  - Cible TS pressentie : `server.ts:107`
  - Statut : porte
  - Notes : utilise pour dimensionner le ring via helper serveur.

- [x] Nom : `MAX_STATS`
  - Source : qcommon shared
  - Valeur / role : `32`, nombre de stats playerstate.
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`
  - Statut : consomme
  - Notes : boucle stats identique.

- [x] Nom : `svc_frame`, `svc_packetentities`, `svc_playerinfo`
  - Source : qcommon protocol
  - Valeur / role : opcodes reseau.
  - Cible TS pressentie : `svc_ops_e`
  - Statut : consomme
  - Notes : ordre d'ecriture conserve.

- [x] Nom : `PS_*`
  - Source : qcommon protocol
  - Valeur / role : bitflags delta playerstate.
  - Cible TS pressentie : `packages/qcommon/src/protocol.ts`
  - Statut : consomme
  - Notes : valeurs identiques.

- [x] Nom : `U_REMOVE`, `U_NUMBER16`, `U_MOREBITS1`
  - Source : qcommon protocol
  - Valeur / role : bitflags suppression entity delta.
  - Cible TS pressentie : `packages/qcommon/src/protocol.ts`
  - Statut : consomme
  - Notes : valeurs identiques.

- [x] Nom : `SVF_NOCLIENT`, `RF_BEAM`
  - Source : game/qcommon
  - Valeur / role : filtres visibility et beam.
  - Cible TS pressentie : `packages/game`, `packages/qcommon`
  - Statut : consomme
  - Notes : valeurs conservees par les modules sources.

- [x] Nom : `fatpvs[65536/8]`
  - Source : `sv_ents.c:465`
  - Valeur / role : buffer PVS elargi.
  - Cible TS pressentie : `sv_ents.ts:98`
  - Statut : porte
  - Notes : `Uint8Array` de meme taille.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `SV_AddProjectileUpdate` | inactive `#if 0` | aucun | aucun | N/A | bloc source inactif |
| `SV_EmitProjectileUpdate` | inactive `#if 0` | aucun | aucun | N/A | bloc source inactif |
| `SV_EmitPacketEntities` | helper | `sv_ents.ts` | `SV_EmitPacketEntities` | OK | local |
| `SV_WritePlayerstateToClient` | helper | `sv_ents.ts` | `SV_WritePlayerstateToClient` | OK | local |
| `SV_WriteFrameToClient` | procedure | `sv_ents.ts` | `SV_WriteFrameToClient` | OK | exposee via procedure table |
| `SV_FatPVS` | helper | `sv_ents.ts` | `SV_FatPVS` | OK | helper module |
| `SV_BuildClientFrame` | procedure | `sv_ents.ts` | `SV_BuildClientFrame` | OK | exposee via procedure table |
| `SV_RecordDemoMessage` | procedure | `sv_ents.ts` | `SV_RecordDemoMessage` | OK avec adaptation | callback I/O documente |
| `fatpvs` | global buffer | `sv_ents.ts` | `fatpvs` | OK | module-local |
| `client_frame_t` | type | `server.ts` | `client_frame_t` | OK | declaration header |
| `server_static_t` | type | `server.ts` | `server_static_t` | OK | declaration header |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/server/src/runtime.ts`
- Client : flux client via datagram serveur, pas de logique cliente directe
- Server : `packages/server/src/sv_send.ts`, `packages/server/src/sv_main.ts`, `packages/server/src/server.ts`, `packages/server/src/index.ts`
- Renderer common : indirect via client state reseau, non applicable direct
- Renderer three : indirect via client state reseau, non applicable direct
- Web / platform : non applicable direct pour le comportement principal
- Audio : effets/sounds encodes dans `entity_state_t`, consommation audio finale hors de ce fichier
- Tests existants : `scripts/verify/quake2-sv-ents.ts`, `scripts/verify/quake2-server-runtime.ts`, tests `sv_send` avec callbacks `SV_BuildClientFrame`/`SV_WriteFrameToClient`
