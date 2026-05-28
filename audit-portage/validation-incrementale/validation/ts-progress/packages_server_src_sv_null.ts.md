# Progress TS - packages/server/src/sv_null.ts

- Statut: Termine
- Dernier lot valide: `SV_Init`, `SV_Shutdown`, `SV_Frame`
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:server:null`
  - `npm run verify:server:runtime`
  - `npm run verify:full-game:server-host`
  - `npm run typecheck`
  - `git diff --check`
- Decisions:
  - `sv_null.ts` reste le proprietaire TS strict de `Quake-2-master/server/sv_null.c`.
  - `host.ts` expose des adapters locaux configurables et ne prend pas l'ownership C/H.
- Blocages: Aucun.
