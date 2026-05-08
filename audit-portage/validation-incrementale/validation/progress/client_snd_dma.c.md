# Progress - Quake-2-master/client/snd_dma.c

## Dernier lot valide

Deuxieme gros lot coherent valide: flux update/streaming audio `S_AddLoopSounds`, `S_RawSamples`, `S_Update`, `GetSoundtime`, `S_Update_` et faux positifs locaux associes. Les fonctions ont ete comparees a `client/snd_dma.c`, leurs entetes TS ont ete ajoutes/verifies, le routage runtime/web est branche et couvert par tests.

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
- Les static locals C `buffers` et `oldsamplepos` de `GetSoundtime` sont conserves dans `ClientSndDmaState` pour garder la persistance inter-appels sans exposer de globals TS.
- `S_Update` est appele depuis le frame loop web complet via `updateClientAudio`, apres le pompage `CL_Frame`/`Qcommon_Frame`; les loop sounds sont consommes par `audio.syncLoopChannels(sndDma.sound.state.channels)`.
- `S_RawSamples` du port DMA est valide pour le runtime DMA; les cinematics web utilisent encore le hook adapter `runtime.audio.queueRawSamples` directement, ce qui est acceptable pour le flux cinematic existant mais reste distinct du DMA gameplay.
- `packages/renderer-three` est non applicable pour ce lot audio: les entites validees produisent du son brut/canaux audio, pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene.

## Blocages

- `npm run typecheck` echoue hors scope sur `apps/web/src/full-game.ts`: exports `SFF_HIDDEN`, `SFF_SUBDIR`, `SFF_SYSTEM` absents de `packages/qcommon/src/index.js`.

## Prochain lot recommande

Valider les commandes console restantes `S_Play`, `S_SoundList`, leurs locaux (`i`, `name`) et le faux positif `strcpy`.
