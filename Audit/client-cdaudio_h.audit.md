# Audit Portage Quake II - client/cdaudio.h

Date : 2026-04-25

## Verdict

Statut : OK avec ecarts documentes
Risque principal : le port est une interface logique web-friendly, pas une emulation MCI/ioctl complete ; le branchement final depend des hooks client et de l'adapter Web Audio.

## Source verifiee

- Source C/H : `Quake-2-master/client/cdaudio.h`, backends `win32/cd_win.c`, `linux/cd_linux.c`, `null/cd_null.c`, appels client `cl_parse.c`, `cl_view.c`, `cl_main.c`, `cl_cin.c`, `cl_scrn.c`
- Port TS : `packages/client/src/cdaudio.ts`
- Consommateurs : `packages/client/src/index.ts`, `packages/client/src/parse.ts`, `packages/client/src/view.ts`, `packages/client/src/main.ts`, `packages/client/src/cinematic.ts`, `packages/platform/src/web-cd-audio-adapter.ts`, `scripts/verify/quake2-cdaudio.ts`

## Fiche d'identification

- Fichier audite : `client/cdaudio.h`
- Source C/H principale : `Quake-2-master/client/cdaudio.h`
- Sources C/H secondaires : backends natifs `cd_*.c`, appels client et `CS_CDTRACK`
- Package : `packages/client`
- Type de fichier : header d'interface audio client
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant audit, a passer en `✅`
- Niveau de fidelite annonce : Close avec backend adapte
- Role attendu : init/shutdown/play/stop/update/activate du CD audio logique
- Consommateurs directs : `index.ts`, hooks client, `parse.ts`, `view.ts`, adapter platform
- Consommateurs finaux : Web Audio music assets optionnels, client frame/update/init/shutdown, cinematic/screen stop hooks
- Tests existants : `scripts/verify/quake2-cdaudio.ts`, `scripts/verify/quake2-cl-main.ts`, `scripts/verify/quake2-cl-parse.ts`, `scripts/verify/quake2-cl-view.ts`, `scripts/verify/quake2-cinematic-audio-sync.ts`
- Conclusion audit : OK avec ecarts documentes

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `CDAudio_Init` | declaration | `cdaudio.ts` | `CDAudio_Init` | Valide Close | hook init/status |
| `CDAudio_Shutdown` | declaration | `cdaudio.ts` | `CDAudio_Shutdown` | Valide Close | idempotent |
| `CDAudio_Play` | declaration | `cdaudio.ts` | `CDAudio_Play` | Valide Close | track + looping |
| `CDAudio_Stop` | declaration | `cdaudio.ts` | `CDAudio_Stop` | Valide Close | stop si playing/paused |
| `CDAudio_Update` | declaration | `cdaudio.ts` | `CDAudio_Update` | Valide Close | hook update |
| `CDAudio_Activate` | declaration | `cdaudio.ts` | `CDAudio_Activate` | Valide Close | pause/resume |
| `CDAudio_Pause` | backend helper | `cdaudio.ts` | `CDAudio_Pause` | Valide avec ecart | non dans header |
| `CDAudio_Resume` | backend helper | `cdaudio.ts` | `CDAudio_Resume` | Valide avec ecart | non dans header |
| backend CD native | platform I/O | `web-cd-audio-adapter.ts` | `createWebCDAudioAdapter` | Valide adapte | Web Audio/assets |
| `CS_CDTRACK` play | appel client | `parse.ts`, `view.ts` | `onPlayCdTrack` | Valide partiel | hook de branchement |

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

Notes : remap/eject/door/message handler/loop counter MCI ne sont pas dans `cdaudio.h` et restent hors port logique web.

### Effets secondaires

- [x] Entites creees/liberees/linkees.
- [x] `think`, `touch`, `use`, `nextthink` mis a jour.
- [x] Etats runtime synchronises.
- [x] Configstrings mises a jour.
- [x] Temp entities mises a jour.
- [x] Sons emis avec les bons parametres.
- [x] Sorties renderer/audio correctement alimentees si applicable.

Notes : non applicable pour entites/temp entities/configstrings ; effet pertinent : etat CD logique et appels hooks audio.

## Verification item par item

### Interface header

- [x] `CDAudio_Init` retourne `0` si init hook reussit, `-1` si hook echoue.
- [x] `CDAudio_Init` met `initialized` et `enabled`.
- [x] `CDAudio_Shutdown` no-op si non initialise.
- [x] `CDAudio_Shutdown` appelle `CDAudio_Stop` avant `onShutdown`.
- [x] `CDAudio_Play` no-op si desactive.
- [x] `CDAudio_Play` stoppe si piste `<= 0`.
- [x] `CDAudio_Play` evite de rejouer la meme piste.
- [x] `CDAudio_Play` stoppe l'ancienne piste avant d'en lancer une autre.
- [x] `CDAudio_Stop` est idempotent et clear `playing/wasPlaying`.
- [x] `CDAudio_Update` no-op si desactive et appelle `onUpdate` sinon.
- [x] `CDAudio_Activate(false)` appelle pause ; `CDAudio_Activate(true)` appelle resume.

### Backends/adapters

- [x] `CDAudio_Pause` et `CDAudio_Resume` proviennent des backends natifs et restent subordonnes a `Activate`.
- [x] `ClientCDAudioState` represente les globals logiques `initialized/enabled/playing/wasPlaying/playLooping/playTrack`.
- [x] `web-cd-audio-adapter.ts` adapte les pistes en assets `music/trackNN.*`, `music/NN.*`.
- [x] L'adapter web preserve stop/pause/resume/update sans exposer MCI/ioctl.
- [x] `index.ts` re-exporte l'interface et les types CD audio.

### Consommateurs client

- [x] `parse.ts` joue `CS_CDTRACK` via `onPlayCdTrack`.
- [x] `view.ts` rejoue la piste CD pendant `CL_PrepRefresh` via `onPlayCdTrack`.
- [x] `main.ts` appelle les hooks init/update/shutdown aux points `CL_Init`, `CL_Frame`, `CL_Shutdown`.
- [x] `cinematic.ts` et `screen` stoppent le CD via `onCDAudioStop` lors des cinematics.
- [x] Les tests client couvrent les hooks `onCDAudioInit`, `onCDAudioUpdate`, `onCDAudioShutdown`, `CS_CDTRACK`, `onCDAudioStop`.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

Notes : le branchement runtime se fait aujourd'hui par hooks (`onCDAudio*`, `onPlayCdTrack`) plutot que par un `ClientCDAudioContext` compose dans `main.ts`. C'est acceptable pour ce header logique, mais reste un point d'integration a surveiller.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

Notes : non renderer ; web/platform consomme via `createWebCDAudioAdapter`.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

Notes : musique CD optionnelle, mappee vers assets Web Audio par adapter. Les fichiers reels peuvent etre absents, ce qui est gere par log et no-op.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

Tests existants : `scripts/verify/quake2-cdaudio.ts` couvre init/play dedupe/pause/resume/activate/update/stop/shutdown et resolution de pistes web. `scripts/verify/quake2-cl-main.ts` couvre hooks init/update/shutdown. `scripts/verify/quake2-cl-parse.ts` et `scripts/verify/quake2-cl-view.ts` couvrent `CS_CDTRACK`. `scripts/verify/quake2-cinematic-audio-sync.ts` couvre stop CD pendant cinematic.

Tests a ajouter : script npm `verify:cdaudio`, echec `onInit` => `-1`, play piste `0`, changement de piste appelle stop puis play, adapter Web Audio avec faux `AudioContext` et filesystem monte.

## Findings

1. [Info] `CDAudio_Pause` et `CDAudio_Resume` sont ajoutes a la surface TS.
   - Fichier/ligne : `packages/client/src/cdaudio.ts:140`, `packages/client/src/cdaudio.ts:156`
   - Source originale : non declares dans `client/cdaudio.h`, mais presents dans `win32/cd_win.c` et `linux/cd_linux.c`.
   - Impact : necessaire pour `CDAudio_Activate` et les adapters web ; ne modifie pas les six declarations du header.
   - Correction recommandee : aucune.

2. [Info] Les commandes CD console natives ne sont pas portees.
   - Fichier/ligne : `Quake-2-master/win32/cd_win.c:257`, `Quake-2-master/linux/cd_linux.c:198`
   - Source originale : `CD_f` gere on/off/reset/remap/close/play/loop/stop/pause/resume/eject/info.
   - Impact : hors surface `client/cdaudio.h`; le port web expose une interface programmatique minimale.
   - Correction recommandee : ajouter plus tard un port console `cd` si le menu/console web doit gerer ces commandes.

3. [Info] Le branchement client principal est encore via hooks.
   - Fichier/ligne : `packages/client/src/main.ts:1066`, `packages/client/src/main.ts:1016`, `packages/client/src/main.ts:1437`
   - Source originale : `cl_main.c` appelle directement `CDAudio_Init`, `CDAudio_Update`, `CDAudio_Shutdown`.
   - Impact : fonctionnement testable et injectable ; pas encore de facade client unique composant automatiquement `ClientCDAudioContext`.
   - Correction recommandee : lors d'une future facade client globale, connecter `onCDAudio*` et `onPlayCdTrack` a `CDAudio_*`.

4. [Info] `scripts/verify/quake2-cdaudio.ts` existe sans alias npm.
   - Fichier/ligne : `package.json`
   - Source originale : non applicable.
   - Impact : la verification doit etre lancee par `npx tsx ./scripts/verify/quake2-cdaudio.ts`.
   - Correction recommandee : ajouter `verify:cdaudio` pour aligner les autres harnais.

## Decision

- Corriger maintenant : rien
- Reporter : alias npm `verify:cdaudio`, facade client CD audio composee, commande console `cd` optionnelle
- Documenter : inventaire et audit crees

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `client\cdaudio.h`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/client-cdaudio_h.audit.md`
