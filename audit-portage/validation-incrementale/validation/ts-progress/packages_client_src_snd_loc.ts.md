# Progress TS - packages/client/src/snd_loc.ts

- Statut: Termine
- Dernier lot valide: fichier complet (33 symboles)
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:snd-loc:header`
  - `npm run verify:snd-mem`
  - `npm run verify:snd-mix`
  - `npm run verify:snd-dma`
  - `npm run verify:full-game:audio-routing`
  - `npm run typecheck`
- Decisions:
  - Les macros, structs et wrappers `SNDDMA_*` sont marques `Couvert C/H` via `client_snd_loc.h.md`.
  - `ClientSoundLocalState` est classe `Adapter`: il regroupe les extern globals de `snd_loc.h` dans un etat TS explicite.
  - Les factories TS et contrats de hooks/contexte sont `Category: New` avec `Original name: N/A` et `Source: N/A (...)`.
  - Les prototypes `GetWavinfo`, `S_InitScaletable`, `S_LoadSound`, `S_IssuePlaysound`, `S_PaintChannels`, `S_PickChannel` et `S_Spatialize` sont des adapters de declaration; les proprietaires fonctionnels restent `snd_mem.ts`, `snd_mix.ts` et `snd_dma.ts`.
- Blocages: Aucun.
