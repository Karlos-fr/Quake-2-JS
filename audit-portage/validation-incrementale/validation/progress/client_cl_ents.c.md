# Progress - Quake-2-master/client/cl_ents.c

## Dernier lot valide

- 2026-05-07: gros premier lot parsing/interpolation des packet entities valide: `bitcounts`, `CL_ParseEntityBits`, locaux `i`/`number`, `CL_ParseDelta`, `CL_DeltaEntity`, local `state`, `CL_ParsePacketEntities`, locaux `newnum`/`bits`/`oldstate`.
- `bitcounts` et les temporaires locaux sont `Non applicable` car ils ne sont pas des entites TS proprietaires; `bitcounts` etait seulement un compteur C de profiling protocole.

## Preuves de session

- Comparaison C/TS effectuee entre `Quake-2-master/client/cl_ents.c` et `packages/client/src/cl_parse.ts`.
- Commentaires d'en-tete verifies pour `CL_ParseEntityBits`, `CL_ParseDelta`, `CL_DeltaEntity`, `CL_ParsePacketEntities`.
- Runtime verifie depuis `CL_ParseServerMessage -> CL_ParseFrame -> CL_ParsePacketEntities`.
- `apps/web` verifie via `createFullGameServerRenderSource` et les snapshots serveur.
- `renderer-three` verifie via la consommation refresh-entity des modeles/frames/sprites/weapon bridge.

## Tests lances

- `npm run verify:cl-parse`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:refresh-entity:alias-flags`
- `npm run verify:refresh-entity:sprite`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:refresh-entity:weapon`
- `npm run typecheck`

## Blocages / remarques

- `npm run verify:entities:phase5` echoue hors lot sur l'attente instable `EF_TRAP light intensity` (`124 != 150`, puis `146 != 150`), liee aux effets/lumieres de `CL_AddPacketEntities`, pas au parsing `CL_ParsePacketEntities`.

## Prochain lot recommande

- `CL_ParsePlayerstate` et ses locaux (`flags`, `state`, `i`, `statbits`), avec verification camera/playerstate, areabits et consommation renderer/web.
