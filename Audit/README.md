# Procedure d'audit de portage Quake II

Ce repertoire contient les templates a utiliser pour auditer un fichier source C de Quake II et son portage TypeScript.

## Objectif

Le but est de verifier, pour un fichier source donne :

- l'inventaire complet des fonctions, structures et constantes utiles ;
- la coherence du rattachement `source C -> cible TS` ;
- la fidelite ISO du portage ;
- la qualite du nommage, du decoupage et des commentaires ;
- le branchement reel jusqu'aux consommateurs runtime, client, renderer et web.
- la mise a jour explicite de la colonne `Valide` dans `PORTAGE_QUAKE2.md`.

## Fichiers fournis

- `inventory-template.md`
  - sert a construire l'inventaire du fichier source original avant l'audit detaille.
- `audit-template.md`
  - sert a mener l'audit complet du portage et a produire le verdict final.

## Procedure a suivre

### 1. Choisir la source de verite

Partir d'un fichier source C principal, plus ses headers associes si necessaire.

Exemples :

- `game/g_misc.c`
- `client/cl_fx.c`
- `qcommon/cvar.c`

### 2. Creer l'inventaire

Copier `inventory-template.md` vers un nouveau fichier dedie au module audite.

Exemple :

- `Audit/game-g_misc.inventory.md`

Le fichier doit etre cree immediatement, avant l'analyse detaillee item par item.
Il peut d'abord contenir des sections ouvertes, mais l'audit doit ensuite progresser
directement dans ce fichier plutot que rester dans des notes externes.

Puis remplir :

- la source C principale et les headers secondaires ;
- les fonctions ;
- les structures / types ;
- les enums / constantes / flags / macros utiles ;
- les fichiers TS de rattachement pressentis ;
- les consommateurs a verifier plus tard.

L'inventaire doit partir du C, pas du TS.

Le perimetre reste le fichier source demande. Les headers, modules TS partages,
helpers et consommateurs ne doivent etre verifies que pour les symbols, constantes,
types, effets et branchements effectivement utilises par ce fichier source.
Un ecart trouve dans une dependance partagee doit etre note comme dependance
bloquante ou point de support pour ce fichier, mais il ne transforme pas l'audit
en audit complet de cette dependance.

### 3. Verifier le rattachement source -> TS

Pour chaque item source, verifier :

- quel est le fichier TS principal de rattachement ;
- si le nom de fichier TS preserve bien la tracabilite ;
- si le decoupage est coherent ;
- si un fichier C a ete disperse dans plusieurs fichiers TS ;
- si cette dispersion est justifiee et documentee.

La granularite d'audit ne change jamais a cause du decoupage TypeScript :

- chaque fonction C active inventoriee doit etre verifiee individuellement ;
- chaque structure, type, enum, constante, flag et macro utile inventorie doit etre verifie individuellement ;
- les blocs source desactives (`#if 0`, variantes compile-time, plateformes natives) doivent etre explicitement inventories et documentes comme portes, non portes ou non applicables ;
- si un item C est disperse dans plusieurs fichiers TS, l'audit de cet item doit couvrir tous ses fragments TS et ses consommateurs ;
- aucune checklist globale ne doit etre cochee uniquement parce qu'un sous-ensemble representatif a ete verifie.
- les fichiers TS partages ou deja rattaches a un autre fichier C ne sont pas
  re-audites integralement ; seuls les fragments necessaires au fichier C audite
  sont compares.

Regle par defaut :

- viser `1 fichier C = 1 fichier TS`.

Exception acceptable :

- gros fichier ;
- fichier deja documente comme decoupe ;
- obligation de maintenabilite.

Dans tous les cas, un fichier principal de rattachement doit rester identifiable.

### 4. Creer l'audit

Copier `audit-template.md` vers un nouveau fichier dedie.

Exemple :

- `Audit/game-g_misc.audit.md`

Le fichier d'audit doit lui aussi etre cree avant la comparaison detaillee.
La checklist, le mapping et les findings sont ensuite coches ou laisses ouverts
au fil de l'audit item par item.

Puis remplir :

- la fiche d'identification ;
- le mapping `C -> TS` ;
- la checklist README ;
- la checklist ISO source ;
- la verification de branchement ;
- les tests existants et manquants ;
- les findings ;
- la decision finale.

L'audit doit aussi preparer la mise a jour de la colonne `Valide` dans `PORTAGE_QUAKE2.md`.

### 5. Verifier la fidelite ISO

Pour chaque fonction ou item source important, verifier :

- nommage ;
- comportement ;
- ordre des appels ;
- effets secondaires ;
- constantes et flags ;
- mutations d'etat ;
- branchement reel.

Dans cette section, "important" signifie tout item inventorie depuis le C ou ses headers associes qui influence le comportement, l'etat, les donnees exposees, le branchement ou la tracabilite du port. Un gros fichier doit donc etre audite en plusieurs passes si necessaire, mais il n'est complet que lorsque tous les items inventories ont ete traites.

Cocher chaque point valide avec `[x]`.

Laisser `[ ]` si :

- ce n'est pas verifie ;
- ce n'est pas porte ;
- ce n'est pas branche ;
- ou si le comportement diverge.

### 6. Verifier les commentaires

Verifier explicitement :

- l'entete de fichier ;
- l'entete des fonctions portees ;
- l'entete des fonctions nouvelles ;
- la documentation locale des deviations.

La reference a suivre est le `README.md` principal du repo.

### 7. Verifier les consommateurs finaux

L'audit ne doit pas s'arreter au fichier TS principal.

Il faut verifier aussi, si applicable :

- runtime ;
- server ;
- client ;
- `packages/renderer-common` ;
- `packages/renderer-three` ;
- `apps/web` / `packages/platform` ;
- audio.

Une fonctionnalite presente mais non consommee ne doit pas etre consideree comme completement validee.
Cette verification des consommateurs reste limitee au chemin de donnees produit par
le fichier C audite. Elle ne remplace pas l'audit propre des consommateurs eux-memes.

### 8. Conclure

Utiliser une conclusion claire :

- `OK ISO branche`
- `OK avec ecarts documentes`
- `Partiel`
- `Non ISO`
- `Non branche`
- `Non conforme README`
- `A redecouper`

### 9. Mettre a jour `PORTAGE_QUAKE2.md`

Apres l'audit, mettre a jour la colonne `Valide` de la ligne correspondante.

Convention a utiliser :

- vide
  - pas encore audite
- `🟡`
  - audit commence ou partiel
- `✅`
  - audit termine avec verdict acceptable
  - cas typiques : `OK ISO branche`, `OK avec ecarts documentes`
- `⛔`
  - audit termine avec verdict non acceptable
  - cas typiques : `Non ISO`, `Non branche`, `Non conforme README`, `A redecouper`

Regle importante :

- ne mettre `✅` dans `Valide` que si un fichier d'audit existe reellement dans `Audit/`.

Si l'audit est partiel ou si des points critiques restent ouverts, ne pas mettre `✅`.

## Ce que je ferai quand tu me donneras un fichier

Quand tu me demanderas d'appliquer cette procedure a un fichier source :

1. je lirai le source C/H et la cible TS ;
2. je remplirai d'abord un inventaire ;
3. je produirai ensuite l'audit detaille ;
4. je corrigerai le code si tu me demandes d'appliquer l'audit ;
5. je mettrai a jour `PORTAGE_QUAKE2.md` et en particulier la colonne `Valide` si necessaire.

## Convention de nommage recommandee

Pour chaque source auditee :

- `Audit/<module>.inventory.md`
- `Audit/<module>.audit.md`

Exemples :

- `Audit/game-g_misc.inventory.md`
- `Audit/game-g_misc.audit.md`
- `Audit/client-cl_fx.inventory.md`
- `Audit/client-cl_fx.audit.md`
