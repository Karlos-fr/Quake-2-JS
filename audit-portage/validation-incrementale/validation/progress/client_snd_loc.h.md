# Progress - Quake-2-master/client/snd_loc.h

## Etat

- Statut: En cours
- Dernier lot valide: types et structs audio de debut de fichier: `portable_samplepair_t`, `sfxcache_t`, `sfx_s`/`sfx_t`, `playsound_s`/`playsound_t`, `dma_t`, `channel_t`, `wavinfo_t`, avec champs generes rattaches aux structs parentes.
- Tests de reference:
  - `npm run verify:snd-loc:header` - passe, 2026-05-08
  - `npm run typecheck` - echoue hors lot sur `apps/web/src/full-game.ts` (`SFF_SUBDIR`, `SFF_HIDDEN`, `SFF_SYSTEM` non resolus dans un fichier deja modifie avant cette session)

## Decisions

- Ownership confirme dans `packages/client/src/snd_loc.ts`.
- Les structs C sont portees en interfaces TypeScript avec constructeurs explicites de zero-initialisation.
- `sfx_s` est la declaration C de `sfx_t`; la cible reelle est `sfx_t`.
- `playsound_s` est la declaration C de `playsound_t`; la cible reelle est `playsound_t`.
- `sfxcache_t.data[1]` est represente par `Uint8Array`; `dma_t.buffer` par `Uint8Array | null`.
- Les champs generes comme lignes separees dans la matrice sont marques `Non applicable` parce qu'ils sont couverts par la validation de leur struct parente.

## Integration

- Runtime: types consommes par `snd_dma.ts`, `snd_mix.ts` et `snd_mem.ts`; atteignables via `S_Init`, `S_Update`, `S_PaintChannels`, `S_LoadSound`, `S_IssuePlaysound` et les hooks `SNDDMA_*`.
- apps/web: `apps/web/src/full-game.ts` cree le `ClientSoundLocalContext`, initialise le DMA WebAudio, emet les playsounds et synchronise les loop channels; `packages/platform/src/web-audio-adapter.ts` consomme `sfx_t`, `sfxcache_t` et `channel_t`.
- renderer-three: non applicable pour ce lot de donnees audio; aucune sortie visible renderer attendue (pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene).

## Prochain lot recommande

Valider les declarations systeme `SNDDMA_Init`, `SNDDMA_GetDMAPos`, `SNDDMA_Shutdown`, `SNDDMA_BeginPainting`, `SNDDMA_Submit`, puis `MAX_CHANNELS`/`channels` si le lot reste coherent.
