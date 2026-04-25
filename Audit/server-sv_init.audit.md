# Audit Portage Quake II - server/sv_init.c

Date : 2026-04-25

## Verdict

Statut : OK avec ecarts documentes
Risque principal : les effets host/fichier (`fopen`, `fclose`, `CL_Drop`, loading plaque, map loader, defer buffer) sont injectes par callbacks ; ils doivent rester des adapters et ne pas reprendre le comportement principal de spawn/map.

## Source verifiee

- Source C/H : `Quake-2-master/server/sv_init.c`, `Quake-2-master/server/server.h`, qcommon cvar/cmd/net/collision/protocol, game exports
- Port TS : `packages/server/src/sv_init.ts`
- Consommateurs : `packages/server/src/runtime.ts`, `packages/server/src/sv_ccmds.ts`, `packages/server/src/sv_game.ts`, `packages/server/src/sv_world.ts`, `packages/server/src/sv_send.ts`, `packages/server/src/sv_main.ts`, `scripts/verify/quake2-sv-init.ts`

## Fiche d'identification

- Fichier audite : `server/sv_init.c`
- Source C/H principale : `Quake-2-master/server/sv_init.c`
- Sources C/H secondaires : `server/server.h`, qcommon protocol/collision/cvar/cmd/net, game exports
- Package : `packages/server`
- Type de fichier : port serveur init/map/resource indexing
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant audit, a passer en `✅`
- Niveau de fidelite annonce : Strict/Close selon adaptation
- Role attendu : indexer ressources, creer baselines, gerer savegame reload, spawn serveur, init game, dispatch map
- Consommateurs directs : `runtime.ts`, `sv_ccmds.ts`, `sv_game.ts`, `sv_world.ts`, `sv_send.ts`
- Consommateurs finaux : commandes map/gamemap/demomap, gameplay spawn, serveur runtime, clients reconnect, collision world
- Tests existants : `scripts/verify/quake2-sv-init.ts`
- Conclusion audit : OK avec ecarts documentes

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `svs` | global | `sv_init.ts` | `context.svs` | Valide | contexte explicite |
| `sv` | global | `sv_init.ts` | `context.sv` | Valide | contexte explicite |
| `SV_FindIndex` | procedure | `sv_init.ts` | `SV_FindIndex` | Valide Close | strings TS |
| `SV_ModelIndex` | procedure | `sv_init.ts` | `SV_ModelIndex` | Valide | wrapper |
| `SV_SoundIndex` | procedure | `sv_init.ts` | `SV_SoundIndex` | Valide | wrapper |
| `SV_ImageIndex` | procedure | `sv_init.ts` | `SV_ImageIndex` | Valide | wrapper |
| `SV_CreateBaseline` | procedure | `sv_init.ts` | `SV_CreateBaseline` | Valide | clone entity state |
| `SV_CheckForSavegame` | procedure | `sv_init.ts` | `SV_CheckForSavegame` | Valide Close | callbacks filesystem |
| `SV_SpawnServer` | procedure | `sv_init.ts` | `SV_SpawnServer` | Valide Close | map loader/reset adaptes |
| `SV_InitGame` | procedure | `sv_init.ts` | `SV_InitGame` | Valide Close | allocations TS |
| `SV_Map` | procedure | `sv_init.ts` | `SV_Map` | Valide Close | extension helper |
| `COPYPROTECT` | compile-time branch | aucun | aucun | N/A | non applicable |

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

Notes : les branches `COPYPROTECT` sont compile-time et non applicables au port TS.

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

Notes : ce fichier ne modifie pas `think`/`touch`/`use`/`nextthink` directement. Il pilote configstrings, clients, collision map, baselines, savegame reload et lifecycle game.

## Audit item par item

### Resource indices et baselines

- [x] `SV_FindIndex` retourne 0 pour nom vide.
- [x] `SV_FindIndex` recherche depuis l'index 1 dans la bonne plage.
- [x] `SV_FindIndex` retourne 0 si `create=false`.
- [x] `SV_FindIndex` detecte overflow et route via `SV_Error`.
- [x] `SV_FindIndex` stocke la configstring et multicast hors `ss_loading`.
- [x] `SV_ModelIndex`, `SV_SoundIndex`, `SV_ImageIndex` appellent `SV_FindIndex` avec les bons starts/max.
- [x] `SV_CreateBaseline` parcourt `entnum=1..ge.num_edicts-1`.
- [x] `SV_CreateBaseline` ignore edicts non inuse et sans model/sound/effects.
- [x] `SV_CreateBaseline` assigne `s.number`, copie origin vers old_origin et snapshot la baseline.

### `SV_CheckForSavegame`

- [x] Retour si `sv_noreload`.
- [x] Retour si `deathmatch`.
- [x] Construit le chemin `gamedir/save/current/<sv.name>.sav`.
- [x] Remplace `fopen` par callback `savegameExists`.
- [x] Appelle `SV_ClearWorld`.
- [x] Appelle `SV_ReadLevelFile`.
- [x] Si `!sv.loadgame`, passe temporairement en `ss_loading`.
- [x] Execute exactement 100 `ge.RunFrame`.
- [x] Restaure l'etat serveur precedent.

### `SV_SpawnServer`

- [x] Si `attractloop`, force `paused=0`.
- [x] Incremente `svs.spawncount`.
- [x] Passe l'etat serveur a `ss_dead`.
- [x] Reset l'objet `sv` depuis un etat neuf.
- [x] Remet `svs.realtime=0`, `loadgame`, `attractloop`.
- [x] Publie `CS_NAME`.
- [x] Gere `CS_AIRACCEL` et `pm_airaccelerate` selon deathmatch.
- [x] Reinitialise `sv.multicast`.
- [x] Ramene les clients au plus a `cs_connected` et met `lastframe=-1`.
- [x] Met `sv.time=1000`.
- [x] Charge map vide pour les etats non-game.
- [x] Charge `maps/<server>.bsp` pour `ss_game`.
- [x] Publie `CS_MAPCHECKSUM`.
- [x] Appelle `SV_ClearWorld`.
- [x] Publie et stocke les inline models.
- [x] Passe en `ss_loading`.
- [x] Appelle `ge.SpawnEntities(sv.name, CM_EntityString(), spawnpoint)`.
- [x] Execute deux `ge.RunFrame`.
- [x] Passe a l'etat final.
- [x] Cree les baselines, check savegame, puis set `mapname`.

### `SV_InitGame`

- [x] Si deja initialise, appelle `SV_Shutdown("Server restarted\n", true)`.
- [x] Sinon appelle `CL_Drop` et `SCR_BeginLoadingPlaque`.
- [x] Applique les cvars latched.
- [x] Marque `svs.initialized=true`.
- [x] Desactive coop si deathmatch et coop sont tous deux actifs.
- [x] Force deathmatch sur dedicated sans coop.
- [x] Regle `maxclients` pour deathmatch/coop/single-player.
- [x] Initialise `svs.spawncount` par random.
- [x] Alloue clients et `client_entities`.
- [x] Appelle `NET_Config(maxclients > 1)`.
- [x] Force heartbeat immediat et adresse master id.
- [x] Appelle `SV_InitGameProgs`.
- [x] Lie les edicts clients et zero `lastcmd`.

### `SV_Map`

- [x] Stocke `loadgame` et `attractloop`.
- [x] Appelle `SV_InitGame` si serveur dead et pas loadgame.
- [x] Parse `+nextserver`.
- [x] Gere le hack coop `victory.pcx`.
- [x] Parse `$spawnpoint`.
- [x] Retire le prefixe `*`.
- [x] Dispatch `.cin`, `.dm2`, `.pcx` vers les etats correspondants.
- [x] Pour les maps game, appelle loading plaque, `changing`, `SV_SendClientMessages`, `SV_SpawnServer`, `Cbuf_CopyToDefer`.
- [x] Termine par `reconnect`.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

Notes : `runtime.ts` branche `SV_InitGameProgs`, `SV_ClearWorld`, `SV_Multicast`, `SV_SendClientMessages` et expose `SV_Map`/`SV_InitGame`; `sv_ccmds.ts` consomme `SV_Map` et `SV_InitGame`; `sv_game.ts` fournit le gameplay charge ; `sv_world.ts` consomme le world model charge par `SV_SpawnServer`.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

Notes : non applicable directement ; ce fichier initialise l'etat serveur et les configstrings.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

Notes : `SV_SoundIndex` expose les sound configstrings ; emission audio directe hors perimetre.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

Tests existants : `scripts/verify/quake2-sv-init.ts` couvre index/configstrings, baselines, init single-player/deathmatch, demo map, savegame reload, chargement reel `base1.bsp`, inline models, entity string, deux frames de stabilisation, nextserver/spawnpoint et defer command buffer.

Tests a ajouter : erreur overflow `SV_FindIndex`, savegame avec `loadgame=true`, dispatch `.cin`/`.pcx`, et chemin dedicated/coop/maxclients > `MAX_CLIENTS`.

## Findings

1. [Info] Le reset `memset(&sv, 0, sizeof(sv))` est adapte par mutation d'objet partage.
   - Fichier/ligne : `packages/server/src/sv_init.ts:294`
   - Source originale : `sv_init.c:190`
   - Impact : preserve les references runtime TS tout en remettant les champs a zero.
   - Correction recommandee : aucune ; garder le reset centralise dans `SV_SpawnServer`.

2. [Info] Les effets host/fichier sont des callbacks.
   - Fichier/ligne : `packages/server/src/sv_init.ts:239`, `packages/server/src/sv_init.ts:273`, `packages/server/src/sv_init.ts:438`
   - Source originale : `fopen/fclose`, `CL_Drop`, `SCR_BeginLoadingPlaque`, `Cbuf_CopyToDefer`, `CM_LoadMap`.
   - Impact : comportement principal conserve, I/O et host UI injectes.
   - Correction recommandee : aucune ; verifier que les callbacks restent thin adapters.

3. [Info] Le dispatch d'extensions utilise une comparaison insensible a la casse.
   - Fichier/ligne : `packages/server/src/sv_init.ts:550`
   - Source originale : `sv_init.c:438` utilise `strcmp` sur suffixes `.cin/.dm2/.pcx`.
   - Impact : accepte quelques variantes de casse que le C original ne reconnaissait pas ; ecart mineur et borne.
   - Correction recommandee : documenter ; revenir a une comparaison sensible si un test ISO strict le requiert.

## Decision

- Corriger maintenant : rien
- Reporter : ajouter des tests branches rares overflow/loadgame/cinematic/pic/dedicated-coop
- Documenter : inventaire et audit crees

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `server\sv_init.c`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/server-sv_init.audit.md`
