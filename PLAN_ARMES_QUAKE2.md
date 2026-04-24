# PLAN_ARMES_QUAKE2.md

# Quake2JS - Plan de portage des armes

## 1. Objectif

Porter le sous-systeme armes de Quake II original en blocs coherents, en preservant d'abord :

- la logique joueur des armes ;
- la logique monde des projectiles et impacts ;
- les animations d'armes ;
- les bruitages d'armes ;
- les effets clients associes ;
- les interactions avec ammo, cadence, cooldown, changement d'arme et feedback visuel.

Le portage doit rester rattache au code source original et eviter les trous fonctionnels typiques d'un portage partiel.

## 2. References source

### 2.1 Client effets et feedback

- `Quake-2-master/client/cl_fx.c`
- `Quake-2-master/client/cl_tent.c`
- `Quake-2-master/client/cl_view.c`

### 2.2 Gameplay armes joueur

- `Quake-2-master/game/p_weapon.c`
- `Quake-2-master/game/p_view.c`

### 2.3 Gameplay projectiles et armes monde

- `Quake-2-master/game/g_weapon.c`

### 2.4 Definitions communes

- `Quake-2-master/game/q_shared.h`
- `Quake-2-master/game/g_local.h`

## 3. Principes de mise en oeuvre

- Porter le bloc armes comme un sous-systeme complet, pas comme une collection de fonctions isolees.
- Commencer par verrouiller les effets clients armes pour eviter de porter la logique serveur/joueur dans un client encore troue.
- Garder separees :
  - logique joueur ;
  - logique projectiles monde ;
  - effets client ;
- rendu first-person ;
- audio.
- Ne pas melanger trop tot les adapters web dans les fichiers portes.

## 3.1 Etat constate dans le depot

Lecture du code porte au 2026-04-24 :

- `game/p_weapon.c` est porte dans `packages/game/src/p_weapon.ts`, avec les pensees d'armes, les tirs, les changements d'arme, les muzzle flashes joueur et les sons ponctuels journalises dans le runtime.
- `game/g_weapon.c` est porte dans `packages/game/src/g_weapon.ts`, avec les projectiles, impacts, explosions, radius damage, loops `s.sound` des projectiles et emission de temp entities.
- `client/cl_fx.c` et `client/cl_tent.c` sont portes dans `packages/client/src/effects.ts`, `packages/client/src/newfx.ts`, `packages/client/src/parse.ts` et `packages/client/src/tent.ts`.
- Le rendu first-person est deja branche cote client via `packages/client/src/refresh.ts`, `packages/client/src/view.ts` et `packages/client/src/local-gameplay-sync.ts`.
- `game/p_view.c` est porte dans `packages/game/src/p_view.ts` et couvre les aspects utiles aux armes, notamment `gunoffset`, `gunangles`, `kick_angles` et les loops `ent->s.sound`.
- Plusieurs harnais existent deja (`scripts/verify/quake2-p-weapon.ts`, `scripts/verify/quake2-p-view.ts`, `scripts/verify/quake2-m-flash.ts`), mais pas encore une verification complete du sous-systeme armes bout en bout.
- Les points encore ouverts concernent surtout la verification de fidelite et l'integration bout en bout du sous-systeme armes, pas le statut de portage source des fichiers principaux deja refermes dans `PORTAGE_QUAKE2.md`.

## 4. Phases

### Phase 0 [x] - Verrouiller le client effets armes

#### 0.1 `client/cl_fx.c`

- [x] porter le bloc entier

Objectif :

- finaliser tous les effets client d'armes, muzzle flashes, sons de tirs, impacts et feedbacks associes.

Points cibles :

- [x] muzzle flashes joueur
- [x] muzzle flashes monstres
- [x] sons de tir client
- [x] effets lumineux lies aux tirs
- [x] mapping complet des effets d'armes originaux
- [x] integration propre dans les evenements client deja portes

#### 0.2 `client/cl_tent.c`

- [x] porter le bloc entier

Objectif :

- finaliser la gestion des temp entities necessaires aux armes et impacts.

Points cibles :

- [x] explosions
- [x] impacts
- [x] beams
- [x] trails associes aux armes
- [x] sustains necessaires
- [x] sons des temp entities lies aux armes

Sortie attendue de la phase 0 :

- le client sait deja rendre et jouer correctement les effets d'armes attendus quand les evenements arrivent ;
- la suite du portage armes peut se concentrer sur la logique, l'integration et la verification de fidelite plutot que sur des trous de portage `cl_fx` / `cl_tent`.

### Phase 1 [x] - Fondations communes armes

- [x] verifier / completer les constantes et enums armes de `q_shared.h`
- [x] verifier / completer les structures partagees liees aux armes dans `g_local.h`
- [x] verifier l'etat des ammo, weapon indexes, muzzle flashes et event ids deja portes
- [x] verifier les index de sons et models precaches relies aux armes
- [x] verifier les hooks gameplay deja disponibles pour tirs, traces, dommages et temp entities

### Phase 2 - Portage complet de `game/p_weapon.c`

- [x] porter le bloc entier `p_weapon.c`

Objectif :

- finaliser la logique des armes du joueur.

Perimetre vise :

- [x] activation / desactivation d'armes
- [x] changement d'arme
- [x] selection d'arme
- [x] cadence de tir
- [x] consommation d'ammo
- [x] no-ammo
- [x] idle / attack / transitions
- [x] animation logique de l'arme
- [x] weapon sounds
- [x] weapon hum loops
- [x] specificites de chaque arme joueur

Point d'attention :

- garder la logique de frames, timings et transitions aussi proche que possible de l'original.

### Phase 3 - Portage complet de `game/g_weapon.c`

- [x] porter le bloc entier `g_weapon.c`

Objectif :

- finaliser la logique monde des armes et projectiles.

Perimetre vise :

- [x] projectiles
- [x] grenades
- [x] rockets
- [x] blaster shots
- [x] BFG
- [x] rail / traces si presents dans ce bloc
- [x] impacts
- [x] explosions
- [x] sons des projectiles et explosions
- [x] loops projectiles si necessaires

Point d'attention :

- s'appuyer sur la collision / trace existante sans bricolage local specifique aux armes.
- les sons one-shot monde peuvent etre fermes cote runtime avant le branchement final du backend audio navigateur.
- les degats de zone peuvent suivre `g_combat.c` partiellement tant que `T_Damage` reste explicite.
- le bloc armes peut aussi consommer un `T_Damage` partiel tant que les sous-blocs kill / AI restent explicites.
- `CheckArmor` et `CheckPowerArmor` sont maintenant portes dans `g_combat.c` et reutilisables sans hook obligatoire.
- `Killed` et `SpawnDamage` peuvent etre fermes avant les sous-blocs monster / armor complets.

### Phase 4 [x] - Portage du rendu et des animations first-person

#### 4.1 `client/cl_view.c`

- [x] etendre / finaliser le bloc necessaire aux armes

Objectif :

- finaliser l'affichage arme first-person et les aspects de vue directement relies aux armes.

Points cibles :

- [x] placement du gun model
- [x] animation de vue associee
- [x] synchronisation avec `gunframe`
- [x] FOV et mouvements perceptifs pertinents pour les armes

#### 4.2 Integration web du view model

- [x] verifier que le bridge courant sait afficher le modele d'arme first-person
- [x] brancher les animations d'armes sur les donnees client portees
- [x] verifier les skins / models de vue

Etat constate :

- `apps/web/src/local-client-controller.ts` propage maintenant aussi `cl_gun`, `gun_frame` et `gun_model` vers `CL_BuildRefreshFrame`, ce qui aligne le bridge web local sur les finalisations de `client/cl_view.c`.
- `packages/renderer-three/src/refresh-entity-sync.ts` respecte desormais `resolvedModelPath` pour les view models first-person, au lieu de forcer une resolution par `configstrings` uniquement.
- La verification ciblee `scripts/verify/quake2-web-view-weapon.ts` couvre :
  - rattachement du view model a la camera ;
  - animation par `frame` ;
  - changement de skin par `skinnum` ;
  - override de modele first-person.

### Phase 5 [~] - Portage du feedback audio armes

- [~] raccorder les sons d'armes deja portes au runtime client
- [~] verifier les loops d'armes :
  - hums
  - charge
  - spin
- [~] verifier les sons ponctuels :
  - tir
  - impact
  - reload
  - no-ammo
  - windup / winddown
- [ ] verifier les canaux et overrides conformes a Quake II

Point d'attention :

- cette phase doit suivre les regles du plan audio, mais ici seulement pour le perimetre armes.

### Phase 6 [~] - Integration gameplay complete

- [~] verifier les interactions armes / ammo / inventaire
- [~] verifier les interactions armes / HUD
- [~] verifier les interactions armes / effets clients
- [ ] verifier les interactions armes / monstres
- [ ] verifier les interactions armes / triggers et monde
- [~] verifier les interactions armes / loops `ent->s.sound`

### Phase 7 [~] - Verification de fidelite

- [~] creer des harnais de verification dedies au sous-systeme armes
- [ ] verifier les transitions d'armes
- [ ] verifier les timings de tir
- [ ] verifier la consommation d'ammo
- [ ] verifier les sons declenches
- [ ] verifier les effets clients declenches
- [ ] verifier les projectiles et impacts
- [ ] verifier les animations first-person
- [ ] verifier les cas speciaux arme par arme

## 5. Ordre de reprise recommande

1. [x] Phase 0
2. [x] Phase 1
3. [x] Phase 2
4. [x] Phase 3
5. [~] Phase 4
6. [~] Phase 5
7. [~] Phase 6
8. [~] Phase 7

## 6. Premiere sequence pratique

Sequence immediate recommandee :

1. [x] finaliser `client/cl_fx.c`
2. [x] finaliser `client/cl_tent.c`
3. [x] porter `game/p_weapon.c`
4. [x] porter `game/g_weapon.c`
5. [x] finaliser la partie armes de `client/cl_view.c`

## 7. Livrables attendus

Pour chaque phase ou bloc :

- les fichiers TS portes ou completes ;
- les commentaires de fichier / fonctions conformes au `README.md` ;
- la mise a jour de `PORTAGE_QUAKE2.md` ;
- la mise a jour de `PLAN_QUAKE2JS.md` si le plan principal bouge ;
- un ou plusieurs scripts de verification cibles si le comportement est critique.

## 8. Regle de mise a jour

Le plan doit etre mis a jour au fur et a mesure avec :

- `[x]` pour un bloc termine ;
- `[~]` pour un bloc entame ;
- un ajustement explicite si une dependance non prevue apparait.
