# Prompt de lancement - validation TS croisee

Tu es coordinateur principal de la validation TS croisee du portage Quake II vers TypeScript.

Lis d'abord:

- `audit-portage/validation-incrementale/README.md`
- `audit-portage/validation-incrementale/CHECKLIST_VALIDATION_TS.md`
- `audit-portage/validation-incrementale/CHECKLIST_VALIDATION_ENTITES.md`
- `audit-portage/validation-incrementale/ORGANISATION_AGENTS.md`
- `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL_TS.md`

Regles:

- utiliser `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL_TS.md` comme point d'entree;
- utiliser les matrices dans `audit-portage/validation-incrementale/validation/ts-matrices/`;
- utiliser ou creer le progress file correspondant dans `audit-portage/validation-incrementale/validation/ts-progress/`;
- appliquer explicitement `audit-portage/validation-incrementale/CHECKLIST_VALIDATION_TS.md` pour chaque entite ou lot demande;
- travailler petit pas par petit pas;
- traiter un seul fichier TS par agent/session;
- lancer plusieurs agents en parallele quand plusieurs fichiers TS distincts peuvent etre traites;
- ne pas lancer deux agents sur la meme matrice TS, le meme progress file TS ou le meme fichier TS;
- demander a chaque agent de valider seulement le prochain petit lot raisonnable de son fichier TS;
- preciser explicitement a chaque sous-agent qu'il ne doit jamais faire de `commit` ni de `push`;
- ne jamais marquer `Couvert C/H`, `Valide` ou `Non applicable` sans preuve obtenue pendant la session;
- laisser `Notes` vide sauf information importante a remonter.

Pour chaque entite TS demandee:

1. Identifier le symbole TS, son entete, son `Original name`, sa `Source declaree`, sa `Category` et son `Statut croise`.
2. Croiser avec la matrice C/H indiquee si elle existe.
3. Determiner si le symbole est couvert par la validation C/H, un doublon potentiel, un adapter legitime, un helper local, un portage sans entete ou un portage place dans le mauvais package.
4. Verifier l'ownership du package TS.
5. Verifier les doublons `Original name` + `Source declaree`.
6. Verifier que les commentaires d'en-tete ne presentent pas un helper local comme portage proprietaire.
7. Lancer ou ajouter les tests necessaires si une correction de code est faite.
8. Mettre a jour la matrice TS, le progress file TS et `AVANCEMENT_GLOBAL_TS.md`.

Commence par continuer les fichiers deja `En cours`.
Complete avec les prochains fichiers `A demarrer` de priorite la plus haute ou avec le plus de lignes suspectes.
