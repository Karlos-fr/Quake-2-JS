# Progress TS - packages/renderer-three/src/gl_image.ts

## Etat courant

- Statut: Termine
- Symboles: 97
- Couvert C/H: 39
- Reste a auditer: 0
- Dernier lot traite: `R_FloodFillSkin` -> `failSysError`
- Prochain lot recommande: aucun.

## Session 2026-05-27 - fin image upload et helpers locaux

Lot traite: 29 symboles, de `R_FloodFillSkin` a `GL_Upload8`, puis les fonctions image restantes et les helpers locaux de fin de fichier.

Verdict:
- 11 symboles `Couvert C/H` via `ref_gl_gl_image.c.md`: `R_FloodFillSkin`, `GL_ResampleTexture`, `GL_LightScaleTexture`, `GL_MipMap`, `GL_BuildPalettedTexture`, `GL_Upload32`, `GL_Upload8`, `GL_FreeUnusedImages`, `Draw_GetPalette`, `GL_InitImages`, `GL_ShutdownImages`.
- 4 symboles `Valide` par comparaison directe avec `Quake-2-master/ref_gl/gl_image.c`, car les definitions existent dans la source mais ne sont pas listees comme entites finales dans la matrice C/H: `GL_LoadPic`, `GL_LoadWal`, `GL_FindImage`, `R_RegisterSkin`.
- 14 helpers locaux `Category: New` passes `Valide`, avec `Original name: N/A` et `Source declaree: N/A (<raison courte>)`.
- Reste a auditer: 0.

Corrections:
- Ajout des en-tetes/metadonnees manquants dans `packages/renderer-three/src/gl_image.ts` pour les helpers locaux `allocateImageSlot` -> `failSysError`.
- Mise a jour de la matrice TS `packages_renderer-three_src_gl_image.ts.md`.
- Mise a jour de l'avancement global TS.

Preuves C/H:
- `ref_gl_gl_image.c.md` valide le bloc flood fill, resample, gamma/intensity, mipmap, palette et upload.
- `Quake-2-master/ref_gl/gl_image.c` contient aussi les definitions `GL_LoadPic`, `GL_LoadWal`, `GL_FindImage` et `R_RegisterSkin`; celles-ci ont ete comparees directement faute de lignes C/H finales correspondantes.

Tests de reference:
- `npm run verify:gl-image`
- `npm run verify:gl-local:header`
- `npm run typecheck`
- `git diff --check`

## Session 2026-05-27 - gros lot texture/image initial

Lot traite: 68 symboles, des constantes texture `TEXNUM_*` jusqu'aux loaders `LoadPCX` / `LoadTGA`.

Verdict:
- 28 symboles `Couvert C/H` via `ref_gl_gl_image.c.md` ou `ref_gl_gl_local.h.md`.
- 38 symboles `Category: New` passes `Valide`, avec `Original name: N/A` et `Source declaree: N/A (<raison courte>)`.
- 2 types de ligne de table classes `Adapter` / `Valide`.
- Le doublon potentiel `LoadTGA` est tranche: un seul symbole TS proprietaire declare ce portage source dans les matrices TS.

Corrections:
- Ajout des en-tetes/metadonnees manquants dans `packages/renderer-three/src/gl_image.ts` pour constantes, interfaces runtime/upload, tables de modes et helpers de configuration locaux.
- Mise a jour de la matrice TS `packages_renderer-three_src_gl_image.ts.md`.
- Mise a jour de l'avancement global TS.

Preuves C/H:
- `ref_gl_gl_image.c.md` valide les fonctions image initiales, tables `modes` / `gl_alpha_modes` / `gl_solid_modes`, `MAX_SCRAPS`, `BLOCK_WIDTH` et `BLOCK_HEIGHT`.
- `ref_gl_gl_local.h.md` valide `TEXNUM_*`, `MAX_GLTEXTURES`, `imagetype_t`, `image_s` / `image_t`, `GL_RENDERER_VOODOO` et `GL_RENDERER_VOODOO2`.

Tests de reference:
- `npm run verify:gl-image`
- `npm run typecheck`
- `git diff --check`
