# PLAN_FICHIERS_FAIBLES_DEPENDANCES.md

# Quake2JS - Plan de reprise sur fichiers a faibles dependances

## 1. Objectif

Identifier et traiter en priorite les fichiers du code source original Quake II qui :

- ont peu de dependances runtime ;
- sont faciles a verifier par rapport au source ;
- permettent de fermer proprement des blocs en `✅` ;
- evitent d'ouvrir trop tot les gros chantiers client / gameplay / serveur.

Ce plan ne remplace pas les autres plans du depot.
Il sert de file de reprise pragmatique quand on veut avancer sur des blocs plus simples a stabiliser.

## 2. Principe de selection

Un fichier est retenu ici s'il remplit majoritairement ces criteres :

- responsabilite etroite ;
- peu d'effets de bord ;
- peu de couplage avec :
  - boucle client ;
  - boucle serveur ;
  - prediction ;
  - gameplay complet ;
  - backend rendu / audio ;
- verification simple par comparaison directe avec le source.

## 3. Ordre recommande

## Phase 1 - Tables et headers quasi autonomes

### 1. `game/m_flash.c`

- [x] fermer le fichier entier

Pourquoi :

- essentiellement une table de positions de muzzle flashes ;
- tres peu de logique ;
- tres peu de dependances ;
- forte tracabilite avec le source.

Cible probable :

- `packages/client/src/monster-flash.ts`

### 2. `client/anorms.h`

- [x] fermer le fichier entier

Pourquoi :

- table de directions canonique ;
- quasi aucune logique ;
- facile a comparer et figer.

Cible probable :

- `packages/qcommon/src/anorms.ts`

### 3. `ref_gl/anorms.h`

- [x] verifier si deja couvert par la meme table que `client/anorms.h`
- [x] fermer le fichier si l'equivalence source est explicite

Pourquoi :

- meme famille de donnees ;
- tres peu de risque ;
- bon candidat de cloture documentaire et technique.

Cible probable :

- `packages/qcommon/src/anorms.ts`

### 4. `qcommon/qfiles.h`

- [x] fermer les declarations restantes

Pourquoi :

- structures et constantes de formats binaires ;
- faible risque comportemental si traite comme fichier declaratif ;
- forte valeur transversale.

Cibles probables :

- `packages/formats/src/pak.ts`
- `packages/formats/src/pcx.ts`
- `packages/formats/src/wal.ts`
- `packages/formats/src/md2.ts`
- `packages/formats/src/bsp.ts`

### 5. `client/screen.h`

- [~] fermer le fichier entier

Pourquoi :

- header public relativement borne ;
- utile pour verrouiller les contrats du bloc ecran / HUD deja bien avance.

Cible probable :

- `packages/client/src/screen.ts`
- `packages/client/src/index.ts`

## Phase 2 - Blocs client encore raisonnablement contenus

### 6. `client/cl_inv.c`

- [ ] fermer le fichier entier

Pourquoi :

- vrai fichier `.c` utile ;
- perimetre plus contenu que `cl_parse.c` ou `cl_ents.c` ;
- bon candidat de reprise client sans ouvrir tout le runtime.

Cible probable :

- `packages/client/src/screen.ts`
- `packages/client/src/parse.ts`

### 7. `client/console.h`

- [ ] fermer le fichier entier

Pourquoi :

- petit header de contrat ;
- peu de dependances si traite avant ou avec `console.c`.

Cible probable :

- `packages/client/src/screen.ts`
- eventuellement `packages/client/src/console.ts` si un module dedie est cree plus tard

### 8. `client/console.c`

- [ ] fermer le fichier entier ou le sous-bloc encore manquant

Pourquoi :

- bloc encore plus autonome que les gros noyaux client ;
- utile pour finaliser certaines primitives 2D / texte / overlays.

Point d'attention :

- ne pas melanger ce portage avec des choix DOM ou UI web modernes ;
- rester rattache au pipeline d'origine.

Cible probable :

- `packages/client/src/screen.ts`

### 9. `client/ref.h`

- [ ] fermer le fichier entier ou les declarations encore manquantes

Pourquoi :

- utile pour verrouiller les contrats renderer du source original ;
- interessant pour clarifier les ponts vers `renderer-common` et `renderer-three`.

Cibles probables :

- `packages/client/src/types.ts`
- `packages/renderer-common/src/index.ts`
- `packages/renderer-three/src/index.ts`

## Phase 3 - Bloc autonome mais plus couteux

### 10. `client/cl_cin.c`

- [ ] analyser precisement
- [ ] fermer si le perimetre media est acceptable dans l'etat courant

Pourquoi :

- bloc relativement autonome sur le papier ;
- moins dangereux que `cl_parse.c` ou `cl_main.c` ;
- mais plus dependant au media et a l'audio que les autres fichiers de cette liste.

Point d'attention :

- ne pas le prendre trop tot si la couche media navigateur n'est pas prete.

## 4. Fichiers explicitement exclus de cette liste

Ces fichiers ne sont pas de bons candidats "faibles dependances" dans l'etat actuel :

- [ ] `client/cl_parse.c`
- [ ] `client/cl_ents.c`
- [ ] `client/cl_main.c`
- [ ] `client/cl_pred.c`
- [ ] `game/p_client.c`
- [ ] `game/g_combat.c`
- [ ] `game/g_monster.c`
- [ ] la plupart des `server/*.c`

Raison :

- dependances croisees trop nombreuses ;
- risque de rouvrir un chantier systemique ;
- cloture beaucoup plus difficile fichier par fichier.

## 5. Sequence pratique recommandee

1. [ ] `game/m_flash.c`
2. [ ] `client/anorms.h`
3. [ ] `ref_gl/anorms.h`
4. [ ] `qcommon/qfiles.h`
5. [ ] `client/screen.h`
6. [ ] `client/cl_inv.c`
7. [ ] `client/console.h`
8. [ ] `client/console.c`
9. [ ] `client/ref.h`
10. [ ] `client/cl_cin.c`

## 6. Livrables attendus

Pour chaque fichier ferme :

- le port TS complet ou la fermeture des declarations restantes ;
- les en-tetes de fichier / fonctions conformes au `README.md` ;
- la mise a jour de `PORTAGE_QUAKE2.md` ;
- si besoin une mise a jour de `PLAN_QUAKE2JS.md` ou du plan local associe ;
- une verification ciblee si le fichier contient une logique observable.

## 7. Definition de termine

Un fichier de cette liste peut etre considere comme termine si :

- sa correspondance source -> TS est claire ;
- il ne reste pas de trou fonctionnel significatif dans son perimetre ;
- il peut passer en `✅` dans `PORTAGE_QUAKE2.md` sans reserve forte.

## 8. Etat courant

- [x] `game/m_flash.c`
- [x] `client/anorms.h`
- [x] `ref_gl/anorms.h`
- [x] `qcommon/qfiles.h`
- [~] `client/screen.h`
