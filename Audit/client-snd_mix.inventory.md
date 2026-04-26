# Inventaire Portage Quake II - client/snd_mix.c

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/client/snd_mix.c`
- Sources C/H secondaires : `Quake-2-master/client/snd_loc.h`, `Quake-2-master/client/snd_dma.c`, `Quake-2-master/client/snd_mem.c`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/snd_mix.ts`
- Fichiers TS secondaires pressentis : `packages/client/src/sound-local.ts`, `packages/client/src/snd_dma.ts`, `packages/client/src/snd_mem.ts`, `packages/client/src/index.ts`
- Domaine : client / audio mixer, paintbuffer, DMA transfer
- Niveau de fidelite attendu : Strict pour scaletable, clipping et mixage samples ; Close pour la representation typed-array et la suppression des chemins assembleur.
- Statut actuel dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant cet audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`.
- Exception de decoupage documentee : `sound-local.ts` porte les declarations de `snd_loc.h` et integre l'etat `ClientSoundMixState`, mais le comportement principal reste dans `snd_mix.ts`.
- Justification si `1 fichier C != 1 fichier TS` : non applicable ; `snd_mix.ts` est le point principal.

## Inventaire source

### Fonctions

- [x] Nom : `S_WriteLinearBlastStereo16`
  - Source : `client/snd_mix.c`
  - Role : saturer et ecrire un bloc stereo 16-bit lineaire.
  - Cible TS pressentie : `packages/client/src/snd_mix.ts`
  - Statut : porte.
  - Notes : chemins asm natifs remplaces par implementation TS portable.

- [x] Nom : `S_TransferStereo16`
  - Source : `client/snd_mix.c`
  - Role : transferer le paintbuffer vers le DMA stereo16 circulaire.
  - Cible TS pressentie : `packages/client/src/snd_mix.ts`
  - Statut : porte.
  - Notes : conserve calcul `lpos` et recirculation.

- [x] Nom : `S_TransferPaintBuffer`
  - Source : `client/snd_mix.c`
  - Role : transferer selon format DMA 16/8-bit, mono/stereo, avec `s_testsound`.
  - Cible TS pressentie : `packages/client/src/snd_mix.ts`
  - Statut : porte.
  - Notes : chemin optimise stereo16 conserve.

- [x] Nom : `S_PaintChannels`
  - Source : `client/snd_mix.c`
  - Role : mixer raw samples, pending plays et canaux actifs puis transferer au DMA.
  - Cible TS pressentie : `packages/client/src/snd_mix.ts`
  - Statut : porte.
  - Notes : utilise `S_IssuePlaysound` et `S_LoadSound` via `sound-local.ts`.

- [x] Nom : `S_InitScaletable`
  - Source : `client/snd_mix.c`
  - Role : construire la table 32x256 de volume 8-bit.
  - Cible TS pressentie : `packages/client/src/snd_mix.ts`
  - Statut : porte.
  - Notes : conserve signed byte et reset `s_volume.modified`.

- [x] Nom : `S_PaintChannelFrom8`
  - Source : `client/snd_mix.c`
  - Role : mixer un cache 8-bit dans le paintbuffer.
  - Cible TS pressentie : `packages/client/src/snd_mix.ts`
  - Statut : porte.
  - Notes : clamp volumes a 255 et index `leftvol >> 11`.

- [x] Nom : `S_PaintChannelFrom16`
  - Source : `client/snd_mix.c`
  - Role : mixer un cache 16-bit dans le paintbuffer.
  - Cible TS pressentie : `packages/client/src/snd_mix.ts`
  - Statut : porte.
  - Notes : DataView little-endian.

### Structures / types

- [x] Nom : `portable_samplepair_t paintbuffer[PAINTBUFFER_SIZE]`
  - Source : `client/snd_mix.c`
  - Role : buffer de mix temporaire.
  - Representation TS pressentie : `ClientSoundMixState.paintbuffer`
  - Statut : porte.
  - Notes : taille fixe 2048 conservee.

- [x] Nom : `snd_scaletable[32][256]`
  - Source : `client/snd_mix.c`
  - Role : table de scaling 8-bit par volume.
  - Representation TS pressentie : `ClientSoundMixState.snd_scaletable`
  - Statut : porte.
  - Notes : `Int32Array[]`.

- [x] Nom : `snd_p`, `snd_linear_count`, `snd_vol`, `snd_out`
  - Source : `client/snd_mix.c`
  - Role : scratch globals du transfert/mix.
  - Representation TS pressentie : `ClientSoundMixState`
  - Statut : porte/adapte.
  - Notes : `snd_out` devient parametre typed-array local.

- [x] Nom : `channel_t`, `sfxcache_t`, `playsound_t`
  - Source : `client/snd_loc.h`
  - Role : canaux de mixage, cache PCM et sons pending.
  - Representation TS pressentie : `sound-local.ts`
  - Statut : porte.
  - Notes : consommes par `snd_mix.ts`.

### Enums / constantes / flags / macros utiles

- [x] Nom : `PAINTBUFFER_SIZE`
  - Source : `client/snd_mix.c`
  - Valeur / role : `2048`
  - Cible TS pressentie : `PAINTBUFFER_SIZE`
  - Statut : porte.
  - Notes : valeur conservee.

- [x] Nom : `MAX_CHANNELS`
  - Source : `client/snd_loc.h`
  - Valeur / role : nombre de canaux parcourus.
  - Cible TS pressentie : `MAX_CHANNELS`
  - Statut : porte.
  - Notes : vient de `sound-local.ts`.

- [x] Nom : `MAX_RAW_SAMPLES`
  - Source : `client/snd_loc.h`
  - Valeur / role : masque ring buffer raw samples.
  - Cible TS pressentie : `MAX_RAW_SAMPLES`
  - Statut : porte.
  - Notes : conserve l'index `i & (MAX_RAW_SAMPLES - 1)`.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `PAINTBUFFER_SIZE` | constante | `packages/client/src/snd_mix.ts` | `PAINTBUFFER_SIZE` | Porte | 2048. |
| `paintbuffer` | global | `packages/client/src/snd_mix.ts` | `ClientSoundMixState.paintbuffer` | Porte | Etat runtime. |
| `snd_scaletable` | global | `packages/client/src/snd_mix.ts` | `ClientSoundMixState.snd_scaletable` | Porte | 32x256. |
| `snd_p`, `snd_linear_count`, `snd_vol` | globals | `packages/client/src/snd_mix.ts` | `ClientSoundMixState` | Porte | Scratch explicite. |
| `S_WriteLinearBlastStereo16` | fonction | `packages/client/src/snd_mix.ts` | `S_WriteLinearBlastStereo16` | Porte | Clamp stereo16. |
| `S_TransferStereo16` | fonction | `packages/client/src/snd_mix.ts` | `S_TransferStereo16` | Porte | DMA circulaire. |
| `S_TransferPaintBuffer` | fonction | `packages/client/src/snd_mix.ts` | `S_TransferPaintBuffer` | Porte | 16/8-bit. |
| `S_PaintChannels` | fonction | `packages/client/src/snd_mix.ts` | `S_PaintChannels` | Porte | Pending/raw/channels. |
| `S_InitScaletable` | fonction | `packages/client/src/snd_mix.ts` | `S_InitScaletable` | Porte | Signed byte table. |
| `S_PaintChannelFrom8` | fonction | `packages/client/src/snd_mix.ts` | `S_PaintChannelFrom8` | Porte | 8-bit mix. |
| `S_PaintChannelFrom16` | fonction | `packages/client/src/snd_mix.ts` | `S_PaintChannelFrom16` | Porte | 16-bit mix. |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/snd_mix.ts`, `packages/client/src/sound-local.ts`
- Client : `packages/client/src/snd_dma.ts`
- Server : non applicable
- Renderer common : non applicable
- Renderer three : non applicable
- Web / platform : DMA/audio backend via hooks, pas port principal
- Audio : `snd_dma.ts`, `snd_mem.ts`, `sound-local.ts`
- Tests existants : `scripts/verify/quake2-snd-mix.ts`, `scripts/verify/quake2-snd-loc-header.ts`, `scripts/verify/quake2-snd-dma.ts`
