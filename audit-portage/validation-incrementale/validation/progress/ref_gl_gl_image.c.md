# Progress - Quake-2-master/ref_gl/gl_image.c

## Session 2026-05-06

- Lot traite: premier gros lot haut de fichier, jusqu'a `Scrap_Upload`: globals runtime image/scrap, tables de modes texture, constantes scrap et fonctions `GL_SetTexturePalette`, `GL_EnableMultitexture`, `GL_SelectTexture`, `GL_TexEnv`, `GL_Bind`, `GL_MBind`, `GL_TextureMode`, `GL_TextureAlphaMode`, `GL_TextureSolidMode`, `GL_ImageList_f`, `Scrap_AllocBlock`, `Scrap_Upload`.
- Checklist appliquee: comparaison C `ref_gl/gl_image.c` vs TS `packages/renderer-three/src/gl_image.ts`; ownership confirme dans `renderer-three`; doublons non trouves pour les entites du lot; en-tetes de fonctions portees enrichis; branchement runtime verifie via `ref-gl-host`; `apps/web` verifie via `createGlImageRuntime` dans `apps/web/src/main.ts` et `apps/web/src/full-game.ts`; `renderer-three` verifie via hooks `three-gl-draw-adapter` pour palette, uploads texture et scrap.
- Decisions: `base_textureid` marque `Non applicable` car le C ne le lit pas dans le flux runtime et le port assigne les texnums avec l'expression source `TEXNUM_IMAGES + index`.
- Corrections: `packages/renderer-three/src/gl_image.ts` en-tetes de validation enrichis; `scripts/verify/quake2-gl-image.ts` corrige l'import `gl_image.js`.
- Tests lances: `npm run verify:gl-image` OK; `npm run typecheck` OK.
- Etat matrice apres session: 86 entrees, 37 `Valide`, 1 `Non applicable`, 48 `A verifier`.

## Prochain lot recommande

Continuer avec les loaders image `LoadPCX` et `LoadTGA`, puis `R_FloodFillSkin` si le lot reste coherent. Verifier explicitement les parseurs `packages/formats`, les chemins `loadFile` web, et la consommation renderer des pixels charges.
