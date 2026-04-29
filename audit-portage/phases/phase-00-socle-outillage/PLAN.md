# Phase 00 - Socle d'outillage

## Objectif

Fournir le socle technique partage par les phases d'audit.

Cette phase n'est pas une phase d'audit metier.
Elle cree les index, formats et rapports automatiques de base qui evitent d'utiliser le LLM pour des inventaires deterministes.

## Mode d'execution LLM

Mission de la phase :

- construire les donnees objectives communes ;
- rendre les phases suivantes relancables ;
- ne jamais declarer qu'un fichier est correctement porte.

Deroule optimal :

1. Verifier la presence de `Quake-2-master/`, `packages/`, `apps/` et `audit-portage/phases/`.
2. Verifier que chaque phase contient `PLAN.md`, `tools/` et `generated/`.
3. Lire ou creer l'outillage dans `tools/`.
4. Executer `npm run audit:socle`.
5. Examiner les sorties `generated/` uniquement comme inventaires factuels.
6. Corriger l'outillage si une sortie est absente, invalide ou non relancable.

Stop conditions :

- arborescence source absente ;
- commande `npm run audit:socle` inexistante ou non executable ;
- index JSON incomplet ou invalide ;
- rapport Markdown non produit.

Sortie de phase attendue pour le LLM suivant :

- les index source et TypeScript existent ;
- le mapping attendu existe ;
- le rapport de structure indique les manques sans les valider.

## Sous-phase 00.A - Creer le socle d'outillage

Avant toute analyse manuelle, creer ou enrichir les outils qui serviront aux phases suivantes.

Entrees :

- `Quake-2-master/`
- `packages/`
- `apps/`
- structure `audit-portage/phases/`

Actions :

- verifier que chaque phase contient `PLAN.md`, `tools/` et `generated/` ;
- creer ou enrichir l'indexeur source C/H ;
- creer ou enrichir l'indexeur TypeScript ;
- generer le mapping attendu `basename.c/h -> basename.ts` ;
- generer le rapport automatique du socle.

Sorties :

- `generated/source-index.json`
- `generated/ts-index.json`
- `generated/source-to-ts-expected-map.json`
- `generated/phase-00-structure-report.md`

Critere de fin :

- `npm run audit:socle` produit les sorties du socle sans declarer de fichier valide.

Outils attendus :

- indexeur source C/H ;
- indexeur TypeScript ;
- generateur de mapping attendu `source -> ts` ;
- generateur de rapport Markdown relancable ;
- detecteur de stubs et marqueurs temporaires ;
- structure standard `tools/` et `generated/` pour chaque phase.

Les outils de cette sous-phase doivent produire des sorties objectives et ne jamais declarer eux-memes qu'un fichier est valide.

## Actions

- Generer un index des fichiers source C/H.
- Generer un index des fichiers TS runtime/adapters.
- Extraire les noms de fonctions, types, constantes, macros, globals et tables quand l'outillage le permet.
- Generer le mapping attendu par defaut `basename.c/h -> basename.ts`.
- Detecter les sources sans cible TS identique.
- Detecter les fichiers TS sans rattachement source evident.
- Detecter les fichiers TS dont le header `Source:` ne correspond pas au nom attendu.
- Detecter les noms modernises ou abstraits qui cassent la regle de phase 02.
- Detecter les stubs, TODO, `throw new Error`, fonctions vides et marqueurs temporaires.
- Preparer des rapports Markdown relancables avant toute analyse LLM.

## Sorties attendues

- `audit-portage/phases/phase-00-socle-outillage/generated/source-index.json`
- `audit-portage/phases/phase-00-socle-outillage/generated/ts-index.json`
- `audit-portage/phases/phase-00-socle-outillage/generated/source-to-ts-expected-map.json`
- `audit-portage/phases/phase-00-socle-outillage/generated/phase-00-structure-report.md`

## Commande initiale

```text
npm run audit:socle
```

Cette commande ne valide aucun fichier.
Elle produit seulement les donnees objectives qui alimentent les phases suivantes.
