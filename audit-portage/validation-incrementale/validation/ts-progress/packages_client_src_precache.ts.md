# Progress TS - packages/client/src/precache.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 10 symboles.
- Prochain lot recommande: aucun.
- Tests de reference:
  - `npm run verify:cl-main`
  - `npm run verify:client:header`
  - `npm run verify:full-game:authoritative-handshake`
  - `npm run typecheck`
- Decisions importantes:
  - `PLAYER_MULT`, `ENV_CNT`, `TEXTURE_CNT`, `env_suf`, `CL_RequestNextDownload` et `CL_Precache_f` sont proprietaires TS de leurs entites `client/cl_main.c` deja marquees `Valide` dans la matrice C/H.
  - `ClientPrecacheHooks`, `parsePlayerSkin`, `tryParseMd2` et `truncateQPath` sont du code TS nouveau/local, avec `Original name: N/A` et `Source declaree: N/A (...)` explicites.
  - `env_suf` est le symbole TS reel exporte; la ligne generee `ENV_SUFFIXES` de la matrice a ete corrigee.
- Blocages: aucun.
