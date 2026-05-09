# Progress TS - packages/client/src/snd_mem.ts

- Statut: Termine
- Lot traite: fichier complet, 17 symboles.
- Derniere validation: validation TS croisee du port `client/snd_mem.c`, helpers locaux et hooks sound host.
- Tests de reference:
  - `npm run verify:snd-mem`
  - `npm run verify:snd-loc:header`
  - `npm run verify:snd-dma`
  - `npm run verify:full-game:audio-routing`
  - `npm run typecheck`
- Decisions:
  - `cache_full_cycle`, `ResampleSfx`, `S_LoadSound`, `DumpChunks`, `GetWavinfo`, `GetLittleShort`, `GetLittleLong`, `FindNextChunk` et `FindChunk` sont les proprietaires TS de `client/snd_mem.c` et sont couverts par `client_snd_mem.c.md`.
  - `ClientSndMemHooks`, `IffParseState`, `createIffParseState`, `readChunkName`, `requireDataPointer`, `getSndMemHooks`, `getActiveDmaSpeed` et `emitSndMemError` sont du code nouveau local avec metadonnees `N/A` explicites.
  - Les wrappers `GetWavinfo` et `S_LoadSound` declares dans `snd_loc.ts` restent des adapters du contexte sound-local, pas des proprietaires de `client/snd_mem.c`.
- Blocages: aucun.
- Prochain lot recommande: aucun.
