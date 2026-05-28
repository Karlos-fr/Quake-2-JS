# Progress TS - packages/server/src/sv_game.ts

- Statut: Termine
- Dernier lot traite: les 4 symboles de la matrice TS (`ServerGameContext`, `createServerGameProcedures`, `assignGameExports`, `formatPrintf`).
- Verdict: `ServerGameContext`, `createServerGameProcedures` et `formatPrintf` sont du code TS local `New` avec `Original name: N/A` et `Source declaree: N/A (...)` explicites. `assignGameExports` est un adapter local de la table `game_export_t` renvoyee par `GetGameApi`, sans ownership C/H direct.
- Croisement C/H: `validation/matrices/server_sv_game.c.md` couvre les callbacks/procedures proprietaires internes (`PF_*`, `SV_InitGameProgs`, `SV_ShutdownGameProgs`). Les 4 symboles de cette matrice TS sont des wrapper/context/helpers autour de ce portage, donc pas marques `Couvert C/H`.
- Ownership: package serveur correct. Aucun doublon proprietaire masque; `formatPrintf` est un helper local comparable aux formatters locaux d'autres fichiers serveur.
- Integration runtime: OK via `createServerRuntimeFacade` qui instancie `createServerGameProcedures`; `SV_InitGameProgs` route les imports game et verifie `GAME_API_VERSION`.
- Integration apps/web: OK indirectement via `verify:full-game:server-host`.
- Integration renderer-three: non applicable directement; le fichier initialise et expose les callbacks serveur/game, les sorties visibles passent ensuite par snapshots/client/renderer.
- Tests de reference: `verify:server:game`, `verify:server:runtime`, `verify:full-game:server-host`, `typecheck`, `git diff --check`.
- Prochain lot recommande: aucun.
