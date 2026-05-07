# Progress - Quake-2-master/server/sv_world.c

## Session 2026-05-07

- Lot valide: macros de lien `STRUCT_FROM_LINK`/`EDICT_FROM_AREA`, `areanode_t`, constantes `AREA_DEPTH`/`AREA_NODES`, etat `sv_numareanodes`/`area_type`, helpers de liste `ClearLink`/`RemoveLink`/`InsertLinkBefore`, `SV_CreateAreaNode`, `SV_ClearWorld`, `SV_UnlinkEdict`, `MAX_TOTAL_ENT_LEAFS`, `SV_LinkEdict`, `SV_AreaEdicts_r`, `SV_AreaEdicts`, `SV_PointContents`, plus faux positifs locaux associes marques `Non applicable`.
- Corrections: ajout des commentaires d'en-tete manquants dans `packages/server/src/sv_world.ts` pour les constantes/struct/helpers portés du lot.
- Runtime: `createServerRuntimeFacade` instancie `createServerWorldProcedures`; `SV_Init`/`SV_SpawnServer` appellent `SV_ClearWorld`; `SV_InitGameProgs` route `linkentity`, `unlinkentity`, `BoxEdicts`, `trace` et `pointcontents` vers `sv_world`; `SV_LinkEdict` alimente `areanum`/`areanum2`/clusters consommes par `sv_ents`.
- apps/web: `apps/web/src/full-game-server-host.ts` utilise la facade serveur portee; `verify:full-game:server-host` prouve la creation du serveur local, le chargement de `base1`, les brush entities/triggers lies via `SV_AreaEdicts`, et l'emission d'une frame client.
- renderer-three: pas de branchement direct attendu pour les helpers world/linking; la sortie visible attendue passe par `sv_ents` (`areabits`, entites visibles, clusters/areas) puis par le client, et `renderer-three` consomme `refdef.areabits`/entites via ses adapters.
- Tests lances: `npm run verify:server:world`, `npm run verify:server:game`, `npm run verify:full-game:server-host`, `npm run typecheck`.
- Prochain lot recommande: `moveclip_t`, implementation `SV_HullForEntity`, `SV_ClipMoveToEntities`, `SV_TraceBounds`, `SV_Trace` et leurs variables locales, avec verification collision `trace`/monster bbox/deadmonster et consommation runtime via les imports game.

## Session 2026-05-07 - trace/collision

- Lot valide: `moveclip_t`, implementation `SV_HullForEntity`, `SV_ClipMoveToEntities`, `SV_TraceBounds`, `SV_Trace`, plus champs/variables locales associes marques `Non applicable`.
- Corrections: ajout des commentaires d'en-tete manquants dans `packages/server/src/sv_world.ts` pour `moveclip_t`, `SV_ClipMoveToEntities` et `SV_TraceBounds`; extension de `scripts/verify/quake2-sv-world.ts` pour prouver les filtres `passedict`, owner/missile et `SVF_DEADMONSTER`/`CONTENTS_DEADMONSTER`.
- Runtime: `SV_Trace`, `SV_PointContents`, `SV_AreaEdicts`, `SV_LinkEdict` et `SV_UnlinkEdict` sont branches via `createServerRuntimeFacade` puis `SV_InitGameProgs` vers les imports game `trace`, `pointcontents`, `BoxEdicts`, `linkentity` et `unlinkentity`.
- apps/web: `apps/web/src/full-game-server-host.ts` consomme ces imports via le serveur full-game porte; `verify:full-game:server-host` couvre le host web sans logique collision parallele masquant `sv_world`.
- renderer-three: pas d'appel direct attendu depuis `sv_world.c`; la sortie visible attendue passe par collisions/liaisons serveur, snapshots `sv_ents` (`areabits`, entites visibles, camera/playerstate) puis par les adapters `renderer-three` qui consomment `refdef.areabits` et les refresh entities.
- Tests lances: `npm run verify:server:world`, `npm run verify:server:game`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.
- Prochain lot recommande: aucun pour `server/sv_world.c`; toutes les lignes sont maintenant `Valide` ou `Non applicable`.
