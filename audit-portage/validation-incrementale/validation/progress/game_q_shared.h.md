# Progress - Quake-2-master/game/q_shared.h

## Dernier lot traite

- 2026-05-06: glue systeme declaree par `q_shared.h` de `curtime` a `Sys_FindClose`.
- Entites validees: `curtime` via l'accesseur runtime `get_curtime`, `Sys_Milliseconds`, `Sys_Mkdir`, `Hunk_Begin`, `Hunk_Alloc`, `Hunk_Free`, `Hunk_End`, `SFF_ARCH`, `SFF_HIDDEN`, `SFF_RDONLY`, `SFF_SUBDIR`, `SFF_SYSTEM`, `Sys_FindFirst`, `Sys_FindNext`, `Sys_FindClose`.
- Ownership: `curtime` et les fonctions `Sys_*`/`Hunk_*` sont portees dans `packages/qcommon/src/system.ts` avec runtime explicite; les flags `SFF_*` appartiennent a `packages/qcommon/src/q_shared.ts`.
- 2026-05-06: utilitaires partages declares par `q_shared.h` de `COM_SkipPath` a `Info_Validate`.
- Entites validees: `COM_SkipPath`, `COM_StripExtension`, `COM_FileBase`, `COM_FilePath`, `COM_DefaultExtension`, `COM_Parse`, `Com_sprintf`, `Com_PageInMemory`, `Q_stricmp`, `Q_strcasecmp`, `Q_strncasecmp`, `BigShort`, `LittleShort`, `BigLong`, `LittleLong`, `BigFloat`, `LittleFloat`, `Swap_Init`, `va`, `MAX_INFO_KEY`, `MAX_INFO_VALUE`, `MAX_INFO_STRING`, `Info_ValueForKey`, `Info_RemoveKey`, `Info_SetValueForKey`, `Info_Validate`.
- Ownership: ces lignes sont des declarations/API de `q_shared.h`; les corps C proprietaires sont dans `game/q_shared.c`, et les commentaires TS pointent bien vers `Source: game/q_shared.c`.
- 2026-05-06: macros/fonctions math de `DotProduct` a `RotatePointAroundVector`.
- Entites validees: `DotProduct`, `VectorSubtract`, `VectorAdd`, `VectorCopy`, `VectorClear`, `VectorNegate`, `VectorSet`, `VectorMA`, `_DotProduct`, `_VectorSubtract`, `_VectorAdd`, `_VectorCopy`, `ClearBounds`, `AddPointToBounds`, `VectorCompare`, `VectorLength`, `CrossProduct`, `VectorNormalize`, `VectorNormalize2`, `VectorInverse`, `VectorScale`, `Q_log2`, `R_ConcatRotations`, `R_ConcatTransforms`, `AngleVectors`, `BoxOnPlaneSide`, `anglemod`, `LerpAngle`, `ProjectPointOnPlane`, `PerpendicularVector`, `RotatePointAroundVector`.
- Entites non applicables: `BOX_ON_PLANE_SIDE`, macro C d'optimisation inlinee par `BoxOnPlaneSide` en TS.
- 2026-05-06: lot initial de base `id386` a `Q_ftol`.
- Entites validees: `byte`, `qboolean`, `PITCH`, `YAW`, `ROLL`, `MAX_STRING_CHARS`, `MAX_STRING_TOKENS`, `MAX_TOKEN_CHARS`, `MAX_QPATH`, `MAX_OSPATH`, `MAX_CLIENTS`, `MAX_EDICTS`, `MAX_LIGHTSTYLES`, `MAX_MODELS`, `MAX_SOUNDS`, `MAX_IMAGES`, `MAX_ITEMS`, `MAX_GENERAL`, `PRINT_LOW`, `PRINT_MEDIUM`, `PRINT_HIGH`, `PRINT_CHAT`, `ERR_FATAL`, `ERR_DROP`, `ERR_DISCONNECT`, `PRINT_ALL`, `PRINT_DEVELOPER`, `PRINT_ALERT`, `multicast_t`, `vec_t`, `fixed4_t`, `fixed8_t`, `fixed16_t`, `M_PI`, `nanmask`, `IS_NAN`, `Q_ftol`.
- Entites non applicables: `id386`, `idaxp`, `NULL`.

## Corrections

- `Hunk_Alloc` dans `packages/qcommon/src/system.ts` consomme maintenant une taille alignee sur 32 octets comme les ports C `q_shwin.c`/`q_shlinux.c`, tout en retournant une vue de la taille demandee.
- Ajout de `SFF_ARCH`, `SFF_HIDDEN`, `SFF_RDONLY`, `SFF_SUBDIR` et `SFF_SYSTEM` dans `packages/qcommon/src/q_shared.ts`.
- Couvertures ajoutees dans `scripts/verify/quake2-q-shared-header.ts` pour les `SFF_*`, l'alignement hunk, les erreurs pre-begin/overflow et l'accesseur `curtime`.
- `Info_SetValueForKey` dans `packages/qcommon/src/common.ts` accepte maintenant les points-virgules dans les valeurs, comme le C; seuls les points-virgules de cle restent rejetes.
- Couvertures ajoutees dans `scripts/verify/quake2-q-shared-header.ts` pour `MAX_INFO_*` et les cas limites de `Info_SetValueForKey`.
- Ajout de `VectorNegate` et `VectorSet` dans `packages/math/src/q_shared.ts`, avec reexport depuis `packages/qcommon/src/index.ts`.
- Ajout de couvertures dans `scripts/verify/quake2-q-shared-header.ts` pour les macros vectorielles, `Q_log2` et les chemins axial/signbits de `BoxOnPlaneSide`.
- Ajout de `ERR_FATAL`, `ERR_DROP`, `ERR_DISCONNECT`, `nanmask`, `IS_NAN` et `Q_ftol` dans `packages/qcommon/src/q_shared.ts`.
- Ajout de couvertures dans `scripts/verify/quake2-q-shared-header.ts`.

## Tests de reference

- `npm run verify:q-shared:header` OK.
- `npm run typecheck` OK.
- `npm run verify:files` OK.
- `npm run verify:full-game:three-renderer` OK.
- `npm run verify:q-shared:header` OK.
- `npm run typecheck` OK.
- `npm run verify:cvar` OK.
- `npm run verify:full-game:server-host` OK.
- `npm run verify:full-game:three-renderer` OK.
- Controle central: `npm run verify:q-shared:header`, `npm run typecheck` et `npm run verify:full-game:three-renderer` OK apres consolidation.

## Decisions runtime/web/renderer-three

- Le bloc `curtime`/`Sys_Milliseconds` est expose via `packages/qcommon/src/index.ts`; le port TS remplace le global C par `SystemRuntime.curtime` et `get_curtime`, ce qui rend l'etat atteignable par les runtimes qui injectent les hooks systeme.
- `Sys_Mkdir` et `Sys_Find*` sont des points de delegation host: le runtime attendu est un hook injectable, et `verify:files` confirme le flux fichier sans logique parallele `apps/web` masquante.
- Les `SFF_*` sont des flags d'attributs de recherche de fichiers, maintenant exportes depuis `q_shared.ts`; ils ne produisent pas de sortie visible directe.
- Le bloc `Hunk_*` sert de memoire lineaire pour les chargements de donnees de modele/BSP dans le moteur C; le port TS utilise des `Uint8Array` et preserve l'allocation sequentielle avec alignement 32 octets.
- `apps/web`: aucune integration directe supplementaire requise pour ces helpers bas niveau; ils sont consommes via les flux runtime/files/adapters existants, verifies par `verify:files` et le full-game renderer.
- `renderer-three`: aucune sortie visible nouvelle a brancher directement pour `curtime`, `Sys_Mkdir`, `SFF_*` ou `Sys_Find*`; `Hunk_*` peut soutenir des donnees visibles de modele/BSP via les loaders, et `verify:full-game:three-renderer` reste OK apres correction d'alignement.
- Le bloc `COM_*`, endian, compare ASCII et info strings est expose par `packages/qcommon/src/index.ts`; les fonctions avec corps C restent documentees comme portees depuis `game/q_shared.c`.
- Runtime: `COM_Parse` est atteint par le spawn d'entites, `Info_*` par userinfo/client connect/server/game, `MAX_INFO_STRING` par les flux serveur, `Com_PageInMemory` par le son client, et `Com_sprintf` par les loaders/adapters.
- `apps/web`: integration via les runtimes full-game/server-host qui declenchent userinfo, spawn parsing et chargements d'assets sans logique parallele masquante.
- `renderer-three`: pas de sortie visible directe pour `Info_*`/endian/compare; `Com_sprintf` est consomme dans le chargement visible des BSP/WAL par `gl-model-loader`, verifie via `verify:full-game:three-renderer`.
- Le bloc math est integre via l'entrypoint `packages/qcommon/src/index.ts` et utilise par PMove, collision, client/server/game, refresh client et renderer.
- `apps/web` consomme ce bloc via le runtime full-game et des adapters de vue/input (`AngleVectors`), sans logique parallele qui masque un manque runtime.
- `renderer-three` consomme directement les sorties math attendues pour camera/frustum, models/frames, surfaces, beams, dlights, world lighting et particules. `RotatePointAroundVector`, `PerpendicularVector`, `BoxOnPlaneSide`, `DotProduct`, `VectorMA` et familles vectorielles sont branches dans les chemins visibles.
- Les constantes et types de base sont consommes par les flux runtime client/server/game, `apps/web` et `renderer-three` via `packages/qcommon/src/q_shared.ts` ou l'entrypoint `packages/qcommon/src/index.ts` quand leur domaine l'exige.
- `id386`, `idaxp` et `NULL` ne demandent pas de port runtime TS: les deux premiers selectionnent du code assembleur C, le dernier est remplace par `null`.
- Aucune sortie visible renderer-three nouvelle n'est produite par ce lot: pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene a brancher.

## Prochain lot recommande

- Reprendre `Sys_Error`, `Com_Printf`, puis `CVAR`/`CVAR_*` et `cvar_s` si le lot reste coherent.
