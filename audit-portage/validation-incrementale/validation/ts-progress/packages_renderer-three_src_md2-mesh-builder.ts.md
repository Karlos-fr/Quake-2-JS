# Progress TS - packages/renderer-three/src/md2-mesh-builder.ts

## Etat courant

- Statut: Termine
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_renderer-three_src_md2-mesh-builder.ts.md`
- Fichier TS: `packages/renderer-three/src/md2-mesh-builder.ts`
- Dernier lot valide: fichier complet, adapters MD2/Three.js et interpolation alias.
- Prochain lot recommande: aucun.

## Session 2026-05-28 - gros lot MD2 mesh builder

- Lot traite: toutes les 15 entites de la matrice.
- Verdict: les interfaces/loaders/builders/helpers Three.js sont `Valide` comme `Category: New`; `applyMd2AliasFrameLerp` est `Valide` comme adapter local de `GL_LerpVerts` / `GL_DrawAliasFrameLerp` deja valides dans `ref_gl_gl_mesh.c.md`.
- Ownership: package `renderer-three`; ce fichier est l'adapter Three.js, pas le proprietaire C/H de `gl_mesh.c`. Aucun doublon proprietaire masque par les helpers.
- Integration: consomme par le chargement de modeles MD2 et le rendu alias; runtime/apps-web alimentent indirectement les entites visibles via la refdef.

## Tests de reference

- `npm run verify:gl-mesh`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`
- `git diff --check`
