# Inventaire Portage Quake II - client/vid.h

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/client/vid.h`
- Sources C/H secondaires : `Quake-2-master/client/screen.h`, `Quake-2-master/win32/vid_menu.c`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/vid.ts`
- Fichiers TS secondaires pressentis : `packages/client/src/screen.ts`, `packages/client/src/vid-menu.ts`, `packages/client/src/index.ts`
- Domaine : client / video driver public API
- Niveau de fidelite attendu : Strict pour `vrect_t` / `viddef_t`, Close pour les forwards `VID_*`.
- Statut actuel dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant cet audit

## Regles de rattachement

- Regle cible attendue : `1 fichier .h -> 1 fichier .ts`.
- Exception de decoupage documentee : `vrect_t` est partage avec `screen.h` et reste defini/reexporte depuis `packages/client/src/screen.ts`; le menu concret `VID_Menu*` vit dans `packages/client/src/vid-menu.ts`, rattache a `win32/vid_menu.c`.
- Justification si `1 fichier C != 1 fichier TS` : `vid.h` est un header public et `win32/vid_menu.c` est une implementation plateforme separee ; `vid.ts` conserve le contrat et les hooks.

## Inventaire source

### Fonctions

- [x] Nom : `VID_Init`
  - Source : `client/vid.h`
  - Role : initialiser le module video.
  - Cible TS pressentie : `packages/client/src/vid.ts`
  - Statut : porte.
  - Notes : forward vers `onInit`.

- [x] Nom : `VID_Shutdown`
  - Source : `client/vid.h`
  - Role : arreter le module video.
  - Cible TS pressentie : `packages/client/src/vid.ts`
  - Statut : porte.
  - Notes : forward vers `onShutdown`.

- [x] Nom : `VID_CheckChanges`
  - Source : `client/vid.h`
  - Role : appliquer les changements video en attente.
  - Cible TS pressentie : `packages/client/src/vid.ts`
  - Statut : porte.
  - Notes : forward vers `onCheckChanges`.

- [x] Nom : `VID_MenuInit`
  - Source : `client/vid.h`
  - Role : initialiser le menu video.
  - Cible TS pressentie : `packages/client/src/vid.ts`
  - Statut : porte.
  - Notes : implementation concrete possible via `vid-menu.ts`.

- [x] Nom : `VID_MenuDraw`
  - Source : `client/vid.h`
  - Role : dessiner le menu video.
  - Cible TS pressentie : `packages/client/src/vid.ts`
  - Statut : porte.
  - Notes : forward vers `onMenuDraw`.

- [x] Nom : `VID_MenuKey`
  - Source : `client/vid.h`
  - Role : router une touche au menu video et retourner le son associe.
  - Cible TS pressentie : `packages/client/src/vid.ts`
  - Statut : porte.
  - Notes : retour `const char *` represente par `string | null`.

### Structures / types

- [x] Nom : `vrect_t`
  - Source : `client/vid.h`
  - Role : rectangle video `x/y/width/height`.
  - Representation TS pressentie : `vrect_t`
  - Statut : porte dans `packages/client/src/screen.ts`, reexporte par `vid.ts`.
  - Notes : type partage avec `screen.h`.

- [x] Nom : `viddef_t`
  - Source : `client/vid.h`
  - Role : dimensions video globales.
  - Representation TS pressentie : `viddef_t`
  - Statut : porte dans `packages/client/src/vid.ts`.
  - Notes : champs `width` et `height` conserves.

- [x] Nom : `viddef`
  - Source : `client/vid.h`
  - Role : global video mutable.
  - Representation TS pressentie : `ClientVidContext.viddef`
  - Statut : porte par contexte explicite.
  - Notes : conforme au remplacement des globals C.

### Enums / constantes / flags / macros utiles

- [x] Nom : aucune constante propre a `client/vid.h`
  - Source : `client/vid.h`
  - Valeur / role : header declaratif.
  - Cible TS pressentie : N/A
  - Statut : N/A
  - Notes : les constantes menu concretes sont rattachees a `win32/vid_menu.c`.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `vrect_t` | struct | `packages/client/src/screen.ts` / `packages/client/src/vid.ts` | `vrect_t` | Porte | Defini avec screen, reexporte par vid. |
| `viddef_t` | struct | `packages/client/src/vid.ts` | `viddef_t` | Porte | `width`, `height`. |
| `viddef` | global | `packages/client/src/vid.ts` | `ClientVidContext.viddef` | Porte | Contexte explicite. |
| `VID_Init` | fonction | `packages/client/src/vid.ts` | `VID_Init` | Porte | Forward hook. |
| `VID_Shutdown` | fonction | `packages/client/src/vid.ts` | `VID_Shutdown` | Porte | Forward hook. |
| `VID_CheckChanges` | fonction | `packages/client/src/vid.ts` | `VID_CheckChanges` | Porte | Forward hook. |
| `VID_MenuInit` | fonction | `packages/client/src/vid.ts` | `VID_MenuInit` | Porte | Hook / controller menu. |
| `VID_MenuDraw` | fonction | `packages/client/src/vid.ts` | `VID_MenuDraw` | Porte | Hook / controller menu. |
| `VID_MenuKey` | fonction | `packages/client/src/vid.ts` | `VID_MenuKey` | Porte | `string | null`. |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/vid.ts`
- Client : `packages/client/src/menu-*.ts`, `packages/client/src/menu-runtime.ts`, `packages/client/src/index.ts`
- Server : non applicable
- Renderer common : non applicable pour ce header
- Renderer three : possede son propre `viddef_t` renderer dans `gl_local.h`, pas port principal de `client/vid.h`
- Web / platform : backend video via hooks, pas port principal
- Audio : non applicable
- Tests existants : `scripts/verify/quake2-vid-header.ts`, `scripts/verify/quake2-menu.ts`
