# Progress - Quake-2-master/server/server.h

## Lot valide pendant cette session

- Bloc initial `server.h`: `MAX_MASTERS`, `server_state_t`, `server_t` et ses champs generes par la matrice (`attractloop`, `loadgame`, `time`, `framenum`, `name`, `models`, `baselines`, `multicast`, `multicast_buf`, `demofile`, `timedemo`), macros `EDICT_NUM` / `NUM_FOR_EDICT`, `client_state_t`, `client_frame_t` et ses champs (`areabytes`, `areabits`, `ps`, `num_entities`, `first_entity`, `senttime`), puis `LATENCY_COUNTS` et `RATE_MESSAGES`.

## Preuves

- Comparaison source `Quake-2-master/server/server.h` vs port proprietaire `packages/server/src/server.ts`.
- Commentaires d'en-tete verifies pour les entites portees et helpers/adapters concernes.
- `npm run verify:server:header`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Decisions d'integration

- Runtime: integre via `createServerState`, `createClientFrame`, `createServerHeaderState`, les procedures `sv_*` et le flux `SV_Frame` de la facade serveur.
- `apps/web`: integre via `createFullGameServerHost`, qui instancie et consomme l'etat serveur pour `newgame`, frames serveur locales, configstrings, baselines et snapshots client.
- `packages/renderer-three`: integration indirecte attendue et verifiee via les snapshots client; `areabits`, `player_state_t`, entites packetisees, configstrings et baselines alimentent l'etat client rendu par le renderer.

## Prochain lot recommande

- Continuer le bloc `client_s`: `client_s` / `client_t` et ses champs de `userinfo` a `netchan`, avec `LATENCY_COUNTS` / `RATE_MESSAGES` deja valides comme contexte.

## Blocages

- Aucun.
