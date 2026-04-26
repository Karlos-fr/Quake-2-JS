# Audit Portage Quake II - server/sv_user.c

Date : 2026-04-25

## Verdict

Statut : OK avec ecarts documentes
Risque principal : l'I/O demo/download est abstraite par callbacks ; ces callbacks doivent rester de simples adapters binaires et ne pas reconstruire la logique de validation, chunking ou nextserver.

## Source verifiee

- Source C/H : `Quake-2-master/server/sv_user.c`, `Quake-2-master/server/server.h`, qcommon cmd/cvar/msg/protocol/filesystem, game exports/edicts
- Port TS : `packages/server/src/sv_user.ts`
- Consommateurs : `packages/server/src/runtime.ts`, `packages/server/src/sv_main.ts`, `packages/server/src/sv_send.ts`, `packages/server/src/server.ts`, `packages/server/src/index.ts`, `scripts/verify/quake2-sv-user.ts`, `scripts/verify/quake2-server-runtime.ts`

## Fiche d'identification

- Fichier audite : `server/sv_user.c`
- Source C/H principale : `Quake-2-master/server/sv_user.c`
- Sources C/H secondaires : `server/server.h`, qcommon cmd/cvar/msg/protocol/filesystem, game exports/edicts
- Package : `packages/server`
- Type de fichier : port serveur bootstrap client, user commands, download, usercmd message execution
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant audit, a passer en `✅`
- Niveau de fidelite annonce : Strict/Close selon adaptation I/O et contexte explicite
- Role attendu : handshake client, streaming configstrings/baselines, downloads, nextserver, parsing `clc_*`
- Consommateurs directs : `runtime.ts`, `sv_main.ts`, `sv_send.ts`, `server.ts`, `index.ts`
- Consommateurs finaux : boucle reseau serveur, clients netchan, game exports `ClientBegin`/`ClientCommand`/`ClientThink`, callbacks filesystem/demo
- Tests existants : `scripts/verify/quake2-sv-user.ts`, `scripts/verify/quake2-server-runtime.ts`, `scripts/verify/quake2-sv-main.ts`
- Conclusion audit : OK avec ecarts documentes

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `sv_player` | global | `sv_user.ts` | closure `sv_player` | Valide Close | remplace global par contexte |
| `SV_BeginDemoserver` | procedure | `sv_user.ts` | `SV_BeginDemoserver` | Valide Close | `openDemoFile` |
| `SV_New_f` | procedure | `sv_user.ts` | `SV_New_f` | Valide Close | serverdata + edict + configstrings |
| `SV_Configstrings_f` | procedure | `sv_user.ts` | `SV_Configstrings_f` | Valide Close | streaming par demi-message |
| `SV_Baselines_f` | procedure | `sv_user.ts` | `SV_Baselines_f` | Valide Close | nullstate explicite |
| `SV_Begin_f` | procedure | `sv_user.ts` | `SV_Begin_f` | Valide Close | `ClientBegin` + defer |
| `SV_NextDownload_f` | procedure | `sv_user.ts` | `SV_NextDownload_f` | Valide Close | chunk 1024 |
| `SV_BeginDownload_f` | procedure | `sv_user.ts` | `SV_BeginDownload_f` | Valide Close | callbacks FS, refus preserves |
| `SV_Disconnect_f` | procedure | `sv_user.ts` | `SV_Disconnect_f` | Valide Strict | `SV_DropClient` callback |
| `SV_ShowServerinfo_f` | procedure | `sv_user.ts` | `SV_ShowServerinfo_f` | Valide Close | retourne les lignes en plus |
| `SV_Nextserver` | procedure | `sv_user.ts` | `SV_Nextserver` | Valide Close | exposee |
| `SV_Nextserver_f` | helper | `sv_user.ts` | `SV_Nextserver_f` | Valide local | non exposee |
| `ucmd_t` / `ucmds[]` | dispatch | `sv_user.ts` | `switch` | Valide adapte | commandes conservees |
| `SV_ExecuteUserCommand` | procedure | `sv_user.ts` | `SV_ExecuteUserCommand` | Valide Close | exposee |
| `SV_ClientThink` | procedure | `sv_user.ts` | `SV_ClientThink` | Valide Strict | exposee |
| `SV_ExecuteClientMessage` | procedure | `sv_user.ts` | `SV_ExecuteClientMessage` | Valide Close | exposee |
| `MAX_STRINGCMDS` | constante | `sv_user.ts` | `MAX_STRINGCMDS` | Valide | valeur 8 |
| download chunk | constante | `sv_user.ts` | `DOWNLOAD_CHUNK_SIZE` | Valide | valeur 1024 |

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

Notes : ce fichier ne cree pas d'entites et ne modifie pas `think`/`touch`/sons/temp entities directement. Effets pertinents : binding `client.edict`, `client.state`, buffers netchan, `sv.demofile`, downloads, `svs.spawncount`, `cmd_text`, `lastframe`, `frame_latency`, `lastcmd`, `commandMsec`, `userinfo`.

## Audit item par item

### Bootstrap client

- [x] `SV_BeginDemoserver` construit `demos/<sv.name>` et garde le handle dans `sv.demofile`.
- [x] `SV_New_f` refuse un client deja spawned.
- [x] `SV_New_f` route `ss_demo` vers `SV_BeginDemoserver`.
- [x] `SV_New_f` ecrit `svc_serverdata`, `PROTOCOL_VERSION`, `spawncount`, `attractloop`, `gamedir`.
- [x] `SV_New_f` force `playernum = -1` pour cinematic/pic.
- [x] `SV_New_f` ecrit le level name `CS_NAME`.
- [x] `SV_New_f` attache `EDICT_NUM(playernum + 1)`, initialise `lastcmd`, demande `cmd configstrings`.
- [x] `SV_Configstrings_f` valide `cs_connected` et `spawncount`.
- [x] `SV_Configstrings_f` stream jusqu'a `MAX_CONFIGSTRINGS` ou `MAX_MSGLEN / 2`.
- [x] `SV_Configstrings_f` chaine vers `baselines` ou se relance avec le nouvel index.
- [x] `SV_Baselines_f` valide `cs_connected` et `spawncount`.
- [x] `SV_Baselines_f` ecrit seulement les baselines avec model/sound/effects.
- [x] `SV_Baselines_f` chaine vers `precache` ou se relance.
- [x] `SV_Begin_f` valide `spawncount`, passe `cs_spawned`, appelle `ClientBegin`, puis `Cbuf_InsertFromDefer`.

### Downloads et serverinfo

- [x] `SV_NextDownload_f` retourne si aucun download.
- [x] `SV_NextDownload_f` limite les chunks a 1024 octets.
- [x] `SV_NextDownload_f` ecrit taille, pourcentage et payload.
- [x] `SV_NextDownload_f` libere le buffer a la fin.
- [x] `SV_BeginDownload_f` reprend l'offset quand fourni.
- [x] `SV_BeginDownload_f` refuse `..`, allow global desactive, dot/slash en tete, categories desactivees et chemins sans sous-repertoire.
- [x] `SV_BeginDownload_f` libere un ancien download avant de charger le nouveau.
- [x] `SV_BeginDownload_f` borne l'offset superieur a la taille.
- [x] `SV_BeginDownload_f` refuse les maps issues d'un pak.
- [x] `SV_BeginDownload_f` lance immediatement `SV_NextDownload_f`.
- [x] `SV_Disconnect_f` route vers `SV_DropClient`.
- [x] `SV_ShowServerinfo_f` imprime `Cvar_Serverinfo`.
- [x] `SV_Nextserver` preserve le blocage en `ss_game` et en `ss_pic` hors coop.
- [x] `SV_Nextserver` incremente `spawncount`, enqueue `nextserver` ou `killserver`, puis clear la cvar.
- [x] `SV_Nextserver_f` ignore les commandes d'un ancien `spawncount`.

### String commands et usercmds

- [x] `SV_ExecuteUserCommand` tokenise avec expansion command true.
- [x] `SV_ExecuteUserCommand` met `sv_player = sv_client->edict`.
- [x] Le dispatch conserve `new`, `configstrings`, `baselines`, `begin`, `nextserver`, `disconnect`, `info`, `download`, `nextdl`.
- [x] Les commandes inconnues sont transmises a `ge.ClientCommand` en `ss_game`.
- [x] `SV_ClientThink` debite `commandMsec` et respecte `sv_enforcetime`.
- [x] `SV_ClientThink` appelle `ge.ClientThink`.
- [x] `SV_ExecuteClientMessage` installe `sv_client`/`sv_player`.
- [x] `SV_ExecuteClientMessage` detecte `badread` et unknown command puis drop.
- [x] `clc_nop` ne fait rien.
- [x] `clc_userinfo` tronque a `MAX_INFO_STRING - 1` puis appelle `SV_UserinfoChanged`.
- [x] `clc_move` refuse un second move dans le meme packet.
- [x] `clc_move` met a jour `lastframe` et `frame_latency`.
- [x] `clc_move` lit `oldest`, `oldcmd`, `newcmd` par deltas.
- [x] `clc_move` ignore la commande si client non spawned et force `lastframe = -1`.
- [x] `clc_move` verifie `COM_BlockSequenceCRCByte`.
- [x] `clc_move` rejoue les drops `< 20` avec `lastcmd`, `oldest`, `oldcmd`, puis `newcmd`.
- [x] `clc_move` respecte `sv_paused`.
- [x] `clc_move` persiste `lastcmd = newcmd`.
- [x] `clc_stringcmd` limite a `MAX_STRINGCMDS` et retourne si le client devient zombie.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

Notes : `runtime.ts` branche `sv_main` vers `SV_ExecuteClientMessage`, `sv_user` vers `SV_DropClient`/`SV_UserinfoChanged`, `sv_send` vers `SV_Nextserver`, et expose la table `user`. `sv_main.ts` appelle `SV_ExecuteClientMessage` depuis `SV_ReadPackets`. `sv_send.ts` appelle `SV_Nextserver` lors de fin demo.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

Notes : non applicable directement ; ce fichier produit des messages serveur/client et des appels game, pas des primitives renderer/web.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

Notes : non applicable directement ; aucun son n'est emis dans `sv_user.c`.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

Tests existants : `scripts/verify/quake2-sv-user.ts` couvre bootstrap, configstrings, baselines, begin, demo open, downloads, refus, maps-from-pak, userinfo, clc_move, nextserver, serverinfo et forwarding `ClientCommand`. `scripts/verify/quake2-server-runtime.ts` couvre le cablage facade/runtime, `SV_Nextserver` et un download via `SV_ExecuteClientMessage`. `scripts/verify/quake2-sv-main.ts` couvre le dispatch amont `SV_ReadPackets -> SV_ExecuteClientMessage`.

Tests a ajouter : checksum invalide explicite, second `clc_move`, limite `MAX_STRINGCMDS`, client non spawned recevant `clc_move`, drops reseau `2+`, `sv_paused`, download offset negatif defensif.

## Findings

1. [Info] L'I/O demo et download est adaptee en callbacks.
   - Fichier/ligne : `packages/server/src/sv_user.ts:87`, `packages/server/src/sv_user.ts:139`, `packages/server/src/sv_user.ts:371`
   - Source originale : `sv_user.c:45` utilise `FS_FOpenFile`, `sv_user.c:350` utilise `FS_LoadFile`, `sv_user.c:287`/`361` utilisent `FS_FreeFile`.
   - Impact : le comportement de validation, taille de chunk, refus et liberation reste dans `sv_user.ts`; seule l'I/O est externalisee.
   - Correction recommandee : aucune ; garder les callbacks comme adapters binaires.

2. [Info] L'offset de download negatif est borne a zero.
   - Fichier/ligne : `packages/server/src/sv_user.ts:354`
   - Source originale : `sv_user.c:315` accepte directement `atoi(Cmd_Argv(2))`, ce qui peut produire une arithmetique de pointeur invalide dans `SV_NextDownload_f`.
   - Impact : deviation defensive documentee ; aucun chemin valide Quake II n'est modifie.
   - Correction recommandee : aucune.

3. [Info] Quelques erreurs de pointeur C deviennent des erreurs explicites.
   - Fichier/ligne : `packages/server/src/sv_user.ts:116`, `packages/server/src/sv_user.ts:123`, `packages/server/src/sv_user.ts:184`, `packages/server/src/sv_user.ts:522`
   - Source originale : globals/pointeurs `sv_client`, `sv_player`, `edict` supposes valides.
   - Impact : echec plus lisible en TS sur etat invalide ; comportement des appels valides conserve.
   - Correction recommandee : aucune.

4. [Info] `SV_ShowServerinfo_f` retourne les lignes imprimees.
   - Fichier/ligne : `packages/server/src/sv_user.ts:417`
   - Source originale : `sv_user.c:401` appelle seulement `Info_Print(Cvar_Serverinfo())`.
   - Impact : ajout testable sans effet sur les sorties observees.
   - Correction recommandee : aucune.

## Decision

- Corriger maintenant : documentation locale de l'offset negatif ajoutee dans `SV_BeginDownload_f`
- Reporter : tests supplementaires listés ci-dessus
- Documenter : inventaire et audit crees

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `server\sv_user.c`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/server-sv_user.audit.md`
