# Audit Portage Quake II - client/screen.h

Date : 2026-04-25

## Verdict

Statut : OK ISO branche
Risque principal : faible a moyen ; les sorties renderer/audio/IO sont volontairement exposees sous forme de snapshots et hooks, mais les etats et points d'entree du header sont bien rattaches.

## Source verifiee

- Source C/H : `Quake-2-master/client/screen.h`, avec verification croisee de `Quake-2-master/client/cl_scrn.c` et `Quake-2-master/client/cl_cin.c`
- Port TS : `packages/client/src/screen.ts`, `packages/client/src/types.ts`, `packages/client/src/cinematic.ts`
- Consommateurs : `packages/client/src/index.ts`, `packages/client/src/input.ts`, `packages/client/src/view.ts`, renderer HUD, hooks server/web/audio

## Fiche d'identification

- Fichier audite : `client/screen.h`
- Source C/H principale : `Quake-2-master/client/screen.h`
- Sources C/H secondaires : `Quake-2-master/client/cl_scrn.c`, `Quake-2-master/client/cl_cin.c`, `Quake-2-master/client/client.h`
- Package : `packages/client`
- Type de fichier : header mixte screen/HUD/cinematic
- Statut dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant mise a jour
- Niveau de fidelite annonce : Close / Strict selon symbole
- Role attendu : exposer les procedures screen publiques, les etats globaux screen et la facade cinematic.
- Consommateurs directs : `packages/client/src/index.ts`, `packages/client/src/input.ts`, `packages/client/src/view.ts`
- Consommateurs finaux : renderer HUD, web/platform, audio cinematic via hooks, serveur via loading plaque hook
- Tests existants : `npm run verify:screen:header`, `npm run verify:cl-scrn`
- Conclusion audit : OK ISO branche

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `SCR_Init` | fonction | `packages/client/src/screen.ts` | `SCR_Init` | OK | Cvars/commandes screen. |
| `SCR_UpdateScreen` | fonction | `packages/client/src/screen.ts` | `SCR_UpdateScreen` | OK avec ecart | Produit un `ClientScreenFrame`. |
| `SCR_SizeUp` | fonction | `packages/client/src/screen.ts` | `SCR_SizeUp` | OK | `viewsize += 10`. |
| `SCR_SizeDown` | fonction | `packages/client/src/screen.ts` | `SCR_SizeDown` | OK | `viewsize -= 10`. |
| `SCR_CenterPrint` | fonction | `packages/client/src/screen.ts` | `SCR_CenterPrint` | OK | Timing et lignes conserves. |
| `SCR_BeginLoadingPlaque` | fonction | `packages/client/src/screen.ts` | `SCR_BeginLoadingPlaque` | OK | Flags loading et disable screen. |
| `SCR_EndLoadingPlaque` | fonction | `packages/client/src/screen.ts` | `SCR_EndLoadingPlaque` | OK | Clear state. |
| `SCR_DebugGraph` | fonction | `packages/client/src/screen.ts` | `SCR_DebugGraph` | OK | Ring buffer graph. |
| `SCR_TouchPics` | fonction | `packages/client/src/screen.ts` | `SCR_TouchPics` | OK | Crosshair state. |
| `SCR_RunConsole` | fonction | `packages/client/src/screen.ts` | `SCR_RunConsole` | OK avec ecart | `keyDest` explicite. |
| `SCR_AddDirtyPoint` | fonction | `packages/client/src/screen.ts` | `SCR_AddDirtyPoint` | OK | Dirty rect conserve. |
| `SCR_DirtyScreen` | fonction | `packages/client/src/screen.ts` | `SCR_DirtyScreen` | OK avec ecart | Dimensions explicites. |
| bloc `SCR_*Cinematic` | fonctions | `packages/client/src/screen.ts`, `packages/client/src/cinematic.ts` | `SCR_PlayCinematic`, `SCR_DrawCinematic`, `SCR_RunCinematic`, `SCR_StopCinematic`, `SCR_FinishCinematic` | OK avec ecart | Facade stable, implementation dediee. |
| `scr_con_current`, `scr_conlines`, `sb_lines`, `scr_vrect`, `crosshair_*` | globals | `packages/client/src/types.ts` | `client_screen_state_t` | OK | Globals remplaces par runtime. |
| `scr_viewsize`, `crosshair` | cvars | `packages/client/src/screen.ts` | `ClientScreenContext` | OK | Resolus dans `SCR_Init`. |

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
- [x] Sons emis avec les bons parametres. Hooks cinematic verifies.
- [x] Sorties renderer/audio correctement alimentees si applicable.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

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
   - Source originale : `client/screen.h`
   - Impact : N/A
   - Correction recommandee : N/A

## Decision

- Corriger maintenant : non
- Reporter : non
- Documenter : les ecarts renderer-neutral/audio-hook et le decoupage `cinematic.ts` sont documentes.

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : oui
- Nouveau statut `Valide` : ✅
- Fichier d'audit cree dans `Audit/` : `Audit/client-screen_h.audit.md`
