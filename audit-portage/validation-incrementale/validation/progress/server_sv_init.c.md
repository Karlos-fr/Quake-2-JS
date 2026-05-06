# Progress - Quake-2-master/server/sv_init.c

## Etat courant

- Statut: Termine
- Dernier lot valide: fichier complet `sv_init.c`.
- Compteurs matrice: 30 entites, 13 validees, 17 non applicables.

## Lot traite pendant cette session

Lot complet et coherent spawn/init/configstrings/baselines:

- `sv`
- `SV_FindIndex`
- `SV_ModelIndex`
- `SV_SoundIndex`
- `SV_ImageIndex`
- `SV_CreateBaseline`
- `SV_CheckForSavegame`
- `SV_SpawnServer`
- `SV_InitGame`
- `SV_Map`

Les lignes `i`, `svent`, `entnum`, `name`, `f`, `previousState`, `checksum`, `ent`, `idmaster`, `level`, `ch`, `l` et `spawnpoint` sont des variables locales generees comme globals par la matrice; elles sont marquees `Non applicable`.

## Preuves obtenues

- Comparaison source C `Quake-2-master/server/sv_init.c` vs `packages/server/src/sv_init.ts`.
- Commentaires d'en-tete des fonctions portees verifies et completes avec `Behavior` / `Porting notes`.
- Runtime verifie via `createServerRuntimeFacade`, commandes `sv_ccmds`, callbacks game import et flux `SV_Map` / `SV_SpawnServer` / `SV_Frame`.
- `apps/web` verifie via `apps/web/src/full-game-server-host.ts`: map loading, savegame callbacks, configstrings, baselines et snapshots passent par le runtime serveur porte.
- `renderer-three` verifie comme consommation indirecte: configstrings model/sound/image, baselines, snapshots, areabits et frames client alimentent le client puis les adapters renderer.

## Tests de reference

- `npm run verify:server:init`
- `npm run verify:server:runtime`
- `npm run verify:server:user`
- `npm run verify:server:ents`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Decisions

- Le global C `sv` est represente par `ServerInitContext.sv` partage par `runtime.ts`; ce choix est conforme au portage TypeScript explicite.
- `SV_FindIndex` apparait plusieurs fois dans la matrice; chaque ligne est le meme port proprietaire valide.
- Aucun manque runtime, web ou renderer ouvert pour ce fichier.

## Prochain lot recommande

Aucun pour `server/sv_init.c`; reprendre un autre fichier serveur prioritaire depuis `AVANCEMENT_GLOBAL.md`.
