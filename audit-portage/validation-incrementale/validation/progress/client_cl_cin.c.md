# Progress - Quake-2-master/client/cl_cin.c

## Session 2026-05-07

- Lot valide: gros premier lot coherent couvrant `cblock_t`, l'etat `cinematics_t`/`cin`, `SCR_LoadPCX`, `SCR_StopCinematic`, `SCR_FinishCinematic`, `SmallestNode1`, `Huff1TableInit`, `Huff1Decompress`, `SCR_ReadNextFrame`, `SCR_RunCinematic`, `SCR_DrawCinematic`, `SCR_PlayCinematic` et les variables locales associees generees dans la matrice.
- Decisions: `cinematics_t` est porte comme `client_cinematic_t` dans `packages/client/src/client.ts`; `cblock_t` est remplace par les buffers `Uint8Array` de `Huff1Decompress`; `SCR_LoadPCX` delegue le parsing PCX a `parsePcx` dans `packages/formats` tout en gardant le branchement original dans `SCR_PlayCinematic`.
- Runtime: flux atteint via `CL_ParseServerMessage` -> `SCR_PlayCinematic`, `CL_Frame`/screen frame -> `SCR_RunCinematic`, puis `SCR_DrawCinematic`/`SCR_DrawCinematicRef`.
- apps/web: flux cinematic de demarrage integre dans `apps/web/src/full-game.ts`, avec chargement browser des fichiers, arret CD audio, audio raw et draw raw capture.
- renderer-three: sortie visible consommee via `refexport_t.DrawStretchRaw` et le port `packages/renderer-three/src/gl_draw.ts`.
- Tests OK: `npm run verify:cl-scrn`, `npm run verify:cinematic:audio-sync`, `npm run verify:cl-parse`, `npm run verify:cl-main`, `npm run verify:full-game:audio-routing`, `npm run verify:gl-draw`.

## Prochain lot recommande

Aucun lot restant pour `client/cl_cin.c`: toutes les lignes sont `Valide` ou `Non applicable`.
