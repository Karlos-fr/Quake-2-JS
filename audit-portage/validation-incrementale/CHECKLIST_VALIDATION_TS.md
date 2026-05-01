# Checklist de validation TS croisee

Cette checklist est a appliquer pour une entite TypeScript ou un petit lot simple issu des matrices `validation/ts-matrices/`.

## 1. Identifier l'entite TS

- [ ] Ouvrir la matrice TS du fichier concerne.
- [ ] Identifier `Fichier TS`, `Type TS`, `Symbole TS`, `Export`, `Original name`, `Source declaree`, `Category` et `Statut croise`.
- [ ] Verifier si l'entite est deja `Couvert C/H`. Si oui, confirmer que le lien pointe vers la bonne matrice C/H et ne pas revalider le comportement.
- [ ] Si `Statut croise` est `Doublon potentiel`, rechercher tous les symboles TS portant le meme couple `Original name` + `Source declaree`.
- [ ] Si `Statut croise` est `Ownership suspect`, verifier si le package TS correspond au module source attendu.
- [ ] Si l'entete est absent ou incomplet, determiner si le symbole est un portage, un adapter, un helper local ou du code nouveau.

## 2. Croiser avec C/H

- [ ] Ouvrir la matrice C/H indiquee quand elle existe.
- [ ] Verifier que l'entite C/H correspond au symbole TS declare dans `Original name`.
- [ ] Verifier que la validation C/H couvre bien le symbole TS et pas seulement une fonction homonyme.
- [ ] Si l'entite C/H est `Valide` ou `Non applicable`, marquer la ligne TS `Couvert C/H` seulement si le symbole TS est le proprietaire attendu.
- [ ] Si plusieurs symboles TS couvrent la meme entite C/H, garder un seul portage proprietaire et classer les autres comme `Adapter`, `New` ou `Non conforme` selon le cas.

## 3. Verifier ownership et doublons

- [ ] Le fichier/package TS proprietaire doit correspondre au module source: `game` vers `packages/game`, `qcommon` vers `packages/qcommon`, `client` vers `packages/client` ou `apps/web`, `server` vers `packages/server`, `ref_gl` vers `packages/renderer-three`.
- [ ] Un helper commun deplace dans un autre package doit etre justifie explicitement dans `Notes`; sinon marquer `Ownership suspect` ou `Non conforme`.
- [ ] Un helper local ne doit pas utiliser `Category: Ported` pour masquer un doublon du portage proprietaire.
- [ ] Un adapter local doit indiquer `Category: Adapter` ou `Category: New`, sa raison d'etre et l'entite source reutilisee.

## 4. Decider le statut TS

- [ ] `Couvert C/H`: symbole proprietaire deja couvert par la validation C/H.
- [ ] `Valide`: symbole TS audite directement et classe correctement.
- [ ] `Partiel`: symbole utile mais ownership, entete ou rattachement encore incomplet.
- [ ] `Non conforme`: doublon injustifie, mauvais package proprietaire, entete trompeur ou comportement divergent.
- [ ] `Manquant`: lien C/H attendu absent ou symbole proprietaire attendu introuvable.
- [ ] `Non applicable`: symbole volontairement hors portage C/H, avec justification.

## 5. Mettre a jour

- [ ] Mettre a jour `Validation TS` et `Notes` dans la matrice TS.
- [ ] Laisser `Notes` vide sauf information utile: justification d'ownership, doublon, adapter, action suivante.
- [ ] Mettre a jour le progress file TS correspondant dans `validation/ts-progress/` si le fichier est en cours.
- [ ] Mettre a jour `validation/AVANCEMENT_GLOBAL_TS.md`.
- [ ] Si une correction de code est faite, relancer les tests pertinents et le `typecheck`.
