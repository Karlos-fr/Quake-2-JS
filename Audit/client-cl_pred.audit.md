# Audit Portage Quake II - client/cl_pred.c

Date : 2026-04-26

## Verdict

Statut : OK ISO branche
Risque principal : moyen-faible ; le comportement depend du `pmove` et de la collision BSP partages, mais les chemins critiques sont testes sur cas synthetiques et BSP reel.

## Source verifiee

- Source C/H : `Quake-2-master/client/cl_pred.c`
- Port TS : `packages/client/src/view.ts`
- Consommateurs : `packages/client/src/parse.ts`, `packages/client/src/local-session.ts`, `packages/client/src/local-gameplay-sync.ts`, `apps/web/src/local-client-controller.ts`

## Fiche d'identification

- Fichier audite : `client/cl_pred.c`
- Source C/H principale : `Quake-2-master/client/cl_pred.c`
- Sources C/H secondaires : `Quake-2-master/client/client.h`, `Quake-2-master/game/q_shared.h`
- Package : `packages/client`
- Type de fichier : prediction client et collision mouvement
- Statut dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant mise a jour
- Niveau de fidelite annonce : Close / Strict selon symbole
- Role attendu : reproduire prediction client Quake II, traces prediction et correction d'erreur.
- Consommateurs directs : `packages/client/src/view.ts`, `packages/client/src/parse.ts`, `packages/client/src/local-session.ts`
- Consommateurs finaux : camera locale web, refresh client, gameplay sync local
- Tests existants : `npm run verify:cl-pred`, `npm run verify:client:pmove:viewheight`, `npm run verify:pmove:local-bmodel`
- Conclusion audit : OK ISO branche

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `CL_CheckPredictionError` | fonction | `packages/client/src/view.ts` | `CL_CheckPredictionError` | OK | Reset teleport, smoothing, debug `showmiss`. |
| `CL_ClipMoveToEntities` | fonction | `packages/client/src/view.ts` | `CL_ClipMoveToEntities` | OK | Exclusion joueur, bmodel `31`, bbox encodee. |
| `CL_PMTrace` | fonction | `packages/client/src/view.ts` | `CL_PMTrace` | OK | `CM_BoxTrace` puis entites. |
| `CL_PMpointcontents` | fonction | `packages/client/src/view.ts` | `CL_PMpointcontents` | OK | Contents monde OR bmodels. |
| `CL_PredictMovement` | fonction | `packages/client/src/view.ts` | `CL_PredictMovement` | OK | Branches `ca_active`, pause, no prediction, `CMD_BACKUP`, boucle `Pmove`. |
| `CMD_BACKUP` | macro | `packages/client/src/types.ts` | `CMD_BACKUP` | OK | Valeur `64`. |
| `predicted_origins` | state | `packages/client/src/types.ts` | `cl.predicted_origins` | OK | Taille `CMD_BACKUP`. |
| `MASK_PLAYERSOLID` | macro | `packages/qcommon/src/q-shared.ts` | `MASK_PLAYERSOLID` | OK | Trace prediction. |
| `PMF_NO_PREDICTION` / `PMF_ON_GROUND` | flags | `packages/qcommon/src/q-shared.ts` | memes noms | OK | Branches conservees. |
| `CS_AIRACCEL` | macro | `packages/qcommon/src/q-shared.ts` | `CS_AIRACCEL` | OK | Alimente `pm_airaccelerate`. |
| `Pmove` | appel partage | `packages/qcommon/src/pmove.ts` | `Pmove` | OK branche | Reutilise par prediction. |

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
- [x] Les chemins `#ifdef`, extensions ou variantes sont traites ou documentes. N/A.

### Comparaison comportementale

- [x] Les entrees correspondent au source.
- [x] Les sorties correspondent au source.
- [x] Les mutations d'etat correspondent au source.
- [x] Les retours anticipes sont conserves.
- [x] Les boucles et leur ordre sont conserves.
- [x] Les timings sont fideles.
- [x] Les randomisations conservent l'intention source. N/A.
- [x] Les listes/pools sont manipules comme dans le source.

### Effets secondaires

- [x] Entites creees/liberees/linkees. N/A.
- [x] `think`, `touch`, `use`, `nextthink` mis a jour. N/A.
- [x] Etats runtime synchronises.
- [x] Configstrings mises a jour. `CS_AIRACCEL` consomme.
- [x] Temp entities mises a jour. N/A.
- [x] Sons emis avec les bons parametres. N/A.
- [x] Sorties renderer/audio correctement alimentees si applicable.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`. N/A direct.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`. Indirect via refresh/camera.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

### Audio

- [x] Si applicable, le son source est enregistre. N/A.
- [x] Si applicable, l'evenement audio est emis et consomme correctement. N/A.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies. Aucun test bloquant a ajouter apres correction `showmiss`.

## Findings

1. [Mineur] La branche debug `cl_showmiss` etait declaree par option mais sans sortie observable.
   - Fichier/ligne : `packages/client/src/view.ts`
   - Source originale : `client/cl_pred.c`
   - Impact : ecart mineur de diagnostic sur miss prediction et depassement `CMD_BACKUP`.
   - Correction recommandee : fait, ajout de `onPredictionMessage` optionnel et assertions dans `scripts/verify/quake2-cl-pred.ts`.

## Decision

- Corriger maintenant : oui, branche debug `showmiss` restauree.
- Reporter : non
- Documenter : helpers de collision/prediction explicites et partage `pmove` documentes.

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : oui
- Nouveau statut `Valide` : ✅
- Fichier d'audit cree dans `Audit/` : `Audit/client-cl_pred.audit.md`
