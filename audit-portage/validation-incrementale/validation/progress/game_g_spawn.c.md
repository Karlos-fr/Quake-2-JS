# Progress - Quake-2-master/game/g_spawn.c

## Dernier lot traite

- 2026-05-01: `SP_func_door_secret`, `SP_func_door_rotating`, `SP_func_water` et `SP_func_train`.
- 2026-05-01: `SP_func_plat`, `SP_func_rotating`, `SP_func_button` et `SP_func_door`.
- 2026-05-01: `SP_info_player_start`, `SP_info_player_deathmatch`, `SP_info_player_coop` et `SP_info_player_intermission`.
- 2026-05-01: `SP_item_health`, `SP_item_health_small`, `SP_item_health_large` et `SP_item_health_mega`.

## Verdict du lot

- `SP_func_door_secret`: valide. Le prototype et l'entree `func_door_secret` de `game/g_spawn.c` sont portes via `spawns[]` vers `packages/game/src/g_func.ts`; la fonction conserve les sons fixes, `MOVETYPE_PUSH`, `SOLID_BSP`, callbacks secret, defaults damage/wait/speed, calculs `pos1`/`pos2`, shootability, rewrite `classname = "func_door"` et linkage. Correction appliquee: le precache `misc/talk.wav` pour porte ciblee avec message est maintenant effectue comme dans le C.
- `SP_func_door_rotating`: valide. Le dispatch `func_door_rotating` atteint `SP_func_door_rotating`; le port conserve le reset d'angles, axes X/Y/Z, reverse, distance, `START_OPEN`, defaults speed/accel/decel/wait/dmg, sons, callbacks `door_blocked`/`door_use`, damage/message touch, `EF_ANIM_ALL`, teammaster, link et think `Think_CalcMoveSpeed`/`Think_SpawnDoorTrigger`.
- `SP_func_water`: valide. Le dispatch `func_water` atteint `SP_func_water`; le port conserve movedir, `MOVETYPE_PUSH`, `SOLID_BSP`, setmodel, sons eau/lave, calcul de distance avec `lip`, `START_OPEN`, positions start/end, defaults speed/wait, callback `door_use`, `DOOR_TOGGLE` quand `wait == -1`, rewrite `classname = "func_door"` et link.
- `SP_func_train`: valide. Le dispatch `func_train` atteint `SP_func_train`; le port conserve `MOVETYPE_PUSH`, reset angles, `train_blocked`, `TRAIN_BLOCK_STOPS`, default damage, `SOLID_BSP`, setmodel, son `noise`, default speed, moveinfo accel/decel, `train_use`, link, warning sans target et think `func_train_find` sur le frame suivant.
- `SP_func_plat`: valide. Le prototype et l'entree `func_plat` de `game/g_spawn.c` sont portes via `spawns[]` vers `packages/game/src/g_func.ts`; la fonction conserve `SOLID_BSP`, `MOVETYPE_PUSH`, le modele inline, les defaults speed/accel/decel/dmg, le calcul top/bottom, `Use_Plat`, `plat_spawn_inside_trigger`, le state initial targetnamed/non-targetnamed et les sons.
- `SP_func_rotating`: valide. Le dispatch `func_rotating` atteint `SP_func_rotating`; le port conserve `SOLID_BSP`, `MOVETYPE_PUSH`/`MOVETYPE_STOP`, choix d'axe, `REVERSE`, defaults speed/dmg, callbacks `rotating_use`/`rotating_blocked`, `START_ON`, flags `EF_ANIM_ALL`/`EF_ANIM_ALLFAST`, setmodel/link.
- `SP_func_button`: valide. Le dispatch `func_button` atteint `SP_func_button`; le port conserve direction, `MOVETYPE_STOP`, `SOLID_BSP`, setmodel, son par defaut/silence, speed/accel/decel/wait/lip, positions `pos1`/`pos2`, callbacks use/touch/die, damage shootable, animation idle et moveinfo.
- `SP_func_door`: valide. Le dispatch `func_door` atteint `SP_func_door`; le port conserve sons, direction, `MOVETYPE_PUSH`, `SOLID_BSP`, setmodel, blocked/use, speed deathmatch, accel/decel/wait/lip/dmg, positions start/open, damage/message touch, moveinfo, flags d'animation, teammaster, link et think `Think_CalcMoveSpeed`/`Think_SpawnDoorTrigger`.
- `SP_info_player_start`: valide. La declaration/table de `game/g_spawn.c` est portee via `spawns[]` vers `packages/game/src/p_client.ts`; la fonction preserve le no-op hors coop et planifie `SP_CreateCoopSpots` a `level.time + FRAMETIME` sur `security`, avec creation des trois spots `jail3` d'origine.
- `SP_info_player_deathmatch`: valide. Hors deathmatch, la fonction appelle `G_FreeEdict`; en deathmatch, elle branche `SP_misc_teleporter_dest`, modele `models/objects/dmspot/tris.md2`, `SOLID_BBOX`, bounds et modelindex visible. Le cas edict-prefix protege reste non lie/non visible, compatible avec le garde original de `G_FreeEdict`.
- `SP_info_player_coop`: valide. Hors coop, la fonction appelle `G_FreeEdict`; en coop, elle conserve le spot et planifie `SP_FixCoopSpots` sur les maps originales, avec copie du `targetname` du `info_player_start` proche prouvee.
- `SP_info_player_intermission`: valide. Le no-op original conserve les champs parsed `origin`/`angles`; `BeginIntermission` les consomme ensuite pour `intermission_origin`, `intermission_angle`, `player_state.pmove.origin` et `viewangles`.
- `SP_item_health`: valide. Le prototype C de `g_spawn.c` est branche dans `spawns[]` sur le classname `item_health`; la cible `packages/game/src/g_items.ts` porte la logique de `game/g_items.c` avec test deathmatch/`DF_NO_HEALTH`, modele `models/items/healing/medium/tris.md2`, `count = 10`, `SpawnItem(FindItem("Health"))` et precache `items/n_health.wav`.
- `SP_item_health_small`: valide. Meme branchement `spawns[]`; la cible conserve le modele `models/items/healing/stimpack/tris.md2`, `count = 2`, `style = HEALTH_IGNORE_MAX`, `SpawnItem(FindItem("Health"))` et precache `items/s_health.wav`.
- `SP_item_health_large`: valide. Meme branchement `spawns[]`; la cible conserve le modele `models/items/healing/large/tris.md2`, `count = 25`, `SpawnItem(FindItem("Health"))` et precache `items/l_health.wav`.
- `SP_item_health_mega`: valide. Meme branchement `spawns[]`; la cible conserve le modele `models/items/mega_h/tris.md2`, `count = 100`, `style = HEALTH_IGNORE_MAX | HEALTH_TIMED`, `SpawnItem(FindItem("Health"))` et precache `items/m_health.wav`.

## Checklist appliquee

- Identification: lot brush movers dans matrice `game_g_spawn.c.md`, prototypes et `spawns[]` originaux dans `Quake-2-master/game/g_spawn.c`, definitions originales dans `game/g_func.c`, cible portee `packages/game/src/g_func.ts` importee par `packages/game/src/g_spawn.ts`.
- Comparaison C/H vs TS: entrees `edict_t *` vs `GameEntity, GameRuntime`, sorties void, classnames `func_door_secret`/`func_door_rotating`/`func_water`/`func_train`, flags, defaults, callbacks, modeles inline, moveinfo, sons, damage, path_corner/train, areaportal secret et effects verifies.
- Commentaires d'en-tete: les quatre fonctions TS ont un commentaire `Original name`, `Source`, `Category: Ported`, `Fidelity level`, `Behavior` et notes de portage; pas d'ajustement necessaire.
- Runtime: valide. `SpawnEntities` parse le texte map, `ED_CallSpawn` dispatch par `spawns[]`, les quatre brush entities sont liees avec `modelindex` inline; `G_RunFrame` execute les thinks `func_train_find` et move-speed pour portes ciblees.
- apps/web: valide indirectement. Le navigateur doit utiliser ces sorties via le runtime porte; aucune logique parallele de spawn brush n'a ete detectee. Les transforms/modelindex inline passent par refresh frames, snapshots et le flux full-game/local.
- renderer-three: valide indirectement. Ces entites produisent des brush models inline visibles ou mobiles; `apps/web` publie les snapshots de brush models et `packages/renderer-three/src/refresh-entity-sync.ts`/pipeline renderer consomme origin/angles/modelindex pour les instances inline-brush.
- Identification: lot brush spawn dans matrice `game_g_spawn.c.md`, prototypes et `spawns[]` originaux dans `Quake-2-master/game/g_spawn.c`, definitions originales dans `game/g_func.c`, cible portee `packages/game/src/g_func.ts` importee par `packages/game/src/g_spawn.ts`.
- Comparaison C/H vs TS: entrees `edict_t *ent` vs `GameEntity, GameRuntime`, sorties void, classnames `func_plat`/`func_rotating`/`func_button`/`func_door`, flags, defaults, callbacks, modeles inline, moveinfo, sons, damage, triggers et effects verifies.
- Commentaires d'en-tete: les quatre fonctions TS ont un commentaire `Original name`, `Source`, `Category: Ported`, `Fidelity level`, `Behavior` et notes de portage quand utiles; pas d'ajustement necessaire.
- Runtime: valide. `SpawnEntities` parse le texte map, `ED_CallSpawn` dispatch par `spawns[]`, les quatre brush entities sont liees avec `modelindex` inline, `func_plat` cree son trigger interne, `func_door` execute son think via `G_RunFrame`, et `g_func` couvre use/touch/think/mover callbacks.
- apps/web: valide indirectement. Le navigateur doit consommer ces sorties de runtime via local/full-game; aucune logique parallele de spawn brush n'a ete detectee. Les brush transforms visibles passent par refresh frames et snapshots.
- renderer-three: valide indirectement. Ces entites produisent des brush models inline visibles/mouvants; `apps/web` extrait les modeles `*N` et poses, et `packages/renderer-three/src/refresh-entity-sync.ts` conserve/positionne les instances inline-brush avec origin/angles.
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

- `packages/game/src/g_func.ts`: ajout du precache `misc/talk.wav` dans `SP_func_door_secret` quand une porte ciblee avec `message` installe `door_touch`, comme dans `game/g_func.c`.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour `func_door_secret`, `func_door_rotating`, `func_water` et `func_train`, leur presence dans `spawns[]`, le dispatch map `SpawnEntities`/`ED_CallSpawn`, les modeles inline, les callbacks, les sons, le rewrite de classname, le `path_corner` de train et les thinks executes par `G_RunFrame`.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour les quatre classnames brush `func_plat`, `func_rotating`, `func_button` et `func_door`, leur presence dans `spawns[]`, le dispatch map `SpawnEntities`/`ED_CallSpawn`, les modeles inline, le trigger interne de plat, les effects, callbacks et le think door execute par `G_RunFrame`.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour les quatre classnames player/intermission, le dispatch `spawns[]`, le spot deathmatch visible, les hacks coop `security`/fixup, et le flux intermission/camera.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour le flux map normal `SpawnEntities` -> `ED_CallSpawn` -> callbacks health -> `G_RunFrame`/`droptofloor`, et pour le rejet `DF_NO_HEALTH` en deathmatch sur les quatre variantes.

## Tests

- `npm run verify:g-spawn`: ok le 2026-05-01.
- `npm run verify:g-func`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:full-game:three-renderer`: ok le 2026-05-01.
- `npm run verify:web-render-order`: ok le 2026-05-01.
- `npm run verify:local-gameplay-sync`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.
- `npm run verify:g-func`: ok le 2026-05-01.
- `npm run verify:local-gameplay-sync`: ok le 2026-05-01.
- `npm run verify:p-client`: ok le 2026-05-01.
- `npm run verify:p-hud`: ok le 2026-05-01.
- `npm run verify:full-game:newgame`: ok le 2026-05-01.
- `npm run verify:g-spawn`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:full-game:three-renderer`: ok le 2026-05-01.
- `npm run verify:web-render-order`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.

## Prochain lot recommande

- Valider `SP_func_conveyor`, puis `SP_func_wall`/`SP_func_object` si le lot reste coherent entre `g_spawn.c`, `g_func.ts` et `g_misc.ts`.
