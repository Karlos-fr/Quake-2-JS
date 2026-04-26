# Audit Portage Quake II - client/qmenu.h

Date : 2026-04-26

## Verdict

Statut : OK ISO branche
Risque principal : faible ; le header est rattache au port complet de `qmenu.c`, avec sorties renderer-neutral documentees et tests dedies.

## Source verifiee

- Source C/H : `Quake-2-master/client/qmenu.h`, avec verification croisee de `Quake-2-master/client/qmenu.c`
- Port TS : `packages/client/src/qmenu.ts`
- Consommateurs : `packages/client/src/index.ts`, `packages/client/src/menu*.ts`, `packages/client/src/vid-menu.ts`

## Fiche d'identification

- Fichier audite : `client/qmenu.h`
- Source C/H principale : `Quake-2-master/client/qmenu.h`
- Sources C/H secondaires : `Quake-2-master/client/qmenu.c`, `Quake-2-master/client/keys.h`
- Package : `packages/client`
- Type de fichier : header framework menu
- Statut dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant mise a jour
- Niveau de fidelite annonce : Strict / Close selon symbole
- Role attendu : exposer constantes, types et fonctions publiques du framework menu.
- Consommateurs directs : `packages/client/src/qmenu.ts`, `packages/client/src/index.ts`, modules menu client
- Consommateurs finaux : menu principal/options/multiplayer/player config/video, web runtime
- Tests existants : `npm run verify:qmenu:header`, `npm run verify:qmenu`
- Conclusion audit : OK ISO branche

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `MAXMENUITEMS` | macro | `packages/client/src/qmenu.ts` | `MAXMENUITEMS` | OK | Valeur `64`. |
| `MTYPE_*` | macros | `packages/client/src/qmenu.ts` | `MTYPE_*` | OK | Valeurs `0..5`. |
| `K_*` menu | macros | `packages/client/src/keys.ts`, `qmenu.ts` | `K_*` | OK | Reexport depuis la source clavier canonique. |
| `QMF_*` | macros | `packages/client/src/qmenu.ts` | `QMF_*` | OK | Valeurs hex identiques. |
| `menuframework_s` | struct | `packages/client/src/qmenu.ts` | `menuframework_s` | OK avec ecart | Callbacks prennent un contexte explicite. |
| `menucommon_s` | struct | `packages/client/src/qmenu.ts` | `menucommon_s` | OK avec ecart | `localdata` en `Int32Array(4)`. |
| `menufield_s` | struct | `packages/client/src/qmenu.ts` | `menufield_s` | OK avec ecart | Buffer string immutable. |
| `menuslider_s` | struct | `packages/client/src/qmenu.ts` | `menuslider_s` | OK | Champs preserves. |
| `menulist_s` | struct | `packages/client/src/qmenu.ts` | `menulist_s` | OK avec ecart | `itemnames` nullable. |
| `menuaction_s`, `menuseparator_s` | structs | `packages/client/src/qmenu.ts` | memes noms | OK | Wrappers preserves. |
| `Field_Key` | fonction | `packages/client/src/qmenu.ts` | `Field_Key` | OK | Keypad, paste, backspace, numbers-only. |
| `Menu_AddItem` / `Menu_AdjustCursor` / `Menu_Center` / `Menu_Draw` | fonctions | `packages/client/src/qmenu.ts` | memes noms | OK branche | Comportement source couvert. |
| `Menu_ItemAtCursor` / `Menu_SelectItem` / `Menu_SetStatusBar` / `Menu_SlideItem` / `Menu_TallySlots` | fonctions | `packages/client/src/qmenu.ts` | memes noms | OK | Surface publique conservee. |
| `Menu_DrawString*` | fonctions | `packages/client/src/qmenu.ts` | memes noms | OK avec ecart | Commandes structurees au lieu de draw immediat. |

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
- [x] Les chemins `#ifdef`, extensions ou variantes sont traites ou documentes. Include guard non applicable en TS.

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
- [x] Configstrings mises a jour. N/A.
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
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`. N/A direct.
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
   - Source originale : `client/qmenu.h`
   - Impact : N/A
   - Correction recommandee : N/A

## Decision

- Corriger maintenant : non
- Reporter : non
- Documenter : ecarts contexte explicite et sorties renderer-neutral documentes.

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : oui
- Nouveau statut `Valide` : ✅
- Fichier d'audit cree dans `Audit/` : `Audit/client-qmenu_h.audit.md`
