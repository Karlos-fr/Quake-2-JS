# C Dependency Tools

Ce dossier contient deux solutions complémentaires pour analyser et visualiser les dependances des fichiers C de `Quake-2-master`.

## 1. Analyseur Node.js

Le script `analyzer/generate-dependency-graph.mjs` parcourt tous les fichiers `.c` et `.h`, puis produit un JSON avec :

- les fichiers detectes ;
- les relations `#include` entre fichiers ;
- les fonctions definies par fichier ;
- les appels de fonctions detectes dans les definitions ;
- un graphe agrege fichier-vers-fichier exploitable par la visualisation D3.

Commande :

```bash
npm run c-deps:generate
```

Le JSON est ecrit dans `data/c-dependency-graph.json`.

## 2. Visualiseur D3.js

Le dossier `viewer/` contient une interface HTML/CSS/JS qui charge le JSON genere et affiche un graphe interactif.

Commande :

```bash
npm run c-deps:view
```

Puis ouvrir `http://localhost:4173/viewer/`.

## Notes

- L'analyse est heuristique : elle vise un graphe utile pour l'exploration, pas un parseur C complet.
- Les dependances d'appel de fonctions sont deduites a partir des definitions detectees et des appels presentes dans les corps de fonctions.
- Les includes systeme comme `<stdio.h>` sont preserves comme references externes, mais ne pointent pas vers un fichier interne du depot.
