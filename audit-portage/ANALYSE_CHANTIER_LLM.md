# Analyse du chantier d'audit portage Quake2JS

## Lecture globale

Le chantier n'est pas un simple audit de presence de fichiers.
C'est une pipeline de preuve :

1. produire des inventaires objectifs ;
2. stabiliser le referentiel ;
3. corriger la structure du portage ;
4. prouver le comportement runtime ;
5. verifier que le web integre sans contourner ;
6. verifier que le renderer consomme les bonnes donnees ;
7. fermer avec findings, tests et statuts coherents.

La difficulte principale est de ne pas confondre trois niveaux :

- `present` : un fichier ou symbole TS existe ;
- `rattache` : il correspond clairement a une source C/H ;
- `valide` : son comportement est porte, branche et verifie.

Un LLM doit garder ces niveaux separes tout au long du chantier.

## Ordre de dependance

```text
Phase 00
  -> Phase 01
    -> Phase 02
      -> Phase 03
        -> Phase 04
        -> Phase 05
          -> Phase 06
```

La phase 04 depend de la phase 03 parce que `apps/web` ne peut pas prouver une integration correcte si le runtime authoritative local n'est pas branche.

La phase 05 depend des phases 03 et 04 parce que le renderer ne doit pas inventer ses donnees : il doit recevoir les `refdef`, entities, particules, lights, beams, HUD et assets depuis le chemin client/runtime/web attendu.

La phase 06 ne doit commencer que lorsque les rapports des phases precedentes existent ou que leurs blocages sont explicitement documentes.

## Strategie optimale pour un LLM

Pour chaque phase, appliquer la meme boucle :

1. lire les entrees declarees ;
2. verifier les sorties de la phase precedente ;
3. creer ou completer l'outillage de phase ;
4. produire les sorties `generated/` ;
5. analyser les ecarts ;
6. appliquer seulement les corrections autorisees ;
7. relancer les verifications pertinentes ;
8. mettre a jour le rapport de phase ;
9. classer les findings pour la phase suivante.

Le LLM doit privilegier les outils pour les inventaires deterministes.
Il doit reserver son jugement aux decisions de rattachement, aux ecarts comportementaux et aux corrections localisees.

## Risques majeurs

- Valider un fichier parce qu'une cible TS existe.
- Masquer un manque runtime dans `apps/web`.
- Mettre du gameplay, de la prediction ou du parsing snapshot dans un adapter web.
- Faire du renderer une source de verite au lieu d'un consommateur du client runtime.
- Supprimer `renderer-common` ou du code mort sans preuve de non-consommation.
- Renommer ou redecomposer sans simuler les impacts d'imports.
- Donner un verdict ISO sans test, harness, trace ou justification explicite.

## Portes de qualite

Une phase est prete a etre passee seulement si :

- ses entrees etaient presentes ou leur absence a ete traitee ;
- ses outils attendus existent ou leur absence est justifiee ;
- ses sorties `generated/` sont presentes ;
- les corrections appliquees restent dans le perimetre autorise ;
- les blocages sont renvoyes vers la bonne phase ;
- les findings ouverts ont un statut ou une phase proprietaire.

## Definition d'un bon rapport de phase

Chaque rapport doit contenir au minimum :

- la date ou le contexte d'execution ;
- les entrees utilisees ;
- les outils executes ;
- les sorties produites ;
- les faits automatiques ;
- les decisions humaines ;
- les corrections appliquees ;
- les tests ou verifications lancees ;
- les findings ouverts ;
- les blocages renvoyes vers d'autres phases ;
- le verdict de phase si la phase en autorise un.

## Synthese par phase

### Phase 00 - Socle d'outillage

But : creer les index et mappings objectifs.
Le LLM ne doit pas auditer ici.
La phase sert a eviter les oublis et a rendre les phases suivantes relancables.

### Phase 01 - Referentiel

But : rendre `PORTAGE_QUAKE2.md` exploitable comme table de travail.
Le LLM corrige les erreurs factuelles, mais ne tranche pas encore les noms ou la fidelite.

### Phase 02 - Structure source vers TS

But : garantir un rattachement clair source C/H vers cible TS.
Le LLM peut renommer, rerattacher ou documenter une exception, mais ne doit pas changer le comportement.

### Phase 03 - Runtime exhaustif

But : prouver le comportement moteur/game/client/server/qcommon.
C'est la phase la plus critique.
Un verdict positif doit etre relie a l'inventaire, a l'atteignabilite et a une verification ciblee.

### Phase 04 - Integration web

But : verifier que `apps/web` orchestre le runtime.
Le LLM doit chercher les contournements, les anciens harnais et les fuites gameplay.

### Phase 05 - Renderer

But : distinguer port `ref_gl`, adapter Three.js et contrats partages.
Le LLM doit verifier les flux renderer et reporter les donnees manquantes vers runtime ou web.

### Phase 06 - Fermeture

But : transformer l'audit en etat final maintenable.
Le LLM consolide les findings, stabilise la suite de verification, nettoie seulement ce qui est prouve et produit le verdict final.

## Regle de pilotage

Le bon comportement d'un LLM sur ce chantier est conservateur :

- automatiser les inventaires ;
- documenter les incertitudes ;
- corriger les faits simples ;
- refuser les validations trop rapides ;
- garder une trace machine et une trace humaine ;
- ne fermer que ce qui est prouve.
