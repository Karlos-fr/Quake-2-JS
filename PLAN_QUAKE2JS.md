# PLAN_QUAKE2JS.md

# Quake2JS - Plan de reprise

## 1. Vision

Construire un portage fidele de Quake II original en TypeScript / JavaScript, avec :

- un coeur moteur porte depuis le code C original ;
- un outillage d'assistance au portage ;
- un bridge explicite entre runtime Quake II et rendu web ;
- un backend `Three.js` capable de tourner en `WebGPU` avec fallback `WebGL`.

## 2. References de travail

- Source originale a porter : [Quake-2-master](C:\a\Projets\Quake-2\Quake-2-master)
- Installation originale et assets : [Quake 2](<C:\a\Projets\Quake-2\Quake 2>)
- Suivi fichier par fichier : [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md)
- Regles de projet : [README.md](C:\a\Projets\Quake-2\README.md)

## 3. Axes de travail

### 3.1 Runtime

- `memory`
- `math`
- `filesystem`
- `formats`
- `qcommon`

### 3.2 Gameplay et simulation

- `server`
- `game`
- `client`

### 3.3 Rendu et plateforme

- `renderer-common`
- `renderer-three`
- `platform`
- `apps/web`

### 3.4 Outillage

- indexation des fichiers C ;
- extraction de signatures ;
- generation de stubs ;
- mapping des symboles ;
- diff de traces / golden tests.

## 4. Phases

### Phase 0 - Reset et cadrage

- ✅ supprimer le prototype precedent
- ✅ recreer une architecture cible propre
- ✅ reecrire le README de reference
- ✅ reconnecter le plan avec les chemins source et assets
- ✅ rattacher le suivi a `PORTAGE_QUAKE2.md`

### Phase 1 - Fondation runtime

- ✅ poser les packages `memory`, `math`, `filesystem`, `formats`, `shared`
- ✅ definir les conventions de types et de headers de code
- ✅ remettre un bootstrap de build/typecheck minimal
- ✅ porter en priorite les primitives binaires et buffers
- ✅ remettre la lecture `.pak`

### Phase 2 - Outils de portage

- ✅ indexer les fichiers source C et headers
- ✅ extraire les signatures des fonctions et structures
- ✅ generer des stubs TypeScript par fichier cible
- ✅ produire un mapping source C -> module TS
- ✅ preparer des golden tests et traces de comparaison

### Phase 3 - Qcommon et formats

- 🟠 amorcer `cmodel.c` avec un premier backend BSP pour `CM_PointContents`, `CM_BoxTrace`, world models et hooks `pmove`
- ✅ premier port de `q_shared.h` et des types communs
- ✅ premier port des messages et buffers reseau internes
- ✅ premiers ports de `cmd` et `cvar` dans le bloc `cmd`, `cvar`, `common`, `files`
- ✅ porter un premier bloc `common.c` pour `COM_*`, redirect et `Info_Print`
- ✅ etendre `files.c` avec search paths, gamedir, links, listing et chargement memoire
- 🟠 porter BSP / WAL / MD2 / PCX selon dependances reelles avec `PCX`, `WAL`, `MD2` et `BSP` deja amorces
- ⬜ remettre un chargement valide des assets depuis les `.pak`

### Phase 4 - Client minimal fidele

- 🟠 amorcer `pmove.c` avec `PM_ClipVelocity`, `PM_Friction`, `PM_Accelerate`, `PM_AirAccelerate`, `PM_AddCurrents`, `PM_StepSlideMove` et le contexte `pml_t`
- 🟠 brancher une premiere prediction client sur `Pmove` avec buffers `cmds`, origines predites et hooks `trace` / `pointcontents`
- 🟠 etendre `pmove.c` avec `PM_CatagorizePosition`, `PM_CheckJump`, `PM_CheckSpecialMovement` et `PM_WaterMove`
- 🟠 etendre `pmove.c` avec `PM_FlyMove` et `PM_DeadMove`, puis les brancher dans `Pmove`
- 🟠 porter `PM_GoodPosition`, `PM_InitialSnapPosition` et `PM_SnapPosition`, puis finaliser leur usage dans `Pmove`
- 🟠 brancher un premier client local web sur `CL_CreateCmd` + `CL_PredictMovement` avec collision BSP reelle

- 🟠 restaurer la chaine de parsing client originale avec un premier parser `serverdata`, `configstring`, `baseline`, `frame` et un premier noyau `cl_main`
- 🟠 remettre les structures d'etat client avec un premier port de `frame_t`, `centity_t`, `client_state_t`, `client_static_t` et de l'init locale client
- 🟠 remettre les entites, configstrings, baselines et frames avec un premier port de `CL_ParseEntityBits`, `CL_ParseDelta`, `CL_ParsePlayerstate`, `CL_ParseFrame`, `CL_LoadClientinfo`, `CL_ParseClientinfo`, `CL_ParseLayout` et `CL_ParseInventory`
- 🟠 remettre prediction, camera logique et point de spawn avec un premier port de `CL_CheckPredictionError`, `CL_UpdateLerpFraction`, `CL_PredictMovement` et `CL_CalcViewValues`
- 🟠 remettre la construction des `usercmd_t` avec un premier port de `kbutton_t`, `KeyDown`, `KeyUp`, `CL_KeyState`, `CL_BaseMove`, `CL_FinishMove`, `CL_CreateCmd` et `CL_InitInput`
- 🟠 remettre HUD et son cote client

### Phase 5 - Serveur et gameplay

- ⬜ porter le monde serveur minimal
- ⬜ remettre collision, traces et snapshots
- ⬜ porter le gameplay `game/`
- ⬜ gerer portes, triggers, pickups, armes et monstres progressivement

### Phase 6 - Bridge et rendu

- 🟠 definir les contrats `renderer-common`
- 🟠 construire le bridge runtime -> scene
- 🟠 rendre BSP, textures, lightmaps, ciel et entites avec un premier BSP texture via `WAL`, un premier pipeline de ciel Quake II via `CS_SKY` / `env/*`, un premier peuplement d'entites et des comportements visuels simples
- 🟠 brancher MD2, sprites et effets visuels avec un premier MD2 web visible
- ⬜ stabiliser `WebGPU` puis fallback `WebGL`

## 5. Reste a porter

- 🟠 La collision BSP partagee avec un premier noyau `cmodel` pour `CM_PointContents`, `CM_BoxTrace` et les hooks `trace` / `pointcontents` deja amorces

- ⬜ Le runtime bas niveau complet
- 🟠 Le systeme de fichiers Quake II complet avec montage `.pak`, search paths, gamedir, links, listing et lecture texte deja amorces
- 🟠 Les parseurs de formats definitifs avec `PAK`, `PCX`, `WAL`, `MD2` et `BSP` deja amorces
- 🟠 Le socle `qcommon` avec `cmd`, `cvar`, `messages`, `q_shared`, `common` et un runtime d'integration deja amorces
- 🟠 Le vrai pipeline client Quake II avec un premier parser d'etat, de baselines, de frames, de son/download et de vue logique deja amorce
- ⬜ Le monde serveur et les snapshots
- ⬜ Le gameplay `game/`
- 🟠 Le bridge moteur -> rendu avec extraction d'entites BSP, spawn, surfaces et groupe Three.js deja amorces
- 🟠 Le rendu BSP / ciel / MD2 / HUD / audio avec un premier affichage BSP web texture, un premier pipeline de ciel Quake II, un premier MD2 et un premier peuplement d'entites deja amorces
- ⬜ Les outils de generation et de verification
- ⬜ Le remplissage progressif de `PORTAGE_QUAKE2.md`

### Mise a jour recente

- ✅ premier bloc de telechargement client porte avec `CL_DownloadFileName`, `CL_CheckOrDownloadFile` et `CL_Download_f`
- ✅ premier bloc de precache / autodownload client porte avec `CL_RequestNextDownload` et `CL_Precache_f`
- ✅ premiers wrappers de commandes `cl_main.c` portes avec `Cmd_ForwardToServer`, `CL_ForwardToServer_f`, `CL_Pause_f` et `CL_Setenv_f`
- ✅ premieres transitions de connexion `cl_main.c` portees avec `CL_Connect_f`, `CL_Reconnect_f` et `CL_Changing_f`
- ✅ premier bloc `rcon` porte avec `CL_Rcon_f` et les cvars `rcon_password` / `rcon_address`
- ✅ premiers utilitaires client `cl_main.c` portes avec `CL_Userinfo_f` et `CL_Snd_Restart_f`
- ✅ premier bloc de decouverte reseau porte avec `CL_PingServers_f`, `noudp`, `noipx` et `adr0..adr15`
- 🟠 le pipeline de precache / autodownload client reste a raccorder plus finement au chargement BSP/cmodel, aux checksums de map reels et aux callbacks finaux `CL_RegisterSounds` / `CL_PrepRefresh`
- ✅ premier pipeline de registration sonore client porte avec `CL_RegisterSounds` et `CL_RegisterTEntSounds`
- ✅ premier noyau HUD / client screen porte avec `SCR_CenterPrint`, loading plaque et snapshot `SCR_BuildScreenState`
- ✅ lecture de `STAT_LAYOUTS` branchee dans `apps/web` avec un overlay HUD minimal, panneaux scores/inventaire et status bar texte
- ✅ premier backend HUD Three.js branche dans `apps/web` avec `SCR_BuildHudDrawCommands`, status bar Quake II bootstrappee via `CS_STATUSBAR`, overlays `center print` / `net` / `pause` / `loading` et superposition 2D sur la scene 3D
- ✅ integration web finale du HUD nettoyee avec suppression du DOM legacy et panneau debug conserve a part
- ✅ premier pipeline de ciel Quake II porte avec etat client `CS_SKY` / `CS_SKYROTATE` / `CS_SKYAXIS`, chargement des assets `env/*`, skybox dediee `renderer-three` et integration dans `apps/web`
- ✅ pipeline des objets monde visibles bascule sur la source client `ClientRefreshFrame.entities` avec adaptateur Three.js MD2 dedie, suppression du preview heuristique legacy, diagnostics de couverture et verifications map-driven sur `base1`, `base2`, `base3`
- ✅ verification de fidelite des objets monde visibles consolidee par [PLAN_ENTITES_VISUELLES_QUAKE2.md](C:\a\Projets\Quake-2\PLAN_ENTITES_VISUELLES_QUAKE2.md) et [RAPPORT_PHASE11_ENTITES.md](C:\a\Projets\Quake-2\RAPPORT_PHASE11_ENTITES.md), actuellement au vert sur presence, orientation, hauteur, animation, rotation, modeles secondaires et effets visuels pour le perimetre porte

## 6. Ordre de reprise recommande

1. `shared`
2. `memory`
3. `math`
4. `filesystem`
5. `formats`
6. `qcommon`
7. `client`
8. `server`
9. `game`
10. outillage de stubs / indexation
11. `renderer-common`
12. `renderer-three`

## 7. Regle de mise a jour

Chaque avancee significative doit mettre a jour :

- ce plan ;
- `README.md` si une regle de travail change ;
- `PORTAGE_QUAKE2.md` quand un fichier source original est analyse, exclu ou porte.
