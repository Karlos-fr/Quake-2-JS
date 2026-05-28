# Progress TS - packages/renderer-three/src/gl_mesh.ts

## Etat courant

- Statut: Termine
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_renderer-three_src_gl_mesh.ts.md`
- Fichier TS: `packages/renderer-three/src/gl_mesh.ts`
- Dernier lot valide: fichier complet, helpers alias lighting/culling et `GL_DrawAliasShadow`.
- Prochain lot recommande: aucun.

## Session 2026-05-28 - gros lot alias mesh

- Lot traite: toutes les 22 entites de la matrice.
- Verdict: `R_CullAliasModel`, `GL_DrawAliasShadow` et `buildAliasShadeVector` sont couverts par `ref_gl_gl_mesh.c.md`; les helpers extraits des chemins `R_DrawAliasModel` / `GL_DrawAliasFrameLerp` sont des adapters valides; les constantes/interfaces/helpers locaux sont `Category: New`.
- Ownership: package `renderer-three`, source `ref_gl/gl_mesh.c`; aucun doublon proprietaire TS detecte. Les helpers ne masquent pas les proprietaires C/H `R_DrawAliasModel`, `GL_DrawAliasFrameLerp`, `R_CullAliasModel` ou `GL_DrawAliasShadow`.
- Integration: consomme par le constructeur MD2 et les flux alias du renderer-three; runtime/apps-web arrivent indirectement via la refdef et les entites visibles.

## Tests de reference

- `npm run verify:gl-mesh`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`
- `git diff --check`
