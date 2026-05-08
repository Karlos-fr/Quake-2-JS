# Progress - Quake-2-master/client/snd_dma.c

## Dernier lot valide

Premier gros lot coherent valide: declarations forward initiales, constantes, etat global/cvars, initialisation/shutdown, registration des sons, allocation/issue playsounds, spatialisation de base, `S_StartSound`, `S_StartLocalSound`, `S_ClearBuffer` et `S_StopAllSounds`.

## Tests de reference

- `npm run verify:snd-dma`
- `npm run verify:full-game:audio-routing`
- `npm run verify:sound:header`
- `npm run verify:snd-loc:header`
- `npm run typecheck`

## Decisions importantes

- Les declarations forward C initiales de `S_Play`, `S_SoundList`, `S_Update_` et `S_StopAllSounds` sont `Non applicable`; les implementations restent les lignes proprietaires.
- Les globals C `channels`, `dma`, `listener_*`, `paintedtime`, `s_rawend` et les cvars audio sont portes via l'etat explicite `ClientSoundLocalState`, branche dans `ClientSndDmaContext`.
- `S_SoundInfo_f` est porte sous le nom TS `S_SoundInfo`; l'entete TS conserve `Original name: S_SoundInfo_f`.
- `packages/renderer-three` est non applicable pour ce lot audio: les entites validees produisent du son et des commandes/cvars, pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene.

## Blocages

- Aucun blocage pour le lot traite.

## Prochain lot recommande

Valider le flux update/streaming audio: `S_AddLoopSounds`, `S_RawSamples`, `S_Update`, `GetSoundtime`, `S_Update_` et leurs locaux. Garder les commandes console `S_Play`/`S_SoundList` pour un lot separe si le lot update devient trop large.
