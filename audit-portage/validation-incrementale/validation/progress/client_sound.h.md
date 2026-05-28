# Progress - Quake-2-master/client/sound.h

## Etat courant

- Statut: Termine
- Lot traite pendant cette session: rattachement strict du portage public `client/sound.h` a `packages/client/src/sound.ts`.
- Entites validees: les 13 entrees de `client_sound.h.md`.
- Entites partielles: aucune.

## Checklist appliquee

- Source C/H comparee: declarations `Quake-2-master/client/sound.h`, implementations `Quake-2-master/client/snd_dma.c`, appels runtime `Quake-2-master/client/cl_main.c`, `Quake-2-master/client/cl_parse.c`, `Quake-2-master/client/cl_cin.c`, et backend activation `Quake-2-master/win32/snd_win.c`.
- Cibles TS comparees: `packages/client/src/sound.ts`, `packages/client/src/snd_dma.ts`, `packages/client/src/cl_main.ts`, `packages/client/src/cl_parse.ts`, `packages/client/src/cl_scrn.ts`, `apps/web/src/full-game.ts`.
- Commentaires d'en-tete verifies dans `sound.ts` et `snd_dma.ts` pour les entites du lot; les deviations WebAudio restent dans l'adapter web, pas dans la facade portee.
- Ownership verifie: `sound.ts` reste la facade `sound.h`; `snd_dma.ts` reste proprietaire du comportement DMA; `apps/web/src/full-game.ts` ne fait que brancher les hooks navigateur/full-game.
- Doublons verifies par recherche repo: pas de port concurrent proprietaire; les aliases `S_DMA_*` sont les entrees DMA importees par l'adapter web.
- Runtime verifie: `snd_restart` relaie shutdown/init, `reconnect` et `disconnect` stoppent les sons, le chat `PRINT_CHAT` route `misc/talk.wav`, les cinematics alimentent `S_DMA_RawSamples`, et focus/blur activent/desactivent l'audio Web.
- `apps/web` verifie et corrige: les hooks full-game manquants sont branches localement dans `apps/web/src/full-game.ts`.
- `packages/renderer-three` verifie: non applicable justifie pour ce lot; ces entites produisent audio, buffers DMA et registrations de sons, pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene a consommer par `renderer-three`.

## Session 2026-05-28 - redecoupage lot 3

- Checklist TS appliquee au lot `client/sound.h`: entete, `Original name`, `Source declaree`, `Category`, `Export`, ownership et doublons compares pour `packages/client/src/sound.ts`.
- `packages/client/src/sound.ts` est maintenant le point d'attache principal pour `client/sound.h`; l'ancien contenu d'enregistrement de sons est separe dans `packages/client/src/sound-registration.ts`.
- Les entites `Category: New` de la facade publique conservent `Original name: N/A`, `Source: N/A (<raison courte>)` et `Category: New`.
- `CL_RegisterSounds` reste proprietaire de `client/cl_parse.c` et `client/cl_tent.c` dans `sound-registration.ts`; le barrel public `packages/client/src/index.ts` l'exporte depuis ce nouveau fichier.
- Les imports directs historiques de `CL_RegisterSounds` sont recables vers `sound-registration.ts`; `sound.ts` ne reexporte pas l'enregistrement des sons.
- Matrice `client_sound.h.md` mise a jour: cible proprietaire `packages/client/src/sound.ts`, statut auto `matched`, verdict Phase 03 `strict-ok`.

Tests lances:

- `npm run typecheck`
- `npm run build --workspace @quake2js/web`

## Corrections appliquees

- `packages/client/src/sound-public.ts`: renomme en `packages/client/src/sound.ts`.
- `packages/client/src/sound.ts`: ancien contenu d'enregistrement de sons deplace dans `packages/client/src/sound-registration.ts`.
- `packages/client/src/index.ts`: exports publics `client/sound.h` recables vers `./sound.js`; `CL_RegisterSounds` et `ClientSoundRegistrationHooks` recables vers `./sound-registration.js`.
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
