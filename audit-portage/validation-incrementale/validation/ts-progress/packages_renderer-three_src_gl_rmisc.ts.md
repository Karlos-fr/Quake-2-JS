# Progress TS - packages/renderer-three/src/gl_rmisc.ts

## Etat courant

- Statut: Termine
- Dernier lot valide: fichier complet, 44 symboles de `GL_ALPHA_TEST` a `GL_UpdateSwapInterval`.
- Prochain lot recommande: aucun dans la matrice TS actuelle.

## Session courante

- Lot traite: validation croisee complete de `packages/renderer-three/src/gl_rmisc.ts`.
- Verdict:
  - 6 symboles `Couvert C/H` via `ref_gl_gl_rmisc.c.md`: `TargaHeader`, `R_InitParticleTexture`, `GL_ScreenShot_f`, `GL_Strings_f`, `GL_SetDefaultState`, `GL_UpdateSwapInterval`.
  - 38 symboles `Valide`: constantes OpenGL/WebGL `New`, runtime/hooks `New`, helpers extraits `Adapter`, et `DOT_TEXTURE` verifie directement depuis `ref_gl/gl_rmisc.c`.
- Decisions:
  - Les constantes GL locales sont `Category: New` avec `Original name: N/A` et `Source: N/A (OpenGL/WebGL numeric constants)`.
  - Les helpers `buildParticleTextureRgba`, `buildNoTextureRgba`, `buildTgaHeader`, `findScreenshotName` et `swapRgbToBgr` sont `Adapter`, pas proprietaires C/H distincts.
  - `DOT_TEXTURE` reste `Ported`/`Valide`: la table `dottexture` existe dans `ref_gl/gl_rmisc.c`, mais n'a pas de ligne dediee dans la matrice C/H generee.
  - Le runtime TS est l'adapter attendu pour remplacer les globals, appels GL, filesystem et console de `gl_rmisc.c`.

## Tests de reference

- `npm run verify:gl-rmisc`
- `npm run verify:ref-gl-host`
- `npm run typecheck`
- `git diff --check`
