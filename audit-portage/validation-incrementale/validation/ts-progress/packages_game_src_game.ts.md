# Progress TS - packages/game/src/game.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 18 symboles.
- Prochain lot recommande: aucun.
- Tests de reference:
  - `npm run verify:game:header`
  - `npm run verify:g-main`
  - `npm run verify:server:game`
  - `npm run verify:full-game:server-host`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`

## Session

- `GAME_API_VERSION`, `MAX_ENT_CLUSTERS`, `solid_t`, `link_s`, `gclient_s`, `edict_s`, `game_import_t`, `game_export_t`, `GetGameApi` marques `Couvert C/H` via `game_game.h.md`.
- `link_t`, `gclient_t`, `edict_t` valides directement comme typedefs de `link_s`, `gclient_s`, `edict_s` dans `Quake-2-master/game/game.h`.
- `GamePrintf`, `GameClientServerFields`, `GameEdictServerFields` valides en `Category: New` avec `Original name: N/A` et `Source: N/A (...)`.
- `SVF_DEADMONSTER`, `SVF_MONSTER`, `SVF_NOCLIENT` valides comme re-exports adapters; le portage proprietaire reste `packages/game/src/runtime.ts`.
- Les alias runtime `GameAreaLink`, `GameClient`, `GameEntity` restent des shapes runtime importees; pas de mauvais package ni de doublon proprietaire retenu.
- Integration runtime verifiee via le contrat `GetGameApi`, `SV_InitGameProgs`, les edicts serveur et les tests game/server.
- Integration `apps/web` verifiee via le host full-game qui installe le `GetGameApi` porte et consomme le contrat `game_export_t`.
- Integration `renderer-three` non proprietaire directe; il consomme les snapshots serveur/client produits par le runtime, sans porter `game.h`.
