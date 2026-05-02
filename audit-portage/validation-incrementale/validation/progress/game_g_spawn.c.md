# Progress - Quake-2-master/game/g_spawn.c

## Dernier lot traite

- 2026-05-01: `SP_func_clock`.
- 2026-05-01: `SP_func_timer` et `SP_func_killbox`.
- 2026-05-01: `SP_func_explosive` et `SP_func_areaportal`.
- 2026-05-01: `SP_func_conveyor`, `SP_func_wall` et `SP_func_object`.
- 2026-05-01: `SP_func_door_secret`, `SP_func_door_rotating`, `SP_func_water` et `SP_func_train`.
- 2026-05-01: `SP_func_plat`, `SP_func_rotating`, `SP_func_button` et `SP_func_door`.
- 2026-05-01: `SP_info_player_start`, `SP_info_player_deathmatch`, `SP_info_player_coop` et `SP_info_player_intermission`.
- 2026-05-01: `SP_item_health`, `SP_item_health_small`, `SP_item_health_large` et `SP_item_health_mega`.
- 2026-05-02: verification de dispatch `light` sans validation d'entite proprietaire `g_spawn.c`.
- 2026-05-02: `SP_worldspawn`, `single_statusbar` et `dm_statusbar`.

## Verdict du lot

- `SP_worldspawn`: valide. Le port conserve l'initialisation world edict `MOVETYPE_PUSH`, `SOLID_BSP`, `inuse`, `s.modelindex = 1`, et le reste des effets C est coordonne par `SpawnEntities`/`configureWorldspawn`: `InitBodyQue`, `SetItemNames`, `level.nextmap`, `CS_NAME`, `CS_SKY`, `CS_SKYROTATE`, `CS_SKYAXIS`, `CS_CDTRACK`, `CS_MAXCLIENTS`, `CS_STATUSBAR`, images HUD, `sv_gravity`, sons globaux, precache `Blaster` et lightstyles standards `CS_LIGHTS + 0..11` et `CS_LIGHTS + 63`. Correction appliquee pendant la session: publication des lightstyles standards manquants.
- `single_statusbar`: valide. La constante TS reprend le programme statusbar solo original et le branchement `CS_STATUSBAR` solo a ete prouve par `verify:g-spawn`.
- `dm_statusbar`: valide. La constante TS reprend le programme deathmatch original et le branchement `CS_STATUSBAR` deathmatch a ete prouve par `verify:g-spawn`.
- `SP_func_clock`: valide. Le prototype et l'entree `func_clock` de `game/g_spawn.c` sont portes via `spawns[]` vers `packages/game/src/g_misc.ts`; la fonction conserve les rejets no-target/no-count avec warning et `G_FreeEdict`, le default `TIMER_UP` a une heure, `CLOCK_MESSAGE_SIZE`, `func_clock_reset`, le callback `func_clock_use` pour `START_OFF`, le scheduling `level.time + 1`, les formats `xx`/`xx:xx`/`xx:xx:xx`, la branche heure locale, la mise a jour `target_string`, le `pathtarget`, le reset multi-use et le one-shot non multi-use.
- `SP_func_timer`: valide. Le prototype et l'entree `func_timer` de `game/g_spawn.c` sont portes via `spawns[]` vers `packages/game/src/g_func.ts`; la fonction conserve le default `wait = 1`, les callbacks `func_timer_use`/`func_timer_think`, le clamp `random >= wait`, `SVF_NOCLIENT`, `START_ON`, `st.pausetime`, `delay`, l'activator `self`, `G_UseTargets` et le reschedule `level.time + wait + crandom() * random`.
- `SP_func_killbox`: valide. Le prototype et l'entree `func_killbox` de `game/g_spawn.c` sont portes via `spawns[]` vers `packages/game/src/g_func.ts`; la fonction conserve `gi.setmodel` via `setGameEntityModel`, `use_killbox`, `SVF_NOCLIENT`, et `use_killbox` delegue a `KillBox` pour telefrag les occupants.
- `SP_func_explosive`: valide. Le prototype et l'entree `func_explosive` de `game/g_spawn.c` sont portes via `spawns[]` vers `packages/game/src/g_misc.ts`; la fonction conserve le retrait deathmatch, `MOVETYPE_PUSH`, le precache des debris, le modele inline, le mode trigger-spawn cache puis revele, le mode cible non shootable, le mode shootable avec health/die par defaut, les flags `EF_ANIM_ALL`/`EF_ANIM_ALLFAST`, les debris, `T_RadiusDamage`, `G_UseTargets`, `BecomeExplosion1` ou `G_FreeEdict`.
- `SP_func_areaportal`: valide. Le prototype et l'entree `func_areaportal` de `game/g_spawn.c` sont portes via `spawns[]` vers `packages/game/src/g_misc.ts`; la fonction conserve `Use_Areaportal`, `count = 0` au spawn et le toggle open/close applique au monde collision via `CM_SetAreaPortalState` quand disponible.
- `SP_func_conveyor`: valide. Le prototype et l'entree `func_conveyor` de `game/g_spawn.c` sont portes via `spawns[]` vers `packages/game/src/g_func.ts`; la fonction conserve le default speed 100, la sauvegarde dans `count` quand `START_ON` est absent, le callback `func_conveyor_use`, `SOLID_BSP`, le modele inline et le link runtime.
- `SP_func_wall`: valide. Le prototype et l'entree `func_wall` de `game/g_spawn.c` sont portes via `spawns[]` vers `packages/game/src/g_misc.ts`; la fonction conserve `MOVETYPE_PUSH`, le modele inline, les flags `EF_ANIM_ALL`/`EF_ANIM_ALLFAST`, le mode wall simple, le forcage `TRIGGER_SPAWN`, le cas `START_ON` sans `TOGGLE`, le callback `func_wall_use`, `SVF_NOCLIENT`, `KillBox` et le relink.
- `SP_func_object`: valide. Le prototype et l'entree `func_object` de `game/g_spawn.c` sont portes via `spawns[]` vers `packages/game/src/g_misc.ts`; la fonction conserve le modele inline, le shrink des bounds, le default `dmg = 100`, le spawn simple avec release planifiee, le trigger spawn cache, `func_object_use`, les flags d'animation, `MASK_MONSTERSOLID` et le link.
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
- `SP_light`: preuve de dispatch conservee, mais pas comptee comme entite proprietaire de `g_spawn.c`. La definition originale est dans `game/g_misc.c` et la matrice `game_g_misc.c.md` valide deja `SP_light`; pour `g_spawn.c`, seule l'entree `spawns[]`/`light` releve du fichier courant.

## Checklist appliquee

- Identification: lot `SP_worldspawn` dans matrice `game_g_spawn.c.md`, definition originale dans `Quake-2-master/game/g_spawn.c`, cible portee `packages/game/src/g_spawn.ts` avec effets larges coordonnes par `packages/game/src/g_main.ts`; constantes associees `single_statusbar` et `dm_statusbar` dans le meme fichier source/cible.
- Comparaison C/H vs TS: entrees `edict_t *ent` vs `GameEntity, GameRuntime`, sortie void, world edict, configstrings, statusbars, images HUD, items, gravity, sons, precaches et lightstyles standards verifies.
- Commentaires d'en-tete: `SP_worldspawn`, `single_statusbar`, `dm_statusbar` et le bloc `SP_worldspawn sound precache block` ont les metadonnees de portage; `SP_worldspawn` documente le partage des effets avec `g_main.ts`.
- Runtime: valide. `SpawnEntities` appelle `ED_CallSpawn(worldspawn)` puis `configureWorldspawn`; `InitBodyQue`, `PlayerTrail_Init`, configstrings et precaches sont atteignables depuis l'export `GetGameApi.SpawnEntities`.
- apps/web: valide. Le flux serveur/web appelle `SpawnEntities` via l'API game portee et consomme les configstrings/snapshots; aucune logique parallele worldspawn masquante n'a ete constatee. Les tests full-game couvrent le host.
- renderer-three: valide. Les sorties visibles attendues sont les sky configstrings, statusbar cote client et surtout lightstyles BSP; le renderer consomme `ClientRefreshFrame.lightStyles`, verifie par les tests local gameplay et Three.
- Tests/correction: `packages/game/src/g_main.ts` publie maintenant les lightstyles standards `CS_LIGHTS + 0..11` et `+63`; `scripts/verify/quake2-g-spawn.ts` couvre statusbars solo/deathmatch et lightstyles worldspawn.
- Identification: lot `SP_func_clock` dans matrice `game_g_spawn.c.md`, prototype et entree `func_clock` originaux dans `Quake-2-master/game/g_spawn.c`, definition originale dans `game/g_misc.c`, cible portee `packages/game/src/g_misc.ts` importee par `packages/game/src/g_spawn.ts`. La matrice n'avait pas de ligne directe pour ce prototype; une ligne explicite `SP_func_clock` a ete ajoutee.
- Comparaison C/H vs TS: entrees `edict_t *self` vs `GameEntity, GameRuntime`, sorties void, classnames, flags `TIMER_UP`/`TIMER_DOWN`/`START_OFF`/`MULTI_USE`, `count`/`health`/`wait`, `message`, `target`/`pathtarget`, callbacks, warnings, allocation message et formats de temps verifies.
- Commentaires d'en-tete: `func_clock_reset`, `func_clock_format_countdown`, `func_clock_think`, `func_clock_use` et `SP_func_clock` ont un commentaire `Original name`, `Source`, `Category: Ported`, `Fidelity level`, `Behavior` et notes de portage pour l'heure locale; pas d'ajustement necessaire.
- Runtime: valide. `SpawnEntities` parse `func_clock`, `ED_CallSpawn` dispatch via `spawns[]`, `func_clock_use` active le clock START_OFF, et `G_RunFrame` execute `func_clock_think` puis met a jour `target_string`/`target_character`.
- apps/web: valide indirectement. Le navigateur doit consommer les sorties du runtime porte; aucune logique parallele `func_clock`/`target_string` n'a ete detectee dans `apps/web`. Les changements de frames des `target_character` transitent par les snapshots/refresh frames comme autres entites visibles.
- renderer-three: valide indirectement. `func_clock` ne rend rien directement, mais produit des mises a jour visibles via les brush `target_character` (`modelindex` inline et `s.frame`); ces sorties sont dans le flux refresh/renderer standard verifie par le test Three.
- Identification: lot `SP_func_timer`/`SP_func_killbox` dans matrice `game_g_spawn.c.md`, prototypes et entrees `spawns[]` originaux dans `Quake-2-master/game/g_spawn.c`, definitions originales dans `game/g_func.c`, cible portee `packages/game/src/g_func.ts` importee par `packages/game/src/g_spawn.ts`.
- Comparaison C/H vs TS: entrees `edict_t *` vs `GameEntity, GameRuntime`, sorties void, classnames `func_timer`/`func_killbox`, callbacks, `wait`/`random`/`delay`/`pausetime`, `SVF_NOCLIENT`, modele inline et delegation `KillBox` verifies.
- Commentaires d'en-tete: `func_timer_think`, `func_timer_use`, `SP_func_timer`, `use_killbox` et `SP_func_killbox` ont un commentaire `Original name`, `Source`, `Category: Ported`, `Fidelity level` et `Behavior`; pas d'ajustement necessaire.
- Runtime: valide. `SpawnEntities` parse le texte map, `ED_CallSpawn` dispatch par `spawns[]`; `G_RunFrame` execute le timer `START_ON` et relance son `nextthink`; `func_killbox` expose un callback `use` qui appelle `KillBox` avec le bridge collision.
- apps/web: valide indirectement. Le navigateur doit declencher ces entites via le runtime porte; aucune logique parallele `func_timer`/`func_killbox` n'a ete detectee dans `apps/web`. `func_timer` ne produit pas de rendu direct; `func_killbox` est volontairement `SVF_NOCLIENT`.
- renderer-three: non applicable justifie pour le rendu direct. `func_timer` ne produit aucune sortie visible; `func_killbox` est une brush cachee `SVF_NOCLIENT` utilisee pour collision/telefrag, donc aucun modele/particule/dlight/scene visible n'est attendu dans `renderer-three`.
- Identification: lot `SP_func_explosive`/`SP_func_areaportal` dans matrice `game_g_spawn.c.md`, prototypes et entrees `spawns[]` originaux dans `Quake-2-master/game/g_spawn.c`, definitions originales dans `game/g_misc.c`, cible portee `packages/game/src/g_misc.ts` importee par `packages/game/src/g_spawn.ts`.
- Comparaison C/H vs TS: entrees `edict_t *` vs `GameEntity, GameRuntime`, sorties void, classnames `func_explosive`/`func_areaportal`, flags, defaults, callbacks, modeles inline, solidite/visibilite, deathmatch, damage, debris, temp entity d'explosion, targets, areaportal style/count et collision state verifies.
- Commentaires d'en-tete: `Use_Areaportal`, `SP_func_areaportal`, `func_explosive_explode`, `func_explosive_use`, `func_explosive_spawn` et `SP_func_explosive` ont un commentaire `Original name`, `Source`, `Category: Ported`, `Fidelity level` et `Behavior`; pas d'ajustement necessaire.
- Runtime: valide. `SpawnEntities` parse le texte map, `ED_CallSpawn` dispatch par `spawns[]`, `func_explosive` produit/cache/revele des brush models inline et ses callbacks sont atteignables par use/die; `func_areaportal` est utilisable par targets/portes et applique l'etat au collision world quand present.
- apps/web: valide indirectement. Le navigateur doit consommer les sorties du runtime porte; aucune logique parallele de spawn `func_explosive`/`func_areaportal` n'a ete detectee. Les brush models, temp entities d'explosion et etats client passent par refresh frames/snapshots/full-game.
- renderer-three: valide indirectement. `func_explosive` produit des brush models inline, debris MD2 et temp entity d'explosion deja consommes par le pipeline refresh/renderer; `func_areaportal` n'est pas une entite visible directe mais influence la collision/visibilite serveur via areabits/portal state, sans besoin de rendu propre dans `renderer-three`.
- Identification: lot `SP_func_conveyor`/`SP_func_wall`/`SP_func_object` dans matrice `game_g_spawn.c.md`, prototypes et entrees `spawns[]` originaux dans `Quake-2-master/game/g_spawn.c`, definitions originales dans `game/g_func.c` et `game/g_misc.c`, cibles portees `packages/game/src/g_func.ts` et `packages/game/src/g_misc.ts` importees par `packages/game/src/g_spawn.ts`.
- Comparaison C/H vs TS: entrees `edict_t *self` vs `GameEntity, GameRuntime`, sorties void, classnames `func_conveyor`/`func_wall`/`func_object`, flags, defaults, callbacks, modeles inline, solidite, visibilite `SVF_NOCLIENT`, `KillBox`, release/touch toss, `MASK_MONSTERSOLID` et effects verifies.
- Commentaires d'en-tete: `SP_func_conveyor`, `SP_func_wall`, `func_wall_use`, `SP_func_object`, `func_object_use`, `func_object_release` et `func_object_touch` ont un commentaire `Original name`, `Source`, `Category: Ported`, `Fidelity level` et `Behavior`; pas d'ajustement necessaire.
- Runtime: valide. `SpawnEntities` parse le texte map, `ED_CallSpawn` dispatch par `spawns[]`, les trois brush entities sont liees avec `modelindex` inline; `func_wall_use`/`func_object_use` modifient solidite/visibilite et relient l'entite, `SP_func_object` planifie la release par think pour le cas simple.
- apps/web: valide indirectement. Le navigateur doit utiliser les sorties du runtime porte; aucune logique parallele de spawn brush n'a ete detectee. Les brush models et leur visibilite passent par refresh frames, snapshots et le flux full-game/local.
- renderer-three: valide indirectement. Ces entites produisent des brush models inline visibles ou masques; `apps/web` extrait les modeles `*N` et poses, puis `packages/renderer-three/src/gl-world-scene-adapter.ts` consomme les `BrushModelSnapshot` origin/angles/modelIndex pour les instances inline-brush.
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
- Identification: verification de l'entree `light` dans `spawns[]`; `SP_light` n'est pas une entite proprietaire de `game_g_spawn.c.md` car sa definition originale est dans `game/g_misc.c`.
- Comparaison C/H vs TS: entree `edict_t *self` vs `GameEntity, GameRuntime`, sortie void, branches `!targetname`/`deathmatch`, style custom `>= 32`, callback `light_use`, `START_OFF`, configstrings `CS_LIGHTS + style` et toggles `"a"`/`"m"` verifies.
- Commentaires d'en-tete: `light_use` et `SP_light` ont un commentaire `Original name`, `Source`, `Category: Ported`, `Fidelity level`, `Behavior` et note de portage pour `START_OFF`; pas d'ajustement necessaire.
- Runtime: valide. `ED_CallSpawn` dispatch `light` via `spawns[]`; `SP_light` ecrit les lightstyles dans les configstrings du runtime; `useGameEntity`/callback `light_use` propage ensuite les toggles visibles.
- apps/web: valide indirectement. Le navigateur doit consommer les lightstyles issus du runtime porte; aucune logique parallele de spawn `light` n'a ete detectee dans `apps/web`, et le flux local gameplay synchronise les configstrings vers `ClientRefreshFrame.lightStyles`.
- renderer-three: valide indirectement. `SP_light` ne produit pas de modele, particule, beam, dlight, temp entity, areabits, camera ou scene propre; sa sortie visible attendue est le lightstyle BSP, consomme par le world adapter via `frame.lightStyles`.
- Identification: lot player/intermission dans matrice `game_g_spawn.c.md`, prototypes et `spawns[]` originaux dans `Quake-2-master/game/g_spawn.c`, definitions originales dans `game/p_client.c`, cible portee `packages/game/src/p_client.ts` importee par `packages/game/src/g_spawn.ts`.
- Comparaison C/H vs TS: entrees `edict_t *self` vs `GameEntity, GameRuntime`, sorties void, branches `coop`, `deathmatch`, map `security`, liste des maps coop fixup, appels `SP_CreateCoopSpots`, `SP_FixCoopSpots`, `G_FreeEdict`, `SP_misc_teleporter_dest`, no-op intermission et preservation origin/angles verifies.
- Commentaires d'en-tete: les quatre fonctions TS ont un commentaire `Original name`, `Source`, `Category: Ported`, `Fidelity level`; pas d'ajustement necessaire.
- Runtime: valide. `SpawnEntities` parse les classnames, reserve les slots clients, appelle `ED_CallSpawn` sur la table `spawns[]`; `G_RunFrame` execute les thinks coop; `PutClientInServer`/`SelectSpawnPoint` et `BeginIntermission` consomment ensuite les classnames player/intermission.
- apps/web: valide indirectement. Le flux navigateur full-game/newgame utilise le runtime porte pour creer la session, generer les snapshots et propager `playerstate`/refresh frame; aucune logique parallele de spawn player/intermission masquante n'a ete constatee.
- renderer-three: valide indirectement. `info_player_deathmatch` peut produire le modele visible `dmspot`; les cameras player/intermission passent par `ClientRefreshFrame.view.vieworg/viewangles`, puis `apps/web` synchronise la camera Three et `renderer-three` consomme ces vues dans `refresh-entity-sync`, dlights/particles et world adapter.

## Corrections appliquees

- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour `func_clock`, sa presence dans `spawns[]`, le dispatch map `SpawnEntities`/`ED_CallSpawn`, l'activation `START_OFF`, le tick `G_RunFrame`, la mise a jour `target_string` et les frames/modelindex visibles des `target_character`.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour `func_timer` et `func_killbox`, leur presence dans `spawns[]`, le dispatch map `SpawnEntities`/`ED_CallSpawn`, `START_ON` avec `pausetime`, le think execute par `G_RunFrame`, le modele inline du killbox et la delegation `KillBox`.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour `func_areaportal` et `func_explosive`, leur presence dans `spawns[]`, le dispatch map `SpawnEntities`/`ED_CallSpawn`, le toggle areaportal, les modeles inline, trigger-spawn/reveal, ciblage non shootable, animation flags et callbacks.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour `func_conveyor`, `func_wall` et `func_object`, leur presence dans `spawns[]`, le dispatch `ED_CallSpawn`, le dispatch map `SpawnEntities`, les modeles inline visibles, callbacks, flags d'animation, transitions solid/visible et release planifiee.
- `packages/game/src/g_func.ts`: ajout du precache `misc/talk.wav` dans `SP_func_door_secret` quand une porte ciblee avec `message` installe `door_touch`, comme dans `game/g_func.c`.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour `func_door_secret`, `func_door_rotating`, `func_water` et `func_train`, leur presence dans `spawns[]`, le dispatch map `SpawnEntities`/`ED_CallSpawn`, les modeles inline, les callbacks, les sons, le rewrite de classname, le `path_corner` de train et les thinks executes par `G_RunFrame`.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour les quatre classnames brush `func_plat`, `func_rotating`, `func_button` et `func_door`, leur presence dans `spawns[]`, le dispatch map `SpawnEntities`/`ED_CallSpawn`, les modeles inline, le trigger interne de plat, les effects, callbacks et le think door execute par `G_RunFrame`.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour les quatre classnames player/intermission, le dispatch `spawns[]`, le spot deathmatch visible, les hacks coop `security`/fixup, et le flux intermission/camera.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour le flux map normal `SpawnEntities` -> `ED_CallSpawn` -> callbacks health -> `G_RunFrame`/`droptofloor`, et pour le rejet `DF_NO_HEALTH` en deathmatch sur les quatre variantes.
- `scripts/verify/quake2-g-spawn.ts`: ajout de preuves pour `SP_light`, sa presence dans `spawns[]`, le dispatch `ED_CallSpawn`, l'installation de `light_use`, les configstrings runtime `CS_LIGHTS`, le toggle `START_OFF`, le style 0 sans callback et le rejet deathmatch.

## Tests

- `npm run verify:g-spawn`: ok le 2026-05-01.
- `npm run verify:g-misc`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:full-game:three-renderer`: ok le 2026-05-01.
- `npm run verify:web-render-order`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.
- `npm run verify:g-spawn`: ok le 2026-05-01.
- `npm run verify:g-func`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:full-game:three-renderer`: ok le 2026-05-01.
- `npm run verify:web-render-order`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.
- `npm run verify:g-spawn`: ok le 2026-05-01.
- `npm run verify:g-misc`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:full-game:three-renderer`: ok le 2026-05-01.
- `npm run verify:web-render-order`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.
- `npm run verify:g-spawn`: ok le 2026-05-01.
- `npm run verify:g-func`: ok le 2026-05-01.
- `npm run verify:g-misc`: bloque le 2026-05-01 hors lot sur `teleporter_touch` (`old_origin` attendu `[100, 200, 300]`, obtenu `[100, 200, 310]`) avant les tests `func_wall`/`func_object`.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:full-game:three-renderer`: ok le 2026-05-01.
- `npm run verify:web-render-order`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.
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
- `npm run verify:g-spawn`: ok le 2026-05-02.
- `npm run verify:g-misc`: ok le 2026-05-02.
- `npm run verify:local-gameplay-sync`: ok le 2026-05-02.
- `npm run typecheck`: ok le 2026-05-02.
- `npm run verify:g-spawn`: ok le 2026-05-02 pour `SP_worldspawn`/statusbars/lightstyles.
- `npm run typecheck`: ok le 2026-05-02.
- `npm run verify:local-gameplay-sync`: ok le 2026-05-02.
- `npm run verify:full-game:three-renderer`: ok le 2026-05-02.
- `npm run verify:full-game:server-host`: ok le 2026-05-02.

## Prochain lot recommande

- Continuer avec un sous-lot explicite de `spawns` centre sur la table/ownership, sans valider les fonctions externes deja proprietaires de `g_misc.c`, `g_func.c`, `p_client.c` ou `g_items.c`; sinon passer a `ED_CallSpawn`.
