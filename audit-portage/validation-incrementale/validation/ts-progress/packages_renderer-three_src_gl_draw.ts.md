# Progress TS - packages/renderer-three/src/gl_draw.ts

## Etat courant

- Statut: Termine
- Dernier lot valide: fichier complet `gl_draw.ts` (42 symboles).
- Couvert C/H: 9 fonctions portees via `ref_gl_gl_draw.c.md`.
- Valide: 33 symbols New/Adapter ou portage verifie directement.
- Reste a auditer: 0.

## Session du 2026-05-27

- Lot traite: tous les symboles de `GL_RENDERER_RENDITION` a `truncateQPath`.
- Decisions:
  - `Draw_InitLocal`, `Draw_Char`, `Draw_GetPicSize`, `Draw_StretchPic`, `Draw_Pic`, `Draw_TileClear`, `Draw_Fill`, `Draw_FadeScreen` et `Draw_StretchRaw` sont `Couvert C/H` par `ref_gl_gl_draw.c.md`.
  - `Draw_FindPic` est `Valide`: la source existe dans `Quake-2-master/ref_gl/gl_draw.c`, mais la matrice C/H generee ne contient pas cette ligne.
  - Les constantes `GL_RENDERER_*` restent des adapters locaux; le proprietaire C/H principal reste `gl_local.ts`.
  - Les constantes OpenGL et contrats de hooks sont `Category: New` avec `Original name: N/A` et `Source declaree: N/A (...)`.
  - Les helpers prives extraits de flux portes sont classes `Adapter` quand ils representent un fragment C/H, sinon `New`.
- Corrections appliquees:
  - En-tetes TS completes dans `packages/renderer-three/src/gl_draw.ts`.
  - Matrice TS mise a jour.
  - Avancement global TS mis a jour.

## Tests de reference

- `npm run verify:gl-draw`
- `npm run verify:three-gl-draw-adapter`
- `npm run verify:ref-gl-host`
- `npm run typecheck`
- `git diff --check`

## Prochain lot recommande

Aucun dans cette matrice.
