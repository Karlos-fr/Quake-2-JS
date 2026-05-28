# Progress TS - packages/server/src/sv_ccmds.ts

- Statut: Termine
- Dernier lot valide: les 2 symboles exportes de la matrice TS (`ServerConsoleContext`, `createServerConsoleProcedures`).
- Prochain lot recommande: Aucun.
- Tests de reference: `npm run verify:server:ccmds`, `npm run verify:server:runtime`, `npm run verify:full-game:server-host`, `npm run typecheck`, `git diff --check`.
- Blocages: Aucun.

## Decisions

- `ServerConsoleContext` est une interface de dependances runtime TypeScript locale, classee `Category: New`, hors C/H direct.
- `createServerConsoleProcedures` est la factory locale qui expose la table `ServerConsoleProcedures`; elle contient les portages proprietaires internes de `server/sv_ccmds.c` mais n'est pas elle-meme une entite C/H.
