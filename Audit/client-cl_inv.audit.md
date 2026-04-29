# Audit Portage Quake II - client/cl_inv.c

Date : 2026-04-26

## Verdict

Statut : OK ISO branche
Risque principal : faible ; le chemin runtime dispose maintenant des appels renderer immediats via `refexport_t`, et les commandes HUD restent conservees pour snapshots/tests avec injection explicite des bindings clavier.

## Source verifiee

- Source C/H : `Quake-2-master/client/cl_inv.c`
- Port TS : `packages/client/src/inventory.ts`, `packages/client/src/parse.ts`
- Consommateurs : `packages/client/src/screen.ts`, `apps/web/src/web-demo-loop.ts`, `packages/renderer-three/src/gl-draw.ts`, `packages/renderer-three/src/three-gl-draw-adapter.ts`

## Fiche d'identification

- Fichier audite : `client/cl_inv.c`
- Source C/H principale : `Quake-2-master/client/cl_inv.c`
- Sources C/H secondaires : `Quake-2-master/client/client.h`, `Quake-2-master/game/q_shared.h`
- Package : `packages/client`
- Type de fichier : source client parsing inventaire + overlay HUD
- Statut dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant mise a jour
- Niveau de fidelite annonce : Strict / Close selon symbole
- Role attendu : lire l'inventaire reseau et dessiner l'overlay inventaire Quake II.
- Consommateurs directs : `packages/client/src/parse.ts`, `packages/client/src/screen.ts`, `packages/client/src/index.ts`
- Consommateurs finaux : runtime HUD via `SCR_DrawHudRef` / `refexport_t` / `gl_draw.ts`, snapshots/tests via commandes HUD
- Tests existants : `npm run verify:screen:header`, `npm run verify:gl-draw`, `npm run verify:three-gl-draw-adapter`
- Conclusion audit : OK ISO branche

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `CL_ParseInventory` | fonction | `packages/client/src/parse.ts` | `CL_ParseInventory` | OK | Lit `MAX_ITEMS` shorts et mute `runtime.cl.inventory`. |
| `Inv_DrawString` | fonction | `packages/client/src/inventory.ts` | `Inv_DrawString`, `Inv_DrawStringRef` | OK branche | Conserve le chemin commandes pour snapshots et le chemin immediat `ref.DrawChar` pour le runtime. |
| `SetStringHighBit` | fonction | `packages/client/src/inventory.ts` | `SetStringHighBit` | OK avec ecart | Retourne une nouvelle chaine au lieu de muter un buffer C. |
| `CL_DrawInventory` | fonction | `packages/client/src/inventory.ts` | `CL_DrawInventory`, `CL_DrawInventoryRef` | OK branche | Conserve selection, scroll, header, high-bit et curseur clignotant. |
| `DISPLAY_ITEMS` | macro | `packages/client/src/inventory.ts` | `DISPLAY_ITEMS` | OK | Valeur `17`. |
| `MAX_ITEMS` | macro | `packages/qcommon/src/q-shared.ts` | `MAX_ITEMS` | OK | Valeur `256`. |
| `STAT_SELECTED_ITEM` | macro | `packages/qcommon/src/q-shared.ts` | `STAT_SELECTED_ITEM` | OK | Valeur `12`. |
| `STAT_LAYOUTS` | macro | `packages/qcommon/src/q-shared.ts` | `STAT_LAYOUTS` | OK | Valeur `13`, bit `2` consomme par `screen.ts`. |
| `CS_ITEMS` | macro | `packages/qcommon/src/q-shared.ts` | `CS_ITEMS` | OK | Base des noms d'items. |
| `svc_inventory` | opcode | `packages/qcommon/src/protocol.ts`, `packages/client/src/parse.ts` | `svc_inventory`, dispatch parse | OK branche | Arrive jusqu'a `CL_ParseInventory`. |

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
- [x] Les timings sont fideles. `cls.realtime * 10` conserve pour le curseur clignotant.
- [x] Les randomisations conservent l'intention source. N/A.
- [x] Les listes/pools sont manipules comme dans le source.

### Effets secondaires

- [x] Entites creees/liberees/linkees. N/A.
- [x] `think`, `touch`, `use`, `nextthink` mis a jour. N/A.
- [x] Etats runtime synchronises.
- [x] Configstrings mises a jour. N/A dans ce fichier, mais `CS_ITEMS` consomme.
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

- [x] Si applicable, les sorties renderer-neutral restent disponibles pour snapshots/tests.
- [x] Si applicable, les sorties runtime sont raccordees a `packages/renderer-three` via `refexport_t` / `gl_draw.ts`.
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
- [x] Tests a ajouter identifies. Aucun test bloquant a ajouter pour ce fichier.

## Findings

1. [Info] Le port est conforme avec chemin runtime `refexport_t` et ecarts documentes de rendu renderer-neutral pour tests.
   - Fichier/ligne : `packages/client/src/inventory.ts`
   - Source originale : `client/cl_inv.c`
   - Impact : pas de correction requise ; `re.DrawChar` et `re.DrawPic` sont executes via `CL_DrawInventoryRef` en runtime, et representes par commandes HUD pour les snapshots/tests.
   - Correction recommandee : aucune.

## Decision

- Corriger maintenant : non, aucun ecart bloquant.
- Reporter : non
- Documenter : inventaire et audit crees ; ligne `PORTAGE_QUAKE2.md` a valider.

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : oui
- Nouveau statut `Valide` : ✅
- Fichier d'audit cree dans `Audit/` : `Audit/client-cl_inv.audit.md`
