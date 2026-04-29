# Plan d'audit complet du portage Quake2JS

## Objectif

Verifier que le depot TypeScript porte bien le code source original Quake II avec une tracabilite fiable, une fidelite comportementale suffisante et une integration runtime correcte.

Le but n'est pas seulement de verifier que des fichiers TS existent.
Le but est de prouver, fichier par fichier et symbole par symbole, que le comportement source original est porte, branche et valide, ou que les ecarts sont explicitement documentes.

## Principes

- Le source C/H original reste la source de verite.
- `PORTAGE_QUAKE2.md` reste le referentiel officiel source -> cible.
- Chaque fichier C/H doit avoir une cible TS principale identifiable, sauf exclusion volontaire documentee.
- Une cible TS existante ne suffit pas a declarer un fichier porte.
- Un portage n'est acceptable que si les fonctions, types, constantes, flags, globals utiles et consommateurs sont verifies.
- `apps/web` et `packages/platform` ne doivent pas porter de comportement moteur, client, serveur ou gameplay a titre principal.
- `packages/renderer-three` peut porter `ref_gl/*`, mais doit rester separe du gameplay et du client non renderer.
- Les corrections doivent etre faites au fil de l'audit quand elles sont localisees et non ambigues.
- L'automatisation doit etre privilegiee pour les inventaires, mappings, controles de nommage, detections de stubs et rapports repetables.
- Le LLM doit etre reserve aux decisions de portage, a l'analyse des ecarts comportementaux et aux corrections qui demandent du jugement.

## Structure

- `audit-portage/phases/` : un repertoire par phase.
- `audit-portage/phases/<phase>/PLAN.md` : plan detaille de la phase.
- `audit-portage/phases/<phase>/tools/` : outillage propre a la phase.
- `audit-portage/phases/<phase>/generated/` : sorties relancables produites par les outils de la phase.

## Phases

1. [Phase 00 - Socle d'outillage](phases/phase-00-socle-outillage/PLAN.md)
2. [Phase 01 - Stabiliser le referentiel d'audit](phases/phase-01-referentiel-audit/PLAN.md)
3. [Phase 02 - Audit source vers TypeScript](phases/phase-02-source-vers-typescript/PLAN.md)
4. [Phase 03 - Audit exhaustif runtime](phases/phase-03-runtime-exhaustif/PLAN.md)
5. [Phase 04 - Audit apps/web comme integration](phases/phase-04-apps-web-integration/PLAN.md)
6. [Phase 05 - Audit renderer Three.js et renderer-common](phases/phase-05-renderer-three/PLAN.md)
7. [Phase 06 - Nettoyage, optimisation et fermeture](phases/phase-06-fermeture/PLAN.md)

## Priorite de lancement

1. Corriger et enrichir le mapping automatique `source C/H -> TS`.
2. Produire le rapport Phase 01.
3. Lancer Phase 02 sur les incoherences les plus visibles.
4. Lancer Phase 03 de maniere exhaustive, package par package.
5. Auditer `apps/web` uniquement apres avoir suffisamment stabilise le runtime.
6. Auditer puis nettoyer le renderer.

## Mode d'execution LLM

Ce chantier doit etre deroule comme une pipeline a portes, pas comme une relecture libre.
Un LLM qui reprend le chantier doit suivre cet ordre :

1. Lire ce plan maitre.
2. Lire le `PLAN.md` de la phase courante.
3. Verifier que les entrees de la phase existent.
4. Executer ou creer les outils demandes par la premiere sous-phase.
5. Produire les fichiers `generated/` attendus avant de prendre des decisions manuelles.
6. Appliquer uniquement les corrections autorisees par la phase courante.
7. Mettre a jour le rapport de phase et les findings.
8. Passer a la phase suivante seulement si la definition de termine est satisfaite ou si le blocage est documente.

Regle de reprise :

- si une sortie de phase precedente manque, revenir a la phase precedente ;
- si un rattachement structurel est ambigu, revenir ou rester en phase 02 ;
- si un comportement runtime est absent, rester en phase 03 ;
- si `apps/web` compense un manque runtime, renvoyer en phase 03 ;
- si le renderer manque une donnee client/runtime, renvoyer en phase 03 ou 04 selon l'origine ;
- si un finding critique reste non classe, ne pas fermer en phase 06.

Chaque phase doit produire un rapport lisible par un humain et des sorties machines relancables.
Les rapports doivent separer les faits automatiques, les decisions humaines, les corrections appliquees et les blocages.

## Definition de termine

L'audit complet est termine quand :

- chaque fichier source retenu a un statut clair ;
- chaque fichier porte a une cible TS principale claire ;
- chaque fichier runtime important a un audit ;
- les fichiers `Strict` critiques ont une verification ciblee ;
- `apps/web` ne contient pas de logique source principale ;
- le renderer est separe entre port `ref_gl/*` et adapters Three.js ;
- `PORTAGE_QUAKE2.md` reflete l'etat reel du code ;
- les manques restants sont listes explicitement et priorises.
