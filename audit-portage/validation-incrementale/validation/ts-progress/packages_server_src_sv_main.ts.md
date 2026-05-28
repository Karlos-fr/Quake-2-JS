# Progress TS - packages/server/src/sv_main.ts

- Statut: Termine
- Lot traite: les 10 symboles de la matrice TS (`SV_FINAL_MESSAGE_BUFFER`, `SV_STATUS_BUFFER_MAX`, `HEARTBEAT_MSEC`, `ServerMainContext`, `createServerMainProcedures`, `cloneNetAdr`, `copyNetAdr`, `decodePacketString`, `formatPrintf`, `stripHighBits`).
- Verdict: tous les symboles sont classes et valides; aucun reste a auditer dans la matrice TS actuelle.
- Croisement C/H: `HEARTBEAT_MSEC` est un adapter local derive du macro source `HEARTBEAT_SECONDS` de `server/sv_main.c`, deja couvert dans `server_sv_main.c.md`; les autres symboles sont du code TS nouveau hors C/H.
- Ownership: le portage proprietaire des fonctions `server/sv_main.c` reste dans les procedures internes de `createServerMainProcedures`; les constantes/helpers listes ici ne masquent pas un portage proprietaire.
- Integration runtime: `createServerMainProcedures` est exporte via `packages/server/src/index.ts` et consomme par `packages/server/src/runtime.ts`.
- Integration apps/web: couverte indirectement par le flux `full-game:server-host`; pas de logique web parallele dans ce lot.
- Integration renderer-three: non applicable, le lot ne produit pas de donnees de rendu.
- Tests de reference: `npm run verify:server:main`, `npm run verify:server:runtime`, `npm run verify:full-game:server-host`, `npm run typecheck`, `git diff --check`.
- Prochain lot: aucun pour ce fichier dans la matrice TS actuelle.
