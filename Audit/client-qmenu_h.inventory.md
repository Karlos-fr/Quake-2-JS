# Inventaire Portage Quake II - client/qmenu.h

Date : 2026-04-26

## Identification

- Source C/H principale : `Quake-2-master/client/qmenu.h`
- Sources C/H secondaires : `Quake-2-master/client/qmenu.c`, `Quake-2-master/client/keys.h`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/qmenu.ts`
- Fichiers TS secondaires pressentis : `packages/client/src/keys.ts`, `packages/client/src/index.ts`
- Domaine : client / framework menus partages
- Niveau de fidelite attendu : Strict pour constantes et structures header-visible ; Close pour callbacks et sorties renderer structurees.
- Statut actuel dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant cet audit

## Regles de rattachement

- Regle cible attendue : `1 fichier .h -> 1 fichier .ts`.
- Exception de decoupage documentee : les codes de touches `K_*` sont reemployes depuis `packages/client/src/keys.ts`, car `keys.h` / `keys.c` sont leur source principale dans le port.
- Justification si `1 fichier C != 1 fichier TS` : `packages/client/src/qmenu.ts` reste le point de rattachement principal de `qmenu.h` et `qmenu.c`; `keys.ts` ne fournit que les constantes clavier partagees.

## Inventaire source

### Fonctions

- [x] Nom : `Field_Key`
  - Source : `client/qmenu.h`, implementation `client/qmenu.c`
  - Role : traiter une touche dans un champ texte de menu.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : utilise contexte explicite pour `keydown` et presse-papiers.

- [x] Nom : `Menu_AddItem`
  - Source : `client/qmenu.h`
  - Role : ajouter un item a un menu et recalculer les slots.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : limite `MAXMENUITEMS` conservee.

- [x] Nom : `Menu_AdjustCursor`
  - Source : `client/qmenu.h`
  - Role : placer le curseur sur un item selectionnable.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : skip des separators conserve.

- [x] Nom : `Menu_Center`
  - Source : `client/qmenu.h`
  - Role : centrer verticalement un menu.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : utilise `context.state.vidHeight` au lieu de `viddef.height`.

- [x] Nom : `Menu_Draw`
  - Source : `client/qmenu.h`
  - Role : dessiner les items, curseur et statusbar.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : draw calls convertis en commandes capturees.

- [x] Nom : `Menu_ItemAtCursor`
  - Source : `client/qmenu.h`
  - Role : retourner l'item sous le curseur.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : `null` remplace `0`.

- [x] Nom : `Menu_SelectItem`
  - Source : `client/qmenu.h`
  - Role : activer action/champ selon type.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : listes et spincontrols retournent false comme le source actif.

- [x] Nom : `Menu_SetStatusBar`
  - Source : `client/qmenu.h`
  - Role : stocker le texte de statusbar du menu.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : `string | null`.

- [x] Nom : `Menu_SlideItem`
  - Source : `client/qmenu.h`
  - Role : appliquer une direction a slider/spincontrol.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : clamp conserve.

- [x] Nom : `Menu_TallySlots`
  - Source : `client/qmenu.h`
  - Role : compter les slots de curseur, avec expansion des listes.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : stop sur `null` dans `itemnames`.

- [x] Nom : `Menu_DrawString`, `Menu_DrawStringDark`, `Menu_DrawStringR2L`, `Menu_DrawStringR2LDark`
  - Source : `client/qmenu.h`
  - Role : primitives texte menu.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : fonctions publiques retournent une commande structuree testable.

### Structures / types

- [x] Nom : `menuframework_s`
  - Source : `client/qmenu.h`
  - Role : etat d'un menu et liste d'items.
  - Representation TS pressentie : `menuframework_s`
  - Statut : porte.
  - Notes : `items` taille `MAXMENUITEMS`, callbacks typés avec contexte.

- [x] Nom : `menucommon_s`
  - Source : `client/qmenu.h`
  - Role : bloc commun a tous les items.
  - Representation TS pressentie : `menucommon_s`
  - Statut : porte.
  - Notes : `localdata` en `Int32Array(4)`.

- [x] Nom : `menufield_s`
  - Source : `client/qmenu.h`
  - Role : champ texte edite par `Field_Key`.
  - Representation TS pressentie : `menufield_s`
  - Statut : porte.
  - Notes : buffer string immutable TS.

- [x] Nom : `menuslider_s`
  - Source : `client/qmenu.h`
  - Role : slider numerique.
  - Representation TS pressentie : `menuslider_s`
  - Statut : porte.
  - Notes : `minvalue`, `maxvalue`, `curvalue`, `range`.

- [x] Nom : `menulist_s`
  - Source : `client/qmenu.h`
  - Role : liste ou spincontrol selon `generic.type`.
  - Representation TS pressentie : `menulist_s`
  - Statut : porte.
  - Notes : `Array<string | null> | null`.

- [x] Nom : `menuaction_s`, `menuseparator_s`
  - Source : `client/qmenu.h`
  - Role : action simple et separator.
  - Representation TS pressentie : `menuaction_s`, `menuseparator_s`
  - Statut : porte.
  - Notes : wrapper autour de `menucommon_s`.

### Enums / constantes / flags / macros utiles

- [x] Nom : `MAXMENUITEMS`
  - Source : `client/qmenu.h`
  - Valeur / role : `64`.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : taille du tableau `items`.

- [x] Nom : `MTYPE_SLIDER`, `MTYPE_LIST`, `MTYPE_ACTION`, `MTYPE_SPINCONTROL`, `MTYPE_SEPARATOR`, `MTYPE_FIELD`
  - Source : `client/qmenu.h`
  - Valeur / role : `0`, `1`, `2`, `3`, `4`, `5`.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : valeurs verrouillees par test.

- [x] Nom : `K_TAB`, `K_ENTER`, `K_ESCAPE`, `K_SPACE`, `K_BACKSPACE`, `K_UPARROW`, `K_DOWNARROW`, `K_LEFTARROW`, `K_RIGHTARROW`
  - Source : `client/qmenu.h` / `client/keys.h`
  - Valeur / role : codes clavier utilises par menus.
  - Cible TS pressentie : `packages/client/src/keys.ts`, reexport `qmenu.ts`
  - Statut : porte.
  - Notes : source canonique clavier conservee dans `keys.ts`.

- [x] Nom : `QMF_LEFT_JUSTIFY`, `QMF_GRAYED`, `QMF_NUMBERSONLY`
  - Source : `client/qmenu.h`
  - Valeur / role : `0x1`, `0x2`, `0x4`.
  - Cible TS pressentie : `packages/client/src/qmenu.ts`
  - Statut : porte.
  - Notes : flags de rendu/champ.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `MAXMENUITEMS` | macro | `packages/client/src/qmenu.ts` | `MAXMENUITEMS` | Porte | Valeur `64`. |
| `MTYPE_*` | macros | `packages/client/src/qmenu.ts` | `MTYPE_*` | Porte | Valeurs identiques. |
| `QMF_*` | macros | `packages/client/src/qmenu.ts` | `QMF_*` | Porte | Valeurs identiques. |
| `K_*` utiles | macros | `packages/client/src/keys.ts`, `qmenu.ts` | `K_*` | Porte | Reexportes. |
| `menuframework_s` | struct | `packages/client/src/qmenu.ts` | `menuframework_s`, `createMenuFramework` | Porte | Items fixes. |
| `menucommon_s` | struct | `packages/client/src/qmenu.ts` | `menucommon_s`, `createMenuCommon` | Porte | Callbacks contextualises. |
| `menufield_s` | struct | `packages/client/src/qmenu.ts` | `menufield_s`, `createMenuField` | Porte | Buffer string. |
| `menuslider_s` | struct | `packages/client/src/qmenu.ts` | `menuslider_s`, `createMenuSlider` | Porte | Slider complet. |
| `menulist_s` | struct | `packages/client/src/qmenu.ts` | `menulist_s`, `createMenuList` | Porte | List/spincontrol. |
| `menuaction_s`, `menuseparator_s` | structs | `packages/client/src/qmenu.ts` | factories dediees | Porte | Wrappers generic. |
| `Field_Key`, `Menu_*` | fonctions | `packages/client/src/qmenu.ts` | memes noms | Porte et branche | Reexport facade. |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/qmenu.ts`
- Client : `packages/client/src/menu*.ts`, `packages/client/src/vid-menu.ts`, `packages/client/src/index.ts`
- Server : non applicable
- Renderer common : sorties structurees menu, pas port principal
- Renderer three : consomme indirectement via menu/web
- Web / platform : `apps/web/src/full-game.ts` via menus client
- Audio : non applicable
- Tests existants : `scripts/verify/quake2-qmenu-header.ts`, `scripts/verify/quake2-qmenu.ts`, `scripts/verify/quake2-menu.ts`
