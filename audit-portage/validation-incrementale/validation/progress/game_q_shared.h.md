# Progress - Quake-2-master/game/q_shared.h

## Dernier lot traite

- 2026-05-06: `CVAR`, `CVAR_ARCHIVE`, `CVAR_USERINFO`, `CVAR_SERVERINFO`, `CVAR_NOSET`, `CVAR_LATCH` et `cvar_s`, sans modifier `packages/qcommon/src/cvar.ts` parce que `qcommon/cvar.c` est traite en parallele.
- Entites validees: `CVAR_ARCHIVE`, `CVAR_USERINFO`, `CVAR_SERVERINFO`, `CVAR_NOSET`, `CVAR_LATCH`, `cvar_s`.
- Entite non applicable: `CVAR`, garde de declaration C sans symbole runtime TS separe.
- Ownership: les flags et le type `cvar_t` sont centralises dans `packages/qcommon/src/cvar.ts`, puis reexportes depuis `packages/qcommon/src/index.ts`; la matrice a ete corrigee pour pointer `cvar_s` vers `cvar.ts`/`cvar_t`.
- Preuves: valeurs numeriques verifiees dans `scripts/verify/quake2-q-shared-header.ts`, comportement et forme runtime de `cvar_t` verifies via `scripts/verify/quake2-cvar.ts`; `cvar_vars` remplace le chainage `next` C.
- 2026-05-06: `Com_Printf` uniquement, en evitant `cvar.ts` possede par un autre agent.
- Entite validee: `Com_Printf`.
- Ownership: declaration dans `game/q_shared.h` pour liaison des helpers partages/systeme; corps proprietaire dans `qcommon/common.c`, port runtime dans `packages/qcommon/src/common.ts`.
- Commentaire d'en-tete de `Com_Printf` corrige de `Category: New` vers `Original name: Com_Printf`, `Source: qcommon/common.c`, `Category: Ported`, avec notes sur l'adaptation sink/runtime TS.
- Preuves ajoutees pour formatage variadique, sink host, redirection, flush sur seuil `rd_buffersize - 1` et flush final.
- 2026-05-06: `Sys_Error` uniquement, en evitant `common.ts` et `cvar.ts` possedes par d'autres agents.
- Entite validee: `Sys_Error`.
- Ownership: declaration dans `game/q_shared.h`, port runtime proprietaire dans `packages/qcommon/src/system.ts`; les implementations C formatent `char *error, ...` par `vsprintf` avant erreur fatale.
- Commentaire d'en-tete de `Sys_Error` mis a jour pour documenter le formatage variadique et le hook fatal TS.
- `Com_Printf`/`CVAR*`/`cvar_s` restent le prochain lot parce que `packages/qcommon/src/common.ts` et `packages/qcommon/src/cvar.ts` sont traites en parallele.
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

- `Com_Printf` dans `packages/qcommon/src/common.ts` est maintenant documente comme port de `qcommon/common.c` declare par `game/q_shared.h`, accepte les arguments variadiques via `va`, conserve le chemin redirect et delegue l'affichage normal au sink host.
- Couvertures ajoutees dans `scripts/verify/quake2-q-shared-header.ts` pour `Com_Printf` sink/format et redirection/flush.
- `Sys_Error` dans `packages/qcommon/src/system.ts` accepte maintenant les arguments variadiques `%s`, `%d`, `%i` et `%f` avant de deleguer au hook fatal, comme les implementations C passent par `vsprintf`.
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

- `npm run verify:q-shared:header` OK pour `CVAR_*`.
- `npm run verify:cvar` OK pour le runtime `cvar_t`.
- `npm run verify:full-game:server-host` OK pour l'integration web/server-host.
- `npm run verify:full-game:three-renderer` OK pour l'integration renderer-three via `refimport_t.Cvar_Get`.
- `npm run verify:q-shared:header` OK.
- `npm run typecheck` OK.
- `npm run verify:full-game:server-host` OK.
- `npm run verify:full-game:three-renderer` OK.
- `npm run verify:ref-gl-host` OK.
- `npm run verify:q-shared:header` OK.
- `npm run typecheck` OK.
- `npm run verify:full-game:server-host` OK.
- `npm run verify:full-game:three-renderer` OK.
- `npm run verify:ref-gl-host` OK.
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

- Le bloc `CVAR_*`/`cvar_s` est expose par `packages/qcommon/src/index.ts` et consomme par le runtime qcommon, game, client, server, `apps/web` et `renderer-three`.
- Runtime: integre via `createCvarRuntime`, `Cvar_Init`, `Cvar_Command`, `Cvar_Get`, `Cvar_Set*`, `Cvar_Variable*` et les adapters `gi.cvar`/`refimport_t.Cvar_Get`; les flags controlent archive, userinfo, serverinfo, protection et latch comme dans le C.
- `apps/web`: integration attendue et presente dans les flux full-game/server-host/local-client/config, qui creent et lisent les cvars par le runtime porte sans logique parallele masquante.
- `renderer-three`: integration attendue et presente pour les cvars visibles de rendu (`r_*`, `gl_*`, `vid_*`, `hand`) via `refimport_t.Cvar_Get` et `cvar_t`; ces cvars influencent scene/camera/particules/lumiere/config, mais le lot ne produit pas lui-meme de donnees visibles nouvelles.
- `Com_Printf` est un point de sortie console commun declare par `q_shared.h` et implemente dans `qcommon/common.c`; le port TS l'expose via `packages/qcommon/src/index.ts` et conserve le redirect buffer dans `CommonRuntime`.
- Runtime: integre pour les flux qui utilisent le runtime common ou ses adapters; le chemin normal delegue a un sink host parce que `Con_Print`, `Sys_ConsoleOutput` et le logfile C sont des effets host/UI distincts dans le port TS.
- `apps/web`: integration attendue via les sinks `onPrint` des flux full-game/server-host/local-transport; `verify:full-game:server-host` confirme que le flux web-host ne masque pas ce lot.
- `renderer-three`: aucune sortie visible de scene n'est produite par `Com_Printf`; les messages renderer passent par `refimport_t.Con_Printf`/`ref-gl-host` et sont verifies par `verify:ref-gl-host` et `verify:full-game:three-renderer`.
- `Sys_Error` est un point de delegation fatal declare par `q_shared.h` pour permettre aux helpers partages et systeme de lier; le port TS l'expose via `packages/qcommon/src/index.ts` et un `SystemRuntime` explicite.
- Runtime: integre comme hook fatal injectable; le message variadique est maintenant formate avant delegation, et le fallback lance une exception JS.
- `apps/web`: pas de branchement direct supplementaire attendu pour `packages/qcommon/src/system.ts`; les flux web/full-game deleguent deja les erreurs fatales host/ref via exceptions et ne masquent pas un manque de gameplay ou de rendu.
- `renderer-three`: `Sys_Error` ne produit pas de sortie visible (modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene). Les erreurs renderer passent par le `refimport_t.Sys_Error` adapte dans `ref-gl-host`, verifie par `verify:ref-gl-host` et `verify:full-game:three-renderer`.
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

- Reprendre les lignes generees des champs de `cvar_s` (`name`, `string`, `latched_string`, `flags`, `modified`, `value`) ou les marquer comme champs couverts par `cvar_t`, puis enchainer sur le bloc `CONTENTS_*` si le coordinateur prefere avancer dans `q_shared.ts`.
