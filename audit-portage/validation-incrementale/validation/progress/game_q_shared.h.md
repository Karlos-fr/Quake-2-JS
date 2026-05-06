# Progress - Quake-2-master/game/q_shared.h

## Dernier lot traite

- 2026-05-06: lot initial de base `id386` a `Q_ftol`.
- Entites validees: `byte`, `qboolean`, `PITCH`, `YAW`, `ROLL`, `MAX_STRING_CHARS`, `MAX_STRING_TOKENS`, `MAX_TOKEN_CHARS`, `MAX_QPATH`, `MAX_OSPATH`, `MAX_CLIENTS`, `MAX_EDICTS`, `MAX_LIGHTSTYLES`, `MAX_MODELS`, `MAX_SOUNDS`, `MAX_IMAGES`, `MAX_ITEMS`, `MAX_GENERAL`, `PRINT_LOW`, `PRINT_MEDIUM`, `PRINT_HIGH`, `PRINT_CHAT`, `ERR_FATAL`, `ERR_DROP`, `ERR_DISCONNECT`, `PRINT_ALL`, `PRINT_DEVELOPER`, `PRINT_ALERT`, `multicast_t`, `vec_t`, `fixed4_t`, `fixed8_t`, `fixed16_t`, `M_PI`, `nanmask`, `IS_NAN`, `Q_ftol`.
- Entites non applicables: `id386`, `idaxp`, `NULL`.

## Corrections

- Ajout de `ERR_FATAL`, `ERR_DROP`, `ERR_DISCONNECT`, `nanmask`, `IS_NAN` et `Q_ftol` dans `packages/qcommon/src/q_shared.ts`.
- Ajout de couvertures dans `scripts/verify/quake2-q-shared-header.ts`.

## Tests de reference

- `npm run verify:q-shared:header` OK.
- `npm run typecheck` a d'abord echoue pendant les runs concurrents sur `packages/qcommon/src/cmd.ts(611,5)`, puis repasse OK au controle central apres consolidation.

## Decisions runtime/web/renderer-three

- Les constantes et types de base sont consommes par les flux runtime client/server/game, `apps/web` et `renderer-three` via `packages/qcommon/src/q_shared.ts` ou l'entrypoint `packages/qcommon/src/index.ts` quand leur domaine l'exige.
- `id386`, `idaxp` et `NULL` ne demandent pas de port runtime TS: les deux premiers selectionnent du code assembleur C, le dernier est remplace par `null`.
- Aucune sortie visible renderer-three nouvelle n'est produite par ce lot: pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene a brancher.

## Prochain lot recommande

- Reprendre les macros/fonctions math de `DotProduct` a `RotatePointAroundVector`, en verifiant le split `packages/math/src/q_shared.ts` et les usages runtime/client/server/renderer.
