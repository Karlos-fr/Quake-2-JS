# Progress TS - packages/server/src/sv_world.ts

- Statut: Termine
- Dernier lot valide: 2026-05-28 - 18 symboles de la matrice TS valides.
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_server_src_sv_world.ts.md`
- Matrice C/H croisee: `audit-portage/validation-incrementale/validation/matrices/server_sv_world.c.md`
- Fichier TS: `packages/server/src/sv_world.ts`

## Lot valide

- Constants et types portes: `AREA_DEPTH`, `AREA_NODES`, `MAX_TOTAL_ENT_LEAFS`, `areanode_t`, `moveclip_t`.
- Helpers/runtime TS nouveaux: `ServerWorldState`, `ServerWorldContext`, `createServerWorldProcedures`, `createServerWorldState`, `getServerModel`.
- Helpers et fonctions proprietaires `server/sv_world.c`: `ClearLink`, `RemoveLink`, `InsertLinkBefore`, `SV_CreateAreaNode`, `SV_AreaEdicts_r`, `SV_HullForEntity`, `SV_ClipMoveToEntities`, `SV_TraceBounds`.

## Decisions

- `areanode_t` est le symbole TS proprietaire du struct C `areanode_s` expose via typedef `areanode_t`.
- Les procedures exportees imbriquees `SV_ClearWorld`, `SV_UnlinkEdict`, `SV_LinkEdict`, `SV_AreaEdicts`, `SV_PointContents` et `SV_Trace` restent validees via la matrice C/H `server_sv_world.c.md` et le chemin runtime `ServerWorldProcedures`.
- `ServerWorldState`, `ServerWorldContext`, `createServerWorldProcedures`, `createServerWorldState` et `getServerModel` sont du code nouveau de liaison explicite pour remplacer les globals C, sans ownership C/H direct.

## Tests de reference

- `npm run verify:server:world`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run typecheck`
- `git diff --check`

## Prochain lot

- Aucun.
