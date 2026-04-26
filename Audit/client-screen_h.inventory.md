# Inventaire Portage Quake II - client/screen.h

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/client/screen.h`
- Sources C/H secondaires : `Quake-2-master/client/cl_scrn.c`, `Quake-2-master/client/cl_cin.c`, `Quake-2-master/client/client.h`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/screen.ts`
- Fichiers TS secondaires pressentis : `packages/client/src/types.ts`, `packages/client/src/cinematic.ts`, `packages/client/src/view.ts`, `packages/client/src/index.ts`
- Domaine : client / screen, HUD, console visible, cinematics
- Niveau de fidelite attendu : Close pour les sorties renderer-neutral, Strict pour les constantes/etats et mutations simples.
- Statut actuel dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant cet audit

## Regles de rattachement

- Regle cible attendue : header mixte avec point principal explicite.
- Exception de decoupage documentee : le bloc `scr_cin.c` est porte dans `packages/client/src/cinematic.ts`, tandis que `packages/client/src/screen.ts` conserve la facade publique `SCR_*` declaree par `screen.h`.
- Justification si `1 fichier C != 1 fichier TS` : `screen.h` expose a la fois des declarations de `cl_scrn.c`, des etats globaux et les declarations cinematics ; la separation `screen.ts` / `cinematic.ts` garde le rattachement lisible sans deplacer le comportement hors du package client.

## Inventaire source

### Fonctions

- [x] Nom : `SCR_Init`
  - Source : `client/screen.h`, implementation dans `client/cl_scrn.c`
  - Role : initialiser cvars et commandes screen.
  - Cible TS pressentie : `packages/client/src/screen.ts`
  - Statut : porte.
  - Notes : enregistre aussi `loading`, `timerefresh` et `sky` du port `cl_scrn.c`.

- [x] Nom : `SCR_UpdateScreen`
  - Source : `client/screen.h`, implementation dans `client/cl_scrn.c`
  - Role : orchestrer le rendu ecran/HUD/cinematic/loading.
  - Cible TS pressentie : `packages/client/src/screen.ts`
  - Statut : porte.
  - Notes : retourne `ClientScreenFrame` au lieu d'appeler le renderer directement.

- [x] Nom : `SCR_SizeUp`
  - Source : `client/screen.h`
  - Role : augmenter `viewsize`.
  - Cible TS pressentie : `packages/client/src/screen.ts`
  - Statut : porte.
  - Notes : correspond au comportement de `SCR_SizeUp_f`.

- [x] Nom : `SCR_SizeDown`
  - Source : `client/screen.h`
  - Role : diminuer `viewsize`.
  - Cible TS pressentie : `packages/client/src/screen.ts`
  - Statut : porte.
  - Notes : correspond au comportement de `SCR_SizeDown_f`.

- [x] Nom : `SCR_CenterPrint`
  - Source : `client/screen.h`
  - Role : stocker un centerprint et ses lignes.
  - Cible TS pressentie : `packages/client/src/screen.ts`
  - Statut : porte.
  - Notes : echo console laisse aux hooks/adapters.

- [x] Nom : `SCR_BeginLoadingPlaque`
  - Source : `client/screen.h`
  - Role : activer la plaque de chargement et bloquer temporairement l'ecran.
  - Cible TS pressentie : `packages/client/src/screen.ts`
  - Statut : porte.
  - Notes : preserve le cas cinematic avec `scr_draw_loading == 2`.

- [x] Nom : `SCR_EndLoadingPlaque`
  - Source : `client/screen.h`
  - Role : clear plaque de chargement / disable screen.
  - Cible TS pressentie : `packages/client/src/screen.ts`
  - Statut : porte.
  - Notes : mutation stricte de l'etat runtime.

- [x] Nom : `SCR_DebugGraph`
  - Source : `client/screen.h`
  - Role : ajouter un echantillon au debug graph.
  - Cible TS pressentie : `packages/client/src/screen.ts`
  - Statut : porte.
  - Notes : sortie consommee par `SCR_DrawDebugGraph`.

- [x] Nom : `SCR_TouchPics`
  - Source : `client/screen.h`
  - Role : enregistrer les pics HUD/crosshair necessaires.
  - Cible TS pressentie : `packages/client/src/screen.ts`
  - Statut : porte.
  - Notes : met a jour `crosshair_pic`, largeur et hauteur.

- [x] Nom : `SCR_RunConsole`
  - Source : `client/screen.h`
  - Role : animer la hauteur de console visible.
  - Cible TS pressentie : `packages/client/src/screen.ts`
  - Statut : porte.
  - Notes : `key_dest` passe par option explicite.

- [x] Nom : `SCR_AddDirtyPoint`
  - Source : `client/screen.h`
  - Role : etendre le rectangle dirty courant.
  - Cible TS pressentie : `packages/client/src/screen.ts`
  - Statut : porte.
  - Notes : mutation stricte de `scr_dirty`.

- [x] Nom : `SCR_DirtyScreen`
  - Source : `client/screen.h`
  - Role : marquer tout l'ecran dirty.
  - Cible TS pressentie : `packages/client/src/screen.ts`
  - Statut : porte.
  - Notes : viewport explicite.

- [x] Nom : `SCR_PlayCinematic`
  - Source : `client/screen.h`, implementation dans `client/cl_cin.c`
  - Role : lancer `.pcx` statique ou `.cin`.
  - Cible TS pressentie : `packages/client/src/screen.ts` facade, `packages/client/src/cinematic.ts` implementation
  - Statut : porte.
  - Notes : hooks pour fichiers, CD audio, raw samples.

- [x] Nom : `SCR_DrawCinematic`
  - Source : `client/screen.h`, implementation dans `client/cl_cin.c`
  - Role : produire l'image cinematic active.
  - Cible TS pressentie : `packages/client/src/screen.ts` facade, `packages/client/src/cinematic.ts` implementation
  - Statut : porte.
  - Notes : snapshot indexed-pixel renderer-neutral.

- [x] Nom : `SCR_RunCinematic`
  - Source : `client/screen.h`, implementation dans `client/cl_cin.c`
  - Role : avancer la timeline cinematic.
  - Cible TS pressentie : `packages/client/src/screen.ts` facade, `packages/client/src/cinematic.ts` implementation
  - Statut : porte.
  - Notes : conserve la relance loading plaque a fin de stream.

- [x] Nom : `SCR_StopCinematic`
  - Source : `client/screen.h`, implementation dans `client/cl_cin.c`
  - Role : arreter et nettoyer l'etat cinematic.
  - Cible TS pressentie : `packages/client/src/screen.ts` facade, `packages/client/src/cinematic.ts` implementation
  - Statut : porte.
  - Notes : side effects son via hooks.

- [x] Nom : `SCR_FinishCinematic`
  - Source : `client/screen.h`, implementation dans `client/cl_cin.c`
  - Role : envoyer `nextserver`.
  - Cible TS pressentie : `packages/client/src/screen.ts` facade, `packages/client/src/cinematic.ts` implementation
  - Statut : porte.
  - Notes : mutation du net message couverte.

### Structures / types

- [x] Nom : `vrect_t`
  - Source : `client/screen.h` via `client.h` / `vid.h`
  - Role : rectangle de rendu `scr_vrect`.
  - Representation TS pressentie : `vrect_t`
  - Statut : porte dans `packages/client/src/screen.ts`.
  - Notes : aussi partage avec `vid.h`.

- [x] Nom : `scr_con_current`, `scr_conlines`, `sb_lines`, `scr_vrect`, `crosshair_pic`, `crosshair_width`, `crosshair_height`
  - Source : `client/screen.h`
  - Role : etats globaux header-visibles de l'ecran client.
  - Representation TS pressentie : `client_screen_state_t` dans `packages/client/src/types.ts`
  - Statut : porte.
  - Notes : remplaces par `ClientRuntime.cl.screen`.

- [x] Nom : `scr_viewsize`, `crosshair`
  - Source : `client/screen.h`
  - Role : cvars publiques screen.
  - Representation TS pressentie : `ClientScreenContext.scr_viewsize`, `ClientScreenContext.crosshair`
  - Statut : porte.
  - Notes : resolus par `SCR_Init`.

### Enums / constantes / flags / macros utiles

- [x] Nom : `MAX_QPATH`
  - Source : `client/screen.h` via headers communs
  - Valeur / role : taille historique de `crosshair_pic`.
  - Cible TS pressentie : chaine `crosshair_pic` dans runtime client
  - Statut : adapte.
  - Notes : la limite fixe C n'est pas necessaire pour le stockage JS, le nom source reste conserve.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `SCR_Init` | fonction | `packages/client/src/screen.ts` | `SCR_Init` | Porte | Cvars et commandes. |
| `SCR_UpdateScreen` | fonction | `packages/client/src/screen.ts` | `SCR_UpdateScreen` | Porte | Snapshot renderer-neutral. |
| `SCR_SizeUp` | fonction | `packages/client/src/screen.ts` | `SCR_SizeUp` | Porte | `viewsize += 10`. |
| `SCR_SizeDown` | fonction | `packages/client/src/screen.ts` | `SCR_SizeDown` | Porte | `viewsize -= 10`. |
| `SCR_CenterPrint` | fonction | `packages/client/src/screen.ts` | `SCR_CenterPrint` | Porte | Centerprint state. |
| `SCR_BeginLoadingPlaque` | fonction | `packages/client/src/screen.ts` | `SCR_BeginLoadingPlaque` | Porte | Loading/cinematic flags. |
| `SCR_EndLoadingPlaque` | fonction | `packages/client/src/screen.ts` | `SCR_EndLoadingPlaque` | Porte | Clear loading. |
| `SCR_DebugGraph` | fonction | `packages/client/src/screen.ts` | `SCR_DebugGraph` | Porte | Graph ring buffer. |
| `SCR_TouchPics` | fonction | `packages/client/src/screen.ts` | `SCR_TouchPics` | Porte | Crosshair state. |
| `SCR_RunConsole` | fonction | `packages/client/src/screen.ts` | `SCR_RunConsole` | Porte | Console animation. |
| `SCR_AddDirtyPoint` | fonction | `packages/client/src/screen.ts` | `SCR_AddDirtyPoint` | Porte | Dirty rect. |
| `SCR_DirtyScreen` | fonction | `packages/client/src/screen.ts` | `SCR_DirtyScreen` | Porte | Full-screen dirty. |
| `SCR_PlayCinematic` | fonction | `packages/client/src/screen.ts` | `SCR_PlayCinematic` | Porte | Facade vers `cinematic.ts`. |
| `SCR_DrawCinematic` | fonction | `packages/client/src/screen.ts` | `SCR_DrawCinematic` | Porte | Snapshot cinematic. |
| `SCR_RunCinematic` | fonction | `packages/client/src/screen.ts` | `SCR_RunCinematic` | Porte | Timeline cinematic. |
| `SCR_StopCinematic` | fonction | `packages/client/src/screen.ts` | `SCR_StopCinematic` | Porte | Cleanup cinematic. |
| `SCR_FinishCinematic` | fonction | `packages/client/src/screen.ts` | `SCR_FinishCinematic` | Porte | `nextserver`. |
| `scr_*`, `sb_lines`, `crosshair_*` | globals | `packages/client/src/types.ts` | `client_screen_state_t` | Porte | Runtime explicite. |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/screen.ts`, `packages/client/src/types.ts`
- Client : `packages/client/src/input.ts`, `packages/client/src/view.ts`, `packages/client/src/main.ts`, `packages/client/src/index.ts`
- Server : `packages/server/src/sv_init.ts` consomme `SCR_BeginLoadingPlaque` via hook
- Renderer common : consomme les draw commands HUD/resources
- Renderer three : consomme les draw commands et ressources HUD
- Web / platform : adapters consomment les snapshots, pas port principal
- Audio : hooks cinematic raw samples / restart
- Tests existants : `scripts/verify/quake2-screen-header.ts`, `scripts/verify/quake2-cl-scrn.ts`
