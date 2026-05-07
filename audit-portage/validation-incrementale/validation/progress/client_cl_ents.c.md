# Progress - Quake-2-master/client/cl_ents.c

## Dernier lot valide

- 2026-05-07: gros premier lot parsing/interpolation des packet entities valide: `bitcounts`, `CL_ParseEntityBits`, locaux `i`/`number`, `CL_ParseDelta`, `CL_DeltaEntity`, local `state`, `CL_ParsePacketEntities`, locaux `newnum`/`bits`/`oldstate`.
- `bitcounts` et les temporaires locaux sont `Non applicable` car ils ne sont pas des entites TS proprietaires; `bitcounts` etait seulement un compteur C de profiling protocole.
- 2026-05-07: lot playerstate/frame valide: `CL_ParsePlayerstate`, temporaires `flags`/`state`/`i`/`statbits`, `memset`, `CL_FireEntityEvents`, temporaire `s1`, `CL_ParseFrame`, temporaires `cmd`/`len`/`old`.
- Les temporaires et `memset` sont `Non applicable`: ils sont couverts par les fonctions portees ou remplaces par les helpers TS `createFrame`/copie playerstate.

## Preuves de session

- Comparaison C/TS effectuee entre `Quake-2-master/client/cl_ents.c` et `packages/client/src/cl_parse.ts`.
- Commentaires d'en-tete verifies pour `CL_ParseEntityBits`, `CL_ParseDelta`, `CL_DeltaEntity`, `CL_ParsePacketEntities`.
- Runtime verifie depuis `CL_ParseServerMessage -> CL_ParseFrame -> CL_ParsePacketEntities`.
- `apps/web` verifie via `createFullGameServerRenderSource` et les snapshots serveur.
- `renderer-three` verifie via la consommation refresh-entity des modeles/frames/sprites/weapon bridge.
- Comparaison C/TS effectuee pour `CL_ParsePlayerstate`, `CL_FireEntityEvents` et `CL_ParseFrame` entre `client/cl_ents.c`, `packages/client/src/cl_parse.ts` et `packages/client/src/cl_ents.ts`.
- Commentaires d'en-tete verifies pour `CL_ParsePlayerstate`, `CL_FireEntityEvents` et `CL_ParseFrame`.
- Runtime verifie depuis `CL_ParseServerMessage -> CL_ParseFrame -> CL_ParsePlayerstate/CL_ParsePacketEntities/CL_FireEntityEvents`.
- `apps/web` verifie via `apps/web/src/full-game-server-host.ts` et `apps/web/src/full-game.ts`: le flux web appelle le parser runtime porte et consomme camera/playerstate/areabits par la render source.
- `renderer-three` verifie via `refresh-entity-sync`, `gl-world-scene-adapter`, `gl_rsurf` et `gl_rmain`: camera/refdef, `rdflags`, `areabits`, modeles/frames et scene sont consommes depuis les sorties runtime.

## Tests lances

- `npm run verify:cl-parse`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:refresh-entity:alias-flags`
- `npm run verify:refresh-entity:sprite`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:refresh-entity:weapon`
- `npm run typecheck`
- `npm run verify:cl-parse`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npx tsx ./scripts/verify/quake2-cl-view.ts`
- `npm run verify:refresh-entity:alias-flags`
- `npm run verify:refresh-entity:sprite`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:entities:phase8:scene`
- `npm run typecheck`

## Blocages / remarques

- `npm run verify:entities:phase5` echoue hors lot sur l'attente instable `EF_TRAP light intensity` (`124 != 150`, puis `146 != 150`), liee aux effets/lumieres de `CL_AddPacketEntities`, pas au parsing `CL_ParsePacketEntities`.

## Prochain lot recommande

- `S_RegisterSexedModel` et ses locaux (`n`, `p`, `model`, `buffer`), puis `CL_AddPacketEntities` si le lot reste coherent; ne pas deborder sur `cl_fx`/`cl_tent`.
