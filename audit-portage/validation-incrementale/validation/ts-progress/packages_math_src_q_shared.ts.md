# Progress TS - packages/math/src/q_shared.ts

- Fichier TS: `packages/math/src/q_shared.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_math_src_q_shared.ts.md`
- Statut: Termine

## Dernier lot traite

- `VectorCompare`, `VectorNormalize2`, `VectorInverse`, `Q_log2`, `R_ConcatRotations`, `R_ConcatTransforms`, `anglemod`, `ProjectPointOnPlane`, `PerpendicularVector`, `RotatePointAroundVector`, `BoxOnPlaneSide` et `BoxOnPlaneSide2`: matrice C/H `game_q_shared.c.md` consultee; lignes C/H deja `Valide`, cible proprietaire `packages/math/src/q_shared.ts`. Entetes TS complets et conformes au symbole, a l'export, au nom original, a la source definissante et a `Category: Ported`. Statut TS passe a `Couvert C/H`; ownership `packages/math` accepte comme depot partage MATHLIB reutilise par qcommon/game/server/renderer, sans doublon proprietaire trouve.
- `PlaneLike` et `createMatrix3x3`: classes `Category: New`, avec `Original name: N/A` et `Source declaree: N/A (...)` dans les entetes et la matrice. `PlaneLike` est l'interface structurale locale pour eviter un cycle de package avec `cplane_t`; `createMatrix3x3` est un helper local non exporte de matrices de rotation.
- `VectorAdd`, `VectorSubtract`, `VectorScale`, `Q_fabs`, `VectorMA`, `DotProduct`, `CrossProduct`, `VectorLength`, `VectorNormalize`, `_DotProduct`, `_VectorSubtract`, `_VectorAdd`, `_VectorCopy`, `ClearBounds` et `AddPointToBounds`: matrices C/H `game_q_shared.h.md` et `game_q_shared.c.md` consultees; lignes C/H deja `Valide`, cible proprietaire `packages/math/src/q_shared.ts`. Entetes TS complets et conformes au symbole, a l'export, au nom original, a la source declaree et a `Category: Ported`. Statut TS passe a `Couvert C/H` avec ownership math justifie par le partage MATHLIB.
- Doublon potentiel `VectorScale`: aucun second portage proprietaire trouve dans les entetes TS; `scaleVec3` locaux vus ailleurs restent classes `New`/wrappers locaux et ne masquent pas le portage proprietaire.

## Tests de reference

- `npm run verify:q-shared:header`
- `npm run typecheck`
- `git diff --check`

## Tests lances

- `npm run verify:q-shared:header` : OK.
- `npm run typecheck` : OK.
- `git diff --check` : OK, avec seulement les avertissements CRLF deja presents.

## Prochain lot recommande

Aucun pour la matrice TS actuelle.

## Blocages

- Aucun blocage pour le lot traite.
