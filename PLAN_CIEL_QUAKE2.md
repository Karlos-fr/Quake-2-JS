# PLAN_CIEL_QUAKE2.md

# Quake2JS - Plan de mise en oeuvre du ciel

## 1. Objectif

Porter l'affichage du ciel de Quake II de maniere fidele au code source original, sans traiter les surfaces `SURF_SKY` comme des murs BSP ordinaires.

Le resultat cible est :

- lecture du ciel actif depuis les configstrings client ;
- conservation du comportement original `SURF_SKY` cote BSP ;
- rendu d'un ciel dedie dans le backend web ;
- compatibilite avec `Three.js` en `WebGPU` avec fallback `WebGL`.

## 2. References source

Le referentiel principal pour cette partie est le code original Quake II :

- `Quake-2-master/client/cl_parse.c`
- `Quake-2-master/client/cl_view.c`
- `Quake-2-master/client/ref.h`
- `Quake-2-master/ref_gl/gl_warp.c`
- `Quake-2-master/ref_gl/gl_rmain.c`
- `Quake-2-master/qcommon/q_shared.h`

Assets et installation locale :

- source originale : [Quake-2-master](C:\a\Projets\Quake-2\Quake-2-master)
- installation originale : [Quake 2](<C:\a\Projets\Quake-2\Quake 2>)

## 3. Etat actuel

## Deja en place

- les surfaces BSP marquees `SURF_SKY` sont identifiees par le parseur de map ;
- le builder de surfaces saute deja ces faces par defaut ;
- le client connait deja une partie des configstrings, y compris la famille `CS_SKY`.

## Etat apres portage

- l'etat client du ciel est porte depuis `CS_SKY`, `CS_SKYROTATE` et `CS_SKYAXIS` ;
- un snapshot de ciel explicite traverse maintenant le bridge runtime -> renderer ;
- les ressources `env/` sont resolues et decodees depuis les assets Quake II ;
- un renderer de ciel dedie est branche dans `renderer-three` et dans `apps/web`.

## Ecarts encore assumes

- le renderer web affiche actuellement une skybox complete quand un ciel est actif, alors que le renderer original calcule d'abord les portions visibles via les surfaces `SURF_SKY` et `R_DrawSkyBox` ;
- l'ordre de preference des assets est fixe a `TGA` puis `PCX` dans le backend web, alors que le renderer original choisit `PCX` ou `TGA` selon les capacites renderer (`qglColorTableEXT`, `gl_ext_palettedtexture`) ;
- les details historiques de `gl_skymip`, `sky_min`, `sky_max` et du clipping fin par face ne sont pas reproduits a l'identique ;
- la verification finale reste pour l'instant couverte par harnais et integration web locale, pas par comparaison pixel-perfect avec le renderer OpenGL original.

## 4. Resultat cible

Quand ce plan sera termine :

- le client local disposera d'un etat de ciel fidele aux configstrings originales ;
- les surfaces `SURF_SKY` ne seront pas rendues comme de la geometrie opaque normale ;
- le renderer affichera un ciel dedie correspondant au set de textures demande ;
- la rotation et l'axe du ciel suivront les parametres originaux ;
- le bridge runtime -> rendu exposera explicitement les donnees de ciel.

## 5. Phases

## Phase 1 - Verifier et completer la lecture client

### But

S'assurer que les configstrings de ciel sont bien lues, stockees et exposees de maniere exploitable.

### A faire

- [x] verifier le port de `CS_SKY`
- [x] verifier le port de `CS_SKYROTATE`
- [x] verifier le port de `CS_SKYAXIS`
- [x] completer les structures client si un champ manque pour stocker l'etat du ciel
- [x] verifier la mise a jour de cet etat lors d'un changement de map

### Verification attendue

- [x] test ou harnais qui charge une map et confirme les valeurs de ciel lues depuis les configstrings

## Phase 2 - Poser le contrat de bridge du ciel

### But

Introduire un contrat explicite entre runtime client et backend de rendu.

### A faire

- [x] definir un type partage pour decrire le ciel actif
- [x] exposer depuis le client un snapshot de ciel :
  - nom
  - rotation
  - axe
- [x] brancher ce snapshot dans `renderer-common`
- [x] rendre le contrat optionnel quand aucune map ou aucun ciel n'est charge

### Verification attendue

- [x] test unitaire du snapshot de ciel
- [x] verification de non-regression sur le snapshot global rendu au web app

## Phase 3 - Identifier et charger les ressources de ciel

### But

Retrouver le mode de resolution des textures de ciel a partir des assets Quake II originaux.

### A faire

- [x] identifier dans l'installation originale l'emplacement exact des textures de ciel
- [x] verifier la convention de nommage des 6 faces du ciel
- [x] porter ou completer le chargeur de ressources necessaire
- [x] definir une representation canonique des 6 faces cote runtime
- [x] prevoir le cas d'absence ou d'echec de chargement sans casser le rendu

### Verification attendue

- [x] harnais de chargement d'un set de ciel depuis les assets locaux

## Phase 4 - Implementer le renderer de ciel dans `renderer-three`

### But

Rendre le ciel dans le backend Three.js, de maniere separee du BSP standard.

### A faire

- [x] creer un adaptateur de scene pour le ciel
- [x] instancier un skybox ou equivalent adapte au pipeline `Three.js`
- [x] brancher les 6 textures du ciel sur cette geometrie dediee
- [x] appliquer rotation et axe du ciel selon les donnees client
- [x] garantir la compatibilite `WebGPU` et fallback `WebGL`

### Verification attendue

- [x] affichage correct d'un ciel sur une map Quake II disposant d'un sky set
- [x] verification visuelle que le ciel reste independant de la geometrie BSP

## Phase 5 - Integrer le ciel dans l'application web

### But

Brancher le tout dans `apps/web` sans casser le reste du pipeline courant.

### A faire

- [x] injecter le snapshot de ciel dans le cycle de refresh du renderer
- [x] gerer le changement de map et le remplacement du ciel courant
- [x] verifier que le ciel coexiste correctement avec le mode ghost, le changement instantane de niveau et le debug overlay
- [x] verifier que l'absence de ciel ne casse pas la scene

### Verification attendue

- [x] test manuel sur plusieurs maps
- [x] verification de non-regression du chargement de scene

## Phase 6 - Fidelite et nettoyage

### But

Verifier l'alignement avec le comportement original et documenter les ecarts restants.

### A faire

- [x] comparer le comportement obtenu avec le code original de reference
- [x] documenter les ecarts assumes s'il en reste
- [x] mettre a jour `PLAN_QUAKE2JS.md`
- [x] mettre a jour `PORTAGE_QUAKE2.md` pour les fichiers effectivement portes ou enrichis

## 6. Risques et points d'attention

- ne pas rendre les faces `SURF_SKY` comme une simple matiere BSP ;
- ne pas inventer un systeme de ciel decoratif non relie aux configstrings originales ;
- bien separer :
  - logique client
  - resolution des assets
  - bridge de rendu
  - implementation Three.js

## 7. Ordre recommande

Ordre de mise en oeuvre conseille :

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5
6. Phase 6
