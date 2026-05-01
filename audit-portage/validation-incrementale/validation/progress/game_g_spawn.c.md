# Progress - Quake-2-master/game/g_spawn.c

## Dernier lot traite

- 2026-05-01: `spawn_t` et champ/table `name`; preuve de branchement des premiers wrappers health `SP_item_health*`.

## Verdict du lot

- `spawn_t`: valide. Le struct C `{ char *name; void (*spawn)(edict_t *ent); }` est porte par `SpawnEntry` avec `name: string` et `spawn: SpawnFunction`; les pointeurs de fonction C sont representes par callbacks TypeScript `(entity, runtime) => void`. Le commentaire d'en-tete `spawn_t` a ete ajoute avec source, categorie, niveau de fidelite et note de portage.
- `name`: valide. Le champ C `name` de chaque entree est conserve comme `spawns[].name`; le harness verifie que les noms des quatre premieres entrees health sont presents, typés en string et associes a une fonction spawn.

## Branchement et integrations

- Runtime: attendu et branche. `ED_CallSpawn` utilise `FindItemByClassname`, puis parcourt `spawns` par `entry.name` et appelle `entry.spawn`; la preuve ajoutee couvre le dispatch effectif des classnames `item_health`, `item_health_small`, `item_health_large` et `item_health_mega` vers leurs callbacks.
- apps/web: attendu indirectement et branche via le runtime local/full-game. Les classnames map passent par `SpawnEntities`/`ED_CallSpawn`, puis par les snapshots, assets et sons consommes par l'application; aucune table de spawn parallele dans `apps/web` n'est attendue pour ce lot.
- renderer-three: attendu indirectement pour les sorties visibles produites par les spawn callbacks. Les wrappers health creent des entites MD2 visibles avec modele, `RF_GLOW`, assets et snapshots; la consommation renderer passe par les flux generiques `ClientRefreshFrame.entities`, modeles et scene Three.

## Corrections appliquees

- `packages/game/src/g_spawn.ts`: export de `SpawnEntry` et `spawns`, ajout du commentaire de portage pour `spawn_t`.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves sur la forme `spawn_t`/`name` et le dispatch des classnames health via `ED_CallSpawn`.

## Tests

- `npm run verify:g-spawn`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:full-game:three-renderer`: ok le 2026-05-01.
- `npm run verify:web-render-order`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.

## Prochain lot recommande

- Valider formellement `SP_item_health`, `SP_item_health_small`, `SP_item_health_large` et `SP_item_health_mega`.
