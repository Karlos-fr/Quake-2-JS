# Audit Portage Quake II - server/sv_send.c

Date : 2026-04-25

## Verdict

Statut : OK avec ecarts documentes
Risque principal : la lecture/fermeture des demos serveur est abstraite par callbacks ; ces callbacks doivent rester de l'I/O binaire et ne pas reconstruire la logique de `SV_SendClientMessages`.

## Source verifiee

- Source C/H : `Quake-2-master/server/sv_send.c`, `Quake-2-master/server/server.h`, qcommon msg/netchan/collision/protocol/sound, game edicts
- Port TS : `packages/server/src/sv_send.ts`
- Consommateurs : `packages/server/src/runtime.ts`, `packages/server/src/sv_game.ts`, `packages/server/src/sv_init.ts`, `packages/server/src/sv_main.ts`, `packages/server/src/sv_ccmds.ts`, `packages/server/src/sv_ents.ts`, `scripts/verify/quake2-sv-send.ts`, `scripts/verify/quake2-audio-phase11.ts`

## Fiche d'identification

- Fichier audite : `server/sv_send.c`
- Source C/H principale : `Quake-2-master/server/sv_send.c`
- Sources C/H secondaires : `server/server.h`, qcommon msg/netchan/collision/protocol/sound, game edicts
- Package : `packages/server`
- Type de fichier : port serveur message dispatch/multicast/send
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant audit, a passer en `✅`
- Niveau de fidelite annonce : Strict/Close selon adaptation I/O
- Role attendu : print/broadcast/multicast/sound, datagrams client, demo playback, rate limiting
- Consommateurs directs : `runtime.ts`, `sv_game.ts`, `sv_init.ts`, `sv_main.ts`, `sv_ccmds.ts`
- Consommateurs finaux : clients reseau, parser client/audio, server demo playback, gameplay imports
- Tests existants : `scripts/verify/quake2-sv-send.ts`, `scripts/verify/quake2-audio-phase11.ts`
- Conclusion audit : OK avec ecarts documentes

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `sv_outputbuf` | global buffer | `sv_send.ts` | callback param | Valide avec ecart | buffer global non necessaire |
| `SV_FlushRedirect` | procedure | `sv_send.ts` | `SV_FlushRedirect` | Valide Close | contexte explicite |
| `SV_ClientPrintf` | procedure | `sv_send.ts` | `SV_ClientPrintf` | Valide Close | format TS |
| `SV_BroadcastPrintf` | procedure | `sv_send.ts` | `SV_BroadcastPrintf` | Valide Close | dedicated print hook |
| `SV_BroadcastCommand` | procedure | `sv_send.ts` | `SV_BroadcastCommand` | Valide | exposee |
| `SV_Multicast` | procedure | `sv_send.ts` | `SV_Multicast` | Valide | exposee |
| `SV_StartSound` | procedure | `sv_send.ts` | `SV_StartSound` | Valide | exposee |
| `SV_SendClientDatagram` | helper | `sv_send.ts` | `SV_SendClientDatagram` | Valide | local |
| `SV_DemoCompleted` | procedure | `sv_send.ts` | `SV_DemoCompleted` | Valide Close | close callback |
| `SV_RateDrop` | helper | `sv_send.ts` | `SV_RateDrop` | Valide | local |
| `SV_SendClientMessages` | procedure | `sv_send.ts` | `SV_SendClientMessages` | Valide Close | demo read callback |

## Checklist README

### Fidelite de portage

- [x] Le fichier garde le code C original comme source de verite.
- [x] Les comportements critiques sont portes avant toute modernisation.
- [x] L'ordre logique des appels correspond au source.
- [x] Les branches speciales du source sont conservees.
- [x] Les valeurs numeriques, flags, bitmasks et constantes sont identiques.
- [x] Les conversions numeriques sont explicites.
- [x] Les structures de donnees restent proches du source quand la fidelite compte.
- [x] Les globals C sont remplaces par un runtime/contexte clair.
- [x] Les ecarts volontaires sont documentes.

### Nommage, decoupage, rattachement

- [x] Le nom du fichier preserve la tracabilite avec la source.
- [x] Les fonctions portees conservent le style original.
- [x] Les fonctions nouvelles utilisent `camelCase`.
- [x] Les types/interfaces modernes utilisent `PascalCase`.
- [x] Les constantes source conservent leurs noms et valeurs.
- [x] Le fichier TS a une source C/H principale claire.
- [x] Le rattachement est coherent avec `PORTAGE_QUAKE2.md`.
- [x] Le fichier principal de rattachement est identifiable.
- [x] Le decoupage ne masque pas la lecture du comportement original.
- [x] Le fichier ne devient pas un fourre-tout.
- [x] Les helpers nouveaux restent locaux et subordonnes au portage.

### Commentaires et documentation

- [x] Le fichier a un header de module conforme.
- [x] Le header indique `File`, `Source`, `Purpose`, `Porting policy`, `Deviations`, `Notes`.
- [x] Les fonctions portees ont un header conforme.
- [x] Les fonctions nouvelles ont un header conforme.
- [x] Les deviations importantes sont documentees pres du code concerne.

### Separation runtime / adapter

- [x] Le fichier ne melange pas logique moteur, rendu et UI.
- [x] Un module `Strict` ou `Close` ne depend pas d'un module `Adapter`.
- [x] `packages/platform` ne porte pas le comportement principal audite.
- [x] `apps/web` ne porte pas le comportement principal audite.
- [x] Les hooks remplacent seulement les appels renderer/audio/OS.

## Checklist ISO source

### Comparaison structurelle

- [x] Les fonctions sources correspondantes ont ete lues.
- [x] Les headers `.h` associes ont ete verifies.
- [x] Les constantes utilisees viennent du bon header/source.
- [x] Les structs source ont une representation TS equivalente.
- [x] Les enums et flags conservent leurs valeurs.
- [x] Les variables globales source ont un equivalent runtime clair.
- [x] Les macros utiles sont portees ou documentees.
- [x] Les chemins `#ifdef`, extensions ou variantes sont traites ou documentes.

### Comparaison comportementale

- [x] Les entrees correspondent au source.
- [x] Les sorties correspondent au source.
- [x] Les mutations d'etat correspondent au source.
- [x] Les retours anticipes sont conserves.
- [x] Les boucles et leur ordre sont conserves.
- [x] Les timings sont fideles.
- [x] Les randomisations conservent l'intention source.
- [x] Les listes/pools sont manipules comme dans le source.

### Effets secondaires

- [x] Entites creees/liberees/linkees.
- [x] `think`, `touch`, `use`, `nextthink` mis a jour.
- [x] Etats runtime synchronises.
- [x] Configstrings mises a jour.
- [x] Temp entities mises a jour.
- [x] Sons emis avec les bons parametres.
- [x] Sorties renderer/audio correctement alimentees si applicable.

Notes : ce fichier ne cree/libere pas d'entites et ne modifie pas `think`/`touch`/configstrings directement. Effets pertinents : buffers netchan/datagram/multicast, demo_multicast, `surpressCount`, `message_size`, demo EOF et sound events.

## Audit item par item

### Print, redirect et broadcast

- [x] `SV_FlushRedirect` route `RD_PACKET` vers OOB `print`.
- [x] `SV_FlushRedirect` route `RD_CLIENT` vers `svc_print` reliable client.
- [x] `SV_ClientPrintf` respecte `messagelevel`.
- [x] `SV_ClientPrintf` ecrit opcode, level et string.
- [x] `SV_BroadcastPrintf` echo console dedicated avec high bits masques.
- [x] `SV_BroadcastPrintf` ecrit seulement aux clients spawned acceptant le level.
- [x] `SV_BroadcastCommand` retourne si serveur dead.
- [x] `SV_BroadcastCommand` ecrit `svc_stufftext` puis `SV_Multicast(NULL, ALL_R)` adapte en origine neutre.

### `SV_Multicast`

- [x] Calcule leaf/area quand mode non ALL.
- [x] Copie le multicast dans `svs.demo_multicast` si server demo actif.
- [x] Preserve fallthrough fiable pour `*_R`.
- [x] Calcule masques PHS/PVS depuis cluster source.
- [x] Refuse les modes invalides.
- [x] Ignore clients free/zombie.
- [x] Ignore clients non spawned pour multicast non fiable.
- [x] Filtre PVS/PHS par area connected et bit cluster.
- [x] Ecrit fiable vers `netchan.message`, non fiable vers `datagram`.
- [x] Clear `sv.multicast` a la fin.

### `SV_StartSound`

- [x] Valide `volume`, `attenuation`, `timeofs`.
- [x] Calcule entity number et no-PHS flag.
- [x] Construit `sendchan = ent << 3 | channel & 7`.
- [x] Calcule flags volume/attenuation/pos/ent/offset.
- [x] Calcule origine explicite, entite normale ou midpoint bmodel.
- [x] Ecrit `svc_sound`, flags, soundindex, champs optionnels, sendchan et pos.
- [x] Force ALL si `ATTN_NONE`.
- [x] Route reliable/non reliable vers PHS ou ALL comme le source.

### Datagram, demo et rate

- [x] `SV_SendClientDatagram` appelle `SV_BuildClientFrame`.
- [x] Initialise un message `MAX_MSGLEN` overflow-allowed.
- [x] Appelle `SV_WriteFrameToClient` avant d'ajouter `client.datagram`.
- [x] Gere overflow datagram/message par warning et clear.
- [x] Transmet via `Netchan_Transmit`.
- [x] Stocke `message_size[sv.framenum % RATE_MESSAGES]`.
- [x] `SV_DemoCompleted` ferme demo et appelle `SV_Nextserver`.
- [x] `SV_RateDrop` exempte loopback.
- [x] `SV_RateDrop` somme `RATE_MESSAGES`, incremente `surpressCount` et zero slot courant si depassement.
- [x] `SV_SendClientMessages` lit demo quand `ss_demo` non pause.
- [x] `SV_SendClientMessages` complete demo sur EOF ou callback absent.
- [x] `SV_SendClientMessages` erreur si demo payload > `MAX_MSGLEN`.
- [x] `SV_SendClientMessages` drop client si reliable overflow.
- [x] Transmet cinematic/demo/pic payload a tous les clients actifs.
- [x] Pour clients spawned game, applique rate drop puis datagram.
- [x] Pour clients non spawned, transmet reliable-only si besoin ou apres 1000 ms.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

Notes : `runtime.ts` branche `SV_Multicast`, `SV_StartSound`, `SV_ClientPrintf`, `SV_BroadcastPrintf`, `SV_BroadcastCommand` vers `sv_game`, `sv_init`, `sv_main`, `sv_ccmds`; `sv_main.ts` appelle `SV_SendClientMessages`; `sv_ents.ts` fournit frame build/write.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

Notes : non applicable directement ; `svc_sound` et messages sont consommes via pipeline client.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

Notes : `SV_StartSound` encode `svc_sound`; `scripts/verify/quake2-audio-phase11.ts` verifie l'encodage consomme par le parser client.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

Tests existants : `scripts/verify/quake2-sv-send.ts` couvre print/broadcast, multicast, sound fiable/non fiable, null origin PHS/PVS, datagram send, overflow/drop, rate drop, loopback exemption, demo playback et EOF. `scripts/verify/quake2-audio-phase11.ts` couvre l'encodage `svc_sound`.

Tests a ajouter : cas PVS/PHS avec deux clients dans areas distinctes, `SV_FlushRedirect(RD_PACKET/RD_CLIENT)` explicite, `SV_SendClientMessages` non-spawned reliable pulse apres 1000ms et demo payload trop grand.

## Findings

1. [Info] L'I/O demo est adaptee en callbacks.
   - Fichier/ligne : `packages/server/src/sv_send.ts:445`
   - Source originale : `sv_send.c:490` lit `fread` longueur + payload depuis `sv.demofile`.
   - Impact : contenu et decisions de flux restent dans `SV_SendClientMessages`, I/O seulement externalisee.
   - Correction recommandee : aucune ; garder `readDemoMessage`/`closeDemoFile` comme adapters binaires.

2. [Info] `SV_Multicast` rend explicite l'erreur d'origine nulle pour PHS/PVS.
   - Fichier/ligne : `packages/server/src/sv_send.ts:219`
   - Source originale : `sv_send.c:161` suppose une origine valide pour modes non ALL.
   - Impact : echec plus lisible en TS au lieu d'un acces invalide.
   - Correction recommandee : aucune.

3. [Info] `SV_StartSound` refuse une entite nulle explicitement.
   - Fichier/ligne : `packages/server/src/sv_send.ts:322`
   - Source originale : `sv_send.c:272` dereference `entity`.
   - Impact : garde TS defensive, pas de divergence pour appel valide.
   - Correction recommandee : aucune.

## Decision

- Corriger maintenant : rien
- Reporter : tests PVS/PHS multi-area, redirect explicite, reliable pulse non-spawned, demo oversize
- Documenter : inventaire et audit crees

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `server\sv_send.c`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/server-sv_send.audit.md`
