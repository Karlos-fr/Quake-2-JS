# Organisation des agents de validation

Ce document decrit comment piloter la validation incrementale avec plusieurs agents ou plusieurs sessions.

## Sources de verite

- Source fine par entite : `validation/matrices/*.md`.
- Source operationnelle par fichier : `validation/AVANCEMENT_GLOBAL.md`.
- Contexte humain par fichier en cours : `validation/progress/*.md`.
- Regles de validation : `CHECKLIST_VALIDATION_ENTITES.md`.

## Role du coordinateur

Le coordinateur choisit les fichiers a traiter depuis `validation/AVANCEMENT_GLOBAL.md`.

Il doit :

- prioriser les fichiers `En cours`, puis `A demarrer`;
- lancer plusieurs agents en parallele quand l'utilisateur le demande explicitement;
- lancer idealement 5 agents en parallele pour traiter 5 fichiers distincts;
- limiter chaque agent a un fichier source;
- demander un petit lot seulement par session;
- relire les resultats avant de considerer un lot clos;
- verifier que la matrice, le progress file et l'avancement global restent coherents.

Quand plusieurs agents sont lances en parallele, le coordinateur garde la responsabilite finale :

- il donne a chaque agent un fichier distinct;
- il interdit a deux agents de modifier la meme matrice ou le meme fichier TS;
- il attend les resultats;
- il integre ou verifie les changements;
- il relance les tests globaux utiles si plusieurs lots ont ete modifies;
- il met a jour ou verifie `AVANCEMENT_GLOBAL.md`.

## Role d'un agent fichier

Un agent fichier travaille sur un seul fichier source C/H.

Il doit :

- lire le README de validation et la checklist;
- ouvrir la matrice du fichier;
- ouvrir le progress file si disponible;
- choisir le prochain petit lot non valide;
- appliquer toute la checklist au lot;
- juger si le lot doit etre branche dans le runtime, `apps/web` ou `packages/renderer-three`, et pas seulement chercher les references existantes;
- corriger uniquement les manques clairement rattaches au lot;
- lancer les tests utiles;
- mettre a jour la matrice;
- mettre a jour le progress file;
- ne pas chercher a terminer tout le fichier sauf si le fichier est trivial.

## Decoupage des lots

Un lot doit rester petit et coherent.

Exemples de bons lots :

- fonctions de transition simples;
- fonctions d'une meme famille comportementale;
- une table declarative et son move associe;
- constantes ou globals simples;
- callbacks d'une animation precise;
- initialisation/spawn d'un monstre ou d'un item, si le bloc reste raisonnable.

Exemples a eviter :

- tout un gros fichier;
- plusieurs fichiers a la fois;
- une correction structurelle large;
- une validation sans test ou sans justification.

## Gros fichiers

Pour les gros fichiers, le progress file est obligatoire.

Chaque session doit y renseigner :

- le dernier lot valide;
- le prochain lot recommande;
- les tests de reference;
- les blocages;
- les decisions importantes.

Une compaction ou une reprise ne doit pas obliger a relire toute l'historique de conversation.
L'etat utile doit etre dans la matrice et le progress file.

## Regles d'ecriture

- Un agent ne doit modifier que le fichier source TS rattache a son lot, la matrice du fichier, et son progress file.
- Plusieurs agents ne doivent pas modifier la meme matrice en parallele.
- Si plusieurs agents sont lances, chacun doit avoir un fichier source different.
- Les notes de matrice restent vides par defaut.
- La colonne `Notes` ne doit contenir que les informations importantes : ecart volontaire, comportement partiel, cible renomme ou deplacee, test manquant, integration particuliere, raison d'un statut non valide.
- Ne jamais marquer `Valide` sans preuve obtenue pendant la session.
- Ne jamais marquer `Valide` si une integration runtime, `apps/web` ou `renderer-three` est attendue mais absente; utiliser `Partiel` ou `Manquant` et documenter l'action suivante.
- Pour `renderer-three`, l'agent doit juger l'integration attendue a partir des sorties runtime visibles : modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene. L'absence de reference renderer ne suffit pas a dire `Non applicable`.

## Rapport attendu d'un agent

En fin de session, l'agent indique :

- fichier traite;
- lot traite;
- verdict;
- corrections appliquees;
- tests lances;
- jugement d'integration runtime, `apps/web` et `renderer-three` : integre, non applicable justifie, ou manque ouvert;
- matrice/progress mis a jour;
- prochain lot recommande.
