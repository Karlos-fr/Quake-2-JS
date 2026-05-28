# Progress TS croise - packages/server/src/sv_ents.ts

## Etat courant

- Statut: Termine
- Dernier lot valide: les 14 symboles de la matrice TS, incluant `SV_FatPVS`, `fatpvs`, les helpers d'entites/client snapshot et la factory `createServerEntityProcedures`.
- Matrice C/H croisee: `audit-portage/validation-incrementale/validation/matrices/server_sv_ents.c.md`.
- Decision: `SV_FatPVS` et `fatpvs` sont les proprietaires TS attendus des entites C/H validees dans `server_sv_ents.c.md`; les fonctions originales imbriquees exposees par `createServerEntityProcedures` restent proprietaires dans ce fichier et sont couvertes par la matrice C/H.
- Entites nouvelles explicitees: `ServerEntityContext`, `DUMMY_PLAYER_STATE`, `NULL_ENTITY_STATE`, `UNSET_ENTITY_NUM`, `FATPVS_LEAF_BYTES`, `createServerEntityProcedures`, `getClientEntityState`, `getWritableClientEntityState`, `getMaxclientsValue`, `copyEntityState`, `clonePlayerState` et `formatServerError`.

## Tests de reference

- `npm run verify:server:ents`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run typecheck`
- `git diff --check`

## Integration

- Runtime serveur: integre via `createServerRuntimeFacade`, `sv_send` et `sv_main`.
- `apps/web`: integre via `apps/web/src/full-game-server-host.ts`, qui appelle `SV_BuildClientFrame` puis `SV_WriteFrameToClient`.
- `renderer-three`: non applicable directement; ce fichier produit les snapshots serveur consommes ensuite par le client et le chemin renderer.

## Prochain lot recommande

Aucun pour ce fichier.

## Blocages

Aucun blocage identifie.
