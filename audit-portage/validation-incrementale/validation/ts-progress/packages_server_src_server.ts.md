# Progress TS croise - packages/server/src/server.ts

## Etat courant

- Statut: Termine
- Dernier lot valide: `redirect_t`, `ServerHeaderState`, toutes les interfaces `Server*Procedures`, les factories `create*`, `EDICT_NUM`, `NUM_FOR_EDICT` et `computeServerClientEntityCapacity`.
- Matrice C/H croisee: `audit-portage/validation-incrementale/validation/matrices/server_server.h.md`.
- Decision: les symboles portes de `server.h` (`redirect_t`, `EDICT_NUM`, `NUM_FOR_EDICT`) sont proprietaires dans `packages/server/src/server.ts` et couverts par les lignes `Valide` de `server_server.h.md`. Les interfaces `Server*Procedures` sont des bundles de signatures TypeScript; les implementations restent proprietaires dans les fichiers `sv_*.ts` valides par leurs matrices C/H. `ServerPhysicsProcedures` ne prend pas l'ownership de `SV_PrepWorldFrame`, conserve par `ServerMainProcedures`/`sv_main.ts`.
- Entites nouvelles explicitees: `cmodel_s` (`N/A (opaque local type)`), `MAX_PACKET_ENTITIES` (`N/A (derived server ring size constant)`), `ServerHeaderState`, toutes les interfaces `Server*Procedures`, les factories `create*` et `computeServerClientEntityCapacity`.

## Tests de reference

- `npm run verify:server:header`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run typecheck`
- `git diff --check`

## Prochain lot recommande

Aucun dans la matrice TS actuelle.

## Blocages

Aucun blocage identifie dans ce lot.
