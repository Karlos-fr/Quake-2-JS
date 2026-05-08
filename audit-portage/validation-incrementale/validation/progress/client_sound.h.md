# Progress - Quake-2-master/client/sound.h

## Etat courant

- Statut: Termine
- Lot traite pendant cette session: hooks full-game restants de `client/sound.h` (`S_Init`, `S_Shutdown`, `S_StartLocalSound`, `S_RawSamples`, `S_StopAllSounds`, `S_Activate`).
- Entites validees: les 13 entrees de `client_sound.h.md`.
- Entites partielles: aucune.

## Checklist appliquee

- Source C/H comparee: declarations `Quake-2-master/client/sound.h`, implementations `Quake-2-master/client/snd_dma.c`, appels runtime `Quake-2-master/client/cl_main.c`, `Quake-2-master/client/cl_parse.c`, `Quake-2-master/client/cl_cin.c`, et backend activation `Quake-2-master/win32/snd_win.c`.
- Cibles TS comparees: `packages/client/src/sound-public.ts`, `packages/client/src/snd_dma.ts`, `packages/client/src/cl_main.ts`, `packages/client/src/cl_parse.ts`, `packages/client/src/cl_scrn.ts`, `apps/web/src/full-game.ts`.
- Commentaires d'en-tete verifies dans `sound-public.ts` et `snd_dma.ts` pour les entites du lot; les deviations WebAudio restent dans l'adapter web, pas dans la facade portee.
- Ownership verifie: `sound-public.ts` reste la facade `sound.h`; `snd_dma.ts` reste proprietaire du comportement DMA; `apps/web/src/full-game.ts` ne fait que brancher les hooks navigateur/full-game.
- Doublons verifies par recherche repo: pas de port concurrent proprietaire; les aliases `S_DMA_*` sont les entrees DMA importees par l'adapter web.
- Runtime verifie: `snd_restart` relaie shutdown/init, `reconnect` et `disconnect` stoppent les sons, le chat `PRINT_CHAT` route `misc/talk.wav`, les cinematics alimentent `S_DMA_RawSamples`, et focus/blur activent/desactivent l'audio Web.
- `apps/web` verifie et corrige: les hooks full-game manquants sont branches localement dans `apps/web/src/full-game.ts`.
- `packages/renderer-three` verifie: non applicable justifie pour ce lot; ces entites produisent audio, buffers DMA et registrations de sons, pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene a consommer par `renderer-three`.

## Corrections appliquees

- `apps/web/src/full-game.ts`: ajout de `S_DMA_RawSamples` et `S_DMA_Shutdown` au wiring full-game.
- `apps/web/src/full-game.ts`: `snd_restart` branche `S_DMA_Shutdown` puis `S_DMA_Init`; `CL_Shutdown`/`beforeunload` relaie `S_DMA_Shutdown`.
- `apps/web/src/full-game.ts`: `onStartLocalSound` du parser full-game route le chat local vers `S_DMA_StartLocalSound`.
- `apps/web/src/full-game.ts`: les samples PCM cinematic passent dans `S_DMA_RawSamples` avant l'adapter WebAudio explicite.
- `apps/web/src/full-game.ts`: `reconnect`/`disconnect` relaient `S_DMA_StopAllSounds` et nettoient les sorties WebAudio.
- `apps/web/src/full-game.ts`: focus/blur appellent l'equivalent WebAudio de `S_Activate` (`audio.resume`/`audio.pause`).
- `scripts/verify/quake2-full-game-audio-routing.ts`: ajout des assertions de wiring pour les six anciens reliquats.

## Tests lances

- `npm run verify:full-game:audio-routing`: OK.
- `npm run verify:sound:header`: OK.
- `npm run verify:snd-dma`: OK.
- `npm run verify:cl-main`: OK.
- `npm run verify:cl-parse`: OK.
- `npm run verify:cinematic:audio-sync`: OK.
- `npm run typecheck`: OK.

## Manques ouverts

- Aucun pour `client/sound.h`.

## Prochain lot recommande

- Aucun lot restant dans `client/sound.h`; reprendre un autre fichier depuis `AVANCEMENT_GLOBAL.md`.
