# Audit Portage Quake II - server/sv_main.c

Date : 2026-04-25

## Verdict

Statut : OK avec ecarts documentes
Risque principal : les effets globaux C (`Com_BeginRedirect`, `Z_Free`, `fclose`, globals cvar/net/current-client) sont remplaces par contexte et callbacks ; ces callbacks doivent rester des adapters et ne pas dupliquer le comportement serveur principal.

## Source verifiee

- Source C/H : `Quake-2-master/server/sv_main.c`, `Quake-2-master/server/server.h`, qcommon netchan/net/cmd/cvar/msg/info/protocol, game exports
- Port TS : `packages/server/src/sv_main.ts`
- Consommateurs : `packages/server/src/runtime.ts`, `packages/server/src/host.ts`, `packages/server/src/sv_user.ts`, `packages/server/src/sv_send.ts`, `packages/server/src/sv_init.ts`, `packages/server/src/sv_game.ts`, `scripts/verify/quake2-sv-main.ts`

## Fiche d'identification

- Fichier audite : `server/sv_main.c`
- Source C/H principale : `Quake-2-master/server/sv_main.c`
- Sources C/H secondaires : `server/server.h`, qcommon netchan/net/cmd/cvar/msg/info/protocol, game exports
- Package : `packages/server`
- Type de fichier : port serveur lifecycle/reseau/frame loop
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant audit, a passer en `✅`
- Niveau de fidelite annonce : Strict/Close selon adaptation
- Role attendu : gestion clients, connectionless packets, timeouts, frame loop, heartbeats, init/shutdown
- Consommateurs directs : `runtime.ts`, `host.ts`, `sv_user.ts`, `sv_send.ts`, `sv_init.ts`
- Consommateurs finaux : serveur runtime, clients reseau, commandes console/map, master server, game exports
- Tests existants : `scripts/verify/quake2-sv-main.ts`, `scripts/verify/quake2-server-runtime.ts`
- Conclusion audit : OK avec ecarts documentes

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `master_adr` | global | `sv_main.ts` | `context.master_adr` | Valide | contexte explicite |
| `sv_client` | global | `sv_main.ts` | client explicite | Valide avec ecart | pas de global expose |
| cvars globals | global | `sv_main.ts` | `ServerMainContext` | Valide | contexte explicite |
| `SV_DropClient` | procedure | `sv_main.ts` | `SV_DropClient` | Valide | exposee |
| `SV_StatusString` | helper | `sv_main.ts` | `SV_StatusString` | Valide | local |
| `SVC_Status` | helper | `sv_main.ts` | `SVC_Status` | Valide | local |
| `SVC_Ack` | helper | `sv_main.ts` | `SVC_Ack` | Valide | local |
| `SVC_Info` | helper | `sv_main.ts` | `SVC_Info` | Valide Close | local |
| `SVC_Ping` | helper | `sv_main.ts` | `SVC_Ping` | Valide | exposee |
| `SVC_GetChallenge` | helper | `sv_main.ts` | `SVC_GetChallenge` | Valide Close | local |
| `SVC_DirectConnect` | helper | `sv_main.ts` | `SVC_DirectConnect` | Valide Close | local |
| `Rcon_Validate` | helper | `sv_main.ts` | `Rcon_Validate` | Valide | local |
| `SVC_RemoteCommand` | helper | `sv_main.ts` | `SVC_RemoteCommand` | Valide Close | redirect callback |
| `SV_ConnectionlessPacket` | procedure | `sv_main.ts` | `SV_ConnectionlessPacket` | Valide Close | exposee |
| `SV_CalcPings` | procedure | `sv_main.ts` | `SV_CalcPings` | Valide | exposee |
| `SV_GiveMsec` | procedure | `sv_main.ts` | `SV_GiveMsec` | Valide | exposee |
| `SV_ReadPackets` | procedure | `sv_main.ts` | `SV_ReadPackets` | Valide Close | exposee |
| `SV_CheckTimeouts` | procedure | `sv_main.ts` | `SV_CheckTimeouts` | Valide Close | exposee |
| `SV_PrepWorldFrame` | procedure | `sv_main.ts` | `SV_PrepWorldFrame` | Valide | exposee |
| `SV_RunGameFrame` | procedure | `sv_main.ts` | `SV_RunGameFrame` | Valide Close | exposee |
| `SV_Frame` | procedure | `sv_main.ts` | `SV_Frame` | Valide Close | exposee |
| `Master_Heartbeat` | procedure | `sv_main.ts` | `Master_Heartbeat` | Valide Close | exposee |
| `Master_Shutdown` | helper | `sv_main.ts` | `Master_Shutdown` | Valide Close | local |
| `SV_UserinfoChanged` | procedure | `sv_main.ts` | `SV_UserinfoChanged` | Valide Close | exposee |
| `SV_Init` | procedure | `sv_main.ts` | `SV_Init` | Valide Close | exposee |
| `SV_FinalMessage` | procedure | `sv_main.ts` | `SV_FinalMessage` | Valide | exposee |
| `SV_Shutdown` | procedure | `sv_main.ts` | `SV_Shutdown` | Valide Close | exposee |

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

Notes : blocs `#if 0` de status redirect et ping latency historique non actifs, non portes.

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

Notes : ce fichier ne modifie pas `think`/`touch`/`use`/`nextthink` ni les configstrings directement. Effets pertinents : clients, netchan, packets, pings, timeouts, frames, edict events, masters, shutdown.

## Audit item par item

### Client lifecycle et userinfo

- [x] `SV_DropClient` ecrit `svc_disconnect`.
- [x] `SV_DropClient` appelle `ge.ClientDisconnect` pour `cs_spawned`.
- [x] `SV_DropClient` libere/clear download puis passe `cs_zombie` et vide name.
- [x] `SV_UserinfoChanged` appelle `ge.ClientUserinfoChanged`.
- [x] `SV_UserinfoChanged` extrait `name`, masque high bits.
- [x] `SV_UserinfoChanged` parse `rate`, clamp 100..15000, default 5000.
- [x] `SV_UserinfoChanged` parse `msg`.
- [x] `SV_FinalMessage` ecrit print/high/message puis reconnect ou disconnect.
- [x] `SV_FinalMessage` transmet deux passes aux clients `>= cs_connected`.

### Connectionless commands

- [x] `SV_StatusString` commence par serverinfo + newline.
- [x] `SV_StatusString` ajoute clients connected/spawned avec frags/ping/name.
- [x] `SVC_Status` repond `print\n<status>`.
- [x] `SVC_Ack` log l'adresse.
- [x] `SVC_Info` ignore single-player.
- [x] `SVC_Info` valide `PROTOCOL_VERSION` et compte clients connectes.
- [x] `SVC_Ping` repond `ack`.
- [x] `SVC_GetChallenge` reutilise challenge d'adresse ou remplace le plus vieux.
- [x] `SVC_DirectConnect` valide version/qport/challenge/userinfo/ip.
- [x] `SVC_DirectConnect` refuse remote attractloop.
- [x] `SVC_DirectConnect` reutilise slot existant ou trouve slot free.
- [x] `SVC_DirectConnect` respecte `sv_reconnect_limit`.
- [x] `SVC_DirectConnect` appelle `ge.ClientConnect`, gere rejet, setup netchan.
- [x] `SVC_RemoteCommand` valide password et execute les args restants via callback.
- [x] `SV_ConnectionlessPacket` preserve l'ordre de dispatch source.

### Packets et frame loop

- [x] `SV_ReadPackets` draine `NET_GetPacket`.
- [x] `SV_ReadPackets` detecte marker `-1` et route connectionless.
- [x] `SV_ReadPackets` lit sequence/ack/qport.
- [x] `SV_ReadPackets` matche base address + qport, corrige port NAT.
- [x] `SV_ReadPackets` appelle `Netchan_Process`, met `lastmessage`, puis `SV_ExecuteClientMessage`.
- [x] `SV_CheckTimeouts` clamp `lastmessage` futur.
- [x] `SV_CheckTimeouts` libere zombies expires.
- [x] `SV_CheckTimeouts` broadcast timeout, drop, puis free.
- [x] `SV_CalcPings` moyenne latences positives et mirror vers game client.
- [x] `SV_GiveMsec` ne s'execute que tous les 16 frames.
- [x] `SV_PrepWorldFrame` clear tous les `s.event`.
- [x] `SV_RunGameFrame` incremente framenum, met `sv.time=framenum*100`.
- [x] `SV_RunGameFrame` respecte pause/maxclients et high clamp.
- [x] `SV_Frame` retourne si serveur non initialise.
- [x] `SV_Frame` avance realtime, check timeouts, read packets.
- [x] `SV_Frame` sleep/low clamp si realtime en avance insuffisante.
- [x] `SV_Frame` calc pings, give msec, run game, send clients, record demo, heartbeat, prep world.

### Init/master/shutdown

- [x] `SV_Init` appelle operator commands et enregistre les cvars source.
- [x] `SV_Init` reinitialise `net_message`.
- [x] `Master_Heartbeat` exige dedicated + public.
- [x] `Master_Heartbeat` gere time wraparound et intervalle 300s.
- [x] `Master_Heartbeat` envoie status a chaque master avec port.
- [x] `Master_Shutdown` exige dedicated + public et envoie `shutdown`.
- [x] `SV_Shutdown` envoie final message si clients presents.
- [x] `SV_Shutdown` appelle master shutdown puis game shutdown.
- [x] `SV_Shutdown` ferme demos via callbacks.
- [x] `SV_Shutdown` reset `sv`/`svs` et clients/challenges.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

Notes : `runtime.ts` compose `sv_main` et fournit `sv_user`, `sv_send`, `sv_game` et `sv_init` callbacks ; `host.ts` rebranche init/shutdown top-level ; `sv_user.ts` utilise `SV_DropClient`/`SV_UserinfoChanged` ; `sv_send.ts` utilise `SV_DropClient`.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

Notes : non applicable directement ; `sv_main` pilote serveur/net, pas rendu.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

Notes : non applicable directement.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

Tests existants : `scripts/verify/quake2-sv-main.ts` couvre init cvars, userinfo, drop client, final message, heartbeat, connectionless ping/ack/status/info/challenge/connect/rcon, read packets + NAT port fixup, timeouts, pings, give msec, prep world, frame loop et shutdown lifecycle.

Tests a ajouter : reject connect version/challenge/attractloop/full server, `SVC_Info` wrong version, `Master_Shutdown` private/dedicated false et `SV_Frame` pause single-player.

## Findings

1. [Info] Rcon redirect est adapte en callback.
   - Fichier/ligne : `packages/server/src/sv_main.ts:633`
   - Source originale : `sv_main.c:433` utilise `Com_BeginRedirect` / `Cmd_ExecuteString` / `Com_EndRedirect`.
   - Impact : contenu fonctionnel preserve, mais buffering global remplace par resultat `executeRconCommand`.
   - Correction recommandee : aucune ; garder ce callback comme adapter d'execution console.

2. [Info] Shutdown remplace `Z_Free`, `fclose` et `memset` par reset/callbacks.
   - Fichier/ligne : `packages/server/src/sv_main.ts:976`
   - Source originale : `sv_main.c:1032`.
   - Impact : necessaire pour conserver references JS partagees ; l'etat observable est remis a zero.
   - Correction recommandee : aucune ; eviter de disperser le reset ailleurs.

3. [Info] `SV_Frame` ne reproduit pas l'appel `rand()` sans stockage visible.
   - Fichier/ligne : `packages/server/src/sv_main.ts:932`
   - Source originale : `sv_main.c:771` appelle `rand()` pour garder le temps aleatoire dependant.
   - Impact : aucun etat serveur visible dans le port actuel ; a surveiller si une RNG globale Quake est reintroduite.
   - Correction recommandee : documenter ; ajouter callback RNG si un futur port depend de la sequence.

## Decision

- Corriger maintenant : rien
- Reporter : tests branches rejet connect/info/master/pause et callback RNG si necessaire
- Documenter : inventaire et audit crees

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `server\sv_main.c`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/server-sv_main.audit.md`
