# Template Audit Portage Quake II

Date :

## Verdict

Statut :
Risque principal :

## Source verifiee

- Source C/H :
- Port TS :
- Consommateurs :

## Fiche d'identification

- Fichier audite :
- Source C/H principale :
- Sources C/H secondaires :
- Package :
- Type de fichier :
- Statut dans `PORTAGE_QUAKE2.md` :
- Statut `Valide` dans `PORTAGE_QUAKE2.md` :
- Niveau de fidelite annonce :
- Role attendu :
- Consommateurs directs :
- Consommateurs finaux :
- Tests existants :
- Conclusion audit :

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## Checklist README

### Fidelite de portage

- [ ] Le fichier garde le code C original comme source de verite.
- [ ] Les comportements critiques sont portes avant toute modernisation.
- [ ] L'ordre logique des appels correspond au source.
- [ ] Les branches speciales du source sont conservees.
- [ ] Les valeurs numeriques, flags, bitmasks et constantes sont identiques.
- [ ] Les conversions numeriques sont explicites.
- [ ] Les structures de donnees restent proches du source quand la fidelite compte.
- [ ] Les globals C sont remplaces par un runtime/contexte clair.
- [ ] Les ecarts volontaires sont documentes.

### Nommage, decoupage, rattachement

- [ ] Le nom du fichier preserve la tracabilite avec la source.
- [ ] Les fonctions portees conservent le style original.
- [ ] Les fonctions nouvelles utilisent `camelCase`.
- [ ] Les types/interfaces modernes utilisent `PascalCase`.
- [ ] Les constantes source conservent leurs noms et valeurs.
- [ ] Le fichier TS a une source C/H principale claire.
- [ ] Le rattachement est coherent avec `PORTAGE_QUAKE2.md`.
- [ ] Le fichier principal de rattachement est identifiable.
- [ ] Le decoupage ne masque pas la lecture du comportement original.
- [ ] Le fichier ne devient pas un fourre-tout.
- [ ] Les helpers nouveaux restent locaux et subordonnes au portage.

### Commentaires et documentation

- [ ] Le fichier a un header de module conforme.
- [ ] Le header indique `File`, `Source`, `Purpose`, `Porting policy`, `Deviations`, `Notes`.
- [ ] Les fonctions portees ont un header conforme.
- [ ] Les fonctions nouvelles ont un header conforme.
- [ ] Les deviations importantes sont documentees pres du code concerne.

### Separation runtime / adapter

- [ ] Le fichier ne melange pas logique moteur, rendu et UI.
- [ ] Un module `Strict` ou `Close` ne depend pas d'un module `Adapter`.
- [ ] `packages/platform` ne porte pas le comportement principal audite.
- [ ] `apps/web` ne porte pas le comportement principal audite.
- [ ] Les hooks remplacent seulement les appels renderer/audio/OS.

## Checklist ISO source

### Comparaison structurelle

- [ ] Les fonctions sources correspondantes ont ete lues.
- [ ] Les headers `.h` associes ont ete verifies.
- [ ] Les constantes utilisees viennent du bon header/source.
- [ ] Les structs source ont une representation TS equivalente.
- [ ] Les enums et flags conservent leurs valeurs.
- [ ] Les variables globales source ont un equivalent runtime clair.
- [ ] Les macros utiles sont portees ou documentees.
- [ ] Les chemins `#ifdef`, extensions ou variantes sont traites ou documentes.

### Comparaison comportementale

- [ ] Les entrees correspondent au source.
- [ ] Les sorties correspondent au source.
- [ ] Les mutations d'etat correspondent au source.
- [ ] Les retours anticipes sont conserves.
- [ ] Les boucles et leur ordre sont conserves.
- [ ] Les timings sont fideles.
- [ ] Les randomisations conservent l'intention source.
- [ ] Les listes/pools sont manipules comme dans le source.

### Effets secondaires

- [ ] Entites creees/liberees/linkees.
- [ ] `think`, `touch`, `use`, `nextthink` mis a jour.
- [ ] Etats runtime synchronises.
- [ ] Configstrings mises a jour.
- [ ] Temp entities mises a jour.
- [ ] Sons emis avec les bons parametres.
- [ ] Sorties renderer/audio correctement alimentees si applicable.

## Branchement

### Amont / aval

- [ ] Le fichier est appele depuis le bon systeme amont.
- [ ] Les appels remplacent bien le point d'appel source original.
- [ ] Les resultats sont consommes par le module attendu.
- [ ] Les donnees ne restent pas dans une structure intermediaire non lue.
- [ ] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

### Renderer et web

- [ ] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [ ] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [ ] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [ ] L'effet est visible/consomme et pas seulement present en memoire.

### Audio

- [ ] Si applicable, le son source est enregistre.
- [ ] Si applicable, l'evenement audio est emis et consomme correctement.

## Tests

- [ ] Les tests existants couvrent les fonctions principales.
- [ ] Les tests couvrent les effets secondaires.
- [ ] Les tests couvrent le branchement jusqu'au consommateur final.
- [ ] Les tests ne figent pas un comportement non ISO.
- [ ] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [ ] Tests a ajouter identifies.

## Findings

1. [Severite] Probleme
   - Fichier/ligne :
   - Source originale :
   - Impact :
   - Correction recommandee :

## Decision

- Corriger maintenant :
- Reporter :
- Documenter :

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour :
- Nouveau statut `Valide` :
- Fichier d'audit cree dans `Audit/` :
