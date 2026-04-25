# Inventaire Portage Quake II - server/sv_send.c

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/server/sv_send.c`
- Sources C/H secondaires : `Quake-2-master/server/server.h`, qcommon msg/netchan/collision/protocol/sound, game edicts
- Package cible principal : `packages/server`
- Fichier TS principal pressenti : `packages/server/src/sv_send.ts`
- Fichiers TS secondaires pressentis : `packages/server/src/server.ts`, `packages/server/src/runtime.ts`, `packages/server/src/sv_ents.ts`, `packages/server/src/sv_main.ts`, `packages/server/src/sv_game.ts`, `packages/server/src/sv_init.ts`, `packages/server/src/index.ts`
- Domaine : serveur, redirection printf, print/broadcast/multicast, sound events, datagrams client, demo playback, rate drop
- Niveau de fidelite attendu : Strict/Close selon adaptations I/O demo
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`
- Exception de decoupage documentee : aucune pour le comportement principal ; `runtime.ts` injecte seulement les callbacks `sv_ents`, `sv_main` et I/O demo.
- Justification si `1 fichier C != 1 fichier TS` : non applicable ; `packages/server/src/sv_send.ts` reste le point principal.

## Inventaire source

### Fonctions

- [x] Nom : `SV_FlushRedirect`
  - Source : `sv_send.c:34`
  - Role : flush redirection console vers packet ou client fiable.
  - Cible TS pressentie : `sv_send.ts:122`
  - Statut : porte Close
  - Notes : `sv_client` et `net_from` passent par contexte.

- [x] Nom : `SV_ClientPrintf`
  - Source : `sv_send.c:65`
  - Role : enfile `svc_print` vers un client si niveau autorise.
  - Cible TS pressentie : `sv_send.ts:144`
  - Statut : porte Close
  - Notes : `vsprintf` adapte par `formatPrintf`.

- [x] Nom : `SV_BroadcastPrintf`
  - Source : `sv_send.c:89`
  - Role : print console dedicated et clients spawned.
  - Cible TS pressentie : `sv_send.ts:164`
  - Statut : porte Close
  - Notes : high bits masques via `stripHighBits`.

- [x] Nom : `SV_BroadcastCommand`
  - Source : `sv_send.c:132`
  - Role : envoie `svc_stufftext` fiable a tous via multicast.
  - Cible TS pressentie : `sv_send.ts:199`
  - Statut : porte
  - Notes : skip si serveur dead.

- [x] Nom : `SV_Multicast`
  - Source : `sv_send.c:161`
  - Role : route `sv.multicast` vers clients selon ALL/PVS/PHS et fiabilite.
  - Cible TS pressentie : `sv_send.ts:219`
  - Statut : porte Strict
  - Notes : ecrit aussi `svs.demo_multicast` si demo recording.

- [x] Nom : `SV_StartSound`
  - Source : `sv_send.c:272`
  - Role : encode un `svc_sound` puis multicast PHS/ALL fiable ou non.
  - Cible TS pressentie : `sv_send.ts:322`
  - Statut : porte Strict
  - Notes : conserve validations volume/attenuation/timeofs, flags et origine bmodel.

- [x] Nom : `SV_SendClientDatagram`
  - Source : `sv_send.c:395`
  - Role : construit une frame client, ajoute datagram, transmet et stocke taille.
  - Cible TS pressentie : `sv_send.ts:518`
  - Statut : porte
  - Notes : depend de `SV_BuildClientFrame`/`SV_WriteFrameToClient` injectes depuis `sv_ents`.

- [x] Nom : `SV_DemoCompleted`
  - Source : `sv_send.c:440`
  - Role : ferme demo et avance nextserver.
  - Cible TS pressentie : `sv_send.ts:428`
  - Statut : porte Close
  - Notes : `fclose` adapte en `closeDemoFile`.

- [x] Nom : `SV_RateDrop`
  - Source : `sv_send.c:459`
  - Role : decide si un client depasse son budget rate.
  - Cible TS pressentie : `sv_send.ts:552`
  - Statut : porte
  - Notes : loopback jamais drop.

- [x] Nom : `SV_SendClientMessages`
  - Source : `sv_send.c:490`
  - Role : envoie demo/cinematic/pic/game datagrams ou reliable-only pulses a tous les clients actifs.
  - Cible TS pressentie : `sv_send.ts:445`
  - Statut : porte Close
  - Notes : lecture demo adaptee en `readDemoMessage`.

### Structures / types

- [x] Nom : `sv_outputbuf[SV_OUTPUTBUF_LENGTH]`
  - Source : `sv_send.c:32`
  - Role : buffer redirect global.
  - Representation TS pressentie : callback `SV_FlushRedirect(outputbuf)`
  - Statut : adapte
  - Notes : storage global non necessaire au port.

- [x] Nom : `ServerSendContext`
  - Source : nouveau contexte TS
  - Role : remplace globals `sv/svs/ge/qnet/maxclients/sv_client/net_from` et callbacks croises.
  - Representation TS pressentie : `sv_send.ts:75`
  - Statut : nouveau contexte
  - Notes : adaptation conforme README.

- [x] Nom : `client_t`, `server_t`, `server_static_t`, `edict_t`
  - Source : `server.h`, game headers
  - Role : clients, buffers netchan/datagram, entites et serveur.
  - Representation TS pressentie : `server.ts`, game runtime
  - Statut : consomme
  - Notes : buffers `sizebuf_t` preserves.

### Enums / constantes / flags / macros utiles

- [x] Nom : `redirect_t` / `RD_PACKET`, `RD_CLIENT`
  - Source : `server.h`
  - Valeur / role : destinations redirect.
  - Cible TS pressentie : `redirect_t`
  - Statut : porte
  - Notes : compare dans `SV_FlushRedirect`.

- [x] Nom : `svc_print`, `svc_stufftext`, `svc_sound`
  - Source : qcommon protocol
  - Valeur / role : opcodes reseau.
  - Cible TS pressentie : `svc_ops_e`
  - Statut : consomme
  - Notes : valeurs conservees par qcommon.

- [x] Nom : `MULTICAST_ALL(_R)`, `MULTICAST_PHS(_R)`, `MULTICAST_PVS(_R)`
  - Source : qcommon/server
  - Valeur / role : modes multicast.
  - Cible TS pressentie : `multicast_t`
  - Statut : consomme
  - Notes : fallthrough fiable conserve.

- [x] Nom : `SND_VOLUME`, `SND_ATTENUATION`, `SND_POS`, `SND_ENT`, `SND_OFFSET`
  - Source : qcommon protocol
  - Valeur / role : flags `svc_sound`.
  - Cible TS pressentie : qcommon imports
  - Statut : consomme
  - Notes : encodage conserve.

- [x] Nom : `DEFAULT_SOUND_PACKET_VOLUME`, `DEFAULT_SOUND_PACKET_ATTENUATION`, `ATTN_NONE`, `CHAN_RELIABLE`, no-PHS flag `8`
  - Source : qcommon shared
  - Valeur / role : decisions sound flags/multicast.
  - Cible TS pressentie : qcommon imports, `CHAN_NO_PHS_ADD`
  - Statut : consomme
  - Notes : valeurs preservees.

- [x] Nom : `MAX_MSGLEN`, `RATE_MESSAGES`
  - Source : qcommon/server
  - Valeur / role : taille message et fenetre rate.
  - Cible TS pressentie : qcommon/server imports
  - Statut : consomme
  - Notes : strict.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `sv_outputbuf` | global buffer | `sv_send.ts` | callback param | adapte | pas de stockage global |
| `SV_FlushRedirect` | procedure | `sv_send.ts` | `SV_FlushRedirect` | OK Close | contexte net/client |
| `SV_ClientPrintf` | procedure | `sv_send.ts` | `SV_ClientPrintf` | OK Close | format TS |
| `SV_BroadcastPrintf` | procedure | `sv_send.ts` | `SV_BroadcastPrintf` | OK Close | high bits |
| `SV_BroadcastCommand` | procedure | `sv_send.ts` | `SV_BroadcastCommand` | OK | exposee |
| `SV_Multicast` | procedure | `sv_send.ts` | `SV_Multicast` | OK | exposee |
| `SV_StartSound` | procedure | `sv_send.ts` | `SV_StartSound` | OK | exposee |
| `SV_SendClientDatagram` | helper | `sv_send.ts` | `SV_SendClientDatagram` | OK | local |
| `SV_DemoCompleted` | procedure | `sv_send.ts` | `SV_DemoCompleted` | OK Close | exposee |
| `SV_RateDrop` | helper | `sv_send.ts` | `SV_RateDrop` | OK | local |
| `SV_SendClientMessages` | procedure | `sv_send.ts` | `SV_SendClientMessages` | OK Close | exposee |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/server/src/runtime.ts`
- Client : messages/demos/sounds consommes ensuite par client parser/audio
- Server : `sv_game.ts`, `sv_init.ts`, `sv_main.ts`, `sv_ccmds.ts`, `sv_ents.ts`, `server.ts`, `index.ts`
- Renderer common : non applicable direct
- Renderer three : non applicable direct
- Web / platform : non applicable direct au comportement principal
- Audio : `SV_StartSound` -> `svc_sound`, couvert par verification audio
- Tests existants : `scripts/verify/quake2-sv-send.ts`, `scripts/verify/quake2-audio-phase11.ts`
