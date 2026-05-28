# Progress TS - packages/server/src/sv_send.ts

- Statut: Termine.
- Lot traite: les 4 symboles de la matrice TS (`ServerSendContext`, `createServerSendProcedures`, `formatPrintf`, `stripHighBits`).
- Verdict: les 4 symboles sont du code TS local `New`, avec `Original name: N/A`, `Source declaree: N/A (...)` et `Category: New` explicites dans les entetes et la matrice.
- Croisement C/H: `server_sv_send.c.md` couvre les portages proprietaires internes `SV_*` dans la closure de `createServerSendProcedures`; les symboles de cette matrice sont seulement contexte, factory et helpers locaux, donc `Hors C/H`.
- Ownership: package serveur correct. Aucun doublon proprietaire masque; `formatPrintf` et `stripHighBits` restent des helpers prives locaux.
- Integration: runtime serveur via `createServerRuntimeFacade`; apps/web couvert par `verify:full-game:server-host`; renderer-three non applicable pour ce flux serveur.
- Tests de reference: `npm run verify:server:send`, `npm run verify:server:runtime`, `npm run verify:full-game:server-host`, `npm run typecheck`, `git diff --check`.
- Prochain lot: aucun.
