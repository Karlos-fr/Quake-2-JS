# Progress TS - packages/renderer-three/src/gl_local.ts

- Fichier TS: `packages/renderer-three/src/gl_local.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_renderer-three_src_gl_local.ts.md`
- Etat courant: Termine
- Derniere session: 2026-05-27

## Lot traite - 2026-05-27

- Lot: 65 symboles de `REF_VERSION` a `createEmptyPlane`.
- Verdict: 39 `Couvert C/H`, 26 `Valide`, 0 reste a auditer.
- Preuves C/H: `audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_local.h.md` et lecture directe de `Quake-2-master/ref_gl/gl_local.h`.
- Corrections: en-tetes TS completes pour les macros portees, les helpers `New`, les adapters de signatures et les factories locales.
- Decisions: les alias/signatures dont l'implementation proprietaire vit dans `gl_rmain.ts`, `gl_light.ts`, `gl_rsurf.ts`, `gl_warp.ts` ou `gl_image.ts` restent `Adapter`/`Valide`, pas `Couvert C/H`.
- Points a surveiller: doublons externes existants pour `GL_RENDERER_VOODOO`/`GL_RENDERER_VOODOO2` dans `gl_image.ts` et `GL_RENDERER_RENDITION`/`GL_RENDERER_MCD` dans `gl_draw.ts`; `gl_local.ts` reste le proprietaire header.

## Tests de reference

- `npm run verify:gl-local:header`
- `npm run verify:ref-gl-host`
- `npm run typecheck`
- `git diff --check`

## Prochain lot recommande

- Aucun pour la matrice actuelle.
