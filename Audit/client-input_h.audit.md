# Audit Portage Quake II - client/input.h

Date : 2026-04-25

## Verdict

Statut : OK ISO branche
Risque principal : faible ; le header original ne contient que des declarations externes, portees comme forwards vers hooks explicites.

## Source verifiee

- Source C/H : `Quake-2-master/client/input.h`, avec verification du consommateur `Quake-2-master/client/cl_input.c`
- Port TS : `packages/client/src/input-device.ts`
- Consommateurs : `packages/client/src/input.ts`, `packages/client/src/index.ts`, `scripts/verify/quake2-input-header.ts`, `scripts/verify/quake2-cl-input.ts`

## Fiche d'identification

- Fichier audite : `client/input.h`
- Source C/H principale : `Quake-2-master/client/input.h`
- Sources C/H secondaires : `Quake-2-master/client/cl_input.c`, `Quake-2-master/client/client.h`
- Package : `packages/client`
- Type de fichier : header declaratif
- Statut dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : valide
- Niveau de fidelite annonce : Close
- Role attendu : exposer les points d'entree des peripheriques non-clavier et le hook `IN_Move(usercmd_t *cmd)` consomme par `cl_input.c`.
- Consommateurs directs : `packages/client/src/input.ts`, `packages/client/src/index.ts`
- Consommateurs finaux : construction des `usercmd_t` client, adapters plateforme d'entree via hooks
- Tests existants : `npm run verify:input:header`, `npm run verify:cl-input`
- Conclusion audit : OK ISO branche

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `IN_Init(void)` | fonction | `packages/client/src/input-device.ts` | `IN_Init` | OK | Forward vers `onInit`. |
| `IN_Shutdown(void)` | fonction | `packages/client/src/input-device.ts` | `IN_Shutdown` | OK | Forward vers `onShutdown`. |
| `IN_Commands(void)` | fonction | `packages/client/src/input-device.ts` | `IN_Commands` | OK | Forward vers `onCommands`. |
| `IN_Frame(void)` | fonction | `packages/client/src/input-device.ts` | `IN_Frame` | OK | Forward vers `onFrame`. |
| `IN_Move(usercmd_t *cmd)` | fonction | `packages/client/src/input-device.ts` | `IN_Move` | OK | Meme objet `usercmd_t` transmis au hook. |
| `IN_Activate(qboolean active)` | fonction | `packages/client/src/input-device.ts` | `IN_Activate` | OK | `qboolean` conserve au bord public. |
| commentaire command buffer | contrat | `packages/client/src/input-device.ts` | `onCommands` | OK | Separation command injection / frame conservee. |
| commentaire movement addition | contrat | `packages/client/src/input.ts` | `CL_CreateCmd -> IN_Move` | OK | Mouvement externe ajoute apres `CL_BaseMove`. |

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

### Effets secondaires

- [x] Entites creees/liberees/linkees. N/A.
- [x] `think`, `touch`, `use`, `nextthink` mis a jour. N/A.
- [x] Etats runtime synchronises.
- [x] Configstrings mises a jour. N/A.
- [x] Temp entities mises a jour. N/A.
- [x] Sons emis avec les bons parametres. N/A.
- [x] Sorties renderer/audio correctement alimentees si applicable. N/A.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`. N/A.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`. N/A.
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
- [x] Tests a ajouter identifies. Aucun test bloquant a ajouter pour ce header.

## Findings

1. [Info] Aucun finding bloquant.
   - Fichier/ligne : N/A
   - Source originale : `client/input.h`
   - Impact : N/A
   - Correction recommandee : N/A

## Decision

- Corriger maintenant : non
- Reporter : non
- Documenter : le remplacement des backends globaux par hooks explicites est deja documente dans `input-device.ts` et dans cet audit.

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : non, deja valide avant cet audit et worktree deja modifie.
- Nouveau statut `Valide` : inchange, valide
- Fichier d'audit cree dans `Audit/` : `Audit/client-input_h.audit.md`
