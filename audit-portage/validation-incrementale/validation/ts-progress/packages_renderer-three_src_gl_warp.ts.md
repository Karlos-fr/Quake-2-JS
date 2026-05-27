# Progress TS - packages/renderer-three/src/gl_warp.ts

- Fichier TS: `packages/renderer-three/src/gl_warp.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_renderer-three_src_gl_warp.ts.md`
- Etat courant: Termine
- Derniere session: validation complete des 35 symboles.

## Lot traite

- Lot: fichier complet `gl_warp.ts`.
- Symboles traites: 35 / 35.
- Verdict: 15 `Couvert C/H`, 20 `Valide`.
- Matrices C/H consultees: `ref_gl_gl_warp.c.md`, `ref_gl_gl_local.h.md`, `ref_gl_gl_rmain.c.md`.

## Decisions

- Les fonctions et macros proprietaires presentes dans `ref_gl_gl_warp.c.md` sont marquees `Couvert C/H`.
- Les tables `skytexorder`, `suf`, `st_to_vec`, `vec_to_st` et `skyclip` sont validees directement: elles existent dans `ref_gl/gl_warp.c`, mais le generateur C/H ne les a pas produites comme lignes proprietaires.
- `GlWarpRuntime` est un `Adapter`: il remplace les globals C de `gl_warp.c` par un etat explicite par instance renderer.
- Les setters/runtime payloads sont `Category: New` avec `Original name: N/A` et `Source declaree: N/A (<raison courte>)`.
- `setWarpTurbulenceScale` est `Adapter`: il conserve le scaling `R_Init` de `r_turbsin` sans muter la table canonique `warpsin.ts`.

## Tests de reference

- `npm run verify:gl-warp`
- `npm run verify:three-world-warp-sky`
- `npm run typecheck`
- `git diff --check`

## Prochain lot

- Aucun dans la matrice TS actuelle.
