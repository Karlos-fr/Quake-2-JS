# Progress TS - packages/renderer-three/src/warpsin.ts

- Fichier TS: `packages/renderer-three/src/warpsin.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_renderer-three_src_warpsin.ts.md`
- Statut: Termine

## Dernier lot traite

- 2026-05-28: `r_turbsin`.
- Decision: `Couvert C/H`; `ref_gl_warpsin.h.md` marque la table `r_turbsin` `Valide` avec cible proprietaire `packages/renderer-three/src/warpsin.ts`.
- Correction: en-tete TS complete avec `Source: ref_gl/warpsin.h`.
- Ownership: `packages/renderer-three` correspond au module `ref_gl`; aucun doublon proprietaire trouve.

## Integration runtime/apps-web/renderer-three

- Runtime: non applicable directement; table renderer pure.
- apps-web: consomme indirectement via le renderer Three charge par le flux web.
- renderer-three: integre via `gl_warp.ts`, qui importe `r_turbsin` pour la turbulence eau/warp.

## Tests de reference

- `npm run verify:gl-warp`
- `npm run typecheck`

## Tests lances

- `npm run verify:gl-warp`: OK.
- `npm run typecheck`: OK.

## Prochain lot recommande

- Aucun pour la matrice TS actuelle.
