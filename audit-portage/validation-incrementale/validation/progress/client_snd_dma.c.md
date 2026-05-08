# Progress - Quake-2-master/client/snd_dma.c

## Dernier lot valide

Troisieme gros lot coherent valide: commandes console restantes `S_Play`, `S_SoundList`, locaux `i`/`name` et faux positif `strcpy`. Les fonctions ont ete comparees a `client/snd_dma.c`, leurs entetes TS ont ete ajoutes, le format de sortie `S_SoundList` a ete aligne sur les largeurs C `%2d`/`%6i`, et les commandes `play`/`soundlist` sont prouvees via `Cmd_ExecuteString`.

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
- `S_Play` et `S_SoundList` sont atteignables par les commandes enregistrees dans `S_Init`; `apps/web` execute le buffer de commandes qcommon et garde le routage audio via le runtime DMA et l'adapter WebAudio.
- `packages/renderer-three` est non applicable pour ce lot audio: les entites validees produisent du son brut, des commandes console et des canaux audio, pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene.

## Blocages

- Aucun blocage connu pour ce fichier pendant cette session: `npm run typecheck` passe.

## Prochain lot recommande

Aucun lot restant dans `client_snd_dma.c.md`: toutes les lignes sont `Valide` ou `Non applicable`. Proposer au coordinateur de passer `client/snd_dma.c` en `Termine`.
