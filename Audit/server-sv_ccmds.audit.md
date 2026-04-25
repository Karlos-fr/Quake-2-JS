# Audit Portage Quake II - server/sv_ccmds.c

Date : 2026-04-25

## Verdict

Statut : OK avec ecarts documentes
Risque principal : les operations fichier/demo sont adaptees via callbacks, et `SV_SetMaster_f` corrige une fragilite d'indexation source en cas d'adresse master invalide.

## Source verifiee

- Source C/H : `Quake-2-master/server/sv_ccmds.c`, `server/server.h`
- Port TS : `packages/server/src/sv_ccmds.ts`
- Consommateurs : `packages/server/src/runtime.ts`, `packages/server/src/sv_main.ts`, `packages/server/src/sv_init.ts`, `packages/server/src/index.ts`, `scripts/verify/quake2-sv-ccmds.ts`

## Fiche d'identification

- Fichier audite : `server/sv_ccmds.c`
- Source C/H principale : `Quake-2-master/server/sv_ccmds.c`
- Sources C/H secondaires : `server/server.h`, `qcommon/qcommon.h`, `game/game.h`
- Package : `packages/server`
- Type de fichier : commandes operateur serveur
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant audit, a passer en `✅`
- Niveau de fidelite annonce : Close/Strict avec adapters IO
- Role attendu : commandes console serveur, save/load, demo recording, admin server
- Consommateurs directs : `runtime.ts`, `sv_main.ts`, `sv_init.ts`
- Consommateurs finaux : runtime serveur et commande operateur
- Tests existants : `scripts/verify/quake2-sv-ccmds.ts`
- Conclusion audit : OK avec ecarts documentes

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `SV_SetMaster_f` | fonction | `sv_ccmds.ts` | `SV_SetMaster_f` | Valide Close | indexation `slot` documentee |
| `SV_SetPlayer` | fonction | `sv_ccmds.ts` | `SV_SetPlayer` | Valide Close | closure au lieu globals |
| `SV_WipeSavegame` | fonction | `sv_ccmds.ts` | `SV_WipeSavegame` | Valide Close | callbacks/fallback |
| `CopyFile` | helper | `sv_ccmds.ts` | `copyBinaryFile` | Valide Adapter | callbacks binaires |
| `SV_CopySaveGame` | fonction | `sv_ccmds.ts` | `SV_CopySaveGame` | Valide Close | slots save |
| `SV_WriteLevelFile` | fonction | `sv_ccmds.ts` | `SV_WriteLevelFile` | Valide Close | configstrings/portal |
| `SV_ReadLevelFile` | fonction | `sv_ccmds.ts` | `SV_ReadLevelFile` | Valide Close | read level |
| `SV_WriteServerFile` | fonction | `sv_ccmds.ts` | `SV_WriteServerFile` | Valide Close | server.ssv |
| `SV_ReadServerFile` | fonction | `sv_ccmds.ts` | `SV_ReadServerFile` | Valide Close | cvars/mapcmd/game |
| `SV_DemoMap_f` | fonction | `sv_ccmds.ts` | `SV_DemoMap_f` | Valide Strict | direct map |
| `SV_GameMap_f` | fonction | `sv_ccmds.ts` | `SV_GameMap_f` | Valide Close | transition save |
| `SV_Map_f` | fonction | `sv_ccmds.ts` | `SV_Map_f` | Valide Close | map dev |
| `SV_Loadgame_f` | fonction | `sv_ccmds.ts` | `SV_Loadgame_f` | Valide Close | load flow |
| `SV_Savegame_f` | fonction | `sv_ccmds.ts` | `SV_Savegame_f` | Valide Close | save flow |
| `SV_Kick_f` | fonction | `sv_ccmds.ts` | `SV_Kick_f` | Valide Strict | kick |
| `SV_Status_f` | fonction | `sv_ccmds.ts` | `SV_Status_f` | Valide Close | table format |
| `SV_ConSay_f` | fonction | `sv_ccmds.ts` | `SV_ConSay_f` | Valide Strict | chat |
| `SV_Heartbeat_f` | fonction | `sv_ccmds.ts` | `SV_Heartbeat_f` | Valide Strict | heartbeat |
| `SV_Serverinfo_f` | fonction | `sv_ccmds.ts` | `SV_Serverinfo_f` | Valide Strict | info |
| `SV_DumpUser_f` | fonction | `sv_ccmds.ts` | `SV_DumpUser_f` | Valide Strict | userinfo |
| `SV_ServerRecord_f` | fonction | `sv_ccmds.ts` | `SV_ServerRecord_f` | Valide Close | demo adapter |
| `SV_ServerStop_f` | fonction | `sv_ccmds.ts` | `SV_ServerStop_f` | Valide Strict | stop demo |
| `SV_KillServer_f` | fonction | `sv_ccmds.ts` | `SV_KillServer_f` | Valide Close | shutdown/net |
| `SV_ServerCommand_f` | fonction | `sv_ccmds.ts` | `SV_ServerCommand_f` | Valide Strict | game command |
| `SV_InitOperatorCommands` | fonction | `sv_ccmds.ts` | `SV_InitOperatorCommands` | Valide Close | command registration |

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

Notes : `think`/`touch`/temp/audio/renderer sont non applicables ; effets pertinents = clients drop, mapcmd, configstrings, cvars, save/demo buffers, net config.

## Audit item par item

### Commandes operateur

- [x] `SV_SetMaster_f` conserve dedicated guard, `public=1`, reset slots, port default, ping, heartbeat.
- [x] `SV_SetPlayer` conserve selection slot numerique et nom, erreurs et client actif.
- [x] `SV_Kick_f` conserve no server, usage, selection, broadcast, client print, drop, lastmessage.
- [x] `SV_Status_f` conserve table map/client/ping/address/qport avec format adapte.
- [x] `SV_ConSay_f` conserve `console:` et stripping quotes.
- [x] `SV_Heartbeat_f` force `last_heartbeat = -9999999`.
- [x] `SV_Serverinfo_f` et `SV_DumpUser_f` utilisent `Info_Print`.
- [x] `SV_ServerCommand_f` garde le check `ge`.
- [x] `SV_KillServer_f` shutdown puis `NET_Config(false)`.

### Savegame IO

- [x] `SV_WipeSavegame` supprime server/game et glob `.sav`/`.sv2`.
- [x] `CopyFile` est remplace par `copyBinaryFile` callback.
- [x] `SV_CopySaveGame` copie server/game, `.sav` et `.sv2`.
- [x] `SV_WriteLevelFile` ecrit configstrings, portal state, puis `ge.WriteLevel`.
- [x] `SV_ReadLevelFile` restaure configstrings, portal state, puis `ge.ReadLevel`.
- [x] `SV_WriteServerFile` ecrit comment, mapcmd et cvars `CVAR_LATCH`, puis `ge.WriteGame`.
- [x] `SV_ReadServerFile` restaure cvars latch via `Cvar_ForceSet`, init game, mapcmd, puis `ge.ReadGame`.

### Map/save/load flow

- [x] `SV_DemoMap_f` appelle `SV_Map(true, arg, false)`.
- [x] `SV_GameMap_f` conserve usage, current save path, unit transition `*`, save level sortant, restore `inuse`, `SV_Map`, `mapcmd`, autosave non dedicated.
- [x] `SV_Map_f` verifie BSP via callback si disponible, met `ss_dead`, wipe current, puis `SV_GameMap_f`.
- [x] `SV_Loadgame_f` conserve usage, bad savedir warning sans retour immediat, existence server.ssv, copy current, read server, map loadgame.
- [x] `SV_Savegame_f` conserve guards state/argc/deathmatch/current/dead player, bad savedir warning sans retour immediat, write level/server/copy/done.

### Server demo

- [x] `SV_ServerRecord_f` conserve usage, already recording, must be in level, open path, demo_multicast init.
- [x] Signon ecrit `svc_serverdata`, protocol, spawncount, demo byte `2`, gamedir, playernum `-1`, levelname, configstrings.
- [x] Payload prefixe par longueur little-endian comme le source.
- [x] `SV_ServerStop_f` ferme et nullifie le handle.

### Registration

- [x] `SV_InitOperatorCommands` enregistre heartbeat/kick/status/serverinfo/dumpuser.
- [x] Enregistre map/demomap/gamemap/setmaster.
- [x] Enregistre `say` seulement si dedicated.
- [x] Enregistre serverrecord/serverstop/save/load/killserver/sv.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

Notes : `runtime.ts` instancie `createServerConsoleProcedures`; `sv_main.ts` appelle `SV_InitOperatorCommands`; `sv_init.ts` appelle `SV_ReadLevelFile`; `index.ts` expose la factory.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

Notes : non applicable.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

Notes : non applicable direct.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

Tests existants : `scripts/verify/quake2-sv-ccmds.ts` couvre registration, status, say, kick, setmaster, demomap/gamemap/map, save/load, bad savedir flow, serverrecord/stop, server command, fallback IO binaire, cvars latch.

Tests a ajouter plus tard : cas multi-master avec adresse invalide intercalee si l'on veut verrouiller explicitement la deviation `slot` du port.

## Findings

1. [Info] `SV_SetMaster_f` utilise `slot` pour parser/stocker l'adresse master, au lieu de l'index `i` du source.
   - Fichier/ligne : `packages/server/src/sv_ccmds.ts:292`
   - Source originale : `sv_ccmds.c:63` passe `&master_adr[i]` puis lit `master_adr[slot]`.
   - Impact : comportement plus robuste si une adresse invalide precede une adresse valide ; ecart volontaire acceptable car le chemin nominal sans erreur reste identique.
   - Correction recommandee : aucune, garder documente.

2. [Info] Les operations fichiers et demo passent par callbacks.
   - Fichier/ligne : `packages/server/src/sv_ccmds.ts:97`, `sv_ccmds.ts:830`
   - Source originale : appels directs `remove`, `fopen`, `fread`, `fwrite`, `Sys_FindFirst`.
   - Impact : adaptation plateforme obligatoire ; fallback binaire conserve la structure des fichiers.
   - Correction recommandee : aucune.

## Decision

- Corriger maintenant : non
- Reporter : test optionnel multi-master avec adresse invalide
- Documenter : inventaire et audit crees, ecarts notes

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `server\sv_ccmds.c`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/server-sv_ccmds.audit.md`
