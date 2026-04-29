# Phase 02 - Audit source vers TypeScript

## Objectif

Verifier le rattachement fichier par fichier, puis symbole par symbole.

Cette phase est une remise en conformite structurelle.
Elle ne declare pas encore qu'un fichier runtime est ISO fonctionnellement valide :
la validation comportementale exhaustive des fichiers gameplay/client/server/qcommon est fermee en phase 03.

La phase 02 peut corriger le rattachement, le nommage et le decoupage.
Elle ne doit pas conclure qu'un comportement source est fidelement porte.

## Mode d'execution LLM

Mission de la phase :

- imposer un rattachement clair `source C/H -> cible TS principale` ;
- documenter les exceptions de decoupage ;
- corriger les noms et imports sans changer le comportement.

Deroule optimal :

1. Verifier que les rapports de phase 01 existent.
2. Creer ou completer les outils `P02-TOOL-*`.
3. Generer le rapport structurel initial sans modifier les fichiers.
4. Remplir le registre des exceptions de decoupage.
5. Produire un plan de renommage/rerattachement avec impact d'import.
6. Appliquer seulement les corrections structurelles simples et localisees.
7. Relancer typecheck/tests cibles quand des imports changent.
8. Produire `phase-02-structure-report.md`, `phase-02-split-exceptions.json` et `phase-02-rename-plan.md`.

Stop conditions :

- phase 01 absente ou incoherente ;
- collision de basename non resolue ;
- decoupage non justifie ;
- import impact inconnu avant renommage ;
- risque de changement comportemental non trivial.

Sortie de phase attendue pour le LLM suivant :

- chaque source retenue a une cible principale conforme ou une exception ;
- aucun fichier principal non autorise ne vit dans `apps/web` ou `packages/platform` ;
- les questions comportementales sont renvoyees explicitement en phase 03.

## Entrees

- `PORTAGE_QUAKE2.md`
- rapport de phase 01 : `audit-portage/phases/phase-01-referentiel-audit/generated/phase-01-reference-report.md`
- index de phase 01 : `audit-portage/phases/phase-01-referentiel-audit/generated/portage-tracking-index.json`
- index source/TS du socle d'outillage
- fichiers source originaux dans `Quake-2-master/`
- fichiers TS reels dans `packages/` et `apps/`

Si les sorties de phase 01 sont absentes, la phase 02 ne doit pas commencer.

## Sous-phase 02.A - Creer les outils de controle structurel

Avant de renommer, redecouper ou rerattacher des fichiers, creer les outils qui rendent la regle `1 C/H -> 1 TS identique` verifiable automatiquement.

Entrees :

- index phase 00 ;
- table de reference phase 01.

Actions :

- creer les outils `P02-TOOL-*` ;
- produire un premier rapport structurel sans modifier les fichiers.

Sorties :

- outils dans `tools/` ;
- brouillon de rapport structurel.

Critere de fin :

- chaque ecart de rattachement peut etre classe automatiquement ou signale comme ambigu.

Outils attendus :

- `P02-TOOL-01-strict-basename-map` : detecteur de correspondance stricte `basename.c/h -> basename.ts`.
- `P02-TOOL-02-split-exception-registry` : fichier d'exceptions documentees pour les decoupages autorises.
- `P02-TOOL-03-modern-name-detector` : detecteur de fichiers TS au nom modernise ou abstrait.
- `P02-TOOL-04-port-header-checker` : detecteur de headers TS manquants ou incoherents (`File`, `Source`, `Fidelity level`, `Deviations`).
- `P02-TOOL-05-rename-proposal-generator` : generateur de propositions de renommage/rerattachement sans modification automatique.
- `P02-TOOL-06-structural-inventory-generator` : generateur d'inventaires structurels pre-remplis.
- `P02-TOOL-07-basename-collision-detector` : detecteur de collisions de noms quand plusieurs sources ont le meme basename.
- `P02-TOOL-08-import-impact-detector` : detecteur d'imports cassables avant renommage.
- `P02-TOOL-09-rename-plan-simulator` : simulateur de plan de renommage avec liste des imports a mettre a jour.
- `P02-TOOL-10-structure-report-generator` : generateur de rapport `phase-02-structure-report.md`.

Les corrections restent appliquees manuellement ou par patch explicite.
L'outil ne doit pas renommer les fichiers seul.

## Sous-phase 02.B - Gerer les exceptions de decoupage

Creer et maintenir un registre d'exceptions pour les fichiers qui ne respectent pas strictement `1 C/H -> 1 TS identique`.

Entrees :

- rapport structurel ;
- sources avec plusieurs cibles TS ou cible non identique.

Actions :

- renseigner le registre d'exceptions ;
- refuser les exceptions non justifiees.

Sorties :

- `generated/phase-02-split-exceptions.json`

Critere de fin :

- chaque decoupage est `accepted`, `temporary`, `rejected` ou `to-review`.

Outil de reference :

- `P02-TOOL-02-split-exception-registry`

Sortie attendue :

- `audit-portage/phases/phase-02-source-vers-typescript/generated/phase-02-split-exceptions.json`

Chaque exception doit contenir :

- source path ;
- fichier TS principal ;
- fichiers TS secondaires ;
- raison du decoupage ;
- justification de la taille ou de la complexite source ;
- preuve que le fichier principal conserve le nom source, ou justification si impossible ;
- impact sur les imports publics ;
- statut : `accepted`, `temporary`, `rejected`, `to-review`.

Une exception `temporary` doit produire un finding et rester visible pour les phases suivantes.
Le rapport principal produit par `P02-TOOL-10-structure-report-generator` doit lister toutes les exceptions non `accepted`.

## Sous-phase 02.C - Produire le plan de renommage/rerattachement

Entrees :

- rapport structurel ;
- registre d'exceptions.

Actions :

- generer les propositions de renommage ;
- simuler l'impact sur les imports ;
- produire le plan de patch.

Sorties :

- `generated/phase-02-rename-plan.md`

Critere de fin :

- aucun renommage n'est applique sans impact d'import connu.

## Sous-phase 02.D - Appliquer les corrections structurelles simples

Entrees :

- plan de renommage ;
- registre d'exceptions.

Actions :

- appliquer les corrections localisees par patch explicite ;
- mettre a jour les imports ;
- ne pas changer le comportement.

Sorties :

- fichiers TS rattaches et nommes plus conformement ;
- suivi mis a jour pour les faits.

Critere de fin :

- le typecheck ou les tests cibles pertinents ne regressent pas a cause des renommages.

## Sous-phase 02.E - Fermer la phase structurelle

Entrees :

- corrections appliquees ;
- registre d'exceptions ;
- rapport structurel.

Actions :

- produire le rapport final de phase 02 ;
- transferer les questions comportementales a la phase 03.

Sorties :

- `generated/phase-02-structure-report.md`

Critere de fin :

- chaque source retenue a une cible conforme ou une exception documentee.

## Regle de rattachement

Chaque fichier `.c` ou `.h` original doit correspondre a un seul fichier TS principal,
ou a plusieurs fichiers TS seulement si le fichier original est trop gros ou impose un
decoupage de maintenabilite clairement justifie.

Par defaut, le nom du fichier TS principal doit etre identique au nom du fichier source,
hors extension. Exemple : `sv_world.c` -> `sv_world.ts`, `g_local.h` -> `g_local.ts`.
Un nom different n'est acceptable que dans un cas de decoupage documente, et le fichier
principal doit tout de meme conserver le nom source quand c'est techniquement possible.

Les corrections simples de rattachement, nommage et decoupage doivent etre faites au
fur et a mesure de cette phase, sans attendre un audit fonctionnel complet.

## Regles de correction

- Renommer un fichier porte pour respecter `basename.c/h -> basename.ts` quand le changement est localisable et que les imports peuvent etre mis a jour.
- Conserver un fichier principal au nom source quand un decoupage est necessaire.
- Refuser les noms modernes ou abstraits comme cible principale d'un fichier porte.
- Ne pas fusionner deux sources C/H dans un seul fichier TS principal.
- Ne pas deplacer un comportement source principal vers `apps/web` ou `packages/platform`.
- Ne pas supprimer un fichier TS tant que ses imports et son role n'ont pas ete verifies.
- Ne pas changer le comportement pendant une correction de nommage/rattachement, sauf micro-ajustement necessaire au build.
- Ne pas mettre `Valide = ✅` apres une correction structurelle seule.
- Mettre `Valide` au mieux en etat audit structurel partiel si le suivi doit le refleter, mais reserver la validation comportementale aux phases suivantes.

Les corrections de renommage doivent s'appuyer sur :

- `P02-TOOL-05-rename-proposal-generator` pour identifier les changements proposes ;
- `P02-TOOL-08-import-impact-detector` pour lister les imports touches ;
- `P02-TOOL-09-rename-plan-simulator` pour produire le plan de patch.

## Perimetre

- Tous les fichiers `.c` et `.h` du perimetre Quake II retenu.
- Les exclusions volontaires doivent rester explicites : plateformes natives, renderer software non cible, CTF si hors perimetre, artefacts de build, documentation historique.
- Les fichiers classes `unknown` en phase 01 doivent etre clarifies avant audit structurel.
- Les fichiers exclus volontairement doivent conserver une ligne de suivi claire mais ne necessitent pas de cible TS.

## Procedure par fichier

Pour chaque fichier source retenu :

1. Lire la ligne correspondante dans le referentiel de phase 01.
2. Verifier le perimetre et le statut attendu.
3. Chercher la cible TS identique attendue avec `P02-TOOL-01-strict-basename-map`.
4. Chercher les cibles TS declarees dans `PORTAGE_QUAKE2.md`.
5. Classer le cas :
   - `strict-ok` : cible unique au nom identique ;
   - `missing-target` : aucune cible TS acceptable ;
   - `wrong-name` : cible existante mais nom non conforme ;
   - `split-ok` : decoupage documente et fichier principal conforme ;
   - `split-undocumented` : decoupage probable mais non documente ;
   - `adapter-leak` : cible principale dans adapter interdit ;
   - `merged-source` : plusieurs sources semblent fusionnees ;
   - `ambiguous` : decision humaine requise.
6. Verifier les collisions de basename avec `P02-TOOL-07-basename-collision-detector`.
7. Verifier les headers TS avec `P02-TOOL-04-port-header-checker`.
8. Verifier les noms modernises avec `P02-TOOL-03-modern-name-detector`.
9. Generer le plan de correction avec `P02-TOOL-05-rename-proposal-generator` et `P02-TOOL-09-rename-plan-simulator`.
10. Appliquer les corrections structurelles evidentes par patch explicite.
11. Mettre a jour le rapport `P02-TOOL-10-structure-report-generator` et le registre `P02-TOOL-02-split-exception-registry`.
12. Reporter les questions comportementales a la phase 03.

## Verification fichier

Pour chaque fichier source :

- verifier la cible TS principale ;
- verifier qu'un fichier `.c` ou `.h` correspond par defaut a un seul fichier TS principal ;
- verifier que plusieurs fichiers TS ne sont utilises que si l'original est trop gros ou si le decoupage est explicitement justifie ;
- verifier que le fichier TS principal porte le meme nom que le fichier source hors extension ;
- refuser les renommages modernises ou abstraits pour les fichiers portes ;
- n'accepter un nom different que pour un decoupage documente, avec justification explicite ;
- renommer ou rerattacher au fil de l'eau les fichiers dont le nom ne respecte pas cette regle ;
- regrouper ou redecouper au fil de l'eau les portages disperses sans justification ;
- verifier qu'un fichier principal de rattachement reste identifiable ;
- verifier que le portage principal ne vit pas dans un adapter non autorise ;
- verifier les headers de module et deviations documentees.

## Verification symboles

Pour chaque fichier source actif :

- inventorier fonctions avec `P02-TOOL-06-structural-inventory-generator` quand l'extraction est disponible ;
- inventorier structs/types avec `P02-TOOL-06-structural-inventory-generator` quand l'extraction est disponible ;
- inventorier enums, macros, constantes et flags avec `P02-TOOL-06-structural-inventory-generator` quand l'extraction est disponible ;
- inventorier globals et tables avec `P02-TOOL-06-structural-inventory-generator` quand l'extraction est disponible ;
- inventorier commandes console et cvars ;
- verifier chaque item dans la cible TS ;
- verifier les noms conserves ou les deviations documentees ;
- verifier les branches compile-time non portees ou non applicables ;
- verifier les stubs et hooks temporaires.

Cette verification de symboles est structurelle :
elle verifie la presence, le rattachement et le nommage.
Elle ne suffit pas a declarer la fidelite comportementale ISO.

## Sorties attendues

- `audit-portage/phases/phase-02-source-vers-typescript/generated/phase-02-structure-report.md` produit par `P02-TOOL-10-structure-report-generator`.
- `audit-portage/phases/phase-02-source-vers-typescript/generated/phase-02-split-exceptions.json` maintenu par `P02-TOOL-02-split-exception-registry`.
- `audit-portage/phases/phase-02-source-vers-typescript/generated/phase-02-rename-plan.md` produit par `P02-TOOL-09-rename-plan-simulator`.
- Inventaires structurels pre-remplis par `P02-TOOL-06-structural-inventory-generator` si utiles.
- Audits structurels quand le rattachement exige une decision documentee.
- Findings tries par gravite.
- Corrections localisees quand possible.
- Mise a jour de `PORTAGE_QUAKE2.md` pour les rattachements, cibles et exclusions factuelles.

## Definition de termine

La phase 02 est terminee quand :

- chaque fichier source retenu a une cible TS principale conforme ou une exception documentee ;
- chaque fichier TS principal porte le meme basename que la source, sauf exception acceptee ;
- chaque decoupage a une entree dans le registre d'exceptions ;
- aucun portage principal non autorise ne vit dans `apps/web` ou `packages/platform` ;
- les imports cassables par renommage ont ete corriges ;
- les fichiers `unknown` de phase 01 sont resolus ou reportes explicitement ;
- les findings comportementaux sont transferes a la phase 03 ;
- aucune validation ISO n'a ete accordee uniquement sur la base de cette phase.
