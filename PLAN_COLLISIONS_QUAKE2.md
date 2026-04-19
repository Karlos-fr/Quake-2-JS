# PLAN_COLLISIONS_QUAKE2.md

# Quake2JS - Plan de mise en oeuvre collisions

## 1. Objectif

Rendre la gestion des collisions fidele a Quake II original pour :

- le monde BSP statique ;
- les sous-modeles BSP mobiles ;
- les portes, portes rotatives et plateformes ;
- les pushers et les entites poussees ;
- les triggers relies aux mouvements de brush models ;
- la prediction locale web qui doit consommer la meme logique de collision.

Le code source original reste le referentiel principal :

- `Quake-2-master/qcommon/cmodel.c`
- `Quake-2-master/qcommon/pmove.c`
- `Quake-2-master/game/g_phys.c`
- `Quake-2-master/game/g_func.c`
- `Quake-2-master/game/g_utils.c`
- `Quake-2-master/game/game.h`

## 2. Etat actuel

## Deja en place

- `CM_PointContents`
- `CM_BoxTrace`
- world model et submodels BSP de base
- hooks `trace` / `pointcontents` pour `pmove`
- premier port des portes, portes rotatives et platforms dans `g_func`
- premier tick pusher dans `g_phys`
- premier dispatch des triggers dans `touch.ts`

## Limites connues

- `SV_Push` n'est plus simplifie dans son noyau principal et la couverture portes/plats de reference est maintenant posee, mais des cas gameplay plus larges restent encore a etendre
- `SV_TestEntityPosition`, `SV_Impact` et `SV_PushEntity` sont maintenant portes
- `linkentity`, `unlinkentity`, `BoxEdicts` et les principaux champs spatiaux runtime sont maintenant poses
- `G_TouchTriggers` / `G_TouchSolids` sont maintenant portes

## 3. Resultat cible

Quand ce plan sera termine :

- une porte lineaire ou rotative utilisera sa collision transformee courante ;
- un pusher pourra pousser, bloquer et rollback comme dans Quake II ;
- les entites transportees par une plateforme suivront son mouvement ;
- les collisions et triggers gameplay seront pilotes par un vrai linkage spatial runtime ;
- la prediction locale web utilisera la meme collision mobile que le runtime gameplay ;
- le comportement d'ouverture / fermeture / blocage des portes sera ISO au code original.

## 4. Phases

## Phase 1 - Completer la collision partagee `qcommon`

### But

Porter la partie strictement necessaire de `cmodel.c` pour tracer contre un sous-modele BSP avec translation et rotation.

### A faire

- [x] porter `CM_TransformedPointContents`
- [x] porter `CM_TransformedBoxTrace`
- [x] porter les utilitaires de transformation associes :
  - transformation monde -> espace local du modele
  - rotation inverse pour les modeles tournes
  - retransformation de `trace.endpos`
  - retransformation du plan touche
- [x] verifier completement le comportement sur :
  - sous-modele translate
  - sous-modele rotate autour de son origin
  - trace startsolid / allsolid
  - point contents sur porte lineaire et rotative

### Verification attendue

- [x] harnais dedie `scripts/verify/quake2-collision-phase1.ts`
- [x] comparaison de traces contre cas simples prepares depuis `base2`

## Phase 2 - Introduire le vrai etat spatial runtime

### But

Donner au runtime gameplay les champs minimums que Quake II utilise dans `game.h` et `g_phys.c`.

### A faire

- [x] enrichir `GameEntity` avec :
  - `absmin`
  - `absmax`
  - `clipmask`
  - `groundentity`
  - `groundentity_linkcount`
  - `areanum`
  - `areanum2`
  - un etat de lien spatial minimal
- [x] definir le calcul canonique de :
  - bounds relatives
  - bounds absolues
  - taille
  - origine courante du modele
- [x] separer plus completement :
  - entites BSP inline models
  - triggers runtime
  - entites boites dynamiques

### Verification attendue

- [x] tests unitaires sur les bounds absolues apres changement de `origin`, `mins`, `maxs`

## Phase 3 - Porter `linkentity`, `unlinkentity` et `BoxEdicts`

### But

Remplacer les overlaps ad hoc par une base runtime proche du moteur original.

### A faire

- [x] creer un equivalent runtime de `linkentity`
- [x] creer un equivalent runtime de `unlinkentity`
- [x] calculer `absmin` / `absmax` lors du link
- [x] introduire un premier index spatial simple compatible avec le runtime actuel
- [x] creer un equivalent runtime de `BoxEdicts`
- [x] faire passer la recherche des triggers et des entites touchees par cette couche

### Notes

- cette phase n'a pas besoin de reproduire l'arbre de zones historique a l'identique des le depart ;
- en revanche l'API et le comportement visible doivent rester compatibles avec le code Quake II.

### Verification attendue

- [x] harnais de requetes `BoxEdicts` sur portes et triggers

## Phase 4 - Porter `SV_TestEntityPosition`, `SV_Impact` et `SV_PushEntity`

### But

Reconstituer le noyau de collision gameplay utilise par `g_phys.c`.

### A faire

- [x] porter `SV_TestEntityPosition`
- [x] brancher `clipmask` et les masques de contenu originaux
- [x] porter `SV_Impact`
- [x] porter `SV_PushEntity`
- [x] appeler `G_TouchTriggers` ou son equivalent runtime au bon moment
- [x] gerer le retry si l'entite touchee disparait apres impact, comme dans l'original

### Verification attendue

- [x] collision simple d'une boite dynamique contre monde BSP
- [x] collision d'une boite dynamique contre porte en mouvement
- [x] appel correct des callbacks `touch`

## Phase 5 - Finaliser `SV_Push`

### But

Obtenir un vrai comportement ISO des pushers.

### A faire

- [x] porter le clamp du mouvement au 1/8 d'unite
- [x] porter le calcul de bbox finale du pusher
- [x] sauvegarder les entites poussees dans une structure `pushed`
- [x] deplacer les entites transportees par le pusher
- [x] porter la compensation de rotation pour les pushers angulaires
- [x] tester les entites overlappees dans la position finale
- [x] porter le rollback complet si une entite bloque
- [x] memoriser `obstacle` comme dans l'original
- [x] appeler la callback `blocked`
- [x] declencher les touches de triggers en fin de push reussi

### Verification attendue

- [ ] une porte qui pousse le joueur
- [ ] une porte qui s'arrete ou reinverse selon `door_blocked`
- [ ] une plateforme qui transporte correctement
- [ ] une porte rotative qui deplace correctement une entite embarquee
- [x] harnais dedie `scripts/verify/quake2-collision-phase5.ts` :
  - clamp au 1/8
  - transport lineaire
  - compensation angulaire
  - rollback
  - callback `blocked`
  - touch triggers en fin de push reussi

## Phase 6 - Rebrancher les portes et plateformes sur la chaine collision complete

### But

Faire en sorte que `g_func` repose sur la vraie physique pusher et non sur des approximations runtime.

### A faire

- [x] verifier `door_blocked` avec une vraie entite obstacle
- [x] verifier `plat_blocked` avec une vraie entite obstacle
- [x] verifier les triggers de porte equipes de `Touch_DoorTrigger`
- [x] verifier `plat_spawn_inside_trigger` avec linkage runtime reel
- [x] valider le comportement des teams de portes
- [x] valider les portes rotatives avec collision transformee

### Verification attendue

- [x] scenario `base1` :
  - spawn
  - porte
  - ouverture
  - fermeture
  - blocage
- [x] scenario `base2` :
  - porte lineaire
  - porte rotative
- [x] harnais map reel `scripts/verify/quake2-door-phase6.ts`

## Phase 7 - Refaire le dispatch des triggers sur le modele Quake II

### But

Sortir du `touch.ts` simplifie pour converger vers le comportement moteur original.

### A faire

- [x] remplacer l'overlap AABB direct par une recherche via `BoxEdicts`
- [x] distinguer clairement :
  - `SOLID_TRIGGER`
  - `SOLID_BSP`
  - autres solides gameplay
- [x] verifier les cooldowns de touch
- [x] verifier les activations de triggers par joueur / monstre
- [x] verifier les triggers relies aux plateformes

### Verification attendue

- [x] meme resultat fonctionnel qu'aujourd'hui sur les cartes deja testees, mais avec la nouvelle couche runtime
- [x] harnais dedie `scripts/verify/quake2-collision-phase7.ts`

## Phase 8 - Raccorder la prediction locale web a la collision mobile

### But

Faire consommer a la demo web la meme collision que le runtime gameplay pour les brush models mobiles.

### A faire

- [x] remplacer l'adaptateur local statique par des traces contre sous-modeles transformes
- [x] brancher `CM_TransformedBoxTrace` pour les inline models mobiles
- [x] brancher `CM_TransformedPointContents`
- [x] conserver `PM_SPECTATOR` pour le mode Ghost sans casser la collision normale
- [x] verifier la coherence :
  - rendu porte
  - collision porte
  - camera
  - sol mobile

### Verification attendue

- [x] plus de desynchronisation visible entre rendu et collision des portes
- [x] harnais dedie `scripts/verify/quake2-collision-phase8.ts`

## Phase 9 - Couverture et harnais de verification

### But

Stabiliser la progression sans regressions silencieuses.

### A faire

- [x] creer un harnais par phase collision
- [x] ajouter des cas specifiques :
  - trace monde statique
  - trace sous-modele translate
  - trace sous-modele rotate
  - `SV_TestEntityPosition`
  - `SV_PushEntity`
  - `SV_Push`
  - porte lineaire
  - porte rotative
  - plateforme
  - trigger de porte
- [x] journaliser les ecarts de comportement runtime
- [x] mettre a jour `PORTAGE_QUAKE2.md` au fur et a mesure

## 5. Priorites recommandees

Ordre strict recommande pour reprendre le travail :

1. `CM_TransformedPointContents`
2. `CM_TransformedBoxTrace`
3. champs runtime spatiaux
4. `linkentity` / `BoxEdicts`
5. `SV_TestEntityPosition`
6. `SV_Impact`
7. `SV_PushEntity`
8. `SV_Push`
9. rebranchement portes / plats
10. rebranchement web

## 6. Risques et points de vigilance

- Ne pas corriger la physique des portes uniquement dans `apps/web`.
- Ne pas contourner `SV_Push` par des bidouilles de rendu.
- Ne pas figer les collisions des sous-modeles mobiles dans leur pose BSP compilee.
- Ne pas garder le dispatch de triggers simplifie plus longtemps que necessaire une fois `BoxEdicts` disponible.
- Ne pas casser les conventions de noms et headers definies dans `README.md`.

## 7. Definition de termine

La partie collisions pourra etre consideree comme correctement portee pour les portes si :

- une porte lineaire s'ouvre et se ferme avec collision mobile correcte ;
- une porte rotative collide dans sa pose courante ;
- un pusher bloque peut rollback comme dans Quake II ;
- une plateforme transporte correctement une entite ;
- les triggers de portes et plateformes passent par la nouvelle couche spatiale ;
- la prediction locale web suit cette meme logique sans divergence visible.
