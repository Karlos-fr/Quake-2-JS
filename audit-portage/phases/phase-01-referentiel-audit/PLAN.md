# Phase 01 - Stabiliser le referentiel d'audit

## Objectif

Disposer d'une table fiable `source C/H -> cible TS principale -> statut -> audit -> tests`.

Dans ce plan, aucun fichier n'est considere comme deja audite.
Les anciennes valeurs de la colonne `Valide` peuvent servir d'indice historique, mais elles ne valent pas validation pour ce nouvel audit complet.

La phase 01 ne valide pas le portage et ne tranche pas encore la conformite de nommage.
Elle stabilise le referentiel utilise par la phase 02.

## Mode d'execution LLM

Mission de la phase :

- transformer `PORTAGE_QUAKE2.md` en table de reference fiable ;
- corriger seulement les erreurs factuelles ;
- preparer la phase 02 sans juger la fidelite du portage.

Deroule optimal :

1. Verifier que les sorties de phase 00 existent ; sinon relancer `npm run audit:socle`.
2. Creer ou completer les outils `P01-TOOL-*`.
3. Parser `PORTAGE_QUAKE2.md` vers un index structure.
4. Comparer suivi, sources C/H, fichiers TS et mapping attendu.
5. Classer chaque ecart en `factuel`, `ambigu`, `decision phase 02` ou `hors perimetre`.
6. Appliquer uniquement les corrections factuelles dans `PORTAGE_QUAKE2.md`.
7. Produire `portage-tracking-index.json` et `phase-01-reference-report.md`.

Stop conditions :

- `PORTAGE_QUAKE2.md` non parseable ;
- index de phase 00 absent ;
- source sans perimetre ni statut `unknown` ;
- cible declaree inexistante non signalee ;
- decision de nommage demandant la phase 02.

Sortie de phase attendue pour le LLM suivant :

- chaque source a un perimetre explicite ou `unknown` ;
- chaque cible declaree est verifiee ou signalee ;
- les decisions structurelles restantes sont listees pour la phase 02.

## Entrees

- `PORTAGE_QUAKE2.md`
- `audit-portage/phases/phase-00-socle-outillage/generated/source-index.json`
- `audit-portage/phases/phase-00-socle-outillage/generated/ts-index.json`
- `audit-portage/phases/phase-00-socle-outillage/generated/source-to-ts-expected-map.json`
- arborescence reelle `packages/`, `apps/`, `generated/`, `tools/`

Si les fichiers generes du socle d'outillage sont absents ou obsoletes, relancer :

```text
npm run audit:socle
```

## Sous-phase 01.A - Creer les outils de reconciliation du referentiel

Avant de corriger `PORTAGE_QUAKE2.md`, creer les outils qui comparent les sources de verite disponibles.

Entrees :

- `PORTAGE_QUAKE2.md`
- index generes par la phase 00.

Actions :

- creer le parseur de suivi ;
- creer les comparateurs suivi/source/TS ;
- creer les detecteurs d'ecarts factuels.

Sorties :

- outils de phase 01 dans `tools/`.

Critere de fin :

- les outils peuvent produire un premier rapport sans modification manuelle.

Outils attendus :

- `P01-TOOL-01-portage-md-parser` : parseur de `PORTAGE_QUAKE2.md` vers JSON structure.
- `P01-TOOL-02-tracking-vs-source-checker` : comparateur `PORTAGE_QUAKE2.md` vs index source C/H.
- `P01-TOOL-03-tracking-vs-ts-checker` : comparateur `PORTAGE_QUAKE2.md` vs index TS.
- `P01-TOOL-04-tracking-vs-expected-map-checker` : comparateur `PORTAGE_QUAKE2.md` vs mapping attendu du socle d'outillage.
- `P01-TOOL-05-multiple-target-detector` : detecteur des cibles multiples non justifiees.
- `P01-TOOL-06-adapter-target-detector` : detecteur des cibles situees dans `apps/web` ou `packages/platform`.
- `P01-TOOL-07-missing-path-detector` : detecteur des references vers fichiers inexistants.
- `P01-TOOL-08-untracked-file-detector` : detecteur des fichiers source ou TS runtime absents du suivi.
- `P01-TOOL-09-reference-table-builder` : constructeur de la table de reference normalisee.
- `P01-TOOL-10-reference-report-generator` : generateur de rapport `phase-01-reference-report.md`.

Ces outils doivent alimenter la phase 02 et permettre de savoir quelles lignes du suivi sont factuelles, ambigues ou suspectes.

## Sous-phase 01.B - Classer le perimetre source

Avant de corriger le suivi, chaque fichier source doit etre classe dans un perimetre explicite :

Entrees :

- index source ;
- suivi parse.

Actions :

- classer chaque source en perimetre explicite ;
- conserver les cas incertains en `unknown`.

Sorties :

- perimetre source normalise dans l'index de phase.

Critere de fin :

- aucun fichier source n'est absent de la classification ; les `unknown` sont explicites.

- `core-runtime` : moteur, client, serveur, game, qcommon, formats utiles ;
- `renderer-ref-gl` : renderer OpenGL original cible par `renderer-three` ;
- `platform-native` : code Win32/Linux/Irix/Solaris/Rhapsody natif non cible directement ;
- `renderer-soft` : renderer software non cible sauf decision contraire ;
- `ctf` : extension CTF hors perimetre si non demandee ;
- `assets-or-docs` : documentation, ressources, projets IDE, artefacts ;
- `unknown` : a clarifier avant phase 02.

La phase 02 ne doit auditer que les fichiers dont le perimetre est clair.

## Sous-phase 01.C - Construire la table de reference

Produire une table normalisee, relancable, avec au minimum :

Entrees :

- suivi parse ;
- index source ;
- index TS ;
- classification de perimetre.

Actions :

- produire la table `source -> cible declaree -> cible attendue -> anomalies` avec `P01-TOOL-09-reference-table-builder`.

Sorties :

- `generated/portage-tracking-index.json`
- `generated/phase-01-reference-report.md`

Critere de fin :

- la phase 02 peut consommer la table sans relire manuellement tout `PORTAGE_QUAKE2.md`.

- source path ;
- source basename ;
- perimetre ;
- statut attendu : a porter, exclu volontairement, a clarifier ;
- cible TS principale declaree dans `PORTAGE_QUAKE2.md` ;
- cible TS attendue par la regle stricte de phase 02 ;
- cible TS existante detectee ;
- presence d'audit historique ;
- tests/harness references ;
- anomalies detectees.

Cette table devient l'entree de travail de la phase 02.

## Sous-phase 01.D - Appliquer seulement les corrections factuelles

Entrees :

- `generated/phase-01-reference-report.md`

Actions :

- corriger les chemins inexistants, doublons evidents et erreurs factuelles ;
- laisser les decisions de nommage/decoupage a la phase 02.

Sorties :

- `PORTAGE_QUAKE2.md` factuellement plus coherent.

Critere de fin :

- aucun changement de comportement ou de structure TS n'a ete fait en phase 01.

## Actions

- Relancer les outils du socle d'outillage si necessaire.
- Comparer le mapping genere avec `PORTAGE_QUAKE2.md` via `P01-TOOL-04-tracking-vs-expected-map-checker`.
- Identifier les lignes de suivi sans cible claire via `P01-TOOL-09-reference-table-builder`.
- Identifier les fichiers TS presents mais absents ou mal rattaches dans `PORTAGE_QUAKE2.md`.
- Identifier les cibles multiples non justifiees via `P01-TOOL-05-multiple-target-detector`.
- Identifier les cibles suspectes dans `apps/web` ou `packages/platform` via `P01-TOOL-06-adapter-target-detector`.
- Identifier les anciens stubs ou fichiers generes encore consommes.
- Identifier les fichiers source presents sur disque mais absents du suivi via `P01-TOOL-08-untracked-file-detector`.
- Identifier les entrees du suivi pointant vers des fichiers source inexistants via `P01-TOOL-07-missing-path-detector`.
- Identifier les cibles TS declarees mais inexistantes via `P01-TOOL-07-missing-path-detector`.
- Classer les ecarts en `factuel`, `ambigu`, `decision phase 02`, `hors perimetre`.

## Regles de correction

- Corriger `PORTAGE_QUAKE2.md` en phase 01 seulement pour les ecarts factuels : chemin inexistant, cible inexistante, doublon evident, perimetre manifestement hors cible.
- Ne pas mettre `Valide = OK` ou equivalent valide en phase 01.
- Ne pas declarer un fichier `porte` uniquement parce qu'une cible existe.
- Ne pas renommer ou redecomposer les fichiers TS en phase 01 ; ces corrections appartiennent a la phase 02.
- Conserver les anciennes informations utiles comme indices historiques, mais ne pas les traiter comme validation.

## Sorties attendues

- `audit-portage/phases/phase-01-referentiel-audit/generated/portage-tracking-index.json`
- `audit-portage/phases/phase-01-referentiel-audit/generated/phase-01-reference-report.md`
- Rapport d'ecarts de mapping integre dans `phase-01-reference-report.md`.
- Liste des sources sans cible principale integree dans `phase-01-reference-report.md`.
- Liste des cibles TS non rattachees integree dans `phase-01-reference-report.md`.
- Liste des statuts `Porte` / `Valide` incoherents avec le rattachement reel, sans considerer `Valide` comme acquis.
- Mise a jour de `PORTAGE_QUAKE2.md` si les corrections sont factuelles.

## Definition de termine

La phase 01 est terminee quand :

- le suivi `PORTAGE_QUAKE2.md` est parseable par l'outil de phase 01 ;
- chaque fichier source indexe a un perimetre ou un statut `unknown` explicite ;
- chaque cible declaree est verifiee comme existante ou signalee ;
- chaque source sans entree de suivi est signalee ;
- chaque fichier TS non reference par le suivi est signale ;
- les corrections factuelles simples sont appliquees ;
- les decisions de nommage/decoupage restantes sont transferees a la phase 02.
