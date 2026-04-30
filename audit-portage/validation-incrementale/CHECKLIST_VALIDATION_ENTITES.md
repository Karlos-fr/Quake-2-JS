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
- [ ] Determiner si l'entite devrait etre appelee par un flux runtime normal, pas seulement si elle est deja referencee.
- [ ] Verifier si elle est atteignable depuis une racine pertinente : `Qcommon_Frame`, `SV_Frame`, `G_RunFrame`, `CL_Frame`, `CL_ParseServerMessage`, `PMove`, ou une commande/callback documentee.
- [ ] Si aucune racine n'atteint l'entite alors que le comportement original l'exige, corriger le branchement si le correctif reste dans le lot.
- [ ] Si le code est present mais non appele et que la correction depasse le lot, marquer `Partiel` ou `Manquant` selon le cas et noter l'integration manquante.
- [ ] Ne pas conclure `Non applicable` ou `Valide` seulement parce qu'aucune reference n'existe : expliquer pourquoi le runtime n'a pas besoin de cette entite, ou documenter le manque.

## 5. Verifier apps/web

- [ ] Chercher les references dans `apps/web`.
- [ ] Determiner si `apps/web` devrait declencher ce flux via le runtime porte ou consommer ses sorties.
- [ ] Confirmer que `apps/web` ne remplace pas la logique runtime principale.
- [ ] Verifier que l'integration web appelle le runtime porte ou consomme ses sorties quand le comportement touche le navigateur : commandes, input, HUD, inventaire, sons, temp entities, layout, areabits, etats client/serveur.
- [ ] Si `apps/web` contient une logique parallele, determiner si c'est un adapter legitime ou une compensation qui masque un manque runtime.
- [ ] Si une integration web est attendue mais absente, corriger si le lot le permet; sinon marquer `Partiel` ou `Manquant` et noter l'action suivante.
- [ ] Ajouter ou lancer un test `verify:web:*` ou `verify:full-game:*` si l'entite touche au flux navigateur.

## 6. Verifier renderer-three

- [ ] Chercher les references dans `packages/renderer-three`.
- [ ] Determiner si `renderer-three` devrait integrer ou consommer une sortie produite par l'entite, pas seulement si une reference existe deja.
- [ ] Identifier le type de sortie attendue : entites visibles, modeles, frames, skins, images, dlights, particules, beams, temp entities, areabits, etat de camera, interpolation ou donnees de scene.
- [ ] Si l'entite produit des donnees de rendu, verifier que le renderer consomme les bons champs.
- [ ] Si le flux runtime produit bien la donnee mais que `renderer-three` ne la consomme pas alors que le rendu original l'exige, corriger l'adapter si le lot le permet.
- [ ] Confirmer que `renderer-three` reste un adapter ou un port `ref_gl/*`, pas une compensation gameplay/client.
- [ ] Si une integration renderer est attendue mais absente, corriger si le lot le permet; sinon marquer `Partiel` ou `Manquant` et noter l'action suivante.
- [ ] Ne pas conclure `Non applicable` seulement parce que `renderer-three` n'a aucune reference : expliquer pourquoi l'entite ne produit rien de visible, ou documenter l'integration renderer manquante.
- [ ] Ajouter ou lancer un test renderer si l'entite touche aux entites visibles, particules, beams, dlights, images, modeles ou frames.

## 7. Lancer les tests

- [ ] Lancer les scripts npm lies dans la matrice ou dans le rapport de phase 03.
- [ ] Lancer un test plus large si l'entite est critique ou partagee.
- [ ] Ajouter un test ou harness cible si aucun test ne couvre le comportement compare.
- [ ] Relancer `npm run typecheck` si du code TS a ete modifie.

## 8. Corriger si necessaire

- [ ] Corriger le port TS quand le comportement source est clair.
- [ ] Corriger le branchement runtime, `apps/web` ou `renderer-three` quand l'integration attendue est claire et reste dans le lot.
- [ ] Ne pas masquer un manque runtime, `apps/web` ou `renderer-three` en appelant cela non applicable sans justification.
- [ ] Garder la correction limitee a l'entite ou au petit lot en cours.
- [ ] Relancer les tests impactes.

## 9. Mettre a jour la matrice

- [ ] Mettre `Valide` a `Valide`, `Partiel`, `Manquant`, `Non conforme` ou `Non applicable`.
- [ ] Renseigner `Notes` avec les tests lances et les ecarts documentes.
- [ ] Noter dans `Notes` si un commentaire d'en-tete de fonction a ete verifie, ajoute ou mis a jour.
- [ ] Si une correction a ete faite, noter le fichier modifie.
- [ ] Si un manque runtime, `apps/web` ou `renderer-three` reste ouvert, ne pas marquer `Valide`; noter l'action suivante.
