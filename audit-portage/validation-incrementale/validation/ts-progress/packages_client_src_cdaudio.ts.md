# Progress TS - packages/client/src/cdaudio.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 12 symboles (`ClientCDAudioHooks` a `CDAudio_Activate`).
- Prochain lot recommande: aucun.

## Preuves de session

- Matrice C/H lue: `audit-portage/validation-incrementale/validation/matrices/client_cdaudio.h.md`.
- Sources C/H lues: `Quake-2-master/client/cdaudio.h`, `Quake-2-master/win32/cd_win.c`, `Quake-2-master/linux/cd_linux.c`, `Quake-2-master/null/cd_null.c`.
- Usages verifies: `packages/client/src/index.ts`, `apps/web/src/main.ts`, `apps/web/src/web-demo-loop.ts`, `apps/web/src/full-game.ts`, `packages/platform/src/web-cd-audio-adapter.ts`.

## Decisions

- `ClientCDAudioHooks`, `ClientCDAudioState`, `ClientCDAudioContext` et `createClientCDAudioContext` sont `Category: New`, avec `Original name: N/A` et `Source declaree: N/A (client CD audio context)`.
- `CDAudio_Init`, `CDAudio_Shutdown`, `CDAudio_Play`, `CDAudio_Stop`, `CDAudio_Update` et `CDAudio_Activate` sont les proprietaires attendus des entites `client/cdaudio.h` deja validees dans la matrice C/H; statut TS `Couvert C/H`.
- `CDAudio_Pause` et `CDAudio_Resume` viennent des backends natifs `cd_win.c`/`cd_linux.c`, sans matrice C/H dediee; validation TS directe.
- `packages/platform/src/web-cd-audio-adapter.ts` reste un adapter hote web et ne deplace pas l'ownership du port logique client.

## Tests

- `npx tsx ./scripts/verify/quake2-cdaudio.ts`
- `npm run verify:cl-main`
- `npm run verify:full-game:audio-routing`
- `npm run typecheck`

## Blocages

- Aucun.
