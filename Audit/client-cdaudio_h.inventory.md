# Inventaire Portage Quake II - client/cdaudio.h

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/client/cdaudio.h`
- Sources C/H secondaires : `Quake-2-master/win32/cd_win.c`, `Quake-2-master/linux/cd_linux.c`, `Quake-2-master/null/cd_null.c`, `client/client.h`, appels `cl_parse.c`, `cl_view.c`, `cl_main.c`, `cl_cin.c`, `cl_scrn.c`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/cdaudio.ts`
- Fichiers TS secondaires pressentis : `packages/platform/src/web-cd-audio-adapter.ts`, `packages/client/src/index.ts`, `packages/client/src/parse.ts`, `packages/client/src/view.ts`, `packages/client/src/main.ts`, `packages/client/src/cinematic.ts`
- Domaine : interface logique CD audio client, controle piste musicale, focus pause/resume, adapter web
- Niveau de fidelite attendu : Close pour l'interface logique ; backends CD-ROM natifs hors perimetre web
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 header C = 1 fichier TS principal`
- Exception de decoupage documentee : I/O audio web dans `packages/platform/src/web-cd-audio-adapter.ts`; `cdaudio.ts` reste la surface logique principale.
- Justification si `1 fichier C != 1 fichier TS` : le header ne declare qu'une interface ; les APIs natives MCI/ioctl/eject/remap restent des backends platform-specific non portables.

## Inventaire source

### Fonctions

- [x] Nom : `CDAudio_Init`
  - Source : `cdaudio.h:21`
  - Role : initialise le sous-systeme CD audio, retourne `0` ou erreur.
  - Cible TS pressentie : `cdaudio.ts:65`
  - Statut : porte Close
  - Notes : callback `onInit`, etat `initialized/enabled`.

- [x] Nom : `CDAudio_Shutdown`
  - Source : `cdaudio.h:22`
  - Role : arrete la lecture et ferme le sous-systeme.
  - Cible TS pressentie : `cdaudio.ts:79`
  - Statut : porte Close
  - Notes : appelle `CDAudio_Stop`, puis `onShutdown`.

- [x] Nom : `CDAudio_Play`
  - Source : `cdaudio.h:23`
  - Role : joue une piste CD avec option de boucle.
  - Cible TS pressentie : `cdaudio.ts:96`
  - Statut : porte Close
  - Notes : normalise la piste, stoppe si piste invalide ou differente.

- [x] Nom : `CDAudio_Stop`
  - Source : `cdaudio.h:24`
  - Role : arrete la piste courante.
  - Cible TS pressentie : `cdaudio.ts:124`
  - Statut : porte Close
  - Notes : met `playing/wasPlaying` a false.

- [x] Nom : `CDAudio_Update`
  - Source : `cdaudio.h:25`
  - Role : polling et synchronisation backend CD.
  - Cible TS pressentie : `cdaudio.ts:172`
  - Statut : porte Close
  - Notes : hook `onUpdate`; polling concret dans l'adapter si necessaire.

- [x] Nom : `CDAudio_Activate`
  - Source : `cdaudio.h:26`
  - Role : pause/resume selon focus application.
  - Cible TS pressentie : `cdaudio.ts:186`
  - Statut : porte Close
  - Notes : route vers `CDAudio_Pause`/`CDAudio_Resume`.

- [x] Nom : `CDAudio_Pause`
  - Source : `win32/cd_win.c:210`, `linux/cd_linux.c:166`
  - Role : pause de la piste en cours.
  - Cible TS pressentie : `cdaudio.ts:140`
  - Statut : helper porte depuis backend
  - Notes : non declare dans le header, mais requis par `CDAudio_Activate`.

- [x] Nom : `CDAudio_Resume`
  - Source : `win32/cd_win.c:230`, `linux/cd_linux.c:182`
  - Role : reprise si `wasPlaying`.
  - Cible TS pressentie : `cdaudio.ts:156`
  - Statut : helper porte depuis backend
  - Notes : non declare dans le header, mais requis par `CDAudio_Activate`.

### Structures / types

- [x] Nom : globals backend `initialized`, `enabled`, `playing`, `wasPlaying`, `playLooping`, `playTrack`
  - Source : `win32/cd_win.c:30-36`, `linux/cd_linux.c:17-23`
  - Role : etat logique de lecture CD.
  - Representation TS pressentie : `ClientCDAudioState`
  - Statut : porte Close
  - Notes : `cdValid`, `maxTrack`, `remap`, handles natifs non portes.

- [x] Nom : hooks backend
  - Source : adaptation TS
  - Role : remplacer MCI/ioctl/WebAudio concrete.
  - Representation TS pressentie : `ClientCDAudioHooks`
  - Statut : nouveau contexte
  - Notes : permet test et adapter web.

- [x] Nom : contexte CD audio
  - Source : adaptation TS
  - Role : regrouper etat + hooks.
  - Representation TS pressentie : `ClientCDAudioContext`
  - Statut : nouveau contexte
  - Notes : remplace globals C.

### Enums / constantes / flags / macros utiles

- [x] Nom : `qboolean`
  - Source : qcommon
  - Valeur / role : parametres `looping` et `active`.
  - Cible TS pressentie : `qboolean`
  - Statut : consomme
  - Notes : boolean TS compatible.

- [x] Nom : `CS_CDTRACK`
  - Source : q_shared protocol
  - Valeur / role : configstring de piste CD.
  - Cible TS pressentie : `parse.ts`, `view.ts`, `local-gameplay-sync.ts`
  - Statut : consomme
  - Notes : declenche `onPlayCdTrack(track, true)`.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `CDAudio_Init` | declaration | `packages/client/src/cdaudio.ts` | `CDAudio_Init` | OK Close | retourne status |
| `CDAudio_Shutdown` | declaration | `packages/client/src/cdaudio.ts` | `CDAudio_Shutdown` | OK Close | stop + shutdown |
| `CDAudio_Play` | declaration | `packages/client/src/cdaudio.ts` | `CDAudio_Play` | OK Close | track/loop |
| `CDAudio_Stop` | declaration | `packages/client/src/cdaudio.ts` | `CDAudio_Stop` | OK Close | idempotent |
| `CDAudio_Update` | declaration | `packages/client/src/cdaudio.ts` | `CDAudio_Update` | OK Close | hook |
| `CDAudio_Activate` | declaration | `packages/client/src/cdaudio.ts` | `CDAudio_Activate` | OK Close | pause/resume |
| backend pause | backend helper | `packages/client/src/cdaudio.ts` | `CDAudio_Pause` | OK avec ecart | export utile |
| backend resume | backend helper | `packages/client/src/cdaudio.ts` | `CDAudio_Resume` | OK avec ecart | export utile |
| CD-ROM native I/O | backend natif | `packages/platform/src/web-cd-audio-adapter.ts` | `createWebCDAudioAdapter` | adapte | Web Audio/assets |
| `CS_CDTRACK` consumers | appels client | `parse.ts`, `view.ts` | `onPlayCdTrack` | partiel branche | hook vers audio |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/main.ts`, `packages/client/src/index.ts`
- Client : `parse.ts`, `view.ts`, `cinematic.ts`, `screen.ts`
- Server : non applicable direct
- Renderer common : non applicable
- Renderer three : non applicable
- Web / platform : `packages/platform/src/web-cd-audio-adapter.ts`
- Audio : Web Audio adapter, hooks `onPlayCdTrack`, `onCDAudio*`
- Tests existants : `scripts/verify/quake2-cdaudio.ts`, `scripts/verify/quake2-cl-main.ts`, `scripts/verify/quake2-cl-parse.ts`, `scripts/verify/quake2-cl-view.ts`, `scripts/verify/quake2-cinematic-audio-sync.ts`
