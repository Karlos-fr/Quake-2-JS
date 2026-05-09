# Progress TS - packages/formats/src/pcx.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 13 symboles.
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:qfiles`
  - `npm run verify:gl-image`
  - `npm run verify:full-game:console-background`
  - `npm run typecheck`
- Blocages: Aucun.
- Test residuel: `npm run verify:screen:header` echoue hors branche PCX, sur `SCR_PlayCinematic missing video should queue nextserver`.

## Decisions

- `pcx_t` reste `Category: Ported` et `Couvert C/H` via `qcommon_qfiles.h.md`; le package `formats` est le split legitime des formats declares dans `qcommon/qfiles.h`.
- `parsePcx` est classe `Category: Adapter`, pas portage proprietaire de `LoadPCX`: les proprietaires C/H restent `packages/client/src/cl_cin.ts` pour `SCR_LoadPCX` et `packages/renderer-three/src/gl_image.ts` pour `LoadPCX`.
- Les constantes, DTO et helpers locaux sont `Category: New` avec `Original name: N/A` et `Source: N/A (...)` explicites.
