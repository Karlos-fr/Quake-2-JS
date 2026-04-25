# Inventaire Portage Quake II - server/sv_main.c

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/server/sv_main.c`
- Sources C/H secondaires : `Quake-2-master/server/server.h`, qcommon netchan/net/cmd/cvar/msg/info/protocol, game exports/edicts
- Package cible principal : `packages/server`
- Fichier TS principal pressenti : `packages/server/src/sv_main.ts`
- Fichiers TS secondaires pressentis : `packages/server/src/server.ts`, `packages/server/src/runtime.ts`, `packages/server/src/host.ts`, `packages/server/src/sv_user.ts`, `packages/server/src/sv_send.ts`, `packages/server/src/sv_game.ts`, `packages/server/src/sv_init.ts`, `packages/server/src/index.ts`
- Domaine : serveur, lifecycle clients, paquets connectionless, lecture reseau, frame loop, heartbeat master, shutdown
- Niveau de fidelite attendu : Strict/Close selon adaptations runtime/OS
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`
- Exception de decoupage documentee : aucune pour le comportement principal ; `runtime.ts` injecte les callbacks croises, `host.ts` consomme init/shutdown top-level.
- Justification si `1 fichier C != 1 fichier TS` : non applicable ; `packages/server/src/sv_main.ts` reste le fichier principal de rattachement.

## Inventaire source

### Fonctions

- [x] Nom : `SV_DropClient`
  - Source : `sv_main.c:70`
  - Role : deconnecte un client, appelle gameplay disconnect, libere download, passe zombie.
  - Cible TS pressentie : `sv_main.ts:150`
  - Statut : porte
  - Notes : `FS_FreeFile` adapte en callback `onFreeDownload`.

- [x] Nom : `SV_StatusString`
  - Source : `sv_main.c:109`
  - Role : construit status serverinfo + joueurs connectes.
  - Cible TS pressentie : `sv_main.ts:1055`
  - Statut : porte helper local
  - Notes : `Cvar_Serverinfo` injecte via `getServerInfo`.

- [x] Nom : `SVC_Status`
  - Source : `sv_main.c:147`
  - Role : repond `print\n<status>` en OOB.
  - Cible TS pressentie : `sv_main.ts:399`
  - Statut : porte
  - Notes : branche redirect `#if 0` ignoree comme inactive.

- [x] Nom : `SVC_Ack`
  - Source : `sv_main.c:163`
  - Role : log ping acknowledge.
  - Cible TS pressentie : `sv_main.ts:267`
  - Statut : porte helper local
  - Notes : sortie via `onPrintf`.

- [x] Nom : `SVC_Info`
  - Source : `sv_main.c:176`
  - Role : repond info courte aux scans broadcast.
  - Cible TS pressentie : `sv_main.ts:425`
  - Statut : porte Close
  - Notes : formatage TS equivalent.

- [x] Nom : `SVC_Ping`
  - Source : `sv_main.c:209`
  - Role : repond `ack`.
  - Cible TS pressentie : `sv_main.ts:412`
  - Statut : porte
  - Notes : OOB strict.

- [x] Nom : `SVC_GetChallenge`
  - Source : `sv_main.c:226`
  - Role : trouve/alloue challenge par adresse.
  - Cible TS pressentie : `sv_main.ts:459`
  - Statut : porte Close
  - Notes : `rand` et `curtime` adaptes en callbacks optionnels.

- [x] Nom : `SVC_DirectConnect`
  - Source : `sv_main.c:267`
  - Role : valide protocol/challenge/userinfo, reserve/reutilise slot client, setup netchan.
  - Cible TS pressentie : `sv_main.ts:500`
  - Statut : porte Close
  - Notes : `memset(client_t)` remplace par `createServerClient`.

- [x] Nom : `Rcon_Validate`
  - Source : `sv_main.c:413`
  - Role : valide password rcon.
  - Cible TS pressentie : `sv_main.ts:1078`
  - Statut : porte helper local
  - Notes : compare `Cmd_Argv(1)`.

- [x] Nom : `SVC_RemoteCommand`
  - Source : `sv_main.c:433`
  - Role : traite rcon, redirect print, execute commande restante.
  - Cible TS pressentie : `sv_main.ts:633`
  - Statut : porte Close
  - Notes : redirect `Com_BeginRedirect/EndRedirect` adapte en callback `executeRconCommand`.

- [x] Nom : `SV_ConnectionlessPacket`
  - Source : `sv_main.c:477`
  - Role : parse OOB et dispatch ping/ack/status/info/getchallenge/connect/rcon.
  - Cible TS pressentie : `sv_main.ts:670`
  - Statut : porte Close
  - Notes : retourne le token pour test.

- [x] Nom : `SV_CalcPings`
  - Source : `sv_main.c:521`
  - Role : moyenne latences frame, miroir vers game client.
  - Cible TS pressentie : `sv_main.ts:822`
  - Statut : porte
  - Notes : blocs `#if 0` non actifs ignores.

- [x] Nom : `SV_GiveMsec`
  - Source : `sv_main.c:573`
  - Role : donne `commandMsec=1800` toutes les 16 frames.
  - Cible TS pressentie : `sv_main.ts:856`
  - Statut : porte
  - Notes : strict.

- [x] Nom : `SV_ReadPackets`
  - Source : `sv_main.c:597`
  - Role : lit packets, dispatch OOB, route packets sequence clients.
  - Cible TS pressentie : `sv_main.ts:713`
  - Statut : porte Close
  - Notes : utilise `QcommonNetRuntime`.

- [x] Nom : `SV_CheckTimeouts`
  - Source : `sv_main.c:663`
  - Role : libere zombies expires et drop clients timeout.
  - Cible TS pressentie : `sv_main.ts:782`
  - Statut : porte Close
  - Notes : broadcast timeout via callback.

- [x] Nom : `SV_PrepWorldFrame`
  - Source : `sv_main.c:703`
  - Role : clear `s.event` sur tous les edicts.
  - Cible TS pressentie : `sv_main.ts:880`
  - Statut : porte
  - Notes : strict.

- [x] Nom : `SV_RunGameFrame`
  - Source : `sv_main.c:723`
  - Role : avance framenum/time, run frame si non pause, clamp high.
  - Cible TS pressentie : `sv_main.ts:899`
  - Statut : porte Close
  - Notes : `host_speeds` timing via callbacks.

- [x] Nom : `SV_Frame`
  - Source : `sv_main.c:760`
  - Role : boucle serveur complete.
  - Cible TS pressentie : `sv_main.ts:932`
  - Statut : porte Close
  - Notes : `rand()` gratuit non reproduit explicitement, sans etat visible.

- [x] Nom : `Master_Heartbeat`
  - Source : `sv_main.c:827`
  - Role : heartbeat periodique master.
  - Cible TS pressentie : `sv_main.ts:280`
  - Statut : porte Close
  - Notes : `HEARTBEAT_SECONDS=300` porte en ms.

- [x] Nom : `Master_Shutdown`
  - Source : `sv_main.c:867`
  - Role : notifie masters au shutdown.
  - Cible TS pressentie : `sv_main.ts:369`
  - Statut : porte helper local
  - Notes : appele par `SV_Shutdown`.

- [x] Nom : `SV_UserinfoChanged`
  - Source : `sv_main.c:898`
  - Role : appelle gameplay userinfo, extrait name/rate/msg.
  - Cible TS pressentie : `sv_main.ts:175`
  - Statut : porte Close
  - Notes : masque high bits via helper string.

- [x] Nom : `SV_Init`
  - Source : `sv_main.c:945`
  - Role : init commandes operateur, cvars serveur, buffer net message.
  - Cible TS pressentie : `sv_main.ts:322`
  - Statut : porte Close
  - Notes : globals cvar remplaces par runtime cvar explicite.

- [x] Nom : `SV_FinalMessage`
  - Source : `sv_main.c:993`
  - Role : envoie message final deux fois aux clients connectes.
  - Cible TS pressentie : `sv_main.ts:217`
  - Statut : porte
  - Notes : buffer local TS.

- [x] Nom : `SV_Shutdown`
  - Source : `sv_main.c:1032`
  - Role : final message, master shutdown, game shutdown, free/reset sv/svs.
  - Cible TS pressentie : `sv_main.ts:976`
  - Statut : porte Close
  - Notes : `Z_Free/fclose/memset` adaptes en reset/callbacks.

### Structures / types

- [x] Nom : `master_adr[MAX_MASTERS]`
  - Source : `sv_main.c:23`
  - Role : adresses master servers.
  - Representation TS pressentie : `ServerMainContext.master_adr`
  - Statut : porte via contexte
  - Notes : tableau de `netadr_t`.

- [x] Nom : `sv_client`
  - Source : `sv_main.c:25`
  - Role : client courant pendant connect/user path.
  - Representation TS pressentie : contexte/call stack runtime
  - Statut : adapte
  - Notes : pas de global muté expose ; les consommateurs recoivent client explicitement.

- [x] Nom : cvars `sv_paused`, `sv_timedemo`, `timeout`, `zombietime`, `rcon_password`, `maxclients`, `hostname`, `public_server`, `sv_reconnect_limit`
  - Source : `sv_main.c:27`
  - Role : controle runtime serveur.
  - Representation TS pressentie : `ServerMainContext`
  - Statut : porte via contexte
  - Notes : `SV_Init` enregistre les cvars dans `CvarRuntime`.

- [x] Nom : `ServerMainContext`
  - Source : nouveau contexte TS
  - Role : remplace globals serveur/qnet/cvars et callbacks croises.
  - Representation TS pressentie : `sv_main.ts:84`
  - Statut : nouveau contexte
  - Notes : adaptation conforme README.

### Enums / constantes / flags / macros utiles

- [x] Nom : `MAX_MASTERS`, `MAX_CHALLENGES`, `SV_OUTPUTBUF_LENGTH`
  - Source : `server.h`
  - Valeur / role : tailles master/challenge/rcon redirect.
  - Cible TS pressentie : `server.ts`, constantes locales/callbacks
  - Statut : consomme/adapte
  - Notes : redirect rcon adapte.

- [x] Nom : `HEARTBEAT_SECONDS`
  - Source : `sv_main.c:826`
  - Valeur / role : `300`.
  - Cible TS pressentie : `HEARTBEAT_MSEC`
  - Statut : porte
  - Notes : `300 * 1000`.

- [x] Nom : `svc_disconnect`, `svc_print`, `svc_reconnect`
  - Source : qcommon protocol
  - Valeur / role : messages reseau.
  - Cible TS pressentie : `svc_ops_e`
  - Statut : consomme
  - Notes : valeurs conservees par qcommon.

- [x] Nom : `PROTOCOL_VERSION`, `VERSION`, `PORT_MASTER`, `STAT_FRAGS`, `PRINT_HIGH`
  - Source : qcommon/protocol
  - Valeur / role : validation connect, status, final messages.
  - Cible TS pressentie : qcommon imports
  - Statut : consomme
  - Notes : strict.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `SV_DropClient` | procedure | `sv_main.ts` | `SV_DropClient` | OK | exposee |
| `SV_StatusString` | helper | `sv_main.ts` | `SV_StatusString` | OK | local |
| `SVC_Status` | helper | `sv_main.ts` | `SVC_Status` | OK | exposee indirectly |
| `SVC_Ack` | helper | `sv_main.ts` | `SVC_Ack` | OK | local |
| `SVC_Info` | helper | `sv_main.ts` | `SVC_Info` | OK Close | local |
| `SVC_Ping` | helper | `sv_main.ts` | `SVC_Ping` | OK | exposee |
| `SVC_GetChallenge` | helper | `sv_main.ts` | `SVC_GetChallenge` | OK Close | local |
| `SVC_DirectConnect` | helper | `sv_main.ts` | `SVC_DirectConnect` | OK Close | local |
| `Rcon_Validate` | helper | `sv_main.ts` | `Rcon_Validate` | OK | local |
| `SVC_RemoteCommand` | helper | `sv_main.ts` | `SVC_RemoteCommand` | OK Close | local |
| `SV_ConnectionlessPacket` | procedure | `sv_main.ts` | `SV_ConnectionlessPacket` | OK Close | exposee |
| `SV_ReadPackets` | procedure | `sv_main.ts` | `SV_ReadPackets` | OK Close | exposee |
| `SV_CheckTimeouts` | procedure | `sv_main.ts` | `SV_CheckTimeouts` | OK Close | exposee |
| `SV_CalcPings` | procedure | `sv_main.ts` | `SV_CalcPings` | OK | exposee |
| `SV_GiveMsec` | procedure | `sv_main.ts` | `SV_GiveMsec` | OK | exposee |
| `SV_PrepWorldFrame` | procedure | `sv_main.ts` | `SV_PrepWorldFrame` | OK | exposee |
| `SV_RunGameFrame` | procedure | `sv_main.ts` | `SV_RunGameFrame` | OK Close | exposee |
| `SV_Frame` | procedure | `sv_main.ts` | `SV_Frame` | OK Close | exposee |
| `Master_Heartbeat` | procedure | `sv_main.ts` | `Master_Heartbeat` | OK Close | exposee |
| `Master_Shutdown` | helper | `sv_main.ts` | `Master_Shutdown` | OK Close | local |
| `SV_UserinfoChanged` | procedure | `sv_main.ts` | `SV_UserinfoChanged` | OK Close | exposee |
| `SV_Init` | procedure | `sv_main.ts` | `SV_Init` | OK Close | exposee |
| `SV_FinalMessage` | procedure | `sv_main.ts` | `SV_FinalMessage` | OK | exposee |
| `SV_Shutdown` | procedure | `sv_main.ts` | `SV_Shutdown` | OK Close | exposee |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/server/src/runtime.ts`
- Client : `sv_user.ts`, packet processing, client messages
- Server : `sv_send.ts`, `sv_init.ts`, `sv_game.ts`, `sv_ccmds.ts`, `host.ts`, `server.ts`, `index.ts`
- Renderer common : non applicable direct
- Renderer three : non applicable direct
- Web / platform : `host.ts`/runtime top-level indirect
- Audio : non applicable direct
- Tests existants : `scripts/verify/quake2-sv-main.ts`, `scripts/verify/quake2-server-runtime.ts`
