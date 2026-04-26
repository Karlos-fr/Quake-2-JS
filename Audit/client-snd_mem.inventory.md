# Inventaire Portage Quake II - client/snd_mem.c

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/client/snd_mem.c`
- Sources C/H secondaires : `Quake-2-master/client/snd_loc.h`, `Quake-2-master/client/sound.h`, `Quake-2-master/client/client.h`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/snd_mem.ts`
- Fichiers TS secondaires pressentis : `packages/client/src/sound-local.ts`, `packages/client/src/snd_dma.ts`, `packages/client/src/snd_mix.ts`, `packages/client/src/index.ts`
- Domaine : client / audio cache, WAV RIFF parsing, resampling
- Niveau de fidelite attendu : Close pour le port TS avec `Uint8Array`/`DataView`, Strict pour l'ordre de parsing RIFF et les conversions d'echantillons.
- Statut actuel dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant cet audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`.
- Exception de decoupage documentee : `packages/client/src/sound-local.ts` relaie les declarations de `snd_loc.h` vers `snd_mem.ts`, sans porter le comportement principal a sa place.
- Justification si `1 fichier C != 1 fichier TS` : non applicable ; le comportement principal de `snd_mem.c` reste dans `snd_mem.ts`.

## Inventaire source

### Fonctions

- [x] Nom : `S_Alloc`
  - Source : `client/snd_mem.c`
  - Role : declaration externe historique de l'allocateur cache.
  - Cible TS pressentie : N/A
  - Statut : remplace par allocation `Uint8Array` / objet `sfxcache_t`.
  - Notes : pas de corps dans `snd_mem.c`; allocation explicite dans `S_LoadSound`.

- [x] Nom : `ResampleSfx`
  - Source : `client/snd_mem.c`
  - Role : resampler un `sfx_t` charge vers la frequence/largeur DMA active.
  - Cible TS pressentie : `packages/client/src/snd_mem.ts`
  - Statut : porte.
  - Notes : conserve fast path 8-bit et path general 8/16-bit.

- [x] Nom : `S_LoadSound`
  - Source : `client/snd_mem.c`
  - Role : charger un WAV, parser metadata, allouer/cache et resampler.
  - Cible TS pressentie : `packages/client/src/snd_mem.ts`
  - Statut : porte.
  - Notes : FS/diagnostics via hooks `sound-local`.

- [x] Nom : `GetLittleShort`
  - Source : `client/snd_mem.c`
  - Role : lire un short little-endian depuis le curseur IFF.
  - Cible TS pressentie : `packages/client/src/snd_mem.ts`
  - Statut : porte en helper local.
  - Notes : conserve signed 16-bit.

- [x] Nom : `GetLittleLong`
  - Source : `client/snd_mem.c`
  - Role : lire un int little-endian depuis le curseur IFF.
  - Cible TS pressentie : `packages/client/src/snd_mem.ts`
  - Statut : porte en helper local.
  - Notes : conserve signed 32-bit.

- [x] Nom : `FindNextChunk`
  - Source : `client/snd_mem.c`
  - Role : avancer jusqu'au prochain chunk IFF nomme.
  - Cible TS pressentie : `packages/client/src/snd_mem.ts`
  - Statut : porte en helper local.
  - Notes : conserve l'alignement pair `(len + 1) & ~1`.

- [x] Nom : `FindChunk`
  - Source : `client/snd_mem.c`
  - Role : repartir de `iff_data` puis chercher un chunk.
  - Cible TS pressentie : `packages/client/src/snd_mem.ts`
  - Statut : porte en helper local.
  - Notes : remplace les globals par `IffParseState`.

- [x] Nom : `DumpChunks`
  - Source : `client/snd_mem.c`
  - Role : diagnostiquer les chunks RIFF.
  - Cible TS pressentie : `packages/client/src/snd_mem.ts`
  - Statut : porte.
  - Notes : retourne des lignes au lieu d'imprimer directement.

- [x] Nom : `GetWavinfo`
  - Source : `client/snd_mem.c`
  - Role : parser un WAV PCM RIFF et retourner `wavinfo_t`.
  - Cible TS pressentie : `packages/client/src/snd_mem.ts`
  - Statut : porte.
  - Notes : couvre RIFF/WAVE, `fmt `, `cue `, `LIST`, `data`, bad loop.

### Structures / types

- [x] Nom : `sfx_t`
  - Source : `client/snd_loc.h`
  - Role : entree sound effect chargee/cachee.
  - Representation TS pressentie : `sfx_t`
  - Statut : porte dans `packages/client/src/sound-local.ts`.
  - Notes : consomme par `snd_mem.ts`.

- [x] Nom : `sfxcache_t`
  - Source : `client/snd_loc.h`
  - Role : cache PCM decode/resample.
  - Representation TS pressentie : `sfxcache_t`
  - Statut : porte dans `packages/client/src/sound-local.ts`.
  - Notes : `data[1]` devient `Uint8Array`.

- [x] Nom : `wavinfo_t`
  - Source : `client/snd_loc.h`
  - Role : metadata WAV parsees.
  - Representation TS pressentie : `wavinfo_t`
  - Statut : porte dans `packages/client/src/sound-local.ts`.
  - Notes : champs source conserves.

- [x] Nom : globals IFF `data_p`, `iff_end`, `last_chunk`, `iff_data`, `iff_chunk_len`
  - Source : `client/snd_mem.c`
  - Role : etat de parsing RIFF.
  - Representation TS pressentie : `IffParseState`
  - Statut : porte localement.
  - Notes : evite des globals de module mutables.

- [x] Nom : `cache_full_cycle`
  - Source : `client/snd_mem.c`
  - Role : global historique de cycle cache.
  - Representation TS pressentie : `cache_full_cycle`
  - Statut : expose.
  - Notes : non utilise par les chemins portes actuels, conserve pour tracabilite.

### Enums / constantes / flags / macros utiles

- [x] Nom : `MAX_QPATH`
  - Source : headers partages
  - Valeur / role : taille de `namebuffer`.
  - Cible TS pressentie : construction de chemin string
  - Statut : adapte.
  - Notes : le stockage JS ne requiert pas de buffer fixe.

- [x] Nom : `ERR_DROP`
  - Source : qcommon
  - Valeur / role : erreur bad loop length.
  - Cible TS pressentie : `ERR_DROP`
  - Statut : porte.
  - Notes : transmis au hook `onComError`.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `cache_full_cycle` | global | `packages/client/src/snd_mem.ts` | `cache_full_cycle` | Porte | Trace source. |
| `ResampleSfx` | fonction | `packages/client/src/snd_mem.ts` | `ResampleSfx` | Porte | 8/16-bit, up/down sample. |
| `S_LoadSound` | fonction | `packages/client/src/snd_mem.ts` | `S_LoadSound` | Porte | FS hooks, cache, stereo reject. |
| `GetLittleShort` | helper | `packages/client/src/snd_mem.ts` | `GetLittleShort` | Porte | Helper local. |
| `GetLittleLong` | helper | `packages/client/src/snd_mem.ts` | `GetLittleLong` | Porte | Helper local. |
| `FindNextChunk` | helper | `packages/client/src/snd_mem.ts` | `FindNextChunk` | Porte | Alignement pair conserve. |
| `FindChunk` | helper | `packages/client/src/snd_mem.ts` | `FindChunk` | Porte | Helper local. |
| `DumpChunks` | fonction | `packages/client/src/snd_mem.ts` | `DumpChunks` | Porte | Retour lignes. |
| `GetWavinfo` | fonction | `packages/client/src/snd_mem.ts` | `GetWavinfo` | Porte | RIFF/fmt/cue/LIST/data. |
| `sfx_t`, `sfxcache_t`, `wavinfo_t` | types | `packages/client/src/sound-local.ts` | `sfx_t`, `sfxcache_t`, `wavinfo_t` | Porte | Header prive. |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/snd_mem.ts`, `packages/client/src/sound-local.ts`
- Client : `packages/client/src/snd_dma.ts`, `packages/client/src/snd_mix.ts`
- Server : non applicable
- Renderer common : non applicable
- Renderer three : non applicable
- Web / platform : filesystem/audio backends via hooks, pas port principal
- Audio : `snd_dma.ts`, `snd_mix.ts`, `sound-local.ts`
- Tests existants : `scripts/verify/quake2-snd-mem.ts`, `scripts/verify/quake2-snd-loc-header.ts`, `scripts/verify/quake2-snd-dma.ts`
