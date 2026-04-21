# PLAN_REMISE_A_NIVEAU_PORTAGE.md

# Quake2JS - Audit complet de conformite et plan de remise a niveau

## 1. Objet

Ce document remplace l'ancien plan de remise a niveau.

Il a ete reconstruit a partir :

- des regles actuellement presentes dans [README.md](C:\a\Projets\Quake-2\README.md) ;
- du code effectivement porte dans `packages/*` et `apps/web/*` ;
- du referentiel [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md) ;
- des harnais presents dans `scripts/verify` et `packages/tests-golden`.

Le but n'est pas de relancer un portage fonctionnel "qui marche a peu pres".
Le but est de remettre le depot en conformite avec les regles d'architecture, de tracabilite et de verification deja actees.

## 2. Methode d'audit

L'audit a verifie toutes les familles de regles du `README` :

- emplacement du portage principal par package ;
- direction des dependances runtime -> adapter ;
- rattachement source `C/H -> TS principal` ;
- dispersion des headers mixtes ;
- presence de code source dans des adapters ;
- usage de stubs generes ;
- statut des fichiers `🟠` et `✅` ;
- coherence entre code et [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md) ;
- presence de validations ciblees pour les blocs `Strict` importants ;
- conformite des headers de fichiers ;
- discipline sur les globals, constantes et contrats runtime.

Le perimetre relu est :

- `apps/web`
- `packages/client`
- `packages/filesystem`
- `packages/formats`
- `packages/game`
- `packages/math`
- `packages/memory`
- `packages/platform`
- `packages/qcommon`
- `packages/renderer-common`
- `packages/renderer-three`
- `packages/server`
- `packages/shared`
- `packages/tests-golden`
- `scripts/verify`

## 3. Diagnostic global

## 3.1 Blocs globalement conformes ou proches de la cible

Les groupes suivants sont deja relativement bien alignes avec les regles :

- `packages/formats/src/*`
  - bon decoupage par format source ;
  - bonne preservation des constantes et validations binaires ;
  - headers de fichiers globalement propres ;
  - parseurs deja defensifs sur la fidelite binaire.
- `packages/memory/src/sizebuf.ts`
- `packages/memory/src/binary-io.ts`
- `packages/qcommon/src/cmd.ts`
- `packages/qcommon/src/cvar.ts`
- `packages/qcommon/src/common.ts`
- `packages/qcommon/src/collision.ts`
- `packages/qcommon/src/pmove.ts`
- `packages/game/src/g_func.ts`
- `packages/game/src/g_trigger.ts`
- `packages/game/src/g_utils.ts`
- `packages/game/src/g_phys.ts`
- `packages/game/src/p_weapon.ts`
- `packages/client/src/input.ts`
- `packages/client/src/monster-flash.ts`

Ces blocs ne sont pas tous termines, mais ils respectent deja assez bien :

- le principe de fichier principal identifiable ;
- le fait de rester dans les packages runtime ;
- la separation d'avec les adapters ;
- l'usage de noms proches du source.

## 3.2 Ecarts moderes mais recuperables

Les blocs suivants restent recuperables sans refonte majeure, a condition d'expliciter un rattachement principal et de nettoyer leurs dependances :

- `packages/client/src/main.ts`
  - principal plausible pour `client/cl_main.c`, mais trop entoure de sous-fichiers lateraux.
- `packages/client/src/parse.ts`
  - principal plausible pour `client/cl_parse.c`, mais couvre aussi des morceaux de `cl_fx.c`, `cl_tent.c`, `cl_inv.c`.
- `packages/client/src/types.ts`
  - principal plausible pour `client/client.h`, mais le header reste encore eparpille.
- `packages/client/src/screen.ts`
  - principal plausible pour `client/cl_scrn.c` et `client/screen.h`, mais avec dependance vers `renderer-common`.
- `packages/game/src/g_items.ts`
  - principal plausible pour `game/g_items.c`, mais encore cite avec `apps/web` dans le referentiel.
- `packages/game/src/g_combat.ts`
  - principal plausible pour `game/g_combat.c`, mais encore tres incomplet et mal borne dans le suivi.
- `packages/game/src/runtime.ts`
  - utile comme support runtime ;
  - mais absorbe aujourd'hui des morceaux de `game/game.h` et `game/g_local.h` sans cible declarative clairement separee.
- `packages/qcommon/src/q-shared.ts`
  - bon candidat principal pour `game/q_shared.h` ;
  - mais la fermeture du header et son suivi restent incomplets.

## 3.3 Ecarts importants et repetes

### A. Comportement source encore ancre dans des adapters

Les fichiers suivants portent encore trop de logique source ou de decisions de portage principal :

- `apps/web/src/local-client-controller.ts`
  - prediction locale ;
  - bootstrap gameplay ;
  - hooks d'armes ;
  - layouts HUD locaux ;
  - creation de collision adapter ;
  - orchestration de vue et de tir ;
  - trop de responsabilites runtime et gameplay dans un adapter web.
- `apps/web/src/main.ts`
  - contient encore du branchement de pipeline de jeu et de rendu qui depasse le simple bootstrap web.
- `packages/renderer-three/src/refresh-entity-sync.ts`
  - couche renderer acceptable pour du `ref_gl/*` ;
  - mais encore cite comme cible de `client/cl_ents.c` et `client/cl_view.c`, ce qui reste problematique.
- `packages/renderer-three/src/sky-scene-adapter.ts`
  - header explicite `Source: Quake II original / ref_gl/gl_warp.c` ;
  - est acceptable comme cible principale de `ref_gl/gl_warp.c` avec la nouvelle lecture du `README` ;
  - doit en revanche rester strictement bornee au perimetre renderer.
- `packages/renderer-three/src/quake-sky-resolver.ts`
- `packages/renderer-three/src/md2-mesh-builder.ts`
- `packages/renderer-common/src/sky.ts`
- `packages/renderer-common/src/hud-draw.ts`
- `packages/renderer-common/src/hud-resources.ts`
  - ces fichiers sont legitimes comme couches renderer ou contrats ;
  - ils ne sont problematiques que lorsqu'ils deviennent cibles principales de fichiers source hors perimetre renderer.

### B. Dependances runtime -> adapter encore presentes

Les fichiers runtime suivants importent explicitement des modules de `renderer-common`, ce qui viole la regle de dependance :

- `packages/client/src/screen.ts`
- `packages/client/src/sky.ts`
- `packages/client/src/index.ts`

Constat :

- le client runtime depend encore de contrats places dans un package d'adaptation ;
- il faut re-internaliser ces contrats cote runtime ou creer un vrai package runtime partage, puis laisser les adapters les consommer.

### C. Fichiers source originaux sans cible principale suffisamment claire

Les fichiers suivants restent trop disperses dans le code et dans le referentiel :

- `client/cl_ents.c`
- `client/cl_fx.c`
- `client/cl_tent.c`
- `client/cl_main.c`
- `client/cl_parse.c`
- `client/cl_view.c`
- `client/cl_pred.c`
- `client/cl_inv.c`
- `client/console.c`
- `client/client.h`
- `client/screen.h`
- `client/ref.h`
- `game/g_local.h`
- `game/game.h`
- `game/g_combat.c`
- `qcommon/qcommon.h`
Problemes observes :

- listes de cibles trop longues ;
- melange entre cible principale, sous-modules et adapters consommateurs ;
- headers mixtes encore absorbes par des fichiers runtime generalistes ;
- utilisation de `index.ts` comme cible de rattachement secondaire alors qu'il ne devrait etre qu'un point d'export.

### D. Ports `✅` encore contestables au regard des nouvelles regles

Les lignes suivantes ne sont plus totalement credibles avec la definition actuelle du `README` :

- `client/cl_scrn.c`
  - marque `✅` ;
  - mais le portage principal expose encore des types venant de `renderer-common` ;
  - le referentiel liste des adapters comme cibles alors que la ligne est fermee.
- `game/m_flash.c`
  - ferme et globalement correct ;
  - mais la cible principale n'est pas encore la premiere la plus evidente dans tous les raisonnements de suivi.

Le point le plus important reste `cl_scrn.c`, qui doit etre reevalue avant de rester `✅`.

### E. Headers mixtes encore mal traites

Les cas les plus fragiles sont :

- `game/g_local.h`
  - pieces portees dans `packages/game/src/runtime.ts`, `g_items.ts`, `index.ts` ;
  - cible principale non stabilisee ;
  - presence de `generated/ts-stubs/game/g_local.ts` dans le referentiel.
- `qcommon/qcommon.h`
  - pieces reelles dans `packages/memory/src/sizebuf.ts`, `binary-io.ts`, `packages/qcommon/src/messages.ts` ;
  - stub genere encore cite comme cible.
- `client/client.h`
  - reparti entre `types.ts` et `parse.ts` ;
  - l'axe principal `types.ts` existe mais n'est pas assez fort dans le suivi.
- `client/screen.h`
  - proche de `screen.ts`, mais encore incomplet sur les declarations de loop/cinematic.
- `client/ref.h`
  - toujours non ferme ;
  - risque de dispersion durable entre `client`, `renderer-common` et `renderer-three`.

### F. Stubs generes encore trop presents dans le dispositif de suivi

Constat :

- `generated/ts-stubs/game/g_local.ts` est encore mentionne dans [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md) comme cible ;
- `generated/ts-stubs/qcommon/qcommon.ts` idem ;
- les stubs sont utiles comme outil ;
- ils ne doivent pas rester des cibles architecturales visibles d'un port en cours.

### G. Couverture de verification encore tres heterogene

La couverture de verification est bonne sur :

- collision / BSP / portes ;
- sky ;
- entites visibles ;
- une partie du HUD ;
- quelques aspects alias models.

En revanche, elle reste faible ou absente de maniere explicite sur :

- `qcommon/cmd.c`
- `qcommon/cvar.c`
- `qcommon/common.c`
- `qcommon/files.c`
- `client/cl_input.c`
- `client/cl_main.c`
- `client/client.h`
- `client/screen.h`
- `game/g_items.c`
- `game/g_combat.c`
- `game/g_local.h`
- `game/game.h`
- `qcommon/qcommon.h`
- `game/q_shared.h`

Ces blocs sont partiellement portes ou structures, mais sans harnais cible clairement rattache dans le dispositif courant.

### H. Quelques ecarts documentaires residuels

Les fichiers suivants n'utilisent pas encore un vrai header de fichier au format standard :

- `packages/platform/src/index.ts`
- `packages/server/src/index.ts`
- `packages/shared/src/index.ts`

Ce sont des ecarts mineurs, mais ils restent des ecarts au `README`.

## 4. Diagnostic par famille de regles

## 4.1 Regles respectees

- Le portage principal est majoritairement dans les packages runtime.
- Les parseurs binaires restent bien separes des adapters web.
- Les noms des fonctions portees restent globalement proches du source.
- Les constantes source importantes sont bien conservees dans `q-shared.ts`, `runtime.ts`, `bsp.ts`, `screen.ts`, `effects.ts`, `tent.ts`.
- Les valeurs binaires et validations de formats sont deja bien traitees dans `packages/formats`.
- Le depot dispose deja d'un vrai socle de harnais de verification ciblee.

## 4.2 Regles partiellement respectees

- `1 fichier source -> 1 fichier principal TS` :
  - vrai sur plusieurs blocs ;
  - faux ou trop flou sur les gros ports client et headers mixtes.
- `PORTAGE_QUAKE2.md` comme referentiel architectural :
  - l'intention existe ;
  - mais beaucoup de lignes melangent principal, sous-fichiers, adapters et harnais.
- `✅` reserve aux fichiers reellement fermes :
  - correct pour certains petits fichiers ;
  - discutable pour `client/cl_scrn.c`.
- validation minimale des blocs `Strict` :
  - bien couverte sur certains sous-systemes ;
  - insuffisante ou implicite sur plusieurs blocs fondateurs.

## 4.3 Regles non respectees

- absence de dependance runtime -> adapter :
  - violes dans `packages/client/src/screen.ts`, `sky.ts`, `index.ts`.
- pas de comportement source principal dans les adapters :
  - viole dans `apps/web/src/local-client-controller.ts` ;
  - ne concerne plus globalement le cas `ref_gl/*` dans `renderer-common` / `renderer-three`, des lors que le perimetre renderer est explicite.
- headers mixtes avec point principal explicite :
  - pas encore vrai pour `g_local.h`, `qcommon.h`, `ref.h`.
- stubs temporaires clairement balises et non architecturaux :
  - encore faux dans le referentiel courant.

## 5. Fichiers prioritaires de remise a niveau

Priorite maximale :

1. `apps/web/src/local-client-controller.ts`
2. `packages/client/src/screen.ts`
3. `packages/client/src/sky.ts`
4. `packages/client/src/index.ts`
5. `packages/renderer-three/src/sky-scene-adapter.ts`
6. `client/cl_scrn.c` dans [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md)
7. `client/cl_view.c`
8. `client/cl_pred.c`
9. `client/cl_ents.c`
10. `client/cl_fx.c`
11. `client/cl_tent.c`
12. `game/g_local.h`
13. `qcommon/qcommon.h`
14. `client/ref.h`

Priorite forte mais apres stabilisation architecturale :

- `client/cl_main.c`
- `client/cl_parse.c`
- `client/cl_inv.c`
- `client/console.c`
- `game/g_items.c`
- `game/g_combat.c`
- `game/game.h`
- `game/q_shared.h`
- `ref_gl/gl_warp.c`
- `ref_gl/gl_mesh.c`
- `ref_gl/gl_rmain.c`
- `ref_gl/gl_image.c`

## 6. Plan de remise a niveau

## Phase 0 - Geler l'interpretation operative des regles

- [x] confirmer que la definition actuelle de `✅` du `README` est la definition de reference pour le depot
- [x] confirmer qu'un adapter web ou plateforme ne peut pas etre la cible principale d'un fichier source original
- [x] confirmer que `renderer-common` et `renderer-three` peuvent etre des cibles principales legitimes pour `ref_gl/*`
- [x] confirmer que `index.ts` ne compte pas comme cible principale de portage sauf cas explicitement documente
- [x] confirmer qu'un stub genere ne doit plus apparaitre comme cible architecturale dans [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md)

Sortie attendue :

- plus aucun doute de cadrage avant de toucher au referentiel ou au code.

Statut :

- Phase 0 consideree comme realisee sur la base des clarifications integrees dans [README.md](C:\a\Projets\Quake-2\README.md).
- Les confirmations de cadrage sont maintenant suffisamment stables pour demarrer directement la phase 1 sur le referentiel [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md).

## Phase 1 - Reparer le referentiel [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md)

- [ ] reclasser chaque ligne actuellement `🟠` ou `✅` selon :
  - [x] conforme
  - [x] conforme mais a clarifier
  - [x] non conforme au `README`
- [x] supprimer des colonnes `Cible` les stubs generes comme cibles architecturales
- [x] faire commencer chaque `Cible` par le vrai fichier principal de rattachement
- [x] separer dans les descriptions :
  - [x] portage principal
  - [x] sous-fichiers extraits
  - [x] adapters consommateurs
  - [x] harnais de verification
- [x] reevaluer toutes les lignes `✅` a la lumiere de la nouvelle definition
- [ ] traiter en priorite :
  - [x] `client/cl_scrn.c`
  - [x] `client/cl_view.c`
  - [x] `client/cl_pred.c`
  - [x] `client/cl_ents.c`
  - [x] `client/cl_fx.c`
  - [x] `client/cl_tent.c`
  - [x] `client/client.h`
  - [x] `client/screen.h`
  - [x] `client/ref.h`
  - [x] `game/g_local.h`
  - [x] `game/game.h`
  - [x] `qcommon/qcommon.h`

Statut :

- Les premieres lignes prioritaires du referentiel ont ete requalifiees pour rendre explicites :
  - la cible principale ;
  - les sous-fichiers extraits ;
  - le fait que les adapters web ne sont plus listés comme cibles principales ;
  - le retrait des stubs generes comme cibles architecturales.
- Les lignes `🟠` deja renseignees dans le tableau ont maintenant ete nettoyees au meme format editorial :
  - rattachement principal explicite quand il est etabli ;
  - distinction entre portage principal, supports, consommateurs et harnais ;
  - absence de cible artificielle quand le rattachement principal n'est pas encore prouve.
- La relecture des lignes `✅` a deja conduit a une nouvelle retrogradation explicite :
  - `game/p_weapon.c` est revenu en `🟠` car son port reste encore branche sur des hooks gameplay/monde non totalement refermes.
- Les lignes encore en `✅` ont ete relues et normalisees au meme format editorial que le reste du referentiel.
- Une premiere vague de lignes vides a aussi ete classee explicitement hors perimetre :
  - documentation et fichiers historiques de release ;
  - sauvegardes/configuration locale ;
  - projets IDE / fichiers de build historiques ;
  - couches plateformes natives `irix`, `linux`, `null`, `rhapsody`, `solaris`, `win32`, `unix`.
- La phase 1 reste ouverte tant que le reste des lignes `🟠` et `✅` n'a pas recu le meme niveau de nettoyage editorial.

## Phase 2 - Supprimer les dependances runtime -> adapter

- [x] sortir de `packages/client/src/screen.ts` tous les types venant de `renderer-common`
- [x] sortir de `packages/client/src/sky.ts` le type `QuakeSkySnapshot` venant de `renderer-common`
- [x] cesser de re-exporter depuis `packages/client/src/index.ts` des types provenant de `renderer-common`
- [x] recreer cote runtime client les contrats de HUD et de sky necessaires
- [x] laisser `renderer-common` consommer ces contrats runtime au lieu de les definir pour le client

Statut :

- Les contrats HUD et sky ont ete recrees dans `packages/client/src/render-contracts.ts`.
- `screen.ts`, `sky.ts` et `index.ts` ne dependent plus de `renderer-common`.
- `renderer-common` consomme maintenant ces types runtime au lieu de les definir pour le client.
- `npm run typecheck` passe apres la bascule.

Definition de termine :

- aucun fichier de `packages/client`, `packages/game`, `packages/qcommon`, `packages/formats`, `packages/filesystem`, `packages/memory`, `packages/math` ne doit importer `renderer-common`, `renderer-three`, `platform` ou `apps/web`.

## Phase 3 - Extraire le comportement source encore present dans `apps/web`

### 3.1 `apps/web/src/local-client-controller.ts`

- [x] classer le contenu en quatre groupes :
  - [x] vrai adapter web
  - [x] logique client source a rapatrier
  - [x] logique gameplay source a rapatrier
  - [x] glue temporaire a eliminer
- [x] sortir :
  - [x] orchestration prediction source
  - [x] orchestration vue source
  - [x] hooks d'armes localement declares
  - [x] layouts locaux qui dupliquent du source
  - [x] morceaux de bootstrap gameplay non web-specifiques

Statut :

- Les hooks d'armes locaux, slots, inventaire bootstrap et selection d'arme ont ete extraits vers `packages/game/src/local-game-bootstrap.ts`.
- Les layouts/status bar locaux et le bootstrap HUD client ont ete extraits vers `packages/client/src/local-client-bootstrap.ts`.
- Le noyau de prediction/vue locale a commence a etre extrait vers `packages/client/src/local-loop.ts` :
  - mode de mouvement local ;
  - bootstrap de prediction au spawn ;
  - promotion de l'etat predit ;
  - clonage de `usercmd` ;
  - calcul de vue predit pour l'adapter camera.
- Une partie importante du pont gameplay local -> client runtime a aussi ete extraite vers `packages/client/src/local-gameplay-sync.ts` :
  - avance du runtime local sur `FRAMETIME` ;
  - synchronisation gameplay -> frame client ;
  - bootstrap sky local ;
  - conversion du bootstrap gameplay vers le bootstrap HUD client ;
  - mise a jour du joueur gameplay a partir de la prediction client.
- Le bootstrap du joueur gameplay local a ete recentralise dans `packages/game/src/local-game-bootstrap.ts`.
- Les helpers de bascule `STAT_LAYOUTS` ont ete centralises dans `packages/client/src/local-client-bootstrap.ts`.
- Les helpers de saisie locale et de mirroring des `kbutton_t` ont ete extraits vers `packages/client/src/local-input.ts`.
- Les helpers d'instantanes et d'interpolation des brush models mobiles ont ete extraits vers `packages/client/src/local-brush-models.ts`.
- Le bootstrap et le tick d'orchestration locale prediction/gameplay ont ete recentralises dans `packages/client/src/local-session.ts`.
- `apps/web/src/local-client-controller.ts` conserve encore :
  - le branchement de la session locale avec l'input navigateur et la camera ;
  - les handlers DOM / pointer lock et le mapping clavier navigateur ;
  - l'adaptateur camera `PerspectiveCamera` ;
  - l'adaptateur collision local vers le runtime gameplay.
- La phase 3.1 est consideree comme close :
  - le calcul de vue reste cote runtime ;
  - l'application a `PerspectiveCamera` reste volontairement cote adapter web.

### 3.2 `apps/web/src/main.ts`

- [x] laisser seulement :
  - [x] bootstrap navigateur
  - [x] choix de map
  - [x] wire renderer
  - [x] wire input DOM
  - [x] wire HUD renderer
- [x] deplacer tout ce qui releve encore d'un comportement source ou d'une decision runtime stable

Statut :

- La coquille DOM, les widgets HUD/FPS et le panneau d'etat ont ete extraits vers `apps/web/src/web-shell.ts`.
- La couche de debug refresh Three.js a ete extraite vers `apps/web/src/refresh-debug-layer.ts`.
- Les helpers de chargement PAK/URL/map selector ont ete extraits vers `apps/web/src/web-map-bootstrap.ts`.
- Les helpers de renderer/scene/camera/sky formatting ont ete extraits vers `apps/web/src/web-render-bootstrap.ts`.
- La boucle d'animation, le resize renderer/HUD et les bindings HUD de demo ont ete extraits vers `apps/web/src/web-demo-loop.ts`.
- `apps/web/src/main.ts` agit maintenant davantage comme point de bootstrap :
  - chargement du PAK ;
  - selection de map ;
  - creation renderer/scene/camera ;
  - branchement du controleur local, du ciel, du HUD et du refresh.
- La phase 3.2 est consideree comme close :
  - `main.ts` est maintenant limite au bootstrap navigateur et au wiring des adapters web ;
  - le reliquat extrait reste explicitement borne au perimetre web/Three.js.

## Phase 4 - Recentraliser les gros ports client

### 4.1 `client/cl_ents.c`

- [x] designer clairement `packages/client/src/entities.ts` comme cible principale
- [x] faire de `parse.ts` un fournisseur de paquets seulement
- [x] laisser `refresh.ts` comme projection du resultat
- [x] retirer `apps/web` et `renderer-three` du role de cibles de portage principal

Statut :

- `packages/client/src/entities.ts` porte bien le noyau principal issu de `cl_ents.c` pour :
  - les entity events ;
  - la collecte des entity states de frame ;
  - la reconstruction des packet entity snapshots interpoles.
- `packages/client/src/parse.ts` reste le lieu de lecture des messages reseau et des deltas de frame :
  - `CL_ParseEntityBits` ;
  - `CL_ParseDelta` ;
  - `CL_ParsePlayerstate` ;
  - `CL_ParseFrame` ;
  - `CL_ParsePacketEntities` ;
  - ce rattachement est coherent avec le role de fournisseur de paquets/frame data plutot qu'avec une cible de projection refresh.
- `packages/client/src/refresh.ts` joue bien le role de projection du resultat :
  - composition de `ClientRefreshFrame` ;
  - emission des render entities, lights, particles et temp refresh ;
  - sans devenir la cible principale du port source.
- Les adapters renderer restent consommateurs :
  - `packages/renderer-three/src/refresh-entity-sync.ts` ;
  - `packages/renderer-three/src/md2-mesh-builder.ts` ;
  - aucun fichier de `apps/web` n'est plus a traiter comme cible principale pour `cl_ents.c`.

### 4.2 `client/cl_fx.c`

- [x] designer clairement `packages/client/src/effects.ts` comme cible principale
- [x] laisser dans `parse.ts` seulement la lecture de paquets
- [x] laisser dans `refresh.ts` seulement la projection renderer/audio-ready
- [x] garder `monster-flash.ts` comme sous-module justifie, non comme cible concurrente

Statut :

- `packages/client/src/effects.ts` porte bien le noyau principal issu de `cl_fx.c` pour :
  - les muzzle flashes joueur et monstre ;
  - les dynamic lights ;
  - les light styles ;
  - les particules runtime ;
  - la traduction des entity events vers sorties structurees.
- `packages/client/src/parse.ts` reste borne a la lecture des paquets source lies a `cl_fx.c` :
  - `CL_ParseMuzzleFlash` ;
  - `CL_ParseMuzzleFlash2` ;
  - ainsi que les paquets auxiliaires rediriges ensuite vers `effects.ts`.
- `packages/client/src/refresh.ts` reste du cote projection/composition :
  - `CL_RunDLights` / `CL_AddDLights` ;
  - `CL_RunLightStyles` / `CL_AddLightStyles` ;
  - `CL_AddParticles` ;
  - integration dans `ClientRefreshFrame`.
- `packages/client/src/monster-flash.ts` reste un sous-module justifie :
  - table `monster_flash_offset` ;
  - acces `getMonsterFlashOffset` ;
  - sans concurrencer `effects.ts` comme cible principale de `cl_fx.c`.

### 4.3 `client/cl_tent.c`

- [x] designer `packages/client/src/tent.ts` comme cible principale
- [x] clarifier la frontiere avec `effects.ts`
- [x] sortir du referentiel les cibles qui ne sont que consommatrices

Statut :

- `packages/client/src/tent.ts` porte bien le noyau principal issu de `cl_tent.c` pour :
  - l'etat persistant des beams, player beams, lasers, explosions, force walls et sustains ;
  - `CL_ClearTEnts`, `CL_RegisterTEntSounds`, `CL_RegisterTEntModels`, `CL_AddTEntPacket` et `CL_BuildTEntRefresh`.
- `packages/client/src/parse.ts` reste borne a la lecture des paquets temp entities :
  - `CL_ParseTEnt` ;
  - `CL_ParseParticles` ;
  - construction des `ClientTempEntityPacket` consommes ensuite par `tent.ts`.
- `packages/client/src/effects.ts` reste un module de support partage :
  - helpers reutilises par `tent.ts` ;
  - sans concurrencer `tent.ts` comme cible principale de `cl_tent.c`.
- `packages/client/src/refresh.ts` reste un consommateur de projection :
  - integration de `CL_BuildTEntRefresh` dans `ClientRefreshFrame` ;
  - sans devenir une cible principale de portage source.

### 4.4 `client/cl_view.c`

- [x] designer `packages/client/src/view.ts` comme cible principale
- [x] retirer le pilotage principal de la vue depuis `apps/web`
- [x] retirer les decisions source de `renderer-three`

Statut :

- `packages/client/src/view.ts` porte bien le noyau principal actuellement disponible pour `cl_view.c` :
  - `CL_CalcViewValues` ;
  - `CL_UpdateLerpFraction` ;
  - l'etat de vue logique consomme ensuite par le reste du client.
- `apps/web/src/local-client-controller.ts` ne pilote plus la vue au sens source :
  - il se contente d'appeler `buildLocalPredictedViewState` ;
  - puis d'appliquer le resultat a `PerspectiveCamera`.
- `packages/client/src/refresh.ts` reste consommateur de la vue logique :
  - `CL_BuildRefreshFrame` compose `view` a partir de `CL_CalcViewValues` ;
  - le view weapon qu'il ajoute reste rattache au flux refresh issu de `cl_ents.c`, pas a la cible principale de `cl_view.c`.
- `packages/renderer-three/src/refresh-entity-sync.ts` reste un adapter pur :
  - il consomme `ClientRefreshFrame` et `RF_WEAPONMODEL` ;
  - il ne decide ni le calcul de camera, ni les valeurs source de vue.

### 4.5 `client/cl_pred.c`

- [ ] designer `packages/client/src/view.ts` ou un futur `predict.ts` comme cible principale explicite
- [ ] sortir de `apps/web` la prediction source et ne laisser qu'un simple branchage de collision/input

### 4.6 `client/cl_main.c`, `client/cl_parse.c`, `client/cl_inv.c`, `client/console.c`

- [ ] confirmer pour chacun le fichier principal
- [ ] reduire les cibles secondaires au strict minimum
- [ ] lister explicitement ce qui reste non porte pour chaque ligne `🟠`

## Phase 5 - Fermer proprement les headers mixtes

### 5.1 `client/client.h`

- [ ] renforcer `packages/client/src/types.ts` comme cible principale
- [ ] ne laisser `parse.ts` qu'en consommateur de declarations

### 5.2 `client/screen.h`

- [ ] rattacher completement a `packages/client/src/screen.ts`
- [ ] isoler clairement les declarations encore manquantes

### 5.3 `client/ref.h`

- [ ] definir une vraie cible principale
- [ ] separer declarations source renderer-side et adapters Three.js

### 5.4 `game/g_local.h`

- [ ] faire emerger un vrai fichier principal de declarations gameplay
- [ ] decharger `runtime.ts` des declarations qui ne lui appartiennent pas comme support runtime
- [ ] sortir `generated/ts-stubs/game/g_local.ts` du role de cible visible

### 5.5 `game/game.h`

- [ ] clarifier la frontiere avec `g_local.h`
- [ ] identifier la vraie cible principale des declarations entites/runtime de jeu

### 5.6 `qcommon/qcommon.h`

- [ ] faire emerger une cible principale lisible
- [ ] sortir `generated/ts-stubs/qcommon/qcommon.ts` du role de cible visible

### 5.7 `game/q_shared.h`

- [ ] confirmer `packages/qcommon/src/q-shared.ts` comme cible principale
- [ ] lister explicitement les declarations encore manquantes si la ligne reste `🟠`

## Phase 6 - Borner proprement le perimetre renderer `ref_gl/*`

Constat :

- le cas `ref_gl/*` est maintenant considere comme un portage renderer legitimement rattache a une couche renderer dediee ;
- en revanche, ses frontieres avec le reste du runtime et du suivi restent encore trop floues.

Actions :

- [ ] expliciter dans [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md) que `renderer-common` / `renderer-three` sont des cibles principales autorisees pour `ref_gl/*`
- [ ] verifier que chaque ligne `ref_gl/*` commence bien par sa vraie cible principale renderer
- [ ] separer pour chaque ligne `ref_gl/*` :
  - [ ] cible principale de portage renderer
  - [ ] sous-modules renderer extraits
  - [ ] simples consommateurs
- [ ] verifier que `renderer-common` / `renderer-three` n'absorbent pas au passage du comportement source venant de `client/*`, `game/*`, `qcommon/*` ou `server/*`
- [ ] documenter plus clairement le perimetre renderer de :
  - [ ] `packages/renderer-three/src/sky-scene-adapter.ts`
  - [ ] `packages/renderer-three/src/refresh-entity-sync.ts`
  - [ ] `packages/renderer-three/src/md2-mesh-builder.ts`
  - [ ] `packages/renderer-three/src/quake-sky-resolver.ts`
  - [ ] `packages/renderer-common/src/sky.ts`

Note :

- cette phase ne vise plus a sortir `ref_gl/*` des couches renderer ;
- elle vise a rendre ce rattachement explicite, borne et non contaminant pour le reste du portage.

## Phase 7 - Normaliser les supports runtime non-source et les entry points

- [ ] documenter mieux `packages/qcommon/src/runtime.ts` comme couche d'integration et verifier qu'elle ne devienne pas un puits de portage source
- [ ] verifier que `packages/game/src/runtime.ts` reste un support runtime et non le lieu principal de plusieurs headers sans frontiere
- [ ] retirer de `packages/game/src/index.ts`, `packages/client/src/index.ts`, `packages/qcommon/src/index.ts` toute ambiguite de "cible de portage"
- [ ] mettre au format de header standard :
  - [ ] `packages/platform/src/index.ts`
  - [ ] `packages/server/src/index.ts`
  - [ ] `packages/shared/src/index.ts`

## Phase 8 - Renforcer les verifications ciblees

- [ ] ajouter un harnais explicite pour `qcommon/cmd.c`
- [ ] ajouter un harnais explicite pour `qcommon/cvar.c`
- [ ] ajouter un harnais explicite pour `qcommon/common.c`
- [ ] ajouter un harnais explicite pour `qcommon/files.c`
- [ ] ajouter un harnais explicite pour `client/cl_input.c`
- [ ] ajouter un harnais explicite pour `client/cl_main.c`
- [ ] ajouter un harnais explicite pour `client/screen.h`
- [ ] ajouter un harnais explicite ou une verification documentee pour `game/g_items.c`
- [ ] ajouter un harnais explicite ou une verification documentee pour `game/g_combat.c`
- [ ] ajouter une verification declarative/documentee pour :
  - [ ] `game/g_local.h`
  - [ ] `game/game.h`
  - [ ] `qcommon/qcommon.h`
  - [ ] `game/q_shared.h`

Definition de termine :

- chaque bloc `Strict` important porte ou partiellement porte a une verification ciblee rattachee.

## Phase 9 - Requalifier les statuts `🟠` et `✅`

- [ ] revisiter toutes les lignes `✅`
- [ ] retrograder celles qui ne respectent pas la nouvelle definition
- [ ] pour chaque ligne `🟠`, expliciter ce qui manque encore
- [ ] interdire les descriptions qui laissent croire qu'un bloc est "ferme" alors qu'un adapter reste cible principale

## 7. Ordre recommande d'execution

1. [ ] Phase 0
2. [ ] Phase 1
3. [ ] Phase 2
4. [ ] Phase 3
5. [ ] Phase 4
6. [ ] Phase 5
7. [ ] Phase 6
8. [ ] Phase 7
9. [ ] Phase 8
10. [ ] Phase 9

## 8. Definition de termine

Le depot pourra etre considere remis a niveau quand :

- tous les fichiers sources deja portes ou en cours ont une cible principale claire dans [PORTAGE_QUAKE2.md](C:\a\Projets\Quake-2\PORTAGE_QUAKE2.md) ;
- les packages runtime n'importent plus les adapters ;
- `apps/web` et `platform` ne sont plus cibles principales d'un port source original ;
- `renderer-common` et `renderer-three` ne sont cibles principales que pour le perimetre renderer `ref_gl/*`, de maniere explicite et bornee ;
- les headers mixtes critiques (`client.h`, `screen.h`, `ref.h`, `g_local.h`, `game.h`, `qcommon.h`) ont un vrai point principal de rattachement ;
- les stubs generes ne sont plus visibles comme cibles architecturales ;
- les lignes `✅` sont compatibles avec la definition du `README` ;
- chaque bloc `Strict` important porte ou deja expose a une verification ciblee.
