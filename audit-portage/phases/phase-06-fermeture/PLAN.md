# Phase 06 - Nettoyage, optimisation et fermeture

## Objectif

Transformer l'audit en base stable de terminaison.

La phase 06 ne doit pas decouvrir les gros manques.
Elle doit verifier, consolider et fermer les findings produits par les phases precedentes.

## Mode d'execution LLM

Mission de la phase :

- consolider l'audit en etat final ;
- verifier la coherence des statuts ;
- fermer, accepter ou reporter chaque finding.

Deroule optimal :

1. Verifier la presence des rapports des phases 00 a 05.
2. Creer ou completer les outils `P06-TOOL-*`.
3. Agreger tous les findings et exceptions temporaires.
4. Construire la suite de verification finale.
5. Scanner stubs, gaps de tests `Strict` et incoherences de suivi.
6. Planifier uniquement les nettoyages prouves.
7. Executer les verifications critiques disponibles.
8. Produire `audit-portage-final-report.md` avec verdict final explicite.

Stop conditions :

- rapport de phase manquant ;
- finding critique sans statut ;
- exception temporaire non expiree ou non justifiee ;
- verification critique echouee ;
- suppression de code mort sans preuve.

Sortie finale attendue :

- findings classes ;
- suite de verification documentee ;
- statuts `PORTAGE_QUAKE2.md` coherents ;
- risques, deviations et travaux reportes visibles dans le rapport final.

## Entrees

- rapports et matrices generes par les phases 00 a 05 ;
- `PORTAGE_QUAKE2.md` mis a jour ;
- fichiers `Audit/*.audit.md` et `Audit/*.inventory.md` si conserves comme historiques ou preuves ;
- tests/harness `scripts/verify/*` ;
- `package.json` et commandes npm ;
- liste des findings ouverts par phase ;
- liste des exceptions temporaires.

Si une phase precedente n'a pas de rapport ou garde des blocages critiques non classes, la phase 06 doit declarer la fermeture bloquee.

## Sous-phase 06.A - Creer les outils de fermeture et regression

Avant le nettoyage final, creer les outils qui verifient que les decisions d'audit restent vraies apres correction.

Entrees :

- rapports des phases 00 a 05 ;
- `PORTAGE_QUAKE2.md` ;
- tests existants.

Actions :

- creer les outils `P06-TOOL-*`.

Sorties :

- outils dans `tools/`.

Critere de fin :

- les findings, statuts, stubs et gaps de tests peuvent etre agreges automatiquement.

Outils attendus :

- `P06-TOOL-01-findings-aggregator` : agregateur des findings ouverts par phase.
- `P06-TOOL-02-portage-status-consistency-checker` : controleur de coherence `PORTAGE_QUAKE2.md` vs audits produits.
- `P06-TOOL-03-stub-residue-scanner` : listeur de stubs restants.
- `P06-TOOL-04-strict-test-gap-scanner` : listeur de tests/harness manquants par bloc `Strict`.
- `P06-TOOL-05-verification-suite-builder` : commande de verification globale composee des scripts critiques.
- `P06-TOOL-06-dead-code-cleanup-planner` : planificateur de suppression/isolation du code mort confirme.
- `P06-TOOL-07-exception-expiry-checker` : controleur des exceptions temporaires restantes.
- `P06-TOOL-08-final-report-generator` : generateur de rapport final `audit-portage-final-report.md`.

Ces outils doivent rendre la fermeture repetable, pas dependante d'une relecture ponctuelle.

## Sous-phase 06.B - Consolider les findings

Entrees :

- rapports de phases ;
- exceptions temporaires.

Actions :

- classer chaque finding en `closed`, `accepted-deviation`, `deferred`, `blocked` ou `invalid`.

Sorties :

- `generated/audit-portage-findings.json`

Critere de fin :

- aucun finding ouvert n'est sans statut.

Outils de reference :

- `P06-TOOL-01-findings-aggregator`
- `P06-TOOL-07-exception-expiry-checker`

Chaque finding doit etre classe :

- `closed` : corrige et verifie ;
- `accepted-deviation` : ecart documente et volontaire ;
- `deferred` : reporte avec phase/proprietaire/raison ;
- `blocked` : dependance externe ou phase precedente incomplete ;
- `invalid` : finding faux ou obsolete, avec justification.

Un finding `blocked` ou `deferred` doit apparaitre dans le rapport final.

## Sous-phase 06.C - Stabiliser la verification

Entrees :

- tests/harness ;
- blocs `Strict` ;
- findings.

Actions :

- construire la suite de verification finale ;
- lister les gaps de tests.

Sorties :

- `generated/verification-suite.md`
- `generated/strict-test-gap-report.md`

Critere de fin :

- les commandes critiques sont connues et executables separement.

Outils de reference :

- `P06-TOOL-04-strict-test-gap-scanner`
- `P06-TOOL-05-verification-suite-builder`

La suite de verification doit inclure :

- typecheck ;
- tests/harness runtime critiques phase 03 ;
- tests full-game critiques phase 04 ;
- tests renderer critiques phase 05 ;
- scans de stubs/residus ;
- controles de coherence du suivi.

La commande globale peut etre composee de plusieurs commandes npm courtes.
Elle doit eviter une commande monolithique opaque.

## Sous-phase 06.D - Nettoyer seulement ce qui est prouve

Entrees :

- rapports de code mort ;
- stubs restants ;
- findings classes.

Actions :

- planifier suppression ou isolation uniquement si prouvee.

Sorties :

- `generated/dead-code-cleanup-plan.md`
- `generated/stub-residue-report.md`

Critere de fin :

- aucune suppression n'est proposee sans preuve.

Outils de reference :

- `P06-TOOL-03-stub-residue-scanner`
- `P06-TOOL-06-dead-code-cleanup-planner`

Regle : aucun code ne doit etre supprime uniquement parce qu'il semble inutilise.
La suppression doit s'appuyer sur :

- rapport de code mort ;
- absence de consommateur ;
- absence de role de portage historique ;
- absence de finding ouvert qui en depend ;
- verification apres suppression.

## Sous-phase 06.E - Produire le rapport final

Entrees :

- sorties des sous-phases 06.B a 06.D.

Actions :

- choisir le verdict final ;
- lister risques, deviations et travaux reportes.

Sorties :

- `generated/audit-portage-final-report.md`

Critere de fin :

- le rapport final est complet et le verdict est explicite.

## Actions

- Corriger les statuts `PORTAGE_QUAKE2.md`.
- Fermer ou documenter les deviations restantes.
- Supprimer les stubs devenus inutiles.
- Supprimer ou isoler le code mort.
- Ajouter les harnais de regression manquants.
- Stabiliser les commandes npm de verification.
- Produire un rapport final des risques restants.

## Regles de mise a jour finale

- `Valide = ✅` uniquement pour les fichiers ayant un audit acceptable et une verification suffisante.
- `Valide = 🟡` pour les audits partiels, exceptions temporaires ou verification insuffisante.
- `Valide = ⛔` pour les verdicts non acceptables.
- Ne pas effacer l'historique utile des decisions d'audit.
- Documenter toute deviation acceptee dans le fichier concerne ou dans le rapport final.
- Ne pas masquer les risques restants dans une synthese trop optimiste.

## Sorties attendues

- `audit-portage/phases/phase-06-fermeture/generated/audit-portage-findings.json` produit par `P06-TOOL-01-findings-aggregator`.
- `audit-portage/phases/phase-06-fermeture/generated/portage-status-consistency-report.md` produit par `P06-TOOL-02-portage-status-consistency-checker`.
- `audit-portage/phases/phase-06-fermeture/generated/stub-residue-report.md` produit par `P06-TOOL-03-stub-residue-scanner`.
- `audit-portage/phases/phase-06-fermeture/generated/strict-test-gap-report.md` produit par `P06-TOOL-04-strict-test-gap-scanner`.
- `audit-portage/phases/phase-06-fermeture/generated/verification-suite.md` produit par `P06-TOOL-05-verification-suite-builder`.
- `audit-portage/phases/phase-06-fermeture/generated/dead-code-cleanup-plan.md` produit par `P06-TOOL-06-dead-code-cleanup-planner`.
- `audit-portage/phases/phase-06-fermeture/generated/audit-portage-final-report.md` produit par `P06-TOOL-08-final-report-generator`.

## Verdicts autorises

- `Audit ferme` : toutes les phases ont produit leurs sorties, les findings critiques sont clos ou documentes, et la verification passe.
- `Audit ferme avec risques documentes` : risques residuels acceptes et listes.
- `Fermeture bloquee` : une phase precedente manque, un finding critique reste ouvert ou la verification echoue.
- `Nettoyage reporte` : audit ferme mais suppression/optimisation repoussee par prudence.

## Definition de termine

La phase 06 est terminee quand :

- les rapports de toutes les phases sont presents ;
- les findings sont agreges et classes ;
- `PORTAGE_QUAKE2.md` est coherent avec les audits acceptes ;
- les stubs restants sont justifies ou listes ;
- les blocs `Strict` critiques ont une verification ou un gap documente ;
- la suite de verification finale est definie et executee ;
- le code mort supprime a ete prouve mort avant suppression ;
- le rapport final liste clairement risques, deviations et travaux reportes ;
- le verdict final est explicitement choisi parmi les verdicts autorises.
