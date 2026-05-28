# Progress TS - packages/client/src/snd_dma.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 51 symboles.
- Prochain lot recommande: Aucun dans la matrice TS actuelle.
- Tests de reference:
  - `npm run verify:snd-dma`
  - `npm run verify:sound:header`
  - `npm run verify:full-game:audio-routing`
  - `npm run verify:audio:phase11`
  - `npx tsx ./scripts/verify/quake2-web-audio-adapter.ts`
  - `npm run typecheck`
- Blocages: Aucun.

## Decisions

- Les 30 macros/fonctions proprietaires de `Quake-2-master/client/snd_dma.c` sont `Couvert C/H` via `client_snd_dma.c.md`, qui les marque `Valide` avec `packages/client/src/snd_dma.ts` comme proprietaire TS attendu.
- `S_IssueReadyPlaysounds` est classe `Category: New` avec `Original name: N/A` et `Source: N/A (web audio scheduling helper)`: c'est un helper exporte pour l'adapter audio web, pas un portage proprietaire C.
- Les interfaces, factories et helpers locaux sont `Category: New` avec `Original name: N/A` et une source `N/A (...)` explicite dans les entetes et la matrice.
- Les wrappers publics homonymes dans `sound.ts` restent proprietaires de `client/sound.h`; ils ne dupliquent pas l'ownership `client/snd_dma.c` de ce fichier.
