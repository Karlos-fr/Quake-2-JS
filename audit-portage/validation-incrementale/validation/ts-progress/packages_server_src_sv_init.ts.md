# Progress TS - packages/server/src/sv_init.ts

- Statut: Termine
- Lot traite: les 7 symboles de la matrice TS (`SAVEGAME_FRAME_COUNT`, `ServerInitContext`, `createServerInitProcedures`, `cloneEntityState`, `zeroClientCommand`, `endsWithInsensitive`, `formatPrintf`).
- Verdict: tous les symboles listes sont classes `New`, avec `Original name: N/A` et `Source declaree: N/A (...)` explicites dans les entetes et la matrice; aucun reste a auditer dans la matrice TS actuelle.
- Croisement C/H: la matrice `server_sv_init.c.md` valide les portages proprietaires internes `SV_FindIndex`, `SV_ModelIndex`, `SV_SoundIndex`, `SV_ImageIndex`, `SV_CreateBaseline`, `SV_CheckForSavegame`, `SV_SpawnServer`, `SV_InitGame` et `SV_Map`. Les 7 symboles de surface audites ici sont des constantes, helpers, contexte et factory TS hors C/H direct.
- Ownership: `packages/server/src/sv_init.ts` reste le proprietaire serveur attendu pour le port `server/sv_init.c`; les helpers listes ne masquent pas un portage proprietaire et ne dupliquent pas un symbole C/H.
- Integration runtime: `createServerInitProcedures` est exporte par `packages/server/src/index.ts` et consomme par `packages/server/src/runtime.ts`.
- Integration apps/web: couverte indirectement par `verify:full-game:server-host`; pas de logique web parallele dans ce lot.
- Integration renderer-three: non applicable, le lot initialise le serveur et ne produit pas directement de donnees renderer.
- Tests de reference: `npm run verify:server:init`, `npm run verify:server:runtime`, `npm run verify:full-game:server-host`, `npm run typecheck`, `git diff --check`.
- Prochain lot: aucun pour ce fichier dans la matrice TS actuelle.
