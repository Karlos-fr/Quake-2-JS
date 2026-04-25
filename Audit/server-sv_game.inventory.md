# Inventaire Portage Quake II - server/sv_game.c

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/server/sv_game.c`
- Sources C/H secondaires : `Quake-2-master/server/server.h`, `game/game.h`, qcommon protocol/messages/collision/cvar/cmd/pmove, types `edict_t`, `game_import_t`, `game_export_t`
- Package cible principal : `packages/server`
- Fichier TS principal pressenti : `packages/server/src/sv_game.ts`
- Fichiers TS secondaires pressentis : `packages/server/src/server.ts`, `packages/server/src/runtime.ts`, `packages/server/src/sv_init.ts`, `packages/server/src/sv_main.ts`, `packages/server/src/sv_send.ts`, `packages/server/src/sv_world.ts`, `packages/server/src/index.ts`
- Domaine : serveur, bridge moteur -> gameplay, table imports game DLL, multicast/configstrings, visibility PVS/PHS, sound, cvar/cmd/memory imports
- Niveau de fidelite attendu : Strict avec ecarts d'adaptation DLL/OS documentes
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`
- Exception de decoupage documentee : aucune pour le comportement principal ; les consommateurs fournissent les callbacks serveur/world/send/init via `runtime.ts`.
- Justification si `1 fichier C != 1 fichier TS` : non applicable ; `packages/server/src/sv_game.ts` reste le point principal, `server.ts` ne porte que les signatures et types.

## Inventaire source

### Fonctions

- [x] Nom : `PF_Unicast`
  - Source : `sv_game.c:34`
  - Role : envoie `sv.multicast` a un client fiable ou non fiable, puis clear.
  - Cible TS pressentie : `sv_game.ts:151`
  - Statut : porte
  - Notes : conserve validation edict client, destination `netchan.message`/`datagram`, clear multicast.

- [x] Nom : `PF_dprintf`
  - Source : `sv_game.c:64`
  - Role : debug print serveur.
  - Cible TS pressentie : `sv_game.ts:182`
  - Statut : porte Close
  - Notes : `vsprintf` adapte en `formatPrintf`, sortie via hook `onPrintf`.

- [x] Nom : `PF_cprintf`
  - Source : `sv_game.c:84`
  - Role : print vers un client ou console.
  - Cible TS pressentie : `sv_game.ts:192`
  - Statut : porte Close
  - Notes : preserve erreur non-client et routage `SV_ClientPrintf`.

- [x] Nom : `PF_centerprintf`
  - Source : `sv_game.c:115`
  - Role : ecrit un centerprint dans multicast puis unicast fiable.
  - Cible TS pressentie : `sv_game.ts:213`
  - Statut : porte
  - Notes : conserve retour silencieux si non-client.

- [x] Nom : `PF_error`
  - Source : `sv_game.c:142`
  - Role : abort serveur avec prefixe `Game Error`.
  - Cible TS pressentie : `sv_game.ts:235`
  - Statut : porte
  - Notes : `Com_Error(ERR_DROP, ...)` adapte en callback/exception `SV_Error`.

- [x] Nom : `PF_setmodel`
  - Source : `sv_game.c:162`
  - Role : assigne `s.modelindex`, copie bbox inline bmodel et relink.
  - Cible TS pressentie : `sv_game.ts:245`
  - Statut : porte Close
  - Notes : ajoute garde TS si inline model introuvable.

- [x] Nom : `PF_Configstring`
  - Source : `sv_game.c:192`
  - Role : met a jour `sv.configstrings` et multicast hors loading.
  - Cible TS pressentie : `sv_game.ts:275`
  - Statut : porte
  - Notes : `MAX_CONFIGSTRINGS` represente par longueur de tableau `sv.configstrings`.

- [x] Nom : `PF_WriteChar`
  - Source : `sv_game.c:216`
  - Role : ecrit un char dans `sv.multicast`.
  - Cible TS pressentie : `sv_game.ts:298`
  - Statut : porte
  - Notes : wrapper strict.

- [x] Nom : `PF_WriteByte`
  - Source : `sv_game.c:217`
  - Role : ecrit un byte dans `sv.multicast`.
  - Cible TS pressentie : `sv_game.ts:306`
  - Statut : porte
  - Notes : wrapper strict.

- [x] Nom : `PF_WriteShort`
  - Source : `sv_game.c:218`
  - Role : ecrit un short dans `sv.multicast`.
  - Cible TS pressentie : `sv_game.ts:314`
  - Statut : porte
  - Notes : wrapper strict.

- [x] Nom : `PF_WriteLong`
  - Source : `sv_game.c:219`
  - Role : ecrit un long dans `sv.multicast`.
  - Cible TS pressentie : `sv_game.ts:322`
  - Statut : porte
  - Notes : wrapper strict.

- [x] Nom : `PF_WriteFloat`
  - Source : `sv_game.c:220`
  - Role : ecrit un float dans `sv.multicast`.
  - Cible TS pressentie : `sv_game.ts:330`
  - Statut : porte
  - Notes : wrapper strict.

- [x] Nom : `PF_WriteString`
  - Source : `sv_game.c:221`
  - Role : ecrit une string dans `sv.multicast`.
  - Cible TS pressentie : `sv_game.ts:338`
  - Statut : porte
  - Notes : wrapper strict.

- [x] Nom : `PF_WritePos`
  - Source : `sv_game.c:222`
  - Role : ecrit une position dans `sv.multicast`.
  - Cible TS pressentie : `sv_game.ts:346`
  - Statut : porte
  - Notes : wrapper strict.

- [x] Nom : `PF_WriteDir`
  - Source : `sv_game.c:223`
  - Role : ecrit une direction dans `sv.multicast`.
  - Cible TS pressentie : `sv_game.ts:354`
  - Statut : porte
  - Notes : wrapper strict.

- [x] Nom : `PF_WriteAngle`
  - Source : `sv_game.c:224`
  - Role : ecrit un angle dans `sv.multicast`.
  - Cible TS pressentie : `sv_game.ts:362`
  - Statut : porte
  - Notes : wrapper strict.

- [x] Nom : `PF_inPVS`
  - Source : `sv_game.c:234`
  - Role : visibility PVS + area portal.
  - Cible TS pressentie : `sv_game.ts:370`
  - Statut : porte
  - Notes : conserve mask cluster et `CM_AreasConnected`.

- [x] Nom : `PF_inPHS`
  - Source : `sv_game.c:264`
  - Role : hearability PHS + area portal.
  - Cible TS pressentie : `sv_game.ts:395`
  - Statut : porte
  - Notes : conserve mask cluster et `CM_AreasConnected`.

- [x] Nom : `PF_StartSound`
  - Source : `sv_game.c:287`
  - Role : forward sound entite vers `SV_StartSound`.
  - Cible TS pressentie : `sv_game.ts:420`
  - Statut : porte
  - Notes : conserve retour si entity nul.

- [x] Nom : `SV_ShutdownGameProgs`
  - Source : `sv_game.c:305`
  - Role : appelle `ge->Shutdown`, unload game, remet ge a nul.
  - Cible TS pressentie : `sv_game.ts:441`
  - Statut : porte Close
  - Notes : DLL unload adapte en `gameInitialized=false`.

- [x] Nom : `SV_InitGameProgs`
  - Source : `sv_game.c:323`
  - Role : construit `game_import_t`, charge game API, verifie version, appelle `ge->Init`.
  - Cible TS pressentie : `sv_game.ts:456`
  - Statut : porte Close
  - Notes : `Sys_GetGameAPI` remplace par factory TS injectable.

- [x] Nom : `SV_InitEdict`
  - Source : declaration/usage serveur TS derivee du header et du besoin runtime
  - Role : reinitialise le prefixe serveur d'un edict.
  - Cible TS pressentie : `sv_game.ts:550`
  - Statut : helper TS nouveau
  - Notes : pas de corps dans `sv_game.c`, rattache aux procedures game serveur.

### Structures / types

- [x] Nom : `game_export_t *ge`
  - Source : `sv_game.c:24`
  - Role : pointeur global vers l'API gameplay chargee.
  - Representation TS pressentie : `ServerGameContext.ge`
  - Statut : porte via contexte explicite
  - Notes : `assignGameExports` preserve l'objet partage.

- [x] Nom : `game_import_t`
  - Source : `sv_game.c:325` et `game/game.h`
  - Role : table de callbacks moteur exposee au gameplay.
  - Representation TS pressentie : `packages/game/src/game.ts`
  - Statut : consomme
  - Notes : construite dans `SV_InitGameProgs`.

- [x] Nom : `game_export_t`
  - Source : `game/game.h`
  - Role : table de callbacks gameplay retournee par `GetGameAPI`.
  - Representation TS pressentie : `packages/game/src/game.ts`
  - Statut : consomme
  - Notes : version verifiee contre `GAME_API_VERSION`.

- [x] Nom : `ServerGameContext`
  - Source : nouveau contexte TS
  - Role : remplace globals C et callbacks externes du serveur.
  - Representation TS pressentie : `sv_game.ts:83`
  - Statut : nouveau contexte
  - Notes : adaptation conforme README.

### Enums / constantes / flags / macros utiles

- [x] Nom : `GAME_API_VERSION`
  - Source : `game/game.h`
  - Valeur / role : version attendue de l'API game.
  - Cible TS pressentie : `packages/game/src/index.js`
  - Statut : consomme
  - Notes : verifiee dans `SV_InitGameProgs`.

- [x] Nom : `MAX_CONFIGSTRINGS`
  - Source : qcommon/server headers
  - Valeur / role : borne configstrings.
  - Cible TS pressentie : `server_t.configstrings.length`
  - Statut : consomme indirect
  - Notes : tableau cree dans `server.ts`.

- [x] Nom : `svc_centerprint`, `svc_configstring`
  - Source : qcommon protocol
  - Valeur / role : opcodes multicast.
  - Cible TS pressentie : `svc_ops_e`
  - Statut : consomme
  - Notes : valeurs conservees par qcommon.

- [x] Nom : `MULTICAST_ALL_R`
  - Source : qcommon/server protocol
  - Valeur / role : multicast fiable a tous.
  - Cible TS pressentie : `multicast_t.MULTICAST_ALL_R`
  - Statut : consomme
  - Notes : utilise par `PF_Configstring`.

- [x] Nom : `ss_loading`
  - Source : `server.h`
  - Valeur / role : etat serveur qui suspend le multicast configstring.
  - Cible TS pressentie : `server_state_t.ss_loading`
  - Statut : consomme
  - Notes : comparaison directe.

- [x] Nom : `ERR_DROP`
  - Source : qcommon error model
  - Valeur / role : erreur recuperable serveur.
  - Cible TS pressentie : `SV_Error`
  - Statut : adapte
  - Notes : exception/callback TS avec message source.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `ge` | global | `sv_game.ts` | `context.ge` | OK | contexte explicite |
| `PF_Unicast` | helper import | `sv_game.ts` | `PF_Unicast` | OK | local |
| `PF_dprintf` | helper import | `sv_game.ts` | `PF_dprintf` | OK Close | print hook |
| `PF_cprintf` | helper import | `sv_game.ts` | `PF_cprintf` | OK Close | print hook |
| `PF_centerprintf` | helper import | `sv_game.ts` | `PF_centerprintf` | OK | local |
| `PF_error` | helper import | `sv_game.ts` | `PF_error` | OK | `SV_Error` |
| `PF_setmodel` | helper import | `sv_game.ts` | `PF_setmodel` | OK Close | inline model guard |
| `PF_Configstring` | helper import | `sv_game.ts` | `PF_Configstring` | OK | local |
| `PF_Write*` | helpers import | `sv_game.ts` | `PF_Write*` | OK | wrappers |
| `PF_inPVS` | helper import | `sv_game.ts` | `PF_inPVS` | OK | local |
| `PF_inPHS` | helper import | `sv_game.ts` | `PF_inPHS` | OK | local |
| `PF_StartSound` | helper import | `sv_game.ts` | `PF_StartSound` | OK | local |
| `SV_ShutdownGameProgs` | procedure | `sv_game.ts` | `SV_ShutdownGameProgs` | OK Close | unload DLL adapte |
| `SV_InitGameProgs` | procedure | `sv_game.ts` | `SV_InitGameProgs` | OK Close | factory TS |
| `SCR_DebugGraph` | extern callback | `sv_game.ts` | `debugGraph` | OK | hook optionnel |
| `Sys_GetGameAPI` | OS/DLL hook | `sv_game.ts` | `getGameApi` | adapte | injectable |
| `Sys_UnloadGame` | OS/DLL hook | `sv_game.ts` | `gameInitialized=false` | adapte | in-memory |
| `Z_TagMalloc/Z_Free/Z_FreeTags` | memory imports | `sv_game.ts` | `zoneAllocations` callbacks | adapte | allocation `Uint8Array` |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/server/src/runtime.ts`
- Client : indirect via `SV_ClientPrintf`, multicast/datagram, configstrings et sounds
- Server : `packages/server/src/sv_init.ts`, `packages/server/src/sv_main.ts`, `packages/server/src/sv_send.ts`, `packages/server/src/sv_world.ts`, `packages/server/src/server.ts`, `packages/server/src/index.ts`
- Renderer common : indirect via configstrings/entity/sound flows, non applicable direct
- Renderer three : indirect via client state, non applicable direct
- Web / platform : non applicable direct au comportement principal
- Audio : `PF_StartSound` et `positioned_sound` branchent vers `SV_StartSound`
- Tests existants : `scripts/verify/quake2-sv-game.ts`, integrations `quake2-sv-init.ts`, `quake2-sv-main.ts`, `quake2-server-runtime.ts`
