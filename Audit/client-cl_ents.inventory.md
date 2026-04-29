# Inventaire Portage Quake II - client/cl_ents.c

Date : 2026-04-26

## Identification

- Source C/H principale : `Quake-2-master/client/cl_ents.c`
- Sources C/H secondaires : `Quake-2-master/client/client.h`, fragments `Quake-2-master/qcommon/qcommon.h` et `Quake-2-master/game/q_shared.h` utilises par `client/cl_ents.c`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/entities.ts`
- Fichiers TS secondaires pressentis : `packages/client/src/parse.ts`, `packages/client/src/refresh.ts`, `packages/client/src/view.ts`, `packages/client/src/effects.ts`, `packages/client/src/newfx.ts`, `packages/client/src/tent.ts`, `packages/client/src/types.ts`, `packages/qcommon/src/protocol.ts`, `packages/qcommon/src/q-shared.ts`
- Domaine : client, parsing snapshots, interpolation entites, effets visuels, view weapon, origines sonores
- Niveau de fidelite attendu : ISO source, avec ecarts documentes pour hooks renderer/audio/runtime
- Statut actuel dans `PORTAGE_QUAKE2.md` : ligne `client\cl_ents.c` presente, annonce portage principal ferme
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : `✅` avant recreation de cet audit, a revalider item par item

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS` autant que possible
- Exception de decoupage documentee : a verifier ; le port est actuellement disperse entre parsing, composition refresh, vue et effets
- Justification si `1 fichier C != 1 fichier TS` : acceptable seulement si `entities.ts` reste le rattachement principal et si chaque dispersion conserve la tracabilite source

## Inventaire source

### Fonctions actives

- [ ] Nom : `CL_ParseEntityBits`
  - Source : `client/cl_ents.c`
  - Role : lire les bits d'en-tete d'une entite reseau et son numero
  - Cible TS pressentie : `packages/client/src/parse.ts`
  - Statut : non valide
  - Notes : ordre de lecture structurel conforme, mais les constantes `U_MOREBITS2/3` divergent du source C ; `bitcounts[32]` profiling C non porte.

- [ ] Nom : `CL_ParseDelta`
  - Source : `client/cl_ents.c`
  - Role : appliquer un delta `entity_state_t`
  - Cible TS pressentie : `packages/client/src/parse.ts`
  - Statut : non valide
  - Notes : ordre des champs conforme, mais depend des bitmasks support `U_*` divergents pour ce chemin.

- [ ] Nom : `CL_DeltaEntity`
  - Source : `client/cl_ents.c`
  - Role : stocker une entite delta dans le ring `cl_parse_entities` et mettre a jour `centity_t`
  - Cible TS pressentie : `packages/client/src/parse.ts`
  - Statut : non valide
  - Notes : mutations locales conformes, mais depend de `CL_ParseDelta` non valide tant que le support `U_*` diverge.

- [ ] Nom : `CL_ParsePacketEntities`
  - Source : `client/cl_ents.c`
  - Role : reconstruire les packet entities d'une frame par comparaison old/new
  - Cible TS pressentie : `packages/client/src/parse.ts`
  - Statut : non valide
  - Notes : merge old/new structurel conforme, mais depend de `CL_ParseEntityBits` / `CL_ParseDelta` et donc des bitmasks support `U_*` divergents ; logs shownet non portes.

- [x] Nom : `CL_ParsePlayerstate`
  - Source : `client/cl_ents.c`
  - Role : parser le playerstate delta de la frame
  - Cible TS pressentie : `packages/client/src/parse.ts`
  - Statut : verifie
  - Notes : copie oldframe/zero, flags `PS_*`, ordre de lecture pmove/playerstate/stats et demo `PM_FREEZE` conformes.

- [ ] Nom : `CL_FireEntityEvents`
  - Source : `client/cl_ents.c`
  - Role : declencher les events d'entites et particules teleporter
  - Cible TS pressentie : `packages/client/src/entities.ts`
  - Statut : verification commencee, non valide
  - Notes : extraction event OK, mais `EF_TELEPORTER -> CL_TeleporterParticles` n'est pas consomme ; le builder d'effets ignore explicitement cet evenement synthetique.

- [ ] Nom : `CL_ParseFrame`
  - Source : `client/cl_ents.c`
  - Role : parser une frame serveur complete et choisir l'oldframe valide
  - Cible TS pressentie : `packages/client/src/parse.ts`
  - Statut : non valide
  - Notes : parsing principal proche, mais equivalent `SCR_EndLoadingPlaque` non branche au point source ; `ClientParseHooks` n'expose pas ce hook.

- [x] Nom : `S_RegisterSexedModel`
  - Source : `client/cl_ents.c`
  - Role : resoudre un modele joueur genre/skin avec fallback
  - Cible TS pressentie : `packages/client/src/view.ts`
  - Statut : verifie, non consomme par le source
  - Notes : aucune reference appelee dans le depot C original ; le chemin custom player/weapon reel est porte via `clientinfo.weaponmodel` et `view.ts`.

- [ ] Nom : `CL_AddPacketEntities`
  - Source : `client/cl_ents.c`
  - Role : interpoler les entites packet, appliquer flags/effects, modeles lies, lumieres et trails
  - Cible TS pressentie : `packages/client/src/entities.ts`, `packages/client/src/refresh.ts`, `packages/client/src/effects.ts`, `packages/client/src/view.ts`
  - Statut : verification commencee, non valide
  - Notes : plusieurs sous-blocs conformes, mais custom player/weapon non resolus par le consommateur renderer direct, color-shell separee, powerscreen, trails/particules automatiques, randomisation `RF_BEAM`, mutation `EF_TRAP` et branches tracker `vidref_val` incomplets.

- [ ] Nom : `CL_AddViewWeapon`
  - Source : `client/cl_ents.c`
  - Role : ajouter l'arme vue premiere personne
  - Cible TS pressentie : `packages/client/src/refresh.ts`, `packages/client/src/view.ts`
  - Statut : verification commencee, non valide
  - Notes : comportement principal proche ; garde `!gun.model` non confirmee cote port.

- [x] Nom : `CL_CalcViewValues`
  - Source : `client/cl_ents.c`
  - Role : calculer interpolation vieworg/viewangles/blend/FOV
  - Cible TS pressentie : `packages/client/src/view.ts`
  - Statut : verifie
  - Notes : oldframe fallback, teleport guard, prediction/no-prediction, step smoothing, angles/kick, vectors, fov et blend conformes.

- [ ] Nom : `CL_AddEntities`
  - Source : `client/cl_ents.c`
  - Role : orchestrer scene client : frame events, packet entities, temp entities, particles, lights
  - Cible TS pressentie : `packages/client/src/refresh.ts`, `packages/client/src/view.ts`
  - Statut : non valide
  - Notes : orchestration partiellement branchee, mais depend de `CL_AddPacketEntities` et `CL_FireEntityEvents` non valides ; ordre `CL_RunDLights` / `CL_RunLightStyles` dans le builder TS differe du point source et de `CL_Frame`.

- [x] Nom : `CL_GetEntitySoundOrigin`
  - Source : `client/cl_ents.c`
  - Role : retourner l'origine interpolee d'une entite pour les sons
  - Cible TS pressentie : `packages/client/src/refresh.ts`
  - Statut : verifie
  - Notes : bornes entite et copie de `lerp_origin` conformes, retour par valeur TS.

### Fonctions sous `#if 0`

- [x] Nom : `CL_ClearProjectiles`
  - Source : `client/cl_ents.c`
  - Role : ancien chemin projectile desactive
  - Cible TS pressentie : aucune sauf documentation
  - Statut : documente non applicable
  - Notes : compile-out dans le C original via `#if 0`

- [x] Nom : `CL_ParseProjectiles`
  - Source : `client/cl_ents.c`
  - Role : ancien parsing projectile desactive
  - Cible TS pressentie : aucune sauf documentation
  - Statut : documente non applicable
  - Notes : compile-out dans le C original via `#if 0`

- [x] Nom : `CL_AddProjectiles`
  - Source : `client/cl_ents.c`
  - Role : ancien ajout projectile desactive
  - Cible TS pressentie : aucune sauf documentation
  - Statut : documente non applicable
  - Notes : compile-out dans le C original via `#if 0`

### Structures / types

- [x] Nom : `frame_t`
  - Source : `client/client.h`
  - Role : frame serveur client avec `playerstate`, `parse_entities`, `num_entities`
  - Representation TS pressentie : `packages/client/src/types.ts`
  - Statut : verifie
  - Notes : champs source conserves ; `areabits` porte en `Uint8Array`.

- [x] Nom : `centity_t`
  - Source : `client/client.h`
  - Role : etat courant/precedent/baseline par entite client
  - Representation TS pressentie : `packages/client/src/types.ts`
  - Statut : verifie
  - Notes : champs source conserves, references C remplacees par objets/arrays TS.

- [x] Nom : `entity_state_t`
  - Source : `q_shared.h`
  - Role : etat reseau d'entite
  - Representation TS pressentie : `packages/qcommon/src/q-shared.ts`
  - Statut : verifie
  - Notes : champs source conserves dans `packages/qcommon/src/q-shared.ts`.

- [x] Nom : `player_state_t`
  - Source : `q_shared.h`
  - Role : etat reseau joueur
  - Representation TS pressentie : `packages/qcommon/src/q-shared.ts`
  - Statut : verifie
  - Notes : champs source conserves, `stats` porte en tableau numerique de taille `MAX_STATS`.

- [x] Nom : `client_state_t`
  - Source : `client/client.h`
  - Role : globals client `cl`
  - Representation TS pressentie : `packages/client/src/types.ts`
  - Statut : verifie avec adaptations
  - Notes : etat principal conserve ; `refdef`/vecteurs vue sont externalises vers `view.ts` et `screen`/`cinematic` regroupes dans des sous-etats.

### Enums / constantes / flags / macros utiles

- [x] Nom : `MAX_PARSE_ENTITIES`
  - Source : `client/client.h`
  - Valeur / role : `1024`, taille ring packet entities
  - Cible TS pressentie : `packages/client/src/types.ts`
  - Statut : verifie
  - Notes : valeur `1024` conservee.

- [x] Nom : `UPDATE_MASK`, `UPDATE_BACKUP`
  - Source : protocole Quake II
  - Valeur / role : historique frames client
  - Cible TS pressentie : `packages/qcommon/src/protocol.ts`
  - Statut : verifie
  - Notes : `UPDATE_BACKUP = 16`, `UPDATE_MASK = 15` conserves.

- [ ] Nom : `U_*`
  - Source : `qcommon/qcommon.h`
  - Valeur / role : bitmasks delta entity/playerstate
  - Cible TS pressentie : `packages/qcommon/src/protocol.ts`, `packages/client/src/parse.ts`
  - Statut : non valide
  - Notes : plusieurs bitmasks utilises par `cl_ents.c` divergent de `Quake-2-master/qcommon/qcommon.h` a partir de `U_EFFECTS8`.

- [x] Nom : `EF_*`
  - Source : `q_shared.h`
  - Valeur / role : effets entites pour animation, trails, lumieres
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`, `packages/client/src/entities.ts`, `packages/client/src/refresh.ts`, `packages/client/src/effects.ts`
  - Statut : verifie
  - Notes : valeurs visibles du bloc `EF_*` conservees dans `q-shared.ts`.

- [x] Nom : `RF_*`
  - Source : `q_shared.h`
  - Valeur / role : flags rendu entite
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`, `packages/client/src/entities.ts`, `packages/client/src/refresh.ts`, `packages/client/src/view.ts`
  - Statut : verifie
  - Notes : valeurs visibles du bloc `RF_*` conservees dans `q-shared.ts`.

- [x] Nom : `EV_*`
  - Source : `q_shared.h`
  - Valeur / role : events entite
  - Cible TS pressentie : `packages/client/src/entities.ts`, `packages/client/src/effects.ts`
  - Statut : verifie
  - Notes : enum `entity_event_t` conserve l'ordre source.

- [ ] Nom : `vidref_val`, `VIDREF_*`
  - Source : `client/cl_ents.c`, `q_shared.h`
  - Valeur / role : branchements rendu OpenGL/soft historiques
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`, `packages/client/src/refresh.ts`
  - Statut : non valide pour `CL_AddPacketEntities`
  - Notes : les constantes support existent, mais les branches `EF_TRACKERTRAIL | EF_TRACKER` et `EF_TRACKER` du chemin audite emettent toujours la variante negative type GL dans `refresh.ts`.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `CL_ParseEntityBits` | Fonction | `packages/client/src/parse.ts` | `CL_ParseEntityBits` | Non valide | support `U_MOREBITS2/3` divergent ; `bitcounts[32]` non porte |
| `CL_ParseDelta` | Fonction | `packages/client/src/parse.ts` | `CL_ParseDelta` | Non valide | depend du support `U_*` divergent |
| `CL_DeltaEntity` | Fonction | `packages/client/src/parse.ts` | `CL_DeltaEntity` | Non valide | depend de `CL_ParseDelta` |
| `CL_ParsePacketEntities` | Fonction | `packages/client/src/parse.ts` | `CL_ParsePacketEntities` | Non valide | depend de `CL_ParseEntityBits` / `CL_ParseDelta` ; shownet/debug omis |
| `CL_ParsePlayerstate` | Fonction | `packages/client/src/parse.ts` | `CL_ParsePlayerstate` | Verifie | |
| `CL_FireEntityEvents` | Fonction | `packages/client/src/entities.ts` | `CL_FireEntityEvents`, `CL_BuildFrameEntityEventEffects` | Non valide | `EF_TELEPORTER` ignore par le builder d'effets |
| `CL_ParseFrame` | Fonction | `packages/client/src/parse.ts` | `CL_ParseFrame` | Non valide | manque equivalent `SCR_EndLoadingPlaque` |
| `S_RegisterSexedModel` | Fonction | Aucun port direct | Aucun | Verifie non consomme | Fonction C non appelee dans le depot original |
| `CL_AddPacketEntities` | Fonction | `packages/client/src/entities.ts` | `CL_BuildPacketEntitySnapshots` | Non valide | custom models web, color-shell, powerscreen, trails/particules, `RF_BEAM`, `EF_TRAP` et `vidref_val` incomplets |
| `CL_AddViewWeapon` | Fonction | `packages/client/src/refresh.ts` | `appendViewWeapon` | Non valide | garde modele introuvable non confirmee |
| `CL_CalcViewValues` | Fonction | `packages/client/src/view.ts` | `CL_CalcViewValues` | Verifie | |
| `CL_AddEntities` | Fonction | `packages/client/src/refresh.ts` | `CL_BuildRefreshFrame` | Non valide | depend de `CL_AddPacketEntities` / `CL_FireEntityEvents` ; ordre `Run*` a justifier |
| `CL_GetEntitySoundOrigin` | Fonction | `packages/client/src/refresh.ts` | `CL_GetEntitySoundOrigin` | Verifie | |
| `frame_t` | Type | `packages/client/src/types.ts` | `frame_t` | Verifie | |
| `centity_t` | Type | `packages/client/src/types.ts` | `centity_t` | Verifie | |
| `entity_state_t` | Type | `packages/qcommon/src/q-shared.ts` | `entity_state_t` | Verifie | |
| `MAX_PARSE_ENTITIES` | Constante | `packages/client/src/types.ts` | `MAX_PARSE_ENTITIES` | Verifie | `1024` |
| `U_*`, `EF_*`, `RF_*` | Constantes | `packages/qcommon/src/protocol.ts`, `packages/qcommon/src/q-shared.ts` | noms originaux | Non valide pour `cl_ents.c` | `U_*` diverge dans le chemin audite ; `EF_*`/`RF_*` verifies |

## Points d'attention

- [ ] Nommage de fichier coherent avec la source
- [ ] Fichier principal de rattachement identifiable
- [ ] Decoupage coherent
- [ ] Risque de dispersion a verifier
- [ ] Helpers nouveaux a surveiller
- [ ] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/types.ts`, `packages/client/src/local-loop.ts`, `packages/client/src/local-gameplay-sync.ts`
- Client : `packages/client/src/parse.ts`, `packages/client/src/entities.ts`, `packages/client/src/refresh.ts`, `packages/client/src/view.ts`
- Server : `packages/server/src/sv_ents.ts`
- Renderer common : a verifier
- Renderer three : `packages/renderer-three/src/refresh-entity-sync.ts`, `packages/renderer-three/src/gl-rmain.ts`
- Web / platform : `apps/web/src/main.ts`, `apps/web/src/web-demo-loop.ts`, `apps/web/src/web-shell.ts`
- Audio : `packages/client/src/snd-dma.ts` ou equivalents a verifier
- Tests existants : `scripts/verify/quake2-entities-phase*.ts`, `scripts/verify/quake2-cl-view.ts`, `scripts/verify/quake2-snd-dma.ts`, autres a inventorier
