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
- Suivi fichier par fichier : [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\Quake-2-master\PORTAGE_QUAKE2.md)
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

- ✅ premier port de `q_shared.h` et des types communs
- ✅ premier port des messages et buffers reseau internes
- ✅ premiers ports de `cmd` et `cvar` dans le bloc `cmd`, `cvar`, `common`, `files`
- ✅ porter un premier bloc `common.c` pour `COM_*`, redirect et `Info_Print`
- ✅ etendre `files.c` avec search paths, gamedir, links, listing et chargement memoire
- 🟠 porter BSP / WAL / MD2 / PCX selon dependances reelles avec `PCX`, `WAL`, `MD2` et `BSP` deja amorces
- ⬜ remettre un chargement valide des assets depuis les `.pak`

### Phase 4 - Client minimal fidele

- ⬜ restaurer la chaine de parsing client originale
- ⬜ remettre les structures d'etat client
- ⬜ remettre les entites, configstrings, baselines et frames
- ⬜ remettre prediction, camera logique et point de spawn
- ⬜ remettre HUD et son cote client

### Phase 5 - Serveur et gameplay

- ⬜ porter le monde serveur minimal
- ⬜ remettre collision, traces et snapshots
- ⬜ porter le gameplay `game/`
- ⬜ gerer portes, triggers, pickups, armes et monstres progressivement

### Phase 6 - Bridge et rendu

- 🟠 definir les contrats `renderer-common`
- 🟠 construire le bridge runtime -> scene
- 🟠 rendre BSP, textures, lightmaps et entites avec un premier BSP texture via `WAL`, un premier peuplement d'entites et des comportements visuels simples
- 🟠 brancher MD2, sprites et effets visuels avec un premier MD2 web visible
- ⬜ stabiliser `WebGPU` puis fallback `WebGL`

## 5. Reste a porter

- ⬜ Le runtime bas niveau complet
- 🟠 Le systeme de fichiers Quake II complet avec montage `.pak`, search paths, gamedir, links, listing et lecture texte deja amorces
- 🟠 Les parseurs de formats definitifs avec `PAK`, `PCX`, `WAL`, `MD2` et `BSP` deja amorces
- 🟠 Le socle `qcommon` avec `cmd`, `cvar`, `messages`, `q_shared`, `common` et un runtime d'integration deja amorces
- ⬜ Le vrai pipeline client Quake II
- ⬜ Le monde serveur et les snapshots
- ⬜ Le gameplay `game/`
- 🟠 Le bridge moteur -> rendu avec extraction d'entites BSP, spawn, surfaces et groupe Three.js deja amorces
- 🟠 Le rendu BSP / MD2 / HUD / audio avec un premier affichage BSP web texture, un premier MD2 et un premier peuplement d'entites deja amorces
- ⬜ Les outils de generation et de verification
- ⬜ Le remplissage progressif de `PORTAGE_QUAKE2.md`

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
