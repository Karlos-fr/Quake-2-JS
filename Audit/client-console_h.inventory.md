# Inventaire Portage Quake II - client/console.h

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/client/console.h`
- Sources C/H secondaires : `Quake-2-master/client/console.c`, `Quake-2-master/client/client.h`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/console.ts`
- Fichiers TS secondaires pressentis : `packages/client/src/index.ts`, `packages/client/src/keys.ts`, `packages/client/src/types.ts`
- Domaine : client / console
- Niveau de fidelite attendu : Strict pour l'etat et les constantes, Close pour les sorties renderer remplacees par snapshots.
- Statut actuel dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : valide

## Regles de rattachement

- Regle cible attendue : `1 fichier .h -> 1 fichier .ts` pour le point de rattachement principal.
- Exception de decoupage documentee : le header est mixte et partage son rattachement avec `client/console.c` dans `packages/client/src/console.ts`.
- Justification si `1 fichier C != 1 fichier TS` : `console.h` declare l'etat public et les points d'entree de `console.c`; garder les declarations dans `console.ts` preserve la tracabilite et evite une duplication artificielle.

## Inventaire source

### Fonctions

- [x] Nom : `Con_DrawCharacter`
  - Source : `client/console.h`
  - Role : dessiner un caractere console a une position pixel.
  - Cible TS pressentie : `packages/client/src/console.ts`
  - Statut : porte sous forme de commande structuree `ConsoleDrawCharacterCommand`.
  - Notes : adaptation renderer-neutral documentee.

- [x] Nom : `Con_CheckResize`
  - Source : `client/console.h`, implementation dans `client/console.c`
  - Role : recalculer la largeur console et conserver le scrollback.
  - Cible TS pressentie : `packages/client/src/console.ts`
  - Statut : porte.
  - Notes : la largeur vient d'un parametre viewport explicite au lieu de `viddef.width`.

- [x] Nom : `Con_Init`
  - Source : `client/console.h`, implementation dans `client/console.c`
  - Role : initialiser la console, enregistrer les commandes et `con_notifytime`.
  - Cible TS pressentie : `packages/client/src/console.ts`
  - Statut : porte.
  - Notes : surcharge header-only et contexte complet.

- [x] Nom : `Con_DrawConsole`
  - Source : `client/console.h`, implementation dans `client/console.c`
  - Role : dessiner la console pleine, fond, version, lignes, scrollback, download bar et input.
  - Cible TS pressentie : `packages/client/src/console.ts`
  - Statut : porte.
  - Notes : retourne un snapshot renderer-neutral.

- [x] Nom : `Con_Print`
  - Source : `client/console.h`, implementation dans `client/console.c`
  - Role : ajouter du texte au scrollback avec wrap, mask et timestamps notify.
  - Cible TS pressentie : `packages/client/src/console.ts`
  - Statut : porte.
  - Notes : `cls.realtime` devient un parametre explicite.

- [x] Nom : `Con_CenteredPrint`
  - Source : `client/console.h`, implementation dans `client/console.c`
  - Role : imprimer une ligne centree.
  - Cible TS pressentie : `packages/client/src/console.ts`
  - Statut : porte.
  - Notes : conserve le calcul de padding.

- [x] Nom : `Con_Clear_f`
  - Source : `client/console.h`, implementation dans `client/console.c`
  - Role : vider le buffer console.
  - Cible TS pressentie : `packages/client/src/console.ts`
  - Statut : porte.
  - Notes : `memset` remplace par `Array.fill(" ")`.

- [x] Nom : `Con_DrawNotify`
  - Source : `client/console.h`, implementation dans `client/console.c`
  - Role : dessiner les lignes notify recentes et le prompt chat.
  - Cible TS pressentie : `packages/client/src/console.ts`
  - Statut : porte.
  - Notes : retourne un snapshot et les dirty bounds.

- [x] Nom : `Con_ClearNotify`
  - Source : `client/console.h`, implementation dans `client/console.c`
  - Role : remettre a zero les temps notify.
  - Cible TS pressentie : `packages/client/src/console.ts`
  - Statut : porte.
  - Notes : conserve `NUM_CON_TIMES`.

- [x] Nom : `Con_ToggleConsole_f`
  - Source : `client/console.h`, implementation dans `client/console.c`
  - Role : ouvrir/fermer la console avec branches attractloop, disconnected et pause solo.
  - Cible TS pressentie : `packages/client/src/console.ts`
  - Statut : porte.
  - Notes : hooks pour loading plaque et menu.

### Structures / types

- [x] Nom : `console_t`
  - Source : `client/console.h`
  - Role : etat persistant de la console client.
  - Representation TS pressentie : interface `console_t`
  - Statut : porte.
  - Notes : `char text[CON_TEXTSIZE]` devient `string[]`; `float times[NUM_CON_TIMES]` devient `number[]`.

- [x] Nom : `con`
  - Source : `client/console.h`
  - Role : global console.
  - Representation TS pressentie : `createConsoleState()` et `ClientConsoleContext.con`
  - Statut : porte par contexte explicite.
  - Notes : ecart conforme aux regles de portage des globals C.

### Enums / constantes / flags / macros utiles

- [x] Nom : `NUM_CON_TIMES`
  - Source : `client/console.h`
  - Valeur / role : `4`, nombre de timestamps notify.
  - Cible TS pressentie : `NUM_CON_TIMES`
  - Statut : porte.
  - Notes : valeur conservee.

- [x] Nom : `CON_TEXTSIZE`
  - Source : `client/console.h`
  - Valeur / role : `32768`, taille du scrollback texte.
  - Cible TS pressentie : `CON_TEXTSIZE`
  - Statut : porte.
  - Notes : valeur conservee.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `NUM_CON_TIMES` | constante | `packages/client/src/console.ts` | `NUM_CON_TIMES` | Porte | Valeur 4 conservee. |
| `CON_TEXTSIZE` | constante | `packages/client/src/console.ts` | `CON_TEXTSIZE` | Porte | Valeur 32768 conservee. |
| `console_t` | struct | `packages/client/src/console.ts` | `console_t` | Porte | Champs sources representes. |
| `con` | global | `packages/client/src/console.ts` | `createConsoleState`, `ClientConsoleContext.con` | Porte | Global remplace par contexte. |
| `Con_DrawCharacter` | fonction | `packages/client/src/console.ts` | `Con_DrawCharacter` | Porte | Snapshot renderer-neutral. |
| `Con_CheckResize` | fonction | `packages/client/src/console.ts` | `Con_CheckResize` | Porte | Viewport explicite. |
| `Con_Init` | fonction | `packages/client/src/console.ts` | `Con_Init` | Porte | Surcharge contexte/header. |
| `Con_DrawConsole` | fonction | `packages/client/src/console.ts` | `Con_DrawConsole` | Porte | Snapshot console pleine. |
| `Con_Print` | fonction | `packages/client/src/console.ts` | `Con_Print` | Porte | Temps explicite. |
| `Con_CenteredPrint` | fonction | `packages/client/src/console.ts` | `Con_CenteredPrint` | Porte | Calcul source conserve. |
| `Con_Clear_f` | fonction | `packages/client/src/console.ts` | `Con_Clear_f` | Porte | Buffer rempli d'espaces. |
| `Con_DrawNotify` | fonction | `packages/client/src/console.ts` | `Con_DrawNotify` | Porte | Notify et chat couverts. |
| `Con_ClearNotify` | fonction | `packages/client/src/console.ts` | `Con_ClearNotify` | Porte | Timestamps remis a zero. |
| `Con_ToggleConsole_f` | fonction | `packages/client/src/console.ts` | `Con_ToggleConsole_f` | Porte | Branches speciales couvertes. |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/console.ts`, `packages/client/src/main.ts`
- Client : `packages/client/src/index.ts`, `packages/client/src/keys.ts`, `packages/client/src/screen.ts`, `packages/client/src/view.ts`
- Server : non applicable
- Renderer common : contrats HUD/glyphes consommes via snapshots, pas port principal
- Renderer three : rendu des glyphes/console via consommateurs renderer, pas port principal
- Web / platform : consommateurs adapter uniquement
- Audio : non applicable
- Tests existants : `scripts/verify/quake2-console-header.ts`, `scripts/verify/quake2-console.ts`
