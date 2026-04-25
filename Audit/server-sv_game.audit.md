# Audit Portage Quake II - server/sv_game.c

Date : 2026-04-25

## Verdict

Statut : OK avec ecarts documentes
Risque principal : les substitutions `Sys_GetGameAPI`/`Sys_UnloadGame` et `Z_Tag*` sont necessaires en TypeScript ; elles doivent rester des adaptations d'interface et ne pas masquer le wiring exact de `game_import_t`.

## Source verifiee

- Source C/H : `Quake-2-master/server/sv_game.c`, `Quake-2-master/server/server.h`, `game/game.h`, qcommon protocol/collision/cvar/cmd/pmove
- Port TS : `packages/server/src/sv_game.ts`
- Consommateurs : `packages/server/src/runtime.ts`, `packages/server/src/sv_init.ts`, `packages/server/src/sv_main.ts`, `packages/server/src/sv_send.ts`, `packages/server/src/sv_world.ts`, `packages/server/src/index.ts`, `scripts/verify/quake2-sv-game.ts`

## Fiche d'identification

- Fichier audite : `server/sv_game.c`
- Source C/H principale : `Quake-2-master/server/sv_game.c`
- Sources C/H secondaires : `server/server.h`, `game/game.h`, qcommon protocol/collision/cvar/cmd/pmove
- Package : `packages/server`
- Type de fichier : port serveur bridge moteur/gameplay
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant audit, a passer en `✅`
- Niveau de fidelite annonce : Strict/Close selon adaptation
- Role attendu : exposer les imports moteur au gameplay, charger l'API game, propager les appels server/world/send/init
- Consommateurs directs : `runtime.ts`, `sv_init.ts`, `sv_main.ts`
- Consommateurs finaux : gameplay `GetGameApi`, spawn/init serveur, configstrings, datagrams, sounds, world traces/PVS/PHS
- Tests existants : `scripts/verify/quake2-sv-game.ts`, `scripts/verify/quake2-server-runtime.ts`
- Conclusion audit : OK avec ecarts documentes

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `ge` | global | `sv_game.ts` | `context.ge` | Valide | global remplace par contexte |
| `PF_Unicast` | helper import | `sv_game.ts` | `PF_Unicast` | Valide | local |
| `PF_dprintf` | helper import | `sv_game.ts` | `PF_dprintf` | Valide Close | hook print |
| `PF_cprintf` | helper import | `sv_game.ts` | `PF_cprintf` | Valide Close | hook print/client |
| `PF_centerprintf` | helper import | `sv_game.ts` | `PF_centerprintf` | Valide | local |
| `PF_error` | helper import | `sv_game.ts` | `PF_error` | Valide | `SV_Error` |
| `PF_setmodel` | helper import | `sv_game.ts` | `PF_setmodel` | Valide Close | garde inline model |
| `PF_Configstring` | helper import | `sv_game.ts` | `PF_Configstring` | Valide | local |
| `PF_WriteChar` | helper import | `sv_game.ts` | `PF_WriteChar` | Valide | local |
| `PF_WriteByte` | helper import | `sv_game.ts` | `PF_WriteByte` | Valide | local |
| `PF_WriteShort` | helper import | `sv_game.ts` | `PF_WriteShort` | Valide | local |
| `PF_WriteLong` | helper import | `sv_game.ts` | `PF_WriteLong` | Valide | local |
| `PF_WriteFloat` | helper import | `sv_game.ts` | `PF_WriteFloat` | Valide | local |
| `PF_WriteString` | helper import | `sv_game.ts` | `PF_WriteString` | Valide | local |
| `PF_WritePos` | helper import | `sv_game.ts` | `PF_WritePos` | Valide | local |
| `PF_WriteDir` | helper import | `sv_game.ts` | `PF_WriteDir` | Valide | local |
| `PF_WriteAngle` | helper import | `sv_game.ts` | `PF_WriteAngle` | Valide | local |
| `PF_inPVS` | helper import | `sv_game.ts` | `PF_inPVS` | Valide | local |
| `PF_inPHS` | helper import | `sv_game.ts` | `PF_inPHS` | Valide | local |
| `PF_StartSound` | helper import | `sv_game.ts` | `PF_StartSound` | Valide | local |
| `SV_ShutdownGameProgs` | procedure | `sv_game.ts` | `SV_ShutdownGameProgs` | Valide Close | unload DLL adapte |
| `SV_InitGameProgs` | procedure | `sv_game.ts` | `SV_InitGameProgs` | Valide Close | factory TS |
| `SCR_DebugGraph` | extern | `sv_game.ts` | `debugGraph` | Valide | hook |
| `Sys_GetGameAPI` | OS/DLL | `sv_game.ts` | `getGameApi` | Valide avec ecart | factory injectable |
| `Sys_UnloadGame` | OS/DLL | `sv_game.ts` | `gameInitialized=false` | Valide avec ecart | in-memory |

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

Notes : `assignGameExports` et `formatPrintf` sont des helpers TS locaux ; les deviations DLL/native sont annoncees dans l'entete.

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

Notes : ce fichier ne modifie pas `think`/`touch`/`use`/`nextthink` directement. Les effets pertinents sont multicast/datagrams, configstrings, sons, edict link/unlink via callbacks, traces/PVS/PHS et lifecycle game.

## Audit item par item

### Print/unicast/error imports

- [x] `PF_Unicast` retourne si `ent` est nul.
- [x] `PF_Unicast` valide l'index edict contre `maxclients`.
- [x] `PF_Unicast` ecrit reliable vers `client.netchan.message`.
- [x] `PF_Unicast` ecrit unreliable vers `client.datagram`.
- [x] `PF_Unicast` clear `sv.multicast`.
- [x] `PF_dprintf` formate puis imprime sur le hook console.
- [x] `PF_cprintf` route `ent` valide vers `SV_ClientPrintf`.
- [x] `PF_cprintf` route `ent` nul vers la console.
- [x] `PF_cprintf` conserve l'erreur non-client.
- [x] `PF_centerprintf` conserve retour silencieux non-client.
- [x] `PF_centerprintf` ecrit `svc_centerprint`, string, puis unicast fiable.
- [x] `PF_error` conserve le prefixe `Game Error`.

### Model/config/write imports

- [x] `PF_setmodel` refuse un nom vide/nul.
- [x] `PF_setmodel` appelle `SV_ModelIndex`.
- [x] `PF_setmodel` assigne `ent.s.modelindex`.
- [x] `PF_setmodel` detecte les inline models `*`.
- [x] `PF_setmodel` copie `mins/maxs` depuis `CM_InlineModel`.
- [x] `PF_setmodel` relink l'edict inline.
- [x] `PF_Configstring` valide la borne.
- [x] `PF_Configstring` remplace `null` par string vide.
- [x] `PF_Configstring` met a jour `sv.configstrings[index]`.
- [x] `PF_Configstring` n'envoie rien pendant `ss_loading`.
- [x] `PF_Configstring` clear multicast, ecrit opcode/index/string et multicast fiable hors loading.
- [x] Tous les `PF_Write*` ecrivent dans `sv.multicast` avec les helpers qcommon correspondants.

### Visibility/sound imports

- [x] `PF_inPVS` calcule leaf/cluster/area de `p1`.
- [x] `PF_inPVS` lit `CM_ClusterPVS`.
- [x] `PF_inPVS` calcule leaf/cluster/area de `p2`.
- [x] `PF_inPVS` teste le bit cluster et `CM_AreasConnected`.
- [x] `PF_inPHS` conserve la meme structure avec `CM_ClusterPHS`.
- [x] `PF_StartSound` retourne si entity nul.
- [x] `PF_StartSound` appelle `SV_StartSound(null, entity, ...)`.

### `SV_InitGameProgs`

- [x] Shutdown l'ancien game si un game est deja initialise.
- [x] Construit la table `game_import_t` dans l'ordre logique source.
- [x] Branche multicast/unicast/print/error.
- [x] Branche link/unlink/BoxEdicts/trace/pointcontents.
- [x] Branche setmodel/inPVS/inPHS/Pmove.
- [x] Branche modelindex/soundindex/imageindex.
- [x] Branche configstring/sound/positioned_sound.
- [x] Branche tous les `Write*`.
- [x] Branche TagMalloc/TagFree/FreeTags avec allocation TS locale.
- [x] Branche cvar/cvar_set/cvar_forceset.
- [x] Branche argc/argv/args/AddCommandString.
- [x] Branche DebugGraph, SetAreaPortalState, AreasConnected.
- [x] Remplace `Sys_GetGameAPI` par factory TS injectable.
- [x] Verifie `apiversion` contre `GAME_API_VERSION`.
- [x] Assigne la table export au `ge` partage.
- [x] Appelle `ge.Init()`.

### `SV_ShutdownGameProgs` et helpers TS

- [x] `SV_ShutdownGameProgs` retourne si aucun game initialise.
- [x] `SV_ShutdownGameProgs` appelle `ge.Shutdown()`.
- [x] `SV_ShutdownGameProgs` remplace l'unload DLL par reset memoire documente.
- [x] `assignGameExports` preserve l'identite de l'objet `ge` partage par le runtime.
- [x] `formatPrintf` couvre les formats utilises par les imports testes.
- [x] `SV_InitEdict` est documente comme helper TS derive, hors corps `sv_game.c`.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

Notes : `runtime.ts` compose `sv_game` apres `sv_send`/`sv_world` et avant les appels init ; `sv_init.ts` appelle `SV_InitGameProgs`; `sv_main.ts` appelle `SV_ShutdownGameProgs`; `sv_send.ts` consomme les messages/sounds produits via callbacks ; `sv_world.ts` fournit link/trace/PVS support via runtime.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

Notes : non applicable directement. `sv_game.c` produit des configstrings, messages et entity/sound callbacks consommes par le pipeline serveur/client, pas du rendu direct.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

Notes : `PF_StartSound` et `positioned_sound` sont branches vers `SV_StartSound`; le routage audio final est couvert par `sv_send`/client/audio.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

Tests existants : `scripts/verify/quake2-sv-game.ts` couvre bootstrap reel gameplay, propagation `SpawnEntities`, configstrings, lifecycle init/shutdown, import table complete, print/unicast/configstring/sound/cvar/cmd/debug/area/PVS/PHS et allocations taggees.

Tests a ajouter : cas d'erreur version `GAME_API_VERSION` incorrecte, `PF_setmodel` inline bmodel reel et `PF_cprintf` non-client verrouilleraient les branches d'erreur.

## Findings

1. [Info] Le chargement DLL natif est remplace par une factory TypeScript injectable.
   - Fichier/ligne : `packages/server/src/sv_game.ts:456`
   - Source originale : `sv_game.c:323` appelle `Sys_GetGameAPI(&import)`.
   - Impact : ecart necessaire hors environnement natif ; la table `game_import_t` et le check version restent dans le port principal.
   - Correction recommandee : aucune ; garder l'injection dans `ServerGameContext`.

2. [Info] `Sys_UnloadGame` et `ge = NULL` deviennent un reset d'etat local.
   - Fichier/ligne : `packages/server/src/sv_game.ts:441`
   - Source originale : `sv_game.c:305` appelle `ge->Shutdown()`, `Sys_UnloadGame()`, puis `ge = NULL`.
   - Impact : comportement lifecycle conserve sans unload DLL.
   - Correction recommandee : aucune ; documenter si un systeme de plugins natifs apparait.

3. [Info] Les allocations `Z_Tag*` sont adaptees en `Uint8Array` suivis par tag.
   - Fichier/ligne : `packages/server/src/sv_game.ts:502`
   - Source originale : `sv_game.c:377` branche `Z_TagMalloc`, `Z_Free`, `Z_FreeTags`.
   - Impact : contrat game import utilisable en TS, sans ownership memoire natif.
   - Correction recommandee : aucune ; conserver ces allocations locales au bridge.

## Decision

- Corriger maintenant : rien
- Reporter : ajouter des tests d'erreur version API, inline bmodel et cprintf non-client
- Documenter : inventaire et audit crees

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `server\sv_game.c`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/server-sv_game.audit.md`
