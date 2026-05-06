# Progress - Quake-2-master/ref_gl/gl_image.c

## Session 2026-05-06

- Lot traite: premier gros lot haut de fichier, jusqu'a `Scrap_Upload`: globals runtime image/scrap, tables de modes texture, constantes scrap et fonctions `GL_SetTexturePalette`, `GL_EnableMultitexture`, `GL_SelectTexture`, `GL_TexEnv`, `GL_Bind`, `GL_MBind`, `GL_TextureMode`, `GL_TextureAlphaMode`, `GL_TextureSolidMode`, `GL_ImageList_f`, `Scrap_AllocBlock`, `Scrap_Upload`.
- Checklist appliquee: comparaison C `ref_gl/gl_image.c` vs TS `packages/renderer-three/src/gl_image.ts`; ownership confirme dans `renderer-three`; doublons non trouves pour les entites du lot; en-tetes de fonctions portees enrichis; branchement runtime verifie via `ref-gl-host`; `apps/web` verifie via `createGlImageRuntime` dans `apps/web/src/main.ts` et `apps/web/src/full-game.ts`; `renderer-three` verifie via hooks `three-gl-draw-adapter` pour palette, uploads texture et scrap.
- Decisions: `base_textureid` marque `Non applicable` car le C ne le lit pas dans le flux runtime et le port assigne les texnums avec l'expression source `TEXNUM_IMAGES + index`.
- Corrections: `packages/renderer-three/src/gl_image.ts` en-tetes de validation enrichis; `scripts/verify/quake2-gl-image.ts` corrige l'import `gl_image.js`.
- Tests lances: `npm run verify:gl-image` OK; `npm run typecheck` OK.
- Etat matrice apres session: 86 entrees, 37 `Valide`, 1 `Non applicable`, 48 `A verifier`.

## Session 2026-05-06 - suite

- Lot traite: loaders `LoadPCX` et `LoadTGA`, `R_FloodFillSkin`, constantes/macros flood fill, conversion/upload image (`GL_ResampleTexture`, `GL_LightScaleTexture`, `GL_MipMap`, `GL_BuildPalettedTexture`, `GL_Upload32`, `GL_Upload8`), gestion image (`GL_FreeUnusedImages`, `Draw_GetPalette`, `GL_InitImages`, `GL_ShutdownImages`) et faux positifs locaux adjacents.
- Checklist appliquee: comparaison C `ref_gl/gl_image.c` vs TS `packages/renderer-three/src/gl_image.ts` et parseurs `packages/formats/src/pcx.ts` / `packages/formats/src/tga.ts`; ownership confirme dans `renderer-three` avec parsing PCX/TGA partage dans `packages/formats`; doublons non trouves; en-tetes de fonctions portees enrichis; branchement runtime verifie via `ref-gl-host`, `gl_rmisc`, `gl_draw`, `gl_warp`, `gl-model-loader`; `apps/web` verifie via `createGlImageRuntime` et `loadFile` dans `apps/web/src/main.ts` et `apps/web/src/full-game.ts`; `renderer-three` consomme les pixels via `three-gl-draw-adapter`, uploads texture, scrap, skins, sky, WAL/PCX/TGA.
- Decisions: les lignes generees depuis variables locales, labels ou champs deja couverts par `TargaHeader` sont marquees `Non applicable`; `_TargaHeader` est valide via `packages/formats/src/tga.ts`.
- Corrections: en-tetes du bloc image enrichis dans `packages/renderer-three/src/gl_image.ts`; preuves ciblees ajoutees dans `scripts/verify/quake2-gl-image.ts` pour PCX, TGA 24 bits, TGA RLE, upload paletted sky et erreur de chargement PCX.
- Tests lances: `npm run verify:gl-image` OK; `npm run verify:three-gl-draw-adapter` OK; `npm run verify:ref-gl-host` OK; `npm run verify:gl-rmisc` OK; `npm run verify:gl-draw` OK; `npm run verify:gl-warp` OK; `npm run verify:gl-model:phase9` OK; `npm run verify:full-game:three-renderer` OK; `npm run typecheck` OK.
- Etat matrice apres session: 86 entrees, 55 `Valide`, 31 `Non applicable`, aucun reliquat `A verifier`.

## Prochain lot recommande

Aucun lot restant dans `ref_gl/gl_image.c.md`: toutes les lignes sont `Valide` ou `Non applicable`.
