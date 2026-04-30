# Checklist de validation incrementale

Cette checklist est a appliquer pour une entite precise ou un petit lot simple.

## 1. Identifier l'entite

- [ ] Ouvrir la matrice du fichier source.
- [ ] Identifier `Fichier source`, `Type entite source` et `Nom entite source`.
- [ ] Confirmer le `Fichier cible` et le `Nom entite cible`.
- [ ] Si la cible est vide, verifier si l'entite est renommee, deplacee, exclue ou vraiment manquante.

## 2. Comparer source et TypeScript

- [ ] Lire l'entite originale dans `Quake-2-master/`.
- [ ] Lire l'entite cible dans `packages/`.
- [ ] Comparer les entrees/sorties, valeurs retour et erreurs.
- [ ] Comparer les branches importantes.
- [ ] Comparer les effets de bord : globals, champs modifies, appels de callbacks, buffers, messages reseau.
- [ ] Comparer les constantes, flags, enums, tables ou donnees associees.
- [ ] Documenter tout ecart volontaire dans `Notes`.

## 3. Verifier les commentaires d'en-tete

- [ ] Pour une fonction portee, verifier qu'un commentaire de tete existe ou l'ajouter si la fonction est nouvelle, substantiellement modifiee ou critique.
- [ ] Le commentaire d'une fonction portee doit reprendre l'esprit du README : `Original name`, `Source`, `Category: Ported`, `Fidelity level`, `Behavior` et `Porting notes` quand c'est utile.
- [ ] Le niveau de fidelite doit etre explicite quand le comportement est important : `Strict`, `Close`, `Adapter` ou `NewTooling`.
- [ ] Toute deviation volontaire au code original doit etre documentee dans le commentaire de la fonction ou du fichier concerne.
- [ ] Pour une fonction nouvelle ou adapter, verifier que le commentaire indique `Category: New` ou `Adapter`, son `Purpose` et ses contraintes principales.

## 4. Verifier le branchement runtime

- [ ] Chercher les appels directs et indirects de l'entite TS.
- [ ] Verifier si elle est atteignable depuis une racine pertinente : `Qcommon_Frame`, `SV_Frame`, `G_RunFrame`, `CL_Frame`, `CL_ParseServerMessage`, `PMove`, ou une commande/callback documentee.
- [ ] Si le code est present mais non appele, marquer `Partiel` ou `Manquant` selon le cas.

## 5. Verifier apps/web

- [ ] Chercher les references dans `apps/web`.
- [ ] Confirmer que `apps/web` ne remplace pas la logique runtime principale.
- [ ] Verifier que l'integration web appelle le runtime porte ou consomme ses sorties.
- [ ] Ajouter ou lancer un test `verify:web:*` ou `verify:full-game:*` si l'entite touche au flux navigateur.

## 6. Verifier renderer-three

- [ ] Chercher les references dans `packages/renderer-three`.
- [ ] Si l'entite produit des donnees de rendu, verifier que le renderer consomme les bons champs.
- [ ] Confirmer que `renderer-three` reste un adapter ou un port `ref_gl/*`, pas une compensation gameplay/client.
- [ ] Ajouter ou lancer un test renderer si l'entite touche aux entites visibles, particules, beams, dlights, images, modeles ou frames.

## 7. Lancer les tests

- [ ] Lancer les scripts npm lies dans la matrice ou dans le rapport de phase 03.
- [ ] Lancer un test plus large si l'entite est critique ou partagee.
- [ ] Ajouter un test ou harness cible si aucun test ne couvre le comportement compare.
- [ ] Relancer `npm run typecheck` si du code TS a ete modifie.

## 8. Corriger si necessaire

- [ ] Corriger le port TS quand le comportement source est clair.
- [ ] Ne pas masquer un manque runtime dans `apps/web` ou `renderer-three`.
- [ ] Garder la correction limitee a l'entite ou au petit lot en cours.
- [ ] Relancer les tests impactes.

## 9. Mettre a jour la matrice

- [ ] Mettre `Valide` a `Valide`, `Partiel`, `Manquant`, `Non conforme` ou `Non applicable`.
- [ ] Renseigner `Notes` avec les tests lances et les ecarts documentes.
- [ ] Noter dans `Notes` si un commentaire d'en-tete de fonction a ete verifie, ajoute ou mis a jour.
- [ ] Si une correction a ete faite, noter le fichier modifie.
- [ ] Si un manque reste ouvert, noter l'action suivante.
