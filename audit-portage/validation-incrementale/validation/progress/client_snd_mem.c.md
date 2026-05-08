# Progress - Quake-2-master/client/snd_mem.c

## Session 2026-05-08 - demarrage chargement/resampling WAV

- Lot traite: `cache_full_cycle`, declaration `S_Alloc`, `ResampleSfx` et ses locaux generes (`outcount`, `srcsample`, `stepscale`, `i`, `sample`), puis `S_LoadSound` et ses locaux generes (`namebuffer`, `data`, `len`, `stepscale`, `size`, `name`). `data_p` a ete qualifie `Partiel` car il appartient au lot parser WAV suivant.
- Corrections code: aucune.
- Tests lances:
  - `npm run verify:snd-mem` - OK.
  - `npm run verify:snd-loc:header` - OK.
  - `npm run verify:snd-dma` - echec hors lot sur `S_ClearBuffer mismatch` dans `snd_dma.c`.
  - `npm run verify:snd-loc-header` - script npm absent; script correct relance sous `verify:snd-loc:header`.
- Runtime: `S_LoadSound` est atteignable via `snd_loc.S_LoadSound`, `snd_dma.S_RegisterSound`, `S_EndRegistration`, `S_StartSound`, `S_Update_`/mixage. `ResampleSfx` est appelee par `S_LoadSound`.
- apps/web: `apps/web/src/full-game.ts` cree le contexte `soundLocal`, branche `onFS_LoadFile` sur le filesystem monte, initialise `snd_dma`, enregistre les sons via `CL_RegisterSounds`/`S_DMA_RegisterSound` et emet les canaux vers l'adapter WebAudio. Aucun manque constate pour ce lot.
- renderer-three: non applicable pour ce lot; les entites valident un cache PCM audio et ne produisent ni modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene a consommer par `packages/renderer-three`.
- Decisions:
  - `S_Alloc` est une declaration C orpheline: aucune definition ni aucun appel trouve dans `Quake-2-master` ou le port TS.
  - Les "globals" du lot sauf `cache_full_cycle` et `data_p` sont des variables locales C detectees par la matrice; elles sont couvertes avec leur fonction proprietaire.

## Prochain lot recommande

Valider le bloc parser WAV: `iff_end`, `last_chunk`, `iff_data`, `iff_chunk_len`, `GetLittleShort`, `GetLittleLong`, `FindNextChunk`, `FindChunk`, `DumpChunks`, puis `GetWavinfo` si le lot reste coherent. Fermer `data_p` avec ce bloc.
