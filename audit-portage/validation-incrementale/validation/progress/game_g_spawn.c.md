# Progress - Quake-2-master/game/g_spawn.c

## Dernier lot traite

- 2026-05-01: `SP_info_player_start`, `SP_info_player_deathmatch`, `SP_info_player_coop` et `SP_info_player_intermission`.
- 2026-05-01: `SP_item_health`, `SP_item_health_small`, `SP_item_health_large` et `SP_item_health_mega`.

## Verdict du lot

- `SP_info_player_start`: valide. La declaration/table de `game/g_spawn.c` est portee via `spawns[]` vers `packages/game/src/p_client.ts`; la fonction preserve le no-op hors coop et planifie `SP_CreateCoopSpots` a `level.time + FRAMETIME` sur `security`, avec creation des trois spots `jail3` d'origine.
- `SP_info_player_deathmatch`: valide. Hors deathmatch, la fonction appelle `G_FreeEdict`; en deathmatch, elle branche `SP_misc_teleporter_dest`, modele `models/objects/dmspot/tris.md2`, `SOLID_BBOX`, bounds et modelindex visible. Le cas edict-prefix protege reste non lie/non visible, compatible avec le garde original de `G_FreeEdict`.
- `SP_info_player_coop`: valide. Hors coop, la fonction appelle `G_FreeEdict`; en coop, elle conserve le spot et planifie `SP_FixCoopSpots` sur les maps originales, avec copie du `targetname` du `info_player_start` proche prouvee.
- `SP_info_player_intermission`: valide. Le no-op original conserve les champs parsed `origin`/`angles`; `BeginIntermission` les consomme ensuite pour `intermission_origin`, `intermission_angle`, `player_state.pmove.origin` et `viewangles`.
- `SP_item_health`: valide. Le prototype C de `g_spawn.c` est branche dans `spawns[]` sur le classname `item_health`; la cible `packages/game/src/g_items.ts` porte la logique de `game/g_items.c` avec test deathmatch/`DF_NO_HEALTH`, modele `models/items/healing/medium/tris.md2`, `count = 10`, `SpawnItem(FindItem("Health"))` et precache `items/n_health.wav`.
- `SP_item_health_small`: valide. Meme branchement `spawns[]`; la cible conserve le modele `models/items/healing/stimpack/tris.md2`, `count = 2`, `style = HEALTH_IGNORE_MAX`, `SpawnItem(FindItem("Health"))` et precache `items/s_health.wav`.
- `SP_item_health_large`: valide. Meme branchement `spawns[]`; la cible conserve le modele `models/items/healing/large/tris.md2`, `count = 25`, `SpawnItem(FindItem("Health"))` et precache `items/l_health.wav`.
- `SP_item_health_mega`: valide. Meme branchement `spawns[]`; la cible conserve le modele `models/items/mega_h/tris.md2`, `count = 100`, `style = HEALTH_IGNORE_MAX | HEALTH_TIMED`, `SpawnItem(FindItem("Health"))` et precache `items/m_health.wav`.

## Checklist appliquee

- Identification: matrice `game_g_spawn.c.md`, source `Quake-2-master/game/g_spawn.c`, definitions originales dans `game/g_items.c`, cible proprietaire `packages/game/src/g_items.ts`.
- Comparaison C/H vs TS: entrees `edict_t *self` vs `GameEntity, GameRuntime`, sorties void, branches `DF_NO_HEALTH`, effets de bord `model`, `count`, `style`, `SpawnItem`, sons et assets verifies.
- Commentaires d'en-tete: les quatre fonctions TS ont un commentaire `Original name`, `Source`, `Category: Ported`, `Fidelity level` et `Behavior`; pas d'ajustement necessaire.
- Runtime: valide. `SpawnEntities` parse les classnames de map, `ED_CallSpawn` parcourt `spawns[]`, appelle les callbacks health, puis `G_RunFrame` declenche `droptofloor` et publie un `s.modelindex` visible.
- apps/web: valide indirectement. Le flux navigateur doit declencher le runtime porte et consommer ses sorties via local/full-game; aucune table de spawn parallele n'est attendue dans `apps/web`.
- renderer-three: valide indirectement. Ces items produisent des entites MD2 visibles avec `RF_GLOW`; les sorties passent par snapshots/model configstrings vers `ClientRefreshFrame.entities`, puis `createThreeRefreshEntitySync` consomme `modelindex`, flags et modeles MD2.
- Identification: lot player/intermission dans matrice `game_g_spawn.c.md`, prototypes et `spawns[]` originaux dans `Quake-2-master/game/g_spawn.c`, definitions originales dans `game/p_client.c`, cible portee `packages/game/src/p_client.ts` importee par `packages/game/src/g_spawn.ts`.
- Comparaison C/H vs TS: entrees `edict_t *self` vs `GameEntity, GameRuntime`, sorties void, branches `coop`, `deathmatch`, map `security`, liste des maps coop fixup, appels `SP_CreateCoopSpots`, `SP_FixCoopSpots`, `G_FreeEdict`, `SP_misc_teleporter_dest`, no-op intermission et preservation origin/angles verifies.
- Commentaires d'en-tete: les quatre fonctions TS ont un commentaire `Original name`, `Source`, `Category: Ported`, `Fidelity level`; pas d'ajustement necessaire.
- Runtime: valide. `SpawnEntities` parse les classnames, reserve les slots clients, appelle `ED_CallSpawn` sur la table `spawns[]`; `G_RunFrame` execute les thinks coop; `PutClientInServer`/`SelectSpawnPoint` et `BeginIntermission` consomment ensuite les classnames player/intermission.
- apps/web: valide indirectement. Le flux navigateur full-game/newgame utilise le runtime porte pour creer la session, generer les snapshots et propager `playerstate`/refresh frame; aucune logique parallele de spawn player/intermission masquante n'a ete constatee.
- renderer-three: valide indirectement. `info_player_deathmatch` peut produire le modele visible `dmspot`; les cameras player/intermission passent par `ClientRefreshFrame.view.vieworg/viewangles`, puis `apps/web` synchronise la camera Three et `renderer-three` consomme ces vues dans `refresh-entity-sync`, dlights/particles et world adapter.

## Corrections appliquees

- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour les quatre classnames player/intermission, le dispatch `spawns[]`, le spot deathmatch visible, les hacks coop `security`/fixup, et le flux intermission/camera.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour le flux map normal `SpawnEntities` -> `ED_CallSpawn` -> callbacks health -> `G_RunFrame`/`droptofloor`, et pour le rejet `DF_NO_HEALTH` en deathmatch sur les quatre variantes.

## Tests

- `npm run verify:p-client`: ok le 2026-05-01.
- `npm run verify:p-hud`: ok le 2026-05-01.
- `npm run verify:full-game:newgame`: ok le 2026-05-01.
- `npm run verify:g-spawn`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:full-game:three-renderer`: ok le 2026-05-01.
- `npm run verify:web-render-order`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.

## Prochain lot recommande

- Valider `SP_func_plat`, `SP_func_rotating`, `SP_func_button` et `SP_func_door` si le lot reste raisonnable.
