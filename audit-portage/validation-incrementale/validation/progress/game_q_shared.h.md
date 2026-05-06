# Progress - Quake-2-master/game/q_shared.h

## Dernier lot traite

- 2026-05-06: macros/fonctions math de `DotProduct` a `RotatePointAroundVector`.
- Entites validees: `DotProduct`, `VectorSubtract`, `VectorAdd`, `VectorCopy`, `VectorClear`, `VectorNegate`, `VectorSet`, `VectorMA`, `_DotProduct`, `_VectorSubtract`, `_VectorAdd`, `_VectorCopy`, `ClearBounds`, `AddPointToBounds`, `VectorCompare`, `VectorLength`, `CrossProduct`, `VectorNormalize`, `VectorNormalize2`, `VectorInverse`, `VectorScale`, `Q_log2`, `R_ConcatRotations`, `R_ConcatTransforms`, `AngleVectors`, `BoxOnPlaneSide`, `anglemod`, `LerpAngle`, `ProjectPointOnPlane`, `PerpendicularVector`, `RotatePointAroundVector`.
- Entites non applicables: `BOX_ON_PLANE_SIDE`, macro C d'optimisation inlinee par `BoxOnPlaneSide` en TS.
- 2026-05-06: lot initial de base `id386` a `Q_ftol`.
- Entites validees: `byte`, `qboolean`, `PITCH`, `YAW`, `ROLL`, `MAX_STRING_CHARS`, `MAX_STRING_TOKENS`, `MAX_TOKEN_CHARS`, `MAX_QPATH`, `MAX_OSPATH`, `MAX_CLIENTS`, `MAX_EDICTS`, `MAX_LIGHTSTYLES`, `MAX_MODELS`, `MAX_SOUNDS`, `MAX_IMAGES`, `MAX_ITEMS`, `MAX_GENERAL`, `PRINT_LOW`, `PRINT_MEDIUM`, `PRINT_HIGH`, `PRINT_CHAT`, `ERR_FATAL`, `ERR_DROP`, `ERR_DISCONNECT`, `PRINT_ALL`, `PRINT_DEVELOPER`, `PRINT_ALERT`, `multicast_t`, `vec_t`, `fixed4_t`, `fixed8_t`, `fixed16_t`, `M_PI`, `nanmask`, `IS_NAN`, `Q_ftol`.
- Entites non applicables: `id386`, `idaxp`, `NULL`.

## Corrections

- Ajout de `VectorNegate` et `VectorSet` dans `packages/math/src/q_shared.ts`, avec reexport depuis `packages/qcommon/src/index.ts`.
- Ajout de couvertures dans `scripts/verify/quake2-q-shared-header.ts` pour les macros vectorielles, `Q_log2` et les chemins axial/signbits de `BoxOnPlaneSide`.
- Ajout de `ERR_FATAL`, `ERR_DROP`, `ERR_DISCONNECT`, `nanmask`, `IS_NAN` et `Q_ftol` dans `packages/qcommon/src/q_shared.ts`.
- Ajout de couvertures dans `scripts/verify/quake2-q-shared-header.ts`.

## Tests de reference

- `npm run verify:q-shared:header` OK.
- `npm run typecheck` OK.
- `npm run verify:full-game:three-renderer` OK.
- Controle central: `npm run verify:q-shared:header`, `npm run typecheck` et `npm run verify:full-game:three-renderer` OK apres consolidation.

## Decisions runtime/web/renderer-three

- Le bloc math est integre via l'entrypoint `packages/qcommon/src/index.ts` et utilise par PMove, collision, client/server/game, refresh client et renderer.
- `apps/web` consomme ce bloc via le runtime full-game et des adapters de vue/input (`AngleVectors`), sans logique parallele qui masque un manque runtime.
- `renderer-three` consomme directement les sorties math attendues pour camera/frustum, models/frames, surfaces, beams, dlights, world lighting et particules. `RotatePointAroundVector`, `PerpendicularVector`, `BoxOnPlaneSide`, `DotProduct`, `VectorMA` et familles vectorielles sont branches dans les chemins visibles.
- Les constantes et types de base sont consommes par les flux runtime client/server/game, `apps/web` et `renderer-three` via `packages/qcommon/src/q_shared.ts` ou l'entrypoint `packages/qcommon/src/index.ts` quand leur domaine l'exige.
- `id386`, `idaxp` et `NULL` ne demandent pas de port runtime TS: les deux premiers selectionnent du code assembleur C, le dernier est remplace par `null`.
- Aucune sortie visible renderer-three nouvelle n'est produite par ce lot: pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene a brancher.

## Prochain lot recommande

- Reprendre `COM_SkipPath` a `COM_DefaultExtension`, puis `COM_Parse`/`Com_sprintf` si le lot reste coherent.
