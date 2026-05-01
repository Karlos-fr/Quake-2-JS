# Prompt de lancement

Utiliser ce prompt pour reprendre la validation incrementale dans une nouvelle session.

```text
Prends connaissance de :
- `audit-portage/validation-incrementale/README.md`
- `audit-portage/validation-incrementale/CHECKLIST_VALIDATION_ENTITES.md`
- `audit-portage/validation-incrementale/ORGANISATION_AGENTS.md`
- `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL.md`

Je veux continuer la validation incrementale du portage Quake II vers TypeScript.

Applique explicitement toute la checklist `audit-portage/validation-incrementale/CHECKLIST_VALIDATION_ENTITES.md` pour chaque entite ou lot demande.

Important : lance plusieurs agents en parallele.

Regles :
- travailler petit pas par petit pas;
- agir comme coordinateur principal;
- lancer 6 agents en parallele quand au moins 6 fichiers distincts peuvent etre traites;
- donner a chaque agent un fichier source different;
- demander a chaque agent de valider seulement le prochain petit lot raisonnable de son fichier;
- lors d'un lancement avec contexte complet, ne pas forcer le type d'agent;
- inclure explicitement le contexte de consignes dans chaque mission d'agent, meme si la session principale l'a deja lu;
- ne pas lancer deux agents sur la meme matrice, le meme progress file ou le meme fichier TS;
- utiliser `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL.md` comme point d'entree;
- utiliser les matrices dans `audit-portage/validation-incrementale/validation/matrices/`;
- utiliser ou creer le progress file correspondant dans `audit-portage/validation-incrementale/validation/progress/`;
- traiter un seul fichier source par agent/session;
- pour chaque entite demandee : comparer source C/H vs TS, verifier les commentaires d'en-tete de fonction, verifier le branchement runtime, verifier `apps/web` et `packages/renderer-three` si applicable, lancer/ajouter les tests necessaires, corriger si besoin, puis mettre a jour la matrice, le progress file et l'avancement global;
- pour le branchement runtime, `apps/web` et `packages/renderer-three`, ne pas seulement chercher ce qui existe : determiner si l'entite doit etre integree dans ces flux, corriger si le lot le permet, sinon marquer `Partiel` ou `Manquant` avec l'action suivante;
- ne jamais marquer `Valide` sans preuve obtenue pendant la session;
- laisser la colonne `Notes` vide sauf information importante a remonter;
- ne pas masquer un manque runtime dans `apps/web` ou `renderer-three`;
- ne pas declarer `Non applicable` sans justification quand une integration runtime/web/renderer pourrait etre attendue.
- pour `renderer-three`, verifier aussi si une sortie runtime visible devrait etre consommee par le renderer : modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene; si oui et que ce n'est pas branche, corriger ou marquer `Partiel`/`Manquant`.
- attendre les agents, relire leurs resultats, puis centraliser le bilan final.

Commence par continuer les fichiers deja `En cours`.
Complete avec les prochains fichiers `A demarrer` de priorite la plus haute jusqu'a avoir 6 fichiers distincts.
Lance un agent parallele par fichier retenu.
Chaque agent doit valider seulement le prochain petit lot raisonnable de son fichier.
```

Variante pour un fichier precis :

```text
Continue la validation incrementale en partant de `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL.md`.

Travaille uniquement sur le fichier :
`Quake-2-master/game/m_chick.c`

Applique explicitement toute la checklist.
Pour le runtime, `apps/web` et `packages/renderer-three`, decide aussi si une integration est attendue; ne te limite pas a chercher les references existantes.
Pour `renderer-three`, base ce jugement sur les sorties visibles attendues du runtime, pas uniquement sur les imports ou appels deja presents.
Lis la matrice et le progress file du fichier.
Choisis le prochain petit lot non valide, valide ce lot seulement, lance les tests utiles, corrige si besoin, puis mets a jour la matrice, le progress file et l'avancement global.
```
