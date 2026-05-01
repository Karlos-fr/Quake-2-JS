# Prompt de lancement - validation TS croisee

Utiliser ce prompt pour reprendre la validation TS croisee dans une nouvelle session.

```text
Prends connaissance de :
- `audit-portage/validation-incrementale/README.md`
- `audit-portage/validation-incrementale/CHECKLIST_VALIDATION_TS.md`
- `audit-portage/validation-incrementale/CHECKLIST_VALIDATION_ENTITES.md`
- `audit-portage/validation-incrementale/ORGANISATION_AGENTS.md`
- `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL_TS.md`

Je veux continuer la validation TS croisee du portage Quake II vers TypeScript.

Applique explicitement toute la checklist `audit-portage/validation-incrementale/CHECKLIST_VALIDATION_TS.md` pour chaque entite ou lot demande.

Important : lance plusieurs agents en parallele.

Regles :
- travailler petit pas par petit pas;
- agir comme coordinateur principal;
- lancer 6 agents en parallele quand au moins 6 fichiers TS distincts peuvent etre traites;
- donner a chaque agent un fichier TS different;
- demander a chaque agent de valider seulement le prochain petit lot raisonnable de son fichier TS;
- preciser explicitement a chaque sous-agent qu'il ne doit jamais faire de `commit` ni de `push`;
- lors d'un lancement avec contexte complet, ne pas forcer le type d'agent;
- inclure explicitement le contexte de consignes dans chaque mission d'agent, meme si la session principale l'a deja lu;
- ne pas lancer deux agents sur la meme matrice TS, le meme progress file TS ou le meme fichier TS;
- utiliser `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL_TS.md` comme point d'entree;
- utiliser les matrices dans `audit-portage/validation-incrementale/validation/ts-matrices/`;
- utiliser ou creer le progress file correspondant dans `audit-portage/validation-incrementale/validation/ts-progress/`;
- traiter un seul fichier TS par agent/session;
- pour chaque entite TS demandee : identifier le symbole TS, verifier son entete, son `Original name`, sa `Source declaree`, sa `Category`, son `Export`, sa matrice C/H liee et son `Statut croise`;
- pour chaque entite `Category: New` : renseigner explicitement dans l'entete et la matrice `Original name: N/A`, `Source declaree: N/A (<raison courte>)` et `Category: New`; ne jamais laisser `Original name` ou `Source declaree` vide pour du code nouveau;
- croiser avec la matrice C/H indiquee si elle existe, sans revalider inutilement le comportement deja couvert par C/H;
- verifier que le symbole TS est bien le proprietaire attendu de l'entite C/H quand il est marque `Couvert C/H`;
- verifier les problemes que la validation C/H ne detecte pas seule : mauvais fichier TS, mauvais package, mauvais ownership, doublon de fonction, helper local presente comme portage proprietaire, entete incomplet ou trompeur, mauvais import de package;
- si une correction est dans le lot : corriger le code, les imports et/ou les commentaires d'entete, lancer/ajouter les tests necessaires, puis mettre a jour la matrice TS, le progress file TS et l'avancement global TS;
- si la correction depasse le lot raisonnable : marquer `Partiel`, `Non conforme` ou `Manquant` avec l'action suivante claire;
- ne jamais marquer `Couvert C/H`, `Valide` ou `Non applicable` sans preuve obtenue pendant la session;
- laisser la colonne `Notes` vide sauf information importante a remonter;
- ne pas masquer un doublon, un mauvais package ou un mauvais ownership sous `Couvert C/H`;
- attendre les agents, relire leurs resultats, puis centraliser le bilan final.

Commence par continuer les fichiers deja `En cours`.
Complete avec les prochains fichiers `A demarrer` ou les fichiers avec le plus de lignes suspectes jusqu'a avoir 6 fichiers TS distincts.
Lance un agent parallele par fichier retenu.
Chaque agent doit valider seulement le prochain petit lot raisonnable de son fichier TS.
```

Variante pour un fichier TS precis :

```text
Continue la validation TS croisee en partant de `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL_TS.md`.

Travaille uniquement sur le fichier TS :
`packages/game/src/g_misc.ts`

Applique explicitement toute la checklist `audit-portage/validation-incrementale/CHECKLIST_VALIDATION_TS.md`.
Pour chaque entite `Category: New`, renseigne explicitement dans l'entete et la matrice `Original name: N/A`, `Source declaree: N/A (<raison courte>)` et `Category: New`; ne laisse pas ces metadonnees vides.
Ne fais pas de `commit` ni de `push`, et si tu lances des sous-agents, precise-leur explicitement qu'ils ne doivent jamais faire de `commit` ni de `push`.
Lis la matrice TS et le progress file TS du fichier.
Choisis le prochain petit lot non couvert ou suspect, valide ce lot seulement, croise avec les matrices C/H pertinentes, lance les tests utiles si une correction est faite, corrige si besoin, puis mets a jour la matrice TS, le progress file TS et l'avancement global TS.
```
