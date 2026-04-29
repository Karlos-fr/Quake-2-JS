# Phase 03 - Audit exhaustif gameplay, entites, client runtime et serveur

## Objectif

Verifier l'ensemble des fichiers qui permettent au jeu Quake II original de fonctionner en solo, sans selection partielle.

Cette phase doit couvrir tous les fichiers pertinents du perimetre gameplay/client/server/qcommon, pas seulement les fichiers les plus visibles.
Un fichier ne doit pas etre considere stable parce qu'un scenario representatif passe.

La phase 03 est la premiere phase qui peut conclure a la fidelite comportementale d'un fichier runtime.
Elle ne doit cependant le faire que lorsque le fichier a ete verifie par inventaire, comparaison source, branchement et tests/harness adaptes au risque.

## Mode d'execution LLM

Mission de la phase :

- verifier la fidelite comportementale du runtime porte ;
- prouver que le code est branche depuis les racines reelles ;
- lier chaque verdict positif a une verification ciblee.

Deroule optimal :

1. Verifier que les rattachements de phase 02 sont fermes ou explicitement bloques.
2. Creer ou completer les outils `P03-TOOL-*`.
3. Generer les index de symboles C/H et TS.
4. Construire la matrice runtime avant tout verdict ISO.
5. Auditer les racines runtime prioritaires.
6. Auditer les tables declaratives critiques.
7. Auditer fichier par fichier : inventaire, symboles, atteignabilite, tests, comparaison source.
8. Corriger les manques localises quand le comportement attendu est non ambigu.
9. Produire le rapport runtime et mettre a jour le suivi uniquement selon les verdicts autorises.

Stop conditions :

- rattachement structurel non tranche par phase 02 ;
- symbole actif sans statut ;
- code present mais non atteignable ;
- table declarative non comparee ;
- verdict positif sans test, harness, trace ou justification explicite.

Sortie de phase attendue pour le LLM suivant :

- chaque fichier runtime a un verdict ;
- chaque racine prioritaire est tracee ;
- chaque manque web ou renderer est transmis aux phases 04 ou 05 avec origine claire.

## Entrees

- `PORTAGE_QUAKE2.md`
- sorties phase 01 : table de reference et rapport de referentiel ;
- sorties phase 02 : rapport structurel, registre d'exceptions de decoupage, plan de renommage applique ;
- fichiers source originaux dans `Quake-2-master/`
- fichiers TS conformes ou exceptions documentees dans `packages/`
- tests existants dans `scripts/verify/`
- commandes npm `verify:*`

Si la phase 02 n'a pas tranche le rattachement structurel d'un fichier, la phase 03 ne doit pas lui donner un verdict ISO.

## Sous-phase 03.A - Creer les outils de couverture runtime

Avant l'audit ISO humain, creer les outils qui reduisent le risque d'oubli dans le gameplay, le serveur, le client et `qcommon`.

Entrees :

- sorties phase 02 ;
- sources C/H runtime ;
- fichiers TS runtime.

Actions :

- creer les outils `P03-TOOL-*` ;
- indexer les symboles C et TS ;
- preparer les squelettes d'audit runtime.

Sorties :

- outils dans `tools/` ;
- premiers index de symboles runtime.

Critere de fin :

- chaque fichier runtime peut recevoir une ligne dans la matrice de couverture.

Outils attendus :

- `P03-TOOL-01-c-symbol-indexer` : extracteur de symboles C/H par fichier : fonctions, structs, enums, macros, globals, tables.
- `P03-TOOL-02-ts-symbol-indexer` : extracteur de symboles TS par fichier.
- `P03-TOOL-03-symbol-parity-checker` : comparateur `symbole C -> symbole TS`.
- `P03-TOOL-04-runtime-root-extractor` : extracteur des racines runtime (`Qcommon_Frame`, `SV_Frame`, `G_RunFrame`, `CL_Frame`, `PMove`).
- `P03-TOOL-05-declarative-table-extractor` : extracteur de tables declaratives : spawn functions, items, commands, cvars, messages reseau, temp entities.
- `P03-TOOL-06-coverage-matrix-generator` : generateur de matrice de couverture `source symbol -> ts symbol -> test -> statut`.
- `P03-TOOL-07-runtime-audit-skeleton-generator` : generateur de squelettes d'inventaire/audit par fichier runtime.
- `P03-TOOL-08-callgraph-builder` : constructeur de graphe d'appels source et TS quand possible.
- `P03-TOOL-09-test-linker` : relieur `symbole/fichier -> scripts/verify` et commandes npm.
- `P03-TOOL-10-runtime-report-generator` : generateur de rapport `phase-03-runtime-coverage-report.md`.

Ces outils ne remplacent pas l'audit comportemental.
Ils garantissent seulement que la liste des choses a verifier est exhaustive.

## Sous-phase 03.B - Construire la matrice runtime

Produire une matrice de couverture runtime avant toute decision ISO.

Entrees :

- index symboles C/TS ;
- rattachements phase 02 ;
- tests existants.

Actions :

- generer la matrice `source symbol -> ts symbol -> test -> statut`.

Sorties :

- `generated/phase-03-runtime-coverage-matrix.json`

Critere de fin :

- chaque symbole actif connu a une ligne ou un finding d'extraction.

Outils de reference :

- `P03-TOOL-01-c-symbol-indexer`
- `P03-TOOL-02-ts-symbol-indexer`
- `P03-TOOL-03-symbol-parity-checker`
- `P03-TOOL-06-coverage-matrix-generator`
- `P03-TOOL-09-test-linker`

Sortie attendue :

- `audit-portage/phases/phase-03-runtime-exhaustif/generated/phase-03-runtime-coverage-matrix.json`

Chaque ligne doit contenir :

- source path ;
- symbole source ;
- type de symbole ;
- cible TS principale ;
- symbole TS correspondant ;
- statut structurel herite de phase 02 ;
- statut comportemental phase 03 ;
- tests/harness lies ;
- findings ouverts ;
- verdict provisoire.

## Sous-phase 03.C - Auditer les chemins racines

Les racines runtime doivent etre auditees avant les feuilles, car elles prouvent que les fichiers portes sont reellement atteignables.

Entrees :

- matrice runtime ;
- racines `Qcommon_Frame`, `SV_Frame`, `G_RunFrame`, `CL_Frame`, `PMove`.

Actions :

- construire ou verifier les graphes d'appels ;
- identifier les fonctions non atteignables.

Sorties :

- findings d'atteignabilite ;
- rapport de racines runtime.

Critere de fin :

- chaque racine prioritaire est tracee jusqu'aux consommateurs TS ou signalee bloquee.

Outils de reference :

- `P03-TOOL-04-runtime-root-extractor`
- `P03-TOOL-08-callgraph-builder`
- `P03-TOOL-10-runtime-report-generator`

Racines prioritaires :

- `Qcommon_Frame`
- `SV_Frame`
- `SV_RunGameFrame`
- `G_RunFrame`
- `ClientThink`
- `ClientBeginServerFrame`
- `CL_Frame`
- `CL_SendCmd`
- `CL_ReadPackets`
- `CL_ParseServerMessage`
- `PMove`

Un fichier runtime non atteignable depuis une racine doit rester en finding, meme si ses symboles existent.

## Sous-phase 03.D - Auditer les tables declaratives critiques

Les tables declaratives sont des surfaces a fort risque d'oubli.

Entrees :

- sources C/H ;
- fichiers TS rattaches.

Actions :

- comparer spawn functions, items, cvars, commandes, messages reseau, temp entities et tables monstres.

Sorties :

- `generated/phase-03-declarative-tables-report.md`

Critere de fin :

- chaque table critique est comparee ou listee comme non extraite.

Outil de reference :

- `P03-TOOL-05-declarative-table-extractor`

Tables a comparer :

- spawn functions `classname -> function` ;
- items/ammo/weapons ;
- cvars ;
- commandes console ;
- messages reseau `svc_*` / `clc_*` ;
- temporary entities ;
- muzzle flashes ;
- effects/renderfx ;
- configstrings ;
- precaches models/sounds/images ;
- tables monstres `mmove_t` et frames.

## Sous-phase 03.E - Auditer fichier par fichier

Entrees :

- matrice runtime ;
- rapports racines/tables ;
- source C et cible TS.

Actions :

- comparer les comportements critiques ;
- ajouter/corriger les tests cibles ;
- corriger les manques localises.

Sorties :

- verdict par fichier ;
- findings priorises.

Critere de fin :

- chaque fichier runtime a un verdict autorise.

## Sous-phase 03.F - Fermer la phase runtime

Entrees :

- verdicts fichier ;
- tests/harness ;
- findings.

Actions :

- produire le rapport de couverture runtime ;
- mettre a jour le suivi selon les regles de phase 03 ;
- transferer les blocages web/renderer aux phases 04/05.

Sorties :

- `generated/phase-03-runtime-coverage-report.md`

Critere de fin :

- aucun fichier runtime du perimetre ne reste sans verdict.

## Methode anti-oubli

Pour eviter de passer a cote d'un comportement source, l'audit Phase 03 doit croiser plusieurs vues independantes du code original.

### 1. Inventaire statique par fichier

- extraire toutes les fonctions, structs, enums, macros, constantes, globals et tables depuis les `.c` / `.h` avec `P03-TOOL-01-c-symbol-indexer` ;
- marquer chaque symbole comme porte, non porte, non applicable ou a verifier ;
- ne fermer un fichier que lorsque tous ses symboles actifs ont un statut.

### 2. Graphe d'appels depuis les racines runtime

- partir des entrees originales du moteur et suivre les appels directs/indirects ;
- verifier que chaque fonction atteignable a une cible TS ou une exclusion documentee ;
- comparer le graphe source C avec le graphe TS quand `P03-TOOL-08-callgraph-builder` le permet.

### 3. Racines runtime a suivre

- `Qcommon_Frame` et les commandes/cvars qui pilotent le frame global ;
- `SV_Frame`, `SV_RunGameFrame`, chargement de map, snapshots et boucle serveur ;
- exports du module game : `Init`, `Shutdown`, `SpawnEntities`, `RunFrame`, `ClientThink`, `ClientBegin`, `ClientConnect`, `ClientDisconnect`, `ClientCommand`, `WriteGame`, `ReadGame`, `WriteLevel`, `ReadLevel` ;
- `G_RunFrame`, `ClientBeginServerFrame`, `ClientEndServerFrame`, `SV_RunThink` et tous les callbacks d'entites ;
- `CL_Frame`, `CL_SendCommand`, `CL_SendCmd`, `CL_ReadPackets`, `CL_ParseServerMessage`, `CL_BuildRefreshFrame` ;
- `PMove` et les traces/collisions utilisees par client et serveur.

### 4. Tables declaratives obligatoires

- table `classname -> spawn function` ;
- table items/ammo/weapons ;
- tables monstres et `mmove_t` / frames d'animation ;
- commandes console ;
- cvars ;
- configstrings ;
- messages reseau `svc_*` / `clc_*` ;
- temporary entities, muzzle flashes, effects/renderfx ;
- sounds/models/images precaches.

### 5. Verification par scenarios source

- demarrage `newgame` / `gamemap` ;
- chargement d'une map reelle ;
- spawn joueur ;
- plusieurs frames serveur sans input ;
- input joueur et prediction ;
- pickup item ;
- tir arme ;
- degats/mort/respawn ;
- IA monstre visible et non visible ;
- trigger/target/changelevel ;
- snapshot serveur -> parsing client -> refresh renderer.

### 6. Matrice de couverture

- chaque symbole source doit etre couvert par au moins une ligne de mapping ;
- chaque racine runtime doit avoir son chemin TS equivalent ;
- chaque table declarative doit etre comparee au source ;
- chaque scenario doit lister les fichiers C/H qu'il exerce ;
- les trous detectes deviennent des findings, pas des suppositions.

## Boucle de jeu originale a respecter

Quake II n'a pas une unique boucle gameplay simple qui contiendrait tout le jeu.
Le jeu solo passe par une architecture client/serveur locale :

```text
Qcommon_Frame
-> SV_Frame
-> module game / G_RunFrame
-> entites, think, physics, AI, items, triggers
-> snapshots serveur
-> client local
-> CL_Frame
-> CL_ReadPackets / CL_ParseServerMessage
-> prediction, effects, refresh frame
-> renderer
```

Le serveur est donc le coeur authoritative du jeu :

- il possede l'etat du monde ;
- il execute la logique gameplay ;
- il appelle le module `game` ;
- il fait avancer les entites ;
- il produit les snapshots ;
- le client local consomme ces snapshots et prepare l'affichage.

`apps/web` ne doit pas remplacer cette boucle.
Il doit seulement brancher la boucle locale serveur/client dans le navigateur.

## Perimetre obligatoire

- Tous les fichiers `game/*.c` et headers associes retenus.
- Tous les fichiers monstres `game/m_*.c` et headers associes retenus.
- Tous les fichiers joueur `game/p_*.c` et headers associes retenus.
- Tous les fichiers `server/*.c` et headers associes retenus.
- Tous les fichiers `client/*.c` et headers associes retenus qui participent a la boucle runtime, au parsing, a la prediction, aux commandes, au HUD, aux effets, aux menus, au son ou au rendu client.
- Tous les fichiers `qcommon/*.c` et headers associes retenus.
- Les formats et parseurs binaires necessaires au chargement reel des assets et maps.

## Procedure par fichier runtime

Pour chaque fichier source du perimetre :

1. Verifier que le rattachement phase 02 est `strict-ok` ou couvert par une exception acceptee.
2. Generer ou mettre a jour l'inventaire avec `P03-TOOL-07-runtime-audit-skeleton-generator`.
3. Extraire les symboles C avec `P03-TOOL-01-c-symbol-indexer`.
4. Extraire les symboles TS avec `P03-TOOL-02-ts-symbol-indexer`.
5. Comparer les symboles avec `P03-TOOL-03-symbol-parity-checker`.
6. Verifier l'atteignabilite depuis les racines via `P03-TOOL-04-runtime-root-extractor` et `P03-TOOL-08-callgraph-builder`.
7. Verifier les tables declaratives associees avec `P03-TOOL-05-declarative-table-extractor`.
8. Relier les tests existants avec `P03-TOOL-09-test-linker`.
9. Identifier les tests ou harness manquants.
10. Comparer manuellement les comportements critiques au source C.
11. Corriger les manques localises quand possible.
12. Produire un verdict fichier et mettre a jour la matrice `P03-TOOL-06-coverage-matrix-generator`.

## Verdicts autorises

- `OK ISO branche` : comportement source critique porte, branche et couvert par verification ciblee.
- `OK avec ecarts documentes` : comportement acceptable avec deviations explicites.
- `Partiel` : symboles ou branches importants manquants.
- `Non ISO` : divergence comportementale identifiee.
- `Non branche` : code present mais non atteint par le chemin runtime.
- `A tester` : port probablement present mais verification insuffisante.
- `A redecouper` : probleme structurel bloque le verdict runtime et doit revenir en phase 02.

Un verdict `OK ISO branche` ou `OK avec ecarts documentes` doit citer les tests/harness ou traces qui le justifient.

## Axes de verification

- Boucle serveur et tick.
- Chargement de map et spawn entities.
- Table `classname -> spawn function`.
- Think/use/touch/blocked/die/pain callbacks.
- Items, pickups, drops, respawn et inventaire.
- Armes, munitions, degats, means of death.
- Joueur, spawn, death, respawn, intermission, changelevel.
- IA, monstres, movement, attaques, sight/sound target.
- Triggers, targets, funcs, doors, plats, trains, buttons.
- Snapshots serveur et baselines.
- Client parsing, configstrings, entities, playerstate.
- Prediction, pmove et collision.
- Commandes console et cvars.
- Effets client, temporary entities, particles, beams, dlights.
- HUD, layouts, centerprints, inventory display.
- Son logique client/serveur et routage des events.
- Sauvegarde/chargement si applicable au chemin solo.

## Regle d'exhaustivite

Chaque fichier du perimetre doit avoir :

- un inventaire ;
- un audit ;
- un verdict ;
- une cible TS principale ;
- des findings ouverts si le portage est incomplet ;
- au moins une verification ciblee pour les blocs `Strict` importants, ou une justification explicite si la verification reste manuelle.

## Sorties attendues

- `audit-portage/phases/phase-03-runtime-exhaustif/generated/phase-03-runtime-coverage-matrix.json` produit par `P03-TOOL-06-coverage-matrix-generator`.
- `audit-portage/phases/phase-03-runtime-exhaustif/generated/phase-03-runtime-coverage-report.md` produit par `P03-TOOL-10-runtime-report-generator`.
- `audit-portage/phases/phase-03-runtime-exhaustif/generated/phase-03-declarative-tables-report.md` produit a partir de `P03-TOOL-05-declarative-table-extractor`.
- Couverture complete des fichiers runtime.
- Liste des comportements absents ou seulement simules.
- Liste des integrations manquantes jusqu'au chemin full-game.
- Mise a jour continue de `PORTAGE_QUAKE2.md`.
- Tests ou harnais ajoutes quand les risques sont critiques.

## Regles de mise a jour du suivi

- Ne mettre `Valide = ✅` que si un audit phase 03 existe et conclut `OK ISO branche` ou `OK avec ecarts documentes`.
- Mettre `Valide = 🟡` si l'audit est commence mais incomplet.
- Mettre `Valide = ⛔` si l'audit conclut `Non ISO`, `Non branche` ou `A redecouper`.
- Ne pas masquer un manque runtime par une adaptation `apps/web`.
- Toute correction comportementale doit ajouter ou mettre a jour une verification ciblee si le bloc est `Strict`.

## Definition de termine

La phase 03 est terminee quand :

- chaque fichier du perimetre runtime a un inventaire phase 03 ;
- chaque symbole actif a un statut dans la matrice de couverture ;
- chaque racine runtime prioritaire a ete suivie jusqu'a ses consommateurs TS ;
- chaque table declarative critique a ete comparee au source ;
- chaque fichier a un verdict autorise ;
- chaque verdict positif cite une verification ciblee ;
- les manques restants sont transformes en findings priorises ;
- les problemes structurels residuels sont renvoyes explicitement vers la phase 02 ;
- les integrations web ou renderer necessaires mais non runtime sont transferees aux phases 04 et 05.
