# Validation incrementale du portage Quake2JS

Ce repertoire sert a verifier le portage petit pas par petit pas.

Le principe est volontairement simple :

1. Generer une matrice Markdown par fichier source C/H.
2. Choisir une entite ou un petit lot d'entites.
3. Comparer source C/H et cible TS.
4. Lancer ou ajouter les tests necessaires.
5. Corriger si besoin.
6. Mettre a jour la colonne `Valide` dans la matrice du fichier.

## Commandes

Generer ou regenerer les matrices :

```powershell
npm run audit:validation:matrices
```

Generer ou regenerer les matrices TS croisees avec les matrices C/H :

```powershell
npm run audit:validation:ts-matrices
```

Les matrices sont ecrites dans :

```text
audit-portage/validation-incrementale/validation/matrices/
```

Les matrices TS croisees sont ecrites dans :

```text
audit-portage/validation-incrementale/validation/ts-matrices/
```

Un index global est ecrit dans :

```text
audit-portage/validation-incrementale/validation/INDEX.md
```

L'index TS croise est ecrit dans :

```text
audit-portage/validation-incrementale/validation/INDEX_TS.md
```

Le pilotage global par fichier est ecrit dans :

```text
audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL.md
```

Le pilotage global TS croise est ecrit dans :

```text
audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL_TS.md
```

Les fichiers de reprise par source en cours vivent dans :

```text
audit-portage/validation-incrementale/validation/progress/
```

Les fichiers de reprise TS croisee vivent dans :

```text
audit-portage/validation-incrementale/validation/ts-progress/
```

## Organisation multi-agents

- `ORGANISATION_AGENTS.md` decrit le decoupage recommande : un agent par fichier, un petit lot par session.
- `PROMPT_LANCEMENT.md` contient le prompt a utiliser pour reprendre la validation depuis l'avancement global.
- `PROMPT_VALIDATION_TS.md` contient le prompt a utiliser pour reprendre la validation TS croisee.
- `AVANCEMENT_GLOBAL.md` est le point d'entree pour choisir les prochains fichiers ou continuer ceux en cours.
- `AVANCEMENT_GLOBAL_TS.md` est le point d'entree pour choisir les prochains fichiers TS a auditer.

## Statuts de validation

- `A verifier` : entree generee automatiquement, pas encore auditee.
- `Valide` : comportement compare, tests ou justification notes, integration verifiee si applicable.
- `Partiel` : portage acceptable seulement avec un ecart documente.
- `Manquant` : entite absente ou non equivalente.
- `Non conforme` : entite presente mais comportement divergent.
- `Non applicable` : exclusion volontaire documentee.

Le generateur preserve les colonnes `Valide` et `Notes` deja presentes quand il regenere une matrice.
