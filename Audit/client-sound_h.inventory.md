# Inventaire Portage Quake II - client/sound.h

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/client/sound.h`
- Sources C/H secondaires : `Quake-2-master/client/snd_dma.c`, `Quake-2-master/client/snd_loc.h`, `Quake-2-master/client/client.h`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/sound-public.ts`
- Fichiers TS secondaires pressentis : `packages/client/src/snd_dma.ts`, `packages/client/src/sound-local.ts`, `packages/client/src/index.ts`
- Domaine : client / API publique audio
- Niveau de fidelite attendu : Close pour le forwarding public, Strict pour les signatures, pointeurs nullables et mutation de `CL_GetEntitySoundOrigin`.
- Statut actuel dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant cet audit

## Regles de rattachement

- Regle cible attendue : `1 fichier .h -> 1 fichier .ts` pour le contrat public.
- Exception de decoupage documentee : le comportement complet de l'audio runtime reste dans `snd_dma.ts` et `sound-local.ts`; `sound-public.ts` porte le header public et le forwarding.
- Justification si `1 fichier C != 1 fichier TS` : `sound.h` est une facade publique ; `snd_dma.c`, `snd_mix.c`, `snd_mem.c` et `snd_loc.h` gardent leurs propres rattachements.

## Inventaire source

### Fonctions

- [x] Nom : `S_Init`
  - Source : `client/sound.h`
  - Role : initialiser le systeme son client.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : forward hook public ; implementation principale dans `snd_dma.ts`.

- [x] Nom : `S_Shutdown`
  - Source : `client/sound.h`
  - Role : arreter le systeme son client.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : forward hook public.

- [x] Nom : `S_StartSound`
  - Source : `client/sound.h`
  - Role : lancer un son spatialise ou attache a une entite.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : `origin == NULL` represente par `vec3_t | null`.

- [x] Nom : `S_StartLocalSound`
  - Source : `client/sound.h`
  - Role : lancer un son local non spatialise.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : forward du nom de sample.

- [x] Nom : `S_RawSamples`
  - Source : `client/sound.h`
  - Role : envoyer des samples bruts au pipeline audio.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : `byte *data` represente par `Uint8Array`.

- [x] Nom : `S_StopAllSounds`
  - Source : `client/sound.h`
  - Role : stopper tous les sons actifs.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : forward hook public.

- [x] Nom : `S_Update`
  - Source : `client/sound.h`
  - Role : mettre a jour origine et axes listener.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : preserve les quatre `vec3_t`.

- [x] Nom : `S_Activate`
  - Source : `client/sound.h`
  - Role : activer/desactiver le systeme son.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : conserve `qboolean`.

- [x] Nom : `S_BeginRegistration`
  - Source : `client/sound.h`
  - Role : ouvrir une passe de registration audio.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : coherent avec `snd_dma.ts`.

- [x] Nom : `S_RegisterSound`
  - Source : `client/sound.h`
  - Role : enregistrer un sample et retourner `sfx_s *`.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : retourne `sfx_t | null`.

- [x] Nom : `S_EndRegistration`
  - Source : `client/sound.h`
  - Role : fermer la passe de registration audio.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : forward hook public.

- [x] Nom : `S_FindName`
  - Source : `client/sound.h`
  - Role : trouver ou creer un `sfx_s`.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : conserve le flag `create`.

- [x] Nom : `CL_GetEntitySoundOrigin`
  - Source : `client/sound.h`
  - Role : fournir l'origine courante d'une entite pour la spatialisation audio.
  - Cible TS pressentie : `packages/client/src/sound-public.ts`
  - Statut : porte.
  - Notes : copie in-place dans `org`, comme le pointeur C.

### Structures / types

- [x] Nom : `struct sfx_s`
  - Source : `client/sound.h`
  - Role : type opaque public pour les sons.
  - Representation TS pressentie : `sfx_t`
  - Statut : porte dans `packages/client/src/sound-local.ts`, reutilise par `sound-public.ts`.
  - Notes : garde l'alignement avec `snd_loc.h`.

- [x] Nom : `vec3_t`
  - Source : headers partages
  - Role : origine et axes audio.
  - Representation TS pressentie : `vec3_t`
  - Statut : porte dans qcommon, consomme par `sound-public.ts`.
  - Notes : `origin` nullable explicite pour `S_StartSound`.

- [x] Nom : `byte`
  - Source : headers partages
  - Role : payload brut de `S_RawSamples`.
  - Representation TS pressentie : `Uint8Array`
  - Statut : adapte.
  - Notes : helper `createRawSampleBuffer` conserve l'identite de payload.

- [x] Nom : `qboolean`
  - Source : headers partages
  - Role : flags `S_Activate` et `S_FindName(create)`.
  - Representation TS pressentie : `qboolean`
  - Statut : porte.
  - Notes : type public conserve.

### Enums / constantes / flags / macros utiles

- [x] Nom : aucune constante propre a `client/sound.h`
  - Source : `client/sound.h`
  - Valeur / role : header public declaratif.
  - Cible TS pressentie : N/A
  - Statut : N/A
  - Notes : types auxiliaires viennent des headers partages et de `snd_loc.h`.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `S_Init` | fonction | `packages/client/src/sound-public.ts` | `S_Init` | Porte | Forward hook. |
| `S_Shutdown` | fonction | `packages/client/src/sound-public.ts` | `S_Shutdown` | Porte | Forward hook. |
| `S_StartSound` | fonction | `packages/client/src/sound-public.ts` | `S_StartSound` | Porte | `origin` nullable. |
| `S_StartLocalSound` | fonction | `packages/client/src/sound-public.ts` | `S_StartLocalSound` | Porte | Nom sample. |
| `S_RawSamples` | fonction | `packages/client/src/sound-public.ts` | `S_RawSamples` | Porte | `Uint8Array`. |
| `S_StopAllSounds` | fonction | `packages/client/src/sound-public.ts` | `S_StopAllSounds` | Porte | Forward hook. |
| `S_Update` | fonction | `packages/client/src/sound-public.ts` | `S_Update` | Porte | Listener vectors. |
| `S_Activate` | fonction | `packages/client/src/sound-public.ts` | `S_Activate` | Porte | `qboolean`. |
| `S_BeginRegistration` | fonction | `packages/client/src/sound-public.ts` | `S_BeginRegistration` | Porte | Registration pass. |
| `S_RegisterSound` | fonction | `packages/client/src/sound-public.ts` | `S_RegisterSound` | Porte | `sfx_t | null`. |
| `S_EndRegistration` | fonction | `packages/client/src/sound-public.ts` | `S_EndRegistration` | Porte | Registration close. |
| `S_FindName` | fonction | `packages/client/src/sound-public.ts` | `S_FindName` | Porte | Create flag. |
| `CL_GetEntitySoundOrigin` | fonction | `packages/client/src/sound-public.ts` | `CL_GetEntitySoundOrigin` | Porte | Copie in-place. |
| `struct sfx_s` | type opaque | `packages/client/src/sound-local.ts` | `sfx_t` | Porte | Reutilise par API publique. |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/sound-public.ts`, `packages/client/src/snd_dma.ts`
- Client : `packages/client/src/parse.ts`, `packages/client/src/effects.ts`, `packages/client/src/index.ts`
- Server : non applicable
- Renderer common : non applicable
- Renderer three : non applicable
- Web / platform : audio adapter via hooks, pas port principal
- Audio : `packages/client/src/sound-local.ts`, `packages/client/src/snd_mix.ts`, `packages/client/src/snd_mem.ts`
- Tests existants : `scripts/verify/quake2-sound-header.ts`, `scripts/verify/quake2-snd-dma.ts`, `scripts/verify/quake2-audio-phase11.ts`
