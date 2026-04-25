# Audit Portage Quake II - server/sv_ents.c

Date : 2026-04-25

## Verdict

Statut : OK ISO branche
Risque principal : l'I/O demo remplace `fwrite` par un callback `writeDemoMessage`; ce callback doit rester un adapter d'ecriture binaire et ne pas deplacer la construction du message hors de `sv_ents.ts`.

## Source verifiee

- Source C/H : `Quake-2-master/server/sv_ents.c`, `Quake-2-master/server/server.h`, protocol/message qcommon associes
- Port TS : `packages/server/src/sv_ents.ts`
- Consommateurs : `packages/server/src/runtime.ts`, `packages/server/src/sv_send.ts`, `packages/server/src/sv_main.ts`, `packages/server/src/server.ts`, `packages/server/src/index.ts`, `scripts/verify/quake2-sv-ents.ts`

## Fiche d'identification

- Fichier audite : `server/sv_ents.c`
- Source C/H principale : `Quake-2-master/server/sv_ents.c`
- Sources C/H secondaires : `server/server.h`, qcommon protocol/messages, game edicts/client state
- Package : `packages/server`
- Type de fichier : port serveur frame/entity network encoding
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant audit, a passer en `✅`
- Niveau de fidelite annonce : Strict
- Role attendu : construire les frames client, encoder playerstate/entities, calculer FatPVS, enregistrer les messages demo
- Consommateurs directs : `runtime.ts`, `sv_send.ts`, `sv_main.ts`, `server.ts`
- Consommateurs finaux : transmission datagram serveur, frames client, demo recording, facade `packages/server`
- Tests existants : `scripts/verify/quake2-sv-ents.ts`, `scripts/verify/quake2-server-runtime.ts`
- Conclusion audit : OK ISO branche

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `SV_AddProjectileUpdate` | inactive `#if 0` | aucun | aucun | N/A | protocole projectiles desactive dans le C |
| `SV_EmitProjectileUpdate` | inactive `#if 0` | aucun | aucun | N/A | protocole projectiles desactive dans le C |
| `SV_EmitPacketEntities` | helper | `sv_ents.ts` | `SV_EmitPacketEntities` | Valide | local au factory |
| `SV_WritePlayerstateToClient` | helper | `sv_ents.ts` | `SV_WritePlayerstateToClient` | Valide | local au factory |
| `SV_WriteFrameToClient` | procedure | `sv_ents.ts` | `SV_WriteFrameToClient` | Valide | exposee par procedure table |
| `SV_FatPVS` | helper | `sv_ents.ts` | `SV_FatPVS` | Valide | module-local |
| `SV_BuildClientFrame` | procedure | `sv_ents.ts` | `SV_BuildClientFrame` | Valide | exposee par procedure table |
| `SV_RecordDemoMessage` | procedure | `sv_ents.ts` | `SV_RecordDemoMessage` | Valide avec ecart documente | I/O via callback |
| `fatpvs` | global buffer | `sv_ents.ts` | `fatpvs` | Valide | `Uint8Array` module-local |
| `client_frame_t` | type | `server.ts` | `client_frame_t` | Valide | header associe |
| `server_static_t` | type | `server.ts` | `server_static_t` | Valide | header associe |

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

Notes : les helpers purement mecaniques `getClientEntityState`, `getWritableClientEntityState`, `copyEntityState`, `clonePlayerState` ont des noms modernes et restent subordonnes au port.

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

Notes : les fonctions projectiles sont sous `#if 0` dans la source et ne font pas partie du comportement actif.

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

Notes : `think`/`touch`/`use`/`nextthink`, configstrings et temp entities ne sont pas modifies par ce fichier. Les effets pertinents sont `client.frames`, `svs.client_entities`, `svs.next_client_entities`, `surpressCount`, `demo_multicast` et le message reseau.

## Audit item par item

### `SV_EmitPacketEntities`

- [x] Ecrit `svc_packetentities` au debut.
- [x] Utilise `from->num_entities` ou zero si `from` est nul.
- [x] Parcourt les listes old/new jusqu'a epuisement des deux.
- [x] Conserve la sentinelle `9999`.
- [x] Lit le ring `svs.client_entities[(first_entity + index) % num_client_entities]`.
- [x] Delta old/new quand les numeros correspondent.
- [x] Envoie une nouvelle entite depuis `sv.baselines[newnum]`.
- [x] Envoie `U_REMOVE` avec `U_NUMBER16 | U_MOREBITS1` si necessaire.
- [x] Termine par `MSG_WriteShort(msg, 0)`.

### `SV_WritePlayerstateToClient`

- [x] Utilise un playerstate zero quand `from` est nul.
- [x] Calcule tous les flags `PS_M_*`, `PS_VIEW*`, `PS_KICKANGLES`, `PS_BLEND`, `PS_FOV`, `PS_RDFLAGS`, `PS_WEAPONFRAME`.
- [x] Force `PS_WEAPONINDEX`.
- [x] Ecrit `svc_playerinfo`, puis `pflags`.
- [x] Ecrit pmove, vue, weapon, blend, fov et rdflags dans l'ordre source.
- [x] Convertit les champs char/byte/short avec troncature explicite.
- [x] Calcule et ecrit `statbits` puis les stats modifiees sur `MAX_STATS`.

### `SV_WriteFrameToClient`

- [x] Selectionne la frame courante par `sv.framenum & UPDATE_MASK`.
- [x] Utilise `oldframe = null`, `lastframe = -1` si `lastframe <= 0`.
- [x] Rejette le delta si la frame demandee est trop ancienne.
- [x] Ecrit `svc_frame`, `sv.framenum`, `lastframe`, `surpressCount`.
- [x] Remet `surpressCount` a zero.
- [x] Ecrit `areabytes` et `areabits`.
- [x] Appelle `SV_WritePlayerstateToClient` puis `SV_EmitPacketEntities`.

### `SV_FatPVS`

- [x] Calcule `mins/maxs = org +/- 8` sur les trois axes.
- [x] Appelle `CM_BoxLeafnums` avec un maximum de 64 leafs.
- [x] Erreur fatale adaptee si `count < 1`.
- [x] Calcule `longs = (CM_NumClusters() + 31) >> 5`.
- [x] Convertit les leafs en clusters.
- [x] Initialise `fatpvs` depuis le premier cluster PVS.
- [x] Ignore les clusters doublons.
- [x] OR les octets de PVS pour les clusters restants.

### `SV_BuildClientFrame`

- [x] Retourne si le client n'est pas encore en jeu.
- [x] Stocke `frame.senttime = svs.realtime`.
- [x] Calcule l'origine vue depuis `pmove.origin * 0.125 + viewoffset`.
- [x] Calcule leaf, area, cluster client.
- [x] Ecrit areabits avec `CM_WriteAreaBits`.
- [x] Copie le `player_state_t` courant.
- [x] Calcule `SV_FatPVS` et `clientphs`.
- [x] Initialise `num_entities` et `first_entity`.
- [x] Ignore `SVF_NOCLIENT` et les entites sans model/effect/sound/event.
- [x] Conserve les checks area/area2.
- [x] Traite `RF_BEAM` via PHS.
- [x] Traite les entites normales via FatPVS/headnode/clusters.
- [x] Ignore les sons attenues a plus de 400 sans model.
- [x] Copie `ent.s` dans le ring `svs.client_entities`.
- [x] Corrige `ent.s.number` si necessaire.
- [x] Met `state.solid = 0` pour les missiles possedes par le client.
- [x] Incremente `svs.next_client_entities` et `frame.num_entities`.

### `SV_RecordDemoMessage`

- [x] Retourne si `svs.demofile` est absent.
- [x] Cree un buffer de 32768 octets.
- [x] Ecrit `svc_frame`, `sv.framenum`, puis `svc_packetentities`.
- [x] Parcourt les edicts de 1 a `ge.num_edicts - 1`.
- [x] Filtre `inuse`, `s.number`, visibilite model/effects/sound/event et `SVF_NOCLIENT`.
- [x] Ecrit les deltas depuis un etat nul.
- [x] Termine par `MSG_WriteShort(0)`.
- [x] Ajoute `svs.demo_multicast`, puis le clear.
- [x] Prefixe le payload par la longueur little-endian.
- [x] Remplace `fwrite` par `writeDemoMessage` sans deplacer la construction du message.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

Notes : `runtime.ts` compose `sv_ents`; `sv_send.ts` appelle `SV_BuildClientFrame` puis `SV_WriteFrameToClient` dans `SV_SendClientDatagram`; `sv_main.ts` appelle `SV_RecordDemoMessage`; `server.ts` expose les signatures; `index.ts` exporte la facade.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

Notes : non applicable directement ; ce fichier produit des messages serveur et de l'etat client-entity, pas des sorties renderer directes.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

Notes : les champs `s.sound` et `s.event` sont conserves dans l'encodage entity state ; la sortie audio finale est hors de ce fichier.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

Tests existants : `scripts/verify/quake2-sv-ents.ts` charge `base1.bsp`, linke des entites, couvre `SV_BuildClientFrame`, `SV_WriteFrameToClient` et `SV_RecordDemoMessage`; `scripts/verify/quake2-server-runtime.ts` verifie l'exposition runtime.

Tests a ajouter : un cas cible sur suppression `U_REMOVE` avec entity number >= 256 et un cas `SV_BuildClientFrame` pour `RF_BEAM`/PHS verrouilleraient les branches rares.

## Findings

1. [Info] L'I/O demo est adaptee mais le payload reste construit dans le port serveur.
   - Fichier/ligne : `packages/server/src/sv_ents.ts:422`
   - Source originale : `sv_ents.c:680` construit le message puis appelle `fwrite`.
   - Impact : comportement ISO preserve pour le contenu ; seule l'ecriture OS est deleguee.
   - Correction recommandee : aucune ; garder `writeDemoMessage` comme callback d'adapter.

2. [Info] Le protocole projectiles special n'est pas porte car il est inactif dans la source.
   - Fichier/ligne : `Quake-2-master/server/sv_ents.c:35`
   - Source originale : bloc `#if 0`.
   - Impact : aucun sur le comportement actif Quake II.
   - Correction recommandee : aucune ; documenter si ce bloc est reactive un jour.

## Decision

- Corriger maintenant : rien
- Reporter : ajouter des tests branches rares `U_REMOVE >= 256` et `RF_BEAM`
- Documenter : inventaire et audit crees

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `server\sv_ents.c`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/server-sv_ents.audit.md`
