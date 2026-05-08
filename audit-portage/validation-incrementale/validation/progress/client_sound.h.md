# Progress - Quake-2-master/client/sound.h

## Etat courant

- Statut: Partiel
- Lot traite pendant cette session: tout `client/sound.h`.
- Entites validees: `S_StartSound`, `S_Update`, `S_BeginRegistration`, `S_RegisterSound`, `S_EndRegistration`, `S_FindName`, `CL_GetEntitySoundOrigin`.
- Entites partielles: `S_Init`, `S_Shutdown`, `S_StartLocalSound`, `S_RawSamples`, `S_StopAllSounds`, `S_Activate`.

## Checklist appliquee

- Source C/H comparee: declarations `Quake-2-master/client/sound.h`, implementations proprietaires `Quake-2-master/client/snd_dma.c`, `Quake-2-master/client/cl_ents.c`, et backend `Quake-2-master/win32/snd_win.c` pour `S_Activate`.
- Cibles TS comparees: facade header `packages/client/src/sound-public.ts`, runtime son `packages/client/src/snd_dma.ts`, types/etat `packages/client/src/snd_loc.ts`, fonction runtime `CL_GetEntitySoundOrigin` dans `packages/client/src/refresh.ts`.
- Commentaires d'en-tete verifies dans `sound-public.ts`; ajoutes dans `snd_dma.ts` pour les ports critiques `S_StartSound` et `S_StopAllSounds`.
- Ownership verifie: `sound-public.ts` couvre la facade `sound.h`; le comportement runtime principal est proprietaire de `snd_dma.ts`; l'origine sonore d'entite est portee cote client refresh et consommee par `snd_dma.ts`.
- Doublons verifies par recherche repo: exports publics `sound-public.ts` et exports `S_DMA_*` de `snd_dma.ts` sont des facades/owners distincts; pas de port proprietaire concurrent a fusionner dans ce lot.
- Runtime verifie: server `svc_sound`, sons d'effets et sons menu passent par `S_DMA_StartSound`/`S_DMA_StartLocalSound`; registration passe par `S_DMA_BeginRegistration`/`S_DMA_RegisterSound`/`S_DMA_EndRegistration`; update audio appelle `S_DMA_Update` par frame.
- `apps/web` verifie: full-game initialise `snd_dma`, route les sons serveur et menu vers DMA, synchronise les loop channels via WebAudio; restent ouverts `snd_restart`/shutdown, chat local sound, raw samples cinematic, reconnect stop-all et focus/blur activation.
- `packages/renderer-three` verifie: non applicable justifie pour ce lot; les entites `sound.h` produisent de l'audio, des canaux DMA ou des registrations de sons, pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene a consommer directement par `renderer-three`.

## Corrections appliquees

- `packages/client/src/snd_dma.ts`: `S_Spatialize` utilise maintenant `client.cl_entities[ent].lerp_origin` quand aucun hook `onGetEntitySoundOrigin` n'est fourni, au lieu de retomber silencieusement sur `[0, 0, 0]`.
- `packages/client/src/snd_dma.ts`: ajout des commentaires d'en-tete de port pour `S_StartSound` et `S_StopAllSounds`.
- `scripts/verify/quake2-snd-dma.ts`: ajout d'une preuve pour les sons dynamiques sans origine fixe, spatialises depuis `cl_entities[ent].lerp_origin`.

## Tests lances

- `npm run verify:snd-dma`: OK.
- `npm run verify:sound:header`: OK.
- `npm run verify:cl-parse`: OK.
- `npm run verify:cinematic:audio-sync`: OK.
- `npm run verify:full-game:audio-routing`: OK.
- `npm run verify:cl-view`: bloque avant test par `packages/game/src/g_main.ts(615,6): error TS1005: ',' expected`.
- `npm run typecheck`: bloque par `packages/game/src/g_main.ts(615,6): error TS1005: ',' expected`.

## Manques ouverts

- `S_Init` / `S_Shutdown`: `apps/web/src/full-game.ts` initialise bien `S_DMA_Init`, mais `snd_restart` et le shutdown page ne branchent pas encore `S_DMA_Shutdown` puis `S_DMA_Init`.
- `S_StartLocalSound`: les sons menu passent par `S_DMA_StartLocalSound`, mais le hook `onStartLocalSound` du parser n'est pas branche dans le flux full-game pour `misc/talk.wav`.
- `S_RawSamples`: le port `snd_dma.ts` est teste, mais les cinematics full-game routent encore les samples directement vers `runtime.audio.queueRawSamples`.
- `S_StopAllSounds`: commande `stopsound` et fin registration OK; le hook reconnect/disconnect full-game ne relaie pas encore `S_DMA_StopAllSounds`.
- `S_Activate`: facade `sound-public.ts` testee, mais focus/blur full-game ne relaient pas encore l'activation audio ni un equivalent WebAudio documente.

## Prochain lot recommande

- Garder `client/sound.h` en `Partiel`.
- Prochain correctif recommande hors perimetre agent: brancher dans `apps/web/src/full-game.ts` les hooks sound manquants (`onSoundShutdown`, `onSoundInit`, `onStopAllSounds`, `onStartLocalSound`, focus/blur audio) et decider explicitement si les raw samples cinematic doivent passer par `S_DMA_RawSamples` ou rester un adapter WebAudio documente.

## Consolidation coordinateur - 2026-05-08

- Apres fin du lot parallele `game/g_main.c`, le blocage syntaxique temporaire `packages/game/src/g_main.ts(615,6)` est leve.
- Reverification centrale OK: `npm run typecheck`, `npm run verify:sound:header`, `npm run verify:snd-dma`, `npm run verify:full-game:audio-routing`.
