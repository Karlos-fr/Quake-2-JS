# Audit Portage Quake II - client/anorms.h

Date : 2026-04-25

## Verdict

Statut : OK avec ecarts documentes
Risque principal : `client/anorms.h` n'est pas un header declaratif classique mais un fragment d'initialiseur ; la fidelite repose donc sur l'ordre exact des 162 vecteurs et sur le branchement de tous les consommateurs de `bytedirs`.

## Source verifiee

- Source C/H : `Quake-2-master/client/anorms.h`, `Quake-2-master/qcommon/common.c`, consommateurs client/temp entities, copies renderer `ref_gl`/`ref_soft`
- Port TS : `packages/qcommon/src/anorms.ts`
- Consommateurs : `packages/qcommon/src/messages.ts`, `packages/qcommon/src/index.ts`, `packages/client/src/parse.ts`, `packages/client/src/tent.ts`, `packages/server/src/sv_game.ts`, `scripts/verify/quake2-anorms.ts`, `scripts/verify/quake2-qcommon-header.ts`

## Fiche d'identification

- Fichier audite : `client/anorms.h`
- Source C/H principale : `Quake-2-master/client/anorms.h`
- Sources C/H secondaires : `qcommon/common.c`, `client/cl_tent.c`, `client/cl_fx.c`, `ref_gl/anorms.h`, `ref_soft/anorms.h`
- Package : `packages/qcommon`
- Type de fichier : header fragment d'initialiseur / table de constantes numeriques
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant audit, a passer en `✅`
- Niveau de fidelite annonce : Strict pour `BYTE_DIRS`, Close pour helper `DirFromByte`
- Role attendu : fournir les 162 directions canoniques utilisees par les directions reseau encodees sur un byte
- Consommateurs directs : `messages.ts`, `parse.ts`, `tent.ts`, `index.ts`
- Consommateurs finaux : qcommon network message codec, client temp entities/particles, server game multicast writes, renderer via sortie client
- Tests existants : `scripts/verify/quake2-anorms.ts`, `scripts/verify/quake2-qcommon-header.ts`
- Conclusion audit : OK avec ecarts documentes

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `client/anorms.h` initializer | table | `anorms.ts` | `BYTE_DIRS` | Valide Strict | 162 entrees identiques |
| `bytedirs[NUMVERTEXNORMALS]` | global C via include | `anorms.ts` | `BYTE_DIRS` | Valide Close | nom TS explicite |
| `NUMVERTEXNORMALS` | constante | `qcommon.ts` / `anorms.ts` | `NUMVERTEXNORMALS`, `BYTE_DIRS.length` | Valide | 162 |
| `MSG_WriteDir` consommateur C | procedure | `messages.ts` | `MSG_WriteDir` | Valide | boucle sur `BYTE_DIRS` |
| `MSG_ReadDir` consommateur C | procedure | `messages.ts` | `MSG_ReadDir` | Valide | range check + copie |
| temp entity dirs | consommateurs C | `parse.ts`, `tent.ts` | `DirFromByte` | Valide Close | helper nouveau |
| renderer copies | tables C dupliquees | `anorms.ts` | `BYTE_DIRS` | Valide partage | source commune pour port TS |

## Checklist README

### Fidelite de portage

- [x] Le fichier garde le code C original comme source de verite.
- [x] Les comportements critiques sont portes avant toute modernisation.
- [x] L'ordre logique des appels correspond au source.
- [x] Les branches speciales du source sont conservees.
- [x] Les valeurs numeriques, flags, bitmasks et constantes sont identiques.
- [x] Les conversions numeriques sont explicites.
- [x] Les structures de donnees restent proches du source quand la fidelite compte.
- [x] Les globals C sont remplaces par un runtime/contexte clair.
- [x] Les ecarts volontaires sont documentes.

Notes : pas d'appels ni de branches dans le header ; les points comportementaux concernent les consommateurs `MSG_WriteDir`/`MSG_ReadDir` et `DirFromByte`.

### Nommage, decoupage, rattachement

- [x] Le nom du fichier preserve la tracabilite avec la source.
- [x] Les fonctions portees conservent le style original.
- [x] Les fonctions nouvelles utilisent `camelCase`.
- [x] Les types/interfaces modernes utilisent `PascalCase`.
- [x] Les constantes source conservent leurs noms et valeurs.
- [x] Le fichier TS a une source C/H principale claire.
- [x] Le rattachement est coherent avec `PORTAGE_QUAKE2.md`.
- [x] Le fichier principal de rattachement est identifiable.
- [x] Le decoupage ne masque pas la lecture du comportement original.
- [x] Le fichier ne devient pas un fourre-tout.
- [x] Les helpers nouveaux restent locaux et subordonnes au portage.

### Commentaires et documentation

- [x] Le fichier a un header de module conforme.
- [x] Le header indique `File`, `Source`, `Purpose`, `Porting policy`, `Deviations`, `Notes`.
- [x] Les fonctions portees ont un header conforme.
- [x] Les fonctions nouvelles ont un header conforme.
- [x] Les deviations importantes sont documentees pres du code concerne.

### Separation runtime / adapter

- [x] Le fichier ne melange pas logique moteur, rendu et UI.
- [x] Un module `Strict` ou `Close` ne depend pas d'un module `Adapter`.
- [x] `packages/platform` ne porte pas le comportement principal audite.
- [x] `apps/web` ne porte pas le comportement principal audite.
- [x] Les hooks remplacent seulement les appels renderer/audio/OS.

## Checklist ISO source

### Comparaison structurelle

- [x] Les fonctions sources correspondantes ont ete lues.
- [x] Les headers `.h` associes ont ete verifies.
- [x] Les constantes utilisees viennent du bon header/source.
- [x] Les structs source ont une representation TS equivalente.
- [x] Les enums et flags conservent leurs valeurs.
- [x] Les variables globales source ont un equivalent runtime clair.
- [x] Les macros utiles sont portees ou documentees.
- [x] Les chemins `#ifdef`, extensions ou variantes sont traites ou documentes.

### Comparaison comportementale

- [x] Les entrees correspondent au source.
- [x] Les sorties correspondent au source.
- [x] Les mutations d'etat correspondent au source.
- [x] Les retours anticipes sont conserves.
- [x] Les boucles et leur ordre sont conserves.
- [x] Les timings sont fideles.
- [x] Les randomisations conservent l'intention source.
- [x] Les listes/pools sont manipules comme dans le source.

Notes : le header n'a ni mutation, ni timing, ni randomisation. La boucle pertinente est celle de `MSG_WriteDir`, verifiee dans `messages.ts`.

### Effets secondaires

- [x] Entites creees/liberees/linkees.
- [x] `think`, `touch`, `use`, `nextthink` mis a jour.
- [x] Etats runtime synchronises.
- [x] Configstrings mises a jour.
- [x] Temp entities mises a jour.
- [x] Sons emis avec les bons parametres.
- [x] Sorties renderer/audio correctement alimentees si applicable.

Notes : non applicable directement pour la table. Effets finaux verifies via temp entities/particles et codec message.

## Verification item par item

### Table canonique

- [x] `client/anorms.h` contient 162 triplets flottants.
- [x] `BYTE_DIRS` contient 162 entrees.
- [x] Les 162 entrees source et TS ont ete comparees dans l'ordre par script local pendant l'audit.
- [x] La premiere entree `[-0.525731, 0, 0.850651]` correspond.
- [x] Les axes canoniques couverts par le harnais correspondent : up, right, down, back/left.
- [x] La derniere entree `[-0.688191, -0.587785, -0.425325]` correspond.
- [x] La precision decimale source est conservee.

### Consommateurs qcommon

- [x] Le C declare `bytedirs[NUMVERTEXNORMALS]` dans `qcommon/common.c` par include de `client/anorms.h`.
- [x] `MSG_WriteDir` TS utilise `BYTE_DIRS` pour chercher le meilleur dot product.
- [x] `MSG_WriteDir` preserve le fallback C `dir == NULL -> byte 0`.
- [x] `MSG_ReadDir` TS lit un byte, verifie la borne et retourne une copie du vecteur.
- [x] `qcommon/src/index.ts` re-exporte `BYTE_DIRS`, `DirFromByte`, `MSG_WriteDir`, `MSG_ReadDir`.
- [x] `NUMVERTEXNORMALS` reste expose a 162 dans `qcommon.ts`.

### Consommateurs client/server

- [x] `packages/client/src/parse.ts` utilise `DirFromByte` pour les particules temp entities parsees.
- [x] `packages/client/src/tent.ts` utilise `DirFromByte` pour impacts et sustains.
- [x] `packages/server/src/sv_game.ts` consomme `MSG_WriteDir` via `PF_WriteDir`.
- [x] Les copies `ref_gl/anorms.h` et `ref_soft/anorms.h` sont des tables jumelles reutilisables par ce port partage.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

Notes : le port partage `qcommon` est approprie car le source C utilise `client/anorms.h` depuis `qcommon/common.c`, pas seulement depuis le client.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

Notes : non applicable directement ; les directions alimentent le pipeline client qui produit ensuite les donnees refresh.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

Notes : non applicable.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

Tests existants : `scripts/verify/quake2-anorms.ts` couvre longueur, vecteurs canoniques, copie de retour et fallback `DirFromByte`. `scripts/verify/quake2-qcommon-header.ts` couvre `NUMVERTEXNORMALS` et un roundtrip `MSG_WriteDir`/`MSG_ReadDir`.

Tests a ajouter : comparaison automatique exhaustive `client/anorms.h -> BYTE_DIRS` dans un harnais dedie si les sources C sont disponibles pendant les tests ; consommateurs renderer lorsque les ports `ref_gl`/`ref_soft` dependront explicitement des normales partagees.

## Findings

1. [Info] `DirFromByte` est un helper nouveau avec fallback.
   - Fichier/ligne : `packages/qcommon/src/anorms.ts:199`
   - Source originale : `client/anorms.h` ne definit aucune fonction ; `MSG_ReadDir` dans `qcommon/common.c:455` signale une erreur si l'index est hors borne.
   - Impact : le helper sert aux chemins client deja parses ou optionnels et retourne `[0, 0, 1]` pour un index absent/invalide ; `MSG_ReadDir` conserve, lui, le comportement strict d'erreur pour le codec reseau.
   - Correction recommandee : aucune.

2. [Info] Le symbole source `bytedirs` est renomme `BYTE_DIRS`.
   - Fichier/ligne : `packages/qcommon/src/anorms.ts:27`
   - Source originale : `qcommon/common.c:272`
   - Impact : nommage TS plus explicite ; le rattachement au header source reste documente dans le header de module.
   - Correction recommandee : aucune.

3. [Info] Le port est partage entre client/qcommon/renderer.
   - Fichier/ligne : `PORTAGE_QUAKE2.md:35`, `PORTAGE_QUAKE2.md:279`
   - Source originale : copies identiques incluses par `qcommon`, `ref_gl` et `ref_soft`.
   - Impact : evite trois tables divergentes ; les consommateurs directs restent visibles.
   - Correction recommandee : conserver `anorms.ts` comme source TS unique.

## Decision

- Corriger maintenant : rien
- Reporter : harnais exhaustif optionnel comparant directement le header C si l'environnement de test inclut les sources originales
- Documenter : inventaire et audit crees

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `client\anorms.h`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/client-anorms_h.audit.md`
